-- ============================================================================
-- MemberJunction PostgreSQL Migration
-- BizApps Referrals - Wave 3: SLA Escalation, Outcomes & Readiness (v1.2.0)
-- Consolidated per Spec SS2.1 (exactly one migration per dialect): sections 8a-8d
-- below were folded in from the former v1.2.1 migration
-- (V202611152000__v1.2.1__Escalation_Lifecycle_And_Reciprocity_Fields.pg.sql),
-- which has been removed.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE SCHEMA IF NOT EXISTS __mj_BizAppsReferrals;
SET search_path TO __mj_BizAppsReferrals, public;
SET standard_conforming_strings = on;

-- -----------------------------------------------------------------------------
-- 1. Additive columns on "ReferralTier": escalation policy configuration
-- -----------------------------------------------------------------------------
ALTER TABLE __mj_BizAppsReferrals."ReferralTier"
    ADD COLUMN IF NOT EXISTS "EscalationWarningPercent" INT NOT NULL DEFAULT 75;
ALTER TABLE __mj_BizAppsReferrals."ReferralTier"
    ADD COLUMN IF NOT EXISTS "MaxEscalationLevel" INT NOT NULL DEFAULT 3;
ALTER TABLE __mj_BizAppsReferrals."ReferralTier"
    ADD COLUMN IF NOT EXISTS "UrgentSLAMultiplier" NUMERIC(4,2) NOT NULL DEFAULT 0.50;
ALTER TABLE __mj_BizAppsReferrals."ReferralTier"
    ADD COLUMN IF NOT EXISTS "EscalationActionType" VARCHAR(30) NOT NULL DEFAULT 'Notify';

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'CK_ReferralTier_EscalationWarningPercent') THEN
        ALTER TABLE __mj_BizAppsReferrals."ReferralTier" ADD CONSTRAINT "CK_ReferralTier_EscalationWarningPercent" CHECK ("EscalationWarningPercent" BETWEEN 1 AND 100);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'CK_ReferralTier_MaxEscalationLevel') THEN
        ALTER TABLE __mj_BizAppsReferrals."ReferralTier" ADD CONSTRAINT "CK_ReferralTier_MaxEscalationLevel" CHECK ("MaxEscalationLevel" > 0);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'CK_ReferralTier_UrgentSLAMultiplier') THEN
        ALTER TABLE __mj_BizAppsReferrals."ReferralTier" ADD CONSTRAINT "CK_ReferralTier_UrgentSLAMultiplier" CHECK ("UrgentSLAMultiplier" > 0 AND "UrgentSLAMultiplier" <= 1);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'CK_ReferralTier_EscalationActionType') THEN
        ALTER TABLE __mj_BizAppsReferrals."ReferralTier" ADD CONSTRAINT "CK_ReferralTier_EscalationActionType" CHECK ("EscalationActionType" IN ('Notify', 'Reassign', 'AdminAlert'));
    END IF;
END $$;

-- -----------------------------------------------------------------------------
-- 2. Additive columns on "ReferralRequest": source attribution & escalation state
--    (Note: "CompletedAt" already exists on this table from the v1.0.x schema.)
-- -----------------------------------------------------------------------------
ALTER TABLE __mj_BizAppsReferrals."ReferralRequest"
    ADD COLUMN IF NOT EXISTS "SourceChannel" VARCHAR(30) NOT NULL DEFAULT 'Web';
ALTER TABLE __mj_BizAppsReferrals."ReferralRequest"
    ADD COLUMN IF NOT EXISTS "ReferringProfessionalID" UUID NULL;
ALTER TABLE __mj_BizAppsReferrals."ReferralRequest"
    ADD COLUMN IF NOT EXISTS "EscalationLevel" INT NOT NULL DEFAULT 0;
ALTER TABLE __mj_BizAppsReferrals."ReferralRequest"
    ADD COLUMN IF NOT EXISTS "LastEscalatedAt" TIMESTAMPTZ NULL;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_ReferralRequest_ReferringProfessional') THEN
        ALTER TABLE __mj_BizAppsReferrals."ReferralRequest"
            ADD CONSTRAINT "FK_ReferralRequest_ReferringProfessional" FOREIGN KEY ("ReferringProfessionalID")
                REFERENCES __mj_BizAppsReferrals."ProfessionalProfile" ("ID");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'CK_ReferralRequest_SourceChannel') THEN
        ALTER TABLE __mj_BizAppsReferrals."ReferralRequest" ADD CONSTRAINT "CK_ReferralRequest_SourceChannel" CHECK ("SourceChannel" IN ('Web', 'Phone', 'Email', 'Referral', 'API'));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'CK_ReferralRequest_EscalationLevel') THEN
        ALTER TABLE __mj_BizAppsReferrals."ReferralRequest" ADD CONSTRAINT "CK_ReferralRequest_EscalationLevel" CHECK ("EscalationLevel" >= 0);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS "IX_ReferralRequest_ReferringProfessionalID"
    ON __mj_BizAppsReferrals."ReferralRequest" ("ReferringProfessionalID")
    WHERE "ReferringProfessionalID" IS NOT NULL;

-- -----------------------------------------------------------------------------
-- 3. Additive columns on "ReferralAssignment": lifecycle completion & SLA warning
-- -----------------------------------------------------------------------------
ALTER TABLE __mj_BizAppsReferrals."ReferralAssignment"
    ADD COLUMN IF NOT EXISTS "SLAWarningSentAt" TIMESTAMPTZ NULL;
ALTER TABLE __mj_BizAppsReferrals."ReferralAssignment"
    ADD COLUMN IF NOT EXISTS "ResponseHours" NUMERIC(6,2) NULL;
ALTER TABLE __mj_BizAppsReferrals."ReferralAssignment"
    ADD COLUMN IF NOT EXISTS "CompletedAt" TIMESTAMPTZ NULL;
ALTER TABLE __mj_BizAppsReferrals."ReferralAssignment"
    ADD COLUMN IF NOT EXISTS "AIRationaleJSON" TEXT NULL;

