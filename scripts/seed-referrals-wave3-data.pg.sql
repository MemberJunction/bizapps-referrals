-- ============================================================================
-- Idempotent Wave 3 Slice 1 Seed Data (PostgreSQL): SLA Escalation, Outcomes & Readiness
-- Safe to run multiple times (idempotent by deterministic IDs / unique keys).
-- Depends on the base ProfessionalProfile / PracticeArea / Jurisdiction /
-- ReferralTier taxonomy already being present in __mj_BizAppsReferrals.
-- Realigned to the Spec SS2.2/SS2.3 Remediation Round 2 schema/vocabulary.
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
            ('e3000001-0000-0000-0000-000000000001', 'REF-WAVE3-DEMO-001', 'Northwind Cloud Migration', 'ops@northwind-demo.example.com', v_pa_cloud, v_j_ca, v_t_std, 'Multi-region AWS landing zone cutover', 'Need a principal cloud architect to lead a 6-week multi-region AWS landing zone cutover with FinOps guardrails.', 'Standard', 'Completed', v_pro1, 'SeekerIntake', NOW(), NOW(), NOW());
    END IF;

    IF v_pro1 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM __mj_BizAppsReferrals."ReferralAssignment" WHERE "ID" = 'e3000001-0000-0000-0000-000000000002') THEN
        INSERT INTO __mj_BizAppsReferrals."ReferralAssignment"
            ("ID","ReferralRequestID","ProfessionalProfileID","CascadeOrder","MatchScore","ConflictStatus","Status","OfferedAt","SLADeadlineAt","RespondedAt","CompletedAt","ResponseHours")
        VALUES
            ('e3000001-0000-0000-0000-000000000002', 'e3000001-0000-0000-0000-000000000001', v_pro1, 1, 94.50, 'Cleared', 'Completed', NOW(), NOW() + INTERVAL '24 hours', NOW(), NOW(), 1.20);
    END IF;

    IF v_pro1 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM __mj_BizAppsReferrals."ReferralOutcome" WHERE "ID" = 'e3000001-0000-0000-0000-000000000003') THEN
        INSERT INTO __mj_BizAppsReferrals."ReferralOutcome"
            ("ID","ReferralRequestID","ReferralAssignmentID","ProfessionalProfileID","OutcomeStatus","EngagedAt","ClosedAt","EstimatedFeeAmount","ReportedFeeAmount","CurrencyCode","ReportedByType","AttributionNotes")
        VALUES
            ('e3000001-0000-0000-0000-000000000003', 'e3000001-0000-0000-0000-000000000001', 'e3000001-0000-0000-0000-000000000002', v_pro1, 'Resolved', NOW(), NOW(), 48000.00, 52000.00, 'USD', 'Professional', 'Landing zone cutover delivered on schedule; client extended a 12-month FinOps retainer.');
    END IF;

    IF v_pro2 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM __mj_BizAppsReferrals."ReferralRequest" WHERE "RequestNumber" = 'REF-WAVE3-DEMO-002') THEN
        INSERT INTO __mj_BizAppsReferrals."ReferralRequest"
            ("ID","RequestNumber","SeekerName","SeekerEmail","PracticeAreaID","JurisdictionID","ReferralTierID","MatterTitle","MatterSummary","UrgencyLevel","Status","AssignedProfessionalID","SourceChannel","SubmittedAt","AcceptedAt")
        VALUES
            ('e3000001-0000-0000-0000-000000000004', 'REF-WAVE3-DEMO-002', 'Aurora Robotics RAG Rollout', 'cto@aurora-robotics-demo.example.com', v_pa_ai, v_j_ca, v_t_pri, 'Production RAG pipeline for field service copilot', 'Urgent production RAG rollout for a field-service copilot with strict EU AI Act documentation requirements.', 'Urgent', 'InProgress', v_pro2, 'ProReferral', NOW(), NOW());
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
            ('e3000001-0000-0000-0000-000000000006', 'REF-WAVE3-DEMO-003', 'Beacon Analytics R&D Study', 'finance@beacon-analytics-demo.example.com', v_pa_tax, v_j_ny, v_t_std, 'Section 174 R&D credit study', 'Section 174 R&D tax credit study for a 40-person SaaS analytics company ahead of a Q1 financing round.', 'Standard', 'Routed', v_pro3, 'Concierge', NOW(), 1, NOW());
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
            ("ID","ReferralRequestID","ReferralAssignmentID","EscalationLevel","TriggerType","Status","DedupKey","RecommendedAction","Notes","RaisedAt")
        VALUES
            ('e3000001-0000-0000-0000-000000000008', 'e3000001-0000-0000-0000-000000000006', 'e3000001-0000-0000-0000-000000000007', 1, 'SLAWarning', 'Open', 'SEED:SLAWARN:e3000001-0000-0000-0000-000000000008', 'ExtendSLA', '75% of SLA window elapsed with no response yet; coordinator notified.', NOW());
    END IF;

    IF v_pro2 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM __mj_BizAppsReferrals."ReferralEscalation" WHERE "ID" = 'e3000001-0000-0000-0000-000000000009') THEN
        INSERT INTO __mj_BizAppsReferrals."ReferralEscalation"
            ("ID","ReferralRequestID","ReferralAssignmentID","EscalationLevel","TriggerType","Status","DedupKey","RecommendedAction","Notes","RaisedAt","AcknowledgedAt","ResolvedAt")
        VALUES
            ('e3000001-0000-0000-0000-000000000009', 'e3000001-0000-0000-0000-000000000004', 'e3000001-0000-0000-0000-000000000005', 1, 'Manual', 'Resolved', 'SEED:MANUAL:e3000001-0000-0000-0000-000000000009', 'ContactSeeker', 'Seeker requested a status check; professional confirmed on-track delivery.', NOW() - INTERVAL '3 hours', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 hour');
    END IF;

    -- 3. ProfessionalAvailabilityWindow records (Spec SS2.2/SS2.3: StartsAt/EndsAt
    --    NOT NULL, CapacityOverride/Reason/IsActive only). >=12 rows.
    INSERT INTO __mj_BizAppsReferrals."ProfessionalAvailabilityWindow" ("ID","ProfessionalProfileID","WindowType","StartsAt","EndsAt","CapacityOverride","Reason","IsActive")
    SELECT w.id, w.proid, w.windowtype, NOW() + (w.daysstart || ' days')::INTERVAL, NOW() + (w.daysend || ' days')::INTERVAL, w.capoverride, w.reason, TRUE
    FROM (VALUES
        ('e3000001-0000-0000-0000-00000000010a'::UUID, v_pro1, 'ReducedCapacity', 0, 14, 2, 'Reduced capacity during a concurrent internal audit engagement.'),
        ('e3000001-0000-0000-0000-00000000010b'::UUID, v_pro1, 'Paused', 30, 33, NULL, 'Short pause for a conference.'),
        ('e3000001-0000-0000-0000-00000000010c'::UUID, v_pro2, 'OnLeave', 45, 52, NULL, 'Planned leave.'),
        ('e3000001-0000-0000-0000-00000000010d'::UUID, v_pro3, 'OnLeave', 10, 17, NULL, 'Annual tax-season leave.'),
        ('e3000001-0000-0000-0000-00000000010e'::UUID, v_pro1, 'OnLeave', 60, 65, NULL, 'Family travel.'),
        ('e3000001-0000-0000-0000-00000000010f'::UUID, v_pro2, 'ReducedCapacity', 5, 20, 1, 'Reduced capacity while onboarding a junior associate.'),
        ('e3000001-0000-0000-0000-000000001010'::UUID, v_pro2, 'Paused', 25, 26, NULL, 'Single-day administrative pause.'),
        ('e3000001-0000-0000-0000-000000001011'::UUID, v_pro3, 'ReducedCapacity', 2, 9, 3, 'Reduced capacity during tax-season peak filing week.'),
        ('e3000001-0000-0000-0000-000000001012'::UUID, v_pro1, 'Paused', 70, 72, NULL, 'Short conference pause.'),
        ('e3000001-0000-0000-0000-000000001013'::UUID, v_pro3, 'Paused', 35, 36, NULL, 'Single-day CLE commitment.'),
        ('e3000001-0000-0000-0000-000000001014'::UUID, v_pro2, 'OnLeave', 80, 87, NULL, 'Planned sabbatical week.'),
        ('e3000001-0000-0000-0000-000000001015'::UUID, v_pro3, 'ReducedCapacity', 40, 55, 2, 'Reduced capacity while serving on a bar association committee.')
    ) AS w(id, proid, windowtype, daysstart, daysend, capoverride, reason)
    WHERE w.proid IS NOT NULL
      AND NOT EXISTS (SELECT 1 FROM __mj_BizAppsReferrals."ProfessionalAvailabilityWindow" existing WHERE existing."ID" = w.id);

    -- 4. ReciprocitySnapshot records (one per professional for the current canonical quarter).
    IF v_pro1 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM __mj_BizAppsReferrals."ReciprocitySnapshot" WHERE "ID" = 'e3000001-0000-0000-0000-00000000000e') THEN
        INSERT INTO __mj_BizAppsReferrals."ReciprocitySnapshot"
            ("ID","ProfessionalProfileID","ComputedAt","PeriodStart","PeriodEnd","ReferralsSent","ReferralsReceived","ReferralsAccepted","ReferralsResolved","ReciprocityIndex")
        VALUES
            ('e3000001-0000-0000-0000-00000000000e', v_pro1, NOW(), '2026-07-01', '2026-09-30', 3, 5, 4, 2, 0.667);
    END IF;

    IF v_pro2 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM __mj_BizAppsReferrals."ReciprocitySnapshot" WHERE "ID" = 'e3000001-0000-0000-0000-00000000000f') THEN
        INSERT INTO __mj_BizAppsReferrals."ReciprocitySnapshot"
            ("ID","ProfessionalProfileID","ComputedAt","PeriodStart","PeriodEnd","ReferralsSent","ReferralsReceived","ReferralsAccepted","ReferralsResolved","ReciprocityIndex")
        VALUES
            ('e3000001-0000-0000-0000-00000000000f', v_pro2, NOW(), '2026-07-01', '2026-09-30', 2, 2, 2, 2, 1.000);
    END IF;

    IF v_pro3 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM __mj_BizAppsReferrals."ReciprocitySnapshot" WHERE "ID" = 'e3000001-0000-0000-0000-000000000010') THEN
        INSERT INTO __mj_BizAppsReferrals."ReciprocitySnapshot"
            ("ID","ProfessionalProfileID","ComputedAt","PeriodStart","PeriodEnd","ReferralsSent","ReferralsReceived","ReferralsAccepted","ReferralsResolved","ReciprocityIndex")
        VALUES
            ('e3000001-0000-0000-0000-000000000010', v_pro3, NOW(), '2026-07-01', '2026-09-30', 6, 1, 1, 1, 0.167);
    END IF;

    -- 5. ProfessionalProfile readiness/reciprocity rollups.
    IF v_pro1 IS NOT NULL THEN
        UPDATE __mj_BizAppsReferrals."ProfessionalProfile" SET "ReadinessScore" = 96.50, "ReciprocityIndex" = 0.667 WHERE "ID" = v_pro1;
    END IF;
    IF v_pro2 IS NOT NULL THEN
        UPDATE __mj_BizAppsReferrals."ProfessionalProfile" SET "ReadinessScore" = 88.00, "ReciprocityIndex" = 1.000 WHERE "ID" = v_pro2;
    END IF;
    IF v_pro3 IS NOT NULL THEN
        UPDATE __mj_BizAppsReferrals."ProfessionalProfile" SET "ReadinessScore" = 91.25, "ReciprocityIndex" = 0.167 WHERE "ID" = v_pro3;
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
    v_pa_tax UUID;
    v_j_ca UUID;
    v_j_ny UUID;
    v_t_std UUID;
    v_t_pri UUID;
    v_pro1 UUID;
    v_pro2 UUID;
    v_pro3 UUID;
    v_pro_id UUID;
    v_seq INT;
    v_period_tag INT;
    v_sent INT;
    v_received INT;
    v_accepted INT;
    v_resolved INT;
    v_sla_breach INT;
    v_median_resp NUMERIC(8,2);
    v_fee NUMERIC(14,2);
    v_period_start DATE;
    v_period_end DATE;
