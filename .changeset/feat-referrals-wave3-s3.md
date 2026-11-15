---
"@mj-biz-apps/referrals-entities": minor
"@mj-biz-apps/referrals-core": minor
"@mj-biz-apps/referrals-actions": minor
---

Wave 3 Slice 3 (Closed-Loop Intelligence - AI Match Rationale & Escalation Advisor): client-safe operation bases, server AI implementation, and prompt/agent metadata.

- Migration consolidation: folded the former v1.2.1 migration directly into `V202611151000__v1.2.0__SLA_Escalation_Outcomes_And_Readiness` (both dialects) so there is exactly one migration per dialect, per Spec SS2.1. Added `ReferralEscalation.AIRationaleJSON`.
- `packages/Core/src/operations/ai-operations.ts`: client-safe `ExplainMatchOperationBase` and `RecommendEscalationOperationBase` (`BaseRemotableOperation` subclasses declaring only `OperationKey` and typed input/output, no server implementation). `@mj-biz-apps/referrals-core` continues to declare zero `@memberjunction/ai-*` dependencies.
- `packages/Actions/src/ai/`: `IReferralPromptExecutor` / `MJReferralPromptExecutor` (thin wrapper over `AIPromptRunner` + `AIEngineBase` prompt lookup by name) and `ReferralAIRationaleService`:
  - `BuildRationaleContext` passes the AI advisor only practice area/jurisdiction names, urgency, tier, conflict-party counts per role, and each candidate's match score/breakdown/explainable reasons/readiness/reciprocity - never seeker PII, matter text, or party names.
  - `ExplainMatch` persists a `{Source, Summary, Rationale, Risks[], GeneratedAt}` rationale onto every `Offered`/`Queued` `ReferralAssignment`, dropping any AI entry whose ID isn't in the candidate set and falling back to a deterministic rationale built from `ExplainableMatchReasons` whenever the AI output is missing/invalid; never throws.
  - `RecommendEscalationAction` persists a validated `RecommendedAction` + rationale on the escalation, skips the AI call when a rationale already exists (unless `Force`), and never mutates `Status`, `EscalationLevel`, `CascadeOrder`, or any assignment row.
- New actions: `Referrals.ExplainMatch`, `Referrals.RecommendEscalationAction`, registered as both `BaseRemotableOperation` and `BaseAction` subclasses.
- New prompts `Referrals Match Rationale` and `Referrals Escalation Advisor`; new Loop agent `Referrals Escalation Advisor` linked to the escalation/reciprocity/explain actions; Wave 3 lifecycle/reopen actions linked to the existing `Referrals Triage & Concierge` agent.
- `@memberjunction/ai-prompts`, `@memberjunction/ai-core-plus`, `@memberjunction/ai-engine-base` pinned to `6.2.1` in `packages/Actions/package.json` only.
