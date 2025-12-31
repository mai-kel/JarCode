from .tasks import send_activation_link, send_password_reset_link
from .consts import (
    RedisKeysPrefixesEnum,
    ACCOUNT_VERIFICATION_TOKEN_TIMEOUT,
    PASSWORD_RESET_TOKEN_TIMEOUT,
    ACCOUNT_VERIFICATION_BASE_URL,
    PASSWORD_RESET_BASE_URL,
    )
from uuid import uuid4
from django.core.cache import cache
from .models import User
from hashlib import sha256


def hash_token(token: str) -> str:
    return sha256(token.encode()).hexdigest()


def get_account_verification_redis_key(user_id: int) -> str:
    return f'{RedisKeysPrefixesEnum.ACCOUNT_VERIFICATION}:{user_id}'


def make_verification_link(user_id: int, user_uuid: str, token: str):
    link = f'{ACCOUNT_VERIFICATION_BASE_URL}/{user_id}/{user_uuid}/{token}'
    return link


def get_password_reset_redis_key(user_id: int) -> str:
    return f'{RedisKeysPrefixesEnum.PASSWORD_RESET}:{user_id}'


def make_password_reset_link(user_id: int, user_uuid: str, token: str) -> str:
    link = f'{PASSWORD_RESET_BASE_URL}/{user_id}/{user_uuid}/{token}'
    return link


def genereate_and_send_verification_token(user: User) -> None:
    verification_token = str(uuid4())
    hashed_token = hash_token(verification_token)
    key = get_account_verification_redis_key(user_id=user.id)
    cache.set(key, hashed_token,
              timeout=ACCOUNT_VERIFICATION_TOKEN_TIMEOUT)
    verification_link = make_verification_link(
        user_id=user.id,
        user_uuid=str(user.uuid),
        token=verification_token
    )
    send_activation_link.send(email=user.email, link=verification_link)


def generate_and_send_password_reset_token(user: User) -> None:
    password_reset_token = str(uuid4())
    hashed_token = hash_token(password_reset_token)
    key = get_password_reset_redis_key(user_id=user.id)
    cache.set(key, hashed_token,
              timeout=PASSWORD_RESET_TOKEN_TIMEOUT)
    password_reset_link = make_password_reset_link(
        user_id=user.id,
        user_uuid=str(user.uuid),
        token=password_reset_token
    )
    send_password_reset_link.send(email=user.email,
                                  link=password_reset_link)
