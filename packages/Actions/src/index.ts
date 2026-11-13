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
  AssignmentResponseAction,
  CascadeRoutingService,
  CascadeRoutingResult,
  ConflictPartyInput,
  MatchCandidateScore,
  MatchCriteria,
  MatchingEngine,
  ReferralRequestStatus,
  ResponseOutcome,
  SweepResult,
} from '@mj-biz-apps/referrals-core';

export interface MatchProfessionalsInput {
  PracticeAreaID: string;
  JurisdictionID: string;
  RequiresProBono?: boolean;
  PreferredLanguage?: string;
  SLAResponseHours?: number;
  MaxResults?: number;
  ReferralRequestID?: string;
  ConflictParties?: ConflictPartyInput[];
}

export interface SubmitReferralIntakeInput {
  SeekerName: string;
  SeekerEmail: string;
  PracticeAreaID: string;
  JurisdictionID: string;
  ReferralTierID: string;
  MatterTitle: string;
  MatterSummary: string;
  RequiresProBono?: boolean;
  PreferredLanguage?: string;
  ConflictParties?: ConflictPartyInput[];
  AutoRoute?: boolean;
}

export interface SubmitReferralIntakeOutput {
  RequestID: string;
  RequestNumber: string;
  Status: ReferralRequestStatus;
  RoutingResult?: CascadeRoutingResult;
}

export interface RouteReferralInput {
  ReferralRequestID: string;
}

export interface RespondToReferralInput {
  ReferralAssignmentID: string;
  Action: AssignmentResponseAction;
  Notes?: string;
  DeclineReason?: string;
}

