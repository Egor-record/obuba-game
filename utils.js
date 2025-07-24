const fs = require('fs').promises;
const path = require('path');
const { STATIC_PATH } = require('./consts');

const saveMatrix = async (matrix, boardIndex) => {
  if (!boardIndex === undefined || boardIndex === null || matrix === null || matrix === undefined) {
    console.error('No boardIndex or matrix provided', err);
    return false
  }
  try {
    const filePath = path.join(__dirname, STATIC_PATH, `matrix-${boardIndex}.json`);
    await fs.writeFile(filePath, JSON.stringify(matrix));
    return true;
  } catch (err) {
    console.error('Error saving matrix:', err);
    return false;
  }
};
  
const getFile = async boardIndex => {
    const filePath = path.join(__dirname, STATIC_PATH, `matrix-${boardIndex}.json`);
    return await fs.readFile(filePath, 'utf8');
}
  
const sendToClient = (client, payload) => {
  console.log('sending')
    client.send(JSON.stringify({
      type: 'update',
      payload: {
        matrix: payload.matrix,
        boardIndex: payload.boardIndex
      }
    }));
}

module.exports = {
  saveMatrix,
  getFile,
  sendToClient
};