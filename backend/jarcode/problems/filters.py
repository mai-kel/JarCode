from django_filters import rest_framework as filters
from .models import Problem

class ProblemFilter(filters.FilterSet):
    title = filters.CharFilter(field_name='title', lookup_expr='icontains')

    class Meta:
        model = Problem
        fields = ['language', 'difficulty', 'author']