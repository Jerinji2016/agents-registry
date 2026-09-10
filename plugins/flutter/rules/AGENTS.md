# Flutter Stack Architectural Guidelines & Rules

This document consolidates the architectural conventions, state management rules, and serialization standards for Flutter projects.

---

## 1. Rule Scoping Protocol (`00_meta_rules.md`)
- When asked to record or update architectural guidelines, **always ask the user** whether the change belongs in the **Central Registry** (shared) or **Project-Level Override** (local).
- See detailed protocol: [00_meta_rules.md](./00_meta_rules.md).

---

## 2. Clean Architecture & Boundaries (`clean_architecture.md`)
- 3-tier structure per feature: `domain/`, `data/`, `presentation/`.
- Domain is pure Dart (no Flutter UI, no Data dependencies).
- Data implements domain repository interfaces and isolates DTOs.
- Presentation consumes controllers and never calls data sources directly.
- See detailed rules: [clean_architecture.md](./clean_architecture.md).

---

## 3. Riverpod 2.0+ Standards (`riverpod_standards.md`)
- Use `@riverpod` code generation syntax (`part '<filename>.g.dart'`).
- Always wrap state mutations with `state = await AsyncValue.guard(() => ...)`.
- No side effects inside `build()`.
- Use `ref.watch` in reactive contexts and `ref.read` only in user callbacks/notifiers.
- See detailed rules: [riverpod_standards.md](./riverpod_standards.md).

---

## 4. DTOs, Freezed & Network Standards (`serialization_dto.md`)
- All DTOs must use Freezed with `json_serializable`.
- Use extension mappers (`toDomain()` and `toDto()`) to decouple wire schemas from domain entities.
- Streaming Retrofit endpoints must import `dart:convert` and use `Stream<ResponseBody>`.
- See detailed rules: [serialization_dto.md](./serialization_dto.md).

---

## 5. Localization & Assets (`i18n_assets.md`)
- Zero hardcoded strings in UI: use Slang (`t.path.to.key`).
- Zero hardcoded asset paths: use `flutter_gen` (`Assets.images...image()`).
- See detailed rules: [i18n_assets.md](./i18n_assets.md).
