import {
  BaseEntity,
  IMetadataProvider,
  IRunViewProvider,
  Metadata,
  RunView,
  UserInfo,
} from '@memberjunction/core';
import {
  ConflictCheckPartyEntity,
  PracticeAreaEntity,
  ProfessionalJurisdictionEntity,
  ProfessionalPracticeAreaEntity,
  ProfessionalProfileEntity,
  ReferralAssignmentEntity,
  ReferralEscalationEntity,
  ReferralOutcomeEntity,
  ReferralRequestEntity,
  ReferralTierEntity,
} from '@mj-biz-apps/referrals-entities';
import { CapacityReadinessService } from './CapacityReadinessService.js';
import { ActiveMatterPartyRecord, ConflictScreeningService, NormalizePartyName } from './ConflictScreeningService.js';
import { MatchingEngine } from './MatchingEngine.js';
import { ReferralTelemetry } from './ReferralTelemetry.js';
import { SlaEscalationService } from './SlaEscalationService.js';
import {
  AssignmentResponseAction,
  CascadeRoutingResult,
  ConflictPartyInput,
  ReferralRequestStatus,
  ResponseOutcome,
  SweepResult,
} from './types.js';
import {
  AssertValidUUID,
  AuthorizationError,
  ConcurrencyConflictError,
  ConflictScreeningUnavailableError,
  InvalidLifecycleStateError,
  IsAssociationAdmin,
  PersistenceError,
  UUIDsEqual,
} from './validation.js';

export { IsAssociationAdmin } from './validation.js';

const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000;

function roundTo2(value: number): number {
  return Math.round(value * 100) / 100;
}

interface EntityTransactionHandle {
  Commit(): Promise<void>;
  Rollback(): Promise<void>;
}

type TransactionalProvider = IMetadataProvider &
  IRunViewProvider & {
    BeginEntityTransaction?(): Promise<EntityTransactionHandle>;
  };

type ActiveTransactionalProvider = IMetadataProvider &
  IRunViewProvider & {
    BeginEntityTransaction(): Promise<EntityTransactionHandle>;
  };

type SqlParamValue = string | number | boolean | Date | null | undefined;
interface SqlQueryRow {
  [column: string]: SqlParamValue;
}

interface SqlCapableProvider {
  ExecuteSQL<T = SqlQueryRow>(
    sql: string,
    params?: SqlParamValue[],
    options?: { description?: string },
    user?: UserInfo,
  ): Promise<T[]>;
  PlatformKey?: string;
}

const TERMINAL_REQUEST_STATUSES: ReadonlySet<ReferralRequestStatus> = new Set([
  'Accepted',
  'Completed',
  'Cancelled',
  'Exhausted',
]);

function hasTransactionSupport(provider: object | null | undefined): provider is ActiveTransactionalProvider {
  return (
    typeof provider === 'object' &&
    provider !== null &&
    'BeginEntityTransaction' in provider &&
    typeof (provider as { BeginEntityTransaction?: () => Promise<EntityTransactionHandle> }).BeginEntityTransaction === 'function'
  );
}

function hasSqlSupport(provider: object | null | undefined): provider is SqlCapableProvider {
  return (
    typeof provider === 'object' &&
    provider !== null &&
    'ExecuteSQL' in provider &&
    typeof (provider as SqlCapableProvider).ExecuteSQL === 'function'
  );
}

/**
 * Resolves a transaction-capable provider (explicitly passed or `Metadata.Provider`).
 * Never silently bypasses transactions: throws `PersistenceError` if unavailable.
 */
function resolveTransactionalProvider(
  provider?: IMetadataProvider & IRunViewProvider,
): TransactionalProvider {
  const candidate = provider ?? (Metadata.Provider as (IMetadataProvider & IRunViewProvider) | undefined);
  if (!candidate) {
    throw new PersistenceError(
      'A valid metadata provider is required for referral state mutations.',
    );
  }
  return candidate as TransactionalProvider;
}

export interface TransactionCompensationContext {
  registerCompensation(action: () => Promise<void>): void;
}

async function withEntityTransaction<T>(
  provider: TransactionalProvider,
  fn: (txProvider: TransactionalProvider, compensation?: TransactionCompensationContext) => Promise<T>,
): Promise<T> {
  if (hasTransactionSupport(provider)) {
    const tx = await provider.BeginEntityTransaction();
    try {
      const result = await fn(provider);
      await tx.Commit();
      return result;
    } catch (err) {
      try {
        await tx.Rollback();
      } catch {
        // Preserve original error
      }
      throw err;
    }
  }

  // Graceful transactional compensation for client GraphQL and non-transactional metadata providers
  const compensations: Array<() => Promise<void>> = [];
  const compensationContext: TransactionCompensationContext = {
    registerCompensation(action: () => Promise<void>) {
      compensations.push(action);
    },
  };

  try {
    return await fn(provider, compensationContext);
  } catch (err) {
    // Run compensating actions in reverse order to undo operations atomically
    for (let i = compensations.length - 1; i >= 0; i--) {
      try {
        await compensations[i]();
      } catch (compErr) {
        console.warn('Compensation error during rollback cleanup:', compErr);
      }
    }
    throw err;
  }
}

async function atomicClaimAssignmentOffer(
  provider: TransactionalProvider,
  assignment: ReferralAssignmentEntity,
  nextStatus: ReferralAssignmentEntity['Status'],
  respondedAt: Date,
  notes: string | null,
  contextUser: UserInfo,
  responseHours: number | null = null,
): Promise<void> {
  if (hasSqlSupport(provider)) {
    const isPostgres = provider.PlatformKey === 'postgresql';
    const sql = isPostgres
      ? `UPDATE __mj_BizAppsReferrals."ReferralAssignment"
         SET "Status" = $1, "RespondedAt" = $2, "ResponseNotes" = COALESCE($3, "ResponseNotes"), "ResponseHours" = COALESCE($5, "ResponseHours")
         WHERE "ID" = $4 AND "Status" = 'Offered'
         RETURNING "ID"`
      : `UPDATE [__mj_BizAppsReferrals].[ReferralAssignment]
         SET [Status] = @p0, [RespondedAt] = @p1, [ResponseNotes] = COALESCE(@p2, [ResponseNotes]), [ResponseHours] = COALESCE(@p4, [ResponseHours])
         OUTPUT INSERTED.[ID]
         WHERE [ID] = @p3 AND [Status] = N'Offered'`;
    const rows = await provider.ExecuteSQL<{ ID: string }>(
      sql,
      [nextStatus, respondedAt, notes, assignment.ID, responseHours],
      undefined,
      contextUser,
    );
    if (rows.length !== 1) {
      throw new ConcurrencyConflictError(
        `ReferralAssignment '${assignment.ID}' could not be claimed from 'Offered' (concurrent modification).`,
      );
    }
    return;
  }

  if (assignment.Status !== 'Offered') {
    throw new ConcurrencyConflictError(
      `ReferralAssignment '${assignment.ID}' is in status '${assignment.Status}', expected 'Offered'.`,
    );
  }
  assignment.Status = nextStatus;
  assignment.RespondedAt = respondedAt;
  if (notes) {
    assignment.ResponseNotes = notes;
  }
  if (responseHours != null) {
    assignment.ResponseHours = responseHours;
  }
  await saveOrThrow(assignment, `${nextStatus} ReferralAssignment`);
}

/**
 * Recomputes ProfessionalProfile.AverageResponseHours as a rolling 90-day average
 * across completed/accepted ReferralAssignments with a recorded ResponseHours.
 */
async function recompute90DayAverageResponseHours(
  provider: TransactionalProvider & IRunViewProvider,
  professionalProfileId: string,
  contextUser: UserInfo,
): Promise<number | null> {
  const rv = new RunView(provider);
  const cutoff = new Date(Date.now() - NINETY_DAYS_MS).toISOString();
  const res = await rv.RunView<ReferralAssignmentEntity>(
    {
      EntityName: 'MJ_BizApps_Referrals: Referral Assignments',
      ExtraFilter: `ProfessionalProfileID = '${professionalProfileId}' AND ResponseHours IS NOT NULL AND RespondedAt >= '${cutoff}'`,
      ResultType: 'entity_object',
    },
    contextUser,
  );
  if (!res.Success || res.Results.length === 0) {
    return null;
  }
  const values = res.Results.map((a) => a.ResponseHours).filter((v): v is number => v != null);
  if (values.length === 0) {
    return null;
  }
  const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
  return roundTo2(avg);
}

