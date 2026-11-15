import { IMetadataProvider, IRunViewProvider, RunView, UserInfo } from '@memberjunction/core';
import {
  AIRationaleSource,
  AssertValidUUID,
  EscalationRecommendedAction,
  ExplainMatchOutput,
  MatchCandidateScore,
  MatchingEngine,
  PersistenceError,
  ScoreBreakdown,
} from '@mj-biz-apps/referrals-core';
import {
  ConflictCheckPartyEntity,
  JurisdictionEntity,
  PracticeAreaEntity,
  ProfessionalProfileEntity,
  ReferralAssignmentEntity,
  ReferralEscalationEntity,
  ReferralRequestEntity,
  ReferralTierEntity,
} from '@mj-biz-apps/referrals-entities';
import {
  IReferralPromptExecutor,
  MJReferralPromptExecutor,
  PromptDataValue,
} from './ReferralPromptExecutor.js';

export const MATCH_RATIONALE_PROMPT_NAME = 'Referrals Match Rationale';
export const ESCALATION_ADVISOR_PROMPT_NAME = 'Referrals Escalation Advisor';

const RECOMMENDED_ACTIONS: ReadonlyArray<EscalationRecommendedAction> = ['Notify', 'Reassign', 'AdminAlert', 'EscalateToTier'];

export interface RationaleRequestInput {
  PracticeAreaName: string;
  JurisdictionName: string;
  UrgencyLevel: string;
  TierName: string;
  ConflictPartyCountsByRole: Record<string, number>;
}

export interface RationaleCandidateInput {
  ProfessionalProfileID: string;
  DisplayName: string;
  MatchScore: number;
  ScoreBreakdown: ScoreBreakdown;
  ExplainableMatchReasons: string[];
  ReadinessScore: number | null;
  ReciprocityIndex: number | null;
  Eligible: boolean;
  DisqualificationReason: string | null;
}

export interface RationalePromptContext {
  practiceArea: string;
  jurisdiction: string;
  urgency: string;
  tier: string;
  conflictPartyCounts: Record<string, number>;
  candidates: Array<{
    professionalProfileId: string;
    displayName: string;
    matchScore: number;
    scoreBreakdown: ScoreBreakdown;
    explainableMatchReasons: string[];
    readinessScore: number | null;
    reciprocityIndex: number | null;
    eligible: boolean;
    disqualificationReason: string | null;
  }>;
}

export interface AssignmentRationale {
  Source: AIRationaleSource;
  Summary: string;
  Rationale: string;
  Risks: string[];
  GeneratedAt: string;
}

export interface EscalationRationale {
  Source: AIRationaleSource;
  Summary: string;
  Rationale: string;
  GeneratedAt: string;
}

export interface RecommendEscalationOptions {
  Force?: boolean;
}

export interface RecommendEscalationResult extends EscalationRationale {
  ReferralEscalationID: string;
  RecommendedAction: EscalationRecommendedAction;
  Skipped: boolean;
}

interface RawMatchRationaleEntry {
  professionalProfileId?: string;
  summary?: string;
  rationale?: string;
  risks?: string[];
}

interface RawMatchRationaleOutput {
  rationales?: RawMatchRationaleEntry[];
}

interface RawEscalationAdvisorOutput {
  recommendedAction?: string;
  summary?: string;
  rationale?: string;
}

function toJSONSafe<T>(value: T): Record<string, PromptDataValue> {
  return JSON.parse(JSON.stringify(value)) as Record<string, PromptDataValue>;
}

function deterministicAssignmentRationale(candidate: RationaleCandidateInput, now: string): AssignmentRationale {
  const topReasons = candidate.ExplainableMatchReasons.slice(0, 3);
  return {
    Source: 'Deterministic',
    Summary: `${Math.round(candidate.MatchScore)}% match based on ${topReasons.length > 0 ? topReasons.join('; ') : 'practice area and jurisdiction fit'}.`,
    Rationale: candidate.ExplainableMatchReasons.join(' '),
    Risks: candidate.DisqualificationReason ? [candidate.DisqualificationReason] : [],
    GeneratedAt: now,
  };
}

function deterministicRecommendedAction(escalation: ReferralEscalationEntity): EscalationRecommendedAction {
  if (escalation.EscalationLevel >= 3 || escalation.TriggerType === 'CascadeExhausted') {
    return 'EscalateToTier';
  }
  if (escalation.TriggerType === 'CapacityExhausted') {
    return 'Reassign';
  }
  if (escalation.TriggerType === 'UrgentUnassigned') {
    return 'AdminAlert';
  }
  return 'Notify';
}

