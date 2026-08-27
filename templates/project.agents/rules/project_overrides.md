# Project-Specific Architectural Overrides & Exceptions

This file documents rules, conventions, and architectural exceptions that are strictly scoped to this workspace and do not apply to other projects in the central registry.

---

## 1. Project Scoping Notice

The rules in this file override or extend guidelines inherited from the central registry (`agents-hub`).

---

## 2. Active Overrides & Local Exceptions

### Example Override: Local Database Selection
- **Central Standard**: Default repository pattern with remote REST / GraphQL API.
- **Local Project Requirement**: This project uses SQLite via `drift` for full offline-first synchronization.
- **Rule**: All repository implementations in `data/repositories/` must query local Drift tables first before queuing network sync tasks.
