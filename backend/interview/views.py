from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from .models import InterviewSession
import requests
from rest_framework.permissions import AllowAny

class InterviewView(APIView):
    """
    API endpoint for the audio interview flow.
    
    Accepts POST JSON with:
      - session_id (required)
      - message (user's spoken text)
      - interview_type (optional: 'technical' or 'behavioral')
      - duration (optional: interview duration in minutes)
    
    Returns JSON: { "ai_response": "<AI reply text>" }
    """
    permission_classes = [AllowAny]  # No authentication required for now
    
    def post(self, request):
        user_message = request.data.get('message', '').strip()
        session_id = request.data.get('sessionId') or request.data.get('session_id')
        interview_type = request.data.get('interviewType') or request.data.get('interview_type', 'technical')
        duration = request.data.get('duration', 15)

        print(f"[Interview API] Received - sessionId: {session_id}, type: {interview_type}, duration: {duration}, message: '{user_message}'")

        if not session_id:
            return Response(
                {"error": "session_id is required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get or create session
        session, created = InterviewSession.objects.get_or_create(session_id=session_id)

        # Ensure history is a list
        if not isinstance(session.history, list):
            session.history = []

        # SYSTEM PROMPTS based on interview type
        if interview_type == 'behavioral':
            system_prompt = (
                "You are a professional behavioral interviewer conducting a live audio interview. "
                "Speak clearly and naturally like a human on a call. "
                "Ask behavioral and situational questions about teamwork, leadership, conflict resolution, and problem-solving. "
                "Use the STAR method (Situation, Task, Action, Result) framework. "
                "Ask one question at a time and wait for the candidate's response. "
                "Give brief encouraging feedback before moving to the next question. "
                "Focus on soft skills, communication, and past experiences. "
                "Keep responses concise and professional. "
                "Do not mention AI, models, or prompts. "
                "End the interview politely when requested."
            )
        else:  # default to technical
            system_prompt = (
                "You are a professional technical interviewer conducting a live audio interview. "
                "Speak clearly and naturally like a human on a call. "
                "Ask technical questions about programming, algorithms, data structures, and system design. "
                "Ask one question at a time and wait for the candidate's response. "
                "Give brief constructive feedback before moving to the next question. "
                "Keep responses concise and to the point. "
                "Do not give long explanations or hints unless asked. "
                "Do not mention AI, models, or prompts. "
                "End the interview politely when requested."
            )

        # Build messages for Mistral API
        messages = [{"role": "system", "content": system_prompt}]
        
        # Add conversation history (keep last 10 exchanges)
        messages.extend(session.history[-10:])
        
        # Add current user message (or request initial greeting)
        if not user_message:
            messages.append({
                "role": "user", 
                "content": "Please greet the candidate and start the interview with the first question."
            })
        else:
            messages.append({"role": "user", "content": user_message})

        try:
            # Get Mistral API key
            api_key = getattr(settings, 'MISTRAL_API_KEY', None)
            if not api_key:
                print("[Interview API] ERROR: MISTRAL_API_KEY not configured")
                return Response(
                    {"error": "MISTRAL_API_KEY not configured in backend"}, 
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

            # Call Mistral API
            headers = {
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            }

            payload = {
                "model": "mistral-small-latest",
                "messages": messages,
                "temperature": 0.7,
                "max_tokens": 200
            }

            print(f"[Interview API] Calling Mistral API...")
            resp = requests.post(
                "https://api.mistral.ai/v1/chat/completions", 
                headers=headers, 
                json=payload, 
                timeout=30
            )
            resp.raise_for_status()
            resp_json = resp.json()

            # Extract AI response
            ai_response = None
            if 'choices' in resp_json and len(resp_json['choices']) > 0:
                choice = resp_json['choices'][0]
                if 'message' in choice and isinstance(choice['message'], dict):
                    ai_response = choice['message'].get('content', '').strip()

            if not ai_response:
                ai_response = "I apologize, I didn't catch that. Could you please repeat?"

            print(f"[Interview API] AI Response: {ai_response}")

            # Update conversation history
            if user_message:
                session.history.append({"role": "user", "content": user_message})
            session.history.append({"role": "assistant", "content": ai_response})
            session.save()

            return Response({
                "ai_response": ai_response,
                "session_id": session_id,
                "interview_type": interview_type
            }, status=status.HTTP_200_OK)

        except requests.exceptions.RequestException as e:
            print(f"[Interview API] Mistral API Error: {e}")
            if hasattr(e, 'response') and e.response is not None:
                print(f"[Interview API] Response text: {e.response.text}")
            return Response(
                {"error": "Failed to communicate with AI interviewer. Please try again."}, 
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        except Exception as e:
            print(f"[Interview API] Internal Error: {e}")
            return Response(
                {"error": "Internal server error"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class SpeechToTextView(APIView):
    """
    Accepts raw audio from the frontend and returns a text transcription.

    This decouples browser speech recognition from the interview logic so the
    interview can run reliably even when `window.SpeechRecognition` is not
    available or is failing (e.g. Chrome network errors).
    """

    permission_classes = [AllowAny]

    def post(self, request):
        audio_file = request.FILES.get("audio")
        session_id = request.data.get("sessionId") or request.data.get("session_id")

        if not audio_file:
            return Response(
                {"error": "Missing 'audio' file in request."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Use Groq's Whisper-large-v3 model via their OpenAI-compatible API.
        api_key = getattr(settings, "GROQ_API_KEY", None)
        if not api_key:
            # Fail fast with a clear error so the developer can configure the key.
            return Response(
                {
                    "error": "Speech-to-text API key not configured.",
                    "details": "Set GROQ_API_KEY in your backend environment to enable transcription.",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        try:
            # Call Groq Whisper-large-v3 transcription endpoint.
            files = {
                "file": (audio_file.name, audio_file.read(), audio_file.content_type),
            }
            data = {
                "model": "whisper-large-v3",
                "language": "en",
            }

            resp = requests.post(
                "https://api.groq.com/openai/v1/audio/transcriptions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                },
                files=files,
                data=data,
                timeout=60,
            )
            resp.raise_for_status()
            resp_json = resp.json()
            text = (resp_json.get("text") or "").strip()

            if not text:
                return Response(
                    {
                        "error": "Transcription service returned empty text.",
                    },
                    status=status.HTTP_502_BAD_GATEWAY,
                )

            print(f"[SpeechToText] sessionId={session_id} text='{text}'")

            return Response({"text": text, "session_id": session_id}, status=status.HTTP_200_OK)

        except requests.exceptions.RequestException as e:
            print(f"[SpeechToText] STT API error: {e}")
            if hasattr(e, "response") and e.response is not None:
                print(f"[SpeechToText] Response text: {e.response.text}")
            return Response(
                {
                    "error": "Failed to transcribe audio.",
                    "details": "Upstream STT provider request failed.",
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        except Exception as e:
            print(f"[SpeechToText] Internal error: {e}")
            return Response(
                {"error": "Internal server error during transcription."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
