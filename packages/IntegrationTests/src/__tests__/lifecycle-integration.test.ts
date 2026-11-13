import { describe, expect, it, vi } from 'vitest';
import {
  DatabaseProviderBase,
  IMetadataProvider,
  IRunViewProvider,
  RunViewParams,
  RunViewResult,
  UserInfo,
} from '@memberjunction/core';
import { BaseHealthProbe, HealthProbeContext, LiveEntityCrudProbe } from '@memberjunction/health';
import {
  CascadeRoutingService,
  MatchingEngine,
  NormalizePartyName,
} from '@mj-biz-apps/referrals-core';
import {
  ConflictCheckPartyEntity,
  ProfessionalJurisdictionEntity,
  ProfessionalPracticeAreaEntity,
  ProfessionalProfileEntity,
  ReferralAssignmentEntity,
  ReferralRequestEntity,
  ReferralTierEntity,
} from '@mj-biz-apps/referrals-entities';
import { ReferralLifecycleProbe } from '../ReferralLifecycleProbe.js';

interface EntityStore {
  profiles: ProfessionalProfileEntity[];
  practiceLinks: ProfessionalPracticeAreaEntity[];
  jurisdictionLinks: ProfessionalJurisdictionEntity[];
  tiers: ReferralTierEntity[];
  requests: ReferralRequestEntity[];
  conflictParties: ConflictCheckPartyEntity[];
  assignments: ReferralAssignmentEntity[];
}

function makeEntity<T extends object>(data: Partial<T> & { ID: string }, storeList: T[]): T {
  const obj = {
    ...data,
    Save: async () => {
      const idx = storeList.findIndex((item) => (item as { ID: string }).ID === obj.ID);
      if (idx >= 0) {
        storeList[idx] = obj as T;
      } else {
        storeList.push(obj as T);
      }
      return true;
    },
    Load: async (id: string) => {
      const found = storeList.find((item) => (item as { ID: string }).ID === id);
      if (!found) return false;
      const { Save: _s, Load: _l, ...rest } = found as Record<string, unknown>;
      Object.assign(obj, rest);
      return true;
    },
  };
  return obj as T;
}