export interface SweepExpiredSLAsInput {
  AsOfIso?: string;
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
// 1. MatchProfessionals (BaseRemotableOperation + BaseAction)
// =============================================================================
@RegisterClass(BaseRemotableOperation, 'Referrals.MatchProfessionals')
export class MatchProfessionalsOperation extends BaseRemotableOperation<
  MatchProfessionalsInput,
  MatchCandidateScore[]
> {
  public readonly OperationKey = 'Referrals.MatchProfessionals';
  public readonly ExposeAsAgentTool = true;
  public readonly ExposeAsMCPTool = true;
  public readonly ToolDescription =
    'Matches and ranks verified professionals for a practice area and jurisdiction with conflict screening.';

  protected override async InternalExecute(
    input: MatchProfessionalsInput,
    provider: IMetadataProvider,
    user: UserInfo,
    context: RemoteOpServerContext,
  ): Promise<MatchCandidateScore[]> {
    if (!input.PracticeAreaID || !input.JurisdictionID) {
      throw new RemoteOperationError('INVALID_INPUT', 'PracticeAreaID and JurisdictionID are required.');
    }
    const criteria: MatchCriteria = {
      PracticeAreaID: AssertValidUUID(input.PracticeAreaID, 'PracticeAreaID'),
      JurisdictionID: AssertValidUUID(input.JurisdictionID, 'JurisdictionID'),
      RequiresProBono: input.RequiresProBono,
      PreferredLanguage: input.PreferredLanguage,
      SLAResponseHours: input.SLAResponseHours,
      MaxResults: input.MaxResults,
      ConflictParties: input.ConflictParties,
    };
    const reqId = input.ReferralRequestID ? AssertValidUUID(input.ReferralRequestID, 'ReferralRequestID') : undefined;
    return MatchingEngine.FindMatches(criteria, user, resolveProvider(provider, context), reqId);
  }
}

@RegisterClass(BaseAction, 'Referrals.MatchProfessionals')
export class MatchProfessionalsAction extends BaseAction {
  protected override async InternalRunAction(params: RunActionParams): Promise<ActionResultSimple> {
    const practiceAreaId = getStringParam(params, 'PracticeAreaID');
    const jurisdictionId = getStringParam(params, 'JurisdictionID');
    if (!practiceAreaId || !jurisdictionId) {
      return {
        Success: false,
        ResultCode: 'INVALID_PARAMETERS',
        Message: 'PracticeAreaID and JurisdictionID are required.',
      };
    }

    const matches = await MatchingEngine.FindMatches(
      {
        PracticeAreaID: practiceAreaId,
        JurisdictionID: jurisdictionId,
        RequiresProBono: getBooleanParam(params, 'RequiresProBono'),
        PreferredLanguage: getStringParam(params, 'PreferredLanguage'),
        SLAResponseHours: getNumberParam(params, 'SLAResponseHours'),
        MaxResults: getNumberParam(params, 'MaxResults'),
      },
      params.ContextUser,
      undefined,
      getStringParam(params, 'ReferralRequestID'),
    );

    return {
      Success: true,
      ResultCode: 'SUCCESS',
      Message: JSON.stringify(matches),
    };
  }
}

// =============================================================================
// 2. RouteReferral (BaseRemotableOperation + BaseAction)
// =============================================================================
@RegisterClass(BaseRemotableOperation, 'Referrals.RouteReferral')
export class RouteReferralOperation extends BaseRemotableOperation<
  RouteReferralInput,
  CascadeRoutingResult
> {
  public readonly OperationKey = 'Referrals.RouteReferral';
  public readonly ExposeAsAgentTool = true;
  public readonly ExposeAsMCPTool = true;
  public readonly ToolDescription =
    'Routes a referral request through sequential SLA-backed cascade offers after conflict screening.';

  protected override async InternalExecute(
    input: RouteReferralInput,
    provider: IMetadataProvider,
    user: UserInfo,
    context: RemoteOpServerContext,
  ): Promise<CascadeRoutingResult> {
    if (!input.ReferralRequestID) {
      throw new RemoteOperationError('INVALID_INPUT', 'ReferralRequestID is required.');
    }
    return CascadeRoutingService.RouteReferralRequest(
      AssertValidUUID(input.ReferralRequestID, 'ReferralRequestID'),
      user,
      resolveProvider(provider, context),
    );
  }
}

@RegisterClass(BaseAction, 'Referrals.RouteReferral')
export class RouteReferralAction extends BaseAction {
  protected override async InternalRunAction(params: RunActionParams): Promise<ActionResultSimple> {
    const referralRequestId = getStringParam(params, 'ReferralRequestID');
    if (!referralRequestId) {
      return {
        Success: false,
        ResultCode: 'INVALID_PARAMETERS',
        Message: 'ReferralRequestID is required.',
      };
    }

    const result = await CascadeRoutingService.RouteReferralRequest(
      referralRequestId,
      params.ContextUser,
      resolveActionProvider(),
    );
    return {
      Success: true,
      ResultCode: 'SUCCESS',
      Message: JSON.stringify(result),
    };
  }
}

// =============================================================================
// 3. RespondToReferral (BaseRemotableOperation + BaseAction)
// =============================================================================
@RegisterClass(BaseRemotableOperation, 'Referrals.RespondToReferral')
export class RespondToReferralOperation extends BaseRemotableOperation<
  RespondToReferralInput,
  ResponseOutcome
> {
  public readonly OperationKey = 'Referrals.RespondToReferral';
  public readonly ExposeAsAgentTool = true;
  public readonly ExposeAsMCPTool = true;
  public readonly ToolDescription =
    'Records a professional Accept, Decline, or ConflictReject response and advances the cascade if needed.';

  protected override async InternalExecute(
    input: RespondToReferralInput,
    provider: IMetadataProvider,
    user: UserInfo,
    context: RemoteOpServerContext,
  ): Promise<ResponseOutcome> {
    if (!input.ReferralAssignmentID || !input.Action) {
      throw new RemoteOperationError('INVALID_INPUT', 'ReferralAssignmentID and Action are required.');
    }
    return CascadeRoutingService.RespondToAssignment(
      {
        ReferralAssignmentID: AssertValidUUID(input.ReferralAssignmentID, 'ReferralAssignmentID'),
        Action: input.Action,
        Notes: input.Notes,
        DeclineReason: input.DeclineReason,
      },
      user,
      resolveProvider(provider, context),
    );
  }
}

@RegisterClass(BaseAction, 'Referrals.RespondToReferral')
export class RespondToReferralAction extends BaseAction {
  protected override async InternalRunAction(params: RunActionParams): Promise<ActionResultSimple> {
    const assignmentId = getStringParam(params, 'ReferralAssignmentID');
    const action = getStringParam(params, 'Action') as AssignmentResponseAction | undefined;
    if (!assignmentId || !action || !['Accept', 'Decline', 'ConflictReject'].includes(action)) {
      return {
        Success: false,
        ResultCode: 'INVALID_PARAMETERS',
        Message: 'ReferralAssignmentID and a valid Action (Accept | Decline | ConflictReject) are required.',
      };
    }

    const outcome = await CascadeRoutingService.RespondToAssignment(
      {
        ReferralAssignmentID: assignmentId,
        Action: action,
        Notes: getStringParam(params, 'Notes'),
        DeclineReason: getStringParam(params, 'DeclineReason'),
      },
      params.ContextUser,
      resolveActionProvider(),
    );

    return {
      Success: true,
      ResultCode: 'SUCCESS',
      Message: JSON.stringify(outcome),
    };
  }
}

// =============================================================================
// 4. SweepExpiredReferralSLAs (BaseRemotableOperation + BaseAction)
// =============================================================================
@RegisterClass(BaseRemotableOperation, 'Referrals.SweepExpiredReferralSLAs')
export class SweepExpiredReferralSLAsOperation extends BaseRemotableOperation<
  SweepExpiredSLAsInput,
  SweepResult
> {
  public readonly OperationKey = 'Referrals.SweepExpiredReferralSLAs';
  public readonly ExposeAsAgentTool = true;
  public readonly ExposeAsMCPTool = true;
  public readonly ToolDescription =
    'Sweeps Offered referral assignments past SLADeadlineAt, expires them, and cascades to the next candidate.';

  protected override async InternalExecute(
    input: SweepExpiredSLAsInput,
    provider: IMetadataProvider,
    user: UserInfo,
    context: RemoteOpServerContext,
  ): Promise<SweepResult> {
    const asOf = input?.AsOfIso ? new Date(input.AsOfIso) : new Date();
    return CascadeRoutingService.SweepExpiredSLAs(asOf, user, resolveProvider(provider, context));
  }
}

@RegisterClass(BaseAction, 'Referrals.SweepExpiredReferralSLAs')
export class SweepExpiredReferralSLAsAction extends BaseAction {
  protected override async InternalRunAction(params: RunActionParams): Promise<ActionResultSimple> {
    const asOfIso = getStringParam(params, 'AsOfIso');
    const asOf = asOfIso ? new Date(asOfIso) : new Date();
    const result = await CascadeRoutingService.SweepExpiredSLAs(
      asOf,
      params.ContextUser,
      resolveActionProvider(),
    );
    return {
      Success: true,
      ResultCode: 'SUCCESS',
      Message: JSON.stringify(result),
    };
  }
}

// =============================================================================
// 5. SubmitReferralIntake (BaseRemotableOperation + BaseAction)
// =============================================================================
@RegisterClass(BaseRemotableOperation, 'Referrals.SubmitReferralIntake')
export class SubmitReferralIntakeOperation extends BaseRemotableOperation<
  SubmitReferralIntakeInput,
  SubmitReferralIntakeOutput
> {
  public readonly OperationKey = 'Referrals.SubmitReferralIntake';
  public readonly ExposeAsAgentTool = true;
  public readonly ExposeAsMCPTool = true;
  public readonly ToolDescription =
    'Atomically creates a ReferralRequest and all ConflictCheckParty records in one transaction, marks Submitted, and optionally routes.';

  protected override async InternalExecute(
    input: SubmitReferralIntakeInput,
    provider: IMetadataProvider,
    user: UserInfo,
    context: RemoteOpServerContext,
  ): Promise<SubmitReferralIntakeOutput> {
    if (
      !input.SeekerName ||
      !input.SeekerEmail ||
      !input.PracticeAreaID ||
      !input.JurisdictionID ||
      !input.ReferralTierID ||
      !input.MatterTitle ||
      !input.MatterSummary
    ) {
      throw new RemoteOperationError('INVALID_INPUT', 'Required intake fields are missing.');
    }
    return CascadeRoutingService.SubmitIntakeWithConflicts(
      input,
      user,
      resolveProvider(provider, context),
    );
  }
}

@RegisterClass(BaseAction, 'Referrals.SubmitReferralIntake')
export class SubmitReferralIntakeAction extends BaseAction {
  protected override async InternalRunAction(params: RunActionParams): Promise<ActionResultSimple> {
    const seekerName = getStringParam(params, 'SeekerName');
    const seekerEmail = getStringParam(params, 'SeekerEmail');
    const practiceAreaId = getStringParam(params, 'PracticeAreaID');
    const jurisdictionId = getStringParam(params, 'JurisdictionID');
    const tierId = getStringParam(params, 'ReferralTierID');
    const matterTitle = getStringParam(params, 'MatterTitle');
    const matterSummary = getStringParam(params, 'MatterSummary');
    if (
      !seekerName ||
      !seekerEmail ||
      !practiceAreaId ||
      !jurisdictionId ||
      !tierId ||
      !matterTitle ||
      !matterSummary
    ) {
      return {
        Success: false,
        ResultCode: 'INVALID_PARAMETERS',
        Message: 'SeekerName, SeekerEmail, PracticeAreaID, JurisdictionID, ReferralTierID, MatterTitle, and MatterSummary are required.',
      };
    }

    const partiesRaw = getStringParam(params, 'ConflictPartiesJSON');
    const parties: ConflictPartyInput[] = partiesRaw ? (JSON.parse(partiesRaw) as ConflictPartyInput[]) : [];

    const result = await CascadeRoutingService.SubmitIntakeWithConflicts(
      {
        SeekerName: seekerName,
        SeekerEmail: seekerEmail,
        PracticeAreaID: practiceAreaId,
        JurisdictionID: jurisdictionId,
        ReferralTierID: tierId,
        MatterTitle: matterTitle,
        MatterSummary: matterSummary,
        RequiresProBono: getBooleanParam(params, 'RequiresProBono'),
        PreferredLanguage: getStringParam(params, 'PreferredLanguage'),
        ConflictParties: parties,
        AutoRoute: getBooleanParam(params, 'AutoRoute'),
      },
      params.ContextUser,
      resolveActionProvider(),
    );

    return {
      Success: true,
      ResultCode: 'SUCCESS',
      Message: JSON.stringify(result),
    };
  }
}

export function LoadReferralsActions(): void {
  // Ensures module side-effect class registrations are preserved by bundlers.
}
