const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { linkPlugin, checkStatus, listRegistry } = require('../tools/cli/src/index.js');

const REGISTRY_ROOT = path.resolve(__dirname, '../');

describe('CLI Integration Tests', () => {
  let tempWorkspace;

  beforeEach(() => {
    tempWorkspace = fs.mkdtempSync(path.join(os.tmpdir(), 'agents-hub-test-'));
  });

  afterEach(() => {
    if (fs.existsSync(tempWorkspace)) {
      fs.rmSync(tempWorkspace, { recursive: true, force: true });
    }
  });

  it('should list registry contents without errors', () => {
    assert.doesNotThrow(() => {
      listRegistry();
    });
  });

  it('should link a plugin and create .agents/plugins.json and project_overrides.md', () => {
    linkPlugin('flutter', tempWorkspace);

    const pluginsConfig = path.join(tempWorkspace, '.agents', 'plugins.json');
    assert.ok(fs.existsSync(pluginsConfig), '.agents/plugins.json should be created');

    const config = JSON.parse(fs.readFileSync(pluginsConfig, 'utf8'));
    assert.ok(Array.isArray(config.inherits), 'inherits must be an array');
    assert.strictEqual(config.inherits.length, 1);

    const expectedPath = path.join(REGISTRY_ROOT, 'plugins', 'flutter', 'plugin.json');
    assert.strictEqual(config.inherits[0].path, expectedPath);

    const overridesFile = path.join(tempWorkspace, '.agents', 'rules', 'project_overrides.md');
    assert.ok(fs.existsSync(overridesFile), 'project_overrides.md template should be copied');
  });

  it('should be idempotent when linking the same plugin multiple times', () => {
    linkPlugin('flutter', tempWorkspace);
    linkPlugin('flutter', tempWorkspace);

    const pluginsConfig = path.join(tempWorkspace, '.agents', 'plugins.json');
    const config = JSON.parse(fs.readFileSync(pluginsConfig, 'utf8'));
    assert.strictEqual(config.inherits.length, 1, 'Should not add duplicate entries for same plugin');
  });

  it('should allow linking multiple distinct plugins', () => {
    linkPlugin('flutter', tempWorkspace);
    linkPlugin('react', tempWorkspace);

    const pluginsConfig = path.join(tempWorkspace, '.agents', 'plugins.json');
    const config = JSON.parse(fs.readFileSync(pluginsConfig, 'utf8'));
    assert.strictEqual(config.inherits.length, 2, 'Should contain both flutter and react plugins');

    const expectedFlutter = path.join(REGISTRY_ROOT, 'plugins', 'flutter', 'plugin.json');
    const expectedReact = path.join(REGISTRY_ROOT, 'plugins', 'react', 'plugin.json');

    assert.ok(config.inherits.some(i => i.path === expectedFlutter));
    assert.ok(config.inherits.some(i => i.path === expectedReact));
  });

  it('should recover gracefully from corrupted .agents/plugins.json', () => {
    const agentsDir = path.join(tempWorkspace, '.agents');
    fs.mkdirSync(agentsDir, { recursive: true });
    fs.writeFileSync(path.join(agentsDir, 'plugins.json'), '{ corrupted json ...');

    assert.doesNotThrow(() => {
      linkPlugin('flutter', tempWorkspace);
    });

    const config = JSON.parse(fs.readFileSync(path.join(agentsDir, 'plugins.json'), 'utf8'));
    assert.strictEqual(config.inherits.length, 1);
  });

  it('should inspect workspace status without errors', () => {
    assert.doesNotThrow(() => {
      checkStatus(tempWorkspace);
    });

    linkPlugin('flutter', tempWorkspace);

    assert.doesNotThrow(() => {
      checkStatus(tempWorkspace);
    });
  });
});
