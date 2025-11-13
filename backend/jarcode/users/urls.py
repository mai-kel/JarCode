from django.urls import path
from .views import (
    RegistrationApiView,
    ResendAccountVerificationLinkApiView,
    VerifyAccountApiView,
    GetCSRFToken,
    Login,
    Logout,
    LoggedUserInfoApiView,
    SendPasswordResetLinkApiView,
    ChangePasswordAPiView
    )


urlpatterns = [
    path('register/',
         RegistrationApiView.as_view()),
    path('resend-verification-link/',
         ResendAccountVerificationLinkApiView.as_view()),
    path('verify-account/',
         VerifyAccountApiView.as_view()),
    path('csrf-init/',
         GetCSRFToken.as_view()),
    path('login/',
         Login.as_view()),
    path('logout/',
         Logout.as_view()),
    path('me/',
         LoggedUserInfoApiView.as_view()),
    path('send-password-reset-link/',
         SendPasswordResetLinkApiView.as_view()),
    path('change-password/',
         ChangePasswordAPiView.as_view())
]
