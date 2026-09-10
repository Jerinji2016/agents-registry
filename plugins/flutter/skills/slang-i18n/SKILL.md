---
name: slang-i18n
description: >-
  Step-by-step workflow for adding, modifying, and regenerating Slang localization strings in Flutter apps across the two-tier Core and Feature localization architecture. Use when adding UI strings or translating feature JSON files.
---

# Slang Localization Runbook

This skill outlines the procedure for managing compile-time localization using `slang` with a two-tier directory model.

## 1. Locate Translation Files

Translations are separated into two tiers:

1. **Core Tier (App-Wide Shared Strings)**:
   - Directory: `lib/src/core/i18n/`
   - Base English: `lib/src/core/i18n/core_en.i18n.json`
   - Arabic (RTL): `lib/src/core/i18n/core_ar.i18n.json`
   - Access via: `t.core.*` (e.g. `t.core.buttons.save`, `t.core.errors.networkError`)

2. **Feature Tier (Feature-Scoped Strings)**:
   - Directory: `lib/src/features/<feature_name>/presentation/i18n/`
   - Base English: `<feature_name>_en.i18n.json` (e.g. `auth_en.i18n.json`)
   - Arabic (RTL): `<feature_name>_ar.i18n.json` (e.g. `auth_ar.i18n.json`)
   - Access via: `t.<feature_name>.*` (e.g. `t.auth.login.submit`)

---

## 2. Adding / Updating Translation Keys

1. **Add keys to the English file (`*_en.i18n.json`)**:
   ```json
   {
     "login": {
       "title": "Welcome to Bayaan",
       "greeting": "Hello, $userName!",
       "items_count(plural)": {
         "one": "1 item selected",
         "other": "$n items selected"
       }
     }
   }
   ```
2. **Mirror keys in Arabic (`*_ar.i18n.json`)**:
   Provide the corresponding Arabic strings with identical parameter names.

---

## 3. Configuration (`slang.yaml`)

Ensure `slang.yaml` at the project root enables recursive namespaces:

```yaml
base_locale: en
fallback_strategy: base_locale
input_directory: lib/src
input_file_pattern: .i18n.json
output_directory: lib/src/core/i18n
output_file_name: strings.g.dart
flutter_integration: true
namespaces: true
```

---

## 4. Run Code Generation

Execute code generation in the project root:

```bash
dart run slang
# Or via build_runner:
dart run build_runner build --delete-conflicting-outputs
```

---

## 5. UI Usage & Verification

Access generated translations reactively in UI widgets:

```dart
// Core string:
Text(t.core.buttons.submit)

// Feature-scoped string:
Text(t.auth.login.title)

// Parameterized string:
Text(t.auth.login.greeting(userName: user.name))
```

> [!WARNING]
> **Boundary Rule**: Never import `strings.g.dart` or `t` inside `domain/` or `data/` layers. Domain entities and use cases must use abstract error enums, leaving translation mapping strictly to the presentation layer.
