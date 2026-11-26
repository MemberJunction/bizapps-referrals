import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CompositeKey, IMetadataProvider, IRunViewProvider, Metadata, RunView, UserInfo } from '@memberjunction/core';
import { ResourceData } from '@memberjunction/core-entities';
import { RegisterClass } from '@memberjunction/global';
import { BaseResourceComponent, NavigationService } from '@memberjunction/ng-shared';
import {
  MJButtonDirective,
  MJPageBodyComponent,
  MJPageHeaderComponent,
  MJPageLayoutComponent,
} from '@memberjunction/ng-ui-components';
import {
  CascadeRoutingService,
  EscalationTransitionResult,
  IsAssociationAdmin,
  RecommendEscalationOperationBase,
  ReferralTelemetry,
  SlaEscalationService,
} from '@mj-biz-apps/referrals-core';
import { ReferralAssignmentEntity, ReferralEscalationEntity, ReferralRequestEntity } from '@mj-biz-apps/referrals-entities';

interface PersistedEscalationRationale {
  Source: string;
  Summary: string;
  Rationale: string;
  GeneratedAt: string;
}

interface EscalationLevelGroup {
  Level: number;
  Items: ReferralEscalationEntity[];
}

function parseRationale(raw: string | null): PersistedEscalationRationale | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<PersistedEscalationRationale>;
    if (!parsed.Summary || !parsed.Rationale || !parsed.Source) return null;
    return {
      Source: parsed.Source,
      Summary: parsed.Summary,
      Rationale: parsed.Rationale,
      GeneratedAt: parsed.GeneratedAt ?? '',
    };
  } catch {
    return null;
  }
}

/**
 * Tab 6: Escalation Console — Open escalations grouped by level, with Acknowledge / Resolve /
 * Dismiss / Reopen actions and an AI escalation advisor.
 */
