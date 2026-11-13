import '@angular/compiler';
import { ChangeDetectorRef, EnvironmentInjector, Injector, runInInjectionContext } from '@angular/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const savedEntities: Array<{ entityName: string; record: Record<string, unknown> }> = [];
const mockCurrentUser = { ID: '50000000-0000-4000-8000-000000000001', Name: 'Test User' };

const runViewMock = vi.fn();
const runViewsMock = vi.fn();

vi.mock('@memberjunction/core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@memberjunction/core')>();
  return {
    ...actual,
    Metadata: class {
      get CurrentUser() {
        return mockCurrentUser;
      }
      async GetEntityObject<T>(entityName: string): Promise<T> {
        const record: Record<string, unknown> = {
          ID: '99999999-0000-4000-8000-000000000001',
          RequestNumber: 'REF-TEST-001',
          Save: async () => {
            savedEntities.push({ entityName, record: { ...record } });
            return true;
          },
        };
        return record as unknown as T;
      }
    },
    RunView: class {
      RunView = runViewMock;
      RunViews = runViewsMock;
    },
  };
});

vi.mock('@memberjunction/ng-shared', () => ({
  BaseResourceComponent: class {
    ngOnInit(): void {}
    NotifyLoadComplete(): void {}
  },
  NavigationService: class {
    OpenEntityRecord = vi.fn();
  },
}));

vi.mock('@memberjunction/ng-ui-components', () => ({
  MJPageLayoutComponent: class {},
  MJPageHeaderComponent: class {},
  MJPageBodyComponent: class {},
}));

vi.mock('@memberjunction/ng-base-forms', () => ({
  BaseFormComponent: class {},
  BaseFormPanel: class {},
}));

import { NavigationService } from '@memberjunction/ng-shared';
import {
  ReferralsOpsTelemetryComponent,
  ReferralsProInboxComponent,
  ReferralsSeekerIntakeComponent,
} from '../public-api.js';
import {
  JurisdictionEntity,
  PracticeAreaEntity,
  ProfessionalJurisdictionEntity,
  ProfessionalPracticeAreaEntity,
  ProfessionalProfileEntity,
  ReferralAssignmentEntity,
  ReferralRequestEntity,
} from '@mj-biz-apps/referrals-entities';

function createComponent<T>(ctor: new () => T): T {
  const mockCdr: ChangeDetectorRef = {
    markForCheck: vi.fn(),
    detach: vi.fn(),
    detectChanges: vi.fn(),
    checkNoChanges: vi.fn(),
    reattach: vi.fn(),
  };
  const injector = Injector.create({
    providers: [
      { provide: ChangeDetectorRef, useValue: mockCdr },
      { provide: NavigationService, useValue: { OpenEntityRecord: vi.fn() } },
    ],
  }) as EnvironmentInjector;

  return runInInjectionContext(injector, () => new ctor());
}

