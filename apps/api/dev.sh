#!/bin/sh
set -eu

tsc -p tsconfig.json
tsc -w --preserveWatchOutput -p tsconfig.json &
TSC_PID=$!
trap 'kill "$TSC_PID" 2>/dev/null || true' INT TERM EXIT
node --watch dist/main.js