# Flutter Stack Architectural Guidelines & Conventions

This master document consolidates the architectural conventions, state management rules, serialization standards, dependency injection patterns, localization workflows, and asset practices for Flutter applications.

---

## 1. Rule Scoping Protocol (`00_meta_rules.md`)
- When asked to record or update architectural guidelines, **always ask the user** whether the change belongs in the **Central Registry** (shared) or **Project-Level Override** (local).
- See detailed protocol: [00_meta_rules.md](./00_meta_rules.md).

---

## 2. Directory Structure & Clean Architecture (`clean_architecture.md`)
- **3-Tier Structure per Feature** (`lib/src/features/<feature_name>/`):
  - `domain/`: `entities/` (pure domain objects), `repositories/` (contracts), `usecases/` (@lazySingleton), `providers/` (Riverpod bridge).
  - `data/`: `data_sources/` (Retrofit/APIs), `models/` (Freezed DTOs), `repositories/` (implementations), `interceptors/`.
  - `presentation/`: `screens/` (@RoutePage), `widgets/`, `providers/`, `router/`, `i18n/` (`<feature>_<locale>.i18n.json`).
  - `di/`: Feature DI initialization (`<feature>_di.dart`).
- **Boundaries**: Domain is pure Dart (no UI, no network/JSON dependencies). Data isolates serialization. Presentation uses Riverpod notifiers and use cases.
- **Barrel Files**: Maintain alphabetically-sorted `entities.dart`, `usecases.dart`, and `models.dart`.
- **Subdomain DTOs**: Group feature DTOs with numerous models into subdirectories under `data/models/<subdomain>/`.
- See detailed rules: [clean_architecture.md](./clean_architecture.md).

---

## 3. File & Class Naming Conventions (`clean_architecture.md`)
- Use cases: `<action>_<entity>_use_case.dart` → `GetChatMessagesUseCase`.
- Repositories: `<feature>_<subdomain>_repository.dart` → `AIChatRepository` (Impl: `..._impl.dart` → `AIChatRepositoryImpl`).
- Data sources: `<subdomain>_api_service.dart` → `ChatApiService`.
- Riverpod providers: `<feature>_<subdomain>_provider.dart` → `ai_chat_provider.dart`.
- Dependency injection: `<feature>_di.dart` → `configureAIDependencies`.
- Screens: `<screen_name>_screen.dart` → `ChatHistoryScreen` (`@RoutePage()`).
- Localization: `<namespace>_<locale>.i18n.json` → `auth_en.i18n.json`.
- See detailed rules: [clean_architecture.md](./clean_architecture.md).

---

## 4. Dependency Injection (GetIt & Injectable) & Riverpod Bridge
- Wire compile-time dependencies with `get_it` and `injectable` (`@lazySingleton`, `@LazySingleton(as: DomainRepo)`).
- Expose GetIt dependencies to Presentation through `@riverpod` provider functions.
- State Notifiers read use cases from Riverpod providers (`ref.read(getChatMessagesUseCaseProvider)`), avoiding direct GetIt calls in UI.
- See detailed rules: [clean_architecture.md](./clean_architecture.md) and [riverpod_standards.md](./riverpod_standards.md).

---

## 5. Riverpod 2.0+ State Management (`riverpod_standards.md`)
- Always use `@riverpod` code generation syntax with `part '<filename>.g.dart';`.
- Always wrap state mutations with `state = await AsyncValue.guard(() async => ...)`.
- **No Async State Mutation in `build()`**: Schedule initial loading with `unawaited(Future.microtask(_loadInitialData))` to prevent uninitialized provider errors.
- Use `ref.watch` in reactive contexts and `ref.read` only in user event handlers.
- See detailed rules: [riverpod_standards.md](./riverpod_standards.md).

---

## 6. DTOs, Freezed & Serialization (`serialization_dto.md`)
- All request/response models in `data/models/` must use **Freezed** with `json_serializable`.
- Declare Freezed classes as `abstract class MyClass with _$MyClass`.
- Declare private constructor `const MyClass._();` when defining custom methods, properties, or mappers.
- Declare `@override Map<String, dynamic> toJson();` on HTTP request DTOs.
- Keep domain entities in `domain/entities/` pure Dart (no `fromJson` / `toJson`).
- Map between DTOs and entities using explicit extension methods (`toDomain()` / `toDto()`).
- See detailed rules: [serialization_dto.md](./serialization_dto.md).

---

## 7. Retrofit, Streaming & Network Standards (`serialization_dto.md`)
- When returning streaming endpoints (`@DioResponseType(ResponseType.stream)` returning `Stream<String>`), **always import `dart:convert`** in the service interface file to provide `utf8` decoder for generated code.
- Reference API base URLs from `AppConfig` and standard HTTP headers from `dart:io` `HttpHeaders`.
- See detailed rules: [serialization_dto.md](./serialization_dto.md).

---

## 8. Localization Conventions (Slang & Two-Tier i18n) (`i18n_assets.md`)
- Two-Tier architecture: Core tier (`lib/src/core/i18n/` → `t.core.*`) and Feature tier (`presentation/i18n/` → `t.<feature>.*`).
- Supported locales: `en` (base), `ar` (Arabic RTL).
- UI-only boundary: Domain entities use enum error codes; Presentation translates them.
- Manage language switching with Riverpod `LocaleController`.
- See detailed rules: [i18n_assets.md](./i18n_assets.md).

---

## 9. Asset & Color Management (`flutter_gen` & `ThemeExtension`) (`i18n_assets.md`)
- Mirror asset folders under `assets/core/` and `assets/features/<feature>/` to match feature architecture.
- Use generated accessors: `AppAssets.*`, `ColorName.*`, `FontFamily.*`.
- For feature colors dynamically adapting to Light/Dark modes, implement `ThemeExtension<T>`.
- See detailed rules: [i18n_assets.md](./i18n_assets.md).

---

## 10. Screen Navigation (`auto_route`) & UI RTL Invariants (`clean_architecture.md`, `i18n_assets.md`)
- Annotate screen widgets with `@RoutePage()` and navigate using `context.pushRoute(...)`.
- Use `AlignmentDirectional` and `EdgeInsetsDirectional`.
- Wrap directional navigation icons with `Transform.flip(flipX: Directionality.of(context) == TextDirection.rtl)`.
- Use `flutter_tabler_icons` for Tabler icon sets.
- See detailed rules: [i18n_assets.md](./i18n_assets.md).
