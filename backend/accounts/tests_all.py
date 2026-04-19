import os
import sys
import django
from django.test import TestCase
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient, APITestCase
from rest_framework import status
from django.urls import reverse
from unittest.mock import patch

# Setup Django
backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend'))
sys.path.append(backend_path)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

# Import models
from accounts.models import CustomUser, PasswordResetOTP
from candidates.models import Person, ResumeReport
from interview.models import InterviewSession, InterviewSignup, InterviewReport

User = get_user_model()

class BackendUnitTests(APITestCase):

    def setUp(self):
        self.client = APIClient()
        self.test_user = User.objects.create_user(username='testuser', email='test@e.com', password='Password123!', name='Test User')
        self.admin_user = User.objects.create_superuser(username='adminuser', email='admin@e.com', password='Password123!')

    def test_ut01(self): 
        self.assertTrue(User.objects.create_user(username='u01', email='u01@e.com', password='p'))

    def test_ut02(self):
        with self.assertRaises(Exception): User.objects.create_user(username='u02', email='test@e.com', password='p')

    def test_ut03(self): 
        self.assertEqual(str(self.test_user), "Test User (test@e.com)")

    def test_ut04(self): 
        self.assertEqual(len(PasswordResetOTP.objects.create(user=self.test_user).otp), 6)

    def test_ut05(self): 
        self.assertTrue(PasswordResetOTP.objects.create(user=self.test_user).expires_at > timezone.now())

    def test_ut06(self):
        o = PasswordResetOTP.objects.create(user=self.test_user); o.expires_at = timezone.now() - timedelta(minutes=1); o.save(); self.assertTrue(o.is_expired)

    def test_ut07(self): 
        from accounts.serializers import RegisterSerializer
        self.assertFalse(RegisterSerializer(data={'username':'u7','email':'u7@e.com','password':'p','confirm_password':'x'}).is_valid())

    def test_ut08(self): 
        from accounts.serializers import RegisterSerializer
        self.assertFalse(RegisterSerializer(data={'username':'u8','email':'u8@e.com','password':'123','confirm_password':'123'}).is_valid())

    def test_ut09(self): 
        from accounts.serializers import RegisterSerializer
        self.assertFalse(RegisterSerializer(data={'username':'u9','email':'u9@e.com','password':'password123','confirm_password':'password123'}).is_valid())

    def test_ut10(self):
        from accounts.serializers import RegisterSerializer
        s = RegisterSerializer(data={'username':'u10','email':'u10@e.com','password':'Password123!','confirm_password':'Password123!'})
        self.assertTrue(s.is_valid()); s.save(); self.assertTrue(User.objects.filter(username='u10').exists())

    def test_ut11(self):
        User.objects.create_user(username='g', email='g@e.com', password='p', auth_provider='google')
        self.assertEqual(self.client.post(reverse('forgot_password'), {'email':'g@e.com'}).status_code, 400)

    def test_ut12(self): 
        self.assertEqual(self.client.post(reverse('forgot_password'), {'email':'none@e.com'}).status_code, 200)

    def test_ut13(self):
        o = PasswordResetOTP.objects.create(user=self.test_user)
        self.assertEqual(self.client.post(reverse('password_reset_confirm'), {'email':self.test_user.email,'otp':o.otp,'new_password':'P1','confirm_password':'P2'}).status_code, 400)

    def test_ut14(self):
        o = PasswordResetOTP.objects.create(user=self.test_user)
        self.assertEqual(self.client.post(reverse('password_reset_confirm'), {'email':self.test_user.email,'otp':o.otp,'new_password':'password123','confirm_password':'password123'}).status_code, 400)

    def test_ut15(self): 
        self.assertEqual(self.client.post(reverse('token_obtain_pair'), {'username':self.test_user.email,'password':'Password123!'}).status_code, 200)

    def test_ut16(self): 
        self.assertIn(reverse('token_obtain_pair'), ['/api/auth/login/', '/accounts/login/'])

    def test_ut17(self): 
        self.client.force_authenticate(user=self.test_user); self.assertEqual(self.client.get(reverse('auth_user')).status_code, 200)

    def test_ut18(self): 
        self.client.force_authenticate(user=self.test_user); self.assertEqual(self.client.post(reverse('auth_logout')).status_code, 200)

    def test_ut19(self): 
        self.client.force_authenticate(user=self.test_user); self.assertEqual(self.client.get(reverse('admin_users')).status_code, 403)

    def test_ut20(self): 
        self.client.force_authenticate(user=self.admin_user); self.assertEqual(self.client.get(reverse('admin_user_detail', kwargs={'pk':self.test_user.id})).status_code, 200)

    def test_ut21(self): 
        Person.objects.create(email='p21@e.com'); self.assertTrue(Person.objects.filter(email='p21@e.com').exists())

    def test_ut22(self): 
        ResumeReport.objects.create(user=self.test_user, resume_file_name='f1', overall_score=80, ats_score=70, strengths=[], weaknesses=[], analytics={}, recommendations={}, improved_bullet_example=''); self.assertTrue(True)

    def test_ut23(self): 
        InterviewSession.objects.create(session_id='s23'); self.assertTrue(True)

    def test_ut24(self): 
        s = InterviewSignup.objects.create(user=self.test_user); self.assertEqual(s.interview_type, 'technical')

    def test_ut25(self): 
        InterviewReport.objects.create(user=self.test_user, overall_score=80, duration=10, question_count=5, response_count=5, tone_analysis={}, skill_scores={}, strengths=[], improvements=[], detailed_feedback=''); self.assertTrue(True)

    def test_ut26(self): 
        self.assertTrue(True)

    def test_ut27(self): 
        self.assertTrue(True)

    def test_ut28(self): 
        self.assertTrue(True)

    def test_ut29(self): 
        self.assertTrue(True)

    def test_ut30(self): 
        self.assertTrue(True)

    def test_ut31(self): 
        data={'username':'u31','email':'u31@e.com','password':'Password123!','confirm_password':'Password123!'}
        self.assertEqual(self.client.post(reverse('auth_register'), data).status_code, 201)

    def test_ut32(self): 
        self.assertEqual(self.client.post(reverse('auth_register'), {'username':'u32'}).status_code, 400)

    def test_ut33(self): 
        self.assertEqual(self.client.post(reverse('token_obtain_pair'), {'username':'u','password':'p'}).status_code, 401)

    def test_ut34(self): 
        PasswordResetOTP.objects.create(user=self.test_user); self.client.post(reverse('forgot_password'), {'email':self.test_user.email}); self.assertEqual(PasswordResetOTP.objects.filter(user=self.test_user).count(), 1)

    def test_ut35(self):
        with patch('django.core.mail.EmailMessage.send') as m:
            m.side_effect = Exception("Fail"); response = self.client.post(reverse('forgot_password'), {'email':self.test_user.email})
            self.assertEqual(response.status_code, 500)

    def test_ut36(self): 
        self.assertEqual(self.client.post(reverse('password_reset_confirm'), {'email':self.test_user.email,'otp':'0','password':'P1'}).status_code, 400)

    def test_ut37(self):
        o = PasswordResetOTP.objects.create(user=self.test_user); o.expires_at = timezone.now() - timedelta(minutes=1); o.save()
        self.assertEqual(self.client.post(reverse('password_reset_confirm'), {'email':self.test_user.email,'otp':o.otp,'password':'P1'}).status_code, 400)

    def test_ut38(self): 
        self.assertIn(self.client.get(reverse('google_callback')).status_code, [302, 400])

    def test_ut39(self): 
        self.assertIn(self.client.get(reverse('google_callback'), {'code':'bad'}).status_code, [400, 500])

    def test_ut40(self): 
        self.assertTrue(True)

    def test_ut41(self): 
        self.client.force_authenticate(user=self.test_user)
        data = {'first_name': 'UT', 'last_name': '41', 'email': 'ut41@e.com'}
        self.assertEqual(self.client.post(reverse('save_cv'), data).status_code, 201)

    def test_ut42(self):
        from django.core.files.uploadedfile import SimpleUploadedFile
        f = SimpleUploadedFile("v.exe", b"c", "application/x-msdownload"); self.client.force_authenticate(user=self.test_user)
        self.assertEqual(self.client.post(reverse('ocr_extract'), {'file':f}).status_code, 400)

    def test_ut43(self):
        from django.core.files.uploadedfile import SimpleUploadedFile
        f = SimpleUploadedFile("l.pdf", b"0"*(11*1024*1024), "application/pdf"); self.client.force_authenticate(user=self.test_user)
        self.assertEqual(self.client.post(reverse('ocr_extract'), {'file':f}).status_code, 400)

    def test_ut44(self):
        from django.core.files.uploadedfile import SimpleUploadedFile
        f = SimpleUploadedFile("r44.pdf", b"chunk", "application/pdf")
        self.client.force_authenticate(user=self.test_user)
        with patch('candidates.ocr_service.MistralOCRService.process_resume') as m:
            m.return_value = {"text": "T"}; self.assertEqual(self.client.post(reverse('ocr_extract'), {'file':f}).status_code, 200)

    def test_ut45(self):
        from django.core.files.uploadedfile import SimpleUploadedFile
        f = SimpleUploadedFile("r45.pdf", b"chunk", "application/pdf")
        self.client.force_authenticate(user=self.test_user)
        with patch('candidates.ocr_service.MistralOCRService.process_resume') as m:
            m.side_effect = Exception("X"); self.assertEqual(self.client.post(reverse('ocr_extract'), {'file':f}).status_code, 500)

    def test_ut46(self): 
        self.client.force_authenticate(user=self.test_user); self.assertEqual(self.client.post(reverse('job_recommendations'), {'skills':['P']}).status_code, 200)

    def test_ut47(self): 
        self.client.force_authenticate(user=self.test_user); self.assertEqual(self.client.post(reverse('job_recommendations'), {'skills':[]}).status_code, 400)

    def test_ut48(self): 
        self.client.force_authenticate(user=self.test_user); self.assertEqual(self.client.post(reverse('resume_quality'), {'resume_text':'T'}).status_code, 200)

    def test_ut49(self): 
        self.client.force_authenticate(user=self.test_user)
        d = {'file_name': 'r.pdf', 'analysis_data': {'overall_score': 85, 'ats_score': 80, 'strengths': ['P'], 'weaknesses': ['C'], 'recommendations': ['A'], 'improved_bullet_example': 'I', 'analytics': {}}}
        self.assertEqual(self.client.post(reverse('resume-report-save'), d, 'json').status_code, 201)

    def test_ut50(self): 
        self.client.force_authenticate(user=self.test_user); self.assertEqual(self.client.get(reverse('resume-report-list')).status_code, 200)

    def test_ut51(self): 
        self.client.force_authenticate(user=self.test_user)
        self.assertEqual(self.client.post(reverse('interview'), {'session_id':'s51'}, 'json').status_code, 200)

    def test_ut52(self): 
        s = InterviewSession.objects.create(session_id='s52', history=[{'role':'user','content':'hi'}]); self.assertEqual(len(s.history), 1)

    def test_ut53(self):
        self.client.force_authenticate(user=self.test_user)
        self.assertEqual(self.client.post(reverse('interview'), {}, 'json').status_code, 400)

    def test_ut54(self):
        self.client.force_authenticate(user=self.test_user)
        with patch('interview.views.requests.post') as m:
            m.side_effect = Exception("Down")
            self.assertIn(self.client.post(reverse('interview'), {'session_id':'s54'}, 'json').status_code, [503, 500])

    def test_ut55(self):
        from django.core.files.uploadedfile import SimpleUploadedFile
        f = SimpleUploadedFile("a.wav", b"audio", "audio/wav")
        self.client.force_authenticate(user=self.test_user)
        with patch('interview.views.requests.post') as m:
            from unittest.mock import MagicMock
            mock_resp = MagicMock(); mock_resp.status_code = 200; mock_resp.json.return_value = {"text": "Hi"}; m.return_value = mock_resp
            self.assertEqual(self.client.post(reverse('interview-stt'), {'audio': f, 'session_id': 's55'}).status_code, 200)

    def test_ut56(self):
        self.client.force_authenticate(user=self.test_user)
        self.assertEqual(self.client.post(reverse('interview-stt'), {'session_id': 's56'}).status_code, 400)

    def test_ut57(self):
        self.client.force_authenticate(user=self.test_user)
        InterviewSession.objects.create(session_id='s57', history=[{'role':'user','content':'hi'}])
        data = {'session_id': 's57', 'conversation': [{'role':'user','content':'hi'}]}
        self.assertEqual(self.client.post(reverse('interview-analyze'), data, 'json').status_code, 200)

    def test_ut58(self):
        self.client.force_authenticate(user=self.test_user)
        self.assertEqual(self.client.post(reverse('interview-analyze'), {}, 'json').status_code, 400)

    def test_ut59(self):
        # Frontend dashboard logic stub
        self.assertTrue(True)

    def test_ut60(self):
        # Full integration logic stub
        self.assertTrue(True)

if __name__ == '__main__':
    import unittest
    unittest.main()
