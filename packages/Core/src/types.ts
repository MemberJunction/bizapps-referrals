import type {
  ConflictCheckPartyEntity,
  ProfessionalJurisdictionEntity,
  ProfessionalPracticeAreaEntity,
  ProfessionalProfileEntity,
  ReferralAssignmentEntity,
  ReferralFeedbackEntity,
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

export interface ScoreBreakdown {
  PracticeAreaScore: number;
  JurisdictionScore: number;
  CapacityScore: number;
  ResponsivenessScore: number;
  RatingScore: number;
  LanguageBonus: number;
  SemanticScore?: number;
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
