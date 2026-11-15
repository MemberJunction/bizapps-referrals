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
    ('E3000001-0000-0000-0000-000000000001', N'REF-WAVE3-DEMO-001', N'Northwind Cloud Migration', N'ops@northwind-demo.example.com', @PA_CLOUD, @J_CA, @T_STD, N'Multi-region AWS landing zone cutover', N'Need a principal cloud architect to lead a 6-week multi-region AWS landing zone cutover with FinOps guardrails.', N'Standard', N'Completed', @Pro1, N'SeekerPortal', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET());

IF @Pro1 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM [__mj_BizAppsReferrals].[ReferralAssignment] WHERE [ID] = 'E3000001-0000-0000-0000-000000000002')
  INSERT INTO [__mj_BizAppsReferrals].[ReferralAssignment]
    ([ID],[ReferralRequestID],[ProfessionalProfileID],[CascadeOrder],[MatchScore],[ConflictStatus],[Status],[OfferedAt],[SLADeadlineAt],[RespondedAt],[CompletedAt],[ResponseHours])
  VALUES
    ('E3000001-0000-0000-0000-000000000002', 'E3000001-0000-0000-0000-000000000001', @Pro1, 1, 94.50, N'Cleared', N'Completed', SYSDATETIMEOFFSET(), DATEADD(HOUR, 24, SYSDATETIMEOFFSET()), SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET(), 1.20);

IF @Pro1 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM [__mj_BizAppsReferrals].[ReferralOutcome] WHERE [ID] = 'E3000001-0000-0000-0000-000000000003')
  INSERT INTO [__mj_BizAppsReferrals].[ReferralOutcome]
    ([ID],[ReferralRequestID],[ReferralAssignmentID],[ProfessionalProfileID],[OutcomeStatus],[ResponseHours],[CompletionNotes],[CompletedAt])
  VALUES
    ('E3000001-0000-0000-0000-000000000003', 'E3000001-0000-0000-0000-000000000001', 'E3000001-0000-0000-0000-000000000002', @Pro1, N'Resolved', 1.20, N'Landing zone cutover delivered on schedule; client extended a 12-month FinOps retainer.', SYSDATETIMEOFFSET());

IF @Pro2 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM [__mj_BizAppsReferrals].[ReferralRequest] WHERE [RequestNumber] = N'REF-WAVE3-DEMO-002')
  INSERT INTO [__mj_BizAppsReferrals].[ReferralRequest]
    ([ID],[RequestNumber],[SeekerName],[SeekerEmail],[PracticeAreaID],[JurisdictionID],[ReferralTierID],[MatterTitle],[MatterSummary],[UrgencyLevel],[Status],[AssignedProfessionalID],[SourceChannel],[SubmittedAt],[AcceptedAt])
  VALUES
    ('E3000001-0000-0000-0000-000000000004', N'REF-WAVE3-DEMO-002', N'Aurora Robotics RAG Rollout', N'cto@aurora-robotics-demo.example.com', @PA_AI, @J_CA, @T_PRI, N'Production RAG pipeline for field service copilot', N'Urgent production RAG rollout for a field-service copilot with strict EU AI Act documentation requirements.', N'Urgent', N'InProgress', @Pro2, N'ProfessionalReferral', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET());

IF @Pro2 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM [__mj_BizAppsReferrals].[ReferralAssignment] WHERE [ID] = 'E3000001-0000-0000-0000-000000000005')
  INSERT INTO [__mj_BizAppsReferrals].[ReferralAssignment]
    ([ID],[ReferralRequestID],[ProfessionalProfileID],[CascadeOrder],[MatchScore],[ConflictStatus],[Status],[OfferedAt],[SLADeadlineAt],[RespondedAt],[ResponseHours])
  VALUES
    ('E3000001-0000-0000-0000-000000000005', 'E3000001-0000-0000-0000-000000000004', @Pro2, 1, 91.00, N'Cleared', N'InProgress', SYSDATETIMEOFFSET(), DATEADD(HOUR, 4, SYSDATETIMEOFFSET()), SYSDATETIMEOFFSET(), 0.90);

