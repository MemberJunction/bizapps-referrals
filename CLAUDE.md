# MemberJunction BizApps Referrals — Engineering Guide

This repository contains **MemberJunction BizApps Referrals** (`mj-bizapps-referrals`), a Professional Referral & Verified Member Directory Open App built on MemberJunction (`__mj_BizAppsReferrals` schema).

> `AGENTS.md` and `CLAUDE.md` share the same engineering rules for all coding agents working in this repository.

## Repository Layout

| Package | Name | Role |
| --- | --- | --- |
| `packages/Entities` | `@mj-biz-apps/referrals-entities` | Generated entity subclasses, Zod input schemas, and `ReferralsEngineBase` |
| `packages/Core` | `@mj-biz-apps/referrals-core` | Domain services (`MatchingEngine`, `CascadeRoutingService`, `ConflictScreeningService`, `CapacityReadinessService`, `SlaEscalationService`, `ReciprocityScorecardService`, `ReferralCredentialService`, `VocabularyService`) |
| `packages/EntitiesServer` | `@mj-biz-apps/referrals-entities-server` | Server-side `BaseEntity` subclasses (`@RegisterClass`) enforcing invariants and authorization |
| `packages/Actions` | `@mj-biz-apps/referrals-actions` | MemberJunction Actions and AI rationale/advisor services (`ReferralAIRationaleService`) |
| `packages/Server` | `@mj-biz-apps/referrals-server` | Server bootstrap (`LoadBizAppsReferralsServer`), GraphQL resolvers, health probes, and SLA/reciprocity sweep scheduler |
| `packages/Angular` | `@mj-biz-apps/referrals-ng` | Explorer workspace components, embeddable Finder widget, `BaseFormPanel` hero panels, and left-rail entity forms |
| `packages/IntegrationTests` | `@mj-biz-apps/referrals-integration-tests` | Live/fixture lifecycle integration test suites |

## Common Scripts

```bash
pnpm install                      # Install workspace dependencies
pnpm run build:packages           # Build all @mj-biz-apps/referrals-* packages via Turborepo
pnpm run test                     # Run full Vitest suite across all packages
pnpm run mj:migrate               # Apply SQL Server migrations in ./migrations
pnpm run mj:migrate:convert       # Convert SQL Server migrations to PostgreSQL (./migrations-pg)
pnpm run mj:codegen               # Regenerate entity subclasses & GraphQL schemas
```

Repo guard checks (also enforced by GitHub Actions):

```bash
./.github/scripts/validate-metadata-directory-order.sh
node ./.github/scripts/check-dependency-model.mjs --self-test
node ./.github/scripts/check-dependency-model.mjs
```

## Core MemberJunction Engineering Rules

1. **Zero `any` or lazy `unknown` types** — Never use `: any`, `as any`, `<any>`, or `unknown` anywhere in TypeScript source or test files. Automated readiness tests fail on any violation.
2. **Zero `.Get()` / `.Set()` on generated entities** — Always use strongly-typed properties from `@mj-biz-apps/referrals-entities`. Wait for CodeGen before referencing new schema columns.
3. **Derive value-list unions from generated entities** — Use indexed access types (e.g., `ReferralRequestEntity['UrgencyLevel']`) instead of hand-copying CHECK-constraint literal unions.
4. **Use `BaseSingleton` / `BaseEngine` for all singletons** — Never use manual `private static _instance` fields; extend `BaseSingleton<T>` or `BaseEngine<T>` so bundler code-splitting cannot create split instances.
5. **No unnecessary cross-package re-exports** — Import types and classes directly from their owning package (`@mj-biz-apps/referrals-entities`, `@mj-biz-apps/referrals-core`, etc.).
6. **Angular & UI standards**:
   - Use modern `@if` / `@for` / `@switch` control flow and `inject()` DI.
   - Use `--mj-*` CSS design tokens exclusively (zero raw `#hex`, `rgb()`, or `hsl()` literals) and `mjButton` on every `<button>`.
   - Persist user preferences exclusively through `UserInfoEngine.Instance` (`ReferralsUiStateHelper`) — **never** `localStorage` or `sessionStorage`.
   - Guard all dynamic UUID values in `ExtraFilter` with `AssertValidUUID()`.
7. **Migrations, metadata, and protected CI files**:
   - Never edit already-released migrations (`ci/check-migration-immutability.sh`).
   - Never modify protected `ci/` pipeline files without maintainer approval.
   - Add a `.changeset/*.md` file for package changes (`minor` for migrations, `patch` for non-migration fixes/enhancements).
   - Never squash-merge PRs — preserve commit history with merge commits (`gh pr merge --merge`).

---

## 5-Rule BizApps Performance & Caching Standard

All data access and caching across `@mj-biz-apps/referrals-*` packages MUST adhere to these 5 rules:

