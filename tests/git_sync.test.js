const { describe, it } = require('node:test');
const assert = require('node:assert');
const path = require('path');
const os = require('os');
const {
  DEFAULT_REPO_URL,
  DEFAULT_MANAGED_PATH,
  ensureRegistryExists,
  checkRegistryUpdateStatus
} = require('../tools/ide-extension/src/git-sync.js');

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

  it('should return not_git for non-git or missing paths', async () => {
    const fakePath = path.join(os.tmpdir(), 'non-existent-agents-dir');
    const result = await checkRegistryUpdateStatus(fakePath);
    assert.strictEqual(result.status, 'not_git');
    assert.strictEqual(result.hasUpdates, false);
  });

  it('should return valid status structure for git repository root', async () => {
    const registryRoot = path.resolve(__dirname, '../');
    const result = await checkRegistryUpdateStatus(registryRoot);
    assert.ok(['up_to_date', 'updates_available', 'error'].includes(result.status));
    assert.strictEqual(typeof result.hasUpdates, 'boolean');
  });
});
