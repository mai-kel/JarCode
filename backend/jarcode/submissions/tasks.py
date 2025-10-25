from dramatiq import actor
from .models import Submission
from .submission_service import SubmissionService


@actor
def evaluate_submission(submission_id):
    submission = Submission.objects.select_related(
        'author', 'problem').filter(id=submission_id).first()
    submission.status = Submission.Status.EVALUATING
    submission.save()
    service = SubmissionService(submission=submission)
    service.evaluate()
