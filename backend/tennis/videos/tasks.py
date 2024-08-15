from typing import List
from celery import shared_task


@shared_task
def frames_batch_extraction_task(trim_page_pk: int, video_path: str, fps: float, start: int, end: int) -> None:
    from videos.models import FramesBatch
    from videos.utils import extract_frames
    from home.models import TrimPage
    batch_dir = extract_frames(video_path, fps, start, end)
    trim_page = TrimPage.objects.get(pk=trim_page_pk)
    batch = FramesBatch.objects.create(dir_path=batch_dir, trim_page=trim_page)
    batch.on_extraction_completed()


@shared_task
def frames_extraction_task(trim_page_pk: int, video_path: str) -> None:
    from videos.utils import get_video_length
    video_length = get_video_length(video_path)
    batch_duration = 10 # seconds
    number_of_batches = int(video_length // batch_duration)
    if video_length % batch_duration:
        number_of_batches += 1
    for i in range(number_of_batches):
        start = i * batch_duration
        end = min(start + batch_duration, video_length)
        frames_batch_extraction_task.delay(trim_page_pk ,video_path, 5, start, end)
