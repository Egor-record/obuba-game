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
    } else if (req.url.startsWith('/img/')) {
      const imgPath = path.join(__dirname, FRONT_PATH, 'img', path.basename(req.url));
  
      fs.readFile(imgPath, (err, data) => {
        if (err) {
          res.writeHead(404);
          return res.end('Image not found');
        }
  
        res.writeHead(200, { 'Content-Type': 'image/png' }); // adjust for other types
        res.end(data);
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
            if (data.type === 'save') {
                if (!data.payload.matrix) { 
                  ws.send(JSON.stringify({ type: 'save', status: 'error', errorMsg: 'No matrix provided' }));
                  return 
                }
                const result = await saveMatrix(data.payload.matrix, data.payload.boardIndex)
                if (!result) {
                  ws.send(JSON.stringify({ type: 'save', status: 'error', errorMsg: 'Error saving matrix' }));
                  return
                }
                wss.clients.forEach(client => {
                  if (client !== ws && client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({ type: 'update', payload: data.payload }));
                  }
                });
            } else if (data.type === 'get') {
                const { boardIndex } = data
                try {
                  const matrix = await getFile(boardIndex)
                  ws.send(JSON.stringify({
                    type: 'get',
                    status: 'ok',
                    payload: {
                      matrix: JSON.parse(matrix), 
                      boardIndex
                    }
                  }));

                } catch (err) {
                  console.error('Error reading matrix:', err);
                  ws.send(JSON.stringify({
                    type: 'get',
                    status: 'error'
                  }));
                }
            } else if (data.type === 'hover') {
              wss.clients.forEach(client => {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                  client.send(JSON.stringify({ type: 'hover', payload: data.payload }));
                }
              });
            }
        } catch (e) {
            console.error('Invalid message:', e);
        }
    })
});

