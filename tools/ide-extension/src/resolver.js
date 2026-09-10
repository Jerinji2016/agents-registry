const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * Resolves the central registry root path.
 * Priority:
 * 1. User/Workspace Setting ('agentsHub.registryPath')
 * 2. Environment Variable (AGENTS_HUB_PATH)
 * 3. Auto-detected from current workspace (.agents/plugins.json inheritance)
 * 4. Auto-detected if current workspace itself contains plugins/
 * 5. Managed auto-clone path: ~/.agents-hub
 * 6. Default fallback path: ~/Developer/agents-hub
 */
function resolveRegistryRoot(workspaceRoot, configuredSetting, envVar) {
  // 1. Explicit setting
  const configured = configuredSetting !== undefined ? configuredSetting : undefined;
  if (configured && typeof configured === 'string' && configured.trim().length > 0) {
    const expanded = configured.startsWith('~')
      ? path.join(os.homedir(), configured.slice(1))
      : configured;
    if (fs.existsSync(expanded) && fs.existsSync(path.join(expanded, 'plugins'))) {
      return expanded;
    }
  }

  // 2. Environment variable
  const envPath = envVar !== undefined ? envVar : process.env.AGENTS_HUB_PATH;
  if (envPath && fs.existsSync(envPath) && fs.existsSync(path.join(envPath, 'plugins'))) {
    return envPath;
  }

  // 3. Inspect active workspace .agents/plugins.json (extract registry from inherited path)
  if (workspaceRoot) {
    const pluginsConfig = path.join(workspaceRoot, '.agents', 'plugins.json');
    if (fs.existsSync(pluginsConfig)) {
      try {
        const data = JSON.parse(fs.readFileSync(pluginsConfig, 'utf8'));
        if (Array.isArray(data.inherits)) {
          for (const item of data.inherits) {
            if (item && item.path) {
              const resolved = item.path.startsWith('~')
                ? path.join(os.homedir(), item.path.slice(1))
                : item.path;
              const match = resolved.match(/(.+)[/\\]plugins[/\\]/);
              if (match && fs.existsSync(match[1]) && fs.existsSync(path.join(match[1], 'plugins'))) {
                return match[1];
              }
            }
          }
        }
      } catch (_) {}
    }

    // 4. Auto-detect if open workspace is the registry itself
    if (fs.existsSync(path.join(workspaceRoot, 'plugins'))) {
      return workspaceRoot;
    }
  }

  // 5. Managed auto-clone path: ~/.agents-hub
  const managedPath = path.join(os.homedir(), '.agents-hub');
  if (fs.existsSync(managedPath) && fs.existsSync(path.join(managedPath, 'plugins'))) {
    return managedPath;
  }

  // 6. Default fallback: ~/Developer/agents-hub
  const defaultPath = path.join(os.homedir(), 'Developer', 'agents-hub');
  if (fs.existsSync(defaultPath) && fs.existsSync(path.join(defaultPath, 'plugins'))) {
    return defaultPath;
  }

  return undefined;
}

module.exports = {
  resolveRegistryRoot
};
