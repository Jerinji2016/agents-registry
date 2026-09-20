# Field Compatibility & Deprecation Standards

Rules for field stability, additive modifications, and field deprecation across Protobuf message definitions.

---

## 1. Core Invariants (NON-NEGOTIABLE)

1. **Additive Changes by Default**: Evolve schemas by adding new optional fields or new RPC methods.
2. **Field Numbers are Permanent**: Once assigned, a field number cannot be changed, reused, or reassigned to a different type.
3. **Never Change Types**: Changing a field from `string` to `int32` or from scalar to `repeated` breaks binary deserialization for existing clients.

---

## 2. Allowed vs Forbidden Operations

### ✅ Allowed Schema Evolutions
* Add new fields with brand-new, unique tag numbers.
* Add new RPC methods to an existing service definition.
* Add new message types.
* Mark existing fields as `[deprecated = true]`.

### ❌ Strictly Forbidden Operations
* ❌ Renaming existing field identifiers (breaks JSON/text serialization).
* ❌ Modifying field tag numbers.
* ❌ Changing field types (e.g. `int32` $\rightarrow$ `int64`, `string` $\rightarrow$ `bytes`).
* ❌ Deleting existing fields from an active version.
* ❌ Reusing old field numbers for new fields.

---

## 3. Field Deprecation Pattern

Instead of deleting or modifying an obsolete field:

```protobuf
message UserProfile {
    string id = 1;

    // Deprecated: Use primary_email instead.
    string email = 2 [deprecated = true];

    string username = 3;
    string primary_email = 4;
}
```

### ✅ Requirements When Deprecating
* Add `[deprecated = true]` option tag to the field.
* Add docstring explaining what replaces the deprecated field.
* Keep the deprecated field present in the schema to maintain backward compatibility with older clients.
