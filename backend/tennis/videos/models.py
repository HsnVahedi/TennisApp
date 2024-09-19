from django.db import models
import shutil
from ml.jobs.obj_detection.ball import invoke as invoke_ball
from ml.jobs.obj_detection.objs import invoke as invoke_objs
from django.contrib.auth import get_user_model
import os
from django.core.files.storage import default_storage


User = get_user_model()


class VideoUpload(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    video_path  = models.CharField(max_length=2024, blank=True, null=True)

    upload_id = models.CharField(max_length=32, unique=True)
    trim_page_id = models.PositiveIntegerField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    uploaded_at = models.DateTimeField(blank=True, null=True)
    objects_detected_at = models.DateTimeField(blank=True, null=True)
    completed_at = models.DateTimeField(blank=True, null=True)

    uploaded = models.BooleanField(default=False)
    objects_detected = models.BooleanField(default=False)
    completed = models.BooleanField(default=False)

    def get_media_url(self):
        if self.video_path:
            return default_storage.url(self.video_path)
        return None


class FramesBatch(models.Model):
    trim_page = models.ForeignKey(
        'home.TrimPage',
        on_delete=models.CASCADE,
        related_name='frames_batches'
    )
    dir_path = models.CharField(max_length=512, unique=True)
    batch_number = models.BigIntegerField()
    batch_size = models.PositiveIntegerField(default=0, blank=True, null=True)
    ball_job_id = models.CharField(max_length=256, null=True, blank=True)
    objs_job_id = models.CharField(max_length=256, null=True, blank=True)

    class Meta:
        unique_together = ('trim_page', 'batch_number')

    def save(self, *args, **kwargs):
        if not self.pk:
            self.dir_path = f'{self.trim_page.slug}/frames_batches/{self.batch_number}'
        super().save(*args, **kwargs)


    # This method takes a lot of time to complete
    # Don't call it syncronously. Use a celery task.
    def detect_ball(self):
        self.ball_job_id = invoke_ball(self.dir_path)
        self.save()


    # This method takes a lot of time to complete
    # Don't call it syncronously. Use a celery task.
    def detect_objs(self):
        self.objs_job_id = invoke_objs(self.dir_path)
        self.save()


    def remove_batch_dir(self):
        shutil.rmtree(
            os.path.join("temp/", self.dir_path)
        )


    def __str__(self):
        return self.dir_path
