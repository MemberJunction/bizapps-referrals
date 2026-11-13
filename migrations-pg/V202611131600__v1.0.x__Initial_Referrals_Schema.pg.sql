-- ============================================================================
-- MemberJunction PostgreSQL Migration
-- Converted from SQL Server using TypeScript conversion pipeline
-- ============================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Schema
--
-- The schema name is emitted UNQUOTED, so PostgreSQL folds it to lowercase. That is deliberate and
-- self-consistent: everything downstream in a converted migration refers to it unquoted too, so
-- both definition and lookup land on the same folded name.
--
-- DOWNSTREAM NOTE for the build engineer: a PostgreSQL database that was populated by an EARLIER
-- converter — one that emitted a quoted, case-preserved name — already holds that mixed-case
-- schema: for a target named MySchema_Name, the quoted "MySchema_Name". Re-converting against
-- that database creates a SECOND, empty schema myschema_name rather than reusing the existing
-- one, because IF NOT EXISTS compares the folded name and finds no match. The repo's own committed
-- migrations-pg files are unaffected (the only quoted CREATE SCHEMAs there are the four pg_dump
-- baselines, which this path does not produce), so this is an open-app / downstream concern, not
-- one for this repo's Flyway history.
CREATE SCHEMA IF NOT EXISTS __mj_BizAppsReferrals;
SET search_path TO __mj_BizAppsReferrals, public;

-- Ensure backslashes in string literals are treated literally (not as escape sequences)
SET standard_conforming_strings = on;

-- NOTE: Earlier converter versions made INTEGER to BOOLEAN cast implicit by
-- modifying the system catalog so SS-style INSERT INTO bool_col VALUES (1)
-- would work. That modification required pg_catalog write privileges, which
-- managed PG (RDS, Aurora, Cloud SQL, Azure) does not grant. As of v5.30 all
-- bulk INSERTs are emitted with native TRUE/FALSE values directly, so the
-- cast modification is no longer needed. Removed to support managed-PG
-- installs out of the box.


-- ===================== DDL: Tables, PKs, Indexes =====================

CREATE SCHEMA IF NOT EXISTS __mj_bizappsreferrals;

