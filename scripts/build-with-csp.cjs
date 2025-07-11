// Build with environment-specific CSP
// Usage: node scripts/build-with-csp.js [environment]
// Environments: development, staging, production

const fs = require('fs');
const path = require('path');

const environment = process.argv[2] || 'production';
const indexPath = path.join(__dirname, '..', 'index.html');

console.log(`🔧 Setting up CSP for ${environment} environment...`);

// Environment-specific CSP configurations
const cspConfigs = {
  development: {
    imgSrc: "'self' data: https: http://localhost:8000 http://127.0.0.1:8000",
    connectSrc: "'self' https: wss: http://localhost:8000 http://127.0.0.1:8000",
    comment: "DEVELOPMENT"
  },
  staging: {
    imgSrc: "'self' data: https: https://api.funditzone.com",
    connectSrc: "'self' https: wss: https://api.funditzone.com", 
    comment: "STAGING"
  },
  production: {
    imgSrc: "'self' data: https: https://api.funditzone.com",
    connectSrc: "'self' https: wss: https://api.funditzone.com",
    comment: "PRODUCTION"
  }
};

const config = cspConfigs[environment] || cspConfigs.production;

let content = fs.readFileSync(indexPath, 'utf8');

// Remove existing CSP if present
content = content.replace(
  /\s*<!-- Content Security Policy.*?-->\s*/gs,
  ''
);

// Add environment-specific CSP
const csp = `    <!-- Content Security Policy - ${config.comment} -->
    <meta http-equiv="Content-Security-Policy" content="
      default-src 'self';
      script-src 'self' 'unsafe-eval';
      style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
      font-src 'self' https://fonts.gstatic.com;
      img-src ${config.imgSrc};
      connect-src ${config.connectSrc};
      frame-src 'self' https://www.paypal.com https://sandbox.paypal.com;
    ">

`;

// Insert CSP after keywords meta tag
content = content.replace(
  /(<meta name="keywords"[^>]*>)/,
  `$1\n\n${csp}`
);

fs.writeFileSync(indexPath, content);
console.log(`✅ ${environment.toUpperCase()} CSP configured in index.html`); 