@RegisterClass(BaseResourceComponent, 'ReferralsEscalationConsoleResource')
@Component({
  standalone: true,
  selector: 'mj-referrals-escalation-console',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    MJButtonDirective,
    MJPageLayoutComponent,
    MJPageHeaderComponent,
    MJPageBodyComponent,
  ],
  template: `
    <mj-page-layout>
      <mj-page-header Title="Escalation Console" Icon="fa-solid fa-triangle-exclamation">
        <div class="console-toolbar" actions>
          <button type="button" mjButton Variant="outline" Size="sm" (click)="Refresh()" [disabled]="IsLoading">
            {{ IsLoading ? 'Loading...' : 'Refresh' }}
          </button>
        </div>
      </mj-page-header>
      <mj-page-body>
        <div class="console-container">
          <div class="kpi-grid">
            @for (group of LevelGroups; track group.Level) {
              <div class="kpi-card">
                <span class="kpi-label">Open Level {{ group.Level }}</span>
                <strong class="kpi-value">{{ group.Items.length }}</strong>
              </div>
            }
            <div class="kpi-card">
              <span class="kpi-label">SLA Breaches (7 Days)</span>
              <strong class="kpi-value">{{ BreachesLast7Days }}</strong>
            </div>
            <div class="kpi-card">
              <span class="kpi-label">Exhausted Requests</span>
              <strong class="kpi-value">{{ ExhaustedRequestCount }}</strong>
            </div>
          </div>

          @for (group of LevelGroups; track group.Level) {
            <section class="level-group">
              <h3>Level {{ group.Level }} ({{ group.Items.length }})</h3>
              @for (esc of group.Items; track esc.ID) {
                <div class="escalation-card">
                  <div class="escalation-top">
                    <div class="escalation-title">
                      <strong>{{ RequestsById[esc.ReferralRequestID]?.RequestNumber ?? esc.ReferralRequestID }}</strong>
                      <span class="trigger-badge" [attr.data-trigger]="esc.TriggerType">{{ esc.TriggerType }}</span>
                    </div>
                    <span class="countdown-chip">{{ GetCountdownText(esc) }}</span>
                  </div>
                  <div class="escalation-meta">
                    {{ RequestsById[esc.ReferralRequestID]?.MatterTitle }} — {{ RequestsById[esc.ReferralRequestID]?.SeekerName }}
                  </div>
                  @if (esc.Notes) {
                    <p class="escalation-notes">{{ esc.Notes }}</p>
                  }
                  @if (esc.LinkedTaskID) {
                    <button
                      type="button"
                      mjButton
                      Variant="flat"
                      Size="sm"
                      [AriaLabel]="'Open linked task for escalation ' + esc.ID"
                      (click)="OpenLinkedTask(esc.LinkedTaskID)"
                    >
                      Linked Task ↗
                    </button>
                  }

                  <div class="advisor-box">
                    @if (GetDisplayedRationale(esc); as rationale) {
                      <div class="advisor-result">
                        <span class="advisor-source" [attr.data-source]="rationale.Source">
                          {{ rationale.Source === 'AI' ? 'AI Advisor' : 'Rules Advisor' }}
                        </span>
                        <strong class="advisor-action">{{ esc.RecommendedAction }}</strong>
                        <p class="advisor-summary">{{ rationale.Summary }}</p>
                      </div>
                    }
                    <button
                      type="button"
                      mjButton
                      Variant="outline"
                      Size="sm"
                      [disabled]="IsAdvisorBusyId === esc.ID"
                      (click)="AskAdvisor(esc.ID)"
                    >
                      {{ IsAdvisorBusyId === esc.ID ? 'Asking Advisor...' : 'Ask AI Advisor' }}
                    </button>
                    @if (AdvisorError[esc.ID]) {
                      <p class="action-banner" data-tone="error">{{ AdvisorError[esc.ID] }}</p>
                    }
                  </div>

                  <label class="field full-width">
                    <span>Notes</span>
                    <textarea rows="2" [(ngModel)]="NotesDraft[esc.ID]" placeholder="Add resolution or acknowledgement notes..."></textarea>
                  </label>

                  <div class="escalation-actions">
                    <button
                      type="button"
                      mjButton
                      Variant="secondary"
                      Size="sm"
                      [disabled]="IsBusyId === esc.ID || esc.Status !== 'Open'"
                      (click)="Acknowledge(esc)"
                    >
                      Acknowledge
                    </button>
                    <button
                      type="button"
                      mjButton
                      Variant="success"
                      Size="sm"
                      [disabled]="IsBusyId === esc.ID || !(NotesDraft[esc.ID] || '').trim()"
                      (click)="Resolve(esc)"
                    >
                      Resolve
                    </button>
                    <button
                      type="button"
                      mjButton
                      Variant="danger"
                      Size="sm"
                      [disabled]="IsBusyId === esc.ID"
                      (click)="Dismiss(esc)"
                    >
                      Dismiss
                    </button>
                  </div>

                  @if (esc.TriggerType === 'CascadeExhausted' && CurrentUserIsAdmin) {
                    <div class="reopen-box">
                      <label class="checkbox-row">
                        <input type="checkbox" [(ngModel)]="ExpandToAncestor[esc.ID]" />
                        <span>Expand to parent practice area</span>
                      </label>
                      <button
                        type="button"
                        mjButton
                        Variant="primary"
                        Size="sm"
                        [disabled]="IsBusyId === esc.ID"
                        (click)="Reopen(esc)"
                      >
                        Reopen Exhausted Request
                      </button>
                    </div>
                  }
                  @if (ActionError[esc.ID]) {
                    <p class="action-banner" data-tone="error">{{ ActionError[esc.ID] }}</p>
                  }
                </div>
              }
            </section>
          }

          @if (LevelGroups.length === 0 && !IsLoading) {
            <p class="empty-hint">No open or acknowledged escalations. The queue is clear.</p>
          }
        </div>
      </mj-page-body>
    </mj-page-layout>
  `,
  styles: [`
    .console-toolbar { display: flex; gap: 0.5rem; align-items: center; }
    .console-container { padding: 1.25rem; max-width: 1100px; margin: 0 auto; display: flex; flex-direction: column; gap: 1.25rem; }
    .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 0.75rem; }
    .kpi-card {
      background: var(--mj-bg-surface-card, var(--mj-bg-surface));
      border: 1px solid var(--mj-border-default);
      border-radius: var(--mj-radius-md, 8px);
      padding: 0.85rem 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .kpi-label { font-size: 0.72rem; color: var(--mj-text-secondary); text-transform: uppercase; letter-spacing: 0.04em; }
    .kpi-value { font-size: 1.5rem; font-weight: 700; color: var(--mj-text-primary); }
    .level-group { display: flex; flex-direction: column; gap: 0.75rem; }
    .level-group h3 { margin: 0; font-size: 1rem; color: var(--mj-text-primary); }
    .escalation-card {
      background: var(--mj-bg-surface-card, var(--mj-bg-surface));
      border: 1px solid var(--mj-border-default);
      border-radius: var(--mj-radius-md, 8px);
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
    }
    .escalation-top { display: flex; justify-content: space-between; align-items: center; gap: 0.75rem; }
    .escalation-title { display: flex; align-items: center; gap: 0.5rem; }
    .trigger-badge {
      font-size: 0.68rem;
      font-weight: 700;
      text-transform: uppercase;
      padding: 0.1rem 0.45rem;
      border-radius: 999px;
      background: var(--mj-status-warning-bg);
      color: var(--mj-status-warning-text);
    }
    .countdown-chip { font-size: 0.78rem; font-weight: 600; color: var(--mj-status-info-text); background: var(--mj-status-info-bg); padding: 0.15rem 0.55rem; border-radius: 999px; }
    .escalation-meta { font-size: 0.82rem; color: var(--mj-text-secondary); }
    .escalation-notes { margin: 0; font-size: 0.82rem; color: var(--mj-text-primary); }
    .advisor-box { display: flex; flex-direction: column; gap: 0.4rem; padding: 0.6rem; border-radius: var(--mj-radius-sm, 6px); background: var(--mj-bg-surface); border: 1px solid var(--mj-border-default); }
    .advisor-result { display: flex; flex-direction: column; gap: 0.2rem; }
    .advisor-source { font-size: 0.68rem; font-weight: 700; text-transform: uppercase; color: var(--mj-text-secondary); }
    .advisor-source[data-source="AI"] { color: var(--mj-brand-primary); }
    .advisor-action { font-size: 0.88rem; color: var(--mj-text-primary); }
    .advisor-summary { margin: 0; font-size: 0.8rem; color: var(--mj-text-secondary); }
    .field { display: flex; flex-direction: column; gap: 0.3rem; font-size: 0.82rem; color: var(--mj-text-secondary); }
    .field textarea {
      background: var(--mj-bg-surface);
      border: 1px solid var(--mj-border-default);
      border-radius: var(--mj-radius-sm, 6px);
      padding: 0.5rem 0.65rem;
      color: var(--mj-text-primary);
      font-size: 0.85rem;
    }
    .escalation-actions { display: flex; gap: 0.5rem; }
    .reopen-box { display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; padding-top: 0.4rem; border-top: 1px solid var(--mj-border-default); }
    .checkbox-row { display: flex; align-items: center; gap: 0.4rem; font-size: 0.82rem; color: var(--mj-text-secondary); }
    .action-banner { margin: 0; font-size: 0.8rem; padding: 0.4rem 0.6rem; border-radius: var(--mj-radius-sm, 6px); }
    .action-banner[data-tone="error"] { background: var(--mj-status-error-bg); color: var(--mj-status-error-text); }
    .empty-hint { color: var(--mj-text-secondary); font-size: 0.9rem; text-align: center; padding: 2rem 0; }
  `],
})
export class ReferralsEscalationConsoleComponent extends BaseResourceComponent implements OnInit, OnDestroy {
  private readonly cdr = inject(ChangeDetectorRef);
  protected readonly navService = inject(NavigationService);
  private countdownTimerId: ReturnType<typeof setInterval> | null = null;

