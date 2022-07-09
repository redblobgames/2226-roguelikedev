/*
 * From https://www.redblobgames.com/x/2226-roguelike-dev/
 * Copyright 2022 Red Blob Games <redblobgames@gmail.com>
 * License: Apache-2.0 <http://www.apache.org/licenses/LICENSE-2.0.html>
 */

import { canvas, render } from "./ui";
import { Point, map } from "./map";
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
                ArrowLeft()  { playerMoveBy(-1, 0); },
                ArrowDown()  { playerMoveBy(0, +1); },
                ArrowUp()    { playerMoveBy(0, -1); },
                PageUp()     { playerMoveBy(+1, -1); },
                PageDown()   { playerMoveBy(+1, +1); },
                Home()       { playerMoveBy(-1, -1); },
                End()        { playerMoveBy(-1, +1); },
                w()          { setInputMode('wall'); },
            };
            break;
        case 'wall':
            gameInstructions.innerHTML = "Arrows to build wall; <kbd>Enter</kbd> to save; <kbd>Esc</kbd> to cancel";
            // TODO: store previous location so we can jump back on Esc
            // let {x, y} = player.location;
            let path: Point[] = [];
            function draw(dx, dy) {
                player.location.x += dx;
                player.location.y += dy;
                path.push({x: player.location.x, y: player.location.y});
                // TODO: reversing over path should pop
                // TODO: need to draw current path
                render();
            }
            draw(0, 0);
            actions = {
                // TODO: share cursor movement code with other building modes
                ArrowRight() { draw(+1, 0); },
                ArrowLeft()  { draw(-1, 0); },
                ArrowDown()  { draw(0, +1); },
                ArrowUp()    { draw(0, -1); },
                Escape()     { setInputMode('move'); },
                Enter()      {
                    for (let p of path) {
                        map.objects.set(p, 'wall');
                    }
                    setInputMode('move');
                },
            };
            break;
    }
    render();
}




function playerMoveBy(dx: number, dy: number) {
    if (map.inBounds({x: player.location.x + dx, y: player.location.y + dy})) {
        player.moveBy(dx, dy);
        render();
    }
}

// Translate numpad into movement keys
const NUMPAD_TO_ARROW = {
    1: 'End',
    2: 'DownArrow',
    3: 'PageDown',
    4: 'LeftArrow',
    6: 'RightArrow',
    7: 'Home',
    8: 'UpArrow',
    9: 'PageUp',
};

function handleKeyDown(event: KeyboardEvent) {
    // console.log("Action %s location=%s repeat=%s", event.key, event.location, event.repeat);
    if (event.altKey || event.ctrlKey || event.metaKey) return;

    let key = event.key;
    if (event.location === KeyboardEvent.DOM_KEY_LOCATION_NUMPAD) {
        key = NUMPAD_TO_ARROW[key] ?? key;
    }

    if (actions[key]) {
        event.preventDefault();
        if (!event.repeat) {
            // TODO: handle keyboard repeat internally, not through keydown events;
            // this will require storing which keys are up/down and setting up a timer,
            // but I need a timer anyway for the real-time simulation
            // TODO: keyboard handling should be edge based not purely level based, tricky
            actions[key]();
        }
    }
        
    // TODO: different building modes
    // TODO:  maybe Esc to cancel building walls/stockpiles and Enter to confirm
    // TODO: use intersection observer; stop taking keys when canvas is out of view
}
