import os
import zipfile
from django.http import Http404, HttpResponseRedirect
from wagtail.models import Page
from django.shortcuts import get_object_or_404
from django.views import View
from .models import TrimPage, FramePage
import uuid
from home.tasks import trim_video_task
from django.contrib import messages
from django.urls import reverse
import io
from storage.media import write_to_media, read_from_media, download_from_media


class ExportTrimView(View):

    @staticmethod
    def get_page(page_id):
        page = get_object_or_404(Page, id=page_id).specific
        if not isinstance(page, TrimPage):
            raise Http404("This action is only applicable to TrimPage instances.")
        return page
 

    @staticmethod
    def write_zip(zip_buffer: io.BytesIO, page):
        with zipfile.ZipFile(zip_buffer, 'w') as zip_file:
            if page.video:
                video_name = page.video.file.name
                video_path = download_from_media(video_name) 
                zip_file.write(video_path, os.path.basename(video_name))
                os.remove(video_path)
                # zip_file.writestr(
                #     os.path.basename(video_name), video
                # )
            frames_dir = 'frames'
            annotated_frames_dir = 'annotated_frames'
            frame_pages = FramePage.objects.child_of(page).live()
            for frame_page in frame_pages:
                if frame_page.original_image:
                    original_image_name = frame_page.original_image.file.name
                    # original_image = read_from_media(original_image_name)
                    original_image_path = download_from_media(original_image_name)
                    zip_file.write(
                        original_image_path,
                        os.path.join(
                            frames_dir,
                            os.path.basename(original_image_path)
                        ),
                    )
                    os.remove(original_image_path)
                if frame_page.annotated_image:
                    annotated_image_name = frame_page.annotated_image.file.name
                    # annotated_image = read_from_media(annotated_image_name)
                    annotated_image_path = download_from_media(annotated_image_name)
                    zip_file.write(
                        annotated_image_path,
                        os.path.join(
                            annotated_frames_dir,
                            os.path.basename(annotated_image_name)
                        ),
                    )
                    os.remove(annotated_image_path)
                    # zip_file.writestr(
                    #     os.path.join(
                    #         annotated_frames_dir,
                    #         os.path.basename(annotated_image_name)
                    #     ),
                    #     annotated_image
                    # )

    def get(self, request, *args, **kwargs):
        print('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@')
        print('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@')
        print('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@')
        print('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@')
        page_id = kwargs.get('page_id')
        page = self.get_page(page_id)
        zip_filename = f"{uuid.uuid4()}-{page.pk}.zip"


        print('$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$')
        print('$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$')
        print(zip_filename)
        print('$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$')
        print('$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$')
        with open(zip_filename, 'wb') as file:
            zip_buffer = io.BytesIO()
            self.write_zip(zip_buffer, page)        
            zip_buffer.seek(0)
            file.write(zip_buffer.read())
        file_url = write_to_media(zip_filename)
        os.remove(zip_filename)

        # zip_buffer = io.BytesIO()
        # self.write_zip(zip_buffer, page)        
        # zip_buffer.seek(0)

        # file_url = write_bytes_to_media(zip_filename, zip_buffer)
        return HttpResponseRedirect(file_url)


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