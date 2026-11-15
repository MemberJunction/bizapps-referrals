import { ActionResultSimple, RunActionParams } from '@memberjunction/actions-base';
import { BaseAction } from '@memberjunction/actions';
import {
  BaseRemotableOperation,
  IMetadataProvider,
  IRunViewProvider,
  Metadata,
  RemoteOperationError,
  RemoteOpServerContext,
  UserInfo,
} from '@memberjunction/core';
import { RegisterClass } from '@memberjunction/global';
import {
  AssertValidUUID,
  CascadeRoutingService,
  InvalidUUIDError,
  ReferralTelemetry,
  SlaEscalationService,
} from '@mj-biz-apps/referrals-core';

export interface EvaluateEscalationsInput {
  AsOfIso?: string;
  NotifierKey?: string;
}

export interface AcknowledgeEscalationInput {
  ReferralEscalationID: string;
  Notes?: string;
}

export interface ResolveEscalationInput {
  ReferralEscalationID: string;
  Notes?: string;
}

export interface DismissEscalationInput {
  ReferralEscalationID: string;
  Notes?: string;
}

export interface ReopenExhaustedReferralInput {
  ReferralRequestID: string;
  ExpandToAncestorPracticeArea?: boolean;
}

function resolveProvider(
  provider: IMetadataProvider,
  context?: RemoteOpServerContext,
): (IMetadataProvider & IRunViewProvider) | undefined {
  const candidate = context?.provider ?? provider ?? Metadata.Provider;
  if (candidate && 'RunView' in candidate && 'GetEntityObject' in candidate) {
    return candidate as IMetadataProvider & IRunViewProvider;
  }
  return undefined;
}

function resolveActionProvider(): (IMetadataProvider & IRunViewProvider) | undefined {
  const candidate = Metadata.Provider;
  if (candidate && 'RunView' in candidate && 'GetEntityObject' in candidate) {
    return candidate as IMetadataProvider & IRunViewProvider;
  }
  return undefined;
}

function requireProvider(provider: (IMetadataProvider & IRunViewProvider) | undefined): IMetadataProvider & IRunViewProvider {
  if (!provider) {
    throw new RemoteOperationError('NO_PROVIDER', 'No metadata provider is available to execute this operation.');
  }
  return provider;
}

function getStringParam(params: RunActionParams, name: string): string | undefined {
  const found = params.Params.find((p) => p.Name === name);
  return typeof found?.Value === 'string' && found.Value.trim() ? found.Value.trim() : undefined;
}

function getBooleanParam(params: RunActionParams, name: string): boolean | undefined {
  const found = params.Params.find((p) => p.Name === name);
  if (typeof found?.Value === 'boolean') return found.Value;
  if (typeof found?.Value === 'string') return found.Value.toLowerCase() === 'true';
  return undefined;
}

function recordTelemetry(operation: string, startMs: number, contextUser: UserInfo, metrics: Record<string, string | number | boolean>): void {
  ReferralTelemetry.RecordOperation({
    Operation: operation,
    ElapsedMs: Date.now() - startMs,
    UserID: contextUser.ID,
    Metrics: metrics,
  });
}

// =============================================================================
// 1. EvaluateEscalations (BaseRemotableOperation + BaseAction)
// =============================================================================
@RegisterClass(BaseRemotableOperation, 'Referrals.EvaluateEscalations')
export class EvaluateEscalationsOperation extends BaseRemotableOperation<
  EvaluateEscalationsInput,
  { WarningsRaised: number; UrgentRaised: number; Skipped: number }
> {
  public readonly OperationKey = 'Referrals.EvaluateEscalations';
  public readonly ExposeAsAgentTool = true;
  public readonly ExposeAsMCPTool = true;
  public readonly ToolDescription =
    'Evaluates all Offered assignments and Urgent requests for SLA-warning and urgent-unassigned escalation conditions.';

  protected override async InternalExecute(
    input: EvaluateEscalationsInput,
    provider: IMetadataProvider,
    user: UserInfo,
    context: RemoteOpServerContext,
  ): Promise<{ WarningsRaised: number; UrgentRaised: number; Skipped: number }> {
    const startMs = Date.now();
    const asOf = input?.AsOfIso ? new Date(input.AsOfIso) : new Date();
    const result = await SlaEscalationService.EvaluateEscalations(
      asOf,
      user,
      requireProvider(resolveProvider(provider, context)),
      input?.NotifierKey ?? 'None',
    );
    recordTelemetry('EvaluateEscalations', startMs, user, {
      warningsRaised: result.WarningsRaised,
      urgentRaised: result.UrgentRaised,
      skipped: result.Skipped,
    });
    return result;
  }
}

