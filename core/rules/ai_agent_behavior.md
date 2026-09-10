# Universal AI Agent Pair-Programming & Behavior Guidelines

Operating principles and quality gates enforced for AI coding agents across all workspaces.

---

## 1. Implementation Plan Invariants

Whenever a task requires an **Implementation Plan**:

1. **Visual Directory Tree Outline**:
   - The implementation plan **MUST** include a visual project directory tree outline showing exactly which files will be created (`[NEW]`), modified (`[MODIFY]`), or deleted (`[DELETE]`).
   - Group files logically by layer or feature location.

2. **Explicit Verification Plan**:
   - Every plan must specify exact automated test commands (`npm test`, `flutter test`, `pytest`, etc.) and manual verification steps.

---

## 2. Code Modification Hygiene

1. **Preserve Documentation & Comments**:
   - Maintain existing comments, docstrings, licenses, and documentation unrelated to your changes unless explicitly instructed otherwise.

2. **Targeted, Non-Destructive Edits**:
   - Make single contiguous edits where possible. Avoid massive wholesale file rewrites when only a few lines need alteration.

3. **No Unrequested Out-of-Scope Refactoring**:
   - Focus strictly on the user's explicit objective. Do not arbitrarily reformat or rename unrelated files or styles.

---

## 3. Mandatory Automated Verification

> [!IMPORTANT]
> **Never report a task as complete without running automated tests.**
> Before delivering a final response:
> 1. Run all relevant test suites and linters.
> 2. Ensure zero failing tests and zero unhandled regressions.
