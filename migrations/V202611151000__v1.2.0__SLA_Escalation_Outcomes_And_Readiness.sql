-- =============================================================================
-- BizApps Referrals - Wave 3 Migration: SLA Escalation, Outcomes & Readiness
-- Schema: __mj_BizAppsReferrals
-- Version: v1.2.0
-- Consolidated per Spec SS2.1 (exactly one migration per dialect): sections 8a-8d
-- below were folded in from the former v1.2.1 migration
-- (V202611152000__v1.2.1__Escalation_Lifecycle_And_Reciprocity_Fields.sql), which
-- has been removed.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Additive columns on [ReferralTier]: escalation policy configuration
-- -----------------------------------------------------------------------------
IF COL_LENGTH(N'[__mj_BizAppsReferrals].[ReferralTier]', N'EscalationWarningPercent') IS NULL
BEGIN
    ALTER TABLE [__mj_BizAppsReferrals].[ReferralTier]
        ADD [EscalationWarningPercent] INT NOT NULL
            CONSTRAINT [DF_ReferralTier_EscalationWarningPercent] DEFAULT (75)
            CONSTRAINT [CK_ReferralTier_EscalationWarningPercent] CHECK ([EscalationWarningPercent] BETWEEN 1 AND 100);
END
GO

IF COL_LENGTH(N'[__mj_BizAppsReferrals].[ReferralTier]', N'MaxEscalationLevel') IS NULL
BEGIN
    ALTER TABLE [__mj_BizAppsReferrals].[ReferralTier]
        ADD [MaxEscalationLevel] INT NOT NULL
            CONSTRAINT [DF_ReferralTier_MaxEscalationLevel] DEFAULT (3)
            CONSTRAINT [CK_ReferralTier_MaxEscalationLevel] CHECK ([MaxEscalationLevel] > 0);
END
GO

IF COL_LENGTH(N'[__mj_BizAppsReferrals].[ReferralTier]', N'UrgentSLAMultiplier') IS NULL
BEGIN
    ALTER TABLE [__mj_BizAppsReferrals].[ReferralTier]
        ADD [UrgentSLAMultiplier] DECIMAL(4,2) NOT NULL
            CONSTRAINT [DF_ReferralTier_UrgentSLAMultiplier] DEFAULT (0.50)
            CONSTRAINT [CK_ReferralTier_UrgentSLAMultiplier] CHECK ([UrgentSLAMultiplier] > 0 AND [UrgentSLAMultiplier] <= 1);
END
GO

IF COL_LENGTH(N'[__mj_BizAppsReferrals].[ReferralTier]', N'EscalationActionType') IS NULL
BEGIN
    ALTER TABLE [__mj_BizAppsReferrals].[ReferralTier]
        ADD [EscalationActionType] NVARCHAR(30) NOT NULL
            CONSTRAINT [DF_ReferralTier_EscalationActionType] DEFAULT (N'Notify')
            CONSTRAINT [CK_ReferralTier_EscalationActionType] CHECK ([EscalationActionType] IN (N'Notify', N'Reassign', N'AdminAlert'));
END
GO

-- -----------------------------------------------------------------------------
-- 2. Additive columns on [ReferralRequest]: source attribution & escalation state
--    (Note: [CompletedAt] already exists on this table from the v1.0.x schema.)
-- -----------------------------------------------------------------------------
IF COL_LENGTH(N'[__mj_BizAppsReferrals].[ReferralRequest]', N'SourceChannel') IS NULL
BEGIN
    ALTER TABLE [__mj_BizAppsReferrals].[ReferralRequest]
        ADD [SourceChannel] NVARCHAR(30) NOT NULL
            CONSTRAINT [DF_ReferralRequest_SourceChannel] DEFAULT (N'Web')
            CONSTRAINT [CK_ReferralRequest_SourceChannel] CHECK ([SourceChannel] IN (N'Web', N'Phone', N'Email', N'Referral', N'API'));
END
GO

IF COL_LENGTH(N'[__mj_BizAppsReferrals].[ReferralRequest]', N'ReferringProfessionalID') IS NULL
BEGIN
    ALTER TABLE [__mj_BizAppsReferrals].[ReferralRequest]
        ADD [ReferringProfessionalID] UNIQUEIDENTIFIER NULL
            CONSTRAINT [FK_ReferralRequest_ReferringProfessional] FOREIGN KEY REFERENCES [__mj_BizAppsReferrals].[ProfessionalProfile]([ID]);
END
GO

IF COL_LENGTH(N'[__mj_BizAppsReferrals].[ReferralRequest]', N'EscalationLevel') IS NULL
BEGIN
    ALTER TABLE [__mj_BizAppsReferrals].[ReferralRequest]
        ADD [EscalationLevel] INT NOT NULL
            CONSTRAINT [DF_ReferralRequest_EscalationLevel] DEFAULT (0)
            CONSTRAINT [CK_ReferralRequest_EscalationLevel] CHECK ([EscalationLevel] >= 0);
END
GO

IF COL_LENGTH(N'[__mj_BizAppsReferrals].[ReferralRequest]', N'LastEscalatedAt') IS NULL
BEGIN
    ALTER TABLE [__mj_BizAppsReferrals].[ReferralRequest]
        ADD [LastEscalatedAt] DATETIMEOFFSET NULL;
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE [name] = 'IX_ReferralRequest_ReferringProfessionalID' AND [object_id] = OBJECT_ID(N'[__mj_BizAppsReferrals].[ReferralRequest]'))
BEGIN
    CREATE INDEX [IX_ReferralRequest_ReferringProfessionalID] ON [__mj_BizAppsReferrals].[ReferralRequest] ([ReferringProfessionalID]) WHERE [ReferringProfessionalID] IS NOT NULL;
END
GO

-- -----------------------------------------------------------------------------
-- 3. Additive columns on [ReferralAssignment]: lifecycle completion & SLA warning
-- -----------------------------------------------------------------------------
IF COL_LENGTH(N'[__mj_BizAppsReferrals].[ReferralAssignment]', N'SLAWarningSentAt') IS NULL
BEGIN
    ALTER TABLE [__mj_BizAppsReferrals].[ReferralAssignment]
        ADD [SLAWarningSentAt] DATETIMEOFFSET NULL;
END
GO

IF COL_LENGTH(N'[__mj_BizAppsReferrals].[ReferralAssignment]', N'ResponseHours') IS NULL
BEGIN
    ALTER TABLE [__mj_BizAppsReferrals].[ReferralAssignment]
        ADD [ResponseHours] DECIMAL(6,2) NULL;
END
GO

IF COL_LENGTH(N'[__mj_BizAppsReferrals].[ReferralAssignment]', N'CompletedAt') IS NULL
BEGIN
    ALTER TABLE [__mj_BizAppsReferrals].[ReferralAssignment]
        ADD [CompletedAt] DATETIMEOFFSET NULL;
END
GO

IF COL_LENGTH(N'[__mj_BizAppsReferrals].[ReferralAssignment]', N'AIRationaleJSON') IS NULL
BEGIN
    ALTER TABLE [__mj_BizAppsReferrals].[ReferralAssignment]
        ADD [AIRationaleJSON] NVARCHAR(MAX) NULL;
END
GO

-- Widen CK_ReferralAssignment_Status to additionally allow 'InProgress' and 'Completed'
-- so the lifecycle-completion flow (MarkReferralInProgress / CompleteReferral) can
-- transition a ReferralAssignment past 'Accepted' without violating the CHECK constraint.
IF EXISTS (
    SELECT 1 FROM sys.check_constraints
    WHERE [name] = 'CK_ReferralAssignment_Status'
      AND [parent_object_id] = OBJECT_ID(N'[__mj_BizAppsReferrals].[ReferralAssignment]')
)
BEGIN
    ALTER TABLE [__mj_BizAppsReferrals].[ReferralAssignment] DROP CONSTRAINT [CK_ReferralAssignment_Status];
END
GO

ALTER TABLE [__mj_BizAppsReferrals].[ReferralAssignment]
    ADD CONSTRAINT [CK_ReferralAssignment_Status] CHECK ([Status] IN (
        N'Queued', N'Offered', N'Accepted', N'InProgress', N'Completed', N'Declined', N'ConflictRejected', N'Expired', N'Withdrawn'
    ));
GO

-- -----------------------------------------------------------------------------
-- 4. Additive columns on [ProfessionalProfile]: readiness & reciprocity
-- -----------------------------------------------------------------------------
IF COL_LENGTH(N'[__mj_BizAppsReferrals].[ProfessionalProfile]', N'ReadinessScore') IS NULL
BEGIN
    ALTER TABLE [__mj_BizAppsReferrals].[ProfessionalProfile]
        ADD [ReadinessScore] DECIMAL(5,2) NOT NULL
            CONSTRAINT [DF_ProfessionalProfile_ReadinessScore] DEFAULT (100.00)
            CONSTRAINT [CK_ProfessionalProfile_ReadinessScore] CHECK ([ReadinessScore] BETWEEN 0 AND 100);
END
GO

IF COL_LENGTH(N'[__mj_BizAppsReferrals].[ProfessionalProfile]', N'ReciprocityIndex') IS NULL
BEGIN
    ALTER TABLE [__mj_BizAppsReferrals].[ProfessionalProfile]
        ADD [ReciprocityIndex] DECIMAL(5,2) NULL;
END
GO

-- -----------------------------------------------------------------------------
-- 5. New table: [ReferralEscalation]
-- -----------------------------------------------------------------------------
IF OBJECT_ID(N'[__mj_BizAppsReferrals].[ReferralEscalation]', N'U') IS NULL
BEGIN
    CREATE TABLE [__mj_BizAppsReferrals].[ReferralEscalation] (
        [ID] UNIQUEIDENTIFIER NOT NULL
            CONSTRAINT [PK_ReferralEscalation] PRIMARY KEY
            CONSTRAINT [DF_ReferralEscalation_ID] DEFAULT (NEWSEQUENTIALID()),
        [ReferralRequestID] UNIQUEIDENTIFIER NOT NULL
            CONSTRAINT [FK_ReferralEscalation_Request] FOREIGN KEY REFERENCES [__mj_BizAppsReferrals].[ReferralRequest]([ID]),
        [ReferralAssignmentID] UNIQUEIDENTIFIER NULL
            CONSTRAINT [FK_ReferralEscalation_Assignment] FOREIGN KEY REFERENCES [__mj_BizAppsReferrals].[ReferralAssignment]([ID]),
        [EscalationLevel] INT NOT NULL
            CONSTRAINT [DF_ReferralEscalation_EscalationLevel] DEFAULT (1)
            CONSTRAINT [CK_ReferralEscalation_EscalationLevel] CHECK ([EscalationLevel] > 0),
        [TriggerType] NVARCHAR(60) NOT NULL
            CONSTRAINT [DF_ReferralEscalation_TriggerType] DEFAULT (N'SLAWarning')
            CONSTRAINT [CK_ReferralEscalation_TriggerType] CHECK ([TriggerType] IN (N'SLAWarning', N'SLABreach', N'ManualEscalation', N'CapacityExhausted')),
        [Status] NVARCHAR(40) NOT NULL
            CONSTRAINT [DF_ReferralEscalation_Status] DEFAULT (N'Open')
            CONSTRAINT [CK_ReferralEscalation_Status] CHECK ([Status] IN (N'Open', N'Acknowledged', N'Resolved')),
        [RecommendedAction] NVARCHAR(60) NOT NULL
            CONSTRAINT [DF_ReferralEscalation_RecommendedAction] DEFAULT (N'Notify')
            CONSTRAINT [CK_ReferralEscalation_RecommendedAction] CHECK ([RecommendedAction] IN (N'Notify', N'Reassign', N'AdminAlert', N'EscalateToTier')),
        [Notes] NVARCHAR(MAX) NULL,
        [TriggeredAt] DATETIMEOFFSET NOT NULL
            CONSTRAINT [DF_ReferralEscalation_TriggeredAt] DEFAULT (SYSDATETIMEOFFSET()),
        [AcknowledgedAt] DATETIMEOFFSET NULL,
        [ResolvedAt] DATETIMEOFFSET NULL,
        [__mj_CreatedAt] DATETIMEOFFSET NOT NULL
            CONSTRAINT [DF_ReferralEscalation___mj_CreatedAt] DEFAULT (GETUTCDATE()),
        [__mj_UpdatedAt] DATETIMEOFFSET NOT NULL
            CONSTRAINT [DF_ReferralEscalation___mj_UpdatedAt] DEFAULT (GETUTCDATE())
    );
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE [name] = 'IX_ReferralEscalation_Request' AND [object_id] = OBJECT_ID(N'[__mj_BizAppsReferrals].[ReferralEscalation]'))
    CREATE INDEX [IX_ReferralEscalation_Request] ON [__mj_BizAppsReferrals].[ReferralEscalation] ([ReferralRequestID]);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE [name] = 'IX_ReferralEscalation_Assignment' AND [object_id] = OBJECT_ID(N'[__mj_BizAppsReferrals].[ReferralEscalation]'))
    CREATE INDEX [IX_ReferralEscalation_Assignment] ON [__mj_BizAppsReferrals].[ReferralEscalation] ([ReferralAssignmentID]);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE [name] = 'IX_ReferralEscalation_Status' AND [object_id] = OBJECT_ID(N'[__mj_BizAppsReferrals].[ReferralEscalation]'))
    CREATE INDEX [IX_ReferralEscalation_Status] ON [__mj_BizAppsReferrals].[ReferralEscalation] ([Status]);
GO

-- -----------------------------------------------------------------------------
-- 6. New table: [ReferralOutcome]
-- -----------------------------------------------------------------------------
IF OBJECT_ID(N'[__mj_BizAppsReferrals].[ReferralOutcome]', N'U') IS NULL
BEGIN
    CREATE TABLE [__mj_BizAppsReferrals].[ReferralOutcome] (
        [ID] UNIQUEIDENTIFIER NOT NULL
            CONSTRAINT [PK_ReferralOutcome] PRIMARY KEY
            CONSTRAINT [DF_ReferralOutcome_ID] DEFAULT (NEWSEQUENTIALID()),
        [ReferralRequestID] UNIQUEIDENTIFIER NOT NULL
            CONSTRAINT [FK_ReferralOutcome_Request] FOREIGN KEY REFERENCES [__mj_BizAppsReferrals].[ReferralRequest]([ID]),
        [ReferralAssignmentID] UNIQUEIDENTIFIER NOT NULL
            CONSTRAINT [FK_ReferralOutcome_Assignment] FOREIGN KEY REFERENCES [__mj_BizAppsReferrals].[ReferralAssignment]([ID])
            CONSTRAINT [UQ_ReferralOutcome_Assignment] UNIQUE,
        [ProfessionalProfileID] UNIQUEIDENTIFIER NOT NULL
            CONSTRAINT [FK_ReferralOutcome_Profile] FOREIGN KEY REFERENCES [__mj_BizAppsReferrals].[ProfessionalProfile]([ID]),
        [OutcomeStatus] NVARCHAR(60) NOT NULL
            CONSTRAINT [DF_ReferralOutcome_OutcomeStatus] DEFAULT (N'Completed')
            CONSTRAINT [CK_ReferralOutcome_OutcomeStatus] CHECK ([OutcomeStatus] IN (N'Completed', N'Cancelled', N'NoEngagement')),
        [ResponseHours] DECIMAL(6,2) NULL,
        [CompletionNotes] NVARCHAR(MAX) NULL,
        [CompletedAt] DATETIMEOFFSET NOT NULL
            CONSTRAINT [DF_ReferralOutcome_CompletedAt] DEFAULT (SYSDATETIMEOFFSET()),
        [__mj_CreatedAt] DATETIMEOFFSET NOT NULL
            CONSTRAINT [DF_ReferralOutcome___mj_CreatedAt] DEFAULT (GETUTCDATE()),
        [__mj_UpdatedAt] DATETIMEOFFSET NOT NULL
            CONSTRAINT [DF_ReferralOutcome___mj_UpdatedAt] DEFAULT (GETUTCDATE())
    );
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE [name] = 'IX_ReferralOutcome_Request' AND [object_id] = OBJECT_ID(N'[__mj_BizAppsReferrals].[ReferralOutcome]'))
    CREATE INDEX [IX_ReferralOutcome_Request] ON [__mj_BizAppsReferrals].[ReferralOutcome] ([ReferralRequestID]);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE [name] = 'IX_ReferralOutcome_Profile' AND [object_id] = OBJECT_ID(N'[__mj_BizAppsReferrals].[ReferralOutcome]'))
    CREATE INDEX [IX_ReferralOutcome_Profile] ON [__mj_BizAppsReferrals].[ReferralOutcome] ([ProfessionalProfileID]);
