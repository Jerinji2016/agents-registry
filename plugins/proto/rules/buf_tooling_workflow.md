# Buf Tooling & Development Workflow

Tooling standards, CI validation, code generation policies, and commit workflows for Protobuf repositories.

---

## 1. Buf Configuration & Tooling

Use [Buf](https://buf.build/) for linting, breaking change detection, and formatting.

### Root Configuration (`buf.yaml`)

```yaml
version: v1
lint:
  use:
    - DEFAULT
  except:
    - PACKAGE_VERSION_SUFFIX
breaking:
  use:
    - FILE
    - PACKAGE
```

---

## 2. Generated Code Policy

> [!IMPORTANT]
> **Generated code is NOT part of the Proto repository.**
> Generated code must live in consuming client/service repositories (e.g., via `buf.gen.yaml` or language-specific build scripts).

* Do not commit `.pb.go`, `.pb.dart`, or `.pb.ts` files to the central proto repository.
* Keep the proto repository strictly focused on source `.proto` contract definitions.

---

## 3. Mandatory Change Workflow

Follow this step-by-step workflow for every contract change:

1. **Impact Analysis**: Ensure changes are purely additive and do not alter existing field numbers or types.
2. **Apply Changes**: Edit `.proto` files in the appropriate `proto/<domain>/<version>/` directory.
3. **Format**: Run `buf format -w` to ensure consistent formatting.
4. **Lint**: Run `buf lint` to ensure zero style or syntax violations.
5. **Breaking Change Check**: Run `buf breaking --against '.git#branch=main'` to verify binary backward compatibility.
6. **Commit**: Use Conventional Commits format:
   ```bash
   git commit -am "feat(auth): add refresh token support to v1"
   ```
