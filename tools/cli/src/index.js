const fs = require('fs');
const path = require('path');
const { runValidation } = require('../../../skills/manage-guidelines/scripts/validate.js');

const REGISTRY_ROOT = path.resolve(__dirname, '../../../');

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

function listRegistry() {
  console.log('\n📦 Agents Hub Registry Contents:\n');

  // Core Plugin
  console.log('\x1b[1m[Core Standards Plugin]\x1b[0m');
  const coreDir = path.join(REGISTRY_ROOT, 'core');
  const coreRulesDir = path.join(coreDir, 'rules');
  if (fs.existsSync(coreRulesDir)) {
    const rules = fs.readdirSync(coreRulesDir).filter(f => f.endsWith('.md'));
    rules.forEach(r => console.log(`  📄 rule: core/rules/${r}`));
  }
  const coreSkillsDir = path.join(coreDir, 'skills');
  if (fs.existsSync(coreSkillsDir)) {
    const skills = fs.readdirSync(coreSkillsDir);
    skills.forEach(s => console.log(`  ⚡ skill: core/skills/${s}`));
  }

  // Plugins
  console.log('\n\x1b[1m[Plugins / Stack Bundles]\x1b[0m');
  const pluginsDir = path.join(REGISTRY_ROOT, 'plugins');
  if (fs.existsSync(pluginsDir)) {
    const plugins = fs.readdirSync(pluginsDir);
    for (const p of plugins) {
      const pPath = path.join(pluginsDir, p);
      if (fs.statSync(pPath).isDirectory()) {
        const manifestPath = path.join(pPath, 'plugin.json');
        let desc = '';
        if (fs.existsSync(manifestPath)) {
          try {
            const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
            desc = manifest.description ? ` - ${manifest.description}` : '';
          } catch (_) {}
        }
        console.log(`  🔌 \x1b[36m${p}\x1b[0m${desc}`);

        // Rules
        const pRulesDir = path.join(pPath, 'rules');
        if (fs.existsSync(pRulesDir)) {
          const rules = fs.readdirSync(pRulesDir).filter(f => f.endsWith('.md'));
          rules.forEach(r => console.log(`     📄 ${r}`));
        }

        // Skills
        const pSkillsDir = path.join(pPath, 'skills');
        if (fs.existsSync(pSkillsDir)) {
          const skills = fs.readdirSync(pSkillsDir);
          skills.forEach(s => console.log(`     ⚡ skill: ${s}`));
        }
      }
    }
  }

  // Shared Skills
  console.log('\n\x1b[1m[Shared Universal Skills]\x1b[0m');
  const sharedSkillsDir = path.join(REGISTRY_ROOT, 'skills');
  if (fs.existsSync(sharedSkillsDir)) {
    const skills = fs.readdirSync(sharedSkillsDir);
    skills.forEach(s => console.log(`  ⚡ skill: ${s}`));
  }
  console.log('');
}

function linkPlugin(pluginName, targetDir) {
  const resolvedTarget = path.resolve(process.cwd(), targetDir || '.');

  let sourcePluginDir;
  if (pluginName === 'core') {
    sourcePluginDir = path.join(REGISTRY_ROOT, 'core');
  } else {
    sourcePluginDir = path.join(REGISTRY_ROOT, 'plugins', pluginName);
  }

  const manifestPath = path.join(sourcePluginDir, 'plugin.json');
  if (!fs.existsSync(manifestPath)) {
    console.error(`\x1b[31mError:\x1b[0m Plugin "${pluginName}" does not exist at ${sourcePluginDir}`);
    process.exit(1);
  }

  const agentsPluginsDir = path.join(resolvedTarget, '.agents', 'plugins');
  if (!fs.existsSync(agentsPluginsDir)) {
    fs.mkdirSync(agentsPluginsDir, { recursive: true });
  }

  // 1. Always ensure 'core' plugin is linked into .agents/plugins/core
  const coreSource = path.join(REGISTRY_ROOT, 'core');
  const coreDest = path.join(agentsPluginsDir, 'core');
  const coreStatus = createPluginSymlink(coreSource, coreDest);
  if (coreStatus === 'linked') {
    console.log(`\x1b[32m✔\x1b[0m Linked universal \x1b[36mcore\x1b[0m plugin -> ${coreDest}`);
  }

  // 2. Link requested stack plugin if not 'core'
  if (pluginName !== 'core') {
    const pluginDest = path.join(agentsPluginsDir, pluginName);
    const status = createPluginSymlink(sourcePluginDir, pluginDest);
    if (status === 'linked') {
      console.log(`\x1b[32m✔\x1b[0m Successfully linked \x1b[36m${pluginName}\x1b[0m plugin -> ${pluginDest}`);
    } else if (status === 'already_linked') {
      console.log(`\x1b[33m⚠\x1b[0m Plugin \x1b[36m${pluginName}\x1b[0m is already linked at: ${pluginDest}`);
    }
  }

  // 3. Create .agents/rules/project_overrides.md if not present
  const rulesDir = path.join(resolvedTarget, '.agents', 'rules');
  const overridesFile = path.join(rulesDir, 'project_overrides.md');
  if (!fs.existsSync(overridesFile)) {
    fs.mkdirSync(rulesDir, { recursive: true });
    const templateOverrides = path.join(REGISTRY_ROOT, 'templates', 'project.agents', 'rules', 'project_overrides.md');
    if (fs.existsSync(templateOverrides)) {
      fs.copyFileSync(templateOverrides, overridesFile);
      console.log(`\x1b[32m✔\x1b[0m Initialized project overrides template: ${overridesFile}`);
    }
  }
}

