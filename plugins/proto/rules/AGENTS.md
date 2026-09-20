# Protobuf & Service Contracts Guidelines

This master document consolidates standards for defining, versioning, evolving, and documenting Protobuf service contracts.

---

## 1. Rule Scoping Protocol (`00_meta_rules.md`)
- When asked to record or update contract guidelines, **always ask the user** whether the change belongs in the **Central Registry** (shared) or **Project-Level Override** (local).
- See detailed protocol: [00_meta_rules.md](./00_meta_rules.md).

---

## 2. Repository Structure & Versioning (`contract_versioning.md`)
- Hierarchy: `proto/<domain>/<version>/*.proto` (e.g., `proto/user/v1/user.proto`).
- Keep versions separated; never mix versions in the same directory.
- For breaking changes, create a new version directory (`v2/`) and preserve previous versions.
- See detailed rules: [contract_versioning.md](./contract_versioning.md).

---

## 3. Field Stability & Deprecation (`field_compatibility_rules.md`)
- **Additive Changes**: Add new fields, RPCs, or messages.
- **Field Stability**: Stable field numbers forever. Never change numbers, reuse numbers, or change data types.
- **Deprecation**: Use `[deprecated = true]` instead of deleting fields.
- See detailed rules: [field_compatibility_rules.md](./field_compatibility_rules.md).

---

## 4. Naming & Documentation Standards (`naming_documentation.md`)
- Services: `<Domain>Service`.
- RPCs: Action-based (`Login`, `CreateUser`).
- Messages: `<Action>Request` and `<Action>Response`.
- Fields: `lower_snake_case`.
- Full Javadoc-style docstrings on all RPCs and fields.
- See detailed rules: [naming_documentation.md](./naming_documentation.md).

---

## 5. Tooling & Workflow (`buf_tooling_workflow.md`)
- Use **Buf** for linting, formatting, and breaking change detection.
- **No Generated Code in Proto Repo**: Consuming clients generate code via `buf.gen.yaml`.
- See detailed rules: [buf_tooling_workflow.md](./buf_tooling_workflow.md).

---

## 🧪 Validation Checklist

Before committing Protobuf changes:
- [ ] No breaking changes introduced in existing versions
- [ ] Field numbers are unique and unchanged
- [ ] New fields use fresh tag numbers
- [ ] Deprecated fields marked with `[deprecated = true]`
- [ ] Naming conventions followed (`<Domain>Service`, `<Action>Request/Response`)
- [ ] Comprehensive documentation comments added
- [ ] `buf lint` passes cleanly
- [ ] `buf breaking` passes against main branch

---

## 🧠 Decision Heuristics

| Situation | Action |
| :--- | :--- |
| Need to modify a field | Add a new field tag instead |
| Need to remove a field | Mark `[deprecated = true]` |
| Need to change response shape | Add new optional fields to response message |
| Incompatible breaking change needed | Create new version folder (`v2/`) |
| Generating code | Generate into consuming repository (`gen/go`, `lib/src/gen`), never proto repo |

---

## 🧭 Golden Rule

> ❗ **If a change can break even ONE existing client $\rightarrow$ DO NOT DO IT in the same version.**

> ❗ **Evolve the contract. Never rewrite it.**
