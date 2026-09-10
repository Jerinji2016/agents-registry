# Agents Hub — Central Agent Customizations & Guidelines Registry

[![Version](https://img.shields.io/github/v/release/Jerinji2016/agents-registry?color=blue&label=version)](https://github.com/Jerinji2016/agents-registry/releases)
[![Tests](https://github.com/Jerinji2016/agents-registry/actions/workflows/ci.yml/badge.svg)](https://github.com/Jerinji2016/agents-registry/actions/workflows/ci.yml)
[![Release](https://github.com/Jerinji2016/agents-registry/actions/workflows/release.yml/badge.svg)](https://github.com/Jerinji2016/agents-registry/actions/workflows/release.yml)

A centralized, version-controlled repository of AI coding standards, architectural rules, progressive skills, and plugin bundles for Google Antigravity and AI pair-programming agents.

> 📖 **Deep Dive**: For comprehensive architectural specifications, progressive disclosure theory, and layer boundary rules, see [docs/architecture.md](./docs/architecture.md).

---

## 📦 Installation Guide

### 1. Antigravity IDE / VS Code Extension

The **Antigravity Agents Hub** extension provides a visual sidebar to inspect active rules and link stack plugins with 1 click.

#### Option A: Download from GitHub Releases (Recommended)
1. Download the latest `antigravity-agents-hub-X.Y.Z.vsix` from [Releases](https://github.com/Jerinji2016/agents-registry/releases).
2. Install via terminal:
   ```bash
   # In Antigravity IDE:
   "/Applications/Antigravity IDE.app/Contents/Resources/app/bin/antigravity-ide" --install-extension antigravity-agents-hub-X.Y.Z.vsix
   
   # Or in standard VS Code:
   code --install-extension antigravity-agents-hub-X.Y.Z.vsix
   ```
   *Or in the IDE UI: Go to **Extensions** → Click **`...`** menu → **Install from VSIX...***

#### Option B: Local Development Link
```bash
# Symlink directly into Antigravity IDE extensions:
ln -s "$(pwd)/tools/ide-extension" ~/.antigravity/extensions/antigravity.antigravity-agents-hub-1.0.0
```

---

### 2. Registry CLI Tool

To use the `agents-hub` command globally from any project terminal:

```bash
# Link globally via npm:
npm link

# Verify installation:
agents-hub --help
```

---

## 🚀 Quick Start

### Connecting a Project to Stacks

#### Via the IDE Extension (Visual)
1. Open your project in Antigravity IDE.
2. Click the **Agents Hub** icon on the left Activity Bar.
3. In the **HUB** panel, click **`+` (Add)** next to your stack (e.g. `flutter` or `react`).
4. The plugin and its rules/skills are immediately active for your project.

#### Via CLI
```bash
# Inside your project directory:
agents-hub link flutter

# Check active guidelines in the project:
agents-hub status
```

#### Via Config File (`.agents/plugins.json`)
Create `.agents/plugins.json` in your project root:

```json
{
  "inherits": [
    {
      "path": "~/path/to/agents-hub/plugins/flutter/plugin.json"
    }
  ]
}
```

---

## 🧪 Testing & Validation

The registry includes a zero-dependency automated test suite verifying CLI operations, path resolvers, link integrity, and manifest schemas:

```bash
# Run full unit and integration test suite:
npm test

# Run registry schema and frontmatter validator:
npm run validate
```

---

## 🤖 Automated Versioning & Releases

This repository uses **fully automated semantic versioning and release publishing**:

- **Pull Request Workflow**: All development happens in feature branches. When opening a Pull Request targeting `main`, the CI workflow automatically runs the test suite and verifies extension packaging.
- **Automated Release on Merge**: Merging a PR into `main` automatically analyzes [Conventional Commits](https://www.conventionalcommits.org/), bumps the semantic version (`patch`, `minor`, or `major`), creates the `v*.*.*` git tag, builds the production `.vsix`, and publishes a [GitHub Release](https://github.com/Jerinji2016/agents-registry/releases) with release notes and the `.vsix` download asset.

---

## 📄 License

[MIT](./LICENSE)
