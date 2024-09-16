from celery import shared_task
import os
import tempfile
import uuid
from home.tasks import trim_video_task



@shared_task(time_limit=100 * 60)
def process_video_upload_task(upload_id: str, user_id: int) -> None:
    from django.contrib.auth import get_user_model
    from videos.models import VideoUpload
    from wagtailmedia.models import Media
    from home.models import TrimPage
    from home.utils import get_or_create_trims_page
    from storage.media import (
        write_video_to_media,
        download_dir_from_media,
    )
    from moviepy.editor import VideoFileClip

    User = get_user_model()

    try:
        user = User.objects.get(pk=user_id)
    except User.DoesNotExist:
        # Cannot proceed without a valid user
        return

    try:
        upload = VideoUpload.objects.get(upload_id=upload_id, user=user)
    except VideoUpload.DoesNotExist:
        # Cannot proceed without a valid upload
        return

    # Define the chunk directory function
    def get_chunk_media_dir(upload_id):
        if os.getenv('IS_PROD'):
            return f'media/chunks/{upload_id}/'
        else:
            return f'chunks/{upload_id}/'

    chunk_dir = get_chunk_media_dir(upload_id)

    # Download all chunks to a local directory
    local_chunk_dir = download_dir_from_media(chunk_dir)

    # Combine chunks into a single file
    with tempfile.NamedTemporaryFile(delete=False) as outfile:
        chunk_files = sorted(
            os.listdir(local_chunk_dir),
            key=lambda x: int(x.split('_')[-1])
        )
        for chunk_file in chunk_files:
            chunk_path = os.path.join(local_chunk_dir, chunk_file)
            with open(chunk_path, 'rb') as infile:
                outfile.write(infile.read())
        combined_video_path = outfile.name

    # Convert combined video to MP4 using moviepy
    mp4_temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.mp4')
    mp4_temp_path = mp4_temp_file.name
    mp4_temp_file.close()  # Close the file so moviepy can write to it

    try:
        # Load the combined video file
        clip = VideoFileClip(combined_video_path)
        # Write the video file in MP4 format
        clip.write_videofile(mp4_temp_path, codec='libx264', audio_codec='aac')
        clip.close()
    except Exception as e:
        # Clean up temporary files
        os.unlink(combined_video_path)
        os.unlink(mp4_temp_path)
        for chunk_file in chunk_files:
            os.remove(os.path.join(local_chunk_dir, chunk_file))
        os.rmdir(local_chunk_dir)
        # Optionally, log the error
        return

    # Write the MP4 file to media storage
    video_path = write_video_to_media(mp4_temp_path)

    # Create a Media object
    video_title = f'Video {uuid.uuid4()}'
    video_media = Media.objects.create(
        title=video_title,
        file=video_path,
        type='video'
    )

    # Create and publish the TrimPage
    trim_page = TrimPage(
        video=video_media,
    )
    parent_page = get_or_create_trims_page(user)
    parent_page.add_child(instance=trim_page)
    trim_page.save_revision().publish()

    # Clean up temporary files
    os.unlink(combined_video_path)
    os.unlink(mp4_temp_path)
    for chunk_file in chunk_files:
        os.remove(os.path.join(local_chunk_dir, chunk_file))
    os.rmdir(local_chunk_dir)

    # Mark the upload as completed
    upload.completed = True
    upload.save()

    trim_video_task.delay(trim_page.pk)