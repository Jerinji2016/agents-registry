#!/usr/bin/env node

/**
 * Utility script to bump version numbers in lockstep across:
 * - root package.json
 * - tools/ide-extension/package.json
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '../../');
const EXT_DIR = path.resolve(ROOT_DIR, 'tools/ide-extension');

const rootPkgPath = path.join(ROOT_DIR, 'package.json');
const extPkgPath = path.join(EXT_DIR, 'package.json');

const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const cleanArgs = args.filter(a => a !== '--dry-run');
const bumpType = cleanArgs[0] || 'patch';

function getNextVersion(current, type) {
  const [major, minor, patch] = current.split('.').map(n => parseInt(n, 10) || 0);

  if (type === 'major') return `${major + 1}.0.0`;
  if (type === 'minor') return `${major}.${minor + 1}.0`;
  if (type === 'patch') return `${major}.${minor}.${patch + 1}`;

  // If a custom version string is passed (e.g. 1.2.3)
  if (/^\d+\.\d+\.\d+/.test(type)) return type;

  throw new Error(`Unknown bump type or version format: "${type}". Use patch, minor, major, or X.Y.Z.`);
}

function run() {
  const rootPkg = JSON.parse(fs.readFileSync(rootPkgPath, 'utf8'));
  const currentVersion = rootPkg.version || '1.0.0';
  const nextVersion = getNextVersion(currentVersion, bumpType);

  console.log(`\n📦 Bumping version: ${currentVersion} -> ${nextVersion} ${isDryRun ? '(DRY RUN)' : ''}\n`);

  if (!isDryRun) {
    rootPkg.version = nextVersion;
    fs.writeFileSync(rootPkgPath, JSON.stringify(rootPkg, null, 2) + '\n');
    console.log(`✔ Updated root package.json -> ${nextVersion}`);

    if (fs.existsSync(extPkgPath)) {
      const extPkg = JSON.parse(fs.readFileSync(extPkgPath, 'utf8'));
      extPkg.version = nextVersion;
      fs.writeFileSync(extPkgPath, JSON.stringify(extPkg, null, 2) + '\n');
      console.log(`✔ Updated tools/ide-extension/package.json -> ${nextVersion}`);
    }

    console.log(`\nTag command: git tag -a v${nextVersion} -m "Release v${nextVersion}"\n`);
  } else {
    console.log(`✔ Would update root package.json -> ${nextVersion}`);
    console.log(`✔ Would update tools/ide-extension/package.json -> ${nextVersion}`);
  }
}

if (require.main === module) {
  run();
}

module.exports = { getNextVersion };