IF @Pro3 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM [__mj_BizAppsReferrals].[ReferralRequest] WHERE [RequestNumber] = N'REF-WAVE3-DEMO-003')
  INSERT INTO [__mj_BizAppsReferrals].[ReferralRequest]
    ([ID],[RequestNumber],[SeekerName],[SeekerEmail],[PracticeAreaID],[JurisdictionID],[ReferralTierID],[MatterTitle],[MatterSummary],[UrgencyLevel],[Status],[AssignedProfessionalID],[SourceChannel],[SubmittedAt],[EscalationLevel],[LastEscalatedAt])
  VALUES
    ('E3000001-0000-0000-0000-000000000006', N'REF-WAVE3-DEMO-003', N'Beacon Analytics R&D Study', N'finance@beacon-analytics-demo.example.com', @PA_TAX, @J_NY, @T_STD, N'Section 174 R&D credit study', N'Section 174 R&D tax credit study for a 40-person SaaS analytics company ahead of a Q1 financing round.', N'Standard', N'Routed', @Pro3, N'ConciergeAgent', SYSDATETIMEOFFSET(), 1, SYSDATETIMEOFFSET());

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
    ('E3000001-0000-0000-0000-000000000008', 'E3000001-0000-0000-0000-000000000006', 'E3000001-0000-0000-0000-000000000007', 1, N'SLAWarning', N'Open', N'ContactProfessional', N'75% of SLA window elapsed with no response yet; coordinator notified.', SYSDATETIMEOFFSET());

IF @Pro2 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM [__mj_BizAppsReferrals].[ReferralEscalation] WHERE [ID] = 'E3000001-0000-0000-0000-000000000009')
  INSERT INTO [__mj_BizAppsReferrals].[ReferralEscalation]
    ([ID],[ReferralRequestID],[ReferralAssignmentID],[EscalationLevel],[TriggerType],[Status],[RecommendedAction],[Notes],[TriggeredAt],[AcknowledgedAt],[ResolvedAt])
  VALUES
    ('E3000001-0000-0000-0000-000000000009', 'E3000001-0000-0000-0000-000000000004', 'E3000001-0000-0000-0000-000000000005', 1, N'ManualOverride', N'Resolved', N'ContactProfessional', N'Seeker requested a status check; professional confirmed on-track delivery.', DATEADD(HOUR, -3, SYSDATETIMEOFFSET()), DATEADD(HOUR, -2, SYSDATETIMEOFFSET()), DATEADD(HOUR, -1, SYSDATETIMEOFFSET()));

-- 3. ProfessionalAvailabilityWindow records (Spec SS2.2 vocabulary: OnLeave/
--    Paused/ReducedCapacity) covering a reduced-capacity window for Pro1, a
--    short pause for Pro2, and on-leave windows for Pro2/Pro3.
IF @Pro1 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM [__mj_BizAppsReferrals].[ProfessionalAvailabilityWindow] WHERE [ID] = 'E3000001-0000-0000-0000-00000000000A')
  INSERT INTO [__mj_BizAppsReferrals].[ProfessionalAvailabilityWindow]
    ([ID],[ProfessionalProfileID],[WindowType],[StartDate],[EndDate],[CapacityOverride],[IsAvailable],[IsActive],[TimeZone],[Notes],[Reason])
  VALUES
    ('E3000001-0000-0000-0000-00000000000A', @Pro1, N'ReducedCapacity', SYSDATETIMEOFFSET(), DATEADD(DAY, 14, SYSDATETIMEOFFSET()), 2, 1, 1, N'America/Los_Angeles', N'Reduced capacity during a concurrent internal audit engagement.', N'Internal audit engagement');

