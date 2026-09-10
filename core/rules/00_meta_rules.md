# Universal Meta Rules: Guideline Evolution & Scoping Protocol

## Mandatory Rule for AI Agents

Whenever an AI coding assistant is asked to **update, add, refine, or record** an architectural rule, convention, pattern, or coding guideline while working in any workspace:

> [!IMPORTANT]
> **DO NOT ASSUME THE RULE SCOPE AUTOMATICALLY.**
> You MUST explicitly confirm with the user whether the change belongs in the **Central Registry** or as a **Project-Level Override**.

---

### Decision Matrix & Inquiry Flow

Ask the user:

> *"Should this guideline be updated in the **Central Registry** (shared across all projects) or as a **Project-Level Override** (local to this project only)?"*

1. **If the user chooses Central Registry**:
   - Location: Central registry directory (`~/.agents-hub` or configured path).
   - Target the appropriate universal or stack-specific file:
     - Universal / Cross-Stack: `core/rules/`
     - Flutter Stack: `plugins/flutter/rules/`
     - React Stack: `plugins/react/rules/`
   - Update the rule and provide the Git command to commit and push the registry:
     `git -C <registry-path> commit -am "feat(<scope>): update <rule-topic>"`

2. **If the user chooses Project-Level Override**:
   - Location: `<project_root>/.agents/rules/project_overrides.md` (or `.agents/AGENTS.md`).
   - Append or update the rule under a clear heading with the rationale for why this project deviates from the central standard.

---

### Quality Standards for Guidelines
- **Be Prescriptive & Concise**: State the exact invariant and rationale clearly.
- **Provide Clear Examples**: Always include a "Good Pattern" (✅) and an "Anti-Pattern" (❌) code snippet.
- **Prevent Duplication**: Check if an existing rule already covers the topic before appending a new one.
