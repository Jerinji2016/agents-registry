# React Web Application Architectural Guidelines & Conventions

This master document consolidates architectural standards, feature-driven project structure, the `UI → Hooks → Services → API` dependency rule, state management (TanStack Query / Zustand), component purity, and Tailwind styling for React web applications.

---

## 1. Rule Scoping Protocol (`00_meta_rules.md`)
- When asked to record or update architectural guidelines, **always ask the user** whether the change belongs in the **Central Registry** (shared) or **Project-Level Override** (local).
- See detailed protocol: [00_meta_rules.md](./00_meta_rules.md).

---

## 2. Feature-Driven Architecture & Dependency Flow (`clean_architecture.md`)
- **Structure**:
  - `src/features/<feature>/`: `components/`, `pages/`, `hooks/`, `services/`, `state/`.
  - `src/core/`: `api/`, `config/`, `constants/`, `utils/`.
  - `src/shared/`: Reusable primitives (`components/`, `hooks/`).
- **Unidirectional Dependency Rule (NON-NEGOTIABLE)**:
  `UI → Hooks → Services → API`
- **Service Isolation**: Services handle API communication and data mapping; services must **NEVER** import React or JSX.
- See detailed rules: [clean_architecture.md](./clean_architecture.md).

---

## 3. Component Standards & Custom Hooks (`component_standards.md`)
- **Component Purity**: Small, functional components receiving data via props. No business logic or direct API calls in components.
- **Custom Hooks**: Encapsulate all side effects, server query hooks, and business logic.
- **Performance**: Targeted memoization (`useMemo`, `useCallback`) and route-level code splitting (`React.lazy`).
- See detailed rules: [component_standards.md](./component_standards.md).

---

## 4. State Management & Centralized API (`state_api_management.md`)
- **Server State**: Managed strictly by **TanStack Query (React Query)** (caching, deduplication, loading states).
- **Client State**: Minimal and normalized, managed locally by `useState` or globally by **Zustand**.
- **Centralized API Client**: All requests route through `src/core/api/client.ts` with interceptors and response transformers.
- See detailed rules: [state_api_management.md](./state_api_management.md).

---

## 5. Styling & Tailwind CSS Conventions (`styling_tailwind.md`)
- **Scoped Styles**: Use Tailwind CSS or CSS Modules; eliminate arbitrary inline styles for complex layouts.
- **Dynamic Merging**: Use `cn()` utility (`clsx` + `tailwind-merge`).
- **Utility Ordering**: Layout $\rightarrow$ Position $\rightarrow$ Box/Spacing $\rightarrow$ Typography $\rightarrow$ Visuals $\rightarrow$ Interactive $\rightarrow$ Responsive.
- See detailed rules: [styling_tailwind.md](./styling_tailwind.md).

---

## 6. Testing & Configuration Standards (`testing_configuration.md`)
- **Testing**: Unit test services and hooks (`renderHook`), component tests with React Testing Library, and critical path E2E tests with Playwright.
- **Configuration**: 12-factor `.env` loaded and validated with `zod` in `src/core/config/env.ts`. Zero secrets in client bundles.
- See detailed rules: [testing_configuration.md](./testing_configuration.md).

---

## 🔄 Mandatory Development Workflow

1. **Define Feature Scope**: Identify data models, routes, and UI requirements.
2. **Implement Service Layer**: Create API functions and response mappers in `features/<feature>/services/`.
3. **Build Custom Hooks**: Wrap queries and mutations with TanStack Query in `features/<feature>/hooks/`.
4. **Construct UI Components**: Build small, pure presentation components in `features/<feature>/components/`.
5. **Integrate Global/Local State**: Wire Zustand slices or local states if needed.
6. **Add Automated Tests**: Write unit tests for hooks/services and component interaction tests.

---

## 🧪 Validation Checklist

Before committing React frontend code:
- [ ] Components are pure, small, and reusable
- [ ] Zero direct API calls (`fetch`/`axios`) inside components
- [ ] Custom hooks encapsulate business logic and data fetching
- [ ] Server state uses TanStack Query; client state uses Zustand/`useState`
- [ ] Dynamic classes use `cn()` utility
- [ ] No hardcoded secrets or environment URLs
- [ ] Unit/hook tests added for critical logic

---

## 🧠 Decision Heuristics

| Situation | Action |
| :--- | :--- |
| Need API communication | Create service in `features/<feature>/services/` |
| Need data fetching or business logic in UI | Create custom hook in `features/<feature>/hooks/` |
| State shared across multiple features | Create Zustand store in `features/<feature>/state/` or `src/shared/` |
| State local to single widget | Use `useState` |
| Component exceeding ~150 lines | Split into smaller sub-components |

---

## 🧭 Golden Rules

> ❗ **Components render, hooks manage logic, services fetch data.**

> ❗ **If your component knows about API details $\rightarrow$ you broke the architecture.**

> ❗ **If logic is duplicated $\rightarrow$ extract it into hooks or services.**
