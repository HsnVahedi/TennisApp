from rest_framework.views import APIView
from rest_framework.response import Response
from .serializers import DataSerializer

class DataAPIView(APIView):
    def get(self, request, format=None):
        data = {'data': 1}
        serializer = DataSerializer(data)
        return Response(serializer.data)