-- Widen CK_ReferralAssignment_Status to additionally allow 'InProgress' and 'Completed'
-- so the lifecycle-completion flow (MarkReferralInProgress / CompleteReferral) can
-- transition a ReferralAssignment past 'Accepted' without violating the CHECK constraint.
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'CK_ReferralAssignment_Status') THEN
        ALTER TABLE __mj_BizAppsReferrals."ReferralAssignment" DROP CONSTRAINT "CK_ReferralAssignment_Status";
    END IF;
    ALTER TABLE __mj_BizAppsReferrals."ReferralAssignment" ADD CONSTRAINT "CK_ReferralAssignment_Status" CHECK ("Status" IN (
        'Queued', 'Offered', 'Accepted', 'InProgress', 'Completed', 'Declined', 'ConflictRejected', 'Expired', 'Withdrawn'
    ));
END $$;

-- -----------------------------------------------------------------------------
-- 4. Additive columns on "ProfessionalProfile": readiness & reciprocity
-- -----------------------------------------------------------------------------
ALTER TABLE __mj_BizAppsReferrals."ProfessionalProfile"
    ADD COLUMN IF NOT EXISTS "ReadinessScore" NUMERIC(5,2) NOT NULL DEFAULT 100.00;
ALTER TABLE __mj_BizAppsReferrals."ProfessionalProfile"
    ADD COLUMN IF NOT EXISTS "ReciprocityIndex" NUMERIC(5,2) NULL;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'CK_ProfessionalProfile_ReadinessScore') THEN
        ALTER TABLE __mj_BizAppsReferrals."ProfessionalProfile" ADD CONSTRAINT "CK_ProfessionalProfile_ReadinessScore" CHECK ("ReadinessScore" BETWEEN 0 AND 100);
    END IF;
END $$;

-- -----------------------------------------------------------------------------
-- 5. New table: "ReferralEscalation"
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS __mj_BizAppsReferrals."ReferralEscalation" (
    "ID" UUID NOT NULL DEFAULT gen_random_uuid(),
    "ReferralRequestID" UUID NOT NULL,
    "ReferralAssignmentID" UUID NULL,
    "EscalationLevel" INT NOT NULL DEFAULT 1,
    "TriggerType" VARCHAR(60) NOT NULL DEFAULT 'SLAWarning',
    "Status" VARCHAR(40) NOT NULL DEFAULT 'Open',
    "RecommendedAction" VARCHAR(60) NOT NULL DEFAULT 'Notify',
    "Notes" TEXT NULL,
    "TriggeredAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "AcknowledgedAt" TIMESTAMPTZ NULL,
    "ResolvedAt" TIMESTAMPTZ NULL,
    "__mj_CreatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "__mj_UpdatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "PK_ReferralEscalation" PRIMARY KEY ("ID"),
    CONSTRAINT "FK_ReferralEscalation_Request" FOREIGN KEY ("ReferralRequestID")
        REFERENCES __mj_BizAppsReferrals."ReferralRequest" ("ID"),
    CONSTRAINT "FK_ReferralEscalation_Assignment" FOREIGN KEY ("ReferralAssignmentID")
        REFERENCES __mj_BizAppsReferrals."ReferralAssignment" ("ID"),
    CONSTRAINT "CK_ReferralEscalation_EscalationLevel" CHECK ("EscalationLevel" > 0),
    CONSTRAINT "CK_ReferralEscalation_TriggerType" CHECK ("TriggerType" IN ('SLAWarning', 'SLABreach', 'ManualEscalation', 'CapacityExhausted')),
    CONSTRAINT "CK_ReferralEscalation_Status" CHECK ("Status" IN ('Open', 'Acknowledged', 'Resolved')),
    CONSTRAINT "CK_ReferralEscalation_RecommendedAction" CHECK ("RecommendedAction" IN ('Notify', 'Reassign', 'AdminAlert', 'EscalateToTier'))
);

CREATE INDEX IF NOT EXISTS "IX_ReferralEscalation_Request" ON __mj_BizAppsReferrals."ReferralEscalation" ("ReferralRequestID");
CREATE INDEX IF NOT EXISTS "IX_ReferralEscalation_Assignment" ON __mj_BizAppsReferrals."ReferralEscalation" ("ReferralAssignmentID");
CREATE INDEX IF NOT EXISTS "IX_ReferralEscalation_Status" ON __mj_BizAppsReferrals."ReferralEscalation" ("Status");

COMMENT ON TABLE __mj_BizAppsReferrals."ReferralEscalation" IS
    'SLA warning/breach escalation events raised against a ReferralRequest or ReferralAssignment.';

-- -----------------------------------------------------------------------------
-- 6. New table: "ReferralOutcome"
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS __mj_BizAppsReferrals."ReferralOutcome" (
    "ID" UUID NOT NULL DEFAULT gen_random_uuid(),
    "ReferralRequestID" UUID NOT NULL,
    "ReferralAssignmentID" UUID NOT NULL,
    "ProfessionalProfileID" UUID NOT NULL,
    "OutcomeStatus" VARCHAR(60) NOT NULL DEFAULT 'Completed',
    "ResponseHours" NUMERIC(6,2) NULL,
    "CompletionNotes" TEXT NULL,
    "CompletedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "__mj_CreatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "__mj_UpdatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "PK_ReferralOutcome" PRIMARY KEY ("ID"),
    CONSTRAINT "UQ_ReferralOutcome_Assignment" UNIQUE ("ReferralAssignmentID"),
    CONSTRAINT "FK_ReferralOutcome_Request" FOREIGN KEY ("ReferralRequestID")
        REFERENCES __mj_BizAppsReferrals."ReferralRequest" ("ID"),
    CONSTRAINT "FK_ReferralOutcome_Assignment" FOREIGN KEY ("ReferralAssignmentID")
        REFERENCES __mj_BizAppsReferrals."ReferralAssignment" ("ID"),
    CONSTRAINT "FK_ReferralOutcome_Profile" FOREIGN KEY ("ProfessionalProfileID")
        REFERENCES __mj_BizAppsReferrals."ProfessionalProfile" ("ID"),
    CONSTRAINT "CK_ReferralOutcome_OutcomeStatus" CHECK ("OutcomeStatus" IN ('Completed', 'Cancelled', 'NoEngagement'))
);

