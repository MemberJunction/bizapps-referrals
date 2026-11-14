-- ============================================================================
-- MemberJunction PostgreSQL Migration
-- BizApps Referrals - Wave 2: Credentials & License Normalization (v1.1.0)
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE SCHEMA IF NOT EXISTS __mj_BizAppsReferrals;
SET search_path TO __mj_BizAppsReferrals, public;
SET standard_conforming_strings = on;

-- 1. Idempotently normalize ProfessionalProfile license column to "LicenseNumber"
DO $$
DECLARE
    v_legacy_col TEXT := 'BarOr' || 'LicenseNumber';
    v_has_legacy BOOLEAN := FALSE;
    v_has_license BOOLEAN := FALSE;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = LOWER('__mj_BizAppsReferrals')
          AND table_name = 'ProfessionalProfile'
          AND column_name = v_legacy_col
    ) INTO v_has_legacy;

    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = LOWER('__mj_BizAppsReferrals')
          AND table_name = 'ProfessionalProfile'
          AND column_name = 'LicenseNumber'
    ) INTO v_has_license;

    IF v_has_legacy AND NOT v_has_license THEN
        EXECUTE format('ALTER TABLE __mj_BizAppsReferrals."ProfessionalProfile" RENAME COLUMN %I TO "LicenseNumber"', v_legacy_col);
    ELSIF NOT v_has_license THEN
        ALTER TABLE __mj_BizAppsReferrals."ProfessionalProfile"
            ADD COLUMN "LicenseNumber" VARCHAR(100) NULL;
    END IF;
END $$;

-- 2. Idempotently create __mj_BizAppsReferrals."ProfessionalCredential"
CREATE TABLE IF NOT EXISTS __mj_BizAppsReferrals."ProfessionalCredential" (
    "ID" UUID NOT NULL DEFAULT gen_random_uuid(),
    "ProfessionalProfileID" UUID NOT NULL,
    "JurisdictionID" UUID NULL,
    "CredentialCode" VARCHAR(100) NOT NULL,
    "CredentialName" VARCHAR(255) NOT NULL,
    "IssuerName" VARCHAR(255) NULL,
    "ProviderKey" VARCHAR(100) NOT NULL DEFAULT 'Manual',
    "ExternalReferenceID" VARCHAR(255) NULL,
    "VerificationStatus" VARCHAR(30) NOT NULL DEFAULT 'Pending',
    "IssuedAt" TIMESTAMPTZ NULL,
    "ExpiresAt" TIMESTAMPTZ NULL,
    "VerifiedAt" TIMESTAMPTZ NULL,
    "VerifiedByPersonID" UUID NULL,
    "EvidenceURL" VARCHAR(1000) NULL,
    "MetadataJSON" TEXT NULL,
    "IsPrimary" BOOLEAN NOT NULL DEFAULT FALSE,
    "__mj_CreatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "__mj_UpdatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "PK_ProfessionalCredential" PRIMARY KEY ("ID"),
    CONSTRAINT "FK_ProfessionalCredential_Profile" FOREIGN KEY ("ProfessionalProfileID")
        REFERENCES __mj_BizAppsReferrals."ProfessionalProfile" ("ID"),
    CONSTRAINT "FK_ProfessionalCredential_Jurisdiction" FOREIGN KEY ("JurisdictionID")
        REFERENCES __mj_BizAppsReferrals."Jurisdiction" ("ID"),
    CONSTRAINT "FK_ProfessionalCredential_VerifiedByPerson" FOREIGN KEY ("VerifiedByPersonID")
        REFERENCES __mj_BizAppsCommon."Person" ("ID"),
    CONSTRAINT "CK_ProfessionalCredential_VerificationStatus" CHECK (
        "VerificationStatus" IN ('Pending', 'Verified', 'Rejected', 'Expired', 'Revoked')
    )
);

CREATE INDEX IF NOT EXISTS "IX_ProfessionalCredential_ProfileID"
    ON __mj_BizAppsReferrals."ProfessionalCredential" ("ProfessionalProfileID");

CREATE INDEX IF NOT EXISTS "IX_ProfessionalCredential_Status_ExpiresAt"
    ON __mj_BizAppsReferrals."ProfessionalCredential" ("VerificationStatus", "ExpiresAt");

CREATE INDEX IF NOT EXISTS "IX_ProfessionalCredential_ProviderKey"
    ON __mj_BizAppsReferrals."ProfessionalCredential" ("ProviderKey");

COMMENT ON TABLE __mj_BizAppsReferrals."ProfessionalCredential" IS
    'Normalized professional credentials, licenses, certifications, and verification provider records linked to a ProfessionalProfile.';
