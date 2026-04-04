from django.conf import settings
from django.shortcuts import redirect
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
import requests
from .serializers import RegisterSerializer, UserSerializer
from .models import CustomUser

def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

class RegisterView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

class UserProfileView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

class LogoutView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        # In a stateless JWT system, backend logout isn't strictly necessary
        # unless using token blacklisting.
        # Frontend should remove the token.
        return Response({"message": "Successfully logged out."}, status=status.HTTP_200_OK)

class AdminUserListView(generics.ListAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
    # allow all authenticated users to list users, not just superusers
    permission_classes = [permissions.IsAuthenticated]

class AdminUserDetailView(generics.RetrieveUpdateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]

class GoogleLoginInitiate(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        """Build Google Auth URL and return it (or redirect)"""
        client_id = settings.GOOGLE_CLIENT_ID
        # Strictly use 127.0.0.1 as requested by user
        redirect_uri = "http://127.0.0.1:8000/accounts/google/login/callback/"
        scope = "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile"
        
        auth_url = (
            f"https://accounts.google.com/o/oauth2/v2/auth?"
            f"response_type=code&client_id={client_id}&"
            f"redirect_uri={redirect_uri}&scope={scope}&access_type=offline"
        )
        # return Response({"url": auth_url})
        return redirect(auth_url)

class GoogleCallback(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        """Handle code from Google, exchange for tokens and get user info"""
        code = request.GET.get('code')
        if not code:
            return Response({"error": "No code provided"}, status=400)

        client_id = settings.GOOGLE_CLIENT_ID
        client_secret = settings.GOOGLE_CLIENT_SECRET
        # Strictly use 127.0.0.1 as requested by user
        redirect_uri = "http://127.0.0.1:8000/accounts/google/login/callback/"

        # Exchange code for token
        token_res = requests.post("https://oauth2.googleapis.com/token", data={
            "code": code,
            "client_id": client_id,
            "client_secret": client_secret,
            "redirect_uri": redirect_uri,
            "grant_type": "authorization_code"
        })
        token_data = token_res.json()
        
        if "error" in token_data:
            return Response({"error": token_data.get("error_description", "Failed to exchange code")}, status=400)

        access_token = token_data.get("access_token")

        # Get User Info
        user_info_res = requests.get("https://www.googleapis.com/oauth2/v2/userinfo", headers={
            "Authorization": f"Bearer {access_token}"
        })
        user_info = user_info_res.json()

        email = user_info.get("email")
        name = user_info.get("name")
        picture = user_info.get("picture")

        if not email:
            return Response({"error": "Email not found in Google profile"}, status=400)

        # Get or Create User
        user, created = CustomUser.objects.get_or_create(
            email=email,
            defaults={
                "username": email.split('@')[0], # Fallback username
                "name": name,
                "profile_picture": picture,
                "auth_provider": "google"
            }
        )

        if not created:
            # Update user info if they logged in with Google again
            user.name = name or user.name
            user.profile_picture = picture or user.profile_picture
            user.auth_provider = "google"
            user.save()

        # Generate JWT
        tokens = get_tokens_for_user(user)
        
        # In a real app, you might want to redirect back to the React app with tokens in URL or cookie
        # For simplicity in this demo, return JSON or redirect to frontend
        frontend_url = "http://localhost:3000/auth/callback" # Example
        response = redirect(f"{frontend_url}?access={tokens['access']}&refresh={tokens['refresh']}")
        return response

class ForgotPasswordView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({"error": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = CustomUser.objects.get(email=email)
            if user.auth_provider == 'google':
                return Response({
                    "message": "This account uses Google Sign-In. Please continue with Google.",
                    "auth_provider": "google"
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Standard password reset logic would go here
            return Response({"message": "Password reset instructions sent to your email."}, status=status.HTTP_200_OK)
        except CustomUser.DoesNotExist:
            return Response({"error": "User with this email does not exist."}, status=status.HTTP_404_NOT_FOUND)
