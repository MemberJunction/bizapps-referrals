import { ActionResultSimple, RunActionParams } from '@memberjunction/actions-base';
import { BaseAction } from '@memberjunction/actions';
import {
  BaseRemotableOperation,
  IMetadataProvider,
  IRunViewProvider,
  Metadata,
  RemoteOperationError,
  RemoteOpServerContext,
  RunView,
  UserInfo,
} from '@memberjunction/core';
import { RegisterClass } from '@memberjunction/global';
import {
  AssertValidUUID,
  CurrentUtcQuarter,
  InvalidUUIDError,
  PersistenceError,
  ReciprocityScorecard,
  ReciprocityScorecardData,
  ReciprocityScorecardService,
  ReferralTelemetry,
} from '@mj-biz-apps/referrals-core';
import { ReferralAssignmentEntity, ReferralOutcomeEntity, ReferralRequestEntity } from '@mj-biz-apps/referrals-entities';

export interface RecomputeReciprocityInput {
  PeriodStartIso?: string;
  PeriodEndIso?: string;
}

export interface GetReciprocityScorecardInput {
  ProfessionalProfileID: string;
  PeriodStartIso?: string;
  PeriodEndIso?: string;
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

function recordTelemetry(operation: string, startMs: number, contextUser: UserInfo, metrics: Record<string, string | number | boolean>): void {
  ReferralTelemetry.RecordOperation({
    Operation: operation,
    ElapsedMs: Date.now() - startMs,
    UserID: contextUser.ID,
    Metrics: metrics,
  });
}

async function loadScorecardData(
  provider: IMetadataProvider & IRunViewProvider,
  contextUser: UserInfo,
): Promise<ReciprocityScorecardData> {
  const rv = new RunView(provider);
  const [requestsRes, assignmentsRes, outcomesRes] = await rv.RunViews(
    [
      { EntityName: 'MJ_BizApps_Referrals: Referral Requests', ResultType: 'entity_object' },
      { EntityName: 'MJ_BizApps_Referrals: Referral Assignments', ResultType: 'entity_object' },
      { EntityName: 'MJ_BizApps_Referrals: Referral Outcomes', ResultType: 'entity_object' },
    ],
    contextUser,
  );
  if (!requestsRes.Success || !assignmentsRes.Success || !outcomesRes.Success) {
    throw new PersistenceError('Failed to batch-load reciprocity scorecard source data.');
  }
  return {
    requests: requestsRes.Results as ReferralRequestEntity[],
    assignments: assignmentsRes.Results as ReferralAssignmentEntity[],
    outcomes: outcomesRes.Results as ReferralOutcomeEntity[],
  };
}

function resolvePeriod(startIso?: string, endIso?: string): { Start: Date; End: Date } {
  if (startIso && endIso) {
    return { Start: new Date(startIso), End: new Date(endIso) };
  }
  return CurrentUtcQuarter();
}

// =============================================================================
// 1. RecomputeReciprocity (BaseRemotableOperation + BaseAction)
// =============================================================================
@RegisterClass(BaseRemotableOperation, 'Referrals.RecomputeReciprocity')
export class RecomputeReciprocityOperation extends BaseRemotableOperation<
  RecomputeReciprocityInput,
  { ProcessedCount: number; PeriodStart: string; PeriodEnd: string }
> {
  public readonly OperationKey = 'Referrals.RecomputeReciprocity';
  public readonly ExposeAsAgentTool = true;
  public readonly ExposeAsMCPTool = true;
  public readonly ToolDescription =
    'Recomputes and upserts ReciprocitySnapshot rows for every active professional over a period (defaults to the current UTC calendar quarter), and updates ProfessionalProfile readiness/reciprocity fields.';

  protected override async InternalExecute(
    input: RecomputeReciprocityInput,
    provider: IMetadataProvider,
    user: UserInfo,
    context: RemoteOpServerContext,
  ): Promise<{ ProcessedCount: number; PeriodStart: string; PeriodEnd: string }> {
    const startMs = Date.now();
    const period = input?.PeriodStartIso && input?.PeriodEndIso ? resolvePeriod(input.PeriodStartIso, input.PeriodEndIso) : undefined;
    const result = await ReciprocityScorecardService.RecomputeSnapshots(user, requireProvider(resolveProvider(provider, context)), period);
    recordTelemetry('RecomputeReciprocity', startMs, user, { processedCount: result.ProcessedCount });
    return {
      ProcessedCount: result.ProcessedCount,
      PeriodStart: result.Period.Start.toISOString(),
      PeriodEnd: result.Period.End.toISOString(),
    };
  }
}

@RegisterClass(BaseAction, 'Referrals.RecomputeReciprocity')
export class RecomputeReciprocityAction extends BaseAction {
  protected override async InternalRunAction(params: RunActionParams): Promise<ActionResultSimple> {
    const startMs = Date.now();
    try {
      const periodStartIso = getStringParam(params, 'PeriodStartIso');
      const periodEndIso = getStringParam(params, 'PeriodEndIso');
      const period = periodStartIso && periodEndIso ? resolvePeriod(periodStartIso, periodEndIso) : undefined;
      const result = await ReciprocityScorecardService.RecomputeSnapshots(
        params.ContextUser,
        requireProvider(resolveActionProvider()),
        period,
      );
      recordTelemetry('RecomputeReciprocity', startMs, params.ContextUser, { processedCount: result.ProcessedCount });
      return {
        Success: true,
        ResultCode: 'SUCCESS',
        Message: JSON.stringify({
          ProcessedCount: result.ProcessedCount,
          PeriodStart: result.Period.Start.toISOString(),
          PeriodEnd: result.Period.End.toISOString(),
        }),
      };
    } catch (error) {
      return {
        Success: false,
        ResultCode: error instanceof Error ? error.name : 'RECOMPUTE_RECIPROCITY_ERROR',
        Message: error instanceof Error ? error.message : String(error),
      };
    }
  }
}

// =============================================================================
// 2. GetReciprocityScorecard (BaseRemotableOperation + BaseAction)
// =============================================================================
@RegisterClass(BaseRemotableOperation, 'Referrals.GetReciprocityScorecard')
export class GetReciprocityScorecardOperation extends BaseRemotableOperation<
  GetReciprocityScorecardInput,
  ReciprocityScorecard
> {
  public readonly OperationKey = 'Referrals.GetReciprocityScorecard';
  public readonly ExposeAsAgentTool = true;
  public readonly ExposeAsMCPTool = true;
  public readonly ToolDescription =
    'Computes a live reciprocity scorecard (Sent/Received/Accepted/Resolved/SLABreachCount/AcceptanceRate/MedianResponseHours/ReciprocityIndex/AttributedFeeTotal) for a professional over a period.';

  protected override async InternalExecute(
    input: GetReciprocityScorecardInput,
    provider: IMetadataProvider,
    user: UserInfo,
    context: RemoteOpServerContext,
  ): Promise<ReciprocityScorecard> {
    if (!input.ProfessionalProfileID) {
      throw new RemoteOperationError('INVALID_INPUT', 'ProfessionalProfileID is required.');
    }
    const dp = requireProvider(resolveProvider(provider, context));
    const data = await loadScorecardData(dp, user);
    return ReciprocityScorecardService.ComputeScorecard(
      AssertValidUUID(input.ProfessionalProfileID, 'ProfessionalProfileID'),
      resolvePeriod(input.PeriodStartIso, input.PeriodEndIso),
      data,
    );
  }
}

@RegisterClass(BaseAction, 'Referrals.GetReciprocityScorecard')
export class GetReciprocityScorecardAction extends BaseAction {
  protected override async InternalRunAction(params: RunActionParams): Promise<ActionResultSimple> {
    const professionalProfileId = getStringParam(params, 'ProfessionalProfileID');
    if (!professionalProfileId) {
      return { Success: false, ResultCode: 'INVALID_PARAMETERS', Message: 'ProfessionalProfileID is required.' };
    }
    try {
      const validId = AssertValidUUID(professionalProfileId, 'ProfessionalProfileID');
      const dp = requireProvider(resolveActionProvider());
      const data = await loadScorecardData(dp, params.ContextUser);
      const period = resolvePeriod(getStringParam(params, 'PeriodStartIso'), getStringParam(params, 'PeriodEndIso'));
      const scorecard = ReciprocityScorecardService.ComputeScorecard(validId, period, data);
      return { Success: true, ResultCode: 'SUCCESS', Message: JSON.stringify(scorecard) };
    } catch (error) {
      if (error instanceof InvalidUUIDError) {
        return { Success: false, ResultCode: 'INVALID_PARAMETERS', Message: error.message };
      }
      return {
        Success: false,
        ResultCode: error instanceof Error ? error.name : 'GET_RECIPROCITY_SCORECARD_ERROR',
        Message: error instanceof Error ? error.message : String(error),
      };
    }
  }
}

export function LoadReferralsReciprocityActions(): void {
  // Ensures module side-effect class registrations are preserved by bundlers.
}
