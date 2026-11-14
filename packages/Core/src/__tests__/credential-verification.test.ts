import { createHmac } from 'node:crypto';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  EntityFieldInfo,
  EntityInfo,
  IMetadataProvider,
  IRunViewProvider,
  RunViewParams,
  RunViewResult,
  UserInfo,
} from '@memberjunction/core';
import type {
  ProfessionalCredentialEntity,
  ProfessionalJurisdictionEntity,
  ProfessionalPracticeAreaEntity,
  ProfessionalProfileEntity,
  ReferralAssignmentEntity,
  ReferralFeedbackEntity,
  ReferralRequestEntity,
} from '@mj-biz-apps/referrals-entities';
import {
  AuthorizationError,
  ExternalActionCredentialProvider,
  ManualReferralCredentialProvider,
  MatchingEngine,
  OptionalCredentialingBridgeProvider,
  PersistenceError,
  ReferralCredentialService,
} from '../index.js';

const PROFILE_A_ID = '11111111-1111-4111-8111-111111111111';
const PROFILE_B_ID = '22222222-2222-4222-8222-222222222222';
const PERSON_A_ID = '33333333-3333-4333-8333-333333333333';
const CRED_1_ID = '44444444-4444-4444-8444-444444444444';
const REQ_1_ID = '55555555-5555-4555-8555-555555555555';
const ASSIGN_1_ID = '66666666-6666-4666-8666-666666666666';
const ASSIGN_2_ID = '77777777-7777-4777-8777-777777777777';
const PA_ID = '88888888-8888-4888-8888-888888888888';
const JUR_ID = '99999999-9999-4999-8999-999999999999';
const ADMIN_USER_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const SEEKER_USER_ID = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const OUTSIDER_USER_ID = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';

function makeUser(roles: string[], id: string = ADMIN_USER_ID, email: string = 'reviewer@example.com'): UserInfo {
  return new UserInfo(undefined, {
    ID: id,
    Name: 'Test Reviewer',
    Email: email,
    UserRoles: roles.map((Role) => ({ UserID: id, RoleID: '00000000-0000-0000-0000-000000000001', Role })),
  });
}

function makeEntityInfo(name: string, fieldNames: string[]): EntityInfo {
  const info = new EntityInfo({ Name: name });
  for (const fieldName of fieldNames) {
    info.Fields.push(new EntityFieldInfo({ Name: fieldName }));
  }
  return info;
}

interface MockStore {
  profiles: Map<string, ProfessionalProfileEntity>;
  credentials: Map<string, ProfessionalCredentialEntity>;
  assignments: Map<string, ReferralAssignmentEntity>;
  requests?: Map<string, ReferralRequestEntity>;
  feedbacks: Map<string, ReferralFeedbackEntity>;
  bridgeRows: Array<Record<string, string | null>>;
  failSave?: boolean;
  failRunView?: boolean;
}

function makeRequestRecord(id: string, seekerEmail: string = 'seeker@example.com'): ReferralRequestEntity {
  const data: Record<string, string | null> = {
    ID: id,
    SeekerEmail: seekerEmail,
    SeekerPersonID: null,
    Status: 'Accepted',
  };
  return Object.assign(data, {
    NewRecord: () => undefined,
    Load: async (loadId: string) => loadId.toLowerCase() === id.toLowerCase(),
    Save: async () => true,
  }) as ReferralRequestEntity;
}