@RegisterClass(BaseAction, 'Referrals.EvaluateEscalations')
export class EvaluateEscalationsAction extends BaseAction {
  protected override async InternalRunAction(params: RunActionParams): Promise<ActionResultSimple> {
    const startMs = Date.now();
    const asOfIso = getStringParam(params, 'AsOfIso');
    const asOf = asOfIso ? new Date(asOfIso) : new Date();
    try {
      const result = await SlaEscalationService.EvaluateEscalations(
        asOf,
        params.ContextUser,
        requireProvider(resolveActionProvider()),
        getStringParam(params, 'NotifierKey') ?? 'None',
      );
      recordTelemetry('EvaluateEscalations', startMs, params.ContextUser, {
        warningsRaised: result.WarningsRaised,
        urgentRaised: result.UrgentRaised,
        skipped: result.Skipped,
      });
      return { Success: true, ResultCode: 'SUCCESS', Message: JSON.stringify(result) };
    } catch (error) {
      return {
        Success: false,
        ResultCode: error instanceof Error ? error.name : 'EVALUATE_ESCALATIONS_ERROR',
        Message: error instanceof Error ? error.message : String(error),
      };
    }
  }
}

// =============================================================================
// 2. AcknowledgeEscalation (BaseRemotableOperation + BaseAction)
// =============================================================================
@RegisterClass(BaseRemotableOperation, 'Referrals.AcknowledgeEscalation')
export class AcknowledgeEscalationOperation extends BaseRemotableOperation<
  AcknowledgeEscalationInput,
  { ReferralEscalationID: string; Status: string }
> {
  public readonly OperationKey = 'Referrals.AcknowledgeEscalation';
  public readonly ExposeAsAgentTool = true;
  public readonly ExposeAsMCPTool = true;
  public readonly ToolDescription = 'Coordinator/admin acknowledgement of an Open referral escalation.';

  protected override async InternalExecute(
    input: AcknowledgeEscalationInput,
    provider: IMetadataProvider,
    user: UserInfo,
    context: RemoteOpServerContext,
  ): Promise<{ ReferralEscalationID: string; Status: string }> {
    const startMs = Date.now();
    if (!input.ReferralEscalationID) {
      throw new RemoteOperationError('INVALID_INPUT', 'ReferralEscalationID is required.');
    }
    const result = await SlaEscalationService.AcknowledgeEscalation(
      AssertValidUUID(input.ReferralEscalationID, 'ReferralEscalationID'),
      user,
      requireProvider(resolveProvider(provider, context)),
      input.Notes,
    );
    recordTelemetry('AcknowledgeEscalation', startMs, user, { referralEscalationId: result.ReferralEscalationID });
    return { ReferralEscalationID: result.ReferralEscalationID, Status: result.Status };
  }
}

@RegisterClass(BaseAction, 'Referrals.AcknowledgeEscalation')
export class AcknowledgeEscalationAction extends BaseAction {
  protected override async InternalRunAction(params: RunActionParams): Promise<ActionResultSimple> {
    const startMs = Date.now();
    const referralEscalationId = getStringParam(params, 'ReferralEscalationID');
    if (!referralEscalationId) {
      return { Success: false, ResultCode: 'INVALID_PARAMETERS', Message: 'ReferralEscalationID is required.' };
    }
    try {
      const validId = AssertValidUUID(referralEscalationId, 'ReferralEscalationID');
      const result = await SlaEscalationService.AcknowledgeEscalation(
        validId,
        params.ContextUser,
        requireProvider(resolveActionProvider()),
        getStringParam(params, 'Notes'),
      );
      recordTelemetry('AcknowledgeEscalation', startMs, params.ContextUser, { referralEscalationId: result.ReferralEscalationID });
      return { Success: true, ResultCode: 'SUCCESS', Message: JSON.stringify(result) };
    } catch (error) {
      if (error instanceof InvalidUUIDError) {
        return { Success: false, ResultCode: 'INVALID_PARAMETERS', Message: error.message };
      }
      return {
        Success: false,
        ResultCode: error instanceof Error ? error.name : 'ACKNOWLEDGE_ESCALATION_ERROR',
        Message: error instanceof Error ? error.message : String(error),
      };
    }
  }
}

