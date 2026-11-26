import {
  BaseEngine,
  type BaseEnginePropertyConfig,
  type IMetadataProvider,
  Metadata,
  RegisterForStartup,
  type UserInfo,
} from '@memberjunction/core';
import type {
  mjBizAppsReferralsJurisdictionEntity,
  mjBizAppsReferralsPracticeAreaEntity,
  mjBizAppsReferralsReferralTierEntity,
} from './generated/entities/__mj_BizAppsReferrals.js';

const normalizeKey = (value: string | null | undefined): string => (value ?? '').trim().toLowerCase();

const EMPTY_METADATA_FALLBACK: IMetadataProvider = {
  Entities: [],
  EntityByName: () => undefined,
} as Partial<IMetadataProvider> as IMetadataProvider;

function ensureEntityByName(provider: IMetadataProvider | null | undefined): IMetadataProvider | null {
  if (!provider) {
    return null;
  }
  if (typeof provider.EntityByName === 'function') {
    return provider;
  }
  return Object.create(provider, {
    EntityByName: {
      configurable: true,
      enumerable: false,
      value: (name: string) =>
        (provider.Entities ?? []).find((e) => normalizeKey(e.Name) === normalizeKey(name)),
    },
  }) as IMetadataProvider;
}

export const REFERRALS_ENGINE_ENTITY_NAMES = {
  Jurisdictions: 'MJ_BizApps_Referrals: Jurisdictions',
  PracticeAreas: 'MJ_BizApps_Referrals: Practice Areas',
  ReferralTiers: 'MJ_BizApps_Referrals: Referral Tiers',
} as const;

/**
 * Browser- and server-safe metadata cache engine for MemberJunction BizApps Referrals.
 *
 * Caches bounded taxonomy and configuration reference tables:
 * - `MJ_BizApps_Referrals: Jurisdictions` (`CacheLocal: true` — shared non-RLS reference table)
 * - `MJ_BizApps_Referrals: Practice Areas` (`CacheLocal: true` — shared non-RLS reference table)
 * - `MJ_BizApps_Referrals: Referral Tiers` (`CacheLocal: true` — shared non-RLS reference table)
 *
 * Never caches unbounded transactional entities (`Referral Requests`, `Referral Assignments`,
 * `Professional Profiles`, `Referral Feedbacks`, `Referral Escalations`, `Referral Outcomes`,
 * `Conflict Check Parties`, `Professional Credentials`, `Professional Availability Windows`,
 * or `Reciprocity Snapshots`).
 *
 * Features:
 * - Dynamic `ProviderToUse` override so multi-provider / impersonation sessions never latch
 *   onto the first provider.
 * - Automatic user-change and provider-change force-refresh with `IsConfiguredForUser()` and
 *   `InvalidateCache()`.
 * - `CanRead` permission gating against `md.Entities` before adding each entity config.
 * - O(1) lazy-rebuilt indexed lookup helpers reset in `AdditionalLoading()` and `InvalidateCache()`.
 */
@RegisterForStartup()
export class ReferralsEngineBase extends BaseEngine<ReferralsEngineBase> {
  private _jurisdictions: mjBizAppsReferralsJurisdictionEntity[] = [];
  private _practiceAreas: mjBizAppsReferralsPracticeAreaEntity[] = [];
  private _referralTiers: mjBizAppsReferralsReferralTierEntity[] = [];

  private _jurisdictionsById: Map<string, mjBizAppsReferralsJurisdictionEntity> | null = null;
  private _jurisdictionsByCode: Map<string, mjBizAppsReferralsJurisdictionEntity> | null = null;
  private _jurisdictionsByParentId: Map<string, mjBizAppsReferralsJurisdictionEntity[]> | null = null;

  private _practiceAreasById: Map<string, mjBizAppsReferralsPracticeAreaEntity> | null = null;
  private _practiceAreasByCode: Map<string, mjBizAppsReferralsPracticeAreaEntity> | null = null;
  private _practiceAreasByParentId: Map<string, mjBizAppsReferralsPracticeAreaEntity[]> | null = null;

  private _referralTiersById: Map<string, mjBizAppsReferralsReferralTierEntity> | null = null;
  private _referralTiersByCode: Map<string, mjBizAppsReferralsReferralTierEntity> | null = null;

