import {
  Assert,
  AssertEqual,
  IntegrationCheckRegistry,
  type IntegrationCheckContext,
  type NamedCheck,
} from '@memberjunction/testing-integration';
import { IMetadataProvider, IRunViewProvider, RunView } from '@memberjunction/core';
import {
  ConflictScreeningService,
  MatchingEngine,
  ReciprocityScorecardService,
  SlaEscalationService,
} from '@mj-biz-apps/referrals-core';
import type {
  ProfessionalJurisdictionEntity,
  ProfessionalPracticeAreaEntity,
  ReciprocitySnapshotEntity,
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
  {
    Id: `${BUNDLE}.RW4`,
    Name: 'RW4: Escalation lifecycle - raise is idempotent by DedupKey, and coordinator-gated resolve clears the escalation',
    Fn: async (ctx: IntegrationCheckContext) => {
      const world = await ensureReferralsWorld(ctx);
      const dp = ctx.Provider as IMetadataProvider & IRunViewProvider;
      const request = world.Requests['ACME_MA'];
      const assignment = world.Assignments.find(
        (a) => a.ReferralRequestID.toLowerCase() === request.ID.toLowerCase() && a.Status === 'Offered',
      );
      Assert(!!assignment, 'ACME_MA has an Offered assignment to escalate against');

      const dedupKey = `RW4:${assignment!.ID}`;
      const first = await SlaEscalationService.RaiseEscalation(
        {
          ReferralRequestID: request.ID,
          ReferralAssignmentID: assignment!.ID,
          TriggerType: 'ManualEscalation',
          EscalationLevel: 1,
          RecommendedAction: 'Notify',
          Notes: 'RW4 integration check escalation.',
          DedupKey: dedupKey,
        },
        ctx.User,
        dp,
      );
      Assert(first.Raised, 'First RaiseEscalation call creates a new Open escalation');

      const second = await SlaEscalationService.RaiseEscalation(
        {
          ReferralRequestID: request.ID,
          ReferralAssignmentID: assignment!.ID,
          TriggerType: 'ManualEscalation',
          EscalationLevel: 1,
          DedupKey: dedupKey,
        },
        ctx.User,
        dp,
      );
      AssertEqual(second.Raised, false, 'Second RaiseEscalation call with the same DedupKey is a no-op');
      AssertEqual(second.ReferralEscalationID, first.ReferralEscalationID, 'Idempotent re-raise returns the same escalation ID');

      const resolved = await SlaEscalationService.ResolveEscalation(
        first.ReferralEscalationID,
        ctx.User,
        dp,
        'Resolved by RW4 integration check.',
      );
      AssertEqual(resolved.Status, 'Resolved', 'Escalation transitions to Resolved');
    },
  },
  {
    Id: `${BUNDLE}.RW5`,
    Name: 'RW5: Reciprocity recompute produces a well-formed ReciprocitySnapshot for a seeded professional',
    Fn: async (ctx: IntegrationCheckContext) => {
      const world = await ensureReferralsWorld(ctx);
      const dp = ctx.Provider as IMetadataProvider & IRunViewProvider;
      const vance = world.Professionals['VANCE'];

      const result = await ReciprocityScorecardService.RecomputeSnapshots(ctx.User, dp);
      Assert(result.ProcessedCount >= 1, 'RecomputeSnapshots processes at least one active professional');

      const rv = new RunView();
      const snapRes = await rv.RunView<ReciprocitySnapshotEntity>(
        {
          EntityName: 'MJ_BizApps_Referrals: Reciprocity Snapshots',
          ExtraFilter: `ProfessionalProfileID='${vance.ID}'`,
          OrderBy: 'SnapshotDate DESC',
          MaxRows: 1,
          ResultType: 'entity_object',
        },
        ctx.User,
      );
      Assert(snapRes.Success && snapRes.Results.length === 1, 'A ReciprocitySnapshot exists for the seeded professional after recompute');
      const snapshot = snapRes.Results[0];
      Assert(snapshot.ReciprocityIndex >= 0, 'ReciprocityIndex is a non-negative number');
      Assert(snapshot.AcceptanceRate >= 0 && snapshot.AcceptanceRate <= 100, 'AcceptanceRate is a valid percentage');
    },
  },
];

for (const check of ReferralsWorldChecks) {
  IntegrationCheckRegistry.Instance.Register(check);
}
