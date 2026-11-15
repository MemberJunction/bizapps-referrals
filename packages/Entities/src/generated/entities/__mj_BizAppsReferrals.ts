import { BaseEntity, EntitySaveOptions, EntityDeleteOptions, CompositeKey, ValidationResult, ValidationErrorInfo, ValidationErrorType, Metadata, ProviderType, DatabaseProviderBase, RunView } from "@memberjunction/core";
import { RegisterClass } from "@memberjunction/global";
import { z } from "zod";

     
 
/**
 * zod schema definition for the entity MJ_BizApps_Referrals: Conflict Check Parties
 */
export const mjBizAppsReferralsConflictCheckPartySchema = z.object({
    ID: z.string().describe(`
        * * Field Name: ID
        * * Display Name: ID
        * * SQL Data Type: uniqueidentifier
        * * Default Value: newsequentialid()`),
    ReferralRequestID: z.string().describe(`
        * * Field Name: ReferralRequestID
        * * Display Name: Referral Request
        * * SQL Data Type: uniqueidentifier
        * * Related Entity/Foreign Key: MJ_BizApps_Referrals: Referral Requests (vwReferralRequests.ID)`),
    PartyName: z.string().describe(`
        * * Field Name: PartyName
        * * Display Name: Party Name
        * * SQL Data Type: nvarchar(255)`),
    PartyRole: z.union([z.literal('Adverse'), z.literal('Client'), z.literal('CoParty'), z.literal('RelatedEntity'), z.literal('Witness')]).describe(`
        * * Field Name: PartyRole
        * * Display Name: Party Role
        * * SQL Data Type: nvarchar(30)
        * * Default Value: Adverse
    * * Value List Type: List
    * * Possible Values 
    *   * Adverse
    *   * Client
    *   * CoParty
    *   * RelatedEntity
    *   * Witness`),
    OrganizationName: z.string().nullable().describe(`
        * * Field Name: OrganizationName
        * * Display Name: Organization Name
        * * SQL Data Type: nvarchar(255)`),
    NormalizedName: z.string().describe(`
        * * Field Name: NormalizedName
        * * Display Name: Normalized Name
        * * SQL Data Type: nvarchar(255)`),
    Notes: z.string().nullable().describe(`
        * * Field Name: Notes
        * * Display Name: Notes
        * * SQL Data Type: nvarchar(MAX)`),
    __mj_CreatedAt: z.date().describe(`
        * * Field Name: __mj_CreatedAt
        * * Display Name: Created At
        * * SQL Data Type: datetimeoffset
        * * Default Value: getutcdate()`),
    __mj_UpdatedAt: z.date().describe(`
        * * Field Name: __mj_UpdatedAt
        * * Display Name: Updated At
        * * SQL Data Type: datetimeoffset
        * * Default Value: getutcdate()`),
});

export type mjBizAppsReferralsConflictCheckPartyEntityType = z.infer<typeof mjBizAppsReferralsConflictCheckPartySchema>;

/**
 * zod schema definition for the entity MJ_BizApps_Referrals: Jurisdictions
 */
export const mjBizAppsReferralsJurisdictionSchema = z.object({
    ID: z.string().describe(`
        * * Field Name: ID
        * * Display Name: ID
        * * SQL Data Type: uniqueidentifier
        * * Default Value: newsequentialid()`),
    ParentID: z.string().nullable().describe(`
        * * Field Name: ParentID
        * * Display Name: Parent ID
        * * SQL Data Type: uniqueidentifier
        * * Related Entity/Foreign Key: MJ_BizApps_Referrals: Jurisdictions (vwJurisdictions.ID)`),
    Name: z.string().describe(`
        * * Field Name: Name
        * * Display Name: Name
        * * SQL Data Type: nvarchar(150)`),
    Code: z.string().describe(`
        * * Field Name: Code
        * * Display Name: Code
        * * SQL Data Type: nvarchar(50)`),
    JurisdictionType: z.union([z.literal('Country'), z.literal('Federal'), z.literal('International'), z.literal('Municipal'), z.literal('Province'), z.literal('State')]).describe(`
        * * Field Name: JurisdictionType
        * * Display Name: Jurisdiction Type
        * * SQL Data Type: nvarchar(30)
        * * Default Value: State
    * * Value List Type: List
    * * Possible Values 
    *   * Country
    *   * Federal
    *   * International
    *   * Municipal
    *   * Province
    *   * State`),
    CountryCode: z.string().describe(`
        * * Field Name: CountryCode
        * * Display Name: Country Code
        * * SQL Data Type: nvarchar(10)
        * * Default Value: US`),
    StateProvinceCode: z.string().nullable().describe(`
        * * Field Name: StateProvinceCode
        * * Display Name: State/Province Code
        * * SQL Data Type: nvarchar(20)`),
    IsActive: z.boolean().describe(`
        * * Field Name: IsActive
        * * Display Name: Is Active
        * * SQL Data Type: bit
        * * Default Value: 1`),
    __mj_CreatedAt: z.date().describe(`
        * * Field Name: __mj_CreatedAt
        * * Display Name: Created At
        * * SQL Data Type: datetimeoffset
        * * Default Value: getutcdate()`),
    __mj_UpdatedAt: z.date().describe(`
        * * Field Name: __mj_UpdatedAt
        * * Display Name: Updated At
        * * SQL Data Type: datetimeoffset
        * * Default Value: getutcdate()`),
    Parent: z.string().nullable().describe(`
        * * Field Name: Parent
        * * Display Name: Parent
        * * SQL Data Type: nvarchar(150)`),
    __mj_Latitude: z.number().nullable().describe(`
        * * Field Name: __mj_Latitude
        * * Display Name: Mj Latitude
        * * SQL Data Type: decimal(10, 6)`),
    __mj_Longitude: z.number().nullable().describe(`
        * * Field Name: __mj_Longitude
        * * Display Name: Mj Longitude
        * * SQL Data Type: decimal(10, 6)`),
});

export type mjBizAppsReferralsJurisdictionEntityType = z.infer<typeof mjBizAppsReferralsJurisdictionSchema>;

/**
 * zod schema definition for the entity MJ_BizApps_Referrals: Practice Areas
 */
export const mjBizAppsReferralsPracticeAreaSchema = z.object({
    ID: z.string().describe(`
        * * Field Name: ID
        * * Display Name: ID
        * * SQL Data Type: uniqueidentifier
        * * Default Value: newsequentialid()`),
    ParentID: z.string().nullable().describe(`
        * * Field Name: ParentID
        * * Display Name: Parent ID
        * * SQL Data Type: uniqueidentifier
        * * Related Entity/Foreign Key: MJ_BizApps_Referrals: Practice Areas (vwPracticeAreas.ID)`),
    Name: z.string().describe(`
        * * Field Name: Name
        * * Display Name: Name
        * * SQL Data Type: nvarchar(150)`),
    Code: z.string().describe(`
        * * Field Name: Code
        * * Display Name: Code
        * * SQL Data Type: nvarchar(50)`),
    Category: z.string().nullable().describe(`
        * * Field Name: Category
        * * Display Name: Category
        * * SQL Data Type: nvarchar(100)`),
    Description: z.string().nullable().describe(`
        * * Field Name: Description
        * * Display Name: Description
        * * SQL Data Type: nvarchar(MAX)`),
    IconClass: z.string().nullable().describe(`
        * * Field Name: IconClass
        * * Display Name: Icon Class
        * * SQL Data Type: nvarchar(100)`),
    DisplayRank: z.number().describe(`
        * * Field Name: DisplayRank
        * * Display Name: Display Rank
        * * SQL Data Type: int
        * * Default Value: 100`),
    IsActive: z.boolean().describe(`
        * * Field Name: IsActive
        * * Display Name: Active
        * * SQL Data Type: bit
        * * Default Value: 1`),
    __mj_CreatedAt: z.date().describe(`
        * * Field Name: __mj_CreatedAt
        * * Display Name: Created At
        * * SQL Data Type: datetimeoffset
        * * Default Value: getutcdate()`),
    __mj_UpdatedAt: z.date().describe(`
        * * Field Name: __mj_UpdatedAt
        * * Display Name: Updated At
        * * SQL Data Type: datetimeoffset
        * * Default Value: getutcdate()`),
    Parent: z.string().nullable().describe(`
        * * Field Name: Parent
        * * Display Name: Parent
        * * SQL Data Type: nvarchar(150)`),
});

export type mjBizAppsReferralsPracticeAreaEntityType = z.infer<typeof mjBizAppsReferralsPracticeAreaSchema>;

/**
 * zod schema definition for the entity MJ_BizApps_Referrals: Professional Jurisdictions
 */
export const mjBizAppsReferralsProfessionalJurisdictionSchema = z.object({
    ID: z.string().describe(`
        * * Field Name: ID
        * * Display Name: ID
        * * SQL Data Type: uniqueidentifier
        * * Default Value: newsequentialid()`),
    ProfessionalProfileID: z.string().describe(`
        * * Field Name: ProfessionalProfileID
        * * Display Name: Professional Profile
        * * SQL Data Type: uniqueidentifier
        * * Related Entity/Foreign Key: MJ_BizApps_Referrals: Professional Profiles (vwProfessionalProfiles.ID)`),
    JurisdictionID: z.string().describe(`
        * * Field Name: JurisdictionID
        * * Display Name: Jurisdiction ID
        * * SQL Data Type: uniqueidentifier
        * * Related Entity/Foreign Key: MJ_BizApps_Referrals: Jurisdictions (vwJurisdictions.ID)`),
    LicenseNumber: z.string().nullable().describe(`
        * * Field Name: LicenseNumber
        * * Display Name: License Number
        * * SQL Data Type: nvarchar(100)`),
    AdmissionYear: z.number().nullable().describe(`
        * * Field Name: AdmissionYear
        * * Display Name: Admission Year
        * * SQL Data Type: int`),
    StandingStatus: z.union([z.literal('GoodStanding'), z.literal('Inactive'), z.literal('ProHacVice'), z.literal('Suspended')]).describe(`
        * * Field Name: StandingStatus
        * * Display Name: Standing Status
        * * SQL Data Type: nvarchar(30)
        * * Default Value: GoodStanding
    * * Value List Type: List
    * * Possible Values 
    *   * GoodStanding
    *   * Inactive
    *   * ProHacVice
    *   * Suspended`),
    IsPrimary: z.boolean().describe(`
        * * Field Name: IsPrimary
        * * Display Name: Is Primary
        * * SQL Data Type: bit
        * * Default Value: 0`),
    __mj_CreatedAt: z.date().describe(`
        * * Field Name: __mj_CreatedAt
        * * Display Name: Created At
        * * SQL Data Type: datetimeoffset
        * * Default Value: getutcdate()`),
    __mj_UpdatedAt: z.date().describe(`
        * * Field Name: __mj_UpdatedAt
        * * Display Name: Updated At
        * * SQL Data Type: datetimeoffset
        * * Default Value: getutcdate()`),
    Jurisdiction: z.string().nullable().describe(`
        * * Field Name: Jurisdiction
        * * Display Name: Jurisdiction
        * * SQL Data Type: nvarchar(150)`),
});

export type mjBizAppsReferralsProfessionalJurisdictionEntityType = z.infer<typeof mjBizAppsReferralsProfessionalJurisdictionSchema>;

/**
 * zod schema definition for the entity MJ_BizApps_Referrals: Professional Practice Areas
 */
export const mjBizAppsReferralsProfessionalPracticeAreaSchema = z.object({
    ID: z.string().describe(`
        * * Field Name: ID
        * * Display Name: ID
        * * SQL Data Type: uniqueidentifier
        * * Default Value: newsequentialid()`),
    ProfessionalProfileID: z.string().describe(`
        * * Field Name: ProfessionalProfileID
        * * Display Name: Professional Profile
        * * SQL Data Type: uniqueidentifier
        * * Related Entity/Foreign Key: MJ_BizApps_Referrals: Professional Profiles (vwProfessionalProfiles.ID)`),
    PracticeAreaID: z.string().describe(`
        * * Field Name: PracticeAreaID
        * * Display Name: Practice Area
        * * SQL Data Type: uniqueidentifier
        * * Related Entity/Foreign Key: MJ_BizApps_Referrals: Practice Areas (vwPracticeAreas.ID)`),
    ProficiencyLevel: z.union([z.literal('Emerging'), z.literal('Primary'), z.literal('Standard')]).describe(`
        * * Field Name: ProficiencyLevel
        * * Display Name: Proficiency Level
        * * SQL Data Type: nvarchar(30)
        * * Default Value: Standard
    * * Value List Type: List
    * * Possible Values 
    *   * Emerging
    *   * Primary
    *   * Standard`),
    YearsInPractice: z.number().describe(`
        * * Field Name: YearsInPractice
        * * Display Name: Years In Practice
        * * SQL Data Type: int
        * * Default Value: 0`),
    IsPrimary: z.boolean().describe(`
        * * Field Name: IsPrimary
        * * Display Name: Is Primary
        * * SQL Data Type: bit
        * * Default Value: 0`),
    __mj_CreatedAt: z.date().describe(`
        * * Field Name: __mj_CreatedAt
        * * Display Name: Created At
        * * SQL Data Type: datetimeoffset
        * * Default Value: getutcdate()`),
    __mj_UpdatedAt: z.date().describe(`
        * * Field Name: __mj_UpdatedAt
        * * Display Name: Updated At
        * * SQL Data Type: datetimeoffset
        * * Default Value: getutcdate()`),
    PracticeArea: z.string().nullable().describe(`
        * * Field Name: PracticeArea
        * * Display Name: Practice Area
        * * SQL Data Type: nvarchar(150)`),
});

export type mjBizAppsReferralsProfessionalPracticeAreaEntityType = z.infer<typeof mjBizAppsReferralsProfessionalPracticeAreaSchema>;

/**
 * zod schema definition for the entity MJ_BizApps_Referrals: Professional Profiles
 */
export const mjBizAppsReferralsProfessionalProfileSchema = z.object({
    ID: z.string().describe(`
        * * Field Name: ID
        * * Display Name: ID
        * * SQL Data Type: uniqueidentifier
        * * Default Value: newsequentialid()`),
    PersonID: z.string().nullable().describe(`
        * * Field Name: PersonID
        * * Display Name: Person
        * * SQL Data Type: uniqueidentifier
        * * Related Entity/Foreign Key: MJ_BizApps_Common: People (vwPeople.ID)`),
    OrganizationID: z.string().nullable().describe(`
        * * Field Name: OrganizationID
        * * Display Name: Organization
        * * SQL Data Type: uniqueidentifier
        * * Related Entity/Foreign Key: MJ_BizApps_Common: Organizations (vwOrganizations.ID)`),
    UserID: z.string().nullable().describe(`
        * * Field Name: UserID
        * * Display Name: User
        * * SQL Data Type: uniqueidentifier
        * * Related Entity/Foreign Key: MJ: Users (vwUsers.ID)`),
    DisplayName: z.string().describe(`
        * * Field Name: DisplayName
        * * Display Name: Display Name
        * * SQL Data Type: nvarchar(200)`),
    FirmName: z.string().nullable().describe(`
        * * Field Name: FirmName
        * * Display Name: Firm Name
        * * SQL Data Type: nvarchar(200)`),
    Email: z.string().describe(`
        * * Field Name: Email
        * * Display Name: Email
        * * SQL Data Type: nvarchar(255)`),
    Phone: z.string().nullable().describe(`
        * * Field Name: Phone
        * * Display Name: Phone
        * * SQL Data Type: nvarchar(50)`),
    LicenseNumber: z.string().nullable().describe(`
        * * Field Name: LicenseNumber
        * * Display Name: License Number
        * * SQL Data Type: nvarchar(100)`),
    VerificationStatus: z.union([z.literal('Expired'), z.literal('Pending'), z.literal('Suspended'), z.literal('Verified')]).describe(`
        * * Field Name: VerificationStatus
        * * Display Name: Verification Status
        * * SQL Data Type: nvarchar(30)
        * * Default Value: Pending
    * * Value List Type: List
    * * Possible Values 
    *   * Expired
    *   * Pending
    *   * Suspended
    *   * Verified`),
    AvailabilityStatus: z.union([z.literal('Available'), z.literal('Limited'), z.literal('OnLeave'), z.literal('Unavailable')]).describe(`
        * * Field Name: AvailabilityStatus
        * * Display Name: Availability Status
        * * SQL Data Type: nvarchar(30)
        * * Default Value: Available
    * * Value List Type: List
    * * Possible Values 
    *   * Available
    *   * Limited
    *   * OnLeave
    *   * Unavailable`),
    Bio: z.string().nullable().describe(`
        * * Field Name: Bio
        * * Display Name: Bio
        * * SQL Data Type: nvarchar(MAX)`),
    YearsExperience: z.number().describe(`
        * * Field Name: YearsExperience
        * * Display Name: Years of Experience
        * * SQL Data Type: int
        * * Default Value: 0`),
    Languages: z.string().nullable().describe(`
        * * Field Name: Languages
        * * Display Name: Languages
        * * SQL Data Type: nvarchar(255)
        * * Default Value: English`),
    HourlyRateMin: z.number().nullable().describe(`
        * * Field Name: HourlyRateMin
        * * Display Name: Minimum Hourly Rate
        * * SQL Data Type: decimal(10, 2)`),
    HourlyRateMax: z.number().nullable().describe(`
        * * Field Name: HourlyRateMax
        * * Display Name: Maximum Hourly Rate
        * * SQL Data Type: decimal(10, 2)`),
    AcceptsProBono: z.boolean().describe(`
        * * Field Name: AcceptsProBono
        * * Display Name: Accepts Pro Bono
        * * SQL Data Type: bit
        * * Default Value: 0`),
    AcceptsContingency: z.boolean().describe(`
        * * Field Name: AcceptsContingency
        * * Display Name: Accepts Contingency
        * * SQL Data Type: bit
        * * Default Value: 0`),
    ActiveReferralCount: z.number().describe(`
        * * Field Name: ActiveReferralCount
        * * Display Name: Active Referral Count
        * * SQL Data Type: int
        * * Default Value: 0`),
    MaxConcurrentReferrals: z.number().describe(`
        * * Field Name: MaxConcurrentReferrals
        * * Display Name: Max Concurrent Referrals
        * * SQL Data Type: int
        * * Default Value: 10`),
    AverageResponseHours: z.number().nullable().describe(`
        * * Field Name: AverageResponseHours
        * * Display Name: Average Response Hours
        * * SQL Data Type: decimal(6, 2)`),
    AverageRating: z.number().nullable().describe(`
        * * Field Name: AverageRating
        * * Display Name: Average Rating
        * * SQL Data Type: decimal(3, 2)`),
    TotalAcceptedCount: z.number().describe(`
        * * Field Name: TotalAcceptedCount
        * * Display Name: Total Accepted Count
        * * SQL Data Type: int
        * * Default Value: 0`),
    TotalCompletedCount: z.number().describe(`
        * * Field Name: TotalCompletedCount
        * * Display Name: Total Completed Count
        * * SQL Data Type: int
        * * Default Value: 0`),
    IsActive: z.boolean().describe(`
        * * Field Name: IsActive
        * * Display Name: Active
        * * SQL Data Type: bit
        * * Default Value: 1`),
    ReadinessScore: z.number().describe(`
        * * Field Name: ReadinessScore
        * * Display Name: Readiness Score
        * * SQL Data Type: decimal(5, 2)
        * * Default Value: 100.00`),
    ReciprocityIndex: z.number().nullable().describe(`
        * * Field Name: ReciprocityIndex
        * * Display Name: Reciprocity Index
        * * SQL Data Type: decimal(5, 2)`),
    ReadinessComputedAt: z.date().nullable().describe(`
        * * Field Name: ReadinessComputedAt
        * * Display Name: Readiness Computed At
        * * SQL Data Type: datetimeoffset`),
    __mj_CreatedAt: z.date().describe(`
        * * Field Name: __mj_CreatedAt
        * * Display Name: Created At
        * * SQL Data Type: datetimeoffset
        * * Default Value: getutcdate()`),
    __mj_UpdatedAt: z.date().describe(`
        * * Field Name: __mj_UpdatedAt
        * * Display Name: Updated At
        * * SQL Data Type: datetimeoffset
        * * Default Value: getutcdate()`),
    Person: z.string().nullable().describe(`
        * * Field Name: Person
        * * Display Name: Person Name
        * * SQL Data Type: nvarchar(250)`),
    Organization: z.string().nullable().describe(`
        * * Field Name: Organization
        * * Display Name: Organization Name
        * * SQL Data Type: nvarchar(255)`),
    User: z.string().nullable().describe(`
        * * Field Name: User
        * * Display Name: User Name
        * * SQL Data Type: nvarchar(100)`),
});

export type mjBizAppsReferralsProfessionalProfileEntityType = z.infer<typeof mjBizAppsReferralsProfessionalProfileSchema>;

/**
 * zod schema definition for the entity MJ_BizApps_Referrals: Referral Assignments
 */
