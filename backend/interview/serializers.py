from rest_framework import serializers
from .models import InterviewSignup, InterviewSession
from accounts.serializers import UserSerializer


class InterviewSignupSerializer(serializers.ModelSerializer):
    """
    Serializer for InterviewSignup model.
    Allows users to create/update their interview signup data.
    """
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = InterviewSignup
        fields = [
            'id',
            'user',
            'interview_type',
            'job_role',
            'experience_level',
            'company_name',
            'hiring_for_position',
            'preferred_interview_date',
            'interview_duration_minutes',
            'resume_uploaded',
            'resume_url',
            'is_completed',
            'interview_completion_date',
            'interview_score',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'user',
            'is_completed',
            'interview_completion_date',
            'interview_score',
            'created_at',
            'updated_at',
        ]


class InterviewSessionSerializer(serializers.ModelSerializer):
    """
    Serializer for InterviewSession model.
    """
    class Meta:
        model = InterviewSession
        fields = ['id', 'session_id', 'history', 'created_at']
        read_only_fields = ['id', 'created_at']
