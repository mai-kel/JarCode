from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import SessionAuthentication
from django.db.models import Exists, OuterRef
from .models import Problem
from .permissions import IsAuthorOrReadOnly, IsContentCreatorOrReadOnly
from .serializers import ProblemSeriazlier
from .pagination import ProblemCursorPagination
from .filters import ProblemFilter
from submissions.models import Submission, Result


class ProblemViewSet(viewsets.ModelViewSet):
    serializer_class = ProblemSeriazlier
    permission_classes = [IsAuthenticated, IsAuthorOrReadOnly,
                          IsContentCreatorOrReadOnly]
    authentication_classes = [SessionAuthentication]
    filterset_class = ProblemFilter
    pagination_class = ProblemCursorPagination

    def get_queryset(self):
        queryset = Problem.objects.all()
        user = self.request.user

        if user.is_authenticated:
            is_solved_subquery = Submission.objects.filter(
                problem=OuterRef('pk'),
                author=user,
                result__outcome=Result.Outcome.PASSED
            )
            queryset = queryset.annotate(
                is_solved=Exists(is_solved_subquery)
            )

        return queryset

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
