from rest_framework import serializers
from .models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError


class UserRegistrationSerializer(serializers.ModelSerializer):
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ['email', 'first_name', 'last_name',
                  'password', 'password2', 'id', 'uuid']
        extra_kwargs = {'password': {'write_only': True}}

    def validate_password(self, value):
        try:
            validate_password(value)
        except DjangoValidationError as e:
            raise serializers.ValidationError(str(e))
        return value

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError("Passwords do not match")
        return attrs

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data["email"],
            first_name=validated_data["first_name"],
            last_name=validated_data['last_name'],
            password=validated_data["password"],
            is_content_creator=False,
            is_active=False
        )
        return user


class UserLoggedSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['email', 'is_content_creator', 'first_name',
                  'last_name', 'id', 'uuid']


class UserGenericInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'is_content_creator']


class EmailUserSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True)


class ResetPasswordSerializer(serializers.Serializer):
    user_id = serializers.IntegerField(required=True)
    user_uuid = serializers.CharField(required=True)
    token = serializers.CharField(required=True)
    password = serializers.CharField(required=True)
    password2 = serializers.CharField(required=True)

    def validate_password(self, value):
        try:
            validate_password(value)
        except DjangoValidationError as e:
            raise serializers.ValidationError(str(e))
        return value

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError("Passwords do not match")
        return attrs


class VerifyAccountSerializer(serializers.Serializer):
    user_id = serializers.IntegerField(required=True)
    user_uuid = serializers.CharField(required=True)
    token = serializers.CharField(required=True)
