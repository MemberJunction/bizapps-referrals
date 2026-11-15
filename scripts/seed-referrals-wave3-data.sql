-- =============================================================================
-- Idempotent Wave 3 Slice 1 Seed Data: SLA Escalation, Outcomes & Readiness
-- Safe to run multiple times (idempotent by deterministic IDs / unique keys).
-- Depends on scripts/seed-referrals-demo-data.sql having already seeded the
-- base ProfessionalProfile / PracticeArea / Jurisdiction / ReferralTier rows.
-- Realigned to the Spec SS2.2/SS2.3 Remediation Round 2 schema/vocabulary.
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
    ('E3000001-0000-0000-0000-000000000001', N'REF-WAVE3-DEMO-001', N'Northwind Cloud Migration', N'ops@northwind-demo.example.com', @PA_CLOUD, @J_CA, @T_STD, N'Multi-region AWS landing zone cutover', N'Need a principal cloud architect to lead a 6-week multi-region AWS landing zone cutover with FinOps guardrails.', N'Standard', N'Completed', @Pro1, N'SeekerIntake', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET());

IF @Pro1 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM [__mj_BizAppsReferrals].[ReferralAssignment] WHERE [ID] = 'E3000001-0000-0000-0000-000000000002')
  INSERT INTO [__mj_BizAppsReferrals].[ReferralAssignment]
    ([ID],[ReferralRequestID],[ProfessionalProfileID],[CascadeOrder],[MatchScore],[ConflictStatus],[Status],[OfferedAt],[SLADeadlineAt],[RespondedAt],[CompletedAt],[ResponseHours])
  VALUES
    ('E3000001-0000-0000-0000-000000000002', 'E3000001-0000-0000-0000-000000000001', @Pro1, 1, 94.50, N'Cleared', N'Completed', SYSDATETIMEOFFSET(), DATEADD(HOUR, 24, SYSDATETIMEOFFSET()), SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET(), 1.20);

IF @Pro1 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM [__mj_BizAppsReferrals].[ReferralOutcome] WHERE [ID] = 'E3000001-0000-0000-0000-000000000003')
  INSERT INTO [__mj_BizAppsReferrals].[ReferralOutcome]
    ([ID],[ReferralRequestID],[ReferralAssignmentID],[ProfessionalProfileID],[OutcomeStatus],[EngagedAt],[ClosedAt],[EstimatedFeeAmount],[ReportedFeeAmount],[CurrencyCode],[ReportedByType],[AttributionNotes])
  VALUES
    ('E3000001-0000-0000-0000-000000000003', 'E3000001-0000-0000-0000-000000000001', 'E3000001-0000-0000-0000-000000000002', @Pro1, N'Resolved', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET(), 48000.00, 52000.00, N'USD', N'Professional', N'Landing zone cutover delivered on schedule; client extended a 12-month FinOps retainer.');

IF @Pro2 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM [__mj_BizAppsReferrals].[ReferralRequest] WHERE [RequestNumber] = N'REF-WAVE3-DEMO-002')
  INSERT INTO [__mj_BizAppsReferrals].[ReferralRequest]
    ([ID],[RequestNumber],[SeekerName],[SeekerEmail],[PracticeAreaID],[JurisdictionID],[ReferralTierID],[MatterTitle],[MatterSummary],[UrgencyLevel],[Status],[AssignedProfessionalID],[SourceChannel],[SubmittedAt],[AcceptedAt])
  VALUES
    ('E3000001-0000-0000-0000-000000000004', N'REF-WAVE3-DEMO-002', N'Aurora Robotics RAG Rollout', N'cto@aurora-robotics-demo.example.com', @PA_AI, @J_CA, @T_PRI, N'Production RAG pipeline for field service copilot', N'Urgent production RAG rollout for a field-service copilot with strict EU AI Act documentation requirements.', N'Urgent', N'InProgress', @Pro2, N'ProReferral', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET());

IF @Pro2 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM [__mj_BizAppsReferrals].[ReferralAssignment] WHERE [ID] = 'E3000001-0000-0000-0000-000000000005')
  INSERT INTO [__mj_BizAppsReferrals].[ReferralAssignment]
    ([ID],[ReferralRequestID],[ProfessionalProfileID],[CascadeOrder],[MatchScore],[ConflictStatus],[Status],[OfferedAt],[SLADeadlineAt],[RespondedAt],[ResponseHours])
  VALUES
    ('E3000001-0000-0000-0000-000000000005', 'E3000001-0000-0000-0000-000000000004', @Pro2, 1, 91.00, N'Cleared', N'InProgress', SYSDATETIMEOFFSET(), DATEADD(HOUR, 4, SYSDATETIMEOFFSET()), SYSDATETIMEOFFSET(), 0.90);

