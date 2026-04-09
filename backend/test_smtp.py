import os
import django
from django.core.mail import send_mail
from django.conf import settings

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

def test_gmail_smtp(recipient):
    print(f"--- Gmail SMTP Test ---")
    print(f"Host: {settings.EMAIL_HOST}")
    print(f"Port: {settings.EMAIL_PORT}")
    print(f"User: {settings.EMAIL_HOST_USER}")
    print(f"TLS: {settings.EMAIL_USE_TLS}")
    print(f"-----------------------")
    
    try:
        subject = "Django SMTP Test Connection"
        message = "Congratulations! Your Django SMTP configuration is working perfectly."
        from_email = settings.DEFAULT_FROM_EMAIL
        
        print("Attempting to send email...")
        send_mail(subject, message, from_email, [recipient], fail_silently=False)
        print("SUCCESS: Email sent successfully!")
        
    except Exception as e:
        print(f"FAILURE: Email sending failed.")
        print(f"Error Details: {e}")
        if "535" in str(e):
            print("\nSUGGESTION: Error 535 usually means 'Bad Credentials'.")
            print("1. Ensure you are using a 16-character APP PASSWORD (not your normal password).")
            print("2. Ensure there are no spaces in the password in your .env file.")
            print("3. Ensure 2-Step Verification is enabled on your Google account.")

if __name__ == "__main__":
    email_to_test = input("Enter recipient email address: ")
    test_gmail_smtp(email_to_test)
