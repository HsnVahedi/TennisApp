from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from contactus.serializers import ContactFormSerializer


class ContactFormAPIView(APIView):
    def post(self, request):
        serializer = ContactFormSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"success": True, "message": "Form submitted successfully"},
                status=status.HTTP_201_CREATED
            )
        return Response(
            {"success": False, "errors": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST
        )
