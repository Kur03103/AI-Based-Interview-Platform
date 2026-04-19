# AI Interview Platform - Master API Test Guide (UT-01 to UT-60)

---

# 1 User Model Creation
- **Action:** Register new user.
```powershell
curl.exe -X POST http://localhost:8000/api/auth/register/ -H "Content-Type: application/json" -d '{ "username": "u01", "email": "u01@e.com", "password": "Password123!", "confirm_password": "Password123!" }'
```

# 2 Unique Email Constraint
- **Action:** Register with existing email.
```powershell
curl.exe -X POST http://localhost:8000/api/auth/register/ -H "Content-Type: application/json" -d '{ "username": "u02", "email": "u01@e.com", "password": "Password123!", "confirm_password": "Password123!" }'
```

# 3 User String Representation
- **Action:** Fetch profile via API.
```powershell
curl.exe -X GET http://localhost:8000/api/auth/user/ -H "Authorization: Bearer <TOKEN>"
```

# 4 OTP Generation Logic
- **Action:** Request forgot password.
```powershell
curl.exe -X POST http://localhost:8000/api/auth/forgot-password/ -H "Content-Type: application/json" -d '{ "email": "u01@e.com" }'
```

# 5 OTP Expiry Calculation
- **Action:** Verify OTP lifespan.
```powershell
# Check database: select expires_at from accounts_passwordresetotp;
```

# 6 OTP expired Property logic
- **Action:** Attempt reset with expired code.
```powershell
curl.exe -X POST http://localhost:8000/api/auth/password-reset-confirm/ -d '{ "email": "u01@e.com", "otp": "EXPIRED_CODE", "password": "Password123!" }'
```

# 7 Registration Password Mismatch
- **Action:** Register with mismatch.
```powershell
curl.exe -X POST http://localhost:8000/api/auth/register/ -d '{ "username": "u07", "password": "p1", "confirm_password": "p2" }'
```

# 8 Password Min Length validation
- **Action:** Register with short password.
```powershell
curl.exe -X POST http://localhost:8000/api/auth/register/ -d '{ "username": "u08", "password": "123", "confirm_password": "123" }'
```

# 9 Password Complexity validation
- **Action:** Register with simple letters only.
```powershell
curl.exe -X POST http://localhost:8000/api/auth/register/ -d '{ "username": "u09", "password": "password", "confirm_password": "password" }'
```

# 10 Register Serializer Save logic
- **Action:** Valid registration.
```powershell
curl.exe -X POST http://localhost:8000/api/auth/register/ -d '{ "username": "u10", "email": "u10@e.com", "password": "Password123!", "confirm_password": "Password123!" }'
```

# 11 Block Google Reset requests
- **Action:** Forgot password for google user.
```powershell
curl.exe -X POST http://localhost:8000/api/auth/forgot-password/ -d '{ "email": "google_test@e.com" }'
```

# 12 Generic Forgot Password Response
- **Action:** Request for missing email.
```powershell
curl.exe -X POST http://localhost:8000/api/auth/forgot-password/ -d '{ "email": "missing@e.com" }'
```

# 13 Reset Confirmation Mismatch
- **Action:** Confirm reset with mismatch.
```powershell
curl.exe -X POST http://localhost:8000/api/auth/password-reset-confirm/ -d '{ "otp": "123456", "password": "p1", "confirm_password": "p2" }'
```

# 14 Reset Confirmation Strength
- **Action:** Confirm reset with weak password.
```powershell
curl.exe -X POST http://localhost:8000/api/auth/password-reset-confirm/ -d '{ "otp": "123456", "password": "bad" }'
```

# 15 Login (Email/Username)
- **Action:** Authenticate with valid creds.
```powershell
curl.exe -X POST http://localhost:8000/api/auth/login/ -H "Content-Type: application/json" -d '{ "username": "u01@e.com", "password": "Password123!" }'
```

# 16 Login URL Routing logic
- **Action:** Verify path mapping.
```powershell
curl.exe -I http://localhost:8000/api/auth/login/
```

# 17 Profile Retrieval Test
- **Action:** GET user profile.
```powershell
curl.exe -X GET http://localhost:8000/api/auth/user/ -H "Authorization: Bearer <TOKEN>"
```

# 18 Secure Logout API
- **Action:** POST logout.
```powershell
curl.exe -X POST http://localhost:8000/api/auth/logout/ -H "Authorization: Bearer <TOKEN>"
```

# 19 Admin access restriction
- **Action:** GET all users as non-admin.
```powershell
curl.exe -X GET http://localhost:8000/api/auth/admin/users/ -H "Authorization: Bearer <USER_TOKEN>"
```

# 20 Admin Detail access
- **Action:** GET user detail as admin.
```powershell
curl.exe -X GET http://localhost:8000/api/auth/admin/users/1/ -H "Authorization: Bearer <ADMIN_TOKEN>"
```

# 21 Person Model Uniqueness
- **Action:** POST duplicate person email.
```powershell
curl.exe -X POST http://localhost:8000/api/candidates/save/ -d '{ "email": "dup@e.com", "first_name": "T" }'
```

# 22 Resume Report Persistence
- **Action:** GET report history.
```powershell
curl.exe -X GET http://localhost:8000/api/candidates/reports/ -H "Authorization: Bearer <TOKEN>"
```

# 23 Session ID Uniqueness
- **Action:** POST session with existing ID.
```powershell
curl.exe -X POST http://localhost:8000/api/interview/ -d '{ "session_id": "existing_id" }'
```

