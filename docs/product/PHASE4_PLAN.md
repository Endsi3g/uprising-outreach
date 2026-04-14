# ProspectOS — Phase 4 Master Plan
# AI Engine · Unified Inbox · GoHighLevel Features

_Created: 2026-04-13 — Status: Planning_

---

## Executive Summary

Phase 4 transforms ProspectOS from a lead management tool into a **fully autonomous outreach operating system** — with an embedded AI assistant (Claude + Ollama), a unified multi-channel inbox (Gmail + Facebook Messenger + Lead Ads), and three GoHighLevel-inspired modules (Workflows, Réputation, Calendrier).

---

## Part 1 — AI Chat System

### 1.1 Architecture Overview

```
User
  │
  ├── AI Sidebar (global, slides from right, any page)
  └── /ai page (full-screen, conversation history)
         │
         ▼
   Frontend SSE client
         │
         ▼
  POST /api/v1/ai/chat  ── streams SSE ──►  UI
         │
    ┌────┴────────────────────┐
    │  Model Router           │
    ├─────────────────────────┤
    │ claude-sonnet-4-6       │──► Anthropic API
    │ claude-haiku-4-5        │──► Anthropic API
    │ ollama/llama3           │──► http://localhost:11434/v1
    │ ollama/mistral          │──► http://localhost:11434/v1
    └─────────────────────────┘
         │
    Tool calls → Action Engine
    ├── enrich_leads(ids[])
    ├── score_leads(ids[], segment?)
    ├── search_leads(query)
    ├── send_email(to, subject, body)
    ├── create_campaign(name, steps[])
    ├── get_pipeline_stats()
    ├── schedule_meeting(contact_id, slot)
    └── get_inbox_summary()
```

### 1.2 Backend — `/api/v1/ai/`

**New module: `backend/app/ai_chat/`**

```
backend/app/ai_chat/
├── __init__.py
├── models.py          # Conversation, Message ORM
├── schemas.py         # ChatRequest, ChatMessage, StreamChunk
├── router.py          # POST /ai/chat (SSE), GET /ai/conversations
├── service.py         # Model routing logic
├── providers/
│   ├── claude.py      # Anthropic SDK streaming + tool_use
│   └── ollama.py      # httpx → Ollama OpenAI-compat endpoint
└── tools/
    ├── registry.py    # Tool definitions (JSON schemas for Claude)
    ├── leads.py       # enrich_leads, score_leads, search_leads
    ├── email.py       # send_email, get_inbox_summary
    ├── campaigns.py   # create_campaign, launch_campaign
    └── pipeline.py    # get_pipeline_stats, move_lead
```

**`POST /api/v1/ai/chat`** — Streaming endpoint (Server-Sent Events)

Request body:
```json
{
  "model": "claude-sonnet-4-6",
  "messages": [{"role": "user", "content": "Score mes leads du segment SaaS"}],
  "conversation_id": "uuid (optional, for history)",
  "page_context": {
    "page": "leads",
    "selected_lead_ids": ["uuid1", "uuid2"]
  },
  "tools_enabled": true
}
```

Response: `text/event-stream` with chunks:
```
data: {"type": "text_delta", "text": "Je vais scorer..."}
data: {"type": "tool_use", "tool": "score_leads", "input": {"ids": ["uuid1"]}}
data: {"type": "tool_result", "result": {"scored": 2, "avg_score": 74}}
data: {"type": "done"}
```

**Model routing (`service.py`):**
- `claude-*` → `providers/claude.py` using `anthropic` SDK with `stream=True`
- `ollama/*` → `providers/ollama.py` using `httpx.AsyncClient` to `http://localhost:11434/v1/chat/completions`
- Ollama uses OpenAI-compatible API — same tool_use format works via function_call

**DB migration: `0006_ai_conversations.py`**
```
conversations: id, workspace_id, user_id, model, title, created_at
messages:      id, conversation_id, role, content, tool_calls(JSON), created_at
```

