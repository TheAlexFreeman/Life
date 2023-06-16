const _COLUMNS = ['name', 'preview', 'edit', 'delete'];

function createElement(tagName, className='', textContent='') {
    const element = document.createElement(tagName);
    element.className = className;
    if (textContent) {
        element.textContent = textContent;
    }
    return element;
}

function _createTableHead() {
    const tHead = createElement('thead');
    const row = createElement('tr');
    _COLUMNS.forEach(columnName => {
        const headerCell = createElement('th');
        headerCell.appendChild(createElement('span', 'menu-table-header', columnName))
        row.appendChild(headerCell)
    });
    tHead.appendChild(row);
    return tHead;
}

const SETTINGS = {colors: {on: 'limegreen', off: 'lightgray'}, borders: true, editable: false}

class PatternMenu {
    _patterns = [];
    _menu = createElement('tbody', 'menu-body');

    selectedPattern = null;
    onPatternSelected = pattern => console.dir(pattern);

    constructor(root, patterns=[]) {
        const table = createElement('table', 'menu-table');
        table.appendChild(_createTableHead());
        table.appendChild(this._menu);
        patterns.forEach(pattern => this.addPattern(pattern));
        root.appendChild(table);
    }

    updateCellColor(color = 'limegreen') {
        this._patterns.forEach(game => game.setCellColor(color));
    }
    updateBackgroundColor(color = 'lightgray') {
        this._patterns.forEach(game => game.setBackgroundColor(color));
    }

    addPattern(pattern) {
        const row = createElement('tr', 'menu-item');
        const nameCell = createElement('td', 'pattern-name', pattern.name);
        nameCell.onclick = () => this.onPatternSelected(pattern);
        row.appendChild(nameCell);
        const previewCell = this._createPreviewCell(pattern);
        row.appendChild(previewCell);
        row.appendChild(createElement('td', 'pattern-edit'));
        row.appendChild(createElement('td', 'pattern-delete'));
        this._menu.appendChild(row);
    }

    _createPreviewCell(pattern) {
        const previewCell = createElement('td', 'pattern-preview');
        const rotateLeft = createElement('a', 'rotate-button');
        rotateLeft.textContent = `↺`;
        const rotateRight = createElement('a', 'rotate-button');
        rotateRight.textContent = `↻`;
        const previewFrame = createElement('div', 'preview-grid-frame');
        previewCell.appendChild(rotateLeft);
        previewCell.appendChild(previewFrame);
        previewCell.appendChild(rotateRight);
        const game = this._createPreviewGrid(previewFrame, pattern);
        previewFrame.onclick = () => this.onPatternSelected({...pattern, points: game.normalizedCells});
        rotateLeft.onclick = () => game.rotate(false);
        rotateRight.onclick = () => game.rotate(true);
        this._patterns.push(game);
        return previewCell;
    }

    _createPreviewGrid(frame, pattern) {
        const points = new Points(...pattern.points);
        const padding = {x: 2, y: 2};
        const size = ptAdd(points.boundingBox, ptAdd(padding, padding));
        return new Game({...SETTINGS, size}, frame, points.translateToList(padding.x, padding.y))
    }
}