IF @Pro3 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM [__mj_BizAppsReferrals].[ReferralRequest] WHERE [RequestNumber] = N'REF-WAVE3-DEMO-003')
  INSERT INTO [__mj_BizAppsReferrals].[ReferralRequest]
    ([ID],[RequestNumber],[SeekerName],[SeekerEmail],[PracticeAreaID],[JurisdictionID],[ReferralTierID],[MatterTitle],[MatterSummary],[UrgencyLevel],[Status],[AssignedProfessionalID],[SourceChannel],[SubmittedAt],[EscalationLevel],[LastEscalatedAt])
  VALUES
    ('E3000001-0000-0000-0000-000000000006', N'REF-WAVE3-DEMO-003', N'Beacon Analytics R&D Study', N'finance@beacon-analytics-demo.example.com', @PA_TAX, @J_NY, @T_STD, N'Section 174 R&D credit study', N'Section 174 R&D tax credit study for a 40-person SaaS analytics company ahead of a Q1 financing round.', N'Standard', N'Routed', @Pro3, N'Concierge', SYSDATETIMEOFFSET(), 1, SYSDATETIMEOFFSET());

IF @Pro3 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM [__mj_BizAppsReferrals].[ReferralAssignment] WHERE [ID] = 'E3000001-0000-0000-0000-000000000007')
  INSERT INTO [__mj_BizAppsReferrals].[ReferralAssignment]
    ([ID],[ReferralRequestID],[ProfessionalProfileID],[CascadeOrder],[MatchScore],[ConflictStatus],[Status],[OfferedAt],[SLADeadlineAt],[SLAWarningSentAt])
  VALUES
    ('E3000001-0000-0000-0000-000000000007', 'E3000001-0000-0000-0000-000000000006', @Pro3, 1, 88.00, N'Cleared', N'Offered', SYSDATETIMEOFFSET(), DATEADD(HOUR, 24, SYSDATETIMEOFFSET()), SYSDATETIMEOFFSET());

-- 2. ReferralEscalation records (one SLA warning in-flight, one resolved).
IF @Pro3 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM [__mj_BizAppsReferrals].[ReferralEscalation] WHERE [ID] = 'E3000001-0000-0000-0000-000000000008')
  INSERT INTO [__mj_BizAppsReferrals].[ReferralEscalation]
    ([ID],[ReferralRequestID],[ReferralAssignmentID],[EscalationLevel],[TriggerType],[Status],[DedupKey],[RecommendedAction],[Notes],[RaisedAt])
  VALUES
    ('E3000001-0000-0000-0000-000000000008', 'E3000001-0000-0000-0000-000000000006', 'E3000001-0000-0000-0000-000000000007', 1, N'SLAWarning', N'Open', N'SEED:SLAWARN:E3000001-0000-0000-0000-000000000008', N'ExtendSLA', N'75% of SLA window elapsed with no response yet; coordinator notified.', SYSDATETIMEOFFSET());

IF @Pro2 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM [__mj_BizAppsReferrals].[ReferralEscalation] WHERE [ID] = 'E3000001-0000-0000-0000-000000000009')
  INSERT INTO [__mj_BizAppsReferrals].[ReferralEscalation]
    ([ID],[ReferralRequestID],[ReferralAssignmentID],[EscalationLevel],[TriggerType],[Status],[DedupKey],[RecommendedAction],[Notes],[RaisedAt],[AcknowledgedAt],[ResolvedAt])
  VALUES
    ('E3000001-0000-0000-0000-000000000009', 'E3000001-0000-0000-0000-000000000004', 'E3000001-0000-0000-0000-000000000005', 1, N'Manual', N'Resolved', N'SEED:MANUAL:E3000001-0000-0000-0000-000000000009', N'ContactSeeker', N'Seeker requested a status check; professional confirmed on-track delivery.', DATEADD(HOUR, -3, SYSDATETIMEOFFSET()), DATEADD(HOUR, -2, SYSDATETIMEOFFSET()), DATEADD(HOUR, -1, SYSDATETIMEOFFSET()));

