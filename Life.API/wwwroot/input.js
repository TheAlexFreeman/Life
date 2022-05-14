class InputHandler {
    generationCounter = document.getElementById('gen-counter');
    populationCounter = document.getElementById('pop-counter');

    menuSelect = document.getElementById('pattern-menu');
    sizeInputs = {
        width: document.getElementById('width'),
        height: document.getElementById('height')
    }
    colorInputs = {
        on: document.getElementById('cell-color'),
        off: document.getElementById('background-color')
    }
    borderCheckbox = document.getElementById('borders');
    patternNameInput = document.getElementById('pattern-name');

    cellInputs = {
        hover: {
            on: (points) => (grid) => (x, y) => () => {
                grid.previewPattern(points, x, y, true);
            },
            off: (points) => (grid) => (x, y) => () => {
                grid.previewPattern(points, x, y, false);
            }
        },
        click: (points) => (grid) => (x, y) => () => {
            grid.addPattern(points, x, y);
        }
    }

    constructor(root) {
        window.onkeydown = function (event) {
            if (event.target === document.body) {
                switch (event.keyCode) {
                    case 39: ACTIONS.tick(); break;
                    case 37: ACTIONS.back(); break;
                    case 27: ACTIONS.resetCellEventHandlers(); break;
                    default: return;
                }
            }
        };
        //Setup element event handlers
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

    get borders() {
        return this.borderCheckbox.checked;
    }

    get size() {
        const { height, width } = this.sizeInputs;
        return {
            x: parseInt(height.value),
            y: parseInt(width.value)
        }
    }
    set size(value) {
        const { height, width } = this.sizeInputs;
        height.value = value.x;
        width.value = value.y;
    }

    get colors() {
        const { on, off } = this.colorInputs;
        return {
            on: on.value,
            off: off.value
        }
    }
    set colors(value) {
        const { on, off } = this.colorInputs;
        on.value = value.on;
        off.value = value.off;
    }
    set cellColor(value) {
        this.colorInputs.on = value;
    }
    set backgroundColor(value) {
        this.colorInputs.off = value;
    }

    get patternName() {
        return this.patternNameInput.value;
    }
    set patternName(value) {
        this.patternNameInput.value = value;
    }

    get patternId() {
        return this.menuSelect.value;
    }
    set patternId(value) {
        this.menuSelect.value = value;
    }

    blurMenu() {
        this.menuSelect.blur();
    }

    clear() {
        this.generationCount = 0;
        this.populationCount = 0;
        this.patternName = '';
        this.patternId = null;
    }

    validatePattern() {
        if (this.populationCount === 0) return window.alert("Pattern cannot be empty.");

        const name = this.patternName;
        const creator = this.creatorName || "Anonymouse";
        if (!name) return window.alert("Pattern must have a name.");

        return { name, creator, points: this.currentPattern };
    }

    setupMenu(patterns = []) {
        this.menuSelect.innerHTML = '';
        this.menuSelect.appendChild(menuOption(null, '--Select a pattern--'));

        for (let pattern of patterns) {
            this.addMenuOption(pattern);
        }
    }

    addMenuOption(pattern) {
        this.menuSelect.appendChild(menuOption(pattern.id, pattern.name));
    }

    setPreviewPattern(pattern) {
        if (!pattern) return;
        const { points } = pattern;
        return {
            hover: {
                on: (grid) => (x, y) => () => {
                    grid.previewPattern(points, x, y, true);
                },
                off: (grid) => (x, y) => () => {
                    grid.previewPattern(points, x, y, false);
                }
            },
            click: (grid) => (x, y) => () => {
                isDirty = true;
                const cells = grid.translatePattern(points, x, y);
                const newCells = cells.filter(p => grid.hasCell(p));
                this.resetCellEventHandlers();
            }
        }
    }

}

function menuOption(patternId, patternName) {
    const option = document.createElement('option');
    option.value = patternId;
    option.textContent = patternName;
    return option;
}