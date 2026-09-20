---
name: react-feature-scaffold
description: >-
  Scaffolds a new feature module in React web applications following the clean architecture UI -> Hooks -> Services -> API flow, generating components, pages, custom hooks, services, and state slices.
---

# React Feature Scaffold Skill

Use this skill when introducing a new feature package under `src/features/<feature>/` in a React web application.

---

## 1. Feature Directory Structure

For a feature named `<feature>` (e.g. `auth`, `products`, `billing`), generate:

```text
src/features/<feature>/
├── components/
│   └── <Feature>Card.tsx       # Pure presentation UI component
├── pages/
│   └── <Feature>Page.tsx       # Route page assembling components & hooks
├── hooks/
│   └── use<Feature>.ts         # TanStack Query & business logic hook
├── services/
│   └── <feature>Service.ts     # API client calls & data transformers
├── state/
│   └── use<Feature>Store.ts    # Zustand client state (if needed)
└── types/
    └── index.ts                # Feature-specific TypeScript interfaces
```

---

## 2. Standard Feature Code Templates

### Step 1: Types & Service (`services/<feature>Service.ts`)
```typescript
import { apiClient } from '@/core/api/client';
import type { Item, ItemDto } from '../types';

export const itemService = {
  async listItems(): Promise<Item[]> {
    const response = await apiClient.get<ItemDto[]>('/items');
    return response.data.map((dto) => ({
      id: dto.id,
      title: dto.title,
      createdAt: new Date(dto.created_at),
    }));
  },
};
```

### Step 2: Custom Hook (`hooks/use<Feature>.ts`)
```typescript
import { useQuery } from '@tanstack/react-query';
import { itemService } from '../services/itemService';

export function useItems() {
  const query = useQuery({
    queryKey: ['items'],
    queryFn: itemService.listItems,
  });

  return {
    items: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
```

### Step 3: Pure Presentation Component (`components/<Feature>List.tsx`)
```tsx
import type { Item } from '../types';

interface ItemListProps {
  items: Item[];
  onItemClick: (id: string) => void;
}

export function ItemList({ items, onItemClick }: ItemListProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <div 
          key={item.id} 
          onClick={() => onItemClick(item.id)}
          className="p-4 rounded-lg border bg-white shadow-sm hover:shadow transition cursor-pointer"
        >
          <h4 className="font-semibold text-slate-800">{item.title}</h4>
        </div>
      ))}
    </div>
  );
}
```