-- 3. ProfessionalAvailabilityWindow records (Spec SS2.2/SS2.3: StartsAt/EndsAt NOT
--    NULL, CapacityOverride/Reason/IsActive only). >=12 rows across all 3 WindowType
--    values and multiple professionals.
DECLARE @Win TABLE (Seq INT, ProID UNIQUEIDENTIFIER, WindowType NVARCHAR(40), DaysFromNowStart INT, DaysFromNowEnd INT, CapacityOverride INT NULL, Reason NVARCHAR(500));
INSERT INTO @Win VALUES
(1, @Pro1, N'ReducedCapacity', 0, 14, 2, N'Reduced capacity during a concurrent internal audit engagement.'),
(2, @Pro1, N'Paused', 30, 33, NULL, N'Short pause for a conference.'),
(3, @Pro2, N'OnLeave', 45, 52, NULL, N'Planned leave.'),
(4, @Pro3, N'OnLeave', 10, 17, NULL, N'Annual tax-season leave.'),
(5, @Pro1, N'OnLeave', 60, 65, NULL, N'Family travel.'),
(6, @Pro2, N'ReducedCapacity', 5, 20, 1, N'Reduced capacity while onboarding a junior associate.'),
(7, @Pro2, N'Paused', 25, 26, NULL, N'Single-day administrative pause.'),
(8, @Pro3, N'ReducedCapacity', 2, 9, 3, N'Reduced capacity during tax-season peak filing week.'),
(9, @Pro1, N'Paused', 70, 72, NULL, N'Short conference pause.'),
(10, @Pro3, N'Paused', 35, 36, NULL, N'Single-day CLE commitment.'),
(11, @Pro2, N'OnLeave', 80, 87, NULL, N'Planned sabbatical week.'),
(12, @Pro3, N'ReducedCapacity', 40, 55, 2, N'Reduced capacity while serving on a bar association committee.');

INSERT INTO [__mj_BizAppsReferrals].[ProfessionalAvailabilityWindow] ([ID],[ProfessionalProfileID],[WindowType],[StartsAt],[EndsAt],[CapacityOverride],[Reason],[IsActive])
SELECT
  CAST('E3000001-0000-0000-0000-00000000' + RIGHT('00' + CAST(9 + w.Seq AS VARCHAR(2)), 2) + '0' AS UNIQUEIDENTIFIER),
  w.ProID, w.WindowType, DATEADD(DAY, w.DaysFromNowStart, SYSDATETIMEOFFSET()), DATEADD(DAY, w.DaysFromNowEnd, SYSDATETIMEOFFSET()), w.CapacityOverride, w.Reason, 1
FROM @Win w
WHERE w.ProID IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM [__mj_BizAppsReferrals].[ProfessionalAvailabilityWindow] existing
    WHERE existing.[ID] = CAST('E3000001-0000-0000-0000-00000000' + RIGHT('00' + CAST(9 + w.Seq AS VARCHAR(2)), 2) + '0' AS UNIQUEIDENTIFIER)
  );

-- 4. ReciprocitySnapshot records: one per professional for the current canonical quarter.
IF @Pro1 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM [__mj_BizAppsReferrals].[ReciprocitySnapshot] WHERE [ID] = 'E3000001-0000-0000-0000-00000000000E')
  INSERT INTO [__mj_BizAppsReferrals].[ReciprocitySnapshot]
    ([ID],[ProfessionalProfileID],[ComputedAt],[PeriodStart],[PeriodEnd],[ReferralsSent],[ReferralsReceived],[ReferralsAccepted],[ReferralsResolved],[ReciprocityIndex])
  VALUES
    ('E3000001-0000-0000-0000-00000000000E', @Pro1, SYSDATETIMEOFFSET(), '2026-07-01', '2026-09-30', 3, 5, 4, 2, 0.667);

IF @Pro2 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM [__mj_BizAppsReferrals].[ReciprocitySnapshot] WHERE [ID] = 'E3000001-0000-0000-0000-00000000000F')
  INSERT INTO [__mj_BizAppsReferrals].[ReciprocitySnapshot]
    ([ID],[ProfessionalProfileID],[ComputedAt],[PeriodStart],[PeriodEnd],[ReferralsSent],[ReferralsReceived],[ReferralsAccepted],[ReferralsResolved],[ReciprocityIndex])
  VALUES
    ('E3000001-0000-0000-0000-00000000000F', @Pro2, SYSDATETIMEOFFSET(), '2026-07-01', '2026-09-30', 2, 2, 2, 2, 1.000);

IF @Pro3 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM [__mj_BizAppsReferrals].[ReciprocitySnapshot] WHERE [ID] = 'E3000001-0000-0000-0000-000000000010')
  INSERT INTO [__mj_BizAppsReferrals].[ReciprocitySnapshot]
    ([ID],[ProfessionalProfileID],[ComputedAt],[PeriodStart],[PeriodEnd],[ReferralsSent],[ReferralsReceived],[ReferralsAccepted],[ReferralsResolved],[ReciprocityIndex])
  VALUES
    ('E3000001-0000-0000-0000-000000000010', @Pro3, SYSDATETIMEOFFSET(), '2026-07-01', '2026-09-30', 6, 1, 1, 1, 0.167);

