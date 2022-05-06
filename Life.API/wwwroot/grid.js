function create(tagName = 'div', className = '') {
    const el = document.createElement(tagName);
    el.className = className;
    return el;
}

const COLORS = {
    ON: 'limegreen',
    OFF: 'lightgray'
}

function normalizeCellColor(cell) {
    cell.element.style.opacity = 1.0;
    cell.element.style.backgroundColor =
        cell.isAlive ? COLORS.ON : COLORS.OFF;
}

class Grid {
    root;
    size;
    _grid;

    constructor(size, cells = []) {
        this.root = document.getElementById('grid');
        this.root.onkeydown = () => console.log("HELLO");
        this.setSize(size);
        cells.forEach(({ x, y }) => {
            if (x < size.x && y < size.y) {
                this.toggleCell(x, y)
            }
        });
    }

    clear() {
        for (let x = 0; x < this.size.x; x++) {
            for (let y = 0; y < this.size.y; y++)
                this.removeCell(x, y);
        }
    }

    setSize(size) {
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
            this._grid[x].push({ element: cell, isAlive: false });
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
        const cell = this._grid[x][y];
        cell.isAlive = true;
        cell.element.style.backgroundColor = COLORS.ON;
    }

    removeCell(x, y) {
        const cell = this._grid[x][y];
        cell.isAlive = false;
        cell.element.style.backgroundColor = COLORS.OFF;
    }

    toggleCell(x, y) {
        const cell = this._grid[x][y];
        cell.isAlive = !cell.isAlive;
        normalizeCellColor(cell);
    }

    previewPattern(points, dx = 0, dy = 0, on = true) {
        for (let p of this.translatePattern(points, dx, dy)) {
            this.previewCell(p.x, p.y, on);
        }
    }

    translatePattern(points, dx = 0, dy = 0) {
        return points.map(p => this.ptAdd(p, { x: dx, y: dy }));
    }

    ptAdd(p1, p2) {
        // TODO: Toggle borders on/off
        return {
            x: (p1.x + p2.x) % this.size.x,
            y: (p1.y + p2.y) % this.size.y,
        }
    }

    previewCell(x, y, on = true) {
        const cell = this._grid[x][y];
        if (on) {
            cell.element.style.opacity = 0.75
            cell.element.style.backgroundColor = COLORS.ON;
        } else {
            normalizeCellColor(cell);
        }
    }

    onCellClick(clickHandler) {
        for (let x = 0; x < this.size.x; x++) {
            for (let y = 0; y < this.size.y; y++) {
                this._grid[x][y].element.onclick = clickHandler(x, y);
            }
        }
    }

    resetCellHover() {
        for (let x = 0; x < this.size.x; x++) {
            for (let y = 0; y < this.size.y; y++) {
                let cell = this._grid[x][y]
                let { element } = cell;
                element.onmouseover = () => { element.style.opacity = 0.5; };
                element.onmouseout = () => { element.style.opacity = 1.0; };
                normalizeCellColor(cell)
            }
        }
    }

    onCellHover(mouseOver, mouseOut) {
        for (let x = 0; x < this.size.x; x++) {
            for (let y = 0; y < this.size.y; y++) {
                let cell = this._grid[x][y].element
                cell.onmouseover = () => {
                    cell.style.opacity = 0.5;
                    mouseOver(x, y)();
                }
                cell.onmouseout = () => {
                    cell.style.opacity = 1.0;
                    mouseOut(x, y)();
                }
            }
        }
    }
}
