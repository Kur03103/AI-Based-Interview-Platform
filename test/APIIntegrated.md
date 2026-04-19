# AI Interview Platform - Master API Integration Guide (API-01 to API-13)

---

## 🔐 Authentication API Testing

### Test Case: API-01
| Field | Description |
|---|---|
| **Test ID** | API-01 |
| **Objective** | Verify user registration API handles valid input data |
| **Action** | Send POST request with valid credentials |
| **Expected Result** | User account created |
| **CURL Command** | `curl.exe -X POST http://localhost:8000/api/auth/register/ -d '{ "username": "api01", "email": "api01@e.com", "password": "Password123!", "confirm_password": "Password123!" }' -H "Content-Type: application/json"` |
| **Conclusion** | **Pass** |

### Test Case: API-02
| Field | Description |
|---|---|
| **Test ID** | API-02 |
| **Objective** | Verify registration API enforces validation rules |
| **Action** | Send POST request with mismatched passwords |
| **Expected Result** | Validation error returned |
| **CURL Command** | `curl.exe -X POST http://localhost:8000/api/auth/register/ -d '{ "username": "api02", "password": "p1", "confirm_password": "p2" }' -H "Content-Type: application/json"` |
| **Conclusion** | **Pass** |

### Test Case: API-03
| Field | Description |
|---|---|
| **Test ID** | API-03 |
| **Objective** | Verify login API generates JWT tokens |
| **Action** | Send POST request with valid credentials |
| **Expected Result** | Access and refresh tokens returned |
| **CURL Command** | `curl.exe -X POST http://localhost:8000/api/auth/login/ -d '{ "username": "api01@e.com", "password": "Password123!" }' -H "Content-Type: application/json"` |
| **Conclusion** | **Pass** |

### Test Case: API-04
| Field | Description |
|---|---|
| **Test ID** | API-04 |
| **Objective** | Verify secure handling of invalid credentials |
| **Action** | Send POST request with incorrect password |
| **Expected Result** | 401 Unauthorized error returned |
| **CURL Command** | `curl.exe -X POST http://localhost:8000/api/auth/login/ -d '{ "username": "api01@e.com", "password": "wrong" }' -H "Content-Type: application/json"` |
| **Conclusion** | **Pass** |

### Test Case: API-05
| Field | Description |
|---|---|
| **Test ID** | API-05 |
| **Objective** | Verify token refresh generates new access token |
| **Action** | Send POST request with valid refresh token |
| **Expected Result** | New access token returned |
| **CURL Command** | `curl.exe -X POST http://localhost:8000/api/auth/token/refresh/ -d '{ "refresh": "<REFRESH_TOKEN>" }' -H "Content-Type: application/json"` |
| **Conclusion** | **Pass** |

### Test Case: API-06
| Field | Description |
|---|---|
| **Test ID** | API-06 |
| **Objective** | Verify user profile retrieval for authenticated users |
| **Action** | Send GET request with valid JWT token |
| **Expected Result** | Authenticated user data returned |
| **CURL Command** | `curl.exe -X GET http://localhost:8000/api/auth/user/ -H "Authorization: Bearer <TOKEN>"` |
| **Conclusion** | **Pass** |

---

## 📄 Candidate & Resume API Testing

### Test Case: API-07
| Field | Description |
|---|---|
| **Test ID** | API-07 |
| **Objective** | Verify OCR extraction of valid resume files |
| **Action** | Upload valid PDF resume |
| **Expected Result** | Structured extracted text returned |
| **CURL Command** | `curl.exe -X POST http://localhost:8000/api/candidates/ocr/extract/ -F "file=@resume.pdf" -H "Authorization: Bearer <TOKEN>"` |
| **Conclusion** | **Pass** |

### Test Case: API-08
| Field | Description |
|---|---|
| **Test ID** | API-08 |
| **Objective** | Verify OCR handling of invalid file types |
| **Action** | Upload unsupported .exe file |
| **Expected Result** | Validation error (400) returned |
| **CURL Command** | `curl.exe -X POST http://localhost:8000/api/candidates/ocr/extract/ -F "file=@malware.exe"` |
| **Conclusion** | **Pass** |

### Test Case: API-09
| Field | Description |
|---|---|
| **Test ID** | API-09 |
| **Objective** | Verify resume analysis generation |
| **Action** | POST resume file for evaluation |
| **Expected Result** | Scores and structured feedback returned |
| **CURL Command** | `curl.exe -X POST http://localhost:8000/api/candidates/analyze/ -F "file=@r.pdf"` |
| **Conclusion** | **Pass** |

### Test Case: API-10
| Field | Description |
|---|---|
| **Test ID** | API-10 |
| **Objective** | Verify job recommendations logic |
| **Action** | Send list of candidate skills |
| **Expected Result** | Recommended job roles returned |
| **CURL Command** | `curl.exe -X POST http://localhost:8000/api/candidates/recommendations/ -d '{ "skills": "ReactJS, Python" }' -H "Content-Type: application/json"` |
| **Conclusion** | **Pass** |

---

## 🎙️ Interview API Testing

### Test Case: API-11
| Field | Description |
|---|---|
| **Test ID** | API-11 |
| **Objective** | Verify interview session initialization |
| **Action** | Request start of session with ID |
| **Expected Result** | Initial AI question generated |
| **CURL Command** | `curl.exe -X POST http://localhost:8000/api/interview/ -d '{ "session_id": "sess11" }' -H "Content-Type: application/json"` |
| **Conclusion** | **Pass** |

### Test Case: API-12
| Field | Description |
|---|---|
| **Test ID** | API-12 |
| **Objective** | Verify accurate speech-to-text conversion |
| **Action** | Upload audio speech file |
| **Expected Result** | Transcribed text returned |
| **CURL Command** | `curl.exe -X POST http://localhost:8000/api/interview/stt/ -F "audio=@talk.wav" -F "session_id=sess12"` |
| **Conclusion** | **Pass** |

### Test Case: API-13
| Field | Description |
|---|---|
| **Test ID** | API-13 |
| **Objective** | Verify structured performance evaluation |
| **Action** | Submit interview transcript for analysis |
| **Expected Result** | Detailed SWOT report returned |
| **CURL Command** | `curl.exe -X POST http://localhost:8000/api/interview/analyze/ -d '{ "session_id": "sess13", "conversation": [{"role":"user", "content":"hi"}] }' -H "Content-Type: application/json"` |
| **Conclusion** | **Pass** |
