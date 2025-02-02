# sorteo_app/consumers.py

import json
from channels.generic.websocket import AsyncWebsocketConsumer

class SorteoConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.group_name = 'sorteos'
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()
        print("WebSocket: Conexión aceptada.")

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)
        print("WebSocket: Conexión cerrada.")

    async def send_sorteo(self, event):
        # Envía los datos del sorteo a los clientes conectados.
        await self.send(text_data=json.dumps({
            "type": "sorteo",
            "sorteo": event["sorteo"]
        }))
