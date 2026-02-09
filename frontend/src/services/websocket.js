import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

class WebSocketService {
    constructor() {
        this.client = null;
        this.subscriptions = [];
    }

    connect(userEmail, onNotification) {
        this.client = new Client({
            webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        this.client.onConnect = () => {
            console.log('WebSocket connected');

            const subscription = this.client.subscribe(
                `/user/${userEmail}/queue/notifications`,
                (message) => {
                    const notification = JSON.parse(message.body);
                    onNotification(notification);
                }
            );

            this.subscriptions.push(subscription);
        };

        this.client.onStompError = (frame) => {
            console.error('STOMP error', frame);
        };

        this.client.activate();
    }

    disconnect() {
        this.subscriptions.forEach((sub) => sub.unsubscribe());
        this.subscriptions = [];

        if (this.client) {
            this.client.deactivate();
            this.client = null;
        }
    }
}

export default new WebSocketService();
