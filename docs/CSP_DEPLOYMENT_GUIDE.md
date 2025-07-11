# Content Security Policy (CSP) Deployment Guide

## Problem
The current CSP configuration is hardcoded for development (`localhost:8000`) and needs to be updated for each deployment environment.

## Solutions

### Option 1: Environment-Based Build Scripts (Recommended)

**1. Create environment-specific build scripts:**

```json
// package.json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "build:dev": "node scripts/build-csp.js development && npm run build",
    "build:staging": "node scripts/build-csp.js staging && npm run build", 
    "build:prod": "node scripts/build-csp.js production && npm run build"
  }
}
```

**2. Create CSP replacement script (`scripts/build-csp.js`):**

```javascript
const fs = require('fs');
const path = require('path');

const environments = {
  development: {
    API_DOMAIN: 'http://localhost:8000 http://127.0.0.1:8000'
  },
  staging: {
    API_DOMAIN: 'https://staging-api.funditzone.com'
  },
  production: {
    API_DOMAIN: 'https://api.funditzone.com'
  }
};

const env = process.argv[2] || 'production';
const config = environments[env];

// Replace VITE_API_DOMAIN placeholder in index.html
const indexPath = path.join(__dirname, '..', 'index.html');
let content = fs.readFileSync(indexPath, 'utf8');
content = content.replace(/VITE_API_DOMAIN/g, config.API_DOMAIN);
fs.writeFileSync(indexPath, content);
```

**3. Usage:**
```bash
npm run build:dev      # For development
npm run build:staging  # For staging
npm run build:prod     # For production
```

---

### Option 2: Server-Side CSP Headers (Best Practice)

Remove CSP from HTML and configure it at the server level:

**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name funditzone.com;
    
    add_header Content-Security-Policy "
        default-src 'self';
        script-src 'self' 'unsafe-eval';
        style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
        font-src 'self' https://fonts.gstatic.com;
        img-src 'self' data: https: https://api.funditzone.com;
        connect-src 'self' https: wss: https://api.funditzone.com;
        frame-src 'self' https://www.paypal.com;
    ";
}
```

**Apache Configuration (.htaccess):**
```apache
Header always set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: https://api.funditzone.com; connect-src 'self' https: wss: https://api.funditzone.com; frame-src 'self' https://www.paypal.com;"
```

**Netlify Configuration (_headers file):**
```
/*
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: https://api.funditzone.com; connect-src 'self' https: wss: https://api.funditzone.com; frame-src 'self' https://www.paypal.com;
```

---

### Option 3: Dynamic CSP with Environment Variables

**1. Create CSP injection script:**

```javascript
// public/inject-csp.js
(function() {
  const apiDomain = window.location.hostname === 'localhost' 
    ? 'http://localhost:8000 http://127.0.0.1:8000'
    : 'https://api.funditzone.com';
    
  const csp = `
    default-src 'self';
    script-src 'self' 'unsafe-eval';
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    font-src 'self' https://fonts.gstatic.com;
    img-src 'self' data: https: ${apiDomain};
    connect-src 'self' https: wss: ${apiDomain};
    frame-src 'self' https://www.paypal.com https://sandbox.paypal.com;
  `;
  
  const meta = document.createElement('meta');
  meta.httpEquiv = 'Content-Security-Policy';
  meta.content = csp.replace(/\s+/g, ' ').trim();
  document.head.appendChild(meta);
})();
```

**2. Include in index.html:**
```html
<script src="/inject-csp.js"></script>
```

---

### Option 4: Vite Plugin for CSP Injection

**1. Create Vite plugin (`vite-plugin-csp.js`):**

```javascript
export function cspPlugin(options = {}) {
  return {
    name: 'csp-injector',
    transformIndexHtml(html) {
      const apiDomain = options.apiDomain || 'https://api.funditzone.com';
      
      return html.replace(
        'VITE_API_DOMAIN',
        apiDomain
      );
    }
  };
}
```

**2. Configure in vite.config.ts:**

```typescript
import { cspPlugin } from './vite-plugin-csp.js';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    cspPlugin({
      apiDomain: process.env.NODE_ENV === 'development' 
        ? 'http://localhost:8000 http://127.0.0.1:8000'
        : 'https://api.funditzone.com'
    })
  ],
});
```

---

## Deployment-Specific Configurations

### For each deployment environment, you would use:

**Development:**
```
img-src 'self' data: https: http://localhost:8000 http://127.0.0.1:8000;
connect-src 'self' https: wss: http://localhost:8000 http://127.0.0.1:8000;
```

**Staging:**
```
img-src 'self' data: https: https://staging-api.funditzone.com;
connect-src 'self' https: wss: https://staging-api.funditzone.com;
```

**Production:**
```
img-src 'self' data: https: https://api.funditzone.com;
connect-src 'self' https: wss: https://api.funditzone.com;
```

## Recommended Approach

**Option 2 (Server-Side CSP Headers)** is the best practice because:
- ✅ No build-time modifications needed
- ✅ Environment-specific without code changes
- ✅ Better security (can't be tampered with client-side)
- ✅ Easier to manage and update
- ✅ Works with CDNs and caching

If server-side configuration isn't possible, use **Option 1 (Build Scripts)** as it provides good control and is deployment-friendly. 