CREATE INDEX IF NOT EXISTS "IX_ReferralOutcome_Request" ON __mj_BizAppsReferrals."ReferralOutcome" ("ReferralRequestID");
CREATE INDEX IF NOT EXISTS "IX_ReferralOutcome_Profile" ON __mj_BizAppsReferrals."ReferralOutcome" ("ProfessionalProfileID");

COMMENT ON TABLE __mj_BizAppsReferrals."ReferralOutcome" IS
    'Terminal outcome recorded when a ReferralAssignment is marked complete.';

-- -----------------------------------------------------------------------------
-- 7. New table: "ProfessionalAvailabilityWindow"
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS __mj_BizAppsReferrals."ProfessionalAvailabilityWindow" (
    "ID" UUID NOT NULL DEFAULT gen_random_uuid(),
    "ProfessionalProfileID" UUID NOT NULL,
    "WindowType" VARCHAR(40) NOT NULL DEFAULT 'Recurring',
    "DayOfWeek" INT NULL,
    "StartTimeMinutes" INT NULL,
    "EndTimeMinutes" INT NULL,
    "StartDate" TIMESTAMPTZ NULL,
    "EndDate" TIMESTAMPTZ NULL,
    "IsAvailable" BOOLEAN NOT NULL DEFAULT TRUE,
    "TimeZone" VARCHAR(100) NOT NULL DEFAULT 'UTC',
    "Notes" VARCHAR(255) NULL,
    "__mj_CreatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "__mj_UpdatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "PK_ProfessionalAvailabilityWindow" PRIMARY KEY ("ID"),
    CONSTRAINT "FK_ProfessionalAvailabilityWindow_Profile" FOREIGN KEY ("ProfessionalProfileID")
        REFERENCES __mj_BizAppsReferrals."ProfessionalProfile" ("ID"),
    CONSTRAINT "CK_ProfessionalAvailabilityWindow_WindowType" CHECK ("WindowType" IN ('Recurring', 'DateRange', 'Blackout')),
    CONSTRAINT "CK_ProfessionalAvailabilityWindow_DayOfWeek" CHECK ("DayOfWeek" IS NULL OR "DayOfWeek" BETWEEN 0 AND 6),
    CONSTRAINT "CK_ProfessionalAvailabilityWindow_StartTimeMinutes" CHECK ("StartTimeMinutes" IS NULL OR "StartTimeMinutes" BETWEEN 0 AND 1440),
    CONSTRAINT "CK_ProfessionalAvailabilityWindow_EndTimeMinutes" CHECK ("EndTimeMinutes" IS NULL OR "EndTimeMinutes" BETWEEN 0 AND 1440)
);

CREATE INDEX IF NOT EXISTS "IX_ProfessionalAvailabilityWindow_Profile" ON __mj_BizAppsReferrals."ProfessionalAvailabilityWindow" ("ProfessionalProfileID");

COMMENT ON TABLE __mj_BizAppsReferrals."ProfessionalAvailabilityWindow" IS
    'Recurring, date-range, or blackout availability windows for a ProfessionalProfile.';

-- -----------------------------------------------------------------------------
-- 8. New table: "ReciprocitySnapshot"
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS __mj_BizAppsReferrals."ReciprocitySnapshot" (
    "ID" UUID NOT NULL DEFAULT gen_random_uuid(),
    "ProfessionalProfileID" UUID NOT NULL,
    "SnapshotDate" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "PeriodStartDate" TIMESTAMPTZ NOT NULL,
    "PeriodEndDate" TIMESTAMPTZ NOT NULL,
    "ReferralsGivenCount" INT NOT NULL DEFAULT 0,
    "ReferralsReceivedCount" INT NOT NULL DEFAULT 0,
    "ReciprocityIndex" NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    "__mj_CreatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "__mj_UpdatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "PK_ReciprocitySnapshot" PRIMARY KEY ("ID"),
    CONSTRAINT "FK_ReciprocitySnapshot_Profile" FOREIGN KEY ("ProfessionalProfileID")
        REFERENCES __mj_BizAppsReferrals."ProfessionalProfile" ("ID"),
    CONSTRAINT "CK_ReciprocitySnapshot_ReferralsGivenCount" CHECK ("ReferralsGivenCount" >= 0),
    CONSTRAINT "CK_ReciprocitySnapshot_ReferralsReceivedCount" CHECK ("ReferralsReceivedCount" >= 0)
);

CREATE INDEX IF NOT EXISTS "IX_ReciprocitySnapshot_Profile_Date" ON __mj_BizAppsReferrals."ReciprocitySnapshot" ("ProfessionalProfileID", "SnapshotDate");

COMMENT ON TABLE __mj_BizAppsReferrals."ReciprocitySnapshot" IS
    'Periodic snapshot of a ProfessionalProfile referral give/receive balance used to compute ReciprocityIndex.';

-- -----------------------------------------------------------------------------
-- 8a. Additive columns on "ReferralEscalation": dedup, notifier linkage, resolution
--     audit (consolidated from the former v1.2.1 migration per Spec SS2.1 - exactly
--     one migration per dialect).
-- -----------------------------------------------------------------------------
ALTER TABLE __mj_BizAppsReferrals."ReferralEscalation"
    ADD COLUMN IF NOT EXISTS "DedupKey" VARCHAR(200) NULL;
ALTER TABLE __mj_BizAppsReferrals."ReferralEscalation"
    ADD COLUMN IF NOT EXISTS "LinkedTaskID" UUID NULL;
ALTER TABLE __mj_BizAppsReferrals."ReferralEscalation"
    ADD COLUMN IF NOT EXISTS "AcknowledgedByPersonID" UUID NULL;
ALTER TABLE __mj_BizAppsReferrals."ReferralEscalation"
    ADD COLUMN IF NOT EXISTS "ResolvedByPersonID" UUID NULL;
