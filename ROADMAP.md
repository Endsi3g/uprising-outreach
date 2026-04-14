# ProspectOS — Roadmap to MVP

> **Current version:** v1.2.1 · **Target:** v2.0.0 MVP
>
> This document tracks every sprint from today to the first shippable MVP.
> Status: ✅ Done · 🔄 In progress · ⬜ Planned

---

## Legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Complete — committed, migrated, tested |
| 🔄 | Skeleton exists, wiring incomplete |
| ⬜ | Not started |
| 🔴 | Blocker for the sprint after it |

---

## Foundation (v0.x — Complete)

| # | Feature | Release | Status |
|---|---------|---------|--------|
| F-1 | Auth (JWT, workspaces, RBAC) | v0.1.0 | ✅ |
| F-2 | Companies / Contacts / Leads data model | v0.1.0 | ✅ |
| F-3 | Lead CRUD + CSV import (ARQ worker) | v0.3.0 | ✅ |
| F-4 | Bulk actions (delete, assign, suppress, score) | v0.3.0 | ✅ |
| F-5 | AI Lead Scoring (Claude integration) | v0.4.0 | ✅ |
| F-6 | Projects module + per-project instructions | v0.5.0 | ✅ |
| F-7 | Alembic migrations 0001–0005 | v0.5.0 | ✅ |

---

## Sprint 1 — AI Chat System (v1.0.0 → v1.1.0) ✅

| # | Feature | File(s) | Status |
|---|---------|---------|--------|
| S1-1 | AI Chat UI (streaming SSE) | `frontend/src/app/(app)/ai/page.tsx` | ✅ |
| S1-2 | Claude + Ollama providers | `backend/app/ai_chat/providers/` | ✅ |
| S1-3 | AI Tools: search_leads, pipeline_stats, score, enrich, autonomous_action | `backend/app/ai_chat/tools/registry.py` | ✅ |
| S1-4 | Conversation persistence (DB) | `backend/app/ai_chat/models.py` | ✅ |
| S1-5 | NanoClaw autonomous agent bridge | `backend/app/ai_chat/nanoclaw_bridge.py` | ✅ |
| S1-6 | Global `sendMessage` in Zustand store | `frontend/src/store/useAIChat.ts` | ✅ |

---

## Sprint 2 — Unified Inbox + Gmail Sync (v1.1.0 → v1.2.0) ✅

| # | Feature | File(s) | Status |
|---|---------|---------|--------|
| S2-1 | Inbox models (InboxConversation, InboxMessage) | `backend/app/inbox/models.py` | ✅ |
| S2-2 | Inbox router (list, reply, classify, patch) | `backend/app/inbox/router.py` | ✅ |
| S2-3 | Gmail OAuth (authorize + callback) | `backend/app/senders/oauth.py`, `router.py` | ✅ |
| S2-4 | Gmail inbox sync ARQ worker | `backend/app/workers/inbox_tasks.py` | ✅ |
| S2-5 | Inbox frontend wired to real API | `frontend/src/app/(app)/inbox/page.tsx` | ✅ |
| S2-6 | Migration 0006 (ai_conversations), 0007 (inbox) | `backend/alembic/versions/` | ✅ |

---

## Sprint 3 — Facebook Messenger + Audit Fixes (v1.2.0 → v1.2.1) ✅

| # | Feature | File(s) | Status |
|---|---------|---------|--------|
| S3-1 | Facebook OAuth (page token acquisition) | `backend/app/senders/oauth.py` | ✅ |
| S3-2 | Facebook webhook handler (messaging + leadgen) | `backend/app/webhooks/facebook.py`, `router.py` | ✅ |
| S3-3 | Facebook ARQ tasks (process_message, import_lead) | `backend/app/workers/facebook_tasks.py` | ✅ |
| S3-4 | Migration 0008 (facebook enum value) | `backend/alembic/versions/0008_facebook_provider.py` | ✅ |
| S3-5 | Settings → Connecteurs: Gmail + Outlook + Facebook buttons | `frontend/src/app/(app)/settings/page.tsx` | ✅ |
| S3-6 | AI model alias fix (prospectos-ai-core → claude-sonnet-4-6) | `backend/app/ai_chat/service.py` | ✅ |
| S3-7 | Dashboard stats endpoint + StatsSummary real data | `backend/app/leads/router.py`, `frontend/src/components/ui/StatsSummary.tsx` | ✅ |
| S3-8 | Light-mode CSS fix (color-scheme declarations) | `frontend/src/styles/globals.css` | ✅ |

---

## Sprint 4 — Campaign Execution Engine (v1.3.0) ⬜

**Goal:** Build + send multi-step email sequences. Frontend builder already exists; backend is completely missing.

