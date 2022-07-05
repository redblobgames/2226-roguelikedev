/*
 * From https://www.redblobgames.com/x/2226-roguelike-dev/
 * Copyright 2022 Red Blob Games <redblobgames@gmail.com>
 * License: Apache-2.0 <http://www.apache.org/licenses/LICENSE-2.0.html>
 */

import { Entity } from "./entity";

export const player = new Entity({x: 5, y: 7}, {sprite: 'person'});
export let entities = [player];