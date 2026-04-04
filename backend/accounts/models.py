from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    """
    Custom User model with name, email, and age fields.
    Extends Django's AbstractUser.
    """
    name = models.CharField(max_length=255, blank=True, null=True)
    email = models.EmailField(unique=True)
    age = models.IntegerField(blank=True, null=True)
    profile_picture = models.URLField(max_length=500, blank=True, null=True)
    auth_provider = models.CharField(max_length=50, default='email')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name or self.username} ({self.email})"

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['username']),
        ]
