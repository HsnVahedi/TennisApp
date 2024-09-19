from rest_framework import serializers
from .models import VideoUpload

class VideoUploadStatusSerializer(serializers.ModelSerializer):
    status = serializers.SerializerMethodField()

    class Meta:
        model = VideoUpload
        fields = ['upload_id', 'status']

    def get_status(self, obj):
        if obj.completed:
            return 'COMPLETED'
        elif obj.objects_detected:
            return 'TRIMMING'
        elif obj.uploaded:
            return 'DETECTING'
        else:
            return 'UPLOADING'