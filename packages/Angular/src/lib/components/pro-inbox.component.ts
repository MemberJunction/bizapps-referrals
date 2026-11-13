import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CompositeKey, Metadata, RunView } from '@memberjunction/core';
import { ResourceData } from '@memberjunction/core-entities';
import { RegisterClass } from '@memberjunction/global';
import { BaseResourceComponent, NavigationService } from '@memberjunction/ng-shared';
import {
  MJPageBodyComponent,
  MJPageHeaderComponent,
  MJPageLayoutComponent,
} from '@memberjunction/ng-ui-components';
import {
  AssignmentResponseAction,
  CascadeRoutingService,
  ReferralTelemetry,
} from '@mj-biz-apps/referrals-core';
import {
  ConflictCheckPartyEntity,
  ReferralAssignmentEntity,
  ReferralRequestEntity,
} from '@mj-biz-apps/referrals-entities';
import { ProInboxPreferences, ReferralsUiStateHelper } from '../services/referrals-ui-state.service.js';

/**
 * Tab 2: Member Pro Lead Inbox — Variant B Split Workbench.
 */
@RegisterClass(BaseResourceComponent, 'ReferralsProInboxResource')
@Component({
  standalone: true,
  selector: 'mj-referrals-pro-inbox',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    MJPageLayoutComponent,
    MJPageHeaderComponent,
    MJPageBodyComponent,
  ],
  template: `
    <mj-page-layout>
      <mj-page-header Title="Member Pro Lead Inbox" Icon="fa-solid fa-inbox">
        <div class="toolbar">
          <select [(ngModel)]="Prefs.StatusFilter" (ngModelChange)="OnFilterChange()">
            <option value="Offered">Pending SLA Offers</option>
            <option value="Accepted">Accepted Matters</option>
            <option value="All">All Assignments</option>
          </select>
          <button type="button" class="btn-outline" (click)="Refresh()">Refresh</button>
        </div>
      </mj-page-header>
      <mj-page-body>
        <div class="split-workbench">
          <aside class="lead-list">
            @for (a of Assignments; track a.ID) {
              <button
                type="button"
                class="lead-item"
                [class.selected]="SelectedAssignment?.ID === a.ID"
                (click)="SelectAssignment(a)"
              >
                <div class="lead-top">
                  <strong>Cascade #{{ a.CascadeOrder }}</strong>
                  <span class="status-pill" [attr.data-status]="a.Status">{{ a.Status }}</span>
                </div>
                <div class="lead-meta">Score: {{ a.MatchScore | number:'1.0-1' }} • Conflict: {{ a.ConflictStatus }}</div>
                @if (a.SLADeadlineAt) {
                  <div class="lead-sla">SLA Due: {{ a.SLADeadlineAt | date:'short' }}</div>
                }
              </button>
            } @empty {
              <div class="empty-state">No referral leads match the current filter.</div>
            }
          </aside>

          <section class="lead-detail">
            @if (SelectedAssignment; as active) {
              <div class="detail-header">
                <div>
                  <h3>{{ SelectedRequest?.MatterTitle || 'Referral Offer' }}</h3>
                  <div class="detail-sub">
                    Request {{ SelectedRequest?.RequestNumber }} • Seeker: {{ SelectedRequest?.SeekerName }}
                  </div>
                </div>
                @if (SelectedRequest) {
                  <button type="button" class="btn-outline" (click)="OpenRequestRecord(SelectedRequest.ID)">
                    Open Request ↗
                  </button>
                }
              </div>

              @if (ActionMessage) {
                <div class="action-banner">{{ ActionMessage }}</div>
              }

              <div class="detail-summary">
                <p>{{ SelectedRequest?.MatterSummary }}</p>
              </div>

              <div class="conflict-panel">
                <h4>Conflict Screening Parties ({{ ConflictParties.length }})</h4>
                @for (party of ConflictParties; track party.ID) {
                  <div class="party-row">
                    <span>{{ party.PartyName }}</span>
                    <span class="role-chip">{{ party.PartyRole }}</span>
                  </div>
                } @empty {
                  <div class="empty-state">No adverse or related parties listed.</div>
                }
              </div>

              @if (active.Status === 'Offered') {
                <div class="response-box">
                  <textarea rows="2" [(ngModel)]="ResponseNotes" placeholder="Optional response notes or conflict detail..."></textarea>
                  <div class="response-actions">
                    <button type="button" class="btn-accept" (click)="Respond('Accept')" [disabled]="IsActing">Accept Lead</button>
                    <button type="button" class="btn-decline" (click)="Respond('Decline')" [disabled]="IsActing">Decline</button>
                    <button type="button" class="btn-conflict" (click)="Respond('ConflictReject')" [disabled]="IsActing">Flag Conflict</button>
                  </div>
                </div>
              }
            } @else {
              <div class="empty-detail">Select an assignment from the left workbench to inspect conflict parties and respond within SLA.</div>
            }
          </section>
        </div>
      </mj-page-body>
    </mj-page-layout>
  `,
  styles: [`
    .toolbar { display: flex; gap: 0.5rem; align-items: center; }
    .toolbar select {
      background: var(--mj-bg-surface);
      color: var(--mj-text-primary);
      border: 1px solid var(--mj-border-default);
      border-radius: var(--mj-radius-sm, 6px);
      padding: 0.4rem 0.65rem;
    }
    .split-workbench {
      display: grid;
      grid-template-columns: minmax(280px, 360px) minmax(0, 1fr);
      gap: 1rem;
      padding: 1rem;
      height: 100%;
    }
    .lead-list, .lead-detail {
      background: var(--mj-bg-surface-card, var(--mj-bg-surface));
      border: 1px solid var(--mj-border-default);
      border-radius: var(--mj-radius-md, 8px);
      padding: 0.9rem;
      color: var(--mj-text-primary);
      overflow-y: auto;
    }
    .lead-item {
      width: 100%;
      text-align: left;
      background: var(--mj-bg-surface);
      border: 1px solid var(--mj-border-default);
      border-radius: var(--mj-radius-sm, 6px);
      padding: 0.7rem;
      margin-bottom: 0.55rem;
      cursor: pointer;
      color: var(--mj-text-primary);
    }
    .lead-item.selected { border-color: var(--mj-brand-primary); background: var(--mj-bg-surface-hover); }
    .lead-top { display: flex; justify-content: space-between; align-items: center; }
    .status-pill {
      font-size: 0.72rem;
      font-weight: 700;
      padding: 0.12rem 0.5rem;
      border-radius: 999px;
      background: var(--mj-status-info-bg);
      color: var(--mj-status-info-text);
    }
    .status-pill[data-status="Accepted"] { background: var(--mj-status-success-bg); color: var(--mj-status-success-text); }
    .status-pill[data-status="ConflictRejected"] { background: var(--mj-status-error-bg); color: var(--mj-status-error-text); }
    .lead-meta, .lead-sla { font-size: 0.78rem; color: var(--mj-text-secondary); margin-top: 0.25rem; }
    .detail-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; }
    .detail-sub { font-size: 0.82rem; color: var(--mj-text-secondary); }
    .detail-summary { margin: 1rem 0; font-size: 0.9rem; color: var(--mj-text-primary); }
    .conflict-panel {
      border-top: 1px solid var(--mj-border-default);
      padding-top: 0.75rem;
      margin-bottom: 1rem;
    }
    .party-row {
      display: flex;
      justify-content: space-between;
      padding: 0.4rem 0;
      border-bottom: 1px solid var(--mj-border-subtle, var(--mj-border-default));
      font-size: 0.86rem;
    }
    .role-chip {
      font-size: 0.74rem;
      background: var(--mj-bg-surface-sunken, var(--mj-bg-surface));
      border: 1px solid var(--mj-border-default);
      padding: 0.1rem 0.45rem;
      border-radius: 999px;
    }
    .response-box textarea {
      width: 100%;
      background: var(--mj-bg-surface);
      color: var(--mj-text-primary);
      border: 1px solid var(--mj-border-default);
      border-radius: var(--mj-radius-sm, 6px);
      padding: 0.5rem;
      margin-bottom: 0.65rem;
    }
    .response-actions { display: flex; gap: 0.5rem; }
    .btn-outline {
      background: var(--mj-bg-surface);
      color: var(--mj-text-primary);
      border: 1px solid var(--mj-border-default);
      border-radius: var(--mj-radius-sm, 6px);
      padding: 0.4rem 0.75rem;
      cursor: pointer;
    }
    .btn-accept {
      background: var(--mj-status-success-text);
      color: var(--mj-text-inverse);
      border: none;
      border-radius: var(--mj-radius-sm, 6px);
      padding: 0.5rem 0.9rem;
      cursor: pointer;
    }
    .btn-decline {
      background: var(--mj-status-warning-bg);
      color: var(--mj-status-warning-text);
      border: 1px solid var(--mj-border-default);
      border-radius: var(--mj-radius-sm, 6px);
      padding: 0.5rem 0.9rem;
      cursor: pointer;
    }
    .btn-conflict {
      background: var(--mj-status-error-bg);
      color: var(--mj-status-error-text);
      border: 1px solid var(--mj-border-default);
      border-radius: var(--mj-radius-sm, 6px);
      padding: 0.5rem 0.9rem;
      cursor: pointer;
    }
    .action-banner {
      padding: 0.55rem 0.75rem;
      border-radius: var(--mj-radius-sm, 6px);
      background: var(--mj-status-info-bg);
      color: var(--mj-status-info-text);
      margin-top: 0.75rem;
      font-size: 0.85rem;
    }
    .empty-state, .empty-detail { color: var(--mj-text-secondary); font-size: 0.86rem; padding: 1rem 0; }
  `],
})
export class ReferralsProInboxComponent extends BaseResourceComponent implements OnInit {
  private readonly cdr = inject(ChangeDetectorRef);
  protected readonly navService = inject(NavigationService);

