/*
 * From https://www.redblobgames.com/x/2226-roguelike-dev/
 * Copyright 2022 Red Blob Games <redblobgames@gmail.com>
 * License: Apache-2.0 <http://www.apache.org/licenses/LICENSE-2.0.html>
 */

import { Agent } from "./entity";
import { map, Point } from "./map";
import { sign, randInt } from "./util";

export const TICKS_PER_SECOND = 10;
export const AGENT_MOVES_PER_TICK = 3;
export const TICKS_PER_PLANT_GROWTH = 10;
export const TICKS_PER_AGENT_HUNGER = 5;

export const PLANT_EDIBLE = 70;
export const AGENT_HUNGRY = 40;
export const AGENT_STARVING = 20;

export let agents: Agent[] = [];

for (let i = 0; i < 15; i++) { // dummy agents
    agents.push(
        new Agent("agent-${i+1}",
                  {x: 5 + i*3, y: 10},
                  {sprite: 'rooster'})
    );
}

let render: () => void = null;
export function install(render_: () => void) {
    render = render_;
}

function moveAgentTo(agent: Agent, p: Point) {
    if (map.inBounds(p)) {
        agent.location = {x: p.x, y: p.y};
    }
}

function agentsMove(tickId) {
    const agents_per_tick = Math.min(agents.length, AGENT_MOVES_PER_TICK);
    for (let i = 0; i < agents_per_tick; i++) {
        let agent = agents[(tickId * agents_per_tick + i) % agents.length];
        if (agent.fed === 0) { // no food
            // TODO: dead agents should turn into bones (items, not resources)
            return;
        }
        
        if (!agent.dest) {
            agent.dest = {
                x: randInt(map.bounds.left, map.bounds.right),
                y: randInt(map.bounds.top, map.bounds.bottom)
            };
        }

        let dx = agent.dest.x - agent.location.x;
        let dy = agent.dest.y - agent.location.y;
        if (dx === 0 && dy === 0) {
            agent.dest = null
        } else {
            dx = sign(dx);
            dy = sign(dy);
            moveAgentTo(agent, {x: agent.location.x + dx, y: agent.location.y + dy});
        }
    }
}

function agentsGetHungry(tickId) {
    if (tickId % TICKS_PER_AGENT_HUNGER !== 0) return;

    for (let agent of agents) {
        if (agent.fed > 0) agent.fed--;
        if (agent.fed < AGENT_HUNGRY) {
            // consider eating
            let resource = map.resources.get(agent.location);
            // TODO: check if it's a food resource
            if (resource && resource.growth > PLANT_EDIBLE) {
                let meal = Math.min(30, 100-agent.fed);
                agent.fed += meal;
                resource.growth -= meal;
            }
        }
    }
}

function plantsGrow(tickId) {
    if (tickId % TICKS_PER_PLANT_GROWTH !== 0) return;
    
    // NOTE: make this faster by adding a queue/index of non-growth-100 plants
    const {left, top, right, bottom} = map.bounds;
    for (let y = top; y <= bottom; y++) {
        for (let x = left; x <= right; x++) {
            let resource = map.resources.get({x, y});
            if (resource && resource.growth < 100) resource.growth++;
        }
    }
}

export let loop = {
    _intervalID: 0,
    tickId: 0,
    userPaused: false,
    systemPaused: false,

    start() {
        if (this._intervalID) return;
        this._intervalID = setInterval(() => this.tick(), 1000 / TICKS_PER_SECOND);
    },

    stop() {
        if (!this._intervalID) return;
        clearInterval(this._intervalID);
        this._intervalID = 0;
    },

    tick() {
        ++this.tickId;

        for (let system of [agentsMove, plantsGrow, agentsGetHungry]) {
            system(this.tickId);
        }
        
        render();
    }
};
