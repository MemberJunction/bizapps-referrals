import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CompositeKey, IMetadataProvider, IRunViewProvider, Metadata, RunView } from '@memberjunction/core';
import { ResourceData } from '@memberjunction/core-entities';
import { RegisterClass } from '@memberjunction/global';
import { BaseResourceComponent, NavigationService } from '@memberjunction/ng-shared';
import {
  MJButtonDirective,
  MJPageBodyComponent,
  MJPageHeaderComponent,
  MJPageLayoutComponent,
} from '@memberjunction/ng-ui-components';
import { CurrentUtcQuarter, ReciprocityPeriod, ReciprocityScorecardService, ReferralTelemetry } from '@mj-biz-apps/referrals-core';
import { ProfessionalProfileEntity, ReciprocitySnapshotEntity } from '@mj-biz-apps/referrals-entities';
import { ReferralsUiStateHelper } from '../services/referrals-ui-state.service.js';

interface QuarterOption {
  Label: string;
  Period: ReciprocityPeriod;
}

interface ScorecardRow {
  ProfessionalProfileID: string;
  DisplayName: string;
  ReadinessScore: number;
  Sent: number;
  Received: number;
  Accepted: number;
  Resolved: number;
  AcceptanceRate: number;
  MedianResponseHours: number | null;
  SLABreachCount: number;
  ReciprocityIndex: number;
  AttributedFeeTotal: number;
}

function periodKey(period: ReciprocityPeriod): string {
  return period.Start.toISOString();
}

/**
 * Tab 7: Reciprocity Scorecard — quarter-over-quarter give/receive balance ranking across
 * all professionals, driving ReadinessScore and ReciprocityIndex.
 */
