#!/usr/bin/env node
// Run: node generate-icons.js
// Generates placeholder icons for the Chrome extension
// Replace with real icons before publishing

const fs = require('fs');
const path = require('path');

// Simple SVG icon for TwoSidedNews
const svgIcon = (size) => `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#0f0f0f"/>
  <text x="${size/2}" y="${size * 0.38}" font-family="Georgia,serif" font-weight="900" font-size="${size * 0.28}" fill="#60a5fa" text-anchor="middle" dominant-baseline="middle">T</text>
  <text x="${size/2}" y="${size * 0.72}" font-family="Georgia,serif" font-weight="900" font-size="${size * 0.28}" fill="#f87171" text-anchor="middle" dominant-baseline="middle">S</text>
  <line x1="${size*0.2}" y1="${size/2}" x2="${size*0.8}" y2="${size/2}" stroke="#f8f5f0" stroke-width="${size * 0.03}"/>
</svg>`;

const iconsDir = path.join(__dirname, 'icons');
if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir);

[16, 32, 48, 128].forEach(size => {
  fs.writeFileSync(path.join(iconsDir, `icon${size}.svg`), svgIcon(size));
  console.log(`Generated icon${size}.svg`);
});

console.log('\nNote: Chrome extensions require PNG icons.');
console.log('Convert SVGs to PNGs using: https://cloudconvert.com/svg-to-png');
console.log('Or use sharp: npm install -g sharp-cli && sharp -i icons/icon128.svg -o icons/icon128.png');
