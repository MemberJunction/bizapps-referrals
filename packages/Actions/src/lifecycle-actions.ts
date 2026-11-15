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
  CapacityReadinessService,
  CascadeRoutingService,
  OutcomeStatus,
} from '@mj-biz-apps/referrals-core';
import { ProfessionalAvailabilityWindowEntity } from '@mj-biz-apps/referrals-entities';

export interface MarkReferralInProgressInput {
  ReferralAssignmentID: string;
}

export interface MarkReferralInProgressOutput {
  ReferralAssignmentID: string;
  ReferralRequestID: string;
  AssignmentStatus: string;
  RequestStatus: string;
}

export interface CompleteReferralInput {
  ReferralAssignmentID: string;
  OutcomeStatus?: OutcomeStatus;
  CompletionNotes?: string;
}

export interface CompleteReferralOutput {
  ReferralAssignmentID: string;
  ReferralRequestID: string;
  ReferralOutcomeID: string;
  AssignmentStatus: string;
  RequestStatus: string;
}

export interface SetAvailabilityWindowInput {
  ProfessionalAvailabilityWindowID?: string;
  ProfessionalProfileID: string;
  WindowType: ProfessionalAvailabilityWindowEntity['WindowType'];
  DayOfWeek?: number | null;
  StartTimeMinutes?: number | null;
  EndTimeMinutes?: number | null;
  StartDate?: string | null;
  EndDate?: string | null;
  IsAvailable?: boolean;
  TimeZone?: string;
  Notes?: string | null;
}

