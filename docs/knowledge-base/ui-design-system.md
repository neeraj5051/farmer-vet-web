# 🎨 UI Design System & Guidelines

## 1. Core Principles
- **Enterprise Aesthetics**: Clean, information-dense, modern SaaS interface (Stripe / Shopify style).
- **Color Palette**:
  - Background: Off-white (`#f8fafc`)
  - Primary Accent: **Humal Green** (`#0a4f32`)
  - Light Accent: `#e6f0eb`
  - Cards: Pure white (`#ffffff`) with subtle border `#e2e8f0` and soft shadows (`box-shadow: 0 1px 3px rgba(0,0,0,0.04)`).
  - Text Primary: `#1e293b`
  - Text Secondary: `#64748b`
- **Typography**: Google Fonts **Inter** (`'Inter', sans-serif`).
- **Icons**: Outline icons only via `lucide-react`.

## 2. Layout Structure
- **Persistent Left Navigation Bar**: 260px fixed sidebar containing Operations, Financials, Catalogs, Configuration, and Reports.
- **Sticky Top Bar**: Global Filters (Date Range, State, Service), Notifications, Admin Profile.
- **Main Analytics Workspace**: Responsive 12-column flex/grid container.
