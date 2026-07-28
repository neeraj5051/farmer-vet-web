# Enterprise Disease Management Module (CRUD + Image Management)

You are a Senior Full Stack Software Engineer and Enterprise UI Architect with 15+ years of experience building enterprise healthcare SaaS platforms.

You are working on **Humal**, India's Digital Livestock Healthcare & Breeding Platform.

Your task is to build a **production-ready Disease Management Module** for the Admin Dashboard.

The implementation must follow the existing project architecture, coding standards, design system, and documentation guidelines.

---

# Objectives

Build a complete enterprise-grade Disease Management module with:

- Disease CRUD
- Disease Group CRUD
- Image Upload
- Image Preview
- Image Versioning
- Image Replace
- Image Delete
- Search
- Filters
- Pagination
- Validation
- Responsive UI
- Accessibility
- Optimized performance

The implementation must be production ready.

---

# Existing Architecture

Before implementing anything:

Review the existing project architecture.

Understand:

- Backend folder structure
- Frontend feature structure
- Existing image upload implementation
- Existing API patterns
- Existing form validation
- Existing reusable components
- Existing modal and drawer components

Reuse existing architecture wherever possible.

Avoid duplicate implementations.

---

# Disease Group Module

Implement complete CRUD for Disease Groups.

Route

/admin-v2/disease-groups

Features

- List
- Search
- Pagination
- Create
- Edit
- Delete
- Soft Delete (if applicable)
- Restore (if supported)

Fields

- Name
- Hindi Name
- Description
- Display Order
- Active Status
- Icon (future ready)

Validation

- Required fields
- Duplicate name validation
- Character limits

---

# Disease Module

Route

/admin-v2/diseases

Implement complete CRUD.

Features

- List Diseases
- Search
- Filters
- Pagination
- Sorting
- Create
- Edit
- Delete
- View Details
- Duplicate prevention

---

# Disease Fields

Support all existing database fields.

Examples

- Disease Name
- Hindi Name
- Category
- Disease Group
- Description
- Description Hindi
- Symptoms
- Symptoms Hindi
- Causes
- Causes Hindi
- Treatments
- Treatments Hindi
- Prevention
- Prevention Hindi
- Species
- Body System
- Pathogen Type
- Pathogen Name
- Severity
- Is Common Disease
- Active Status

Review the database and include any additional fields that already exist.

---

# Image Management

Integrate with the existing Image Versioning System.

Support:

Original

Thumbnail

Medium

Large

Store only image metadata in the database.

Do not duplicate image processing logic.

Reuse existing services.

---

# Image Upload

Allow

- Drag & Drop
- Click to Upload
- Replace Image
- Remove Image
- Crop (future ready)
- Preview before upload

Validation

- File Type
- File Size
- Dimensions (if required)

Supported

JPG

PNG

WEBP

---

# Image Preview

Implement:

- Thumbnail preview in tables
- Medium preview in detail page
- Full screen image viewer
- Zoom
- Download
- Open in new tab

Lazy load images.

---

# Disease List

Columns

- Image
- Disease Name
- Hindi Name
- Disease Group
- Category
- Species
- Severity
- Common Disease
- Status
- Last Updated
- Actions

Actions

View

Edit

Delete

---

# Disease Details Drawer

Create a modern details drawer.

Display

- Large Image
- English Information
- Hindi Information
- Symptoms
- Causes
- Treatments
- Prevention
- Metadata
- Created By
- Updated By
- Created Date
- Updated Date

---

# Search

Allow searching by:

Disease Name

Hindi Name

Disease Group

Category

Species

Severity

Common Disease

Status

---

# Filters

Implement filters

Disease Group

Category

Species

Severity

Status

Common Disease

Date Range

Clear Filters

---

# Bulk Operations

Support:

Bulk Delete

Bulk Status Update

Bulk Export

Bulk Import (future ready)

---

# Forms

Every form must include

Real-time validation

Inline errors

Loading state

Success feedback

Error feedback

Unsaved changes warning

Confirmation dialogs

---

# UI Components

Reuse existing shared components whenever possible.

Examples

DataTable

SearchBar

FilterBar

StatusBadge

PageHeader

ImageUploader

ImageViewer

Drawer

Modal

ConfirmDialog

Pagination

EmptyState

LoadingSkeleton

Avoid duplicate UI.

---

# API Layer

Review existing APIs.

Reuse patterns.

Implement:

GET

POST

PUT

DELETE

PATCH (if required)

Maintain consistency with existing response format.

---

# Backend

Review existing models.

Review services.

Review repositories.

Review routes.

Review schemas.

Refactor if necessary.

Follow:

Clean Architecture

SOLID

Repository Pattern

Service Layer

Dependency Injection

---

# Database

Review current schema.

Generate Alembic migrations if required.

Ensure:

Indexes

Constraints

Foreign Keys

Cascade behaviour

Soft delete strategy

---

# Performance

Optimise

Image loading

Pagination

Database queries

Search

Caching (if existing)

Avoid N+1 queries.

---

# Accessibility

Support

Keyboard navigation

Screen readers

Proper labels

Focus management

WCAG AA

---

# Responsive Design

Support

Desktop

Tablet

Mobile

Maintain consistency with the Humal V2 Design System.

---

# Error Handling

Provide

User friendly errors

API errors

Validation errors

Upload errors

Network errors

Retry options

---

# Documentation

Update

docs/

Create

docs/disease-management.md

Include

Architecture

API

Database

Image Management

Validation Rules

Search

Filters

Future Enhancements

Add Mermaid diagrams where useful.

---

# Knowledge Base

Update

docs/knowledge-base/

Update

PROJECT_CONTEXT.md

Document

- Disease Module
- Disease Group Module
- Image Upload Flow
- Image Versioning
- CRUD Standards

---

# Testing

Create

Unit Tests

API Tests

Integration Tests

Image Upload Tests

Validation Tests

CRUD Tests

Search Tests

Filter Tests

Performance Tests

---

# Final Deliverables

Provide:

1. Disease Group CRUD
2. Disease CRUD
3. Image Upload
4. Image Replace
5. Image Delete
6. Image Preview
7. Image Viewer
8. Search
9. Filters
10. Pagination
11. Validation
12. Responsive UI
13. Documentation
14. Knowledge Base Updates
15. Test Coverage

---

# Engineering Standards

Follow

- SOLID
- DRY
- KISS
- YAGNI
- Clean Architecture
- Repository Pattern
- Service Layer
- Dependency Injection

Avoid

- Duplicate code
- Business logic inside controllers
- Business logic inside React components
- Hardcoded values
- Tight coupling

Always review the existing implementation before making changes.

Prefer refactoring and reusing existing components over creating new ones.

Treat this as a production-ready enterprise module that will be used by administrators managing livestock diseases across the Humal platform.