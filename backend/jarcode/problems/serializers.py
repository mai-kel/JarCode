from rest_framework import serializers
from .models import Problem, ProblemReview
from users.serializers import UserGenericInfoSerializer


class ProblemSeriazlier(serializers.ModelSerializer):
    author = UserGenericInfoSerializer(read_only=True)

    class Meta:
        model = Problem
        fields = '__all__'
        read_only_fields = ['author', 'created_at']


class ProblemReviewSerializer(serializers.ModelSerializer):
    author = UserGenericInfoSerializer(read_only=True)
    problem = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = ProblemReview
        fields = '__all__'
        read_only_fields = ['author', 'problem', 'created_at']

    def validate_value(self, value):
        if not (1 <= value <= 5):
            raise serializers.ValidationError(
                "Value must be in closed range <1, 5>"
            )
        return value

    def validate(self, attrs):
        request = self.context.get('request')
        user = getattr(request, 'user', None)
        problem = self.context.get('view').kwargs.get('problem_id')

        if (
            self.instance is None and
            ProblemReview.objects.filter(
                author=user,
                problem_id=problem
            ).exists()
        ):
            raise serializers.ValidationError(
                "You can give only one review to a problem"
            )

        return attrs
