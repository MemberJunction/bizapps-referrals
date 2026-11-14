import { IRunViewProvider, RunView, UserInfo } from '@memberjunction/core';
import {
  ConflictCheckPartyEntity,
  ProfessionalJurisdictionEntity,
  ProfessionalPracticeAreaEntity,
  ProfessionalProfileEntity,
  ReferralAssignmentEntity,
  ReferralRequestEntity,
} from '@mj-biz-apps/referrals-entities';
import { ActiveMatterPartyRecord, ConflictScreeningService } from './ConflictScreeningService.js';
import { ReferralTelemetry } from './ReferralTelemetry.js';
import { MatchCandidateScore, MatchCriteria, ScoreBreakdown } from './types.js';
import { AssertValidUUID, ConflictScreeningUnavailableError, UUIDsEqual } from './validation.js';

const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren',
  'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by',
  'can', 'could', 'did', 'do', 'does', 'doing', 'down', 'during', 'each', 'few', 'for', 'from',
  'further', 'had', 'has', 'have', 'having', 'he', 'her', 'here', 'hers', 'herself', 'him', 'himself',
  'his', 'how', 'i', 'if', 'in', 'into', 'is', 'it', 'its', 'itself', 'just', 'me', 'more', 'most',
  'my', 'myself', 'no', 'nor', 'not', 'now', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'our',
  'ours', 'ourselves', 'out', 'over', 'own', 'same', 'she', 'should', 'so', 'some', 'such', 'than',
  'that', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'these', 'they', 'this',
  'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'we', 'were', 'what', 'when',
  'where', 'which', 'while', 'who', 'whom', 'why', 'with', 'would', 'you', 'your', 'yours', 'yourself',
]);

function extractTokens(text: string | null | undefined): string[] {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 2 && !STOP_WORDS.has(t));
}

