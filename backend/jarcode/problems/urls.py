from rest_framework_nested import routers
from .views import ProblemViewSet, ProblemReviewViewSet

router = routers.SimpleRouter()
router.register(r'problems', ProblemViewSet, basename='problem')

problems_router = routers.NestedSimpleRouter(router,
                                             r'problems',
                                             lookup='problem')

problems_router.register(r'reviews',
                         ProblemReviewViewSet,
                         basename='problem-reviews')

urlpatterns = router.urls + problems_router.urls
