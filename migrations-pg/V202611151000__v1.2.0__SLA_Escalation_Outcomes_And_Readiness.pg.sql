-- ============================================================================
-- MemberJunction PostgreSQL Migration
-- BizApps Referrals - Wave 3: SLA Escalation, Outcomes & Readiness (v1.2.0)
-- Consolidated per Spec SS2.1 (exactly one migration per dialect): sections 8a-8d
-- below were folded in from the former v1.2.1 migration
-- (V202611152000__v1.2.1__Escalation_Lifecycle_And_Reciprocity_Fields.pg.sql),
-- which has been removed. Remediation Round 2 (Spec SS2.2/SS2.3) further
-- consolidated every two-step "add then widen" ALTER sequence into a single
-- final-shape statement, since no deployed database has applied this migration.
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
    ADD COLUMN IF NOT EXISTS "MaxEscalationLevel" INT NOT NULL DEFAULT 2;
ALTER TABLE __mj_BizAppsReferrals."ReferralTier"
    ADD COLUMN IF NOT EXISTS "UrgentSLAMultiplier" NUMERIC(4,2) NOT NULL DEFAULT 0.50;
-- "EscalationActionType" is intentionally kept nullable with NO CHECK constraint
-- (non-spec/optional per Spec SS2.2) so that pre-existing seed metadata
-- (metadata/referral-tiers/.referrals-tiers.json) using legacy values is never
-- rejected by a constraint violation.
ALTER TABLE __mj_BizAppsReferrals."ReferralTier"
    ADD COLUMN IF NOT EXISTS "EscalationActionType" VARCHAR(30) NULL;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'CK_ReferralTier_EscalationActionType') THEN
        ALTER TABLE __mj_BizAppsReferrals."ReferralTier" DROP CONSTRAINT "CK_ReferralTier_EscalationActionType";
    END IF;
    ALTER TABLE __mj_BizAppsReferrals."ReferralTier" ALTER COLUMN "EscalationActionType" DROP DEFAULT;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'CK_ReferralTier_EscalationWarningPercent') THEN
        ALTER TABLE __mj_BizAppsReferrals."ReferralTier" ADD CONSTRAINT "CK_ReferralTier_EscalationWarningPercent" CHECK ("EscalationWarningPercent" BETWEEN 1 AND 99);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'CK_ReferralTier_MaxEscalationLevel') THEN
        ALTER TABLE __mj_BizAppsReferrals."ReferralTier" ADD CONSTRAINT "CK_ReferralTier_MaxEscalationLevel" CHECK ("MaxEscalationLevel" BETWEEN 1 AND 3);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'CK_ReferralTier_UrgentSLAMultiplier') THEN
        ALTER TABLE __mj_BizAppsReferrals."ReferralTier" ADD CONSTRAINT "CK_ReferralTier_UrgentSLAMultiplier" CHECK ("UrgentSLAMultiplier" > 0 AND "UrgentSLAMultiplier" <= 1);
    END IF;
END $$;

-- -----------------------------------------------------------------------------
-- 2. Additive columns on "ReferralRequest": source attribution & escalation state
--    (Note: "CompletedAt" already exists on this table from the v1.0.x schema.)
-- -----------------------------------------------------------------------------
ALTER TABLE __mj_BizAppsReferrals."ReferralRequest"
    ADD COLUMN IF NOT EXISTS "SourceChannel" VARCHAR(30) NOT NULL DEFAULT 'SeekerIntake';
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
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'CK_ReferralRequest_SourceChannel') THEN
        ALTER TABLE __mj_BizAppsReferrals."ReferralRequest" DROP CONSTRAINT "CK_ReferralRequest_SourceChannel";
    END IF;
    ALTER TABLE __mj_BizAppsReferrals."ReferralRequest" ADD CONSTRAINT "CK_ReferralRequest_SourceChannel" CHECK ("SourceChannel" IN (
        'SeekerIntake', 'FinderWidget', 'ProReferral', 'Concierge', 'OperatorManual'
    ));
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
    ADD COLUMN IF NOT EXISTS "ResponseHours" NUMERIC(8,2) NULL;
ALTER TABLE __mj_BizAppsReferrals."ReferralAssignment"
    ADD COLUMN IF NOT EXISTS "CompletedAt" TIMESTAMPTZ NULL;
ALTER TABLE __mj_BizAppsReferrals."ReferralAssignment"
    ADD COLUMN IF NOT EXISTS "AIRationaleJSON" TEXT NULL;

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
    ADD COLUMN IF NOT EXISTS "ReadinessScore" NUMERIC(5,2) NULL;
ALTER TABLE __mj_BizAppsReferrals."ProfessionalProfile"
    ADD COLUMN IF NOT EXISTS "ReciprocityIndex" NUMERIC(6,3) NULL;
ALTER TABLE __mj_BizAppsReferrals."ProfessionalProfile"
    ADD COLUMN IF NOT EXISTS "ReadinessComputedAt" TIMESTAMPTZ NULL;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'CK_ProfessionalProfile_ReadinessScore') THEN
        ALTER TABLE __mj_BizAppsReferrals."ProfessionalProfile" DROP CONSTRAINT "CK_ProfessionalProfile_ReadinessScore";
    END IF;
    ALTER TABLE __mj_BizAppsReferrals."ProfessionalProfile" ADD CONSTRAINT "CK_ProfessionalProfile_ReadinessScore" CHECK ("ReadinessScore" IS NULL OR "ReadinessScore" BETWEEN 0 AND 100);
    ALTER TABLE __mj_BizAppsReferrals."ProfessionalProfile" ALTER COLUMN "ReadinessScore" DROP DEFAULT;
    ALTER TABLE __mj_BizAppsReferrals."ProfessionalProfile" ALTER COLUMN "ReciprocityIndex" TYPE NUMERIC(6,3);
