from dramatiq import actor
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags


@actor
def send_activation_link(email: str, link: str) -> None:
    subject = "Verify your account"
    html_message = render_to_string('emails/activation.html',
                                    {'link': link})
    plain_message = strip_tags(html_message)

    send_mail(
        subject=subject,
        message=plain_message,
        recipient_list=[email],
        from_email=settings.EMAIL_HOST_USER,
        html_message=html_message
    )


@actor
def send_password_reset_link(email: str, link: str) -> None:
    subject = "Password Reset Request"
    html_message = render_to_string('emails/password_reset.html',
                                    {'link': link})
    plain_message = strip_tags(html_message)

    send_mail(
        subject=subject,
        message=plain_message,
        recipient_list=[email],
        from_email=settings.EMAIL_HOST_USER,
        html_message=html_message
    )
