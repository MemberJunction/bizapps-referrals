import { describe, expect, it, vi } from 'vitest';

vi.mock('../../../Server/dist/generated/generated.js', () => ({}));

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
  AuthorizationError,
  CascadeRoutingService,
  ConcurrencyConflictError,
  InvalidLifecycleStateError,
  InvalidUUIDError,
  MatchingEngine,
  NormalizePartyName,
  PersistenceError,
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
import { ReferralLifecycleProbe, ReferralsSlaSweepScheduler } from '@mj-biz-apps/referrals-server';

const PRACTICE_AREA_ID = '10000000-0000-4000-8000-000000000001';
const JURISDICTION_ID = '20000000-0000-4000-8000-000000000001';
const TIER_ID = '30000000-0000-4000-8000-000000000001';
const PRO_1_ID = '40000000-0000-4000-8000-000000000001';
const PRO_2_ID = '40000000-0000-4000-8000-000000000002';
const PRO_3_ID = '40000000-0000-4000-8000-000000000003';
const USER_PRO_3_ID = '50000000-0000-4000-8000-000000000003';
const USER_OTHER_ID = '50000000-0000-4000-8000-000000000099';
const REQ_1_ID = '60000000-0000-4000-8000-000000000001';
const CP_1_ID = '70000000-0000-4000-8000-000000000001';

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
  let seq = 10;
  const nextUuid = () => `90000000-0000-4000-8000-${String(seq++).padStart(12, '0')}`;

  const runSingle = async <T>(params: RunViewParams): Promise<RunViewResult<T>> => {
    const filter = params.ExtraFilter ?? '';
    let results: unknown[] = [];

    if (params.EntityName === 'MJ_BizApps_Referrals: Professional Profiles') {
      if (filter.includes('ID IN (')) {
        results = store.profiles.filter((p) => filter.toLowerCase().includes(p.ID.toLowerCase()));
      } else {
        results = store.profiles.filter((p) => p.IsActive && p.VerificationStatus === 'Verified');
      }
    } else if (params.EntityName === 'MJ_BizApps_Referrals: Professional Practice Areas') {
      results = store.practiceLinks.filter((l) => filter.toLowerCase().includes(l.PracticeAreaID.toLowerCase()));
    } else if (params.EntityName === 'MJ_BizApps_Referrals: Professional Jurisdictions') {
      results = store.jurisdictionLinks.filter((l) => filter.toLowerCase().includes(l.JurisdictionID.toLowerCase()));
    } else if (params.EntityName === 'MJ_BizApps_Referrals: Referral Requests') {
      if (filter.includes('ID IN (')) {
        results = store.requests.filter((r) => filter.toLowerCase().includes(r.ID.toLowerCase()));
      } else {
        results = store.requests;
      }
    } else if (params.EntityName === 'MJ_BizApps_Referrals: Referral Tiers') {
      results = store.tiers;
    } else if (params.EntityName === 'MJ_BizApps_Referrals: Conflict Check Parties') {
      const match = /ReferralRequestID = '([^']+)'/i.exec(filter);
      if (match) {
        results = store.conflictParties.filter((c) => c.ReferralRequestID.toLowerCase() === match[1].toLowerCase());
      } else if (filter.includes('ReferralRequestID IN (')) {
        results = store.conflictParties.filter((c) => filter.toLowerCase().includes(c.ReferralRequestID.toLowerCase()));
      } else {
        results = store.conflictParties;
      }
    } else if (params.EntityName === 'MJ_BizApps_Referrals: Referral Assignments') {
      if (filter.includes("Status IN ('Offered', 'Accepted')")) {
        results = store.assignments.filter((a) => a.Status === 'Offered' || a.Status === 'Accepted');
      } else if (filter.includes("Status = 'Queued'") && filter.includes('ReferralRequestID IN (')) {
        results = store.assignments
          .filter((a) => a.Status === 'Queued' && filter.toLowerCase().includes(a.ReferralRequestID.toLowerCase()))
          .sort((a, b) => a.CascadeOrder - b.CascadeOrder);
      } else if (filter.includes("Status = 'Queued'")) {
        const reqMatch = /ReferralRequestID = '([^']+)'/i.exec(filter);
        results = store.assignments
          .filter(
            (a) =>
              (!reqMatch || a.ReferralRequestID.toLowerCase() === reqMatch[1].toLowerCase()) &&
              a.Status === 'Queued',
          )
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
        const reqMatch = /ReferralRequestID = '([^']+)'/i.exec(filter);
        results = reqMatch
          ? store.assignments.filter((a) => a.ReferralRequestID.toLowerCase() === reqMatch[1].toLowerCase())
          : store.assignments;
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
    BeginEntityTransaction: async () => ({
      Commit: async () => {},
      Rollback: async () => {},
    }),
    RunView: runSingle,
    RunViews: async (views: RunViewParams[]) => Promise.all(views.map((v) => runSingle(v))),
    GetEntityObject: async <T>(entityName: string) => {
      if (entityName === 'MJ_BizApps_Referrals: Referral Requests') {
        return makeEntity<ReferralRequestEntity>({ ID: nextUuid() } as ReferralRequestEntity, store.requests) as unknown as T;
      }
      if (entityName === 'MJ_BizApps_Referrals: Referral Tiers') {
        return makeEntity<ReferralTierEntity>({ ID: nextUuid() } as ReferralTierEntity, store.tiers) as unknown as T;
      }
      if (entityName === 'MJ_BizApps_Referrals: Referral Assignments') {
        return makeEntity<ReferralAssignmentEntity>({ ID: nextUuid() } as ReferralAssignmentEntity, store.assignments) as unknown as T;
      }
      if (entityName === 'MJ_BizApps_Referrals: Professional Profiles') {
        return makeEntity<ProfessionalProfileEntity>({ ID: nextUuid() } as ProfessionalProfileEntity, store.profiles) as unknown as T;
      }
      if (entityName === 'MJ_BizApps_Referrals: Conflict Check Parties') {
        return makeEntity<ConflictCheckPartyEntity>({ ID: nextUuid() } as ConflictCheckPartyEntity, store.conflictParties) as unknown as T;
      }
      throw new Error(`Unsupported entity: ${entityName}`);
    },
  } as unknown as IMetadataProvider & IRunViewProvider;
}