@RegisterClass(BaseResourceComponent, 'ReferralsReciprocityScorecardResource')
@Component({
  standalone: true,
  selector: 'mj-referrals-reciprocity-scorecard',
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
      <mj-page-header Title="Reciprocity Scorecard" Icon="fa-solid fa-arrows-rotate">
        <div class="scorecard-toolbar" actions>
          <label class="quarter-select">
            <span>Quarter</span>
            <select [(ngModel)]="SelectedQuarterKey" (ngModelChange)="OnQuarterChange()">
              @for (q of AvailableQuarters; track q.Label) {
                <option [value]="GetQuarterKey(q)">{{ q.Label }}</option>
              }
            </select>
          </label>
          <button type="button" mjButton Variant="primary" Size="sm" (click)="Recompute()" [disabled]="IsRecomputing">
            {{ IsRecomputing ? 'Recomputing...' : 'Recompute' }}
          </button>
        </div>
      </mj-page-header>
      <mj-page-body>
        <div class="scorecard-container">
          @if (RecomputeSummary) {
            <div class="recompute-banner">{{ RecomputeSummary }}</div>
          }

          <div class="kpi-grid">
            <div class="kpi-card">
              <span class="kpi-label">Professionals Tracked</span>
              <strong class="kpi-value">{{ Rows.length }}</strong>
            </div>
            <div class="kpi-card">
              <span class="kpi-label">Avg Acceptance Rate</span>
              <strong class="kpi-value">{{ AvgAcceptanceRate | number:'1.0-1' }}%</strong>
            </div>
            <div class="kpi-card">
              <span class="kpi-label">Total SLA Breaches</span>
              <strong class="kpi-value">{{ TotalSlaBreaches }}</strong>
            </div>
            <div class="kpi-card">
              <span class="kpi-label">Total Attributed Fees</span>
              <strong class="kpi-value">{{ TotalAttributedFees | number:'1.0-0' }}</strong>
            </div>
          </div>

          <div class="table-card">
            <table>
              <thead>
                <tr>
                  <th>Professional</th>
                  <th>Readiness</th>
                  <th>Sent</th>
                  <th>Received</th>
                  <th>Accepted</th>
                  <th>Resolved</th>
                  <th>Acceptance Rate</th>
                  <th>Median Response (h)</th>
                  <th>SLA Breaches</th>
                  <th>Reciprocity Index</th>
                  <th>Attributed Fees</th>
                </tr>
              </thead>
              <tbody>
                @for (row of Rows; track row.ProfessionalProfileID) {
                  <tr>
                    <td>
                      <button
                        type="button"
                        mjButton
                        Variant="flat"
                        Size="sm"
                        [AriaLabel]="'Open professional profile for ' + row.DisplayName"
                        (click)="OpenProfessionalRecord(row.ProfessionalProfileID)"
                      >
                        {{ row.DisplayName }}
                      </button>
                    </td>
                    <td>
                      <span class="readiness-badge" [attr.aria-label]="'Readiness score ' + row.ReadinessScore">
                        {{ row.ReadinessScore | number:'1.0-0' }}
                      </span>
                    </td>
                    <td>{{ row.Sent }}</td>
                    <td>{{ row.Received }}</td>
                    <td>{{ row.Accepted }}</td>
                    <td>{{ row.Resolved }}</td>
                    <td>
                      <div class="rate-bar-track">
                        <div class="rate-bar-fill" [style.width.%]="row.AcceptanceRate"></div>
                      </div>
                      <span class="rate-bar-label">{{ row.AcceptanceRate | number:'1.0-1' }}%</span>
                    </td>
                    <td>{{ row.MedianResponseHours != null ? (row.MedianResponseHours | number:'1.0-1') : '—' }}</td>
                    <td>{{ row.SLABreachCount }}</td>
                    <td><strong>{{ row.ReciprocityIndex | number:'1.2-3' }}</strong></td>
                    <td>{{ row.AttributedFeeTotal | number:'1.0-2' }}</td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="11" class="empty-cell">No reciprocity snapshots for this period yet. Click Recompute to generate them.</td>
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
    .scorecard-toolbar { display: flex; gap: 0.75rem; align-items: center; }
    .quarter-select { display: flex; align-items: center; gap: 0.4rem; font-size: 0.82rem; color: var(--mj-text-secondary); }
    .quarter-select select {
      background: var(--mj-bg-surface);
      border: 1px solid var(--mj-border-default);
      border-radius: var(--mj-radius-sm, 6px);
      padding: 0.35rem 0.55rem;
      color: var(--mj-text-primary);
      font-size: 0.85rem;
    }
    .scorecard-container { padding: 1.25rem; max-width: 1300px; margin: 0 auto; display: flex; flex-direction: column; gap: 1.1rem; }
    .recompute-banner {
      padding: 0.6rem 0.8rem;
      border-radius: var(--mj-radius-sm, 6px);
      background: var(--mj-status-success-bg);
      color: var(--mj-status-success-text);
      font-size: 0.85rem;
    }
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
    .table-card {
      background: var(--mj-bg-surface-card, var(--mj-bg-surface));
      border: 1px solid var(--mj-border-default);
      border-radius: var(--mj-radius-md, 8px);
      padding: 1rem;
      overflow-x: auto;
    }
    table { width: 100%; border-collapse: collapse; font-size: 0.82rem; }
    th { text-align: left; padding: 0.5rem 0.6rem; color: var(--mj-text-secondary); font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.03em; border-bottom: 1px solid var(--mj-border-default); }
    td { padding: 0.5rem 0.6rem; color: var(--mj-text-primary); border-bottom: 1px solid var(--mj-border-default); }
    .empty-cell { text-align: center; color: var(--mj-text-secondary); padding: 1.5rem 0; }
    .readiness-badge {
      display: inline-block;
      font-size: 0.72rem;
      font-weight: 600;
      color: var(--mj-status-success-text);
      background: var(--mj-status-success-bg);
      border-radius: 999px;
      padding: 0.1rem 0.5rem;
    }
    .rate-bar-track {
      display: inline-block;
      width: 60px;
      height: 6px;
      border-radius: 999px;
      background: var(--mj-border-default);
      overflow: hidden;
      vertical-align: middle;
      margin-right: 0.4rem;
    }
    .rate-bar-fill { height: 100%; background: var(--mj-brand-primary); }
    .rate-bar-label { font-size: 0.78rem; color: var(--mj-text-secondary); }
  `],
})
export class ReferralsReciprocityScorecardComponent extends BaseResourceComponent implements OnInit {
  private readonly cdr = inject(ChangeDetectorRef);
  protected readonly navService = inject(NavigationService);

  public AvailableQuarters: QuarterOption[] = [];
  public SelectedQuarterKey = '';
  public Rows: ScorecardRow[] = [];
  public IsRecomputing = false;
  public RecomputeSummary = '';

  async ngOnInit(): Promise<void> {
    super.ngOnInit();
    queueMicrotask(() => this.NotifyLoadStarted());
    this.BuildAvailableQuarters();
    const prefs = ReferralsUiStateHelper.LoadReciprocityScorecardPreferences();
    const matching = this.AvailableQuarters.find((q) => periodKey(q.Period) === prefs.SelectedPeriodStartIso);
    this.SelectedQuarterKey = matching ? this.GetQuarterKey(matching) : this.GetQuarterKey(this.AvailableQuarters[0]);
    await this.Refresh();
    ReferralTelemetry.RecordOperation({
      Operation: 'ReciprocityScorecardView',
      Route: 'app/Referrals/reciprocity-scorecard',
      ElapsedMs: 1,
    });
    this.NotifyLoadComplete();
    this.cdr.markForCheck();
  }

  private BuildAvailableQuarters(): void {
    const now = new Date();
    const quarters: QuarterOption[] = [];
    for (let i = 0; i < 6; i++) {
      const asOf = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i * 3, 1));
      const period = CurrentUtcQuarter(asOf);
      const quarterNumber = Math.floor(period.Start.getUTCMonth() / 3) + 1;
      quarters.push({ Label: `Q${quarterNumber} ${period.Start.getUTCFullYear()}`, Period: period });
    }
    this.AvailableQuarters = quarters;
  }

  public GetQuarterKey(q: QuarterOption): string {
    return periodKey(q.Period);
  }

  private GetSelectedPeriod(): ReciprocityPeriod {
    const found = this.AvailableQuarters.find((q) => this.GetQuarterKey(q) === this.SelectedQuarterKey);
    return found ? found.Period : CurrentUtcQuarter();
  }

  public async OnQuarterChange(): Promise<void> {
    await ReferralsUiStateHelper.SaveReciprocityScorecardPreferences({ SelectedPeriodStartIso: this.SelectedQuarterKey });
    await this.Refresh();
    this.cdr.markForCheck();
  }

  public async Refresh(): Promise<void> {
    const period = this.GetSelectedPeriod();
    const rv = new RunView();
    const md = new Metadata();
    const periodStartIso = period.Start.toISOString();
    const periodEndIso = period.End.toISOString();

    const snapshotsRes = await rv.RunView<ReciprocitySnapshotEntity>(
      {
        EntityName: 'MJ_BizApps_Referrals: Reciprocity Snapshots',
        ExtraFilter: `PeriodStartDate = '${periodStartIso}' AND PeriodEndDate = '${periodEndIso}'`,
        OrderBy: 'ReciprocityIndex DESC',
        ResultType: 'entity_object',
      },
      md.CurrentUser,
    );

    if (!snapshotsRes.Success || snapshotsRes.Results.length === 0) {
      this.Rows = [];
      return;
    }

    const profileIds = [...new Set(snapshotsRes.Results.map((s) => `'${s.ProfessionalProfileID}'`))];
    const profilesRes = await rv.RunView<ProfessionalProfileEntity>(
      {
        EntityName: 'MJ_BizApps_Referrals: Professional Profiles',
        ExtraFilter: `ID IN (${profileIds.join(', ')})`,
        ResultType: 'entity_object',
      },
      md.CurrentUser,
    );
    const profilesById = new Map<string, ProfessionalProfileEntity>();
    if (profilesRes.Success) {
      for (const p of profilesRes.Results) {
        profilesById.set(p.ID, p);
      }
    }

    this.Rows = snapshotsRes.Results.map((s) => {
      const profile = profilesById.get(s.ProfessionalProfileID);
      return {
        ProfessionalProfileID: s.ProfessionalProfileID,
        DisplayName: profile?.DisplayName ?? s.ProfessionalProfileID,
        ReadinessScore: profile?.ReadinessScore ?? 0,
        Sent: s.ReferralsSent,
        Received: s.ReferralsReceived,
        Accepted: s.ReferralsAccepted,
        Resolved: s.ReferralsResolved,
        // AcceptanceRate is persisted as a 0..1 fraction; convert to a 0..100
        // percentage here so the template's bare `%` suffix renders correctly.
        AcceptanceRate: s.AcceptanceRate * 100,
        MedianResponseHours: s.MedianResponseHours,
        SLABreachCount: s.SLABreachCount,
        ReciprocityIndex: s.ReciprocityIndex,
        AttributedFeeTotal: s.AttributedFeeTotal,
      };
    }).sort((a, b) => b.ReciprocityIndex - a.ReciprocityIndex);
  }

  public get AvgAcceptanceRate(): number {
    if (this.Rows.length === 0) return 0;
    return this.Rows.reduce((sum, r) => sum + r.AcceptanceRate, 0) / this.Rows.length;
  }

  public get TotalSlaBreaches(): number {
    return this.Rows.reduce((sum, r) => sum + r.SLABreachCount, 0);
  }

  public get TotalAttributedFees(): number {
    return this.Rows.reduce((sum, r) => sum + r.AttributedFeeTotal, 0);
  }

  public async Recompute(): Promise<void> {
    this.IsRecomputing = true;
    this.RecomputeSummary = '';
    this.cdr.markForCheck();
    try {
      const md = new Metadata();
      const provider = Metadata.Provider as IMetadataProvider & IRunViewProvider;
      const period = this.GetSelectedPeriod();
      const result = await ReciprocityScorecardService.RecomputeSnapshots(md.CurrentUser, provider, period);
      this.RecomputeSummary = `Recomputed ${result.ProcessedCount} professional scorecard(s) for the selected period.`;
      await this.Refresh();
    } catch (err) {
      this.RecomputeSummary = err instanceof Error ? `Recompute failed: ${err.message}` : 'Recompute failed.';
    } finally {
      this.IsRecomputing = false;
      this.cdr.markForCheck();
    }
  }

  public OpenProfessionalRecord(id: string): void {
    this.navService.OpenEntityRecord('MJ_BizApps_Referrals: Professional Profiles', CompositeKey.FromID(id));
  }

  async GetResourceDisplayName(_data: ResourceData): Promise<string> {
    return 'Reciprocity Scorecard';
  }

  async GetResourceIconClass(_data: ResourceData): Promise<string> {
    return 'fa-solid fa-arrows-rotate';
  }
}
