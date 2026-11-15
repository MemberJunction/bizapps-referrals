-- =============================================================================
-- Idempotent Wave 3 Slice 1 Seed Data: SLA Escalation, Outcomes & Readiness
-- Safe to run multiple times (idempotent by deterministic IDs / unique keys).
-- Depends on scripts/seed-referrals-demo-data.sql having already seeded the
-- base ProfessionalProfile / PracticeArea / Jurisdiction / ReferralTier rows.
-- =============================================================================
SET NOCOUNT ON;

DECLARE @T_STD UNIQUEIDENTIFIER = (SELECT TOP 1 [ID] FROM [__mj_BizAppsReferrals].[ReferralTier] WHERE [Code] = N'STANDARD');
DECLARE @T_PRI UNIQUEIDENTIFIER = (SELECT TOP 1 [ID] FROM [__mj_BizAppsReferrals].[ReferralTier] WHERE [Code] = N'PRIORITY');
DECLARE @PA_CLOUD UNIQUEIDENTIFIER = (SELECT TOP 1 [ID] FROM [__mj_BizAppsReferrals].[PracticeArea] WHERE [Code] = N'IT_CLOUD_ARCH');
DECLARE @PA_AI UNIQUEIDENTIFIER = (SELECT TOP 1 [ID] FROM [__mj_BizAppsReferrals].[PracticeArea] WHERE [Code] = N'IT_AI_LLM');
DECLARE @PA_TAX UNIQUEIDENTIFIER = (SELECT TOP 1 [ID] FROM [__mj_BizAppsReferrals].[PracticeArea] WHERE [Code] = N'ACCT_TAX_RD');
DECLARE @J_CA UNIQUEIDENTIFIER = (SELECT TOP 1 [ID] FROM [__mj_BizAppsReferrals].[Jurisdiction] WHERE [Code] = N'US-CA');
DECLARE @J_NY UNIQUEIDENTIFIER = (SELECT TOP 1 [ID] FROM [__mj_BizAppsReferrals].[Jurisdiction] WHERE [Code] = N'US-NY');

DECLARE @Pro1 UNIQUEIDENTIFIER = (SELECT TOP 1 [ID] FROM [__mj_BizAppsReferrals].[ProfessionalProfile] WHERE [Email] = N'priya.subramanian@stratuscloud.io');
DECLARE @Pro2 UNIQUEIDENTIFIER = (SELECT TOP 1 [ID] FROM [__mj_BizAppsReferrals].[ProfessionalProfile] WHERE [Email] = N'kenji@vectorfoundry.ai');
DECLARE @Pro3 UNIQUEIDENTIFIER = (SELECT TOP 1 [ID] FROM [__mj_BizAppsReferrals].[ProfessionalProfile] WHERE [Email] = N'arthur@meridiancpas.com');

-- 1. Three fully-formed ReferralRequest + ReferralAssignment pairs covering the
--    Completed, InProgress, and Exhausted-with-escalation lifecycle states.
IF @Pro1 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM [__mj_BizAppsReferrals].[ReferralRequest] WHERE [RequestNumber] = N'REF-WAVE3-DEMO-001')
  INSERT INTO [__mj_BizAppsReferrals].[ReferralRequest]
    ([ID],[RequestNumber],[SeekerName],[SeekerEmail],[PracticeAreaID],[JurisdictionID],[ReferralTierID],[MatterTitle],[MatterSummary],[UrgencyLevel],[Status],[AssignedProfessionalID],[SourceChannel],[SubmittedAt],[AcceptedAt],[CompletedAt])
  VALUES
    ('E3000001-0000-0000-0000-000000000001', N'REF-WAVE3-DEMO-001', N'Northwind Cloud Migration', N'ops@northwind-demo.example.com', @PA_CLOUD, @J_CA, @T_STD, N'Multi-region AWS landing zone cutover', N'Need a principal cloud architect to lead a 6-week multi-region AWS landing zone cutover with FinOps guardrails.', N'Standard', N'Completed', @Pro1, N'Web', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET());

