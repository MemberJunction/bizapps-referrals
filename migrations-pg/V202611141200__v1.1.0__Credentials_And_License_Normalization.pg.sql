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
        EXECUTE format('ALTER TABLE __mj_BizAppsReferrals."ProfessionalProfile" DROP COLUMN IF EXISTS %I', v_legacy_col);
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

-- 5. Refresh spCreateProfessionalProfile and spUpdateProfessionalProfile with p_LicenseNumber
DO $$ DECLARE r record;
BEGIN
  FOR r IN SELECT oid::regprocedure AS sig FROM pg_proc
           WHERE proname = 'spCreateProfessionalProfile'
             AND pronamespace = '__mj_BizAppsReferrals'::regnamespace
  LOOP EXECUTE 'DROP FUNCTION IF EXISTS ' || r.sig || ' CASCADE';
  END LOOP;
END $$;

CREATE OR REPLACE FUNCTION __mj_BizAppsReferrals."spCreateProfessionalProfile"(
    IN p_ID UUID DEFAULT NULL,
    IN p_PersonID_Clear BOOLEAN DEFAULT FALSE,
    IN p_PersonID UUID DEFAULT NULL,
    IN p_OrganizationID_Clear BOOLEAN DEFAULT FALSE,
    IN p_OrganizationID UUID DEFAULT NULL,
    IN p_UserID_Clear BOOLEAN DEFAULT FALSE,
    IN p_UserID UUID DEFAULT NULL,
    IN p_DisplayName VARCHAR(200) DEFAULT NULL,
    IN p_FirmName_Clear BOOLEAN DEFAULT FALSE,
    IN p_FirmName VARCHAR(200) DEFAULT NULL,
    IN p_Email VARCHAR(255) DEFAULT NULL,
    IN p_Phone_Clear BOOLEAN DEFAULT FALSE,
    IN p_Phone VARCHAR(50) DEFAULT NULL,
    IN p_LicenseNumber_Clear BOOLEAN DEFAULT FALSE,
    IN p_LicenseNumber VARCHAR(100) DEFAULT NULL,
    IN p_VerificationStatus VARCHAR(30) DEFAULT NULL,
    IN p_AvailabilityStatus VARCHAR(30) DEFAULT NULL,
    IN p_Bio_Clear BOOLEAN DEFAULT FALSE,
    IN p_Bio TEXT DEFAULT NULL,
    IN p_YearsExperience INTEGER DEFAULT NULL,
    IN p_Languages_Clear BOOLEAN DEFAULT FALSE,
    IN p_Languages VARCHAR(255) DEFAULT NULL,
    IN p_HourlyRateMin_Clear BOOLEAN DEFAULT FALSE,
    IN p_HourlyRateMin NUMERIC(10,2) DEFAULT NULL,
    IN p_HourlyRateMax_Clear BOOLEAN DEFAULT FALSE,
    IN p_HourlyRateMax NUMERIC(10,2) DEFAULT NULL,
    IN p_AcceptsProBono BOOLEAN DEFAULT NULL,
    IN p_AcceptsContingency BOOLEAN DEFAULT NULL,
    IN p_ActiveReferralCount INTEGER DEFAULT NULL,
    IN p_MaxConcurrentReferrals INTEGER DEFAULT NULL,
    IN p_AverageResponseHours_Clear BOOLEAN DEFAULT FALSE,
    IN p_AverageResponseHours NUMERIC(6,2) DEFAULT NULL,
    IN p_AverageRating_Clear BOOLEAN DEFAULT FALSE,
    IN p_AverageRating NUMERIC(3,2) DEFAULT NULL,
    IN p_TotalAcceptedCount INTEGER DEFAULT NULL,
    IN p_TotalCompletedCount INTEGER DEFAULT NULL,
    IN p_IsActive BOOLEAN DEFAULT NULL
)
RETURNS SETOF __mj_BizAppsReferrals."vwProfessionalProfiles" AS
$$
DECLARE
    v_new_id UUID := COALESCE(p_ID, gen_random_uuid());
