# BizApps Referrals Skill

The **BizApps Referrals** Open App (`__mj_BizAppsReferrals`) is installed in this MemberJunction environment. Use this skill whenever the user asks about professional referral requests, verified directory matching, conflict-of-interest checks, SLA deadlines and escalations, professional availability/capacity, referral outcomes, or reciprocity scorecards.

## 1. Access Control & Data Boundaries

- **Never run raw SQL.** Always read records through `RunView` (passing the calling user's `ContextUser`) or invoke the typed `Referrals.*` actions bound to this skill.
- **Row-Level Security (RLS) scopes every answer automatically.** One skill serves seekers, directory professionals, and referral coordinators:
  - **Professionals** (`MJ_BizApps_Referrals: Professional Profiles.UserID`) see their own profile, availability windows, offered/accepted `Referral Assignments`, `Referral Outcomes`, and `Reciprocity Snapshots`.
  - **Seekers** (`MJ_BizApps_Referrals: Referral Requests.SeekerPersonID`) see their own submitted matters and status.
  - **Coordinators / Operators** see program-wide intake queues, cascade routing state, and open SLA escalations.
- **Confidentiality:** Conflict-check adverse party lists (`Conflict Check Parties`) and seeker matter summaries are confidential. Only report records returned for the calling user's context; never infer or disclose another professional's assignments or decline reasons.

## 2. Core Entities & Lifecycles

### Intake & Routing
- **`MJ_BizApps_Referrals: Referral Requests`**: Client/seeker matters awaiting or undergoing referral.
  - Key fields: `RequestNumber`, `SeekerName`, `SeekerEmail`, `SeekerPersonID`, `PracticeAreaID`, `JurisdictionID`, `ReferralTierID`, `MatterTitle`, `MatterSummary`, `UrgencyLevel` (`'Low' | 'Standard' | 'High' | 'Urgent'`), `RequiresProBono`, `PreferredLanguage`, `AssignedProfessionalID`, `CurrentCascadeStep`, `EscalationLevel`, `SourceChannel`, `ReferringProfessionalID`, `SubmittedAt`, `AcceptedAt`, `CompletedAt`.
  - `Status`: `'Draft' | 'Submitted' | 'Matching' | 'Routed' | 'Accepted' | 'InProgress' | 'Completed' | 'Exhausted' | 'Cancelled'`.
- **`MJ_BizApps_Referrals: Referral Assignments`**: Individual cascade offers from a request to a candidate professional.
  - Key fields: `ReferralRequestID`, `ProfessionalProfileID`, `CascadeOrder`, `MatchScore`, `ScoreBreakdownJSON`, `ConflictStatus` (`'Pending' | 'Cleared' | 'ConflictFound' | 'Waived'`), `ConflictReason`, `OfferedAt`, `SLADeadlineAt`, `RespondedAt`, `ResponseHours`, `DeclineReason`, `CompletedAt`, `AIRationaleJSON`.
  - `Status`: `'Queued' | 'Offered' | 'Accepted' | 'InProgress' | 'Completed' | 'Declined' | 'Expired' | 'ConflictRejected' | 'Withdrawn'`.
- **`MJ_BizApps_Referrals: Conflict Check Parties`**: Named parties (`PartyName`, `NormalizedName`, `PartyRole`: `'Client' | 'Adverse' | 'CoParty' | 'RelatedEntity' | 'Witness'`, `OrganizationName`) screened before offering a referral.

### Verified Professional Directory
- **`MJ_BizApps_Referrals: Professional Profiles`**: Verified members eligible to receive referrals (`UserID`, `PersonID`, `OrganizationID`, `DisplayName`, `FirmName`, `VerificationStatus`: `'Pending' | 'Verified' | 'Expired' | 'Suspended'`, `AvailabilityStatus`: `'Available' | 'Limited' | 'OnLeave' | 'Unavailable'`, `ActiveReferralCount`, `MaxConcurrentReferrals`, `AverageResponseHours`, `AverageRating`, `ReadinessScore`, `ReciprocityIndex`, `AcceptsProBono`, `AcceptsContingency`, `IsActive`).
- **`MJ_BizApps_Referrals: Practice Areas`** & **`MJ_BizApps_Referrals: Professional Practice Areas`** (`ProficiencyLevel`: `'Primary' | 'Standard' | 'Emerging'`, `YearsInPractice`).
- **`MJ_BizApps_Referrals: Jurisdictions`** & **`MJ_BizApps_Referrals: Professional Jurisdictions`** (`StandingStatus`: `'GoodStanding' | 'ProHacVice' | 'Inactive' | 'Suspended'`, `LicenseNumber`).
- **`MJ_BizApps_Referrals: Professional Credentials`**: Verified bar/license credentials (`CredentialCode`, `CredentialName`, `ProviderKey`, `VerificationStatus`: `'Pending' | 'Verified' | 'Expired' | 'Rejected' | 'Revoked'`, `ExpiresAt`).
- **`MJ_BizApps_Referrals: Professional Availability Windows`**: Planned pauses or capacity overrides (`WindowType`: `'OnLeave' | 'Paused' | 'ReducedCapacity'`, `StartsAt`, `EndsAt`, `CapacityOverride`, `IsActive`).
- **`MJ_BizApps_Referrals: Referral Tiers`**: SLA policy definitions (`SLAResponseHours`, `MaxCascadeAttempts`, `RequireConflictCheck`, `EscalationWarningPercent`, `MaxEscalationLevel`, `UrgentSLAMultiplier`).

### Escalations, Outcomes & Reciprocity
- **`MJ_BizApps_Referrals: Referral Escalations`**: SLA warnings, breaches, and exhausted cascades (`TriggerType`: `'SLAWarning' | 'SLABreach' | 'CascadeExhausted' | 'UrgentUnassigned' | 'AIRecommended' | 'Manual'`, `Status`: `'Open' | 'Acknowledged' | 'Resolved' | 'Dismissed'`, `RecommendedAction`, `LinkedTaskID`, `RaisedAt`, `ResolutionNotes`).
- **`MJ_BizApps_Referrals: Referral Outcomes`**: Conversion and fee attribution (`OutcomeStatus`: `'Engaged' | 'Resolved' | 'NoEngagement' | 'Lost' | 'Withdrawn'`, `EstimatedFeeAmount`, `ReportedFeeAmount`, `CurrencyCode`).
- **`MJ_BizApps_Referrals: Referral Feedbacks`**: Post-referral ratings and comments (`SubmittedByType`: `'Seeker' | 'Professional' | 'Operator'`, `Rating`, `OutcomeStatus`).
- **`MJ_BizApps_Referrals: Reciprocity Snapshots`**: Periodic referral balance and SLA reliability per professional (`PeriodStart`, `PeriodEnd`, `ReferralsSent`, `ReferralsReceived`, `ReferralsAccepted`, `ReferralsResolved`, `SLABreachCount`, `AcceptanceRate`, `MedianResponseHours`, `ReciprocityIndex`, `AttributedFeeTotal`).

## 3. Typed Action Playbook

Prefer these strongly typed actions over generic entity writes:

1. **Match verified professionals**: Call `Referrals.MatchProfessionals` (`PracticeAreaID`, `JurisdictionID`, optional `RequiresProBono`, `PreferredLanguage`, `SLAResponseHours`, `MaxResults`, `ReferralRequestID`). Use `Referrals.ExplainMatch` to summarize why a candidate ranked where they did.
2. **Submit intake & start cascade routing**: Call `Referrals.SubmitReferralIntake` (with optional `AutoRoute: true`) or `Referrals.RouteReferral` for an existing `Submitted` request. Confirm with the user before creating or routing new requests.
3. **Respond & advance an assignment**:
   - Accept or decline an offer: `Referrals.RespondToReferral` (`ReferralAssignmentID`, `Action`, optional `Notes` / `DeclineReason`).
   - Begin work: `Referrals.MarkReferralInProgress`.
   - Record completion & outcome: `Referrals.CompleteReferral`.
4. **Manage SLA escalations**:
   - Scan for due SLA warnings/breaches: `Referrals.EvaluateEscalations`.
   - Get an AI-backed recommendation before intervening: `Referrals.RecommendEscalationAction`.
   - Triage and close: `Referrals.AcknowledgeEscalation` and `Referrals.ResolveEscalation`.
5. **Check reciprocity & update availability**:
   - Retrieve a professional's quarterly referral balance and reliability: `Referrals.GetReciprocityScorecard` (`ProfessionalProfileID`, optional `PeriodStartIso` / `PeriodEndIso`).
   - Schedule leave or reduced capacity: `Referrals.SetAvailabilityWindow`.

## 4. Common Chief of Staff Workflows

- **"Do I have any referral offers awaiting my response?"** Query `MJ_BizApps_Referrals: Referral Assignments` via `RunView` filtered by `Status = 'Offered'` ordered by `SLADeadlineAt ASC` so urgent SLA deadlines surface first.
- **"What referrals are at risk of breaching SLA or exhausted?"** Query `MJ_BizApps_Referrals: Referral Escalations` where `Status IN ('Open', 'Acknowledged')` (or run `Referrals.EvaluateEscalations`) and highlight `TriggerType`, `EscalationLevel`, and `RecommendedAction`.
- **"How is my referral reciprocity this quarter?"** Resolve the user's `ProfessionalProfileID` from `MJ_BizApps_Referrals: Professional Profiles` (`UserID` or `Email`) and call `Referrals.GetReciprocityScorecard`.
- **"Find a verified specialist in Practice Area X / Jurisdiction Y"** Look up `PracticeAreaID` and `JurisdictionID` via `RunView` and call `Referrals.MatchProfessionals`.
