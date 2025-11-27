from django_filters import rest_framework as filters
from .models import Course

class CourseFilter(filters.FilterSet):
    title = filters.CharFilter(field_name='title', lookup_expr='icontains')

    class Meta:
        model = Course
        fields = ['owner']