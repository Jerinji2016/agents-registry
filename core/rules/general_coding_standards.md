# Universal General Coding Standards & Clean Code Principles

Applicable across all languages, frameworks, and tech stacks within the engineering organization.

---

## 1. Clean Code & SOLID Foundations

1. **Single Responsibility Principle (SRP)**:
   - Every class, module, and function must have a single, well-defined reason to change.
   - Break large god-classes or massive multi-thousand-line files into focused, cohesive components.

2. **Open/Closed Principle (OCP)**:
   - Modules should be open for extension, but closed for modification. Prefer polymorphism, strategies, and composition over deep conditional branching (`if/else` ladders or massive `switch` blocks).

3. **Liskov Substitution Principle (LSP)**:
   - Subtypes must be substitutable for their base types without altering program correctness.

4. **Interface Segregation Principle (ISP)**:
   - Clients should not be forced to depend on methods they do not use. Prefer multiple small, client-specific interfaces over one bloated interface.

5. **Dependency Inversion Principle (DIP)**:
   - High-level business logic must never depend on low-level technical details (e.g. database drivers, HTTP clients, UI frameworks). Both must depend on abstractions.

---

## 2. Function & Method Design

- **Small & Focused**: Functions should ideally do one thing well. Aim for function lengths under 30–40 lines.
- **Pure Functions Where Possible**: Prefer stateless, pure functions that compute an output given inputs without hidden side effects.
- **Explicit Function Signatures**: Parameter names, return types, and potential errors must be explicitly typed. Avoid unbounded untyped dictionaries, `any`, or `dynamic` unless interacting with external legacy boundaries.
- **Limit Parameter Count**: Functions requiring more than 3–4 parameters should encapsulate parameters into a typed Configuration Object, Data Class, or Request DTO.

---

## 3. Naming Clarity & Readability

- **Descriptive Over Clever**: Variable, class, and method names must explain *intent* rather than implementation mechanics.
  - ✅ `calculateMonthlyCompoundInterest()`
  - ❌ `calcInt()` or `doProcess()`
- **Boolean Variables**: Prefix with `is`, `has`, `can`, or `should` (e.g., `isLoading`, `hasPermission`, `canSubmit`).
- **No Magic Numbers or Strings**: Extract raw constants into strongly-typed enums, configuration classes, or domain constants.

---

## 4. DRY vs. WET (Avoid Premature Abstraction)

- **DRY (Don't Repeat Yourself)**: Eliminate duplicated business rules and domain logic.
- **AHA (Avoid Hasty Abstractions)**: Duplication is far cheaper than the wrong abstraction. Do not create complex generic abstractions for code that has only two distinct occurrences unless the domain contract is clearly identical.
