import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CompositeKey, Metadata, RunView } from '@memberjunction/core';
import { UserInfoEngine } from '@memberjunction/core-entities';
import { RegisterClassEx } from '@memberjunction/global';
import { BaseFormPanel } from '@memberjunction/ng-base-forms';
import { NavigationService } from '@memberjunction/ng-shared';
import { CascadeRoutingService } from '@mj-biz-apps/referrals-core';
import {
  ConflictCheckPartyEntity,
  JurisdictionEntity,
  PracticeAreaEntity,
  ProfessionalJurisdictionEntity,
  ProfessionalPracticeAreaEntity,
  ProfessionalProfileEntity,
  ReferralAssignmentEntity,
  ReferralFeedbackEntity,
  ReferralRequestEntity,
  ReferralTierEntity,
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

@RegisterClassEx(BaseFormPanel, {
  key: 'referrals:referral-assignment-hero-panel',
  skipNullKeyWarning: true,
  metadata: {
    entity: 'MJ_BizApps_Referrals: Referral Assignments',
    slot: 'before-fields',
    sortKey: 5,
    contributionKey: 'referrals-assignment-hero',
  },
})
@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'mj-referral-assignment-hero-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [HERO_PANEL_STYLES],
  template: `
    @if (TypedRecord; as assign) {
      <section class="mj-referrals-hero" aria-label="Referral Assignment Offer Status">
        <div class="hero-header">
          <div>
            <h3 class="hero-title">Assignment Order #{{ assign.CascadeOrder }}</h3>
            <div class="hero-sub">Offered: {{ assign.OfferedAt | date:'medium' }}</div>
          </div>
          <div class="hero-actions">
            <span class="status-pill" [attr.data-tone]="StatusTone(assign.Status)">{{ assign.Status }}</span>
            <span class="status-pill" [attr.data-tone]="assign.ConflictStatus === 'Cleared' ? 'success' : assign.ConflictStatus === 'ConflictFound' ? 'error' : 'warning'">
              Conflict: {{ assign.ConflictStatus }}
            </span>
          </div>
        </div>
        <div class="hero-metrics">
          <div class="metric-tile">
            <span class="metric-label">SLA Deadline</span>
            <span class="metric-val">{{ assign.SLADeadlineAt ? (assign.SLADeadlineAt | date:'short') : 'None' }}</span>
          </div>
          <div class="metric-tile">
            <span class="metric-label">Responded At</span>
            <span class="metric-val">{{ assign.RespondedAt ? (assign.RespondedAt | date:'short') : 'Pending' }}</span>
          </div>
          <div class="metric-tile">
            <span class="metric-label">Response Notes</span>
            <span class="metric-val">{{ assign.ResponseNotes || '—' }}</span>
          </div>
        </div>
      </section>
    }
  `,
})
export class ReferralAssignmentHeroPanel extends BaseFormPanel {
  public get TypedRecord(): ReferralAssignmentEntity | null {
    return this.Record instanceof ReferralAssignmentEntity ? this.Record : null;
  }
  public StatusTone(status: string): 'info' | 'success' | 'warning' | 'error' {
    if (status === 'Accepted') return 'success';
    if (status === 'Declined' || status === 'Expired' || status === 'ConflictRejected') return 'error';
    if (status === 'Offered') return 'warning';
    return 'info';
  }
}

@RegisterClassEx(BaseFormPanel, {
  key: 'referrals:conflict-check-party-hero-panel',
  skipNullKeyWarning: true,
  metadata: {
    entity: 'MJ_BizApps_Referrals: Conflict Check Parties',
    slot: 'before-fields',
    sortKey: 5,
    contributionKey: 'referrals-party-hero',
  },
})
@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'mj-conflict-check-party-hero-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [HERO_PANEL_STYLES],
  template: `
    @if (TypedRecord; as party) {
      <section class="mj-referrals-hero" aria-label="Conflict Check Party Screening">
        <div class="hero-header">
          <div>
            <h3 class="hero-title">{{ party.PartyName }}</h3>
            <div class="hero-sub">Role: {{ party.PartyRole }} • Organization: {{ party.OrganizationName || 'None' }}</div>
          </div>
          <div class="hero-actions">
            <span class="status-pill" [attr.data-tone]="party.PartyRole === 'Adverse' ? 'error' : 'info'">{{ party.PartyRole }}</span>
            <span class="status-pill" data-tone="success">Normalized: {{ party.NormalizedName }}</span>
          </div>
        </div>
      </section>
    }
  `,
})
export class ConflictCheckPartyHeroPanel extends BaseFormPanel {
  public get TypedRecord(): ConflictCheckPartyEntity | null {
    return this.Record instanceof ConflictCheckPartyEntity ? this.Record : null;
  }
}