GO

-- -----------------------------------------------------------------------------
-- 7. New table: [ProfessionalAvailabilityWindow]
-- -----------------------------------------------------------------------------
IF OBJECT_ID(N'[__mj_BizAppsReferrals].[ProfessionalAvailabilityWindow]', N'U') IS NULL
BEGIN
    CREATE TABLE [__mj_BizAppsReferrals].[ProfessionalAvailabilityWindow] (
        [ID] UNIQUEIDENTIFIER NOT NULL
            CONSTRAINT [PK_ProfessionalAvailabilityWindow] PRIMARY KEY
            CONSTRAINT [DF_ProfessionalAvailabilityWindow_ID] DEFAULT (NEWSEQUENTIALID()),
        [ProfessionalProfileID] UNIQUEIDENTIFIER NOT NULL
            CONSTRAINT [FK_ProfessionalAvailabilityWindow_Profile] FOREIGN KEY REFERENCES [__mj_BizAppsReferrals].[ProfessionalProfile]([ID]),
        [WindowType] NVARCHAR(40) NOT NULL
            CONSTRAINT [DF_ProfessionalAvailabilityWindow_WindowType] DEFAULT (N'Recurring')
            CONSTRAINT [CK_ProfessionalAvailabilityWindow_WindowType] CHECK ([WindowType] IN (N'Recurring', N'DateRange', N'Blackout')),
        [DayOfWeek] INT NULL
            CONSTRAINT [CK_ProfessionalAvailabilityWindow_DayOfWeek] CHECK ([DayOfWeek] IS NULL OR [DayOfWeek] BETWEEN 0 AND 6),
        [StartTimeMinutes] INT NULL
            CONSTRAINT [CK_ProfessionalAvailabilityWindow_StartTimeMinutes] CHECK ([StartTimeMinutes] IS NULL OR [StartTimeMinutes] BETWEEN 0 AND 1440),
        [EndTimeMinutes] INT NULL
            CONSTRAINT [CK_ProfessionalAvailabilityWindow_EndTimeMinutes] CHECK ([EndTimeMinutes] IS NULL OR [EndTimeMinutes] BETWEEN 0 AND 1440),
        [StartDate] DATETIMEOFFSET NULL,
        [EndDate] DATETIMEOFFSET NULL,
        [IsAvailable] BIT NOT NULL
            CONSTRAINT [DF_ProfessionalAvailabilityWindow_IsAvailable] DEFAULT (1),
        [TimeZone] NVARCHAR(100) NOT NULL
            CONSTRAINT [DF_ProfessionalAvailabilityWindow_TimeZone] DEFAULT (N'UTC'),
        [Notes] NVARCHAR(255) NULL,
        [__mj_CreatedAt] DATETIMEOFFSET NOT NULL
            CONSTRAINT [DF_ProfessionalAvailabilityWindow___mj_CreatedAt] DEFAULT (GETUTCDATE()),
        [__mj_UpdatedAt] DATETIMEOFFSET NOT NULL
            CONSTRAINT [DF_ProfessionalAvailabilityWindow___mj_UpdatedAt] DEFAULT (GETUTCDATE())
    );
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE [name] = 'IX_ProfessionalAvailabilityWindow_Profile' AND [object_id] = OBJECT_ID(N'[__mj_BizAppsReferrals].[ProfessionalAvailabilityWindow]'))
    CREATE INDEX [IX_ProfessionalAvailabilityWindow_Profile] ON [__mj_BizAppsReferrals].[ProfessionalAvailabilityWindow] ([ProfessionalProfileID]);
GO

-- -----------------------------------------------------------------------------
-- 8. New table: [ReciprocitySnapshot]
-- -----------------------------------------------------------------------------
IF OBJECT_ID(N'[__mj_BizAppsReferrals].[ReciprocitySnapshot]', N'U') IS NULL
BEGIN
    CREATE TABLE [__mj_BizAppsReferrals].[ReciprocitySnapshot] (
        [ID] UNIQUEIDENTIFIER NOT NULL
            CONSTRAINT [PK_ReciprocitySnapshot] PRIMARY KEY
            CONSTRAINT [DF_ReciprocitySnapshot_ID] DEFAULT (NEWSEQUENTIALID()),
        [ProfessionalProfileID] UNIQUEIDENTIFIER NOT NULL
            CONSTRAINT [FK_ReciprocitySnapshot_Profile] FOREIGN KEY REFERENCES [__mj_BizAppsReferrals].[ProfessionalProfile]([ID]),
        [SnapshotDate] DATETIMEOFFSET NOT NULL
            CONSTRAINT [DF_ReciprocitySnapshot_SnapshotDate] DEFAULT (SYSDATETIMEOFFSET()),
        [PeriodStartDate] DATETIMEOFFSET NOT NULL,
        [PeriodEndDate] DATETIMEOFFSET NOT NULL,
        [ReferralsGivenCount] INT NOT NULL
            CONSTRAINT [DF_ReciprocitySnapshot_ReferralsGivenCount] DEFAULT (0)
            CONSTRAINT [CK_ReciprocitySnapshot_ReferralsGivenCount] CHECK ([ReferralsGivenCount] >= 0),
        [ReferralsReceivedCount] INT NOT NULL
            CONSTRAINT [DF_ReciprocitySnapshot_ReferralsReceivedCount] DEFAULT (0)
            CONSTRAINT [CK_ReciprocitySnapshot_ReferralsReceivedCount] CHECK ([ReferralsReceivedCount] >= 0),
        [ReciprocityIndex] DECIMAL(5,2) NOT NULL
            CONSTRAINT [DF_ReciprocitySnapshot_ReciprocityIndex] DEFAULT (0.00),
        [__mj_CreatedAt] DATETIMEOFFSET NOT NULL
            CONSTRAINT [DF_ReciprocitySnapshot___mj_CreatedAt] DEFAULT (GETUTCDATE()),
        [__mj_UpdatedAt] DATETIMEOFFSET NOT NULL
            CONSTRAINT [DF_ReciprocitySnapshot___mj_UpdatedAt] DEFAULT (GETUTCDATE())
    );
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE [name] = 'IX_ReciprocitySnapshot_Profile_Date' AND [object_id] = OBJECT_ID(N'[__mj_BizAppsReferrals].[ReciprocitySnapshot]'))
    CREATE INDEX [IX_ReciprocitySnapshot_Profile_Date] ON [__mj_BizAppsReferrals].[ReciprocitySnapshot] ([ProfessionalProfileID], [SnapshotDate]);
GO

-- -----------------------------------------------------------------------------
-- 8a. Additive columns on [ReferralEscalation]: dedup, notifier linkage, resolution
--     audit (consolidated from the former v1.2.1 migration per Spec SS2.1 - exactly
--     one migration per dialect).
-- -----------------------------------------------------------------------------
IF COL_LENGTH(N'[__mj_BizAppsReferrals].[ReferralEscalation]', N'DedupKey') IS NULL
BEGIN
    ALTER TABLE [__mj_BizAppsReferrals].[ReferralEscalation]
        ADD [DedupKey] NVARCHAR(200) NULL;
END
GO

IF COL_LENGTH(N'[__mj_BizAppsReferrals].[ReferralEscalation]', N'LinkedTaskID') IS NULL
BEGIN
    ALTER TABLE [__mj_BizAppsReferrals].[ReferralEscalation]
        ADD [LinkedTaskID] UNIQUEIDENTIFIER NULL;
END
GO

IF COL_LENGTH(N'[__mj_BizAppsReferrals].[ReferralEscalation]', N'AcknowledgedByPersonID') IS NULL
BEGIN
    ALTER TABLE [__mj_BizAppsReferrals].[ReferralEscalation]
        ADD [AcknowledgedByPersonID] UNIQUEIDENTIFIER NULL
            CONSTRAINT [FK_ReferralEscalation_AcknowledgedByPerson] FOREIGN KEY REFERENCES [__mj_BizAppsCommon].[Person]([ID]);
END
GO

IF COL_LENGTH(N'[__mj_BizAppsReferrals].[ReferralEscalation]', N'ResolvedByPersonID') IS NULL
BEGIN
    ALTER TABLE [__mj_BizAppsReferrals].[ReferralEscalation]
        ADD [ResolvedByPersonID] UNIQUEIDENTIFIER NULL
            CONSTRAINT [FK_ReferralEscalation_ResolvedByPerson] FOREIGN KEY REFERENCES [__mj_BizAppsCommon].[Person]([ID]);
END
GO

IF COL_LENGTH(N'[__mj_BizAppsReferrals].[ReferralEscalation]', N'ResolutionNotes') IS NULL
BEGIN
    ALTER TABLE [__mj_BizAppsReferrals].[ReferralEscalation]
        ADD [ResolutionNotes] NVARCHAR(MAX) NULL;
END
GO

-- Widen CK_ReferralEscalation_TriggerType to add 'UrgentUnassigned' and 'CascadeExhausted' (6 total)
IF EXISTS (
    SELECT 1 FROM sys.check_constraints
    WHERE [name] = 'CK_ReferralEscalation_TriggerType'
      AND [parent_object_id] = OBJECT_ID(N'[__mj_BizAppsReferrals].[ReferralEscalation]')
)
BEGIN
    ALTER TABLE [__mj_BizAppsReferrals].[ReferralEscalation] DROP CONSTRAINT [CK_ReferralEscalation_TriggerType];
END
GO

ALTER TABLE [__mj_BizAppsReferrals].[ReferralEscalation]
    ADD CONSTRAINT [CK_ReferralEscalation_TriggerType] CHECK ([TriggerType] IN (
        N'SLAWarning', N'SLABreach', N'ManualEscalation', N'CapacityExhausted', N'UrgentUnassigned', N'CascadeExhausted'
    ));
GO

-- Widen CK_ReferralEscalation_Status to add 'Dismissed' (4 total)
IF EXISTS (
    SELECT 1 FROM sys.check_constraints
    WHERE [name] = 'CK_ReferralEscalation_Status'
      AND [parent_object_id] = OBJECT_ID(N'[__mj_BizAppsReferrals].[ReferralEscalation]')
)
BEGIN
    ALTER TABLE [__mj_BizAppsReferrals].[ReferralEscalation] DROP CONSTRAINT [CK_ReferralEscalation_Status];
END
GO

ALTER TABLE [__mj_BizAppsReferrals].[ReferralEscalation]
    ADD CONSTRAINT [CK_ReferralEscalation_Status] CHECK ([Status] IN (
        N'Open', N'Acknowledged', N'Resolved', N'Dismissed'
    ));
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE [name] = 'IX_ReferralEscalation_DedupKey' AND [object_id] = OBJECT_ID(N'[__mj_BizAppsReferrals].[ReferralEscalation]'))
    CREATE INDEX [IX_ReferralEscalation_DedupKey] ON [__mj_BizAppsReferrals].[ReferralEscalation] ([DedupKey]) WHERE [DedupKey] IS NOT NULL;
GO

-- -----------------------------------------------------------------------------
-- 8b. Additive column on [ReferralOutcome]: attributed fee value for reciprocity scorecards
-- -----------------------------------------------------------------------------
IF COL_LENGTH(N'[__mj_BizAppsReferrals].[ReferralOutcome]', N'FeeAmount') IS NULL
BEGIN
    ALTER TABLE [__mj_BizAppsReferrals].[ReferralOutcome]
        ADD [FeeAmount] DECIMAL(10,2) NULL;
END
GO

-- -----------------------------------------------------------------------------
-- 8c. Additive columns on [ReciprocitySnapshot]: full scorecard metrics
-- -----------------------------------------------------------------------------
IF COL_LENGTH(N'[__mj_BizAppsReferrals].[ReciprocitySnapshot]', N'AcceptedCount') IS NULL
BEGIN
    ALTER TABLE [__mj_BizAppsReferrals].[ReciprocitySnapshot]
        ADD [AcceptedCount] INT NOT NULL
            CONSTRAINT [DF_ReciprocitySnapshot_AcceptedCount] DEFAULT (0);
END
GO

IF COL_LENGTH(N'[__mj_BizAppsReferrals].[ReciprocitySnapshot]', N'ResolvedCount') IS NULL
BEGIN
    ALTER TABLE [__mj_BizAppsReferrals].[ReciprocitySnapshot]
        ADD [ResolvedCount] INT NOT NULL
            CONSTRAINT [DF_ReciprocitySnapshot_ResolvedCount] DEFAULT (0);
END
GO

IF COL_LENGTH(N'[__mj_BizAppsReferrals].[ReciprocitySnapshot]', N'SLABreachCount') IS NULL
BEGIN
    ALTER TABLE [__mj_BizAppsReferrals].[ReciprocitySnapshot]
        ADD [SLABreachCount] INT NOT NULL
            CONSTRAINT [DF_ReciprocitySnapshot_SLABreachCount] DEFAULT (0);
END
GO

IF COL_LENGTH(N'[__mj_BizAppsReferrals].[ReciprocitySnapshot]', N'AcceptanceRate') IS NULL
BEGIN
    ALTER TABLE [__mj_BizAppsReferrals].[ReciprocitySnapshot]
        ADD [AcceptanceRate] DECIMAL(5,2) NOT NULL
            CONSTRAINT [DF_ReciprocitySnapshot_AcceptanceRate] DEFAULT (0);
END
GO

IF COL_LENGTH(N'[__mj_BizAppsReferrals].[ReciprocitySnapshot]', N'MedianResponseHours') IS NULL
BEGIN
    ALTER TABLE [__mj_BizAppsReferrals].[ReciprocitySnapshot]
        ADD [MedianResponseHours] DECIMAL(6,2) NULL;
END
GO

IF COL_LENGTH(N'[__mj_BizAppsReferrals].[ReciprocitySnapshot]', N'AttributedFeeTotal') IS NULL
BEGIN
    ALTER TABLE [__mj_BizAppsReferrals].[ReciprocitySnapshot]
        ADD [AttributedFeeTotal] DECIMAL(12,2) NOT NULL
            CONSTRAINT [DF_ReciprocitySnapshot_AttributedFeeTotal] DEFAULT (0);
END
GO

-- Upsert key for RecomputeSnapshots: one snapshot per (Professional, PeriodStart, PeriodEnd)
IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE [name] = 'UQ_ReciprocitySnapshot_Profile_Period'
      AND [object_id] = OBJECT_ID(N'[__mj_BizAppsReferrals].[ReciprocitySnapshot]')
)
BEGIN
    CREATE UNIQUE INDEX [UQ_ReciprocitySnapshot_Profile_Period]
        ON [__mj_BizAppsReferrals].[ReciprocitySnapshot] ([ProfessionalProfileID], [PeriodStartDate], [PeriodEndDate]);
END
GO

-- -----------------------------------------------------------------------------
-- 8d. Additive column on [ProfessionalProfile]: readiness computation timestamp
-- -----------------------------------------------------------------------------
IF COL_LENGTH(N'[__mj_BizAppsReferrals].[ProfessionalProfile]', N'ReadinessComputedAt') IS NULL
BEGIN
    ALTER TABLE [__mj_BizAppsReferrals].[ProfessionalProfile]
        ADD [ReadinessComputedAt] DATETIMEOFFSET NULL;
END
GO

-- -----------------------------------------------------------------------------
-- 9. Base views & CRUD procedures for the 4 new Wave 3 Slice 1 tables
-- -----------------------------------------------------------------------------

-- =============================================================================
-- CRUD SQL for [__mj_BizAppsReferrals].[ReferralEscalation]
-- =============================================================================

-----------------------------------------------------------------
-- SQL Code Generation
-- Item: vwReferralEscalations
--
-- This mirrors the exact structure MemberJunction CodeGen produces for this schema.
-- Regenerate via `mj codegen` once this migration is applied to a live database;
-- this hand-authored copy keeps the Wave 3 Slice 1 tables functional in the interim.
-----------------------------------------------------------------

------------------------------------------------------------
----- BASE VIEW FOR ENTITY TABLE: ReferralEscalation
-----               SCHEMA:      __mj_BizAppsReferrals
-----               BASE TABLE:  ReferralEscalation
-----               PRIMARY KEY: ID
------------------------------------------------------------
IF OBJECT_ID('[__mj_BizAppsReferrals].[vwReferralEscalations]', 'V') IS NOT NULL
    DROP VIEW [__mj_BizAppsReferrals].[vwReferralEscalations];
GO

CREATE VIEW [__mj_BizAppsReferrals].[vwReferralEscalations]
AS
SELECT
    c.*
FROM
    [__mj_BizAppsReferrals].[ReferralEscalation] AS c