ALTER TABLE __mj_BizAppsReferrals."ReferralEscalation"
    ADD COLUMN IF NOT EXISTS "ResolutionNotes" TEXT NULL;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_ReferralEscalation_AcknowledgedByPerson') THEN
        ALTER TABLE __mj_BizAppsReferrals."ReferralEscalation"
            ADD CONSTRAINT "FK_ReferralEscalation_AcknowledgedByPerson" FOREIGN KEY ("AcknowledgedByPersonID")
                REFERENCES __mj_BizAppsCommon."Person" ("ID");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_ReferralEscalation_ResolvedByPerson') THEN
        ALTER TABLE __mj_BizAppsReferrals."ReferralEscalation"
            ADD CONSTRAINT "FK_ReferralEscalation_ResolvedByPerson" FOREIGN KEY ("ResolvedByPersonID")
                REFERENCES __mj_BizAppsCommon."Person" ("ID");
    END IF;

    -- Widen CK_ReferralEscalation_TriggerType to add 'UrgentUnassigned' and 'CascadeExhausted' (6 total)
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'CK_ReferralEscalation_TriggerType') THEN
        ALTER TABLE __mj_BizAppsReferrals."ReferralEscalation" DROP CONSTRAINT "CK_ReferralEscalation_TriggerType";
    END IF;
    ALTER TABLE __mj_BizAppsReferrals."ReferralEscalation" ADD CONSTRAINT "CK_ReferralEscalation_TriggerType" CHECK ("TriggerType" IN (
        'SLAWarning', 'SLABreach', 'ManualEscalation', 'CapacityExhausted', 'UrgentUnassigned', 'CascadeExhausted'
    ));

    -- Widen CK_ReferralEscalation_Status to add 'Dismissed' (4 total)
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'CK_ReferralEscalation_Status') THEN
        ALTER TABLE __mj_BizAppsReferrals."ReferralEscalation" DROP CONSTRAINT "CK_ReferralEscalation_Status";
    END IF;
    ALTER TABLE __mj_BizAppsReferrals."ReferralEscalation" ADD CONSTRAINT "CK_ReferralEscalation_Status" CHECK ("Status" IN (
        'Open', 'Acknowledged', 'Resolved', 'Dismissed'
    ));
END $$;

CREATE INDEX IF NOT EXISTS "IX_ReferralEscalation_DedupKey"
    ON __mj_BizAppsReferrals."ReferralEscalation" ("DedupKey")
    WHERE "DedupKey" IS NOT NULL;

-- -----------------------------------------------------------------------------
-- 8b. Additive column on "ReferralOutcome": attributed fee value for reciprocity scorecards
-- -----------------------------------------------------------------------------
ALTER TABLE __mj_BizAppsReferrals."ReferralOutcome"
    ADD COLUMN IF NOT EXISTS "FeeAmount" NUMERIC(10,2) NULL;

-- -----------------------------------------------------------------------------
-- 8c. Additive columns on "ReciprocitySnapshot": full scorecard metrics
-- -----------------------------------------------------------------------------
ALTER TABLE __mj_BizAppsReferrals."ReciprocitySnapshot"
    ADD COLUMN IF NOT EXISTS "AcceptedCount" INT NOT NULL DEFAULT 0;
ALTER TABLE __mj_BizAppsReferrals."ReciprocitySnapshot"
    ADD COLUMN IF NOT EXISTS "ResolvedCount" INT NOT NULL DEFAULT 0;
ALTER TABLE __mj_BizAppsReferrals."ReciprocitySnapshot"
    ADD COLUMN IF NOT EXISTS "SLABreachCount" INT NOT NULL DEFAULT 0;
ALTER TABLE __mj_BizAppsReferrals."ReciprocitySnapshot"
    ADD COLUMN IF NOT EXISTS "AcceptanceRate" NUMERIC(5,2) NOT NULL DEFAULT 0;
ALTER TABLE __mj_BizAppsReferrals."ReciprocitySnapshot"
    ADD COLUMN IF NOT EXISTS "MedianResponseHours" NUMERIC(6,2) NULL;
ALTER TABLE __mj_BizAppsReferrals."ReciprocitySnapshot"
    ADD COLUMN IF NOT EXISTS "AttributedFeeTotal" NUMERIC(12,2) NOT NULL DEFAULT 0;

CREATE UNIQUE INDEX IF NOT EXISTS "UQ_ReciprocitySnapshot_Profile_Period"
    ON __mj_BizAppsReferrals."ReciprocitySnapshot" ("ProfessionalProfileID", "PeriodStartDate", "PeriodEndDate");

-- -----------------------------------------------------------------------------
-- 8d. Additive column on "ProfessionalProfile": readiness computation timestamp
-- -----------------------------------------------------------------------------
ALTER TABLE __mj_BizAppsReferrals."ProfessionalProfile"
    ADD COLUMN IF NOT EXISTS "ReadinessComputedAt" TIMESTAMPTZ NULL;

-- -----------------------------------------------------------------------------
-- 9. Base views & CRUD functions for the 4 new Wave 3 Slice 1 tables
--    (Hand-authored to mirror the exact MJ CodeGen PostgreSQL output pattern,
--    consistent with the Wave 2 "ProfessionalCredential" precedent in this file.)
-- -----------------------------------------------------------------------------

CREATE OR REPLACE VIEW __mj_BizAppsReferrals."vwReferralEscalations" AS
SELECT c.* FROM __mj_BizAppsReferrals."ReferralEscalation" AS c;
DO $$ BEGIN GRANT SELECT ON __mj_BizAppsReferrals."vwReferralEscalations" TO "cdp_UI", "cdp_Developer", "cdp_Integration"; EXCEPTION WHEN others THEN NULL; END $$;

CREATE OR REPLACE FUNCTION __mj_BizAppsReferrals."spCreateReferralEscalation"(
    IN p_ID UUID DEFAULT NULL,
    IN p_ReferralRequestID UUID DEFAULT NULL,
    IN p_ReferralAssignmentID UUID DEFAULT NULL,
    IN p_EscalationLevel INT DEFAULT NULL,
    IN p_TriggerType VARCHAR(60) DEFAULT NULL,
    IN p_Status VARCHAR(40) DEFAULT NULL,
    IN p_RecommendedAction VARCHAR(60) DEFAULT NULL,
    IN p_Notes_Clear BOOLEAN DEFAULT FALSE,
    IN p_Notes TEXT DEFAULT NULL,
    IN p_TriggeredAt TIMESTAMPTZ DEFAULT NULL,
    IN p_AcknowledgedAt_Clear BOOLEAN DEFAULT FALSE,
    IN p_AcknowledgedAt TIMESTAMPTZ DEFAULT NULL,
    IN p_ResolvedAt_Clear BOOLEAN DEFAULT FALSE,
    IN p_ResolvedAt TIMESTAMPTZ DEFAULT NULL
)
RETURNS SETOF __mj_BizAppsReferrals."vwReferralEscalations" AS
$$
DECLARE
    v_new_id UUID;
