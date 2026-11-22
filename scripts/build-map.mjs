/**
 * Generates assets/images/world-dots.svg – a lightweight dot-matrix world map
 * (Natural Earth data via world-atlas, public domain) – and prints marker
 * positions (as % of the SVG box) for the destinations shown on the site.
 * Run: npm run build:map
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
import { feature } from 'topojson-client';
import { geoContains } from 'd3-geo';
const world = require('world-atlas/land-110m.json');

const land = feature(world, world.objects.land);
const STEP = 2.4;               // degrees between dots
const LAT_MAX = 80, LAT_MIN = -56;
const W = 1000;
const H = Math.round(W * (LAT_MAX - LAT_MIN) / 360);
const px = (lon) => ((lon + 180) / 360) * W;
const py = (lat) => ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * H;

let d = '';
for (let lat = LAT_MAX; lat >= LAT_MIN; lat -= STEP) {
  for (let lon = -180 + STEP / 2; lon < 180; lon += STEP) {
    if (geoContains(land, [lon, lat])) d += `M${px(lon).toFixed(1)} ${py(lat).toFixed(1)}h0`;
  }
}
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" fill="none"><path d="${d}" stroke="#101E32" stroke-width="3.4" stroke-linecap="round"/></svg>\n`;
fs.writeFileSync(path.join(__dirname, '..', 'assets', 'images', 'world-dots.svg'), svg);

const markers = { canada: [56, -106], usa: [39, -98], uk: [53, -1.8], germany: [51, 10.4], australia: [-25, 134], newzealand: [-41.5, 173] };
console.log(`viewBox 0 0 ${W} ${H}; size ${(svg.length / 1024).toFixed(1)} KB`);
for (const [k, [lat, lon]] of Object.entries(markers)) {
  console.log(k, `left:${(px(lon) / W * 100).toFixed(2)}%; top:${(py(lat) / H * 100).toFixed(2)}%`);
}
