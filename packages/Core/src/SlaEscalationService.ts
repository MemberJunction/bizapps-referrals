import { IMetadataProvider, IRunViewProvider, RunView, UserInfo } from '@memberjunction/core';
import { MJGlobal, RegisterClass } from '@memberjunction/global';
import {
  ReferralAssignmentEntity,
  ReferralEscalationEntity,
  ReferralRequestEntity,
  ReferralTierEntity,
} from '@mj-biz-apps/referrals-entities';
import { IsCoordinatorOrAdmin, ResolvePersonIdForUser } from './CredentialVerification.js';
import { CapacityReadinessService } from './CapacityReadinessService.js';
import { ReferralTelemetry } from './ReferralTelemetry.js';
import {
  AssertValidUUID,
  AuthorizationError,
  InvalidLifecycleStateError,
  PersistenceError,
} from './validation.js';

export interface EscalationEvaluationResult {
  WarningsRaised: number;
  UrgentRaised: number;
  Skipped: number;
}

export interface RaiseEscalationInput {
  ReferralRequestID: string;
  ReferralAssignmentID?: string | null;
  TriggerType: ReferralEscalationEntity['TriggerType'];
  EscalationLevel: number;
  RecommendedAction?: ReferralEscalationEntity['RecommendedAction'];
  Notes?: string | null;
  DedupKey: string;
}

export interface RaiseEscalationResult {
  Raised: boolean;
  ReferralEscalationID: string;
}

export interface EscalationTransitionResult {
  ReferralEscalationID: string;
  Status: ReferralEscalationEntity['Status'];
  RequestEscalationLevelReset: boolean;
}

export interface EscalationNotifyContext {
  request: ReferralRequestEntity;
  contextUser: UserInfo;
  provider?: IMetadataProvider & IRunViewProvider;
}

export interface EscalationNotifyResult {
  Success: boolean;
  Skipped?: boolean;
  LinkedTaskID?: string | null;
  Message?: string;
}

/**
 * Abstract base class for pluggable escalation notifiers.
 * Subclasses register with `@RegisterClass(BaseEscalationNotifier, '<NotifierKey>')`.
 */
export abstract class BaseEscalationNotifier {
  public abstract readonly NotifierKey: string;

  public abstract Notify(
    escalation: ReferralEscalationEntity,
    context: EscalationNotifyContext,
  ): Promise<EscalationNotifyResult>;
}

/**
 * No-op notifier: escalations are raised and persisted but no external
 * notification side-effect occurs. Always available.
 */
@RegisterClass(BaseEscalationNotifier, 'None')
export class NoneEscalationNotifier extends BaseEscalationNotifier {
  public readonly NotifierKey = 'None';

  public async Notify(): Promise<EscalationNotifyResult> {
    return { Success: true, Skipped: true, LinkedTaskID: null, Message: 'No-op notifier.' };
  }
}

interface TaskEntityShape {
  SchemaName: string;
  BaseTable: string;
  Fields?: ReadonlyArray<{ Name: string }>;
}

type SqlParamValue = string | number | boolean | Date | null | undefined;

