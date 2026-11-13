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
