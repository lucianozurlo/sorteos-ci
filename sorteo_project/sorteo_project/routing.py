# sorteo_project/routing.py

from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
import sorteo_app.routing

application = ProtocolTypeRouter({
    'websocket': AuthMiddlewareStack(
        URLRouter(
            sorteo_app.routing.websocket_urlpatterns
        )
    ),
})
