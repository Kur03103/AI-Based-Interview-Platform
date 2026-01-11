from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction
from .serializers import PersonSerializer

class SaveCVView(APIView):
    def post(self, request):
        try:
            with transaction.atomic():
                serializer = PersonSerializer(data=request.data)
                if serializer.is_valid():
                    person = serializer.save()
                    return Response({
                        "message": "CV data saved successfully",
                        "person_id": person.id
                    }, status=status.HTTP_201_CREATED)
                else:
                    return Response({
                        "error": "Validation failed",
                        "details": serializer.errors
                    }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                "error": "An error occurred while saving CV data",
                "details": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
