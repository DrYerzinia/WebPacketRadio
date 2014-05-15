#!/bin/bash

rm -rf ../release

mkdir ../release
mkdir ../release/js
mkdir ../release/data
mkdir ../release/styles
mkdir ../release/data/image
mkdir ../release/data/image/aprs_symbols

cp ../src/www/js/require.js ../release/js/require.js

cp ../src/www/config.json ../release/config.json
cp ../src/www/index.html ../release/index.html
cp -r ../src/www/data/audio ../release/data/audio
cp -r ../src/www/data/font ../release/data/font
cp -r ../src/www/data/image/favicon ../release/data/image/favicon
cp ../src/www/data/image/aprs_symbols/symbols.png ../release/data/image/aprs_symbols/symbols.png
cp ../src/www/data/image/aprs_symbols/symbols.json ../release/data/image/aprs_symbols/symbols.json

node /opt/r.js -o build.js

node /opt/r.js -o cssIn=../src/www/styles/styles.css out=../release/styles/styles.css