@RegisterClassEx(BaseFormPanel, {
  key: 'referrals:practice-area-hero-panel',
  skipNullKeyWarning: true,
  metadata: {
    entity: 'MJ_BizApps_Referrals: Practice Areas',
    slot: 'before-fields',
    sortKey: 5,
    contributionKey: 'referrals-practice-area-hero',
  },
})
@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'mj-practice-area-hero-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [HERO_PANEL_STYLES],
  template: `
    @if (TypedRecord; as pa) {
      <section class="mj-referrals-hero" aria-label="Practice Area Details">
        <div class="hero-header">
          <div>
            <h3 class="hero-title">{{ pa.Name }}</h3>
            <div class="hero-sub">Category: {{ pa.Category || 'General' }} • Code: {{ pa.Code }}</div>
          </div>
          <div class="hero-actions">
            <span class="status-pill" [attr.data-tone]="pa.IsActive ? 'success' : 'warning'">
              {{ pa.IsActive ? 'Active' : 'Inactive' }}
            </span>
            <span class="status-pill">Rank: {{ pa.DisplayRank }}</span>
          </div>
        </div>
      </section>
    }
  `,
})
export class PracticeAreaHeroPanel extends BaseFormPanel {
  public get TypedRecord(): PracticeAreaEntity | null {
    return this.Record instanceof PracticeAreaEntity ? this.Record : null;
  }
}

@RegisterClassEx(BaseFormPanel, {
  key: 'referrals:jurisdiction-hero-panel',
  skipNullKeyWarning: true,
  metadata: {
    entity: 'MJ_BizApps_Referrals: Jurisdictions',
    slot: 'before-fields',
    sortKey: 5,
    contributionKey: 'referrals-jurisdiction-hero',
  },
})
@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'mj-jurisdiction-hero-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [HERO_PANEL_STYLES],
  template: `
    @if (TypedRecord; as jur) {
      <section class="mj-referrals-hero" aria-label="Jurisdiction Details">
        <div class="hero-header">
          <div>
            <h3 class="hero-title">{{ jur.Name }}</h3>
            <div class="hero-sub">Type: {{ jur.JurisdictionType }} • Code: {{ jur.Code }}</div>
          </div>
          <div class="hero-actions">
            <span class="status-pill" [attr.data-tone]="jur.IsActive ? 'success' : 'warning'">
              {{ jur.IsActive ? 'Active' : 'Inactive' }}
            </span>
          </div>
        </div>
      </section>
    }
  `,
})
export class JurisdictionHeroPanel extends BaseFormPanel {
  public get TypedRecord(): JurisdictionEntity | null {
    return this.Record instanceof JurisdictionEntity ? this.Record : null;
  }
}

@RegisterClassEx(BaseFormPanel, {
  key: 'referrals:referral-tier-hero-panel',
  skipNullKeyWarning: true,
  metadata: {
    entity: 'MJ_BizApps_Referrals: Referral Tiers',
    slot: 'before-fields',
    sortKey: 5,
    contributionKey: 'referrals-tier-hero',
  },
})
@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'mj-referral-tier-hero-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [HERO_PANEL_STYLES],
  template: `
    @if (TypedRecord; as tier) {
      <section class="mj-referrals-hero" aria-label="Referral Tier Priority">
        <div class="hero-header">
          <div>
            <h3 class="hero-title">{{ tier.Name }}</h3>
            <div class="hero-sub">SLA Response: {{ tier.SLAResponseHours }}h • Max Attempts: {{ tier.MaxCascadeAttempts }}</div>
          </div>
          <div class="hero-actions">
            <span class="status-pill" [attr.data-tone]="tier.IsActive ? 'success' : 'warning'">
              {{ tier.IsActive ? 'Active' : 'Inactive' }}
            </span>
            <span class="status-pill">Priority: {{ tier.PriorityWeight }}</span>
          </div>
        </div>
      </section>
    }
  `,
})
export class ReferralTierHeroPanel extends BaseFormPanel {
  public get TypedRecord(): ReferralTierEntity | null {
    return this.Record instanceof ReferralTierEntity ? this.Record : null;
  }
}

