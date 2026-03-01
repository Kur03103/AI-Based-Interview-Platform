from django.urls import path
from .views import (
    SaveCVView, 
    OCRExtractView, 
    HealthCheckView, 
    ResumeAnalysisView,
    JobRecommendationsView,
    ResumeQualityView
)

urlpatterns = [
    path('save/', SaveCVView.as_view(), name='save_cv'),
    path('ocr/extract/', OCRExtractView.as_view(), name='ocr_extract'),
    path('analyze/', ResumeAnalysisView.as_view(), name='resume_analysis'),
    path('health/', HealthCheckView.as_view(), name='health_check'),
    path('recommendations/', JobRecommendationsView.as_view(), name='job_recommendations'),
    path('quality/', ResumeQualityView.as_view(), name='resume_quality'),
]
