from rest_framework.views import APIView
from users.serializers import (
    UserRegistrationSerializer,
    EmailUserSerializer,
    LoginSerializer,
    UserLoggedSerializer,
    ResetPasswordSerializer,
    VerifyAccountSerializer
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
from drf_spectacular.utils import (
    extend_schema,
    OpenApiResponse,
)


class RegistrationApiView(APIView):
    authentication_classes = [SessionAuthentication]

    @extend_schema(
        summary="Register a new user",
        description=("Creates a new user account and "
                     "sends a verification link via email."),
        request=UserRegistrationSerializer,
        responses={
            201: OpenApiResponse(UserRegistrationSerializer,
                                 description="User successfully created."),
            400: OpenApiResponse(description="Invalid input data.")
        }
    )
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

    @extend_schema(
        summary="Resend account verification link",
        description=("Resends the verification email if the user exists "
                     "and is not yet activated."),
        request=EmailUserSerializer,
        responses={
            202: OpenApiResponse(
                description="Verification link sent (if applicable)."),
            400: OpenApiResponse(
                description="Invalid email address.")
        }
    )
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

    @extend_schema(
        summary="Verify user account",
        description=("Activates a user account "
                     "after verifying the token sent via email."),
        request=VerifyAccountSerializer,
        responses={
            200: OpenApiResponse(description="Account successfully verified."),
            404: OpenApiResponse(description="Invalid or expired token.")
        }
    )
    def post(self, request, format=None):
        serializer = VerifyAccountSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user_id = serializer.validated_data['user_id']
        user_uuid = serializer.validated_data['user_uuid']
        token = serializer.validated_data['token']

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

    @extend_schema(
        summary="Get CSRF token",
        description=("Returns a CSRF token required "
                     "for session-based authentication."),
        responses={200: OpenApiResponse(
            description="CSRF token successfully generated.")}
    )
    def get(self, request, format=None):
        get_token(request)
        return Response(status=status.HTTP_200_OK)


class Login(APIView):
    authentication_classes = [SessionAuthentication]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'login'

    @extend_schema(
        summary="User login",
        description="Authenticates a user and returns their profile data.",
        request=LoginSerializer,
        responses={
            200: OpenApiResponse(UserLoggedSerializer,
                                 description="User successfully logged in."),
            400: OpenApiResponse(description="Invalid email or password.")
        }
    )
    def post(self, request, format=None):
        SessionAuthentication().enforce_csrf(request)

        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email']
        password = serializer.validated_data['password']

        user = authenticate(request=request, email=email, password=password)
        if user is not None:
            login(request, user)
            return Response(UserLoggedSerializer(user).data,
                            status=status.HTTP_200_OK)

        return Response('Invalid email or password.',
                        status=status.HTTP_400_BAD_REQUEST)


class Logout(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="User logout",
        description="Logs out the currently authenticated user.",
        responses={
            200: OpenApiResponse(description="Successfully logged out.")
        }
    )
    def post(self, request, format=None):
        logout(request)
        return Response(status=status.HTTP_200_OK)


class LoggedUserInfoApiView(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="Get logged-in user information",
        description=("Returns profile information "
                     "about the currently authenticated user."),
        responses={
            200: OpenApiResponse(UserLoggedSerializer,
                                 description="User information retrieved.")
        }
    )
    def get(self, request, format=None):
        serializer = UserLoggedSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)


class SendPasswordResetLinkApiView(APIView):
    authentication_classes = [SessionAuthentication]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'token_creation'

    @extend_schema(
        summary="Send password reset link",
        description=("Sends a password reset link via email "
                     "if the user exists and is active."),
        request=EmailUserSerializer,
        responses={
            202: OpenApiResponse(
                description="Password reset link sent (if applicable)."),
            400: OpenApiResponse(
                description="Invalid email address.")
        }
    )
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

    @extend_schema(
        summary="Change password after reset",
        description=("Changes the user's password "
                     "after validating the password reset token."),
        request=ResetPasswordSerializer,
        responses={
            200: OpenApiResponse(description="Password successfully changed."),
            400: OpenApiResponse(description="Invalid or expired reset token.")
        }
    )
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
                'Invalid password reset request for this account.',
                status=status.HTTP_400_BAD_REQUEST
            )

        with transaction.atomic():
            cache.delete(key=key)
            user.set_password(password)
            user.save()

        return Response(status=status.HTTP_200_OK)