function unlinkPlugin(pluginName, targetDir) {
  const resolvedTarget = path.resolve(process.cwd(), targetDir || '.');
  const pluginDest = path.join(resolvedTarget, '.agents', 'plugins', pluginName);

  if (!isSymlink(pluginDest) && !fs.existsSync(pluginDest)) {
    console.log(`\x1b[33m⚠\x1b[0m Plugin "${pluginName}" is not linked in ${resolvedTarget}`);
    return;
  }

  try {
    const stats = fs.lstatSync(pluginDest);
    if (stats.isSymbolicLink()) {
      fs.unlinkSync(pluginDest);
    } else {
      fs.rmSync(pluginDest, { recursive: true, force: true });
    }
    console.log(`\x1b[32m✔\x1b[0m Unlinked plugin \x1b[36m${pluginName}\x1b[0m from: ${pluginDest}`);
  } catch (err) {
    console.error(`\x1b[31mError unlinking ${pluginName}:\x1b[0m ${err.message}`);
  }
}

function checkStatus(targetDir) {
  const resolvedTarget = path.resolve(process.cwd(), targetDir || '.');
  const agentsPluginsDir = path.join(resolvedTarget, '.agents', 'plugins');

  console.log(`\n🔍 Checking Workspace Status: ${resolvedTarget}\n`);

  if (!fs.existsSync(agentsPluginsDir)) {
    console.log('\x1b[33mNo .agents/plugins/ directory found in this workspace.\x1b[0m');
    console.log('Run `agents-hub link <plugin-name>` to link a stack.\n');
    return;
  }

  try {
    const entries = fs.readdirSync(agentsPluginsDir);
    console.log('\x1b[1mActive Linked Plugins (.agents/plugins/):\x1b[0m');
    if (entries.length === 0) {
      console.log('  (No plugins currently linked)');
    } else {
      for (const entry of entries) {
        const fullPath = path.join(agentsPluginsDir, entry);
        const isLink = isSymlink(fullPath);
        let target = '';
        let valid = false;

        if (isLink) {
          target = fs.readlinkSync(fullPath);
          const resolvedTarget = path.isAbsolute(target)
            ? target
            : path.resolve(agentsPluginsDir, target);
          valid = fs.existsSync(resolvedTarget);
        } else {
          valid = fs.existsSync(path.join(fullPath, 'plugin.json'));
        }

        const statusTag = valid ? '\x1b[32m[Active]\x1b[0m' : '\x1b[31m[Broken Link]\x1b[0m';
        const linkInfo = isLink ? ` -> ${target}` : ' (physical directory)';
        console.log(`  ${statusTag} \x1b[36m${entry}\x1b[0m${linkInfo}`);
      }
    }

    const localRulesDir = path.join(resolvedTarget, '.agents', 'rules');
    if (fs.existsSync(localRulesDir)) {
      console.log('\n\x1b[1mLocal Project Rules & Overrides:\x1b[0m');
      const files = fs.readdirSync(localRulesDir).filter(f => f.endsWith('.md'));
      files.forEach(f => console.log(`  📄 .agents/rules/${f}`));
    }
    console.log('');
  } catch (err) {
    console.error(`\x1b[31mError checking status in ${agentsPluginsDir}:\x1b[0m ${err.message}`);
  }
}

module.exports = {
  listRegistry,
  linkPlugin,
  unlinkPlugin,
  checkStatus,
  runValidation
};
