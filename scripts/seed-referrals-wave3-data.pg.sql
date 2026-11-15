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

-- ============================================================================
-- Idempotent Wave 3 Slice 2 Seed Data (PostgreSQL): Escalation Lifecycle &
-- Reciprocity Scorecard. Depends on scripts/seed-referrals-demo-data.pg.sql
-- (21 ReferralRequest / 22 ReferralAssignment rows with deterministic
-- e2000001-.../f2000001-... IDs) and the Slice 1 block above having run.
-- ============================================================================
DO $$
DECLARE
    v_pa_cloud UUID;
    v_pa_ai UUID;
    v_j_ca UUID;
    v_t_std UUID;
    v_t_pri UUID;
    v_pro1 UUID;
    v_pro2 UUID;
    v_pro3 UUID;
    v_q_start TIMESTAMPTZ;
    v_q1_start TIMESTAMPTZ;
    v_q1_end TIMESTAMPTZ;
    v_q2_start TIMESTAMPTZ;
    v_q2_end TIMESTAMPTZ;
    v_pro_id UUID;
    v_seq INT;
    v_period_tag INT;
    v_given INT;
    v_received INT;
    v_accepted INT;
    v_resolved INT;
    v_sla_breach INT;
    v_median_resp NUMERIC(6,2);
    v_fee NUMERIC(12,2);
    v_period_start TIMESTAMPTZ;
    v_period_end TIMESTAMPTZ;
