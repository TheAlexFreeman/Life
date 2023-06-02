function createElement(tagName, className) {
    const result = document.createElement(tagName);
    result.className = className;
    return result;
}

class Grid {
    _grid = [];
    root;

    constructor(frame, settings, cells = []) {
        this.root = this._createGrid(settings, cells);
        frame.appendChild(this.root);
    }

    getColor({x, y}) {
        return this._grid[x][y].style.backgroundColor;
    }
    setColor({x, y}, color) {
        this._grid[x][y].style.backgroundColor = color;
    }
    setOpacity({x, y}, opacity) {
        this._grid[x][y].style.opacity = opacity;
    }
    setColorAndOpacity({x, y}, color, opacity) {
        const { style } = this._grid[x][y];
        style.backgroundColor = color;
        style.opacity = opacity;
    }

    remove() {
        if (this.root) {
            this.root.remove();
        }
    }

    setCellEventHandlers(x = 0, y = 0, handlers) {
        const { onClick, onMouseOver, onMouseOut } = handlers;
        const cell = this._grid[x][y];
        cell.onclick = onClick(x, y);
        cell.onmouseover = onMouseOver ? onMouseOver(x, y) : () => { cell.style.opacity = 0.5; };
        cell.onmouseout = onMouseOut ? onMouseOut(x, y) : () => { cell.style.opacity = 1.0; };
    }

    setBorders(value = false) {
        const borderStyle = value ? "1px solid black" : "1px dashed gray";
        this._setBordersTopBottom(borderStyle);
        this._setBordersLeftRight(borderStyle);
    }

    _setBordersTopBottom(borderStyle) {
        const topRow = this._grid[0];
        const bottomRow = this._grid[this._grid.length - 1];
        for (let y = 0; y < topRow.length; y++) {
            topRow[y].style.borderTop = borderStyle;
            bottomRow[y].style.borderBottom = borderStyle;
        }
    }

    _setBordersLeftRight(borderStyle) {
        const y = this._grid[0].length - 1;
        for (let row of this._grid) {
            row[0].style.borderLeft = borderStyle;
            row[y].style.borderRight = borderStyle;
        }
    }

    // Grid construction methods

    _createGrid(settings, cells) {
        const { size, borders, editable } = settings;
        const gridElement = createElement('div', 'grid');
        if (!editable) {
            gridElement.style.cursor = 'pointer';
        }
        for (let x = 0; x < size.x; x++) {
            gridElement.appendChild(this._createRow(x, size.y, settings, cells.filter(p => p.x === x)));
        }
        this.setBorders(borders);
        return gridElement;
    }

    _createRow(x, size, settings, cells) {
        const row = [];
        const rowElement = createElement('div', 'row');
        for (let y = 0; y < size; y++) {
            const isAlive = cells.some(p => p.x === x && p.y === y);
            const cell = this._createCell(x, y, settings, isAlive);
            row.push(cell);
            rowElement.appendChild(cell);
        }
        this._grid.push(row);
        return rowElement;
    }

    _createCell(x, y, settings, isAlive) {
        const cell = createElement('span', 'cell');
        const { colors } = settings;
        cell.style.backgroundColor = isAlive ? colors.on : colors.off;
        // if (editable) {
        //     cell.onclick = () => {this.toggleCell(x, y);};
        //     cell.onmouseover = () => cell.style.opacity = 0.5;
        //     cell.onmouseout = () => cell.style.opacity = 1.0;
        // }
        return cell;
    }

    // _addRow() {
    //     const {x, y} = size;
    //     const newRow = this._createRow(x, y);
    //     this.root.appendChild(newRow);
    // }

    // _addColumn() {
    //     const { y } = this.size;
    //     const rowElements = this.root.children();
    //     for (let x = 0; x < this.size.x; x++) {
    //         const cell = this._createCell(x, y)
    //         this._grid.push(cell);
    //         rowElements[x].appendChild(cell);
    //     }
    // }

}