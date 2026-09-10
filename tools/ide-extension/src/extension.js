const vscode = require('vscode');
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
 * 5. Single default fallback: ~/Developer/agents-hub
 */
function resolveRegistryRoot(workspaceRoot) {
  // 1. Explicit VS Code setting
  const configured = vscode.workspace.getConfiguration('agentsHub').get('registryPath');
  if (configured && typeof configured === 'string' && configured.trim().length > 0) {
    const expanded = configured.startsWith('~')
      ? path.join(os.homedir(), configured.slice(1))
      : configured;
    if (fs.existsSync(expanded) && fs.existsSync(path.join(expanded, 'plugins'))) {
      return expanded;
    }
  }

  // 2. Environment variable
  if (process.env.AGENTS_HUB_PATH && fs.existsSync(process.env.AGENTS_HUB_PATH)) {
    return process.env.AGENTS_HUB_PATH;
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

  // 5. Default auto-detect path: ~/Developer/agents-hub
  const defaultPath = path.join(os.homedir(), 'Developer', 'agents-hub');
  if (fs.existsSync(defaultPath) && fs.existsSync(path.join(defaultPath, 'plugins'))) {
    return defaultPath;
  }

  return undefined;
}

class StacksProvider {
  constructor(getWorkspaceRoot) {
    this.getWorkspaceRoot = getWorkspaceRoot;
    this._onDidChangeTreeData = new vscode.EventEmitter();
    this.onDidChangeTreeData = this._onDidChangeTreeData.event;
  }

  refresh() {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element) {
    return element;
  }

  getChildren(element) {
    const workspaceRoot = this.getWorkspaceRoot();
    const registryRoot = resolveRegistryRoot(workspaceRoot);

    // If registry is not found, return empty array so viewsWelcome renders with rich UI & buttons
    if (!registryRoot || !fs.existsSync(registryRoot) || !fs.existsSync(path.join(registryRoot, 'plugins'))) {
      return Promise.resolve([]);
    }

    if (!element) {
      const pluginsDir = path.join(registryRoot, 'plugins');
      if (!fs.existsSync(pluginsDir)) return Promise.resolve([]);

      const activeInheritedPaths = this._getInheritedPaths(workspaceRoot);
      const plugins = fs.readdirSync(pluginsDir).filter(p => {
        return fs.statSync(path.join(pluginsDir, p)).isDirectory();
      });

      const items = plugins.map(p => {
        const manifestPath = path.join(pluginsDir, p, 'plugin.json');
        const isLinked = activeInheritedPaths.includes(manifestPath);

        const item = new vscode.TreeItem(
          p,
          vscode.TreeItemCollapsibleState.Collapsed
        );
        item.description = isLinked ? '● Active' : '○ Inactive';
        item.iconPath = new vscode.ThemeIcon(isLinked ? 'pass-filled' : 'circle-outline');
        item.contextValue = 'stackItem';
        item.pluginName = p;
        item.manifestPath = manifestPath;
        item.isLinked = isLinked;
        return item;
      });

      return Promise.resolve(items);
    } else if (element.pluginName) {
      const pPath = path.join(registryRoot, 'plugins', element.pluginName);
      const subItems = [];

      const rulesDir = path.join(pPath, 'rules');
      if (fs.existsSync(rulesDir)) {
        const rules = fs.readdirSync(rulesDir).filter(f => f.endsWith('.md'));
        rules.forEach(r => {
          const rulePath = path.join(rulesDir, r);
          const rItem = new vscode.TreeItem(r, vscode.TreeItemCollapsibleState.None);
          rItem.iconPath = new vscode.ThemeIcon('book');
          rItem.command = {
            command: 'agentsHub.openRule',
            title: 'Open Rule',
            arguments: [rulePath]
          };
          subItems.push(rItem);
        });
      }

      const skillsDir = path.join(pPath, 'skills');
      if (fs.existsSync(skillsDir)) {
        const skills = fs.readdirSync(skillsDir);
        skills.forEach(s => {
          const sPath = path.join(skillsDir, s, 'SKILL.md');
          const sItem = new vscode.TreeItem(`skill: ${s}`, vscode.TreeItemCollapsibleState.None);
          sItem.iconPath = new vscode.ThemeIcon('zap');
          sItem.command = {
            command: 'agentsHub.openRule',
            title: 'Open Skill',
            arguments: [sPath]
          };
          subItems.push(sItem);
        });
      }

      return Promise.resolve(subItems);
    }

    return Promise.resolve([]);
  }

  _getInheritedPaths(workspaceRoot) {
    if (!workspaceRoot) return [];
    const pluginsConfig = path.join(workspaceRoot, '.agents', 'plugins.json');
    if (!fs.existsSync(pluginsConfig)) return [];
    try {
      const data = JSON.parse(fs.readFileSync(pluginsConfig, 'utf8'));
      if (Array.isArray(data.inherits)) {
        return data.inherits.map(i => {
          if (!i || !i.path) return '';
          return i.path.startsWith('~') ? path.join(os.homedir(), i.path.slice(1)) : i.path;
        });
      }
    } catch (_) {}
    return [];
  }
}

class ActiveRulesProvider {
  constructor(getWorkspaceRoot) {
    this.getWorkspaceRoot = getWorkspaceRoot;
    this._onDidChangeTreeData = new vscode.EventEmitter();
    this.onDidChangeTreeData = this._onDidChangeTreeData.event;
  }

  refresh() {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element) {
    return element;
  }

  getChildren(element) {
    const workspaceRoot = this.getWorkspaceRoot();
    if (!workspaceRoot) return Promise.resolve([]);

    const items = [];
    const localRulesDir = path.join(workspaceRoot, '.agents', 'rules');

    if (fs.existsSync(localRulesDir)) {
      const files = fs.readdirSync(localRulesDir).filter(f => f.endsWith('.md'));
      files.forEach(f => {
        const item = new vscode.TreeItem(f, vscode.TreeItemCollapsibleState.None);
        item.description = 'Local Override';
        item.iconPath = new vscode.ThemeIcon('edit');
        item.command = {
          command: 'agentsHub.openRule',
          title: 'Open Override Rule',
          arguments: [path.join(localRulesDir, f)]
        };
        items.push(item);
      });
    }

    return Promise.resolve(items);
  }
}

class RegistryConfigProvider {
  constructor(getWorkspaceRoot) {
    this.getWorkspaceRoot = getWorkspaceRoot;
    this._onDidChangeTreeData = new vscode.EventEmitter();
    this.onDidChangeTreeData = this._onDidChangeTreeData.event;
  }

  refresh() {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element) {
    return element;
  }

  getChildren() {
    const workspaceRoot = this.getWorkspaceRoot();
    const currentRoot = resolveRegistryRoot(workspaceRoot);
    const configuredSetting = vscode.workspace.getConfiguration('agentsHub').get('registryPath');

    const items = [];

    if (currentRoot && fs.existsSync(currentRoot) && fs.existsSync(path.join(currentRoot, 'plugins'))) {
      // Registry Found & Valid
      const locationItem = new vscode.TreeItem(
        `📍 ${currentRoot}`,
        vscode.TreeItemCollapsibleState.None
      );
      locationItem.description = configuredSetting ? 'Custom Setting' : 'Auto-Detected';
      locationItem.tooltip = 'Active central registry directory. Click to change.';
      locationItem.iconPath = new vscode.ThemeIcon('folder');
      locationItem.command = {
        command: 'agentsHub.setRegistryPath',
        title: 'Change Registry Folder'
      };
      items.push(locationItem);

      const changeItem = new vscode.TreeItem('📁 Change Registry Folder...', vscode.TreeItemCollapsibleState.None);
      changeItem.iconPath = new vscode.ThemeIcon('folder-opened');
      changeItem.command = {
        command: 'agentsHub.setRegistryPath',
        title: 'Change Registry Folder'
      };
      items.push(changeItem);

      if (configuredSetting) {
        const resetItem = new vscode.TreeItem('🔄 Reset to Auto-Detect', vscode.TreeItemCollapsibleState.None);
        resetItem.tooltip = 'Clear custom setting and return to auto-detection';
        resetItem.iconPath = new vscode.ThemeIcon('discard');
        resetItem.command = {
          command: 'agentsHub.resetRegistryPath',
          title: 'Reset to Auto-Detect'
        };
        items.push(resetItem);
      }
    } else {
      // Registry Not Found
      const warningItem = new vscode.TreeItem('⚠ No Registry Configured', vscode.TreeItemCollapsibleState.None);
      warningItem.description = 'Not Found';
      warningItem.tooltip = 'No valid agents-hub folder found. Click below to select it.';
      warningItem.iconPath = new vscode.ThemeIcon('warning');
      items.push(warningItem);

      const selectItem = new vscode.TreeItem('📁 Select Registry Folder...', vscode.TreeItemCollapsibleState.None);
      selectItem.description = 'Locate agents-hub';
      selectItem.iconPath = new vscode.ThemeIcon('folder-opened');
      selectItem.command = {
        command: 'agentsHub.setRegistryPath',
        title: 'Select Registry Folder'
      };
      items.push(selectItem);
    }

    return Promise.resolve(items);
  }
}

function activate(context) {
  const getWorkspaceRoot = () => {
    return vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0
      ? vscode.workspace.workspaceFolders[0].uri.fsPath
      : undefined;
  };

  const stacksProvider = new StacksProvider(getWorkspaceRoot);
  const rulesProvider = new ActiveRulesProvider(getWorkspaceRoot);
  const configProvider = new RegistryConfigProvider(getWorkspaceRoot);

  vscode.window.registerTreeDataProvider('agentsHub.stacksView', stacksProvider);
  vscode.window.registerTreeDataProvider('agentsHub.rulesView', rulesProvider);
  vscode.window.registerTreeDataProvider('agentsHub.configView', configProvider);

  function refreshAll() {
    stacksProvider.refresh();
    rulesProvider.refresh();
    configProvider.refresh();
  }

  context.subscriptions.push(
    vscode.commands.registerCommand('agentsHub.refresh', () => {
      refreshAll();
      vscode.window.showInformationMessage('Agents Hub: Refreshed stacks and configuration.');
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('agentsHub.setRegistryPath', async () => {
      const uri = await vscode.window.showOpenDialog({
        canSelectFiles: false,
        canSelectFolders: true,
        canSelectMany: false,
        openLabel: 'Select agents-hub Registry Directory'
      });

      if (uri && uri[0]) {
        const selectedPath = uri[0].fsPath;
        const pluginsCheck = path.join(selectedPath, 'plugins');
        if (!fs.existsSync(pluginsCheck)) {
          vscode.window.showWarningMessage(`Warning: "${selectedPath}" does not appear to contain a "plugins/" folder.`);
        }
        await vscode.workspace.getConfiguration('agentsHub').update('registryPath', selectedPath, vscode.ConfigurationTarget.Global);
        refreshAll();
        vscode.window.showInformationMessage(`Agents Hub: Registry path set to ${selectedPath}`);
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('agentsHub.resetRegistryPath', async () => {
      await vscode.workspace.getConfiguration('agentsHub').update('registryPath', undefined, vscode.ConfigurationTarget.Global);
      refreshAll();
      vscode.window.showInformationMessage('Agents Hub: Registry path reset to Auto-Detect.');
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('agentsHub.openRule', (filePath) => {
      if (fs.existsSync(filePath)) {
        vscode.workspace.openTextDocument(filePath).then(doc => {
          vscode.window.showTextDocument(doc);
        });
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('agentsHub.toggleStack', (item) => {
      const workspaceRoot = getWorkspaceRoot();
      if (!workspaceRoot) {
        vscode.window.showErrorMessage('No active workspace open to link stack.');
        return;
      }
      if (!item || !item.manifestPath) return;

      const agentsDir = path.join(workspaceRoot, '.agents');
      if (!fs.existsSync(agentsDir)) {
        fs.mkdirSync(agentsDir, { recursive: true });
      }

      const configFile = path.join(agentsDir, 'plugins.json');
      let config = { inherits: [] };
      if (fs.existsSync(configFile)) {
        try {
          config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
          if (!Array.isArray(config.inherits)) config.inherits = [];
        } catch (_) {}
      }

      const targetPath = item.manifestPath;

      if (item.isLinked) {
        config.inherits = config.inherits.filter(i => {
          const p = i.path.startsWith('~') ? path.join(os.homedir(), i.path.slice(1)) : i.path;
          return p !== targetPath;
        });
        fs.writeFileSync(configFile, JSON.stringify(config, null, 2) + '\n');
        vscode.window.showInformationMessage(`Removed ${item.pluginName} from current project.`);
      } else {
        config.inherits.push({ path: targetPath });
        fs.writeFileSync(configFile, JSON.stringify(config, null, 2) + '\n');
        vscode.window.showInformationMessage(`Added ${item.pluginName} to current project.`);
      }

      stacksProvider.refresh();
    })
  );

  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(e => {
      if (e.affectsConfiguration('agentsHub.registryPath')) {
        refreshAll();
      }
    })
  );
}

function deactivate() {}

module.exports = {
  activate,
  deactivate
};