async function atomicIncrementProCapacity(
  provider: TransactionalProvider,
  pro: ProfessionalProfileEntity,
  contextUser: UserInfo,
): Promise<void> {
  if (hasSqlSupport(provider)) {
    const isPostgres = provider.PlatformKey === 'postgresql';
    const sql = isPostgres
      ? `UPDATE __mj_BizAppsReferrals."ProfessionalProfile"
         SET "ActiveReferralCount" = "ActiveReferralCount" + 1,
             "TotalAcceptedCount" = "TotalAcceptedCount" + 1
         WHERE "ID" = $1 AND "ActiveReferralCount" < "MaxConcurrentReferrals"
         RETURNING "ID"`
      : `UPDATE [__mj_BizAppsReferrals].[ProfessionalProfile]
         SET [ActiveReferralCount] = [ActiveReferralCount] + 1,
             [TotalAcceptedCount] = [TotalAcceptedCount] + 1
         OUTPUT INSERTED.[ID]
         WHERE [ID] = @p0 AND [ActiveReferralCount] < [MaxConcurrentReferrals]`;
    const rows = await provider.ExecuteSQL<{ ID: string }>(sql, [pro.ID], undefined, contextUser);
    if (rows.length !== 1) {
      throw new InvalidLifecycleStateError(
        `Professional '${pro.ID}' reached maximum concurrent referral capacity during acceptance.`,
      );
    }
    return;
  }

  if (pro.ActiveReferralCount >= pro.MaxConcurrentReferrals) {
    throw new InvalidLifecycleStateError(
      `Professional '${pro.ID}' is at max concurrent referral capacity (${pro.ActiveReferralCount}/${pro.MaxConcurrentReferrals}).`,
    );
  }
  pro.ActiveReferralCount = pro.ActiveReferralCount + 1;
  pro.TotalAcceptedCount = pro.TotalAcceptedCount + 1;
  await saveOrThrow(pro, 'ProfessionalProfile capacity update');
}

/**
 * Atomically decrements `ActiveReferralCount` (floored at 0 via a `CASE WHEN` guard - never
 * negative) and increments `TotalCompletedCount` on referral completion, using a single
 * dual-dialect conditional SQL statement when the provider supports raw SQL, falling back to
 * an in-memory guarded update otherwise.
 */
async function atomicDecrementProCapacityOnCompletion(
  provider: TransactionalProvider,
  pro: ProfessionalProfileEntity,
  contextUser: UserInfo,
): Promise<void> {
  if (hasSqlSupport(provider)) {
    const isPostgres = provider.PlatformKey === 'postgresql';
    const sql = isPostgres
      ? `UPDATE __mj_BizAppsReferrals."ProfessionalProfile"
         SET "ActiveReferralCount" = CASE WHEN "ActiveReferralCount" > 0 THEN "ActiveReferralCount" - 1 ELSE 0 END,
             "TotalCompletedCount" = "TotalCompletedCount" + 1
         WHERE "ID" = $1
         RETURNING "ID"`
      : `UPDATE [__mj_BizAppsReferrals].[ProfessionalProfile]
         SET [ActiveReferralCount] = CASE WHEN [ActiveReferralCount] > 0 THEN [ActiveReferralCount] - 1 ELSE 0 END,
             [TotalCompletedCount] = [TotalCompletedCount] + 1
         OUTPUT INSERTED.[ID]
         WHERE [ID] = @p0`;
    const rows = await provider.ExecuteSQL<{ ID: string }>(sql, [pro.ID], undefined, contextUser);
    if (rows.length !== 1) {
      throw new PersistenceError(`Failed to update completion counters for ProfessionalProfile '${pro.ID}'.`);
    }
    return;
  }

  pro.ActiveReferralCount = Math.max(0, pro.ActiveReferralCount - 1);
  pro.TotalCompletedCount = pro.TotalCompletedCount + 1;
  await saveOrThrow(pro, 'ProfessionalProfile completion counters');
}

async function saveOrThrow(entity: BaseEntity, label: string): Promise<void> {
  const saved = await entity.Save();
  if (!saved) {
    const detail = entity.LatestResult?.CompleteMessage ?? 'Save returned false';
    throw new PersistenceError(`Failed to save ${label}: ${detail}`);
  }
}

export class CascadeRoutingService {
  /**
   * Matches eligible professionals for a ReferralRequest, creates sequential
   * ReferralAssignment records up to ReferralTier.MaxCascadeAttempts, and
   * offers the top-ranked cleared candidate with an SLA deadline.
   *
   * - Idempotent when request is already `Routed`.
   * - Rejects terminal request statuses (`Accepted`, `Completed`, `Cancelled`, `Exhausted`).
   */
  /**
   * Atomically creates a ReferralRequest, persists all ConflictCheckParty records inside a single
   * transaction, transitions the request to `Submitted`, and optionally routes it immediately.
   */
  public static async SubmitIntakeWithConflicts(
    input: {
      SeekerName: string;
      SeekerEmail: string;
      PracticeAreaID: string;
      JurisdictionID: string;
      ReferralTierID: string;
      MatterTitle: string;
      MatterSummary: string;
      RequiresProBono?: boolean;
      PreferredLanguage?: string | null;
      UrgencyLevel?: ReferralRequestEntity['UrgencyLevel'];
      ConflictParties?: ConflictPartyInput[];
      AutoRoute?: boolean;
    },
    contextUser: UserInfo,
    provider?: IMetadataProvider & IRunViewProvider,
  ): Promise<{ RequestID: string; RequestNumber: string; Status: ReferralRequestStatus; RoutingResult?: CascadeRoutingResult }> {
    const txProvider = resolveTransactionalProvider(provider);
    const validPracticeId = AssertValidUUID(input.PracticeAreaID, 'PracticeAreaID');
    const validJurisdictionId = AssertValidUUID(input.JurisdictionID, 'JurisdictionID');
    const validTierId = AssertValidUUID(input.ReferralTierID, 'ReferralTierID');

    const created = await withEntityTransaction(txProvider, async (tx, compensation) => {
      const req = await tx.GetEntityObject<ReferralRequestEntity>(
        'MJ_BizApps_Referrals: Referral Requests',
        contextUser,
      );
      req.SeekerName = input.SeekerName;
      req.SeekerEmail = input.SeekerEmail;
      req.PracticeAreaID = validPracticeId;
      req.JurisdictionID = validJurisdictionId;
      req.ReferralTierID = validTierId;
      req.MatterTitle = input.MatterTitle;
      req.MatterSummary = input.MatterSummary;
      req.RequiresProBono = Boolean(input.RequiresProBono);
      if (input.PreferredLanguage) {
        req.PreferredLanguage = input.PreferredLanguage;
      }
      if (input.UrgencyLevel) {
        req.UrgencyLevel = input.UrgencyLevel;
      }
      req.Status = 'Draft';
      await saveOrThrow(req, 'Draft ReferralRequest');
      compensation?.registerCompensation(async () => {
        await req.Delete();
      });

      const parties = input.ConflictParties ?? [];
      for (let i = 0; i < parties.length; i++) {
        const draft = parties[i];
        const party = await tx.GetEntityObject<ConflictCheckPartyEntity>(
          'MJ_BizApps_Referrals: Conflict Check Parties',
          contextUser,
        );
        party.ReferralRequestID = req.ID;
        party.PartyName = draft.PartyName;
        party.PartyRole = draft.PartyRole;
        party.OrganizationName = draft.OrganizationName ?? null;
        party.NormalizedName = NormalizePartyName(draft.PartyName);
        await saveOrThrow(party, `ConflictCheckParty #${i + 1}`);
        compensation?.registerCompensation(async () => {
          await party.Delete();
        });
      }

      req.Status = 'Submitted';
      req.SubmittedAt = new Date();
      await saveOrThrow(req, 'Submitted ReferralRequest');

      return { RequestID: req.ID, RequestNumber: req.RequestNumber, Status: req.Status as ReferralRequestStatus };
    });

    if (input.AutoRoute) {
      const routingResult = await CascadeRoutingService.RouteReferralRequest(
        created.RequestID,
        contextUser,
        txProvider,
      );
      return {
        ...created,
        Status: routingResult.Status,
        RoutingResult: routingResult,
      };
    }

    return created;
  }

