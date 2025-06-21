// Icon Generator for Jupiter Social Trader
// This script creates simple SVG icons for the Chrome extension

function createIcon(size) {
    const svg = `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#00d4ff;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#0099cc;stop-opacity:1" />
        </linearGradient>
    </defs>
    
    <!-- Background circle -->
    <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 1}" fill="url(#grad1)" stroke="#ffffff" stroke-width="1"/>
    
    <!-- Rocket icon -->
    <g transform="translate(${size/2 - 6}, ${size/2 - 8})">
        <!-- Rocket body -->
        <path d="M6 2 L6 0 L8 0 L8 2 L10 4 L10 12 L8 14 L6 14 L4 12 L4 4 Z" fill="#000000"/>
        <!-- Rocket flame -->
        <path d="M5 14 L6 16 L7 14 L8 16 L9 14" fill="#ff4444" stroke="none"/>
        <!-- Window -->
        <circle cx="7" cy="6" r="1.5" fill="#ffffff"/>
        <!-- Side fins -->
        <path d="M4 8 L2 10 L2 12 L4 10 Z" fill="#000000"/>
        <path d="M10 8 L12 10 L12 12 L10 10 Z" fill="#000000"/>
    </g>
</svg>`;
    
    return svg;
}

// Generate different sizes
const sizes = [16, 32, 48, 128];
sizes.forEach(size => {
    const svg = createIcon(size);
    console.log(`Icon ${size}x${size}:`);
    console.log(svg);
    console.log('---');
});

// For PNG conversion, you would need to use a tool like svg2png or similar
// For now, we'll create placeholder files that can be replaced with actual PNG icons