BEGIN
    INSERT INTO __mj_BizAppsReferrals."ProfessionalProfile" (
        "ID", "PersonID", "OrganizationID", "UserID", "DisplayName", "FirmName", "Email", "Phone", "LicenseNumber",
        "VerificationStatus", "AvailabilityStatus", "Bio", "YearsExperience", "Languages",
        "HourlyRateMin", "HourlyRateMax", "AcceptsProBono", "AcceptsContingency",
        "ActiveReferralCount", "MaxConcurrentReferrals", "AverageResponseHours", "AverageRating",
        "TotalAcceptedCount", "TotalCompletedCount", "IsActive"
    ) VALUES (
        v_new_id,
        CASE WHEN p_PersonID_Clear THEN NULL ELSE p_PersonID END,
        CASE WHEN p_OrganizationID_Clear THEN NULL ELSE p_OrganizationID END,
        CASE WHEN p_UserID_Clear THEN NULL ELSE p_UserID END,
        p_DisplayName,
        CASE WHEN p_FirmName_Clear THEN NULL ELSE p_FirmName END,
        p_Email,
        CASE WHEN p_Phone_Clear THEN NULL ELSE p_Phone END,
        CASE WHEN p_LicenseNumber_Clear THEN NULL ELSE p_LicenseNumber END,
        COALESCE(p_VerificationStatus, 'Pending'),
        COALESCE(p_AvailabilityStatus, 'Available'),
        CASE WHEN p_Bio_Clear THEN NULL ELSE p_Bio END,
        COALESCE(p_YearsExperience, 0),
        CASE WHEN p_Languages_Clear THEN NULL ELSE COALESCE(p_Languages, 'English') END,
        CASE WHEN p_HourlyRateMin_Clear THEN NULL ELSE p_HourlyRateMin END,
        CASE WHEN p_HourlyRateMax_Clear THEN NULL ELSE p_HourlyRateMax END,
        COALESCE(p_AcceptsProBono, FALSE),
        COALESCE(p_AcceptsContingency, FALSE),
        COALESCE(p_ActiveReferralCount, 0),
        COALESCE(p_MaxConcurrentReferrals, 10),
        CASE WHEN p_AverageResponseHours_Clear THEN NULL ELSE p_AverageResponseHours END,
        CASE WHEN p_AverageRating_Clear THEN NULL ELSE p_AverageRating END,
        COALESCE(p_TotalAcceptedCount, 0),
        COALESCE(p_TotalCompletedCount, 0),
        COALESCE(p_IsActive, TRUE)
    );
    RETURN QUERY SELECT * FROM __mj_BizAppsReferrals."vwProfessionalProfiles" WHERE "ID" = v_new_id;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN GRANT EXECUTE ON FUNCTION __mj_BizAppsReferrals."spCreateProfessionalProfile" TO "cdp_Developer", "cdp_Integration"; EXCEPTION WHEN others THEN NULL; END $$;

DO $$ DECLARE r record;
BEGIN
  FOR r IN SELECT oid::regprocedure AS sig FROM pg_proc
           WHERE proname = 'spUpdateProfessionalProfile'
             AND pronamespace = '__mj_BizAppsReferrals'::regnamespace
  LOOP EXECUTE 'DROP FUNCTION IF EXISTS ' || r.sig || ' CASCADE';
  END LOOP;
END $$;

