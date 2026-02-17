from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from .models import InterviewSession
import requests
import json
import os

class InterviewView(APIView):
    def post(self, request):
        user_message = request.data.get('user_message')
        session_id = request.data.get('session_id')

        if not user_message or not session_id:
            return Response({"error": "user_message and session_id are required"}, status=status.HTTP_400_BAD_REQUEST)

        # Get or create session
        session, created = InterviewSession.objects.get_or_create(session_id=session_id)
        
        # Initialize history if empty
        if not session.history:
             session.history = []

        # System Prompt
        system_prompt = (
            "You are a friendly and professional technical interviewer named 'Bloom'.\n"
            "Your goal is to conduct a natural, human-like voice interview.\n"
            "1. Start by warmly greeting the candidate if they say hello.\n"
            "2. Speak concisely. Since this is a voice call, avoid long monologues or code blocks.\n"
            "3. Ask one question at a time and wait for the response.\n"
            "4. Be encouraging. If the user struggles, offer a small hint or move on politely.\n"
            "5. Do not explicitly mention that you are an AI. Just say 'I' am the interviewer.\n"
            "6. Keep your responses short (1-3 sentences) to maintain a good conversational flow.\n"
            "7. If the user's input is short (like 'hello'), respond naturally with a greeting and then ask for their introduction."
        )

        # Build messages for API
        api_messages = [{"role": "system", "content": system_prompt}]
        
        # Add history to messages (limit context if needed, but for now full history)
        # Assuming history is stored as list of dicts: {"role": "user"/"assistant", "content": "..."}
        api_messages.extend(session.history)
        
        # Add current user message
        api_messages.append({"role": "user", "content": user_message})

        try:
            api_key = settings.MISTRAL_API_KEY
            if not api_key:
                return Response({"error": "MISTRAL_API_KEY not configured"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            headers = {
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
                "Accept": "application/json"
            }

            payload = {
                "model": "mistral-small-latest",
                "messages": api_messages,
                "temperature": 0.7,
                "max_tokens": 200
            }

            response = requests.post(
                "https://api.mistral.ai/v1/chat/completions",
                headers=headers,
                json=payload
            )
            response.raise_for_status()
            
            ai_data = response.json()
            ai_text = ai_data['choices'][0]['message']['content']

            # Update Session History
            # Append User Message
            session.history.append({"role": "user", "content": user_message})
            # Append AI Response
            session.history.append({"role": "assistant", "content": ai_text})
            session.save()

            return Response({"ai_response": ai_text}, status=status.HTTP_200_OK)

        except requests.exceptions.RequestException as e:
            print(f"Mistral API Error: {e}")
            if e.response:
                print(f"Error Response: {e.response.text}")
            return Response({"error": "Failed to communicate with AI interviewer"}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        except Exception as e:
            print(f"Internal Server Error: {e}")
            return Response({"error": "Internal Server Error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
