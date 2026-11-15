import { describe, expect, it } from 'vitest';
import { IMetadataProvider, IRunViewProvider, RunViewParams, RunViewResult, UserInfo } from '@memberjunction/core';
import { CascadeRoutingService, NormalizePartyName, ReciprocityScorecardService, SlaEscalationService } from '@mj-biz-apps/referrals-core';
import {
  ConflictCheckPartyEntity,
  ProfessionalCredentialEntity,
  ProfessionalJurisdictionEntity,
  ProfessionalPracticeAreaEntity,
  ProfessionalProfileEntity,
  ReferralAssignmentEntity,
  ReferralEscalationEntity,
  ReferralOutcomeEntity,
  ReferralRequestEntity,
  ReciprocitySnapshotEntity,
  ReferralTierEntity,
} from '@mj-biz-apps/referrals-entities';

const PRACTICE_AREA_ID = '10000000-0000-4000-8000-000000000001';
const JURISDICTION_ID = '20000000-0000-4000-8000-000000000001';
const TIER_ID = '30000000-0000-4000-8000-000000000001';
const PRO_1_ID = '40000000-0000-4000-8000-000000000001'; // Conflicted, rejected
const PRO_2_ID = '40000000-0000-4000-8000-000000000002'; // Offered first, escalated & expires
const PRO_3_ID = '40000000-0000-4000-8000-000000000003'; // Offered second (cascade), also expires -> Exhausted
const PRO_4_ID = '40000000-0000-4000-8000-000000000004'; // Only found on Reopen
const USER_PRO_4_ID = '50000000-0000-4000-8000-000000000004';
const ADMIN_USER_ID = '50000000-0000-4000-8000-000000000099';
const REQ_1_ID = '60000000-0000-4000-8000-000000000001';
const CP_1_ID = '70000000-0000-4000-8000-000000000001';
const PERSON_ADMIN_ID = '90000000-0000-4000-8000-000000000001';

interface EntityStore {
  profiles: ProfessionalProfileEntity[];
  credentials: ProfessionalCredentialEntity[];
  practiceLinks: ProfessionalPracticeAreaEntity[];
  jurisdictionLinks: ProfessionalJurisdictionEntity[];
  tiers: ReferralTierEntity[];
  requests: ReferralRequestEntity[];
  conflictParties: ConflictCheckPartyEntity[];
  assignments: ReferralAssignmentEntity[];
  escalations: ReferralEscalationEntity[];
  outcomes: ReferralOutcomeEntity[];
  snapshots: ReciprocitySnapshotEntity[];
}

type StoreEntity =
  | ProfessionalProfileEntity
  | ProfessionalCredentialEntity
  | ProfessionalPracticeAreaEntity
  | ProfessionalJurisdictionEntity
  | ReferralTierEntity
  | ReferralRequestEntity
  | ConflictCheckPartyEntity
  | ReferralAssignmentEntity
  | ReferralEscalationEntity
  | ReferralOutcomeEntity
  | ReciprocitySnapshotEntity;

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
      const rest: Partial<T> & { Save?: () => Promise<boolean>; Load?: (id: string) => Promise<boolean> } = { ...found };
      delete rest.Save;
      delete rest.Load;
      Object.assign(obj, rest);
      return true;
    },
  };
  return obj as T;
}

