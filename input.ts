/*
 * From https://www.redblobgames.com/x/2226-roguelike-dev/
 * Copyright 2022 Red Blob Games <redblobgames@gmail.com>
 * License: Apache-2.0 <http://www.apache.org/licenses/LICENSE-2.0.html>
 */

import { Point, map } from "./map";

let render: () => void = null;

// Handle keyboard focus
export function install(canvas: HTMLCanvasElement, render_: () => void) {
    const focusInstructions = document.querySelector("#focus-instructions");
    canvas.setAttribute('tabindex', "1");
    canvas.addEventListener('keydown', handleKeyDown);
    canvas.addEventListener('blur', () => { focusInstructions.classList.add('visible'); });
    canvas.addEventListener('focus', () => { focusInstructions.classList.remove('visible'); });
    canvas.focus();

    render = render_;
}

// Handle keyboard events

abstract class InputMode {
    key_ArrowRight() { this.moveBy(+1, 0); }
    key_ArrowLeft()  { this.moveBy(-1, 0); }
    key_ArrowDown()  { this.moveBy(0, +1); }
    key_ArrowUp()    { this.moveBy(0, -1); }
    key_PageUp()     { this.moveBy(+1, -1); }
    key_PageDown()   { this.moveBy(+1, +1); }
    key_Home()       { this.moveBy(-1, -1); }
    key_End()        { this.moveBy(-1, +1); }

    instructionsHtml = `Instructions go here`;
    instructionsClass = "";
    moved() { }
    render(drawTile) {
        drawTile(this.x, this.y, 'move', "red");
    }
    
    constructor(public x: number, public y: number) {
        setTimeout(() => {
            // NOTE: need to use a timeout for this because the class
            // fields aren't set by the subclass until after this
            // constructor is finished. See
            // https://javascript.info/class-inheritance#overriding-class-fields-a-tricky-note
            const gameInstructions = document.querySelector("#game-instructions") as HTMLElement;
            gameInstructions.className = this.instructionsClass;
            gameInstructions.innerHTML = this.instructionsHtml;
            this.moved();
        }, 0);
    }
    moveBy(dx: number, dy: number) {
        if (map.inBounds({x: this.x + dx, y: this.y + dy})) {
            this.x += dx;
            this.y += dy;
            this.moved();
            render();
        }
    }
}

class MoveMode extends InputMode {
    override instructionsClass = 'move';
    override instructionsHtml = `Arrows to move; <kbd>R</kbd> to build room`;
    key_w() { setInputMode('wall'); }
    key_r() { setInputMode('room'); }
}

class RoomMode extends InputMode {
    start: Point;
    override instructionsClass = 'room';
    override instructionsHtml = `Arrows to move to opposite corner; <kbd>Enter</kbd> to mark rectangle; <kbd>Esc</kbd> to cancel`;
    
    constructor(x: number, y: number) {
        super(x, y);
        this.start = {x, y};
    }

    get bounds() {
        return {
            left: Math.min(this.start.x, this.x),
            right: Math.max(this.start.x, this.x),
            top: Math.min(this.start.y, this.y),
            bottom: Math.max(this.start.y, this.y),
        };
    }
    
    override render(drawTile) {
        let {left, right, top, bottom} = this.bounds;
        for (let y = top; y <= bottom; y++) {
            for (let x = left; x <= right; x++) {
                drawTile(x, y, 'thor_hammer', "hsla(60, 100%, 50%, 0.1)");
            }
        }
        drawTile(this.start.x, this.start.y, 'thor_hammer', "white");
        drawTile(this.x, this.y, 'thor_hammer', "yellow");
    }
    
    key_Escape()     { setInputMode('move'); }
    key_Enter()      {
        let {left, right, top, bottom} = this.bounds;
        let roomId = map.nextRoomId++;
        for (let y = top; y <= bottom; y++) {
            for (let x = left; x <= right; x++) {
                map.roomAt.set({x, y}, roomId);
            }
        }
        setInputMode('move');
    }
}

class WallMode extends InputMode {
    path: Point[] = [];
    override instructionsClass = 'wall';
    override instructionsHtml = `Arrows to draw path; <kbd>Enter</kbd> to save; <kbd>Esc</kbd> to cancel`;
    override moved() {
        this.path.push({x: this.x, y: this.y});
        // TODO: reversing over path should pop
        // TODO: need to draw current path
    }
    key_Escape()     { setInputMode('move'); }
    key_Enter()      {
        for (let p of this.path) {
            map.objects.set(p, 'wall');
        }
        setInputMode('move');
    }
}


export let current: InputMode = new MoveMode(5, 5);
export function setInputMode(mode: 'move' | 'room' | 'wall') {
    current = new {move: MoveMode, room: RoomMode, wall: WallMode}[mode](current.x, current.y);
    render();
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
    // TODO: shift-arrow should be either 5 or 10 steps

    if (current[`key_${key}`]) {
        event.preventDefault();
        if (!event.repeat) {
            // TODO: handle keyboard repeat internally, not through keydown events;
            // this will require storing which keys are up/down and setting up a timer,
            // but I need a timer anyway for the real-time simulation
            // TODO: keyboard handling should be edge based not purely level based, tricky
            current[`key_${key}`]();
        }
    }
        
    // TODO: different building modes
    // TODO:  maybe Esc to cancel building walls/stockpiles and Enter to confirm
    // TODO: use intersection observer; stop taking keys when canvas is out of view
}
