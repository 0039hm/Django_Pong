from channels.generic.websocket import AsyncWebsocketConsumer
import json


"""
一旦チャット機能を作ってみる
"""
class PongConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        print('connect')
        await self.accept()
        
    async def disconnect(self, close_code):
        print('disconnect')
        
    async def receive(self,text_data):
        data = json.loads(text_data)
        print(f'received:{data}')
        
        await self.send(text_data=json.dumps({
            'message': data['message']
        }))