# Universal Security Practices & Defensive Engineering

Security invariants and hygiene rules enforced across all applications and infrastructure.

---

## 1. Zero Secrets in Version Control

> [!CAUTION]
> **Zero tolerance for hardcoded secrets in source code or Git history.**

- **Forbidden Files**: Never commit `.env`, `*.pem`, `*.key`, `google-services.json`, `id_rsa`, or production configuration secrets into repositories.
- **Environment Variables**: Inject configuration and credentials via runtime environment variables, secret managers (e.g. AWS Secrets Manager, GCP Secret Manager, Vault), or secure CI/CD secrets.
- **Immediate Action on Leak**: If a secret or API token is accidentally committed, it must be considered **compromised immediately** and revoked/rotated without delay.

---

## 2. Input Validation & Boundary Defense

1. **Never Trust External Input**:
   - Validate all user-supplied parameters, query strings, headers, and external webhook payloads at the entry boundary.
   - Use strict schema validation (e.g., Freezed/json_serializable in Flutter, Zod/Joi in React/Node) before processing data.

2. **Prevent Injection Attacks**:
   - Use parameterized queries or ORMs for database operations (never concatenate raw strings into SQL/NoSQL queries).
   - Sanitize and escape any dynamically rendered HTML/Markdown in web and mobile views to prevent Cross-Site Scripting (XSS).

3. **Safe Deserialization**:
   - Reject unexpected fields or oversized payloads. Enforce maximum payload size limits on all endpoints.

---

## 3. Authentication, Authorization & Communication

- **HTTPS Everywhere**: All network communication must strictly use TLS 1.3 / HTTPS. Disallow cleartext HTTP traffic.
- **Principle of Least Privilege**: Services, tokens, and database users should only possess the minimum permissions necessary to execute their function.
- **Secure Token Storage**:
  - Mobile: Store tokens in `flutter_secure_storage`, iOS Keychain, or Android Keystore. Never in plain SharedPreferences.
  - Web: Store session tokens in `HttpOnly`, `Secure`, `SameSite=Strict` cookies rather than `localStorage`.
