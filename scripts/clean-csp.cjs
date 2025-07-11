// Clean CSP from HTML for production builds
// Netlify handles CSP via headers

const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'index.html');
let content = fs.readFileSync(indexPath, 'utf8');

// Remove CSP meta tag if it exists (covers both single and multi-line formats)
content = content.replace(
  /\s*<meta\s+http-equiv=["']Content-Security-Policy["'].*?>\s*/gs,
  ''
);

fs.writeFileSync(indexPath, content);
console.log('🧹 CSP removed from index.html (handled by server headers)'); 