-- 5. Update ProfessionalProfile readiness/reciprocity rollups for the 3 seeded professionals.
UPDATE [__mj_BizAppsReferrals].[ProfessionalProfile] SET [ReadinessScore] = 96.50, [ReciprocityIndex] = 0.667 WHERE [ID] = @Pro1;
UPDATE [__mj_BizAppsReferrals].[ProfessionalProfile] SET [ReadinessScore] = 88.00, [ReciprocityIndex] = 1.000 WHERE [ID] = @Pro2;
UPDATE [__mj_BizAppsReferrals].[ProfessionalProfile] SET [ReadinessScore] = 91.25, [ReciprocityIndex] = 0.167 WHERE [ID] = @Pro3;

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
    ('E3000002-0000-0000-0000-000000000001', N'REF-WAVE3-S2-A', N'Cascadia Rail Signaling Upgrade', N'ops@cascadia-rail-demo.example.com', @PA_CLOUD, @J_CA, @T_STD, N'Legacy SCADA cloud migration', N'Multi-site SCADA-to-cloud migration for regional rail signaling; two prior cascade candidates both declined on capacity.', N'Standard', N'Exhausted', NULL, N'SeekerIntake', DATEADD(DAY, -6, SYSDATETIMEOFFSET()), 2, DATEADD(HOUR, -2, SYSDATETIMEOFFSET()));

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
    ('E3000002-0000-0000-0000-000000000002', N'REF-WAVE3-S2-B', N'Harrow Biotech Cold-Chain Audit', N'ops@harrow-biotech-demo.example.com', @PA_AI, @J_CA, @T_PRI, N'Cold-chain IoT anomaly detection model audit', N'Independent audit of a cold-chain IoT anomaly-detection model ahead of an FDA pre-submission meeting.', N'Standard', N'Routed', NULL, N'ProReferral', DATEADD(DAY, -2, SYSDATETIMEOFFSET()));

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
    ('E3000002-0000-0000-0000-000000000003', N'REF-WAVE3-S2-C', N'Solace Grid Outage Forensics', N'ops@solace-grid-demo.example.com', @PA_AI, @J_CA, @T_PRI, N'Urgent outage root-cause ML triage', N'Urgent post-incident forensic review of an ML-based grid outage triage model following a 6-hour regional outage.', N'Urgent', N'Routed', NULL, N'Concierge', DATEADD(HOUR, -9, SYSDATETIMEOFFSET()));

IF NOT EXISTS (SELECT 1 FROM [__mj_BizAppsReferrals].[ReferralAssignment] WHERE [ID] = 'F3000002-0000-0000-0000-000000000003')
  INSERT INTO [__mj_BizAppsReferrals].[ReferralAssignment]
    ([ID],[ReferralRequestID],[ProfessionalProfileID],[CascadeOrder],[MatchScore],[ConflictStatus],[Status],[OfferedAt],[SLADeadlineAt],[AIRationaleJSON])
  SELECT
    'F3000002-0000-0000-0000-000000000003', 'E3000002-0000-0000-0000-000000000003', p.[ID], 1, 90.80, N'Cleared', N'Offered',
    DATEADD(HOUR, -9, SYSDATETIMEOFFSET()), DATEADD(HOUR, 3, SYSDATETIMEOFFSET()),
    N'{"decision":"urgent_unassigned_risk","hoursOpen":9.0,"urgentSlaMultiplier":2.0,"reason":"Urgent request approaching 2x SLA window without acceptance."}'
  FROM [__mj_BizAppsReferrals].[ProfessionalProfile] p WHERE p.[ID] = @Pro3;

-- 6b. 10 pro-to-pro ReferralRequest rows (ReferringProfessionalID set) covering all
--     5 SourceChannel values, satisfying the AC-37 "pro-to-pro requests" density target.
DECLARE @ProReq TABLE (Seq INT, ReferrerID UNIQUEIDENTIFIER, SourceChannel NVARCHAR(30), PAID UNIQUEIDENTIFIER, JID UNIQUEIDENTIFIER, TID UNIQUEIDENTIFIER, Title NVARCHAR(200));
INSERT INTO @ProReq VALUES
(1, @Pro1, N'ProReferral', @PA_AI, @J_CA, @T_STD, N'Pro-to-pro: AI model governance second opinion'),
(2, @Pro2, N'ProReferral', @PA_TAX, @J_NY, @T_STD, N'Pro-to-pro: R&D credit methodology peer review'),
(3, @Pro3, N'ProReferral', @PA_CLOUD, @J_CA, @T_PRI, N'Pro-to-pro: multi-cloud DR architecture review'),
(4, @Pro1, N'SeekerIntake', @PA_TAX, @J_NY, @T_STD, N'Seeker-direct: year-end close support'),
(5, @Pro2, N'FinderWidget', @PA_CLOUD, @J_CA, @T_STD, N'Finder widget: landing-zone cost review'),
(6, @Pro3, N'Concierge', @PA_AI, @J_CA, @T_PRI, N'Concierge: urgent model audit referral'),
(7, @Pro1, N'OperatorManual', @PA_CLOUD, @J_CA, @T_STD, N'Operator manual entry: legacy migration triage'),
(8, @Pro2, N'ProReferral', @PA_AI, @J_CA, @T_PRI, N'Pro-to-pro: LLM evaluation harness consult'),
(9, @Pro3, N'ProReferral', @PA_TAX, @J_NY, @T_STD, N'Pro-to-pro: multi-state nexus study'),
(10, @Pro1, N'ProReferral', @PA_CLOUD, @J_CA, @T_PRI, N'Pro-to-pro: zero-trust network redesign');