export class MatchingEngine {
  /**
   * Pure multi-factor hybrid scoring function for a single professional candidate.
   * Evaluates deterministic compliance filters + multi-attribute scoring + semantic similarity.
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

    const allParties = [
      ...conflictParties,
      ...(criteria.ConflictParties ?? []),
    ];
    const conflictResult = ConflictScreeningService.ScreenCandidate(profile, allParties, activeMatterParties);

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
    } else if (conflictResult.Status === 'Unavailable') {
      disqualificationReason = conflictResult.Reasons[0] ?? 'Conflict screening unavailable.';
    } else if (conflictResult.HasConflict) {
      disqualificationReason = conflictResult.Reasons[0] ?? 'Conflict of interest detected.';
    }

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

    let jurisdictionScore = 0;
    if (jurisdictionLink) {
      if (jurisdictionLink.StandingStatus === 'GoodStanding') {
        jurisdictionScore = jurisdictionLink.IsPrimary ? 25 : 20;
      } else if (jurisdictionLink.StandingStatus === 'ProHacVice') {
        jurisdictionScore = 12;
      }
    }

    let capacityScore = 0;
    if (profile.MaxConcurrentReferrals > 0) {
      const headroomRatio = Math.max(0, (profile.MaxConcurrentReferrals - profile.ActiveReferralCount) / profile.MaxConcurrentReferrals);
      const availMultiplier = profile.AvailabilityStatus === 'Available' ? 1 : profile.AvailabilityStatus === 'Limited' ? 0.5 : 0;
      capacityScore = Math.round(headroomRatio * 15 * availMultiplier * 100) / 100;
    }

    const targetSla = criteria.SLAResponseHours ?? 24;
    let responsivenessScore = 10;
    if (profile.AverageResponseHours != null) {
      const ratio = profile.AverageResponseHours / targetSla;
      if (ratio <= 0.25) responsivenessScore = 15;
      else if (ratio <= 0.5) responsivenessScore = 13;
      else if (ratio <= 1.0) responsivenessScore = 10;
      else responsivenessScore = Math.max(2, 10 - (ratio - 1) * 4);
    }

    const ratingScore = profile.AverageRating != null
      ? Math.round(((profile.AverageRating / 5) * 10) * 100) / 100
      : 7;

    let languageBonus = 0;
    if (criteria.PreferredLanguage && profile.Languages) {
      const langs = profile.Languages.toLowerCase().split(',').map((l: string) => l.trim());
      if (langs.includes(criteria.PreferredLanguage.toLowerCase().trim())) {
        languageBonus = 5;
      }
    }

    // Hybrid Semantic / Keyword Similarity
    let semanticScore = 0;
    const matchedTerms: string[] = [];
    const queryTokens = [
      ...extractTokens(criteria.MatterTitle),
      ...extractTokens(criteria.MatterSummary),
      ...(criteria.Keywords ?? []).flatMap((k) => extractTokens(k)),
    ];

    if (queryTokens.length > 0) {
      const uniqueQueryTokens = Array.from(new Set(queryTokens));
      const profileText = [
        profile.Bio ?? '',
        profile.DisplayName ?? '',
        profile.FirmName ?? '',
      ].join(' ');
      const candidateTokens = new Set(extractTokens(profileText));

      for (const token of uniqueQueryTokens) {
        if (candidateTokens.has(token)) {
          matchedTerms.push(token);
        }
      }

      if (uniqueQueryTokens.length > 0) {
        const overlapRatio = matchedTerms.length / uniqueQueryTokens.length;
        const baseScore = overlapRatio * 10;
        const explicitKeywords = (criteria.Keywords ?? []).flatMap((k) => extractTokens(k));
        const matchedExplicit = explicitKeywords.filter((k) => candidateTokens.has(k)).length;
        const keywordBonus = explicitKeywords.length > 0 ? (matchedExplicit / explicitKeywords.length) * 5 : 0;

        semanticScore = Math.min(15, Math.round((baseScore + keywordBonus) * 100) / 100);
        if (matchedTerms.length > 0 && semanticScore < 3) {
          semanticScore = 3;
        }
      }
    }

    const totalScore = Math.min(
      100,
      Math.round((practiceAreaScore + jurisdictionScore + capacityScore + responsivenessScore + ratingScore + languageBonus + semanticScore) * 100) / 100,
    );

    const breakdown: ScoreBreakdown = {
      PracticeAreaScore: practiceAreaScore,
      JurisdictionScore: jurisdictionScore,
      CapacityScore: capacityScore,
      ResponsivenessScore: responsivenessScore,
      RatingScore: ratingScore,
      LanguageBonus: languageBonus,
      SemanticScore: semanticScore,
      TotalScore: totalScore,
    };

    const explainableReasons: string[] = [];
    if (practiceLink) {
      explainableReasons.push(
        `${practiceLink.ProficiencyLevel} proficiency (${practiceLink.YearsInPractice} yrs experience)`,
      );
    }
    if (jurisdictionLink) {
      explainableReasons.push(
        `Good standing in jurisdiction (${jurisdictionLink.IsPrimary ? 'Primary' : 'Admitted'})`,
      );
    }
    if (matchedTerms.length > 0) {
      explainableReasons.push(
        `Matched keywords: ${matchedTerms.slice(0, 4).join(', ')}${matchedTerms.length > 4 ? ` (+${matchedTerms.length - 4} more)` : ''}`,
      );
    }
    if (profile.AverageResponseHours != null) {
      explainableReasons.push(`Avg response SLA: ${profile.AverageResponseHours}h (target ${targetSla}h)`);
    }
    if (profile.AverageRating != null) {
      explainableReasons.push(`Client rating: ${profile.AverageRating}/5.0`);
    }
    if (languageBonus > 0 && criteria.PreferredLanguage) {
      explainableReasons.push(`Speaks preferred language (${criteria.PreferredLanguage})`);
    }
    const headroom = profile.MaxConcurrentReferrals - profile.ActiveReferralCount;
    explainableReasons.push(
      `${profile.AvailabilityStatus} (${headroom} of ${profile.MaxConcurrentReferrals} capacity slots open)`,
    );

    const summaryParts: string[] = [];
    if (matchedTerms.length > 0) {
      summaryParts.push(`Matched on ${matchedTerms.slice(0, 3).join(', ')}`);
    } else if (practiceLink) {
      summaryParts.push(`${practiceLink.ProficiencyLevel} practice match`);
    }
    if (profile.AverageResponseHours != null) {
      summaryParts.push(`${profile.AverageResponseHours}h SLA`);
    }
    summaryParts.push(`${Math.round(totalScore)}% match`);
    const matchSummary = summaryParts.join(' • ');

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
      ExplainableMatchReasons: explainableReasons,
      MatchSummary: matchSummary,
    };
  }

  /**
   * Finds and ranks matching professionals using a single batched `RunViews` round-trip.
   * Validates all UUID inputs and fails closed if any conflict-screening query fails.
   */
  public static async FindMatches(
    criteria: MatchCriteria,
    contextUser: UserInfo,
    provider?: IRunViewProvider,
    referralRequestId?: string,
  ): Promise<MatchCandidateScore[]> {
    const startMs = Date.now();
    const practiceAreaId = AssertValidUUID(criteria.PracticeAreaID, 'PracticeAreaID');
    const jurisdictionId = AssertValidUUID(criteria.JurisdictionID, 'JurisdictionID');
    const validatedRequestId = referralRequestId ? AssertValidUUID(referralRequestId, 'ReferralRequestID') : undefined;

    const rv = new RunView(provider);

    const viewsToRun = [
      {
        EntityName: 'MJ_BizApps_Referrals: Professional Profiles',
        ExtraFilter: "IsActive = 1 AND VerificationStatus = 'Verified'",
        ResultType: 'entity_object' as const,
      },
      {
        EntityName: 'MJ_BizApps_Referrals: Professional Practice Areas',
        ExtraFilter: `PracticeAreaID = '${practiceAreaId}'`,
        ResultType: 'entity_object' as const,
      },
      {
        EntityName: 'MJ_BizApps_Referrals: Professional Jurisdictions',
        ExtraFilter: `JurisdictionID = '${jurisdictionId}'`,
        ResultType: 'entity_object' as const,
      },
      {
        EntityName: 'MJ_BizApps_Referrals: Referral Assignments',
        ExtraFilter: "Status IN ('Offered', 'Accepted')",
        ResultType: 'entity_object' as const,
      },
    ];

    if (validatedRequestId) {
      viewsToRun.push({
        EntityName: 'MJ_BizApps_Referrals: Conflict Check Parties',
        ExtraFilter: `ReferralRequestID = '${validatedRequestId}'`,
        ResultType: 'entity_object' as const,
      });
      viewsToRun.push({
        EntityName: 'MJ_BizApps_Referrals: Referral Requests',
        ExtraFilter: `ID = '${validatedRequestId}'`,
        ResultType: 'entity_object' as const,
      });
    }

    const results = await rv.RunViews(viewsToRun, contextUser);

    for (let i = 0; i < viewsToRun.length; i++) {
      if (!results[i]?.Success) {
        throw new ConflictScreeningUnavailableError(
          `Batched matching query '${viewsToRun[i].EntityName}' failed: ${results[i]?.ErrorMessage ?? 'Unknown error'}.`,
        );
      }
    }

    const profiles = results[0].Results as ProfessionalProfileEntity[];
    const practiceLinks = results[1].Results as ProfessionalPracticeAreaEntity[];
    const jurisdictionLinks = results[2].Results as ProfessionalJurisdictionEntity[];
    const activeAssignments = results[3].Results as ReferralAssignmentEntity[];
    const requestConflictParties = validatedRequestId
      ? (results[4].Results as ConflictCheckPartyEntity[])
      : [];

    let effectiveCriteria = { ...criteria };
    if (validatedRequestId && results[5]?.Results?.length) {
      const requestEntity = results[5].Results[0] as ReferralRequestEntity;
      effectiveCriteria = {
        ...effectiveCriteria,
        MatterTitle: effectiveCriteria.MatterTitle ?? requestEntity.MatterTitle,
        MatterSummary: effectiveCriteria.MatterSummary ?? requestEntity.MatterSummary,
      };
    }

    const activeMatterParties: ActiveMatterPartyRecord[] = [];
    if (activeAssignments.length > 0) {
      const validReqIds = activeAssignments.map((a) => AssertValidUUID(a.ReferralRequestID, 'ReferralRequestID'));
      const activeReqIdsSql = Array.from(new Set(validReqIds.map((id) => `'${id}'`))).join(',');
      const activePartiesResult = await rv.RunView<ConflictCheckPartyEntity>(
        {
          EntityName: 'MJ_BizApps_Referrals: Conflict Check Parties',
          ExtraFilter: `ReferralRequestID IN (${activeReqIdsSql})`,
          ResultType: 'entity_object',
        },
        contextUser,
      );
      if (!activePartiesResult.Success) {
        throw new ConflictScreeningUnavailableError(
          `Active matter conflict query failed: ${activePartiesResult.ErrorMessage ?? 'Unknown error'}.`,
        );
      }
      for (const party of activePartiesResult.Results) {
        for (const assignment of activeAssignments) {
          if (UUIDsEqual(assignment.ReferralRequestID, party.ReferralRequestID)) {
            activeMatterParties.push({
              ProfessionalProfileID: assignment.ProfessionalProfileID,
              PartyName: party.PartyName,
              OrganizationName: party.OrganizationName,
            });
          }
        }
      }
    }

    const practiceByPro = new Map<string, ProfessionalPracticeAreaEntity>();
    for (const link of practiceLinks) {
      practiceByPro.set(link.ProfessionalProfileID.toLowerCase(), link);
    }

    const jurisdictionByPro = new Map<string, ProfessionalJurisdictionEntity>();
    for (const link of jurisdictionLinks) {
      jurisdictionByPro.set(link.ProfessionalProfileID.toLowerCase(), link);
    }

    const scored = profiles.map((profile) =>
      MatchingEngine.ScoreCandidate({
        profile,
        practiceLink: practiceByPro.get(profile.ID.toLowerCase()),
        jurisdictionLink: jurisdictionByPro.get(profile.ID.toLowerCase()),
        criteria: effectiveCriteria,
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