CREATE OR REPLACE FUNCTION __mj_BizAppsReferrals."spUpdateProfessionalProfile"(
    IN p_ID UUID,
    IN p_PersonID_Clear BOOLEAN DEFAULT FALSE,
    IN p_PersonID UUID DEFAULT NULL,
    IN p_OrganizationID_Clear BOOLEAN DEFAULT FALSE,
    IN p_OrganizationID UUID DEFAULT NULL,
    IN p_UserID_Clear BOOLEAN DEFAULT FALSE,
    IN p_UserID UUID DEFAULT NULL,
    IN p_DisplayName VARCHAR(200) DEFAULT NULL,
    IN p_FirmName_Clear BOOLEAN DEFAULT FALSE,
    IN p_FirmName VARCHAR(200) DEFAULT NULL,
    IN p_Email VARCHAR(255) DEFAULT NULL,
    IN p_Phone_Clear BOOLEAN DEFAULT FALSE,
    IN p_Phone VARCHAR(50) DEFAULT NULL,
    IN p_LicenseNumber_Clear BOOLEAN DEFAULT FALSE,
    IN p_LicenseNumber VARCHAR(100) DEFAULT NULL,
    IN p_VerificationStatus VARCHAR(30) DEFAULT NULL,
    IN p_AvailabilityStatus VARCHAR(30) DEFAULT NULL,
    IN p_Bio_Clear BOOLEAN DEFAULT FALSE,
    IN p_Bio TEXT DEFAULT NULL,
    IN p_YearsExperience INTEGER DEFAULT NULL,
    IN p_Languages_Clear BOOLEAN DEFAULT FALSE,
    IN p_Languages VARCHAR(255) DEFAULT NULL,
    IN p_HourlyRateMin_Clear BOOLEAN DEFAULT FALSE,
    IN p_HourlyRateMin NUMERIC(10,2) DEFAULT NULL,
    IN p_HourlyRateMax_Clear BOOLEAN DEFAULT FALSE,
    IN p_HourlyRateMax NUMERIC(10,2) DEFAULT NULL,
    IN p_AcceptsProBono BOOLEAN DEFAULT NULL,
    IN p_AcceptsContingency BOOLEAN DEFAULT NULL,
    IN p_ActiveReferralCount INTEGER DEFAULT NULL,
    IN p_MaxConcurrentReferrals INTEGER DEFAULT NULL,
    IN p_AverageResponseHours_Clear BOOLEAN DEFAULT FALSE,
    IN p_AverageResponseHours NUMERIC(6,2) DEFAULT NULL,
    IN p_AverageRating_Clear BOOLEAN DEFAULT FALSE,
    IN p_AverageRating NUMERIC(3,2) DEFAULT NULL,
    IN p_TotalAcceptedCount INTEGER DEFAULT NULL,
    IN p_TotalCompletedCount INTEGER DEFAULT NULL,
    IN p_IsActive BOOLEAN DEFAULT NULL
)
RETURNS SETOF __mj_BizAppsReferrals."vwProfessionalProfiles" AS
$$
DECLARE
    _v_row_count INTEGER;
