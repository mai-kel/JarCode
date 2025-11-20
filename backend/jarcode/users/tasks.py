from dramatiq import actor
from django.core.mail import send_mail
from jarcode.settings import FROM_EMAIL

@actor
def send_activation_link(email: str, link: str) -> None:
    send_mail(
        subject="Verify your account",
        message=f"Verify your account: {link}",
        recipient_list=[email],
        from_email=FROM_EMAIL
    )


@actor
def send_password_reset_link(email: str, link: str) -> None:
    send_mail(
        subject="Password Reset Request",
        message=f"Reset your password: {link}",
        recipient_list=[email],
        from_email=FROM_EMAIL
    )
