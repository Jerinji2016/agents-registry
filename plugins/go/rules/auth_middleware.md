# Authentication, Authorization & Middleware

Standards for authentication, authorization, context propagation, structured logging (`log/slog`, Zap), and request middleware in Go backend services.

---

## 1. Authentication & Token Validation

### ✅ Required Architecture

* **Stateless JWT Validation**: Validate JWT signatures locally inside middleware (HTTP) or interceptors (gRPC) using public keys (RS256/ES256) or shared secrets (HS256).
* **Context Injection**: Extract claims (`user_id`, `email`, `role`, `tenant_id`) and inject them into `context.Context` using unexported typed keys.

```go
type contextKey string

const (
    UserContextKey   contextKey = "auth_user"
    TenantContextKey contextKey = "tenant_id"
)

type AuthUser struct {
    ID       string
    Email    string
    Role     string
    TenantID string
}

func UserFromContext(ctx context.Context) (*AuthUser, bool) {
    u, ok := ctx.Value(UserContextKey).(*AuthUser)
    return u, ok
}
```

### ❌ Forbidden
* ❌ Making remote network calls to an Auth Service on every inbound request (use local JWT validation + caching if revocation check is needed).
* ❌ Embedding token parsing or cryptographic verification inside domain handlers or services.
* ❌ Skipping authentication or leaving endpoints unprotected without explicit public route declarations.

---

## 2. Structured Logging (`log/slog` & Zap)

### Default: Standard Library `log/slog`

Use Go 1.21+ `log/slog` for structured, leveled, and contextual logging:

```go
import "log/slog"

func (s *UserService) CreateUser(ctx context.Context, email string) (*model.User, error) {
    slog.InfoContext(ctx, "creating new user",
        slog.String("email", email),
        slog.String("component", "user_service"),
    )
    // ...
}
```

### High-Throughput: Uber Zap

For extreme performance or specialized encoders, use structured `zap.Logger` configured via constructor injection.

---

## 3. Middleware Pipeline Invariants

Every production service entrypoint must configure the following standard middleware chain:

1. **Panic Recovery**: Catch panics, log stack traces, and return HTTP 500 / `codes.Internal` safely.
2. **Correlation / Request ID**: Generate or propagate `X-Request-ID` and attach to logging context.
3. **Structured Access Logger**: Log incoming method, path/RPC, status code, and latency.
4. **Authentication & Multi-Tenancy**: Parse token, verify cryptographic signature, inject `AuthUser` and `TenantID` into context.
5. **Rate Limiting & Timeout**: Apply context cancellation and rate limit thresholds.
