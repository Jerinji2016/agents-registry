---
name: code-review
description: >-
  Conducts a comprehensive, systematic code review evaluating architecture, security, performance, test coverage, and guideline adherence. Use when reviewing pull requests, refactoring candidates, or pre-commit changes.
---

# Universal Code Review Skill

This skill provides a systematic protocol for reviewing source code across any language or framework.

## 1. Review Checklist & Evaluation Pillars

When requested to review code, systematically evaluate the changes against the following 5 pillars:

### 🛡️ Pillar 1: Security & Defensive Programming
- **No Leaked Secrets**: Verify no hardcoded API keys, JWT secrets, passwords, or personal data.
- **Input Sanitization**: Ensure all user-supplied inputs, URL parameters, and API payloads are validated and sanitized.
- **Safe Resource Management**: Ensure database connections, streams, files, and network sockets are safely closed or disposed.

### 📐 Pillar 2: Architectural Integrity & Separation of Concerns
- **Layer Violations**: Ensure presentation layers do not call external APIs or databases directly (must go through domain/repositories).
- **Single Responsibility**: Ensure classes and functions have a single, well-defined purpose.
- **Dependency Inversion**: High-level modules should depend on abstractions/interfaces, not concrete implementations.

### ⚡ Pillar 3: Performance & Resource Efficiency
- **Unnecessary Computations & Re-renders**: Detect costly computations inside render loops or reactive callbacks.
- **Memory Leaks**: Ensure listeners, subscriptions, controllers, and timers are properly cancelled.
- **Query / API Efficiency**: Check for N+1 query patterns, lack of pagination, or redundant network requests.

### 🧪 Pillar 4: Test Coverage & Edge Cases
- **Happy Path vs Edge Cases**: Are null values, empty collections, network timeouts, and HTTP errors handled?
- **Unit / Widget Testability**: Is the code written in a way that makes it easy to mock dependencies and write unit tests?

### 🎨 Pillar 5: Code Style, Formatting & Invariants
- Adherence to project conventions and stack rules.
- Proper naming conventions (descriptive variable and function names).
- Comments explaining *why* a non-obvious choice was made, rather than restating *what* the code does.

## 2. Review Output Format

Provide feedback categorized clearly into:
1. 🚨 **Blockers (Must Fix)**: Bugs, security vulnerabilities, breaking contract changes, or serious architectural violations.
2. 💡 **Suggestions (Should Fix)**: Performance improvements, readability enhancements, refactoring opportunities.
3. 💬 **Nitpicks (Optional)**: Minor formatting suggestions or alternative idioms.
4. ✅ **Positive Highlights**: Well-structured patterns, clear abstractions, or thorough test coverage.
