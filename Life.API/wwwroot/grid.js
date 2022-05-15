function create(tagName = 'div', className = '') {
    const el = document.createElement(tagName);
    el.className = className;
    return el;
}

class Grid {
    colors = { on: 'limegreen', off: 'lightgray' };
    root;
    size;
    hasBorders = false;
    _grid;

    constructor(size, colors, borders = false, cells = []) {
        this.root = document.getElementById('grid');
        this.colors = colors;
        this.setSize(size);
        this.setBorders(borders);

        cells.forEach(({ x, y }) => {
            if (x < size.x && y < size.y) {
                this.toggleCell(x, y)
            }
        });
    }

    setBorders(on = false) {
        const value = on ? "1px solid black" : "1px dashed gray";
        this.setBorderTop(value);
        this.setBorderBottom(value);
        this.setBorderLeft(value);
        this.setBorderRight(value);
    }

    setBorderTop(value) {
        for (let cell of this._grid[0]) {
            cell.element.style.borderTop = value;
        }
    }

    setBorderBottom(value) {
        for (let cell of this._grid[this.size.x - 1]) {
            cell.element.style.borderBottom = value;
        }
    }

    setBorderLeft(value) {
        for (let row of this._grid) {
            row[0].element.style.borderLeft = value;
        }
    }

    setBorderRight(value) {
        for (let row of this._grid) {
            row[this.size.y - 1].element.style.borderRight = value;
        }
    }

    setColors(colors) {
        this.colors = colors;
        for (let row of this._grid) {
            for (let cell of row) {
                this.normalizeCellColor(cell);
            }
        }
    }

    setCellColor(color) {
        this.colors.on = color;
        for (let row of this._grid) {
            for (let cell of row) {
                if (cell.isAlive) {
                    cell.element.style.backgroundColor = color;
                }
            }
        }
    }

    setBackgroundColor(color) {
        this.colors.off = color;
        for (let row of this._grid) {
            for (let cell of row) {
                if (!cell.isAlive) {
                    cell.element.style.backgroundColor = color;
                }
            }
        }
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
        cell.element.style.backgroundColor = this.colors.on;
    }

    removeCells(cells) {
        for (let { x, y } of cells) {
            this.removeCell(x, y);
        }
    }

    removeCell(x, y) {
        const cell = this._grid[x][y];
        cell.isAlive = false;
        cell.element.style.backgroundColor = this.colors.off;
    }

    toggleCell(x, y) {
        const cell = this._grid[x][y];
        cell.isAlive = !cell.isAlive;
        this.normalizeCellColor(cell);
    }

    normalizeCellColor(cell) {
        cell.element.style.opacity = 1.0;
        cell.element.style.backgroundColor =
            cell.isAlive ? this.colors.on : this.colors.off;
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
        // TODO: Toggle borders on/off
        return {
            x: (p1.x + p2.x) % this.size.x,
            y: (p1.y + p2.y) % this.size.y,
        }
    }

    previewCell(x, y, on = true) {
        const cell = this._grid[x][y];
        if (on) {
            cell.element.style.opacity = 0.75;
            cell.element.style.backgroundColor = this.colors.on;
        } else {
            cell.element.style.opacity = 1.0;
            this.normalizeCellColor(cell);
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
        for (let row of this._grid) {
            for (let cell of row) {
                let { element } = cell;
                element.onmouseover = () => { element.style.opacity = 0.5; };
                element.onmouseout = () => { element.style.opacity = 1.0; };
                element.style.opacity = 1.0;
                this.normalizeCellColor(cell)
            }
        }
    }

    onCellHover(mouseOver, mouseOut) {
        for (let x = 0; x < this.size.x; x++) {
            for (let y = 0; y < this.size.y; y++) {
                let cell = this._grid[x][y].element
                cell.onmouseover = () => {
                    cell.style.opacity = 0.5;
                    mouseOver(x, y);
                }
                cell.onmouseout = () => {
                    cell.style.opacity = 1.0;
                    mouseOut(x, y);
                }
            }
        }
    }
}
