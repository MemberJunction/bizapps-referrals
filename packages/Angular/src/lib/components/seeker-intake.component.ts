import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CompositeKey, Metadata, RunView } from '@memberjunction/core';
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
  CapacityReadinessService,
  CascadeRoutingService,
  FeedbackOutcomeStatus,
  MatchCandidateScore,
  MatchingEngine,
  NormalizePartyName,
  ReferralCredentialService,
  ReferralTelemetry,
} from '@mj-biz-apps/referrals-core';
import {
  ConflictCheckPartyEntity,
  JurisdictionEntity,
  PracticeAreaEntity,
  ProfessionalProfileEntity,
  ReferralAssignmentEntity,
  ReferralRequestEntity,
  ReferralTierEntity,
} from '@mj-biz-apps/referrals-entities';
import { ReferralsUiStateHelper, SeekerFilterPreferences } from '../services/referrals-ui-state.service.js';

export interface ConflictCheckPartyDraft {
  PartyName: string;
  PartyRole: ConflictCheckPartyEntity['PartyRole'];
  OrganizationName: string;
}

/**
 * Tab 1: Seeker Intake — Variant A Editorial Concierge + Filter Drawer.
 */
@RegisterClass(BaseResourceComponent, 'ReferralsSeekerIntakeResource')
@Component({
  standalone: true,
  selector: 'mj-referrals-seeker-intake',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    MJPageLayoutComponent,
    MJPageHeaderComponent,
    MJPageBodyComponent,
    MJButtonDirective,
  ],
  template: `
    <mj-page-layout>
      <mj-page-header Title="Find a Verified Professional" Icon="fa-solid fa-scale-balanced">
        <div class="header-actions" actions>
          <button type="button" mjButton Variant="outline" (click)="ToggleDrawer()">
            {{ Prefs.DrawerOpen ? 'Hide Filters' : 'Directory Filters' }}
          </button>
          <button type="button" mjButton Variant="primary" (click)="RunMatchPreview()" [disabled]="IsMatching">
            {{ IsMatching ? 'Matching...' : 'Preview Matches' }}
          </button>
        </div>
      </mj-page-header>
      <mj-page-body>
        <div class="concierge-shell" [class.drawer-open]="Prefs.DrawerOpen">
          <section class="editorial-card">
            <p class="eyebrow">CONCIERGE INTAKE</p>
            <h2 class="headline">Tell us about your matter</h2>
            <p class="subcopy">
              Your intake is screened for conflicts of interest and matched against verified,
              jurisdiction-admitted professionals with SLA-backed response guarantees.
            </p>

            @if (StatusBanner) {
              <div class="status-banner" [attr.data-tone]="StatusTone">{{ StatusBanner }}</div>
            }

            <div class="structured-parse-box">
              <label class="field full-width">
                <span>Quick Parse Structured Intake Notes (Optional)</span>
                <div class="parse-row">
                  <textarea
                    rows="2"
                    [(ngModel)]="RawIntakeNotes"
                    placeholder="Paste notes e.g. Name: Alex Morgan | Email: alex@co.com | Matter: M&A Dispute | Adverse: Rival Corp LLP"
                  ></textarea>
                  <button type="button" mjButton Variant="outline" Size="sm" class="parse-btn" (click)="ParseStructuredIntake()">
                    Parse Notes
                  </button>
                </div>
              </label>
            </div>

            <div class="intake-grid">
              <label class="field">
                <span>Your Name *</span>
                <input type="text" [(ngModel)]="SeekerName" placeholder="Alex Morgan" />
              </label>
              <label class="field">
                <span>Email Address *</span>
                <input
                  type="email"
                  [(ngModel)]="SeekerEmail"
                  (ngModelChange)="OnSeekerEmailChange()"
                  placeholder="alex@company.com"
                />
              </label>
              <label class="field">
                <span>Practice Area *</span>
                <select [(ngModel)]="Prefs.PracticeAreaID" (ngModelChange)="OnPreferenceChange()">
                  <option value="">Select practice area...</option>
                  @for (pa of PracticeAreas; track pa.ID) {
                    <option [value]="pa.ID">{{ pa.Name }}</option>
                  }
                </select>
              </label>
              <label class="field">
                <span>Jurisdiction *</span>
                <select [(ngModel)]="Prefs.JurisdictionID" (ngModelChange)="OnPreferenceChange()">
                  <option value="">Select jurisdiction...</option>
                  @for (jur of Jurisdictions; track jur.ID) {
                    <option [value]="jur.ID">{{ jur.Name }}</option>
                  }
                </select>
              </label>
              <label class="field">
                <span>Service Tier</span>
                <select [(ngModel)]="SelectedTierID">
                  @for (tier of ReferralTiers; track tier.ID) {
                    <option [value]="tier.ID">{{ tier.Name }} ({{ tier.SLAResponseHours }}h SLA)</option>
                  }
                </select>
              </label>
              <label class="field">
                <span>Urgency</span>
                <select [(ngModel)]="UrgencyLevel">
                  <option value="Low">Low</option>
                  <option value="Standard">Standard</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </label>
              <label class="field">
                <span>Matter Title *</span>
                <input type="text" [(ngModel)]="MatterTitle" placeholder="Series A Counsel & Delaware Conversion" />
              </label>
            </div>

            @if (SlaPreviewText) {
              <p class="sla-preview" aria-live="polite">{{ SlaPreviewText }}</p>
            }

            <label class="field full-width">
              <span>Matter Summary *</span>
              <textarea rows="4" [(ngModel)]="MatterSummary" placeholder="Describe key facts, timeline, and adverse parties..."></textarea>
            </label>

            <div class="conflict-parties-box">
              <div class="conflict-header">
                <strong>Conflict-Check Parties ({{ ConflictParties.length }})</strong>
                <span class="hint">Add adverse, opposing, or related entities for automated conflict screening.</span>
              </div>
              <div class="conflict-add-row">
                <input type="text" [(ngModel)]="NewPartyName" placeholder="Party name (e.g. Rival Corp Inc.)" />
                <select [(ngModel)]="NewPartyRole">
                  <option value="Adverse">Adverse</option>
                  <option value="Client">Client</option>
                  <option value="RelatedEntity">RelatedEntity</option>
                  <option value="CoParty">CoParty</option>
                  <option value="Witness">Witness</option>
                </select>
                <input type="text" [(ngModel)]="NewPartyOrg" placeholder="Organization / Firm (optional)" />
                <button type="button" mjButton Variant="outline" Size="sm" (click)="AddConflictParty()">Add Party</button>
              </div>
              @if (ConflictParties.length > 0) {
                <ul class="conflict-list">
                  @for (party of ConflictParties; track $index) {
                    <li class="conflict-item">
                      <span><strong>{{ party.PartyName }}</strong> ({{ party.PartyRole }}) @if (party.OrganizationName) { — {{ party.OrganizationName }} }</span>
                      <button
                        type="button"
                        mjButton
                        Variant="flat"
                        Size="sm"
                        [AriaLabel]="'Remove conflict party ' + party.PartyName"
                        (click)="RemoveConflictParty($index)"
                      >
                        Remove
                      </button>
                    </li>
                  }
                </ul>
              }
            </div>

            <div class="intake-footer">
              <label class="checkbox-row">
                <input type="checkbox" [(ngModel)]="Prefs.RequiresProBono" (ngModelChange)="OnPreferenceChange()" />
                <span>Require Pro Bono eligibility</span>
              </label>
              <button type="button" mjButton Variant="primary" (click)="SubmitRequest()" [disabled]="IsSubmitting">
                {{ IsSubmitting ? 'Submitting...' : 'Submit Referral Request' }}
              </button>
            </div>

            @if (FeedbackAssignments.length > 0) {
              <div class="seeker-feedback-panel" aria-label="Seeker Post-Acceptance Feedback">
                <h3>Post-Acceptance Engagement Feedback</h3>
                <div class="field-row">
                  <label class="field-label">
                    <span>Accepted / Completed Assignment</span>
                    <select [(ngModel)]="SelectedFeedbackAssignmentID">
                      @for (a of FeedbackAssignments; track a.ID) {
                        <option [value]="a.ID">{{ AssignmentProfessionalNames[a.ID] || 'Professional' }} ({{ a.Status }})</option>
                      }
                    </select>
                  </label>
                  <label class="field-label">
                    <span>Outcome Status</span>
                    <select [(ngModel)]="SeekerFeedbackOutcome">
                      <option value="Engaged">Engaged</option>
                      <option value="ConsultedOnly">Consulted Only</option>
                      <option value="NoResponse">No Response</option>
                      <option value="NotAFit">Not A Fit</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </label>
                </div>
                <div class="field-row">
                  <label class="field-label">
                    <span>Rating (1–5 ★)</span>
                    <select [(ngModel)]="SeekerFeedbackRating">
                      <option [ngValue]="5">5 ★ — Excellent</option>
                      <option [ngValue]="4">4 ★ — Good</option>
                      <option [ngValue]="3">3 ★ — Fair</option>
                      <option [ngValue]="2">2 ★ — Poor</option>
                      <option [ngValue]="1">1 ★ — Unsatisfactory</option>
                    </select>
                  </label>
                  <label class="field-label">
                    <span>Feedback Comments</span>
                    <input type="text" [(ngModel)]="SeekerFeedbackComments" placeholder="Share consultation experience..." />
                  </label>
                </div>
                <div class="form-actions">
                  <button
                    type="button"
                    mjButton
                    Variant="secondary"
                    [disabled]="IsSubmittingFeedback"
                    (click)="SubmitSeekerFeedback()"
                  >
                    {{ IsSubmittingFeedback ? 'Saving Feedback...' : 'Submit Seeker Feedback' }}
                  </button>
                </div>
              </div>
            }
          </section>

          @if (Prefs.DrawerOpen) {
            <aside class="filter-drawer" aria-label="Directory Filters and Match Preview">
              <h3>Matched Professionals ({{ Candidates.length }})</h3>
              @for (c of Candidates; track c.ProfessionalProfileID) {
                <div class="candidate-card" [class.disqualified]="!c.Eligible">
                  <div class="candidate-top">
                    <strong>{{ c.DisplayName }}</strong>
                    <span class="score-pill">{{ c.Score | number:'1.0-0' }} pts</span>
                  </div>
                  <div class="candidate-meta">{{ c.FirmName || 'Independent Practice' }}</div>
                  @if (CandidateReadinessMap[c.ProfessionalProfileID] != null) {
                    <span
                      class="readiness-badge"
                      [attr.aria-label]="'Readiness score ' + CandidateReadinessMap[c.ProfessionalProfileID]"
                    >
                      Readiness {{ CandidateReadinessMap[c.ProfessionalProfileID] | number:'1.0-0' }}
                    </span>
                  }
                  @if (c.Eligible) {
                    <div class="candidate-status ok">Conflict Cleared • {{ c.AvailabilityStatus }}</div>
                  } @else {
                    <div class="candidate-status warn">{{ c.DisqualificationReason }}</div>
                  }
                  @if (c.ExplainableMatchReasons?.length || c.MatchSummary) {
                    <button
                      type="button"
                      mjButton
                      Variant="flat"
                      Size="sm"
                      [AriaLabel]="'Explain match for ' + c.DisplayName"
                      (click)="ToggleExplainMatch(c.ProfessionalProfileID)"
                    >
                      {{ ExpandedExplainID === c.ProfessionalProfileID ? 'Hide Explanation' : 'Explain this match' }}
                    </button>
                    @if (ExpandedExplainID === c.ProfessionalProfileID) {
                      <div class="explain-match-box">
                        <span class="explain-source">Source: Deterministic</span>
                        @if (c.MatchSummary) {
                          <p class="explain-summary">{{ c.MatchSummary }}</p>
                        }
                        @if (c.ExplainableMatchReasons?.length) {
                          <ul class="explain-reasons">
                            @for (reason of c.ExplainableMatchReasons; track reason) {
                              <li>{{ reason }}</li>
                            }
                          </ul>
                        }
                      </div>
                    }
                  }
                  <button
                    type="button"
                    mjButton
                    Variant="flat"
                    Size="sm"
                    [AriaLabel]="'View profile for ' + c.DisplayName"
                    (click)="OpenProfessionalRecord(c.ProfessionalProfileID)"
                  >
                    View Profile ↗
                  </button>
                </div>
              } @empty {
                <p class="empty-hint">Select a practice area and jurisdiction, then click Preview Matches.</p>
              }
            </aside>
          }
        </div>
      </mj-page-body>
    </mj-page-layout>
  `,
  styles: [`
    .header-actions { display: flex; gap: 0.5rem; align-items: center; }
    .concierge-shell {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      gap: 1.25rem;
      padding: 1.25rem;
      max-width: 1200px;
      margin: 0 auto;
    }
    .concierge-shell.drawer-open {
      grid-template-columns: minmax(0, 2fr) minmax(280px, 1fr);
    }
    .editorial-card, .filter-drawer {
      background: var(--mj-bg-surface-card, var(--mj-bg-surface));
      border: 1px solid var(--mj-border-default);
      border-radius: var(--mj-radius-md, 8px);
      padding: 1.5rem;
      color: var(--mj-text-primary);
    }
    .eyebrow {
      font-size: 0.72rem;
      letter-spacing: 0.08em;
      font-weight: 700;
      color: var(--mj-brand-primary);
      margin: 0 0 0.25rem 0;
    }
    .headline { margin: 0 0 0.4rem 0; font-size: 1.35rem; color: var(--mj-text-primary); }
    .subcopy { margin: 0 0 1.25rem 0; color: var(--mj-text-secondary); font-size: 0.9rem; }
    .intake-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 0.9rem;
      margin-bottom: 0.9rem;
    }
    .field { display: flex; flex-direction: column; gap: 0.3rem; font-size: 0.82rem; color: var(--mj-text-secondary); }
    .field input, .field select, .field textarea {
      background: var(--mj-bg-surface);
      border: 1px solid var(--mj-border-default);
      border-radius: var(--mj-radius-sm, 6px);
      padding: 0.5rem 0.65rem;
      color: var(--mj-text-primary);
      font-size: 0.88rem;
    }
    .full-width { margin-bottom: 1rem; }
    .structured-parse-box { margin-bottom: 0.75rem; }
    .parse-row { display: flex; gap: 0.5rem; align-items: stretch; }
    .parse-row textarea { flex: 1; }
    .parse-btn { white-space: nowrap; }
    .conflict-parties-box {
      border: 1px solid var(--mj-border-default);
      border-radius: var(--mj-radius-sm, 6px);
      padding: 0.85rem;
      margin-bottom: 1rem;
      background: var(--mj-bg-surface);
    }
    .conflict-header { display: flex; justify-content: space-between; align-items: baseline; gap: 0.5rem; margin-bottom: 0.6rem; font-size: 0.85rem; }
    .conflict-header .hint { color: var(--mj-text-secondary); font-size: 0.78rem; }
    .conflict-add-row { display: grid; grid-template-columns: 1.4fr 0.9fr 1.2fr auto; gap: 0.5rem; }
    .conflict-add-row input, .conflict-add-row select {
      background: var(--mj-bg-surface-card, var(--mj-bg-surface));
      border: 1px solid var(--mj-border-default);
      border-radius: var(--mj-radius-sm, 6px);
      padding: 0.4rem 0.55rem;
      color: var(--mj-text-primary);
      font-size: 0.84rem;
    }
    .conflict-list { list-style: none; padding: 0; margin: 0.65rem 0 0 0; display: flex; flex-direction: column; gap: 0.35rem; }
    .conflict-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.82rem;
      padding: 0.35rem 0.5rem;
      border-radius: var(--mj-radius-sm, 4px);
      background: var(--mj-bg-surface-card, var(--mj-bg-surface));
      border: 1px solid var(--mj-border-default);
    }
    .intake-footer { display: flex; justify-content: space-between; align-items: center; gap: 1rem; }
    .checkbox-row { display: flex; align-items: center; gap: 0.4rem; font-size: 0.85rem; color: var(--mj-text-secondary); }
    .sla-preview {
      margin: -0.3rem 0 0.9rem 0;
      font-size: 0.8rem;
      color: var(--mj-status-info-text);
      background: var(--mj-status-info-bg);
      border-radius: var(--mj-radius-sm, 6px);
      padding: 0.45rem 0.65rem;
    }
    .status-banner {
      padding: 0.65rem 0.85rem;
      border-radius: var(--mj-radius-sm, 6px);
      margin-bottom: 1rem;
      font-size: 0.86rem;
      background: var(--mj-status-info-bg);
      color: var(--mj-status-info-text);
    }
    .status-banner[data-tone="success"] {
      background: var(--mj-status-success-bg);
      color: var(--mj-status-success-text);
    }
    .status-banner[data-tone="error"] {
      background: var(--mj-status-error-bg);
      color: var(--mj-status-error-text);
    }
    .candidate-card {
      border: 1px solid var(--mj-border-default);
      border-radius: var(--mj-radius-sm, 6px);
      padding: 0.75rem;
      margin-bottom: 0.65rem;
      background: var(--mj-bg-surface);
    }
    .candidate-card.disqualified { opacity: 0.7; }
    .candidate-top { display: flex; justify-content: space-between; align-items: center; }
    .score-pill {
      background: var(--mj-status-info-bg);
      color: var(--mj-status-info-text);
      border-radius: 999px;
      padding: 0.12rem 0.5rem;
      font-size: 0.75rem;
      font-weight: 700;
    }
    .candidate-meta { font-size: 0.8rem; color: var(--mj-text-secondary); margin-top: 0.2rem; }
    .candidate-status { font-size: 0.78rem; margin-top: 0.35rem; }
    .candidate-status.ok { color: var(--mj-status-success-text); }
    .candidate-status.warn { color: var(--mj-status-warning-text); }
    .readiness-badge {
      display: inline-block;
      margin-top: 0.3rem;
      font-size: 0.72rem;
      font-weight: 600;
      color: var(--mj-status-success-text);
      background: var(--mj-status-success-bg);
      border-radius: 999px;
      padding: 0.1rem 0.5rem;
    }
    .explain-match-box {
      margin-top: 0.5rem;
      padding: 0.6rem 0.7rem;
      border-radius: var(--mj-radius-sm, 6px);
      background: var(--mj-bg-surface-card, var(--mj-bg-surface));
      border: 1px solid var(--mj-border-default);
    }
    .explain-source { font-size: 0.7rem; font-weight: 700; color: var(--mj-text-secondary); text-transform: uppercase; }
    .explain-summary { margin: 0.35rem 0; font-size: 0.82rem; color: var(--mj-text-primary); }
    .explain-reasons { margin: 0.35rem 0 0 1rem; padding: 0; font-size: 0.8rem; color: var(--mj-text-secondary); }
    .empty-hint { color: var(--mj-text-secondary); font-size: 0.85rem; }
  `],
})
export class ReferralsSeekerIntakeComponent extends BaseResourceComponent implements OnInit {
  private readonly cdr = inject(ChangeDetectorRef);
  protected readonly navService = inject(NavigationService);

