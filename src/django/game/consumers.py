from email import message
from channels.generic.websocket import AsyncJsonWebsocketConsumer
import json


"""
一旦チャット機能を作ってみる
"""
class PongConsumer(AsyncJsonWebsocketConsumer):
        
    async def connect(self):
        print('connect')
        await self.channel_layer.group_add(
            'broadcast',
            self.channel_name
        )
        await self.send_json({
            'type': 'init',
            'id': id
        })
        await self.accept()
        
    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            'broadcast',
            self.channel_name
        )
        print('disconnect')
        
    async def receive_json(self,content):
        # print(f'received:{content}')
        
        await self.channel_layer.group_send(
            'broadcast',
            content
        )
        
    async def init(self, event):
        await self.send_json(event)

    async def mousemove(self, event):
        # print(event)
        await self.send_json(event)

    async def sync_ball(self, event):
        await self.send_json(event)

    async def serve_ball(self, event):
        await self.send_json(event)