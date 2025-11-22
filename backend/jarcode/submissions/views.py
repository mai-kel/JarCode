from rest_framework import viewsets, mixins
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import SessionAuthentication
from .models import Submission
from .serializers import SubmissionSerializer
from rest_framework.generics import get_object_or_404
from problems.models import Problem
from .tasks import evaluate_submission
from .pagination import SubmissionCursorPagination


class SubmissionViewSet(mixins.CreateModelMixin,
                        viewsets.ReadOnlyModelViewSet,):
    serializer_class = SubmissionSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [SessionAuthentication]
    pagination_class = SubmissionCursorPagination

    def get_queryset(self):
        problem = get_object_or_404(Problem, id=self.kwargs['problem_pk'])
        return (
            Submission.objects.select_related('problem')
            .filter(author=self.request.user, problem=problem)
            .order_by('-created_at')
            .all()
        )

    def perform_create(self, serializer):
        problem = get_object_or_404(Problem, id=self.kwargs['problem_pk'])

        submission = serializer.save(
            author=self.request.user,
            problem=problem,
            status=Submission.Status.ACCEPTED
        )

        evaluate_submission.send(submission_id=submission.id)