  public PracticeAreas: PracticeAreaEntity[] = [];
  public Jurisdictions: JurisdictionEntity[] = [];
  public ReferralTiers: ReferralTierEntity[] = [];
  public Candidates: MatchCandidateScore[] = [];
  public Prefs: SeekerFilterPreferences = {
    PracticeAreaID: '',
    JurisdictionID: '',
    RequiresProBono: false,
    DrawerOpen: false,
  };

  public SeekerName = '';
  public SeekerEmail = '';
  public SelectedTierID = '';
  public UrgencyLevel: ReferralRequestEntity['UrgencyLevel'] = 'Standard';
  public MatterTitle = '';
  public MatterSummary = '';
  public RawIntakeNotes = '';
  public ConflictParties: ConflictCheckPartyDraft[] = [];
  public NewPartyName = '';
  public NewPartyRole: ConflictCheckPartyEntity['PartyRole'] = 'Adverse';
  public NewPartyOrg = '';
  public IsMatching = false;
  public IsSubmitting = false;
  public FeedbackAssignments: ReferralAssignmentEntity[] = [];
  public AssignmentProfessionalNames: Record<string, string> = {};
  public SelectedFeedbackAssignmentID = '';
  public SeekerFeedbackRating = 5;
  public SeekerFeedbackOutcome: FeedbackOutcomeStatus = 'Engaged';
  public SeekerFeedbackComments = '';
  public IsSubmittingFeedback = false;
  public StatusBanner = '';
  public StatusTone: 'info' | 'success' | 'error' = 'info';
  public CandidateReadinessMap: Record<string, number> = {};
  public ExpandedExplainID: string | null = null;

