# Agents Hub — Antigravity & VS Code Extension

Visual interface for inspecting, linking, and managing architectural rules and stack plugins.

## Features

1. **Stack Plugins & Inherited Bundles TreeView**:
   - Lists all stacks available in the central registry (`flutter-stack`, `react-stack`, etc.).
   - Indicates whether each stack is active (`● Active`) or inactive (`○ Inactive`) in the open workspace.
   - Click the inline toggle button to instantly link/unlink a stack in `.agents/plugins.json`.
   - Expand any stack to browse its rules and skills.

2. **Active Guidelines & Invariants TreeView**:
   - Displays all local `.agents/rules/*.md` overrides.
   - Click any rule to jump directly to its source file in the editor.

3. **One-Click Commands**:
   - `Refresh Registry & Stacks`: Re-scans the registry and local project configs.
   - `Validate Guidelines Registry`: Checks manifests and frontmatter integrity.