END $$;

-- -----------------------------------------------------------------------------
-- 5. New table: "ReferralEscalation" (final shape per Spec SS2.2/SS2.3)
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS __mj_BizAppsReferrals."ReferralEscalation" CASCADE;
CREATE TABLE __mj_BizAppsReferrals."ReferralEscalation" (
    "ID" UUID NOT NULL DEFAULT gen_random_uuid(),
    "ReferralRequestID" UUID NOT NULL,
    "ReferralAssignmentID" UUID NULL,
    "EscalationLevel" INT NOT NULL DEFAULT 1,
    "TriggerType" VARCHAR(30) NOT NULL DEFAULT 'SLAWarning',
    "Status" VARCHAR(40) NOT NULL DEFAULT 'Open',
    "DedupKey" VARCHAR(200) NOT NULL,
    "RecommendedAction" VARCHAR(40) NULL,
    "NotifierKey" VARCHAR(50) NULL,
    "Notes" TEXT NULL,
    "RaisedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "AcknowledgedAt" TIMESTAMPTZ NULL,
    "ResolvedAt" TIMESTAMPTZ NULL,
    "LinkedTaskID" UUID NULL,
    "AcknowledgedByPersonID" UUID NULL,
    "ResolvedByPersonID" UUID NULL,
    "ResolutionNotes" TEXT NULL,
    "AIRationaleJSON" TEXT NULL,
    "__mj_CreatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "__mj_UpdatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "PK_ReferralEscalation" PRIMARY KEY ("ID"),
    CONSTRAINT "UQ_ReferralEscalation_DedupKey" UNIQUE ("DedupKey"),
    CONSTRAINT "FK_ReferralEscalation_Request" FOREIGN KEY ("ReferralRequestID")
        REFERENCES __mj_BizAppsReferrals."ReferralRequest" ("ID"),
    CONSTRAINT "FK_ReferralEscalation_Assignment" FOREIGN KEY ("ReferralAssignmentID")
        REFERENCES __mj_BizAppsReferrals."ReferralAssignment" ("ID"),
    CONSTRAINT "FK_ReferralEscalation_AcknowledgedByPerson" FOREIGN KEY ("AcknowledgedByPersonID")
        REFERENCES __mj_BizAppsCommon."Person" ("ID"),
    CONSTRAINT "FK_ReferralEscalation_ResolvedByPerson" FOREIGN KEY ("ResolvedByPersonID")
        REFERENCES __mj_BizAppsCommon."Person" ("ID"),
    CONSTRAINT "CK_ReferralEscalation_EscalationLevel" CHECK ("EscalationLevel" BETWEEN 1 AND 3),
    CONSTRAINT "CK_ReferralEscalation_TriggerType" CHECK ("TriggerType" IN ('SLAWarning', 'SLABreach', 'CascadeExhausted', 'UrgentUnassigned', 'Manual', 'AIRecommended')),
    CONSTRAINT "CK_ReferralEscalation_Status" CHECK ("Status" IN ('Open', 'Acknowledged', 'Resolved', 'Dismissed')),
    CONSTRAINT "CK_ReferralEscalation_RecommendedAction" CHECK ("RecommendedAction" IS NULL OR "RecommendedAction" IN ('ReassignNextCandidate', 'ExpandPracticeArea', 'ExtendSLA', 'ContactSeeker', 'CloseAsExhausted'))
);

CREATE INDEX IF NOT EXISTS "IX_ReferralEscalation_Request" ON __mj_BizAppsReferrals."ReferralEscalation" ("ReferralRequestID");
CREATE INDEX IF NOT EXISTS "IX_ReferralEscalation_Assignment" ON __mj_BizAppsReferrals."ReferralEscalation" ("ReferralAssignmentID");
CREATE INDEX IF NOT EXISTS "IX_ReferralEscalation_Status" ON __mj_BizAppsReferrals."ReferralEscalation" ("Status");

COMMENT ON TABLE __mj_BizAppsReferrals."ReferralEscalation" IS
    'SLA warning/breach escalation events raised against a ReferralRequest or ReferralAssignment.';

