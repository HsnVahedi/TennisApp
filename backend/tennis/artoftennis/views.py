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
    print('SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS')
    print('SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS')
    print('frontend_url:', request.GET['frontendPage'])
    print('SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS')
    print('SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS')
    frontend_url = request.GET['frontendPage']
    return redirect(f'{frontend_url}?alreadyLoggedIn=1')


class BatchImageUploadApiView(APIView):
    # permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)

    @csrf_exempt
    def post(self, request, *args, **kwargs):
        # Create a new Gallery object
        # gallery = Gallery.objects.create(title=request.data.get('title', 'Untitled Gallery'))

        # Get the uploaded files
        files = request.FILES.getlist('images')

        # Save each image
        for file in files:
            print('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
            print('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
            print(file)
            print('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
            print('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')

        return Response({"message": "Images uploaded successfully"}, status=status.HTTP_201_CREATED)