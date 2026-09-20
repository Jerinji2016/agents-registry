---
name: middleware-helper
description: >-
  Provides templates and implementation recipes for Go backend middleware: JWT token authentication, log/slog structured access logging, panic recovery, and multi-tenant context injection.
---

# Go Middleware Helper Skill

Use this skill when implementing, configuring, or debugging HTTP middleware or gRPC interceptors in Go backend applications.

---

## 1. Standard HTTP JWT Authentication Middleware

```go
package middleware

import (
    "context"
    "net/http"
    "strings"
    
    "github.com/golang-jwt/jwt/v5"
)

type contextKey string
const (
    UserContextKey   contextKey = "auth_user"
    TenantContextKey contextKey = "tenant_id"
)

type Claims struct {
    UserID   string `json:"sub"`
    Email    string `json:"email"`
    Role     string `json:"role"`
    TenantID string `json:"tenant_id"`
    jwt.RegisteredClaims
}

func AuthMiddleware(jwtSecret []byte) func(http.Handler) http.Handler {
    return func(next http.Handler) http.Handler {
        return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
            authHeader := r.Header.Get("Authorization")
            if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
                http.Error(w, `{"error":{"code":"UNAUTHORIZED","message":"Missing or invalid authorization header"}}`, http.StatusUnauthorized)
                return
            }

            tokenStr := strings.TrimPrefix(authHeader, "Bearer ")
            claims := &Claims{}
            
            token, err := jwt.ParseWithClaims(tokenStr, claims, func(t *jwt.Token) (interface{}, error) {
                return jwtSecret, nil
            })

            if err != nil || !token.Valid {
                http.Error(w, `{"error":{"code":"UNAUTHORIZED","message":"Invalid token"}}`, http.StatusUnauthorized)
                return
            }

            ctx := context.WithValue(r.Context(), UserContextKey, claims)
            ctx = context.WithValue(ctx, TenantContextKey, claims.TenantID)
            next.ServeHTTP(w, r.WithContext(ctx))
        })
    }
}
```

---

## 2. Structured Access Logger (`log/slog`)

```go
package middleware

import (
    "log/slog"
    "net/http"
    "time"
)

type responseRecorder struct {
    http.ResponseWriter
    statusCode int
}

func (rec *responseRecorder) WriteHeader(code int) {
    rec.statusCode = code
    rec.ResponseWriter.WriteHeader(code)
}

func LoggingMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        start := time.Now()
        rec := &responseRecorder{ResponseWriter: w, statusCode: http.StatusOK}
        
        next.ServeHTTP(rec, r)
        
        slog.InfoContext(r.Context(), "http_request",
            slog.String("method", r.Method),
            slog.String("path", r.URL.Path),
            slog.Int("status", rec.statusCode),
            slog.Duration("duration_ms", time.Since(start)),
        )
    })
}
```
