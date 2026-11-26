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
import { RegisterClass, UUIDsEqual } from '@memberjunction/global';
import { BaseResourceComponent, NavigationService } from '@memberjunction/ng-shared';
import {
  MJButtonDirective,
  MJPageBodyComponent,
  MJPageHeaderComponent,
  MJPageLayoutComponent,
} from '@memberjunction/ng-ui-components';
import {
  CredentialProviderDescriptor,
  DomainVocabulary,
  ReferralCredentialService,
  VocabularyService,
} from '@mj-biz-apps/referrals-core';
import {
  ProfessionalCredentialEntity,
  ProfessionalJurisdictionEntity,
  ProfessionalPracticeAreaEntity,
  ProfessionalProfileEntity,
  ReferralsEngineBase,
} from '@mj-biz-apps/referrals-entities';
import { DirectoryPreferences, ReferralsUiStateHelper } from '../services/referrals-ui-state.service.js';

export interface DirectoryProfileCard {
  Profile: ProfessionalProfileEntity;
  PracticeAreaNames: string[];
  JurisdictionNames: string[];
  Credentials: ProfessionalCredentialEntity[];
}

export interface VerificationQueueItem {
  Credential: ProfessionalCredentialEntity;
  ProfileName: string;
}

@RegisterClass(BaseResourceComponent, 'ReferralsCredentialDirectoryResource')
@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MJButtonDirective,
    MJPageLayoutComponent,
    MJPageHeaderComponent,
    MJPageBodyComponent,
  ],
  selector: 'mj-referrals-credential-directory',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    .directory-container {
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      background: var(--mj-bg-page);
      min-height: 100%;
    }
    .header-actions {
      display: flex;
      gap: 0.65rem;
      align-items: center;
      flex-wrap: wrap;
    }
    .filter-bar {
      background: var(--mj-bg-surface);
      border: 1px solid var(--mj-border-default);
      border-radius: 8px;
      padding: 1rem 1.25rem;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      align-items: flex-end;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }
    .form-group label {
      font-size: 0.78rem;
      font-weight: 600;
      color: var(--mj-text-secondary);
    }
    .form-control {
      padding: 0.55rem 0.75rem;
      border: 1px solid var(--mj-border-default);
      border-radius: 6px;
      font-size: 0.85rem;
      outline: none;
      background: var(--mj-bg-surface);
      color: var(--mj-text-primary);
    }
    .cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 1.25rem;
    }
    .pro-card {
      background: var(--mj-bg-surface);
      border: 1px solid var(--mj-border-default);
      border-radius: 8px;
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 1rem;
    }
    .pro-name {
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--mj-text-primary);
      margin: 0;
    }
    .pro-firm {
      font-size: 0.82rem;
      color: var(--mj-text-secondary);
      margin-top: 0.15rem;
    }
    .pro-license {
      font-size: 0.78rem;
      color: var(--mj-text-muted);
      margin-top: 0.2rem;
    }
    .pro-bio {
      font-size: 0.8rem;
      color: var(--mj-text-secondary);
      margin: 0.65rem 0 0 0;
      line-height: 1.35;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .pro-pills {
      display: flex;
      flex-wrap: wrap;
      gap: 0.35rem;
      margin-top: 0.65rem;
    }
    .pill {
      display: inline-block;
      padding: 0.2rem 0.55rem;
      border-radius: 9999px;
      font-size: 0.72rem;
      font-weight: 600;
      border: 1px solid var(--mj-border-default);
      background: var(--mj-bg-surface-sunken);
      color: var(--mj-text-secondary);
    }
    .pill-verified {
      background: var(--mj-status-success-bg);
      color: var(--mj-status-success-text);
      border-color: var(--mj-status-success-border);
    }
    .pill-pending {
      background: var(--mj-status-warning-bg);
      color: var(--mj-status-warning-text);
      border-color: var(--mj-status-warning-border);
    }
    .pill-avail {
      background: var(--mj-status-info-bg);
      color: var(--mj-status-info-text);
      border-color: var(--mj-status-info-border);
    }
    .pill-accent {
      background: var(--mj-bg-surface-hover);
      color: var(--mj-brand-primary);
      border-color: var(--mj-border-default);
    }
    .pro-metrics {
      display: flex;
      justify-content: space-between;
      border-top: 1px solid var(--mj-border-subtle);
      padding-top: 0.75rem;
      font-size: 0.8rem;
    }
    .metric-col {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
    }
    .metric-lbl { font-size: 0.7rem; color: var(--mj-text-muted); }
    .metric-val { font-size: 0.88rem; font-weight: 700; color: var(--mj-text-primary); }
    .card-footer {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
      margin-top: 0.85rem;
    }
    .btn {
      padding: 0.45rem 0.85rem;
      border-radius: 6px;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      border: 1px solid var(--mj-border-default);
      background: var(--mj-bg-surface);
      color: var(--mj-text-primary);
    }
    .btn-primary {
      background: var(--mj-brand-primary);
      color: var(--mj-text-inverse);
      border-color: var(--mj-brand-primary);
    }
    .btn-danger {
      background: var(--mj-status-error-bg);
      color: var(--mj-status-error-text);
      border-color: var(--mj-status-error-border);
    }
    .queue-panel {
      background: var(--mj-bg-surface);
      border: 1px solid var(--mj-border-default);
      border-radius: 8px;
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
    }
    .queue-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.75rem;
    }
    .queue-header h3 {
      margin: 0;
      font-size: 1rem;
      color: var(--mj-text-primary);
    }
    .queue-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.75rem;
      padding: 0.75rem;
      border: 1px solid var(--mj-border-subtle);
      border-radius: 6px;
      background: var(--mj-bg-surface-sunken);
    }
    .queue-info {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
    }
    .queue-actions {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }
    .status-banner {
      padding: 0.65rem 0.9rem;
      border-radius: 6px;
      font-size: 0.84rem;
      background: var(--mj-status-info-bg);
      color: var(--mj-status-info-text);
      border: 1px solid var(--mj-status-info-border);
    }
    .empty-state {
      grid-column: 1 / -1;
      text-align: center;
      padding: 2.5rem;
      color: var(--mj-text-muted);
    }
  `],
  template: `
    <mj-page-layout>
      <mj-page-header [Title]="'Directory & ' + Vocab.ProfessionalPluralLabel" Icon="fa-solid fa-address-book">
        <div class="header-actions" actions>
          <button
            type="button"
            mjButton
            [Variant]="Prefs.ShowVerificationQueue ? 'primary' : 'outline'"
            Size="sm"
            (click)="ToggleVerificationQueue()"
          >
            Verification Queue ({{ PendingQueue.length }})
          </button>
          <button type="button" mjButton Variant="outline" Size="sm" (click)="ResetFilters()">Reset Filters</button>
          <button type="button" mjButton Variant="primary" Size="sm" (click)="LoadProfiles()">Refresh</button>
        </div>
      </mj-page-header>
      <mj-page-body>
        <div class="directory-container">
          @if (StatusMessage) {
            <div class="status-banner">{{ StatusMessage }}</div>
          }

          @if (Prefs.ShowVerificationQueue) {
            <section class="queue-panel" aria-label="Coordinator Verification Queue">
              <div class="queue-header">
                <h3>Coordinator Verification Queue</h3>
                <div class="queue-actions">
                  <label class="form-group">
                    <span>Verification Provider</span>
                    <select class="form-control" [(ngModel)]="SelectedProviderKey">
                      @for (p of Providers; track p.ProviderKey) {
                        <option [value]="p.ProviderKey" [disabled]="!p.Available">
                          {{ p.DisplayName }} ({{ p.Available ? 'Ready' : 'Not Installed' }})
                        </option>
                      }
                    </select>
                  </label>
                </div>
              </div>
              @for (item of PendingQueue; track item.Credential.ID) {
                <div class="queue-row">
                  <div class="queue-info">
                    <strong>{{ item.ProfileName }} — {{ item.Credential.CredentialName }}</strong>
                    <span class="pro-license">
                      Code: {{ item.Credential.CredentialCode }} • Provider: {{ item.Credential.ProviderKey }} • Status: {{ item.Credential.VerificationStatus }}
                    </span>
                  </div>
                  <div class="queue-actions">
                    <button
                      type="button"
                      mjButton
                      Variant="primary"
                      Size="sm"
                      [disabled]="IsVerifying"
                      (click)="VerifyCredential(item.Credential, 'Verified')"
                    >
                      Verify
                    </button>
                    <button
                      type="button"
                      mjButton
                      Variant="danger"
                      Size="sm"
                      [disabled]="IsVerifying"
                      (click)="VerifyCredential(item.Credential, 'Rejected')"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              } @empty {
                <div class="pro-license">All credentials in the directory are verified.</div>
              }
            </section>
          }

          <section class="filter-bar">
            <div class="form-group">
              <label>Search Name, Firm, License, or {{ Vocab.PracticeAreaLabel }}</label>
              <input
                type="text"
                class="form-control"
                [(ngModel)]="SearchTerm"
                (ngModelChange)="OnFilterInputChange()"
                placeholder="e.g., Litigation, California, LIC-1042..."
              />
            </div>

            <div class="form-group">
              <label>Availability Status</label>
              <select class="form-control" [(ngModel)]="AvailabilityFilter" (ngModelChange)="ApplyFilters()">
                <option value="All">All Availabilities</option>
                <option value="Available">Available</option>
                <option value="Limited">Limited</option>
                <option value="OnLeave">On Leave</option>
                <option value="Unavailable">Unavailable</option>
              </select>
            </div>

            <div class="form-group">
              <label>Verification Status</label>
              <select class="form-control" [(ngModel)]="VerificationFilter" (ngModelChange)="ApplyFilters()">
                <option value="All">All Statuses</option>
                <option value="Verified">Verified Only</option>
                <option value="Pending">Pending Verification</option>
                <option value="Expired">Expired</option>
              </select>
            </div>
          </section>

          <section class="cards-grid">
            @if (FilteredCards.length === 0) {
              <div class="empty-state">
                No {{ Vocab.ProfessionalPluralLabel.toLowerCase() }} matched the current directory filters.
              </div>
            }

            @for (card of FilteredCards; track card.Profile.ID) {
              <div class="pro-card">
                <div>
                  <div class="queue-header">
                    <div>
                      <h3 class="pro-name">{{ card.Profile.DisplayName }}</h3>
                      <div class="pro-firm">{{ card.Profile.FirmName || 'Independent Practice' }}</div>
                      @if (card.Profile.LicenseNumber) {
                        <div class="pro-license">License: {{ card.Profile.LicenseNumber }}</div>
                      }
                    </div>
                  </div>

                  <div class="pro-pills">
                    <span
                      class="pill"
                      [class.pill-verified]="card.Profile.VerificationStatus === 'Verified'"
                      [class.pill-pending]="card.Profile.VerificationStatus !== 'Verified'"
                    >
                      {{ card.Profile.VerificationStatus }}
                    </span>
                    <span class="pill pill-avail">{{ card.Profile.AvailabilityStatus }}</span>
                    @if (card.Profile.AcceptsProBono) {
                      <span class="pill pill-accent">Pro Bono</span>
                    }
                  </div>

                  @if (card.Credentials.length > 0) {
                    <div class="pro-pills">
                      @for (cred of card.Credentials; track cred.ID) {
                        <span
                          class="pill"
                          [class.pill-verified]="cred.VerificationStatus === 'Verified'"
                          [class.pill-pending]="cred.VerificationStatus !== 'Verified'"
                        >
                          {{ cred.CredentialCode }} ({{ cred.VerificationStatus }})
                        </span>
                      }
                    </div>
                  }

                  <div class="pro-pills">
                    @for (pa of card.PracticeAreaNames; track pa) {
                      <span class="pill pill-accent">{{ pa }}</span>
                    }
                  </div>

                  <div class="pro-pills">
                    @for (jur of card.JurisdictionNames; track jur) {
                      <span class="pill">{{ jur }}</span>
                    }
                  </div>

                  @if (card.Profile.Bio) {
                    <p class="pro-bio">{{ card.Profile.Bio }}</p>
                  }
                </div>

                <div>
                  <div class="pro-metrics">
                    <div class="metric-col">
                      <span class="metric-lbl">Capacity</span>
                      <span class="metric-val">{{ card.Profile.ActiveReferralCount }} / {{ card.Profile.MaxConcurrentReferrals }}</span>
                    </div>
                    <div class="metric-col">
                      <span class="metric-lbl">Avg Response</span>
                      <span class="metric-val">{{ card.Profile.AverageResponseHours != null ? (card.Profile.AverageResponseHours + 'h') : 'N/A' }}</span>
                    </div>
                    <div class="metric-col">
                      <span class="metric-lbl">Rating</span>
                      <span class="metric-val">{{ card.Profile.AverageRating != null ? (card.Profile.AverageRating + ' ★') : 'Unrated' }}</span>
                    </div>
                  </div>

                  <div class="card-footer">
                    <button type="button" mjButton Variant="outline" Size="sm" (click)="OpenProfile(card.Profile.ID)">View Profile</button>
                  </div>
                </div>
              </div>
            }
          </section>
        </div>
      </mj-page-body>
    </mj-page-layout>
  `,
})
export class ReferralsCredentialDirectoryComponent extends BaseResourceComponent implements OnInit {
  private readonly cdr = inject(ChangeDetectorRef);
  protected override readonly navigationService = inject(NavigationService);
  public Vocab: DomainVocabulary = VocabularyService.Instance.Current;

  public Prefs: DirectoryPreferences = ReferralsUiStateHelper.LoadDirectoryPreferences();
  public SearchTerm = this.Prefs.SearchTerm;
  public AvailabilityFilter = 'All';
  public VerificationFilter = 'Verified';

  public AllCards: DirectoryProfileCard[] = [];
  public FilteredCards: DirectoryProfileCard[] = [];
  public PendingQueue: VerificationQueueItem[] = [];
  public Providers: CredentialProviderDescriptor[] = [];
  public SelectedProviderKey = 'Manual';
  public IsVerifying = false;
  public StatusMessage = '';

  override async GetResourceDisplayName(_data: ResourceData): Promise<string> {
    return 'Directory & Pros';
  }

  override async GetResourceIconClass(_data: ResourceData): Promise<string> {
    return 'fa-solid fa-address-book';
  }

  async ngOnInit(): Promise<void> {
    super.ngOnInit();
    queueMicrotask(() => this.NotifyLoadStarted());
    try {
      this.Providers = ReferralCredentialService.Instance.ListProviders();
      await this.LoadProfiles();
    } finally {
      this.NotifyLoadComplete();
      this.cdr.markForCheck();
    }
  }

  public async LoadProfiles(): Promise<void> {
    try {
      const md = new Metadata();
      const rv =
        Metadata.Provider && typeof RunView.FromMetadataProvider === 'function'
          ? RunView.FromMetadataProvider(Metadata.Provider)
          : new RunView();

      const [, batchResults] = await Promise.all([
        ReferralsEngineBase.Instance.Config(false, md.CurrentUser),
        rv.RunViews(
          [
            {
              EntityName: 'MJ_BizApps_Referrals: Professional Profiles',
              ExtraFilter: 'IsActive = 1',
              ResultType: 'simple',
              OrderBy: 'DisplayName ASC',
            },
            {
              EntityName: 'MJ_BizApps_Referrals: Professional Practice Areas',
              ResultType: 'simple',
            },
            {
              EntityName: 'MJ_BizApps_Referrals: Professional Jurisdictions',
              ResultType: 'simple',
            },
            {
              EntityName: 'MJ_BizApps_Referrals: Professional Credentials',
              ResultType: 'simple',
            },
          ],
          md.CurrentUser,
        ),
      ]);

      const [proRes, ppaRes, pjRes, credRes] = batchResults;

      if (proRes?.Success) {
        const engine = ReferralsEngineBase.Instance;
        const profiles = proRes.Results as ProfessionalProfileEntity[];
        const ppaList = ppaRes?.Success ? (ppaRes.Results as ProfessionalPracticeAreaEntity[]) : [];
        const pjList = pjRes?.Success ? (pjRes.Results as ProfessionalJurisdictionEntity[]) : [];
        const credList = credRes?.Success ? (credRes.Results as ProfessionalCredentialEntity[]) : [];
        const profileNameMap = new Map<string, string>();
        profiles.forEach((p) => profileNameMap.set(p.ID.toLowerCase(), p.DisplayName));

        this.AllCards = profiles.map((p) => {
          const paNames = ppaList
            .filter((l) => UUIDsEqual(l.ProfessionalProfileID, p.ID))
            .map((l) => engine.PracticeAreaById(l.PracticeAreaID)?.Name ?? '')
            .filter(Boolean);

          const jurNames = pjList
            .filter((l) => UUIDsEqual(l.ProfessionalProfileID, p.ID))
            .map((l) => engine.JurisdictionById(l.JurisdictionID)?.Name ?? '')
            .filter(Boolean);

          const creds = credList.filter((c) => UUIDsEqual(c.ProfessionalProfileID, p.ID));

          return {
            Profile: p,
            PracticeAreaNames: paNames,
            JurisdictionNames: jurNames,
            Credentials: creds,
          };
        });

        this.PendingQueue = credList
          .filter((c) => c.VerificationStatus === 'Pending')
          .map((c) => ({
            Credential: c,
            ProfileName: profileNameMap.get(c.ProfessionalProfileID.toLowerCase()) ?? 'Professional',
          }));

        this.ApplyFilters();
      }
    } catch {
      // In standalone or test mode
    }
  }

  public async ToggleVerificationQueue(): Promise<void> {
    this.Prefs = { ...this.Prefs, ShowVerificationQueue: !this.Prefs.ShowVerificationQueue };
    await ReferralsUiStateHelper.SaveDirectoryPreferences(this.Prefs);
    this.cdr.markForCheck();
  }

  public async OnFilterInputChange(): Promise<void> {
    this.Prefs = { ...this.Prefs, SearchTerm: this.SearchTerm };
    await ReferralsUiStateHelper.SaveDirectoryPreferences(this.Prefs);
    this.ApplyFilters();
  }

  public async VerifyCredential(
    credential: ProfessionalCredentialEntity,
    targetStatus: 'Verified' | 'Rejected',
  ): Promise<void> {
    this.IsVerifying = true;
    this.StatusMessage = '';
    this.cdr.markForCheck();
    try {
      const md = new Metadata();
      const result = await ReferralCredentialService.Instance.VerifyAndPersistCredential(
        {
          ProfessionalProfileID: credential.ProfessionalProfileID,
          ProfessionalCredentialID: credential.ID,
          CredentialCode: credential.CredentialCode,
          CredentialName: credential.CredentialName,
          IssuerName: credential.IssuerName,
          JurisdictionID: credential.JurisdictionID,
          ExternalReferenceID: credential.ExternalReferenceID,
          EvidenceURL: credential.EvidenceURL,
          ProviderKey: this.SelectedProviderKey,
          ForceStatus: targetStatus,
        },
        md.CurrentUser,
      );
      this.StatusMessage = result.Message;
      await this.LoadProfiles();
    } catch (err) {
      this.StatusMessage = err instanceof Error ? err.message : 'Credential verification failed.';
    } finally {
      this.IsVerifying = false;
      this.cdr.markForCheck();
    }
  }

  public ApplyFilters(): void {
    const term = this.SearchTerm.toLowerCase().trim();
    this.FilteredCards = this.AllCards.filter((card) => {
      const p = card.Profile;
      const matchSearch =
        !term ||
        p.DisplayName.toLowerCase().includes(term) ||
        (p.FirmName && p.FirmName.toLowerCase().includes(term)) ||
        (p.LicenseNumber && p.LicenseNumber.toLowerCase().includes(term)) ||
        card.Credentials.some((c) => c.CredentialCode.toLowerCase().includes(term)) ||
        card.PracticeAreaNames.some((n) => n.toLowerCase().includes(term)) ||
        card.JurisdictionNames.some((n) => n.toLowerCase().includes(term));

      const matchAvail =
        this.AvailabilityFilter === 'All' || p.AvailabilityStatus === this.AvailabilityFilter;
      const matchVerif =
        this.VerificationFilter === 'All' || p.VerificationStatus === this.VerificationFilter;
      return matchSearch && matchAvail && matchVerif;
    });
    this.cdr.markForCheck();
  }

  public ResetFilters(): void {
    this.SearchTerm = '';
    this.AvailabilityFilter = 'All';
    this.VerificationFilter = 'Verified';
    this.ApplyFilters();
  }

  public OpenProfile(id: string): void {
    this.navigationService.OpenEntityRecord(
      'MJ_BizApps_Referrals: Professional Profiles',
      CompositeKey.FromID(id),
    );
  }
}
