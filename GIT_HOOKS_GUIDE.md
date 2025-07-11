# Git Hooks Guide

## 🚫 Problem: Accidentally Committing Development CSP

During development, `index.html` gets CSP meta tags added for localhost backend access. You don't want to commit these development-specific tags.

## ✅ Solution: Automatic Pre-Commit Hook

A git pre-commit hook automatically cleans CSP from `index.html` before every commit.

## 🔧 How It Works

1. **During Development**: `npm run dev` adds CSP to `index.html`
2. **Before Commit**: Pre-commit hook detects CSP and cleans it
3. **Commit**: Only the clean version gets committed
4. **No Manual Steps**: Everything is automatic

## 📋 Setup (One-Time)

```bash
npm run setup
```

This configures git to use the pre-commit hook.

## 🎯 What Happens During Commit

```bash
git add .
git commit -m "My changes"
```

**Output:**
```
🔍 Checking for CSP in index.html...
🧹 Found CSP meta tags in index.html, cleaning...
✅ CSP cleaned from index.html and added to commit
```

## 🔄 Workflow

```bash
# Start development
npm run dev                    # Adds CSP to index.html

# Make changes, then commit
git add .
git commit -m "Add feature"    # Hook automatically cleans CSP

# Continue development
npm run dev                    # Adds CSP back for development
```

## 📁 Files Created

- `.githooks/pre-commit` - The pre-commit hook script
- `scripts/setup-hooks.cjs` - One-time setup script

## 🎉 Benefits

- **Zero Manual Work**: Never manually clean CSP again
- **No Accidents**: Impossible to commit development CSP
- **Team-Friendly**: Works for all developers who run `npm run setup`
- **Non-Intrusive**: Doesn't change your normal git workflow

## 🔧 Advanced

### Manual Setup (if npm run setup fails)
```bash
chmod +x .githooks/pre-commit
git config core.hooksPath .githooks
```

### Disable Hook (temporary)
```bash
git commit --no-verify -m "Skip hook"
```

### Check Hook Status
```bash
git config core.hooksPath  # Should show: .githooks
``` 