describe('@mj-biz-apps/referrals-ng component interactions (ART-TEST-2)', () => {
  beforeEach(() => {
    savedEntities.length = 0;
    runViewMock.mockReset();
    runViewsMock.mockReset();
  });

  it('ReferralsSeekerIntakeComponent parses structured intake notes and persists ConflictCheckParty records', async () => {
    runViewsMock.mockResolvedValue([
      { Success: true, Results: [{ ID: '10000000-0000-4000-8000-000000000001', Name: 'Corporate M&A' }] },
      { Success: true, Results: [{ ID: '20000000-0000-4000-8000-000000000001', Name: 'Delaware' }] },
      { Success: true, Results: [{ ID: '30000000-0000-4000-8000-000000000001', Name: 'Priority', SLAResponseHours: 8 }] },
    ]);

    const cmp = createComponent(ReferralsSeekerIntakeComponent);
    await cmp.ngOnInit();

    cmp.ParseStructuredIntake(
      'Name: Alex Morgan | Email: alex@company.com | Matter: Delaware Conversion | Adverse: Rival Corp LLP, Apex Holdings Inc. | pro bono',
    );

    expect(cmp.SeekerName).toBe('Alex Morgan');
    expect(cmp.SeekerEmail).toBe('alex@company.com');
    expect(cmp.MatterTitle).toBe('Delaware Conversion');
    expect(cmp.Prefs.RequiresProBono).toBe(true);
    expect(cmp.ConflictParties).toHaveLength(2);

    cmp.NewPartyName = 'Third Party LLC';
    cmp.NewPartyRole = 'RelatedEntity';
    cmp.AddConflictParty();
    expect(cmp.ConflictParties).toHaveLength(3);

    cmp.RemoveConflictParty(1);
    expect(cmp.ConflictParties).toHaveLength(2);

    cmp.Prefs.PracticeAreaID = '10000000-0000-4000-8000-000000000001';
    cmp.Prefs.JurisdictionID = '20000000-0000-4000-8000-000000000001';
    await cmp.SubmitRequest();

    const requestSaves = savedEntities.filter((e) => e.entityName === 'MJ_BizApps_Referrals: Referral Requests');
    const partySaves = savedEntities.filter((e) => e.entityName === 'MJ_BizApps_Referrals: Conflict Check Parties');
    expect(requestSaves).toHaveLength(1);
    expect(partySaves).toHaveLength(2);
    expect(partySaves[0].record.NormalizedName).toBe('rival');
    expect(cmp.StatusTone).toBe('success');
  });

  it('ReferralsProInboxComponent filters to authenticated pro profile, computes SLA countdown, and saves capacity', async () => {
    const profileId = '40000000-0000-4000-8000-000000000001';
    const requestId = '60000000-0000-4000-8000-000000000001';
    const assignmentId = '70000000-0000-4000-8000-000000000001';

    const mockProfile = {
      ID: profileId,
      UserID: mockCurrentUser.ID,
      AvailabilityStatus: 'Available',
      ActiveReferralCount: 1,
      MaxConcurrentReferrals: 5,
      Save: vi.fn().mockResolvedValue(true),
    };

    runViewMock
      .mockResolvedValueOnce({ Success: true, Results: [mockProfile] })
      .mockResolvedValueOnce({
        Success: true,
        Results: [
          {
            ID: assignmentId,
            ReferralRequestID: requestId,
            ProfessionalProfileID: profileId,
            CascadeOrder: 1,
            Status: 'Offered',
            MatchScore: 92,
            ConflictStatus: 'Cleared',
            SLADeadlineAt: new Date(Date.now() + 90 * 60_000),
          } as ReferralAssignmentEntity,
        ],
      });
    runViewsMock.mockResolvedValueOnce([
      { Success: true, Results: [{ ID: requestId, RequestNumber: 'REF-1', MatterTitle: 'Patent Filing' }] },
      { Success: true, Results: [] },
    ]);

    const cmp = createComponent(ReferralsProInboxComponent);
    await cmp.ngOnInit();

    expect(runViewMock).toHaveBeenCalledWith(
      expect.objectContaining({
        EntityName: 'MJ_BizApps_Referrals: Referral Assignments',
        ExtraFilter: expect.stringContaining(`ProfessionalProfileID = '${profileId}'`),
      }),
      mockCurrentUser,
    );
    expect(cmp.Assignments).toHaveLength(1);
    expect(cmp.FormatSlaCountdown(cmp.Assignments[0].SLADeadlineAt)).toContain('1h');
    expect(cmp.IsSlaUrgent(cmp.Assignments[0].SLADeadlineAt)).toBe(true);

    cmp.ProfileAvailability = 'Limited';
    cmp.ProfileMaxConcurrent = 8;
    await cmp.SaveProfileCapacity();
    expect(mockProfile.AvailabilityStatus).toBe('Limited');
    expect(mockProfile.MaxConcurrentReferrals).toBe(8);
    expect(mockProfile.Save).toHaveBeenCalledTimes(1);

    cmp.ngOnDestroy();
  });

  it('ReferralsOpsTelemetryComponent computes Supply-Demand Gap Matrix and Cascade Conversion Telemetry', async () => {
    const paId = '10000000-0000-4000-8000-000000000001';
    const jurId = '20000000-0000-4000-8000-000000000001';
    const proId = '40000000-0000-4000-8000-000000000001';

    runViewsMock.mockResolvedValueOnce([
      {
        Success: true,
        Results: [
          { ID: 'req-1', PracticeAreaID: paId, JurisdictionID: jurId, Status: 'Accepted', CurrentCascadeStep: 2 },
          { ID: 'req-2', PracticeAreaID: paId, JurisdictionID: jurId, Status: 'Exhausted', CurrentCascadeStep: 3 },
        ] as ReferralRequestEntity[],
      },
      {
        Success: true,
        Results: [
          { ID: 'a-1', Status: 'ConflictRejected' },
          { ID: 'a-2', Status: 'Expired' },
          { ID: 'a-3', Status: 'Accepted' },
        ] as ReferralAssignmentEntity[],
      },
      { Success: true, Results: [{ ID: paId, Name: 'Corporate M&A' }] as PracticeAreaEntity[] },
      { Success: true, Results: [{ ID: jurId, Name: 'Delaware' }] as JurisdictionEntity[] },
      { Success: true, Results: [{ ID: proId, IsActive: true, VerificationStatus: 'Verified' }] as ProfessionalProfileEntity[] },
      { Success: true, Results: [{ ProfessionalProfileID: proId, PracticeAreaID: paId }] as ProfessionalPracticeAreaEntity[] },
      { Success: true, Results: [{ ProfessionalProfileID: proId, JurisdictionID: jurId, StandingStatus: 'GoodStanding' }] as ProfessionalJurisdictionEntity[] },
    ]);

    const cmp = createComponent(ReferralsOpsTelemetryComponent);
    await cmp.ngOnInit();

    expect(cmp.AcceptedCount).toBe(1);
    expect(cmp.ExhaustedCount).toBe(1);
    expect(cmp.ConflictRejectionCount).toBe(1);
    expect(cmp.ExpiredAssignmentCount).toBe(1);
    expect(cmp.AcceptanceRatePct).toBe(50);
    expect(cmp.AverageCascadeStep).toBe(2);

    expect(cmp.SupplyDemandMatrix).toHaveLength(1);
    expect(cmp.SupplyDemandMatrix[0]).toMatchObject({
      PracticeAreaName: 'Corporate M&A',
      JurisdictionName: 'Delaware',
      VerifiedSupply: 1,
      OpenDemand: 0,
      ExhaustedDemand: 1,
      GapStatus: 'Deficit',
    });
  });
});
