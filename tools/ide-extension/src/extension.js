const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

class StacksProvider {
  constructor(workspaceRoot, registryRoot) {
    this.workspaceRoot = workspaceRoot;
    this.registryRoot = registryRoot;
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
    if (!this.registryRoot || !fs.existsSync(this.registryRoot)) {
      return Promise.resolve([
        new vscode.TreeItem('Registry not found', vscode.TreeItemCollapsibleState.None)
      ]);
    }

    if (!element) {
      const pluginsDir = path.join(this.registryRoot, 'plugins');
      if (!fs.existsSync(pluginsDir)) return Promise.resolve([]);

      const activeInheritedPaths = this._getInheritedPaths();
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
      // Show rules and skills under this stack
      const pPath = path.join(this.registryRoot, 'plugins', element.pluginName);
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

  _getInheritedPaths() {
    if (!this.workspaceRoot) return [];
    const pluginsConfig = path.join(this.workspaceRoot, '.agents', 'plugins.json');
    if (!fs.existsSync(pluginsConfig)) return [];
    try {
      const data = JSON.parse(fs.readFileSync(pluginsConfig, 'utf8'));
      if (Array.isArray(data.inherits)) {
        return data.inherits.map(i => i.path);
      }
    } catch (_) {}
    return [];
  }
}

class ActiveRulesProvider {
  constructor(workspaceRoot) {
    this.workspaceRoot = workspaceRoot;
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
    if (!this.workspaceRoot) return Promise.resolve([]);

    const items = [];
    const localRulesDir = path.join(this.workspaceRoot, '.agents', 'rules');

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

function activate(context) {
  const workspaceRoot = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0
    ? vscode.workspace.workspaceFolders[0].uri.fsPath
    : undefined;

  // Default registry root to current workspace or standard path
  const registryRoot = '/Users/manesh/Documents/Projects/agents-hub';

  const stacksProvider = new StacksProvider(workspaceRoot, registryRoot);
  const rulesProvider = new ActiveRulesProvider(workspaceRoot);

  vscode.window.registerTreeDataProvider('agentsHub.stacksView', stacksProvider);
  vscode.window.registerTreeDataProvider('agentsHub.rulesView', rulesProvider);

  context.subscriptions.push(
    vscode.commands.registerCommand('agentsHub.refresh', () => {
      stacksProvider.refresh();
      rulesProvider.refresh();
      vscode.window.showInformationMessage('Agents Hub: Refreshed stacks and rules.');
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

      if (item.isLinked) {
        // Remove
        config.inherits = config.inherits.filter(i => i.path !== item.manifestPath);
        fs.writeFileSync(configFile, JSON.stringify(config, null, 2) + '\n');
        vscode.window.showInformationMessage(`Unlinked ${item.pluginName} from current project.`);
      } else {
        // Add
        config.inherits.push({ path: item.manifestPath });
        fs.writeFileSync(configFile, JSON.stringify(config, null, 2) + '\n');
        vscode.window.showInformationMessage(`Linked ${item.pluginName} into current project.`);
      }

      stacksProvider.refresh();
    })
  );
}

function deactivate() {}

module.exports = {
  activate,
  deactivate
};
