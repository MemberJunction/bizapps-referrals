import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  inject,
} from '@angular/core';
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
  DomainVocabulary,
  VOCABULARY_PRESETS,
  VocabularyService,
} from '@mj-biz-apps/referrals-core';
import {
  JurisdictionEntity,
  PracticeAreaEntity,
  ProfessionalJurisdictionEntity,
  ProfessionalPracticeAreaEntity,
  ProfessionalProfileEntity,
  ReferralAssignmentEntity,
  ReferralFeedbackEntity,
  ReferralRequestEntity,
} from '@mj-biz-apps/referrals-entities';

export interface SlaDistributionBucket {
  Label: string;
  Count: number;
  Percentage: number;
}

export interface FunnelStage {
  StageName: string;
  Count: number;
  Rate: number;
}

export interface GallerySupplyDemandRow {
  PracticeArea: string;
  Jurisdiction: string;
  RequestsCount: number;
  AvailablePros: number;
  Status: 'Deficit' | 'Balanced' | 'Surplus';
}

export interface PracticeAreaDemandBar {
  Name: string;
  Category: string;
  RequestCount: number;
  ProCount: number;
  SharePct: number;
}

export interface MatchQualityBucket {
  Label: string;
  Count: number;
  Percentage: number;
  Color: string;
}

export interface PartnerPayoutRow {
  ProfileID: string;
  DisplayName: string;
  FirmName: string;
  AcceptedCount: number;
  CompletedCount: number;
  AverageResponseHours: number | null;
  AverageRating: number | null;
  HourlyRateMin: number | null;
  HourlyRateMax: number | null;
  EstimatedVolume: number;
}

export type DomainFilterKey = 'All' | keyof typeof VOCABULARY_PRESETS;

