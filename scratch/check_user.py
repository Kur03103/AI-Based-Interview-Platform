import os
import sys
import django

# Setup Django
backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), 'backend'))
sys.path.append(backend_path)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

# Check user 27
try:
    user = User.objects.get(id=27)
    print(f"User Found: {user.username}")
    print(f"Is Staff: {user.is_staff}")
    print(f"Is Superuser: {user.is_superuser}")
    print(f"Auth Provider: {user.auth_provider}")
except User.DoesNotExist:
    print("User with ID 27 not found.")
except Exception as e:
    print(f"Error: {e}")