BEGIN
    UPDATE __mj_BizAppsReferrals."ProfessionalProfile"
    SET
        "PersonID" = CASE WHEN p_PersonID_Clear = TRUE THEN NULL ELSE COALESCE(p_PersonID, "PersonID") END,
        "OrganizationID" = CASE WHEN p_OrganizationID_Clear = TRUE THEN NULL ELSE COALESCE(p_OrganizationID, "OrganizationID") END,
        "UserID" = CASE WHEN p_UserID_Clear = TRUE THEN NULL ELSE COALESCE(p_UserID, "UserID") END,
        "DisplayName" = COALESCE(p_DisplayName, "DisplayName"),
        "FirmName" = CASE WHEN p_FirmName_Clear = TRUE THEN NULL ELSE COALESCE(p_FirmName, "FirmName") END,
        "Email" = COALESCE(p_Email, "Email"),
        "Phone" = CASE WHEN p_Phone_Clear = TRUE THEN NULL ELSE COALESCE(p_Phone, "Phone") END,
        "LicenseNumber" = CASE WHEN p_LicenseNumber_Clear = TRUE THEN NULL ELSE COALESCE(p_LicenseNumber, "LicenseNumber") END,
        "VerificationStatus" = COALESCE(p_VerificationStatus, "VerificationStatus"),
        "AvailabilityStatus" = COALESCE(p_AvailabilityStatus, "AvailabilityStatus"),
        "Bio" = CASE WHEN p_Bio_Clear = TRUE THEN NULL ELSE COALESCE(p_Bio, "Bio") END,
        "YearsExperience" = COALESCE(p_YearsExperience, "YearsExperience"),
        "Languages" = CASE WHEN p_Languages_Clear = TRUE THEN NULL ELSE COALESCE(p_Languages, "Languages") END,
        "HourlyRateMin" = CASE WHEN p_HourlyRateMin_Clear = TRUE THEN NULL ELSE COALESCE(p_HourlyRateMin, "HourlyRateMin") END,
        "HourlyRateMax" = CASE WHEN p_HourlyRateMax_Clear = TRUE THEN NULL ELSE COALESCE(p_HourlyRateMax, "HourlyRateMax") END,
        "AcceptsProBono" = COALESCE(p_AcceptsProBono, "AcceptsProBono"),
        "AcceptsContingency" = COALESCE(p_AcceptsContingency, "AcceptsContingency"),
        "ActiveReferralCount" = COALESCE(p_ActiveReferralCount, "ActiveReferralCount"),
        "MaxConcurrentReferrals" = COALESCE(p_MaxConcurrentReferrals, "MaxConcurrentReferrals"),
        "AverageResponseHours" = CASE WHEN p_AverageResponseHours_Clear = TRUE THEN NULL ELSE COALESCE(p_AverageResponseHours, "AverageResponseHours") END,
        "AverageRating" = CASE WHEN p_AverageRating_Clear = TRUE THEN NULL ELSE COALESCE(p_AverageRating, "AverageRating") END,
        "TotalAcceptedCount" = COALESCE(p_TotalAcceptedCount, "TotalAcceptedCount"),
        "TotalCompletedCount" = COALESCE(p_TotalCompletedCount, "TotalCompletedCount"),
        "IsActive" = COALESCE(p_IsActive, "IsActive"),
        "__mj_UpdatedAt" = NOW()
    WHERE "ID" = p_ID;

    GET DIAGNOSTICS _v_row_count = ROW_COUNT;

    IF _v_row_count = 0 THEN
        RETURN QUERY SELECT * FROM __mj_BizAppsReferrals."vwProfessionalProfiles" WHERE 1=0;
    ELSE
        RETURN QUERY SELECT * FROM __mj_BizAppsReferrals."vwProfessionalProfiles" WHERE "ID" = p_ID;
    END IF;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN GRANT EXECUTE ON FUNCTION __mj_BizAppsReferrals."spUpdateProfessionalProfile" TO "cdp_Developer", "cdp_Integration"; EXCEPTION WHEN others THEN NULL; END $$;

