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

    constructor(size = SIZE, id = 'grid') {
        this.gridElement = document.getElementById(id);
        this.size = size;
        this.fillGrid();
    }

    get liveCellsList() {
        return this.liveCells.list;
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
        this.grid = [];
        this.gridElement.innerHTML = '';
        this.liveCells.clear();
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
            const cell = this.createCell();
            cell.onclick = this.cellClickHandler({ x, y });

            row.appendChild(cell);
            this.grid[x].push(cell);
        }

        this.gridElement.appendChild(row);
    }

    cellClickHandler = p => () => {
        if (this.memory.length) {
            this.memory[this.memory.length - 1].push(p);
        }
        this.toggleCell(p);
    }

    createCell() {
        const cell = create('span', 'cell');

        cell.onmouseover = function () {
            cell.style.opacity = 0.5;
        }
        cell.onmouseout = function () {
            cell.style.opacity = 1.0;
        }

        return cell;
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