@RegisterClassEx(BaseFormPanel, {
  key: 'referrals:pro-practice-area-hero-panel',
  skipNullKeyWarning: true,
  metadata: {
    entity: 'MJ_BizApps_Referrals: Professional Practice Areas',
    slot: 'before-fields',
    sortKey: 5,
    contributionKey: 'referrals-pro-pa-hero',
  },
})
@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'mj-pro-practice-area-hero-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [HERO_PANEL_STYLES],
  template: `
    @if (TypedRecord; as ppa) {
      <section class="mj-referrals-hero" aria-label="Professional Practice Area Proficiency">
        <div class="hero-header">
          <div>
            <h3 class="hero-title">Practice Area Link</h3>
            <div class="hero-sub">Experience: {{ ppa.YearsInPractice }} years in practice</div>
          </div>
          <div class="hero-actions">
            <span class="status-pill" data-tone="success">{{ ppa.ProficiencyLevel }}</span>
            @if (ppa.IsPrimary) {
              <span class="status-pill" data-tone="info">Primary Area</span>
            }
          </div>
        </div>
      </section>
    }
  `,
})
export class ProfessionalPracticeAreaHeroPanel extends BaseFormPanel {
  public get TypedRecord(): ProfessionalPracticeAreaEntity | null {
    return this.Record instanceof ProfessionalPracticeAreaEntity ? this.Record : null;
  }
}

@RegisterClassEx(BaseFormPanel, {
  key: 'referrals:pro-jurisdiction-hero-panel',
  skipNullKeyWarning: true,
  metadata: {
    entity: 'MJ_BizApps_Referrals: Professional Jurisdictions',
    slot: 'before-fields',
    sortKey: 5,
    contributionKey: 'referrals-pro-jur-hero',
  },
})
@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'mj-pro-jurisdiction-hero-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [HERO_PANEL_STYLES],
  template: `
    @if (TypedRecord; as pj) {
      <section class="mj-referrals-hero" aria-label="Professional Bar / Jurisdiction Standing">
        <div class="hero-header">
          <div>
            <h3 class="hero-title">Bar / License Standing</h3>
            <div class="hero-sub">License: {{ pj.LicenseNumber || 'N/A' }} • Admitted: {{ pj.AdmissionYear || 'N/A' }}</div>
          </div>
          <div class="hero-actions">
            <span class="status-pill" [attr.data-tone]="pj.StandingStatus === 'GoodStanding' ? 'success' : 'error'">
              {{ pj.StandingStatus }}
            </span>
            @if (pj.IsPrimary) {
              <span class="status-pill" data-tone="info">Primary</span>
            }
          </div>
        </div>
      </section>
    }
  `,
})
export class ProfessionalJurisdictionHeroPanel extends BaseFormPanel {
  public get TypedRecord(): ProfessionalJurisdictionEntity | null {
    return this.Record instanceof ProfessionalJurisdictionEntity ? this.Record : null;
  }
}

@RegisterClassEx(BaseFormPanel, {
  key: 'referrals:referral-feedback-hero-panel',
  skipNullKeyWarning: true,
  metadata: {
    entity: 'MJ_BizApps_Referrals: Referral Feedbacks',
    slot: 'before-fields',
    sortKey: 5,
    contributionKey: 'referrals-feedback-hero',
  },
})
@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'mj-referral-feedback-hero-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [HERO_PANEL_STYLES],
  template: `
    @if (TypedRecord; as fb) {
      <section class="mj-referrals-hero" aria-label="Referral Satisfaction Feedback">
        <div class="hero-header">
          <div>
            <h3 class="hero-title">Feedback by {{ fb.SubmittedByType }}</h3>
            <div class="hero-sub">Outcome: {{ fb.OutcomeStatus }}</div>
          </div>
          <div class="hero-actions">
            <span class="status-pill" [attr.data-tone]="fb.Rating >= 4 ? 'success' : fb.Rating <= 2 ? 'error' : 'warning'">
              Rating: {{ fb.Rating }} / 5
            </span>
          </div>
        </div>
        @if (fb.Comments) {
          <div class="hero-metrics">
            <div class="metric-tile" style="grid-column: span 3;">
              <span class="metric-label">Comments</span>
              <span class="metric-val" style="font-weight: 400; font-size: 0.85rem;">{{ fb.Comments }}</span>
            </div>
          </div>
        }
      </section>
    }
  `,
})
export class ReferralFeedbackHeroPanel extends BaseFormPanel {
  public get TypedRecord(): ReferralFeedbackEntity | null {
    return this.Record instanceof ReferralFeedbackEntity ? this.Record : null;
  }
}

