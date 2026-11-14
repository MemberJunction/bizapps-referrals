---
"@mj-biz-apps/referrals-ng": minor
"@mj-biz-apps/referrals-server": patch
---

Implement canonical MemberJunction Left-Rail `BaseFormComponent`s for all Referrals entities (`Referral Requests`, `Professional Profiles`, `Referral Assignments`, `Conflict Check Parties`, `Practice Areas`, `Jurisdictions`, `Referral Tiers`, `Professional Practice Areas`, `Professional Jurisdictions`, `Referral Feedbacks`) with `mj-record-form-container`, `mj-form-panel-slot`, `mj-collapsible-panel`, `mj-form-field`, and `mj-explorer-entity-data-grid`. Register and export them in `ReferralsModule` and `public-api.ts`. Export `RESOLVER_PATHS` from `@mj-biz-apps/referrals-server` for GraphQL schema discovery, and ensure `SeekerIntakeComponent` action buttons project cleanly into `mj-page-header`.
