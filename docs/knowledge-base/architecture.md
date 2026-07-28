# 🏗️ Architecture & Route Isolation

## 1. High-Level Architecture

```
[ Web Browser ]
      │
      ├─► React Router v7
      │       ├─► /admin/*     (Legacy V1 Application)
      │       └─► /admin-v2/*  (New Enterprise V2 Application)
      │
      └─► Axios Services Layer (`src/services/adminService.ts`)
              │
              └─► REST API (FastAPI Backend)
```

## 2. Route Isolation Principle
To prevent breaking live production users currently accessing `/admin`:
- **V1 Routes (`/admin/*`)**: Untouched legacy routes using `DashboardLayout`.
- **V2 Routes (`/admin-v2/*`)**: Isolated enterprise routes wrapped in `AdminLayoutV2` and `FilterProvider`.

## 3. Global Filter Architecture
All V2 screens inherit from `FilterContext` (`useFilters()`):
- **Date Range**: Today, This Week, This Month, All Time, or Custom Range modal.
- **State**: District/state filters (Bihar, UP, Rajasthan, MP, Maharashtra, etc.).
- **Service Type**: Online, In-Person, AI, Vaccination.
