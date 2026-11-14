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
    ELSE IF COL_LENGTH(N'[__mj_BizAppsReferrals].[ProfessionalProfile]', @LegacyCol) IS NOT NULL
       AND COL_LENGTH(N'[__mj_BizAppsReferrals].[ProfessionalProfile]', N'LicenseNumber') IS NOT NULL
    BEGIN
        -- Preserve any values from the legacy column into LicenseNumber when both exist
        DECLARE @CopySql NVARCHAR(MAX) =
            N'UPDATE [__mj_BizAppsReferrals].[ProfessionalProfile] SET [LicenseNumber] = COALESCE([LicenseNumber], '
            + QUOTENAME(@LegacyCol) + N') WHERE [LicenseNumber] IS NULL AND ' + QUOTENAME(@LegacyCol) + N' IS NOT NULL;';
        EXEC sp_executesql @CopySql;
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
            CONSTRAINT [DF_ProfessionalCredential_IsPrimary] DEFAULT (0),
        [__mj_CreatedAt] DATETIMEOFFSET NOT NULL
            CONSTRAINT [DF_ProfessionalCredential___mj_CreatedAt] DEFAULT (GETUTCDATE()),
        [__mj_UpdatedAt] DATETIMEOFFSET NOT NULL
            CONSTRAINT [DF_ProfessionalCredential___mj_UpdatedAt] DEFAULT (GETUTCDATE())
    );
END
ELSE
BEGIN
    IF COL_LENGTH(N'[__mj_BizAppsReferrals].[ProfessionalCredential]', N'__mj_CreatedAt') IS NULL
        ALTER TABLE [__mj_BizAppsReferrals].[ProfessionalCredential]
            ADD [__mj_CreatedAt] DATETIMEOFFSET NOT NULL
                CONSTRAINT [DF_ProfessionalCredential___mj_CreatedAt] DEFAULT (GETUTCDATE());
    IF COL_LENGTH(N'[__mj_BizAppsReferrals].[ProfessionalCredential]', N'__mj_UpdatedAt') IS NULL
        ALTER TABLE [__mj_BizAppsReferrals].[ProfessionalCredential]
            ADD [__mj_UpdatedAt] DATETIMEOFFSET NOT NULL
                CONSTRAINT [DF_ProfessionalCredential___mj_UpdatedAt] DEFAULT (GETUTCDATE());
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


-- 4. Operational MJ Base View & CRUD Procedures for ProfessionalCredential
IF OBJECT_ID('[__mj_BizAppsReferrals].[vwProfessionalCredentials]', 'V') IS NOT NULL
    DROP VIEW [__mj_BizAppsReferrals].[vwProfessionalCredentials];
GO

CREATE VIEW [__mj_BizAppsReferrals].[vwProfessionalCredentials]
AS
SELECT
    c.*,
    pp.[DisplayName] AS [ProfessionalProfile],
    j.[Name] AS [Jurisdiction],
    p.[DisplayName] AS [VerifiedByPerson]
FROM
    [__mj_BizAppsReferrals].[ProfessionalCredential] AS c
INNER JOIN
    [__mj_BizAppsReferrals].[ProfessionalProfile] AS pp
  ON c.[ProfessionalProfileID] = pp.[ID]
LEFT OUTER JOIN
    [__mj_BizAppsReferrals].[Jurisdiction] AS j
  ON c.[JurisdictionID] = j.[ID]
LEFT OUTER JOIN
    [__mj_BizAppsCommon].[Person] AS p
  ON c.[VerifiedByPersonID] = p.[ID];
GO

GRANT SELECT ON [__mj_BizAppsReferrals].[vwProfessionalCredentials] TO [cdp_UI], [cdp_Developer], [cdp_Integration];
GO

IF OBJECT_ID('[__mj_BizAppsReferrals].[spCreateProfessionalCredential]', 'P') IS NOT NULL
    DROP PROCEDURE [__mj_BizAppsReferrals].[spCreateProfessionalCredential];
GO