  public get SlaPreviewText(): string {
    const tier = this.ReferralTiers.find((t) => t.ID === this.SelectedTierID);
    if (!tier) {
      return '';
    }
    const isUrgent = this.UrgencyLevel === 'Urgent';
    const now = new Date();
    const deadline = CapacityReadinessService.ComputeSLADeadline(now, tier, isUrgent);
    const effectiveHours = Math.round(((deadline.getTime() - now.getTime()) / (60 * 60 * 1000)) * 10) / 10;
    return `Expected first response within ~${effectiveHours}h`;
  }

  async ngOnInit(): Promise<void> {
    super.ngOnInit();
    this.Prefs = ReferralsUiStateHelper.LoadSeekerPreferences();
    await this.LoadReferenceData();
    ReferralTelemetry.RecordOperation({
      Operation: 'SeekerIntakeView',
      Route: 'app/Referrals/seeker-intake',
      ElapsedMs: 1,
    });
    this.NotifyLoadComplete();
    this.cdr.markForCheck();
  }

  public async LoadReferenceData(): Promise<void> {
    const rv = new RunView();
    const md = new Metadata();
    const results = await rv.RunViews(
      [
        { EntityName: 'MJ_BizApps_Referrals: Practice Areas', ExtraFilter: 'IsActive = 1', OrderBy: 'DisplayRank ASC', ResultType: 'entity_object' },
        { EntityName: 'MJ_BizApps_Referrals: Jurisdictions', ExtraFilter: 'IsActive = 1', OrderBy: 'Name ASC', ResultType: 'entity_object' },
        { EntityName: 'MJ_BizApps_Referrals: Referral Tiers', ExtraFilter: 'IsActive = 1', OrderBy: 'SLAResponseHours DESC', ResultType: 'entity_object' },
      ],
      md.CurrentUser,
    );
    if (results[0]?.Success) this.PracticeAreas = results[0].Results as PracticeAreaEntity[];
    if (results[1]?.Success) this.Jurisdictions = results[1].Results as JurisdictionEntity[];
    if (results[2]?.Success) {
      this.ReferralTiers = results[2].Results as ReferralTierEntity[];
      if (!this.SelectedTierID && this.ReferralTiers.length > 0) {
        this.SelectedTierID = this.ReferralTiers[0].ID;
      }
    }
    await this.LoadSeekerFeedbackAssignments();
  }

