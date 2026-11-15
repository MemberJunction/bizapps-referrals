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
  ExplainMatchInput,
  ExplainMatchOperationBase,
  ExplainMatchOutput,
  InvalidUUIDError,
  ReferralTelemetry,
  RecommendEscalationInput,
  RecommendEscalationOperationBase,
  RecommendEscalationOutput,
} from '@mj-biz-apps/referrals-core';
import { ReferralAIRationaleService } from './ai/ReferralAIRationaleService.js';

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
// 1. ExplainMatch (BaseRemotableOperation + BaseAction)
// =============================================================================
@RegisterClass(BaseRemotableOperation, 'Referrals.ExplainMatch')
export class ExplainMatchOperation extends ExplainMatchOperationBase {
  protected override async InternalExecute(
    input: ExplainMatchInput,
    provider: IMetadataProvider,
    user: UserInfo,
    context: RemoteOpServerContext,
  ): Promise<ExplainMatchOutput> {
    const startMs = Date.now();
    if (!input.ReferralRequestID) {
      throw new RemoteOperationError('INVALID_INPUT', 'ReferralRequestID is required.');
    }
    const result = await ReferralAIRationaleService.ExplainMatch(input.ReferralRequestID, user, resolveProvider(provider, context));
    recordTelemetry('ExplainMatch', startMs, user, { referralRequestId: input.ReferralRequestID, processedCount: result.ProcessedCount });
    return result;
  }
}

@RegisterClass(BaseAction, 'Referrals.ExplainMatch')
export class ExplainMatchAction extends BaseAction {
  protected override async InternalRunAction(params: RunActionParams): Promise<ActionResultSimple> {
    const startMs = Date.now();
    const referralRequestId = getStringParam(params, 'ReferralRequestID');
    if (!referralRequestId) {
      return { Success: false, ResultCode: 'INVALID_PARAMETERS', Message: 'ReferralRequestID is required.' };
    }
    try {
      const result = await ReferralAIRationaleService.ExplainMatch(referralRequestId, params.ContextUser, resolveActionProvider());
      recordTelemetry('ExplainMatch', startMs, params.ContextUser, { referralRequestId, processedCount: result.ProcessedCount });
      return { Success: true, ResultCode: 'SUCCESS', Message: JSON.stringify(result) };
    } catch (error) {
      if (error instanceof InvalidUUIDError) {
        return { Success: false, ResultCode: 'INVALID_PARAMETERS', Message: error.message };
      }
      return {
        Success: false,
        ResultCode: error instanceof Error ? error.name : 'EXPLAIN_MATCH_ERROR',
        Message: error instanceof Error ? error.message : String(error),
      };
    }
  }
}

// =============================================================================
// 2. RecommendEscalationAction (BaseRemotableOperation + BaseAction)
// =============================================================================
@RegisterClass(BaseRemotableOperation, 'Referrals.RecommendEscalationAction')
export class RecommendEscalationActionOperation extends RecommendEscalationOperationBase {
  protected override async InternalExecute(
    input: RecommendEscalationInput,
    provider: IMetadataProvider,
    user: UserInfo,
    context: RemoteOpServerContext,
  ): Promise<RecommendEscalationOutput> {
    const startMs = Date.now();
    if (!input.ReferralEscalationID) {
      throw new RemoteOperationError('INVALID_INPUT', 'ReferralEscalationID is required.');
    }
    const result = await ReferralAIRationaleService.RecommendEscalationAction(
      input.ReferralEscalationID,
      { Force: input.Force },
      user,
      resolveProvider(provider, context),
    );
    recordTelemetry('RecommendEscalationAction', startMs, user, { referralEscalationId: result.ReferralEscalationID, skipped: result.Skipped });
    return result;
  }
}

@RegisterClass(BaseAction, 'Referrals.RecommendEscalationAction')
export class RecommendEscalationActionAction extends BaseAction {
  protected override async InternalRunAction(params: RunActionParams): Promise<ActionResultSimple> {
    const startMs = Date.now();
    const referralEscalationId = getStringParam(params, 'ReferralEscalationID');
    if (!referralEscalationId) {
      return { Success: false, ResultCode: 'INVALID_PARAMETERS', Message: 'ReferralEscalationID is required.' };
    }
    try {
      const result = await ReferralAIRationaleService.RecommendEscalationAction(
        referralEscalationId,
        { Force: getBooleanParam(params, 'Force') },
        params.ContextUser,
        resolveActionProvider(),
      );
      recordTelemetry('RecommendEscalationAction', startMs, params.ContextUser, {
        referralEscalationId: result.ReferralEscalationID,
        skipped: result.Skipped,
      });
      return { Success: true, ResultCode: 'SUCCESS', Message: JSON.stringify(result) };
    } catch (error) {
      if (error instanceof InvalidUUIDError) {
        return { Success: false, ResultCode: 'INVALID_PARAMETERS', Message: error.message };
      }
      return {
        Success: false,
        ResultCode: error instanceof Error ? error.name : 'RECOMMEND_ESCALATION_ACTION_ERROR',
        Message: error instanceof Error ? error.message : String(error),
      };
    }
  }
}

export function LoadReferralsAIActions(): void {
  // Ensures module side-effect class registrations are preserved by bundlers.
}
