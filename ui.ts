/*
 * From https://www.redblobgames.com/x/2226-roguelike-dev/
 * Copyright 2022 Red Blob Games <redblobgames@gmail.com>
 * License: Apache-2.0 <http://www.apache.org/licenses/LICENSE-2.0.html>
 */

export { print } from "./console";

function S(svg: String): Path2D {
    // This relies on the way game-icons.net svgs are structured,
    // as a single <path d="…"/>
    return new Path2D(svg.replace(/.* d="/, "").replace(/".*/, ""));
}

export const sprites = {
    person:    S(require("./game-icons/delapouite/person.svg")),
    rooster:   S(require("./game-icons/delapouite/rooster.svg")),
    grass:     S(require("./game-icons/delapouite/grass.svg")),
    wheat:     S(require("./game-icons/lorc/wheat.svg")),
    wall:      S(require("./game-icons/delapouite/stone-wall.svg")),
    strawbale: S(require("./game-icons/delapouite/round-straw-bale.svg")),
};


