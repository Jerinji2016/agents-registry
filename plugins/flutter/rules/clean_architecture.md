# Clean Architecture & Feature Structuring Guidelines (Flutter / Dart)

This document establishes the layer boundaries, directory structures, dependency injection patterns, naming conventions, and architectural invariants for Flutter applications.

---

## 1. Directory Structure

Every feature module (located under `lib/src/features/<feature_name>/`) is organized into clean, decoupled layers:

```text
lib/src/features/<feature_name>/
├── domain/                               # Pure enterprise business logic layer
│   ├── entities/                         # Pure domain models (no JSON/network annotations)
│   │   └── entities.dart                 # Alphabetically-sorted barrel file
│   ├── repositories/                     # Abstract repository interface contracts
│   ├── usecases/                         # Single-purpose action classes (@lazySingleton)
│   │   └── usecases.dart                 # Alphabetically-sorted barrel file
│   └── providers/                        # Riverpod providers bridging Domain to Presentation
│
├── data/                                 # Technical implementation layer
│   ├── data_sources/                     # Retrofit API clients, local DBs, Key-Value helpers
│   ├── models/                           # Network DTOs, request/response models (Freezed + JSON)
│   │   ├── <subdomain>/                  # Optional: Grouped by subdomain (e.g. users/, auth/)
│   │   └── models.dart                   # Alphabetically-sorted barrel file (exports all DTOs)
│   ├── repositories/                     # Concrete implementations of domain repository contracts
│   └── interceptors/                     # HTTP/API request & response interceptors
│
├── presentation/                         # UI, state management & user experience layer
│   ├── screens/                          # Page widgets annotated with @RoutePage()
│   ├── widgets/                          # Reusable UI sub-widgets private to this feature
│   ├── providers/                        # Riverpod Notifiers/providers holding screen state
│   ├── router/                           # Feature routing wrappers or navigation helpers
│   └── i18n/                             # Feature-specific localization (<feature>_<locale>.i18n.json)
│
├── di/                                   # Feature-specific Dependency Injection setup
│   └── <feature_name>_di.dart            # @InjectableInit configuration for feature dependencies
│
└── router/                               # Navigation wrappers and AutoRoute definitions
```

### Subdivided Presentation Structure (For Large Features)
For large features containing multiple distinct screen groups, subdivide `presentation/`:
- `core/`: Feature-specific core theme extensions, shared helper services, or common widgets.
- `<screen_subdomain>/`: Screen-group folders containing `screens/`, `widgets/`, and `providers/`.
- `i18n/`: Feature-specific localization files.

### Subdivided DTO Models Structure (For Features with Multiple Subdomains)
When a feature manages multiple subdomains or numerous DTO operations (e.g., `CreateUserDto`, `UpdateUserDto`, `DeleteUserDto`), group related DTOs into dedicated subdirectories under `data/models/`:
- `data/models/users/`: `create_user_dto.dart`, `update_user_dto.dart`, `delete_user_dto.dart`, etc.
- `data/models/auth/`: `login_request_dto.dart`, `auth_response_dto.dart`, etc.
- `data/models/models.dart`: Top-level barrel file re-exporting all subfolder DTOs alphabetically.

---

## 2. File & Class Naming Conventions

Strictly adhere to the following naming standards:

