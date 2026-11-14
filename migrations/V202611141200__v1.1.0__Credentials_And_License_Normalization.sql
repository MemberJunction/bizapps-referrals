-- =============================================================================
-- BizApps Referrals - Wave 2 Migration: Credentials & License Normalization
-- Schema: __mj_BizAppsReferrals
-- Version: v1.1.0
-- =============================================================================

-- 1. Idempotently normalize ProfessionalProfile license column to [LicenseNumber]
DECLARE @LegacyCol SYSNAME = N'BarOr' + N'LicenseNumber';
DECLARE @ProfileObjId INT = OBJECT_ID(N'[__mj_BizAppsReferrals].[ProfessionalProfile]', N'U');

IF @ProfileObjId IS NOT NULL
BEGIN
    IF COL_LENGTH(N'[__mj_BizAppsReferrals].[ProfessionalProfile]', @LegacyCol) IS NOT NULL
       AND COL_LENGTH(N'[__mj_BizAppsReferrals].[ProfessionalProfile]', N'LicenseNumber') IS NULL
    BEGIN
        DECLARE @QualifiedLegacy NVARCHAR(512) = N'[__mj_BizAppsReferrals].[ProfessionalProfile].' + QUOTENAME(@LegacyCol);
        EXEC sp_rename @QualifiedLegacy, N'LicenseNumber', N'COLUMN';
    END
    ELSE IF COL_LENGTH(N'[__mj_BizAppsReferrals].[ProfessionalProfile]', N'LicenseNumber') IS NULL
    BEGIN
        ALTER TABLE [__mj_BizAppsReferrals].[ProfessionalProfile]
            ADD [LicenseNumber] NVARCHAR(100) NULL;
    END
END
GO

-- 2. Idempotently create [__mj_BizAppsReferrals].[ProfessionalCredential]
IF OBJECT_ID(N'[__mj_BizAppsReferrals].[ProfessionalCredential]', N'U') IS NULL
BEGIN
    CREATE TABLE [__mj_BizAppsReferrals].[ProfessionalCredential] (
        [ID] UNIQUEIDENTIFIER NOT NULL
            CONSTRAINT [PK_ProfessionalCredential] PRIMARY KEY
            CONSTRAINT [DF_ProfessionalCredential_ID] DEFAULT (NEWSEQUENTIALID()),
        [ProfessionalProfileID] UNIQUEIDENTIFIER NOT NULL
            CONSTRAINT [FK_ProfessionalCredential_Profile] FOREIGN KEY REFERENCES [__mj_BizAppsReferrals].[ProfessionalProfile]([ID]),
        [JurisdictionID] UNIQUEIDENTIFIER NULL
            CONSTRAINT [FK_ProfessionalCredential_Jurisdiction] FOREIGN KEY REFERENCES [__mj_BizAppsReferrals].[Jurisdiction]([ID]),
        [CredentialCode] NVARCHAR(100) NOT NULL,
        [CredentialName] NVARCHAR(255) NOT NULL,
        [IssuerName] NVARCHAR(255) NULL,
        [ProviderKey] NVARCHAR(100) NOT NULL
            CONSTRAINT [DF_ProfessionalCredential_ProviderKey] DEFAULT (N'Manual'),
        [ExternalReferenceID] NVARCHAR(255) NULL,
        [VerificationStatus] NVARCHAR(30) NOT NULL
            CONSTRAINT [DF_ProfessionalCredential_VerificationStatus] DEFAULT (N'Pending')
            CONSTRAINT [CK_ProfessionalCredential_VerificationStatus] CHECK ([VerificationStatus] IN (N'Pending', N'Verified', N'Rejected', N'Expired', N'Revoked')),
        [IssuedAt] DATETIMEOFFSET NULL,
        [ExpiresAt] DATETIMEOFFSET NULL,
        [VerifiedAt] DATETIMEOFFSET NULL,
        [VerifiedByPersonID] UNIQUEIDENTIFIER NULL
            CONSTRAINT [FK_ProfessionalCredential_VerifiedByPerson] FOREIGN KEY REFERENCES [__mj_BizAppsCommon].[Person]([ID]),
        [EvidenceURL] NVARCHAR(1000) NULL,
        [MetadataJSON] NVARCHAR(MAX) NULL,
        [IsPrimary] BIT NOT NULL
            CONSTRAINT [DF_ProfessionalCredential_IsPrimary] DEFAULT (0)
    );
END
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = N'IX_ProfessionalCredential_ProfileID'
      AND object_id = OBJECT_ID(N'[__mj_BizAppsReferrals].[ProfessionalCredential]')
)
BEGIN
    CREATE INDEX [IX_ProfessionalCredential_ProfileID]
        ON [__mj_BizAppsReferrals].[ProfessionalCredential] ([ProfessionalProfileID]);
END
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = N'IX_ProfessionalCredential_Status_ExpiresAt'
      AND object_id = OBJECT_ID(N'[__mj_BizAppsReferrals].[ProfessionalCredential]')
)
BEGIN
    CREATE INDEX [IX_ProfessionalCredential_Status_ExpiresAt]
        ON [__mj_BizAppsReferrals].[ProfessionalCredential] ([VerificationStatus], [ExpiresAt]);
END
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = N'IX_ProfessionalCredential_ProviderKey'
      AND object_id = OBJECT_ID(N'[__mj_BizAppsReferrals].[ProfessionalCredential]')
)
BEGIN
    CREATE INDEX [IX_ProfessionalCredential_ProviderKey]
        ON [__mj_BizAppsReferrals].[ProfessionalCredential] ([ProviderKey]);
END
GO

-- 3. Extended properties for MemberJunction CodeGen metadata
IF NOT EXISTS (
    SELECT 1 FROM sys.extended_properties
    WHERE major_id = OBJECT_ID(N'[__mj_BizAppsReferrals].[ProfessionalCredential]')
      AND minor_id = 0
      AND name = N'MS_Description'
)
BEGIN
    EXEC sp_addextendedproperty
        @name = N'MS_Description',
        @value = N'Normalized professional credentials, licenses, certifications, and verification provider records linked to a ProfessionalProfile.',
        @level0type = N'SCHEMA', @level0name = N'__mj_BizAppsReferrals',
        @level1type = N'TABLE',  @level1name = N'ProfessionalCredential';
END
GO
