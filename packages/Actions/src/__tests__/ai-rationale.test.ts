import { afterEach, describe, expect, it } from 'vitest';
import { IMetadataProvider, IRunViewProvider, RunViewParams, RunViewResult, UserInfo } from '@memberjunction/core';
import type {
  ConflictCheckPartyEntity,
  ProfessionalCredentialEntity,
  ProfessionalJurisdictionEntity,
  ProfessionalPracticeAreaEntity,
  ProfessionalProfileEntity,
  ReferralAssignmentEntity,
  ReferralEscalationEntity,
  ReferralRequestEntity,
  ReferralTierEntity,
} from '@mj-biz-apps/referrals-entities';
import {
  IReferralPromptExecutor,
  PromptDataValue,
  PromptExecutionResult,
  ReferralAIRationaleService,
} from '../index.js';

const PRACTICE_AREA_ID = '10000000-0000-4000-8000-000000000001';
const JURISDICTION_ID = '20000000-0000-4000-8000-000000000001';
const TIER_ID = '30000000-0000-4000-8000-000000000001';
const PRO_1_ID = '40000000-0000-4000-8000-000000000001';
const REQ_1_ID = '60000000-0000-4000-8000-000000000001';
const ASSIGN_1_ID = '70000000-0000-4000-8000-000000000001';
const ESC_1_ID = '80000000-0000-4000-8000-000000000001';

const testUser = { ID: '00000000-0000-0000-0000-000000000001', Name: 'Test User' } as UserInfo;

type FieldValue = string | number | boolean | Date | null;

type QueuedResponse = { throw: true } | { throw: false; result: PromptExecutionResult<object> };

class FakePromptExecutor implements IReferralPromptExecutor {
  public CallCount = 0;
  public LastPromptName: string | null = null;
  public LastData: Record<string, PromptDataValue> | null = null;
  private queue: QueuedResponse[] = [];

  public QueueThrow(): void {
    this.queue.push({ throw: true });
  }

  public QueueResult(result: PromptExecutionResult<object>): void {
    this.queue.push({ throw: false, result });
  }

  public async ExecutePrompt<T>(promptName: string, data: Record<string, PromptDataValue>, _contextUser: UserInfo): Promise<PromptExecutionResult<T>> {
    this.CallCount++;
    this.LastPromptName = promptName;
    this.LastData = data;
    const next = this.queue.shift();
    if (!next || next.throw) {
      throw new Error('FakePromptExecutor: simulated executor failure.');
    }
    return next.result as object as PromptExecutionResult<T>;
  }
}

function makeEntity<T extends object>(data: Record<string, FieldValue>, storeList: T[]): T {
  const obj = {
    ...data,
    Save: async () => {
      const idx = storeList.findIndex((item) => (item as object as { ID: string }).ID === obj.ID);
      if (idx >= 0) {
        storeList[idx] = obj as object as T;
      } else {
        storeList.push(obj as object as T);
      }
      return true;
    },
    Load: async (id: string) => {
      const found = storeList.find((item) => (item as object as { ID: string }).ID === id);
      if (!found) return false;
      Object.assign(obj, found);
      return true;
    },
  };
  return obj as object as T;
}

/**
 * Builds a plain-data-only mutable target whose `Load`/`Save` reference the
 * target itself and mutate `storeList` in place by ID - safe for entities whose
 * `storeList` entries are themselves plain data (no bound `Save`/`Load`), which
 * avoids `Object.assign` cross-contaminating a stale closure's `Save`.
 */
function attachLoadSave<T extends { ID: string }>(storeList: T[]): T {
  const target = ({} as Record<string, FieldValue>) as T;
  target.Load = (async (id: string) => {
    const found = storeList.find((item) => item.ID === id);
    if (!found) return false;
    Object.assign(target, found);
    return true;
  }) as T['Load'];
  target.Save = (async () => {
    const idx = storeList.findIndex((item) => item.ID === target.ID);
    if (idx >= 0) {
      storeList[idx] = target;
    } else {
      storeList.push(target);
    }
    return true;
  }) as T['Save'];
  return target;
}

