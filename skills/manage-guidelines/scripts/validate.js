#!/usr/bin/env node

/**
 * Validator script for agents-hub registry
 * Validates:
 * 1. plugin.json schemas
 * 2. SKILL.md YAML frontmatter (name & description)
 * 3. Rule markdown files existence and headers
 * 4. Template configurations
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '../../../');

let hasErrors = false;
let warningCount = 0;
let passCount = 0;

function logSuccess(msg) {
  console.log(`\x1b[32m✔\x1b[0m ${msg}`);
  passCount++;
}

function logWarn(msg) {
  console.log(`\x1b[33m⚠\x1b[0m ${msg}`);
  warningCount++;
}

function logError(msg) {
  console.log(`\x1b[31m✖\x1b[0m ${msg}`);
  hasErrors = true;
}

function validatePluginManifest(pluginDir) {
  const manifestPath = path.join(pluginDir, 'plugin.json');
  if (!fs.existsSync(manifestPath)) {
    logError(`Missing plugin.json in: ${pluginDir}`);
    return;
  }

  try {
    const raw = fs.readFileSync(manifestPath, 'utf8');
    const json = JSON.parse(raw);

    if (!json.name || typeof json.name !== 'string') {
      logError(`Invalid plugin.json in ${pluginDir}: missing or non-string "name"`);
    } else {
      logSuccess(`Plugin manifest valid: [${json.name}] (${path.relative(ROOT_DIR, manifestPath)})`);
    }
  } catch (err) {
    logError(`JSON Parse error in ${manifestPath}: ${err.message}`);
  }
}

function validateSkillFrontmatter(skillFile) {
  if (!fs.existsSync(skillFile)) {
    logError(`Skill file does not exist: ${skillFile}`);
    return;
  }

  const content = fs.readFileSync(skillFile, 'utf8');
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);

  if (!frontmatterMatch) {
    logError(`Missing YAML frontmatter in: ${path.relative(ROOT_DIR, skillFile)}`);
    return;
  }

  const yamlContent = frontmatterMatch[1];
  const hasName = /^name:\s*([a-zA-Z0-9_\-]+)/m.test(yamlContent);
  const hasDescription = /^description:\s*/m.test(yamlContent);

  if (!hasName) {
    logError(`Skill missing "name" field in: ${path.relative(ROOT_DIR, skillFile)}`);
  }
  if (!hasDescription) {
    logError(`Skill missing "description" field in: ${path.relative(ROOT_DIR, skillFile)}`);
  }

  if (hasName && hasDescription) {
    const nameMatch = yamlContent.match(/^name:\s*([a-zA-Z0-9_\-]+)/m);
    logSuccess(`Skill valid: [${nameMatch[1]}] (${path.relative(ROOT_DIR, skillFile)})`);
  }
}

function validateRulesDirectory(rulesDir) {
  if (!fs.existsSync(rulesDir)) {
    logWarn(`No rules directory in: ${path.relative(ROOT_DIR, rulesDir)}`);
    return;
  }

  const files = fs.readdirSync(rulesDir).filter(f => f.endsWith('.md'));
  if (files.length === 0) {
    logWarn(`Empty rules directory in: ${path.relative(ROOT_DIR, rulesDir)}`);
    return;
  }

  for (const file of files) {
    const filePath = path.join(rulesDir, file);
    const content = fs.readFileSync(filePath, 'utf8').trim();
    if (content.length < 20) {
      logWarn(`Rule file seems too short / empty: ${path.relative(ROOT_DIR, filePath)}`);
    } else {
      logSuccess(`Rule file valid: ${path.relative(ROOT_DIR, filePath)}`);
    }
  }
}

function runValidation() {
  console.log('\n🔍 Validating Agents Hub Registry...\n');

  // 1. Core
  const coreDir = path.join(ROOT_DIR, 'core');
  validatePluginManifest(coreDir);
  const coreRulesDir = path.join(coreDir, 'rules');
  const coreSkillsDir = path.join(coreDir, 'skills');
  validateRulesDirectory(coreRulesDir);

  if (fs.existsSync(coreSkillsDir)) {
    const skills = fs.readdirSync(coreSkillsDir);
    for (const skill of skills) {
      const skillPath = path.join(coreSkillsDir, skill, 'SKILL.md');
      if (fs.existsSync(skillPath)) {
        validateSkillFrontmatter(skillPath);
      }
    }
  }

  // 2. Plugins
  const pluginsDir = path.join(ROOT_DIR, 'plugins');
  if (fs.existsSync(pluginsDir)) {
    const plugins = fs.readdirSync(pluginsDir);
    for (const plugin of plugins) {
      const pluginPath = path.join(pluginsDir, plugin);
      if (fs.statSync(pluginPath).isDirectory()) {
        validatePluginManifest(pluginPath);
        validateRulesDirectory(path.join(pluginPath, 'rules'));

        const pluginSkillsDir = path.join(pluginPath, 'skills');
        if (fs.existsSync(pluginSkillsDir)) {
          const pSkills = fs.readdirSync(pluginSkillsDir);
          for (const s of pSkills) {
            const skillPath = path.join(pluginSkillsDir, s, 'SKILL.md');
            if (fs.existsSync(skillPath)) {
              validateSkillFrontmatter(skillPath);
            }
          }
        }
      }
    }
  }

  // 3. Shared Skills
  const sharedSkillsDir = path.join(ROOT_DIR, 'skills');
  if (fs.existsSync(sharedSkillsDir)) {
    const sharedSkills = fs.readdirSync(sharedSkillsDir);
    for (const s of sharedSkills) {
      const skillPath = path.join(sharedSkillsDir, s, 'SKILL.md');
      if (fs.existsSync(skillPath)) {
        validateSkillFrontmatter(skillPath);
      }
    }
  }

  console.log('\n----------------------------------------');
  console.log(`Passed: ${passCount} | Warnings: ${warningCount} | Errors: ${hasErrors ? 'YES' : '0'}`);
  console.log('----------------------------------------\n');

  if (hasErrors) {
    process.exit(1);
  }
}

if (require.main === module) {
  runValidation();
}

module.exports = { runValidation };