  public Escalations: ReferralEscalationEntity[] = [];
  public RequestsById: Record<string, ReferralRequestEntity> = {};
  public AssignmentsById: Record<string, ReferralAssignmentEntity> = {};
  public LevelGroups: EscalationLevelGroup[] = [];
  public BreachesLast7Days = 0;
  public ExhaustedRequestCount = 0;
  public IsLoading = false;
  public IsBusyId: string | null = null;
  public IsAdvisorBusyId: string | null = null;
  public NotesDraft: Record<string, string> = {};
  public ExpandToAncestor: Record<string, boolean> = {};
  public ActionError: Record<string, string> = {};
  public AdvisorError: Record<string, string> = {};
  public AdvisorResult: Record<string, PersistedEscalationRationale> = {};
  public CurrentUserIsAdmin = false;

  async ngOnInit(): Promise<void> {
    super.ngOnInit();
    queueMicrotask(() => this.NotifyLoadStarted());
    const md = new Metadata();
    this.CurrentUserIsAdmin = IsAssociationAdmin(md.CurrentUser);
    await this.Refresh();
    ReferralTelemetry.RecordOperation({
      Operation: 'EscalationConsoleView',
      Route: 'app/Referrals/escalation-console',
      ElapsedMs: 1,
    });
    this.countdownTimerId = setInterval(() => this.cdr.markForCheck(), 30000);
    this.NotifyLoadComplete();
    this.cdr.markForCheck();
  }

  ngOnDestroy(): void {
    if (this.countdownTimerId != null) {
      clearInterval(this.countdownTimerId);
      this.countdownTimerId = null;
    }
  }