### Rule 1: `BaseEngine` Bounded Taxonomy & Config Caching (`ReferralsEngineBase`)
- Cache **only** small, bounded reference/taxonomy/configuration entities in `ReferralsEngineBase extends BaseEngine<ReferralsEngineBase>` (`@RegisterForStartup()`):
  - `MJ_BizApps_Referrals: Jurisdictions`
  - `MJ_BizApps_Referrals: Practice Areas`
  - `MJ_BizApps_Referrals: Referral Tiers`
- Expose O(1) lazy-rebuilt indexed lookup helpers (`JurisdictionById`, `JurisdictionByCode`, `JurisdictionsByParentId`, `PracticeAreaById`, `PracticeAreaByCode`, `PracticeAreasByParentId`, `ReferralTierById`, `ReferralTierByCode`) that are cleared in `AdditionalLoading()` and `InvalidateCache()`.
- **NEVER** cache unbounded transactional entities (`Referral Requests`, `Referral Assignments`, `Professional Profiles`, `Referral Feedbacks`, `Referral Escalations`, `Referral Outcomes`, `Conflict Check Parties`, `Professional Credentials`, `Professional Availability Windows`, or `Reciprocity Snapshots`) in a global `BaseEngine`.
- Call `await ReferralsEngineBase.Instance.Config(false, contextUser, provider)` before reading cached taxonomy data so cold loads warm cleanly and warm loads incur zero network/database round-trips.

### Rule 2: Multi-Provider / Impersonation `ProviderToUse`, `CanRead` Gating, and `CacheLocal` Safety
- Always override `ProviderToUse` on app engines:
  ```ts
  public override get ProviderToUse(): IMetadataProvider {
    return this._activeProvider ?? Metadata.Provider;
  }
  ```
  This prevents `BaseEngine`'s first-wins `_provider` latch from serving stale credentials across impersonation or multi-provider sessions.
- Track `_loadedForUserId` and `_loadedForProvider` so switching users or providers automatically triggers `forceRefresh = true`, and expose `InvalidateCache()` and `IsConfiguredForUser(userId)`.
- Gate every entity config in `Config()` with a `CanRead` permission check against `md.Entities` before adding it to `params`, and clear the backing slice for any denied entity.
- Set `CacheLocal: true` **only** on shared, non-RLS reference tables (`Jurisdictions`, `Practice Areas`, `Referral Tiers`). Always set `CacheLocal: false` on any entity that has Row-Level Security (RLS) filters so per-user rows can never bleed across personas in IndexedDB/local cache.

### Rule 3: Batch Independent Reads with `rv.RunViews([...])`, `RunView.FromMetadataProvider(...)`, and `ResultType: 'simple'`
- **Never** fire `Promise.all([rv.RunView(...), rv.RunView(...)])` or sequential independent `await rv.RunView(...)` waterfalls. Collapse all independent queries into a single `rv.RunViews([...], contextUser)` batch call (1 GraphQL HTTP round-trip on the client; parallelized server execution).
- Construct `RunView` via `RunView.FromMetadataProvider(provider)` whenever an `IMetadataProvider` is in hand (or `new RunView(provider)` when an `IRunViewProvider` is passed directly).
- Use `ResultType: 'simple'` for every read-only query (dashboards, telemetry, matching, conflict screening, counts, scorecards, AI context assembly). Reserve `ResultType: 'entity_object'` strictly for queries whose returned records will be mutated via `.Save()` or `.Delete()`.

### Rule 4: Bounded Container Caches with `BaseEntity` Event Invalidation vs Never Caching Arbitrary Filtered Lists Globally
- When caching entity data scoped to a single active parent record or bounded UI container (analogous to `ConversationEngine`), key the cache by container ID, bound its size/lifetime, and invalidate entries on `BaseEntity` save/delete events via `MJGlobal.Instance.GetEventListener`.
- **Never** cache arbitrary user-filtered search results or paginated list queries in a global singleton. Dynamic queries (e.g., Finder searches, Pro Inbox filters, Escalation queues) should execute targeted, batched `RunViews` queries with `ResultType: 'simple'`.

### Rule 5: RLS-Safe Two-Step Entity Reads
- Avoid cross-entity SQL `OR` clauses or unindexed cross-table `EXISTS` / `IN (SELECT ...)` subqueries inside `ExtraFilter` that defeat query plans or interact poorly with per-entity Row-Level Security (RLS) filters.
- Instead, use clean two-step reads:
  1. Fetch authorized anchor/parent IDs from the first entity via `RunView` / `RunViews` (allowing MemberJunction to apply that entity's RLS filter cleanly).
  2. Validate every extracted UUID with `AssertValidUUID()` and query dependent child entities in a single batched `rv.RunViews` / `rv.RunView` using `ParentID IN (...)` (with `ResultType: 'simple'` when read-only).