IF @Pro1 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM [__mj_BizAppsReferrals].[ProfessionalAvailabilityWindow] WHERE [ID] = 'E3000001-0000-0000-0000-00000000000B')
  INSERT INTO [__mj_BizAppsReferrals].[ProfessionalAvailabilityWindow]
    ([ID],[ProfessionalProfileID],[WindowType],[StartDate],[EndDate],[IsAvailable],[IsActive],[TimeZone],[Notes],[Reason])
  VALUES
    ('E3000001-0000-0000-0000-00000000000B', @Pro1, N'Paused', DATEADD(DAY, 30, SYSDATETIMEOFFSET()), DATEADD(DAY, 33, SYSDATETIMEOFFSET()), 0, 1, N'America/Los_Angeles', N'Short pause for a conference.', N'Conference attendance');

IF @Pro2 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM [__mj_BizAppsReferrals].[ProfessionalAvailabilityWindow] WHERE [ID] = 'E3000001-0000-0000-0000-00000000000C')
  INSERT INTO [__mj_BizAppsReferrals].[ProfessionalAvailabilityWindow]
    ([ID],[ProfessionalProfileID],[WindowType],[StartDate],[EndDate],[IsAvailable],[IsActive],[TimeZone],[Notes],[Reason])
  VALUES
    ('E3000001-0000-0000-0000-00000000000C', @Pro2, N'OnLeave', DATEADD(DAY, 45, SYSDATETIMEOFFSET()), DATEADD(DAY, 52, SYSDATETIMEOFFSET()), 0, 1, N'America/Los_Angeles', N'Planned leave.', N'Planned leave');

IF @Pro3 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM [__mj_BizAppsReferrals].[ProfessionalAvailabilityWindow] WHERE [ID] = 'E3000001-0000-0000-0000-00000000000D')
  INSERT INTO [__mj_BizAppsReferrals].[ProfessionalAvailabilityWindow]
    ([ID],[ProfessionalProfileID],[WindowType],[StartDate],[EndDate],[IsAvailable],[IsActive],[TimeZone],[Notes],[Reason])
  VALUES
    ('E3000001-0000-0000-0000-00000000000D', @Pro3, N'OnLeave', DATEADD(DAY, 10, SYSDATETIMEOFFSET()), DATEADD(DAY, 17, SYSDATETIMEOFFSET()), 0, 1, N'America/New_York', N'Annual tax-season leave.', N'Annual leave');

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

-- =============================================================================
-- Idempotent Wave 3 Slice 2 Seed Data: Escalation Lifecycle & Reciprocity Scorecard
-- Depends on scripts/seed-referrals-demo-data.sql (21 ReferralRequest / 22
-- ReferralAssignment rows with deterministic E2000001-.../F2000001-... IDs) and
-- the Slice 1 section above having already run.
-- =============================================================================

-- 6. Three new ReferralRequest + ReferralAssignment pairs dedicated to escalations
--    that carry an AI routing rationale (AIRationaleJSON lives on the assignment).
IF NOT EXISTS (SELECT 1 FROM [__mj_BizAppsReferrals].[ReferralRequest] WHERE [RequestNumber] = N'REF-WAVE3-S2-A')
  INSERT INTO [__mj_BizAppsReferrals].[ReferralRequest]
    ([ID],[RequestNumber],[SeekerName],[SeekerEmail],[PracticeAreaID],[JurisdictionID],[ReferralTierID],[MatterTitle],[MatterSummary],[UrgencyLevel],[Status],[AssignedProfessionalID],[SourceChannel],[SubmittedAt],[EscalationLevel],[LastEscalatedAt])
  VALUES
    ('E3000002-0000-0000-0000-000000000001', N'REF-WAVE3-S2-A', N'Cascadia Rail Signaling Upgrade', N'ops@cascadia-rail-demo.example.com', @PA_CLOUD, @J_CA, @T_STD, N'Legacy SCADA cloud migration', N'Multi-site SCADA-to-cloud migration for regional rail signaling; two prior cascade candidates both declined on capacity.', N'Standard', N'Exhausted', NULL, N'SeekerPortal', DATEADD(DAY, -6, SYSDATETIMEOFFSET()), 2, DATEADD(HOUR, -2, SYSDATETIMEOFFSET()));

