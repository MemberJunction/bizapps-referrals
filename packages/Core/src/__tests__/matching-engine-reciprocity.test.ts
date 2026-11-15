import { describe, expect, it } from 'vitest';
import {
  ProfessionalJurisdictionEntity,
  ProfessionalPracticeAreaEntity,
  ProfessionalProfileEntity,
} from '@mj-biz-apps/referrals-entities';
import { MatchingEngine } from '../index.js';

function makeProfile(overrides: Partial<ProfessionalProfileEntity>): ProfessionalProfileEntity {
  return {
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
    Languages: 'English',
    AcceptsProBono: true,
    IsActive: true,
    ...overrides,
  } as ProfessionalProfileEntity;
}

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

describe('MatchingEngine.ScoreCandidate reciprocity boost (AC-27)', () => {
  it('applies a +3 point boost and a Reciprocity-prefixed reason for ReciprocityIndex = 1.6', () => {
    const candidate = MatchingEngine.ScoreCandidate({
      profile: makeProfile({ ReciprocityIndex: 1.6 }),
      practiceLink,
      jurisdictionLink,
      criteria: {
        PracticeAreaID: 'pa-1',
        JurisdictionID: 'jur-1',
        SLAResponseHours: 24,
        ApplyReciprocityBoost: true,
      },
      conflictParties: [],
      activeMatterParties: [],
    });

    expect(candidate.Breakdown.ReciprocityBoost).toBe(3);
    expect(candidate.ExplainableMatchReasons?.some((r) => r.startsWith('Reciprocity:'))).toBe(true);
  });

  it('applies zero boost when ReciprocityIndex <= 1 or the flag is not set', () => {
    const atBaseline = MatchingEngine.ScoreCandidate({
      profile: makeProfile({ ReciprocityIndex: 1 }),
      practiceLink,
      jurisdictionLink,
      criteria: { PracticeAreaID: 'pa-1', JurisdictionID: 'jur-1', SLAResponseHours: 24, ApplyReciprocityBoost: true },
      conflictParties: [],
      activeMatterParties: [],
    });
    expect(atBaseline.Breakdown.ReciprocityBoost).toBe(0);

    const flagOff = MatchingEngine.ScoreCandidate({
      profile: makeProfile({ ReciprocityIndex: 1.6 }),
      practiceLink,
      jurisdictionLink,
      criteria: { PracticeAreaID: 'pa-1', JurisdictionID: 'jur-1', SLAResponseHours: 24 },
      conflictParties: [],
      activeMatterParties: [],
    });
    expect(flagOff.Breakdown.ReciprocityBoost).toBeUndefined();
  });

  it('clamps the boost at +5 points for a very high ReciprocityIndex', () => {
    const candidate = MatchingEngine.ScoreCandidate({
      profile: makeProfile({ ReciprocityIndex: 10 }),
      practiceLink,
      jurisdictionLink,
      criteria: { PracticeAreaID: 'pa-1', JurisdictionID: 'jur-1', SLAResponseHours: 24, ApplyReciprocityBoost: true },
      conflictParties: [],
      activeMatterParties: [],
    });
    expect(candidate.Breakdown.ReciprocityBoost).toBe(5);
  });
});
