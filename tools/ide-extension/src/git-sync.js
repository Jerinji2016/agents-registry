const { execFile } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const https = require('https');

const DEFAULT_REPO_URL = 'https://github.com/Jerinji2016/agents-registry.git';
const DEFAULT_MANAGED_PATH = path.join(os.homedir(), '.agents-hub');

function execGit(args, cwd) {
  return new Promise((resolve, reject) => {
    execFile('git', args, { cwd: cwd || undefined, timeout: 60000 }, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(stderr ? stderr.trim() : error.message));
      } else {
        resolve(stdout ? stdout.trim() : '');
      }
    });
  });
}

/**
 * Ensures the registry exists on disk at targetPath.
 * If not, clones from repoUrl.
 */
async function ensureRegistryExists(targetPath = DEFAULT_MANAGED_PATH, repoUrl = DEFAULT_REPO_URL) {
  const resolved = targetPath.startsWith('~')
    ? path.join(os.homedir(), targetPath.slice(1))
    : targetPath;

  if (fs.existsSync(resolved) && fs.existsSync(path.join(resolved, 'plugins'))) {
    return { status: 'exists', path: resolved };
  }

  // Clone into destination
  try {
    const parentDir = path.dirname(resolved);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }

    await execGit(['clone', '--depth', '1', repoUrl, resolved]);
    return { status: 'cloned', path: resolved };
  } catch (err) {
    throw new Error(`Failed to clone registry from ${repoUrl}: ${err.message}`);
  }
}

/**
 * Pulls the latest registry updates in targetPath using git pull --ff-only.
 */
async function pullLatestRegistry(targetPath = DEFAULT_MANAGED_PATH) {
  const resolved = targetPath.startsWith('~')
    ? path.join(os.homedir(), targetPath.slice(1))
    : targetPath;

  if (!fs.existsSync(resolved)) {
    return ensureRegistryExists(resolved);
  }

  const gitDir = path.join(resolved, '.git');
  if (!fs.existsSync(gitDir)) {
    throw new Error(`Directory "${resolved}" is not a Git repository. Cannot pull updates.`);
  }

  try {
    const output = await execGit(['pull', '--ff-only'], resolved);
    const isUpToDate = output.includes('Already up to date');
    return {
      status: 'updated',
      isUpToDate,
      message: output || 'Successfully pulled latest changes.',
      path: resolved
    };
  } catch (err) {
    throw new Error(`Failed to pull updates for ${resolved}: ${err.message}`);
  }
}

/**
 * Checks whether the local registry repository is up to date with remote GitHub.
 * Returns { status: 'up_to_date' | 'updates_available' | 'not_git' | 'error', localCommit, remoteCommit, message }
 */
async function checkRegistryUpdateStatus(targetPath = DEFAULT_MANAGED_PATH, repoUrl = DEFAULT_REPO_URL) {
  const resolved = targetPath.startsWith('~')
    ? path.join(os.homedir(), targetPath.slice(1))
    : targetPath;

  if (!fs.existsSync(resolved) || !fs.existsSync(path.join(resolved, '.git'))) {
    return { status: 'not_git', hasUpdates: false, message: 'Not a git repository.' };
  }

  try {
    const localCommit = await execGit(['rev-parse', 'HEAD'], resolved);
    const remoteOutput = await execGit(['ls-remote', repoUrl, 'HEAD', 'refs/heads/main'], resolved);
    const lines = remoteOutput.split('\n').filter(Boolean);
    let remoteCommit = '';
    for (const line of lines) {
      const [sha, ref] = line.trim().split(/\s+/);
      if (ref === 'refs/heads/main' || ref === 'HEAD') {
        remoteCommit = sha;
        break;
      }
    }

    if (!remoteCommit && lines.length > 0) {
      remoteCommit = lines[0].split(/\s+/)[0];
    }

    if (!remoteCommit) {
      return { status: 'unknown', hasUpdates: false, localCommit, message: 'Could not determine remote HEAD.' };
    }

    const isUpToDate = localCommit === remoteCommit;
    return {
      status: isUpToDate ? 'up_to_date' : 'updates_available',
      hasUpdates: !isUpToDate,
      localCommit,
      remoteCommit,
      message: isUpToDate ? 'Registry is up to date.' : 'Updates available from GitHub.'
    };
  } catch (err) {
    return {
      status: 'error',
      hasUpdates: false,
      message: err.message
    };
  }
}

module.exports = {
  DEFAULT_REPO_URL,
  DEFAULT_MANAGED_PATH,
  ensureRegistryExists,
  pullLatestRegistry,
  checkRegistryUpdateStatus,
  execGit
};