### 1.3 Frontend — AI Sidebar

**File: `frontend/src/components/ai/AISidebar.tsx`**

- Global — mounted in the app layout (`(app)/layout.tsx`), always available
- Triggered by keyboard shortcut `Cmd/Ctrl + K` or button in navbar
- Slides in from the right (Framer Motion), width 420px
- Reads current page context via a React context (`usePageContext`)
- Sends `page_context` with every message so the AI knows what's on screen

```
┌─────────────────────────────────────────────────────┐
│  [Nav]                             [⚡ AI]          │
├─────────────────────────────────────┬───────────────┤
│                                     │ ● ProspectOS  │
│   Current page content              │   AI          │
│                                     ├───────────────┤
│                                     │ Modèle:       │
│                                     │ [Sonnet ▼]    │
│                                     ├───────────────┤
│                                     │ Bonjour! Je   │
│                                     │ vois 3 leads  │
│                                     │ sélectionnés. │
│                                     │               │
│                                     │ ┌───────────┐ │
│                                     │ │ ✓ Scorés  │ │
│                                     │ │ 3 leads   │ │
│                                     │ └───────────┘ │
│                                     ├───────────────┤
│                                     │ [input...]  ▶ │
└─────────────────────────────────────┴───────────────┘
```

**Model selector dropdown** (in sidebar header):
```
claude-sonnet-4-6   ← Claude Sonnet 4.6
claude-haiku-4-5    ← Claude Haiku 4.5 (rapide)
ollama/llama3       ← Llama 3 (local)
ollama/mistral      ← Mistral (local)
```

### 1.4 Frontend — Page `/ai`

**File: `frontend/src/app/(app)/ai/page.tsx`**

- Full-screen conversation interface, style Claude.ai
- Left sidebar: conversation history list
- Main area: message thread with markdown rendering + code blocks
- Supports streaming responses (SSE via `fetch` + `ReadableStream`)
- Same model selector as sidebar

### 1.5 How to Implement AI Chat

1. **Backend first:**
   ```bash
   # Create module
   mkdir backend/app/ai_chat backend/app/ai_chat/providers backend/app/ai_chat/tools
   
   # Create migration
   # 0006_ai_conversations.py — conversations + messages tables
   
   # Wire router into main.py
   app.include_router(ai_chat_router, prefix="/api/v1")
   ```

2. **Claude provider** — use existing `anthropic` SDK (already in `pyproject.toml`):
   ```python
   async for event in client.messages.stream(...):
       yield ServerSentEvent(data=json.dumps(chunk))
   ```

3. **Ollama provider** — Ollama exposes OpenAI-compatible API at `:11434`:
   ```python
   async with httpx.AsyncClient() as client:
       async with client.stream("POST", "http://localhost:11434/v1/chat/completions",
           json={"model": "llama3", "stream": True, "messages": messages}
       ) as r:
           async for line in r.aiter_lines():
               yield parse_sse_chunk(line)
   ```

4. **Tool execution** — Claude returns `tool_use` blocks; backend executes the
   corresponding Python function and streams a `tool_result` event back.

5. **Frontend SSE** — use `fetch` with `ReadableStream`:
   ```ts
   const res = await fetch('/api/v1/ai/chat', { method: 'POST', body, headers })
   const reader = res.body!.getReader()
   // parse chunks and update state
   ```

---

## Part 2 — Unified Inbox (Multi-Channel)

### 2.1 Architecture

```
Channels                   Sync Layer              DB              UI
──────────                 ──────────              ──────────      ──
Gmail (OAuth ✅)  ──────► inbox_sync_worker  ───► conversations   /inbox
Facebook Messenger ───────► meta_webhook         messages         (existing
Facebook Lead Ads ────────► meta_webhook         classifications   shell)
```

