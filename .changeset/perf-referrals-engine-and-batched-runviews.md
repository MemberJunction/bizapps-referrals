---
"@mj-biz-apps/referrals-entities": patch
"@mj-biz-apps/referrals-core": patch
"@mj-biz-apps/referrals-entities-server": patch
"@mj-biz-apps/referrals-actions": patch
"@mj-biz-apps/referrals-server": patch
"@mj-biz-apps/referrals-ng": patch
---

Add `ReferralsEngineBase` (`@RegisterForStartup()`) to cache bounded reference taxonomy and configuration entities (`Jurisdictions`, `Practice Areas`, and `Referral Tiers`) with O(1) indexed lookups, `CanRead` permission gating, multi-provider/impersonation-safe `ProviderToUse`, and automatic user/provider change invalidation. Collapse unbatched `RunView` waterfalls across Angular components, Core services, Actions, and EntitiesServer into single `rv.RunViews([...])` batch calls using `ResultType: 'simple'` for read-only loads, and add `CLAUDE.md` / `AGENTS.md` documenting the 5-Rule BizApps Performance & Caching Standard.
