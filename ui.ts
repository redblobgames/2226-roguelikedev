/*
 * From https://www.redblobgames.com/x/2226-roguelike-dev/
 * Copyright 2022 Red Blob Games <redblobgames@gmail.com>
 * License: Apache-2.0 <http://www.apache.org/licenses/LICENSE-2.0.html>
 */

export { print } from "./console";
import * as input from "./input";
import { entities } from "./simulation";
import { map, Edge } from "./map";
import { clamp } from "./util";

// Drawing area
export const canvas = document.querySelector("#game") as HTMLCanvasElement;
export const ctx = canvas.getContext('2d');

// Tile map view
const TILE_SIZE = 25;
const VIEWWIDTH = canvas.width / TILE_SIZE;
const VIEWHEIGHT = canvas.height / TILE_SIZE;
// if (VIEWWIDTH % 1.0 !== 0.0 || VIEWHEIGHT % 1.0 !== 0.0) assert("Tile size mismatch");

if (window.devicePixelRatio && window.devicePixelRatio != 1) {
    // Handle hi-dpi displays
    canvas.width *= window.devicePixelRatio;
    canvas.height *= window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
}


// Sprites
declare function require(path: string): string;
function S(svg: string): Path2D {
    // This relies on the way game-icons.net svgs are structured,
    // as a single <path d="…"/>
    return new Path2D(svg.replace(/.* d="/, "").replace(/".*/, ""));
}

export const sprites = {
    person:     S(require("./game-icons/delapouite/person.svg")),
    rooster:    S(require("./game-icons/delapouite/rooster.svg")),
    grass:      S(require("./game-icons/delapouite/grass.svg")),
    wheat:      S(require("./game-icons/lorc/wheat.svg")),
    wall:       S(require("./game-icons/delapouite/stone-wall.svg")),
    door:       S(require("./game-icons/delapouite/door.svg")),
    move:       S(require("./game-icons/delapouite/move.svg")),
    thor_hammer: S(require("./game-icons/delapouite/thor-hammer.svg")),
};

const defaultPath = new Path2D("M 0,0 l 512,0 l 0,512 l -512,0 z");
function drawSprite(x: number, y: number, name: string | null, color="white") {
    ctx.save();
    ctx.translate(TILE_SIZE * x, TILE_SIZE * y);
    ctx.scale(TILE_SIZE/512, TILE_SIZE/512);
    ctx.lineJoin = 'bevel'; // some of the game-icons have sharp corners
    ctx.lineWidth = 2/(TILE_SIZE/512);
    ctx.strokeStyle = "black";
    ctx.stroke(sprites[name] ?? defaultPath);
    ctx.fillStyle = color;
    ctx.fill(sprites[name] ?? defaultPath);
    ctx.restore();
}


