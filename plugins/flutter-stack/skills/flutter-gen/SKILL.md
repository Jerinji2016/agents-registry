---
name: flutter-gen
description: >-
  Procedure for generating type-safe asset references using flutter_gen when adding images, SVG icons, animations, or fonts to Flutter projects.
---

# flutter_gen Asset Generation Runbook

This skill outlines the workflow for adding new assets and regenerating asset accessors.

## 1. Asset File Placement
Place raw assets in their respective directories under `assets/`:
- PNG/JPEG images: `assets/images/`
- SVG icons: `assets/icons/`
- Lottie / Rive animations: `assets/animations/`
- Fonts: `assets/fonts/`

## 2. Configuration Verification (`pubspec.yaml` & `flutter_gen.yaml`)

Ensure `pubspec.yaml` includes the asset paths:
```yaml
flutter:
  assets:
    - assets/images/
    - assets/icons/
```

Ensure `flutter_gen.yaml` enables required integrations:
```yaml
flutter_gen:
  output: lib/src/core/generated/
  integrations:
    flutter_svg: true
```

## 3. Regenerate Asset Classes

Run the generator in the project root:

```bash
dart run flutter_gen:flutter_gen_command
# or with build_runner:
dart run build_runner build --delete-conflicting-outputs
```

## 4. Widget Consumption

Reference the generated asset in code:
```dart
// Raster image
Assets.images.logo.image(width: 120, height: 120)

// SVG icon
Assets.icons.settings.svg(width: 24, height: 24, colorFilter: ColorFilter.mode(Colors.black, BlendMode.srcIn))
```