-- =============================================================================
-- 1. PracticeArea
-- =============================================================================
CREATE TABLE __mj_BizAppsReferrals."PracticeArea" (
 "ID" UUID NOT NULL
 CONSTRAINT "PK_PracticeArea" PRIMARY KEY DEFAULT gen_random_uuid(),
 "ParentID" UUID NULL
 CONSTRAINT "FK_PracticeArea_Parent" REFERENCES __mj_BizAppsReferrals."PracticeArea"("ID"),
 "Name" VARCHAR(150) NOT NULL,
 "Code" VARCHAR(50) NOT NULL
 CONSTRAINT "UQ_PracticeArea_Code" UNIQUE,
 "Category" VARCHAR(100) NULL,
 "Description" TEXT NULL,
 "IconClass" VARCHAR(100) NULL,
 "DisplayRank" INTEGER NOT NULL DEFAULT 100,
 "IsActive" BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS "IX_PracticeArea_ParentID" ON __mj_BizAppsReferrals."PracticeArea" ("ParentID");

CREATE INDEX IF NOT EXISTS "IX_PracticeArea_IsActive_DisplayRank" ON __mj_BizAppsReferrals."PracticeArea" ("IsActive", "DisplayRank");

-- =============================================================================
-- 2. Jurisdiction
-- =============================================================================
CREATE TABLE __mj_BizAppsReferrals."Jurisdiction" (
 "ID" UUID NOT NULL
 CONSTRAINT "PK_Jurisdiction" PRIMARY KEY DEFAULT gen_random_uuid(),
 "ParentID" UUID NULL
 CONSTRAINT "FK_Jurisdiction_Parent" REFERENCES __mj_BizAppsReferrals."Jurisdiction"("ID"),
 "Name" VARCHAR(150) NOT NULL,
 "Code" VARCHAR(50) NOT NULL
 CONSTRAINT "UQ_Jurisdiction_Code" UNIQUE,
 "JurisdictionType" VARCHAR(30) NOT NULL DEFAULT 'State'
 CONSTRAINT "CK_Jurisdiction_Type" CHECK ("JurisdictionType" IN ('Country', 'State', 'Province', 'Federal', 'Municipal', 'International')),
 "CountryCode" VARCHAR(10) NOT NULL DEFAULT 'US',
 "StateProvinceCode" VARCHAR(20) NULL,
 "IsActive" BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS "IX_Jurisdiction_ParentID" ON __mj_BizAppsReferrals."Jurisdiction" ("ParentID");

CREATE INDEX IF NOT EXISTS "IX_Jurisdiction_Country_State" ON __mj_BizAppsReferrals."Jurisdiction" ("CountryCode", "StateProvinceCode");

-- =============================================================================
-- 3. ReferralTier
-- =============================================================================
CREATE TABLE __mj_BizAppsReferrals."ReferralTier" (
 "ID" UUID NOT NULL
 CONSTRAINT "PK_ReferralTier" PRIMARY KEY DEFAULT gen_random_uuid(),
 "Name" VARCHAR(100) NOT NULL,
 "Code" VARCHAR(50) NOT NULL
 CONSTRAINT "UQ_ReferralTier_Code" UNIQUE,
 "SLAResponseHours" INTEGER NOT NULL DEFAULT 24
 CONSTRAINT "CK_ReferralTier_SLAResponseHours" CHECK ("SLAResponseHours" > 0),
 "MaxCascadeAttempts" INTEGER NOT NULL DEFAULT 3
 CONSTRAINT "CK_ReferralTier_MaxCascadeAttempts" CHECK ("MaxCascadeAttempts" > 0),
 "PriorityWeight" DECIMAL(5,2) NOT NULL DEFAULT 1.00,
 "RequireConflictCheck" BOOLEAN NOT NULL DEFAULT TRUE,
 "Description" TEXT NULL,
 "IsActive" BOOLEAN NOT NULL DEFAULT TRUE
);

-- =============================================================================
-- 4. ProfessionalProfile
-- =============================================================================
CREATE TABLE __mj_BizAppsReferrals."ProfessionalProfile" (
 "ID" UUID NOT NULL
 CONSTRAINT "PK_ProfessionalProfile" PRIMARY KEY DEFAULT gen_random_uuid(),
 "PersonID" UUID NULL
 CONSTRAINT "FK_ProfessionalProfile_Person" REFERENCES __mj_BizAppsCommon."Person"("ID"),
 "OrganizationID" UUID NULL
 CONSTRAINT "FK_ProfessionalProfile_Organization" REFERENCES __mj_BizAppsCommon."Organization"("ID"),
 "UserID" UUID NULL
 CONSTRAINT "FK_ProfessionalProfile_User" REFERENCES __mj."User"("ID"),
 "DisplayName" VARCHAR(200) NOT NULL,
 "FirmName" VARCHAR(200) NULL,
 "Email" VARCHAR(255) NOT NULL,
 "Phone" VARCHAR(50) NULL,
 "BarOrLicenseNumber" VARCHAR(100) NULL,
 "VerificationStatus" VARCHAR(30) NOT NULL DEFAULT 'Pending'
 CONSTRAINT "CK_ProfessionalProfile_VerificationStatus" CHECK ("VerificationStatus" IN ('Pending', 'Verified', 'Suspended', 'Expired')),
 "AvailabilityStatus" VARCHAR(30) NOT NULL DEFAULT 'Available'
 CONSTRAINT "CK_ProfessionalProfile_AvailabilityStatus" CHECK ("AvailabilityStatus" IN ('Available', 'Limited', 'Unavailable', 'OnLeave')),
 "Bio" TEXT NULL,
 "YearsExperience" INTEGER NOT NULL DEFAULT 0
 CONSTRAINT "CK_ProfessionalProfile_YearsExperience" CHECK ("YearsExperience" >= 0),
 "Languages" VARCHAR(255) NULL DEFAULT 'English',
 "HourlyRateMin" DECIMAL(10,2) NULL,
 "HourlyRateMax" DECIMAL(10,2) NULL,
 "AcceptsProBono" BOOLEAN NOT NULL DEFAULT FALSE,
 "AcceptsContingency" BOOLEAN NOT NULL DEFAULT FALSE,
 "ActiveReferralCount" INTEGER NOT NULL DEFAULT 0
 CONSTRAINT "CK_ProfessionalProfile_ActiveReferralCount" CHECK ("ActiveReferralCount" >= 0),
 "MaxConcurrentReferrals" INTEGER NOT NULL DEFAULT 10
 CONSTRAINT "CK_ProfessionalProfile_MaxConcurrentReferrals" CHECK ("MaxConcurrentReferrals" > 0),
 "AverageResponseHours" DECIMAL(6,2) NULL,
 "AverageRating" DECIMAL(3,2) NULL,
 "TotalAcceptedCount" INTEGER NOT NULL DEFAULT 0,
 "TotalCompletedCount" INTEGER NOT NULL DEFAULT 0,
 "IsActive" BOOLEAN NOT NULL DEFAULT TRUE,
 CONSTRAINT "CK_ProfessionalProfile_RateRange" CHECK ("HourlyRateMin" IS NULL OR "HourlyRateMax" IS NULL OR "HourlyRateMax" >= "HourlyRateMin")
);

CREATE INDEX IF NOT EXISTS "IX_ProfessionalProfile_Verification_Availability" ON __mj_BizAppsReferrals."ProfessionalProfile" ("VerificationStatus", "AvailabilityStatus", "IsActive");

CREATE INDEX IF NOT EXISTS "IX_ProfessionalProfile_UserID" ON __mj_BizAppsReferrals."ProfessionalProfile" ("UserID");

CREATE INDEX IF NOT EXISTS "IX_ProfessionalProfile_PersonID" ON __mj_BizAppsReferrals."ProfessionalProfile" ("PersonID");

-- =============================================================================
-- 5. ProfessionalPracticeArea
-- =============================================================================
CREATE TABLE __mj_BizAppsReferrals."ProfessionalPracticeArea" (
 "ID" UUID NOT NULL
 CONSTRAINT "PK_ProfessionalPracticeArea" PRIMARY KEY DEFAULT gen_random_uuid(),
 "ProfessionalProfileID" UUID NOT NULL
 CONSTRAINT "FK_ProfessionalPracticeArea_Profile" REFERENCES __mj_BizAppsReferrals."ProfessionalProfile"("ID"),
 "PracticeAreaID" UUID NOT NULL
 CONSTRAINT "FK_ProfessionalPracticeArea_PracticeArea" REFERENCES __mj_BizAppsReferrals."PracticeArea"("ID"),
 "ProficiencyLevel" VARCHAR(30) NOT NULL DEFAULT 'Standard'
 CONSTRAINT "CK_ProfessionalPracticeArea_Proficiency" CHECK ("ProficiencyLevel" IN ('Primary', 'Standard', 'Emerging')),
 "YearsInPractice" INTEGER NOT NULL DEFAULT 0
 CONSTRAINT "CK_ProfessionalPracticeArea_Years" CHECK ("YearsInPractice" >= 0),
 "IsPrimary" BOOLEAN NOT NULL DEFAULT FALSE,
 CONSTRAINT "UQ_ProfessionalPracticeArea_Pair" UNIQUE ("ProfessionalProfileID", "PracticeAreaID")
);

CREATE INDEX IF NOT EXISTS "IX_ProfessionalPracticeArea_PracticeAreaID" ON __mj_BizAppsReferrals."ProfessionalPracticeArea" ("PracticeAreaID");

-- =============================================================================
-- 6. ProfessionalJurisdiction
-- =============================================================================
CREATE TABLE __mj_BizAppsReferrals."ProfessionalJurisdiction" (
 "ID" UUID NOT NULL
 CONSTRAINT "PK_ProfessionalJurisdiction" PRIMARY KEY DEFAULT gen_random_uuid(),
 "ProfessionalProfileID" UUID NOT NULL
 CONSTRAINT "FK_ProfessionalJurisdiction_Profile" REFERENCES __mj_BizAppsReferrals."ProfessionalProfile"("ID"),
 "JurisdictionID" UUID NOT NULL
 CONSTRAINT "FK_ProfessionalJurisdiction_Jurisdiction" REFERENCES __mj_BizAppsReferrals."Jurisdiction"("ID"),
 "LicenseNumber" VARCHAR(100) NULL,
 "AdmissionYear" INTEGER NULL,
 "StandingStatus" VARCHAR(30) NOT NULL DEFAULT 'GoodStanding'
 CONSTRAINT "CK_ProfessionalJurisdiction_Standing" CHECK ("StandingStatus" IN ('GoodStanding', 'Inactive', 'ProHacVice', 'Suspended')),
 "IsPrimary" BOOLEAN NOT NULL DEFAULT FALSE,
 CONSTRAINT "UQ_ProfessionalJurisdiction_Pair" UNIQUE ("ProfessionalProfileID", "JurisdictionID")
);

CREATE INDEX IF NOT EXISTS "IX_ProfessionalJurisdiction_JurisdictionID" ON __mj_BizAppsReferrals."ProfessionalJurisdiction" ("JurisdictionID");

-- =============================================================================
-- 7. ReferralRequest
-- =============================================================================
CREATE TABLE __mj_BizAppsReferrals."ReferralRequest" (
 "ID" UUID NOT NULL
 CONSTRAINT "PK_ReferralRequest" PRIMARY KEY DEFAULT gen_random_uuid(),
 "RequestNumber" VARCHAR(50) NOT NULL
 CONSTRAINT "UQ_ReferralRequest_RequestNumber" UNIQUE,
 "SeekerName" VARCHAR(200) NOT NULL,
 "SeekerEmail" VARCHAR(255) NOT NULL,
 "SeekerPhone" VARCHAR(50) NULL,
 "SeekerCompany" VARCHAR(200) NULL,
 "SeekerPersonID" UUID NULL
 CONSTRAINT "FK_ReferralRequest_SeekerPerson" REFERENCES __mj_BizAppsCommon."Person"("ID"),
 "PracticeAreaID" UUID NOT NULL
 CONSTRAINT "FK_ReferralRequest_PracticeArea" REFERENCES __mj_BizAppsReferrals."PracticeArea"("ID"),
 "JurisdictionID" UUID NOT NULL
 CONSTRAINT "FK_ReferralRequest_Jurisdiction" REFERENCES __mj_BizAppsReferrals."Jurisdiction"("ID"),
 "ReferralTierID" UUID NOT NULL
 CONSTRAINT "FK_ReferralRequest_ReferralTier" REFERENCES __mj_BizAppsReferrals."ReferralTier"("ID"),
 "MatterTitle" VARCHAR(255) NOT NULL,
 "MatterSummary" TEXT NOT NULL,
 "UrgencyLevel" VARCHAR(20) NOT NULL DEFAULT 'Standard'
 CONSTRAINT "CK_ReferralRequest_UrgencyLevel" CHECK ("UrgencyLevel" IN ('Low', 'Standard', 'High', 'Urgent')),
 "BudgetRange" VARCHAR(100) NULL,
 "PreferredLanguage" VARCHAR(100) NULL DEFAULT 'English',
 "RequiresProBono" BOOLEAN NOT NULL DEFAULT FALSE,
 "Status" VARCHAR(30) NOT NULL DEFAULT 'Draft'
 CONSTRAINT "CK_ReferralRequest_Status" CHECK ("Status" IN ('Draft', 'Submitted', 'Matching', 'Routed', 'Accepted', 'InProgress', 'Completed', 'Exhausted', 'Cancelled')),
 "AssignedProfessionalID" UUID NULL
 CONSTRAINT "FK_ReferralRequest_AssignedProfessional" REFERENCES __mj_BizAppsReferrals."ProfessionalProfile"("ID"),
 "CurrentCascadeStep" INTEGER NOT NULL DEFAULT 0,
 "SubmittedAt" TIMESTAMPTZ NULL,
 "AcceptedAt" TIMESTAMPTZ NULL,
 "CompletedAt" TIMESTAMPTZ NULL
);

CREATE INDEX IF NOT EXISTS "IX_ReferralRequest_Status_Practice_Jurisdiction" ON __mj_BizAppsReferrals."ReferralRequest" ("Status", "PracticeAreaID", "JurisdictionID");

CREATE INDEX IF NOT EXISTS "IX_ReferralRequest_AssignedProfessionalID" ON __mj_BizAppsReferrals."ReferralRequest" ("AssignedProfessionalID");

-- =============================================================================
-- 8. ConflictCheckParty
-- =============================================================================
CREATE TABLE __mj_BizAppsReferrals."ConflictCheckParty" (
 "ID" UUID NOT NULL
 CONSTRAINT "PK_ConflictCheckParty" PRIMARY KEY DEFAULT gen_random_uuid(),
 "ReferralRequestID" UUID NOT NULL
 CONSTRAINT "FK_ConflictCheckParty_Request" REFERENCES __mj_BizAppsReferrals."ReferralRequest"("ID"),
 "PartyName" VARCHAR(255) NOT NULL,
 "PartyRole" VARCHAR(30) NOT NULL DEFAULT 'Adverse'
 CONSTRAINT "CK_ConflictCheckParty_PartyRole" CHECK ("PartyRole" IN ('Client', 'Adverse', 'CoParty', 'RelatedEntity', 'Witness')),
 "OrganizationName" VARCHAR(255) NULL,
 "NormalizedName" VARCHAR(255) NOT NULL,
 "Notes" TEXT NULL
);

CREATE INDEX IF NOT EXISTS "IX_ConflictCheckParty_RequestID" ON __mj_BizAppsReferrals."ConflictCheckParty" ("ReferralRequestID");

CREATE INDEX IF NOT EXISTS "IX_ConflictCheckParty_NormalizedName" ON __mj_BizAppsReferrals."ConflictCheckParty" ("NormalizedName");

-- =============================================================================
-- 9. ReferralAssignment
-- =============================================================================
CREATE TABLE __mj_BizAppsReferrals."ReferralAssignment" (
 "ID" UUID NOT NULL
 CONSTRAINT "PK_ReferralAssignment" PRIMARY KEY DEFAULT gen_random_uuid(),
 "ReferralRequestID" UUID NOT NULL
 CONSTRAINT "FK_ReferralAssignment_Request" REFERENCES __mj_BizAppsReferrals."ReferralRequest"("ID"),
 "ProfessionalProfileID" UUID NOT NULL
 CONSTRAINT "FK_ReferralAssignment_Profile" REFERENCES __mj_BizAppsReferrals."ProfessionalProfile"("ID"),
 "CascadeOrder" INTEGER NOT NULL DEFAULT 1
 CONSTRAINT "CK_ReferralAssignment_CascadeOrder" CHECK ("CascadeOrder" >= 1),
 "MatchScore" DECIMAL(5,2) NOT NULL DEFAULT 0.00,
 "ScoreBreakdownJSON" TEXT NULL,
 "ConflictStatus" VARCHAR(30) NOT NULL DEFAULT 'Pending'
 CONSTRAINT "CK_ReferralAssignment_ConflictStatus" CHECK ("ConflictStatus" IN ('Pending', 'Cleared', 'ConflictFound', 'Waived')),
 "ConflictReason" TEXT NULL,
 "Status" VARCHAR(30) NOT NULL DEFAULT 'Queued'
 CONSTRAINT "CK_ReferralAssignment_Status" CHECK ("Status" IN ('Queued', 'Offered', 'Accepted', 'Declined', 'ConflictRejected', 'Expired', 'Withdrawn')),
 "OfferedAt" TIMESTAMPTZ NULL,
 "SLADeadlineAt" TIMESTAMPTZ NULL,
 "RespondedAt" TIMESTAMPTZ NULL,
 "ResponseNotes" TEXT NULL,
 "DeclineReason" VARCHAR(255) NULL
);

CREATE INDEX IF NOT EXISTS "IX_ReferralAssignment_Request_Cascade" ON __mj_BizAppsReferrals."ReferralAssignment" ("ReferralRequestID", "CascadeOrder");

CREATE INDEX IF NOT EXISTS "IX_ReferralAssignment_Profile_Status" ON __mj_BizAppsReferrals."ReferralAssignment" ("ProfessionalProfileID", "Status");

CREATE INDEX IF NOT EXISTS "IX_ReferralAssignment_Status_SLADeadline" ON __mj_BizAppsReferrals."ReferralAssignment" ("Status", "SLADeadlineAt");

-- =============================================================================
-- 10. ReferralFeedback
-- =============================================================================
CREATE TABLE __mj_BizAppsReferrals."ReferralFeedback" (
 "ID" UUID NOT NULL
 CONSTRAINT "PK_ReferralFeedback" PRIMARY KEY DEFAULT gen_random_uuid(),
 "ReferralRequestID" UUID NOT NULL
 CONSTRAINT "FK_ReferralFeedback_Request" REFERENCES __mj_BizAppsReferrals."ReferralRequest"("ID"),
 "ReferralAssignmentID" UUID NULL
 CONSTRAINT "FK_ReferralFeedback_Assignment" REFERENCES __mj_BizAppsReferrals."ReferralAssignment"("ID"),
 "ProfessionalProfileID" UUID NOT NULL
 CONSTRAINT "FK_ReferralFeedback_Profile" REFERENCES __mj_BizAppsReferrals."ProfessionalProfile"("ID"),
 "SubmittedByType" VARCHAR(20) NOT NULL DEFAULT 'Seeker'
 CONSTRAINT "CK_ReferralFeedback_SubmittedByType" CHECK ("SubmittedByType" IN ('Seeker', 'Professional', 'Operator')),
 "Rating" INTEGER NOT NULL
 CONSTRAINT "CK_ReferralFeedback_Rating" CHECK ("Rating" >= 1 AND "Rating" <= 5),
 "OutcomeStatus" VARCHAR(30) NOT NULL DEFAULT 'Engaged'
 CONSTRAINT "CK_ReferralFeedback_OutcomeStatus" CHECK ("OutcomeStatus" IN ('Engaged', 'ConsultedOnly', 'NoResponse', 'NotAFit', 'Resolved')),
 "Comments" TEXT NULL,
 "SubmittedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "IX_ReferralFeedback_ProfileID" ON __mj_BizAppsReferrals."ReferralFeedback" ("ProfessionalProfileID");

CREATE INDEX IF NOT EXISTS "IX_ReferralFeedback_RequestID" ON __mj_BizAppsReferrals."ReferralFeedback" ("ReferralRequestID");


-- ===================== Data (INSERT/UPDATE/DELETE) =====================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM __mj_BizAppsReferrals."PracticeArea" WHERE "Code" = 'CORP_MA'
    ) THEN
        INSERT INTO __mj_BizAppsReferrals."PracticeArea" ("ID", "Name", "Code", "Category", "Description", "IconClass", "DisplayRank", "IsActive")
        VALUES
        ('A1000001-0000-0000-0000-000000000001', 'Corporate & M&A', 'CORP_MA', 'Legal', 'Mergers, acquisitions, corporate governance, and entity structuring.', 'fa-solid fa-building', 10, TRUE),
        ('A1000001-0000-0000-0000-000000000002', 'Commercial Litigation', 'COMM_LIT', 'Legal', 'Business disputes, contract enforcement, and commercial arbitration.', 'fa-solid fa-gavel', 20, TRUE),
        ('A1000001-0000-0000-0000-000000000003', 'Employment & Labor', 'EMP_LABOR', 'Legal', 'Workplace compliance, executive compensation, and employment disputes.', 'fa-solid fa-users', 30, TRUE),
        ('A1000001-0000-0000-0000-000000000004', 'Intellectual Property', 'IP_LAW', 'Legal', 'Patents, trademarks, copyrights, and technology licensing.', 'fa-solid fa-lightbulb', 40, TRUE),
        ('A1000001-0000-0000-0000-000000000005', 'Real Estate & Land Use', 'REAL_ESTATE', 'Legal', 'Commercial leasing, acquisitions, zoning, and real property.', 'fa-solid fa-city', 50, TRUE);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM __mj_BizAppsReferrals."Jurisdiction" WHERE "Code" = 'US-CA'
    ) THEN
        INSERT INTO __mj_BizAppsReferrals."Jurisdiction" ("ID", "Name", "Code", "JurisdictionType", "CountryCode", "StateProvinceCode", "IsActive")
        VALUES
        ('B1000001-0000-0000-0000-000000000001', 'California', 'US-CA', 'State', 'US', 'CA', TRUE),
        ('B1000001-0000-0000-0000-000000000002', 'New York', 'US-NY', 'State', 'US', 'NY', TRUE),
        ('B1000001-0000-0000-0000-000000000003', 'Texas', 'US-TX', 'State', 'US', 'TX', TRUE),
        ('B1000001-0000-0000-0000-000000000004', 'Delaware', 'US-DE', 'State', 'US', 'DE', TRUE),
        ('B1000001-0000-0000-0000-000000000005', 'United States Federal', 'US-FED', 'Federal', 'US', NULL, TRUE);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM __mj_BizAppsReferrals."ReferralTier" WHERE "Code" = 'STANDARD'
    ) THEN
        INSERT INTO __mj_BizAppsReferrals."ReferralTier" ("ID", "Name", "Code", "SLAResponseHours", "MaxCascadeAttempts", "PriorityWeight", "RequireConflictCheck", "Description", "IsActive")
        VALUES
        ('C1000001-0000-0000-0000-000000000001', 'Standard Referral', 'STANDARD', 24, 3, 1.00, TRUE, 'Standard 24-hour SLA response window with up to 3 cascade attempts.', TRUE),
        ('C1000001-0000-0000-0000-000000000002', 'Priority Concierge', 'PRIORITY', 8, 5, 1.50, TRUE, 'Accelerated 8-hour SLA response window with up to 5 cascade attempts.', TRUE),
        ('C1000001-0000-0000-0000-000000000003', 'Pro Bono Network', 'PRO_BONO', 48, 3, 1.00, TRUE, 'Pro bono referral tier with 48-hour SLA response window.', TRUE);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM __mj."Application" WHERE "Name" = 'Referrals'
    ) THEN
        INSERT INTO __mj."Application" ("ID", "Name", "Description", "Icon", "Path", "DefaultForNewUser")
        VALUES (
        'D1000001-0000-0000-0000-000000000001',
        'Referrals',
        'Professional Referral & Verified Member Directory Open App',
        'fa-solid fa-scale-balanced',
        'referrals',
        FALSE
        );
    END IF;
