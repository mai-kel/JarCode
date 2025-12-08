from rest_framework import serializers
from .models import Submission, Result


class ResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = Result
        fields = ['id', 'output', 'outcome', 'ai_evaluation']


class SubmissionSerializer(serializers.ModelSerializer):
    problem = serializers.PrimaryKeyRelatedField(read_only=True)
    result = ResultSerializer(read_only=True, default=None)

    class Meta:
        model = Submission
        fields = '__all__'
        read_only_fields = ['author', 'created_at', 'status']