function parseEscalationRationale(json: string): EscalationRationale | null {
  try {
    const parsed = JSON.parse(json) as Partial<EscalationRationale>;
    if (
      (parsed.Source === 'AI' || parsed.Source === 'Deterministic') &&
      typeof parsed.Summary === 'string' &&
      typeof parsed.Rationale === 'string' &&
      typeof parsed.GeneratedAt === 'string'
    ) {
      return { Source: parsed.Source, Summary: parsed.Summary, Rationale: parsed.Rationale, GeneratedAt: parsed.GeneratedAt };
    }
    return null;
  } catch {
    return null;
  }
}

function deterministicEscalationRationale(escalation: ReferralEscalationEntity, action: EscalationRecommendedAction, now: string): EscalationRationale {
  return {
    Source: 'Deterministic',
    Summary: `Level ${escalation.EscalationLevel} ${escalation.TriggerType} escalation; rules default recommends '${action}'.`,
    Rationale: escalation.Notes ?? `No AI advisor available; falling back to the rules-based default for a '${escalation.TriggerType}' escalation at level ${escalation.EscalationLevel}.`,
    GeneratedAt: now,
  };
}

/**
 * Builds the privacy-safe prompt context for `Referrals Match Rationale` / passed
 * to the AI advisor. Per AC-32, this function's input types structurally exclude
 * `SeekerName`/`SeekerEmail`/`SeekerPhone`/`SeekerCompany`/`MatterSummary` text and
 * conflict-party names/organizations - callers must already have reduced those down
 * to role counts before calling this function.
 */
export class ReferralAIRationaleService {
  private static executor: IReferralPromptExecutor = new MJReferralPromptExecutor();

  /** Test seam: inject a fake `IReferralPromptExecutor`. Pass `undefined` to restore the default. */
  public static ConfigureExecutor(executor?: IReferralPromptExecutor): void {
    ReferralAIRationaleService.executor = executor ?? new MJReferralPromptExecutor();
  }

  public static BuildRationaleContext(request: RationaleRequestInput, candidates: RationaleCandidateInput[]): RationalePromptContext {
    return {
      practiceArea: request.PracticeAreaName,
      jurisdiction: request.JurisdictionName,
      urgency: request.UrgencyLevel,
      tier: request.TierName,
      conflictPartyCounts: request.ConflictPartyCountsByRole,
      candidates: candidates.map((c) => ({
        professionalProfileId: c.ProfessionalProfileID,
        displayName: c.DisplayName,
        matchScore: c.MatchScore,
        scoreBreakdown: c.ScoreBreakdown,
        explainableMatchReasons: c.ExplainableMatchReasons,
        readinessScore: c.ReadinessScore,
        reciprocityIndex: c.ReciprocityIndex,
        eligible: c.Eligible,
        disqualificationReason: c.DisqualificationReason,
      })),
    };
  }

