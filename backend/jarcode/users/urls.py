from django.urls import path
from .views import (
    RegistrationApiView,
    ResendAccountVerificationLinkApiView,
    VerifyAccountApiView
    )


urlpatterns = [
    path('register/',
         RegistrationApiView.as_view()),
    path('resend-verification-link/',
         ResendAccountVerificationLinkApiView.as_view()),
    path('verify-account/<int:user_id>/<uuid:user_uuid>/<str:token>/',
         VerifyAccountApiView.as_view())

]
