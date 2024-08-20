from celery import shared_task


@shared_task
def detect_objects_task(batch_pk: int) -> None:
    from videos.models import FramesBatch
    batch = FramesBatch.objects.get(pk=batch_pk)
    batch.detect_ball()
    batch.detect_objs()


@shared_task
def trim_video_task(trim_page_pk: int) -> None:
    from .models import TrimPage
    trim_page = TrimPage.objects.get(pk=trim_page_pk)
    trim_page.trim_video()