  private _loadedForUserId: string | null = null;
  private _loadedForProvider: IMetadataProvider | null = null;
  private _cacheInvalidated = false;
  private _activeProvider: IMetadataProvider | null = null;

  protected constructor() {
    super();
  }

  public static get Instance(): ReferralsEngineBase {
    return super.getInstance<ReferralsEngineBase>();
  }

  /**
   * Always routes RunViews through the active provider passed to `Config()` (or live
   * `Metadata.Provider` in browser sessions) instead of BaseEngine's first-wins `_provider`
   * latch — essential so impersonation and multi-provider sessions never read through a stale
   * provider.
   */
  public override get ProviderToUse(): IMetadataProvider {
    return this._activeProvider ?? ensureEntityByName(Metadata.Provider) ?? EMPTY_METADATA_FALLBACK;
  }

  public async Config(
    forceRefresh?: boolean,
    contextUser?: UserInfo,
    provider?: IMetadataProvider,
  ): Promise<void> {
    this._activeProvider = ensureEntityByName(provider);
    const md = this.ProviderToUse;
    const effectiveUser = contextUser ?? md?.CurrentUser;
    const nextUserId = normalizeKey(effectiveUser?.ID);
    const userChanged =
      this._loadedForUserId !== null &&
      nextUserId.length > 0 &&
      this._loadedForUserId !== nextUserId;
    const providerChanged =
      provider != null &&
      this._loadedForProvider !== null &&
      this._loadedForProvider !== provider;
    const shouldForceRefresh = Boolean(forceRefresh || this._cacheInvalidated || userChanged || providerChanged);

    // All three cached entities are shared, non-RLS reference taxonomy/config tables
    // (safe for CacheLocal: true). Each entry is gated on CanRead against md.Entities.
    const canReadJurisdictions = this.canReadEntity(md, REFERRALS_ENGINE_ENTITY_NAMES.Jurisdictions, effectiveUser);
    const canReadPracticeAreas = this.canReadEntity(md, REFERRALS_ENGINE_ENTITY_NAMES.PracticeAreas, effectiveUser);
    const canReadReferralTiers = this.canReadEntity(md, REFERRALS_ENGINE_ENTITY_NAMES.ReferralTiers, effectiveUser);

    const params: Array<Partial<BaseEnginePropertyConfig>> = [];

    if (canReadJurisdictions) {
      params.push({
        PropertyName: '_jurisdictions',
        EntityName: REFERRALS_ENGINE_ENTITY_NAMES.Jurisdictions,
        CacheLocal: true,
      });
    } else {
      this._jurisdictions = [];
    }

    if (canReadPracticeAreas) {
      params.push({
        PropertyName: '_practiceAreas',
        EntityName: REFERRALS_ENGINE_ENTITY_NAMES.PracticeAreas,
        CacheLocal: true,
      });
    } else {
      this._practiceAreas = [];
    }

    if (canReadReferralTiers) {
      params.push({
        PropertyName: '_referralTiers',
        EntityName: REFERRALS_ENGINE_ENTITY_NAMES.ReferralTiers,
        CacheLocal: true,
      });
    } else {
      this._referralTiers = [];
    }

    if (params.length === 0) {
      this.resetLookupIndexes();
      this._loadedForUserId = nextUserId || null;
      this._loadedForProvider = provider ?? null;
      this._cacheInvalidated = false;
      return;
    }

    await this.Load(params, md, shouldForceRefresh, effectiveUser);
    this._loadedForUserId = nextUserId || null;
    this._loadedForProvider = provider ?? null;
    this._cacheInvalidated = false;
  }

  protected override async AdditionalLoading(_contextUser?: UserInfo): Promise<void> {
    this.resetLookupIndexes();
  }

  /**
   * Clears O(1) lookup maps, cached taxonomy slices, and provider binding so the next `Config()`
   * performs a fresh load under the active user and provider.
   */
  public InvalidateCache(): void {
    this._cacheInvalidated = true;
    this._loadedForUserId = null;
    this._loadedForProvider = null;
    this._activeProvider = null;
    this._jurisdictions = [];
    this._practiceAreas = [];
    this._referralTiers = [];
    this.resetLookupIndexes();
  }