interface Store {
  profiles: ProfessionalProfileEntity[];
  practiceLinks: ProfessionalPracticeAreaEntity[];
  jurisdictionLinks: ProfessionalJurisdictionEntity[];
  credentials: ProfessionalCredentialEntity[];
  practiceAreas: { ID: string; Name: string }[];
  jurisdictions: { ID: string; Name: string }[];
  tiers: ReferralTierEntity[];
  requests: ReferralRequestEntity[];
  assignments: ReferralAssignmentEntity[];
  conflictParties: ConflictCheckPartyEntity[];
  escalations: ReferralEscalationEntity[];
}

function buildStore(): Store {
  const tier = makeEntity<ReferralTierEntity>(
    { ID: TIER_ID, Name: 'Standard', Code: 'STANDARD', SLAResponseHours: 24 } as object as Record<string, FieldValue>,
    [],
  );
  const profile = makeEntity<ProfessionalProfileEntity>(
    {
      ID: PRO_1_ID,
      DisplayName: 'Jane Counsel',
      FirmName: 'Counsel LLP',
      Email: 'jane@counsel.example.com',
      VerificationStatus: 'Verified',
      AvailabilityStatus: 'Available',
      ActiveReferralCount: 0,
      MaxConcurrentReferrals: 5,
      AverageResponseHours: 2,
      AverageRating: 4.8,
      ReadinessScore: 90,
      ReciprocityIndex: 1.2,
      IsActive: true,
    } as object as Record<string, FieldValue>,
    [],
  );
  const request = {
    ID: REQ_1_ID,
    RequestNumber: 'REF-TEST-001',
    PracticeAreaID: PRACTICE_AREA_ID,
    JurisdictionID: JURISDICTION_ID,
    ReferralTierID: TIER_ID,
    UrgencyLevel: 'Standard',
    Status: 'Routed',
    RequiresProBono: false,
    PreferredLanguage: null,
  } as object as ReferralRequestEntity;
  const assignment = makeEntity<ReferralAssignmentEntity>(
    {
      ID: ASSIGN_1_ID,
      ReferralRequestID: REQ_1_ID,
      ProfessionalProfileID: PRO_1_ID,
      CascadeOrder: 1,
      MatchScore: 92,
      ConflictStatus: 'Cleared',
      Status: 'Offered',
      AIRationaleJSON: null,
    } as object as Record<string, FieldValue>,
    [],
  );
  const escalation = {
    ID: ESC_1_ID,
    ReferralRequestID: REQ_1_ID,
    EscalationLevel: 1,
    TriggerType: 'SLAWarning',
    Status: 'Open',
    RecommendedAction: 'Notify',
    AIRationaleJSON: null,
  } as object as ReferralEscalationEntity;

  return {
    profiles: [profile],
    practiceLinks: [
      { ProfessionalProfileID: PRO_1_ID, PracticeAreaID: PRACTICE_AREA_ID, ProficiencyLevel: 'Primary', YearsInPractice: 10 } as ProfessionalPracticeAreaEntity,
    ],
    jurisdictionLinks: [
      { ProfessionalProfileID: PRO_1_ID, JurisdictionID: JURISDICTION_ID, StandingStatus: 'GoodStanding', IsPrimary: true } as ProfessionalJurisdictionEntity,
    ],
    credentials: [
      { ProfessionalProfileID: PRO_1_ID, JurisdictionID: JURISDICTION_ID, CredentialCode: 'BAR-1', VerificationStatus: 'Verified', IsPrimary: true } as ProfessionalCredentialEntity,
    ],
    practiceAreas: [{ ID: PRACTICE_AREA_ID, Name: 'Corporate Law' }],
    jurisdictions: [{ ID: JURISDICTION_ID, Name: 'New York' }],
    tiers: [tier],
    requests: [request],
    assignments: [assignment],
    conflictParties: [],
    escalations: [escalation],
  };
}

