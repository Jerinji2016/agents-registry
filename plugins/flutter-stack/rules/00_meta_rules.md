# Meta Rules: Guideline Evolution & Scoping Protocol

## Mandatory Rule for AI Agents

Whenever you are asked to **update, add, refine, or record** an architectural rule, convention, pattern, or coding guideline while working in a workspace:

> [!IMPORTANT]
> **DO NOT ASSUME THE RULE SCOPE AUTOMATICALLY.**
> You MUST explicitly confirm with the user whether the change belongs in the **Central Registry** or as a **Project-Level Override**.

---

### Decision Matrix & Inquiry Flow

Ask the user:

> *"Should this guideline be updated in the **Central Registry** (shared across all Flutter projects) or as a **Project-Level Override** (local to this project only)?"*

1. **If the user chooses Central Registry**:
   - Location: `~/Developer/agent-registry/plugins/flutter-stack/rules/` (or the configured central registry path).
   - Target the appropriate domain file:
     - Domain/Layer boundaries: `clean_architecture.md`
     - State management / Riverpod: `riverpod_standards.md`
     - DTOs / Serialization / Retrofit: `serialization_dto.md`
     - Localization / Assets: `i18n_assets.md`
   - Update the rule and provide the Git command to commit and push the registry:
     `git -C <registry-path> commit -am "feat(flutter-stack): update <rule-topic>"`

2. **If the user chooses Project-Level Override**:
   - Location: `<project_root>/.agents/rules/project_overrides.md` (or `.agents/AGENTS.md`).
   - Append or update the rule under a clear heading with the rationale for why this project deviates from the central standard.

---

### Quality Standards for Guidelines
- **Be Prescriptive & Concise**: State the exact requirement and the rationale.
- **Provide Clear Examples**: Always include a "Good Pattern" (✅) and an "Anti-Pattern" (❌) code snippet.
- **Prevent Duplication**: Check if an existing rule already covers the topic before appending a new one.
