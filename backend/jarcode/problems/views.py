from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import SessionAuthentication
from .models import Problem, ProblemReview
from .permissions import IsAuthorOrReadOnly
from .serializers import ProblemSeriazlier, ProblemReviewSerializer
from rest_framework.generics import get_object_or_404


class ProblemViewSet(viewsets.ModelViewSet):
    serializer_class = ProblemSeriazlier
    queryset = Problem.objects.all()
    permission_classes = [IsAuthorOrReadOnly, IsAuthenticated]
    authentication_classes = [SessionAuthentication]
    filterset_fields = ['title', 'language', 'difficulty']

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
