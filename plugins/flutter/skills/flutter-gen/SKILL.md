---
name: flutter-gen
description: >-
  Procedure for managing type-safe asset references, color palettes, SVGs, Lottie animations, and ThemeExtensions using flutter_gen and feature-mirrored asset directories in Flutter apps.
---

# flutter_gen Asset & Color Management Runbook

This skill outlines the procedure for adding new assets, SVGs, animations, and color palettes with compile-time type-safety via `flutter_gen`.

## 1. Feature-First Asset File Placement

Organize raw asset files under `assets/` mirroring feature directories:

```text
assets/
├── core/                                 # App-wide shared assets
│   ├── colors/
│   │   └── colors.xml                    # Design tokens (<color name="primary">#0052CC</color>)
│   ├── icons/                            # Global SVGs (chevron, search, close)
│   ├── images/                           # Logos, backgrounds, common placeholders
│   └── animations/                       # Shared Lottie JSON files
└── features/                             # Feature-scoped assets
    ├── auth/                             # assets/features/auth/images/
    └── ai/                               # assets/features/ai/animations/typing_dots.json
```

---

## 2. Configuration Verification (`pubspec.yaml`)

Ensure `pubspec.yaml` includes `flutter_gen` settings and asset folder declarations:

```yaml
flutter_gen:
  output: lib/src/core/gen/
  line_length: 80
  integrations:
    flutter_svg: true
    lottie: true
  colors:
    inputs:
      - assets/core/colors/colors.xml

flutter:
  uses-material-design: true
  assets:
    - assets/core/icons/
    - assets/core/images/
    - assets/core/animations/
    - assets/features/auth/images/
    - assets/features/ai/animations/
```

---

## 3. Run Asset Code Generation

Execute the generator from the project root:

```bash
dart run flutter_gen:flutter_gen_command
# Or via build_runner:
dart run build_runner build --delete-conflicting-outputs
```

---

## 4. UI Consumption & Accessor Patterns

Reference generated accessors in widgets:

```dart
// Raster Image (PNG / JPEG)
AppAssets.core.images.logo.image(width: 120, height: 120)

// SVG Vector Icon
AppAssets.core.icons.chevronDown.svg(width: 24, height: 24)

// Lottie Animation
AppAssets.features.ai.animations.typingDots.lottie(width: 48, height: 48)

// Color Token
Container(color: ColorName.primary)

// Font Family
Text('Title', style: TextStyle(fontFamily: FontFamily.inter))
```

---

## 5. Dynamic Light / Dark Theming (`ThemeExtension`)

For feature-specific colors that adapt between Light and Dark mode, create a `ThemeExtension` in `presentation/core/` or the feature's theme folder:

```dart
@immutable
class FeatureColors extends ThemeExtension<FeatureColors> {
  const FeatureColors({required this.cardBackground, required this.glow});
  final Color cardBackground;
  final Color glow;

  static const light = FeatureColors(
    cardBackground: Color(0xFFFFFFFF),
    glow: ColorName.primary,
  );

  static const dark = FeatureColors(
    cardBackground: Color(0xFF1E293B),
    glow: ColorName.secondary,
  );

  @override
  FeatureColors copyWith({Color? cardBackground, Color? glow}) => FeatureColors(
    cardBackground: cardBackground ?? this.cardBackground,
    glow: glow ?? this.glow,
  );

  @override
  FeatureColors lerp(ThemeExtension<FeatureColors>? other, double t) {
    if (other is! FeatureColors) return this;
    return FeatureColors(
      cardBackground: Color.lerp(cardBackground, other.cardBackground, t)!,
      glow: Color.lerp(glow, other.glow, t)!,
    );
  }
}
```

Consume in UI:
```dart
final colors = Theme.of(context).extension<FeatureColors>()!;
```

> [!WARNING]
> **Boundary Rule**: Asset accessors (`AppAssets.*`, `ColorName.*`) must never be imported in `domain/` or `data/` layers.