  public Assignments: ReferralAssignmentEntity[] = [];
  public SelectedAssignment: ReferralAssignmentEntity | null = null;
  public SelectedRequest: ReferralRequestEntity | null = null;
  public ConflictParties: ConflictCheckPartyEntity[] = [];
  public Prefs: ProInboxPreferences = { StatusFilter: 'Offered' };
  public ResponseNotes = '';
  public ActionMessage = '';
  public IsActing = false;

  async ngOnInit(): Promise<void> {
    super.ngOnInit();
    this.Prefs = ReferralsUiStateHelper.LoadProInboxPreferences();
    await this.Refresh();
    ReferralTelemetry.RecordOperation({
      Operation: 'ProInboxView',
      Route: 'app/Referrals/pro-inbox',
      ElapsedMs: 1,
    });
    this.NotifyLoadComplete();
    this.cdr.markForCheck();
  }

  public async OnFilterChange(): Promise<void> {
    await ReferralsUiStateHelper.SaveProInboxPreferences(this.Prefs);
    await this.Refresh();
  }

  public async Refresh(): Promise<void> {
    const rv = new RunView();
    const md = new Metadata();
    const extraFilter = this.Prefs.StatusFilter === 'All' ? '' : `Status = '${this.Prefs.StatusFilter}'`;
    const res = await rv.RunView<ReferralAssignmentEntity>(
      {
        EntityName: 'MJ_BizApps_Referrals: Referral Assignments',
        ExtraFilter: extraFilter,
        OrderBy: 'SLADeadlineAt ASC',
        ResultType: 'entity_object',
      },
      md.CurrentUser,
    );
    this.Assignments = res.Success ? res.Results : [];
    if (this.Assignments.length > 0 && !this.SelectedAssignment) {
      await this.SelectAssignment(this.Assignments[0]);
    }
    this.cdr.markForCheck();
  }

