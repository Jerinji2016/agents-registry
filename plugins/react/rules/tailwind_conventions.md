# Tailwind CSS Conventions & Design Tokens

Styling rules, class ordering, component extraction patterns, and design system integration.

---

## 1. Class Ordering & Formatting

- Maintain consistent utility ordering:
  1. **Layout / Display**: `flex`, `grid`, `block`, `hidden`, `inline-flex`
  2. **Positioning**: `absolute`, `relative`, `fixed`, `top-0`, `z-10`
  3. **Box Model / Spacing**: `w-*`, `h-*`, `p-*`, `px-*`, `py-*`, `m-*`, `gap-*`
  4. **Typography**: `text-sm`, `font-bold`, `tracking-wide`, `text-slate-900`
  5. **Visuals / Borders / Backgrounds**: `bg-white`, `rounded-xl`, `border`, `shadow-md`
  6. **Interactive / States**: `hover:...`, `focus:...`, `active:...`, `disabled:...`
  7. **Responsive Variants**: `sm:...`, `md:...`, `lg:...`, `xl:...`

---

## 2. Dynamic Classes & Merging (`cn` utility)

- **Never concatenate raw class strings conditionally with `+` or string templates**.
- Always use `clsx` and `tailwind-merge` via a standard `cn()` helper:

```typescript
// lib/utils.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

```tsx
// ✅ Usage in component
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
}

export function Button({ variant = 'primary', className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors',
        variant === 'primary' && 'bg-blue-600 text-white hover:bg-blue-700',
        variant === 'secondary' && 'bg-slate-100 text-slate-900 hover:bg-slate-200',
        variant === 'danger' && 'bg-red-600 text-white hover:bg-red-700',
        className
      )}
      {...props}
    />
  );
}
```

---

## 3. Avoid Inline Arbitrary Values
- ❌ Avoid excessive arbitrary pixel values like `w-[347px]` or `bg-[#1a2b3c]`.
- ✅ Configure custom spacing, colors, and border radii inside `tailwind.config.js` or CSS variables in `globals.css`.
