import { IRunViewProvider, RunView, UserInfo } from '@memberjunction/core';
import {
  ConflictCheckPartyEntity,
  ProfessionalJurisdictionEntity,
  ProfessionalPracticeAreaEntity,
  ProfessionalProfileEntity,
  ReferralAssignmentEntity,
} from '@mj-biz-apps/referrals-entities';
import { ActiveMatterPartyRecord, ConflictScreeningService } from './ConflictScreeningService.js';
import { ReferralTelemetry } from './ReferralTelemetry.js';
import { MatchCandidateScore, MatchCriteria, ScoreBreakdown } from './types.js';

export class MatchingEngine {
  /**
   * Pure multi-factor scoring function for a single professional candidate.
   */
  public static ScoreCandidate(params: {
    profile: ProfessionalProfileEntity;
    practiceLink: ProfessionalPracticeAreaEntity | undefined;
    jurisdictionLink: ProfessionalJurisdictionEntity | undefined;
    criteria: MatchCriteria;
    conflictParties: ReadonlyArray<Pick<ConflictCheckPartyEntity, 'PartyName' | 'PartyRole' | 'OrganizationName' | 'NormalizedName'>>;
    activeMatterParties: ReadonlyArray<ActiveMatterPartyRecord>;
  }): MatchCandidateScore {
    const { profile, practiceLink, jurisdictionLink, criteria, conflictParties, activeMatterParties } = params;

    // Screen conflicts first
    const allParties = [
      ...conflictParties,
      ...(criteria.ConflictParties ?? []),
    ];
    const conflictResult = ConflictScreeningService.ScreenCandidate(profile, allParties, activeMatterParties);

    // Check hard eligibility gates
    let disqualificationReason: string | null = null;
    if (!profile.IsActive) {
      disqualificationReason = 'Profile is inactive.';
    } else if (profile.VerificationStatus !== 'Verified') {
      disqualificationReason = `Verification status is ${profile.VerificationStatus}.`;
    } else if (profile.AvailabilityStatus === 'Unavailable' || profile.AvailabilityStatus === 'OnLeave') {
      disqualificationReason = `Availability status is ${profile.AvailabilityStatus}.`;
    } else if (profile.ActiveReferralCount >= profile.MaxConcurrentReferrals) {
      disqualificationReason = 'Professional is at maximum concurrent referral capacity.';
    } else if (!practiceLink) {
      disqualificationReason = 'Professional does not cover the requested practice area.';
    } else if (!jurisdictionLink || jurisdictionLink.StandingStatus === 'Inactive' || jurisdictionLink.StandingStatus === 'Suspended') {
      disqualificationReason = 'Professional is not in good standing in the requested jurisdiction.';
    } else if (criteria.RequiresProBono && !profile.AcceptsProBono) {
      disqualificationReason = 'Professional does not accept pro bono matters.';
    } else if (conflictResult.HasConflict) {
      disqualificationReason = conflictResult.Reasons[0] ?? 'Conflict of interest detected.';
    }

    // 1. Practice Area Score (0-35)
    let practiceAreaScore = 0;
    if (practiceLink) {
      const base =
        practiceLink.ProficiencyLevel === 'Primary'
          ? 30
          : practiceLink.ProficiencyLevel === 'Standard'
            ? 22
            : 15;
      const yearsBonus = Math.min(5, Math.floor(practiceLink.YearsInPractice / 3));
      practiceAreaScore = base + yearsBonus;
    }

    // 2. Jurisdiction Standing Score (0-25)
    let jurisdictionScore = 0;
    if (jurisdictionLink) {
      if (jurisdictionLink.StandingStatus === 'GoodStanding') {
        jurisdictionScore = jurisdictionLink.IsPrimary ? 25 : 20;
      } else if (jurisdictionLink.StandingStatus === 'ProHacVice') {
        jurisdictionScore = 12;
      }
    }

    // 3. Capacity & Availability Score (0-15)
    let capacityScore = 0;
    if (profile.MaxConcurrentReferrals > 0) {
      const headroomRatio = Math.max(0, (profile.MaxConcurrentReferrals - profile.ActiveReferralCount) / profile.MaxConcurrentReferrals);
      const availMultiplier = profile.AvailabilityStatus === 'Available' ? 1 : profile.AvailabilityStatus === 'Limited' ? 0.5 : 0;
      capacityScore = Math.round(headroomRatio * 15 * availMultiplier * 100) / 100;
    }

    // 4. Responsiveness & SLA Track Record Score (0-15)
    const targetSla = criteria.SLAResponseHours ?? 24;
    let responsivenessScore = 10; // default neutral score if no history yet
    if (profile.AverageResponseHours != null) {
      const ratio = profile.AverageResponseHours / targetSla;
      if (ratio <= 0.25) responsivenessScore = 15;
      else if (ratio <= 0.5) responsivenessScore = 13;
      else if (ratio <= 1.0) responsivenessScore = 10;
      else responsivenessScore = Math.max(2, 10 - (ratio - 1) * 4);
    }

    // 5. Quality / Rating Score (0-10)
    const ratingScore = profile.AverageRating != null
      ? Math.round(((profile.AverageRating / 5) * 10) * 100) / 100
      : 7;

    // 6. Language Bonus (0-5)
    let languageBonus = 0;
    if (criteria.PreferredLanguage && profile.Languages) {
      const langs = profile.Languages.toLowerCase().split(',').map((l) => l.trim());
      if (langs.includes(criteria.PreferredLanguage.toLowerCase().trim())) {
        languageBonus = 5;
      }
    }

    const totalScore = Math.min(
      100,
      Math.round((practiceAreaScore + jurisdictionScore + capacityScore + responsivenessScore + ratingScore + languageBonus) * 100) / 100,
    );

    const breakdown: ScoreBreakdown = {
      PracticeAreaScore: practiceAreaScore,
      JurisdictionScore: jurisdictionScore,
      CapacityScore: capacityScore,
      ResponsivenessScore: responsivenessScore,
      RatingScore: ratingScore,
      LanguageBonus: languageBonus,
      TotalScore: totalScore,
    };

    return {
      ProfessionalProfileID: profile.ID,
      DisplayName: profile.DisplayName,
      FirmName: profile.FirmName,
      Email: profile.Email,
      VerificationStatus: profile.VerificationStatus,
      AvailabilityStatus: profile.AvailabilityStatus,
      ActiveReferralCount: profile.ActiveReferralCount,
      MaxConcurrentReferrals: profile.MaxConcurrentReferrals,
      Score: totalScore,
      Breakdown: breakdown,
      ConflictStatus: conflictResult.Status,
      ConflictReasons: conflictResult.Reasons,
      Eligible: disqualificationReason === null,
      DisqualificationReason: disqualificationReason,
    };
  }