-- -----------------------------------------------------------------------------
-- 6. New table: "ReferralOutcome" (final shape per Spec SS2.2/SS2.3)
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS __mj_BizAppsReferrals."ReferralOutcome" CASCADE;
CREATE TABLE __mj_BizAppsReferrals."ReferralOutcome" (
    "ID" UUID NOT NULL DEFAULT gen_random_uuid(),
    "ReferralRequestID" UUID NOT NULL,
    "ReferralAssignmentID" UUID NOT NULL,
    "ProfessionalProfileID" UUID NOT NULL,
    "OutcomeStatus" VARCHAR(60) NOT NULL DEFAULT 'Resolved',
    "EngagedAt" TIMESTAMPTZ NULL,
    "ClosedAt" TIMESTAMPTZ NULL,
    "EstimatedFeeAmount" NUMERIC(12,2) NULL,
    "ReportedFeeAmount" NUMERIC(12,2) NULL,
    "CurrencyCode" VARCHAR(3) NOT NULL DEFAULT 'USD',
    "ReportedByType" VARCHAR(20) NULL,
    "ReportedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "AttributionNotes" TEXT NULL,
    "__mj_CreatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "__mj_UpdatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "PK_ReferralOutcome" PRIMARY KEY ("ID"),
    CONSTRAINT "UQ_ReferralOutcome_ReferralRequest" UNIQUE ("ReferralRequestID"),
    CONSTRAINT "FK_ReferralOutcome_Request" FOREIGN KEY ("ReferralRequestID")
        REFERENCES __mj_BizAppsReferrals."ReferralRequest" ("ID"),
    CONSTRAINT "FK_ReferralOutcome_Assignment" FOREIGN KEY ("ReferralAssignmentID")
        REFERENCES __mj_BizAppsReferrals."ReferralAssignment" ("ID"),
    CONSTRAINT "FK_ReferralOutcome_Profile" FOREIGN KEY ("ProfessionalProfileID")
        REFERENCES __mj_BizAppsReferrals."ProfessionalProfile" ("ID"),
    CONSTRAINT "CK_ReferralOutcome_OutcomeStatus" CHECK ("OutcomeStatus" IN ('Engaged', 'Resolved', 'Withdrawn', 'NoEngagement', 'Lost')),
    CONSTRAINT "CK_ReferralOutcome_EstimatedFeeAmount" CHECK ("EstimatedFeeAmount" IS NULL OR "EstimatedFeeAmount" >= 0),
    CONSTRAINT "CK_ReferralOutcome_ReportedFeeAmount" CHECK ("ReportedFeeAmount" IS NULL OR "ReportedFeeAmount" >= 0),
    CONSTRAINT "CK_ReferralOutcome_ReportedByType" CHECK ("ReportedByType" IS NULL OR "ReportedByType" IN ('Professional', 'Operator', 'Seeker')),
    CONSTRAINT "CK_ReferralOutcome_Dates" CHECK ("ClosedAt" IS NULL OR "EngagedAt" IS NULL OR "ClosedAt" >= "EngagedAt")
);

CREATE INDEX IF NOT EXISTS "IX_ReferralOutcome_Request" ON __mj_BizAppsReferrals."ReferralOutcome" ("ReferralRequestID");
CREATE INDEX IF NOT EXISTS "IX_ReferralOutcome_Profile" ON __mj_BizAppsReferrals."ReferralOutcome" ("ProfessionalProfileID");

COMMENT ON TABLE __mj_BizAppsReferrals."ReferralOutcome" IS
    'Terminal outcome recorded when a ReferralAssignment is marked complete.';

-- -----------------------------------------------------------------------------
-- 7. New table: "ProfessionalAvailabilityWindow" (final shape per Spec SS2.2/SS2.3)
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS __mj_BizAppsReferrals."ProfessionalAvailabilityWindow" CASCADE;
CREATE TABLE __mj_BizAppsReferrals."ProfessionalAvailabilityWindow" (
    "ID" UUID NOT NULL DEFAULT gen_random_uuid(),
    "ProfessionalProfileID" UUID NOT NULL,
    "WindowType" VARCHAR(40) NOT NULL DEFAULT 'Paused',
    "StartsAt" TIMESTAMPTZ NOT NULL,
    "EndsAt" TIMESTAMPTZ NOT NULL,
    "CapacityOverride" INT NULL,
    "Reason" VARCHAR(500) NULL,
    "IsActive" BOOLEAN NOT NULL DEFAULT TRUE,
    "__mj_CreatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "__mj_UpdatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "PK_ProfessionalAvailabilityWindow" PRIMARY KEY ("ID"),
    CONSTRAINT "FK_ProfessionalAvailabilityWindow_Profile" FOREIGN KEY ("ProfessionalProfileID")
        REFERENCES __mj_BizAppsReferrals."ProfessionalProfile" ("ID"),
    CONSTRAINT "CK_ProfessionalAvailabilityWindow_WindowType" CHECK ("WindowType" IN ('OnLeave', 'Paused', 'ReducedCapacity')),
    CONSTRAINT "CK_ProfessionalAvailabilityWindow_CapacityOverride" CHECK ("CapacityOverride" IS NULL OR "CapacityOverride" >= 0),
    CONSTRAINT "CK_ProfessionalAvailabilityWindow_Dates" CHECK ("EndsAt" > "StartsAt")
);

CREATE INDEX IF NOT EXISTS "IX_ProfessionalAvailabilityWindow_Profile" ON __mj_BizAppsReferrals."ProfessionalAvailabilityWindow" ("ProfessionalProfileID");

COMMENT ON TABLE __mj_BizAppsReferrals."ProfessionalAvailabilityWindow" IS
    'OnLeave, Paused, or ReducedCapacity availability windows for a ProfessionalProfile.';

