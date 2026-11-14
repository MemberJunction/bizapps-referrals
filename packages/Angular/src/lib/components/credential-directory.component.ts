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
import { NavigationService } from '@memberjunction/ng-shared';
import {
  DomainVocabulary,
  VOCABULARY_PRESETS,
  VocabularyService,
} from '@mj-biz-apps/referrals-core';
import {
  JurisdictionEntity,
  PracticeAreaEntity,
  ProfessionalProfileEntity,
} from '@mj-biz-apps/referrals-entities';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  selector: 'mj-referrals-credential-directory',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    .directory-container {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      background: var(--mj-bg-surface-page, #f8fafc);
      min-height: 100%;
    }
    .directory-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--mj-border-default, #e2e8f0);
    }
    .directory-title h2 {
      margin: 0 0 0.25rem 0;
      font-size: 1.35rem;
      font-weight: 700;
      color: var(--mj-text-primary, #0f172a);
    }
    .directory-title p {
      margin: 0;
      font-size: 0.85rem;
      color: var(--mj-text-secondary, #64748b);
    }
    .filter-bar {
      background: #ffffff;
      border: 1px solid var(--mj-border-default, #e2e8f0);
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
      color: #475569;
    }
    .form-control {
      padding: 0.55rem 0.75rem;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      font-size: 0.85rem;
      outline: none;
      background: #ffffff;
    }
    .cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 1.25rem;
    }
    .pro-card {
      background: #ffffff;
      border: 1px solid var(--mj-border-default, #e2e8f0);
      border-radius: 8px;
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 1rem;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
    }
    .pro-name {
      font-size: 1.05rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0;
    }
    .pro-firm {
      font-size: 0.82rem;
      color: #64748b;
      margin-top: 0.15rem;
    }
    .pro-pills {
      display: flex;
      gap: 0.35rem;
      flex-wrap: wrap;
      margin-top: 0.5rem;
    }
    .pill {
      padding: 0.18rem 0.55rem;
      border-radius: 999px;
      font-size: 0.72rem;
      font-weight: 600;
    }
    .pill-verified { background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; }
    .pill-avail { background: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe; }
    .pro-metrics {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 0.5rem;
      border-top: 1px solid #f1f5f9;
      padding-top: 0.75rem;
    }
    .metric-col {
      display: flex;
      flex-direction: column;
      gap: 0.1rem;
    }
    .metric-lbl { font-size: 0.7rem; color: #64748b; }
    .metric-val { font-size: 0.88rem; font-weight: 700; color: #0f172a; }
    .btn {
      padding: 0.45rem 0.85rem;
      border-radius: 6px;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      border: 1px solid #cbd5e1;
      background: #ffffff;
      color: #334155;
    }
    .btn-primary {
      background: var(--mj-brand-primary, #1e40af);
      color: #ffffff;
      border-color: var(--mj-brand-primary, #1e40af);
    }
  `],
  template: `
    <div class="directory-container">
      <header class="directory-header">
        <div class="directory-title">
          <h2>Verified Member Directory & Credential Explorer</h2>
          <p>Browse roster of certified, active {{ Vocab.ProfessionalPluralLabel }} with live credentials and capacity</p>
        </div>
      </header>

      <section class="filter-bar">
        <div class="form-group">
          <label>Search Name / Firm</label>
          <input type="text" class="form-control" [(ngModel)]="SearchTerm" (input)="ApplyFilters()" placeholder="Filter by name..." />
        </div>

        <div class="form-group">
          <label>Availability</label>
          <select class="form-control" [(ngModel)]="AvailabilityFilter" (change)="ApplyFilters()">
            <option value="All">All Statuses</option>
            <option value="Available">Available</option>
            <option value="Limited">Limited Capacity</option>
            <option value="OnLeave">On Leave</option>
          </select>
        </div>

        <div class="form-group">
          <label>Verification Status</label>
          <select class="form-control" [(ngModel)]="VerificationFilter" (change)="ApplyFilters()">
            <option value="All">All</option>
            <option value="Verified">Verified Only</option>
            <option value="Pending">Pending</option>
          </select>
        </div>

        <div style="display: flex; gap: 0.5rem;">
          <button type="button" class="btn" (click)="ResetFilters()">Reset</button>
        </div>
      </section>

      <section class="cards-grid">
        @for (pro of FilteredProfiles; track pro.ID) {
          <div class="pro-card">
            <div>
              <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div>
                  <h3 class="pro-name">{{ pro.DisplayName }}</h3>
                  <div class="pro-firm">{{ pro.FirmName || 'Independent Practice' }}</div>
                </div>
              </div>

              <div class="pro-pills">
                <span class="pill pill-verified">{{ pro.VerificationStatus }}</span>
                <span class="pill pill-avail">{{ pro.AvailabilityStatus }}</span>
                @if (pro.AcceptsProBono) {
                  <span class="pill" style="background: #fdf4ff; color: #86198f; border: 1px solid #f0abfc;">Pro Bono</span>
                }
              </div>

              @if (pro.Bio) {
                <p style="font-size: 0.8rem; color: #475569; margin: 0.65rem 0 0 0; line-height: 1.35; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                  {{ pro.Bio }}
                </p>
              }
            </div>

            <div>
              <div class="pro-metrics">
                <div class="metric-col">
                  <span class="metric-lbl">Active Load</span>
                  <span class="metric-val">{{ pro.ActiveReferralCount }} / {{ pro.MaxConcurrentReferrals }}</span>
                </div>
                <div class="metric-col">
                  <span class="metric-lbl">Avg Response</span>
                  <span class="metric-val">{{ pro.AverageResponseHours != null ? (pro.AverageResponseHours + 'h') : 'N/A' }}</span>
                </div>
                <div class="metric-col">
                  <span class="metric-lbl">Rating</span>
                  <span class="metric-val">{{ pro.AverageRating != null ? (pro.AverageRating + ' ★') : 'Unrated' }}</span>
                </div>
              </div>

              <div style="display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 0.85rem;">
                <button type="button" class="btn" (click)="OpenProfile(pro.ID)">View Profile</button>
              </div>
            </div>
          </div>
        }
      </section>
    </div>
  `,
})
export class ReferralsCredentialDirectoryComponent implements OnInit {
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly navService = inject(NavigationService);
  public Vocab: DomainVocabulary = VocabularyService.Instance.Current;

  public SearchTerm = '';
  public AvailabilityFilter = 'All';
  public VerificationFilter = 'Verified';

  public AllProfiles: ProfessionalProfileEntity[] = [];
  public FilteredProfiles: ProfessionalProfileEntity[] = [];

  async ngOnInit(): Promise<void> {
    await this.LoadProfiles();
    this.cdr.markForCheck();
  }

  public async LoadProfiles(): Promise<void> {
    try {
      const rv = new RunView();
      const md = new Metadata();
      const res = await rv.RunView<ProfessionalProfileEntity>(
        {
          EntityName: 'MJ_BizApps_Referrals: Professional Profiles',
          ExtraFilter: 'IsActive = 1',
          ResultType: 'entity_object',
          OrderBy: 'DisplayName ASC',
        },
        md.CurrentUser,
      );
      if (res.Success) {
        this.AllProfiles = res.Results;
        this.ApplyFilters();
      }
    } catch {
      // In standalone or test mode
    }
  }

  public ApplyFilters(): void {
    const term = this.SearchTerm.toLowerCase().trim();
    this.FilteredProfiles = this.AllProfiles.filter((p) => {
      const matchSearch =
        !term ||
        p.DisplayName.toLowerCase().includes(term) ||
        (p.FirmName && p.FirmName.toLowerCase().includes(term));
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
    this.navService.OpenEntityRecord('MJ_BizApps_Referrals: Professional Profiles', CompositeKey.FromID(id));
  }
}