  public IsConfiguredForUser(userId: string | null | undefined): boolean {
    if (!this.Loaded || this._cacheInvalidated) {
      return false;
    }
    const norm = normalizeKey(userId);
    if (!norm) {
      return this._loadedForUserId !== null;
    }
    return this._loadedForUserId === norm;
  }

  private canReadEntity(
    md: IMetadataProvider | null | undefined,
    entityName: string,
    contextUser: UserInfo | undefined,
  ): boolean {
    if (!md) {
      return true;
    }
    const entities = md.Entities;
    if (Array.isArray(entities) && entities.length > 0) {
      const target = normalizeKey(entityName);
      const entityInfo = entities.find((e) => normalizeKey(e.Name) === target);
      if (!entityInfo) {
        return false;
      }
      if (contextUser && typeof entityInfo.GetUserPermisions === 'function') {
        return Boolean(entityInfo.GetUserPermisions(contextUser)?.CanRead);
      }
      return true;
    }
    if (typeof md.EntityByName === 'function') {
      const entityInfo = md.EntityByName(entityName);
      if (entityInfo && contextUser && typeof entityInfo.GetUserPermisions === 'function') {
        return Boolean(entityInfo.GetUserPermisions(contextUser)?.CanRead);
      }
    }
    return true;
  }

  private resetLookupIndexes(): void {
    this._jurisdictionsById = null;
    this._jurisdictionsByCode = null;
    this._jurisdictionsByParentId = null;
    this._practiceAreasById = null;
    this._practiceAreasByCode = null;
    this._practiceAreasByParentId = null;
    this._referralTiersById = null;
    this._referralTiersByCode = null;
  }

  public get Jurisdictions(): readonly mjBizAppsReferralsJurisdictionEntity[] {
    return this.GetConfigData<mjBizAppsReferralsJurisdictionEntity>('_jurisdictions');
  }

  public get ActiveJurisdictions(): readonly mjBizAppsReferralsJurisdictionEntity[] {
    return this.Jurisdictions
      .filter((j) => j.IsActive !== false)
      .slice()
      .sort((a, b) => (a.Name ?? '').localeCompare(b.Name ?? ''));
  }

  public get PracticeAreas(): readonly mjBizAppsReferralsPracticeAreaEntity[] {
    return this.GetConfigData<mjBizAppsReferralsPracticeAreaEntity>('_practiceAreas');
  }

  public get ActivePracticeAreas(): readonly mjBizAppsReferralsPracticeAreaEntity[] {
    return this.PracticeAreas
      .filter((pa) => pa.IsActive !== false)
      .slice()
      .sort((a, b) => {
        const rankDiff = (a.DisplayRank ?? 100) - (b.DisplayRank ?? 100);
        if (rankDiff !== 0) {
          return rankDiff;
        }
        return (a.Name ?? '').localeCompare(b.Name ?? '');
      });
  }

  public get ReferralTiers(): readonly mjBizAppsReferralsReferralTierEntity[] {
    return this.GetConfigData<mjBizAppsReferralsReferralTierEntity>('_referralTiers');
  }

  public get ActiveReferralTiers(): readonly mjBizAppsReferralsReferralTierEntity[] {
    return this.ReferralTiers
      .filter((t) => t.IsActive !== false)
      .slice()
      .sort((a, b) => {
        const slaDiff = (b.SLAResponseHours ?? 0) - (a.SLAResponseHours ?? 0);
        if (slaDiff !== 0) {
          return slaDiff;
        }
        return (a.Name ?? '').localeCompare(b.Name ?? '');
      });
  }

  private ensureJurisdictionMaps(): void {
    if (!this._jurisdictionsById || !this._jurisdictionsByCode || !this._jurisdictionsByParentId) {
      const byId = new Map<string, mjBizAppsReferralsJurisdictionEntity>();
      const byCode = new Map<string, mjBizAppsReferralsJurisdictionEntity>();
      const byParent = new Map<string, mjBizAppsReferralsJurisdictionEntity[]>();
      for (const jur of this.Jurisdictions) {
        if (jur.ID) {
          byId.set(normalizeKey(jur.ID), jur);
        }
        if (jur.Code) {
          byCode.set(normalizeKey(jur.Code), jur);
        }
        const parentKey = normalizeKey(jur.ParentID);
        if (parentKey) {
          const list = byParent.get(parentKey) ?? [];
          list.push(jur);
          byParent.set(parentKey, list);
        }
      }
      this._jurisdictionsById = byId;
      this._jurisdictionsByCode = byCode;
      this._jurisdictionsByParentId = byParent;
    }
  }