-- -----------------------------------------------------------------------------
-- 8. New table: "ReciprocitySnapshot" (final shape per Spec SS2.2/SS2.3)
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS __mj_BizAppsReferrals."ReciprocitySnapshot" CASCADE;
CREATE TABLE __mj_BizAppsReferrals."ReciprocitySnapshot" (
    "ID" UUID NOT NULL DEFAULT gen_random_uuid(),
    "ProfessionalProfileID" UUID NOT NULL,
    "ComputedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "PeriodStart" DATE NOT NULL,
    "PeriodEnd" DATE NOT NULL,
    "ReferralsSent" INT NOT NULL DEFAULT 0,
    "ReferralsReceived" INT NOT NULL DEFAULT 0,
    "ReferralsAccepted" INT NOT NULL DEFAULT 0,
    "ReferralsResolved" INT NOT NULL DEFAULT 0,
    "SLABreachCount" INT NOT NULL DEFAULT 0,
    "AcceptanceRate" NUMERIC(5,4) NOT NULL DEFAULT 0,
    "MedianResponseHours" NUMERIC(8,2) NULL,
    "ReciprocityIndex" NUMERIC(6,3) NOT NULL DEFAULT 0,
    "AttributedFeeTotal" NUMERIC(14,2) NOT NULL DEFAULT 0,
    "__mj_CreatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "__mj_UpdatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "PK_ReciprocitySnapshot" PRIMARY KEY ("ID"),
    CONSTRAINT "UQ_ReciprocitySnapshot_Period" UNIQUE ("ProfessionalProfileID", "PeriodStart", "PeriodEnd"),
    CONSTRAINT "FK_ReciprocitySnapshot_Profile" FOREIGN KEY ("ProfessionalProfileID")
        REFERENCES __mj_BizAppsReferrals."ProfessionalProfile" ("ID"),
    CONSTRAINT "CK_ReciprocitySnapshot_ReferralsSent" CHECK ("ReferralsSent" >= 0),
    CONSTRAINT "CK_ReciprocitySnapshot_ReferralsReceived" CHECK ("ReferralsReceived" >= 0)
);

CREATE INDEX IF NOT EXISTS "IX_ReciprocitySnapshot_Profile_Period" ON __mj_BizAppsReferrals."ReciprocitySnapshot" ("ProfessionalProfileID", "PeriodStart", "PeriodEnd");

COMMENT ON TABLE __mj_BizAppsReferrals."ReciprocitySnapshot" IS
    'Periodic snapshot of a ProfessionalProfile referral give/receive balance used to compute ReciprocityIndex.';

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
    IN p_TriggerType VARCHAR(30) DEFAULT NULL,
    IN p_Status VARCHAR(40) DEFAULT NULL,
    IN p_DedupKey VARCHAR(200) DEFAULT NULL,
    IN p_RecommendedAction_Clear BOOLEAN DEFAULT FALSE,
    IN p_RecommendedAction VARCHAR(40) DEFAULT NULL,
    IN p_NotifierKey_Clear BOOLEAN DEFAULT FALSE,
    IN p_NotifierKey VARCHAR(50) DEFAULT NULL,
    IN p_Notes_Clear BOOLEAN DEFAULT FALSE,
    IN p_Notes TEXT DEFAULT NULL,
    IN p_RaisedAt TIMESTAMPTZ DEFAULT NULL,
    IN p_AcknowledgedAt_Clear BOOLEAN DEFAULT FALSE,
    IN p_AcknowledgedAt TIMESTAMPTZ DEFAULT NULL,
    IN p_ResolvedAt_Clear BOOLEAN DEFAULT FALSE,
    IN p_ResolvedAt TIMESTAMPTZ DEFAULT NULL,
    IN p_LinkedTaskID_Clear BOOLEAN DEFAULT FALSE,
    IN p_LinkedTaskID UUID DEFAULT NULL,
    IN p_AcknowledgedByPersonID_Clear BOOLEAN DEFAULT FALSE,
    IN p_AcknowledgedByPersonID UUID DEFAULT NULL,
    IN p_ResolvedByPersonID_Clear BOOLEAN DEFAULT FALSE,
    IN p_ResolvedByPersonID UUID DEFAULT NULL,
    IN p_ResolutionNotes_Clear BOOLEAN DEFAULT FALSE,
    IN p_ResolutionNotes TEXT DEFAULT NULL,
    IN p_AIRationaleJSON_Clear BOOLEAN DEFAULT FALSE,
    IN p_AIRationaleJSON TEXT DEFAULT NULL
)
RETURNS SETOF __mj_BizAppsReferrals."vwReferralEscalations" AS
$$
DECLARE
    v_new_id UUID;
BEGIN
    v_new_id := COALESCE(p_ID, gen_random_uuid());
    INSERT INTO __mj_BizAppsReferrals."ReferralEscalation" (
        "ID", "ReferralRequestID", "ReferralAssignmentID", "EscalationLevel", "TriggerType",
        "Status", "DedupKey", "RecommendedAction", "NotifierKey", "Notes", "RaisedAt",
        "AcknowledgedAt", "ResolvedAt", "LinkedTaskID", "AcknowledgedByPersonID",
        "ResolvedByPersonID", "ResolutionNotes", "AIRationaleJSON"
    ) VALUES (
        v_new_id,
        p_ReferralRequestID,
        p_ReferralAssignmentID,
        COALESCE(p_EscalationLevel, 1),
        COALESCE(p_TriggerType, 'SLAWarning'),
        COALESCE(p_Status, 'Open'),
        p_DedupKey,
        CASE WHEN p_RecommendedAction_Clear THEN NULL ELSE p_RecommendedAction END,
        CASE WHEN p_NotifierKey_Clear THEN NULL ELSE p_NotifierKey END,
        CASE WHEN p_Notes_Clear THEN NULL ELSE p_Notes END,
        COALESCE(p_RaisedAt, NOW()),
        CASE WHEN p_AcknowledgedAt_Clear THEN NULL ELSE p_AcknowledgedAt END,
        CASE WHEN p_ResolvedAt_Clear THEN NULL ELSE p_ResolvedAt END,
        CASE WHEN p_LinkedTaskID_Clear THEN NULL ELSE p_LinkedTaskID END,
        CASE WHEN p_AcknowledgedByPersonID_Clear THEN NULL ELSE p_AcknowledgedByPersonID END,
        CASE WHEN p_ResolvedByPersonID_Clear THEN NULL ELSE p_ResolvedByPersonID END,
        CASE WHEN p_ResolutionNotes_Clear THEN NULL ELSE p_ResolutionNotes END,
        CASE WHEN p_AIRationaleJSON_Clear THEN NULL ELSE p_AIRationaleJSON END
    );
    RETURN QUERY SELECT * FROM __mj_BizAppsReferrals."vwReferralEscalations" WHERE "ID" = v_new_id;
