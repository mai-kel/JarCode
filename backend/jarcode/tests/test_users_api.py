import pytest
from unittest.mock import patch
from django.urls import reverse
from rest_framework import status
from users.utils import hash_token
from users.factories import UserFactory
from users.models import User
from users.consts import (
    ACCOUNT_VERIFICATION_TOKEN_TIMEOUT,
)


@pytest.mark.django_db
def test_registration_success(api_client, broker, decode_message):
    url = reverse('register')
    data = {
        "email": "newuser@example.com",
        "first_name": "John",
        "last_name": "Doe",
        "password": "securePass123!",
        "password2": "securePass123!"
    }

    with patch('users.utils.cache.set') as mock_cache_set, \
         patch('users.utils.uuid4') as mock_uuid:

        mock_token = "1111-2222-3333-4444"
        mock_uuid.return_value = mock_token

        response = api_client.post(url, data)

        assert response.status_code == status.HTTP_201_CREATED

        user = User.objects.get(email="newuser@example.com")
        assert user.is_active is False

        expected_key = f'account_verification:{user.id}'
        expected_hash = hash_token(mock_token)
        mock_cache_set.assert_called_once_with(
            expected_key,
            expected_hash,
            timeout=ACCOUNT_VERIFICATION_TOKEN_TIMEOUT
        )

        queue = broker.queues.get('default').queue
        assert len(queue) == 1

        message = decode_message(queue[0])

        assert message['actor_name'] == 'send_activation_link'
        assert message['kwargs']['email'] == data['email']
        assert mock_token in message['kwargs']['link']


@pytest.mark.django_db
def test_registration_fails_passwords_mismatch(api_client):
    url = reverse('register')
    data = {
        "email": "fail@example.com",
        "first_name": "John",
        "last_name": "Doe",
        "password": "Password123",
        "password2": "Mismatch123"
    }
    response = api_client.post(url, data)
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "password" in response.data
    assert User.objects.count() == 0


@pytest.mark.django_db
def test_registration_fails_duplicate_email(api_client):
    UserFactory(email="duplicate@example.com")
    url = reverse('register')
    data = {
        "email": "duplicate@example.com",
        "first_name": "New",
        "last_name": "User",
        "password": "Password123",
        "password2": "Password123"
    }
    response = api_client.post(url, data)
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "email" in response.data


@pytest.mark.django_db
def test_verify_account_success(api_client):
    user = UserFactory(is_active=False)
    fake_token = "valid-token-123"
    hashed_token = hash_token(fake_token)
    url = reverse('verify-account')

    payload = {
        "user_id": user.id,
        "user_uuid": str(user.uuid),
        "token": fake_token
    }

    with patch('users.views.cache.get', return_value=hashed_token) as mock_get, \
         patch('users.views.cache.delete') as mock_delete:

        response = api_client.post(url, payload)

        assert response.status_code == status.HTTP_200_OK
        mock_get.assert_called_once()
        user.refresh_from_db()
        assert user.is_active is True

        mock_delete.assert_called_once()


@pytest.mark.django_db
def test_verify_account_fails_invalid_token(api_client):
    user = UserFactory(is_active=False)
    url = reverse('verify-account')
    real_token_hash = hash_token("real-token")

    with patch('users.views.cache.get', return_value=real_token_hash):
        response = api_client.post(url, {
            "user_id": user.id,
            "user_uuid": str(user.uuid),
            "token": "wrong-token"
        })

        assert response.status_code == status.HTTP_404_NOT_FOUND
        user.refresh_from_db()
        assert user.is_active is False


@pytest.mark.django_db
def test_verify_account_fails_already_active(api_client):
    user = UserFactory(is_active=True)
    url = reverse('verify-account')

    with patch('users.views.cache.get', return_value=hash_token("token")):
        response = api_client.post(url, {
            "user_id": user.id,
            "user_uuid": str(user.uuid),
            "token": "token"
        })
        assert response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.django_db
def test_verify_account_fails_user_not_found(api_client):
    url = reverse('verify-account')
    with patch('users.views.cache.get', return_value="hash"):
        response = api_client.post(url, {
            "user_id": 99999,
            "user_uuid": "00000000-0000-0000-0000-000000000000",
            "token": "token"
        })
        assert response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.django_db
def test_login_success_with_csrf(api_client_csrf):
    password = "MySecurePassword123"
    user = UserFactory(password=password, is_active=True)

    csrf_url = reverse('csrf-init')
    client_response = api_client_csrf.get(csrf_url)
    csrftoken = client_response.cookies['csrftoken'].value

    login_url = reverse('login')
    api_client_csrf.cookies['csrftoken'] = csrftoken

    response = api_client_csrf.post(
        login_url,
        {"email": user.email, "password": password},
        format='json',
        HTTP_X_CSRFTOKEN=csrftoken
    )

    assert response.status_code == status.HTTP_200_OK
    assert response.data['email'] == user.email


@pytest.mark.django_db
def test_login_without_csrf(api_client_csrf):
    password = "MySecurePassword123"
    user = UserFactory(password=password, is_active=True)

    login_url = reverse('login')

    response = api_client_csrf.post(
        login_url,
        {"email": user.email, "password": password},
        format='json'
    )

    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert "CSRF" in str(response.data)


@pytest.mark.django_db
def test_login_fails_wrong_password(api_client):
    user = UserFactory(password="CorrectPass", is_active=True)

    response = api_client.post(
        reverse('login'),
        {"email": user.email, "password": "WrongPassword"},
        format='json',
    )

    assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
