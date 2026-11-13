import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CompositeKey, Metadata, RunView } from '@memberjunction/core';
import { UserInfoEngine } from '@memberjunction/core-entities';
import { RegisterClassEx } from '@memberjunction/global';
import { BaseFormPanel } from '@memberjunction/ng-base-forms';
import { NavigationService } from '@memberjunction/ng-shared';
import { CascadeRoutingService } from '@mj-biz-apps/referrals-core';
import {
  ProfessionalProfileEntity,
  ReferralAssignmentEntity,
  ReferralRequestEntity,
} from '@mj-biz-apps/referrals-entities';

const HERO_PANEL_STYLES = `
  .mj-referrals-hero {
    background: var(--mj-bg-surface-card, var(--mj-bg-surface));
    border: 1px solid var(--mj-border-default);
    border-radius: var(--mj-radius-md, 8px);
    padding: 1rem 1.2rem;
    margin-bottom: 1rem;
    color: var(--mj-text-primary);
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  .hero-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
  }
  .hero-title { margin: 0; font-size: 1rem; font-weight: 700; color: var(--mj-text-primary); }
  .hero-sub { font-size: 0.8rem; color: var(--mj-text-secondary); }
  .hero-actions { display: flex; gap: 0.5rem; align-items: center; }
  .status-pill {
    padding: 0.16rem 0.55rem;
    border-radius: 999px;
    font-size: 0.74rem;
    font-weight: 700;
    background: var(--mj-status-info-bg);
    color: var(--mj-status-info-text);
  }
  .status-pill[data-tone="success"] {
    background: var(--mj-status-success-bg);
    color: var(--mj-status-success-text);
  }
  .status-pill[data-tone="warning"] {
    background: var(--mj-status-warning-bg);
    color: var(--mj-status-warning-text);
  }
  .status-pill[data-tone="error"] {
    background: var(--mj-status-error-bg);
    color: var(--mj-status-error-text);
  }
  .hero-metrics {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.6rem;
  }
  .metric-tile {
    background: var(--mj-bg-surface);
    border: 1px solid var(--mj-border-default);
    border-radius: var(--mj-radius-sm, 6px);
    padding: 0.55rem 0.7rem;
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
  }
  .metric-label { font-size: 0.72rem; color: var(--mj-text-secondary); }
  .metric-val { font-size: 0.92rem; font-weight: 700; color: var(--mj-text-primary); }
  .btn-sm {
    background: var(--mj-bg-surface);
    color: var(--mj-text-primary);
    border: 1px solid var(--mj-border-default);
    border-radius: var(--mj-radius-sm, 6px);
    padding: 0.35rem 0.7rem;
    font-size: 0.8rem;
    cursor: pointer;
  }
  .btn-sm.primary {
    background: var(--mj-brand-primary);
    color: var(--mj-text-inverse);
    border-color: var(--mj-brand-primary);
  }
`;

@RegisterClassEx(BaseFormPanel, {
  key: 'referrals:referral-request-hero-panel',
  skipNullKeyWarning: true,
  metadata: {
    entity: 'MJ_BizApps_Referrals: Referral Requests',
    slot: 'before-fields',
    sortKey: 5,
    contributionKey: 'referrals-request-hero',
  },
})
@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'mj-referral-request-hero-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [HERO_PANEL_STYLES],
  template: `
    @if (TypedRecord; as req) {
      <section class="mj-referrals-hero" aria-label="Referral Request Cascade Summary">
        <div class="hero-header">
          <div>
            <h3 class="hero-title">{{ req.RequestNumber || 'New Request' }} — {{ req.MatterTitle }}</h3>
            <div class="hero-sub">Seeker: {{ req.SeekerName }} ({{ req.SeekerEmail }})</div>
          </div>
          <div class="hero-actions">
            <span class="status-pill" [attr.data-tone]="StatusTone(req.Status)">{{ req.Status }}</span>
            <button type="button" class="btn-sm" (click)="ToggleExpanded()">
              {{ Expanded ? 'Compact' : 'Details' }}
            </button>
            @if (req.ID && (req.Status === 'Draft' || req.Status === 'Submitted')) {
              <button type="button" class="btn-sm primary" (click)="TriggerCascade(req.ID)" [disabled]="IsRouting">
                {{ IsRouting ? 'Routing...' : 'Run Cascade' }}
              </button>
            }
          </div>
        </div>
        @if (Expanded) {
          <div class="hero-metrics">
            <div class="metric-tile">
              <span class="metric-label">Cascade Step</span>
              <span class="metric-val">#{{ req.CurrentCascadeStep }}</span>
            </div>
            <div class="metric-tile">
              <span class="metric-label">Urgency</span>
              <span class="metric-val">{{ req.UrgencyLevel }}</span>
            </div>
            <div class="metric-tile">
              <span class="metric-label">Offers Created</span>
              <span class="metric-val">{{ AssignmentCount }}</span>
            </div>
          </div>
        }
      </section>
    }
  `,
})
export class ReferralRequestHeroPanel extends BaseFormPanel implements OnInit {
  private readonly cdr = inject(ChangeDetectorRef);
  protected readonly navService = inject(NavigationService);
  private static readonly EXPAND_KEY = 'Referrals.RequestHeroPanel.Expanded';

  public Expanded = true;
  public AssignmentCount = 0;
  public IsRouting = false;

