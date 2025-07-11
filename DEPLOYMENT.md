# Deployment Guide

This guide explains how to develop and deploy the Funditzone frontend with proper Content Security Policy (CSP) configuration.

## 🚀 Quick Start

### First Time Setup
```bash
npm run setup
```
- Configures git hooks to prevent committing development CSP
- One-time setup per developer/machine

### Development
```bash
npm run dev
```
- Automatically adds development CSP to `index.html`
- Allows `localhost:8000` backend connections
- Starts Vite dev server

### Production Build
```bash
npm run build
```
- Removes CSP from `index.html` (handled by server headers)
- TypeScript compilation + Vite build
- Ready for deployment

## 📦 Build Commands

| Command | Description | Use Case |
|---------|-------------|----------|
| `npm run setup` | Configure git hooks | One-time setup |
| `npm run dev` | Development server | Local development |
| `npm run build` | Production build | Netlify deployment |
| `npm run build:dev` | Development build | Testing with dev backend |
| `npm run build:staging` | Staging build | Staging environment |
| `npm run build:prod` | Production build | Same as `build` |

## 🌐 Netlify Deployment

### Automatic Deploy
```bash
npm run deploy
```
- Builds production version
- Deploys to Netlify production

### Preview Deploy
```bash
npm run deploy:preview
```
- Builds production version
- Deploys to Netlify preview URL

### Manual Deploy
1. Build: `npm run build`
2. Deploy: `netlify deploy --prod` (or drag `dist` folder to Netlify)

## 🔒 CSP Configuration

### Development
- CSP injected into `index.html` during dev
- Allows `localhost:8000` and `127.0.0.1:8000`
- Automatically cleaned for production builds

### Production
- CSP handled by `netlify.toml` headers
- Only allows `https://api.funditzone.com`
- Secure production configuration

## 🔧 Environment Detection

The app automatically detects environment:
- **Development**: `localhost` → `http://localhost:8000/api`
- **Production**: Other domains → `https://api.funditzone.com/api`

## 🚫 Preventing CSP Commits

**Problem**: Development CSP shouldn't be committed to git

**Solution**: Pre-commit hook automatically cleans CSP before commits

```bash
# This workflow is completely automatic:
npm run dev           # Adds CSP for development
git add .
git commit -m "..."   # Hook automatically cleans CSP
```

See `GIT_HOOKS_GUIDE.md` for details.

## 📁 Files Overview

- `scripts/dev-csp.cjs` - Adds development CSP
- `scripts/clean-csp.cjs` - Removes CSP for production
- `scripts/build-with-csp.cjs` - Environment-specific CSP injection
- `scripts/setup-hooks.cjs` - One-time git hooks setup
- `.githooks/pre-commit` - Pre-commit hook that cleans CSP
- `netlify.toml` - Netlify configuration with production headers
- `src/constants/constants.tsx` - API URL switching logic

## 🐛 Troubleshooting

### CSP Errors in Development
- Ensure `npm run dev` was used (not `vite` directly)
- Check that CSP includes your backend URL

### CSP Errors in Production
- Verify `netlify.toml` CSP includes your production API
- Check Netlify headers are properly configured

### Images Not Loading
- Development: Check CSP includes `localhost:8000`
- Production: Check CSP includes your image domain

### Git Hooks Not Working
- Run `npm run setup` to configure hooks
- Check git config: `git config core.hooksPath` should show `.githooks`

## 📝 Notes

- **Never manually clean CSP** - git hooks handle this automatically
- **Run `npm run setup` once** per developer/machine
- Production builds automatically clean CSP
- Netlify handles all security headers via `netlify.toml`
- Development CSP is automatically added/removed 