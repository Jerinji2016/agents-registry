const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { linkPlugin, unlinkPlugin, checkStatus, listRegistry } = require('../tools/cli/src/index.js');

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

  it('should link a stack plugin and automatically link core plugin and project_overrides.md', () => {
    linkPlugin('flutter', tempWorkspace);

    const pluginsDir = path.join(tempWorkspace, '.agents', 'plugins');
    assert.ok(fs.existsSync(pluginsDir), '.agents/plugins directory should be created');

    // Check core plugin symlink
    const coreLink = path.join(pluginsDir, 'core');
    assert.ok(fs.existsSync(coreLink), '.agents/plugins/core should exist');
    assert.ok(fs.existsSync(path.join(coreLink, 'plugin.json')), 'core/plugin.json must be accessible');
    assert.ok(fs.existsSync(path.join(coreLink, 'rules', 'ai_agent_behavior.md')), 'core rules must be accessible');

    // Check flutter plugin symlink
    const flutterLink = path.join(pluginsDir, 'flutter');
    assert.ok(fs.existsSync(flutterLink), '.agents/plugins/flutter should exist');
    assert.ok(fs.existsSync(path.join(flutterLink, 'plugin.json')), 'flutter/plugin.json must be accessible');

    // Check project_overrides.md template
    const overridesFile = path.join(tempWorkspace, '.agents', 'rules', 'project_overrides.md');
    assert.ok(fs.existsSync(overridesFile), 'project_overrides.md template should be copied');
  });

  it('should be idempotent when linking the same plugin multiple times', () => {
    linkPlugin('flutter', tempWorkspace);
    assert.doesNotThrow(() => {
      linkPlugin('flutter', tempWorkspace);
    });

    const flutterLink = path.join(tempWorkspace, '.agents', 'plugins', 'flutter');
    assert.ok(fs.existsSync(flutterLink));
  });

  it('should allow linking multiple distinct plugins', () => {
    linkPlugin('flutter', tempWorkspace);
    linkPlugin('react', tempWorkspace);

    const pluginsDir = path.join(tempWorkspace, '.agents', 'plugins');
    assert.ok(fs.existsSync(path.join(pluginsDir, 'core')));
    assert.ok(fs.existsSync(path.join(pluginsDir, 'flutter')));
    assert.ok(fs.existsSync(path.join(pluginsDir, 'react')));
  });

  it('should unlink a plugin properly', () => {
    linkPlugin('flutter', tempWorkspace);
    const flutterLink = path.join(tempWorkspace, '.agents', 'plugins', 'flutter');
    assert.ok(fs.existsSync(flutterLink));

    unlinkPlugin('flutter', tempWorkspace);
    assert.strictEqual(fs.existsSync(flutterLink), false, 'flutter plugin should be unlinked');
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
