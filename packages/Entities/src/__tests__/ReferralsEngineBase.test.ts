import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  type EntityInfo,
  type IMetadataProvider,
  RunView,
  type RunViewParams,
  type RunViewResult,
  type UserInfo,
} from '@memberjunction/core';
import { REFERRALS_ENGINE_ENTITY_NAMES, ReferralsEngineBase } from '../index.js';

function makeEntityInfo(name: string, canRead: boolean): EntityInfo {
  return {
    ID: name,
    Name: name,
    BaseView: name,
    GetUserPermisions: () => ({
      CanRead: canRead,
      CanCreate: false,
      CanUpdate: false,
      CanDelete: false,
    }),
  } as Partial<EntityInfo> as EntityInfo;
}

function makeProvider(
  user: UserInfo,
  permissions: Partial<Record<string, boolean>> = {},
): IMetadataProvider {
  const entities: EntityInfo[] = Object.values(REFERRALS_ENGINE_ENTITY_NAMES).map((name) =>
    makeEntityInfo(name, permissions[name] ?? true),
  );
  return {
    CurrentUser: user,
    Entities: entities,
    EntityByName: (name: string) => entities.find((e) => e.Name.toLowerCase() === name.toLowerCase()),
    GetEntityObject: vi.fn(),
  } as Partial<IMetadataProvider> as IMetadataProvider;
}

