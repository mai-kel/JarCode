from rest_framework_nested import routers
from .views import ProblemViewSet

router = routers.SimpleRouter()
router.register(r'problems', ProblemViewSet, basename='problem')

problems_router = routers.NestedSimpleRouter(router,
                                             r'problems',
                                             lookup='problem')

urlpatterns = router.urls + problems_router.urls
