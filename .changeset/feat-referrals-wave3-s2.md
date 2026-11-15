---
"@mj-biz-apps/referrals-entities": minor
"@mj-biz-apps/referrals-core": minor
"@mj-biz-apps/referrals-actions": minor
"@mj-biz-apps/referrals-server": minor
---

Wave 3 Slice 2 (Closed-Loop Intelligence — Schema v1.2.1): escalation engine, dynamic notifiers, reopen, and reciprocity scorecards.

- Additive escalation-lifecycle fields on `ReferralEscalation` (`DedupKey`, `LinkedTaskID`, `AcknowledgedByPersonID`, `ResolvedByPersonID`, `ResolutionNotes`; `TriggerType` widened to 6 values, `Status` widened to 4), `FeeAmount` on `ReferralOutcome`, full scorecard metrics on `ReciprocitySnapshot` (`AcceptedCount`, `ResolvedCount`, `SLABreachCount`, `AcceptanceRate`, `MedianResponseHours`, `AttributedFeeTotal`, unique per profile/period), and `ReadinessComputedAt` on `ProfessionalProfile`.
- `SlaEscalationService`: SLA-warning and urgent-unassigned evaluation, idempotent dedup-keyed escalation raising capped at the tier's `MaxEscalationLevel`, and coordinator/admin-gated acknowledge/resolve/dismiss transitions. Dynamic notifiers via `BaseEscalationNotifier` (`None`, `BizAppsTasks` — the latter discovers the sibling BizApps Tasks schema at runtime through `provider.Entities` with no static import).
- `CascadeRoutingService.ReopenExhaustedRequest`: admin-only reopen of an `Exhausted` request, excluding previously-assigned professionals and optionally expanding to the parent `PracticeArea`, auto-resolving the open `CascadeExhausted` escalation on success.
- `ReciprocityScorecardService`: `ComputeScorecard` (`ReciprocityIndex = round((Sent+1)/(Accepted+1), 3)`) and `RecomputeSnapshots` batch upsert; `MatchingEngine` can now apply a reciprocity-based match-score boost.
- New actions: `Referrals.EvaluateEscalations`, `Referrals.AcknowledgeEscalation`, `Referrals.ResolveEscalation`, `Referrals.ReopenExhaustedReferral`, `Referrals.RecomputeReciprocity`, `Referrals.GetReciprocityScorecard`.
- `ReferralsSlaSweepScheduler.RunOnce` now runs the SLA sweep followed by escalation evaluation and reports `EscalationsRaised`; a second recurring timer drives daily reciprocity recompute. `LoadBizAppsReferralsServer` accepts an `escalationNotifierKey` option (default `BizAppsTasks`, safely falling back to `None` when that notifier isn't registered).
