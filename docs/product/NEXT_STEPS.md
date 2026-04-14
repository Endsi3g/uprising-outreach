# Roadmap & Vision — ProspectOS ✺

_Last updated: 2026-04-13_

## Phase 1 — Intelligence Core ✅ Complete
- **Intelligence Layer**: Lead scoring engine (`ai/service.py`) integrated with ProspectOS AI SDK.
- **Workflow Automation**: AI-generated prospecting justifications and score breakdowns.
- **Data Infrastructure**: Bulk actions (suppress/enrich/score) wired to async worker patterns.

## Phase 2 — High-Fidelity Ecosystem ✅ Complete
- **ProspectOS Style UI**: Minimalist, serif-driven design system with zero-scrollbar aesthetics.
- **Campaign Sequence Builder**: Interactive step-based (Email/Wait) campaign architect.
- **Dynamic Kanban**: Weighted opportunity pipeline with spring-loaded animations.
- **Modular Settings**: Centralized control center for Appearance (Light/Dark/Auto), Animations, and Fonts.
- **Desktop Distribution**: Electron-powered standalone environment for local optimization.

## Phase 3 — Personalization & Extension 🚧 In Progress
- **Customization Engine**: Dedicated module for managing "Compétences" (Custom Instructions/Skills) and "Connecteurs" (MCP/App Integrations).
- **Tool Permissions**: Granular control over interactive vs. read-only tool usage.
- **Skill Authoring**: Framework for users to define their own prospecting processes and local market norms.

### Current Priorities:
- [x] **DB Migrations (Skills & Connectors)**: `0005_customization.py` — tables were defined in Python but never migrated; now fixed.
- [x] **Email OAuth Integration**: OAuth2 flows for Gmail and Outlook implemented. Backend: `senders/oauth.py` (authorize + callback endpoints). Frontend: Settings → Connecteurs tab with connect buttons + live account list.
- [ ] **Unified Inbox**: Backend models, sync worker, and AI classification needed. Frontend shell exists at `inbox/page.tsx`.
- [ ] **Enrichment Expansion**: Integration with Apollo.io and Proxycurl for real-time contact data. Current enrichment is a stub mock.
- [ ] **Task Orchestrator**: Rule-based "Next Best Action" suggestions based on lead activity. Schema field exists; logic is completely missing.

## Phase 4 — Prospect Audit Engine (Future)
- **Signal Extraction**: Headless crawling of SMB websites to extract design age, SEO health, and conversion signals.
- **Opportunity Briefs**: AI-generated sales scripts tailored to specific website weaknesses.
- **Local SMB Dominance**: The primary differentiator for Uprising Studio in the prospecting market.

## Phase 5 — Advanced Distribution
- **CLI & IDE Sync**: "ProspectOS Code" extension for terminal-based outreach management.
- **Browser Companion**: ProspectOS Chrome extension integration for on-the-fly lead importing.
- **Voice Parameters**: Implementation of the vocal parameter system built in Settings for automated outreach calls.

---

## Infrastructure & Quality
| System | Status | Notes |
|---|---|---|
| **Production Build** | ✅ Pass | Verified via `npx next build` |
| **Electron Setup** | ✅ Ready | `npm run dev:electron` operational |
| **Theme Sync** | ✅ Dynamic | Supports System/Auto preference |
| **Backend CI** | 🚧 Pending | Integration tests for AI scoring engine |
| **GDPR Export** | 📅 Backlog | Mandatory before public release |

---
**Vision:** ProspectOS is not just a CRM; it is an intelligent extension of the human sales team, powered by a calm, focused interface that prioritizes speed and clarity over complexity.