  public get TypedRecord(): ReferralRequestEntity | null {
    return this.Record instanceof ReferralRequestEntity ? this.Record : null;
  }

  async ngOnInit(): Promise<void> {
    const saved = UserInfoEngine.Instance.GetSetting(ReferralRequestHeroPanel.EXPAND_KEY);
    if (saved === 'false') this.Expanded = false;
    await this.LoadAssignmentCount();
    this.cdr.markForCheck();
  }

  public async ToggleExpanded(): Promise<void> {
    this.Expanded = !this.Expanded;
    await UserInfoEngine.Instance.SetSetting(ReferralRequestHeroPanel.EXPAND_KEY, String(this.Expanded));
    this.cdr.markForCheck();
  }

  public async LoadAssignmentCount(): Promise<void> {
    const rec = this.TypedRecord;
    if (!rec?.ID) return;
    const rv = new RunView();
    const md = new Metadata();
    const res = await rv.RunView<ReferralAssignmentEntity>(
      {
        EntityName: 'MJ_BizApps_Referrals: Referral Assignments',
        ExtraFilter: `ReferralRequestID = '${rec.ID}'`,
        ResultType: 'entity_object',
      },
      md.CurrentUser,
    );
    this.AssignmentCount = res.Success ? res.Results.length : 0;
  }

  public async TriggerCascade(requestId: string): Promise<void> {
    this.IsRouting = true;
    this.cdr.markForCheck();
    try {
      const md = new Metadata();
      await CascadeRoutingService.RouteReferralRequest(requestId, md.CurrentUser);
      await this.LoadAssignmentCount();
    } finally {
      this.IsRouting = false;
      this.cdr.markForCheck();
    }
  }

  public StatusTone(status: string): 'info' | 'success' | 'warning' | 'error' {
    if (status === 'Accepted' || status === 'Completed') return 'success';
    if (status === 'Exhausted' || status === 'Cancelled') return 'error';
    if (status === 'Routed' || status === 'Matching') return 'warning';
    return 'info';
  }
}

@RegisterClassEx(BaseFormPanel, {
  key: 'referrals:professional-profile-hero-panel',
  skipNullKeyWarning: true,
  metadata: {
    entity: 'MJ_BizApps_Referrals: Professional Profiles',
    slot: 'before-fields',
    sortKey: 5,
    contributionKey: 'referrals-profile-hero',
  },
})
@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'mj-professional-profile-hero-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [HERO_PANEL_STYLES],
  template: `
    @if (TypedRecord; as pro) {
      <section class="mj-referrals-hero" aria-label="Professional Profile Readiness">
        <div class="hero-header">
          <div>
            <h3 class="hero-title">{{ pro.DisplayName }}</h3>
            <div class="hero-sub">{{ pro.FirmName || 'Independent Practice' }} • {{ pro.Email }}</div>
          </div>
          <div class="hero-actions">
            <span class="status-pill" [attr.data-tone]="pro.VerificationStatus === 'Verified' ? 'success' : 'warning'">
              {{ pro.VerificationStatus }}
            </span>
            <span class="status-pill">{{ pro.AvailabilityStatus }}</span>
            <button type="button" class="btn-sm" (click)="ToggleExpanded()">
              {{ Expanded ? 'Compact' : 'Metrics' }}
            </button>
          </div>
        </div>
        @if (Expanded) {
          <div class="hero-metrics">
            <div class="metric-tile">
              <span class="metric-label">Active Capacity</span>
              <span class="metric-val">{{ pro.ActiveReferralCount }} / {{ pro.MaxConcurrentReferrals }}</span>
            </div>
            <div class="metric-tile">
              <span class="metric-label">Avg Response</span>
              <span class="metric-val">{{ pro.AverageResponseHours != null ? (pro.AverageResponseHours + 'h') : 'N/A' }}</span>
            </div>
            <div class="metric-tile">
              <span class="metric-label">Avg Rating</span>
              <span class="metric-val">{{ pro.AverageRating != null ? (pro.AverageRating + ' / 5') : 'Unrated' }}</span>
            </div>
          </div>
        }
      </section>
    }
  `,
})
export class ProfessionalProfileHeroPanel extends BaseFormPanel implements OnInit {
  private readonly cdr = inject(ChangeDetectorRef);
  protected readonly navService = inject(NavigationService);
  private static readonly EXPAND_KEY = 'Referrals.ProfileHeroPanel.Expanded';

  public Expanded = true;

  public get TypedRecord(): ProfessionalProfileEntity | null {
    return this.Record instanceof ProfessionalProfileEntity ? this.Record : null;
  }

  ngOnInit(): void {
    const saved = UserInfoEngine.Instance.GetSetting(ProfessionalProfileHeroPanel.EXPAND_KEY);
    if (saved === 'false') this.Expanded = false;
    this.cdr.markForCheck();
  }

  public async ToggleExpanded(): Promise<void> {
    this.Expanded = !this.Expanded;
    await UserInfoEngine.Instance.SetSetting(ProfessionalProfileHeroPanel.EXPAND_KEY, String(this.Expanded));
    this.cdr.markForCheck();
  }

  public OpenAssignedRequests(id: string): void {
    this.navService.OpenEntityRecord('MJ_BizApps_Referrals: Professional Profiles', CompositeKey.FromID(id));
  }
}