CREATE PROCEDURE [__mj_BizAppsReferrals].[spCreateProfessionalCredential]
    @ID uniqueidentifier = NULL,
    @ProfessionalProfileID uniqueidentifier,
    @JurisdictionID_Clear bit = 0,
    @JurisdictionID uniqueidentifier = NULL,
    @CredentialCode nvarchar(100),
    @CredentialName nvarchar(255),
    @IssuerName_Clear bit = 0,
    @IssuerName nvarchar(255) = NULL,
    @ProviderKey nvarchar(100) = NULL,
    @ExternalReferenceID_Clear bit = 0,
    @ExternalReferenceID nvarchar(255) = NULL,
    @VerificationStatus nvarchar(30) = NULL,
    @IssuedAt_Clear bit = 0,
    @IssuedAt datetimeoffset = NULL,
    @ExpiresAt_Clear bit = 0,
    @ExpiresAt datetimeoffset = NULL,
    @VerifiedAt_Clear bit = 0,
    @VerifiedAt datetimeoffset = NULL,
    @VerifiedByPersonID_Clear bit = 0,
    @VerifiedByPersonID uniqueidentifier = NULL,
    @EvidenceURL_Clear bit = 0,
    @EvidenceURL nvarchar(1000) = NULL,
    @MetadataJSON_Clear bit = 0,
    @MetadataJSON nvarchar(MAX) = NULL,
    @IsPrimary bit = NULL
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @InsertedRow TABLE ([ID] UNIQUEIDENTIFIER);

    IF @ID IS NOT NULL
    BEGIN
        INSERT INTO [__mj_BizAppsReferrals].[ProfessionalCredential]
            (
                [ID], [ProfessionalProfileID], [JurisdictionID], [CredentialCode], [CredentialName],
                [IssuerName], [ProviderKey], [ExternalReferenceID], [VerificationStatus],
                [IssuedAt], [ExpiresAt], [VerifiedAt], [VerifiedByPersonID],
                [EvidenceURL], [MetadataJSON], [IsPrimary]
            )
        OUTPUT INSERTED.[ID] INTO @InsertedRow
        VALUES
            (
                @ID, @ProfessionalProfileID,
                CASE WHEN @JurisdictionID_Clear = 1 THEN NULL ELSE @JurisdictionID END,
                @CredentialCode, @CredentialName,
                CASE WHEN @IssuerName_Clear = 1 THEN NULL ELSE @IssuerName END,
                ISNULL(@ProviderKey, N'Manual'),
                CASE WHEN @ExternalReferenceID_Clear = 1 THEN NULL ELSE @ExternalReferenceID END,
                ISNULL(@VerificationStatus, N'Pending'),
                CASE WHEN @IssuedAt_Clear = 1 THEN NULL ELSE @IssuedAt END,
                CASE WHEN @ExpiresAt_Clear = 1 THEN NULL ELSE @ExpiresAt END,
                CASE WHEN @VerifiedAt_Clear = 1 THEN NULL ELSE @VerifiedAt END,
                CASE WHEN @VerifiedByPersonID_Clear = 1 THEN NULL ELSE @VerifiedByPersonID END,
                CASE WHEN @EvidenceURL_Clear = 1 THEN NULL ELSE @EvidenceURL END,
                CASE WHEN @MetadataJSON_Clear = 1 THEN NULL ELSE @MetadataJSON END,
                ISNULL(@IsPrimary, 0)
            );
    END
    ELSE
    BEGIN
        INSERT INTO [__mj_BizAppsReferrals].[ProfessionalCredential]
            (
                [ProfessionalProfileID], [JurisdictionID], [CredentialCode], [CredentialName],
                [IssuerName], [ProviderKey], [ExternalReferenceID], [VerificationStatus],
                [IssuedAt], [ExpiresAt], [VerifiedAt], [VerifiedByPersonID],
                [EvidenceURL], [MetadataJSON], [IsPrimary]
            )
        OUTPUT INSERTED.[ID] INTO @InsertedRow
        VALUES
            (
                @ProfessionalProfileID,
                CASE WHEN @JurisdictionID_Clear = 1 THEN NULL ELSE @JurisdictionID END,
                @CredentialCode, @CredentialName,
                CASE WHEN @IssuerName_Clear = 1 THEN NULL ELSE @IssuerName END,
                ISNULL(@ProviderKey, N'Manual'),
                CASE WHEN @ExternalReferenceID_Clear = 1 THEN NULL ELSE @ExternalReferenceID END,
                ISNULL(@VerificationStatus, N'Pending'),
                CASE WHEN @IssuedAt_Clear = 1 THEN NULL ELSE @IssuedAt END,
                CASE WHEN @ExpiresAt_Clear = 1 THEN NULL ELSE @ExpiresAt END,
                CASE WHEN @VerifiedAt_Clear = 1 THEN NULL ELSE @VerifiedAt END,
                CASE WHEN @VerifiedByPersonID_Clear = 1 THEN NULL ELSE @VerifiedByPersonID END,
                CASE WHEN @EvidenceURL_Clear = 1 THEN NULL ELSE @EvidenceURL END,
                CASE WHEN @MetadataJSON_Clear = 1 THEN NULL ELSE @MetadataJSON END,
                ISNULL(@IsPrimary, 0)
            );
    END

    SELECT * FROM [__mj_BizAppsReferrals].[vwProfessionalCredentials] WHERE [ID] = (SELECT [ID] FROM @InsertedRow);
