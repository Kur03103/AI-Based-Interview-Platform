from django.urls import path
from .views import SaveCVView

urlpatterns = [
    path('save/', SaveCVView.as_view(), name='save_cv'),
]
