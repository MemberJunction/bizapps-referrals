import { BaseRemotableOperation } from '@memberjunction/core';
import { RegisterClass } from '@memberjunction/global';
import type { EscalationRecommendedAction } from '../types.js';

export type AIRationaleSource = 'AI' | 'Deterministic';

/**
 * Per-candidate rationale returned by `Referrals.ExplainMatch`, persisted onto
 * `ReferralAssignment.AIRationaleJSON` for the matching assignment row.
 */
export interface ExplainMatchRationaleEntry {
  ProfessionalProfileID: string;
  Source: AIRationaleSource;
  Summary: string;
  Rationale: string;
  Risks: string[];
  GeneratedAt: string;
}

export interface ExplainMatchInput {
  ReferralRequestID: string;
}

export interface ExplainMatchOutput {
  ReferralRequestID: string;
  ProcessedCount: number;
  Rationales: ExplainMatchRationaleEntry[];
}

export interface RecommendEscalationInput {
  ReferralEscalationID: string;
  /** When true, re-runs the AI advisor even if an `AIRationaleJSON` already exists. */
  Force?: boolean;
}

export interface RecommendEscalationOutput {
  ReferralEscalationID: string;
  RecommendedAction: EscalationRecommendedAction;
  Source: AIRationaleSource;
  Summary: string;
  Rationale: string;
  GeneratedAt: string;
  /** True when an existing rationale was reused and the AI advisor was not invoked. */
  Skipped: boolean;
}

/**
 * Client-safe declaration of `Referrals.ExplainMatch`. Carries only the stable
 * `OperationKey` and typed input/output contract - no server implementation, and
 * (per AC-31) no dependency on any `@memberjunction/ai-*` package. The concrete
 * server implementation lives in `@mj-biz-apps/referrals-actions`.
 */
@RegisterClass(BaseRemotableOperation, 'Referrals.ExplainMatch')
export class ExplainMatchOperationBase extends BaseRemotableOperation<ExplainMatchInput, ExplainMatchOutput> {
  public readonly OperationKey = 'Referrals.ExplainMatch';
  public readonly ExposeAsAgentTool = true;
  public readonly ExposeAsMCPTool = true;
  public readonly ToolDescription =
    'Generates an AI (or deterministic fallback) match rationale for every Offered/Queued candidate on a ReferralRequest, persisted onto each ReferralAssignment.AIRationaleJSON.';
}

/**
 * Client-safe declaration of `Referrals.RecommendEscalationAction`. Carries only
 * the stable `OperationKey` and typed input/output contract - no server
 * implementation, and (per AC-31) no dependency on any `@memberjunction/ai-*`
 * package. The concrete server implementation lives in `@mj-biz-apps/referrals-actions`.
 */
@RegisterClass(BaseRemotableOperation, 'Referrals.RecommendEscalationAction')
export class RecommendEscalationOperationBase extends BaseRemotableOperation<RecommendEscalationInput, RecommendEscalationOutput> {
  public readonly OperationKey = 'Referrals.RecommendEscalationAction';
  public readonly ExposeAsAgentTool = true;
  public readonly ExposeAsMCPTool = true;
  public readonly ToolDescription =
    'Recommends (and persists) a RecommendedAction and rationale for an open ReferralEscalation, via AI advisor with a deterministic rules fallback. Never mutates escalation Status, EscalationLevel, CascadeOrder, or any assignment row.';
}
