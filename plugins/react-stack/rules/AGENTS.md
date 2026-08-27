# React & Next.js Stack Architectural Guidelines & Rules

This document consolidates architectural standards, App Router conventions, and Tailwind CSS guidelines.

---

## 1. Rule Scoping Protocol (`00_meta_rules.md`)
- When asked to record or update architectural guidelines, **always ask the user** whether the change belongs in the **Central Registry** (shared) or **Project-Level Override** (local).
- See detailed protocol: [00_meta_rules.md](./00_meta_rules.md).

---

## 2. Next.js App Router & RSC Standards (`nextjs_conventions.md`)
- Default to React Server Components (RSC).
- Push `'use client'` to the leaf components.
- Use Server Actions with `zod` validation for mutations.
- See detailed rules: [nextjs_conventions.md](./nextjs_conventions.md).

---

## 3. Tailwind CSS & Styling Guidelines (`tailwind_conventions.md`)
- Systematic utility ordering (Layout > Position > Spacing > Typography > Visuals > Interactive > Responsive).
- Use `cn()` helper with `clsx` and `tailwind-merge` for conditional classes.
- Avoid hardcoded arbitrary values; use theme tokens.
- See detailed rules: [tailwind_conventions.md](./tailwind_conventions.md).
