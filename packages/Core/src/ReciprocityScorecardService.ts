import { IMetadataProvider, IRunViewProvider, RunView, UserInfo } from '@memberjunction/core';
import {
  ProfessionalAvailabilityWindowEntity,
  ProfessionalProfileEntity,
  ReciprocitySnapshotEntity,
  ReferralAssignmentEntity,
  ReferralOutcomeEntity,
  ReferralRequestEntity,
} from '@mj-biz-apps/referrals-entities';
import { CapacityReadinessService } from './CapacityReadinessService.js';
import { AssertValidUUID, PersistenceError, UUIDsEqual } from './validation.js';

export interface ReciprocityPeriod {
  Start: Date;
  End: Date;
}

export interface ReciprocityScorecard {
  ProfessionalProfileID: string;
  PeriodStart: Date;
  PeriodEnd: Date;
  Sent: number;
  Received: number;
  Accepted: number;
  Resolved: number;
  SLABreachCount: number;
  AcceptanceRate: number;
  MedianResponseHours: number | null;
  ReciprocityIndex: number;
  AttributedFeeTotal: number;
}

type ScorecardRequest = Pick<ReferralRequestEntity, 'ID' | 'ReferringProfessionalID' | 'SubmittedAt'>;
type ScorecardAssignment = Pick<
  ReferralAssignmentEntity,
  'ID' | 'ReferralRequestID' | 'ProfessionalProfileID' | 'Status' | 'ResponseHours' | 'OfferedAt' | 'RespondedAt'
>;
type ScorecardOutcome = Pick<
  ReferralOutcomeEntity,
  | 'ID'
  | 'ReferralAssignmentID'
  | 'ProfessionalProfileID'
  | 'OutcomeStatus'
  | 'ClosedAt'
  | 'ReportedFeeAmount'
  | 'EstimatedFeeAmount'
>;

export interface ReciprocityScorecardData {
  requests: ReadonlyArray<ScorecardRequest>;
  assignments: ReadonlyArray<ScorecardAssignment>;
  outcomes: ReadonlyArray<ScorecardOutcome>;
}

