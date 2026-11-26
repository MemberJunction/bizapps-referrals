import '@angular/compiler';
import { TestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';
import { JSDOM } from 'jsdom';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

const dom = new JSDOM('<!doctype html><html><body></body></html>');
Object.assign(globalThis, {
  window: dom.window,
  document: dom.window.document,
  HTMLElement: dom.window.HTMLElement,
  Node: dom.window.Node,
  Event: dom.window.Event,
  CustomEvent: dom.window.CustomEvent,
});

const mockCurrentUser = { ID: '50000000-0000-4000-8000-000000000090', Name: 'Perf User' };
const runViewMock = vi.fn();
const runViewsMock = vi.fn();
const settingsStore = new Map<string, string>();

const mockMetadataProvider = {
  CurrentUser: mockCurrentUser,
  Entities: [],
  EntityByName: () => undefined,
  RunView: runViewMock,
  RunViews: runViewsMock,
};

vi.mock('@memberjunction/core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@memberjunction/core')>();
  class MockRunView {
    static FromMetadataProvider() {
      return new MockRunView();
    }
    RunView = runViewMock;
    RunViews = runViewsMock;
  }
  return {
    ...actual,
    Metadata: class {
      static get Provider() {
        return mockMetadataProvider;
      }
      get CurrentUser() {
        return mockCurrentUser;
      }
    },
    RunView: MockRunView,
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
      NotifyLoadStarted(): void {}
      NotifyLoadComplete(): void {}
    },
    NavigationService: class {
      OpenEntityRecord = vi.fn();
      OpenNavItemByName = vi.fn();
    },
  };
});

import { NavigationService } from '@memberjunction/ng-shared';
import { ReferralsEngineBase } from '@mj-biz-apps/referrals-entities';
import { ReferralsCredentialDirectoryComponent } from '../lib/components/credential-directory.component.js';
import { ReferralsReportGalleryComponent } from '../lib/components/report-gallery.component.js';
import { ReferralsFinderWidgetComponent } from '../lib/finder-widget/referrals-finder-widget.component.js';

const PA_ID = '10000000-0000-4000-8000-000000000001';
const JUR_ID = '20000000-0000-4000-8000-000000000001';
const TIER_ID = '30000000-0000-4000-8000-000000000001';
const PRO_ID = '40000000-0000-4000-8000-000000000001';

function wireMockRunViews(): void {
  runViewsMock.mockImplementation(async (views: Array<{ EntityName: string; ResultType?: string }>) =>
    views.map((v) => {
      if (v.EntityName === 'MJ_BizApps_Referrals: Practice Areas') {
        return { Success: true, Results: [{ ID: PA_ID, Name: 'Corporate M&A', Code: 'CORP', Category: 'Legal', DisplayRank: 1, IsActive: true }] };
      }
      if (v.EntityName === 'MJ_BizApps_Referrals: Jurisdictions') {
        return { Success: true, Results: [{ ID: JUR_ID, Name: 'Delaware', Code: 'US-DE', IsActive: true }] };
      }
      if (v.EntityName === 'MJ_BizApps_Referrals: Referral Tiers') {
        return { Success: true, Results: [{ ID: TIER_ID, Name: 'Standard', Code: 'STD', SLAResponseHours: 24, IsActive: true }] };
      }
      if (v.EntityName === 'MJ_BizApps_Referrals: Professional Profiles') {
        return {
          Success: true,
          Results: [
            {
              ID: PRO_ID,
              DisplayName: 'Jane Counsel',
              FirmName: 'Counsel LLP',
              Email: 'jane@counsel.example.com',
              VerificationStatus: 'Verified',
              AvailabilityStatus: 'Available',
              ActiveReferralCount: 1,
              MaxConcurrentReferrals: 5,
              AverageResponseHours: 2,
              AverageRating: 4.9,
              ReadinessScore: 90,
              IsActive: true,
            },
          ],
        };
      }
      if (v.EntityName === 'MJ_BizApps_Referrals: Professional Practice Areas') {
        return { Success: true, Results: [{ ProfessionalProfileID: PRO_ID, PracticeAreaID: PA_ID, ProficiencyLevel: 'Primary', YearsInPractice: 10 }] };
      }
      if (v.EntityName === 'MJ_BizApps_Referrals: Professional Jurisdictions') {
        return { Success: true, Results: [{ ProfessionalProfileID: PRO_ID, JurisdictionID: JUR_ID, StandingStatus: 'GoodStanding' }] };
      }
      if (v.EntityName === 'MJ_BizApps_Referrals: Professional Credentials') {
        return { Success: true, Results: [{ ID: 'cred-1', ProfessionalProfileID: PRO_ID, CredentialCode: 'DE-BAR', VerificationStatus: 'Pending' }] };
      }
      if (v.EntityName === 'MJ_BizApps_Referrals: Referral Requests') {
        return { Success: true, Results: [{ ID: 'req-1', PracticeAreaID: PA_ID, JurisdictionID: JUR_ID, Status: 'Completed', SubmittedAt: new Date() }] };
      }
      return { Success: true, Results: [] };
    }),
  );
}

