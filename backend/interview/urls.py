from django.urls import path
from .views import InterviewView

urlpatterns = [
    path('', InterviewView.as_view(), name='interview'),
]
