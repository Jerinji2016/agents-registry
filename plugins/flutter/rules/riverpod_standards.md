# Riverpod 2.0+ Architecture & State Management Standards

Standards for Riverpod state management, code generation (`@riverpod`), GetIt integration, asynchronous state safety, and UI consumption patterns.

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

## 2. Bridging Dependency Injection (GetIt) to Riverpod

To preserve testability and Clean Architecture separation:

1. **Expose GetIt Dependencies via Riverpod Providers**:
   Expose repositories and use cases registered in GetIt through Riverpod provider functions:
   ```dart
   // lib/src/features/ai/domain/providers/ai_providers.dart
   import 'package:get_it/get_it.dart';
   import 'package:riverpod_annotation/riverpod_annotation.dart';
   import '../repositories/ai_chat_repository.dart';
   import '../usecases/get_chat_messages_use_case.dart';

   part 'ai_providers.g.dart';

   @riverpod
   AIChatRepository aiChatRepository(Ref ref) {
     return GetIt.I<AIChatRepository>();
   }

   @riverpod
   GetChatMessagesUseCase getChatMessagesUseCase(Ref ref) {
     return GetIt.I<GetChatMessagesUseCase>();
   }
   ```

2. **Consume Use Cases from Riverpod Providers in Notifiers**:
   UI State Notifiers must fetch use cases from Riverpod providers rather than querying GetIt directly:
   ```dart
   @riverpod
   class AiChatController extends _$AiChatController {
     GetChatMessagesUseCase get _getChatMessagesUseCase => 
         ref.read(getChatMessagesUseCaseProvider);

     // ...
   }
   ```

---

## 3. Asynchronous Initialization & State Safety

### ❌ Anti-Pattern: Synchronous Async Mutation in `build()`
Never invoke async methods that read or mutate `state` (e.g. `state = state.copyWith(...)`) synchronously in a Notifier's `build()` method. This triggers:
`Bad state: Tried to read the state of an uninitialized provider`.

### ✅ Good Pattern: Microtask Scheduling
Schedule initial asynchronous background loading after the notifier completes initial construction using `Future.microtask`:

```dart
@riverpod
class AiChatController extends _$AiChatController {
  @override
  AiChatState build() {
    // Schedule asynchronous loading safely after provider initialization
    unawaited(Future.microtask(_loadInitialMessages));
    return const AiChatState(isLoading: true, messages: []);
  }

  Future<void> _loadInitialMessages() async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() async {
      final useCase = ref.read(getChatMessagesUseCaseProvider);
      return useCase.call(sessionId);
    });
  }
}
```

---

## 4. Immutability & Modification Invariants

1. **`AsyncValue.guard` for Mutations**:
   - Always wrap state mutations with `state = await AsyncValue.guard(() async => ...)` so uncaught exceptions automatically transition the state to `AsyncValue.error`.

2. **`ref.watch` vs `ref.read` Rules**:
   - **`ref.watch`**: Use inside Widget `build()` methods or inside `@riverpod` notifier `build()` methods to establish reactive dependencies.
   - **`ref.read`**: Use ONLY inside user event handlers (`onPressed`, callbacks) and controller action methods. Never use `ref.read` in `build()` when you intend to react to state updates.

---

## 5. UI Consumption Best Practices

- **Extend `ConsumerWidget` or `ConsumerStatefulWidget`**: Prefer extending `ConsumerWidget` over wrapping deep component trees inside nested `Consumer` builders.
- **Handle All States**: Use `.when(data: ..., error: ..., loading: ...)` or `.whenOrNull` gracefully:

```dart
class AiChatScreen extends ConsumerWidget {
  const AiChatScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final chatState = ref.watch(aiChatControllerProvider);

    return chatState.when(
      data: (messages) => ListView.builder(
        itemCount: messages.length,
        itemBuilder: (context, index) => ChatMessageBubble(message: messages[index]),
      ),
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (err, stack) => Center(child: Text('Failed to load chat: $err')),
    );
  }
}
```
