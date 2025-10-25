from channels.generic.websocket import JsonWebsocketConsumer
from asgiref.sync import async_to_sync


class SubmissionConsumer(JsonWebsocketConsumer):

    def connect(self):
        self.user = self.scope.get('user')
        if not self.user or not self.user.is_authenticated:
            self.close()

        self.group = f'user_{self.user.id}'
        async_to_sync(self.channel_layer.group_add)(
            group=self.group, channel=self.channel_name
        )
        self.accept()

    def disconnect(self, code):
        async_to_sync(self.channel_layer.group_discard)(
            group=self.group, channel=self.channel_name
        )

    def submission_update(self, event: dict):
        data = event.get('data')
        if data:
            self.send_json(content=data)
