from django.urls import path
from .views import InterviewView, SpeechToTextView

urlpatterns = [
    path('', InterviewView.as_view(), name='interview'),
    path('stt/', SpeechToTextView.as_view(), name='interview-stt'),
]
