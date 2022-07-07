/*
 * From https://www.redblobgames.com/x/2226-roguelike-dev/
 * Copyright 2022 Red Blob Games <redblobgames@gmail.com>
 * License: Apache-2.0 <http://www.apache.org/licenses/LICENSE-2.0.html>
 */

import { print, sprites } from "./ui";
import { entities, player } from "./simulation";
import { map } from "./map";

print("Hello and welcome, fortress maker!", 'welcome');

function clamp(x: number, lo: number, hi: number): number { return x < lo ? lo : x > hi ? hi : x; }
let camera = {x: player.location.x, y: player.location.y};


const canvas = document.querySelector("#game") as HTMLCanvasElement;
const TILE_SIZE = 22;
const VIEWWIDTH = canvas.width / TILE_SIZE;
const VIEWHEIGHT = canvas.height / TILE_SIZE;
if (VIEWWIDTH % 1.0 !== 0.0 || VIEWHEIGHT % 1.0 !== 0.0) assert("Tile size mismatch");
const ctx = canvas.getContext('2d');

// Handle hi-dpi displays
if (window.devicePixelRatio && window.devicePixelRatio != 1) {
    canvas.width *= window.devicePixelRatio;
    canvas.height *= window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
}

// Handle keyboard focus
const focusInstructions = document.querySelector("#focus-instructions");
canvas.setAttribute('tabindex', "1");
canvas.addEventListener('keydown', handleKeyDown);
canvas.addEventListener('blur', () => { focusInstructions.classList.add('visible'); });
canvas.addEventListener('focus', () => { focusInstructions.classList.remove('visible'); });
canvas.focus();

// Handle keyboard events
const gameInstructions = document.querySelector("#game-instructions") as HTMLElement;
gameInstructions.innerText = "Arrows to move";

function playerMoveBy(dx: number, dy: number) {
    if (map.inBounds({x: player.location.x + dx, y: player.location.y + dy})) {
        player.moveBy(dx, dy);
        render();
    }
}

function handleKeyDown(event: KeyboardEvent) {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    let actions = {
        ArrowRight() { playerMoveBy(+1, 0); },
        ArrowLeft() { playerMoveBy(-1, 0); },
        ArrowDown() { playerMoveBy(0, +1); },
        ArrowUp()  { playerMoveBy(0, -1); },
    };
    if (actions[event.key]) {
        event.preventDefault();
        actions[event.key]();
    }
}


// Rendering

function drawSprite(x: number, y: number, name: string, color="white") {
    ctx.save();
    ctx.translate(TILE_SIZE * x, TILE_SIZE * y);
    ctx.scale(TILE_SIZE/512, TILE_SIZE/512);
    ctx.lineJoin = 'bevel'; // some of the game-icons have sharp corners
    ctx.lineWidth = 2/(TILE_SIZE/512);
    ctx.strokeStyle = "black";
    ctx.stroke(sprites[name]);
    ctx.fillStyle = color;
    ctx.fill(sprites[name]);
    ctx.restore();
}

function render() {
    const viewWindow = 0;
    camera.x = clamp(camera.x, player.location.x - viewWindow, player.location.x + viewWindow);
    camera.y = clamp(camera.y, player.location.y - viewWindow, player.location.y + viewWindow);

    const halfwidth = VIEWWIDTH >> 1;
    const halfheight = VIEWHEIGHT >> 1;
    camera.x = clamp(camera.x, map.bounds.left + halfwidth, map.bounds.right - halfwidth + 1);
    camera.y = clamp(camera.y, map.bounds.top + halfheight, map.bounds.bottom - halfheight + 1);

    const dx = halfwidth - camera.x;
    const dy = halfheight - camera.y;
    const unknownRender = ['strawbale', "gray"];
    const tileRenders = {
        grass: ['abstract50', "hsl(100, 30%, 50%)"],
        desert: ['abstract50', "hsl(50, 20%, 70%)"],
        mountain: ['abstract50', "hsl(30, 10%, 80%)"],
        river: ['abstract50', "hsl(250, 50%, 30%)"],
        wall: ['wall', "brown"],
    };
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let y = camera.y - halfheight; y <= camera.y + halfheight; y++) {
        for (let x = camera.x - halfwidth; x <= camera.x + halfwidth; x++) {
            if (map.inBounds({x, y})) {
                let tile = map.tiles.get({x, y});
                let render = tileRenders[tile] ?? unknownRender;
                drawSprite(x + dx, y + dy,
                           render[0], render[1]);
            }
        }
    }
    for (let entity of entities) {
        drawSprite(entity.location.x + dx, entity.location.y + dy,
                   entity.appearance.sprite, "yellow");
    }
}

render();
