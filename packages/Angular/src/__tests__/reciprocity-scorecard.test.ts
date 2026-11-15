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

const mockCurrentUser = { ID: '50000000-0000-4000-8000-000000000050', Name: 'Test User' };
const settingsStore = new Map<string, string>();

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
      NotifyLoadStarted(): void {}
      NotifyLoadComplete(): void {}
    },
    NavigationService: class {
      OpenEntityRecord = vi.fn();
    },
  };
});

import { ReferralsReciprocityScorecardComponent } from '../lib/components/reciprocity-scorecard.component.js';
import { NavigationService } from '@memberjunction/ng-shared';
import { ReciprocityScorecardService } from '@mj-biz-apps/referrals-core';
import type { ProfessionalProfileEntity, ReciprocitySnapshotEntity } from '@mj-biz-apps/referrals-entities';

describe('ReferralsReciprocityScorecardComponent (Wave 3 Slice 4, AC-37/AC-39)', () => {
  beforeAll(() => {
    TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
  });

  beforeEach(() => {
    TestBed.resetTestingModule();
    settingsStore.clear();
    runViewMock.mockReset();
    runViewsMock.mockReset();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const lowProfile = { ID: 'p-low', DisplayName: 'Low Giver', ReadinessScore: 40 } as ProfessionalProfileEntity;
  const highProfile = { ID: 'p-high', DisplayName: 'High Giver', ReadinessScore: 90 } as ProfessionalProfileEntity;

  function snapshotFor(profile: ProfessionalProfileEntity, reciprocityIndex: number): ReciprocitySnapshotEntity {
    return {
      ProfessionalProfileID: profile.ID,
      ReferralsSent: 10,
      ReferralsReceived: 5,
      ReferralsAccepted: 4,
      ReferralsResolved: 3,
      AcceptanceRate: 0.8,
      MedianResponseHours: 2.5,
      SLABreachCount: 1,
      ReciprocityIndex: reciprocityIndex,
      AttributedFeeTotal: 1500,
    } as ReciprocitySnapshotEntity;
  }

  function mockViews(snapshots: ReciprocitySnapshotEntity[], profiles: ProfessionalProfileEntity[]): void {
    runViewMock.mockImplementation(async (params: { EntityName: string }) => {
      if (params.EntityName === 'MJ_BizApps_Referrals: Reciprocity Snapshots') {
        return { Success: true, Results: snapshots };
      }
      if (params.EntityName === 'MJ_BizApps_Referrals: Professional Profiles') {
        return { Success: true, Results: profiles };
      }
      return { Success: true, Results: [] };
    });
  }

  it('renders a ReciprocityIndex-descending ranked table with readiness badges', async () => {
    mockViews(
      [snapshotFor(lowProfile, 1.2), snapshotFor(highProfile, 3.5)],
      [lowProfile, highProfile],
    );

    TestBed.configureTestingModule({
      imports: [ReferralsReciprocityScorecardComponent],
      providers: [{ provide: NavigationService, useValue: { OpenEntityRecord: vi.fn() } }],
    });
    const fixture = TestBed.createComponent(ReferralsReciprocityScorecardComponent);
    const cmp = fixture.componentInstance;
    await cmp.ngOnInit();
    fixture.detectChanges();

    expect(cmp.Rows.map((r) => r.ProfessionalProfileID)).toEqual(['p-high', 'p-low']);
    expect(cmp.Rows[0].AcceptanceRate).toBe(80);
    const host: HTMLElement = fixture.nativeElement;
    expect(host.textContent).toContain('High Giver');
    expect(host.textContent).toContain('80%');
    expect(host.querySelectorAll('.readiness-badge')).toHaveLength(2);
    fixture.destroy();
  });

  it('persists the selected quarter via UserInfoEngine.SetSetting and reloads on change', async () => {
    mockViews([snapshotFor(highProfile, 2.0)], [highProfile]);

    TestBed.configureTestingModule({
      imports: [ReferralsReciprocityScorecardComponent],
      providers: [{ provide: NavigationService, useValue: { OpenEntityRecord: vi.fn() } }],
    });
    const fixture = TestBed.createComponent(ReferralsReciprocityScorecardComponent);
    const cmp = fixture.componentInstance;
    await cmp.ngOnInit();

    const secondQuarterKey = cmp.GetQuarterKey(cmp.AvailableQuarters[1]);
    cmp.SelectedQuarterKey = secondQuarterKey;
    await cmp.OnQuarterChange();

    expect(settingsStore.get('Referrals.ReciprocityScorecard.Preferences')).toContain(secondQuarterKey);
    fixture.destroy();
  });

  it('Recompute calls ReciprocityScorecardService.RecomputeSnapshots for the selected period and refreshes', async () => {
    mockViews([snapshotFor(highProfile, 2.0)], [highProfile]);
    const recomputeSpy = vi.spyOn(ReciprocityScorecardService, 'RecomputeSnapshots').mockResolvedValue({
      ProcessedCount: 5,
      Period: { Start: new Date('2026-10-01T00:00:00.000Z'), End: new Date('2026-12-31T23:59:59.999Z') },
    });

    TestBed.configureTestingModule({
      imports: [ReferralsReciprocityScorecardComponent],
      providers: [{ provide: NavigationService, useValue: { OpenEntityRecord: vi.fn() } }],
    });
    const fixture = TestBed.createComponent(ReferralsReciprocityScorecardComponent);
    const cmp = fixture.componentInstance;
    await cmp.ngOnInit();

    expect(cmp.IsRecomputing).toBe(false);
    await cmp.Recompute();
    expect(recomputeSpy).toHaveBeenCalledWith(mockCurrentUser, undefined, expect.objectContaining({ Start: expect.any(Date), End: expect.any(Date) }));
    expect(cmp.IsRecomputing).toBe(false);
    expect(cmp.RecomputeSummary).toContain('Recomputed 5');
    fixture.destroy();
  });
});