function createInMemoryProvider(store: EntityStore): IMetadataProvider & IRunViewProvider {
  let seq = 10;
  const nextUuid = () => `A0000000-0000-4000-8000-${String(seq++).padStart(12, '0')}`;

  const runSingle = async <T>(params: RunViewParams): Promise<RunViewResult<T>> => {
    const filter = params.ExtraFilter ?? '';
    let results: StoreEntity[] = [];

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
    } else if (params.EntityName === 'MJ_BizApps_Referrals: Professional Credentials') {
      results = store.credentials;
    } else if (params.EntityName === 'MJ_BizApps_Referrals: Referral Requests') {
      results = filter.includes('ID IN (')
        ? store.requests.filter((r) => filter.toLowerCase().includes(r.ID.toLowerCase()))
        : store.requests;
    } else if (params.EntityName === 'MJ_BizApps_Referrals: Referral Tiers') {
      results = store.tiers;
    } else if (params.EntityName === 'MJ_BizApps_Referrals: Conflict Check Parties') {
      const match = /ReferralRequestID = '([^']+)'/i.exec(filter);
      results = match
        ? store.conflictParties.filter((c) => c.ReferralRequestID.toLowerCase() === match[1].toLowerCase())
        : store.conflictParties;
    } else if (params.EntityName === 'MJ_BizApps_Referrals: Referral Assignments') {
      if (filter.includes("Status = 'Offered' AND SLAWarningSentAt IS NULL")) {
        results = store.assignments.filter((a) => a.Status === 'Offered' && a.SLAWarningSentAt == null);
      } else if (filter.includes("Status IN ('Offered', 'Accepted')")) {
        results = store.assignments.filter((a) => a.Status === 'Offered' || a.Status === 'Accepted');
      } else if (filter.includes("Status = 'Queued'") && filter.includes('ReferralRequestID IN (')) {
        results = store.assignments
          .filter((a) => a.Status === 'Queued' && filter.toLowerCase().includes(a.ReferralRequestID.toLowerCase()))
          .sort((a, b) => a.CascadeOrder - b.CascadeOrder);
      } else if (filter.includes("Status = 'Queued'")) {
        const reqMatch = /ReferralRequestID = '([^']+)'/i.exec(filter);
        results = store.assignments
          .filter((a) => (!reqMatch || a.ReferralRequestID.toLowerCase() === reqMatch[1].toLowerCase()) && a.Status === 'Queued')
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
      } else if (/^ReferralRequestID = '([^']+)'$/i.test(filter)) {
        const reqMatch = /ReferralRequestID = '([^']+)'/i.exec(filter)!;
        results = store.assignments.filter((a) => a.ReferralRequestID.toLowerCase() === reqMatch[1].toLowerCase());
      } else {
        results = store.assignments;
      }
    } else if (params.EntityName === 'MJ_BizApps_Referrals: Referral Escalations') {
      const dedupMatch = /DedupKey = '([^']+)'/.exec(filter);
      const reqOpenMatch = /ReferralRequestID = '([^']+)' AND Status = 'Open'/i.exec(filter);
      if (dedupMatch) {
        results = store.escalations.filter((e) => e.DedupKey === dedupMatch[1] && e.Status === 'Open');
      } else if (reqOpenMatch) {
        results = store.escalations.filter(
          (e) => e.ReferralRequestID.toLowerCase() === reqOpenMatch[1].toLowerCase() && e.Status === 'Open',
        );
      } else {
        results = store.escalations;
      }
    } else if (params.EntityName === 'MJ_BizApps_Referrals: Referral Outcomes') {
      const match = /ReferralAssignmentID = '([^']+)'/i.exec(filter);
      results = match
        ? store.outcomes.filter((o) => o.ReferralAssignmentID.toLowerCase() === match[1].toLowerCase())
        : store.outcomes;
    } else if (params.EntityName === 'MJ_BizApps_Referrals: Reciprocity Snapshots') {
      const match = /ProfessionalProfileID = '([^']+)'/i.exec(filter);
      results = match
        ? store.snapshots.filter((s) => s.ProfessionalProfileID.toLowerCase() === match[1].toLowerCase())
        : store.snapshots;
    } else if (params.EntityName === 'MJ_BizApps_Common: People') {
      results = [{ ID: PERSON_ADMIN_ID } as object as ReferralOutcomeEntity];
    }

    return {
      Success: true,
      Results: results as object as T[],
      RowCount: results.length,
      TotalRowCount: results.length,
      ExecutionTime: 1,
      UserView: null,
      ErrorMessage: '',
    };
  };

  const provider: Partial<IMetadataProvider & IRunViewProvider> = {
    BeginEntityTransaction: async () => ({
      Commit: async () => {},
      Rollback: async () => {},
    }),
    RunView: runSingle,
    RunViews: async (views: RunViewParams[]) => Promise.all(views.map((v) => runSingle(v))),
    GetEntityObject: async <T>(entityName: string) => {
      if (entityName === 'MJ_BizApps_Referrals: Referral Requests') {
        return makeEntity<ReferralRequestEntity>({ ID: nextUuid() } as ReferralRequestEntity, store.requests) as object as T;
      }
      if (entityName === 'MJ_BizApps_Referrals: Referral Tiers') {
        return makeEntity<ReferralTierEntity>({ ID: nextUuid() } as ReferralTierEntity, store.tiers) as object as T;
      }
      if (entityName === 'MJ_BizApps_Referrals: Referral Assignments') {
        return makeEntity<ReferralAssignmentEntity>({ ID: nextUuid() } as ReferralAssignmentEntity, store.assignments) as object as T;
      }
      if (entityName === 'MJ_BizApps_Referrals: Professional Profiles') {
        return makeEntity<ProfessionalProfileEntity>({ ID: nextUuid() } as ProfessionalProfileEntity, store.profiles) as object as T;
      }
      if (entityName === 'MJ_BizApps_Referrals: Conflict Check Parties') {
        return makeEntity<ConflictCheckPartyEntity>({ ID: nextUuid() } as ConflictCheckPartyEntity, store.conflictParties) as object as T;
      }
      if (entityName === 'MJ_BizApps_Referrals: Referral Escalations') {
        return makeEntity<ReferralEscalationEntity>({ ID: nextUuid() } as ReferralEscalationEntity, store.escalations) as object as T;
      }
      if (entityName === 'MJ_BizApps_Referrals: Referral Outcomes') {
        return makeEntity<ReferralOutcomeEntity>({ ID: nextUuid() } as ReferralOutcomeEntity, store.outcomes) as object as T;
      }
      if (entityName === 'MJ_BizApps_Referrals: Reciprocity Snapshots') {
        return makeEntity<ReciprocitySnapshotEntity>({ ID: nextUuid() } as ReciprocitySnapshotEntity, store.snapshots) as object as T;
      }
      throw new Error(`Unsupported entity: ${entityName}`);
    },
  };
  return provider as IMetadataProvider & IRunViewProvider;
}

