from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics, permissions
from django.conf import settings
from .models import InterviewSession, InterviewSignup, InterviewReport
from .serializers import InterviewSignupSerializer, InterviewSessionSerializer, InterviewReportSerializer
from accounts.models import CustomUser
import requests
import json
from rest_framework.permissions import AllowAny, IsAuthenticated


class InterviewSignupCreateView(generics.CreateAPIView):
    """
    API endpoint to create an interview signup for a user.
    When user signs up for a position, this creates their interview signup record.
    """
    serializer_class = InterviewSignupSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_create(self, serializer):
        # Automatically link to the authenticated user
        serializer.save(user=self.request.user)


class InterviewSignupDetailView(generics.RetrieveUpdateAPIView):
    """
    API endpoint to get/update user's interview signup details.
    """
    serializer_class = InterviewSignupSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return self.request.user.interview_signup


class InterviewSignupListView(generics.ListAPIView):
    """
    List all interview signups (admin view).
    """
    serializer_class = InterviewSignupSerializer
    permission_classes = [IsAuthenticated]  # Can add IsAdminUser for production
    
    def get_queryset(self):
        # Non-admin users can only see their own
        if self.request.user.is_staff:
            return InterviewSignup.objects.all()
        return InterviewSignup.objects.filter(user=self.request.user)


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
    permission_classes = [IsAuthenticated]  # Require authentication to access candidate CV data
    
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
            # Try to get candidate's resume info AND signup info for behavioral interview
            resume_context = ""
            user = request.user
            try:
                from candidates.models import ResumeReport
                from .models import InterviewSignup
                
                # Get latest resume analysis
                latest_report = ResumeReport.objects.filter(user=user).order_by('-created_at').first()
                # Get interview signup data (role, experience)
                signup = InterviewSignup.objects.filter(user=user).first()
                
                resume_context = "\n\nCANDIDATE'S PROFILE (Use this to tailor your behavioral questions):\n"
                
                if signup:
                    resume_context += f"- Target Job Role: {signup.job_role or 'Not specified'}\n"
                    resume_context += f"- Experience Level: {signup.get_experience_level_display() if hasattr(signup, 'get_experience_level_display') else signup.experience_level}\n"
                
                if latest_report:
                    resume_context += f"- Strengths: {', '.join(latest_report.strengths[:5])}\n"
                    resume_context += f"- Areas for growth: {', '.join(latest_report.weaknesses[:3])}\n"
                    resume_context += f"- Overall Profile ATS Score: {latest_report.ats_score}%\n"
                    
            except Exception as e:
                print(f"[Interview API] Warning: Error fetching resume context: {e}")

            system_prompt = (
                "You are an expert behavioral interviewer conducting a live audio interview. "
                "Your goal is to evaluate the candidate's soft skills, leadership potential, and cultural fit. "
                "Speak clearly, warmly, and naturally, like a human interviewer on a call. "
                f"{resume_context if resume_context else ''}"
                "Step 1: Greet the candidate warmly and introduce yourself as the interviewer. "
                "Step 2: Ask behavioral questions based on the candidate's skills and the role they are applying for. "
                "Use the STAR method (Situation, Task, Action, Result) for all behavioral assessments. "
                "Ask one question at a time and wait for the candidate's response. "
                "Provide brief, encouraging feedback before moving to the next question. "
                "Maintain a professional and engaging tone. "
                "Keep responses concise (max 2-3 sentences). "
                "Do not mention AI, GPT, or pre-written prompts. "
                "End the interview politely if requested."
            )
        else:  # default to technical
            system_prompt = (
                "You are a professional technical interviewer conducting a live audio interview. "
                "Your goal is to evaluate the candidate's technical skills, fundamental computer science knowledge, and problem-solving abilities. "
                "Speak clearly and naturally like a human interviewer. "
                "Step 1: Greet the candidate warmly and introduce yourself. "
                "Step 2: Start by asking fundamental computer science and programming questions (e.g., data structures, algorithms, memory management, OOP). "
                "Step 3: Gradually increase the difficulty based on the candidate's responses. "
                "Ask one question at a time and wait for the response. "
                "Give brief constructive feedback after each answer. "
                "Keep responses concise and to the point. "
                "Do not give long explanations unless asked. "
                "Do not mention AI, models, or prompts. "
                "Maintain a professional and encouraging tone throughout. "
                "End the interview politely if requested."
            )

        # Build messages for Mistral API
        messages = [{"role": "system", "content": system_prompt}]
        
        # Add conversation history (keep last 10 exchanges)
        messages.extend(session.history[-10:])
        
        # Add current user message (or request initial greeting)
        if not user_message:
            greeting_msg = "Please greet the candidate warmly, introduce yourself, and start the interview with a fundamental computer science question."
            if interview_type == 'behavioral':
                greeting_msg = "Please greet the candidate warmly, introduce yourself, and ask the first behavioral question based on their profile."
            
            messages.append({
                "role": "user", 
                "content": greeting_msg
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


class AnalyzeInterviewView(APIView):
    """
    Analyzes a completed interview transcript using Mistral AI.

    POST body:
      - session_id: str
      - conversation: [{"role": "user"|"ai", "content": "..."}]
      - interview_type: "technical" | "behavioral"
      - duration: int (minutes)

    Returns a structured JSON analysis with:
      - overall_score (0-100)
      - tone_analysis: { dominant_tone, confidence_score, tone_tags[], sentiment }
      - skill_scores: { communication, response_quality, engagement, technical_depth (or empathy) }  
      - strengths: [str, str, str]
      - improvements: [str, str, str]
      - detailed_feedback: str
      - question_count: int
      - response_count: int
    """

    permission_classes = [AllowAny]

    def post(self, request):
        session_id = request.data.get("session_id") or request.data.get("sessionId")
        conversation = request.data.get("conversation", [])
        interview_type = request.data.get("interview_type") or request.data.get("interviewType", "technical")
        duration = request.data.get("duration", 15)

        print(f"[AnalyzeInterview] session={session_id}, type={interview_type}, turns={len(conversation)}")

        if not session_id:
            return Response({"error": "session_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        if not conversation:
            return Response({"error": "conversation is required"}, status=status.HTTP_400_BAD_REQUEST)

        # Build a plain text transcript for analysis
        transcript_lines = []
        for msg in conversation:
            role_label = "Candidate" if msg.get("role") == "user" else "Interviewer"
            transcript_lines.append(f"{role_label}: {msg.get('content', '')}")
        transcript_text = "\n".join(transcript_lines)

        # Prompt Mistral to analyze the transcript
        type_context = (
            "This was a TECHNICAL interview focusing on programming, algorithms, and system design."
            if interview_type == "technical"
            else "This was a BEHAVIORAL interview focusing on soft skills, leadership, and past experiences."
        )

        analysis_prompt = f"""You are an expert interview coach and evaluator. Analyze the following interview transcript and return ONLY a valid JSON object (no extra text, no markdown, no code fences).

{type_context}

TRANSCRIPT:
{transcript_text}

Return this exact JSON structure:
{{
  "overall_score": <integer 0-100>,
  "tone_analysis": {{
    "dominant_tone": "<one word: confident|nervous|enthusiastic|hesitant|calm|anxious|assertive|uncertain>",
    "confidence_score": <integer 0-100>,
    "tone_tags": ["<tag1>", "<tag2>", "<tag3>"],
    "sentiment": "<positive|neutral|negative>"
  }},
  "skill_scores": {{
    "communication": <integer 0-100>,
    "response_quality": <integer 0-100>,
    "engagement": <integer 0-100>,
    "{"technical_depth" if interview_type == "technical" else "empathy_and_self_awareness"}": <integer 0-100>
  }},
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "improvements": ["<area 1>", "<area 2>", "<area 3>"],
  "detailed_feedback": "<2-3 sentence paragraph of personalized feedback>"
}}"""

        api_key = getattr(settings, "MISTRAL_API_KEY", None)
        if not api_key:
            return Response(
                {"error": "MISTRAL_API_KEY not configured"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        try:
            headers = {
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            }
            payload = {
                "model": "mistral-small-latest",
                "messages": [{"role": "user", "content": analysis_prompt}],
                "temperature": 0.3,
                "max_tokens": 700,
                "response_format": {"type": "json_object"},
            }

            print("[AnalyzeInterview] Calling Mistral API for analysis...")
            resp = requests.post(
                "https://api.mistral.ai/v1/chat/completions",
                headers=headers,
                json=payload,
                timeout=45,
            )
            resp.raise_for_status()
            resp_json = resp.json()

            raw_content = ""
            if resp_json.get("choices"):
                raw_content = resp_json["choices"][0]["message"].get("content", "")

            # Parse the JSON response
            analysis = json.loads(raw_content)

            # Attach meta-info
            analysis["session_id"] = session_id
            analysis["interview_type"] = interview_type
            analysis["duration"] = duration
            analysis["question_count"] = sum(1 for m in conversation if m.get("role") == "ai")
            analysis["response_count"] = sum(1 for m in conversation if m.get("role") == "user")

            print(f"[AnalyzeInterview] Analysis complete, overall_score={analysis.get('overall_score')}")

            # Optionally persist on the session model
            try:
                session = InterviewSession.objects.get(session_id=session_id)
                if hasattr(session, '__dict__'):
                    # Store analysis in session history metadata (non-breaking)
                    session.history.append({"role": "analysis", "content": analysis})
                    session.save()
            except InterviewSession.DoesNotExist:
                pass

            return Response(analysis, status=status.HTTP_200_OK)

        except json.JSONDecodeError as e:
            print(f"[AnalyzeInterview] JSON parse error: {e}, raw: {raw_content[:200]}")
            # Return a graceful fallback so the UI still works
            fallback = _fallback_analysis(conversation, interview_type, duration, session_id)
            return Response(fallback, status=status.HTTP_200_OK)

        except requests.exceptions.RequestException as e:
            print(f"[AnalyzeInterview] Mistral API error: {e}")
            fallback = _fallback_analysis(conversation, interview_type, duration, session_id)
            return Response(fallback, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"[AnalyzeInterview] Unexpected error: {e}")
            return Response({"error": "Internal server error during analysis."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


def _fallback_analysis(conversation, interview_type, duration, session_id):
    """
    Returns a basic heuristic analysis when the AI call fails,
    so the frontend always gets a usable response.
    """
    user_turns = [m for m in conversation if m.get("role") == "user"]
    ai_turns = [m for m in conversation if m.get("role") == "ai"]
    total_words = sum(len(m.get("content", "").split()) for m in user_turns)
    avg_words = total_words // max(len(user_turns), 1)

    comm_score = min(100, 50 + avg_words)  # longer answers = better communication proxy
    return {
        "overall_score": 70,
        "tone_analysis": {
            "dominant_tone": "calm",
            "confidence_score": 65,
            "tone_tags": ["composed", "thoughtful", "engaged"],
            "sentiment": "positive",
        },
        "skill_scores": {
            "communication": comm_score,
            "response_quality": 68,
            "engagement": 72,
            "technical_depth" if interview_type == "technical" else "empathy_and_self_awareness": 65,
        },
        "strengths": [
            "Participated actively throughout the session",
            "Maintained clear communication",
            "Demonstrated willingness to engage with questions",
        ],
        "improvements": [
            "Aim to provide more specific examples in answers",
            "Elaborate further on key technical/behavioral points",
            "Practice structuring answers with a clear beginning, middle, and end",
        ],
        "detailed_feedback": (
            "You completed the interview with a solid performance. "
            "Focus on providing more detailed and structured answers to stand out further. "
            "Keep practicing to build confidence and fluency."
        ),
        "session_id": session_id,
        "interview_type": interview_type,
        "duration": duration,
        "question_count": len(ai_turns),
        "response_count": len(user_turns),
    }


class InterviewReportSaveView(generics.CreateAPIView):
    """
    API endpoint to save interview reports.
    Accepts full interview report object and saves it linked to the authenticated user.
    """
    serializer_class = InterviewReportSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class InterviewReportListView(generics.ListAPIView):
    """
    API endpoint to get interview reports.
    Admin users can see all reports or filter by user.
    Regular users can only see their own reports.
    """
    serializer_class = InterviewReportSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None  # Disable pagination for now, can add later

    def get_queryset(self):
        user = self.request.user
        queryset = InterviewReport.objects.all()

        # Allow filtering by user_id for admin users
        user_id = self.request.query_params.get('user')
        if user_id and user.is_staff:
            queryset = queryset.filter(user_id=user_id)
        elif not user.is_staff:
            # Non-admin users can only see their own reports
            queryset = queryset.filter(user=user)

        return queryset.order_by('-created_at')