describe('ReferralsEngineBase', () => {
  afterEach(() => {
    ReferralsEngineBase.Instance.InvalidateCache();
    vi.restoreAllMocks();
  });

  it('is a BaseSingleton caching Jurisdictions, Practice Areas, and Referral Tiers with O(1) indexed lookups', async () => {
    const engine = ReferralsEngineBase.Instance;
    expect(engine).toBe(ReferralsEngineBase.Instance);

    const runViewsSpy = vi.spyOn(RunView.prototype, 'RunViews').mockImplementation(async (params: RunViewParams[]) => {
      return params.map((p) => {
        if (p.EntityName === REFERRALS_ENGINE_ENTITY_NAMES.Jurisdictions) {
          return {
            Success: true,
            Results: [
              { ID: 'jur-us', ParentID: null, Name: 'United States', Code: 'US', IsActive: true },
              { ID: 'jur-de', ParentID: 'jur-us', Name: 'Delaware', Code: 'US-DE', IsActive: true },
              { ID: 'jur-old', ParentID: 'jur-us', Name: 'Archived Region', Code: 'US-OLD', IsActive: false },
            ],
          } as RunViewResult;
        }
        if (p.EntityName === REFERRALS_ENGINE_ENTITY_NAMES.PracticeAreas) {
          return {
            Success: true,
            Results: [
              { ID: 'pa-corp', ParentID: null, Name: 'Corporate Law', Code: 'CORP', DisplayRank: 20, IsActive: true },
              { ID: 'pa-ma', ParentID: 'pa-corp', Name: 'M&A', Code: 'CORP-MA', DisplayRank: 10, IsActive: true },
              { ID: 'pa-inactive', ParentID: null, Name: 'Retired Area', Code: 'OLD', DisplayRank: 5, IsActive: false },
            ],
          } as RunViewResult;
        }
        if (p.EntityName === REFERRALS_ENGINE_ENTITY_NAMES.ReferralTiers) {
          return {
            Success: true,
            Results: [
              { ID: 'tier-std', Name: 'Standard', Code: 'STANDARD', SLAResponseHours: 24, IsActive: true },
              { ID: 'tier-pri', Name: 'Priority', Code: 'PRIORITY', SLAResponseHours: 8, IsActive: true },
              { ID: 'tier-legacy', Name: 'Legacy', Code: 'LEGACY', SLAResponseHours: 48, IsActive: false },
            ],
          } as RunViewResult;
        }
        return { Success: true, Results: [] } as RunViewResult;
      });
    });

    const userA = { ID: 'user-a' } as Partial<UserInfo> as UserInfo;
    const providerA = makeProvider(userA);

    await engine.Config(false, userA, providerA);
    expect(runViewsSpy).toHaveBeenCalledTimes(1);

    // Verify all 3 entities loaded in one batch with CacheLocal: true (shared non-RLS reference data)
    const firstCallParams = runViewsSpy.mock.calls[0][0];
    expect(firstCallParams.map((p) => p.EntityName)).toEqual([
      REFERRALS_ENGINE_ENTITY_NAMES.Jurisdictions,
      REFERRALS_ENGINE_ENTITY_NAMES.PracticeAreas,
      REFERRALS_ENGINE_ENTITY_NAMES.ReferralTiers,
    ]);
    expect(firstCallParams.every((p) => p.CacheLocal === true)).toBe(true);

    // Verify O(1) case-insensitive lookups
    expect(engine.JurisdictionById('JUR-DE')?.Name).toBe('Delaware');
    expect(engine.JurisdictionByCode('us-de')?.ID).toBe('jur-de');
    expect(engine.JurisdictionsByParentId('JUR-US')).toHaveLength(2);
    expect(engine.JurisdictionById(null)).toBeUndefined();

    expect(engine.PracticeAreaById('PA-MA')?.Name).toBe('M&A');
    expect(engine.PracticeAreaByCode('corp')?.ID).toBe('pa-corp');
    expect(engine.PracticeAreasByParentId('PA-CORP')).toHaveLength(1);
    expect(engine.PracticeAreaByCode('')).toBeUndefined();

    expect(engine.ReferralTierById('TIER-PRI')?.SLAResponseHours).toBe(8);
    expect(engine.ReferralTierByCode('standard')?.ID).toBe('tier-std');
    expect(engine.ReferralTierById(undefined)).toBeUndefined();

    // Verify sorted Active* getters exclude inactive records
    expect(engine.ActiveJurisdictions.map((j) => j.Code)).toEqual(['US-DE', 'US']);
    expect(engine.ActivePracticeAreas.map((pa) => pa.Code)).toEqual(['CORP-MA', 'CORP']);
    expect(engine.ActiveReferralTiers.map((t) => t.Code)).toEqual(['STANDARD', 'PRIORITY']);

    // Repeat Config for the same user & provider hits memory cache without another RunViews call
    expect(engine.IsConfiguredForUser('user-a')).toBe(true);
    expect(engine.IsConfiguredForUser('user-b')).toBe(false);
    await engine.Config(false, userA, providerA);
    expect(runViewsSpy).toHaveBeenCalledTimes(1);
  });

  it('switches ProviderToUse without latching and auto-refreshes when user or provider changes', async () => {
    const engine = ReferralsEngineBase.Instance;
    const runViewsSpy = vi.spyOn(RunView.prototype, 'RunViews').mockResolvedValue([
      { Success: true, Results: [{ ID: 'jur-1', Code: 'NY', Name: 'New York', IsActive: true }] } as RunViewResult,
      { Success: true, Results: [{ ID: 'pa-1', Code: 'LIT', Name: 'Litigation', DisplayRank: 1, IsActive: true }] } as RunViewResult,
      { Success: true, Results: [{ ID: 'tier-1', Code: 'STD', Name: 'Standard', SLAResponseHours: 24, IsActive: true }] } as RunViewResult,
    ]);

    const userA = { ID: 'user-a' } as Partial<UserInfo> as UserInfo;
    const userB = { ID: 'user-b' } as Partial<UserInfo> as UserInfo;
    const providerA = makeProvider(userA);
    const providerB = makeProvider(userB);

    await engine.Config(false, userA, providerA);
    expect(engine.ProviderToUse).toBe(providerA);
    expect(engine.IsConfiguredForUser('user-a')).toBe(true);
    expect(runViewsSpy).toHaveBeenCalledTimes(1);

    // Impersonation / user switch must route through providerB and force-refresh
    await engine.Config(false, userB, providerB);
    expect(engine.ProviderToUse).toBe(providerB);
    expect(engine.IsConfiguredForUser('user-b')).toBe(true);
    expect(engine.IsConfiguredForUser('user-a')).toBe(false);
    expect(runViewsSpy).toHaveBeenCalledTimes(2);

    // InvalidateCache clears backing arrays, indexes, and user/provider state
    engine.InvalidateCache();
    expect(engine.IsConfiguredForUser('user-b')).toBe(false);
    expect(engine.Jurisdictions).toHaveLength(0);
    expect(engine.PracticeAreas).toHaveLength(0);
    expect(engine.ReferralTiers).toHaveLength(0);
    expect(engine.JurisdictionByCode('NY')).toBeUndefined();

    await engine.Config(false, userB, providerB);
    expect(runViewsSpy).toHaveBeenCalledTimes(3);
  });

  it('gates each cached entity config on CanRead against md.Entities and clears denied slices', async () => {
    const engine = ReferralsEngineBase.Instance;
    const runViewsSpy = vi.spyOn(RunView.prototype, 'RunViews').mockImplementation(async (params: RunViewParams[]) => {
      return params.map((p) => {
        if (p.EntityName === REFERRALS_ENGINE_ENTITY_NAMES.Jurisdictions) {
          return { Success: true, Results: [{ ID: 'jur-1', Code: 'CA', Name: 'California', IsActive: true }] } as RunViewResult;
        }
        if (p.EntityName === REFERRALS_ENGINE_ENTITY_NAMES.PracticeAreas) {
          return { Success: true, Results: [{ ID: 'pa-1', Code: 'IP', Name: 'IP Law', DisplayRank: 1, IsActive: true }] } as RunViewResult;
        }
        return { Success: true, Results: [{ ID: 'tier-1', Code: 'STD', Name: 'Standard', SLAResponseHours: 24, IsActive: true }] } as RunViewResult;
      });
    });

    const restrictedUser = { ID: 'user-restricted' } as Partial<UserInfo> as UserInfo;
    const restrictedProvider = makeProvider(restrictedUser, {
      [REFERRALS_ENGINE_ENTITY_NAMES.Jurisdictions]: true,
      [REFERRALS_ENGINE_ENTITY_NAMES.PracticeAreas]: true,
      [REFERRALS_ENGINE_ENTITY_NAMES.ReferralTiers]: false,
    });

    await engine.Config(false, restrictedUser, restrictedProvider);
    expect(runViewsSpy).toHaveBeenCalledTimes(1);

    const queriedEntities = runViewsSpy.mock.calls[0][0].map((p) => p.EntityName);
    expect(queriedEntities).toEqual([
      REFERRALS_ENGINE_ENTITY_NAMES.Jurisdictions,
      REFERRALS_ENGINE_ENTITY_NAMES.PracticeAreas,
    ]);
    expect(engine.Jurisdictions).toHaveLength(1);
    expect(engine.PracticeAreas).toHaveLength(1);
    expect(engine.ReferralTiers).toHaveLength(0);
    expect(engine.ReferralTierByCode('STD')).toBeUndefined();

    // User with CanRead = false on all 3 entities issues 0 RunViews calls and clears previously cached data
    const deniedUser = { ID: 'user-denied' } as Partial<UserInfo> as UserInfo;
    const deniedProvider = makeProvider(deniedUser, {
      [REFERRALS_ENGINE_ENTITY_NAMES.Jurisdictions]: false,
      [REFERRALS_ENGINE_ENTITY_NAMES.PracticeAreas]: false,
      [REFERRALS_ENGINE_ENTITY_NAMES.ReferralTiers]: false,
    });

    await engine.Config(false, deniedUser, deniedProvider);
    expect(runViewsSpy).toHaveBeenCalledTimes(1);
    expect(engine.Jurisdictions).toHaveLength(0);
    expect(engine.PracticeAreas).toHaveLength(0);
    expect(engine.ReferralTiers).toHaveLength(0);
  });
});
