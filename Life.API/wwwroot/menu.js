const _COLUMNS = ['name', 'preview'];

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
    _COLUMNS.forEach(columnName => row.appendChild(createElement('th', 'menu-table-header', columnName)));
    tHead.appendChild(row);
    return tHead;
}

const SETTINGS = {size: {x: 10, y: 10}, colors: {on: 'limegreen', off: 'lightgray'}, borders: true, editable: false}

class PatternMenu {
    _patterns = [];
    _menu;

    selectedPattern = null;
    onPatternSelected = pattern => console.dir(pattern);

    constructor(root, patterns=[]) {
        const table = createElement('table', 'menu-table');
        table.appendChild(_createTableHead());
        this._menu = createElement('tbody', 'menu-body');
        table.appendChild(this._menu);
        patterns.forEach(pattern => this.addPattern(pattern));
        root.appendChild(table);
    }

    addPattern(pattern) {
        const row = createElement('tr', 'menu-item');
        row.appendChild(createElement('td', 'pattern-name', pattern.name));
        const previewCell = this._createPreviewCell(pattern);
        row.appendChild(previewCell);
        this._menu.appendChild(row);
    }

    _createPreviewCell(pattern) {
        const { points } = pattern;
        const previewCell = createElement('td', 'pattern-preview');
        previewCell.onclick = () => this.onPatternSelected(pattern);
        const size = {
            // TODO: Replace string keys w/ dot notation
            x: Math.max(10, ...points.map(p => p['x'] + 3)),
            y: Math.max(10, ...points.map(p => p['y'] + 3))
        }
        previewCell.style.height = `${size.x * 15}px`;
        previewCell.style.width = `${size.y * 15}px`;
        this._patterns.push(new SmartGrid(previewCell, {...SETTINGS, size}, points.map(p => ptAdd(p, point(1, 1)))));
        return previewCell;
    }
}