GO
GRANT SELECT ON [__mj_BizAppsReferrals].[vwReferralEscalations] TO [cdp_UI], [cdp_Developer], [cdp_Integration]
GO

-----------------------------------------------------------------
-- SQL Code Generation
-- Item: spCreateReferralEscalation
--
-- This mirrors the exact structure MemberJunction CodeGen produces for this schema.
-- Regenerate via `mj codegen` once this migration is applied to a live database;
-- this hand-authored copy keeps the Wave 3 Slice 1 tables functional in the interim.
-----------------------------------------------------------------

------------------------------------------------------------
----- CREATE PROCEDURE FOR ReferralEscalation
------------------------------------------------------------
IF OBJECT_ID('[__mj_BizAppsReferrals].[spCreateReferralEscalation]', 'P') IS NOT NULL
    DROP PROCEDURE [__mj_BizAppsReferrals].[spCreateReferralEscalation];
GO

CREATE PROCEDURE [__mj_BizAppsReferrals].[spCreateReferralEscalation]
    @ID uniqueidentifier = NULL,
    @ReferralRequestID uniqueidentifier,
    @ReferralAssignmentID uniqueidentifier = NULL,
    @EscalationLevel int = NULL,
    @TriggerType nvarchar(60) = NULL,
    @Status nvarchar(40) = NULL,
    @RecommendedAction nvarchar(60) = NULL,
    @Notes_Clear bit = 0,
    @Notes nvarchar(MAX) = NULL,
    @TriggeredAt datetimeoffset = NULL,
    @AcknowledgedAt_Clear bit = 0,
    @AcknowledgedAt datetimeoffset = NULL,
    @ResolvedAt_Clear bit = 0,
    @ResolvedAt datetimeoffset = NULL
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @InsertedRow TABLE ([ID] UNIQUEIDENTIFIER)

    IF @ID IS NOT NULL
    BEGIN
        INSERT INTO [__mj_BizAppsReferrals].[ReferralEscalation]
            (
                [ID],
                [ReferralRequestID],
                [ReferralAssignmentID],
                [EscalationLevel],
                [TriggerType],
                [Status],
                [RecommendedAction],
                [Notes],
                [TriggeredAt],
                [AcknowledgedAt],
                [ResolvedAt]
            )
        OUTPUT INSERTED.[ID] INTO @InsertedRow
        VALUES
            (
                @ID,
                @ReferralRequestID,
                @ReferralAssignmentID,
                ISNULL(@EscalationLevel, 1),
                ISNULL(@TriggerType, 'SLAWarning'),
                ISNULL(@Status, 'Open'),
                ISNULL(@RecommendedAction, 'Notify'),
                CASE WHEN @Notes_Clear = 1 THEN NULL ELSE @Notes END,
                ISNULL(@TriggeredAt, SYSDATETIMEOFFSET()),
                CASE WHEN @AcknowledgedAt_Clear = 1 THEN NULL ELSE @AcknowledgedAt END,
                CASE WHEN @ResolvedAt_Clear = 1 THEN NULL ELSE @ResolvedAt END
            )
    END
    ELSE
    BEGIN
        INSERT INTO [__mj_BizAppsReferrals].[ReferralEscalation]
            (
                [ReferralRequestID],
                [ReferralAssignmentID],
                [EscalationLevel],
                [TriggerType],
                [Status],
                [RecommendedAction],
                [Notes],
                [TriggeredAt],
                [AcknowledgedAt],
                [ResolvedAt]
            )
        OUTPUT INSERTED.[ID] INTO @InsertedRow
        VALUES
            (
                @ReferralRequestID,
                @ReferralAssignmentID,
                ISNULL(@EscalationLevel, 1),
                ISNULL(@TriggerType, 'SLAWarning'),
                ISNULL(@Status, 'Open'),
                ISNULL(@RecommendedAction, 'Notify'),
                CASE WHEN @Notes_Clear = 1 THEN NULL ELSE @Notes END,
                ISNULL(@TriggeredAt, SYSDATETIMEOFFSET()),
                CASE WHEN @AcknowledgedAt_Clear = 1 THEN NULL ELSE @AcknowledgedAt END,
                CASE WHEN @ResolvedAt_Clear = 1 THEN NULL ELSE @ResolvedAt END
            )
    END
    SELECT * FROM [__mj_BizAppsReferrals].[vwReferralEscalations] WHERE [ID] = (SELECT [ID] FROM @InsertedRow)
END
GO
GRANT EXECUTE ON [__mj_BizAppsReferrals].[spCreateReferralEscalation] TO [cdp_Developer], [cdp_Integration]
GO

-----------------------------------------------------------------
-- SQL Code Generation
-- Item: spUpdateReferralEscalation
--
-- This mirrors the exact structure MemberJunction CodeGen produces for this schema.
-- Regenerate via `mj codegen` once this migration is applied to a live database;
-- this hand-authored copy keeps the Wave 3 Slice 1 tables functional in the interim.
-----------------------------------------------------------------

------------------------------------------------------------
----- UPDATE PROCEDURE FOR ReferralEscalation
------------------------------------------------------------
IF OBJECT_ID('[__mj_BizAppsReferrals].[spUpdateReferralEscalation]', 'P') IS NOT NULL
    DROP PROCEDURE [__mj_BizAppsReferrals].[spUpdateReferralEscalation];
GO

CREATE PROCEDURE [__mj_BizAppsReferrals].[spUpdateReferralEscalation]
    @ID uniqueidentifier,
    @ReferralRequestID uniqueidentifier = NULL,
    @ReferralAssignmentID uniqueidentifier = NULL,
    @EscalationLevel int = NULL,
    @TriggerType nvarchar(60) = NULL,
    @Status nvarchar(40) = NULL,
    @RecommendedAction nvarchar(60) = NULL,
    @Notes_Clear bit = 0,
    @Notes nvarchar(MAX) = NULL,
    @TriggeredAt datetimeoffset = NULL,
    @AcknowledgedAt_Clear bit = 0,
    @AcknowledgedAt datetimeoffset = NULL,
    @ResolvedAt_Clear bit = 0,
    @ResolvedAt datetimeoffset = NULL
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE
        [__mj_BizAppsReferrals].[ReferralEscalation]
    SET
        [ReferralRequestID] = ISNULL(@ReferralRequestID, [ReferralRequestID]),
        [ReferralAssignmentID] = ISNULL(@ReferralAssignmentID, [ReferralAssignmentID]),
        [EscalationLevel] = ISNULL(@EscalationLevel, [EscalationLevel]),
        [TriggerType] = ISNULL(@TriggerType, [TriggerType]),
        [Status] = ISNULL(@Status, [Status]),
        [RecommendedAction] = ISNULL(@RecommendedAction, [RecommendedAction]),
        [Notes] = CASE WHEN @Notes_Clear = 1 THEN NULL ELSE ISNULL(@Notes, [Notes]) END,
        [TriggeredAt] = ISNULL(@TriggeredAt, [TriggeredAt]),
        [AcknowledgedAt] = CASE WHEN @AcknowledgedAt_Clear = 1 THEN NULL ELSE ISNULL(@AcknowledgedAt, [AcknowledgedAt]) END,
        [ResolvedAt] = CASE WHEN @ResolvedAt_Clear = 1 THEN NULL ELSE ISNULL(@ResolvedAt, [ResolvedAt]) END,
        [__mj_UpdatedAt] = GETUTCDATE()
    WHERE
        [ID] = @ID

    IF @@ROWCOUNT = 0
        SELECT TOP 0 * FROM [__mj_BizAppsReferrals].[vwReferralEscalations] WHERE 1=0
    ELSE
        SELECT * FROM [__mj_BizAppsReferrals].[vwReferralEscalations] WHERE [ID] = @ID
END
GO

GRANT EXECUTE ON [__mj_BizAppsReferrals].[spUpdateReferralEscalation] TO [cdp_Developer], [cdp_Integration]
GO

------------------------------------------------------------
----- TRIGGER FOR __mj_UpdatedAt field for the ReferralEscalation table
------------------------------------------------------------
IF OBJECT_ID('[__mj_BizAppsReferrals].[trgUpdateReferralEscalation]', 'TR') IS NOT NULL
    DROP TRIGGER [__mj_BizAppsReferrals].[trgUpdateReferralEscalation];
GO
CREATE TRIGGER [__mj_BizAppsReferrals].trgUpdateReferralEscalation
ON [__mj_BizAppsReferrals].[ReferralEscalation]
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    IF NOT UPDATE([__mj_UpdatedAt])
    BEGIN
        UPDATE
            [__mj_BizAppsReferrals].[ReferralEscalation]
        SET
            __mj_UpdatedAt = GETUTCDATE()
        FROM
            [__mj_BizAppsReferrals].[ReferralEscalation] AS _organicTable
        INNER JOIN
            INSERTED AS I ON
            _organicTable.[ID] = I.[ID];
    END
END;
GO

-----------------------------------------------------------------
-- SQL Code Generation
-- Item: spDeleteReferralEscalation
--
-- This mirrors the exact structure MemberJunction CodeGen produces for this schema.
-- Regenerate via `mj codegen` once this migration is applied to a live database;
-- this hand-authored copy keeps the Wave 3 Slice 1 tables functional in the interim.
-----------------------------------------------------------------

------------------------------------------------------------
----- DELETE PROCEDURE FOR ReferralEscalation
------------------------------------------------------------
IF OBJECT_ID('[__mj_BizAppsReferrals].[spDeleteReferralEscalation]', 'P') IS NOT NULL
    DROP PROCEDURE [__mj_BizAppsReferrals].[spDeleteReferralEscalation];
GO

CREATE PROCEDURE [__mj_BizAppsReferrals].[spDeleteReferralEscalation]
    @ID uniqueidentifier
AS
BEGIN
    SET NOCOUNT ON;

    DELETE FROM
        [__mj_BizAppsReferrals].[ReferralEscalation]
    WHERE
        [ID] = @ID

    IF @@ROWCOUNT = 0
        SELECT NULL AS [ID]
    ELSE
        SELECT @ID AS [ID]
END
GO
GRANT EXECUTE ON [__mj_BizAppsReferrals].[spDeleteReferralEscalation] TO [cdp_Developer], [cdp_Integration]
GO

-- =============================================================================
-- CRUD SQL for [__mj_BizAppsReferrals].[ReferralOutcome]
-- =============================================================================

-----------------------------------------------------------------
-- SQL Code Generation
-- Item: vwReferralOutcomes
--
-- This mirrors the exact structure MemberJunction CodeGen produces for this schema.
-- Regenerate via `mj codegen` once this migration is applied to a live database;
-- this hand-authored copy keeps the Wave 3 Slice 1 tables functional in the interim.
-----------------------------------------------------------------

------------------------------------------------------------
----- BASE VIEW FOR ENTITY TABLE: ReferralOutcome
-----               SCHEMA:      __mj_BizAppsReferrals
-----               BASE TABLE:  ReferralOutcome
-----               PRIMARY KEY: ID
------------------------------------------------------------
IF OBJECT_ID('[__mj_BizAppsReferrals].[vwReferralOutcomes]', 'V') IS NOT NULL
    DROP VIEW [__mj_BizAppsReferrals].[vwReferralOutcomes];
GO

CREATE VIEW [__mj_BizAppsReferrals].[vwReferralOutcomes]
AS
SELECT
    c.*
FROM
    [__mj_BizAppsReferrals].[ReferralOutcome] AS c
GO
GRANT SELECT ON [__mj_BizAppsReferrals].[vwReferralOutcomes] TO [cdp_UI], [cdp_Developer], [cdp_Integration]
GO

-----------------------------------------------------------------
-- SQL Code Generation
-- Item: spCreateReferralOutcome
--
-- This mirrors the exact structure MemberJunction CodeGen produces for this schema.
-- Regenerate via `mj codegen` once this migration is applied to a live database;
-- this hand-authored copy keeps the Wave 3 Slice 1 tables functional in the interim.
-----------------------------------------------------------------

------------------------------------------------------------
----- CREATE PROCEDURE FOR ReferralOutcome
------------------------------------------------------------
IF OBJECT_ID('[__mj_BizAppsReferrals].[spCreateReferralOutcome]', 'P') IS NOT NULL
    DROP PROCEDURE [__mj_BizAppsReferrals].[spCreateReferralOutcome];
GO

CREATE PROCEDURE [__mj_BizAppsReferrals].[spCreateReferralOutcome]
    @ID uniqueidentifier = NULL,
    @ReferralRequestID uniqueidentifier,
    @ReferralAssignmentID uniqueidentifier,
    @ProfessionalProfileID uniqueidentifier,
    @OutcomeStatus nvarchar(60) = NULL,
    @ResponseHours_Clear bit = 0,
    @ResponseHours decimal(6, 2) = NULL,
    @CompletionNotes_Clear bit = 0,
    @CompletionNotes nvarchar(MAX) = NULL,
    @CompletedAt datetimeoffset = NULL
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @InsertedRow TABLE ([ID] UNIQUEIDENTIFIER)

    IF @ID IS NOT NULL
    BEGIN
        INSERT INTO [__mj_BizAppsReferrals].[ReferralOutcome]
            (
                [ID],
                [ReferralRequestID],
                [ReferralAssignmentID],
                [ProfessionalProfileID],
                [OutcomeStatus],
                [ResponseHours],
                [CompletionNotes],
                [CompletedAt]
            )
        OUTPUT INSERTED.[ID] INTO @InsertedRow
        VALUES
            (
                @ID,
                @ReferralRequestID,
                @ReferralAssignmentID,
                @ProfessionalProfileID,
                ISNULL(@OutcomeStatus, 'Completed'),
                CASE WHEN @ResponseHours_Clear = 1 THEN NULL ELSE @ResponseHours END,
                CASE WHEN @CompletionNotes_Clear = 1 THEN NULL ELSE @CompletionNotes END,
                ISNULL(@CompletedAt, SYSDATETIMEOFFSET())
            )
    END
    ELSE
    BEGIN
        INSERT INTO [__mj_BizAppsReferrals].[ReferralOutcome]
            (
                [ReferralRequestID],
                [ReferralAssignmentID],
                [ProfessionalProfileID],
                [OutcomeStatus],
                [ResponseHours],
                [CompletionNotes],
                [CompletedAt]
            )
        OUTPUT INSERTED.[ID] INTO @InsertedRow
        VALUES
            (
                @ReferralRequestID,
                @ReferralAssignmentID,
                @ProfessionalProfileID,
                ISNULL(@OutcomeStatus, 'Completed'),
                CASE WHEN @ResponseHours_Clear = 1 THEN NULL ELSE @ResponseHours END,
                CASE WHEN @CompletionNotes_Clear = 1 THEN NULL ELSE @CompletionNotes END,
                ISNULL(@CompletedAt, SYSDATETIMEOFFSET())
            )
    END
    SELECT * FROM [__mj_BizAppsReferrals].[vwReferralOutcomes] WHERE [ID] = (SELECT [ID] FROM @InsertedRow)
END
GO
GRANT EXECUTE ON [__mj_BizAppsReferrals].[spCreateReferralOutcome] TO [cdp_Developer], [cdp_Integration]
GO

-----------------------------------------------------------------
-- SQL Code Generation
-- Item: spUpdateReferralOutcome
--
-- This mirrors the exact structure MemberJunction CodeGen produces for this schema.
-- Regenerate via `mj codegen` once this migration is applied to a live database;
-- this hand-authored copy keeps the Wave 3 Slice 1 tables functional in the interim.
-----------------------------------------------------------------

------------------------------------------------------------
----- UPDATE PROCEDURE FOR ReferralOutcome
------------------------------------------------------------
IF OBJECT_ID('[__mj_BizAppsReferrals].[spUpdateReferralOutcome]', 'P') IS NOT NULL
    DROP PROCEDURE [__mj_BizAppsReferrals].[spUpdateReferralOutcome];
GO