END;
$$ LANGUAGE plpgsql;
DO $$ BEGIN GRANT EXECUTE ON FUNCTION __mj_BizAppsReferrals."spCreateReferralEscalation" TO "cdp_Developer", "cdp_Integration"; EXCEPTION WHEN others THEN NULL; END $$;

CREATE OR REPLACE FUNCTION __mj_BizAppsReferrals."spUpdateReferralEscalation"(
    IN p_ID UUID,
    IN p_ReferralRequestID UUID DEFAULT NULL,
    IN p_ReferralAssignmentID_Clear BOOLEAN DEFAULT FALSE,
    IN p_ReferralAssignmentID UUID DEFAULT NULL,
    IN p_EscalationLevel INT DEFAULT NULL,
    IN p_TriggerType VARCHAR(30) DEFAULT NULL,
    IN p_Status VARCHAR(40) DEFAULT NULL,
    IN p_DedupKey VARCHAR(200) DEFAULT NULL,
    IN p_RecommendedAction_Clear BOOLEAN DEFAULT FALSE,
    IN p_RecommendedAction VARCHAR(40) DEFAULT NULL,
    IN p_NotifierKey_Clear BOOLEAN DEFAULT FALSE,
    IN p_NotifierKey VARCHAR(50) DEFAULT NULL,
    IN p_Notes_Clear BOOLEAN DEFAULT FALSE,
    IN p_Notes TEXT DEFAULT NULL,
    IN p_AcknowledgedAt_Clear BOOLEAN DEFAULT FALSE,
    IN p_AcknowledgedAt TIMESTAMPTZ DEFAULT NULL,
    IN p_ResolvedAt_Clear BOOLEAN DEFAULT FALSE,
    IN p_ResolvedAt TIMESTAMPTZ DEFAULT NULL,
    IN p_LinkedTaskID_Clear BOOLEAN DEFAULT FALSE,
    IN p_LinkedTaskID UUID DEFAULT NULL,
    IN p_AcknowledgedByPersonID_Clear BOOLEAN DEFAULT FALSE,
    IN p_AcknowledgedByPersonID UUID DEFAULT NULL,
    IN p_ResolvedByPersonID_Clear BOOLEAN DEFAULT FALSE,
    IN p_ResolvedByPersonID UUID DEFAULT NULL,
    IN p_ResolutionNotes_Clear BOOLEAN DEFAULT FALSE,
    IN p_ResolutionNotes TEXT DEFAULT NULL,
    IN p_AIRationaleJSON_Clear BOOLEAN DEFAULT FALSE,
    IN p_AIRationaleJSON TEXT DEFAULT NULL
)
RETURNS SETOF __mj_BizAppsReferrals."vwReferralEscalations" AS
$$
BEGIN
    UPDATE __mj_BizAppsReferrals."ReferralEscalation" SET
        "ReferralRequestID" = COALESCE(p_ReferralRequestID, "ReferralRequestID"),
        "ReferralAssignmentID" = CASE WHEN p_ReferralAssignmentID_Clear THEN NULL ELSE COALESCE(p_ReferralAssignmentID, "ReferralAssignmentID") END,
        "EscalationLevel" = COALESCE(p_EscalationLevel, "EscalationLevel"),
        "TriggerType" = COALESCE(p_TriggerType, "TriggerType"),
        "Status" = COALESCE(p_Status, "Status"),
        "DedupKey" = COALESCE(p_DedupKey, "DedupKey"),
        "RecommendedAction" = CASE WHEN p_RecommendedAction_Clear THEN NULL ELSE COALESCE(p_RecommendedAction, "RecommendedAction") END,
        "NotifierKey" = CASE WHEN p_NotifierKey_Clear THEN NULL ELSE COALESCE(p_NotifierKey, "NotifierKey") END,
        "Notes" = CASE WHEN p_Notes_Clear THEN NULL ELSE COALESCE(p_Notes, "Notes") END,
        "AcknowledgedAt" = CASE WHEN p_AcknowledgedAt_Clear THEN NULL ELSE COALESCE(p_AcknowledgedAt, "AcknowledgedAt") END,
        "ResolvedAt" = CASE WHEN p_ResolvedAt_Clear THEN NULL ELSE COALESCE(p_ResolvedAt, "ResolvedAt") END,
        "LinkedTaskID" = CASE WHEN p_LinkedTaskID_Clear THEN NULL ELSE COALESCE(p_LinkedTaskID, "LinkedTaskID") END,
        "AcknowledgedByPersonID" = CASE WHEN p_AcknowledgedByPersonID_Clear THEN NULL ELSE COALESCE(p_AcknowledgedByPersonID, "AcknowledgedByPersonID") END,
        "ResolvedByPersonID" = CASE WHEN p_ResolvedByPersonID_Clear THEN NULL ELSE COALESCE(p_ResolvedByPersonID, "ResolvedByPersonID") END,
        "ResolutionNotes" = CASE WHEN p_ResolutionNotes_Clear THEN NULL ELSE COALESCE(p_ResolutionNotes, "ResolutionNotes") END,
        "AIRationaleJSON" = CASE WHEN p_AIRationaleJSON_Clear THEN NULL ELSE COALESCE(p_AIRationaleJSON, "AIRationaleJSON") END,
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
    IN p_EngagedAt_Clear BOOLEAN DEFAULT FALSE,
    IN p_EngagedAt TIMESTAMPTZ DEFAULT NULL,
    IN p_ClosedAt_Clear BOOLEAN DEFAULT FALSE,
    IN p_ClosedAt TIMESTAMPTZ DEFAULT NULL,
    IN p_EstimatedFeeAmount_Clear BOOLEAN DEFAULT FALSE,
    IN p_EstimatedFeeAmount NUMERIC(12,2) DEFAULT NULL,
    IN p_ReportedFeeAmount_Clear BOOLEAN DEFAULT FALSE,
    IN p_ReportedFeeAmount NUMERIC(12,2) DEFAULT NULL,
    IN p_CurrencyCode VARCHAR(3) DEFAULT NULL,
    IN p_ReportedByType_Clear BOOLEAN DEFAULT FALSE,
    IN p_ReportedByType VARCHAR(20) DEFAULT NULL,
    IN p_ReportedAt TIMESTAMPTZ DEFAULT NULL,
    IN p_AttributionNotes_Clear BOOLEAN DEFAULT FALSE,
    IN p_AttributionNotes TEXT DEFAULT NULL
)
RETURNS SETOF __mj_BizAppsReferrals."vwReferralOutcomes" AS
$$
DECLARE
    v_new_id UUID;
