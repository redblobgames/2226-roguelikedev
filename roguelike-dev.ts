/*
 * From https://www.redblobgames.com/x/2226-roguelike-dev/
 * Copyright 2022 Red Blob Games <redblobgames@gmail.com>
 * License: Apache-2.0 <http://www.apache.org/licenses/LICENSE-2.0.html>
 */

import { print, sprites } from "./ui";
import { entities, player } from "./simulation";
import { map } from "./map";

print("Hello and welcome, fortress maker!", 'welcome');

const TILE_SIZE = 24;

const canvas = document.querySelector("#game") as HTMLCanvasElement;
const VIEWWIDTH = Math.ceil(canvas.width / TILE_SIZE);
const VIEWHEIGHT = Math.ceil(canvas.height / TILE_SIZE);
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
    const unknownRender = ['strawbale', "gray"];
    const tileRenders = {
        grass: ['abstract50', "hsl(100, 30%, 50%)"],
        river: ['abstract50', "hsl(250, 50%, 30%)"],
        wall: ['wall', "brown"],
    };
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < VIEWHEIGHT; y++) {
        for (let x = 0; x < VIEWWIDTH; x++) {
            if (map.inBounds({x, y})) {
                let tile = map.tiles.get({x, y});
                let render = tileRenders[tile] ?? unknownRender;
                drawSprite(x, y, render[0], render[1]);
            }
        }
    }
    for (let entity of entities) {
        drawSprite(entity.location.x, entity.location.y, entity.appearance.sprite, "yellow");
    }
}

render();
