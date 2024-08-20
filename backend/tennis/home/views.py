import os
import zipfile
from django.http import HttpResponse, Http404, HttpResponseRedirect
from django.conf import settings
from wagtail.models import Page
from django.shortcuts import get_object_or_404
from django.views import View
from .models import TrimPage, FramePage
import uuid
from home.tasks import trim_video_task
from django.contrib import messages
from django.urls import reverse



class ExportTrimView(View):
    def get(self, request, *args, **kwargs):
        page_id = kwargs.get('page_id')
        page = get_object_or_404(Page, id=page_id).specific
        if not isinstance(page, TrimPage):
            raise Http404("This action is only applicable to TrimPage instances.")
        zip_filename = f"{uuid.uuid4()}-{page.pk}.zip"
        zip_filepath = os.path.join(settings.MEDIA_ROOT, zip_filename)
        with zipfile.ZipFile(zip_filepath, 'w') as zip_file:
            if page.video:
                video_path = page.video.file.path
                zip_file.write(video_path, arcname=os.path.basename(video_path))
            frames_dir = 'frames'
            annotated_frames_dir = 'annotated_frames'
            frame_pages = FramePage.objects.child_of(page).live()
            for frame_page in frame_pages:
                if frame_page.original_image:
                    original_image_path = frame_page.original_image.file.path
                    zip_file.write(original_image_path, arcname=os.path.join(frames_dir, os.path.basename(original_image_path)))
                if frame_page.annotated_image:
                    annotated_image_path = frame_page.annotated_image.file.path
                    zip_file.write(annotated_image_path, arcname=os.path.join(annotated_frames_dir, os.path.basename(annotated_image_path)))
        with open(zip_filepath, 'rb') as f:
            response = HttpResponse(f.read(), content_type='application/zip')
            response['Content-Disposition'] = f'attachment; filename={zip_filename}'
        os.remove(zip_filepath)
        return response


class TrimVideoView(View):
    def get(self, request, *args, **kwargs):
        page_id = kwargs.get('page_id')
        page = get_object_or_404(Page, id=page_id).specific
        if not isinstance(page, TrimPage):
            raise Http404("This action is only applicable to TrimPage instances.")
        trim_video_task.delay(page.pk)
        page.trimming = True
        page.save()
        messages.success(request, "Video trimming started")
        edit_url = reverse('wagtailadmin_pages:edit', args=(page.pk,))
        return HttpResponseRedirect(edit_url)