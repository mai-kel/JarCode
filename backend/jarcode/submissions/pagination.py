from rest_framework.pagination import CursorPagination

class SubmissionCursorPagination(CursorPagination):
    ordering = '-id'
    page_size = 10
    max_page_size = 10
