# Localization (Slang), Asset Management (`flutter_gen`) & UI Invariants

Comprehensive standards for compile-time localization using **`slang`**, type-safe asset/color generation via **`flutter_gen`**, dynamic theming with `ThemeExtension`, and RTL layout invariants.

---

## 1. Localization Conventions (Slang & Two-Tier i18n)

Localization uses compile-time type-safe code generation via **`slang`** (`slang_flutter`).

### Supported Locales & Format
- **Base Locale**: `en` (English).
- **Secondary Locale**: `ar` (Arabic) with complete Right-to-Left (RTL) support.
- **File Format**: `.i18n.json`.

### Two-Tier Directory & Namespacing Model

1. **Application-Level Shared Strings (Core Tier)**:
   - Resides in `lib/src/core/i18n/`:
     - `core_en.i18n.json` & `core_ar.i18n.json` (accessible under `t.core.*`).
     - `locale_controller.dart`: Riverpod notifier managing active `AppLocale` and persistence.
     - `translations_provider.dart`: Riverpod provider exposing translation state to widgets.
     - `strings.g.dart`: Generated output file containing all strongly-typed translation trees.

2. **Feature-Specific Strings (Feature Tier)**:
   - Resides in feature presentation folders:
     `lib/src/features/<feature_name>/presentation/i18n/<feature_name>_<locale>.i18n.json`
     (e.g., `auth_en.i18n.json`, `auth_ar.i18n.json`).
   - Accessible under `t.<feature_name>.*` (e.g. `t.auth.login.title`).

### Clean Architecture Boundaries
- **Strictly UI Concern**: Localized strings and `t` instances must **never** be injected into or referenced by Domain entities, Use Cases, or Data sources.
- Domain error types must use abstract enum codes (e.g. `AuthFailure.invalidCredentials`); Presentation maps these codes to localized strings (`t.auth.errors.*`).

### Slang Project Configuration (`slang.yaml`)
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

### Riverpod Locale Controller
```dart
// lib/src/core/i18n/locale_controller.dart
import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'strings.g.dart';

part 'locale_controller.g.dart';

@riverpod
class LocaleController extends _$LocaleController {
  @override
  AppLocale build() => AppLocale.en;

  Future<void> setLocale(AppLocale newLocale) async {
    state = newLocale;
    LocaleSettings.setLocale(newLocale);
    // Persist chosen locale to local storage / SharedPreferences
  }
}
```

---

## 2. Asset & Color Management Conventions (`flutter_gen`)

All static assets (images, SVGs, Lottie animations, fonts, and colors) must be managed using compile-time code generation via **`flutter_gen`** (`flutter_gen_runner`).

### Feature-First Asset Directory Mirroring
Asset directories under `assets/` must mirror feature topology:

```text
assets/
├── core/                                 # Global shared assets
│   ├── colors/
│   │   └── colors.xml                    # Raw palette tokens (ColorName.*)
│   ├── icons/
│   ├── images/
│   └── animations/
└── features/                             # Feature-scoped assets
    ├── auth/                             # Assets.features.auth.*
    │   └── images/
    └── ai/                               # Assets.features.ai.*
        ├── colors/
        │   └── ai_colors.xml
        └── animations/
```

### `pubspec.yaml` Configuration
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

### Generated Accessors Usage
- **Images**: `AppAssets.core.images.logo.image(width: 120, height: 120)` or `.provider()`
- **SVGs**: `AppAssets.core.icons.chevronDown.svg(width: 24, height: 24)`
- **Lottie**: `AppAssets.features.ai.animations.typingDots.lottie(width: 48, height: 48)`
- **Fonts**: `fontFamily: FontFamily.inter`
- **Colors**: `ColorName.primary` (or aliased as `typedef AppColors = ColorName;` in `core/theme/`)

---

## 3. Dynamic Theme & Feature Colors (`ThemeExtension`)

- Static tokens (`ColorName.*`) represent raw brand palette constants.
- For feature colors that dynamically switch between Light and Dark mode, use Flutter's **`ThemeExtension<T>`** pattern located in the feature's presentation layer:

```dart
@immutable
class AiThemeColors extends ThemeExtension<AiThemeColors> {
  const AiThemeColors({
    required this.bubbleBackground,
    required this.responseGlow,
  });

  final Color bubbleBackground;
  final Color responseGlow;

  static const light = AiThemeColors(
    bubbleBackground: Color(0xFFF1F5F9),
    responseGlow: ColorName.primary,
  );

  static const dark = AiThemeColors(
    bubbleBackground: Color(0xFF1E293B),
    responseGlow: ColorName.secondary,
  );

  @override
  AiThemeColors copyWith({Color? bubbleBackground, Color? responseGlow}) =>
      AiThemeColors(
        bubbleBackground: bubbleBackground ?? this.bubbleBackground,
        responseGlow: responseGlow ?? this.responseGlow,
      );

  @override
  AiThemeColors lerp(ThemeExtension<AiThemeColors>? other, double t) {
    if (other is! AiThemeColors) return this;
    return AiThemeColors(
      bubbleBackground: Color.lerp(bubbleBackground, other.bubbleBackground, t)!,
      responseGlow: Color.lerp(responseGlow, other.responseGlow, t)!,
    );
  }
}
```

Consume in UI via:
```dart
final aiColors = Theme.of(context).extension<AiThemeColors>()!;
Container(color: aiColors.bubbleBackground);
```

---

## 4. UI, RTL & Asset Invariants

1. **Zero Hardcoded Paths**: Never hardcode raw string paths (e.g. `'assets/images/...'`). Always use `AppAssets.*` accessors.
2. **Directional Layouts**: Use `AlignmentDirectional` and `EdgeInsetsDirectional` for localized layouts.
3. **Directional Icon Mirroring**: Wrap directional navigation icons (e.g. forward/back arrows) with `Transform.flip`:
   ```dart
   Transform.flip(
     flipX: Directionality.of(context) == TextDirection.rtl,
     child: AppAssets.core.icons.arrowRight.svg(width: 20, height: 20),
   )
   ```
4. **Tabler Icons**: Use `flutter_tabler_icons` when resolving or importing Tabler icon sets.