function makeProfileRecord(
  id: string,
  status: ProfessionalProfileEntity['VerificationStatus'] = 'Pending',
  personId: string | null = PERSON_A_ID,
): ProfessionalProfileEntity {
  const data: Record<string, string | number | boolean | null> = {
    ID: id,
    PersonID: personId,
    OrganizationID: null,
    UserID: ADMIN_USER_ID,
    DisplayName: 'Test Counsel',
    FirmName: 'Test LLP',
    Email: 'counsel@example.com',
    LicenseNumber: null,
    VerificationStatus: status,
    AvailabilityStatus: 'Available',
    YearsExperience: 10,
    AcceptsProBono: false,
    AcceptsContingency: false,
    ActiveReferralCount: 0,
    MaxConcurrentReferrals: 5,
    AverageRating: null,
    TotalAcceptedCount: 0,
    TotalCompletedCount: 0,
    IsActive: true,
  };
  return Object.assign(data, {
    Dirty: false,
    NewRecord: () => undefined,
    Load: async (loadId: string) => loadId.toLowerCase() === id.toLowerCase(),
    Save: async () => true,
  }) as ProfessionalProfileEntity;
}

function makeCredentialRecord(
  id: string,
  profileId: string,
  code: string,
  status: ProfessionalCredentialEntity['VerificationStatus'] = 'Pending',
  expiresAt: Date | null = null,
): ProfessionalCredentialEntity {
  const data: Record<string, string | boolean | Date | null> = {
    ID: id,
    ProfessionalProfileID: profileId,
    JurisdictionID: JUR_ID,
    CredentialCode: code,
    CredentialName: `${code} License`,
    IssuerName: 'State Bar',
    ProviderKey: 'Manual',
    ExternalReferenceID: null,
    VerificationStatus: status,
    IssuedAt: null,
    ExpiresAt: expiresAt,
    VerifiedAt: null,
    VerifiedByPersonID: null,
    EvidenceURL: null,
    MetadataJSON: null,
    IsPrimary: true,
  };
  return Object.assign(data, {
    NewRecord: () => undefined,
    Load: async (loadId: string) => loadId.toLowerCase() === id.toLowerCase(),
    Save: async () => true,
  }) as ProfessionalCredentialEntity;
}

function makeAssignmentRecord(
  id: string,
  requestId: string,
  profileId: string,
  status: ReferralAssignmentEntity['Status'] = 'Accepted',
): ReferralAssignmentEntity {
  const data: Record<string, string | number | null> = {
    ID: id,
    ReferralRequestID: requestId,
    ProfessionalProfileID: profileId,
    CascadeOrder: 1,
    MatchScore: 90,
    ConflictStatus: 'Cleared',
    Status: status,
  };
  return Object.assign(data, {
    NewRecord: () => undefined,
    Load: async (loadId: string) => loadId.toLowerCase() === id.toLowerCase(),
    Save: async () => true,
  }) as ReferralAssignmentEntity;
}

function makeFeedbackRecord(
  id: string,
  assignmentId: string,
  requestId: string,
  profileId: string,
): ReferralFeedbackEntity {
  const data: Record<string, string | number | null> = {
    ID: id,
    ReferralAssignmentID: assignmentId,
    ReferralRequestID: requestId,
    ProfessionalProfileID: profileId,
    SubmittedByType: 'Professional',
    Rating: 5,
    OutcomeStatus: 'Engaged',
    Comments: null,
  };
  return Object.assign(data, {
    NewRecord: () => undefined,
    Load: async (loadId: string) => loadId.toLowerCase() === id.toLowerCase(),
    Save: async () => true,
  }) as ReferralFeedbackEntity;
}

class MockCredentialDataProvider implements IMetadataProvider, IRunViewProvider {
  public Entities: EntityInfo[];
  private seq = 1;

  constructor(
    private readonly store: MockStore,
    entities: EntityInfo[],
  ) {
    this.Entities = entities;
  }

  public get LatestResult(): never {
    throw new Error('Not used');
  }

  public async Refresh(): Promise<boolean> {
    return true;
  }

  public EntityByName(name: string): EntityInfo | undefined {
    return this.Entities.find((e) => e.Name === name);
  }

  private attachProfileHandlers(target: ProfessionalProfileEntity): ProfessionalProfileEntity {
    target.Load = async (id: string) => {
      const found = this.store.profiles.get(id.toLowerCase());
      if (!found) return false;
      Object.assign(target, found);
      this.attachProfileHandlers(target);
      return true;
    };
    target.Save = async () => {
      if (this.store.failSave) return false;
      const copy = this.attachProfileHandlers(Object.assign({}, target));
      this.store.profiles.set(copy.ID.toLowerCase(), copy);
      return true;
    };
    return target;
  }

