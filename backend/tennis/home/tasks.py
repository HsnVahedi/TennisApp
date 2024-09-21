from celery import shared_task
from typing import List
from django.utils import timezone



@shared_task(time_limit=10 * 60)
def detect_objects_task(batch_pk: int) -> None:
    from videos.models import FramesBatch
    batch = FramesBatch.objects.get(pk=batch_pk)
    batch.detect_ball()
    batch.detect_objs()


@shared_task(time_limit=500 * 60)
def detect_objects_in_video_task(trim_page_pk: int, upload_id: int, user_id: int) -> None:
    from home.models import TrimPage
    from videos.models import VideoUpload
    trim_page = TrimPage.objects.get(pk=trim_page_pk)
    trim_page.detect_objects()
    video_upload = VideoUpload.objects.get(
        upload_id=upload_id, user_id=user_id
    )
    video_upload.objects_detected = True
    video_upload.objects_detected_at = timezone.now()
    video_upload.save()
    trim_video_task.delay(trim_page_pk, upload_id, user_id)



@shared_task(time_limit=100 * 60)
def store_detections_task(trim_page_pk: int, batch_pks: List[int]) -> None:
    from videos.models import FramesBatch
    from home.models import TrimPage
    batches = FramesBatch.objects.filter(pk__in=batch_pks)
    batches = list(batches) 
    trim_page = TrimPage.objects.get(pk=trim_page_pk)
    trim_page.store_detections(batches)



@shared_task(time_limit=10 * 60)
def trim_video_task(trim_page_pk: int, upload_id: int, user_id: int) -> None:
    from home.models import TrimPage
    from videos.models import VideoUpload
    trim_page = TrimPage.objects.get(pk=trim_page_pk)
    trim_page.trim_video()
    video_upload = VideoUpload.objects.get(
        upload_id=upload_id, user_id=user_id
    )
    video_upload.completed = True
    video_upload.completed_at = timezone.now()
    video_upload.save()