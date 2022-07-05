/*
 * From https://www.redblobgames.com/x/2226-roguelike-dev/
 * Copyright 2022 Red Blob Games <redblobgames@gmail.com>
 * License: Apache-2.0 <http://www.apache.org/licenses/LICENSE-2.0.html>
 */

export type Point = {x: number, y: number};

const MAP_BOUNDS = {
    left: 0,
    top: 0,
    right: 30,
    bottom: 20,
};

// Javascript Map only takes string keys, but I want to take other types
class KeyMap<T, U> extends Map {
    toStr: (key: T) => string;
    constructor (toStr: (key: T) => string) {
        super();
        this.toStr = toStr;
    }
    get(key: T): U        { return super.get(this.toStr(key)); }
    has(key: T): boolean  { return super.has(this.toStr(key)); }
    set(key: T, value: U) { return super.set(this.toStr(key), value); }
    delete(key: T)        { return super.delete(this.toStr(key)); }
}

type TileType = 'wall' | 'grass' | 'river' | 'desert' | 'mountain';
type TileMap = KeyMap<Point, TileType>;

export class GameMap {
    tiles: TileMap = new KeyMap((p: Point) => `${p.x},${p.y}`);

    constructor() {
        for (let r = MAP_BOUNDS.top; r <= MAP_BOUNDS.bottom; r++) {
            for (let q = MAP_BOUNDS.left; q <= MAP_BOUNDS.right; q++) {
                this.tiles.set({x: q, y: r}, 'grass');
            }
        }
        let q = (MAP_BOUNDS.left + MAP_BOUNDS.right) >> 1;
        for (let r = MAP_BOUNDS.top; r <= MAP_BOUNDS.bottom; r++) {
            this.tiles.set({x: q, y: r}, 'river');
            if (Math.random() < 0.3) q--;
            else if (Math.random() < 0.3) q++;
        }
    }
    
    inBounds(p: Point) {
        const {left, top, right, bottom} = MAP_BOUNDS;
        return left <= p.x && p.x <= right
            && top <= p.y && p.y <= bottom;
    }
}

export const map = new GameMap();
