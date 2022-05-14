class GameMemory {
    past = [];
    future = [];
    isDirty = false;

    constructor() { }

    get isEmpty() {
        return this.past.length === 0;
    }

    get isCurrent() {
        return this.future.length === 0;
    }

    addTick(changes) {
        this.isDirty = false;
        this.past.push(changes);
        this.generationCount += 1;
    }

    addEdit(changes) {
        if (!this.isDirty) {
            this.isDirty = true;
            this.future = [];
            this.past.push([]);
        }
        this.past[this.past.length - 1].push(...changes);
    }

    getNext() {
        const [first, ...rest] = this.past;
        return this.future.pop();
    }

    back() {
        const last = this.past.pop();
        if (last[0] === null) {
            last.shift();
            this.isDirty = false;
        }
        this.future.push(last);
        return last;
    }
}















class SiteActions {
    game;
    grid;
    isDirty = false;

    constructor(size, colors) {
        this.game = new Game(size);
        this.grid = new Grid(size, colors);
        this.resetCellEventHandlers();
    }

    get isEmpty() {
        return !this.game.hasCells;
    }

    get currentPattern() {
        return this.game.normalizedCells;
    }

    clearBoard() {
        this.game.clear();
        this.grid.clear();
    }

    updateSize(size) {
        this.game.setSize(size);
        this.grid.setSize(size);
        for (let { x, y } of this.game.liveCells) {
            this.grid.addCell(x, y);
        }
        this.resetCellEventHandlers();
    }

    updateBorders(borders = false) {
        this.game.setBorders(borders);
        this.grid.setBorders(borders);
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
        this.isDirty = false;
    }

    back() {
        const { changes, dirty } = this.game.back();
        for (let { x, y } of changes) {
            this.toggleCell(x, y);
        }
        this.isDirty = false;
    }

    toggleCell(x, y) {
        if (this.game.hasCell({ x, y })) {
            this.removeCell(x, y);
            return -1;
        } else {
            this.addCell(x, y);
            return 1;
        }
    }

    addCell(x, y) {
        this.game.addCell({ x, y });
        this.grid.addCell(x, y);
    }

    removeCell(x, y) {
        this.game.removeCell({ x, y });
        this.grid.removeCell(x, y);
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
                    const pattern = this.grid.translatePattern(points, x, y);
                    const newCells = pattern.filter(p => !this.game.hasCell(p));
                    if (newCells.length && this.game.memory.length) {
                        this.game.memory.push([null, ...newCells]);
                        for (let cell of newCells) {
                            this.addCell(cell.x, cell.y)
                        }
                    }
                    this.resetCellEventHandlers();
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

}