CREATE PROCEDURE [__mj_BizAppsReferrals].[spUpdateReferralOutcome]
    @ID uniqueidentifier,
    @ReferralRequestID uniqueidentifier = NULL,
    @ReferralAssignmentID uniqueidentifier = NULL,
    @ProfessionalProfileID uniqueidentifier = NULL,
    @OutcomeStatus nvarchar(60) = NULL,
    @ResponseHours_Clear bit = 0,
    @ResponseHours decimal(6, 2) = NULL,
    @CompletionNotes_Clear bit = 0,
    @CompletionNotes nvarchar(MAX) = NULL,
    @CompletedAt datetimeoffset = NULL
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE
        [__mj_BizAppsReferrals].[ReferralOutcome]
    SET
        [ReferralRequestID] = ISNULL(@ReferralRequestID, [ReferralRequestID]),
        [ReferralAssignmentID] = ISNULL(@ReferralAssignmentID, [ReferralAssignmentID]),
        [ProfessionalProfileID] = ISNULL(@ProfessionalProfileID, [ProfessionalProfileID]),
        [OutcomeStatus] = ISNULL(@OutcomeStatus, [OutcomeStatus]),
        [ResponseHours] = CASE WHEN @ResponseHours_Clear = 1 THEN NULL ELSE ISNULL(@ResponseHours, [ResponseHours]) END,
        [CompletionNotes] = CASE WHEN @CompletionNotes_Clear = 1 THEN NULL ELSE ISNULL(@CompletionNotes, [CompletionNotes]) END,
        [CompletedAt] = ISNULL(@CompletedAt, [CompletedAt]),
        [__mj_UpdatedAt] = GETUTCDATE()
    WHERE
        [ID] = @ID

    IF @@ROWCOUNT = 0
        SELECT TOP 0 * FROM [__mj_BizAppsReferrals].[vwReferralOutcomes] WHERE 1=0
    ELSE
        SELECT * FROM [__mj_BizAppsReferrals].[vwReferralOutcomes] WHERE [ID] = @ID
END
GO

GRANT EXECUTE ON [__mj_BizAppsReferrals].[spUpdateReferralOutcome] TO [cdp_Developer], [cdp_Integration]
GO

------------------------------------------------------------
----- TRIGGER FOR __mj_UpdatedAt field for the ReferralOutcome table
------------------------------------------------------------
IF OBJECT_ID('[__mj_BizAppsReferrals].[trgUpdateReferralOutcome]', 'TR') IS NOT NULL
    DROP TRIGGER [__mj_BizAppsReferrals].[trgUpdateReferralOutcome];
GO
CREATE TRIGGER [__mj_BizAppsReferrals].trgUpdateReferralOutcome
ON [__mj_BizAppsReferrals].[ReferralOutcome]
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    IF NOT UPDATE([__mj_UpdatedAt])
    BEGIN
        UPDATE
            [__mj_BizAppsReferrals].[ReferralOutcome]
        SET
            __mj_UpdatedAt = GETUTCDATE()
        FROM
            [__mj_BizAppsReferrals].[ReferralOutcome] AS _organicTable
        INNER JOIN
            INSERTED AS I ON
            _organicTable.[ID] = I.[ID];
    END
END;
GO

-----------------------------------------------------------------
-- SQL Code Generation
-- Item: spDeleteReferralOutcome
--
-- This mirrors the exact structure MemberJunction CodeGen produces for this schema.
-- Regenerate via `mj codegen` once this migration is applied to a live database;
-- this hand-authored copy keeps the Wave 3 Slice 1 tables functional in the interim.
-----------------------------------------------------------------

------------------------------------------------------------
----- DELETE PROCEDURE FOR ReferralOutcome
------------------------------------------------------------
IF OBJECT_ID('[__mj_BizAppsReferrals].[spDeleteReferralOutcome]', 'P') IS NOT NULL
    DROP PROCEDURE [__mj_BizAppsReferrals].[spDeleteReferralOutcome];
GO

CREATE PROCEDURE [__mj_BizAppsReferrals].[spDeleteReferralOutcome]
    @ID uniqueidentifier
AS
BEGIN
    SET NOCOUNT ON;

    DELETE FROM
        [__mj_BizAppsReferrals].[ReferralOutcome]
    WHERE
        [ID] = @ID

    IF @@ROWCOUNT = 0
        SELECT NULL AS [ID]
    ELSE
        SELECT @ID AS [ID]
END
GO
GRANT EXECUTE ON [__mj_BizAppsReferrals].[spDeleteReferralOutcome] TO [cdp_Developer], [cdp_Integration]
GO

-- =============================================================================
-- CRUD SQL for [__mj_BizAppsReferrals].[ProfessionalAvailabilityWindow]
-- =============================================================================

-----------------------------------------------------------------
-- SQL Code Generation
-- Item: vwProfessionalAvailabilityWindows
--
-- This mirrors the exact structure MemberJunction CodeGen produces for this schema.
-- Regenerate via `mj codegen` once this migration is applied to a live database;
-- this hand-authored copy keeps the Wave 3 Slice 1 tables functional in the interim.
-----------------------------------------------------------------

------------------------------------------------------------
----- BASE VIEW FOR ENTITY TABLE: ProfessionalAvailabilityWindow
-----               SCHEMA:      __mj_BizAppsReferrals
-----               BASE TABLE:  ProfessionalAvailabilityWindow
-----               PRIMARY KEY: ID
------------------------------------------------------------
IF OBJECT_ID('[__mj_BizAppsReferrals].[vwProfessionalAvailabilityWindows]', 'V') IS NOT NULL
    DROP VIEW [__mj_BizAppsReferrals].[vwProfessionalAvailabilityWindows];
GO

CREATE VIEW [__mj_BizAppsReferrals].[vwProfessionalAvailabilityWindows]
AS
SELECT
    c.*
FROM
    [__mj_BizAppsReferrals].[ProfessionalAvailabilityWindow] AS c
GO
GRANT SELECT ON [__mj_BizAppsReferrals].[vwProfessionalAvailabilityWindows] TO [cdp_UI], [cdp_Developer], [cdp_Integration]
GO

-----------------------------------------------------------------
-- SQL Code Generation
-- Item: spCreateProfessionalAvailabilityWindow
--
-- This mirrors the exact structure MemberJunction CodeGen produces for this schema.
-- Regenerate via `mj codegen` once this migration is applied to a live database;
-- this hand-authored copy keeps the Wave 3 Slice 1 tables functional in the interim.
-----------------------------------------------------------------

------------------------------------------------------------
----- CREATE PROCEDURE FOR ProfessionalAvailabilityWindow
------------------------------------------------------------
IF OBJECT_ID('[__mj_BizAppsReferrals].[spCreateProfessionalAvailabilityWindow]', 'P') IS NOT NULL
    DROP PROCEDURE [__mj_BizAppsReferrals].[spCreateProfessionalAvailabilityWindow];
GO

CREATE PROCEDURE [__mj_BizAppsReferrals].[spCreateProfessionalAvailabilityWindow]
    @ID uniqueidentifier = NULL,
    @ProfessionalProfileID uniqueidentifier,
    @WindowType nvarchar(40) = NULL,
    @DayOfWeek_Clear bit = 0,
    @DayOfWeek int = NULL,
    @StartTimeMinutes_Clear bit = 0,
    @StartTimeMinutes int = NULL,
    @EndTimeMinutes_Clear bit = 0,
    @EndTimeMinutes int = NULL,
    @StartDate_Clear bit = 0,
    @StartDate datetimeoffset = NULL,
    @EndDate_Clear bit = 0,
    @EndDate datetimeoffset = NULL,
    @IsAvailable bit = NULL,
    @TimeZone nvarchar(100) = NULL,
    @Notes_Clear bit = 0,
    @Notes nvarchar(255) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @InsertedRow TABLE ([ID] UNIQUEIDENTIFIER)

    IF @ID IS NOT NULL
    BEGIN
        INSERT INTO [__mj_BizAppsReferrals].[ProfessionalAvailabilityWindow]
            (
                [ID],
                [ProfessionalProfileID],
                [WindowType],
                [DayOfWeek],
                [StartTimeMinutes],
                [EndTimeMinutes],
                [StartDate],
                [EndDate],
                [IsAvailable],
                [TimeZone],
                [Notes]
            )
        OUTPUT INSERTED.[ID] INTO @InsertedRow
        VALUES
            (
                @ID,
                @ProfessionalProfileID,
                ISNULL(@WindowType, 'Recurring'),
                CASE WHEN @DayOfWeek_Clear = 1 THEN NULL ELSE @DayOfWeek END,
                CASE WHEN @StartTimeMinutes_Clear = 1 THEN NULL ELSE @StartTimeMinutes END,
                CASE WHEN @EndTimeMinutes_Clear = 1 THEN NULL ELSE @EndTimeMinutes END,
                CASE WHEN @StartDate_Clear = 1 THEN NULL ELSE @StartDate END,
                CASE WHEN @EndDate_Clear = 1 THEN NULL ELSE @EndDate END,
                ISNULL(@IsAvailable, 1),
                ISNULL(@TimeZone, 'UTC'),
                CASE WHEN @Notes_Clear = 1 THEN NULL ELSE @Notes END
            )
    END
    ELSE
    BEGIN
        INSERT INTO [__mj_BizAppsReferrals].[ProfessionalAvailabilityWindow]
            (
                [ProfessionalProfileID],
                [WindowType],
                [DayOfWeek],
                [StartTimeMinutes],
                [EndTimeMinutes],
                [StartDate],
                [EndDate],
                [IsAvailable],
                [TimeZone],
                [Notes]
            )
        OUTPUT INSERTED.[ID] INTO @InsertedRow
        VALUES
            (
                @ProfessionalProfileID,
                ISNULL(@WindowType, 'Recurring'),
                CASE WHEN @DayOfWeek_Clear = 1 THEN NULL ELSE @DayOfWeek END,
                CASE WHEN @StartTimeMinutes_Clear = 1 THEN NULL ELSE @StartTimeMinutes END,
                CASE WHEN @EndTimeMinutes_Clear = 1 THEN NULL ELSE @EndTimeMinutes END,
                CASE WHEN @StartDate_Clear = 1 THEN NULL ELSE @StartDate END,
                CASE WHEN @EndDate_Clear = 1 THEN NULL ELSE @EndDate END,
                ISNULL(@IsAvailable, 1),
                ISNULL(@TimeZone, 'UTC'),
                CASE WHEN @Notes_Clear = 1 THEN NULL ELSE @Notes END
            )
    END
    SELECT * FROM [__mj_BizAppsReferrals].[vwProfessionalAvailabilityWindows] WHERE [ID] = (SELECT [ID] FROM @InsertedRow)
END
GO
GRANT EXECUTE ON [__mj_BizAppsReferrals].[spCreateProfessionalAvailabilityWindow] TO [cdp_Developer], [cdp_Integration]
GO

-----------------------------------------------------------------
-- SQL Code Generation
-- Item: spUpdateProfessionalAvailabilityWindow
--
-- This mirrors the exact structure MemberJunction CodeGen produces for this schema.
-- Regenerate via `mj codegen` once this migration is applied to a live database;
-- this hand-authored copy keeps the Wave 3 Slice 1 tables functional in the interim.
-----------------------------------------------------------------

------------------------------------------------------------
----- UPDATE PROCEDURE FOR ProfessionalAvailabilityWindow
------------------------------------------------------------
IF OBJECT_ID('[__mj_BizAppsReferrals].[spUpdateProfessionalAvailabilityWindow]', 'P') IS NOT NULL
    DROP PROCEDURE [__mj_BizAppsReferrals].[spUpdateProfessionalAvailabilityWindow];
GO

CREATE PROCEDURE [__mj_BizAppsReferrals].[spUpdateProfessionalAvailabilityWindow]
    @ID uniqueidentifier,
    @ProfessionalProfileID uniqueidentifier = NULL,
    @WindowType nvarchar(40) = NULL,
    @DayOfWeek_Clear bit = 0,
    @DayOfWeek int = NULL,
    @StartTimeMinutes_Clear bit = 0,
    @StartTimeMinutes int = NULL,
    @EndTimeMinutes_Clear bit = 0,
    @EndTimeMinutes int = NULL,
    @StartDate_Clear bit = 0,
    @StartDate datetimeoffset = NULL,
    @EndDate_Clear bit = 0,
    @EndDate datetimeoffset = NULL,
    @IsAvailable bit = NULL,
    @TimeZone nvarchar(100) = NULL,
    @Notes_Clear bit = 0,
    @Notes nvarchar(255) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE
        [__mj_BizAppsReferrals].[ProfessionalAvailabilityWindow]
    SET
        [ProfessionalProfileID] = ISNULL(@ProfessionalProfileID, [ProfessionalProfileID]),
        [WindowType] = ISNULL(@WindowType, [WindowType]),
        [DayOfWeek] = CASE WHEN @DayOfWeek_Clear = 1 THEN NULL ELSE ISNULL(@DayOfWeek, [DayOfWeek]) END,
        [StartTimeMinutes] = CASE WHEN @StartTimeMinutes_Clear = 1 THEN NULL ELSE ISNULL(@StartTimeMinutes, [StartTimeMinutes]) END,
        [EndTimeMinutes] = CASE WHEN @EndTimeMinutes_Clear = 1 THEN NULL ELSE ISNULL(@EndTimeMinutes, [EndTimeMinutes]) END,
        [StartDate] = CASE WHEN @StartDate_Clear = 1 THEN NULL ELSE ISNULL(@StartDate, [StartDate]) END,
        [EndDate] = CASE WHEN @EndDate_Clear = 1 THEN NULL ELSE ISNULL(@EndDate, [EndDate]) END,
        [IsAvailable] = ISNULL(@IsAvailable, [IsAvailable]),
        [TimeZone] = ISNULL(@TimeZone, [TimeZone]),
        [Notes] = CASE WHEN @Notes_Clear = 1 THEN NULL ELSE ISNULL(@Notes, [Notes]) END,
        [__mj_UpdatedAt] = GETUTCDATE()
    WHERE
        [ID] = @ID

    IF @@ROWCOUNT = 0
        SELECT TOP 0 * FROM [__mj_BizAppsReferrals].[vwProfessionalAvailabilityWindows] WHERE 1=0
    ELSE
        SELECT * FROM [__mj_BizAppsReferrals].[vwProfessionalAvailabilityWindows] WHERE [ID] = @ID
END
GO

GRANT EXECUTE ON [__mj_BizAppsReferrals].[spUpdateProfessionalAvailabilityWindow] TO [cdp_Developer], [cdp_Integration]
GO

------------------------------------------------------------
----- TRIGGER FOR __mj_UpdatedAt field for the ProfessionalAvailabilityWindow table
------------------------------------------------------------
IF OBJECT_ID('[__mj_BizAppsReferrals].[trgUpdateProfessionalAvailabilityWindow]', 'TR') IS NOT NULL
    DROP TRIGGER [__mj_BizAppsReferrals].[trgUpdateProfessionalAvailabilityWindow];
GO
CREATE TRIGGER [__mj_BizAppsReferrals].trgUpdateProfessionalAvailabilityWindow
ON [__mj_BizAppsReferrals].[ProfessionalAvailabilityWindow]
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    IF NOT UPDATE([__mj_UpdatedAt])
    BEGIN
        UPDATE
            [__mj_BizAppsReferrals].[ProfessionalAvailabilityWindow]
        SET
            __mj_UpdatedAt = GETUTCDATE()
        FROM
            [__mj_BizAppsReferrals].[ProfessionalAvailabilityWindow] AS _organicTable
        INNER JOIN
            INSERTED AS I ON
            _organicTable.[ID] = I.[ID];
    END
END;
GO

-----------------------------------------------------------------
-- SQL Code Generation
-- Item: spDeleteProfessionalAvailabilityWindow
--
-- This mirrors the exact structure MemberJunction CodeGen produces for this schema.
-- Regenerate via `mj codegen` once this migration is applied to a live database;
-- this hand-authored copy keeps the Wave 3 Slice 1 tables functional in the interim.
-----------------------------------------------------------------

------------------------------------------------------------
----- DELETE PROCEDURE FOR ProfessionalAvailabilityWindow
------------------------------------------------------------
IF OBJECT_ID('[__mj_BizAppsReferrals].[spDeleteProfessionalAvailabilityWindow]', 'P') IS NOT NULL
    DROP PROCEDURE [__mj_BizAppsReferrals].[spDeleteProfessionalAvailabilityWindow];
GO

CREATE PROCEDURE [__mj_BizAppsReferrals].[spDeleteProfessionalAvailabilityWindow]
    @ID uniqueidentifier
AS
BEGIN
    SET NOCOUNT ON;

    DELETE FROM
        [__mj_BizAppsReferrals].[ProfessionalAvailabilityWindow]
    WHERE
        [ID] = @ID

    IF @@ROWCOUNT = 0
        SELECT NULL AS [ID]
    ELSE
        SELECT @ID AS [ID]
END
GO
GRANT EXECUTE ON [__mj_BizAppsReferrals].[spDeleteProfessionalAvailabilityWindow] TO [cdp_Developer], [cdp_Integration]
GO

-- =============================================================================
-- CRUD SQL for [__mj_BizAppsReferrals].[ReciprocitySnapshot]
-- =============================================================================

