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
    ELSIF v_has_legacy AND v_has_license THEN
        EXECUTE format(
            'UPDATE __mj_BizAppsReferrals."ProfessionalProfile" SET "LicenseNumber" = COALESCE("LicenseNumber", %I) WHERE "LicenseNumber" IS NULL AND %I IS NOT NULL',
            v_legacy_col,
            v_legacy_col
        );
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


-- 3. Operational MJ Base View & CRUD Functions for ProfessionalCredential
CREATE OR REPLACE VIEW __mj_BizAppsReferrals."vwProfessionalCredentials" AS
SELECT
    c.*,
    pp."DisplayName" AS "ProfessionalProfile",
    j."Name" AS "Jurisdiction",
    p."DisplayName" AS "VerifiedByPerson"
FROM
    __mj_BizAppsReferrals."ProfessionalCredential" AS c
INNER JOIN
    __mj_BizAppsReferrals."ProfessionalProfile" AS pp
  ON c."ProfessionalProfileID" = pp."ID"
LEFT OUTER JOIN
    __mj_BizAppsReferrals."Jurisdiction" AS j
  ON c."JurisdictionID" = j."ID"
LEFT OUTER JOIN
    __mj_BizAppsCommon."Person" AS p
  ON c."VerifiedByPersonID" = p."ID";

DO $$ BEGIN GRANT SELECT ON __mj_BizAppsReferrals."vwProfessionalCredentials" TO "cdp_UI", "cdp_Developer", "cdp_Integration"; EXCEPTION WHEN others THEN NULL; END $$;

CREATE OR REPLACE FUNCTION __mj_BizAppsReferrals."spCreateProfessionalCredential"(
    IN p_ID UUID DEFAULT NULL,
    IN p_ProfessionalProfileID UUID DEFAULT NULL,
    IN p_JurisdictionID_Clear BOOLEAN DEFAULT FALSE,
    IN p_JurisdictionID UUID DEFAULT NULL,
    IN p_CredentialCode VARCHAR(100) DEFAULT NULL,
    IN p_CredentialName VARCHAR(255) DEFAULT NULL,
    IN p_IssuerName_Clear BOOLEAN DEFAULT FALSE,
    IN p_IssuerName VARCHAR(255) DEFAULT NULL,
    IN p_ProviderKey VARCHAR(100) DEFAULT NULL,
    IN p_ExternalReferenceID_Clear BOOLEAN DEFAULT FALSE,
    IN p_ExternalReferenceID VARCHAR(255) DEFAULT NULL,
    IN p_VerificationStatus VARCHAR(30) DEFAULT NULL,
    IN p_IssuedAt_Clear BOOLEAN DEFAULT FALSE,
    IN p_IssuedAt TIMESTAMPTZ DEFAULT NULL,
    IN p_ExpiresAt_Clear BOOLEAN DEFAULT FALSE,
    IN p_ExpiresAt TIMESTAMPTZ DEFAULT NULL,
    IN p_VerifiedAt_Clear BOOLEAN DEFAULT FALSE,
    IN p_VerifiedAt TIMESTAMPTZ DEFAULT NULL,
    IN p_VerifiedByPersonID_Clear BOOLEAN DEFAULT FALSE,
    IN p_VerifiedByPersonID UUID DEFAULT NULL,
    IN p_EvidenceURL_Clear BOOLEAN DEFAULT FALSE,
    IN p_EvidenceURL VARCHAR(1000) DEFAULT NULL,
    IN p_MetadataJSON_Clear BOOLEAN DEFAULT FALSE,
    IN p_MetadataJSON TEXT DEFAULT NULL,
    IN p_IsPrimary BOOLEAN DEFAULT NULL
)
RETURNS SETOF __mj_BizAppsReferrals."vwProfessionalCredentials" AS
$$
DECLARE
    v_new_id UUID;
