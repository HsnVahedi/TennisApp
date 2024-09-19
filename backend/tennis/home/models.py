from django.db import models
from django.db import transaction
from wagtail.models import Page
from wagtail.admin.panels import FieldPanel
from wagtail.images.models import Image
from wagtailmedia.edit_handlers import MediaChooserPanel
from wagtailmedia.models import Media
from django.utils.timezone import now
import random
from django.contrib.auth import get_user_model
import io
from django.core.files.base import ContentFile
import uuid
from ml.jobs.status import check_status, COMPLETED, FAILED, CANCELLED
from ml.jobs.obj_detection.results import get_results as get_obj_detection_results
from ml.jobs.obj_detection.results import Result as ObjDetectionResult
from typing import Dict, List
import re
from home.tasks import detect_objects_task
import time
from storage.media import download_dir_from_media
import traceback



User = get_user_model()


class HomePage(Page):
    subpage_types = ['UserPage']


class UserPage(Page):
    user = models.OneToOneField(User, on_delete=models.PROTECT, related_name='user_page')
    
    subpage_types = ['TrimsPage']

    content_panels = [
        FieldPanel('user'),
    ]
    promote_panels = []

    def save(self, *args, **kwargs):
        self.slug = str(self.user.pk)
        self.title = str(self.user.username)
        super().save(*args, **kwargs)


class TrimsPage(Page):
    parent_page_types = ['UserPage']
    subpage_types = ['TrimPage']

    content_panels = []
    promote_panels = []

    def save(self, *args, **kwargs):
        user = self.get_parent().specific.user
        self.title = f"{user.username}'s Trims"
        self.slug = f"{user.pk}-trims" 
        super().save(*args, **kwargs)


