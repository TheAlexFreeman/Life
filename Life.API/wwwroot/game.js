class Game {
    size;
    hasBorders = false;
    memory = [];
    _liveCells = new Points();
    _relevantCells = new Points();

    constructor(size, borders = false, cells = []) {
        this.size = size;
        this.hasBorders = borders;
        this.setBorders(borders);
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

    setBorders(on = false) {
        this.neighbors = on ?
            (point) => neighbors(point).filter(p => this.includes(p)) :
            (point) => neighbors(point).map(p => this.mod(p));
    }

    clear() {
        this._liveCells.clear();
        this._relevantCells.clear();
        this.memory = [];
    }

    get cellsToChange() {
        return this._relevantCells.filter(p => this.needsUpdate(p));
    }

    needsUpdate(point) {
        const liveNeighborCount = this.countLiveNeighbors(point);
        if (liveNeighborCount < 2) {
            this._relevantCells.remove(point);
        }
        // This is where the magic happens!!!
        // TODO: Account for colors in 2/4/multicolor modes
        if (this.hasCell(point)) return liveNeighborCount < 2 || liveNeighborCount > 3;
        return liveNeighborCount === 3;
    }

    countLiveNeighbors(point) {
        return this.neighbors(point).filter(p => this.hasCell(p)).length;
    }

    neighbors = (point) => neighbors(point).map(p => this.mod(p));

    includes(point) {
        return this.includesX(point) && this.includesY(point);
    }

    includesX(point) {
        return point.x >= 0 && point.x < this.size.x;
    }

    includesY(point) {
        return point.y >= 0 && point.y < this.size.y;
    }

    mod(point) {
        const { x, y } = this.size;
        return {
            x: (x + point.x) % x,
            y: (y + point.y) % y
        }
    }

    toggleCell(p) {
        if (this.hasCell(p)) {
            return this.removeCell(p);
        } else {
            return this.addCell(p);
        }
    }

    hasCell(p) {
        return this._liveCells.has(p);
    }

    addCell(p) {
        this._liveCells.add(p);
        this._relevantCells.addPoints(p, ...this.neighbors(p));
        return true;
    }

    removeCell(p) {
        this._liveCells.remove(p);
        return false;
    }
}
