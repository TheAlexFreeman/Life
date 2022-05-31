class InputHandler {
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

    constructor() { }

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

    get colors() {
        const { on, off } = this.colorInputs;
        return {
            on: on.value,
            off: off.value
        }
    }
    get cellColor() {
        return this.colorInputs.on.value;
    }
    get backgroundColor() {
        return this.colorInputs.off.value;
    }

    get patternName() {
        return this.patternNameInput.value;
    }

    get creatorName() {
        return null;
        // return this.creatorNameInput.value;
    }

    get patternId() {
        return this.menuSelect.value;
    }

    validatePattern(grid) {
        if (grid.isEmpty) return window.alert("Pattern cannot be empty.");
        const name = this.patternName;
        const creator = this.creatorName || "Anonymouse";
        if (!name) return window.alert("Pattern must have a name.");
        return { name, creator, points: grid.normalizedPattern };
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
}

function menuOption(patternId, patternName) {
    const option = document.createElement('option');
    option.value = patternId;
    option.textContent = patternName;
    return option;
}