# 🐘 AI Interview Platform Backend (Django)

The backend for the AI Interview Platform is a robust and scalable API built with **Django REST Framework (DRF)**. It orchestrates the entire interview lifecycle—from PDF parsing and ATS scoring to real-time LLM-driven audio processing.

---

## 🏗️ Architecture Design
The backend is built around **three core applications**:

### 1. `accounts`
-   **User Model**: A custom `AbstractUser` that stores profile details, ATS scores, and Google OAuth source flags.
-   **Authentication**: Implements **SimpleJWT** for stateless auth and **django-allauth** for Google Social Login.
-   **Password Policy**: Custom logic blocks manual password change requests for social accounts to prevent account hijacking.

### 2. `candidates`
-   **OCR Service**: Logic to parse skills, names, and experience from PDF resumes using **PyPDF2**.
-   **ATS Analysis**: Uses **Mistral AI** to generate a "perfect candidate" profile and compare users against it to calculate scores.
-   **Recommendations**: Backend-driven skill matching to suggest target job roles.

### 3. `interview`
-   **LLM Orchestrator**: The "Brain" of the platform. It generates contextual interview questions (Technical/Behavioral) based on the candidate's resume history.
-   **STT (Speech-to-Text)**: High-speed audio transcription using **Groq Whisper-large-v3**.
-   **Analytics Engine**: Post-interview SWOT generator that extracts dominant tones, confidence scores, and engagement metrics via Mistral.

---

## 🛠️ Performance Features
-   **JWT Stateless Auth**: Minimizes database hits for authentication checks.
-   **Atomic Transactions**: Ensures data integrity when saving large interview JSON payloads.
-   **CORS Management**: Fine-tuned allowed origins for the React frontend (localhost:3000).
-   **Media Root Management**: Stores generated interview transcriptions and reports locally.

---

## 🚦 Local Setup

1.  **Environment Setup**:
    ```bash
    python -m venv venv
    .\venv\Scripts\activate
    ```

2.  **Dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

3.  **Database Migration**:
    ```bash
    python manage.py makemigrations
    python manage.py migrate
    ```

4.  **Create Admin**:
    ```bash
    python manage.py createsuperuser
    ```

5.  **Run**:
    ```bash
    python manage.py runserver
    ```

---

## 🛰️ Key API Endpoints

### Auth
- `POST /api/auth/register/`: Register a new user.
- `POST /api/auth/login/`: Obtain JWT tokens.
- `GET /api/auth/user/`: Get the currently logged-in user profile.
- `GET /accounts/google/login/`: Initiate Google OAuth 2.0 flow.

### Interview
- `POST /api/interview/`: Submit candidate text and get an AI response.
- `POST /api/interview/stt/`: Transcribe a raw audio BLOB from the frontend.
- `GET /api/interview/reports/`: Get the list of all interview sessions and performance scores.

---

## 📦 Core Dependencies
- `django-rest-framework`: API framework.
- `djangorestframework-simplejwt`: Token authentication.
- `django-allauth`: Social authentication.
- `requests`: External AI API communication.
- `PyPDF2`: PDF resume parsing.
- `Pillow`: Profile picture handling.