  /**
   * Generates (AI, with a deterministic fallback) and persists a match rationale onto
   * every `Offered`/`Queued` `ReferralAssignment` for the given request. Per AC-33/34,
   * this method never throws: any failure (missing provider, missing prompt, invalid
   * AI output, executor exception) degrades to the deterministic fallback per-candidate.
   */
  public static async ExplainMatch(
    referralRequestId: string,
    contextUser: UserInfo,
    provider?: IMetadataProvider & IRunViewProvider,
  ): Promise<ExplainMatchOutput> {
    const now = new Date().toISOString();
    const emptyResult: ExplainMatchOutput = { ReferralRequestID: referralRequestId, ProcessedCount: 0, Rationales: [] };

    try {
      if (!provider) {
        return emptyResult;
      }
      const validRequestId = AssertValidUUID(referralRequestId, 'ReferralRequestID');

      const request = await provider.GetEntityObject<ReferralRequestEntity>('MJ_BizApps_Referrals: Referral Requests', contextUser);
      if (!(await request.Load(validRequestId))) {
        return emptyResult;
      }

      const rv = new RunView(provider);
      const [paRes, jurRes, tierRes, partiesRes, assignRes] = await rv.RunViews(
        [
          { EntityName: 'MJ_BizApps_Referrals: Practice Areas', ExtraFilter: `ID = '${request.PracticeAreaID}'`, ResultType: 'entity_object' },
          { EntityName: 'MJ_BizApps_Referrals: Jurisdictions', ExtraFilter: `ID = '${request.JurisdictionID}'`, ResultType: 'entity_object' },
          { EntityName: 'MJ_BizApps_Referrals: Referral Tiers', ExtraFilter: `ID = '${request.ReferralTierID}'`, ResultType: 'entity_object' },
          { EntityName: 'MJ_BizApps_Referrals: Conflict Check Parties', ExtraFilter: `ReferralRequestID = '${validRequestId}'`, ResultType: 'entity_object' },
          { EntityName: 'MJ_BizApps_Referrals: Referral Assignments', ExtraFilter: `ReferralRequestID = '${validRequestId}' AND Status IN ('Offered', 'Queued')`, ResultType: 'entity_object' },
        ],
        contextUser,
      );

      const practiceArea = paRes.Success ? (paRes.Results as PracticeAreaEntity[])[0] : undefined;
      const jurisdiction = jurRes.Success ? (jurRes.Results as JurisdictionEntity[])[0] : undefined;
      const tier = tierRes.Success ? (tierRes.Results as ReferralTierEntity[])[0] : undefined;
      const conflictParties = partiesRes.Success ? (partiesRes.Results as ConflictCheckPartyEntity[]) : [];
      const assignments = assignRes.Success ? (assignRes.Results as ReferralAssignmentEntity[]) : [];

      if (!practiceArea || !jurisdiction || !tier || assignments.length === 0) {
        return emptyResult;
      }

      const candidates: MatchCandidateScore[] = await MatchingEngine.FindMatches(
        {
          PracticeAreaID: request.PracticeAreaID,
          JurisdictionID: request.JurisdictionID,
          RequiresProBono: request.RequiresProBono,
          PreferredLanguage: request.PreferredLanguage,
          SLAResponseHours: tier.SLAResponseHours,
        },
        contextUser,
        provider,
        validRequestId,
      );

      const assignmentByProfileId = new Map(assignments.map((a) => [a.ProfessionalProfileID.toLowerCase(), a]));
      const relevantCandidates = candidates.filter((c) => assignmentByProfileId.has(c.ProfessionalProfileID.toLowerCase()));
      if (relevantCandidates.length === 0) {
        return emptyResult;
      }

      const profileIds = relevantCandidates.map((c) => `'${c.ProfessionalProfileID}'`).join(',');
      const profilesRes = await rv.RunView<ProfessionalProfileEntity>(
        { EntityName: 'MJ_BizApps_Referrals: Professional Profiles', ExtraFilter: `ID IN (${profileIds})`, ResultType: 'entity_object' },
        contextUser,
      );
      const readinessByProfileId = new Map(
        (profilesRes.Success ? profilesRes.Results : []).map((p) => [p.ID.toLowerCase(), { ReadinessScore: p.ReadinessScore, ReciprocityIndex: p.ReciprocityIndex }]),
      );

      const candidateInputs: RationaleCandidateInput[] = relevantCandidates.map((c) => {
        const readiness = readinessByProfileId.get(c.ProfessionalProfileID.toLowerCase());
        return {
          ProfessionalProfileID: c.ProfessionalProfileID,
          DisplayName: c.DisplayName,
          MatchScore: c.Score,
          ScoreBreakdown: c.Breakdown,
          ExplainableMatchReasons: c.ExplainableMatchReasons ?? [],
          ReadinessScore: readiness?.ReadinessScore ?? null,
          ReciprocityIndex: readiness?.ReciprocityIndex ?? null,
          Eligible: c.Eligible,
          DisqualificationReason: c.DisqualificationReason,
        };
      });

      const conflictPartyCounts: Record<string, number> = {};
      for (const party of conflictParties) {
        conflictPartyCounts[party.PartyRole] = (conflictPartyCounts[party.PartyRole] ?? 0) + 1;
      }

      const promptContext = ReferralAIRationaleService.BuildRationaleContext(
        {
          PracticeAreaName: practiceArea.Name,
          JurisdictionName: jurisdiction.Name,
          UrgencyLevel: request.UrgencyLevel,
          TierName: tier.Name,
          ConflictPartyCountsByRole: conflictPartyCounts,
        },
        candidateInputs,
      );

      const aiEntriesByProfileId = new Map<string, RawMatchRationaleEntry>();
      try {
        const execResult = await ReferralAIRationaleService.executor.ExecutePrompt<RawMatchRationaleOutput>(
          MATCH_RATIONALE_PROMPT_NAME,
          toJSONSafe(promptContext),
          contextUser,
        );
        if (execResult.Success && execResult.Result) {
          const knownIds = new Set(candidateInputs.map((c) => c.ProfessionalProfileID.toLowerCase()));
          for (const entry of execResult.Result.rationales ?? []) {
            if (
              typeof entry.professionalProfileId === 'string' &&
              knownIds.has(entry.professionalProfileId.toLowerCase()) &&
              typeof entry.summary === 'string' &&
              typeof entry.rationale === 'string'
            ) {
              aiEntriesByProfileId.set(entry.professionalProfileId.toLowerCase(), entry);
            }
          }
        }
      } catch {
        // Fall through to the deterministic fallback for every candidate below.
      }

      const rationales: ExplainMatchOutput['Rationales'] = [];
      let processedCount = 0;
      for (const candidate of candidateInputs) {
        const assignment = assignmentByProfileId.get(candidate.ProfessionalProfileID.toLowerCase());
        if (!assignment) {
          continue;
        }
        const aiEntry = aiEntriesByProfileId.get(candidate.ProfessionalProfileID.toLowerCase());
        const rationale: AssignmentRationale = aiEntry
          ? {
              Source: 'AI',
              Summary: aiEntry.summary ?? '',
              Rationale: aiEntry.rationale ?? '',
              Risks: Array.isArray(aiEntry.risks) ? aiEntry.risks.filter((r): r is string => typeof r === 'string') : [],
              GeneratedAt: now,
            }
          : deterministicAssignmentRationale(candidate, now);

        assignment.AIRationaleJSON = JSON.stringify(rationale);
        const saved = await assignment.Save();
        if (saved) {
          processedCount++;
          rationales.push({ ProfessionalProfileID: candidate.ProfessionalProfileID, ...rationale });
        }
      }

      return { ReferralRequestID: referralRequestId, ProcessedCount: processedCount, Rationales: rationales };
    } catch {
      return emptyResult;
    }
  }

