# Testing & Configuration Guidelines

Standards for unit testing, component testing, E2E testing, and 12-factor configuration management in React web applications.

---

## 1. Testing Standards

### Hierarchy of Tests

| Level | Target | Primary Tool | Scope |
| :--- | :--- | :--- | :--- |
| **Unit Tests** | Services, utility functions, custom hooks | Vitest / Jest + `@testing-library/react` (`renderHook`) | Verify pure functions, data transformers, hook lifecycle & mutations. |
| **Component Tests** | Shared UI primitives & Feature components | React Testing Library + Mock Service Worker (MSW) | Verify user interaction (`userEvent`), accessible queries (`getByRole`), conditional UI. |
| **E2E Tests** | Critical business flows (Auth, Checkout) | Playwright / Cypress | Verify multi-page user journeys against mock or staging backends. |

### Hook Testing Example

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { useUserProfile } from './useUserProfile';
import { createWrapper } from '@/test/utils';

test('fetches and returns user profile data', async () => {
  const { result } = renderHook(() => useUserProfile('user_123'), {
    wrapper: createWrapper(),
  });

  await waitFor(() => expect(result.current.isLoading).toBe(false));
  expect(result.current.user?.fullName).toBe('Alice Smith');
});
```

---

## 2. Configuration Standards

1. **Environment Variables**: Store runtime variables in `.env.local` / `.env.production` prefixed by the build tool namespace (e.g., `VITE_API_URL` or `NEXT_PUBLIC_API_URL`).
2. **Centralized Config with Validation**: Validate all environment variables upon startup in `src/core/config/env.ts` using `zod`:

```typescript
// src/core/config/env.ts
import { z } from 'zod';

const envSchema = z.object({
  API_URL: z.string().url(),
  APP_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  ENABLE_ANALYTICS: z.string().transform((val) => val === 'true').default('false'),
});

export const envConfig = envSchema.parse({
  API_URL: import.meta.env.VITE_API_URL || process.env.NEXT_PUBLIC_API_URL,
  APP_ENV: import.meta.env.VITE_APP_ENV || process.env.NODE_ENV,
  ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS || process.env.NEXT_PUBLIC_ENABLE_ANALYTICS,
});
```

3. **Zero Secrets in Frontend Bundles**: Never embed backend database keys, secret signing keys, or payment private keys in client-side code.