END $$;


-- ===================== Comments =====================

-- Extended property (could not parse)
-- -- =============================================================================
-- -- Table Descriptions (sp_addextendedproperty)
-- -- =============================================================================

COMMENT ON TABLE __mj_BizAppsReferrals."PracticeArea" IS 'Hierarchical taxonomy of legal, accounting, or advisory practice areas.';

COMMENT ON TABLE __mj_BizAppsReferrals."Jurisdiction" IS 'Hierarchical geographic or regulatory licensing jurisdictions.';

COMMENT ON TABLE __mj_BizAppsReferrals."ReferralTier" IS 'Service-level agreement tiers governing SLA response windows and cascade depth.';

COMMENT ON TABLE __mj_BizAppsReferrals."ProfessionalProfile" IS 'Verified member directory profile for credentialed professionals.';

COMMENT ON TABLE __mj_BizAppsReferrals."ProfessionalPracticeArea" IS 'Junction linking professionals to practice areas with proficiency metadata.';

COMMENT ON TABLE __mj_BizAppsReferrals."ProfessionalJurisdiction" IS 'Junction linking professionals to admitted jurisdictions and license standing.';

COMMENT ON TABLE __mj_BizAppsReferrals."ReferralRequest" IS 'Seeker referral intake request capturing matter details and routing state.';

COMMENT ON TABLE __mj_BizAppsReferrals."ConflictCheckParty" IS 'Parties involved in a referral matter screened for conflicts of interest.';

COMMENT ON TABLE __mj_BizAppsReferrals."ReferralAssignment" IS 'Sequential cascade assignment offering a referral request to a matched professional.';

COMMENT ON TABLE __mj_BizAppsReferrals."ReferralFeedback" IS 'Post-referral feedback, rating, and engagement outcome telemetry.';


-- ===================== Other =====================

-- =============================================================================
-- CodeGen Marker: Generated EntityField, vw*, sp*, and Trigger Objects
-- (Populated / verified by mj codegen against __mj_BizAppsReferrals)
-- =============================================================================
