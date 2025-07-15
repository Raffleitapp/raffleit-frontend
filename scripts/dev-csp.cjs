// Development CSP injection script
// Run this before starting dev server to add localhost CSP

const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'index.html');
let content = fs.readFileSync(indexPath, 'utf8');

// Remove any existing CSP first (both comment and meta tag)
content = content.replace(
  /\s*<!-- Content Security Policy.*?-->\s*\n?\s*<meta\s+http-equiv=["']Content-Security-Policy["'].*?>\s*\n?\s*/gs,
  ''
);

// Also handle case where only meta tag exists without comment
content = content.replace(
  /\s*<meta\s+http-equiv=["']Content-Security-Policy["'].*?>\s*\n?\s*/gs,
  ''
);

// Add development CSP
const csp = `    <!-- Content Security Policy - DEVELOPMENT ONLY -->
    <meta http-equiv="Content-Security-Policy" content="
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline';
      style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
      font-src 'self' https://fonts.gstatic.com;
      img-src 'self' data: https: http://localhost:8000 http://127.0.0.1:8000;
      connect-src 'self' https: wss: http://localhost:8000 http://127.0.0.1:8000;
      frame-src 'self' https://www.paypal.com https://sandbox.paypal.com;
    ">

`;

// Insert CSP after keywords meta tag
content = content.replace(
  /(<meta name="keywords"[^>]*>)/,
  `$1\n\n${csp}`
);

fs.writeFileSync(indexPath, content);
console.log('🔒 Development CSP added to index.html'); 