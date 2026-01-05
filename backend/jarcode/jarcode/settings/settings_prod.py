import os
from .settings_base import *


SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY')
DEBUG = False

ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS').split(',')