**DB migration: `0007_inbox.py`**
```
conversations:
  id, workspace_id, channel (gmail|messenger|instagram),
  external_id (thread_id / page_scoped_user_id),
  contact_id (FK, nullable), lead_id (FK, nullable),
  subject, status (open|snoozed|closed|spam),
  classification (INTERESTED|NOT_INTERESTED|QUESTION|OOO|UNCLASSIFIED),
  last_message_at, created_at, updated_at

messages:
  id, conversation_id, direction (inbound|outbound),
  sender_name, sender_email, body_text, body_html,
  external_message_id, sent_at, created_at

attachments:
  id, message_id, filename, url, size, mime_type
```

### 2.2 Gmail Inbox Sync

**File: `backend/app/workers/inbox_tasks.py`**

- ARQ task: `sync_gmail_inbox(ctx, sender_account_id)`
- Calls Gmail API `users.threads.list` with `q=in:inbox` 
- For each thread: fetches messages, stores in DB
- Runs AI classification via `ai/service.py` on new inbound messages
- Scheduled: every 5 minutes per connected account

```python
async def sync_gmail_inbox(ctx, sender_account_id: str):
    # 1. Load SenderAccount, refresh token if needed
    # 2. Build Gmail API client
    # 3. List threads modified since last_synced_at
    # 4. For each thread: upsert conversation + messages
    # 5. Classify new inbound messages with Claude
    # 6. Update last_synced_at
```

### 2.3 Facebook Messenger Integration

**Flow:**
1. Admin connects Facebook Page via Settings → Connecteurs (OAuth with `pages_messaging` scope)
2. Backend registers a webhook: `POST /api/v1/webhooks/facebook`
3. Facebook pushes new messages in real-time
4. Backend upserts conversation + message, runs AI classification

**New files:**
```
backend/app/webhooks/
├── __init__.py
├── router.py          # GET /webhooks/facebook (verify), POST /webhooks/facebook
└── facebook.py        # parse_messenger_event(), parse_lead_ads_event()
```

**Meta app requirements:**
- Facebook App (Developers Console) with `pages_messaging` permission
- Webhook verify token (stored in `settings.facebook_verify_token`)
- Page Access Token stored in a new `SocialAccount` model

**Settings variables to add to `.env.example`:**
```
FACEBOOK_APP_ID=
FACEBOOK_APP_SECRET=
FACEBOOK_VERIFY_TOKEN=prospectOS_webhook_secret
```

### 2.4 Facebook Lead Ads Integration

- Same webhook flow (`leadgen` event type)
- When Facebook sends a lead ID → call `GET /{leadgen_id}` Graph API
- Parse form fields → create Company + Contact + Lead in DB
- Auto-score with AI scoring engine

### 2.5 Frontend — Wire Inbox to Real API

**File: `frontend/src/app/(app)/inbox/page.tsx`** (already has shell)

Replace `MOCK_THREAD` with:
```ts
const { data: conversations } = useSWR('/api/v1/inbox/conversations', apiClient.get)
```

Add channel filter tabs: `Tous · Gmail · Messenger · Lead Ads`

Add classification badge + quick actions (Reply, Snooze, Mark interested).

### 2.6 How to Implement Unified Inbox

1. Create `0007_inbox.py` migration
2. Create `backend/app/inbox/` module (models, schemas, router, service)
3. Write `backend/app/workers/inbox_tasks.py` (Gmail sync)
4. Create `backend/app/webhooks/` module (Facebook)
5. Add `GET /inbox/conversations` + `POST /inbox/conversations/{id}/reply`
6. Wire frontend `inbox/page.tsx` to real API
7. Add Facebook Messenger connect button to Settings → Connecteurs

---

## Part 3 — GoHighLevel Features

### 3.1 Workflows & Automations

**Concept:** Visual trigger/action builder. When X happens → do Y.

**Triggers:**
- Lead status changes (Raw → Enriched, replied, etc.)
- Lead score crosses threshold (e.g., score > 70)
- Inbound message received
- Lead idle for N days
- New lead created (from Facebook Lead Ads)