INSERT INTO [__mj_BizAppsReferrals].[ReferralRequest]
  ([ID],[RequestNumber],[SeekerName],[SeekerEmail],[PracticeAreaID],[JurisdictionID],[ReferralTierID],[MatterTitle],[MatterSummary],[UrgencyLevel],[Status],[ReferringProfessionalID],[SourceChannel],[SubmittedAt])
SELECT
  CAST('E3000003-0000-0000-0000-0000000000' + RIGHT('0' + CAST(pr.Seq AS VARCHAR(2)), 2) AS UNIQUEIDENTIFIER),
  N'REF-WAVE3-P2P-' + CAST(pr.Seq AS VARCHAR(2)),
  N'Pro-to-Pro Referral Seeker ' + CAST(pr.Seq AS VARCHAR(2)),
  N'seeker' + CAST(pr.Seq AS VARCHAR(2)) + N'@wave3-p2p-demo.example.com',
  pr.PAID, pr.JID, pr.TID, pr.Title, pr.Title + N' (seed fixture).', N'Standard', N'Routed', pr.ReferrerID, pr.SourceChannel, DATEADD(DAY, -pr.Seq, SYSDATETIMEOFFSET())
FROM @ProReq pr
WHERE pr.ReferrerID IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM [__mj_BizAppsReferrals].[ReferralRequest] existing
    WHERE existing.[ID] = CAST('E3000003-0000-0000-0000-0000000000' + RIGHT('0' + CAST(pr.Seq AS VARCHAR(2)), 2) AS UNIQUEIDENTIFIER)
  );

-- 7. 14 additional ReferralEscalation rows spanning all 6 TriggerType values, all 4
--    Status values, and EscalationLevel 1-3 (combined with the 2 Slice 1 rows above,
--    this yields 16 total). 3 of these (synthetic A/B/C above) carry a linked
--    ReferralAssignment with AIRationaleJSON populated.
DECLARE @Esc TABLE (
  Seq INT, ID UNIQUEIDENTIFIER, ReqID UNIQUEIDENTIFIER, AssignID UNIQUEIDENTIFIER NULL,
  Level INT, TriggerType NVARCHAR(30), Status NVARCHAR(40), RecommendedAction NVARCHAR(40),
  Notes NVARCHAR(MAX), DedupKey NVARCHAR(200), HoursAgoTriggered INT,
  HoursAgoAcknowledged INT NULL, HoursAgoResolved INT NULL, ResolutionNotes NVARCHAR(MAX) NULL
);