  private attachCredentialHandlers(target: ProfessionalCredentialEntity): ProfessionalCredentialEntity {
    target.Load = async (id: string) => {
      const found = this.store.credentials.get(id.toLowerCase());
      if (!found) return false;
      Object.assign(target, found);
      this.attachCredentialHandlers(target);
      return true;
    };
    target.Save = async () => {
      if (this.store.failSave) return false;
      const copy = this.attachCredentialHandlers(Object.assign({}, target));
      this.store.credentials.set(copy.ID.toLowerCase(), copy);
      return true;
    };
    return target;
  }

  private attachFeedbackHandlers(target: ReferralFeedbackEntity): ReferralFeedbackEntity {
    target.Save = async () => {
      if (this.store.failSave) return false;
      const copy = this.attachFeedbackHandlers(Object.assign({}, target));
      this.store.feedbacks.set(copy.ID.toLowerCase(), copy);
      return true;
    };
    return target;
  }

  public async GetEntityObject<T>(entityName: string): Promise<T> {
    if (entityName === 'MJ_BizApps_Referrals: Professional Profiles') {
      return this.attachProfileHandlers(makeProfileRecord(PROFILE_A_ID)) as T;
    }

    if (entityName === 'MJ_BizApps_Referrals: Professional Credentials') {
      const newId = `c0000000-0000-4000-8000-${String(this.seq++).padStart(12, '0')}`;
      return this.attachCredentialHandlers(makeCredentialRecord(newId, PROFILE_A_ID, 'NEW-CODE')) as T;
    }

    if (entityName === 'MJ_BizApps_Referrals: Referral Assignments') {
      const base = makeAssignmentRecord(ASSIGN_1_ID, REQ_1_ID, PROFILE_A_ID);
      base.Load = async (id: string) => {
        const found = this.store.assignments.get(id.toLowerCase());
        if (!found) return false;
        Object.assign(base, found);
        return true;
      };
      return base as T;
    }

    if (entityName === 'MJ_BizApps_Referrals: Referral Requests') {
      const base = makeRequestRecord(REQ_1_ID);
      base.Load = async (id: string) => {
        const found = this.store.requests?.get(id.toLowerCase());
        if (!found) return false;
        Object.assign(base, found);
        return true;
      };
      return base as T;
    }

    if (entityName === 'MJ_BizApps_Referrals: Referral Feedbacks') {
      const newId = `f0000000-0000-4000-8000-${String(this.seq++).padStart(12, '0')}`;
      return this.attachFeedbackHandlers(makeFeedbackRecord(newId, ASSIGN_1_ID, REQ_1_ID, PROFILE_A_ID)) as T;
    }

    throw new Error(`Unexpected entity '${entityName}'`);
  }

