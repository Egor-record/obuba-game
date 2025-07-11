const http = require('http');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

const server = http.createServer((req, res) => {
    if (req.url === '/' || req.url === '/index.html') {
      fs.readFile(path.join(__dirname, 'index.html'), (err, content) => {
        if (err) {
          res.writeHead(500);
          res.end('Error loading index.html');
        } else {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(content);
        }
      });
    } else if (req.url.endsWith('.js')) {
      fs.readFile(path.join(__dirname, req.url), (err, content) => {
        if (err) {
          res.writeHead(404);
          res.end('Not found');
        } else {
          res.writeHead(200, { 'Content-Type': 'application/javascript' });
          res.end(content);
        }
      });
    } else {
      res.writeHead(404);
      res.end('Not found');
    }
});


const wss = new WebSocket.Server({ server });
const PORT = 3300;

server.listen(PORT, () => {
  console.log(`HTTP + WebSocket server running at http://localhost:${PORT}`);
});

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