**Actions:**
- Assign lead to user
- Add tag to lead
- Send email (from template)
- Add to campaign sequence
- Send internal notification (Slack webhook)
- Schedule follow-up task
- Run AI scoring

**DB migration: `0008_workflows.py`**
```
workflows:    id, workspace_id, name, is_active, trigger_type, trigger_config(JSON)
workflow_steps: id, workflow_id, order, action_type, action_config(JSON)
workflow_runs:  id, workflow_id, lead_id, status, started_at, completed_at, error
```

**Backend:**
```
backend/app/workflows/
├── models.py    # Workflow, WorkflowStep, WorkflowRun
├── schemas.py   
├── router.py    # CRUD endpoints
├── service.py   # execute_workflow(workflow_id, lead_id, context)
└── engine.py    # trigger matching + action executors
```

**Worker task: `workflow_tasks.py`**
- `evaluate_triggers(ctx, event_type, lead_id)` — runs on lead state change events
- Called from leads service after status changes

**Frontend:**
```
/workflows page:
├── Workflow list (name, trigger, status, run count)
├── Workflow builder:
│   ├── Trigger selector (dropdown)
│   ├── Step list (drag-and-drop order)
│   └── Action config panels
```

### 3.2 Réputation & Avis

**Concept:** After a positive interaction (lead becomes client, deals closed), automatically request a Google/Facebook review. Track and respond to reviews.

**Flow:**
1. Lead moves to "Closed Won" in pipeline
2. Workflow trigger fires → sends review request email/SMS
3. Admin receives review alerts (webhook from Google My Business API)
4. Reviews displayed in `/reputation` page with AI-suggested responses

**APIs:**
- Google Business Profile API (requires Google Cloud Console setup)
- Facebook Graph API `/me/ratings`

**DB migration (part of 0008 or separate):**
```
review_requests: id, workspace_id, lead_id, channel, sent_at, review_url, status
reviews:         id, workspace_id, platform, rating, text, reviewer_name, responded_at, ai_response
```

**New module: `backend/app/reputation/`**

**Frontend: `/reputation` page**
```
┌────────────────────────────────────────────┐
│ Réputation                                 │
├──────────────┬─────────────────────────────┤
│ ★★★★☆ 4.3   │ [Liste des avis récents]    │
│ 47 avis      │                             │
│              │ Jean D. ★★★★★               │
│ [Google 32]  │ "Très professionnel..."     │
│ [Facebook15] │ [Répondre] [Réponse IA]     │
└──────────────┴─────────────────────────────┘
```

### 3.3 Calendrier & Booking

**Concept:** Public booking page where prospects can schedule meetings directly. Sync with Google Calendar.

**Flow:**
1. User configures availability in Settings → Calendrier
2. Public booking URL generated: `prospectos.local/book/{user-slug}`
3. Prospect picks a slot → creates event in Google Calendar + sends confirmation email
4. Lead record updated with `next_action = "Meeting scheduled at {time}"`

**DB migration: `0009_calendar.py`**
```
availability_rules: id, user_id, day_of_week, start_time, end_time, timezone
bookings:           id, workspace_id, user_id, lead_id (nullable), 
                    title, start_at, end_at, status, 
                    booker_name, booker_email, google_event_id,
                    meeting_link (Google Meet / Zoom)
```

**Backend:**
```
backend/app/calendar/
├── models.py     # AvailabilityRule, Booking
├── schemas.py
├── router.py     # GET /calendar/slots, POST /calendar/book
├── service.py    # compute_available_slots(), create_booking()
└── google.py     # Google Calendar API: create_event(), list_busy()
```

**Key endpoints:**
- `GET /api/v1/calendar/slots?user_id=&date_from=&date_to=` → available time slots
- `POST /api/v1/calendar/book` → create booking (public, no auth required)
- `GET /api/v1/calendar/bookings` → list bookings (authenticated)
- `PATCH /api/v1/calendar/availability` → update availability rules