INSERT INTO @Esc VALUES
(1, 'E3000002-0000-0000-0000-000000000011', 'E2000001-0000-0000-0000-000000000110', 'F2000001-0000-0000-0000-000000000112', 1, N'SLAWarning', N'Open', N'ExtendSLA', N'75% of SLA window elapsed on the SAP integration lead review; no response yet.', N'SLAWARN:F2000001-0000-0000-0000-000000000112', 2, NULL, NULL, NULL),
(2, 'E3000002-0000-0000-0000-000000000012', 'E2000001-0000-0000-0000-000000000114', 'F2000001-0000-0000-0000-000000000116', 1, N'SLAWarning', N'Dismissed', N'ExtendSLA', N'SLA warning fired while professional confirmation was in flight by phone.', N'SLAWARN:F2000001-0000-0000-0000-000000000116', 20, 19, 18, N'False positive; professional had already accepted by phone before the system recorded the response.'),
(3, 'E3000002-0000-0000-0000-000000000013', 'E2000001-0000-0000-0000-000000000119', 'F2000001-0000-0000-0000-000000000119', 2, N'SLABreach', N'Open', N'ReassignNextCandidate', N'First cascade step exceeded its SLA window without a response during the holiday week.', N'SLABREACH:F2000001-0000-0000-0000-000000000119', 16, NULL, NULL, NULL),
(4, 'E3000002-0000-0000-0000-000000000014', 'E2000001-0000-0000-0000-000000000106', 'F2000001-0000-0000-0000-000000000107', 2, N'SLABreach', N'Acknowledged', N'ReassignNextCandidate', N'Step 2 cascade candidate approaching SLA breach on the Azure private-endpoint engagement.', N'SLABREACH:F2000001-0000-0000-0000-000000000107', 4, 3, NULL, NULL),
(5, 'E3000002-0000-0000-0000-000000000015', 'E2000001-0000-0000-0000-000000000113', 'F2000001-0000-0000-0000-000000000115', 1, N'Manual', N'Open', N'ContactSeeker', N'Seeker requested a manual status check on the FHIR R4 telehealth audit.', N'MANUAL:E2000001-0000-0000-0000-000000000113:1', 1, NULL, NULL, NULL),
(6, 'E3000002-0000-0000-0000-000000000016', 'E2000001-0000-0000-0000-000000000109', 'F2000001-0000-0000-0000-000000000111', 2, N'Manual', N'Resolved', N'ContactSeeker', N'Coordinator flagged for a manual compliance check on the FCA model-risk governance engagement.', N'MANUAL:E2000001-0000-0000-0000-000000000109:2', 14, 13, 12, N'Confirmed engagement is on-track; no compliance gap found.'),
(7, 'E3000002-0000-0000-0000-000000000017', 'E2000001-0000-0000-0000-000000000117', NULL, 2, N'CascadeExhausted', N'Open', N'ExpandPracticeArea', N'All matched Snowflake/Kafka specialists are at MaxConcurrentReferrals capacity.', N'CAPACITY:E2000001-0000-0000-0000-000000000117', 3, NULL, NULL, NULL),
(8, 'E3000002-0000-0000-0000-000000000018', 'E2000001-0000-0000-0000-000000000118', NULL, 3, N'CascadeExhausted', N'Acknowledged', N'CloseAsExhausted', N'No supply-chain security specialists available at the Standard tier; considering tier escalation.', N'CAPACITY:E2000001-0000-0000-0000-000000000118', 6, 5, NULL, NULL),
(9, 'E3000002-0000-0000-0000-000000000019', 'E2000001-0000-0000-0000-000000000121', NULL, 1, N'AIRecommended', N'Dismissed', N'ContactSeeker', N'Conflict screening flagged a potential adverse-party overlap moments before the seeker cancelled the request.', N'CONFLICT:E2000001-0000-0000-0000-000000000121', 40, 39, 39, N'Request was cancelled by the seeker; no further conflict action needed.'),
(10, 'E3000002-0000-0000-0000-00000000001A', 'E2000001-0000-0000-0000-000000000119', 'F2000001-0000-0000-0000-000000000121', 3, N'CascadeExhausted', N'Resolved', N'ExpandPracticeArea', N'Final cascade step (3 of 3) expired with no acceptance; all practice-area candidates exhausted.', N'CASCADE:E2000001-0000-0000-0000-000000000119', 16, 15, 2, N'Reopened with an expanded parent-practice-area match; new candidate accepted the referral.'),
(11, 'E3000002-0000-0000-0000-00000000001B', 'E3000002-0000-0000-0000-000000000001', 'F3000002-0000-0000-0000-000000000001', 2, N'CascadeExhausted', N'Open', N'ExpandPracticeArea', N'Both cascade candidates for the SCADA cloud migration declined on capacity.', N'CASCADE:F3000002-0000-0000-0000-000000000001', 2, NULL, NULL, NULL),
(12, 'E3000002-0000-0000-0000-00000000001C', 'E3000002-0000-0000-0000-000000000002', 'F3000002-0000-0000-0000-000000000002', 1, N'SLABreach', N'Acknowledged', N'ReassignNextCandidate', N'Cold-chain IoT audit assignment expired 6.5 hours past its 24h SLA window.', N'SLABREACH:F3000002-0000-0000-0000-000000000002', 6, 5, NULL, NULL),
(13, 'E3000002-0000-0000-0000-00000000001D', 'E3000002-0000-0000-0000-000000000003', 'F3000002-0000-0000-0000-000000000003', 3, N'UrgentUnassigned', N'Resolved', N'CloseAsExhausted', N'Urgent grid-outage forensic review approaching 2x its SLA window without acceptance.', N'URGENT:F3000002-0000-0000-0000-000000000003', 9, 8, 1, N'Coordinator manually matched an available senior professional outside the automated cascade.'),
(14, 'E3000002-0000-0000-0000-00000000001E', 'E2000001-0000-0000-0000-000000000121', NULL, 1, N'UrgentUnassigned', N'Open', N'ContactSeeker', N'Urgent ransomware tabletop request left unassigned after cancellation review.', N'URGENT:E2000001-0000-0000-0000-000000000121', 1, NULL, NULL, NULL);

INSERT INTO [__mj_BizAppsReferrals].[ReferralEscalation]
  ([ID],[ReferralRequestID],[ReferralAssignmentID],[EscalationLevel],[TriggerType],[Status],[RecommendedAction],[Notes],[DedupKey],[RaisedAt],[AcknowledgedAt],[ResolvedAt],[ResolutionNotes])
SELECT
  e.ID, e.ReqID, e.AssignID, e.Level, e.TriggerType, e.Status, e.RecommendedAction, e.Notes, e.DedupKey,
  DATEADD(HOUR, -e.HoursAgoTriggered, SYSDATETIMEOFFSET()),
  CASE WHEN e.HoursAgoAcknowledged IS NOT NULL THEN DATEADD(HOUR, -e.HoursAgoAcknowledged, SYSDATETIMEOFFSET()) ELSE NULL END,
  CASE WHEN e.HoursAgoResolved IS NOT NULL THEN DATEADD(HOUR, -e.HoursAgoResolved, SYSDATETIMEOFFSET()) ELSE NULL END,
  e.ResolutionNotes
