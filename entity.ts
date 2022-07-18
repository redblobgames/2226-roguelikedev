/*
 * From https://www.redblobgames.com/x/2226-roguelike-dev/
 * Copyright 2022 Red Blob Games <redblobgames@gmail.com>
 * License: Apache-2.0 <http://www.apache.org/licenses/LICENSE-2.0.html>
 */

import { Point } from "./map";
export type AgentId = string;
export type Location = Point | AgentId;
export type Appearance = {sprite: string};


/* An agent is an NPC that can move around on its own, can only be on
 * the map, and can perform actions.
 */
export class Agent {
    dest: Point | null = null;
    constructor (public id: string,
                 public location: Point,
                 public appearance: Appearance) {
    }
}

/* An item is an object that cannot move around on its own, can be
 * either on the ground or carried by an Agent, and cannot perform
 * actions. */
export class Item {
    constructor (public id: string, public location: Location, public appearance: Appearance) {
    }
}
