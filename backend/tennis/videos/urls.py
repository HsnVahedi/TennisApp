from django.urls import path, include
from rest_framework.routers import DefaultRouter
from videos.views import VideoUploadViewSet
from videos.views import VideoUploadStatusView


router = DefaultRouter()
router.register('upload', VideoUploadViewSet)

urlpatterns = [
    path(
        'upload/status/<str:upload_id>/',
        VideoUploadStatusView.as_view(), name='video-upload-status'
    ),
    path('', include(router.urls)),
]