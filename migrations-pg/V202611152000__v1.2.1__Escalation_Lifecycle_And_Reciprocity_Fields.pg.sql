-- ============================================================================
-- MemberJunction PostgreSQL Migration
-- BizApps Referrals - Wave 3 Slice 2: Escalation Lifecycle & Reciprocity (v1.2.1)
-- ============================================================================

SET search_path TO __mj_BizAppsReferrals, public;

-- -----------------------------------------------------------------------------
-- 1. Additive columns on "ReferralEscalation": dedup, notifier linkage, resolution audit
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
-- 2. Additive column on "ReferralOutcome": attributed fee value for reciprocity scorecards
-- -----------------------------------------------------------------------------
ALTER TABLE __mj_BizAppsReferrals."ReferralOutcome"
    ADD COLUMN IF NOT EXISTS "FeeAmount" NUMERIC(10,2) NULL;

-- -----------------------------------------------------------------------------
-- 3. Additive columns on "ReciprocitySnapshot": full scorecard metrics
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
-- 4. Additive column on "ProfessionalProfile": readiness computation timestamp
-- -----------------------------------------------------------------------------
ALTER TABLE __mj_BizAppsReferrals."ProfessionalProfile"
    ADD COLUMN IF NOT EXISTS "ReadinessComputedAt" TIMESTAMPTZ NULL;