# 24 Interview Signup Defaults
- **Action:** POST signup with no type.
```powershell
curl.exe -X POST http://localhost:8000/api/interview/signup/ -H "Authorization: Bearer <TOKEN>" -d '{ "job_role": "Dev" }'
```

# 25 Interview Report persistence
- **Action:** GET interview reports.
```powershell
curl.exe -X GET http://localhost:8000/api/interview/reports/ -H "Authorization: Bearer <TOKEN>"
```

# 26 Dashboard Theme Loading
**Manual:** Set `theme: dark` in storage and refresh.

# 27 Dashboard Theme Toggling
**Manual:** Click toggle and check LocalStorage.

# 28 Dashboard Access Control
- **Action:** GET dashboard route without token.
```powershell
curl.exe -I http://localhost:8000/api/auth/user/
```

# 29 Axios Token Interceptor
**Manual:** Verify headers in Network tab.

# 30 Token Auto-Refresh
- **Action:** POST refresh token.
```powershell
curl.exe -X POST http://localhost:8000/api/auth/token/refresh/ -d '{ "refresh": "<REFRESH_TOKEN>" }'
```

# 31 Register API (Valid)
```powershell
curl.exe -X POST http://localhost:8000/api/auth/register/ -d '{ "username": "u31", "email": "u31@e.com", "password": "Password123!", "confirm_password": "Password123!" }'
```

# 32 Register API (Invalid)
```powershell
curl.exe -X POST http://localhost:8000/api/auth/register/ -d '{ "username": "bad" }'
```

# 33 Login API (Invalid)
```powershell
curl.exe -X POST http://localhost:8000/api/auth/login/ -d '{ "username": "u31", "password": "bad" }'
```

# 34 OTP Cleanup Logic
- **Action:** Check DB count after multiple requests.

# 35 SMTP Failure Stability
- **Action:** (Mocked) Trigger error and check 500 response.

# 36 Reset Password (Invalid Code)
```powershell
curl.exe -X POST http://localhost:8000/api/auth/password-reset-confirm/ -d '{ "otp": "000", "password": "P1" }'
```

# 37 Reset Password (Expired)
- **Action:** Wait 6 mins then attempt confirm.

# 38 Google Auth Callback (No Code)
```powershell
curl.exe -X GET http://localhost:8000/api/auth/google/login/callback/
```

# 39 Google Auth Callback (Bad Code)
```powershell
curl.exe -X GET http://localhost:8000/api/auth/google/login/callback/?code=bad
```

# 40 Logout Clearing (Frontend)
**Manual:** Click Logout -> Check storage empty.

# 41 Resume Upload (PDF)
```powershell
curl.exe -X POST http://localhost:8000/api/candidates/save/ -H "Authorization: Bearer <TOKEN>" -F "resume=@r.pdf" -F "email=t@e.com"
```

# 42 Reject Invalid File formats
```powershell
curl.exe -X POST http://localhost:8000/api/candidates/save/ -F "resume=@bad.exe"
```

# 43 Resume size limits (10MB)
```powershell
curl.exe -X POST http://localhost:8000/api/candidates/save/ -F "resume=@big.pdf"
```

# 44 OCR Extraction logic
```powershell
curl.exe -X POST http://localhost:8000/api/candidates/ocr/extract/ -H "Authorization: Bearer <TOKEN>" -F "file=@r.pdf"
```

# 45 OCR config missing
- **Action:** Simualte error response via API.

# 46 Job recommendations
```powershell
curl.exe -X POST http://localhost:8000/api/candidates/recommendations/ -d '{ "skills": "Python" }'
```

# 47 Recommendation empty input
```powershell
curl.exe -X POST http://localhost:8000/api/candidates/recommendations/ -d '{ "skills": "" }'
```

# 48 Resume quality analysis
```powershell
curl.exe -X POST http://localhost:8000/api/candidates/quality/ -d '{ "resume_text": "text" }'
```

# 49 Report Saving logic
```powershell
curl.exe -X POST http://localhost:8000/api/candidates/reports/save/ -H "Authorization: Bearer <TOKEN>" -d '{ "analysis_data": { "overall_score": 85, ... } }'
```

# 50 Report Listing
```powershell
curl.exe -X GET http://localhost:8000/api/candidates/reports/
```

# 51 Interview Session Init
```powershell
curl.exe -X POST http://localhost:8000/api/interview/ -d '{ "session_id": "s51" }'
```

# 52 Interview History Storage
- **Action:** Check database JSON field for sessionId s51.

# 53 Missing Session ID
```powershell
curl.exe -X POST http://localhost:8000/api/interview/ -d '{}'
```

# 54 AI Service Down
- **Action:** Trigger mock service failure -> check 500.

# 55 STT valid audio
```powershell
curl.exe -X POST http://localhost:8000/api/interview/stt/ -F "audio=@a.wav" -F "session_id=s55"
```

# 56 STT Missing Audio
```powershell
curl.exe -X POST http://localhost:8000/api/interview/stt/ -F "session_id=s56"
```

# 57 Interview Analysis structured
```powershell
curl.exe -X POST http://localhost:8000/api/interview/analyze/ -d '{ "session_id": "s57", "conversation": [] }'
```

# 58 Interview analysis missing input
```powershell
curl.exe -X POST http://localhost:8000/api/interview/analyze/ -d '{}'
```

# 59 Dashboard Navigation
**Manual:** Click Profile -> Check `/dashboard/profile`.

# 60 Module Integration
**Manual:** Upload -> Analyze -> Interview -> View Report.
