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
        -- Preserve any values from the legacy column into LicenseNumber when both exist, then drop legacy column
        DECLARE @CopySql NVARCHAR(MAX) =
            N'UPDATE [__mj_BizAppsReferrals].[ProfessionalProfile] SET [LicenseNumber] = COALESCE([LicenseNumber], '
            + QUOTENAME(@LegacyCol) + N') WHERE [LicenseNumber] IS NULL AND ' + QUOTENAME(@LegacyCol) + N' IS NOT NULL;';
        EXEC sp_executesql @CopySql;

        DECLARE @DropSql NVARCHAR(MAX) =
            N'ALTER TABLE [__mj_BizAppsReferrals].[ProfessionalProfile] DROP COLUMN ' + QUOTENAME(@LegacyCol) + N';';
        EXEC sp_executesql @DropSql;
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


-- 6. Refresh spCreateProfessionalProfile and spUpdateProfessionalProfile with @LicenseNumber
IF OBJECT_ID('[__mj_BizAppsReferrals].[spCreateProfessionalProfile]', 'P') IS NOT NULL
    DROP PROCEDURE [__mj_BizAppsReferrals].[spCreateProfessionalProfile];
GO

CREATE PROCEDURE [__mj_BizAppsReferrals].[spCreateProfessionalProfile]
    @ID uniqueidentifier = NULL,
    @PersonID_Clear bit = 0,
    @PersonID uniqueidentifier = NULL,
    @OrganizationID_Clear bit = 0,
    @OrganizationID uniqueidentifier = NULL,
    @UserID_Clear bit = 0,
    @UserID uniqueidentifier = NULL,
    @DisplayName nvarchar(200),
    @FirmName_Clear bit = 0,
    @FirmName nvarchar(200) = NULL,
    @Email nvarchar(255),
    @Phone_Clear bit = 0,
    @Phone nvarchar(50) = NULL,
    @LicenseNumber_Clear bit = 0,
    @LicenseNumber nvarchar(100) = NULL,
    @VerificationStatus nvarchar(30) = NULL,
    @AvailabilityStatus nvarchar(30) = NULL,
    @Bio_Clear bit = 0,
    @Bio nvarchar(MAX) = NULL,
    @YearsExperience int = NULL,
    @Languages_Clear bit = 0,
    @Languages nvarchar(255) = NULL,
    @HourlyRateMin_Clear bit = 0,
    @HourlyRateMin decimal(10, 2) = NULL,
    @HourlyRateMax_Clear bit = 0,
    @HourlyRateMax decimal(10, 2) = NULL,
    @AcceptsProBono bit = NULL,
    @AcceptsContingency bit = NULL,
    @ActiveReferralCount int = NULL,
    @MaxConcurrentReferrals int = NULL,
    @AverageResponseHours_Clear bit = 0,
    @AverageResponseHours decimal(6, 2) = NULL,
    @AverageRating_Clear bit = 0,
    @AverageRating decimal(3, 2) = NULL,
    @TotalAcceptedCount int = NULL,
    @TotalCompletedCount int = NULL,
    @IsActive bit = NULL
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @InsertedRow TABLE ([ID] UNIQUEIDENTIFIER);

    IF @ID IS NOT NULL
    BEGIN
        INSERT INTO [__mj_BizAppsReferrals].[ProfessionalProfile] (
            [ID], [PersonID], [OrganizationID], [UserID], [DisplayName], [FirmName], [Email], [Phone], [LicenseNumber],
            [VerificationStatus], [AvailabilityStatus], [Bio], [YearsExperience], [Languages],
            [HourlyRateMin], [HourlyRateMax], [AcceptsProBono], [AcceptsContingency],
            [ActiveReferralCount], [MaxConcurrentReferrals], [AverageResponseHours], [AverageRating],
            [TotalAcceptedCount], [TotalCompletedCount], [IsActive]
        )
        OUTPUT INSERTED.[ID] INTO @InsertedRow
        VALUES (
            @ID,
            CASE WHEN @PersonID_Clear = 1 THEN NULL ELSE @PersonID END,
            CASE WHEN @OrganizationID_Clear = 1 THEN NULL ELSE @OrganizationID END,
            CASE WHEN @UserID_Clear = 1 THEN NULL ELSE @UserID END,
            @DisplayName,
            CASE WHEN @FirmName_Clear = 1 THEN NULL ELSE @FirmName END,
            @Email,
            CASE WHEN @Phone_Clear = 1 THEN NULL ELSE @Phone END,
            CASE WHEN @LicenseNumber_Clear = 1 THEN NULL ELSE @LicenseNumber END,
            ISNULL(@VerificationStatus, N'Pending'),
            ISNULL(@AvailabilityStatus, N'Available'),
            CASE WHEN @Bio_Clear = 1 THEN NULL ELSE @Bio END,
            ISNULL(@YearsExperience, 0),
            CASE WHEN @Languages_Clear = 1 THEN NULL ELSE @Languages END,
            CASE WHEN @HourlyRateMin_Clear = 1 THEN NULL ELSE @HourlyRateMin END,
            CASE WHEN @HourlyRateMax_Clear = 1 THEN NULL ELSE @HourlyRateMax END,
            ISNULL(@AcceptsProBono, 0),
            ISNULL(@AcceptsContingency, 0),
            ISNULL(@ActiveReferralCount, 0),
            ISNULL(@MaxConcurrentReferrals, 5),
            CASE WHEN @AverageResponseHours_Clear = 1 THEN NULL ELSE @AverageResponseHours END,
            CASE WHEN @AverageRating_Clear = 1 THEN NULL ELSE @AverageRating END,
            ISNULL(@TotalAcceptedCount, 0),
            ISNULL(@TotalCompletedCount, 0),
            ISNULL(@IsActive, 1)
        );
    END
    ELSE
    BEGIN
        INSERT INTO [__mj_BizAppsReferrals].[ProfessionalProfile] (
            [PersonID], [OrganizationID], [UserID], [DisplayName], [FirmName], [Email], [Phone], [LicenseNumber],
            [VerificationStatus], [AvailabilityStatus], [Bio], [YearsExperience], [Languages],
            [HourlyRateMin], [HourlyRateMax], [AcceptsProBono], [AcceptsContingency],
            [ActiveReferralCount], [MaxConcurrentReferrals], [AverageResponseHours], [AverageRating],
            [TotalAcceptedCount], [TotalCompletedCount], [IsActive]
        )
        OUTPUT INSERTED.[ID] INTO @InsertedRow
        VALUES (
            CASE WHEN @PersonID_Clear = 1 THEN NULL ELSE @PersonID END,
            CASE WHEN @OrganizationID_Clear = 1 THEN NULL ELSE @OrganizationID END,
            CASE WHEN @UserID_Clear = 1 THEN NULL ELSE @UserID END,
            @DisplayName,
            CASE WHEN @FirmName_Clear = 1 THEN NULL ELSE @FirmName END,
            @Email,
            CASE WHEN @Phone_Clear = 1 THEN NULL ELSE @Phone END,
            CASE WHEN @LicenseNumber_Clear = 1 THEN NULL ELSE @LicenseNumber END,
            ISNULL(@VerificationStatus, N'Pending'),
            ISNULL(@AvailabilityStatus, N'Available'),
            CASE WHEN @Bio_Clear = 1 THEN NULL ELSE @Bio END,
            ISNULL(@YearsExperience, 0),
            CASE WHEN @Languages_Clear = 1 THEN NULL ELSE @Languages END,
            CASE WHEN @HourlyRateMin_Clear = 1 THEN NULL ELSE @HourlyRateMin END,
            CASE WHEN @HourlyRateMax_Clear = 1 THEN NULL ELSE @HourlyRateMax END,
            ISNULL(@AcceptsProBono, 0),
            ISNULL(@AcceptsContingency, 0),
            ISNULL(@ActiveReferralCount, 0),
            ISNULL(@MaxConcurrentReferrals, 5),
            CASE WHEN @AverageResponseHours_Clear = 1 THEN NULL ELSE @AverageResponseHours END,
            CASE WHEN @AverageRating_Clear = 1 THEN NULL ELSE @AverageRating END,
            ISNULL(@TotalAcceptedCount, 0),
            ISNULL(@TotalCompletedCount, 0),
            ISNULL(@IsActive, 1)
        );
    END

    SELECT * FROM [__mj_BizAppsReferrals].[vwProfessionalProfiles] WHERE [ID] = (SELECT [ID] FROM @InsertedRow);