-----------------------------------------------------------------
-- SQL Code Generation
-- Item: vwReciprocitySnapshots
--
-- This mirrors the exact structure MemberJunction CodeGen produces for this schema.
-- Regenerate via `mj codegen` once this migration is applied to a live database;
-- this hand-authored copy keeps the Wave 3 Slice 1 tables functional in the interim.
-----------------------------------------------------------------

------------------------------------------------------------
----- BASE VIEW FOR ENTITY TABLE: ReciprocitySnapshot
-----               SCHEMA:      __mj_BizAppsReferrals
-----               BASE TABLE:  ReciprocitySnapshot
-----               PRIMARY KEY: ID
------------------------------------------------------------
IF OBJECT_ID('[__mj_BizAppsReferrals].[vwReciprocitySnapshots]', 'V') IS NOT NULL
    DROP VIEW [__mj_BizAppsReferrals].[vwReciprocitySnapshots];
GO

CREATE VIEW [__mj_BizAppsReferrals].[vwReciprocitySnapshots]
AS
SELECT
    c.*
FROM
    [__mj_BizAppsReferrals].[ReciprocitySnapshot] AS c
GO
GRANT SELECT ON [__mj_BizAppsReferrals].[vwReciprocitySnapshots] TO [cdp_UI], [cdp_Developer], [cdp_Integration]
GO

-----------------------------------------------------------------
-- SQL Code Generation
-- Item: spCreateReciprocitySnapshot
--
-- This mirrors the exact structure MemberJunction CodeGen produces for this schema.
-- Regenerate via `mj codegen` once this migration is applied to a live database;
-- this hand-authored copy keeps the Wave 3 Slice 1 tables functional in the interim.
-----------------------------------------------------------------

------------------------------------------------------------
----- CREATE PROCEDURE FOR ReciprocitySnapshot
------------------------------------------------------------
IF OBJECT_ID('[__mj_BizAppsReferrals].[spCreateReciprocitySnapshot]', 'P') IS NOT NULL
    DROP PROCEDURE [__mj_BizAppsReferrals].[spCreateReciprocitySnapshot];
GO

CREATE PROCEDURE [__mj_BizAppsReferrals].[spCreateReciprocitySnapshot]
    @ID uniqueidentifier = NULL,
    @ProfessionalProfileID uniqueidentifier,
    @SnapshotDate datetimeoffset = NULL,
    @PeriodStartDate datetimeoffset,
    @PeriodEndDate datetimeoffset,
    @ReferralsGivenCount int = NULL,
    @ReferralsReceivedCount int = NULL,
    @ReciprocityIndex decimal(5, 2) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @InsertedRow TABLE ([ID] UNIQUEIDENTIFIER)

    IF @ID IS NOT NULL
    BEGIN
        INSERT INTO [__mj_BizAppsReferrals].[ReciprocitySnapshot]
            (
                [ID],
                [ProfessionalProfileID],
                [SnapshotDate],
                [PeriodStartDate],
                [PeriodEndDate],
                [ReferralsGivenCount],
                [ReferralsReceivedCount],
                [ReciprocityIndex]
            )
        OUTPUT INSERTED.[ID] INTO @InsertedRow
        VALUES
            (
                @ID,
                @ProfessionalProfileID,
                ISNULL(@SnapshotDate, SYSDATETIMEOFFSET()),
                @PeriodStartDate,
                @PeriodEndDate,
                ISNULL(@ReferralsGivenCount, 0),
                ISNULL(@ReferralsReceivedCount, 0),
                ISNULL(@ReciprocityIndex, 0.00)
            )
    END
    ELSE
    BEGIN
        INSERT INTO [__mj_BizAppsReferrals].[ReciprocitySnapshot]
            (
                [ProfessionalProfileID],
                [SnapshotDate],
                [PeriodStartDate],
                [PeriodEndDate],
                [ReferralsGivenCount],
                [ReferralsReceivedCount],
                [ReciprocityIndex]
            )
        OUTPUT INSERTED.[ID] INTO @InsertedRow
        VALUES
            (
                @ProfessionalProfileID,
                ISNULL(@SnapshotDate, SYSDATETIMEOFFSET()),
                @PeriodStartDate,
                @PeriodEndDate,
                ISNULL(@ReferralsGivenCount, 0),
                ISNULL(@ReferralsReceivedCount, 0),
                ISNULL(@ReciprocityIndex, 0.00)
            )
    END
    SELECT * FROM [__mj_BizAppsReferrals].[vwReciprocitySnapshots] WHERE [ID] = (SELECT [ID] FROM @InsertedRow)
END
GO
GRANT EXECUTE ON [__mj_BizAppsReferrals].[spCreateReciprocitySnapshot] TO [cdp_Developer], [cdp_Integration]
GO

-----------------------------------------------------------------
-- SQL Code Generation
-- Item: spUpdateReciprocitySnapshot
--
-- This mirrors the exact structure MemberJunction CodeGen produces for this schema.
-- Regenerate via `mj codegen` once this migration is applied to a live database;
-- this hand-authored copy keeps the Wave 3 Slice 1 tables functional in the interim.
-----------------------------------------------------------------

------------------------------------------------------------
----- UPDATE PROCEDURE FOR ReciprocitySnapshot
------------------------------------------------------------
IF OBJECT_ID('[__mj_BizAppsReferrals].[spUpdateReciprocitySnapshot]', 'P') IS NOT NULL
    DROP PROCEDURE [__mj_BizAppsReferrals].[spUpdateReciprocitySnapshot];
GO

CREATE PROCEDURE [__mj_BizAppsReferrals].[spUpdateReciprocitySnapshot]
    @ID uniqueidentifier,
    @ProfessionalProfileID uniqueidentifier = NULL,
    @SnapshotDate datetimeoffset = NULL,
    @PeriodStartDate datetimeoffset = NULL,
    @PeriodEndDate datetimeoffset = NULL,
    @ReferralsGivenCount int = NULL,
    @ReferralsReceivedCount int = NULL,
    @ReciprocityIndex decimal(5, 2) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE
        [__mj_BizAppsReferrals].[ReciprocitySnapshot]
    SET
        [ProfessionalProfileID] = ISNULL(@ProfessionalProfileID, [ProfessionalProfileID]),
        [SnapshotDate] = ISNULL(@SnapshotDate, [SnapshotDate]),
        [PeriodStartDate] = ISNULL(@PeriodStartDate, [PeriodStartDate]),
        [PeriodEndDate] = ISNULL(@PeriodEndDate, [PeriodEndDate]),
        [ReferralsGivenCount] = ISNULL(@ReferralsGivenCount, [ReferralsGivenCount]),
        [ReferralsReceivedCount] = ISNULL(@ReferralsReceivedCount, [ReferralsReceivedCount]),
        [ReciprocityIndex] = ISNULL(@ReciprocityIndex, [ReciprocityIndex]),
        [__mj_UpdatedAt] = GETUTCDATE()
    WHERE
        [ID] = @ID

    IF @@ROWCOUNT = 0
        SELECT TOP 0 * FROM [__mj_BizAppsReferrals].[vwReciprocitySnapshots] WHERE 1=0
    ELSE
        SELECT * FROM [__mj_BizAppsReferrals].[vwReciprocitySnapshots] WHERE [ID] = @ID
END
GO

GRANT EXECUTE ON [__mj_BizAppsReferrals].[spUpdateReciprocitySnapshot] TO [cdp_Developer], [cdp_Integration]
GO

------------------------------------------------------------
----- TRIGGER FOR __mj_UpdatedAt field for the ReciprocitySnapshot table
------------------------------------------------------------
IF OBJECT_ID('[__mj_BizAppsReferrals].[trgUpdateReciprocitySnapshot]', 'TR') IS NOT NULL
    DROP TRIGGER [__mj_BizAppsReferrals].[trgUpdateReciprocitySnapshot];
GO
CREATE TRIGGER [__mj_BizAppsReferrals].trgUpdateReciprocitySnapshot
ON [__mj_BizAppsReferrals].[ReciprocitySnapshot]
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    IF NOT UPDATE([__mj_UpdatedAt])
    BEGIN
        UPDATE
            [__mj_BizAppsReferrals].[ReciprocitySnapshot]
        SET
            __mj_UpdatedAt = GETUTCDATE()
        FROM
            [__mj_BizAppsReferrals].[ReciprocitySnapshot] AS _organicTable
        INNER JOIN
            INSERTED AS I ON
            _organicTable.[ID] = I.[ID];
    END
END;
GO

-----------------------------------------------------------------
-- SQL Code Generation
-- Item: spDeleteReciprocitySnapshot
--
-- This mirrors the exact structure MemberJunction CodeGen produces for this schema.
-- Regenerate via `mj codegen` once this migration is applied to a live database;
-- this hand-authored copy keeps the Wave 3 Slice 1 tables functional in the interim.
-----------------------------------------------------------------

------------------------------------------------------------
----- DELETE PROCEDURE FOR ReciprocitySnapshot
------------------------------------------------------------
IF OBJECT_ID('[__mj_BizAppsReferrals].[spDeleteReciprocitySnapshot]', 'P') IS NOT NULL
    DROP PROCEDURE [__mj_BizAppsReferrals].[spDeleteReciprocitySnapshot];
GO

CREATE PROCEDURE [__mj_BizAppsReferrals].[spDeleteReciprocitySnapshot]
    @ID uniqueidentifier
AS
BEGIN
    SET NOCOUNT ON;

    DELETE FROM
        [__mj_BizAppsReferrals].[ReciprocitySnapshot]
    WHERE
        [ID] = @ID

    IF @@ROWCOUNT = 0
        SELECT NULL AS [ID]
    ELSE
        SELECT @ID AS [ID]
END
GO
GRANT EXECUTE ON [__mj_BizAppsReferrals].[spDeleteReciprocitySnapshot] TO [cdp_Developer], [cdp_Integration]
GO
























































-- =============================================================================
-- GENERATED BY MemberJunction CodeGen -- DO NOT EDIT BY HAND
-- =============================================================================

/* SQL generated to create new entity MJ_BizApps_Referrals: Referral Escalations */
IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[Entity] WHERE [ID] = 'A3000001-1111-4111-8111-000000000001')
BEGIN
      INSERT INTO [${flyway:defaultSchema}].[Entity] (
         [ID],
         [Name],
         [DisplayName],
         [Description],
         [NameSuffix],
         [BaseTable],
         [BaseView],
         [SchemaName],
         [IncludeInAPI],
         [AllowUserSearchAPI],
         [AllowCaching],
         [TrackRecordChanges],
         [AuditRecordAccess],
         [AuditViewRuns],
         [AllowAllRowsAPI],
         [AllowCreateAPI],
         [AllowUpdateAPI],
         [AllowDeleteAPI],
         [UserViewMaxRows]
         , [__mj_CreatedAt]
         , [__mj_UpdatedAt]
      )
      VALUES (
         'A3000001-1111-4111-8111-000000000001',
         'MJ_BizApps_Referrals: Referral Escalations',
         'Referral Escalations',
         'SLA warning/breach escalation events raised against a ReferralRequest or ReferralAssignment.',
         NULL,
         'ReferralEscalation',
         'vwReferralEscalations',
         '__mj_BizAppsReferrals',
         1,
         0,
         0,
         1,
         0,
         0,
         0,
         1,
         1,
         1,
         1000
         , GETUTCDATE()
         , GETUTCDATE()
      );
END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '7e645a03-4b8c-4d0a-baf5-2769ca44994a' OR (EntityID = 'A3000001-1111-4111-8111-000000000001' AND Name = 'ID')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '7e645a03-4b8c-4d0a-baf5-2769ca44994a',
            'A3000001-1111-4111-8111-000000000001', -- Entity: MJ_BizApps_Referrals: Referral Escalations
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = 'A3000001-1111-4111-8111-000000000001'),
            'ID',
            'ID',
            NULL,
            'uniqueidentifier',
            16,
            0,
            0,
            0,
            N'newsequentialid()',
            0,
            0,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            1,
            1,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '57789683-9b4d-4b00-a441-56e683d1b2bf' OR (EntityID = 'A3000001-1111-4111-8111-000000000001' AND Name = 'ReferralRequestID')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '57789683-9b4d-4b00-a441-56e683d1b2bf',
            'A3000001-1111-4111-8111-000000000001', -- Entity: MJ_BizApps_Referrals: Referral Escalations
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = 'A3000001-1111-4111-8111-000000000001'),
            'ReferralRequestID',
            'Referral Request',
            NULL,
            'uniqueidentifier',
            16,
            0,
            0,
            0,
            NULL,
            0,
            1,
            0,
            0,
            'C1CEBBE7-15E6-4134-B303-96F38D585F65',
            'ID',
            0,
            0,
            1,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '8c1a4d34-fc57-488f-b5c6-c40d58ab4fc7' OR (EntityID = 'A3000001-1111-4111-8111-000000000001' AND Name = 'ReferralAssignmentID')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '8c1a4d34-fc57-488f-b5c6-c40d58ab4fc7',
            'A3000001-1111-4111-8111-000000000001', -- Entity: MJ_BizApps_Referrals: Referral Escalations
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = 'A3000001-1111-4111-8111-000000000001'),
            'ReferralAssignmentID',
            'Referral Assignment',
            NULL,
            'uniqueidentifier',
            16,
            0,
            0,
            1,
            NULL,
            0,
            1,
            0,
            0,
            '7EB379C8-6C97-4640-B0AA-94F0874F4182',
            'ID',
            0,
            0,
            1,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '4525650a-1f92-4db9-9c3a-f3b040133e83' OR (EntityID = 'A3000001-1111-4111-8111-000000000001' AND Name = 'EscalationLevel')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '4525650a-1f92-4db9-9c3a-f3b040133e83',
            'A3000001-1111-4111-8111-000000000001', -- Entity: MJ_BizApps_Referrals: Referral Escalations
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = 'A3000001-1111-4111-8111-000000000001'),
            'EscalationLevel',
            'Escalation Level',
            NULL,
            'int',
            4,
            0,
            0,
            0,
            N'1',
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '5145c38f-47b5-4b27-83a4-b36d86fa4ba9' OR (EntityID = 'A3000001-1111-4111-8111-000000000001' AND Name = 'TriggerType')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '5145c38f-47b5-4b27-83a4-b36d86fa4ba9',
            'A3000001-1111-4111-8111-000000000001', -- Entity: MJ_BizApps_Referrals: Referral Escalations
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = 'A3000001-1111-4111-8111-000000000001'),
            'TriggerType',
            'Trigger Type',
            NULL,
            'nvarchar',
            60,
            0,
            0,
            0,
            N'SLAWarning',
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '5229ae3f-76b1-428d-a8c9-3a87c0c1337e' OR (EntityID = 'A3000001-1111-4111-8111-000000000001' AND Name = 'Status')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '5229ae3f-76b1-428d-a8c9-3a87c0c1337e',
            'A3000001-1111-4111-8111-000000000001', -- Entity: MJ_BizApps_Referrals: Referral Escalations
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = 'A3000001-1111-4111-8111-000000000001'),
            'Status',
            'Status',
            NULL,
            'nvarchar',
            40,
            0,
            0,
            0,
            N'Open',
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = 'a75011fd-a5d5-4217-b3f8-ce38ad87c1a2' OR (EntityID = 'A3000001-1111-4111-8111-000000000001' AND Name = 'RecommendedAction')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            'a75011fd-a5d5-4217-b3f8-ce38ad87c1a2',
            'A3000001-1111-4111-8111-000000000001', -- Entity: MJ_BizApps_Referrals: Referral Escalations
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = 'A3000001-1111-4111-8111-000000000001'),
            'RecommendedAction',
            'Recommended Action',
            NULL,
            'nvarchar',
            60,
            0,
            0,
            0,
            N'Notify',
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '2e8c1bd7-1c86-4c5a-bcb9-ed4522a463e5' OR (EntityID = 'A3000001-1111-4111-8111-000000000001' AND Name = 'Notes')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '2e8c1bd7-1c86-4c5a-bcb9-ed4522a463e5',
            'A3000001-1111-4111-8111-000000000001', -- Entity: MJ_BizApps_Referrals: Referral Escalations
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = 'A3000001-1111-4111-8111-000000000001'),
            'Notes',
            'Notes',
            NULL,
            'nvarchar',
            -1,
            0,
            0,
            1,
            NULL,
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '9aec714d-42d2-4dd7-baaf-382f53664082' OR (EntityID = 'A3000001-1111-4111-8111-000000000001' AND Name = 'TriggeredAt')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '9aec714d-42d2-4dd7-baaf-382f53664082',
            'A3000001-1111-4111-8111-000000000001', -- Entity: MJ_BizApps_Referrals: Referral Escalations
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = 'A3000001-1111-4111-8111-000000000001'),
            'TriggeredAt',
            'Triggered At',
            NULL,
            'datetimeoffset',
            10,
            0,
            0,
            0,
            N'sysdatetimeoffset()',
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '9c331af6-fe45-439b-92d8-afdc17667077' OR (EntityID = 'A3000001-1111-4111-8111-000000000001' AND Name = 'AcknowledgedAt')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '9c331af6-fe45-439b-92d8-afdc17667077',
            'A3000001-1111-4111-8111-000000000001', -- Entity: MJ_BizApps_Referrals: Referral Escalations
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = 'A3000001-1111-4111-8111-000000000001'),
            'AcknowledgedAt',
            'Acknowledged At',
            NULL,
            'datetimeoffset',
            10,
            0,
            0,
            1,
            NULL,
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '493b772c-e2c8-40c1-af6a-eff30016a5dc' OR (EntityID = 'A3000001-1111-4111-8111-000000000001' AND Name = 'ResolvedAt')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '493b772c-e2c8-40c1-af6a-eff30016a5dc',
            'A3000001-1111-4111-8111-000000000001', -- Entity: MJ_BizApps_Referrals: Referral Escalations
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = 'A3000001-1111-4111-8111-000000000001'),
            'ResolvedAt',
            'Resolved At',
            NULL,
            'datetimeoffset',
            10,
            0,
            0,
            1,
            NULL,
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '845fca47-f067-4a91-8215-6acd98866725' OR (EntityID = 'A3000001-1111-4111-8111-000000000001' AND Name = '__mj_CreatedAt')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '845fca47-f067-4a91-8215-6acd98866725',
            'A3000001-1111-4111-8111-000000000001', -- Entity: MJ_BizApps_Referrals: Referral Escalations
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = 'A3000001-1111-4111-8111-000000000001'),
            '__mj_CreatedAt',
            'Created At',
            NULL,
            'datetimeoffset',
            10,
            0,
            0,
            0,
            N'getutcdate()',
            0,
            0,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = 'd06a1cf0-d8c7-4a36-a4d3-eb8661feb5bc' OR (EntityID = 'A3000001-1111-4111-8111-000000000001' AND Name = '__mj_UpdatedAt')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            'd06a1cf0-d8c7-4a36-a4d3-eb8661feb5bc',
            'A3000001-1111-4111-8111-000000000001', -- Entity: MJ_BizApps_Referrals: Referral Escalations
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = 'A3000001-1111-4111-8111-000000000001'),
            '__mj_UpdatedAt',
            'Updated At',
            NULL,
            'datetimeoffset',
            10,
            0,
            0,
            0,
            N'getutcdate()',
            0,
            0,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

