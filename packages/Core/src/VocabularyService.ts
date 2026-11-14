import { BaseSingleton } from '@memberjunction/global';

export type SupportedDomain = 'Legal' | 'Medical' | 'Accounting' | 'Consulting' | 'Custom';

export interface DomainVocabulary {
  DomainKey: SupportedDomain;
  ProfessionalLabel: string;
  ProfessionalPluralLabel: string;
  MatterLabel: string;
  MatterPluralLabel: string;
  PracticeAreaLabel: string;
  PracticeAreaPluralLabel: string;
  JurisdictionLabel: string;
  JurisdictionPluralLabel: string;
  SeekerLabel: string;
  SeekerPluralLabel: string;
  ConflictCheckEnabled: boolean;
  AccentColor?: string;
  Description?: string;
}

export const VOCABULARY_PRESETS: Record<'Legal' | 'Medical' | 'Accounting' | 'Consulting', DomainVocabulary> = {
  Legal: {
    DomainKey: 'Legal',
    ProfessionalLabel: 'Attorney',
    ProfessionalPluralLabel: 'Attorneys',
    MatterLabel: 'Legal Matter',
    MatterPluralLabel: 'Legal Matters',
    PracticeAreaLabel: 'Practice Area',
    PracticeAreaPluralLabel: 'Practice Areas',
    JurisdictionLabel: 'Jurisdiction / Bar',
    JurisdictionPluralLabel: 'Jurisdictions',
    SeekerLabel: 'Client',
    SeekerPluralLabel: 'Clients',
    ConflictCheckEnabled: true,
    AccentColor: '#1e40af',
    Description: 'Legal referral network, conflict screening, bar admissions, and attorney match cascade.',
  },
  Medical: {
    DomainKey: 'Medical',
    ProfessionalLabel: 'Physician',
    ProfessionalPluralLabel: 'Physicians',
    MatterLabel: 'Patient Referral',
    MatterPluralLabel: 'Patient Referrals',
    PracticeAreaLabel: 'Medical Specialty',
    PracticeAreaPluralLabel: 'Medical Specialties',
    JurisdictionLabel: 'State / Medical License',
    JurisdictionPluralLabel: 'State Medical Boards',
    SeekerLabel: 'Patient',
    SeekerPluralLabel: 'Patients',
    ConflictCheckEnabled: false,
    AccentColor: '#059669',
    Description: 'Clinical specialty routing, physician credentialing, on-call availability, and patient referral loop.',
  },
  Accounting: {
    DomainKey: 'Accounting',
    ProfessionalLabel: 'CPA / Advisor',
    ProfessionalPluralLabel: 'CPAs & Advisors',
    MatterLabel: 'Tax / Audit Engagement',
    MatterPluralLabel: 'Engagements',
    PracticeAreaLabel: 'Service Line',
    PracticeAreaPluralLabel: 'Service Lines',
    JurisdictionLabel: 'State Accountancy Board',
    JurisdictionPluralLabel: 'State Accountancy Boards',
    SeekerLabel: 'Client',
    SeekerPluralLabel: 'Clients',
    ConflictCheckEnabled: true,
    AccentColor: '#7c3aed',
    Description: 'Public accounting network, independence conflict verification, engagement routing, and advisory SLA.',
  },
  Consulting: {
    DomainKey: 'Consulting',
    ProfessionalLabel: 'Consultant',
    ProfessionalPluralLabel: 'Consultants',
    MatterLabel: 'Advisory Project',
    MatterPluralLabel: 'Advisory Projects',
    PracticeAreaLabel: 'Domain Capability',
    PracticeAreaPluralLabel: 'Domain Capabilities',
    JurisdictionLabel: 'Territory / Region',
    JurisdictionPluralLabel: 'Territories',
    SeekerLabel: 'Client',
    SeekerPluralLabel: 'Clients',
    ConflictCheckEnabled: false,
    AccentColor: '#d97706',
    Description: 'Professional services advisory network, domain expertise matching, proposal cascade, and client feedback.',
  },
};

export class VocabularyService extends BaseSingleton<VocabularyService> {
  private _currentVocabulary: DomainVocabulary = { ...VOCABULARY_PRESETS.Legal };

  protected constructor() {
    super();
  }

  public static get Instance(): VocabularyService {
    return super.getInstance<VocabularyService>();
  }

  public get Current(): DomainVocabulary {
    return this._currentVocabulary;
  }

  public SetDomain(domain: 'Legal' | 'Medical' | 'Accounting' | 'Consulting'): void {
    this._currentVocabulary = { ...VOCABULARY_PRESETS[domain] };
  }

  public ConfigureCustom(custom: Partial<DomainVocabulary>): void {
    this._currentVocabulary = {
      ...this._currentVocabulary,
      ...custom,
      DomainKey: 'Custom',
    };
  }

  public Format(pattern: string): string {
    return pattern
      .replace(/{Professional}/g, this._currentVocabulary.ProfessionalLabel)
      .replace(/{Professionals}/g, this._currentVocabulary.ProfessionalPluralLabel)
      .replace(/{Matter}/g, this._currentVocabulary.MatterLabel)
      .replace(/{Matters}/g, this._currentVocabulary.MatterPluralLabel)
      .replace(/{PracticeArea}/g, this._currentVocabulary.PracticeAreaLabel)
      .replace(/{PracticeAreas}/g, this._currentVocabulary.PracticeAreaPluralLabel)
      .replace(/{Jurisdiction}/g, this._currentVocabulary.JurisdictionLabel)
      .replace(/{Jurisdictions}/g, this._currentVocabulary.JurisdictionPluralLabel)
      .replace(/{Seeker}/g, this._currentVocabulary.SeekerLabel)
      .replace(/{Seekers}/g, this._currentVocabulary.SeekerPluralLabel);
  }
}
