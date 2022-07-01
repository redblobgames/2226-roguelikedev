/*
 * From https://www.redblobgames.com/x/2226-roguelike-dev/
 * Copyright 2022 Red Blob Games <redblobgames@gmail.com>
 * License: Apache-2.0 <http://www.apache.org/licenses/LICENSE-2.0.html>
 */

export { print } from "./console";

import g_person from "./game-icons/delapouite/person.svg";
import g_rooster from "./game-icons/delapouite/rooster.svg";

function mkSprite(svg: String): Path2D {
    // This relies on the way game-icons.net svgs are structured,
    // as a single <path d="…"/>
    return new Path2D(svg.replace(/.* d="/, "").replace(/".*/, ""));
}

export const sprites = {
    person: mkSprite(g_person),
    rooster: mkSprite(g_rooster),
};