BEGIN
    v_new_id := COALESCE(p_ID, gen_random_uuid());
    INSERT INTO __mj_BizAppsReferrals."ReferralOutcome" (
        "ID", "ReferralRequestID", "ReferralAssignmentID", "ProfessionalProfileID",
        "OutcomeStatus", "EngagedAt", "ClosedAt", "EstimatedFeeAmount", "ReportedFeeAmount",
        "CurrencyCode", "ReportedByType", "ReportedAt", "AttributionNotes"
    ) VALUES (
        v_new_id,
        p_ReferralRequestID,
        p_ReferralAssignmentID,
        p_ProfessionalProfileID,
        COALESCE(p_OutcomeStatus, 'Resolved'),
        CASE WHEN p_EngagedAt_Clear THEN NULL ELSE p_EngagedAt END,
        CASE WHEN p_ClosedAt_Clear THEN NULL ELSE p_ClosedAt END,
        CASE WHEN p_EstimatedFeeAmount_Clear THEN NULL ELSE p_EstimatedFeeAmount END,
        CASE WHEN p_ReportedFeeAmount_Clear THEN NULL ELSE p_ReportedFeeAmount END,
        COALESCE(p_CurrencyCode, 'USD'),
        CASE WHEN p_ReportedByType_Clear THEN NULL ELSE p_ReportedByType END,
        COALESCE(p_ReportedAt, NOW()),
        CASE WHEN p_AttributionNotes_Clear THEN NULL ELSE p_AttributionNotes END
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
    IN p_EngagedAt_Clear BOOLEAN DEFAULT FALSE,
    IN p_EngagedAt TIMESTAMPTZ DEFAULT NULL,
    IN p_ClosedAt_Clear BOOLEAN DEFAULT FALSE,
    IN p_ClosedAt TIMESTAMPTZ DEFAULT NULL,
    IN p_EstimatedFeeAmount_Clear BOOLEAN DEFAULT FALSE,
    IN p_EstimatedFeeAmount NUMERIC(12,2) DEFAULT NULL,
    IN p_ReportedFeeAmount_Clear BOOLEAN DEFAULT FALSE,
    IN p_ReportedFeeAmount NUMERIC(12,2) DEFAULT NULL,
    IN p_CurrencyCode VARCHAR(3) DEFAULT NULL,
    IN p_ReportedByType_Clear BOOLEAN DEFAULT FALSE,
    IN p_ReportedByType VARCHAR(20) DEFAULT NULL,
    IN p_AttributionNotes_Clear BOOLEAN DEFAULT FALSE,
    IN p_AttributionNotes TEXT DEFAULT NULL
)
RETURNS SETOF __mj_BizAppsReferrals."vwReferralOutcomes" AS
$$
BEGIN
    UPDATE __mj_BizAppsReferrals."ReferralOutcome" SET
        "ReferralRequestID" = COALESCE(p_ReferralRequestID, "ReferralRequestID"),
        "ReferralAssignmentID" = COALESCE(p_ReferralAssignmentID, "ReferralAssignmentID"),
        "ProfessionalProfileID" = COALESCE(p_ProfessionalProfileID, "ProfessionalProfileID"),
        "OutcomeStatus" = COALESCE(p_OutcomeStatus, "OutcomeStatus"),
        "EngagedAt" = CASE WHEN p_EngagedAt_Clear THEN NULL ELSE COALESCE(p_EngagedAt, "EngagedAt") END,
        "ClosedAt" = CASE WHEN p_ClosedAt_Clear THEN NULL ELSE COALESCE(p_ClosedAt, "ClosedAt") END,
        "EstimatedFeeAmount" = CASE WHEN p_EstimatedFeeAmount_Clear THEN NULL ELSE COALESCE(p_EstimatedFeeAmount, "EstimatedFeeAmount") END,
        "ReportedFeeAmount" = CASE WHEN p_ReportedFeeAmount_Clear THEN NULL ELSE COALESCE(p_ReportedFeeAmount, "ReportedFeeAmount") END,
        "CurrencyCode" = COALESCE(p_CurrencyCode, "CurrencyCode"),
        "ReportedByType" = CASE WHEN p_ReportedByType_Clear THEN NULL ELSE COALESCE(p_ReportedByType, "ReportedByType") END,
        "AttributionNotes" = CASE WHEN p_AttributionNotes_Clear THEN NULL ELSE COALESCE(p_AttributionNotes, "AttributionNotes") END,
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
    IN p_StartsAt TIMESTAMPTZ DEFAULT NULL,
    IN p_EndsAt TIMESTAMPTZ DEFAULT NULL,
    IN p_CapacityOverride_Clear BOOLEAN DEFAULT FALSE,
    IN p_CapacityOverride INT DEFAULT NULL,
    IN p_Reason_Clear BOOLEAN DEFAULT FALSE,
    IN p_Reason VARCHAR(500) DEFAULT NULL,
    IN p_IsActive BOOLEAN DEFAULT NULL
)
RETURNS SETOF __mj_BizAppsReferrals."vwProfessionalAvailabilityWindows" AS
$$
DECLARE
    v_new_id UUID;
