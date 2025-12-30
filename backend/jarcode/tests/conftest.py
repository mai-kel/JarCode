import pytest
from unittest.mock import patch
from rest_framework.test import APIClient
from dramatiq import get_broker
from dramatiq.encoder import JSONEncoder


@pytest.fixture(autouse=True, scope='session')
def disable_throttling():
    """
    Patches ScopedRateThrottle to always allow requests.
    """
    with patch('rest_framework.throttling.ScopedRateThrottle.allow_request',
               return_value=True):
        yield


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def api_client_csrf():
    return APIClient(enforce_csrf_checks=True)


@pytest.fixture
def broker():
    broker = get_broker()
    broker.flush_all()
    yield broker
    broker.flush_all()


@pytest.fixture
def decode_message():
    encoder = JSONEncoder()
    return lambda raw: encoder.decode(raw)
