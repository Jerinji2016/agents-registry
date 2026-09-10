---
name: tailwind-helper
description: >-
  Assists in constructing responsive layouts, converting custom CSS to Tailwind CSS classes, and optimizing design tokens in Next.js / React components.
---

# Tailwind Helper Skill

Guidance and recipes for constructing Tailwind CSS layouts and components.

## 1. Responsive Layout Patterns

### Flexbox Centering Shell
```tsx
<div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4">
  <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
    {/* Card Content */}
  </div>
</div>
```

### Responsive Grid with Auto-fit
```tsx
<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
  {items.map((item) => (
    <Card key={item.id} item={item} />
  ))}
</div>
```

## 2. Dynamic State Patterns (Data Attributes)

When working with Radix UI or headless UI primitives, use `data-[state=open]` variants:

```tsx
<button className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-600 hover:text-slate-900">
  Tab
</button>
```
