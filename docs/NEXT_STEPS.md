# Next Steps — ProspectOS

_Last updated: 2026-04-13_

## Phase 1 — Foundation ✅ Complete

Everything needed to import, view, and manage leads, set up sender accounts, and authenticate users is built and deployed.

**What's done:**

- Multi-workspace auth (JWT + bcrypt, RBAC: Admin/Manager/SDR/Closer/Viewer/Reviewer)
- Company / Contact / Lead data model (3-tier) with keyset pagination
- CSV import via async ARQ worker (idempotent, batched 500 rows)
- Leads table with multi-select, bulk actions (suppress / enrich / assign / delete)
- Sender account management + DNS verification (SPF/DKIM/DMARC via dnspython)
- Postgres RLS for workspace isolation (defense-in-depth)
- Full frontend shell: sidebar nav, design system tokens, Leads page
- GitHub Actions CI (backend + frontend lint/test/build)
- Docker Compose dev environment + one-command setup script

---

## Phase 2 — Outreach Activation

**Priority order:**

### 2.1 Lead Enrichment (Weeks 9–11)

- [ ] Integrate email verification provider (start with Hunter.io or ZeroBounce — choose one and wire `enrich_email_task`)
- [ ] Integrate company enrichment (Apollo.io or Clearbit `/company/find` by domain)
- [ ] Integrate contact LinkedIn data (Proxycurl `/person` endpoint)
- [ ] Build enrichment status UI in Lead detail drawer
- [ ] Add `EnrichmentJob` + `EnrichmentSnapshot` models (migration `0005_enrichment.py`)
- [ ] Frontend: enrichment status badge on lead rows, "Enrich" quick action

**Deliverable:** Click "Enrich" on any lead → async job runs → fields populate within 30s.

### 2.2 ICP Definition + Lead Scoring (Week 11)

- [ ] Build ICP model + editor UI (mandatory / bonus / exclusion criteria)
- [ ] Implement scoring engine (`scoring/engine.py` — pure function, no DB calls)
- [ ] Wire `score_lead_task` as ARQ post-enrichment chain
- [ ] Display score + rule breakdown in Lead detail
- [ ] Frontend: score column in leads table, score filter in sidebar

**Deliverable:** Define ICP → all enriched leads get a 0–100 score with explainability.

### 2.3 Template Library + AI Generation (Weeks 12–13)

- [ ] `Template` model + CRUD API + migration `0006_templates.py`
- [ ] Template editor UI (niche / offer / tone / language / channel)
- [ ] Wire `anthropic` SDK in `ai/client.py` (already stubbed)
- [ ] Add `ANTHROPIC_API_KEY` to `.env` and verify connection
- [ ] Context builder: assemble lead + company + ICP into prompt context
- [ ] `POST /ai/generate` → returns 3 variants (subject + body + CTA)
- [ ] Frontend: "Generate message" button on lead detail, variant picker

**Deliverable:** Select lead → click generate → review 3 email variants → approve one.

### 2.4 Campaign Builder + Sequence Engine (Weeks 14–16)

- [ ] `Campaign` + `Sequence` + `SequenceStep` models + migrations
- [ ] Campaign builder UI: name, objective, sequence steps (drag-to-reorder)
- [ ] Lead eligibility rules (status filter, segment, score threshold)
- [ ] Campaign launch validation: DNS check + verified emails check + step count check
- [ ] `schedule_sequence_step_task` ARQ worker (respects per-mailbox daily limit via Redis counter)
- [ ] Frontend: Campaign list + builder + launch modal with go/no-go checklist

**Deliverable:** Build a 3-step email sequence → assign leads → launch → emails send on schedule.

### 2.5 Email OAuth Integration (Week 16)

- [ ] Gmail OAuth2 flow (`/senders/oauth/gmail/authorize` + `/callback`)
- [ ] Microsoft OAuth (Outlook) flow via MSAL
- [ ] Fernet-encrypted token storage (use `ENCRYPTION_KEY` from env)
- [ ] Pre-send token refresh helper
- [ ] Send via Gmail API (not SMTP) + Microsoft Graph API
- [ ] Frontend: "Connect Gmail" / "Connect Outlook" buttons in Settings → Senders

**Deliverable:** Connect a real mailbox → test send → verify delivery in MailHog then real inbox.

---

## Phase 3 — Commercial Exploitation

### 3.1 Unified Inbox (Weeks 19–21)

- [ ] `Conversation` + `Reply` models + migration
- [ ] Gmail reply polling worker (`poll_replies_task` — run every 5min via ARQ cron)
- [ ] Outlook reply polling via Graph API
- [ ] Reply auto-classification via Claude (`classify_reply_task`)
- [ ] Classification types: `INTERESTED | NOT_INTERESTED | BOUNCE | OUT_OF_OFFICE | QUESTION | REFERRAL`
- [ ] Frontend: Inbox page — conversation list + thread view + quick-reply + classification badge

### 3.2 Task System + Next Best Action (Week 21)

- [ ] `Task` model + CRUD API
- [ ] Rule engine (`tasks/nba.py`) emitting task suggestions post-reply
- [ ] Frontend: Task sidebar on lead detail, "Today's tasks" view

### 3.3 Kanban Pipeline (Week 22)

- [ ] `Opportunity` model + migration
- [ ] `GET /pipeline/opportunities` grouped by stage
- [ ] `PATCH /pipeline/opportunities/{id}` for stage moves
- [ ] Frontend: Pipeline page — drag-and-drop kanban, card with value + probability

### 3.4 Analytics (Weeks 23–24)

- [ ] Postgres materialized views (`mv_funnel`, `mv_campaign_stats`, `mv_mailbox_health`)
- [ ] Hourly ARQ refresh task (`refresh_analytics_task`)
- [ ] Analytics API endpoints (funnel, campaign stats, mailbox health, conversion)
- [ ] Frontend: Analytics page — conversion funnel chart, reply rate trend, mailbox health table

---

## Phase 4 — Prospect Audit Engine (Future)

- [ ] Website crawler: headless Playwright + BeautifulSoup4
- [ ] Signal extraction: form presence, page speed, CTA count, design age, SEO structure
- [ ] `AuditSnapshot` model + async crawl worker
- [ ] Claude-generated "opportunity brief" from signals
- [ ] Surface audit data in lead card + inject into AI message generation context

**This is the primary differentiator for Uprising Studio's local SMB market.**

---

## Infrastructure & Quality

| Item | Priority | Notes |
|---|---|---|
| Staging environment (Fly.io or Railway) | High | Deploy after Phase 2 launch validation |
| CI: Playwright E2E tests | Medium | Add after Phase 2 complete |
| Rate limiting per workspace | Medium | Already stubbed, needs Redis counter wiring |
| Webhook inbound handler | Medium | For email provider event callbacks |
| GDPR / data export | Low | Required before public launch |
| Multi-language UI (EN/FR) | Low | Needed for FR market |

---

## Decisions to Make Before Phase 2

1. **Email verification provider** — Self-hosted (open-source: MailCheck)?
2. **Company enrichment** — Apollo.io (integrated prospecting + enrichment) & Apify
3. **Staging hosting** — Railway
4. **DKIM selector** — Senders use Google Workspace (selector: `google`)
5. **Rate limiting defaults** — 50/day (conservative)