  public static async RouteReferralRequest(
    referralRequestId: string,
    contextUser: UserInfo,
    provider?: IMetadataProvider & IRunViewProvider,
  ): Promise<CascadeRoutingResult> {
    const startMs = Date.now();
    const validRequestId = AssertValidUUID(referralRequestId, 'ReferralRequestID');
    const txProvider = resolveTransactionalProvider(provider);
    const rv = new RunView(txProvider);

    return withEntityTransaction(txProvider, async (md) => {
      const request = await md.GetEntityObject<ReferralRequestEntity>(
        'MJ_BizApps_Referrals: Referral Requests',
        contextUser,
      );
      if (!request) {
        throw new PersistenceError('Unable to instantiate ReferralRequest entity.');
      }
      if (!(await request.Load(validRequestId))) {
        throw new PersistenceError(`ReferralRequest '${validRequestId}' not found.`);
      }

      if (TERMINAL_REQUEST_STATUSES.has(request.Status)) {
        throw new InvalidLifecycleStateError(
          `Cannot route ReferralRequest '${validRequestId}' in terminal status '${request.Status}'.`,
        );
      }

      const existingResult = await rv.RunView<ReferralAssignmentEntity>(
        {
          EntityName: 'MJ_BizApps_Referrals: Referral Assignments',
          ExtraFilter: `ReferralRequestID = '${validRequestId}'`,
          OrderBy: 'CascadeOrder ASC',
          ResultType: 'entity_object',
        },
        contextUser,
      );
      if (!existingResult.Success) {
        throw new PersistenceError(
          `Failed loading existing assignments for '${validRequestId}': ${existingResult.ErrorMessage ?? 'Unknown error'}.`,
        );
      }

      // Idempotent return if already Routed
      if (request.Status === 'Routed') {
        const activeOffer = existingResult.Results.find((a) => a.Status === 'Offered') ?? null;
        const queuedCount = existingResult.Results.filter(
          (a) => a.Status === 'Offered' || a.Status === 'Queued',
        ).length;
        const conflictCount = existingResult.Results.filter(
          (a) => a.Status === 'ConflictRejected',
        ).length;
        return {
          ReferralRequestID: validRequestId,
          Status: 'Routed',
          TotalQueued: queuedCount,
          ActiveAssignmentID: activeOffer?.ID ?? null,
          ActiveProfessionalID: activeOffer?.ProfessionalProfileID ?? null,
          SLADeadlineAt: activeOffer?.SLADeadlineAt ? new Date(activeOffer.SLADeadlineAt).toISOString() : null,
          ConflictRejectedCount: conflictCount,
        };
      }

      const tier = await md.GetEntityObject<ReferralTierEntity>(
        'MJ_BizApps_Referrals: Referral Tiers',
        contextUser,
      );
      if (!(await tier.Load(request.ReferralTierID))) {
        throw new PersistenceError(`ReferralTier '${request.ReferralTierID}' not found.`);
      }

      const existingByPro = new Set<string>(
        existingResult.Results.map((a) => a.ProfessionalProfileID.toLowerCase()),
      );

      const candidates = await MatchingEngine.FindMatches(
        {
          PracticeAreaID: request.PracticeAreaID,
          JurisdictionID: request.JurisdictionID,
          RequiresProBono: request.RequiresProBono,
          PreferredLanguage: request.PreferredLanguage,
          SLAResponseHours: tier.SLAResponseHours,
          MaxResults: tier.MaxCascadeAttempts * 2,
        },
        contextUser,
        txProvider,
        validRequestId,
      );

      const eligibleCandidates = [];
      const rejectedCandidates: Array<{ candidate: (typeof candidates)[number]; conflictStatus: 'ConflictFound' | 'Pending' }> = [];
      for (const c of candidates) {
        if (existingByPro.has(c.ProfessionalProfileID.toLowerCase())) {
          continue;
        }
        if (c.ConflictStatus === 'ConflictFound' || c.ConflictStatus === 'Unavailable') {
          rejectedCandidates.push({
            candidate: c,
            conflictStatus: c.ConflictStatus === 'ConflictFound' ? 'ConflictFound' : 'Pending',
          });
          continue;
        }
        if (c.Eligible && eligibleCandidates.length < tier.MaxCascadeAttempts) {
          eligibleCandidates.push(c);
        }
      }

      // Conflict-rejected candidates are numbered after all eligible candidates so
      // CascadeOrder stays unique and reflects eligible-first cascade priority.
      const conflictRejectedCount = rejectedCandidates.length;
      for (let i = 0; i < rejectedCandidates.length; i++) {
        const { candidate: c, conflictStatus } = rejectedCandidates[i];
        const rejected = await md.GetEntityObject<ReferralAssignmentEntity>(
          'MJ_BizApps_Referrals: Referral Assignments',
          contextUser,
        );
        rejected.ReferralRequestID = validRequestId;
        rejected.ProfessionalProfileID = c.ProfessionalProfileID;
        rejected.CascadeOrder = eligibleCandidates.length + i + 1;
        rejected.MatchScore = c.Score;
        rejected.ScoreBreakdownJSON = JSON.stringify(c.Breakdown);
        rejected.ConflictStatus = conflictStatus;
        rejected.ConflictReason = c.ConflictReasons.join('; ');
        rejected.Status = 'ConflictRejected';
        await saveOrThrow(rejected, 'ConflictRejected ReferralAssignment');
      }

      if (eligibleCandidates.length === 0) {
        request.Status = 'Exhausted';
        await saveOrThrow(request, 'Exhausted ReferralRequest');
        await SlaEscalationService.RaiseEscalation(
          {
            ReferralRequestID: validRequestId,
            TriggerType: 'CascadeExhausted',
            EscalationLevel: 2,
            RecommendedAction: 'ExpandPracticeArea',
            Notes: 'Cascade exhausted during initial routing: no eligible candidates remained after conflict screening.',
            DedupKey: `CascadeExhausted:${validRequestId}`,
          },
          contextUser,
          txProvider,
        );

        ReferralTelemetry.RecordOperation({
          Operation: 'RouteReferral',
          ElapsedMs: Date.now() - startMs,
          UserID: contextUser.ID,
          Metrics: {
            totalQueued: 0,
            conflictRejectedCount,
            exhausted: true,
          },
        });

        return {
          ReferralRequestID: validRequestId,
          Status: 'Exhausted',
          TotalQueued: 0,
          ActiveAssignmentID: null,
          ActiveProfessionalID: null,
          SLADeadlineAt: null,
          ConflictRejectedCount: conflictRejectedCount,
        };
      }

      const now = new Date();
      const slaDeadline = CapacityReadinessService.ComputeSLADeadline(now, tier, request.UrgencyLevel);
      let activeAssignmentId: string | null = null;
      let activeProfessionalId: string | null = null;

      for (let i = 0; i < eligibleCandidates.length; i++) {
        const c = eligibleCandidates[i];
        const assignment = await md.GetEntityObject<ReferralAssignmentEntity>(
          'MJ_BizApps_Referrals: Referral Assignments',
          contextUser,
        );
        assignment.ReferralRequestID = validRequestId;
        assignment.ProfessionalProfileID = c.ProfessionalProfileID;
        assignment.CascadeOrder = i + 1;
        assignment.MatchScore = c.Score;
        assignment.ScoreBreakdownJSON = JSON.stringify(c.Breakdown);
        assignment.ConflictStatus = 'Cleared';

        if (i === 0) {
          assignment.Status = 'Offered';
          assignment.OfferedAt = now;
          assignment.SLADeadlineAt = slaDeadline;
        } else {
          assignment.Status = 'Queued';
        }

        await saveOrThrow(assignment, `ReferralAssignment #${i + 1}`);
        if (i === 0) {
          activeAssignmentId = assignment.ID;
          activeProfessionalId = c.ProfessionalProfileID;
        }
      }

      request.Status = 'Routed';
      request.CurrentCascadeStep = 1;
      if (!request.SubmittedAt) {
        request.SubmittedAt = now;
      }
      await saveOrThrow(request, 'Routed ReferralRequest');

      ReferralTelemetry.RecordOperation({
        Operation: 'RouteReferral',
        ElapsedMs: Date.now() - startMs,
        UserID: contextUser.ID,
        Metrics: {
          totalQueued: eligibleCandidates.length,
          conflictRejectedCount,
          exhausted: false,
        },
      });

      return {
        ReferralRequestID: validRequestId,
        Status: 'Routed',
        TotalQueued: eligibleCandidates.length,
        ActiveAssignmentID: activeAssignmentId,
        ActiveProfessionalID: activeProfessionalId,
        SLADeadlineAt: slaDeadline.toISOString(),
        ConflictRejectedCount: conflictRejectedCount,
      };
    });
  }

