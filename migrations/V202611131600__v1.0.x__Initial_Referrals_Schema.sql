-- =============================================================================
-- BizApps Referrals — Initial Schema (__mj_BizAppsReferrals)
--
-- 10 Core Entities:
--   1.  PracticeArea              — Hierarchical practice / specialty taxonomy
--   2.  Jurisdiction              — Hierarchical geographic / licensing jurisdictions
--   3.  ReferralTier              — Service-level tiers (SLA hours, max cascade, weights)
--   4.  ProfessionalProfile       — Verified member directory profile
--   5.  ProfessionalPracticeArea  — Professional <-> PracticeArea junction + proficiency
--   6.  ProfessionalJurisdiction  — Professional <-> Jurisdiction junction + bar/license
--   7.  ReferralRequest           — Seeker intake & matter request
--   8.  ConflictCheckParty        — Adverse / related parties for conflict screening
--   9.  ReferralAssignment        — Sequential cascade offer, score, conflict & SLA state
--   10. ReferralFeedback          — Post-referral outcome & rating telemetry
-- =============================================================================

IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = N'__mj_BizAppsReferrals')
BEGIN
    EXEC('CREATE SCHEMA [__mj_BizAppsReferrals]');
END
GO

-- =============================================================================
-- 1. PracticeArea
-- =============================================================================
CREATE TABLE [__mj_BizAppsReferrals].[PracticeArea] (
    [ID] UNIQUEIDENTIFIER NOT NULL
        CONSTRAINT [PK_PracticeArea] PRIMARY KEY
        CONSTRAINT [DF_PracticeArea_ID] DEFAULT (NEWSEQUENTIALID()),
    [ParentID] UNIQUEIDENTIFIER NULL
        CONSTRAINT [FK_PracticeArea_Parent] FOREIGN KEY REFERENCES [__mj_BizAppsReferrals].[PracticeArea]([ID]),
    [Name] NVARCHAR(150) NOT NULL,
    [Code] NVARCHAR(50) NOT NULL
        CONSTRAINT [UQ_PracticeArea_Code] UNIQUE,
    [Category] NVARCHAR(100) NULL,
    [Description] NVARCHAR(MAX) NULL,
    [IconClass] NVARCHAR(100) NULL,
    [DisplayRank] INT NOT NULL
        CONSTRAINT [DF_PracticeArea_DisplayRank] DEFAULT (100),
    [IsActive] BIT NOT NULL
        CONSTRAINT [DF_PracticeArea_IsActive] DEFAULT (1)
);
GO

CREATE INDEX [IX_PracticeArea_ParentID] ON [__mj_BizAppsReferrals].[PracticeArea] ([ParentID]);
CREATE INDEX [IX_PracticeArea_IsActive_DisplayRank] ON [__mj_BizAppsReferrals].[PracticeArea] ([IsActive], [DisplayRank]);
GO

-- =============================================================================
-- 2. Jurisdiction
-- =============================================================================
CREATE TABLE [__mj_BizAppsReferrals].[Jurisdiction] (
    [ID] UNIQUEIDENTIFIER NOT NULL
        CONSTRAINT [PK_Jurisdiction] PRIMARY KEY
        CONSTRAINT [DF_Jurisdiction_ID] DEFAULT (NEWSEQUENTIALID()),
    [ParentID] UNIQUEIDENTIFIER NULL
        CONSTRAINT [FK_Jurisdiction_Parent] FOREIGN KEY REFERENCES [__mj_BizAppsReferrals].[Jurisdiction]([ID]),
    [Name] NVARCHAR(150) NOT NULL,
    [Code] NVARCHAR(50) NOT NULL
        CONSTRAINT [UQ_Jurisdiction_Code] UNIQUE,
    [JurisdictionType] NVARCHAR(30) NOT NULL
        CONSTRAINT [DF_Jurisdiction_Type] DEFAULT (N'State')
        CONSTRAINT [CK_Jurisdiction_Type] CHECK ([JurisdictionType] IN (N'Country', N'State', N'Province', N'Federal', N'Municipal', N'International')),
    [CountryCode] NVARCHAR(10) NOT NULL
        CONSTRAINT [DF_Jurisdiction_CountryCode] DEFAULT (N'US'),
    [StateProvinceCode] NVARCHAR(20) NULL,
    [IsActive] BIT NOT NULL
        CONSTRAINT [DF_Jurisdiction_IsActive] DEFAULT (1)
);
GO