function createProvider(store: Store): IMetadataProvider & IRunViewProvider {
  const runSingle = async <T>(params: RunViewParams): Promise<RunViewResult<T>> => {
    const filter = params.ExtraFilter ?? '';
    let results: object[] = [];
    if (params.EntityName === 'MJ_BizApps_Referrals: Professional Profiles') {
      results = filter.includes('ID IN (')
        ? store.profiles.filter((p) => filter.toLowerCase().includes(p.ID.toLowerCase()))
        : store.profiles.filter((p) => p.IsActive && p.VerificationStatus === 'Verified');
    } else if (params.EntityName === 'MJ_BizApps_Referrals: Professional Practice Areas') {
      results = store.practiceLinks;
    } else if (params.EntityName === 'MJ_BizApps_Referrals: Professional Jurisdictions') {
      results = store.jurisdictionLinks;
    } else if (params.EntityName === 'MJ_BizApps_Referrals: Professional Credentials') {
      results = store.credentials;
    } else if (params.EntityName === 'MJ_BizApps_Referrals: Professional Availability Windows') {
      results = [];
    } else if (params.EntityName === 'MJ_BizApps_Referrals: Practice Areas') {
      results = store.practiceAreas;
    } else if (params.EntityName === 'MJ_BizApps_Referrals: Jurisdictions') {
      results = store.jurisdictions;
    } else if (params.EntityName === 'MJ_BizApps_Referrals: Referral Tiers') {
      results = store.tiers;
    } else if (params.EntityName === 'MJ_BizApps_Referrals: Conflict Check Parties') {
      results = store.conflictParties;
    } else if (params.EntityName === 'MJ_BizApps_Referrals: Referral Requests') {
      results = store.requests;
    } else if (params.EntityName === 'MJ_BizApps_Referrals: Referral Assignments') {
      if (filter.includes("Status IN ('Offered', 'Queued')") || filter.includes("Status IN ('Offered', 'Accepted')")) {
        results = store.assignments.filter((a) => a.Status === 'Offered' || a.Status === 'Queued' || a.Status === 'Accepted');
      } else {
        results = store.assignments;
      }
    }
    return { Success: true, Results: results as T[] } as RunViewResult<T>;
  };

  return {
    RunView: runSingle,
    RunViews: async <T>(views: RunViewParams[]) => Promise.all(views.map((v) => runSingle<T>(v))),
    GetEntityObject: async <T>(entityName: string) => {
      if (entityName === 'MJ_BizApps_Referrals: Referral Requests') {
        return attachLoadSave<ReferralRequestEntity>(store.requests) as object as T;
      }
      if (entityName === 'MJ_BizApps_Referrals: Referral Escalations') {
        return attachLoadSave<ReferralEscalationEntity>(store.escalations) as object as T;
      }
      throw new Error(`Unsupported entity: ${entityName}`);
    },
  } as object as IMetadataProvider & IRunViewProvider;
}

describe('ReferralAIRationaleService.BuildRationaleContext (AC-32 privacy shape)', () => {
  it('passes through only practice area/jurisdiction names, urgency, tier, conflict counts, and candidate match data', () => {
    const context = ReferralAIRationaleService.BuildRationaleContext(
      {
        PracticeAreaName: 'Corporate Law',
        JurisdictionName: 'New York',
        UrgencyLevel: 'Standard',
        TierName: 'Standard',
        ConflictPartyCountsByRole: { Adverse: 2 },
      },
      [
        {
          ProfessionalProfileID: PRO_1_ID,
          DisplayName: 'Jane Counsel',
          MatchScore: 92,
          ScoreBreakdown: { PracticeAreaScore: 40, JurisdictionScore: 25, CapacityScore: 20, ResponsivenessScore: 15, RatingScore: 10, LanguageBonus: 0, TotalScore: 92 },
          ExplainableMatchReasons: ['Primary proficiency'],
          ReadinessScore: 90,
          ReciprocityIndex: 1.2,
          Eligible: true,
          DisqualificationReason: null,
        },
      ],
    );
    expect(context.practiceArea).toBe('Corporate Law');
    expect(context.jurisdiction).toBe('New York');
    expect(context.conflictPartyCounts).toEqual({ Adverse: 2 });
    expect(context.candidates).toHaveLength(1);
    expect(context.candidates[0].professionalProfileId).toBe(PRO_1_ID);
    expect(JSON.stringify(context)).not.toContain('SeekerName');
    expect(JSON.stringify(context)).not.toContain('MatterSummary');
  });
});