export const mjBizAppsReferralsReferralAssignmentSchema = z.object({
    ID: z.string().describe(`
        * * Field Name: ID
        * * Display Name: ID
        * * SQL Data Type: uniqueidentifier
        * * Default Value: newsequentialid()`),
    ReferralRequestID: z.string().describe(`
        * * Field Name: ReferralRequestID
        * * Display Name: Referral Request
        * * SQL Data Type: uniqueidentifier
        * * Related Entity/Foreign Key: MJ_BizApps_Referrals: Referral Requests (vwReferralRequests.ID)`),
    ProfessionalProfileID: z.string().describe(`
        * * Field Name: ProfessionalProfileID
        * * Display Name: Professional Profile
        * * SQL Data Type: uniqueidentifier
        * * Related Entity/Foreign Key: MJ_BizApps_Referrals: Professional Profiles (vwProfessionalProfiles.ID)`),
    CascadeOrder: z.number().describe(`
        * * Field Name: CascadeOrder
        * * Display Name: Cascade Order
        * * SQL Data Type: int
        * * Default Value: 1`),
    MatchScore: z.number().describe(`
        * * Field Name: MatchScore
        * * Display Name: Match Score
        * * SQL Data Type: decimal(5, 2)
        * * Default Value: 0.00`),
    ScoreBreakdownJSON: z.string().nullable().describe(`
        * * Field Name: ScoreBreakdownJSON
        * * Display Name: Score Breakdown
        * * SQL Data Type: nvarchar(MAX)`),
    ConflictStatus: z.union([z.literal('Cleared'), z.literal('ConflictFound'), z.literal('Pending'), z.literal('Waived')]).describe(`
        * * Field Name: ConflictStatus
        * * Display Name: Conflict Status
        * * SQL Data Type: nvarchar(30)
        * * Default Value: Pending
    * * Value List Type: List
    * * Possible Values 
    *   * Cleared
    *   * ConflictFound
    *   * Pending
    *   * Waived`),
    ConflictReason: z.string().nullable().describe(`
        * * Field Name: ConflictReason
        * * Display Name: Conflict Reason
        * * SQL Data Type: nvarchar(MAX)`),
    Status: z.union([z.literal('Accepted'), z.literal('Completed'), z.literal('ConflictRejected'), z.literal('Declined'), z.literal('Expired'), z.literal('InProgress'), z.literal('Offered'), z.literal('Queued'), z.literal('Withdrawn')]).describe(`
        * * Field Name: Status
        * * Display Name: Status
        * * SQL Data Type: nvarchar(30)
        * * Default Value: Queued
    * * Value List Type: List
    * * Possible Values
    *   * Accepted
    *   * Completed
    *   * ConflictRejected
    *   * Declined
    *   * Expired
    *   * InProgress
    *   * Offered
    *   * Queued
    *   * Withdrawn`),
    OfferedAt: z.date().nullable().describe(`
        * * Field Name: OfferedAt
        * * Display Name: Offered At
        * * SQL Data Type: datetimeoffset`),
    SLADeadlineAt: z.date().nullable().describe(`
        * * Field Name: SLADeadlineAt
        * * Display Name: SLA Deadline
        * * SQL Data Type: datetimeoffset`),
    RespondedAt: z.date().nullable().describe(`
        * * Field Name: RespondedAt
        * * Display Name: Responded At
        * * SQL Data Type: datetimeoffset`),
    ResponseNotes: z.string().nullable().describe(`
        * * Field Name: ResponseNotes
        * * Display Name: Response Notes
        * * SQL Data Type: nvarchar(MAX)`),
    DeclineReason: z.string().nullable().describe(`
        * * Field Name: DeclineReason
        * * Display Name: Decline Reason
        * * SQL Data Type: nvarchar(255)`),
    SLAWarningSentAt: z.date().nullable().describe(`
        * * Field Name: SLAWarningSentAt
        * * Display Name: SLA Warning Sent At
        * * SQL Data Type: datetimeoffset`),
    ResponseHours: z.number().nullable().describe(`
        * * Field Name: ResponseHours
        * * Display Name: Response Hours
        * * SQL Data Type: decimal(6, 2)`),
    CompletedAt: z.date().nullable().describe(`
        * * Field Name: CompletedAt
        * * Display Name: Completed At
        * * SQL Data Type: datetimeoffset`),
    AIRationaleJSON: z.string().nullable().describe(`
        * * Field Name: AIRationaleJSON
        * * Display Name: AI Rationale JSON
        * * SQL Data Type: nvarchar(MAX)`),
    __mj_CreatedAt: z.date().describe(`
        * * Field Name: __mj_CreatedAt
        * * Display Name: Created At
        * * SQL Data Type: datetimeoffset
        * * Default Value: getutcdate()`),
    __mj_UpdatedAt: z.date().describe(`
        * * Field Name: __mj_UpdatedAt
        * * Display Name: Updated At
        * * SQL Data Type: datetimeoffset
        * * Default Value: getutcdate()`),
});

export type mjBizAppsReferralsReferralAssignmentEntityType = z.infer<typeof mjBizAppsReferralsReferralAssignmentSchema>;

/**
 * zod schema definition for the entity MJ_BizApps_Referrals: Referral Feedbacks
 */
export const mjBizAppsReferralsReferralFeedbackSchema = z.object({
    ID: z.string().describe(`
        * * Field Name: ID
        * * Display Name: ID
        * * SQL Data Type: uniqueidentifier
        * * Default Value: newsequentialid()`),
    ReferralRequestID: z.string().describe(`
        * * Field Name: ReferralRequestID
        * * Display Name: Referral Request
        * * SQL Data Type: uniqueidentifier
        * * Related Entity/Foreign Key: MJ_BizApps_Referrals: Referral Requests (vwReferralRequests.ID)`),
    ReferralAssignmentID: z.string().nullable().describe(`
        * * Field Name: ReferralAssignmentID
        * * Display Name: Referral Assignment
        * * SQL Data Type: uniqueidentifier
        * * Related Entity/Foreign Key: MJ_BizApps_Referrals: Referral Assignments (vwReferralAssignments.ID)`),
    ProfessionalProfileID: z.string().describe(`
        * * Field Name: ProfessionalProfileID
        * * Display Name: Professional Profile
        * * SQL Data Type: uniqueidentifier
        * * Related Entity/Foreign Key: MJ_BizApps_Referrals: Professional Profiles (vwProfessionalProfiles.ID)`),
    SubmittedByType: z.union([z.literal('Operator'), z.literal('Professional'), z.literal('Seeker')]).describe(`
        * * Field Name: SubmittedByType
        * * Display Name: Submitted By Type
        * * SQL Data Type: nvarchar(20)
        * * Default Value: Seeker
    * * Value List Type: List
    * * Possible Values 
    *   * Operator
    *   * Professional
    *   * Seeker`),
    Rating: z.number().describe(`
        * * Field Name: Rating
        * * Display Name: Rating
        * * SQL Data Type: int`),
    OutcomeStatus: z.union([z.literal('ConsultedOnly'), z.literal('Engaged'), z.literal('NoResponse'), z.literal('NotAFit'), z.literal('Resolved')]).describe(`
        * * Field Name: OutcomeStatus
        * * Display Name: Outcome Status
        * * SQL Data Type: nvarchar(30)
        * * Default Value: Engaged
    * * Value List Type: List
    * * Possible Values 
    *   * ConsultedOnly
    *   * Engaged
    *   * NoResponse
    *   * NotAFit
    *   * Resolved`),
    Comments: z.string().nullable().describe(`
        * * Field Name: Comments
        * * Display Name: Comments
        * * SQL Data Type: nvarchar(MAX)`),
    SubmittedAt: z.date().describe(`
        * * Field Name: SubmittedAt
        * * Display Name: Submitted At
        * * SQL Data Type: datetimeoffset
        * * Default Value: sysdatetimeoffset()`),
    __mj_CreatedAt: z.date().describe(`
        * * Field Name: __mj_CreatedAt
        * * Display Name: Created At
        * * SQL Data Type: datetimeoffset
        * * Default Value: getutcdate()`),
    __mj_UpdatedAt: z.date().describe(`
        * * Field Name: __mj_UpdatedAt
        * * Display Name: Updated At
        * * SQL Data Type: datetimeoffset
        * * Default Value: getutcdate()`),
});

export type mjBizAppsReferralsReferralFeedbackEntityType = z.infer<typeof mjBizAppsReferralsReferralFeedbackSchema>;

/**
 * zod schema definition for the entity MJ_BizApps_Referrals: Referral Requests
 */
export const mjBizAppsReferralsReferralRequestSchema = z.object({
    ID: z.string().describe(`
        * * Field Name: ID
        * * Display Name: ID
        * * SQL Data Type: uniqueidentifier
        * * Default Value: newsequentialid()`),
    RequestNumber: z.string().describe(`
        * * Field Name: RequestNumber
        * * Display Name: Request Number
        * * SQL Data Type: nvarchar(50)`),
    SeekerName: z.string().describe(`
        * * Field Name: SeekerName
        * * Display Name: Seeker Name
        * * SQL Data Type: nvarchar(200)`),
    SeekerEmail: z.string().describe(`
        * * Field Name: SeekerEmail
        * * Display Name: Seeker Email
        * * SQL Data Type: nvarchar(255)`),
    SeekerPhone: z.string().nullable().describe(`
        * * Field Name: SeekerPhone
        * * Display Name: Seeker Phone
        * * SQL Data Type: nvarchar(50)`),
    SeekerCompany: z.string().nullable().describe(`
        * * Field Name: SeekerCompany
        * * Display Name: Seeker Company
        * * SQL Data Type: nvarchar(200)`),
    SeekerPersonID: z.string().nullable().describe(`
        * * Field Name: SeekerPersonID
        * * Display Name: Seeker Person
        * * SQL Data Type: uniqueidentifier
        * * Related Entity/Foreign Key: MJ_BizApps_Common: People (vwPeople.ID)`),
    PracticeAreaID: z.string().describe(`
        * * Field Name: PracticeAreaID
        * * Display Name: Practice Area
        * * SQL Data Type: uniqueidentifier
        * * Related Entity/Foreign Key: MJ_BizApps_Referrals: Practice Areas (vwPracticeAreas.ID)`),
    JurisdictionID: z.string().describe(`
        * * Field Name: JurisdictionID
        * * Display Name: Jurisdiction
        * * SQL Data Type: uniqueidentifier
        * * Related Entity/Foreign Key: MJ_BizApps_Referrals: Jurisdictions (vwJurisdictions.ID)`),
    ReferralTierID: z.string().describe(`
        * * Field Name: ReferralTierID
        * * Display Name: Referral Tier
        * * SQL Data Type: uniqueidentifier
        * * Related Entity/Foreign Key: MJ_BizApps_Referrals: Referral Tiers (vwReferralTiers.ID)`),
    MatterTitle: z.string().describe(`
        * * Field Name: MatterTitle
        * * Display Name: Matter Title
        * * SQL Data Type: nvarchar(255)`),
    MatterSummary: z.string().describe(`
        * * Field Name: MatterSummary
        * * Display Name: Matter Summary
        * * SQL Data Type: nvarchar(MAX)`),
    UrgencyLevel: z.union([z.literal('High'), z.literal('Low'), z.literal('Standard'), z.literal('Urgent')]).describe(`
        * * Field Name: UrgencyLevel
        * * Display Name: Urgency Level
        * * SQL Data Type: nvarchar(20)
        * * Default Value: Standard
    * * Value List Type: List
    * * Possible Values 
    *   * High
    *   * Low
    *   * Standard
    *   * Urgent`),
    BudgetRange: z.string().nullable().describe(`
        * * Field Name: BudgetRange
        * * Display Name: Budget Range
        * * SQL Data Type: nvarchar(100)`),
    PreferredLanguage: z.string().nullable().describe(`
        * * Field Name: PreferredLanguage
        * * Display Name: Preferred Language
        * * SQL Data Type: nvarchar(100)
        * * Default Value: English`),
    RequiresProBono: z.boolean().describe(`
        * * Field Name: RequiresProBono
        * * Display Name: Requires Pro Bono
        * * SQL Data Type: bit
        * * Default Value: 0`),
    Status: z.union([z.literal('Accepted'), z.literal('Cancelled'), z.literal('Completed'), z.literal('Draft'), z.literal('Exhausted'), z.literal('InProgress'), z.literal('Matching'), z.literal('Routed'), z.literal('Submitted')]).describe(`
        * * Field Name: Status
        * * Display Name: Status
        * * SQL Data Type: nvarchar(30)
        * * Default Value: Draft
    * * Value List Type: List
    * * Possible Values 
    *   * Accepted
    *   * Cancelled
    *   * Completed
    *   * Draft
    *   * Exhausted
    *   * InProgress
    *   * Matching
    *   * Routed
    *   * Submitted`),
    AssignedProfessionalID: z.string().nullable().describe(`
        * * Field Name: AssignedProfessionalID
        * * Display Name: Assigned Professional
        * * SQL Data Type: uniqueidentifier
        * * Related Entity/Foreign Key: MJ_BizApps_Referrals: Professional Profiles (vwProfessionalProfiles.ID)`),
    CurrentCascadeStep: z.number().describe(`
        * * Field Name: CurrentCascadeStep
        * * Display Name: Current Cascade Step
        * * SQL Data Type: int
        * * Default Value: 0`),
    SubmittedAt: z.date().nullable().describe(`
        * * Field Name: SubmittedAt
        * * Display Name: Submitted At
        * * SQL Data Type: datetimeoffset`),
    AcceptedAt: z.date().nullable().describe(`
        * * Field Name: AcceptedAt
        * * Display Name: Accepted At
        * * SQL Data Type: datetimeoffset`),
    CompletedAt: z.date().nullable().describe(`
        * * Field Name: CompletedAt
        * * Display Name: Completed At
        * * SQL Data Type: datetimeoffset`),
    SourceChannel: z.union([z.literal('API'), z.literal('Email'), z.literal('Phone'), z.literal('Referral'), z.literal('Web')]).describe(`
        * * Field Name: SourceChannel
        * * Display Name: Source Channel
        * * SQL Data Type: nvarchar(30)
        * * Default Value: Web
    * * Value List Type: List
    * * Possible Values
    *   * API
    *   * Email
    *   * Phone
    *   * Referral
    *   * Web`),
    ReferringProfessionalID: z.string().nullable().describe(`
        * * Field Name: ReferringProfessionalID
        * * Display Name: Referring Professional
        * * SQL Data Type: uniqueidentifier
        * * Related Entity/Foreign Key: MJ_BizApps_Referrals: Professional Profiles (vwProfessionalProfiles.ID)`),
    EscalationLevel: z.number().describe(`
        * * Field Name: EscalationLevel
        * * Display Name: Escalation Level
        * * SQL Data Type: int
        * * Default Value: 0`),
    LastEscalatedAt: z.date().nullable().describe(`
        * * Field Name: LastEscalatedAt
        * * Display Name: Last Escalated At
        * * SQL Data Type: datetimeoffset`),
    __mj_CreatedAt: z.date().describe(`
        * * Field Name: __mj_CreatedAt
        * * Display Name: Created At
        * * SQL Data Type: datetimeoffset
        * * Default Value: getutcdate()`),
    __mj_UpdatedAt: z.date().describe(`
        * * Field Name: __mj_UpdatedAt
        * * Display Name: Updated At
        * * SQL Data Type: datetimeoffset
        * * Default Value: getutcdate()`),
    SeekerPerson: z.string().nullable().describe(`
        * * Field Name: SeekerPerson
        * * Display Name: Seeker Person
        * * SQL Data Type: nvarchar(250)`),
    PracticeArea: z.string().nullable().describe(`
        * * Field Name: PracticeArea
        * * Display Name: Practice Area
        * * SQL Data Type: nvarchar(150)`),
    Jurisdiction: z.string().nullable().describe(`
        * * Field Name: Jurisdiction
        * * Display Name: Jurisdiction
        * * SQL Data Type: nvarchar(150)`),
    ReferralTier: z.string().nullable().describe(`
        * * Field Name: ReferralTier
        * * Display Name: Referral Tier
        * * SQL Data Type: nvarchar(100)`),
});

export type mjBizAppsReferralsReferralRequestEntityType = z.infer<typeof mjBizAppsReferralsReferralRequestSchema>;

/**
 * zod schema definition for the entity MJ_BizApps_Referrals: Referral Tiers
 */
export const mjBizAppsReferralsReferralTierSchema = z.object({
    ID: z.string().describe(`
        * * Field Name: ID
        * * Display Name: ID
        * * SQL Data Type: uniqueidentifier
        * * Default Value: newsequentialid()`),
    Name: z.string().describe(`
        * * Field Name: Name
        * * Display Name: Name
        * * SQL Data Type: nvarchar(100)`),
    Code: z.string().describe(`
        * * Field Name: Code
        * * Display Name: Code
        * * SQL Data Type: nvarchar(50)`),
    SLAResponseHours: z.number().describe(`
        * * Field Name: SLAResponseHours
        * * Display Name: SLA Response Hours
        * * SQL Data Type: int
        * * Default Value: 24`),
    MaxCascadeAttempts: z.number().describe(`
        * * Field Name: MaxCascadeAttempts
        * * Display Name: Max Cascade Attempts
        * * SQL Data Type: int
        * * Default Value: 3`),
    PriorityWeight: z.number().describe(`
        * * Field Name: PriorityWeight
        * * Display Name: Priority Weight
        * * SQL Data Type: decimal(5, 2)
        * * Default Value: 1.00`),
    RequireConflictCheck: z.boolean().describe(`
        * * Field Name: RequireConflictCheck
        * * Display Name: Require Conflict Check
        * * SQL Data Type: bit
        * * Default Value: 1`),
    Description: z.string().nullable().describe(`
        * * Field Name: Description
        * * Display Name: Description
        * * SQL Data Type: nvarchar(MAX)`),
    IsActive: z.boolean().describe(`
        * * Field Name: IsActive
        * * Display Name: Active
        * * SQL Data Type: bit
        * * Default Value: 1`),
    EscalationWarningPercent: z.number().describe(`
        * * Field Name: EscalationWarningPercent
        * * Display Name: Escalation Warning Percent
        * * SQL Data Type: int
        * * Default Value: 75`),
    MaxEscalationLevel: z.number().describe(`
        * * Field Name: MaxEscalationLevel
        * * Display Name: Max Escalation Level
        * * SQL Data Type: int
        * * Default Value: 3`),
    UrgentSLAMultiplier: z.number().describe(`
        * * Field Name: UrgentSLAMultiplier
        * * Display Name: Urgent SLA Multiplier
        * * SQL Data Type: decimal(4, 2)
        * * Default Value: 0.50`),
    EscalationActionType: z.union([z.literal('AdminAlert'), z.literal('Notify'), z.literal('Reassign')]).describe(`
        * * Field Name: EscalationActionType
        * * Display Name: Escalation Action Type
        * * SQL Data Type: nvarchar(30)
        * * Default Value: Notify
    * * Value List Type: List
    * * Possible Values
    *   * AdminAlert
    *   * Notify
    *   * Reassign`),
    __mj_CreatedAt: z.date().describe(`
        * * Field Name: __mj_CreatedAt
        * * Display Name: Created At
        * * SQL Data Type: datetimeoffset
        * * Default Value: getutcdate()`),
    __mj_UpdatedAt: z.date().describe(`
        * * Field Name: __mj_UpdatedAt
        * * Display Name: Updated At
        * * SQL Data Type: datetimeoffset
        * * Default Value: getutcdate()`),
});

export type mjBizAppsReferralsReferralTierEntityType = z.infer<typeof mjBizAppsReferralsReferralTierSchema>;
 
 

/**
 * MJ_BizApps_Referrals: Conflict Check Parties - strongly typed entity sub-class
 * * Schema: __mj_BizAppsReferrals
 * * Base Table: ConflictCheckParty
 * * Base View: vwConflictCheckParties
 * * @description Parties involved in a referral matter screened for conflicts of interest.
 * * Primary Key: ID
 * @extends {BaseEntity}
 * @class
 * @public
 */
@RegisterClass(BaseEntity, 'MJ_BizApps_Referrals: Conflict Check Parties')
export class mjBizAppsReferralsConflictCheckPartyEntity extends BaseEntity<mjBizAppsReferralsConflictCheckPartyEntityType> {
    /**
    * Loads the MJ_BizApps_Referrals: Conflict Check Parties record from the database
    * @param ID: string - primary key value to load the MJ_BizApps_Referrals: Conflict Check Parties record.
    * @param EntityRelationshipsToLoad - (optional) the relationships to load
    * @returns {Promise<boolean>} - true if successful, false otherwise
    * @public
    * @async
    * @memberof mjBizAppsReferralsConflictCheckPartyEntity
    * @method
    * @override
    */
    public async Load(ID: string, EntityRelationshipsToLoad?: string[]) : Promise<boolean> {
        const compositeKey: CompositeKey = new CompositeKey();
        compositeKey.KeyValuePairs.push({ FieldName: 'ID', Value: ID });
        return await super.InnerLoad(compositeKey, EntityRelationshipsToLoad);
    }

    /**
    * * Field Name: ID
    * * Display Name: ID
    * * SQL Data Type: uniqueidentifier
    * * Default Value: newsequentialid()
    */
    get ID(): string {
        return this.Get('ID');
    }
    set ID(value: string) {
        this.Set('ID', value);
    }

    /**
    * * Field Name: ReferralRequestID
    * * Display Name: Referral Request
    * * SQL Data Type: uniqueidentifier
    * * Related Entity/Foreign Key: MJ_BizApps_Referrals: Referral Requests (vwReferralRequests.ID)
    */
    get ReferralRequestID(): string {
        return this.Get('ReferralRequestID');
    }
    set ReferralRequestID(value: string) {
        this.Set('ReferralRequestID', value);
    }

    /**
    * * Field Name: PartyName
    * * Display Name: Party Name
    * * SQL Data Type: nvarchar(255)
    */
    get PartyName(): string {
        return this.Get('PartyName');
    }
    set PartyName(value: string) {
        this.Set('PartyName', value);
    }

    /**
    * * Field Name: PartyRole
    * * Display Name: Party Role
    * * SQL Data Type: nvarchar(30)
    * * Default Value: Adverse
    * * Value List Type: List
    * * Possible Values 
    *   * Adverse
    *   * Client
    *   * CoParty
    *   * RelatedEntity
    *   * Witness
    */
    get PartyRole(): 'Adverse' | 'Client' | 'CoParty' | 'RelatedEntity' | 'Witness' {
        return this.Get('PartyRole');
    }
    set PartyRole(value: 'Adverse' | 'Client' | 'CoParty' | 'RelatedEntity' | 'Witness') {
        this.Set('PartyRole', value);
    }

