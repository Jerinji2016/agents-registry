const { describe, it } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { runValidation } = require('../skills/manage-guidelines/scripts/validate.js');

const ROOT_DIR = path.resolve(__dirname, '../');

describe('Registry Structural Validation Tests', () => {
  it('should pass full registry validation without errors', () => {
    // Should run and not throw
    assert.doesNotThrow(() => {
      runValidation();
    });
  });

  it('should have valid plugin.json for core and each plugin', () => {
    // Core manifest
    const coreManifestPath = path.join(ROOT_DIR, 'core', 'plugin.json');
    assert.ok(fs.existsSync(coreManifestPath), 'core/plugin.json must exist');
    const coreManifest = JSON.parse(fs.readFileSync(coreManifestPath, 'utf8'));
    assert.strictEqual(coreManifest.name, 'core');
    assert.ok(coreManifest.description && coreManifest.description.length > 0);

    const pluginsDir = path.join(ROOT_DIR, 'plugins');
    assert.ok(fs.existsSync(pluginsDir), 'plugins/ directory must exist');

    const plugins = fs.readdirSync(pluginsDir).filter(p => fs.statSync(path.join(pluginsDir, p)).isDirectory());
    assert.ok(plugins.length > 0, 'Must have at least one plugin');

    for (const plugin of plugins) {
      const manifestPath = path.join(pluginsDir, plugin, 'plugin.json');
      assert.ok(fs.existsSync(manifestPath), `Manifest missing for plugin: ${plugin}`);

      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      assert.strictEqual(manifest.name, plugin, `Plugin name in manifest must match directory name "${plugin}"`);
      assert.ok(typeof manifest.description === 'string' && manifest.description.length > 0, 'Description must be non-empty');
    }
  });

  it('should have valid YAML frontmatter in all SKILL.md files', () => {
    function checkSkills(skillsDir) {
      if (!fs.existsSync(skillsDir)) return;
      const skills = fs.readdirSync(skillsDir).filter(s => fs.statSync(path.join(skillsDir, s)).isDirectory());

      for (const skill of skills) {
        const skillPath = path.join(skillsDir, skill, 'SKILL.md');
        assert.ok(fs.existsSync(skillPath), `SKILL.md missing in ${skillsDir}/${skill}`);

        const content = fs.readFileSync(skillPath, 'utf8');
        const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
        assert.ok(frontmatterMatch, `YAML frontmatter missing in ${skillPath}`);

        const yaml = frontmatterMatch[1];
        const nameMatch = yaml.match(/^name:\s*([a-zA-Z0-9_\-]+)/m);
        assert.ok(nameMatch, `Skill name missing in frontmatter: ${skillPath}`);
        assert.strictEqual(nameMatch[1], skill, `Skill name "${nameMatch[1]}" must match folder name "${skill}"`);

        const descMatch = yaml.match(/^description:\s*/m);
        assert.ok(descMatch, `Skill description missing in frontmatter: ${skillPath}`);
      }
    }

    checkSkills(path.join(ROOT_DIR, 'core', 'skills'));
    checkSkills(path.join(ROOT_DIR, 'skills'));

    const pluginsDir = path.join(ROOT_DIR, 'plugins');
    if (fs.existsSync(pluginsDir)) {
      const plugins = fs.readdirSync(pluginsDir).filter(p => fs.statSync(path.join(pluginsDir, p)).isDirectory());
      for (const p of plugins) {
        checkSkills(path.join(pluginsDir, p, 'skills'));
      }
    }
  });

  it('should have non-empty markdown rules in all plugins', () => {
    const pluginsDir = path.join(ROOT_DIR, 'plugins');
    const plugins = fs.readdirSync(pluginsDir).filter(p => fs.statSync(path.join(pluginsDir, p)).isDirectory());

    for (const plugin of plugins) {
      const rulesDir = path.join(pluginsDir, plugin, 'rules');
      assert.ok(fs.existsSync(rulesDir), `rules/ directory missing in plugins/${plugin}`);

      const ruleFiles = fs.readdirSync(rulesDir).filter(f => f.endsWith('.md'));
      assert.ok(ruleFiles.length > 0, `No markdown rule files in plugins/${plugin}/rules`);

      for (const rule of ruleFiles) {
        const content = fs.readFileSync(path.join(rulesDir, rule), 'utf8').trim();
        assert.ok(content.length >= 20, `Rule file ${rule} in ${plugin} is too short or empty`);
      }
    }
  });
});
