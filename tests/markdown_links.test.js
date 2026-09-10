const { describe, it } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '../');

function collectMarkdownFiles(dir) {
  let results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'dist' || entry.name === 'out') {
      continue;
    }
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(collectMarkdownFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      results.push(fullPath);
    }
  }

  return results;
}

describe('Markdown Link Integrity Tests', () => {
  it('should verify all relative file links in markdown documents point to existing files', () => {
    const mdFiles = collectMarkdownFiles(ROOT_DIR);
    assert.ok(mdFiles.length > 0, 'Should find markdown files');

    let checkedLinkCount = 0;

    for (const file of mdFiles) {
      const content = fs.readFileSync(file, 'utf8');
      const fileDir = path.dirname(file);

      // Matches [label](./relative/path.md) or [label](../relative/path.md)
      const linkRegex = /\[([^\]]+)\]\(((\.|\.\.)\/[^)]+)\)/g;
      let match;

      while ((match = linkRegex.exec(content)) !== null) {
        const relativeTarget = match[2];
        // Strip out query params or anchors like #section
        const cleanedTarget = relativeTarget.split('#')[0].split('?')[0];
        if (cleanedTarget) {
          const resolvedPath = path.resolve(fileDir, cleanedTarget);
          assert.ok(
            fs.existsSync(resolvedPath),
            `Broken relative link in ${path.relative(ROOT_DIR, file)}: "${relativeTarget}" -> points to non-existent "${resolvedPath}"`
          );
          checkedLinkCount++;
        }
      }
    }

    assert.ok(checkedLinkCount > 0, `Should have verified at least one relative markdown link (checked ${checkedLinkCount})`);
  });
});