export interface SetAvailabilityWindowOutput {
  ProfessionalAvailabilityWindowID: string;
  ProfessionalProfileID: string;
  WindowType: string;
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

function getNumberParam(params: RunActionParams, name: string): number | undefined {
  const found = params.Params.find((p) => p.Name === name);
  if (typeof found?.Value === 'number' && !Number.isNaN(found.Value)) return found.Value;
  if (typeof found?.Value === 'string' && found.Value.trim()) {
    const parsed = Number(found.Value);
    return Number.isNaN(parsed) ? undefined : parsed;
  }
  return undefined;
}

// =============================================================================
// 1. MarkReferralInProgress (BaseRemotableOperation + BaseAction)
// =============================================================================
@RegisterClass(BaseRemotableOperation, 'Referrals.MarkReferralInProgress')
export class MarkReferralInProgressOperation extends BaseRemotableOperation<
  MarkReferralInProgressInput,
  MarkReferralInProgressOutput
> {
  public readonly OperationKey = 'Referrals.MarkReferralInProgress';
  public readonly ExposeAsAgentTool = true;
  public readonly ExposeAsMCPTool = true;
  public readonly ToolDescription =
    'Transitions an accepted referral assignment (and its parent request) to InProgress.';

  protected override async InternalExecute(
    input: MarkReferralInProgressInput,
    provider: IMetadataProvider,
    user: UserInfo,
    context: RemoteOpServerContext,
  ): Promise<MarkReferralInProgressOutput> {
    if (!input.ReferralAssignmentID) {
      throw new RemoteOperationError('INVALID_INPUT', 'ReferralAssignmentID is required.');
    }
    return CascadeRoutingService.MarkInProgress(
      AssertValidUUID(input.ReferralAssignmentID, 'ReferralAssignmentID'),
      user,
      resolveProvider(provider, context),
    );
  }
}

@RegisterClass(BaseAction, 'Referrals.MarkReferralInProgress')
export class MarkReferralInProgressAction extends BaseAction {
  protected override async InternalRunAction(params: RunActionParams): Promise<ActionResultSimple> {
    const referralAssignmentId = getStringParam(params, 'ReferralAssignmentID');
    if (!referralAssignmentId) {
      return {
        Success: false,
        ResultCode: 'INVALID_PARAMETERS',
        Message: 'ReferralAssignmentID is required.',
      };
    }

    try {
      const result = await CascadeRoutingService.MarkInProgress(
        referralAssignmentId,
        params.ContextUser,
        resolveActionProvider(),
      );
      return {
        Success: true,
        ResultCode: 'SUCCESS',
        Message: JSON.stringify(result),
      };
    } catch (error) {
      return {
        Success: false,
        ResultCode: error instanceof Error ? error.name : 'MARK_IN_PROGRESS_ERROR',
        Message: error instanceof Error ? error.message : String(error),
      };
    }
  }
}

// =============================================================================
// 2. CompleteReferral (BaseRemotableOperation + BaseAction)
// =============================================================================
@RegisterClass(BaseRemotableOperation, 'Referrals.CompleteReferral')
export class CompleteReferralOperation extends BaseRemotableOperation<
  CompleteReferralInput,
  CompleteReferralOutput
> {
  public readonly OperationKey = 'Referrals.CompleteReferral';
  public readonly ExposeAsAgentTool = true;
  public readonly ExposeAsMCPTool = true;
  public readonly ToolDescription =
    'Transactionally completes a referral: creates a ReferralOutcome, marks the assignment and request Completed, and updates professional capacity/response metrics.';

  protected override async InternalExecute(
    input: CompleteReferralInput,
    provider: IMetadataProvider,
    user: UserInfo,
    context: RemoteOpServerContext,
  ): Promise<CompleteReferralOutput> {
    if (!input.ReferralAssignmentID) {
      throw new RemoteOperationError('INVALID_INPUT', 'ReferralAssignmentID is required.');
    }
    return CascadeRoutingService.CompleteReferral(
      {
        ReferralAssignmentID: AssertValidUUID(input.ReferralAssignmentID, 'ReferralAssignmentID'),
        OutcomeStatus: input.OutcomeStatus,
        CompletionNotes: input.CompletionNotes,
      },
      user,
      resolveProvider(provider, context),
    );
  }
}

@RegisterClass(BaseAction, 'Referrals.CompleteReferral')
export class CompleteReferralAction extends BaseAction {
  protected override async InternalRunAction(params: RunActionParams): Promise<ActionResultSimple> {
    const referralAssignmentId = getStringParam(params, 'ReferralAssignmentID');
    if (!referralAssignmentId) {
      return {
        Success: false,
        ResultCode: 'INVALID_PARAMETERS',
        Message: 'ReferralAssignmentID is required.',
      };
    }

    try {
      const result = await CascadeRoutingService.CompleteReferral(
        {
          ReferralAssignmentID: referralAssignmentId,
          OutcomeStatus: getStringParam(params, 'OutcomeStatus') as OutcomeStatus | undefined,
          CompletionNotes: getStringParam(params, 'CompletionNotes'),
        },
        params.ContextUser,
        resolveActionProvider(),
      );
      return {
        Success: true,
        ResultCode: 'SUCCESS',
        Message: JSON.stringify(result),
      };
    } catch (error) {
      return {
        Success: false,
        ResultCode: error instanceof Error ? error.name : 'COMPLETE_REFERRAL_ERROR',
        Message: error instanceof Error ? error.message : String(error),
      };
    }
  }
}

// =============================================================================
// 3. SetAvailabilityWindow (BaseRemotableOperation + BaseAction)
// =============================================================================
@RegisterClass(BaseRemotableOperation, 'Referrals.SetAvailabilityWindow')
export class SetAvailabilityWindowOperation extends BaseRemotableOperation<
  SetAvailabilityWindowInput,
  SetAvailabilityWindowOutput
> {
  public readonly OperationKey = 'Referrals.SetAvailabilityWindow';
  public readonly ExposeAsAgentTool = true;
  public readonly ExposeAsMCPTool = true;
  public readonly ToolDescription =
    'Creates or updates a recurring, date-range, or blackout availability window for a professional.';

  protected override async InternalExecute(
    input: SetAvailabilityWindowInput,
    provider: IMetadataProvider,
    user: UserInfo,
    context: RemoteOpServerContext,
  ): Promise<SetAvailabilityWindowOutput> {
    if (!input.ProfessionalProfileID || !input.WindowType) {
      throw new RemoteOperationError('INVALID_INPUT', 'ProfessionalProfileID and WindowType are required.');
    }
    const window = await CapacityReadinessService.SetAvailabilityWindow(
      {
        ProfessionalAvailabilityWindowID: input.ProfessionalAvailabilityWindowID,
        ProfessionalProfileID: input.ProfessionalProfileID,
        WindowType: input.WindowType,
        DayOfWeek: input.DayOfWeek,
        StartTimeMinutes: input.StartTimeMinutes,
        EndTimeMinutes: input.EndTimeMinutes,
        StartDate: input.StartDate ? new Date(input.StartDate) : null,
        EndDate: input.EndDate ? new Date(input.EndDate) : null,
        IsAvailable: input.IsAvailable,
        TimeZone: input.TimeZone,
        Notes: input.Notes,
      },
      user,
      resolveProvider(provider, context),
    );
    return {
      ProfessionalAvailabilityWindowID: window.ID,
      ProfessionalProfileID: window.ProfessionalProfileID,
      WindowType: window.WindowType,
    };
  }
}

@RegisterClass(BaseAction, 'Referrals.SetAvailabilityWindow')
export class SetAvailabilityWindowAction extends BaseAction {
  protected override async InternalRunAction(params: RunActionParams): Promise<ActionResultSimple> {
    const professionalProfileId = getStringParam(params, 'ProfessionalProfileID');
    const windowType = getStringParam(params, 'WindowType') as ProfessionalAvailabilityWindowEntity['WindowType'] | undefined;
    if (!professionalProfileId || !windowType) {
      return {
        Success: false,
        ResultCode: 'INVALID_PARAMETERS',
        Message: 'ProfessionalProfileID and WindowType are required.',
      };
    }

    try {
      const startDateRaw = getStringParam(params, 'StartDate');
      const endDateRaw = getStringParam(params, 'EndDate');
      const window = await CapacityReadinessService.SetAvailabilityWindow(
        {
          ProfessionalAvailabilityWindowID: getStringParam(params, 'ProfessionalAvailabilityWindowID'),
          ProfessionalProfileID: professionalProfileId,
          WindowType: windowType,
          DayOfWeek: getNumberParam(params, 'DayOfWeek'),
          StartTimeMinutes: getNumberParam(params, 'StartTimeMinutes'),
          EndTimeMinutes: getNumberParam(params, 'EndTimeMinutes'),
          StartDate: startDateRaw ? new Date(startDateRaw) : null,
          EndDate: endDateRaw ? new Date(endDateRaw) : null,
          IsAvailable: getBooleanParam(params, 'IsAvailable'),
          TimeZone: getStringParam(params, 'TimeZone'),
          Notes: getStringParam(params, 'Notes'),
        },
        params.ContextUser,
        resolveActionProvider(),
      );
      return {
        Success: true,
        ResultCode: 'SUCCESS',
        Message: JSON.stringify({
          ProfessionalAvailabilityWindowID: window.ID,
          ProfessionalProfileID: window.ProfessionalProfileID,
          WindowType: window.WindowType,
        }),
      };
    } catch (error) {
      return {
        Success: false,
        ResultCode: error instanceof Error ? error.name : 'SET_AVAILABILITY_WINDOW_ERROR',
        Message: error instanceof Error ? error.message : String(error),
      };
    }
  }
}

export function LoadReferralsLifecycleActions(): void {
  // Ensures module side-effect class registrations are preserved by bundlers.
}
