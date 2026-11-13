export type VerificationStatus = 'Pending' | 'Verified' | 'Suspended' | 'Expired';
export type AvailabilityStatus = 'Available' | 'Limited' | 'Unavailable' | 'OnLeave';
export type ProficiencyLevel = 'Primary' | 'Standard' | 'Emerging';
export type StandingStatus = 'GoodStanding' | 'Inactive' | 'ProHacVice' | 'Suspended';
export type UrgencyLevel = 'Low' | 'Standard' | 'High' | 'Urgent';
export type ReferralRequestStatus =
  | 'Draft'
  | 'Submitted'
  | 'Matching'
  | 'Routed'
  | 'Accepted'
  | 'InProgress'
  | 'Completed'
  | 'Exhausted'
  | 'Cancelled';
export type PartyRole = 'Client' | 'Adverse' | 'CoParty' | 'RelatedEntity' | 'Witness';
export type ConflictStatus = 'Pending' | 'Cleared' | 'ConflictFound' | 'Waived';
export type ReferralAssignmentStatus =
  | 'Queued'
  | 'Offered'
  | 'Accepted'
  | 'Declined'
  | 'ConflictRejected'
  | 'Expired'
  | 'Withdrawn';
export type FeedbackSubmittedByType = 'Seeker' | 'Professional' | 'Operator';
export type FeedbackOutcomeStatus = 'Engaged' | 'ConsultedOnly' | 'NoResponse' | 'NotAFit' | 'Resolved';

export interface ScoreBreakdown {
  PracticeAreaScore: number;
  JurisdictionScore: number;
  CapacityScore: number;
  ResponsivenessScore: number;
  RatingScore: number;
  LanguageBonus: number;
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
  ConflictStatus: ConflictStatus;
  ConflictReasons: string[];
  Eligible: boolean;
  DisqualificationReason: string | null;
}

export interface MatchCriteria {
  PracticeAreaID: string;
  JurisdictionID: string;
  RequiresProBono?: boolean;
  PreferredLanguage?: string | null;
  SLAResponseHours?: number;
  ConflictParties?: ConflictPartyInput[];
  MaxResults?: number;
}

export interface ConflictPartyInput {
  PartyName: string;
  PartyRole: PartyRole;
  OrganizationName?: string | null;
}

export interface ConflictScreeningResult {
  HasConflict: boolean;
  Status: ConflictStatus;
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
