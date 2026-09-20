# Go Backend Architectural Guidelines & Conventions

This master document consolidates architectural conventions, 3-tier layering standards, dynamic REST/gRPC transport patterns, SQLC persistence rules, and authentication middleware for Go backend applications.

---

## 1. Rule Scoping Protocol (`00_meta_rules.md`)
- When asked to record or update architectural guidelines, **always ask the user** whether the change belongs in the **Central Registry** (shared) or **Project-Level Override** (local).
- See detailed protocol: [00_meta_rules.md](./00_meta_rules.md).

---

## 2. Directory Structure & 3-Tier Architecture (`clean_architecture.md`)
- **Layer Separation** (`internal/<domain>/`):
  - `handler/`: Transport only (HTTP/REST or gRPC stubs). Zero DB queries or business logic.
  - `service/`: Pure business logic and domain rules. Interacts with repository interfaces.
  - `repository/`: Data persistence and SQLC query execution.
  - `model/`: Pure domain entities and error definitions.
- **Dependency Injection**: Manual constructor-based DI (`New...`). No reflection-based DI frameworks.
- See detailed rules: [clean_architecture.md](./clean_architecture.md).

---

## 3. Transport Standards (REST & gRPC) (`transport_standards.md`)
- **HTTP/REST**: Explicit request/response DTOs, JSON validation, consistent error envelopes (`{ "error": { "code": "...", "message": "..." } }`), canonical HTTP status codes.
- **gRPC**: Generated stubs isolation in handlers, mapping domain errors to canonical `google.golang.org/grpc/codes`.
- See detailed rules: [transport_standards.md](./transport_standards.md).

---

## 4. Data Layer & SQLC Standards (`data_layer_sqlc.md`)
- All database queries must go through the repository layer.
- Use **SQLC** with parameterized queries for compile-time type safety.
- **Database Isolation**: Services own their schemas; never share databases across microservices.
- **Multi-Tenancy**: Mandatory extraction and enforcement of `tenant_id` across all queries.
- See detailed rules: [data_layer_sqlc.md](./data_layer_sqlc.md).

---

## 5. Authentication, Authorization & Middleware (`auth_middleware.md`)
- **Stateless JWT**: Local signature verification in HTTP middleware / gRPC interceptors.
- **Context Injection**: Strongly-typed unexported context keys for `AuthUser` and `TenantID`.
- **Structured Logging**: Standard library `log/slog` baseline + Zap for high-throughput services.
- **Standard Middleware Chain**: Recovery $\rightarrow$ Request ID $\rightarrow$ Access Logger $\rightarrow$ Auth $\rightarrow$ Rate Limiter.
- See detailed rules: [auth_middleware.md](./auth_middleware.md).

---

## 6. Testing & Configuration Standards (`testing_standards.md`)
- **Unit Tests**: Table-driven tests for the service layer with mock repository interfaces.
- **Configuration**: 12-factor configuration via environment variables or YAML configs; zero hardcoded secrets.
- See detailed rules: [testing_standards.md](./testing_standards.md).

---

## 🧪 Validation Checklist

Before committing Go backend code:
- [ ] Handlers contain no SQL queries or business logic
- [ ] Service layer is clean, pure Go, and unit-tested
- [ ] Repositories encapsulate all database queries using SQLC
- [ ] Multi-tenant queries enforce `tenant_id`
- [ ] JWT authentication is verified locally in middleware/interceptors
- [ ] Structured logging (`log/slog` or Zap) is utilized
- [ ] No hardcoded credentials or secrets
- [ ] Constructor-based dependency injection is used

---

## 🧠 Decision Heuristics

| Situation | Action |
| :--- | :--- |
| Need shared utility across domains | Place in `/pkg` (zero business logic) |
| Business rule growing complex | Move to `internal/<domain>/service` |
| Need input validation | Validate in Handler (syntax) and Service (business invariants) |
| Cross-service data dependency | Call service API (gRPC/HTTP), never query external DB |
| Auth required on endpoint | Apply authentication middleware / interceptor |

---

## 🧭 Golden Rules

> ❗ **Handlers transport, services decide, repositories persist.**

> ❗ **Auth provides identity, services enforce authorization.**

> ❗ **If a service directly queries another service's database $\rightarrow$ you broke the boundary.**