  /**
   * Finds and ranks matching professionals using a single batched `RunViews` round-trip.
   */
  public static async FindMatches(
    criteria: MatchCriteria,
    contextUser: UserInfo,
    provider?: IRunViewProvider,
    referralRequestId?: string,
  ): Promise<MatchCandidateScore[]> {
    const startMs = Date.now();
    const rv = new RunView(provider);

    const viewsToRun = [
      {
        EntityName: 'MJ_BizApps_Referrals: Professional Profiles',
        ExtraFilter: "IsActive = 1 AND VerificationStatus = 'Verified'",
        ResultType: 'entity_object' as const,
      },
      {
        EntityName: 'MJ_BizApps_Referrals: Professional Practice Areas',
        ExtraFilter: `PracticeAreaID = '${criteria.PracticeAreaID}'`,
        ResultType: 'entity_object' as const,
      },
      {
        EntityName: 'MJ_BizApps_Referrals: Professional Jurisdictions',
        ExtraFilter: `JurisdictionID = '${criteria.JurisdictionID}'`,
        ResultType: 'entity_object' as const,
      },
      {
        EntityName: 'MJ_BizApps_Referrals: Referral Assignments',
        ExtraFilter: "Status IN ('Offered', 'Accepted')",
        ResultType: 'entity_object' as const,
      },
    ];

    if (referralRequestId) {
      viewsToRun.push({
        EntityName: 'MJ_BizApps_Referrals: Conflict Check Parties',
        ExtraFilter: `ReferralRequestID = '${referralRequestId}'`,
        ResultType: 'entity_object' as const,
      });
    }

    const results = await rv.RunViews(viewsToRun, contextUser);

    const profiles = (results[0]?.Success ? results[0].Results : []) as ProfessionalProfileEntity[];
    const practiceLinks = (results[1]?.Success ? results[1].Results : []) as ProfessionalPracticeAreaEntity[];
    const jurisdictionLinks = (results[2]?.Success ? results[2].Results : []) as ProfessionalJurisdictionEntity[];
    const activeAssignments = (results[3]?.Success ? results[3].Results : []) as ReferralAssignmentEntity[];
    const requestConflictParties = referralRequestId && results[4]?.Success
      ? (results[4].Results as ConflictCheckPartyEntity[])
      : [];

    // Load conflict parties for active assignments in a single batched query if any exist
    const activeMatterParties: ActiveMatterPartyRecord[] = [];
    if (activeAssignments.length > 0) {
      const activeReqIds = Array.from(new Set(activeAssignments.map((a) => `'${a.ReferralRequestID}'`))).join(',');
      const activePartiesResult = await rv.RunView<ConflictCheckPartyEntity>(
        {
          EntityName: 'MJ_BizApps_Referrals: Conflict Check Parties',
          ExtraFilter: `ReferralRequestID IN (${activeReqIds})`,
          ResultType: 'entity_object',
        },
        contextUser,
      );
      if (activePartiesResult.Success) {
        const reqToPros = new Map<string, string[]>();
        for (const a of activeAssignments) {
          const list = reqToPros.get(a.ReferralRequestID) ?? [];
          list.push(a.ProfessionalProfileID);
          reqToPros.set(a.ReferralRequestID, list);
        }
        for (const party of activePartiesResult.Results) {
          const proIds = reqToPros.get(party.ReferralRequestID) ?? [];
          for (const proId of proIds) {
            activeMatterParties.push({
              ProfessionalProfileID: proId,
              PartyName: party.PartyName,
              OrganizationName: party.OrganizationName,
            });
          }
        }
      }
    }

    const practiceByPro = new Map<string, ProfessionalPracticeAreaEntity>();
    for (const link of practiceLinks) {
      practiceByPro.set(link.ProfessionalProfileID, link);
    }

    const jurisdictionByPro = new Map<string, ProfessionalJurisdictionEntity>();
    for (const link of jurisdictionLinks) {
      jurisdictionByPro.set(link.ProfessionalProfileID, link);
    }

    const scored = profiles.map((profile) =>
      MatchingEngine.ScoreCandidate({
        profile,
        practiceLink: practiceByPro.get(profile.ID),
        jurisdictionLink: jurisdictionByPro.get(profile.ID),
        criteria,
        conflictParties: requestConflictParties,
        activeMatterParties,
      }),
    );

    scored.sort((a, b) => {
      if (a.Eligible !== b.Eligible) {
        return a.Eligible ? -1 : 1;
      }
      return b.Score - a.Score;
    });

    const maxResults = criteria.MaxResults ?? 20;
    const sliced = scored.slice(0, maxResults);

    ReferralTelemetry.RecordOperation({
      Operation: 'MatchProfessionals',
      ElapsedMs: Date.now() - startMs,
      UserID: contextUser.ID,
      Metrics: {
        candidateCount: profiles.length,
        eligibleCount: scored.filter((s) => s.Eligible).length,
      },
    });

    return sliced;
  }
}