export function render() {
    const halfwidth = VIEWWIDTH / 2;
    const halfheight = VIEWHEIGHT / 2;
    let camera = {
        x: clamp(input.current.x + 0.5,
                 map.bounds.left + halfwidth,
                 map.bounds.right - halfwidth + 1),
        y: clamp(input.current.y + 0.5,
                 map.bounds.top + halfheight,
                 map.bounds.bottom - halfheight + 1),
    };

    const dx = halfwidth - camera.x;
    const dy = halfheight - camera.y;
    let view = {
        left: Math.floor(camera.x - halfwidth),
        right: Math.ceil(camera.x + halfwidth),
        top: Math.floor(camera.y - halfheight),
        bottom: Math.ceil(camera.y + halfheight),
    };
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.scale(TILE_SIZE, TILE_SIZE);
    ctx.translate(dx, dy);

    // Tile backgrounds
    const tileRenders = {
        grass: "hsl(100, 30%, 50%)",
        desert: "hsl(50, 20%, 70%)",
        mountain: "hsl(30, 10%, 80%)",
        river: "hsl(250, 50%, 30%)",
    };
    function drawTile(x: number, y: number, sprite: string | null, color: string) {
        ctx.translate(x, y);
        ctx.scale(1/512, 1/512);
        ctx.stroke(sprites[sprite] ?? defaultPath);
        ctx.fillStyle = color;
        ctx.fill(sprites[sprite] ?? defaultPath);
        ctx.scale(512, 512);
        ctx.translate(-x, -y);
    }
    ctx.save();
    ctx.lineJoin = 'bevel'; // some of the game-icons have sharp corners
    ctx.lineWidth = 1/(TILE_SIZE/512);
    ctx.strokeStyle = "black";
    for (let y = view.top; y <= view.bottom; y++) {
        for (let x = view.left; x <= view.right; x++) {
            let tile = map.tiles.get({x, y});
            let render = tileRenders[tile] ?? "red";
            drawTile(x, y, null, render);
            let object = map.objects.get({x, y});
            if (object) {
                drawTile(x, y, object, "white"); // TODO: need to figure out colors, sizes
            }
        }
    }
    ctx.restore();

    // Tile edges
    function drawEdge(edge: Edge) {
        let edgeType = map.edges.get(edge);
        if (!edgeType) return;
        let {x, y, s} = edge;
        let [dirX, dirY] = s === 'W' ? [0, 1] : [1, 0];
        ctx.beginPath();
        switch (edgeType) {
            case 'wall':
                ctx.moveTo(x, y);
                ctx.lineTo(x + dirX, y + dirY);
                break;
            case 'door':
                ctx.moveTo(x + dirX*0.1 - dirY*0.1, y + dirY*0.1 + dirX*0.1);
                ctx.lineTo(x + dirX*0.1 + dirY*0.1, y + dirY*0.1 - dirX*0.1);
                ctx.moveTo(x + dirX*0.9 - dirY*0.1, y + dirY*0.9 + dirX*0.1)
                ctx.lineTo(x + dirX*0.9 + dirY*0.1, y + dirY*0.9 - dirX*0.1)
                break;
        }
        ctx.stroke();
    }
    map.rebuildAllEdges(); // HACK: placeholder
    ctx.save();
    // HACK: translate() here because tile rendering is slightly off,
    // by 1/4 of the line width when drawing tiles; TODO: why?
    ctx.translate(-0.25/TILE_SIZE, -0.25/TILE_SIZE);
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2.5 / TILE_SIZE;
    ctx.lineCap = 'square';
    for (let y = view.top; y <= view.bottom; y++) {
        for (let x = view.left; x <= view.right; x++) {
            drawEdge({x, y, s: 'W'});
            drawEdge({x, y, s: 'N'});
        }
    }
    ctx.restore();

    // TODO: room borders instead of room numbers
    ctx.save();
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    ctx.font = '0.5px monospace';
    ctx.fillStyle = "white";
    for (let y = view.top; y <= view.bottom; y++) {
        for (let x = view.left; x <= view.right; x++) {
            let roomId = map.roomAt.get({x, y});
            if (!roomId) continue;
            ctx.fillText(roomId.toString(), x+0.5, y+0.5);
        }
    }
    ctx.restore();
    
    
    // TODO: tile foregrounds
    
    // Entities
    ctx.save();
    ctx.lineJoin = 'bevel'; // some of the game-icons have sharp corners
    ctx.lineWidth = 1/(TILE_SIZE/512);
    ctx.strokeStyle = "black";
    for (let entity of entities) {
        let {x, y} = entity.location;
        if (view.left <= x && x <= view.right
            && view.top <= y && y <= view.bottom) {
            drawTile(x, y, entity.appearance.sprite, "yellow");
        }
    }

    // TODO: need to figure out a way to convey the current transform
    // to the external render function. Currently scaled to tiles
    // being 1x1, and then drawTile handles the further scaling to the
    // 512x512 grid. But also need to convey line width somehow
    input.current.render(drawTile);
    ctx.restore();
    
    ctx.restore();
}

input.install(canvas, render);
render();