    /**
    * * Field Name: OrganizationName
    * * Display Name: Organization Name
    * * SQL Data Type: nvarchar(255)
    */
    get OrganizationName(): string | null {
        return this.Get('OrganizationName');
    }
    set OrganizationName(value: string | null) {
        this.Set('OrganizationName', value);
    }

    /**
    * * Field Name: NormalizedName
    * * Display Name: Normalized Name
    * * SQL Data Type: nvarchar(255)
    */
    get NormalizedName(): string {
        return this.Get('NormalizedName');
    }
    set NormalizedName(value: string) {
        this.Set('NormalizedName', value);
    }

    /**
    * * Field Name: Notes
    * * Display Name: Notes
    * * SQL Data Type: nvarchar(MAX)
    */
    get Notes(): string | null {
        return this.Get('Notes');
    }
    set Notes(value: string | null) {
        this.Set('Notes', value);
    }

    /**
    * * Field Name: __mj_CreatedAt
    * * Display Name: Created At
    * * SQL Data Type: datetimeoffset
    * * Default Value: getutcdate()
    */
    get __mj_CreatedAt(): Date {
        return this.Get('__mj_CreatedAt');
    }

    /**
    * * Field Name: __mj_UpdatedAt
    * * Display Name: Updated At
    * * SQL Data Type: datetimeoffset
    * * Default Value: getutcdate()
    */
    get __mj_UpdatedAt(): Date {
        return this.Get('__mj_UpdatedAt');
    }
}


/**
 * MJ_BizApps_Referrals: Jurisdictions - strongly typed entity sub-class
 * * Schema: __mj_BizAppsReferrals
 * * Base Table: Jurisdiction
 * * Base View: vwJurisdictions
 * * @description Hierarchical geographic or regulatory licensing jurisdictions.
 * * Primary Key: ID
 * @extends {BaseEntity}
 * @class
 * @public
 */
@RegisterClass(BaseEntity, 'MJ_BizApps_Referrals: Jurisdictions')
export class mjBizAppsReferralsJurisdictionEntity extends BaseEntity<mjBizAppsReferralsJurisdictionEntityType> {
    /**
    * Loads the MJ_BizApps_Referrals: Jurisdictions record from the database
    * @param ID: string - primary key value to load the MJ_BizApps_Referrals: Jurisdictions record.
    * @param EntityRelationshipsToLoad - (optional) the relationships to load
    * @returns {Promise<boolean>} - true if successful, false otherwise
    * @public
    * @async
    * @memberof mjBizAppsReferralsJurisdictionEntity
    * @method
    * @override
    */
    public async Load(ID: string, EntityRelationshipsToLoad?: string[]) : Promise<boolean> {
        const compositeKey: CompositeKey = new CompositeKey();
        compositeKey.KeyValuePairs.push({ FieldName: 'ID', Value: ID });
        return await super.InnerLoad(compositeKey, EntityRelationshipsToLoad);
    }

    /**
    * * Field Name: ID
    * * Display Name: ID
    * * SQL Data Type: uniqueidentifier
    * * Default Value: newsequentialid()
    */
    get ID(): string {
        return this.Get('ID');
    }
    set ID(value: string) {
        this.Set('ID', value);
    }

    /**
    * * Field Name: ParentID
    * * Display Name: Parent ID
    * * SQL Data Type: uniqueidentifier
    * * Related Entity/Foreign Key: MJ_BizApps_Referrals: Jurisdictions (vwJurisdictions.ID)
    */
    get ParentID(): string | null {
        return this.Get('ParentID');
    }
    set ParentID(value: string | null) {
        this.Set('ParentID', value);
    }

    /**
    * * Field Name: Name
    * * Display Name: Name
    * * SQL Data Type: nvarchar(150)
    */
    get Name(): string {
        return this.Get('Name');
    }
    set Name(value: string) {
        this.Set('Name', value);
    }

    /**
    * * Field Name: Code
    * * Display Name: Code
    * * SQL Data Type: nvarchar(50)
    */
    get Code(): string {
        return this.Get('Code');
    }
    set Code(value: string) {
        this.Set('Code', value);
    }

    /**
    * * Field Name: JurisdictionType
    * * Display Name: Jurisdiction Type
    * * SQL Data Type: nvarchar(30)
    * * Default Value: State
    * * Value List Type: List
    * * Possible Values 
    *   * Country
    *   * Federal
    *   * International
    *   * Municipal
    *   * Province
    *   * State
    */
    get JurisdictionType(): 'Country' | 'Federal' | 'International' | 'Municipal' | 'Province' | 'State' {
        return this.Get('JurisdictionType');
    }
    set JurisdictionType(value: 'Country' | 'Federal' | 'International' | 'Municipal' | 'Province' | 'State') {
        this.Set('JurisdictionType', value);
    }

    /**
    * * Field Name: CountryCode
    * * Display Name: Country Code
    * * SQL Data Type: nvarchar(10)
    * * Default Value: US
    */
    get CountryCode(): string {
        return this.Get('CountryCode');
    }
    set CountryCode(value: string) {
        this.Set('CountryCode', value);
    }

    /**
    * * Field Name: StateProvinceCode
    * * Display Name: State/Province Code
    * * SQL Data Type: nvarchar(20)
    */
    get StateProvinceCode(): string | null {
        return this.Get('StateProvinceCode');
    }
    set StateProvinceCode(value: string | null) {
        this.Set('StateProvinceCode', value);
    }

    /**
    * * Field Name: IsActive
    * * Display Name: Is Active
    * * SQL Data Type: bit
    * * Default Value: 1
    */
    get IsActive(): boolean {
        return this.Get('IsActive');
    }
    set IsActive(value: boolean) {
        this.Set('IsActive', value);
    }

    /**
    * * Field Name: __mj_CreatedAt
    * * Display Name: Created At
    * * SQL Data Type: datetimeoffset
    * * Default Value: getutcdate()
    */
    get __mj_CreatedAt(): Date {
        return this.Get('__mj_CreatedAt');
    }

    /**
    * * Field Name: __mj_UpdatedAt
    * * Display Name: Updated At
    * * SQL Data Type: datetimeoffset
    * * Default Value: getutcdate()
    */
    get __mj_UpdatedAt(): Date {
        return this.Get('__mj_UpdatedAt');
    }

    /**
    * * Field Name: Parent
    * * Display Name: Parent
    * * SQL Data Type: nvarchar(150)
    */
    get Parent(): string | null {
        return this.Get('Parent');
    }

    /**
    * * Field Name: __mj_Latitude
    * * Display Name: Mj Latitude
    * * SQL Data Type: decimal(10, 6)
    */
    get __mj_Latitude(): number | null {
        return this.Get('__mj_Latitude');
    }

    /**
    * * Field Name: __mj_Longitude
    * * Display Name: Mj Longitude
    * * SQL Data Type: decimal(10, 6)
    */
    get __mj_Longitude(): number | null {
        return this.Get('__mj_Longitude');
    }
}


/**
 * MJ_BizApps_Referrals: Practice Areas - strongly typed entity sub-class
 * * Schema: __mj_BizAppsReferrals
 * * Base Table: PracticeArea
 * * Base View: vwPracticeAreas
 * * @description Hierarchical taxonomy of legal, accounting, or advisory practice areas.
 * * Primary Key: ID
 * @extends {BaseEntity}
 * @class
 * @public
 */
@RegisterClass(BaseEntity, 'MJ_BizApps_Referrals: Practice Areas')
export class mjBizAppsReferralsPracticeAreaEntity extends BaseEntity<mjBizAppsReferralsPracticeAreaEntityType> {
    /**
    * Loads the MJ_BizApps_Referrals: Practice Areas record from the database
    * @param ID: string - primary key value to load the MJ_BizApps_Referrals: Practice Areas record.
    * @param EntityRelationshipsToLoad - (optional) the relationships to load
    * @returns {Promise<boolean>} - true if successful, false otherwise
    * @public
    * @async
    * @memberof mjBizAppsReferralsPracticeAreaEntity
    * @method
    * @override
    */
    public async Load(ID: string, EntityRelationshipsToLoad?: string[]) : Promise<boolean> {
        const compositeKey: CompositeKey = new CompositeKey();
        compositeKey.KeyValuePairs.push({ FieldName: 'ID', Value: ID });
        return await super.InnerLoad(compositeKey, EntityRelationshipsToLoad);
    }

    /**
    * * Field Name: ID
    * * Display Name: ID
    * * SQL Data Type: uniqueidentifier
    * * Default Value: newsequentialid()
    */
    get ID(): string {
        return this.Get('ID');
    }
    set ID(value: string) {
        this.Set('ID', value);
    }

    /**
    * * Field Name: ParentID
    * * Display Name: Parent ID
    * * SQL Data Type: uniqueidentifier
    * * Related Entity/Foreign Key: MJ_BizApps_Referrals: Practice Areas (vwPracticeAreas.ID)
    */
    get ParentID(): string | null {
        return this.Get('ParentID');
    }
    set ParentID(value: string | null) {
        this.Set('ParentID', value);
    }

    /**
    * * Field Name: Name
    * * Display Name: Name
    * * SQL Data Type: nvarchar(150)
    */
    get Name(): string {
        return this.Get('Name');
    }
    set Name(value: string) {
        this.Set('Name', value);
    }

    /**
    * * Field Name: Code
    * * Display Name: Code
    * * SQL Data Type: nvarchar(50)
    */
    get Code(): string {
        return this.Get('Code');
    }
    set Code(value: string) {
        this.Set('Code', value);
    }

    /**
    * * Field Name: Category
    * * Display Name: Category
    * * SQL Data Type: nvarchar(100)
    */
    get Category(): string | null {
        return this.Get('Category');
    }
    set Category(value: string | null) {
        this.Set('Category', value);
    }

    /**
    * * Field Name: Description
    * * Display Name: Description
    * * SQL Data Type: nvarchar(MAX)
    */
    get Description(): string | null {
        return this.Get('Description');
    }
    set Description(value: string | null) {
        this.Set('Description', value);
    }

    /**
    * * Field Name: IconClass
    * * Display Name: Icon Class
    * * SQL Data Type: nvarchar(100)
    */
    get IconClass(): string | null {
        return this.Get('IconClass');
    }
    set IconClass(value: string | null) {
        this.Set('IconClass', value);
    }

    /**
    * * Field Name: DisplayRank
    * * Display Name: Display Rank
    * * SQL Data Type: int
    * * Default Value: 100
    */
    get DisplayRank(): number {
        return this.Get('DisplayRank');
    }
    set DisplayRank(value: number) {
        this.Set('DisplayRank', value);
    }

    /**
    * * Field Name: IsActive
    * * Display Name: Active
    * * SQL Data Type: bit
    * * Default Value: 1
    */
    get IsActive(): boolean {
        return this.Get('IsActive');
    }
    set IsActive(value: boolean) {
        this.Set('IsActive', value);
    }

    /**
    * * Field Name: __mj_CreatedAt
    * * Display Name: Created At
    * * SQL Data Type: datetimeoffset
    * * Default Value: getutcdate()
    */
    get __mj_CreatedAt(): Date {
        return this.Get('__mj_CreatedAt');
    }

    /**
    * * Field Name: __mj_UpdatedAt
    * * Display Name: Updated At
    * * SQL Data Type: datetimeoffset
    * * Default Value: getutcdate()
    */
    get __mj_UpdatedAt(): Date {
        return this.Get('__mj_UpdatedAt');
    }

    /**
    * * Field Name: Parent
    * * Display Name: Parent
    * * SQL Data Type: nvarchar(150)
    */
    get Parent(): string | null {
        return this.Get('Parent');
    }
}


/**
 * MJ_BizApps_Referrals: Professional Jurisdictions - strongly typed entity sub-class
 * * Schema: __mj_BizAppsReferrals
 * * Base Table: ProfessionalJurisdiction
 * * Base View: vwProfessionalJurisdictions
 * * @description Junction linking professionals to admitted jurisdictions and license standing.
 * * Primary Key: ID
 * @extends {BaseEntity}
 * @class
 * @public
 */
@RegisterClass(BaseEntity, 'MJ_BizApps_Referrals: Professional Jurisdictions')
export class mjBizAppsReferralsProfessionalJurisdictionEntity extends BaseEntity<mjBizAppsReferralsProfessionalJurisdictionEntityType> {
    /**
    * Loads the MJ_BizApps_Referrals: Professional Jurisdictions record from the database
    * @param ID: string - primary key value to load the MJ_BizApps_Referrals: Professional Jurisdictions record.
    * @param EntityRelationshipsToLoad - (optional) the relationships to load
    * @returns {Promise<boolean>} - true if successful, false otherwise
    * @public
    * @async
    * @memberof mjBizAppsReferralsProfessionalJurisdictionEntity
    * @method
    * @override
    */
    public async Load(ID: string, EntityRelationshipsToLoad?: string[]) : Promise<boolean> {
        const compositeKey: CompositeKey = new CompositeKey();
        compositeKey.KeyValuePairs.push({ FieldName: 'ID', Value: ID });
        return await super.InnerLoad(compositeKey, EntityRelationshipsToLoad);
    }

    /**
    * * Field Name: ID
    * * Display Name: ID
    * * SQL Data Type: uniqueidentifier
    * * Default Value: newsequentialid()
    */
    get ID(): string {
        return this.Get('ID');
    }
    set ID(value: string) {
        this.Set('ID', value);
    }

    /**
    * * Field Name: ProfessionalProfileID
    * * Display Name: Professional Profile
    * * SQL Data Type: uniqueidentifier
    * * Related Entity/Foreign Key: MJ_BizApps_Referrals: Professional Profiles (vwProfessionalProfiles.ID)
    */
    get ProfessionalProfileID(): string {
        return this.Get('ProfessionalProfileID');
    }
    set ProfessionalProfileID(value: string) {
        this.Set('ProfessionalProfileID', value);
    }

    /**
    * * Field Name: JurisdictionID
    * * Display Name: Jurisdiction ID
    * * SQL Data Type: uniqueidentifier
    * * Related Entity/Foreign Key: MJ_BizApps_Referrals: Jurisdictions (vwJurisdictions.ID)
    */
    get JurisdictionID(): string {
        return this.Get('JurisdictionID');
    }
    set JurisdictionID(value: string) {
        this.Set('JurisdictionID', value);
    }

    /**
    * * Field Name: LicenseNumber
    * * Display Name: License Number
    * * SQL Data Type: nvarchar(100)
    */
    get LicenseNumber(): string | null {
        return this.Get('LicenseNumber');
    }
    set LicenseNumber(value: string | null) {
        this.Set('LicenseNumber', value);
    }

    /**
    * * Field Name: AdmissionYear
    * * Display Name: Admission Year
    * * SQL Data Type: int
    */
    get AdmissionYear(): number | null {
        return this.Get('AdmissionYear');
    }
    set AdmissionYear(value: number | null) {
        this.Set('AdmissionYear', value);
    }

    /**
    * * Field Name: StandingStatus
    * * Display Name: Standing Status
    * * SQL Data Type: nvarchar(30)
    * * Default Value: GoodStanding
    * * Value List Type: List
    * * Possible Values 
    *   * GoodStanding
    *   * Inactive
    *   * ProHacVice
    *   * Suspended
    */
    get StandingStatus(): 'GoodStanding' | 'Inactive' | 'ProHacVice' | 'Suspended' {
        return this.Get('StandingStatus');
    }
    set StandingStatus(value: 'GoodStanding' | 'Inactive' | 'ProHacVice' | 'Suspended') {
        this.Set('StandingStatus', value);
    }

    /**
    * * Field Name: IsPrimary
    * * Display Name: Is Primary
    * * SQL Data Type: bit
    * * Default Value: 0
    */
    get IsPrimary(): boolean {
        return this.Get('IsPrimary');
    }
    set IsPrimary(value: boolean) {
        this.Set('IsPrimary', value);
    }

    /**
    * * Field Name: __mj_CreatedAt
    * * Display Name: Created At
    * * SQL Data Type: datetimeoffset
    * * Default Value: getutcdate()
    */
    get __mj_CreatedAt(): Date {
        return this.Get('__mj_CreatedAt');
    }

    /**
    * * Field Name: __mj_UpdatedAt
    * * Display Name: Updated At
    * * SQL Data Type: datetimeoffset
    * * Default Value: getutcdate()
    */
    get __mj_UpdatedAt(): Date {
        return this.Get('__mj_UpdatedAt');
    }

    /**
    * * Field Name: Jurisdiction
    * * Display Name: Jurisdiction
    * * SQL Data Type: nvarchar(150)
    */
    get Jurisdiction(): string | null {
        return this.Get('Jurisdiction');
    }
}


/**
 * MJ_BizApps_Referrals: Professional Practice Areas - strongly typed entity sub-class
 * * Schema: __mj_BizAppsReferrals
 * * Base Table: ProfessionalPracticeArea
 * * Base View: vwProfessionalPracticeAreas
 * * @description Junction linking professionals to practice areas with proficiency metadata.
 * * Primary Key: ID
 * @extends {BaseEntity}
 * @class
 * @public
 */
@RegisterClass(BaseEntity, 'MJ_BizApps_Referrals: Professional Practice Areas')
export class mjBizAppsReferralsProfessionalPracticeAreaEntity extends BaseEntity<mjBizAppsReferralsProfessionalPracticeAreaEntityType> {
    /**
    * Loads the MJ_BizApps_Referrals: Professional Practice Areas record from the database
    * @param ID: string - primary key value to load the MJ_BizApps_Referrals: Professional Practice Areas record.
    * @param EntityRelationshipsToLoad - (optional) the relationships to load
    * @returns {Promise<boolean>} - true if successful, false otherwise
    * @public
    * @async
    * @memberof mjBizAppsReferralsProfessionalPracticeAreaEntity
    * @method
    * @override
    */
    public async Load(ID: string, EntityRelationshipsToLoad?: string[]) : Promise<boolean> {
        const compositeKey: CompositeKey = new CompositeKey();
        compositeKey.KeyValuePairs.push({ FieldName: 'ID', Value: ID });
        return await super.InnerLoad(compositeKey, EntityRelationshipsToLoad);
    }

    /**
    * Validate() method override for MJ_BizApps_Referrals: Professional Practice Areas entity. This is an auto-generated method that invokes the generated validators for this entity for the following fields:
    * * YearsInPractice: Years in practice cannot be negative; it must be zero or greater.
    * @public
    * @method
    * @override
    */
    public override Validate(): ValidationResult {
        const result = super.Validate();
        this.ValidateYearsInPracticeNonNegative(result);
        result.Success = result.Success && (result.Errors.length === 0);

        return result;
    }

    /**
    * Years in practice cannot be negative; it must be zero or greater.
    * @param result - the ValidationResult object to add any errors or warnings to
    * @public
    * @method
    */
    public ValidateYearsInPracticeNonNegative(result: ValidationResult) {
    	if (this.YearsInPractice != null && this.YearsInPractice < 0) {
    		result.Errors.push(new ValidationErrorInfo(
    			"YearsInPractice",
    			"Years in practice must be zero or greater.",
    			this.YearsInPractice,
    			ValidationErrorType.Failure
    		));
    	}
    }

    /**
    * * Field Name: ID
    * * Display Name: ID
    * * SQL Data Type: uniqueidentifier
    * * Default Value: newsequentialid()
    */
    get ID(): string {
        return this.Get('ID');
    }
    set ID(value: string) {
        this.Set('ID', value);
    }

    /**
    * * Field Name: ProfessionalProfileID
    * * Display Name: Professional Profile
    * * SQL Data Type: uniqueidentifier
    * * Related Entity/Foreign Key: MJ_BizApps_Referrals: Professional Profiles (vwProfessionalProfiles.ID)
    */
    get ProfessionalProfileID(): string {
        return this.Get('ProfessionalProfileID');
    }
    set ProfessionalProfileID(value: string) {
        this.Set('ProfessionalProfileID', value);
    }

    /**
    * * Field Name: PracticeAreaID
    * * Display Name: Practice Area
    * * SQL Data Type: uniqueidentifier
    * * Related Entity/Foreign Key: MJ_BizApps_Referrals: Practice Areas (vwPracticeAreas.ID)
    */
    get PracticeAreaID(): string {
        return this.Get('PracticeAreaID');
    }
    set PracticeAreaID(value: string) {
        this.Set('PracticeAreaID', value);
    }

    /**
    * * Field Name: ProficiencyLevel
    * * Display Name: Proficiency Level
    * * SQL Data Type: nvarchar(30)
    * * Default Value: Standard
    * * Value List Type: List
    * * Possible Values 
    *   * Emerging
    *   * Primary
    *   * Standard
    */
    get ProficiencyLevel(): 'Emerging' | 'Primary' | 'Standard' {
        return this.Get('ProficiencyLevel');
    }
    set ProficiencyLevel(value: 'Emerging' | 'Primary' | 'Standard') {
        this.Set('ProficiencyLevel', value);
    }

    /**
    * * Field Name: YearsInPractice
    * * Display Name: Years In Practice
    * * SQL Data Type: int
    * * Default Value: 0
    */
    get YearsInPractice(): number {
        return this.Get('YearsInPractice');
    }
    set YearsInPractice(value: number) {
        this.Set('YearsInPractice', value);
    }

    /**
    * * Field Name: IsPrimary
    * * Display Name: Is Primary
    * * SQL Data Type: bit
    * * Default Value: 0
    */
    get IsPrimary(): boolean {
        return this.Get('IsPrimary');
    }
    set IsPrimary(value: boolean) {
        this.Set('IsPrimary', value);
    }

