---
name: buf-workflow
description: >-
  Provides runbooks and validation commands for Buf CLI: formatting, linting, and breaking change detection against git branches.
---

# Buf Workflow Skill

Use this skill when formatting, linting, or checking for breaking changes across Protobuf service contracts.

---

## 1. Quality & Validation Commands

### Format Files
Format all proto files in place:
```bash
buf format -w
```

### Lint Schema
Run standard style and structure linters:
```bash
buf lint
```

### Breaking Change Detection
Verify that local changes do not introduce breaking changes against the `main` git branch:
```bash
buf breaking --against '.git#branch=main'
```

---

## 2. Consuming Repositories: Code Generation (`buf.gen.yaml`)

When generating code in a consuming service repository (such as a Go backend or Dart/Flutter app), place `buf.gen.yaml` in the consuming project root:

### Example Go Code Generation (`buf.gen.yaml`)
```yaml
version: v1
plugins:
  - plugin: go
    out: gen/go
    opt:
      - paths=source_relative
  - plugin: go-grpc
    out: gen/go
    opt:
      - paths=source_relative
```

Run generation inside the consuming project:
```bash
buf generate <proto-repo-path>
```