  public async LoadSeekerFeedbackAssignments(): Promise<void> {
    this.FeedbackAssignments = [];
    this.AssignmentProfessionalNames = {};
    const seekerEmail = this.SeekerEmail.trim();
    if (!seekerEmail) {
      return;
    }
    const rv = new RunView();
    const md = new Metadata();
    const seekerRequests = await rv.RunView<ReferralRequestEntity>(
      {
        EntityName: 'MJ_BizApps_Referrals: Referral Requests',
        ExtraFilter: `SeekerEmail = '${seekerEmail.replace(/'/g, "''")}'`,
        ResultType: 'entity_object',
      },
      md.CurrentUser,
    );
    const requestIds = seekerRequests.Success ? seekerRequests.Results.map((r) => `'${r.ID}'`) : [];
    if (requestIds.length === 0) {
      return;
    }
    const assignmentsResult = await rv.RunView<ReferralAssignmentEntity>(
      {
        EntityName: 'MJ_BizApps_Referrals: Referral Assignments',
        ExtraFilter: `Status = 'Accepted' AND ReferralRequestID IN (${requestIds.join(', ')})`,
        OrderBy: '__mj_UpdatedAt DESC',
        ResultType: 'entity_object',
      },
      md.CurrentUser,
    );
    if (!assignmentsResult.Success) {
      return;
    }
    this.FeedbackAssignments = assignmentsResult.Results;
    if (!this.SelectedFeedbackAssignmentID && this.FeedbackAssignments.length > 0) {
      this.SelectedFeedbackAssignmentID = this.FeedbackAssignments[0].ID;
    }
    const professionalIds = [...new Set(this.FeedbackAssignments.map((a) => `'${a.ProfessionalProfileID}'`))];
    if (professionalIds.length === 0) {
      return;
    }
    const professionalsResult = await rv.RunView<ProfessionalProfileEntity>(
      {
        EntityName: 'MJ_BizApps_Referrals: Professional Profiles',
        ExtraFilter: `ID IN (${professionalIds.join(', ')})`,
        ResultType: 'entity_object',
      },
      md.CurrentUser,
    );
    if (professionalsResult.Success) {
      const nameByProfileId: Record<string, string> = {};
      for (const pro of professionalsResult.Results) {
        nameByProfileId[pro.ID] = pro.DisplayName;
      }
      for (const a of this.FeedbackAssignments) {
        this.AssignmentProfessionalNames[a.ID] = nameByProfileId[a.ProfessionalProfileID] ?? 'Professional';
      }
    }
  }

