# Universal Error Handling & Structured Logging Standards

Cross-stack invariants for robust failure management, exception handling, and observability.

---

## 1. Error Categorization & Domain Failures

Every system must distinguish between two fundamental categories of errors:

1. **Expected Domain / Business Failures**:
   - Validation errors, invalid credentials, resource not found, insufficient permissions, rate limits.
   - **Handling**: Model these explicitly as Domain Failure Types, Sealed Result Classes, or Either/Result monads. Do NOT use unhandled runtime exceptions for predictable business outcomes.

2. **Unexpected Technical / System Exceptions**:
   - Network dropouts, database connectivity loss, corrupted memory, disk write failures.
   - **Handling**: Catch at boundary layers (Repositories, Controllers, HTTP Interceptors), log with stack trace, and translate to user-friendly error codes or fallback states.

---

## 2. Zero Tolerance for Swallowed Exceptions

> [!CAUTION]
> **NEVER silently swallow exceptions or empty catch blocks.**
> Silently ignoring errors obscures root causes and leads to corrupted application states.

### ❌ Anti-Pattern: Silent Catch
```dart
// FORBIDDEN
try {
  await performCriticalUpdate();
} catch (e) {
  // Silent ignore - causes invisible bugs
}
```

### ✅ Good Pattern: Handled or Logged with Context
```dart
try {
  await performCriticalUpdate();
} catch (e, stackTrace) {
  logger.error('Failed to perform critical update for session $sessionId', error: e, stackTrace: stackTrace);
  throw UpdateOperationFailedException('Operation failed: ${e.toString()}', cause: e);
}
```

---

## 3. Structured Logging Invariants

1. **Use Appropriate Log Levels**:
   - `DEBUG`: Granular diagnostic info for local troubleshooting. Must be disabled in production.
   - `INFO`: Significant lifecycle events (service startup, successful payment confirmation, user sign-in).
   - `WARN`: Recoverable unexpected states (fallback to cache used, transient network retry).
   - `ERROR`: Unrecoverable errors affecting a user request or background task.
   - `FATAL / CRITICAL`: Application-wide crashes or unrecoverable system halts.

2. **Include Contextual Metadata**:
   Always attach correlation identifiers (e.g. `traceId`, `userId`, `sessionId`, `endpoint`) to logs to allow distributed tracing.

3. **Mask Sensitive Data (PII & Secrets)**:
   - ❌ Never log passwords, API tokens, JWTs, credit card numbers, or full national IDs.
   - ✅ Redact or sanitize headers and request payloads before logging.
