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
  MatchCandidateScore,
  MatchingEngine,
  NormalizePartyName,
  ReferralTelemetry,
} from '@mj-biz-apps/referrals-core';
import {
  ConflictCheckPartyEntity,
  JurisdictionEntity,
  PracticeAreaEntity,
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
  ],
  template: `
    <mj-page-layout>
      <mj-page-header Title="Find a Verified Professional" Icon="fa-solid fa-scale-balanced">
        <div class="header-actions">
          <button type="button" class="btn-outline" (click)="ToggleDrawer()">
            {{ Prefs.DrawerOpen ? 'Hide Filters' : 'Directory Filters' }}
          </button>
          <button type="button" class="btn-primary" (click)="RunMatchPreview()" [disabled]="IsMatching">
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
                  <button type="button" class="btn-outline parse-btn" (click)="ParseStructuredIntake()">
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
                <input type="email" [(ngModel)]="SeekerEmail" placeholder="alex@company.com" />
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
                <span>Matter Title *</span>
                <input type="text" [(ngModel)]="MatterTitle" placeholder="Series A Counsel & Delaware Conversion" />
              </label>
            </div>

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
                <button type="button" class="btn-outline" (click)="AddConflictParty()">Add Party</button>
              </div>
              @if (ConflictParties.length > 0) {
                <ul class="conflict-list">
                  @for (party of ConflictParties; track $index) {
                    <li class="conflict-item">
                      <span><strong>{{ party.PartyName }}</strong> ({{ party.PartyRole }}) @if (party.OrganizationName) { — {{ party.OrganizationName }} }</span>
                      <button type="button" class="btn-link" (click)="RemoveConflictParty($index)">Remove</button>
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
              <button type="button" class="btn-primary" (click)="SubmitRequest()" [disabled]="IsSubmitting">
                {{ IsSubmitting ? 'Submitting...' : 'Submit Referral Request' }}
              </button>
            </div>
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
                  @if (c.Eligible) {
                    <div class="candidate-status ok">Conflict Cleared • {{ c.AvailabilityStatus }}</div>
                  } @else {
                    <div class="candidate-status warn">{{ c.DisqualificationReason }}</div>
                  }
                  <button type="button" class="btn-link" (click)="OpenProfessionalRecord(c.ProfessionalProfileID)">
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
    .btn-primary {
      background: var(--mj-brand-primary);
      color: var(--mj-text-inverse);
      border: none;
      border-radius: var(--mj-radius-sm, 6px);
      padding: 0.55rem 1rem;
      font-weight: 600;
      cursor: pointer;
    }
    .btn-outline {
      background: var(--mj-bg-surface);
      color: var(--mj-text-primary);
      border: 1px solid var(--mj-border-default);
      border-radius: var(--mj-radius-sm, 6px);
      padding: 0.5rem 0.9rem;
      cursor: pointer;
    }
    .btn-link {
      background: transparent;
      border: none;
      color: var(--mj-brand-primary);
      padding: 0;
      font-size: 0.8rem;
      cursor: pointer;
      margin-top: 0.35rem;
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
  public MatterTitle = '';
  public MatterSummary = '';
  public RawIntakeNotes = '';
  public ConflictParties: ConflictCheckPartyDraft[] = [];
  public NewPartyName = '';
  public NewPartyRole: ConflictCheckPartyEntity['PartyRole'] = 'Adverse';
  public NewPartyOrg = '';
  public IsMatching = false;
  public IsSubmitting = false;
  public StatusBanner = '';
  public StatusTone: 'info' | 'success' | 'error' = 'info';

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
  }

  public async ToggleDrawer(): Promise<void> {
    this.Prefs.DrawerOpen = !this.Prefs.DrawerOpen;
    await ReferralsUiStateHelper.SaveSeekerPreferences(this.Prefs);
    this.cdr.markForCheck();
  }

  public async OnPreferenceChange(): Promise<void> {
    await ReferralsUiStateHelper.SaveSeekerPreferences(this.Prefs);
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
        },
        md.CurrentUser,
      );
    } finally {
      this.IsMatching = false;
      this.cdr.markForCheck();
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
      const req = await md.GetEntityObject<ReferralRequestEntity>('MJ_BizApps_Referrals: Referral Requests', md.CurrentUser);
      req.SeekerName = this.SeekerName;
      req.SeekerEmail = this.SeekerEmail;
      req.PracticeAreaID = this.Prefs.PracticeAreaID;
      req.JurisdictionID = this.Prefs.JurisdictionID;
      req.ReferralTierID = this.SelectedTierID;
      req.MatterTitle = this.MatterTitle;
      req.MatterSummary = this.MatterSummary;
      req.RequiresProBono = this.Prefs.RequiresProBono;
      req.Status = 'Submitted';
      req.SubmittedAt = new Date();
      const saved = await req.Save();
      if (saved) {
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
          await party.Save();
        }
        this.StatusBanner = `Referral Request ${req.RequestNumber} submitted with ${this.ConflictParties.length} conflict-check party record(s).`;
        this.StatusTone = 'success';
      } else {
        this.StatusBanner = req.LatestResult?.CompleteMessage ?? 'Failed to save referral request.';
        this.StatusTone = 'error';
      }
    } finally {
      this.IsSubmitting = false;
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
