---
name: slang-i18n
description: >-
  Step-by-step workflow for adding, modifying, and regenerating Slang localization strings in Flutter apps. Use when translating new UI features or updating locale JSON files.
---

# Slang Localization Runbook

This skill outlines the procedure for managing translations using `slang`.

## 1. Locate Translation Files
Translation source files are located under `lib/i18n/`:
- Base English locale: `lib/i18n/strings.i18n.json` (or `strings_en.i18n.json`)
- Secondary locales: `lib/i18n/strings_<locale>.i18n.json` (e.g. `strings_ar.i18n.json`)

## 2. Adding / Updating Keys

1. Edit the base locale JSON file to add your new namespace and keys:
   ```json
   {
     "auth": {
       "login": {
         "title": "Welcome Back",
         "button": "Sign In",
         "forgot_password": "Forgot Password?"
       }
     }
   }
   ```
2. Mirror the new keys into secondary locale JSON files (e.g. `strings_ar.i18n.json`).

## 3. Run Slang Code Generation

Execute the build runner command in the project root:

```bash
dart run slang
# or via build_runner:
dart run build_runner build --delete-conflicting-outputs
```

## 4. UI Usage Verification

Ensure the generated translation is referenced in Flutter widgets using:

```dart
// If translation provider is initialized:
final t = Translations.of(context);
// or global accessor:
Text(t.auth.login.title)
```