END
GO

GRANT EXECUTE ON [__mj_BizAppsReferrals].[spCreateProfessionalCredential] TO [cdp_Developer], [cdp_Integration];
GO

IF OBJECT_ID('[__mj_BizAppsReferrals].[spUpdateProfessionalCredential]', 'P') IS NOT NULL
    DROP PROCEDURE [__mj_BizAppsReferrals].[spUpdateProfessionalCredential];
GO

CREATE PROCEDURE [__mj_BizAppsReferrals].[spUpdateProfessionalCredential]
    @ID uniqueidentifier,
    @ProfessionalProfileID uniqueidentifier = NULL,
    @JurisdictionID_Clear bit = 0,
    @JurisdictionID uniqueidentifier = NULL,
    @CredentialCode nvarchar(100) = NULL,
    @CredentialName nvarchar(255) = NULL,
    @IssuerName_Clear bit = 0,
    @IssuerName nvarchar(255) = NULL,
    @ProviderKey nvarchar(100) = NULL,
    @ExternalReferenceID_Clear bit = 0,
    @ExternalReferenceID nvarchar(255) = NULL,
    @VerificationStatus nvarchar(30) = NULL,
    @IssuedAt_Clear bit = 0,
    @IssuedAt datetimeoffset = NULL,
    @ExpiresAt_Clear bit = 0,
    @ExpiresAt datetimeoffset = NULL,
    @VerifiedAt_Clear bit = 0,
    @VerifiedAt datetimeoffset = NULL,
    @VerifiedByPersonID_Clear bit = 0,
    @VerifiedByPersonID uniqueidentifier = NULL,
    @EvidenceURL_Clear bit = 0,
    @EvidenceURL nvarchar(1000) = NULL,
    @MetadataJSON_Clear bit = 0,
    @MetadataJSON nvarchar(MAX) = NULL,
    @IsPrimary bit = NULL
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE [__mj_BizAppsReferrals].[ProfessionalCredential]
    SET
        [ProfessionalProfileID] = ISNULL(@ProfessionalProfileID, [ProfessionalProfileID]),
        [JurisdictionID] = CASE WHEN @JurisdictionID_Clear = 1 THEN NULL ELSE ISNULL(@JurisdictionID, [JurisdictionID]) END,
        [CredentialCode] = ISNULL(@CredentialCode, [CredentialCode]),
        [CredentialName] = ISNULL(@CredentialName, [CredentialName]),
        [IssuerName] = CASE WHEN @IssuerName_Clear = 1 THEN NULL ELSE ISNULL(@IssuerName, [IssuerName]) END,
        [ProviderKey] = ISNULL(@ProviderKey, [ProviderKey]),
        [ExternalReferenceID] = CASE WHEN @ExternalReferenceID_Clear = 1 THEN NULL ELSE ISNULL(@ExternalReferenceID, [ExternalReferenceID]) END,
        [VerificationStatus] = ISNULL(@VerificationStatus, [VerificationStatus]),
        [IssuedAt] = CASE WHEN @IssuedAt_Clear = 1 THEN NULL ELSE ISNULL(@IssuedAt, [IssuedAt]) END,
        [ExpiresAt] = CASE WHEN @ExpiresAt_Clear = 1 THEN NULL ELSE ISNULL(@ExpiresAt, [ExpiresAt]) END,
        [VerifiedAt] = CASE WHEN @VerifiedAt_Clear = 1 THEN NULL ELSE ISNULL(@VerifiedAt, [VerifiedAt]) END,
        [VerifiedByPersonID] = CASE WHEN @VerifiedByPersonID_Clear = 1 THEN NULL ELSE ISNULL(@VerifiedByPersonID, [VerifiedByPersonID]) END,
        [EvidenceURL] = CASE WHEN @EvidenceURL_Clear = 1 THEN NULL ELSE ISNULL(@EvidenceURL, [EvidenceURL]) END,
        [MetadataJSON] = CASE WHEN @MetadataJSON_Clear = 1 THEN NULL ELSE ISNULL(@MetadataJSON, [MetadataJSON]) END,
        [IsPrimary] = ISNULL(@IsPrimary, [IsPrimary]),
        [__mj_UpdatedAt] = GETUTCDATE()
    WHERE [ID] = @ID;

    IF @@ROWCOUNT = 0
        SELECT TOP 0 * FROM [__mj_BizAppsReferrals].[vwProfessionalCredentials] WHERE 1=0;
    ELSE
        SELECT * FROM [__mj_BizAppsReferrals].[vwProfessionalCredentials] WHERE [ID] = @ID;