**Frontend:**
```
/calendar page (authenticated):
├── Weekly calendar view with bookings
├── Availability configuration
└── Booking link copy button

/book/[slug] page (public):
├── User bio + service description
├── Month/week date picker
├── Time slot grid
└── Booking form (name, email, message)
```

---

## Part 4 — Implementation Sequence

### Sprint 1 — AI Chat Foundation (Week 1)
1. `0006_ai_conversations.py` migration
2. `backend/app/ai_chat/` module (models, schemas, router)
3. Claude streaming provider (`providers/claude.py`)
4. Ollama streaming provider (`providers/ollama.py`)
5. Basic tool registry with `search_leads` and `get_pipeline_stats`
6. Frontend AI Sidebar component (no tool UI yet, just streaming chat)
7. Frontend `/ai` page (full conversation interface)

### Sprint 2 — AI Tools + Inbox Backend (Week 2)
1. AI tool implementations: `enrich_leads`, `score_leads`, `send_email`
2. Tool execution feedback in chat UI (action cards)
3. `0007_inbox.py` migration
4. `backend/app/inbox/` module (models, service, router)
5. Gmail sync worker task
6. Wire frontend inbox to real API

### Sprint 3 — Facebook + Webhooks (Week 3)
1. Facebook Messenger OAuth in Settings → Connecteurs
2. `backend/app/webhooks/` module (Facebook webhook handler)
3. Lead Ads auto-import pipeline
4. Inbox channel filter tabs in frontend
5. AI classification of inbound messages

### Sprint 4 — Workflows (Week 4)
1. `0008_workflows.py` migration
2. `backend/app/workflows/` module
3. Workflow trigger engine (event hooks in leads service)
4. Basic workflow builder frontend (`/workflows`)
5. 5 initial action types wired up

### Sprint 5 — Réputation + Calendrier (Week 5)
1. Réputation module + Google Business Profile API
2. `/reputation` page frontend
3. `0009_calendar.py` migration
4. `backend/app/calendar/` module
5. Public `/book/[slug]` booking page
6. Google Calendar sync

---

## Part 5 — Technical Requirements

### New Environment Variables (`.env.example`)

```bash
# AI Chat
OLLAMA_BASE_URL=http://localhost:11434

# Facebook / Meta
FACEBOOK_APP_ID=
FACEBOOK_APP_SECRET=
FACEBOOK_VERIFY_TOKEN=prospectOS_webhook_secret

# Google Calendar (reuses Google OAuth from senders)
# GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET already defined

# Reputation
GOOGLE_BUSINESS_PROFILE_ID=   # optional, for review tracking
```

### New Python Dependencies (`pyproject.toml`)

```toml
"google-api-python-client>=2.154.0",   # already present (Gmail)
# No new deps needed — httpx, anthropic, msal already available
# Ollama uses httpx to its OpenAI-compatible API
```

### New Frontend Dependencies

```bash
npm install swr           # data fetching with auto-revalidation
npm install react-markdown # markdown rendering in chat
npm install date-fns       # date formatting for calendar
```

---

## Part 6 — File Map (All Files to Create/Modify)

