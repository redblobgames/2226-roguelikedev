#!/bin/sh
mkdir -p build/
esbuild roguelike-dev.ts --bundle --sourcemap --outfile=build/_bundle.js
