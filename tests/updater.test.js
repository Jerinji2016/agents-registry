const { describe, it } = require('node:test');
const assert = require('node:assert');
const { isNewerVersion } = require('../tools/ide-extension/src/updater.js');

describe('Updater Version Comparison Tests', () => {
  it('should identify newer patch versions', () => {
    assert.strictEqual(isNewerVersion('1.0.0', '1.0.1'), true);
    assert.strictEqual(isNewerVersion('v1.0.0', 'v1.0.1'), true);
  });

  it('should identify newer minor and major versions', () => {
    assert.strictEqual(isNewerVersion('1.0.0', '1.1.0'), true);
    assert.strictEqual(isNewerVersion('1.0.0', '2.0.0'), true);
    assert.strictEqual(isNewerVersion('v1.0.0', 'v2.0.0'), true);
  });

  it('should return false for older or equal versions', () => {
    assert.strictEqual(isNewerVersion('1.0.0', '1.0.0'), false);
    assert.strictEqual(isNewerVersion('v1.0.0', '1.0.0'), false);
    assert.strictEqual(isNewerVersion('1.1.0', '1.0.9'), false);
    assert.strictEqual(isNewerVersion('2.0.0', '1.9.9'), false);
  });

  it('should handle missing or malformed versions gracefully', () => {
    assert.strictEqual(isNewerVersion(undefined, '1.0.0'), true);
    assert.strictEqual(isNewerVersion('1.0.0', undefined), false);
    assert.strictEqual(isNewerVersion('', ''), false);
  });
});
