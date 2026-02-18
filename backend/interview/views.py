from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from .models import InterviewSession
import requests
import json
import os
import uuid
from time import time
from gtts import gTTS
from rest_framework.permissions import AllowAny

class InterviewView(APIView):
    permission_classes = [AllowAny]
    """API endpoint for the audio interview flow.

    Accepts POST JSON with:
      - session_id (required)
      - user_message (optional) -- if empty or missing, the endpoint will return an initial greeting

    Returns JSON: { "response_text": "<AI reply>" }
    """
    def post(self, request):
        user_message = request.data.get('user_message', '')
        session_id = request.data.get('session_id')

        if not session_id:
            return Response({"error": "session_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        # Get or create session
        session, created = InterviewSession.objects.get_or_create(session_id=session_id)

        # Ensure history is a list
        if not isinstance(session.history, list):
            session.history = []

        # System Prompt to guide the interviewer persona
        system_prompt = (
            "You are a friendly and professional technical interviewer named 'Bloom'.\n"
            "Speak concisely in 1-3 short sentences, ask one question at a time, and be encouraging.\n"
            "Start with a warm greeting when the interview begins and then ask the first question.\n"
        )

        # Build messages for the model
        api_messages = [{"role": "system", "content": system_prompt}]
        api_messages.extend(session.history[-10:])  # keep short history

        # If no user_message provided, request an initial greeting from the model
        if not user_message:
            api_messages.append({"role": "user", "content": "Please provide a short friendly greeting to start the interview and then ask the candidate the first question."})
        else:
            api_messages.append({"role": "user", "content": user_message})

        try:
            api_key = getattr(settings, 'MISTRAL_API_KEY', None)
            if not api_key:
                return Response({"error": "MISTRAL_API_KEY not configured"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            headers = {
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
                "Accept": "application/json",
            }

            # Call Mistral chat endpoint (best-effort payload). Adjust if your provider differs.
            payload = {
                "model": "mistral-small-latest",
                "messages": api_messages,
                "temperature": 0.7,
                "max_tokens": 250
            }

            resp = requests.post("https://api.mistral.ai/v1/chat/completions", headers=headers, json=payload, timeout=30)
            resp.raise_for_status()
            resp_json = resp.json()

            # Best-effort parsing for expected response shape
            ai_text = None
            if isinstance(resp_json, dict):
                # Try common shapes
                if 'choices' in resp_json and len(resp_json['choices']) > 0:
                    choice = resp_json['choices'][0]
                    # Chat-style
                    if 'message' in choice and isinstance(choice['message'], dict):
                        ai_text = choice['message'].get('content')
                    # Direct text
                    elif 'text' in choice:
                        ai_text = choice.get('text')
                # Some providers return outputs -> [{"content": "..."}]
                if not ai_text and 'outputs' in resp_json and len(resp_json['outputs']) > 0:
                    out = resp_json['outputs'][0]
                    if isinstance(out, dict):
                        ai_text = out.get('content') or out.get('text')

            if not ai_text:
                ai_text = "(The interviewer is silent — please try again.)"

            # Update session history
            if user_message:
                session.history.append({"role": "user", "content": user_message})
            session.history.append({"role": "assistant", "content": ai_text})
            session.save()

            # Generate TTS audio (gTTS) and save temporarily
            audio_url = None
            try:
                media_root = getattr(settings, 'MEDIA_ROOT', None)
                if not media_root:
                    media_root = os.path.join(settings.BASE_DIR, 'media')
                out_dir = os.path.join(media_root, 'interview_audio')
                os.makedirs(out_dir, exist_ok=True)

                # Create a safe filename
                fname = f"interview_{session_id}_{int(time())}_{uuid.uuid4().hex[:8]}.mp3"
                out_path = os.path.join(out_dir, fname)

                print(f"[InterviewView] Generating TTS at {out_path}")
                tts = gTTS(text=ai_text, lang='en', slow=False)
                tts.save(out_path)

                # Build absolute URL for the frontend to fetch
                media_url = getattr(settings, 'MEDIA_URL', '/media/')
                audio_url = request.build_absolute_uri(os.path.join(media_url, 'interview_audio', fname))
                print(f"[InterviewView] TTS audio URL: {audio_url}")
            except Exception as e:
                print(f"[InterviewView] TTS generation failed: {e}")
                audio_url = None

            return Response({"response_text": ai_text, "audio_url": audio_url}, status=status.HTTP_200_OK)

        except requests.exceptions.RequestException as e:
            print(f"Mistral API Error: {e}")
            if getattr(e, 'response', None) is not None:
                print(e.response.text)
            return Response({"error": "Failed to communicate with AI interviewer"}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        except Exception as e:
            print(f"Internal Server Error: {e}")
            return Response({"error": "Internal Server Error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
