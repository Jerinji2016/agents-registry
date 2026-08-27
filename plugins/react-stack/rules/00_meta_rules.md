# Meta Rules: Guideline Evolution & Scoping Protocol (React / Next.js)

## Mandatory Rule for AI Agents

Whenever you are asked to **update, add, refine, or record** an architectural rule, pattern, convention, or styling guideline in a React/Next.js workspace:

> [!IMPORTANT]
> **DO NOT ASSUME THE RULE SCOPE AUTOMATICALLY.**
> You MUST explicitly confirm with the user whether the change belongs in the **Central Registry** or as a **Project-Level Override**.

---

### Inquiry Flow

Ask the user:

> *"Should this guideline be updated in the **Central Registry** (shared across all React/Next.js projects) or as a **Project-Level Override** (local to this project only)?"*

1. **If Central Registry**:
   - Location: `~/Developer/agent-registry/plugins/react-stack/rules/` (or configured central registry).
   - Target files: `nextjs_conventions.md`, `tailwind_conventions.md`.
   - Provide the commit command: `git -C <registry-path> commit -am "feat(react-stack): update <rule-topic>"`

2. **If Project-Level Override**:
   - Location: `<project_root>/.agents/rules/project_overrides.md`.
   - Record the rule with the specific project context.
