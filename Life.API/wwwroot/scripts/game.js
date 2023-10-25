class GameLogic {
    // TODO: Add multicolored logics
    _liveCells = new Points();
    _relevantCells = new Points();
    _size = {x: 1, y: 1};
    _borders = false;

    get size() {
        return this._size;
    }
    set size(value={x: 1, y: 1}) {
        this._size = value;
        this._liveCells = this._liveCells.onBoard(value);
        this._relevantCells = this._relevantCells.onBoard(value);
    }

    get borders() {
        return this._borders;
    }
    set borders(value = false) {
        this._borders = value;
        this._crossBorders = value ?
            (points) => points.filter(p => this._includes(p)) :
            (points) => points.map(p => this._mod(p));
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

    constructor(size, borders) {
        // TODO: Fix the whole setup process
        this.size = size;
        this.borders = borders;
    }

    toggleCell(p) {
        if (this.hasCell(p)) {
            this.removeCell(p);
            return -1;
        } else {
            this.addCell(p);
            return 1;
        }
    }

    hasCell(p) {
        return this._liveCells.has(p);
    }

    addCell(p) {
        this._liveCells.add(p);
        this._relevantCells.addPoints(p, ...this._neighbors(p));
    }

    removeCell(p) {
        this._liveCells.remove(p);
    }

    clear() {
        this._liveCells.clear();
        this._relevantCells.clear();
    }

    rotate(clockwise = true) {
        const {x, y} = this._liveCells.min;
        const newCells = this._liveCells.atOrigin.rotate(clockwise);
        return this.translatePattern(newCells, x, y);
    }

    flip(vertical = true) {
        const {x, y} = this._liveCells.min;
        const newCells = this._liveCells.atOrigin.flip(vertical);
        return this.translatePattern(newCells, x, y);
    }

    addPattern(pattern, dx = 0, dy = 0) {
        const translatedPattern = this.translatePattern(pattern, dx, dy);
        const newCells = [];
        for (let p of translatedPattern) {
            if (!this.hasCell(p)) {
                this.addCell(p);
                newCells.push(p);
            }
        }
        return newCells;
    }

    translatePattern(pattern, x = 0, y = 0) {
        const translatePoint = p => ptAdd(p, {x, y});
        const translatedPoints = pattern.map(translatePoint);
        return this._crossBorders(translatedPoints);
    }

    // Heart of the game. Everything below should be optimized for speed.

    _isRunning = false;
    _interval = null;

    play(tickMS, tick = () => this.tick()) {
        if (this._isRunning) {
            clearInterval(this._interval);
        } else {
            this._isRunning = true;
        }
        this._interval = setInterval(tick, tickMS);
    }

    stop() {
        this._isRunning = false;
        clearInterval(this._interval);
    }

    tick() {
        const changes = this.cellsToChange;
        changes.forEach(p => this.toggleCell(p));
        return changes;
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
        if (this.hasCell(point)) return liveNeighborCount < 2 || liveNeighborCount > 3;
        return liveNeighborCount === 3;
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


class GameBase {
    _grid;
    _frame;
    _gameLogic;
    _settings = {
        colors: {on: 'limegreen', off: 'lightgray'},
    }

    get settings() {
        return {
            size: this.size,
            colors: this.colors,
            borders: this.borders,
        }
    }

    get size() {
        return this._gameLogic.size;
    }
    set size(value={x: 1, y: 1}) {
        this._gameLogic.size = value;
        if (this._frame) {
            this.displayGrid(this._frame);
        }
    }

    get colors() {
        return this._settings.colors;
    }
    setCellColor(color = 'limegreen') {
        this.colors.on = color;
        this._liveCells.forEach(cell => this._grid.setColor(cell, color));
    }
    setBackgroundColor(color = 'lightgray') {
        this.colors.off = color;
        this._forEach(p => {
            if (!this.hasCell(p)) {
                this._grid.setColor(p, color);
            }
        });
    }

    get borders() {
        return this._gameLogic.borders;
    }
    set borders(value=false) {
        this._gameLogic.borders = value;
        this._grid.setBorders(value);
    }

    _forEach(func = ({x, y}) => { }) {
        for (let x = 0; x < this.size.x; x++) {
            for (let y = 0; y < this.size.y; y++) {
                func({x, y});
            }
        }
    }

    get cells() {
        return this._gameLogic.liveCells;
    }

    get pattern() {
        return this._gameLogic.normalizedCells;
    }

    get population() {
        return this._gameLogic.population;
    }

    constructor(settings, frame = null, cells = []) {
        this._frame = frame;
        this._gameLogic = new GameLogic(settings.size, settings.borders);
        this._settings.colors = settings.colors;
        this.size = settings.size;
        cells.forEach(p => this.addCell(p));
    }

    displayGrid(frame) {
        if (this._grid) {
            this._grid.remove();
        }
        this._grid = new Grid(frame, this.settings, this.cells);
    }

    hasCell(p) {
        return this._gameLogic.hasCell(p);
    }

    addCell(p, color='limegreen') {
        this._gameLogic.addCell(p);
        this._grid.setColor(p, color);
    }

    removeCell(p) {
        this._gameLogic.removeCell(p);
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

    rotate(clockwise = true) {
        const rotatedCells = this._gameLogic.rotate(clockwise);
        this.clear();
        const {x, y} = this.size;
        this.size = {x: y, y: x};
        this.addPattern(rotatedCells);
    }

    flip(vertical = true) {
        const flippedCells = this._gameLogic.flip(vertical);
        this.clear();
        this.addPattern(flippedCells);
    }

    clear() {
        this.cells.forEach(p => this.removeCell(p));
        this._gameLogic.clear();
    }

    addPattern(pattern, dx = 0, dy = 0) {
        const newCells = this._gameLogic.addPattern(pattern, dx, dy);
        newCells.forEach(p => this._grid.setColor(p, this.colors.on));
        return newCells;
    }

    tick() {
        const changes = this._gameLogic.tick();
        changes.forEach(p => this._correctColor(p));
        return changes;
    }

    _correctColor(p) {
        this._grid.setColor(p, this.hasCell(p) ? this.colors.on : this.colors.off);
    }

    play(tickMS, tick = () => this.tick()) {
        this._gameLogic.play(tickMS, tick);
    }

    playWhile(tickMS, condition = () => true, onStop = null) {
        const tick = () => {
            if (condition()) {
                this.tick();
            } else {
                this.stop(onStop);
            }
        }
        this._gameLogic.play(tickMS, tick);
    }

    playGenerations(tickMS, generations=Infinity, onStop=null) {
        let counter = 0;
        const tick = () => {
            if (counter < generations) {
                this.tick();
                counter += 1;
            } else {
                this.stop(onStop);
            }
        }
        this._gameLogic.play(tickMS, tick);
    }

    stop(callback=null) {
        this._gameLogic.stop();
        if (callback) callback();
    }

}


class GameDemo extends GameBase {

    setClickHandler(onClick = () => { }) {
        this._grid.setGridEventHandlers({ onClick });
    }

    repeat(seedPattern, generations, tickMS) {
        const play = () => {
            this.clear();
            this.addPattern(seedPattern);
            this.playGenerations(tickMS, generations, play());
        }
        play();
    }
}


class GameMemory {
    _memory = [];

    get latestChanges() {
        return this._memory[this._memory.length - 1];
    }

    countGenerations() {
        return this._memory.filter(changes => !(changes instanceof Array)).length;
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

    pop() {
        return this._memory.pop();
    }

    clear() {
        this._memory = [];
    }
}


class GameBoard extends GameBase {
    _memory = new GameMemory();

    get generation() {
        return this._memory.countGenerations();
    }

    constructor(settings, frame = null, cells = []) {
        super(settings, frame, cells);
        this.setCellEventHandlers();
    }

    clear() {
        super.clear();
        this._memory.clear();
    }

    toggleCell(p, color='limegreen') {
        this._memory.addEdit(p);
        return super.toggleCell(p, color);
    }

    addPattern(pattern, x = 0, y = 0) {
        const newCells = super.addPattern(pattern, x, y);
        this._memory.addEdit(...newCells);
        pattern.forEach(p => this._grid.setOpacity(p, 1.0));
        return newCells;
    }

    setCellEventHandlers(handlers = { onClick: (x, y) => () => this.toggleCell({x, y}) }) {
        this._forEach(({x, y}) => this._grid.setCellEventHandlers(x, y, handlers));
    }

    // Support for adding patterns from menu

    previewPattern(pattern, dx = 0, dy = 0, on = false) {
        const previewCell = on ?
            cell => {this._grid.setColorAndOpacity(cell, this.colors.on, 0.8)} :
            cell => {this._grid.setColorAndOpacity(cell, this._colorAt(cell), 1.0)};
        for (let cell of this._gameLogic.translatePattern(pattern, dx, dy)) {
            previewCell(cell);
        }
    }

     _colorAt(p) {
        return this.hasCell(p) ? this.colors.on : this.colors.off;
    }
}
