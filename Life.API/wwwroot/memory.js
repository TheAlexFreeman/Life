class GameMemory {
    _stack = [];
    // _future = []; TODO: Edits indexed by generation for replay?
    isDirty = false;

    generationCounter = document.getElementById('gen-counter');
    get generationCount() {
        return parseInt(this.generationCounter.textContent);
    }
    set generationCount(value) {
        this.generationCounter.textContent = value;
    }

    populationCounter = document.getElementById('pop-counter');
    get populationCount() {
        return parseInt(this.populationCounter.textContent);
    }
    set populationCount(value) {
        this.populationCounter.textContent = value;
    }

    get lastGeneration() {
        return this._stack.length ? this._stack[this._stack.length - 1] : [];
    }

    constructor() { }

    _setDirty(dirty = false) {
        this.isDirty = dirty;
        if (dirty) {
            this.populationCounter.textContent = `${this.populationCount}*`;
            this._stack.push([null]);
        } else {
            this.populationCounter.textContent = this.populationCount;
        }
    }

    addTick(changes) {
        this._stack.push(changes);
        if (this.isDirty) {
            this._setDirty(false);
        }
        this.generationCount += 1;
    }

    addEdit(changes) {
        if (this._stack.length) {
            if (!isDirty) {
                this._setDirty(true);
            }
            this._stack[this._stack.length - 1].push(...changes);
        }
    }

    back() {
        const changes = this._stack.pop();
        if (changes[0] === null) {
            changes.shift();
        } else {
            this.generationCount -= 1
        }
        return changes;
    }
}