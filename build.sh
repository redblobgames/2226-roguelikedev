#!/bin/sh
mkdir -p build/
esbuild roguelike-dev.ts --bundle --sourcemap --loader:.svg=text --outfile=build/_bundle.js
