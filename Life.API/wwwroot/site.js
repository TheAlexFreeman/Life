class SiteActions {
    generationCounter = document.getElementById('gen-counter');
    populationCounter = document.getElementById('pop-counter');
    game;
    grid;
    isDirty = false;

    constructor(size, colors) {
        this.game = new Game(size);
        this.grid = new Grid(size, colors);
        this.resetCellEventHandlers();
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

    get isEmpty() {
        return !this.game.hasCells;
    }

    get currentPattern() {
        return this.game.normalizedCells;
    }

    clearBoard() {
        this.game.clear();
        this.grid.clear();
        this.generationCount = 0;
        this.populationCount = 0;
    }

    updateSize(size) {
        this.game.setSize(size);
        this.grid.setSize(size);
        this.populationCount = 0;
        for (let { x, y } of this.game.liveCells) {
            this.grid.addCell(x, y); // Resize grid w/o deleting info 
            this.populationCount += 1; // How to deal w/ population counter? MEMORY? INPUT?
        }
        this.resetCellEventHandlers(); // This should be manageable w/in GRID
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
                (x, y) => {
                    this.grid.previewPattern(points, x, y, true)
                },
                (x, y) => {
                    this.grid.previewPattern(points, x, y, false)
                }
            );

            this.grid.onCellClick(
                (x, y) => {
                    this.isDirty = true; // MEMORY
                    this.grid.previewPattern(points, x, y, false); // GRID.addPattern -- Should it return new cells?

                    const pattern = this.grid.translatePattern(points, x, y);
                    const newCells = pattern.filter(p => !this.game.hasCell(p));
                    if (newCells.length) { // ALL this belongs in memory mgmt class
                        if (this.game.memory.length) { this.game.memory.push([null, ...newCells]); }
                        for (let cell of newCells) {
                            this.addCell(cell.x, cell.y) // How to add new cells to game?
                        }
                    }
                    this.resetCellEventHandlers(); // GRID.addPattern -- de-curry lambda function to straight (x, y) => {}
                    this.menuSelect.value = null; // INPUT
                }
            );
        }
    }

    resetCellEventHandlers() {
        this.resetCellClickHandler();
        this.grid.resetCellHover();
    }

    resetCellClickHandler() { // Should this belong to GRID? INPUT? How can GAME/MEMORY get updated?
        this.grid.onCellClick((x, y) => () => {
            this.toggleCell(x, y);
            const memory = this.game.memory;
            if (this.isDirty) {
                memory[memory.length - 1].push({ x, y });
            } else if (memory.length) {
                this.isDirty = true;
                memory.push([null, { x, y }]);
            }
        });
    }

}
