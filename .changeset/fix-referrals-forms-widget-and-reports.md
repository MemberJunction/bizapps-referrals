---
"@mj-biz-apps/referrals-ng": patch
---

Restore `@RegisterClass(BaseFormComponent, ...)` registrations for all 10 Referrals entity forms, fix `proto.hasOwnProperty` runtime error in the standalone `<mj-referrals-finder>` Angular Element bundle (and support case-insensitive `domain` attribute), and register/wire `ReferralsReportGalleryComponent` (`ReferralsReportGalleryResource`) into the Referrals application navigation with domain filtering, semantic match quality, practice area demand, partner payout ledger, and live supply-demand matrix.
