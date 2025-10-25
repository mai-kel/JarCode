from rest_framework_nested import routers
from problems.urls import router as problems_router
from .views import SubmissionViewSet

problems_submissions_router = routers.NestedSimpleRouter(
    problems_router, r'problems', lookup='problem'
)
problems_submissions_router.register(
    r'submissions', SubmissionViewSet, basename='problem-submissions'
)

urlpatterns = problems_submissions_router.urls