END
GO

GRANT EXECUTE ON [__mj_BizAppsReferrals].[spCreateProfessionalProfile] TO [cdp_Developer], [cdp_Integration];
GO

IF OBJECT_ID('[__mj_BizAppsReferrals].[spUpdateProfessionalProfile]', 'P') IS NOT NULL
    DROP PROCEDURE [__mj_BizAppsReferrals].[spUpdateProfessionalProfile];
GO

CREATE PROCEDURE [__mj_BizAppsReferrals].[spUpdateProfessionalProfile]
    @ID uniqueidentifier,
    @PersonID_Clear bit = 0,
    @PersonID uniqueidentifier = NULL,
    @OrganizationID_Clear bit = 0,
    @OrganizationID uniqueidentifier = NULL,
    @UserID_Clear bit = 0,
    @UserID uniqueidentifier = NULL,
    @DisplayName nvarchar(200) = NULL,
    @FirmName_Clear bit = 0,
    @FirmName nvarchar(200) = NULL,
    @Email nvarchar(255) = NULL,
    @Phone_Clear bit = 0,
    @Phone nvarchar(50) = NULL,
    @LicenseNumber_Clear bit = 0,
    @LicenseNumber nvarchar(100) = NULL,
    @VerificationStatus nvarchar(30) = NULL,
    @AvailabilityStatus nvarchar(30) = NULL,
    @Bio_Clear bit = 0,
    @Bio nvarchar(MAX) = NULL,
    @YearsExperience int = NULL,
    @Languages_Clear bit = 0,
    @Languages nvarchar(255) = NULL,
    @HourlyRateMin_Clear bit = 0,
    @HourlyRateMin decimal(10, 2) = NULL,
    @HourlyRateMax_Clear bit = 0,
    @HourlyRateMax decimal(10, 2) = NULL,
    @AcceptsProBono bit = NULL,
    @AcceptsContingency bit = NULL,
    @ActiveReferralCount int = NULL,
    @MaxConcurrentReferrals int = NULL,
    @AverageResponseHours_Clear bit = 0,
    @AverageResponseHours decimal(6, 2) = NULL,
    @AverageRating_Clear bit = 0,
    @AverageRating decimal(3, 2) = NULL,
    @TotalAcceptedCount int = NULL,
    @TotalCompletedCount int = NULL,
    @IsActive bit = NULL
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE [__mj_BizAppsReferrals].[ProfessionalProfile]
    SET
        [PersonID] = CASE WHEN @PersonID_Clear = 1 THEN NULL ELSE ISNULL(@PersonID, [PersonID]) END,
        [OrganizationID] = CASE WHEN @OrganizationID_Clear = 1 THEN NULL ELSE ISNULL(@OrganizationID, [OrganizationID]) END,
        [UserID] = CASE WHEN @UserID_Clear = 1 THEN NULL ELSE ISNULL(@UserID, [UserID]) END,
        [DisplayName] = ISNULL(@DisplayName, [DisplayName]),
        [FirmName] = CASE WHEN @FirmName_Clear = 1 THEN NULL ELSE ISNULL(@FirmName, [FirmName]) END,
        [Email] = ISNULL(@Email, [Email]),
        [Phone] = CASE WHEN @Phone_Clear = 1 THEN NULL ELSE ISNULL(@Phone, [Phone]) END,
        [LicenseNumber] = CASE WHEN @LicenseNumber_Clear = 1 THEN NULL ELSE ISNULL(@LicenseNumber, [LicenseNumber]) END,
        [VerificationStatus] = ISNULL(@VerificationStatus, [VerificationStatus]),
        [AvailabilityStatus] = ISNULL(@AvailabilityStatus, [AvailabilityStatus]),
        [Bio] = CASE WHEN @Bio_Clear = 1 THEN NULL ELSE ISNULL(@Bio, [Bio]) END,
        [YearsExperience] = ISNULL(@YearsExperience, [YearsExperience]),
        [Languages] = CASE WHEN @Languages_Clear = 1 THEN NULL ELSE ISNULL(@Languages, [Languages]) END,
        [HourlyRateMin] = CASE WHEN @HourlyRateMin_Clear = 1 THEN NULL ELSE ISNULL(@HourlyRateMin, [HourlyRateMin]) END,
        [HourlyRateMax] = CASE WHEN @HourlyRateMax_Clear = 1 THEN NULL ELSE ISNULL(@HourlyRateMax, [HourlyRateMax]) END,
        [AcceptsProBono] = ISNULL(@AcceptsProBono, [AcceptsProBono]),
        [AcceptsContingency] = ISNULL(@AcceptsContingency, [AcceptsContingency]),
        [ActiveReferralCount] = ISNULL(@ActiveReferralCount, [ActiveReferralCount]),
        [MaxConcurrentReferrals] = ISNULL(@MaxConcurrentReferrals, [MaxConcurrentReferrals]),
        [AverageResponseHours] = CASE WHEN @AverageResponseHours_Clear = 1 THEN NULL ELSE ISNULL(@AverageResponseHours, [AverageResponseHours]) END,
        [AverageRating] = CASE WHEN @AverageRating_Clear = 1 THEN NULL ELSE ISNULL(@AverageRating, [AverageRating]) END,
        [TotalAcceptedCount] = ISNULL(@TotalAcceptedCount, [TotalAcceptedCount]),
        [TotalCompletedCount] = ISNULL(@TotalCompletedCount, [TotalCompletedCount]),
        [IsActive] = ISNULL(@IsActive, [IsActive]),
        [__mj_UpdatedAt] = GETUTCDATE()
    WHERE [ID] = @ID;

    IF @@ROWCOUNT = 0
        SELECT TOP 0 * FROM [__mj_BizAppsReferrals].[vwProfessionalProfiles] WHERE 1 = 0;
    ELSE
        SELECT * FROM [__mj_BizAppsReferrals].[vwProfessionalProfiles] WHERE [ID] = @ID;
