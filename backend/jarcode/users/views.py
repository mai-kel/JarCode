from rest_framework.views import APIView
from users.serializers import (
    UserRegistrationSerializer,
    ResendAccountVerificationLinkSerializer
    )
from rest_framework.response import Response
from rest_framework import status
from .utils import (
    genereate_and_send_verification_token,
    get_account_verification_redis_key
    )
from .models import User
from django.core.cache import cache


class RegistrationApiView(APIView):
    def post(self, request, format=None):
        serializer = UserRegistrationSerializer(data=request.data)

        if serializer.is_valid():
            new_user = serializer.save()
            genereate_and_send_verification_token(user=new_user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ResendAccountVerificationLinkApiView(APIView):
    def post(self, request, format=None):
        serializer = ResendAccountVerificationLinkSerializer(data=request.data)

        if serializer.is_valid():
            genereate_and_send_verification_token(user=serializer.user)

        return Response(status=status.HTTP_201_CREATED)


class VerifyAccountApiView(APIView):
    def get(self, request, user_id, user_uuid, token):
        user = User.objects.filter(id=user_id, uuid=user_uuid).first()
        key = get_account_verification_redis_key(user_id=user_id)

        if not user or user.is_active or token != cache.get(key):
            return Response(status=status.HTTP_404_NOT_FOUND)

        user.is_active = True
        user.save()

        return Response(status=status.HTTP_200_OK)
