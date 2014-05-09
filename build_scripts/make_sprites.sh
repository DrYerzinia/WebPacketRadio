spritesheet-js -p ../src/www/data/image/aprs_symbols -n symbols ../src/www/data/image/aprs_symbols/*.gif
sed -i '/rotated/d' ../src/www/data/image/aprs_symbols/symbols.json
sed -i '/trimmed/d' ../src/www/data/image/aprs_symbols/symbols.json
sed -i '/spriteSourceSize/d' ../src/www/data/image/aprs_symbols/symbols.json
sed -i '/sourceSize/d' ../src/www/data/image/aprs_symbols/symbols.json
sed -i 's/20}./20}/g' ../src/www/data/image/aprs_symbols/symbols.json
json-minify ../src/www/data/image/aprs_symbols/symbols.json > ../src/www/data/image/aprs_symbols/symbols_mini.json
rm ../src/www/data/image/aprs_symbols/symbols.json
mv ../src/www/data/image/aprs_symbols/symbols_mini.json ../src/www/data/image/aprs_symbols/symbols.json