BEGIN
    SELECT "ID" INTO v_pa_cloud FROM __mj_BizAppsReferrals."PracticeArea" WHERE "Code" = 'IT_CLOUD_ARCH' LIMIT 1;
    SELECT "ID" INTO v_pa_ai FROM __mj_BizAppsReferrals."PracticeArea" WHERE "Code" = 'IT_AI_LLM' LIMIT 1;
    SELECT "ID" INTO v_j_ca FROM __mj_BizAppsReferrals."Jurisdiction" WHERE "Code" = 'US-CA' LIMIT 1;
    SELECT "ID" INTO v_t_std FROM __mj_BizAppsReferrals."ReferralTier" WHERE "Code" = 'STANDARD' LIMIT 1;
    SELECT "ID" INTO v_t_pri FROM __mj_BizAppsReferrals."ReferralTier" WHERE "Code" = 'PRIORITY' LIMIT 1;
    SELECT "ID" INTO v_pro1 FROM __mj_BizAppsReferrals."ProfessionalProfile" WHERE "Email" = 'priya.subramanian@stratuscloud.io' LIMIT 1;
    SELECT "ID" INTO v_pro2 FROM __mj_BizAppsReferrals."ProfessionalProfile" WHERE "Email" = 'kenji@vectorfoundry.ai' LIMIT 1;
    SELECT "ID" INTO v_pro3 FROM __mj_BizAppsReferrals."ProfessionalProfile" WHERE "Email" = 'arthur@meridiancpas.com' LIMIT 1;

    -- 6. Three new ReferralRequest + ReferralAssignment pairs dedicated to
    --    escalations that carry an AI routing rationale.
    IF NOT EXISTS (SELECT 1 FROM __mj_BizAppsReferrals."ReferralRequest" WHERE "RequestNumber" = 'REF-WAVE3-S2-A') THEN
        INSERT INTO __mj_BizAppsReferrals."ReferralRequest"
            ("ID","RequestNumber","SeekerName","SeekerEmail","PracticeAreaID","JurisdictionID","ReferralTierID","MatterTitle","MatterSummary","UrgencyLevel","Status","AssignedProfessionalID","SourceChannel","SubmittedAt","EscalationLevel","LastEscalatedAt")
        VALUES
            ('e3000002-0000-0000-0000-000000000001', 'REF-WAVE3-S2-A', 'Cascadia Rail Signaling Upgrade', 'ops@cascadia-rail-demo.example.com', v_pa_cloud, v_j_ca, v_t_std, 'Legacy SCADA cloud migration', 'Multi-site SCADA-to-cloud migration for regional rail signaling; two prior cascade candidates both declined on capacity.', 'Standard', 'Exhausted', NULL, 'Web', NOW() - INTERVAL '6 days', 2, NOW() - INTERVAL '2 hours');
    END IF;

    IF v_pro1 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM __mj_BizAppsReferrals."ReferralAssignment" WHERE "ID" = 'f3000002-0000-0000-0000-000000000001') THEN
        INSERT INTO __mj_BizAppsReferrals."ReferralAssignment"
            ("ID","ReferralRequestID","ProfessionalProfileID","CascadeOrder","MatchScore","ConflictStatus","Status","OfferedAt","SLADeadlineAt","AIRationaleJSON")
        VALUES
            ('f3000002-0000-0000-0000-000000000001', 'e3000002-0000-0000-0000-000000000001', v_pro1, 2, 72.40, 'Cleared', 'Expired', NOW() - INTERVAL '26 hours', NOW() - INTERVAL '2 hours', '{"decision":"cascade_exhausted","consideredCandidates":2,"reason":"No remaining eligible professionals in practice area after 2 cascade steps."}');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM __mj_BizAppsReferrals."ReferralRequest" WHERE "RequestNumber" = 'REF-WAVE3-S2-B') THEN
        INSERT INTO __mj_BizAppsReferrals."ReferralRequest"
            ("ID","RequestNumber","SeekerName","SeekerEmail","PracticeAreaID","JurisdictionID","ReferralTierID","MatterTitle","MatterSummary","UrgencyLevel","Status","AssignedProfessionalID","SourceChannel","SubmittedAt")
        VALUES
            ('e3000002-0000-0000-0000-000000000002', 'REF-WAVE3-S2-B', 'Harrow Biotech Cold-Chain Audit', 'ops@harrow-biotech-demo.example.com', v_pa_ai, v_j_ca, v_t_pri, 'Cold-chain IoT anomaly detection model audit', 'Independent audit of a cold-chain IoT anomaly-detection model ahead of an FDA pre-submission meeting.', 'Standard', 'Routed', NULL, 'Referral', NOW() - INTERVAL '2 days');
    END IF;

    IF v_pro2 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM __mj_BizAppsReferrals."ReferralAssignment" WHERE "ID" = 'f3000002-0000-0000-0000-000000000002') THEN
        INSERT INTO __mj_BizAppsReferrals."ReferralAssignment"
            ("ID","ReferralRequestID","ProfessionalProfileID","CascadeOrder","MatchScore","ConflictStatus","Status","OfferedAt","SLADeadlineAt","AIRationaleJSON")
        VALUES
            ('f3000002-0000-0000-0000-000000000002', 'e3000002-0000-0000-0000-000000000002', v_pro2, 1, 89.10, 'Cleared', 'Expired', NOW() - INTERVAL '30 hours', NOW() - INTERVAL '6 hours', '{"decision":"sla_breach_detected","elapsedHours":30.5,"slaWindowHours":24,"reason":"Professional did not respond within the 24h SLA window."}');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM __mj_BizAppsReferrals."ReferralRequest" WHERE "RequestNumber" = 'REF-WAVE3-S2-C') THEN
        INSERT INTO __mj_BizAppsReferrals."ReferralRequest"
            ("ID","RequestNumber","SeekerName","SeekerEmail","PracticeAreaID","JurisdictionID","ReferralTierID","MatterTitle","MatterSummary","UrgencyLevel","Status","AssignedProfessionalID","SourceChannel","SubmittedAt")
        VALUES
            ('e3000002-0000-0000-0000-000000000003', 'REF-WAVE3-S2-C', 'Solace Grid Outage Forensics', 'ops@solace-grid-demo.example.com', v_pa_ai, v_j_ca, v_t_pri, 'Urgent outage root-cause ML triage', 'Urgent post-incident forensic review of an ML-based grid outage triage model following a 6-hour regional outage.', 'Urgent', 'Routed', NULL, 'Web', NOW() - INTERVAL '9 hours');
    END IF;

    IF v_pro3 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM __mj_BizAppsReferrals."ReferralAssignment" WHERE "ID" = 'f3000002-0000-0000-0000-000000000003') THEN
        INSERT INTO __mj_BizAppsReferrals."ReferralAssignment"
            ("ID","ReferralRequestID","ProfessionalProfileID","CascadeOrder","MatchScore","ConflictStatus","Status","OfferedAt","SLADeadlineAt","AIRationaleJSON")
        VALUES
            ('f3000002-0000-0000-0000-000000000003', 'e3000002-0000-0000-0000-000000000003', v_pro3, 1, 90.80, 'Cleared', 'Offered', NOW() - INTERVAL '9 hours', NOW() + INTERVAL '3 hours', '{"decision":"urgent_unassigned_risk","hoursOpen":9.0,"urgentSlaMultiplier":2.0,"reason":"Urgent request approaching 2x SLA window without acceptance."}');
    END IF;

    -- 7. 14 additional ReferralEscalation rows spanning all 6 TriggerType values,
    --    all 4 Status values, and EscalationLevel 1-3 (16 total combined with
    --    Slice 1's 2 rows). 3 reference the synthetic A/B/C assignments above,
    --    each of which carries a populated AIRationaleJSON.
    INSERT INTO __mj_BizAppsReferrals."ReferralEscalation"
        ("ID","ReferralRequestID","ReferralAssignmentID","EscalationLevel","TriggerType","Status","RecommendedAction","Notes","DedupKey","TriggeredAt","AcknowledgedAt","ResolvedAt","ResolutionNotes")
    SELECT * FROM (VALUES
        ('e3000002-0000-0000-0000-000000000011'::UUID, 'e2000001-0000-0000-0000-000000000110'::UUID, 'f2000001-0000-0000-0000-000000000112'::UUID, 1, 'SLAWarning', 'Open', 'Notify', '75% of SLA window elapsed on the SAP integration lead review; no response yet.', 'SLAWARN:f2000001-0000-0000-0000-000000000112', NOW() - INTERVAL '2 hours', NULL::TIMESTAMPTZ, NULL::TIMESTAMPTZ, NULL::TEXT),
        ('e3000002-0000-0000-0000-000000000012'::UUID, 'e2000001-0000-0000-0000-000000000114'::UUID, 'f2000001-0000-0000-0000-000000000116'::UUID, 1, 'SLAWarning', 'Dismissed', 'Notify', 'SLA warning fired while professional confirmation was in flight by phone.', 'SLAWARN:f2000001-0000-0000-0000-000000000116', NOW() - INTERVAL '20 hours', NOW() - INTERVAL '19 hours', NOW() - INTERVAL '18 hours', 'False positive; professional had already accepted by phone before the system recorded the response.'),
        ('e3000002-0000-0000-0000-000000000013'::UUID, 'e2000001-0000-0000-0000-000000000119'::UUID, 'f2000001-0000-0000-0000-000000000119'::UUID, 2, 'SLABreach', 'Open', 'Reassign', 'First cascade step exceeded its SLA window without a response during the holiday week.', 'SLABREACH:f2000001-0000-0000-0000-000000000119', NOW() - INTERVAL '16 hours', NULL, NULL, NULL),
        ('e3000002-0000-0000-0000-000000000014'::UUID, 'e2000001-0000-0000-0000-000000000106'::UUID, 'f2000001-0000-0000-0000-000000000107'::UUID, 2, 'SLABreach', 'Acknowledged', 'Reassign', 'Step 2 cascade candidate approaching SLA breach on the Azure private-endpoint engagement.', 'SLABREACH:f2000001-0000-0000-0000-000000000107', NOW() - INTERVAL '4 hours', NOW() - INTERVAL '3 hours', NULL, NULL),
        ('e3000002-0000-0000-0000-000000000015'::UUID, 'e2000001-0000-0000-0000-000000000113'::UUID, 'f2000001-0000-0000-0000-000000000115'::UUID, 1, 'ManualEscalation', 'Open', 'Notify', 'Seeker requested a manual status check on the FHIR R4 telehealth audit.', 'MANUAL:e2000001-0000-0000-0000-000000000113:1', NOW() - INTERVAL '1 hour', NULL, NULL, NULL),
        ('e3000002-0000-0000-0000-000000000016'::UUID, 'e2000001-0000-0000-0000-000000000109'::UUID, 'f2000001-0000-0000-0000-000000000111'::UUID, 2, 'ManualEscalation', 'Resolved', 'AdminAlert', 'Coordinator flagged for a manual compliance check on the FCA model-risk governance engagement.', 'MANUAL:e2000001-0000-0000-0000-000000000109:2', NOW() - INTERVAL '14 hours', NOW() - INTERVAL '13 hours', NOW() - INTERVAL '12 hours', 'Confirmed engagement is on-track; no compliance gap found.'),
        ('e3000002-0000-0000-0000-000000000017'::UUID, 'e2000001-0000-0000-0000-000000000117'::UUID, NULL, 2, 'CapacityExhausted', 'Open', 'Reassign', 'All matched Snowflake/Kafka specialists are at MaxConcurrentReferrals capacity.', 'CAPACITY:e2000001-0000-0000-0000-000000000117', NOW() - INTERVAL '3 hours', NULL, NULL, NULL),
        ('e3000002-0000-0000-0000-000000000018'::UUID, 'e2000001-0000-0000-0000-000000000118'::UUID, NULL, 3, 'CapacityExhausted', 'Acknowledged', 'EscalateToTier', 'No supply-chain security specialists available at the Standard tier; considering Priority tier escalation.', 'CAPACITY:e2000001-0000-0000-0000-000000000118', NOW() - INTERVAL '6 hours', NOW() - INTERVAL '5 hours', NULL, NULL),
        ('e3000002-0000-0000-0000-000000000019'::UUID, 'e2000001-0000-0000-0000-000000000121'::UUID, NULL, 1, 'CapacityExhausted', 'Dismissed', 'Notify', 'Capacity check fired moments before the seeker cancelled the request.', 'CAPACITY:e2000001-0000-0000-0000-000000000121', NOW() - INTERVAL '40 hours', NOW() - INTERVAL '39 hours', NOW() - INTERVAL '39 hours', 'Request was cancelled by the seeker; no further capacity action needed.'),
        ('e3000002-0000-0000-0000-00000000001a'::UUID, 'e2000001-0000-0000-0000-000000000119'::UUID, 'f2000001-0000-0000-0000-000000000121'::UUID, 3, 'CascadeExhausted', 'Resolved', 'Reassign', 'Final cascade step (3 of 3) expired with no acceptance; all practice-area candidates exhausted.', 'CASCADE:e2000001-0000-0000-0000-000000000119', NOW() - INTERVAL '16 hours', NOW() - INTERVAL '15 hours', NOW() - INTERVAL '2 hours', 'Reopened with an expanded parent-practice-area match; new candidate accepted the referral.'),
        ('e3000002-0000-0000-0000-00000000001b'::UUID, 'e3000002-0000-0000-0000-000000000001'::UUID, 'f3000002-0000-0000-0000-000000000001'::UUID, 2, 'CascadeExhausted', 'Open', 'Reassign', 'Both cascade candidates for the SCADA cloud migration declined on capacity.', 'CASCADE:f3000002-0000-0000-0000-000000000001', NOW() - INTERVAL '2 hours', NULL, NULL, NULL),
        ('e3000002-0000-0000-0000-00000000001c'::UUID, 'e3000002-0000-0000-0000-000000000002'::UUID, 'f3000002-0000-0000-0000-000000000002'::UUID, 1, 'SLABreach', 'Acknowledged', 'Reassign', 'Cold-chain IoT audit assignment expired 6.5 hours past its 24h SLA window.', 'SLABREACH:f3000002-0000-0000-0000-000000000002', NOW() - INTERVAL '6 hours', NOW() - INTERVAL '5 hours', NULL, NULL),
        ('e3000002-0000-0000-0000-00000000001d'::UUID, 'e3000002-0000-0000-0000-000000000003'::UUID, 'f3000002-0000-0000-0000-000000000003'::UUID, 3, 'UrgentUnassigned', 'Resolved', 'EscalateToTier', 'Urgent grid-outage forensic review approaching 2x its SLA window without acceptance.', 'URGENT:f3000002-0000-0000-0000-000000000003', NOW() - INTERVAL '9 hours', NOW() - INTERVAL '8 hours', NOW() - INTERVAL '1 hour', 'Coordinator manually matched an available senior professional outside the automated cascade.'),
        ('e3000002-0000-0000-0000-00000000001e'::UUID, 'e2000001-0000-0000-0000-000000000121'::UUID, NULL, 1, 'UrgentUnassigned', 'Open', 'Notify', 'Urgent ransomware tabletop request left unassigned after cancellation review.', 'URGENT:e2000001-0000-0000-0000-000000000121', NOW() - INTERVAL '1 hour', NULL, NULL, NULL)
    ) AS e(id, reqid, assignid, level, triggertype, status, recommendedaction, notes, dedupkey, triggeredat, acknowledgedat, resolvedat, resolutionnotes)
    WHERE NOT EXISTS (SELECT 1 FROM __mj_BizAppsReferrals."ReferralEscalation" existing WHERE existing."ID" = e.id);

    -- 8. 36 ReciprocitySnapshot rows: 18 seeded professionals
    --    (d2000001-...-0101 through -0118) x the 2 calendar quarters
    --    immediately preceding the current one.
    v_q_start := date_trunc('quarter', NOW());
    v_q1_start := v_q_start - INTERVAL '3 months';
    v_q1_end := v_q_start;
    v_q2_start := v_q_start - INTERVAL '6 months';
    v_q2_end := v_q1_start;

    FOR v_seq IN 1..18 LOOP
        v_pro_id := ('d2000001-0000-0000-0000-000000000' || (100 + v_seq)::TEXT)::UUID;
        CONTINUE WHEN NOT EXISTS (SELECT 1 FROM __mj_BizAppsReferrals."ProfessionalProfile" WHERE "ID" = v_pro_id);

        FOR v_period_tag IN 1..2 LOOP
            IF v_period_tag = 1 THEN
                v_period_start := v_q1_start;
                v_period_end := v_q1_end;
            ELSE
                v_period_start := v_q2_start;
                v_period_end := v_q2_end;
            END IF;

            SELECT given, received, accepted, resolved, slabreach, medianresp, fee INTO
                v_given, v_received, v_accepted, v_resolved, v_sla_breach, v_median_resp, v_fee
            FROM (VALUES
                (1,1,3,4,3,2,1,1.35,2715.00),(2,1,4,5,3,3,2,1.70,3130.00),(3,1,5,6,6,5,0,2.05,3545.00),(4,1,6,3,2,2,1,2.40,3960.00),
                (5,1,2,4,2,1,2,2.75,4375.00),(6,1,3,5,5,5,0,1.00,4790.00),(7,1,4,6,5,4,1,1.35,5205.00),(8,1,5,3,1,1,2,1.70,5620.00),
                (9,1,6,4,4,3,0,2.05,6035.00),(10,1,2,5,4,4,1,2.40,6450.00),(11,1,3,6,4,3,2,2.75,6865.00),(12,1,4,3,3,3,0,1.00,7280.00),
                (13,1,5,4,3,2,1,1.35,7695.00),(14,1,6,5,3,3,2,1.70,8110.00),(15,1,2,6,6,5,0,2.05,8525.00),(16,1,3,3,2,2,1,2.40,8940.00),
                (17,1,4,4,2,1,2,2.75,9355.00),(18,1,5,5,5,5,0,1.00,9770.00),
                (1,2,2,3,2,1,2,1.50,1800.00),(2,2,3,4,4,3,0,1.80,2100.00),(3,2,4,5,4,3,1,2.10,2400.00),(4,2,1,6,6,5,2,2.40,2700.00),
                (5,2,2,2,1,0,0,1.20,3000.00),(6,2,3,3,3,2,1,1.50,3300.00),(7,2,4,4,3,2,2,1.80,3600.00),(8,2,1,5,5,4,0,2.10,3900.00),
                (9,2,2,6,5,4,1,2.40,4200.00),(10,2,3,2,2,1,2,1.20,4500.00),(11,2,4,3,2,1,0,1.50,4800.00),(12,2,1,4,4,3,1,1.80,5100.00),
                (13,2,2,5,4,3,2,2.10,5400.00),(14,2,3,6,6,5,0,2.40,5700.00),(15,2,4,2,1,0,1,1.20,6000.00),(16,2,1,3,3,2,2,1.50,6300.00),
                (17,2,2,4,3,2,0,1.80,6600.00),(18,2,3,5,5,4,1,2.10,6900.00)
            ) AS s(proseq, periodtag, given, received, accepted, resolved, slabreach, medianresp, fee)
            WHERE s.proseq = v_seq AND s.periodtag = v_period_tag;

            IF NOT EXISTS (
                SELECT 1 FROM __mj_BizAppsReferrals."ReciprocitySnapshot" rs
                WHERE rs."ProfessionalProfileID" = v_pro_id
                  AND rs."PeriodStartDate" = v_period_start
                  AND rs."PeriodEndDate" = v_period_end
            ) THEN
                INSERT INTO __mj_BizAppsReferrals."ReciprocitySnapshot"
                    ("ID","ProfessionalProfileID","SnapshotDate","PeriodStartDate","PeriodEndDate","ReferralsGivenCount","ReferralsReceivedCount","ReciprocityIndex","AcceptedCount","ResolvedCount","SLABreachCount","AcceptanceRate","MedianResponseHours","AttributedFeeTotal")
                VALUES
                    (gen_random_uuid(), v_pro_id, NOW(), v_period_start, v_period_end, v_given, v_received,
                     ROUND((v_given + 1.0) / (v_accepted + 1.0), 3), v_accepted, v_resolved, v_sla_breach,
                     CASE WHEN v_received > 0 THEN ROUND(v_accepted::NUMERIC / v_received, 3) ELSE 0 END,
                     v_median_resp, v_fee);
            END IF;
        END LOOP;
    END LOOP;
END $$;
