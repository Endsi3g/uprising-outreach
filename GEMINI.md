# GEMINI.md

This file provides guidance to Antigravity / Gemini Code when working with code in this repository.

## Project Overview

**ProspectOS / Uprising Outreach** — A B2B cold outreach SaaS platform that consolidates the entire prospecting cycle into one system: lead sourcing, enrichment, scoring, AI-powered personalization, multi-channel sequences, email execution, inbox management, pipeline, and analytics.

The project is currently in a documentation/design phase. All specifications live in `docs/`.

## Documentation Map

- `docs/prd-prospecting-app.md` — Master product requirements document (MVP scope, data model, feature specs, user roles)
- `docs/DESIGN.md` — Complete design system (colors, typography, component patterns, layout principles)
- `docs/claude-code-ui-ux-guide.md` — UI/UX interface replication guide
- `docs/Analyse Détaillée de Claude Code d'Anthropic.md` — Technical architecture analysis

## Commands

```bash
# Start full dev environment (postgres, redis, backend, worker, frontend, mailhog)
make dev

# Run database migrations
make migrate

# Run all tests
make test

# Backend only
make test-backend                    # all backend tests
make test-backend-unit               # unit tests only
make test-backend-integration        # integration tests only

# Frontend only
make test-frontend                   # vitest

# Linting
make lint                            # ruff + mypy + eslint + tsc
make format                          # ruff format + prettier

# Useful shells
make shell-backend                   # bash inside backend container
make shell-db                        # psql into postgres
make redis-cli                       # redis-cli
```

## Planned Tech Stack

- **Backend:** Python + FastAPI
- **Database:** PostgreSQL (or Supabase)
- **AI:** Claude API / Gemini API — personalization engine, lead scoring, website audit analysis, response classification
- **Email:** OAuth (Gmail/Outlook), SPF/DKIM/DMARC verification

## Core Architecture

### Data Model (Three-Tier)
```
Company → Contact → Lead
```
- **Company:** domain, sector, size, tags, website
- **Contact:** email, phone, LinkedIn, verification status (belongs to a Company)
- **Lead:** score, status, owner, active campaign, next action, temperature (ties a Contact to a sales motion; multiple leads per company is supported)

### Operational Flow
```
Import → Enrich → Score (ICP match) → Audit (website signals) → Personalize (AI) → Sequence → Execute (email) → Inbox → Pipeline → Analytics
```

### Key Design Principles
1. **Data First** — every action is grounded in clean, historicized lead/contact/company data
2. **Action over Storage** — screens optimize for "what to do next", not just record-keeping
3. **AI Assist, Not Autopilot** — AI proposes/scores/personalizes, but decisions remain auditable and overridable
4. **Deliverability by Design** — campaign launch is blocked if domain authentication (SPF/DKIM/DMARC) is compromised
5. **Workspace Isolation** — multi-tenant from day one; all data scoped to a workspace

### User Roles
Admin, Manager, SDR, Closer, Viewer — implement RBAC at the API layer.

### The Prospect Audit Engine (Key Differentiator)
Crawls a prospect's website and extracts digital maturity signals: form presence, site speed, CTA quality, design freshness, SEO structure, tracking elements, brand coherence. Generates an "opportunity brief" summary that feeds directly into AI message personalization.

## Design System (from `docs/DESIGN.md`)

Aesthetic: warm, literary, premium — inspired by Claude/Anthropic's interface. Avoid generic SaaS aesthetics (gradients, glow effects, repetitive cards).

**Color palette:**
- Background: Parchment `#f5f4ed`
- Brand accent: Terracotta `#c96442`
- Primary text: Near Black `#141413`
- Focus/accessibility only: Blue `#3898ec`
- All neutrals use warm (yellow-brown) undertones — no cool grays

**Typography:**
- Headlines: Anthropic Serif, weight 500, line-height 1.10–1.30
- UI/body: Anthropic Sans, weight 400–500
- Body line-height: 1.60 (editorial, not dense)

**Component patterns:**
- Ring-based borders (`0px 0px 0px 1px`) instead of drop shadows
- Generous corner radius (8–32px)
- Max container width ~1200px
- Section spacing 80–120px

## Agent Skills 🚀

This workspace is equipped with **Agent Skills** to enhance AI capabilities. Skills are located in `.agents/skills/`.

### Available Skills
You can request the use of these skills at any time:

| Skill | Purpose |
| :--- | :--- |
| **@brainstorming** | Planning, ideation and product strategy. |
| **@nextjs-best-practices** | Modern Next.js patterns (App Router, Server Components). |
| **@antigravity-design-expert** | Premium UI/UX design and "Deep Oceanic" aesthetics. |
| **@sales-automator** | Sales outreach workflows and autonomous agent patterns. |
| **@chrome-extension-developer**| Guidance for sidepanel and extension logic. |
| **@apify-lead-generation** | Scraping and lead extraction workflows via Apify. |
| **@typescript-pro** | Advanced TypeScript patterns and type safety. |
| **@security-auditor** | Code security audits and vulnerability checks. |
| **@debugging-strategies** | Systematic troubleshooting and root cause analysis. |
| **@code-review-excellence** | High-quality pair programming and peer review. |

### How to use skills
- Mention a skill by name: *"Use @brainstorming to plan the lead scoring algorithm."*
- Mentions skills collectively: *"Apply @react-best-practices and @typescript-pro to this component refactor."*
- The agent will read the `SKILL.md` file associated with the skill to follow its specific instructions.

---
*Note: This file is a mirror of CLAUDE.md with additional Antigravity-specific capabilities.*
