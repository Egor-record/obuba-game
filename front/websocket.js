const IS_DEV = window.location.hostname === 'localhost';
const HOST = IS_DEV ? 'ws://localhost:3300' : 'wss://obuba.fun';

class Socket {
    constructor() {
        this.ws = new WebSocket(HOST);
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
            if (status === 'ok') {
                if (type === 'get' || type === 'update') {
                    boards[payload.boardIndex].matrix = payload.matrix;
                    renderMatrix(payload.boardIndex, payload.matrix);
                } else if (type === 'hover') {
                    updateHover(payload.boardIndex, payload.isHover)
                }
            }
        };
        window.addEventListener('beforeunload', () => {
            if (this.ws && this.ws.readyState === WebSocket.OPEN) {
              this.ws.close(1000, 'User closed the page');
            }
        });
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

    toggleHover(boardIndex, isHover) {
        if (this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ 
                type: 'hover', 
                payload: { boardIndex, isHover }
            }));
        } else {
            console.warn('WebSocket not ready');
        }
    }
}


