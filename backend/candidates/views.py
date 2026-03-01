from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import AllowAny
from django.db import transaction
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
import os
from .serializers import PersonSerializer
from .ocr_service import MistralOCRService

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


class OCRExtractView(APIView):
    """
    Handle resume/CV OCR extraction using Mistral AI
    """
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [AllowAny]  # Allow public access for resume upload
    
    def post(self, request):
        """
        Extract and parse resume data from uploaded file
        """
        try:
            # Check if file is present
            if 'file' not in request.FILES:
                return Response({
                    "error": "No file uploaded"
                }, status=status.HTTP_400_BAD_REQUEST)
            
            uploaded_file = request.FILES['file']
            
            # Validate file type
            allowed_types = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
            if uploaded_file.content_type not in allowed_types:
                return Response({
                    "error": "Invalid file type. Only PDF and images (JPEG, PNG) are allowed."
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Validate file size (10MB limit)
            if uploaded_file.size > 10 * 1024 * 1024:
                return Response({
                    "error": "File size exceeds 10MB limit"
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Save file temporarily
            file_name = default_storage.save(
                f'temp/{uploaded_file.name}',
                ContentFile(uploaded_file.read())
            )
            file_path = default_storage.path(file_name)
            
            try:
                # Initialize OCR service
                ocr_service = MistralOCRService()
                
                # Process the resume
                structured_data = ocr_service.process_resume(
                    file_path,
                    uploaded_file.content_type
                )
                
                # Return structured data
                return Response({
                    "text": structured_data
                }, status=status.HTTP_200_OK)
                
            finally:
                # Clean up temporary file
                if os.path.exists(file_path):
                    os.remove(file_path)
                    # Also remove the parent directory if empty
                    parent_dir = os.path.dirname(file_path)
                    if os.path.exists(parent_dir) and not os.listdir(parent_dir):
                        os.rmdir(parent_dir)
        
        except ValueError as e:
            # API key not configured
            return Response({
                "error": "OCR service not configured properly",
                "details": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        except Exception as e:
            error_message = str(e)
            
            # Handle specific API errors
            if '401' in error_message or 'Unauthorized' in error_message:
                return Response({
                    "error": "Invalid Mistral API Key. Please check your backend .env file.",
                    "details": error_message
                }, status=status.HTTP_401_UNAUTHORIZED)
            elif '400' in error_message:
                return Response({
                    "error": "Bad Request. The file might be corrupted or the model is unavailable.",
                    "details": error_message
                }, status=status.HTTP_400_BAD_REQUEST)
            else:
                return Response({
                    "error": "Failed to extract text from document",
                    "details": error_message
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class HealthCheckView(APIView):
    """
    Health check endpoint for OCR service
    """
    permission_classes = [AllowAny]  # Allow public access for health check
    
    def get(self, request):
        return Response({
            "status": "OK",
            "message": "OCR service is running"
        }, status=status.HTTP_200_OK)


class ResumeAnalysisView(APIView):
    """
    Analyze resume quality and provide scores, strengths, weaknesses, and recommendations
    """
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [AllowAny]  # Allow public access for resume analysis
    
    def post(self, request):
        """
        Analyze resume and return comprehensive feedback
        """
        try:
            # Check if file is present
            if 'file' not in request.FILES:
                return Response({
                    "error": "No file uploaded"
                }, status=status.HTTP_400_BAD_REQUEST)
            
            uploaded_file = request.FILES['file']
            
            # Validate file type
            allowed_types = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
            if uploaded_file.content_type not in allowed_types:
                return Response({
                    "error": "Invalid file type. Only PDF and images (JPEG, PNG) are allowed."
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Validate file size (10MB limit)
            if uploaded_file.size > 10 * 1024 * 1024:
                return Response({
                    "error": "File size exceeds 10MB limit"
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Save file temporarily
            file_name = default_storage.save(
                f'temp/{uploaded_file.name}',
                ContentFile(uploaded_file.read())
            )
            file_path = default_storage.path(file_name)
            
            try:
                # Initialize OCR service
                ocr_service = MistralOCRService()
                
                # Analyze the resume
                analysis_data = ocr_service.analyze_resume(
                    file_path,
                    uploaded_file.content_type
                )
                
                # Return analysis data
                return Response(analysis_data, status=status.HTTP_200_OK)
                
            finally:
                # Clean up temporary file
                if os.path.exists(file_path):
                    os.remove(file_path)
                    # Also remove the parent directory if empty
                    parent_dir = os.path.dirname(file_path)
                    if os.path.exists(parent_dir) and not os.listdir(parent_dir):
                        os.rmdir(parent_dir)
        
        except ValueError as e:
            # API key not configured
            return Response({
                "error": "Analysis service not configured properly",
                "details": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        except Exception as e:
            error_message = str(e)
            
            # Handle specific API errors
            if '401' in error_message or 'Unauthorized' in error_message:
                return Response({
                    "error": "Invalid Mistral API Key. Please check your backend .env file.",
                    "details": error_message
                }, status=status.HTTP_401_UNAUTHORIZED)
            elif '400' in error_message:
                return Response({
                    "error": "Bad Request. The file might be corrupted or the model is unavailable.",
                    "details": error_message
                }, status=status.HTTP_400_BAD_REQUEST)
            else:
                return Response({
                    "error": "Failed to analyze resume",
                    "details": error_message
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