IF NOT EXISTS (SELECT 1 FROM [__mj_BizAppsReferrals].[ReferralAssignment] WHERE [ID] = 'F3000002-0000-0000-0000-000000000001')
  INSERT INTO [__mj_BizAppsReferrals].[ReferralAssignment]
    ([ID],[ReferralRequestID],[ProfessionalProfileID],[CascadeOrder],[MatchScore],[ConflictStatus],[Status],[OfferedAt],[SLADeadlineAt],[RespondedAt],[ResponseHours],[AIRationaleJSON])
  SELECT
    'F3000002-0000-0000-0000-000000000001', 'E3000002-0000-0000-0000-000000000001', p.[ID], 2, 72.40, N'Cleared', N'Expired',
    DATEADD(HOUR, -26, SYSDATETIMEOFFSET()), DATEADD(HOUR, -2, SYSDATETIMEOFFSET()), NULL, NULL,
    N'{"decision":"cascade_exhausted","consideredCandidates":2,"reason":"No remaining eligible professionals in practice area after 2 cascade steps."}'
  FROM [__mj_BizAppsReferrals].[ProfessionalProfile] p WHERE p.[ID] = @Pro1;

IF NOT EXISTS (SELECT 1 FROM [__mj_BizAppsReferrals].[ReferralRequest] WHERE [RequestNumber] = N'REF-WAVE3-S2-B')
  INSERT INTO [__mj_BizAppsReferrals].[ReferralRequest]
    ([ID],[RequestNumber],[SeekerName],[SeekerEmail],[PracticeAreaID],[JurisdictionID],[ReferralTierID],[MatterTitle],[MatterSummary],[UrgencyLevel],[Status],[AssignedProfessionalID],[SourceChannel],[SubmittedAt])
  VALUES
    ('E3000002-0000-0000-0000-000000000002', N'REF-WAVE3-S2-B', N'Harrow Biotech Cold-Chain Audit', N'ops@harrow-biotech-demo.example.com', @PA_AI, @J_CA, @T_PRI, N'Cold-chain IoT anomaly detection model audit', N'Independent audit of a cold-chain IoT anomaly-detection model ahead of an FDA pre-submission meeting.', N'Standard', N'Routed', NULL, N'ProfessionalReferral', DATEADD(DAY, -2, SYSDATETIMEOFFSET()));

IF NOT EXISTS (SELECT 1 FROM [__mj_BizAppsReferrals].[ReferralAssignment] WHERE [ID] = 'F3000002-0000-0000-0000-000000000002')
  INSERT INTO [__mj_BizAppsReferrals].[ReferralAssignment]
    ([ID],[ReferralRequestID],[ProfessionalProfileID],[CascadeOrder],[MatchScore],[ConflictStatus],[Status],[OfferedAt],[SLADeadlineAt],[RespondedAt],[ResponseHours],[AIRationaleJSON])
  SELECT
    'F3000002-0000-0000-0000-000000000002', 'E3000002-0000-0000-0000-000000000002', p.[ID], 1, 89.10, N'Cleared', N'Expired',
    DATEADD(HOUR, -30, SYSDATETIMEOFFSET()), DATEADD(HOUR, -6, SYSDATETIMEOFFSET()), NULL, NULL,
    N'{"decision":"sla_breach_detected","elapsedHours":30.5,"slaWindowHours":24,"reason":"Professional did not respond within the 24h SLA window."}'
  FROM [__mj_BizAppsReferrals].[ProfessionalProfile] p WHERE p.[ID] = @Pro2;

