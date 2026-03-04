"""
Test file to verify PostgreSQL database connection and User model operations.
Run: python manage.py shell < test_db_connection.py
Or: python manage.py shell and paste commands
"""

import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from accounts.models import CustomUser
from django.db import connection
from django.db.utils import OperationalError

print("\n" + "=" * 60)
print("DATABASE CONNECTION TEST")
print("=" * 60)

# Test 1: Check Database Connection
print("\n[TEST 1] Testing PostgreSQL Connection...")
try:
    with connection.cursor() as cursor:
        cursor.execute("SELECT 1")
    print("✓ PostgreSQL connection successful!")
    print(f"✓ Database: {connection.settings_dict['NAME']}")
    print(f"✓ User: {connection.settings_dict['USER']}")
    print(f"✓ Host: {connection.settings_dict['HOST']}")
    print(f"✓ Port: {connection.settings_dict['PORT']}")
except OperationalError as e:
    print(f"✗ Connection failed: {e}")
    exit(1)

# Test 2: Check User Model
print("\n[TEST 2] Checking CustomUser Model...")
try:
    user_count = CustomUser.objects.count()
    print(f"✓ CustomUser model working! Total users: {user_count}")
except Exception as e:
    print(f"✗ Model error: {e}")
    exit(1)

# Test 3: Create a test user
print("\n[TEST 3] Creating test user...")
try:
    # Delete if exists
    CustomUser.objects.filter(username='testuser').delete()
    
    user = CustomUser.objects.create_user(
        username='testuser',
        email='test@example.com',
        password='testpass123',
        name='Test User',
        age=25
    )
    print(f"✓ User created successfully!")
    print(f"  - Username: {user.username}")
    print(f"  - Email: {user.email}")
    print(f"  - Name: {user.name}")
    print(f"  - Age: {user.age}")
    print(f"  - Created: {user.created_at}")
except Exception as e:
    print(f"✗ User creation failed: {e}")
    exit(1)

# Test 4: Query user
print("\n[TEST 4] Querying user from database...")
try:
    fetched_user = CustomUser.objects.get(username='testuser')
    print(f"✓ User retrieved successfully!")
    print(f"  - ID: {fetched_user.id}")
    print(f"  - Username: {fetched_user.username}")
    print(f"  - Email: {fetched_user.email}")
    print(f"  - Name: {fetched_user.name}")
    print(f"  - Age: {fetched_user.age}")
except Exception as e:
    print(f"✗ Query failed: {e}")
    exit(1)

# Test 5: Insert dummy data
print("\n[TEST 5] Inserting dummy data...")
try:
    dummy_users_data = [
        {
            'username': 'john_doe',
            'email': 'john@example.com',
            'password': 'password123',
            'name': 'John Doe',
            'age': 28
        },
        {
            'username': 'jane_smith',
            'email': 'jane@example.com',
            'password': 'password123',
            'name': 'Jane Smith',
            'age': 26
        },
        {
            'username': 'mike_jones',
            'email': 'mike@example.com',
            'password': 'password123',
            'name': 'Mike Jones',
            'age': 32
        },
    ]
    
    created_count = 0
    for user_data in dummy_users_data:
        # Delete if exists
        CustomUser.objects.filter(username=user_data['username']).delete()
        
        user = CustomUser.objects.create_user(
            username=user_data['username'],
            email=user_data['email'],
            password=user_data['password'],
            name=user_data['name'],
            age=user_data['age']
        )
        created_count += 1
    
    print(f"✓ {created_count} dummy users created successfully!")
except Exception as e:
    print(f"✗ Dummy data insertion failed: {e}")
    exit(1)

# Test 6: List all users
print("\n[TEST 6] Listing all users in database...")
try:
    all_users = CustomUser.objects.all()
    print(f"✓ Total users in database: {all_users.count()}")
    print("\nUser Details:")
    print("-" * 60)
    for user in all_users:
        print(f"  ID: {user.id}")
        print(f"  Username: {user.username}")
        print(f"  Email: {user.email}")
        print(f"  Name: {user.name}")
        print(f"  Age: {user.age}")
        print(f"  Created: {user.created_at}")
        print("-" * 60)
except Exception as e:
    print(f"✗ User listing failed: {e}")
    exit(1)

print("\n" + "=" * 60)
print("✓ ALL TESTS PASSED!")
print("=" * 60)
print("\nYour PostgreSQL database is configured correctly!")
print("=" * 60 + "\n")