  public async RunView<T>(params: RunViewParams): Promise<RunViewResult<T>> {
    if (this.store.failRunView) {
      return { Success: false, Results: [], ErrorMessage: 'Simulated RunView failure' } as RunViewResult<T>;
    }

    const filter = params.ExtraFilter ?? '';
    if (params.EntityName === 'MJ_BizApps_Common: People') {
      return { Success: true, Results: [{ ID: PERSON_A_ID }] as T[] } as RunViewResult<T>;
    }
    if (params.EntityName === 'MJ_BizApps_Referrals: Referral Requests') {
      const items = Array.from(this.store.requests?.values() ?? []);
      return { Success: true, Results: items as T[] } as RunViewResult<T>;
    }
    if (params.EntityName === 'MJ_BizApps_Referrals: Professional Profiles') {
      const items = Array.from(this.store.profiles.values()).filter(
        (p) => !filter.includes('ID =') || filter.toLowerCase().includes(p.ID.toLowerCase()),
      );
      return { Success: true, Results: items as T[] } as RunViewResult<T>;
    }
    if (params.EntityName === 'MJ_BizApps_Referrals: Professional Credentials') {
      const items = Array.from(this.store.credentials.values()).filter((c) => {
        if (filter.includes('ProfessionalProfileID =') && !filter.toLowerCase().includes(c.ProfessionalProfileID.toLowerCase())) {
          return false;
        }
        if (filter.includes("ProviderKey = 'ExternalAction'") && c.ProviderKey !== 'ExternalAction') {
          return false;
        }
        if (filter.includes('CredentialCode =') && !filter.includes(c.CredentialCode)) {
          return false;
        }
        return true;
      });
      return { Success: true, Results: items as T[] } as RunViewResult<T>;
    }
    if (params.EntityName === 'MJ_BizApps_Referrals: Referral Feedbacks') {
      const items = Array.from(this.store.feedbacks.values()).filter((f) => {
        if (filter.includes('ProfessionalProfileID =') && !filter.toLowerCase().includes(f.ProfessionalProfileID.toLowerCase())) {
          return false;
        }
        if (filter.includes('ReferralAssignmentID =') && !filter.toLowerCase().includes(f.ReferralAssignmentID.toLowerCase())) {
          return false;
        }
        if (filter.includes('SubmittedByType =') && !filter.includes(`'${f.SubmittedByType}'`)) {
          return false;
        }
        return true;
      });
      return { Success: true, Results: items as T[] } as RunViewResult<T>;
    }
    if (params.EntityName === 'MJ_BizApps_Referrals: Referral Assignments') {
      const items = Array.from(this.store.assignments.values()).filter((a) => {
        if (filter.includes("Status = 'Completed'") && a.Status !== 'Completed') return false;
        return true;
      });
      return { Success: true, Results: items as T[] } as RunViewResult<T>;
    }
    if (params.EntityName?.startsWith('MJ_BizApps_Credentialing:')) {
      return { Success: true, Results: this.store.bridgeRows as T[] } as RunViewResult<T>;
    }
    return { Success: true, Results: [] as T[] } as RunViewResult<T>;
  }

  public async RunViews<T>(params: RunViewParams[]): Promise<RunViewResult<T>[]> {
    return Promise.all(params.map((p) => this.RunView<T>(p)));
  }
}

function collectTsFiles(dir: string): string[] {
  const results: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (entry === 'node_modules' || entry === 'dist' || entry === '__tests__') continue;
    const st = statSync(full);
    if (st.isDirectory()) {
      results.push(...collectTsFiles(full));
    } else if (entry.endsWith('.ts')) {
      results.push(full);
    }
  }
  return results;
}