BEGIN
    v_new_id := COALESCE(p_ID, gen_random_uuid());
    INSERT INTO __mj_BizAppsReferrals."ProfessionalAvailabilityWindow" (
        "ID", "ProfessionalProfileID", "WindowType", "StartsAt", "EndsAt",
        "CapacityOverride", "Reason", "IsActive"
    ) VALUES (
        v_new_id,
        p_ProfessionalProfileID,
        COALESCE(p_WindowType, 'Paused'),
        p_StartsAt,
        p_EndsAt,
        CASE WHEN p_CapacityOverride_Clear THEN NULL ELSE p_CapacityOverride END,
        CASE WHEN p_Reason_Clear THEN NULL ELSE p_Reason END,
        COALESCE(p_IsActive, TRUE)
    );
    RETURN QUERY SELECT * FROM __mj_BizAppsReferrals."vwProfessionalAvailabilityWindows" WHERE "ID" = v_new_id;
END;
$$ LANGUAGE plpgsql;
DO $$ BEGIN GRANT EXECUTE ON FUNCTION __mj_BizAppsReferrals."spCreateProfessionalAvailabilityWindow" TO "cdp_Developer", "cdp_Integration"; EXCEPTION WHEN others THEN NULL; END $$;

CREATE OR REPLACE FUNCTION __mj_BizAppsReferrals."spUpdateProfessionalAvailabilityWindow"(
    IN p_ID UUID,
    IN p_ProfessionalProfileID UUID DEFAULT NULL,
    IN p_WindowType VARCHAR(40) DEFAULT NULL,
    IN p_StartsAt TIMESTAMPTZ DEFAULT NULL,
    IN p_EndsAt TIMESTAMPTZ DEFAULT NULL,
    IN p_CapacityOverride_Clear BOOLEAN DEFAULT FALSE,
    IN p_CapacityOverride INT DEFAULT NULL,
    IN p_Reason_Clear BOOLEAN DEFAULT FALSE,
    IN p_Reason VARCHAR(500) DEFAULT NULL,
    IN p_IsActive BOOLEAN DEFAULT NULL
)
RETURNS SETOF __mj_BizAppsReferrals."vwProfessionalAvailabilityWindows" AS
$$
BEGIN
    UPDATE __mj_BizAppsReferrals."ProfessionalAvailabilityWindow" SET
        "ProfessionalProfileID" = COALESCE(p_ProfessionalProfileID, "ProfessionalProfileID"),
        "WindowType" = COALESCE(p_WindowType, "WindowType"),
        "StartsAt" = COALESCE(p_StartsAt, "StartsAt"),
        "EndsAt" = COALESCE(p_EndsAt, "EndsAt"),
        "CapacityOverride" = CASE WHEN p_CapacityOverride_Clear THEN NULL ELSE COALESCE(p_CapacityOverride, "CapacityOverride") END,
        "Reason" = CASE WHEN p_Reason_Clear THEN NULL ELSE COALESCE(p_Reason, "Reason") END,
        "IsActive" = COALESCE(p_IsActive, "IsActive"),
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
    IN p_ComputedAt TIMESTAMPTZ DEFAULT NULL,
    IN p_PeriodStart DATE DEFAULT NULL,
    IN p_PeriodEnd DATE DEFAULT NULL,
    IN p_ReferralsSent INT DEFAULT NULL,
    IN p_ReferralsReceived INT DEFAULT NULL,
    IN p_ReferralsAccepted INT DEFAULT NULL,
    IN p_ReferralsResolved INT DEFAULT NULL,
    IN p_SLABreachCount INT DEFAULT NULL,
    IN p_AcceptanceRate NUMERIC(5,4) DEFAULT NULL,
    IN p_MedianResponseHours_Clear BOOLEAN DEFAULT FALSE,
    IN p_MedianResponseHours NUMERIC(8,2) DEFAULT NULL,
    IN p_ReciprocityIndex NUMERIC(6,3) DEFAULT NULL,
    IN p_AttributedFeeTotal NUMERIC(14,2) DEFAULT NULL
)
RETURNS SETOF __mj_BizAppsReferrals."vwReciprocitySnapshots" AS
$$
DECLARE
    v_new_id UUID;
