-- =============================================================================
-- BizApps Referrals - Wave 3 Slice 2 Migration: Escalation Lifecycle & Reciprocity
-- Schema: __mj_BizAppsReferrals
-- Version: v1.2.1
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Additive columns on [ReferralEscalation]: dedup, notifier linkage, resolution audit
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
-- 2. Additive column on [ReferralOutcome]: attributed fee value for reciprocity scorecards
-- -----------------------------------------------------------------------------
IF COL_LENGTH(N'[__mj_BizAppsReferrals].[ReferralOutcome]', N'FeeAmount') IS NULL
BEGIN
    ALTER TABLE [__mj_BizAppsReferrals].[ReferralOutcome]
        ADD [FeeAmount] DECIMAL(10,2) NULL;
END
GO

-- -----------------------------------------------------------------------------
-- 3. Additive columns on [ReciprocitySnapshot]: full scorecard metrics
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
-- 4. Additive column on [ProfessionalProfile]: readiness computation timestamp
-- -----------------------------------------------------------------------------
IF COL_LENGTH(N'[__mj_BizAppsReferrals].[ProfessionalProfile]', N'ReadinessComputedAt') IS NULL
BEGIN
    ALTER TABLE [__mj_BizAppsReferrals].[ProfessionalProfile]
        ADD [ReadinessComputedAt] DATETIMEOFFSET NULL;
END
GO
