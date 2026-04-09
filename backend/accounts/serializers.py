from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from .models import CustomUser

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ('id', 'username', 'email', 'name', 'age', 'profile_picture', 'auth_provider', 'created_at', 'is_superuser', 'is_staff')


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True, 
        required=True,
        min_length=8,
        style={'input_type': 'password'}
    )
    confirm_password = serializers.CharField(
        write_only=True, 
        required=True,
        style={'input_type': 'password'}
    )
    name = serializers.CharField(required=False, allow_blank=True)
    age = serializers.IntegerField(required=False, allow_null=True)

    class Meta:
        model = CustomUser
        fields = ('username', 'email', 'password', 'confirm_password', 'name', 'age')
        extra_kwargs = {
            'username': {'required': True},
            'email': {'required': True},
        }

    def validate_password(self, value):
        """Validate password strength"""
        try:
            validate_password(value)
        except ValidationError as e:
            raise serializers.ValidationError(str(e))
        return value

    def validate(self, attrs):
        """Validate password match"""
        password = attrs.get('password')
        confirm_password = attrs.get('confirm_password')
        
        if password != confirm_password:
            raise serializers.ValidationError({
                "confirm_password": "Password fields don't match."
            })
        
        return attrs

    def create(self, validated_data):
        """Create user with validated data"""
        # Remove confirm_password - we don't need it anymore
        validated_data.pop('confirm_password', None)
        
        # Create user
        user = CustomUser.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            name=validated_data.get('name', '') or '',
            age=validated_data.get('age')
        )
        return user

class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        try:
            user = CustomUser.objects.get(email=value)
            if user.auth_provider == 'google':
                raise serializers.ValidationError("Password reset is not available for Google sign-in accounts.")
        except CustomUser.DoesNotExist:
            # We don't want to leak whether an email exists or not usually, 
            # but per requirements we need to handle specific logic.
            # However, standard practice is to return success anyway.
            # But the user specifically asked for "return error response: 'Password reset is not available for Google sign-in accounts.'"
            # So I will raise validation error for google.
            pass
        return value

class PasswordResetConfirmSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6)
    new_password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        
        try:
            validate_password(attrs['new_password'])
        except ValidationError as e:
            raise serializers.ValidationError({"new_password": list(e.messages)})
            
        return attrs
