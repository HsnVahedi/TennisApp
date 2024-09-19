from django.urls import path, include
from rest_framework.routers import DefaultRouter
from videos.views import (
    VideoUploadViewSet, VideoUploadStatusView, VideoMediaUrlView
) 


router = DefaultRouter()
router.register('upload', VideoUploadViewSet)

urlpatterns = [
    path(
        'upload/status/<str:upload_id>/',
        VideoUploadStatusView.as_view(), name='video-upload-status'
    ),
    path(
        'upload/media-url/<str:upload_id>/',
        VideoMediaUrlView.as_view(), name='video-media-url'
    ),
    path('', include(router.urls)),
]