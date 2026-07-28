# 🐄 Humal Admin Dashboard — Project Context & Living Knowledge Base

Welcome to the **Humal Enterprise Admin Console (V2)** knowledge base. This repository powers India's digital livestock healthcare and breeding platform, connecting farmers with licensed veterinarians.

---

## 🚀 Quick Reference

- **Product Philosophy**: Not a consumer app — a data-rich, enterprise SaaS analytics platform (inspired by Stripe, Shopify, Salesforce Lightning).
- **Core Business Levers**:
  1. **Operations** (`/admin-v2/operations`): Platform efficiency, bookings, live consultations, vet/farmer health.
  2. **Financials** (`/admin-v2/financials`): Gross revenue, commission take-rate, GST, vet payouts, settlements.
- **Primary Color Palette**: Off-white background (`#f8fafc`), white cards with subtle border shadows (`#ffffff`), and **Humal Green** (`#0a4f32`).

---

## 📚 Living Knowledge Base Index

All core system documentation is maintained under [`docs/knowledge-base/`](file:///Users/neerajagrawal/Desktop/Humal/farmer-vet-web/docs/knowledge-base/):

| Document | Description |
|----------|-------------|
| 📌 [Project Overview](file:///Users/neerajagrawal/Desktop/Humal/farmer-vet-web/docs/knowledge-base/project-overview.md) | Business goals, 4 core services, target personas |
| 🏗️ [Architecture](file:///Users/neerajagrawal/Desktop/Humal/farmer-vet-web/docs/knowledge-base/architecture.md) | React + Vite + TypeScript architecture, V1 vs V2 route isolation |
| 📁 [Folder Structure](file:///Users/neerajagrawal/Desktop/Humal/farmer-vet-web/docs/knowledge-base/folder-structure.md) | Standard directory layout for layouts, pages, components, context, and services |
| 📏 [Coding Standards](file:///Users/neerajagrawal/Desktop/Humal/farmer-vet-web/docs/knowledge-base/coding-standards.md) | SOLID, DRY, KISS guidelines, TypeScript typing, error handling |
| 🎨 [UI Design System](file:///Users/neerajagrawal/Desktop/Humal/farmer-vet-web/docs/knowledge-base/ui-design-system.md) | 12-column grid, persistent navigation, color tokens, typography |
| 🖼️ [Image Processing](file:///Users/neerajagrawal/Desktop/Humal/farmer-vet-web/docs/knowledge-base/image-processing.md) | WebP multi-version integration (thumbnail, medium, large, original) |
| 🔑 [Authentication](file:///Users/neerajagrawal/Desktop/Humal/farmer-vet-web/docs/knowledge-base/authentication.md) | AuthContext, JWT tokens, role-based access control (Admin vs Support) |
| 📡 [API Conventions](file:///Users/neerajagrawal/Desktop/Humal/farmer-vet-web/docs/knowledge-base/api-conventions.md) | RESTful API response schemas, axios interceptors, error handling |
| ⚠️ [Technical Debt](file:///Users/neerajagrawal/Desktop/Humal/farmer-vet-web/docs/knowledge-base/technical-debt.md) | Known debt, refactoring history, and tracking |
| 🗺️ [Roadmap](file:///Users/neerajagrawal/Desktop/Humal/farmer-vet-web/docs/knowledge-base/roadmap.md) | V2 migration roadmap and upcoming feature releases |
| 📝 [Changelog](file:///Users/neerajagrawal/Desktop/Humal/farmer-vet-web/docs/knowledge-base/changelog.md) | Complete version history and release logs |

---

## 🛠️ Technology Stack

- **Framework**: React 19 + TypeScript + Vite
- **Routing**: React Router v7 (`/admin-v2/*` for new enterprise dashboard, `/admin/*` for legacy app)
- **Icons**: Lucide React (`lucide-react`)
- **Charts**: Recharts (`recharts`)
- **HTTP Client**: Axios (`axios`)
- **Styling**: Vanilla CSS / CSS Modules with CSS Variables (`:root`)
