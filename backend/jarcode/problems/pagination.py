from rest_framework.pagination import CursorPagination

class ProblemCursorPagination(CursorPagination):
    ordering = '-id'
    page_size = 50
    max_page_size = 50
