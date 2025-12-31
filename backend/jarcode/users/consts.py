from enum import Enum


class RedisKeysPrefixesEnum(str, Enum):
    ACCOUNT_VERIFICATION = 'account_verification'
    PASSWORD_RESET = 'password_reset'


ACCOUNT_VERIFICATION_TOKEN_TIMEOUT = 60*60*48       # 2 DAYS
PASSWORD_RESET_TOKEN_TIMEOUT = 60*20                # 20 MINUTES

# TOOD for development only, change later
ACCOUNT_VERIFICATION_BASE_URL = 'http://localhost/verify-account'

# TOOD for development only, change later
PASSWORD_RESET_BASE_URL = 'http://localhost/reset-password'
