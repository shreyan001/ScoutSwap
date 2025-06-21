const fs = require('fs');

// Simple 16x16 PNG in base64 (minimal blue square)
const simplePNG = 'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABklEQVQ4T2NkYGAAAAAYAAHttj8cAAAAAElFTkSuQmCC';

// Create PNG files for all required sizes
const sizes = [16, 32, 48, 128];

sizes.forEach(size => {
    const buffer = Buffer.from(simplePNG, 'base64');
    const filename = `icons/icon${size}.png`;
    fs.writeFileSync(filename, buffer);
    console.log(`Created ${filename}`);
});

console.log('All PNG icons created successfully!');
