const https = require('https');
const fs = require('fs');
const path = require('path');
const os = require('os');

const DEFAULT_REPO = 'Jerinji2016/agents-registry';

/**
 * Compares two semantic version strings (e.g. '1.0.0' vs 'v1.0.1').
 * Returns true if latest > current.
 */
function isNewerVersion(current, latest) {
  const cleanCurrent = (current || '').replace(/^v/, '');
  const cleanLatest = (latest || '').replace(/^v/, '');

  const currParts = cleanCurrent.split('.').map(n => parseInt(n, 10) || 0);
  const lateParts = cleanLatest.split('.').map(n => parseInt(n, 10) || 0);

  for (let i = 0; i < 3; i++) {
    const c = currParts[i] || 0;
    const l = lateParts[i] || 0;
    if (l > c) return true;
    if (l < c) return false;
  }
  return false;
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'AgentsHub-Extension-Updater',
        'Accept': 'application/vnd.github.v3+json'
      }
    };

    https.get(url, options, (res) => {
      // Handle redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchJson(res.headers.location).then(resolve).catch(reject);
      }

      if (res.statusCode !== 200) {
        return reject(new Error(`GitHub API returned status ${res.statusCode}`));
      }

      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`Failed to parse response: ${e.message}`));
        }
      });
    }).on('error', reject);
  });
}

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'AgentsHub-Extension-Updater',
        'Accept': 'application/octet-stream'
      }
    };

    https.get(url, options, (res) => {
      // Handle redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadFile(res.headers.location, destPath).then(resolve).catch(reject);
      }

      if (res.statusCode !== 200) {
        return reject(new Error(`Download failed with status code ${res.statusCode}`));
      }

      const fileStream = fs.createWriteStream(destPath);
      res.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close(() => resolve(destPath));
      });
      fileStream.on('error', (err) => {
        fs.unlink(destPath, () => {});
        reject(err);
      });
    }).on('error', reject);
  });
}

/**
 * Checks GitHub Releases API for a newer version of the extension.
 */
async function checkForExtensionUpdates(currentVersion, repo = DEFAULT_REPO) {
  const url = `https://api.github.com/repos/${repo}/releases/latest`;
  const release = await fetchJson(url);

  const tagName = release.tag_name || '';
  const latestVersion = tagName.replace(/^v/, '');
  const hasUpdate = isNewerVersion(currentVersion, latestVersion);

  let vsixAsset = null;
  if (Array.isArray(release.assets)) {
    vsixAsset = release.assets.find(a => a.name && a.name.endsWith('.vsix'));
  }

  return {
    hasUpdate,
    currentVersion,
    latestVersion,
    tagName,
    releaseName: release.name || tagName,
    releaseNotes: release.body || '',
    releaseUrl: release.html_url || `https://github.com/${repo}/releases/latest`,
    vsixDownloadUrl: vsixAsset ? vsixAsset.browser_download_url : null,
    vsixName: vsixAsset ? vsixAsset.name : null
  };
}

module.exports = {
  isNewerVersion,
  checkForExtensionUpdates,
  downloadFile,
  fetchJson
};
