# Contract Versioning & Directory Layout

Rules governing repository layout, semantic versioning, and breaking change handling for Protobuf service contracts.

---

## 1. Directory Structure

Every proto contract must live under a domain and version-specific directory:

```text
proto/
  <domain>/
    v1/
      <domain>.proto
    v2/
      <domain>.proto
```

### ✅ Invariants
* **Domain Scoping**: Group related RPCs and messages by functional domain (e.g. `auth`, `user`, `billing`, `order`).
* **Version Folders**: Always isolate definitions inside version directories (`v1`, `v2`, `v3`).
* **Never Mix Versions**: Never place `v1` and `v2` definitions in the same folder or package namespace.

---

## 2. Package Naming Invariants

Package declarations inside proto files must mirror the directory hierarchy:

```protobuf
syntax = "proto3";

package mycompany.auth.v1;

option go_package = "github.com/mycompany/proto/gen/go/auth/v1;authv1";
```

---

## 3. Breaking Changes & Migration Policy

If a breaking change is strictly unavoidable (e.g., radical API redesign, fundamental data structure shift):

1. **Create Next Version Directory**:
   ```text
   proto/<domain>/v2/
   ```
2. **Copy Existing Definitions**: Copy existing proto files into `v2/`.
3. **Apply Breaking Changes Only in `v2/`**: Update package namespaces to `v2` and make the required structural changes.
4. **Preserve Previous Versions**: **DO NOT MODIFY OR DELETE `v1/`**. Existing clients in production will continue consuming `v1` until fully migrated.

---

## 4. Consumer Awareness

Always assume:
* Multiple heterogeneous clients (Go services, Flutter apps, Web frontends) consume these contracts.
* Clients deploy and upgrade at different release cadences.
* **Never force breaking migrations on existing version streams.**
