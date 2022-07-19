/*
 * From https://www.redblobgames.com/x/2226-roguelike-dev/
 * Copyright 2022 Red Blob Games <redblobgames@gmail.com>
 * License: Apache-2.0 <http://www.apache.org/licenses/LICENSE-2.0.html>
 */

import { randInt } from "./util";
import { Resource } from "./entity";

export type Point = {x: number, y: number};
export type Side = 'W' | 'N';
export type Edge = {x: number; y: number; s: Side};

const MAP_BOUNDS = {
    left: 0,
    top: 0,
    right: 60,
    bottom: 40,
};

// Javascript Map only takes string keys, but I want to take other types
class KeyMap<T, U> extends Map {
    toStr: (key: T) => string;
    constructor (toStr: (key: T) => string) {
        super();
        this.toStr = toStr;
    }
    override get(key: T): U        { return super.get(this.toStr(key)); }
    override has(key: T): boolean  { return super.has(this.toStr(key)); }
    override set(key: T, value: U) { return super.set(this.toStr(key), value); }
    override delete(key: T)        { return super.delete(this.toStr(key)); }
}
function tileToKey(p: Point): string { return `${p.x},${p.y}`; }
function edgeToKey(e: Edge): string { return `${e.x},${e.y},${e.s}`; }

type TileType = 'grass' | 'river' | 'plains' | 'desert';
type TileMap = KeyMap<Point, TileType>;
type ResourceMap = KeyMap<Point, Resource>;
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
type RoomMap = KeyMap<Point, RoomId>;
type Room = {
    type: RoomType;
    tiles: Point[];
};

export class GameMap {
    bounds = MAP_BOUNDS;
    tiles: TileMap = new KeyMap(tileToKey);
    resources: ResourceMap = new KeyMap(tileToKey);
    edges: EdgeMap = new KeyMap(edgeToKey);
    
    nextRoomId = 1;
    roomAt: RoomMap = new KeyMap(tileToKey);
    rooms: Map<number, Room> = new Map();

    constructor() {
        function tweakNumber(n: number, halfprob=0.3): number {
            if (Math.random() < halfprob) return n-1;
            if (Math.random() < halfprob) return n+1;
            return n;
        }
        
        const {left, top, right, bottom} = this.bounds;
        for (let y = top; y <= bottom; y++) {
            for (let x = left; x <= right; x++) {
                this.tiles.set({x, y}, 'grass');
            }
        }
        
        let riverX = 10;
        let plainsStart = 20;
        let plainsWidth = 10;
        for (let y = top; y <= bottom; y++) {
            riverX = Math.max(3, tweakNumber(riverX));
            plainsStart = Math.max(5, tweakNumber(plainsStart));
            plainsWidth = Math.max(3, tweakNumber(plainsWidth));
            
            for (let x = left; x <= right; x++) {
                let tileType: TileType =
                    x < riverX ? 'grass'
                    : x < riverX+2 ? 'river'
                    : x < riverX + plainsStart ? 'grass'
                    : x < riverX + plainsStart + plainsWidth ? 'plains'
                    : 'desert';
                this.tiles.set({x, y}, tileType);
                if (tileType === 'grass' && randInt(1, 100) <= 20) {
                    this.resources.set({x, y}, new Resource(`berry-plant-${x},${y}`, {x, y}, {sprite: 'grass'}));
                } else if (tileType === 'plains' && randInt(1, 100) <= 20) {
                    this.resources.set({x, y}, new Resource(`tree-${x},${y}`, {x, y}, {sprite: 'baobab'}));
                }
            }
        }
    }
    
    inBounds(p: Point) {
        const {left, top, right, bottom} = this.bounds;
        return left <= p.x && p.x <= right
            && top <= p.y && p.y <= bottom;
    }

    rebuildAllEdges() {
        // This is a placeholder until I have NPCs who can build the walls
        const processEdge = (edge: Edge) => {
            let [tile1, tile2] = edgeJoins(edge);
            let needWall = this.roomAt.get(tile1) !== this.roomAt.get(tile2);
            let hasWall = this.edges.get(edge);
            if (needWall && !hasWall) { this.edges.set(edge, 'wall'); }
            if (!needWall && hasWall) { this.edges.delete(edge); }
        };
        
        const {left, top, right, bottom} = this.bounds;
        for (let y = top; y <= bottom + 1; y++) {
            for (let x = left; x <= right + 1; x++) {
                if (y <= bottom) processEdge({x, y, s: 'W'});
                if (x <= right) processEdge({x, y, s: 'N'});
            }
        }
    }
}

export const map = new GameMap();