function createInMemoryProvider(store: EntityStore): IMetadataProvider & IRunViewProvider {
  let seq = 1;
  const nextId = (prefix: string) => `${prefix}-${seq++}`;

  const runSingle = async <T>(params: RunViewParams): Promise<RunViewResult<T>> => {
    const filter = params.ExtraFilter ?? '';
    let results: unknown[] = [];

    if (params.EntityName === 'MJ_BizApps_Referrals: Professional Profiles') {
      results = store.profiles.filter((p) => p.IsActive && p.VerificationStatus === 'Verified');
    } else if (params.EntityName === 'MJ_BizApps_Referrals: Professional Practice Areas') {
      results = store.practiceLinks.filter((l) => filter.includes(l.PracticeAreaID));
    } else if (params.EntityName === 'MJ_BizApps_Referrals: Professional Jurisdictions') {
      results = store.jurisdictionLinks.filter((l) => filter.includes(l.JurisdictionID));
    } else if (params.EntityName === 'MJ_BizApps_Referrals: Conflict Check Parties') {
      const match = /ReferralRequestID = '([^']+)'/.exec(filter);
      results = match ? store.conflictParties.filter((c) => c.ReferralRequestID === match[1]) : store.conflictParties;
    } else if (params.EntityName === 'MJ_BizApps_Referrals: Referral Assignments') {
      if (filter.includes("Status IN ('Offered', 'Accepted')")) {
        results = store.assignments.filter((a) => a.Status === 'Offered' || a.Status === 'Accepted');
      } else if (filter.includes("Status = 'Queued'")) {
        const reqMatch = /ReferralRequestID = '([^']+)'/.exec(filter);
        results = store.assignments
          .filter((a) => (!reqMatch || a.ReferralRequestID === reqMatch[1]) && a.Status === 'Queued')
          .sort((a, b) => a.CascadeOrder - b.CascadeOrder);
        if (params.MaxRows === 1 && results.length > 1) {
          results = [results[0]];
        }
      } else if (filter.includes("Status = 'Offered' AND SLADeadlineAt <")) {
        const dateMatch = /SLADeadlineAt < '([^']+)'/.exec(filter);
        const cutoff = dateMatch ? new Date(dateMatch[1]).getTime() : Date.now();
        results = store.assignments.filter(
          (a) => a.Status === 'Offered' && a.SLADeadlineAt != null && new Date(a.SLADeadlineAt).getTime() < cutoff,
        );
      } else {
        const reqMatch = /ReferralRequestID = '([^']+)'/.exec(filter);
        results = reqMatch ? store.assignments.filter((a) => a.ReferralRequestID === reqMatch[1]) : store.assignments;
      }
    }

    return {
      Success: true,
      Results: results as T[],
      RowCount: results.length,
      TotalRowCount: results.length,
      ExecutionTime: 1,
      UserView: null,
      ErrorMessage: '',
    };
  };

  return {
    RunView: runSingle,
    RunViews: async (views: RunViewParams[]) => Promise.all(views.map((v) => runSingle(v))),
    GetEntityObject: async <T>(entityName: string) => {
      if (entityName === 'MJ_BizApps_Referrals: Referral Requests') {
        return makeEntity<ReferralRequestEntity>({ ID: nextId('req') } as ReferralRequestEntity, store.requests) as unknown as T;
      }
      if (entityName === 'MJ_BizApps_Referrals: Referral Tiers') {
        return makeEntity<ReferralTierEntity>({ ID: nextId('tier') } as ReferralTierEntity, store.tiers) as unknown as T;
      }
      if (entityName === 'MJ_BizApps_Referrals: Referral Assignments') {
        return makeEntity<ReferralAssignmentEntity>({ ID: nextId('assign') } as ReferralAssignmentEntity, store.assignments) as unknown as T;
      }
      if (entityName === 'MJ_BizApps_Referrals: Professional Profiles') {
        return makeEntity<ProfessionalProfileEntity>({ ID: nextId('pro') } as ProfessionalProfileEntity, store.profiles) as unknown as T;
      }
      throw new Error(`Unsupported entity: ${entityName}`);
    },
  } as unknown as IMetadataProvider & IRunViewProvider;
}

