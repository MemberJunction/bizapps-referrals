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
import { CascadeRoutingService, ReferralTelemetry, UUIDsEqual } from '@mj-biz-apps/referrals-core';
import {
  JurisdictionEntity,
  PracticeAreaEntity,
  ProfessionalJurisdictionEntity,
  ProfessionalPracticeAreaEntity,
  ProfessionalProfileEntity,
  ReferralAssignmentEntity,
  ReferralRequestEntity,
} from '@mj-biz-apps/referrals-entities';
import { OpsTelemetryPreferences, ReferralsUiStateHelper } from '../services/referrals-ui-state.service.js';

export interface SupplyDemandGapRow {
  PracticeAreaID: string;
  PracticeAreaName: string;
  JurisdictionID: string;
  JurisdictionName: string;
  VerifiedSupply: number;
  OpenDemand: number;
  ExhaustedDemand: number;
  GapStatus: 'Surplus' | 'Balanced' | 'Deficit';
}

/**
 * Tab 3: Ops Telemetry — Variant C Ops Command.
 */
@RegisterClass(BaseResourceComponent, 'ReferralsOpsTelemetryResource')
@Component({
  standalone: true,
  selector: 'mj-referrals-ops-telemetry',
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
      <mj-page-header Title="Referrals Ops Command" Icon="fa-solid fa-chart-line">
        <div class="ops-toolbar">
          <label class="toggle-chip">
            <input type="checkbox" [(ngModel)]="Prefs.ShowExhaustedOnly" (ngModelChange)="OnToggleChange()" />
            <span>Exhausted Only</span>
          </label>
          <button type="button" class="btn-outline" (click)="RunSlaSweep()" [disabled]="IsSweeping">
            {{ IsSweeping ? 'Sweeping...' : 'Sweep Expired SLAs' }}
          </button>
          <button type="button" class="btn-outline" (click)="Refresh()">Refresh</button>
        </div>
      </mj-page-header>
      <mj-page-body>
        <div class="ops-container">
          @if (SweepSummary) {
            <div class="sweep-banner">{{ SweepSummary }}</div>
          }

          <div class="kpi-grid">
            <div class="kpi-card">
              <span class="kpi-label">Total Requests</span>
              <strong class="kpi-value">{{ Requests.length }}</strong>
            </div>
            <div class="kpi-card">
              <span class="kpi-label">Pending SLA Offers</span>
              <strong class="kpi-value">{{ OfferedCount }}</strong>
            </div>
            <div class="kpi-card">
              <span class="kpi-label">Accepted</span>
              <strong class="kpi-value">{{ AcceptedCount }}</strong>
            </div>
            <div class="kpi-card">
              <span class="kpi-label">Exhausted</span>
              <strong class="kpi-value">{{ ExhaustedCount }}</strong>
            </div>
            <div class="kpi-card">
              <span class="kpi-label">Acceptance Rate</span>
              <strong class="kpi-value">{{ AcceptanceRatePct | number:'1.0-1' }}%</strong>
            </div>
            <div class="kpi-card">
              <span class="kpi-label">Avg Cascade Step</span>
              <strong class="kpi-value">{{ AverageCascadeStep | number:'1.1-1' }}</strong>
            </div>
            <div class="kpi-card">
              <span class="kpi-label">Conflict Rejections</span>
              <strong class="kpi-value">{{ ConflictRejectionCount }}</strong>
            </div>
            <div class="kpi-card">
              <span class="kpi-label">Expired SLAs</span>
              <strong class="kpi-value">{{ ExpiredAssignmentCount }}</strong>
            </div>
          </div>

          <div class="table-card">
            <h3>Supply-Demand Gap Matrix (Practice Area × Jurisdiction)</h3>
            <table>
              <thead>
                <tr>
                  <th>Practice Area</th>
                  <th>Jurisdiction</th>
                  <th>Verified Supply</th>
                  <th>Open Demand</th>
                  <th>Exhausted</th>
                  <th>Coverage</th>
                </tr>
              </thead>
              <tbody>
                @for (row of SupplyDemandMatrix; track row.PracticeAreaID + ':' + row.JurisdictionID) {
                  <tr>
                    <td>{{ row.PracticeAreaName }}</td>
                    <td>{{ row.JurisdictionName }}</td>
                    <td>{{ row.VerifiedSupply }}</td>
                    <td>{{ row.OpenDemand }}</td>
                    <td>{{ row.ExhaustedDemand }}</td>
                    <td><span class="badge" [attr.data-gap]="row.GapStatus">{{ row.GapStatus }}</span></td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="6" class="empty-cell">No supply-demand activity recorded yet.</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <div class="table-card">
            <h3>Active Referral Cascade Pipeline</h3>
            <table>
              <thead>
                <tr>
                  <th>Request #</th>
                  <th>Matter</th>
                  <th>Status</th>
                  <th>Cascade Step</th>
                  <th>Submitted</th>
                </tr>
              </thead>
              <tbody>
                @for (r of VisibleRequests; track r.ID) {
                  <tr (click)="OpenRequest(r.ID)">
                    <td>{{ r.RequestNumber }}</td>
                    <td>{{ r.MatterTitle }}</td>
                    <td><span class="badge" [attr.data-status]="r.Status">{{ r.Status }}</span></td>
                    <td>#{{ r.CurrentCascadeStep }}</td>
                    <td>{{ r.SubmittedAt ? (r.SubmittedAt | date:'short') : 'Draft' }}</td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="5" class="empty-cell">No referral requests found.</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </mj-page-body>
    </mj-page-layout>
  `,
  styles: [`
    .ops-toolbar { display: flex; gap: 0.6rem; align-items: center; }
    .toggle-chip { display: flex; gap: 0.35rem; align-items: center; font-size: 0.82rem; color: var(--mj-text-secondary); }
    .btn-outline {
      background: var(--mj-bg-surface);
      color: var(--mj-text-primary);
      border: 1px solid var(--mj-border-default);
      border-radius: var(--mj-radius-sm, 6px);
      padding: 0.4rem 0.8rem;
      cursor: pointer;
    }
    .ops-container { padding: 1.25rem; display: flex; flex-direction: column; gap: 1rem; }
    .sweep-banner {
      padding: 0.65rem 0.9rem;
      border-radius: var(--mj-radius-sm, 6px);
      background: var(--mj-status-info-bg);
      color: var(--mj-status-info-text);
      font-size: 0.86rem;
    }
    .kpi-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 0.9rem; }
    .kpi-card {
      background: var(--mj-bg-surface-card, var(--mj-bg-surface));
      border: 1px solid var(--mj-border-default);
      border-radius: var(--mj-radius-md, 8px);
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .kpi-label { font-size: 0.78rem; color: var(--mj-text-secondary); }
    .kpi-value { font-size: 1.5rem; color: var(--mj-text-primary); }
    .table-card {
      background: var(--mj-bg-surface-card, var(--mj-bg-surface));
      border: 1px solid var(--mj-border-default);
      border-radius: var(--mj-radius-md, 8px);
      padding: 1rem;
      color: var(--mj-text-primary);
    }
    .table-card h3 { margin: 0 0 0.75rem 0; font-size: 1rem; }
    table { width: 100%; border-collapse: collapse; font-size: 0.86rem; }
    th, td {
      text-align: left;
      padding: 0.55rem 0.65rem;
      border-bottom: 1px solid var(--mj-border-default);
    }
    th { color: var(--mj-text-secondary); font-weight: 600; }
    tbody tr { cursor: pointer; }
    tbody tr:hover { background: var(--mj-bg-surface-hover); }
    .badge {
      padding: 0.14rem 0.5rem;
      border-radius: 999px;
      font-size: 0.74rem;
      font-weight: 700;
      background: var(--mj-status-info-bg);
      color: var(--mj-status-info-text);
    }
    .badge[data-status="Accepted"], .badge[data-gap="Surplus"] { background: var(--mj-status-success-bg); color: var(--mj-status-success-text); }
    .badge[data-status="Exhausted"], .badge[data-gap="Deficit"] { background: var(--mj-status-error-bg); color: var(--mj-status-error-text); }
    .table-card { margin-bottom: 1.25rem; }
    .empty-cell { text-align: center; color: var(--mj-text-secondary); padding: 1.5rem; }
  `],
})
export class ReferralsOpsTelemetryComponent extends BaseResourceComponent implements OnInit {
  private readonly cdr = inject(ChangeDetectorRef);
  protected readonly navService = inject(NavigationService);

  public Requests: ReferralRequestEntity[] = [];
  public Assignments: ReferralAssignmentEntity[] = [];
  public PracticeAreas: PracticeAreaEntity[] = [];
  public Jurisdictions: JurisdictionEntity[] = [];
  public Profiles: ProfessionalProfileEntity[] = [];
  public PracticeLinks: ProfessionalPracticeAreaEntity[] = [];
  public JurisdictionLinks: ProfessionalJurisdictionEntity[] = [];
  public Prefs: OpsTelemetryPreferences = { ShowExhaustedOnly: false };
  public IsSweeping = false;
  public SweepSummary = '';

  public get OfferedCount(): number {
    return this.Assignments.filter((a) => a.Status === 'Offered').length;
  }

  public get AcceptedCount(): number {
    return this.Requests.filter((r) => r.Status === 'Accepted' || r.Status === 'Completed').length;
  }

  public get ExhaustedCount(): number {
    return this.Requests.filter((r) => r.Status === 'Exhausted').length;
  }

  public get ConflictRejectionCount(): number {
    return this.Assignments.filter((a) => a.Status === 'ConflictRejected').length;
  }

  public get ExpiredAssignmentCount(): number {
    return this.Assignments.filter((a) => a.Status === 'Expired').length;
  }

  public get AcceptanceRatePct(): number {
    const routedOrDone = this.Requests.filter((r) => r.Status !== 'Draft').length;
    return routedOrDone === 0 ? 0 : (this.AcceptedCount / routedOrDone) * 100;
  }

  public get AverageCascadeStep(): number {
    const accepted = this.Requests.filter((r) => r.Status === 'Accepted' || r.Status === 'Completed');
    if (accepted.length === 0) return 0;
    const sum = accepted.reduce((acc, r) => acc + (r.CurrentCascadeStep || 1), 0);
    return sum / accepted.length;
  }

  public get SupplyDemandMatrix(): SupplyDemandGapRow[] {
    const verifiedIds = new Set(
      this.Profiles.filter((p) => p.IsActive && p.VerificationStatus === 'Verified').map((p) => p.ID.toLowerCase()),
    );
    const pairs = new Map<string, { paId: string; jurId: string }>();

    for (const req of this.Requests) {
      const key = `${req.PracticeAreaID.toLowerCase()}:${req.JurisdictionID.toLowerCase()}`;
      if (!pairs.has(key)) {
        pairs.set(key, { paId: req.PracticeAreaID, jurId: req.JurisdictionID });
      }
    }

    const rows: SupplyDemandGapRow[] = [];
    for (const pair of pairs.values()) {
      const paName = this.PracticeAreas.find((pa) => UUIDsEqual(pa.ID, pair.paId))?.Name ?? pair.paId;
      const jurName = this.Jurisdictions.find((j) => UUIDsEqual(j.ID, pair.jurId))?.Name ?? pair.jurId;

      const paPros = new Set(
        this.PracticeLinks.filter((l) => UUIDsEqual(l.PracticeAreaID, pair.paId)).map((l) => l.ProfessionalProfileID.toLowerCase()),
      );
      const verifiedSupply = this.JurisdictionLinks.filter(
        (l) =>
          UUIDsEqual(l.JurisdictionID, pair.jurId) &&
          l.StandingStatus === 'GoodStanding' &&
          paPros.has(l.ProfessionalProfileID.toLowerCase()) &&
          verifiedIds.has(l.ProfessionalProfileID.toLowerCase()),
      ).length;

      const matchingReqs = this.Requests.filter(
        (r) => UUIDsEqual(r.PracticeAreaID, pair.paId) && UUIDsEqual(r.JurisdictionID, pair.jurId),
      );
      const openDemand = matchingReqs.filter((r) => r.Status === 'Submitted' || r.Status === 'Routed').length;
      const exhaustedDemand = matchingReqs.filter((r) => r.Status === 'Exhausted').length;

      const gapStatus: SupplyDemandGapRow['GapStatus'] =
        exhaustedDemand > 0 || verifiedSupply < openDemand
          ? 'Deficit'
          : verifiedSupply > openDemand + 1
            ? 'Surplus'
            : 'Balanced';

      rows.push({
        PracticeAreaID: pair.paId,
        PracticeAreaName: paName,
        JurisdictionID: pair.jurId,
        JurisdictionName: jurName,
        VerifiedSupply: verifiedSupply,
        OpenDemand: openDemand,
        ExhaustedDemand: exhaustedDemand,
        GapStatus: gapStatus,
      });
    }

    return rows.sort((a, b) => b.ExhaustedDemand - a.ExhaustedDemand || b.OpenDemand - a.OpenDemand);
  }

  public get VisibleRequests(): ReferralRequestEntity[] {
    if (this.Prefs.ShowExhaustedOnly) {
      return this.Requests.filter((r) => r.Status === 'Exhausted');
    }
    return this.Requests;
  }

  async ngOnInit(): Promise<void> {
    super.ngOnInit();
    this.Prefs = ReferralsUiStateHelper.LoadOpsPreferences();
    await this.Refresh();
    ReferralTelemetry.RecordOperation({
      Operation: 'OpsTelemetryView',
      Route: 'app/Referrals/ops-telemetry',
      ElapsedMs: 1,
    });
    this.NotifyLoadComplete();
    this.cdr.markForCheck();
  }

  public async OnToggleChange(): Promise<void> {
    await ReferralsUiStateHelper.SaveOpsPreferences(this.Prefs);
    this.cdr.markForCheck();
  }

  public async Refresh(): Promise<void> {
    const rv = new RunView();
    const md = new Metadata();
    const results = await rv.RunViews(
      [
        { EntityName: 'MJ_BizApps_Referrals: Referral Requests', OrderBy: '__mj_CreatedAt DESC', ResultType: 'entity_object' },
        { EntityName: 'MJ_BizApps_Referrals: Referral Assignments', OrderBy: '__mj_CreatedAt DESC', ResultType: 'entity_object' },
        { EntityName: 'MJ_BizApps_Referrals: Practice Areas', ExtraFilter: 'IsActive = 1', ResultType: 'entity_object' },
        { EntityName: 'MJ_BizApps_Referrals: Jurisdictions', ExtraFilter: 'IsActive = 1', ResultType: 'entity_object' },
        { EntityName: 'MJ_BizApps_Referrals: Professional Profiles', ExtraFilter: 'IsActive = 1', ResultType: 'entity_object' },
        { EntityName: 'MJ_BizApps_Referrals: Professional Practice Areas', ResultType: 'entity_object' },
        { EntityName: 'MJ_BizApps_Referrals: Professional Jurisdictions', ResultType: 'entity_object' },
      ],
      md.CurrentUser,
    );
    this.Requests = results[0]?.Success ? (results[0].Results as ReferralRequestEntity[]) : [];
    this.Assignments = results[1]?.Success ? (results[1].Results as ReferralAssignmentEntity[]) : [];
    this.PracticeAreas = results[2]?.Success ? (results[2].Results as PracticeAreaEntity[]) : [];
    this.Jurisdictions = results[3]?.Success ? (results[3].Results as JurisdictionEntity[]) : [];
    this.Profiles = results[4]?.Success ? (results[4].Results as ProfessionalProfileEntity[]) : [];
    this.PracticeLinks = results[5]?.Success ? (results[5].Results as ProfessionalPracticeAreaEntity[]) : [];
    this.JurisdictionLinks = results[6]?.Success ? (results[6].Results as ProfessionalJurisdictionEntity[]) : [];
    this.cdr.markForCheck();
  }

  public async RunSlaSweep(): Promise<void> {
    this.IsSweeping = true;
    this.cdr.markForCheck();
    try {
      const md = new Metadata();
      const res = await CascadeRoutingService.SweepExpiredSLAs(new Date(), md.CurrentUser);
      this.SweepSummary = `SLA Sweep complete: ${res.ExpiredCount} expired, ${res.CascadedCount} cascaded, ${res.ExhaustedCount} exhausted.`;
      await this.Refresh();
    } finally {
      this.IsSweeping = false;
      this.cdr.markForCheck();
    }
  }

  public OpenRequest(id: string): void {
    this.navService.OpenEntityRecord('MJ_BizApps_Referrals: Referral Requests', CompositeKey.FromID(id));
  }

  async GetResourceDisplayName(_data: ResourceData): Promise<string> {
    return 'Ops Telemetry';
  }

  async GetResourceIconClass(_data: ResourceData): Promise<string> {
    return 'fa-solid fa-chart-line';
  }
}
