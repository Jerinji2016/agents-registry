const { describe, it } = require('node:test');
const assert = require('node:assert');
const path = require('path');
const os = require('os');
const { DEFAULT_REPO_URL, DEFAULT_MANAGED_PATH, ensureRegistryExists } = require('../tools/ide-extension/src/git-sync.js');

describe('Git Sync Module Tests', () => {
  it('should have valid default GitHub repository URL and managed path', () => {
    assert.strictEqual(DEFAULT_REPO_URL, 'https://github.com/Jerinji2016/agents-registry.git');
    assert.strictEqual(DEFAULT_MANAGED_PATH, path.join(os.homedir(), '.agents-hub'));
  });

  it('should recognize existing registry on disk when plugins directory is present', async () => {
    const registryRoot = path.resolve(__dirname, '../');
    const result = await ensureRegistryExists(registryRoot);
    assert.strictEqual(result.status, 'exists');
    assert.strictEqual(result.path, registryRoot);
  });
});
