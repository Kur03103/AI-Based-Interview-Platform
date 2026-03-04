"""
DJANGO POSTGRESQL SETUP - COMPLETE GUIDE
==========================================

This guide shows all steps to set up Django with PostgreSQL.
"""

# ============================================================================
# STEP 1: INSTALL DEPENDENCIES
# ============================================================================
# Run in terminal:
# pip install -r requirements.txt

# Verify psycopg2 installation:
# python -c "import psycopg2; print('psycopg2 installed successfully')"


# ============================================================================
# STEP 2: ENVIRONMENT VARIABLES (.env file already configured)
# ============================================================================
# File: backend/.env
# Contains:
# - DB_ENGINE=django.db.backends.postgresql
# - DB_NAME=postgres
# - DB_USER=postgres
# - DB_PASSWORD=3103@Sapkota
# - DB_HOST=localhost
# - DB_PORT=5432


# ============================================================================
# STEP 3: SETTINGS.PY CONFIGURATION (Already Updated)
# ============================================================================
# File: config/settings.py
# Updated DATABASES configuration to use PostgreSQL with environment variables


# ============================================================================
# STEP 4: CREATE AND RUN MIGRATIONS
# ============================================================================
# In terminal, navigate to backend/ folder:

# 1. Create migrations for the updated User model
python manage.py makemigrations accounts

# 2. Apply migrations to PostgreSQL
python manage.py migrate

# 3. Verify migrations were applied
python manage.py showmigrations accounts
python manage.py showmigrations


# ============================================================================
# STEP 5: TEST DATABASE CONNECTION
# ============================================================================
# Option A: Run test file
python manage.py shell < test_db_connection.py

# Option B: Run tests in terminal
python test_db_connection.py

# Option C: Django shell commands (copy-paste one by one)
python manage.py shell

# Once in shell, paste these commands:
# ============================================================================

from accounts.models import CustomUser
from django.db import connection

# Test database connection
print("DATABASE INFO:")
print(connection.settings_dict)

# Create a test user
test_user = CustomUser.objects.create_user(
    username='testuser',
    email='test@example.com',
    password='testpass123',
    name='Test User',
    age=25
)
print(f"User created: {test_user}")

# Query user
user = CustomUser.objects.get(username='testuser')
print(f"User retrieved: {user.email}")

# ============================================================================
# STEP 6: INSERT DUMMY DATA via Django Shell
# ============================================================================
# Run: python manage.py shell
# Then copy-paste this code:

from accounts.models import CustomUser

# Insert multiple users
users_data = [
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
    {
        'username': 'sarah_wilson',
        'email': 'sarah@example.com',
        'password': 'password123',
        'name': 'Sarah Wilson',
        'age': 29
    },
]

for user_data in users_data:
    user = CustomUser.objects.create_user(
        username=user_data['username'],
        email=user_data['email'],
        password=user_data['password'],
        name=user_data['name'],
        age=user_data['age']
    )
    print(f"Created: {user.username} - {user.email}")

# View all users
all_users = CustomUser.objects.all()
for user in all_users:
    print(f"ID: {user.id}, Username: {user.username}, Email: {user.email}, Age: {user.age}")

# ============================================================================
# STEP 7: VERIFY DATA IN POSTGRESQL
# ============================================================================
# Connect to PostgreSQL directly:

# psql -U postgres -d postgres -h localhost

# Then run SQL queries:
\dt  -- List all tables

SELECT * FROM accounts_customuser;  -- List all users

SELECT COUNT(*) FROM accounts_customuser;  -- Count users

SELECT username, email, age FROM accounts_customuser;  -- View specific columns

# ============================================================================
# STEP 8: ADDITIONAL DJANGO COMMANDS
# ============================================================================
# Create superuser (admin account)
python manage.py createsuperuser

# Run development server
python manage.py runserver

# Access Django admin
# URL: http://localhost:8000/admin/
# Log in with superuser credentials
# Navigate to "Accounts > Custom users" to manage users

# Check database tables
python manage.py sqlmigrate accounts 0001_initial

# Run SQL directly
python manage.py dbshell

# ============================================================================
# TROUBLESHOOTING
# ============================================================================

# If you get "psycopg2: could not translate host name"
# - Check PostgreSQL is running
# - Verify DB_HOST in .env (should be 'localhost' or '127.0.0.1')
# - Check DB_PORT (usually 5432)

# If you get "FATAL: role "postgres" does not exist"
# - Make sure PostgreSQL username is correct in .env
# - Run: psql -U postgres

# If you get "database "postgres" does not exist"
# - Create the database: createdb -U postgres postgres
# - Or specify different DB_NAME in .env

# If migrations fail
# - Delete cached migration files
# - Run: python manage.py migrate --fake-initial

# ============================================================================
# PRODUCTION SAFETY CHECKLIST
# ============================================================================

# 1. ✓ Use environment variables for credentials
# 2. ✓ Add ATOMIC_REQUESTS=True in DATABASES (already done)
# 3. ✓ Add CONN_MAX_AGE for connection pooling (already done)
# 4. ✓ Use psycopg2-binary (already in requirements.txt)
# 5. ✓ Don't hardcode passwords
# 6. ✓ Set DEBUG=False in production
# 7. ✓ Use strong SECRET_KEY in production
# 8. ✓ Enable database backups
# 9. ✓ Use SSL for database connection (add in production)
# 10. ✓ Add database indexes (already added for email & username)

# ============================================================================
