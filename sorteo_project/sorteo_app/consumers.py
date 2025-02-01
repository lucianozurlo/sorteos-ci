# sorteo_app/consumers.py

import json
from channels.generic.websocket import AsyncWebsocketConsumer

class SorteoConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.group_name = 'sorteos'

        # Unirse al grupo de sorteos
        await self.channel_layer.group_add(
            "sorteos", self.channel_name
        )
        # await self.channel_layer.group_add(
        #     self.group_name,
        #     self.channel_name
        # )

        await self.accept()

    async def disconnect(self, close_code):
        # Salir del grupo de sorteos

        await self.channel_layer.group_discard(
            "sorteos", self.channel_name
        )
        # await self.channel_layer.group_discard(
        #     self.group_name,
        #     self.channel_name
        # )

    # Recibir mensaje del grupo
    async def send_sorteo(self, event):
        sorteo_data = event['sorteo']

        # Enviar mensaje al WebSocket

        await self.send(text_data=json.dumps({
            "type": "sorteo", 
            "sorteo": event["sorteo"]
        }))
        # await self.send(text_data=json.dumps({
        #     'type': 'sorteo',
        #     'sorteo': sorteo_data
        # }))
