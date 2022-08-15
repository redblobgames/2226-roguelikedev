/*
 * From https://www.redblobgames.com/x/2226-roguelike-dev/
 * Copyright 2022 Red Blob Games <redblobgames@gmail.com>
 * License: Apache-2.0 <http://www.apache.org/licenses/LICENSE-2.0.html>
 */

export { print } from "./console";
import * as input from "./input";
import * as simulation from "./simulation";
import { map, Edge } from "./map";
import { DEBUG, clamp, unlerp } from "./util";

// Drawing area
export const canvas = document.querySelector("#game") as HTMLCanvasElement;
export const ctx = canvas.getContext('2d');

// Tile map view
const TILE_SIZE = DEBUG? 12 : 25;
const VIEWWIDTH = canvas.width / TILE_SIZE;
const VIEWHEIGHT = canvas.height / TILE_SIZE;

if (window.devicePixelRatio && window.devicePixelRatio !== 1) {
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
    cactus:     S(require("./game-icons/delapouite/cactus.svg")),
    door:       S(require("./game-icons/delapouite/door.svg")),
    move:       S(require("./game-icons/delapouite/move.svg")),
    square:     S(require("./game-icons/delapouite/square.svg")),
    sprout:     S(require("./game-icons/lorc/sprout.svg")),
    thor_hammer: S(require("./game-icons/delapouite/thor-hammer.svg")),
};


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
        grass: ["hsl(100, 30%, 50%)", "hsl(110, 30%, 49%)", "hsl(90, 35%, 50%)", "hsl(100, 35%, 50%)"],
        plains: ["hsl(80, 30%, 60%)", "hsl(90, 35%, 61%)", "hsl(70, 40%, 59%)", "hsl(80, 40%, 60%)"],
        desert: ["hsl(50, 20%, 70%)", "hsl(50, 15%, 70%)", "hsl(50, 25%, 70%)", "hsl(45, 20%, 70%)"],
        river: ["hsl(220, 50%, 44%)", "hsl(240, 50%, 43%)", "hsl(230, 50%, 45%)", "hsl(230, 50%, 42%)"],
    };
    const defaultPath = new Path2D("M 0,0 l 512,0 l 0,512 l -512,0 z");
    function drawTile(x: number, y: number, sprite: string | null, color: string) {
        ctx.translate(x, y);
        ctx.scale(1/512, 1/512);
        ctx.stroke(sprites[sprite] ?? defaultPath);
        ctx.fillStyle = color;
        ctx.fill(sprites[sprite] ?? defaultPath);
        ctx.scale(512, 512);
        ctx.translate(-x, -y);
    }
    function animationIndex(x: number, y: number): number {
        return (x & 7) ^ (y & 7) ^ (((x+y) & 4) ? 0xff : 0);
    }
    
    ctx.save();
    ctx.lineJoin = 'bevel'; // some of the game-icons have sharp corners
    ctx.lineWidth = 1/(TILE_SIZE/512);
    ctx.strokeStyle = "black";
    for (let y = view.top; y <= view.bottom; y++) {
        for (let x = view.left; x <= view.right; x++) {
            let tile = map.tiles.get({x, y});
            let index = animationIndex(x, y - (tile !== 'river'? 0 : Math.floor(simulation.loop.tickId/simulation.TICKS_PER_SECOND)));
            let renderCandidates = tileRenders[tile] ?? ["red"];
            let render = renderCandidates[index % renderCandidates.length];
            drawTile(x, y, null, render);
            let resource = map.resources.get({x, y});
            if (resource) {
                let growth = resource.growth/100;
                let color = `hsl(${60+60*growth|0},${50*growth|0}%,50%)`;
                if (resource.growth > simulation.PLANT_EDIBLE) color = "green";
                drawTile(x, y, resource.appearance.sprite, color);
                let berries = resource.appearance.sprite === 'cactus'
                    ? [[0.6, 0.1], [0.2, 0.2], [0.9, 0.4]]
                    : [[0.5, 0.1], [0.1, 0.3], [0.9, 0.3]];
                let numBerries = clamp(3 * unlerp(simulation.PLANT_EDIBLE, 100, resource.growth), 0, 3);
                for (let [dx, dy] of berries.slice(0, numBerries)) {
                    ctx.fillStyle = "red";
                    ctx.beginPath();
                    ctx.arc(x+dx, y+dy, 0.1, 0, 2*Math.PI);
                    ctx.fill();
                }
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
    
    
    // Agents are drawn on top of most everything else (except the cursor)
    ctx.save();
    ctx.lineJoin = 'bevel'; // some of the game-icons have sharp corners
    for (let agent of simulation.agents) {
        let {x, y} = agent.location;
        if (view.left <= x && x <= view.right
            && view.top <= y && y <= view.bottom) {
            let color = "yellow";
            if (agent.health < simulation.AGENT_HUNGRY) color = "orange";
            if (agent.health < simulation.AGENT_STARVING) color = "red";
            if (agent.health === 0) color = "black";
            if (agent.health < 0) color = "purple"; // debugging
            if (agent.dest && agent.health > 0) {
                ctx.strokeStyle = "white";
                ctx.lineWidth = 0.02;
                ctx.beginPath();
                ctx.moveTo(x + 0.5, y + 0.5);
                ctx.lineTo(agent.dest.x + 0.5, agent.dest.y + 0.5);
                ctx.stroke();
            }
            ctx.lineWidth = 1/(TILE_SIZE/512);
            ctx.strokeStyle = "black";
            drawTile(x, y, agent.appearance.sprite, color);
            ctx.font = '0.4px monospace';
            ctx.fillStyle = "white";
            ctx.textAlign = 'center';
            ctx.fillText(agent.id, x+0.5, y+0.8);
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

simulation.install(render);
input.install(canvas, render);
render();
