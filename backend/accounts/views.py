from django.conf import settings
from django.shortcuts import redirect
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
import requests
from .serializers import (
    RegisterSerializer, UserSerializer, 
    PasswordResetRequestSerializer, PasswordResetConfirmSerializer,
    EmailTokenObtainPairSerializer
)
from .models import CustomUser, PasswordResetOTP
from django.core.mail import send_mail

def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

class EmailTokenObtainPairView(TokenObtainPairView):
    """
    Custom JWT login view that uses the email/username flexible serializer.
    """
    serializer_class = EmailTokenObtainPairSerializer

class RegisterView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(
            {"message": "User created successfully", "user": serializer.data},
            status=status.HTTP_201_CREATED,
            headers=headers
        )

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
    permission_classes = [permissions.IsAdminUser]

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
        serializer = PasswordResetRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        email = serializer.validated_data['email']
        try:
            user = CustomUser.objects.get(email=email)
            
            # Delete old OTPs
            PasswordResetOTP.objects.filter(user=user).delete()
            
            # Create new OTP
            otp_obj = PasswordResetOTP.objects.create(user=user)
            
            # Send Email
            subject = "Your Password Reset OTP"
            message = f"Your OTP for password reset is: {otp_obj.otp}. It expires in 5 minutes."
            from_email = settings.DEFAULT_FROM_EMAIL
            
            try:
                # Force fail_silently=False to see errors
                send_mail(subject, message, from_email, [email], fail_silently=False)
            except Exception as e:
                # Log clearly in terminal
                print(f"SMTP ERROR for {email}: {e}")
                return Response({
                    "error": "Failed to send email. Please check server SMTP configuration.",
                    "details": str(e) if settings.DEBUG else None
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            return Response({
                "message": "If an account exists with this email, an OTP has been sent.",
                "debug_otp": otp_obj.otp if settings.DEBUG else None # Only for testing
            }, status=status.HTTP_200_OK)
            
        except CustomUser.DoesNotExist:
            # Return success even if user doesn't exist for security
            return Response({"message": "If an account exists with this email, an OTP has been sent."}, status=status.HTTP_200_OK)

class PasswordResetConfirmView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        email = serializer.validated_data['email']
        otp = serializer.validated_data['otp']
        new_password = serializer.validated_data['new_password']
        
        try:
            user = CustomUser.objects.get(email=email)
            otp_obj = PasswordResetOTP.objects.filter(user=user, otp=otp, is_used=False).first()
            
            if not otp_obj or otp_obj.is_expired:
                return Response({"error": "Invalid or expired OTP."}, status=status.HTTP_400_BAD_REQUEST)
            
            # Update password
            user.set_password(new_password)
            user.save()
            
            # Mark OTP as used
            otp_obj.is_used = True
            otp_obj.save()
            
            return Response({"message": "Password updated successfully."}, status=status.HTTP_200_OK)
            
        except CustomUser.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)