  public async ToggleDrawer(): Promise<void> {
    this.Prefs.DrawerOpen = !this.Prefs.DrawerOpen;
    await ReferralsUiStateHelper.SaveSeekerPreferences(this.Prefs);
    this.cdr.markForCheck();
  }

  public async OnPreferenceChange(): Promise<void> {
    await ReferralsUiStateHelper.SaveSeekerPreferences(this.Prefs);
  }

  public async OnSeekerEmailChange(): Promise<void> {
    await this.LoadSeekerFeedbackAssignments();
    this.cdr.markForCheck();
  }

  public ToggleExplainMatch(professionalProfileId: string): void {
    this.ExpandedExplainID = this.ExpandedExplainID === professionalProfileId ? null : professionalProfileId;
    this.cdr.markForCheck();
  }

  public async RunMatchPreview(): Promise<void> {
    if (!this.Prefs.PracticeAreaID || !this.Prefs.JurisdictionID) {
      this.StatusBanner = 'Select both a Practice Area and a Jurisdiction to preview matches.';
      this.StatusTone = 'info';
      this.cdr.markForCheck();
      return;
    }
    this.IsMatching = true;
    this.Prefs.DrawerOpen = true;
    this.cdr.markForCheck();
    try {
      const md = new Metadata();
      this.Candidates = await MatchingEngine.FindMatches(
        {
          PracticeAreaID: this.Prefs.PracticeAreaID,
          JurisdictionID: this.Prefs.JurisdictionID,
          RequiresProBono: this.Prefs.RequiresProBono,
          ConflictParties: this.ConflictParties.map((p) => ({
            PartyName: p.PartyName,
            PartyRole: p.PartyRole,
            OrganizationName: p.OrganizationName || null,
          })),
        },
        md.CurrentUser,
      );
      await this.LoadCandidateReadinessScores(md);
    } finally {
      this.IsMatching = false;
      this.cdr.markForCheck();
    }
  }

