const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { resolveRegistryRoot } = require('./resolver.js');
const { ensureRegistryExists, pullLatestRegistry, DEFAULT_MANAGED_PATH } = require('./git-sync.js');
const { checkForExtensionUpdates, downloadFile, isNewerVersion } = require('./updater.js');

const pkgJson = require('../package.json');
const CURRENT_VERSION = pkgJson.version || '1.0.0';

function isSymlink(targetPath) {
  try {
    return fs.lstatSync(targetPath).isSymbolicLink();
  } catch (_) {
    return false;
  }
}

function createPluginSymlink(sourceDir, destDir) {
  if (isSymlink(destDir) || fs.existsSync(destDir)) {
    try {
      const stats = fs.lstatSync(destDir);
      if (stats.isSymbolicLink()) {
        const currentTarget = fs.readlinkSync(destDir);
        const resolvedCurrent = path.isAbsolute(currentTarget)
          ? currentTarget
          : path.resolve(path.dirname(destDir), currentTarget);
        if (resolvedCurrent === path.resolve(sourceDir)) {
          return 'already_linked';
        }
        fs.unlinkSync(destDir);
      } else {
        return 'exists_dir';
      }
    } catch (e) {
      try {
        fs.unlinkSync(destDir);
      } catch (_) {}
    }
  }

  const symlinkType = process.platform === 'win32' ? 'junction' : 'dir';
  fs.symlinkSync(sourceDir, destDir, symlinkType);
  return 'linked';
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

    if (!registryRoot || !fs.existsSync(registryRoot) || !fs.existsSync(path.join(registryRoot, 'plugins'))) {
      return Promise.resolve([]);
    }

    if (!element) {
      const pluginsDir = path.join(registryRoot, 'plugins');
      if (!fs.existsSync(pluginsDir)) return Promise.resolve([]);

      const activePluginNames = this._getActivePluginNames(workspaceRoot);
      const plugins = fs.readdirSync(pluginsDir).filter(p => {
        return fs.statSync(path.join(pluginsDir, p)).isDirectory();
      });

      const items = plugins.map(p => {
        const manifestPath = path.join(pluginsDir, p, 'plugin.json');
        const isLinked = activePluginNames.includes(p);

        const item = new vscode.TreeItem(
          p,
          vscode.TreeItemCollapsibleState.Collapsed
        );
        item.description = isLinked ? '● Active' : '○ Inactive';
        item.iconPath = new vscode.ThemeIcon(isLinked ? 'pass-filled' : 'circle-outline');
        item.contextValue = isLinked ? 'linkedStackItem' : 'unlinkedStackItem';
        item.pluginName = p;
        item.manifestPath = manifestPath;
        item.isLinked = isLinked;
        return item;
      });

      return Promise.resolve(items);
    } else if (element.contextValue === 'stackItem' || element.contextValue === 'linkedStackItem' || element.contextValue === 'unlinkedStackItem') {
      const pPath = path.join(registryRoot, 'plugins', element.pluginName);
      const groups = [];

      const rulesDir = path.join(pPath, 'rules');
      if (fs.existsSync(rulesDir)) {
        const ruleFiles = fs.readdirSync(rulesDir).filter(f => f.endsWith('.md'));
        if (ruleFiles.length > 0) {
          const rulesGroup = new vscode.TreeItem('Rules', vscode.TreeItemCollapsibleState.Expanded);
          rulesGroup.iconPath = new vscode.ThemeIcon('library');
          rulesGroup.contextValue = 'rulesGroup';
          rulesGroup.pluginName = element.pluginName;
          rulesGroup.rulesDir = rulesDir;
          groups.push(rulesGroup);
        }
      }

      const skillsDir = path.join(pPath, 'skills');
      if (fs.existsSync(skillsDir)) {
        const skillFolders = fs.readdirSync(skillsDir);
        if (skillFolders.length > 0) {
          const skillsGroup = new vscode.TreeItem('Skills', vscode.TreeItemCollapsibleState.Expanded);
          skillsGroup.iconPath = new vscode.ThemeIcon('zap');
          skillsGroup.contextValue = 'skillsGroup';
          skillsGroup.pluginName = element.pluginName;
          skillsGroup.skillsDir = skillsDir;
          groups.push(skillsGroup);
        }
      }

      return Promise.resolve(groups);
    } else if (element.contextValue === 'rulesGroup') {
      if (!element.rulesDir || !fs.existsSync(element.rulesDir)) return Promise.resolve([]);
      const rules = fs.readdirSync(element.rulesDir).filter(f => f.endsWith('.md'));
      const items = rules.map(r => {
        const rulePath = path.join(element.rulesDir, r);
        const rItem = new vscode.TreeItem(r, vscode.TreeItemCollapsibleState.None);
        rItem.iconPath = new vscode.ThemeIcon('file-text');
        rItem.command = {
          command: 'agentsHub.openRule',
          title: 'Open Rule',
          arguments: [rulePath]
        };
        return rItem;
      });
      return Promise.resolve(items);
    } else if (element.contextValue === 'skillsGroup') {
      if (!element.skillsDir || !fs.existsSync(element.skillsDir)) return Promise.resolve([]);
      const skills = fs.readdirSync(element.skillsDir);
      const items = skills.map(s => {
        const sPath = path.join(element.skillsDir, s, 'SKILL.md');
        const sItem = new vscode.TreeItem(s, vscode.TreeItemCollapsibleState.None);
        sItem.iconPath = new vscode.ThemeIcon('zap');
        sItem.command = {
          command: 'agentsHub.openRule',
          title: 'Open Skill',
          arguments: [sPath]
        };
        return sItem;
      });
      return Promise.resolve(items);
    }

    return Promise.resolve([]);
  }

  _getActivePluginNames(workspaceRoot) {
    if (!workspaceRoot) return [];
    const active = [];

    // 1. Check .agents/plugins/ symlinks
    const pluginsDir = path.join(workspaceRoot, '.agents', 'plugins');
    if (fs.existsSync(pluginsDir)) {
      try {
        const entries = fs.readdirSync(pluginsDir);
        for (const entry of entries) {
          const entryPath = path.join(pluginsDir, entry);
          if (fs.existsSync(entryPath)) {
            active.push(entry);
          }
        }
      } catch (_) {}
    }

    // 2. Check legacy .agents/plugins.json for backwards compatibility
    const pluginsConfig = path.join(workspaceRoot, '.agents', 'plugins.json');
    if (fs.existsSync(pluginsConfig)) {
      try {
        const data = JSON.parse(fs.readFileSync(pluginsConfig, 'utf8'));
        if (Array.isArray(data.inherits)) {
          data.inherits.forEach(entry => {
            if (entry && entry.path) {
              const match = entry.path.match(/(.+)[/\\]plugins[/\\]([^/\\]+)[/\\]plugin\.json/);
              if (match && match[2] && !active.includes(match[2])) {
                active.push(match[2]);
              }
            }
          });
        }
      } catch (_) {}
    }

    return active;
  }
}

