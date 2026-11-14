import { describe, expect, it } from 'vitest';
import {
  ProfessionalJurisdictionEntity,
  ProfessionalPracticeAreaEntity,
  ProfessionalProfileEntity,
} from '@mj-biz-apps/referrals-entities';
import {
  ConflictScreeningService,
  MatchingEngine,
  NormalizePartyName,
  ReferralTelemetry,
  VocabularyService,
} from '../index.js';

describe('@mj-biz-apps/referrals-core', () => {
  it('normalizes party names by stripping punctuation and corporate suffixes', () => {
    expect(NormalizePartyName('Acme Holdings, LLC.')).toBe('acme holdings');
    expect(NormalizePartyName('  Global Tech Corp  ')).toBe('global tech');
  });

  it('detects direct and cross-matter conflicts of interest', () => {
    const pro = {
      ID: 'pro-1',
      DisplayName: 'Jane Doe',
      FirmName: 'Meridian Legal LLP',
      Email: 'jane@meridianlegal.com',
    };

    const directResult = ConflictScreeningService.ScreenCandidate(pro, [
      { PartyName: 'Meridian Legal Inc.', PartyRole: 'Adverse', OrganizationName: 'Meridian Legal LLP' },
    ]);
    expect(directResult.HasConflict).toBe(true);
    expect(directResult.Status).toBe('ConflictFound');

    const crossMatterResult = ConflictScreeningService.ScreenCandidate(
      pro,
      [{ PartyName: 'Apex Robotics Corp', PartyRole: 'Adverse', OrganizationName: null }],
      [{ ProfessionalProfileID: 'pro-1', PartyName: 'Apex Robotics LLC', OrganizationName: null }],
    );
    expect(crossMatterResult.HasConflict).toBe(true);
    expect(crossMatterResult.Reasons[0]).toContain('Active matter conflict');

    const clearResult = ConflictScreeningService.ScreenCandidate(pro, [
      { PartyName: 'Unrelated Party Inc.', PartyRole: 'Adverse', OrganizationName: null },
    ]);
    expect(clearResult.HasConflict).toBe(false);
    expect(clearResult.Status).toBe('Cleared');
  });

  it('scores verified, available, cleared professionals higher and disqualifies conflicted or over-capacity ones', () => {
    const makeProfile = (overrides: Partial<ProfessionalProfileEntity>): ProfessionalProfileEntity =>
      ({
        ID: 'pro-1',
        DisplayName: 'Alice Counsel',
        FirmName: 'Alpha Law',
        Email: 'alice@alphalaw.com',
        VerificationStatus: 'Verified',
        AvailabilityStatus: 'Available',
        ActiveReferralCount: 1,
        MaxConcurrentReferrals: 10,
        AverageResponseHours: 4,
        AverageRating: 4.9,
        Languages: 'English, Spanish',
        AcceptsProBono: true,
        IsActive: true,
        ...overrides,
      }) as ProfessionalProfileEntity;

    const practiceLink = {
      ProfessionalProfileID: 'pro-1',
      PracticeAreaID: 'pa-1',
      ProficiencyLevel: 'Primary',
      YearsInPractice: 12,
      IsPrimary: true,
    } as ProfessionalPracticeAreaEntity;

    const jurisdictionLink = {
      ProfessionalProfileID: 'pro-1',
      JurisdictionID: 'jur-1',
      StandingStatus: 'GoodStanding',
      IsPrimary: true,
    } as ProfessionalJurisdictionEntity;

    const candidate = MatchingEngine.ScoreCandidate({
      profile: makeProfile({}),
      practiceLink,
      jurisdictionLink,
      criteria: {
        PracticeAreaID: 'pa-1',
        JurisdictionID: 'jur-1',
        PreferredLanguage: 'Spanish',
        SLAResponseHours: 24,
      },
      conflictParties: [],
      activeMatterParties: [],
    });

    expect(candidate.Eligible).toBe(true);
    expect(candidate.Score).toBeGreaterThan(85);
    expect(candidate.Breakdown.LanguageBonus).toBe(5);

    const overCapacity = MatchingEngine.ScoreCandidate({
      profile: makeProfile({ ActiveReferralCount: 10, MaxConcurrentReferrals: 10 }),
      practiceLink,
      jurisdictionLink,
      criteria: { PracticeAreaID: 'pa-1', JurisdictionID: 'jur-1' },
      conflictParties: [],
      activeMatterParties: [],
    });
    expect(overCapacity.Eligible).toBe(false);
    expect(overCapacity.DisqualificationReason).toContain('capacity');
  });

  it('performs hybrid semantic matching with explainable match reasons', () => {
    const makeProfile = (overrides: Partial<ProfessionalProfileEntity>): ProfessionalProfileEntity =>
      ({
        ID: 'pro-2',
        DisplayName: 'Sarah Vance',
        FirmName: 'Vance Corporate Advisory',
        Email: 'sarah@vancecorp.com',
        VerificationStatus: 'Verified',
        AvailabilityStatus: 'Available',
        ActiveReferralCount: 2,
        MaxConcurrentReferrals: 8,
        AverageResponseHours: 1.8,
        AverageRating: 4.95,
        Bio: 'Specializes in Delaware corporate governance, cross-border M&A transactions, and private equity buyout structures.',
        AcceptsProBono: false,
        IsActive: true,
        ...overrides,
      }) as ProfessionalProfileEntity;

    const practiceLink = {
      ProfessionalProfileID: 'pro-2',
      PracticeAreaID: 'pa-corp',
      ProficiencyLevel: 'Primary',
      YearsInPractice: 15,
      IsPrimary: true,
    } as ProfessionalPracticeAreaEntity;

    const jurisdictionLink = {
      ProfessionalProfileID: 'pro-2',
      JurisdictionID: 'jur-de',
      StandingStatus: 'GoodStanding',
      IsPrimary: true,
    } as ProfessionalJurisdictionEntity;

    const candidate = MatchingEngine.ScoreCandidate({
      profile: makeProfile({}),
      practiceLink,
      jurisdictionLink,
      criteria: {
        PracticeAreaID: 'pa-corp',
        JurisdictionID: 'jur-de',
        MatterTitle: 'Series B Cross-Border Acquisition',
        MatterSummary: 'Seeking counsel for cross-border M&A in Delaware with complex private equity buyout terms.',
        Keywords: ['m&a', 'delaware', 'governance'],
      },
      conflictParties: [],
      activeMatterParties: [],
    });

    expect(candidate.Eligible).toBe(true);
    expect(candidate.Breakdown.SemanticScore).toBeGreaterThanOrEqual(10);
    expect(candidate.ExplainableMatchReasons).toBeDefined();
    expect(candidate.ExplainableMatchReasons?.length).toBeGreaterThan(3);
    expect(candidate.MatchSummary).toContain('1.8h SLA');
  });

  it('formats customizable domain vocabulary across Legal, Medical, Accounting, and Consulting presets', () => {
    const vocab = VocabularyService.Instance;

    vocab.SetDomain('Legal');
    expect(vocab.Current.ProfessionalLabel).toBe('Attorney');
    expect(vocab.Format('Find a qualified {Professional} for your {Matter}')).toBe(
      'Find a qualified Attorney for your Legal Matter',
    );

    vocab.SetDomain('Medical');
    expect(vocab.Current.ProfessionalLabel).toBe('Physician');
    expect(vocab.Format('Schedule a consultation with a {Professional} in {PracticeArea}')).toBe(
      'Schedule a consultation with a Physician in Medical Specialty',
    );

    vocab.SetDomain('Accounting');
    expect(vocab.Current.ProfessionalLabel).toBe('CPA / Advisor');
    expect(vocab.Format('Assign {Seeker} to {Professional}')).toBe('Assign Client to CPA / Advisor');

    vocab.SetDomain('Consulting');
    expect(vocab.Current.ProfessionalLabel).toBe('Consultant');
    expect(vocab.Format('Start {Matter} with {Professional}')).toBe('Start Advisory Project with Consultant');
  });

  it('scrubs routes with RouteScrubber before telemetry recording', () => {
    const scrubbed = ReferralTelemetry.ScrubRoute('app/Referrals/record/ReferralRequest/12345678-1234-1234-1234-1234567890ab');
    expect(scrubbed.ScrubbedPath).toBe('/app/Referrals/record/ReferralRequest/_id_');
    expect(scrubbed.ScrubbedPath).not.toContain('12345678');

    expect(() =>
      ReferralTelemetry.RecordOperation({
        Operation: 'UnitTest',
        Route: 'resource/search/confidential-client-name',
        ElapsedMs: 12,
      }),
    ).not.toThrow();
  });
});
