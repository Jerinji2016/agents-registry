# Riverpod 2.0+ Architecture & State Management Standards

Standards for Riverpod state management, code generation (`@riverpod`), asynchronous state handling, and lifecycle safety.

---

## 1. Code Generation Syntax (`@riverpod`)

- **Always use Riverpod Generator**: Do NOT use legacy global provider declarations (`final myProvider = StateProvider(...)` or `ChangeNotifierProvider`).
- **Use Part Directives**: Every file containing `@riverpod` must declare `part '<filename>.g.dart';`.

```dart
// ✅ GOOD: Modern Riverpod 2.0 code generation
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'user_profile_controller.g.dart';

@riverpod
class UserProfileController extends _$UserProfileController {
  @override
  FutureOr<UserProfile> build() async {
    return _fetchProfile();
  }

  Future<void> updateBio(String newBio) async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() async {
      final repository = ref.read(userRepositoryProvider);
      return repository.updateBio(newBio);
    });
  }
}
```

---

## 2. Immutability & State Modification Rules

1. **AsyncValue.guard for Mutations**:
   - Always wrap state mutations with `state = await AsyncValue.guard(() => ...)` to ensure exceptions are automatically converted to `AsyncValue.error`.

2. **No Side Effects in `build()`**:
   - ❌ Never trigger mutations, navigation, or snackbars directly inside `build()`.
   - ❌ Never call `ref.read()` inside `build()` when you intended to listen for changes (`ref.watch()` must be used for reactive dependencies).
   - ✅ If a microtask or initialization is strictly required on mount, schedule it via `ref.onDispose` or lifecycle listeners.

3. **`ref.watch` vs `ref.read`**:
   - **`ref.watch`**: Use inside Widget `build()` methods or inside `@riverpod` notifier `build()` methods to establish reactive dependencies.
   - **`ref.read`**: Use ONLY inside user event handlers (e.g. `onPressed`, callbacks) and controller mutation methods.

---

## 3. UI Consumption Best Practices

- **Extend `ConsumerWidget` or `ConsumerStatefulWidget`**: Avoid wrapping entire tree subtrees in deep `Consumer` builders when the whole widget can simply extend `ConsumerWidget`.
- **Handle All Async States**:
  Always handle `.when(data: ..., error: ..., loading: ...)` or use `whenOrNull` gracefully:

```dart
// ✅ GOOD UI consumption
class UserProfileView extends ConsumerWidget {
  const UserProfileView({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final profileState = ref.watch(userProfileControllerProvider);

    return profileState.when(
      data: (profile) => Text(profile.name),
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (err, stack) => Text('Error: $err'),
    );
  }
}
```
