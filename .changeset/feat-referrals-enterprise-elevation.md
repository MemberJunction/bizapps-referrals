---
"@mj-biz-apps/referrals-core": minor
"@mj-biz-apps/referrals-ng": minor
"@mj-biz-apps/referrals-server": patch
---

Enterprise elevation for MemberJunction BizApps Referrals:
- Public-facing embeddable `<mj-referrals-finder>` Angular Element widget for association website embedding with zero `unsafe-eval` and CSP compliance.
- Domain-agnostic configurable vocabulary service (`VocabularyService`) with presets for Legal, Medical, Accounting, and Consulting.
- Upgraded `MatchingEngine` to hybrid deterministic compliance filtering + semantic & keyword similarity with explainable match reasons and SLA telemetry.
- Architectural alignment with `bizapps-orders` and `bizapps-common`: refactored away from hand-maintained custom forms to metadata-driven generated forms with `Layout: 'left-nav'`, authoring rich `BaseFormPanel` hero panels for all 10 entities plus cross-app overview panels for `People`, `Organizations`, and `Users`.
- Added Executive Referral Network Report Gallery and Verified Member Directory & Credential Explorer.
- Fixed GraphQL provider transaction resolution in browser client contexts.
