/*
 * From https://www.redblobgames.com/x/2226-roguelike-dev/
 * Copyright 2022 Red Blob Games <redblobgames@gmail.com>
 * License: Apache-2.0 <http://www.apache.org/licenses/LICENSE-2.0.html>
 */

import { Point } from "./map";
export type Location = Point | string; /* could be held by an agent */
export type Appearance = {sprite: string};

export class Agent {
    constructor (public id: string, public location: Point, public appearance: Appearance) {
    }

    moveTo(p: Point) {
        this.location = {x: p.x, y: p.y};
    }
}

export class Item {
    constructor (public id: string, public location: Location, public appearance: Appearance) {
    }

    moveTo(p: Location) {
        this.location = typeof p === 'string'? p : {x: p.x, y: p.y};
    }
}