/* SQL generated to add new permission for entity MJ_BizApps_Referrals: Referral Escalations for role UI */
INSERT INTO [${flyway:defaultSchema}].[EntityPermission]
                ([EntityID], [RoleID], [Type], [CanRead], [CanCreate], [CanUpdate], [CanDelete], [__mj_CreatedAt], [__mj_UpdatedAt])
              SELECT CAST('A3000001-1111-4111-8111-000000000001' AS uniqueidentifier), CAST('E0AFCCEC-6A37-EF11-86D4-000D3A4E707E' AS uniqueidentifier), 'Allow', 1, 0, 0, 0, GETUTCDATE(), GETUTCDATE()
              WHERE NOT EXISTS (
                SELECT 1 FROM [${flyway:defaultSchema}].[EntityPermission]
                WHERE [EntityID] = CAST('A3000001-1111-4111-8111-000000000001' AS uniqueidentifier) AND [RoleID] = CAST('E0AFCCEC-6A37-EF11-86D4-000D3A4E707E' AS uniqueidentifier) AND [Type] = 'Allow'
              );

/* SQL generated to add new permission for entity MJ_BizApps_Referrals: Referral Escalations for role Developer */
INSERT INTO [${flyway:defaultSchema}].[EntityPermission]
                ([EntityID], [RoleID], [Type], [CanRead], [CanCreate], [CanUpdate], [CanDelete], [__mj_CreatedAt], [__mj_UpdatedAt])
              SELECT CAST('A3000001-1111-4111-8111-000000000001' AS uniqueidentifier), CAST('DEAFCCEC-6A37-EF11-86D4-000D3A4E707E' AS uniqueidentifier), 'Allow', 1, 1, 1, 1, GETUTCDATE(), GETUTCDATE()
              WHERE NOT EXISTS (
                SELECT 1 FROM [${flyway:defaultSchema}].[EntityPermission]
                WHERE [EntityID] = CAST('A3000001-1111-4111-8111-000000000001' AS uniqueidentifier) AND [RoleID] = CAST('DEAFCCEC-6A37-EF11-86D4-000D3A4E707E' AS uniqueidentifier) AND [Type] = 'Allow'
              );

/* SQL generated to add new permission for entity MJ_BizApps_Referrals: Referral Escalations for role Integration */
INSERT INTO [${flyway:defaultSchema}].[EntityPermission]
                ([EntityID], [RoleID], [Type], [CanRead], [CanCreate], [CanUpdate], [CanDelete], [__mj_CreatedAt], [__mj_UpdatedAt])
              SELECT CAST('A3000001-1111-4111-8111-000000000001' AS uniqueidentifier), CAST('DFAFCCEC-6A37-EF11-86D4-000D3A4E707E' AS uniqueidentifier), 'Allow', 1, 1, 1, 1, GETUTCDATE(), GETUTCDATE()
              WHERE NOT EXISTS (
                SELECT 1 FROM [${flyway:defaultSchema}].[EntityPermission]
                WHERE [EntityID] = CAST('A3000001-1111-4111-8111-000000000001' AS uniqueidentifier) AND [RoleID] = CAST('DFAFCCEC-6A37-EF11-86D4-000D3A4E707E' AS uniqueidentifier) AND [Type] = 'Allow'
              );

/* SQL generated to create new entity MJ_BizApps_Referrals: Referral Outcomes */
IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[Entity] WHERE [ID] = 'A3000001-1111-4111-8111-000000000002')
BEGIN
      INSERT INTO [${flyway:defaultSchema}].[Entity] (
         [ID],
         [Name],
         [DisplayName],
         [Description],
         [NameSuffix],
         [BaseTable],
         [BaseView],
         [SchemaName],
         [IncludeInAPI],
         [AllowUserSearchAPI],
         [AllowCaching],
         [TrackRecordChanges],
         [AuditRecordAccess],
         [AuditViewRuns],
         [AllowAllRowsAPI],
         [AllowCreateAPI],
         [AllowUpdateAPI],
         [AllowDeleteAPI],
         [UserViewMaxRows]
         , [__mj_CreatedAt]
         , [__mj_UpdatedAt]
      )
      VALUES (
         'A3000001-1111-4111-8111-000000000002',
         'MJ_BizApps_Referrals: Referral Outcomes',
         'Referral Outcomes',
         'Terminal outcome recorded when a ReferralAssignment is marked complete.',
         NULL,
         'ReferralOutcome',
         'vwReferralOutcomes',
         '__mj_BizAppsReferrals',
         1,
         0,
         0,
         1,
         0,
         0,
         0,
         1,
         1,
         1,
         1000
         , GETUTCDATE()
         , GETUTCDATE()
      );
END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '8bb6d491-4b20-42df-8009-3a040862c6b2' OR (EntityID = 'A3000001-1111-4111-8111-000000000002' AND Name = 'ID')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '8bb6d491-4b20-42df-8009-3a040862c6b2',
            'A3000001-1111-4111-8111-000000000002', -- Entity: MJ_BizApps_Referrals: Referral Outcomes
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = 'A3000001-1111-4111-8111-000000000002'),
            'ID',
            'ID',
            NULL,
            'uniqueidentifier',
            16,
            0,
            0,
            0,
            N'newsequentialid()',
            0,
            0,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            1,
            1,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '4b16e59f-0b28-44d4-a2df-217ba1194016' OR (EntityID = 'A3000001-1111-4111-8111-000000000002' AND Name = 'ReferralRequestID')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '4b16e59f-0b28-44d4-a2df-217ba1194016',
            'A3000001-1111-4111-8111-000000000002', -- Entity: MJ_BizApps_Referrals: Referral Outcomes
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = 'A3000001-1111-4111-8111-000000000002'),
            'ReferralRequestID',
            'Referral Request',
            NULL,
            'uniqueidentifier',
            16,
            0,
            0,
            0,
            NULL,
            0,
            1,
            0,
            0,
            'C1CEBBE7-15E6-4134-B303-96F38D585F65',
            'ID',
            0,
            0,
            1,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '7cc388d0-ed80-461a-b42a-1049ba30c956' OR (EntityID = 'A3000001-1111-4111-8111-000000000002' AND Name = 'ReferralAssignmentID')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '7cc388d0-ed80-461a-b42a-1049ba30c956',
            'A3000001-1111-4111-8111-000000000002', -- Entity: MJ_BizApps_Referrals: Referral Outcomes
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = 'A3000001-1111-4111-8111-000000000002'),
            'ReferralAssignmentID',
            'Referral Assignment',
            NULL,
            'uniqueidentifier',
            16,
            0,
            0,
            0,
            NULL,
            0,
            1,
            0,
            0,
            '7EB379C8-6C97-4640-B0AA-94F0874F4182',
            'ID',
            0,
            0,
            1,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '967dcc95-2c9d-439f-99ca-06b83db25f5e' OR (EntityID = 'A3000001-1111-4111-8111-000000000002' AND Name = 'ProfessionalProfileID')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '967dcc95-2c9d-439f-99ca-06b83db25f5e',
            'A3000001-1111-4111-8111-000000000002', -- Entity: MJ_BizApps_Referrals: Referral Outcomes
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = 'A3000001-1111-4111-8111-000000000002'),
            'ProfessionalProfileID',
            'Professional Profile',
            NULL,
            'uniqueidentifier',
            16,
            0,
            0,
            0,
            NULL,
            0,
            1,
            0,
            0,
            '7492A921-FFCF-4A3E-B59A-56C88D16DDE1',
            'ID',
            0,
            0,
            1,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '852291c8-f813-4672-9b2b-66c38cdf45f4' OR (EntityID = 'A3000001-1111-4111-8111-000000000002' AND Name = 'OutcomeStatus')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '852291c8-f813-4672-9b2b-66c38cdf45f4',
            'A3000001-1111-4111-8111-000000000002', -- Entity: MJ_BizApps_Referrals: Referral Outcomes
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = 'A3000001-1111-4111-8111-000000000002'),
            'OutcomeStatus',
            'Outcome Status',
            NULL,
            'nvarchar',
            60,
            0,
            0,
            0,
            N'Completed',
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '4d7adaf6-bf77-4409-a9be-1d2a05065de6' OR (EntityID = 'A3000001-1111-4111-8111-000000000002' AND Name = 'ResponseHours')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '4d7adaf6-bf77-4409-a9be-1d2a05065de6',
            'A3000001-1111-4111-8111-000000000002', -- Entity: MJ_BizApps_Referrals: Referral Outcomes
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = 'A3000001-1111-4111-8111-000000000002'),
            'ResponseHours',
            'Response Hours',
            NULL,
            'decimal',
            9,
            6,
            2,
            1,
            NULL,
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '48dcf16e-f6d8-4f9c-bd9d-5809d84a319a' OR (EntityID = 'A3000001-1111-4111-8111-000000000002' AND Name = 'CompletionNotes')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '48dcf16e-f6d8-4f9c-bd9d-5809d84a319a',
            'A3000001-1111-4111-8111-000000000002', -- Entity: MJ_BizApps_Referrals: Referral Outcomes
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = 'A3000001-1111-4111-8111-000000000002'),
            'CompletionNotes',
            'Completion Notes',
            NULL,
            'nvarchar',
            -1,
            0,
            0,
            1,
            NULL,
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '55265823-f83c-4c2e-97ce-3b84a5f18806' OR (EntityID = 'A3000001-1111-4111-8111-000000000002' AND Name = 'CompletedAt')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '55265823-f83c-4c2e-97ce-3b84a5f18806',
            'A3000001-1111-4111-8111-000000000002', -- Entity: MJ_BizApps_Referrals: Referral Outcomes
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = 'A3000001-1111-4111-8111-000000000002'),
            'CompletedAt',
            'Completed At',
            NULL,
            'datetimeoffset',
            10,
            0,
            0,
            0,
            N'sysdatetimeoffset()',
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '1bee1d1a-6a9e-4075-869c-aca2e38693d2' OR (EntityID = 'A3000001-1111-4111-8111-000000000002' AND Name = '__mj_CreatedAt')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '1bee1d1a-6a9e-4075-869c-aca2e38693d2',
            'A3000001-1111-4111-8111-000000000002', -- Entity: MJ_BizApps_Referrals: Referral Outcomes
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = 'A3000001-1111-4111-8111-000000000002'),
            '__mj_CreatedAt',
            'Created At',
            NULL,
            'datetimeoffset',
            10,
            0,
            0,
            0,
            N'getutcdate()',
            0,
            0,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = 'e26c28cf-7739-419e-869a-0bce7d1e25f8' OR (EntityID = 'A3000001-1111-4111-8111-000000000002' AND Name = '__mj_UpdatedAt')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            'e26c28cf-7739-419e-869a-0bce7d1e25f8',
            'A3000001-1111-4111-8111-000000000002', -- Entity: MJ_BizApps_Referrals: Referral Outcomes
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = 'A3000001-1111-4111-8111-000000000002'),
            '__mj_UpdatedAt',
            'Updated At',
            NULL,
            'datetimeoffset',
            10,
            0,
            0,
            0,
            N'getutcdate()',
            0,
            0,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

/* SQL generated to add new permission for entity MJ_BizApps_Referrals: Referral Outcomes for role UI */
INSERT INTO [${flyway:defaultSchema}].[EntityPermission]
                ([EntityID], [RoleID], [Type], [CanRead], [CanCreate], [CanUpdate], [CanDelete], [__mj_CreatedAt], [__mj_UpdatedAt])
              SELECT CAST('A3000001-1111-4111-8111-000000000002' AS uniqueidentifier), CAST('E0AFCCEC-6A37-EF11-86D4-000D3A4E707E' AS uniqueidentifier), 'Allow', 1, 0, 0, 0, GETUTCDATE(), GETUTCDATE()
              WHERE NOT EXISTS (
                SELECT 1 FROM [${flyway:defaultSchema}].[EntityPermission]
                WHERE [EntityID] = CAST('A3000001-1111-4111-8111-000000000002' AS uniqueidentifier) AND [RoleID] = CAST('E0AFCCEC-6A37-EF11-86D4-000D3A4E707E' AS uniqueidentifier) AND [Type] = 'Allow'
              );

/* SQL generated to add new permission for entity MJ_BizApps_Referrals: Referral Outcomes for role Developer */
INSERT INTO [${flyway:defaultSchema}].[EntityPermission]
                ([EntityID], [RoleID], [Type], [CanRead], [CanCreate], [CanUpdate], [CanDelete], [__mj_CreatedAt], [__mj_UpdatedAt])
              SELECT CAST('A3000001-1111-4111-8111-000000000002' AS uniqueidentifier), CAST('DEAFCCEC-6A37-EF11-86D4-000D3A4E707E' AS uniqueidentifier), 'Allow', 1, 1, 1, 1, GETUTCDATE(), GETUTCDATE()
              WHERE NOT EXISTS (
                SELECT 1 FROM [${flyway:defaultSchema}].[EntityPermission]
                WHERE [EntityID] = CAST('A3000001-1111-4111-8111-000000000002' AS uniqueidentifier) AND [RoleID] = CAST('DEAFCCEC-6A37-EF11-86D4-000D3A4E707E' AS uniqueidentifier) AND [Type] = 'Allow'
              );

/* SQL generated to add new permission for entity MJ_BizApps_Referrals: Referral Outcomes for role Integration */
INSERT INTO [${flyway:defaultSchema}].[EntityPermission]
                ([EntityID], [RoleID], [Type], [CanRead], [CanCreate], [CanUpdate], [CanDelete], [__mj_CreatedAt], [__mj_UpdatedAt])
              SELECT CAST('A3000001-1111-4111-8111-000000000002' AS uniqueidentifier), CAST('DFAFCCEC-6A37-EF11-86D4-000D3A4E707E' AS uniqueidentifier), 'Allow', 1, 1, 1, 1, GETUTCDATE(), GETUTCDATE()
              WHERE NOT EXISTS (
                SELECT 1 FROM [${flyway:defaultSchema}].[EntityPermission]
                WHERE [EntityID] = CAST('A3000001-1111-4111-8111-000000000002' AS uniqueidentifier) AND [RoleID] = CAST('DFAFCCEC-6A37-EF11-86D4-000D3A4E707E' AS uniqueidentifier) AND [Type] = 'Allow'
              );