IF @Pro1 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM [__mj_BizAppsReferrals].[ReferralAssignment] WHERE [ID] = 'E3000001-0000-0000-0000-000000000002')
  INSERT INTO [__mj_BizAppsReferrals].[ReferralAssignment]
    ([ID],[ReferralRequestID],[ProfessionalProfileID],[CascadeOrder],[MatchScore],[ConflictStatus],[Status],[OfferedAt],[SLADeadlineAt],[RespondedAt],[CompletedAt],[ResponseHours])
  VALUES
    ('E3000001-0000-0000-0000-000000000002', 'E3000001-0000-0000-0000-000000000001', @Pro1, 1, 94.50, N'Cleared', N'Completed', SYSDATETIMEOFFSET(), DATEADD(HOUR, 24, SYSDATETIMEOFFSET()), SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET(), 1.20);

IF @Pro1 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM [__mj_BizAppsReferrals].[ReferralOutcome] WHERE [ID] = 'E3000001-0000-0000-0000-000000000003')
  INSERT INTO [__mj_BizAppsReferrals].[ReferralOutcome]
    ([ID],[ReferralRequestID],[ReferralAssignmentID],[ProfessionalProfileID],[OutcomeStatus],[ResponseHours],[CompletionNotes],[CompletedAt])
  VALUES
    ('E3000001-0000-0000-0000-000000000003', 'E3000001-0000-0000-0000-000000000001', 'E3000001-0000-0000-0000-000000000002', @Pro1, N'Completed', 1.20, N'Landing zone cutover delivered on schedule; client extended a 12-month FinOps retainer.', SYSDATETIMEOFFSET());

IF @Pro2 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM [__mj_BizAppsReferrals].[ReferralRequest] WHERE [RequestNumber] = N'REF-WAVE3-DEMO-002')
  INSERT INTO [__mj_BizAppsReferrals].[ReferralRequest]
    ([ID],[RequestNumber],[SeekerName],[SeekerEmail],[PracticeAreaID],[JurisdictionID],[ReferralTierID],[MatterTitle],[MatterSummary],[UrgencyLevel],[Status],[AssignedProfessionalID],[SourceChannel],[SubmittedAt],[AcceptedAt])
  VALUES
    ('E3000001-0000-0000-0000-000000000004', N'REF-WAVE3-DEMO-002', N'Aurora Robotics RAG Rollout', N'cto@aurora-robotics-demo.example.com', @PA_AI, @J_CA, @T_PRI, N'Production RAG pipeline for field service copilot', N'Urgent production RAG rollout for a field-service copilot with strict EU AI Act documentation requirements.', N'Urgent', N'InProgress', @Pro2, N'Referral', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET());

IF @Pro2 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM [__mj_BizAppsReferrals].[ReferralAssignment] WHERE [ID] = 'E3000001-0000-0000-0000-000000000005')
  INSERT INTO [__mj_BizAppsReferrals].[ReferralAssignment]
    ([ID],[ReferralRequestID],[ProfessionalProfileID],[CascadeOrder],[MatchScore],[ConflictStatus],[Status],[OfferedAt],[SLADeadlineAt],[RespondedAt],[ResponseHours])
  VALUES
    ('E3000001-0000-0000-0000-000000000005', 'E3000001-0000-0000-0000-000000000004', @Pro2, 1, 91.00, N'Cleared', N'InProgress', SYSDATETIMEOFFSET(), DATEADD(HOUR, 4, SYSDATETIMEOFFSET()), SYSDATETIMEOFFSET(), 0.90);

IF @Pro3 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM [__mj_BizAppsReferrals].[ReferralRequest] WHERE [RequestNumber] = N'REF-WAVE3-DEMO-003')
  INSERT INTO [__mj_BizAppsReferrals].[ReferralRequest]
    ([ID],[RequestNumber],[SeekerName],[SeekerEmail],[PracticeAreaID],[JurisdictionID],[ReferralTierID],[MatterTitle],[MatterSummary],[UrgencyLevel],[Status],[AssignedProfessionalID],[SourceChannel],[SubmittedAt],[EscalationLevel],[LastEscalatedAt])
  VALUES
    ('E3000001-0000-0000-0000-000000000006', N'REF-WAVE3-DEMO-003', N'Beacon Analytics R&D Study', N'finance@beacon-analytics-demo.example.com', @PA_TAX, @J_NY, @T_STD, N'Section 174 R&D credit study', N'Section 174 R&D tax credit study for a 40-person SaaS analytics company ahead of a Q1 financing round.', N'Standard', N'Routed', @Pro3, N'Email', SYSDATETIMEOFFSET(), 1, SYSDATETIMEOFFSET());