### Backend — New Files
```
backend/app/ai_chat/__init__.py
backend/app/ai_chat/models.py
backend/app/ai_chat/schemas.py
backend/app/ai_chat/router.py
backend/app/ai_chat/service.py
backend/app/ai_chat/providers/__init__.py
backend/app/ai_chat/providers/claude.py
backend/app/ai_chat/providers/ollama.py
backend/app/ai_chat/tools/__init__.py
backend/app/ai_chat/tools/registry.py
backend/app/ai_chat/tools/leads.py
backend/app/ai_chat/tools/email.py
backend/app/ai_chat/tools/campaigns.py
backend/app/ai_chat/tools/pipeline.py
backend/app/inbox/__init__.py
backend/app/inbox/models.py
backend/app/inbox/schemas.py
backend/app/inbox/router.py
backend/app/inbox/service.py
backend/app/webhooks/__init__.py
backend/app/webhooks/router.py
backend/app/webhooks/facebook.py
backend/app/workflows/__init__.py
backend/app/workflows/models.py
backend/app/workflows/schemas.py
backend/app/workflows/router.py
backend/app/workflows/service.py
backend/app/workflows/engine.py
backend/app/reputation/__init__.py
backend/app/reputation/models.py
backend/app/reputation/schemas.py
backend/app/reputation/router.py
backend/app/reputation/service.py
backend/app/calendar/__init__.py
backend/app/calendar/models.py
backend/app/calendar/schemas.py
backend/app/calendar/router.py
backend/app/calendar/service.py
backend/app/calendar/google.py
backend/app/workers/inbox_tasks.py
backend/app/workers/workflow_tasks.py
backend/alembic/versions/0006_ai_conversations.py
backend/alembic/versions/0007_inbox.py
backend/alembic/versions/0008_workflows.py
backend/alembic/versions/0009_calendar.py
```

### Backend — Modified Files
```
backend/app/main.py              # register new routers
backend/app/config.py            # add new env vars
backend/app/workers/main.py      # register new worker tasks
backend/app/leads/service.py     # emit workflow trigger events
backend/app/senders/service.py   # add Gmail sync helpers
backend/pyproject.toml           # (no new deps needed)
```

### Frontend — New Files
```
frontend/src/app/(app)/ai/page.tsx
frontend/src/app/(app)/workflows/page.tsx
frontend/src/app/(app)/reputation/page.tsx
frontend/src/app/(app)/calendar/page.tsx
frontend/src/app/book/[slug]/page.tsx      ← public booking page
frontend/src/components/ai/AISidebar.tsx
frontend/src/components/ai/ChatMessage.tsx
frontend/src/components/ai/ModelSelector.tsx
frontend/src/components/ai/ToolResultCard.tsx
frontend/src/components/ai/StreamingText.tsx
frontend/src/store/useAIChat.ts
frontend/src/types/ai.ts
frontend/src/types/inbox.ts
frontend/src/types/workflows.ts
```

### Frontend — Modified Files
```
frontend/src/app/(app)/layout.tsx          # mount AISidebar globally
frontend/src/app/(app)/inbox/page.tsx      # replace mock with real API
frontend/src/app/(app)/settings/page.tsx   # Facebook connect in Connecteurs tab
frontend/src/components/shared/Navbar.tsx  # add AI toggle button
```

---

## Part 7 — Verification Checklist

### AI Chat
- [ ] `POST /api/v1/ai/chat` streams with Claude model
- [ ] Switch to Ollama model → streams via `localhost:11434`
- [ ] Ask AI to "score mes leads" → tool executes, scores update in DB
- [ ] Sidebar opens with `Cmd+K`, closes with `Escape`
- [ ] Conversation persists across page navigation
- [ ] `/ai` page shows full conversation history

### Unified Inbox
- [ ] Gmail sync worker runs every 5 min, threads appear in `/inbox`
- [ ] Reply from inbox → email sent via Gmail API
- [ ] Facebook Page connected → Messenger messages appear
- [ ] Lead Ad submitted → Lead auto-created in ProspectOS
- [ ] AI classification badge appears on messages

### Workflows
- [ ] Create workflow: "Lead scored > 70 → Assign to me"
- [ ] Score a lead above 70 → workflow fires, lead assigned
- [ ] Workflow run log shows success/failure

### Réputation
- [ ] Review request email sent when lead moves to "Closed Won"
- [ ] `/reputation` page displays reviews from Google/Facebook

### Calendrier
- [ ] Set availability in `/calendar` settings
- [ ] Open `/book/[slug]` in incognito → pick slot → booking created
- [ ] Google Calendar event created
- [ ] Confirmation email sent to booker