CREATE INDEX [IX_Jurisdiction_ParentID] ON [__mj_BizAppsReferrals].[Jurisdiction] ([ParentID]);
CREATE INDEX [IX_Jurisdiction_Country_State] ON [__mj_BizAppsReferrals].[Jurisdiction] ([CountryCode], [StateProvinceCode]);
GO

-- =============================================================================
-- 3. ReferralTier
-- =============================================================================
CREATE TABLE [__mj_BizAppsReferrals].[ReferralTier] (
    [ID] UNIQUEIDENTIFIER NOT NULL
        CONSTRAINT [PK_ReferralTier] PRIMARY KEY
        CONSTRAINT [DF_ReferralTier_ID] DEFAULT (NEWSEQUENTIALID()),
    [Name] NVARCHAR(100) NOT NULL,
    [Code] NVARCHAR(50) NOT NULL
        CONSTRAINT [UQ_ReferralTier_Code] UNIQUE,
    [SLAResponseHours] INT NOT NULL
        CONSTRAINT [DF_ReferralTier_SLAResponseHours] DEFAULT (24)
        CONSTRAINT [CK_ReferralTier_SLAResponseHours] CHECK ([SLAResponseHours] > 0),
    [MaxCascadeAttempts] INT NOT NULL
        CONSTRAINT [DF_ReferralTier_MaxCascadeAttempts] DEFAULT (3)
        CONSTRAINT [CK_ReferralTier_MaxCascadeAttempts] CHECK ([MaxCascadeAttempts] > 0),
    [PriorityWeight] DECIMAL(5,2) NOT NULL
        CONSTRAINT [DF_ReferralTier_PriorityWeight] DEFAULT (1.00),
    [RequireConflictCheck] BIT NOT NULL
        CONSTRAINT [DF_ReferralTier_RequireConflictCheck] DEFAULT (1),
    [Description] NVARCHAR(MAX) NULL,
    [IsActive] BIT NOT NULL
        CONSTRAINT [DF_ReferralTier_IsActive] DEFAULT (1)
);
GO