  public async Refresh(): Promise<void> {
    this.IsLoading = true;
    this.cdr.markForCheck();
    try {
      const md = new Metadata();
      const rv =
        Metadata.Provider && typeof RunView.FromMetadataProvider === 'function'
          ? RunView.FromMetadataProvider(Metadata.Provider)
          : new RunView();
      const results = await rv.RunViews(
        [
          {
            EntityName: 'MJ_BizApps_Referrals: Referral Escalations',
            ExtraFilter: "Status = 'Open' OR Status = 'Acknowledged'",
            OrderBy: 'EscalationLevel DESC, RaisedAt ASC',
            ResultType: 'simple',
          },
          {
            EntityName: 'MJ_BizApps_Referrals: Referral Escalations',
            ExtraFilter: "TriggerType = 'SLABreach'",
            ResultType: 'simple',
          },
          {
            EntityName: 'MJ_BizApps_Referrals: Referral Requests',
            ExtraFilter: "Status = 'Exhausted'",
            ResultType: 'simple',
          },
        ],
        md.CurrentUser,
      );

      this.Escalations = results[0]?.Success ? (results[0].Results as ReferralEscalationEntity[]) : [];

      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      const breaches = results[1]?.Success ? (results[1].Results as ReferralEscalationEntity[]) : [];
      this.BreachesLast7Days = breaches.filter((b) => new Date(b.RaisedAt).getTime() >= sevenDaysAgo).length;

      this.ExhaustedRequestCount = results[2]?.Success ? results[2].Results.length : 0;

      await this.LoadRelatedRecords(md);
      this.BuildLevelGroups();
      this.HydrateAdvisorResultsFromRationale();
    } finally {
      this.IsLoading = false;
      this.cdr.markForCheck();
    }
  }

  private async LoadRelatedRecords(md: Metadata): Promise<void> {
    this.RequestsById = {};
    this.AssignmentsById = {};
    if (this.Escalations.length === 0) {
      return;
    }
    const rv =
      Metadata.Provider && typeof RunView.FromMetadataProvider === 'function'
        ? RunView.FromMetadataProvider(Metadata.Provider)
        : new RunView();
    const requestIds = [...new Set(this.Escalations.map((e) => `'${e.ReferralRequestID}'`))];
    const assignmentIds = [...new Set(this.Escalations.filter((e) => e.ReferralAssignmentID).map((e) => `'${e.ReferralAssignmentID}'`))];

    const queries = [
      { EntityName: 'MJ_BizApps_Referrals: Referral Requests', ExtraFilter: `ID IN (${requestIds.join(', ')})`, ResultType: 'simple' as const },
    ];
    if (assignmentIds.length > 0) {
      queries.push({
        EntityName: 'MJ_BizApps_Referrals: Referral Assignments',
        ExtraFilter: `ID IN (${assignmentIds.join(', ')})`,
        ResultType: 'simple' as const,
      });
    }

    const results = await rv.RunViews(queries, md.CurrentUser);
    if (results[0]?.Success) {
      for (const req of results[0].Results as ReferralRequestEntity[]) {
        this.RequestsById[req.ID] = req;
      }
    }
    if (assignmentIds.length > 0 && results[1]?.Success) {
      for (const a of results[1].Results as ReferralAssignmentEntity[]) {
        this.AssignmentsById[a.ID] = a;
      }
    }
  }

  private BuildLevelGroups(): void {
    const byLevel = new Map<number, ReferralEscalationEntity[]>();
    for (const esc of this.Escalations) {
      const list = byLevel.get(esc.EscalationLevel) ?? [];
      list.push(esc);
      byLevel.set(esc.EscalationLevel, list);
    }
    this.LevelGroups = [...byLevel.entries()]
      .sort((a, b) => b[0] - a[0])
      .map(([level, items]) => ({ Level: level, Items: items }));
  }

  private HydrateAdvisorResultsFromRationale(): void {
    this.AdvisorResult = {};
    for (const esc of this.Escalations) {
      const parsed = parseRationale(esc.AIRationaleJSON);
      if (parsed) {
        this.AdvisorResult[esc.ID] = parsed;
      }
    }
  }

  public GetDisplayedRationale(esc: ReferralEscalationEntity): PersistedEscalationRationale | null {
    return this.AdvisorResult[esc.ID] ?? null;
  }