IF NOT EXISTS (SELECT 1 FROM [__mj_BizAppsReferrals].[ReferralRequest] WHERE [RequestNumber] = N'REF-WAVE3-S2-C')
  INSERT INTO [__mj_BizAppsReferrals].[ReferralRequest]
    ([ID],[RequestNumber],[SeekerName],[SeekerEmail],[PracticeAreaID],[JurisdictionID],[ReferralTierID],[MatterTitle],[MatterSummary],[UrgencyLevel],[Status],[AssignedProfessionalID],[SourceChannel],[SubmittedAt])
  VALUES
    ('E3000002-0000-0000-0000-000000000003', N'REF-WAVE3-S2-C', N'Solace Grid Outage Forensics', N'ops@solace-grid-demo.example.com', @PA_AI, @J_CA, @T_PRI, N'Urgent outage root-cause ML triage', N'Urgent post-incident forensic review of an ML-based grid outage triage model following a 6-hour regional outage.', N'Urgent', N'Routed', NULL, N'ConciergeAgent', DATEADD(HOUR, -9, SYSDATETIMEOFFSET()));

IF NOT EXISTS (SELECT 1 FROM [__mj_BizAppsReferrals].[ReferralAssignment] WHERE [ID] = 'F3000002-0000-0000-0000-000000000003')
  INSERT INTO [__mj_BizAppsReferrals].[ReferralAssignment]
    ([ID],[ReferralRequestID],[ProfessionalProfileID],[CascadeOrder],[MatchScore],[ConflictStatus],[Status],[OfferedAt],[SLADeadlineAt],[AIRationaleJSON])
  SELECT
    'F3000002-0000-0000-0000-000000000003', 'E3000002-0000-0000-0000-000000000003', p.[ID], 1, 90.80, N'Cleared', N'Offered',
    DATEADD(HOUR, -9, SYSDATETIMEOFFSET()), DATEADD(HOUR, 3, SYSDATETIMEOFFSET()),
    N'{"decision":"urgent_unassigned_risk","hoursOpen":9.0,"urgentSlaMultiplier":2.0,"reason":"Urgent request approaching 2x SLA window without acceptance."}'
  FROM [__mj_BizAppsReferrals].[ProfessionalProfile] p WHERE p.[ID] = @Pro3;

-- 7. 14 additional ReferralEscalation rows spanning all 6 TriggerType values, all 4
--    Status values, and EscalationLevel 1-3 (combined with the 2 Slice 1 rows above,
--    this yields 16 total). 3 of these (synthetic A/B/C above) carry a linked
--    ReferralAssignment with AIRationaleJSON populated.
DECLARE @Esc TABLE (
  Seq INT, ID UNIQUEIDENTIFIER, ReqID UNIQUEIDENTIFIER, AssignID UNIQUEIDENTIFIER NULL,
  Level INT, TriggerType NVARCHAR(60), Status NVARCHAR(40), RecommendedAction NVARCHAR(60),
  Notes NVARCHAR(MAX), DedupKey NVARCHAR(200), HoursAgoTriggered INT,
  HoursAgoAcknowledged INT NULL, HoursAgoResolved INT NULL, ResolutionNotes NVARCHAR(MAX) NULL
);