    /**
    * * Field Name: __mj_CreatedAt
    * * Display Name: Created At
    * * SQL Data Type: datetimeoffset
    * * Default Value: getutcdate()
    */
    get __mj_CreatedAt(): Date {
        return this.Get('__mj_CreatedAt');
    }

    /**
    * * Field Name: __mj_UpdatedAt
    * * Display Name: Updated At
    * * SQL Data Type: datetimeoffset
    * * Default Value: getutcdate()
    */
    get __mj_UpdatedAt(): Date {
        return this.Get('__mj_UpdatedAt');
    }

    /**
    * * Field Name: PracticeArea
    * * Display Name: Practice Area
    * * SQL Data Type: nvarchar(150)
    */
    get PracticeArea(): string | null {
        return this.Get('PracticeArea');
    }
}


/**
 * MJ_BizApps_Referrals: Professional Profiles - strongly typed entity sub-class
 * * Schema: __mj_BizAppsReferrals
 * * Base Table: ProfessionalProfile
 * * Base View: vwProfessionalProfiles
 * * @description Verified member directory profile for credentialed professionals.
 * * Primary Key: ID
 * @extends {BaseEntity}
 * @class
 * @public
 */
@RegisterClass(BaseEntity, 'MJ_BizApps_Referrals: Professional Profiles')
export class mjBizAppsReferralsProfessionalProfileEntity extends BaseEntity<mjBizAppsReferralsProfessionalProfileEntityType> {
    /**
    * Loads the MJ_BizApps_Referrals: Professional Profiles record from the database
    * @param ID: string - primary key value to load the MJ_BizApps_Referrals: Professional Profiles record.
    * @param EntityRelationshipsToLoad - (optional) the relationships to load
    * @returns {Promise<boolean>} - true if successful, false otherwise
    * @public
    * @async
    * @memberof mjBizAppsReferralsProfessionalProfileEntity
    * @method
    * @override
    */
    public async Load(ID: string, EntityRelationshipsToLoad?: string[]) : Promise<boolean> {
        const compositeKey: CompositeKey = new CompositeKey();
        compositeKey.KeyValuePairs.push({ FieldName: 'ID', Value: ID });
        return await super.InnerLoad(compositeKey, EntityRelationshipsToLoad);
    }

    /**
    * Validate() method override for MJ_BizApps_Referrals: Professional Profiles entity. This is an auto-generated method that invokes the generated validators for this entity for the following fields:
    * * ActiveReferralCount: Active referral count cannot be negative.
    * * MaxConcurrentReferrals: Maximum concurrent referrals must be greater than zero.
    * * YearsExperience: Years of experience cannot be negative.
    * * Table-Level: Maximum hourly rate must be greater than or equal to the minimum hourly rate when both rates are provided.
    * @public
    * @method
    * @override
    */
    public override Validate(): ValidationResult {
        const result = super.Validate();
        this.ValidateActiveReferralCountNonNegative(result);
        this.ValidateMaxConcurrentReferralsGreaterThanZero(result);
        this.ValidateYearsExperienceNonNegative(result);
        this.ValidateHourlyRateMaxGreaterThanOrEqualToMin(result);
        result.Success = result.Success && (result.Errors.length === 0);

        return result;
    }

    /**
    * Active referral count cannot be negative.
    * @param result - the ValidationResult object to add any errors or warnings to
    * @public
    * @method
    */
    public ValidateActiveReferralCountNonNegative(result: ValidationResult) {
    	if (this.ActiveReferralCount != null && this.ActiveReferralCount < 0) {
    		result.Errors.push(new ValidationErrorInfo(
    			"ActiveReferralCount",
    			"Active referral count cannot be negative.",
    			this.ActiveReferralCount,
    			ValidationErrorType.Failure
    		));
    	}
    }

    /**
    * Maximum concurrent referrals must be greater than zero.
    * @param result - the ValidationResult object to add any errors or warnings to
    * @public
    * @method
    */
    public ValidateMaxConcurrentReferralsGreaterThanZero(result: ValidationResult) {
    	if (this.MaxConcurrentReferrals <= 0) {
    		result.Errors.push(new ValidationErrorInfo(
    			"MaxConcurrentReferrals",
    			"Maximum concurrent referrals must be greater than 0.",
    			this.MaxConcurrentReferrals,
    			ValidationErrorType.Failure
    		));
    	}
    }

    /**
    * Years of experience cannot be negative.
    * @param result - the ValidationResult object to add any errors or warnings to
    * @public
    * @method
    */
    public ValidateYearsExperienceNonNegative(result: ValidationResult) {
    	if (this.YearsExperience != null && this.YearsExperience < 0) {
    		result.Errors.push(new ValidationErrorInfo(
    			"YearsExperience",
    			"Years of experience must be greater than or equal to 0.",
    			this.YearsExperience,
    			ValidationErrorType.Failure
    		));
    	}
    }

    /**
    * Maximum hourly rate must be greater than or equal to the minimum hourly rate when both rates are provided.
    * @param result - the ValidationResult object to add any errors or warnings to
    * @public
    * @method
    */
    public ValidateHourlyRateMaxGreaterThanOrEqualToMin(result: ValidationResult): void {
    	if (this.HourlyRateMin != null && this.HourlyRateMax != null && this.HourlyRateMax < this.HourlyRateMin) {
    		result.Errors.push(new ValidationErrorInfo(
    			"HourlyRateMax",
    			"Maximum hourly rate must be greater than or equal to the minimum hourly rate.",
    			this.HourlyRateMax,
    			ValidationErrorType.Failure
    		));
    	}
    }

    /**
    * * Field Name: ID
    * * Display Name: ID
    * * SQL Data Type: uniqueidentifier
    * * Default Value: newsequentialid()
    */
    get ID(): string {
        return this.Get('ID');
    }
    set ID(value: string) {
        this.Set('ID', value);
    }

    /**
    * * Field Name: PersonID
    * * Display Name: Person
    * * SQL Data Type: uniqueidentifier
    * * Related Entity/Foreign Key: MJ_BizApps_Common: People (vwPeople.ID)
    */
    get PersonID(): string | null {
        return this.Get('PersonID');
    }
    set PersonID(value: string | null) {
        this.Set('PersonID', value);
    }

    /**
    * * Field Name: OrganizationID
    * * Display Name: Organization
    * * SQL Data Type: uniqueidentifier
    * * Related Entity/Foreign Key: MJ_BizApps_Common: Organizations (vwOrganizations.ID)
    */
    get OrganizationID(): string | null {
        return this.Get('OrganizationID');
    }
    set OrganizationID(value: string | null) {
        this.Set('OrganizationID', value);
    }

    /**
    * * Field Name: UserID
    * * Display Name: User
    * * SQL Data Type: uniqueidentifier
    * * Related Entity/Foreign Key: MJ: Users (vwUsers.ID)
    */
    get UserID(): string | null {
        return this.Get('UserID');
    }
    set UserID(value: string | null) {
        this.Set('UserID', value);
    }

    /**
    * * Field Name: DisplayName
    * * Display Name: Display Name
    * * SQL Data Type: nvarchar(200)
    */
    get DisplayName(): string {
        return this.Get('DisplayName');
    }
    set DisplayName(value: string) {
        this.Set('DisplayName', value);
    }

    /**
    * * Field Name: FirmName
    * * Display Name: Firm Name
    * * SQL Data Type: nvarchar(200)
    */
    get FirmName(): string | null {
        return this.Get('FirmName');
    }
    set FirmName(value: string | null) {
        this.Set('FirmName', value);
    }

    /**
    * * Field Name: Email
    * * Display Name: Email
    * * SQL Data Type: nvarchar(255)
    */
    get Email(): string {
        return this.Get('Email');
    }
    set Email(value: string) {
        this.Set('Email', value);
    }

    /**
    * * Field Name: Phone
    * * Display Name: Phone
    * * SQL Data Type: nvarchar(50)
    */
    get Phone(): string | null {
        return this.Get('Phone');
    }
    set Phone(value: string | null) {
        this.Set('Phone', value);
    }

    /**
    * * Field Name: LicenseNumber
    * * Display Name: License Number
    * * SQL Data Type: nvarchar(100)
    */
    get LicenseNumber(): string | null {
        return this.Get('LicenseNumber');
    }
    set LicenseNumber(value: string | null) {
        this.Set('LicenseNumber', value);
    }

    /**
    * * Field Name: VerificationStatus
    * * Display Name: Verification Status
    * * SQL Data Type: nvarchar(30)
    * * Default Value: Pending
    * * Value List Type: List
    * * Possible Values 
    *   * Expired
    *   * Pending
    *   * Suspended
    *   * Verified
    */
    get VerificationStatus(): 'Expired' | 'Pending' | 'Suspended' | 'Verified' {
        return this.Get('VerificationStatus');
    }
    set VerificationStatus(value: 'Expired' | 'Pending' | 'Suspended' | 'Verified') {
        this.Set('VerificationStatus', value);
    }

    /**
    * * Field Name: AvailabilityStatus
    * * Display Name: Availability Status
    * * SQL Data Type: nvarchar(30)
    * * Default Value: Available
    * * Value List Type: List
    * * Possible Values 
    *   * Available
    *   * Limited
    *   * OnLeave
    *   * Unavailable
    */
    get AvailabilityStatus(): 'Available' | 'Limited' | 'OnLeave' | 'Unavailable' {
        return this.Get('AvailabilityStatus');
    }
    set AvailabilityStatus(value: 'Available' | 'Limited' | 'OnLeave' | 'Unavailable') {
        this.Set('AvailabilityStatus', value);
    }

    /**
    * * Field Name: Bio
    * * Display Name: Bio
    * * SQL Data Type: nvarchar(MAX)
    */
    get Bio(): string | null {
        return this.Get('Bio');
    }
    set Bio(value: string | null) {
        this.Set('Bio', value);
    }

    /**
    * * Field Name: YearsExperience
    * * Display Name: Years of Experience
    * * SQL Data Type: int
    * * Default Value: 0
    */
    get YearsExperience(): number {
        return this.Get('YearsExperience');
    }
    set YearsExperience(value: number) {
        this.Set('YearsExperience', value);
    }

    /**
    * * Field Name: Languages
    * * Display Name: Languages
    * * SQL Data Type: nvarchar(255)
    * * Default Value: English
    */
    get Languages(): string | null {
        return this.Get('Languages');
    }
    set Languages(value: string | null) {
        this.Set('Languages', value);
    }

    /**
    * * Field Name: HourlyRateMin
    * * Display Name: Minimum Hourly Rate
    * * SQL Data Type: decimal(10, 2)
    */
    get HourlyRateMin(): number | null {
        return this.Get('HourlyRateMin');
    }
    set HourlyRateMin(value: number | null) {
        this.Set('HourlyRateMin', value);
    }

    /**
    * * Field Name: HourlyRateMax
    * * Display Name: Maximum Hourly Rate
    * * SQL Data Type: decimal(10, 2)
    */
    get HourlyRateMax(): number | null {
        return this.Get('HourlyRateMax');
    }
    set HourlyRateMax(value: number | null) {
        this.Set('HourlyRateMax', value);
    }

    /**
    * * Field Name: AcceptsProBono
    * * Display Name: Accepts Pro Bono
    * * SQL Data Type: bit
    * * Default Value: 0
    */
    get AcceptsProBono(): boolean {
        return this.Get('AcceptsProBono');
    }
    set AcceptsProBono(value: boolean) {
        this.Set('AcceptsProBono', value);
    }

    /**
    * * Field Name: AcceptsContingency
    * * Display Name: Accepts Contingency
    * * SQL Data Type: bit
    * * Default Value: 0
    */
    get AcceptsContingency(): boolean {
        return this.Get('AcceptsContingency');
    }
    set AcceptsContingency(value: boolean) {
        this.Set('AcceptsContingency', value);
    }

    /**
    * * Field Name: ActiveReferralCount
    * * Display Name: Active Referral Count
    * * SQL Data Type: int
    * * Default Value: 0
    */
    get ActiveReferralCount(): number {
        return this.Get('ActiveReferralCount');
    }
    set ActiveReferralCount(value: number) {
        this.Set('ActiveReferralCount', value);
    }

    /**
    * * Field Name: MaxConcurrentReferrals
    * * Display Name: Max Concurrent Referrals
    * * SQL Data Type: int
    * * Default Value: 10
    */
    get MaxConcurrentReferrals(): number {
        return this.Get('MaxConcurrentReferrals');
    }
    set MaxConcurrentReferrals(value: number) {
        this.Set('MaxConcurrentReferrals', value);
    }

    /**
    * * Field Name: AverageResponseHours
    * * Display Name: Average Response Hours
    * * SQL Data Type: decimal(6, 2)
    */
    get AverageResponseHours(): number | null {
        return this.Get('AverageResponseHours');
    }
    set AverageResponseHours(value: number | null) {
        this.Set('AverageResponseHours', value);
    }

    /**
    * * Field Name: AverageRating
    * * Display Name: Average Rating
    * * SQL Data Type: decimal(3, 2)
    */
    get AverageRating(): number | null {
        return this.Get('AverageRating');
    }
    set AverageRating(value: number | null) {
        this.Set('AverageRating', value);
    }

    /**
    * * Field Name: TotalAcceptedCount
    * * Display Name: Total Accepted Count
    * * SQL Data Type: int
    * * Default Value: 0
    */
    get TotalAcceptedCount(): number {
        return this.Get('TotalAcceptedCount');
    }
    set TotalAcceptedCount(value: number) {
        this.Set('TotalAcceptedCount', value);
    }

    /**
    * * Field Name: TotalCompletedCount
    * * Display Name: Total Completed Count
    * * SQL Data Type: int
    * * Default Value: 0
    */
    get TotalCompletedCount(): number {
        return this.Get('TotalCompletedCount');
    }
    set TotalCompletedCount(value: number) {
        this.Set('TotalCompletedCount', value);
    }

    /**
    * * Field Name: IsActive
    * * Display Name: Active
    * * SQL Data Type: bit
    * * Default Value: 1
    */
    get IsActive(): boolean {
        return this.Get('IsActive');
    }
    set IsActive(value: boolean) {
        this.Set('IsActive', value);
    }

    /**
    * * Field Name: ReadinessScore
    * * Display Name: Readiness Score
    * * SQL Data Type: decimal(5, 2)
    * * Default Value: 100.00
    */
    get ReadinessScore(): number {
        return this.Get('ReadinessScore');
    }
    set ReadinessScore(value: number) {
        this.Set('ReadinessScore', value);
    }

    /**
    * * Field Name: ReciprocityIndex
    * * Display Name: Reciprocity Index
    * * SQL Data Type: decimal(5, 2)
    */
    get ReciprocityIndex(): number | null {
        return this.Get('ReciprocityIndex');
    }
    set ReciprocityIndex(value: number | null) {
        this.Set('ReciprocityIndex', value);
    }

    /**
    * * Field Name: ReadinessComputedAt
    * * Display Name: Readiness Computed At
    * * SQL Data Type: datetimeoffset
    */
    get ReadinessComputedAt(): Date | null {
        return this.Get('ReadinessComputedAt');
    }
    set ReadinessComputedAt(value: Date | null) {
        this.Set('ReadinessComputedAt', value);
    }

    /**
    * * Field Name: __mj_CreatedAt
    * * Display Name: Created At
    * * SQL Data Type: datetimeoffset
    * * Default Value: getutcdate()
    */
    get __mj_CreatedAt(): Date {
        return this.Get('__mj_CreatedAt');
    }

    /**
    * * Field Name: __mj_UpdatedAt
    * * Display Name: Updated At
    * * SQL Data Type: datetimeoffset
    * * Default Value: getutcdate()
    */
    get __mj_UpdatedAt(): Date {
        return this.Get('__mj_UpdatedAt');
    }

    /**
    * * Field Name: Person
    * * Display Name: Person Name
    * * SQL Data Type: nvarchar(250)
    */
    get Person(): string | null {
        return this.Get('Person');
    }

    /**
    * * Field Name: Organization
    * * Display Name: Organization Name
    * * SQL Data Type: nvarchar(255)
    */
    get Organization(): string | null {
        return this.Get('Organization');
    }

    /**
    * * Field Name: User
    * * Display Name: User Name
    * * SQL Data Type: nvarchar(100)
    */
    get User(): string | null {
        return this.Get('User');
    }
}


/**
 * MJ_BizApps_Referrals: Referral Assignments - strongly typed entity sub-class
 * * Schema: __mj_BizAppsReferrals
 * * Base Table: ReferralAssignment
 * * Base View: vwReferralAssignments
 * * @description Sequential cascade assignment offering a referral request to a matched professional.
 * * Primary Key: ID
 * @extends {BaseEntity}
 * @class
 * @public
 */
@RegisterClass(BaseEntity, 'MJ_BizApps_Referrals: Referral Assignments')
export class mjBizAppsReferralsReferralAssignmentEntity extends BaseEntity<mjBizAppsReferralsReferralAssignmentEntityType> {
    /**
    * Loads the MJ_BizApps_Referrals: Referral Assignments record from the database
    * @param ID: string - primary key value to load the MJ_BizApps_Referrals: Referral Assignments record.
    * @param EntityRelationshipsToLoad - (optional) the relationships to load
    * @returns {Promise<boolean>} - true if successful, false otherwise
    * @public
    * @async
    * @memberof mjBizAppsReferralsReferralAssignmentEntity
    * @method
    * @override
    */
    public async Load(ID: string, EntityRelationshipsToLoad?: string[]) : Promise<boolean> {
        const compositeKey: CompositeKey = new CompositeKey();
        compositeKey.KeyValuePairs.push({ FieldName: 'ID', Value: ID });
        return await super.InnerLoad(compositeKey, EntityRelationshipsToLoad);
    }

    /**
    * Validate() method override for MJ_BizApps_Referrals: Referral Assignments entity. This is an auto-generated method that invokes the generated validators for this entity for the following fields:
    * * CascadeOrder: Cascade order must be a positive number of at least 1 to ensure a valid processing sequence
    * @public
    * @method
    * @override
    */
    public override Validate(): ValidationResult {
        const result = super.Validate();
        this.ValidateCascadeOrderMinimum(result);
        result.Success = result.Success && (result.Errors.length === 0);

        return result;
    }

    /**
    * Cascade order must be a positive number of at least 1 to ensure a valid processing sequence
    * @param result - the ValidationResult object to add any errors or warnings to
    * @public
    * @method
    */
    public ValidateCascadeOrderMinimum(result: ValidationResult) {
    	if (this.CascadeOrder != null && this.CascadeOrder < 1) {
    		result.Errors.push(new ValidationErrorInfo(
    			"CascadeOrder",
    			"Cascade order must be at least 1.",
    			this.CascadeOrder,
    			ValidationErrorType.Failure
    		));
    	}
    }

    /**
    * * Field Name: ID
    * * Display Name: ID
    * * SQL Data Type: uniqueidentifier
    * * Default Value: newsequentialid()
    */
    get ID(): string {
        return this.Get('ID');
    }
    set ID(value: string) {
        this.Set('ID', value);
    }

    /**
    * * Field Name: ReferralRequestID
    * * Display Name: Referral Request
    * * SQL Data Type: uniqueidentifier
    * * Related Entity/Foreign Key: MJ_BizApps_Referrals: Referral Requests (vwReferralRequests.ID)
    */
    get ReferralRequestID(): string {
        return this.Get('ReferralRequestID');
    }
    set ReferralRequestID(value: string) {
        this.Set('ReferralRequestID', value);
    }

    /**
    * * Field Name: ProfessionalProfileID
    * * Display Name: Professional Profile
    * * SQL Data Type: uniqueidentifier
    * * Related Entity/Foreign Key: MJ_BizApps_Referrals: Professional Profiles (vwProfessionalProfiles.ID)
    */
    get ProfessionalProfileID(): string {
        return this.Get('ProfessionalProfileID');
    }
    set ProfessionalProfileID(value: string) {
        this.Set('ProfessionalProfileID', value);
    }

    /**
    * * Field Name: CascadeOrder
    * * Display Name: Cascade Order
    * * SQL Data Type: int
    * * Default Value: 1
    */
    get CascadeOrder(): number {
        return this.Get('CascadeOrder');
    }
    set CascadeOrder(value: number) {
        this.Set('CascadeOrder', value);
    }

    /**
    * * Field Name: MatchScore
    * * Display Name: Match Score
    * * SQL Data Type: decimal(5, 2)
    * * Default Value: 0.00
    */
    get MatchScore(): number {
        return this.Get('MatchScore');
    }
    set MatchScore(value: number) {
        this.Set('MatchScore', value);
    }

    /**
    * * Field Name: ScoreBreakdownJSON
    * * Display Name: Score Breakdown
    * * SQL Data Type: nvarchar(MAX)
    */
    get ScoreBreakdownJSON(): string | null {
        return this.Get('ScoreBreakdownJSON');
    }
    set ScoreBreakdownJSON(value: string | null) {
        this.Set('ScoreBreakdownJSON', value);
    }

    /**
    * * Field Name: ConflictStatus
    * * Display Name: Conflict Status
    * * SQL Data Type: nvarchar(30)
    * * Default Value: Pending
    * * Value List Type: List
    * * Possible Values 
    *   * Cleared
    *   * ConflictFound
    *   * Pending
    *   * Waived
    */
    get ConflictStatus(): 'Cleared' | 'ConflictFound' | 'Pending' | 'Waived' {
        return this.Get('ConflictStatus');
    }
    set ConflictStatus(value: 'Cleared' | 'ConflictFound' | 'Pending' | 'Waived') {
        this.Set('ConflictStatus', value);
    }

    /**
    * * Field Name: ConflictReason
    * * Display Name: Conflict Reason
    * * SQL Data Type: nvarchar(MAX)
    */
    get ConflictReason(): string | null {
        return this.Get('ConflictReason');
    }
    set ConflictReason(value: string | null) {
        this.Set('ConflictReason', value);
    }

