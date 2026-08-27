const fs = require('fs');
const path = require('path');
const { runValidation } = require('../../../skills/manage-guidelines/scripts/validate.js');

const REGISTRY_ROOT = path.resolve(__dirname, '../../../');

function listRegistry() {
  console.log('\n📦 Agents Hub Registry Contents:\n');

  // Core
  console.log('\x1b[1m[Core Standards]\x1b[0m');
  const coreRulesDir = path.join(REGISTRY_ROOT, 'core', 'rules');
  if (fs.existsSync(coreRulesDir)) {
    const rules = fs.readdirSync(coreRulesDir).filter(f => f.endsWith('.md'));
    rules.forEach(r => console.log(`  📄 rule: core/rules/${r}`));
  }
  const coreSkillsDir = path.join(REGISTRY_ROOT, 'core', 'skills');
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
  const pluginManifestPath = path.join(REGISTRY_ROOT, 'plugins', pluginName, 'plugin.json');

  if (!fs.existsSync(pluginManifestPath)) {
    console.error(`\x1b[31mError:\x1b[0m Plugin "${pluginName}" does not exist at ${pluginManifestPath}`);
    process.exit(1);
  }

  const agentsDir = path.join(resolvedTarget, '.agents');
  if (!fs.existsSync(agentsDir)) {
    fs.mkdirSync(agentsDir, { recursive: true });
  }

  const pluginsConfigPath = path.join(agentsDir, 'plugins.json');
  let config = { inherits: [] };

  if (fs.existsSync(pluginsConfigPath)) {
    try {
      config = JSON.parse(fs.readFileSync(pluginsConfigPath, 'utf8'));
      if (!Array.isArray(config.inherits)) {
        config.inherits = [];
      }
    } catch (e) {
      console.warn(`Warning: Overwriting corrupted ${pluginsConfigPath}`);
    }
  }

  // Check if already linked
  const alreadyLinked = config.inherits.some(entry => entry.path === pluginManifestPath);
  if (!alreadyLinked) {
    config.inherits.push({ path: pluginManifestPath });
    fs.writeFileSync(pluginsConfigPath, JSON.stringify(config, null, 2) + '\n', 'utf8');
    console.log(`\x1b[32m✔\x1b[0m Successfully linked \x1b[36m${pluginName}\x1b[0m into: ${pluginsConfigPath}`);
  } else {
    console.log(`\x1b[33m⚠\x1b[0m Plugin \x1b[36m${pluginName}\x1b[0m is already inherited in: ${pluginsConfigPath}`);
  }

  // Create rules/project_overrides.md if not present
  const rulesDir = path.join(agentsDir, 'rules');
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

function checkStatus(targetDir) {
  const resolvedTarget = path.resolve(process.cwd(), targetDir || '.');
  const pluginsConfigPath = path.join(resolvedTarget, '.agents', 'plugins.json');

  console.log(`\n🔍 Checking Workspace Status: ${resolvedTarget}\n`);

  if (!fs.existsSync(pluginsConfigPath)) {
    console.log('\x1b[33mNo .agents/plugins.json found in this workspace.\x1b[0m');
    console.log('Run `agents-hub link <plugin-name>` to link a stack.\n');
    return;
  }

  try {
    const config = JSON.parse(fs.readFileSync(pluginsConfigPath, 'utf8'));
    console.log('\x1b[1mInherited Plugins & Stacks:\x1b[0m');
    if (Array.isArray(config.inherits) && config.inherits.length > 0) {
      config.inherits.forEach(entry => {
        const exists = fs.existsSync(entry.path);
        const status = exists ? '\x1b[32m[Valid]\x1b[0m' : '\x1b[31m[Missing Path]\x1b[0m';
        console.log(`  ${status} ${entry.path}`);
      });
    } else {
      console.log('  (No inherited plugins declared)');
    }

    const localRulesDir = path.join(resolvedTarget, '.agents', 'rules');
    if (fs.existsSync(localRulesDir)) {
      console.log('\n\x1b[1mLocal Project Rules & Overrides:\x1b[0m');
      const files = fs.readdirSync(localRulesDir).filter(f => f.endsWith('.md'));
      files.forEach(f => console.log(`  📄 .agents/rules/${f}`));
    }
    console.log('');
  } catch (err) {
    console.error(`\x1b[31mError reading ${pluginsConfigPath}:\x1b[0m ${err.message}`);
  }
}

module.exports = {
  listRegistry,
  linkPlugin,
  checkStatus,
  runValidation
};
