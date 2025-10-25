from django.urls import path
from . import consumers

websocket_urlpatterns = [
    path("ws/submission/", consumers.SubmissionConsumer.as_asgi())
]