  public async LoadCandidateReadinessScores(md: Metadata): Promise<void> {
    this.CandidateReadinessMap = {};
    if (this.Candidates.length === 0) {
      return;
    }
    const rv = new RunView();
    const profileIds = [...new Set(this.Candidates.map((c) => `'${c.ProfessionalProfileID}'`))];
    const result = await rv.RunView<ProfessionalProfileEntity>(
      {
        EntityName: 'MJ_BizApps_Referrals: Professional Profiles',
        ExtraFilter: `ID IN (${profileIds.join(', ')})`,
        ResultType: 'entity_object',
      },
      md.CurrentUser,
    );
    if (result.Success) {
      for (const pro of result.Results) {
        this.CandidateReadinessMap[pro.ID] = pro.ReadinessScore;
      }
    }
  }

  public ParseStructuredIntake(rawText?: string): void {
    const source = (rawText ?? this.RawIntakeNotes).trim();
    if (!source) {
      return;
    }

    const extractField = (labelRegex: RegExp): string | undefined => {
      const m = labelRegex.exec(source);
      return m?.[1]?.trim();
    };

    const nameMatch = extractField(/(?:Name|Seeker)\s*:\s*([^|\n]+)/i);
    if (nameMatch) this.SeekerName = nameMatch;

    const emailMatch =
      extractField(/Email\s*:\s*([^|\n]+)/i) ??
      /\b([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})\b/i.exec(source)?.[1];
    if (emailMatch) this.SeekerEmail = emailMatch;

    const matterMatch = extractField(/(?:Matter|Title|Subject)\s*:\s*([^|\n]+)/i);
    if (matterMatch) this.MatterTitle = matterMatch;

    const summaryMatch = extractField(/(?:Summary|Details|Facts)\s*:\s*([^|\n]+)/i);
    this.MatterSummary = summaryMatch ?? (this.MatterSummary || source);

    if (/\bpro\s*bono\b/i.test(source)) {
      this.Prefs.RequiresProBono = true;
    }

    const adverseMatch = extractField(/(?:Adverse|Opposing|Conflict)\s*(?:Party)?\s*:\s*([^|\n]+)/i);
    if (adverseMatch) {
      for (const rawParty of adverseMatch.split(/[,;]+/)) {
        const partyName = rawParty.trim();
        if (partyName && !this.ConflictParties.some((p) => p.PartyName.toLowerCase() === partyName.toLowerCase())) {
          this.ConflictParties.push({
            PartyName: partyName,
            PartyRole: 'Adverse',
            OrganizationName: partyName,
          });
        }
      }
    }

    this.StatusBanner = 'Parsed structured intake fields. Please review before submitting.';
    this.StatusTone = 'info';
    this.cdr.markForCheck();
  }

