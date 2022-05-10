class SiteActions {
    menuSelect = document.getElementById('pattern-menu');
    sizeInputs = {
        width: document.getElementById('width'),
        height: document.getElementById('height')
    }
    colorInputs = {
        on: document.getElementById('cell-color'),
        off: document.getElementById('background-color')
    }
    patternNameInput = document.getElementById('pattern-name');
    generationCounter = document.getElementById('gen-counter');
    populationCounter = document.getElementById('pop-counter');
    game;
    grid;
    isDirty = false;

    constructor() {
        this.game = new Game(this.size);
        this.grid = new Grid(this.size, this.colors);
        this.resetCellEventHandlers();
        document.getElementById('grid-library').onmouseout = () => {
            this.menuSelect.blur();
        }
    }

    get generationCount() {
        return parseInt(this.generationCounter.textContent);
    }
    set generationCount(value) {
        this.generationCounter.textContent = value;
    }

    get populationCount() {
        return parseInt(this.populationCounter.textContent);
    }
    set populationCount(value) {
        this.populationCounter.textContent = value;
    }

    get size() {
        const { height, width } = this.sizeInputs;
        return {
            x: parseInt(height.value),
            y: parseInt(width.value)
        }
    }

    get colors() {
        const { on, off } = this.colorInputs;
        return {
            on: on.value,
            off: off.value
        }
    }

    get patternName() {
        return this.patternNameInput.value;
    }

    get patternId() {
        return this.menuSelect.value;
    }

    get isEmpty() {
        return !this.game.hasCells;
    }

    get currentPattern() {
        return this.game.normalizedCells;
    }

    validatePattern() {
        if (this.isEmpty) return window.alert("Pattern cannot be empty.");
        const name = this.patternName;
        const creator = this.creatorName || "Anonymouse";
        if (!name) return window.alert("Pattern must have a name.");
        return { name, creator, points: this.currentPattern };
    }

    clearBoard() {
        this.game.clear();
        this.grid.clear();
        this.generationCount = 0;
        this.populationCount = 0;
    }

    updateSize() {
        this.game.setSize(this.size);
        this.grid.setSize(this.size);
        this.populationCount = 0;
        for (let { x, y } of this.game.liveCells) {
            this.grid.addCell(x, y);
            this.populationCount += 1;
        }
        this.resetCellEventHandlers();
    }

    updateColors(colors) {
        this.grid.setColors(colors);
    }

    updateCellColor(color) {
        this.grid.setCellColor(color);
    }

    updateBackgroundColor(color) {
        this.grid.setBackgroundColor(color);
    }

    tick() {
        for (let { x, y } of this.game.tick()) {
            this.toggleCell(x, y);
        }
        this.generationCount += 1;
        this.isDirty = false;
    }

    back() {
        const { changes, dirty } = this.game.back();
        for (let { x, y } of changes) {
            this.toggleCell(x, y);
        }
        if (!dirty && this.generationCount) {
            this.generationCount -= 1;
        }
        this.isDirty = false;
    }

    addCell(x, y) {
        this.game.addCell({ x, y });
        this.grid.addCell(x, y);
        this.populationCount += 1;
    }

    removeCell(x, y) {
        this.game.removeCell({ x, y });
        this.grid.removeCell(x, y);
        this.populationCount -= 1;
    }

    toggleCell(x, y) {
        if (this.game.hasCell({ x, y })) {
            this.removeCell(x, y);
        } else {
            this.addCell(x, y);
        }
    }

    setPreviewPattern(pattern) {
        if (pattern) {
            const { points } = pattern;

            this.grid.onCellHover(
                (x, y) => () => {
                    this.grid.previewPattern(points, x, y, true)
                },
                (x, y) => () => {
                    this.grid.previewPattern(points, x, y, false)
                }
            );

            this.grid.onCellClick(
                (x, y) => () => {
                    this.isDirty = true;
                    this.grid.previewPattern(points, x, y, false);
                    const pattern = this.grid.translatePattern(points, x, y);
                    const newCells = pattern.filter(p => !this.game.hasCell(p));
                    if (newCells.length) {
                        this.game.memory.push([null, ...newCells]);
                        for (let cell of newCells) {
                            this.addCell(cell.x, cell.y)
                        }
                    }
                    this.resetCellEventHandlers();
                    this.menuSelect.value = null;
                }
            );
        }
    }

    resetCellEventHandlers() {
        this.resetCellClickHandler();
        this.grid.resetCellHover();
    }

    resetCellClickHandler() {
        this.grid.onCellClick((x, y) => () => {
            this.toggleCell(x, y);
            const memory = this.game.memory;
            if (this.isDirty) {
                memory[memory.length - 1].push({ x, y });
            } else {
                this.isDirty = true;
                memory.push([null, { x, y }]);
            }
        });
    }

    addMenuOption(pattern) {
        this.menuSelect.appendChild(menuOption(pattern.id, pattern.name));
    }

    setupMenu(patterns = []) {
        this.menuSelect.innerHTML = '';
        this.menuSelect.appendChild(menuOption(null, '--Select a pattern--'));
        for (let pattern of patterns) {
            this.addMenuOption(pattern);
        }
    }
}

function menuOption(patternId, patternName) {
    const option = document.createElement('option');
    option.value = patternId;
    option.textContent = patternName;
    return option;
}