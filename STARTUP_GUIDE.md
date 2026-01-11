# How to Start the AI Interview Platform

If you restart your computer, follow these steps to get everything running again. You will need to open **3 separate terminal (Command Prompt or PowerShell)** windows.

### 1. Start the Main Backend (Django)
*Handle the database and saving data.*

1.  Open a Terminal.
2.  Navigate to the backend folder:
    ```powershell
    cd "E:\Desktop\Interview Bloom\ai-interview-platform\backend"
    ```
3.  Run the server:
    ```powershell
    python manage.py runserver
    ```
    *Keep this window open.*

---

### 2. Start the OCR Service (Node.js)
*Handles the resume PDF extraction.*

1.  Open a **New** Terminal.
2.  Navigate to the node backend folder:
    ```powershell
    cd "E:\Desktop\Interview Bloom\ai-interview-platform\backend-node"
    ```
3.  Run the service:
    ```powershell
    npm start
    ```
    *Keep this window open.*

---

### 3. Start the Frontend (React)
*The website interface.*

1.  Open a **New** Terminal.
2.  Navigate to the frontend folder:
    ```powershell
    cd "E:\Desktop\Interview Bloom\ai-interview-platform\frontend"
    ```
3.  Start the website:
    ```powershell
    npm start
    ```
    *This should open your web browser automatically.*

---

### Troubleshooting
*   **Database Error?** Ensure "PostgreSQL" service is running (it usually starts automatically).
*   **"Port already in use"?** Make sure you don't have other terminal windows already running these commands.
