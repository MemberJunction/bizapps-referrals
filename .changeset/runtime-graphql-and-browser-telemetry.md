---
"@mj-biz-apps/referrals-core": patch
"@mj-biz-apps/referrals-server": patch
---

Replace Node-only `@memberjunction/health` `RouteScrubber` import in `ReferralTelemetry.ts` with a browser-safe `ScrubRoute` helper, add explicit `@Field(() => ...)` GraphQL type thunks for nullable input fields in `__mj_BizAppsReferrals.ts`, and update synced metadata primary keys.