class ActivePluginsProvider {
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

    if (!element) {
      const items = [];
      const discoveredPluginNames = new Set();

      // 1. Linked Plugins via .agents/plugins/
      const pluginsDir = path.join(workspaceRoot, '.agents', 'plugins');
      if (fs.existsSync(pluginsDir)) {
        try {
          const entries = fs.readdirSync(pluginsDir);
          entries.forEach(entry => {
            const pluginFolder = path.join(pluginsDir, entry);
            if (fs.existsSync(pluginFolder)) {
              discoveredPluginNames.add(entry);
              const item = new vscode.TreeItem(
                entry,
                vscode.TreeItemCollapsibleState.Expanded
              );
              item.description = entry === 'core' ? '● Core Standards' : '● Active';
              item.iconPath = new vscode.ThemeIcon('pass-filled');
              item.contextValue = 'activeLinkedStackItem';
              item.pluginName = entry;
              item.pluginRoot = pluginFolder;
              items.push(item);
            }
          });
        } catch (_) {}
      }

      // 2. Legacy .agents/plugins.json fallback
      const pluginsConfig = path.join(workspaceRoot, '.agents', 'plugins.json');
      if (fs.existsSync(pluginsConfig)) {
        try {
          const data = JSON.parse(fs.readFileSync(pluginsConfig, 'utf8'));
          if (Array.isArray(data.inherits)) {
            data.inherits.forEach(entry => {
              if (entry && entry.path) {
                const resolved = entry.path.startsWith('~')
                  ? path.join(os.homedir(), entry.path.slice(1))
                  : entry.path;
                const match = resolved.match(/(.+)[/\\]plugins[/\\]([^/\\]+)[/\\]plugin\.json/);
                const pluginName = match ? match[2] : path.basename(path.dirname(resolved));

                if (!discoveredPluginNames.has(pluginName)) {
                  discoveredPluginNames.add(pluginName);
                  const item = new vscode.TreeItem(
                    pluginName,
                    vscode.TreeItemCollapsibleState.Expanded
                  );
                  item.description = '● Active';
                  item.iconPath = new vscode.ThemeIcon('pass-filled');
                  item.contextValue = 'activeLinkedStackItem';
                  item.pluginName = pluginName;
                  item.manifestPath = resolved;
                  item.pluginRoot = path.dirname(resolved);
                  items.push(item);
                }
              }
            });
          }
        } catch (_) {}
      }

      // 3. Local Project Overrides
      const localRulesDir = path.join(workspaceRoot, '.agents', 'rules');
      if (fs.existsSync(localRulesDir)) {
        const overrideFiles = fs.readdirSync(localRulesDir).filter(f => f.endsWith('.md'));
        if (overrideFiles.length > 0) {
          const overridesGroup = new vscode.TreeItem('Local Overrides', vscode.TreeItemCollapsibleState.Expanded);
          overridesGroup.iconPath = new vscode.ThemeIcon('edit');
          overridesGroup.contextValue = 'localOverridesGroup';
          overridesGroup.localRulesDir = localRulesDir;
          items.push(overridesGroup);
        }
      }

      if (items.length === 0) {
        const emptyItem = new vscode.TreeItem('No active plugins in this workspace', vscode.TreeItemCollapsibleState.None);
        emptyItem.description = 'Click + in HUB to add';
        emptyItem.iconPath = new vscode.ThemeIcon('info');
        return Promise.resolve([emptyItem]);
      }

      return Promise.resolve(items);
    } else if (element.contextValue === 'activeLinkedStackItem') {
      const groups = [];
      const rulesDir = path.join(element.pluginRoot, 'rules');
      if (fs.existsSync(rulesDir)) {
        const ruleFiles = fs.readdirSync(rulesDir).filter(f => f.endsWith('.md'));
        if (ruleFiles.length > 0) {
          const rulesGroup = new vscode.TreeItem('Rules', vscode.TreeItemCollapsibleState.Expanded);
          rulesGroup.iconPath = new vscode.ThemeIcon('library');
          rulesGroup.contextValue = 'rulesGroup';
          rulesGroup.rulesDir = rulesDir;
          groups.push(rulesGroup);
        }
      }

      const skillsDir = path.join(element.pluginRoot, 'skills');
      if (fs.existsSync(skillsDir)) {
        const skillFolders = fs.readdirSync(skillsDir);
        if (skillFolders.length > 0) {
          const skillsGroup = new vscode.TreeItem('Skills', vscode.TreeItemCollapsibleState.Expanded);
          skillsGroup.iconPath = new vscode.ThemeIcon('zap');
          skillsGroup.contextValue = 'skillsGroup';
          skillsGroup.skillsDir = skillsDir;
          groups.push(skillsGroup);
        }
      }

      return Promise.resolve(groups);
    } else if (element.contextValue === 'rulesGroup') {
      if (!element.rulesDir || !fs.existsSync(element.rulesDir)) return Promise.resolve([]);
      const rules = fs.readdirSync(element.rulesDir).filter(f => f.endsWith('.md'));
      const items = rules.map(r => {
        const rulePath = path.join(element.rulesDir, r);
        const rItem = new vscode.TreeItem(r, vscode.TreeItemCollapsibleState.None);
        rItem.iconPath = new vscode.ThemeIcon('file-text');
        rItem.command = {
          command: 'agentsHub.openRule',
          title: 'Open Rule',
          arguments: [rulePath]
        };
        return rItem;
      });
      return Promise.resolve(items);
    } else if (element.contextValue === 'skillsGroup') {
      if (!element.skillsDir || !fs.existsSync(element.skillsDir)) return Promise.resolve([]);
      const skills = fs.readdirSync(element.skillsDir);
      const items = skills.map(s => {
        const sPath = path.join(element.skillsDir, s, 'SKILL.md');
        const sItem = new vscode.TreeItem(s, vscode.TreeItemCollapsibleState.None);
        sItem.iconPath = new vscode.ThemeIcon('zap');
        sItem.command = {
          command: 'agentsHub.openRule',
          title: 'Open Skill',
          arguments: [sPath]
        };
        return sItem;
      });
      return Promise.resolve(items);
    } else if (element.contextValue === 'localOverridesGroup') {
      if (!element.localRulesDir || !fs.existsSync(element.localRulesDir)) return Promise.resolve([]);
      const files = fs.readdirSync(element.localRulesDir).filter(f => f.endsWith('.md'));
      const items = files.map(f => {
        const item = new vscode.TreeItem(f, vscode.TreeItemCollapsibleState.None);
        item.description = 'Local Override';
        item.iconPath = new vscode.ThemeIcon('edit');
        item.command = {
          command: 'agentsHub.openRule',
          title: 'Open Override Rule',
          arguments: [path.join(element.localRulesDir, f)]
        };
        return item;
      });
      return Promise.resolve(items);
    }

