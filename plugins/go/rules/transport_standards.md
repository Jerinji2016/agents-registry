# Transport Standards (REST & gRPC)

Standards for transport layers in Go backend services, supporting dynamic HTTP/REST and gRPC transport protocols while maintaining strict isolation from business logic.

---

## 1. Transport Layer Invariants

1. **Transport is an Adapter**: Handlers exist solely to translate external network protocols (HTTP requests or gRPC RPC invocations) into domain method calls.
2. **Zero Business Logic**: Handlers must never perform business calculations, database queries, or data mutations directly.
3. **Structured Error Mapping**: Map domain errors cleanly to corresponding transport status codes (HTTP status codes or gRPC status codes).

---

## 2. HTTP / REST API Standards

### Request Handling & Validation

* Bind and decode incoming JSON payloads using explicit DTO structs.
* Validate input formats (required fields, string lengths, regex patterns) before invoking domain services.

```go
type CreateUserRequest struct {
    Email    string `json:"email"`
    Password string `json:"password"`
}

func (h *UserHandler) CreateUser(w http.ResponseWriter, r *http.Request) {
    var req CreateUserRequest
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        h.respondError(w, http.StatusBadRequest, "INVALID_PAYLOAD", "Malformed request body")
        return
    }
    
    if req.Email == "" || req.Password == "" {
        h.respondError(w, http.StatusBadRequest, "VALIDATION_FAILED", "Email and password are required")
        return
    }
    
    user, err := h.service.RegisterUser(r.Context(), req.Email, req.Password)
    if err != nil {
        h.mapDomainErrorToHTTP(w, err)
        return
    }
    
    h.respondJSON(w, http.StatusCreated, user)
}
```

### Standard Error Response Format

Always return consistent JSON error envelopes:

```json
{
  "error": {
    "code": "EMAIL_ALREADY_EXISTS",
    "message": "A user with this email address already exists."
  }
}
```

---

## 3. gRPC Transport Standards

### Status Code Mapping

When implementing gRPC service stubs, map domain errors to canonical `google.golang.org/grpc/codes`:

| Domain Error | gRPC Status Code | HTTP Equivalent |
| :--- | :--- | :--- |
| Validation Failure | `codes.InvalidArgument` | 400 Bad Request |
| Unauthenticated / Invalid Token | `codes.Unauthenticated` | 401 Unauthorized |
| Forbidden / Tenant Mismatch | `codes.PermissionDenied` | 403 Forbidden |
| Entity Not Found | `codes.NotFound` | 404 Not Found |
| Conflict / Already Exists | `codes.AlreadyExists` | 409 Conflict |
| Rate Limit Exceeded | `codes.ResourceExhausted` | 429 Too Many Requests |
| Internal Failure | `codes.Internal` | 500 Internal Server Error |

### Example gRPC Handler

```go
func (s *UserGrpcServer) GetUser(ctx context.Context, req *pb.GetUserRequest) (*pb.GetUserResponse, error) {
    if req.GetId() == "" {
        return nil, status.Error(codes.InvalidArgument, "user id is required")
    }
    
    user, err := s.service.GetUserByID(ctx, req.GetId())
    if err != nil {
        if errors.Is(err, model.ErrUserNotFound) {
            return nil, status.Error(codes.NotFound, "user not found")
        }
        return nil, status.Error(codes.Internal, "internal service error")
    }
    
    return &pb.GetUserResponse{
        User: &pb.User{
            Id:    user.ID,
            Email: user.Email,
        },
    }, nil
}
```
