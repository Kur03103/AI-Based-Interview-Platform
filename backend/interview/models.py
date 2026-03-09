from django.db import models
import uuid
from accounts.models import CustomUser

class InterviewSession(models.Model):
    session_id = models.CharField(max_length=255, unique=True)
    history = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.session_id


class InterviewSignup(models.Model):
    """
    Model to track user signups for interviews.
    Links each user to their interview signup data.
    """
    INTERVIEW_TYPE_CHOICES = [
        ('technical', 'Technical Interview'),
        ('behavioral', 'Behavioral Interview'),
        ('both', 'Both Technical and Behavioral'),
    ]
    
    EXPERIENCE_LEVEL_CHOICES = [
        ('fresher', 'Fresher'),
        ('junior', 'Junior (1-3 years)'),
        ('mid', 'Mid-Level (3-5 years)'),
        ('senior', 'Senior (5+ years)'),
    ]
    
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='interview_signup')
    interview_type = models.CharField(max_length=20, choices=INTERVIEW_TYPE_CHOICES, default='technical')
    job_role = models.CharField(max_length=255, blank=True, null=True)  # e.g., 'Software Engineer', 'Data Scientist'
    experience_level = models.CharField(max_length=20, choices=EXPERIENCE_LEVEL_CHOICES, default='fresher')
    company_name = models.CharField(max_length=255, blank=True, null=True)
    hiring_for_position = models.CharField(max_length=255, blank=True, null=True)
    
    # Interview scheduling
    preferred_interview_date = models.DateField(blank=True, null=True)
    interview_duration_minutes = models.IntegerField(default=30)  # in minutes
    
    # Resume/Profile
    resume_uploaded = models.BooleanField(default=False)
    resume_url = models.URLField(blank=True, null=True)
    
    # Status tracking
    is_completed = models.BooleanField(default=False)
    interview_completion_date = models.DateTimeField(blank=True, null=True)
    interview_score = models.FloatField(blank=True, null=True)  # Score out of 100
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.job_role} ({self.interview_type})"
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'created_at']),
            models.Index(fields=['is_completed']),
        ]


class InterviewReport(models.Model):
    """
    Model to store interview analysis reports generated after interview completion.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='interview_reports')
    
    # Report data
    overall_score = models.IntegerField()  # 0-100
    duration = models.IntegerField()  # minutes
    question_count = models.IntegerField()
    response_count = models.IntegerField()
    tone_analysis = models.JSONField()  # { dominant_tone, confidence_score, sentiment, tone_tags[] }
    skill_scores = models.JSONField()  # { communication, response_quality, engagement, technical_depth/empathy_and_self_awareness }
    strengths = models.JSONField()  # array of strings
    improvements = models.JSONField()  # array of strings
    detailed_feedback = models.TextField()
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Interview Report - {self.user.username} - Score: {self.overall_score}"
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'created_at']),
            models.Index(fields=['overall_score']),
        ]
