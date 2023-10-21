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
    _isRunning = false;
    _interval = null;
    _memory = [];

    get hasMemory() {
        return !!this._memory.length;
    }
    get latestChanges() {
        return this._memory[this._memory.length - 1];
    }
    popMemory() {
        return this._memory.pop();
    }
    get generation() {
        return this._memory.filter(changes => (changes instanceof Points)).length;
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
        this._mapXY((x, y) => {
            if (!this.hasCell({x, y})) {
                this._grid.setColor({x, y}, color);
            }
        });
    }

    get borders() {
        return this._settings.borders;
    }
    set borders(value=false) {
        this._settings.borders = value;
        // TODO: Clean this up
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

    addCell(p, color='limegreen') {
        this._liveCells.add(p);
        this._relevantCells.addPoints(p, ...this._neighbors(p));
        this._grid.setColor(p, color);
    }

    removeCell(p) {
        this._liveCells.remove(p);
        this._grid.setColor(p, this.colors.off);
    }

    toggleCell(p, color='limegreen') {
        if (this.hasCell(p)) {
            this.removeCell(p);
            return -1;
        } else {
            this.addCell(p, color);
            return 1;
        }
    }

    clear() {
        this._liveCells.forEach(p => this.removeCell(p));
        this._relevantCells.clear();
        this._memory = [];
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
        const newCells = [];
        for (let p of translatedPattern) {
            if (!this.hasCell(p)) {
                this.addCell(p);
                newCells.push(p);
            }
            this._grid.setOpacity(p, 1.0);
        }
        return newCells;
    }

    addEdit(...points) {
        if (this._memory.length) {
            const changes = this.latestChanges;
            if (changes instanceof Array) {
                // Last change was manual edit
                changes.push(...points);
            } else {
                this._memory.push(points);
            }
        }
    }

    _translatePattern(pattern, x = 0, y = 0) {
        const translatePoint = p => ptAdd(p, {x, y});
        const translatedPoints = pattern.map(translatePoint);
        return this._crossBorders(translatedPoints);
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
        this._memory.push(changes);
        return changes;
    }

    back() {
        const changes = this.popMemory();
        changes.forEach(p => this.toggleCell(p));
        return changes;
    }

    play(tickMS, generations=Infinity, callback=null) {
        if (this._isRunning) {
            clearInterval(this._interval);
        } else {
            this._isRunning = true;
        }
        let counter = 0;
        const playTick = () => {
            if (counter < generations) {
                this.tick();
                counter += 1;
            } else {
                this.stop(callback);
            }
        }
        this._interval = setInterval(playTick, tickMS);
    }

    stop(callback=null) {
        this._isRunning = false;
        clearInterval(this._interval);
        if (callback) callback();
    }

    get cellsToChange() {
        return this._relevantCells.filter(p => this._needsUpdate(p));
    }

    _needsUpdate(point) {
        const liveNeighbors = this._liveNeighbors(point)
        const liveNeighborCount = liveNeighbors.length;
        if (liveNeighborCount < 2) {
            this._relevantCells.remove(point);
        }
        // This is where the magic happens!
        // TODO: Account for colors in 2/4/multicolor modes
        if (this.hasCell(point)) return liveNeighborCount < 2 || liveNeighborCount > 3;
        if (liveNeighborCount === 3) {
            let colors = liveNeighbors.map(p => this._grid.getColor(p));
            return this._nextColor(colors);
        }
        return false;
    }

    _nextColor(colors) {
        // TODO: Allow for different kinds of 'inheritance' to determine cell color
        return 'limegreen';
    }

    _liveNeighbors(point) {
        return this._neighbors(point).filter(p => this.hasCell(p));
    }

    _neighbors(point) {
        return this._crossBorders(neighbors(point))
    }

    // TODO: Deal with this in a less ad-hoc way?
    _crossBorders = ([...points]) => points.map(p => this._mod(p));

    _includes(point) {
        return this._includesX(point.x) && this._includesY(point.y);
    }

    _includesX(x) {
        return x >= 0 && x < this.size.x;
    }

    _includesY(y) {
        return y >= 0 && y < this.size.y;
    }

    _mod(point) {
        const { x, y } = this.size;
        return {
            x: (x + point.x) % x,
            y: (y + point.y) % y
        }
    }

}