BEGIN
    v_new_id := COALESCE(p_ID, gen_random_uuid());
    INSERT INTO __mj_BizAppsReferrals."ProfessionalCredential" (
        "ID", "ProfessionalProfileID", "JurisdictionID", "CredentialCode", "CredentialName",
        "IssuerName", "ProviderKey", "ExternalReferenceID", "VerificationStatus",
        "IssuedAt", "ExpiresAt", "VerifiedAt", "VerifiedByPersonID",
        "EvidenceURL", "MetadataJSON", "IsPrimary"
    ) VALUES (
        v_new_id,
        p_ProfessionalProfileID,
        CASE WHEN p_JurisdictionID_Clear THEN NULL ELSE p_JurisdictionID END,
        p_CredentialCode,
        p_CredentialName,
        CASE WHEN p_IssuerName_Clear THEN NULL ELSE p_IssuerName END,
        COALESCE(p_ProviderKey, 'Manual'),
        CASE WHEN p_ExternalReferenceID_Clear THEN NULL ELSE p_ExternalReferenceID END,
        COALESCE(p_VerificationStatus, 'Pending'),
        CASE WHEN p_IssuedAt_Clear THEN NULL ELSE p_IssuedAt END,
        CASE WHEN p_ExpiresAt_Clear THEN NULL ELSE p_ExpiresAt END,
        CASE WHEN p_VerifiedAt_Clear THEN NULL ELSE p_VerifiedAt END,
        CASE WHEN p_VerifiedByPersonID_Clear THEN NULL ELSE p_VerifiedByPersonID END,
        CASE WHEN p_EvidenceURL_Clear THEN NULL ELSE p_EvidenceURL END,
        CASE WHEN p_MetadataJSON_Clear THEN NULL ELSE p_MetadataJSON END,
        COALESCE(p_IsPrimary, FALSE)
    );
    RETURN QUERY SELECT * FROM __mj_BizAppsReferrals."vwProfessionalCredentials" WHERE "ID" = v_new_id;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN GRANT EXECUTE ON FUNCTION __mj_BizAppsReferrals."spCreateProfessionalCredential" TO "cdp_Developer", "cdp_Integration"; EXCEPTION WHEN others THEN NULL; END $$;

CREATE OR REPLACE FUNCTION __mj_BizAppsReferrals."spUpdateProfessionalCredential"(
    IN p_ID UUID,
    IN p_ProfessionalProfileID UUID DEFAULT NULL,
    IN p_JurisdictionID_Clear BOOLEAN DEFAULT FALSE,
    IN p_JurisdictionID UUID DEFAULT NULL,
    IN p_CredentialCode VARCHAR(100) DEFAULT NULL,
    IN p_CredentialName VARCHAR(255) DEFAULT NULL,
    IN p_IssuerName_Clear BOOLEAN DEFAULT FALSE,
    IN p_IssuerName VARCHAR(255) DEFAULT NULL,
    IN p_ProviderKey VARCHAR(100) DEFAULT NULL,
    IN p_ExternalReferenceID_Clear BOOLEAN DEFAULT FALSE,
    IN p_ExternalReferenceID VARCHAR(255) DEFAULT NULL,
    IN p_VerificationStatus VARCHAR(30) DEFAULT NULL,
    IN p_IssuedAt_Clear BOOLEAN DEFAULT FALSE,
    IN p_IssuedAt TIMESTAMPTZ DEFAULT NULL,
    IN p_ExpiresAt_Clear BOOLEAN DEFAULT FALSE,
    IN p_ExpiresAt TIMESTAMPTZ DEFAULT NULL,
    IN p_VerifiedAt_Clear BOOLEAN DEFAULT FALSE,
    IN p_VerifiedAt TIMESTAMPTZ DEFAULT NULL,
    IN p_VerifiedByPersonID_Clear BOOLEAN DEFAULT FALSE,
    IN p_VerifiedByPersonID UUID DEFAULT NULL,
    IN p_EvidenceURL_Clear BOOLEAN DEFAULT FALSE,
    IN p_EvidenceURL VARCHAR(1000) DEFAULT NULL,
    IN p_MetadataJSON_Clear BOOLEAN DEFAULT FALSE,
    IN p_MetadataJSON TEXT DEFAULT NULL,
    IN p_IsPrimary BOOLEAN DEFAULT NULL
)
RETURNS SETOF __mj_BizAppsReferrals."vwProfessionalCredentials" AS
$$
BEGIN
    UPDATE __mj_BizAppsReferrals."ProfessionalCredential"
    SET
        "ProfessionalProfileID" = COALESCE(p_ProfessionalProfileID, "ProfessionalProfileID"),
        "JurisdictionID" = CASE WHEN p_JurisdictionID_Clear THEN NULL ELSE COALESCE(p_JurisdictionID, "JurisdictionID") END,
        "CredentialCode" = COALESCE(p_CredentialCode, "CredentialCode"),
        "CredentialName" = COALESCE(p_CredentialName, "CredentialName"),
        "IssuerName" = CASE WHEN p_IssuerName_Clear THEN NULL ELSE COALESCE(p_IssuerName, "IssuerName") END,
        "ProviderKey" = COALESCE(p_ProviderKey, "ProviderKey"),
        "ExternalReferenceID" = CASE WHEN p_ExternalReferenceID_Clear THEN NULL ELSE COALESCE(p_ExternalReferenceID, "ExternalReferenceID") END,
        "VerificationStatus" = COALESCE(p_VerificationStatus, "VerificationStatus"),
        "IssuedAt" = CASE WHEN p_IssuedAt_Clear THEN NULL ELSE COALESCE(p_IssuedAt, "IssuedAt") END,
        "ExpiresAt" = CASE WHEN p_ExpiresAt_Clear THEN NULL ELSE COALESCE(p_ExpiresAt, "ExpiresAt") END,
        "VerifiedAt" = CASE WHEN p_VerifiedAt_Clear THEN NULL ELSE COALESCE(p_VerifiedAt, "VerifiedAt") END,
        "VerifiedByPersonID" = CASE WHEN p_VerifiedByPersonID_Clear THEN NULL ELSE COALESCE(p_VerifiedByPersonID, "VerifiedByPersonID") END,
        "EvidenceURL" = CASE WHEN p_EvidenceURL_Clear THEN NULL ELSE COALESCE(p_EvidenceURL, "EvidenceURL") END,
        "MetadataJSON" = CASE WHEN p_MetadataJSON_Clear THEN NULL ELSE COALESCE(p_MetadataJSON, "MetadataJSON") END,
        "IsPrimary" = COALESCE(p_IsPrimary, "IsPrimary"),
        "__mj_UpdatedAt" = NOW()
    WHERE "ID" = p_ID;

    IF NOT FOUND THEN
        RETURN QUERY SELECT * FROM __mj_BizAppsReferrals."vwProfessionalCredentials" WHERE 1 = 0;
    ELSE
        RETURN QUERY SELECT * FROM __mj_BizAppsReferrals."vwProfessionalCredentials" WHERE "ID" = p_ID;
    END IF;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN GRANT EXECUTE ON FUNCTION __mj_BizAppsReferrals."spUpdateProfessionalCredential" TO "cdp_Developer", "cdp_Integration"; EXCEPTION WHEN others THEN NULL; END $$;