// =============================================================================
// 3. ResolveEscalation (BaseRemotableOperation + BaseAction)
// =============================================================================
@RegisterClass(BaseRemotableOperation, 'Referrals.ResolveEscalation')
export class ResolveEscalationOperation extends BaseRemotableOperation<
  ResolveEscalationInput,
  { ReferralEscalationID: string; Status: string; RequestEscalationLevelReset: boolean }
> {
  public readonly OperationKey = 'Referrals.ResolveEscalation';
  public readonly ExposeAsAgentTool = true;
  public readonly ExposeAsMCPTool = true;
  public readonly ToolDescription = 'Coordinator/admin resolution of an Open or Acknowledged referral escalation.';

  protected override async InternalExecute(
    input: ResolveEscalationInput,
    provider: IMetadataProvider,
    user: UserInfo,
    context: RemoteOpServerContext,
  ): Promise<{ ReferralEscalationID: string; Status: string; RequestEscalationLevelReset: boolean }> {
    const startMs = Date.now();
    if (!input.ReferralEscalationID) {
      throw new RemoteOperationError('INVALID_INPUT', 'ReferralEscalationID is required.');
    }
    const result = await SlaEscalationService.ResolveEscalation(
      AssertValidUUID(input.ReferralEscalationID, 'ReferralEscalationID'),
      user,
      requireProvider(resolveProvider(provider, context)),
      input.Notes,
    );
    recordTelemetry('ResolveEscalation', startMs, user, { referralEscalationId: result.ReferralEscalationID });
    return result;
  }
}

@RegisterClass(BaseAction, 'Referrals.ResolveEscalation')
export class ResolveEscalationAction extends BaseAction {
  protected override async InternalRunAction(params: RunActionParams): Promise<ActionResultSimple> {
    const startMs = Date.now();
    const referralEscalationId = getStringParam(params, 'ReferralEscalationID');
    if (!referralEscalationId) {
      return { Success: false, ResultCode: 'INVALID_PARAMETERS', Message: 'ReferralEscalationID is required.' };
    }
    try {
      const validId = AssertValidUUID(referralEscalationId, 'ReferralEscalationID');
      const result = await SlaEscalationService.ResolveEscalation(
        validId,
        params.ContextUser,
        requireProvider(resolveActionProvider()),
        getStringParam(params, 'Notes'),
      );
      recordTelemetry('ResolveEscalation', startMs, params.ContextUser, { referralEscalationId: result.ReferralEscalationID });
      return { Success: true, ResultCode: 'SUCCESS', Message: JSON.stringify(result) };
    } catch (error) {
      if (error instanceof InvalidUUIDError) {
        return { Success: false, ResultCode: 'INVALID_PARAMETERS', Message: error.message };
      }
      return {
        Success: false,
        ResultCode: error instanceof Error ? error.name : 'RESOLVE_ESCALATION_ERROR',
        Message: error instanceof Error ? error.message : String(error),
      };
    }
  }
}

// =============================================================================
// 4. DismissEscalation (BaseRemotableOperation + BaseAction)
// =============================================================================
@RegisterClass(BaseRemotableOperation, 'Referrals.DismissEscalation')
export class DismissEscalationOperation extends BaseRemotableOperation<
  DismissEscalationInput,
  { ReferralEscalationID: string; Status: string; RequestEscalationLevelReset: boolean }
> {
  public readonly OperationKey = 'Referrals.DismissEscalation';
  public readonly ExposeAsAgentTool = true;
  public readonly ExposeAsMCPTool = true;
  public readonly ToolDescription = 'Coordinator/admin dismissal of an Open or Acknowledged referral escalation (no action required).';

  protected override async InternalExecute(
    input: DismissEscalationInput,
    provider: IMetadataProvider,
    user: UserInfo,
    context: RemoteOpServerContext,
  ): Promise<{ ReferralEscalationID: string; Status: string; RequestEscalationLevelReset: boolean }> {
    const startMs = Date.now();
    if (!input.ReferralEscalationID) {
      throw new RemoteOperationError('INVALID_INPUT', 'ReferralEscalationID is required.');
    }
    const result = await SlaEscalationService.DismissEscalation(
      AssertValidUUID(input.ReferralEscalationID, 'ReferralEscalationID'),
      user,
      requireProvider(resolveProvider(provider, context)),
      input.Notes,
    );
    recordTelemetry('DismissEscalation', startMs, user, { referralEscalationId: result.ReferralEscalationID });
    return result;
  }
}

