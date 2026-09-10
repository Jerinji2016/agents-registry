# Core Guidelines — Universal Engineering Standards

This master document consolidates all universal, cross-stack engineering guidelines, quality standards, security invariants, and AI agent behaviors enforced across all projects.

---

## 1. Rule Scoping Protocol (`00_meta_rules.md`)
- Always confirm with the developer whether an architectural rule update belongs to the **Central Registry** or as a **Project-Level Override**.
- See detailed protocol: [00_meta_rules.md](./00_meta_rules.md).

---

## 2. General Coding Standards & Clean Code (`general_coding_standards.md`)
- Adhere to SOLID principles (Single Responsibility, Open/Closed, Liskov, Interface Segregation, Dependency Inversion).
- Design small, focused, pure functions with explicit parameter and return types.
- Avoid hasty abstractions (AHA) while eliminating duplicated business rules (DRY).
- See detailed standards: [general_coding_standards.md](./general_coding_standards.md).

---

## 3. Error Handling & Structured Logging (`error_handling_logging.md`)
- Distinguish between expected Domain Failures (modeled explicitly as Result types) and technical System Exceptions.
- **Zero tolerance for swallowed exceptions** (`catch (e) {}` is forbidden).
- Enforce structured logging with correlation IDs (`traceId`, `userId`) and mandatory PII/secret masking.
- See detailed standards: [error_handling_logging.md](./error_handling_logging.md).

---

## 4. Security & Defensive Engineering (`security_practices.md`)
- **Zero secrets in Git**: Zero tolerance for hardcoded tokens, passwords, private keys, or `.env` files.
- Validate and sanitize all external inputs at system boundaries to prevent injection and XSS.
- Enforce HTTPS/TLS 1.3 everywhere and adhere to the principle of least privilege.
- See detailed practices: [security_practices.md](./security_practices.md).

---

## 5. Git Workflow & Conventional Commits (`git_workflow.md`)
- Strictly follow [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `refactor:`, `chore:`, etc.).
- Maintain atomic, focused commits and clean branch histories.
- See detailed workflow: [git_workflow.md](./git_workflow.md).

---

## 6. AI Agent Pair-Programming & Behavior (`ai_agent_behavior.md`)
- Implementation plans **must include a visual directory tree outline** of created, modified, and deleted files.
- Mandatory automated test verification before completing tasks.
- Maintain documentation integrity and avoid unrequested out-of-scope edits.
- See detailed guidelines: [ai_agent_behavior.md](./ai_agent_behavior.md).

---

## 7. Universal Skills (`core/skills/`)
- **[`code-review`](../skills/code-review/SKILL.md)**: 5-pillar systematic code review checklist (Security, Architecture, Performance, Testing, Style).