describe('Angular batched RunViews and ReferralsEngineBase reuse', () => {
  beforeAll(() => {
    TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
  });

  beforeEach(() => {
    TestBed.resetTestingModule();
    runViewMock.mockReset();
    runViewsMock.mockReset();
    settingsStore.clear();
    ReferralsEngineBase.Instance.InvalidateCache();
    vi.restoreAllMocks();
  });

  it('ReferralsReportGalleryComponent batches all 6 transactional views into 1 RunViews call with simple ResultType and caches taxonomy via ReferralsEngineBase', async () => {
    wireMockRunViews();
    TestBed.configureTestingModule({
      imports: [ReferralsReportGalleryComponent],
      providers: [{ provide: NavigationService, useValue: { OpenEntityRecord: vi.fn() } }],
    });
    const fixture = TestBed.createComponent(ReferralsReportGalleryComponent);
    const cmp = fixture.componentInstance;

    await cmp.LoadRealTelemetry();
    expect(runViewMock).not.toHaveBeenCalled();
    // 1 batch for ReferralsEngineBase cold load + 1 batch for the 6 transactional telemetry views
    expect(runViewsMock).toHaveBeenCalledTimes(2);
    const telemetryCall = runViewsMock.mock.calls.find((c) => c[0].length === 6);
    expect(telemetryCall).toBeDefined();
    expect(telemetryCall![0].every((v: { ResultType?: string }) => v.ResultType === 'simple')).toBe(true);
    expect(cmp.TotalRequests).toBe(1);

    // Second refresh reuses warm ReferralsEngineBase: only 1 RunViews call (for transactional views)
    runViewsMock.mockClear();
    await cmp.Refresh();
    expect(runViewMock).not.toHaveBeenCalled();
    expect(runViewsMock).toHaveBeenCalledTimes(1);
    expect(runViewsMock.mock.calls[0][0]).toHaveLength(6);
    fixture.destroy();
  });

  it('ReferralsCredentialDirectoryComponent batches all 4 transactional views into 1 RunViews call and resolves PracticeArea/Jurisdiction names via ReferralsEngineBase', async () => {
    wireMockRunViews();
    TestBed.configureTestingModule({
      imports: [ReferralsCredentialDirectoryComponent],
      providers: [{ provide: NavigationService, useValue: { OpenEntityRecord: vi.fn() } }],
    });
    const fixture = TestBed.createComponent(ReferralsCredentialDirectoryComponent);
    const cmp = fixture.componentInstance;

    await cmp.LoadProfiles();
    expect(runViewMock).not.toHaveBeenCalled();
    expect(cmp.AllCards).toHaveLength(1);
    expect(cmp.AllCards[0].PracticeAreaNames).toEqual(['Corporate M&A']);
    expect(cmp.AllCards[0].JurisdictionNames).toEqual(['Delaware']);
    expect(cmp.PendingQueue).toHaveLength(1);

    // Warm reload hits RunViews exactly once (4 transactional entities, 0 taxonomy queries)
    runViewsMock.mockClear();
    await cmp.LoadProfiles();
    expect(runViewsMock).toHaveBeenCalledTimes(1);
    expect(runViewsMock.mock.calls[0][0]).toHaveLength(4);
    expect(runViewsMock.mock.calls[0][0].every((v: { ResultType?: string }) => v.ResultType === 'simple')).toBe(true);
    fixture.destroy();
  });

  it('ReferralsFinderWidgetComponent loads lookups from ReferralsEngineBase and batches ExecuteSearch into 1 RunViews call', async () => {
    wireMockRunViews();
    TestBed.configureTestingModule({
      imports: [ReferralsFinderWidgetComponent],
    });
    const fixture = TestBed.createComponent(ReferralsFinderWidgetComponent);
    const cmp = fixture.componentInstance;

    await cmp.LoadLookups();
    expect(cmp.PracticeAreas).toHaveLength(1);
    expect(cmp.Jurisdictions).toHaveLength(1);
    expect(runViewMock).not.toHaveBeenCalled();
    expect(runViewsMock).toHaveBeenCalledTimes(1);

    // Search uses 1 single batched RunViews call with ResultType: 'simple'
    runViewsMock.mockClear();
    cmp.SelectedPracticeAreaID = PA_ID;
    cmp.SelectedJurisdictionID = JUR_ID;
    await cmp.ExecuteSearch();
    expect(runViewMock).not.toHaveBeenCalled();
    expect(runViewsMock).toHaveBeenCalledTimes(1);
    expect(runViewsMock.mock.calls[0][0]).toHaveLength(3);
    expect(runViewsMock.mock.calls[0][0].every((v: { ResultType?: string }) => v.ResultType === 'simple')).toBe(true);
    expect(cmp.Matches).toHaveLength(1);
    fixture.destroy();
  });
});
