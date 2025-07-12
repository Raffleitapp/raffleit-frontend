// Clean CSP from HTML for production builds
// Netlify handles CSP via headers

const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'index.html');
let content = fs.readFileSync(indexPath, 'utf8');

// Remove any CSP-related content (comment and meta tag)
content = content.replace(
  /\s*<!-- Content Security Policy.*?-->\s*/gs,
  ''
);

content = content.replace(
  /\s*<meta\s+http-equiv=["']Content-Security-Policy["'].*?>\s*/gs,
  ''
);

// Clean up excessive whitespace
content = content.replace(/\n\s*\n\s*\n+/g, '\n\n');

fs.writeFileSync(indexPath, content);
console.log('🧹 CSP removed from index.html (handled by server headers)'); 