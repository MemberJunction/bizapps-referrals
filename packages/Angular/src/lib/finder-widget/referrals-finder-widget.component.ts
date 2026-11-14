import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Metadata, RunView } from '@memberjunction/core';
import {
  DomainVocabulary,
  MatchingEngine,
  SupportedDomain,
  VOCABULARY_PRESETS,
  VocabularyService,
} from '@mj-biz-apps/referrals-core';
import {
  JurisdictionEntity,
  PracticeAreaEntity,
  ProfessionalProfileEntity,
  ReferralRequestEntity,
} from '@mj-biz-apps/referrals-entities';

export interface FinderMatchItem {
  ProfileID: string;
  DisplayName: string;
  FirmName: string | null;
  Email: string;
  VerificationStatus: string;
  AvailabilityStatus: string;
  AverageResponseHours: number | null;
  AverageRating: number | null;
  Score: number;
  ExplainableMatchReasons?: string[];
  MatchSummary?: string;
  Bio?: string | null;
}

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  selector: 'mj-referrals-finder',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    :host {
      display: block;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #1e293b;
      box-sizing: border-box;
      max-width: 1080px;
      margin: 0 auto;
    }
    *, *:before, *:after { box-sizing: inherit; }
    .finder-container {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.05);
    }
    .finder-header {
      padding: 1.5rem 2rem;
      background: linear-gradient(135deg, var(--mj-finder-accent, #1e40af), #1e293b);
      color: #ffffff;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .finder-title-group h2 {
      margin: 0 0 0.25rem 0;
      font-size: 1.4rem;
      font-weight: 700;
      color: #ffffff;
    }
    .finder-title-group p {
      margin: 0;
      font-size: 0.9rem;
      color: #cbd5e1;
    }
    .domain-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      background: rgba(255, 255, 255, 0.15);
      border: 1px solid rgba(255, 255, 255, 0.3);
      padding: 0.3rem 0.75rem;
      border-radius: 999px;
      font-size: 0.75rem;
      font-weight: 600;
      color: #ffffff;
    }
    .finder-body {
      padding: 1.5rem 2rem;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .search-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1rem;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }
    .form-group label {
      font-size: 0.8rem;
      font-weight: 600;
      color: #475569;
    }
    .form-control {
      padding: 0.6rem 0.8rem;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      font-size: 0.88rem;
      color: #1e293b;
      background: #ffffff;
      outline: none;
      transition: border-color 0.15s ease-in-out;
    }
    .form-control:focus {
      border-color: var(--mj-finder-accent, #1e40af);
      box-shadow: 0 0 0 3px rgba(30, 64, 175, 0.15);
    }
    .search-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      align-items: center;
      flex-wrap: wrap;
    }
    .btn {
      padding: 0.6rem 1.25rem;
      border-radius: 6px;
      font-size: 0.88rem;
      font-weight: 600;
      cursor: pointer;
      border: 1px solid transparent;
      transition: all 0.15s ease-in-out;
    }
    .btn-primary {
      background: var(--mj-finder-accent, #1e40af);
      color: #ffffff;
    }
    .btn-primary:hover {
      opacity: 0.92;
    }
    .btn-secondary {
      background: #f1f5f9;
      color: #334155;
      border-color: #cbd5e1;
    }
    .btn-secondary:hover {
      background: #e2e8f0;
    }
    .results-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 1rem;
      margin-top: 0.5rem;
    }
    .pro-card {
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 1rem 1.25rem;
      background: #ffffff;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 0.75rem;
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }
    .pro-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    .card-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 0.5rem;
    }
    .card-title {
      font-size: 1rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0;
    }
    .card-firm {
      font-size: 0.82rem;
      color: #64748b;
      margin-top: 0.15rem;
    }
    .score-badge {
      background: #ecfdf5;
      color: #065f46;
      border: 1px solid #a7f3d0;
      padding: 0.2rem 0.5rem;
      border-radius: 999px;
      font-size: 0.75rem;
      font-weight: 700;
    }
    .reasons-list {
      display: flex;
      flex-wrap: wrap;
      gap: 0.35rem;
      margin: 0.25rem 0;
    }
    .reason-chip {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      font-size: 0.74rem;
      color: #334155;
    }
    .card-stats {
      display: flex;
      gap: 1rem;
      font-size: 0.78rem;
      color: #64748b;
      border-top: 1px solid #f1f5f9;
      padding-top: 0.5rem;
    }
    .intake-modal-backdrop {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      padding: 1rem;
    }
    .intake-modal {
      background: #ffffff;
      border-radius: 12px;
      max-width: 600px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      padding: 1.5rem 2rem;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    }
  `],
  template: `
    <div class="finder-container" [style.--mj-finder-accent]="AccentColor">
      <header class="finder-header">
        <div class="finder-title-group">
          <h2>Find a Verified {{ Vocab.ProfessionalLabel }}</h2>
          <p>Instant multi-criteria matching across {{ Vocab.PracticeAreaPluralLabel }} and {{ Vocab.JurisdictionPluralLabel }}</p>
        </div>
        <div class="domain-badge">
          <span>{{ Vocab.DomainKey }} Domain</span>
        </div>
      </header>

      <main class="finder-body">
        <div class="search-row">
          <div class="form-group">
            <label>{{ Vocab.PracticeAreaLabel }}</label>
            <select class="form-control" [(ngModel)]="SelectedPracticeAreaID">
              <option value="">All {{ Vocab.PracticeAreaPluralLabel }}</option>
              @for (pa of PracticeAreas; track pa.ID) {
                <option [value]="pa.ID">{{ pa.Name }}</option>
              }
            </select>
          </div>

          <div class="form-group">
            <label>{{ Vocab.JurisdictionLabel }}</label>
            <select class="form-control" [(ngModel)]="SelectedJurisdictionID">
              <option value="">All {{ Vocab.JurisdictionPluralLabel }}</option>
              @for (jur of Jurisdictions; track jur.ID) {
                <option [value]="jur.ID">{{ jur.Name }}</option>
              }
            </select>
          </div>

          <div class="form-group" style="grid-column: span 2;">
            <label>{{ Vocab.MatterLabel }} Keywords or Summary</label>
            <input
              type="text"
              class="form-control"
              placeholder="e.g. Cross-border acquisition, regulatory compliance, Delaware governance"
              [(ngModel)]="MatterSummary"
              (keyup.enter)="ExecuteSearch()" />
          </div>
        </div>

        <div class="search-actions">
          <label style="font-size: 0.8rem; color: #64748b; display: flex; align-items: center; gap: 0.35rem;">
            <input type="checkbox" [(ngModel)]="RequiresProBono" />
            Accepts Pro Bono / Financial Need
          </label>
          <button type="button" class="btn btn-secondary" (click)="ResetFilters()">Reset</button>
          <button type="button" class="btn btn-primary" (click)="ExecuteSearch()" [disabled]="IsSearching">
            {{ IsSearching ? 'Searching...' : 'Find Matches' }}
          </button>
        </div>

        @if (Matches.length > 0) {
          <div class="results-grid">
            @for (pro of Matches; track pro.ProfileID) {
              <div class="pro-card">
                <div>
                  <div class="card-top">
                    <div>
                      <h4 class="card-title">{{ pro.DisplayName }}</h4>
                      <div class="card-firm">{{ pro.FirmName || 'Independent Practice' }}</div>
                    </div>
                    <span class="score-badge">{{ Math.round(pro.Score) }}% Match</span>
                  </div>

                  @if (pro.ExplainableMatchReasons?.length) {
                    <div class="reasons-list">
                      @for (reason of pro.ExplainableMatchReasons; track reason) {
                        <span class="reason-chip">{{ reason }}</span>
                      }
                    </div>
                  }
                </div>

                <div>
                  <div class="card-stats">
                    <span>SLA: {{ pro.AverageResponseHours != null ? (pro.AverageResponseHours + 'h') : 'N/A' }}</span>
                    <span>Rating: {{ pro.AverageRating != null ? (pro.AverageRating + '/5.0') : 'Unrated' }}</span>
                    <span>Status: {{ pro.AvailabilityStatus }}</span>
                  </div>
                  <button
                    type="button"
                    class="btn btn-primary"
                    style="width: 100%; margin-top: 0.65rem;"
                    (click)="SelectProfessional(pro)">
                    Request Referral
                  </button>
                </div>
              </div>
            }
          </div>
        } @else if (HasSearched && !IsSearching) {
          <div style="text-align: center; padding: 2rem; color: #64748b;">
            <p>No verified {{ Vocab.ProfessionalPluralLabel }} matched your current criteria.</p>
          </div>
        }
      </main>

      <!-- Referral Intake Modal -->
      @if (SelectedPro) {
        <div class="intake-modal-backdrop" (click)="CloseIntake()">
          <div class="intake-modal" (click)="$event.stopPropagation()">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
              <h3 style="margin: 0; font-size: 1.2rem; color: #0f172a;">
                Request Referral with {{ SelectedPro.DisplayName }}
              </h3>
              <button type="button" style="background: none; border: none; font-size: 1.2rem; cursor: pointer;" (click)="CloseIntake()">✕</button>
            </div>

            <div style="display: flex; flex-direction: column; gap: 0.75rem;">
              <div class="form-group">
                <label>Your Name *</label>
                <input type="text" class="form-control" [(ngModel)]="IntakeSeekerName" placeholder="Full Name" />
              </div>

              <div class="form-group">
                <label>Your Email *</label>
                <input type="email" class="form-control" [(ngModel)]="IntakeSeekerEmail" placeholder="you@example.com" />
              </div>

              <div class="form-group">
                <label>Phone Number</label>
                <input type="tel" class="form-control" [(ngModel)]="IntakeSeekerPhone" placeholder="(555) 000-0000" />
              </div>

              <div class="form-group">
                <label>{{ Vocab.MatterLabel }} Title *</label>
                <input type="text" class="form-control" [(ngModel)]="IntakeMatterTitle" placeholder="Summary title of your inquiry" />
              </div>

              <div class="form-group">
                <label>{{ Vocab.MatterLabel }} Details</label>
                <textarea rows="3" class="form-control" [(ngModel)]="IntakeMatterSummary" placeholder="Please describe your legal or professional need..."></textarea>
              </div>

              @if (Vocab.ConflictCheckEnabled) {
                <div class="form-group">
                  <label>Adverse / Opposing Parties (for Conflict Check)</label>
                  <input type="text" class="form-control" [(ngModel)]="IntakeAdverseParty" placeholder="e.g. Counterparty or Company Name" />
                </div>
              }

              @if (IntakeErrorMessage) {
                <div style="padding: 0.5rem; background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; border-radius: 6px; font-size: 0.82rem;">
                  {{ IntakeErrorMessage }}
                </div>
              }

              @if (IntakeSuccessMessage) {
                <div style="padding: 0.75rem; background: #ecfdf5; border: 1px solid #a7f3d0; color: #065f46; border-radius: 6px; font-size: 0.88rem; font-weight: 600;">
                  {{ IntakeSuccessMessage }}
                </div>
              } @else {
                <div style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 0.75rem;">
                  <button type="button" class="btn btn-secondary" (click)="CloseIntake()">Cancel</button>
                  <button type="button" class="btn btn-primary" (click)="SubmitIntake()" [disabled]="IsSubmittingIntake">
                    {{ IsSubmittingIntake ? 'Submitting...' : 'Confirm Request' }}
                  </button>
                </div>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class ReferralsFinderWidgetComponent implements OnInit {
  private readonly cdr = inject(ChangeDetectorRef);
  public readonly Math = Math;

  @Input('domain')
  public set Domain(val: string) {
    if (val in VOCABULARY_PRESETS) {
      this.Vocab = { ...VOCABULARY_PRESETS[val as keyof typeof VOCABULARY_PRESETS] };
    }
  }

  @Input('accent-color')
  public AccentColor: string = '#1e40af';

  @Input('api-url')
  public ApiUrl: string = '';

  @Input('csp-nonce')
  public CspNonce: string = '';

  public Vocab: DomainVocabulary = { ...VOCABULARY_PRESETS.Legal };

  public PracticeAreas: PracticeAreaEntity[] = [];
  public Jurisdictions: JurisdictionEntity[] = [];

  public SelectedPracticeAreaID = '';
  public SelectedJurisdictionID = '';
  public MatterSummary = '';
  public RequiresProBono = false;

  public IsSearching = false;
  public HasSearched = false;
  public Matches: FinderMatchItem[] = [];

  public SelectedPro: FinderMatchItem | null = null;
  public IntakeSeekerName = '';
  public IntakeSeekerEmail = '';
  public IntakeSeekerPhone = '';
  public IntakeMatterTitle = '';
  public IntakeMatterSummary = '';
  public IntakeAdverseParty = '';
  public IsSubmittingIntake = false;
  public IntakeErrorMessage: string | null = null;
  public IntakeSuccessMessage: string | null = null;

  async ngOnInit(): Promise<void> {
    await this.LoadLookups();
    this.cdr.markForCheck();
  }

  public async LoadLookups(): Promise<void> {
    try {
      const rv = new RunView();
      const md = new Metadata();
      const user = md.CurrentUser;
      const res = await rv.RunViews([
        {
          EntityName: 'MJ_BizApps_Referrals: Practice Areas',
          ExtraFilter: 'IsActive = 1',
          ResultType: 'entity_object',
          OrderBy: 'DisplayRank ASC, Name ASC',
        },
        {
          EntityName: 'MJ_BizApps_Referrals: Jurisdictions',
          ExtraFilter: 'IsActive = 1',
          ResultType: 'entity_object',
          OrderBy: 'Name ASC',
        },
      ], user);

      if (res[0]?.Success) {
        this.PracticeAreas = res[0].Results as PracticeAreaEntity[];
      }
      if (res[1]?.Success) {
        this.Jurisdictions = res[1].Results as JurisdictionEntity[];
      }
    } catch {
      // In standalone unauthenticated widget embed mode, gracefully handle lookups
    }
  }

  public async ExecuteSearch(): Promise<void> {
    this.IsSearching = true;
    this.HasSearched = true;
    this.cdr.markForCheck();

    try {
      const rv = new RunView();
      const md = new Metadata();
      const criteria = {
        PracticeAreaID: this.SelectedPracticeAreaID,
        JurisdictionID: this.SelectedJurisdictionID,
        RequiresProBono: this.RequiresProBono,
        MatterSummary: this.MatterSummary,
        MatterTitle: this.MatterSummary,
      };

      const filter = "IsActive = 1 AND VerificationStatus = 'Verified'";
      const proRes = await rv.RunView<ProfessionalProfileEntity>(
        {
          EntityName: 'MJ_BizApps_Referrals: Professional Profiles',
          ExtraFilter: filter,
          ResultType: 'entity_object',
        },
        md.CurrentUser,
      );

      if (proRes.Success) {
        const rawPros = proRes.Results;
        this.Matches = rawPros.map((p) => {
          const scoreResult = MatchingEngine.ScoreCandidate({
            profile: p,
            practiceLink: undefined,
            jurisdictionLink: undefined,
            criteria: {
              ...criteria,
              PracticeAreaID: this.SelectedPracticeAreaID || 'pa-all',
              JurisdictionID: this.SelectedJurisdictionID || 'jur-all',
            },
            conflictParties: [],
            activeMatterParties: [],
          });

          return {
            ProfileID: p.ID,
            DisplayName: p.DisplayName,
            FirmName: p.FirmName,
            Email: p.Email,
            VerificationStatus: p.VerificationStatus,
            AvailabilityStatus: p.AvailabilityStatus,
            AverageResponseHours: p.AverageResponseHours,
            AverageRating: p.AverageRating,
            Score: scoreResult.Score,
            ExplainableMatchReasons: scoreResult.ExplainableMatchReasons,
            MatchSummary: scoreResult.MatchSummary,
            Bio: p.Bio,
          };
        });

        this.Matches.sort((a, b) => b.Score - a.Score);
      }
    } catch (err: unknown) {
      console.warn('Matching execution fallback:', err);
    } finally {
      this.IsSearching = false;
      this.cdr.markForCheck();
    }
  }

  public ResetFilters(): void {
    this.SelectedPracticeAreaID = '';
    this.SelectedJurisdictionID = '';
    this.MatterSummary = '';
    this.RequiresProBono = false;
    this.Matches = [];
    this.HasSearched = false;
    this.cdr.markForCheck();
  }

  public SelectProfessional(pro: FinderMatchItem): void {
    this.SelectedPro = pro;
    this.IntakeMatterTitle = this.MatterSummary || `Inquiry for ${pro.DisplayName}`;
    this.IntakeMatterSummary = this.MatterSummary;
    this.IntakeErrorMessage = null;
    this.IntakeSuccessMessage = null;
    this.cdr.markForCheck();
  }

  public CloseIntake(): void {
    this.SelectedPro = null;
    this.cdr.markForCheck();
  }

  public async SubmitIntake(): Promise<void> {
    if (!this.IntakeSeekerName.trim() || !this.IntakeSeekerEmail.trim() || !this.IntakeMatterTitle.trim()) {
      this.IntakeErrorMessage = 'Please fill in your name, email, and inquiry title.';
      this.cdr.markForCheck();
      return;
    }

    this.IsSubmittingIntake = true;
    this.IntakeErrorMessage = null;
    this.cdr.markForCheck();

    try {
      const md = new Metadata();
      const req = await md.GetEntityObject<ReferralRequestEntity>('MJ_BizApps_Referrals: Referral Requests');
      req.SeekerName = this.IntakeSeekerName.trim();
      req.SeekerEmail = this.IntakeSeekerEmail.trim();
      req.SeekerPhone = this.IntakeSeekerPhone.trim() || null;
      req.MatterTitle = this.IntakeMatterTitle.trim();
      req.MatterSummary = this.IntakeMatterSummary.trim() || '';
      req.UrgencyLevel = 'Standard';
      req.Status = 'Submitted';
      if (this.SelectedPracticeAreaID) req.PracticeAreaID = this.SelectedPracticeAreaID;
      if (this.SelectedJurisdictionID) req.JurisdictionID = this.SelectedJurisdictionID;

      const saved = await req.Save();
      if (saved) {
        this.IntakeSuccessMessage = `Referral request submitted successfully! Tracking reference: ${req.RequestNumber || req.ID}. You will be contacted shortly.`;
      } else {
        this.IntakeErrorMessage = 'Failed to submit referral request. Please try again.';
      }
    } catch (err: unknown) {
      this.IntakeErrorMessage = err instanceof Error ? err.message : 'An error occurred while submitting.';
    } finally {
      this.IsSubmittingIntake = false;
      this.cdr.markForCheck();
    }
  }
}
