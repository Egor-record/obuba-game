class HistoryManager {
    #history = [];
  
    saveSnapshot(historizable) {
        if (!historizable) return
        const snapshot = historizable.save();
        this.#history.push(snapshot);
    }
  
    restoreSnapshot(historizable) {
        if (!historizable || !this.#history.length) return
        const snapshot = this.#history.pop();
        historizable.restore(snapshot);
    }
}

class GameUtils {
    findZero(matrix) {
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (matrix[i][j] === 0) {
                    return [i, j];
                }
            }
        }
    }
  
    isNextToZero(x, y, matrix) {
        const [zx, zy] = this.findZero(matrix);
        const dx = Math.abs(x - zx);
        const dy = Math.abs(y - zy);
        return (dx + dy === 1);
    }
}

class Game {
    constructor() {
      this.matrix = [];
      this.historyManager = new HistoryManager()
      this.utils = new GameUtils();
    }  
    createEmptyMatrix() {
        const numbers = [...Array(15).keys()].map(n => n + 1);
        numbers.push(0);
        const matrix = [];

        for (let i = 0; i < 4; i++) {
            matrix.push(numbers.slice(i * 4, i * 4 + 4));
        }

        return matrix;
    }

    save() {
        return this.matrix.map(row => row.slice());
      }
    
    restore(snapshot) {
        this.matrix = snapshot;
    }
  
    makeMove(x, y) {
        if (!this.utils.isNextToZero(x, y, this.matrix)) return;    
        const [zx, zy] = this.utils.findZero(this.matrix);
        this.save();
        [this.matrix[x][y], this.matrix[zx][zy]] = [this.matrix[zx][zy], this.matrix[x][y]];
    }
}