  public GetCountdownText(esc: ReferralEscalationEntity): string {
    const assignment = esc.ReferralAssignmentID ? this.AssignmentsById[esc.ReferralAssignmentID] : undefined;
    const now = Date.now();
    if (assignment?.SLADeadlineAt) {
      const deadlineMs = new Date(assignment.SLADeadlineAt).getTime();
      const diffMs = deadlineMs - now;
      const hours = Math.floor(Math.abs(diffMs) / (60 * 60 * 1000));
      const minutes = Math.floor((Math.abs(diffMs) % (60 * 60 * 1000)) / 60000);
      return diffMs >= 0 ? `SLA in ${hours}h ${minutes}m` : `SLA breached ${hours}h ${minutes}m ago`;
    }
    const triggeredMs = new Date(esc.RaisedAt).getTime();
    const elapsedMs = now - triggeredMs;
    const hours = Math.floor(elapsedMs / (60 * 60 * 1000));
    const minutes = Math.floor((elapsedMs % (60 * 60 * 1000)) / 60000);
    return `Triggered ${hours}h ${minutes}m ago`;
  }

  public async Acknowledge(esc: ReferralEscalationEntity): Promise<void> {
    await this.RunTransition(esc, (provider, user) =>
      SlaEscalationService.AcknowledgeEscalation(esc.ID, user, provider, this.NotesDraft[esc.ID]),
    );
  }

  public async Resolve(esc: ReferralEscalationEntity): Promise<void> {
    await this.RunTransition(esc, (provider, user) =>
      SlaEscalationService.ResolveEscalation(esc.ID, user, provider, this.NotesDraft[esc.ID]),
    );
  }

  public async Dismiss(esc: ReferralEscalationEntity): Promise<void> {
    await this.RunTransition(esc, (provider, user) =>
      SlaEscalationService.DismissEscalation(esc.ID, user, provider, this.NotesDraft[esc.ID]),
    );
  }

  private async RunTransition(
    esc: ReferralEscalationEntity,
    run: (provider: IMetadataProvider & IRunViewProvider, user: UserInfo) => Promise<EscalationTransitionResult>,
  ): Promise<void> {
    this.IsBusyId = esc.ID;
    delete this.ActionError[esc.ID];
    this.cdr.markForCheck();
    try {
      const md = new Metadata();
      const provider = Metadata.Provider as IMetadataProvider & IRunViewProvider;
      await run(provider, md.CurrentUser);
      await this.Refresh();
    } catch (err) {
      this.ActionError[esc.ID] = err instanceof Error ? err.message : 'Action failed.';
    } finally {
      this.IsBusyId = null;
      this.cdr.markForCheck();
    }
  }

  public async Reopen(esc: ReferralEscalationEntity): Promise<void> {
    this.IsBusyId = esc.ID;
    delete this.ActionError[esc.ID];
    this.cdr.markForCheck();
    try {
      const md = new Metadata();
      const provider = Metadata.Provider as IMetadataProvider & IRunViewProvider;
      await CascadeRoutingService.ReopenExhaustedRequest(
        esc.ReferralRequestID,
        md.CurrentUser,
        { ExpandToAncestorPracticeArea: !!this.ExpandToAncestor[esc.ID] },
        provider,
      );
      await this.Refresh();
    } catch (err) {
      this.ActionError[esc.ID] = err instanceof Error ? err.message : 'Reopen failed.';
    } finally {
      this.IsBusyId = null;
      this.cdr.markForCheck();
    }
  }

  public async AskAdvisor(escalationId: string): Promise<void> {
    this.IsAdvisorBusyId = escalationId;
    delete this.AdvisorError[escalationId];
    this.cdr.markForCheck();
    try {
      const op = new RecommendEscalationOperationBase();
      const result = await op.Execute({ ReferralEscalationID: escalationId });
      if (result.Success && result.Output) {
        this.AdvisorResult[escalationId] = {
          Source: result.Output.Source,
          Summary: result.Output.Summary,
          Rationale: result.Output.Rationale,
          GeneratedAt: result.Output.GeneratedAt,
        };
        const esc = this.Escalations.find((e) => e.ID === escalationId);
        if (esc) {
          esc.RecommendedAction = result.Output.RecommendedAction;
        }
      } else {
        this.AdvisorError[escalationId] = result.ErrorMessage ?? 'AI Advisor request failed.';
      }
    } catch (err) {
      this.AdvisorError[escalationId] = err instanceof Error ? err.message : 'AI Advisor request failed.';
    } finally {
      this.IsAdvisorBusyId = null;
      this.cdr.markForCheck();
    }
  }

  public OpenLinkedTask(taskId: string): void {
    this.navService.OpenEntityRecord('MJ: Tasks', CompositeKey.FromID(taskId));
  }

  async GetResourceDisplayName(_data: ResourceData): Promise<string> {
    return 'Escalation Console';
  }

  async GetResourceIconClass(_data: ResourceData): Promise<string> {
    return 'fa-solid fa-triangle-exclamation';
  }
}
