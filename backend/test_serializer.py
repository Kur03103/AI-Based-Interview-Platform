"""
Quick test of RegisterSerializer
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from accounts.serializers import RegisterSerializer

# Test 1: Valid registration data
test_data = {
    'username': 'testuser_new',
    'email': 'testuser@example.com',
    'name': 'Test User',
    'age': 25,
    'password': 'MySecurePassword123!',
    'confirm_password': 'MySecurePassword123!',
}

print("\nTesting RegisterSerializer...")
print(f"Test data: {test_data}")

serializer = RegisterSerializer(data=test_data)

if serializer.is_valid():
    print("✓ Serializer is VALID!")
    user = serializer.save()
    print(f"✓ User created: {user.username} ({user.email})")
    print(f"  - Name: {user.name}")
    print(f"  - Age: {user.age}")
else:
    print("✗ Serializer validation FAILED!")
    print(f"Errors: {serializer.errors}")
