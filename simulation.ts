/*
 * From https://www.redblobgames.com/x/2226-roguelike-dev/
 * Copyright 2022 Red Blob Games <redblobgames@gmail.com>
 * License: Apache-2.0 <http://www.apache.org/licenses/LICENSE-2.0.html>
 */

import { Agent } from "./entity";
import { map, Point } from "./map";

const TICKS_PER_SECOND = 3;
export let agents: Agent[] = [];

agents.push(new Agent("agent-1", {x: 5, y: 10}, {sprite: 'rooster'}));

let render: () => void = null;
export function install(render_) {
    render = render_;
}

function moveAgentTo(agent: Agent, p: Point) {
    if (map.inBounds(p)) {
        agent.location = {x: p.x, y: p.y};
    }
}

export let loop = {
    _intervalID: 0,
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
        let agent = agents[0];
        moveAgentTo(agent, {x: agent.location.x + 1, y: agent.location.y});
        render();
    }
};
