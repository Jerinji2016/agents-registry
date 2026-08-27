# Agents Hub — Central Agent Customizations & Guidelines Registry

A centralized, version-controlled repository of AI coding standards, architectural rules, progressive skills, and plugin bundles for Antigravity and AI pair-programming agents.

---

## 📁 Repository Structure

```text
agents-hub/
├── core/                                # Universal base standards & skills
│   ├── rules/
│   │   └── git_workflow.md             # Conventional commits, PR guidelines, git flow
│   └── skills/
│       └── code-review/
│           └── SKILL.md                # General code review & security sanity checklist
│
├── plugins/                             # Stack-specific Antigravity bundles
│   ├── flutter-stack/                   # Flutter & Dart architectural standards
│   │   ├── plugin.json                  # Manifest
│   │   ├── rules/
│   │   │   ├── 00_meta_rules.md         # Interactive rule scoping instructions
│   │   │   ├── clean_architecture.md    # Domain/Data/Presentation boundaries
│   │   │   ├── riverpod_standards.md    # Riverpod 2.0 generator syntax & immutability
│   │   │   ├── serialization_dto.md     # Freezed DTOs, mappers & Retrofit streaming
│   │   │   ├── i18n_assets.md           # Slang and flutter_gen invariants
│   │   │   └── AGENTS.md                # Consolidated rule aggregator
│   │   └── skills/
│   │       ├── slang-i18n/              # Slang translation & build_runner workflows
│   │       └── flutter-gen/             # flutter_gen asset regeneration
│   │
│   └── react-stack/                     # React & Next.js architectural standards
│       ├── plugin.json                  # Manifest
│       ├── rules/
│       │   ├── 00_meta_rules.md         # Interactive rule scoping instructions
│       │   ├── nextjs_conventions.md    # App Router, Server Components & Server Actions
│       │   ├── tailwind_conventions.md  # Utility-first styling & design tokens
│       │   └── AGENTS.md                # Consolidated rule aggregator
│       └── skills/
│           └── tailwind-helper/         # Tailwind layout & responsive patterns
│
├── skills/                              # Shared universal on-demand skills
│   └── manage-guidelines/               # Interactive guideline evolution skill
│       ├── SKILL.md
│       └── scripts/
│           └── validate.js              # Rule & skill validator script
│
├── templates/                           # Project configuration templates
│   └── project.agents/
│       ├── plugins.json                 # Downstream inheritance config
│       └── rules/
│           └── project_overrides.md     # Project-scoped overrides template
│
└── tools/
    ├── cli/                             # CLI manager for linking and validating registry
    │   ├── bin/agents-hub.js
    │   └── src/
    └── ide-extension/                   # VS Code / Antigravity IDE Sidebar Extension
```

---

## 🚀 Quick Start

### 1. Linking a Project to this Registry

In your target project (e.g. `my-flutter-app`), create `.agents/plugins.json`:

```json
{
  "inherits": [
    {
      "path": "~/path/to/agents-hub/plugins/flutter-stack/plugin.json"
    }
  ]
}
```

> **Note**: Paths starting with `~/` automatically resolve relative to your home directory in Antigravity.

Alternatively, use the included CLI tool:

```bash
# Using global CLI (after npm link):
agents-hub link flutter-stack --target /path/to/my-flutter-app

# Or directly with node:
node <path-to-agents-hub>/tools/cli/bin/agents-hub.js link flutter-stack --target /path/to/my-flutter-app
```

### 2. Validating Registry Rules and Manifests

```bash
# Inside the agents-hub repository:
npm run validate
# or
node tools/cli/bin/agents-hub.js validate

# From anywhere (after npm link):
agents-hub validate
```

### 3. Making CLI Globally Available

Run `npm link` inside the `agents-hub` directory:

```bash
npm link
```

Now you can invoke `agents-hub` directly from any terminal or project workspace:
- `agents-hub list` — View all available stacks, rules, and skills
- `agents-hub validate` — Verify manifests, markdown rules, and YAML frontmatter
- `agents-hub link <stack>` — Link a stack into the current project's `.agents/plugins.json`
- `agents-hub status` — Inspect active plugins and local overrides in the workspace

### 4. Updating Rules (Interactive Scoping Flow)

When an agent is asked to record or update architectural conventions while working inside a downstream project, the agent will prompt:

> *"Should this rule be updated in the Central Registry (shared across all projects) or as a Project-Level override (only for this project)?"*

- **Central Registry**: Updates the rule in `<path-to-agents-hub>/plugins/<stack>/rules/`.
- **Project Level**: Writes the rule in `<project_root>/.agents/rules/project_overrides.md`.