IF @Pro3 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM [__mj_BizAppsReferrals].[ReferralAssignment] WHERE [ID] = 'E3000001-0000-0000-0000-000000000007')
  INSERT INTO [__mj_BizAppsReferrals].[ReferralAssignment]
    ([ID],[ReferralRequestID],[ProfessionalProfileID],[CascadeOrder],[MatchScore],[ConflictStatus],[Status],[OfferedAt],[SLADeadlineAt],[SLAWarningSentAt])
  VALUES
    ('E3000001-0000-0000-0000-000000000007', 'E3000001-0000-0000-0000-000000000006', @Pro3, 1, 88.00, N'Cleared', N'Offered', SYSDATETIMEOFFSET(), DATEADD(HOUR, 24, SYSDATETIMEOFFSET()), SYSDATETIMEOFFSET());

-- 2. ReferralEscalation records (one SLA warning in-flight, one resolved)
IF @Pro3 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM [__mj_BizAppsReferrals].[ReferralEscalation] WHERE [ID] = 'E3000001-0000-0000-0000-000000000008')
  INSERT INTO [__mj_BizAppsReferrals].[ReferralEscalation]
    ([ID],[ReferralRequestID],[ReferralAssignmentID],[EscalationLevel],[TriggerType],[Status],[RecommendedAction],[Notes],[TriggeredAt])
  VALUES
    ('E3000001-0000-0000-0000-000000000008', 'E3000001-0000-0000-0000-000000000006', 'E3000001-0000-0000-0000-000000000007', 1, N'SLAWarning', N'Open', N'Notify', N'75% of SLA window elapsed with no response yet; coordinator notified.', SYSDATETIMEOFFSET());

IF @Pro2 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM [__mj_BizAppsReferrals].[ReferralEscalation] WHERE [ID] = 'E3000001-0000-0000-0000-000000000009')
  INSERT INTO [__mj_BizAppsReferrals].[ReferralEscalation]
    ([ID],[ReferralRequestID],[ReferralAssignmentID],[EscalationLevel],[TriggerType],[Status],[RecommendedAction],[Notes],[TriggeredAt],[AcknowledgedAt],[ResolvedAt])
  VALUES
    ('E3000001-0000-0000-0000-000000000009', 'E3000001-0000-0000-0000-000000000004', 'E3000001-0000-0000-0000-000000000005', 1, N'ManualEscalation', N'Resolved', N'AdminAlert', N'Seeker requested a status check; professional confirmed on-track delivery.', DATEADD(HOUR, -3, SYSDATETIMEOFFSET()), DATEADD(HOUR, -2, SYSDATETIMEOFFSET()), DATEADD(HOUR, -1, SYSDATETIMEOFFSET()));

-- 3. ProfessionalAvailabilityWindow records: recurring weekday hours for Pro1/Pro2,
--    plus a blackout window for Pro3.
IF @Pro1 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM [__mj_BizAppsReferrals].[ProfessionalAvailabilityWindow] WHERE [ID] = 'E3000001-0000-0000-0000-00000000000A')
  INSERT INTO [__mj_BizAppsReferrals].[ProfessionalAvailabilityWindow]
    ([ID],[ProfessionalProfileID],[WindowType],[DayOfWeek],[StartTimeMinutes],[EndTimeMinutes],[IsAvailable],[TimeZone],[Notes])
  VALUES
    ('E3000001-0000-0000-0000-00000000000A', @Pro1, N'Recurring', 1, 480, 1020, 1, N'America/Los_Angeles', N'Weekday core hours.');

IF @Pro1 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM [__mj_BizAppsReferrals].[ProfessionalAvailabilityWindow] WHERE [ID] = 'E3000001-0000-0000-0000-00000000000B')
  INSERT INTO [__mj_BizAppsReferrals].[ProfessionalAvailabilityWindow]
    ([ID],[ProfessionalProfileID],[WindowType],[DayOfWeek],[StartTimeMinutes],[EndTimeMinutes],[IsAvailable],[TimeZone],[Notes])
  VALUES
    ('E3000001-0000-0000-0000-00000000000B', @Pro1, N'Recurring', 2, 480, 1020, 1, N'America/Los_Angeles', N'Weekday core hours.');

