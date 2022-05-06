class Game {
    size;
    memory = [];
    _liveCells = new Points();
    _relevantCells = new Points();

    constructor(size, cells = []) {
        this.size = size;
        cells.forEach(p => {
            if (p.x < size.x && p.y < size.y) {
                this.addCell(p)
            }
        });
    }

    get steps() {
        return this.memory.length;
    }

    get hasCells() {
        return this._liveCells.hasPoints;
    }

    get population() {
        return this._liveCells.size;
    }

    get liveCells() {
        return this._liveCells.list;
    }

    get normalizedCells() {
        return this._liveCells.atOrigin;
    }

    setSize(size) {
        this.size = size;
        this._liveCells = this._liveCells.onBoard(size);
        this._relevantCells = this._relevantCells.onBoard(size);
    }

    clear() {
        this._liveCells.clear();
        this._relevantCells.clear();
        this.memory = [];
    }

    tick() {
        const changes = this._relevantCells.list.filter(p => this.needsUpdate(p));
        if (changes.length) {
            this.memory.push(changes);
        }
        return changes;
    }

    needsUpdate(point) {
        let liveNeighborCount = this.countLiveNeighbors(point);
        if (liveNeighborCount < 2) {
            this._relevantCells.remove(point);
        }
        if (this.hasCell(point)) return liveNeighborCount < 2 || liveNeighborCount > 3;
        return liveNeighborCount === 3;
    }

    countLiveNeighbors(point) {
        return this.neighbors(point).filter(p => this.hasCell(p)).length;
    }

    neighbors(point) {
        // TODO: Toggle borders on/off (edit mod?)
        return neighbors(point).map(p => this.mod(p));
    }

    mod(point) {
        const { x, y } = this.size;
        return {
            x: (x + point.x) % x,
            y: (y + point.y) % y
        }
    }

    back() {
        if (this.memory.length) {
            const changes = this.memory.pop();
            if (changes[0]) {
                return { changes, dirty: false };
            }
            changes.shift();
            return { changes, dirty: true };
        }
        return { changes: [], dirty: true };
    }

    toggleCell(p) {
        if (this.hasCell(p)) {
            this.removeCell(p);
        } else {
            this.addCell(p);
        }
    }

    hasCell(p) {
        return this._liveCells.has(p);
    }

    addCell(p) {
        this._liveCells.add(p);
        this._relevantCells.addPoints(p, ...this.neighbors(p));
    }

    removeCell(p) {
        this._liveCells.remove(p);
    }
}