/**
 * Cross-App Contributions
 */
@RegisterClassEx(BaseFormPanel, {
  key: 'referrals:person-referrals-overview',
  priority: 20,
  skipNullKeyWarning: true,
  metadata: {
    entity: 'MJ_BizApps_Common: People',
    slot: 'before-fields',
    sortKey: 95,
    contributionKey: 'referrals-person-overview',
  },
})
@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'mj-person-referrals-overview-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [HERO_PANEL_STYLES],
  template: `
    @if (RecordID) {
      <section class="mj-referrals-hero" aria-label="Person Referrals Summary">
        <div class="hero-header">
          <div>
            <h3 class="hero-title">Referral Profile & Network Engagement</h3>
            <div class="hero-sub">Referrals activity associated with this person</div>
          </div>
          <div class="hero-actions">
            <button type="button" class="btn-sm" (click)="OpenIntake()">New Referral Intake</button>
          </div>
        </div>
        <div class="hero-metrics">
          <div class="metric-tile">
            <span class="metric-label">Linked Pro Profile</span>
            <span class="metric-val">{{ HasProProfile ? 'Active Verified' : 'None' }}</span>
          </div>
          <div class="metric-tile">
            <span class="metric-label">Referrals Active</span>
            <span class="metric-val">{{ RequestCount }}</span>
          </div>
          <div class="metric-tile">
            <span class="metric-label">Status</span>
            <span class="metric-val">Ready</span>
          </div>
        </div>
      </section>
    }
  `,
})
export class PersonReferralsOverviewPanel extends BaseFormPanel implements OnInit {
  private readonly cdr = inject(ChangeDetectorRef);
  protected readonly navService = inject(NavigationService);
  public HasProProfile = false;
  public RequestCount = 0;

  public get RecordID(): string {
    const val = this.Record?.FirstPrimaryKey?.Value;
    return val ? String(val) : '';
  }

  async ngOnInit(): Promise<void> {
    const recId = this.RecordID;
    if (!recId) return;
    const rv = new RunView();
    const md = new Metadata();
    const proRes = await rv.RunView<ProfessionalProfileEntity>(
      {
        EntityName: 'MJ_BizApps_Referrals: Professional Profiles',
        ExtraFilter: `PersonID = '${recId}'`,
        ResultType: 'entity_object',
      },
      md.CurrentUser,
    );
    this.HasProProfile = proRes.Success && proRes.Results.length > 0;
    this.cdr.markForCheck();
  }

  public OpenIntake(): void {
    this.navService.OpenNewEntityRecord('MJ_BizApps_Referrals: Referral Requests');
  }
}

@RegisterClassEx(BaseFormPanel, {
  key: 'referrals:org-referrals-overview',
  priority: 20,
  skipNullKeyWarning: true,
  metadata: {
    entity: 'MJ_BizApps_Common: Organizations',
    slot: 'before-fields',
    sortKey: 95,
    contributionKey: 'referrals-org-overview',
  },
})
@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'mj-organization-referrals-overview-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [HERO_PANEL_STYLES],
  template: `
    @if (RecordID) {
      <section class="mj-referrals-hero" aria-label="Organization Referrals Summary">
        <div class="hero-header">
          <div>
            <h3 class="hero-title">Firm Referral Network Presence</h3>
            <div class="hero-sub">Organization directory and panel participation</div>
          </div>
        </div>
        <div class="hero-metrics">
          <div class="metric-tile">
            <span class="metric-label">Affiliated Professionals</span>
            <span class="metric-val">{{ ProCount }}</span>
          </div>
          <div class="metric-tile">
            <span class="metric-label">Network Status</span>
            <span class="metric-val">{{ ProCount > 0 ? 'Panel Member' : 'Affiliate' }}</span>
          </div>
          <div class="metric-tile">
            <span class="metric-label">Actions</span>
            <span class="metric-val"><a style="cursor: pointer;" (click)="OpenDirectory()">Referral Inquiries</a></span>
          </div>
        </div>
      </section>
    }
  `,
})
export class OrganizationReferralsOverviewPanel extends BaseFormPanel implements OnInit {
  private readonly cdr = inject(ChangeDetectorRef);
  protected readonly navService = inject(NavigationService);
  public ProCount = 0;

