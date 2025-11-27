from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import SessionAuthentication
from django.db.models import Exists, OuterRef
from .models import Problem, ProblemReview
from .permissions import IsAuthorOrReadOnly
from .serializers import ProblemSeriazlier, ProblemReviewSerializer
from rest_framework.generics import get_object_or_404
from.pagination import ProblemCursorPagination
from .filters import ProblemFilter
from submissions.models import Submission, Result

class ProblemViewSet(viewsets.ModelViewSet):
    serializer_class = ProblemSeriazlier
    permission_classes = [IsAuthorOrReadOnly, IsAuthenticated]
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


class ProblemReviewViewSet(viewsets.ModelViewSet):
    serializer_class = ProblemReviewSerializer
    permission_classes = [IsAuthorOrReadOnly, IsAuthenticated]
    authentication_classes = [SessionAuthentication]

    def get_queryset(self):
        problem = get_object_or_404(Problem, id=self.kwargs['problem_pk'])
        return ProblemReview.objects.filter(problem=problem)

    def perform_create(self, serializer):
        problem = get_object_or_404(Problem, id=self.kwargs['problem_pk'])
        serializer.save(author=self.request.user, problem=problem)
