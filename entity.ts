/*
 * From https://www.redblobgames.com/x/2226-roguelike-dev/
 * Copyright 2022 Red Blob Games <redblobgames@gmail.com>
 * License: Apache-2.0 <http://www.apache.org/licenses/LICENSE-2.0.html>
 */

export type Location = {x: number, y: number};
export type Appearance = {sprite: string};

export class Entity {
    constructor (public location: Location, public appearance: Appearance) {
    }

    moveBy(dx: number, dy: number) {
        this.location = {x: this.location.x + dx,
                         y: this.location.y + dy};
    }
}
