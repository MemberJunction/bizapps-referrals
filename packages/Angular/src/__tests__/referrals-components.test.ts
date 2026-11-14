import '@angular/compiler';
import { TestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';
import { JSDOM } from 'jsdom';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

const dom = new JSDOM('<!doctype html><html><body></body></html>');
Object.assign(globalThis, {
  window: dom.window,
  document: dom.window.document,
  HTMLElement: dom.window.HTMLElement,
  Node: dom.window.Node,
  Event: dom.window.Event,
  CustomEvent: dom.window.CustomEvent,
});

const savedEntities: Array<{ entityName: string; record: Record<string, unknown> }> = [];
const deletedIds: string[] = [];
let failNextPartySave = false;
const settingsStore = new Map<string, string>();
const mockCurrentUser = { ID: '50000000-0000-4000-8000-000000000001', Name: 'Test User' };

const runViewMock = vi.fn();
const runViewsMock = vi.fn();

vi.mock('@memberjunction/core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@memberjunction/core')>();
  return {
    ...actual,
    Metadata: class {
      static get Provider() {
        return undefined;
      }
      get CurrentUser() {
        return mockCurrentUser;
      }
      async GetEntityObject<T>(entityName: string): Promise<T> {
        const record: Record<string, unknown> = {
          ID: '99999999-0000-4000-8000-000000000001',
          RequestNumber: 'REF-TEST-001',
          Save: async () => {
            if (
              failNextPartySave &&
              entityName === 'MJ_BizApps_Referrals: Conflict Check Parties'
            ) {
              return false;
            }
            savedEntities.push({ entityName, record: { ...record } });
            return true;
          },
          Delete: async () => {
            deletedIds.push(String(record.ID));
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

vi.mock('@memberjunction/core-entities', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@memberjunction/core-entities')>();
  const { of } = await import('rxjs');
  return {
    ...actual,
    UserInfoEngine: {
      ...actual.UserInfoEngine,
      get Instance() {
        return {
          UserNotifications$: of([]),
          UserNotificationsIfPermitted: [],
          GetSetting: (key: string) => settingsStore.get(key),
          SetSetting: async (key: string, value: string) => {
            settingsStore.set(key, value);
            return true;
          },
        };
      },
    },
  };
});

vi.mock('@memberjunction/ng-shared', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@memberjunction/ng-shared')>();
  return {
    ...actual,
    BaseResourceComponent: class {
      ngOnInit(): void {}
      NotifyLoadComplete(): void {}
    },
    NavigationService: class {
      OpenEntityRecord = vi.fn();
    },
  };
});

vi.mock('@memberjunction/ng-base-forms', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@memberjunction/ng-base-forms')>();
  return {
    ...actual,
    BaseFormComponent: class {
      public record: unknown;
      public EditMode = false;
      public formContext: unknown;
      public initSections(): void {}
      public BuildRelationshipViewParamsByEntityName(): unknown { return {}; }
      public NewRecordValues(): unknown { return {}; }
      public IsSectionExpanded(): boolean { return false; }
      public GetSectionRowCount(): number { return 0; }
      public SetSectionRowCount(): void {}
      public OnFormNavigate(): void {}
      public OnDeleteRequested(): void {}
      public OnFavoriteToggled(): void {}
      public OnHistoryRequested(): void {}
      public OnListManagementRequested(): void {}
    },
    BaseFormPanel: class {},
  };
});

import { CascadeRoutingService, MatchingEngine } from '@mj-biz-apps/referrals-core';
import { NavigationService } from '@memberjunction/ng-shared';
import {
  ReferralsOpsTelemetryComponent,
  ReferralsProInboxComponent,
  ReferralsSeekerIntakeComponent,
} from '../../dist/public-api.js';
import type {
  JurisdictionEntity,
  PracticeAreaEntity,
  ProfessionalJurisdictionEntity,
  ProfessionalPracticeAreaEntity,
  ProfessionalProfileEntity,
  ReferralAssignmentEntity,
  ReferralRequestEntity,
} from '@mj-biz-apps/referrals-entities';

describe('@mj-biz-apps/referrals-ng DOM rendering & interaction tests (ART-TEST-2 / RR-09)', () => {
  beforeAll(() => {
    TestBed.initTestEnvironment(
      BrowserDynamicTestingModule,
      platformBrowserDynamicTesting(),
    );
  });

  beforeEach(() => {
    TestBed.resetTestingModule();
    savedEntities.length = 0;
    deletedIds.length = 0;
    failNextPartySave = false;
    settingsStore.clear();
    runViewMock.mockReset();
    runViewsMock.mockReset();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders ReferralsSeekerIntakeComponent DOM, passes draft ConflictParties to FindMatches, persists preferences across recreation, and aborts Draft on party failure', async () => {
    runViewsMock.mockResolvedValue([
      { Success: true, Results: [{ ID: '10000000-0000-4000-8000-000000000001', Name: 'Corporate M&A' }] },
      { Success: true, Results: [{ ID: '20000000-0000-4000-8000-000000000001', Name: 'Delaware' }] },
      { Success: true, Results: [{ ID: '30000000-0000-4000-8000-000000000001', Name: 'Priority', SLAResponseHours: 8 }] },
    ]);
    const findMatchesSpy = vi.spyOn(MatchingEngine, 'FindMatches').mockResolvedValue([
      {
        ProfessionalProfileID: '40000000-0000-4000-8000-000000000001',
        DisplayName: 'Conflict Counsel',
        FirmName: 'Rival Corp LLP',
        Email: 'c@rival.com',
        VerificationStatus: 'Verified',
        AvailabilityStatus: 'Available',
        ActiveReferralCount: 0,
        MaxConcurrentReferrals: 5,
        Score: 0,
        Breakdown: {
          PracticeAreaScore: 0,
          JurisdictionScore: 0,
          CapacityScore: 0,
          ResponsivenessScore: 0,
          RatingScore: 0,
          LanguageBonus: 0,
          TotalScore: 0,
        },
        ConflictStatus: 'ConflictFound',
        ConflictReasons: ['Firm matches adverse party Rival Corp LLP'],
        Eligible: false,
        DisqualificationReason: 'Conflict of interest: Rival Corp LLP',
      },
    ]);

    TestBed.configureTestingModule({
      imports: [ReferralsSeekerIntakeComponent],
      providers: [{ provide: NavigationService, useValue: { OpenEntityRecord: vi.fn() } }],
    });

    const fixture = TestBed.createComponent(ReferralsSeekerIntakeComponent);
    const cmp = fixture.componentInstance;
    await cmp.ngOnInit();
    fixture.detectChanges();

    const host: HTMLElement = fixture.nativeElement;
    expect(host.querySelector('.headline')?.textContent).toContain('Tell us about your matter');

    // Trigger structured intake parse via DOM button click
    cmp.RawIntakeNotes =
      'Name: Alex Morgan | Email: alex@company.com | Matter: Delaware Conversion | Adverse: Rival Corp LLP | pro bono';
    fixture.detectChanges();
    const parseBtn = host.querySelector('.parse-btn') as HTMLButtonElement;
    parseBtn.click();
    fixture.detectChanges();

    expect(cmp.ConflictParties).toHaveLength(1);
    expect(host.querySelectorAll('.conflict-item')).toHaveLength(1);
    expect(host.querySelector('.conflict-item')?.textContent).toContain('Rival Corp LLP');

    // Select practice area & jurisdiction, then trigger RunMatchPreview (RR-08)
    cmp.Prefs.PracticeAreaID = '10000000-0000-4000-8000-000000000001';
    cmp.Prefs.JurisdictionID = '20000000-0000-4000-8000-000000000001';
    await cmp.RunMatchPreview();
    await cmp.OnPreferenceChange();
    fixture.detectChanges();

    expect(findMatchesSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        ConflictParties: [
          expect.objectContaining({ PartyName: 'Rival Corp LLP', PartyRole: 'Adverse' }),
        ],
      }),
      mockCurrentUser,
    );
    expect(host.querySelector('.candidate-card.disqualified')).not.toBeNull();
    expect(host.querySelector('.candidate-status.warn')?.textContent).toContain('Conflict of interest');

    // Verify UserInfoEngine persistence across component destruction & recreation
    fixture.destroy();
    const fixture2 = TestBed.createComponent(ReferralsSeekerIntakeComponent);
    const cmp2 = fixture2.componentInstance;
    await cmp2.ngOnInit();
    expect(cmp2.Prefs.PracticeAreaID).toBe('10000000-0000-4000-8000-000000000001');
    expect(cmp2.Prefs.DrawerOpen).toBe(true);
    expect(cmp2.Prefs.RequiresProBono).toBe(true);

    // Verify RR-07 atomicity: if a ConflictCheckParty save fails, Draft request is deleted and never marked Submitted
    cmp2.SeekerName = 'Alex Morgan';
    cmp2.SeekerEmail = 'alex@company.com';
    cmp2.MatterTitle = 'Delaware Conversion';
    cmp2.MatterSummary = 'Adverse dispute';
    cmp2.ConflictParties = [{ PartyName: 'Rival Corp LLP', PartyRole: 'Adverse', OrganizationName: 'Rival Corp LLP' }];
    failNextPartySave = true;
    await cmp2.SubmitRequest();
    fixture2.detectChanges();

    expect(deletedIds).toContain('99999999-0000-4000-8000-000000000001');
    expect(cmp2.StatusTone).toBe('error');
    expect(savedEntities.some((e) => e.record.Status === 'Submitted')).toBe(false);
    fixture2.destroy();
  });

  it('renders ReferralsProInboxComponent DOM, updates SLA countdown timer on interval, and cleans up timer on destroy', async () => {
    vi.useFakeTimers();
    const baseNow = new Date('2026-11-13T12:00:00.000Z').getTime();
    vi.setSystemTime(baseNow);

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

    runViewMock.mockImplementation(async (params: { EntityName: string }) => {
      if (params.EntityName === 'MJ_BizApps_Referrals: Professional Profiles') {
        return { Success: true, Results: [mockProfile] };
      }
      return {
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
            SLADeadlineAt: new Date(baseNow + 90 * 60_000),
          } as ReferralAssignmentEntity,
        ],
      };
    });
    runViewsMock.mockResolvedValue([
      { Success: true, Results: [{ ID: requestId, RequestNumber: 'REF-1', MatterTitle: 'Patent Filing' }] },
      { Success: true, Results: [] },
    ]);

    TestBed.configureTestingModule({
      imports: [ReferralsProInboxComponent],
      providers: [{ provide: NavigationService, useValue: { OpenEntityRecord: vi.fn() } }],
    });

    const fixture = TestBed.createComponent(ReferralsProInboxComponent);
    const cmp = fixture.componentInstance;
    await cmp.ngOnInit();
    fixture.detectChanges();

    const host: HTMLElement = fixture.nativeElement;
    expect(host.querySelector('.lead-sla')?.textContent).toContain('1h 30m left');

    // Advance clock by 60 seconds and verify timer updates NowMs & rendered countdown
    vi.advanceTimersByTime(60_000);
    fixture.detectChanges();
    expect(host.querySelector('.lead-sla')?.textContent).toContain('1h 29m left');

    // Verify cleanup on destroy clears the interval
    const clearSpy = vi.spyOn(globalThis, 'clearInterval');
    fixture.destroy();
    expect(clearSpy).toHaveBeenCalled();
  });

  it('renders ReferralsOpsTelemetryComponent DOM with Supply-Demand Gap Matrix and Cascade Conversion KPIs', async () => {
    const paId = '10000000-0000-4000-8000-000000000001';
    const jurId = '20000000-0000-4000-8000-000000000001';
    const proId = '40000000-0000-4000-8000-000000000001';

    runViewsMock.mockResolvedValue([
      {
        Success: true,
        Results: [
          { ID: 'req-1', RequestNumber: 'REF-1', MatterTitle: 'M&A Deal', PracticeAreaID: paId, JurisdictionID: jurId, Status: 'Accepted', CurrentCascadeStep: 2 },
          { ID: 'req-2', RequestNumber: 'REF-2', MatterTitle: 'Patent Litigation', PracticeAreaID: paId, JurisdictionID: jurId, Status: 'Exhausted', CurrentCascadeStep: 3 },
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

    TestBed.configureTestingModule({
      imports: [ReferralsOpsTelemetryComponent],
      providers: [{ provide: NavigationService, useValue: { OpenEntityRecord: vi.fn() } }],
    });

    const fixture = TestBed.createComponent(ReferralsOpsTelemetryComponent);
    await fixture.componentInstance.ngOnInit();
    fixture.detectChanges();

    const host: HTMLElement = fixture.nativeElement;
    expect(host.textContent).toContain('Corporate M&A');
    expect(host.textContent).toContain('Delaware');
    expect(host.textContent).toContain('Deficit');
    expect(host.textContent).toContain('50%');
    fixture.destroy();
  });
});
