# Meta Rules: Guideline Evolution & Scoping Protocol (React Web)

## Mandatory Rule for AI Agents

Whenever you are asked to **update, add, refine, or record** an architectural rule, pattern, convention, or styling guideline in a React web workspace:

> [!IMPORTANT]
> **DO NOT ASSUME THE RULE SCOPE AUTOMATICALLY.**
> You MUST explicitly confirm with the user whether the change belongs in the **Central Registry** or as a **Project-Level Override**.

---

### Inquiry Flow

Ask the user:

> *"Should this guideline be updated in the **Central Registry** (shared across all React projects) or as a **Project-Level Override** (local to this project only)?"*

1. **If Central Registry**:
   - Location: `~/Developer/agent-registry/plugins/react/rules/` (or configured central registry path).
   - Target files:
     - Directory structure & layer flow: `clean_architecture.md`
     - Component purity & lifecycle: `component_standards.md`
     - TanStack Query / Zustand / API: `state_api_management.md`
     - Styling & design tokens: `styling_tailwind.md`
     - Testing & configuration: `testing_configuration.md`
   - Provide the commit command: `git -C <registry-path> commit -am "feat(react): update <rule-topic>"`

2. **If Project-Level Override**:
   - Location: `<project_root>/.agents/rules/project_overrides.md` (or `.agents/AGENTS.md`).
   - Record the rule with the specific project context.

---

### Quality Standards for Guidelines
- **Be Prescriptive & Concise**: State the exact frontend requirement and rationale.
- **Provide Clear Examples**: Always include a "Good Pattern" (✅) and an "Anti-Pattern" (❌) snippet.
- **Prevent Duplication**: Check if an existing rule already covers the topic before appending a new one.