  /**
   * Processes a professional's response (Accept, Decline, or ConflictReject) to an Offered assignment.
   * Enforces authorization (`ProfessionalProfile.UserID === contextUser.ID` or Association Admin),
   * conditional state claim (`Status === 'Offered'`), and transactional atomicity.
   */
  public static async RespondToAssignment(
    params: {
      ReferralAssignmentID: string;
      Action: AssignmentResponseAction;
      Notes?: string;
      DeclineReason?: string;
    },
    contextUser: UserInfo,
    provider?: IMetadataProvider & IRunViewProvider,
  ): Promise<ResponseOutcome> {
    const startMs = Date.now();
    const validAssignmentId = AssertValidUUID(params.ReferralAssignmentID, 'ReferralAssignmentID');
    const txProvider = resolveTransactionalProvider(provider);
    const rv = new RunView(txProvider);

    return withEntityTransaction(txProvider, async (md) => {
      const assignment = await md.GetEntityObject<ReferralAssignmentEntity>(
        'MJ_BizApps_Referrals: Referral Assignments',
        contextUser,
      );
      if (!(await assignment.Load(validAssignmentId))) {
        throw new PersistenceError(`ReferralAssignment '${validAssignmentId}' not found.`);
      }

      const pro = await md.GetEntityObject<ProfessionalProfileEntity>(
        'MJ_BizApps_Referrals: Professional Profiles',
        contextUser,
      );
      if (!(await pro.Load(AssertValidUUID(assignment.ProfessionalProfileID, 'ProfessionalProfileID')))) {
        throw new PersistenceError(`ProfessionalProfile '${assignment.ProfessionalProfileID}' not found.`);
      }

      if (!UUIDsEqual(pro.UserID, contextUser.ID) && !IsAssociationAdmin(contextUser)) {
        throw new AuthorizationError(
          `User '${contextUser.ID}' is not authorized to respond to assignment '${validAssignmentId}' for professional '${pro.ID}'.`,
        );
      }

      if (assignment.Status !== 'Offered') {
        throw new ConcurrencyConflictError(
          `ReferralAssignment '${validAssignmentId}' is in status '${assignment.Status}', expected 'Offered'.`,
        );
      }

      const request = await md.GetEntityObject<ReferralRequestEntity>(
        'MJ_BizApps_Referrals: Referral Requests',
        contextUser,
      );
      if (!(await request.Load(AssertValidUUID(assignment.ReferralRequestID, 'ReferralRequestID')))) {
        throw new PersistenceError(`ReferralRequest '${assignment.ReferralRequestID}' not found.`);
      }

      if (request.Status !== 'Routed') {
        throw new InvalidLifecycleStateError(
          `Cannot respond to assignment when ReferralRequest '${request.ID}' is in status '${request.Status}'.`,
        );
      }

      const now = new Date();

      if (params.Action === 'Accept') {
        if (assignment.SLADeadlineAt != null && new Date(assignment.SLADeadlineAt).getTime() <= now.getTime()) {
          throw new InvalidLifecycleStateError(
            `ReferralAssignment '${validAssignmentId}' SLA deadline (${new Date(assignment.SLADeadlineAt).toISOString()}) has expired.`,
          );
        }

        if (!pro.IsActive || pro.VerificationStatus !== 'Verified') {
          throw new InvalidLifecycleStateError(
            `Professional '${pro.ID}' is no longer active and verified (status: ${pro.VerificationStatus}).`,
          );
        }

        if (pro.AvailabilityStatus === 'Unavailable' || pro.AvailabilityStatus === 'OnLeave') {
          throw new InvalidLifecycleStateError(
            `Professional '${pro.ID}' is currently ${pro.AvailabilityStatus} and cannot accept referrals.`,
          );
        }

        if (pro.ActiveReferralCount >= pro.MaxConcurrentReferrals) {
          throw new InvalidLifecycleStateError(
            `Professional '${pro.ID}' is at max concurrent referral capacity (${pro.ActiveReferralCount}/${pro.MaxConcurrentReferrals}).`,
          );
        }

        const validProId = AssertValidUUID(pro.ID, 'ProfessionalProfileID');
        const validRequestId = AssertValidUUID(request.ID, 'ReferralRequestID');
        const validJurisdictionId = AssertValidUUID(request.JurisdictionID, 'JurisdictionID');

        const revalBatch = await rv.RunViews(
          [
            {
              EntityName: 'MJ_BizApps_Referrals: Professional Jurisdictions',
              ExtraFilter: `ProfessionalProfileID = '${validProId}' AND JurisdictionID = '${validJurisdictionId}'`,
              ResultType: 'entity_object',
            },
            {
              EntityName: 'MJ_BizApps_Referrals: Conflict Check Parties',
              ExtraFilter: `ReferralRequestID = '${validRequestId}'`,
              ResultType: 'entity_object',
            },
            {
              EntityName: 'MJ_BizApps_Referrals: Referral Assignments',
              ExtraFilter: "Status IN ('Offered', 'Accepted')",
              ResultType: 'entity_object',
            },
          ],
          contextUser,
        );

        if (!revalBatch[0]?.Success || !revalBatch[1]?.Success || !revalBatch[2]?.Success) {
          throw new ConflictScreeningUnavailableError(
            'Failed to load licensing standing and conflict screening context during acceptance.',
          );
        }

        const jurLinks = revalBatch[0].Results as ProfessionalJurisdictionEntity[];
        const standingOk = jurLinks.some(
          (l) => l.StandingStatus === 'GoodStanding' || l.StandingStatus === 'ProHacVice',
        );
        if (!standingOk) {
          throw new InvalidLifecycleStateError(
            `Professional '${pro.ID}' does not hold active standing in jurisdiction '${validJurisdictionId}'.`,
          );
        }

        const requestParties = revalBatch[1].Results as ConflictCheckPartyEntity[];
        const otherActiveAssignments = (revalBatch[2].Results as ReferralAssignmentEntity[]).filter(
          (a) => !UUIDsEqual(a.ID, assignment.ID),
        );
        const activeMatterParties: ActiveMatterPartyRecord[] = [];
        if (otherActiveAssignments.length > 0) {
          const otherReqIds = Array.from(
            new Set(otherActiveAssignments.map((a) => `'${AssertValidUUID(a.ReferralRequestID, 'ReferralRequestID')}'`)),
          ).join(',');
          const otherPartiesRes = await rv.RunView<ConflictCheckPartyEntity>(
            {
              EntityName: 'MJ_BizApps_Referrals: Conflict Check Parties',
              ExtraFilter: `ReferralRequestID IN (${otherReqIds})`,
              ResultType: 'entity_object',
            },
            contextUser,
          );
          if (!otherPartiesRes.Success) {
            throw new ConflictScreeningUnavailableError(
              `Failed loading active matter conflicts during acceptance: ${otherPartiesRes.ErrorMessage ?? 'Unknown error'}.`,
            );
          }
          for (const party of otherPartiesRes.Results) {
            for (const a of otherActiveAssignments) {
              if (UUIDsEqual(a.ReferralRequestID, party.ReferralRequestID)) {
                activeMatterParties.push({
                  ProfessionalProfileID: a.ProfessionalProfileID,
                  PartyName: party.PartyName,
                  OrganizationName: party.OrganizationName,
                });
              }
            }
          }
        }

        const conflict = ConflictScreeningService.ScreenCandidate(pro, requestParties, activeMatterParties);
        if (conflict.Status === 'Unavailable') {
          throw new ConflictScreeningUnavailableError(
            conflict.Reasons[0] ?? 'Conflict screening unavailable during acceptance.',
          );
        }
        if (conflict.HasConflict) {
          throw new InvalidLifecycleStateError(
            `Conflict of interest detected during acceptance: ${conflict.Reasons.join('; ')}`,
          );
        }

        const acceptResponseHours =
          assignment.OfferedAt != null
            ? roundTo2((now.getTime() - new Date(assignment.OfferedAt).getTime()) / (60 * 60 * 1000))
            : null;

        await atomicClaimAssignmentOffer(
          txProvider,
          assignment,
          'Accepted',
          now,
          params.Notes ?? null,
          contextUser,
          acceptResponseHours,
        );
        await atomicIncrementProCapacity(txProvider, pro, contextUser);

        if (hasSqlSupport(txProvider) && 'RunView' in txProvider) {
          const newAverage = await recompute90DayAverageResponseHours(
            txProvider as TransactionalProvider & IRunViewProvider,
            pro.ID,
            contextUser,
          );
          if (newAverage != null) {
            pro.AverageResponseHours = newAverage;
            await saveOrThrow(pro, 'ProfessionalProfile AverageResponseHours update');
          }
        }

        request.Status = 'Accepted';
        request.AssignedProfessionalID = assignment.ProfessionalProfileID;
        request.AcceptedAt = now;
        await saveOrThrow(request, 'Accepted ReferralRequest');

        const queuedRes = await rv.RunView<ReferralAssignmentEntity>(
          {
            EntityName: 'MJ_BizApps_Referrals: Referral Assignments',
            ExtraFilter: `ReferralRequestID = '${validRequestId}' AND Status = 'Queued'`,
            ResultType: 'entity_object',
          },
          contextUser,
        );
        if (!queuedRes.Success) {
          throw new PersistenceError(
            `Failed loading queued assignments to withdraw: ${queuedRes.ErrorMessage ?? 'Unknown error'}.`,
          );
        }
        for (const q of queuedRes.Results) {
          q.Status = 'Withdrawn';
          await saveOrThrow(q, 'Withdrawn ReferralAssignment');
        }

        ReferralTelemetry.RecordOperation({
          Operation: 'RespondToReferral',
          ElapsedMs: Date.now() - startMs,
          UserID: contextUser.ID,
          Metrics: { action: 'Accept', cascaded: false },
        });

        return {
          ReferralAssignmentID: assignment.ID,
          ReferralRequestID: request.ID,
          AssignmentStatus: 'Accepted',
          RequestStatus: 'Accepted',
          NextOfferedAssignmentID: null,
          NextOfferedProfessionalID: null,
        };
      }

      const nextStatus: ReferralAssignmentEntity['Status'] =
        params.Action === 'ConflictReject' ? 'ConflictRejected' : 'Declined';

      const declineResponseHours =
        assignment.OfferedAt != null
          ? roundTo2((now.getTime() - new Date(assignment.OfferedAt).getTime()) / (60 * 60 * 1000))
          : null;

      await atomicClaimAssignmentOffer(
        txProvider,
        assignment,
        nextStatus,
        now,
        params.Notes ?? null,
        contextUser,
        declineResponseHours,
      );

      if (params.Action === 'ConflictReject') {
        assignment.Status = 'ConflictRejected';
        assignment.ConflictStatus = 'ConflictFound';
        assignment.ConflictReason = params.DeclineReason ?? params.Notes ?? 'Self-reported conflict of interest.';
        if (declineResponseHours != null) {
          assignment.ResponseHours = declineResponseHours;
        }
        await saveOrThrow(assignment, 'ConflictRejected ReferralAssignment metadata');
      } else {
        assignment.Status = 'Declined';
        assignment.DeclineReason = params.DeclineReason ?? 'Declined by professional.';
        if (declineResponseHours != null) {
          assignment.ResponseHours = declineResponseHours;
        }
        await saveOrThrow(assignment, 'Declined ReferralAssignment metadata');
      }

      if (hasSqlSupport(txProvider) && 'RunView' in txProvider) {
        const newAverage = await recompute90DayAverageResponseHours(
          txProvider as TransactionalProvider & IRunViewProvider,
          pro.ID,
          contextUser,
        );
        if (newAverage != null) {
          pro.AverageResponseHours = newAverage;
          await saveOrThrow(pro, 'ProfessionalProfile AverageResponseHours update');
        }
      }

      const nextOffer = await CascadeRoutingService.AdvanceCascade(request, contextUser, txProvider);

      ReferralTelemetry.RecordOperation({
        Operation: 'RespondToReferral',
        ElapsedMs: Date.now() - startMs,
        UserID: contextUser.ID,
        Metrics: {
          action: params.Action,
          cascaded: nextOffer !== null,
        },
      });

      return {
        ReferralAssignmentID: assignment.ID,
        ReferralRequestID: request.ID,
        AssignmentStatus: assignment.Status,
        RequestStatus: request.Status,
        NextOfferedAssignmentID: nextOffer?.ID ?? null,
        NextOfferedProfessionalID: nextOffer?.ProfessionalProfileID ?? null,
      };
    });
  }

