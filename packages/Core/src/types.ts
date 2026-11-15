import type {
  ConflictCheckPartyEntity,
  ProfessionalAvailabilityWindowEntity,
  ProfessionalJurisdictionEntity,
  ProfessionalPracticeAreaEntity,
  ProfessionalProfileEntity,
  ReferralAssignmentEntity,
  ReferralEscalationEntity,
  ReferralFeedbackEntity,
  ReferralOutcomeEntity,
  ReferralRequestEntity,
} from '@mj-biz-apps/referrals-entities';

export type VerificationStatus = ProfessionalProfileEntity['VerificationStatus'];
export type AvailabilityStatus = ProfessionalProfileEntity['AvailabilityStatus'];
export type ProficiencyLevel = ProfessionalPracticeAreaEntity['ProficiencyLevel'];
export type StandingStatus = ProfessionalJurisdictionEntity['StandingStatus'];
export type UrgencyLevel = ReferralRequestEntity['UrgencyLevel'];
export type ReferralRequestStatus = ReferralRequestEntity['Status'];
export type PartyRole = ConflictCheckPartyEntity['PartyRole'];
export type ConflictStatus = ReferralAssignmentEntity['ConflictStatus'];
export type ReferralAssignmentStatus = ReferralAssignmentEntity['Status'];
export type FeedbackSubmittedByType = ReferralFeedbackEntity['SubmittedByType'];
export type FeedbackOutcomeStatus = ReferralFeedbackEntity['OutcomeStatus'];

// Wave 3 Slice 1: SLA Escalation, Outcomes & Readiness
export type EscalationTriggerType = ReferralEscalationEntity['TriggerType'];
export type EscalationStatus = ReferralEscalationEntity['Status'];
export type EscalationRecommendedAction = ReferralEscalationEntity['RecommendedAction'];
export type OutcomeStatus = ReferralOutcomeEntity['OutcomeStatus'];
export type AvailabilityWindowType = ProfessionalAvailabilityWindowEntity['WindowType'];
export type ReferralSourceChannel = ReferralRequestEntity['SourceChannel'];

export interface ScoreBreakdown {
  PracticeAreaScore: number;
  JurisdictionScore: number;
  CapacityScore: number;
  ResponsivenessScore: number;
  RatingScore: number;
  LanguageBonus: number;
  SemanticScore?: number;
  ReciprocityBoost?: number;
  TotalScore: number;
}

export interface MatchCandidateScore {
  ProfessionalProfileID: string;
  DisplayName: string;
  FirmName: string | null;
  Email: string;
  VerificationStatus: VerificationStatus;
  AvailabilityStatus: AvailabilityStatus;
  ActiveReferralCount: number;
  MaxConcurrentReferrals: number;
  Score: number;
  Breakdown: ScoreBreakdown;
  ConflictStatus: ConflictStatus | 'Unavailable';
  ConflictReasons: string[];
  Eligible: boolean;
  DisqualificationReason: string | null;
  ExplainableMatchReasons?: string[];
  MatchSummary?: string;
}

export interface MatchCriteria {
  PracticeAreaID: string;
  JurisdictionID: string;
  RequiresProBono?: boolean;
  PreferredLanguage?: string | null;
  SLAResponseHours?: number;
  ConflictParties?: ConflictPartyInput[];
  MaxResults?: number;
  MatterTitle?: string | null;
  MatterSummary?: string | null;
  Keywords?: string[];
  /**
   * When true, adds a clamp((ReciprocityIndex - 1) * 5, 0, 5) bonus for
   * professionals who send more referrals than they accept. Defaults to
   * false so existing callers see byte-identical scores.
   */
  ApplyReciprocityBoost?: boolean;
}

export interface ConflictPartyInput {
  PartyName: string;
  PartyRole: PartyRole;
  OrganizationName?: string | null;
}

export interface ConflictScreeningResult {
  HasConflict: boolean;
  Status: ConflictStatus | 'Unavailable';
  Reasons: string[];
}

export interface CascadeRoutingResult {
  ReferralRequestID: string;
  Status: ReferralRequestStatus;
  TotalQueued: number;
  ActiveAssignmentID: string | null;
  ActiveProfessionalID: string | null;
  SLADeadlineAt: string | null;
  ConflictRejectedCount: number;
}

export type AssignmentResponseAction = 'Accept' | 'Decline' | 'ConflictReject';

export interface ResponseOutcome {
  ReferralAssignmentID: string;
  ReferralRequestID: string;
  AssignmentStatus: ReferralAssignmentStatus;
  RequestStatus: ReferralRequestStatus;
  NextOfferedAssignmentID: string | null;
  NextOfferedProfessionalID: string | null;
}

export interface SweepResult {
  ScannedCount: number;
  ExpiredCount: number;
  CascadedCount: number;
  ExhaustedCount: number;
  ProcessedAssignmentIDs: string[];
}
