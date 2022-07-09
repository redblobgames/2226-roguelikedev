/*
 * From https://www.redblobgames.com/x/2226-roguelike-dev/
 * Copyright 2022 Red Blob Games <redblobgames@gmail.com>
 * License: Apache-2.0 <http://www.apache.org/licenses/LICENSE-2.0.html>
 */

export { print } from "./console";
import { entities, player } from "./simulation";
import { map } from "./map";
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
function S(svg: String): Path2D {
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
        x: clamp(player.location.x + 0.5,
                 map.bounds.left + halfwidth,
                 map.bounds.right - halfwidth + 1),
        y: clamp(player.location.y + 0.5,
                 map.bounds.top + halfheight,
                 map.bounds.bottom - halfheight + 1),
    };

    const dx = halfwidth - camera.x;
    const dy = halfheight - camera.y;
    const tileRenders = {
        grass: "hsl(100, 30%, 50%)",
        desert: "hsl(50, 20%, 70%)",
        mountain: "hsl(30, 10%, 80%)",
        river: "hsl(250, 50%, 30%)",
    };
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let y = Math.floor(camera.y - halfheight); y <= Math.ceil(camera.y + halfheight); y++) {
        for (let x = Math.floor(camera.x - halfwidth); x <= Math.ceil(camera.x + halfwidth); x++) {
            let tile = map.tiles.get({x, y});
            let render = tileRenders[tile] ?? "red";
            drawSprite(x + dx, y + dy, null, render);
        }
    }
    for (let entity of entities) {
        drawSprite(entity.location.x + dx, entity.location.y + dy,
                   entity.appearance.sprite, "yellow");
    }
    drawSprite(player.location.x + dx, player.location.y + dy,
               player.appearance.sprite, "yellow");
}

render();
