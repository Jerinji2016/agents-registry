# Clean Architecture Guidelines (Flutter / Dart)

This document establishes the layer boundaries, dependency rules, and architectural invariants for Flutter applications.

---

## 1. Architectural Layers & Boundaries

Projects follow a 3-tier Clean Architecture model organized strictly by feature folders:

```text
lib/src/features/<feature_name>/
├── domain/                      # Pure Dart enterprise business rules
│   ├── models/                  # Immutable domain entities
│   ├── repositories/            # Abstract repository interfaces
│   └── usecases/                # Pure business logic coordinators
│
├── data/                        # Data retrieval, persistence & external APIs
│   ├── datasources/             # Remote API clients, local DBs, Key-Value stores
│   ├── dtos/                    # Freezed DTOs with json_serializable
│   ├── mappers/                 # Extension mappers (toDomain / fromDto)
│   └── repositories/            # Concrete repository implementations
│
└── presentation/                # UI widgets & state controllers
    ├── controllers/             # Riverpod AsyncNotifiers / Notifiers
    ├── views/                   # Screen widgets & page views
    └── widgets/                 # Reusable sub-widgets private to this feature
```

---

## 2. Dependency Rule Invariants

1. **Domain Layer is Pure Dart**:
   - ❌ Never import Flutter UI packages (`flutter/material.dart`, `flutter/widgets.dart`) in the `domain/` layer.
   - ❌ Never import `data/` or `presentation/` inside `domain/`.
   - ✅ Domain entities and repository interfaces must be completely agnostic of API protocols, JSON formats, and databases.

2. **Data Layer Implements Domain Interfaces**:
   - Concrete repositories in `data/repositories/` MUST implement abstract repository interfaces defined in `domain/repositories/`.
   - Data sources must only interact with DTOs, not directly return domain entities.

3. **Presentation Layer Uses Controllers & Use Cases**:
   - ❌ UI widgets must NEVER call `data/datasources/` or execute raw network calls.
   - ✅ UI widgets watch Riverpod providers exposed by `presentation/controllers/` or use cases.

---

## 3. Pattern Examples

### ✅ Good: Repository Interface in Domain
```dart
// lib/src/features/auth/domain/repositories/auth_repository.dart
abstract interface class AuthRepository {
  Future<User> signInWithEmail({required String email, required String password});
  Stream<User?> authStateChanges();
  Future<void> signOut();
}
```

### ❌ Bad: Importing Data / UI in Domain
```dart
// BAD: Domain depending on Retrofit/Dio DTO or Flutter UI
import 'package:flutter/material.dart';
import '../../data/dtos/user_dto.dart'; // Violation: Domain importing Data
```
