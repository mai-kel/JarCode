from django.db import models
from django.contrib.auth.models import AbstractUser
from .managers import EmailUserManager
from uuid import uuid4


class User(AbstractUser):
    uuid = models.UUIDField(default=uuid4, blank=False,
                            null=False, editable=False)
    is_content_creator = models.BooleanField(blank=False, null=False)
    email = models.EmailField(("email address"), unique=True)
    first_name = models.CharField(blank=False, null=False)
    last_name = models.CharField(blank=False, null=False)
    username = None

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    objects = EmailUserManager()

    def __str__(self):
        return self.email
