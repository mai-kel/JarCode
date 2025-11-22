from rest_framework.pagination import CursorPagination

class CourseCursorPagination(CursorPagination):
    ordering = '-id'
    page_size = 50
    max_page_size = 50
