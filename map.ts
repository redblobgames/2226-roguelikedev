/*
 * From https://www.redblobgames.com/x/2226-roguelike-dev/
 * Copyright 2022 Red Blob Games <redblobgames@gmail.com>
 * License: Apache-2.0 <http://www.apache.org/licenses/LICENSE-2.0.html>
 */

export type Point = {x: number, y: number};
export type Side = 'W' | 'N';
export type Edge = {x: number; y: number; s: Side};

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
function tileToKey(p: Point): string { return `${p.x},${p.y}`; }
function edgeToKey(e: Edge): string { return `${e.x},${e.y},${e.s}`; }

type TileType = 'grass' | 'river' | 'desert' | 'mountain';
type TileMap = KeyMap<Point, TileType>;
type ObjectType = 'tree' | 'wall';
type ObjectMap = KeyMap<Point, ObjectType>;
type EdgeData = 'wall' | 'door';
type EdgeMap = KeyMap<Edge, EdgeData>;

export function adjacentToTile(p: Point): {edge: Edge, tile: Point}[] {
    let {x, y} = p;
    return [
        {edge: {x, y, s: 'N'}, tile: {x, y: y-1}},
        {edge: {x, y, s: 'W'}, tile: {x: x-1, y}},
        {edge: {x, y: y+1, s: 'N'}, tile: {x, y: y+1}},
        {edge: {x: x+1, y, s: 'W'}, tile: {x: x+1, y}},
    ];
}

export function edgeJoins(edge: Edge): [Point, Point] {
    let tile1 = {x: edge.x, y: edge.y};
    let tile2 = edge.s === 'W'? {x: edge.x-1, y: edge.y} : {x: edge.x, y: edge.y-1};
    return [tile1, tile2];
}

export function edgeBetween(a: Point, b: Point): undefined | Edge {
    if (a.x === b.x && a.y === b.y-1) { return {x: b.x, y: b.y, s: 'N'}; }
    if (a.x === b.x && a.y === b.y+1) { return {x: a.x, y: a.y, s: 'N'}; }
    if (a.x === b.x-1 && a.y === b.y) { return {x: b.x, y: b.y, s: 'W'}; }
    if (a.x === b.x+1 && a.y === b.y) { return {x: a.x, y: a.y, s: 'W'}; }
    return undefined;
}

type RoomType = 'bedroom' | 'stockpile';
type RoomId = number;

type Room = {
    type: RoomType;
    tiles: Point[];
};

export class GameMap {
    bounds = MAP_BOUNDS;
    tiles: TileMap = new KeyMap(tileToKey);
    objects: ObjectMap = new KeyMap(tileToKey);
    edges: EdgeMap = new KeyMap(edgeToKey);
    rooms: Map<number, Room> = new Map();

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