  public JurisdictionById(id: string | null | undefined): mjBizAppsReferralsJurisdictionEntity | undefined {
    const key = normalizeKey(id);
    if (!key) return undefined;
    this.ensureJurisdictionMaps();
    return this._jurisdictionsById?.get(key);
  }

  public JurisdictionByCode(code: string | null | undefined): mjBizAppsReferralsJurisdictionEntity | undefined {
    const key = normalizeKey(code);
    if (!key) return undefined;
    this.ensureJurisdictionMaps();
    return this._jurisdictionsByCode?.get(key);
  }

  public JurisdictionsByParentId(parentId: string | null | undefined): readonly mjBizAppsReferralsJurisdictionEntity[] {
    const key = normalizeKey(parentId);
    if (!key) return [];
    this.ensureJurisdictionMaps();
    return this._jurisdictionsByParentId?.get(key) ?? [];
  }

  private ensurePracticeAreaMaps(): void {
    if (!this._practiceAreasById || !this._practiceAreasByCode || !this._practiceAreasByParentId) {
      const byId = new Map<string, mjBizAppsReferralsPracticeAreaEntity>();
      const byCode = new Map<string, mjBizAppsReferralsPracticeAreaEntity>();
      const byParent = new Map<string, mjBizAppsReferralsPracticeAreaEntity[]>();
      for (const pa of this.PracticeAreas) {
        if (pa.ID) {
          byId.set(normalizeKey(pa.ID), pa);
        }
        if (pa.Code) {
          byCode.set(normalizeKey(pa.Code), pa);
        }
        const parentKey = normalizeKey(pa.ParentID);
        if (parentKey) {
          const list = byParent.get(parentKey) ?? [];
          list.push(pa);
          byParent.set(parentKey, list);
        }
      }
      this._practiceAreasById = byId;
      this._practiceAreasByCode = byCode;
      this._practiceAreasByParentId = byParent;
    }
  }

  public PracticeAreaById(id: string | null | undefined): mjBizAppsReferralsPracticeAreaEntity | undefined {
    const key = normalizeKey(id);
    if (!key) return undefined;
    this.ensurePracticeAreaMaps();
    return this._practiceAreasById?.get(key);
  }

  public PracticeAreaByCode(code: string | null | undefined): mjBizAppsReferralsPracticeAreaEntity | undefined {
    const key = normalizeKey(code);
    if (!key) return undefined;
    this.ensurePracticeAreaMaps();
    return this._practiceAreasByCode?.get(key);
  }

  public PracticeAreasByParentId(parentId: string | null | undefined): readonly mjBizAppsReferralsPracticeAreaEntity[] {
    const key = normalizeKey(parentId);
    if (!key) return [];
    this.ensurePracticeAreaMaps();
    return this._practiceAreasByParentId?.get(key) ?? [];
  }

  private ensureReferralTierMaps(): void {
    if (!this._referralTiersById || !this._referralTiersByCode) {
      const byId = new Map<string, mjBizAppsReferralsReferralTierEntity>();
      const byCode = new Map<string, mjBizAppsReferralsReferralTierEntity>();
      for (const tier of this.ReferralTiers) {
        if (tier.ID) {
          byId.set(normalizeKey(tier.ID), tier);
        }
        if (tier.Code) {
          byCode.set(normalizeKey(tier.Code), tier);
        }
      }
      this._referralTiersById = byId;
      this._referralTiersByCode = byCode;
    }
  }

  public ReferralTierById(id: string | null | undefined): mjBizAppsReferralsReferralTierEntity | undefined {
    const key = normalizeKey(id);
    if (!key) return undefined;
    this.ensureReferralTierMaps();
    return this._referralTiersById?.get(key);
  }

  public ReferralTierByCode(code: string | null | undefined): mjBizAppsReferralsReferralTierEntity | undefined {
    const key = normalizeKey(code);
    if (!key) return undefined;
    this.ensureReferralTierMaps();
    return this._referralTiersByCode?.get(key);
  }
}
