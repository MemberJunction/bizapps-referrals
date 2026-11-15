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

const mockCurrentUser = { ID: '50000000-0000-4000-8000-000000000060', Name: 'Test Pro' };
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
      NotifyLoadComplete(): void {}
    },
    NavigationService: class {
      OpenEntityRecord = vi.fn();
      OpenNavItemByName = vi.fn();
    },
  };
});

import { ReferralsProInboxComponent } from '../lib/components/pro-inbox.component.js';
import { ReferralsSeekerIntakeComponent } from '../lib/components/seeker-intake.component.js';
import { NavigationService } from '@memberjunction/ng-shared';
import { CapacityReadinessService, CascadeRoutingService, MatchingEngine } from '@mj-biz-apps/referrals-core';

describe('Wave 3 Slice 4 Pro Inbox (AC-40) & Seeker Intake (AC-41) enhancements', () => {
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

  describe('ReferralsProInboxComponent', () => {
    const profileId = '40000000-0000-4000-8000-000000000050';
    const assignmentId = '70000000-0000-4000-8000-000000000050';
    const requestId = '60000000-0000-4000-8000-000000000050';

    function mockInboxViews(): void {
      runViewMock.mockImplementation(async (params: { EntityName: string }) => {
        if (params.EntityName === 'MJ_BizApps_Referrals: Professional Profiles') {
          return {
            Success: true,
            Results: [
              {
                ID: profileId,
                UserID: mockCurrentUser.ID,
                AvailabilityStatus: 'Available',
                ReadinessScore: 75,
                ActiveReferralCount: 1,
                MaxConcurrentReferrals: 5,
                Save: vi.fn().mockResolvedValue(true),
              },
            ],
          };
        }
        return {
          Success: true,
          Results: [
            {
              ID: assignmentId,
              ReferralRequestID: requestId,
              ProfessionalProfileID: profileId,
              CascadeOrder: 1,
              Status: 'Accepted',
              MatchScore: 92,
              ConflictStatus: 'Cleared',
              SLADeadlineAt: new Date(Date.now() + 60 * 60_000),
            },
          ],
        };
      });
      runViewsMock.mockResolvedValue([
        { Success: true, Results: [{ ID: requestId, RequestNumber: 'REF-50', MatterTitle: 'Trademark Filing' }] },
        { Success: true, Results: [] },
      ]);
    }

    it('rejects an Availability window where EndsAt <= StartsAt', async () => {
      mockInboxViews();
      TestBed.configureTestingModule({
        imports: [ReferralsProInboxComponent],
        providers: [{ provide: NavigationService, useValue: { OpenEntityRecord: vi.fn(), OpenNavItemByName: vi.fn() } }],
      });
      const fixture = TestBed.createComponent(ReferralsProInboxComponent);
      const cmp = fixture.componentInstance;
      await cmp.ngOnInit();

      cmp.AvailabilityStartsAt = '2026-12-10';
      cmp.AvailabilityEndsAt = '2026-12-05';
      await cmp.SaveAvailabilityWindow();

      expect(cmp.AvailabilityError).toBe('End date must be after the start date.');
      fixture.destroy();
    });

    it('accepts a valid Availability window and calls CapacityReadinessService.SetAvailabilityWindow', async () => {
      mockInboxViews();
      const setAvailSpy = vi.spyOn(CapacityReadinessService, 'SetAvailabilityWindow').mockResolvedValue({
        ProfessionalAvailabilityWindowID: 'w-1',
      } as never);

      TestBed.configureTestingModule({
        imports: [ReferralsProInboxComponent],
        providers: [{ provide: NavigationService, useValue: { OpenEntityRecord: vi.fn(), OpenNavItemByName: vi.fn() } }],
      });
      const fixture = TestBed.createComponent(ReferralsProInboxComponent);
      const cmp = fixture.componentInstance;
      await cmp.ngOnInit();

      cmp.AvailabilityStartsAt = '2026-12-01';
      cmp.AvailabilityEndsAt = '2026-12-10';
      await cmp.SaveAvailabilityWindow();

      expect(cmp.AvailabilityError).toBe('');
      expect(setAvailSpy).toHaveBeenCalledWith(
        expect.objectContaining({ ProfessionalProfileID: profileId, IsAvailable: false }),
        mockCurrentUser,
      );
      fixture.destroy();
    });

    it('Complete & Report Outcome passes FeeAmount through to CascadeRoutingService.CompleteReferral', async () => {
      mockInboxViews();
      const completeSpy = vi.spyOn(CascadeRoutingService, 'CompleteReferral').mockResolvedValue({
        RequestStatus: 'Completed',
      } as never);

      TestBed.configureTestingModule({
        imports: [ReferralsProInboxComponent],
        providers: [{ provide: NavigationService, useValue: { OpenEntityRecord: vi.fn(), OpenNavItemByName: vi.fn() } }],
      });
      const fixture = TestBed.createComponent(ReferralsProInboxComponent);
      const cmp = fixture.componentInstance;
      await cmp.ngOnInit();

      cmp.CompletionOutcomeStatus = 'Completed';
      cmp.CompletionFeeAmount = 2500;
      cmp.CompletionNotes = 'Matter closed successfully.';
      await cmp.CompleteAndReportOutcome();

      expect(completeSpy).toHaveBeenCalledWith(
        expect.objectContaining({ ReferralAssignmentID: assignmentId, OutcomeStatus: 'Completed', FeeAmount: 2500 }),
        mockCurrentUser,
      );
      fixture.destroy();
    });

    it('Mark In Progress calls CascadeRoutingService.MarkInProgress for the selected assignment', async () => {
      mockInboxViews();
      const markSpy = vi.spyOn(CascadeRoutingService, 'MarkInProgress').mockResolvedValue({
        AssignmentStatus: 'InProgress',
        RequestStatus: 'InProgress',
      } as never);

      TestBed.configureTestingModule({
        imports: [ReferralsProInboxComponent],
        providers: [{ provide: NavigationService, useValue: { OpenEntityRecord: vi.fn(), OpenNavItemByName: vi.fn() } }],
      });
      const fixture = TestBed.createComponent(ReferralsProInboxComponent);
      const cmp = fixture.componentInstance;
      await cmp.ngOnInit();

      await cmp.MarkInProgress();
      expect(markSpy).toHaveBeenCalledWith(assignmentId, mockCurrentUser);
      fixture.destroy();
    });
  });

  describe('ReferralsSeekerIntakeComponent', () => {
    function mockIntakeViews(): void {
      runViewsMock.mockResolvedValue([
        { Success: true, Results: [{ ID: '10000000-0000-4000-8000-000000000001', Name: 'Corporate M&A' }] },
        { Success: true, Results: [{ ID: '20000000-0000-4000-8000-000000000001', Name: 'Delaware' }] },
        {
          Success: true,
          Results: [{ ID: '30000000-0000-4000-8000-000000000001', Name: 'Priority', SLAResponseHours: 8, UrgentSLAMultiplier: 0.5 }],
        },
      ]);
      runViewMock.mockResolvedValue({ Success: true, Results: [] });
    }

    it('computes an urgency-aware SLA preview using tier SLAResponseHours x UrgentSLAMultiplier', async () => {
      mockIntakeViews();
      TestBed.configureTestingModule({
        imports: [ReferralsSeekerIntakeComponent],
        providers: [{ provide: NavigationService, useValue: { OpenEntityRecord: vi.fn() } }],
      });
      const fixture = TestBed.createComponent(ReferralsSeekerIntakeComponent);
      const cmp = fixture.componentInstance;
      await cmp.ngOnInit();

      cmp.SelectedTierID = '30000000-0000-4000-8000-000000000001';
      cmp.UrgencyLevel = 'Urgent';
      expect(cmp.SlaPreviewText).toBe('Expected first response within ~4h');

      cmp.UrgencyLevel = 'Standard';
      expect(cmp.SlaPreviewText).toBe('Expected first response within ~8h');
      fixture.destroy();
    });

    it('populates CandidateReadinessMap from a batch ProfessionalProfile lookup after RunMatchPreview', async () => {
      mockIntakeViews();
      const proId = '40000000-0000-4000-8000-000000000001';
      vi.spyOn(MatchingEngine, 'FindMatches').mockResolvedValue([
        {
          ProfessionalProfileID: proId,
          DisplayName: 'Jane Counsel',
          FirmName: null,
          Email: 'jane@firm.com',
          VerificationStatus: 'Verified',
          AvailabilityStatus: 'Available',
          ActiveReferralCount: 0,
          MaxConcurrentReferrals: 5,
          Score: 88,
          Breakdown: { PracticeAreaScore: 0, JurisdictionScore: 0, CapacityScore: 0, ResponsivenessScore: 0, RatingScore: 0, LanguageBonus: 0, TotalScore: 88 },
          ConflictStatus: 'Cleared',
          ConflictReasons: [],
          Eligible: true,
          DisqualificationReason: null,
          ExplainableMatchReasons: ['Strong practice-area match', 'Available capacity'],
          MatchSummary: 'Top-ranked eligible candidate.',
        },
      ]);
      runViewMock.mockResolvedValue({ Success: true, Results: [{ ID: proId, ReadinessScore: 82 }] });

      TestBed.configureTestingModule({
        imports: [ReferralsSeekerIntakeComponent],
        providers: [{ provide: NavigationService, useValue: { OpenEntityRecord: vi.fn() } }],
      });
      const fixture = TestBed.createComponent(ReferralsSeekerIntakeComponent);
      const cmp = fixture.componentInstance;
      await cmp.ngOnInit();
      fixture.detectChanges();

      cmp.Prefs.PracticeAreaID = '10000000-0000-4000-8000-000000000001';
      cmp.Prefs.JurisdictionID = '20000000-0000-4000-8000-000000000001';
      await cmp.RunMatchPreview();
      fixture.detectChanges();

      expect(cmp.CandidateReadinessMap[proId]).toBe(82);
      const host: HTMLElement = fixture.nativeElement;
      expect(host.textContent).toContain('Readiness 82');

      // AC-41: "Explain this match" toggles the client-side rationale panel.
      cmp.ToggleExplainMatch(proId);
      fixture.detectChanges();
      expect(host.textContent).toContain('Source: Deterministic');
      expect(host.textContent).toContain('Strong practice-area match');
      fixture.destroy();
    });

    it('filters the seeker feedback assignment list to the current SeekerEmail and resolves DisplayName', async () => {
      mockIntakeViews();
      const proId = '40000000-0000-4000-8000-000000000002';
      const requestId = '60000000-0000-4000-8000-000000000070';
      const assignmentId = '70000000-0000-4000-8000-000000000070';

      runViewMock.mockImplementation(async (params: { EntityName: string }) => {
        if (params.EntityName === 'MJ_BizApps_Referrals: Referral Requests') {
          return { Success: true, Results: [{ ID: requestId, SeekerEmail: 'alex@company.com' }] };
        }
        if (params.EntityName === 'MJ_BizApps_Referrals: Referral Assignments') {
          return { Success: true, Results: [{ ID: assignmentId, ProfessionalProfileID: proId, Status: 'Accepted' }] };
        }
        if (params.EntityName === 'MJ_BizApps_Referrals: Professional Profiles') {
          return { Success: true, Results: [{ ID: proId, DisplayName: 'Jane Counsel' }] };
        }
        return { Success: true, Results: [] };
      });

      TestBed.configureTestingModule({
        imports: [ReferralsSeekerIntakeComponent],
        providers: [{ provide: NavigationService, useValue: { OpenEntityRecord: vi.fn() } }],
      });
      const fixture = TestBed.createComponent(ReferralsSeekerIntakeComponent);
      const cmp = fixture.componentInstance;
      await cmp.ngOnInit();

      cmp.SeekerEmail = 'alex@company.com';
      await cmp.OnSeekerEmailChange();
      fixture.detectChanges();

      expect(cmp.FeedbackAssignments).toHaveLength(1);
      expect(cmp.AssignmentProfessionalNames[assignmentId]).toBe('Jane Counsel');
      const host: HTMLElement = fixture.nativeElement;
      expect(host.textContent).toContain('Jane Counsel');
      expect(host.textContent).not.toContain(proId);
      fixture.destroy();
    });
  });
});