BEGIN
    v_new_id := COALESCE(p_ID, gen_random_uuid());
    INSERT INTO __mj_BizAppsReferrals."ReciprocitySnapshot" (
        "ID", "ProfessionalProfileID", "ComputedAt", "PeriodStart", "PeriodEnd",
        "ReferralsSent", "ReferralsReceived", "ReferralsAccepted", "ReferralsResolved",
        "SLABreachCount", "AcceptanceRate", "MedianResponseHours", "ReciprocityIndex", "AttributedFeeTotal"
    ) VALUES (
        v_new_id,
        p_ProfessionalProfileID,
        COALESCE(p_ComputedAt, NOW()),
        p_PeriodStart,
        p_PeriodEnd,
        COALESCE(p_ReferralsSent, 0),
        COALESCE(p_ReferralsReceived, 0),
        COALESCE(p_ReferralsAccepted, 0),
        COALESCE(p_ReferralsResolved, 0),
        COALESCE(p_SLABreachCount, 0),
        COALESCE(p_AcceptanceRate, 0),
        CASE WHEN p_MedianResponseHours_Clear THEN NULL ELSE p_MedianResponseHours END,
        COALESCE(p_ReciprocityIndex, 0),
        COALESCE(p_AttributedFeeTotal, 0)
    );
    RETURN QUERY SELECT * FROM __mj_BizAppsReferrals."vwReciprocitySnapshots" WHERE "ID" = v_new_id;
END;
$$ LANGUAGE plpgsql;
DO $$ BEGIN GRANT EXECUTE ON FUNCTION __mj_BizAppsReferrals."spCreateReciprocitySnapshot" TO "cdp_Developer", "cdp_Integration"; EXCEPTION WHEN others THEN NULL; END $$;

CREATE OR REPLACE FUNCTION __mj_BizAppsReferrals."spUpdateReciprocitySnapshot"(
    IN p_ID UUID,
    IN p_ProfessionalProfileID UUID DEFAULT NULL,
    IN p_ComputedAt TIMESTAMPTZ DEFAULT NULL,
    IN p_PeriodStart DATE DEFAULT NULL,
    IN p_PeriodEnd DATE DEFAULT NULL,
    IN p_ReferralsSent INT DEFAULT NULL,
    IN p_ReferralsReceived INT DEFAULT NULL,
    IN p_ReferralsAccepted INT DEFAULT NULL,
    IN p_ReferralsResolved INT DEFAULT NULL,
    IN p_SLABreachCount INT DEFAULT NULL,
    IN p_AcceptanceRate NUMERIC(5,4) DEFAULT NULL,
    IN p_MedianResponseHours_Clear BOOLEAN DEFAULT FALSE,
    IN p_MedianResponseHours NUMERIC(8,2) DEFAULT NULL,
    IN p_ReciprocityIndex NUMERIC(6,3) DEFAULT NULL,
    IN p_AttributedFeeTotal NUMERIC(14,2) DEFAULT NULL
)
RETURNS SETOF __mj_BizAppsReferrals."vwReciprocitySnapshots" AS
$$
BEGIN
    UPDATE __mj_BizAppsReferrals."ReciprocitySnapshot" SET
        "ProfessionalProfileID" = COALESCE(p_ProfessionalProfileID, "ProfessionalProfileID"),
        "ComputedAt" = COALESCE(p_ComputedAt, "ComputedAt"),
        "PeriodStart" = COALESCE(p_PeriodStart, "PeriodStart"),
        "PeriodEnd" = COALESCE(p_PeriodEnd, "PeriodEnd"),
        "ReferralsSent" = COALESCE(p_ReferralsSent, "ReferralsSent"),
        "ReferralsReceived" = COALESCE(p_ReferralsReceived, "ReferralsReceived"),
        "ReferralsAccepted" = COALESCE(p_ReferralsAccepted, "ReferralsAccepted"),
        "ReferralsResolved" = COALESCE(p_ReferralsResolved, "ReferralsResolved"),
        "SLABreachCount" = COALESCE(p_SLABreachCount, "SLABreachCount"),
        "AcceptanceRate" = COALESCE(p_AcceptanceRate, "AcceptanceRate"),
        "MedianResponseHours" = CASE WHEN p_MedianResponseHours_Clear THEN NULL ELSE COALESCE(p_MedianResponseHours, "MedianResponseHours") END,
        "ReciprocityIndex" = COALESCE(p_ReciprocityIndex, "ReciprocityIndex"),
        "AttributedFeeTotal" = COALESCE(p_AttributedFeeTotal, "AttributedFeeTotal"),
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
