class GameControls {
    generation = 0;
    population = 0;
    _game;

    constructor(game) {
        this._game = game;
    }

    tick() {
        this._game.tick();
        this.population += this._game.population;
        this.generation += 1;
    }

    setPreviewPattern(pattern) {
        const handlers = this._previewPatternHandlers(pattern);
        this._game.setCellEventHandlers(handlers);
    }

    _previewPatternHandlers(pattern) {
        return {
            onClick: (x, y) => (event) => {
                this.addPattern(points, x, y);
                if (!event.shiftKey) {
                    this.resetCellEventHandlers();
                }
            },
            onMouseOver: (x, y) => () => {
                this._game.previewPattern(pattern, x, y, true);
            },
            onMouseOut: (x, y) => () => {
                this._game.previewPattern(pattern, x, y, false);
            }
        }
    }

    addPattern(pattern, x, y) {
        const newCells = this._game.addPattern(pattern, x, y);
        this.population += newCells.length;
    }

    resetCellEventHandlers() {
        this._game.setCellEventHandlers({
            onClick: (x, y) => () => {
                this.toggleCell({x, y});
            }
        });
    }

    toggleCell(p) {
        population += this._game.toggleCell(p);
    }
}