  /**
   * Promotes the next eligible Queued assignment for a ReferralRequest to Offered,
   * revalidating standing, verification, capacity headroom, and newly introduced conflicts.
   * Marks exhausted if no eligible queued assignments remain.
   */
  public static async AdvanceCascade(
    request: ReferralRequestEntity,
    contextUser: UserInfo,
    provider?: IMetadataProvider & IRunViewProvider,
  ): Promise<ReferralAssignmentEntity | null> {
    const md = provider ?? new Metadata();
    const rv = new RunView(provider);
    const validRequestId = AssertValidUUID(request.ID, 'ReferralRequestID');
    const validPracticeId = AssertValidUUID(request.PracticeAreaID, 'PracticeAreaID');
    const validJurisdictionId = AssertValidUUID(request.JurisdictionID, 'JurisdictionID');

    const batchRes = await rv.RunViews(
      [
        {
          EntityName: 'MJ_BizApps_Referrals: Referral Assignments',
          ExtraFilter: `ReferralRequestID = '${validRequestId}' AND Status = 'Queued'`,
          OrderBy: 'CascadeOrder ASC',
          ResultType: 'entity_object',
        },
        {
          EntityName: 'MJ_BizApps_Referrals: Conflict Check Parties',
          ExtraFilter: `ReferralRequestID = '${validRequestId}'`,
          ResultType: 'entity_object',
        },
        {
          EntityName: 'MJ_BizApps_Referrals: Referral Assignments',
          ExtraFilter: "Status IN ('Offered', 'Accepted')",
          ResultType: 'entity_object',
        },
      ],
      contextUser,
    );

    if (!batchRes[0]?.Success || !batchRes[1]?.Success || !batchRes[2]?.Success) {
      throw new ConflictScreeningUnavailableError('Failed to load cascade revalidation context.');
    }

    const queuedList = batchRes[0].Results as ReferralAssignmentEntity[];
    const requestParties = batchRes[1].Results as ConflictCheckPartyEntity[];
    const activeAssignments = batchRes[2].Results as ReferralAssignmentEntity[];

    const activeMatterParties: ActiveMatterPartyRecord[] = [];
    if (activeAssignments.length > 0) {
      const reqIds = Array.from(
        new Set(activeAssignments.map((a) => `'${AssertValidUUID(a.ReferralRequestID, 'ReferralRequestID')}'`)),
      ).join(',');
      const activePartiesRes = await rv.RunView<ConflictCheckPartyEntity>(
        {
          EntityName: 'MJ_BizApps_Referrals: Conflict Check Parties',
          ExtraFilter: `ReferralRequestID IN (${reqIds})`,
          ResultType: 'entity_object',
        },
        contextUser,
      );
      if (!activePartiesRes.Success) {
        throw new ConflictScreeningUnavailableError(
          `Failed loading active matter conflicts during cascade: ${activePartiesRes.ErrorMessage ?? 'Unknown error'}.`,
        );
      }
      for (const party of activePartiesRes.Results) {
        for (const a of activeAssignments) {
          if (UUIDsEqual(a.ReferralRequestID, party.ReferralRequestID)) {
            activeMatterParties.push({
              ProfessionalProfileID: a.ProfessionalProfileID,
              PartyName: party.PartyName,
              OrganizationName: party.OrganizationName,
            });
          }
        }
      }
    }

    const tier = await md.GetEntityObject<ReferralTierEntity>('MJ_BizApps_Referrals: Referral Tiers', contextUser);
    if (!(await tier.Load(request.ReferralTierID))) {
      throw new PersistenceError(`ReferralTier '${request.ReferralTierID}' not found.`);
    }
    for (const candidateAssignment of queuedList) {
      const validProId = AssertValidUUID(candidateAssignment.ProfessionalProfileID, 'ProfessionalProfileID');
      const pro = await md.GetEntityObject<ProfessionalProfileEntity>(
        'MJ_BizApps_Referrals: Professional Profiles',
        contextUser,
      );
      const proLoaded = await pro.Load(validProId);

      const linkBatch = await rv.RunViews(
        [
          {
            EntityName: 'MJ_BizApps_Referrals: Professional Practice Areas',
            ExtraFilter: `ProfessionalProfileID = '${validProId}' AND PracticeAreaID = '${validPracticeId}'`,
            ResultType: 'entity_object',
          },
          {
            EntityName: 'MJ_BizApps_Referrals: Professional Jurisdictions',
            ExtraFilter: `ProfessionalProfileID = '${validProId}' AND JurisdictionID = '${validJurisdictionId}'`,
            ResultType: 'entity_object',
          },
        ],
        contextUser,
      );

      const practiceLink = linkBatch[0]?.Success
        ? (linkBatch[0].Results[0] as ProfessionalPracticeAreaEntity | undefined)
        : undefined;
      const jurisdictionLink = linkBatch[1]?.Success
        ? (linkBatch[1].Results[0] as ProfessionalJurisdictionEntity | undefined)
        : undefined;

      const conflict = proLoaded
        ? ConflictScreeningService.ScreenCandidate(pro, requestParties, activeMatterParties)
        : { HasConflict: true, Status: 'Unavailable' as const, Reasons: ['Profile not found.'] };

      const standingOk =
        jurisdictionLink != null &&
        (jurisdictionLink.StandingStatus === 'GoodStanding' || jurisdictionLink.StandingStatus === 'ProHacVice');
      const profileOk =
        proLoaded &&
        pro.IsActive &&
        pro.VerificationStatus === 'Verified' &&
        (pro.AvailabilityStatus === 'Available' || pro.AvailabilityStatus === 'Limited') &&
        pro.ActiveReferralCount < pro.MaxConcurrentReferrals &&
        (!request.RequiresProBono || pro.AcceptsProBono);

      if (!profileOk || !practiceLink || !standingOk || conflict.HasConflict) {
        if (conflict.HasConflict && conflict.Status === 'ConflictFound') {
          candidateAssignment.Status = 'ConflictRejected';
          candidateAssignment.ConflictStatus = 'ConflictFound';
          candidateAssignment.ConflictReason = conflict.Reasons.join('; ');
        } else {
          candidateAssignment.Status = 'Withdrawn';
          candidateAssignment.ResponseNotes = 'Withdrawn during cascade revalidation.';
        }
        await saveOrThrow(candidateAssignment, 'Revalidation-disqualified ReferralAssignment');
        continue;
      }

      const now = new Date();
      candidateAssignment.Status = 'Offered';
      candidateAssignment.OfferedAt = now;
      candidateAssignment.SLADeadlineAt = CapacityReadinessService.ComputeSLADeadline(now, tier, request.UrgencyLevel);
      await saveOrThrow(candidateAssignment, 'Promoted ReferralAssignment');

      request.Status = 'Routed';
      request.CurrentCascadeStep = candidateAssignment.CascadeOrder;
      await saveOrThrow(request, 'Updated ReferralRequest CascadeStep');

      return candidateAssignment;
    }

    request.Status = 'Exhausted';
    await saveOrThrow(request, 'Exhausted ReferralRequest');
    await SlaEscalationService.RaiseEscalation(
      {
        ReferralRequestID: validRequestId,
        TriggerType: 'CascadeExhausted',
        EscalationLevel: 2,
        RecommendedAction: 'ExpandPracticeArea',
        Notes: 'Cascade exhausted: no further eligible queued candidates after revalidation.',
        DedupKey: `CascadeExhausted:${validRequestId}`,
      },
      contextUser,
      resolveTransactionalProvider(provider),
    );
    return null;
  }

