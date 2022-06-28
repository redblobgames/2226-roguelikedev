/*
 * From https://www.redblobgames.com/x/2226-roguelike-dev/
 * Copyright 2022 Red Blob Games <redblobgames@gmail.com>
 * License: Apache-2.0 <http://www.apache.org/licenses/LICENSE-2.0.html>
 */

import { print } from "./ui";
print("Hello and welcome, fortress maker!", 'welcome');

const VIEWWIDTH = 17, VIEWHEIGHT = 17;

const canvas = document.querySelector("#game") as HTMLCanvasElement;
