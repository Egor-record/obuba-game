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

class Game {
    constructor() {
      this.matrix = this.createEmptyMatrix();
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
        if (!this.isNextToZero(x, y)) return;    
        const [zx, zy] = this.findZero();
        this.save();
        [this.matrix[x][y], this.matrix[zx][zy]] = [this.matrix[zx][zy], this.matrix[x][y]];
    }

    findZero() {
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (this.matrix[i][j] === 0) {
                    return [i, j];
                }
            }
        }
    }
  
    isNextToZero(x, y) {
        const [zx, zy] = this.findZero();
      
        const dx = Math.abs(x - zx);
        const dy = Math.abs(y - zy);
      
        return (dx + dy === 1);
    }
}