| # | Feature | File(s) to Create / Modify | Priority |
|---|---------|--------------------------|---------|
| S4-1 | Campaign + CampaignStep + ScheduledSend models | `backend/app/campaigns/models.py` (new) | 🔴 |
| S4-2 | Migration 0009_campaigns | `backend/alembic/versions/0009_campaigns.py` (new) | 🔴 |
| S4-3 | Campaign CRUD router (create, list, get, update, delete, launch) | `backend/app/campaigns/router.py` (new) | 🔴 |
| S4-4 | Campaign service (schedule steps, advance sequence) | `backend/app/campaigns/service.py` (new) | 🔴 |
| S4-5 | Email send via Gmail API (OAuth token from SenderAccount) | `backend/app/senders/email_client.py` (new) | 🔴 |
| S4-6 | ARQ task: execute_campaign_step (dequeue → send → advance) | `backend/app/workers/campaign_tasks.py` (new) | 🔴 |
| S4-7 | Register campaign tasks in WorkerSettings | `backend/app/workers/main.py` | - |
| S4-8 | Wire frontend campaigns page to real API | `frontend/src/app/(app)/campaigns/page.tsx` | - |
| S4-9 | Campaign stats endpoint (sent, opens, replies) | `backend/app/campaigns/router.py` | - |

**Verification:**
- `POST /api/v1/campaigns` creates a campaign
- `POST /api/v1/campaigns/{id}/launch` enqueues email steps
- ARQ worker sends real emails via connected Gmail account
- Frontend campaign builder saves and shows real status

---

## Sprint 5 — Enrichment Integration (v1.4.0) ⬜

**Goal:** Replace stub enrichment with a real data provider (Apollo.io or Hunter.io).

| # | Feature | File(s) to Create / Modify | Priority |
|---|---------|--------------------------|---------|
| S5-1 | Enrichment module + provider abstraction | `backend/app/enrichment/` (new) | 🔴 |
| S5-2 | Apollo.io client (company + contact lookup) | `backend/app/enrichment/apollo.py` (new) | 🔴 |
| S5-3 | Enrichment service (batch, dedup, update lead) | `backend/app/enrichment/service.py` (new) | 🔴 |
| S5-4 | ARQ task: enrich_lead (single) + enrich_batch | `backend/app/workers/enrichment_tasks.py` (new) | 🔴 |
| S5-5 | Register enrichment tasks in WorkerSettings | `backend/app/workers/main.py` | - |
| S5-6 | Enrich bulk-action wired to real task | `backend/app/leads/service.py` | - |
| S5-7 | Frontend leads page: show real enrichment data | `frontend/src/app/(app)/leads/page.tsx` | - |

**Verification:**
- Select 3 leads → bulk enrich → real company/contact data fills in
- `lead.enrichment_status` transitions NEW → ENRICHING → SUCCESS/FAILED

---

## Sprint 6 — Pipeline Backend (v1.5.0) ⬜

**Goal:** Replace hardcoded Kanban data with a real Opportunity model.

| # | Feature | File(s) to Create / Modify | Priority |
|---|---------|--------------------------|---------|
| S6-1 | Opportunity model (stage, value, probability, lead_id) | `backend/app/pipeline/models.py` (new) | 🔴 |
| S6-2 | Migration 0010_pipeline | `backend/alembic/versions/0010_pipeline.py` (new) | 🔴 |
| S6-3 | Pipeline router (CRUD + stage update) | `backend/app/pipeline/router.py` (new) | 🔴 |
| S6-4 | Register pipeline router in main.py | `backend/app/main.py` | - |
| S6-5 | Wire frontend Kanban to real API (drag = PATCH stage) | `frontend/src/app/(app)/pipeline/page.tsx` | - |
| S6-6 | Add `get_pipeline_stats` AI tool to use real DB data | `backend/app/ai_chat/tools/registry.py` | - |

**Verification:**
- Drag card between columns → DB row stage updated
- AI chat `get_pipeline_stats` returns live totals

---

## Sprint 7 — Analytics Backend (v1.6.0) ⬜

**Goal:** Replace mock chart data with real aggregated metrics.

| # | Feature | File(s) to Create / Modify | Priority |
|---|---------|--------------------------|---------|
| S7-1 | Analytics module (aggregate queries) | `backend/app/analytics/` (new) | 🔴 |
| S7-2 | Endpoints: GET /analytics/overview, /campaigns, /leads, /inbox | `backend/app/analytics/router.py` (new) | 🔴 |
| S7-3 | Register analytics router in main.py | `backend/app/main.py` | - |
| S7-4 | Wire analytics page to real API | `frontend/src/app/(app)/analytics/page.tsx` | - |

**Verification:**
- Analytics page shows real totals (leads imported, reply rate, campaign sent)
- Numbers match DB counts

---

## Sprint 8 — Task Orchestrator & Next Actions (v1.7.0) ⬜

**Goal:** Auto-generate next actions for SDRs when lead state changes.

