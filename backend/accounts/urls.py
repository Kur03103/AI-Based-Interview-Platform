from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from .views import (
    RegisterView, UserProfileView, LogoutView, 
    AdminUserListView, AdminUserDetailView,
    GoogleLoginInitiate, GoogleCallback, ForgotPasswordView
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('user/', UserProfileView.as_view(), name='auth_user'), # Added /user/ as requested
    path('me/', UserProfileView.as_view(), name='auth_me'),
    path('logout/', LogoutView.as_view(), name='auth_logout'),
    
    # Google OAuth
    path('google/login/', GoogleLoginInitiate.as_view(), name='google_login'),
    path('google/login/callback/', GoogleCallback.as_view(), name='google_callback'),

    
    # Forgot Password
    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot_password'),

    path('admin/users/', AdminUserListView.as_view(), name='admin_users'),
    path('admin/users/<int:pk>/', AdminUserDetailView.as_view(), name='admin_user_detail'),
]