-- =============================================================================
-- 4. ProfessionalProfile
-- =============================================================================
CREATE TABLE [__mj_BizAppsReferrals].[ProfessionalProfile] (
    [ID] UNIQUEIDENTIFIER NOT NULL
        CONSTRAINT [PK_ProfessionalProfile] PRIMARY KEY
        CONSTRAINT [DF_ProfessionalProfile_ID] DEFAULT (NEWSEQUENTIALID()),
    [PersonID] UNIQUEIDENTIFIER NULL
        CONSTRAINT [FK_ProfessionalProfile_Person] FOREIGN KEY REFERENCES [__mj_BizAppsCommon].[Person]([ID]),
    [OrganizationID] UNIQUEIDENTIFIER NULL
        CONSTRAINT [FK_ProfessionalProfile_Organization] FOREIGN KEY REFERENCES [__mj_BizAppsCommon].[Organization]([ID]),
    [UserID] UNIQUEIDENTIFIER NULL
        CONSTRAINT [FK_ProfessionalProfile_User] FOREIGN KEY REFERENCES [__mj].[User]([ID]),
    [DisplayName] NVARCHAR(200) NOT NULL,
    [FirmName] NVARCHAR(200) NULL,
    [Email] NVARCHAR(255) NOT NULL,
    [Phone] NVARCHAR(50) NULL,
    [BarOrLicenseNumber] NVARCHAR(100) NULL,
    [VerificationStatus] NVARCHAR(30) NOT NULL
        CONSTRAINT [DF_ProfessionalProfile_VerificationStatus] DEFAULT (N'Pending')
        CONSTRAINT [CK_ProfessionalProfile_VerificationStatus] CHECK ([VerificationStatus] IN (N'Pending', N'Verified', N'Suspended', N'Expired')),
    [AvailabilityStatus] NVARCHAR(30) NOT NULL
        CONSTRAINT [DF_ProfessionalProfile_AvailabilityStatus] DEFAULT (N'Available')
        CONSTRAINT [CK_ProfessionalProfile_AvailabilityStatus] CHECK ([AvailabilityStatus] IN (N'Available', N'Limited', N'Unavailable', N'OnLeave')),
    [Bio] NVARCHAR(MAX) NULL,
    [YearsExperience] INT NOT NULL
        CONSTRAINT [DF_ProfessionalProfile_YearsExperience] DEFAULT (0)
        CONSTRAINT [CK_ProfessionalProfile_YearsExperience] CHECK ([YearsExperience] >= 0),
    [Languages] NVARCHAR(255) NULL
        CONSTRAINT [DF_ProfessionalProfile_Languages] DEFAULT (N'English'),
    [HourlyRateMin] DECIMAL(10,2) NULL,
    [HourlyRateMax] DECIMAL(10,2) NULL,
    [AcceptsProBono] BIT NOT NULL
        CONSTRAINT [DF_ProfessionalProfile_AcceptsProBono] DEFAULT (0),
    [AcceptsContingency] BIT NOT NULL
        CONSTRAINT [DF_ProfessionalProfile_AcceptsContingency] DEFAULT (0),
    [ActiveReferralCount] INT NOT NULL
        CONSTRAINT [DF_ProfessionalProfile_ActiveReferralCount] DEFAULT (0)
        CONSTRAINT [CK_ProfessionalProfile_ActiveReferralCount] CHECK ([ActiveReferralCount] >= 0),
    [MaxConcurrentReferrals] INT NOT NULL
        CONSTRAINT [DF_ProfessionalProfile_MaxConcurrentReferrals] DEFAULT (10)
        CONSTRAINT [CK_ProfessionalProfile_MaxConcurrentReferrals] CHECK ([MaxConcurrentReferrals] > 0),
    [AverageResponseHours] DECIMAL(6,2) NULL,
    [AverageRating] DECIMAL(3,2) NULL,
    [TotalAcceptedCount] INT NOT NULL
        CONSTRAINT [DF_ProfessionalProfile_TotalAcceptedCount] DEFAULT (0),
    [TotalCompletedCount] INT NOT NULL
        CONSTRAINT [DF_ProfessionalProfile_TotalCompletedCount] DEFAULT (0),
    [IsActive] BIT NOT NULL
        CONSTRAINT [DF_ProfessionalProfile_IsActive] DEFAULT (1),
    CONSTRAINT [CK_ProfessionalProfile_RateRange] CHECK ([HourlyRateMin] IS NULL OR [HourlyRateMax] IS NULL OR [HourlyRateMax] >= [HourlyRateMin])
);
GO

CREATE INDEX [IX_ProfessionalProfile_Verification_Availability] ON [__mj_BizAppsReferrals].[ProfessionalProfile] ([VerificationStatus], [AvailabilityStatus], [IsActive]);
CREATE INDEX [IX_ProfessionalProfile_UserID] ON [__mj_BizAppsReferrals].[ProfessionalProfile] ([UserID]);
CREATE INDEX [IX_ProfessionalProfile_PersonID] ON [__mj_BizAppsReferrals].[ProfessionalProfile] ([PersonID]);
GO

-- =============================================================================
-- 5. ProfessionalPracticeArea
-- =============================================================================
CREATE TABLE [__mj_BizAppsReferrals].[ProfessionalPracticeArea] (
    [ID] UNIQUEIDENTIFIER NOT NULL
        CONSTRAINT [PK_ProfessionalPracticeArea] PRIMARY KEY
        CONSTRAINT [DF_ProfessionalPracticeArea_ID] DEFAULT (NEWSEQUENTIALID()),
    [ProfessionalProfileID] UNIQUEIDENTIFIER NOT NULL
        CONSTRAINT [FK_ProfessionalPracticeArea_Profile] FOREIGN KEY REFERENCES [__mj_BizAppsReferrals].[ProfessionalProfile]([ID]),
    [PracticeAreaID] UNIQUEIDENTIFIER NOT NULL
        CONSTRAINT [FK_ProfessionalPracticeArea_PracticeArea] FOREIGN KEY REFERENCES [__mj_BizAppsReferrals].[PracticeArea]([ID]),
    [ProficiencyLevel] NVARCHAR(30) NOT NULL
        CONSTRAINT [DF_ProfessionalPracticeArea_Proficiency] DEFAULT (N'Standard')
        CONSTRAINT [CK_ProfessionalPracticeArea_Proficiency] CHECK ([ProficiencyLevel] IN (N'Primary', N'Standard', N'Emerging')),
    [YearsInPractice] INT NOT NULL
        CONSTRAINT [DF_ProfessionalPracticeArea_Years] DEFAULT (0)
        CONSTRAINT [CK_ProfessionalPracticeArea_Years] CHECK ([YearsInPractice] >= 0),
    [IsPrimary] BIT NOT NULL
        CONSTRAINT [DF_ProfessionalPracticeArea_IsPrimary] DEFAULT (0),
    CONSTRAINT [UQ_ProfessionalPracticeArea_Pair] UNIQUE ([ProfessionalProfileID], [PracticeAreaID])
);
GO

