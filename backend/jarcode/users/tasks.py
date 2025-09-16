import dramatiq
from django.core.mail import send_mail


@dramatiq.actor
def send_activation_link(email: str, link: str) -> None:
    send_mail(
        subject="Verify your account",
        message=f"Token: {link}",
        recipient_list=[email],
        from_email="jarcode@example.com"
    )
