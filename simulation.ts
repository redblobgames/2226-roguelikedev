/*
 * From https://www.redblobgames.com/x/2226-roguelike-dev/
 * Copyright 2022 Red Blob Games <redblobgames@gmail.com>
 * License: Apache-2.0 <http://www.apache.org/licenses/LICENSE-2.0.html>
 */

import { Agent } from "./entity";
import { map, Point } from "./map";
import { sign, randInt } from "./util";

const TICKS_PER_SECOND = 10;
const AGENT_MOVES_PER_TICK = 3;
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

        const agents_per_tick = Math.min(agents.length, AGENT_MOVES_PER_TICK);
        for (let i = 0; i < agents_per_tick; i++) {
            let agent = agents[(this.tickId * agents_per_tick + i) % agents.length];
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
        render();
    }
};