describe('@mj-biz-apps/referrals-integration-tests', () => {
  const pro3User = { ID: USER_PRO_3_ID, Name: 'Ready Counsel User', UserRoles: [] } as unknown as UserInfo;
  const unauthorizedUser = { ID: USER_OTHER_ID, Name: 'Other User', UserRoles: [] } as unknown as UserInfo;

  function buildSeededStore(): EntityStore {
    const store: EntityStore = {
      profiles: [],
      practiceLinks: [],
      jurisdictionLinks: [],
      tiers: [],
      requests: [],
      conflictParties: [],
      assignments: [],
    };

    store.tiers.push(
      makeEntity<ReferralTierEntity>(
        {
          ID: TIER_ID,
          Name: 'Priority Concierge',
          Code: 'PRIORITY',
          SLAResponseHours: 8,
          MaxCascadeAttempts: 3,
        } as ReferralTierEntity,
        store.tiers,
      ),
    );

    const pro1 = makeEntity<ProfessionalProfileEntity>(
      {
        ID: PRO_1_ID,
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
        ID: PRO_2_ID,
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
        ID: PRO_3_ID,
        UserID: USER_PRO_3_ID,
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

    for (const proId of [PRO_1_ID, PRO_2_ID, PRO_3_ID]) {
      store.practiceLinks.push({
        ID: `80000000-0000-4000-8000-${proId.slice(-12)}`,
        ProfessionalProfileID: proId,
        PracticeAreaID: PRACTICE_AREA_ID,
        ProficiencyLevel: 'Primary',
        YearsInPractice: 10,
        IsPrimary: true,
      } as ProfessionalPracticeAreaEntity);
      store.jurisdictionLinks.push({
        ID: `81000000-0000-4000-8000-${proId.slice(-12)}`,
        ProfessionalProfileID: proId,
        JurisdictionID: JURISDICTION_ID,
        StandingStatus: 'GoodStanding',
        IsPrimary: true,
      } as ProfessionalJurisdictionEntity);
    }

    const req = makeEntity<ReferralRequestEntity>(
      {
        ID: REQ_1_ID,
        RequestNumber: 'REF-20261113-001',
        SeekerName: 'Sam Seeker',
        SeekerEmail: 'sam@seeker.example.com',
        PracticeAreaID: PRACTICE_AREA_ID,
        JurisdictionID: JURISDICTION_ID,
        ReferralTierID: TIER_ID,
        MatterTitle: 'Commercial Dispute',
        MatterSummary: 'Dispute with Rival Corp.',
        Status: 'Submitted',
        CurrentCascadeStep: 0,
      } as ReferralRequestEntity,
      store.requests,
    );
    store.requests.push(req);
    store.conflictParties.push({
      ID: CP_1_ID,
      ReferralRequestID: REQ_1_ID,
      PartyName: 'Rival Corp Inc.',
      PartyRole: 'Adverse',
      OrganizationName: 'Rival Corp LLP',
      NormalizedName: NormalizePartyName('Rival Corp Inc.'),
    } as ConflictCheckPartyEntity);

    return store;
  }

  it('simulates complete lifecycle: intake -> conflict rejection -> cascade -> sweep -> accept', async () => {
    const store = buildSeededStore();
    const provider = createInMemoryProvider(store);

    // 1. Match & Route: Pro-1 is ConflictRejected; Pro-2 is Offered (#1); Pro-3 is Queued (#2)
    const matches = await MatchingEngine.FindMatches(
      { PracticeAreaID: PRACTICE_AREA_ID, JurisdictionID: JURISDICTION_ID, SLAResponseHours: 8 },
      pro3User,
      provider,
      REQ_1_ID,
    );
    expect(matches.find((m) => m.ProfessionalProfileID === PRO_1_ID)?.ConflictStatus).toBe('ConflictFound');

    const routeRes = await CascadeRoutingService.RouteReferralRequest(REQ_1_ID, pro3User, provider);
    expect(routeRes.Status).toBe('Routed');
    expect(routeRes.ConflictRejectedCount).toBe(1);
    expect(routeRes.TotalQueued).toBe(2);
    expect(routeRes.ActiveProfessionalID).toBe(PRO_2_ID);

    // Idempotent re-route on already Routed request returns existing active assignment without duplicating rows
    const idempotentRes = await CascadeRoutingService.RouteReferralRequest(REQ_1_ID, pro3User, provider);
    expect(idempotentRes.Status).toBe('Routed');
    expect(idempotentRes.ActiveProfessionalID).toBe(PRO_2_ID);
    expect(store.assignments.length).toBe(3);

    // 2. Sweep expired SLAs (simulate 10 hours later)
    const tenHoursLater = new Date(Date.now() + 10 * 60 * 60 * 1000);
    const sweepRes = await CascadeRoutingService.SweepExpiredSLAs(tenHoursLater, pro3User, provider);
    expect(sweepRes.ExpiredCount).toBe(1);
    expect(sweepRes.CascadedCount).toBe(1);

    // Pro-3's assignment should now be Offered
    const pro3Offer = store.assignments.find((a) => a.ProfessionalProfileID === PRO_3_ID && a.Status === 'Offered');
    expect(pro3Offer).toBeDefined();

    // Unauthorized user cannot respond to Pro-3's assignment
    await expect(
      CascadeRoutingService.RespondToAssignment(
        { ReferralAssignmentID: pro3Offer!.ID, Action: 'Accept' },
        unauthorizedUser,
        provider,
      ),
    ).rejects.toThrow(AuthorizationError);

    // 3. Pro-3 accepts the cascaded offer
    const acceptOutcome = await CascadeRoutingService.RespondToAssignment(
      { ReferralAssignmentID: pro3Offer!.ID, Action: 'Accept', Notes: 'Ready to engage.' },
      pro3User,
      provider,
    );
    expect(acceptOutcome.AssignmentStatus).toBe('Accepted');
    expect(acceptOutcome.RequestStatus).toBe('Accepted');
    expect(store.requests[0].AssignedProfessionalID).toBe(PRO_3_ID);
    const updatedPro3 = store.profiles.find((p) => p.ID === PRO_3_ID);
    expect(updatedPro3?.ActiveReferralCount).toBe(3);
    expect(updatedPro3?.TotalAcceptedCount).toBe(1);

    // Re-responding to non-Offered assignment throws ConcurrencyConflictError
    await expect(
      CascadeRoutingService.RespondToAssignment(
        { ReferralAssignmentID: pro3Offer!.ID, Action: 'Decline' },
        pro3User,
        provider,
      ),
    ).rejects.toThrow(ConcurrencyConflictError);

    // Re-routing a terminal Accepted request throws InvalidLifecycleStateError
    await expect(
      CascadeRoutingService.RouteReferralRequest(REQ_1_ID, pro3User, provider),
    ).rejects.toThrow(InvalidLifecycleStateError);
  });

  it('rejects invalid UUID inputs before issuing queries', async () => {
    const store = buildSeededStore();
    const provider = createInMemoryProvider(store);

    await expect(
      MatchingEngine.FindMatches(
        { PracticeAreaID: "bad' OR 1=1--", JurisdictionID: JURISDICTION_ID },
        pro3User,
        provider,
      ),
    ).rejects.toThrow(InvalidUUIDError);

    await expect(
      CascadeRoutingService.RouteReferralRequest('not-a-uuid', pro3User, provider),
    ).rejects.toThrow(InvalidUUIDError);
  });

  it('runs ReferralLifecycleProbe inside WithRolledBackTransaction for SQL Server and PostgreSQL dialects', async () => {
    const probe = new ReferralLifecycleProbe();
    expect(probe.VerifierKey).toBe('BIZAPPS.REFERRALS.LIVE.LIFECYCLE_PROBE');
    expect(probe.OwnerApp).toBe('mj-bizapps-referrals');

    for (const platform of ['sqlserver', 'postgresql'] as const) {
      const commitTx = vi.fn().mockResolvedValue(undefined);
      const rollbackTx = vi.fn().mockResolvedValue(undefined);
      const beginTx = vi.fn().mockResolvedValue({ Commit: commitTx, Rollback: rollbackTx });
      const executeSQL = vi.fn().mockImplementation(async (sql: string) => {
        expect(sql).not.toContain('SubscriptionTier');
        if (sql.includes('TableCount')) {
          return [{ TableCount: 10 }];
        }
        if (sql.includes('PracticeArea') && sql.includes('SELECT')) {
          return [{ ID: 'A1000001-0000-4000-8000-000000000099' }];
        }
        if (sql.includes('ReferralTier') && sql.includes('SELECT')) {
          return [{ ID: 'C1000001-0000-4000-8000-000000000001' }];
        }
        if (sql.includes('Jurisdiction') && sql.includes('SELECT')) {
          return [{ ID: 'B1000001-0000-4000-8000-000000000001' }];
        }
        if (sql.includes('ProfessionalProfile') && sql.includes('SELECT')) {
          return [{ ID: 'D1000001-0000-4000-8000-000000000001' }];
        }
        if (sql.includes('ReferralRequest') && sql.includes('SELECT')) {
          return [{ ID: 'E1000001-0000-4000-8000-000000000001' }];
        }
        return [];
      });

      const mockDbProvider = {
        PlatformKey: platform,
        BeginEntityTransaction: beginTx,
        ExecuteSQL: executeSQL,
      } as unknown as DatabaseProviderBase;

      const context: HealthProbeContext = {
        DatabaseProvider: mockDbProvider,
        MetadataProvider: {} as IMetadataProvider,
        SystemUser: pro3User,
      };

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
      expect(result.ObservedMetrics?.Platform).toBe(platform);
      expect(result.ObservedMetrics?.TableCount).toBe(10);
      expect(result.ObservedMetrics?.ConflictedCandidateDisqualified).toBe(true);
      expect(beginTx).toHaveBeenCalledTimes(1);
      expect(rollbackTx).toHaveBeenCalledTimes(1);
      expect(commitTx).not.toHaveBeenCalled();
    }
  });

  it('exposes ReferralsSlaSweepScheduler from @mj-biz-apps/referrals-server', () => {
    expect(typeof ReferralsSlaSweepScheduler.Start).toBe('function');
    expect(typeof ReferralsSlaSweepScheduler.Stop).toBe('function');
    expect(typeof ReferralsSlaSweepScheduler.RunOnce).toBe('function');
  });

  it('requires a transaction-capable provider for mutations (RR-01)', async () => {
    const nonTxProvider = {
      RunView: vi.fn(),
      RunViews: vi.fn(),
      GetEntityObject: vi.fn(),
    } as unknown as IMetadataProvider & IRunViewProvider;

    await expect(
      CascadeRoutingService.RouteReferralRequest(REQ_1_ID, pro3User, nonTxProvider),
    ).rejects.toThrow(PersistenceError);

    await expect(
      CascadeRoutingService.SweepExpiredSLAs(new Date(), pro3User, nonTxProvider),
    ).rejects.toThrow(PersistenceError);
  });

  it('enforces unexpired SLA and fresh conflict revalidation on Accept (RR-03) and atomic intake submission (RR-07)', async () => {
    const store = buildSeededStore();
    const provider = createInMemoryProvider(store);

    const intake = await CascadeRoutingService.SubmitIntakeWithConflicts(
      {
        SeekerName: 'Taylor Client',
        SeekerEmail: 'taylor@client.test',
        PracticeAreaID: PRACTICE_AREA_ID,
        JurisdictionID: JURISDICTION_ID,
        ReferralTierID: TIER_ID,
        MatterTitle: 'Atomic Intake Matter',
        MatterSummary: 'Testing atomic party persistence.',
        ConflictParties: [{ PartyName: 'Rival Corp Inc.', PartyRole: 'Adverse', OrganizationName: 'Rival Corp LLP' }],
        AutoRoute: true,
      },
      pro3User,
      provider,
    );
    expect(intake.Status).toBe('Routed');
    expect(intake.RoutingResult?.ActiveProfessionalID).toBe(PRO_2_ID);

    // Expire Pro-2's offer SLA and verify RespondToAssignment(Accept) rejects expired offer
    const activeOffer = store.assignments.find(
      (a) => a.ReferralRequestID === intake.RequestID && a.Status === 'Offered',
    )!;
    activeOffer.SLADeadlineAt = new Date(Date.now() - 60_000);
    const pro2Admin = {
      ID: '50000000-0000-4000-8000-000000000088',
      Name: 'Admin',
      UserRoles: [{ Role: 'Association Admin' }],
    } as unknown as UserInfo;

    await expect(
      CascadeRoutingService.RespondToAssignment(
        { ReferralAssignmentID: activeOffer.ID, Action: 'Accept' },
        pro2Admin,
        provider,
      ),
    ).rejects.toThrow(InvalidLifecycleStateError);
  });
});
