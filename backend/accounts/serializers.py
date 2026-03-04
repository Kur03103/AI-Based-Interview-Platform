from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from .models import CustomUser

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ('id', 'username', 'email', 'name', 'age', 'created_at')

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
