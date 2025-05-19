from django.urls import path
from .consumers import *

websocket_urlpatterns = [
    path('ws/pong/', PongConsumer.as_asgi(), name='pong_websocket')
]