describe('@mj-biz-apps/referrals-integration-tests', () => {
  const mockUser = { ID: 'user-ops-1', Name: 'Ops User' } as UserInfo;

  it('simulates complete lifecycle: intake -> conflict rejection -> cascade -> sweep -> accept', async () => {
    const practiceAreaId = 'pa-corp';
    const jurisdictionId = 'jur-ca';
    const tierId = 'tier-priority';

    const store: EntityStore = {
      profiles: [],
      practiceLinks: [],
      jurisdictionLinks: [],
      tiers: [],
      requests: [],
      conflictParties: [],
      assignments: [],
    };

    // Seed tier
    store.tiers.push(
      makeEntity<ReferralTierEntity>(
        {
          ID: tierId,
          Name: 'Priority Concierge',
          Code: 'PRIORITY',
          SLAResponseHours: 8,
          MaxCascadeAttempts: 3,
        } as ReferralTierEntity,
        store.tiers,
      ),
    );

    // Seed 3 professionals: Pro-1 (conflicted), Pro-2 (will expire SLA), Pro-3 (will accept)
    const pro1 = makeEntity<ProfessionalProfileEntity>(
      {
        ID: 'pro-1',
        DisplayName: 'Conflicted Counsel',
        FirmName: 'Rival Corp LLP',
        Email: 'counsel@rivalcorp.com',
        VerificationStatus: 'Verified',
        AvailabilityStatus: 'Available',
        ActiveReferralCount: 0,
        MaxConcurrentReferrals: 10,
        AverageResponseHours: 2,
        AverageRating: 5.0,
        TotalAcceptedCount: 0,
        IsActive: true,
      } as ProfessionalProfileEntity,
      store.profiles,
    );
    const pro2 = makeEntity<ProfessionalProfileEntity>(
      {
        ID: 'pro-2',
        DisplayName: 'Busy Counsel',
        FirmName: 'Alpha Partners',
        Email: 'busy@alphapartners.com',
        VerificationStatus: 'Verified',
        AvailabilityStatus: 'Available',
        ActiveReferralCount: 1,
        MaxConcurrentReferrals: 10,
        AverageResponseHours: 2,
        AverageRating: 4.9,
        TotalAcceptedCount: 0,
        IsActive: true,
      } as ProfessionalProfileEntity,
      store.profiles,
    );
    const pro3 = makeEntity<ProfessionalProfileEntity>(
      {
        ID: 'pro-3',
        DisplayName: 'Ready Counsel',
        FirmName: 'Beacon Law LLP',
        Email: 'ready@beaconlaw.com',
        VerificationStatus: 'Verified',
        AvailabilityStatus: 'Available',
        ActiveReferralCount: 2,
        MaxConcurrentReferrals: 10,
        AverageResponseHours: 4,
        AverageRating: 4.7,
        TotalAcceptedCount: 0,
        IsActive: true,
      } as ProfessionalProfileEntity,
      store.profiles,
    );
    store.profiles.push(pro1, pro2, pro3);

    for (const proId of ['pro-1', 'pro-2', 'pro-3']) {
      store.practiceLinks.push({
        ID: `ppa-${proId}`,
        ProfessionalProfileID: proId,
        PracticeAreaID: practiceAreaId,
        ProficiencyLevel: 'Primary',
        YearsInPractice: 10,
        IsPrimary: true,
      } as ProfessionalPracticeAreaEntity);
      store.jurisdictionLinks.push({
        ID: `pj-${proId}`,
        ProfessionalProfileID: proId,
        JurisdictionID: jurisdictionId,
        StandingStatus: 'GoodStanding',
        IsPrimary: true,
      } as ProfessionalJurisdictionEntity);
    }

    // 1. Intake: Create ReferralRequest + ConflictCheckParty matching Pro-1's firm
    const req = makeEntity<ReferralRequestEntity>(
      {
        ID: 'req-1',
        RequestNumber: 'REF-20261113-001',
        SeekerName: 'Sam Seeker',
        SeekerEmail: 'sam@seeker.example.com',
        PracticeAreaID: practiceAreaId,
        JurisdictionID: jurisdictionId,
        ReferralTierID: tierId,
        MatterTitle: 'Commercial Dispute',
        MatterSummary: 'Dispute with Rival Corp.',
        Status: 'Submitted',
        CurrentCascadeStep: 0,
      } as ReferralRequestEntity,
      store.requests,
    );
    store.requests.push(req);
    store.conflictParties.push({
      ID: 'cp-1',
      ReferralRequestID: 'req-1',
      PartyName: 'Rival Corp Inc.',
      PartyRole: 'Adverse',
      OrganizationName: 'Rival Corp LLP',
      NormalizedName: NormalizePartyName('Rival Corp Inc.'),
    } as ConflictCheckPartyEntity);

    const provider = createInMemoryProvider(store);

    // 2. Match & Route: Pro-1 is ConflictRejected; Pro-2 is Offered (#1); Pro-3 is Queued (#2)
    const matches = await MatchingEngine.FindMatches(
      { PracticeAreaID: practiceAreaId, JurisdictionID: jurisdictionId, SLAResponseHours: 8 },
      mockUser,
      provider,
      'req-1',
    );
    expect(matches.find((m) => m.ProfessionalProfileID === 'pro-1')?.ConflictStatus).toBe('ConflictFound');

    const routeRes = await CascadeRoutingService.RouteReferralRequest('req-1', mockUser, provider);
    expect(routeRes.Status).toBe('Routed');
    expect(routeRes.ConflictRejectedCount).toBe(1);
    expect(routeRes.TotalQueued).toBe(2);
    expect(routeRes.ActiveProfessionalID).toBe('pro-2');

    // 3. Sweep expired SLAs (simulate 10 hours later)
    const tenHoursLater = new Date(Date.now() + 10 * 60 * 60 * 1000);
    const sweepRes = await CascadeRoutingService.SweepExpiredSLAs(tenHoursLater, mockUser, provider);
    expect(sweepRes.ExpiredCount).toBe(1);
    expect(sweepRes.CascadedCount).toBe(1);

    // Pro-3's assignment should now be Offered
    const pro3Offer = store.assignments.find((a) => a.ProfessionalProfileID === 'pro-3' && a.Status === 'Offered');
    expect(pro3Offer).toBeDefined();

    // 4. Pro-3 accepts the cascaded offer
    const acceptOutcome = await CascadeRoutingService.RespondToAssignment(
      { ReferralAssignmentID: pro3Offer!.ID, Action: 'Accept', Notes: 'Ready to engage.' },
      mockUser,
      provider,
    );
    expect(acceptOutcome.AssignmentStatus).toBe('Accepted');
    expect(acceptOutcome.RequestStatus).toBe('Accepted');
    expect(store.requests[0].AssignedProfessionalID).toBe('pro-3');
    const updatedPro3 = store.profiles.find((p) => p.ID === 'pro-3');
    expect(updatedPro3?.ActiveReferralCount).toBe(3);
    expect(updatedPro3?.TotalAcceptedCount).toBe(1);
  });

  it('runs ReferralLifecycleProbe inside WithRolledBackTransaction and rolls back cleanly', async () => {
    const probe = new ReferralLifecycleProbe();
    expect(probe.VerifierKey).toBe('BIZAPPS.REFERRALS.LIVE.LIFECYCLE_PROBE');
    expect(probe.OwnerApp).toBe('mj-bizapps-referrals');

    const commitTx = vi.fn().mockResolvedValue(undefined);
    const rollbackTx = vi.fn().mockResolvedValue(undefined);
    const beginTx = vi.fn().mockResolvedValue({ Commit: commitTx, Rollback: rollbackTx });
    const executeSQL = vi.fn().mockImplementation(async (sql: string) => {
      if (sql.includes('COUNT(*) AS TableCount')) {
        return [{ TableCount: 10 }];
      }
      if (sql.includes('SELECT [ID] FROM [__mj_BizAppsReferrals].[PracticeArea]')) {
        return [{ ID: 'A1000001-0000-0000-0000-000000000099' }];
      }
      return [];
    });

    const mockDbProvider = {
      BeginEntityTransaction: beginTx,
      ExecuteSQL: executeSQL,
    } as unknown as DatabaseProviderBase;

    const context: HealthProbeContext = {
      DatabaseProvider: mockDbProvider,
      MetadataProvider: {} as IMetadataProvider,
      SystemUser: mockUser,
    };

    // Exercise BaseHealthProbe.WithRolledBackTransaction via LiveEntityCrudProbe
    const hostProbe = new LiveEntityCrudProbe();
    const withTx = (
      hostProbe as unknown as {
        WithRolledBackTransaction: <T>(
          ctx: HealthProbeContext,
          fn: (tx: DatabaseProviderBase) => Promise<T>,
        ) => Promise<T>;
      }
    ).WithRolledBackTransaction.bind(hostProbe);

    const result = await withTx(context, (txProvider) => probe.Verify(context, txProvider));
    expect(result.Success).toBe(true);
    expect(result.ObservedMetrics?.TableCount).toBe(10);
    expect(result.ObservedMetrics?.ConflictedCandidateDisqualified).toBe(true);
    expect(beginTx).toHaveBeenCalledTimes(1);
    expect(rollbackTx).toHaveBeenCalledTimes(1);
    expect(commitTx).not.toHaveBeenCalled();
  });
});