function buildSeededStore(): EntityStore {
  const store: EntityStore = {
    profiles: [],
    credentials: [],
    practiceLinks: [],
    jurisdictionLinks: [],
    tiers: [],
    requests: [],
    conflictParties: [],
    assignments: [],
    escalations: [],
    outcomes: [],
    snapshots: [],
  };

  for (const [idx, proId] of [PRO_1_ID, PRO_2_ID, PRO_3_ID, PRO_4_ID].entries()) {
    store.credentials.push(
      makeEntity<ProfessionalCredentialEntity>(
        {
          ID: `80000000-0000-4000-8000-00000000000${idx + 1}`,
          ProfessionalProfileID: proId,
          JurisdictionID: JURISDICTION_ID,
          CredentialCode: `BAR-${idx + 1}`,
          CredentialName: 'State Bar License',
          ProviderKey: 'Manual',
          VerificationStatus: 'Verified',
          IsPrimary: true,
        } as ProfessionalCredentialEntity,
        store.credentials,
      ),
    );
    store.practiceLinks.push({
      ID: `81000000-0000-4000-8000-00000000000${idx + 1}`,
      ProfessionalProfileID: proId,
      PracticeAreaID: PRACTICE_AREA_ID,
      ProficiencyLevel: 'Primary',
      YearsInPractice: 10,
      IsPrimary: true,
    } as ProfessionalPracticeAreaEntity);
    store.jurisdictionLinks.push({
      ID: `82000000-0000-4000-8000-00000000000${idx + 1}`,
      ProfessionalProfileID: proId,
      JurisdictionID: JURISDICTION_ID,
      StandingStatus: 'GoodStanding',
      IsPrimary: true,
    } as ProfessionalJurisdictionEntity);
  }

  store.tiers.push(
    makeEntity<ReferralTierEntity>(
      {
        ID: TIER_ID,
        Name: 'Priority Concierge',
        Code: 'PRIORITY',
        SLAResponseHours: 8,
        MaxCascadeAttempts: 2,
        EscalationWarningPercent: 75,
        MaxEscalationLevel: 3,
        UrgentSLAMultiplier: 1,
      } as ReferralTierEntity,
      store.tiers,
    ),
  );

  const profileDefaults = {
    VerificationStatus: 'Verified' as const,
    AvailabilityStatus: 'Available' as const,
    MaxConcurrentReferrals: 10,
    AverageResponseHours: 2,
    AverageRating: 4.8,
    TotalAcceptedCount: 0,
    TotalCompletedCount: 0,
    IsActive: true,
  };
  store.profiles.push(
    makeEntity<ProfessionalProfileEntity>(
      { ID: PRO_1_ID, DisplayName: 'Conflicted Counsel', FirmName: 'Rival Corp LLP', Email: 'counsel@rivalcorp.com', ActiveReferralCount: 0, ...profileDefaults } as ProfessionalProfileEntity,
      store.profiles,
    ),
    makeEntity<ProfessionalProfileEntity>(
      { ID: PRO_2_ID, DisplayName: 'Slow Counsel', FirmName: 'Alpha Partners', Email: 'slow@alphapartners.com', ActiveReferralCount: 1, ...profileDefaults } as ProfessionalProfileEntity,
      store.profiles,
    ),
    makeEntity<ProfessionalProfileEntity>(
      { ID: PRO_3_ID, DisplayName: 'Busy Counsel', FirmName: 'Beta Partners', Email: 'busy@betapartners.com', ActiveReferralCount: 2, ...profileDefaults } as ProfessionalProfileEntity,
      store.profiles,
    ),
    makeEntity<ProfessionalProfileEntity>(
      {
        ID: PRO_4_ID,
        UserID: USER_PRO_4_ID,
        DisplayName: 'Reserve Counsel',
        FirmName: 'Gamma Partners',
        Email: 'reserve@gammapartners.com',
        ...profileDefaults,
        ActiveReferralCount: 5,
        AverageRating: 4.0,
      } as ProfessionalProfileEntity,
      store.profiles,
    ),
  );

  const req = makeEntity<ReferralRequestEntity>(
    {
      ID: REQ_1_ID,
      RequestNumber: 'REF-WAVE3-S2-E2E-001',
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

describe('@mj-biz-apps/referrals-integration-tests Wave 3 Slice 2 closed-loop lifecycle', () => {
  const adminUser = { ID: ADMIN_USER_ID, Name: 'Association Admin', UserRoles: [{ UserID: ADMIN_USER_ID, RoleID: 'r1', Role: 'Administrator' }] } as Partial<UserInfo> as UserInfo;
  const pro4User = { ID: USER_PRO_4_ID, Name: 'Reserve Counsel User', UserRoles: [] } as Partial<UserInfo> as UserInfo;

  it('10-step: intake -> route -> SLA warning -> acknowledge -> sweep/cascade -> exhaustion -> reopen -> accept -> complete -> reciprocity', async () => {
    const store = buildSeededStore();
    const provider = createInMemoryProvider(store);

    // 1. Intake already seeded (ReferralRequest + adverse ConflictCheckParty).
    expect(store.requests[0].Status).toBe('Submitted');

    // 2. Route: Pro-1 is ConflictRejected; Pro-2 is Offered (#1); Pro-3 is Queued (#2).
    const routeRes = await CascadeRoutingService.RouteReferralRequest(REQ_1_ID, adminUser, provider);
    expect(routeRes.Status).toBe('Routed');
    expect(routeRes.ActiveProfessionalID).toBe(PRO_2_ID);

    // 3. SLA warning: simulate 7h elapsed on an 8h SLA window (87.5% >= 75% threshold).
    const sevenHoursLater = new Date(Date.now() + 7 * 60 * 60 * 1000);
    const evalRes = await SlaEscalationService.EvaluateEscalations(sevenHoursLater, adminUser, provider);
    expect(evalRes.WarningsRaised).toBe(1);
    const warningEscalation = store.escalations.find((e) => e.TriggerType === 'SLAWarning');
    expect(warningEscalation).toBeDefined();
    expect(warningEscalation!.Status).toBe('Open');

    // 4. Acknowledge the SLA warning (coordinator/admin only).
    const ackRes = await SlaEscalationService.AcknowledgeEscalation(warningEscalation!.ID, adminUser, provider, 'Monitoring Pro-2.');
    expect(ackRes.Status).toBe('Acknowledged');

    // 5. Sweep at full SLA breach (10h later): Pro-2's offer expires, cascades to Pro-3, raises SLABreach.
    const tenHoursLater = new Date(Date.now() + 10 * 60 * 60 * 1000);
    const sweep1 = await CascadeRoutingService.SweepExpiredSLAs(tenHoursLater, adminUser, provider);
    expect(sweep1.ExpiredCount).toBe(1);
    expect(sweep1.CascadedCount).toBe(1);
    const pro3Offer = store.assignments.find((a) => a.ProfessionalProfileID === PRO_3_ID && a.Status === 'Offered');
    expect(pro3Offer).toBeDefined();
    expect(store.escalations.some((e) => e.TriggerType === 'SLABreach')).toBe(true);

    // 6. Sweep again past Pro-3's SLA deadline: no more queued candidates -> request Exhausted, CascadeExhausted raised.
    const twentyHoursLater = new Date(Date.now() + 20 * 60 * 60 * 1000);
    const sweep2 = await CascadeRoutingService.SweepExpiredSLAs(twentyHoursLater, adminUser, provider);
    expect(sweep2.ExpiredCount).toBe(1);
    expect(sweep2.ExhaustedCount).toBe(1);
    expect(store.requests.find((r) => r.ID === REQ_1_ID)?.Status).toBe('Exhausted');
    const exhaustedEscalation = store.escalations.find((e) => e.TriggerType === 'CascadeExhausted');
    expect(exhaustedEscalation).toBeDefined();
    expect(exhaustedEscalation!.Status).toBe('Open');

    // 7. Reopen (admin-only): excludes Pro-1/2/3 (all previously assigned); finds Pro-4; auto-resolves CascadeExhausted.
    const reopenRes = await CascadeRoutingService.ReopenExhaustedRequest(REQ_1_ID, adminUser, {}, provider);
    expect(reopenRes.Reopened).toBe(true);
    expect(reopenRes.ActiveProfessionalID).toBe(PRO_4_ID);
    expect(reopenRes.Status).toBe('Routed');
    expect(store.escalations.find((e) => e.ID === exhaustedEscalation!.ID)?.Status).toBe('Resolved');

    // 8. Pro-4 accepts the reopened offer.
    const acceptRes = await CascadeRoutingService.RespondToAssignment(
      { ReferralAssignmentID: reopenRes.ActiveAssignmentID!, Action: 'Accept' },
      pro4User,
      provider,
    );
    expect(acceptRes.AssignmentStatus).toBe('Accepted');
    expect(acceptRes.RequestStatus).toBe('Accepted');

    // 9. Mark in progress, then complete -> creates a ReferralOutcome.
    const inProgressRes = await CascadeRoutingService.MarkInProgress(reopenRes.ActiveAssignmentID!, pro4User, provider);
    expect(inProgressRes.AssignmentStatus).toBe('InProgress');
    const completeRes = await CascadeRoutingService.CompleteReferral(
      { ReferralAssignmentID: reopenRes.ActiveAssignmentID!, OutcomeStatus: 'Completed' },
      pro4User,
      provider,
    );
    expect(completeRes.AssignmentStatus).toBe('Completed');
    expect(completeRes.RequestStatus).toBe('Completed');
    expect(store.outcomes.some((o) => o.ID === completeRes.ReferralOutcomeID)).toBe(true);

    // 10. Recompute reciprocity snapshots: Pro-4 now has one Received+Accepted+Resolved referral.
    const recompute = await ReciprocityScorecardService.RecomputeSnapshots(adminUser, provider);
    expect(recompute.ProcessedCount).toBeGreaterThanOrEqual(4);
    const pro4Snapshot = store.snapshots.find((s) => s.ProfessionalProfileID === PRO_4_ID);
    expect(pro4Snapshot).toBeDefined();
    expect(pro4Snapshot!.ReferralsReceivedCount).toBe(1);
    expect(pro4Snapshot!.AcceptedCount).toBe(1);
    expect(pro4Snapshot!.ResolvedCount).toBe(1);
    const updatedPro4 = store.profiles.find((p) => p.ID === PRO_4_ID);
    expect(updatedPro4?.ReciprocityIndex).toBeGreaterThanOrEqual(0);
    expect(updatedPro4?.ReadinessComputedAt).not.toBeNull();
  });
});
