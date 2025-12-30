import factory
from .models import User


class UserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = User
        django_get_or_create = ('email',)
        skip_postgeneration_save = False

    email = factory.Faker('email')
    first_name = factory.Faker('first_name')
    last_name = factory.Faker('last_name')
    is_content_creator = False
    password = factory.PostGenerationMethodCall('set_password', 'defaultpassword')
