/*
 * From https://www.redblobgames.com/x/2226-roguelike-dev/
 * Copyright 2022 Red Blob Games <redblobgames@gmail.com>
 * License: Apache-2.0 <http://www.apache.org/licenses/LICENSE-2.0.html>
 */

export type Point = {x: number, y: number};

const MAP_BOUNDS = {
    left: 0,
    top: 0,
    right: 10,
    bottom: 10,
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

type TileType = 'floor' | 'wall';
type TileMap = KeyMap<Point, TileType>;

export class GameMap {
    tiles: TileMap = new KeyMap((p: Point) => `${p.x},${p.y}`);

    constructor() {
        for (let q = 5; q < 10; q++) {
            this.tiles.set({x: q, y: 7}, 'wall');
        }
    }
    
    inBounds(p: Point) {
        const {left, top, right, bottom} = MAP_BOUNDS;
        return left <= p.x && p.x <= right
            && top <= p.y && p.y <= bottom;
    }
}

export const map = new GameMap();