BEGIN
    SELECT "ID" INTO v_pa_cloud FROM __mj_BizAppsReferrals."PracticeArea" WHERE "Code" = 'IT_CLOUD_ARCH' LIMIT 1;
    SELECT "ID" INTO v_pa_ai FROM __mj_BizAppsReferrals."PracticeArea" WHERE "Code" = 'IT_AI_LLM' LIMIT 1;
    SELECT "ID" INTO v_pa_tax FROM __mj_BizAppsReferrals."PracticeArea" WHERE "Code" = 'ACCT_TAX_RD' LIMIT 1;
    SELECT "ID" INTO v_j_ca FROM __mj_BizAppsReferrals."Jurisdiction" WHERE "Code" = 'US-CA' LIMIT 1;
    SELECT "ID" INTO v_j_ny FROM __mj_BizAppsReferrals."Jurisdiction" WHERE "Code" = 'US-NY' LIMIT 1;
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
            ('e3000002-0000-0000-0000-000000000001', 'REF-WAVE3-S2-A', 'Cascadia Rail Signaling Upgrade', 'ops@cascadia-rail-demo.example.com', v_pa_cloud, v_j_ca, v_t_std, 'Legacy SCADA cloud migration', 'Multi-site SCADA-to-cloud migration for regional rail signaling; two prior cascade candidates both declined on capacity.', 'Standard', 'Exhausted', NULL, 'SeekerIntake', NOW() - INTERVAL '6 days', 2, NOW() - INTERVAL '2 hours');
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
            ('e3000002-0000-0000-0000-000000000002', 'REF-WAVE3-S2-B', 'Harrow Biotech Cold-Chain Audit', 'ops@harrow-biotech-demo.example.com', v_pa_ai, v_j_ca, v_t_pri, 'Cold-chain IoT anomaly detection model audit', 'Independent audit of a cold-chain IoT anomaly-detection model ahead of an FDA pre-submission meeting.', 'Standard', 'Routed', NULL, 'ProReferral', NOW() - INTERVAL '2 days');
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
            ('e3000002-0000-0000-0000-000000000003', 'REF-WAVE3-S2-C', 'Solace Grid Outage Forensics', 'ops@solace-grid-demo.example.com', v_pa_ai, v_j_ca, v_t_pri, 'Urgent outage root-cause ML triage', 'Urgent post-incident forensic review of an ML-based grid outage triage model following a 6-hour regional outage.', 'Urgent', 'Routed', NULL, 'Concierge', NOW() - INTERVAL '9 hours');
    END IF;

    IF v_pro3 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM __mj_BizAppsReferrals."ReferralAssignment" WHERE "ID" = 'f3000002-0000-0000-0000-000000000003') THEN
        INSERT INTO __mj_BizAppsReferrals."ReferralAssignment"
            ("ID","ReferralRequestID","ProfessionalProfileID","CascadeOrder","MatchScore","ConflictStatus","Status","OfferedAt","SLADeadlineAt","AIRationaleJSON")
        VALUES
            ('f3000002-0000-0000-0000-000000000003', 'e3000002-0000-0000-0000-000000000003', v_pro3, 1, 90.80, 'Cleared', 'Offered', NOW() - INTERVAL '9 hours', NOW() + INTERVAL '3 hours', '{"decision":"urgent_unassigned_risk","hoursOpen":9.0,"urgentSlaMultiplier":2.0,"reason":"Urgent request approaching 2x SLA window without acceptance."}');
    END IF;

    -- 6b. 10 pro-to-pro ReferralRequest rows covering all 5 SourceChannel values.
    INSERT INTO __mj_BizAppsReferrals."ReferralRequest"
        ("ID","RequestNumber","SeekerName","SeekerEmail","PracticeAreaID","JurisdictionID","ReferralTierID","MatterTitle","MatterSummary","UrgencyLevel","Status","ReferringProfessionalID","SourceChannel","SubmittedAt")
    SELECT
        ('e3000003-0000-0000-0000-0000000000' || lpad(pr.seq::TEXT, 2, '0'))::UUID,
        'REF-WAVE3-P2P-' || pr.seq::TEXT,
        'Pro-to-Pro Referral Seeker ' || pr.seq::TEXT,
        'seeker' || pr.seq::TEXT || '@wave3-p2p-demo.example.com',
        pr.paid, pr.jid, pr.tid, pr.title, pr.title || ' (seed fixture).', 'Standard', 'Routed', pr.referrerid, pr.sourcechannel, NOW() - (pr.seq || ' days')::INTERVAL
    FROM (VALUES
        (1, v_pro1, 'ProReferral', v_pa_ai, v_j_ca, v_t_std, 'Pro-to-pro: AI model governance second opinion'),
        (2, v_pro2, 'ProReferral', v_pa_tax, v_j_ny, v_t_std, 'Pro-to-pro: R&D credit methodology peer review'),
        (3, v_pro3, 'ProReferral', v_pa_cloud, v_j_ca, v_t_pri, 'Pro-to-pro: multi-cloud DR architecture review'),
        (4, v_pro1, 'SeekerIntake', v_pa_tax, v_j_ny, v_t_std, 'Seeker-direct: year-end close support'),
        (5, v_pro2, 'FinderWidget', v_pa_cloud, v_j_ca, v_t_std, 'Finder widget: landing-zone cost review'),
        (6, v_pro3, 'Concierge', v_pa_ai, v_j_ca, v_t_pri, 'Concierge: urgent model audit referral'),
        (7, v_pro1, 'OperatorManual', v_pa_cloud, v_j_ca, v_t_std, 'Operator manual entry: legacy migration triage'),
        (8, v_pro2, 'ProReferral', v_pa_ai, v_j_ca, v_t_pri, 'Pro-to-pro: LLM evaluation harness consult'),
        (9, v_pro3, 'ProReferral', v_pa_tax, v_j_ny, v_t_std, 'Pro-to-pro: multi-state nexus study'),
        (10, v_pro1, 'ProReferral', v_pa_cloud, v_j_ca, v_t_pri, 'Pro-to-pro: zero-trust network redesign')
    ) AS pr(seq, referrerid, sourcechannel, paid, jid, tid, title)
    WHERE pr.referrerid IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM __mj_BizAppsReferrals."ReferralRequest" existing
        WHERE existing."ID" = ('e3000003-0000-0000-0000-0000000000' || lpad(pr.seq::TEXT, 2, '0'))::UUID
      );

    -- 7. 14 additional ReferralEscalation rows spanning all 6 TriggerType values,
    --    all 4 Status values, and EscalationLevel 1-3 (16 total combined with
    --    Slice 1's 2 rows). Rows 7, 8, and 11 populate RecommendedAction AND
    --    AIRationaleJSON directly on the escalation row (AC-17/AC-30).
    INSERT INTO __mj_BizAppsReferrals."ReferralEscalation"
        ("ID","ReferralRequestID","ReferralAssignmentID","EscalationLevel","TriggerType","Status","RecommendedAction","Notes","DedupKey","RaisedAt","AcknowledgedAt","ResolvedAt","ResolutionNotes","AIRationaleJSON")
    SELECT * FROM (VALUES
        ('e3000002-0000-0000-0000-000000000011'::UUID, 'e2000001-0000-0000-0000-000000000110'::UUID, 'f2000001-0000-0000-0000-000000000112'::UUID, 1, 'SLAWarning', 'Open', 'ExtendSLA', '75% of SLA window elapsed on the SAP integration lead review; no response yet.', 'SLAWARN:f2000001-0000-0000-0000-000000000112', NOW() - INTERVAL '2 hours', NULL::TIMESTAMPTZ, NULL::TIMESTAMPTZ, NULL::TEXT, NULL::TEXT),
        ('e3000002-0000-0000-0000-000000000012'::UUID, 'e2000001-0000-0000-0000-000000000114'::UUID, 'f2000001-0000-0000-0000-000000000116'::UUID, 1, 'SLAWarning', 'Dismissed', 'ExtendSLA', 'SLA warning fired while professional confirmation was in flight by phone.', 'SLAWARN:f2000001-0000-0000-0000-000000000116', NOW() - INTERVAL '20 hours', NOW() - INTERVAL '19 hours', NOW() - INTERVAL '18 hours', 'False positive; professional had already accepted by phone before the system recorded the response.', NULL),
        ('e3000002-0000-0000-0000-000000000013'::UUID, 'e2000001-0000-0000-0000-000000000119'::UUID, 'f2000001-0000-0000-0000-000000000119'::UUID, 2, 'SLABreach', 'Open', 'ReassignNextCandidate', 'First cascade step exceeded its SLA window without a response during the holiday week.', 'SLABREACH:f2000001-0000-0000-0000-000000000119', NOW() - INTERVAL '16 hours', NULL, NULL, NULL, NULL),
        ('e3000002-0000-0000-0000-000000000014'::UUID, 'e2000001-0000-0000-0000-000000000106'::UUID, 'f2000001-0000-0000-0000-000000000107'::UUID, 2, 'SLABreach', 'Acknowledged', 'ReassignNextCandidate', 'Step 2 cascade candidate approaching SLA breach on the Azure private-endpoint engagement.', 'SLABREACH:f2000001-0000-0000-0000-000000000107', NOW() - INTERVAL '4 hours', NOW() - INTERVAL '3 hours', NULL, NULL, NULL),
        ('e3000002-0000-0000-0000-000000000015'::UUID, 'e2000001-0000-0000-0000-000000000113'::UUID, 'f2000001-0000-0000-0000-000000000115'::UUID, 1, 'Manual', 'Open', 'ContactSeeker', 'Seeker requested a manual status check on the FHIR R4 telehealth audit.', 'MANUAL:e2000001-0000-0000-0000-000000000113:1', NOW() - INTERVAL '1 hour', NULL, NULL, NULL, NULL),
        ('e3000002-0000-0000-0000-000000000016'::UUID, 'e2000001-0000-0000-0000-000000000109'::UUID, 'f2000001-0000-0000-0000-000000000111'::UUID, 2, 'Manual', 'Resolved', 'ContactSeeker', 'Coordinator flagged for a manual compliance check on the FCA model-risk governance engagement.', 'MANUAL:e2000001-0000-0000-0000-000000000109:2', NOW() - INTERVAL '14 hours', NOW() - INTERVAL '13 hours', NOW() - INTERVAL '12 hours', 'Confirmed engagement is on-track; no compliance gap found.', NULL),
        ('e3000002-0000-0000-0000-000000000017'::UUID, 'e2000001-0000-0000-0000-000000000117'::UUID, NULL, 2, 'CascadeExhausted', 'Open', 'ExpandPracticeArea', 'All matched Snowflake/Kafka specialists are at MaxConcurrentReferrals capacity.', 'CAPACITY:e2000001-0000-0000-0000-000000000117', NOW() - INTERVAL '3 hours', NULL, NULL, NULL, '{"decision":"cascade_exhausted","consideredCandidates":3,"reason":"All matched Snowflake/Kafka specialists are at MaxConcurrentReferrals capacity."}'),
        ('e3000002-0000-0000-0000-000000000018'::UUID, 'e2000001-0000-0000-0000-000000000118'::UUID, NULL, 3, 'CascadeExhausted', 'Acknowledged', 'CloseAsExhausted', 'No supply-chain security specialists available at the Standard tier; considering tier escalation.', 'CAPACITY:e2000001-0000-0000-0000-000000000118', NOW() - INTERVAL '6 hours', NOW() - INTERVAL '5 hours', NULL, NULL, '{"decision":"cascade_exhausted","consideredCandidates":2,"reason":"No supply-chain security specialists available at the Standard tier."}'),
        ('e3000002-0000-0000-0000-000000000019'::UUID, 'e2000001-0000-0000-0000-000000000121'::UUID, NULL, 1, 'AIRecommended', 'Dismissed', 'ContactSeeker', 'Conflict screening flagged a potential adverse-party overlap moments before the seeker cancelled the request.', 'CONFLICT:e2000001-0000-0000-0000-000000000121', NOW() - INTERVAL '40 hours', NOW() - INTERVAL '39 hours', NOW() - INTERVAL '39 hours', 'Request was cancelled by the seeker; no further action needed.', NULL),
        ('e3000002-0000-0000-0000-00000000001a'::UUID, 'e2000001-0000-0000-0000-000000000119'::UUID, 'f2000001-0000-0000-0000-000000000121'::UUID, 3, 'CascadeExhausted', 'Resolved', 'ExpandPracticeArea', 'Final cascade step (3 of 3) expired with no acceptance; all practice-area candidates exhausted.', 'CASCADE:e2000001-0000-0000-0000-000000000119', NOW() - INTERVAL '16 hours', NOW() - INTERVAL '15 hours', NOW() - INTERVAL '2 hours', 'Reopened with an expanded parent-practice-area match; new candidate accepted the referral.', NULL),
        ('e3000002-0000-0000-0000-00000000001b'::UUID, 'e3000002-0000-0000-0000-000000000001'::UUID, 'f3000002-0000-0000-0000-000000000001'::UUID, 2, 'CascadeExhausted', 'Open', 'ExpandPracticeArea', 'Both cascade candidates for the SCADA cloud migration declined on capacity.', 'CASCADE:f3000002-0000-0000-0000-000000000001', NOW() - INTERVAL '2 hours', NULL, NULL, NULL, '{"decision":"cascade_exhausted","consideredCandidates":2,"reason":"Both cascade candidates for the SCADA cloud migration declined on capacity."}'),
        ('e3000002-0000-0000-0000-00000000001c'::UUID, 'e3000002-0000-0000-0000-000000000002'::UUID, 'f3000002-0000-0000-0000-000000000002'::UUID, 1, 'SLABreach', 'Acknowledged', 'ReassignNextCandidate', 'Cold-chain IoT audit assignment expired 6.5 hours past its 24h SLA window.', 'SLABREACH:f3000002-0000-0000-0000-000000000002', NOW() - INTERVAL '6 hours', NOW() - INTERVAL '5 hours', NULL, NULL, NULL),
        ('e3000002-0000-0000-0000-00000000001d'::UUID, 'e3000002-0000-0000-0000-000000000003'::UUID, 'f3000002-0000-0000-0000-000000000003'::UUID, 3, 'UrgentUnassigned', 'Resolved', 'CloseAsExhausted', 'Urgent grid-outage forensic review approaching 2x its SLA window without acceptance.', 'URGENT:f3000002-0000-0000-0000-000000000003', NOW() - INTERVAL '9 hours', NOW() - INTERVAL '8 hours', NOW() - INTERVAL '1 hour', 'Coordinator manually matched an available senior professional outside the automated cascade.', NULL),
        ('e3000002-0000-0000-0000-00000000001e'::UUID, 'e2000001-0000-0000-0000-000000000121'::UUID, NULL, 1, 'UrgentUnassigned', 'Open', 'ContactSeeker', 'Urgent ransomware tabletop request left unassigned after cancellation review.', 'URGENT:e2000001-0000-0000-0000-000000000121', NOW() - INTERVAL '1 hour', NULL, NULL, NULL, NULL)
    ) AS e(id, reqid, assignid, level, triggertype, status, recommendedaction, notes, dedupkey, raisedat, acknowledgedat, resolvedat, resolutionnotes, airationalejson)
    WHERE NOT EXISTS (SELECT 1 FROM __mj_BizAppsReferrals."ReferralEscalation" existing WHERE existing."ID" = e.id);

    -- 8. 20 ReferralOutcome rows spanning all 5 OutcomeStatus values.
    -- CR-19: each assignid below was verified against scripts/seed-referrals-demo-data.pg.sql
    -- to map to a unique ReferralRequestID (several base-demo requests have 2-3
    -- cascade-step assignments sharing one request; only one assignment per
    -- request is used here to avoid violating UQ_ReferralOutcome_ReferralRequest).
    -- daysago spans 2026-Q2 (Apr-Jun), Q3 (Jul-Sep), and Q4 (Oct-Nov) relative to "now".
    FOR v_seq IN 1..20 LOOP
        INSERT INTO __mj_BizAppsReferrals."ReferralOutcome" ("ID","ReferralRequestID","ReferralAssignmentID","ProfessionalProfileID","OutcomeStatus","EngagedAt","ClosedAt","EstimatedFeeAmount","ReportedFeeAmount","CurrencyCode","ReportedByType","ReportedAt","AttributionNotes")
        SELECT
            ('e3000004-0000-0000-0000-0000000000' || lpad(o.seq::TEXT, 2, '0'))::UUID,
            a."ReferralRequestID", a."ID", a."ProfessionalProfileID", o.status,
            CASE WHEN o.status IN ('Engaged', 'Resolved') THEN NOW() - ((o.daysago + 2) || ' days')::INTERVAL ELSE NULL END,
            CASE WHEN o.status IN ('Resolved', 'Withdrawn', 'NoEngagement', 'Lost') THEN NOW() - (o.daysago || ' days')::INTERVAL ELSE NULL END,
            o.estfee, o.repfee, 'USD', o.reportedbytype,
            NOW() - (o.daysago || ' days')::INTERVAL,
            'Seed fixture outcome #' || o.seq::TEXT || ' (' || o.status || ').'
        FROM (VALUES
            (1, 'f2000001-0000-0000-0000-000000000101'::UUID, 'Resolved', 12000.00::NUMERIC, 12500.00::NUMERIC, 'Professional', 220),
            (2, 'f2000001-0000-0000-0000-000000000102'::UUID, 'Engaged', 8000.00::NUMERIC, NULL::NUMERIC, 'Professional', 200),
            (3, 'f2000001-0000-0000-0000-000000000103'::UUID, 'Withdrawn', NULL::NUMERIC, NULL::NUMERIC, 'Seeker', 190),
            (4, 'f2000001-0000-0000-0000-000000000104'::UUID, 'NoEngagement', NULL::NUMERIC, NULL::NUMERIC, 'Operator', 180),
            (5, 'f2000001-0000-0000-0000-000000000105'::UUID, 'Lost', 5000.00::NUMERIC, NULL::NUMERIC, 'Operator', 170),
            (6, 'f2000001-0000-0000-0000-000000000106'::UUID, 'Resolved', 15000.00::NUMERIC, 15800.00::NUMERIC, 'Professional', 160),
            (7, 'f2000001-0000-0000-0000-000000000109'::UUID, 'Engaged', 9500.00::NUMERIC, NULL::NUMERIC, 'Professional', 150),
            (8, 'f2000001-0000-0000-0000-000000000110'::UUID, 'Resolved', 22000.00::NUMERIC, 21000.00::NUMERIC, 'Professional', 140),
            (9, 'f2000001-0000-0000-0000-000000000111'::UUID, 'Withdrawn', NULL::NUMERIC, NULL::NUMERIC, 'Seeker', 130),
            (10, 'f2000001-0000-0000-0000-000000000112'::UUID, 'NoEngagement', NULL::NUMERIC, NULL::NUMERIC, 'Operator', 120),
            (11, 'f2000001-0000-0000-0000-000000000113'::UUID, 'Lost', 3000.00::NUMERIC, NULL::NUMERIC, 'Operator', 110),
            (12, 'f2000001-0000-0000-0000-000000000114'::UUID, 'Resolved', 18000.00::NUMERIC, 18750.00::NUMERIC, 'Professional', 100),
            (13, 'f2000001-0000-0000-0000-000000000115'::UUID, 'Engaged', 7000.00::NUMERIC, NULL::NUMERIC, 'Professional', 90),
            (14, 'f2000001-0000-0000-0000-000000000116'::UUID, 'Resolved', 26000.00::NUMERIC, 25500.00::NUMERIC, 'Professional', 80),
            (15, 'f2000001-0000-0000-0000-000000000117'::UUID, 'Withdrawn', NULL::NUMERIC, NULL::NUMERIC, 'Seeker', 70),
            (16, 'f2000001-0000-0000-0000-000000000118'::UUID, 'NoEngagement', NULL::NUMERIC, NULL::NUMERIC, 'Operator', 60),
            (17, 'f2000001-0000-0000-0000-000000000121'::UUID, 'Engaged', 6200.00::NUMERIC, NULL::NUMERIC, 'Professional', 40),
            (18, 'f2000001-0000-0000-0000-000000000122'::UUID, 'Resolved', 31000.00::NUMERIC, 30200.00::NUMERIC, 'Professional', 25),
            (19, 'f3000002-0000-0000-0000-000000000001'::UUID, 'Lost', 4100.00::NUMERIC, NULL::NUMERIC, 'Operator', 15),
            (20, 'f3000002-0000-0000-0000-000000000002'::UUID, 'Resolved', 19500.00::NUMERIC, 20000.00::NUMERIC, 'Professional', 10)
        ) AS o(seq, assignid, status, estfee, repfee, reportedbytype, daysago)
        INNER JOIN __mj_BizAppsReferrals."ReferralAssignment" a ON a."ID" = o.assignid
        WHERE o.seq = v_seq
          AND NOT EXISTS (SELECT 1 FROM __mj_BizAppsReferrals."ReferralOutcome" ro WHERE ro."ReferralRequestID" = a."ReferralRequestID")
          AND NOT EXISTS (
            SELECT 1 FROM __mj_BizAppsReferrals."ReferralOutcome" existing
            WHERE existing."ID" = ('e3000004-0000-0000-0000-0000000000' || lpad(o.seq::TEXT, 2, '0'))::UUID
          );
    END LOOP;

    -- 9. 36 ReciprocitySnapshot rows: 18 seeded professionals (d2000001-...-0101
    --    through -0118) x the 2 canonical calendar quarters 2026-04-01..2026-06-30
    --    and 2026-07-01..2026-09-30.
    FOR v_seq IN 1..18 LOOP
        v_pro_id := ('d2000001-0000-0000-0000-000000000' || (100 + v_seq)::TEXT)::UUID;
        CONTINUE WHEN NOT EXISTS (SELECT 1 FROM __mj_BizAppsReferrals."ProfessionalProfile" WHERE "ID" = v_pro_id);

        FOR v_period_tag IN 1..2 LOOP
            IF v_period_tag = 1 THEN
                v_period_start := '2026-04-01';
                v_period_end := '2026-06-30';
            ELSE
                v_period_start := '2026-07-01';
                v_period_end := '2026-09-30';
            END IF;

            SELECT sent, received, accepted, resolved, slabreach, medianresp, fee INTO
                v_sent, v_received, v_accepted, v_resolved, v_sla_breach, v_median_resp, v_fee
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
            ) AS s(proseq, periodtag, sent, received, accepted, resolved, slabreach, medianresp, fee)
            WHERE s.proseq = v_seq AND s.periodtag = v_period_tag;

            IF NOT EXISTS (
                SELECT 1 FROM __mj_BizAppsReferrals."ReciprocitySnapshot" rs
                WHERE rs."ProfessionalProfileID" = v_pro_id
                  AND rs."PeriodStart" = v_period_start
                  AND rs."PeriodEnd" = v_period_end
            ) THEN
                INSERT INTO __mj_BizAppsReferrals."ReciprocitySnapshot"
                    ("ID","ProfessionalProfileID","ComputedAt","PeriodStart","PeriodEnd","ReferralsSent","ReferralsReceived","ReferralsAccepted","ReferralsResolved","SLABreachCount","AcceptanceRate","MedianResponseHours","AttributedFeeTotal","ReciprocityIndex")
                VALUES
                    (gen_random_uuid(), v_pro_id, NOW(), v_period_start, v_period_end, v_sent, v_received, v_accepted, v_resolved, v_sla_breach,
                     CASE WHEN v_received > 0 THEN ROUND(v_accepted::NUMERIC / v_received, 4) ELSE 0 END,
                     v_median_resp, v_fee,
                     ROUND((v_sent + 1.0) / (v_accepted + 1.0), 3)::NUMERIC(6,3));
            END IF;
        END LOOP;
    END LOOP;
END $$;
