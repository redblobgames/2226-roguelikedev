/*
 * From https://www.redblobgames.com/x/2226-roguelike-dev/
 * Copyright 2022 Red Blob Games <redblobgames@gmail.com>
 * License: Apache-2.0 <http://www.apache.org/licenses/LICENSE-2.0.html>
 */

export type Rect = {
    left: number;
    right: number;
    top: number;
    bottom: number;
};

export function clamp(x: number, lo: number, hi: number): number {
    return x < lo ? lo : x > hi ? hi : x;
}

export function intersectRectangle(a: Rect, b: Rect): Rect {
    let rect = {
        left: Math.max(a.left, b.left),
        right: Math.min(a.right, b.right),
        top: Math.max(a.top, b.top),
        bottom: Math.min(a.bottom, b.bottom),
    };
    if (rect.left <= rect.right && rect.top <= rect.bottom) {
        return rect;
    } else {
        return {left: 0, right: 0, top: 0, bottom: 0};
    }
}

export function unlerp(a: number, b: number, t: number): number {
    return (t - a) / (b - a);
}

export function sign(v: number): -1 | 0 | 1 {
    if (v < 0) return -1;
    if (v > 0) return +1;
    return 0;
}

// SFC32 random number generator, public domain code
// from https://github.com/bryc/code/blob/master/jshash/PRNGs.md
function PRNG(seed: number): {
    nextInt(): number;
    nextFloat(): number;
    getState(): number[];
    setState(state: number[]): void
} {
    let a = 0, b = seed, c = 0, d = 1;
    function sfc32() {
        a |= 0; b |= 0; c |= 0; d |= 0; 
        var t = (a + b | 0) + d | 0;
        d = d + 1 | 0;
        a = b ^ b >>> 9;
        b = c + (c << 3) | 0;
        c = c << 21 | c >>> 11;
        c = c + t | 0;
        return t >>> 0;
    };
    for (let i = 0; i < 12; i++) sfc32(); // scramble the seed
    return {
        nextInt: sfc32,
        nextFloat() { return sfc32() / 4294967296; },
        getState() { return [a, b, c, d]; },
        setState(state: number[]) { [a, b, c, d] = state; },
    };
}

let prng = PRNG(Math.random() * 100000 | 0);

export function randFloat(): number {
    return prng.nextFloat();
}
export function randRange(lo: number, hi: number): number {
    return prng.nextInt() % (hi - lo) + lo;
}
export function randInt(lo: number, hi: number): number {
    return randRange(lo, hi+1);
}
