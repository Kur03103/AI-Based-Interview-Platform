from django.contrib import admin

# Register your models here.
from .models import InterviewSession

@admin.register(InterviewSession)
class InterviewSessionAdmin(admin.ModelAdmin):
    list_display = ('session_id', 'created_at')
    search_fields = ('session_id',)
