from rest_framework import serializers
from videos.models import VideoUpload, VideoClip

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


class VideoClipSerializer(serializers.ModelSerializer):
    media_url = serializers.SerializerMethodField()

    class Meta:
        model = VideoClip
        fields = ['id', 'clip_number', 'media_url']

    def get_media_url(self, obj):
        return obj.get_media_url()
