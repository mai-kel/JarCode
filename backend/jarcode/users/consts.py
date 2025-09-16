from enum import Enum


class RedisKeysPrefixesEnum(str, Enum):
    ACCOUNT_VERIFICATION = 'account_verification'


ACCOUNT_VERIFICATION_TOKEN_TIMEOUT = 60*60*48

# TOOD for development only, change later
ACCOUNT_VERIFICATION_BASE_URL = 'http://localhost:8000/users/verify-account/'