END
GO

GRANT EXECUTE ON [__mj_BizAppsReferrals].[spUpdateProfessionalCredential] TO [cdp_Developer], [cdp_Integration];
GO

IF OBJECT_ID('[__mj_BizAppsReferrals].[spDeleteProfessionalCredential]', 'P') IS NOT NULL
    DROP PROCEDURE [__mj_BizAppsReferrals].[spDeleteProfessionalCredential];
GO

CREATE PROCEDURE [__mj_BizAppsReferrals].[spDeleteProfessionalCredential]
    @ID uniqueidentifier
AS
BEGIN
    SET NOCOUNT ON;
    DELETE FROM [__mj_BizAppsReferrals].[ProfessionalCredential] WHERE [ID] = @ID;
    IF @@ROWCOUNT = 0
        SELECT NULL AS [ID];
    ELSE
        SELECT @ID AS [ID];
END
GO

GRANT EXECUTE ON [__mj_BizAppsReferrals].[spDeleteProfessionalCredential] TO [cdp_Developer], [cdp_Integration];
GO

-- 5. Refresh vwProfessionalProfiles to ensure LicenseNumber is exposed after normalization
IF OBJECT_ID('[__mj_BizAppsReferrals].[vwProfessionalProfiles]', 'V') IS NOT NULL
    DROP VIEW [__mj_BizAppsReferrals].[vwProfessionalProfiles];
GO

CREATE VIEW [__mj_BizAppsReferrals].[vwProfessionalProfiles]
AS
SELECT
    p.*,
    mjBizAppsCommonPerson_PersonID.[DisplayName] AS [Person],
    mjBizAppsCommonOrganization_OrganizationID.[Name] AS [Organization],
    MJUser_UserID.[Name] AS [User]
FROM
    [__mj_BizAppsReferrals].[ProfessionalProfile] AS p
LEFT OUTER JOIN
    [__mj_BizAppsCommon].[Person] AS mjBizAppsCommonPerson_PersonID
  ON [p].[PersonID] = mjBizAppsCommonPerson_PersonID.[ID]
LEFT OUTER JOIN
    [__mj_BizAppsCommon].[Organization] AS mjBizAppsCommonOrganization_OrganizationID
  ON [p].[OrganizationID] = mjBizAppsCommonOrganization_OrganizationID.[ID]
LEFT OUTER JOIN
    [${flyway:defaultSchema}].[User] AS MJUser_UserID
  ON [p].[UserID] = MJUser_UserID.[ID];
GO

GRANT SELECT ON [__mj_BizAppsReferrals].[vwProfessionalProfiles] TO [cdp_UI], [cdp_Developer], [cdp_Integration];
GO
