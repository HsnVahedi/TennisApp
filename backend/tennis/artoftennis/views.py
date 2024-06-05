from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .serializers import DataSerializer

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