  /**
   * Recommends (and persists) a `RecommendedAction` + `AIRationaleJSON` for an escalation,
   * via the AI advisor with a deterministic rules fallback. Idempotent by default: skips
   * the AI call (0 executor calls) when `AIRationaleJSON` already exists, unless
   * `options.Force` is set (1 executor call). Never mutates `Status`, `EscalationLevel`,
   * `CascadeOrder`, or any assignment row.
   */
  public static async RecommendEscalationAction(
    referralEscalationId: string,
    options: RecommendEscalationOptions,
    contextUser: UserInfo,
    provider?: IMetadataProvider & IRunViewProvider,
  ): Promise<RecommendEscalationResult> {
    const validId = AssertValidUUID(referralEscalationId, 'ReferralEscalationID');
    const now = new Date().toISOString();

    if (!provider) {
      throw new PersistenceError('A valid metadata provider is required to recommend an escalation action.');
    }

    const escalation = await provider.GetEntityObject<ReferralEscalationEntity>('MJ_BizApps_Referrals: Referral Escalations', contextUser);
    if (!(await escalation.Load(validId))) {
      throw new PersistenceError(`ReferralEscalation '${validId}' not found.`);
    }

    if (escalation.AIRationaleJSON && !options.Force) {
      const existing = parseEscalationRationale(escalation.AIRationaleJSON) ?? deterministicEscalationRationale(escalation, escalation.RecommendedAction, now);
      return { ReferralEscalationID: validId, RecommendedAction: escalation.RecommendedAction, Skipped: true, ...existing };
    }

    let recommendedAction: EscalationRecommendedAction | null = null;
    let rationale: EscalationRationale | null = null;

    try {
      const execResult = await ReferralAIRationaleService.executor.ExecutePrompt<RawEscalationAdvisorOutput>(
        ESCALATION_ADVISOR_PROMPT_NAME,
        {
          escalationLevel: escalation.EscalationLevel,
          triggerType: escalation.TriggerType,
          status: escalation.Status,
          notes: escalation.Notes ?? '',
        },
        contextUser,
      );
      if (
        execResult.Success &&
        execResult.Result &&
        typeof execResult.Result.recommendedAction === 'string' &&
        RECOMMENDED_ACTIONS.includes(execResult.Result.recommendedAction as EscalationRecommendedAction)
      ) {
        recommendedAction = execResult.Result.recommendedAction as EscalationRecommendedAction;
        rationale = {
          Source: 'AI',
          Summary: execResult.Result.summary ?? '',
          Rationale: execResult.Result.rationale ?? '',
          GeneratedAt: now,
        };
      }
    } catch {
      // Fall through to the deterministic default below.
    }

    if (!recommendedAction || !rationale) {
      recommendedAction = deterministicRecommendedAction(escalation);
      rationale = deterministicEscalationRationale(escalation, recommendedAction, now);
    }

    escalation.RecommendedAction = recommendedAction;
    escalation.AIRationaleJSON = JSON.stringify(rationale);
    await escalation.Save();

    return { ReferralEscalationID: validId, RecommendedAction: recommendedAction, Skipped: false, ...rationale };
  }
}
