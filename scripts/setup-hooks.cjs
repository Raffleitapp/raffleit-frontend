// Setup git hooks for the project
// This ensures CSP is automatically cleaned before commits

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Setting up git hooks...');

try {
  // Make sure .githooks directory exists
  const hooksDir = path.join(__dirname, '..', '.githooks');
  if (!fs.existsSync(hooksDir)) {
    fs.mkdirSync(hooksDir, { recursive: true });
    console.log('📁 Created .githooks directory');
  }

  // Make pre-commit hook executable
  const preCommitPath = path.join(hooksDir, 'pre-commit');
  if (fs.existsSync(preCommitPath)) {
    try {
      execSync(`chmod +x "${preCommitPath}"`, { stdio: 'inherit' });
      console.log('✅ Made pre-commit hook executable');
    } catch (error) {
      console.log('⚠️  Could not make pre-commit hook executable (may need manual chmod)');
    }
  }

  // Configure git to use custom hooks directory
  try {
    execSync('git config core.hooksPath .githooks', { stdio: 'inherit' });
    console.log('✅ Configured git to use .githooks directory');
  } catch (error) {
    console.log('⚠️  Could not configure git hooks path');
    throw error;
  }

  console.log('🎉 Git hooks setup complete!');
  console.log('');
  console.log('ℹ️  Your commits will now automatically clean CSP from index.html');
  console.log('ℹ️  This prevents accidentally committing development CSP tags');

} catch (error) {
  console.error('❌ Failed to setup git hooks:', error.message);
  process.exit(1);
} 