INSERT INTO @Esc VALUES
(1, 'E3000002-0000-0000-0000-000000000011', 'E2000001-0000-0000-0000-000000000110', 'F2000001-0000-0000-0000-000000000112', 1, N'SLAWarning', N'Open', N'ContactProfessional', N'75% of SLA window elapsed on the SAP integration lead review; no response yet.', N'SLAWARN:F2000001-0000-0000-0000-000000000112', 2, NULL, NULL, NULL),
(2, 'E3000002-0000-0000-0000-000000000012', 'E2000001-0000-0000-0000-000000000114', 'F2000001-0000-0000-0000-000000000116', 1, N'SLAWarning', N'Dismissed', N'ContactProfessional', N'SLA warning fired while professional confirmation was in flight by phone.', N'SLAWARN:F2000001-0000-0000-0000-000000000116', 20, 19, 18, N'False positive; professional had already accepted by phone before the system recorded the response.'),
(3, 'E3000002-0000-0000-0000-000000000013', 'E2000001-0000-0000-0000-000000000119', 'F2000001-0000-0000-0000-000000000119', 2, N'SLABreach', N'Open', N'AdvanceCascade', N'First cascade step exceeded its SLA window without a response during the holiday week.', N'SLABREACH:F2000001-0000-0000-0000-000000000119', 16, NULL, NULL, NULL),
(4, 'E3000002-0000-0000-0000-000000000014', 'E2000001-0000-0000-0000-000000000106', 'F2000001-0000-0000-0000-000000000107', 2, N'SLABreach', N'Acknowledged', N'AdvanceCascade', N'Step 2 cascade candidate approaching SLA breach on the Azure private-endpoint engagement.', N'SLABREACH:F2000001-0000-0000-0000-000000000107', 4, 3, NULL, NULL),
(5, 'E3000002-0000-0000-0000-000000000015', 'E2000001-0000-0000-0000-000000000113', 'F2000001-0000-0000-0000-000000000115', 1, N'ManualOverride', N'Open', N'ContactProfessional', N'Seeker requested a manual status check on the FHIR R4 telehealth audit.', N'MANUAL:E2000001-0000-0000-0000-000000000113:1', 1, NULL, NULL, NULL),
(6, 'E3000002-0000-0000-0000-000000000016', 'E2000001-0000-0000-0000-000000000109', 'F2000001-0000-0000-0000-000000000111', 2, N'ManualOverride', N'Resolved', N'ContactProfessional', N'Coordinator flagged for a manual compliance check on the FCA model-risk governance engagement.', N'MANUAL:E2000001-0000-0000-0000-000000000109:2', 14, 13, 12, N'Confirmed engagement is on-track; no compliance gap found.'),
(7, 'E3000002-0000-0000-0000-000000000017', 'E2000001-0000-0000-0000-000000000117', NULL, 2, N'CascadeExhausted', N'Open', N'ExpandPracticeArea', N'All matched Snowflake/Kafka specialists are at MaxConcurrentReferrals capacity.', N'CAPACITY:E2000001-0000-0000-0000-000000000117', 3, NULL, NULL, NULL),
(8, 'E3000002-0000-0000-0000-000000000018', 'E2000001-0000-0000-0000-000000000118', NULL, 3, N'CascadeExhausted', N'Acknowledged', N'ReassignTier', N'No supply-chain security specialists available at the Standard tier; considering Priority tier escalation.', N'CAPACITY:E2000001-0000-0000-0000-000000000118', 6, 5, NULL, NULL),
(9, 'E3000002-0000-0000-0000-000000000019', 'E2000001-0000-0000-0000-000000000121', NULL, 1, N'ConflictDeadlock', N'Dismissed', N'ContactProfessional', N'Conflict screening flagged a potential adverse-party overlap moments before the seeker cancelled the request.', N'CONFLICT:E2000001-0000-0000-0000-000000000121', 40, 39, 39, N'Request was cancelled by the seeker; no further conflict action needed.'),
(10, 'E3000002-0000-0000-0000-00000000001A', 'E2000001-0000-0000-0000-000000000119', 'F2000001-0000-0000-0000-000000000121', 3, N'CascadeExhausted', N'Resolved', N'ExpandPracticeArea', N'Final cascade step (3 of 3) expired with no acceptance; all practice-area candidates exhausted.', N'CASCADE:E2000001-0000-0000-0000-000000000119', 16, 15, 2, N'Reopened with an expanded parent-practice-area match; new candidate accepted the referral.'),
(11, 'E3000002-0000-0000-0000-00000000001B', 'E3000002-0000-0000-0000-000000000001', 'F3000002-0000-0000-0000-000000000001', 2, N'CascadeExhausted', N'Open', N'ExpandPracticeArea', N'Both cascade candidates for the SCADA cloud migration declined on capacity.', N'CASCADE:F3000002-0000-0000-0000-000000000001', 2, NULL, NULL, NULL),
(12, 'E3000002-0000-0000-0000-00000000001C', 'E3000002-0000-0000-0000-000000000002', 'F3000002-0000-0000-0000-000000000002', 1, N'SLABreach', N'Acknowledged', N'AdvanceCascade', N'Cold-chain IoT audit assignment expired 6.5 hours past its 24h SLA window.', N'SLABREACH:F3000002-0000-0000-0000-000000000002', 6, 5, NULL, NULL),
(13, 'E3000002-0000-0000-0000-00000000001D', 'E3000002-0000-0000-0000-000000000003', 'F3000002-0000-0000-0000-000000000003', 3, N'UrgentUnassigned', N'Resolved', N'ReassignTier', N'Urgent grid-outage forensic review approaching 2x its SLA window without acceptance.', N'URGENT:F3000002-0000-0000-0000-000000000003', 9, 8, 1, N'Coordinator manually matched an available senior professional outside the automated cascade.'),
(14, 'E3000002-0000-0000-0000-00000000001E', 'E2000001-0000-0000-0000-000000000121', NULL, 1, N'UrgentUnassigned', N'Open', N'ContactProfessional', N'Urgent ransomware tabletop request left unassigned after cancellation review.', N'URGENT:E2000001-0000-0000-0000-000000000121', 1, NULL, NULL, NULL);

