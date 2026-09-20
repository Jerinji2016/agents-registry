# Styling & Tailwind CSS Conventions

Standards for styling React web applications, enforcing scoped styles, Tailwind CSS utility ordering, design token consistency, and helper utilities.

---

## 1. Styling Principles

1. **Scoped & Predictable**: Maintain modular styles using Tailwind CSS or CSS Modules to prevent global selector leakage.
2. **Design Tokens First**: Reference theme tokens (colors, font sizes, spacing scale, border radiuses) rather than hardcoded arbitrary hex codes or pixel values.
3. **No Inline Styles for Complex Layouts**: Reserve inline `style={{ ... }}` strictly for dynamic runtime-calculated values (e.g., CSS translate coordinates, drag offsets, dynamic chart heights).

---

## 2. Dynamic Class Merging (`cn` Utility)

Always merge dynamic and conditional class names using the `cn` utility function (`clsx` + `tailwind-merge`):

```typescript
// src/shared/utils/cn.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
```

### Usage Pattern

```tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({ variant = 'primary', size = 'md', className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-medium rounded-md transition focus:outline-none focus:ring-2',
        {
          'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500': variant === 'primary',
          'bg-slate-100 text-slate-800 hover:bg-slate-200 focus:ring-slate-400': variant === 'secondary',
          'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500': variant === 'danger',
          'px-2.5 py-1.5 text-xs': size === 'sm',
          'px-4 py-2 text-sm': size === 'md',
          'px-6 py-3 text-base': size === 'lg',
        },
        className
      )}
      {...props}
    />
  );
}
```

---

## 3. Tailwind Utility Ordering Hierarchy

When writing utility classes, organize them systematically from structural to interactive:

1. **Layout / Display**: `flex`, `grid`, `block`, `hidden`, `container`
2. **Positioning**: `absolute`, `relative`, `top-0`, `z-10`
3. **Box Model & Spacing**: `w-full`, `max-w-md`, `p-4`, `mx-auto`, `gap-4`
4. **Typography**: `text-sm`, `font-semibold`, `tracking-wide`, `text-slate-900`
5. **Visuals & Backgrounds**: `bg-white`, `rounded-xl`, `border`, `shadow-sm`
6. **Interactivity & Transitions**: `hover:bg-slate-50`, `focus:ring-2`, `transition duration-200`
7. **Responsive Variants**: `sm:p-6`, `md:grid-cols-2`, `lg:flex-row`
