from django.urls import path
from .views import InterviewView, SpeechToTextView, AnalyzeInterviewView

urlpatterns = [
    path('', InterviewView.as_view(), name='interview'),
    path('stt/', SpeechToTextView.as_view(), name='interview-stt'),
    path('analyze/', AnalyzeInterviewView.as_view(), name='interview-analyze'),
]
