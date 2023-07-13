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
    setCellColor(color = 'limegreen') {
        this._settings.colors.on = color;
        this._liveCells.forEach(cell => this._grid.setColor(cell, color));
    }
    setBackgroundColor(color = 'lightgray') {
        this._settings.colors.off = color;
        for (let x = 0; x < this.size.x; x++) {
            for (let y = 0; y < this.size.y; y++) {
                if (!this.hasCell({x, y})) {
                    this._grid.setColor({x, y}, color);
                }
            }
        }
    }

    get borders() {
        return this._settings.borders;
    }
    set borders(value=false) {
        this._settings.borders = value;
        this._crossBorders = value ?
            (points) => points.filter(p => this._includes(p)) :
            (points) => points.map(p => this._mod(p));
        this._grid.setBorders(value);
    }

    get editable() {
        return this._settings.editable;
    }
    set editable(value=true) {
        // TODO: Set hover/click handlers here
        this._settings.editable = value;
    }


    _mapXY(func = (x, y) => { }) {
        for (let x = 0; x < this.size.x; x++) {
            for (let y = 0; y < this.size.y; y++) {
                func(x, y);
            }
        }
    }


    constructor(settings, frame = null, cells = []) {
        this._frame = frame;
        // TODO: Fix the whole setup process
        this.size = settings.size;
        this.borders = settings.borders;
        this._settings.colors = settings.colors;
        this.editable = settings.editable;
        cells.forEach(p => {
            if (p.x < this.size.x && p.y < this.size.y) {
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
        return this._liveCells.atOrigin.list;
    }

    displayGrid(frame) {
        if (this._grid) {
            this._grid.remove();
        }
        this._grid = new Grid(frame, this._settings, this.liveCells);
    }

    hasCell(p) {
        return this._liveCells.has(p);
    }

    addCell(p) {
        this._liveCells.add(p);
        this._relevantCells.addPoints(p, ...this._neighbors(p));
        this._grid.setColor(p, this.colors.on);
        return true;
    }

    removeCell(p) {
        this._liveCells.remove(p);
        this._grid.setColor(p, this.colors.off);
        return false;
    }

    toggleCell(p) {
        if (this.hasCell(p)) {
            return this.removeCell(p);
        } else {
            return this.addCell(p);
        }
    }

    clear() {
        this._liveCells.forEach(p => this.removeCell(p));
        this._relevantCells.clear();
    }

    setCellEventHandlers(handlers = { onClick: (x, y) => this.toggleCell({x, y}) }) {
        this._mapXY((x, y) => this._grid.setCellEventHandlers(x, y, handlers));
    }

    // Support for adding patterns from menu

    previewPattern(pattern, dx = 0, dy = 0, on = false) {
        const previewCell = on ?
            cell => {this._grid.setColorAndOpacity(cell, this.colors.on, 0.8)} :
            cell => {this._grid.setColorAndOpacity(cell, this._colorAt(cell), 1.0)};
        for (let cell of this._translatePattern(pattern, dx, dy)) {
            previewCell(cell);
        }
    }

     _colorAt(p) {
        return this.hasCell(p) ? this.colors.on : this.colors.off;
    }

    addPattern(pattern, dx = 0, dy = 0) {
        const translatedPattern = this._translatePattern(pattern, dx, dy);
        const result = [];
        for (let p of translatedPattern) {
            if (!this.hasCell(p)) {
                this.addCell(p);
                result.push(p);
            }
            this._grid.setOpacity(p, 1.0);
        }
        return result;
    }

    _translatePattern(pattern, x = 0, y = 0) {
        const points = pattern.map(p => ptAdd(p, {x, y}));
        return this._crossBorders(points);
    }

    rotate(clockwise = true) {
        const {x, y} = this.size;
        const min = this._liveCells.min;
        const newCells = this._liveCells.atOrigin.rotate(clockwise);
        this.clear();
        this.size = {x: y, y: x};
        newCells.forEach(p => this.addCell(ptAdd(p, min)));

    }

    flip(vertical = true) {
        const min = this._liveCells.min;
        const newCells = this._liveCells.atOrigin.flip(vertical);
        this.clear();
        newCells.forEach(p => this.addCell(ptAdd(p, min)));
    }

    // Heart of the game. This method and those supporting it should be optimized for speed.

    tick() {
        const changes = this.cellsToChange;
        changes.forEach(p => this.toggleCell(p));
        return changes;
    }

    get cellsToChange() {
        return this._relevantCells.filter(p => this._needsUpdate(p));
    }

    _needsUpdate(point) {
        const liveNeighborCount = this._liveNeighbors(point).length;
        if (liveNeighborCount < 2) {
            this._relevantCells.remove(point);
        }
        // This is where the magic happens!
        // TODO: Account for colors in 2/4/multicolor modes
        if (this.hasCell(point)) return liveNeighborCount < 2 || liveNeighborCount > 3;
        return liveNeighborCount === 3;
    }

    _liveNeighbors(point) {
        return this._neighbors(point).filter(p => this.hasCell(p));
    }

    _neighbors(point) {
        return this._crossBorders(neighbors(point))
    }

    _crossBorders = ([...points]) => points.map(p => this._mod(p));

    _includes(point) {
        return this._includesX(point) && this._includesY(point);
    }

    _includesX(point) {
        return point.x >= 0 && point.x < this.size.x;
    }

    _includesY(point) {
        return point.y >= 0 && point.y < this.size.y;
    }

    _mod(point) {
        const { x, y } = this.size;
        return {
            x: (x + point.x) % x,
            y: (y + point.y) % y
        }
    }

}