    /**
    * * Field Name: Status
    * * Display Name: Status
    * * SQL Data Type: nvarchar(30)
    * * Default Value: Queued
    * * Value List Type: List
    * * Possible Values 
    *   * Accepted
    *   * ConflictRejected
    *   * Declined
    *   * Expired
    *   * Offered
    *   * Queued
    *   * Withdrawn
    */
    get Status(): 'Accepted' | 'Completed' | 'ConflictRejected' | 'Declined' | 'Expired' | 'InProgress' | 'Offered' | 'Queued' | 'Withdrawn' {
        return this.Get('Status');
    }
    set Status(value: 'Accepted' | 'Completed' | 'ConflictRejected' | 'Declined' | 'Expired' | 'InProgress' | 'Offered' | 'Queued' | 'Withdrawn') {
        this.Set('Status', value);
    }

    /**
    * * Field Name: OfferedAt
    * * Display Name: Offered At
    * * SQL Data Type: datetimeoffset
    */
    get OfferedAt(): Date | null {
        return this.Get('OfferedAt');
    }
    set OfferedAt(value: Date | null) {
        this.Set('OfferedAt', value);
    }

    /**
    * * Field Name: SLADeadlineAt
    * * Display Name: SLA Deadline
    * * SQL Data Type: datetimeoffset
    */
    get SLADeadlineAt(): Date | null {
        return this.Get('SLADeadlineAt');
    }
    set SLADeadlineAt(value: Date | null) {
        this.Set('SLADeadlineAt', value);
    }

    /**
    * * Field Name: RespondedAt
    * * Display Name: Responded At
    * * SQL Data Type: datetimeoffset
    */
    get RespondedAt(): Date | null {
        return this.Get('RespondedAt');
    }
    set RespondedAt(value: Date | null) {
        this.Set('RespondedAt', value);
    }

    /**
    * * Field Name: ResponseNotes
    * * Display Name: Response Notes
    * * SQL Data Type: nvarchar(MAX)
    */
    get ResponseNotes(): string | null {
        return this.Get('ResponseNotes');
    }
    set ResponseNotes(value: string | null) {
        this.Set('ResponseNotes', value);
    }

    /**
    * * Field Name: DeclineReason
    * * Display Name: Decline Reason
    * * SQL Data Type: nvarchar(255)
    */
    get DeclineReason(): string | null {
        return this.Get('DeclineReason');
    }
    set DeclineReason(value: string | null) {
        this.Set('DeclineReason', value);
    }

    /**
    * * Field Name: SLAWarningSentAt
    * * Display Name: SLA Warning Sent At
    * * SQL Data Type: datetimeoffset
    */
    get SLAWarningSentAt(): Date | null {
        return this.Get('SLAWarningSentAt');
    }
    set SLAWarningSentAt(value: Date | null) {
        this.Set('SLAWarningSentAt', value);
    }

    /**
    * * Field Name: ResponseHours
    * * Display Name: Response Hours
    * * SQL Data Type: decimal(6, 2)
    */
    get ResponseHours(): number | null {
        return this.Get('ResponseHours');
    }
    set ResponseHours(value: number | null) {
        this.Set('ResponseHours', value);
    }

    /**
    * * Field Name: CompletedAt
    * * Display Name: Completed At
    * * SQL Data Type: datetimeoffset
    */
    get CompletedAt(): Date | null {
        return this.Get('CompletedAt');
    }
    set CompletedAt(value: Date | null) {
        this.Set('CompletedAt', value);
    }

    /**
    * * Field Name: AIRationaleJSON
    * * Display Name: AI Rationale JSON
    * * SQL Data Type: nvarchar(MAX)
    */
    get AIRationaleJSON(): string | null {
        return this.Get('AIRationaleJSON');
    }
    set AIRationaleJSON(value: string | null) {
        this.Set('AIRationaleJSON', value);
    }

    /**
    * * Field Name: __mj_CreatedAt
    * * Display Name: Created At
    * * SQL Data Type: datetimeoffset
    * * Default Value: getutcdate()
    */
    get __mj_CreatedAt(): Date {
        return this.Get('__mj_CreatedAt');
    }

    /**
    * * Field Name: __mj_UpdatedAt
    * * Display Name: Updated At
    * * SQL Data Type: datetimeoffset
    * * Default Value: getutcdate()
    */
    get __mj_UpdatedAt(): Date {
        return this.Get('__mj_UpdatedAt');
    }
}


/**
 * MJ_BizApps_Referrals: Referral Feedbacks - strongly typed entity sub-class
 * * Schema: __mj_BizAppsReferrals
 * * Base Table: ReferralFeedback
 * * Base View: vwReferralFeedbacks
 * * @description Post-referral feedback, rating, and engagement outcome telemetry.
 * * Primary Key: ID
 * @extends {BaseEntity}
 * @class
 * @public
 */
@RegisterClass(BaseEntity, 'MJ_BizApps_Referrals: Referral Feedbacks')
export class mjBizAppsReferralsReferralFeedbackEntity extends BaseEntity<mjBizAppsReferralsReferralFeedbackEntityType> {
    /**
    * Loads the MJ_BizApps_Referrals: Referral Feedbacks record from the database
    * @param ID: string - primary key value to load the MJ_BizApps_Referrals: Referral Feedbacks record.
    * @param EntityRelationshipsToLoad - (optional) the relationships to load
    * @returns {Promise<boolean>} - true if successful, false otherwise
    * @public
    * @async
    * @memberof mjBizAppsReferralsReferralFeedbackEntity
    * @method
    * @override
    */
    public async Load(ID: string, EntityRelationshipsToLoad?: string[]) : Promise<boolean> {
        const compositeKey: CompositeKey = new CompositeKey();
        compositeKey.KeyValuePairs.push({ FieldName: 'ID', Value: ID });
        return await super.InnerLoad(compositeKey, EntityRelationshipsToLoad);
    }

    /**
    * Validate() method override for MJ_BizApps_Referrals: Referral Feedbacks entity. This is an auto-generated method that invokes the generated validators for this entity for the following fields:
    * * Rating: Rating must be an integer between 1 and 5 inclusive.
    * @public
    * @method
    * @override
    */
    public override Validate(): ValidationResult {
        const result = super.Validate();
        this.ValidateRatingRange(result);
        result.Success = result.Success && (result.Errors.length === 0);

        return result;
    }

    /**
    * Rating must be an integer between 1 and 5 inclusive.
    * @param result - the ValidationResult object to add any errors or warnings to
    * @public
    * @method
    */
    public ValidateRatingRange(result: ValidationResult) {
    	if (this.Rating != null && (this.Rating < 1 || this.Rating > 5)) {
    		result.Errors.push(new ValidationErrorInfo(
    			"Rating",
    			"Rating must be between 1 and 5.",
    			this.Rating,
    			ValidationErrorType.Failure
    		));
    	}
    }

    /**
    * * Field Name: ID
    * * Display Name: ID
    * * SQL Data Type: uniqueidentifier
    * * Default Value: newsequentialid()
    */
    get ID(): string {
        return this.Get('ID');
    }
    set ID(value: string) {
        this.Set('ID', value);
    }

    /**
    * * Field Name: ReferralRequestID
    * * Display Name: Referral Request
    * * SQL Data Type: uniqueidentifier
    * * Related Entity/Foreign Key: MJ_BizApps_Referrals: Referral Requests (vwReferralRequests.ID)
    */
    get ReferralRequestID(): string {
        return this.Get('ReferralRequestID');
    }
    set ReferralRequestID(value: string) {
        this.Set('ReferralRequestID', value);
    }

    /**
    * * Field Name: ReferralAssignmentID
    * * Display Name: Referral Assignment
    * * SQL Data Type: uniqueidentifier
    * * Related Entity/Foreign Key: MJ_BizApps_Referrals: Referral Assignments (vwReferralAssignments.ID)
    */
    get ReferralAssignmentID(): string | null {
        return this.Get('ReferralAssignmentID');
    }
    set ReferralAssignmentID(value: string | null) {
        this.Set('ReferralAssignmentID', value);
    }

    /**
    * * Field Name: ProfessionalProfileID
    * * Display Name: Professional Profile
    * * SQL Data Type: uniqueidentifier
    * * Related Entity/Foreign Key: MJ_BizApps_Referrals: Professional Profiles (vwProfessionalProfiles.ID)
    */
    get ProfessionalProfileID(): string {
        return this.Get('ProfessionalProfileID');
    }
    set ProfessionalProfileID(value: string) {
        this.Set('ProfessionalProfileID', value);
    }

    /**
    * * Field Name: SubmittedByType
    * * Display Name: Submitted By Type
    * * SQL Data Type: nvarchar(20)
    * * Default Value: Seeker
    * * Value List Type: List
    * * Possible Values 
    *   * Operator
    *   * Professional
    *   * Seeker
    */
    get SubmittedByType(): 'Operator' | 'Professional' | 'Seeker' {
        return this.Get('SubmittedByType');
    }
    set SubmittedByType(value: 'Operator' | 'Professional' | 'Seeker') {
        this.Set('SubmittedByType', value);
    }

    /**
    * * Field Name: Rating
    * * Display Name: Rating
    * * SQL Data Type: int
    */
    get Rating(): number {
        return this.Get('Rating');
    }
    set Rating(value: number) {
        this.Set('Rating', value);
    }

    /**
    * * Field Name: OutcomeStatus
    * * Display Name: Outcome Status
    * * SQL Data Type: nvarchar(30)
    * * Default Value: Engaged
    * * Value List Type: List
    * * Possible Values 
    *   * ConsultedOnly
    *   * Engaged
    *   * NoResponse
    *   * NotAFit
    *   * Resolved
    */
    get OutcomeStatus(): 'ConsultedOnly' | 'Engaged' | 'NoResponse' | 'NotAFit' | 'Resolved' {
        return this.Get('OutcomeStatus');
    }
    set OutcomeStatus(value: 'ConsultedOnly' | 'Engaged' | 'NoResponse' | 'NotAFit' | 'Resolved') {
        this.Set('OutcomeStatus', value);
    }

    /**
    * * Field Name: Comments
    * * Display Name: Comments
    * * SQL Data Type: nvarchar(MAX)
    */
    get Comments(): string | null {
        return this.Get('Comments');
    }
    set Comments(value: string | null) {
        this.Set('Comments', value);
    }

    /**
    * * Field Name: SubmittedAt
    * * Display Name: Submitted At
    * * SQL Data Type: datetimeoffset
    * * Default Value: sysdatetimeoffset()
    */
    get SubmittedAt(): Date {
        return this.Get('SubmittedAt');
    }
    set SubmittedAt(value: Date) {
        this.Set('SubmittedAt', value);
    }

    /**
    * * Field Name: __mj_CreatedAt
    * * Display Name: Created At
    * * SQL Data Type: datetimeoffset
    * * Default Value: getutcdate()
    */
    get __mj_CreatedAt(): Date {
        return this.Get('__mj_CreatedAt');
    }

    /**
    * * Field Name: __mj_UpdatedAt
    * * Display Name: Updated At
    * * SQL Data Type: datetimeoffset
    * * Default Value: getutcdate()
    */
    get __mj_UpdatedAt(): Date {
        return this.Get('__mj_UpdatedAt');
    }
}


/**
 * MJ_BizApps_Referrals: Referral Requests - strongly typed entity sub-class
 * * Schema: __mj_BizAppsReferrals
 * * Base Table: ReferralRequest
 * * Base View: vwReferralRequests
 * * @description Seeker referral intake request capturing matter details and routing state.
 * * Primary Key: ID
 * @extends {BaseEntity}
 * @class
 * @public
 */
@RegisterClass(BaseEntity, 'MJ_BizApps_Referrals: Referral Requests')
export class mjBizAppsReferralsReferralRequestEntity extends BaseEntity<mjBizAppsReferralsReferralRequestEntityType> {
    /**
    * Loads the MJ_BizApps_Referrals: Referral Requests record from the database
    * @param ID: string - primary key value to load the MJ_BizApps_Referrals: Referral Requests record.
    * @param EntityRelationshipsToLoad - (optional) the relationships to load
    * @returns {Promise<boolean>} - true if successful, false otherwise
    * @public
    * @async
    * @memberof mjBizAppsReferralsReferralRequestEntity
    * @method
    * @override
    */
    public async Load(ID: string, EntityRelationshipsToLoad?: string[]) : Promise<boolean> {
        const compositeKey: CompositeKey = new CompositeKey();
        compositeKey.KeyValuePairs.push({ FieldName: 'ID', Value: ID });
        return await super.InnerLoad(compositeKey, EntityRelationshipsToLoad);
    }

    /**
    * * Field Name: ID
    * * Display Name: ID
    * * SQL Data Type: uniqueidentifier
    * * Default Value: newsequentialid()
    */
    get ID(): string {
        return this.Get('ID');
    }
    set ID(value: string) {
        this.Set('ID', value);
    }

    /**
    * * Field Name: RequestNumber
    * * Display Name: Request Number
    * * SQL Data Type: nvarchar(50)
    */
    get RequestNumber(): string {
        return this.Get('RequestNumber');
    }
    set RequestNumber(value: string) {
        this.Set('RequestNumber', value);
    }

    /**
    * * Field Name: SeekerName
    * * Display Name: Seeker Name
    * * SQL Data Type: nvarchar(200)
    */
    get SeekerName(): string {
        return this.Get('SeekerName');
    }
    set SeekerName(value: string) {
        this.Set('SeekerName', value);
    }

    /**
    * * Field Name: SeekerEmail
    * * Display Name: Seeker Email
    * * SQL Data Type: nvarchar(255)
    */
    get SeekerEmail(): string {
        return this.Get('SeekerEmail');
    }
    set SeekerEmail(value: string) {
        this.Set('SeekerEmail', value);
    }

    /**
    * * Field Name: SeekerPhone
    * * Display Name: Seeker Phone
    * * SQL Data Type: nvarchar(50)
    */
    get SeekerPhone(): string | null {
        return this.Get('SeekerPhone');
    }
    set SeekerPhone(value: string | null) {
        this.Set('SeekerPhone', value);
    }

    /**
    * * Field Name: SeekerCompany
    * * Display Name: Seeker Company
    * * SQL Data Type: nvarchar(200)
    */
    get SeekerCompany(): string | null {
        return this.Get('SeekerCompany');
    }
    set SeekerCompany(value: string | null) {
        this.Set('SeekerCompany', value);
    }

    /**
    * * Field Name: SeekerPersonID
    * * Display Name: Seeker Person
    * * SQL Data Type: uniqueidentifier
    * * Related Entity/Foreign Key: MJ_BizApps_Common: People (vwPeople.ID)
    */
    get SeekerPersonID(): string | null {
        return this.Get('SeekerPersonID');
    }
    set SeekerPersonID(value: string | null) {
        this.Set('SeekerPersonID', value);
    }

    /**
    * * Field Name: PracticeAreaID
    * * Display Name: Practice Area
    * * SQL Data Type: uniqueidentifier
    * * Related Entity/Foreign Key: MJ_BizApps_Referrals: Practice Areas (vwPracticeAreas.ID)
    */
    get PracticeAreaID(): string {
        return this.Get('PracticeAreaID');
    }
    set PracticeAreaID(value: string) {
        this.Set('PracticeAreaID', value);
    }

    /**
    * * Field Name: JurisdictionID
    * * Display Name: Jurisdiction
    * * SQL Data Type: uniqueidentifier
    * * Related Entity/Foreign Key: MJ_BizApps_Referrals: Jurisdictions (vwJurisdictions.ID)
    */
    get JurisdictionID(): string {
        return this.Get('JurisdictionID');
    }
    set JurisdictionID(value: string) {
        this.Set('JurisdictionID', value);
    }

    /**
    * * Field Name: ReferralTierID
    * * Display Name: Referral Tier
    * * SQL Data Type: uniqueidentifier
    * * Related Entity/Foreign Key: MJ_BizApps_Referrals: Referral Tiers (vwReferralTiers.ID)
    */
    get ReferralTierID(): string {
        return this.Get('ReferralTierID');
    }
    set ReferralTierID(value: string) {
        this.Set('ReferralTierID', value);
    }

    /**
    * * Field Name: MatterTitle
    * * Display Name: Matter Title
    * * SQL Data Type: nvarchar(255)
    */
    get MatterTitle(): string {
        return this.Get('MatterTitle');
    }
    set MatterTitle(value: string) {
        this.Set('MatterTitle', value);
    }

    /**
    * * Field Name: MatterSummary
    * * Display Name: Matter Summary
    * * SQL Data Type: nvarchar(MAX)
    */
    get MatterSummary(): string {
        return this.Get('MatterSummary');
    }
    set MatterSummary(value: string) {
        this.Set('MatterSummary', value);
    }

    /**
    * * Field Name: UrgencyLevel
    * * Display Name: Urgency Level
    * * SQL Data Type: nvarchar(20)
    * * Default Value: Standard
    * * Value List Type: List
    * * Possible Values 
    *   * High
    *   * Low
    *   * Standard
    *   * Urgent
    */
    get UrgencyLevel(): 'High' | 'Low' | 'Standard' | 'Urgent' {
        return this.Get('UrgencyLevel');
    }
    set UrgencyLevel(value: 'High' | 'Low' | 'Standard' | 'Urgent') {
        this.Set('UrgencyLevel', value);
    }

    /**
    * * Field Name: BudgetRange
    * * Display Name: Budget Range
    * * SQL Data Type: nvarchar(100)
    */
    get BudgetRange(): string | null {
        return this.Get('BudgetRange');
    }
    set BudgetRange(value: string | null) {
        this.Set('BudgetRange', value);
    }

    /**
    * * Field Name: PreferredLanguage
    * * Display Name: Preferred Language
    * * SQL Data Type: nvarchar(100)
    * * Default Value: English
    */
    get PreferredLanguage(): string | null {
        return this.Get('PreferredLanguage');
    }
    set PreferredLanguage(value: string | null) {
        this.Set('PreferredLanguage', value);
    }

    /**
    * * Field Name: RequiresProBono
    * * Display Name: Requires Pro Bono
    * * SQL Data Type: bit
    * * Default Value: 0
    */
    get RequiresProBono(): boolean {
        return this.Get('RequiresProBono');
    }
    set RequiresProBono(value: boolean) {
        this.Set('RequiresProBono', value);
    }

    /**
    * * Field Name: Status
    * * Display Name: Status
    * * SQL Data Type: nvarchar(30)
    * * Default Value: Draft
    * * Value List Type: List
    * * Possible Values 
    *   * Accepted
    *   * Cancelled
    *   * Completed
    *   * Draft
    *   * Exhausted
    *   * InProgress
    *   * Matching
    *   * Routed
    *   * Submitted
    */
    get Status(): 'Accepted' | 'Cancelled' | 'Completed' | 'Draft' | 'Exhausted' | 'InProgress' | 'Matching' | 'Routed' | 'Submitted' {
        return this.Get('Status');
    }
    set Status(value: 'Accepted' | 'Cancelled' | 'Completed' | 'Draft' | 'Exhausted' | 'InProgress' | 'Matching' | 'Routed' | 'Submitted') {
        this.Set('Status', value);
    }

    /**
    * * Field Name: AssignedProfessionalID
    * * Display Name: Assigned Professional
    * * SQL Data Type: uniqueidentifier
    * * Related Entity/Foreign Key: MJ_BizApps_Referrals: Professional Profiles (vwProfessionalProfiles.ID)
    */
    get AssignedProfessionalID(): string | null {
        return this.Get('AssignedProfessionalID');
    }
    set AssignedProfessionalID(value: string | null) {
        this.Set('AssignedProfessionalID', value);
    }

    /**
    * * Field Name: CurrentCascadeStep
    * * Display Name: Current Cascade Step
    * * SQL Data Type: int
    * * Default Value: 0
    */
    get CurrentCascadeStep(): number {
        return this.Get('CurrentCascadeStep');
    }
    set CurrentCascadeStep(value: number) {
        this.Set('CurrentCascadeStep', value);
    }

    /**
    * * Field Name: SubmittedAt
    * * Display Name: Submitted At
    * * SQL Data Type: datetimeoffset
    */
    get SubmittedAt(): Date | null {
        return this.Get('SubmittedAt');
    }
    set SubmittedAt(value: Date | null) {
        this.Set('SubmittedAt', value);
    }

    /**
    * * Field Name: AcceptedAt
    * * Display Name: Accepted At
    * * SQL Data Type: datetimeoffset
    */
    get AcceptedAt(): Date | null {
        return this.Get('AcceptedAt');
    }
    set AcceptedAt(value: Date | null) {
        this.Set('AcceptedAt', value);
    }

    /**
    * * Field Name: CompletedAt
    * * Display Name: Completed At
    * * SQL Data Type: datetimeoffset
    */
    get CompletedAt(): Date | null {
        return this.Get('CompletedAt');
    }
    set CompletedAt(value: Date | null) {
        this.Set('CompletedAt', value);
    }

    /**
    * * Field Name: SourceChannel
    * * Display Name: Source Channel
    * * SQL Data Type: nvarchar(30)
    * * Default Value: Web
    * * Value List Type: List
    * * Possible Values
    *   * API
    *   * Email
    *   * Phone
    *   * Referral
    *   * Web
    */
    get SourceChannel(): 'API' | 'Email' | 'Phone' | 'Referral' | 'Web' {
        return this.Get('SourceChannel');
    }
    set SourceChannel(value: 'API' | 'Email' | 'Phone' | 'Referral' | 'Web') {
        this.Set('SourceChannel', value);
    }