BEGIN
    v_new_id := COALESCE(p_ID, gen_random_uuid());
    INSERT INTO __mj_BizAppsReferrals."ReferralEscalation" (
        "ID", "ReferralRequestID", "ReferralAssignmentID", "EscalationLevel", "TriggerType",
        "Status", "RecommendedAction", "Notes", "TriggeredAt", "AcknowledgedAt", "ResolvedAt"
    ) VALUES (
        v_new_id,
        p_ReferralRequestID,
        p_ReferralAssignmentID,
        COALESCE(p_EscalationLevel, 1),
        COALESCE(p_TriggerType, 'SLAWarning'),
        COALESCE(p_Status, 'Open'),
        COALESCE(p_RecommendedAction, 'Notify'),
        CASE WHEN p_Notes_Clear THEN NULL ELSE p_Notes END,
        COALESCE(p_TriggeredAt, NOW()),
        CASE WHEN p_AcknowledgedAt_Clear THEN NULL ELSE p_AcknowledgedAt END,
        CASE WHEN p_ResolvedAt_Clear THEN NULL ELSE p_ResolvedAt END
    );
    RETURN QUERY SELECT * FROM __mj_BizAppsReferrals."vwReferralEscalations" WHERE "ID" = v_new_id;
END;
$$ LANGUAGE plpgsql;
DO $$ BEGIN GRANT EXECUTE ON FUNCTION __mj_BizAppsReferrals."spCreateReferralEscalation" TO "cdp_Developer", "cdp_Integration"; EXCEPTION WHEN others THEN NULL; END $$;

CREATE OR REPLACE FUNCTION __mj_BizAppsReferrals."spUpdateReferralEscalation"(
    IN p_ID UUID,
    IN p_ReferralRequestID UUID DEFAULT NULL,
    IN p_ReferralAssignmentID UUID DEFAULT NULL,
    IN p_EscalationLevel INT DEFAULT NULL,
    IN p_TriggerType VARCHAR(60) DEFAULT NULL,
    IN p_Status VARCHAR(40) DEFAULT NULL,
    IN p_RecommendedAction VARCHAR(60) DEFAULT NULL,
    IN p_Notes_Clear BOOLEAN DEFAULT FALSE,
    IN p_Notes TEXT DEFAULT NULL,
    IN p_AcknowledgedAt_Clear BOOLEAN DEFAULT FALSE,
    IN p_AcknowledgedAt TIMESTAMPTZ DEFAULT NULL,
    IN p_ResolvedAt_Clear BOOLEAN DEFAULT FALSE,
    IN p_ResolvedAt TIMESTAMPTZ DEFAULT NULL
)
RETURNS SETOF __mj_BizAppsReferrals."vwReferralEscalations" AS
$$
BEGIN
    UPDATE __mj_BizAppsReferrals."ReferralEscalation" SET
        "ReferralRequestID" = COALESCE(p_ReferralRequestID, "ReferralRequestID"),
        "ReferralAssignmentID" = COALESCE(p_ReferralAssignmentID, "ReferralAssignmentID"),
        "EscalationLevel" = COALESCE(p_EscalationLevel, "EscalationLevel"),
        "TriggerType" = COALESCE(p_TriggerType, "TriggerType"),
        "Status" = COALESCE(p_Status, "Status"),
        "RecommendedAction" = COALESCE(p_RecommendedAction, "RecommendedAction"),
        "Notes" = CASE WHEN p_Notes_Clear THEN NULL ELSE COALESCE(p_Notes, "Notes") END,
        "AcknowledgedAt" = CASE WHEN p_AcknowledgedAt_Clear THEN NULL ELSE COALESCE(p_AcknowledgedAt, "AcknowledgedAt") END,
        "ResolvedAt" = CASE WHEN p_ResolvedAt_Clear THEN NULL ELSE COALESCE(p_ResolvedAt, "ResolvedAt") END,
        "__mj_UpdatedAt" = NOW()
    WHERE "ID" = p_ID;
    RETURN QUERY SELECT * FROM __mj_BizAppsReferrals."vwReferralEscalations" WHERE "ID" = p_ID;
END;
$$ LANGUAGE plpgsql;
DO $$ BEGIN GRANT EXECUTE ON FUNCTION __mj_BizAppsReferrals."spUpdateReferralEscalation" TO "cdp_Developer", "cdp_Integration"; EXCEPTION WHEN others THEN NULL; END $$;

CREATE OR REPLACE FUNCTION __mj_BizAppsReferrals."spDeleteReferralEscalation"(IN p_ID UUID)
RETURNS TABLE("ID" UUID) AS
$$
BEGIN
    DELETE FROM __mj_BizAppsReferrals."ReferralEscalation" WHERE "ID" = p_ID;
    IF FOUND THEN
        RETURN QUERY SELECT p_ID;
    END IF;
END;
$$ LANGUAGE plpgsql;
DO $$ BEGIN GRANT EXECUTE ON FUNCTION __mj_BizAppsReferrals."spDeleteReferralEscalation" TO "cdp_Developer", "cdp_Integration"; EXCEPTION WHEN others THEN NULL; END $$;


CREATE OR REPLACE VIEW __mj_BizAppsReferrals."vwReferralOutcomes" AS
SELECT c.* FROM __mj_BizAppsReferrals."ReferralOutcome" AS c;
DO $$ BEGIN GRANT SELECT ON __mj_BizAppsReferrals."vwReferralOutcomes" TO "cdp_UI", "cdp_Developer", "cdp_Integration"; EXCEPTION WHEN others THEN NULL; END $$;