  public AddConflictParty(): void {
    const name = this.NewPartyName.trim();
    if (!name) {
      return;
    }
    this.ConflictParties.push({
      PartyName: name,
      PartyRole: this.NewPartyRole,
      OrganizationName: this.NewPartyOrg.trim(),
    });
    this.NewPartyName = '';
    this.NewPartyOrg = '';
    this.cdr.markForCheck();
  }

  public RemoveConflictParty(index: number): void {
    if (index >= 0 && index < this.ConflictParties.length) {
      this.ConflictParties.splice(index, 1);
      this.cdr.markForCheck();
    }
  }

  public async SubmitRequest(): Promise<void> {
    if (!this.SeekerName || !this.SeekerEmail || !this.Prefs.PracticeAreaID || !this.Prefs.JurisdictionID || !this.MatterTitle || !this.MatterSummary) {
      this.StatusBanner = 'Please complete all required intake fields.';
      this.StatusTone = 'error';
      this.cdr.markForCheck();
      return;
    }
    this.IsSubmitting = true;
    this.cdr.markForCheck();
    try {
      const md = new Metadata();
      const provider = Metadata.Provider;
      const hasTx =
        provider != null &&
        'BeginEntityTransaction' in provider &&
        typeof (provider as { BeginEntityTransaction?: () => Promise<object> }).BeginEntityTransaction === 'function';

      if (hasTx) {
        const result = await CascadeRoutingService.SubmitIntakeWithConflicts(
          {
            SeekerName: this.SeekerName,
            SeekerEmail: this.SeekerEmail,
            PracticeAreaID: this.Prefs.PracticeAreaID,
            JurisdictionID: this.Prefs.JurisdictionID,
            ReferralTierID: this.SelectedTierID,
            UrgencyLevel: this.UrgencyLevel,
            MatterTitle: this.MatterTitle,
            MatterSummary: this.MatterSummary,
            RequiresProBono: this.Prefs.RequiresProBono,
            ConflictParties: this.ConflictParties.map((p) => ({
              PartyName: p.PartyName,
              PartyRole: p.PartyRole,
              OrganizationName: p.OrganizationName || null,
            })),
          },
          md.CurrentUser,
        );
        this.StatusBanner = `Referral Request ${result.RequestNumber} submitted with ${this.ConflictParties.length} conflict-check party record(s).`;
        this.StatusTone = 'success';
        return;
      }

      // Client GraphQL fallback: create in Draft, persist and verify every ConflictCheckParty, then promote to Submitted
      const req = await md.GetEntityObject<ReferralRequestEntity>('MJ_BizApps_Referrals: Referral Requests', md.CurrentUser);
      const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const suffix = Math.random().toString(36).slice(2, 7).toUpperCase();
      req.RequestNumber = `REF-${stamp}-${suffix}`;
      req.SeekerName = this.SeekerName;
      req.SeekerEmail = this.SeekerEmail;
      req.PracticeAreaID = this.Prefs.PracticeAreaID;
      req.JurisdictionID = this.Prefs.JurisdictionID;
      req.ReferralTierID = this.SelectedTierID;
      req.UrgencyLevel = this.UrgencyLevel;
      req.MatterTitle = this.MatterTitle;
      req.MatterSummary = this.MatterSummary;
      req.RequiresProBono = this.Prefs.RequiresProBono;
      req.Status = 'Draft';
      const draftSaved = await req.Save();
      if (!draftSaved) {
        this.StatusBanner = req.LatestResult?.CompleteMessage ?? 'Failed to create draft referral request.';
        this.StatusTone = 'error';
        return;
      }

      for (const draft of this.ConflictParties) {
        const party = await md.GetEntityObject<ConflictCheckPartyEntity>(
          'MJ_BizApps_Referrals: Conflict Check Parties',
          md.CurrentUser,
        );
        party.ReferralRequestID = req.ID;
        party.PartyName = draft.PartyName;
        party.PartyRole = draft.PartyRole;
        party.OrganizationName = draft.OrganizationName || null;
        party.NormalizedName = NormalizePartyName(draft.PartyName);
        const partySaved = await party.Save();
        if (!partySaved) {
          await req.Delete();
          this.StatusBanner =
            party.LatestResult?.CompleteMessage ??
            `Failed to persist conflict-check party '${draft.PartyName}'. Request submission aborted.`;
          this.StatusTone = 'error';
          return;
        }
      }

      req.Status = 'Submitted';
      req.SubmittedAt = new Date();
      const submittedSaved = await req.Save();
      if (submittedSaved) {
        this.StatusBanner = `Referral Request ${req.RequestNumber} submitted with ${this.ConflictParties.length} conflict-check party record(s).`;
        this.StatusTone = 'success';
      } else {
        this.StatusBanner = req.LatestResult?.CompleteMessage ?? 'Failed to finalize referral request submission.';
        this.StatusTone = 'error';
      }
    } finally {
      this.IsSubmitting = false;
      this.cdr.markForCheck();
    }
  }