interface SqlCapableProvider {
  ExecuteSQL<T = Record<string, SqlParamValue>>(
    sql: string,
    params?: SqlParamValue[],
    options?: { description?: string },
    user?: UserInfo,
  ): Promise<T[]>;
  PlatformKey?: string;
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
 * Optional runtime bridge to the BizApps Tasks `MJ_BizApps_Tasks: Tasks` entity when
 * installed in the host workspace. Discovers the entity and a usable TaskType purely
 * via `provider.Entities` metadata and raw parameterized SQL (never a static or
 * dynamic import of `@mj-biz-apps/tasks-*`, and never a strongly-typed subclass we
 * don't own). Fails soft (Skipped) when the Tasks app isn't installed, the entity
 * lacks a usable shape, or the provider doesn't support direct SQL execution.
 */
@RegisterClass(BaseEscalationNotifier, 'BizAppsTasks')
export class BizAppsTasksEscalationNotifier extends BaseEscalationNotifier {
  public readonly NotifierKey = 'BizAppsTasks';

  private findTaskEntity(provider?: IMetadataProvider): TaskEntityShape | null {
    const entities = provider?.Entities ?? [];
    const match = entities.find((e) => e.Name === 'MJ_BizApps_Tasks: Tasks');
    if (!match) {
      return null;
    }
    return { SchemaName: match.SchemaName, BaseTable: match.BaseTable, Fields: match.Fields };
  }

  private hasField(entity: TaskEntityShape, fieldName: string): boolean {
    return (entity.Fields ?? []).some((f) => f.Name === fieldName);
  }

  public override Notify(
    escalation: ReferralEscalationEntity,
    context: EscalationNotifyContext,
  ): Promise<EscalationNotifyResult> {
    return this.NotifyInternal(escalation, context);
  }

  private async NotifyInternal(
    escalation: ReferralEscalationEntity,
    context: EscalationNotifyContext,
  ): Promise<EscalationNotifyResult> {
    const dp = context.provider;
    const taskEntity = this.findTaskEntity(dp);
    if (!taskEntity || !dp) {
      return { Success: false, Skipped: true, LinkedTaskID: null, Message: 'BizApps Tasks package is not installed in this environment.' };
    }

    if (!hasSqlSupport(dp)) {
      return { Success: false, Skipped: true, LinkedTaskID: null, Message: 'Current provider does not support direct SQL execution for Task creation.' };
    }
    const sqlProvider = dp;

    if (!this.hasField(taskEntity, 'Name') || !this.hasField(taskEntity, 'TypeID')) {
      return { Success: false, Skipped: true, LinkedTaskID: null, Message: `Entity '${taskEntity.SchemaName}.${taskEntity.BaseTable}' lacks required Name/TypeID fields for safe bridging.` };
    }

    const rv = new RunView(dp);
    const typeRes = await rv.RunView<{ ID: string }>(
      { EntityName: 'MJ_BizApps_Tasks: Task Types', ResultType: 'simple', MaxRows: 1 },
      context.contextUser,
    );
    const taskTypeId = typeRes.Success && typeRes.Results.length > 0 ? typeRes.Results[0].ID : null;
    if (!taskTypeId) {
      return { Success: false, Skipped: true, LinkedTaskID: null, Message: 'No TaskType available to assign to the escalation Task.' };
    }

    const priority = escalation.EscalationLevel >= 2 ? 'Critical' : escalation.EscalationLevel === 1 ? 'High' : 'Medium';
    const dueAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const name = `Referral ${context.request.RequestNumber} escalation: ${escalation.TriggerType}`;
    const description = escalation.Notes ?? `Escalation Level ${escalation.EscalationLevel} (${escalation.TriggerType}) raised for ReferralRequest ${context.request.RequestNumber}.`;

    const isPostgres = sqlProvider.PlatformKey === 'postgresql';
    const schema = taskEntity.SchemaName;
    const table = taskEntity.BaseTable;
    const insertSql = isPostgres
      ? `INSERT INTO ${schema}."${table}" ("Name", "Description", "TypeID", "Status", "Priority", "DueAt") VALUES ($1, $2, $3, 'Open', $4, $5) RETURNING "ID"`
      : `INSERT INTO [${schema}].[${table}] ([Name], [Description], [TypeID], [Status], [Priority], [DueAt]) OUTPUT INSERTED.[ID] VALUES (@p0, @p1, @p2, N'Open', @p3, @p4)`;

    try {
      const rows = await sqlProvider.ExecuteSQL<{ ID: string }>(
        insertSql,
        [name, description, taskTypeId, priority, dueAt],
        { description: 'Create escalation notification Task (BizAppsTasksEscalationNotifier)' },
        context.contextUser,
      );
      const newTaskId = rows.length > 0 ? rows[0].ID : null;
      if (!newTaskId) {
        return { Success: false, LinkedTaskID: null, Message: 'Task INSERT returned no ID.' };
      }
      return { Success: true, LinkedTaskID: newTaskId, Message: `Created Task '${newTaskId}' for escalation.` };
    } catch (err) {
      return {
        Success: false,
        LinkedTaskID: null,
        Message: err instanceof Error ? err.message : String(err),
      };
    }
  }
}

function resolveNotifier(key: string): BaseEscalationNotifier {
  const reg = MJGlobal.Instance.ClassFactory.CreateInstance<BaseEscalationNotifier>(BaseEscalationNotifier, key);
  return reg ?? new NoneEscalationNotifier();
}

export class SlaEscalationService {
  /**
   * Evaluates the full referral population for two escalation conditions:
   * - SLA warning: an `Offered` assignment that has crossed its tier's
   *   `EscalationWarningPercent` threshold of its SLA window without a warning sent.
   * - Urgent unassigned: an `Urgent` request, not yet `Accepted`/`InProgress`/`Completed`,
   *   that has been open for 2x its effective (urgency-adjusted) SLA window.
   */
  public static async EvaluateEscalations(
    asOf: Date,
    contextUser: UserInfo,
    provider?: IMetadataProvider & IRunViewProvider,
    notifierKey: string = 'None',
  ): Promise<EscalationEvaluationResult> {
    const dp = provider;
    if (!dp) {
      throw new PersistenceError('A valid metadata provider is required to evaluate escalations.');
    }
    const rv = new RunView(dp);
    let warningsRaised = 0;
    let urgentRaised = 0;
    let skipped = 0;

    const [offeredRes, tiersRes] = await rv.RunViews(
      [
        {
          EntityName: 'MJ_BizApps_Referrals: Referral Assignments',
          ExtraFilter: "Status = 'Offered' AND SLAWarningSentAt IS NULL",
          ResultType: 'entity_object',
        },
        { EntityName: 'MJ_BizApps_Referrals: Referral Tiers', ResultType: 'entity_object' },
      ],
      contextUser,
    );

    if (offeredRes.Success && tiersRes.Success) {
      const tiersById = new Map<string, ReferralTierEntity>();
      for (const t of tiersRes.Results as ReferralTierEntity[]) {
        tiersById.set(t.ID.toLowerCase(), t);
      }

      const offeredAssignments = offeredRes.Results as ReferralAssignmentEntity[];
      if (offeredAssignments.length > 0) {
        const reqIds = Array.from(new Set(offeredAssignments.map((a) => AssertValidUUID(a.ReferralRequestID, 'ReferralRequestID'))));
        const reqRes = await rv.RunView<ReferralRequestEntity>(
          {
            EntityName: 'MJ_BizApps_Referrals: Referral Requests',
            ExtraFilter: `ID IN (${reqIds.map((id) => `'${id}'`).join(',')})`,
            ResultType: 'entity_object',
          },
          contextUser,
        );
        const requestsById = new Map<string, ReferralRequestEntity>();
        if (reqRes.Success) {
          for (const r of reqRes.Results) {
            requestsById.set(r.ID.toLowerCase(), r);
          }
        }

        for (const assignment of offeredAssignments) {
          const request = requestsById.get(assignment.ReferralRequestID.toLowerCase());
          const tier = request ? tiersById.get(request.ReferralTierID.toLowerCase()) : undefined;
          if (!request || !tier || assignment.OfferedAt == null || assignment.SLADeadlineAt == null) {
            skipped++;
            continue;
          }
          const offeredMs = new Date(assignment.OfferedAt).getTime();
          const deadlineMs = new Date(assignment.SLADeadlineAt).getTime();
          const warningThresholdMs = offeredMs + (deadlineMs - offeredMs) * (tier.EscalationWarningPercent / 100);

          if (asOf.getTime() >= warningThresholdMs) {
            // CR-27: raise the escalation BEFORE stamping SLAWarningSentAt, so a failed
            // RaiseEscalation (e.g. a transient DedupKey conflict) never leaves the
            // assignment marked as warned without a corresponding escalation row.
            try {
              const warningResult = await SlaEscalationService.RaiseEscalation(
                {
                  ReferralRequestID: request.ID,
                  ReferralAssignmentID: assignment.ID,
                  TriggerType: 'SLAWarning',
                  EscalationLevel: 1,
                  RecommendedAction: 'ExtendSLA',
                  Notes: `SLA warning threshold (${tier.EscalationWarningPercent}%) crossed for assignment offered to professional on ${new Date(assignment.OfferedAt).toISOString()}.`,
                  DedupKey: `SLAWarning:${assignment.ID}`,
                },
                contextUser,
                dp,
                notifierKey,
              );
              if (warningResult.Raised) {
                warningsRaised++;
              }
              assignment.SLAWarningSentAt = asOf;
              const saved = await assignment.Save();
              if (!saved) {
                throw new PersistenceError(`Failed to stamp SLAWarningSentAt on ReferralAssignment '${assignment.ID}'.`);
              }
            } catch {
              skipped++;
            }
          } else {
            skipped++;
          }
        }
      }
    }

    const urgentRes = await rv.RunView<ReferralRequestEntity>(
      {
        EntityName: 'MJ_BizApps_Referrals: Referral Requests',
        ExtraFilter: "UrgencyLevel = 'Urgent' AND Status NOT IN ('Accepted', 'InProgress', 'Completed')",
        ResultType: 'entity_object',
      },
      contextUser,
    );
    if (urgentRes.Success && urgentRes.Results.length > 0) {
      const tierIds = Array.from(new Set(urgentRes.Results.map((r) => AssertValidUUID(r.ReferralTierID, 'ReferralTierID'))));
      const tierRes2 = await rv.RunView<ReferralTierEntity>(
        {
          EntityName: 'MJ_BizApps_Referrals: Referral Tiers',
          ExtraFilter: `ID IN (${tierIds.map((id) => `'${id}'`).join(',')})`,
          ResultType: 'entity_object',
        },
        contextUser,
      );
      const urgentTiersById = new Map<string, ReferralTierEntity>();
      if (tierRes2.Success) {
        for (const t of tierRes2.Results) {
          urgentTiersById.set(t.ID.toLowerCase(), t);
        }
      }

      for (const request of urgentRes.Results) {
        const tier = urgentTiersById.get(request.ReferralTierID.toLowerCase());
        if (!tier || !request.SubmittedAt) {
          skipped++;
          continue;
        }
        const submittedAt = new Date(request.SubmittedAt);
        const effectiveDeadline = CapacityReadinessService.ComputeSLADeadline(submittedAt, tier, 'Urgent');
        const effectiveSlaHours = (effectiveDeadline.getTime() - submittedAt.getTime()) / (60 * 60 * 1000);
        const doubleDeadlineMs = submittedAt.getTime() + 2 * (effectiveDeadline.getTime() - submittedAt.getTime());
        const elapsedHours = (asOf.getTime() - submittedAt.getTime()) / (60 * 60 * 1000);
        if (asOf.getTime() >= doubleDeadlineMs) {
          try {
            const urgentResult = await SlaEscalationService.RaiseEscalation(
              {
                ReferralRequestID: request.ID,
                TriggerType: 'UrgentUnassigned',
                EscalationLevel: 2,
                RecommendedAction: 'ReassignNextCandidate',
                Notes: `Urgent referral unassigned ${elapsedHours.toFixed(1)}h after submission (2x effective SLA of ${effectiveSlaHours.toFixed(1)}h).`,
                DedupKey: `UrgentUnassigned:${request.ID}`,
              },
              contextUser,
              dp,
              notifierKey,
            );
            if (urgentResult.Raised) {
              urgentRaised++;
            }
          } catch {
            skipped++;
          }
        } else {
          skipped++;
        }
      }
    }

    return { WarningsRaised: warningsRaised, UrgentRaised: urgentRaised, Skipped: skipped };
  }

  /**
   * Idempotent (by `DedupKey`) creation of a `ReferralEscalation`. Caps the level at the
   * parent tier's `MaxEscalationLevel`, updates the parent request's `EscalationLevel`
   * (max across open escalations) and `LastEscalatedAt`, then invokes the configured
   * notifier *after* persistence; a notifier failure is logged and never rolls back
   * the escalation itself.
   */
  public static async RaiseEscalation(
    input: RaiseEscalationInput,
    contextUser: UserInfo,
    provider: IMetadataProvider & IRunViewProvider,
    notifierKey: string = 'None',
  ): Promise<RaiseEscalationResult> {
    const validRequestId = AssertValidUUID(input.ReferralRequestID, 'ReferralRequestID');
    const rv = new RunView(provider);

    // Dedup across ALL existing rows for this DedupKey (any status) - once an escalation has
    // been raised (even if later Acknowledged/Resolved/Dismissed), it must never be re-raised.
    const existingRes = await rv.RunView<ReferralEscalationEntity>(
      {
        EntityName: 'MJ_BizApps_Referrals: Referral Escalations',
        ExtraFilter: `DedupKey = '${input.DedupKey.replace(/'/g, "''")}'`,
        ResultType: 'entity_object',
      },
      contextUser,
    );
    if (!existingRes.Success) {
      // Fail closed: if we cannot reliably determine whether this DedupKey has already
      // fired, do not raise a (possibly duplicate) escalation.
      throw new PersistenceError(`Failed to query existing ReferralEscalation rows for DedupKey '${input.DedupKey}'; refusing to raise a possibly-duplicate escalation.`);
    }
    if (existingRes.Results.length > 0) {
      return { Raised: false, ReferralEscalationID: existingRes.Results[0].ID };
    }

    const request = await provider.GetEntityObject<ReferralRequestEntity>('MJ_BizApps_Referrals: Referral Requests', contextUser);
    if (!(await request.Load(validRequestId))) {
      throw new PersistenceError(`ReferralRequest '${validRequestId}' not found.`);
    }
    const tier = await provider.GetEntityObject<ReferralTierEntity>('MJ_BizApps_Referrals: Referral Tiers', contextUser);
    if (!(await tier.Load(AssertValidUUID(request.ReferralTierID, 'ReferralTierID')))) {
      throw new PersistenceError(`ReferralTier '${request.ReferralTierID}' not found.`);
    }
    const cappedLevel = Math.min(input.EscalationLevel, tier.MaxEscalationLevel);

    const escalation = await provider.GetEntityObject<ReferralEscalationEntity>('MJ_BizApps_Referrals: Referral Escalations', contextUser);
    escalation.ReferralRequestID = validRequestId;
    escalation.ReferralAssignmentID = input.ReferralAssignmentID ?? null;
    escalation.EscalationLevel = cappedLevel;
    escalation.TriggerType = input.TriggerType;
    escalation.Status = 'Open';
    escalation.RecommendedAction = input.RecommendedAction ?? 'ExtendSLA';
    escalation.Notes = input.Notes ?? null;
    escalation.RaisedAt = new Date();
    escalation.DedupKey = input.DedupKey;
    escalation.NotifierKey = notifierKey;
    let escalationSaved: boolean;
    try {
      escalationSaved = await escalation.Save();
    } catch (err) {
      // CR-13: a concurrent caller may have raced us and inserted the same DedupKey
      // between our existence check and this Save(), tripping the UNIQUE constraint.
      // Re-query by DedupKey and return the winner's row idempotently instead of
      // propagating a spurious failure for what is, from the caller's perspective, a
      // successful (already-raised) outcome.
      const conflictRes = await rv.RunView<ReferralEscalationEntity>(
        {
          EntityName: 'MJ_BizApps_Referrals: Referral Escalations',
          ExtraFilter: `DedupKey = '${input.DedupKey.replace(/'/g, "''")}'`,
          ResultType: 'entity_object',
        },
        contextUser,
      );
      if (conflictRes.Success && conflictRes.Results.length > 0) {
        return { Raised: false, ReferralEscalationID: conflictRes.Results[0].ID };
      }
      throw err;
    }
    if (!escalationSaved) {
      const conflictRes = await rv.RunView<ReferralEscalationEntity>(
        {
          EntityName: 'MJ_BizApps_Referrals: Referral Escalations',
          ExtraFilter: `DedupKey = '${input.DedupKey.replace(/'/g, "''")}'`,
          ResultType: 'entity_object',
        },
        contextUser,
      );
      if (conflictRes.Success && conflictRes.Results.length > 0) {
        return { Raised: false, ReferralEscalationID: conflictRes.Results[0].ID };
      }
      throw new PersistenceError(`Failed to save ReferralEscalation for ReferralRequest '${validRequestId}'.`);
    }

    // CR-14: recompute the request's EscalationLevel as the max across BOTH Open and
    // Acknowledged escalations (an Acknowledged escalation must still hold the level up).
    const openLevelsRes = await rv.RunView<ReferralEscalationEntity>(
      {
        EntityName: 'MJ_BizApps_Referrals: Referral Escalations',
        ExtraFilter: `ReferralRequestID = '${validRequestId}' AND (Status = 'Open' OR Status = 'Acknowledged')`,
        ResultType: 'entity_object',
      },
      contextUser,
    );
    const maxOpenLevel = openLevelsRes.Success
      ? openLevelsRes.Results.reduce((max, e) => Math.max(max, e.EscalationLevel), 0)
      : cappedLevel;

    request.EscalationLevel = maxOpenLevel;
    request.LastEscalatedAt = new Date();
    const requestSaved = await request.Save();
    if (!requestSaved) {
      throw new PersistenceError(`Failed to update ReferralRequest.EscalationLevel for '${validRequestId}'.`);
    }

    try {
      const notifier = resolveNotifier(notifierKey);
      const notifyResult = await notifier.Notify(escalation, { request, contextUser, provider });
      if (notifyResult.Success && notifyResult.LinkedTaskID) {
        escalation.LinkedTaskID = notifyResult.LinkedTaskID;
        await escalation.Save();
      }
      if (!notifyResult.Success && !notifyResult.Skipped) {
        ReferralTelemetry.RecordOperation({
          Operation: 'EscalationNotifyFailed',
          ElapsedMs: 0,
          UserID: contextUser.ID,
          Metrics: { notifierKey, message: notifyResult.Message ?? 'Unknown notifier failure' },
        });
      }
    } catch (err) {
      ReferralTelemetry.RecordOperation({
        Operation: 'EscalationNotifyFailed',
        ElapsedMs: 0,
        UserID: contextUser.ID,
        Metrics: { notifierKey, message: err instanceof Error ? err.message : String(err) },
      });
    }

    return { Raised: true, ReferralEscalationID: escalation.ID };
  }

  private static async transitionEscalation(
    referralEscalationId: string,
    nextStatus: 'Acknowledged' | 'Resolved' | 'Dismissed',
    notes: string | undefined,
    contextUser: UserInfo,
    provider: IMetadataProvider & IRunViewProvider,
  ): Promise<EscalationTransitionResult> {
    if (!IsCoordinatorOrAdmin(contextUser)) {
      throw new AuthorizationError(`User '${contextUser.ID}' is not authorized to ${nextStatus.toLowerCase()} escalations (coordinator or admin required).`);
    }

    const validId = AssertValidUUID(referralEscalationId, 'ReferralEscalationID');
    const escalation = await provider.GetEntityObject<ReferralEscalationEntity>('MJ_BizApps_Referrals: Referral Escalations', contextUser);
    if (!(await escalation.Load(validId))) {
      throw new PersistenceError(`ReferralEscalation '${validId}' not found.`);
    }

    const allowedFrom: Record<typeof nextStatus, ReadonlyArray<ReferralEscalationEntity['Status']>> = {
      Acknowledged: ['Open'],
      Resolved: ['Open', 'Acknowledged'],
      Dismissed: ['Open', 'Acknowledged'],
    };
    if (!allowedFrom[nextStatus].includes(escalation.Status)) {
      throw new InvalidLifecycleStateError(
        `Cannot transition ReferralEscalation '${validId}' from '${escalation.Status}' to '${nextStatus}'.`,
      );
    }

    const now = new Date();
    const personId = await ResolvePersonIdForUser(contextUser, provider);
    if (nextStatus === 'Acknowledged') {
      escalation.Status = 'Acknowledged';
      escalation.AcknowledgedAt = now;
      if (personId) {
        escalation.AcknowledgedByPersonID = personId;
      }
    } else {
      escalation.Status = nextStatus;
      escalation.ResolvedAt = now;
      if (personId) {
        escalation.ResolvedByPersonID = personId;
      }
    }
    if (notes) {
      escalation.ResolutionNotes = notes;
    }
    const saved = await escalation.Save();
    if (!saved) {
      throw new PersistenceError(`Failed to save ReferralEscalation '${validId}' transition to '${nextStatus}'.`);
    }

    let requestEscalationLevelReset = false;
    {
      const rv = new RunView(provider);
      // CR-14: recompute ReferralRequest.EscalationLevel as the max level across whatever
      // Open/Acknowledged escalations remain for this request (0 when none remain) on
      // EVERY transition (Acknowledge/Resolve/Dismiss), not only Resolved/Dismissed - an
      // Acknowledged escalation at a higher level must still hold the request's
      // EscalationLevel up, and the level must stay consistent even when Acknowledging.
      const remainingActiveRes = await rv.RunView<ReferralEscalationEntity>(
        {
          EntityName: 'MJ_BizApps_Referrals: Referral Escalations',
          ExtraFilter: `ReferralRequestID = '${escalation.ReferralRequestID}' AND (Status = 'Open' OR Status = 'Acknowledged')`,
          ResultType: 'entity_object',
        },
        contextUser,
      );
      if (remainingActiveRes.Success) {
        const recomputedLevel = remainingActiveRes.Results.reduce((max, e) => Math.max(max, e.EscalationLevel), 0);
        const request = await provider.GetEntityObject<ReferralRequestEntity>('MJ_BizApps_Referrals: Referral Requests', contextUser);
        if (await request.Load(escalation.ReferralRequestID)) {
          request.EscalationLevel = recomputedLevel;
          const reqSaved = await request.Save();
          if (!reqSaved) {
            throw new PersistenceError(`Failed to recompute ReferralRequest.EscalationLevel for '${escalation.ReferralRequestID}'.`);
          }
          requestEscalationLevelReset = recomputedLevel === 0;
        }
      }
    }

    return { ReferralEscalationID: escalation.ID, Status: escalation.Status, RequestEscalationLevelReset: requestEscalationLevelReset };
  }

  public static async AcknowledgeEscalation(
    referralEscalationId: string,
    contextUser: UserInfo,
    provider: IMetadataProvider & IRunViewProvider,
    notes?: string,
  ): Promise<EscalationTransitionResult> {
    return SlaEscalationService.transitionEscalation(referralEscalationId, 'Acknowledged', notes, contextUser, provider);
  }

  public static async ResolveEscalation(
    referralEscalationId: string,
    contextUser: UserInfo,
    provider: IMetadataProvider & IRunViewProvider,
    notes?: string,
  ): Promise<EscalationTransitionResult> {
    return SlaEscalationService.transitionEscalation(referralEscalationId, 'Resolved', notes, contextUser, provider);
  }

  public static async DismissEscalation(
    referralEscalationId: string,
    contextUser: UserInfo,
    provider: IMetadataProvider & IRunViewProvider,
    notes?: string,
  ): Promise<EscalationTransitionResult> {
    return SlaEscalationService.transitionEscalation(referralEscalationId, 'Dismissed', notes, contextUser, provider);
  }
}