  public get RecordID(): string {
    const val = this.Record?.FirstPrimaryKey?.Value;
    return val ? String(val) : '';
  }

  async ngOnInit(): Promise<void> {
    const recId = this.RecordID;
    if (!recId) return;
    const rv = new RunView();
    const md = new Metadata();
    const proRes = await rv.RunView<ProfessionalProfileEntity>(
      {
        EntityName: 'MJ_BizApps_Referrals: Professional Profiles',
        ExtraFilter: `OrganizationID = '${recId}'`,
        ResultType: 'entity_object',
      },
      md.CurrentUser,
    );
    this.ProCount = proRes.Success ? proRes.Results.length : 0;
    this.cdr.markForCheck();
  }

  public OpenDirectory(): void {
    this.navService.OpenNewEntityRecord('MJ_BizApps_Referrals: Referral Requests');
  }
}

@RegisterClassEx(BaseFormPanel, {
  key: 'referrals:user-referrals-overview',
  priority: 20,
  skipNullKeyWarning: true,
  metadata: {
    entity: 'MJ: Users',
    slot: 'before-fields',
    sortKey: 95,
    contributionKey: 'referrals-user-overview',
  },
})
@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'mj-user-referrals-overview-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [HERO_PANEL_STYLES],
  template: `
    @if (RecordID) {
      <section class="mj-referrals-hero" aria-label="User Referrals Membership">
        <div class="hero-header">
          <div>
            <h3 class="hero-title">Referrals Portal Access</h3>
            <div class="hero-sub">Direct pro-lead inbox and routing access</div>
          </div>
        </div>
        <div class="hero-metrics">
          <div class="metric-tile">
            <span class="metric-label">Professional Roster</span>
            <span class="metric-val">{{ HasProfile ? 'Linked' : 'Standard User' }}</span>
          </div>
          <div class="metric-tile">
            <span class="metric-label">Lead Inbox</span>
            <span class="metric-val"><a style="cursor: pointer;" (click)="OpenInbox()">Inquiries</a></span>
          </div>
          <div class="metric-tile">
            <span class="metric-label">Telemetry</span>
            <span class="metric-val"><a style="cursor: pointer;" (click)="OpenTelemetry()">View Network</a></span>
          </div>
        </div>
      </section>
    }
  `,
})
export class UserReferralsOverviewPanel extends BaseFormPanel implements OnInit {
  private readonly cdr = inject(ChangeDetectorRef);
  protected readonly navService = inject(NavigationService);
  public HasProfile = false;

  public get RecordID(): string {
    const val = this.Record?.FirstPrimaryKey?.Value;
    return val ? String(val) : '';
  }

  async ngOnInit(): Promise<void> {
    const recId = this.RecordID;
    if (!recId) return;
    const rv = new RunView();
    const md = new Metadata();
    const res = await rv.RunView<ProfessionalProfileEntity>(
      {
        EntityName: 'MJ_BizApps_Referrals: Professional Profiles',
        ExtraFilter: `UserID = '${recId}'`,
        ResultType: 'entity_object',
      },
      md.CurrentUser,
    );
    this.HasProfile = res.Success && res.Results.length > 0;
    this.cdr.markForCheck();
  }

  public OpenInbox(): void {
    this.navService.OpenNewEntityRecord('MJ_BizApps_Referrals: Referral Requests');
  }

  public OpenTelemetry(): void {
    this.navService.OpenNewEntityRecord('MJ_BizApps_Referrals: Referral Requests');
  }
}

