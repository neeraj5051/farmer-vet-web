# Admin V2 Migration & Project Context Prompts

## Prompt 1 - V1 → V2 Enterprise Admin Dashboard Migration & Feature Parity

Use the migration prompt developed in this conversation to achieve 100%
feature parity between `/admin/*` and `/admin-v2/*`.

Key goals: - Preserve business logic - Reuse APIs - Modernize UI -
Follow SOLID, DRY, KISS, YAGNI - Extract reusable components - Complete
missing modules (Diseases, Articles, Vaccines, Fees, Service Cards,
Services, Support, Reports, Settings) - Produce migration report and
documentation

------------------------------------------------------------------------

## Prompt 2 - Project Context & AI Knowledge Base

Maintain a living knowledge base under:

    docs/knowledge-base/

Include: - project-overview.md - architecture.md - folder-structure.md -
coding-standards.md - design-decisions.md - api-conventions.md -
database-conventions.md - ui-design-system.md - image-processing.md -
authentication.md - deployment.md - performance.md - technical-debt.md -
roadmap.md - prompts.md - lessons-learned.md - changelog.md -
session-history/

Update documentation after every significant change, maintain ADRs,
prompt library, technical debt register, roadmap, and session summaries.

Create a root `PROJECT_CONTEXT.md` containing: - Project overview - Tech
stack - Architecture - Coding standards - Folder structure - API
conventions - Database conventions - UI standards - Roadmap - Links to
documentation
