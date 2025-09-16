from rest_framework import serializers
from .models import User


class UserRegistrationSerializer(serializers.ModelSerializer):
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ['email', 'first_name', 'last_name',
                  'password', 'password2', 'id', 'uuid']
        extra_kwargs = {'password': {'write_only': True}}

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


class ResendAccountVerificationLinkSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    user = None

    def validate_email(self, value):
        user = User.objects.filter(email=value).first()
        if not user or user.is_active:
            msg = "There is no account with given email that awaits for verification."
            raise serializers.ValidationError(msg)
        self.user = user
        return value
