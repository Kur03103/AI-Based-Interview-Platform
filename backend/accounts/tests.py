from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from .models import CustomUser, PasswordResetOTP

class ForgotPasswordTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.email_user = CustomUser.objects.create_user(
            username='emailuser', 
            email='email@example.com', 
            password='Password123!',
            auth_provider='email'
        )
        self.google_user = CustomUser.objects.create_user(
            username='googleuser', 
            email='google@example.com', 
            password='Password123!',
            auth_provider='google'
        )

    def test_forgot_password_google_user_fails(self):
        url = reverse('forgot_password')
        response = self.client.post(url, {'email': 'google@example.com'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Password reset is not available for Google sign-in accounts.', str(response.data))

    def test_forgot_password_email_user_generates_otp(self):
        url = reverse('forgot_password')
        response = self.client.post(url, {'email': 'email@example.com'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(PasswordResetOTP.objects.filter(user=self.email_user).exists())

    def test_password_reset_confirm_success(self):
        # 1. Request OTP
        self.client.post(reverse('forgot_password'), {'email': 'email@example.com'})
        otp_obj = PasswordResetOTP.objects.get(user=self.email_user)
        
        # 2. Confirm Reset
        url = reverse('password_reset_confirm')
        data = {
            'email': 'email@example.com',
            'otp': otp_obj.otp,
            'new_password': 'NewPassword123!',
            'confirm_password': 'NewPassword123!'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # 3. Verify Login with new password
        login_url = reverse('token_obtain_pair')
        login_response = self.client.post(login_url, {'username': 'emailuser', 'password': 'NewPassword123!'})
        self.assertEqual(login_response.status_code, status.HTTP_200_OK)
