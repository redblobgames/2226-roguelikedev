/*
 * From https://www.redblobgames.com/x/2226-roguelike-dev/
 * Copyright 2022 Red Blob Games <redblobgames@gmail.com>
 * License: Apache-2.0 <http://www.apache.org/licenses/LICENSE-2.0.html>
 */

import { canvas, render } from "./ui";
import { map } from "./map";
import { player } from "./simulation";

// Handle keyboard focus
const focusInstructions = document.querySelector("#focus-instructions");
canvas.setAttribute('tabindex', "1");
canvas.addEventListener('keydown', handleKeyDown);
canvas.addEventListener('blur', () => { focusInstructions.classList.add('visible'); });
canvas.addEventListener('focus', () => { focusInstructions.classList.remove('visible'); });
canvas.focus();

// Handle keyboard events
const gameInstructions = document.querySelector("#game-instructions") as HTMLElement;
let actions: {[key: string]: () => void}  = {};

export type InputMode = 'move' | 'wall';
export function setInputMode(inputMode: InputMode) {
    gameInstructions.className = inputMode;

    switch (inputMode) {
        case 'move':
            gameInstructions.innerHTML = "Arrows to move; <kbd>W</kbd> to build walls";
            actions = {
                ArrowRight() { playerMoveBy(+1, 0); },
                ArrowLeft() { playerMoveBy(-1, 0); },
                ArrowDown() { playerMoveBy(0, +1); },
                ArrowUp()  { playerMoveBy(0, -1); },
                PageUp() { playerMoveBy(+1, -1); },
                PageDown() { playerMoveBy(+1, +1); },
                Home() { playerMoveBy(-1, -1); },
                End() { playerMoveBy(-1, +1); },
                w() { setInputMode('wall'); },
                // TODO: add numpad keys, test "0" through "9" with location != 0
            };
            break;
        case 'wall':
            gameInstructions.innerHTML = "Arrows to build wall; <kbd>Enter</kbd> to save; <kbd>Esc</kbd> to cancel";
            actions = {
                Esc() { setInputMode('move'); },
                Enter() { setInputMode('move'); },
            };
            break;
    }
}




function playerMoveBy(dx: number, dy: number) {
    if (map.inBounds({x: player.location.x + dx, y: player.location.y + dy})) {
        player.moveBy(dx, dy);
        render();
    }
}

function handleKeyDown(event: KeyboardEvent) {
    // console.log("Action %s location=%s repeat=%s", event.key, event.location, event.repeat);
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (actions[event.key]) {
        event.preventDefault();
        if (!event.repeat) {
            // TODO: handle keyboard repeat internally, not through keydown events;
            // this will require storing which keys are up/down and setting up a timer,
            // but I need a timer anyway for the real-time simulation
            // TODO: keyboard handling should be edge based not purely level based, tricky
            actions[event.key]();
        }
    }
        
    // TODO: different building modes
    // TODO:  maybe Esc to cancel building walls/stockpiles and Enter to confirm
    // TODO: use intersection observer; stop taking keys when canvas is out of view
}
