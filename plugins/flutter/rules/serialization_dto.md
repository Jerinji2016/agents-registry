# Serialization, DTOs & Network Communication Standards

Guidelines for Freezed models, JSON serialization, domain mappers, Retrofit network clients, and HTTP communication standards.

---

## 1. Freezed Model & DTO Signatures

All Data Transfer Objects (DTOs) and API request/response payloads MUST use **Freezed** with `json_serializable`.

### Required Signatures & Constructors
1. **Declare as Abstract Class**:
   Always declare Freezed classes as `abstract class` (e.g. `abstract class StartSearchDto with _$StartSearchDto`).
2. **Mandatory Private Constructor `const MyClass._();`**:
   When a Freezed class implements custom methods, properties, or custom method signatures (like `toJson()` or mapper helpers), it **MUST** declare a private constructor:
   ```dart
   const MyRequestDto._();
   ```
3. **Declare `@override` `toJson()` on Request DTOs**:
   Explicitly declare `Map<String, dynamic> toJson();` as an `@override` inside DTOs that will be serialized as HTTP request payloads.

```dart
// ✅ GOOD: Production Request DTO Pattern
import 'package:freezed_annotation/freezed_annotation.dart';

part 'my_request_dto.freezed.dart';
part 'my_request_dto.g.dart';

@freezed
abstract class MyRequestDto with _$MyRequestDto {
  // Private constructor is required when overriding methods or defining mappers
  const MyRequestDto._();

  const factory MyRequestDto({
    required String query,
    @JsonKey(name: 'session_id') String? sessionId,
    @Default(false) bool isStreaming,
  }) = _MyRequestDto;

  factory MyRequestDto.fromJson(Map<String, dynamic> json) =>
      _$MyRequestDtoFromJson(json);

  @override
  Map<String, dynamic> toJson();
}
```

---

## 2. Pure Entities vs Technical DTOs

- **Pure Domain Entities (`domain/entities/`)**:
  - Domain entities must be pure and free of external serialization annotations.
  - If domain entities are modeled using Freezed for immutability, they must **NOT** contain `fromJson` / `toJson` definitions.
- **Technical DTO Models (`data/models/`)**:
  - All external API request and response models must be defined as DTOs under `data/models/`.
  - JSON serialization annotations (`fromJson` / `toJson`) are strictly confined to DTO classes.
  - Decouple domain logic from technical wire formats using explicit extension mappers:

```dart
// lib/src/features/ai/data/models/chat_message_dto.dart
extension ChatMessageDtoMapper on ChatMessageDto {
  ChatMessage toDomain() => ChatMessage(
    id: id,
    text: content,
    sender: isUser ? MessageSender.user : MessageSender.assistant,
    createdAt: DateTime.parse(timestamp),
  );
}

extension ChatMessageDomainMapper on ChatMessage {
  ChatMessageDto toDto() => ChatMessageDto(
    id: id,
    content: text,
    isUser: sender == MessageSender.user,
    timestamp: createdAt.toIso8601String(),
  );
}
```

---

## 3. Alphabetical Barrel Files

- Maintain alphabetically-sorted barrel files to group data models and domain entities:
  - `data/models/models.dart` (exports all DTO model definitions).
  - `domain/entities/entities.dart` (exports all domain entity definitions).
- Import these barrel files inside repositories, use cases, providers, and presentation screens instead of importing individual model files directly.

---

## 4. Retrofit & Code Generation Gotchas

### Streaming API Endpoints (`Stream<String>`)
When defining a streaming API endpoint annotated with `@DioResponseType(ResponseType.stream)` that returns `Stream<String>`, `retrofit_generator` uses `utf8.decode` to transform incoming byte chunks.

> [!IMPORTANT]
> To prevent compilation errors in generated `.g.dart` files (e.g. `The getter 'utf8' isn't defined`), you **MUST** explicitly add `import 'dart:convert';` at the top of the interface service file (`_api_service.dart`).

```dart
// ✅ GOOD: Streaming Retrofit Service
import 'dart:convert'; // Required for utf8 decoder in generated code
import 'dart:io';
import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';

part 'chat_api_service.g.dart';

@RestApi()
abstract class ChatApiService {
  factory ChatApiService(Dio dio, {String baseUrl}) = _ChatApiService;

  @POST('/chat/stream')
  @DioResponseType(ResponseType.stream)
  Stream<String> streamChatResponse(@Body() Map<String, dynamic> body);
}
```

---

## 5. Network & HTTP Header Conventions

- **App Configuration**: Reference API base URLs and network timeout constants via `AppConfig` (`src/config/app_config.dart`) rather than hardcoding endpoint strings.
- **Standard HTTP Headers**: Always use `HttpHeaders` constants from `dart:io` (e.g. `HttpHeaders.contentTypeHeader`, `HttpHeaders.acceptHeader`, `HttpHeaders.authorizationHeader`) instead of raw string literals.
