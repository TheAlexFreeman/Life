const SIZE = { x: 150, y: 150 };

function create(tagName = 'div', className = '') {
    const el = document.createElement(tagName);
    el.className = className;
    return el;
}

class SmartGrid {
    size;
    grid = [];
    gridElement;
    liveCells = new Points();
    relevantCells = new Points();
    memory = [];
    previewPattern = null;

    constructor(size = SIZE, id = 'grid') {
        this.gridElement = document.getElementById(id);
        this.size = size;
        this.fillGrid();
    }

    get hasCells() {
        return this.liveCells.hasPoints;
    }

    get liveCellsList() {
        return this.liveCells.list;
    }

    get normalizedCells() {
        return this.liveCells.atOrigin;
    }

    neighbors(point) {
        return neighbors(point).map(p => this.mod(p));
    }

    mod(point) {
        const { x, y } = this.size;
        return {
            x: (x + point.x) % x,
            y: (y + point.y) % y
        }
    }

    ptAdd(p1, p2) {
        const { x, y } = this.size;
        return {
            x: (p1.x + p2.x) % x,
            y: (p1.y + p2.y) % y,
        }
    }

    updateSize(x = 1, y = 1) {
        this.eraseGrid();
        this.fillGrid(x, y);
    }

    updateWidth(width) {
        this.eraseGrid();
        this.size.y = parseInt(width);
        this.fillGrid();
    }

    updateHeight(height) {
        this.eraseGrid();
        this.size.x = parseInt(height);
        this.fillGrid();
    }

    eraseGrid() {
        this.liveCellsList.forEach(p => this.removeCell(p));
        this.relevantCells.clear();
        this.memory = [];
    }

    fillGrid() {
        const { x, y } = this.size;
        for (let row = 0; row < x; row++) {
            this.createRow(row, y);
        }
    }

    createRow(x = 0, columns = 10) {
        const row = create('div', 'row');
        this.grid[x] = [];

        for (let y = 0; y < columns; y++) {
            const cell = create('span', 'cell');
            const p = { x, y };
            cell.onclick = this.cellClickHandler(p);
            cell.onmouseover = this.cellMouseOverHandler(cell, p);
            cell.onmouseout = this.cellMouseOutHandler(cell, p);

            row.appendChild(cell);
            this.grid[x].push(cell);
        }

        this.gridElement.appendChild(row);
    }

    cellClickHandler = p => () => {
        if (this.previewPattern) {
            const pattern = this.previewPattern;
            this.previewPattern = null;
            this.preview(p, pattern.points, false);

            for (let point of pattern.points) {
                this.addCell(this.ptAdd(p, point));
            }
        } else {
            if (this.memory.length) {
                this.memory[this.memory.length - 1].push(p);
            }
            this.toggleCell(p);
        }
    }

    cellMouseOverHandler = (cell, p) => () => {
        cell.style.opacity = 0.5;
        if (this.previewPattern) {
            this.preview(p, this.previewPattern.points)
        }
    }

    cellMouseOutHandler = (cell, p) => () => {
        cell.style.opacity = 1.0;
        if (this.previewPattern) {
            this.preview(p, this.previewPattern.points, false);
        }
    }

    preview(p, cells, flag = true) {
        for (let cell of cells) {
            const { x, y } = this.ptAdd(p, cell);
            const cellElement = this.grid[x][y];
            cellElement.style.backgroundColor = flag ? 'limegreen' :
                (this.liveCells.has({ x, y }) ? 'limegreen' : 'lightgray');
            cellElement.style.opacity = flag ? 0.75 : 1.0;
        }
    }

    toggleCell(point) {
        if (this.liveCells.has(point)) {
            this.removeCell(point);
        } else {
            this.addCell(point);
        }
    }

    addCell(point) {
        this.liveCells.add(point);
        this.relevantCells.addPoints(point, ...this.neighbors(point));
        this.updateCellElement(point, true);
    }

    removeCell(point) {
        this.liveCells.remove(point);
        this.updateCellElement(point, false);
    }

    updateCellElement(p, alive = true) {
        const cellElement = this.grid[p.x][p.y];
        cellElement.style.backgroundColor = alive ? 'limegreen' : 'lightgray';
    }

    countLiveNeighbors(point = { x: 0, y: 0 }) {
        return this.neighbors(point).filter(p => this.liveCells.has(p)).length;
    }

    step() {
        const changes = [];
        for (let point of this.relevantCells.list) {
            let liveNeighborCount = this.countLiveNeighbors(point);

            if (liveNeighborCount < 2) {
                this.relevantCells.remove(point);
            }

            if (this.liveCells.has(point)) {
                if (liveNeighborCount < 2 || liveNeighborCount > 3) {
                    changes.push(point);
                }
            } else {
                if (liveNeighborCount === 3) {
                    changes.push(point);
                }
            }
        }

        if (changes.length) {
            this.memory.push(changes);
            changes.forEach(p => this.toggleCell(p));
        }
    }

    back() {
        const changes = this.memory.pop();
        changes.forEach(p => this.toggleCell(p));
    }
}
