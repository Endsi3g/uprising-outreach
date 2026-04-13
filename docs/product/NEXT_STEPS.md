# Roadmap & Vision — ProspectOS ✺

_Last updated: 2026-04-13_

## Phase 1 — Intelligence Core ✅ Complete
- **Intelligence Layer**: Lead scoring engine (`ai/service.py`) integrated with Anthropic SDK.
- **Workflow Automation**: AI-generated prospecting justifications and score breakdowns.
- **Data Infrastructure**: Bulk actions (suppress/enrich/score) wired to async worker patterns.

## Phase 2 — High-Fidelity Ecosystem ✅ Complete
- **Claude Style UI**: Minimalist, serif-driven design system with zero-scrollbar aesthetics.
- **Campaign Sequence Builder**: Interactive step-based (Email/Wait) campaign architect.
- **Dynamic Kanban**: Weighted opportunity pipeline with spring-loaded animations.
- **Modular Settings**: Centralized control center for Appearance (Light/Dark/Auto), Animations, and Fonts.
- **Desktop Distribution**: Electron-powered standalone environment for local optimization.

## Phase 3 — Personalization & Extension 🚧 In Progress
- **Customization Engine**: Dedicated module for managing "Compétences" (Custom Instructions/Skills) and "Connecteurs" (MCP/App Integrations).
- **Tool Permissions**: Granular control over interactive vs. read-only tool usage.
- **Skill Authoring**: Framework for users to define their own prospecting processes and local market norms.

### Current Priorities:
- [ ] **Email OAuth Integration**: Connect real Gmail/Outlook mailboxes via OAuth2 flows.
- [ ] **Enrichment Expansion**: Integration with Apollo.io and Proxycurl for real-time contact data.
- [ ] **Unified Inbox**: Real-time conversation thread polling and classification.
- [ ] **Task Orchestrator**: Rule-based "Next Best Action" suggestions based on lead activity.

## Phase 4 — Prospect Audit Engine (Future)
- **Signal Extraction**: Headless crawling of SMB websites to extract design age, SEO health, and conversion signals.
- **Opportunity Briefs**: Claude-generated sales scripts tailored to specific website weaknesses.
- **Local SMB Dominance**: The primary differentiator for Uprising Studio in the prospecting market.

## Phase 5 — Advanced Distribution
- **CLI & IDE Sync**: "ProspectOS Code" extension for terminal-based outreach management.
- **Browser Companion**: Claude Chrome extension integration for on-the-fly lead importing.
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
