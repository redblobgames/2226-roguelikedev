/*
 * From https://www.redblobgames.com/x/2226-roguelike-dev/
 * Copyright 2022 Red Blob Games <redblobgames@gmail.com>
 * License: Apache-2.0 <http://www.apache.org/licenses/LICENSE-2.0.html>
 */

export type Point = {x: number, y: number};

const MAP_BOUNDS = {
    left: 0,
    top: 0,
    right: 80,
    bottom: 50,
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

type TileType = 'grass' | 'river' | 'desert' | 'mountain';
type TileMap = KeyMap<Point, TileType>;
type ObjectType = 'tree' | 'wall';
type ObjectMap = KeyMap<Point, ObjectType>;

export class GameMap {
    bounds = MAP_BOUNDS;
    tiles: TileMap = new KeyMap((p: Point) => `${p.x},${p.y}`);
    objects: ObjectMap = new KeyMap((p: Point) => `${p.x},${p.y}`);

    constructor() {
        function tweakNumber(n: number, halfprob=0.3): number {
            if (Math.random() < halfprob) return n-1;
            if (Math.random() < halfprob) return n+1;
            return n;
        }
        
        const {left, top, right, bottom} = this.bounds;
        for (let r = top; r <= bottom; r++) {
            for (let q = left; q <= right; q++) {
                this.tiles.set({x: q, y: r}, 'grass');
            }
        }
        let riverQ = 10;
        let desertStart = 20;
        let desertWidth = 10;
        for (let r = top; r <= bottom; r++) {
            riverQ = Math.max(3, tweakNumber(riverQ));
            desertStart = Math.max(5, tweakNumber(desertStart));
            desertWidth = Math.max(3, tweakNumber(desertWidth));
            
            for (let q = left; q <= right; q++) {
                let tileType: TileType =
                    q < riverQ ? 'grass'
                    : q < riverQ+2 ? 'river'
                    : q < riverQ + desertStart ? 'grass'
                    : q < riverQ + desertStart + desertWidth ? 'desert'
                    : 'mountain';
                this.tiles.set({x: q, y: r}, tileType);
            }
        }
    }
    
    inBounds(p: Point) {
        const {left, top, right, bottom} = this.bounds;
        return left <= p.x && p.x <= right
            && top <= p.y && p.y <= bottom;
    }
}

export const map = new GameMap();