CREATE OR REPLACE FUNCTION __mj_BizAppsReferrals."spDeleteProfessionalCredential"(IN p_ID UUID)
RETURNS TABLE ("ID" UUID) AS
$$
BEGIN
    DELETE FROM __mj_BizAppsReferrals."ProfessionalCredential" WHERE "ID" = p_ID;
    IF NOT FOUND THEN
        RETURN QUERY SELECT NULL::UUID;
    ELSE
        RETURN QUERY SELECT p_ID;
    END IF;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN GRANT EXECUTE ON FUNCTION __mj_BizAppsReferrals."spDeleteProfessionalCredential" TO "cdp_Developer", "cdp_Integration"; EXCEPTION WHEN others THEN NULL; END $$;

-- 4. Refresh vwProfessionalProfiles to expose LicenseNumber
CREATE OR REPLACE VIEW __mj_BizAppsReferrals."vwProfessionalProfiles" AS
SELECT
    p.*,
    mjBizAppsCommonPerson_PersonID."DisplayName" AS "Person",
    mjBizAppsCommonOrganization_OrganizationID."Name" AS "Organization",
    MJUser_UserID."Name" AS "User"
FROM
    __mj_BizAppsReferrals."ProfessionalProfile" AS p
LEFT OUTER JOIN
    __mj_BizAppsCommon."Person" AS mjBizAppsCommonPerson_PersonID
  ON p."PersonID" = mjBizAppsCommonPerson_PersonID."ID"
LEFT OUTER JOIN
    __mj_BizAppsCommon."Organization" AS mjBizAppsCommonOrganization_OrganizationID
  ON p."OrganizationID" = mjBizAppsCommonOrganization_OrganizationID."ID"
LEFT OUTER JOIN
    __mj."User" AS MJUser_UserID
  ON p."UserID" = MJUser_UserID."ID";

DO $$ BEGIN GRANT SELECT ON __mj_BizAppsReferrals."vwProfessionalProfiles" TO "cdp_UI", "cdp_Developer", "cdp_Integration"; EXCEPTION WHEN others THEN NULL; END $$;
