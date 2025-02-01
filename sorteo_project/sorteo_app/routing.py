# sorteo_app/routing.py

from django.urls import re_path
from .consumers import SorteoConsumer

websocket_urlpatterns = [
    re_path(r"ws/sorteos/$", SorteoConsumer.as_asgi()),
]
