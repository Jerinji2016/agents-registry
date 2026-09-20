# Component Standards & Lifecycle Guidelines

Rules for writing modular, pure, and testable React functional components, custom hooks, and performance optimizations.

---

## 1. Component Design Invariants

1. **Pure & Focused**: Components should have a single responsibility and focus on rendering UI from props and local display state.
2. **Functional Components Only**: Use standard functional components with TypeScript typing (`React.FC` or typed props parameters).
3. **Props for Data Flow**: Pass data and event callbacks downward through props; avoid hidden global dependencies.

```tsx
// ✅ Good: Pure, focused presentation component
interface UserCardProps {
  user: { id: string; name: string; email: string };
  onSelect: (id: string) => void;
}

export function UserCard({ user, onSelect }: UserCardProps) {
  return (
    <div className="rounded-lg border p-4 shadow-sm hover:shadow-md transition">
      <h3 className="font-medium text-slate-900">{user.name}</h3>
      <p className="text-sm text-slate-500">{user.email}</p>
      <button 
        onClick={() => onSelect(user.id)}
        className="mt-3 text-xs text-blue-600 hover:underline"
      >
        View Profile
      </button>
    </div>
  );
}
```

### ❌ Anti-Patterns
* ❌ Embedding business logic, data calculations, or validation rules inside JSX render functions.
* ❌ Making direct `fetch()` or `axios.get()` calls in component bodies or `useEffect`.
* ❌ Giant monolithic components (split components exceeding ~150 lines into sub-components).

---

## 2. Custom Hooks Guidelines

Encapsulate all business logic, side effects, and state orchestrations in custom hooks under `hooks/`:

* **Data Fetching Hooks**: Wrap TanStack Query or service calls.
* **Business Logic Hooks**: Orchestrate multi-step flows (e.g., multi-step forms, checkout steps).
* **UI State Hooks**: Manage drawer, modal, or filter toggles.

```tsx
// ✅ Good: Custom hook abstracting feature logic
export function useUserProfile(userId: string) {
  const query = useQuery({
    queryKey: ['user', userId],
    queryFn: () => userService.getProfile(userId),
    enabled: Boolean(userId),
  });

  const isVerified = query.data?.isEmailVerified ?? false;

  return {
    user: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    isVerified,
  };
}
```

---

## 3. Performance & Memoization

* **Targeted Memoization**: Use `useMemo` and `useCallback` for expensive data processing (sorting/filtering large lists) or stable function references passed to memoized children (`React.memo`).
* **Code Splitting**: Lazy load route pages and heavy secondary widgets (charts, rich text editors) using `React.lazy()` and `<Suspense>`.
* **Avoid Premature Optimization**: Do not wrap trivial inline primitives or lightweight calculations in `useMemo`.

---

## 4. Routing Standards

* Maintain centralized route definitions under `src/app/` or feature route configs.
* Route components in `pages/` assemble feature components and connect URL parameters (`useParams`, `useSearchParams`) to feature hooks.
