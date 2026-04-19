import os
import sys
import django
from unittest.mock import patch

# Setup Django environment first
backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend'))
sys.path.append(backend_path)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

# Now import Django/DRF modules
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.urls import reverse
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings

User = get_user_model()

@override_settings(ALLOWED_HOSTS=['testserver', 'localhost', '127.0.0.1'])
class APIIntegrationTests(APITestCase):
    """
    API Integration testing suite covering 13 core endpoints (API-01 to API-13)
    """

    def setUp(self):
        self.client = APIClient()
        self.test_user_data = {
            'username': 'api_user',
            'email': 'api@e.com',
            'password': 'Password123!',
            'confirm_password': 'Password123!'
        }
        self.user = User.objects.create_user(
            username='existing', email='exist@e.com', password='Password123!'
        )

    def test_api01_registration_valid(self):
        response = self.client.post(reverse('auth_register'), self.test_user_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_api02_registration_validation(self):
        bad_data = self.test_user_data.copy()
        bad_data['password'] = 'mismatch'
        response = self.client.post(reverse('auth_register'), bad_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_api03_login_jwt(self):
        response = self.client.post(reverse('token_obtain_pair'), {
            'username': 'exist@e.com', 'password': 'Password123!'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)

    def test_api04_login_invalid(self):
        response = self.client.post(reverse('token_obtain_pair'), {
            'username': 'exist@e.com', 'password': 'wrong'
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_api05_token_refresh(self):
        login_resp = self.client.post(reverse('token_obtain_pair'), {
            'username': 'exist@e.com', 'password': 'Password123!'
        })
        refresh_token = login_resp.data['refresh']
        response = self.client.post(reverse('token_refresh'), {'refresh': refresh_token})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)

    def test_api06_user_profile(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(reverse('auth_user'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], 'exist@e.com')

    def test_api07_ocr_extraction(self):
        self.client.force_authenticate(user=self.user)
        f = SimpleUploadedFile("r.pdf", b"content", "application/pdf")
        with patch('candidates.ocr_service.MistralOCRService.process_resume') as m:
            m.return_value = {"text": "Extracted Content"}
            response = self.client.post(reverse('ocr_extract'), {'file': f})
            self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_api08_ocr_invalid_file(self):
        self.client.force_authenticate(user=self.user)
        f = SimpleUploadedFile("b.exe", b"bad", "application/x-msdownload")
        response = self.client.post(reverse('ocr_extract'), {'file': f})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_api09_resume_analysis(self):
        self.client.force_authenticate(user=self.user)
        f = SimpleUploadedFile("r.pdf", b"c", "application/pdf")
        with patch('candidates.ocr_service.MistralOCRService.analyze_resume') as m:
            m.return_value = {"overall_score": 80, "strengths": ["S"]}
            response = self.client.post(reverse('resume_analysis'), {'file': f})
            self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_api10_recommendation(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.post(reverse('job_recommendations'), {'skills': 'Python'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_api11_interview_init(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.post(reverse('interview'), {'session_id': 's11'}, 'json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_api12_stt_conversion(self):
        self.client.force_authenticate(user=self.user)
        f = SimpleUploadedFile("a.wav", b"audio", "audio/wav")
        with patch('interview.views.requests.post') as m:
            from unittest.mock import MagicMock
            mock_resp = MagicMock(); mock_resp.status_code = 200; mock_resp.json.return_value = {"text": "Transcribed"}
            m.return_value = mock_resp
            response = self.client.post(reverse('interview-stt'), {'audio': f, 'session_id': 's12'})
            self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_api13_interview_analysis(self):
        self.client.force_authenticate(user=self.user)
        data = {'session_id': 's13', 'conversation': [{'role':'user', 'content':'hi'}]}
        response = self.client.post(reverse('interview-analyze'), data, 'json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

if __name__ == '__main__':
    import unittest
    unittest.main()
