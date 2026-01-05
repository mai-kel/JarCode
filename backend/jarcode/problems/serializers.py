from rest_framework import serializers
from .models import Problem
from users.serializers import UserGenericInfoSerializer
from django.conf import settings
from nh3 import clean


class ProblemSeriazlier(serializers.ModelSerializer):
    author = UserGenericInfoSerializer(read_only=True)
    is_solved = serializers.BooleanField(read_only=True, default=False)

    class Meta:
        model = Problem
        fields = '__all__'
        read_only_fields = ['author', 'created_at']

    def validate_description(self, value):
        try:
            value = clean(html=value,
                          tags=settings.ALLOWED_TAGS,
                          attributes=settings.ALLOWED_ATTRIBUTES)
        except:
            raise serializers.ValidationError("Problem description is invalid or insecure HTML")

        return value
