from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import VideoUploadViewSet

router = DefaultRouter()
router.register('upload', VideoUploadViewSet)

urlpatterns = [
    path('', include(router.urls)),
]