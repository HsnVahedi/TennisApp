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
from home.utils import get_or_create_trims_page


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