INSERT INTO [__mj_BizAppsReferrals].[ReferralEscalation]
  ([ID],[ReferralRequestID],[ReferralAssignmentID],[EscalationLevel],[TriggerType],[Status],[RecommendedAction],[Notes],[DedupKey],[TriggeredAt],[AcknowledgedAt],[ResolvedAt],[ResolutionNotes])
SELECT
  e.ID, e.ReqID, e.AssignID, e.Level, e.TriggerType, e.Status, e.RecommendedAction, e.Notes, e.DedupKey,
  DATEADD(HOUR, -e.HoursAgoTriggered, SYSDATETIMEOFFSET()),
  CASE WHEN e.HoursAgoAcknowledged IS NOT NULL THEN DATEADD(HOUR, -e.HoursAgoAcknowledged, SYSDATETIMEOFFSET()) ELSE NULL END,
  CASE WHEN e.HoursAgoResolved IS NOT NULL THEN DATEADD(HOUR, -e.HoursAgoResolved, SYSDATETIMEOFFSET()) ELSE NULL END,
  e.ResolutionNotes
FROM @Esc e
WHERE NOT EXISTS (SELECT 1 FROM [__mj_BizAppsReferrals].[ReferralEscalation] existing WHERE existing.[ID] = e.ID);

-- 8. 36 ReciprocitySnapshot rows: 18 seeded professionals (D2000001-...-0101 through
--    -0118 from scripts/seed-referrals-demo-data.sql) x the 2 calendar quarters
--    immediately preceding the current one.
DECLARE @NowUtc DATETIME2 = SYSUTCDATETIME();
DECLARE @QStart DATETIME2 = DATEADD(QUARTER, DATEDIFF(QUARTER, 0, @NowUtc), 0);
DECLARE @Q1Start DATETIMEOFFSET = TODATETIMEOFFSET(DATEADD(QUARTER, -1, @QStart), 0);
DECLARE @Q1End DATETIMEOFFSET = TODATETIMEOFFSET(@QStart, 0);
DECLARE @Q2Start DATETIMEOFFSET = TODATETIMEOFFSET(DATEADD(QUARTER, -2, @QStart), 0);
DECLARE @Q2End DATETIMEOFFSET = @Q1Start;