    /**
    * * Field Name: ReferringProfessionalID
    * * Display Name: Referring Professional
    * * SQL Data Type: uniqueidentifier
    * * Related Entity/Foreign Key: MJ_BizApps_Referrals: Professional Profiles (vwProfessionalProfiles.ID)
    */
    get ReferringProfessionalID(): string | null {
        return this.Get('ReferringProfessionalID');
    }
    set ReferringProfessionalID(value: string | null) {
        this.Set('ReferringProfessionalID', value);
    }

    /**
    * * Field Name: EscalationLevel
    * * Display Name: Escalation Level
    * * SQL Data Type: int
    * * Default Value: 0
    */
    get EscalationLevel(): number {
        return this.Get('EscalationLevel');
    }
    set EscalationLevel(value: number) {
        this.Set('EscalationLevel', value);
    }

    /**
    * * Field Name: LastEscalatedAt
    * * Display Name: Last Escalated At
    * * SQL Data Type: datetimeoffset
    */
    get LastEscalatedAt(): Date | null {
        return this.Get('LastEscalatedAt');
    }
    set LastEscalatedAt(value: Date | null) {
        this.Set('LastEscalatedAt', value);
    }

    /**
    * * Field Name: __mj_CreatedAt
    * * Display Name: Created At
    * * SQL Data Type: datetimeoffset
    * * Default Value: getutcdate()
    */
    get __mj_CreatedAt(): Date {
        return this.Get('__mj_CreatedAt');
    }

    /**
    * * Field Name: __mj_UpdatedAt
    * * Display Name: Updated At
    * * SQL Data Type: datetimeoffset
    * * Default Value: getutcdate()
    */
    get __mj_UpdatedAt(): Date {
        return this.Get('__mj_UpdatedAt');
    }

    /**
    * * Field Name: SeekerPerson
    * * Display Name: Seeker Person
    * * SQL Data Type: nvarchar(250)
    */
    get SeekerPerson(): string | null {
        return this.Get('SeekerPerson');
    }

    /**
    * * Field Name: PracticeArea
    * * Display Name: Practice Area
    * * SQL Data Type: nvarchar(150)
    */
    get PracticeArea(): string | null {
        return this.Get('PracticeArea');
    }

    /**
    * * Field Name: Jurisdiction
    * * Display Name: Jurisdiction
    * * SQL Data Type: nvarchar(150)
    */
    get Jurisdiction(): string | null {
        return this.Get('Jurisdiction');
    }

    /**
    * * Field Name: ReferralTier
    * * Display Name: Referral Tier
    * * SQL Data Type: nvarchar(100)
    */
    get ReferralTier(): string | null {
        return this.Get('ReferralTier');
    }
}


/**
 * MJ_BizApps_Referrals: Referral Tiers - strongly typed entity sub-class
 * * Schema: __mj_BizAppsReferrals
 * * Base Table: ReferralTier
 * * Base View: vwReferralTiers
 * * @description Service-level agreement tiers governing SLA response windows and cascade depth.
 * * Primary Key: ID
 * @extends {BaseEntity}
 * @class
 * @public
 */
@RegisterClass(BaseEntity, 'MJ_BizApps_Referrals: Referral Tiers')
export class mjBizAppsReferralsReferralTierEntity extends BaseEntity<mjBizAppsReferralsReferralTierEntityType> {
    /**
    * Loads the MJ_BizApps_Referrals: Referral Tiers record from the database
    * @param ID: string - primary key value to load the MJ_BizApps_Referrals: Referral Tiers record.
    * @param EntityRelationshipsToLoad - (optional) the relationships to load
    * @returns {Promise<boolean>} - true if successful, false otherwise
    * @public
    * @async
    * @memberof mjBizAppsReferralsReferralTierEntity
    * @method
    * @override
    */
    public async Load(ID: string, EntityRelationshipsToLoad?: string[]) : Promise<boolean> {
        const compositeKey: CompositeKey = new CompositeKey();
        compositeKey.KeyValuePairs.push({ FieldName: 'ID', Value: ID });
        return await super.InnerLoad(compositeKey, EntityRelationshipsToLoad);
    }

    /**
    * Validate() method override for MJ_BizApps_Referrals: Referral Tiers entity. This is an auto-generated method that invokes the generated validators for this entity for the following fields:
    * * MaxCascadeAttempts: Maximum cascade attempts must be greater than zero.
    * * SLAResponseHours: SLA response hours must be greater than zero.
    * @public
    * @method
    * @override
    */
    public override Validate(): ValidationResult {
        const result = super.Validate();
        this.ValidateMaxCascadeAttemptsGreaterThanZero(result);
        this.ValidateSLAResponseHoursGreaterThanZero(result);
        result.Success = result.Success && (result.Errors.length === 0);

        return result;
    }

    /**
    * Maximum cascade attempts must be greater than zero.
    * @param result - the ValidationResult object to add any errors or warnings to
    * @public
    * @method
    */
    public ValidateMaxCascadeAttemptsGreaterThanZero(result: ValidationResult) {
    	if (this.MaxCascadeAttempts <= 0) {
    		result.Errors.push(new ValidationErrorInfo(
    			"MaxCascadeAttempts",
    			"Maximum cascade attempts must be greater than 0.",
    			this.MaxCascadeAttempts,
    			ValidationErrorType.Failure
    		));
    	}
    }

    /**
    * SLA response hours must be greater than zero.
    * @param result - the ValidationResult object to add any errors or warnings to
    * @public
    * @method
    */
    public ValidateSLAResponseHoursGreaterThanZero(result: ValidationResult) {
    	if (this.SLAResponseHours != null && this.SLAResponseHours <= 0) {
    		result.Errors.push(new ValidationErrorInfo(
    			"SLAResponseHours",
    			"SLA response hours must be greater than 0.",
    			this.SLAResponseHours,
    			ValidationErrorType.Failure
    		));
    	}
    }

    /**
    * * Field Name: ID
    * * Display Name: ID
    * * SQL Data Type: uniqueidentifier
    * * Default Value: newsequentialid()
    */
    get ID(): string {
        return this.Get('ID');
    }
    set ID(value: string) {
        this.Set('ID', value);
    }

    /**
    * * Field Name: Name
    * * Display Name: Name
    * * SQL Data Type: nvarchar(100)
    */
    get Name(): string {
        return this.Get('Name');
    }
    set Name(value: string) {
        this.Set('Name', value);
    }

    /**
    * * Field Name: Code
    * * Display Name: Code
    * * SQL Data Type: nvarchar(50)
    */
    get Code(): string {
        return this.Get('Code');
    }
    set Code(value: string) {
        this.Set('Code', value);
    }

    /**
    * * Field Name: SLAResponseHours
    * * Display Name: SLA Response Hours
    * * SQL Data Type: int
    * * Default Value: 24
    */
    get SLAResponseHours(): number {
        return this.Get('SLAResponseHours');
    }
    set SLAResponseHours(value: number) {
        this.Set('SLAResponseHours', value);
    }

    /**
    * * Field Name: MaxCascadeAttempts
    * * Display Name: Max Cascade Attempts
    * * SQL Data Type: int
    * * Default Value: 3
    */
    get MaxCascadeAttempts(): number {
        return this.Get('MaxCascadeAttempts');
    }
    set MaxCascadeAttempts(value: number) {
        this.Set('MaxCascadeAttempts', value);
    }

    /**
    * * Field Name: PriorityWeight
    * * Display Name: Priority Weight
    * * SQL Data Type: decimal(5, 2)
    * * Default Value: 1.00
    */
    get PriorityWeight(): number {
        return this.Get('PriorityWeight');
    }
    set PriorityWeight(value: number) {
        this.Set('PriorityWeight', value);
    }

    /**
    * * Field Name: RequireConflictCheck
    * * Display Name: Require Conflict Check
    * * SQL Data Type: bit
    * * Default Value: 1
    */
    get RequireConflictCheck(): boolean {
        return this.Get('RequireConflictCheck');
    }
    set RequireConflictCheck(value: boolean) {
        this.Set('RequireConflictCheck', value);
    }

    /**
    * * Field Name: Description
    * * Display Name: Description
    * * SQL Data Type: nvarchar(MAX)
    */
    get Description(): string | null {
        return this.Get('Description');
    }
    set Description(value: string | null) {
        this.Set('Description', value);
    }

    /**
    * * Field Name: IsActive
    * * Display Name: Active
    * * SQL Data Type: bit
    * * Default Value: 1
    */
    get IsActive(): boolean {
        return this.Get('IsActive');
    }
    set IsActive(value: boolean) {
        this.Set('IsActive', value);
    }

    /**
    * * Field Name: EscalationWarningPercent
    * * Display Name: Escalation Warning Percent
    * * SQL Data Type: int
    * * Default Value: 75
    */
    get EscalationWarningPercent(): number {
        return this.Get('EscalationWarningPercent');
    }
    set EscalationWarningPercent(value: number) {
        this.Set('EscalationWarningPercent', value);
    }

    /**
    * * Field Name: MaxEscalationLevel
    * * Display Name: Max Escalation Level
    * * SQL Data Type: int
    * * Default Value: 3
    */
    get MaxEscalationLevel(): number {
        return this.Get('MaxEscalationLevel');
    }
    set MaxEscalationLevel(value: number) {
        this.Set('MaxEscalationLevel', value);
    }

    /**
    * * Field Name: UrgentSLAMultiplier
    * * Display Name: Urgent SLA Multiplier
    * * SQL Data Type: decimal(4, 2)
    * * Default Value: 0.50
    */
    get UrgentSLAMultiplier(): number {
        return this.Get('UrgentSLAMultiplier');
    }
    set UrgentSLAMultiplier(value: number) {
        this.Set('UrgentSLAMultiplier', value);
    }

    /**
    * * Field Name: EscalationActionType
    * * Display Name: Escalation Action Type
    * * SQL Data Type: nvarchar(30)
    * * Default Value: Notify
    * * Value List Type: List
    * * Possible Values
    *   * AdminAlert
    *   * Notify
    *   * Reassign
    */
    get EscalationActionType(): 'AdminAlert' | 'Notify' | 'Reassign' {
        return this.Get('EscalationActionType');
    }
    set EscalationActionType(value: 'AdminAlert' | 'Notify' | 'Reassign') {
        this.Set('EscalationActionType', value);
    }

    /**
    * * Field Name: __mj_CreatedAt
    * * Display Name: Created At
    * * SQL Data Type: datetimeoffset
    * * Default Value: getutcdate()
    */
    get __mj_CreatedAt(): Date {
        return this.Get('__mj_CreatedAt');
    }

    /**
    * * Field Name: __mj_UpdatedAt
    * * Display Name: Updated At
    * * SQL Data Type: datetimeoffset
    * * Default Value: getutcdate()
    */
    get __mj_UpdatedAt(): Date {
        return this.Get('__mj_UpdatedAt');
    }
}


export const mjBizAppsReferralsProfessionalCredentialSchema = z.object({
    ID: z.string().describe(`
        * * Field Name: ID
        * * Display Name: ID
        * * SQL Data Type: uniqueidentifier
        * * Default Value: newsequentialid()`),
    ProfessionalProfileID: z.string().describe(`
        * * Field Name: ProfessionalProfileID
        * * Display Name: Professional Profile
        * * SQL Data Type: uniqueidentifier
        * * Related Entity/Foreign Key: MJ_BizApps_Referrals: Professional Profiles (vwProfessionalProfiles.ID)`),
    JurisdictionID: z.string().nullable().describe(`
        * * Field Name: JurisdictionID
        * * Display Name: Jurisdiction
        * * SQL Data Type: uniqueidentifier
        * * Related Entity/Foreign Key: MJ_BizApps_Referrals: Jurisdictions (vwJurisdictions.ID)`),
    CredentialCode: z.string().describe(`
        * * Field Name: CredentialCode
        * * Display Name: Credential Code
        * * SQL Data Type: nvarchar(100)`),
    CredentialName: z.string().describe(`
        * * Field Name: CredentialName
        * * Display Name: Credential Name
        * * SQL Data Type: nvarchar(255)`),
    IssuerName: z.string().nullable().describe(`
        * * Field Name: IssuerName
        * * Display Name: Issuer Name
        * * SQL Data Type: nvarchar(255)`),
    ProviderKey: z.string().describe(`
        * * Field Name: ProviderKey
        * * Display Name: Provider Key
        * * SQL Data Type: nvarchar(100)
        * * Default Value: Manual`),
    ExternalReferenceID: z.string().nullable().describe(`
        * * Field Name: ExternalReferenceID
        * * Display Name: External Reference ID
        * * SQL Data Type: nvarchar(255)`),
    VerificationStatus: z.union([z.literal('Expired'), z.literal('Pending'), z.literal('Rejected'), z.literal('Revoked'), z.literal('Verified')]).describe(`
        * * Field Name: VerificationStatus
        * * Display Name: Verification Status
        * * SQL Data Type: nvarchar(30)
        * * Default Value: Pending
    * * Value List Type: List
    * * Possible Values 
    *   * Expired
    *   * Pending
    *   * Rejected
    *   * Revoked
    *   * Verified`),
    IssuedAt: z.date().nullable().describe(`
        * * Field Name: IssuedAt
        * * Display Name: Issued At
        * * SQL Data Type: datetimeoffset`),
    ExpiresAt: z.date().nullable().describe(`
        * * Field Name: ExpiresAt
        * * Display Name: Expires At
        * * SQL Data Type: datetimeoffset`),
    VerifiedAt: z.date().nullable().describe(`
        * * Field Name: VerifiedAt
        * * Display Name: Verified At
        * * SQL Data Type: datetimeoffset`),
    VerifiedByPersonID: z.string().nullable().describe(`
        * * Field Name: VerifiedByPersonID
        * * Display Name: Verified By Person
        * * SQL Data Type: uniqueidentifier
        * * Related Entity/Foreign Key: MJ_BizApps_Common: People (vwPeople.ID)`),
    EvidenceURL: z.string().nullable().describe(`
        * * Field Name: EvidenceURL
        * * Display Name: Evidence URL
        * * SQL Data Type: nvarchar(1000)`),
    MetadataJSON: z.string().nullable().describe(`
        * * Field Name: MetadataJSON
        * * Display Name: Metadata JSON
        * * SQL Data Type: nvarchar(MAX)`),
    IsPrimary: z.boolean().describe(`
        * * Field Name: IsPrimary
        * * Display Name: Is Primary
        * * SQL Data Type: bit
        * * Default Value: 0`),
    __mj_CreatedAt: z.date().describe(`
        * * Field Name: __mj_CreatedAt
        * * Display Name: Created At
        * * SQL Data Type: datetimeoffset
        * * Default Value: getutcdate()`),
    __mj_UpdatedAt: z.date().describe(`
        * * Field Name: __mj_UpdatedAt
        * * Display Name: Updated At
        * * SQL Data Type: datetimeoffset
        * * Default Value: getutcdate()`),
    ProfessionalProfile: z.string().optional().nullable().describe(`
        * * Field Name: ProfessionalProfile
        * * Display Name: Professional Profile
        * * SQL Data Type: nvarchar(200)`),
    Jurisdiction: z.string().optional().nullable().describe(`
        * * Field Name: Jurisdiction
        * * Display Name: Jurisdiction
        * * SQL Data Type: nvarchar(150)`),
    VerifiedByPerson: z.string().optional().nullable().describe(`
        * * Field Name: VerifiedByPerson
        * * Display Name: Verified By Person
        * * SQL Data Type: nvarchar(255)`),
});

export type mjBizAppsReferralsProfessionalCredentialEntityType = z.infer<typeof mjBizAppsReferralsProfessionalCredentialSchema>;

/**
 * Strongly-typed Entity Subclass for the MJ_BizApps_Referrals: Professional Credentials entity.
 * Normalized professional credentials, licenses, certifications, and verification provider records linked to a ProfessionalProfile.
 */
@RegisterClass(BaseEntity, 'MJ_BizApps_Referrals: Professional Credentials')
export class mjBizAppsReferralsProfessionalCredentialEntity extends BaseEntity<mjBizAppsReferralsProfessionalCredentialEntityType> {
    public async Load(ID: string, EntityRelationshipsToLoad?: string[]): Promise<boolean> {
        const compositeKey: CompositeKey = new CompositeKey();
        compositeKey.KeyValuePairs.push({ FieldName: 'ID', Value: ID });
        return await super.InnerLoad(compositeKey, EntityRelationshipsToLoad);
    }

    /**
    * * Field Name: ID
    * * Display Name: ID
    * * SQL Data Type: uniqueidentifier
    * * Default Value: newsequentialid()
    */
    get ID(): string {
        return this.Get('ID');
    }
    set ID(value: string) {
        this.Set('ID', value);
    }

    /**
    * * Field Name: ProfessionalProfileID
    * * Display Name: Professional Profile
    * * SQL Data Type: uniqueidentifier
    */
    get ProfessionalProfileID(): string {
        return this.Get('ProfessionalProfileID');
    }
    set ProfessionalProfileID(value: string) {
        this.Set('ProfessionalProfileID', value);
    }

    /**
    * * Field Name: JurisdictionID
    * * Display Name: Jurisdiction
    * * SQL Data Type: uniqueidentifier
    */
    get JurisdictionID(): string | null {
        return this.Get('JurisdictionID');
    }
    set JurisdictionID(value: string | null) {
        this.Set('JurisdictionID', value);
    }

    /**
    * * Field Name: CredentialCode
    * * Display Name: Credential Code
    * * SQL Data Type: nvarchar(100)
    */
    get CredentialCode(): string {
        return this.Get('CredentialCode');
    }
    set CredentialCode(value: string) {
        this.Set('CredentialCode', value);
    }

    /**
    * * Field Name: CredentialName
    * * Display Name: Credential Name
    * * SQL Data Type: nvarchar(255)
    */
    get CredentialName(): string {
        return this.Get('CredentialName');
    }
    set CredentialName(value: string) {
        this.Set('CredentialName', value);
    }

    /**
    * * Field Name: IssuerName
    * * Display Name: Issuer Name
    * * SQL Data Type: nvarchar(255)
    */
    get IssuerName(): string | null {
        return this.Get('IssuerName');
    }
    set IssuerName(value: string | null) {
        this.Set('IssuerName', value);
    }

    /**
    * * Field Name: ProviderKey
    * * Display Name: Provider Key
    * * SQL Data Type: nvarchar(100)
    * * Default Value: Manual
    */
    get ProviderKey(): string {
        return this.Get('ProviderKey');
    }
    set ProviderKey(value: string) {
        this.Set('ProviderKey', value);
    }

    /**
    * * Field Name: ExternalReferenceID
    * * Display Name: External Reference ID
    * * SQL Data Type: nvarchar(255)
    */
    get ExternalReferenceID(): string | null {
        return this.Get('ExternalReferenceID');
    }
    set ExternalReferenceID(value: string | null) {
        this.Set('ExternalReferenceID', value);
    }

    /**
    * * Field Name: VerificationStatus
    * * Display Name: Verification Status
    * * SQL Data Type: nvarchar(30)
    * * Default Value: Pending
    */
    get VerificationStatus(): 'Expired' | 'Pending' | 'Rejected' | 'Revoked' | 'Verified' {
        return this.Get('VerificationStatus');
    }
    set VerificationStatus(value: 'Expired' | 'Pending' | 'Rejected' | 'Revoked' | 'Verified') {
        this.Set('VerificationStatus', value);
    }

    /**
    * * Field Name: IssuedAt
    * * Display Name: Issued At
    * * SQL Data Type: datetimeoffset
    */
    get IssuedAt(): Date | null {
        return this.Get('IssuedAt');
    }
    set IssuedAt(value: Date | null) {
        this.Set('IssuedAt', value);
    }

    /**
    * * Field Name: ExpiresAt
    * * Display Name: Expires At
    * * SQL Data Type: datetimeoffset
    */
    get ExpiresAt(): Date | null {
        return this.Get('ExpiresAt');
    }
    set ExpiresAt(value: Date | null) {
        this.Set('ExpiresAt', value);
    }

    /**
    * * Field Name: VerifiedAt
    * * Display Name: Verified At
    * * SQL Data Type: datetimeoffset
    */
    get VerifiedAt(): Date | null {
        return this.Get('VerifiedAt');
    }
    set VerifiedAt(value: Date | null) {
        this.Set('VerifiedAt', value);
    }

    /**
    * * Field Name: VerifiedByPersonID
    * * Display Name: Verified By Person
    * * SQL Data Type: uniqueidentifier
    */
    get VerifiedByPersonID(): string | null {
        return this.Get('VerifiedByPersonID');
    }
    set VerifiedByPersonID(value: string | null) {
        this.Set('VerifiedByPersonID', value);
    }

    /**
    * * Field Name: EvidenceURL
    * * Display Name: Evidence URL
    * * SQL Data Type: nvarchar(1000)
    */
    get EvidenceURL(): string | null {
        return this.Get('EvidenceURL');
    }
    set EvidenceURL(value: string | null) {
        this.Set('EvidenceURL', value);
    }

    /**
    * * Field Name: MetadataJSON
    * * Display Name: Metadata JSON
    * * SQL Data Type: nvarchar(MAX)
    */
    get MetadataJSON(): string | null {
        return this.Get('MetadataJSON');
    }
    set MetadataJSON(value: string | null) {
        this.Set('MetadataJSON', value);
    }

    /**
    * * Field Name: IsPrimary
    * * Display Name: Is Primary
    * * SQL Data Type: bit
    * * Default Value: 0
    */
    get IsPrimary(): boolean {
        return this.Get('IsPrimary');
    }
    set IsPrimary(value: boolean) {
        this.Set('IsPrimary', value);
    }

    /**
    * * Field Name: __mj_CreatedAt
    * * Display Name: Created At
    * * SQL Data Type: datetimeoffset
    */
    get __mj_CreatedAt(): Date {
        return this.Get('__mj_CreatedAt');
    }

