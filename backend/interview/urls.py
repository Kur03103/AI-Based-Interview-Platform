from django.urls import path
from .views import (
    InterviewView, 
    SpeechToTextView, 
    AnalyzeInterviewView,
    InterviewSignupCreateView,
    InterviewSignupDetailView,
    InterviewSignupListView,
    InterviewReportSaveView,
    InterviewReportListView,
)

urlpatterns = [
    # Interview Signup endpoints
    path('signup/', InterviewSignupCreateView.as_view(), name='interview-signup-create'),
    path('signup/me/', InterviewSignupDetailView.as_view(), name='interview-signup-detail'),
    path('signups/', InterviewSignupListView.as_view(), name='interview-signup-list'),
    
    # Interview session endpoints
    path('', InterviewView.as_view(), name='interview'),
    path('stt/', SpeechToTextView.as_view(), name='interview-stt'),
    path('analyze/', AnalyzeInterviewView.as_view(), name='interview-analyze'),
    
    # Interview reports endpoints
    path('reports/save/', InterviewReportSaveView.as_view(), name='interview-report-save'),
    path('reports/', InterviewReportListView.as_view(), name='interview-report-list'),
]
