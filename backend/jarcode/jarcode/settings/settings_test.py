from .settings_base import *


DRAMATIQ_BROKER = {
    "BROKER": "dramatiq.brokers.stub.StubBroker",
    "OPTIONS": {},
    "MIDDLEWARE": [],
}
