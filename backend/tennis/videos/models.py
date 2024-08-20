from django.db import models
import shutil
from ml.jobs.obj_detection.ball import invoke as invoke_ball
from ml.jobs.obj_detection.objs import invoke as invoke_objs


class FramesBatch(models.Model):
    trim_page = models.ForeignKey(
        'home.TrimPage',
        on_delete=models.CASCADE,
        related_name='frames_batches'
    )
    dir_path = models.CharField(max_length=512, unique=True)
    batch_number = models.BigIntegerField()
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
        shutil.rmtree(self.dir_path)


    def __str__(self):
        return self.dir_path
