class Grid {
    colors = { on: 'limegreen', off: 'lightgray' };
    root;
    size;
    game;
    hasBorders = false;
    _grid = [];

    // TODO: Dependency Injection in constructor (GAME, INPUT)
    constructor(root, size, colors) {
        this.root = root;
        this.game = new Game(size);
        this.size = size;
        this.colors = colors;
    }

    get population() {
        return this.game.population;
    }

    get pattern() {
        return this.game.liveCells;
    }

    get normalizedPattern() {
        return this.game.normalizedCells;
    }

    appendRow(rowElement) {
        this.root.appendChild(rowElement);
        const row = [];
        for (let cellElement of rowElement.children) {
            row.push(cellElement);
        }
        this._grid.push(row);
    }

    hasCell(x = 0, y = 0) {
        return this.game.hasCell({ x, y });
    }

    tick() {
        const changes = this.game.cellsToChange;
        changes.forEach(({x, y}) => this.toggleCell(x, y));
        return changes;
    }

    _mapXY(func = (x, y) => { }) {
        for (let x = 0; x < this.size.x; x++) {
            for (let y = 0; y < this.size.y; y++) {
                func(x, y);
            }
        }
    }

    setBorders(on = false) {
        this.game.setBorders(on);
        this.hasBorders = on;
        const value = on ? "1px solid black" : "1px dashed gray";
        this.setBordersTopBottom(value);
        this.setBordersLeftRight(value);
    }

    setBordersTopBottom(value) {
        const topRow = this._grid[0];
        const bottomRow = this._grid[this.size.x - 1];
        for (let y = 0; y < this.size.y; y++) {
            topRow[y].style.borderTop = value;
            bottomRow[y].style.borderBottom = value;
        }
    }

    setBordersLeftRight(value) {
        const y = this.size.y - 1;
        for (let row of this._grid) {
            row[0].style.borderLeft = value;
            row[y].style.borderRight = value;
        }
    }

    setColors(colors) {
        this.colors = colors;
        this._mapXY((x, y) => this.correctColor(x, y));
    }

    correctColor(x, y) {
        const { on, off } = this.colors;
        this.colorSquare(x, y, this.hasCell(x, y) ? on : off);
    }

    colorSquare(x, y, color) {
        this._grid[x][y].style.backgroundColor = color;
        return color !== this.colors.off;
    }

    setCellColor(color) {
        this.colors.on = color;
        for (let { x, y } of this.game.liveCells) {
            this.colorSquare(x, y, color);
        }
    }

    setBackgroundColor(color) {
        this.colors.off = color;
        this._mapXY((x, y) => {
            if (!this.hasCell(x, y)) {
                this.colorSquare(x, y, color);
            }
        });
    }

    clear() {
        this._mapXY((x, y) => this.removeCell(x, y));
    }

    deleteContent() {
        this._grid = [];
        this.root.innerHTML = '';
    }

    setSize(size) {
        this.game.setSize(size);
        this.size = size;
    }

    addPattern(pattern, dx = 0, dy = 0) {
        this.previewPattern(pattern, dx, dy, false);
        const result = [];
        for (let { x, y } of this.translatePattern(pattern, dx, dy)) {
            if (!this.hasCell(x, y)) {
                result.push({ x, y });
                this.addCell(x, y);
            }
        }
        return result;
    }

    addCells(cells) {
        for (let { x, y } of cells) {
            this.addCell(x, y);
        }
    }

    addCell(x, y) {
        this.game.addCell({ x, y });
        this.colorSquare(x, y, this.colors.on);
    }

    removeCells(cells) {
        for (let { x, y } of cells) {
            this.removeCell(x, y);
        }
    }

    removeCell(x, y) {
        this.game.removeCell({ x, y });
        this.colorSquare(x, y, this.colors.off);
    }

    toggleCell(x, y) {
        return this.colorSquare(x, y,
            this.game.toggleCell({ x, y })
                ? this.colors.on : this.colors.off
        );
    }

    translatePattern(pattern, dx = 0, dy = 0) {
        const points = pattern.map(p => ({
            x: p.x + dx,
            y: p.y + dy
        })
        );
        return this.hasBorders ? points.filter(p => this.includes(p)) : points.map(p => this.mod(p));
    }

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
        return {
            x: point.x % this.size.x,
            y: point.y % this.size.y
        }
    }

    previewPattern(pattern, dx = 0, dy = 0, on = true) {
        for (let { x, y } of this.translatePattern(pattern, dx, dy)) {
            this.previewCell(x, y, on);
        }
    }

    previewCell(x, y, on = true) {
        const cell = this._grid[x][y];
        cell.style.opacity = on ? 0.8 : 1.0;
        cell.style.backgroundColor = on ? this.colors.on : this.colors.off;
    }

    onCellClick(clickHandler = (x, y) => () => { }) {
        this._mapXY((x, y) => {
            this._grid[x][y].onclick = clickHandler(x, y)
        });
    }

    onCellHover(mouseOver = (x, y) => () => { }, mouseOut = (x, y) => () => { }) {
        this._mapXY((x, y) => {
            const cell = this._grid[x][y];
            cell.onmouseover = mouseOver(x, y);
            cell.onmouseout = mouseOut(x, y);
        });
    }

    resetHover() {
        this._mapXY((x, y) => {
            const cell = this._grid[x][y];
            cell.onmouseover = () => { cell.style.opacity = 0.5; };
            cell.onmouseout = () => { cell.style.opacity = 1.0; };
        });
    }
}
