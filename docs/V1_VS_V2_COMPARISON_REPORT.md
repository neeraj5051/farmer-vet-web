# 📊 V1 vs V2 Admin Dashboard Module Comparison & Gap Analysis

**Date:** July 28, 2026  
**Platform:** Humal Admin Console (India's Digital Livestock Healthcare & Breeding Platform)  
**Document Purpose:** Comprehensive audit comparing the live legacy V1 Admin Dashboard (`/admin/*`) against the new V2 Enterprise Admin Dashboard (`/admin-v2/*`).

---

## 1. Executive Summary & Comparison Matrix

| # | Module / Feature Area | V1 Route (`/admin/*`) | V2 Status (`/admin-v2/*`) | Category | Parity Status |
|---|-----------------------|------------------------|---------------------------|----------|---------------|
| 1 | **Operations Overview** | `/admin` | `/admin-v2/operations` | Operations | ✅ **Implemented** |
| 2 | **Bookings List & Details** | `/admin/consultations` | `/admin-v2/bookings` | Operations | ✅ **Implemented** |
| 3 | **Live Consultations** | `/admin/consultations` | `/admin-v2/consultations` | Operations | ✅ **Implemented** |
| 4 | **Farmer Management** | `/admin/users` | `/admin-v2/farmers` | Operations | ✅ **Implemented** |
| 5 | **Veterinarian Management** | `/admin/users` | `/admin-v2/vets` | Operations | ✅ **Implemented** |
| 6 | **Financial Overview** | `/admin/financials` | `/admin-v2/financials` | Financials | ✅ **Implemented** |
| 7 | **Revenue Analytics** | `/admin/payments` | `/admin-v2/revenue` | Financials | ✅ **Implemented** |
| 8 | **Vet Payouts & Settlements** | `/admin/payments` | `/admin-v2/payouts` | Financials | ✅ **Implemented** |
| 9 | **Financial Transactions** | `/admin/payments` | `/admin-v2/transactions` | Financials | ✅ **Implemented** |
| 10 | **Manage Diseases Catalog** | `/admin/diseases` | *None* | Catalogs | ❌ **MISSING IN V2** |
| 11 | **Manage Articles & Blogs** | `/admin/articles` | *None* | Catalogs | ❌ **MISSING IN V2** |
| 12 | **Manage Vaccine Catalog** | `/admin/vaccines` | *None* | Catalogs | ❌ **MISSING IN V2** |
| 13 | **Manage Platform Fee Structure** | `/admin/fees` | *None* | Configuration | ❌ **MISSING IN V2** |
| 14 | **Manage Service Action Cards** | `/admin/service-cards` | *None* | Configuration | ❌ **MISSING IN V2** |
| 15 | **Support Tickets Management** | `/admin/support` | *None* | Operations | ❌ **MISSING IN V2** |
| 16 | **Service Offerings Management** | `/admin/services` | *None* | Configuration | ❌ **MISSING IN V2** |
| 17 | **Reports & Export Center** | `/admin/reports` | `/admin-v2/reports` | Reports | ⚠️ **Stub / Pending** |
| 18 | **System Settings & Roles** | `/admin/settings` | `/admin-v2/settings` | Settings | ⚠️ **Stub / Pending** |

---

## 2. Detailed Audit of Missing V2 Modules

### 🦠 1. Disease Catalog Management (`/admin/diseases`)
- **V1 Implementation**: `ManageDiseases.tsx`
- **Current V2 Status**: Missing.
- **Key Features Required for V2**:
  - List, search, and filter livestock diseases by category (Bacterial, Viral, Parasitic, Fungal, Metabolic).
  - Add / Edit disease records including symptoms, causes, treatments, and prevention measures.
  - Multi-language fields (English + Hindi `name_hi`, `symptoms_hi`, `treatment_hi`).
  - Image upload with auto-generation of WebP variants (`thumbnail`, `medium`, `large`).

### 📰 2. Articles & Farmer Advisory Publisher (`/admin/articles`)
- **V1 Implementation**: `ManageArticles.tsx`
- **Current V2 Status**: Missing.
- **Key Features Required for V2**:
  - Article list with category tabs (Cattle, Poultry, Goat, Swine, General).
  - Draft vs. Published status toggles.
  - Rich text content editor + Hindi translation content fields (`title_hi`, `content_hi`).
  - Cover image manager with WebP variant support.

### 💉 3. Vaccine Catalog Management (`/admin/vaccines`)
- **V1 Implementation**: `VaccineManagement.tsx`
- **Current V2 Status**: Missing.
- **Key Features Required for V2**:
  - Catalog of mandatory livestock vaccines (FMD, HS, BQ, Anthrax, Brucellosis).
  - Pathogen type, target animals, dosage schedule, and seasonal timing filters (Pre-Monsoon, Winter).
  - Base pricing and cover image management.

### ⚙️ 4. Fee & Commission Structure (`/admin/fees`)
- **V1 Implementation**: `ManageFees.tsx`
- **Current V2 Status**: Missing.
- **Key Features Required for V2**:
  - Configure platform commission rates (e.g. 15% platform fee).
  - Base consultation fees for Online vs. In-Person Visit categories.
  - Maximum fee caps for Artificial Insemination (AI) and Vaccination.
  - Statutory tax (GST 18%) configuration toggles.

### 🎛️ 5. Service Action Cards Manager (`/admin/service-cards`)
- **V1 Implementation**: `ManageServiceCards.tsx`
- **Current V2 Status**: Missing.
- **Key Features Required for V2**:
  - Configure the 4 main mobile app home screen cards ("Online Consultation", "In-Person Visit", "Artificial Insemination", "Vaccinations").
  - Title and subtitle localization (English & Hindi).
  - Display order index ranking.
  - Custom background image upload.

### 🎧 6. Support Ticket Center (`/admin/support`)
- **V1 Implementation**: `SupportTickets.tsx`
- **Current V2 Status**: Missing.
- **Key Features Required for V2**:
  - Centralized support inbox for tickets raised by Farmers and Veterinarians.
  - Priority badge filters (Low, Medium, High, Urgent).
  - Attached screenshot/image viewer.
  - Reply log timeline & ticket status update drawer (Open, In Progress, Resolved, Closed).

### 🛠️ 7. Global Service Offerings (`/admin/services`)
- **V1 Implementation**: `ServicesManagement.tsx`
- **Current V2 Status**: Missing.
- **Key Features Required for V2**:
  - Master service category configuration.
  - Default consultation time slots (15m, 20m, 30m).
  - Active status switches for online vs. field visit offerings.

### 📄 8. Bulk Reports & Export Center (`/admin-v2/reports`)
- **V1 Implementation**: `ReportsPage.tsx`
- **Current V2 Status**: Currently stubbed (`Content coming soon`).
- **Key Features Required for V2**:
  - Asynchronous report generation for custom date ranges and state/district filters.
  - One-click CSV and PDF exports for Bookings, Financial Revenue, Vet Payouts, and Tax GST compliance filings.

---

## 3. Migration & Implementation Strategy

To complete the V2 Admin Dashboard refactoring:

```
                                  [ V2 ADMIN DASHBOARD ]
                                             │
      ┌──────────────────────────────────────┼──────────────────────────────────────┐
      ▼                                      ▼                                      ▼
[ PHASE 1: CATALOGS ]              [ PHASE 2: CONFIG & LEVERS ]            [ PHASE 3: SUPPORT & REPORTS ]
- Diseases (/admin-v2/diseases)    - Platform Fees (/admin-v2/fees)        - Support Tickets (/admin-v2/support)
- Vaccines (/admin-v2/vaccines)    - Service Cards (/admin-v2/service-cards)- Export Reports (/admin-v2/reports)
- Articles (/admin-v2/articles)    - Services Config (/admin-v2/services)  - System Settings (/admin-v2/settings)
```

---

## 4. Verification & Parity Target

Once Phases 1, 2, and 3 are complete:
- The legacy `/admin` routes can be safely deprecated.
- The V2 Enterprise Admin Dashboard (`/admin-v2`) will achieve **100% feature parity** with V1 while adhering strictly to **Stripe/Shopify enterprise styling**, **Humal Green aesthetics**, and **12-column responsive layout guidelines**.
