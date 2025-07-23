class Socket {
    constructor() {
        this.ws = new WebSocket('wss://obuba.fun');
        this.ws.onopen = () => {
            [0, 1].forEach(board=> this.sendGetMatrixRequest(board))
        };
        this.ws.onmessage = (event) => {
            if (!event.data) {
                console.warn("Empty message data recieved")
                return 
            }
            const { payload, status, type } = JSON.parse(event.data);
            if (!payload.matrix) {
                console.warn("No matrix provided")
                return
            } 
            if (status === 'ok' && (type === 'get' || type === 'update')) {
                boards[payload.boardIndex].matrix = payload.matrix;
                renderMatrix(payload.boardIndex, payload.matrix);
            }
        };
    }

    saveMatrixToServer(boardIndex, matrix) {
        if (this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({
                type: 'save',
                payload: {
                    boardIndex,
                    matrix
                }
            }));
        }
    }

    sendGetMatrixRequest(boardIndex) {
        if (this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ type: 'get', boardIndex }));
        } else {
            console.warn('WebSocket not ready');
        }
    }
}


