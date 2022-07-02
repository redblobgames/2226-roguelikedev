/*
 * From https://www.redblobgames.com/x/2226-roguelike-dev/
 * Copyright 2022 Red Blob Games <redblobgames@gmail.com>
 * License: Apache-2.0 <http://www.apache.org/licenses/LICENSE-2.0.html>
 */

import { print, sprites } from "./ui";
print("Hello and welcome, fortress maker!", 'welcome');

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
const instructions = document.querySelector("#focus-instructions");
canvas.setAttribute('tabindex', "1");
canvas.addEventListener('keydown', handleKeyDown);
canvas.addEventListener('blur', () => { instructions.classList.add('visible'); });
canvas.addEventListener('focus', () => { instructions.classList.remove('visible'); });
canvas.focus();

function handleKeyDown(event) {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    /*
    let action = currentKeyHandler()(event.key);
    if (action) {
        event.preventDefault();
        runAction(action);
        }
        */
}


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

for (let y = 0; y < 20; y++) {
    for (let x = 0; x < 20; x++) {
        drawSprite(x, y, x === 5 && y === 3 ? 'person' : 'strawbale');
    }
}
