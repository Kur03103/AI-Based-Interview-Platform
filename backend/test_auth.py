import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE','config.settings')
django.setup()
from django.contrib.auth import authenticate
print('auth result =', authenticate(username='testuser_new', password='MySecurePassword123!'))