CREATE INDEX [IX_ProfessionalPracticeArea_PracticeAreaID] ON [__mj_BizAppsReferrals].[ProfessionalPracticeArea] ([PracticeAreaID]);
GO

-- =============================================================================
-- 6. ProfessionalJurisdiction
-- =============================================================================
CREATE TABLE [__mj_BizAppsReferrals].[ProfessionalJurisdiction] (
    [ID] UNIQUEIDENTIFIER NOT NULL
        CONSTRAINT [PK_ProfessionalJurisdiction] PRIMARY KEY
        CONSTRAINT [DF_ProfessionalJurisdiction_ID] DEFAULT (NEWSEQUENTIALID()),
    [ProfessionalProfileID] UNIQUEIDENTIFIER NOT NULL
        CONSTRAINT [FK_ProfessionalJurisdiction_Profile] FOREIGN KEY REFERENCES [__mj_BizAppsReferrals].[ProfessionalProfile]([ID]),
    [JurisdictionID] UNIQUEIDENTIFIER NOT NULL
        CONSTRAINT [FK_ProfessionalJurisdiction_Jurisdiction] FOREIGN KEY REFERENCES [__mj_BizAppsReferrals].[Jurisdiction]([ID]),
    [LicenseNumber] NVARCHAR(100) NULL,
    [AdmissionYear] INT NULL,
    [StandingStatus] NVARCHAR(30) NOT NULL
        CONSTRAINT [DF_ProfessionalJurisdiction_Standing] DEFAULT (N'GoodStanding')
        CONSTRAINT [CK_ProfessionalJurisdiction_Standing] CHECK ([StandingStatus] IN (N'GoodStanding', N'Inactive', N'ProHacVice', N'Suspended')),
    [IsPrimary] BIT NOT NULL
        CONSTRAINT [DF_ProfessionalJurisdiction_IsPrimary] DEFAULT (0),
    CONSTRAINT [UQ_ProfessionalJurisdiction_Pair] UNIQUE ([ProfessionalProfileID], [JurisdictionID])
);
GO

CREATE INDEX [IX_ProfessionalJurisdiction_JurisdictionID] ON [__mj_BizAppsReferrals].[ProfessionalJurisdiction] ([JurisdictionID]);
GO