  public async SubmitSeekerFeedback(): Promise<void> {
    if (!this.SelectedFeedbackAssignmentID) return;
    this.IsSubmittingFeedback = true;
    this.cdr.markForCheck();
    try {
      const md = new Metadata();
      const result = await ReferralCredentialService.Instance.SubmitReferralFeedback(
        {
          ReferralAssignmentID: this.SelectedFeedbackAssignmentID,
          Rating: Math.max(1, Math.min(5, Number(this.SeekerFeedbackRating) || 5)),
          OutcomeStatus: this.SeekerFeedbackOutcome,
          SubmittedByType: 'Seeker',
          Comments: this.SeekerFeedbackComments.trim() || null,
        },
        md.CurrentUser,
      );
      this.SeekerFeedbackComments = '';
      this.StatusBanner = `Seeker feedback saved (${result.AverageRating ?? 'N/A'} ★ avg across ${result.TotalCompletedCount} completed referral(s)).`;
      this.StatusTone = 'success';
    } catch (err) {
      this.StatusBanner = err instanceof Error ? err.message : 'Failed to submit seeker feedback.';
      this.StatusTone = 'error';
    } finally {
      this.IsSubmittingFeedback = false;
      this.cdr.markForCheck();
    }
  }

  public OpenProfessionalRecord(id: string): void {
    this.navService.OpenEntityRecord('MJ_BizApps_Referrals: Professional Profiles', CompositeKey.FromID(id));
  }

  async GetResourceDisplayName(_data: ResourceData): Promise<string> {
    return 'Seeker Intake';
  }

  async GetResourceIconClass(_data: ResourceData): Promise<string> {
    return 'fa-solid fa-magnifying-glass';
  }
}