FROM @Esc e
WHERE NOT EXISTS (SELECT 1 FROM [__mj_BizAppsReferrals].[ReferralEscalation] existing WHERE existing.[ID] = e.ID);

-- 8. 20 ReferralOutcome rows spanning all 5 OutcomeStatus values across the 3
--    seeded practice-area domains and completed assignments from the base demo seed.
DECLARE @Out TABLE (Seq INT, AssignID UNIQUEIDENTIFIER, ReqID UNIQUEIDENTIFIER, ProID UNIQUEIDENTIFIER, Status NVARCHAR(60), EstFee DECIMAL(12,2), RepFee DECIMAL(12,2), ReportedByType NVARCHAR(20));
INSERT INTO @Out VALUES
(1, 'F2000001-0000-0000-0000-000000000101', 'E2000001-0000-0000-0000-000000000101', NULL, N'Resolved', 12000.00, 12500.00, N'Professional'),
(2, 'F2000001-0000-0000-0000-000000000103', 'E2000001-0000-0000-0000-000000000103', NULL, N'Engaged', 8000.00, NULL, N'Professional'),
(3, 'F2000001-0000-0000-0000-000000000105', 'E2000001-0000-0000-0000-000000000105', NULL, N'Withdrawn', NULL, NULL, N'Seeker'),
(4, 'F2000001-0000-0000-0000-000000000108', 'E2000001-0000-0000-0000-000000000108', NULL, N'NoEngagement', NULL, NULL, N'Operator'),
(5, 'F2000001-0000-0000-0000-000000000110', 'E2000001-0000-0000-0000-000000000110', NULL, N'Lost', 5000.00, NULL, N'Operator'),
(6, 'F2000001-0000-0000-0000-000000000102', 'E2000001-0000-0000-0000-000000000102', NULL, N'Resolved', 15000.00, 15800.00, N'Professional'),
(7, 'F2000001-0000-0000-0000-000000000104', 'E2000001-0000-0000-0000-000000000104', NULL, N'Engaged', 9500.00, NULL, N'Professional'),
(8, 'F2000001-0000-0000-0000-000000000106', 'E2000001-0000-0000-0000-000000000106', NULL, N'Resolved', 22000.00, 21000.00, N'Professional'),
(9, 'F2000001-0000-0000-0000-000000000111', 'E2000001-0000-0000-0000-000000000109', NULL, N'Withdrawn', NULL, NULL, N'Seeker'),
(10, 'F2000001-0000-0000-0000-000000000113', 'E2000001-0000-0000-0000-000000000112', NULL, N'NoEngagement', NULL, NULL, N'Operator'),
(11, 'F2000001-0000-0000-0000-000000000115', 'E2000001-0000-0000-0000-000000000113', NULL, N'Lost', 3000.00, NULL, N'Operator'),
(12, 'F2000001-0000-0000-0000-000000000116', 'E2000001-0000-0000-0000-000000000114', NULL, N'Resolved', 18000.00, 18750.00, N'Professional'),
(13, 'F2000001-0000-0000-0000-000000000120', 'E2000001-0000-0000-0000-000000000120', NULL, N'Engaged', 7000.00, NULL, N'Professional'),
(14, 'F2000001-0000-0000-0000-000000000122', 'E2000001-0000-0000-0000-000000000122', NULL, N'Resolved', 26000.00, 25500.00, N'Professional'),
(15, 'F2000001-0000-0000-0000-000000000107', 'E2000001-0000-0000-0000-000000000107', NULL, N'Withdrawn', NULL, NULL, N'Seeker'),
(16, 'F2000001-0000-0000-0000-000000000117', 'E2000001-0000-0000-0000-000000000117', NULL, N'NoEngagement', NULL, NULL, N'Operator'),
(17, 'F2000001-0000-0000-0000-000000000112', 'E2000001-0000-0000-0000-000000000110', NULL, N'Engaged', 6200.00, NULL, N'Professional'),
(18, 'F2000001-0000-0000-0000-000000000118', 'E2000001-0000-0000-0000-000000000118', NULL, N'Resolved', 31000.00, 30200.00, N'Professional'),
(19, 'F2000001-0000-0000-0000-000000000114', 'E2000001-0000-0000-0000-000000000111', NULL, N'Lost', 4100.00, NULL, N'Operator'),
(20, 'F2000001-0000-0000-0000-000000000119', 'E2000001-0000-0000-0000-000000000119', NULL, N'Resolved', 19500.00, 20000.00, N'Professional');

