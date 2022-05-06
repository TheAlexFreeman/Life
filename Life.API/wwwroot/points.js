function point(x = 0, y = 0) {
    return { x, y };
}

const ORIGIN = { x: 0, y: 0 };

class Points {
    _map = new Map();

    constructor(...points) {
        for (let { x, y } of points) {
            if (!this._map.has(x)) {
                this._map.set(x, new Set());
            }
            this._map.get(x).add(y);
        }
    }

    get hasPoints() {
        return this._map.size > 0;
    }

    get size() {
        const result = 0;
        for (let [_, ys] of this._map) {
            result += ys.size;
        }
        return result;
    }

    get list() {
        const result = [];
        for (let [x, ys] of this._map) {
            for (let y of ys) {
                result.push(point(x, y));
            }
        }
        return result;
    }

    get max() {
        const result = { x: 0, y: 0 }
        for (let [x, ys] of this._map) {
            if (x > result.x && ys.size) {
                result.x = x;
            }
            for (let y of ys) {
                if (y > result.y) {
                    result.y = y;
                }
            }
        }
        return { x, y };
    }

    get min() {
        const result = { x: Infinity, y: Infinity }
        for (let [x, ys] of this._map) {
            if (x < result.x && ys.size) {
                result.x = x;
            }
            for (let y of ys) {
                if (y < result.y) {
                    result.y = y;
                }
            }
        }
        return result;
    }

    get boundingBox() {
        const max = { x: 0, y: 0 }
        const min = { x: Infinity, y: Infinity }
        for (let [x, ys] of this._map) {
            if (ys.size) {
                if (x > max.x) { max.x = x; }
                if (x < min.x) { min.x = x; }
            }
            for (let y of ys) {
                if (y > max.y) { max.y = y; }
                if (y < min.y) { min.y = y; }
            }
        }
        return {
            x: max.x - min.x + 1,
            y: max.y - min.y + 1
        }
    }

    get atOrigin() {
        const result = [];
        const min = this.min;
        for (let [x, ys] of this._map) {
            for (let y of ys) {
                result.push(point(x - min.x, y - min.y));
            }
        }
        return result;
    }

    inBox(min = ORIGIN, max = ORIGIN) {
        const result = new Points();
        for (let [x, ys] of this._map) {
            if (x >= min.x && x < max.x) {
                for (let y of ys) {
                    if (y >= min.y && y < max.y) {
                        result.add({ x, y });
                    }
                }
            }
        }
        return result;
    }

    onBoard(size = { x: 1, y: 1 }) {
        return this.inBox(ORIGIN, size);
    }

    has(p = ORIGIN) {
        const { x, y } = p;
        return this._map.has(x) && this._map.get(x).has(y);
    }

    add(p = ORIGIN) {
        const { x, y } = p;
        if (!this._map.has(x)) {
            this._map.set(x, new Set());
        }
        this._map.get(x).add(y);
    }

    addPoints(...points) {
        points.forEach(p => this.add(p));
    }

    remove(p = ORIGIN) {
        const { x, y } = p;
        if (this._map.has(x)) {
            this._map.get(x).delete(y);
        }
    }

    clear() {
        this._map.clear();
    }

    union(points) {
        for (let [x, ys] of points._map) {
            if (this._map.has(x)) {
                const row = this._map.get(x);
                for (let y of ys) {
                    row.add(y);
                }
            } else {
                this._map.set(x, ys);
            }
        }
    }

    translate(dx, dy) {
        const result = new Points();
        for (let [x, ys] of points._map) {
            for (let y of ys) {
                result.add({ x: x + dx, y: y + dy });
            }
        }
        return result;
    }
}

// Positional Calculations

function comp(f, g) {
    return p => f(g(p));
}

const N = p => ({ ...p, y: p.y + 1 });
const S = p => ({ ...p, y: p.y - 1 });
const E = p => ({ ...p, x: p.x - 1 });
const W = p => ({ ...p, x: p.x + 1 });
const NE = comp(N, E);
const NW = comp(N, W);
const SE = comp(S, E);
const SW = comp(S, W);

const NEIGHBORS = [NW, N, NE, W, E, SW, S, SE];

function neighbors(p = ORIGIN) {
    return NEIGHBORS.map(f => f(p));
}

function neighborSet(p = ORIGIN) {
    return new Points(p, ...neighbors(p));
}