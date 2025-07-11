class Socket {
    constructor(game) {
        this.ws = new WebSocket('ws://localhost:8080');
        this.ws.onopen = () => {
            this.loadMatrixFromServer();
        };
        this.ws.onmessage = (event) => {
            const msg = JSON.parse(event.data);
            if (msg.type === 'get' && msg.status === 'ok') {
                game.matrix = msg.payload;
                renderMatrix(game.matrix);
            }
            
            if (msg.type === 'update') {
                game.matrix = msg.payload;
                renderMatrix(game.matrix);
            }
        };
    }

    saveMatrixToServer() {
        if (this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({
                type: 'save',
                payload: game.matrix
            }));
        }
    }

    loadMatrixFromServer() {
        if (this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ type: 'get' }));
        } else {
            console.warn('WebSocket not ready');
        }
    }
}


