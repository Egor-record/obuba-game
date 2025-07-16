const http = require('http');
const path = require('path');
const WebSocket = require('ws');
const fs = require('fs')
const { saveMatrix, getFile, sendToClient } = require('./utils');
const { FRONT_PATH } = require('./consts');


const server = http.createServer((req, res) => {
    if (req.url === '/' || req.url === '/index.html') {
      fs.readFile(path.join(__dirname, FRONT_PATH, 'index.html'), (err, content) => {
        if (err) {
          res.writeHead(500);
          res.end('Error loading index.html');
        } else {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(content);
        }
      });
    } else if (req.url.endsWith('.js')) {
      fs.readFile(path.join(__dirname, FRONT_PATH, req.url), (err, content) => {
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
    ws.on('message', async message => {
        try {
            const data = JSON.parse(message);
            const { matrix, board } = data.payload
            if (data.type === 'save') {
                const result = await saveMatrix(matrix, board)
                if (!result) {
                  ws.send(JSON.stringify({ type: 'save', status: 'error' }));
                  return
                }
                wss.clients.forEach(client => {
                  if (client !== ws && client.readyState === 1) {
                    sendToClient(client, data.payload)
                  }
                });
            } else if (data.type === 'get') {
                try {
                  const matrix = await getFile(board)
                  ws.send(JSON.stringify({
                    type: 'get',
                    status: 'ok',
                    payload: {
                      matrix: JSON.parse(matrix), 
                      board: board
                    }
                  }));

                } catch (err) {
                  console.error('Error reading matrix:', err);
                  ws.send(JSON.stringify({
                    type: 'get',
                    status: 'error'
                  }));
                }
            }
        } catch (e) {
            console.error('Invalid message:', message);
        }
    })
});

