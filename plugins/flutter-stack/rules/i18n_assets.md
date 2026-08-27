# Localization (Slang) & Asset Management Standards

Invariants for application localization using `slang` and type-safe asset management using `flutter_gen`.

---

## 1. Slang Localization Standards

- **Zero Hardcoded Strings in UI**: All user-facing labels, headings, error messages, and button text MUST be localized via Slang.
- **Access Pattern**:
  - Always access translations via `t.path.to.string` (or `context.t.path.to.string`).
  - Use parameterized strings for dynamic content:
    ```json
    {
      "welcome": "Welcome back, $userName!",
      "items_count(plural)": {
        "one": "1 item selected",
        "other": "$n items selected"
      }
    }
    ```
- **Locale File Location**: Place raw translation files under `lib/i18n/` (e.g., `strings.i18n.json`, `strings_ar.i18n.json`).

---

## 2. Asset Management via `flutter_gen`

- **Zero Hardcoded Asset String Paths**: Never write `Image.asset('assets/images/logo.png')` or `SvgPicture.asset('assets/icons/home.svg')`.
- **Use Generated Accessors**:
  - Images: `Assets.images.logo.image(width: 48, height: 48)`
  - SVGs: `Assets.icons.home.svg(width: 24, height: 24)`
- **Configuration**:
  - Maintain `flutter_gen.yaml` at the project root with `integrations: { flutter_svg: true }`.
