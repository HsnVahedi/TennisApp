import os
import tempfile
from django.conf import settings
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import VideoUpload
from wagtailmedia.models import Media
from home.models import TrimPage
import uuid
from storage.media import write_to_media, download_dir_from_media, write_bytes_to_media, write_video_to_media
from home.utils import get_or_create_trims_page
from moviepy.editor import VideoFileClip


class VideoUploadViewSet(viewsets.ViewSet):
    queryset = VideoUpload.objects.all()
    # serializer_class = VideoUploadSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['post'])
    def initiate_upload(self, request):
        upload = VideoUpload.objects.create(user=request.user, upload_id=uuid.uuid4().hex)
        return Response({
            'upload_id': upload.upload_id,
        }, status=status.HTTP_201_CREATED) 


    @action(detail=False, methods=['put'])
    def upload_chunk(self, request):
        upload_id = request.query_params.get('upload_id')
        chunk_number = int(request.query_params.get('chunk_number', 0))
        
        try:
            upload = VideoUpload.objects.get(upload_id=upload_id, user=request.user)
        except VideoUpload.DoesNotExist:
            return Response({'error': 'Upload not found'}, status=status.HTTP_404_NOT_FOUND)

        chunk = request.FILES.get('chunk')
        if not chunk:
            return Response({'error': 'No chunk provided'}, status=status.HTTP_400_BAD_REQUEST)

        # Construct the chunk file name
        chunk_file_name = f'chunks/{upload_id}/chunk_{chunk_number}'

        # Use write_bytes_to_media to save the chunk
        chunk_url = write_bytes_to_media(chunk_file_name, chunk.read())

        # Update the upload object if needed
        # For example, you might want to keep track of the number of chunks uploaded
        upload.last_chunk_number = chunk_number
        upload.save()

        return Response({
            'message': 'Chunk uploaded successfully',
            'chunk_number': chunk_number,
            'chunk_url': chunk_url
        }, status=status.HTTP_202_ACCEPTED)




    @action(detail=False, methods=['post'])
    def complete_upload(self, request):
        upload_id = request.data.get('upload_id')
        
        try:
            upload = VideoUpload.objects.get(upload_id=upload_id, user=request.user)
        except VideoUpload.DoesNotExist:
            return Response({'error': 'Upload not found'}, status=status.HTTP_404_NOT_FOUND)

        chunk_dir = f'chunks/{upload_id}/'

        # Download all chunks to a local directory
        local_chunk_dir = download_dir_from_media(chunk_dir)

        # Combine chunks into a single file
        with tempfile.NamedTemporaryFile(delete=False) as outfile:
            chunk_files = sorted(os.listdir(local_chunk_dir), key=lambda x: int(x.split('_')[-1]))
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
            return Response({'error': 'Video conversion failed'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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
        parent_page = get_or_create_trims_page(request.user)
        parent_page.add_child(instance=trim_page)
        trim_page.save_revision().publish()

        # Clean up temporary files
        os.unlink(combined_video_path)
        os.unlink(mp4_temp_path)
        for chunk_file in chunk_files:
            os.remove(os.path.join(local_chunk_dir, chunk_file))
        os.rmdir(local_chunk_dir)

        upload.completed = True
        upload.save()

        return Response({
            'message': 'Upload completed successfully',
        }, status=status.HTTP_200_OK)

    
    


    # @action(detail=False, methods=['post'])
    # def complete_upload(self, request):
    #     upload_id = request.data.get('upload_id')
        
    #     try:
    #         upload = VideoUpload.objects.get(upload_id=upload_id, user=request.user)
    #     except VideoUpload.DoesNotExist:
    #         return Response({'error': 'Upload not found'}, status=status.HTTP_404_NOT_FOUND)

    #     chunk_dir = f'chunks/{upload_id}/'

    #     # Download all chunks to a local directory
    #     local_chunk_dir = download_dir_from_media(chunk_dir)

    #     # Combine chunks
    #     with tempfile.NamedTemporaryFile(delete=False) as outfile:
    #         chunk_files = sorted(os.listdir(local_chunk_dir), key=lambda x: int(x.split('_')[-1]))
    #         for chunk_file in chunk_files:
    #             chunk_path = os.path.join(local_chunk_dir, chunk_file)
    #             with open(chunk_path, 'rb') as infile:
    #                 outfile.write(infile.read())
    #         final_temp_path = outfile.name

    #     video_path = write_video_to_media(final_temp_path)


    #     video_title = f'Video {uuid.uuid4()}'
    #     video_media = Media.objects.create(
    #         title=video_title,
    #         file=video_path,
    #         type='video'
    #     )

    #     trim_page = TrimPage(
    #         # title=f'TrimPage {uuid.uuid4()}',
    #         video=video_media,
    #         # trimming=True
    #     )
    #     parent_page = get_or_create_trims_page(request.user)
    #     parent_page.add_child(instance=trim_page)

    #     trim_page.save_revision().publish()



    #     os.unlink(final_temp_path)
    #     for chunk_file in chunk_files:
    #         os.remove(os.path.join(local_chunk_dir, chunk_file))
    #     os.rmdir(local_chunk_dir)

    #     upload.completed = True
    #     upload.save()

    #     return Response({
    #         'message': 'Upload completed successfully',
    #         # 'file_url': final_media_path
    #     }, status=status.HTTP_200_OK)