@RegisterClass(BaseResourceComponent, 'ReferralsReportGalleryResource')
@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MJPageLayoutComponent,
    MJPageHeaderComponent,
    MJPageBodyComponent,
  ],
  selector: 'mj-referrals-report-gallery',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    .report-gallery {
      padding: var(--mj-space-6, 1.5rem);
      display: flex;
      flex-direction: column;
      gap: var(--mj-space-6, 1.5rem);
      background: var(--mj-bg-page);
      color: var(--mj-text-primary);
      font-family: var(--mj-font-family, inherit);
      min-height: 100%;
    }
    .toolbar-group {
      display: flex;
      gap: var(--mj-space-3, 0.75rem);
      align-items: center;
      flex-wrap: wrap;
    }
    .domain-select {
      padding: var(--mj-space-1-5, 0.375rem) var(--mj-space-3, 0.75rem);
      border-radius: var(--mj-radius-md, 6px);
      border: 1px solid var(--mj-border-default);
      background: var(--mj-bg-surface);
      color: var(--mj-text-primary);
      font-family: var(--mj-font-family, inherit);
      font-size: 0.82rem;
      font-weight: 600;
    }
    .domain-select:focus-visible {
      outline: 2px solid var(--mj-border-focus);
      outline-offset: 2px;
    }
    .filter-pills {
      display: flex;
      gap: var(--mj-space-1-5, 0.4rem);
      align-items: center;
    }
    .filter-btn {
      padding: var(--mj-space-1-5, 0.375rem) var(--mj-space-3, 0.75rem);
      border-radius: var(--mj-radius-md, 6px);
      font-family: var(--mj-font-family, inherit);
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      border: 1px solid var(--mj-border-default);
      background: var(--mj-bg-surface);
      color: var(--mj-text-secondary);
      transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
    }
    .filter-btn:hover {
      background: var(--mj-bg-surface-hover);
      color: var(--mj-text-primary);
    }
    .filter-btn:focus-visible {
      outline: 2px solid var(--mj-border-focus);
      outline-offset: 2px;
    }
    .filter-btn.active {
      background: var(--mj-brand-primary);
      color: var(--mj-brand-on-primary, var(--mj-text-inverse));
      border-color: var(--mj-brand-primary);
    }
    .filter-btn.active:hover {
      background: var(--mj-brand-primary-hover);
      border-color: var(--mj-brand-primary-hover);
    }
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
      gap: var(--mj-space-4, 1rem);
    }
    .kpi-card {
      background: var(--mj-bg-surface-card);
      border: 1px solid var(--mj-border-default);
      border-radius: var(--mj-radius-lg, 8px);
      box-shadow: var(--mj-shadow-sm);
      padding: var(--mj-space-4, 1.1rem);
      display: flex;
      flex-direction: column;
      gap: var(--mj-space-1, 0.25rem);
    }
    .kpi-label {
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--mj-text-muted);
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }
    .kpi-value {
      font-size: 1.6rem;
      font-weight: 700;
      color: var(--mj-text-primary);
    }
    .kpi-sub {
      font-size: 0.74rem;
      color: var(--mj-status-success-text, var(--mj-status-success));
    }
    .charts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(420px, 1fr));
      gap: var(--mj-space-5, 1.25rem);
    }
    .chart-panel {
      background: var(--mj-bg-surface-card);
      border: 1px solid var(--mj-border-default);
      border-radius: var(--mj-radius-lg, 8px);
      box-shadow: var(--mj-shadow-sm);
      padding: var(--mj-space-5, 1.25rem);
      display: flex;
      flex-direction: column;
      gap: var(--mj-space-4, 1rem);
    }
    .panel-heading {
      margin: 0;
      font-size: 1rem;
      font-weight: 700;
      color: var(--mj-text-primary);
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: var(--mj-space-2, 0.5rem);
    }
    .panel-sub {
      font-size: 0.75rem;
      color: var(--mj-text-muted);
      font-weight: 500;
    }
    .bar-row {
      display: flex;
      flex-direction: column;
      gap: var(--mj-space-1, 0.25rem);
      margin-bottom: var(--mj-space-2-5, 0.65rem);
    }
    .bar-label-group {
      display: flex;
      justify-content: space-between;
      font-size: 0.8rem;
      color: var(--mj-text-secondary);
    }
    .bar-track {
      height: 8px;
      background: var(--mj-bg-surface-sunken);
      border-radius: var(--mj-radius-full, 999px);
      overflow: hidden;
    }
    .bar-fill {
      height: 100%;
      border-radius: var(--mj-radius-full, 999px);
      background: var(--mj-brand-primary);
      transition: width 0.3s ease;
    }
    .bar-fill--success {
      background: var(--mj-status-success);
    }
    .bar-fill--accent {
      background: var(--mj-brand-tertiary, var(--mj-brand-accent, var(--mj-brand-primary)));
    }
    .table-container {
      overflow-x: auto;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.85rem;
    }
    th, td {
      padding: var(--mj-space-2-5, 0.65rem) var(--mj-space-3-5, 0.85rem);
      text-align: left;
      border-bottom: 1px solid var(--mj-border-subtle);
      color: var(--mj-text-primary);
    }
    th {
      font-weight: 600;
      color: var(--mj-text-secondary);
      background: var(--mj-bg-surface-sunken);
    }
    tbody tr:hover {
      background: var(--mj-bg-surface-hover);
    }
    .status-badge {
      display: inline-block;
      padding: var(--mj-space-0-5, 0.2rem) var(--mj-space-2, 0.5rem);
      border-radius: var(--mj-radius-full, 999px);
      font-size: 0.72rem;
      font-weight: 700;
    }
    .status-badge.deficit {
      background: var(--mj-status-error-bg, color-mix(in srgb, var(--mj-status-error) 12%, transparent));
      color: var(--mj-status-error-text, var(--mj-status-error));
    }
    .status-badge.balanced {
      background: var(--mj-status-success-bg, color-mix(in srgb, var(--mj-status-success) 12%, transparent));
      color: var(--mj-status-success-text, var(--mj-status-success));
    }
    .status-badge.surplus {
      background: var(--mj-status-info-bg, color-mix(in srgb, var(--mj-status-info) 12%, transparent));
      color: var(--mj-status-info-text, var(--mj-status-info));
    }
    .link-btn {
      background: none;
      border: none;
      padding: 0;
      color: var(--mj-text-link, var(--mj-brand-primary));
      font-family: var(--mj-font-family, inherit);
      font-weight: 600;
      cursor: pointer;
      text-align: left;
    }
    .link-btn:hover {
      color: var(--mj-text-link-hover, var(--mj-brand-primary-hover));
      text-decoration: underline;
    }
    .category-chip {
      display: inline-block;
      padding: 0.15rem 0.45rem;
      border-radius: var(--mj-radius-sm, 4px);
      font-size: 0.7rem;
      font-weight: 600;
      background: var(--mj-bg-surface-sunken);
      color: var(--mj-text-secondary);
      border: 1px solid var(--mj-border-subtle);
    }
  `],
  template: `
    <mj-page-layout>
      <mj-page-header Title="Referrals Report Gallery" Icon="fa-solid fa-chart-pie">
        <div class="toolbar-group">
          <select
            class="domain-select"
            [ngModel]="SelectedDomain"
            (ngModelChange)="SetDomain($event)"
            aria-label="Filter by domain vocabulary">
            <option value="All">All Domains</option>
            <option value="Consulting">IT &amp; Tech Consulting</option>
            <option value="Legal">Legal</option>
            <option value="Medical">Medical &amp; Healthcare</option>
            <option value="Accounting">Accounting &amp; Tax</option>
          </select>
          <div class="filter-pills">
            <button type="button" class="filter-btn" [class.active]="SelectedPeriod === '30d'" (click)="SetPeriod('30d')">Last 30 Days</button>
            <button type="button" class="filter-btn" [class.active]="SelectedPeriod === '90d'" (click)="SetPeriod('90d')">Quarter</button>
            <button type="button" class="filter-btn" [class.active]="SelectedPeriod === 'all'" (click)="SetPeriod('all')">All Time</button>
            <button type="button" class="filter-btn" (click)="Refresh()">Refresh</button>
          </div>
        </div>
      </mj-page-header>
      <mj-page-body>
        <div class="report-gallery">
          <section class="kpi-grid">
            <div class="kpi-card">
              <span class="kpi-label">Total {{ Vocab.MatterLabel }} Intakes</span>
              <span class="kpi-value">{{ TotalRequests }}</span>
              <span class="kpi-sub">{{ CompletedRequests }} completed engagements</span>
            </div>
            <div class="kpi-card">
              <span class="kpi-label">Offer Acceptance Rate</span>
              <span class="kpi-value">{{ AcceptanceRate }}%</span>
              <span class="kpi-sub">Target: &ge; 80%</span>
            </div>
            <div class="kpi-card">
              <span class="kpi-label">Median Response SLA</span>
              <span class="kpi-value">{{ MedianResponseHours }}h</span>
              <span class="kpi-sub">Conflict clearance: {{ ConflictClearanceRate }}%</span>
            </div>
            <div class="kpi-card">
              <span class="kpi-label">Avg Semantic Match</span>
              <span class="kpi-value">{{ AverageMatchScore }}%</span>
              <span class="kpi-sub">{{ TotalAssignments }} routing evaluations</span>
            </div>
            <div class="kpi-card">
              <span class="kpi-label">Average Satisfaction</span>
              <span class="kpi-value">{{ AverageRating }} / 5.0</span>
              <span class="kpi-sub">Based on {{ FeedbackCount }} reviews</span>
            </div>
          </section>

          <section class="charts-grid">
            <!-- SLA Response Distribution -->
            <div class="chart-panel">
              <h3 class="panel-heading">
                <span>Response SLA Compliance</span>
                <span class="panel-sub">Target SLA: 24h</span>
              </h3>
              <div>
                @for (bucket of SlaDistribution; track bucket.Label) {
                  <div class="bar-row">
                    <div class="bar-label-group">
                      <span>{{ bucket.Label }}</span>
                      <span>{{ bucket.Count }} ({{ bucket.Percentage }}%)</span>
                    </div>
                    <div class="bar-track">
                      <div class="bar-fill" [style.width.%]="bucket.Percentage"></div>
                    </div>
                  </div>
                }
              </div>
            </div>

            <!-- Cascade Conversion Funnel -->
            <div class="chart-panel">
              <h3 class="panel-heading">
                <span>Cascade Conversion Funnel</span>
                <span class="panel-sub">Intake &rarr; Retention</span>
              </h3>
              <div>
                @for (stage of CascadeFunnel; track stage.StageName) {
                  <div class="bar-row">
                    <div class="bar-label-group">
                      <span>{{ stage.StageName }}</span>
                      <span>{{ stage.Count }} ({{ stage.Rate }}%)</span>
                    </div>
                    <div class="bar-track">
                      <div class="bar-fill bar-fill--success" [style.width.%]="stage.Rate"></div>
                    </div>
                  </div>
                }
              </div>
            </div>

            <!-- Practice Area Demand -->
            <div class="chart-panel">
              <h3 class="panel-heading">
                <span>{{ Vocab.PracticeAreaLabel }} Demand</span>
                <span class="panel-sub">{{ PracticeAreaBars.length }} Active Specialties</span>
              </h3>
              <div>
                @for (pa of PracticeAreaBars; track pa.Name) {
                  <div class="bar-row">
                    <div class="bar-label-group">
                      <span>
                        {{ pa.Name }}
                        <span class="category-chip">{{ pa.Category }}</span>
                      </span>
                      <span>{{ pa.RequestCount }} req / {{ pa.ProCount }} {{ Vocab.ProfessionalPluralLabel }}</span>
                    </div>
                    <div class="bar-track">
                      <div class="bar-fill bar-fill--accent" [style.width.%]="pa.SharePct"></div>
                    </div>
                  </div>
                }
              </div>
            </div>

            <!-- Semantic Match Quality -->
            <div class="chart-panel">
              <h3 class="panel-heading">
                <span>Semantic Match Quality</span>
                <span class="panel-sub">Avg Score: {{ AverageMatchScore }}%</span>
              </h3>
              <div>
                @for (mq of MatchQualityBuckets; track mq.Label) {
                  <div class="bar-row">
                    <div class="bar-label-group">
                      <span>{{ mq.Label }}</span>
                      <span>{{ mq.Count }} ({{ mq.Percentage }}%)</span>
                    </div>
                    <div class="bar-track">
                      <div class="bar-fill" [style.width.%]="mq.Percentage" [style.background]="mq.Color"></div>
                    </div>
                  </div>
                }
              </div>
            </div>
          </section>

          <!-- Partner Payout & Performance Ledger -->
          <section class="chart-panel">
            <h3 class="panel-heading">
              <span>Partner Payout &amp; Engagement Ledger</span>
              <span class="panel-sub">{{ PartnerPayoutRows.length }} Verified {{ Vocab.ProfessionalPluralLabel }}</span>
            </h3>
            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th>{{ Vocab.ProfessionalLabel }}</th>
                    <th>Organization / Firm</th>
                    <th>Accepted</th>
                    <th>Completed</th>
                    <th>Avg SLA</th>
                    <th>Rating</th>
                    <th>Rate Range</th>
                    <th>Est. Engagement Volume</th>
                  </tr>
                </thead>
                <tbody>
                  @for (partner of PartnerPayoutRows; track partner.ProfileID) {
                    <tr>
                      <td>
                        <button type="button" class="link-btn" (click)="OpenProfile(partner.ProfileID)">
                          {{ partner.DisplayName }}
                        </button>
                      </td>
                      <td>{{ partner.FirmName }}</td>
                      <td>{{ partner.AcceptedCount }}</td>
                      <td>{{ partner.CompletedCount }}</td>
                      <td>{{ partner.AverageResponseHours != null ? (partner.AverageResponseHours + 'h') : '—' }}</td>
                      <td>{{ partner.AverageRating != null ? (partner.AverageRating + ' / 5.0') : '—' }}</td>
                      <td>
                        @if (partner.HourlyRateMin != null && partner.HourlyRateMax != null) {
                          \${{ partner.HourlyRateMin }}–\${{ partner.HourlyRateMax }}/hr
                        } @else {
                          —
                        }
                      </td>
                      <td style="font-weight: 700;">\${{ partner.EstimatedVolume | number:'1.0-0' }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </section>

          <!-- Supply-Demand Equilibrium Matrix -->
          <section class="chart-panel">
            <h3 class="panel-heading">
              <span>Supply &amp; Demand Equilibrium Matrix</span>
              <span class="panel-sub">{{ SupplyDemandRows.length }} Segments Monitored</span>
            </h3>
            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th>{{ Vocab.PracticeAreaLabel }}</th>
                    <th>{{ Vocab.JurisdictionLabel }}</th>
                    <th>Intake Requests</th>
                    <th>Available {{ Vocab.ProfessionalPluralLabel }}</th>
                    <th>Supply Status</th>
                  </tr>
                </thead>
                <tbody>
                  @for (row of SupplyDemandRows; track row.PracticeArea + ':' + row.Jurisdiction) {
                    <tr>
                      <td style="font-weight: 600;">{{ row.PracticeArea }}</td>
                      <td>{{ row.Jurisdiction }}</td>
                      <td>{{ row.RequestsCount }}</td>
                      <td>{{ row.AvailablePros }}</td>
                      <td>
                        <span class="status-badge" [ngClass]="row.Status.toLowerCase()">
                          {{ row.Status }}
                        </span>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </mj-page-body>
    </mj-page-layout>
  `,
})
export class ReferralsReportGalleryComponent extends BaseResourceComponent implements OnInit {
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly navService = inject(NavigationService);
  public Vocab: DomainVocabulary = VocabularyService.Instance.Current;

  public SelectedDomain: DomainFilterKey = 'All';
  public SelectedPeriod: '30d' | '90d' | 'all' = 'all';

  public TotalRequests = 0;
  public CompletedRequests = 0;
  public AcceptanceRate = 0;
  public MedianResponseHours = 0;
  public AverageRating = 0;
  public FeedbackCount = 0;
  public AverageMatchScore = 0;
  public TotalAssignments = 0;
  public ConflictClearanceRate = 100;

  public SlaDistribution: SlaDistributionBucket[] = [];
  public CascadeFunnel: FunnelStage[] = [];
  public PracticeAreaBars: PracticeAreaDemandBar[] = [];
  public MatchQualityBuckets: MatchQualityBucket[] = [];
  public PartnerPayoutRows: PartnerPayoutRow[] = [];
  public SupplyDemandRows: GallerySupplyDemandRow[] = [];

  private _cachedRequests: ReferralRequestEntity[] = [];
  private _cachedAssignments: ReferralAssignmentEntity[] = [];
  private _cachedFeedbacks: ReferralFeedbackEntity[] = [];
  private _cachedProfiles: ProfessionalProfileEntity[] = [];
  private _cachedPracticeAreas: PracticeAreaEntity[] = [];
  private _cachedJurisdictions: JurisdictionEntity[] = [];
  private _cachedProPracticeAreas: ProfessionalPracticeAreaEntity[] = [];
  private _cachedProJurisdictions: ProfessionalJurisdictionEntity[] = [];

  async ngOnInit(): Promise<void> {
    super.ngOnInit();
    await this.LoadRealTelemetry();
    this.NotifyLoadComplete();
    this.cdr.markForCheck();
  }

  public async Refresh(): Promise<void> {
    await this.LoadRealTelemetry();
    this.cdr.markForCheck();
  }

  public SetDomain(domain: DomainFilterKey): void {
    this.SelectedDomain = domain;
    if (domain !== 'All' && domain in VOCABULARY_PRESETS) {
      this.Vocab = { ...VOCABULARY_PRESETS[domain] };
    } else {
      this.Vocab = VocabularyService.Instance.Current;
    }
    this.ComputeMetricsFromCache();
    this.cdr.markForCheck();
  }

  public SetPeriod(p: '30d' | '90d' | 'all'): void {
    this.SelectedPeriod = p;
    this.ComputeMetricsFromCache();
    this.cdr.markForCheck();
  }

  public OpenProfile(profileId: string): void {
    this.navService.OpenEntityRecord(
      'MJ_BizApps_Referrals: Professional Profiles',
      CompositeKey.FromID(profileId),
    );
  }

  async GetResourceDisplayName(_data: ResourceData): Promise<string> {
    return 'Report Gallery';
  }

  async GetResourceIconClass(_data: ResourceData): Promise<string> {
    return 'fa-solid fa-chart-pie';
  }

  public async LoadRealTelemetry(): Promise<void> {
    try {
      const rv = new RunView();
      const md = new Metadata();
      const user = md.CurrentUser;
      const [reqRes, assignRes, fbRes, proRes, paRes, jurRes, ppaRes, pjurRes] = await Promise.all([
        rv.RunView<ReferralRequestEntity>(
          { EntityName: 'MJ_BizApps_Referrals: Referral Requests', ResultType: 'entity_object' },
          user,
        ),
        rv.RunView<ReferralAssignmentEntity>(
          { EntityName: 'MJ_BizApps_Referrals: Referral Assignments', ResultType: 'entity_object' },
          user,
        ),
        rv.RunView<ReferralFeedbackEntity>(
          { EntityName: 'MJ_BizApps_Referrals: Referral Feedbacks', ResultType: 'entity_object' },
          user,
        ),
        rv.RunView<ProfessionalProfileEntity>(
          { EntityName: 'MJ_BizApps_Referrals: Professional Profiles', ResultType: 'entity_object' },
          user,
        ),
        rv.RunView<PracticeAreaEntity>(
          { EntityName: 'MJ_BizApps_Referrals: Practice Areas', ResultType: 'entity_object' },
          user,
        ),
        rv.RunView<JurisdictionEntity>(
          { EntityName: 'MJ_BizApps_Referrals: Jurisdictions', ResultType: 'entity_object' },
          user,
        ),
        rv.RunView<ProfessionalPracticeAreaEntity>(
          { EntityName: 'MJ_BizApps_Referrals: Professional Practice Areas', ResultType: 'entity_object' },
          user,
        ),
        rv.RunView<ProfessionalJurisdictionEntity>(
          { EntityName: 'MJ_BizApps_Referrals: Professional Jurisdictions', ResultType: 'entity_object' },
          user,
        ),
      ]);

      if (reqRes.Success) this._cachedRequests = reqRes.Results;
      if (assignRes.Success) this._cachedAssignments = assignRes.Results;
      if (fbRes.Success) this._cachedFeedbacks = fbRes.Results;
      if (proRes.Success) this._cachedProfiles = proRes.Results;
      if (paRes.Success) this._cachedPracticeAreas = paRes.Results;
      if (jurRes.Success) this._cachedJurisdictions = jurRes.Results;
      if (ppaRes.Success) this._cachedProPracticeAreas = ppaRes.Results;
      if (pjurRes.Success) this._cachedProJurisdictions = pjurRes.Results;

      this.ComputeMetricsFromCache();
    } catch {
      // Graceful telemetry fallback
    }
  }

  private MatchesDomainCategory(category: string | null): boolean {
    if (this.SelectedDomain === 'All') return true;
    const cat = (category ?? '').toLowerCase();
    switch (this.SelectedDomain) {
      case 'Consulting':
        return cat.includes('it') || cat.includes('tech') || cat.includes('cloud') || cat.includes('cyber') || cat.includes('ai') || cat.includes('consult');
      case 'Legal':
        return cat.includes('legal');
      case 'Medical':
        return cat.includes('medical') || cat.includes('health');
      case 'Accounting':
        return cat.includes('account') || cat.includes('tax') || cat.includes('finance');
      default:
        return true;
    }
  }

  private ComputeMetricsFromCache(): void {
    const now = Date.now();
    const periodDays = this.SelectedPeriod === '30d' ? 30 : this.SelectedPeriod === '90d' ? 90 : Infinity;
    const cutoff = periodDays === Infinity ? 0 : now - periodDays * 24 * 60 * 60 * 1000;

    const paById = new Map<string, PracticeAreaEntity>();
    for (const pa of this._cachedPracticeAreas) {
      paById.set(pa.ID.toLowerCase(), pa);
    }
    const jurById = new Map<string, JurisdictionEntity>();
    for (const j of this._cachedJurisdictions) {
      jurById.set(j.ID.toLowerCase(), j);
    }

    const filteredPracticeAreas = this._cachedPracticeAreas.filter((pa) => this.MatchesDomainCategory(pa.Category));
    const allowedPaIds = new Set(filteredPracticeAreas.map((pa) => pa.ID.toLowerCase()));

    const filteredRequests = this._cachedRequests.filter((r) => {
      const d = r.SubmittedAt ? new Date(r.SubmittedAt).getTime() : now;
      const inPeriod = d >= cutoff;
      const inDomain = this.SelectedDomain === 'All' || allowedPaIds.has(r.PracticeAreaID.toLowerCase());
      return inPeriod && inDomain;
    });

    const activeReqIds = new Set(filteredRequests.map((r) => r.ID.toLowerCase()));
    const filteredAssignments = this._cachedAssignments.filter((a) =>
      activeReqIds.has(a.ReferralRequestID.toLowerCase()),
    );
    const filteredFb = this._cachedFeedbacks.filter((f) =>
      activeReqIds.has(f.ReferralRequestID.toLowerCase()),
    );

    this.TotalRequests = filteredRequests.length;
    this.CompletedRequests = filteredRequests.filter((r) => r.Status === 'Completed').length;
    this.TotalAssignments = filteredAssignments.length;

    if (this.TotalRequests > 0) {
      const accepted = filteredRequests.filter(
        (r) => r.Status === 'Accepted' || r.Status === 'InProgress' || r.Status === 'Completed',
      ).length;
      this.AcceptanceRate = Math.round((accepted / this.TotalRequests) * 1000) / 10;

      const offered = filteredRequests.filter((r) => r.Status !== 'Draft').length;
      const firstStepAccepted = filteredAssignments.filter(
        (a) => a.Status === 'Accepted' && a.CascadeOrder === 1,
      ).length;
      const cascaded = filteredAssignments.filter((a) => a.CascadeOrder > 1).length;

      this.CascadeFunnel = [
        { StageName: 'Intake Submitted', Count: this.TotalRequests, Rate: 100 },
        { StageName: 'Matched & Offered', Count: offered, Rate: Math.round((offered / this.TotalRequests) * 1000) / 10 },
        { StageName: 'First Offer Accepted', Count: firstStepAccepted, Rate: Math.round((firstStepAccepted / this.TotalRequests) * 1000) / 10 },
        { StageName: 'Second Step Cascaded', Count: cascaded, Rate: Math.round((cascaded / this.TotalRequests) * 1000) / 10 },
        { StageName: 'Completed Retained', Count: this.CompletedRequests, Rate: Math.round((this.CompletedRequests / this.TotalRequests) * 1000) / 10 },
      ];
    } else {
      this.AcceptanceRate = 0;
      this.CascadeFunnel = [];
    }

    // SLA Distribution & Median
    const responseDurations: number[] = [];
    for (const a of filteredAssignments) {
      if (a.RespondedAt && a.OfferedAt) {
        const diffHours = (new Date(a.RespondedAt).getTime() - new Date(a.OfferedAt).getTime()) / (1000 * 60 * 60);
        if (diffHours >= 0) responseDurations.push(diffHours);
      }
    }

    if (responseDurations.length > 0) {
      responseDurations.sort((a, b) => a - b);
      const mid = Math.floor(responseDurations.length / 2);
      this.MedianResponseHours =
        responseDurations.length % 2 !== 0
          ? Math.round(responseDurations[mid] * 10) / 10
          : Math.round(((responseDurations[mid - 1] + responseDurations[mid]) / 2) * 10) / 10;

      const b1 = responseDurations.filter((h) => h < 1).length;
      const b2 = responseDurations.filter((h) => h >= 1 && h <= 4).length;
      const b3 = responseDurations.filter((h) => h > 4 && h <= 24).length;
      const b4 = responseDurations.filter((h) => h > 24).length;
      const totalA = responseDurations.length;

      this.SlaDistribution = [
        { Label: '< 1 Hour (Ultra-Fast)', Count: b1, Percentage: Math.round((b1 / totalA) * 1000) / 10 },
        { Label: '1 - 4 Hours (Target)', Count: b2, Percentage: Math.round((b2 / totalA) * 1000) / 10 },
        { Label: '4 - 24 Hours (Standard)', Count: b3, Percentage: Math.round((b3 / totalA) * 1000) / 10 },
        { Label: '> 24 Hours (Delayed)', Count: b4, Percentage: Math.round((b4 / totalA) * 1000) / 10 },
      ];
    } else {
      this.MedianResponseHours = 0;
      this.SlaDistribution = [];
    }

    // Semantic Match Quality & Conflict Clearance
    if (filteredAssignments.length > 0) {
      const scores = filteredAssignments.map((a) => a.MatchScore ?? 0);
      this.AverageMatchScore = Math.round((scores.reduce((s, v) => s + v, 0) / scores.length) * 10) / 10;
      const cleared = filteredAssignments.filter((a) => a.ConflictStatus === 'Cleared' || a.ConflictStatus === 'Waived').length;
      this.ConflictClearanceRate = Math.round((cleared / filteredAssignments.length) * 1000) / 10;

      const q90 = scores.filter((s) => s >= 90).length;
      const q75 = scores.filter((s) => s >= 75 && s < 90).length;
      const q60 = scores.filter((s) => s >= 60 && s < 75).length;
      const qLow = scores.filter((s) => s < 60).length;
      const totalS = scores.length;

      this.MatchQualityBuckets = [
        { Label: '90 - 100% (Exact Specialty + SLA Fit)', Count: q90, Percentage: Math.round((q90 / totalS) * 1000) / 10, Color: 'var(--mj-status-success)' },
        { Label: '75 - 89% (Strong Match)', Count: q75, Percentage: Math.round((q75 / totalS) * 1000) / 10, Color: 'var(--mj-status-info)' },
        { Label: '60 - 74% (Moderate Match)', Count: q60, Percentage: Math.round((q60 / totalS) * 1000) / 10, Color: 'var(--mj-status-warning)' },
        { Label: '< 60% (Fallback Candidate)', Count: qLow, Percentage: Math.round((qLow / totalS) * 1000) / 10, Color: 'var(--mj-status-error)' },
      ];
    } else {
      this.AverageMatchScore = 0;
      this.ConflictClearanceRate = 100;
      this.MatchQualityBuckets = [];
    }

    // Feedback / Satisfaction
    this.FeedbackCount = filteredFb.length;
    if (filteredFb.length > 0) {
      const sum = filteredFb.reduce((acc, curr) => acc + (curr.Rating || 5), 0);
      this.AverageRating = Math.round((sum / filteredFb.length) * 100) / 100;
    } else {
      this.AverageRating = 0;
    }

    // Practice Area Demand Bars
    const maxReqCount = Math.max(
      1,
      ...filteredPracticeAreas.map(
        (pa) => filteredRequests.filter((r) => r.PracticeAreaID.toLowerCase() === pa.ID.toLowerCase()).length,
      ),
    );
    this.PracticeAreaBars = filteredPracticeAreas
      .map((pa) => {
        const reqCount = filteredRequests.filter((r) => r.PracticeAreaID.toLowerCase() === pa.ID.toLowerCase()).length;
        const proCount = this._cachedProPracticeAreas.filter(
          (ppa) => ppa.PracticeAreaID.toLowerCase() === pa.ID.toLowerCase(),
        ).length;
        return {
          Name: pa.Name,
          Category: pa.Category ?? 'General',
          RequestCount: reqCount,
          ProCount: proCount,
          SharePct: Math.round((reqCount / maxReqCount) * 1000) / 10,
        };
      })
      .filter((b) => b.RequestCount > 0 || b.ProCount > 0)
      .sort((a, b) => b.RequestCount - a.RequestCount || b.ProCount - a.ProCount);

    // Partner Payout & Engagement Ledger
    const domainProIds = new Set(
      this._cachedProPracticeAreas
        .filter((ppa) => allowedPaIds.has(ppa.PracticeAreaID.toLowerCase()))
        .map((ppa) => ppa.ProfessionalProfileID.toLowerCase()),
    );
    this.PartnerPayoutRows = this._cachedProfiles
      .filter((p) => p.IsActive && (this.SelectedDomain === 'All' || domainProIds.has(p.ID.toLowerCase())))
      .map((p) => {
        const midRate =
          p.HourlyRateMin != null && p.HourlyRateMax != null
            ? (p.HourlyRateMin + p.HourlyRateMax) / 2
            : p.HourlyRateMin ?? p.HourlyRateMax ?? 350;
        const estHours = (p.TotalCompletedCount || 0) * 12 + (p.TotalAcceptedCount || 0) * 4;
        return {
          ProfileID: p.ID,
          DisplayName: p.DisplayName,
          FirmName: p.FirmName ?? 'Independent',
          AcceptedCount: p.TotalAcceptedCount,
          CompletedCount: p.TotalCompletedCount,
          AverageResponseHours: p.AverageResponseHours,
          AverageRating: p.AverageRating,
          HourlyRateMin: p.HourlyRateMin,
          HourlyRateMax: p.HourlyRateMax,
          EstimatedVolume: Math.round(estHours * midRate),
        };
      })
      .sort((a, b) => b.EstimatedVolume - a.EstimatedVolume)
      .slice(0, 12);

    // Supply & Demand Equilibrium Matrix
    const segmentMap = new Map<string, { paId: string; jurId: string; requests: number }>();
    for (const r of filteredRequests) {
      const key = `${r.PracticeAreaID.toLowerCase()}:${r.JurisdictionID.toLowerCase()}`;
      const existing = segmentMap.get(key);
      if (existing) {
        existing.requests += 1;
      } else {
        segmentMap.set(key, { paId: r.PracticeAreaID.toLowerCase(), jurId: r.JurisdictionID.toLowerCase(), requests: 1 });
      }
    }

    const activeProIds = new Set(
      this._cachedProfiles
        .filter((p) => p.IsActive && p.VerificationStatus === 'Verified' && p.AvailabilityStatus !== 'Unavailable')
        .map((p) => p.ID.toLowerCase()),
    );

    this.SupplyDemandRows = Array.from(segmentMap.values())
      .map((seg) => {
        const prosInPa = new Set(
          this._cachedProPracticeAreas
            .filter((ppa) => ppa.PracticeAreaID.toLowerCase() === seg.paId && activeProIds.has(ppa.ProfessionalProfileID.toLowerCase()))
            .map((ppa) => ppa.ProfessionalProfileID.toLowerCase()),
        );
        const availablePros = this._cachedProJurisdictions.filter(
          (pj) => pj.JurisdictionID.toLowerCase() === seg.jurId && prosInPa.has(pj.ProfessionalProfileID.toLowerCase()),
        ).length;
        const status: 'Deficit' | 'Balanced' | 'Surplus' =
          availablePros === 0 || seg.requests > availablePros * 2
            ? 'Deficit'
            : availablePros >= seg.requests + 2
              ? 'Surplus'
              : 'Balanced';
        return {
          PracticeArea: paById.get(seg.paId)?.Name ?? 'Unknown',
          Jurisdiction: jurById.get(seg.jurId)?.Name ?? 'Unknown',
          RequestsCount: seg.requests,
          AvailablePros: availablePros,
          Status: status,
        };
      })
      .sort((a, b) => b.RequestsCount - a.RequestsCount);
  }
}