IF @Pro2 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM [__mj_BizAppsReferrals].[ProfessionalAvailabilityWindow] WHERE [ID] = 'E3000001-0000-0000-0000-00000000000C')
  INSERT INTO [__mj_BizAppsReferrals].[ProfessionalAvailabilityWindow]
    ([ID],[ProfessionalProfileID],[WindowType],[DayOfWeek],[StartTimeMinutes],[EndTimeMinutes],[IsAvailable],[TimeZone],[Notes])
  VALUES
    ('E3000001-0000-0000-0000-00000000000C', @Pro2, N'Recurring', 3, 540, 1080, 1, N'America/Los_Angeles', N'Mid-week availability for urgent engagements.');

IF @Pro3 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM [__mj_BizAppsReferrals].[ProfessionalAvailabilityWindow] WHERE [ID] = 'E3000001-0000-0000-0000-00000000000D')
  INSERT INTO [__mj_BizAppsReferrals].[ProfessionalAvailabilityWindow]
    ([ID],[ProfessionalProfileID],[WindowType],[StartDate],[EndDate],[IsAvailable],[TimeZone],[Notes])
  VALUES
    ('E3000001-0000-0000-0000-00000000000D', @Pro3, N'Blackout', DATEADD(DAY, 10, SYSDATETIMEOFFSET()), DATEADD(DAY, 17, SYSDATETIMEOFFSET()), 0, N'America/New_York', N'Annual tax-season leave.');

-- 4. ReciprocitySnapshot records: one 30-day rolling snapshot per professional.
IF @Pro1 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM [__mj_BizAppsReferrals].[ReciprocitySnapshot] WHERE [ID] = 'E3000001-0000-0000-0000-00000000000E')
  INSERT INTO [__mj_BizAppsReferrals].[ReciprocitySnapshot]
    ([ID],[ProfessionalProfileID],[SnapshotDate],[PeriodStartDate],[PeriodEndDate],[ReferralsGivenCount],[ReferralsReceivedCount],[ReciprocityIndex])
  VALUES
    ('E3000001-0000-0000-0000-00000000000E', @Pro1, SYSDATETIMEOFFSET(), DATEADD(DAY, -30, SYSDATETIMEOFFSET()), SYSDATETIMEOFFSET(), 3, 5, 60.00);

IF @Pro2 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM [__mj_BizAppsReferrals].[ReciprocitySnapshot] WHERE [ID] = 'E3000001-0000-0000-0000-00000000000F')
  INSERT INTO [__mj_BizAppsReferrals].[ReciprocitySnapshot]
    ([ID],[ProfessionalProfileID],[SnapshotDate],[PeriodStartDate],[PeriodEndDate],[ReferralsGivenCount],[ReferralsReceivedCount],[ReciprocityIndex])
  VALUES
    ('E3000001-0000-0000-0000-00000000000F', @Pro2, SYSDATETIMEOFFSET(), DATEADD(DAY, -30, SYSDATETIMEOFFSET()), SYSDATETIMEOFFSET(), 2, 2, 100.00);

IF @Pro3 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM [__mj_BizAppsReferrals].[ReciprocitySnapshot] WHERE [ID] = 'E3000001-0000-0000-0000-000000000010')
  INSERT INTO [__mj_BizAppsReferrals].[ReciprocitySnapshot]
    ([ID],[ProfessionalProfileID],[SnapshotDate],[PeriodStartDate],[PeriodEndDate],[ReferralsGivenCount],[ReferralsReceivedCount],[ReciprocityIndex])
  VALUES
    ('E3000001-0000-0000-0000-000000000010', @Pro3, SYSDATETIMEOFFSET(), DATEADD(DAY, -30, SYSDATETIMEOFFSET()), SYSDATETIMEOFFSET(), 6, 1, 16.67);

-- 5. Update ProfessionalProfile readiness/reciprocity rollups for the 3 seeded professionals.
UPDATE [__mj_BizAppsReferrals].[ProfessionalProfile] SET [ReadinessScore] = 96.50, [ReciprocityIndex] = 60.00 WHERE [ID] = @Pro1;
UPDATE [__mj_BizAppsReferrals].[ProfessionalProfile] SET [ReadinessScore] = 88.00, [ReciprocityIndex] = 100.00 WHERE [ID] = @Pro2;
UPDATE [__mj_BizAppsReferrals].[ProfessionalProfile] SET [ReadinessScore] = 91.25, [ReciprocityIndex] = 16.67 WHERE [ID] = @Pro3;
