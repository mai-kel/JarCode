from .tasks import send_activation_link
from .consts import (
    RedisKeysPrefixesEnum,
    ACCOUNT_VERIFICATION_TOKEN_TIMEOUT,
    ACCOUNT_VERIFICATION_BASE_URL
    )
from uuid import uuid4
from django.core.cache import cache
from .models import User


def get_account_verification_redis_key(user_id: int) -> str:
    return f'{RedisKeysPrefixesEnum.ACCOUNT_VERIFICATION}:{user_id}'


def make_verification_link(user_id: int, user_uuid: str, token: str):
    link = f'{ACCOUNT_VERIFICATION_BASE_URL}{user_id}/{user_uuid}/{token}'
    return link


def genereate_and_send_verification_token(user: User) -> None:
    verification_token = str(uuid4())
    key = get_account_verification_redis_key(user_id=user.id)
    cache.set(key, verification_token,
              timeout=ACCOUNT_VERIFICATION_TOKEN_TIMEOUT)
    verification_link = make_verification_link(
        user_id=user.id,
        user_uuid=str(user.uuid),
        token=verification_token
    )
    send_activation_link.send(email=user.email, link=verification_link)
