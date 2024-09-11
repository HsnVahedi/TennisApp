from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.views import LoginView as DjangoLoginView
from django.shortcuts import redirect
from urllib.parse import parse_qs, urlparse

from .serializers import DataSerializer, UserInfoSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status
from django.views.decorators.csrf import csrf_exempt
from home.models import TrimsPage, UserPage, TrimPage, FramePage, HomePage
from videos.models import FramesBatch
from wagtail.images import get_image_model
from django.db import transaction
from django.contrib.auth import get_user_model
import uuid
from storage.media import write_to_media
import os


ImageModel = get_image_model()
User = get_user_model()



class DataAPIView(APIView):
    def get(self, request, format=None):
        data = {'data': 110}
        serializer = DataSerializer(data)
        return Response(serializer.data)


class ProtectedDataAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, format=None):
        data = {'data': 111}
        serializer = DataSerializer(data)
        return Response(serializer.data)


class UserInfo(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, format=None):
        user = request.user
        data = {'username': user.username}
        serializer = UserInfoSerializer(data)
        return Response(serializer.data)


class LoginView(DjangoLoginView):
    template_name = 'login.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        # Extract the 'next' parameter first,
        # because frontendPage is nested inside the 'next' parameter
        next_url = self.request.GET.get('next')
        if next_url:
            # Parse the query parameters from the 'next' URL
            parsed_url = urlparse(next_url)
            query_params = parse_qs(parsed_url.query)
            context['frontendPage'] = query_params.get('frontendPage', [None])[0]
        return context


def after_social_login(request):
    frontend_url = request.GET['frontendPage']
    return redirect(f'{frontend_url}?alreadyLoggedIn=1')


def get_or_create_user_page(user):
    home_page = HomePage.objects.first()
    user_page = UserPage.objects.filter(user=user).first()
    if not user_page:
        user_page = UserPage(user=user)
        home_page.add_child(instance=user_page)
        user_page.save_revision().publish()
    return user_page


def get_or_create_trims_page(user):
    user_page = get_or_create_user_page(user)

    # Get the children of the user page and filter for a TrimsPage
    trims_page = user_page.get_children().type(TrimsPage).first()

    if not trims_page:
        # Create a new TrimsPage as a child of the user page
        trims_page = TrimsPage(
            # parent=user_page
        )
        user_page.add_child(instance=trims_page)
        trims_page.save_revision().publish()

    return trims_page



class CreateTrimView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request, *args, **kwargs):
        trims_page = get_or_create_trims_page(request.user)
        trim_page = TrimPage()
        trims_page.add_child(instance=trim_page)
        trim_page.save_revision().publish()  
        trim_page.refresh_from_db()
        return Response({'id': trim_page.pk}, status=status.HTTP_201_CREATED)


class BatchImageUploadApiView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)


    @transaction.atomic
    def post(self, request, *args, **kwargs):
        from home.tasks import detect_objects_task, store_detections_task
        trim_id = self.kwargs.get('trim_id')
        batch_id = self.kwargs.get('batch_id')
        
        # trims_page = get_or_create_trims_page(
        #     # User.objects.get(username='django')
        #     request.user
        # )
        # trim_page = TrimPage()
        
        # trims_page.add_child(instance=trim_page)
        # trim_page.save_revision().publish()
        print('PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP')
        print('PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP')
        trim_page = TrimPage.objects.get(pk=trim_id)
        batch = FramesBatch.objects.create(
            trim_page=trim_page, batch_number=batch_id
        )
        print('TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT')
        print('TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT')
        files = request.FILES.getlist('images')
        # Only first 30 files are processed
        for i, file in enumerate(files[:30]):
            # Construct the local path for the file
            local_file_path = os.path.join(batch.dir_path, f'{i}.jpg')
            os.makedirs(os.path.dirname(local_file_path), exist_ok=True)
            with open(local_file_path, 'wb') as destination:
                destination.write(file.read())
            media_url = write_to_media(local_file_path)
            os.remove(local_file_path)
            print(f'File {file.name} saved to media storage at {media_url}')
            


        detect_objects_task.delay(batch.pk)
        store_detections_task.delay(trim_page.pk, [batch.pk])
        return Response(
            {
                "message": "Images uploaded successfully"
            },
            status=status.HTTP_201_CREATED
        )