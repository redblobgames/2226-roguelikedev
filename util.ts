/*
 * From https://www.redblobgames.com/x/2226-roguelike-dev/
 * Copyright 2022 Red Blob Games <redblobgames@gmail.com>
 * License: Apache-2.0 <http://www.apache.org/licenses/LICENSE-2.0.html>
 */

export function clamp(x: number, lo: number, hi: number): number {
    return x < lo ? lo : x > hi ? hi : x;
}

export function randInt(lo: number, hi: number): number {
    return Math.floor(Math.random() * (hi-lo)) + lo;
}

export function sign(v: number): -1 | 0 | 1 {
    if (v < 0) return -1;
    if (v > 0) return +1;
    return 0;
}
