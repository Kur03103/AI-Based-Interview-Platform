from django.db import models

# Create your models here.
class InterviewSession(models.Model):
    session_id = models.CharField(max_length=255, unique=True)
    history = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.session_id
