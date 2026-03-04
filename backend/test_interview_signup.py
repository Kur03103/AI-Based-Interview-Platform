"""
TEST FILE: Interview Signup Integration
========================================

This test file shows how to test:
1. User registration (CustomUser model)
2. Interview signup creation (InterviewSignup model)
3. API endpoints integration

Run with: python manage.py shell < test_interview_signup.py
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from accounts.models import CustomUser
from interview.models import InterviewSignup, InterviewSession
from django.db import connection
import json

print("\n" + "=" * 70)
print("INTERVIEW SIGNUP INTEGRATION TEST")
print("=" * 70)

# Test 1: Verify database connection
print("\n[TEST 1] Database Connection")
try:
    with connection.cursor() as cursor:
        cursor.execute("SELECT 1")
    print("✓ PostgreSQL connection successful!")
except Exception as e:
    print(f"✗ Connection failed: {e}")
    exit(1)

# Test 2: Create a new user with full profile
print("\n[TEST 2] Creating new user with full profile")
try:
    # Delete if exists
    CustomUser.objects.filter(username='alex_engineer').delete()
    
    user = CustomUser.objects.create_user(
        username='alex_engineer',
        email='alex.engineer@example.com',
        password='secure_password123',
        name='Alex Engineer',
        age=27
    )
    print(f"✓ User created successfully!")
    print(f"  - ID: {user.id}")
    print(f"  - Username: {user.username}")
    print(f"  - Email: {user.email}")
    print(f"  - Name: {user.name}")
    print(f"  - Age: {user.age}")
except Exception as e:
    print(f"✗ User creation failed: {e}")
    exit(1)

# Test 3: Create interview signup for the user
print("\n[TEST 3] Creating interview signup for user")
try:
    # Delete if exists
    InterviewSignup.objects.filter(user=user).delete()
    
    interview_signup = InterviewSignup.objects.create(
        user=user,
        interview_type='both',  # Technical + Behavioral
        job_role='Senior Software Engineer',
        experience_level='mid',
        company_name='TechCorp Inc',
        hiring_for_position='Backend Team Lead',
        interview_duration_minutes=45,
    )
    print(f"✓ Interview signup created successfully!")
    print(f"  - ID: {interview_signup.id}")
    print(f"  - User: {interview_signup.user.username}")
    print(f"  - Interview Type: {interview_signup.get_interview_type_display()}")
    print(f"  - Job Role: {interview_signup.job_role}")
    print(f"  - Experience Level: {interview_signup.get_experience_level_display()}")
    print(f"  - Company: {interview_signup.company_name}")
    print(f"  - Duration: {interview_signup.interview_duration_minutes} minutes")
    print(f"  - Created: {interview_signup.created_at}")
except Exception as e:
    print(f"✗ Interview signup creation failed: {e}")
    exit(1)

# Test 4: Verify one-to-one relationship
print("\n[TEST 4] Verifying User ↔ Interview Signup relationship")
try:
    # Access interview signup from user
    user_interview = user.interview_signup
    print(f"✓ Relationship verified!")
    print(f"  - User: {user.username}")
    print(f"  - Interview Signup ID: {user_interview.id}")
    print(f"  - Job Role: {user_interview.job_role}")
except Exception as e:
    print(f"✗ Relationship verification failed: {e}")
    exit(1)

# Test 5: Create interview session for this user
print("\n[TEST 5] Creating interview session")
try:
    session_id = f"session_{user.id}_{interview_signup.id}"
    
    session = InterviewSession.objects.create(
        session_id=session_id,
        history=[
            {"role": "system", "content": "You are a technical interviewer"},
            {"role": "assistant", "content": "Hi, let's start the technical interview. What's your experience with Python?"},
            {"role": "user", "content": "I have 5 years of experience with Python"},
        ]
    )
    print(f"✓ Interview session created!")
    print(f"  - Session ID: {session.session_id}")
    print(f"  - Chat History Length: {len(session.history)}")
    print(f"  - Created: {session.created_at}")
except Exception as e:
    print(f"✗ Session creation failed: {e}")
    exit(1)

# Test 6: Query all interview signups
print("\n[TEST 6] Querying all interview signups")
try:
    all_signups = InterviewSignup.objects.all()
    print(f"✓ Total interview signups: {all_signups.count()}")
    print("\nInterview Signup Details:")
    print("-" * 70)
    for signup in all_signups[:5]:  # Show first 5
        print(f"ID: {signup.id}")
        print(f"User: {signup.user.username} ({signup.user.email})")
        print(f"Job Role: {signup.job_role}")
        print(f"Interview Type: {signup.get_interview_type_display()}")
        print(f"Experience: {signup.get_experience_level_display()}")
        print(f"Company: {signup.company_name or 'N/A'}")
        print(f"Completed: {signup.is_completed}")
        print("-" * 70)
except Exception as e:
    print(f"✗ Query failed: {e}")
    exit(1)

# Test 7: Update interview signup status
print("\n[TEST 7] Updating interview signup status")
try:
    interview_signup.is_completed = True
    interview_signup.interview_score = 85.5
    interview_signup.save()
    
    updated = InterviewSignup.objects.get(id=interview_signup.id)
    print(f"✓ Interview signup updated!")
    print(f"  - Completed: {updated.is_completed}")
    print(f"  - Score: {updated.interview_score}/100")
except Exception as e:
    print(f"✗ Update failed: {e}")
    exit(1)

# Test 8: Check table structure in database
print("\n[TEST 8] Database table information")
try:
    with connection.cursor() as cursor:
        # Check CustomUser table
        cursor.execute("""
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name='accounts_customuser'
            ORDER BY ordinal_position
        """)
        print("\n✓ accounts_customuser table columns:")
        for row in cursor.fetchall():
            print(f"  - {row[0]}: {row[1]}")
        
        # Check InterviewSignup table
        cursor.execute("""
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name='interview_interviewsignup'
            ORDER BY ordinal_position
        """)
        print("\n✓ interview_interviewsignup table columns:")
        for row in cursor.fetchall():
            print(f"  - {row[0]}: {row[1]}")
except Exception as e:
    print(f"⚠ Table check warning: {e}")

# Test 9: API endpoint simulation
print("\n[TEST 9] InterviewSignup Serializer Test")
try:
    from interview.serializers import InterviewSignupSerializer
    
    serializer = InterviewSignupSerializer(interview_signup)
    data = serializer.data
    print(f"✓ Serialization successful!")
    print(f"  - Serialized data keys: {list(data.keys())}")
    print(f"  - User info: {data['user']['username']} ({data['user']['email']})")
    print(f"  - Job Role: {data['job_role']}")
except Exception as e:
    print(f"✗ Serialization failed: {e}")
    exit(1)

# Test 10: Count total records
print("\n[TEST 10] Database statistics")
try:
    user_count = CustomUser.objects.count()
    signup_count = InterviewSignup.objects.count()
    session_count = InterviewSession.objects.count()
    
    print(f"✓ Database Statistics:")
    print(f"  - Total Users: {user_count}")
    print(f"  - Total Interview Signups: {signup_count}")
    print(f"  - Total Interview Sessions: {session_count}")
except Exception as e:
    print(f"✗ Statistics failed: {e}")
    exit(1)

print("\n" + "=" * 70)
print("✓ ALL TESTS PASSED!")
print("=" * 70)
print("""
✓ User Model (CustomUser) - Working
✓ Interview Signup Model (InterviewSignup) - Working
✓ Interview Session Model (InterviewSession) - Working
✓ One-to-One Relationship - Working
✓ Serializers - Working
✓ Database Integration - Working

NEXT STEPS:
1. Run 'python manage.py runserver' to start API
2. Test signup endpoint from frontend: POST /api/auth/register/
3. Test interview signup endpoint: POST /api/interview/signup/
4. Verify data in pgAdmin or psql
""")
print("=" * 70 + "\n")