  /**
   * Sweeps all Offered assignments whose SLADeadlineAt has passed using batched RunViews
   * (zero N+1 queries), marks them Expired within a transaction, and cascades each parent
   * ReferralRequest to the next eligible Queued professional.
   */
  public static async SweepExpiredSLAs(
    asOfDate: Date,
    contextUser: UserInfo,
    provider?: IMetadataProvider & IRunViewProvider,
  ): Promise<SweepResult> {
    const startMs = Date.now();
    const txProvider = resolveTransactionalProvider(provider);
    const rv = new RunView(txProvider);

    const isoNow = asOfDate.toISOString();
    const expiredRes = await rv.RunView<ReferralAssignmentEntity>(
      {
        EntityName: 'MJ_BizApps_Referrals: Referral Assignments',
        ExtraFilter: `Status = 'Offered' AND SLADeadlineAt < '${isoNow}'`,
        ResultType: 'entity_object',
      },
      contextUser,
    );
    if (!expiredRes || !expiredRes.Success) {
      throw new PersistenceError(
        `Failed querying expired SLA assignments: ${expiredRes?.ErrorMessage ?? 'Unknown error'}.`,
      );
    }

    const expiredList = expiredRes.Results;
    if (expiredList.length === 0) {
      return {
        ScannedCount: 0,
        ExpiredCount: 0,
        CascadedCount: 0,
        ExhaustedCount: 0,
        ProcessedAssignmentIDs: [],
      };
    }

    // Batch-load all parent ReferralRequests in a single RunView instead of N+1 Load() calls
    const uniqueReqIds = Array.from(
      new Set(expiredList.map((a) => AssertValidUUID(a.ReferralRequestID, 'ReferralRequestID'))),
    );
    const reqFilter = `ID IN (${uniqueReqIds.map((id) => `'${id}'`).join(',')})`;
    const reqBatch = await rv.RunView<ReferralRequestEntity>(
      {
        EntityName: 'MJ_BizApps_Referrals: Referral Requests',
        ExtraFilter: reqFilter,
        ResultType: 'entity_object',
      },
      contextUser,
    );
    if (!reqBatch.Success) {
      throw new PersistenceError(
        `Failed batch-loading parent ReferralRequests: ${reqBatch.ErrorMessage ?? 'Unknown error'}.`,
      );
    }

    const requestById = new Map<string, ReferralRequestEntity>();
    for (const r of reqBatch.Results) {
      requestById.set(r.ID.toLowerCase(), r);
    }

    const processedIds: string[] = [];
    let cascadedCount = 0;
    let exhaustedCount = 0;

    for (const assignment of expiredList) {
      await withEntityTransaction(txProvider, async (md) => {
        if (hasSqlSupport(txProvider)) {
          const isPostgres = txProvider.PlatformKey === 'postgresql';
          const claimSql = isPostgres
            ? `UPDATE __mj_BizAppsReferrals."ReferralAssignment"
               SET "Status" = 'Expired', "RespondedAt" = $1
               WHERE "ID" = $2 AND "Status" = 'Offered' AND "SLADeadlineAt" < $1
               RETURNING "ID"`
            : `UPDATE [__mj_BizAppsReferrals].[ReferralAssignment]
               SET [Status] = N'Expired', [RespondedAt] = @p0
               OUTPUT INSERTED.[ID]
               WHERE [ID] = @p1 AND [Status] = N'Offered' AND [SLADeadlineAt] < @p0`;
          const claimed = await txProvider.ExecuteSQL<{ ID: string }>(
            claimSql,
            [asOfDate, assignment.ID],
            undefined,
            contextUser,
          );
          if (claimed.length !== 1) {
            return;
          }
        } else {
          if (assignment.Status !== 'Offered') {
            return;
          }
          assignment.Status = 'Expired';
          assignment.RespondedAt = asOfDate;
          await saveOrThrow(assignment, 'Expired ReferralAssignment');
        }
        processedIds.push(assignment.ID);
        await SlaEscalationService.RaiseEscalation(
          {
            ReferralRequestID: assignment.ReferralRequestID,
            ReferralAssignmentID: assignment.ID,
            TriggerType: 'SLABreach',
            EscalationLevel: 1,
            RecommendedAction: 'AdvanceCascade',
            Notes: `SLA deadline breached at ${asOfDate.toISOString()} for assignment offered to professional; cascading to next candidate.`,
            DedupKey: `SLABreach:${assignment.ID}`,
          },
          contextUser,
          md,
        );

        let request = requestById.get(assignment.ReferralRequestID.toLowerCase());
        if (!request) {
          const loadedReq = await md.GetEntityObject<ReferralRequestEntity>(
            'MJ_BizApps_Referrals: Referral Requests',
            contextUser,
          );
          if (await loadedReq.Load(AssertValidUUID(assignment.ReferralRequestID, 'ReferralRequestID'))) {
            request = loadedReq;
          }
        }
        if (request) {
          const nextOffer = await CascadeRoutingService.AdvanceCascade(request, contextUser, txProvider);
          if (nextOffer) {
            cascadedCount++;
          } else {
            exhaustedCount++;
          }
        }
      });
    }

    ReferralTelemetry.RecordOperation({
      Operation: 'SweepExpiredReferralSLAs',
      ElapsedMs: Date.now() - startMs,
      UserID: contextUser.ID,
      Metrics: {
        scannedCount: expiredList.length,
        expiredCount: processedIds.length,
        cascadedCount,
        exhaustedCount,
      },
    });

    return {
      ScannedCount: expiredList.length,
      ExpiredCount: processedIds.length,
      CascadedCount: cascadedCount,
      ExhaustedCount: exhaustedCount,
      ProcessedAssignmentIDs: processedIds,
    };
  }