CREATE OR REPLACE FUNCTION __mj_BizAppsReferrals."spCreateReferralOutcome"(
    IN p_ID UUID DEFAULT NULL,
    IN p_ReferralRequestID UUID DEFAULT NULL,
    IN p_ReferralAssignmentID UUID DEFAULT NULL,
    IN p_ProfessionalProfileID UUID DEFAULT NULL,
    IN p_OutcomeStatus VARCHAR(60) DEFAULT NULL,
    IN p_ResponseHours_Clear BOOLEAN DEFAULT FALSE,
    IN p_ResponseHours NUMERIC(6,2) DEFAULT NULL,
    IN p_CompletionNotes_Clear BOOLEAN DEFAULT FALSE,
    IN p_CompletionNotes TEXT DEFAULT NULL,
    IN p_CompletedAt TIMESTAMPTZ DEFAULT NULL
)
RETURNS SETOF __mj_BizAppsReferrals."vwReferralOutcomes" AS
$$
DECLARE
    v_new_id UUID;
BEGIN
    v_new_id := COALESCE(p_ID, gen_random_uuid());
    INSERT INTO __mj_BizAppsReferrals."ReferralOutcome" (
        "ID", "ReferralRequestID", "ReferralAssignmentID", "ProfessionalProfileID",
        "OutcomeStatus", "ResponseHours", "CompletionNotes", "CompletedAt"
    ) VALUES (
        v_new_id,
        p_ReferralRequestID,
        p_ReferralAssignmentID,
        p_ProfessionalProfileID,
        COALESCE(p_OutcomeStatus, 'Completed'),
        CASE WHEN p_ResponseHours_Clear THEN NULL ELSE p_ResponseHours END,
        CASE WHEN p_CompletionNotes_Clear THEN NULL ELSE p_CompletionNotes END,
        COALESCE(p_CompletedAt, NOW())
    );
    RETURN QUERY SELECT * FROM __mj_BizAppsReferrals."vwReferralOutcomes" WHERE "ID" = v_new_id;
END;
$$ LANGUAGE plpgsql;
DO $$ BEGIN GRANT EXECUTE ON FUNCTION __mj_BizAppsReferrals."spCreateReferralOutcome" TO "cdp_Developer", "cdp_Integration"; EXCEPTION WHEN others THEN NULL; END $$;

CREATE OR REPLACE FUNCTION __mj_BizAppsReferrals."spUpdateReferralOutcome"(
    IN p_ID UUID,
    IN p_ReferralRequestID UUID DEFAULT NULL,
    IN p_ReferralAssignmentID UUID DEFAULT NULL,
    IN p_ProfessionalProfileID UUID DEFAULT NULL,
    IN p_OutcomeStatus VARCHAR(60) DEFAULT NULL,
    IN p_ResponseHours_Clear BOOLEAN DEFAULT FALSE,
    IN p_ResponseHours NUMERIC(6,2) DEFAULT NULL,
    IN p_CompletionNotes_Clear BOOLEAN DEFAULT FALSE,
    IN p_CompletionNotes TEXT DEFAULT NULL
)
RETURNS SETOF __mj_BizAppsReferrals."vwReferralOutcomes" AS
$$
BEGIN
    UPDATE __mj_BizAppsReferrals."ReferralOutcome" SET
        "ReferralRequestID" = COALESCE(p_ReferralRequestID, "ReferralRequestID"),
        "ReferralAssignmentID" = COALESCE(p_ReferralAssignmentID, "ReferralAssignmentID"),
        "ProfessionalProfileID" = COALESCE(p_ProfessionalProfileID, "ProfessionalProfileID"),
        "OutcomeStatus" = COALESCE(p_OutcomeStatus, "OutcomeStatus"),
        "ResponseHours" = CASE WHEN p_ResponseHours_Clear THEN NULL ELSE COALESCE(p_ResponseHours, "ResponseHours") END,
        "CompletionNotes" = CASE WHEN p_CompletionNotes_Clear THEN NULL ELSE COALESCE(p_CompletionNotes, "CompletionNotes") END,
        "__mj_UpdatedAt" = NOW()
    WHERE "ID" = p_ID;
    RETURN QUERY SELECT * FROM __mj_BizAppsReferrals."vwReferralOutcomes" WHERE "ID" = p_ID;
END;
$$ LANGUAGE plpgsql;
DO $$ BEGIN GRANT EXECUTE ON FUNCTION __mj_BizAppsReferrals."spUpdateReferralOutcome" TO "cdp_Developer", "cdp_Integration"; EXCEPTION WHEN others THEN NULL; END $$;

CREATE OR REPLACE FUNCTION __mj_BizAppsReferrals."spDeleteReferralOutcome"(IN p_ID UUID)
RETURNS TABLE("ID" UUID) AS
$$
BEGIN
    DELETE FROM __mj_BizAppsReferrals."ReferralOutcome" WHERE "ID" = p_ID;
    IF FOUND THEN
        RETURN QUERY SELECT p_ID;
    END IF;
END;
$$ LANGUAGE plpgsql;
DO $$ BEGIN GRANT EXECUTE ON FUNCTION __mj_BizAppsReferrals."spDeleteReferralOutcome" TO "cdp_Developer", "cdp_Integration"; EXCEPTION WHEN others THEN NULL; END $$;


CREATE OR REPLACE VIEW __mj_BizAppsReferrals."vwProfessionalAvailabilityWindows" AS
SELECT c.* FROM __mj_BizAppsReferrals."ProfessionalAvailabilityWindow" AS c;
DO $$ BEGIN GRANT SELECT ON __mj_BizAppsReferrals."vwProfessionalAvailabilityWindows" TO "cdp_UI", "cdp_Developer", "cdp_Integration"; EXCEPTION WHEN others THEN NULL; END $$;

