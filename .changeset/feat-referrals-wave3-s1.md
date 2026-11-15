---
"@mj-biz-apps/referrals-entities": minor
"@mj-biz-apps/referrals-entities-server": minor
"@mj-biz-apps/referrals-core": minor
"@mj-biz-apps/referrals-actions": minor
"@mj-biz-apps/referrals-server": minor
"@mj-biz-apps/referrals-ng": minor
---

Wave 3 Slice 1 (Closed-Loop Intelligence — Schema v1.2.0): SLA escalation, lifecycle completion, and capacity readiness.

- New entities: `ReferralEscalation`, `ReferralOutcome`, `ProfessionalAvailabilityWindow`, `ReciprocitySnapshot`.
- Additive escalation/readiness fields on `ReferralTier`, `ReferralRequest`, `ReferralAssignment` (status widened to include `InProgress`/`Completed`), and `ProfessionalProfile`.
- `CapacityReadinessService`: effective-availability resolution against availability windows, a 5-factor `ReadinessScore`, and urgency-aware SLA deadline computation, now integrated into `MatchingEngine`.
- `CascadeRoutingService.MarkInProgress` / `CompleteReferral`: transactional lifecycle completion with authorization checks before any writes, idempotent repeat calls, a `CascadeOrder` uniqueness fix, and a 90-day rolling `AverageResponseHours`.
- New actions: `Referrals.MarkReferralInProgress`, `Referrals.CompleteReferral`, `Referrals.SetAvailabilityWindow`; registered the previously code-only `Referrals.SubmitReferralIntake` action in metadata.
- 4 new left-rail entity forms in `@mj-biz-apps/referrals-ng`.
