# Naming Conventions & Documentation Standards

Standardized naming guidelines and comment conventions for Protobuf services, RPCs, messages, and fields.

---

## 1. Naming Conventions

### Services
* Use PascalCase ending with the `Service` suffix.
* Format: `<Domain>Service` (e.g., `AuthService`, `PaymentService`, `UserService`).

### RPC Methods
* Use PascalCase with action-oriented verb prefixes.
* Format: `<Action>` or `<Verb><Noun>` (e.g., `Login`, `CreateUser`, `GetUser`, `CancelOrder`).

### Messages
* Dedicated request and response message types for every RPC method:
  * Request: `<Action>Request` (e.g., `CreateUserRequest`, `LoginRequest`).
  * Response: `<Action>Response` (e.g., `CreateUserResponse`, `LoginResponse`).
* Dedicated domain entities: PascalCase (e.g., `User`, `Account`, `OrderReceipt`).

### Fields
* Use lower_snake_case for all field names:
  * `first_name`, `email_address`, `tenant_id`, `created_at`.

---

## 2. Documentation Standards

All public APIs must include descriptive Javadoc-style docstrings.

### RPC Documentation Example

```protobuf
/**
 * Login authenticates a user with credentials and issues access & refresh tokens.
 * Returns Unauthenticated code if credentials are invalid.
 */
rpc Login(LoginRequest) returns (LoginResponse);
```

### Field Documentation Example

```protobuf
message User {
    // Unique identifier of the user (UUID v4 format).
    string id = 1;

    // Primary email address used for notifications and login.
    string email = 2;

    // ISO 8601 UTC timestamp when the user account was created.
    string created_at = 3;
}
```
