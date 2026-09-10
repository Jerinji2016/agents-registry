# Serialization, DTOs & Network Communication Standards

Guidelines for Freezed models, JSON serialization, domain mappers, and Retrofit network clients.

---

## 1. Freezed 2.4+ / 3.0 Model Standards

- All Data Transfer Objects (DTOs) and API request/response payloads MUST use **Freezed** with `json_serializable`.
- Always declare the required `part` directives:
  - `part '<filename>.freezed.dart';`
  - `part '<filename>.g.dart';`

```dart
// ✅ GOOD: Standard Freezed DTO
import 'package:freezed_annotation/freezed_annotation.dart';

part 'user_dto.freezed.dart';
part 'user_dto.g.dart';

@freezed
abstract class UserDto with _$UserDto {
  const factory UserDto({
    required String id,
    required String email,
    @JsonKey(name: 'first_name') required String firstName,
    @JsonKey(name: 'last_name') required String lastName,
    @Default(false) bool isActive,
  }) = _UserDto;

  factory UserDto.fromJson(Map<String, dynamic> json) => _$UserDtoFromJson(json);
}
```

---

## 2. DTO to Domain Mapping Pattern

- DTOs represent wire-format schemas and must not leak into domain logic.
- Use explicit Dart extensions for converting between DTOs and Domain Entities:

```dart
// lib/src/features/auth/data/mappers/user_mapper.dart
import '../../domain/models/user.dart';
import '../dtos/user_dto.dart';

extension UserDtoMapper on UserDto {
  User toDomain() {
    return User(
      id: id,
      email: email,
      fullName: '$firstName $lastName'.trim(),
      isActive: isActive,
    );
  }
}

extension UserDomainMapper on User {
  UserDto toDto() {
    return UserDto(
      id: id,
      email: email,
      firstName: fullName.split(' ').first,
      lastName: fullName.split(' ').skip(1).join(' '),
      isActive: isActive,
    );
  }
}
```

---

## 3. Retrofit & Streaming Endpoints

- When implementing Retrofit client endpoints that handle streaming (Server-Sent Events / SSE / Chunked streams) or raw JSON string parsing:
  - **Always import `dart:convert`** for `jsonDecode` / `utf8` transformations.
  - Set the return type as `Stream<ResponseBody>` or `Stream<List<int>>` and pipe through a line splitter / stream transformer.
  - Set appropriate `@DioResponseType(ResponseType.stream)`.
