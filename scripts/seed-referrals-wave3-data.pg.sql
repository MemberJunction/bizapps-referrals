-- ============================================================================
-- Idempotent Wave 3 Slice 1 Seed Data (PostgreSQL): SLA Escalation, Outcomes & Readiness
-- Safe to run multiple times (idempotent by deterministic IDs / unique keys).
-- Depends on the base ProfessionalProfile / PracticeArea / Jurisdiction /
-- ReferralTier taxonomy already being present in __mj_BizAppsReferrals.
-- ============================================================================
SET search_path TO __mj_BizAppsReferrals, public;

DO $$
DECLARE
    v_t_std UUID;
    v_t_pri UUID;
    v_pa_cloud UUID;
    v_pa_ai UUID;
    v_pa_tax UUID;
    v_j_ca UUID;
    v_j_ny UUID;
    v_pro1 UUID;
    v_pro2 UUID;
    v_pro3 UUID;
BEGIN
    SELECT "ID" INTO v_t_std FROM __mj_BizAppsReferrals."ReferralTier" WHERE "Code" = 'STANDARD' LIMIT 1;
    SELECT "ID" INTO v_t_pri FROM __mj_BizAppsReferrals."ReferralTier" WHERE "Code" = 'PRIORITY' LIMIT 1;
    SELECT "ID" INTO v_pa_cloud FROM __mj_BizAppsReferrals."PracticeArea" WHERE "Code" = 'IT_CLOUD_ARCH' LIMIT 1;
    SELECT "ID" INTO v_pa_ai FROM __mj_BizAppsReferrals."PracticeArea" WHERE "Code" = 'IT_AI_LLM' LIMIT 1;
    SELECT "ID" INTO v_pa_tax FROM __mj_BizAppsReferrals."PracticeArea" WHERE "Code" = 'ACCT_TAX_RD' LIMIT 1;
    SELECT "ID" INTO v_j_ca FROM __mj_BizAppsReferrals."Jurisdiction" WHERE "Code" = 'US-CA' LIMIT 1;
    SELECT "ID" INTO v_j_ny FROM __mj_BizAppsReferrals."Jurisdiction" WHERE "Code" = 'US-NY' LIMIT 1;

    SELECT "ID" INTO v_pro1 FROM __mj_BizAppsReferrals."ProfessionalProfile" WHERE "Email" = 'priya.subramanian@stratuscloud.io' LIMIT 1;
    SELECT "ID" INTO v_pro2 FROM __mj_BizAppsReferrals."ProfessionalProfile" WHERE "Email" = 'kenji@vectorfoundry.ai' LIMIT 1;
    SELECT "ID" INTO v_pro3 FROM __mj_BizAppsReferrals."ProfessionalProfile" WHERE "Email" = 'arthur@meridiancpas.com' LIMIT 1;

    -- 1. Three ReferralRequest + ReferralAssignment pairs covering Completed, InProgress, Routed+escalated.
    IF v_pro1 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM __mj_BizAppsReferrals."ReferralRequest" WHERE "RequestNumber" = 'REF-WAVE3-DEMO-001') THEN
        INSERT INTO __mj_BizAppsReferrals."ReferralRequest"
            ("ID","RequestNumber","SeekerName","SeekerEmail","PracticeAreaID","JurisdictionID","ReferralTierID","MatterTitle","MatterSummary","UrgencyLevel","Status","AssignedProfessionalID","SourceChannel","SubmittedAt","AcceptedAt","CompletedAt")
        VALUES
            ('e3000001-0000-0000-0000-000000000001', 'REF-WAVE3-DEMO-001', 'Northwind Cloud Migration', 'ops@northwind-demo.example.com', v_pa_cloud, v_j_ca, v_t_std, 'Multi-region AWS landing zone cutover', 'Need a principal cloud architect to lead a 6-week multi-region AWS landing zone cutover with FinOps guardrails.', 'Standard', 'Completed', v_pro1, 'Web', NOW(), NOW(), NOW());
    END IF;

    IF v_pro1 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM __mj_BizAppsReferrals."ReferralAssignment" WHERE "ID" = 'e3000001-0000-0000-0000-000000000002') THEN
        INSERT INTO __mj_BizAppsReferrals."ReferralAssignment"
            ("ID","ReferralRequestID","ProfessionalProfileID","CascadeOrder","MatchScore","ConflictStatus","Status","OfferedAt","SLADeadlineAt","RespondedAt","CompletedAt","ResponseHours")
        VALUES
            ('e3000001-0000-0000-0000-000000000002', 'e3000001-0000-0000-0000-000000000001', v_pro1, 1, 94.50, 'Cleared', 'Completed', NOW(), NOW() + INTERVAL '24 hours', NOW(), NOW(), 1.20);
    END IF;

    IF v_pro1 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM __mj_BizAppsReferrals."ReferralOutcome" WHERE "ID" = 'e3000001-0000-0000-0000-000000000003') THEN
        INSERT INTO __mj_BizAppsReferrals."ReferralOutcome"
            ("ID","ReferralRequestID","ReferralAssignmentID","ProfessionalProfileID","OutcomeStatus","ResponseHours","CompletionNotes","CompletedAt")
        VALUES
            ('e3000001-0000-0000-0000-000000000003', 'e3000001-0000-0000-0000-000000000001', 'e3000001-0000-0000-0000-000000000002', v_pro1, 'Completed', 1.20, 'Landing zone cutover delivered on schedule; client extended a 12-month FinOps retainer.', NOW());
    END IF;

    IF v_pro2 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM __mj_BizAppsReferrals."ReferralRequest" WHERE "RequestNumber" = 'REF-WAVE3-DEMO-002') THEN
        INSERT INTO __mj_BizAppsReferrals."ReferralRequest"
            ("ID","RequestNumber","SeekerName","SeekerEmail","PracticeAreaID","JurisdictionID","ReferralTierID","MatterTitle","MatterSummary","UrgencyLevel","Status","AssignedProfessionalID","SourceChannel","SubmittedAt","AcceptedAt")
        VALUES
            ('e3000001-0000-0000-0000-000000000004', 'REF-WAVE3-DEMO-002', 'Aurora Robotics RAG Rollout', 'cto@aurora-robotics-demo.example.com', v_pa_ai, v_j_ca, v_t_pri, 'Production RAG pipeline for field service copilot', 'Urgent production RAG rollout for a field-service copilot with strict EU AI Act documentation requirements.', 'Urgent', 'InProgress', v_pro2, 'Referral', NOW(), NOW());
    END IF;

    IF v_pro2 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM __mj_BizAppsReferrals."ReferralAssignment" WHERE "ID" = 'e3000001-0000-0000-0000-000000000005') THEN
        INSERT INTO __mj_BizAppsReferrals."ReferralAssignment"
            ("ID","ReferralRequestID","ProfessionalProfileID","CascadeOrder","MatchScore","ConflictStatus","Status","OfferedAt","SLADeadlineAt","RespondedAt","ResponseHours")
        VALUES
            ('e3000001-0000-0000-0000-000000000005', 'e3000001-0000-0000-0000-000000000004', v_pro2, 1, 91.00, 'Cleared', 'InProgress', NOW(), NOW() + INTERVAL '4 hours', NOW(), 0.90);
    END IF;

    IF v_pro3 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM __mj_BizAppsReferrals."ReferralRequest" WHERE "RequestNumber" = 'REF-WAVE3-DEMO-003') THEN
        INSERT INTO __mj_BizAppsReferrals."ReferralRequest"
            ("ID","RequestNumber","SeekerName","SeekerEmail","PracticeAreaID","JurisdictionID","ReferralTierID","MatterTitle","MatterSummary","UrgencyLevel","Status","AssignedProfessionalID","SourceChannel","SubmittedAt","EscalationLevel","LastEscalatedAt")
        VALUES
            ('e3000001-0000-0000-0000-000000000006', 'REF-WAVE3-DEMO-003', 'Beacon Analytics R&D Study', 'finance@beacon-analytics-demo.example.com', v_pa_tax, v_j_ny, v_t_std, 'Section 174 R&D credit study', 'Section 174 R&D tax credit study for a 40-person SaaS analytics company ahead of a Q1 financing round.', 'Standard', 'Routed', v_pro3, 'Email', NOW(), 1, NOW());
    END IF;

    IF v_pro3 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM __mj_BizAppsReferrals."ReferralAssignment" WHERE "ID" = 'e3000001-0000-0000-0000-000000000007') THEN
        INSERT INTO __mj_BizAppsReferrals."ReferralAssignment"
            ("ID","ReferralRequestID","ProfessionalProfileID","CascadeOrder","MatchScore","ConflictStatus","Status","OfferedAt","SLADeadlineAt","SLAWarningSentAt")
        VALUES
            ('e3000001-0000-0000-0000-000000000007', 'e3000001-0000-0000-0000-000000000006', v_pro3, 1, 88.00, 'Cleared', 'Offered', NOW(), NOW() + INTERVAL '24 hours', NOW());
    END IF;

    -- 2. ReferralEscalation records (one open SLA warning, one resolved manual escalation).
    IF v_pro3 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM __mj_BizAppsReferrals."ReferralEscalation" WHERE "ID" = 'e3000001-0000-0000-0000-000000000008') THEN
        INSERT INTO __mj_BizAppsReferrals."ReferralEscalation"
            ("ID","ReferralRequestID","ReferralAssignmentID","EscalationLevel","TriggerType","Status","RecommendedAction","Notes","TriggeredAt")
        VALUES
            ('e3000001-0000-0000-0000-000000000008', 'e3000001-0000-0000-0000-000000000006', 'e3000001-0000-0000-0000-000000000007', 1, 'SLAWarning', 'Open', 'Notify', '75% of SLA window elapsed with no response yet; coordinator notified.', NOW());
    END IF;

    IF v_pro2 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM __mj_BizAppsReferrals."ReferralEscalation" WHERE "ID" = 'e3000001-0000-0000-0000-000000000009') THEN
        INSERT INTO __mj_BizAppsReferrals."ReferralEscalation"
            ("ID","ReferralRequestID","ReferralAssignmentID","EscalationLevel","TriggerType","Status","RecommendedAction","Notes","TriggeredAt","AcknowledgedAt","ResolvedAt")
        VALUES
            ('e3000001-0000-0000-0000-000000000009', 'e3000001-0000-0000-0000-000000000004', 'e3000001-0000-0000-0000-000000000005', 1, 'ManualEscalation', 'Resolved', 'AdminAlert', 'Seeker requested a status check; professional confirmed on-track delivery.', NOW() - INTERVAL '3 hours', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 hour');
    END IF;

    -- 3. ProfessionalAvailabilityWindow records.
    IF v_pro1 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM __mj_BizAppsReferrals."ProfessionalAvailabilityWindow" WHERE "ID" = 'e3000001-0000-0000-0000-00000000000a') THEN
        INSERT INTO __mj_BizAppsReferrals."ProfessionalAvailabilityWindow"
            ("ID","ProfessionalProfileID","WindowType","DayOfWeek","StartTimeMinutes","EndTimeMinutes","IsAvailable","TimeZone","Notes")
        VALUES
            ('e3000001-0000-0000-0000-00000000000a', v_pro1, 'Recurring', 1, 480, 1020, TRUE, 'America/Los_Angeles', 'Weekday core hours.');
    END IF;

    IF v_pro1 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM __mj_BizAppsReferrals."ProfessionalAvailabilityWindow" WHERE "ID" = 'e3000001-0000-0000-0000-00000000000b') THEN
        INSERT INTO __mj_BizAppsReferrals."ProfessionalAvailabilityWindow"
            ("ID","ProfessionalProfileID","WindowType","DayOfWeek","StartTimeMinutes","EndTimeMinutes","IsAvailable","TimeZone","Notes")
        VALUES
            ('e3000001-0000-0000-0000-00000000000b', v_pro1, 'Recurring', 2, 480, 1020, TRUE, 'America/Los_Angeles', 'Weekday core hours.');
    END IF;

    IF v_pro2 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM __mj_BizAppsReferrals."ProfessionalAvailabilityWindow" WHERE "ID" = 'e3000001-0000-0000-0000-00000000000c') THEN
        INSERT INTO __mj_BizAppsReferrals."ProfessionalAvailabilityWindow"
            ("ID","ProfessionalProfileID","WindowType","DayOfWeek","StartTimeMinutes","EndTimeMinutes","IsAvailable","TimeZone","Notes")
        VALUES
            ('e3000001-0000-0000-0000-00000000000c', v_pro2, 'Recurring', 3, 540, 1080, TRUE, 'America/Los_Angeles', 'Mid-week availability for urgent engagements.');
    END IF;

    IF v_pro3 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM __mj_BizAppsReferrals."ProfessionalAvailabilityWindow" WHERE "ID" = 'e3000001-0000-0000-0000-00000000000d') THEN
        INSERT INTO __mj_BizAppsReferrals."ProfessionalAvailabilityWindow"
            ("ID","ProfessionalProfileID","WindowType","StartDate","EndDate","IsAvailable","TimeZone","Notes")
        VALUES
            ('e3000001-0000-0000-0000-00000000000d', v_pro3, 'Blackout', NOW() + INTERVAL '10 days', NOW() + INTERVAL '17 days', FALSE, 'America/New_York', 'Annual tax-season leave.');
    END IF;

    -- 4. ReciprocitySnapshot records.
    IF v_pro1 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM __mj_BizAppsReferrals."ReciprocitySnapshot" WHERE "ID" = 'e3000001-0000-0000-0000-00000000000e') THEN
        INSERT INTO __mj_BizAppsReferrals."ReciprocitySnapshot"
            ("ID","ProfessionalProfileID","SnapshotDate","PeriodStartDate","PeriodEndDate","ReferralsGivenCount","ReferralsReceivedCount","ReciprocityIndex")
        VALUES
            ('e3000001-0000-0000-0000-00000000000e', v_pro1, NOW(), NOW() - INTERVAL '30 days', NOW(), 3, 5, 60.00);
    END IF;

    IF v_pro2 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM __mj_BizAppsReferrals."ReciprocitySnapshot" WHERE "ID" = 'e3000001-0000-0000-0000-00000000000f') THEN
        INSERT INTO __mj_BizAppsReferrals."ReciprocitySnapshot"
            ("ID","ProfessionalProfileID","SnapshotDate","PeriodStartDate","PeriodEndDate","ReferralsGivenCount","ReferralsReceivedCount","ReciprocityIndex")
        VALUES
            ('e3000001-0000-0000-0000-00000000000f', v_pro2, NOW(), NOW() - INTERVAL '30 days', NOW(), 2, 2, 100.00);
    END IF;

    IF v_pro3 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM __mj_BizAppsReferrals."ReciprocitySnapshot" WHERE "ID" = 'e3000001-0000-0000-0000-000000000010') THEN
        INSERT INTO __mj_BizAppsReferrals."ReciprocitySnapshot"
            ("ID","ProfessionalProfileID","SnapshotDate","PeriodStartDate","PeriodEndDate","ReferralsGivenCount","ReferralsReceivedCount","ReciprocityIndex")
        VALUES
            ('e3000001-0000-0000-0000-000000000010', v_pro3, NOW(), NOW() - INTERVAL '30 days', NOW(), 6, 1, 16.67);
    END IF;

    -- 5. ProfessionalProfile readiness/reciprocity rollups.
    IF v_pro1 IS NOT NULL THEN
        UPDATE __mj_BizAppsReferrals."ProfessionalProfile" SET "ReadinessScore" = 96.50, "ReciprocityIndex" = 60.00 WHERE "ID" = v_pro1;
    END IF;
    IF v_pro2 IS NOT NULL THEN
        UPDATE __mj_BizAppsReferrals."ProfessionalProfile" SET "ReadinessScore" = 88.00, "ReciprocityIndex" = 100.00 WHERE "ID" = v_pro2;
    END IF;
    IF v_pro3 IS NOT NULL THEN
        UPDATE __mj_BizAppsReferrals."ProfessionalProfile" SET "ReadinessScore" = 91.25, "ReciprocityIndex" = 16.67 WHERE "ID" = v_pro3;
    END IF;
END $$;