-- =============================================================================
-- 7. ReferralRequest
-- =============================================================================
CREATE TABLE [__mj_BizAppsReferrals].[ReferralRequest] (
    [ID] UNIQUEIDENTIFIER NOT NULL
        CONSTRAINT [PK_ReferralRequest] PRIMARY KEY
        CONSTRAINT [DF_ReferralRequest_ID] DEFAULT (NEWSEQUENTIALID()),
    [RequestNumber] NVARCHAR(50) NOT NULL
        CONSTRAINT [UQ_ReferralRequest_RequestNumber] UNIQUE,
    [SeekerName] NVARCHAR(200) NOT NULL,
    [SeekerEmail] NVARCHAR(255) NOT NULL,
    [SeekerPhone] NVARCHAR(50) NULL,
    [SeekerCompany] NVARCHAR(200) NULL,
    [SeekerPersonID] UNIQUEIDENTIFIER NULL
        CONSTRAINT [FK_ReferralRequest_SeekerPerson] FOREIGN KEY REFERENCES [__mj_BizAppsCommon].[Person]([ID]),
    [PracticeAreaID] UNIQUEIDENTIFIER NOT NULL
        CONSTRAINT [FK_ReferralRequest_PracticeArea] FOREIGN KEY REFERENCES [__mj_BizAppsReferrals].[PracticeArea]([ID]),
    [JurisdictionID] UNIQUEIDENTIFIER NOT NULL
        CONSTRAINT [FK_ReferralRequest_Jurisdiction] FOREIGN KEY REFERENCES [__mj_BizAppsReferrals].[Jurisdiction]([ID]),
    [ReferralTierID] UNIQUEIDENTIFIER NOT NULL
        CONSTRAINT [FK_ReferralRequest_ReferralTier] FOREIGN KEY REFERENCES [__mj_BizAppsReferrals].[ReferralTier]([ID]),
    [MatterTitle] NVARCHAR(255) NOT NULL,
    [MatterSummary] NVARCHAR(MAX) NOT NULL,
    [UrgencyLevel] NVARCHAR(20) NOT NULL
        CONSTRAINT [DF_ReferralRequest_UrgencyLevel] DEFAULT (N'Standard')
        CONSTRAINT [CK_ReferralRequest_UrgencyLevel] CHECK ([UrgencyLevel] IN (N'Low', N'Standard', N'High', N'Urgent')),
    [BudgetRange] NVARCHAR(100) NULL,
    [PreferredLanguage] NVARCHAR(100) NULL
        CONSTRAINT [DF_ReferralRequest_PreferredLanguage] DEFAULT (N'English'),
    [RequiresProBono] BIT NOT NULL
        CONSTRAINT [DF_ReferralRequest_RequiresProBono] DEFAULT (0),
    [Status] NVARCHAR(30) NOT NULL
        CONSTRAINT [DF_ReferralRequest_Status] DEFAULT (N'Draft')
        CONSTRAINT [CK_ReferralRequest_Status] CHECK ([Status] IN (N'Draft', N'Submitted', N'Matching', N'Routed', N'Accepted', N'InProgress', N'Completed', N'Exhausted', N'Cancelled')),
    [AssignedProfessionalID] UNIQUEIDENTIFIER NULL
        CONSTRAINT [FK_ReferralRequest_AssignedProfessional] FOREIGN KEY REFERENCES [__mj_BizAppsReferrals].[ProfessionalProfile]([ID]),
    [CurrentCascadeStep] INT NOT NULL
        CONSTRAINT [DF_ReferralRequest_CurrentCascadeStep] DEFAULT (0),
    [SubmittedAt] DATETIMEOFFSET NULL,
    [AcceptedAt] DATETIMEOFFSET NULL,
    [CompletedAt] DATETIMEOFFSET NULL
);
GO

CREATE INDEX [IX_ReferralRequest_Status_Practice_Jurisdiction] ON [__mj_BizAppsReferrals].[ReferralRequest] ([Status], [PracticeAreaID], [JurisdictionID]);
CREATE INDEX [IX_ReferralRequest_AssignedProfessionalID] ON [__mj_BizAppsReferrals].[ReferralRequest] ([AssignedProfessionalID]);
GO

-- =============================================================================
-- 8. ConflictCheckParty
-- =============================================================================
CREATE TABLE [__mj_BizAppsReferrals].[ConflictCheckParty] (
    [ID] UNIQUEIDENTIFIER NOT NULL
        CONSTRAINT [PK_ConflictCheckParty] PRIMARY KEY
        CONSTRAINT [DF_ConflictCheckParty_ID] DEFAULT (NEWSEQUENTIALID()),
    [ReferralRequestID] UNIQUEIDENTIFIER NOT NULL
        CONSTRAINT [FK_ConflictCheckParty_Request] FOREIGN KEY REFERENCES [__mj_BizAppsReferrals].[ReferralRequest]([ID]),
    [PartyName] NVARCHAR(255) NOT NULL,
    [PartyRole] NVARCHAR(30) NOT NULL
        CONSTRAINT [DF_ConflictCheckParty_PartyRole] DEFAULT (N'Adverse')
        CONSTRAINT [CK_ConflictCheckParty_PartyRole] CHECK ([PartyRole] IN (N'Client', N'Adverse', N'CoParty', N'RelatedEntity', N'Witness')),
    [OrganizationName] NVARCHAR(255) NULL,
    [NormalizedName] NVARCHAR(255) NOT NULL,
    [Notes] NVARCHAR(MAX) NULL
);
GO

CREATE INDEX [IX_ConflictCheckParty_RequestID] ON [__mj_BizAppsReferrals].[ConflictCheckParty] ([ReferralRequestID]);
CREATE INDEX [IX_ConflictCheckParty_NormalizedName] ON [__mj_BizAppsReferrals].[ConflictCheckParty] ([NormalizedName]);
GO