  /**
   * Transitions an `Accepted` ReferralAssignment (and its parent ReferralRequest) to
   * `InProgress`. Authorization: assigned professional (`ProfessionalProfile.UserID`)
   * or Association Admin. Idempotent when already `InProgress` (zero additional writes).
   */
  public static async MarkInProgress(
    referralAssignmentId: string,
    contextUser: UserInfo,
    provider?: IMetadataProvider & IRunViewProvider,
  ): Promise<{
    ReferralAssignmentID: string;
    ReferralRequestID: string;
    AssignmentStatus: ReferralAssignmentEntity['Status'];
    RequestStatus: ReferralRequestStatus;
  }> {
    const validAssignmentId = AssertValidUUID(referralAssignmentId, 'ReferralAssignmentID');
    const txProvider = resolveTransactionalProvider(provider);

    return withEntityTransaction(txProvider, async (md) => {
      const assignment = await md.GetEntityObject<ReferralAssignmentEntity>(
        'MJ_BizApps_Referrals: Referral Assignments',
        contextUser,
      );
      if (!(await assignment.Load(validAssignmentId))) {
        throw new PersistenceError(`ReferralAssignment '${validAssignmentId}' not found.`);
      }

      const pro = await md.GetEntityObject<ProfessionalProfileEntity>(
        'MJ_BizApps_Referrals: Professional Profiles',
        contextUser,
      );
      if (!(await pro.Load(AssertValidUUID(assignment.ProfessionalProfileID, 'ProfessionalProfileID')))) {
        throw new PersistenceError(`ProfessionalProfile '${assignment.ProfessionalProfileID}' not found.`);
      }

      if (!UUIDsEqual(pro.UserID, contextUser.ID) && !IsAssociationAdmin(contextUser)) {
        throw new AuthorizationError(
          `User '${contextUser.ID}' is not authorized to mark assignment '${validAssignmentId}' in progress for professional '${pro.ID}'.`,
        );
      }

      const request = await md.GetEntityObject<ReferralRequestEntity>(
        'MJ_BizApps_Referrals: Referral Requests',
        contextUser,
      );
      if (!(await request.Load(AssertValidUUID(assignment.ReferralRequestID, 'ReferralRequestID')))) {
        throw new PersistenceError(`ReferralRequest '${assignment.ReferralRequestID}' not found.`);
      }

      // Idempotent: already InProgress -> zero additional writes
      if (assignment.Status === 'InProgress') {
        return {
          ReferralAssignmentID: assignment.ID,
          ReferralRequestID: request.ID,
          AssignmentStatus: assignment.Status,
          RequestStatus: request.Status,
        };
      }

      if (assignment.Status !== 'Accepted') {
        throw new InvalidLifecycleStateError(
          `Cannot mark ReferralAssignment '${validAssignmentId}' in progress from status '${assignment.Status}' (expected 'Accepted').`,
        );
      }

      assignment.Status = 'InProgress';
      await saveOrThrow(assignment, 'InProgress ReferralAssignment');

      if (request.Status === 'Accepted') {
        request.Status = 'InProgress';
        await saveOrThrow(request, 'InProgress ReferralRequest');
      }

      return {
        ReferralAssignmentID: assignment.ID,
        ReferralRequestID: request.ID,
        AssignmentStatus: assignment.Status,
        RequestStatus: request.Status,
      };
    });
  }

  /**
   * Transactionally completes a referral: creates a `ReferralOutcome`, marks the
   * `ReferralAssignment` and parent `ReferralRequest` `Completed`, decrements
   * `ProfessionalProfile.ActiveReferralCount` (never below 0), increments
   * `TotalCompletedCount`, and recomputes the 90-day rolling `AverageResponseHours`.
   * Authorization: assigned professional or Association Admin, checked before any
   * writes. Idempotent when already `Completed` (zero additional writes).
   */
  public static async CompleteReferral(
    params: {
      ReferralAssignmentID: string;
      OutcomeStatus?: ReferralOutcomeEntity['OutcomeStatus'];
      CompletionNotes?: string;
      FeeAmount?: number | null;
    },
    contextUser: UserInfo,
    provider?: IMetadataProvider & IRunViewProvider,
  ): Promise<{
    ReferralAssignmentID: string;
    ReferralRequestID: string;
    ReferralOutcomeID: string;
    AssignmentStatus: ReferralAssignmentEntity['Status'];
    RequestStatus: ReferralRequestStatus;
  }> {
    const validAssignmentId = AssertValidUUID(params.ReferralAssignmentID, 'ReferralAssignmentID');
    const txProvider = resolveTransactionalProvider(provider);

    return withEntityTransaction(txProvider, async (md, compensation) => {
      const assignment = await md.GetEntityObject<ReferralAssignmentEntity>(
        'MJ_BizApps_Referrals: Referral Assignments',
        contextUser,
      );
      if (!(await assignment.Load(validAssignmentId))) {
        throw new PersistenceError(`ReferralAssignment '${validAssignmentId}' not found.`);
      }

      const pro = await md.GetEntityObject<ProfessionalProfileEntity>(
        'MJ_BizApps_Referrals: Professional Profiles',
        contextUser,
      );
      if (!(await pro.Load(AssertValidUUID(assignment.ProfessionalProfileID, 'ProfessionalProfileID')))) {
        throw new PersistenceError(`ProfessionalProfile '${assignment.ProfessionalProfileID}' not found.`);
      }

      if (!UUIDsEqual(pro.UserID, contextUser.ID) && !IsAssociationAdmin(contextUser)) {
        throw new AuthorizationError(
          `User '${contextUser.ID}' is not authorized to complete assignment '${validAssignmentId}' for professional '${pro.ID}'.`,
        );
      }

      const request = await md.GetEntityObject<ReferralRequestEntity>(
        'MJ_BizApps_Referrals: Referral Requests',
        contextUser,
      );
      if (!(await request.Load(AssertValidUUID(assignment.ReferralRequestID, 'ReferralRequestID')))) {
        throw new PersistenceError(`ReferralRequest '${assignment.ReferralRequestID}' not found.`);
      }

      // Not idempotent: a second completion attempt is a caller bug (double-report), not a
      // no-op - fail loudly with zero writes rather than silently re-returning stale state.
      if (assignment.Status !== 'Accepted' && assignment.Status !== 'InProgress') {
        throw new InvalidLifecycleStateError(
          `Cannot complete ReferralAssignment '${validAssignmentId}' from status '${assignment.Status}' (expected 'Accepted' or 'InProgress').`,
        );
      }

      const now = new Date();
      const responseHours =
        assignment.ResponseHours ??
        (assignment.OfferedAt != null
          ? roundTo2((now.getTime() - new Date(assignment.OfferedAt).getTime()) / (60 * 60 * 1000))
          : null);

      // Save the ReferralOutcome FIRST: if any later step fails, compensation deletes this
      // row so a partially-completed referral never leaves behind an orphaned outcome record.
      const outcome = await md.GetEntityObject<ReferralOutcomeEntity>(
        'MJ_BizApps_Referrals: Referral Outcomes',
        contextUser,
      );
      outcome.ReferralRequestID = request.ID;
      outcome.ReferralAssignmentID = assignment.ID;
      outcome.ProfessionalProfileID = pro.ID;
      outcome.OutcomeStatus = params.OutcomeStatus ?? 'Resolved';
      if (responseHours != null) {
        outcome.ResponseHours = responseHours;
      }
      if (params.CompletionNotes) {
        outcome.CompletionNotes = params.CompletionNotes;
      }
      if (params.FeeAmount != null) {
        outcome.FeeAmount = params.FeeAmount;
      }
      outcome.CompletedAt = now;
      await saveOrThrow(outcome, 'ReferralOutcome');
      compensation?.registerCompensation(async () => {
        await outcome.Delete();
      });

      const previousAssignmentStatus = assignment.Status;
      assignment.Status = 'Completed';
      assignment.CompletedAt = now;
      if (responseHours != null) {
        assignment.ResponseHours = responseHours;
      }
      await saveOrThrow(assignment, 'Completed ReferralAssignment');
      compensation?.registerCompensation(async () => {
        assignment.Status = previousAssignmentStatus;
        assignment.CompletedAt = null;
        await assignment.Save();
      });

      await atomicDecrementProCapacityOnCompletion(txProvider, pro, contextUser);

      if (hasSqlSupport(txProvider)) {
        const newAverage = await recompute90DayAverageResponseHours(
          txProvider as TransactionalProvider & IRunViewProvider,
          pro.ID,
          contextUser,
        );
        if (newAverage != null) {
          pro.AverageResponseHours = newAverage;
          await saveOrThrow(pro, 'ProfessionalProfile AverageResponseHours update');
        }
      }

      request.Status = 'Completed';
      request.CompletedAt = now;
      await saveOrThrow(request, 'Completed ReferralRequest');

      return {
        ReferralAssignmentID: assignment.ID,
        ReferralRequestID: request.ID,
        ReferralOutcomeID: outcome.ID,
        AssignmentStatus: assignment.Status,
        RequestStatus: request.Status,
      };
    });
  }

