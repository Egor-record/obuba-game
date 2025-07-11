const WebSocket = require('ws');
const fs = require('fs');

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', ws => {
    ws.on('message', message => {
        try {
            const data = JSON.parse(message);
            if (data.type === 'save') {
                saveMatrix(ws, data.payload, wss)
            }
        
            if (data.type === 'get') {
                getMatrix(ws)
            }
        } catch (e) {
            console.error('Invalid message:', message);
        }
    })
});

const saveMatrix = (ws, payload, wss) => {
    fs.writeFile('matrix.json', JSON.stringify(payload), (err) => {
        if (err) {
          console.error('Error saving matrix:', err);
          ws.send(JSON.stringify({ type: 'save', status: 'error' }));
        } else {
          ws.send(JSON.stringify({ type: 'save', status: 'ok' }));
          updateClients(ws, wss, payload)
        }
    });
}

const getMatrix = ws => {
    fs.readFile('matrix.json', 'utf8', (err, matrixData) => {
        if (err) {
          console.error('Error reading matrix:', err);
          ws.send(JSON.stringify({ type: 'get', status: 'error' }));
        } else {
          ws.send(JSON.stringify({
            type: 'get',
            status: 'ok',
            payload: JSON.parse(matrixData)
          }));
        }
    });
}

const updateClients = (ws, wss, payload) => {
    wss.clients.forEach(client => {
        if (client !== ws && client.readyState === 1) {
          client.send(JSON.stringify({
            type: 'update',
            payload: payload
          }));
        }
      });
}