---
name: go-service-scaffold
description: >-
  Scaffolds a new domain module in Go adhering to 3-tier clean architecture: handler, service interface and implementation, SQLC repository adapter, domain model, and constructor dependency injection.
---

# Go Domain Service Scaffold Skill

Use this skill when creating or refactoring a domain module under `internal/<domain>/` in a Go backend project.

---

## 1. Directory Blueprint

For a domain named `<domain>` (e.g., `user`, `order`, `billing`), generate the following structure:

```text
internal/<domain>/
├── handler/
│   └── handler.go        # HTTP/gRPC transport adapter & request/response DTOs
├── service/
│   └── service.go        # Domain business logic & repository interface
├── repository/
│   └── repository.go     # SQLC wrapper and DB persistence adapter
└── model/
    └── model.go          # Domain entities and custom domain errors
```

---

## 2. Step-by-Step Generation Checklist

### Step 1: Define Domain Model (`model/model.go`)
```go
package model

import "errors"

var (
    ErrNotFound      = errors.New("entity not found")
    ErrAlreadyExists = errors.New("entity already exists")
)

type Entity struct {
    ID        string
    TenantID  string
    Name      string
}
```

### Step 2: Define Service Interface & Struct (`service/service.go`)
```go
package service

import (
    "context"
    "myproject/internal/<domain>/model"
)

type Repository interface {
    GetByID(ctx context.Context, id string, tenantID string) (*model.Entity, error)
    Create(ctx context.Context, entity *model.Entity) error
}

type Service struct {
    repo Repository
}

func NewService(repo Repository) *Service {
    return &Service{repo: repo}
}
```

### Step 3: Implement Repository Adapter (`repository/repository.go`)
```go
package repository

import (
    "context"
    "myproject/internal/<domain>/model"
    "myproject/internal/<domain>/repository/db" // sqlc generated package
)

type Repository struct {
    queries *db.Queries
}

func NewRepository(q *db.Queries) *Repository {
    return &Repository{queries: q}
}
```

### Step 4: Implement Transport Handler (`handler/handler.go`)
```go
package handler

import (
    "net/http"
    "myproject/internal/<domain>/service"
)

type Handler struct {
    service *service.Service
}

func NewHandler(svc *service.Service) *Handler {
    return &Handler{service: svc}
}
```
