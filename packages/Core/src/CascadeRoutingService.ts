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
  ProfessionalJurisdictionEntity,
  ProfessionalPracticeAreaEntity,
  ProfessionalProfileEntity,
  ReferralAssignmentEntity,
  ReferralRequestEntity,
  ReferralTierEntity,
} from '@mj-biz-apps/referrals-entities';
import { ActiveMatterPartyRecord, ConflictScreeningService, NormalizePartyName } from './ConflictScreeningService.js';
import { MatchingEngine } from './MatchingEngine.js';
import { ReferralTelemetry } from './ReferralTelemetry.js';
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
  PersistenceError,
  UUIDsEqual,
} from './validation.js';

interface EntityTransactionHandle {
  Commit(): Promise<void>;
  Rollback(): Promise<void>;
}

type TransactionalProvider = IMetadataProvider &
  IRunViewProvider & {
    BeginEntityTransaction(): Promise<EntityTransactionHandle>;
  };

interface SqlCapableProvider {
  ExecuteSQL<T = Record<string, unknown>>(
    sql: string,
    params?: unknown[],
    options?: unknown,
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

const ADMIN_ROLE_NAMES = new Set([
  'administrator',
  'referrals admin',
  'association admin',
  'sysadmin',
]);

function hasTransactionSupport(provider: unknown): provider is TransactionalProvider {
  return (
    typeof provider === 'object' &&
    provider !== null &&
    'BeginEntityTransaction' in provider &&
    typeof (provider as TransactionalProvider).BeginEntityTransaction === 'function'
  );
}

function hasSqlSupport(provider: unknown): provider is SqlCapableProvider {
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
  if (!hasTransactionSupport(candidate)) {
    throw new PersistenceError(
      'A transaction-capable provider (BeginEntityTransaction) is required for referral state mutations.',
    );
  }
  return candidate;
}

async function withEntityTransaction<T>(
  provider: TransactionalProvider,
  fn: (txProvider: TransactionalProvider) => Promise<T>,
): Promise<T> {
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

async function atomicClaimAssignmentOffer(
  provider: TransactionalProvider,
  assignment: ReferralAssignmentEntity,
  nextStatus: ReferralAssignmentEntity['Status'],
  respondedAt: Date,
  notes: string | null,
  contextUser: UserInfo,
): Promise<void> {
  if (hasSqlSupport(provider)) {
    const isPostgres = provider.PlatformKey === 'postgresql';
    const sql = isPostgres
      ? `UPDATE __mj_BizAppsReferrals."ReferralAssignment"
         SET "Status" = $1, "RespondedAt" = $2, "ResponseNotes" = COALESCE($3, "ResponseNotes")
         WHERE "ID" = $4 AND "Status" = 'Offered'
         RETURNING "ID"`
      : `UPDATE [__mj_BizAppsReferrals].[ReferralAssignment]
         SET [Status] = @p0, [RespondedAt] = @p1, [ResponseNotes] = COALESCE(@p2, [ResponseNotes])
         OUTPUT INSERTED.[ID]
         WHERE [ID] = @p3 AND [Status] = N'Offered'`;
    const rows = await provider.ExecuteSQL<{ ID: string }>(
      sql,
      [nextStatus, respondedAt, notes, assignment.ID],
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
  await saveOrThrow(assignment, `${nextStatus} ReferralAssignment`);
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

async function saveOrThrow(entity: BaseEntity, label: string): Promise<void> {
  const saved = await entity.Save();
  if (!saved) {
    const detail = entity.LatestResult?.CompleteMessage ?? 'Save returned false';
    throw new PersistenceError(`Failed to save ${label}: ${detail}`);
  }
}

export function IsAssociationAdmin(contextUser: UserInfo): boolean {
  const roles = contextUser.UserRoles ?? [];
  return roles.some((r) => ADMIN_ROLE_NAMES.has((r.Role ?? '').trim().toLowerCase()));
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

    const created = await withEntityTransaction(txProvider, async (tx) => {
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

      let conflictRejectedCount = 0;
      const eligibleCandidates = [];
      for (const c of candidates) {
        if (existingByPro.has(c.ProfessionalProfileID.toLowerCase())) {
          continue;
        }
        if (c.ConflictStatus === 'ConflictFound' || c.ConflictStatus === 'Unavailable') {
          conflictRejectedCount++;
          const rejected = await md.GetEntityObject<ReferralAssignmentEntity>(
            'MJ_BizApps_Referrals: Referral Assignments',
            contextUser,
          );
          rejected.ReferralRequestID = validRequestId;
          rejected.ProfessionalProfileID = c.ProfessionalProfileID;
          rejected.CascadeOrder = eligibleCandidates.length + conflictRejectedCount;
          rejected.MatchScore = c.Score;
          rejected.ScoreBreakdownJSON = JSON.stringify(c.Breakdown);
          rejected.ConflictStatus = c.ConflictStatus === 'ConflictFound' ? 'ConflictFound' : 'Pending';
          rejected.ConflictReason = c.ConflictReasons.join('; ');
          rejected.Status = 'ConflictRejected';
          await saveOrThrow(rejected, 'ConflictRejected ReferralAssignment');
          continue;
        }
        if (c.Eligible && eligibleCandidates.length < tier.MaxCascadeAttempts) {
          eligibleCandidates.push(c);
        }
      }

      if (eligibleCandidates.length === 0) {
        request.Status = 'Exhausted';
        await saveOrThrow(request, 'Exhausted ReferralRequest');

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
      const slaDeadline = new Date(now.getTime() + tier.SLAResponseHours * 60 * 60 * 1000);
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

        await atomicClaimAssignmentOffer(
          txProvider,
          assignment,
          'Accepted',
          now,
          params.Notes ?? null,
          contextUser,
        );
        await atomicIncrementProCapacity(txProvider, pro, contextUser);

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

      await atomicClaimAssignmentOffer(
        txProvider,
        assignment,
        nextStatus,
        now,
        params.Notes ?? null,
        contextUser,
      );

      if (params.Action === 'ConflictReject') {
        assignment.Status = 'ConflictRejected';
        assignment.ConflictStatus = 'ConflictFound';
        assignment.ConflictReason = params.DeclineReason ?? params.Notes ?? 'Self-reported conflict of interest.';
        await saveOrThrow(assignment, 'ConflictRejected ReferralAssignment metadata');
      } else {
        assignment.Status = 'Declined';
        assignment.DeclineReason = params.DeclineReason ?? 'Declined by professional.';
        await saveOrThrow(assignment, 'Declined ReferralAssignment metadata');
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
    const slaHours = tier.SLAResponseHours > 0 ? tier.SLAResponseHours : 24;

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
      candidateAssignment.SLADeadlineAt = new Date(now.getTime() + slaHours * 60 * 60 * 1000);
      await saveOrThrow(candidateAssignment, 'Promoted ReferralAssignment');

      request.Status = 'Routed';
      request.CurrentCascadeStep = candidateAssignment.CascadeOrder;
      await saveOrThrow(request, 'Updated ReferralRequest CascadeStep');

      return candidateAssignment;
    }

    request.Status = 'Exhausted';
    await saveOrThrow(request, 'Exhausted ReferralRequest');
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
    if (!expiredRes.Success) {
      throw new PersistenceError(
        `Failed querying expired SLA assignments: ${expiredRes.ErrorMessage ?? 'Unknown error'}.`,
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
}