| # | Feature | File(s) to Create / Modify | Priority |
|---|---------|--------------------------|---------|
| S8-1 | Task model (type, due_date, status, lead_id, assignee_id) | `backend/app/tasks/models.py` (new) | 🔴 |
| S8-2 | Migration 0011_tasks | `backend/alembic/versions/0011_tasks.py` (new) | 🔴 |
| S8-3 | Task CRUD router | `backend/app/tasks/router.py` (new) | 🔴 |
| S8-4 | Rule engine: on lead state change → Claude suggests next_action | `backend/app/tasks/rules.py` (new) | 🔴 |
| S8-5 | Register tasks router in main.py | `backend/app/main.py` | - |
| S8-6 | Task panel UI in leads detail view | `frontend/src/app/(app)/leads/` | - |

**Verification:**
- Enrich a lead → next_action suggestion appears in task panel
- Mark task done → lead status advances

---

## Sprint 9 — Prospect Audit Engine (v1.8.0) ⬜

**Goal:** Crawl prospect websites → digital maturity signals → feed AI personalization (key differentiator).

| # | Feature | File(s) to Create / Modify | Priority |
|---|---------|--------------------------|---------|
| S9-1 | Web crawler (Playwright or httpx + BS4) | `backend/app/audit/crawler.py` (new) | 🔴 |
| S9-2 | Signal extractors (forms, CTA, SEO, speed, tracking) | `backend/app/audit/extractors.py` (new) | 🔴 |
| S9-3 | Opportunity brief generator (Claude) | `backend/app/audit/service.py` (new) | 🔴 |
| S9-4 | ARQ task: audit_prospect | `backend/app/workers/audit_tasks.py` (new) | 🔴 |
| S9-5 | Audit result stored on Company model | `backend/app/companies/models.py` | - |
| S9-6 | Audit brief surfaced in AI chat context | `backend/app/ai_chat/tools/registry.py` | - |
| S9-7 | Audit trigger in leads detail page | `frontend/src/app/(app)/leads/` | - |

**Verification:**
- Trigger audit on a lead with a domain → audit brief appears in lead detail
- AI chat uses brief to suggest personalized opening line

---

## Sprint 10 — MVP Polish & Hardening (v2.0.0) ⬜

**Goal:** Production-ready: rate limiting, export, deliverability, error handling, E2E tests.

| # | Feature | File(s) | Priority |
|---|---------|---------|---------|
| S10-1 | CSV/XLSX export endpoint | `backend/app/leads/router.py` | 🔴 |
| S10-2 | SPF/DKIM/DMARC checker completion | `backend/app/senders/dns_checker.py` | 🔴 |
| S10-3 | Campaign send-rate throttle (max N/hour per sender) | `backend/app/workers/campaign_tasks.py` | 🔴 |
| S10-4 | Workspace usage limits (leads quota, sends/day) | `backend/app/workspaces/` | 🔴 |
| S10-5 | E2E test suite (Playwright) | `tests/e2e/` (new) | 🔴 |
| S10-6 | Backend integration tests for all new sprints | `backend/tests/` | 🔴 |
| S10-7 | Error boundary + loading state audit across all pages | `frontend/src/` | - |
| S10-8 | Settings → Account, Billing, Privacy tabs completed | `frontend/src/app/(app)/settings/page.tsx` | - |
| S10-9 | Onboarding flow (first-run wizard) | `frontend/src/app/(app)/` (new) | - |

**Verification:**
- `make test` passes with > 80% coverage on critical paths
- Import CSV → Enrich → Score → Send campaign → Reply in Inbox — full E2E green

---

## Release Schedule

| Version | Sprint | Theme | Target |
|---------|--------|-------|--------|
| **v1.2.1** | S3 | Facebook + Audit Fixes | ✅ Released |
| **v1.3.0** | S4 | Campaign Execution Engine | Next |
| **v1.4.0** | S5 | Enrichment Integration | - |
| **v1.5.0** | S6 | Pipeline Backend | - |
| **v1.6.0** | S7 | Analytics Backend | - |
| **v1.7.0** | S8 | Task Orchestrator | - |
| **v1.8.0** | S9 | Prospect Audit Engine | - |
| **v2.0.0** | S10 | MVP — Production Ready | **MVP** |

---

## Critical Path to MVP

```
Gmail Send (S4) → Campaign Execution (S4) → Enrichment (S5)
                                          ↓
                             Pipeline (S6) → Analytics (S7)
                                          ↓
                              Tasks (S8) → Audit Engine (S9)
                                          ↓
                                   MVP Polish (S10)
```

The single longest chain: **Email Send → Campaign → Prospect Audit Engine → MVP**.
Unblock S4 first.

---

## Currently Blocked Features

| Feature | Blocker |
|---------|---------|
| Campaign send | `email_client.py` (Gmail API send) not built |
| Enrichment | No Apollo.io / Hunter client |
| Pipeline drag-drop persistence | No Opportunity model |
| Analytics real data | No aggregate query module |
| Next actions | No Task model |
| Prospect audit | No crawler |

---

_Last updated: 2026-04-14 · ProspectOS v1.2.1_
