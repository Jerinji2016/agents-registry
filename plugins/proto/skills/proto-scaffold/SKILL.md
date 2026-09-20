---
name: proto-scaffold
description: >-
  Scaffolds a new versioned Protobuf domain package (proto/<domain>/v1/<domain>.proto) with standard syntax, package namespaces, service definition, and CRUD/action message contracts.
---

# Protobuf Service Scaffold Skill

Use this skill when introducing a new domain service or message schema inside a Protobuf contract repository.

---

## 1. Directory Structure

Place new proto definitions under:

```text
proto/<domain>/v1/<domain>.proto
```

---

## 2. Standard Service Template

```protobuf
syntax = "proto3";

package mycompany.<domain>.v1;

option go_package = "github.com/mycompany/proto/gen/go/<domain>/v1;<domain>v1";

/**
 * <Domain>Service provides APIs for managing <domain> entities.
 */
service <Domain>Service {
    /**
     * Get<Domain> retrieves an entity by its unique identifier.
     */
    rpc Get<Domain>(Get<Domain>Request) returns (Get<Domain>Response);

    /**
     * Create<Domain> registers a new entity.
     */
    rpc Create<Domain>(Create<Domain>Request) returns (Create<Domain>Response);
}

message <Domain>Entity {
    // Unique identifier.
    string id = 1;

    // Tenant isolation identifier.
    string tenant_id = 2;

    // Display name of the entity.
    string name = 3;

    // Creation timestamp (RFC 3339 format).
    string created_at = 4;
}

message Get<Domain>Request {
    // Target entity identifier.
    string id = 1;
}

message Get<Domain>Response {
    <Domain>Entity <domain> = 1;
}

message Create<Domain>Request {
    string name = 1;
}

message Create<Domain>Response {
    <Domain>Entity <domain> = 1;
}
```
