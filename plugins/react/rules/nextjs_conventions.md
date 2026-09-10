# Next.js App Router & React Conventions

Architectural rules for Next.js App Router (v14+ / v15+), Server vs. Client Component boundaries, Server Actions, and data fetching.

---

## 1. Server Components by Default

- **Default to React Server Components (RSC)**: Do NOT add `'use client'` unless the component strictly requires:
  - React state / lifecycle hooks (`useState`, `useEffect`, `useReducer`, `useRef`).
  - Browser APIs (`window`, `localStorage`, geolocation, canvas).
  - Event listeners directly on the DOM (e.g. `onClick`, `onChange`, `onSubmit` in interactive widgets).
- **Push `'use client'` to the Leaves**: Keep page layouts, data-fetching wrappers, and static shells as Server Components, and isolate interactive controls (e.g. `LikeButton`, `SearchBar`) into granular Client Component leaves.

---

## 2. Data Fetching & Mutations (Server Actions)

- **Direct Async Server Fetching**: In Server Components, fetch data directly using `async/await` with `fetch()` or database ORMs (e.g., Prisma / Drizzle).
- **Server Actions for Mutations**:
  - Declare Server Actions in dedicated action files marked with `'use server'` or inline inside server functions.
  - Always validate incoming FormData or JSON arguments using a schema validator like `zod`.
  - Return typed result objects `{ success: boolean, data?: T, error?: string }` instead of throwing unhandled exceptions across the RPC boundary.

```typescript
// app/actions/auth.ts
'use server';

import { z } from 'zod';

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function loginAction(formData: FormData) {
  const parsed = LoginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { success: false, error: 'Invalid email or password format.' };
  }
  // Perform authentication logic...
  return { success: true };
}
```

---

## 3. Directory & Routing Conventions

```text
app/
├── (auth)/                      # Route group (shared auth layout, unauthenticated)
│   ├── login/
│   └── register/
├── (dashboard)/                 # Route group (authenticated app shell)
│   ├── settings/
│   └── page.tsx
├── api/                         # Route handlers (if webhooks / public APIs needed)
├── layout.tsx                   # Root layout
└── globals.css
```