-- =============================================================================
-- 9. ReferralAssignment
-- =============================================================================
CREATE TABLE [__mj_BizAppsReferrals].[ReferralAssignment] (
    [ID] UNIQUEIDENTIFIER NOT NULL
        CONSTRAINT [PK_ReferralAssignment] PRIMARY KEY
        CONSTRAINT [DF_ReferralAssignment_ID] DEFAULT (NEWSEQUENTIALID()),
    [ReferralRequestID] UNIQUEIDENTIFIER NOT NULL
        CONSTRAINT [FK_ReferralAssignment_Request] FOREIGN KEY REFERENCES [__mj_BizAppsReferrals].[ReferralRequest]([ID]),
    [ProfessionalProfileID] UNIQUEIDENTIFIER NOT NULL
        CONSTRAINT [FK_ReferralAssignment_Profile] FOREIGN KEY REFERENCES [__mj_BizAppsReferrals].[ProfessionalProfile]([ID]),
    [CascadeOrder] INT NOT NULL
        CONSTRAINT [DF_ReferralAssignment_CascadeOrder] DEFAULT (1)
        CONSTRAINT [CK_ReferralAssignment_CascadeOrder] CHECK ([CascadeOrder] >= 1),
    [MatchScore] DECIMAL(5,2) NOT NULL
        CONSTRAINT [DF_ReferralAssignment_MatchScore] DEFAULT (0.00),
    [ScoreBreakdownJSON] NVARCHAR(MAX) NULL,
    [ConflictStatus] NVARCHAR(30) NOT NULL
        CONSTRAINT [DF_ReferralAssignment_ConflictStatus] DEFAULT (N'Pending')
        CONSTRAINT [CK_ReferralAssignment_ConflictStatus] CHECK ([ConflictStatus] IN (N'Pending', N'Cleared', N'ConflictFound', N'Waived')),
    [ConflictReason] NVARCHAR(MAX) NULL,
    [Status] NVARCHAR(30) NOT NULL
        CONSTRAINT [DF_ReferralAssignment_Status] DEFAULT (N'Queued')
        CONSTRAINT [CK_ReferralAssignment_Status] CHECK ([Status] IN (N'Queued', N'Offered', N'Accepted', N'Declined', N'ConflictRejected', N'Expired', N'Withdrawn')),
    [OfferedAt] DATETIMEOFFSET NULL,
    [SLADeadlineAt] DATETIMEOFFSET NULL,
    [RespondedAt] DATETIMEOFFSET NULL,
    [ResponseNotes] NVARCHAR(MAX) NULL,
    [DeclineReason] NVARCHAR(255) NULL
);
GO

CREATE INDEX [IX_ReferralAssignment_Request_Cascade] ON [__mj_BizAppsReferrals].[ReferralAssignment] ([ReferralRequestID], [CascadeOrder]);
CREATE INDEX [IX_ReferralAssignment_Profile_Status] ON [__mj_BizAppsReferrals].[ReferralAssignment] ([ProfessionalProfileID], [Status]);
CREATE INDEX [IX_ReferralAssignment_Status_SLADeadline] ON [__mj_BizAppsReferrals].[ReferralAssignment] ([Status], [SLADeadlineAt]);
GO

