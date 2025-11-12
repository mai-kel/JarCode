from dramatiq import actor
from .models import Submission
from .submission_service import SubmissionService
from .serializers import SubmissionSerializer
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer


@actor
def evaluate_submission(submission_id):
    submission = Submission.objects.select_related(
        'author', 'problem').filter(id=submission_id).first()
    submission.status = Submission.Status.EVALUATING
    submission.save()

    submission_serialized = SubmissionSerializer(submission).data
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f"user_{submission.author.id}",
        {'type': 'submission.update',
         'data': submission_serialized}
    )

    service = SubmissionService(submission=submission)
    service.evaluate()