/* SQL generated to create new entity MJ_BizApps_Referrals: Professional Availability Windows */
IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[Entity] WHERE [ID] = 'A3000001-1111-4111-8111-000000000003')
BEGIN
      INSERT INTO [${flyway:defaultSchema}].[Entity] (
         [ID],
         [Name],
         [DisplayName],
         [Description],
         [NameSuffix],
         [BaseTable],
         [BaseView],
         [SchemaName],
         [IncludeInAPI],
         [AllowUserSearchAPI],
         [AllowCaching],
         [TrackRecordChanges],
         [AuditRecordAccess],
         [AuditViewRuns],
         [AllowAllRowsAPI],
         [AllowCreateAPI],
         [AllowUpdateAPI],
         [AllowDeleteAPI],
         [UserViewMaxRows]
         , [__mj_CreatedAt]
         , [__mj_UpdatedAt]
      )
      VALUES (
         'A3000001-1111-4111-8111-000000000003',
         'MJ_BizApps_Referrals: Professional Availability Windows',
         'Professional Availability Windows',
         'Recurring, date-range, or blackout availability windows for a ProfessionalProfile.',
         NULL,
         'ProfessionalAvailabilityWindow',
         'vwProfessionalAvailabilityWindows',
         '__mj_BizAppsReferrals',
         1,
         0,
         0,
         1,
         0,
         0,
         0,
         1,
         1,
         1,
         1000
         , GETUTCDATE()
         , GETUTCDATE()
      );
END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '20bcf218-0e54-4a4c-9e0e-3ed36f0249ad' OR (EntityID = 'A3000001-1111-4111-8111-000000000003' AND Name = 'ID')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '20bcf218-0e54-4a4c-9e0e-3ed36f0249ad',
            'A3000001-1111-4111-8111-000000000003', -- Entity: MJ_BizApps_Referrals: Professional Availability Windows
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = 'A3000001-1111-4111-8111-000000000003'),
            'ID',
            'ID',
            NULL,
            'uniqueidentifier',
            16,
            0,
            0,
            0,
            N'newsequentialid()',
            0,
            0,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            1,
            1,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = 'a1727e2a-2c91-47f4-9cac-52d1165edb8c' OR (EntityID = 'A3000001-1111-4111-8111-000000000003' AND Name = 'ProfessionalProfileID')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            'a1727e2a-2c91-47f4-9cac-52d1165edb8c',
            'A3000001-1111-4111-8111-000000000003', -- Entity: MJ_BizApps_Referrals: Professional Availability Windows
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = 'A3000001-1111-4111-8111-000000000003'),
            'ProfessionalProfileID',
            'Professional Profile',
            NULL,
            'uniqueidentifier',
            16,
            0,
            0,
            0,
            NULL,
            0,
            1,
            0,
            0,
            '7492A921-FFCF-4A3E-B59A-56C88D16DDE1',
            'ID',
            0,
            0,
            1,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = 'bae2cebd-839d-4c88-b16e-c94a9b2eb995' OR (EntityID = 'A3000001-1111-4111-8111-000000000003' AND Name = 'WindowType')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            'bae2cebd-839d-4c88-b16e-c94a9b2eb995',
            'A3000001-1111-4111-8111-000000000003', -- Entity: MJ_BizApps_Referrals: Professional Availability Windows
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = 'A3000001-1111-4111-8111-000000000003'),
            'WindowType',
            'Window Type',
            NULL,
            'nvarchar',
            40,
            0,
            0,
            0,
            N'Recurring',
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = 'bcb509fc-461a-4fd5-a0fa-f014e92e84f4' OR (EntityID = 'A3000001-1111-4111-8111-000000000003' AND Name = 'DayOfWeek')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            'bcb509fc-461a-4fd5-a0fa-f014e92e84f4',
            'A3000001-1111-4111-8111-000000000003', -- Entity: MJ_BizApps_Referrals: Professional Availability Windows
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = 'A3000001-1111-4111-8111-000000000003'),
            'DayOfWeek',
            'Day Of Week',
            NULL,
            'int',
            4,
            0,
            0,
            1,
            NULL,
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '71f3122b-4a4a-4319-b206-3551cc32b8f8' OR (EntityID = 'A3000001-1111-4111-8111-000000000003' AND Name = 'StartTimeMinutes')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '71f3122b-4a4a-4319-b206-3551cc32b8f8',
            'A3000001-1111-4111-8111-000000000003', -- Entity: MJ_BizApps_Referrals: Professional Availability Windows
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = 'A3000001-1111-4111-8111-000000000003'),
            'StartTimeMinutes',
            'Start Time Minutes',
            NULL,
            'int',
            4,
            0,
            0,
            1,
            NULL,
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = 'db5bc5e6-e8af-4183-b44f-751900490c22' OR (EntityID = 'A3000001-1111-4111-8111-000000000003' AND Name = 'EndTimeMinutes')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            'db5bc5e6-e8af-4183-b44f-751900490c22',
            'A3000001-1111-4111-8111-000000000003', -- Entity: MJ_BizApps_Referrals: Professional Availability Windows
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = 'A3000001-1111-4111-8111-000000000003'),
            'EndTimeMinutes',
            'End Time Minutes',
            NULL,
            'int',
            4,
            0,
            0,
            1,
            NULL,
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = 'b06e7236-6f53-4cfe-956c-2ffc3e8191c0' OR (EntityID = 'A3000001-1111-4111-8111-000000000003' AND Name = 'StartDate')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            'b06e7236-6f53-4cfe-956c-2ffc3e8191c0',
            'A3000001-1111-4111-8111-000000000003', -- Entity: MJ_BizApps_Referrals: Professional Availability Windows
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = 'A3000001-1111-4111-8111-000000000003'),
            'StartDate',
            'Start Date',
            NULL,
            'datetimeoffset',
            10,
            0,
            0,
            1,
            NULL,
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = 'd29b95d9-e0cd-44ce-b59f-789a6bf0d22b' OR (EntityID = 'A3000001-1111-4111-8111-000000000003' AND Name = 'EndDate')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            'd29b95d9-e0cd-44ce-b59f-789a6bf0d22b',
            'A3000001-1111-4111-8111-000000000003', -- Entity: MJ_BizApps_Referrals: Professional Availability Windows
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = 'A3000001-1111-4111-8111-000000000003'),
            'EndDate',
            'End Date',
            NULL,
            'datetimeoffset',
            10,
            0,
            0,
            1,
            NULL,
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = 'c8ebb260-5b10-4a7c-ae0b-cd53dc706cc9' OR (EntityID = 'A3000001-1111-4111-8111-000000000003' AND Name = 'IsAvailable')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            'c8ebb260-5b10-4a7c-ae0b-cd53dc706cc9',
            'A3000001-1111-4111-8111-000000000003', -- Entity: MJ_BizApps_Referrals: Professional Availability Windows
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = 'A3000001-1111-4111-8111-000000000003'),
            'IsAvailable',
            'Is Available',
            NULL,
            'bit',
            1,
            0,
            0,
            0,
            N'1',
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '5f5477a5-4869-4d69-a4f3-db0166401b01' OR (EntityID = 'A3000001-1111-4111-8111-000000000003' AND Name = 'TimeZone')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '5f5477a5-4869-4d69-a4f3-db0166401b01',
            'A3000001-1111-4111-8111-000000000003', -- Entity: MJ_BizApps_Referrals: Professional Availability Windows
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = 'A3000001-1111-4111-8111-000000000003'),
            'TimeZone',
            'Time Zone',
            NULL,
            'nvarchar',
            100,
            0,
            0,
            0,
            N'UTC',
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '40ae074a-b4fa-46cd-8df6-07a48293fe8f' OR (EntityID = 'A3000001-1111-4111-8111-000000000003' AND Name = 'Notes')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '40ae074a-b4fa-46cd-8df6-07a48293fe8f',
            'A3000001-1111-4111-8111-000000000003', -- Entity: MJ_BizApps_Referrals: Professional Availability Windows
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = 'A3000001-1111-4111-8111-000000000003'),
            'Notes',
            'Notes',
            NULL,
            'nvarchar',
            510,
            0,
            0,
            1,
            NULL,
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '2407bc3e-6b7c-40eb-abb7-0c79a1e99bf2' OR (EntityID = 'A3000001-1111-4111-8111-000000000003' AND Name = '__mj_CreatedAt')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '2407bc3e-6b7c-40eb-abb7-0c79a1e99bf2',
            'A3000001-1111-4111-8111-000000000003', -- Entity: MJ_BizApps_Referrals: Professional Availability Windows
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = 'A3000001-1111-4111-8111-000000000003'),
            '__mj_CreatedAt',
            'Created At',
            NULL,
            'datetimeoffset',
            10,
            0,
            0,
            0,
            N'getutcdate()',
            0,
            0,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '1c1eee09-2faf-4da9-9dd4-1702b7a5c8bc' OR (EntityID = 'A3000001-1111-4111-8111-000000000003' AND Name = '__mj_UpdatedAt')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '1c1eee09-2faf-4da9-9dd4-1702b7a5c8bc',
            'A3000001-1111-4111-8111-000000000003', -- Entity: MJ_BizApps_Referrals: Professional Availability Windows
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = 'A3000001-1111-4111-8111-000000000003'),
            '__mj_UpdatedAt',
            'Updated At',
            NULL,
            'datetimeoffset',
            10,
            0,
            0,
            0,
            N'getutcdate()',
            0,
            0,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

/* SQL generated to add new permission for entity MJ_BizApps_Referrals: Professional Availability Windows for role UI */
INSERT INTO [${flyway:defaultSchema}].[EntityPermission]
                ([EntityID], [RoleID], [Type], [CanRead], [CanCreate], [CanUpdate], [CanDelete], [__mj_CreatedAt], [__mj_UpdatedAt])
              SELECT CAST('A3000001-1111-4111-8111-000000000003' AS uniqueidentifier), CAST('E0AFCCEC-6A37-EF11-86D4-000D3A4E707E' AS uniqueidentifier), 'Allow', 1, 0, 0, 0, GETUTCDATE(), GETUTCDATE()
              WHERE NOT EXISTS (
                SELECT 1 FROM [${flyway:defaultSchema}].[EntityPermission]
                WHERE [EntityID] = CAST('A3000001-1111-4111-8111-000000000003' AS uniqueidentifier) AND [RoleID] = CAST('E0AFCCEC-6A37-EF11-86D4-000D3A4E707E' AS uniqueidentifier) AND [Type] = 'Allow'
              );

/* SQL generated to add new permission for entity MJ_BizApps_Referrals: Professional Availability Windows for role Developer */
INSERT INTO [${flyway:defaultSchema}].[EntityPermission]
                ([EntityID], [RoleID], [Type], [CanRead], [CanCreate], [CanUpdate], [CanDelete], [__mj_CreatedAt], [__mj_UpdatedAt])
              SELECT CAST('A3000001-1111-4111-8111-000000000003' AS uniqueidentifier), CAST('DEAFCCEC-6A37-EF11-86D4-000D3A4E707E' AS uniqueidentifier), 'Allow', 1, 1, 1, 1, GETUTCDATE(), GETUTCDATE()
              WHERE NOT EXISTS (
                SELECT 1 FROM [${flyway:defaultSchema}].[EntityPermission]
                WHERE [EntityID] = CAST('A3000001-1111-4111-8111-000000000003' AS uniqueidentifier) AND [RoleID] = CAST('DEAFCCEC-6A37-EF11-86D4-000D3A4E707E' AS uniqueidentifier) AND [Type] = 'Allow'
              );

/* SQL generated to add new permission for entity MJ_BizApps_Referrals: Professional Availability Windows for role Integration */
INSERT INTO [${flyway:defaultSchema}].[EntityPermission]
                ([EntityID], [RoleID], [Type], [CanRead], [CanCreate], [CanUpdate], [CanDelete], [__mj_CreatedAt], [__mj_UpdatedAt])
              SELECT CAST('A3000001-1111-4111-8111-000000000003' AS uniqueidentifier), CAST('DFAFCCEC-6A37-EF11-86D4-000D3A4E707E' AS uniqueidentifier), 'Allow', 1, 1, 1, 1, GETUTCDATE(), GETUTCDATE()
              WHERE NOT EXISTS (
                SELECT 1 FROM [${flyway:defaultSchema}].[EntityPermission]
                WHERE [EntityID] = CAST('A3000001-1111-4111-8111-000000000003' AS uniqueidentifier) AND [RoleID] = CAST('DFAFCCEC-6A37-EF11-86D4-000D3A4E707E' AS uniqueidentifier) AND [Type] = 'Allow'
              );

/* SQL generated to create new entity MJ_BizApps_Referrals: Reciprocity Snapshots */
IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[Entity] WHERE [ID] = 'A3000001-1111-4111-8111-000000000004')
BEGIN
      INSERT INTO [${flyway:defaultSchema}].[Entity] (
         [ID],
         [Name],
         [DisplayName],
         [Description],
         [NameSuffix],
         [BaseTable],
         [BaseView],
         [SchemaName],
         [IncludeInAPI],
         [AllowUserSearchAPI],
         [AllowCaching],
         [TrackRecordChanges],
         [AuditRecordAccess],
         [AuditViewRuns],
         [AllowAllRowsAPI],
         [AllowCreateAPI],
         [AllowUpdateAPI],
         [AllowDeleteAPI],
         [UserViewMaxRows]
         , [__mj_CreatedAt]
         , [__mj_UpdatedAt]
      )
      VALUES (
         'A3000001-1111-4111-8111-000000000004',
         'MJ_BizApps_Referrals: Reciprocity Snapshots',
         'Reciprocity Snapshots',
         'Periodic snapshot of a ProfessionalProfile referral give/receive balance used to compute ReciprocityIndex.',
         NULL,
         'ReciprocitySnapshot',
         'vwReciprocitySnapshots',
         '__mj_BizAppsReferrals',
         1,
         0,
         0,
         1,
         0,
         0,
         0,
         1,
         1,
         1,
         1000
         , GETUTCDATE()
         , GETUTCDATE()
      );