  /**
   * Admin-only recovery for an `Exhausted` referral: re-runs matching excluding every
   * professional previously assigned to this request (regardless of outcome), optionally
   * expanding the search to the parent `PracticeArea`, and offers the first eligible,
   * conflict-cleared candidate found. Auto-resolves any open `CascadeExhausted`
   * escalation. Returns `{Reopened: false}` with unchanged state when no candidates exist.
   */
  public static async ReopenExhaustedRequest(
    referralRequestId: string,
    contextUser: UserInfo,
    options: { ExpandToAncestorPracticeArea?: boolean } = {},
    provider?: IMetadataProvider & IRunViewProvider,
  ): Promise<{
    Reopened: boolean;
    Status: ReferralRequestStatus;
    ActiveAssignmentID: string | null;
    ActiveProfessionalID: string | null;
    SLADeadlineAt: string | null;
  }> {
    if (!IsAssociationAdmin(contextUser)) {
      throw new AuthorizationError(
        `User '${contextUser.ID}' is not authorized to reopen an exhausted referral (Association Admin required).`,
      );
    }

    const validRequestId = AssertValidUUID(referralRequestId, 'ReferralRequestID');
    const txProvider = resolveTransactionalProvider(provider);
    const rv = new RunView(txProvider);

    return withEntityTransaction(txProvider, async (md) => {
      const request = await md.GetEntityObject<ReferralRequestEntity>('MJ_BizApps_Referrals: Referral Requests', contextUser);
      if (!(await request.Load(validRequestId))) {
        throw new PersistenceError(`ReferralRequest '${validRequestId}' not found.`);
      }
      if (request.Status !== 'Exhausted') {
        throw new InvalidLifecycleStateError(
          `Cannot reopen ReferralRequest '${validRequestId}' from status '${request.Status}' (expected 'Exhausted').`,
        );
      }

      const tier = await md.GetEntityObject<ReferralTierEntity>('MJ_BizApps_Referrals: Referral Tiers', contextUser);
      if (!(await tier.Load(AssertValidUUID(request.ReferralTierID, 'ReferralTierID')))) {
        throw new PersistenceError(`ReferralTier '${request.ReferralTierID}' not found.`);
      }

      const allAssignmentsRes = await rv.RunView<ReferralAssignmentEntity>(
        {
          EntityName: 'MJ_BizApps_Referrals: Referral Assignments',
          ExtraFilter: `ReferralRequestID = '${validRequestId}'`,
          ResultType: 'entity_object',
        },
        contextUser,
      );
      if (!allAssignmentsRes.Success) {
        throw new PersistenceError(`Failed loading existing assignments for '${validRequestId}'.`);
      }
      const previouslyAssignedIds = new Set(allAssignmentsRes.Results.map((a) => a.ProfessionalProfileID.toLowerCase()));
      const maxCascadeOrder = allAssignmentsRes.Results.reduce((max, a) => Math.max(max, a.CascadeOrder), 0);

      let practiceAreaId = AssertValidUUID(request.PracticeAreaID, 'PracticeAreaID');
      if (options.ExpandToAncestorPracticeArea) {
        const pa = await md.GetEntityObject<PracticeAreaEntity>('MJ_BizApps_Referrals: Practice Areas', contextUser);
        if ((await pa.Load(practiceAreaId)) && pa.ParentID) {
          practiceAreaId = AssertValidUUID(pa.ParentID, 'ParentPracticeAreaID');
        }
      }

      const candidates = await MatchingEngine.FindMatches(
        {
          PracticeAreaID: practiceAreaId,
          JurisdictionID: request.JurisdictionID,
          RequiresProBono: request.RequiresProBono,
          PreferredLanguage: request.PreferredLanguage,
          SLAResponseHours: tier.SLAResponseHours,
          MaxResults: tier.MaxCascadeAttempts * 2,
        },
        contextUser,
        txProvider,
        validRequestId,
      );

      const eligible = candidates.find(
        (c) => c.Eligible && c.ConflictStatus === 'Cleared' && !previouslyAssignedIds.has(c.ProfessionalProfileID.toLowerCase()),
      );
      if (!eligible) {
        return {
          Reopened: false,
          Status: request.Status,
          ActiveAssignmentID: null,
          ActiveProfessionalID: null,
          SLADeadlineAt: null,
        };
      }

      const now = new Date();
      const slaDeadline = CapacityReadinessService.ComputeSLADeadline(now, tier, request.UrgencyLevel);

      const assignment = await md.GetEntityObject<ReferralAssignmentEntity>('MJ_BizApps_Referrals: Referral Assignments', contextUser);
      assignment.ReferralRequestID = validRequestId;
      assignment.ProfessionalProfileID = eligible.ProfessionalProfileID;
      assignment.CascadeOrder = maxCascadeOrder + 1;
      assignment.MatchScore = eligible.Score;
      assignment.ScoreBreakdownJSON = JSON.stringify(eligible.Breakdown);
      assignment.ConflictStatus = 'Cleared';
      assignment.Status = 'Offered';
      assignment.OfferedAt = now;
      assignment.SLADeadlineAt = slaDeadline;
      await saveOrThrow(assignment, 'Reopened ReferralAssignment');

      request.Status = 'Routed';
      request.CurrentCascadeStep = assignment.CascadeOrder;
      await saveOrThrow(request, 'Reopened ReferralRequest');

      const openEscalationRes = await rv.RunView<ReferralEscalationEntity>(
        {
          EntityName: 'MJ_BizApps_Referrals: Referral Escalations',
          ExtraFilter: `ReferralRequestID = '${validRequestId}' AND (Status = 'Open' OR Status = 'Acknowledged') AND TriggerType = 'CascadeExhausted'`,
          ResultType: 'entity_object',
        },
        contextUser,
      );
      if (openEscalationRes.Success) {
        for (const esc of openEscalationRes.Results) {
          await SlaEscalationService.ResolveEscalation(
            esc.ID,
            contextUser,
            txProvider,
            'Auto-resolved: referral reopened with a new candidate.',
          );
        }
      }

      return {
        Reopened: true,
        Status: 'Routed',
        ActiveAssignmentID: assignment.ID,
        ActiveProfessionalID: assignment.ProfessionalProfileID,
        SLADeadlineAt: slaDeadline.toISOString(),
      };
    });
  }
}