describe('ReferralAIRationaleService.ExplainMatch', () => {
  afterEach(() => {
    ReferralAIRationaleService.ConfigureExecutor();
  });

  it('persists an AI-sourced rationale onto the Offered assignment when the executor returns valid matching output', async () => {
    const store = buildStore();
    const provider = createProvider(store);
    const fake = new FakePromptExecutor();
    fake.QueueResult({
      Success: true,
      Result: { rationales: [{ professionalProfileId: PRO_1_ID, summary: 'Strong fit', rationale: 'Matches practice area and jurisdiction.', risks: [] }] },
      PromptRunID: 'run-1',
    });
    ReferralAIRationaleService.ConfigureExecutor(fake);

    const result = await ReferralAIRationaleService.ExplainMatch(REQ_1_ID, testUser, provider);

    expect(fake.CallCount).toBe(1);
    expect(result.ProcessedCount).toBe(1);
    expect(result.Rationales[0].Source).toBe('AI');
    const persisted = JSON.parse(store.assignments[0].AIRationaleJSON!);
    expect(persisted.Source).toBe('AI');
    expect(persisted.Summary).toBe('Strong fit');
  });

  it('drops a rationale entry whose professionalProfileId is not in the candidate set and falls back to Deterministic', async () => {
    const store = buildStore();
    const provider = createProvider(store);
    const fake = new FakePromptExecutor();
    fake.QueueResult({
      Success: true,
      Result: { rationales: [{ professionalProfileId: '99999999-0000-0000-0000-000000000099', summary: 'Wrong candidate', rationale: 'N/A', risks: [] }] },
      PromptRunID: 'run-2',
    });
    ReferralAIRationaleService.ConfigureExecutor(fake);

    const result = await ReferralAIRationaleService.ExplainMatch(REQ_1_ID, testUser, provider);

    expect(result.Rationales[0].Source).toBe('Deterministic');
    const persisted = JSON.parse(store.assignments[0].AIRationaleJSON!);
    expect(persisted.Source).toBe('Deterministic');
  });

  it('falls back to Deterministic (and never throws) when the executor throws', async () => {
    const store = buildStore();
    const provider = createProvider(store);
    const fake = new FakePromptExecutor();
    fake.QueueThrow();
    ReferralAIRationaleService.ConfigureExecutor(fake);

    const result = await ReferralAIRationaleService.ExplainMatch(REQ_1_ID, testUser, provider);

    expect(result.Rationales[0].Source).toBe('Deterministic');
    expect(result.Rationales[0].Rationale.length).toBeGreaterThan(0);
  });

  it('never throws when given no provider', async () => {
    const result = await ReferralAIRationaleService.ExplainMatch(REQ_1_ID, testUser, undefined);
    expect(result.ProcessedCount).toBe(0);
    expect(result.Rationales).toEqual([]);
  });
});

