# Testing & Configuration Standards

Standards for unit testing, repository mocking, integration tests, and 12-factor configuration management in Go backend applications.

---

## 1. Unit Testing with Table-Driven Tests

### Service Layer Testing
* Unit test all business logic in `internal/<domain>/service`.
* Use table-driven tests (`tests := []struct{ ... }`) for concise, comprehensive test cases covering positive and negative scenarios.
* Mock repository interfaces using lightweight struct implementations or mock generators (e.g. `mockery` / `gomock`).

```go
package service_test

import (
    "context"
    "testing"
    
    "myproject/internal/user/model"
    "myproject/internal/user/service"
)

type mockUserRepo struct {
    getByEmailFn func(ctx context.Context, email string) (*model.User, error)
    createFn     func(ctx context.Context, user *model.User) error
}

func (m *mockUserRepo) GetByEmail(ctx context.Context, email string) (*model.User, error) {
    return m.getByEmailFn(ctx, email)
}

func (m *mockUserRepo) Create(ctx context.Context, user *model.User) error {
    return m.createFn(ctx, user)
}

func TestUserService_RegisterUser(t *testing.T) {
    tests := []struct {
        name        string
        email       string
        mockRepo    *mockUserRepo
        wantErr     bool
        expectedErr error
    }{
        {
            name:  "successfully registers new user",
            email: "alice@example.com",
            mockRepo: &mockUserRepo{
                getByEmailFn: func(ctx context.Context, email string) (*model.User, error) {
                    return nil, model.ErrUserNotFound
                },
                createFn: func(ctx context.Context, user *model.User) error {
                    return nil
                },
            },
            wantErr: false,
        },
        {
            name:  "fails when email already registered",
            email: "bob@example.com",
            mockRepo: &mockUserRepo{
                getByEmailFn: func(ctx context.Context, email string) (*model.User, error) {
                    return &model.User{ID: "123", Email: email}, nil
                },
            },
            wantErr:     true,
            expectedErr: model.ErrEmailAlreadyExists,
        },
    }
    
    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            svc := service.NewUserService(tt.mockRepo)
            user, err := svc.RegisterUser(context.Background(), tt.email, "secretpassword")
            
            if tt.wantErr && err == nil {
                t.Fatalf("expected error, got nil")
            }
            if !tt.wantErr && err != nil {
                t.Fatalf("unexpected error: %v", err)
            }
            if !tt.wantErr && user == nil {
                t.Fatalf("expected created user, got nil")
            }
        })
    }
}
```

---

## 2. Configuration Rules

1. **12-Factor Standards**: Load configuration from environment variables or dedicated config files (YAML/JSON) during application startup.
2. **Fail Fast**: Validate required config variables (e.g. `DATABASE_URL`, `JWT_SECRET`, `PORT`) during `main()` initialization before starting HTTP/gRPC listeners.
3. **Zero Hardcoded Secrets**: Never commit API keys, database passwords, or JWT secrets in code.