    /**
    * * Field Name: __mj_UpdatedAt
    * * Display Name: Updated At
    * * SQL Data Type: datetimeoffset
    */
    get __mj_UpdatedAt(): Date {
        return this.Get('__mj_UpdatedAt');
    }

    /**
    * * Field Name: ProfessionalProfile
    * * Display Name: Professional Profile
    * * SQL Data Type: nvarchar(200)
    */
    get ProfessionalProfile(): string | null {
        return this.Get('ProfessionalProfile');
    }

    /**
    * * Field Name: Jurisdiction
    * * Display Name: Jurisdiction
    * * SQL Data Type: nvarchar(150)
    */
    get Jurisdiction(): string | null {
        return this.Get('Jurisdiction');
    }

    /**
    * * Field Name: VerifiedByPerson
    * * Display Name: Verified By Person
    * * SQL Data Type: nvarchar(255)
    */
    get VerifiedByPerson(): string | null {
        return this.Get('VerifiedByPerson');
    }
}


/**
 * zod schema definition for the entity MJ_BizApps_Referrals: Referral Escalations
 */
export const mjBizAppsReferralsReferralEscalationSchema = z.object({
    ID: z.string().describe(`
        * * Field Name: ID
        * * Display Name: ID
    * * SQL Data Type: uniqueidentifier
    * * Default Value: newsequentialid()`),
    ReferralRequestID: z.string().describe(`
        * * Field Name: ReferralRequestID
        * * Display Name: Referral Request
    * * SQL Data Type: uniqueidentifier
    * * Related Entity/Foreign Key: MJ_BizApps_Referrals: Referral Requests (vwReferralRequests.ID)`),
    ReferralAssignmentID: z.string().nullable().describe(`
        * * Field Name: ReferralAssignmentID
        * * Display Name: Referral Assignment
    * * SQL Data Type: uniqueidentifier
    * * Related Entity/Foreign Key: MJ_BizApps_Referrals: Referral Assignments (vwReferralAssignments.ID)`),
    EscalationLevel: z.number().describe(`
        * * Field Name: EscalationLevel
        * * Display Name: Escalation Level
    * * SQL Data Type: int
    * * Default Value: 1`),
    TriggerType: z.union([z.literal('CapacityExhausted'), z.literal('CascadeExhausted'), z.literal('ManualEscalation'), z.literal('SLABreach'), z.literal('SLAWarning'), z.literal('UrgentUnassigned')]).describe(`
        * * Field Name: TriggerType
        * * Display Name: Trigger Type
    * * SQL Data Type: nvarchar(60)
    * * Default Value: SLAWarning
    * * Value List Type: List
    * * Possible Values
    *   * CapacityExhausted
    *   * CascadeExhausted
    *   * ManualEscalation
    *   * SLABreach
    *   * SLAWarning
    *   * UrgentUnassigned`),
    Status: z.union([z.literal('Acknowledged'), z.literal('Dismissed'), z.literal('Open'), z.literal('Resolved')]).describe(`
        * * Field Name: Status
        * * Display Name: Status
    * * SQL Data Type: nvarchar(40)
    * * Default Value: Open
    * * Value List Type: List
    * * Possible Values
    *   * Acknowledged
    *   * Dismissed
    *   * Open
    *   * Resolved`),
    RecommendedAction: z.union([z.literal('AdminAlert'), z.literal('EscalateToTier'), z.literal('Notify'), z.literal('Reassign')]).describe(`
        * * Field Name: RecommendedAction
        * * Display Name: Recommended Action
    * * SQL Data Type: nvarchar(60)
    * * Default Value: Notify
    * * Value List Type: List
    * * Possible Values 
    *   * AdminAlert
    *   * EscalateToTier
    *   * Notify
    *   * Reassign`),
    Notes: z.string().nullable().describe(`
        * * Field Name: Notes
        * * Display Name: Notes
    * * SQL Data Type: nvarchar(MAX)`),
    TriggeredAt: z.date().describe(`
        * * Field Name: TriggeredAt
        * * Display Name: Triggered At
    * * SQL Data Type: datetimeoffset
    * * Default Value: sysdatetimeoffset()`),
    AcknowledgedAt: z.date().nullable().describe(`
        * * Field Name: AcknowledgedAt
        * * Display Name: Acknowledged At
    * * SQL Data Type: datetimeoffset`),
    ResolvedAt: z.date().nullable().describe(`
        * * Field Name: ResolvedAt
        * * Display Name: Resolved At
    * * SQL Data Type: datetimeoffset`),
    DedupKey: z.string().nullable().describe(`
        * * Field Name: DedupKey
        * * Display Name: Dedup Key
    * * SQL Data Type: nvarchar(200)`),
    LinkedTaskID: z.string().nullable().describe(`
        * * Field Name: LinkedTaskID
        * * Display Name: Linked Task
    * * SQL Data Type: uniqueidentifier`),
    AcknowledgedByPersonID: z.string().nullable().describe(`
        * * Field Name: AcknowledgedByPersonID
        * * Display Name: Acknowledged By Person
    * * SQL Data Type: uniqueidentifier
    * * Related Entity/Foreign Key: MJ_BizApps_Common: People (vwPeople.ID)`),
    ResolvedByPersonID: z.string().nullable().describe(`
        * * Field Name: ResolvedByPersonID
        * * Display Name: Resolved By Person
    * * SQL Data Type: uniqueidentifier
    * * Related Entity/Foreign Key: MJ_BizApps_Common: People (vwPeople.ID)`),
    ResolutionNotes: z.string().nullable().describe(`
        * * Field Name: ResolutionNotes
        * * Display Name: Resolution Notes
    * * SQL Data Type: nvarchar(MAX)`),
    AIRationaleJSON: z.string().nullable().describe(`
        * * Field Name: AIRationaleJSON
        * * Display Name: AIRationale JSON
    * * SQL Data Type: nvarchar(MAX)`),
    __mj_CreatedAt: z.date().describe(`
        * * Field Name: __mj_CreatedAt
        * * Display Name: Created At
    * * SQL Data Type: datetimeoffset
    * * Default Value: getutcdate()`),
    __mj_UpdatedAt: z.date().describe(`
        * * Field Name: __mj_UpdatedAt
        * * Display Name: Updated At
    * * SQL Data Type: datetimeoffset
    * * Default Value: getutcdate()`),
});

export type mjBizAppsReferralsReferralEscalationEntityType = z.infer<typeof mjBizAppsReferralsReferralEscalationSchema>;

/**
 * zod schema definition for the entity MJ_BizApps_Referrals: Referral Outcomes
 */
export const mjBizAppsReferralsReferralOutcomeSchema = z.object({
    ID: z.string().describe(`
        * * Field Name: ID
        * * Display Name: ID
    * * SQL Data Type: uniqueidentifier
    * * Default Value: newsequentialid()`),
    ReferralRequestID: z.string().describe(`
        * * Field Name: ReferralRequestID
        * * Display Name: Referral Request
    * * SQL Data Type: uniqueidentifier
    * * Related Entity/Foreign Key: MJ_BizApps_Referrals: Referral Requests (vwReferralRequests.ID)`),
    ReferralAssignmentID: z.string().describe(`
        * * Field Name: ReferralAssignmentID
        * * Display Name: Referral Assignment
    * * SQL Data Type: uniqueidentifier
    * * Related Entity/Foreign Key: MJ_BizApps_Referrals: Referral Assignments (vwReferralAssignments.ID)`),
    ProfessionalProfileID: z.string().describe(`
        * * Field Name: ProfessionalProfileID
        * * Display Name: Professional Profile
    * * SQL Data Type: uniqueidentifier
    * * Related Entity/Foreign Key: MJ_BizApps_Referrals: Professional Profiles (vwProfessionalProfiles.ID)`),
    OutcomeStatus: z.union([z.literal('Cancelled'), z.literal('Completed'), z.literal('NoEngagement')]).describe(`
        * * Field Name: OutcomeStatus
        * * Display Name: Outcome Status
    * * SQL Data Type: nvarchar(60)
    * * Default Value: Completed
    * * Value List Type: List
    * * Possible Values 
    *   * Cancelled
    *   * Completed
    *   * NoEngagement`),
    ResponseHours: z.number().nullable().describe(`
        * * Field Name: ResponseHours
        * * Display Name: Response Hours
    * * SQL Data Type: decimal(6, 2)`),
    CompletionNotes: z.string().nullable().describe(`
        * * Field Name: CompletionNotes
        * * Display Name: Completion Notes
    * * SQL Data Type: nvarchar(MAX)`),
    CompletedAt: z.date().describe(`
        * * Field Name: CompletedAt
        * * Display Name: Completed At
    * * SQL Data Type: datetimeoffset
    * * Default Value: sysdatetimeoffset()`),
    FeeAmount: z.number().nullable().describe(`
        * * Field Name: FeeAmount
        * * Display Name: Fee Amount
    * * SQL Data Type: decimal(10, 2)`),
    __mj_CreatedAt: z.date().describe(`
        * * Field Name: __mj_CreatedAt
        * * Display Name: Created At
    * * SQL Data Type: datetimeoffset
    * * Default Value: getutcdate()`),
    __mj_UpdatedAt: z.date().describe(`
        * * Field Name: __mj_UpdatedAt
        * * Display Name: Updated At
    * * SQL Data Type: datetimeoffset
    * * Default Value: getutcdate()`),
});

export type mjBizAppsReferralsReferralOutcomeEntityType = z.infer<typeof mjBizAppsReferralsReferralOutcomeSchema>;

/**
 * zod schema definition for the entity MJ_BizApps_Referrals: Professional Availability Windows
 */
export const mjBizAppsReferralsProfessionalAvailabilityWindowSchema = z.object({
    ID: z.string().describe(`
        * * Field Name: ID
        * * Display Name: ID
    * * SQL Data Type: uniqueidentifier
    * * Default Value: newsequentialid()`),
    ProfessionalProfileID: z.string().describe(`
        * * Field Name: ProfessionalProfileID
        * * Display Name: Professional Profile
    * * SQL Data Type: uniqueidentifier
    * * Related Entity/Foreign Key: MJ_BizApps_Referrals: Professional Profiles (vwProfessionalProfiles.ID)`),
    WindowType: z.union([z.literal('Blackout'), z.literal('DateRange'), z.literal('Recurring')]).describe(`
        * * Field Name: WindowType
        * * Display Name: Window Type
    * * SQL Data Type: nvarchar(40)
    * * Default Value: Recurring
    * * Value List Type: List
    * * Possible Values 
    *   * Blackout
    *   * DateRange
    *   * Recurring`),
    DayOfWeek: z.number().nullable().describe(`
        * * Field Name: DayOfWeek
        * * Display Name: Day Of Week
    * * SQL Data Type: int`),
    StartTimeMinutes: z.number().nullable().describe(`
        * * Field Name: StartTimeMinutes
        * * Display Name: Start Time Minutes
    * * SQL Data Type: int`),
    EndTimeMinutes: z.number().nullable().describe(`
        * * Field Name: EndTimeMinutes
        * * Display Name: End Time Minutes
    * * SQL Data Type: int`),
    StartDate: z.date().nullable().describe(`
        * * Field Name: StartDate
        * * Display Name: Start Date
    * * SQL Data Type: datetimeoffset`),
    EndDate: z.date().nullable().describe(`
        * * Field Name: EndDate
        * * Display Name: End Date
    * * SQL Data Type: datetimeoffset`),
    IsAvailable: z.boolean().describe(`
        * * Field Name: IsAvailable
        * * Display Name: Is Available
    * * SQL Data Type: bit
    * * Default Value: 1`),
    TimeZone: z.string().describe(`
        * * Field Name: TimeZone
        * * Display Name: Time Zone
    * * SQL Data Type: nvarchar(100)
    * * Default Value: UTC`),
    Notes: z.string().nullable().describe(`
        * * Field Name: Notes
        * * Display Name: Notes
    * * SQL Data Type: nvarchar(255)`),
    __mj_CreatedAt: z.date().describe(`
        * * Field Name: __mj_CreatedAt
        * * Display Name: Created At
    * * SQL Data Type: datetimeoffset
    * * Default Value: getutcdate()`),
    __mj_UpdatedAt: z.date().describe(`
        * * Field Name: __mj_UpdatedAt
        * * Display Name: Updated At
    * * SQL Data Type: datetimeoffset
    * * Default Value: getutcdate()`),
});

export type mjBizAppsReferralsProfessionalAvailabilityWindowEntityType = z.infer<typeof mjBizAppsReferralsProfessionalAvailabilityWindowSchema>;

/**
 * zod schema definition for the entity MJ_BizApps_Referrals: Reciprocity Snapshots
 */
export const mjBizAppsReferralsReciprocitySnapshotSchema = z.object({
    ID: z.string().describe(`
        * * Field Name: ID
        * * Display Name: ID
    * * SQL Data Type: uniqueidentifier
    * * Default Value: newsequentialid()`),
    ProfessionalProfileID: z.string().describe(`
        * * Field Name: ProfessionalProfileID
        * * Display Name: Professional Profile
    * * SQL Data Type: uniqueidentifier
    * * Related Entity/Foreign Key: MJ_BizApps_Referrals: Professional Profiles (vwProfessionalProfiles.ID)`),
    SnapshotDate: z.date().describe(`
        * * Field Name: SnapshotDate
        * * Display Name: Snapshot Date
    * * SQL Data Type: datetimeoffset
    * * Default Value: sysdatetimeoffset()`),
    PeriodStartDate: z.date().describe(`
        * * Field Name: PeriodStartDate
        * * Display Name: Period Start Date
    * * SQL Data Type: datetimeoffset`),
    PeriodEndDate: z.date().describe(`
        * * Field Name: PeriodEndDate
        * * Display Name: Period End Date
    * * SQL Data Type: datetimeoffset`),
    ReferralsGivenCount: z.number().describe(`
        * * Field Name: ReferralsGivenCount
        * * Display Name: Referrals Given Count
    * * SQL Data Type: int
    * * Default Value: 0`),
    ReferralsReceivedCount: z.number().describe(`
        * * Field Name: ReferralsReceivedCount
        * * Display Name: Referrals Received Count
    * * SQL Data Type: int
    * * Default Value: 0`),
    ReciprocityIndex: z.number().describe(`
        * * Field Name: ReciprocityIndex
        * * Display Name: Reciprocity Index
    * * SQL Data Type: decimal(5, 2)
    * * Default Value: 0.00`),
    AcceptedCount: z.number().describe(`
        * * Field Name: AcceptedCount
        * * Display Name: Accepted Count
    * * SQL Data Type: int
    * * Default Value: 0`),
    ResolvedCount: z.number().describe(`
        * * Field Name: ResolvedCount
        * * Display Name: Resolved Count
    * * SQL Data Type: int
    * * Default Value: 0`),
    SLABreachCount: z.number().describe(`
        * * Field Name: SLABreachCount
        * * Display Name: SLA Breach Count
    * * SQL Data Type: int
    * * Default Value: 0`),
    AcceptanceRate: z.number().describe(`
        * * Field Name: AcceptanceRate
        * * Display Name: Acceptance Rate
    * * SQL Data Type: decimal(5, 2)
    * * Default Value: 0`),
    MedianResponseHours: z.number().nullable().describe(`
        * * Field Name: MedianResponseHours
        * * Display Name: Median Response Hours
    * * SQL Data Type: decimal(6, 2)`),
    AttributedFeeTotal: z.number().describe(`
        * * Field Name: AttributedFeeTotal
        * * Display Name: Attributed Fee Total
    * * SQL Data Type: decimal(12, 2)
    * * Default Value: 0`),
    __mj_CreatedAt: z.date().describe(`
        * * Field Name: __mj_CreatedAt
        * * Display Name: Created At
    * * SQL Data Type: datetimeoffset
    * * Default Value: getutcdate()`),
    __mj_UpdatedAt: z.date().describe(`
        * * Field Name: __mj_UpdatedAt
        * * Display Name: Updated At
    * * SQL Data Type: datetimeoffset
    * * Default Value: getutcdate()`),
});

export type mjBizAppsReferralsReciprocitySnapshotEntityType = z.infer<typeof mjBizAppsReferralsReciprocitySnapshotSchema>;

/**
 * MJ_BizApps_Referrals: Referral Escalations - strongly typed entity sub-class
 * * Schema: __mj_BizAppsReferrals
 * * Base Table: ReferralEscalation
 * * Base View: vwReferralEscalations
 * * @description SLA warning/breach escalation events raised against a ReferralRequest or ReferralAssignment.
 * * Primary Key: ID
 * @extends {BaseEntity}
 * @class
 * @public
 */
@RegisterClass(BaseEntity, 'MJ_BizApps_Referrals: Referral Escalations')
export class mjBizAppsReferralsReferralEscalationEntity extends BaseEntity<mjBizAppsReferralsReferralEscalationEntityType> {
    /**
    * Loads the MJ_BizApps_Referrals: Referral Escalations record from the database
    * @param ID: string - primary key value to load the MJ_BizApps_Referrals: Referral Escalations record.
    * @param EntityRelationshipsToLoad - (optional) the relationships to load
    * @returns {Promise<boolean>} - true if successful, false otherwise
    * @public
    * @async
    * @memberof mjBizAppsReferralsReferralEscalationEntity
    * @method
    * @override
    */
    public async Load(ID: string, EntityRelationshipsToLoad?: string[]) : Promise<boolean> {
        const compositeKey: CompositeKey = new CompositeKey();
        compositeKey.KeyValuePairs.push({ FieldName: 'ID', Value: ID });
        return await super.InnerLoad(compositeKey, EntityRelationshipsToLoad);
    }

    /**
    * * Field Name: ID
    * * Display Name: ID
    * * SQL Data Type: uniqueidentifier
    * * Default Value: newsequentialid()
    */
    get ID(): string {
        return this.Get('ID');
    }
    set ID(value: string) {
        this.Set('ID', value);
    }

    /**
    * * Field Name: ReferralRequestID
    * * Display Name: Referral Request
    * * SQL Data Type: uniqueidentifier
    * * Related Entity/Foreign Key: MJ_BizApps_Referrals: Referral Requests (vwReferralRequests.ID)
    */
    get ReferralRequestID(): string {
        return this.Get('ReferralRequestID');
    }
    set ReferralRequestID(value: string) {
        this.Set('ReferralRequestID', value);
    }

    /**
    * * Field Name: ReferralAssignmentID
    * * Display Name: Referral Assignment
    * * SQL Data Type: uniqueidentifier
    * * Related Entity/Foreign Key: MJ_BizApps_Referrals: Referral Assignments (vwReferralAssignments.ID)
    */
    get ReferralAssignmentID(): string | null {
        return this.Get('ReferralAssignmentID');
    }
    set ReferralAssignmentID(value: string | null) {
        this.Set('ReferralAssignmentID', value);
    }

    /**
    * * Field Name: EscalationLevel
    * * Display Name: Escalation Level
    * * SQL Data Type: int
    * * Default Value: 1
    */
    get EscalationLevel(): number {
        return this.Get('EscalationLevel');
    }
    set EscalationLevel(value: number) {
        this.Set('EscalationLevel', value);
    }

    /**
    * * Field Name: TriggerType
    * * Display Name: Trigger Type
    * * SQL Data Type: nvarchar(60)
    * * Default Value: SLAWarning
    * * Value List Type: List
    * * Possible Values
    *   * CapacityExhausted
    *   * CascadeExhausted
    *   * ManualEscalation
    *   * SLABreach
    *   * SLAWarning
    *   * UrgentUnassigned
    */
    get TriggerType(): 'CapacityExhausted' | 'CascadeExhausted' | 'ManualEscalation' | 'SLABreach' | 'SLAWarning' | 'UrgentUnassigned' {
        return this.Get('TriggerType');
    }
    set TriggerType(value: 'CapacityExhausted' | 'CascadeExhausted' | 'ManualEscalation' | 'SLABreach' | 'SLAWarning' | 'UrgentUnassigned') {
        this.Set('TriggerType', value);
    }

    /**
    * * Field Name: Status
    * * Display Name: Status
    * * SQL Data Type: nvarchar(40)
    * * Default Value: Open
    * * Value List Type: List
    * * Possible Values
    *   * Acknowledged
    *   * Dismissed
    *   * Open
    *   * Resolved
    */
    get Status(): 'Acknowledged' | 'Dismissed' | 'Open' | 'Resolved' {
        return this.Get('Status');
    }
    set Status(value: 'Acknowledged' | 'Dismissed' | 'Open' | 'Resolved') {
        this.Set('Status', value);
    }

    /**
    * * Field Name: RecommendedAction
    * * Display Name: Recommended Action
    * * SQL Data Type: nvarchar(60)
    * * Default Value: Notify
    * * Value List Type: List
    * * Possible Values 
    *   * AdminAlert
    *   * EscalateToTier
    *   * Notify
    *   * Reassign
    */
    get RecommendedAction(): 'AdminAlert' | 'EscalateToTier' | 'Notify' | 'Reassign' {
        return this.Get('RecommendedAction');
    }
    set RecommendedAction(value: 'AdminAlert' | 'EscalateToTier' | 'Notify' | 'Reassign') {
        this.Set('RecommendedAction', value);
    }

    /**
    * * Field Name: Notes
    * * Display Name: Notes
    * * SQL Data Type: nvarchar(MAX)
    */
    get Notes(): string | null {
        return this.Get('Notes');
    }
    set Notes(value: string | null) {
        this.Set('Notes', value);
    }

    /**
    * * Field Name: TriggeredAt
    * * Display Name: Triggered At
    * * SQL Data Type: datetimeoffset
    * * Default Value: sysdatetimeoffset()
    */
    get TriggeredAt(): Date {
        return this.Get('TriggeredAt');
    }
    set TriggeredAt(value: Date) {
        this.Set('TriggeredAt', value);
    }