def test_login_fails_inactive_user(api_client):
    user = UserFactory(password="Pass", is_active=False)

    response = api_client.post(
        reverse('login'),
        {"email": user.email, "password": "Pass"},
        format='json',
    )

    assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
def test_send_password_reset_link_success(api_client, broker, decode_message):
    user = UserFactory(is_active=True)
    url = reverse('send-password-reset-link')

    with patch('users.utils.cache.set') as mock_set, \
         patch('users.utils.uuid4') as mock_uuid:

        mock_token = "reset-token-abc"
        mock_uuid.return_value = mock_token

        response = api_client.post(url, {"email": user.email})

        assert response.status_code == status.HTTP_202_ACCEPTED
        mock_set.assert_called_once()
        queue = broker.queues.get('default').queue
        assert len(queue) == 1
        message = decode_message(queue[0])
        assert message['actor_name'] == 'send_password_reset_link'
        assert message['kwargs']['email'] == user.email
        assert mock_token in message['kwargs']['link']


@pytest.mark.django_db
def test_send_password_reset_fails_inactive_user(api_client, broker):
    user = UserFactory(is_active=False)
    url = reverse('send-password-reset-link')

    response = api_client.post(url, {"email": user.email})

    assert response.status_code == status.HTTP_202_ACCEPTED

    queue = broker.queues.get('default').queue
    assert len(queue) == 0


@pytest.mark.django_db
def test_send_password_reset_unknown_email(api_client, broker):
    url = reverse('send-password-reset-link')
    response = api_client.post(url, {"email": "unknown@example.com"})

    assert response.status_code == status.HTTP_202_ACCEPTED
    assert len(broker.queues.get('default').queue) == 0


@pytest.mark.django_db
def test_change_password_success(api_client):
    old_pass = "OldPass"
    new_pass = "NewPass123"
    user = UserFactory(password=old_pass, is_active=True)
    token = "valid-reset-token"
    hashed_token = hash_token(token)
    url = reverse('change-password')

    payload = {
        "user_id": user.id,
        "user_uuid": str(user.uuid),
        "token": token,
        "password": new_pass,
        "password2": new_pass
    }

    with patch('users.views.cache.get', return_value=hashed_token) as mock_get, \
         patch('users.views.cache.delete') as mock_delete:

        response = api_client.put(url, payload)

        assert response.status_code == status.HTTP_200_OK
        mock_get.assert_called_once()
        mock_delete.assert_called_once()

        user.refresh_from_db()
        assert user.check_password(new_pass) is True


@pytest.mark.django_db
def test_change_password_fails_mismatch(api_client):
    user = UserFactory(is_active=True)
    url = reverse('change-password')
    payload = {
        "user_id": user.id,
        "user_uuid": str(user.uuid),
        "token": "any",
        "password": "PasswordPassA123",
        "password2": "PasswordPassB123"
    }
    response = api_client.put(url, payload)
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "Passwords do not match" in str(response.data)


@pytest.mark.django_db
def test_change_password_fails_bad_token(api_client):
    user = UserFactory(is_active=True)
    url = reverse('change-password')
    real_hash = hash_token("real")

    payload = {
        "user_id": user.id,
        "user_uuid": str(user.uuid),
        "token": "bad-token",
        "password": "NewPass",
        "password2": "NewPass"
    }

    with patch('users.views.cache.get', return_value=real_hash):
        response = api_client.put(url, payload)
        assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
def test_logout_success(api_client):
    user = UserFactory(is_active=True)
    api_client.force_authenticate(user=user)

    url = reverse("logout")

    response = api_client.post(url)

    assert response.status_code == status.HTTP_200_OK


@pytest.mark.django_db
def test_me_success(api_client):
    user = UserFactory(is_active=True)
    api_client.force_authenticate(user=user)

    url = reverse("me")

    response = api_client.get(url)

    assert response.status_code == status.HTTP_200_OK
    assert response.data["email"] == user.email
    assert response.data["id"] == user.id


@pytest.mark.django_db
def test_resend_verification_link_success(api_client, broker, decode_message):
    user = UserFactory(is_active=False)

    url = reverse("resend-verification-link")
    payload = {"email": user.email}

    response = api_client.post(url, payload)

    assert response.status_code == status.HTTP_202_ACCEPTED

    queue = broker.queues["default"].queue
    assert len(queue) == 1

    message = decode_message(queue[0])
    assert message["actor_name"] == "send_activation_link"
    assert message["kwargs"]["email"] == user.email


@pytest.mark.django_db
def test_resend_verification_link_active_user(api_client, broker):
    user = UserFactory(is_active=True)

    url = reverse("resend-verification-link")
    payload = {"email": user.email}

    response = api_client.post(url, payload)

    assert response.status_code == status.HTTP_202_ACCEPTED
    assert len(broker.queues["default"].queue) == 0


@pytest.mark.django_db
def test_resend_verification_link_unknown_email(api_client, broker):
    url = reverse("resend-verification-link")
    payload = {"email": "unknown@example.com"}

    response = api_client.post(url, payload)

    assert response.status_code == status.HTTP_202_ACCEPTED
    assert len(broker.queues["default"].queue) == 0


@pytest.mark.django_db
def test_edit_profile_success(api_client):
    user = UserFactory(is_active=True)
    api_client.force_authenticate(user=user)

    url = reverse("me")
    payload = {
        "first_name": "UpdatedFirst",
        "last_name": "UpdatedLast",
    }

    response = api_client.put(url, payload)

    assert response.status_code == status.HTTP_200_OK
    assert response.data["first_name"] == payload["first_name"]
    assert response.data["last_name"] == payload["last_name"]
