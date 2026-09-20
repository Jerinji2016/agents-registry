# Meta Rules: Guideline Evolution & Scoping Protocol

## Mandatory Rule for AI Agents

Whenever you are asked to **update, add, refine, or record** an architectural rule, convention, pattern, or coding guideline while working in a Go backend workspace:

> [!IMPORTANT]
> **DO NOT ASSUME THE RULE SCOPE AUTOMATICALLY.**
> You MUST explicitly confirm with the user whether the change belongs in the **Central Registry** or as a **Project-Level Override**.

---

### Decision Matrix & Inquiry Flow

Ask the user:

> *"Should this guideline be updated in the **Central Registry** (shared across all Go projects) or as a **Project-Level Override** (local to this project only)?"*

1. **If the user chooses Central Registry**:
   - Location: `~/Developer/agent-registry/plugins/go/rules/` (or the configured central registry path).
   - Target the appropriate domain file:
     - Domain/Layer boundaries & DI: `clean_architecture.md`
     - Transport layer (REST/gRPC): `transport_standards.md`
     - Data access & SQLC: `data_layer_sqlc.md`
     - Auth & Middleware: `auth_middleware.md`
     - Testing & Config: `testing_standards.md`
   - Update the rule and provide the Git command to commit and push the registry:
     `git -C <registry-path> commit -am "feat(go): update <rule-topic>"`

2. **If the user chooses Project-Level Override**:
   - Location: `<project_root>/.agents/rules/project_overrides.md` (or `.agents/AGENTS.md`).
   - Append or update the rule under a clear heading with the rationale for why this project deviates from the central standard.

---

### Quality Standards for Guidelines
- **Be Prescriptive & Concise**: State the exact requirement and the architectural rationale.
- **Provide Clear Examples**: Always include a "Good Pattern" (✅) and an "Anti-Pattern" (❌) code snippet.
- **Prevent Duplication**: Check if an existing rule already covers the topic before appending a new one.