@RegisterClass(BaseAction, 'Referrals.DismissEscalation')
export class DismissEscalationAction extends BaseAction {
  protected override async InternalRunAction(params: RunActionParams): Promise<ActionResultSimple> {
    const startMs = Date.now();
    const referralEscalationId = getStringParam(params, 'ReferralEscalationID');
    if (!referralEscalationId) {
      return { Success: false, ResultCode: 'INVALID_PARAMETERS', Message: 'ReferralEscalationID is required.' };
    }
    try {
      const validId = AssertValidUUID(referralEscalationId, 'ReferralEscalationID');
      const result = await SlaEscalationService.DismissEscalation(
        validId,
        params.ContextUser,
        requireProvider(resolveActionProvider()),
        getStringParam(params, 'Notes'),
      );
      recordTelemetry('DismissEscalation', startMs, params.ContextUser, { referralEscalationId: result.ReferralEscalationID });
      return { Success: true, ResultCode: 'SUCCESS', Message: JSON.stringify(result) };
    } catch (error) {
      if (error instanceof InvalidUUIDError) {
        return { Success: false, ResultCode: 'INVALID_PARAMETERS', Message: error.message };
      }
      return {
        Success: false,
        ResultCode: error instanceof Error ? error.name : 'DISMISS_ESCALATION_ERROR',
        Message: error instanceof Error ? error.message : String(error),
      };
    }
  }
}

// =============================================================================
// 5. ReopenExhaustedReferral (BaseRemotableOperation + BaseAction)
// =============================================================================
@RegisterClass(BaseRemotableOperation, 'Referrals.ReopenExhaustedReferral')
export class ReopenExhaustedReferralOperation extends BaseRemotableOperation<
  ReopenExhaustedReferralInput,
  { Reopened: boolean; Status: string; ActiveAssignmentID: string | null; ActiveProfessionalID: string | null; SLADeadlineAt: string | null }
> {
  public readonly OperationKey = 'Referrals.ReopenExhaustedReferral';
  public readonly ExposeAsAgentTool = true;
  public readonly ExposeAsMCPTool = true;
  public readonly ToolDescription =
    'Admin-only reopen of an Exhausted referral: re-runs matching excluding previously assigned professionals, optionally expanding to the parent PracticeArea.';

  protected override async InternalExecute(
    input: ReopenExhaustedReferralInput,
    provider: IMetadataProvider,
    user: UserInfo,
    context: RemoteOpServerContext,
  ) {
    const startMs = Date.now();
    if (!input.ReferralRequestID) {
      throw new RemoteOperationError('INVALID_INPUT', 'ReferralRequestID is required.');
    }
    const result = await CascadeRoutingService.ReopenExhaustedRequest(
      AssertValidUUID(input.ReferralRequestID, 'ReferralRequestID'),
      user,
      { ExpandToAncestorPracticeArea: input.ExpandToAncestorPracticeArea },
      resolveProvider(provider, context),
    );
    recordTelemetry('ReopenExhaustedReferral', startMs, user, { reopened: result.Reopened });
    return result;
  }
}

@RegisterClass(BaseAction, 'Referrals.ReopenExhaustedReferral')
export class ReopenExhaustedReferralAction extends BaseAction {
  protected override async InternalRunAction(params: RunActionParams): Promise<ActionResultSimple> {
    const startMs = Date.now();
    const referralRequestId = getStringParam(params, 'ReferralRequestID');
    if (!referralRequestId) {
      return { Success: false, ResultCode: 'INVALID_PARAMETERS', Message: 'ReferralRequestID is required.' };
    }
    try {
      const validId = AssertValidUUID(referralRequestId, 'ReferralRequestID');
      const result = await CascadeRoutingService.ReopenExhaustedRequest(
        validId,
        params.ContextUser,
        { ExpandToAncestorPracticeArea: getBooleanParam(params, 'ExpandToAncestorPracticeArea') },
        resolveActionProvider(),
      );
      recordTelemetry('ReopenExhaustedReferral', startMs, params.ContextUser, { reopened: result.Reopened });
      return { Success: true, ResultCode: 'SUCCESS', Message: JSON.stringify(result) };
    } catch (error) {
      if (error instanceof InvalidUUIDError) {
        return { Success: false, ResultCode: 'INVALID_PARAMETERS', Message: error.message };
      }
      return {
        Success: false,
        ResultCode: error instanceof Error ? error.name : 'REOPEN_EXHAUSTED_REFERRAL_ERROR',
        Message: error instanceof Error ? error.message : String(error),
      };
    }
  }
}

export function LoadReferralsEscalationActions(): void {
  // Ensures module side-effect class registrations are preserved by bundlers.
}