CREATE OR REPLACE FUNCTION __mj_BizAppsReferrals."spCreateProfessionalAvailabilityWindow"(
    IN p_ID UUID DEFAULT NULL,
    IN p_ProfessionalProfileID UUID DEFAULT NULL,
    IN p_WindowType VARCHAR(40) DEFAULT NULL,
    IN p_DayOfWeek_Clear BOOLEAN DEFAULT FALSE,
    IN p_DayOfWeek INT DEFAULT NULL,
    IN p_StartTimeMinutes_Clear BOOLEAN DEFAULT FALSE,
    IN p_StartTimeMinutes INT DEFAULT NULL,
    IN p_EndTimeMinutes_Clear BOOLEAN DEFAULT FALSE,
    IN p_EndTimeMinutes INT DEFAULT NULL,
    IN p_StartDate_Clear BOOLEAN DEFAULT FALSE,
    IN p_StartDate TIMESTAMPTZ DEFAULT NULL,
    IN p_EndDate_Clear BOOLEAN DEFAULT FALSE,
    IN p_EndDate TIMESTAMPTZ DEFAULT NULL,
    IN p_IsAvailable BOOLEAN DEFAULT NULL,
    IN p_TimeZone VARCHAR(100) DEFAULT NULL,
    IN p_Notes_Clear BOOLEAN DEFAULT FALSE,
    IN p_Notes VARCHAR(255) DEFAULT NULL
)
RETURNS SETOF __mj_BizAppsReferrals."vwProfessionalAvailabilityWindows" AS
$$
DECLARE
    v_new_id UUID;
BEGIN
    v_new_id := COALESCE(p_ID, gen_random_uuid());
    INSERT INTO __mj_BizAppsReferrals."ProfessionalAvailabilityWindow" (
        "ID", "ProfessionalProfileID", "WindowType", "DayOfWeek", "StartTimeMinutes", "EndTimeMinutes",
        "StartDate", "EndDate", "IsAvailable", "TimeZone", "Notes"
    ) VALUES (
        v_new_id,
        p_ProfessionalProfileID,
        COALESCE(p_WindowType, 'Recurring'),
        CASE WHEN p_DayOfWeek_Clear THEN NULL ELSE p_DayOfWeek END,
        CASE WHEN p_StartTimeMinutes_Clear THEN NULL ELSE p_StartTimeMinutes END,
        CASE WHEN p_EndTimeMinutes_Clear THEN NULL ELSE p_EndTimeMinutes END,
        CASE WHEN p_StartDate_Clear THEN NULL ELSE p_StartDate END,
        CASE WHEN p_EndDate_Clear THEN NULL ELSE p_EndDate END,
        COALESCE(p_IsAvailable, TRUE),
        COALESCE(p_TimeZone, 'UTC'),
        CASE WHEN p_Notes_Clear THEN NULL ELSE p_Notes END
    );
    RETURN QUERY SELECT * FROM __mj_BizAppsReferrals."vwProfessionalAvailabilityWindows" WHERE "ID" = v_new_id;
END;
$$ LANGUAGE plpgsql;
DO $$ BEGIN GRANT EXECUTE ON FUNCTION __mj_BizAppsReferrals."spCreateProfessionalAvailabilityWindow" TO "cdp_Developer", "cdp_Integration"; EXCEPTION WHEN others THEN NULL; END $$;

CREATE OR REPLACE FUNCTION __mj_BizAppsReferrals."spUpdateProfessionalAvailabilityWindow"(
    IN p_ID UUID,
    IN p_ProfessionalProfileID UUID DEFAULT NULL,
    IN p_WindowType VARCHAR(40) DEFAULT NULL,
    IN p_DayOfWeek_Clear BOOLEAN DEFAULT FALSE,
    IN p_DayOfWeek INT DEFAULT NULL,
    IN p_StartTimeMinutes_Clear BOOLEAN DEFAULT FALSE,
    IN p_StartTimeMinutes INT DEFAULT NULL,
    IN p_EndTimeMinutes_Clear BOOLEAN DEFAULT FALSE,
    IN p_EndTimeMinutes INT DEFAULT NULL,
    IN p_StartDate_Clear BOOLEAN DEFAULT FALSE,
    IN p_StartDate TIMESTAMPTZ DEFAULT NULL,
    IN p_EndDate_Clear BOOLEAN DEFAULT FALSE,
    IN p_EndDate TIMESTAMPTZ DEFAULT NULL,
    IN p_IsAvailable BOOLEAN DEFAULT NULL,
    IN p_TimeZone VARCHAR(100) DEFAULT NULL,
    IN p_Notes_Clear BOOLEAN DEFAULT FALSE,
    IN p_Notes VARCHAR(255) DEFAULT NULL
)
RETURNS SETOF __mj_BizAppsReferrals."vwProfessionalAvailabilityWindows" AS
$$
BEGIN
    UPDATE __mj_BizAppsReferrals."ProfessionalAvailabilityWindow" SET
        "ProfessionalProfileID" = COALESCE(p_ProfessionalProfileID, "ProfessionalProfileID"),
        "WindowType" = COALESCE(p_WindowType, "WindowType"),
        "DayOfWeek" = CASE WHEN p_DayOfWeek_Clear THEN NULL ELSE COALESCE(p_DayOfWeek, "DayOfWeek") END,
        "StartTimeMinutes" = CASE WHEN p_StartTimeMinutes_Clear THEN NULL ELSE COALESCE(p_StartTimeMinutes, "StartTimeMinutes") END,
        "EndTimeMinutes" = CASE WHEN p_EndTimeMinutes_Clear THEN NULL ELSE COALESCE(p_EndTimeMinutes, "EndTimeMinutes") END,
        "StartDate" = CASE WHEN p_StartDate_Clear THEN NULL ELSE COALESCE(p_StartDate, "StartDate") END,
        "EndDate" = CASE WHEN p_EndDate_Clear THEN NULL ELSE COALESCE(p_EndDate, "EndDate") END,
        "IsAvailable" = COALESCE(p_IsAvailable, "IsAvailable"),
        "TimeZone" = COALESCE(p_TimeZone, "TimeZone"),
        "Notes" = CASE WHEN p_Notes_Clear THEN NULL ELSE COALESCE(p_Notes, "Notes") END,
        "__mj_UpdatedAt" = NOW()
    WHERE "ID" = p_ID;
    RETURN QUERY SELECT * FROM __mj_BizAppsReferrals."vwProfessionalAvailabilityWindows" WHERE "ID" = p_ID;
END;
$$ LANGUAGE plpgsql;
DO $$ BEGIN GRANT EXECUTE ON FUNCTION __mj_BizAppsReferrals."spUpdateProfessionalAvailabilityWindow" TO "cdp_Developer", "cdp_Integration"; EXCEPTION WHEN others THEN NULL; END $$;

