/*
 * From https://www.redblobgames.com/x/2226-roguelike-dev/
 * Copyright 2022 Red Blob Games <redblobgames@gmail.com>
 * License: Apache-2.0 <http://www.apache.org/licenses/LICENSE-2.0.html>
 */

import { print, sprites } from "./ui";
import { Entity } from "./entity";

print("Hello and welcome, fortress maker!", 'welcome');

const player = new Entity({x: 5, y: 7}, {sprite: 'person'});

const VIEWWIDTH = 17, VIEWHEIGHT = 17;
const TILE_SIZE = 32;

const canvas = document.querySelector("#game") as HTMLCanvasElement;
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

function playerMoveBy(dx, dy) {
    player.moveBy(dx, dy);
    redraw();
}

function handleKeyDown(event) {
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


// Drawing

function drawSprite(x, y, name, color="white") {
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

function redraw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < 20; y++) {
        for (let x = 0; x < 20; x++) {
            drawSprite(x, y, x === player.location.x && y === player.location.y ? 'person' : 'strawbale');
        }
    }
}

redraw();