| Component | File Naming (`snake_case`) | Class Naming (`PascalCase`) | Example |
| :--- | :--- | :--- | :--- |
| **Use Case** | `<action>_<entity>_use_case.dart` | `<Action><Entity>UseCase` | `get_chat_messages_use_case.dart` → `GetChatMessagesUseCase` |
| **Repository Contract** | `<feature>_<subdomain>_repository.dart` | `<Feature><Subdomain>Repository` | `ai_chat_repository.dart` → `AIChatRepository` |
| **Repository Impl** | `<feature>_<subdomain>_repository_impl.dart` | `<Feature><Subdomain>RepositoryImpl` | `ai_chat_repository_impl.dart` → `AIChatRepositoryImpl` |
| **Data Source** | `<subdomain>_api_service.dart` | `<Subdomain>ApiService` | `chat_api_service.dart` → `ChatApiService` |
| **Riverpod Provider** | `<feature>_<subdomain>_provider.dart` | `<feature><Subdomain>Provider` | `ai_chat_provider.dart` → `aiChatProvider` |
| **Dependency Injection** | `<feature>_di.dart` | `configure<Feature>Dependencies` | `ai_di.dart` → `configureAIDependencies` |
| **Screen Widget** | `<screen_name>_screen.dart` | `<ScreenName>Screen` (`@RoutePage()`) | `chat_history_screen.dart` → `ChatHistoryScreen` |
| **Localization JSON** | `<namespace>_<locale>.i18n.json` | N/A (Slang JSON namespace) | `auth_en.i18n.json`, `core_ar.i18n.json` |

---

## 3. Dependency Injection (DI) Patterns

- Use **`get_it`** and **`injectable`** for compile-time dependency wiring.
- **Use Cases**: Annotate with `@lazySingleton`:
  ```dart
  @lazySingleton
  class GetChatMessagesUseCase {
    const GetChatMessagesUseCase(this._repository);
    final AIChatRepository _repository;

    Future<List<ChatMessage>> call(String sessionId) {
      return _repository.getMessages(sessionId);
    }
  }
  ```
- **Repository Implementations**: Annotate with `@LazySingleton(as: DomainRepositoryClass)`:
  ```dart
  @LazySingleton(as: AIChatRepository)
  class AIChatRepositoryImpl implements AIChatRepository {
    const AIChatRepositoryImpl(this._apiService);
    final ChatApiService _apiService;

    @override
    Future<List<ChatMessage>> getMessages(String sessionId) async {
      final dtos = await _apiService.getChatMessages(sessionId);
      return dtos.map((dto) => dto.toDomain()).toList();
    }
  }
  ```
- **Global Injection Locator**: Local feature DI initializers must be invoked in the global dependency locator located in `lib/src/config/dependancy_injection/injection_container.dart`:
  ```dart
  Future<void> initializeDependencies() async {
    configureAIDependencies(serviceLocator);
    configureAuthDependencies(serviceLocator);
  }
  ```

---

## 4. Screen & Navigation Conventions (`auto_route`)

- **Screen Annotation**: Annotate all new page and screen widgets with **`@RoutePage()`**.
- **Declarative Navigation**: Always perform transitions via AutoRoute methods (`context.pushRoute(...)`, `context.maybePop()`) rather than managing page switches inside local widget state trees.

---

## 5. Layer Boundary Invariants

1. **Domain Layer is Pure Dart**:
   - ❌ Never import Flutter UI packages (`flutter/material.dart`, `flutter/widgets.dart`) in `domain/`.
   - ❌ Never import `data/` or `presentation/` inside `domain/`.
   - ❌ Never place JSON serialization (`fromJson` / `toJson`) or network annotations on domain entities.
   - ✅ Domain entities and repository interfaces must be pure Dart, completely agnostic of API protocols and databases.

2. **Data Layer Isolates Network & Storage Details**:
   - Concrete repositories in `data/repositories/` MUST implement abstract interfaces defined in `domain/repositories/`.
   - Data sources must only interact with DTO models (`data/models/`), mapping them to pure domain entities (`domain/entities/`) via extension mappers (`toDomain()` / `toDto()`).

3. **Presentation Layer Uses Riverpod & Use Cases**:
   - ❌ UI widgets must NEVER call `data/data_sources/` or execute raw network calls.
   - ✅ UI widgets watch Riverpod providers exposed by `presentation/providers/` or consume use cases.

4. **Alphabetical Barrel Files**:
   - Provide barrel files:
     - `domain/entities/entities.dart` (exports all domain entities).
     - `domain/usecases/usecases.dart` (exports all feature use cases).
     - `data/models/models.dart` (exports all DTO models across all subfolders).
   - Keep exports sorted strictly alphabetically to satisfy linter constraints.