class TrimPage(Page):
    parent_page_types = ['TrimsPage']
    subpage_types = ['FramePage']

    video = models.ForeignKey(
        Media,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='+'
    )
    trimming = models.BooleanField(default=False)

    content_panels = [
        MediaChooserPanel('video'),
    ]
    promote_panels = []

    def save(self, *args, **kwargs):
        if not self.title:
            user = self.get_parent().get_parent().specific.user
            now_str = now().strftime("%Y%m%d%H%M%S")
            random_str = str(uuid.uuid4()) 
            self.title = f"{user.username} {now_str} {random_str}"
            self.slug = f"{user.pk}-{now_str}-{random_str}" 
        super().save(*args, **kwargs)

    # This method takes a lot of time to complete
    # Don't call it syncronously. Use a celery task.
    def detect_objects(self):
        from videos.utils import get_video_length, extract_frames
        from videos.models import FramesBatch
        video_length = get_video_length(self.video.file.name)
        batch_duration = 20 # seconds
        number_of_batches = int(video_length // batch_duration)
        if video_length % batch_duration:
            number_of_batches += 1
        batches: List[FramesBatch] = []
        for i in range(min(number_of_batches, 10)):
            start = i * batch_duration
            end = min(start + batch_duration, video_length)
            batch = FramesBatch.objects.create(
                trim_page=self, batch_number=i
            )
            extract_frames(self.video.file.name, batch.dir_path, 5, start, end)
            detect_objects_task.delay(batch.pk)
            time.sleep(10)
            batches.append(batch)
        self.store_detections(batches)

    # This method takes a lot of time to complete
    # Don't call it syncronously. Use a celery task.
    def store_detections(self, batches):
        from images.utils import read_image, annotate_image
        while batches:
            random_index = random.randint(
                0, len(batches) - 1
            ) 
            batch = batches[random_index]
            batch.refresh_from_db()
            # print('WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWw')
            # print('WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWw')
            # print(f'Checking Batch {batch.batch_number}: {batch.dir_path}')
            # print('WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWw')
            # print('WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWw')
            ball_job_id = batch.ball_job_id
            objs_job_id = batch.objs_job_id
            # if the images are successfully uploaded
            # for inference, then we check the job status
            if ball_job_id and objs_job_id:
                ball_job_status = check_status(ball_job_id)
                objs_job_status = check_status(objs_job_id)
                print(f'Checking Batch Detection Status: {batch.batch_number}')
                print(f'Ball Job Status: {ball_job_status}')
                print(f'Objs Job Status: {objs_job_status}')
                ball_finished = ball_job_status in [COMPLETED, FAILED, CANCELLED]
                objs_finished = objs_job_status in [COMPLETED, FAILED, CANCELLED]
                if ball_finished and objs_finished:
                    ball_detections = get_obj_detection_results(ball_job_id)
                    objs_detections = get_obj_detection_results(objs_job_id)
                    def extract_file_number(file_path: str) -> int:
                        pattern = r'/score/(\d+)\.json$'
                        match = re.search(pattern, file_path)
                        if match:
                            return int(match.group(1))
                        else:
                            raise ValueError("Invalid file path format")
                    # Each key is of shape: f"./predictions-batchjob-{batch_id}/azureml/{az_ml_job_id}/score/{file_number}.json"
                    # Let's create a new dictionary where the keys are the file numbers
                    ball_detections = {
                        str(extract_file_number(k)): v
                        for k, v in ball_detections.items()
                    }
                    objs_detections = {
                        str(extract_file_number(k)): v
                        for k, v in objs_detections.items()
                    }
                    # Now, ball_detections.keys() and objs_detections.keys() are exactly the same
                    frames = objs_detections.keys()
                    detections: ObjDetectionResult = {}
                    for frame in frames:
                        objs = objs_detections[frame]
                        ball = ball_detections[frame]
                        detections[frame] = {}
                        for obj_name in objs:
                            detections[frame][obj_name] = objs[obj_name]
                        for obj_name in ball:
                            detections[frame][obj_name] = ball[obj_name]
                    print('NNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNN')
                    print('NNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNN')
                    print(f'NUMBER OF FILES: {len(detections.keys())}')
                    print(f'FILES          : {list(detections.keys())}') 
                    print('NNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNN')
                    print('NNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNN')
                    for file_number in detections:
                        file_name = download_dir_from_media(batch.dir_path) 
                        file_name = f"{file_name}/{file_number}.jpg"
                        source_image = read_image(file_name)
                        annotated_image = annotate_image(source_image=source_image, boxes=detections[file_number])
                        self.add_new_frame_page(file_number, source_image, annotated_image, detections[file_number])
                    batch.remove_batch_dir()
                    del batches[random_index]
            else:
                # wait for files to be uploaded
                time.sleep(20)             


    def trim_video(self):
        time.sleep(60)


    def get_frames_batches(self):
        return self.frames_batches.all()


    def add_new_frame_page(self, frame_number, source_image, annotated_image, detections: Dict[str, List[List[int]]]):
        # Save the source image
        source_image_io = io.BytesIO()
        source_image.save(source_image_io, format='JPEG')
        source_image_file = ContentFile(
            source_image_io.getvalue(),
            name=f'{self.pk}_{frame_number}_{uuid.uuid4()}_source.jpg'
        )
        source_image_instance = Image.objects.create(file=source_image_file, title=f"{self.slug} Source Image {frame_number}")
        
        # Save the annotated image
        annotated_image_io = io.BytesIO()
        annotated_image.save(annotated_image_io, format='JPEG')
        annotated_image_file = ContentFile(
            annotated_image_io.getvalue(),
            name=f'{self.pk}_{frame_number}_{uuid.uuid4()}_annotated.jpg'
        )
        annotated_image_instance = Image.objects.create(file=annotated_image_file, title=f"{self.slug} Annotated Image {frame_number}")
        
        # Create a new FramePage
        try:
            frame_page_title = f'{uuid.uuid4()} Frame {frame_number}'
            with transaction.atomic():
                # Make sure the page is updated from db and is locked for writing
                self_page = TrimPage.objects.select_for_update().get(pk=self.pk)
                self_page.add_child(instance=FramePage(
                    frame_number=frame_number,
                    title=frame_page_title,
                    original_image=source_image_instance,
                    annotated_image=annotated_image_instance,
                    detections=detections
                ))
        except Exception as e:
            print('', 'MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM')
            print('MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM')
            print(f'error in creating FramePage: {frame_page_title}')
            print('MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM')
            print('MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM', '')
            traceback.print_exc()



class FramePage(Page):
    parent_page_types = ['TrimPage']

    frame_number = models.PositiveBigIntegerField(null=True, blank=True, default=0)
    original_image = models.ForeignKey(
        Image,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='+'
    )
    annotated_image = models.ForeignKey(
        Image,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='+'
    )
    detections = models.JSONField(null=True, blank=True)

    content_panels = [
        FieldPanel('original_image'),
        FieldPanel('annotated_image'),
    ]
    promote_panels = []

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