  public async SelectAssignment(assignment: ReferralAssignmentEntity): Promise<void> {
    this.SelectedAssignment = assignment;
    this.ActionMessage = '';
    const rv = new RunView();
    const md = new Metadata();
    const results = await rv.RunViews(
      [
        {
          EntityName: 'MJ_BizApps_Referrals: Referral Requests',
          ExtraFilter: `ID = '${assignment.ReferralRequestID}'`,
          ResultType: 'entity_object',
        },
        {
          EntityName: 'MJ_BizApps_Referrals: Conflict Check Parties',
          ExtraFilter: `ReferralRequestID = '${assignment.ReferralRequestID}'`,
          ResultType: 'entity_object',
        },
      ],
      md.CurrentUser,
    );
    this.SelectedRequest =
      results[0]?.Success && results[0].Results.length > 0
        ? (results[0].Results[0] as ReferralRequestEntity)
        : null;
    this.ConflictParties = results[1]?.Success
      ? (results[1].Results as ConflictCheckPartyEntity[])
      : [];
    this.cdr.markForCheck();
  }

  public async Respond(action: AssignmentResponseAction): Promise<void> {
    if (!this.SelectedAssignment) return;
    this.IsActing = true;
    this.cdr.markForCheck();
    try {
      const md = new Metadata();
      const outcome = await CascadeRoutingService.RespondToAssignment(
        {
          ReferralAssignmentID: this.SelectedAssignment.ID,
          Action: action,
          Notes: this.ResponseNotes || undefined,
          DeclineReason: action !== 'Accept' ? this.ResponseNotes || action : undefined,
        },
        md.CurrentUser,
      );
      this.ActionMessage = `Recorded ${outcome.AssignmentStatus}. Request status is now ${outcome.RequestStatus}.`;
      this.ResponseNotes = '';
      await this.Refresh();
    } finally {
      this.IsActing = false;
      this.cdr.markForCheck();
    }
  }

  public OpenRequestRecord(id: string): void {
    this.navService.OpenEntityRecord('MJ_BizApps_Referrals: Referral Requests', CompositeKey.FromID(id));
  }

  async GetResourceDisplayName(_data: ResourceData): Promise<string> {
    return 'Pro Lead Inbox';
  }

  async GetResourceIconClass(_data: ResourceData): Promise<string> {
    return 'fa-solid fa-inbox';
  }
}
