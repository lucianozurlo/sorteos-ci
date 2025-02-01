# sorteo_project/asgi.py

import os
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from django.core.asgi import get_asgi_application
import sorteo_app.routing

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "sorteo_project.settings")

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(sorteo_app.routing.websocket_urlpatterns)
    ),
})
