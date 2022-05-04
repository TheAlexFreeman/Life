function point(x = 0, y = 0) {
    return { x, y };
}

const ORIGIN = { x: 0, y: 0 };

// Data structure for relevant cells

class Points {
    _map = new Map();

    constructor(...points) {
        const map = new Map();
        points.forEach(p => {
            let { x, y } = p;
            if (!map.has(x)) {
                map.set(x, new Set());
            }

            map.get(x).add(y);
        });
        this._map = map;
    }

    get hasPoints() {
        return this._map.size > 0;
    }

    get size() {
        const result = 0;
        for (let kvp of this._map) {
            result += kvp[1].size;
        }
        return result;
    }

    get list() {
        const result = [];
        for (let kvp of this._map) {
            let x = kvp[0];

            for (let y of kvp[1]) {
                result.push(point(x, y));
            }
        }
        return result;
    }

    get max() {
        const result = { x: 0, y: 0 }
        for (let kvp of this._map) {
            let x = kvp[0];
            if (x > result.x && kvp[1].size) { result.x = x; }
            for (let y of kvp[1]) {
                if (y > result.y) { result.y = y; }
            }
        }
        return { x, y };
    }

    get min() {
        const result = { x: Infinity, y: Infinity }
        for (let kvp of this._map) {
            let x = kvp[0];
            if (x < result.x && kvp[1].size) { result.x = x; }
            for (let y of kvp[1]) {
                if (y < result.y) { result.y = y; }
            }
        }
        return result;
    }

    get boundingBox() {
        const max = { x: 0, y: 0 }
        const min = { x: Infinity, y: Infinity }
        for (let kvp of this._map) {
            let x = kvp[0];
            if (x > max.x && kvp[1].size) { max.x = x; }
            if (x < min.x && kvp[1].size) { min.x = x; }
            for (let y of kvp[1]) {
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
        for (let kvp of this._map) {
            let x = kvp[0];

            for (let y of kvp[1]) {
                result.push(point(x - min.x, y - min.y));
            }
        }
        return result;
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
        for (let kvp of points._map) {
            let x = kvp[0];

            if (this._map.has(x)) {
                const row = this._map.get(x);

                for (let y of kvp[1]) {
                    row.add(y);
                }
            } else {
                this._map.set(x, kvp[1]);
            }
        }
    }

    translate(dx, dy) {
        const newMap = new Map();
        for (let kvp of points._map) {
            let x = kvp[0] + dx;
            newMap.set(x, new Set());

            let row = newMap.get(x);
            for (let y of kvp[1]) {
                row.add(y + dy);
            }
        }
        this._map = newMap;
        return this;
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