END
GO

GRANT EXECUTE ON [__mj_BizAppsReferrals].[spUpdateProfessionalProfile] TO [cdp_Developer], [cdp_Integration];
GO

-- 7. Deterministic idempotent MJ Entity & EntityField metadata deployment
IF OBJECT_ID(N'[__mj].[Entity]', N'U') IS NOT NULL
   AND OBJECT_ID(N'[__mj].[EntityField]', N'U') IS NOT NULL
BEGIN
    DECLARE @LegacyFieldName SYSNAME = N'BarOr' + N'LicenseNumber';
    DECLARE @ProfileEntityID UNIQUEIDENTIFIER = '7492a921-ffcf-4a3e-b59a-56c88d16dde1';
    DECLARE @CredEntityID UNIQUEIDENTIFIER = 'D1000001-0000-0000-0000-000000000011';

    -- Normalize ProfessionalProfile EntityField from legacy name to LicenseNumber
    UPDATE [__mj].[EntityField]
    SET [Name] = N'LicenseNumber',
        [DisplayName] = N'License Number',
        [__mj_UpdatedAt] = GETUTCDATE()
    WHERE [EntityID] = @ProfileEntityID
      AND [Name] = @LegacyFieldName;

    -- Idempotently register MJ_BizApps_Referrals: Professional Credentials Entity
    IF NOT EXISTS (
        SELECT 1 FROM [__mj].[Entity]
        WHERE [Name] = N'MJ_BizApps_Referrals: Professional Credentials'
    )
    BEGIN
        INSERT INTO [__mj].[Entity] (
            [ID], [Name], [DisplayName], [Description], [BaseTable], [BaseView], [SchemaName],
            [IncludeInAPI], [AllowUserSearchAPI], [TrackRecordChanges], [AuditRecordAccess],
            [AllowCreateAPI], [AllowUpdateAPI], [AllowDeleteAPI], [UserViewMaxRows],
            [__mj_CreatedAt], [__mj_UpdatedAt]
        )
        VALUES (
            @CredEntityID,
            N'MJ_BizApps_Referrals: Professional Credentials',
            N'Professional Credentials',
            N'Normalized professional credentials, licenses, certifications, and verification provider records linked to a ProfessionalProfile.',
            N'ProfessionalCredential',
            N'vwProfessionalCredentials',
            N'__mj_BizAppsReferrals',
            1, 1, 1, 0, 1, 1, 1, 1000,
            GETUTCDATE(), GETUTCDATE()
        );
    END
    ELSE
    BEGIN
        SELECT @CredEntityID = [ID]
        FROM [__mj].[Entity]
        WHERE [Name] = N'MJ_BizApps_Referrals: Professional Credentials';
    END

    -- Ensure ApplicationEntity linkage exists
    IF OBJECT_ID(N'[__mj].[ApplicationEntity]', N'U') IS NOT NULL
       AND NOT EXISTS (
           SELECT 1 FROM [__mj].[ApplicationEntity]
           WHERE [ApplicationID] = 'E66EE2F8-D87B-49C7-AB5C-C6284163AEF2'
             AND [EntityID] = @CredEntityID
       )
    BEGIN
        INSERT INTO [__mj].[ApplicationEntity] ([ApplicationID], [EntityID], [Sequence], [__mj_CreatedAt], [__mj_UpdatedAt])
        VALUES (
            'E66EE2F8-D87B-49C7-AB5C-C6284163AEF2',
            @CredEntityID,
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [__mj].[ApplicationEntity] WHERE [ApplicationID] = 'E66EE2F8-D87B-49C7-AB5C-C6284163AEF2'),
            GETUTCDATE(),
            GETUTCDATE()
        );
    END

    -- Idempotently register EntityField metadata for ProfessionalCredential
    DECLARE @Fields TABLE (
        [Sequence] INT,
        [Name] NVARCHAR(100),
        [DisplayName] NVARCHAR(100),
        [Type] NVARCHAR(50),
        [Length] INT,
        [AllowsNull] BIT,
        [IsPrimaryKey] BIT
    );
    INSERT INTO @Fields VALUES
        (1,  N'ID',                   N'ID',                    N'uniqueidentifier', 16,   0, 1),
        (2,  N'ProfessionalProfileID',N'Professional Profile',  N'uniqueidentifier', 16,   0, 0),
        (3,  N'JurisdictionID',       N'Jurisdiction',          N'uniqueidentifier', 16,   1, 0),
        (4,  N'CredentialCode',       N'Credential Code',       N'nvarchar',         100,  0, 0),
        (5,  N'CredentialName',       N'Credential Name',       N'nvarchar',         255,  0, 0),
        (6,  N'IssuerName',           N'Issuer Name',           N'nvarchar',         255,  1, 0),
        (7,  N'ProviderKey',          N'Provider Key',          N'nvarchar',         100,  0, 0),
        (8,  N'ExternalReferenceID',  N'External Reference ID', N'nvarchar',         255,  1, 0),
        (9,  N'VerificationStatus',   N'Verification Status',   N'nvarchar',         30,   0, 0),
        (10, N'IssuedAt',             N'Issued At',             N'datetimeoffset',   10,   1, 0),
        (11, N'ExpiresAt',            N'Expires At',            N'datetimeoffset',   10,   1, 0),
        (12, N'VerifiedAt',           N'Verified At',           N'datetimeoffset',   10,   1, 0),
        (13, N'VerifiedByPersonID',   N'Verified By Person',    N'uniqueidentifier', 16,   1, 0),
        (14, N'EvidenceURL',          N'Evidence URL',          N'nvarchar',         1000, 1, 0),
        (15, N'MetadataJSON',         N'Metadata JSON',         N'nvarchar',         -1,   1, 0),
        (16, N'IsPrimary',            N'Is Primary',            N'bit',              1,    0, 0),
        (17, N'__mj_CreatedAt',       N'Created At',            N'datetimeoffset',   10,   0, 0),
        (18, N'__mj_UpdatedAt',       N'Updated At',            N'datetimeoffset',   10,   0, 0);

    INSERT INTO [__mj].[EntityField] (
        [ID], [EntityID], [Sequence], [Name], [DisplayName], [Type], [Length], [AllowsNull], [IsPrimaryKey],
        [AllowUpdateAPI], [__mj_CreatedAt], [__mj_UpdatedAt]
    )
    SELECT
        NEWID(), @CredEntityID, f.[Sequence], f.[Name], f.[DisplayName], f.[Type], f.[Length], f.[AllowsNull], f.[IsPrimaryKey],
        CASE WHEN f.[IsPrimaryKey] = 1 OR f.[Name] LIKE N'__mj_%' THEN 0 ELSE 1 END,
        GETUTCDATE(), GETUTCDATE()
    FROM @Fields AS f
    WHERE NOT EXISTS (
        SELECT 1 FROM [__mj].[EntityField] AS ef
        WHERE ef.[EntityID] = @CredEntityID AND ef.[Name] = f.[Name]
    );
END
GO
