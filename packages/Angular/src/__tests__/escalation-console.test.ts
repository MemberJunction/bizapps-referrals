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

const mockAdminUser = {
  ID: '50000000-0000-4000-8000-000000000099',
  Name: 'Admin User',
  UserRoles: [{ Role: 'Association Admin' }],
};

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
        return mockAdminUser;
      }
    },
    RunView: class {
      RunView = runViewMock;
      RunViews = runViewsMock;
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

import { ReferralsEscalationConsoleComponent } from '../lib/components/escalation-console.component.js';
import { NavigationService } from '@memberjunction/ng-shared';
import {
  CascadeRoutingService,
  RecommendEscalationOperationBase,
  SlaEscalationService,
} from '@mj-biz-apps/referrals-core';
import type { ReferralEscalationEntity, ReferralRequestEntity } from '@mj-biz-apps/referrals-entities';

describe('ReferralsEscalationConsoleComponent (Wave 3 Slice 4, AC-37/AC-38)', () => {
  beforeAll(() => {
    TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
  });

  beforeEach(() => {
    TestBed.resetTestingModule();
    runViewMock.mockReset();
    runViewsMock.mockReset();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function escalationFixture(overrides: Partial<ReferralEscalationEntity> = {}): ReferralEscalationEntity {
    return {
      ID: 'e-1',
      ReferralRequestID: 'req-1',
      ReferralAssignmentID: null,
      EscalationLevel: 1,
      TriggerType: 'CascadeExhausted',
      Status: 'Open',
      RecommendedAction: 'ExpandPracticeArea',
      Notes: null,
      RaisedAt: new Date('2026-11-10T00:00:00.000Z'),
      AcknowledgedAt: null,
      ResolvedAt: null,
      DedupKey: null,
      LinkedTaskID: null,
      AcknowledgedByPersonID: null,
      ResolvedByPersonID: null,
      ResolutionNotes: null,
      AIRationaleJSON: null,
      ...overrides,
    } as ReferralEscalationEntity;
  }

  function mockRefreshViews(escalations: ReferralEscalationEntity[], request: Partial<ReferralRequestEntity>): void {
    runViewsMock.mockImplementation(async (queries: Array<{ EntityName: string }>) => {
      if (queries[0]?.EntityName === 'MJ_BizApps_Referrals: Referral Requests') {
        return [{ Success: true, Results: [request] }];
      }
      return [
        { Success: true, Results: escalations },
        { Success: true, Results: [] },
        { Success: true, Results: [] },
      ];
    });
  }

  it('renders open escalations grouped by level with KPI tiles and a linked-task chip', async () => {
    const esc = escalationFixture({ LinkedTaskID: 'task-1' });
    mockRefreshViews([esc], { ID: 'req-1', RequestNumber: 'REF-1', MatterTitle: 'M&A Deal', SeekerName: 'Alex Morgan' } as ReferralRequestEntity);

    TestBed.configureTestingModule({
      imports: [ReferralsEscalationConsoleComponent],
      providers: [{ provide: NavigationService, useValue: { OpenEntityRecord: vi.fn() } }],
    });
    const fixture = TestBed.createComponent(ReferralsEscalationConsoleComponent);
    const cmp = fixture.componentInstance;
    await cmp.ngOnInit();
    fixture.detectChanges();

    const host: HTMLElement = fixture.nativeElement;
    expect(host.textContent).toContain('Open Level 1');
    expect(host.textContent).toContain('REF-1');
    expect(host.querySelector('[aria-label*="Open linked task"]')).not.toBeNull();
    fixture.destroy();
  });

  it('Acknowledge/Resolve/Dismiss call SlaEscalationService and refresh the list', async () => {
    const esc = escalationFixture();
    mockRefreshViews([esc], { ID: 'req-1', RequestNumber: 'REF-1' } as ReferralRequestEntity);
    const ackSpy = vi.spyOn(SlaEscalationService, 'AcknowledgeEscalation').mockResolvedValue({
      ReferralEscalationID: esc.ID,
      Status: 'Acknowledged',
      RequestEscalationLevelReset: false,
    });
    const resolveSpy = vi.spyOn(SlaEscalationService, 'ResolveEscalation').mockResolvedValue({
      ReferralEscalationID: esc.ID,
      Status: 'Resolved',
      RequestEscalationLevelReset: true,
    });
    const dismissSpy = vi.spyOn(SlaEscalationService, 'DismissEscalation').mockResolvedValue({
      ReferralEscalationID: esc.ID,
      Status: 'Dismissed',
      RequestEscalationLevelReset: false,
    });

    TestBed.configureTestingModule({
      imports: [ReferralsEscalationConsoleComponent],
      providers: [{ provide: NavigationService, useValue: { OpenEntityRecord: vi.fn() } }],
    });
    const fixture = TestBed.createComponent(ReferralsEscalationConsoleComponent);
    const cmp = fixture.componentInstance;
    await cmp.ngOnInit();

    await cmp.Acknowledge(esc);
    expect(ackSpy).toHaveBeenCalledWith(esc.ID, mockAdminUser, undefined, undefined);

    cmp.NotesDraft[esc.ID] = 'Resolved via phone follow-up.';
    await cmp.Resolve(esc);
    expect(resolveSpy).toHaveBeenCalledWith(esc.ID, mockAdminUser, undefined, 'Resolved via phone follow-up.');

    await cmp.Dismiss(esc);
    expect(dismissSpy).toHaveBeenCalled();
    fixture.destroy();
  });

  it('Reopen passes the ExpandToAncestorPracticeArea toggle to CascadeRoutingService for admin users', async () => {
    const esc = escalationFixture({ TriggerType: 'CascadeExhausted' });
    mockRefreshViews([esc], { ID: 'req-1', RequestNumber: 'REF-1' } as ReferralRequestEntity);
    const reopenSpy = vi.spyOn(CascadeRoutingService, 'ReopenExhaustedRequest').mockResolvedValue({
      Reopened: true,
      Status: 'Routed',
      ActiveAssignmentID: 'a-1',
      ActiveProfessionalID: 'p-1',
      SLADeadlineAt: new Date().toISOString(),
    });

    TestBed.configureTestingModule({
      imports: [ReferralsEscalationConsoleComponent],
      providers: [{ provide: NavigationService, useValue: { OpenEntityRecord: vi.fn() } }],
    });
    const fixture = TestBed.createComponent(ReferralsEscalationConsoleComponent);
    const cmp = fixture.componentInstance;
    await cmp.ngOnInit();
    expect(cmp.CurrentUserIsAdmin).toBe(true);

    cmp.ExpandToAncestor[esc.ID] = true;
    await cmp.Reopen(esc);
    expect(reopenSpy).toHaveBeenCalledWith(esc.ReferralRequestID, mockAdminUser, { ExpandToAncestorPracticeArea: true }, undefined);
    fixture.destroy();
  });

  it('Ask AI Advisor surfaces RecommendedAction and the AI/Rules Source label', async () => {
    const esc = escalationFixture();
    mockRefreshViews([esc], { ID: 'req-1', RequestNumber: 'REF-1' } as ReferralRequestEntity);
    vi.spyOn(RecommendEscalationOperationBase.prototype, 'Execute').mockResolvedValue({
      Success: true,
      Output: {
        ReferralEscalationID: esc.ID,
        RecommendedAction: 'ReassignNextCandidate',
        Source: 'AI',
        Summary: 'Escalate to the senior tier; capacity is exhausted in this practice area.',
        Rationale: 'No eligible professionals remain after 3 cascade attempts.',
        GeneratedAt: new Date().toISOString(),
        Skipped: false,
      },
    });

    TestBed.configureTestingModule({
      imports: [ReferralsEscalationConsoleComponent],
      providers: [{ provide: NavigationService, useValue: { OpenEntityRecord: vi.fn() } }],
    });
    const fixture = TestBed.createComponent(ReferralsEscalationConsoleComponent);
    const cmp = fixture.componentInstance;
    await cmp.ngOnInit();

    await cmp.AskAdvisor(esc.ID);
    fixture.detectChanges();

    expect(cmp.AdvisorResult[esc.ID]?.Source).toBe('AI');
    const host: HTMLElement = fixture.nativeElement;
    expect(host.textContent).toContain('AI Advisor');
    expect(host.textContent).toContain('ReassignNextCandidate');
    fixture.destroy();
  });
});