function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function median(values: number[]): number | null {
  if (values.length === 0) {
    return null;
  }
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

function inPeriod(date: Date | string | null | undefined, period: ReciprocityPeriod): boolean {
  if (!date) return false;
  const t = new Date(date).getTime();
  return t >= period.Start.getTime() && t <= period.End.getTime();
}

/**
 * Returns the current UTC calendar quarter [Start, End] as a ReciprocityPeriod.
 */
export function CurrentUtcQuarter(asOf: Date = new Date()): ReciprocityPeriod {
  const year = asOf.getUTCFullYear();
  const quarterIndex = Math.floor(asOf.getUTCMonth() / 3);
  const startMonth = quarterIndex * 3;
  const start = new Date(Date.UTC(year, startMonth, 1, 0, 0, 0, 0));
  const end = new Date(Date.UTC(year, startMonth + 3, 0, 23, 59, 59, 999));
  return { Start: start, End: end };
}

export class ReciprocityScorecardService {
  /**
   * Pure computation of a professional's reciprocity scorecard for a period:
   * - `Sent`: ReferralRequests they referred out (`ReferringProfessionalID`) submitted in-period.
   * - `Received`: ReferralAssignments offered to them (excluding ConflictRejected) in-period.
   * - `Accepted`: of those received, how many reached Accepted/InProgress/Completed.
   * - `Resolved`: ReferralOutcomes with OutcomeStatus='Completed' completed in-period.
   * - `SLABreachCount`: of their received assignments, how many expired (`Status='Expired'`) in-period.
   * - `AcceptanceRate`: Accepted/Received as a percentage (0 when Received is 0).
   * - `MedianResponseHours`: median of recorded `ResponseHours` across their in-period assignments.
   * - `ReciprocityIndex`: round((Sent + 1) / (Accepted + 1), 3) — a net-giver/net-taker ratio.
   * - `AttributedFeeTotal`: sum of `ReferralOutcome.FeeAmount` for their completed outcomes in-period.
   */
  public static ComputeScorecard(
    profileId: string,
    period: ReciprocityPeriod,
    data: ReciprocityScorecardData,
  ): ReciprocityScorecard {
    const validProfileId = AssertValidUUID(profileId, 'ProfessionalProfileID');

    const sentRequests = data.requests.filter(
      (r) => r.ReferringProfessionalID != null && UUIDsEqual(r.ReferringProfessionalID, validProfileId) && inPeriod(r.SubmittedAt, period),
    );
    const Sent = sentRequests.length;

    const receivedAssignments = data.assignments.filter(
      (a) =>
        UUIDsEqual(a.ProfessionalProfileID, validProfileId) &&
        a.Status !== 'ConflictRejected' &&
        inPeriod(a.OfferedAt ?? a.RespondedAt, period),
    );
    const Received = receivedAssignments.length;

    const Accepted = receivedAssignments.filter(
      (a) => a.Status === 'Accepted' || a.Status === 'InProgress' || a.Status === 'Completed',
    ).length;

    const SLABreachCount = receivedAssignments.filter((a) => a.Status === 'Expired').length;

    const responseHoursValues = receivedAssignments
      .map((a) => a.ResponseHours)
      .filter((v): v is number => v != null);
    const MedianResponseHours = median(responseHoursValues);

    const myOutcomes = data.outcomes.filter(
      (o) => UUIDsEqual(o.ProfessionalProfileID, validProfileId) && inPeriod(o.ClosedAt, period),
    );
    const Resolved = myOutcomes.filter((o) => o.OutcomeStatus === 'Resolved').length;
    const AttributedFeeTotal = roundTo(
      myOutcomes.reduce((sum, o) => sum + (o.ReportedFeeAmount ?? o.EstimatedFeeAmount ?? 0), 0),
      2,
    );

    // AcceptanceRate is a 0..1 fraction per Spec SS2.3 (e.g. 0.8000), not a percentage.
    const AcceptanceRate = Received > 0 ? roundTo(Accepted / Received, 4) : 0;
    const ReciprocityIndex = roundTo((Sent + 1) / (Accepted + 1), 3);

    return {
      ProfessionalProfileID: validProfileId,
      PeriodStart: period.Start,
      PeriodEnd: period.End,
      Sent,
      Received,
      Accepted,
      Resolved,
      SLABreachCount,
      AcceptanceRate,
      MedianResponseHours,
      ReciprocityIndex,
      AttributedFeeTotal,
    };
  }

  /**
   * Recomputes and upserts `ReciprocitySnapshot` rows (keyed by `ProfessionalProfileID` +
   * `PeriodStartDate` + `PeriodEndDate`) for every active `ProfessionalProfile`, and
   * updates `ProfessionalProfile.ReciprocityIndex`, `ReadinessScore`, and `ReadinessComputedAt`.
   * Defaults to the current UTC calendar quarter when no period is supplied.
   */
  public static async RecomputeSnapshots(
    contextUser: UserInfo,
    provider?: IMetadataProvider & IRunViewProvider,
    period?: ReciprocityPeriod,
  ): Promise<{ ProcessedCount: number; Period: ReciprocityPeriod }> {
    const dp = provider ?? undefined;
    if (!dp) {
      throw new PersistenceError('A valid metadata provider is required to recompute reciprocity snapshots.');
    }
    const effectivePeriod = period ?? CurrentUtcQuarter();
    const rv = new RunView(dp);
    const toDateOnly = (d: Date): string => d.toISOString().slice(0, 10);
    const periodStartDateOnly = toDateOnly(effectivePeriod.Start);
    const periodEndDateOnly = toDateOnly(effectivePeriod.End);

    const [profilesRes, requestsRes, assignmentsRes, outcomesRes, windowsRes, existingSnapshotsRes] = await rv.RunViews(
      [
        { EntityName: 'MJ_BizApps_Referrals: Professional Profiles', ExtraFilter: 'IsActive = 1', ResultType: 'entity_object' },
        { EntityName: 'MJ_BizApps_Referrals: Referral Requests', ResultType: 'simple' },
        { EntityName: 'MJ_BizApps_Referrals: Referral Assignments', ResultType: 'simple' },
        { EntityName: 'MJ_BizApps_Referrals: Referral Outcomes', ResultType: 'simple' },
        { EntityName: 'MJ_BizApps_Referrals: Professional Availability Windows', ResultType: 'simple' },
        {
          EntityName: 'MJ_BizApps_Referrals: Reciprocity Snapshots',
          ExtraFilter: `PeriodStart = '${periodStartDateOnly}' AND PeriodEnd = '${periodEndDateOnly}'`,
          ResultType: 'entity_object',
        },
      ],
      contextUser,
    );

    if (!profilesRes.Success || !requestsRes.Success || !assignmentsRes.Success || !outcomesRes.Success) {
      throw new PersistenceError('Failed to batch-load reciprocity scorecard source data.');
    }

    const data: ReciprocityScorecardData = {
      requests: requestsRes.Results as ReferralRequestEntity[],
      assignments: assignmentsRes.Results as ReferralAssignmentEntity[],
      outcomes: outcomesRes.Results as ReferralOutcomeEntity[],
    };

    const allWindows: ProfessionalAvailabilityWindowEntity[] = windowsRes?.Success
      ? (windowsRes.Results as ProfessionalAvailabilityWindowEntity[])
      : [];

    const existingSnapshotsByProfileId = new Map<string, ReciprocitySnapshotEntity>();
    if (existingSnapshotsRes?.Success) {
      for (const snap of existingSnapshotsRes.Results as ReciprocitySnapshotEntity[]) {
        if (snap.ProfessionalProfileID) {
          existingSnapshotsByProfileId.set(snap.ProfessionalProfileID.toLowerCase(), snap);
        }
      }
    }

    let processedCount = 0;
    for (const profile of profilesRes.Results as ProfessionalProfileEntity[]) {
      const scorecard = ReciprocityScorecardService.ComputeScorecard(profile.ID, effectivePeriod, data);

      const existingSnapshot = existingSnapshotsByProfileId.get(profile.ID.toLowerCase());
      const snapshot: ReciprocitySnapshotEntity =
        existingSnapshot ??
        (await dp.GetEntityObject<ReciprocitySnapshotEntity>('MJ_BizApps_Referrals: Reciprocity Snapshots', contextUser));

      snapshot.ProfessionalProfileID = profile.ID;
      snapshot.ComputedAt = new Date();
      snapshot.PeriodStart = effectivePeriod.Start;
      snapshot.PeriodEnd = effectivePeriod.End;
      snapshot.ReferralsSent = scorecard.Sent;
      snapshot.ReferralsReceived = scorecard.Received;
      snapshot.ReferralsAccepted = scorecard.Accepted;
      snapshot.ReferralsResolved = scorecard.Resolved;
      snapshot.SLABreachCount = scorecard.SLABreachCount;
      snapshot.AcceptanceRate = scorecard.AcceptanceRate;
      snapshot.MedianResponseHours = scorecard.MedianResponseHours;
      snapshot.ReciprocityIndex = scorecard.ReciprocityIndex;
      snapshot.AttributedFeeTotal = scorecard.AttributedFeeTotal;
      const snapSaved = await snapshot.Save();
      if (!snapSaved) {
        throw new PersistenceError(`Failed to save ReciprocitySnapshot for ProfessionalProfile '${profile.ID}'.`);
      }

      profile.ReciprocityIndex = scorecard.ReciprocityIndex;
      const profileWindows = allWindows.filter((w) => UUIDsEqual(w.ProfessionalProfileID, profile.ID));
      const recentAssignments = data.assignments.filter((a) => UUIDsEqual(a.ProfessionalProfileID, profile.ID));
      const readiness = CapacityReadinessService.ComputeReadinessScore({
        profile,
        credentials: [],
        windows: profileWindows,
        recentAssignments,
      });
      profile.ReadinessScore = readiness.Score;
      profile.ReadinessComputedAt = new Date();
      const profileSaved = await profile.Save();
      if (!profileSaved) {
        throw new PersistenceError(`Failed to update ProfessionalProfile readiness for '${profile.ID}'.`);
      }

      processedCount++;
    }

    return { ProcessedCount: processedCount, Period: effectivePeriod };
  }
}
