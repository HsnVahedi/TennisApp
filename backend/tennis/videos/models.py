from django.db import models
from celery.result import AsyncResult
from ml.jobs.obj_detection.results import Result as ObjDetectionResult
import shutil



class FramesBatch(models.Model):
    trim_page = models.ForeignKey(
        'home.TrimPage',
        on_delete=models.CASCADE,
        related_name='frames_batches'
    )
    dir_path = models.CharField(max_length=512, unique=True)
    detections = models.JSONField(blank=True, null=True)
    detected = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)


    def on_detection_completed(self, detections: ObjDetectionResult):
        self.detected = True
        self.detections = detections
        self.save()
        shutil.rmtree(self.dir_path)
        # asyncronously annotate the images


    def on_extraction_completed(self) -> AsyncResult:
        from ml.tasks import tennis_object_detection_task
        return tennis_object_detection_task.delay(self.dir_path)

    def on_detection_completed(self):
        self.detected = True
        self.save()


    def __str__(self):
        return self.dir_path
