import {
  Assert,
  AssertEqual,
  IntegrationCheckRegistry,
  type IntegrationCheckContext,
  type NamedCheck,
} from '@memberjunction/testing-integration';
import { ConflictScreeningService, MatchingEngine } from '@mj-biz-apps/referrals-core';
import type {
  ProfessionalJurisdictionEntity,
  ProfessionalPracticeAreaEntity,
} from '@mj-biz-apps/referrals-entities';
import { ensureReferralsWorld } from '../referrals-fixture.js';

const BUNDLE = 'referrals-world';

export const ReferralsWorldChecks: NamedCheck[] = [
  {
    Id: `${BUNDLE}.RW1`,
    Name: 'RW1: Seeded catalog and 6-counsel Referrals World Model persist cleanly',
    Fn: async (ctx: IntegrationCheckContext) => {
      const world = await ensureReferralsWorld(ctx);
      Assert(Object.keys(world.PracticeAreas).length >= 5, 'At least 5 PracticeAreas present');
      Assert(Object.keys(world.Jurisdictions).length >= 5, 'At least 5 Jurisdictions present');
      Assert(Object.keys(world.ReferralTiers).length >= 3, 'At least 3 ReferralTiers present');
      AssertEqual(Object.keys(world.Professionals).length, 6, '6 ProfessionalProfiles committed');
      AssertEqual(Object.keys(world.Requests).length, 4, '4 ReferralRequests committed');
    },
  },
  {
    Id: `${BUNDLE}.RW2`,
    Name: 'RW2: ConflictScreeningService flags adverse firm overlap and clears neutral counsel',
    Fn: async (ctx: IntegrationCheckContext) => {
      const world = await ensureReferralsWorld(ctx);
      const adversePro = world.Professionals['ADVERSE'];
      const clearPro = world.Professionals['VANCE'];
      const acmeParties = world.ConflictParties.filter(
        (p) => p.ReferralRequestID.toLowerCase() === world.Requests['ACME_MA'].ID.toLowerCase(),
      );

      Assert(acmeParties.length >= 1, 'Acme M&A request has adverse conflict-check party');
      const flagged = ConflictScreeningService.ScreenCandidate(adversePro, acmeParties);
      Assert(flagged.HasConflict, 'Adverse firm counsel is flagged with a conflict');

      const cleared = ConflictScreeningService.ScreenCandidate(clearPro, acmeParties);
      Assert(!cleared.HasConflict, 'Neutral counsel is cleared');

      const practiceAreaId = world.PracticeAreas['CORP_MA'].ID;
      const jurisdictionId = world.Jurisdictions['US-NY'].ID;
      const practiceLink = {
        PracticeAreaID: practiceAreaId,
        ProficiencyLevel: 'Primary',
        YearsInPractice: 12,
        IsPrimary: true,
      } as ProfessionalPracticeAreaEntity;
      const jurisdictionLink = {
        JurisdictionID: jurisdictionId,
        StandingStatus: 'GoodStanding',
        IsPrimary: true,
      } as ProfessionalJurisdictionEntity;

      const adverseScore = MatchingEngine.ScoreCandidate({
        profile: adversePro,
        practiceLink: { ...practiceLink, ProfessionalProfileID: adversePro.ID } as ProfessionalPracticeAreaEntity,
        jurisdictionLink: { ...jurisdictionLink, ProfessionalProfileID: adversePro.ID } as ProfessionalJurisdictionEntity,
        criteria: { PracticeAreaID: practiceAreaId, JurisdictionID: jurisdictionId },
        conflictParties: acmeParties,
        activeMatterParties: [],
      });
      const clearScore = MatchingEngine.ScoreCandidate({
        profile: clearPro,
        practiceLink: { ...practiceLink, ProfessionalProfileID: clearPro.ID } as ProfessionalPracticeAreaEntity,
        jurisdictionLink: { ...jurisdictionLink, ProfessionalProfileID: clearPro.ID } as ProfessionalJurisdictionEntity,
        criteria: { PracticeAreaID: practiceAreaId, JurisdictionID: jurisdictionId },
        conflictParties: acmeParties,
        activeMatterParties: [],
      });
      Assert(!adverseScore.Eligible, 'Adverse candidate is ineligible');
      Assert(clearScore.Eligible, 'Neutral candidate is eligible');
    },
  },
  {
    Id: `${BUNDLE}.RW3`,
    Name: 'RW3: Multi-step cascade assignments cover Offered, Accepted, ConflictRejected, and Expired',
    Fn: async (ctx: IntegrationCheckContext) => {
      const world = await ensureReferralsWorld(ctx);
      const statuses = new Set(world.Assignments.map((a) => a.Status));
      Assert(statuses.has('Offered'), 'World includes Offered assignment');
      Assert(statuses.has('Accepted'), 'World includes Accepted assignment');
      Assert(statuses.has('ConflictRejected'), 'World includes ConflictRejected assignment');
      Assert(statuses.has('Expired'), 'World includes Expired assignment');
    },
  },
];

for (const check of ReferralsWorldChecks) {
  IntegrationCheckRegistry.Instance.Register(check);
}