END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = 'e4dfa1e1-6909-41c1-88b6-a54f3667a5aa' OR (EntityID = 'A3000001-1111-4111-8111-000000000004' AND Name = 'ID')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            'e4dfa1e1-6909-41c1-88b6-a54f3667a5aa',
            'A3000001-1111-4111-8111-000000000004', -- Entity: MJ_BizApps_Referrals: Reciprocity Snapshots
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = 'A3000001-1111-4111-8111-000000000004'),
            'ID',
            'ID',
            NULL,
            'uniqueidentifier',
            16,
            0,
            0,
            0,
            N'newsequentialid()',
            0,
            0,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            1,
            1,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '372de663-cb5d-445a-b5c6-4162d9bf51f2' OR (EntityID = 'A3000001-1111-4111-8111-000000000004' AND Name = 'ProfessionalProfileID')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '372de663-cb5d-445a-b5c6-4162d9bf51f2',
            'A3000001-1111-4111-8111-000000000004', -- Entity: MJ_BizApps_Referrals: Reciprocity Snapshots
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = 'A3000001-1111-4111-8111-000000000004'),
            'ProfessionalProfileID',
            'Professional Profile',
            NULL,
            'uniqueidentifier',
            16,
            0,
            0,
            0,
            NULL,
            0,
            1,
            0,
            0,
            '7492A921-FFCF-4A3E-B59A-56C88D16DDE1',
            'ID',
            0,
            0,
            1,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = 'e1bec03a-3262-4187-970b-619c2b442786' OR (EntityID = 'A3000001-1111-4111-8111-000000000004' AND Name = 'SnapshotDate')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            'e1bec03a-3262-4187-970b-619c2b442786',
            'A3000001-1111-4111-8111-000000000004', -- Entity: MJ_BizApps_Referrals: Reciprocity Snapshots
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = 'A3000001-1111-4111-8111-000000000004'),
            'SnapshotDate',
            'Snapshot Date',
            NULL,
            'datetimeoffset',
            10,
            0,
            0,
            0,
            N'sysdatetimeoffset()',
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = 'b14487be-27c3-4aac-8b2b-8b4f869687aa' OR (EntityID = 'A3000001-1111-4111-8111-000000000004' AND Name = 'PeriodStartDate')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            'b14487be-27c3-4aac-8b2b-8b4f869687aa',
            'A3000001-1111-4111-8111-000000000004', -- Entity: MJ_BizApps_Referrals: Reciprocity Snapshots
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = 'A3000001-1111-4111-8111-000000000004'),
            'PeriodStartDate',
            'Period Start Date',
            NULL,
            'datetimeoffset',
            10,
            0,
            0,
            0,
            NULL,
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '2ff9f9e2-93ec-4c6e-9075-196090283872' OR (EntityID = 'A3000001-1111-4111-8111-000000000004' AND Name = 'PeriodEndDate')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '2ff9f9e2-93ec-4c6e-9075-196090283872',
            'A3000001-1111-4111-8111-000000000004', -- Entity: MJ_BizApps_Referrals: Reciprocity Snapshots
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = 'A3000001-1111-4111-8111-000000000004'),
            'PeriodEndDate',
            'Period End Date',
            NULL,
            'datetimeoffset',
            10,
            0,
            0,
            0,
            NULL,
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '6d797779-919d-48a7-9f7f-944945df4c0c' OR (EntityID = 'A3000001-1111-4111-8111-000000000004' AND Name = 'ReferralsGivenCount')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '6d797779-919d-48a7-9f7f-944945df4c0c',
            'A3000001-1111-4111-8111-000000000004', -- Entity: MJ_BizApps_Referrals: Reciprocity Snapshots
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = 'A3000001-1111-4111-8111-000000000004'),
            'ReferralsGivenCount',
            'Referrals Given Count',
            NULL,
            'int',
            4,
            0,
            0,
            0,
            N'0',
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '277b7fa9-599e-499e-844e-3836593c8765' OR (EntityID = 'A3000001-1111-4111-8111-000000000004' AND Name = 'ReferralsReceivedCount')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '277b7fa9-599e-499e-844e-3836593c8765',
            'A3000001-1111-4111-8111-000000000004', -- Entity: MJ_BizApps_Referrals: Reciprocity Snapshots
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = 'A3000001-1111-4111-8111-000000000004'),
            'ReferralsReceivedCount',
            'Referrals Received Count',
            NULL,
            'int',
            4,
            0,
            0,
            0,
            N'0',
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = 'fcc171c3-0090-46d9-9cf0-cc9687ca87d7' OR (EntityID = 'A3000001-1111-4111-8111-000000000004' AND Name = 'ReciprocityIndex')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            'fcc171c3-0090-46d9-9cf0-cc9687ca87d7',
            'A3000001-1111-4111-8111-000000000004', -- Entity: MJ_BizApps_Referrals: Reciprocity Snapshots
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = 'A3000001-1111-4111-8111-000000000004'),
            'ReciprocityIndex',
            'Reciprocity Index',
            NULL,
            'decimal',
            9,
            5,
            2,
            0,
            N'0.00',
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '2d74dff1-3ea8-4c61-a42d-dc5597394f91' OR (EntityID = 'A3000001-1111-4111-8111-000000000004' AND Name = '__mj_CreatedAt')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '2d74dff1-3ea8-4c61-a42d-dc5597394f91',
            'A3000001-1111-4111-8111-000000000004', -- Entity: MJ_BizApps_Referrals: Reciprocity Snapshots
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = 'A3000001-1111-4111-8111-000000000004'),
            '__mj_CreatedAt',
            'Created At',
            NULL,
            'datetimeoffset',
            10,
            0,
            0,
            0,
            N'getutcdate()',
            0,
            0,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '6310f3e7-115c-4e66-a130-9c2f6a08044a' OR (EntityID = 'A3000001-1111-4111-8111-000000000004' AND Name = '__mj_UpdatedAt')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '6310f3e7-115c-4e66-a130-9c2f6a08044a',
            'A3000001-1111-4111-8111-000000000004', -- Entity: MJ_BizApps_Referrals: Reciprocity Snapshots
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = 'A3000001-1111-4111-8111-000000000004'),
            '__mj_UpdatedAt',
            'Updated At',
            NULL,
            'datetimeoffset',
            10,
            0,
            0,
            0,
            N'getutcdate()',
            0,
            0,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

/* SQL generated to add new permission for entity MJ_BizApps_Referrals: Reciprocity Snapshots for role UI */
INSERT INTO [${flyway:defaultSchema}].[EntityPermission]
                ([EntityID], [RoleID], [Type], [CanRead], [CanCreate], [CanUpdate], [CanDelete], [__mj_CreatedAt], [__mj_UpdatedAt])
              SELECT CAST('A3000001-1111-4111-8111-000000000004' AS uniqueidentifier), CAST('E0AFCCEC-6A37-EF11-86D4-000D3A4E707E' AS uniqueidentifier), 'Allow', 1, 0, 0, 0, GETUTCDATE(), GETUTCDATE()
              WHERE NOT EXISTS (
                SELECT 1 FROM [${flyway:defaultSchema}].[EntityPermission]
                WHERE [EntityID] = CAST('A3000001-1111-4111-8111-000000000004' AS uniqueidentifier) AND [RoleID] = CAST('E0AFCCEC-6A37-EF11-86D4-000D3A4E707E' AS uniqueidentifier) AND [Type] = 'Allow'
              );

/* SQL generated to add new permission for entity MJ_BizApps_Referrals: Reciprocity Snapshots for role Developer */
INSERT INTO [${flyway:defaultSchema}].[EntityPermission]
                ([EntityID], [RoleID], [Type], [CanRead], [CanCreate], [CanUpdate], [CanDelete], [__mj_CreatedAt], [__mj_UpdatedAt])
              SELECT CAST('A3000001-1111-4111-8111-000000000004' AS uniqueidentifier), CAST('DEAFCCEC-6A37-EF11-86D4-000D3A4E707E' AS uniqueidentifier), 'Allow', 1, 1, 1, 1, GETUTCDATE(), GETUTCDATE()
              WHERE NOT EXISTS (
                SELECT 1 FROM [${flyway:defaultSchema}].[EntityPermission]
                WHERE [EntityID] = CAST('A3000001-1111-4111-8111-000000000004' AS uniqueidentifier) AND [RoleID] = CAST('DEAFCCEC-6A37-EF11-86D4-000D3A4E707E' AS uniqueidentifier) AND [Type] = 'Allow'
              );

/* SQL generated to add new permission for entity MJ_BizApps_Referrals: Reciprocity Snapshots for role Integration */
INSERT INTO [${flyway:defaultSchema}].[EntityPermission]
                ([EntityID], [RoleID], [Type], [CanRead], [CanCreate], [CanUpdate], [CanDelete], [__mj_CreatedAt], [__mj_UpdatedAt])
              SELECT CAST('A3000001-1111-4111-8111-000000000004' AS uniqueidentifier), CAST('DFAFCCEC-6A37-EF11-86D4-000D3A4E707E' AS uniqueidentifier), 'Allow', 1, 1, 1, 1, GETUTCDATE(), GETUTCDATE()
              WHERE NOT EXISTS (
                SELECT 1 FROM [${flyway:defaultSchema}].[EntityPermission]
                WHERE [EntityID] = CAST('A3000001-1111-4111-8111-000000000004' AS uniqueidentifier) AND [RoleID] = CAST('DFAFCCEC-6A37-EF11-86D4-000D3A4E707E' AS uniqueidentifier) AND [Type] = 'Allow'
              );


/* Additive EntityField metadata for Wave 3 Slice 1 schema changes on existing entities */

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = 'cfd12a61-eb66-481a-9a3d-3914795960b9' OR (EntityID = '48BAF761-CB15-47B8-BE87-C6D1B54F25F6' AND Name = 'EscalationWarningPercent')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            'cfd12a61-eb66-481a-9a3d-3914795960b9',
            '48BAF761-CB15-47B8-BE87-C6D1B54F25F6', -- Entity: MJ_BizApps_Referrals: Referral Tiers
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = '48BAF761-CB15-47B8-BE87-C6D1B54F25F6'),
            'EscalationWarningPercent',
            'Escalation Warning Percent',
            NULL,
            'int',
            4,
            0,
            0,
            0,
            N'75',
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = 'a2ee6b61-984f-494c-8e6b-5e85564a7de8' OR (EntityID = '48BAF761-CB15-47B8-BE87-C6D1B54F25F6' AND Name = 'MaxEscalationLevel')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            'a2ee6b61-984f-494c-8e6b-5e85564a7de8',
            '48BAF761-CB15-47B8-BE87-C6D1B54F25F6', -- Entity: MJ_BizApps_Referrals: Referral Tiers
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = '48BAF761-CB15-47B8-BE87-C6D1B54F25F6'),
            'MaxEscalationLevel',
            'Max Escalation Level',
            NULL,
            'int',
            4,
            0,
            0,
            0,
            N'3',
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = 'bc453166-a5fa-482c-8033-94bd6aec6eee' OR (EntityID = '48BAF761-CB15-47B8-BE87-C6D1B54F25F6' AND Name = 'UrgentSLAMultiplier')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            'bc453166-a5fa-482c-8033-94bd6aec6eee',
            '48BAF761-CB15-47B8-BE87-C6D1B54F25F6', -- Entity: MJ_BizApps_Referrals: Referral Tiers
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = '48BAF761-CB15-47B8-BE87-C6D1B54F25F6'),
            'UrgentSLAMultiplier',
            'Urgent SLA Multiplier',
            NULL,
            'decimal',
            9,
            4,
            2,
            0,
            N'0.50',
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '73afa172-c775-4842-9d8c-18b692d84f9d' OR (EntityID = '48BAF761-CB15-47B8-BE87-C6D1B54F25F6' AND Name = 'EscalationActionType')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '73afa172-c775-4842-9d8c-18b692d84f9d',
            '48BAF761-CB15-47B8-BE87-C6D1B54F25F6', -- Entity: MJ_BizApps_Referrals: Referral Tiers
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = '48BAF761-CB15-47B8-BE87-C6D1B54F25F6'),
            'EscalationActionType',
            'Escalation Action Type',
            NULL,
            'nvarchar',
            60,
            0,
            0,
            0,
            N'Notify',
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = 'b2e89257-885d-430d-8b33-6384a5bb8c62' OR (EntityID = 'C1CEBBE7-15E6-4134-B303-96F38D585F65' AND Name = 'SourceChannel')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            'b2e89257-885d-430d-8b33-6384a5bb8c62',
            'C1CEBBE7-15E6-4134-B303-96F38D585F65', -- Entity: MJ_BizApps_Referrals: Referral Requests
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = 'C1CEBBE7-15E6-4134-B303-96F38D585F65'),
            'SourceChannel',
            'Source Channel',
            NULL,
            'nvarchar',
            60,
            0,
            0,
            0,
            N'Web',
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = 'f1185550-333f-4ce0-bea3-315543dd5fa7' OR (EntityID = 'C1CEBBE7-15E6-4134-B303-96F38D585F65' AND Name = 'ReferringProfessionalID')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            'f1185550-333f-4ce0-bea3-315543dd5fa7',
            'C1CEBBE7-15E6-4134-B303-96F38D585F65', -- Entity: MJ_BizApps_Referrals: Referral Requests
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = 'C1CEBBE7-15E6-4134-B303-96F38D585F65'),
            'ReferringProfessionalID',
            'Referring Professional',
            NULL,
            'uniqueidentifier',
            16,
            0,
            0,
            1,
            NULL,
            0,
            1,
            0,
            0,
            '7492A921-FFCF-4A3E-B59A-56C88D16DDE1',
            'ID',
            0,
            0,
            1,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = 'c769835d-8add-48c1-8665-7ab683d20b9f' OR (EntityID = 'C1CEBBE7-15E6-4134-B303-96F38D585F65' AND Name = 'EscalationLevel')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            'c769835d-8add-48c1-8665-7ab683d20b9f',
            'C1CEBBE7-15E6-4134-B303-96F38D585F65', -- Entity: MJ_BizApps_Referrals: Referral Requests
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = 'C1CEBBE7-15E6-4134-B303-96F38D585F65'),
            'EscalationLevel',
            'Escalation Level',
            NULL,
            'int',
            4,
            0,
            0,
            0,
            N'0',
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = 'd21d49da-9fc6-461f-ae35-45c8b5081c9d' OR (EntityID = 'C1CEBBE7-15E6-4134-B303-96F38D585F65' AND Name = 'LastEscalatedAt')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            'd21d49da-9fc6-461f-ae35-45c8b5081c9d',
            'C1CEBBE7-15E6-4134-B303-96F38D585F65', -- Entity: MJ_BizApps_Referrals: Referral Requests
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = 'C1CEBBE7-15E6-4134-B303-96F38D585F65'),
            'LastEscalatedAt',
            'Last Escalated At',
            NULL,
            'datetimeoffset',
            10,
            0,
            0,
            1,
            NULL,
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = 'ce3eada0-34e2-4f91-a0da-caf96870e99a' OR (EntityID = '7EB379C8-6C97-4640-B0AA-94F0874F4182' AND Name = 'SLAWarningSentAt')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            'ce3eada0-34e2-4f91-a0da-caf96870e99a',
            '7EB379C8-6C97-4640-B0AA-94F0874F4182', -- Entity: MJ_BizApps_Referrals: Referral Assignments
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = '7EB379C8-6C97-4640-B0AA-94F0874F4182'),
            'SLAWarningSentAt',
            'SLA Warning Sent At',
            NULL,
            'datetimeoffset',
            10,
            0,
            0,
            1,
            NULL,
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = 'f6a3629f-1df8-4331-982c-171cac96e659' OR (EntityID = '7EB379C8-6C97-4640-B0AA-94F0874F4182' AND Name = 'ResponseHours')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            'f6a3629f-1df8-4331-982c-171cac96e659',
            '7EB379C8-6C97-4640-B0AA-94F0874F4182', -- Entity: MJ_BizApps_Referrals: Referral Assignments
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = '7EB379C8-6C97-4640-B0AA-94F0874F4182'),
            'ResponseHours',
            'Response Hours',
            NULL,
            'decimal',
            9,
            6,
            2,
            1,
            NULL,
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '16daf1a3-db73-4be1-a154-2e9366b1f68d' OR (EntityID = '7EB379C8-6C97-4640-B0AA-94F0874F4182' AND Name = 'CompletedAt')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '16daf1a3-db73-4be1-a154-2e9366b1f68d',
            '7EB379C8-6C97-4640-B0AA-94F0874F4182', -- Entity: MJ_BizApps_Referrals: Referral Assignments
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = '7EB379C8-6C97-4640-B0AA-94F0874F4182'),
            'CompletedAt',
            'Completed At',
            NULL,
            'datetimeoffset',
            10,
            0,
            0,
            1,
            NULL,
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '7a04b0e3-4432-420f-ae27-580c395fa556' OR (EntityID = '7EB379C8-6C97-4640-B0AA-94F0874F4182' AND Name = 'AIRationaleJSON')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '7a04b0e3-4432-420f-ae27-580c395fa556',
            '7EB379C8-6C97-4640-B0AA-94F0874F4182', -- Entity: MJ_BizApps_Referrals: Referral Assignments
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = '7EB379C8-6C97-4640-B0AA-94F0874F4182'),
            'AIRationaleJSON',
            'AI Rationale JSON',
            NULL,
            'nvarchar',
            -1,
            0,
            0,
            1,
            NULL,
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = 'ec367c58-6b32-4909-a0d9-44481d731fe2' OR (EntityID = '7492A921-FFCF-4A3E-B59A-56C88D16DDE1' AND Name = 'ReadinessScore')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            'ec367c58-6b32-4909-a0d9-44481d731fe2',
            '7492A921-FFCF-4A3E-B59A-56C88D16DDE1', -- Entity: MJ_BizApps_Referrals: Professional Profiles
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = '7492A921-FFCF-4A3E-B59A-56C88D16DDE1'),
            'ReadinessScore',
            'Readiness Score',
            NULL,
            'decimal',
            9,
            5,
            2,
            0,
            N'100.00',
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = 'bb80a15c-60ee-4a3b-968a-edb7e0686cbf' OR (EntityID = '7492A921-FFCF-4A3E-B59A-56C88D16DDE1' AND Name = 'ReciprocityIndex')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            'bb80a15c-60ee-4a3b-968a-edb7e0686cbf',
            '7492A921-FFCF-4A3E-B59A-56C88D16DDE1', -- Entity: MJ_BizApps_Referrals: Professional Profiles
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = '7492A921-FFCF-4A3E-B59A-56C88D16DDE1'),
            'ReciprocityIndex',
            'Reciprocity Index',
            NULL,
            'decimal',
            9,
            5,
            2,
            1,
            NULL,
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

