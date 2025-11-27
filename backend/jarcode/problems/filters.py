from django_filters import rest_framework as filters
from .models import Problem

class ProblemFilter(filters.FilterSet):
    title = filters.CharFilter(field_name='title', lookup_expr='icontains')
    is_solved = filters.BooleanFilter(method='filter_is_solved', label='Is Solved')

    class Meta:
        model = Problem
        fields = ['language', 'difficulty', 'author']

    def filter_is_solved(self, queryset, name, value):
        return queryset.filter(is_solved=value)