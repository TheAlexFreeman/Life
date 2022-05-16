function create(tagName = 'div', className = '') {
    const el = document.createElement(tagName);
    el.className = className;
    return el;
}

class Grid {
    colors = { on: 'limegreen', off: 'lightgray' };
    root;
    size;
    game;
    hasBorders = false;
    _grid;

    // TODO: Dependency Injection in constructor (GAME, INPUT)
    constructor(size, colors, borders = false) {
        this.game = new Game(size, borders);
        this.root = document.getElementById('grid');
        this.colors = colors;
        this.setSize(size);
        this.setBorders(borders);
    }

    mapXY(func = (x, y) => { }) {
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
        this.mapXY((x, y) => this.correctColor(x, y));
    }

    correctColor(x, y) {
        const color = this.game.hasCell({ x, y }) ? colors.on : colors.off;
        this.colorSquare(x, y, color);
    }

    colorSquare(x, y, color) {
        this._grid[x][y].style.backgroundColor = color;
    }

    setCellColor(color) {
        this.colors.on = color;
        for (let { x, y } of this.game.liveCells) {
            this.colorSquare(x, y, color);
        }
    }

    setBackgroundColor(color) {
        this.colors.off = color;
        this.mapXY((x, y) => {
            if (!this.game.hasCell({ x, y })) {
                this.colorSquare(x, y, color);
            }
        });
    }

    clear() {
        this.mapXY((x, y) => this.removeCell(x, y));
    }

    setSize(size) {
        this.game.setSize(size);
        this.size = size;
        this._grid = [];
        this.root.innerHTML = '';
        this.fill(size);
    }

    fill(size) {
        for (let x = 0; x < size.x; x++) {
            this._grid.push([]);
            this.root.appendChild(this.createRow(x, size.y));
        }
    }

    createRow(x = 0, size = 10) {
        const row = create('div', 'row');
        for (let y = 0; y < size; y++) {
            const cell = create('span', 'cell');
            row.appendChild(cell);
            this._grid[x].push(cell);
        }
        return row;
    }

    addPattern(points, dx = 0, dy = 0) {
        this.addCells(this.translatePattern(points, dx, dy));
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
        this.game.toggleCell({ x, y });
        this.correctColor(x, y);
    }

    normalizeCellColor(cell) {
        cell.element.style.backgroundColor =
            cell.isAlive ? this.colors.on : this.colors.off;
    }

    setPreviewPattern(points) {
        this.onCellHover(
            (x, y) => {
                this.previewPattern(points, x, y, true);
            },
            (x, y) => {
                this.previewPattern(points, x, y, false);
            }
        );
        // How to update rest of program on cell click?
        this.onCellClick(
            (x, y) => {
                this.previewPattern(points, x, y, false);
                this.addPattern(points, x, y);
                this.resetCellEventHandlers();
            }
        );
    }

    previewPattern(points, dx = 0, dy = 0, on = true) {
        for (let p of this.translatePattern(points, dx, dy)) {
            this.previewCell(p.x, p.y, on);
        }
    }

    translatePattern(points, dx = 0, dy = 0) {
        const pattern = points.map(p => this.ptAdd(p, { x: dx, y: dy }));
        return this.hasBorders ? pattern.filter(p => this.inBounds(p)) : pattern;
    }

    inBounds(point) {
        return point.x >= 0 && point.y >= 0 &&
            point.x < this.size.x && point.y < this.size.y;
    }

    ptAdd(p1, p2) {
        return {
            x: (p1.x + p2.x) % this.size.x,
            y: (p1.y + p2.y) % this.size.y,
        }
    }

    previewCell(x, y, on = true) {
        const cell = this._grid[x][y];
        if (on) {
            this.colorSquareWithOpacity(x, y, this.colors.on, 0.75);
        } else {
            cell.style.opacity = 1.0;
            this.normalizeCellColor(cell);
        }
    }

    onCellClick(clickHandler = (x, y) => () => { }) {
        this.mapXY((x, y) => {
            this._grid[x][y].onclick = clickHandler(x, y)
        });
    }

    resetCellHover() {
        this.mapXY((x, y) => {
            this.correctColor(x, y);
            const cell = this._grid[x][y];
            cell.onmouseover = () => { cell.style.opacity = 0.5; };
            cell.onmouseout = () => { cell.style.opacity = 1.0; };
            cell.style.opacity = 1.0;
        });
    }

    onCellHover(mouseOver = (x, y) => { }, mouseOut = (x, y) => { }) {
        this.mapXY((x, y) => {
            const cell = this._grid[x][y];
            cell.onmouseover = () => {
                cell.style.opacity = 0.5;
                mouseOver(x, y);
            }
            cell.onmouseout = () => {
                cell.style.opacity = 1.0;
                mouseOut(x, y);
            }
        });
    }
}