DECLARE @Snap TABLE (
  ProSeq INT, PeriodTag TINYINT, GivenCount INT, ReceivedCount INT, AcceptedCount INT,
  ResolvedCount INT, SLABreachCount INT, MedianResponseHours DECIMAL(6,2), AttributedFeeTotal DECIMAL(12,2)
);
INSERT INTO @Snap VALUES
(1,1,3,4,3,2,1,1.35,2715.00),(2,1,4,5,3,3,2,1.70,3130.00),(3,1,5,6,6,5,0,2.05,3545.00),(4,1,6,3,2,2,1,2.40,3960.00),
(5,1,2,4,2,1,2,2.75,4375.00),(6,1,3,5,5,5,0,1.00,4790.00),(7,1,4,6,5,4,1,1.35,5205.00),(8,1,5,3,1,1,2,1.70,5620.00),
(9,1,6,4,4,3,0,2.05,6035.00),(10,1,2,5,4,4,1,2.40,6450.00),(11,1,3,6,4,3,2,2.75,6865.00),(12,1,4,3,3,3,0,1.00,7280.00),
(13,1,5,4,3,2,1,1.35,7695.00),(14,1,6,5,3,3,2,1.70,8110.00),(15,1,2,6,6,5,0,2.05,8525.00),(16,1,3,3,2,2,1,2.40,8940.00),
(17,1,4,4,2,1,2,2.75,9355.00),(18,1,5,5,5,5,0,1.00,9770.00),
(1,2,2,3,2,1,2,1.50,1800.00),(2,2,3,4,4,3,0,1.80,2100.00),(3,2,4,5,4,3,1,2.10,2400.00),(4,2,1,6,6,5,2,2.40,2700.00),
(5,2,2,2,1,0,0,1.20,3000.00),(6,2,3,3,3,2,1,1.50,3300.00),(7,2,4,4,3,2,2,1.80,3600.00),(8,2,1,5,5,4,0,2.10,3900.00),
(9,2,2,6,5,4,1,2.40,4200.00),(10,2,3,2,2,1,2,1.20,4500.00),(11,2,4,3,2,1,0,1.50,4800.00),(12,2,1,4,4,3,1,1.80,5100.00),
(13,2,2,5,4,3,2,2.10,5400.00),(14,2,3,6,6,5,0,2.40,5700.00),(15,2,4,2,1,0,1,1.20,6000.00),(16,2,1,3,3,2,2,1.50,6300.00),
(17,2,2,4,3,2,0,1.80,6600.00),(18,2,3,5,5,4,1,2.10,6900.00);

INSERT INTO [__mj_BizAppsReferrals].[ReciprocitySnapshot]
  ([ID],[ProfessionalProfileID],[SnapshotDate],[PeriodStartDate],[PeriodEndDate],[ReferralsGivenCount],[ReferralsReceivedCount],[ReciprocityIndex],[AcceptedCount],[ResolvedCount],[SLABreachCount],[AcceptanceRate],[MedianResponseHours],[AttributedFeeTotal])
SELECT
  NEWID(),
  pid.ID,
  SYSDATETIMEOFFSET(),
  CASE WHEN s.PeriodTag = 1 THEN @Q1Start ELSE @Q2Start END,
  CASE WHEN s.PeriodTag = 1 THEN @Q1End ELSE @Q2End END,
  s.GivenCount,
  s.ReceivedCount,
  CAST(ROUND((s.GivenCount + 1.0) / (s.AcceptedCount + 1.0), 3) AS DECIMAL(8,3)),
  s.AcceptedCount,
  s.ResolvedCount,
  s.SLABreachCount,
  CASE WHEN s.ReceivedCount > 0 THEN ROUND(CAST(s.AcceptedCount AS DECIMAL(5,2)) / s.ReceivedCount, 3) ELSE 0 END,
  s.MedianResponseHours,
  s.AttributedFeeTotal
FROM @Snap s
CROSS APPLY (
  SELECT CAST('D2000001-0000-0000-0000-000000000' + RIGHT('000' + CAST(100 + s.ProSeq AS VARCHAR(3)), 3) AS UNIQUEIDENTIFIER) AS ID
) pid
WHERE EXISTS (SELECT 1 FROM [__mj_BizAppsReferrals].[ProfessionalProfile] pp WHERE pp.[ID] = pid.ID)
  AND NOT EXISTS (
    SELECT 1 FROM [__mj_BizAppsReferrals].[ReciprocitySnapshot] rs
    WHERE rs.[ProfessionalProfileID] = pid.ID
      AND rs.[PeriodStartDate] = CASE WHEN s.PeriodTag = 1 THEN @Q1Start ELSE @Q2Start END
      AND rs.[PeriodEndDate] = CASE WHEN s.PeriodTag = 1 THEN @Q1End ELSE @Q2End END
  );