-- 6. Deterministic idempotent MJ Entity & EntityField metadata deployment
DO $$
DECLARE
    v_legacy_field TEXT := 'BarOr' || 'LicenseNumber';
    v_profile_entity_id UUID := '7492a921-ffcf-4a3e-b59a-56c88d16dde1';
    v_cred_entity_id UUID := 'd1000001-0000-0000-0000-000000000011';
    v_app_id UUID := 'e66ee2f8-d87b-49c7-ab5c-c6284163aef2';
    v_has_entity BOOLEAN;
    v_has_entity_field BOOLEAN;
    v_has_app_entity BOOLEAN;
    v_next_seq INTEGER;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = '__mj' AND table_name = 'Entity'
    ) INTO v_has_entity;
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = '__mj' AND table_name = 'EntityField'
    ) INTO v_has_entity_field;
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = '__mj' AND table_name = 'ApplicationEntity'
    ) INTO v_has_app_entity;

    IF v_has_entity AND v_has_entity_field THEN
        UPDATE __mj."EntityField"
        SET "Name" = 'LicenseNumber',
            "DisplayName" = 'License Number',
            "__mj_UpdatedAt" = NOW()
        WHERE "EntityID" = v_profile_entity_id
          AND "Name" = v_legacy_field;

        SELECT "ID" INTO v_cred_entity_id
        FROM __mj."Entity"
        WHERE "Name" = 'MJ_BizApps_Referrals: Professional Credentials'
        LIMIT 1;

        IF v_cred_entity_id IS NULL THEN
            v_cred_entity_id := 'd1000001-0000-0000-0000-000000000011';
            INSERT INTO __mj."Entity" (
                "ID", "Name", "DisplayName", "Description", "BaseTable", "BaseView", "SchemaName",
                "IncludeInAPI", "AllowUserSearchAPI", "TrackRecordChanges", "AuditRecordAccess",
                "AllowCreateAPI", "AllowUpdateAPI", "AllowDeleteAPI", "UserViewMaxRows",
                "__mj_CreatedAt", "__mj_UpdatedAt"
            )
            VALUES (
                v_cred_entity_id,
                'MJ_BizApps_Referrals: Professional Credentials',
                'Professional Credentials',
                'Normalized professional credentials, licenses, certifications, and verification provider records linked to a ProfessionalProfile.',
                'ProfessionalCredential',
                'vwProfessionalCredentials',
                '__mj_BizAppsReferrals',
                TRUE, TRUE, TRUE, FALSE, TRUE, TRUE, TRUE, 1000,
                NOW(), NOW()
            );
        END IF;

        IF v_has_app_entity AND NOT EXISTS (
            SELECT 1 FROM __mj."ApplicationEntity"
            WHERE "ApplicationID" = v_app_id AND "EntityID" = v_cred_entity_id
        ) THEN
            SELECT COALESCE(MAX("Sequence"), 0) + 1 INTO v_next_seq
            FROM __mj."ApplicationEntity"
            WHERE "ApplicationID" = v_app_id;

            INSERT INTO __mj."ApplicationEntity" ("ApplicationID", "EntityID", "Sequence", "__mj_CreatedAt", "__mj_UpdatedAt")
            VALUES (v_app_id, v_cred_entity_id, v_next_seq, NOW(), NOW());
        END IF;

        INSERT INTO __mj."EntityField" (
            "ID", "EntityID", "Sequence", "Name", "DisplayName", "Type", "Length", "AllowsNull", "IsPrimaryKey",
            "AllowUpdateAPI", "__mj_CreatedAt", "__mj_UpdatedAt"
        )
        SELECT
            gen_random_uuid(), v_cred_entity_id, f.seq, f.name, f.display_name, f.data_type, f.len, f.allows_null, f.is_pk,
            NOT (f.is_pk OR f.name LIKE '__mj_%'), NOW(), NOW()
        FROM (VALUES
            (1,  'ID',                    'ID',                    'uuid',         16,   FALSE, TRUE),
            (2,  'ProfessionalProfileID', 'Professional Profile',  'uuid',         16,   FALSE, FALSE),
            (3,  'JurisdictionID',        'Jurisdiction',          'uuid',         16,   TRUE,  FALSE),
            (4,  'CredentialCode',        'Credential Code',       'varchar',      100,  FALSE, FALSE),
            (5,  'CredentialName',        'Credential Name',       'varchar',      255,  FALSE, FALSE),
            (6,  'IssuerName',            'Issuer Name',           'varchar',      255,  TRUE,  FALSE),
            (7,  'ProviderKey',           'Provider Key',          'varchar',      100,  FALSE, FALSE),
            (8,  'ExternalReferenceID',   'External Reference ID', 'varchar',      255,  TRUE,  FALSE),
            (9,  'VerificationStatus',    'Verification Status',   'varchar',      30,   FALSE, FALSE),
            (10, 'IssuedAt',              'Issued At',             'timestamptz',  8,    TRUE,  FALSE),
            (11, 'ExpiresAt',             'Expires At',            'timestamptz',  8,    TRUE,  FALSE),
            (12, 'VerifiedAt',            'Verified At',           'timestamptz',  8,    TRUE,  FALSE),
            (13, 'VerifiedByPersonID',    'Verified By Person',    'uuid',         16,   TRUE,  FALSE),
            (14, 'EvidenceURL',           'Evidence URL',          'varchar',      1000, TRUE,  FALSE),
            (15, 'MetadataJSON',          'Metadata JSON',         'text',         -1,   TRUE,  FALSE),
            (16, 'IsPrimary',             'Is Primary',            'boolean',      1,    FALSE, FALSE),
            (17, '__mj_CreatedAt',        'Created At',            'timestamptz',  8,    FALSE, FALSE),
            (18, '__mj_UpdatedAt',        'Updated At',            'timestamptz',  8,    FALSE, FALSE)
        ) AS f(seq, name, display_name, data_type, len, allows_null, is_pk)
        WHERE NOT EXISTS (
            SELECT 1 FROM __mj."EntityField" AS ef
            WHERE ef."EntityID" = v_cred_entity_id AND ef."Name" = f.name
        );
    END IF;
END $$;
