from rest_framework.views import APIView
from users.serializers import (
    UserRegistrationSerializer,
    EmailUserSerializer,
    LoginSerializer,
    UserLoggedSerializer,
    ResetPasswordSerializer
    )
from rest_framework.response import Response
from rest_framework import status
from .utils import (
    genereate_and_send_verification_token,
    generate_and_send_password_reset_token,
    get_account_verification_redis_key,
    get_password_reset_redis_key,
    hash_token
    )
from .models import User
from django.core.cache import cache
from django.contrib.auth import authenticate, login, logout
from rest_framework.authentication import SessionAuthentication
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.permissions import IsAuthenticated
from django.middleware.csrf import get_token
from django.db import transaction
from django.contrib.sessions.models import Session


class RegistrationApiView(APIView):
    authentication_classes = [SessionAuthentication]

    def post(self, request, format=None):
        serializer = UserRegistrationSerializer(data=request.data)

        if serializer.is_valid():
            new_user = serializer.save()
            genereate_and_send_verification_token(user=new_user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ResendAccountVerificationLinkApiView(APIView):
    authentication_classes = [SessionAuthentication]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'token_creation'

    def post(self, request, format=None):
        serializer = EmailUserSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email']
        user = User.objects.filter(email=email).first()

        if user and not user.is_active:
            genereate_and_send_verification_token(user=user)

        return Response(status=status.HTTP_202_ACCEPTED)


class VerifyAccountApiView(APIView):
    authentication_classes = [SessionAuthentication]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'token_consumption'

    def get(self, request, user_id, user_uuid, token):
        user = User.objects.filter(id=user_id, uuid=user_uuid).first()
        key = get_account_verification_redis_key(user_id=user_id)

        if (
            not user or
            user.is_active or
            not token or
            hash_token(token) != cache.get(key)
        ):
            return Response(status=status.HTTP_404_NOT_FOUND)

        with transaction.atomic():
            cache.delete(key=key)
            user.is_active = True
            user.save()

        return Response(status=status.HTTP_200_OK)


class GetCSRFToken(APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request, format=None):
        get_token(request)
        return Response(status=status.HTTP_200_OK)


class Login(APIView):
    authentication_classes = [SessionAuthentication]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'login'

    def post(self, request, format=None):
        # enforce CSRF
        SessionAuthentication().enforce_csrf(request)

        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email']
        password = serializer.validated_data['password']

        user = authenticate(request=request, email=email,
                            password=password)
        if user is not None:
            login(request, user)
            return Response(data=UserLoggedSerializer(user).data,
                            status=status.HTTP_200_OK)
        else:
            return Response('Email or Password is incorrect.',
                            status=status.HTTP_400_BAD_REQUEST)


class Logout(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, format=None):
        logout(request)
        return Response(status=status.HTTP_200_OK)


class LoggedUserInfoApiView(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, format=None):
        serializer = UserLoggedSerializer(request.user)
        return Response(data=serializer.data, status=status.HTTP_200_OK)


class SendPasswordResetLinkApiView(APIView):
    authentication_classes = [SessionAuthentication]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'token_creation'

    def post(self, request, format=None):
        serializer = EmailUserSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email']
        user = User.objects.filter(email=email).first()

        if user and user.is_active:
            generate_and_send_password_reset_token(user=user)

        return Response(status=status.HTTP_202_ACCEPTED)


class ChangePasswordAPiView(APIView):
    authentication_classes = [SessionAuthentication]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'token_consumption'

    def put(self, request, format=None):
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        password = serializer.validated_data['password']
        user_id = serializer.validated_data['user_id']
        user_uuid = serializer.validated_data['user_uuid']
        token = serializer.validated_data['token']

        user = User.objects.filter(id=user_id, uuid=user_uuid).first()
        key = get_password_reset_redis_key(user_id=user_id)

        if (
            not user or
            not user.is_active or
            not token or
            hash_token(token) != cache.get(key)
        ):
            return Response(
                (
                    'There is no password change request with given token '
                    'for this account'
                ),
                status=status.HTTP_400_BAD_REQUEST
            )

        with transaction.atomic():
            cache.delete(key=key)
            user.set_password(password)
            user.save()

        return Response(status=status.HTTP_200_OK)
