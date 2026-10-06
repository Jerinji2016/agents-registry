const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '../../');
const EXT_DIR = path.join(ROOT_DIR, 'tools', 'ide-extension');

function getVsixFile() {
  const pkg = JSON.parse(fs.readFileSync(path.join(EXT_DIR, 'package.json'), 'utf8'));
  const targetName = `antigravity-agents-hub-${pkg.version}.vsix`;
  const targetPath = path.join(EXT_DIR, targetName);

  if (fs.existsSync(targetPath)) {
    return targetPath;
  }

  // Fallback: find any .vsix in EXT_DIR sorted by modified time
  const files = fs.readdirSync(EXT_DIR)
    .filter(f => f.endsWith('.vsix'))
    .map(f => ({ file: path.join(EXT_DIR, f), time: fs.statSync(path.join(EXT_DIR, f)).mtimeMs }))
    .sort((a, b) => b.time - a.time);

  if (files.length > 0) {
    return files[0].file;
  }

  throw new Error(`No .vsix package found in ${EXT_DIR}. Run "npm run package:extension" first.`);
}

function install() {
  const vsix = getVsixFile();
  console.log(`📦 Installing extension package: ${path.basename(vsix)}`);

  const appBinary = '/Applications/Antigravity IDE.app/Contents/Resources/app/bin/antigravity-ide';
  const binary = fs.existsSync(appBinary) ? `"${appBinary}"` : 'antigravity-ide';

  try {
    execSync(`${binary} --install-extension "${vsix}" --force`, { stdio: 'inherit' });
    console.log(`✨ Successfully installed ${path.basename(vsix)}! Please reload the Antigravity IDE window.`);
  } catch (err) {
    console.error(`❌ Failed to install extension: ${err.message}`);
    process.exit(1);
  }
}

install();