-- =============================================================================
-- 10. ReferralFeedback
-- =============================================================================
CREATE TABLE [__mj_BizAppsReferrals].[ReferralFeedback] (
    [ID] UNIQUEIDENTIFIER NOT NULL
        CONSTRAINT [PK_ReferralFeedback] PRIMARY KEY
        CONSTRAINT [DF_ReferralFeedback_ID] DEFAULT (NEWSEQUENTIALID()),
    [ReferralRequestID] UNIQUEIDENTIFIER NOT NULL
        CONSTRAINT [FK_ReferralFeedback_Request] FOREIGN KEY REFERENCES [__mj_BizAppsReferrals].[ReferralRequest]([ID]),
    [ReferralAssignmentID] UNIQUEIDENTIFIER NULL
        CONSTRAINT [FK_ReferralFeedback_Assignment] FOREIGN KEY REFERENCES [__mj_BizAppsReferrals].[ReferralAssignment]([ID]),
    [ProfessionalProfileID] UNIQUEIDENTIFIER NOT NULL
        CONSTRAINT [FK_ReferralFeedback_Profile] FOREIGN KEY REFERENCES [__mj_BizAppsReferrals].[ProfessionalProfile]([ID]),
    [SubmittedByType] NVARCHAR(20) NOT NULL
        CONSTRAINT [DF_ReferralFeedback_SubmittedByType] DEFAULT (N'Seeker')
        CONSTRAINT [CK_ReferralFeedback_SubmittedByType] CHECK ([SubmittedByType] IN (N'Seeker', N'Professional', N'Operator')),
    [Rating] INT NOT NULL
        CONSTRAINT [CK_ReferralFeedback_Rating] CHECK ([Rating] >= 1 AND [Rating] <= 5),
    [OutcomeStatus] NVARCHAR(30) NOT NULL
        CONSTRAINT [DF_ReferralFeedback_OutcomeStatus] DEFAULT (N'Engaged')
        CONSTRAINT [CK_ReferralFeedback_OutcomeStatus] CHECK ([OutcomeStatus] IN (N'Engaged', N'ConsultedOnly', N'NoResponse', N'NotAFit', N'Resolved')),
    [Comments] NVARCHAR(MAX) NULL,
    [SubmittedAt] DATETIMEOFFSET NOT NULL
        CONSTRAINT [DF_ReferralFeedback_SubmittedAt] DEFAULT (SYSDATETIMEOFFSET())
);
GO

CREATE INDEX [IX_ReferralFeedback_ProfileID] ON [__mj_BizAppsReferrals].[ReferralFeedback] ([ProfessionalProfileID]);
CREATE INDEX [IX_ReferralFeedback_RequestID] ON [__mj_BizAppsReferrals].[ReferralFeedback] ([ReferralRequestID]);
GO

-- =============================================================================
-- Table Descriptions (sp_addextendedproperty)
-- =============================================================================
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Hierarchical taxonomy of legal, accounting, or advisory practice areas.', @level0type=N'SCHEMA', @level0name=N'__mj_BizAppsReferrals', @level1type=N'TABLE', @level1name=N'PracticeArea';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Hierarchical geographic or regulatory licensing jurisdictions.', @level0type=N'SCHEMA', @level0name=N'__mj_BizAppsReferrals', @level1type=N'TABLE', @level1name=N'Jurisdiction';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Service-level agreement tiers governing SLA response windows and cascade depth.', @level0type=N'SCHEMA', @level0name=N'__mj_BizAppsReferrals', @level1type=N'TABLE', @level1name=N'ReferralTier';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Verified member directory profile for credentialed professionals.', @level0type=N'SCHEMA', @level0name=N'__mj_BizAppsReferrals', @level1type=N'TABLE', @level1name=N'ProfessionalProfile';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Junction linking professionals to practice areas with proficiency metadata.', @level0type=N'SCHEMA', @level0name=N'__mj_BizAppsReferrals', @level1type=N'TABLE', @level1name=N'ProfessionalPracticeArea';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Junction linking professionals to admitted jurisdictions and license standing.', @level0type=N'SCHEMA', @level0name=N'__mj_BizAppsReferrals', @level1type=N'TABLE', @level1name=N'ProfessionalJurisdiction';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Seeker referral intake request capturing matter details and routing state.', @level0type=N'SCHEMA', @level0name=N'__mj_BizAppsReferrals', @level1type=N'TABLE', @level1name=N'ReferralRequest';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Parties involved in a referral matter screened for conflicts of interest.', @level0type=N'SCHEMA', @level0name=N'__mj_BizAppsReferrals', @level1type=N'TABLE', @level1name=N'ConflictCheckParty';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Sequential cascade assignment offering a referral request to a matched professional.', @level0type=N'SCHEMA', @level0name=N'__mj_BizAppsReferrals', @level1type=N'TABLE', @level1name=N'ReferralAssignment';
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Post-referral feedback, rating, and engagement outcome telemetry.', @level0type=N'SCHEMA', @level0name=N'__mj_BizAppsReferrals', @level1type=N'TABLE', @level1name=N'ReferralFeedback';
GO