    /**
    * * Field Name: AcknowledgedAt
    * * Display Name: Acknowledged At
    * * SQL Data Type: datetimeoffset
    */
    get AcknowledgedAt(): Date | null {
        return this.Get('AcknowledgedAt');
    }
    set AcknowledgedAt(value: Date | null) {
        this.Set('AcknowledgedAt', value);
    }

    /**
    * * Field Name: ResolvedAt
    * * Display Name: Resolved At
    * * SQL Data Type: datetimeoffset
    */
    get ResolvedAt(): Date | null {
        return this.Get('ResolvedAt');
    }
    set ResolvedAt(value: Date | null) {
        this.Set('ResolvedAt', value);
    }

    /**
    * * Field Name: DedupKey
    * * Display Name: Dedup Key
    * * SQL Data Type: nvarchar(200)
    */
    get DedupKey(): string | null {
        return this.Get('DedupKey');
    }
    set DedupKey(value: string | null) {
        this.Set('DedupKey', value);
    }

    /**
    * * Field Name: LinkedTaskID
    * * Display Name: Linked Task
    * * SQL Data Type: uniqueidentifier
    */
    get LinkedTaskID(): string | null {
        return this.Get('LinkedTaskID');
    }
    set LinkedTaskID(value: string | null) {
        this.Set('LinkedTaskID', value);
    }

    /**
    * * Field Name: AcknowledgedByPersonID
    * * Display Name: Acknowledged By Person
    * * SQL Data Type: uniqueidentifier
    * * Related Entity/Foreign Key: MJ_BizApps_Common: People (vwPeople.ID)
    */
    get AcknowledgedByPersonID(): string | null {
        return this.Get('AcknowledgedByPersonID');
    }
    set AcknowledgedByPersonID(value: string | null) {
        this.Set('AcknowledgedByPersonID', value);
    }

    /**
    * * Field Name: ResolvedByPersonID
    * * Display Name: Resolved By Person
    * * SQL Data Type: uniqueidentifier
    * * Related Entity/Foreign Key: MJ_BizApps_Common: People (vwPeople.ID)
    */
    get ResolvedByPersonID(): string | null {
        return this.Get('ResolvedByPersonID');
    }
    set ResolvedByPersonID(value: string | null) {
        this.Set('ResolvedByPersonID', value);
    }

    /**
    * * Field Name: ResolutionNotes
    * * Display Name: Resolution Notes
    * * SQL Data Type: nvarchar(MAX)
    */
    get ResolutionNotes(): string | null {
        return this.Get('ResolutionNotes');
    }
    set ResolutionNotes(value: string | null) {
        this.Set('ResolutionNotes', value);
    }

    /**
    * * Field Name: AIRationaleJSON
    * * Display Name: AIRationale JSON
    * * SQL Data Type: nvarchar(MAX)
    */
    get AIRationaleJSON(): string | null {
        return this.Get('AIRationaleJSON');
    }
    set AIRationaleJSON(value: string | null) {
        this.Set('AIRationaleJSON', value);
    }

    /**
    * * Field Name: __mj_CreatedAt
    * * Display Name: Created At
    * * SQL Data Type: datetimeoffset
    * * Default Value: getutcdate()
    */
    get __mj_CreatedAt(): Date {
        return this.Get('__mj_CreatedAt');
    }

    /**
    * * Field Name: __mj_UpdatedAt
    * * Display Name: Updated At
    * * SQL Data Type: datetimeoffset
    * * Default Value: getutcdate()
    */
    get __mj_UpdatedAt(): Date {
        return this.Get('__mj_UpdatedAt');
    }
}


/**
 * MJ_BizApps_Referrals: Referral Outcomes - strongly typed entity sub-class
 * * Schema: __mj_BizAppsReferrals
 * * Base Table: ReferralOutcome
 * * Base View: vwReferralOutcomes
 * * @description Terminal outcome recorded when a ReferralAssignment is marked complete.
 * * Primary Key: ID
 * @extends {BaseEntity}
 * @class
 * @public
 */
@RegisterClass(BaseEntity, 'MJ_BizApps_Referrals: Referral Outcomes')
export class mjBizAppsReferralsReferralOutcomeEntity extends BaseEntity<mjBizAppsReferralsReferralOutcomeEntityType> {
    /**
    * Loads the MJ_BizApps_Referrals: Referral Outcomes record from the database
    * @param ID: string - primary key value to load the MJ_BizApps_Referrals: Referral Outcomes record.
    * @param EntityRelationshipsToLoad - (optional) the relationships to load
    * @returns {Promise<boolean>} - true if successful, false otherwise
    * @public
    * @async
    * @memberof mjBizAppsReferralsReferralOutcomeEntity
    * @method
    * @override
    */
    public async Load(ID: string, EntityRelationshipsToLoad?: string[]) : Promise<boolean> {
        const compositeKey: CompositeKey = new CompositeKey();
        compositeKey.KeyValuePairs.push({ FieldName: 'ID', Value: ID });
        return await super.InnerLoad(compositeKey, EntityRelationshipsToLoad);
    }

    /**
    * * Field Name: ID
    * * Display Name: ID
    * * SQL Data Type: uniqueidentifier
    * * Default Value: newsequentialid()
    */
    get ID(): string {
        return this.Get('ID');
    }
    set ID(value: string) {
        this.Set('ID', value);
    }

    /**
    * * Field Name: ReferralRequestID
    * * Display Name: Referral Request
    * * SQL Data Type: uniqueidentifier
    * * Related Entity/Foreign Key: MJ_BizApps_Referrals: Referral Requests (vwReferralRequests.ID)
    */
    get ReferralRequestID(): string {
        return this.Get('ReferralRequestID');
    }
    set ReferralRequestID(value: string) {
        this.Set('ReferralRequestID', value);
    }

    /**
    * * Field Name: ReferralAssignmentID
    * * Display Name: Referral Assignment
    * * SQL Data Type: uniqueidentifier
    * * Related Entity/Foreign Key: MJ_BizApps_Referrals: Referral Assignments (vwReferralAssignments.ID)
    */
    get ReferralAssignmentID(): string {
        return this.Get('ReferralAssignmentID');
    }
    set ReferralAssignmentID(value: string) {
        this.Set('ReferralAssignmentID', value);
    }

    /**
    * * Field Name: ProfessionalProfileID
    * * Display Name: Professional Profile
    * * SQL Data Type: uniqueidentifier
    * * Related Entity/Foreign Key: MJ_BizApps_Referrals: Professional Profiles (vwProfessionalProfiles.ID)
    */
    get ProfessionalProfileID(): string {
        return this.Get('ProfessionalProfileID');
    }
    set ProfessionalProfileID(value: string) {
        this.Set('ProfessionalProfileID', value);
    }

    /**
    * * Field Name: OutcomeStatus
    * * Display Name: Outcome Status
    * * SQL Data Type: nvarchar(60)
    * * Default Value: Completed
    * * Value List Type: List
    * * Possible Values 
    *   * Cancelled
    *   * Completed
    *   * NoEngagement
    */
    get OutcomeStatus(): 'Cancelled' | 'Completed' | 'NoEngagement' {
        return this.Get('OutcomeStatus');
    }
    set OutcomeStatus(value: 'Cancelled' | 'Completed' | 'NoEngagement') {
        this.Set('OutcomeStatus', value);
    }

    /**
    * * Field Name: ResponseHours
    * * Display Name: Response Hours
    * * SQL Data Type: decimal(6, 2)
    */
    get ResponseHours(): number | null {
        return this.Get('ResponseHours');
    }
    set ResponseHours(value: number | null) {
        this.Set('ResponseHours', value);
    }

    /**
    * * Field Name: CompletionNotes
    * * Display Name: Completion Notes
    * * SQL Data Type: nvarchar(MAX)
    */
    get CompletionNotes(): string | null {
        return this.Get('CompletionNotes');
    }
    set CompletionNotes(value: string | null) {
        this.Set('CompletionNotes', value);
    }

    /**
    * * Field Name: CompletedAt
    * * Display Name: Completed At
    * * SQL Data Type: datetimeoffset
    * * Default Value: sysdatetimeoffset()
    */
    get CompletedAt(): Date {
        return this.Get('CompletedAt');
    }
    set CompletedAt(value: Date) {
        this.Set('CompletedAt', value);
    }

    /**
    * * Field Name: FeeAmount
    * * Display Name: Fee Amount
    * * SQL Data Type: decimal(10, 2)
    */
    get FeeAmount(): number | null {
        return this.Get('FeeAmount');
    }
    set FeeAmount(value: number | null) {
        this.Set('FeeAmount', value);
    }

    /**
    * * Field Name: __mj_CreatedAt
    * * Display Name: Created At
    * * SQL Data Type: datetimeoffset
    * * Default Value: getutcdate()
    */
    get __mj_CreatedAt(): Date {
        return this.Get('__mj_CreatedAt');
    }

    /**
    * * Field Name: __mj_UpdatedAt
    * * Display Name: Updated At
    * * SQL Data Type: datetimeoffset
    * * Default Value: getutcdate()
    */
    get __mj_UpdatedAt(): Date {
        return this.Get('__mj_UpdatedAt');
    }
}


/**
 * MJ_BizApps_Referrals: Professional Availability Windows - strongly typed entity sub-class
 * * Schema: __mj_BizAppsReferrals
 * * Base Table: ProfessionalAvailabilityWindow
 * * Base View: vwProfessionalAvailabilityWindows
 * * @description Recurring, date-range, or blackout availability windows for a ProfessionalProfile.
 * * Primary Key: ID
 * @extends {BaseEntity}
 * @class
 * @public
 */
@RegisterClass(BaseEntity, 'MJ_BizApps_Referrals: Professional Availability Windows')
export class mjBizAppsReferralsProfessionalAvailabilityWindowEntity extends BaseEntity<mjBizAppsReferralsProfessionalAvailabilityWindowEntityType> {
    /**
    * Loads the MJ_BizApps_Referrals: Professional Availability Windows record from the database
    * @param ID: string - primary key value to load the MJ_BizApps_Referrals: Professional Availability Windows record.
    * @param EntityRelationshipsToLoad - (optional) the relationships to load
    * @returns {Promise<boolean>} - true if successful, false otherwise
    * @public
    * @async
    * @memberof mjBizAppsReferralsProfessionalAvailabilityWindowEntity
    * @method
    * @override
    */
    public async Load(ID: string, EntityRelationshipsToLoad?: string[]) : Promise<boolean> {
        const compositeKey: CompositeKey = new CompositeKey();
        compositeKey.KeyValuePairs.push({ FieldName: 'ID', Value: ID });
        return await super.InnerLoad(compositeKey, EntityRelationshipsToLoad);
    }

    /**
    * * Field Name: ID
    * * Display Name: ID
    * * SQL Data Type: uniqueidentifier
    * * Default Value: newsequentialid()
    */
    get ID(): string {
        return this.Get('ID');
    }
    set ID(value: string) {
        this.Set('ID', value);
    }

    /**
    * * Field Name: ProfessionalProfileID
    * * Display Name: Professional Profile
    * * SQL Data Type: uniqueidentifier
    * * Related Entity/Foreign Key: MJ_BizApps_Referrals: Professional Profiles (vwProfessionalProfiles.ID)
    */
    get ProfessionalProfileID(): string {
        return this.Get('ProfessionalProfileID');
    }
    set ProfessionalProfileID(value: string) {
        this.Set('ProfessionalProfileID', value);
    }

    /**
    * * Field Name: WindowType
    * * Display Name: Window Type
    * * SQL Data Type: nvarchar(40)
    * * Default Value: Recurring
    * * Value List Type: List
    * * Possible Values 
    *   * Blackout
    *   * DateRange
    *   * Recurring
    */
    get WindowType(): 'Blackout' | 'DateRange' | 'Recurring' {
        return this.Get('WindowType');
    }
    set WindowType(value: 'Blackout' | 'DateRange' | 'Recurring') {
        this.Set('WindowType', value);
    }

    /**
    * * Field Name: DayOfWeek
    * * Display Name: Day Of Week
    * * SQL Data Type: int
    */
    get DayOfWeek(): number | null {
        return this.Get('DayOfWeek');
    }
    set DayOfWeek(value: number | null) {
        this.Set('DayOfWeek', value);
    }

    /**
    * * Field Name: StartTimeMinutes
    * * Display Name: Start Time Minutes
    * * SQL Data Type: int
    */
    get StartTimeMinutes(): number | null {
        return this.Get('StartTimeMinutes');
    }
    set StartTimeMinutes(value: number | null) {
        this.Set('StartTimeMinutes', value);
    }

    /**
    * * Field Name: EndTimeMinutes
    * * Display Name: End Time Minutes
    * * SQL Data Type: int
    */
    get EndTimeMinutes(): number | null {
        return this.Get('EndTimeMinutes');
    }
    set EndTimeMinutes(value: number | null) {
        this.Set('EndTimeMinutes', value);
    }

    /**
    * * Field Name: StartDate
    * * Display Name: Start Date
    * * SQL Data Type: datetimeoffset
    */
    get StartDate(): Date | null {
        return this.Get('StartDate');
    }
    set StartDate(value: Date | null) {
        this.Set('StartDate', value);
    }

    /**
    * * Field Name: EndDate
    * * Display Name: End Date
    * * SQL Data Type: datetimeoffset
    */
    get EndDate(): Date | null {
        return this.Get('EndDate');
    }
    set EndDate(value: Date | null) {
        this.Set('EndDate', value);
    }

    /**
    * * Field Name: IsAvailable
    * * Display Name: Is Available
    * * SQL Data Type: bit
    * * Default Value: 1
    */
    get IsAvailable(): boolean {
        return this.Get('IsAvailable');
    }
    set IsAvailable(value: boolean) {
        this.Set('IsAvailable', value);
    }

    /**
    * * Field Name: TimeZone
    * * Display Name: Time Zone
    * * SQL Data Type: nvarchar(100)
    * * Default Value: UTC
    */
    get TimeZone(): string {
        return this.Get('TimeZone');
    }
    set TimeZone(value: string) {
        this.Set('TimeZone', value);
    }

    /**
    * * Field Name: Notes
    * * Display Name: Notes
    * * SQL Data Type: nvarchar(255)
    */
    get Notes(): string | null {
        return this.Get('Notes');
    }
    set Notes(value: string | null) {
        this.Set('Notes', value);
    }

    /**
    * * Field Name: __mj_CreatedAt
    * * Display Name: Created At
    * * SQL Data Type: datetimeoffset
    * * Default Value: getutcdate()
    */
    get __mj_CreatedAt(): Date {
        return this.Get('__mj_CreatedAt');
    }

    /**
    * * Field Name: __mj_UpdatedAt
    * * Display Name: Updated At
    * * SQL Data Type: datetimeoffset
    * * Default Value: getutcdate()
    */
    get __mj_UpdatedAt(): Date {
        return this.Get('__mj_UpdatedAt');
    }
}


/**
 * MJ_BizApps_Referrals: Reciprocity Snapshots - strongly typed entity sub-class
 * * Schema: __mj_BizAppsReferrals
 * * Base Table: ReciprocitySnapshot
 * * Base View: vwReciprocitySnapshots
 * * @description Periodic snapshot of a ProfessionalProfile referral give/receive balance used to compute ReciprocityIndex.
 * * Primary Key: ID
 * @extends {BaseEntity}
 * @class
 * @public
 */
@RegisterClass(BaseEntity, 'MJ_BizApps_Referrals: Reciprocity Snapshots')
export class mjBizAppsReferralsReciprocitySnapshotEntity extends BaseEntity<mjBizAppsReferralsReciprocitySnapshotEntityType> {
    /**
    * Loads the MJ_BizApps_Referrals: Reciprocity Snapshots record from the database
    * @param ID: string - primary key value to load the MJ_BizApps_Referrals: Reciprocity Snapshots record.
    * @param EntityRelationshipsToLoad - (optional) the relationships to load
    * @returns {Promise<boolean>} - true if successful, false otherwise
    * @public
    * @async
    * @memberof mjBizAppsReferralsReciprocitySnapshotEntity
    * @method
    * @override
    */
    public async Load(ID: string, EntityRelationshipsToLoad?: string[]) : Promise<boolean> {
        const compositeKey: CompositeKey = new CompositeKey();
        compositeKey.KeyValuePairs.push({ FieldName: 'ID', Value: ID });
        return await super.InnerLoad(compositeKey, EntityRelationshipsToLoad);
    }

    /**
    * * Field Name: ID
    * * Display Name: ID
    * * SQL Data Type: uniqueidentifier
    * * Default Value: newsequentialid()
    */
    get ID(): string {
        return this.Get('ID');
    }
    set ID(value: string) {
        this.Set('ID', value);
    }

    /**
    * * Field Name: ProfessionalProfileID
    * * Display Name: Professional Profile
    * * SQL Data Type: uniqueidentifier
    * * Related Entity/Foreign Key: MJ_BizApps_Referrals: Professional Profiles (vwProfessionalProfiles.ID)
    */
    get ProfessionalProfileID(): string {
        return this.Get('ProfessionalProfileID');
    }
    set ProfessionalProfileID(value: string) {
        this.Set('ProfessionalProfileID', value);
    }

    /**
    * * Field Name: SnapshotDate
    * * Display Name: Snapshot Date
    * * SQL Data Type: datetimeoffset
    * * Default Value: sysdatetimeoffset()
    */
    get SnapshotDate(): Date {
        return this.Get('SnapshotDate');
    }
    set SnapshotDate(value: Date) {
        this.Set('SnapshotDate', value);
    }

    /**
    * * Field Name: PeriodStartDate
    * * Display Name: Period Start Date
    * * SQL Data Type: datetimeoffset
    */
    get PeriodStartDate(): Date {
        return this.Get('PeriodStartDate');
    }
    set PeriodStartDate(value: Date) {
        this.Set('PeriodStartDate', value);
    }

    /**
    * * Field Name: PeriodEndDate
    * * Display Name: Period End Date
    * * SQL Data Type: datetimeoffset
    */
    get PeriodEndDate(): Date {
        return this.Get('PeriodEndDate');
    }
    set PeriodEndDate(value: Date) {
        this.Set('PeriodEndDate', value);
    }

    /**
    * * Field Name: ReferralsGivenCount
    * * Display Name: Referrals Given Count
    * * SQL Data Type: int
    * * Default Value: 0
    */
    get ReferralsGivenCount(): number {
        return this.Get('ReferralsGivenCount');
    }
    set ReferralsGivenCount(value: number) {
        this.Set('ReferralsGivenCount', value);
    }

    /**
    * * Field Name: ReferralsReceivedCount
    * * Display Name: Referrals Received Count
    * * SQL Data Type: int
    * * Default Value: 0
    */
    get ReferralsReceivedCount(): number {
        return this.Get('ReferralsReceivedCount');
    }
    set ReferralsReceivedCount(value: number) {
        this.Set('ReferralsReceivedCount', value);
    }

    /**
    * * Field Name: ReciprocityIndex
    * * Display Name: Reciprocity Index
    * * SQL Data Type: decimal(5, 2)
    * * Default Value: 0.00
    */
    get ReciprocityIndex(): number {
        return this.Get('ReciprocityIndex');
    }
    set ReciprocityIndex(value: number) {
        this.Set('ReciprocityIndex', value);
    }

    /**
    * * Field Name: AcceptedCount
    * * Display Name: Accepted Count
    * * SQL Data Type: int
    * * Default Value: 0
    */
    get AcceptedCount(): number {
        return this.Get('AcceptedCount');
    }
    set AcceptedCount(value: number) {
        this.Set('AcceptedCount', value);
    }

    /**
    * * Field Name: ResolvedCount
    * * Display Name: Resolved Count
    * * SQL Data Type: int
    * * Default Value: 0
    */
    get ResolvedCount(): number {
        return this.Get('ResolvedCount');
    }
    set ResolvedCount(value: number) {
        this.Set('ResolvedCount', value);
    }

    /**
    * * Field Name: SLABreachCount
    * * Display Name: SLA Breach Count
    * * SQL Data Type: int
    * * Default Value: 0
    */
    get SLABreachCount(): number {
        return this.Get('SLABreachCount');
    }
    set SLABreachCount(value: number) {
        this.Set('SLABreachCount', value);
    }

    /**
    * * Field Name: AcceptanceRate
    * * Display Name: Acceptance Rate
    * * SQL Data Type: decimal(5, 2)
    * * Default Value: 0
    */
    get AcceptanceRate(): number {
        return this.Get('AcceptanceRate');
    }
    set AcceptanceRate(value: number) {
        this.Set('AcceptanceRate', value);
    }

    /**
    * * Field Name: MedianResponseHours
    * * Display Name: Median Response Hours
    * * SQL Data Type: decimal(6, 2)
    */
    get MedianResponseHours(): number | null {
        return this.Get('MedianResponseHours');
    }
    set MedianResponseHours(value: number | null) {
        this.Set('MedianResponseHours', value);
    }

    /**
    * * Field Name: AttributedFeeTotal
    * * Display Name: Attributed Fee Total
    * * SQL Data Type: decimal(12, 2)
    * * Default Value: 0
    */
    get AttributedFeeTotal(): number {
        return this.Get('AttributedFeeTotal');
    }
    set AttributedFeeTotal(value: number) {
        this.Set('AttributedFeeTotal', value);
    }

    /**
    * * Field Name: __mj_CreatedAt
    * * Display Name: Created At
    * * SQL Data Type: datetimeoffset
    * * Default Value: getutcdate()
    */
    get __mj_CreatedAt(): Date {
        return this.Get('__mj_CreatedAt');
    }

    /**
    * * Field Name: __mj_UpdatedAt
    * * Display Name: Updated At
    * * SQL Data Type: datetimeoffset
    * * Default Value: getutcdate()
    */
    get __mj_UpdatedAt(): Date {
        return this.Get('__mj_UpdatedAt');
    }
}