describe('Pluggable Credential Verification & Security Remediation', () => {
  it('CR-01: ExternalActionCredentialProvider fails closed without configured adapter or valid signed payload', async () => {
    ExternalActionCredentialProvider.ConfigureAdapter(null);
    const provider = new ExternalActionCredentialProvider();
    const coordinator = makeUser(['Coordinator']);

    // Even with ExternalReferenceID, EvidenceURL, and ForceStatus: Verified, must fail closed as Pending
    const result = await provider.VerifyCredential(
      {
        ProfessionalProfileID: PROFILE_A_ID,
        CredentialCode: 'NY-BAR-12345',
        ExternalReferenceID: 'EXT-999',
        EvidenceURL: 'https://registry.example.com/999',
        ForceStatus: 'Verified',
      },
      coordinator,
    );

    expect(result.Success).toBe(false);
    expect(result.VerificationStatus).toBe('Pending');

    // Rejects mismatched subject returned by external adapter
    ExternalActionCredentialProvider.ConfigureAdapter({
      async Verify() {
        return {
          Success: true,
          VerificationStatus: 'Verified',
          SubjectProfileID: PROFILE_B_ID,
          CredentialCode: 'NY-BAR-12345',
          Message: 'Verified for wrong profile',
        };
      },
    });
    const mismatchResult = await provider.VerifyCredential(
      { ProfessionalProfileID: PROFILE_A_ID, CredentialCode: 'NY-BAR-12345' },
      coordinator,
    );
    expect(mismatchResult.Success).toBe(false);
    expect(mismatchResult.VerificationStatus).toBe('Rejected');

    ExternalActionCredentialProvider.ConfigureAdapter(null);
  });

  it('CR-02 & CR-03: enforces coordinator authority and rejects cross-profile credential ownership tampering', async () => {
    const store: MockStore = {
      profiles: new Map([[PROFILE_A_ID.toLowerCase(), makeProfileRecord(PROFILE_A_ID, 'Pending')]]),
      credentials: new Map([[CRED_1_ID.toLowerCase(), makeCredentialRecord(CRED_1_ID, PROFILE_B_ID, 'CA-BAR-1')]]),
      assignments: new Map(),
      feedbacks: new Map(),
      bridgeRows: [],
    };
    const dp = new MockCredentialDataProvider(store, [
      makeEntityInfo('MJ_BizApps_Referrals: Professional Profiles', ['ID']),
    ]);

    const nonCoordinator = makeUser(['Seeker']);
    await expect(
      ReferralCredentialService.Instance.VerifyAndPersistCredential(
        { ProfessionalProfileID: PROFILE_A_ID, CredentialCode: 'NY-BAR-1', ProviderKey: 'Manual' },
        nonCoordinator,
        dp,
      ),
    ).rejects.toThrow(AuthorizationError);

    const coordinator = makeUser(['Referral Coordinator']);
    await expect(
      ReferralCredentialService.Instance.VerifyAndPersistCredential(
        {
          ProfessionalProfileID: PROFILE_A_ID,
          ProfessionalCredentialID: CRED_1_ID,
          CredentialCode: 'CA-BAR-1',
          ProviderKey: 'Manual',
        },
        coordinator,
        dp,
      ),
    ).rejects.toThrow(AuthorizationError);
  });

  it('CR-04: OptionalCredentialingBridgeProvider inspects metadata fields and fails closed on expired credentials', async () => {
    const bridge = new OptionalCredentialingBridgeProvider();
    const coordinator = makeUser(['Coordinator']);

    const storeWithoutBridge: MockStore = {
      profiles: new Map([[PROFILE_A_ID.toLowerCase(), makeProfileRecord(PROFILE_A_ID)]]),
      credentials: new Map(),
      assignments: new Map(),
      feedbacks: new Map(),
      bridgeRows: [],
    };
    const dpNoBridge = new MockCredentialDataProvider(storeWithoutBridge, [
      makeEntityInfo('MJ_BizApps_Referrals: Professional Profiles', ['ID']),
    ]);
    expect(bridge.IsAvailable(dpNoBridge)).toBe(false);

    const storeWithExpiredBridge: MockStore = {
      profiles: new Map([[PROFILE_A_ID.toLowerCase(), makeProfileRecord(PROFILE_A_ID)]]),
      credentials: new Map(),
      assignments: new Map(),
      feedbacks: new Map(),
      bridgeRows: [
        {
          ID: 'b0000000-0000-4000-8000-000000000001',
          PersonID: PERSON_A_ID,
          CredentialCode: 'BRIDGE-101',
          VerificationStatus: 'Verified',
          ExpiresAt: '2020-01-01T00:00:00.000Z',
        },
      ],
    };
    const dpWithBridge = new MockCredentialDataProvider(storeWithExpiredBridge, [
      makeEntityInfo('MJ_BizApps_Credentialing: Credentials', ['ID', 'PersonID', 'CredentialCode']),
    ]);
    expect(bridge.IsAvailable(dpWithBridge)).toBe(true);

    const expiredResult = await bridge.VerifyCredential(
      { ProfessionalProfileID: PROFILE_A_ID, CredentialCode: 'BRIDGE-101' },
      coordinator,
      dpWithBridge,
    );
    expect(expiredResult.Success).toBe(false);
    expect(expiredResult.VerificationStatus).toBe('Expired');
  });

  it('CR-05 & CR-11: synchronizes profile status on verify/revoke and MatchingEngine excludes expired/revoked credentials', async () => {
    const store: MockStore = {
      profiles: new Map([[PROFILE_A_ID.toLowerCase(), makeProfileRecord(PROFILE_A_ID, 'Pending')]]),
      credentials: new Map(),
      assignments: new Map(),
      feedbacks: new Map(),
      bridgeRows: [],
    };
    const dp = new MockCredentialDataProvider(store, []);
    const coordinator = makeUser(['Coordinator']);

    const verified = await ReferralCredentialService.Instance.VerifyAndPersistCredential(
      {
        ProfessionalProfileID: PROFILE_A_ID,
        CredentialCode: 'NY-BAR-777',
        ProviderKey: 'Manual',
      },
      coordinator,
      dp,
    );
    expect(verified.Success).toBe(true);
    expect(store.profiles.get(PROFILE_A_ID.toLowerCase())?.VerificationStatus).toBe('Verified');

    // Now revoke that credential and verify profile is demoted from Verified
    await ReferralCredentialService.Instance.ReviewPendingCredential(
      {
        ProfessionalProfileID: PROFILE_A_ID,
        ProfessionalCredentialID: verified.ProfessionalCredentialID!,
        Decision: 'Revoked',
      },
      coordinator,
      dp,
    );
    expect(store.profiles.get(PROFILE_A_ID.toLowerCase())?.VerificationStatus).toBe('Expired');

    // MatchingEngine disqualifies a Verified profile whose primary/jurisdiction credential is Expired
    const activeProfile = makeProfileRecord(PROFILE_A_ID, 'Verified');
    const practiceLink = {
      ProfessionalProfileID: PROFILE_A_ID,
      PracticeAreaID: PA_ID,
      ProficiencyLevel: 'Primary',
      YearsInPractice: 10,
    } as ProfessionalPracticeAreaEntity;
    const jurLink = {
      ProfessionalProfileID: PROFILE_A_ID,
      JurisdictionID: JUR_ID,
      StandingStatus: 'GoodStanding',
      IsPrimary: true,
    } as ProfessionalJurisdictionEntity;
    const expiredCred = makeCredentialRecord(CRED_1_ID, PROFILE_A_ID, 'NY-BAR-777', 'Expired');

    const matchScore = MatchingEngine.ScoreCandidate({
      profile: activeProfile,
      practiceLink,
      jurisdictionLink: jurLink,
      criteria: { PracticeAreaID: PA_ID, JurisdictionID: JUR_ID },
      conflictParties: [],
      activeMatterParties: [],
      credentials: [expiredCred],
    });
    expect(matchScore.Eligible).toBe(false);
    expect(matchScore.DisqualificationReason).toContain('credential');
  });

  it('CR-09 & CR-10: SubmitReferralFeedback populates ReferralRequestID, enforces participant auth, prevents duplicates, and counts distinct completed assignments', async () => {
    const store: MockStore = {
      profiles: new Map([[PROFILE_A_ID.toLowerCase(), makeProfileRecord(PROFILE_A_ID, 'Verified', null)]]),
      credentials: new Map(),
      assignments: new Map([
        [ASSIGN_1_ID.toLowerCase(), makeAssignmentRecord(ASSIGN_1_ID, REQ_1_ID, PROFILE_A_ID, 'Accepted')],
        [ASSIGN_2_ID.toLowerCase(), makeAssignmentRecord(ASSIGN_2_ID, REQ_1_ID, PROFILE_A_ID, 'InProgress')],
      ]),
      requests: new Map([[REQ_1_ID.toLowerCase(), makeRequestRecord(REQ_1_ID, 'seeker@example.com')]]),
      feedbacks: new Map(),
      bridgeRows: [],
    };
    const dp = new MockCredentialDataProvider(store, []);
    const seekerUser = makeUser(['Seeker'], SEEKER_USER_ID, 'seeker@example.com');
    const proUser = makeUser(['Professional'], ADMIN_USER_ID, 'counsel@example.com');
    const outsiderUser = makeUser(['Seeker'], OUTSIDER_USER_ID, 'outsider@example.com');

    await expect(
      ReferralCredentialService.Instance.SubmitReferralFeedback(
        {
          ReferralAssignmentID: ASSIGN_1_ID,
          Rating: 5,
          OutcomeStatus: 'Resolved',
          SubmittedByType: 'Seeker',
        },
        outsiderUser,
        dp,
      ),
    ).rejects.toThrow(AuthorizationError);

    // Both Seeker and Professional submit feedback for ASSIGN_1_ID -> distinct completed assignments should be 1
    const r1 = await ReferralCredentialService.Instance.SubmitReferralFeedback(
      {
        ReferralAssignmentID: ASSIGN_1_ID,
        Rating: 5,
        OutcomeStatus: 'Resolved',
        SubmittedByType: 'Seeker',
        Comments: 'Great work',
      },
      seekerUser,
      dp,
    );
    expect(r1.ReferralRequestID).toBe(REQ_1_ID);
    expect(r1.TotalCompletedCount).toBe(1);

    const r2 = await ReferralCredentialService.Instance.SubmitReferralFeedback(
      {
        ReferralAssignmentID: ASSIGN_1_ID,
        Rating: 3,
        OutcomeStatus: 'Engaged',
        SubmittedByType: 'Professional',
      },
      proUser,
      dp,
    );
    expect(r2.AverageRating).toBe(4);
    expect(r2.TotalCompletedCount).toBe(1);

    // Upserting same (ReferralAssignmentID, SubmittedByType) updates rather than duplicating
    const r3 = await ReferralCredentialService.Instance.SubmitReferralFeedback(
      {
        ReferralAssignmentID: ASSIGN_1_ID,
        Rating: 5,
        OutcomeStatus: 'Engaged',
        SubmittedByType: 'Professional',
      },
      proUser,
      dp,
    );
    expect(store.feedbacks.size).toBe(2);
    expect(r3.AverageRating).toBe(5);

    // Second distinct assignment with Resolved outcome increments TotalCompletedCount to 2
    const r4 = await ReferralCredentialService.Instance.SubmitReferralFeedback(
      {
        ReferralAssignmentID: ASSIGN_2_ID,
        Rating: 5,
        OutcomeStatus: 'Resolved',
        SubmittedByType: 'Seeker',
      },
      seekerUser,
      dp,
    );
    expect(r4.TotalCompletedCount).toBe(2);
  });

  it('CR-01 & CR-04 & CR-05 Round 2: HMAC verification, bridge VerifiedAt/ambiguity, and 0-credential demotion', async () => {
    const secret = 'test-hmac-secret-round-2';
    ExternalActionCredentialProvider.ConfigureAdapter(null);
    ExternalActionCredentialProvider.ConfigureHmacSecret(secret);
    const provider = new ExternalActionCredentialProvider();
    const coordinator = makeUser(['Coordinator']);

    const issuedAtIso = new Date(Date.now() - 60_000).toISOString();
    const expiresAtIso = new Date(Date.now() + 86_400_000).toISOString();
    const canonical = `${PROFILE_A_ID}|NY-BAR-HMAC|${issuedAtIso}|${expiresAtIso}`;
    const validSig = createHmac('sha256', secret).update(canonical).digest('hex');

    const validResult = await provider.VerifyCredential(
      {
        ProfessionalProfileID: PROFILE_A_ID,
        CredentialCode: 'NY-BAR-HMAC',
        Metadata: {
          subjectProfileId: PROFILE_A_ID,
          credentialCode: 'NY-BAR-HMAC',
          issuedAt: issuedAtIso,
          expiresAt: expiresAtIso,
          hmacSignature: validSig,
        },
      },
      coordinator,
    );
    expect(validResult.Success).toBe(true);
    expect(validResult.VerificationStatus).toBe('Verified');

    const tamperedResult = await provider.VerifyCredential(
      {
        ProfessionalProfileID: PROFILE_A_ID,
        CredentialCode: 'NY-BAR-HMAC',
        Metadata: {
          subjectProfileId: PROFILE_A_ID,
          credentialCode: 'NY-BAR-HMAC',
          issuedAt: issuedAtIso,
          expiresAt: expiresAtIso,
          hmacSignature: '0'.repeat(64),
        },
      },
      coordinator,
    );
    expect(tamperedResult.Success).toBe(false);
    expect(tamperedResult.VerificationStatus).toBe('Rejected');
    ExternalActionCredentialProvider.ConfigureHmacSecret(null);

    // Bridge fails closed on duplicate/ambiguous rows
    const bridge = new OptionalCredentialingBridgeProvider();
    const storeAmbiguous: MockStore = {
      profiles: new Map([[PROFILE_A_ID.toLowerCase(), makeProfileRecord(PROFILE_A_ID)]]),
      credentials: new Map(),
      assignments: new Map(),
      feedbacks: new Map(),
      bridgeRows: [
        { ID: '1', PersonID: PERSON_A_ID, CredentialCode: 'DUP-1', VerificationStatus: 'Verified' },
        { ID: '2', PersonID: PERSON_A_ID, CredentialCode: 'DUP-1', VerificationStatus: 'Revoked' },
      ],
    };
    const dpBridge = new MockCredentialDataProvider(storeAmbiguous, [
      makeEntityInfo('MJ_BizApps_Credentialing: Credentials', ['ID', 'PersonID', 'CredentialCode']),
    ]);
    const ambigResult = await bridge.VerifyCredential(
      { ProfessionalProfileID: PROFILE_A_ID, CredentialCode: 'DUP-1' },
      coordinator,
      dpBridge,
    );
    expect(ambigResult.Success).toBe(false);
    expect(ambigResult.VerificationStatus).toBe('Pending');

    // MatchingEngine rejects Verified profile when credentials array is empty (0 active verified credentials)
    const zeroCredScore = MatchingEngine.ScoreCandidate({
      profile: makeProfileRecord(PROFILE_A_ID, 'Verified'),
      practiceLink: {
        ProfessionalProfileID: PROFILE_A_ID,
        PracticeAreaID: PA_ID,
        ProficiencyLevel: 'Primary',
        YearsInPractice: 10,
      } as ProfessionalPracticeAreaEntity,
      jurisdictionLink: {
        ProfessionalProfileID: PROFILE_A_ID,
        JurisdictionID: JUR_ID,
        StandingStatus: 'GoodStanding',
        IsPrimary: true,
      } as ProfessionalJurisdictionEntity,
      criteria: { PracticeAreaID: PA_ID, JurisdictionID: JUR_ID },
      conflictParties: [],
      activeMatterParties: [],
      credentials: [],
    });
    expect(zeroCredScore.Eligible).toBe(false);
    expect(zeroCredScore.DisqualificationReason).toContain('credential');
  });

  it('CR-13: verifies zero handwritten .Get() or .Set() calls across all hand-authored packages', () => {
    const repoRoot = resolve(process.cwd(), '../..');
    const pkgDirs = [
      'packages/Core/src',
      'packages/Actions/src',
      'packages/Angular/src',
      'packages/EntitiesServer/src',
      'packages/Server/src',
    ];
    for (const rel of pkgDirs) {
      const files = collectTsFiles(join(repoRoot, rel));
      for (const file of files) {
        const content = readFileSync(file, 'utf8');
        expect(content).not.toMatch(/\.(Get|Set)\(\s*['"]/);
      }
    }
  });
});
