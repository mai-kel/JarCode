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
         RegistrationApiView.as_view(),
         name='register'),
    path('resend-verification-link/',
         ResendAccountVerificationLinkApiView.as_view(),
         name='resend-verification-link'),
    path('verify-account/',
         VerifyAccountApiView.as_view(),
         name='verify-account'),
    path('csrf-init/',
         GetCSRFToken.as_view(),
         name='csrf-init'),
    path('login/',
         Login.as_view(),
         name='login'),
    path('logout/',
         Logout.as_view(),
         name='logout'),
    path('me/',
         LoggedUserInfoApiView.as_view(),
         name='me'),
    path('send-password-reset-link/',
         SendPasswordResetLinkApiView.as_view(),
         name='send-password-reset-link'),
    path('change-password/',
         ChangePasswordAPiView.as_view(),
         name='change-password')
]