CREATE OR REPLACE FUNCTION __mj_BizAppsReferrals."spDeleteProfessionalAvailabilityWindow"(IN p_ID UUID)
RETURNS TABLE("ID" UUID) AS
$$
BEGIN
    DELETE FROM __mj_BizAppsReferrals."ProfessionalAvailabilityWindow" WHERE "ID" = p_ID;
    IF FOUND THEN
        RETURN QUERY SELECT p_ID;
    END IF;
END;
$$ LANGUAGE plpgsql;
DO $$ BEGIN GRANT EXECUTE ON FUNCTION __mj_BizAppsReferrals."spDeleteProfessionalAvailabilityWindow" TO "cdp_Developer", "cdp_Integration"; EXCEPTION WHEN others THEN NULL; END $$;


CREATE OR REPLACE VIEW __mj_BizAppsReferrals."vwReciprocitySnapshots" AS
SELECT c.* FROM __mj_BizAppsReferrals."ReciprocitySnapshot" AS c;
DO $$ BEGIN GRANT SELECT ON __mj_BizAppsReferrals."vwReciprocitySnapshots" TO "cdp_UI", "cdp_Developer", "cdp_Integration"; EXCEPTION WHEN others THEN NULL; END $$;

CREATE OR REPLACE FUNCTION __mj_BizAppsReferrals."spCreateReciprocitySnapshot"(
    IN p_ID UUID DEFAULT NULL,
    IN p_ProfessionalProfileID UUID DEFAULT NULL,
    IN p_SnapshotDate TIMESTAMPTZ DEFAULT NULL,
    IN p_PeriodStartDate TIMESTAMPTZ DEFAULT NULL,
    IN p_PeriodEndDate TIMESTAMPTZ DEFAULT NULL,
    IN p_ReferralsGivenCount INT DEFAULT NULL,
    IN p_ReferralsReceivedCount INT DEFAULT NULL,
    IN p_ReciprocityIndex NUMERIC(5,2) DEFAULT NULL
)
RETURNS SETOF __mj_BizAppsReferrals."vwReciprocitySnapshots" AS
$$
DECLARE
    v_new_id UUID;
BEGIN
    v_new_id := COALESCE(p_ID, gen_random_uuid());
    INSERT INTO __mj_BizAppsReferrals."ReciprocitySnapshot" (
        "ID", "ProfessionalProfileID", "SnapshotDate", "PeriodStartDate", "PeriodEndDate",
        "ReferralsGivenCount", "ReferralsReceivedCount", "ReciprocityIndex"
    ) VALUES (
        v_new_id,
        p_ProfessionalProfileID,
        COALESCE(p_SnapshotDate, NOW()),
        p_PeriodStartDate,
        p_PeriodEndDate,
        COALESCE(p_ReferralsGivenCount, 0),
        COALESCE(p_ReferralsReceivedCount, 0),
        COALESCE(p_ReciprocityIndex, 0.00)
    );
    RETURN QUERY SELECT * FROM __mj_BizAppsReferrals."vwReciprocitySnapshots" WHERE "ID" = v_new_id;
END;
$$ LANGUAGE plpgsql;
DO $$ BEGIN GRANT EXECUTE ON FUNCTION __mj_BizAppsReferrals."spCreateReciprocitySnapshot" TO "cdp_Developer", "cdp_Integration"; EXCEPTION WHEN others THEN NULL; END $$;

CREATE OR REPLACE FUNCTION __mj_BizAppsReferrals."spUpdateReciprocitySnapshot"(
    IN p_ID UUID,
    IN p_ProfessionalProfileID UUID DEFAULT NULL,
    IN p_SnapshotDate TIMESTAMPTZ DEFAULT NULL,
    IN p_PeriodStartDate TIMESTAMPTZ DEFAULT NULL,
    IN p_PeriodEndDate TIMESTAMPTZ DEFAULT NULL,
    IN p_ReferralsGivenCount INT DEFAULT NULL,
    IN p_ReferralsReceivedCount INT DEFAULT NULL,
    IN p_ReciprocityIndex NUMERIC(5,2) DEFAULT NULL
)
RETURNS SETOF __mj_BizAppsReferrals."vwReciprocitySnapshots" AS
$$
BEGIN
    UPDATE __mj_BizAppsReferrals."ReciprocitySnapshot" SET
        "ProfessionalProfileID" = COALESCE(p_ProfessionalProfileID, "ProfessionalProfileID"),
        "SnapshotDate" = COALESCE(p_SnapshotDate, "SnapshotDate"),
        "PeriodStartDate" = COALESCE(p_PeriodStartDate, "PeriodStartDate"),
        "PeriodEndDate" = COALESCE(p_PeriodEndDate, "PeriodEndDate"),
        "ReferralsGivenCount" = COALESCE(p_ReferralsGivenCount, "ReferralsGivenCount"),
        "ReferralsReceivedCount" = COALESCE(p_ReferralsReceivedCount, "ReferralsReceivedCount"),
        "ReciprocityIndex" = COALESCE(p_ReciprocityIndex, "ReciprocityIndex"),
        "__mj_UpdatedAt" = NOW()
    WHERE "ID" = p_ID;
    RETURN QUERY SELECT * FROM __mj_BizAppsReferrals."vwReciprocitySnapshots" WHERE "ID" = p_ID;
END;
$$ LANGUAGE plpgsql;
DO $$ BEGIN GRANT EXECUTE ON FUNCTION __mj_BizAppsReferrals."spUpdateReciprocitySnapshot" TO "cdp_Developer", "cdp_Integration"; EXCEPTION WHEN others THEN NULL; END $$;

CREATE OR REPLACE FUNCTION __mj_BizAppsReferrals."spDeleteReciprocitySnapshot"(IN p_ID UUID)
RETURNS TABLE("ID" UUID) AS
$$
BEGIN
    DELETE FROM __mj_BizAppsReferrals."ReciprocitySnapshot" WHERE "ID" = p_ID;
    IF FOUND THEN
        RETURN QUERY SELECT p_ID;
    END IF;
END;
$$ LANGUAGE plpgsql;
DO $$ BEGIN GRANT EXECUTE ON FUNCTION __mj_BizAppsReferrals."spDeleteReciprocitySnapshot" TO "cdp_Developer", "cdp_Integration"; EXCEPTION WHEN others THEN NULL; END $$;
