class Game {
    _grid;
    _frame;
    _liveCells = new Points();
    _relevantCells = new Points();
    _settings = {
        size: {x: 150, y: 150},
        colors: {on: 'limegreen', off: 'lightgray'},
        borders: false,
        editable: true,
    }

    get size() {
        return this._settings.size;
    }
    set size(value={x: 1, y: 1}) {
        this._settings.size = {...value};
        this._liveCells = this._liveCells.onBoard(value);
        this._relevantCells = this._relevantCells.onBoard(value);
        if (this._frame) {
            this.displayGrid(this._frame);
        }
    }

    get colors() {
        return this._settings.colors;
    }
    set colors(value={on: 'limegreen', off: 'lightgray'}) {
        this._settings.colors = {...value};
        // this._grid.setColors(value)
    }

    get borders() {
        return this._settings.borders;
    }
    set borders(value=false) {
        this._settings.borders = value;
        this._crossBorders = value ?
            (points) => points.filter(p => this.includes(p)) :
            (points) => points.map(p => this.mod(p));
        this._grid.borders = value;
    }

    get editable() {
        return this._settings.editable;
    }
    set editable(value=true) {
        // TODO: Set hover/click handlers here
        this._settings.editable = value;
    }


    constructor(settings, frame = null, cells = []) {
        this._frame = frame;
        // TODO: Fix the whole setup process
        this.size = settings.size;
        this.borders = settings.borders;
        this.colors = settings.colors;
        this.editable = settings.editable;
        cells.forEach(p => {
            if (p.x < size.x && p.y < size.y) {
                this.addCell(p);
            }
        });
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


    displayGrid(frame) {
        if (this._grid) {
            this._grid.remove();
        }
        this._grid = new Grid(frame, this._settings, this.liveCells);
    }

    clear() {
        this._liveCells.forEach(({x, y}) => this._grid.removeCell(x, y));
        this._liveCells.clear();
        this._relevantCells.clear();
    }

    tick() {
        const changes = this.cellsToChange;
        changes.forEach(p => this.toggleCell(p));
        return changes;
    }

    get cellsToChange() {
        return this._relevantCells.filter(p => this.needsUpdate(p));
    }

    needsUpdate(point) {
        const liveNeighborCount = this.liveNeighbors(point).length;
        if (liveNeighborCount < 2) {
            this._relevantCells.remove(point);
        }
        // This is where the magic happens!!!
        // TODO: Account for colors in 2/4/multicolor modes
        if (this.hasCell(point)) return liveNeighborCount < 2 || liveNeighborCount > 3;
        return liveNeighborCount === 3;
    }

    liveNeighbors(point) {
        return this.neighbors(point).filter(p => this.hasCell(p));
    }

    neighbors(point) {
        return this._crossBorders(neighbors(point))
    }

    _crossBorders = ([...points]) => points.map(p => this.mod(p));

    includes(point) {
        return this._includesX(point) && this._includesY(point);
    }

    _includesX(point) {
        return point.x >= 0 && point.x < this.size.x;
    }

    _includesY(point) {
        return point.y >= 0 && point.y < this.size.y;
    }

    mod(point) {
        const { x, y } = this.size;
        return {
            x: (x + point.x) % x,
            y: (y + point.y) % y
        }
    }

    toggleCell(p, color = 'limegreen') {
        if (this.hasCell(p)) {
            return this.removeCell(p);
        } else {
            return this.addCell(p, color);
        }
    }

    hasCell(p) {
        return this._liveCells.has(p);
    }

    addCell(p, color='limegreen') {
        this._liveCells.add(p);
        this._relevantCells.addPoints(p, ...this.neighbors(p));
        this._grid.addCell(p.x, p.y, color);
        return true;
    }

    removeCell(p) {
        this._liveCells.remove(p);
        this._grid.removeCell(p.x, p.y);
        return false;
    }

    translatePattern(pattern, x = 0, y = 0) {
        const points = pattern.map(p => ptAdd(p, {x, y}));
        return this._crossBorders(points);
    }
}
