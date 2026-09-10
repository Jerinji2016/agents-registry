const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { resolveRegistryRoot } = require('../tools/ide-extension/src/resolver.js');

const REGISTRY_ROOT = path.resolve(__dirname, '../');

describe('Extension Resolver & Logic Unit Tests', () => {
  let tempWorkspace;

  beforeEach(() => {
    tempWorkspace = fs.mkdtempSync(path.join(os.tmpdir(), 'agents-ext-test-'));
  });

  afterEach(() => {
    if (fs.existsSync(tempWorkspace)) {
      fs.rmSync(tempWorkspace, { recursive: true, force: true });
    }
  });

  it('should prioritize explicit configured setting if valid', () => {
    const result = resolveRegistryRoot(tempWorkspace, REGISTRY_ROOT, undefined);
    assert.strictEqual(result, REGISTRY_ROOT);
  });

  it('should ignore invalid configured setting and fallback', () => {
    const result = resolveRegistryRoot(tempWorkspace, '/invalid/non/existent/path', undefined);
    assert.strictEqual(result, undefined);
  });

  it('should prioritize environment variable if setting is empty', () => {
    const result = resolveRegistryRoot(tempWorkspace, '', REGISTRY_ROOT);
    assert.strictEqual(result, REGISTRY_ROOT);
  });

  it('should auto-detect registry from workspace .agents/plugins.json inheritance', () => {
    const agentsDir = path.join(tempWorkspace, '.agents');
    fs.mkdirSync(agentsDir, { recursive: true });

    const pluginPath = path.join(REGISTRY_ROOT, 'plugins', 'flutter', 'plugin.json');
    fs.writeFileSync(
      path.join(agentsDir, 'plugins.json'),
      JSON.stringify({ inherits: [{ path: pluginPath }] })
    );

    const result = resolveRegistryRoot(tempWorkspace, undefined, undefined);
    assert.strictEqual(result, REGISTRY_ROOT);
  });

  it('should auto-detect if current workspace itself is the registry root', () => {
    const result = resolveRegistryRoot(REGISTRY_ROOT, undefined, undefined);
    assert.strictEqual(result, REGISTRY_ROOT);
  });
});
