import os
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import VideoUpload
import uuid
from storage.media import write_bytes_to_media
from videos.tasks import process_video_upload_task
from videos.serializers import VideoUploadStatusSerializer
from rest_framework.views import APIView


class VideoUploadViewSet(viewsets.ViewSet):
    queryset = VideoUpload.objects.all()
    # serializer_class = VideoUploadSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['post'])
    def initiate_upload(self, request):
        upload = VideoUpload.objects.create(user=request.user, upload_id=uuid.uuid4().hex)
        return Response({
            'upload_id': upload.upload_id,
        }, status=status.HTTP_201_CREATED) 


    @action(detail=False, methods=['put'])
    def upload_chunk(self, request):
        upload_id = request.query_params.get('upload_id')
        chunk_number = int(request.query_params.get('chunk_number', 0))

        try:
            upload = VideoUpload.objects.get(upload_id=upload_id, user=request.user)
        except VideoUpload.DoesNotExist:
            return Response({'error': 'Upload not found'}, status=status.HTTP_404_NOT_FOUND)

        chunk = request.FILES.get('chunk')
        if not chunk:
            return Response({'error': 'No chunk provided'}, status=status.HTTP_400_BAD_REQUEST)

        # Construct the chunk file name
        chunk_file_name = f'chunks/{upload_id}/chunk_{chunk_number}'

        # Use write_bytes_to_media to save the chunk
        chunk_url = write_bytes_to_media(chunk_file_name, chunk.read())

        # Update the upload object if needed
        # For example, you might want to keep track of the number of chunks uploaded
        upload.last_chunk_number = chunk_number
        upload.save()

        return Response({
            'message': 'Chunk uploaded successfully',
            'chunk_number': chunk_number,
            'chunk_url': chunk_url
        }, status=status.HTTP_202_ACCEPTED)
    

    @staticmethod
    def get_chunck_media_dir(upload_id):
        if os.getenv('IS_PROD'):
            return f'media/chunks/{upload_id}/'
        else:
            return f'chunks/{upload_id}/'




    @action(detail=False, methods=['post'])
    def complete_upload(self, request):
        upload_id = request.data.get('upload_id')

        try:
            upload = VideoUpload.objects.get(upload_id=upload_id, user=request.user)
        except VideoUpload.DoesNotExist:
            return Response({'error': 'Upload not found'}, status=status.HTTP_404_NOT_FOUND)

        # Invoke the Celery task
        process_video_upload_task.delay(upload_id, request.user.id)

        return Response({
            'message': 'Upload completed successfully',
        }, status=status.HTTP_200_OK) 



class VideoUploadStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, upload_id):
        try:
            # Retrieve the VideoUpload instance for the authenticated user
            upload = VideoUpload.objects.get(upload_id=upload_id, user=request.user)
        except VideoUpload.DoesNotExist:
            return Response({'error': 'Upload not found'}, status=status.HTTP_404_NOT_FOUND)

        # Serialize the data
        serializer = VideoUploadStatusSerializer(upload)
        return Response(serializer.data, status=status.HTTP_200_OK)



class VideoMediaUrlView(APIView):
    permission_classes = [IsAuthenticated]


    def get(self, request, upload_id):
        try:
            # Retrieve the VideoUpload instance for the authenticated user
            upload = VideoUpload.objects.get(upload_id=upload_id, user=request.user)
        except VideoUpload.DoesNotExist:
            return Response({'error': 'Upload not found'}, status=status.HTTP_404_NOT_FOUND)

        media_url = upload.get_media_url()

        return Response({
            'media_url': media_url,
        }, status=status.HTTP_200_OK)