INSERT INTO [__mj_BizAppsReferrals].[ReferralOutcome] ([ID],[ReferralRequestID],[ReferralAssignmentID],[ProfessionalProfileID],[OutcomeStatus],[EngagedAt],[ClosedAt],[EstimatedFeeAmount],[ReportedFeeAmount],[CurrencyCode],[ReportedByType],[AttributionNotes])
SELECT
  CAST('E3000004-0000-0000-0000-0000000000' + RIGHT('0' + CAST(o.Seq AS VARCHAR(2)), 2) AS UNIQUEIDENTIFIER),
  a.[ReferralRequestID], a.[ID], a.[ProfessionalProfileID], o.Status,
  CASE WHEN o.Status IN (N'Engaged', N'Resolved') THEN DATEADD(DAY, -o.Seq, SYSDATETIMEOFFSET()) ELSE NULL END,
  CASE WHEN o.Status IN (N'Resolved', N'Withdrawn', N'NoEngagement', N'Lost') THEN SYSDATETIMEOFFSET() ELSE NULL END,
  o.EstFee, o.RepFee, N'USD', o.ReportedByType,
  N'Seed fixture outcome #' + CAST(o.Seq AS VARCHAR(2)) + N' (' + o.Status + N').'
FROM @Out o
INNER JOIN [__mj_BizAppsReferrals].[ReferralAssignment] a ON a.[ID] = o.AssignID
WHERE NOT EXISTS (SELECT 1 FROM [__mj_BizAppsReferrals].[ReferralOutcome] ro WHERE ro.[ReferralRequestID] = a.[ReferralRequestID])
  AND NOT EXISTS (
    SELECT 1 FROM [__mj_BizAppsReferrals].[ReferralOutcome] existing
    WHERE existing.[ID] = CAST('E3000004-0000-0000-0000-0000000000' + RIGHT('0' + CAST(o.Seq AS VARCHAR(2)), 2) AS UNIQUEIDENTIFIER)
  );

-- 9. 36 ReciprocitySnapshot rows: 18 seeded professionals (D2000001-...-0101 through
--    -0118 from scripts/seed-referrals-demo-data.sql) x the 2 canonical calendar
--    quarters 2026-04-01..2026-06-30 and 2026-07-01..2026-09-30.
DECLARE @Q1Start DATE = '2026-04-01';
DECLARE @Q1End DATE = '2026-06-30';
DECLARE @Q2Start DATE = '2026-07-01';
DECLARE @Q2End DATE = '2026-09-30';

DECLARE @Snap TABLE (
  ProSeq INT, PeriodTag TINYINT, SentCount INT, ReceivedCount INT, AcceptedCount INT,
  ResolvedCount INT, SLABreachCount INT, MedianResponseHours DECIMAL(8,2), AttributedFeeTotal DECIMAL(14,2)
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
  ([ID],[ProfessionalProfileID],[ComputedAt],[PeriodStart],[PeriodEnd],[ReferralsSent],[ReferralsReceived],[ReferralsAccepted],[ReferralsResolved],[SLABreachCount],[AcceptanceRate],[MedianResponseHours],[AttributedFeeTotal],[ReciprocityIndex])
SELECT
  NEWID(),
  pid.ID,
  SYSDATETIMEOFFSET(),
  CASE WHEN s.PeriodTag = 1 THEN @Q1Start ELSE @Q2Start END,
  CASE WHEN s.PeriodTag = 1 THEN @Q1End ELSE @Q2End END,
  s.SentCount,
  s.ReceivedCount,
  s.AcceptedCount,
  s.ResolvedCount,
  s.SLABreachCount,
  CASE WHEN s.ReceivedCount > 0 THEN ROUND(CAST(s.AcceptedCount AS DECIMAL(5,2)) / s.ReceivedCount, 4) ELSE 0 END,
  s.MedianResponseHours,
  s.AttributedFeeTotal,
  CAST(ROUND((s.SentCount + 1.0) / (s.AcceptedCount + 1.0), 3) AS DECIMAL(6,3))
FROM @Snap s
CROSS APPLY (
  SELECT CAST('D2000001-0000-0000-0000-000000000' + RIGHT('000' + CAST(100 + s.ProSeq AS VARCHAR(3)), 3) AS UNIQUEIDENTIFIER) AS ID
) pid
WHERE EXISTS (SELECT 1 FROM [__mj_BizAppsReferrals].[ProfessionalProfile] pp WHERE pp.[ID] = pid.ID)
  AND NOT EXISTS (
    SELECT 1 FROM [__mj_BizAppsReferrals].[ReciprocitySnapshot] rs
    WHERE rs.[ProfessionalProfileID] = pid.ID
      AND rs.[PeriodStart] = CASE WHEN s.PeriodTag = 1 THEN @Q1Start ELSE @Q2Start END
      AND rs.[PeriodEnd] = CASE WHEN s.PeriodTag = 1 THEN @Q1End ELSE @Q2End END
  );