    return Promise.resolve([]);
  }
}

class RegistryConfigProvider {
  constructor(getWorkspaceRoot) {
    this.getWorkspaceRoot = getWorkspaceRoot;
    this._onDidChangeTreeData = new vscode.EventEmitter();
    this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    this.updateAvailable = null;
  }

  setUpdateAvailable(info) {
    this.updateAvailable = info;
    this.refresh();
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

    // 1. Update status (if available)
    if (this.updateAvailable && this.updateAvailable.hasUpdate) {
      const updateItem = new vscode.TreeItem(`✨ Update Available: ${this.updateAvailable.tagName}`, vscode.TreeItemCollapsibleState.None);
      updateItem.description = 'Click to install';
      updateItem.iconPath = new vscode.ThemeIcon('cloud-download');
      updateItem.command = {
        command: 'agentsHub.checkUpdates',
        title: 'Install Update'
      };
      items.push(updateItem);
    }

    if (currentRoot && fs.existsSync(currentRoot) && fs.existsSync(path.join(currentRoot, 'plugins'))) {
      // Registry Found & Valid
      const locationItem = new vscode.TreeItem(
        `📍 ${currentRoot}`,
        vscode.TreeItemCollapsibleState.None
      );
      locationItem.description = configuredSetting ? 'Custom Setting' : (currentRoot.includes('.agents-hub') ? 'Managed Auto-Clone' : 'Auto-Detected');
      locationItem.tooltip = 'Active central registry directory. Click to change.';
      locationItem.iconPath = new vscode.ThemeIcon('folder');
      locationItem.command = {
        command: 'agentsHub.setRegistryPath',
        title: 'Change Registry Folder'
      };
      items.push(locationItem);

      const syncItem = new vscode.TreeItem('🔄 Sync Registry', vscode.TreeItemCollapsibleState.None);
      syncItem.iconPath = new vscode.ThemeIcon('cloud-download');
      syncItem.description = 'git pull latest rules';
      syncItem.command = {
        command: 'agentsHub.syncRegistry',
        title: 'Sync Registry'
      };
      items.push(syncItem);

      const checkUpdatesItem = new vscode.TreeItem(`🔍 Extension Version: v${CURRENT_VERSION}`, vscode.TreeItemCollapsibleState.None);
      checkUpdatesItem.iconPath = new vscode.ThemeIcon('sync');
      checkUpdatesItem.description = 'Check for updates';
      checkUpdatesItem.command = {
        command: 'agentsHub.checkUpdates',
        title: 'Check Updates'
      };
      items.push(checkUpdatesItem);

      const changeItem = new vscode.TreeItem('📁 Choose Local Registry Folder...', vscode.TreeItemCollapsibleState.None);
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
      warningItem.tooltip = 'No valid agents-hub folder found. Sync registry or select local folder.';
      warningItem.iconPath = new vscode.ThemeIcon('warning');
      items.push(warningItem);

      const autoSyncItem = new vscode.TreeItem('🚀 Sync Registry', vscode.TreeItemCollapsibleState.None);
      autoSyncItem.description = 'Automatic setup (~/.agents-hub)';
      autoSyncItem.iconPath = new vscode.ThemeIcon('cloud-download');
      autoSyncItem.command = {
        command: 'agentsHub.syncRegistry',
        title: 'Sync Registry'
      };
      items.push(autoSyncItem);

      const selectItem = new vscode.TreeItem('📁 Select Local Registry Folder...', vscode.TreeItemCollapsibleState.None);
      selectItem.description = 'Locate existing clone';
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
  const activePluginsProvider = new ActivePluginsProvider(getWorkspaceRoot);
  const configProvider = new RegistryConfigProvider(getWorkspaceRoot);

  vscode.window.registerTreeDataProvider('agentsHub.stacksView', stacksProvider);
  vscode.window.registerTreeDataProvider('agentsHub.rulesView', activePluginsProvider);
  vscode.window.registerTreeDataProvider('agentsHub.configView', configProvider);

  function refreshAll() {
    stacksProvider.refresh();
    activePluginsProvider.refresh();
    configProvider.refresh();
  }

  async function performUpdateCheck(isManual = false) {
    try {
      if (isManual) {
        await vscode.window.withProgress({
          location: vscode.ProgressLocation.Notification,
          title: 'Checking for Agents Hub updates...',
          cancellable: false
        }, async () => {
          const info = await checkForExtensionUpdates(CURRENT_VERSION);
          configProvider.setUpdateAvailable(info.hasUpdate ? info : null);
          await handleUpdateResult(info, isManual);
        });
      } else {
        const info = await checkForExtensionUpdates(CURRENT_VERSION);
        configProvider.setUpdateAvailable(info.hasUpdate ? info : null);
        if (info.hasUpdate) {
          await handleUpdateResult(info, false);
        }
      }
    } catch (err) {
      if (isManual) {
        vscode.window.showErrorMessage(`Failed to check for updates: ${err.message}`);
      }
    }
  }

  async function handleUpdateResult(info, isManual) {
    if (info.hasUpdate) {
      const choice = await vscode.window.showInformationMessage(
        `A new version of Agents Hub (${info.tagName}) is available! (Current: v${CURRENT_VERSION})`,
        'Update Now',
        'View Release Notes',
        'Later'
      );

      if (choice === 'Update Now') {
        if (!info.vsixDownloadUrl) {
          vscode.window.showErrorMessage('No .vsix asset found in the latest release. Opening release page instead.');
          vscode.env.openExternal(vscode.Uri.parse(info.releaseUrl));
          return;
        }

        await vscode.window.withProgress({
          location: vscode.ProgressLocation.Notification,
          title: `Downloading Agents Hub ${info.tagName}...`,
          cancellable: false
        }, async () => {
          const tmpVsix = path.join(os.tmpdir(), `agents-hub-${info.tagName}.vsix`);
          await downloadFile(info.vsixDownloadUrl, tmpVsix);

          // Install VSIX via VS Code command
          await vscode.commands.executeCommand('workbench.extensions.installExtension', vscode.Uri.file(tmpVsix));

          const reloadChoice = await vscode.window.showInformationMessage(
            `Agents Hub updated to ${info.tagName}! Reload the window to apply changes.`,
            'Reload Window',
            'Later'
          );

          if (reloadChoice === 'Reload Window') {
            vscode.commands.executeCommand('workbench.action.reloadWindow');
          }
        });
      } else if (choice === 'View Release Notes') {
        vscode.env.openExternal(vscode.Uri.parse(info.releaseUrl));
      }
    } else if (isManual) {
      vscode.window.showInformationMessage(`Agents Hub is up to date (v${CURRENT_VERSION}).`);
    }
  }

  context.subscriptions.push(
    vscode.commands.registerCommand('agentsHub.refresh', () => {
      refreshAll();
      vscode.window.showInformationMessage('Agents Hub: Refreshed stacks and configuration.');
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('agentsHub.checkUpdates', () => {
      return performUpdateCheck(true);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('agentsHub.syncRegistry', async () => {
      const workspaceRoot = getWorkspaceRoot();
      const currentRoot = resolveRegistryRoot(workspaceRoot) || DEFAULT_MANAGED_PATH;

      await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: 'Syncing registry...',
        cancellable: false
      }, async () => {
        try {
          const result = await pullLatestRegistry(currentRoot);
          refreshAll();
          vscode.window.showInformationMessage(`Agents Hub: ${result.message || 'Registry synchronized successfully.'}`);
        } catch (err) {
          vscode.window.showErrorMessage(`Sync failed: ${err.message}`);
        }
      });
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

  function modifyStackInheritance(item, add) {
    const workspaceRoot = getWorkspaceRoot();
    if (!workspaceRoot) {
      vscode.window.showErrorMessage('No active workspace open.');
      return;
    }
    if (!item || !item.pluginName) return;

    const registryRoot = resolveRegistryRoot(workspaceRoot);
    if (!registryRoot) {
      vscode.window.showErrorMessage('Central registry root could not be located.');
      return;
    }

    const agentsPluginsDir = path.join(workspaceRoot, '.agents', 'plugins');
    if (!fs.existsSync(agentsPluginsDir)) {
      fs.mkdirSync(agentsPluginsDir, { recursive: true });
    }

    const stackDest = path.join(agentsPluginsDir, item.pluginName);
    const coreDest = path.join(agentsPluginsDir, 'core');
    const coreSource = path.join(registryRoot, 'core');
    const stackSource = path.join(registryRoot, 'plugins', item.pluginName);

    if (!add) {
      // Unlink stack
      if (isSymlink(stackDest) || fs.existsSync(stackDest)) {
        try {
          const stats = fs.lstatSync(stackDest);
          if (stats.isSymbolicLink()) {
            fs.unlinkSync(stackDest);
          } else {
            fs.rmSync(stackDest, { recursive: true, force: true });
          }
        } catch (e) {
          try { fs.unlinkSync(stackDest); } catch (_) {}
        }
      }
      vscode.window.showInformationMessage(`Unlinked ${item.pluginName} from current project.`);
    } else {
      // 1. Link core
      if (fs.existsSync(coreSource)) {
        createPluginSymlink(coreSource, coreDest);
      }

      // 2. Link stack
      if (fs.existsSync(stackSource)) {
        createPluginSymlink(stackSource, stackDest);
      }

      // 3. Initialize project overrides
      const rulesDir = path.join(workspaceRoot, '.agents', 'rules');
      const overridesFile = path.join(rulesDir, 'project_overrides.md');
      if (!fs.existsSync(overridesFile)) {
        fs.mkdirSync(rulesDir, { recursive: true });
        const templateOverrides = path.join(registryRoot, 'templates', 'project.agents', 'rules', 'project_overrides.md');
        if (fs.existsSync(templateOverrides)) {
          fs.copyFileSync(templateOverrides, overridesFile);
        }
      }

      vscode.window.showInformationMessage(`Linked ${item.pluginName} and core into .agents/plugins/`);
    }

    refreshAll();
  }

  context.subscriptions.push(
    vscode.commands.registerCommand('agentsHub.addStack', (item) => modifyStackInheritance(item, true)),
    vscode.commands.registerCommand('agentsHub.removeStack', (item) => modifyStackInheritance(item, false))
  );

  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(e => {
      if (e.affectsConfiguration('agentsHub.registryPath')) {
        refreshAll();
      }
    })
  );

  // Background update check on startup (if enabled)
  const autoCheck = vscode.workspace.getConfiguration('agentsHub').get('autoCheckUpdates');
  if (autoCheck !== false) {
    setTimeout(() => {
      performUpdateCheck(false);
    }, 3000);
  }
}

function deactivate() {}

module.exports = {
  activate,
  deactivate
};
