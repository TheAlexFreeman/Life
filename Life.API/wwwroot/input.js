class InputHandler {
    speedSlider = document.getElementById('speed-slider');
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

    generationCounter = document.getElementById('gen-counter');
    generationInput = document.getElementById('gen-input');
    populationCounter = document.getElementById('pop-counter');

    constructor() { }

    get tickDelay() {
        switch (this.speedSlider.valueAsNumber) {
            case 0: return 750;
            case 1: return 666;
            case 2: return 500;
            case 3: return 333;
            case 4: return 250;
            case 5: return 125;
            case 6: return 88;
            case 7: return 50;
            case 8: return 20;
            case 9: return 10;
            case 10: return 1;
            default: return 1000;
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

    showGenerationInput() {
        this.generationInput.value = this.generationCount;
        this.generationCounter.hidden = true;
        this.generationInput.hidden = false;
        this.generationInput.focus();
    }

    hideGenerationInput() {
        this.generationInput.hidden = true;
        this.generationCounter.hidden = false;
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