-- =============================================================================
-- Seed Data: PracticeAreas, Jurisdictions, ReferralTiers
-- =============================================================================
IF NOT EXISTS (SELECT 1 FROM [__mj_BizAppsReferrals].[PracticeArea] WHERE [Code] = N'CORP_MA')
BEGIN
    INSERT INTO [__mj_BizAppsReferrals].[PracticeArea] ([ID], [Name], [Code], [Category], [Description], [IconClass], [DisplayRank], [IsActive])
    VALUES
        ('A1000001-0000-0000-0000-000000000001', N'Corporate & M&A', N'CORP_MA', N'Legal', N'Mergers, acquisitions, corporate governance, and entity structuring.', N'fa-solid fa-building', 10, 1),
        ('A1000001-0000-0000-0000-000000000002', N'Commercial Litigation', N'COMM_LIT', N'Legal', N'Business disputes, contract enforcement, and commercial arbitration.', N'fa-solid fa-gavel', 20, 1),
        ('A1000001-0000-0000-0000-000000000003', N'Employment & Labor', N'EMP_LABOR', N'Legal', N'Workplace compliance, executive compensation, and employment disputes.', N'fa-solid fa-users', 30, 1),
        ('A1000001-0000-0000-0000-000000000004', N'Intellectual Property', N'IP_LAW', N'Legal', N'Patents, trademarks, copyrights, and technology licensing.', N'fa-solid fa-lightbulb', 40, 1),
        ('A1000001-0000-0000-0000-000000000005', N'Real Estate & Land Use', N'REAL_ESTATE', N'Legal', N'Commercial leasing, acquisitions, zoning, and real property.', N'fa-solid fa-city', 50, 1);
END
GO

IF NOT EXISTS (SELECT 1 FROM [__mj_BizAppsReferrals].[Jurisdiction] WHERE [Code] = N'US-CA')
BEGIN
    INSERT INTO [__mj_BizAppsReferrals].[Jurisdiction] ([ID], [Name], [Code], [JurisdictionType], [CountryCode], [StateProvinceCode], [IsActive])
    VALUES
        ('B1000001-0000-0000-0000-000000000001', N'California', N'US-CA', N'State', N'US', N'CA', 1),
        ('B1000001-0000-0000-0000-000000000002', N'New York', N'US-NY', N'State', N'US', N'NY', 1),
        ('B1000001-0000-0000-0000-000000000003', N'Texas', N'US-TX', N'State', N'US', N'TX', 1),
        ('B1000001-0000-0000-0000-000000000004', N'Delaware', N'US-DE', N'State', N'US', N'DE', 1),
        ('B1000001-0000-0000-0000-000000000005', N'United States Federal', N'US-FED', N'Federal', N'US', NULL, 1);
END
GO

IF NOT EXISTS (SELECT 1 FROM [__mj_BizAppsReferrals].[ReferralTier] WHERE [Code] = N'STANDARD')
BEGIN
    INSERT INTO [__mj_BizAppsReferrals].[ReferralTier] ([ID], [Name], [Code], [SLAResponseHours], [MaxCascadeAttempts], [PriorityWeight], [RequireConflictCheck], [Description], [IsActive])
    VALUES
        ('C1000001-0000-0000-0000-000000000001', N'Standard Referral', N'STANDARD', 24, 3, 1.00, 1, N'Standard 24-hour SLA response window with up to 3 cascade attempts.', 1),
        ('C1000001-0000-0000-0000-000000000002', N'Priority Concierge', N'PRIORITY', 8, 5, 1.50, 1, N'Accelerated 8-hour SLA response window with up to 5 cascade attempts.', 1),
        ('C1000001-0000-0000-0000-000000000003', N'Pro Bono Network', N'PRO_BONO', 48, 3, 1.00, 1, N'Pro bono referral tier with 48-hour SLA response window.', 1);
END
GO

-- =============================================================================
-- MJ Metadata Seed: Application & ApplicationEntity registration
-- =============================================================================
IF NOT EXISTS (SELECT 1 FROM [__mj].[Application] WHERE [Name] = N'Referrals')
BEGIN
    INSERT INTO [__mj].[Application] ([ID], [Name], [Description], [Icon], [Path], [DefaultForNewUser])
    VALUES (
        'D1000001-0000-0000-0000-000000000001',
        N'Referrals',
        N'Professional Referral & Verified Member Directory Open App',
        N'fa-solid fa-scale-balanced',
        N'referrals',
        0
    );
END
GO






















































-- =============================================================================
-- CodeGen Marker: Generated EntityField, vw*, sp*, and Trigger Objects
-- (Populated / verified by mj codegen against __mj_BizAppsReferrals)
-- =============================================================================
