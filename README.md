# Funditzone Frontend

A React + TypeScript + Vite raffle application with automated CSP management and deployment workflows.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Configure git hooks (one-time setup)
npm run setup

# Start development server
npm run dev
```

## 📚 Documentation

For complete setup, development, and deployment information, see:

**[📖 Full Documentation](./DOCUMENTATION.md)**

This includes:
- Development setup and workflows
- Content Security Policy (CSP) configuration
- Git hooks and pre-commit automation
- Build and deployment processes
- Environment configuration
- Troubleshooting guide

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: CSS Modules + Tailwind CSS
- **Build**: Vite with TypeScript
- **Deployment**: Netlify with automated CSP headers
- **Security**: Automated CSP management with git hooks

## 🔒 Security Features

- Automated CSP injection/removal for development/production
- Git hooks prevent accidental CSP commits
- Environment-specific API configurations
- Netlify deployment with proper security headers

## 📦 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run setup` | Configure git hooks (one-time) |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run deploy` | Deploy to production |

## 🤝 Contributing

1. Run `npm run setup` for first-time setup
2. Use `npm run dev` for development
3. Commit normally - git hooks handle CSP cleanup automatically
4. See [DOCUMENTATION.md](./DOCUMENTATION.md) for detailed workflows

## 📄 License

[Add your license here]