describe('ReferralAIRationaleService.RecommendEscalationAction', () => {
  afterEach(() => {
    ReferralAIRationaleService.ConfigureExecutor();
  });

  it('calls the executor once and persists RecommendedAction + AIRationaleJSON for a fresh escalation', async () => {
    const store = buildStore();
    const provider = createProvider(store);
    const fake = new FakePromptExecutor();
    fake.QueueResult({
      Success: true,
      Result: { recommendedAction: 'Reassign', summary: 'Reassign to a less-loaded professional', rationale: 'Capacity issue detected.' },
      PromptRunID: 'run-3',
    });
    ReferralAIRationaleService.ConfigureExecutor(fake);

    const result = await ReferralAIRationaleService.RecommendEscalationAction(ESC_1_ID, {}, testUser, provider);

    expect(fake.CallCount).toBe(1);
    expect(result.Skipped).toBe(false);
    expect(result.RecommendedAction).toBe('Reassign');
    expect(store.escalations[0].RecommendedAction).toBe('Reassign');
    expect(store.escalations[0].AIRationaleJSON).not.toBeNull();
  });

  it('skips the AI call (0 executor calls) when AIRationaleJSON already exists and Force is not set', async () => {
    const store = buildStore();
    store.escalations[0].RecommendedAction = 'Notify';
    store.escalations[0].AIRationaleJSON = JSON.stringify({ Source: 'AI', Summary: 'Existing', Rationale: 'Existing rationale.', GeneratedAt: new Date().toISOString() });
    const provider = createProvider(store);
    const fake = new FakePromptExecutor();
    ReferralAIRationaleService.ConfigureExecutor(fake);

    const result = await ReferralAIRationaleService.RecommendEscalationAction(ESC_1_ID, {}, testUser, provider);

    expect(fake.CallCount).toBe(0);
    expect(result.Skipped).toBe(true);
    expect(result.RecommendedAction).toBe('Notify');
  });

  it('re-invokes the executor exactly once when Force is set even if AIRationaleJSON already exists', async () => {
    const store = buildStore();
    store.escalations[0].AIRationaleJSON = JSON.stringify({ Source: 'AI', Summary: 'Old', Rationale: 'Old rationale.', GeneratedAt: new Date().toISOString() });
    const provider = createProvider(store);
    const fake = new FakePromptExecutor();
    fake.QueueResult({
      Success: true,
      Result: { recommendedAction: 'AdminAlert', summary: 'Escalate to admin', rationale: 'Urgent unassigned risk.' },
      PromptRunID: 'run-4',
    });
    ReferralAIRationaleService.ConfigureExecutor(fake);

    const result = await ReferralAIRationaleService.RecommendEscalationAction(ESC_1_ID, { Force: true }, testUser, provider);

    expect(fake.CallCount).toBe(1);
    expect(result.Skipped).toBe(false);
    expect(result.RecommendedAction).toBe('AdminAlert');
  });

  it('falls back to the deterministic rules default when the AI output is outside the RecommendedAction union', async () => {
    const store = buildStore();
    const provider = createProvider(store);
    const fake = new FakePromptExecutor();
    fake.QueueResult({ Success: true, Result: { recommendedAction: 'SuperEscalate', summary: 'x', rationale: 'y' }, PromptRunID: 'run-5' });
    ReferralAIRationaleService.ConfigureExecutor(fake);

    const result = await ReferralAIRationaleService.RecommendEscalationAction(ESC_1_ID, {}, testUser, provider);

    expect(result.RecommendedAction).toBe('Notify');
    expect(JSON.parse(store.escalations[0].AIRationaleJSON!).Source).toBe('Deterministic');
  });

  it('never mutates escalation Status/EscalationLevel or the linked assignment Status/CascadeOrder', async () => {
    const store = buildStore();
    const originalStatus = store.escalations[0].Status;
    const originalLevel = store.escalations[0].EscalationLevel;
    const originalAssignmentStatus = store.assignments[0].Status;
    const originalCascadeOrder = store.assignments[0].CascadeOrder;
    const provider = createProvider(store);
    const fake = new FakePromptExecutor();
    fake.QueueResult({ Success: true, Result: { recommendedAction: 'Notify', summary: 'x', rationale: 'y' }, PromptRunID: 'run-6' });
    ReferralAIRationaleService.ConfigureExecutor(fake);

    await ReferralAIRationaleService.RecommendEscalationAction(ESC_1_ID, {}, testUser, provider);

    expect(store.escalations[0].Status).toBe(originalStatus);
    expect(store.escalations[0].EscalationLevel).toBe(originalLevel);
    expect(store.assignments[0].Status).toBe(originalAssignmentStatus);
    expect(store.assignments[0].CascadeOrder).toBe(originalCascadeOrder);
  });
});
