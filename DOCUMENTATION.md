# Funditzone Frontend Documentation

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Quick Start](#quick-start)
3. [Development Setup](#development-setup)
4. [Content Security Policy (CSP)](#content-security-policy-csp)
5. [Git Hooks & Pre-commit](#git-hooks--pre-commit)
6. [Build & Deployment](#build--deployment)
7. [Environment Configuration](#environment-configuration)
8. [Troubleshooting](#troubleshooting)
9. [File Structure](#file-structure)

## 🚀 Project Overview

Funditzone is a React + TypeScript + Vite raffle application with automated CSP management and deployment workflows.

**Key Features:**
- Automated CSP injection/removal for development/production
- Git hooks prevent accidental CSP commits
- Environment-specific API configurations
- Netlify deployment with proper security headers

## 🏃 Quick Start

### First Time Setup
```bash
# Install dependencies
npm install

# Configure git hooks (one-time setup)
npm run setup

# Start development server
npm run dev
```

### Daily Development
```bash
npm run dev              # Starts dev server with CSP
# Make changes, commit normally - git hooks handle everything automatically
git add .
git commit -m "Changes"  # CSP cleaned for commit, restored for development
# Continue working immediately - no manual CSP management needed!
```

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- Git

### Installation
```bash
git clone <repository-url>
cd raffleit-frontend
npm install
npm run setup  # Configure git hooks
```

### Available Scripts

| Command | Description | Use Case |
|---------|-------------|----------|
| `npm run setup` | Configure git hooks | One-time setup |
| `npm run dev` | Development server | Local development |
| `npm run build` | Production build | Netlify deployment |
| `npm run build:dev` | Development build | Testing with dev backend |
| `npm run build:staging` | Staging build | Staging environment |
| `npm run build:prod` | Production build | Same as `build` |
| `npm run deploy` | Deploy to production | Netlify production |
| `npm run deploy:preview` | Deploy preview | Netlify preview |

## 🔒 Content Security Policy (CSP)

### How CSP Works in This Project

**Development:**
- CSP is automatically injected into `index.html` during development
- Allows connections to `localhost:8000` and `127.0.0.1:8000`
- Automatically removed before commits via git hooks

**Production:**
- CSP is handled by server headers in `netlify.toml`
- Only allows `https://api.funditzone.com`
- No CSP content in committed `index.html`

### Adding CSP for Development

If you need to manually add CSP for development:

```html
<!-- Add this to index.html head section -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-eval';
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  img-src 'self' data: https: http://localhost:8000 http://127.0.0.1:8000;
  connect-src 'self' https: wss: http://localhost:8000 http://127.0.0.1:8000;
  frame-src 'self' https://www.paypal.com https://sandbox.paypal.com;
">
```

**Note:** This is automatically handled by `npm run dev` and cleaned by git hooks.

### CSP for Different Environments

**Development CSP:**
```
img-src 'self' data: https: http://localhost:8000 http://127.0.0.1:8000;
connect-src 'self' https: wss: http://localhost:8000 http://127.0.0.1:8000;
```

**Production CSP:**
```
img-src 'self' data: https: https://api.funditzone.com;
connect-src 'self' https: wss: https://api.funditzone.com;
```

## 🔧 Git Hooks & Pre-commit

### Problem Solved
Prevents accidental commits of development CSP to production while maintaining seamless development workflow.

### How It Works
1. **Development**: `npm run dev` adds CSP to `index.html`
2. **Pre-commit**: Hook automatically detects and cleans CSP for commit
3. **Auto-restore**: Hook automatically restores CSP after commit
4. **Continue**: Developer can continue working without manual intervention

### Setup
```bash
npm run setup
```

### What Happens During Commit
```bash
git add .
git commit -m "My changes"
# Output: 🔍 Checking for CSP in index.html...
#         🧹 Found CSP meta tags, cleaning for commit...
#         ✅ CSP cleaned for commit and restored for development
# Result: Commit has no CSP, working copy keeps CSP for continued development
```

### Developer Experience
- **No manual steps required** - CSP is automatically managed
- **Seamless workflow** - Continue development immediately after commits
- **Zero frustration** - No need to manually add CSP back after each commit
- **Bulletproof** - Impossible to accidentally commit development CSP

### Manual Setup (if needed)
```bash
chmod +x .githooks/pre-commit
git config core.hooksPath .githooks
```

### Bypass Hook (temporary)
```bash
git commit --no-verify -m "Skip hook"
```

## 📦 Build & Deployment

### Netlify Deployment

**Automatic Deploy:**
```bash
npm run deploy
```

**Preview Deploy:**
```bash
npm run deploy:preview
```

**Manual Deploy:**
```bash
npm run build
netlify deploy --prod
```

### Build Process
1. TypeScript compilation
2. Vite build process
3. CSP automatically cleaned from `index.html`
4. Output in `dist/` folder

### Production CSP Headers
CSP is configured in `netlify.toml`:
```toml
[[headers]]
  for = "/*"
  [headers.values]
    Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: https://api.funditzone.com; connect-src 'self' https: wss: https://api.funditzone.com; frame-src 'self' https://www.paypal.com;"
```

## 🌍 Environment Configuration

### API URL Detection
The app automatically detects environment:
- **Development**: `localhost` → `http://localhost:8000/api`
- **Production**: Other domains → `https://api.funditzone.com/api`

### Configuration Files
- `src/constants/constants.tsx` - API URL switching logic
- `netlify.toml` - Netlify configuration with production headers
- `vite.config.ts` - Vite configuration

### Environment-Specific Builds
```bash
npm run build:dev      # Development backend
npm run build:staging  # Staging backend
npm run build:prod     # Production backend
```

## 🐛 Troubleshooting

### CSP Errors in Development
**Problem:** CSP blocking requests to backend
**Solution:** 
- Ensure you used `npm run dev` (not `vite` directly)
- Check CSP includes your backend URL
- Verify backend is running on `localhost:8000`

### CSP Errors in Production
**Problem:** CSP blocking production requests
**Solution:**
- Check `netlify.toml` CSP includes production API
- Verify Netlify headers are deployed
- Check browser dev tools for specific CSP violations

### Images Not Loading
**Problem:** Images blocked by CSP
**Solution:**
- **Development**: Check CSP includes `localhost:8000`
- **Production**: Check CSP includes your image domain

### Git Hooks Not Working
**Problem:** CSP not being cleaned on commit
**Solution:**
- Run `npm run setup` to configure hooks
- Check: `git config core.hooksPath` should show `.githooks`
- Verify hook is executable: `chmod +x .githooks/pre-commit`

### Build Failures
**Problem:** Build failing with CSP issues
**Solution:**
- Clean CSP manually if needed
- Verify `index.html` has no CSP meta tags
- Check `netlify.toml` for proper configuration

## 📁 File Structure

### Key Files
```
├── index.html                          # Main HTML (no CSP in commits)
├── netlify.toml                       # Netlify config with CSP headers
├── package.json                       # Scripts and dependencies
├── DOCUMENTATION.md                   # This file
├── .githooks/
│   └── pre-commit                     # Git hook to clean CSP
├── scripts/
│   ├── build-with-csp.cjs            # Environment-specific CSP
│   ├── clean-csp.cjs                 # Remove CSP from HTML
│   ├── dev-csp.cjs                   # Add development CSP
│   └── setup-hooks.cjs               # Configure git hooks
├── src/
│   ├── constants/
│   │   └── constants.tsx              # API URL configuration
│   └── ...
└── ...
```

### Scripts Explained
- `dev-csp.cjs`: Adds development CSP to `index.html`
- `clean-csp.cjs`: Removes CSP from `index.html`
- `build-with-csp.cjs`: Environment-specific CSP injection
- `setup-hooks.cjs`: One-time git hooks configuration

## 📝 Best Practices

### Development Workflow
1. Always use `npm run dev` for development
2. Commit normally - git hooks handle CSP
3. Never manually modify CSP in `index.html`
4. Use environment-specific builds when needed

### Security
- CSP is enforced at server level in production
- Development CSP is never committed
- All external resources are explicitly allowed
- PayPal integration properly configured

### Deployment
- Use `npm run deploy` for production
- Preview changes with `npm run deploy:preview`
- Monitor Netlify logs for CSP violations
- Test thoroughly in staging environment

## 🆘 Support

If you encounter issues:
1. Check this documentation first
2. Verify your setup with `npm run setup`
3. Check git hooks: `git config core.hooksPath`
4. Clear browser cache and try again
5. Check Netlify deployment logs

---

**Note:** This documentation consolidates all setup, development, and deployment information in one place. Keep it updated as the project evolves. 