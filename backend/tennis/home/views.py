import os
import zipfile
from django.http import HttpResponse, Http404
from django.conf import settings
from wagtail.admin import messages
from wagtail.models import Page
from django.urls import reverse
from django.shortcuts import redirect, get_object_or_404
from django.views import View
from .models import TrimPage, FramePage

class MyNewActionView(View):
    def get(self, request, *args, **kwargs):
        page_id = kwargs.get('page_id')

        # Retrieve the specific instance of the TrimPage
        page = get_object_or_404(Page, id=page_id).specific

        if not isinstance(page, TrimPage):
            raise Http404("This action is only applicable to TrimPage instances.")

        # Set up paths for the zip file
        zip_filename = f"{page.slug}.zip"
        zip_filepath = os.path.join(settings.MEDIA_ROOT, zip_filename)

        # Create a zip file
        with zipfile.ZipFile(zip_filepath, 'w') as zip_file:
            # Add the video file
            if page.video:
                video_path = page.video.file.path
                zip_file.write(video_path, arcname=os.path.basename(video_path))

            # Add the original images and annotated images
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

        # Serve the zip file as a response for download
        with open(zip_filepath, 'rb') as f:
            response = HttpResponse(f.read(), content_type='application/zip')
            response['Content-Disposition'] = f'attachment; filename={zip_filename}'

        # Cleanup: delete the zip file after serving
        os.remove(zip_filepath)

        return response
