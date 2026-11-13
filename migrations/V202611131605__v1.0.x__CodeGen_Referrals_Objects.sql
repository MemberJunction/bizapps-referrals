/* SQL generated to create new entity MJ_BizApps_Referrals: Practice Areas */

      INSERT INTO [${flyway:defaultSchema}].[Entity] (
         [ID],
         [Name],
         [DisplayName],
         [Description],
         [NameSuffix],
         [BaseTable],
         [BaseView],
         [SchemaName],
         [IncludeInAPI],
         [AllowUserSearchAPI],
         [AllowCaching],
         [TrackRecordChanges],
         [AuditRecordAccess],
         [AuditViewRuns],
         [AllowAllRowsAPI],
         [AllowCreateAPI],
         [AllowUpdateAPI],
         [AllowDeleteAPI],
         [UserViewMaxRows]
         , [__mj_CreatedAt]
         , [__mj_UpdatedAt]
      )
      VALUES (
         'c6a1d082-6230-40dc-ba5c-7cee7ea820af',
         'MJ_BizApps_Referrals: Practice Areas',
         'Practice Areas',
         'Hierarchical taxonomy of legal, accounting, or advisory practice areas.',
         NULL,
         'PracticeArea',
         'vwPracticeAreas',
         '__mj_BizAppsReferrals',
         1,
         1,
         0,
         1,
         0,
         0,
         0,
         1,
         1,
         1,
         1000
         , GETUTCDATE()
         , GETUTCDATE()
      );

/* SQL generated to create new application __mj_BizAppsReferrals */
IF NOT EXISTS (
      SELECT 1 FROM [${flyway:defaultSchema}].[Application] WHERE [ID] = 'e66ee2f8-d87b-49c7-ab5c-c6284163aef2'
   )
   BEGIN
      INSERT INTO [${flyway:defaultSchema}].[Application] ([ID], [Name], [Description], [SchemaAutoAddNewEntities], [Path], [AutoUpdatePath], [DefaultForNewUser])
                       VALUES ('e66ee2f8-d87b-49c7-ab5c-c6284163aef2', '__mj_BizAppsReferrals', 'Generated for schema', '__mj_BizAppsReferrals', 'mjbizappsreferrals', 1, 0)
   END;

/* Adding role UI to application __mj_BizAppsReferrals */
IF NOT EXISTS (
      SELECT 1 FROM [${flyway:defaultSchema}].[ApplicationRole] WHERE [ApplicationID] = 'e66ee2f8-d87b-49c7-ab5c-c6284163aef2' AND [RoleID] = 'E0AFCCEC-6A37-EF11-86D4-000D3A4E707E'
   )
   BEGIN
      INSERT INTO [${flyway:defaultSchema}].[ApplicationRole]
                                 ([ApplicationID], [RoleID], [CanAccess], [CanAdmin]) VALUES
                                 ('e66ee2f8-d87b-49c7-ab5c-c6284163aef2', 'E0AFCCEC-6A37-EF11-86D4-000D3A4E707E', 1, 0)
   END;

/* Adding role Developer to application __mj_BizAppsReferrals */
IF NOT EXISTS (
      SELECT 1 FROM [${flyway:defaultSchema}].[ApplicationRole] WHERE [ApplicationID] = 'e66ee2f8-d87b-49c7-ab5c-c6284163aef2' AND [RoleID] = 'DEAFCCEC-6A37-EF11-86D4-000D3A4E707E'
   )
   BEGIN
      INSERT INTO [${flyway:defaultSchema}].[ApplicationRole]
                                 ([ApplicationID], [RoleID], [CanAccess], [CanAdmin]) VALUES
                                 ('e66ee2f8-d87b-49c7-ab5c-c6284163aef2', 'DEAFCCEC-6A37-EF11-86D4-000D3A4E707E', 1, 1)
   END;

/* Adding role Integration to application __mj_BizAppsReferrals */
IF NOT EXISTS (
      SELECT 1 FROM [${flyway:defaultSchema}].[ApplicationRole] WHERE [ApplicationID] = 'e66ee2f8-d87b-49c7-ab5c-c6284163aef2' AND [RoleID] = 'DFAFCCEC-6A37-EF11-86D4-000D3A4E707E'
   )
   BEGIN
      INSERT INTO [${flyway:defaultSchema}].[ApplicationRole]
                                 ([ApplicationID], [RoleID], [CanAccess], [CanAdmin]) VALUES
                                 ('e66ee2f8-d87b-49c7-ab5c-c6284163aef2', 'DFAFCCEC-6A37-EF11-86D4-000D3A4E707E', 1, 0)
   END;

/* SQL generated to add entity MJ_BizApps_Referrals: Practice Areas to application ID: 'e66ee2f8-d87b-49c7-ab5c-c6284163aef2' */
INSERT INTO [${flyway:defaultSchema}].[ApplicationEntity]
                                    ([ApplicationID], [EntityID], [Sequence], [__mj_CreatedAt], [__mj_UpdatedAt]) VALUES
                                    ('e66ee2f8-d87b-49c7-ab5c-c6284163aef2', 'c6a1d082-6230-40dc-ba5c-7cee7ea820af', (SELECT COALESCE(MAX([Sequence]),0)+1 FROM [${flyway:defaultSchema}].[ApplicationEntity] WHERE [ApplicationID] = 'e66ee2f8-d87b-49c7-ab5c-c6284163aef2'), GETUTCDATE(), GETUTCDATE());

/* SQL generated to add new permission for entity MJ_BizApps_Referrals: Practice Areas for role UI */
INSERT INTO [${flyway:defaultSchema}].[EntityPermission]
                ([EntityID], [RoleID], [Type], [CanRead], [CanCreate], [CanUpdate], [CanDelete], [__mj_CreatedAt], [__mj_UpdatedAt])
              SELECT CAST('c6a1d082-6230-40dc-ba5c-7cee7ea820af' AS uniqueidentifier), CAST('E0AFCCEC-6A37-EF11-86D4-000D3A4E707E' AS uniqueidentifier), 'Allow', 1, 0, 0, 0, GETUTCDATE(), GETUTCDATE()
              WHERE NOT EXISTS (
                SELECT 1 FROM [${flyway:defaultSchema}].[EntityPermission]
                WHERE [EntityID] = CAST('c6a1d082-6230-40dc-ba5c-7cee7ea820af' AS uniqueidentifier) AND [RoleID] = CAST('E0AFCCEC-6A37-EF11-86D4-000D3A4E707E' AS uniqueidentifier) AND [Type] = 'Allow'
              );

/* SQL generated to add new permission for entity MJ_BizApps_Referrals: Practice Areas for role Developer */
INSERT INTO [${flyway:defaultSchema}].[EntityPermission]
                ([EntityID], [RoleID], [Type], [CanRead], [CanCreate], [CanUpdate], [CanDelete], [__mj_CreatedAt], [__mj_UpdatedAt])
              SELECT CAST('c6a1d082-6230-40dc-ba5c-7cee7ea820af' AS uniqueidentifier), CAST('DEAFCCEC-6A37-EF11-86D4-000D3A4E707E' AS uniqueidentifier), 'Allow', 1, 1, 1, 1, GETUTCDATE(), GETUTCDATE()
              WHERE NOT EXISTS (
                SELECT 1 FROM [${flyway:defaultSchema}].[EntityPermission]
                WHERE [EntityID] = CAST('c6a1d082-6230-40dc-ba5c-7cee7ea820af' AS uniqueidentifier) AND [RoleID] = CAST('DEAFCCEC-6A37-EF11-86D4-000D3A4E707E' AS uniqueidentifier) AND [Type] = 'Allow'
              );

/* SQL generated to add new permission for entity MJ_BizApps_Referrals: Practice Areas for role Integration */
INSERT INTO [${flyway:defaultSchema}].[EntityPermission]
                ([EntityID], [RoleID], [Type], [CanRead], [CanCreate], [CanUpdate], [CanDelete], [__mj_CreatedAt], [__mj_UpdatedAt])
              SELECT CAST('c6a1d082-6230-40dc-ba5c-7cee7ea820af' AS uniqueidentifier), CAST('DFAFCCEC-6A37-EF11-86D4-000D3A4E707E' AS uniqueidentifier), 'Allow', 1, 1, 1, 1, GETUTCDATE(), GETUTCDATE()
              WHERE NOT EXISTS (
                SELECT 1 FROM [${flyway:defaultSchema}].[EntityPermission]
                WHERE [EntityID] = CAST('c6a1d082-6230-40dc-ba5c-7cee7ea820af' AS uniqueidentifier) AND [RoleID] = CAST('DFAFCCEC-6A37-EF11-86D4-000D3A4E707E' AS uniqueidentifier) AND [Type] = 'Allow'
              );

/* SQL generated to create new entity MJ_BizApps_Referrals: Jurisdictions */

      INSERT INTO [${flyway:defaultSchema}].[Entity] (
         [ID],
         [Name],
         [DisplayName],
         [Description],
         [NameSuffix],
         [BaseTable],
         [BaseView],
         [SchemaName],
         [IncludeInAPI],
         [AllowUserSearchAPI],
         [AllowCaching],
         [TrackRecordChanges],
         [AuditRecordAccess],
         [AuditViewRuns],
         [AllowAllRowsAPI],
         [AllowCreateAPI],
         [AllowUpdateAPI],
         [AllowDeleteAPI],
         [UserViewMaxRows]
         , [__mj_CreatedAt]
         , [__mj_UpdatedAt]
      )
      VALUES (
         'b6923104-236c-4100-ba23-c4ac354b47a8',
         'MJ_BizApps_Referrals: Jurisdictions',
         'Jurisdictions',
         'Hierarchical geographic or regulatory licensing jurisdictions.',
         NULL,
         'Jurisdiction',
         'vwJurisdictions',
         '__mj_BizAppsReferrals',
         1,
         1,
         0,
         1,
         0,
         0,
         0,
         1,
         1,
         1,
         1000
         , GETUTCDATE()
         , GETUTCDATE()
      );

/* SQL generated to add entity MJ_BizApps_Referrals: Jurisdictions to application ID: 'E66EE2F8-D87B-49C7-AB5C-C6284163AEF2' */
INSERT INTO [${flyway:defaultSchema}].[ApplicationEntity]
                                    ([ApplicationID], [EntityID], [Sequence], [__mj_CreatedAt], [__mj_UpdatedAt]) VALUES
                                    ('E66EE2F8-D87B-49C7-AB5C-C6284163AEF2', 'b6923104-236c-4100-ba23-c4ac354b47a8', (SELECT COALESCE(MAX([Sequence]),0)+1 FROM [${flyway:defaultSchema}].[ApplicationEntity] WHERE [ApplicationID] = 'E66EE2F8-D87B-49C7-AB5C-C6284163AEF2'), GETUTCDATE(), GETUTCDATE());

/* SQL generated to add new permission for entity MJ_BizApps_Referrals: Jurisdictions for role UI */
INSERT INTO [${flyway:defaultSchema}].[EntityPermission]
                ([EntityID], [RoleID], [Type], [CanRead], [CanCreate], [CanUpdate], [CanDelete], [__mj_CreatedAt], [__mj_UpdatedAt])
              SELECT CAST('b6923104-236c-4100-ba23-c4ac354b47a8' AS uniqueidentifier), CAST('E0AFCCEC-6A37-EF11-86D4-000D3A4E707E' AS uniqueidentifier), 'Allow', 1, 0, 0, 0, GETUTCDATE(), GETUTCDATE()
              WHERE NOT EXISTS (
                SELECT 1 FROM [${flyway:defaultSchema}].[EntityPermission]
                WHERE [EntityID] = CAST('b6923104-236c-4100-ba23-c4ac354b47a8' AS uniqueidentifier) AND [RoleID] = CAST('E0AFCCEC-6A37-EF11-86D4-000D3A4E707E' AS uniqueidentifier) AND [Type] = 'Allow'
              );

/* SQL generated to add new permission for entity MJ_BizApps_Referrals: Jurisdictions for role Developer */
INSERT INTO [${flyway:defaultSchema}].[EntityPermission]
                ([EntityID], [RoleID], [Type], [CanRead], [CanCreate], [CanUpdate], [CanDelete], [__mj_CreatedAt], [__mj_UpdatedAt])
              SELECT CAST('b6923104-236c-4100-ba23-c4ac354b47a8' AS uniqueidentifier), CAST('DEAFCCEC-6A37-EF11-86D4-000D3A4E707E' AS uniqueidentifier), 'Allow', 1, 1, 1, 1, GETUTCDATE(), GETUTCDATE()
              WHERE NOT EXISTS (
                SELECT 1 FROM [${flyway:defaultSchema}].[EntityPermission]
                WHERE [EntityID] = CAST('b6923104-236c-4100-ba23-c4ac354b47a8' AS uniqueidentifier) AND [RoleID] = CAST('DEAFCCEC-6A37-EF11-86D4-000D3A4E707E' AS uniqueidentifier) AND [Type] = 'Allow'
              );

/* SQL generated to add new permission for entity MJ_BizApps_Referrals: Jurisdictions for role Integration */
INSERT INTO [${flyway:defaultSchema}].[EntityPermission]
                ([EntityID], [RoleID], [Type], [CanRead], [CanCreate], [CanUpdate], [CanDelete], [__mj_CreatedAt], [__mj_UpdatedAt])
              SELECT CAST('b6923104-236c-4100-ba23-c4ac354b47a8' AS uniqueidentifier), CAST('DFAFCCEC-6A37-EF11-86D4-000D3A4E707E' AS uniqueidentifier), 'Allow', 1, 1, 1, 1, GETUTCDATE(), GETUTCDATE()
              WHERE NOT EXISTS (
                SELECT 1 FROM [${flyway:defaultSchema}].[EntityPermission]
                WHERE [EntityID] = CAST('b6923104-236c-4100-ba23-c4ac354b47a8' AS uniqueidentifier) AND [RoleID] = CAST('DFAFCCEC-6A37-EF11-86D4-000D3A4E707E' AS uniqueidentifier) AND [Type] = 'Allow'
              );

/* SQL generated to create new entity MJ_BizApps_Referrals: Referral Tiers */

      INSERT INTO [${flyway:defaultSchema}].[Entity] (
         [ID],
         [Name],
         [DisplayName],
         [Description],
         [NameSuffix],
         [BaseTable],
         [BaseView],
         [SchemaName],
         [IncludeInAPI],
         [AllowUserSearchAPI],
         [AllowCaching],
         [TrackRecordChanges],
         [AuditRecordAccess],
         [AuditViewRuns],
         [AllowAllRowsAPI],
         [AllowCreateAPI],
         [AllowUpdateAPI],
         [AllowDeleteAPI],
         [UserViewMaxRows]
         , [__mj_CreatedAt]
         , [__mj_UpdatedAt]
      )
      VALUES (
         '48baf761-cb15-47b8-be87-c6d1b54f25f6',
         'MJ_BizApps_Referrals: Referral Tiers',
         'Referral Tiers',
         'Service-level agreement tiers governing SLA response windows and cascade depth.',
         NULL,
         'ReferralTier',
         'vwReferralTiers',
         '__mj_BizAppsReferrals',
         1,
         1,
         0,
         1,
         0,
         0,
         0,
         1,
         1,
         1,
         1000
         , GETUTCDATE()
         , GETUTCDATE()
      );

/* SQL generated to add entity MJ_BizApps_Referrals: Referral Tiers to application ID: 'E66EE2F8-D87B-49C7-AB5C-C6284163AEF2' */
INSERT INTO [${flyway:defaultSchema}].[ApplicationEntity]
                                    ([ApplicationID], [EntityID], [Sequence], [__mj_CreatedAt], [__mj_UpdatedAt]) VALUES
                                    ('E66EE2F8-D87B-49C7-AB5C-C6284163AEF2', '48baf761-cb15-47b8-be87-c6d1b54f25f6', (SELECT COALESCE(MAX([Sequence]),0)+1 FROM [${flyway:defaultSchema}].[ApplicationEntity] WHERE [ApplicationID] = 'E66EE2F8-D87B-49C7-AB5C-C6284163AEF2'), GETUTCDATE(), GETUTCDATE());

/* SQL generated to add new permission for entity MJ_BizApps_Referrals: Referral Tiers for role UI */
INSERT INTO [${flyway:defaultSchema}].[EntityPermission]
                ([EntityID], [RoleID], [Type], [CanRead], [CanCreate], [CanUpdate], [CanDelete], [__mj_CreatedAt], [__mj_UpdatedAt])
              SELECT CAST('48baf761-cb15-47b8-be87-c6d1b54f25f6' AS uniqueidentifier), CAST('E0AFCCEC-6A37-EF11-86D4-000D3A4E707E' AS uniqueidentifier), 'Allow', 1, 0, 0, 0, GETUTCDATE(), GETUTCDATE()
              WHERE NOT EXISTS (
                SELECT 1 FROM [${flyway:defaultSchema}].[EntityPermission]
                WHERE [EntityID] = CAST('48baf761-cb15-47b8-be87-c6d1b54f25f6' AS uniqueidentifier) AND [RoleID] = CAST('E0AFCCEC-6A37-EF11-86D4-000D3A4E707E' AS uniqueidentifier) AND [Type] = 'Allow'
              );

/* SQL generated to add new permission for entity MJ_BizApps_Referrals: Referral Tiers for role Developer */
INSERT INTO [${flyway:defaultSchema}].[EntityPermission]
                ([EntityID], [RoleID], [Type], [CanRead], [CanCreate], [CanUpdate], [CanDelete], [__mj_CreatedAt], [__mj_UpdatedAt])
              SELECT CAST('48baf761-cb15-47b8-be87-c6d1b54f25f6' AS uniqueidentifier), CAST('DEAFCCEC-6A37-EF11-86D4-000D3A4E707E' AS uniqueidentifier), 'Allow', 1, 1, 1, 1, GETUTCDATE(), GETUTCDATE()
              WHERE NOT EXISTS (
                SELECT 1 FROM [${flyway:defaultSchema}].[EntityPermission]
                WHERE [EntityID] = CAST('48baf761-cb15-47b8-be87-c6d1b54f25f6' AS uniqueidentifier) AND [RoleID] = CAST('DEAFCCEC-6A37-EF11-86D4-000D3A4E707E' AS uniqueidentifier) AND [Type] = 'Allow'
              );

/* SQL generated to add new permission for entity MJ_BizApps_Referrals: Referral Tiers for role Integration */
INSERT INTO [${flyway:defaultSchema}].[EntityPermission]
                ([EntityID], [RoleID], [Type], [CanRead], [CanCreate], [CanUpdate], [CanDelete], [__mj_CreatedAt], [__mj_UpdatedAt])
              SELECT CAST('48baf761-cb15-47b8-be87-c6d1b54f25f6' AS uniqueidentifier), CAST('DFAFCCEC-6A37-EF11-86D4-000D3A4E707E' AS uniqueidentifier), 'Allow', 1, 1, 1, 1, GETUTCDATE(), GETUTCDATE()
              WHERE NOT EXISTS (
                SELECT 1 FROM [${flyway:defaultSchema}].[EntityPermission]
                WHERE [EntityID] = CAST('48baf761-cb15-47b8-be87-c6d1b54f25f6' AS uniqueidentifier) AND [RoleID] = CAST('DFAFCCEC-6A37-EF11-86D4-000D3A4E707E' AS uniqueidentifier) AND [Type] = 'Allow'
              );

/* SQL generated to create new entity MJ_BizApps_Referrals: Professional Profiles */

      INSERT INTO [${flyway:defaultSchema}].[Entity] (
         [ID],
         [Name],
         [DisplayName],
         [Description],
         [NameSuffix],
         [BaseTable],
         [BaseView],
         [SchemaName],
         [IncludeInAPI],
         [AllowUserSearchAPI],
         [AllowCaching],
         [TrackRecordChanges],
         [AuditRecordAccess],
         [AuditViewRuns],
         [AllowAllRowsAPI],
         [AllowCreateAPI],
         [AllowUpdateAPI],
         [AllowDeleteAPI],
         [UserViewMaxRows]
         , [__mj_CreatedAt]
         , [__mj_UpdatedAt]
      )
      VALUES (
         '7492a921-ffcf-4a3e-b59a-56c88d16dde1',
         'MJ_BizApps_Referrals: Professional Profiles',
         'Professional Profiles',
         'Verified member directory profile for credentialed professionals.',
         NULL,
         'ProfessionalProfile',
         'vwProfessionalProfiles',
         '__mj_BizAppsReferrals',
         1,
         1,
         0,
         1,
         0,
         0,
         0,
         1,
         1,
         1,
         1000
         , GETUTCDATE()
         , GETUTCDATE()
      );

/* SQL generated to add entity MJ_BizApps_Referrals: Professional Profiles to application ID: 'E66EE2F8-D87B-49C7-AB5C-C6284163AEF2' */
INSERT INTO [${flyway:defaultSchema}].[ApplicationEntity]
                                    ([ApplicationID], [EntityID], [Sequence], [__mj_CreatedAt], [__mj_UpdatedAt]) VALUES
                                    ('E66EE2F8-D87B-49C7-AB5C-C6284163AEF2', '7492a921-ffcf-4a3e-b59a-56c88d16dde1', (SELECT COALESCE(MAX([Sequence]),0)+1 FROM [${flyway:defaultSchema}].[ApplicationEntity] WHERE [ApplicationID] = 'E66EE2F8-D87B-49C7-AB5C-C6284163AEF2'), GETUTCDATE(), GETUTCDATE());

/* SQL generated to add new permission for entity MJ_BizApps_Referrals: Professional Profiles for role UI */
INSERT INTO [${flyway:defaultSchema}].[EntityPermission]
                ([EntityID], [RoleID], [Type], [CanRead], [CanCreate], [CanUpdate], [CanDelete], [__mj_CreatedAt], [__mj_UpdatedAt])
              SELECT CAST('7492a921-ffcf-4a3e-b59a-56c88d16dde1' AS uniqueidentifier), CAST('E0AFCCEC-6A37-EF11-86D4-000D3A4E707E' AS uniqueidentifier), 'Allow', 1, 0, 0, 0, GETUTCDATE(), GETUTCDATE()
              WHERE NOT EXISTS (
                SELECT 1 FROM [${flyway:defaultSchema}].[EntityPermission]
                WHERE [EntityID] = CAST('7492a921-ffcf-4a3e-b59a-56c88d16dde1' AS uniqueidentifier) AND [RoleID] = CAST('E0AFCCEC-6A37-EF11-86D4-000D3A4E707E' AS uniqueidentifier) AND [Type] = 'Allow'
              );

/* SQL generated to add new permission for entity MJ_BizApps_Referrals: Professional Profiles for role Developer */
INSERT INTO [${flyway:defaultSchema}].[EntityPermission]
                ([EntityID], [RoleID], [Type], [CanRead], [CanCreate], [CanUpdate], [CanDelete], [__mj_CreatedAt], [__mj_UpdatedAt])
              SELECT CAST('7492a921-ffcf-4a3e-b59a-56c88d16dde1' AS uniqueidentifier), CAST('DEAFCCEC-6A37-EF11-86D4-000D3A4E707E' AS uniqueidentifier), 'Allow', 1, 1, 1, 1, GETUTCDATE(), GETUTCDATE()
              WHERE NOT EXISTS (
                SELECT 1 FROM [${flyway:defaultSchema}].[EntityPermission]
                WHERE [EntityID] = CAST('7492a921-ffcf-4a3e-b59a-56c88d16dde1' AS uniqueidentifier) AND [RoleID] = CAST('DEAFCCEC-6A37-EF11-86D4-000D3A4E707E' AS uniqueidentifier) AND [Type] = 'Allow'
              );

/* SQL generated to add new permission for entity MJ_BizApps_Referrals: Professional Profiles for role Integration */
INSERT INTO [${flyway:defaultSchema}].[EntityPermission]
                ([EntityID], [RoleID], [Type], [CanRead], [CanCreate], [CanUpdate], [CanDelete], [__mj_CreatedAt], [__mj_UpdatedAt])
              SELECT CAST('7492a921-ffcf-4a3e-b59a-56c88d16dde1' AS uniqueidentifier), CAST('DFAFCCEC-6A37-EF11-86D4-000D3A4E707E' AS uniqueidentifier), 'Allow', 1, 1, 1, 1, GETUTCDATE(), GETUTCDATE()
              WHERE NOT EXISTS (
                SELECT 1 FROM [${flyway:defaultSchema}].[EntityPermission]
                WHERE [EntityID] = CAST('7492a921-ffcf-4a3e-b59a-56c88d16dde1' AS uniqueidentifier) AND [RoleID] = CAST('DFAFCCEC-6A37-EF11-86D4-000D3A4E707E' AS uniqueidentifier) AND [Type] = 'Allow'
              );

/* SQL generated to create new entity MJ_BizApps_Referrals: Professional Practice Areas */

      INSERT INTO [${flyway:defaultSchema}].[Entity] (
         [ID],
         [Name],
         [DisplayName],
         [Description],
         [NameSuffix],
         [BaseTable],
         [BaseView],
         [SchemaName],
         [IncludeInAPI],
         [AllowUserSearchAPI],
         [AllowCaching],
         [TrackRecordChanges],
         [AuditRecordAccess],
         [AuditViewRuns],
         [AllowAllRowsAPI],
         [AllowCreateAPI],
         [AllowUpdateAPI],
         [AllowDeleteAPI],
         [UserViewMaxRows]
         , [__mj_CreatedAt]
         , [__mj_UpdatedAt]
      )
      VALUES (
         'fbe2e751-72f9-4136-9b77-755c1d192185',
         'MJ_BizApps_Referrals: Professional Practice Areas',
         'Professional Practice Areas',
         'Junction linking professionals to practice areas with proficiency metadata.',
         NULL,
         'ProfessionalPracticeArea',
         'vwProfessionalPracticeAreas',
         '__mj_BizAppsReferrals',
         1,
         1,
         0,
         1,
         0,
         0,
         0,
         1,
         1,
         1,
         1000
         , GETUTCDATE()
         , GETUTCDATE()
      );

/* SQL generated to add entity MJ_BizApps_Referrals: Professional Practice Areas to application ID: 'E66EE2F8-D87B-49C7-AB5C-C6284163AEF2' */
INSERT INTO [${flyway:defaultSchema}].[ApplicationEntity]
                                    ([ApplicationID], [EntityID], [Sequence], [__mj_CreatedAt], [__mj_UpdatedAt]) VALUES
                                    ('E66EE2F8-D87B-49C7-AB5C-C6284163AEF2', 'fbe2e751-72f9-4136-9b77-755c1d192185', (SELECT COALESCE(MAX([Sequence]),0)+1 FROM [${flyway:defaultSchema}].[ApplicationEntity] WHERE [ApplicationID] = 'E66EE2F8-D87B-49C7-AB5C-C6284163AEF2'), GETUTCDATE(), GETUTCDATE());

/* SQL generated to add new permission for entity MJ_BizApps_Referrals: Professional Practice Areas for role UI */
INSERT INTO [${flyway:defaultSchema}].[EntityPermission]
                ([EntityID], [RoleID], [Type], [CanRead], [CanCreate], [CanUpdate], [CanDelete], [__mj_CreatedAt], [__mj_UpdatedAt])
              SELECT CAST('fbe2e751-72f9-4136-9b77-755c1d192185' AS uniqueidentifier), CAST('E0AFCCEC-6A37-EF11-86D4-000D3A4E707E' AS uniqueidentifier), 'Allow', 1, 0, 0, 0, GETUTCDATE(), GETUTCDATE()
              WHERE NOT EXISTS (
                SELECT 1 FROM [${flyway:defaultSchema}].[EntityPermission]
                WHERE [EntityID] = CAST('fbe2e751-72f9-4136-9b77-755c1d192185' AS uniqueidentifier) AND [RoleID] = CAST('E0AFCCEC-6A37-EF11-86D4-000D3A4E707E' AS uniqueidentifier) AND [Type] = 'Allow'
              );

/* SQL generated to add new permission for entity MJ_BizApps_Referrals: Professional Practice Areas for role Developer */
INSERT INTO [${flyway:defaultSchema}].[EntityPermission]
                ([EntityID], [RoleID], [Type], [CanRead], [CanCreate], [CanUpdate], [CanDelete], [__mj_CreatedAt], [__mj_UpdatedAt])
              SELECT CAST('fbe2e751-72f9-4136-9b77-755c1d192185' AS uniqueidentifier), CAST('DEAFCCEC-6A37-EF11-86D4-000D3A4E707E' AS uniqueidentifier), 'Allow', 1, 1, 1, 1, GETUTCDATE(), GETUTCDATE()
              WHERE NOT EXISTS (
                SELECT 1 FROM [${flyway:defaultSchema}].[EntityPermission]
                WHERE [EntityID] = CAST('fbe2e751-72f9-4136-9b77-755c1d192185' AS uniqueidentifier) AND [RoleID] = CAST('DEAFCCEC-6A37-EF11-86D4-000D3A4E707E' AS uniqueidentifier) AND [Type] = 'Allow'
              );

/* SQL generated to add new permission for entity MJ_BizApps_Referrals: Professional Practice Areas for role Integration */
INSERT INTO [${flyway:defaultSchema}].[EntityPermission]
                ([EntityID], [RoleID], [Type], [CanRead], [CanCreate], [CanUpdate], [CanDelete], [__mj_CreatedAt], [__mj_UpdatedAt])
              SELECT CAST('fbe2e751-72f9-4136-9b77-755c1d192185' AS uniqueidentifier), CAST('DFAFCCEC-6A37-EF11-86D4-000D3A4E707E' AS uniqueidentifier), 'Allow', 1, 1, 1, 1, GETUTCDATE(), GETUTCDATE()
              WHERE NOT EXISTS (
                SELECT 1 FROM [${flyway:defaultSchema}].[EntityPermission]
                WHERE [EntityID] = CAST('fbe2e751-72f9-4136-9b77-755c1d192185' AS uniqueidentifier) AND [RoleID] = CAST('DFAFCCEC-6A37-EF11-86D4-000D3A4E707E' AS uniqueidentifier) AND [Type] = 'Allow'
              );

/* SQL generated to create new entity MJ_BizApps_Referrals: Professional Jurisdictions */

      INSERT INTO [${flyway:defaultSchema}].[Entity] (
         [ID],
         [Name],
         [DisplayName],
         [Description],
         [NameSuffix],
         [BaseTable],
         [BaseView],
         [SchemaName],
         [IncludeInAPI],
         [AllowUserSearchAPI],
         [AllowCaching],
         [TrackRecordChanges],
         [AuditRecordAccess],
         [AuditViewRuns],
         [AllowAllRowsAPI],
         [AllowCreateAPI],
         [AllowUpdateAPI],
         [AllowDeleteAPI],
         [UserViewMaxRows]
         , [__mj_CreatedAt]
         , [__mj_UpdatedAt]
      )
      VALUES (
         '9210d51b-1131-4c40-80df-62dc5799affb',
         'MJ_BizApps_Referrals: Professional Jurisdictions',
         'Professional Jurisdictions',
         'Junction linking professionals to admitted jurisdictions and license standing.',
         NULL,
         'ProfessionalJurisdiction',
         'vwProfessionalJurisdictions',
         '__mj_BizAppsReferrals',
         1,
         1,
         0,
         1,
         0,
         0,
         0,
         1,
         1,
         1,
         1000
         , GETUTCDATE()
         , GETUTCDATE()
      );

/* SQL generated to add entity MJ_BizApps_Referrals: Professional Jurisdictions to application ID: 'E66EE2F8-D87B-49C7-AB5C-C6284163AEF2' */
INSERT INTO [${flyway:defaultSchema}].[ApplicationEntity]
                                    ([ApplicationID], [EntityID], [Sequence], [__mj_CreatedAt], [__mj_UpdatedAt]) VALUES
                                    ('E66EE2F8-D87B-49C7-AB5C-C6284163AEF2', '9210d51b-1131-4c40-80df-62dc5799affb', (SELECT COALESCE(MAX([Sequence]),0)+1 FROM [${flyway:defaultSchema}].[ApplicationEntity] WHERE [ApplicationID] = 'E66EE2F8-D87B-49C7-AB5C-C6284163AEF2'), GETUTCDATE(), GETUTCDATE());

/* SQL generated to add new permission for entity MJ_BizApps_Referrals: Professional Jurisdictions for role UI */
INSERT INTO [${flyway:defaultSchema}].[EntityPermission]
                ([EntityID], [RoleID], [Type], [CanRead], [CanCreate], [CanUpdate], [CanDelete], [__mj_CreatedAt], [__mj_UpdatedAt])
              SELECT CAST('9210d51b-1131-4c40-80df-62dc5799affb' AS uniqueidentifier), CAST('E0AFCCEC-6A37-EF11-86D4-000D3A4E707E' AS uniqueidentifier), 'Allow', 1, 0, 0, 0, GETUTCDATE(), GETUTCDATE()
              WHERE NOT EXISTS (
                SELECT 1 FROM [${flyway:defaultSchema}].[EntityPermission]
                WHERE [EntityID] = CAST('9210d51b-1131-4c40-80df-62dc5799affb' AS uniqueidentifier) AND [RoleID] = CAST('E0AFCCEC-6A37-EF11-86D4-000D3A4E707E' AS uniqueidentifier) AND [Type] = 'Allow'
              );

/* SQL generated to add new permission for entity MJ_BizApps_Referrals: Professional Jurisdictions for role Developer */
INSERT INTO [${flyway:defaultSchema}].[EntityPermission]
                ([EntityID], [RoleID], [Type], [CanRead], [CanCreate], [CanUpdate], [CanDelete], [__mj_CreatedAt], [__mj_UpdatedAt])
              SELECT CAST('9210d51b-1131-4c40-80df-62dc5799affb' AS uniqueidentifier), CAST('DEAFCCEC-6A37-EF11-86D4-000D3A4E707E' AS uniqueidentifier), 'Allow', 1, 1, 1, 1, GETUTCDATE(), GETUTCDATE()
              WHERE NOT EXISTS (
                SELECT 1 FROM [${flyway:defaultSchema}].[EntityPermission]
                WHERE [EntityID] = CAST('9210d51b-1131-4c40-80df-62dc5799affb' AS uniqueidentifier) AND [RoleID] = CAST('DEAFCCEC-6A37-EF11-86D4-000D3A4E707E' AS uniqueidentifier) AND [Type] = 'Allow'
              );

/* SQL generated to add new permission for entity MJ_BizApps_Referrals: Professional Jurisdictions for role Integration */
INSERT INTO [${flyway:defaultSchema}].[EntityPermission]
                ([EntityID], [RoleID], [Type], [CanRead], [CanCreate], [CanUpdate], [CanDelete], [__mj_CreatedAt], [__mj_UpdatedAt])
              SELECT CAST('9210d51b-1131-4c40-80df-62dc5799affb' AS uniqueidentifier), CAST('DFAFCCEC-6A37-EF11-86D4-000D3A4E707E' AS uniqueidentifier), 'Allow', 1, 1, 1, 1, GETUTCDATE(), GETUTCDATE()
              WHERE NOT EXISTS (
                SELECT 1 FROM [${flyway:defaultSchema}].[EntityPermission]
                WHERE [EntityID] = CAST('9210d51b-1131-4c40-80df-62dc5799affb' AS uniqueidentifier) AND [RoleID] = CAST('DFAFCCEC-6A37-EF11-86D4-000D3A4E707E' AS uniqueidentifier) AND [Type] = 'Allow'
              );

/* SQL generated to create new entity MJ_BizApps_Referrals: Referral Requests */

      INSERT INTO [${flyway:defaultSchema}].[Entity] (
         [ID],
         [Name],
         [DisplayName],
         [Description],
         [NameSuffix],
         [BaseTable],
         [BaseView],
         [SchemaName],
         [IncludeInAPI],
         [AllowUserSearchAPI],
         [AllowCaching],
         [TrackRecordChanges],
         [AuditRecordAccess],
         [AuditViewRuns],
         [AllowAllRowsAPI],
         [AllowCreateAPI],
         [AllowUpdateAPI],
         [AllowDeleteAPI],
         [UserViewMaxRows]
         , [__mj_CreatedAt]
         , [__mj_UpdatedAt]
      )
      VALUES (
         'c1cebbe7-15e6-4134-b303-96f38d585f65',
         'MJ_BizApps_Referrals: Referral Requests',
         'Referral Requests',
         'Seeker referral intake request capturing matter details and routing state.',
         NULL,
         'ReferralRequest',
         'vwReferralRequests',
         '__mj_BizAppsReferrals',
         1,
         1,
         0,
         1,
         0,
         0,
         0,
         1,
         1,
         1,
         1000
         , GETUTCDATE()
         , GETUTCDATE()
      );

/* SQL generated to add entity MJ_BizApps_Referrals: Referral Requests to application ID: 'E66EE2F8-D87B-49C7-AB5C-C6284163AEF2' */
INSERT INTO [${flyway:defaultSchema}].[ApplicationEntity]
                                    ([ApplicationID], [EntityID], [Sequence], [__mj_CreatedAt], [__mj_UpdatedAt]) VALUES
                                    ('E66EE2F8-D87B-49C7-AB5C-C6284163AEF2', 'c1cebbe7-15e6-4134-b303-96f38d585f65', (SELECT COALESCE(MAX([Sequence]),0)+1 FROM [${flyway:defaultSchema}].[ApplicationEntity] WHERE [ApplicationID] = 'E66EE2F8-D87B-49C7-AB5C-C6284163AEF2'), GETUTCDATE(), GETUTCDATE());

/* SQL generated to add new permission for entity MJ_BizApps_Referrals: Referral Requests for role UI */
INSERT INTO [${flyway:defaultSchema}].[EntityPermission]
                ([EntityID], [RoleID], [Type], [CanRead], [CanCreate], [CanUpdate], [CanDelete], [__mj_CreatedAt], [__mj_UpdatedAt])
              SELECT CAST('c1cebbe7-15e6-4134-b303-96f38d585f65' AS uniqueidentifier), CAST('E0AFCCEC-6A37-EF11-86D4-000D3A4E707E' AS uniqueidentifier), 'Allow', 1, 0, 0, 0, GETUTCDATE(), GETUTCDATE()
              WHERE NOT EXISTS (
                SELECT 1 FROM [${flyway:defaultSchema}].[EntityPermission]
                WHERE [EntityID] = CAST('c1cebbe7-15e6-4134-b303-96f38d585f65' AS uniqueidentifier) AND [RoleID] = CAST('E0AFCCEC-6A37-EF11-86D4-000D3A4E707E' AS uniqueidentifier) AND [Type] = 'Allow'
              );

/* SQL generated to add new permission for entity MJ_BizApps_Referrals: Referral Requests for role Developer */
INSERT INTO [${flyway:defaultSchema}].[EntityPermission]
                ([EntityID], [RoleID], [Type], [CanRead], [CanCreate], [CanUpdate], [CanDelete], [__mj_CreatedAt], [__mj_UpdatedAt])
              SELECT CAST('c1cebbe7-15e6-4134-b303-96f38d585f65' AS uniqueidentifier), CAST('DEAFCCEC-6A37-EF11-86D4-000D3A4E707E' AS uniqueidentifier), 'Allow', 1, 1, 1, 1, GETUTCDATE(), GETUTCDATE()
              WHERE NOT EXISTS (
                SELECT 1 FROM [${flyway:defaultSchema}].[EntityPermission]
                WHERE [EntityID] = CAST('c1cebbe7-15e6-4134-b303-96f38d585f65' AS uniqueidentifier) AND [RoleID] = CAST('DEAFCCEC-6A37-EF11-86D4-000D3A4E707E' AS uniqueidentifier) AND [Type] = 'Allow'
              );

/* SQL generated to add new permission for entity MJ_BizApps_Referrals: Referral Requests for role Integration */
INSERT INTO [${flyway:defaultSchema}].[EntityPermission]
                ([EntityID], [RoleID], [Type], [CanRead], [CanCreate], [CanUpdate], [CanDelete], [__mj_CreatedAt], [__mj_UpdatedAt])
              SELECT CAST('c1cebbe7-15e6-4134-b303-96f38d585f65' AS uniqueidentifier), CAST('DFAFCCEC-6A37-EF11-86D4-000D3A4E707E' AS uniqueidentifier), 'Allow', 1, 1, 1, 1, GETUTCDATE(), GETUTCDATE()
              WHERE NOT EXISTS (
                SELECT 1 FROM [${flyway:defaultSchema}].[EntityPermission]
                WHERE [EntityID] = CAST('c1cebbe7-15e6-4134-b303-96f38d585f65' AS uniqueidentifier) AND [RoleID] = CAST('DFAFCCEC-6A37-EF11-86D4-000D3A4E707E' AS uniqueidentifier) AND [Type] = 'Allow'
              );

/* SQL generated to create new entity MJ_BizApps_Referrals: Conflict Check Parties */

      INSERT INTO [${flyway:defaultSchema}].[Entity] (
         [ID],
         [Name],
         [DisplayName],
         [Description],
         [NameSuffix],
         [BaseTable],
         [BaseView],
         [SchemaName],
         [IncludeInAPI],
         [AllowUserSearchAPI],
         [AllowCaching],
         [TrackRecordChanges],
         [AuditRecordAccess],
         [AuditViewRuns],
         [AllowAllRowsAPI],
         [AllowCreateAPI],
         [AllowUpdateAPI],
         [AllowDeleteAPI],
         [UserViewMaxRows]
         , [__mj_CreatedAt]
         , [__mj_UpdatedAt]
      )
      VALUES (
         'b932cd45-c00e-4c73-a21f-fae50020af94',
         'MJ_BizApps_Referrals: Conflict Check Parties',
         'Conflict Check Parties',
         'Parties involved in a referral matter screened for conflicts of interest.',
         NULL,
         'ConflictCheckParty',
         'vwConflictCheckParties',
         '__mj_BizAppsReferrals',
         1,
         1,
         0,
         1,
         0,
         0,
         0,
         1,
         1,
         1,
         1000
         , GETUTCDATE()
         , GETUTCDATE()
      );

/* SQL generated to add entity MJ_BizApps_Referrals: Conflict Check Parties to application ID: 'E66EE2F8-D87B-49C7-AB5C-C6284163AEF2' */
INSERT INTO [${flyway:defaultSchema}].[ApplicationEntity]
                                    ([ApplicationID], [EntityID], [Sequence], [__mj_CreatedAt], [__mj_UpdatedAt]) VALUES
                                    ('E66EE2F8-D87B-49C7-AB5C-C6284163AEF2', 'b932cd45-c00e-4c73-a21f-fae50020af94', (SELECT COALESCE(MAX([Sequence]),0)+1 FROM [${flyway:defaultSchema}].[ApplicationEntity] WHERE [ApplicationID] = 'E66EE2F8-D87B-49C7-AB5C-C6284163AEF2'), GETUTCDATE(), GETUTCDATE());

/* SQL generated to add new permission for entity MJ_BizApps_Referrals: Conflict Check Parties for role UI */
INSERT INTO [${flyway:defaultSchema}].[EntityPermission]
                ([EntityID], [RoleID], [Type], [CanRead], [CanCreate], [CanUpdate], [CanDelete], [__mj_CreatedAt], [__mj_UpdatedAt])
              SELECT CAST('b932cd45-c00e-4c73-a21f-fae50020af94' AS uniqueidentifier), CAST('E0AFCCEC-6A37-EF11-86D4-000D3A4E707E' AS uniqueidentifier), 'Allow', 1, 0, 0, 0, GETUTCDATE(), GETUTCDATE()
              WHERE NOT EXISTS (
                SELECT 1 FROM [${flyway:defaultSchema}].[EntityPermission]
                WHERE [EntityID] = CAST('b932cd45-c00e-4c73-a21f-fae50020af94' AS uniqueidentifier) AND [RoleID] = CAST('E0AFCCEC-6A37-EF11-86D4-000D3A4E707E' AS uniqueidentifier) AND [Type] = 'Allow'
              );

/* SQL generated to add new permission for entity MJ_BizApps_Referrals: Conflict Check Parties for role Developer */
INSERT INTO [${flyway:defaultSchema}].[EntityPermission]
                ([EntityID], [RoleID], [Type], [CanRead], [CanCreate], [CanUpdate], [CanDelete], [__mj_CreatedAt], [__mj_UpdatedAt])
              SELECT CAST('b932cd45-c00e-4c73-a21f-fae50020af94' AS uniqueidentifier), CAST('DEAFCCEC-6A37-EF11-86D4-000D3A4E707E' AS uniqueidentifier), 'Allow', 1, 1, 1, 1, GETUTCDATE(), GETUTCDATE()
              WHERE NOT EXISTS (
                SELECT 1 FROM [${flyway:defaultSchema}].[EntityPermission]
                WHERE [EntityID] = CAST('b932cd45-c00e-4c73-a21f-fae50020af94' AS uniqueidentifier) AND [RoleID] = CAST('DEAFCCEC-6A37-EF11-86D4-000D3A4E707E' AS uniqueidentifier) AND [Type] = 'Allow'
              );

/* SQL generated to add new permission for entity MJ_BizApps_Referrals: Conflict Check Parties for role Integration */
INSERT INTO [${flyway:defaultSchema}].[EntityPermission]
                ([EntityID], [RoleID], [Type], [CanRead], [CanCreate], [CanUpdate], [CanDelete], [__mj_CreatedAt], [__mj_UpdatedAt])
              SELECT CAST('b932cd45-c00e-4c73-a21f-fae50020af94' AS uniqueidentifier), CAST('DFAFCCEC-6A37-EF11-86D4-000D3A4E707E' AS uniqueidentifier), 'Allow', 1, 1, 1, 1, GETUTCDATE(), GETUTCDATE()
              WHERE NOT EXISTS (
                SELECT 1 FROM [${flyway:defaultSchema}].[EntityPermission]
                WHERE [EntityID] = CAST('b932cd45-c00e-4c73-a21f-fae50020af94' AS uniqueidentifier) AND [RoleID] = CAST('DFAFCCEC-6A37-EF11-86D4-000D3A4E707E' AS uniqueidentifier) AND [Type] = 'Allow'
              );

/* SQL generated to create new entity MJ_BizApps_Referrals: Referral Assignments */

      INSERT INTO [${flyway:defaultSchema}].[Entity] (
         [ID],
         [Name],
         [DisplayName],
         [Description],
         [NameSuffix],
         [BaseTable],
         [BaseView],
         [SchemaName],
         [IncludeInAPI],
         [AllowUserSearchAPI],
         [AllowCaching],
         [TrackRecordChanges],
         [AuditRecordAccess],
         [AuditViewRuns],
         [AllowAllRowsAPI],
         [AllowCreateAPI],
         [AllowUpdateAPI],
         [AllowDeleteAPI],
         [UserViewMaxRows]
         , [__mj_CreatedAt]
         , [__mj_UpdatedAt]
      )
      VALUES (
         '7eb379c8-6c97-4640-b0aa-94f0874f4182',
         'MJ_BizApps_Referrals: Referral Assignments',
         'Referral Assignments',
         'Sequential cascade assignment offering a referral request to a matched professional.',
         NULL,
         'ReferralAssignment',
         'vwReferralAssignments',
         '__mj_BizAppsReferrals',
         1,
         1,
         0,
         1,
         0,
         0,
         0,
         1,
         1,
         1,
         1000
         , GETUTCDATE()
         , GETUTCDATE()
      );

/* SQL generated to add entity MJ_BizApps_Referrals: Referral Assignments to application ID: 'E66EE2F8-D87B-49C7-AB5C-C6284163AEF2' */
INSERT INTO [${flyway:defaultSchema}].[ApplicationEntity]
                                    ([ApplicationID], [EntityID], [Sequence], [__mj_CreatedAt], [__mj_UpdatedAt]) VALUES
                                    ('E66EE2F8-D87B-49C7-AB5C-C6284163AEF2', '7eb379c8-6c97-4640-b0aa-94f0874f4182', (SELECT COALESCE(MAX([Sequence]),0)+1 FROM [${flyway:defaultSchema}].[ApplicationEntity] WHERE [ApplicationID] = 'E66EE2F8-D87B-49C7-AB5C-C6284163AEF2'), GETUTCDATE(), GETUTCDATE());

/* SQL generated to add new permission for entity MJ_BizApps_Referrals: Referral Assignments for role UI */
INSERT INTO [${flyway:defaultSchema}].[EntityPermission]
                ([EntityID], [RoleID], [Type], [CanRead], [CanCreate], [CanUpdate], [CanDelete], [__mj_CreatedAt], [__mj_UpdatedAt])
              SELECT CAST('7eb379c8-6c97-4640-b0aa-94f0874f4182' AS uniqueidentifier), CAST('E0AFCCEC-6A37-EF11-86D4-000D3A4E707E' AS uniqueidentifier), 'Allow', 1, 0, 0, 0, GETUTCDATE(), GETUTCDATE()
              WHERE NOT EXISTS (
                SELECT 1 FROM [${flyway:defaultSchema}].[EntityPermission]
                WHERE [EntityID] = CAST('7eb379c8-6c97-4640-b0aa-94f0874f4182' AS uniqueidentifier) AND [RoleID] = CAST('E0AFCCEC-6A37-EF11-86D4-000D3A4E707E' AS uniqueidentifier) AND [Type] = 'Allow'
              );

/* SQL generated to add new permission for entity MJ_BizApps_Referrals: Referral Assignments for role Developer */
INSERT INTO [${flyway:defaultSchema}].[EntityPermission]
                ([EntityID], [RoleID], [Type], [CanRead], [CanCreate], [CanUpdate], [CanDelete], [__mj_CreatedAt], [__mj_UpdatedAt])
              SELECT CAST('7eb379c8-6c97-4640-b0aa-94f0874f4182' AS uniqueidentifier), CAST('DEAFCCEC-6A37-EF11-86D4-000D3A4E707E' AS uniqueidentifier), 'Allow', 1, 1, 1, 1, GETUTCDATE(), GETUTCDATE()
              WHERE NOT EXISTS (
                SELECT 1 FROM [${flyway:defaultSchema}].[EntityPermission]
                WHERE [EntityID] = CAST('7eb379c8-6c97-4640-b0aa-94f0874f4182' AS uniqueidentifier) AND [RoleID] = CAST('DEAFCCEC-6A37-EF11-86D4-000D3A4E707E' AS uniqueidentifier) AND [Type] = 'Allow'
              );

/* SQL generated to add new permission for entity MJ_BizApps_Referrals: Referral Assignments for role Integration */
INSERT INTO [${flyway:defaultSchema}].[EntityPermission]
                ([EntityID], [RoleID], [Type], [CanRead], [CanCreate], [CanUpdate], [CanDelete], [__mj_CreatedAt], [__mj_UpdatedAt])
              SELECT CAST('7eb379c8-6c97-4640-b0aa-94f0874f4182' AS uniqueidentifier), CAST('DFAFCCEC-6A37-EF11-86D4-000D3A4E707E' AS uniqueidentifier), 'Allow', 1, 1, 1, 1, GETUTCDATE(), GETUTCDATE()
              WHERE NOT EXISTS (
                SELECT 1 FROM [${flyway:defaultSchema}].[EntityPermission]
                WHERE [EntityID] = CAST('7eb379c8-6c97-4640-b0aa-94f0874f4182' AS uniqueidentifier) AND [RoleID] = CAST('DFAFCCEC-6A37-EF11-86D4-000D3A4E707E' AS uniqueidentifier) AND [Type] = 'Allow'
              );

/* SQL generated to create new entity MJ_BizApps_Referrals: Referral Feedbacks */

      INSERT INTO [${flyway:defaultSchema}].[Entity] (
         [ID],
         [Name],
         [DisplayName],
         [Description],
         [NameSuffix],
         [BaseTable],
         [BaseView],
         [SchemaName],
         [IncludeInAPI],
         [AllowUserSearchAPI],
         [AllowCaching],
         [TrackRecordChanges],
         [AuditRecordAccess],
         [AuditViewRuns],
         [AllowAllRowsAPI],
         [AllowCreateAPI],
         [AllowUpdateAPI],
         [AllowDeleteAPI],
         [UserViewMaxRows]
         , [__mj_CreatedAt]
         , [__mj_UpdatedAt]
      )
      VALUES (
         '21b34f7d-822b-4ba5-985c-52215d3ddb9d',
         'MJ_BizApps_Referrals: Referral Feedbacks',
         'Referral Feedbacks',
         'Post-referral feedback, rating, and engagement outcome telemetry.',
         NULL,
         'ReferralFeedback',
         'vwReferralFeedbacks',
         '__mj_BizAppsReferrals',
         1,
         1,
         0,
         1,
         0,
         0,
         0,
         1,
         1,
         1,
         1000
         , GETUTCDATE()
         , GETUTCDATE()
      );

/* SQL generated to add entity MJ_BizApps_Referrals: Referral Feedbacks to application ID: 'E66EE2F8-D87B-49C7-AB5C-C6284163AEF2' */
INSERT INTO [${flyway:defaultSchema}].[ApplicationEntity]
                                    ([ApplicationID], [EntityID], [Sequence], [__mj_CreatedAt], [__mj_UpdatedAt]) VALUES
                                    ('E66EE2F8-D87B-49C7-AB5C-C6284163AEF2', '21b34f7d-822b-4ba5-985c-52215d3ddb9d', (SELECT COALESCE(MAX([Sequence]),0)+1 FROM [${flyway:defaultSchema}].[ApplicationEntity] WHERE [ApplicationID] = 'E66EE2F8-D87B-49C7-AB5C-C6284163AEF2'), GETUTCDATE(), GETUTCDATE());

/* SQL generated to add new permission for entity MJ_BizApps_Referrals: Referral Feedbacks for role UI */
INSERT INTO [${flyway:defaultSchema}].[EntityPermission]
                ([EntityID], [RoleID], [Type], [CanRead], [CanCreate], [CanUpdate], [CanDelete], [__mj_CreatedAt], [__mj_UpdatedAt])
              SELECT CAST('21b34f7d-822b-4ba5-985c-52215d3ddb9d' AS uniqueidentifier), CAST('E0AFCCEC-6A37-EF11-86D4-000D3A4E707E' AS uniqueidentifier), 'Allow', 1, 0, 0, 0, GETUTCDATE(), GETUTCDATE()
              WHERE NOT EXISTS (
                SELECT 1 FROM [${flyway:defaultSchema}].[EntityPermission]
                WHERE [EntityID] = CAST('21b34f7d-822b-4ba5-985c-52215d3ddb9d' AS uniqueidentifier) AND [RoleID] = CAST('E0AFCCEC-6A37-EF11-86D4-000D3A4E707E' AS uniqueidentifier) AND [Type] = 'Allow'
              );

/* SQL generated to add new permission for entity MJ_BizApps_Referrals: Referral Feedbacks for role Developer */
INSERT INTO [${flyway:defaultSchema}].[EntityPermission]
                ([EntityID], [RoleID], [Type], [CanRead], [CanCreate], [CanUpdate], [CanDelete], [__mj_CreatedAt], [__mj_UpdatedAt])
              SELECT CAST('21b34f7d-822b-4ba5-985c-52215d3ddb9d' AS uniqueidentifier), CAST('DEAFCCEC-6A37-EF11-86D4-000D3A4E707E' AS uniqueidentifier), 'Allow', 1, 1, 1, 1, GETUTCDATE(), GETUTCDATE()
              WHERE NOT EXISTS (
                SELECT 1 FROM [${flyway:defaultSchema}].[EntityPermission]
                WHERE [EntityID] = CAST('21b34f7d-822b-4ba5-985c-52215d3ddb9d' AS uniqueidentifier) AND [RoleID] = CAST('DEAFCCEC-6A37-EF11-86D4-000D3A4E707E' AS uniqueidentifier) AND [Type] = 'Allow'
              );

/* SQL generated to add new permission for entity MJ_BizApps_Referrals: Referral Feedbacks for role Integration */
INSERT INTO [${flyway:defaultSchema}].[EntityPermission]
                ([EntityID], [RoleID], [Type], [CanRead], [CanCreate], [CanUpdate], [CanDelete], [__mj_CreatedAt], [__mj_UpdatedAt])
              SELECT CAST('21b34f7d-822b-4ba5-985c-52215d3ddb9d' AS uniqueidentifier), CAST('DFAFCCEC-6A37-EF11-86D4-000D3A4E707E' AS uniqueidentifier), 'Allow', 1, 1, 1, 1, GETUTCDATE(), GETUTCDATE()
              WHERE NOT EXISTS (
                SELECT 1 FROM [${flyway:defaultSchema}].[EntityPermission]
                WHERE [EntityID] = CAST('21b34f7d-822b-4ba5-985c-52215d3ddb9d' AS uniqueidentifier) AND [RoleID] = CAST('DFAFCCEC-6A37-EF11-86D4-000D3A4E707E' AS uniqueidentifier) AND [Type] = 'Allow'
              );

/* SQL text to add special date field __mj_CreatedAt to entity __mj_BizAppsReferrals.ReferralFeedback */
ALTER TABLE [__mj_BizAppsReferrals].[ReferralFeedback] ADD [__mj_CreatedAt] DATETIMEOFFSET NULL;
GO

/* SQL text to add special date field __mj_CreatedAt to entity __mj_BizAppsReferrals.ReferralFeedback */
UPDATE [__mj_BizAppsReferrals].[ReferralFeedback] SET [__mj_CreatedAt] = GETUTCDATE() WHERE [__mj_CreatedAt] IS NULL;
GO

/* SQL text to add special date field __mj_CreatedAt to entity __mj_BizAppsReferrals.ReferralFeedback */
ALTER TABLE [__mj_BizAppsReferrals].[ReferralFeedback] ALTER COLUMN [__mj_CreatedAt] DATETIMEOFFSET NOT NULL;
GO

/* SQL text to add special date field __mj_CreatedAt to entity __mj_BizAppsReferrals.ReferralFeedback */
ALTER TABLE [__mj_BizAppsReferrals].[ReferralFeedback] ADD CONSTRAINT [DF___mj_BizAppsReferrals_ReferralFeedback___mj_CreatedAt] DEFAULT GETUTCDATE() FOR [__mj_CreatedAt];
GO

/* SQL text to add special date field __mj_UpdatedAt to entity __mj_BizAppsReferrals.ReferralFeedback */
ALTER TABLE [__mj_BizAppsReferrals].[ReferralFeedback] ADD [__mj_UpdatedAt] DATETIMEOFFSET NULL;
GO

/* SQL text to add special date field __mj_UpdatedAt to entity __mj_BizAppsReferrals.ReferralFeedback */
UPDATE [__mj_BizAppsReferrals].[ReferralFeedback] SET [__mj_UpdatedAt] = GETUTCDATE() WHERE [__mj_UpdatedAt] IS NULL;
GO

/* SQL text to add special date field __mj_UpdatedAt to entity __mj_BizAppsReferrals.ReferralFeedback */
ALTER TABLE [__mj_BizAppsReferrals].[ReferralFeedback] ALTER COLUMN [__mj_UpdatedAt] DATETIMEOFFSET NOT NULL;
GO

/* SQL text to add special date field __mj_UpdatedAt to entity __mj_BizAppsReferrals.ReferralFeedback */
ALTER TABLE [__mj_BizAppsReferrals].[ReferralFeedback] ADD CONSTRAINT [DF___mj_BizAppsReferrals_ReferralFeedback___mj_UpdatedAt] DEFAULT GETUTCDATE() FOR [__mj_UpdatedAt];
GO

/* SQL text to add special date field __mj_CreatedAt to entity __mj_BizAppsReferrals.ProfessionalProfile */
ALTER TABLE [__mj_BizAppsReferrals].[ProfessionalProfile] ADD [__mj_CreatedAt] DATETIMEOFFSET NULL;
GO

/* SQL text to add special date field __mj_CreatedAt to entity __mj_BizAppsReferrals.ProfessionalProfile */
UPDATE [__mj_BizAppsReferrals].[ProfessionalProfile] SET [__mj_CreatedAt] = GETUTCDATE() WHERE [__mj_CreatedAt] IS NULL;
GO

/* SQL text to add special date field __mj_CreatedAt to entity __mj_BizAppsReferrals.ProfessionalProfile */
ALTER TABLE [__mj_BizAppsReferrals].[ProfessionalProfile] ALTER COLUMN [__mj_CreatedAt] DATETIMEOFFSET NOT NULL;
GO

/* SQL text to add special date field __mj_CreatedAt to entity __mj_BizAppsReferrals.ProfessionalProfile */
ALTER TABLE [__mj_BizAppsReferrals].[ProfessionalProfile] ADD CONSTRAINT [DF___mj_BizAppsReferrals_ProfessionalProfile___mj_CreatedAt] DEFAULT GETUTCDATE() FOR [__mj_CreatedAt];
GO

/* SQL text to add special date field __mj_UpdatedAt to entity __mj_BizAppsReferrals.ProfessionalProfile */
ALTER TABLE [__mj_BizAppsReferrals].[ProfessionalProfile] ADD [__mj_UpdatedAt] DATETIMEOFFSET NULL;
GO

/* SQL text to add special date field __mj_UpdatedAt to entity __mj_BizAppsReferrals.ProfessionalProfile */
UPDATE [__mj_BizAppsReferrals].[ProfessionalProfile] SET [__mj_UpdatedAt] = GETUTCDATE() WHERE [__mj_UpdatedAt] IS NULL;
GO

/* SQL text to add special date field __mj_UpdatedAt to entity __mj_BizAppsReferrals.ProfessionalProfile */
ALTER TABLE [__mj_BizAppsReferrals].[ProfessionalProfile] ALTER COLUMN [__mj_UpdatedAt] DATETIMEOFFSET NOT NULL;
GO

/* SQL text to add special date field __mj_UpdatedAt to entity __mj_BizAppsReferrals.ProfessionalProfile */
ALTER TABLE [__mj_BizAppsReferrals].[ProfessionalProfile] ADD CONSTRAINT [DF___mj_BizAppsReferrals_ProfessionalProfile___mj_UpdatedAt] DEFAULT GETUTCDATE() FOR [__mj_UpdatedAt];
GO

/* SQL text to add special date field __mj_CreatedAt to entity __mj_BizAppsReferrals.ProfessionalJurisdiction */
ALTER TABLE [__mj_BizAppsReferrals].[ProfessionalJurisdiction] ADD [__mj_CreatedAt] DATETIMEOFFSET NULL;
GO

/* SQL text to add special date field __mj_CreatedAt to entity __mj_BizAppsReferrals.ProfessionalJurisdiction */
UPDATE [__mj_BizAppsReferrals].[ProfessionalJurisdiction] SET [__mj_CreatedAt] = GETUTCDATE() WHERE [__mj_CreatedAt] IS NULL;
GO

/* SQL text to add special date field __mj_CreatedAt to entity __mj_BizAppsReferrals.ProfessionalJurisdiction */
ALTER TABLE [__mj_BizAppsReferrals].[ProfessionalJurisdiction] ALTER COLUMN [__mj_CreatedAt] DATETIMEOFFSET NOT NULL;
GO

/* SQL text to add special date field __mj_CreatedAt to entity __mj_BizAppsReferrals.ProfessionalJurisdiction */
ALTER TABLE [__mj_BizAppsReferrals].[ProfessionalJurisdiction] ADD CONSTRAINT [DF___mj_BizAppsReferrals_ProfessionalJurisdiction___mj_CreatedAt] DEFAULT GETUTCDATE() FOR [__mj_CreatedAt];
GO

/* SQL text to add special date field __mj_UpdatedAt to entity __mj_BizAppsReferrals.ProfessionalJurisdiction */
ALTER TABLE [__mj_BizAppsReferrals].[ProfessionalJurisdiction] ADD [__mj_UpdatedAt] DATETIMEOFFSET NULL;
GO

/* SQL text to add special date field __mj_UpdatedAt to entity __mj_BizAppsReferrals.ProfessionalJurisdiction */
UPDATE [__mj_BizAppsReferrals].[ProfessionalJurisdiction] SET [__mj_UpdatedAt] = GETUTCDATE() WHERE [__mj_UpdatedAt] IS NULL;
GO

/* SQL text to add special date field __mj_UpdatedAt to entity __mj_BizAppsReferrals.ProfessionalJurisdiction */
ALTER TABLE [__mj_BizAppsReferrals].[ProfessionalJurisdiction] ALTER COLUMN [__mj_UpdatedAt] DATETIMEOFFSET NOT NULL;
GO

/* SQL text to add special date field __mj_UpdatedAt to entity __mj_BizAppsReferrals.ProfessionalJurisdiction */
ALTER TABLE [__mj_BizAppsReferrals].[ProfessionalJurisdiction] ADD CONSTRAINT [DF___mj_BizAppsReferrals_ProfessionalJurisdiction___mj_UpdatedAt] DEFAULT GETUTCDATE() FOR [__mj_UpdatedAt];
GO

/* SQL text to add special date field __mj_CreatedAt to entity __mj_BizAppsReferrals.ProfessionalPracticeArea */
ALTER TABLE [__mj_BizAppsReferrals].[ProfessionalPracticeArea] ADD [__mj_CreatedAt] DATETIMEOFFSET NULL;
GO

/* SQL text to add special date field __mj_CreatedAt to entity __mj_BizAppsReferrals.ProfessionalPracticeArea */
UPDATE [__mj_BizAppsReferrals].[ProfessionalPracticeArea] SET [__mj_CreatedAt] = GETUTCDATE() WHERE [__mj_CreatedAt] IS NULL;
GO

/* SQL text to add special date field __mj_CreatedAt to entity __mj_BizAppsReferrals.ProfessionalPracticeArea */
ALTER TABLE [__mj_BizAppsReferrals].[ProfessionalPracticeArea] ALTER COLUMN [__mj_CreatedAt] DATETIMEOFFSET NOT NULL;
GO

/* SQL text to add special date field __mj_CreatedAt to entity __mj_BizAppsReferrals.ProfessionalPracticeArea */
ALTER TABLE [__mj_BizAppsReferrals].[ProfessionalPracticeArea] ADD CONSTRAINT [DF___mj_BizAppsReferrals_ProfessionalPracticeArea___mj_CreatedAt] DEFAULT GETUTCDATE() FOR [__mj_CreatedAt];
GO

/* SQL text to add special date field __mj_UpdatedAt to entity __mj_BizAppsReferrals.ProfessionalPracticeArea */
ALTER TABLE [__mj_BizAppsReferrals].[ProfessionalPracticeArea] ADD [__mj_UpdatedAt] DATETIMEOFFSET NULL;
GO

/* SQL text to add special date field __mj_UpdatedAt to entity __mj_BizAppsReferrals.ProfessionalPracticeArea */
UPDATE [__mj_BizAppsReferrals].[ProfessionalPracticeArea] SET [__mj_UpdatedAt] = GETUTCDATE() WHERE [__mj_UpdatedAt] IS NULL;
GO

/* SQL text to add special date field __mj_UpdatedAt to entity __mj_BizAppsReferrals.ProfessionalPracticeArea */
ALTER TABLE [__mj_BizAppsReferrals].[ProfessionalPracticeArea] ALTER COLUMN [__mj_UpdatedAt] DATETIMEOFFSET NOT NULL;
GO

/* SQL text to add special date field __mj_UpdatedAt to entity __mj_BizAppsReferrals.ProfessionalPracticeArea */
ALTER TABLE [__mj_BizAppsReferrals].[ProfessionalPracticeArea] ADD CONSTRAINT [DF___mj_BizAppsReferrals_ProfessionalPracticeArea___mj_UpdatedAt] DEFAULT GETUTCDATE() FOR [__mj_UpdatedAt];
GO

/* SQL text to add special date field __mj_CreatedAt to entity __mj_BizAppsReferrals.PracticeArea */
ALTER TABLE [__mj_BizAppsReferrals].[PracticeArea] ADD [__mj_CreatedAt] DATETIMEOFFSET NULL;
GO

/* SQL text to add special date field __mj_CreatedAt to entity __mj_BizAppsReferrals.PracticeArea */
UPDATE [__mj_BizAppsReferrals].[PracticeArea] SET [__mj_CreatedAt] = GETUTCDATE() WHERE [__mj_CreatedAt] IS NULL;
GO

/* SQL text to add special date field __mj_CreatedAt to entity __mj_BizAppsReferrals.PracticeArea */
ALTER TABLE [__mj_BizAppsReferrals].[PracticeArea] ALTER COLUMN [__mj_CreatedAt] DATETIMEOFFSET NOT NULL;
GO

/* SQL text to add special date field __mj_CreatedAt to entity __mj_BizAppsReferrals.PracticeArea */
ALTER TABLE [__mj_BizAppsReferrals].[PracticeArea] ADD CONSTRAINT [DF___mj_BizAppsReferrals_PracticeArea___mj_CreatedAt] DEFAULT GETUTCDATE() FOR [__mj_CreatedAt];
GO

/* SQL text to add special date field __mj_UpdatedAt to entity __mj_BizAppsReferrals.PracticeArea */
ALTER TABLE [__mj_BizAppsReferrals].[PracticeArea] ADD [__mj_UpdatedAt] DATETIMEOFFSET NULL;
GO

/* SQL text to add special date field __mj_UpdatedAt to entity __mj_BizAppsReferrals.PracticeArea */
UPDATE [__mj_BizAppsReferrals].[PracticeArea] SET [__mj_UpdatedAt] = GETUTCDATE() WHERE [__mj_UpdatedAt] IS NULL;
GO

/* SQL text to add special date field __mj_UpdatedAt to entity __mj_BizAppsReferrals.PracticeArea */
ALTER TABLE [__mj_BizAppsReferrals].[PracticeArea] ALTER COLUMN [__mj_UpdatedAt] DATETIMEOFFSET NOT NULL;
GO

/* SQL text to add special date field __mj_UpdatedAt to entity __mj_BizAppsReferrals.PracticeArea */
ALTER TABLE [__mj_BizAppsReferrals].[PracticeArea] ADD CONSTRAINT [DF___mj_BizAppsReferrals_PracticeArea___mj_UpdatedAt] DEFAULT GETUTCDATE() FOR [__mj_UpdatedAt];
GO

/* SQL text to add special date field __mj_CreatedAt to entity __mj_BizAppsReferrals.ReferralAssignment */
ALTER TABLE [__mj_BizAppsReferrals].[ReferralAssignment] ADD [__mj_CreatedAt] DATETIMEOFFSET NULL;
GO

/* SQL text to add special date field __mj_CreatedAt to entity __mj_BizAppsReferrals.ReferralAssignment */
UPDATE [__mj_BizAppsReferrals].[ReferralAssignment] SET [__mj_CreatedAt] = GETUTCDATE() WHERE [__mj_CreatedAt] IS NULL;
GO

/* SQL text to add special date field __mj_CreatedAt to entity __mj_BizAppsReferrals.ReferralAssignment */
ALTER TABLE [__mj_BizAppsReferrals].[ReferralAssignment] ALTER COLUMN [__mj_CreatedAt] DATETIMEOFFSET NOT NULL;
GO

/* SQL text to add special date field __mj_CreatedAt to entity __mj_BizAppsReferrals.ReferralAssignment */
ALTER TABLE [__mj_BizAppsReferrals].[ReferralAssignment] ADD CONSTRAINT [DF___mj_BizAppsReferrals_ReferralAssignment___mj_CreatedAt] DEFAULT GETUTCDATE() FOR [__mj_CreatedAt];
GO

/* SQL text to add special date field __mj_UpdatedAt to entity __mj_BizAppsReferrals.ReferralAssignment */
ALTER TABLE [__mj_BizAppsReferrals].[ReferralAssignment] ADD [__mj_UpdatedAt] DATETIMEOFFSET NULL;
GO

/* SQL text to add special date field __mj_UpdatedAt to entity __mj_BizAppsReferrals.ReferralAssignment */
UPDATE [__mj_BizAppsReferrals].[ReferralAssignment] SET [__mj_UpdatedAt] = GETUTCDATE() WHERE [__mj_UpdatedAt] IS NULL;
GO

/* SQL text to add special date field __mj_UpdatedAt to entity __mj_BizAppsReferrals.ReferralAssignment */
ALTER TABLE [__mj_BizAppsReferrals].[ReferralAssignment] ALTER COLUMN [__mj_UpdatedAt] DATETIMEOFFSET NOT NULL;
GO

/* SQL text to add special date field __mj_UpdatedAt to entity __mj_BizAppsReferrals.ReferralAssignment */
ALTER TABLE [__mj_BizAppsReferrals].[ReferralAssignment] ADD CONSTRAINT [DF___mj_BizAppsReferrals_ReferralAssignment___mj_UpdatedAt] DEFAULT GETUTCDATE() FOR [__mj_UpdatedAt];
GO

/* SQL text to add special date field __mj_CreatedAt to entity __mj_BizAppsReferrals.ReferralRequest */
ALTER TABLE [__mj_BizAppsReferrals].[ReferralRequest] ADD [__mj_CreatedAt] DATETIMEOFFSET NULL;
GO

/* SQL text to add special date field __mj_CreatedAt to entity __mj_BizAppsReferrals.ReferralRequest */
UPDATE [__mj_BizAppsReferrals].[ReferralRequest] SET [__mj_CreatedAt] = GETUTCDATE() WHERE [__mj_CreatedAt] IS NULL;
GO

/* SQL text to add special date field __mj_CreatedAt to entity __mj_BizAppsReferrals.ReferralRequest */
ALTER TABLE [__mj_BizAppsReferrals].[ReferralRequest] ALTER COLUMN [__mj_CreatedAt] DATETIMEOFFSET NOT NULL;
GO

/* SQL text to add special date field __mj_CreatedAt to entity __mj_BizAppsReferrals.ReferralRequest */
ALTER TABLE [__mj_BizAppsReferrals].[ReferralRequest] ADD CONSTRAINT [DF___mj_BizAppsReferrals_ReferralRequest___mj_CreatedAt] DEFAULT GETUTCDATE() FOR [__mj_CreatedAt];
GO

/* SQL text to add special date field __mj_UpdatedAt to entity __mj_BizAppsReferrals.ReferralRequest */
ALTER TABLE [__mj_BizAppsReferrals].[ReferralRequest] ADD [__mj_UpdatedAt] DATETIMEOFFSET NULL;
GO

/* SQL text to add special date field __mj_UpdatedAt to entity __mj_BizAppsReferrals.ReferralRequest */
UPDATE [__mj_BizAppsReferrals].[ReferralRequest] SET [__mj_UpdatedAt] = GETUTCDATE() WHERE [__mj_UpdatedAt] IS NULL;
GO

/* SQL text to add special date field __mj_UpdatedAt to entity __mj_BizAppsReferrals.ReferralRequest */
ALTER TABLE [__mj_BizAppsReferrals].[ReferralRequest] ALTER COLUMN [__mj_UpdatedAt] DATETIMEOFFSET NOT NULL;
GO

/* SQL text to add special date field __mj_UpdatedAt to entity __mj_BizAppsReferrals.ReferralRequest */
ALTER TABLE [__mj_BizAppsReferrals].[ReferralRequest] ADD CONSTRAINT [DF___mj_BizAppsReferrals_ReferralRequest___mj_UpdatedAt] DEFAULT GETUTCDATE() FOR [__mj_UpdatedAt];
GO

/* SQL text to add special date field __mj_CreatedAt to entity __mj_BizAppsReferrals.Jurisdiction */
ALTER TABLE [__mj_BizAppsReferrals].[Jurisdiction] ADD [__mj_CreatedAt] DATETIMEOFFSET NULL;
GO

/* SQL text to add special date field __mj_CreatedAt to entity __mj_BizAppsReferrals.Jurisdiction */
UPDATE [__mj_BizAppsReferrals].[Jurisdiction] SET [__mj_CreatedAt] = GETUTCDATE() WHERE [__mj_CreatedAt] IS NULL;
GO

/* SQL text to add special date field __mj_CreatedAt to entity __mj_BizAppsReferrals.Jurisdiction */
ALTER TABLE [__mj_BizAppsReferrals].[Jurisdiction] ALTER COLUMN [__mj_CreatedAt] DATETIMEOFFSET NOT NULL;
GO

/* SQL text to add special date field __mj_CreatedAt to entity __mj_BizAppsReferrals.Jurisdiction */
ALTER TABLE [__mj_BizAppsReferrals].[Jurisdiction] ADD CONSTRAINT [DF___mj_BizAppsReferrals_Jurisdiction___mj_CreatedAt] DEFAULT GETUTCDATE() FOR [__mj_CreatedAt];
GO

/* SQL text to add special date field __mj_UpdatedAt to entity __mj_BizAppsReferrals.Jurisdiction */
ALTER TABLE [__mj_BizAppsReferrals].[Jurisdiction] ADD [__mj_UpdatedAt] DATETIMEOFFSET NULL;
GO

/* SQL text to add special date field __mj_UpdatedAt to entity __mj_BizAppsReferrals.Jurisdiction */
UPDATE [__mj_BizAppsReferrals].[Jurisdiction] SET [__mj_UpdatedAt] = GETUTCDATE() WHERE [__mj_UpdatedAt] IS NULL;
GO

/* SQL text to add special date field __mj_UpdatedAt to entity __mj_BizAppsReferrals.Jurisdiction */
ALTER TABLE [__mj_BizAppsReferrals].[Jurisdiction] ALTER COLUMN [__mj_UpdatedAt] DATETIMEOFFSET NOT NULL;
GO

/* SQL text to add special date field __mj_UpdatedAt to entity __mj_BizAppsReferrals.Jurisdiction */
ALTER TABLE [__mj_BizAppsReferrals].[Jurisdiction] ADD CONSTRAINT [DF___mj_BizAppsReferrals_Jurisdiction___mj_UpdatedAt] DEFAULT GETUTCDATE() FOR [__mj_UpdatedAt];
GO

/* SQL text to add special date field __mj_CreatedAt to entity __mj_BizAppsReferrals.ReferralTier */
ALTER TABLE [__mj_BizAppsReferrals].[ReferralTier] ADD [__mj_CreatedAt] DATETIMEOFFSET NULL;
GO

/* SQL text to add special date field __mj_CreatedAt to entity __mj_BizAppsReferrals.ReferralTier */
UPDATE [__mj_BizAppsReferrals].[ReferralTier] SET [__mj_CreatedAt] = GETUTCDATE() WHERE [__mj_CreatedAt] IS NULL;
GO

/* SQL text to add special date field __mj_CreatedAt to entity __mj_BizAppsReferrals.ReferralTier */
ALTER TABLE [__mj_BizAppsReferrals].[ReferralTier] ALTER COLUMN [__mj_CreatedAt] DATETIMEOFFSET NOT NULL;
GO

/* SQL text to add special date field __mj_CreatedAt to entity __mj_BizAppsReferrals.ReferralTier */
ALTER TABLE [__mj_BizAppsReferrals].[ReferralTier] ADD CONSTRAINT [DF___mj_BizAppsReferrals_ReferralTier___mj_CreatedAt] DEFAULT GETUTCDATE() FOR [__mj_CreatedAt];
GO

/* SQL text to add special date field __mj_UpdatedAt to entity __mj_BizAppsReferrals.ReferralTier */
ALTER TABLE [__mj_BizAppsReferrals].[ReferralTier] ADD [__mj_UpdatedAt] DATETIMEOFFSET NULL;
GO

/* SQL text to add special date field __mj_UpdatedAt to entity __mj_BizAppsReferrals.ReferralTier */
UPDATE [__mj_BizAppsReferrals].[ReferralTier] SET [__mj_UpdatedAt] = GETUTCDATE() WHERE [__mj_UpdatedAt] IS NULL;
GO

/* SQL text to add special date field __mj_UpdatedAt to entity __mj_BizAppsReferrals.ReferralTier */
ALTER TABLE [__mj_BizAppsReferrals].[ReferralTier] ALTER COLUMN [__mj_UpdatedAt] DATETIMEOFFSET NOT NULL;
GO

/* SQL text to add special date field __mj_UpdatedAt to entity __mj_BizAppsReferrals.ReferralTier */
ALTER TABLE [__mj_BizAppsReferrals].[ReferralTier] ADD CONSTRAINT [DF___mj_BizAppsReferrals_ReferralTier___mj_UpdatedAt] DEFAULT GETUTCDATE() FOR [__mj_UpdatedAt];
GO

/* SQL text to add special date field __mj_CreatedAt to entity __mj_BizAppsReferrals.ConflictCheckParty */
ALTER TABLE [__mj_BizAppsReferrals].[ConflictCheckParty] ADD [__mj_CreatedAt] DATETIMEOFFSET NULL;
GO

/* SQL text to add special date field __mj_CreatedAt to entity __mj_BizAppsReferrals.ConflictCheckParty */
UPDATE [__mj_BizAppsReferrals].[ConflictCheckParty] SET [__mj_CreatedAt] = GETUTCDATE() WHERE [__mj_CreatedAt] IS NULL;
GO

/* SQL text to add special date field __mj_CreatedAt to entity __mj_BizAppsReferrals.ConflictCheckParty */
ALTER TABLE [__mj_BizAppsReferrals].[ConflictCheckParty] ALTER COLUMN [__mj_CreatedAt] DATETIMEOFFSET NOT NULL;
GO

/* SQL text to add special date field __mj_CreatedAt to entity __mj_BizAppsReferrals.ConflictCheckParty */
ALTER TABLE [__mj_BizAppsReferrals].[ConflictCheckParty] ADD CONSTRAINT [DF___mj_BizAppsReferrals_ConflictCheckParty___mj_CreatedAt] DEFAULT GETUTCDATE() FOR [__mj_CreatedAt];
GO

/* SQL text to add special date field __mj_UpdatedAt to entity __mj_BizAppsReferrals.ConflictCheckParty */
ALTER TABLE [__mj_BizAppsReferrals].[ConflictCheckParty] ADD [__mj_UpdatedAt] DATETIMEOFFSET NULL;
GO

/* SQL text to add special date field __mj_UpdatedAt to entity __mj_BizAppsReferrals.ConflictCheckParty */
UPDATE [__mj_BizAppsReferrals].[ConflictCheckParty] SET [__mj_UpdatedAt] = GETUTCDATE() WHERE [__mj_UpdatedAt] IS NULL;
GO

/* SQL text to add special date field __mj_UpdatedAt to entity __mj_BizAppsReferrals.ConflictCheckParty */
ALTER TABLE [__mj_BizAppsReferrals].[ConflictCheckParty] ALTER COLUMN [__mj_UpdatedAt] DATETIMEOFFSET NOT NULL;
GO

/* SQL text to add special date field __mj_UpdatedAt to entity __mj_BizAppsReferrals.ConflictCheckParty */
ALTER TABLE [__mj_BizAppsReferrals].[ConflictCheckParty] ADD CONSTRAINT [DF___mj_BizAppsReferrals_ConflictCheckParty___mj_UpdatedAt] DEFAULT GETUTCDATE() FOR [__mj_UpdatedAt];
GO

/* SQL text to insert 136 new entity field(s) */

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '6fd12f3e-4799-4f3f-852c-6e89f3d90748' OR (EntityID = '21B34F7D-822B-4BA5-985C-52215D3DDB9D' AND Name = 'ID')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '6fd12f3e-4799-4f3f-852c-6e89f3d90748',
            '21B34F7D-822B-4BA5-985C-52215D3DDB9D', -- Entity: MJ_BizApps_Referrals: Referral Feedbacks
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = '21B34F7D-822B-4BA5-985C-52215D3DDB9D'),
            'ID',
            'ID',
            NULL,
            'uniqueidentifier',
            16,
            0,
            0,
            0,
            'newsequentialid()',
            0,
            0,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            1,
            1,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '2bf3d781-1ea2-4f69-8ea6-18cd41e6e180' OR (EntityID = '21B34F7D-822B-4BA5-985C-52215D3DDB9D' AND Name = 'ReferralRequestID')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '2bf3d781-1ea2-4f69-8ea6-18cd41e6e180',
            '21B34F7D-822B-4BA5-985C-52215D3DDB9D', -- Entity: MJ_BizApps_Referrals: Referral Feedbacks
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = '21B34F7D-822B-4BA5-985C-52215D3DDB9D'),
            'ReferralRequestID',
            'Referral Request ID',
            NULL,
            'uniqueidentifier',
            16,
            0,
            0,
            0,
            NULL,
            0,
            1,
            0,
            0,
            'C1CEBBE7-15E6-4134-B303-96F38D585F65',
            'ID',
            0,
            0,
            1,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = 'a0238f00-628e-499f-9d23-33da4f08ceb8' OR (EntityID = '21B34F7D-822B-4BA5-985C-52215D3DDB9D' AND Name = 'ReferralAssignmentID')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            'a0238f00-628e-499f-9d23-33da4f08ceb8',
            '21B34F7D-822B-4BA5-985C-52215D3DDB9D', -- Entity: MJ_BizApps_Referrals: Referral Feedbacks
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = '21B34F7D-822B-4BA5-985C-52215D3DDB9D'),
            'ReferralAssignmentID',
            'Referral Assignment ID',
            NULL,
            'uniqueidentifier',
            16,
            0,
            0,
            1,
            NULL,
            0,
            1,
            0,
            0,
            '7EB379C8-6C97-4640-B0AA-94F0874F4182',
            'ID',
            0,
            0,
            1,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '819779e5-41b4-40d1-8855-82f5ce449e46' OR (EntityID = '21B34F7D-822B-4BA5-985C-52215D3DDB9D' AND Name = 'ProfessionalProfileID')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '819779e5-41b4-40d1-8855-82f5ce449e46',
            '21B34F7D-822B-4BA5-985C-52215D3DDB9D', -- Entity: MJ_BizApps_Referrals: Referral Feedbacks
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = '21B34F7D-822B-4BA5-985C-52215D3DDB9D'),
            'ProfessionalProfileID',
            'Professional Profile ID',
            NULL,
            'uniqueidentifier',
            16,
            0,
            0,
            0,
            NULL,
            0,
            1,
            0,
            0,
            '7492A921-FFCF-4A3E-B59A-56C88D16DDE1',
            'ID',
            0,
            0,
            1,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '82d17590-ef85-4425-a922-1faccb060a74' OR (EntityID = '21B34F7D-822B-4BA5-985C-52215D3DDB9D' AND Name = 'SubmittedByType')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '82d17590-ef85-4425-a922-1faccb060a74',
            '21B34F7D-822B-4BA5-985C-52215D3DDB9D', -- Entity: MJ_BizApps_Referrals: Referral Feedbacks
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = '21B34F7D-822B-4BA5-985C-52215D3DDB9D'),
            'SubmittedByType',
            'Submitted By Type',
            NULL,
            'nvarchar',
            40,
            0,
            0,
            0,
            'Seeker',
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            1,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '66aeca71-8d4a-4c59-a5c5-277235dd8b75' OR (EntityID = '21B34F7D-822B-4BA5-985C-52215D3DDB9D' AND Name = 'Rating')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '66aeca71-8d4a-4c59-a5c5-277235dd8b75',
            '21B34F7D-822B-4BA5-985C-52215D3DDB9D', -- Entity: MJ_BizApps_Referrals: Referral Feedbacks
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = '21B34F7D-822B-4BA5-985C-52215D3DDB9D'),
            'Rating',
            'Rating',
            NULL,
            'int',
            4,
            10,
            0,
            0,
            NULL,
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = 'cc98a578-c55a-4935-9ff2-425af0927a86' OR (EntityID = '21B34F7D-822B-4BA5-985C-52215D3DDB9D' AND Name = 'OutcomeStatus')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            'cc98a578-c55a-4935-9ff2-425af0927a86',
            '21B34F7D-822B-4BA5-985C-52215D3DDB9D', -- Entity: MJ_BizApps_Referrals: Referral Feedbacks
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = '21B34F7D-822B-4BA5-985C-52215D3DDB9D'),
            'OutcomeStatus',
            'Outcome Status',
            NULL,
            'nvarchar',
            60,
            0,
            0,
            0,
            'Engaged',
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '8036d63e-bcd9-4724-a31a-8e6621f8c438' OR (EntityID = '21B34F7D-822B-4BA5-985C-52215D3DDB9D' AND Name = 'Comments')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '8036d63e-bcd9-4724-a31a-8e6621f8c438',
            '21B34F7D-822B-4BA5-985C-52215D3DDB9D', -- Entity: MJ_BizApps_Referrals: Referral Feedbacks
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = '21B34F7D-822B-4BA5-985C-52215D3DDB9D'),
            'Comments',
            'Comments',
            NULL,
            'nvarchar',
            -1,
            0,
            0,
            1,
            NULL,
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = 'ea68d08d-af91-40bc-bbab-d95ebf79129d' OR (EntityID = '21B34F7D-822B-4BA5-985C-52215D3DDB9D' AND Name = 'SubmittedAt')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            'ea68d08d-af91-40bc-bbab-d95ebf79129d',
            '21B34F7D-822B-4BA5-985C-52215D3DDB9D', -- Entity: MJ_BizApps_Referrals: Referral Feedbacks
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = '21B34F7D-822B-4BA5-985C-52215D3DDB9D'),
            'SubmittedAt',
            'Submitted At',
            NULL,
            'datetimeoffset',
            10,
            34,
            7,
            0,
            'sysdatetimeoffset()',
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '7ba330e5-47f6-4d29-b698-81964079b519' OR (EntityID = '21B34F7D-822B-4BA5-985C-52215D3DDB9D' AND Name = '__mj_CreatedAt')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '7ba330e5-47f6-4d29-b698-81964079b519',
            '21B34F7D-822B-4BA5-985C-52215D3DDB9D', -- Entity: MJ_BizApps_Referrals: Referral Feedbacks
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = '21B34F7D-822B-4BA5-985C-52215D3DDB9D'),
            '__mj_CreatedAt',
            'Created At',
            NULL,
            'datetimeoffset',
            10,
            34,
            7,
            0,
            'getutcdate()',
            0,
            0,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '90d350f0-6d59-419a-8bd9-fb10fbb0e330' OR (EntityID = '21B34F7D-822B-4BA5-985C-52215D3DDB9D' AND Name = '__mj_UpdatedAt')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '90d350f0-6d59-419a-8bd9-fb10fbb0e330',
            '21B34F7D-822B-4BA5-985C-52215D3DDB9D', -- Entity: MJ_BizApps_Referrals: Referral Feedbacks
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = '21B34F7D-822B-4BA5-985C-52215D3DDB9D'),
            '__mj_UpdatedAt',
            'Updated At',
            NULL,
            'datetimeoffset',
            10,
            34,
            7,
            0,
            'getutcdate()',
            0,
            0,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = 'e39bffd6-55a9-4286-a6c6-c7071c7f429f' OR (EntityID = '7492A921-FFCF-4A3E-B59A-56C88D16DDE1' AND Name = 'ID')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            'e39bffd6-55a9-4286-a6c6-c7071c7f429f',
            '7492A921-FFCF-4A3E-B59A-56C88D16DDE1', -- Entity: MJ_BizApps_Referrals: Professional Profiles
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = '7492A921-FFCF-4A3E-B59A-56C88D16DDE1'),
            'ID',
            'ID',
            NULL,
            'uniqueidentifier',
            16,
            0,
            0,
            0,
            'newsequentialid()',
            0,
            0,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            1,
            1,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = 'b9b06233-c7f3-41c4-b854-cfb119299295' OR (EntityID = '7492A921-FFCF-4A3E-B59A-56C88D16DDE1' AND Name = 'PersonID')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            'b9b06233-c7f3-41c4-b854-cfb119299295',
            '7492A921-FFCF-4A3E-B59A-56C88D16DDE1', -- Entity: MJ_BizApps_Referrals: Professional Profiles
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = '7492A921-FFCF-4A3E-B59A-56C88D16DDE1'),
            'PersonID',
            'Person ID',
            NULL,
            'uniqueidentifier',
            16,
            0,
            0,
            1,
            NULL,
            0,
            1,
            0,
            0,
            '7A94ADA9-7880-4FAE-97D8-DB0E934C3F5F',
            'ID',
            0,
            0,
            1,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = 'b6bbef6a-76cc-4eb8-9479-3140fcaee8d7' OR (EntityID = '7492A921-FFCF-4A3E-B59A-56C88D16DDE1' AND Name = 'OrganizationID')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            'b6bbef6a-76cc-4eb8-9479-3140fcaee8d7',
            '7492A921-FFCF-4A3E-B59A-56C88D16DDE1', -- Entity: MJ_BizApps_Referrals: Professional Profiles
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = '7492A921-FFCF-4A3E-B59A-56C88D16DDE1'),
            'OrganizationID',
            'Organization ID',
            NULL,
            'uniqueidentifier',
            16,
            0,
            0,
            1,
            NULL,
            0,
            1,
            0,
            0,
            'C70448F9-9792-41D7-A82C-784B66429D54',
            'ID',
            0,
            0,
            1,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = 'ad70bac7-fab7-4c16-8187-44cf7d04b18a' OR (EntityID = '7492A921-FFCF-4A3E-B59A-56C88D16DDE1' AND Name = 'UserID')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            'ad70bac7-fab7-4c16-8187-44cf7d04b18a',
            '7492A921-FFCF-4A3E-B59A-56C88D16DDE1', -- Entity: MJ_BizApps_Referrals: Professional Profiles
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = '7492A921-FFCF-4A3E-B59A-56C88D16DDE1'),
            'UserID',
            'User ID',
            NULL,
            'uniqueidentifier',
            16,
            0,
            0,
            1,
            NULL,
            0,
            1,
            0,
            0,
            'E1238F34-2837-EF11-86D4-6045BDEE16E6',
            'ID',
            0,
            0,
            1,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = 'c89fc820-344b-461d-81e7-f4c7f9731a62' OR (EntityID = '7492A921-FFCF-4A3E-B59A-56C88D16DDE1' AND Name = 'DisplayName')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            'c89fc820-344b-461d-81e7-f4c7f9731a62',
            '7492A921-FFCF-4A3E-B59A-56C88D16DDE1', -- Entity: MJ_BizApps_Referrals: Professional Profiles
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = '7492A921-FFCF-4A3E-B59A-56C88D16DDE1'),
            'DisplayName',
            'Display Name',
            NULL,
            'nvarchar',
            400,
            0,
            0,
            0,
            NULL,
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            1,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '1cc0e9da-ddae-4baa-a1d1-a49e4818046b' OR (EntityID = '7492A921-FFCF-4A3E-B59A-56C88D16DDE1' AND Name = 'FirmName')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '1cc0e9da-ddae-4baa-a1d1-a49e4818046b',
            '7492A921-FFCF-4A3E-B59A-56C88D16DDE1', -- Entity: MJ_BizApps_Referrals: Professional Profiles
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = '7492A921-FFCF-4A3E-B59A-56C88D16DDE1'),
            'FirmName',
            'Firm Name',
            NULL,
            'nvarchar',
            400,
            0,
            0,
            1,
            NULL,
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '1e8782fa-7425-4874-aa2b-6a4042b3f946' OR (EntityID = '7492A921-FFCF-4A3E-B59A-56C88D16DDE1' AND Name = 'Email')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '1e8782fa-7425-4874-aa2b-6a4042b3f946',
            '7492A921-FFCF-4A3E-B59A-56C88D16DDE1', -- Entity: MJ_BizApps_Referrals: Professional Profiles
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = '7492A921-FFCF-4A3E-B59A-56C88D16DDE1'),
            'Email',
            'Email',
            NULL,
            'nvarchar',
            510,
            0,
            0,
            0,
            NULL,
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = 'ecd37b36-34a0-42a7-9b3d-a7ccd0ebb22c' OR (EntityID = '7492A921-FFCF-4A3E-B59A-56C88D16DDE1' AND Name = 'Phone')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            'ecd37b36-34a0-42a7-9b3d-a7ccd0ebb22c',
            '7492A921-FFCF-4A3E-B59A-56C88D16DDE1', -- Entity: MJ_BizApps_Referrals: Professional Profiles
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = '7492A921-FFCF-4A3E-B59A-56C88D16DDE1'),
            'Phone',
            'Phone',
            NULL,
            'nvarchar',
            100,
            0,
            0,
            1,
            NULL,
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '2d5623e6-5975-41e8-8b29-69384f906dae' OR (EntityID = '7492A921-FFCF-4A3E-B59A-56C88D16DDE1' AND Name = 'BarOrLicenseNumber')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '2d5623e6-5975-41e8-8b29-69384f906dae',
            '7492A921-FFCF-4A3E-B59A-56C88D16DDE1', -- Entity: MJ_BizApps_Referrals: Professional Profiles
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = '7492A921-FFCF-4A3E-B59A-56C88D16DDE1'),
            'BarOrLicenseNumber',
            'Bar Or License Number',
            NULL,
            'nvarchar',
            200,
            0,
            0,
            1,
            NULL,
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '49656b23-a371-4f3d-9dd4-4824b97aaed3' OR (EntityID = '7492A921-FFCF-4A3E-B59A-56C88D16DDE1' AND Name = 'VerificationStatus')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '49656b23-a371-4f3d-9dd4-4824b97aaed3',
            '7492A921-FFCF-4A3E-B59A-56C88D16DDE1', -- Entity: MJ_BizApps_Referrals: Professional Profiles
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = '7492A921-FFCF-4A3E-B59A-56C88D16DDE1'),
            'VerificationStatus',
            'Verification Status',
            NULL,
            'nvarchar',
            60,
            0,
            0,
            0,
            'Pending',
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = 'e3f0c72b-1636-4946-95c9-daa745bab823' OR (EntityID = '7492A921-FFCF-4A3E-B59A-56C88D16DDE1' AND Name = 'AvailabilityStatus')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            'e3f0c72b-1636-4946-95c9-daa745bab823',
            '7492A921-FFCF-4A3E-B59A-56C88D16DDE1', -- Entity: MJ_BizApps_Referrals: Professional Profiles
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = '7492A921-FFCF-4A3E-B59A-56C88D16DDE1'),
            'AvailabilityStatus',
            'Availability Status',
            NULL,
            'nvarchar',
            60,
            0,
            0,
            0,
            'Available',
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '98988df8-b79e-4303-8b97-3cb117f3c581' OR (EntityID = '7492A921-FFCF-4A3E-B59A-56C88D16DDE1' AND Name = 'Bio')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '98988df8-b79e-4303-8b97-3cb117f3c581',
            '7492A921-FFCF-4A3E-B59A-56C88D16DDE1', -- Entity: MJ_BizApps_Referrals: Professional Profiles
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = '7492A921-FFCF-4A3E-B59A-56C88D16DDE1'),
            'Bio',
            'Bio',
            NULL,
            'nvarchar',
            -1,
            0,
            0,
            1,
            NULL,
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = 'a4e4f1d2-a10d-49e7-8314-c8ecad0695b0' OR (EntityID = '7492A921-FFCF-4A3E-B59A-56C88D16DDE1' AND Name = 'YearsExperience')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            'a4e4f1d2-a10d-49e7-8314-c8ecad0695b0',
            '7492A921-FFCF-4A3E-B59A-56C88D16DDE1', -- Entity: MJ_BizApps_Referrals: Professional Profiles
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = '7492A921-FFCF-4A3E-B59A-56C88D16DDE1'),
            'YearsExperience',
            'Years Experience',
            NULL,
            'int',
            4,
            10,
            0,
            0,
            '(0)',
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = 'fb7c7352-9135-4efe-b06a-a5475eb4f630' OR (EntityID = '7492A921-FFCF-4A3E-B59A-56C88D16DDE1' AND Name = 'Languages')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            'fb7c7352-9135-4efe-b06a-a5475eb4f630',
            '7492A921-FFCF-4A3E-B59A-56C88D16DDE1', -- Entity: MJ_BizApps_Referrals: Professional Profiles
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = '7492A921-FFCF-4A3E-B59A-56C88D16DDE1'),
            'Languages',
            'Languages',
            NULL,
            'nvarchar',
            510,
            0,
            0,
            1,
            'English',
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = 'c6b20179-3b2b-44b4-b228-62aec641f9ce' OR (EntityID = '7492A921-FFCF-4A3E-B59A-56C88D16DDE1' AND Name = 'HourlyRateMin')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            'c6b20179-3b2b-44b4-b228-62aec641f9ce',
            '7492A921-FFCF-4A3E-B59A-56C88D16DDE1', -- Entity: MJ_BizApps_Referrals: Professional Profiles
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = '7492A921-FFCF-4A3E-B59A-56C88D16DDE1'),
            'HourlyRateMin',
            'Hourly Rate Min',
            NULL,
            'decimal',
            9,
            10,
            2,
            1,
            NULL,
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = 'ce77720c-f475-4d45-8f53-db48b8adea62' OR (EntityID = '7492A921-FFCF-4A3E-B59A-56C88D16DDE1' AND Name = 'HourlyRateMax')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            'ce77720c-f475-4d45-8f53-db48b8adea62',
            '7492A921-FFCF-4A3E-B59A-56C88D16DDE1', -- Entity: MJ_BizApps_Referrals: Professional Profiles
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = '7492A921-FFCF-4A3E-B59A-56C88D16DDE1'),
            'HourlyRateMax',
            'Hourly Rate Max',
            NULL,
            'decimal',
            9,
            10,
            2,
            1,
            NULL,
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = 'ebf2e67f-55f7-4752-a6a9-1063da1b2f23' OR (EntityID = '7492A921-FFCF-4A3E-B59A-56C88D16DDE1' AND Name = 'AcceptsProBono')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            'ebf2e67f-55f7-4752-a6a9-1063da1b2f23',
            '7492A921-FFCF-4A3E-B59A-56C88D16DDE1', -- Entity: MJ_BizApps_Referrals: Professional Profiles
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = '7492A921-FFCF-4A3E-B59A-56C88D16DDE1'),
            'AcceptsProBono',
            'Accepts Pro Bono',
            NULL,
            'bit',
            1,
            1,
            0,
            0,
            '(0)',
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = 'f4bff7aa-50a0-42a3-9c58-d629a2e5f23b' OR (EntityID = '7492A921-FFCF-4A3E-B59A-56C88D16DDE1' AND Name = 'AcceptsContingency')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            'f4bff7aa-50a0-42a3-9c58-d629a2e5f23b',
            '7492A921-FFCF-4A3E-B59A-56C88D16DDE1', -- Entity: MJ_BizApps_Referrals: Professional Profiles
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = '7492A921-FFCF-4A3E-B59A-56C88D16DDE1'),
            'AcceptsContingency',
            'Accepts Contingency',
            NULL,
            'bit',
            1,
            1,
            0,
            0,
            '(0)',
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '0b5f63f4-e367-44be-87e6-5d2536aeb959' OR (EntityID = '7492A921-FFCF-4A3E-B59A-56C88D16DDE1' AND Name = 'ActiveReferralCount')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '0b5f63f4-e367-44be-87e6-5d2536aeb959',
            '7492A921-FFCF-4A3E-B59A-56C88D16DDE1', -- Entity: MJ_BizApps_Referrals: Professional Profiles
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = '7492A921-FFCF-4A3E-B59A-56C88D16DDE1'),
            'ActiveReferralCount',
            'Active Referral Count',
            NULL,
            'int',
            4,
            10,
            0,
            0,
            '(0)',
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '740d617d-07b7-4112-bc2b-21eaf6823094' OR (EntityID = '7492A921-FFCF-4A3E-B59A-56C88D16DDE1' AND Name = 'MaxConcurrentReferrals')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '740d617d-07b7-4112-bc2b-21eaf6823094',
            '7492A921-FFCF-4A3E-B59A-56C88D16DDE1', -- Entity: MJ_BizApps_Referrals: Professional Profiles
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = '7492A921-FFCF-4A3E-B59A-56C88D16DDE1'),
            'MaxConcurrentReferrals',
            'Max Concurrent Referrals',
            NULL,
            'int',
            4,
            10,
            0,
            0,
            '(10)',
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '120f68f8-f445-4771-a1ce-9226cb6cf000' OR (EntityID = '7492A921-FFCF-4A3E-B59A-56C88D16DDE1' AND Name = 'AverageResponseHours')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '120f68f8-f445-4771-a1ce-9226cb6cf000',
            '7492A921-FFCF-4A3E-B59A-56C88D16DDE1', -- Entity: MJ_BizApps_Referrals: Professional Profiles
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = '7492A921-FFCF-4A3E-B59A-56C88D16DDE1'),
            'AverageResponseHours',
            'Average Response Hours',
            NULL,
            'decimal',
            5,
            6,
            2,
            1,
            NULL,
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '0d3740e5-6748-4b2d-977c-9289d94fb1cf' OR (EntityID = '7492A921-FFCF-4A3E-B59A-56C88D16DDE1' AND Name = 'AverageRating')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '0d3740e5-6748-4b2d-977c-9289d94fb1cf',
            '7492A921-FFCF-4A3E-B59A-56C88D16DDE1', -- Entity: MJ_BizApps_Referrals: Professional Profiles
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = '7492A921-FFCF-4A3E-B59A-56C88D16DDE1'),
            'AverageRating',
            'Average Rating',
            NULL,
            'decimal',
            5,
            3,
            2,
            1,
            NULL,
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = 'f97a0ba7-ddb7-43e8-aad5-3467528b7b32' OR (EntityID = '7492A921-FFCF-4A3E-B59A-56C88D16DDE1' AND Name = 'TotalAcceptedCount')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            'f97a0ba7-ddb7-43e8-aad5-3467528b7b32',
            '7492A921-FFCF-4A3E-B59A-56C88D16DDE1', -- Entity: MJ_BizApps_Referrals: Professional Profiles
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = '7492A921-FFCF-4A3E-B59A-56C88D16DDE1'),
            'TotalAcceptedCount',
            'Total Accepted Count',
            NULL,
            'int',
            4,
            10,
            0,
            0,
            '(0)',
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '5a1f8bff-bc67-415e-84a1-663938e7b28b' OR (EntityID = '7492A921-FFCF-4A3E-B59A-56C88D16DDE1' AND Name = 'TotalCompletedCount')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '5a1f8bff-bc67-415e-84a1-663938e7b28b',
            '7492A921-FFCF-4A3E-B59A-56C88D16DDE1', -- Entity: MJ_BizApps_Referrals: Professional Profiles
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = '7492A921-FFCF-4A3E-B59A-56C88D16DDE1'),
            'TotalCompletedCount',
            'Total Completed Count',
            NULL,
            'int',
            4,
            10,
            0,
            0,
            '(0)',
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '7d3f9ed5-3845-436d-99ca-a97e6475bb52' OR (EntityID = '7492A921-FFCF-4A3E-B59A-56C88D16DDE1' AND Name = 'IsActive')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '7d3f9ed5-3845-436d-99ca-a97e6475bb52',
            '7492A921-FFCF-4A3E-B59A-56C88D16DDE1', -- Entity: MJ_BizApps_Referrals: Professional Profiles
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = '7492A921-FFCF-4A3E-B59A-56C88D16DDE1'),
            'IsActive',
            'Is Active',
            NULL,
            'bit',
            1,
            1,
            0,
            0,
            '(1)',
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = 'c2f7dfd3-5b2b-4c9d-ae99-efd484b59f1a' OR (EntityID = '7492A921-FFCF-4A3E-B59A-56C88D16DDE1' AND Name = '__mj_CreatedAt')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            'c2f7dfd3-5b2b-4c9d-ae99-efd484b59f1a',
            '7492A921-FFCF-4A3E-B59A-56C88D16DDE1', -- Entity: MJ_BizApps_Referrals: Professional Profiles
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = '7492A921-FFCF-4A3E-B59A-56C88D16DDE1'),
            '__mj_CreatedAt',
            'Created At',
            NULL,
            'datetimeoffset',
            10,
            34,
            7,
            0,
            'getutcdate()',
            0,
            0,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '5787c56d-da16-4275-9b85-9ea7a7823e52' OR (EntityID = '7492A921-FFCF-4A3E-B59A-56C88D16DDE1' AND Name = '__mj_UpdatedAt')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '5787c56d-da16-4275-9b85-9ea7a7823e52',
            '7492A921-FFCF-4A3E-B59A-56C88D16DDE1', -- Entity: MJ_BizApps_Referrals: Professional Profiles
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = '7492A921-FFCF-4A3E-B59A-56C88D16DDE1'),
            '__mj_UpdatedAt',
            'Updated At',
            NULL,
            'datetimeoffset',
            10,
            34,
            7,
            0,
            'getutcdate()',
            0,
            0,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '5c914225-ac1d-418c-a01e-ec97ebda279b' OR (EntityID = '9210D51B-1131-4C40-80DF-62DC5799AFFB' AND Name = 'ID')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '5c914225-ac1d-418c-a01e-ec97ebda279b',
            '9210D51B-1131-4C40-80DF-62DC5799AFFB', -- Entity: MJ_BizApps_Referrals: Professional Jurisdictions
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = '9210D51B-1131-4C40-80DF-62DC5799AFFB'),
            'ID',
            'ID',
            NULL,
            'uniqueidentifier',
            16,
            0,
            0,
            0,
            'newsequentialid()',
            0,
            0,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            1,
            1,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '956e95de-7eee-428b-a65e-688de8f3b5a4' OR (EntityID = '9210D51B-1131-4C40-80DF-62DC5799AFFB' AND Name = 'ProfessionalProfileID')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '956e95de-7eee-428b-a65e-688de8f3b5a4',
            '9210D51B-1131-4C40-80DF-62DC5799AFFB', -- Entity: MJ_BizApps_Referrals: Professional Jurisdictions
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = '9210D51B-1131-4C40-80DF-62DC5799AFFB'),
            'ProfessionalProfileID',
            'Professional Profile ID',
            NULL,
            'uniqueidentifier',
            16,
            0,
            0,
            0,
            NULL,
            0,
            1,
            0,
            0,
            '7492A921-FFCF-4A3E-B59A-56C88D16DDE1',
            'ID',
            0,
            0,
            1,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '323ccdbd-4f3f-44a0-9539-981e32914407' OR (EntityID = '9210D51B-1131-4C40-80DF-62DC5799AFFB' AND Name = 'JurisdictionID')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '323ccdbd-4f3f-44a0-9539-981e32914407',
            '9210D51B-1131-4C40-80DF-62DC5799AFFB', -- Entity: MJ_BizApps_Referrals: Professional Jurisdictions
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = '9210D51B-1131-4C40-80DF-62DC5799AFFB'),
            'JurisdictionID',
            'Jurisdiction ID',
            NULL,
            'uniqueidentifier',
            16,
            0,
            0,
            0,
            NULL,
            0,
            1,
            0,
            0,
            'B6923104-236C-4100-BA23-C4AC354B47A8',
            'ID',
            0,
            0,
            1,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '4a9ab709-e94c-440e-b223-e685da9aa21b' OR (EntityID = '9210D51B-1131-4C40-80DF-62DC5799AFFB' AND Name = 'LicenseNumber')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '4a9ab709-e94c-440e-b223-e685da9aa21b',
            '9210D51B-1131-4C40-80DF-62DC5799AFFB', -- Entity: MJ_BizApps_Referrals: Professional Jurisdictions
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = '9210D51B-1131-4C40-80DF-62DC5799AFFB'),
            'LicenseNumber',
            'License Number',
            NULL,
            'nvarchar',
            200,
            0,
            0,
            1,
            NULL,
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            1,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '0c7d392b-8384-44fb-ab9a-9da8118a47db' OR (EntityID = '9210D51B-1131-4C40-80DF-62DC5799AFFB' AND Name = 'AdmissionYear')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '0c7d392b-8384-44fb-ab9a-9da8118a47db',
            '9210D51B-1131-4C40-80DF-62DC5799AFFB', -- Entity: MJ_BizApps_Referrals: Professional Jurisdictions
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = '9210D51B-1131-4C40-80DF-62DC5799AFFB'),
            'AdmissionYear',
            'Admission Year',
            NULL,
            'int',
            4,
            10,
            0,
            1,
            NULL,
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            1,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '0f8a546a-44cd-451c-a8ea-b079fadade8a' OR (EntityID = '9210D51B-1131-4C40-80DF-62DC5799AFFB' AND Name = 'StandingStatus')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '0f8a546a-44cd-451c-a8ea-b079fadade8a',
            '9210D51B-1131-4C40-80DF-62DC5799AFFB', -- Entity: MJ_BizApps_Referrals: Professional Jurisdictions
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = '9210D51B-1131-4C40-80DF-62DC5799AFFB'),
            'StandingStatus',
            'Standing Status',
            NULL,
            'nvarchar',
            60,
            0,
            0,
            0,
            'GoodStanding',
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '958ff0a0-2ac1-4b23-bd6b-5cf09bc13049' OR (EntityID = '9210D51B-1131-4C40-80DF-62DC5799AFFB' AND Name = 'IsPrimary')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '958ff0a0-2ac1-4b23-bd6b-5cf09bc13049',
            '9210D51B-1131-4C40-80DF-62DC5799AFFB', -- Entity: MJ_BizApps_Referrals: Professional Jurisdictions
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = '9210D51B-1131-4C40-80DF-62DC5799AFFB'),
            'IsPrimary',
            'Is Primary',
            NULL,
            'bit',
            1,
            1,
            0,
            0,
            '(0)',
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '8d8e36f4-d49e-49d7-9c5d-c92295aa2a65' OR (EntityID = '9210D51B-1131-4C40-80DF-62DC5799AFFB' AND Name = '__mj_CreatedAt')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '8d8e36f4-d49e-49d7-9c5d-c92295aa2a65',
            '9210D51B-1131-4C40-80DF-62DC5799AFFB', -- Entity: MJ_BizApps_Referrals: Professional Jurisdictions
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = '9210D51B-1131-4C40-80DF-62DC5799AFFB'),
            '__mj_CreatedAt',
            'Created At',
            NULL,
            'datetimeoffset',
            10,
            34,
            7,
            0,
            'getutcdate()',
            0,
            0,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '45c4534d-7629-4673-a9f7-53f54318c417' OR (EntityID = '9210D51B-1131-4C40-80DF-62DC5799AFFB' AND Name = '__mj_UpdatedAt')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '45c4534d-7629-4673-a9f7-53f54318c417',
            '9210D51B-1131-4C40-80DF-62DC5799AFFB', -- Entity: MJ_BizApps_Referrals: Professional Jurisdictions
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = '9210D51B-1131-4C40-80DF-62DC5799AFFB'),
            '__mj_UpdatedAt',
            'Updated At',
            NULL,
            'datetimeoffset',
            10,
            34,
            7,
            0,
            'getutcdate()',
            0,
            0,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = 'cb340133-b93a-4455-b8e5-2b5f0168d678' OR (EntityID = 'FBE2E751-72F9-4136-9B77-755C1D192185' AND Name = 'ID')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            'cb340133-b93a-4455-b8e5-2b5f0168d678',
            'FBE2E751-72F9-4136-9B77-755C1D192185', -- Entity: MJ_BizApps_Referrals: Professional Practice Areas
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = 'FBE2E751-72F9-4136-9B77-755C1D192185'),
            'ID',
            'ID',
            NULL,
            'uniqueidentifier',
            16,
            0,
            0,
            0,
            'newsequentialid()',
            0,
            0,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            1,
            1,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = 'a2d8df94-a21b-4a62-a269-2c59fbeb3b03' OR (EntityID = 'FBE2E751-72F9-4136-9B77-755C1D192185' AND Name = 'ProfessionalProfileID')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            'a2d8df94-a21b-4a62-a269-2c59fbeb3b03',
            'FBE2E751-72F9-4136-9B77-755C1D192185', -- Entity: MJ_BizApps_Referrals: Professional Practice Areas
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = 'FBE2E751-72F9-4136-9B77-755C1D192185'),
            'ProfessionalProfileID',
            'Professional Profile ID',
            NULL,
            'uniqueidentifier',
            16,
            0,
            0,
            0,
            NULL,
            0,
            1,
            0,
            0,
            '7492A921-FFCF-4A3E-B59A-56C88D16DDE1',
            'ID',
            0,
            0,
            1,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = 'cd5144bc-41c1-4628-835b-4211f22073c7' OR (EntityID = 'FBE2E751-72F9-4136-9B77-755C1D192185' AND Name = 'PracticeAreaID')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            'cd5144bc-41c1-4628-835b-4211f22073c7',
            'FBE2E751-72F9-4136-9B77-755C1D192185', -- Entity: MJ_BizApps_Referrals: Professional Practice Areas
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = 'FBE2E751-72F9-4136-9B77-755C1D192185'),
            'PracticeAreaID',
            'Practice Area ID',
            NULL,
            'uniqueidentifier',
            16,
            0,
            0,
            0,
            NULL,
            0,
            1,
            0,
            0,
            'C6A1D082-6230-40DC-BA5C-7CEE7EA820AF',
            'ID',
            0,
            0,
            1,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '14680f63-d6d6-4231-b16d-dae9cf2295bf' OR (EntityID = 'FBE2E751-72F9-4136-9B77-755C1D192185' AND Name = 'ProficiencyLevel')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '14680f63-d6d6-4231-b16d-dae9cf2295bf',
            'FBE2E751-72F9-4136-9B77-755C1D192185', -- Entity: MJ_BizApps_Referrals: Professional Practice Areas
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = 'FBE2E751-72F9-4136-9B77-755C1D192185'),
            'ProficiencyLevel',
            'Proficiency Level',
            NULL,
            'nvarchar',
            60,
            0,
            0,
            0,
            'Standard',
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            1,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '80e0ec03-6b28-4ede-9de7-92352acc5f1b' OR (EntityID = 'FBE2E751-72F9-4136-9B77-755C1D192185' AND Name = 'YearsInPractice')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '80e0ec03-6b28-4ede-9de7-92352acc5f1b',
            'FBE2E751-72F9-4136-9B77-755C1D192185', -- Entity: MJ_BizApps_Referrals: Professional Practice Areas
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = 'FBE2E751-72F9-4136-9B77-755C1D192185'),
            'YearsInPractice',
            'Years In Practice',
            NULL,
            'int',
            4,
            10,
            0,
            0,
            '(0)',
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            1,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = 'e030abd0-2cae-4f59-83b2-aa3782c69d20' OR (EntityID = 'FBE2E751-72F9-4136-9B77-755C1D192185' AND Name = 'IsPrimary')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            'e030abd0-2cae-4f59-83b2-aa3782c69d20',
            'FBE2E751-72F9-4136-9B77-755C1D192185', -- Entity: MJ_BizApps_Referrals: Professional Practice Areas
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = 'FBE2E751-72F9-4136-9B77-755C1D192185'),
            'IsPrimary',
            'Is Primary',
            NULL,
            'bit',
            1,
            1,
            0,
            0,
            '(0)',
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '7f8b2e5c-d6fa-45ce-b1a5-deb2deae2927' OR (EntityID = 'FBE2E751-72F9-4136-9B77-755C1D192185' AND Name = '__mj_CreatedAt')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '7f8b2e5c-d6fa-45ce-b1a5-deb2deae2927',
            'FBE2E751-72F9-4136-9B77-755C1D192185', -- Entity: MJ_BizApps_Referrals: Professional Practice Areas
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = 'FBE2E751-72F9-4136-9B77-755C1D192185'),
            '__mj_CreatedAt',
            'Created At',
            NULL,
            'datetimeoffset',
            10,
            34,
            7,
            0,
            'getutcdate()',
            0,
            0,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '6731b1c1-ca45-4996-81bc-e04a8d70071e' OR (EntityID = 'FBE2E751-72F9-4136-9B77-755C1D192185' AND Name = '__mj_UpdatedAt')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '6731b1c1-ca45-4996-81bc-e04a8d70071e',
            'FBE2E751-72F9-4136-9B77-755C1D192185', -- Entity: MJ_BizApps_Referrals: Professional Practice Areas
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = 'FBE2E751-72F9-4136-9B77-755C1D192185'),
            '__mj_UpdatedAt',
            'Updated At',
            NULL,
            'datetimeoffset',
            10,
            34,
            7,
            0,
            'getutcdate()',
            0,
            0,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '46cc9832-cd04-4896-af06-bf84f0a2692e' OR (EntityID = 'C6A1D082-6230-40DC-BA5C-7CEE7EA820AF' AND Name = 'ID')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '46cc9832-cd04-4896-af06-bf84f0a2692e',
            'C6A1D082-6230-40DC-BA5C-7CEE7EA820AF', -- Entity: MJ_BizApps_Referrals: Practice Areas
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = 'C6A1D082-6230-40DC-BA5C-7CEE7EA820AF'),
            'ID',
            'ID',
            NULL,
            'uniqueidentifier',
            16,
            0,
            0,
            0,
            'newsequentialid()',
            0,
            0,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            1,
            1,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '4c1cdf4f-ca86-43ec-8630-3bf69b2fc9b4' OR (EntityID = 'C6A1D082-6230-40DC-BA5C-7CEE7EA820AF' AND Name = 'ParentID')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '4c1cdf4f-ca86-43ec-8630-3bf69b2fc9b4',
            'C6A1D082-6230-40DC-BA5C-7CEE7EA820AF', -- Entity: MJ_BizApps_Referrals: Practice Areas
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = 'C6A1D082-6230-40DC-BA5C-7CEE7EA820AF'),
            'ParentID',
            'Parent ID',
            NULL,
            'uniqueidentifier',
            16,
            0,
            0,
            1,
            NULL,
            0,
            1,
            0,
            0,
            'C6A1D082-6230-40DC-BA5C-7CEE7EA820AF',
            'ID',
            0,
            0,
            1,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '70b09666-980e-4181-bb79-119d945b29cd' OR (EntityID = 'C6A1D082-6230-40DC-BA5C-7CEE7EA820AF' AND Name = 'Name')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '70b09666-980e-4181-bb79-119d945b29cd',
            'C6A1D082-6230-40DC-BA5C-7CEE7EA820AF', -- Entity: MJ_BizApps_Referrals: Practice Areas
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = 'C6A1D082-6230-40DC-BA5C-7CEE7EA820AF'),
            'Name',
            'Name',
            NULL,
            'nvarchar',
            300,
            0,
            0,
            0,
            NULL,
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            1,
            1,
            0,
            1,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '7180b2f3-8b6e-412b-bde8-7cd309e98e29' OR (EntityID = 'C6A1D082-6230-40DC-BA5C-7CEE7EA820AF' AND Name = 'Code')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '7180b2f3-8b6e-412b-bde8-7cd309e98e29',
            'C6A1D082-6230-40DC-BA5C-7CEE7EA820AF', -- Entity: MJ_BizApps_Referrals: Practice Areas
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = 'C6A1D082-6230-40DC-BA5C-7CEE7EA820AF'),
            'Code',
            'Code',
            NULL,
            'nvarchar',
            100,
            0,
            0,
            0,
            NULL,
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            1,
            0,
            1,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '57d35b91-e024-43ef-a59d-7a0442ad125f' OR (EntityID = 'C6A1D082-6230-40DC-BA5C-7CEE7EA820AF' AND Name = 'Category')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '57d35b91-e024-43ef-a59d-7a0442ad125f',
            'C6A1D082-6230-40DC-BA5C-7CEE7EA820AF', -- Entity: MJ_BizApps_Referrals: Practice Areas
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = 'C6A1D082-6230-40DC-BA5C-7CEE7EA820AF'),
            'Category',
            'Category',
            NULL,
            'nvarchar',
            200,
            0,
            0,
            1,
            NULL,
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            1,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '58490376-0169-4e4e-a636-e5da36b91705' OR (EntityID = 'C6A1D082-6230-40DC-BA5C-7CEE7EA820AF' AND Name = 'Description')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '58490376-0169-4e4e-a636-e5da36b91705',
            'C6A1D082-6230-40DC-BA5C-7CEE7EA820AF', -- Entity: MJ_BizApps_Referrals: Practice Areas
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = 'C6A1D082-6230-40DC-BA5C-7CEE7EA820AF'),
            'Description',
            'Description',
            NULL,
            'nvarchar',
            -1,
            0,
            0,
            1,
            NULL,
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = 'efd3d2cc-45ea-4830-be9f-12d695f8b63e' OR (EntityID = 'C6A1D082-6230-40DC-BA5C-7CEE7EA820AF' AND Name = 'IconClass')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            'efd3d2cc-45ea-4830-be9f-12d695f8b63e',
            'C6A1D082-6230-40DC-BA5C-7CEE7EA820AF', -- Entity: MJ_BizApps_Referrals: Practice Areas
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = 'C6A1D082-6230-40DC-BA5C-7CEE7EA820AF'),
            'IconClass',
            'Icon Class',
            NULL,
            'nvarchar',
            200,
            0,
            0,
            1,
            NULL,
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '957cfa38-3b85-424d-92e0-4815c76b2ca7' OR (EntityID = 'C6A1D082-6230-40DC-BA5C-7CEE7EA820AF' AND Name = 'DisplayRank')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '957cfa38-3b85-424d-92e0-4815c76b2ca7',
            'C6A1D082-6230-40DC-BA5C-7CEE7EA820AF', -- Entity: MJ_BizApps_Referrals: Practice Areas
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = 'C6A1D082-6230-40DC-BA5C-7CEE7EA820AF'),
            'DisplayRank',
            'Display Rank',
            NULL,
            'int',
            4,
            10,
            0,
            0,
            '(100)',
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = 'a2fc0df3-2600-4048-acde-7a7750da3ba9' OR (EntityID = 'C6A1D082-6230-40DC-BA5C-7CEE7EA820AF' AND Name = 'IsActive')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            'a2fc0df3-2600-4048-acde-7a7750da3ba9',
            'C6A1D082-6230-40DC-BA5C-7CEE7EA820AF', -- Entity: MJ_BizApps_Referrals: Practice Areas
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = 'C6A1D082-6230-40DC-BA5C-7CEE7EA820AF'),
            'IsActive',
            'Is Active',
            NULL,
            'bit',
            1,
            1,
            0,
            0,
            '(1)',
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = 'b85482d7-de17-4c8c-be11-f16a8e043c10' OR (EntityID = 'C6A1D082-6230-40DC-BA5C-7CEE7EA820AF' AND Name = '__mj_CreatedAt')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            'b85482d7-de17-4c8c-be11-f16a8e043c10',
            'C6A1D082-6230-40DC-BA5C-7CEE7EA820AF', -- Entity: MJ_BizApps_Referrals: Practice Areas
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = 'C6A1D082-6230-40DC-BA5C-7CEE7EA820AF'),
            '__mj_CreatedAt',
            'Created At',
            NULL,
            'datetimeoffset',
            10,
            34,
            7,
            0,
            'getutcdate()',
            0,
            0,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = 'd9e35ccd-8aad-472a-a520-dbf3d325215c' OR (EntityID = 'C6A1D082-6230-40DC-BA5C-7CEE7EA820AF' AND Name = '__mj_UpdatedAt')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            'd9e35ccd-8aad-472a-a520-dbf3d325215c',
            'C6A1D082-6230-40DC-BA5C-7CEE7EA820AF', -- Entity: MJ_BizApps_Referrals: Practice Areas
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = 'C6A1D082-6230-40DC-BA5C-7CEE7EA820AF'),
            '__mj_UpdatedAt',
            'Updated At',
            NULL,
            'datetimeoffset',
            10,
            34,
            7,
            0,
            'getutcdate()',
            0,
            0,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '432f78f2-151b-40ff-b078-a92c3f51cab6' OR (EntityID = '7EB379C8-6C97-4640-B0AA-94F0874F4182' AND Name = 'ID')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '432f78f2-151b-40ff-b078-a92c3f51cab6',
            '7EB379C8-6C97-4640-B0AA-94F0874F4182', -- Entity: MJ_BizApps_Referrals: Referral Assignments
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = '7EB379C8-6C97-4640-B0AA-94F0874F4182'),
            'ID',
            'ID',
            NULL,
            'uniqueidentifier',
            16,
            0,
            0,
            0,
            'newsequentialid()',
            0,
            0,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            1,
            1,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = 'ff9f1ab3-ea3e-475d-92ef-4c2e6574216d' OR (EntityID = '7EB379C8-6C97-4640-B0AA-94F0874F4182' AND Name = 'ReferralRequestID')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            'ff9f1ab3-ea3e-475d-92ef-4c2e6574216d',
            '7EB379C8-6C97-4640-B0AA-94F0874F4182', -- Entity: MJ_BizApps_Referrals: Referral Assignments
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = '7EB379C8-6C97-4640-B0AA-94F0874F4182'),
            'ReferralRequestID',
            'Referral Request ID',
            NULL,
            'uniqueidentifier',
            16,
            0,
            0,
            0,
            NULL,
            0,
            1,
            0,
            0,
            'C1CEBBE7-15E6-4134-B303-96F38D585F65',
            'ID',
            0,
            0,
            1,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '9c8fac7e-b002-4ef1-8601-ea1f1420504d' OR (EntityID = '7EB379C8-6C97-4640-B0AA-94F0874F4182' AND Name = 'ProfessionalProfileID')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '9c8fac7e-b002-4ef1-8601-ea1f1420504d',
            '7EB379C8-6C97-4640-B0AA-94F0874F4182', -- Entity: MJ_BizApps_Referrals: Referral Assignments
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = '7EB379C8-6C97-4640-B0AA-94F0874F4182'),
            'ProfessionalProfileID',
            'Professional Profile ID',
            NULL,
            'uniqueidentifier',
            16,
            0,
            0,
            0,
            NULL,
            0,
            1,
            0,
            0,
            '7492A921-FFCF-4A3E-B59A-56C88D16DDE1',
            'ID',
            0,
            0,
            1,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '326bcca6-feb0-4042-a6cd-69424cbf4cc5' OR (EntityID = '7EB379C8-6C97-4640-B0AA-94F0874F4182' AND Name = 'CascadeOrder')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '326bcca6-feb0-4042-a6cd-69424cbf4cc5',
            '7EB379C8-6C97-4640-B0AA-94F0874F4182', -- Entity: MJ_BizApps_Referrals: Referral Assignments
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = '7EB379C8-6C97-4640-B0AA-94F0874F4182'),
            'CascadeOrder',
            'Cascade Order',
            NULL,
            'int',
            4,
            10,
            0,
            0,
            '(1)',
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            1,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '3b2d20b5-3c3b-4f2c-b07c-ed018c139486' OR (EntityID = '7EB379C8-6C97-4640-B0AA-94F0874F4182' AND Name = 'MatchScore')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '3b2d20b5-3c3b-4f2c-b07c-ed018c139486',
            '7EB379C8-6C97-4640-B0AA-94F0874F4182', -- Entity: MJ_BizApps_Referrals: Referral Assignments
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = '7EB379C8-6C97-4640-B0AA-94F0874F4182'),
            'MatchScore',
            'Match Score',
            NULL,
            'decimal',
            5,
            5,
            2,
            0,
            '(0.00)',
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            1,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '6c4d83e2-5164-443e-8427-0de72d5b3365' OR (EntityID = '7EB379C8-6C97-4640-B0AA-94F0874F4182' AND Name = 'ScoreBreakdownJSON')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '6c4d83e2-5164-443e-8427-0de72d5b3365',
            '7EB379C8-6C97-4640-B0AA-94F0874F4182', -- Entity: MJ_BizApps_Referrals: Referral Assignments
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = '7EB379C8-6C97-4640-B0AA-94F0874F4182'),
            'ScoreBreakdownJSON',
            'Score Breakdown JSON',
            NULL,
            'nvarchar',
            -1,
            0,
            0,
            1,
            NULL,
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = 'afc53643-7573-45ba-8ad1-428f322998dd' OR (EntityID = '7EB379C8-6C97-4640-B0AA-94F0874F4182' AND Name = 'ConflictStatus')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            'afc53643-7573-45ba-8ad1-428f322998dd',
            '7EB379C8-6C97-4640-B0AA-94F0874F4182', -- Entity: MJ_BizApps_Referrals: Referral Assignments
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = '7EB379C8-6C97-4640-B0AA-94F0874F4182'),
            'ConflictStatus',
            'Conflict Status',
            NULL,
            'nvarchar',
            60,
            0,
            0,
            0,
            'Pending',
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '91f1a99c-a394-4eac-b39b-1430bd55a938' OR (EntityID = '7EB379C8-6C97-4640-B0AA-94F0874F4182' AND Name = 'ConflictReason')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '91f1a99c-a394-4eac-b39b-1430bd55a938',
            '7EB379C8-6C97-4640-B0AA-94F0874F4182', -- Entity: MJ_BizApps_Referrals: Referral Assignments
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = '7EB379C8-6C97-4640-B0AA-94F0874F4182'),
            'ConflictReason',
            'Conflict Reason',
            NULL,
            'nvarchar',
            -1,
            0,
            0,
            1,
            NULL,
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '39fa22ae-02fa-4c9a-8592-95c9d1adf13f' OR (EntityID = '7EB379C8-6C97-4640-B0AA-94F0874F4182' AND Name = 'Status')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '39fa22ae-02fa-4c9a-8592-95c9d1adf13f',
            '7EB379C8-6C97-4640-B0AA-94F0874F4182', -- Entity: MJ_BizApps_Referrals: Referral Assignments
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = '7EB379C8-6C97-4640-B0AA-94F0874F4182'),
            'Status',
            'Status',
            NULL,
            'nvarchar',
            60,
            0,
            0,
            0,
            'Queued',
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '7123c246-c445-4e19-9d7c-8253a3425726' OR (EntityID = '7EB379C8-6C97-4640-B0AA-94F0874F4182' AND Name = 'OfferedAt')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '7123c246-c445-4e19-9d7c-8253a3425726',
            '7EB379C8-6C97-4640-B0AA-94F0874F4182', -- Entity: MJ_BizApps_Referrals: Referral Assignments
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = '7EB379C8-6C97-4640-B0AA-94F0874F4182'),
            'OfferedAt',
            'Offered At',
            NULL,
            'datetimeoffset',
            10,
            34,
            7,
            1,
            NULL,
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = 'd7be615e-fc42-4a6d-902e-004fcef4f254' OR (EntityID = '7EB379C8-6C97-4640-B0AA-94F0874F4182' AND Name = 'SLADeadlineAt')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            'd7be615e-fc42-4a6d-902e-004fcef4f254',
            '7EB379C8-6C97-4640-B0AA-94F0874F4182', -- Entity: MJ_BizApps_Referrals: Referral Assignments
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = '7EB379C8-6C97-4640-B0AA-94F0874F4182'),
            'SLADeadlineAt',
            'SLA Deadline At',
            NULL,
            'datetimeoffset',
            10,
            34,
            7,
            1,
            NULL,
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '7c1473e3-1abd-4322-9447-3422f01640bc' OR (EntityID = '7EB379C8-6C97-4640-B0AA-94F0874F4182' AND Name = 'RespondedAt')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '7c1473e3-1abd-4322-9447-3422f01640bc',
            '7EB379C8-6C97-4640-B0AA-94F0874F4182', -- Entity: MJ_BizApps_Referrals: Referral Assignments
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = '7EB379C8-6C97-4640-B0AA-94F0874F4182'),
            'RespondedAt',
            'Responded At',
            NULL,
            'datetimeoffset',
            10,
            34,
            7,
            1,
            NULL,
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = 'e7a1832a-1253-47f5-b479-79b669f283c3' OR (EntityID = '7EB379C8-6C97-4640-B0AA-94F0874F4182' AND Name = 'ResponseNotes')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            'e7a1832a-1253-47f5-b479-79b669f283c3',
            '7EB379C8-6C97-4640-B0AA-94F0874F4182', -- Entity: MJ_BizApps_Referrals: Referral Assignments
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = '7EB379C8-6C97-4640-B0AA-94F0874F4182'),
            'ResponseNotes',
            'Response Notes',
            NULL,
            'nvarchar',
            -1,
            0,
            0,
            1,
            NULL,
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '44ecb1d1-f164-456d-af98-702ca7cc1092' OR (EntityID = '7EB379C8-6C97-4640-B0AA-94F0874F4182' AND Name = 'DeclineReason')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '44ecb1d1-f164-456d-af98-702ca7cc1092',
            '7EB379C8-6C97-4640-B0AA-94F0874F4182', -- Entity: MJ_BizApps_Referrals: Referral Assignments
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = '7EB379C8-6C97-4640-B0AA-94F0874F4182'),
            'DeclineReason',
            'Decline Reason',
            NULL,
            'nvarchar',
            510,
            0,
            0,
            1,
            NULL,
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '56be7c54-db5f-4978-9a4f-98add65c80ea' OR (EntityID = '7EB379C8-6C97-4640-B0AA-94F0874F4182' AND Name = '__mj_CreatedAt')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '56be7c54-db5f-4978-9a4f-98add65c80ea',
            '7EB379C8-6C97-4640-B0AA-94F0874F4182', -- Entity: MJ_BizApps_Referrals: Referral Assignments
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = '7EB379C8-6C97-4640-B0AA-94F0874F4182'),
            '__mj_CreatedAt',
            'Created At',
            NULL,
            'datetimeoffset',
            10,
            34,
            7,
            0,
            'getutcdate()',
            0,
            0,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '967a2d97-b8fe-4f64-a076-d6b7787b46b8' OR (EntityID = '7EB379C8-6C97-4640-B0AA-94F0874F4182' AND Name = '__mj_UpdatedAt')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '967a2d97-b8fe-4f64-a076-d6b7787b46b8',
            '7EB379C8-6C97-4640-B0AA-94F0874F4182', -- Entity: MJ_BizApps_Referrals: Referral Assignments
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = '7EB379C8-6C97-4640-B0AA-94F0874F4182'),
            '__mj_UpdatedAt',
            'Updated At',
            NULL,
            'datetimeoffset',
            10,
            34,
            7,
            0,
            'getutcdate()',
            0,
            0,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '1bcead30-bc52-4bba-87b3-f068881d1f23' OR (EntityID = 'C1CEBBE7-15E6-4134-B303-96F38D585F65' AND Name = 'ID')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '1bcead30-bc52-4bba-87b3-f068881d1f23',
            'C1CEBBE7-15E6-4134-B303-96F38D585F65', -- Entity: MJ_BizApps_Referrals: Referral Requests
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = 'C1CEBBE7-15E6-4134-B303-96F38D585F65'),
            'ID',
            'ID',
            NULL,
            'uniqueidentifier',
            16,
            0,
            0,
            0,
            'newsequentialid()',
            0,
            0,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            1,
            1,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '26a540e5-208f-43fc-bd0d-e07e1e87ee13' OR (EntityID = 'C1CEBBE7-15E6-4134-B303-96F38D585F65' AND Name = 'RequestNumber')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '26a540e5-208f-43fc-bd0d-e07e1e87ee13',
            'C1CEBBE7-15E6-4134-B303-96F38D585F65', -- Entity: MJ_BizApps_Referrals: Referral Requests
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = 'C1CEBBE7-15E6-4134-B303-96F38D585F65'),
            'RequestNumber',
            'Request Number',
            NULL,
            'nvarchar',
            100,
            0,
            0,
            0,
            NULL,
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            1,
            0,
            1,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '8cd3dfd6-0fd0-4a46-ae27-e43208043560' OR (EntityID = 'C1CEBBE7-15E6-4134-B303-96F38D585F65' AND Name = 'SeekerName')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '8cd3dfd6-0fd0-4a46-ae27-e43208043560',
            'C1CEBBE7-15E6-4134-B303-96F38D585F65', -- Entity: MJ_BizApps_Referrals: Referral Requests
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = 'C1CEBBE7-15E6-4134-B303-96F38D585F65'),
            'SeekerName',
            'Seeker Name',
            NULL,
            'nvarchar',
            400,
            0,
            0,
            0,
            NULL,
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            1,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '6f6ec755-9924-4184-94b3-56dd1036fee6' OR (EntityID = 'C1CEBBE7-15E6-4134-B303-96F38D585F65' AND Name = 'SeekerEmail')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '6f6ec755-9924-4184-94b3-56dd1036fee6',
            'C1CEBBE7-15E6-4134-B303-96F38D585F65', -- Entity: MJ_BizApps_Referrals: Referral Requests
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = 'C1CEBBE7-15E6-4134-B303-96F38D585F65'),
            'SeekerEmail',
            'Seeker Email',
            NULL,
            'nvarchar',
            510,
            0,
            0,
            0,
            NULL,
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            1,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '8cfb7d21-5d46-4159-aa17-e383975fd7bd' OR (EntityID = 'C1CEBBE7-15E6-4134-B303-96F38D585F65' AND Name = 'SeekerPhone')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '8cfb7d21-5d46-4159-aa17-e383975fd7bd',
            'C1CEBBE7-15E6-4134-B303-96F38D585F65', -- Entity: MJ_BizApps_Referrals: Referral Requests
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = 'C1CEBBE7-15E6-4134-B303-96F38D585F65'),
            'SeekerPhone',
            'Seeker Phone',
            NULL,
            'nvarchar',
            100,
            0,
            0,
            1,
            NULL,
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            1,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '03d557a1-fe80-4e42-8727-42c0f0eb49ae' OR (EntityID = 'C1CEBBE7-15E6-4134-B303-96F38D585F65' AND Name = 'SeekerCompany')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '03d557a1-fe80-4e42-8727-42c0f0eb49ae',
            'C1CEBBE7-15E6-4134-B303-96F38D585F65', -- Entity: MJ_BizApps_Referrals: Referral Requests
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = 'C1CEBBE7-15E6-4134-B303-96F38D585F65'),
            'SeekerCompany',
            'Seeker Company',
            NULL,
            'nvarchar',
            400,
            0,
            0,
            1,
            NULL,
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = 'c167db68-e9e4-45d2-a54f-613b5dbb64af' OR (EntityID = 'C1CEBBE7-15E6-4134-B303-96F38D585F65' AND Name = 'SeekerPersonID')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            'c167db68-e9e4-45d2-a54f-613b5dbb64af',
            'C1CEBBE7-15E6-4134-B303-96F38D585F65', -- Entity: MJ_BizApps_Referrals: Referral Requests
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = 'C1CEBBE7-15E6-4134-B303-96F38D585F65'),
            'SeekerPersonID',
            'Seeker Person ID',
            NULL,
            'uniqueidentifier',
            16,
            0,
            0,
            1,
            NULL,
            0,
            1,
            0,
            0,
            '7A94ADA9-7880-4FAE-97D8-DB0E934C3F5F',
            'ID',
            0,
            0,
            1,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '16b64c7d-24bb-4787-ad16-271889dd6a9a' OR (EntityID = 'C1CEBBE7-15E6-4134-B303-96F38D585F65' AND Name = 'PracticeAreaID')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '16b64c7d-24bb-4787-ad16-271889dd6a9a',
            'C1CEBBE7-15E6-4134-B303-96F38D585F65', -- Entity: MJ_BizApps_Referrals: Referral Requests
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = 'C1CEBBE7-15E6-4134-B303-96F38D585F65'),
            'PracticeAreaID',
            'Practice Area ID',
            NULL,
            'uniqueidentifier',
            16,
            0,
            0,
            0,
            NULL,
            0,
            1,
            0,
            0,
            'C6A1D082-6230-40DC-BA5C-7CEE7EA820AF',
            'ID',
            0,
            0,
            1,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '5716607d-5b6d-4702-9a99-104bc0c33ef9' OR (EntityID = 'C1CEBBE7-15E6-4134-B303-96F38D585F65' AND Name = 'JurisdictionID')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '5716607d-5b6d-4702-9a99-104bc0c33ef9',
            'C1CEBBE7-15E6-4134-B303-96F38D585F65', -- Entity: MJ_BizApps_Referrals: Referral Requests
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = 'C1CEBBE7-15E6-4134-B303-96F38D585F65'),
            'JurisdictionID',
            'Jurisdiction ID',
            NULL,
            'uniqueidentifier',
            16,
            0,
            0,
            0,
            NULL,
            0,
            1,
            0,
            0,
            'B6923104-236C-4100-BA23-C4AC354B47A8',
            'ID',
            0,
            0,
            1,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '15c9482e-e275-4d4c-be4b-642dbdc2aee0' OR (EntityID = 'C1CEBBE7-15E6-4134-B303-96F38D585F65' AND Name = 'ReferralTierID')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '15c9482e-e275-4d4c-be4b-642dbdc2aee0',
            'C1CEBBE7-15E6-4134-B303-96F38D585F65', -- Entity: MJ_BizApps_Referrals: Referral Requests
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = 'C1CEBBE7-15E6-4134-B303-96F38D585F65'),
            'ReferralTierID',
            'Referral Tier ID',
            NULL,
            'uniqueidentifier',
            16,
            0,
            0,
            0,
            NULL,
            0,
            1,
            0,
            0,
            '48BAF761-CB15-47B8-BE87-C6D1B54F25F6',
            'ID',
            0,
            0,
            1,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '3f227f7e-8333-42e5-8304-fe10711896bf' OR (EntityID = 'C1CEBBE7-15E6-4134-B303-96F38D585F65' AND Name = 'MatterTitle')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '3f227f7e-8333-42e5-8304-fe10711896bf',
            'C1CEBBE7-15E6-4134-B303-96F38D585F65', -- Entity: MJ_BizApps_Referrals: Referral Requests
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = 'C1CEBBE7-15E6-4134-B303-96F38D585F65'),
            'MatterTitle',
            'Matter Title',
            NULL,
            'nvarchar',
            510,
            0,
            0,
            0,
            NULL,
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '484abd7f-078d-4c25-9551-8309db64a30a' OR (EntityID = 'C1CEBBE7-15E6-4134-B303-96F38D585F65' AND Name = 'MatterSummary')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '484abd7f-078d-4c25-9551-8309db64a30a',
            'C1CEBBE7-15E6-4134-B303-96F38D585F65', -- Entity: MJ_BizApps_Referrals: Referral Requests
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = 'C1CEBBE7-15E6-4134-B303-96F38D585F65'),
            'MatterSummary',
            'Matter Summary',
            NULL,
            'nvarchar',
            -1,
            0,
            0,
            0,
            NULL,
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '92a1176f-7429-4deb-9ad7-c20775854c9e' OR (EntityID = 'C1CEBBE7-15E6-4134-B303-96F38D585F65' AND Name = 'UrgencyLevel')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '92a1176f-7429-4deb-9ad7-c20775854c9e',
            'C1CEBBE7-15E6-4134-B303-96F38D585F65', -- Entity: MJ_BizApps_Referrals: Referral Requests
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = 'C1CEBBE7-15E6-4134-B303-96F38D585F65'),
            'UrgencyLevel',
            'Urgency Level',
            NULL,
            'nvarchar',
            40,
            0,
            0,
            0,
            'Standard',
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '55758458-3468-444b-9b82-ccb0f20aaf36' OR (EntityID = 'C1CEBBE7-15E6-4134-B303-96F38D585F65' AND Name = 'BudgetRange')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '55758458-3468-444b-9b82-ccb0f20aaf36',
            'C1CEBBE7-15E6-4134-B303-96F38D585F65', -- Entity: MJ_BizApps_Referrals: Referral Requests
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = 'C1CEBBE7-15E6-4134-B303-96F38D585F65'),
            'BudgetRange',
            'Budget Range',
            NULL,
            'nvarchar',
            200,
            0,
            0,
            1,
            NULL,
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '32595151-24e4-4970-a91f-2fb2d88d0369' OR (EntityID = 'C1CEBBE7-15E6-4134-B303-96F38D585F65' AND Name = 'PreferredLanguage')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '32595151-24e4-4970-a91f-2fb2d88d0369',
            'C1CEBBE7-15E6-4134-B303-96F38D585F65', -- Entity: MJ_BizApps_Referrals: Referral Requests
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = 'C1CEBBE7-15E6-4134-B303-96F38D585F65'),
            'PreferredLanguage',
            'Preferred Language',
            NULL,
            'nvarchar',
            200,
            0,
            0,
            1,
            'English',
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = 'aba0a1f3-6351-422f-a6ae-0df91d087c6c' OR (EntityID = 'C1CEBBE7-15E6-4134-B303-96F38D585F65' AND Name = 'RequiresProBono')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            'aba0a1f3-6351-422f-a6ae-0df91d087c6c',
            'C1CEBBE7-15E6-4134-B303-96F38D585F65', -- Entity: MJ_BizApps_Referrals: Referral Requests
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = 'C1CEBBE7-15E6-4134-B303-96F38D585F65'),
            'RequiresProBono',
            'Requires Pro Bono',
            NULL,
            'bit',
            1,
            1,
            0,
            0,
            '(0)',
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = 'fcb14234-4787-41db-99de-ee9e71d44a13' OR (EntityID = 'C1CEBBE7-15E6-4134-B303-96F38D585F65' AND Name = 'Status')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            'fcb14234-4787-41db-99de-ee9e71d44a13',
            'C1CEBBE7-15E6-4134-B303-96F38D585F65', -- Entity: MJ_BizApps_Referrals: Referral Requests
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = 'C1CEBBE7-15E6-4134-B303-96F38D585F65'),
            'Status',
            'Status',
            NULL,
            'nvarchar',
            60,
            0,
            0,
            0,
            'Draft',
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = 'ae0f54fc-39f7-442b-ae92-a1f1b8ca9f9a' OR (EntityID = 'C1CEBBE7-15E6-4134-B303-96F38D585F65' AND Name = 'AssignedProfessionalID')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            'ae0f54fc-39f7-442b-ae92-a1f1b8ca9f9a',
            'C1CEBBE7-15E6-4134-B303-96F38D585F65', -- Entity: MJ_BizApps_Referrals: Referral Requests
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = 'C1CEBBE7-15E6-4134-B303-96F38D585F65'),
            'AssignedProfessionalID',
            'Assigned Professional ID',
            NULL,
            'uniqueidentifier',
            16,
            0,
            0,
            1,
            NULL,
            0,
            1,
            0,
            0,
            '7492A921-FFCF-4A3E-B59A-56C88D16DDE1',
            'ID',
            0,
            0,
            1,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '76f10071-da0c-4668-b0df-5422c4aa920c' OR (EntityID = 'C1CEBBE7-15E6-4134-B303-96F38D585F65' AND Name = 'CurrentCascadeStep')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '76f10071-da0c-4668-b0df-5422c4aa920c',
            'C1CEBBE7-15E6-4134-B303-96F38D585F65', -- Entity: MJ_BizApps_Referrals: Referral Requests
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = 'C1CEBBE7-15E6-4134-B303-96F38D585F65'),
            'CurrentCascadeStep',
            'Current Cascade Step',
            NULL,
            'int',
            4,
            10,
            0,
            0,
            '(0)',
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '8e0c8435-5647-45b8-95b0-3ae2570a6609' OR (EntityID = 'C1CEBBE7-15E6-4134-B303-96F38D585F65' AND Name = 'SubmittedAt')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '8e0c8435-5647-45b8-95b0-3ae2570a6609',
            'C1CEBBE7-15E6-4134-B303-96F38D585F65', -- Entity: MJ_BizApps_Referrals: Referral Requests
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = 'C1CEBBE7-15E6-4134-B303-96F38D585F65'),
            'SubmittedAt',
            'Submitted At',
            NULL,
            'datetimeoffset',
            10,
            34,
            7,
            1,
            NULL,
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '30be1fbc-1593-41f3-8bbd-a14d431ce6fc' OR (EntityID = 'C1CEBBE7-15E6-4134-B303-96F38D585F65' AND Name = 'AcceptedAt')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '30be1fbc-1593-41f3-8bbd-a14d431ce6fc',
            'C1CEBBE7-15E6-4134-B303-96F38D585F65', -- Entity: MJ_BizApps_Referrals: Referral Requests
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = 'C1CEBBE7-15E6-4134-B303-96F38D585F65'),
            'AcceptedAt',
            'Accepted At',
            NULL,
            'datetimeoffset',
            10,
            34,
            7,
            1,
            NULL,
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = 'a2e02596-70c1-4825-8c89-f6797419c83b' OR (EntityID = 'C1CEBBE7-15E6-4134-B303-96F38D585F65' AND Name = 'CompletedAt')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            'a2e02596-70c1-4825-8c89-f6797419c83b',
            'C1CEBBE7-15E6-4134-B303-96F38D585F65', -- Entity: MJ_BizApps_Referrals: Referral Requests
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = 'C1CEBBE7-15E6-4134-B303-96F38D585F65'),
            'CompletedAt',
            'Completed At',
            NULL,
            'datetimeoffset',
            10,
            34,
            7,
            1,
            NULL,
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '28d67407-8eb8-4e10-9b80-b157700ad332' OR (EntityID = 'C1CEBBE7-15E6-4134-B303-96F38D585F65' AND Name = '__mj_CreatedAt')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '28d67407-8eb8-4e10-9b80-b157700ad332',
            'C1CEBBE7-15E6-4134-B303-96F38D585F65', -- Entity: MJ_BizApps_Referrals: Referral Requests
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = 'C1CEBBE7-15E6-4134-B303-96F38D585F65'),
            '__mj_CreatedAt',
            'Created At',
            NULL,
            'datetimeoffset',
            10,
            34,
            7,
            0,
            'getutcdate()',
            0,
            0,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '4d24344a-7093-40ed-85d5-0e87892e9f4d' OR (EntityID = 'C1CEBBE7-15E6-4134-B303-96F38D585F65' AND Name = '__mj_UpdatedAt')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '4d24344a-7093-40ed-85d5-0e87892e9f4d',
            'C1CEBBE7-15E6-4134-B303-96F38D585F65', -- Entity: MJ_BizApps_Referrals: Referral Requests
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = 'C1CEBBE7-15E6-4134-B303-96F38D585F65'),
            '__mj_UpdatedAt',
            'Updated At',
            NULL,
            'datetimeoffset',
            10,
            34,
            7,
            0,
            'getutcdate()',
            0,
            0,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = 'dba789ad-c262-45e1-95d6-d405f13e6d22' OR (EntityID = 'B6923104-236C-4100-BA23-C4AC354B47A8' AND Name = 'ID')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            'dba789ad-c262-45e1-95d6-d405f13e6d22',
            'B6923104-236C-4100-BA23-C4AC354B47A8', -- Entity: MJ_BizApps_Referrals: Jurisdictions
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = 'B6923104-236C-4100-BA23-C4AC354B47A8'),
            'ID',
            'ID',
            NULL,
            'uniqueidentifier',
            16,
            0,
            0,
            0,
            'newsequentialid()',
            0,
            0,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            1,
            1,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = 'ebc62e63-38b2-4b42-8466-4f985d17de48' OR (EntityID = 'B6923104-236C-4100-BA23-C4AC354B47A8' AND Name = 'ParentID')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            'ebc62e63-38b2-4b42-8466-4f985d17de48',
            'B6923104-236C-4100-BA23-C4AC354B47A8', -- Entity: MJ_BizApps_Referrals: Jurisdictions
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = 'B6923104-236C-4100-BA23-C4AC354B47A8'),
            'ParentID',
            'Parent ID',
            NULL,
            'uniqueidentifier',
            16,
            0,
            0,
            1,
            NULL,
            0,
            1,
            0,
            0,
            'B6923104-236C-4100-BA23-C4AC354B47A8',
            'ID',
            0,
            0,
            1,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '1bcd3d84-3c06-419f-bbe3-c5a0fbb3c27e' OR (EntityID = 'B6923104-236C-4100-BA23-C4AC354B47A8' AND Name = 'Name')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '1bcd3d84-3c06-419f-bbe3-c5a0fbb3c27e',
            'B6923104-236C-4100-BA23-C4AC354B47A8', -- Entity: MJ_BizApps_Referrals: Jurisdictions
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = 'B6923104-236C-4100-BA23-C4AC354B47A8'),
            'Name',
            'Name',
            NULL,
            'nvarchar',
            300,
            0,
            0,
            0,
            NULL,
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            1,
            1,
            0,
            1,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '31ad93d3-f071-4d45-a405-e87bbf83f6c9' OR (EntityID = 'B6923104-236C-4100-BA23-C4AC354B47A8' AND Name = 'Code')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '31ad93d3-f071-4d45-a405-e87bbf83f6c9',
            'B6923104-236C-4100-BA23-C4AC354B47A8', -- Entity: MJ_BizApps_Referrals: Jurisdictions
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = 'B6923104-236C-4100-BA23-C4AC354B47A8'),
            'Code',
            'Code',
            NULL,
            'nvarchar',
            100,
            0,
            0,
            0,
            NULL,
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            1,
            0,
            1,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '9ea3c4ad-4130-4b75-a1fe-0da765337488' OR (EntityID = 'B6923104-236C-4100-BA23-C4AC354B47A8' AND Name = 'JurisdictionType')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '9ea3c4ad-4130-4b75-a1fe-0da765337488',
            'B6923104-236C-4100-BA23-C4AC354B47A8', -- Entity: MJ_BizApps_Referrals: Jurisdictions
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = 'B6923104-236C-4100-BA23-C4AC354B47A8'),
            'JurisdictionType',
            'Jurisdiction Type',
            NULL,
            'nvarchar',
            60,
            0,
            0,
            0,
            'State',
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            1,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = 'd5f5b137-5593-491a-b980-d7c4eb01c52a' OR (EntityID = 'B6923104-236C-4100-BA23-C4AC354B47A8' AND Name = 'CountryCode')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            'd5f5b137-5593-491a-b980-d7c4eb01c52a',
            'B6923104-236C-4100-BA23-C4AC354B47A8', -- Entity: MJ_BizApps_Referrals: Jurisdictions
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = 'B6923104-236C-4100-BA23-C4AC354B47A8'),
            'CountryCode',
            'Country Code',
            NULL,
            'nvarchar',
            20,
            0,
            0,
            0,
            'US',
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '2023c5c8-fb4a-4bf0-8e70-65af11daf59c' OR (EntityID = 'B6923104-236C-4100-BA23-C4AC354B47A8' AND Name = 'StateProvinceCode')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '2023c5c8-fb4a-4bf0-8e70-65af11daf59c',
            'B6923104-236C-4100-BA23-C4AC354B47A8', -- Entity: MJ_BizApps_Referrals: Jurisdictions
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = 'B6923104-236C-4100-BA23-C4AC354B47A8'),
            'StateProvinceCode',
            'State Province Code',
            NULL,
            'nvarchar',
            40,
            0,
            0,
            1,
            NULL,
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '00a77b6a-6431-4423-93ba-952b35f7e579' OR (EntityID = 'B6923104-236C-4100-BA23-C4AC354B47A8' AND Name = 'IsActive')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '00a77b6a-6431-4423-93ba-952b35f7e579',
            'B6923104-236C-4100-BA23-C4AC354B47A8', -- Entity: MJ_BizApps_Referrals: Jurisdictions
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = 'B6923104-236C-4100-BA23-C4AC354B47A8'),
            'IsActive',
            'Is Active',
            NULL,
            'bit',
            1,
            1,
            0,
            0,
            '(1)',
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '333d66ec-a66c-420f-89d6-23af0edc2737' OR (EntityID = 'B6923104-236C-4100-BA23-C4AC354B47A8' AND Name = '__mj_CreatedAt')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '333d66ec-a66c-420f-89d6-23af0edc2737',
            'B6923104-236C-4100-BA23-C4AC354B47A8', -- Entity: MJ_BizApps_Referrals: Jurisdictions
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = 'B6923104-236C-4100-BA23-C4AC354B47A8'),
            '__mj_CreatedAt',
            'Created At',
            NULL,
            'datetimeoffset',
            10,
            34,
            7,
            0,
            'getutcdate()',
            0,
            0,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = 'af5fa449-28f3-4e5f-96c2-34541756683f' OR (EntityID = 'B6923104-236C-4100-BA23-C4AC354B47A8' AND Name = '__mj_UpdatedAt')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            'af5fa449-28f3-4e5f-96c2-34541756683f',
            'B6923104-236C-4100-BA23-C4AC354B47A8', -- Entity: MJ_BizApps_Referrals: Jurisdictions
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = 'B6923104-236C-4100-BA23-C4AC354B47A8'),
            '__mj_UpdatedAt',
            'Updated At',
            NULL,
            'datetimeoffset',
            10,
            34,
            7,
            0,
            'getutcdate()',
            0,
            0,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '6bbe1e5c-c45d-49d4-82c6-e600d75310d4' OR (EntityID = '48BAF761-CB15-47B8-BE87-C6D1B54F25F6' AND Name = 'ID')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '6bbe1e5c-c45d-49d4-82c6-e600d75310d4',
            '48BAF761-CB15-47B8-BE87-C6D1B54F25F6', -- Entity: MJ_BizApps_Referrals: Referral Tiers
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = '48BAF761-CB15-47B8-BE87-C6D1B54F25F6'),
            'ID',
            'ID',
            NULL,
            'uniqueidentifier',
            16,
            0,
            0,
            0,
            'newsequentialid()',
            0,
            0,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            1,
            1,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = 'af58c62c-a53c-4310-87f5-07ad122e29c7' OR (EntityID = '48BAF761-CB15-47B8-BE87-C6D1B54F25F6' AND Name = 'Name')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            'af58c62c-a53c-4310-87f5-07ad122e29c7',
            '48BAF761-CB15-47B8-BE87-C6D1B54F25F6', -- Entity: MJ_BizApps_Referrals: Referral Tiers
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = '48BAF761-CB15-47B8-BE87-C6D1B54F25F6'),
            'Name',
            'Name',
            NULL,
            'nvarchar',
            200,
            0,
            0,
            0,
            NULL,
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            1,
            1,
            0,
            1,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = 'ed75adba-d466-41e4-b7cc-65b3b00afc63' OR (EntityID = '48BAF761-CB15-47B8-BE87-C6D1B54F25F6' AND Name = 'Code')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            'ed75adba-d466-41e4-b7cc-65b3b00afc63',
            '48BAF761-CB15-47B8-BE87-C6D1B54F25F6', -- Entity: MJ_BizApps_Referrals: Referral Tiers
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = '48BAF761-CB15-47B8-BE87-C6D1B54F25F6'),
            'Code',
            'Code',
            NULL,
            'nvarchar',
            100,
            0,
            0,
            0,
            NULL,
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            1,
            0,
            1,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '21266fbf-9bae-4eab-a5d9-db421b479369' OR (EntityID = '48BAF761-CB15-47B8-BE87-C6D1B54F25F6' AND Name = 'SLAResponseHours')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '21266fbf-9bae-4eab-a5d9-db421b479369',
            '48BAF761-CB15-47B8-BE87-C6D1B54F25F6', -- Entity: MJ_BizApps_Referrals: Referral Tiers
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = '48BAF761-CB15-47B8-BE87-C6D1B54F25F6'),
            'SLAResponseHours',
            'SLA Response Hours',
            NULL,
            'int',
            4,
            10,
            0,
            0,
            '(24)',
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            1,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '40bee2de-8cef-47cb-b96b-1b310fdad79d' OR (EntityID = '48BAF761-CB15-47B8-BE87-C6D1B54F25F6' AND Name = 'MaxCascadeAttempts')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '40bee2de-8cef-47cb-b96b-1b310fdad79d',
            '48BAF761-CB15-47B8-BE87-C6D1B54F25F6', -- Entity: MJ_BizApps_Referrals: Referral Tiers
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = '48BAF761-CB15-47B8-BE87-C6D1B54F25F6'),
            'MaxCascadeAttempts',
            'Max Cascade Attempts',
            NULL,
            'int',
            4,
            10,
            0,
            0,
            '(3)',
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            1,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '40cdd939-99c7-48e5-b597-72acee41aec2' OR (EntityID = '48BAF761-CB15-47B8-BE87-C6D1B54F25F6' AND Name = 'PriorityWeight')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '40cdd939-99c7-48e5-b597-72acee41aec2',
            '48BAF761-CB15-47B8-BE87-C6D1B54F25F6', -- Entity: MJ_BizApps_Referrals: Referral Tiers
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = '48BAF761-CB15-47B8-BE87-C6D1B54F25F6'),
            'PriorityWeight',
            'Priority Weight',
            NULL,
            'decimal',
            5,
            5,
            2,
            0,
            '(1.00)',
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = 'e3523709-cade-44c3-a552-abf3f3049028' OR (EntityID = '48BAF761-CB15-47B8-BE87-C6D1B54F25F6' AND Name = 'RequireConflictCheck')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            'e3523709-cade-44c3-a552-abf3f3049028',
            '48BAF761-CB15-47B8-BE87-C6D1B54F25F6', -- Entity: MJ_BizApps_Referrals: Referral Tiers
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = '48BAF761-CB15-47B8-BE87-C6D1B54F25F6'),
            'RequireConflictCheck',
            'Require Conflict Check',
            NULL,
            'bit',
            1,
            1,
            0,
            0,
            '(1)',
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '7ab8d45c-2ff4-40fc-a672-d551a3343285' OR (EntityID = '48BAF761-CB15-47B8-BE87-C6D1B54F25F6' AND Name = 'Description')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '7ab8d45c-2ff4-40fc-a672-d551a3343285',
            '48BAF761-CB15-47B8-BE87-C6D1B54F25F6', -- Entity: MJ_BizApps_Referrals: Referral Tiers
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = '48BAF761-CB15-47B8-BE87-C6D1B54F25F6'),
            'Description',
            'Description',
            NULL,
            'nvarchar',
            -1,
            0,
            0,
            1,
            NULL,
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '4e230a37-0306-45d8-862b-8280f3686087' OR (EntityID = '48BAF761-CB15-47B8-BE87-C6D1B54F25F6' AND Name = 'IsActive')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '4e230a37-0306-45d8-862b-8280f3686087',
            '48BAF761-CB15-47B8-BE87-C6D1B54F25F6', -- Entity: MJ_BizApps_Referrals: Referral Tiers
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = '48BAF761-CB15-47B8-BE87-C6D1B54F25F6'),
            'IsActive',
            'Is Active',
            NULL,
            'bit',
            1,
            1,
            0,
            0,
            '(1)',
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '769ee3fc-a194-411a-9630-8f8955d2fb36' OR (EntityID = '48BAF761-CB15-47B8-BE87-C6D1B54F25F6' AND Name = '__mj_CreatedAt')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '769ee3fc-a194-411a-9630-8f8955d2fb36',
            '48BAF761-CB15-47B8-BE87-C6D1B54F25F6', -- Entity: MJ_BizApps_Referrals: Referral Tiers
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = '48BAF761-CB15-47B8-BE87-C6D1B54F25F6'),
            '__mj_CreatedAt',
            'Created At',
            NULL,
            'datetimeoffset',
            10,
            34,
            7,
            0,
            'getutcdate()',
            0,
            0,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '7601ed80-0548-4e86-9115-0dbacb2baa60' OR (EntityID = '48BAF761-CB15-47B8-BE87-C6D1B54F25F6' AND Name = '__mj_UpdatedAt')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '7601ed80-0548-4e86-9115-0dbacb2baa60',
            '48BAF761-CB15-47B8-BE87-C6D1B54F25F6', -- Entity: MJ_BizApps_Referrals: Referral Tiers
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = '48BAF761-CB15-47B8-BE87-C6D1B54F25F6'),
            '__mj_UpdatedAt',
            'Updated At',
            NULL,
            'datetimeoffset',
            10,
            34,
            7,
            0,
            'getutcdate()',
            0,
            0,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '1dca2dc1-e670-4489-bcbb-ddd5402f6eb3' OR (EntityID = 'B932CD45-C00E-4C73-A21F-FAE50020AF94' AND Name = 'ID')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '1dca2dc1-e670-4489-bcbb-ddd5402f6eb3',
            'B932CD45-C00E-4C73-A21F-FAE50020AF94', -- Entity: MJ_BizApps_Referrals: Conflict Check Parties
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = 'B932CD45-C00E-4C73-A21F-FAE50020AF94'),
            'ID',
            'ID',
            NULL,
            'uniqueidentifier',
            16,
            0,
            0,
            0,
            'newsequentialid()',
            0,
            0,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            1,
            1,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '1d38d77a-72c4-4f63-a30b-7ff98a4fbcc4' OR (EntityID = 'B932CD45-C00E-4C73-A21F-FAE50020AF94' AND Name = 'ReferralRequestID')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '1d38d77a-72c4-4f63-a30b-7ff98a4fbcc4',
            'B932CD45-C00E-4C73-A21F-FAE50020AF94', -- Entity: MJ_BizApps_Referrals: Conflict Check Parties
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = 'B932CD45-C00E-4C73-A21F-FAE50020AF94'),
            'ReferralRequestID',
            'Referral Request ID',
            NULL,
            'uniqueidentifier',
            16,
            0,
            0,
            0,
            NULL,
            0,
            1,
            0,
            0,
            'C1CEBBE7-15E6-4134-B303-96F38D585F65',
            'ID',
            0,
            0,
            1,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = 'dbe2e816-1cc7-4735-95e6-d83ae19275e9' OR (EntityID = 'B932CD45-C00E-4C73-A21F-FAE50020AF94' AND Name = 'PartyName')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            'dbe2e816-1cc7-4735-95e6-d83ae19275e9',
            'B932CD45-C00E-4C73-A21F-FAE50020AF94', -- Entity: MJ_BizApps_Referrals: Conflict Check Parties
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = 'B932CD45-C00E-4C73-A21F-FAE50020AF94'),
            'PartyName',
            'Party Name',
            NULL,
            'nvarchar',
            510,
            0,
            0,
            0,
            NULL,
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            1,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = 'f236d4a8-fdcb-439f-9238-99fa20f9312f' OR (EntityID = 'B932CD45-C00E-4C73-A21F-FAE50020AF94' AND Name = 'PartyRole')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            'f236d4a8-fdcb-439f-9238-99fa20f9312f',
            'B932CD45-C00E-4C73-A21F-FAE50020AF94', -- Entity: MJ_BizApps_Referrals: Conflict Check Parties
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = 'B932CD45-C00E-4C73-A21F-FAE50020AF94'),
            'PartyRole',
            'Party Role',
            NULL,
            'nvarchar',
            60,
            0,
            0,
            0,
            'Adverse',
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            1,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = 'a1ee4e77-4916-47bc-a633-bec3a23fc088' OR (EntityID = 'B932CD45-C00E-4C73-A21F-FAE50020AF94' AND Name = 'OrganizationName')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            'a1ee4e77-4916-47bc-a633-bec3a23fc088',
            'B932CD45-C00E-4C73-A21F-FAE50020AF94', -- Entity: MJ_BizApps_Referrals: Conflict Check Parties
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = 'B932CD45-C00E-4C73-A21F-FAE50020AF94'),
            'OrganizationName',
            'Organization Name',
            NULL,
            'nvarchar',
            510,
            0,
            0,
            1,
            NULL,
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            1,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = 'ddfc9f7f-c4b1-4eee-b616-2b6c86aee557' OR (EntityID = 'B932CD45-C00E-4C73-A21F-FAE50020AF94' AND Name = 'NormalizedName')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            'ddfc9f7f-c4b1-4eee-b616-2b6c86aee557',
            'B932CD45-C00E-4C73-A21F-FAE50020AF94', -- Entity: MJ_BizApps_Referrals: Conflict Check Parties
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = 'B932CD45-C00E-4C73-A21F-FAE50020AF94'),
            'NormalizedName',
            'Normalized Name',
            NULL,
            'nvarchar',
            510,
            0,
            0,
            0,
            NULL,
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '157ce282-946e-4e9d-b73d-a2a204d4de18' OR (EntityID = 'B932CD45-C00E-4C73-A21F-FAE50020AF94' AND Name = 'Notes')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '157ce282-946e-4e9d-b73d-a2a204d4de18',
            'B932CD45-C00E-4C73-A21F-FAE50020AF94', -- Entity: MJ_BizApps_Referrals: Conflict Check Parties
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = 'B932CD45-C00E-4C73-A21F-FAE50020AF94'),
            'Notes',
            'Notes',
            NULL,
            'nvarchar',
            -1,
            0,
            0,
            1,
            NULL,
            0,
            1,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '9dff9b4d-4e2e-4301-a475-88da0514344b' OR (EntityID = 'B932CD45-C00E-4C73-A21F-FAE50020AF94' AND Name = '__mj_CreatedAt')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '9dff9b4d-4e2e-4301-a475-88da0514344b',
            'B932CD45-C00E-4C73-A21F-FAE50020AF94', -- Entity: MJ_BizApps_Referrals: Conflict Check Parties
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = 'B932CD45-C00E-4C73-A21F-FAE50020AF94'),
            '__mj_CreatedAt',
            'Created At',
            NULL,
            'datetimeoffset',
            10,
            34,
            7,
            0,
            'getutcdate()',
            0,
            0,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = 'ea141bbe-3733-456d-84a0-7eaeec56b6fe' OR (EntityID = 'B932CD45-C00E-4C73-A21F-FAE50020AF94' AND Name = '__mj_UpdatedAt')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            'ea141bbe-3733-456d-84a0-7eaeec56b6fe',
            'B932CD45-C00E-4C73-A21F-FAE50020AF94', -- Entity: MJ_BizApps_Referrals: Conflict Check Parties
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = 'B932CD45-C00E-4C73-A21F-FAE50020AF94'),
            '__mj_UpdatedAt',
            'Updated At',
            NULL,
            'datetimeoffset',
            10,
            34,
            7,
            0,
            'getutcdate()',
            0,
            0,
            0,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

/* SQL text to sync entity unique keys (6 added, 0 updated, 0 removed) */
INSERT INTO [${flyway:defaultSchema}].[EntityUniqueKey] ([ID], [EntityID], [Name], [FieldNames], [FilterDefinition]) VALUES ('6f3ffd57-a711-449e-ab57-b95a330624a8', '48BAF761-CB15-47B8-BE87-C6D1B54F25F6', 'UQ_ReferralTier_Code', 'Code', NULL);
INSERT INTO [${flyway:defaultSchema}].[EntityUniqueKey] ([ID], [EntityID], [Name], [FieldNames], [FilterDefinition]) VALUES ('d4906f3e-5399-4825-a57d-d2ca2ba95976', '9210D51B-1131-4C40-80DF-62DC5799AFFB', 'UQ_ProfessionalJurisdiction_Pair', 'ProfessionalProfileID,JurisdictionID', NULL);
INSERT INTO [${flyway:defaultSchema}].[EntityUniqueKey] ([ID], [EntityID], [Name], [FieldNames], [FilterDefinition]) VALUES ('49dd94ff-f070-486b-a48e-04c7d6fac047', 'B6923104-236C-4100-BA23-C4AC354B47A8', 'UQ_Jurisdiction_Code', 'Code', NULL);
INSERT INTO [${flyway:defaultSchema}].[EntityUniqueKey] ([ID], [EntityID], [Name], [FieldNames], [FilterDefinition]) VALUES ('d2879b59-36ea-4629-a89c-2412dca1aa22', 'C1CEBBE7-15E6-4134-B303-96F38D585F65', 'UQ_ReferralRequest_RequestNumber', 'RequestNumber', NULL);
INSERT INTO [${flyway:defaultSchema}].[EntityUniqueKey] ([ID], [EntityID], [Name], [FieldNames], [FilterDefinition]) VALUES ('936dfff1-26a3-444e-ba77-edf127c4acf8', 'C6A1D082-6230-40DC-BA5C-7CEE7EA820AF', 'UQ_PracticeArea_Code', 'Code', NULL);
INSERT INTO [${flyway:defaultSchema}].[EntityUniqueKey] ([ID], [EntityID], [Name], [FieldNames], [FilterDefinition]) VALUES ('4c574596-d300-449e-b5d8-7028d977d757', 'FBE2E751-72F9-4136-9B77-755C1D192185', 'UQ_ProfessionalPracticeArea_Pair', 'ProfessionalProfileID,PracticeAreaID', NULL);

/* SQL text to sync 6 entity field value row(s) for entity field ID 9EA3C4AD-4130-4B75-A1FE-0DA765337488 */
INSERT INTO [${flyway:defaultSchema}].[EntityFieldValue]
                                       ([ID], [EntityFieldID], [Sequence], [Value], [Code], [Source], [__mj_CreatedAt], [__mj_UpdatedAt])
                                    VALUES
                                       ('64c0aaa5-822e-4546-a3ed-c11d7f10a53d', '9EA3C4AD-4130-4B75-A1FE-0DA765337488', 1, 'Country', 'Country', 'Check', GETUTCDATE(), GETUTCDATE());
INSERT INTO [${flyway:defaultSchema}].[EntityFieldValue]
                                       ([ID], [EntityFieldID], [Sequence], [Value], [Code], [Source], [__mj_CreatedAt], [__mj_UpdatedAt])
                                    VALUES
                                       ('3ac3aedd-03a7-4411-9b4c-b59815dd7047', '9EA3C4AD-4130-4B75-A1FE-0DA765337488', 2, 'Federal', 'Federal', 'Check', GETUTCDATE(), GETUTCDATE());
INSERT INTO [${flyway:defaultSchema}].[EntityFieldValue]
                                       ([ID], [EntityFieldID], [Sequence], [Value], [Code], [Source], [__mj_CreatedAt], [__mj_UpdatedAt])
                                    VALUES
                                       ('a2239139-5420-4ae2-8b2e-6020b0c20439', '9EA3C4AD-4130-4B75-A1FE-0DA765337488', 3, 'International', 'International', 'Check', GETUTCDATE(), GETUTCDATE());
INSERT INTO [${flyway:defaultSchema}].[EntityFieldValue]
                                       ([ID], [EntityFieldID], [Sequence], [Value], [Code], [Source], [__mj_CreatedAt], [__mj_UpdatedAt])
                                    VALUES
                                       ('4884293a-7ada-4cc6-b261-a91a63f07c5f', '9EA3C4AD-4130-4B75-A1FE-0DA765337488', 4, 'Municipal', 'Municipal', 'Check', GETUTCDATE(), GETUTCDATE());
INSERT INTO [${flyway:defaultSchema}].[EntityFieldValue]
                                       ([ID], [EntityFieldID], [Sequence], [Value], [Code], [Source], [__mj_CreatedAt], [__mj_UpdatedAt])
                                    VALUES
                                       ('7a78e775-d0b0-4e78-8f84-22b42d23579b', '9EA3C4AD-4130-4B75-A1FE-0DA765337488', 5, 'Province', 'Province', 'Check', GETUTCDATE(), GETUTCDATE());
INSERT INTO [${flyway:defaultSchema}].[EntityFieldValue]
                                       ([ID], [EntityFieldID], [Sequence], [Value], [Code], [Source], [__mj_CreatedAt], [__mj_UpdatedAt])
                                    VALUES
                                       ('2d3e0952-10c8-4997-af54-3a8b264d87c0', '9EA3C4AD-4130-4B75-A1FE-0DA765337488', 6, 'State', 'State', 'Check', GETUTCDATE(), GETUTCDATE());

/* SQL text to update ValueListType for entity field ID 9EA3C4AD-4130-4B75-A1FE-0DA765337488 */
UPDATE [${flyway:defaultSchema}].[EntityField] SET ValueListType='List' WHERE ID='9EA3C4AD-4130-4B75-A1FE-0DA765337488';

/* SQL text to sync 4 entity field value row(s) for entity field ID 49656B23-A371-4F3D-9DD4-4824B97AAED3 */
INSERT INTO [${flyway:defaultSchema}].[EntityFieldValue]
                                       ([ID], [EntityFieldID], [Sequence], [Value], [Code], [Source], [__mj_CreatedAt], [__mj_UpdatedAt])
                                    VALUES
                                       ('aa6ddf92-bed8-43c6-8e05-511cc3de6fb7', '49656B23-A371-4F3D-9DD4-4824B97AAED3', 1, 'Expired', 'Expired', 'Check', GETUTCDATE(), GETUTCDATE());
INSERT INTO [${flyway:defaultSchema}].[EntityFieldValue]
                                       ([ID], [EntityFieldID], [Sequence], [Value], [Code], [Source], [__mj_CreatedAt], [__mj_UpdatedAt])
                                    VALUES
                                       ('3c5b3875-b081-4ed3-a0dd-b7cb10aa9a3a', '49656B23-A371-4F3D-9DD4-4824B97AAED3', 2, 'Pending', 'Pending', 'Check', GETUTCDATE(), GETUTCDATE());
INSERT INTO [${flyway:defaultSchema}].[EntityFieldValue]
                                       ([ID], [EntityFieldID], [Sequence], [Value], [Code], [Source], [__mj_CreatedAt], [__mj_UpdatedAt])
                                    VALUES
                                       ('a9077fee-c573-48ea-a4dc-7ce1092df4c4', '49656B23-A371-4F3D-9DD4-4824B97AAED3', 3, 'Suspended', 'Suspended', 'Check', GETUTCDATE(), GETUTCDATE());
INSERT INTO [${flyway:defaultSchema}].[EntityFieldValue]
                                       ([ID], [EntityFieldID], [Sequence], [Value], [Code], [Source], [__mj_CreatedAt], [__mj_UpdatedAt])
                                    VALUES
                                       ('69461269-eb20-4d99-84bf-1e134d0067c4', '49656B23-A371-4F3D-9DD4-4824B97AAED3', 4, 'Verified', 'Verified', 'Check', GETUTCDATE(), GETUTCDATE());

/* SQL text to update ValueListType for entity field ID 49656B23-A371-4F3D-9DD4-4824B97AAED3 */
UPDATE [${flyway:defaultSchema}].[EntityField] SET ValueListType='List' WHERE ID='49656B23-A371-4F3D-9DD4-4824B97AAED3';

/* SQL text to sync 4 entity field value row(s) for entity field ID E3F0C72B-1636-4946-95C9-DAA745BAB823 */
INSERT INTO [${flyway:defaultSchema}].[EntityFieldValue]
                                       ([ID], [EntityFieldID], [Sequence], [Value], [Code], [Source], [__mj_CreatedAt], [__mj_UpdatedAt])
                                    VALUES
                                       ('9d326d31-28ad-40d7-b190-46588e229477', 'E3F0C72B-1636-4946-95C9-DAA745BAB823', 1, 'Available', 'Available', 'Check', GETUTCDATE(), GETUTCDATE());
INSERT INTO [${flyway:defaultSchema}].[EntityFieldValue]
                                       ([ID], [EntityFieldID], [Sequence], [Value], [Code], [Source], [__mj_CreatedAt], [__mj_UpdatedAt])
                                    VALUES
                                       ('fd991b56-bf18-4023-bf69-55772013ccf9', 'E3F0C72B-1636-4946-95C9-DAA745BAB823', 2, 'Limited', 'Limited', 'Check', GETUTCDATE(), GETUTCDATE());
INSERT INTO [${flyway:defaultSchema}].[EntityFieldValue]
                                       ([ID], [EntityFieldID], [Sequence], [Value], [Code], [Source], [__mj_CreatedAt], [__mj_UpdatedAt])
                                    VALUES
                                       ('a19c9dbb-b494-4d38-b33b-a8fab4204eba', 'E3F0C72B-1636-4946-95C9-DAA745BAB823', 3, 'OnLeave', 'OnLeave', 'Check', GETUTCDATE(), GETUTCDATE());
INSERT INTO [${flyway:defaultSchema}].[EntityFieldValue]
                                       ([ID], [EntityFieldID], [Sequence], [Value], [Code], [Source], [__mj_CreatedAt], [__mj_UpdatedAt])
                                    VALUES
                                       ('ac6ba8d5-9ddb-44bc-8374-6090a6345bdb', 'E3F0C72B-1636-4946-95C9-DAA745BAB823', 4, 'Unavailable', 'Unavailable', 'Check', GETUTCDATE(), GETUTCDATE());

/* SQL text to update ValueListType for entity field ID E3F0C72B-1636-4946-95C9-DAA745BAB823 */
UPDATE [${flyway:defaultSchema}].[EntityField] SET ValueListType='List' WHERE ID='E3F0C72B-1636-4946-95C9-DAA745BAB823';

/* SQL text to sync 3 entity field value row(s) for entity field ID 14680F63-D6D6-4231-B16D-DAE9CF2295BF */
INSERT INTO [${flyway:defaultSchema}].[EntityFieldValue]
                                       ([ID], [EntityFieldID], [Sequence], [Value], [Code], [Source], [__mj_CreatedAt], [__mj_UpdatedAt])
                                    VALUES
                                       ('13970ca4-3c05-4dcb-bfa9-0faa19308243', '14680F63-D6D6-4231-B16D-DAE9CF2295BF', 1, 'Emerging', 'Emerging', 'Check', GETUTCDATE(), GETUTCDATE());
INSERT INTO [${flyway:defaultSchema}].[EntityFieldValue]
                                       ([ID], [EntityFieldID], [Sequence], [Value], [Code], [Source], [__mj_CreatedAt], [__mj_UpdatedAt])
                                    VALUES
                                       ('45acbc19-f6f8-4e2a-b15d-90d10e9e8418', '14680F63-D6D6-4231-B16D-DAE9CF2295BF', 2, 'Primary', 'Primary', 'Check', GETUTCDATE(), GETUTCDATE());
INSERT INTO [${flyway:defaultSchema}].[EntityFieldValue]
                                       ([ID], [EntityFieldID], [Sequence], [Value], [Code], [Source], [__mj_CreatedAt], [__mj_UpdatedAt])
                                    VALUES
                                       ('170adf64-6de1-4b36-8429-1be8f3010e20', '14680F63-D6D6-4231-B16D-DAE9CF2295BF', 3, 'Standard', 'Standard', 'Check', GETUTCDATE(), GETUTCDATE());

/* SQL text to update ValueListType for entity field ID 14680F63-D6D6-4231-B16D-DAE9CF2295BF */
UPDATE [${flyway:defaultSchema}].[EntityField] SET ValueListType='List' WHERE ID='14680F63-D6D6-4231-B16D-DAE9CF2295BF';

/* SQL text to sync 4 entity field value row(s) for entity field ID 0F8A546A-44CD-451C-A8EA-B079FADADE8A */
INSERT INTO [${flyway:defaultSchema}].[EntityFieldValue]
                                       ([ID], [EntityFieldID], [Sequence], [Value], [Code], [Source], [__mj_CreatedAt], [__mj_UpdatedAt])
                                    VALUES
                                       ('7c1a5f52-8b05-4abd-b1f3-fa1d7ea2ce92', '0F8A546A-44CD-451C-A8EA-B079FADADE8A', 1, 'GoodStanding', 'GoodStanding', 'Check', GETUTCDATE(), GETUTCDATE());
INSERT INTO [${flyway:defaultSchema}].[EntityFieldValue]
                                       ([ID], [EntityFieldID], [Sequence], [Value], [Code], [Source], [__mj_CreatedAt], [__mj_UpdatedAt])
                                    VALUES
                                       ('6b5c99ef-5942-4bf0-b753-a111188aeb6c', '0F8A546A-44CD-451C-A8EA-B079FADADE8A', 2, 'Inactive', 'Inactive', 'Check', GETUTCDATE(), GETUTCDATE());
INSERT INTO [${flyway:defaultSchema}].[EntityFieldValue]
                                       ([ID], [EntityFieldID], [Sequence], [Value], [Code], [Source], [__mj_CreatedAt], [__mj_UpdatedAt])
                                    VALUES
                                       ('bb3509d0-c748-4ca8-947d-116d44dfbbfc', '0F8A546A-44CD-451C-A8EA-B079FADADE8A', 3, 'ProHacVice', 'ProHacVice', 'Check', GETUTCDATE(), GETUTCDATE());
INSERT INTO [${flyway:defaultSchema}].[EntityFieldValue]
                                       ([ID], [EntityFieldID], [Sequence], [Value], [Code], [Source], [__mj_CreatedAt], [__mj_UpdatedAt])
                                    VALUES
                                       ('6b1f7dcd-5361-4822-8d5a-bef0da60cf22', '0F8A546A-44CD-451C-A8EA-B079FADADE8A', 4, 'Suspended', 'Suspended', 'Check', GETUTCDATE(), GETUTCDATE());

/* SQL text to update ValueListType for entity field ID 0F8A546A-44CD-451C-A8EA-B079FADADE8A */
UPDATE [${flyway:defaultSchema}].[EntityField] SET ValueListType='List' WHERE ID='0F8A546A-44CD-451C-A8EA-B079FADADE8A';

/* SQL text to sync 4 entity field value row(s) for entity field ID 92A1176F-7429-4DEB-9AD7-C20775854C9E */
INSERT INTO [${flyway:defaultSchema}].[EntityFieldValue]
                                       ([ID], [EntityFieldID], [Sequence], [Value], [Code], [Source], [__mj_CreatedAt], [__mj_UpdatedAt])
                                    VALUES
                                       ('05e1ffc8-da36-43d0-ada1-1c75a30ca5fc', '92A1176F-7429-4DEB-9AD7-C20775854C9E', 1, 'High', 'High', 'Check', GETUTCDATE(), GETUTCDATE());
INSERT INTO [${flyway:defaultSchema}].[EntityFieldValue]
                                       ([ID], [EntityFieldID], [Sequence], [Value], [Code], [Source], [__mj_CreatedAt], [__mj_UpdatedAt])
                                    VALUES
                                       ('b36bbf1e-f627-4445-8800-7b0cd3325a80', '92A1176F-7429-4DEB-9AD7-C20775854C9E', 2, 'Low', 'Low', 'Check', GETUTCDATE(), GETUTCDATE());
INSERT INTO [${flyway:defaultSchema}].[EntityFieldValue]
                                       ([ID], [EntityFieldID], [Sequence], [Value], [Code], [Source], [__mj_CreatedAt], [__mj_UpdatedAt])
                                    VALUES
                                       ('7f046189-4a2d-4348-a166-357aec5a47a3', '92A1176F-7429-4DEB-9AD7-C20775854C9E', 3, 'Standard', 'Standard', 'Check', GETUTCDATE(), GETUTCDATE());
INSERT INTO [${flyway:defaultSchema}].[EntityFieldValue]
                                       ([ID], [EntityFieldID], [Sequence], [Value], [Code], [Source], [__mj_CreatedAt], [__mj_UpdatedAt])
                                    VALUES
                                       ('1de43b13-5c99-43b6-b033-1cbabc3faf4f', '92A1176F-7429-4DEB-9AD7-C20775854C9E', 4, 'Urgent', 'Urgent', 'Check', GETUTCDATE(), GETUTCDATE());

/* SQL text to update ValueListType for entity field ID 92A1176F-7429-4DEB-9AD7-C20775854C9E */
UPDATE [${flyway:defaultSchema}].[EntityField] SET ValueListType='List' WHERE ID='92A1176F-7429-4DEB-9AD7-C20775854C9E';

/* SQL text to sync 9 entity field value row(s) for entity field ID FCB14234-4787-41DB-99DE-EE9E71D44A13 */
INSERT INTO [${flyway:defaultSchema}].[EntityFieldValue]
                                       ([ID], [EntityFieldID], [Sequence], [Value], [Code], [Source], [__mj_CreatedAt], [__mj_UpdatedAt])
                                    VALUES
                                       ('e6c01007-ba41-48a8-a4fa-40e61e7cf3e0', 'FCB14234-4787-41DB-99DE-EE9E71D44A13', 1, 'Accepted', 'Accepted', 'Check', GETUTCDATE(), GETUTCDATE());
INSERT INTO [${flyway:defaultSchema}].[EntityFieldValue]
                                       ([ID], [EntityFieldID], [Sequence], [Value], [Code], [Source], [__mj_CreatedAt], [__mj_UpdatedAt])
                                    VALUES
                                       ('9a31c83f-7815-4429-9fbe-4e37cbbbaf2f', 'FCB14234-4787-41DB-99DE-EE9E71D44A13', 2, 'Cancelled', 'Cancelled', 'Check', GETUTCDATE(), GETUTCDATE());
INSERT INTO [${flyway:defaultSchema}].[EntityFieldValue]
                                       ([ID], [EntityFieldID], [Sequence], [Value], [Code], [Source], [__mj_CreatedAt], [__mj_UpdatedAt])
                                    VALUES
                                       ('93ec6944-d383-4061-a305-bbedaafaeb2c', 'FCB14234-4787-41DB-99DE-EE9E71D44A13', 3, 'Completed', 'Completed', 'Check', GETUTCDATE(), GETUTCDATE());
INSERT INTO [${flyway:defaultSchema}].[EntityFieldValue]
                                       ([ID], [EntityFieldID], [Sequence], [Value], [Code], [Source], [__mj_CreatedAt], [__mj_UpdatedAt])
                                    VALUES
                                       ('d0b57024-9143-4ee9-940a-6a52758b5f7d', 'FCB14234-4787-41DB-99DE-EE9E71D44A13', 4, 'Draft', 'Draft', 'Check', GETUTCDATE(), GETUTCDATE());
INSERT INTO [${flyway:defaultSchema}].[EntityFieldValue]
                                       ([ID], [EntityFieldID], [Sequence], [Value], [Code], [Source], [__mj_CreatedAt], [__mj_UpdatedAt])
                                    VALUES
                                       ('ac288e99-e97b-4bde-afed-e6627422b7d8', 'FCB14234-4787-41DB-99DE-EE9E71D44A13', 5, 'Exhausted', 'Exhausted', 'Check', GETUTCDATE(), GETUTCDATE());
INSERT INTO [${flyway:defaultSchema}].[EntityFieldValue]
                                       ([ID], [EntityFieldID], [Sequence], [Value], [Code], [Source], [__mj_CreatedAt], [__mj_UpdatedAt])
                                    VALUES
                                       ('1f944208-88aa-4cdd-bf67-64049a96f344', 'FCB14234-4787-41DB-99DE-EE9E71D44A13', 6, 'InProgress', 'InProgress', 'Check', GETUTCDATE(), GETUTCDATE());
INSERT INTO [${flyway:defaultSchema}].[EntityFieldValue]
                                       ([ID], [EntityFieldID], [Sequence], [Value], [Code], [Source], [__mj_CreatedAt], [__mj_UpdatedAt])
                                    VALUES
                                       ('c96ee66e-1d89-4343-b94c-fc80e02a7845', 'FCB14234-4787-41DB-99DE-EE9E71D44A13', 7, 'Matching', 'Matching', 'Check', GETUTCDATE(), GETUTCDATE());
INSERT INTO [${flyway:defaultSchema}].[EntityFieldValue]
                                       ([ID], [EntityFieldID], [Sequence], [Value], [Code], [Source], [__mj_CreatedAt], [__mj_UpdatedAt])
                                    VALUES
                                       ('df15d438-b1ec-484c-b8bd-5de747a10804', 'FCB14234-4787-41DB-99DE-EE9E71D44A13', 8, 'Routed', 'Routed', 'Check', GETUTCDATE(), GETUTCDATE());
INSERT INTO [${flyway:defaultSchema}].[EntityFieldValue]
                                       ([ID], [EntityFieldID], [Sequence], [Value], [Code], [Source], [__mj_CreatedAt], [__mj_UpdatedAt])
                                    VALUES
                                       ('f3512f67-02ac-4b08-9616-1a0b0f246937', 'FCB14234-4787-41DB-99DE-EE9E71D44A13', 9, 'Submitted', 'Submitted', 'Check', GETUTCDATE(), GETUTCDATE());

/* SQL text to update ValueListType for entity field ID FCB14234-4787-41DB-99DE-EE9E71D44A13 */
UPDATE [${flyway:defaultSchema}].[EntityField] SET ValueListType='List' WHERE ID='FCB14234-4787-41DB-99DE-EE9E71D44A13';

/* SQL text to sync 5 entity field value row(s) for entity field ID F236D4A8-FDCB-439F-9238-99FA20F9312F */
INSERT INTO [${flyway:defaultSchema}].[EntityFieldValue]
                                       ([ID], [EntityFieldID], [Sequence], [Value], [Code], [Source], [__mj_CreatedAt], [__mj_UpdatedAt])
                                    VALUES
                                       ('3624e17b-a222-4a5b-a985-4c9ec2b0c8d5', 'F236D4A8-FDCB-439F-9238-99FA20F9312F', 1, 'Adverse', 'Adverse', 'Check', GETUTCDATE(), GETUTCDATE());
INSERT INTO [${flyway:defaultSchema}].[EntityFieldValue]
                                       ([ID], [EntityFieldID], [Sequence], [Value], [Code], [Source], [__mj_CreatedAt], [__mj_UpdatedAt])
                                    VALUES
                                       ('fc7b63cc-5509-475c-b02e-e377bf1c791d', 'F236D4A8-FDCB-439F-9238-99FA20F9312F', 2, 'Client', 'Client', 'Check', GETUTCDATE(), GETUTCDATE());
INSERT INTO [${flyway:defaultSchema}].[EntityFieldValue]
                                       ([ID], [EntityFieldID], [Sequence], [Value], [Code], [Source], [__mj_CreatedAt], [__mj_UpdatedAt])
                                    VALUES
                                       ('716ffd9c-ad9a-4336-ba72-4b72fd82961d', 'F236D4A8-FDCB-439F-9238-99FA20F9312F', 3, 'CoParty', 'CoParty', 'Check', GETUTCDATE(), GETUTCDATE());
INSERT INTO [${flyway:defaultSchema}].[EntityFieldValue]
                                       ([ID], [EntityFieldID], [Sequence], [Value], [Code], [Source], [__mj_CreatedAt], [__mj_UpdatedAt])
                                    VALUES
                                       ('fe2458a8-46ce-4f85-8c37-e067507a2360', 'F236D4A8-FDCB-439F-9238-99FA20F9312F', 4, 'RelatedEntity', 'RelatedEntity', 'Check', GETUTCDATE(), GETUTCDATE());
INSERT INTO [${flyway:defaultSchema}].[EntityFieldValue]
                                       ([ID], [EntityFieldID], [Sequence], [Value], [Code], [Source], [__mj_CreatedAt], [__mj_UpdatedAt])
                                    VALUES
                                       ('e766519b-9106-4bf9-9d71-dd53fbad44b5', 'F236D4A8-FDCB-439F-9238-99FA20F9312F', 5, 'Witness', 'Witness', 'Check', GETUTCDATE(), GETUTCDATE());

/* SQL text to update ValueListType for entity field ID F236D4A8-FDCB-439F-9238-99FA20F9312F */
UPDATE [${flyway:defaultSchema}].[EntityField] SET ValueListType='List' WHERE ID='F236D4A8-FDCB-439F-9238-99FA20F9312F';

/* SQL text to sync 4 entity field value row(s) for entity field ID AFC53643-7573-45BA-8AD1-428F322998DD */
INSERT INTO [${flyway:defaultSchema}].[EntityFieldValue]
                                       ([ID], [EntityFieldID], [Sequence], [Value], [Code], [Source], [__mj_CreatedAt], [__mj_UpdatedAt])
                                    VALUES
                                       ('32bbfef0-c5bc-4688-8e60-bba32e758602', 'AFC53643-7573-45BA-8AD1-428F322998DD', 1, 'Cleared', 'Cleared', 'Check', GETUTCDATE(), GETUTCDATE());
INSERT INTO [${flyway:defaultSchema}].[EntityFieldValue]
                                       ([ID], [EntityFieldID], [Sequence], [Value], [Code], [Source], [__mj_CreatedAt], [__mj_UpdatedAt])
                                    VALUES
                                       ('88adaf77-f5ed-42c5-97d1-be361a6d1d4d', 'AFC53643-7573-45BA-8AD1-428F322998DD', 2, 'ConflictFound', 'ConflictFound', 'Check', GETUTCDATE(), GETUTCDATE());
INSERT INTO [${flyway:defaultSchema}].[EntityFieldValue]
                                       ([ID], [EntityFieldID], [Sequence], [Value], [Code], [Source], [__mj_CreatedAt], [__mj_UpdatedAt])
                                    VALUES
                                       ('74f07b7b-6db6-4fe4-ab7d-334506e033b1', 'AFC53643-7573-45BA-8AD1-428F322998DD', 3, 'Pending', 'Pending', 'Check', GETUTCDATE(), GETUTCDATE());
INSERT INTO [${flyway:defaultSchema}].[EntityFieldValue]
                                       ([ID], [EntityFieldID], [Sequence], [Value], [Code], [Source], [__mj_CreatedAt], [__mj_UpdatedAt])
                                    VALUES
                                       ('0c987d0f-fcc4-4006-ad1e-ab0f6e123e78', 'AFC53643-7573-45BA-8AD1-428F322998DD', 4, 'Waived', 'Waived', 'Check', GETUTCDATE(), GETUTCDATE());

/* SQL text to update ValueListType for entity field ID AFC53643-7573-45BA-8AD1-428F322998DD */
UPDATE [${flyway:defaultSchema}].[EntityField] SET ValueListType='List' WHERE ID='AFC53643-7573-45BA-8AD1-428F322998DD';

/* SQL text to sync 7 entity field value row(s) for entity field ID 39FA22AE-02FA-4C9A-8592-95C9D1ADF13F */
INSERT INTO [${flyway:defaultSchema}].[EntityFieldValue]
                                       ([ID], [EntityFieldID], [Sequence], [Value], [Code], [Source], [__mj_CreatedAt], [__mj_UpdatedAt])
                                    VALUES
                                       ('51ff88f7-5f36-47fb-9e85-4dbced2c67e0', '39FA22AE-02FA-4C9A-8592-95C9D1ADF13F', 1, 'Accepted', 'Accepted', 'Check', GETUTCDATE(), GETUTCDATE());
INSERT INTO [${flyway:defaultSchema}].[EntityFieldValue]
                                       ([ID], [EntityFieldID], [Sequence], [Value], [Code], [Source], [__mj_CreatedAt], [__mj_UpdatedAt])
                                    VALUES
                                       ('96352d48-f2e2-4d73-9fde-d47395fd4990', '39FA22AE-02FA-4C9A-8592-95C9D1ADF13F', 2, 'ConflictRejected', 'ConflictRejected', 'Check', GETUTCDATE(), GETUTCDATE());
INSERT INTO [${flyway:defaultSchema}].[EntityFieldValue]
                                       ([ID], [EntityFieldID], [Sequence], [Value], [Code], [Source], [__mj_CreatedAt], [__mj_UpdatedAt])
                                    VALUES
                                       ('6ea8fafa-2ca6-4495-8d61-a126752d92ae', '39FA22AE-02FA-4C9A-8592-95C9D1ADF13F', 3, 'Declined', 'Declined', 'Check', GETUTCDATE(), GETUTCDATE());
INSERT INTO [${flyway:defaultSchema}].[EntityFieldValue]
                                       ([ID], [EntityFieldID], [Sequence], [Value], [Code], [Source], [__mj_CreatedAt], [__mj_UpdatedAt])
                                    VALUES
                                       ('b99da870-afd8-4d11-adbf-3e45e5f71c97', '39FA22AE-02FA-4C9A-8592-95C9D1ADF13F', 4, 'Expired', 'Expired', 'Check', GETUTCDATE(), GETUTCDATE());
INSERT INTO [${flyway:defaultSchema}].[EntityFieldValue]
                                       ([ID], [EntityFieldID], [Sequence], [Value], [Code], [Source], [__mj_CreatedAt], [__mj_UpdatedAt])
                                    VALUES
                                       ('542fe463-55f4-4289-a7dc-557cb4b3016e', '39FA22AE-02FA-4C9A-8592-95C9D1ADF13F', 5, 'Offered', 'Offered', 'Check', GETUTCDATE(), GETUTCDATE());
INSERT INTO [${flyway:defaultSchema}].[EntityFieldValue]
                                       ([ID], [EntityFieldID], [Sequence], [Value], [Code], [Source], [__mj_CreatedAt], [__mj_UpdatedAt])
                                    VALUES
                                       ('162c4a77-5744-4583-8702-2ad902601b9c', '39FA22AE-02FA-4C9A-8592-95C9D1ADF13F', 6, 'Queued', 'Queued', 'Check', GETUTCDATE(), GETUTCDATE());
INSERT INTO [${flyway:defaultSchema}].[EntityFieldValue]
                                       ([ID], [EntityFieldID], [Sequence], [Value], [Code], [Source], [__mj_CreatedAt], [__mj_UpdatedAt])
                                    VALUES
                                       ('f701eb72-0d6e-4810-98dd-c74316f5dc8a', '39FA22AE-02FA-4C9A-8592-95C9D1ADF13F', 7, 'Withdrawn', 'Withdrawn', 'Check', GETUTCDATE(), GETUTCDATE());

/* SQL text to update ValueListType for entity field ID 39FA22AE-02FA-4C9A-8592-95C9D1ADF13F */
UPDATE [${flyway:defaultSchema}].[EntityField] SET ValueListType='List' WHERE ID='39FA22AE-02FA-4C9A-8592-95C9D1ADF13F';

/* SQL text to sync 3 entity field value row(s) for entity field ID 82D17590-EF85-4425-A922-1FACCB060A74 */
INSERT INTO [${flyway:defaultSchema}].[EntityFieldValue]
                                       ([ID], [EntityFieldID], [Sequence], [Value], [Code], [Source], [__mj_CreatedAt], [__mj_UpdatedAt])
                                    VALUES
                                       ('91affebf-5c74-47f9-bb0a-5ac070509469', '82D17590-EF85-4425-A922-1FACCB060A74', 1, 'Operator', 'Operator', 'Check', GETUTCDATE(), GETUTCDATE());
INSERT INTO [${flyway:defaultSchema}].[EntityFieldValue]
                                       ([ID], [EntityFieldID], [Sequence], [Value], [Code], [Source], [__mj_CreatedAt], [__mj_UpdatedAt])
                                    VALUES
                                       ('725f5746-6faf-46eb-beca-61b0d542b3a3', '82D17590-EF85-4425-A922-1FACCB060A74', 2, 'Professional', 'Professional', 'Check', GETUTCDATE(), GETUTCDATE());
INSERT INTO [${flyway:defaultSchema}].[EntityFieldValue]
                                       ([ID], [EntityFieldID], [Sequence], [Value], [Code], [Source], [__mj_CreatedAt], [__mj_UpdatedAt])
                                    VALUES
                                       ('7f7c76a9-b9f9-4637-a642-c6ee6cc0e62c', '82D17590-EF85-4425-A922-1FACCB060A74', 3, 'Seeker', 'Seeker', 'Check', GETUTCDATE(), GETUTCDATE());

/* SQL text to update ValueListType for entity field ID 82D17590-EF85-4425-A922-1FACCB060A74 */
UPDATE [${flyway:defaultSchema}].[EntityField] SET ValueListType='List' WHERE ID='82D17590-EF85-4425-A922-1FACCB060A74';

/* SQL text to sync 5 entity field value row(s) for entity field ID CC98A578-C55A-4935-9FF2-425AF0927A86 */
INSERT INTO [${flyway:defaultSchema}].[EntityFieldValue]
                                       ([ID], [EntityFieldID], [Sequence], [Value], [Code], [Source], [__mj_CreatedAt], [__mj_UpdatedAt])
                                    VALUES
                                       ('25dac4e0-6289-44b3-a998-946f17242c50', 'CC98A578-C55A-4935-9FF2-425AF0927A86', 1, 'ConsultedOnly', 'ConsultedOnly', 'Check', GETUTCDATE(), GETUTCDATE());
INSERT INTO [${flyway:defaultSchema}].[EntityFieldValue]
                                       ([ID], [EntityFieldID], [Sequence], [Value], [Code], [Source], [__mj_CreatedAt], [__mj_UpdatedAt])
                                    VALUES
                                       ('708b9b10-ba80-49c1-a51d-53bec9d7c871', 'CC98A578-C55A-4935-9FF2-425AF0927A86', 2, 'Engaged', 'Engaged', 'Check', GETUTCDATE(), GETUTCDATE());
INSERT INTO [${flyway:defaultSchema}].[EntityFieldValue]
                                       ([ID], [EntityFieldID], [Sequence], [Value], [Code], [Source], [__mj_CreatedAt], [__mj_UpdatedAt])
                                    VALUES
                                       ('3af2cd76-9bec-41cb-9853-dc7c1726a45e', 'CC98A578-C55A-4935-9FF2-425AF0927A86', 3, 'NoResponse', 'NoResponse', 'Check', GETUTCDATE(), GETUTCDATE());
INSERT INTO [${flyway:defaultSchema}].[EntityFieldValue]
                                       ([ID], [EntityFieldID], [Sequence], [Value], [Code], [Source], [__mj_CreatedAt], [__mj_UpdatedAt])
                                    VALUES
                                       ('ee110a6a-05b7-448a-b092-d6e4144ccb5f', 'CC98A578-C55A-4935-9FF2-425AF0927A86', 4, 'NotAFit', 'NotAFit', 'Check', GETUTCDATE(), GETUTCDATE());
INSERT INTO [${flyway:defaultSchema}].[EntityFieldValue]
                                       ([ID], [EntityFieldID], [Sequence], [Value], [Code], [Source], [__mj_CreatedAt], [__mj_UpdatedAt])
                                    VALUES
                                       ('22a4c1ab-d9dd-45e4-acab-5960c9e4c976', 'CC98A578-C55A-4935-9FF2-425AF0927A86', 5, 'Resolved', 'Resolved', 'Check', GETUTCDATE(), GETUTCDATE());

/* SQL text to update ValueListType for entity field ID CC98A578-C55A-4935-9FF2-425AF0927A86 */
UPDATE [${flyway:defaultSchema}].[EntityField] SET ValueListType='List' WHERE ID='CC98A578-C55A-4935-9FF2-425AF0927A86';

/* Deterministic search-flag hygiene — seed name fields */

         UPDATE [${flyway:defaultSchema}].[EntityField]
         SET [IncludeInUserSearchAPI] = 1,
             [UserSearchPredicateAPI] = 'BeginsWith'
         WHERE [ID] IN (
            SELECT ranked.[ID] FROM (
               SELECT f.[ID],
                      ROW_NUMBER() OVER (
                         PARTITION BY f.[EntityID]
                         ORDER BY f.[Sequence], f.[Name]
                      ) AS rn
               FROM [${flyway:defaultSchema}].[EntityField] f
               INNER JOIN [${flyway:defaultSchema}].[Entity] e ON e.[ID] = f.[EntityID]
               WHERE LOWER(f.[Name]) IN ('name','title','firstname','lastname','middlename','displayname','fullname','label')
                 AND f.[AutoUpdateIncludeInUserSearchAPI] = 1
                 AND f.[IncludeInUserSearchAPI] = 0
                 AND ISNULL(f.[IsPrimaryKey], 0) = 0
                 AND ISNULL(f.[IsVirtual], 0) = 0
                 AND LOWER(f.[Type]) IN ('nvarchar','varchar','char','nchar')
                 AND ISNULL(f.[Length], 0) <> -1
                 AND e.[VirtualEntity] = 0
                 AND e.[AllowUserSearchAPI] = 1
                 AND ISNULL(e.[FullTextSearchEnabled], 0) = 0
                 AND NOT ((e.[Name] = 'Logs' OR e.[Name] LIKE '% Logs') OR (e.[Name] = 'Log' OR e.[Name] LIKE '% Log') OR (e.[Name] = 'Runs' OR e.[Name] LIKE '% Runs') OR (e.[Name] = 'Run' OR e.[Name] LIKE '% Run') OR (e.[Name] = 'Run History' OR e.[Name] LIKE '% Run History') OR (e.[Name] = 'Run Steps' OR e.[Name] LIKE '% Run Steps') OR (e.[Name] = 'Run Messages' OR e.[Name] LIKE '% Run Messages') OR (e.[Name] = 'Execution Logs' OR e.[Name] LIKE '% Execution Logs') OR (e.[Name] = 'Details' OR e.[Name] LIKE '% Details') OR (e.[Name] = 'Detail' OR e.[Name] LIKE '% Detail') OR (e.[Name] = 'Lines' OR e.[Name] LIKE '% Lines') OR (e.[Name] = 'Line' OR e.[Name] LIKE '% Line') OR (e.[Name] = 'Items' OR e.[Name] LIKE '% Items') OR (e.[Name] = 'Item' OR e.[Name] LIKE '% Item') OR (e.[Name] = 'Steps' OR e.[Name] LIKE '% Steps') OR (e.[Name] = 'Step' OR e.[Name] LIKE '% Step') OR (e.[Name] = 'Params' OR e.[Name] LIKE '% Params') OR (e.[Name] = 'Param' OR e.[Name] LIKE '% Param') OR (e.[Name] = 'Mappings' OR e.[Name] LIKE '% Mappings') OR (e.[Name] = 'Mapping' OR e.[Name] LIKE '% Mapping') OR (e.[Name] = 'Audit' OR e.[Name] LIKE 'Audit %' OR e.[Name] LIKE '% Audit' OR e.[Name] LIKE '% Audit %') OR (e.[Name] = 'Record Change' OR e.[Name] LIKE 'Record Change %' OR e.[Name] LIKE '% Record Change' OR e.[Name] LIKE '% Record Change %'))
                 AND e.[SchemaName] NOT IN ('${flyway:defaultSchema}','${flyway:defaultSchema}','__mj_BizAppsCommon','__mj_BizAppsPlanning','__mj_BizAppsSoftwareFactory','__mj_BizAppsTasks','__mj_BizAppsTasksGitHub','sys')
                 AND NOT EXISTS (
               SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] f2
               WHERE f2.[EntityID] = e.[ID]
                 AND f2.[IncludeInUserSearchAPI] = 1
            )
            ) ranked
            WHERE ranked.rn <= 3
         );

/* Deterministic search-flag hygiene — clear AllowUserSearchAPI */

         UPDATE [${flyway:defaultSchema}].[Entity]
         SET [AllowUserSearchAPI] = 0
         WHERE [ID] IN (
            SELECT e.[ID]
            FROM [${flyway:defaultSchema}].[Entity] e
            WHERE e.[AllowUserSearchAPI] = 1
              AND e.[AutoUpdateAllowUserSearchAPI] = 1
              AND e.[VirtualEntity] = 0
              AND ISNULL(e.[FullTextSearchEnabled], 0) = 0
              AND e.[SchemaName] NOT IN ('${flyway:defaultSchema}','${flyway:defaultSchema}','__mj_BizAppsCommon','__mj_BizAppsPlanning','__mj_BizAppsSoftwareFactory','__mj_BizAppsTasks','__mj_BizAppsTasksGitHub','sys')
              AND NOT EXISTS (
               SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] f2
               WHERE f2.[EntityID] = e.[ID]
                 AND f2.[IncludeInUserSearchAPI] = 1
            )
         );


/* Create Entity Relationship: MJ_BizApps_Referrals: Professional Profiles -> MJ_BizApps_Referrals: Referral Feedbacks (One To Many via ProfessionalProfileID) */
   IF NOT EXISTS (
      SELECT 1 FROM [${flyway:defaultSchema}].[EntityRelationship] WHERE [ID] = 'd644c145-66e5-481f-b74b-10416da9cdde' OR ([EntityID] = '7492A921-FFCF-4A3E-B59A-56C88D16DDE1' AND [RelatedEntityID] = '21B34F7D-822B-4BA5-985C-52215D3DDB9D' AND [RelatedEntityJoinField] = 'ProfessionalProfileID')
   )
   BEGIN
      INSERT INTO [${flyway:defaultSchema}].[EntityRelationship] ([ID], [EntityID], [RelatedEntityID], [RelatedEntityJoinField], [Type], [BundleInAPI], [DisplayInForm], [Sequence], [__mj_CreatedAt], [__mj_UpdatedAt])
                    VALUES ('d644c145-66e5-481f-b74b-10416da9cdde', '7492A921-FFCF-4A3E-B59A-56C88D16DDE1', '21B34F7D-822B-4BA5-985C-52215D3DDB9D', 'ProfessionalProfileID', 'One To Many', 1, 1, 1, GETUTCDATE(), GETUTCDATE())
   END;
                    
/* Create Entity Relationship: MJ_BizApps_Referrals: Professional Profiles -> MJ_BizApps_Referrals: Professional Jurisdictions (One To Many via ProfessionalProfileID) */
   IF NOT EXISTS (
      SELECT 1 FROM [${flyway:defaultSchema}].[EntityRelationship] WHERE [ID] = '6f861eea-c792-4e0e-92f0-15e8ed93f9f8' OR ([EntityID] = '7492A921-FFCF-4A3E-B59A-56C88D16DDE1' AND [RelatedEntityID] = '9210D51B-1131-4C40-80DF-62DC5799AFFB' AND [RelatedEntityJoinField] = 'ProfessionalProfileID')
   )
   BEGIN
      INSERT INTO [${flyway:defaultSchema}].[EntityRelationship] ([ID], [EntityID], [RelatedEntityID], [RelatedEntityJoinField], [Type], [BundleInAPI], [DisplayInForm], [Sequence], [__mj_CreatedAt], [__mj_UpdatedAt])
                    VALUES ('6f861eea-c792-4e0e-92f0-15e8ed93f9f8', '7492A921-FFCF-4A3E-B59A-56C88D16DDE1', '9210D51B-1131-4C40-80DF-62DC5799AFFB', 'ProfessionalProfileID', 'One To Many', 1, 1, 2, GETUTCDATE(), GETUTCDATE())
   END;
                    
/* Create Entity Relationship: MJ_BizApps_Referrals: Professional Profiles -> MJ_BizApps_Referrals: Professional Practice Areas (One To Many via ProfessionalProfileID) */
   IF NOT EXISTS (
      SELECT 1 FROM [${flyway:defaultSchema}].[EntityRelationship] WHERE [ID] = 'a84bea20-75c9-4c46-9b95-eada4858fb6d' OR ([EntityID] = '7492A921-FFCF-4A3E-B59A-56C88D16DDE1' AND [RelatedEntityID] = 'FBE2E751-72F9-4136-9B77-755C1D192185' AND [RelatedEntityJoinField] = 'ProfessionalProfileID')
   )
   BEGIN
      INSERT INTO [${flyway:defaultSchema}].[EntityRelationship] ([ID], [EntityID], [RelatedEntityID], [RelatedEntityJoinField], [Type], [BundleInAPI], [DisplayInForm], [Sequence], [__mj_CreatedAt], [__mj_UpdatedAt])
                    VALUES ('a84bea20-75c9-4c46-9b95-eada4858fb6d', '7492A921-FFCF-4A3E-B59A-56C88D16DDE1', 'FBE2E751-72F9-4136-9B77-755C1D192185', 'ProfessionalProfileID', 'One To Many', 1, 1, 3, GETUTCDATE(), GETUTCDATE())
   END;
                    
/* Create Entity Relationship: MJ_BizApps_Referrals: Professional Profiles -> MJ_BizApps_Referrals: Referral Assignments (One To Many via ProfessionalProfileID) */
   IF NOT EXISTS (
      SELECT 1 FROM [${flyway:defaultSchema}].[EntityRelationship] WHERE [ID] = '3c420e4e-ed6d-450e-bdf8-e9058a6bd51b' OR ([EntityID] = '7492A921-FFCF-4A3E-B59A-56C88D16DDE1' AND [RelatedEntityID] = '7EB379C8-6C97-4640-B0AA-94F0874F4182' AND [RelatedEntityJoinField] = 'ProfessionalProfileID')
   )
   BEGIN
      INSERT INTO [${flyway:defaultSchema}].[EntityRelationship] ([ID], [EntityID], [RelatedEntityID], [RelatedEntityJoinField], [Type], [BundleInAPI], [DisplayInForm], [Sequence], [__mj_CreatedAt], [__mj_UpdatedAt])
                    VALUES ('3c420e4e-ed6d-450e-bdf8-e9058a6bd51b', '7492A921-FFCF-4A3E-B59A-56C88D16DDE1', '7EB379C8-6C97-4640-B0AA-94F0874F4182', 'ProfessionalProfileID', 'One To Many', 1, 1, 4, GETUTCDATE(), GETUTCDATE())
   END;
                    
/* Create Entity Relationship: MJ_BizApps_Referrals: Professional Profiles -> MJ_BizApps_Referrals: Referral Requests (One To Many via AssignedProfessionalID) */
   IF NOT EXISTS (
      SELECT 1 FROM [${flyway:defaultSchema}].[EntityRelationship] WHERE [ID] = '073e809b-9f5e-4ccd-9482-17c669377f6d' OR ([EntityID] = '7492A921-FFCF-4A3E-B59A-56C88D16DDE1' AND [RelatedEntityID] = 'C1CEBBE7-15E6-4134-B303-96F38D585F65' AND [RelatedEntityJoinField] = 'AssignedProfessionalID')
   )
   BEGIN
      INSERT INTO [${flyway:defaultSchema}].[EntityRelationship] ([ID], [EntityID], [RelatedEntityID], [RelatedEntityJoinField], [Type], [BundleInAPI], [DisplayInForm], [Sequence], [__mj_CreatedAt], [__mj_UpdatedAt])
                    VALUES ('073e809b-9f5e-4ccd-9482-17c669377f6d', '7492A921-FFCF-4A3E-B59A-56C88D16DDE1', 'C1CEBBE7-15E6-4134-B303-96F38D585F65', 'AssignedProfessionalID', 'One To Many', 1, 1, 5, GETUTCDATE(), GETUTCDATE())
   END;


/* Create Entity Relationship: MJ: Users -> MJ_BizApps_Referrals: Professional Profiles (One To Many via UserID) */
   IF NOT EXISTS (
      SELECT 1 FROM [${flyway:defaultSchema}].[EntityRelationship] WHERE [ID] = '3414c04b-ffe1-45de-b5b0-c289ac36e6b0' OR ([EntityID] = 'E1238F34-2837-EF11-86D4-6045BDEE16E6' AND [RelatedEntityID] = '7492A921-FFCF-4A3E-B59A-56C88D16DDE1' AND [RelatedEntityJoinField] = 'UserID')
   )
   BEGIN
      INSERT INTO [${flyway:defaultSchema}].[EntityRelationship] ([ID], [EntityID], [RelatedEntityID], [RelatedEntityJoinField], [Type], [BundleInAPI], [DisplayInForm], [Sequence], [__mj_CreatedAt], [__mj_UpdatedAt])
                    VALUES ('3414c04b-ffe1-45de-b5b0-c289ac36e6b0', 'E1238F34-2837-EF11-86D4-6045BDEE16E6', '7492A921-FFCF-4A3E-B59A-56C88D16DDE1', 'UserID', 'One To Many', 1, 1, 137, GETUTCDATE(), GETUTCDATE())
   END;
                    
/* Create Entity Relationship: MJ_BizApps_Common: Organizations -> MJ_BizApps_Referrals: Professional Profiles (One To Many via OrganizationID) */
   IF NOT EXISTS (
      SELECT 1 FROM [${flyway:defaultSchema}].[EntityRelationship] WHERE [ID] = '3a230792-52ca-4e4d-9568-4243f1188c47' OR ([EntityID] = 'C70448F9-9792-41D7-A82C-784B66429D54' AND [RelatedEntityID] = '7492A921-FFCF-4A3E-B59A-56C88D16DDE1' AND [RelatedEntityJoinField] = 'OrganizationID')
   )
   BEGIN
      INSERT INTO [${flyway:defaultSchema}].[EntityRelationship] ([ID], [EntityID], [RelatedEntityID], [RelatedEntityJoinField], [Type], [BundleInAPI], [DisplayInForm], [Sequence], [__mj_CreatedAt], [__mj_UpdatedAt])
                    VALUES ('3a230792-52ca-4e4d-9568-4243f1188c47', 'C70448F9-9792-41D7-A82C-784B66429D54', '7492A921-FFCF-4A3E-B59A-56C88D16DDE1', 'OrganizationID', 'One To Many', 1, 1, 8, GETUTCDATE(), GETUTCDATE())
   END;
                    
/* Create Entity Relationship: MJ_BizApps_Referrals: Practice Areas -> MJ_BizApps_Referrals: Professional Practice Areas (One To Many via PracticeAreaID) */
   IF NOT EXISTS (
      SELECT 1 FROM [${flyway:defaultSchema}].[EntityRelationship] WHERE [ID] = '574d4bdf-3e94-4f8f-9925-11119c2dc4b8' OR ([EntityID] = 'C6A1D082-6230-40DC-BA5C-7CEE7EA820AF' AND [RelatedEntityID] = 'FBE2E751-72F9-4136-9B77-755C1D192185' AND [RelatedEntityJoinField] = 'PracticeAreaID')
   )
   BEGIN
      INSERT INTO [${flyway:defaultSchema}].[EntityRelationship] ([ID], [EntityID], [RelatedEntityID], [RelatedEntityJoinField], [Type], [BundleInAPI], [DisplayInForm], [Sequence], [__mj_CreatedAt], [__mj_UpdatedAt])
                    VALUES ('574d4bdf-3e94-4f8f-9925-11119c2dc4b8', 'C6A1D082-6230-40DC-BA5C-7CEE7EA820AF', 'FBE2E751-72F9-4136-9B77-755C1D192185', 'PracticeAreaID', 'One To Many', 1, 1, 1, GETUTCDATE(), GETUTCDATE())
   END;
                    
/* Create Entity Relationship: MJ_BizApps_Referrals: Practice Areas -> MJ_BizApps_Referrals: Practice Areas (One To Many via ParentID) */
   IF NOT EXISTS (
      SELECT 1 FROM [${flyway:defaultSchema}].[EntityRelationship] WHERE [ID] = '9de13e77-cf20-4a9c-a1f5-80eced6ce652' OR ([EntityID] = 'C6A1D082-6230-40DC-BA5C-7CEE7EA820AF' AND [RelatedEntityID] = 'C6A1D082-6230-40DC-BA5C-7CEE7EA820AF' AND [RelatedEntityJoinField] = 'ParentID')
   )
   BEGIN
      INSERT INTO [${flyway:defaultSchema}].[EntityRelationship] ([ID], [EntityID], [RelatedEntityID], [RelatedEntityJoinField], [Type], [BundleInAPI], [DisplayInForm], [Sequence], [__mj_CreatedAt], [__mj_UpdatedAt])
                    VALUES ('9de13e77-cf20-4a9c-a1f5-80eced6ce652', 'C6A1D082-6230-40DC-BA5C-7CEE7EA820AF', 'C6A1D082-6230-40DC-BA5C-7CEE7EA820AF', 'ParentID', 'One To Many', 1, 1, 2, GETUTCDATE(), GETUTCDATE())
   END;
                    
/* Create Entity Relationship: MJ_BizApps_Referrals: Practice Areas -> MJ_BizApps_Referrals: Referral Requests (One To Many via PracticeAreaID) */
   IF NOT EXISTS (
      SELECT 1 FROM [${flyway:defaultSchema}].[EntityRelationship] WHERE [ID] = '4bf22e56-970b-4610-9846-01f54032202c' OR ([EntityID] = 'C6A1D082-6230-40DC-BA5C-7CEE7EA820AF' AND [RelatedEntityID] = 'C1CEBBE7-15E6-4134-B303-96F38D585F65' AND [RelatedEntityJoinField] = 'PracticeAreaID')
   )
   BEGIN
      INSERT INTO [${flyway:defaultSchema}].[EntityRelationship] ([ID], [EntityID], [RelatedEntityID], [RelatedEntityJoinField], [Type], [BundleInAPI], [DisplayInForm], [Sequence], [__mj_CreatedAt], [__mj_UpdatedAt])
                    VALUES ('4bf22e56-970b-4610-9846-01f54032202c', 'C6A1D082-6230-40DC-BA5C-7CEE7EA820AF', 'C1CEBBE7-15E6-4134-B303-96F38D585F65', 'PracticeAreaID', 'One To Many', 1, 1, 3, GETUTCDATE(), GETUTCDATE())
   END;


/* Create Entity Relationship: MJ_BizApps_Referrals: Referral Assignments -> MJ_BizApps_Referrals: Referral Feedbacks (One To Many via ReferralAssignmentID) */
   IF NOT EXISTS (
      SELECT 1 FROM [${flyway:defaultSchema}].[EntityRelationship] WHERE [ID] = '6d0a768b-aba2-4193-8cc6-0ca8fa247c7e' OR ([EntityID] = '7EB379C8-6C97-4640-B0AA-94F0874F4182' AND [RelatedEntityID] = '21B34F7D-822B-4BA5-985C-52215D3DDB9D' AND [RelatedEntityJoinField] = 'ReferralAssignmentID')
   )
   BEGIN
      INSERT INTO [${flyway:defaultSchema}].[EntityRelationship] ([ID], [EntityID], [RelatedEntityID], [RelatedEntityJoinField], [Type], [BundleInAPI], [DisplayInForm], [Sequence], [__mj_CreatedAt], [__mj_UpdatedAt])
                    VALUES ('6d0a768b-aba2-4193-8cc6-0ca8fa247c7e', '7EB379C8-6C97-4640-B0AA-94F0874F4182', '21B34F7D-822B-4BA5-985C-52215D3DDB9D', 'ReferralAssignmentID', 'One To Many', 1, 1, 1, GETUTCDATE(), GETUTCDATE())
   END;
                    
/* Create Entity Relationship: MJ_BizApps_Referrals: Referral Requests -> MJ_BizApps_Referrals: Referral Feedbacks (One To Many via ReferralRequestID) */
   IF NOT EXISTS (
      SELECT 1 FROM [${flyway:defaultSchema}].[EntityRelationship] WHERE [ID] = 'e59f08ac-344d-4691-977a-0c1fd429b693' OR ([EntityID] = 'C1CEBBE7-15E6-4134-B303-96F38D585F65' AND [RelatedEntityID] = '21B34F7D-822B-4BA5-985C-52215D3DDB9D' AND [RelatedEntityJoinField] = 'ReferralRequestID')
   )
   BEGIN
      INSERT INTO [${flyway:defaultSchema}].[EntityRelationship] ([ID], [EntityID], [RelatedEntityID], [RelatedEntityJoinField], [Type], [BundleInAPI], [DisplayInForm], [Sequence], [__mj_CreatedAt], [__mj_UpdatedAt])
                    VALUES ('e59f08ac-344d-4691-977a-0c1fd429b693', 'C1CEBBE7-15E6-4134-B303-96F38D585F65', '21B34F7D-822B-4BA5-985C-52215D3DDB9D', 'ReferralRequestID', 'One To Many', 1, 1, 1, GETUTCDATE(), GETUTCDATE())
   END;
                    
/* Create Entity Relationship: MJ_BizApps_Referrals: Referral Requests -> MJ_BizApps_Referrals: Referral Assignments (One To Many via ReferralRequestID) */
   IF NOT EXISTS (
      SELECT 1 FROM [${flyway:defaultSchema}].[EntityRelationship] WHERE [ID] = '129be26e-5c86-4813-a8c9-563dda739c51' OR ([EntityID] = 'C1CEBBE7-15E6-4134-B303-96F38D585F65' AND [RelatedEntityID] = '7EB379C8-6C97-4640-B0AA-94F0874F4182' AND [RelatedEntityJoinField] = 'ReferralRequestID')
   )
   BEGIN
      INSERT INTO [${flyway:defaultSchema}].[EntityRelationship] ([ID], [EntityID], [RelatedEntityID], [RelatedEntityJoinField], [Type], [BundleInAPI], [DisplayInForm], [Sequence], [__mj_CreatedAt], [__mj_UpdatedAt])
                    VALUES ('129be26e-5c86-4813-a8c9-563dda739c51', 'C1CEBBE7-15E6-4134-B303-96F38D585F65', '7EB379C8-6C97-4640-B0AA-94F0874F4182', 'ReferralRequestID', 'One To Many', 1, 1, 2, GETUTCDATE(), GETUTCDATE())
   END;
                    
/* Create Entity Relationship: MJ_BizApps_Referrals: Referral Requests -> MJ_BizApps_Referrals: Conflict Check Parties (One To Many via ReferralRequestID) */
   IF NOT EXISTS (
      SELECT 1 FROM [${flyway:defaultSchema}].[EntityRelationship] WHERE [ID] = '23736aec-aae0-46e3-9824-43a6f93d794b' OR ([EntityID] = 'C1CEBBE7-15E6-4134-B303-96F38D585F65' AND [RelatedEntityID] = 'B932CD45-C00E-4C73-A21F-FAE50020AF94' AND [RelatedEntityJoinField] = 'ReferralRequestID')
   )
   BEGIN
      INSERT INTO [${flyway:defaultSchema}].[EntityRelationship] ([ID], [EntityID], [RelatedEntityID], [RelatedEntityJoinField], [Type], [BundleInAPI], [DisplayInForm], [Sequence], [__mj_CreatedAt], [__mj_UpdatedAt])
                    VALUES ('23736aec-aae0-46e3-9824-43a6f93d794b', 'C1CEBBE7-15E6-4134-B303-96F38D585F65', 'B932CD45-C00E-4C73-A21F-FAE50020AF94', 'ReferralRequestID', 'One To Many', 1, 1, 3, GETUTCDATE(), GETUTCDATE())
   END;
                    
/* Create Entity Relationship: MJ_BizApps_Referrals: Jurisdictions -> MJ_BizApps_Referrals: Professional Jurisdictions (One To Many via JurisdictionID) */
   IF NOT EXISTS (
      SELECT 1 FROM [${flyway:defaultSchema}].[EntityRelationship] WHERE [ID] = '2a057dbd-68f4-4f40-8703-c8afcfdc7f70' OR ([EntityID] = 'B6923104-236C-4100-BA23-C4AC354B47A8' AND [RelatedEntityID] = '9210D51B-1131-4C40-80DF-62DC5799AFFB' AND [RelatedEntityJoinField] = 'JurisdictionID')
   )
   BEGIN
      INSERT INTO [${flyway:defaultSchema}].[EntityRelationship] ([ID], [EntityID], [RelatedEntityID], [RelatedEntityJoinField], [Type], [BundleInAPI], [DisplayInForm], [Sequence], [__mj_CreatedAt], [__mj_UpdatedAt])
                    VALUES ('2a057dbd-68f4-4f40-8703-c8afcfdc7f70', 'B6923104-236C-4100-BA23-C4AC354B47A8', '9210D51B-1131-4C40-80DF-62DC5799AFFB', 'JurisdictionID', 'One To Many', 1, 1, 1, GETUTCDATE(), GETUTCDATE())
   END;


/* Create Entity Relationship: MJ_BizApps_Referrals: Jurisdictions -> MJ_BizApps_Referrals: Referral Requests (One To Many via JurisdictionID) */
   IF NOT EXISTS (
      SELECT 1 FROM [${flyway:defaultSchema}].[EntityRelationship] WHERE [ID] = 'e6561201-a55e-427b-8245-5ad967e840f1' OR ([EntityID] = 'B6923104-236C-4100-BA23-C4AC354B47A8' AND [RelatedEntityID] = 'C1CEBBE7-15E6-4134-B303-96F38D585F65' AND [RelatedEntityJoinField] = 'JurisdictionID')
   )
   BEGIN
      INSERT INTO [${flyway:defaultSchema}].[EntityRelationship] ([ID], [EntityID], [RelatedEntityID], [RelatedEntityJoinField], [Type], [BundleInAPI], [DisplayInForm], [Sequence], [__mj_CreatedAt], [__mj_UpdatedAt])
                    VALUES ('e6561201-a55e-427b-8245-5ad967e840f1', 'B6923104-236C-4100-BA23-C4AC354B47A8', 'C1CEBBE7-15E6-4134-B303-96F38D585F65', 'JurisdictionID', 'One To Many', 1, 1, 2, GETUTCDATE(), GETUTCDATE())
   END;
                    
/* Create Entity Relationship: MJ_BizApps_Referrals: Jurisdictions -> MJ_BizApps_Referrals: Jurisdictions (One To Many via ParentID) */
   IF NOT EXISTS (
      SELECT 1 FROM [${flyway:defaultSchema}].[EntityRelationship] WHERE [ID] = '2f93a93c-62c1-4de2-8de0-fe83129af27e' OR ([EntityID] = 'B6923104-236C-4100-BA23-C4AC354B47A8' AND [RelatedEntityID] = 'B6923104-236C-4100-BA23-C4AC354B47A8' AND [RelatedEntityJoinField] = 'ParentID')
   )
   BEGIN
      INSERT INTO [${flyway:defaultSchema}].[EntityRelationship] ([ID], [EntityID], [RelatedEntityID], [RelatedEntityJoinField], [Type], [BundleInAPI], [DisplayInForm], [Sequence], [__mj_CreatedAt], [__mj_UpdatedAt])
                    VALUES ('2f93a93c-62c1-4de2-8de0-fe83129af27e', 'B6923104-236C-4100-BA23-C4AC354B47A8', 'B6923104-236C-4100-BA23-C4AC354B47A8', 'ParentID', 'One To Many', 1, 1, 3, GETUTCDATE(), GETUTCDATE())
   END;
                    
/* Create Entity Relationship: MJ_BizApps_Referrals: Referral Tiers -> MJ_BizApps_Referrals: Referral Requests (One To Many via ReferralTierID) */
   IF NOT EXISTS (
      SELECT 1 FROM [${flyway:defaultSchema}].[EntityRelationship] WHERE [ID] = '5ab05933-dafb-4b98-9b90-bff8e2f68acf' OR ([EntityID] = '48BAF761-CB15-47B8-BE87-C6D1B54F25F6' AND [RelatedEntityID] = 'C1CEBBE7-15E6-4134-B303-96F38D585F65' AND [RelatedEntityJoinField] = 'ReferralTierID')
   )
   BEGIN
      INSERT INTO [${flyway:defaultSchema}].[EntityRelationship] ([ID], [EntityID], [RelatedEntityID], [RelatedEntityJoinField], [Type], [BundleInAPI], [DisplayInForm], [Sequence], [__mj_CreatedAt], [__mj_UpdatedAt])
                    VALUES ('5ab05933-dafb-4b98-9b90-bff8e2f68acf', '48BAF761-CB15-47B8-BE87-C6D1B54F25F6', 'C1CEBBE7-15E6-4134-B303-96F38D585F65', 'ReferralTierID', 'One To Many', 1, 1, 1, GETUTCDATE(), GETUTCDATE())
   END;
                    
/* Create Entity Relationship: MJ_BizApps_Common: People -> MJ_BizApps_Referrals: Professional Profiles (One To Many via PersonID) */
   IF NOT EXISTS (
      SELECT 1 FROM [${flyway:defaultSchema}].[EntityRelationship] WHERE [ID] = '57c68767-22b9-4413-a949-5ea2ab3f7d54' OR ([EntityID] = '7A94ADA9-7880-4FAE-97D8-DB0E934C3F5F' AND [RelatedEntityID] = '7492A921-FFCF-4A3E-B59A-56C88D16DDE1' AND [RelatedEntityJoinField] = 'PersonID')
   )
   BEGIN
      INSERT INTO [${flyway:defaultSchema}].[EntityRelationship] ([ID], [EntityID], [RelatedEntityID], [RelatedEntityJoinField], [Type], [BundleInAPI], [DisplayInForm], [Sequence], [__mj_CreatedAt], [__mj_UpdatedAt])
                    VALUES ('57c68767-22b9-4413-a949-5ea2ab3f7d54', '7A94ADA9-7880-4FAE-97D8-DB0E934C3F5F', '7492A921-FFCF-4A3E-B59A-56C88D16DDE1', 'PersonID', 'One To Many', 1, 1, 28, GETUTCDATE(), GETUTCDATE())
   END;
                    
/* Create Entity Relationship: MJ_BizApps_Common: People -> MJ_BizApps_Referrals: Referral Requests (One To Many via SeekerPersonID) */
   IF NOT EXISTS (
      SELECT 1 FROM [${flyway:defaultSchema}].[EntityRelationship] WHERE [ID] = '8942f762-6ece-45c0-ab07-0614e1d6dfdb' OR ([EntityID] = '7A94ADA9-7880-4FAE-97D8-DB0E934C3F5F' AND [RelatedEntityID] = 'C1CEBBE7-15E6-4134-B303-96F38D585F65' AND [RelatedEntityJoinField] = 'SeekerPersonID')
   )
   BEGIN
      INSERT INTO [${flyway:defaultSchema}].[EntityRelationship] ([ID], [EntityID], [RelatedEntityID], [RelatedEntityJoinField], [Type], [BundleInAPI], [DisplayInForm], [Sequence], [__mj_CreatedAt], [__mj_UpdatedAt])
                    VALUES ('8942f762-6ece-45c0-ab07-0614e1d6dfdb', '7A94ADA9-7880-4FAE-97D8-DB0E934C3F5F', 'C1CEBBE7-15E6-4134-B303-96F38D585F65', 'SeekerPersonID', 'One To Many', 1, 1, 29, GETUTCDATE(), GETUTCDATE())
   END;

/* SQL text to update entity field related entity name field map for entity field ID EBC62E63-38B2-4B42-8466-4F985D17DE48 */
EXEC [${flyway:defaultSchema}].[spUpdateEntityFieldRelatedEntityNameFieldMap] @EntityFieldID='EBC62E63-38B2-4B42-8466-4F985D17DE48', @RelatedEntityNameFieldMap='Parent';

/* SQL text to update entity field related entity name field map for entity field ID 4C1CDF4F-CA86-43EC-8630-3BF69B2FC9B4 */
EXEC [${flyway:defaultSchema}].[spUpdateEntityFieldRelatedEntityNameFieldMap] @EntityFieldID='4C1CDF4F-CA86-43EC-8630-3BF69B2FC9B4', @RelatedEntityNameFieldMap='Parent';

/* SQL text to update entity field related entity name field map for entity field ID 323CCDBD-4F3F-44A0-9539-981E32914407 */
EXEC [${flyway:defaultSchema}].[spUpdateEntityFieldRelatedEntityNameFieldMap] @EntityFieldID='323CCDBD-4F3F-44A0-9539-981E32914407', @RelatedEntityNameFieldMap='Jurisdiction';

/* SQL text to update entity field related entity name field map for entity field ID CD5144BC-41C1-4628-835B-4211F22073C7 */
EXEC [${flyway:defaultSchema}].[spUpdateEntityFieldRelatedEntityNameFieldMap] @EntityFieldID='CD5144BC-41C1-4628-835B-4211F22073C7', @RelatedEntityNameFieldMap='PracticeArea';

/* SQL text to update entity field related entity name field map for entity field ID B9B06233-C7F3-41C4-B854-CFB119299295 */
EXEC [${flyway:defaultSchema}].[spUpdateEntityFieldRelatedEntityNameFieldMap] @EntityFieldID='B9B06233-C7F3-41C4-B854-CFB119299295', @RelatedEntityNameFieldMap='Person';

/* SQL text to update entity field related entity name field map for entity field ID B6BBEF6A-76CC-4EB8-9479-3140FCAEE8D7 */
EXEC [${flyway:defaultSchema}].[spUpdateEntityFieldRelatedEntityNameFieldMap] @EntityFieldID='B6BBEF6A-76CC-4EB8-9479-3140FCAEE8D7', @RelatedEntityNameFieldMap='Organization';

/* SQL text to update entity field related entity name field map for entity field ID AD70BAC7-FAB7-4C16-8187-44CF7D04B18A */
EXEC [${flyway:defaultSchema}].[spUpdateEntityFieldRelatedEntityNameFieldMap] @EntityFieldID='AD70BAC7-FAB7-4C16-8187-44CF7D04B18A', @RelatedEntityNameFieldMap='User';

/* Index for Foreign Keys for ConflictCheckParty */
-----------------------------------------------------------------
-- SQL Code Generation
-- Entity: MJ_BizApps_Referrals: Conflict Check Parties
-- Item: Index for Foreign Keys
--
-- This was generated by the MemberJunction CodeGen tool.
-- This file should NOT be edited by hand.
-----------------------------------------------------------------
-- Index for foreign key ReferralRequestID in table ConflictCheckParty
IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'IDX_AUTO_MJ_FKEY_ConflictCheckParty_ReferralRequestID' 
    AND object_id = OBJECT_ID('[__mj_BizAppsReferrals].[ConflictCheckParty]')
)
CREATE INDEX IDX_AUTO_MJ_FKEY_ConflictCheckParty_ReferralRequestID ON [__mj_BizAppsReferrals].[ConflictCheckParty] ([ReferralRequestID]);

/* Base View SQL for MJ_BizApps_Referrals: Conflict Check Parties */
-----------------------------------------------------------------
-- SQL Code Generation
-- Entity: MJ_BizApps_Referrals: Conflict Check Parties
-- Item: vwConflictCheckParties
--
-- This was generated by the MemberJunction CodeGen tool.
-- This file should NOT be edited by hand.
-----------------------------------------------------------------

------------------------------------------------------------
----- BASE VIEW FOR ENTITY:      MJ_BizApps_Referrals: Conflict Check Parties
-----               SCHEMA:      __mj_BizAppsReferrals
-----               BASE TABLE:  ConflictCheckParty
-----               PRIMARY KEY: ID
------------------------------------------------------------
IF OBJECT_ID('[__mj_BizAppsReferrals].[vwConflictCheckParties]', 'V') IS NOT NULL
    DROP VIEW [__mj_BizAppsReferrals].[vwConflictCheckParties];
GO

CREATE VIEW [__mj_BizAppsReferrals].[vwConflictCheckParties]
AS
SELECT
    c.*
FROM
    [__mj_BizAppsReferrals].[ConflictCheckParty] AS c
GO
GRANT SELECT ON [__mj_BizAppsReferrals].[vwConflictCheckParties] TO [cdp_UI], [cdp_Developer], [cdp_Integration];

/* Base View Permissions SQL for MJ_BizApps_Referrals: Conflict Check Parties */
-----------------------------------------------------------------
-- SQL Code Generation
-- Entity: MJ_BizApps_Referrals: Conflict Check Parties
-- Item: Permissions for vwConflictCheckParties
--
-- This was generated by the MemberJunction CodeGen tool.
-- This file should NOT be edited by hand.
-----------------------------------------------------------------

GRANT SELECT ON [__mj_BizAppsReferrals].[vwConflictCheckParties] TO [cdp_UI], [cdp_Developer], [cdp_Integration];

/* spCreate SQL for MJ_BizApps_Referrals: Conflict Check Parties */
-----------------------------------------------------------------
-- SQL Code Generation
-- Entity: MJ_BizApps_Referrals: Conflict Check Parties
-- Item: spCreateConflictCheckParty
--
-- This was generated by the MemberJunction CodeGen tool.
-- This file should NOT be edited by hand.
-----------------------------------------------------------------

------------------------------------------------------------
----- CREATE PROCEDURE FOR ConflictCheckParty
------------------------------------------------------------
IF OBJECT_ID('[__mj_BizAppsReferrals].[spCreateConflictCheckParty]', 'P') IS NOT NULL
    DROP PROCEDURE [__mj_BizAppsReferrals].[spCreateConflictCheckParty];
GO

CREATE PROCEDURE [__mj_BizAppsReferrals].[spCreateConflictCheckParty]
    @ID uniqueidentifier = NULL,
    @ReferralRequestID uniqueidentifier,
    @PartyName nvarchar(255),
    @PartyRole nvarchar(30) = NULL,
    @OrganizationName_Clear bit = 0,
    @OrganizationName nvarchar(255) = NULL,
    @NormalizedName nvarchar(255),
    @Notes_Clear bit = 0,
    @Notes nvarchar(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @InsertedRow TABLE ([ID] UNIQUEIDENTIFIER)

    IF @ID IS NOT NULL
    BEGIN
        -- User provided a value, use it
        INSERT INTO [__mj_BizAppsReferrals].[ConflictCheckParty]
            (
                [ID],
                [ReferralRequestID],
                [PartyName],
                [PartyRole],
                [OrganizationName],
                [NormalizedName],
                [Notes]
            )
        OUTPUT INSERTED.[ID] INTO @InsertedRow
        VALUES
            (
                @ID,
                @ReferralRequestID,
                @PartyName,
                ISNULL(@PartyRole, 'Adverse'),
                CASE WHEN @OrganizationName_Clear = 1 THEN NULL ELSE ISNULL(@OrganizationName, NULL) END,
                @NormalizedName,
                CASE WHEN @Notes_Clear = 1 THEN NULL ELSE ISNULL(@Notes, NULL) END
            )
    END
    ELSE
    BEGIN
        -- No value provided, let database use its default (e.g., NEWSEQUENTIALID())
        INSERT INTO [__mj_BizAppsReferrals].[ConflictCheckParty]
            (
                [ReferralRequestID],
                [PartyName],
                [PartyRole],
                [OrganizationName],
                [NormalizedName],
                [Notes]
            )
        OUTPUT INSERTED.[ID] INTO @InsertedRow
        VALUES
            (
                @ReferralRequestID,
                @PartyName,
                ISNULL(@PartyRole, 'Adverse'),
                CASE WHEN @OrganizationName_Clear = 1 THEN NULL ELSE ISNULL(@OrganizationName, NULL) END,
                @NormalizedName,
                CASE WHEN @Notes_Clear = 1 THEN NULL ELSE ISNULL(@Notes, NULL) END
            )
    END
    -- return the new record from the base view, which might have some calculated fields
    SELECT * FROM [__mj_BizAppsReferrals].[vwConflictCheckParties] WHERE [ID] = (SELECT [ID] FROM @InsertedRow)
END
GO
GRANT EXECUTE ON [__mj_BizAppsReferrals].[spCreateConflictCheckParty] TO [cdp_Developer], [cdp_Integration];

/* spCreate Permissions for MJ_BizApps_Referrals: Conflict Check Parties */

GRANT EXECUTE ON [__mj_BizAppsReferrals].[spCreateConflictCheckParty] TO [cdp_Developer], [cdp_Integration];

/* spUpdate SQL for MJ_BizApps_Referrals: Conflict Check Parties */
-----------------------------------------------------------------
-- SQL Code Generation
-- Entity: MJ_BizApps_Referrals: Conflict Check Parties
-- Item: spUpdateConflictCheckParty
--
-- This was generated by the MemberJunction CodeGen tool.
-- This file should NOT be edited by hand.
-----------------------------------------------------------------

------------------------------------------------------------
----- UPDATE PROCEDURE FOR ConflictCheckParty
------------------------------------------------------------
IF OBJECT_ID('[__mj_BizAppsReferrals].[spUpdateConflictCheckParty]', 'P') IS NOT NULL
    DROP PROCEDURE [__mj_BizAppsReferrals].[spUpdateConflictCheckParty];
GO

CREATE PROCEDURE [__mj_BizAppsReferrals].[spUpdateConflictCheckParty]
    @ID uniqueidentifier,
    @ReferralRequestID uniqueidentifier = NULL,
    @PartyName nvarchar(255) = NULL,
    @PartyRole nvarchar(30) = NULL,
    @OrganizationName_Clear bit = 0,
    @OrganizationName nvarchar(255) = NULL,
    @NormalizedName nvarchar(255) = NULL,
    @Notes_Clear bit = 0,
    @Notes nvarchar(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE
        [__mj_BizAppsReferrals].[ConflictCheckParty]
    SET
        [ReferralRequestID] = ISNULL(@ReferralRequestID, [ReferralRequestID]),
        [PartyName] = ISNULL(@PartyName, [PartyName]),
        [PartyRole] = ISNULL(@PartyRole, [PartyRole]),
        [OrganizationName] = CASE WHEN @OrganizationName_Clear = 1 THEN NULL ELSE ISNULL(@OrganizationName, [OrganizationName]) END,
        [NormalizedName] = ISNULL(@NormalizedName, [NormalizedName]),
        [Notes] = CASE WHEN @Notes_Clear = 1 THEN NULL ELSE ISNULL(@Notes, [Notes]) END,
        [__mj_UpdatedAt] = GETUTCDATE()
    WHERE
        [ID] = @ID

    -- Check if the update was successful
    IF @@ROWCOUNT = 0
        -- Nothing was updated, return no rows, but column structure from base view intact, semantically correct this way.
        SELECT TOP 0 * FROM [__mj_BizAppsReferrals].[vwConflictCheckParties] WHERE 1=0
    ELSE
        -- Return the updated record so the caller can see the updated values and any calculated fields
        SELECT
                                        *
                                    FROM
                                        [__mj_BizAppsReferrals].[vwConflictCheckParties]
                                    WHERE
                                        [ID] = @ID
                                    
END
GO

GRANT EXECUTE ON [__mj_BizAppsReferrals].[spUpdateConflictCheckParty] TO [cdp_Developer], [cdp_Integration]
GO

------------------------------------------------------------
----- TRIGGER FOR __mj_UpdatedAt field for the ConflictCheckParty table
------------------------------------------------------------
IF OBJECT_ID('[__mj_BizAppsReferrals].[trgUpdateConflictCheckParty]', 'TR') IS NOT NULL
    DROP TRIGGER [__mj_BizAppsReferrals].[trgUpdateConflictCheckParty];
GO
CREATE TRIGGER [__mj_BizAppsReferrals].trgUpdateConflictCheckParty
ON [__mj_BizAppsReferrals].[ConflictCheckParty]
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    IF NOT UPDATE([__mj_UpdatedAt])
    BEGIN
        UPDATE
            [__mj_BizAppsReferrals].[ConflictCheckParty]
        SET
            __mj_UpdatedAt = GETUTCDATE()
        FROM
            [__mj_BizAppsReferrals].[ConflictCheckParty] AS _organicTable
        INNER JOIN
            INSERTED AS I ON
            _organicTable.[ID] = I.[ID];
    END
END;
GO

/* spUpdate Permissions for MJ_BizApps_Referrals: Conflict Check Parties */

GRANT EXECUTE ON [__mj_BizAppsReferrals].[spUpdateConflictCheckParty] TO [cdp_Developer], [cdp_Integration];

/* spDelete SQL for MJ_BizApps_Referrals: Conflict Check Parties */
-----------------------------------------------------------------
-- SQL Code Generation
-- Entity: MJ_BizApps_Referrals: Conflict Check Parties
-- Item: spDeleteConflictCheckParty
--
-- This was generated by the MemberJunction CodeGen tool.
-- This file should NOT be edited by hand.
-----------------------------------------------------------------

------------------------------------------------------------
----- DELETE PROCEDURE FOR ConflictCheckParty
------------------------------------------------------------
IF OBJECT_ID('[__mj_BizAppsReferrals].[spDeleteConflictCheckParty]', 'P') IS NOT NULL
    DROP PROCEDURE [__mj_BizAppsReferrals].[spDeleteConflictCheckParty];
GO

CREATE PROCEDURE [__mj_BizAppsReferrals].[spDeleteConflictCheckParty]
    @ID uniqueidentifier
AS
BEGIN
    SET NOCOUNT ON;

    DELETE FROM
        [__mj_BizAppsReferrals].[ConflictCheckParty]
    WHERE
        [ID] = @ID


    -- Check if the delete was successful
    IF @@ROWCOUNT = 0
        SELECT NULL AS [ID] -- Return NULL for all primary key fields to indicate no record was deleted
    ELSE
        SELECT @ID AS [ID] -- Return the primary key values to indicate we successfully deleted the record
END
GO
GRANT EXECUTE ON [__mj_BizAppsReferrals].[spDeleteConflictCheckParty] TO [cdp_Developer], [cdp_Integration];

/* spDelete Permissions for MJ_BizApps_Referrals: Conflict Check Parties */

GRANT EXECUTE ON [__mj_BizAppsReferrals].[spDeleteConflictCheckParty] TO [cdp_Developer], [cdp_Integration];

/* Index for Foreign Keys for Jurisdiction */
-----------------------------------------------------------------
-- SQL Code Generation
-- Entity: MJ_BizApps_Referrals: Jurisdictions
-- Item: Index for Foreign Keys
--
-- This was generated by the MemberJunction CodeGen tool.
-- This file should NOT be edited by hand.
-----------------------------------------------------------------
-- Index for foreign key ParentID in table Jurisdiction
IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'IDX_AUTO_MJ_FKEY_Jurisdiction_ParentID' 
    AND object_id = OBJECT_ID('[__mj_BizAppsReferrals].[Jurisdiction]')
)
CREATE INDEX IDX_AUTO_MJ_FKEY_Jurisdiction_ParentID ON [__mj_BizAppsReferrals].[Jurisdiction] ([ParentID]);

/* Base View SQL for MJ_BizApps_Referrals: Jurisdictions */
-----------------------------------------------------------------
-- SQL Code Generation
-- Entity: MJ_BizApps_Referrals: Jurisdictions
-- Item: vwJurisdictions
--
-- This was generated by the MemberJunction CodeGen tool.
-- This file should NOT be edited by hand.
-----------------------------------------------------------------

------------------------------------------------------------
----- BASE VIEW FOR ENTITY:      MJ_BizApps_Referrals: Jurisdictions
-----               SCHEMA:      __mj_BizAppsReferrals
-----               BASE TABLE:  Jurisdiction
-----               PRIMARY KEY: ID
------------------------------------------------------------
IF OBJECT_ID('[__mj_BizAppsReferrals].[vwJurisdictions]', 'V') IS NOT NULL
    DROP VIEW [__mj_BizAppsReferrals].[vwJurisdictions];
GO

CREATE VIEW [__mj_BizAppsReferrals].[vwJurisdictions]
AS
SELECT
    j.*,
    mjBizAppsReferralsJurisdiction_ParentID.[Name] AS [Parent]
FROM
    [__mj_BizAppsReferrals].[Jurisdiction] AS j
LEFT OUTER JOIN
    [__mj_BizAppsReferrals].[Jurisdiction] AS mjBizAppsReferralsJurisdiction_ParentID
  ON
    [j].[ParentID] = mjBizAppsReferralsJurisdiction_ParentID.[ID]
GO
GRANT SELECT ON [__mj_BizAppsReferrals].[vwJurisdictions] TO [cdp_UI], [cdp_Developer], [cdp_Integration];

/* Base View Permissions SQL for MJ_BizApps_Referrals: Jurisdictions */
-----------------------------------------------------------------
-- SQL Code Generation
-- Entity: MJ_BizApps_Referrals: Jurisdictions
-- Item: Permissions for vwJurisdictions
--
-- This was generated by the MemberJunction CodeGen tool.
-- This file should NOT be edited by hand.
-----------------------------------------------------------------

GRANT SELECT ON [__mj_BizAppsReferrals].[vwJurisdictions] TO [cdp_UI], [cdp_Developer], [cdp_Integration];

/* spCreate SQL for MJ_BizApps_Referrals: Jurisdictions */
-----------------------------------------------------------------
-- SQL Code Generation
-- Entity: MJ_BizApps_Referrals: Jurisdictions
-- Item: spCreateJurisdiction
--
-- This was generated by the MemberJunction CodeGen tool.
-- This file should NOT be edited by hand.
-----------------------------------------------------------------

------------------------------------------------------------
----- CREATE PROCEDURE FOR Jurisdiction
------------------------------------------------------------
IF OBJECT_ID('[__mj_BizAppsReferrals].[spCreateJurisdiction]', 'P') IS NOT NULL
    DROP PROCEDURE [__mj_BizAppsReferrals].[spCreateJurisdiction];
GO

CREATE PROCEDURE [__mj_BizAppsReferrals].[spCreateJurisdiction]
    @ID uniqueidentifier = NULL,
    @ParentID_Clear bit = 0,
    @ParentID uniqueidentifier = NULL,
    @Name nvarchar(150),
    @Code nvarchar(50),
    @JurisdictionType nvarchar(30) = NULL,
    @CountryCode nvarchar(10) = NULL,
    @StateProvinceCode_Clear bit = 0,
    @StateProvinceCode nvarchar(20) = NULL,
    @IsActive bit = NULL
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @InsertedRow TABLE ([ID] UNIQUEIDENTIFIER)

    IF @ID IS NOT NULL
    BEGIN
        -- User provided a value, use it
        INSERT INTO [__mj_BizAppsReferrals].[Jurisdiction]
            (
                [ID],
                [ParentID],
                [Name],
                [Code],
                [JurisdictionType],
                [CountryCode],
                [StateProvinceCode],
                [IsActive]
            )
        OUTPUT INSERTED.[ID] INTO @InsertedRow
        VALUES
            (
                @ID,
                CASE WHEN @ParentID_Clear = 1 THEN NULL ELSE ISNULL(@ParentID, NULL) END,
                @Name,
                @Code,
                ISNULL(@JurisdictionType, 'State'),
                ISNULL(@CountryCode, 'US'),
                CASE WHEN @StateProvinceCode_Clear = 1 THEN NULL ELSE ISNULL(@StateProvinceCode, NULL) END,
                ISNULL(@IsActive, 1)
            )
    END
    ELSE
    BEGIN
        -- No value provided, let database use its default (e.g., NEWSEQUENTIALID())
        INSERT INTO [__mj_BizAppsReferrals].[Jurisdiction]
            (
                [ParentID],
                [Name],
                [Code],
                [JurisdictionType],
                [CountryCode],
                [StateProvinceCode],
                [IsActive]
            )
        OUTPUT INSERTED.[ID] INTO @InsertedRow
        VALUES
            (
                CASE WHEN @ParentID_Clear = 1 THEN NULL ELSE ISNULL(@ParentID, NULL) END,
                @Name,
                @Code,
                ISNULL(@JurisdictionType, 'State'),
                ISNULL(@CountryCode, 'US'),
                CASE WHEN @StateProvinceCode_Clear = 1 THEN NULL ELSE ISNULL(@StateProvinceCode, NULL) END,
                ISNULL(@IsActive, 1)
            )
    END
    -- return the new record from the base view, which might have some calculated fields
    SELECT * FROM [__mj_BizAppsReferrals].[vwJurisdictions] WHERE [ID] = (SELECT [ID] FROM @InsertedRow)
END
GO
GRANT EXECUTE ON [__mj_BizAppsReferrals].[spCreateJurisdiction] TO [cdp_Developer], [cdp_Integration];

/* spCreate Permissions for MJ_BizApps_Referrals: Jurisdictions */

GRANT EXECUTE ON [__mj_BizAppsReferrals].[spCreateJurisdiction] TO [cdp_Developer], [cdp_Integration];

/* spUpdate SQL for MJ_BizApps_Referrals: Jurisdictions */
-----------------------------------------------------------------
-- SQL Code Generation
-- Entity: MJ_BizApps_Referrals: Jurisdictions
-- Item: spUpdateJurisdiction
--
-- This was generated by the MemberJunction CodeGen tool.
-- This file should NOT be edited by hand.
-----------------------------------------------------------------

------------------------------------------------------------
----- UPDATE PROCEDURE FOR Jurisdiction
------------------------------------------------------------
IF OBJECT_ID('[__mj_BizAppsReferrals].[spUpdateJurisdiction]', 'P') IS NOT NULL
    DROP PROCEDURE [__mj_BizAppsReferrals].[spUpdateJurisdiction];
GO

CREATE PROCEDURE [__mj_BizAppsReferrals].[spUpdateJurisdiction]
    @ID uniqueidentifier,
    @ParentID_Clear bit = 0,
    @ParentID uniqueidentifier = NULL,
    @Name nvarchar(150) = NULL,
    @Code nvarchar(50) = NULL,
    @JurisdictionType nvarchar(30) = NULL,
    @CountryCode nvarchar(10) = NULL,
    @StateProvinceCode_Clear bit = 0,
    @StateProvinceCode nvarchar(20) = NULL,
    @IsActive bit = NULL
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE
        [__mj_BizAppsReferrals].[Jurisdiction]
    SET
        [ParentID] = CASE WHEN @ParentID_Clear = 1 THEN NULL ELSE ISNULL(@ParentID, [ParentID]) END,
        [Name] = ISNULL(@Name, [Name]),
        [Code] = ISNULL(@Code, [Code]),
        [JurisdictionType] = ISNULL(@JurisdictionType, [JurisdictionType]),
        [CountryCode] = ISNULL(@CountryCode, [CountryCode]),
        [StateProvinceCode] = CASE WHEN @StateProvinceCode_Clear = 1 THEN NULL ELSE ISNULL(@StateProvinceCode, [StateProvinceCode]) END,
        [IsActive] = ISNULL(@IsActive, [IsActive]),
        [__mj_UpdatedAt] = GETUTCDATE()
    WHERE
        [ID] = @ID

    -- Check if the update was successful
    IF @@ROWCOUNT = 0
        -- Nothing was updated, return no rows, but column structure from base view intact, semantically correct this way.
        SELECT TOP 0 * FROM [__mj_BizAppsReferrals].[vwJurisdictions] WHERE 1=0
    ELSE
        -- Return the updated record so the caller can see the updated values and any calculated fields
        SELECT
                                        *
                                    FROM
                                        [__mj_BizAppsReferrals].[vwJurisdictions]
                                    WHERE
                                        [ID] = @ID
                                    
END
GO

GRANT EXECUTE ON [__mj_BizAppsReferrals].[spUpdateJurisdiction] TO [cdp_Developer], [cdp_Integration]
GO

------------------------------------------------------------
----- TRIGGER FOR __mj_UpdatedAt field for the Jurisdiction table
------------------------------------------------------------
IF OBJECT_ID('[__mj_BizAppsReferrals].[trgUpdateJurisdiction]', 'TR') IS NOT NULL
    DROP TRIGGER [__mj_BizAppsReferrals].[trgUpdateJurisdiction];
GO
CREATE TRIGGER [__mj_BizAppsReferrals].trgUpdateJurisdiction
ON [__mj_BizAppsReferrals].[Jurisdiction]
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    IF NOT UPDATE([__mj_UpdatedAt])
    BEGIN
        UPDATE
            [__mj_BizAppsReferrals].[Jurisdiction]
        SET
            __mj_UpdatedAt = GETUTCDATE()
        FROM
            [__mj_BizAppsReferrals].[Jurisdiction] AS _organicTable
        INNER JOIN
            INSERTED AS I ON
            _organicTable.[ID] = I.[ID];
    END
END;
GO

/* spUpdate Permissions for MJ_BizApps_Referrals: Jurisdictions */

GRANT EXECUTE ON [__mj_BizAppsReferrals].[spUpdateJurisdiction] TO [cdp_Developer], [cdp_Integration];

/* spDelete SQL for MJ_BizApps_Referrals: Jurisdictions */
-----------------------------------------------------------------
-- SQL Code Generation
-- Entity: MJ_BizApps_Referrals: Jurisdictions
-- Item: spDeleteJurisdiction
--
-- This was generated by the MemberJunction CodeGen tool.
-- This file should NOT be edited by hand.
-----------------------------------------------------------------

------------------------------------------------------------
----- DELETE PROCEDURE FOR Jurisdiction
------------------------------------------------------------
IF OBJECT_ID('[__mj_BizAppsReferrals].[spDeleteJurisdiction]', 'P') IS NOT NULL
    DROP PROCEDURE [__mj_BizAppsReferrals].[spDeleteJurisdiction];
GO

CREATE PROCEDURE [__mj_BizAppsReferrals].[spDeleteJurisdiction]
    @ID uniqueidentifier
AS
BEGIN
    SET NOCOUNT ON;

    DELETE FROM
        [__mj_BizAppsReferrals].[Jurisdiction]
    WHERE
        [ID] = @ID


    -- Check if the delete was successful
    IF @@ROWCOUNT = 0
        SELECT NULL AS [ID] -- Return NULL for all primary key fields to indicate no record was deleted
    ELSE
        SELECT @ID AS [ID] -- Return the primary key values to indicate we successfully deleted the record
END
GO
GRANT EXECUTE ON [__mj_BizAppsReferrals].[spDeleteJurisdiction] TO [cdp_Developer], [cdp_Integration];

/* spDelete Permissions for MJ_BizApps_Referrals: Jurisdictions */

GRANT EXECUTE ON [__mj_BizAppsReferrals].[spDeleteJurisdiction] TO [cdp_Developer], [cdp_Integration];

/* Index for Foreign Keys for PracticeArea */
-----------------------------------------------------------------
-- SQL Code Generation
-- Entity: MJ_BizApps_Referrals: Practice Areas
-- Item: Index for Foreign Keys
--
-- This was generated by the MemberJunction CodeGen tool.
-- This file should NOT be edited by hand.
-----------------------------------------------------------------
-- Index for foreign key ParentID in table PracticeArea
IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'IDX_AUTO_MJ_FKEY_PracticeArea_ParentID' 
    AND object_id = OBJECT_ID('[__mj_BizAppsReferrals].[PracticeArea]')
)
CREATE INDEX IDX_AUTO_MJ_FKEY_PracticeArea_ParentID ON [__mj_BizAppsReferrals].[PracticeArea] ([ParentID]);

/* Base View SQL for MJ_BizApps_Referrals: Practice Areas */
-----------------------------------------------------------------
-- SQL Code Generation
-- Entity: MJ_BizApps_Referrals: Practice Areas
-- Item: vwPracticeAreas
--
-- This was generated by the MemberJunction CodeGen tool.
-- This file should NOT be edited by hand.
-----------------------------------------------------------------

------------------------------------------------------------
----- BASE VIEW FOR ENTITY:      MJ_BizApps_Referrals: Practice Areas
-----               SCHEMA:      __mj_BizAppsReferrals
-----               BASE TABLE:  PracticeArea
-----               PRIMARY KEY: ID
------------------------------------------------------------
IF OBJECT_ID('[__mj_BizAppsReferrals].[vwPracticeAreas]', 'V') IS NOT NULL
    DROP VIEW [__mj_BizAppsReferrals].[vwPracticeAreas];
GO

CREATE VIEW [__mj_BizAppsReferrals].[vwPracticeAreas]
AS
SELECT
    p.*,
    mjBizAppsReferralsPracticeArea_ParentID.[Name] AS [Parent]
FROM
    [__mj_BizAppsReferrals].[PracticeArea] AS p
LEFT OUTER JOIN
    [__mj_BizAppsReferrals].[PracticeArea] AS mjBizAppsReferralsPracticeArea_ParentID
  ON
    [p].[ParentID] = mjBizAppsReferralsPracticeArea_ParentID.[ID]
GO
GRANT SELECT ON [__mj_BizAppsReferrals].[vwPracticeAreas] TO [cdp_UI], [cdp_Developer], [cdp_Integration];

/* Base View Permissions SQL for MJ_BizApps_Referrals: Practice Areas */
-----------------------------------------------------------------
-- SQL Code Generation
-- Entity: MJ_BizApps_Referrals: Practice Areas
-- Item: Permissions for vwPracticeAreas
--
-- This was generated by the MemberJunction CodeGen tool.
-- This file should NOT be edited by hand.
-----------------------------------------------------------------

GRANT SELECT ON [__mj_BizAppsReferrals].[vwPracticeAreas] TO [cdp_UI], [cdp_Developer], [cdp_Integration];

/* spCreate SQL for MJ_BizApps_Referrals: Practice Areas */
-----------------------------------------------------------------
-- SQL Code Generation
-- Entity: MJ_BizApps_Referrals: Practice Areas
-- Item: spCreatePracticeArea
--
-- This was generated by the MemberJunction CodeGen tool.
-- This file should NOT be edited by hand.
-----------------------------------------------------------------

------------------------------------------------------------
----- CREATE PROCEDURE FOR PracticeArea
------------------------------------------------------------
IF OBJECT_ID('[__mj_BizAppsReferrals].[spCreatePracticeArea]', 'P') IS NOT NULL
    DROP PROCEDURE [__mj_BizAppsReferrals].[spCreatePracticeArea];
GO

CREATE PROCEDURE [__mj_BizAppsReferrals].[spCreatePracticeArea]
    @ID uniqueidentifier = NULL,
    @ParentID_Clear bit = 0,
    @ParentID uniqueidentifier = NULL,
    @Name nvarchar(150),
    @Code nvarchar(50),
    @Category_Clear bit = 0,
    @Category nvarchar(100) = NULL,
    @Description_Clear bit = 0,
    @Description nvarchar(MAX) = NULL,
    @IconClass_Clear bit = 0,
    @IconClass nvarchar(100) = NULL,
    @DisplayRank int = NULL,
    @IsActive bit = NULL
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @InsertedRow TABLE ([ID] UNIQUEIDENTIFIER)

    IF @ID IS NOT NULL
    BEGIN
        -- User provided a value, use it
        INSERT INTO [__mj_BizAppsReferrals].[PracticeArea]
            (
                [ID],
                [ParentID],
                [Name],
                [Code],
                [Category],
                [Description],
                [IconClass],
                [DisplayRank],
                [IsActive]
            )
        OUTPUT INSERTED.[ID] INTO @InsertedRow
        VALUES
            (
                @ID,
                CASE WHEN @ParentID_Clear = 1 THEN NULL ELSE ISNULL(@ParentID, NULL) END,
                @Name,
                @Code,
                CASE WHEN @Category_Clear = 1 THEN NULL ELSE ISNULL(@Category, NULL) END,
                CASE WHEN @Description_Clear = 1 THEN NULL ELSE ISNULL(@Description, NULL) END,
                CASE WHEN @IconClass_Clear = 1 THEN NULL ELSE ISNULL(@IconClass, NULL) END,
                ISNULL(@DisplayRank, 100),
                ISNULL(@IsActive, 1)
            )
    END
    ELSE
    BEGIN
        -- No value provided, let database use its default (e.g., NEWSEQUENTIALID())
        INSERT INTO [__mj_BizAppsReferrals].[PracticeArea]
            (
                [ParentID],
                [Name],
                [Code],
                [Category],
                [Description],
                [IconClass],
                [DisplayRank],
                [IsActive]
            )
        OUTPUT INSERTED.[ID] INTO @InsertedRow
        VALUES
            (
                CASE WHEN @ParentID_Clear = 1 THEN NULL ELSE ISNULL(@ParentID, NULL) END,
                @Name,
                @Code,
                CASE WHEN @Category_Clear = 1 THEN NULL ELSE ISNULL(@Category, NULL) END,
                CASE WHEN @Description_Clear = 1 THEN NULL ELSE ISNULL(@Description, NULL) END,
                CASE WHEN @IconClass_Clear = 1 THEN NULL ELSE ISNULL(@IconClass, NULL) END,
                ISNULL(@DisplayRank, 100),
                ISNULL(@IsActive, 1)
            )
    END
    -- return the new record from the base view, which might have some calculated fields
    SELECT * FROM [__mj_BizAppsReferrals].[vwPracticeAreas] WHERE [ID] = (SELECT [ID] FROM @InsertedRow)
END
GO
GRANT EXECUTE ON [__mj_BizAppsReferrals].[spCreatePracticeArea] TO [cdp_Developer], [cdp_Integration];

/* spCreate Permissions for MJ_BizApps_Referrals: Practice Areas */

GRANT EXECUTE ON [__mj_BizAppsReferrals].[spCreatePracticeArea] TO [cdp_Developer], [cdp_Integration];

/* spUpdate SQL for MJ_BizApps_Referrals: Practice Areas */
-----------------------------------------------------------------
-- SQL Code Generation
-- Entity: MJ_BizApps_Referrals: Practice Areas
-- Item: spUpdatePracticeArea
--
-- This was generated by the MemberJunction CodeGen tool.
-- This file should NOT be edited by hand.
-----------------------------------------------------------------

------------------------------------------------------------
----- UPDATE PROCEDURE FOR PracticeArea
------------------------------------------------------------
IF OBJECT_ID('[__mj_BizAppsReferrals].[spUpdatePracticeArea]', 'P') IS NOT NULL
    DROP PROCEDURE [__mj_BizAppsReferrals].[spUpdatePracticeArea];
GO

CREATE PROCEDURE [__mj_BizAppsReferrals].[spUpdatePracticeArea]
    @ID uniqueidentifier,
    @ParentID_Clear bit = 0,
    @ParentID uniqueidentifier = NULL,
    @Name nvarchar(150) = NULL,
    @Code nvarchar(50) = NULL,
    @Category_Clear bit = 0,
    @Category nvarchar(100) = NULL,
    @Description_Clear bit = 0,
    @Description nvarchar(MAX) = NULL,
    @IconClass_Clear bit = 0,
    @IconClass nvarchar(100) = NULL,
    @DisplayRank int = NULL,
    @IsActive bit = NULL
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE
        [__mj_BizAppsReferrals].[PracticeArea]
    SET
        [ParentID] = CASE WHEN @ParentID_Clear = 1 THEN NULL ELSE ISNULL(@ParentID, [ParentID]) END,
        [Name] = ISNULL(@Name, [Name]),
        [Code] = ISNULL(@Code, [Code]),
        [Category] = CASE WHEN @Category_Clear = 1 THEN NULL ELSE ISNULL(@Category, [Category]) END,
        [Description] = CASE WHEN @Description_Clear = 1 THEN NULL ELSE ISNULL(@Description, [Description]) END,
        [IconClass] = CASE WHEN @IconClass_Clear = 1 THEN NULL ELSE ISNULL(@IconClass, [IconClass]) END,
        [DisplayRank] = ISNULL(@DisplayRank, [DisplayRank]),
        [IsActive] = ISNULL(@IsActive, [IsActive]),
        [__mj_UpdatedAt] = GETUTCDATE()
    WHERE
        [ID] = @ID

    -- Check if the update was successful
    IF @@ROWCOUNT = 0
        -- Nothing was updated, return no rows, but column structure from base view intact, semantically correct this way.
        SELECT TOP 0 * FROM [__mj_BizAppsReferrals].[vwPracticeAreas] WHERE 1=0
    ELSE
        -- Return the updated record so the caller can see the updated values and any calculated fields
        SELECT
                                        *
                                    FROM
                                        [__mj_BizAppsReferrals].[vwPracticeAreas]
                                    WHERE
                                        [ID] = @ID
                                    
END
GO

GRANT EXECUTE ON [__mj_BizAppsReferrals].[spUpdatePracticeArea] TO [cdp_Developer], [cdp_Integration]
GO

------------------------------------------------------------
----- TRIGGER FOR __mj_UpdatedAt field for the PracticeArea table
------------------------------------------------------------
IF OBJECT_ID('[__mj_BizAppsReferrals].[trgUpdatePracticeArea]', 'TR') IS NOT NULL
    DROP TRIGGER [__mj_BizAppsReferrals].[trgUpdatePracticeArea];
GO
CREATE TRIGGER [__mj_BizAppsReferrals].trgUpdatePracticeArea
ON [__mj_BizAppsReferrals].[PracticeArea]
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    IF NOT UPDATE([__mj_UpdatedAt])
    BEGIN
        UPDATE
            [__mj_BizAppsReferrals].[PracticeArea]
        SET
            __mj_UpdatedAt = GETUTCDATE()
        FROM
            [__mj_BizAppsReferrals].[PracticeArea] AS _organicTable
        INNER JOIN
            INSERTED AS I ON
            _organicTable.[ID] = I.[ID];
    END
END;
GO

/* spUpdate Permissions for MJ_BizApps_Referrals: Practice Areas */

GRANT EXECUTE ON [__mj_BizAppsReferrals].[spUpdatePracticeArea] TO [cdp_Developer], [cdp_Integration];

/* spDelete SQL for MJ_BizApps_Referrals: Practice Areas */
-----------------------------------------------------------------
-- SQL Code Generation
-- Entity: MJ_BizApps_Referrals: Practice Areas
-- Item: spDeletePracticeArea
--
-- This was generated by the MemberJunction CodeGen tool.
-- This file should NOT be edited by hand.
-----------------------------------------------------------------

------------------------------------------------------------
----- DELETE PROCEDURE FOR PracticeArea
------------------------------------------------------------
IF OBJECT_ID('[__mj_BizAppsReferrals].[spDeletePracticeArea]', 'P') IS NOT NULL
    DROP PROCEDURE [__mj_BizAppsReferrals].[spDeletePracticeArea];
GO

CREATE PROCEDURE [__mj_BizAppsReferrals].[spDeletePracticeArea]
    @ID uniqueidentifier
AS
BEGIN
    SET NOCOUNT ON;

    DELETE FROM
        [__mj_BizAppsReferrals].[PracticeArea]
    WHERE
        [ID] = @ID


    -- Check if the delete was successful
    IF @@ROWCOUNT = 0
        SELECT NULL AS [ID] -- Return NULL for all primary key fields to indicate no record was deleted
    ELSE
        SELECT @ID AS [ID] -- Return the primary key values to indicate we successfully deleted the record
END
GO
GRANT EXECUTE ON [__mj_BizAppsReferrals].[spDeletePracticeArea] TO [cdp_Developer], [cdp_Integration];

/* spDelete Permissions for MJ_BizApps_Referrals: Practice Areas */

GRANT EXECUTE ON [__mj_BizAppsReferrals].[spDeletePracticeArea] TO [cdp_Developer], [cdp_Integration];

/* Index for Foreign Keys for ProfessionalJurisdiction */
-----------------------------------------------------------------
-- SQL Code Generation
-- Entity: MJ_BizApps_Referrals: Professional Jurisdictions
-- Item: Index for Foreign Keys
--
-- This was generated by the MemberJunction CodeGen tool.
-- This file should NOT be edited by hand.
-----------------------------------------------------------------
-- Index for foreign key ProfessionalProfileID in table ProfessionalJurisdiction
IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'IDX_AUTO_MJ_FKEY_ProfessionalJurisdiction_ProfessionalProfileID' 
    AND object_id = OBJECT_ID('[__mj_BizAppsReferrals].[ProfessionalJurisdiction]')
)
CREATE INDEX IDX_AUTO_MJ_FKEY_ProfessionalJurisdiction_ProfessionalProfileID ON [__mj_BizAppsReferrals].[ProfessionalJurisdiction] ([ProfessionalProfileID]);

-- Index for foreign key JurisdictionID in table ProfessionalJurisdiction
IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'IDX_AUTO_MJ_FKEY_ProfessionalJurisdiction_JurisdictionID' 
    AND object_id = OBJECT_ID('[__mj_BizAppsReferrals].[ProfessionalJurisdiction]')
)
CREATE INDEX IDX_AUTO_MJ_FKEY_ProfessionalJurisdiction_JurisdictionID ON [__mj_BizAppsReferrals].[ProfessionalJurisdiction] ([JurisdictionID]);

/* Base View SQL for MJ_BizApps_Referrals: Professional Jurisdictions */
-----------------------------------------------------------------
-- SQL Code Generation
-- Entity: MJ_BizApps_Referrals: Professional Jurisdictions
-- Item: vwProfessionalJurisdictions
--
-- This was generated by the MemberJunction CodeGen tool.
-- This file should NOT be edited by hand.
-----------------------------------------------------------------

------------------------------------------------------------
----- BASE VIEW FOR ENTITY:      MJ_BizApps_Referrals: Professional Jurisdictions
-----               SCHEMA:      __mj_BizAppsReferrals
-----               BASE TABLE:  ProfessionalJurisdiction
-----               PRIMARY KEY: ID
------------------------------------------------------------
IF OBJECT_ID('[__mj_BizAppsReferrals].[vwProfessionalJurisdictions]', 'V') IS NOT NULL
    DROP VIEW [__mj_BizAppsReferrals].[vwProfessionalJurisdictions];
GO

CREATE VIEW [__mj_BizAppsReferrals].[vwProfessionalJurisdictions]
AS
SELECT
    p.*,
    mjBizAppsReferralsJurisdiction_JurisdictionID.[Name] AS [Jurisdiction]
FROM
    [__mj_BizAppsReferrals].[ProfessionalJurisdiction] AS p
LEFT OUTER JOIN
    [__mj_BizAppsReferrals].[Jurisdiction] AS mjBizAppsReferralsJurisdiction_JurisdictionID
  ON
    [p].[JurisdictionID] = mjBizAppsReferralsJurisdiction_JurisdictionID.[ID]
GO
GRANT SELECT ON [__mj_BizAppsReferrals].[vwProfessionalJurisdictions] TO [cdp_UI], [cdp_Developer], [cdp_Integration];

/* Base View Permissions SQL for MJ_BizApps_Referrals: Professional Jurisdictions */
-----------------------------------------------------------------
-- SQL Code Generation
-- Entity: MJ_BizApps_Referrals: Professional Jurisdictions
-- Item: Permissions for vwProfessionalJurisdictions
--
-- This was generated by the MemberJunction CodeGen tool.
-- This file should NOT be edited by hand.
-----------------------------------------------------------------

GRANT SELECT ON [__mj_BizAppsReferrals].[vwProfessionalJurisdictions] TO [cdp_UI], [cdp_Developer], [cdp_Integration];

/* spCreate SQL for MJ_BizApps_Referrals: Professional Jurisdictions */
-----------------------------------------------------------------
-- SQL Code Generation
-- Entity: MJ_BizApps_Referrals: Professional Jurisdictions
-- Item: spCreateProfessionalJurisdiction
--
-- This was generated by the MemberJunction CodeGen tool.
-- This file should NOT be edited by hand.
-----------------------------------------------------------------

------------------------------------------------------------
----- CREATE PROCEDURE FOR ProfessionalJurisdiction
------------------------------------------------------------
IF OBJECT_ID('[__mj_BizAppsReferrals].[spCreateProfessionalJurisdiction]', 'P') IS NOT NULL
    DROP PROCEDURE [__mj_BizAppsReferrals].[spCreateProfessionalJurisdiction];
GO

CREATE PROCEDURE [__mj_BizAppsReferrals].[spCreateProfessionalJurisdiction]
    @ID uniqueidentifier = NULL,
    @ProfessionalProfileID uniqueidentifier,
    @JurisdictionID uniqueidentifier,
    @LicenseNumber_Clear bit = 0,
    @LicenseNumber nvarchar(100) = NULL,
    @AdmissionYear_Clear bit = 0,
    @AdmissionYear int = NULL,
    @StandingStatus nvarchar(30) = NULL,
    @IsPrimary bit = NULL
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @InsertedRow TABLE ([ID] UNIQUEIDENTIFIER)

    IF @ID IS NOT NULL
    BEGIN
        -- User provided a value, use it
        INSERT INTO [__mj_BizAppsReferrals].[ProfessionalJurisdiction]
            (
                [ID],
                [ProfessionalProfileID],
                [JurisdictionID],
                [LicenseNumber],
                [AdmissionYear],
                [StandingStatus],
                [IsPrimary]
            )
        OUTPUT INSERTED.[ID] INTO @InsertedRow
        VALUES
            (
                @ID,
                @ProfessionalProfileID,
                @JurisdictionID,
                CASE WHEN @LicenseNumber_Clear = 1 THEN NULL ELSE ISNULL(@LicenseNumber, NULL) END,
                CASE WHEN @AdmissionYear_Clear = 1 THEN NULL ELSE ISNULL(@AdmissionYear, NULL) END,
                ISNULL(@StandingStatus, 'GoodStanding'),
                ISNULL(@IsPrimary, 0)
            )
    END
    ELSE
    BEGIN
        -- No value provided, let database use its default (e.g., NEWSEQUENTIALID())
        INSERT INTO [__mj_BizAppsReferrals].[ProfessionalJurisdiction]
            (
                [ProfessionalProfileID],
                [JurisdictionID],
                [LicenseNumber],
                [AdmissionYear],
                [StandingStatus],
                [IsPrimary]
            )
        OUTPUT INSERTED.[ID] INTO @InsertedRow
        VALUES
            (
                @ProfessionalProfileID,
                @JurisdictionID,
                CASE WHEN @LicenseNumber_Clear = 1 THEN NULL ELSE ISNULL(@LicenseNumber, NULL) END,
                CASE WHEN @AdmissionYear_Clear = 1 THEN NULL ELSE ISNULL(@AdmissionYear, NULL) END,
                ISNULL(@StandingStatus, 'GoodStanding'),
                ISNULL(@IsPrimary, 0)
            )
    END
    -- return the new record from the base view, which might have some calculated fields
    SELECT * FROM [__mj_BizAppsReferrals].[vwProfessionalJurisdictions] WHERE [ID] = (SELECT [ID] FROM @InsertedRow)
END
GO
GRANT EXECUTE ON [__mj_BizAppsReferrals].[spCreateProfessionalJurisdiction] TO [cdp_Developer], [cdp_Integration];

/* spCreate Permissions for MJ_BizApps_Referrals: Professional Jurisdictions */

GRANT EXECUTE ON [__mj_BizAppsReferrals].[spCreateProfessionalJurisdiction] TO [cdp_Developer], [cdp_Integration];

/* spUpdate SQL for MJ_BizApps_Referrals: Professional Jurisdictions */
-----------------------------------------------------------------
-- SQL Code Generation
-- Entity: MJ_BizApps_Referrals: Professional Jurisdictions
-- Item: spUpdateProfessionalJurisdiction
--
-- This was generated by the MemberJunction CodeGen tool.
-- This file should NOT be edited by hand.
-----------------------------------------------------------------

------------------------------------------------------------
----- UPDATE PROCEDURE FOR ProfessionalJurisdiction
------------------------------------------------------------
IF OBJECT_ID('[__mj_BizAppsReferrals].[spUpdateProfessionalJurisdiction]', 'P') IS NOT NULL
    DROP PROCEDURE [__mj_BizAppsReferrals].[spUpdateProfessionalJurisdiction];
GO

CREATE PROCEDURE [__mj_BizAppsReferrals].[spUpdateProfessionalJurisdiction]
    @ID uniqueidentifier,
    @ProfessionalProfileID uniqueidentifier = NULL,
    @JurisdictionID uniqueidentifier = NULL,
    @LicenseNumber_Clear bit = 0,
    @LicenseNumber nvarchar(100) = NULL,
    @AdmissionYear_Clear bit = 0,
    @AdmissionYear int = NULL,
    @StandingStatus nvarchar(30) = NULL,
    @IsPrimary bit = NULL
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE
        [__mj_BizAppsReferrals].[ProfessionalJurisdiction]
    SET
        [ProfessionalProfileID] = ISNULL(@ProfessionalProfileID, [ProfessionalProfileID]),
        [JurisdictionID] = ISNULL(@JurisdictionID, [JurisdictionID]),
        [LicenseNumber] = CASE WHEN @LicenseNumber_Clear = 1 THEN NULL ELSE ISNULL(@LicenseNumber, [LicenseNumber]) END,
        [AdmissionYear] = CASE WHEN @AdmissionYear_Clear = 1 THEN NULL ELSE ISNULL(@AdmissionYear, [AdmissionYear]) END,
        [StandingStatus] = ISNULL(@StandingStatus, [StandingStatus]),
        [IsPrimary] = ISNULL(@IsPrimary, [IsPrimary]),
        [__mj_UpdatedAt] = GETUTCDATE()
    WHERE
        [ID] = @ID

    -- Check if the update was successful
    IF @@ROWCOUNT = 0
        -- Nothing was updated, return no rows, but column structure from base view intact, semantically correct this way.
        SELECT TOP 0 * FROM [__mj_BizAppsReferrals].[vwProfessionalJurisdictions] WHERE 1=0
    ELSE
        -- Return the updated record so the caller can see the updated values and any calculated fields
        SELECT
                                        *
                                    FROM
                                        [__mj_BizAppsReferrals].[vwProfessionalJurisdictions]
                                    WHERE
                                        [ID] = @ID
                                    
END
GO

GRANT EXECUTE ON [__mj_BizAppsReferrals].[spUpdateProfessionalJurisdiction] TO [cdp_Developer], [cdp_Integration]
GO

------------------------------------------------------------
----- TRIGGER FOR __mj_UpdatedAt field for the ProfessionalJurisdiction table
------------------------------------------------------------
IF OBJECT_ID('[__mj_BizAppsReferrals].[trgUpdateProfessionalJurisdiction]', 'TR') IS NOT NULL
    DROP TRIGGER [__mj_BizAppsReferrals].[trgUpdateProfessionalJurisdiction];
GO
CREATE TRIGGER [__mj_BizAppsReferrals].trgUpdateProfessionalJurisdiction
ON [__mj_BizAppsReferrals].[ProfessionalJurisdiction]
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    IF NOT UPDATE([__mj_UpdatedAt])
    BEGIN
        UPDATE
            [__mj_BizAppsReferrals].[ProfessionalJurisdiction]
        SET
            __mj_UpdatedAt = GETUTCDATE()
        FROM
            [__mj_BizAppsReferrals].[ProfessionalJurisdiction] AS _organicTable
        INNER JOIN
            INSERTED AS I ON
            _organicTable.[ID] = I.[ID];
    END
END;
GO

/* spUpdate Permissions for MJ_BizApps_Referrals: Professional Jurisdictions */

GRANT EXECUTE ON [__mj_BizAppsReferrals].[spUpdateProfessionalJurisdiction] TO [cdp_Developer], [cdp_Integration];

/* spDelete SQL for MJ_BizApps_Referrals: Professional Jurisdictions */
-----------------------------------------------------------------
-- SQL Code Generation
-- Entity: MJ_BizApps_Referrals: Professional Jurisdictions
-- Item: spDeleteProfessionalJurisdiction
--
-- This was generated by the MemberJunction CodeGen tool.
-- This file should NOT be edited by hand.
-----------------------------------------------------------------

------------------------------------------------------------
----- DELETE PROCEDURE FOR ProfessionalJurisdiction
------------------------------------------------------------
IF OBJECT_ID('[__mj_BizAppsReferrals].[spDeleteProfessionalJurisdiction]', 'P') IS NOT NULL
    DROP PROCEDURE [__mj_BizAppsReferrals].[spDeleteProfessionalJurisdiction];
GO

CREATE PROCEDURE [__mj_BizAppsReferrals].[spDeleteProfessionalJurisdiction]
    @ID uniqueidentifier
AS
BEGIN
    SET NOCOUNT ON;

    DELETE FROM
        [__mj_BizAppsReferrals].[ProfessionalJurisdiction]
    WHERE
        [ID] = @ID


    -- Check if the delete was successful
    IF @@ROWCOUNT = 0
        SELECT NULL AS [ID] -- Return NULL for all primary key fields to indicate no record was deleted
    ELSE
        SELECT @ID AS [ID] -- Return the primary key values to indicate we successfully deleted the record
END
GO
GRANT EXECUTE ON [__mj_BizAppsReferrals].[spDeleteProfessionalJurisdiction] TO [cdp_Developer], [cdp_Integration];

/* spDelete Permissions for MJ_BizApps_Referrals: Professional Jurisdictions */

GRANT EXECUTE ON [__mj_BizAppsReferrals].[spDeleteProfessionalJurisdiction] TO [cdp_Developer], [cdp_Integration];

/* Index for Foreign Keys for ProfessionalPracticeArea */
-----------------------------------------------------------------
-- SQL Code Generation
-- Entity: MJ_BizApps_Referrals: Professional Practice Areas
-- Item: Index for Foreign Keys
--
-- This was generated by the MemberJunction CodeGen tool.
-- This file should NOT be edited by hand.
-----------------------------------------------------------------
-- Index for foreign key ProfessionalProfileID in table ProfessionalPracticeArea
IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'IDX_AUTO_MJ_FKEY_ProfessionalPracticeArea_ProfessionalProfileID' 
    AND object_id = OBJECT_ID('[__mj_BizAppsReferrals].[ProfessionalPracticeArea]')
)
CREATE INDEX IDX_AUTO_MJ_FKEY_ProfessionalPracticeArea_ProfessionalProfileID ON [__mj_BizAppsReferrals].[ProfessionalPracticeArea] ([ProfessionalProfileID]);

-- Index for foreign key PracticeAreaID in table ProfessionalPracticeArea
IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'IDX_AUTO_MJ_FKEY_ProfessionalPracticeArea_PracticeAreaID' 
    AND object_id = OBJECT_ID('[__mj_BizAppsReferrals].[ProfessionalPracticeArea]')
)
CREATE INDEX IDX_AUTO_MJ_FKEY_ProfessionalPracticeArea_PracticeAreaID ON [__mj_BizAppsReferrals].[ProfessionalPracticeArea] ([PracticeAreaID]);

/* Base View SQL for MJ_BizApps_Referrals: Professional Practice Areas */
-----------------------------------------------------------------
-- SQL Code Generation
-- Entity: MJ_BizApps_Referrals: Professional Practice Areas
-- Item: vwProfessionalPracticeAreas
--
-- This was generated by the MemberJunction CodeGen tool.
-- This file should NOT be edited by hand.
-----------------------------------------------------------------

------------------------------------------------------------
----- BASE VIEW FOR ENTITY:      MJ_BizApps_Referrals: Professional Practice Areas
-----               SCHEMA:      __mj_BizAppsReferrals
-----               BASE TABLE:  ProfessionalPracticeArea
-----               PRIMARY KEY: ID
------------------------------------------------------------
IF OBJECT_ID('[__mj_BizAppsReferrals].[vwProfessionalPracticeAreas]', 'V') IS NOT NULL
    DROP VIEW [__mj_BizAppsReferrals].[vwProfessionalPracticeAreas];
GO

CREATE VIEW [__mj_BizAppsReferrals].[vwProfessionalPracticeAreas]
AS
SELECT
    p.*,
    mjBizAppsReferralsPracticeArea_PracticeAreaID.[Name] AS [PracticeArea]
FROM
    [__mj_BizAppsReferrals].[ProfessionalPracticeArea] AS p
LEFT OUTER JOIN
    [__mj_BizAppsReferrals].[PracticeArea] AS mjBizAppsReferralsPracticeArea_PracticeAreaID
  ON
    [p].[PracticeAreaID] = mjBizAppsReferralsPracticeArea_PracticeAreaID.[ID]
GO
GRANT SELECT ON [__mj_BizAppsReferrals].[vwProfessionalPracticeAreas] TO [cdp_UI], [cdp_Developer], [cdp_Integration];

/* Base View Permissions SQL for MJ_BizApps_Referrals: Professional Practice Areas */
-----------------------------------------------------------------
-- SQL Code Generation
-- Entity: MJ_BizApps_Referrals: Professional Practice Areas
-- Item: Permissions for vwProfessionalPracticeAreas
--
-- This was generated by the MemberJunction CodeGen tool.
-- This file should NOT be edited by hand.
-----------------------------------------------------------------

GRANT SELECT ON [__mj_BizAppsReferrals].[vwProfessionalPracticeAreas] TO [cdp_UI], [cdp_Developer], [cdp_Integration];

/* spCreate SQL for MJ_BizApps_Referrals: Professional Practice Areas */
-----------------------------------------------------------------
-- SQL Code Generation
-- Entity: MJ_BizApps_Referrals: Professional Practice Areas
-- Item: spCreateProfessionalPracticeArea
--
-- This was generated by the MemberJunction CodeGen tool.
-- This file should NOT be edited by hand.
-----------------------------------------------------------------

------------------------------------------------------------
----- CREATE PROCEDURE FOR ProfessionalPracticeArea
------------------------------------------------------------
IF OBJECT_ID('[__mj_BizAppsReferrals].[spCreateProfessionalPracticeArea]', 'P') IS NOT NULL
    DROP PROCEDURE [__mj_BizAppsReferrals].[spCreateProfessionalPracticeArea];
GO

CREATE PROCEDURE [__mj_BizAppsReferrals].[spCreateProfessionalPracticeArea]
    @ID uniqueidentifier = NULL,
    @ProfessionalProfileID uniqueidentifier,
    @PracticeAreaID uniqueidentifier,
    @ProficiencyLevel nvarchar(30) = NULL,
    @YearsInPractice int = NULL,
    @IsPrimary bit = NULL
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @InsertedRow TABLE ([ID] UNIQUEIDENTIFIER)

    IF @ID IS NOT NULL
    BEGIN
        -- User provided a value, use it
        INSERT INTO [__mj_BizAppsReferrals].[ProfessionalPracticeArea]
            (
                [ID],
                [ProfessionalProfileID],
                [PracticeAreaID],
                [ProficiencyLevel],
                [YearsInPractice],
                [IsPrimary]
            )
        OUTPUT INSERTED.[ID] INTO @InsertedRow
        VALUES
            (
                @ID,
                @ProfessionalProfileID,
                @PracticeAreaID,
                ISNULL(@ProficiencyLevel, 'Standard'),
                ISNULL(@YearsInPractice, 0),
                ISNULL(@IsPrimary, 0)
            )
    END
    ELSE
    BEGIN
        -- No value provided, let database use its default (e.g., NEWSEQUENTIALID())
        INSERT INTO [__mj_BizAppsReferrals].[ProfessionalPracticeArea]
            (
                [ProfessionalProfileID],
                [PracticeAreaID],
                [ProficiencyLevel],
                [YearsInPractice],
                [IsPrimary]
            )
        OUTPUT INSERTED.[ID] INTO @InsertedRow
        VALUES
            (
                @ProfessionalProfileID,
                @PracticeAreaID,
                ISNULL(@ProficiencyLevel, 'Standard'),
                ISNULL(@YearsInPractice, 0),
                ISNULL(@IsPrimary, 0)
            )
    END
    -- return the new record from the base view, which might have some calculated fields
    SELECT * FROM [__mj_BizAppsReferrals].[vwProfessionalPracticeAreas] WHERE [ID] = (SELECT [ID] FROM @InsertedRow)
END
GO
GRANT EXECUTE ON [__mj_BizAppsReferrals].[spCreateProfessionalPracticeArea] TO [cdp_Developer], [cdp_Integration];

/* spCreate Permissions for MJ_BizApps_Referrals: Professional Practice Areas */

GRANT EXECUTE ON [__mj_BizAppsReferrals].[spCreateProfessionalPracticeArea] TO [cdp_Developer], [cdp_Integration];

/* spUpdate SQL for MJ_BizApps_Referrals: Professional Practice Areas */
-----------------------------------------------------------------
-- SQL Code Generation
-- Entity: MJ_BizApps_Referrals: Professional Practice Areas
-- Item: spUpdateProfessionalPracticeArea
--
-- This was generated by the MemberJunction CodeGen tool.
-- This file should NOT be edited by hand.
-----------------------------------------------------------------

------------------------------------------------------------
----- UPDATE PROCEDURE FOR ProfessionalPracticeArea
------------------------------------------------------------
IF OBJECT_ID('[__mj_BizAppsReferrals].[spUpdateProfessionalPracticeArea]', 'P') IS NOT NULL
    DROP PROCEDURE [__mj_BizAppsReferrals].[spUpdateProfessionalPracticeArea];
GO

CREATE PROCEDURE [__mj_BizAppsReferrals].[spUpdateProfessionalPracticeArea]
    @ID uniqueidentifier,
    @ProfessionalProfileID uniqueidentifier = NULL,
    @PracticeAreaID uniqueidentifier = NULL,
    @ProficiencyLevel nvarchar(30) = NULL,
    @YearsInPractice int = NULL,
    @IsPrimary bit = NULL
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE
        [__mj_BizAppsReferrals].[ProfessionalPracticeArea]
    SET
        [ProfessionalProfileID] = ISNULL(@ProfessionalProfileID, [ProfessionalProfileID]),
        [PracticeAreaID] = ISNULL(@PracticeAreaID, [PracticeAreaID]),
        [ProficiencyLevel] = ISNULL(@ProficiencyLevel, [ProficiencyLevel]),
        [YearsInPractice] = ISNULL(@YearsInPractice, [YearsInPractice]),
        [IsPrimary] = ISNULL(@IsPrimary, [IsPrimary]),
        [__mj_UpdatedAt] = GETUTCDATE()
    WHERE
        [ID] = @ID

    -- Check if the update was successful
    IF @@ROWCOUNT = 0
        -- Nothing was updated, return no rows, but column structure from base view intact, semantically correct this way.
        SELECT TOP 0 * FROM [__mj_BizAppsReferrals].[vwProfessionalPracticeAreas] WHERE 1=0
    ELSE
        -- Return the updated record so the caller can see the updated values and any calculated fields
        SELECT
                                        *
                                    FROM
                                        [__mj_BizAppsReferrals].[vwProfessionalPracticeAreas]
                                    WHERE
                                        [ID] = @ID
                                    
END
GO

GRANT EXECUTE ON [__mj_BizAppsReferrals].[spUpdateProfessionalPracticeArea] TO [cdp_Developer], [cdp_Integration]
GO

------------------------------------------------------------
----- TRIGGER FOR __mj_UpdatedAt field for the ProfessionalPracticeArea table
------------------------------------------------------------
IF OBJECT_ID('[__mj_BizAppsReferrals].[trgUpdateProfessionalPracticeArea]', 'TR') IS NOT NULL
    DROP TRIGGER [__mj_BizAppsReferrals].[trgUpdateProfessionalPracticeArea];
GO
CREATE TRIGGER [__mj_BizAppsReferrals].trgUpdateProfessionalPracticeArea
ON [__mj_BizAppsReferrals].[ProfessionalPracticeArea]
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    IF NOT UPDATE([__mj_UpdatedAt])
    BEGIN
        UPDATE
            [__mj_BizAppsReferrals].[ProfessionalPracticeArea]
        SET
            __mj_UpdatedAt = GETUTCDATE()
        FROM
            [__mj_BizAppsReferrals].[ProfessionalPracticeArea] AS _organicTable
        INNER JOIN
            INSERTED AS I ON
            _organicTable.[ID] = I.[ID];
    END
END;
GO

/* spUpdate Permissions for MJ_BizApps_Referrals: Professional Practice Areas */

GRANT EXECUTE ON [__mj_BizAppsReferrals].[spUpdateProfessionalPracticeArea] TO [cdp_Developer], [cdp_Integration];

/* spDelete SQL for MJ_BizApps_Referrals: Professional Practice Areas */
-----------------------------------------------------------------
-- SQL Code Generation
-- Entity: MJ_BizApps_Referrals: Professional Practice Areas
-- Item: spDeleteProfessionalPracticeArea
--
-- This was generated by the MemberJunction CodeGen tool.
-- This file should NOT be edited by hand.
-----------------------------------------------------------------

------------------------------------------------------------
----- DELETE PROCEDURE FOR ProfessionalPracticeArea
------------------------------------------------------------
IF OBJECT_ID('[__mj_BizAppsReferrals].[spDeleteProfessionalPracticeArea]', 'P') IS NOT NULL
    DROP PROCEDURE [__mj_BizAppsReferrals].[spDeleteProfessionalPracticeArea];
GO

CREATE PROCEDURE [__mj_BizAppsReferrals].[spDeleteProfessionalPracticeArea]
    @ID uniqueidentifier
AS
BEGIN
    SET NOCOUNT ON;

    DELETE FROM
        [__mj_BizAppsReferrals].[ProfessionalPracticeArea]
    WHERE
        [ID] = @ID


    -- Check if the delete was successful
    IF @@ROWCOUNT = 0
        SELECT NULL AS [ID] -- Return NULL for all primary key fields to indicate no record was deleted
    ELSE
        SELECT @ID AS [ID] -- Return the primary key values to indicate we successfully deleted the record
END
GO
GRANT EXECUTE ON [__mj_BizAppsReferrals].[spDeleteProfessionalPracticeArea] TO [cdp_Developer], [cdp_Integration];

/* spDelete Permissions for MJ_BizApps_Referrals: Professional Practice Areas */

GRANT EXECUTE ON [__mj_BizAppsReferrals].[spDeleteProfessionalPracticeArea] TO [cdp_Developer], [cdp_Integration];

/* Index for Foreign Keys for ProfessionalProfile */
-----------------------------------------------------------------
-- SQL Code Generation
-- Entity: MJ_BizApps_Referrals: Professional Profiles
-- Item: Index for Foreign Keys
--
-- This was generated by the MemberJunction CodeGen tool.
-- This file should NOT be edited by hand.
-----------------------------------------------------------------
-- Index for foreign key PersonID in table ProfessionalProfile
IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'IDX_AUTO_MJ_FKEY_ProfessionalProfile_PersonID' 
    AND object_id = OBJECT_ID('[__mj_BizAppsReferrals].[ProfessionalProfile]')
)
CREATE INDEX IDX_AUTO_MJ_FKEY_ProfessionalProfile_PersonID ON [__mj_BizAppsReferrals].[ProfessionalProfile] ([PersonID]);

-- Index for foreign key OrganizationID in table ProfessionalProfile
IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'IDX_AUTO_MJ_FKEY_ProfessionalProfile_OrganizationID' 
    AND object_id = OBJECT_ID('[__mj_BizAppsReferrals].[ProfessionalProfile]')
)
CREATE INDEX IDX_AUTO_MJ_FKEY_ProfessionalProfile_OrganizationID ON [__mj_BizAppsReferrals].[ProfessionalProfile] ([OrganizationID]);

-- Index for foreign key UserID in table ProfessionalProfile
IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'IDX_AUTO_MJ_FKEY_ProfessionalProfile_UserID' 
    AND object_id = OBJECT_ID('[__mj_BizAppsReferrals].[ProfessionalProfile]')
)
CREATE INDEX IDX_AUTO_MJ_FKEY_ProfessionalProfile_UserID ON [__mj_BizAppsReferrals].[ProfessionalProfile] ([UserID]);

/* Base View SQL for MJ_BizApps_Referrals: Professional Profiles */
-----------------------------------------------------------------
-- SQL Code Generation
-- Entity: MJ_BizApps_Referrals: Professional Profiles
-- Item: vwProfessionalProfiles
--
-- This was generated by the MemberJunction CodeGen tool.
-- This file should NOT be edited by hand.
-----------------------------------------------------------------

------------------------------------------------------------
----- BASE VIEW FOR ENTITY:      MJ_BizApps_Referrals: Professional Profiles
-----               SCHEMA:      __mj_BizAppsReferrals
-----               BASE TABLE:  ProfessionalProfile
-----               PRIMARY KEY: ID
------------------------------------------------------------
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
  ON
    [p].[PersonID] = mjBizAppsCommonPerson_PersonID.[ID]
LEFT OUTER JOIN
    [__mj_BizAppsCommon].[Organization] AS mjBizAppsCommonOrganization_OrganizationID
  ON
    [p].[OrganizationID] = mjBizAppsCommonOrganization_OrganizationID.[ID]
LEFT OUTER JOIN
    [${flyway:defaultSchema}].[User] AS MJUser_UserID
  ON
    [p].[UserID] = MJUser_UserID.[ID]
GO
GRANT SELECT ON [__mj_BizAppsReferrals].[vwProfessionalProfiles] TO [cdp_UI], [cdp_Developer], [cdp_Integration];

/* Base View Permissions SQL for MJ_BizApps_Referrals: Professional Profiles */
-----------------------------------------------------------------
-- SQL Code Generation
-- Entity: MJ_BizApps_Referrals: Professional Profiles
-- Item: Permissions for vwProfessionalProfiles
--
-- This was generated by the MemberJunction CodeGen tool.
-- This file should NOT be edited by hand.
-----------------------------------------------------------------

GRANT SELECT ON [__mj_BizAppsReferrals].[vwProfessionalProfiles] TO [cdp_UI], [cdp_Developer], [cdp_Integration];

/* spCreate SQL for MJ_BizApps_Referrals: Professional Profiles */
-----------------------------------------------------------------
-- SQL Code Generation
-- Entity: MJ_BizApps_Referrals: Professional Profiles
-- Item: spCreateProfessionalProfile
--
-- This was generated by the MemberJunction CodeGen tool.
-- This file should NOT be edited by hand.
-----------------------------------------------------------------

------------------------------------------------------------
----- CREATE PROCEDURE FOR ProfessionalProfile
------------------------------------------------------------
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
    @BarOrLicenseNumber_Clear bit = 0,
    @BarOrLicenseNumber nvarchar(100) = NULL,
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
    DECLARE @InsertedRow TABLE ([ID] UNIQUEIDENTIFIER)

    IF @ID IS NOT NULL
    BEGIN
        -- User provided a value, use it
        INSERT INTO [__mj_BizAppsReferrals].[ProfessionalProfile]
            (
                [ID],
                [PersonID],
                [OrganizationID],
                [UserID],
                [DisplayName],
                [FirmName],
                [Email],
                [Phone],
                [BarOrLicenseNumber],
                [VerificationStatus],
                [AvailabilityStatus],
                [Bio],
                [YearsExperience],
                [Languages],
                [HourlyRateMin],
                [HourlyRateMax],
                [AcceptsProBono],
                [AcceptsContingency],
                [ActiveReferralCount],
                [MaxConcurrentReferrals],
                [AverageResponseHours],
                [AverageRating],
                [TotalAcceptedCount],
                [TotalCompletedCount],
                [IsActive]
            )
        OUTPUT INSERTED.[ID] INTO @InsertedRow
        VALUES
            (
                @ID,
                CASE WHEN @PersonID_Clear = 1 THEN NULL ELSE ISNULL(@PersonID, NULL) END,
                CASE WHEN @OrganizationID_Clear = 1 THEN NULL ELSE ISNULL(@OrganizationID, NULL) END,
                CASE WHEN @UserID_Clear = 1 THEN NULL ELSE ISNULL(@UserID, NULL) END,
                @DisplayName,
                CASE WHEN @FirmName_Clear = 1 THEN NULL ELSE ISNULL(@FirmName, NULL) END,
                @Email,
                CASE WHEN @Phone_Clear = 1 THEN NULL ELSE ISNULL(@Phone, NULL) END,
                CASE WHEN @BarOrLicenseNumber_Clear = 1 THEN NULL ELSE ISNULL(@BarOrLicenseNumber, NULL) END,
                ISNULL(@VerificationStatus, 'Pending'),
                ISNULL(@AvailabilityStatus, 'Available'),
                CASE WHEN @Bio_Clear = 1 THEN NULL ELSE ISNULL(@Bio, NULL) END,
                ISNULL(@YearsExperience, 0),
                CASE WHEN @Languages_Clear = 1 THEN NULL ELSE ISNULL(@Languages, 'English') END,
                CASE WHEN @HourlyRateMin_Clear = 1 THEN NULL ELSE ISNULL(@HourlyRateMin, NULL) END,
                CASE WHEN @HourlyRateMax_Clear = 1 THEN NULL ELSE ISNULL(@HourlyRateMax, NULL) END,
                ISNULL(@AcceptsProBono, 0),
                ISNULL(@AcceptsContingency, 0),
                ISNULL(@ActiveReferralCount, 0),
                ISNULL(@MaxConcurrentReferrals, 10),
                CASE WHEN @AverageResponseHours_Clear = 1 THEN NULL ELSE ISNULL(@AverageResponseHours, NULL) END,
                CASE WHEN @AverageRating_Clear = 1 THEN NULL ELSE ISNULL(@AverageRating, NULL) END,
                ISNULL(@TotalAcceptedCount, 0),
                ISNULL(@TotalCompletedCount, 0),
                ISNULL(@IsActive, 1)
            )
    END
    ELSE
    BEGIN
        -- No value provided, let database use its default (e.g., NEWSEQUENTIALID())
        INSERT INTO [__mj_BizAppsReferrals].[ProfessionalProfile]
            (
                [PersonID],
                [OrganizationID],
                [UserID],
                [DisplayName],
                [FirmName],
                [Email],
                [Phone],
                [BarOrLicenseNumber],
                [VerificationStatus],
                [AvailabilityStatus],
                [Bio],
                [YearsExperience],
                [Languages],
                [HourlyRateMin],
                [HourlyRateMax],
                [AcceptsProBono],
                [AcceptsContingency],
                [ActiveReferralCount],
                [MaxConcurrentReferrals],
                [AverageResponseHours],
                [AverageRating],
                [TotalAcceptedCount],
                [TotalCompletedCount],
                [IsActive]
            )
        OUTPUT INSERTED.[ID] INTO @InsertedRow
        VALUES
            (
                CASE WHEN @PersonID_Clear = 1 THEN NULL ELSE ISNULL(@PersonID, NULL) END,
                CASE WHEN @OrganizationID_Clear = 1 THEN NULL ELSE ISNULL(@OrganizationID, NULL) END,
                CASE WHEN @UserID_Clear = 1 THEN NULL ELSE ISNULL(@UserID, NULL) END,
                @DisplayName,
                CASE WHEN @FirmName_Clear = 1 THEN NULL ELSE ISNULL(@FirmName, NULL) END,
                @Email,
                CASE WHEN @Phone_Clear = 1 THEN NULL ELSE ISNULL(@Phone, NULL) END,
                CASE WHEN @BarOrLicenseNumber_Clear = 1 THEN NULL ELSE ISNULL(@BarOrLicenseNumber, NULL) END,
                ISNULL(@VerificationStatus, 'Pending'),
                ISNULL(@AvailabilityStatus, 'Available'),
                CASE WHEN @Bio_Clear = 1 THEN NULL ELSE ISNULL(@Bio, NULL) END,
                ISNULL(@YearsExperience, 0),
                CASE WHEN @Languages_Clear = 1 THEN NULL ELSE ISNULL(@Languages, 'English') END,
                CASE WHEN @HourlyRateMin_Clear = 1 THEN NULL ELSE ISNULL(@HourlyRateMin, NULL) END,
                CASE WHEN @HourlyRateMax_Clear = 1 THEN NULL ELSE ISNULL(@HourlyRateMax, NULL) END,
                ISNULL(@AcceptsProBono, 0),
                ISNULL(@AcceptsContingency, 0),
                ISNULL(@ActiveReferralCount, 0),
                ISNULL(@MaxConcurrentReferrals, 10),
                CASE WHEN @AverageResponseHours_Clear = 1 THEN NULL ELSE ISNULL(@AverageResponseHours, NULL) END,
                CASE WHEN @AverageRating_Clear = 1 THEN NULL ELSE ISNULL(@AverageRating, NULL) END,
                ISNULL(@TotalAcceptedCount, 0),
                ISNULL(@TotalCompletedCount, 0),
                ISNULL(@IsActive, 1)
            )
    END
    -- return the new record from the base view, which might have some calculated fields
    SELECT * FROM [__mj_BizAppsReferrals].[vwProfessionalProfiles] WHERE [ID] = (SELECT [ID] FROM @InsertedRow)
END
GO
GRANT EXECUTE ON [__mj_BizAppsReferrals].[spCreateProfessionalProfile] TO [cdp_Developer], [cdp_Integration];

/* spCreate Permissions for MJ_BizApps_Referrals: Professional Profiles */

GRANT EXECUTE ON [__mj_BizAppsReferrals].[spCreateProfessionalProfile] TO [cdp_Developer], [cdp_Integration];

/* spUpdate SQL for MJ_BizApps_Referrals: Professional Profiles */
-----------------------------------------------------------------
-- SQL Code Generation
-- Entity: MJ_BizApps_Referrals: Professional Profiles
-- Item: spUpdateProfessionalProfile
--
-- This was generated by the MemberJunction CodeGen tool.
-- This file should NOT be edited by hand.
-----------------------------------------------------------------

------------------------------------------------------------
----- UPDATE PROCEDURE FOR ProfessionalProfile
------------------------------------------------------------
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
    @BarOrLicenseNumber_Clear bit = 0,
    @BarOrLicenseNumber nvarchar(100) = NULL,
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
    UPDATE
        [__mj_BizAppsReferrals].[ProfessionalProfile]
    SET
        [PersonID] = CASE WHEN @PersonID_Clear = 1 THEN NULL ELSE ISNULL(@PersonID, [PersonID]) END,
        [OrganizationID] = CASE WHEN @OrganizationID_Clear = 1 THEN NULL ELSE ISNULL(@OrganizationID, [OrganizationID]) END,
        [UserID] = CASE WHEN @UserID_Clear = 1 THEN NULL ELSE ISNULL(@UserID, [UserID]) END,
        [DisplayName] = ISNULL(@DisplayName, [DisplayName]),
        [FirmName] = CASE WHEN @FirmName_Clear = 1 THEN NULL ELSE ISNULL(@FirmName, [FirmName]) END,
        [Email] = ISNULL(@Email, [Email]),
        [Phone] = CASE WHEN @Phone_Clear = 1 THEN NULL ELSE ISNULL(@Phone, [Phone]) END,
        [BarOrLicenseNumber] = CASE WHEN @BarOrLicenseNumber_Clear = 1 THEN NULL ELSE ISNULL(@BarOrLicenseNumber, [BarOrLicenseNumber]) END,
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
    WHERE
        [ID] = @ID

    -- Check if the update was successful
    IF @@ROWCOUNT = 0
        -- Nothing was updated, return no rows, but column structure from base view intact, semantically correct this way.
        SELECT TOP 0 * FROM [__mj_BizAppsReferrals].[vwProfessionalProfiles] WHERE 1=0
    ELSE
        -- Return the updated record so the caller can see the updated values and any calculated fields
        SELECT
                                        *
                                    FROM
                                        [__mj_BizAppsReferrals].[vwProfessionalProfiles]
                                    WHERE
                                        [ID] = @ID
                                    
END
GO

GRANT EXECUTE ON [__mj_BizAppsReferrals].[spUpdateProfessionalProfile] TO [cdp_Developer], [cdp_Integration]
GO

------------------------------------------------------------
----- TRIGGER FOR __mj_UpdatedAt field for the ProfessionalProfile table
------------------------------------------------------------
IF OBJECT_ID('[__mj_BizAppsReferrals].[trgUpdateProfessionalProfile]', 'TR') IS NOT NULL
    DROP TRIGGER [__mj_BizAppsReferrals].[trgUpdateProfessionalProfile];
GO
CREATE TRIGGER [__mj_BizAppsReferrals].trgUpdateProfessionalProfile
ON [__mj_BizAppsReferrals].[ProfessionalProfile]
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    IF NOT UPDATE([__mj_UpdatedAt])
    BEGIN
        UPDATE
            [__mj_BizAppsReferrals].[ProfessionalProfile]
        SET
            __mj_UpdatedAt = GETUTCDATE()
        FROM
            [__mj_BizAppsReferrals].[ProfessionalProfile] AS _organicTable
        INNER JOIN
            INSERTED AS I ON
            _organicTable.[ID] = I.[ID];
    END
END;
GO

/* spUpdate Permissions for MJ_BizApps_Referrals: Professional Profiles */

GRANT EXECUTE ON [__mj_BizAppsReferrals].[spUpdateProfessionalProfile] TO [cdp_Developer], [cdp_Integration];

/* spDelete SQL for MJ_BizApps_Referrals: Professional Profiles */
-----------------------------------------------------------------
-- SQL Code Generation
-- Entity: MJ_BizApps_Referrals: Professional Profiles
-- Item: spDeleteProfessionalProfile
--
-- This was generated by the MemberJunction CodeGen tool.
-- This file should NOT be edited by hand.
-----------------------------------------------------------------

------------------------------------------------------------
----- DELETE PROCEDURE FOR ProfessionalProfile
------------------------------------------------------------
IF OBJECT_ID('[__mj_BizAppsReferrals].[spDeleteProfessionalProfile]', 'P') IS NOT NULL
    DROP PROCEDURE [__mj_BizAppsReferrals].[spDeleteProfessionalProfile];
GO

CREATE PROCEDURE [__mj_BizAppsReferrals].[spDeleteProfessionalProfile]
    @ID uniqueidentifier
AS
BEGIN
    SET NOCOUNT ON;

    DELETE FROM
        [__mj_BizAppsReferrals].[ProfessionalProfile]
    WHERE
        [ID] = @ID


    -- Check if the delete was successful
    IF @@ROWCOUNT = 0
        SELECT NULL AS [ID] -- Return NULL for all primary key fields to indicate no record was deleted
    ELSE
        SELECT @ID AS [ID] -- Return the primary key values to indicate we successfully deleted the record
END
GO
GRANT EXECUTE ON [__mj_BizAppsReferrals].[spDeleteProfessionalProfile] TO [cdp_Developer], [cdp_Integration];

/* spDelete Permissions for MJ_BizApps_Referrals: Professional Profiles */

GRANT EXECUTE ON [__mj_BizAppsReferrals].[spDeleteProfessionalProfile] TO [cdp_Developer], [cdp_Integration];

/* Index for Foreign Keys for ReferralAssignment */
-----------------------------------------------------------------
-- SQL Code Generation
-- Entity: MJ_BizApps_Referrals: Referral Assignments
-- Item: Index for Foreign Keys
--
-- This was generated by the MemberJunction CodeGen tool.
-- This file should NOT be edited by hand.
-----------------------------------------------------------------
-- Index for foreign key ReferralRequestID in table ReferralAssignment
IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'IDX_AUTO_MJ_FKEY_ReferralAssignment_ReferralRequestID' 
    AND object_id = OBJECT_ID('[__mj_BizAppsReferrals].[ReferralAssignment]')
)
CREATE INDEX IDX_AUTO_MJ_FKEY_ReferralAssignment_ReferralRequestID ON [__mj_BizAppsReferrals].[ReferralAssignment] ([ReferralRequestID]);

-- Index for foreign key ProfessionalProfileID in table ReferralAssignment
IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'IDX_AUTO_MJ_FKEY_ReferralAssignment_ProfessionalProfileID' 
    AND object_id = OBJECT_ID('[__mj_BizAppsReferrals].[ReferralAssignment]')
)
CREATE INDEX IDX_AUTO_MJ_FKEY_ReferralAssignment_ProfessionalProfileID ON [__mj_BizAppsReferrals].[ReferralAssignment] ([ProfessionalProfileID]);

/* Base View SQL for MJ_BizApps_Referrals: Referral Assignments */
-----------------------------------------------------------------
-- SQL Code Generation
-- Entity: MJ_BizApps_Referrals: Referral Assignments
-- Item: vwReferralAssignments
--
-- This was generated by the MemberJunction CodeGen tool.
-- This file should NOT be edited by hand.
-----------------------------------------------------------------

------------------------------------------------------------
----- BASE VIEW FOR ENTITY:      MJ_BizApps_Referrals: Referral Assignments
-----               SCHEMA:      __mj_BizAppsReferrals
-----               BASE TABLE:  ReferralAssignment
-----               PRIMARY KEY: ID
------------------------------------------------------------
IF OBJECT_ID('[__mj_BizAppsReferrals].[vwReferralAssignments]', 'V') IS NOT NULL
    DROP VIEW [__mj_BizAppsReferrals].[vwReferralAssignments];
GO

CREATE VIEW [__mj_BizAppsReferrals].[vwReferralAssignments]
AS
SELECT
    r.*
FROM
    [__mj_BizAppsReferrals].[ReferralAssignment] AS r
GO
GRANT SELECT ON [__mj_BizAppsReferrals].[vwReferralAssignments] TO [cdp_UI], [cdp_Developer], [cdp_Integration];

/* Base View Permissions SQL for MJ_BizApps_Referrals: Referral Assignments */
-----------------------------------------------------------------
-- SQL Code Generation
-- Entity: MJ_BizApps_Referrals: Referral Assignments
-- Item: Permissions for vwReferralAssignments
--
-- This was generated by the MemberJunction CodeGen tool.
-- This file should NOT be edited by hand.
-----------------------------------------------------------------

GRANT SELECT ON [__mj_BizAppsReferrals].[vwReferralAssignments] TO [cdp_UI], [cdp_Developer], [cdp_Integration];

/* spCreate SQL for MJ_BizApps_Referrals: Referral Assignments */
-----------------------------------------------------------------
-- SQL Code Generation
-- Entity: MJ_BizApps_Referrals: Referral Assignments
-- Item: spCreateReferralAssignment
--
-- This was generated by the MemberJunction CodeGen tool.
-- This file should NOT be edited by hand.
-----------------------------------------------------------------

------------------------------------------------------------
----- CREATE PROCEDURE FOR ReferralAssignment
------------------------------------------------------------
IF OBJECT_ID('[__mj_BizAppsReferrals].[spCreateReferralAssignment]', 'P') IS NOT NULL
    DROP PROCEDURE [__mj_BizAppsReferrals].[spCreateReferralAssignment];
GO

CREATE PROCEDURE [__mj_BizAppsReferrals].[spCreateReferralAssignment]
    @ID uniqueidentifier = NULL,
    @ReferralRequestID uniqueidentifier,
    @ProfessionalProfileID uniqueidentifier,
    @CascadeOrder int = NULL,
    @MatchScore decimal(5, 2) = NULL,
    @ScoreBreakdownJSON_Clear bit = 0,
    @ScoreBreakdownJSON nvarchar(MAX) = NULL,
    @ConflictStatus nvarchar(30) = NULL,
    @ConflictReason_Clear bit = 0,
    @ConflictReason nvarchar(MAX) = NULL,
    @Status nvarchar(30) = NULL,
    @OfferedAt_Clear bit = 0,
    @OfferedAt datetimeoffset = NULL,
    @SLADeadlineAt_Clear bit = 0,
    @SLADeadlineAt datetimeoffset = NULL,
    @RespondedAt_Clear bit = 0,
    @RespondedAt datetimeoffset = NULL,
    @ResponseNotes_Clear bit = 0,
    @ResponseNotes nvarchar(MAX) = NULL,
    @DeclineReason_Clear bit = 0,
    @DeclineReason nvarchar(255) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @InsertedRow TABLE ([ID] UNIQUEIDENTIFIER)

    IF @ID IS NOT NULL
    BEGIN
        -- User provided a value, use it
        INSERT INTO [__mj_BizAppsReferrals].[ReferralAssignment]
            (
                [ID],
                [ReferralRequestID],
                [ProfessionalProfileID],
                [CascadeOrder],
                [MatchScore],
                [ScoreBreakdownJSON],
                [ConflictStatus],
                [ConflictReason],
                [Status],
                [OfferedAt],
                [SLADeadlineAt],
                [RespondedAt],
                [ResponseNotes],
                [DeclineReason]
            )
        OUTPUT INSERTED.[ID] INTO @InsertedRow
        VALUES
            (
                @ID,
                @ReferralRequestID,
                @ProfessionalProfileID,
                ISNULL(@CascadeOrder, 1),
                ISNULL(@MatchScore, 0.00),
                CASE WHEN @ScoreBreakdownJSON_Clear = 1 THEN NULL ELSE ISNULL(@ScoreBreakdownJSON, NULL) END,
                ISNULL(@ConflictStatus, 'Pending'),
                CASE WHEN @ConflictReason_Clear = 1 THEN NULL ELSE ISNULL(@ConflictReason, NULL) END,
                ISNULL(@Status, 'Queued'),
                CASE WHEN @OfferedAt_Clear = 1 THEN NULL ELSE ISNULL(@OfferedAt, NULL) END,
                CASE WHEN @SLADeadlineAt_Clear = 1 THEN NULL ELSE ISNULL(@SLADeadlineAt, NULL) END,
                CASE WHEN @RespondedAt_Clear = 1 THEN NULL ELSE ISNULL(@RespondedAt, NULL) END,
                CASE WHEN @ResponseNotes_Clear = 1 THEN NULL ELSE ISNULL(@ResponseNotes, NULL) END,
                CASE WHEN @DeclineReason_Clear = 1 THEN NULL ELSE ISNULL(@DeclineReason, NULL) END
            )
    END
    ELSE
    BEGIN
        -- No value provided, let database use its default (e.g., NEWSEQUENTIALID())
        INSERT INTO [__mj_BizAppsReferrals].[ReferralAssignment]
            (
                [ReferralRequestID],
                [ProfessionalProfileID],
                [CascadeOrder],
                [MatchScore],
                [ScoreBreakdownJSON],
                [ConflictStatus],
                [ConflictReason],
                [Status],
                [OfferedAt],
                [SLADeadlineAt],
                [RespondedAt],
                [ResponseNotes],
                [DeclineReason]
            )
        OUTPUT INSERTED.[ID] INTO @InsertedRow
        VALUES
            (
                @ReferralRequestID,
                @ProfessionalProfileID,
                ISNULL(@CascadeOrder, 1),
                ISNULL(@MatchScore, 0.00),
                CASE WHEN @ScoreBreakdownJSON_Clear = 1 THEN NULL ELSE ISNULL(@ScoreBreakdownJSON, NULL) END,
                ISNULL(@ConflictStatus, 'Pending'),
                CASE WHEN @ConflictReason_Clear = 1 THEN NULL ELSE ISNULL(@ConflictReason, NULL) END,
                ISNULL(@Status, 'Queued'),
                CASE WHEN @OfferedAt_Clear = 1 THEN NULL ELSE ISNULL(@OfferedAt, NULL) END,
                CASE WHEN @SLADeadlineAt_Clear = 1 THEN NULL ELSE ISNULL(@SLADeadlineAt, NULL) END,
                CASE WHEN @RespondedAt_Clear = 1 THEN NULL ELSE ISNULL(@RespondedAt, NULL) END,
                CASE WHEN @ResponseNotes_Clear = 1 THEN NULL ELSE ISNULL(@ResponseNotes, NULL) END,
                CASE WHEN @DeclineReason_Clear = 1 THEN NULL ELSE ISNULL(@DeclineReason, NULL) END
            )
    END
    -- return the new record from the base view, which might have some calculated fields
    SELECT * FROM [__mj_BizAppsReferrals].[vwReferralAssignments] WHERE [ID] = (SELECT [ID] FROM @InsertedRow)
END
GO
GRANT EXECUTE ON [__mj_BizAppsReferrals].[spCreateReferralAssignment] TO [cdp_Developer], [cdp_Integration];

/* spCreate Permissions for MJ_BizApps_Referrals: Referral Assignments */

GRANT EXECUTE ON [__mj_BizAppsReferrals].[spCreateReferralAssignment] TO [cdp_Developer], [cdp_Integration];

/* spUpdate SQL for MJ_BizApps_Referrals: Referral Assignments */
-----------------------------------------------------------------
-- SQL Code Generation
-- Entity: MJ_BizApps_Referrals: Referral Assignments
-- Item: spUpdateReferralAssignment
--
-- This was generated by the MemberJunction CodeGen tool.
-- This file should NOT be edited by hand.
-----------------------------------------------------------------

------------------------------------------------------------
----- UPDATE PROCEDURE FOR ReferralAssignment
------------------------------------------------------------
IF OBJECT_ID('[__mj_BizAppsReferrals].[spUpdateReferralAssignment]', 'P') IS NOT NULL
    DROP PROCEDURE [__mj_BizAppsReferrals].[spUpdateReferralAssignment];
GO

CREATE PROCEDURE [__mj_BizAppsReferrals].[spUpdateReferralAssignment]
    @ID uniqueidentifier,
    @ReferralRequestID uniqueidentifier = NULL,
    @ProfessionalProfileID uniqueidentifier = NULL,
    @CascadeOrder int = NULL,
    @MatchScore decimal(5, 2) = NULL,
    @ScoreBreakdownJSON_Clear bit = 0,
    @ScoreBreakdownJSON nvarchar(MAX) = NULL,
    @ConflictStatus nvarchar(30) = NULL,
    @ConflictReason_Clear bit = 0,
    @ConflictReason nvarchar(MAX) = NULL,
    @Status nvarchar(30) = NULL,
    @OfferedAt_Clear bit = 0,
    @OfferedAt datetimeoffset = NULL,
    @SLADeadlineAt_Clear bit = 0,
    @SLADeadlineAt datetimeoffset = NULL,
    @RespondedAt_Clear bit = 0,
    @RespondedAt datetimeoffset = NULL,
    @ResponseNotes_Clear bit = 0,
    @ResponseNotes nvarchar(MAX) = NULL,
    @DeclineReason_Clear bit = 0,
    @DeclineReason nvarchar(255) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE
        [__mj_BizAppsReferrals].[ReferralAssignment]
    SET
        [ReferralRequestID] = ISNULL(@ReferralRequestID, [ReferralRequestID]),
        [ProfessionalProfileID] = ISNULL(@ProfessionalProfileID, [ProfessionalProfileID]),
        [CascadeOrder] = ISNULL(@CascadeOrder, [CascadeOrder]),
        [MatchScore] = ISNULL(@MatchScore, [MatchScore]),
        [ScoreBreakdownJSON] = CASE WHEN @ScoreBreakdownJSON_Clear = 1 THEN NULL ELSE ISNULL(@ScoreBreakdownJSON, [ScoreBreakdownJSON]) END,
        [ConflictStatus] = ISNULL(@ConflictStatus, [ConflictStatus]),
        [ConflictReason] = CASE WHEN @ConflictReason_Clear = 1 THEN NULL ELSE ISNULL(@ConflictReason, [ConflictReason]) END,
        [Status] = ISNULL(@Status, [Status]),
        [OfferedAt] = CASE WHEN @OfferedAt_Clear = 1 THEN NULL ELSE ISNULL(@OfferedAt, [OfferedAt]) END,
        [SLADeadlineAt] = CASE WHEN @SLADeadlineAt_Clear = 1 THEN NULL ELSE ISNULL(@SLADeadlineAt, [SLADeadlineAt]) END,
        [RespondedAt] = CASE WHEN @RespondedAt_Clear = 1 THEN NULL ELSE ISNULL(@RespondedAt, [RespondedAt]) END,
        [ResponseNotes] = CASE WHEN @ResponseNotes_Clear = 1 THEN NULL ELSE ISNULL(@ResponseNotes, [ResponseNotes]) END,
        [DeclineReason] = CASE WHEN @DeclineReason_Clear = 1 THEN NULL ELSE ISNULL(@DeclineReason, [DeclineReason]) END,
        [__mj_UpdatedAt] = GETUTCDATE()
    WHERE
        [ID] = @ID

    -- Check if the update was successful
    IF @@ROWCOUNT = 0
        -- Nothing was updated, return no rows, but column structure from base view intact, semantically correct this way.
        SELECT TOP 0 * FROM [__mj_BizAppsReferrals].[vwReferralAssignments] WHERE 1=0
    ELSE
        -- Return the updated record so the caller can see the updated values and any calculated fields
        SELECT
                                        *
                                    FROM
                                        [__mj_BizAppsReferrals].[vwReferralAssignments]
                                    WHERE
                                        [ID] = @ID
                                    
END
GO

GRANT EXECUTE ON [__mj_BizAppsReferrals].[spUpdateReferralAssignment] TO [cdp_Developer], [cdp_Integration]
GO

------------------------------------------------------------
----- TRIGGER FOR __mj_UpdatedAt field for the ReferralAssignment table
------------------------------------------------------------
IF OBJECT_ID('[__mj_BizAppsReferrals].[trgUpdateReferralAssignment]', 'TR') IS NOT NULL
    DROP TRIGGER [__mj_BizAppsReferrals].[trgUpdateReferralAssignment];
GO
CREATE TRIGGER [__mj_BizAppsReferrals].trgUpdateReferralAssignment
ON [__mj_BizAppsReferrals].[ReferralAssignment]
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    IF NOT UPDATE([__mj_UpdatedAt])
    BEGIN
        UPDATE
            [__mj_BizAppsReferrals].[ReferralAssignment]
        SET
            __mj_UpdatedAt = GETUTCDATE()
        FROM
            [__mj_BizAppsReferrals].[ReferralAssignment] AS _organicTable
        INNER JOIN
            INSERTED AS I ON
            _organicTable.[ID] = I.[ID];
    END
END;
GO

/* spUpdate Permissions for MJ_BizApps_Referrals: Referral Assignments */

GRANT EXECUTE ON [__mj_BizAppsReferrals].[spUpdateReferralAssignment] TO [cdp_Developer], [cdp_Integration];

/* spDelete SQL for MJ_BizApps_Referrals: Referral Assignments */
-----------------------------------------------------------------
-- SQL Code Generation
-- Entity: MJ_BizApps_Referrals: Referral Assignments
-- Item: spDeleteReferralAssignment
--
-- This was generated by the MemberJunction CodeGen tool.
-- This file should NOT be edited by hand.
-----------------------------------------------------------------

------------------------------------------------------------
----- DELETE PROCEDURE FOR ReferralAssignment
------------------------------------------------------------
IF OBJECT_ID('[__mj_BizAppsReferrals].[spDeleteReferralAssignment]', 'P') IS NOT NULL
    DROP PROCEDURE [__mj_BizAppsReferrals].[spDeleteReferralAssignment];
GO

CREATE PROCEDURE [__mj_BizAppsReferrals].[spDeleteReferralAssignment]
    @ID uniqueidentifier
AS
BEGIN
    SET NOCOUNT ON;

    DELETE FROM
        [__mj_BizAppsReferrals].[ReferralAssignment]
    WHERE
        [ID] = @ID


    -- Check if the delete was successful
    IF @@ROWCOUNT = 0
        SELECT NULL AS [ID] -- Return NULL for all primary key fields to indicate no record was deleted
    ELSE
        SELECT @ID AS [ID] -- Return the primary key values to indicate we successfully deleted the record
END
GO
GRANT EXECUTE ON [__mj_BizAppsReferrals].[spDeleteReferralAssignment] TO [cdp_Developer], [cdp_Integration];

/* spDelete Permissions for MJ_BizApps_Referrals: Referral Assignments */

GRANT EXECUTE ON [__mj_BizAppsReferrals].[spDeleteReferralAssignment] TO [cdp_Developer], [cdp_Integration];

/* Index for Foreign Keys for ReferralFeedback */
-----------------------------------------------------------------
-- SQL Code Generation
-- Entity: MJ_BizApps_Referrals: Referral Feedbacks
-- Item: Index for Foreign Keys
--
-- This was generated by the MemberJunction CodeGen tool.
-- This file should NOT be edited by hand.
-----------------------------------------------------------------
-- Index for foreign key ReferralRequestID in table ReferralFeedback
IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'IDX_AUTO_MJ_FKEY_ReferralFeedback_ReferralRequestID' 
    AND object_id = OBJECT_ID('[__mj_BizAppsReferrals].[ReferralFeedback]')
)
CREATE INDEX IDX_AUTO_MJ_FKEY_ReferralFeedback_ReferralRequestID ON [__mj_BizAppsReferrals].[ReferralFeedback] ([ReferralRequestID]);

-- Index for foreign key ReferralAssignmentID in table ReferralFeedback
IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'IDX_AUTO_MJ_FKEY_ReferralFeedback_ReferralAssignmentID' 
    AND object_id = OBJECT_ID('[__mj_BizAppsReferrals].[ReferralFeedback]')
)
CREATE INDEX IDX_AUTO_MJ_FKEY_ReferralFeedback_ReferralAssignmentID ON [__mj_BizAppsReferrals].[ReferralFeedback] ([ReferralAssignmentID]);

-- Index for foreign key ProfessionalProfileID in table ReferralFeedback
IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'IDX_AUTO_MJ_FKEY_ReferralFeedback_ProfessionalProfileID' 
    AND object_id = OBJECT_ID('[__mj_BizAppsReferrals].[ReferralFeedback]')
)
CREATE INDEX IDX_AUTO_MJ_FKEY_ReferralFeedback_ProfessionalProfileID ON [__mj_BizAppsReferrals].[ReferralFeedback] ([ProfessionalProfileID]);

/* Base View SQL for MJ_BizApps_Referrals: Referral Feedbacks */
-----------------------------------------------------------------
-- SQL Code Generation
-- Entity: MJ_BizApps_Referrals: Referral Feedbacks
-- Item: vwReferralFeedbacks
--
-- This was generated by the MemberJunction CodeGen tool.
-- This file should NOT be edited by hand.
-----------------------------------------------------------------

------------------------------------------------------------
----- BASE VIEW FOR ENTITY:      MJ_BizApps_Referrals: Referral Feedbacks
-----               SCHEMA:      __mj_BizAppsReferrals
-----               BASE TABLE:  ReferralFeedback
-----               PRIMARY KEY: ID
------------------------------------------------------------
IF OBJECT_ID('[__mj_BizAppsReferrals].[vwReferralFeedbacks]', 'V') IS NOT NULL
    DROP VIEW [__mj_BizAppsReferrals].[vwReferralFeedbacks];
GO

CREATE VIEW [__mj_BizAppsReferrals].[vwReferralFeedbacks]
AS
SELECT
    r.*
FROM
    [__mj_BizAppsReferrals].[ReferralFeedback] AS r
GO
GRANT SELECT ON [__mj_BizAppsReferrals].[vwReferralFeedbacks] TO [cdp_UI], [cdp_Developer], [cdp_Integration];

/* Base View Permissions SQL for MJ_BizApps_Referrals: Referral Feedbacks */
-----------------------------------------------------------------
-- SQL Code Generation
-- Entity: MJ_BizApps_Referrals: Referral Feedbacks
-- Item: Permissions for vwReferralFeedbacks
--
-- This was generated by the MemberJunction CodeGen tool.
-- This file should NOT be edited by hand.
-----------------------------------------------------------------

GRANT SELECT ON [__mj_BizAppsReferrals].[vwReferralFeedbacks] TO [cdp_UI], [cdp_Developer], [cdp_Integration];

/* spCreate SQL for MJ_BizApps_Referrals: Referral Feedbacks */
-----------------------------------------------------------------
-- SQL Code Generation
-- Entity: MJ_BizApps_Referrals: Referral Feedbacks
-- Item: spCreateReferralFeedback
--
-- This was generated by the MemberJunction CodeGen tool.
-- This file should NOT be edited by hand.
-----------------------------------------------------------------

------------------------------------------------------------
----- CREATE PROCEDURE FOR ReferralFeedback
------------------------------------------------------------
IF OBJECT_ID('[__mj_BizAppsReferrals].[spCreateReferralFeedback]', 'P') IS NOT NULL
    DROP PROCEDURE [__mj_BizAppsReferrals].[spCreateReferralFeedback];
GO

CREATE PROCEDURE [__mj_BizAppsReferrals].[spCreateReferralFeedback]
    @ID uniqueidentifier = NULL,
    @ReferralRequestID uniqueidentifier,
    @ReferralAssignmentID_Clear bit = 0,
    @ReferralAssignmentID uniqueidentifier = NULL,
    @ProfessionalProfileID uniqueidentifier,
    @SubmittedByType nvarchar(20) = NULL,
    @Rating int,
    @OutcomeStatus nvarchar(30) = NULL,
    @Comments_Clear bit = 0,
    @Comments nvarchar(MAX) = NULL,
    @SubmittedAt datetimeoffset = NULL
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @InsertedRow TABLE ([ID] UNIQUEIDENTIFIER)

    IF @ID IS NOT NULL
    BEGIN
        -- User provided a value, use it
        INSERT INTO [__mj_BizAppsReferrals].[ReferralFeedback]
            (
                [ID],
                [ReferralRequestID],
                [ReferralAssignmentID],
                [ProfessionalProfileID],
                [SubmittedByType],
                [Rating],
                [OutcomeStatus],
                [Comments],
                [SubmittedAt]
            )
        OUTPUT INSERTED.[ID] INTO @InsertedRow
        VALUES
            (
                @ID,
                @ReferralRequestID,
                CASE WHEN @ReferralAssignmentID_Clear = 1 THEN NULL ELSE ISNULL(@ReferralAssignmentID, NULL) END,
                @ProfessionalProfileID,
                ISNULL(@SubmittedByType, 'Seeker'),
                @Rating,
                ISNULL(@OutcomeStatus, 'Engaged'),
                CASE WHEN @Comments_Clear = 1 THEN NULL ELSE ISNULL(@Comments, NULL) END,
                ISNULL(@SubmittedAt, sysdatetimeoffset())
            )
    END
    ELSE
    BEGIN
        -- No value provided, let database use its default (e.g., NEWSEQUENTIALID())
        INSERT INTO [__mj_BizAppsReferrals].[ReferralFeedback]
            (
                [ReferralRequestID],
                [ReferralAssignmentID],
                [ProfessionalProfileID],
                [SubmittedByType],
                [Rating],
                [OutcomeStatus],
                [Comments],
                [SubmittedAt]
            )
        OUTPUT INSERTED.[ID] INTO @InsertedRow
        VALUES
            (
                @ReferralRequestID,
                CASE WHEN @ReferralAssignmentID_Clear = 1 THEN NULL ELSE ISNULL(@ReferralAssignmentID, NULL) END,
                @ProfessionalProfileID,
                ISNULL(@SubmittedByType, 'Seeker'),
                @Rating,
                ISNULL(@OutcomeStatus, 'Engaged'),
                CASE WHEN @Comments_Clear = 1 THEN NULL ELSE ISNULL(@Comments, NULL) END,
                ISNULL(@SubmittedAt, sysdatetimeoffset())
            )
    END
    -- return the new record from the base view, which might have some calculated fields
    SELECT * FROM [__mj_BizAppsReferrals].[vwReferralFeedbacks] WHERE [ID] = (SELECT [ID] FROM @InsertedRow)
END
GO
GRANT EXECUTE ON [__mj_BizAppsReferrals].[spCreateReferralFeedback] TO [cdp_Developer], [cdp_Integration];

/* spCreate Permissions for MJ_BizApps_Referrals: Referral Feedbacks */

GRANT EXECUTE ON [__mj_BizAppsReferrals].[spCreateReferralFeedback] TO [cdp_Developer], [cdp_Integration];

/* spUpdate SQL for MJ_BizApps_Referrals: Referral Feedbacks */
-----------------------------------------------------------------
-- SQL Code Generation
-- Entity: MJ_BizApps_Referrals: Referral Feedbacks
-- Item: spUpdateReferralFeedback
--
-- This was generated by the MemberJunction CodeGen tool.
-- This file should NOT be edited by hand.
-----------------------------------------------------------------

------------------------------------------------------------
----- UPDATE PROCEDURE FOR ReferralFeedback
------------------------------------------------------------
IF OBJECT_ID('[__mj_BizAppsReferrals].[spUpdateReferralFeedback]', 'P') IS NOT NULL
    DROP PROCEDURE [__mj_BizAppsReferrals].[spUpdateReferralFeedback];
GO

CREATE PROCEDURE [__mj_BizAppsReferrals].[spUpdateReferralFeedback]
    @ID uniqueidentifier,
    @ReferralRequestID uniqueidentifier = NULL,
    @ReferralAssignmentID_Clear bit = 0,
    @ReferralAssignmentID uniqueidentifier = NULL,
    @ProfessionalProfileID uniqueidentifier = NULL,
    @SubmittedByType nvarchar(20) = NULL,
    @Rating int = NULL,
    @OutcomeStatus nvarchar(30) = NULL,
    @Comments_Clear bit = 0,
    @Comments nvarchar(MAX) = NULL,
    @SubmittedAt datetimeoffset = NULL
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE
        [__mj_BizAppsReferrals].[ReferralFeedback]
    SET
        [ReferralRequestID] = ISNULL(@ReferralRequestID, [ReferralRequestID]),
        [ReferralAssignmentID] = CASE WHEN @ReferralAssignmentID_Clear = 1 THEN NULL ELSE ISNULL(@ReferralAssignmentID, [ReferralAssignmentID]) END,
        [ProfessionalProfileID] = ISNULL(@ProfessionalProfileID, [ProfessionalProfileID]),
        [SubmittedByType] = ISNULL(@SubmittedByType, [SubmittedByType]),
        [Rating] = ISNULL(@Rating, [Rating]),
        [OutcomeStatus] = ISNULL(@OutcomeStatus, [OutcomeStatus]),
        [Comments] = CASE WHEN @Comments_Clear = 1 THEN NULL ELSE ISNULL(@Comments, [Comments]) END,
        [SubmittedAt] = ISNULL(@SubmittedAt, [SubmittedAt]),
        [__mj_UpdatedAt] = GETUTCDATE()
    WHERE
        [ID] = @ID

    -- Check if the update was successful
    IF @@ROWCOUNT = 0
        -- Nothing was updated, return no rows, but column structure from base view intact, semantically correct this way.
        SELECT TOP 0 * FROM [__mj_BizAppsReferrals].[vwReferralFeedbacks] WHERE 1=0
    ELSE
        -- Return the updated record so the caller can see the updated values and any calculated fields
        SELECT
                                        *
                                    FROM
                                        [__mj_BizAppsReferrals].[vwReferralFeedbacks]
                                    WHERE
                                        [ID] = @ID
                                    
END
GO

GRANT EXECUTE ON [__mj_BizAppsReferrals].[spUpdateReferralFeedback] TO [cdp_Developer], [cdp_Integration]
GO

------------------------------------------------------------
----- TRIGGER FOR __mj_UpdatedAt field for the ReferralFeedback table
------------------------------------------------------------
IF OBJECT_ID('[__mj_BizAppsReferrals].[trgUpdateReferralFeedback]', 'TR') IS NOT NULL
    DROP TRIGGER [__mj_BizAppsReferrals].[trgUpdateReferralFeedback];
GO
CREATE TRIGGER [__mj_BizAppsReferrals].trgUpdateReferralFeedback
ON [__mj_BizAppsReferrals].[ReferralFeedback]
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    IF NOT UPDATE([__mj_UpdatedAt])
    BEGIN
        UPDATE
            [__mj_BizAppsReferrals].[ReferralFeedback]
        SET
            __mj_UpdatedAt = GETUTCDATE()
        FROM
            [__mj_BizAppsReferrals].[ReferralFeedback] AS _organicTable
        INNER JOIN
            INSERTED AS I ON
            _organicTable.[ID] = I.[ID];
    END
END;
GO

/* spUpdate Permissions for MJ_BizApps_Referrals: Referral Feedbacks */

GRANT EXECUTE ON [__mj_BizAppsReferrals].[spUpdateReferralFeedback] TO [cdp_Developer], [cdp_Integration];

/* spDelete SQL for MJ_BizApps_Referrals: Referral Feedbacks */
-----------------------------------------------------------------
-- SQL Code Generation
-- Entity: MJ_BizApps_Referrals: Referral Feedbacks
-- Item: spDeleteReferralFeedback
--
-- This was generated by the MemberJunction CodeGen tool.
-- This file should NOT be edited by hand.
-----------------------------------------------------------------

------------------------------------------------------------
----- DELETE PROCEDURE FOR ReferralFeedback
------------------------------------------------------------
IF OBJECT_ID('[__mj_BizAppsReferrals].[spDeleteReferralFeedback]', 'P') IS NOT NULL
    DROP PROCEDURE [__mj_BizAppsReferrals].[spDeleteReferralFeedback];
GO

CREATE PROCEDURE [__mj_BizAppsReferrals].[spDeleteReferralFeedback]
    @ID uniqueidentifier
AS
BEGIN
    SET NOCOUNT ON;

    DELETE FROM
        [__mj_BizAppsReferrals].[ReferralFeedback]
    WHERE
        [ID] = @ID


    -- Check if the delete was successful
    IF @@ROWCOUNT = 0
        SELECT NULL AS [ID] -- Return NULL for all primary key fields to indicate no record was deleted
    ELSE
        SELECT @ID AS [ID] -- Return the primary key values to indicate we successfully deleted the record
END
GO
GRANT EXECUTE ON [__mj_BizAppsReferrals].[spDeleteReferralFeedback] TO [cdp_Developer], [cdp_Integration];

/* spDelete Permissions for MJ_BizApps_Referrals: Referral Feedbacks */

GRANT EXECUTE ON [__mj_BizAppsReferrals].[spDeleteReferralFeedback] TO [cdp_Developer], [cdp_Integration];

/* SQL text to update entity field related entity name field map for entity field ID C167DB68-E9E4-45D2-A54F-613B5DBB64AF */
EXEC [${flyway:defaultSchema}].[spUpdateEntityFieldRelatedEntityNameFieldMap] @EntityFieldID='C167DB68-E9E4-45D2-A54F-613B5DBB64AF', @RelatedEntityNameFieldMap='SeekerPerson';

/* SQL text to update entity field related entity name field map for entity field ID 16B64C7D-24BB-4787-AD16-271889DD6A9A */
EXEC [${flyway:defaultSchema}].[spUpdateEntityFieldRelatedEntityNameFieldMap] @EntityFieldID='16B64C7D-24BB-4787-AD16-271889DD6A9A', @RelatedEntityNameFieldMap='PracticeArea';

/* SQL text to update entity field related entity name field map for entity field ID 5716607D-5B6D-4702-9A99-104BC0C33EF9 */
EXEC [${flyway:defaultSchema}].[spUpdateEntityFieldRelatedEntityNameFieldMap] @EntityFieldID='5716607D-5B6D-4702-9A99-104BC0C33EF9', @RelatedEntityNameFieldMap='Jurisdiction';

/* SQL text to update entity field related entity name field map for entity field ID 15C9482E-E275-4D4C-BE4B-642DBDC2AEE0 */
EXEC [${flyway:defaultSchema}].[spUpdateEntityFieldRelatedEntityNameFieldMap] @EntityFieldID='15C9482E-E275-4D4C-BE4B-642DBDC2AEE0', @RelatedEntityNameFieldMap='ReferralTier';

/* Index for Foreign Keys for ReferralRequest */
-----------------------------------------------------------------
-- SQL Code Generation
-- Entity: MJ_BizApps_Referrals: Referral Requests
-- Item: Index for Foreign Keys
--
-- This was generated by the MemberJunction CodeGen tool.
-- This file should NOT be edited by hand.
-----------------------------------------------------------------
-- Index for foreign key SeekerPersonID in table ReferralRequest
IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'IDX_AUTO_MJ_FKEY_ReferralRequest_SeekerPersonID' 
    AND object_id = OBJECT_ID('[__mj_BizAppsReferrals].[ReferralRequest]')
)
CREATE INDEX IDX_AUTO_MJ_FKEY_ReferralRequest_SeekerPersonID ON [__mj_BizAppsReferrals].[ReferralRequest] ([SeekerPersonID]);

-- Index for foreign key PracticeAreaID in table ReferralRequest
IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'IDX_AUTO_MJ_FKEY_ReferralRequest_PracticeAreaID' 
    AND object_id = OBJECT_ID('[__mj_BizAppsReferrals].[ReferralRequest]')
)
CREATE INDEX IDX_AUTO_MJ_FKEY_ReferralRequest_PracticeAreaID ON [__mj_BizAppsReferrals].[ReferralRequest] ([PracticeAreaID]);

-- Index for foreign key JurisdictionID in table ReferralRequest
IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'IDX_AUTO_MJ_FKEY_ReferralRequest_JurisdictionID' 
    AND object_id = OBJECT_ID('[__mj_BizAppsReferrals].[ReferralRequest]')
)
CREATE INDEX IDX_AUTO_MJ_FKEY_ReferralRequest_JurisdictionID ON [__mj_BizAppsReferrals].[ReferralRequest] ([JurisdictionID]);

-- Index for foreign key ReferralTierID in table ReferralRequest
IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'IDX_AUTO_MJ_FKEY_ReferralRequest_ReferralTierID' 
    AND object_id = OBJECT_ID('[__mj_BizAppsReferrals].[ReferralRequest]')
)
CREATE INDEX IDX_AUTO_MJ_FKEY_ReferralRequest_ReferralTierID ON [__mj_BizAppsReferrals].[ReferralRequest] ([ReferralTierID]);

-- Index for foreign key AssignedProfessionalID in table ReferralRequest
IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'IDX_AUTO_MJ_FKEY_ReferralRequest_AssignedProfessionalID' 
    AND object_id = OBJECT_ID('[__mj_BizAppsReferrals].[ReferralRequest]')
)
CREATE INDEX IDX_AUTO_MJ_FKEY_ReferralRequest_AssignedProfessionalID ON [__mj_BizAppsReferrals].[ReferralRequest] ([AssignedProfessionalID]);

/* Base View SQL for MJ_BizApps_Referrals: Referral Requests */
-----------------------------------------------------------------
-- SQL Code Generation
-- Entity: MJ_BizApps_Referrals: Referral Requests
-- Item: vwReferralRequests
--
-- This was generated by the MemberJunction CodeGen tool.
-- This file should NOT be edited by hand.
-----------------------------------------------------------------

------------------------------------------------------------
----- BASE VIEW FOR ENTITY:      MJ_BizApps_Referrals: Referral Requests
-----               SCHEMA:      __mj_BizAppsReferrals
-----               BASE TABLE:  ReferralRequest
-----               PRIMARY KEY: ID
------------------------------------------------------------
IF OBJECT_ID('[__mj_BizAppsReferrals].[vwReferralRequests]', 'V') IS NOT NULL
    DROP VIEW [__mj_BizAppsReferrals].[vwReferralRequests];
GO

CREATE VIEW [__mj_BizAppsReferrals].[vwReferralRequests]
AS
SELECT
    r.*,
    mjBizAppsCommonPerson_SeekerPersonID.[DisplayName] AS [SeekerPerson],
    mjBizAppsReferralsPracticeArea_PracticeAreaID.[Name] AS [PracticeArea],
    mjBizAppsReferralsJurisdiction_JurisdictionID.[Name] AS [Jurisdiction],
    mjBizAppsReferralsReferralTier_ReferralTierID.[Name] AS [ReferralTier]
FROM
    [__mj_BizAppsReferrals].[ReferralRequest] AS r
LEFT OUTER JOIN
    [__mj_BizAppsCommon].[Person] AS mjBizAppsCommonPerson_SeekerPersonID
  ON
    [r].[SeekerPersonID] = mjBizAppsCommonPerson_SeekerPersonID.[ID]
LEFT OUTER JOIN
    [__mj_BizAppsReferrals].[PracticeArea] AS mjBizAppsReferralsPracticeArea_PracticeAreaID
  ON
    [r].[PracticeAreaID] = mjBizAppsReferralsPracticeArea_PracticeAreaID.[ID]
LEFT OUTER JOIN
    [__mj_BizAppsReferrals].[Jurisdiction] AS mjBizAppsReferralsJurisdiction_JurisdictionID
  ON
    [r].[JurisdictionID] = mjBizAppsReferralsJurisdiction_JurisdictionID.[ID]
LEFT OUTER JOIN
    [__mj_BizAppsReferrals].[ReferralTier] AS mjBizAppsReferralsReferralTier_ReferralTierID
  ON
    [r].[ReferralTierID] = mjBizAppsReferralsReferralTier_ReferralTierID.[ID]
GO
GRANT SELECT ON [__mj_BizAppsReferrals].[vwReferralRequests] TO [cdp_UI], [cdp_Developer], [cdp_Integration];

/* Base View Permissions SQL for MJ_BizApps_Referrals: Referral Requests */
-----------------------------------------------------------------
-- SQL Code Generation
-- Entity: MJ_BizApps_Referrals: Referral Requests
-- Item: Permissions for vwReferralRequests
--
-- This was generated by the MemberJunction CodeGen tool.
-- This file should NOT be edited by hand.
-----------------------------------------------------------------

GRANT SELECT ON [__mj_BizAppsReferrals].[vwReferralRequests] TO [cdp_UI], [cdp_Developer], [cdp_Integration];

/* spCreate SQL for MJ_BizApps_Referrals: Referral Requests */
-----------------------------------------------------------------
-- SQL Code Generation
-- Entity: MJ_BizApps_Referrals: Referral Requests
-- Item: spCreateReferralRequest
--
-- This was generated by the MemberJunction CodeGen tool.
-- This file should NOT be edited by hand.
-----------------------------------------------------------------

------------------------------------------------------------
----- CREATE PROCEDURE FOR ReferralRequest
------------------------------------------------------------
IF OBJECT_ID('[__mj_BizAppsReferrals].[spCreateReferralRequest]', 'P') IS NOT NULL
    DROP PROCEDURE [__mj_BizAppsReferrals].[spCreateReferralRequest];
GO

CREATE PROCEDURE [__mj_BizAppsReferrals].[spCreateReferralRequest]
    @ID uniqueidentifier = NULL,
    @RequestNumber nvarchar(50),
    @SeekerName nvarchar(200),
    @SeekerEmail nvarchar(255),
    @SeekerPhone_Clear bit = 0,
    @SeekerPhone nvarchar(50) = NULL,
    @SeekerCompany_Clear bit = 0,
    @SeekerCompany nvarchar(200) = NULL,
    @SeekerPersonID_Clear bit = 0,
    @SeekerPersonID uniqueidentifier = NULL,
    @PracticeAreaID uniqueidentifier,
    @JurisdictionID uniqueidentifier,
    @ReferralTierID uniqueidentifier,
    @MatterTitle nvarchar(255),
    @MatterSummary nvarchar(MAX),
    @UrgencyLevel nvarchar(20) = NULL,
    @BudgetRange_Clear bit = 0,
    @BudgetRange nvarchar(100) = NULL,
    @PreferredLanguage_Clear bit = 0,
    @PreferredLanguage nvarchar(100) = NULL,
    @RequiresProBono bit = NULL,
    @Status nvarchar(30) = NULL,
    @AssignedProfessionalID_Clear bit = 0,
    @AssignedProfessionalID uniqueidentifier = NULL,
    @CurrentCascadeStep int = NULL,
    @SubmittedAt_Clear bit = 0,
    @SubmittedAt datetimeoffset = NULL,
    @AcceptedAt_Clear bit = 0,
    @AcceptedAt datetimeoffset = NULL,
    @CompletedAt_Clear bit = 0,
    @CompletedAt datetimeoffset = NULL
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @InsertedRow TABLE ([ID] UNIQUEIDENTIFIER)

    IF @ID IS NOT NULL
    BEGIN
        -- User provided a value, use it
        INSERT INTO [__mj_BizAppsReferrals].[ReferralRequest]
            (
                [ID],
                [RequestNumber],
                [SeekerName],
                [SeekerEmail],
                [SeekerPhone],
                [SeekerCompany],
                [SeekerPersonID],
                [PracticeAreaID],
                [JurisdictionID],
                [ReferralTierID],
                [MatterTitle],
                [MatterSummary],
                [UrgencyLevel],
                [BudgetRange],
                [PreferredLanguage],
                [RequiresProBono],
                [Status],
                [AssignedProfessionalID],
                [CurrentCascadeStep],
                [SubmittedAt],
                [AcceptedAt],
                [CompletedAt]
            )
        OUTPUT INSERTED.[ID] INTO @InsertedRow
        VALUES
            (
                @ID,
                @RequestNumber,
                @SeekerName,
                @SeekerEmail,
                CASE WHEN @SeekerPhone_Clear = 1 THEN NULL ELSE ISNULL(@SeekerPhone, NULL) END,
                CASE WHEN @SeekerCompany_Clear = 1 THEN NULL ELSE ISNULL(@SeekerCompany, NULL) END,
                CASE WHEN @SeekerPersonID_Clear = 1 THEN NULL ELSE ISNULL(@SeekerPersonID, NULL) END,
                @PracticeAreaID,
                @JurisdictionID,
                @ReferralTierID,
                @MatterTitle,
                @MatterSummary,
                ISNULL(@UrgencyLevel, 'Standard'),
                CASE WHEN @BudgetRange_Clear = 1 THEN NULL ELSE ISNULL(@BudgetRange, NULL) END,
                CASE WHEN @PreferredLanguage_Clear = 1 THEN NULL ELSE ISNULL(@PreferredLanguage, 'English') END,
                ISNULL(@RequiresProBono, 0),
                ISNULL(@Status, 'Draft'),
                CASE WHEN @AssignedProfessionalID_Clear = 1 THEN NULL ELSE ISNULL(@AssignedProfessionalID, NULL) END,
                ISNULL(@CurrentCascadeStep, 0),
                CASE WHEN @SubmittedAt_Clear = 1 THEN NULL ELSE ISNULL(@SubmittedAt, NULL) END,
                CASE WHEN @AcceptedAt_Clear = 1 THEN NULL ELSE ISNULL(@AcceptedAt, NULL) END,
                CASE WHEN @CompletedAt_Clear = 1 THEN NULL ELSE ISNULL(@CompletedAt, NULL) END
            )
    END
    ELSE
    BEGIN
        -- No value provided, let database use its default (e.g., NEWSEQUENTIALID())
        INSERT INTO [__mj_BizAppsReferrals].[ReferralRequest]
            (
                [RequestNumber],
                [SeekerName],
                [SeekerEmail],
                [SeekerPhone],
                [SeekerCompany],
                [SeekerPersonID],
                [PracticeAreaID],
                [JurisdictionID],
                [ReferralTierID],
                [MatterTitle],
                [MatterSummary],
                [UrgencyLevel],
                [BudgetRange],
                [PreferredLanguage],
                [RequiresProBono],
                [Status],
                [AssignedProfessionalID],
                [CurrentCascadeStep],
                [SubmittedAt],
                [AcceptedAt],
                [CompletedAt]
            )
        OUTPUT INSERTED.[ID] INTO @InsertedRow
        VALUES
            (
                @RequestNumber,
                @SeekerName,
                @SeekerEmail,
                CASE WHEN @SeekerPhone_Clear = 1 THEN NULL ELSE ISNULL(@SeekerPhone, NULL) END,
                CASE WHEN @SeekerCompany_Clear = 1 THEN NULL ELSE ISNULL(@SeekerCompany, NULL) END,
                CASE WHEN @SeekerPersonID_Clear = 1 THEN NULL ELSE ISNULL(@SeekerPersonID, NULL) END,
                @PracticeAreaID,
                @JurisdictionID,
                @ReferralTierID,
                @MatterTitle,
                @MatterSummary,
                ISNULL(@UrgencyLevel, 'Standard'),
                CASE WHEN @BudgetRange_Clear = 1 THEN NULL ELSE ISNULL(@BudgetRange, NULL) END,
                CASE WHEN @PreferredLanguage_Clear = 1 THEN NULL ELSE ISNULL(@PreferredLanguage, 'English') END,
                ISNULL(@RequiresProBono, 0),
                ISNULL(@Status, 'Draft'),
                CASE WHEN @AssignedProfessionalID_Clear = 1 THEN NULL ELSE ISNULL(@AssignedProfessionalID, NULL) END,
                ISNULL(@CurrentCascadeStep, 0),
                CASE WHEN @SubmittedAt_Clear = 1 THEN NULL ELSE ISNULL(@SubmittedAt, NULL) END,
                CASE WHEN @AcceptedAt_Clear = 1 THEN NULL ELSE ISNULL(@AcceptedAt, NULL) END,
                CASE WHEN @CompletedAt_Clear = 1 THEN NULL ELSE ISNULL(@CompletedAt, NULL) END
            )
    END
    -- return the new record from the base view, which might have some calculated fields
    SELECT * FROM [__mj_BizAppsReferrals].[vwReferralRequests] WHERE [ID] = (SELECT [ID] FROM @InsertedRow)
END
GO
GRANT EXECUTE ON [__mj_BizAppsReferrals].[spCreateReferralRequest] TO [cdp_Developer], [cdp_Integration];

/* spCreate Permissions for MJ_BizApps_Referrals: Referral Requests */

GRANT EXECUTE ON [__mj_BizAppsReferrals].[spCreateReferralRequest] TO [cdp_Developer], [cdp_Integration];

/* spUpdate SQL for MJ_BizApps_Referrals: Referral Requests */
-----------------------------------------------------------------
-- SQL Code Generation
-- Entity: MJ_BizApps_Referrals: Referral Requests
-- Item: spUpdateReferralRequest
--
-- This was generated by the MemberJunction CodeGen tool.
-- This file should NOT be edited by hand.
-----------------------------------------------------------------

------------------------------------------------------------
----- UPDATE PROCEDURE FOR ReferralRequest
------------------------------------------------------------
IF OBJECT_ID('[__mj_BizAppsReferrals].[spUpdateReferralRequest]', 'P') IS NOT NULL
    DROP PROCEDURE [__mj_BizAppsReferrals].[spUpdateReferralRequest];
GO

CREATE PROCEDURE [__mj_BizAppsReferrals].[spUpdateReferralRequest]
    @ID uniqueidentifier,
    @RequestNumber nvarchar(50) = NULL,
    @SeekerName nvarchar(200) = NULL,
    @SeekerEmail nvarchar(255) = NULL,
    @SeekerPhone_Clear bit = 0,
    @SeekerPhone nvarchar(50) = NULL,
    @SeekerCompany_Clear bit = 0,
    @SeekerCompany nvarchar(200) = NULL,
    @SeekerPersonID_Clear bit = 0,
    @SeekerPersonID uniqueidentifier = NULL,
    @PracticeAreaID uniqueidentifier = NULL,
    @JurisdictionID uniqueidentifier = NULL,
    @ReferralTierID uniqueidentifier = NULL,
    @MatterTitle nvarchar(255) = NULL,
    @MatterSummary nvarchar(MAX) = NULL,
    @UrgencyLevel nvarchar(20) = NULL,
    @BudgetRange_Clear bit = 0,
    @BudgetRange nvarchar(100) = NULL,
    @PreferredLanguage_Clear bit = 0,
    @PreferredLanguage nvarchar(100) = NULL,
    @RequiresProBono bit = NULL,
    @Status nvarchar(30) = NULL,
    @AssignedProfessionalID_Clear bit = 0,
    @AssignedProfessionalID uniqueidentifier = NULL,
    @CurrentCascadeStep int = NULL,
    @SubmittedAt_Clear bit = 0,
    @SubmittedAt datetimeoffset = NULL,
    @AcceptedAt_Clear bit = 0,
    @AcceptedAt datetimeoffset = NULL,
    @CompletedAt_Clear bit = 0,
    @CompletedAt datetimeoffset = NULL
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE
        [__mj_BizAppsReferrals].[ReferralRequest]
    SET
        [RequestNumber] = ISNULL(@RequestNumber, [RequestNumber]),
        [SeekerName] = ISNULL(@SeekerName, [SeekerName]),
        [SeekerEmail] = ISNULL(@SeekerEmail, [SeekerEmail]),
        [SeekerPhone] = CASE WHEN @SeekerPhone_Clear = 1 THEN NULL ELSE ISNULL(@SeekerPhone, [SeekerPhone]) END,
        [SeekerCompany] = CASE WHEN @SeekerCompany_Clear = 1 THEN NULL ELSE ISNULL(@SeekerCompany, [SeekerCompany]) END,
        [SeekerPersonID] = CASE WHEN @SeekerPersonID_Clear = 1 THEN NULL ELSE ISNULL(@SeekerPersonID, [SeekerPersonID]) END,
        [PracticeAreaID] = ISNULL(@PracticeAreaID, [PracticeAreaID]),
        [JurisdictionID] = ISNULL(@JurisdictionID, [JurisdictionID]),
        [ReferralTierID] = ISNULL(@ReferralTierID, [ReferralTierID]),
        [MatterTitle] = ISNULL(@MatterTitle, [MatterTitle]),
        [MatterSummary] = ISNULL(@MatterSummary, [MatterSummary]),
        [UrgencyLevel] = ISNULL(@UrgencyLevel, [UrgencyLevel]),
        [BudgetRange] = CASE WHEN @BudgetRange_Clear = 1 THEN NULL ELSE ISNULL(@BudgetRange, [BudgetRange]) END,
        [PreferredLanguage] = CASE WHEN @PreferredLanguage_Clear = 1 THEN NULL ELSE ISNULL(@PreferredLanguage, [PreferredLanguage]) END,
        [RequiresProBono] = ISNULL(@RequiresProBono, [RequiresProBono]),
        [Status] = ISNULL(@Status, [Status]),
        [AssignedProfessionalID] = CASE WHEN @AssignedProfessionalID_Clear = 1 THEN NULL ELSE ISNULL(@AssignedProfessionalID, [AssignedProfessionalID]) END,
        [CurrentCascadeStep] = ISNULL(@CurrentCascadeStep, [CurrentCascadeStep]),
        [SubmittedAt] = CASE WHEN @SubmittedAt_Clear = 1 THEN NULL ELSE ISNULL(@SubmittedAt, [SubmittedAt]) END,
        [AcceptedAt] = CASE WHEN @AcceptedAt_Clear = 1 THEN NULL ELSE ISNULL(@AcceptedAt, [AcceptedAt]) END,
        [CompletedAt] = CASE WHEN @CompletedAt_Clear = 1 THEN NULL ELSE ISNULL(@CompletedAt, [CompletedAt]) END,
        [__mj_UpdatedAt] = GETUTCDATE()
    WHERE
        [ID] = @ID

    -- Check if the update was successful
    IF @@ROWCOUNT = 0
        -- Nothing was updated, return no rows, but column structure from base view intact, semantically correct this way.
        SELECT TOP 0 * FROM [__mj_BizAppsReferrals].[vwReferralRequests] WHERE 1=0
    ELSE
        -- Return the updated record so the caller can see the updated values and any calculated fields
        SELECT
                                        *
                                    FROM
                                        [__mj_BizAppsReferrals].[vwReferralRequests]
                                    WHERE
                                        [ID] = @ID
                                    
END
GO

GRANT EXECUTE ON [__mj_BizAppsReferrals].[spUpdateReferralRequest] TO [cdp_Developer], [cdp_Integration]
GO

------------------------------------------------------------
----- TRIGGER FOR __mj_UpdatedAt field for the ReferralRequest table
------------------------------------------------------------
IF OBJECT_ID('[__mj_BizAppsReferrals].[trgUpdateReferralRequest]', 'TR') IS NOT NULL
    DROP TRIGGER [__mj_BizAppsReferrals].[trgUpdateReferralRequest];
GO
CREATE TRIGGER [__mj_BizAppsReferrals].trgUpdateReferralRequest
ON [__mj_BizAppsReferrals].[ReferralRequest]
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    IF NOT UPDATE([__mj_UpdatedAt])
    BEGIN
        UPDATE
            [__mj_BizAppsReferrals].[ReferralRequest]
        SET
            __mj_UpdatedAt = GETUTCDATE()
        FROM
            [__mj_BizAppsReferrals].[ReferralRequest] AS _organicTable
        INNER JOIN
            INSERTED AS I ON
            _organicTable.[ID] = I.[ID];
    END
END;
GO

/* spUpdate Permissions for MJ_BizApps_Referrals: Referral Requests */

GRANT EXECUTE ON [__mj_BizAppsReferrals].[spUpdateReferralRequest] TO [cdp_Developer], [cdp_Integration];

/* spDelete SQL for MJ_BizApps_Referrals: Referral Requests */
-----------------------------------------------------------------
-- SQL Code Generation
-- Entity: MJ_BizApps_Referrals: Referral Requests
-- Item: spDeleteReferralRequest
--
-- This was generated by the MemberJunction CodeGen tool.
-- This file should NOT be edited by hand.
-----------------------------------------------------------------

------------------------------------------------------------
----- DELETE PROCEDURE FOR ReferralRequest
------------------------------------------------------------
IF OBJECT_ID('[__mj_BizAppsReferrals].[spDeleteReferralRequest]', 'P') IS NOT NULL
    DROP PROCEDURE [__mj_BizAppsReferrals].[spDeleteReferralRequest];
GO

CREATE PROCEDURE [__mj_BizAppsReferrals].[spDeleteReferralRequest]
    @ID uniqueidentifier
AS
BEGIN
    SET NOCOUNT ON;

    DELETE FROM
        [__mj_BizAppsReferrals].[ReferralRequest]
    WHERE
        [ID] = @ID


    -- Check if the delete was successful
    IF @@ROWCOUNT = 0
        SELECT NULL AS [ID] -- Return NULL for all primary key fields to indicate no record was deleted
    ELSE
        SELECT @ID AS [ID] -- Return the primary key values to indicate we successfully deleted the record
END
GO
GRANT EXECUTE ON [__mj_BizAppsReferrals].[spDeleteReferralRequest] TO [cdp_Developer], [cdp_Integration];

/* spDelete Permissions for MJ_BizApps_Referrals: Referral Requests */

GRANT EXECUTE ON [__mj_BizAppsReferrals].[spDeleteReferralRequest] TO [cdp_Developer], [cdp_Integration];

/* Index for Foreign Keys for ReferralTier */
-----------------------------------------------------------------
-- SQL Code Generation
-- Entity: MJ_BizApps_Referrals: Referral Tiers
-- Item: Index for Foreign Keys
--
-- This was generated by the MemberJunction CodeGen tool.
-- This file should NOT be edited by hand.
-----------------------------------------------------------------;

/* Base View SQL for MJ_BizApps_Referrals: Referral Tiers */
-----------------------------------------------------------------
-- SQL Code Generation
-- Entity: MJ_BizApps_Referrals: Referral Tiers
-- Item: vwReferralTiers
--
-- This was generated by the MemberJunction CodeGen tool.
-- This file should NOT be edited by hand.
-----------------------------------------------------------------

------------------------------------------------------------
----- BASE VIEW FOR ENTITY:      MJ_BizApps_Referrals: Referral Tiers
-----               SCHEMA:      __mj_BizAppsReferrals
-----               BASE TABLE:  ReferralTier
-----               PRIMARY KEY: ID
------------------------------------------------------------
IF OBJECT_ID('[__mj_BizAppsReferrals].[vwReferralTiers]', 'V') IS NOT NULL
    DROP VIEW [__mj_BizAppsReferrals].[vwReferralTiers];
GO

CREATE VIEW [__mj_BizAppsReferrals].[vwReferralTiers]
AS
SELECT
    r.*
FROM
    [__mj_BizAppsReferrals].[ReferralTier] AS r
GO
GRANT SELECT ON [__mj_BizAppsReferrals].[vwReferralTiers] TO [cdp_UI], [cdp_Developer], [cdp_Integration];

/* Base View Permissions SQL for MJ_BizApps_Referrals: Referral Tiers */
-----------------------------------------------------------------
-- SQL Code Generation
-- Entity: MJ_BizApps_Referrals: Referral Tiers
-- Item: Permissions for vwReferralTiers
--
-- This was generated by the MemberJunction CodeGen tool.
-- This file should NOT be edited by hand.
-----------------------------------------------------------------

GRANT SELECT ON [__mj_BizAppsReferrals].[vwReferralTiers] TO [cdp_UI], [cdp_Developer], [cdp_Integration];

/* spCreate SQL for MJ_BizApps_Referrals: Referral Tiers */
-----------------------------------------------------------------
-- SQL Code Generation
-- Entity: MJ_BizApps_Referrals: Referral Tiers
-- Item: spCreateReferralTier
--
-- This was generated by the MemberJunction CodeGen tool.
-- This file should NOT be edited by hand.
-----------------------------------------------------------------

------------------------------------------------------------
----- CREATE PROCEDURE FOR ReferralTier
------------------------------------------------------------
IF OBJECT_ID('[__mj_BizAppsReferrals].[spCreateReferralTier]', 'P') IS NOT NULL
    DROP PROCEDURE [__mj_BizAppsReferrals].[spCreateReferralTier];
GO

CREATE PROCEDURE [__mj_BizAppsReferrals].[spCreateReferralTier]
    @ID uniqueidentifier = NULL,
    @Name nvarchar(100),
    @Code nvarchar(50),
    @SLAResponseHours int = NULL,
    @MaxCascadeAttempts int = NULL,
    @PriorityWeight decimal(5, 2) = NULL,
    @RequireConflictCheck bit = NULL,
    @Description_Clear bit = 0,
    @Description nvarchar(MAX) = NULL,
    @IsActive bit = NULL
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @InsertedRow TABLE ([ID] UNIQUEIDENTIFIER)

    IF @ID IS NOT NULL
    BEGIN
        -- User provided a value, use it
        INSERT INTO [__mj_BizAppsReferrals].[ReferralTier]
            (
                [ID],
                [Name],
                [Code],
                [SLAResponseHours],
                [MaxCascadeAttempts],
                [PriorityWeight],
                [RequireConflictCheck],
                [Description],
                [IsActive]
            )
        OUTPUT INSERTED.[ID] INTO @InsertedRow
        VALUES
            (
                @ID,
                @Name,
                @Code,
                ISNULL(@SLAResponseHours, 24),
                ISNULL(@MaxCascadeAttempts, 3),
                ISNULL(@PriorityWeight, 1.00),
                ISNULL(@RequireConflictCheck, 1),
                CASE WHEN @Description_Clear = 1 THEN NULL ELSE ISNULL(@Description, NULL) END,
                ISNULL(@IsActive, 1)
            )
    END
    ELSE
    BEGIN
        -- No value provided, let database use its default (e.g., NEWSEQUENTIALID())
        INSERT INTO [__mj_BizAppsReferrals].[ReferralTier]
            (
                [Name],
                [Code],
                [SLAResponseHours],
                [MaxCascadeAttempts],
                [PriorityWeight],
                [RequireConflictCheck],
                [Description],
                [IsActive]
            )
        OUTPUT INSERTED.[ID] INTO @InsertedRow
        VALUES
            (
                @Name,
                @Code,
                ISNULL(@SLAResponseHours, 24),
                ISNULL(@MaxCascadeAttempts, 3),
                ISNULL(@PriorityWeight, 1.00),
                ISNULL(@RequireConflictCheck, 1),
                CASE WHEN @Description_Clear = 1 THEN NULL ELSE ISNULL(@Description, NULL) END,
                ISNULL(@IsActive, 1)
            )
    END
    -- return the new record from the base view, which might have some calculated fields
    SELECT * FROM [__mj_BizAppsReferrals].[vwReferralTiers] WHERE [ID] = (SELECT [ID] FROM @InsertedRow)
END
GO
GRANT EXECUTE ON [__mj_BizAppsReferrals].[spCreateReferralTier] TO [cdp_Developer], [cdp_Integration];

/* spCreate Permissions for MJ_BizApps_Referrals: Referral Tiers */

GRANT EXECUTE ON [__mj_BizAppsReferrals].[spCreateReferralTier] TO [cdp_Developer], [cdp_Integration];

/* spUpdate SQL for MJ_BizApps_Referrals: Referral Tiers */
-----------------------------------------------------------------
-- SQL Code Generation
-- Entity: MJ_BizApps_Referrals: Referral Tiers
-- Item: spUpdateReferralTier
--
-- This was generated by the MemberJunction CodeGen tool.
-- This file should NOT be edited by hand.
-----------------------------------------------------------------

------------------------------------------------------------
----- UPDATE PROCEDURE FOR ReferralTier
------------------------------------------------------------
IF OBJECT_ID('[__mj_BizAppsReferrals].[spUpdateReferralTier]', 'P') IS NOT NULL
    DROP PROCEDURE [__mj_BizAppsReferrals].[spUpdateReferralTier];
GO

CREATE PROCEDURE [__mj_BizAppsReferrals].[spUpdateReferralTier]
    @ID uniqueidentifier,
    @Name nvarchar(100) = NULL,
    @Code nvarchar(50) = NULL,
    @SLAResponseHours int = NULL,
    @MaxCascadeAttempts int = NULL,
    @PriorityWeight decimal(5, 2) = NULL,
    @RequireConflictCheck bit = NULL,
    @Description_Clear bit = 0,
    @Description nvarchar(MAX) = NULL,
    @IsActive bit = NULL
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE
        [__mj_BizAppsReferrals].[ReferralTier]
    SET
        [Name] = ISNULL(@Name, [Name]),
        [Code] = ISNULL(@Code, [Code]),
        [SLAResponseHours] = ISNULL(@SLAResponseHours, [SLAResponseHours]),
        [MaxCascadeAttempts] = ISNULL(@MaxCascadeAttempts, [MaxCascadeAttempts]),
        [PriorityWeight] = ISNULL(@PriorityWeight, [PriorityWeight]),
        [RequireConflictCheck] = ISNULL(@RequireConflictCheck, [RequireConflictCheck]),
        [Description] = CASE WHEN @Description_Clear = 1 THEN NULL ELSE ISNULL(@Description, [Description]) END,
        [IsActive] = ISNULL(@IsActive, [IsActive]),
        [__mj_UpdatedAt] = GETUTCDATE()
    WHERE
        [ID] = @ID

    -- Check if the update was successful
    IF @@ROWCOUNT = 0
        -- Nothing was updated, return no rows, but column structure from base view intact, semantically correct this way.
        SELECT TOP 0 * FROM [__mj_BizAppsReferrals].[vwReferralTiers] WHERE 1=0
    ELSE
        -- Return the updated record so the caller can see the updated values and any calculated fields
        SELECT
                                        *
                                    FROM
                                        [__mj_BizAppsReferrals].[vwReferralTiers]
                                    WHERE
                                        [ID] = @ID
                                    
END
GO

GRANT EXECUTE ON [__mj_BizAppsReferrals].[spUpdateReferralTier] TO [cdp_Developer], [cdp_Integration]
GO

------------------------------------------------------------
----- TRIGGER FOR __mj_UpdatedAt field for the ReferralTier table
------------------------------------------------------------
IF OBJECT_ID('[__mj_BizAppsReferrals].[trgUpdateReferralTier]', 'TR') IS NOT NULL
    DROP TRIGGER [__mj_BizAppsReferrals].[trgUpdateReferralTier];
GO
CREATE TRIGGER [__mj_BizAppsReferrals].trgUpdateReferralTier
ON [__mj_BizAppsReferrals].[ReferralTier]
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    IF NOT UPDATE([__mj_UpdatedAt])
    BEGIN
        UPDATE
            [__mj_BizAppsReferrals].[ReferralTier]
        SET
            __mj_UpdatedAt = GETUTCDATE()
        FROM
            [__mj_BizAppsReferrals].[ReferralTier] AS _organicTable
        INNER JOIN
            INSERTED AS I ON
            _organicTable.[ID] = I.[ID];
    END
END;
GO

/* spUpdate Permissions for MJ_BizApps_Referrals: Referral Tiers */

GRANT EXECUTE ON [__mj_BizAppsReferrals].[spUpdateReferralTier] TO [cdp_Developer], [cdp_Integration];

/* spDelete SQL for MJ_BizApps_Referrals: Referral Tiers */
-----------------------------------------------------------------
-- SQL Code Generation
-- Entity: MJ_BizApps_Referrals: Referral Tiers
-- Item: spDeleteReferralTier
--
-- This was generated by the MemberJunction CodeGen tool.
-- This file should NOT be edited by hand.
-----------------------------------------------------------------

------------------------------------------------------------
----- DELETE PROCEDURE FOR ReferralTier
------------------------------------------------------------
IF OBJECT_ID('[__mj_BizAppsReferrals].[spDeleteReferralTier]', 'P') IS NOT NULL
    DROP PROCEDURE [__mj_BizAppsReferrals].[spDeleteReferralTier];
GO

CREATE PROCEDURE [__mj_BizAppsReferrals].[spDeleteReferralTier]
    @ID uniqueidentifier
AS
BEGIN
    SET NOCOUNT ON;

    DELETE FROM
        [__mj_BizAppsReferrals].[ReferralTier]
    WHERE
        [ID] = @ID


    -- Check if the delete was successful
    IF @@ROWCOUNT = 0
        SELECT NULL AS [ID] -- Return NULL for all primary key fields to indicate no record was deleted
    ELSE
        SELECT @ID AS [ID] -- Return the primary key values to indicate we successfully deleted the record
END
GO
GRANT EXECUTE ON [__mj_BizAppsReferrals].[spDeleteReferralTier] TO [cdp_Developer], [cdp_Integration];

/* spDelete Permissions for MJ_BizApps_Referrals: Referral Tiers */

GRANT EXECUTE ON [__mj_BizAppsReferrals].[spDeleteReferralTier] TO [cdp_Developer], [cdp_Integration];

/* SQL text to insert 11 new entity field(s) */

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '635586cf-0dce-4096-a84a-bd498dedaed7' OR (EntityID = '7492A921-FFCF-4A3E-B59A-56C88D16DDE1' AND Name = 'Person')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '635586cf-0dce-4096-a84a-bd498dedaed7',
            '7492A921-FFCF-4A3E-B59A-56C88D16DDE1', -- Entity: MJ_BizApps_Referrals: Professional Profiles
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = '7492A921-FFCF-4A3E-B59A-56C88D16DDE1'),
            'Person',
            'Person',
            NULL,
            'nvarchar',
            500,
            0,
            0,
            1,
            NULL,
            0,
            0,
            1,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '781c4455-f8e4-4976-b645-6583697b6911' OR (EntityID = '7492A921-FFCF-4A3E-B59A-56C88D16DDE1' AND Name = 'Organization')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '781c4455-f8e4-4976-b645-6583697b6911',
            '7492A921-FFCF-4A3E-B59A-56C88D16DDE1', -- Entity: MJ_BizApps_Referrals: Professional Profiles
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = '7492A921-FFCF-4A3E-B59A-56C88D16DDE1'),
            'Organization',
            'Organization',
            NULL,
            'nvarchar',
            510,
            0,
            0,
            1,
            NULL,
            0,
            0,
            1,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '100b681b-3725-46ce-89f7-b5cb081583f3' OR (EntityID = '7492A921-FFCF-4A3E-B59A-56C88D16DDE1' AND Name = 'User')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '100b681b-3725-46ce-89f7-b5cb081583f3',
            '7492A921-FFCF-4A3E-B59A-56C88D16DDE1', -- Entity: MJ_BizApps_Referrals: Professional Profiles
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = '7492A921-FFCF-4A3E-B59A-56C88D16DDE1'),
            'User',
            'User',
            NULL,
            'nvarchar',
            200,
            0,
            0,
            1,
            NULL,
            0,
            0,
            1,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = 'fdca5635-868e-4cce-9ed4-4d7ce838b864' OR (EntityID = '9210D51B-1131-4C40-80DF-62DC5799AFFB' AND Name = 'Jurisdiction')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            'fdca5635-868e-4cce-9ed4-4d7ce838b864',
            '9210D51B-1131-4C40-80DF-62DC5799AFFB', -- Entity: MJ_BizApps_Referrals: Professional Jurisdictions
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = '9210D51B-1131-4C40-80DF-62DC5799AFFB'),
            'Jurisdiction',
            'Jurisdiction',
            NULL,
            'nvarchar',
            300,
            0,
            0,
            1,
            NULL,
            0,
            0,
            1,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '300feb4a-7954-40ce-9ace-a3e322ba9a76' OR (EntityID = 'FBE2E751-72F9-4136-9B77-755C1D192185' AND Name = 'PracticeArea')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '300feb4a-7954-40ce-9ace-a3e322ba9a76',
            'FBE2E751-72F9-4136-9B77-755C1D192185', -- Entity: MJ_BizApps_Referrals: Professional Practice Areas
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = 'FBE2E751-72F9-4136-9B77-755C1D192185'),
            'PracticeArea',
            'Practice Area',
            NULL,
            'nvarchar',
            300,
            0,
            0,
            1,
            NULL,
            0,
            0,
            1,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = 'cf52247d-b3c5-4cc1-a68e-633838807b80' OR (EntityID = 'C6A1D082-6230-40DC-BA5C-7CEE7EA820AF' AND Name = 'Parent')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            'cf52247d-b3c5-4cc1-a68e-633838807b80',
            'C6A1D082-6230-40DC-BA5C-7CEE7EA820AF', -- Entity: MJ_BizApps_Referrals: Practice Areas
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = 'C6A1D082-6230-40DC-BA5C-7CEE7EA820AF'),
            'Parent',
            'Parent',
            NULL,
            'nvarchar',
            300,
            0,
            0,
            1,
            NULL,
            0,
            0,
            1,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '5377781a-5f12-4960-ab5d-02bb7413ff86' OR (EntityID = 'C1CEBBE7-15E6-4134-B303-96F38D585F65' AND Name = 'SeekerPerson')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '5377781a-5f12-4960-ab5d-02bb7413ff86',
            'C1CEBBE7-15E6-4134-B303-96F38D585F65', -- Entity: MJ_BizApps_Referrals: Referral Requests
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = 'C1CEBBE7-15E6-4134-B303-96F38D585F65'),
            'SeekerPerson',
            'Seeker Person',
            NULL,
            'nvarchar',
            500,
            0,
            0,
            1,
            NULL,
            0,
            0,
            1,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '19069fbd-15a6-424c-b7f6-4a1169d9f0a2' OR (EntityID = 'C1CEBBE7-15E6-4134-B303-96F38D585F65' AND Name = 'PracticeArea')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '19069fbd-15a6-424c-b7f6-4a1169d9f0a2',
            'C1CEBBE7-15E6-4134-B303-96F38D585F65', -- Entity: MJ_BizApps_Referrals: Referral Requests
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = 'C1CEBBE7-15E6-4134-B303-96F38D585F65'),
            'PracticeArea',
            'Practice Area',
            NULL,
            'nvarchar',
            300,
            0,
            0,
            1,
            NULL,
            0,
            0,
            1,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '1b30218f-5efc-487b-93ae-55787c3bbd53' OR (EntityID = 'C1CEBBE7-15E6-4134-B303-96F38D585F65' AND Name = 'Jurisdiction')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '1b30218f-5efc-487b-93ae-55787c3bbd53',
            'C1CEBBE7-15E6-4134-B303-96F38D585F65', -- Entity: MJ_BizApps_Referrals: Referral Requests
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = 'C1CEBBE7-15E6-4134-B303-96F38D585F65'),
            'Jurisdiction',
            'Jurisdiction',
            NULL,
            'nvarchar',
            300,
            0,
            0,
            1,
            NULL,
            0,
            0,
            1,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '51cf6444-be79-4194-9662-557c5e1844c4' OR (EntityID = 'C1CEBBE7-15E6-4134-B303-96F38D585F65' AND Name = 'ReferralTier')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '51cf6444-be79-4194-9662-557c5e1844c4',
            'C1CEBBE7-15E6-4134-B303-96F38D585F65', -- Entity: MJ_BizApps_Referrals: Referral Requests
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = 'C1CEBBE7-15E6-4134-B303-96F38D585F65'),
            'ReferralTier',
            'Referral Tier',
            NULL,
            'nvarchar',
            200,
            0,
            0,
            1,
            NULL,
            0,
            0,
            1,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = 'c36097f7-23fe-4482-8431-6798d30a20d4' OR (EntityID = 'B6923104-236C-4100-BA23-C4AC354B47A8' AND Name = 'Parent')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            'c36097f7-23fe-4482-8431-6798d30a20d4',
            'B6923104-236C-4100-BA23-C4AC354B47A8', -- Entity: MJ_BizApps_Referrals: Jurisdictions
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = 'B6923104-236C-4100-BA23-C4AC354B47A8'),
            'Parent',
            'Parent',
            NULL,
            'nvarchar',
            300,
            0,
            0,
            1,
            NULL,
            0,
            0,
            1,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

/* Set field properties for entity */

               UPDATE [${flyway:defaultSchema}].[EntityField]
               SET IsNameField = 1
               WHERE ID = 'DBE2E816-1CC7-4735-95E6-D83AE19275E9'
               AND AutoUpdateIsNameField = 1;

               UPDATE [${flyway:defaultSchema}].[EntityField]
               SET IncludeInUserSearchAPI = 1
               WHERE ID = 'DBE2E816-1CC7-4735-95E6-D83AE19275E9'
               AND AutoUpdateIncludeInUserSearchAPI = 1;

               UPDATE [${flyway:defaultSchema}].[EntityField]
               SET IncludeInUserSearchAPI = 1
               WHERE ID = 'A1EE4E77-4916-47BC-A633-BEC3A23FC088'
               AND AutoUpdateIncludeInUserSearchAPI = 1;

               UPDATE [${flyway:defaultSchema}].[EntityField]
               SET UserSearchPredicateAPI = 'BeginsWith'
               WHERE ID = 'DBE2E816-1CC7-4735-95E6-D83AE19275E9'
               AND AutoUpdateUserSearchPredicate = 1;

               UPDATE [${flyway:defaultSchema}].[EntityField]
               SET UserSearchPredicateAPI = 'BeginsWith'
               WHERE ID = 'A1EE4E77-4916-47BC-A633-BEC3A23FC088'
               AND AutoUpdateUserSearchPredicate = 1;

            UPDATE [${flyway:defaultSchema}].[Entity]
            SET AllowUserSearchAPI = 1
            WHERE ID = 'B932CD45-C00E-4C73-A21F-FAE50020AF94'
            AND AutoUpdateAllowUserSearchAPI = 1;

/* Set field properties for entity */

               UPDATE [${flyway:defaultSchema}].[EntityField]
               SET IsNameField = 1
               WHERE ID = '4A9AB709-E94C-440E-B223-E685DA9AA21B'
               AND AutoUpdateIsNameField = 1;

               UPDATE [${flyway:defaultSchema}].[EntityField]
               SET DefaultInView = 1
               WHERE ID = '0F8A546A-44CD-451C-A8EA-B079FADADE8A'
               AND AutoUpdateDefaultInView = 1;

               UPDATE [${flyway:defaultSchema}].[EntityField]
               SET DefaultInView = 1
               WHERE ID = '958FF0A0-2AC1-4B23-BD6B-5CF09BC13049'
               AND AutoUpdateDefaultInView = 1;

               UPDATE [${flyway:defaultSchema}].[EntityField]
               SET DefaultInView = 1
               WHERE ID = 'FDCA5635-868E-4CCE-9ED4-4D7CE838B864'
               AND AutoUpdateDefaultInView = 1;

/* Set field properties for entity */

               UPDATE [${flyway:defaultSchema}].[EntityField]
               SET DefaultInView = 1
               WHERE ID = '957CFA38-3B85-424D-92E0-4815C76B2CA7'
               AND AutoUpdateDefaultInView = 1;

               UPDATE [${flyway:defaultSchema}].[EntityField]
               SET DefaultInView = 1
               WHERE ID = 'A2FC0DF3-2600-4048-ACDE-7A7750DA3BA9'
               AND AutoUpdateDefaultInView = 1;

            UPDATE [${flyway:defaultSchema}].[Entity]
            SET AllowUserSearchAPI = 0
            WHERE ID = 'C6A1D082-6230-40DC-BA5C-7CEE7EA820AF'
            AND AutoUpdateAllowUserSearchAPI = 1;

/* Set field properties for entity */

               UPDATE [${flyway:defaultSchema}].[EntityField]
               SET DefaultInView = 1
               WHERE ID = 'D5F5B137-5593-491A-B980-D7C4EB01C52A'
               AND AutoUpdateDefaultInView = 1;

               UPDATE [${flyway:defaultSchema}].[EntityField]
               SET DefaultInView = 1
               WHERE ID = '00A77B6A-6431-4423-93BA-952B35F7E579'
               AND AutoUpdateDefaultInView = 1;

            UPDATE [${flyway:defaultSchema}].[Entity]
            SET AllowUserSearchAPI = 0
            WHERE ID = 'B6923104-236C-4100-BA23-C4AC354B47A8'
            AND AutoUpdateAllowUserSearchAPI = 1;

/* Set field properties for entity */

               UPDATE [${flyway:defaultSchema}].[EntityField]
               SET DefaultInView = 1
               WHERE ID = 'E030ABD0-2CAE-4F59-83B2-AA3782C69D20'
               AND AutoUpdateDefaultInView = 1;

               UPDATE [${flyway:defaultSchema}].[EntityField]
               SET DefaultInView = 1
               WHERE ID = '300FEB4A-7954-40CE-9ACE-A3E322BA9A76'
               AND AutoUpdateDefaultInView = 1;

/* Set categories for 9 fields */

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Professional Practice Areas.ID 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'System Metadata',
   GeneratedFormSection = 'Category'
WHERE 
   ID = 'CB340133-B93A-4455-B8E5-2B5F0168D678';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Professional Practice Areas.ProfessionalProfileID 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'Professional Association',
   GeneratedFormSection = 'Category',
   DisplayName = 'Professional Profile'
WHERE 
   ID = 'A2D8DF94-A21B-4A62-A269-2C59FBEB3B03';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Professional Practice Areas.PracticeAreaID 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'Professional Association',
   GeneratedFormSection = 'Category',
   DisplayName = 'Practice Area'
WHERE 
   ID = 'CD5144BC-41C1-4628-835B-4211F22073C7';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Professional Practice Areas.ProficiencyLevel 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'Practice Details',
   GeneratedFormSection = 'Category'
WHERE 
   ID = '14680F63-D6D6-4231-B16D-DAE9CF2295BF';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Professional Practice Areas.YearsInPractice 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'Practice Details',
   GeneratedFormSection = 'Category'
WHERE 
   ID = '80E0EC03-6B28-4EDE-9DE7-92352ACC5F1B';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Professional Practice Areas.IsPrimary 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'Practice Details',
   GeneratedFormSection = 'Category'
WHERE 
   ID = 'E030ABD0-2CAE-4F59-83B2-AA3782C69D20';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Professional Practice Areas.PracticeArea 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'Practice Details',
   GeneratedFormSection = 'Category'
WHERE 
   ID = '300FEB4A-7954-40CE-9ACE-A3E322BA9A76';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Professional Practice Areas.__mj_CreatedAt 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'System Metadata',
   GeneratedFormSection = 'Category'
WHERE 
   ID = '7F8B2E5C-D6FA-45CE-B1A5-DEB2DEAE2927';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Professional Practice Areas.__mj_UpdatedAt 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'System Metadata',
   GeneratedFormSection = 'Category'
WHERE 
   ID = '6731B1C1-CA45-4996-81BC-E04A8D70071E';

/* Set categories for 9 fields */

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Conflict Check Parties.ID 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'System Metadata',
   GeneratedFormSection = 'Category'
WHERE 
   ID = '1DCA2DC1-E670-4489-BCBB-DDD5402F6EB3';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Conflict Check Parties.ReferralRequestID 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'Referral Context',
   GeneratedFormSection = 'Category',
   DisplayName = 'Referral Request'
WHERE 
   ID = '1D38D77A-72C4-4F63-A30B-7FF98A4FBCC4';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Conflict Check Parties.PartyName 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'Party Details',
   GeneratedFormSection = 'Category'
WHERE 
   ID = 'DBE2E816-1CC7-4735-95E6-D83AE19275E9';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Conflict Check Parties.PartyRole 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'Party Details',
   GeneratedFormSection = 'Category'
WHERE 
   ID = 'F236D4A8-FDCB-439F-9238-99FA20F9312F';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Conflict Check Parties.OrganizationName 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'Party Details',
   GeneratedFormSection = 'Category'
WHERE 
   ID = 'A1EE4E77-4916-47BC-A633-BEC3A23FC088';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Conflict Check Parties.NormalizedName 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'Party Details',
   GeneratedFormSection = 'Category'
WHERE 
   ID = 'DDFC9F7F-C4B1-4EEE-B616-2B6C86AEE557';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Conflict Check Parties.Notes 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'Referral Context',
   GeneratedFormSection = 'Category'
WHERE 
   ID = '157CE282-946E-4E9D-B73D-A2A204D4DE18';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Conflict Check Parties.__mj_CreatedAt 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'System Metadata',
   GeneratedFormSection = 'Category'
WHERE 
   ID = '9DFF9B4D-4E2E-4301-A475-88DA0514344B';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Conflict Check Parties.__mj_UpdatedAt 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'System Metadata',
   GeneratedFormSection = 'Category'
WHERE 
   ID = 'EA141BBE-3733-456D-84A0-7EAEEC56B6FE';

/* Set entity icon to fa fa-users */

               UPDATE [${flyway:defaultSchema}].[Entity]
               SET [Icon] = 'fa fa-users', [__mj_UpdatedAt] = GETUTCDATE()
               WHERE [ID] = 'B932CD45-C00E-4C73-A21F-FAE50020AF94';

/* Set entity icon to fa fa-link */

               UPDATE [${flyway:defaultSchema}].[Entity]
               SET [Icon] = 'fa fa-link', [__mj_UpdatedAt] = GETUTCDATE()
               WHERE [ID] = 'FBE2E751-72F9-4136-9B77-755C1D192185';

/* Insert FieldCategoryInfo setting for entity */
IF NOT EXISTS (
      SELECT 1 FROM [${flyway:defaultSchema}].[EntitySetting] WHERE [EntityID] = 'B932CD45-C00E-4C73-A21F-FAE50020AF94' AND [Name] = 'FieldCategoryInfo'
   )
   BEGIN
      INSERT INTO [${flyway:defaultSchema}].[EntitySetting] ([ID], [EntityID], [Name], [Value], [__mj_CreatedAt], [__mj_UpdatedAt])
               VALUES ('e10df87b-e90f-57ea-897c-0d2343f4ac45', 'B932CD45-C00E-4C73-A21F-FAE50020AF94', 'FieldCategoryInfo', '{
  "Party Details": {
    "description": "Information regarding the party, role, and organization screened for conflicts",
    "icon": "fa fa-user-shield"
  },
  "Referral Context": {
    "description": "Associated referral request connection and contextual notes",
    "icon": "fa fa-file-alt"
  },
  "System Metadata": {
    "description": "System-managed audit and tracking fields",
    "icon": "fa fa-cog"
  }
}', GETUTCDATE(), GETUTCDATE())
   END;

/* Insert FieldCategoryInfo setting for entity */
IF NOT EXISTS (
      SELECT 1 FROM [${flyway:defaultSchema}].[EntitySetting] WHERE [EntityID] = 'FBE2E751-72F9-4136-9B77-755C1D192185' AND [Name] = 'FieldCategoryInfo'
   )
   BEGIN
      INSERT INTO [${flyway:defaultSchema}].[EntitySetting] ([ID], [EntityID], [Name], [Value], [__mj_CreatedAt], [__mj_UpdatedAt])
               VALUES ('fc031f17-ee1b-5298-b468-98a5320f8f61', 'FBE2E751-72F9-4136-9B77-755C1D192185', 'FieldCategoryInfo', '{
  "Practice Details": {
    "description": "Proficiency, experience, and metadata regarding the practice area association",
    "icon": "fa fa-certificate"
  },
  "Professional Association": {
    "description": "Foreign key relationships linking professionals and practice areas",
    "icon": "fa fa-user-tie"
  },
  "System Metadata": {
    "description": "System-managed audit and tracking fields",
    "icon": "fa fa-cog"
  }
}', GETUTCDATE(), GETUTCDATE())
   END;

/* Insert FieldCategoryIcons setting (legacy) */
IF NOT EXISTS (
      SELECT 1 FROM [${flyway:defaultSchema}].[EntitySetting] WHERE [EntityID] = 'FBE2E751-72F9-4136-9B77-755C1D192185' AND [Name] = 'FieldCategoryIcons'
   )
   BEGIN
      INSERT INTO [${flyway:defaultSchema}].[EntitySetting] ([ID], [EntityID], [Name], [Value], [__mj_CreatedAt], [__mj_UpdatedAt])
               VALUES ('54dfa092-9504-513d-b6e0-a7149af166ac', 'FBE2E751-72F9-4136-9B77-755C1D192185', 'FieldCategoryIcons', '{
  "Practice Details": "fa fa-certificate",
  "Professional Association": "fa fa-user-tie",
  "System Metadata": "fa fa-cog"
}', GETUTCDATE(), GETUTCDATE())
   END;

/* Insert FieldCategoryIcons setting (legacy) */
IF NOT EXISTS (
      SELECT 1 FROM [${flyway:defaultSchema}].[EntitySetting] WHERE [EntityID] = 'B932CD45-C00E-4C73-A21F-FAE50020AF94' AND [Name] = 'FieldCategoryIcons'
   )
   BEGIN
      INSERT INTO [${flyway:defaultSchema}].[EntitySetting] ([ID], [EntityID], [Name], [Value], [__mj_CreatedAt], [__mj_UpdatedAt])
               VALUES ('ea45e930-f8af-5edc-87b6-211d9651fd58', 'B932CD45-C00E-4C73-A21F-FAE50020AF94', 'FieldCategoryIcons', '{
  "Party Details": "fa fa-user-shield",
  "Referral Context": "fa fa-file-alt",
  "System Metadata": "fa fa-cog"
}', GETUTCDATE(), GETUTCDATE())
   END;

/* Set DefaultForNewUser=true for NEW entity (category: supporting, confidence: high) */

         UPDATE [${flyway:defaultSchema}].[ApplicationEntity]
         SET [DefaultForNewUser] = 1, [__mj_UpdatedAt] = GETUTCDATE()
         WHERE [EntityID] = 'B932CD45-C00E-4C73-A21F-FAE50020AF94';

/* Set DefaultForNewUser=false for NEW entity (category: junction, confidence: high) */

         UPDATE [${flyway:defaultSchema}].[ApplicationEntity]
         SET [DefaultForNewUser] = 0, [__mj_UpdatedAt] = GETUTCDATE()
         WHERE [EntityID] = 'FBE2E751-72F9-4136-9B77-755C1D192185';

/* Set categories for 11 fields */

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Jurisdictions.ID 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'System Metadata',
   GeneratedFormSection = 'Category'
WHERE 
   ID = 'DBA789AD-C262-45E1-95D6-D405F13E6D22';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Jurisdictions.ParentID 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'Jurisdiction Hierarchy',
   GeneratedFormSection = 'Category'
WHERE 
   ID = 'EBC62E63-38B2-4B42-8466-4F985D17DE48';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Jurisdictions.Parent 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'Jurisdiction Hierarchy',
   GeneratedFormSection = 'Category'
WHERE 
   ID = 'C36097F7-23FE-4482-8431-6798D30A20D4';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Jurisdictions.Name 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'Jurisdiction Details',
   GeneratedFormSection = 'Category'
WHERE 
   ID = '1BCD3D84-3C06-419F-BBE3-C5A0FBB3C27E';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Jurisdictions.Code 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'Jurisdiction Details',
   GeneratedFormSection = 'Category',
   ExtendedType = 'Code',
   CodeType = 'Other'
WHERE 
   ID = '31AD93D3-F071-4D45-A405-E87BBF83F6C9';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Jurisdictions.JurisdictionType 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'Jurisdiction Details',
   GeneratedFormSection = 'Category'
WHERE 
   ID = '9EA3C4AD-4130-4B75-A1FE-0DA765337488';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Jurisdictions.CountryCode 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'Geographic Codes',
   GeneratedFormSection = 'Category',
   ExtendedType = 'GeoCountry'
WHERE 
   ID = 'D5F5B137-5593-491A-B980-D7C4EB01C52A';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Jurisdictions.StateProvinceCode 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'Geographic Codes',
   GeneratedFormSection = 'Category',
   DisplayName = 'State/Province Code',
   ExtendedType = 'GeoStateProvince'
WHERE 
   ID = '2023C5C8-FB4A-4BF0-8E70-65AF11DAF59C';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Jurisdictions.IsActive 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'Jurisdiction Details',
   GeneratedFormSection = 'Category'
WHERE 
   ID = '00A77B6A-6431-4423-93BA-952B35F7E579';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Jurisdictions.__mj_CreatedAt 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'System Metadata',
   GeneratedFormSection = 'Category'
WHERE 
   ID = '333D66EC-A66C-420F-89D6-23AF0EDC2737';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Jurisdictions.__mj_UpdatedAt 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'System Metadata',
   GeneratedFormSection = 'Category'
WHERE 
   ID = 'AF5FA449-28F3-4E5F-96C2-34541756683F';

/* Set SupportsGeoCoding = true for MJ_BizApps_Referrals: Jurisdictions */

            UPDATE [${flyway:defaultSchema}].[Entity]
            SET [SupportsGeoCoding] = 1
            WHERE [ID] = 'B6923104-236C-4100-BA23-C4AC354B47A8' AND [AutoUpdateSupportsGeoCoding] = 1;

/* Set entity icon to fa fa-globe */

               UPDATE [${flyway:defaultSchema}].[Entity]
               SET [Icon] = 'fa fa-globe', [__mj_UpdatedAt] = GETUTCDATE()
               WHERE [ID] = 'B6923104-236C-4100-BA23-C4AC354B47A8';

/* Insert FieldCategoryInfo setting for entity */
IF NOT EXISTS (
      SELECT 1 FROM [${flyway:defaultSchema}].[EntitySetting] WHERE [EntityID] = 'B6923104-236C-4100-BA23-C4AC354B47A8' AND [Name] = 'FieldCategoryInfo'
   )
   BEGIN
      INSERT INTO [${flyway:defaultSchema}].[EntitySetting] ([ID], [EntityID], [Name], [Value], [__mj_CreatedAt], [__mj_UpdatedAt])
               VALUES ('0a00fa2c-fcc9-54d3-9982-abc5e396529d', 'B6923104-236C-4100-BA23-C4AC354B47A8', 'FieldCategoryInfo', '{
  "Geographic Codes": {
    "description": "Geographic identifiers including country and state codes",
    "icon": "fa fa-map-marker-alt"
  },
  "Jurisdiction Details": {
    "description": "Core descriptive information and status of the jurisdiction",
    "icon": "fa fa-landmark"
  },
  "Jurisdiction Hierarchy": {
    "description": "Hierarchical parent-child relationships between jurisdictions",
    "icon": "fa fa-sitemap"
  },
  "System Metadata": {
    "description": "System-managed audit and tracking fields",
    "icon": "fa fa-cog"
  }
}', GETUTCDATE(), GETUTCDATE())
   END;

/* Insert FieldCategoryIcons setting (legacy) */
IF NOT EXISTS (
      SELECT 1 FROM [${flyway:defaultSchema}].[EntitySetting] WHERE [EntityID] = 'B6923104-236C-4100-BA23-C4AC354B47A8' AND [Name] = 'FieldCategoryIcons'
   )
   BEGIN
      INSERT INTO [${flyway:defaultSchema}].[EntitySetting] ([ID], [EntityID], [Name], [Value], [__mj_CreatedAt], [__mj_UpdatedAt])
               VALUES ('c9c43937-314b-5dae-a445-157e89e286e4', 'B6923104-236C-4100-BA23-C4AC354B47A8', 'FieldCategoryIcons', '{
  "Geographic Codes": "fa fa-map-marker-alt",
  "Jurisdiction Details": "fa fa-landmark",
  "Jurisdiction Hierarchy": "fa fa-sitemap",
  "System Metadata": "fa fa-cog"
}', GETUTCDATE(), GETUTCDATE())
   END;

/* Set DefaultForNewUser=false for NEW entity (category: reference, confidence: high) */

         UPDATE [${flyway:defaultSchema}].[ApplicationEntity]
         SET [DefaultForNewUser] = 0, [__mj_UpdatedAt] = GETUTCDATE()
         WHERE [EntityID] = 'B6923104-236C-4100-BA23-C4AC354B47A8';

/* Set categories for 10 fields */

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Professional Jurisdictions.ID 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'System Metadata',
   GeneratedFormSection = 'Category'
WHERE 
   ID = '5C914225-AC1D-418C-A01E-EC97EBDA279B';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Professional Jurisdictions.ProfessionalProfileID 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'Relationships',
   GeneratedFormSection = 'Category',
   DisplayName = 'Professional Profile'
WHERE 
   ID = '956E95DE-7EEE-428B-A65E-688DE8F3B5A4';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Professional Jurisdictions.JurisdictionID 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'Relationships',
   GeneratedFormSection = 'Category'
WHERE 
   ID = '323CCDBD-4F3F-44A0-9539-981E32914407';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Professional Jurisdictions.LicenseNumber 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'License Details',
   GeneratedFormSection = 'Category'
WHERE 
   ID = '4A9AB709-E94C-440E-B223-E685DA9AA21B';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Professional Jurisdictions.AdmissionYear 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'License Details',
   GeneratedFormSection = 'Category'
WHERE 
   ID = '0C7D392B-8384-44FB-AB9A-9DA8118A47DB';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Professional Jurisdictions.StandingStatus 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'License Details',
   GeneratedFormSection = 'Category'
WHERE 
   ID = '0F8A546A-44CD-451C-A8EA-B079FADADE8A';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Professional Jurisdictions.IsPrimary 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'License Details',
   GeneratedFormSection = 'Category'
WHERE 
   ID = '958FF0A0-2AC1-4B23-BD6B-5CF09BC13049';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Professional Jurisdictions.Jurisdiction 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'License Details',
   GeneratedFormSection = 'Category'
WHERE 
   ID = 'FDCA5635-868E-4CCE-9ED4-4D7CE838B864';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Professional Jurisdictions.__mj_CreatedAt 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'System Metadata',
   GeneratedFormSection = 'Category'
WHERE 
   ID = '8D8E36F4-D49E-49D7-9C5D-C92295AA2A65';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Professional Jurisdictions.__mj_UpdatedAt 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'System Metadata',
   GeneratedFormSection = 'Category'
WHERE 
   ID = '45C4534D-7629-4673-A9F7-53F54318C417';

/* Set entity icon to fa fa-balance-scale */

               UPDATE [${flyway:defaultSchema}].[Entity]
               SET [Icon] = 'fa fa-balance-scale', [__mj_UpdatedAt] = GETUTCDATE()
               WHERE [ID] = '9210D51B-1131-4C40-80DF-62DC5799AFFB';

/* Insert FieldCategoryInfo setting for entity */
IF NOT EXISTS (
      SELECT 1 FROM [${flyway:defaultSchema}].[EntitySetting] WHERE [EntityID] = '9210D51B-1131-4C40-80DF-62DC5799AFFB' AND [Name] = 'FieldCategoryInfo'
   )
   BEGIN
      INSERT INTO [${flyway:defaultSchema}].[EntitySetting] ([ID], [EntityID], [Name], [Value], [__mj_CreatedAt], [__mj_UpdatedAt])
               VALUES ('6d10840b-cce9-524d-ab9c-1ddac0230102', '9210D51B-1131-4C40-80DF-62DC5799AFFB', 'FieldCategoryInfo', '{
  "License Details": {
    "description": "License numbers, admission years, and standing statuses",
    "icon": "fa fa-id-card"
  },
  "Relationships": {
    "description": "Foreign key relationships connecting professionals and jurisdictions",
    "icon": "fa fa-link"
  },
  "System Metadata": {
    "description": "System-managed audit and tracking fields",
    "icon": "fa fa-cog"
  }
}', GETUTCDATE(), GETUTCDATE())
   END;

/* Insert FieldCategoryIcons setting (legacy) */
IF NOT EXISTS (
      SELECT 1 FROM [${flyway:defaultSchema}].[EntitySetting] WHERE [EntityID] = '9210D51B-1131-4C40-80DF-62DC5799AFFB' AND [Name] = 'FieldCategoryIcons'
   )
   BEGIN
      INSERT INTO [${flyway:defaultSchema}].[EntitySetting] ([ID], [EntityID], [Name], [Value], [__mj_CreatedAt], [__mj_UpdatedAt])
               VALUES ('e23bba66-7ae3-5b3a-a1ed-68173c014f5f', '9210D51B-1131-4C40-80DF-62DC5799AFFB', 'FieldCategoryIcons', '{
  "License Details": "fa fa-id-card",
  "Relationships": "fa fa-link",
  "System Metadata": "fa fa-cog"
}', GETUTCDATE(), GETUTCDATE())
   END;

/* Set DefaultForNewUser=false for NEW entity (category: junction, confidence: high) */

         UPDATE [${flyway:defaultSchema}].[ApplicationEntity]
         SET [DefaultForNewUser] = 0, [__mj_UpdatedAt] = GETUTCDATE()
         WHERE [EntityID] = '9210D51B-1131-4C40-80DF-62DC5799AFFB';

/* Set categories for 12 fields */

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Practice Areas.ID 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'System Metadata',
   GeneratedFormSection = 'Category'
WHERE 
   ID = '46CC9832-CD04-4896-AF06-BF84F0A2692E';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Practice Areas.ParentID 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'Practice Area Details',
   GeneratedFormSection = 'Category'
WHERE 
   ID = '4C1CDF4F-CA86-43EC-8630-3BF69B2FC9B4';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Practice Areas.Name 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'Practice Area Details',
   GeneratedFormSection = 'Category'
WHERE 
   ID = '70B09666-980E-4181-BB79-119D945B29CD';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Practice Areas.Code 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'Practice Area Details',
   GeneratedFormSection = 'Category'
WHERE 
   ID = '7180B2F3-8B6E-412B-BDE8-7CD309E98E29';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Practice Areas.Category 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'Practice Area Details',
   GeneratedFormSection = 'Category'
WHERE 
   ID = '57D35B91-E024-43EF-A59D-7A0442AD125F';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Practice Areas.Description 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'Practice Area Details',
   GeneratedFormSection = 'Category'
WHERE 
   ID = '58490376-0169-4E4E-A636-E5DA36B91705';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Practice Areas.IconClass 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'Display and Configuration',
   GeneratedFormSection = 'Category',
   ExtendedType = 'Icon'
WHERE 
   ID = 'EFD3D2CC-45EA-4830-BE9F-12D695F8B63E';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Practice Areas.DisplayRank 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'Display and Configuration',
   GeneratedFormSection = 'Category'
WHERE 
   ID = '957CFA38-3B85-424D-92E0-4815C76B2CA7';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Practice Areas.IsActive 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'Display and Configuration',
   GeneratedFormSection = 'Category',
   DisplayName = 'Active'
WHERE 
   ID = 'A2FC0DF3-2600-4048-ACDE-7A7750DA3BA9';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Practice Areas.__mj_CreatedAt 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'System Metadata',
   GeneratedFormSection = 'Category'
WHERE 
   ID = 'B85482D7-DE17-4C8C-BE11-F16A8E043C10';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Practice Areas.__mj_UpdatedAt 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'System Metadata',
   GeneratedFormSection = 'Category'
WHERE 
   ID = 'D9E35CCD-8AAD-472A-A520-DBF3D325215C';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Practice Areas.Parent 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'Practice Area Details',
   GeneratedFormSection = 'Category'
WHERE 
   ID = 'CF52247D-B3C5-4CC1-A68E-633838807B80';

/* Set entity icon to fa fa-sitemap */

               UPDATE [${flyway:defaultSchema}].[Entity]
               SET [Icon] = 'fa fa-sitemap', [__mj_UpdatedAt] = GETUTCDATE()
               WHERE [ID] = 'C6A1D082-6230-40DC-BA5C-7CEE7EA820AF';

/* Insert FieldCategoryInfo setting for entity */
IF NOT EXISTS (
      SELECT 1 FROM [${flyway:defaultSchema}].[EntitySetting] WHERE [EntityID] = 'C6A1D082-6230-40DC-BA5C-7CEE7EA820AF' AND [Name] = 'FieldCategoryInfo'
   )
   BEGIN
      INSERT INTO [${flyway:defaultSchema}].[EntitySetting] ([ID], [EntityID], [Name], [Value], [__mj_CreatedAt], [__mj_UpdatedAt])
               VALUES ('973cb0eb-a9e9-58bb-a04e-ad490d56db4b', 'C6A1D082-6230-40DC-BA5C-7CEE7EA820AF', 'FieldCategoryInfo', '{
  "Display and Configuration": {
    "description": "UI display settings, ordering, and active status",
    "icon": "fa fa-sliders-h"
  },
  "Practice Area Details": {
    "description": "Core descriptive and hierarchical details for the practice area",
    "icon": "fa fa-folder"
  },
  "System Metadata": {
    "description": "System-managed audit and tracking fields",
    "icon": "fa fa-cog"
  }
}', GETUTCDATE(), GETUTCDATE())
   END;

/* Insert FieldCategoryIcons setting (legacy) */
IF NOT EXISTS (
      SELECT 1 FROM [${flyway:defaultSchema}].[EntitySetting] WHERE [EntityID] = 'C6A1D082-6230-40DC-BA5C-7CEE7EA820AF' AND [Name] = 'FieldCategoryIcons'
   )
   BEGIN
      INSERT INTO [${flyway:defaultSchema}].[EntitySetting] ([ID], [EntityID], [Name], [Value], [__mj_CreatedAt], [__mj_UpdatedAt])
               VALUES ('857eda4d-d46f-5239-9055-363809a1bdf1', 'C6A1D082-6230-40DC-BA5C-7CEE7EA820AF', 'FieldCategoryIcons', '{
  "Display and Configuration": "fa fa-sliders-h",
  "Practice Area Details": "fa fa-folder",
  "System Metadata": "fa fa-cog"
}', GETUTCDATE(), GETUTCDATE())
   END;

/* Set DefaultForNewUser=false for NEW entity (category: reference, confidence: high) */

         UPDATE [${flyway:defaultSchema}].[ApplicationEntity]
         SET [DefaultForNewUser] = 0, [__mj_UpdatedAt] = GETUTCDATE()
         WHERE [EntityID] = 'C6A1D082-6230-40DC-BA5C-7CEE7EA820AF';

/* Set field properties for entity */

               UPDATE [${flyway:defaultSchema}].[EntityField]
               SET IsNameField = 1
               WHERE ID = '26A540E5-208F-43FC-BD0D-E07E1E87EE13'
               AND AutoUpdateIsNameField = 1;

               UPDATE [${flyway:defaultSchema}].[EntityField]
               SET DefaultInView = 1
               WHERE ID = '92A1176F-7429-4DEB-9AD7-C20775854C9E'
               AND AutoUpdateDefaultInView = 1;

               UPDATE [${flyway:defaultSchema}].[EntityField]
               SET DefaultInView = 1
               WHERE ID = 'FCB14234-4787-41DB-99DE-EE9E71D44A13'
               AND AutoUpdateDefaultInView = 1;

               UPDATE [${flyway:defaultSchema}].[EntityField]
               SET DefaultInView = 1
               WHERE ID = '8E0C8435-5647-45B8-95B0-3AE2570A6609'
               AND AutoUpdateDefaultInView = 1;

               UPDATE [${flyway:defaultSchema}].[EntityField]
               SET DefaultInView = 1
               WHERE ID = '19069FBD-15A6-424C-B7F6-4A1169D9F0A2'
               AND AutoUpdateDefaultInView = 1;

               UPDATE [${flyway:defaultSchema}].[EntityField]
               SET DefaultInView = 1
               WHERE ID = '1B30218F-5EFC-487B-93AE-55787C3BBD53'
               AND AutoUpdateDefaultInView = 1;

               UPDATE [${flyway:defaultSchema}].[EntityField]
               SET IncludeInUserSearchAPI = 1
               WHERE ID = '26A540E5-208F-43FC-BD0D-E07E1E87EE13'
               AND AutoUpdateIncludeInUserSearchAPI = 1;

               UPDATE [${flyway:defaultSchema}].[EntityField]
               SET IncludeInUserSearchAPI = 1
               WHERE ID = '8CD3DFD6-0FD0-4A46-AE27-E43208043560'
               AND AutoUpdateIncludeInUserSearchAPI = 1;

               UPDATE [${flyway:defaultSchema}].[EntityField]
               SET IncludeInUserSearchAPI = 1
               WHERE ID = '6F6EC755-9924-4184-94B3-56DD1036FEE6'
               AND AutoUpdateIncludeInUserSearchAPI = 1;

               UPDATE [${flyway:defaultSchema}].[EntityField]
               SET UserSearchPredicateAPI = 'Exact'
               WHERE ID = '26A540E5-208F-43FC-BD0D-E07E1E87EE13'
               AND AutoUpdateUserSearchPredicate = 1;

               UPDATE [${flyway:defaultSchema}].[EntityField]
               SET UserSearchPredicateAPI = 'BeginsWith'
               WHERE ID = '8CD3DFD6-0FD0-4A46-AE27-E43208043560'
               AND AutoUpdateUserSearchPredicate = 1;

               UPDATE [${flyway:defaultSchema}].[EntityField]
               SET UserSearchPredicateAPI = 'Exact'
               WHERE ID = '6F6EC755-9924-4184-94B3-56DD1036FEE6'
               AND AutoUpdateUserSearchPredicate = 1;

            UPDATE [${flyway:defaultSchema}].[Entity]
            SET AllowUserSearchAPI = 1
            WHERE ID = 'C1CEBBE7-15E6-4134-B303-96F38D585F65'
            AND AutoUpdateAllowUserSearchAPI = 1;

/* Set field properties for entity */

               UPDATE [${flyway:defaultSchema}].[EntityField]
               SET IsNameField = 1
               WHERE ID = 'C89FC820-344B-461D-81E7-F4C7F9731A62'
               AND AutoUpdateIsNameField = 1;

               UPDATE [${flyway:defaultSchema}].[EntityField]
               SET DefaultInView = 1
               WHERE ID = '1CC0E9DA-DDAE-4BAA-A1D1-A49E4818046B'
               AND AutoUpdateDefaultInView = 1;

               UPDATE [${flyway:defaultSchema}].[EntityField]
               SET DefaultInView = 1
               WHERE ID = '1E8782FA-7425-4874-AA2B-6A4042B3F946'
               AND AutoUpdateDefaultInView = 1;

               UPDATE [${flyway:defaultSchema}].[EntityField]
               SET DefaultInView = 1
               WHERE ID = 'ECD37B36-34A0-42A7-9B3D-A7CCD0EBB22C'
               AND AutoUpdateDefaultInView = 1;

               UPDATE [${flyway:defaultSchema}].[EntityField]
               SET DefaultInView = 1
               WHERE ID = '49656B23-A371-4F3D-9DD4-4824B97AAED3'
               AND AutoUpdateDefaultInView = 1;

               UPDATE [${flyway:defaultSchema}].[EntityField]
               SET DefaultInView = 1
               WHERE ID = 'E3F0C72B-1636-4946-95C9-DAA745BAB823'
               AND AutoUpdateDefaultInView = 1;

               UPDATE [${flyway:defaultSchema}].[EntityField]
               SET DefaultInView = 1
               WHERE ID = '0D3740E5-6748-4B2D-977C-9289D94FB1CF'
               AND AutoUpdateDefaultInView = 1;

               UPDATE [${flyway:defaultSchema}].[EntityField]
               SET IncludeInUserSearchAPI = 1
               WHERE ID = '1E8782FA-7425-4874-AA2B-6A4042B3F946'
               AND AutoUpdateIncludeInUserSearchAPI = 1;

               UPDATE [${flyway:defaultSchema}].[EntityField]
               SET IncludeInUserSearchAPI = 1
               WHERE ID = 'ECD37B36-34A0-42A7-9B3D-A7CCD0EBB22C'
               AND AutoUpdateIncludeInUserSearchAPI = 1;

               UPDATE [${flyway:defaultSchema}].[EntityField]
               SET UserSearchPredicateAPI = 'Exact'
               WHERE ID = '1E8782FA-7425-4874-AA2B-6A4042B3F946'
               AND AutoUpdateUserSearchPredicate = 1;

               UPDATE [${flyway:defaultSchema}].[EntityField]
               SET UserSearchPredicateAPI = 'Exact'
               WHERE ID = 'ECD37B36-34A0-42A7-9B3D-A7CCD0EBB22C'
               AND AutoUpdateUserSearchPredicate = 1;

/* Set field properties for entity */

               UPDATE [${flyway:defaultSchema}].[EntityField]
               SET DefaultInView = 1
               WHERE ID = 'AFC53643-7573-45BA-8AD1-428F322998DD'
               AND AutoUpdateDefaultInView = 1;

               UPDATE [${flyway:defaultSchema}].[EntityField]
               SET DefaultInView = 1
               WHERE ID = '39FA22AE-02FA-4C9A-8592-95C9D1ADF13F'
               AND AutoUpdateDefaultInView = 1;

               UPDATE [${flyway:defaultSchema}].[EntityField]
               SET DefaultInView = 1
               WHERE ID = '7123C246-C445-4E19-9D7C-8253A3425726'
               AND AutoUpdateDefaultInView = 1;

               UPDATE [${flyway:defaultSchema}].[EntityField]
               SET DefaultInView = 1
               WHERE ID = 'D7BE615E-FC42-4A6D-902E-004FCEF4F254'
               AND AutoUpdateDefaultInView = 1;

/* Set field properties for entity */

               UPDATE [${flyway:defaultSchema}].[EntityField]
               SET DefaultInView = 1
               WHERE ID = '4E230A37-0306-45D8-862B-8280F3686087'
               AND AutoUpdateDefaultInView = 1;

            UPDATE [${flyway:defaultSchema}].[Entity]
            SET AllowUserSearchAPI = 0
            WHERE ID = '48BAF761-CB15-47B8-BE87-C6D1B54F25F6'
            AND AutoUpdateAllowUserSearchAPI = 1;

/* Set field properties for entity */

               UPDATE [${flyway:defaultSchema}].[EntityField]
               SET DefaultInView = 1
               WHERE ID = '66AECA71-8D4A-4C59-A5C5-277235DD8B75'
               AND AutoUpdateDefaultInView = 1;

               UPDATE [${flyway:defaultSchema}].[EntityField]
               SET DefaultInView = 1
               WHERE ID = 'CC98A578-C55A-4935-9FF2-425AF0927A86'
               AND AutoUpdateDefaultInView = 1;

               UPDATE [${flyway:defaultSchema}].[EntityField]
               SET DefaultInView = 1
               WHERE ID = 'EA68D08D-AF91-40BC-BBAB-D95EBF79129D'
               AND AutoUpdateDefaultInView = 1;

/* Set categories for 28 fields */

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Referral Requests.ID 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'System Metadata',
   GeneratedFormSection = 'Category'
WHERE 
   ID = '1BCEAD30-BC52-4BBA-87B3-F068881D1F23';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Referral Requests.RequestNumber 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'Request Details',
   GeneratedFormSection = 'Category'
WHERE 
   ID = '26A540E5-208F-43FC-BD0D-E07E1E87EE13';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Referral Requests.SeekerName 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'Seeker Information',
   GeneratedFormSection = 'Category'
WHERE 
   ID = '8CD3DFD6-0FD0-4A46-AE27-E43208043560';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Referral Requests.SeekerEmail 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'Seeker Information',
   GeneratedFormSection = 'Category',
   ExtendedType = 'Email'
WHERE 
   ID = '6F6EC755-9924-4184-94B3-56DD1036FEE6';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Referral Requests.SeekerPhone 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'Seeker Information',
   GeneratedFormSection = 'Category',
   ExtendedType = 'Tel'
WHERE 
   ID = '8CFB7D21-5D46-4159-AA17-E383975FD7BD';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Referral Requests.SeekerCompany 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'Seeker Information',
   GeneratedFormSection = 'Category'
WHERE 
   ID = '03D557A1-FE80-4E42-8727-42C0F0EB49AE';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Referral Requests.SeekerPersonID 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'Seeker Information',
   GeneratedFormSection = 'Category',
   DisplayName = 'Seeker Person'
WHERE 
   ID = 'C167DB68-E9E4-45D2-A54F-613B5DBB64AF';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Referral Requests.PracticeAreaID 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'Matter Information',
   GeneratedFormSection = 'Category',
   DisplayName = 'Practice Area'
WHERE 
   ID = '16B64C7D-24BB-4787-AD16-271889DD6A9A';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Referral Requests.JurisdictionID 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'Matter Information',
   GeneratedFormSection = 'Category',
   DisplayName = 'Jurisdiction'
WHERE 
   ID = '5716607D-5B6D-4702-9A99-104BC0C33EF9';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Referral Requests.ReferralTierID 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'Matter Information',
   GeneratedFormSection = 'Category',
   DisplayName = 'Referral Tier'
WHERE 
   ID = '15C9482E-E275-4D4C-BE4B-642DBDC2AEE0';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Referral Requests.MatterTitle 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'Matter Information',
   GeneratedFormSection = 'Category'
WHERE 
   ID = '3F227F7E-8333-42E5-8304-FE10711896BF';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Referral Requests.MatterSummary 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'Matter Information',
   GeneratedFormSection = 'Category'
WHERE 
   ID = '484ABD7F-078D-4C25-9551-8309DB64A30A';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Referral Requests.UrgencyLevel 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'Request Details',
   GeneratedFormSection = 'Category'
WHERE 
   ID = '92A1176F-7429-4DEB-9AD7-C20775854C9E';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Referral Requests.BudgetRange 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'Request Details',
   GeneratedFormSection = 'Category'
WHERE 
   ID = '55758458-3468-444B-9B82-CCB0F20AAF36';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Referral Requests.PreferredLanguage 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'Seeker Information',
   GeneratedFormSection = 'Category'
WHERE 
   ID = '32595151-24E4-4970-A91F-2FB2D88D0369';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Referral Requests.RequiresProBono 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'Request Details',
   GeneratedFormSection = 'Category'
WHERE 
   ID = 'ABA0A1F3-6351-422F-A6AE-0DF91D087C6C';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Referral Requests.Status 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'Workflow and Status',
   GeneratedFormSection = 'Category'
WHERE 
   ID = 'FCB14234-4787-41DB-99DE-EE9E71D44A13';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Referral Requests.AssignedProfessionalID 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'Workflow and Status',
   GeneratedFormSection = 'Category',
   DisplayName = 'Assigned Professional'
WHERE 
   ID = 'AE0F54FC-39F7-442B-AE92-A1F1B8CA9F9A';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Referral Requests.CurrentCascadeStep 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'Workflow and Status',
   GeneratedFormSection = 'Category'
WHERE 
   ID = '76F10071-DA0C-4668-B0DF-5422C4AA920C';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Referral Requests.SubmittedAt 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'Timeline',
   GeneratedFormSection = 'Category'
WHERE 
   ID = '8E0C8435-5647-45B8-95B0-3AE2570A6609';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Referral Requests.AcceptedAt 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'Timeline',
   GeneratedFormSection = 'Category'
WHERE 
   ID = '30BE1FBC-1593-41F3-8BBD-A14D431CE6FC';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Referral Requests.CompletedAt 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'Timeline',
   GeneratedFormSection = 'Category'
WHERE 
   ID = 'A2E02596-70C1-4825-8C89-F6797419C83B';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Referral Requests.__mj_CreatedAt 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'System Metadata',
   GeneratedFormSection = 'Category'
WHERE 
   ID = '28D67407-8EB8-4E10-9B80-B157700AD332';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Referral Requests.__mj_UpdatedAt 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'System Metadata',
   GeneratedFormSection = 'Category'
WHERE 
   ID = '4D24344A-7093-40ED-85D5-0E87892E9F4D';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Referral Requests.SeekerPerson 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'Seeker Information',
   GeneratedFormSection = 'Category'
WHERE 
   ID = '5377781A-5F12-4960-AB5D-02BB7413FF86';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Referral Requests.PracticeArea 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'Matter Information',
   GeneratedFormSection = 'Category'
WHERE 
   ID = '19069FBD-15A6-424C-B7F6-4A1169D9F0A2';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Referral Requests.Jurisdiction 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'Matter Information',
   GeneratedFormSection = 'Category'
WHERE 
   ID = '1B30218F-5EFC-487B-93AE-55787C3BBD53';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Referral Requests.ReferralTier 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'Matter Information',
   GeneratedFormSection = 'Category'
WHERE 
   ID = '51CF6444-BE79-4194-9662-557C5E1844C4';

/* Set entity icon to fa fa-file-alt */

               UPDATE [${flyway:defaultSchema}].[Entity]
               SET [Icon] = 'fa fa-file-alt', [__mj_UpdatedAt] = GETUTCDATE()
               WHERE [ID] = 'C1CEBBE7-15E6-4134-B303-96F38D585F65';

/* Insert FieldCategoryInfo setting for entity */
IF NOT EXISTS (
      SELECT 1 FROM [${flyway:defaultSchema}].[EntitySetting] WHERE [EntityID] = 'C1CEBBE7-15E6-4134-B303-96F38D585F65' AND [Name] = 'FieldCategoryInfo'
   )
   BEGIN
      INSERT INTO [${flyway:defaultSchema}].[EntitySetting] ([ID], [EntityID], [Name], [Value], [__mj_CreatedAt], [__mj_UpdatedAt])
               VALUES ('6af45144-cca2-58c5-82f6-c4c2fdb4cef5', 'C1CEBBE7-15E6-4134-B303-96F38D585F65', 'FieldCategoryInfo', '{
  "Matter Information": {
    "description": "Legal matter title, summary, practice area, and jurisdiction details",
    "icon": "fa fa-briefcase"
  },
  "Request Details": {
    "description": "General referral request numbers, urgency, and requirements",
    "icon": "fa fa-file-invoice"
  },
  "Seeker Information": {
    "description": "Contact details and background information of the person seeking a referral",
    "icon": "fa fa-user"
  },
  "System Metadata": {
    "description": "System-managed audit and tracking fields",
    "icon": "fa fa-cog"
  },
  "Timeline": {
    "description": "Important milestone timestamps including submission, acceptance, and completion",
    "icon": "fa fa-calendar-alt"
  },
  "Workflow and Status": {
    "description": "Request routing state, assignments, and progression steps",
    "icon": "fa fa-tasks"
  }
}', GETUTCDATE(), GETUTCDATE())
   END;

/* Insert FieldCategoryIcons setting (legacy) */
IF NOT EXISTS (
      SELECT 1 FROM [${flyway:defaultSchema}].[EntitySetting] WHERE [EntityID] = 'C1CEBBE7-15E6-4134-B303-96F38D585F65' AND [Name] = 'FieldCategoryIcons'
   )
   BEGIN
      INSERT INTO [${flyway:defaultSchema}].[EntitySetting] ([ID], [EntityID], [Name], [Value], [__mj_CreatedAt], [__mj_UpdatedAt])
               VALUES ('4720bc36-8126-5d84-b30f-fc51e25bd847', 'C1CEBBE7-15E6-4134-B303-96F38D585F65', 'FieldCategoryIcons', '{
  "Matter Information": "fa fa-briefcase",
  "Request Details": "fa fa-file-invoice",
  "Seeker Information": "fa fa-user",
  "System Metadata": "fa fa-cog",
  "Timeline": "fa fa-calendar-alt",
  "Workflow and Status": "fa fa-tasks"
}', GETUTCDATE(), GETUTCDATE())
   END;

/* Set DefaultForNewUser=true for NEW entity (category: primary, confidence: high) */

         UPDATE [${flyway:defaultSchema}].[ApplicationEntity]
         SET [DefaultForNewUser] = 1, [__mj_UpdatedAt] = GETUTCDATE()
         WHERE [EntityID] = 'C1CEBBE7-15E6-4134-B303-96F38D585F65';

/* Set categories for 11 fields */

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Referral Feedbacks.ID 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'System Metadata',
   GeneratedFormSection = 'Category'
WHERE 
   ID = '6FD12F3E-4799-4F3F-852C-6E89F3D90748';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Referral Feedbacks.ReferralRequestID 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'Referral Information',
   GeneratedFormSection = 'Category',
   DisplayName = 'Referral Request'
WHERE 
   ID = '2BF3D781-1EA2-4F69-8EA6-18CD41E6E180';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Referral Feedbacks.ReferralAssignmentID 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'Referral Information',
   GeneratedFormSection = 'Category',
   DisplayName = 'Referral Assignment'
WHERE 
   ID = 'A0238F00-628E-499F-9D23-33DA4F08CEB8';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Referral Feedbacks.ProfessionalProfileID 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'Referral Information',
   GeneratedFormSection = 'Category',
   DisplayName = 'Professional Profile'
WHERE 
   ID = '819779E5-41B4-40D1-8855-82F5CE449E46';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Referral Feedbacks.SubmittedByType 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'Feedback and Rating',
   GeneratedFormSection = 'Category'
WHERE 
   ID = '82D17590-EF85-4425-A922-1FACCB060A74';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Referral Feedbacks.Rating 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'Feedback and Rating',
   GeneratedFormSection = 'Category'
WHERE 
   ID = '66AECA71-8D4A-4C59-A5C5-277235DD8B75';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Referral Feedbacks.OutcomeStatus 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'Feedback and Rating',
   GeneratedFormSection = 'Category'
WHERE 
   ID = 'CC98A578-C55A-4935-9FF2-425AF0927A86';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Referral Feedbacks.Comments 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'Feedback and Rating',
   GeneratedFormSection = 'Category'
WHERE 
   ID = '8036D63E-BCD9-4724-A31A-8E6621F8C438';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Referral Feedbacks.SubmittedAt 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'Feedback and Rating',
   GeneratedFormSection = 'Category'
WHERE 
   ID = 'EA68D08D-AF91-40BC-BBAB-D95EBF79129D';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Referral Feedbacks.__mj_CreatedAt 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'System Metadata',
   GeneratedFormSection = 'Category'
WHERE 
   ID = '7BA330E5-47F6-4D29-B698-81964079B519';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Referral Feedbacks.__mj_UpdatedAt 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'System Metadata',
   GeneratedFormSection = 'Category'
WHERE 
   ID = '90D350F0-6D59-419A-8BD9-FB10FBB0E330';

/* Set entity icon to fa fa-comment-dots */

               UPDATE [${flyway:defaultSchema}].[Entity]
               SET [Icon] = 'fa fa-comment-dots', [__mj_UpdatedAt] = GETUTCDATE()
               WHERE [ID] = '21B34F7D-822B-4BA5-985C-52215D3DDB9D';

/* Insert FieldCategoryInfo setting for entity */
IF NOT EXISTS (
      SELECT 1 FROM [${flyway:defaultSchema}].[EntitySetting] WHERE [EntityID] = '21B34F7D-822B-4BA5-985C-52215D3DDB9D' AND [Name] = 'FieldCategoryInfo'
   )
   BEGIN
      INSERT INTO [${flyway:defaultSchema}].[EntitySetting] ([ID], [EntityID], [Name], [Value], [__mj_CreatedAt], [__mj_UpdatedAt])
               VALUES ('5ae42da3-3bbc-5a0c-9ccd-a898daff254a', '21B34F7D-822B-4BA5-985C-52215D3DDB9D', 'FieldCategoryInfo', '{
  "Feedback and Rating": {
    "description": "Feedback telemetry, ratings, outcome statuses, and comments",
    "icon": "fa fa-star"
  },
  "Referral Information": {
    "description": "Identifiers linking feedback to requests, assignments, and professionals",
    "icon": "fa fa-link"
  },
  "System Metadata": {
    "description": "System-managed audit and tracking fields",
    "icon": "fa fa-cog"
  }
}', GETUTCDATE(), GETUTCDATE())
   END;

/* Insert FieldCategoryIcons setting (legacy) */
IF NOT EXISTS (
      SELECT 1 FROM [${flyway:defaultSchema}].[EntitySetting] WHERE [EntityID] = '21B34F7D-822B-4BA5-985C-52215D3DDB9D' AND [Name] = 'FieldCategoryIcons'
   )
   BEGIN
      INSERT INTO [${flyway:defaultSchema}].[EntitySetting] ([ID], [EntityID], [Name], [Value], [__mj_CreatedAt], [__mj_UpdatedAt])
               VALUES ('e33ea62c-8d1e-5c10-87ec-8f27f48415dd', '21B34F7D-822B-4BA5-985C-52215D3DDB9D', 'FieldCategoryIcons', '{
  "Feedback and Rating": "fa fa-star",
  "Referral Information": "fa fa-link",
  "System Metadata": "fa fa-cog"
}', GETUTCDATE(), GETUTCDATE())
   END;

/* Set DefaultForNewUser=true for NEW entity (category: supporting, confidence: high) */

         UPDATE [${flyway:defaultSchema}].[ApplicationEntity]
         SET [DefaultForNewUser] = 1, [__mj_UpdatedAt] = GETUTCDATE()
         WHERE [EntityID] = '21B34F7D-822B-4BA5-985C-52215D3DDB9D';

/* Set categories for 11 fields */

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Referral Tiers.ID 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'System Metadata',
   GeneratedFormSection = 'Category'
WHERE 
   ID = '6BBE1E5C-C45D-49D4-82C6-E600D75310D4';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Referral Tiers.Name 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'Tier Details',
   GeneratedFormSection = 'Category'
WHERE 
   ID = 'AF58C62C-A53C-4310-87F5-07AD122E29C7';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Referral Tiers.Code 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'Tier Details',
   GeneratedFormSection = 'Category'
WHERE 
   ID = 'ED75ADBA-D466-41E4-B7CC-65B3B00AFC63';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Referral Tiers.SLAResponseHours 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'SLA & Performance',
   GeneratedFormSection = 'Category'
WHERE 
   ID = '21266FBF-9BAE-4EAB-A5D9-DB421B479369';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Referral Tiers.MaxCascadeAttempts 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'SLA & Performance',
   GeneratedFormSection = 'Category'
WHERE 
   ID = '40BEE2DE-8CEF-47CB-B96B-1B310FDAD79D';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Referral Tiers.PriorityWeight 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'SLA & Performance',
   GeneratedFormSection = 'Category'
WHERE 
   ID = '40CDD939-99C7-48E5-B597-72ACEE41AEC2';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Referral Tiers.RequireConflictCheck 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'Tier Details',
   GeneratedFormSection = 'Category'
WHERE 
   ID = 'E3523709-CADE-44C3-A552-ABF3F3049028';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Referral Tiers.Description 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'Tier Details',
   GeneratedFormSection = 'Category'
WHERE 
   ID = '7AB8D45C-2FF4-40FC-A672-D551A3343285';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Referral Tiers.IsActive 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'Tier Details',
   GeneratedFormSection = 'Category',
   DisplayName = 'Active'
WHERE 
   ID = '4E230A37-0306-45D8-862B-8280F3686087';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Referral Tiers.__mj_CreatedAt 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'System Metadata',
   GeneratedFormSection = 'Category'
WHERE 
   ID = '769EE3FC-A194-411A-9630-8F8955D2FB36';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Referral Tiers.__mj_UpdatedAt 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'System Metadata',
   GeneratedFormSection = 'Category'
WHERE 
   ID = '7601ED80-0548-4E86-9115-0DBACB2BAA60';

/* Set entity icon to fa fa-layer-group */

               UPDATE [${flyway:defaultSchema}].[Entity]
               SET [Icon] = 'fa fa-layer-group', [__mj_UpdatedAt] = GETUTCDATE()
               WHERE [ID] = '48BAF761-CB15-47B8-BE87-C6D1B54F25F6';

/* Insert FieldCategoryInfo setting for entity */
IF NOT EXISTS (
      SELECT 1 FROM [${flyway:defaultSchema}].[EntitySetting] WHERE [EntityID] = '48BAF761-CB15-47B8-BE87-C6D1B54F25F6' AND [Name] = 'FieldCategoryInfo'
   )
   BEGIN
      INSERT INTO [${flyway:defaultSchema}].[EntitySetting] ([ID], [EntityID], [Name], [Value], [__mj_CreatedAt], [__mj_UpdatedAt])
               VALUES ('27ad6b09-3c47-5ce2-b453-fee7ef337995', '48BAF761-CB15-47B8-BE87-C6D1B54F25F6', 'FieldCategoryInfo', '{
  "SLA & Performance": {
    "description": "Service-level agreement response windows, cascade depth, and priority weights.",
    "icon": "fa fa-tachometer-alt"
  },
  "System Metadata": {
    "description": "System-managed audit and tracking fields.",
    "icon": "fa fa-cog"
  },
  "Tier Details": {
    "description": "Basic identifying information, descriptions, and configuration flags for the referral tier.",
    "icon": "fa fa-info-circle"
  }
}', GETUTCDATE(), GETUTCDATE())
   END;

/* Insert FieldCategoryIcons setting (legacy) */
IF NOT EXISTS (
      SELECT 1 FROM [${flyway:defaultSchema}].[EntitySetting] WHERE [EntityID] = '48BAF761-CB15-47B8-BE87-C6D1B54F25F6' AND [Name] = 'FieldCategoryIcons'
   )
   BEGIN
      INSERT INTO [${flyway:defaultSchema}].[EntitySetting] ([ID], [EntityID], [Name], [Value], [__mj_CreatedAt], [__mj_UpdatedAt])
               VALUES ('d792f34b-08fe-5aab-84c5-59b9f46e4b29', '48BAF761-CB15-47B8-BE87-C6D1B54F25F6', 'FieldCategoryIcons', '{
  "SLA & Performance": "fa fa-tachometer-alt",
  "System Metadata": "fa fa-cog",
  "Tier Details": "fa fa-info-circle"
}', GETUTCDATE(), GETUTCDATE())
   END;

/* Set DefaultForNewUser=false for NEW entity (category: reference, confidence: high) */

         UPDATE [${flyway:defaultSchema}].[ApplicationEntity]
         SET [DefaultForNewUser] = 0, [__mj_UpdatedAt] = GETUTCDATE()
         WHERE [EntityID] = '48BAF761-CB15-47B8-BE87-C6D1B54F25F6';

/* Set categories for 30 fields */

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Professional Profiles.ID 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'System Metadata',
   GeneratedFormSection = 'Category'
WHERE 
   ID = 'E39BFFD6-55A9-4286-A6C6-C7071C7F429F';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Professional Profiles.PersonID 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'Associations',
   GeneratedFormSection = 'Category',
   DisplayName = 'Person'
WHERE 
   ID = 'B9B06233-C7F3-41C4-B854-CFB119299295';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Professional Profiles.OrganizationID 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'Associations',
   GeneratedFormSection = 'Category',
   DisplayName = 'Organization'
WHERE 
   ID = 'B6BBEF6A-76CC-4EB8-9479-3140FCAEE8D7';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Professional Profiles.UserID 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'Associations',
   GeneratedFormSection = 'Category',
   DisplayName = 'User'
WHERE 
   ID = 'AD70BAC7-FAB7-4C16-8187-44CF7D04B18A';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Professional Profiles.DisplayName 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'Professional Details',
   GeneratedFormSection = 'Category'
WHERE 
   ID = 'C89FC820-344B-461D-81E7-F4C7F9731A62';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Professional Profiles.FirmName 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'Professional Details',
   GeneratedFormSection = 'Category'
WHERE 
   ID = '1CC0E9DA-DDAE-4BAA-A1D1-A49E4818046B';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Professional Profiles.Email 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'Contact Information',
   GeneratedFormSection = 'Category',
   ExtendedType = 'Email'
WHERE 
   ID = '1E8782FA-7425-4874-AA2B-6A4042B3F946';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Professional Profiles.Phone 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'Contact Information',
   GeneratedFormSection = 'Category',
   ExtendedType = 'Tel'
WHERE 
   ID = 'ECD37B36-34A0-42A7-9B3D-A7CCD0EBB22C';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Professional Profiles.BarOrLicenseNumber 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'Professional Details',
   GeneratedFormSection = 'Category',
   DisplayName = 'Bar or License Number'
WHERE 
   ID = '2D5623E6-5975-41E8-8B29-69384F906DAE';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Professional Profiles.VerificationStatus 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'Professional Details',
   GeneratedFormSection = 'Category'
WHERE 
   ID = '49656B23-A371-4F3D-9DD4-4824B97AAED3';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Professional Profiles.AvailabilityStatus 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'Professional Details',
   GeneratedFormSection = 'Category'
WHERE 
   ID = 'E3F0C72B-1636-4946-95C9-DAA745BAB823';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Professional Profiles.Bio 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'Professional Details',
   GeneratedFormSection = 'Category'
WHERE 
   ID = '98988DF8-B79E-4303-8B97-3CB117F3C581';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Professional Profiles.YearsExperience 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'Professional Details',
   GeneratedFormSection = 'Category',
   DisplayName = 'Years of Experience'
WHERE 
   ID = 'A4E4F1D2-A10D-49E7-8314-C8ECAD0695B0';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Professional Profiles.Languages 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'Professional Details',
   GeneratedFormSection = 'Category'
WHERE 
   ID = 'FB7C7352-9135-4EFE-B06A-A5475EB4F630';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Professional Profiles.HourlyRateMin 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'Pricing and Terms',
   GeneratedFormSection = 'Category',
   DisplayName = 'Minimum Hourly Rate'
WHERE 
   ID = 'C6B20179-3B2B-44B4-B228-62AEC641F9CE';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Professional Profiles.HourlyRateMax 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'Pricing and Terms',
   GeneratedFormSection = 'Category',
   DisplayName = 'Maximum Hourly Rate'
WHERE 
   ID = 'CE77720C-F475-4D45-8F53-DB48B8ADEA62';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Professional Profiles.AcceptsProBono 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'Pricing and Terms',
   GeneratedFormSection = 'Category'
WHERE 
   ID = 'EBF2E67F-55F7-4752-A6A9-1063DA1B2F23';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Professional Profiles.AcceptsContingency 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'Pricing and Terms',
   GeneratedFormSection = 'Category'
WHERE 
   ID = 'F4BFF7AA-50A0-42A3-9C58-D629A2E5F23B';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Professional Profiles.ActiveReferralCount 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'Performance and Capacity',
   GeneratedFormSection = 'Category'
WHERE 
   ID = '0B5F63F4-E367-44BE-87E6-5D2536AEB959';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Professional Profiles.MaxConcurrentReferrals 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'Performance and Capacity',
   GeneratedFormSection = 'Category'
WHERE 
   ID = '740D617D-07B7-4112-BC2B-21EAF6823094';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Professional Profiles.AverageResponseHours 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'Performance and Capacity',
   GeneratedFormSection = 'Category'
WHERE 
   ID = '120F68F8-F445-4771-A1CE-9226CB6CF000';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Professional Profiles.AverageRating 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'Performance and Capacity',
   GeneratedFormSection = 'Category'
WHERE 
   ID = '0D3740E5-6748-4B2D-977C-9289D94FB1CF';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Professional Profiles.TotalAcceptedCount 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'Performance and Capacity',
   GeneratedFormSection = 'Category'
WHERE 
   ID = 'F97A0BA7-DDB7-43E8-AAD5-3467528B7B32';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Professional Profiles.TotalCompletedCount 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'Performance and Capacity',
   GeneratedFormSection = 'Category'
WHERE 
   ID = '5A1F8BFF-BC67-415E-84A1-663938E7B28B';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Professional Profiles.IsActive 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'Professional Details',
   GeneratedFormSection = 'Category',
   DisplayName = 'Active'
WHERE 
   ID = '7D3F9ED5-3845-436D-99CA-A97E6475BB52';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Professional Profiles.__mj_CreatedAt 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'System Metadata',
   GeneratedFormSection = 'Category'
WHERE 
   ID = 'C2F7DFD3-5B2B-4C9D-AE99-EFD484B59F1A';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Professional Profiles.__mj_UpdatedAt 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'System Metadata',
   GeneratedFormSection = 'Category'
WHERE 
   ID = '5787C56D-DA16-4275-9B85-9EA7A7823E52';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Professional Profiles.Person 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'Associations',
   GeneratedFormSection = 'Category',
   DisplayName = 'Person Name'
WHERE 
   ID = '635586CF-0DCE-4096-A84A-BD498DEDAED7';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Professional Profiles.Organization 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'Associations',
   GeneratedFormSection = 'Category',
   DisplayName = 'Organization Name'
WHERE 
   ID = '781C4455-F8E4-4976-B645-6583697B6911';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Professional Profiles.User 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'Associations',
   GeneratedFormSection = 'Category',
   DisplayName = 'User Name'
WHERE 
   ID = '100B681B-3725-46CE-89F7-B5CB081583F3';

/* Set entity icon to fa fa-id-card */

               UPDATE [${flyway:defaultSchema}].[Entity]
               SET [Icon] = 'fa fa-id-card', [__mj_UpdatedAt] = GETUTCDATE()
               WHERE [ID] = '7492A921-FFCF-4A3E-B59A-56C88D16DDE1';

/* Insert FieldCategoryInfo setting for entity */
IF NOT EXISTS (
      SELECT 1 FROM [${flyway:defaultSchema}].[EntitySetting] WHERE [EntityID] = '7492A921-FFCF-4A3E-B59A-56C88D16DDE1' AND [Name] = 'FieldCategoryInfo'
   )
   BEGIN
      INSERT INTO [${flyway:defaultSchema}].[EntitySetting] ([ID], [EntityID], [Name], [Value], [__mj_CreatedAt], [__mj_UpdatedAt])
               VALUES ('d576f39b-0e23-53bf-a8aa-cdf752272a18', '7492A921-FFCF-4A3E-B59A-56C88D16DDE1', 'FieldCategoryInfo', '{
  "Associations": {
    "description": "Linked entities including person, organization, and user records",
    "icon": "fa fa-link"
  },
  "Contact Information": {
    "description": "Email and phone contact details for the professional",
    "icon": "fa fa-address-book"
  },
  "Performance and Capacity": {
    "description": "Referral metrics, workload capacity, response times, and ratings",
    "icon": "fa fa-chart-line"
  },
  "Pricing and Terms": {
    "description": "Hourly rates and billing acceptance terms",
    "icon": "fa fa-dollar-sign"
  },
  "Professional Details": {
    "description": "Core professional profile information, credentials, bio, and status settings",
    "icon": "fa fa-user-tie"
  },
  "System Metadata": {
    "description": "System-managed audit and tracking fields",
    "icon": "fa fa-cog"
  }
}', GETUTCDATE(), GETUTCDATE())
   END;

/* Insert FieldCategoryIcons setting (legacy) */
IF NOT EXISTS (
      SELECT 1 FROM [${flyway:defaultSchema}].[EntitySetting] WHERE [EntityID] = '7492A921-FFCF-4A3E-B59A-56C88D16DDE1' AND [Name] = 'FieldCategoryIcons'
   )
   BEGIN
      INSERT INTO [${flyway:defaultSchema}].[EntitySetting] ([ID], [EntityID], [Name], [Value], [__mj_CreatedAt], [__mj_UpdatedAt])
               VALUES ('08d51262-c891-55d3-807a-0b3c65903e4a', '7492A921-FFCF-4A3E-B59A-56C88D16DDE1', 'FieldCategoryIcons', '{
  "Associations": "fa fa-link",
  "Contact Information": "fa fa-address-book",
  "Performance and Capacity": "fa fa-chart-line",
  "Pricing and Terms": "fa fa-dollar-sign",
  "Professional Details": "fa fa-user-tie",
  "System Metadata": "fa fa-cog"
}', GETUTCDATE(), GETUTCDATE())
   END;

/* Set DefaultForNewUser=true for NEW entity (category: primary, confidence: high) */

         UPDATE [${flyway:defaultSchema}].[ApplicationEntity]
         SET [DefaultForNewUser] = 1, [__mj_UpdatedAt] = GETUTCDATE()
         WHERE [EntityID] = '7492A921-FFCF-4A3E-B59A-56C88D16DDE1';

/* Set categories for 16 fields */

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Referral Assignments.ID 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'System Metadata',
   GeneratedFormSection = 'Category'
WHERE 
   ID = '432F78F2-151B-40FF-B078-A92C3F51CAB6';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Referral Assignments.ReferralRequestID 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'Assignment and Match Details',
   GeneratedFormSection = 'Category',
   DisplayName = 'Referral Request'
WHERE 
   ID = 'FF9F1AB3-EA3E-475D-92EF-4C2E6574216D';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Referral Assignments.ProfessionalProfileID 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'Assignment and Match Details',
   GeneratedFormSection = 'Category',
   DisplayName = 'Professional Profile'
WHERE 
   ID = '9C8FAC7E-B002-4EF1-8601-EA1F1420504D';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Referral Assignments.CascadeOrder 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'Assignment and Match Details',
   GeneratedFormSection = 'Category'
WHERE 
   ID = '326BCCA6-FEB0-4042-A6CD-69424CBF4CC5';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Referral Assignments.MatchScore 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'Assignment and Match Details',
   GeneratedFormSection = 'Category'
WHERE 
   ID = '3B2D20B5-3C3B-4F2C-B07C-ED018C139486';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Referral Assignments.ScoreBreakdownJSON 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'Assignment and Match Details',
   GeneratedFormSection = 'Category',
   DisplayName = 'Score Breakdown',
   ExtendedType = 'JSON'
WHERE 
   ID = '6C4D83E2-5164-443E-8427-0DE72D5B3365';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Referral Assignments.ConflictStatus 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'Status and Conflict Management',
   GeneratedFormSection = 'Category'
WHERE 
   ID = 'AFC53643-7573-45BA-8AD1-428F322998DD';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Referral Assignments.ConflictReason 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'Status and Conflict Management',
   GeneratedFormSection = 'Category'
WHERE 
   ID = '91F1A99C-A394-4EAC-B39B-1430BD55A938';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Referral Assignments.Status 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'Status and Conflict Management',
   GeneratedFormSection = 'Category'
WHERE 
   ID = '39FA22AE-02FA-4C9A-8592-95C9D1ADF13F';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Referral Assignments.OfferedAt 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'Timeline and Response',
   GeneratedFormSection = 'Category'
WHERE 
   ID = '7123C246-C445-4E19-9D7C-8253A3425726';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Referral Assignments.SLADeadlineAt 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'Timeline and Response',
   GeneratedFormSection = 'Category',
   DisplayName = 'SLA Deadline'
WHERE 
   ID = 'D7BE615E-FC42-4A6D-902E-004FCEF4F254';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Referral Assignments.RespondedAt 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'Timeline and Response',
   GeneratedFormSection = 'Category'
WHERE 
   ID = '7C1473E3-1ABD-4322-9447-3422F01640BC';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Referral Assignments.ResponseNotes 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'Timeline and Response',
   GeneratedFormSection = 'Category'
WHERE 
   ID = 'E7A1832A-1253-47F5-B479-79B669F283C3';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Referral Assignments.DeclineReason 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'Timeline and Response',
   GeneratedFormSection = 'Category'
WHERE 
   ID = '44ECB1D1-F164-456D-AF98-702CA7CC1092';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Referral Assignments.__mj_CreatedAt 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'System Metadata',
   GeneratedFormSection = 'Category'
WHERE 
   ID = '56BE7C54-DB5F-4978-9A4F-98ADD65C80EA';

-- UPDATE Entity Field Category Info MJ_BizApps_Referrals: Referral Assignments.__mj_UpdatedAt 
UPDATE [${flyway:defaultSchema}].[EntityField]
SET 
   Category = 'System Metadata',
   GeneratedFormSection = 'Category'
WHERE 
   ID = '967A2D97-B8FE-4F64-A076-D6B7787B46B8';

/* Set entity icon to fa fa-tasks */

               UPDATE [${flyway:defaultSchema}].[Entity]
               SET [Icon] = 'fa fa-tasks', [__mj_UpdatedAt] = GETUTCDATE()
               WHERE [ID] = '7EB379C8-6C97-4640-B0AA-94F0874F4182';

/* Insert FieldCategoryInfo setting for entity */
IF NOT EXISTS (
      SELECT 1 FROM [${flyway:defaultSchema}].[EntitySetting] WHERE [EntityID] = '7EB379C8-6C97-4640-B0AA-94F0874F4182' AND [Name] = 'FieldCategoryInfo'
   )
   BEGIN
      INSERT INTO [${flyway:defaultSchema}].[EntitySetting] ([ID], [EntityID], [Name], [Value], [__mj_CreatedAt], [__mj_UpdatedAt])
               VALUES ('05c1aa0f-1f06-5652-87bf-b54e5aa9a077', '7EB379C8-6C97-4640-B0AA-94F0874F4182', 'FieldCategoryInfo', '{
  "Assignment and Match Details": {
    "description": "Information linking referral requests to professionals along with match metrics",
    "icon": "fa fa-link"
  },
  "Status and Conflict Management": {
    "description": "Status tracking and conflict evaluation for assignments",
    "icon": "fa fa-exclamation-triangle"
  },
  "System Metadata": {
    "description": "System-managed audit and tracking fields",
    "icon": "fa fa-cog"
  },
  "Timeline and Response": {
    "description": "Timestamps, deadlines, notes, and reasons regarding professional responses",
    "icon": "fa fa-clock"
  }
}', GETUTCDATE(), GETUTCDATE())
   END;

/* Insert FieldCategoryIcons setting (legacy) */
IF NOT EXISTS (
      SELECT 1 FROM [${flyway:defaultSchema}].[EntitySetting] WHERE [EntityID] = '7EB379C8-6C97-4640-B0AA-94F0874F4182' AND [Name] = 'FieldCategoryIcons'
   )
   BEGIN
      INSERT INTO [${flyway:defaultSchema}].[EntitySetting] ([ID], [EntityID], [Name], [Value], [__mj_CreatedAt], [__mj_UpdatedAt])
               VALUES ('f81609fa-0bee-514d-967f-ffb48699a951', '7EB379C8-6C97-4640-B0AA-94F0874F4182', 'FieldCategoryIcons', '{
  "Assignment and Match Details": "fa fa-link",
  "Status and Conflict Management": "fa fa-exclamation-triangle",
  "System Metadata": "fa fa-cog",
  "Timeline and Response": "fa fa-clock"
}', GETUTCDATE(), GETUTCDATE())
   END;

/* Set DefaultForNewUser=true for NEW entity (category: supporting, confidence: high) */

         UPDATE [${flyway:defaultSchema}].[ApplicationEntity]
         SET [DefaultForNewUser] = 1, [__mj_UpdatedAt] = GETUTCDATE()
         WHERE [EntityID] = '7EB379C8-6C97-4640-B0AA-94F0874F4182';

/* Index for Foreign Keys for Jurisdiction */
-----------------------------------------------------------------
-- SQL Code Generation
-- Entity: MJ_BizApps_Referrals: Jurisdictions
-- Item: Index for Foreign Keys
--
-- This was generated by the MemberJunction CodeGen tool.
-- This file should NOT be edited by hand.
-----------------------------------------------------------------
-- Index for foreign key ParentID in table Jurisdiction
IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'IDX_AUTO_MJ_FKEY_Jurisdiction_ParentID' 
    AND object_id = OBJECT_ID('[__mj_BizAppsReferrals].[Jurisdiction]')
)
CREATE INDEX IDX_AUTO_MJ_FKEY_Jurisdiction_ParentID ON [__mj_BizAppsReferrals].[Jurisdiction] ([ParentID]);

/* Base View SQL for MJ_BizApps_Referrals: Jurisdictions */
-----------------------------------------------------------------
-- SQL Code Generation
-- Entity: MJ_BizApps_Referrals: Jurisdictions
-- Item: vwJurisdictions
--
-- This was generated by the MemberJunction CodeGen tool.
-- This file should NOT be edited by hand.
-----------------------------------------------------------------

------------------------------------------------------------
----- BASE VIEW FOR ENTITY:      MJ_BizApps_Referrals: Jurisdictions
-----               SCHEMA:      __mj_BizAppsReferrals
-----               BASE TABLE:  Jurisdiction
-----               PRIMARY KEY: ID
------------------------------------------------------------
IF OBJECT_ID('[__mj_BizAppsReferrals].[vwJurisdictions]', 'V') IS NOT NULL
    DROP VIEW [__mj_BizAppsReferrals].[vwJurisdictions];
GO

CREATE VIEW [__mj_BizAppsReferrals].[vwJurisdictions]
AS
SELECT
    j.*,
    mjBizAppsReferralsJurisdiction_ParentID.[Name] AS [Parent],
    __mj_rgc.[Latitude] AS [__mj_Latitude],
    __mj_rgc.[Longitude] AS [__mj_Longitude]
FROM
    [__mj_BizAppsReferrals].[Jurisdiction] AS j
LEFT OUTER JOIN
    [__mj_BizAppsReferrals].[Jurisdiction] AS mjBizAppsReferralsJurisdiction_ParentID
  ON
    [j].[ParentID] = mjBizAppsReferralsJurisdiction_ParentID.[ID]
LEFT OUTER JOIN
    [${flyway:defaultSchema}].[RecordGeoCode] AS __mj_rgc
  ON
    __mj_rgc.[EntityID] = 'B6923104-236C-4100-BA23-C4AC354B47A8'
    AND __mj_rgc.[RecordID] = CAST([j].[ID] AS NVARCHAR(450))
    AND __mj_rgc.[LocationType] = 'Primary'
GO
GRANT SELECT ON [__mj_BizAppsReferrals].[vwJurisdictions] TO [cdp_UI], [cdp_Developer], [cdp_Integration];

/* Base View Permissions SQL for MJ_BizApps_Referrals: Jurisdictions */
-----------------------------------------------------------------
-- SQL Code Generation
-- Entity: MJ_BizApps_Referrals: Jurisdictions
-- Item: Permissions for vwJurisdictions
--
-- This was generated by the MemberJunction CodeGen tool.
-- This file should NOT be edited by hand.
-----------------------------------------------------------------

GRANT SELECT ON [__mj_BizAppsReferrals].[vwJurisdictions] TO [cdp_UI], [cdp_Developer], [cdp_Integration];

/* spCreate SQL for MJ_BizApps_Referrals: Jurisdictions */
-----------------------------------------------------------------
-- SQL Code Generation
-- Entity: MJ_BizApps_Referrals: Jurisdictions
-- Item: spCreateJurisdiction
--
-- This was generated by the MemberJunction CodeGen tool.
-- This file should NOT be edited by hand.
-----------------------------------------------------------------

------------------------------------------------------------
----- CREATE PROCEDURE FOR Jurisdiction
------------------------------------------------------------
IF OBJECT_ID('[__mj_BizAppsReferrals].[spCreateJurisdiction]', 'P') IS NOT NULL
    DROP PROCEDURE [__mj_BizAppsReferrals].[spCreateJurisdiction];
GO

CREATE PROCEDURE [__mj_BizAppsReferrals].[spCreateJurisdiction]
    @ID uniqueidentifier = NULL,
    @ParentID_Clear bit = 0,
    @ParentID uniqueidentifier = NULL,
    @Name nvarchar(150),
    @Code nvarchar(50),
    @JurisdictionType nvarchar(30) = NULL,
    @CountryCode nvarchar(10) = NULL,
    @StateProvinceCode_Clear bit = 0,
    @StateProvinceCode nvarchar(20) = NULL,
    @IsActive bit = NULL
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @InsertedRow TABLE ([ID] UNIQUEIDENTIFIER)

    IF @ID IS NOT NULL
    BEGIN
        -- User provided a value, use it
        INSERT INTO [__mj_BizAppsReferrals].[Jurisdiction]
            (
                [ID],
                [ParentID],
                [Name],
                [Code],
                [JurisdictionType],
                [CountryCode],
                [StateProvinceCode],
                [IsActive]
            )
        OUTPUT INSERTED.[ID] INTO @InsertedRow
        VALUES
            (
                @ID,
                CASE WHEN @ParentID_Clear = 1 THEN NULL ELSE ISNULL(@ParentID, NULL) END,
                @Name,
                @Code,
                ISNULL(@JurisdictionType, 'State'),
                ISNULL(@CountryCode, 'US'),
                CASE WHEN @StateProvinceCode_Clear = 1 THEN NULL ELSE ISNULL(@StateProvinceCode, NULL) END,
                ISNULL(@IsActive, 1)
            )
    END
    ELSE
    BEGIN
        -- No value provided, let database use its default (e.g., NEWSEQUENTIALID())
        INSERT INTO [__mj_BizAppsReferrals].[Jurisdiction]
            (
                [ParentID],
                [Name],
                [Code],
                [JurisdictionType],
                [CountryCode],
                [StateProvinceCode],
                [IsActive]
            )
        OUTPUT INSERTED.[ID] INTO @InsertedRow
        VALUES
            (
                CASE WHEN @ParentID_Clear = 1 THEN NULL ELSE ISNULL(@ParentID, NULL) END,
                @Name,
                @Code,
                ISNULL(@JurisdictionType, 'State'),
                ISNULL(@CountryCode, 'US'),
                CASE WHEN @StateProvinceCode_Clear = 1 THEN NULL ELSE ISNULL(@StateProvinceCode, NULL) END,
                ISNULL(@IsActive, 1)
            )
    END
    -- return the new record from the base view, which might have some calculated fields
    SELECT * FROM [__mj_BizAppsReferrals].[vwJurisdictions] WHERE [ID] = (SELECT [ID] FROM @InsertedRow)
END
GO
GRANT EXECUTE ON [__mj_BizAppsReferrals].[spCreateJurisdiction] TO [cdp_Developer], [cdp_Integration];

/* spCreate Permissions for MJ_BizApps_Referrals: Jurisdictions */

GRANT EXECUTE ON [__mj_BizAppsReferrals].[spCreateJurisdiction] TO [cdp_Developer], [cdp_Integration];

/* spUpdate SQL for MJ_BizApps_Referrals: Jurisdictions */
-----------------------------------------------------------------
-- SQL Code Generation
-- Entity: MJ_BizApps_Referrals: Jurisdictions
-- Item: spUpdateJurisdiction
--
-- This was generated by the MemberJunction CodeGen tool.
-- This file should NOT be edited by hand.
-----------------------------------------------------------------

------------------------------------------------------------
----- UPDATE PROCEDURE FOR Jurisdiction
------------------------------------------------------------
IF OBJECT_ID('[__mj_BizAppsReferrals].[spUpdateJurisdiction]', 'P') IS NOT NULL
    DROP PROCEDURE [__mj_BizAppsReferrals].[spUpdateJurisdiction];
GO

CREATE PROCEDURE [__mj_BizAppsReferrals].[spUpdateJurisdiction]
    @ID uniqueidentifier,
    @ParentID_Clear bit = 0,
    @ParentID uniqueidentifier = NULL,
    @Name nvarchar(150) = NULL,
    @Code nvarchar(50) = NULL,
    @JurisdictionType nvarchar(30) = NULL,
    @CountryCode nvarchar(10) = NULL,
    @StateProvinceCode_Clear bit = 0,
    @StateProvinceCode nvarchar(20) = NULL,
    @IsActive bit = NULL
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE
        [__mj_BizAppsReferrals].[Jurisdiction]
    SET
        [ParentID] = CASE WHEN @ParentID_Clear = 1 THEN NULL ELSE ISNULL(@ParentID, [ParentID]) END,
        [Name] = ISNULL(@Name, [Name]),
        [Code] = ISNULL(@Code, [Code]),
        [JurisdictionType] = ISNULL(@JurisdictionType, [JurisdictionType]),
        [CountryCode] = ISNULL(@CountryCode, [CountryCode]),
        [StateProvinceCode] = CASE WHEN @StateProvinceCode_Clear = 1 THEN NULL ELSE ISNULL(@StateProvinceCode, [StateProvinceCode]) END,
        [IsActive] = ISNULL(@IsActive, [IsActive]),
        [__mj_UpdatedAt] = GETUTCDATE()
    WHERE
        [ID] = @ID

    -- Check if the update was successful
    IF @@ROWCOUNT = 0
        -- Nothing was updated, return no rows, but column structure from base view intact, semantically correct this way.
        SELECT TOP 0 * FROM [__mj_BizAppsReferrals].[vwJurisdictions] WHERE 1=0
    ELSE
        -- Return the updated record so the caller can see the updated values and any calculated fields
        SELECT
                                        *
                                    FROM
                                        [__mj_BizAppsReferrals].[vwJurisdictions]
                                    WHERE
                                        [ID] = @ID
                                    
END
GO

GRANT EXECUTE ON [__mj_BizAppsReferrals].[spUpdateJurisdiction] TO [cdp_Developer], [cdp_Integration]
GO

------------------------------------------------------------
----- TRIGGER FOR __mj_UpdatedAt field for the Jurisdiction table
------------------------------------------------------------
IF OBJECT_ID('[__mj_BizAppsReferrals].[trgUpdateJurisdiction]', 'TR') IS NOT NULL
    DROP TRIGGER [__mj_BizAppsReferrals].[trgUpdateJurisdiction];
GO
CREATE TRIGGER [__mj_BizAppsReferrals].trgUpdateJurisdiction
ON [__mj_BizAppsReferrals].[Jurisdiction]
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    IF NOT UPDATE([__mj_UpdatedAt])
    BEGIN
        UPDATE
            [__mj_BizAppsReferrals].[Jurisdiction]
        SET
            __mj_UpdatedAt = GETUTCDATE()
        FROM
            [__mj_BizAppsReferrals].[Jurisdiction] AS _organicTable
        INNER JOIN
            INSERTED AS I ON
            _organicTable.[ID] = I.[ID];
    END
END;
GO

/* spUpdate Permissions for MJ_BizApps_Referrals: Jurisdictions */

GRANT EXECUTE ON [__mj_BizAppsReferrals].[spUpdateJurisdiction] TO [cdp_Developer], [cdp_Integration];

/* spDelete SQL for MJ_BizApps_Referrals: Jurisdictions */
-----------------------------------------------------------------
-- SQL Code Generation
-- Entity: MJ_BizApps_Referrals: Jurisdictions
-- Item: spDeleteJurisdiction
--
-- This was generated by the MemberJunction CodeGen tool.
-- This file should NOT be edited by hand.
-----------------------------------------------------------------

------------------------------------------------------------
----- DELETE PROCEDURE FOR Jurisdiction
------------------------------------------------------------
IF OBJECT_ID('[__mj_BizAppsReferrals].[spDeleteJurisdiction]', 'P') IS NOT NULL
    DROP PROCEDURE [__mj_BizAppsReferrals].[spDeleteJurisdiction];
GO

CREATE PROCEDURE [__mj_BizAppsReferrals].[spDeleteJurisdiction]
    @ID uniqueidentifier
AS
BEGIN
    SET NOCOUNT ON;

    DELETE FROM
        [__mj_BizAppsReferrals].[Jurisdiction]
    WHERE
        [ID] = @ID


    -- Check if the delete was successful
    IF @@ROWCOUNT = 0
        SELECT NULL AS [ID] -- Return NULL for all primary key fields to indicate no record was deleted
    ELSE
        SELECT @ID AS [ID] -- Return the primary key values to indicate we successfully deleted the record
END
GO
GRANT EXECUTE ON [__mj_BizAppsReferrals].[spDeleteJurisdiction] TO [cdp_Developer], [cdp_Integration];

/* spDelete Permissions for MJ_BizApps_Referrals: Jurisdictions */

GRANT EXECUTE ON [__mj_BizAppsReferrals].[spDeleteJurisdiction] TO [cdp_Developer], [cdp_Integration];

/* SQL text to insert 2 new entity field(s) */

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = '6e59cc0c-28a7-41ce-84a0-f422bf3617d9' OR (EntityID = 'B6923104-236C-4100-BA23-C4AC354B47A8' AND Name = '__mj_Latitude')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            '6e59cc0c-28a7-41ce-84a0-f422bf3617d9',
            'B6923104-236C-4100-BA23-C4AC354B47A8', -- Entity: MJ_BizApps_Referrals: Jurisdictions
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = 'B6923104-236C-4100-BA23-C4AC354B47A8'),
            '__mj_Latitude',
            'Mj Latitude',
            NULL,
            'decimal',
            9,
            10,
            6,
            1,
            NULL,
            0,
            0,
            1,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

      IF NOT EXISTS (SELECT 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE ID = 'f76c72da-5f10-4abc-9109-98fd4be2b441' OR (EntityID = 'B6923104-236C-4100-BA23-C4AC354B47A8' AND Name = '__mj_Longitude')) BEGIN
         INSERT INTO [${flyway:defaultSchema}].[EntityField]
         (
            [ID],
            [EntityID],
            [Sequence],
            [Name],
            [DisplayName],
            [Description],
            [Type],
            [Length],
            [Precision],
            [Scale],
            [AllowsNull],
            [DefaultValue],
            [AutoIncrement],
            [AllowUpdateAPI],
            [IsVirtual],
            [IsComputed],
            [RelatedEntityID],
            [RelatedEntityFieldName],
            [IsNameField],
            [IncludeInUserSearchAPI],
            [IncludeRelatedEntityNameFieldInBaseView],
            [DefaultInView],
            [IsPrimaryKey],
            [IsUnique],
            [RelatedEntityDisplayType],
            [__mj_CreatedAt],
            [__mj_UpdatedAt]
         )
         VALUES
         (
            'f76c72da-5f10-4abc-9109-98fd4be2b441',
            'B6923104-236C-4100-BA23-C4AC354B47A8', -- Entity: MJ_BizApps_Referrals: Jurisdictions
            (SELECT COALESCE(MAX([Sequence]), 0) + 1 FROM [${flyway:defaultSchema}].[EntityField] WHERE [EntityID] = 'B6923104-236C-4100-BA23-C4AC354B47A8'),
            '__mj_Longitude',
            'Mj Longitude',
            NULL,
            'decimal',
            9,
            10,
            6,
            1,
            NULL,
            0,
            0,
            1,
            0,
            NULL,
            NULL,
            0,
            0,
            0,
            0,
            0,
            0,
            'Search',
            GETUTCDATE(),
            GETUTCDATE()
         )
      END;

/* Set ExtendedType=GeoLatitude on virtual geo fields */
UPDATE [${flyway:defaultSchema}].[EntityField] SET [ExtendedType] = 'GeoLatitude' WHERE [Name] = '__mj_Latitude' AND [ExtendedType] IS NULL AND [EntityID] IN ('B6923104-236C-4100-BA23-C4AC354B47A8');

/* Set ExtendedType=GeoLongitude on virtual geo fields */
UPDATE [${flyway:defaultSchema}].[EntityField] SET [ExtendedType] = 'GeoLongitude' WHERE [Name] = '__mj_Longitude' AND [ExtendedType] IS NULL AND [EntityID] IN ('B6923104-236C-4100-BA23-C4AC354B47A8');

/* Generated Validation Functions for MJ_BizApps_Referrals: Professional Practice Areas */
-- CHECK constraint for MJ_BizApps_Referrals: Professional Practice Areas: Field: YearsInPractice was newly set or modified since the last generation of the validation function, the code was regenerated and updating the GeneratedCode table with the new generated validation function
IF NOT EXISTS (
      SELECT 1 FROM [${flyway:defaultSchema}].[GeneratedCode] WHERE [CategoryID] = (SELECT [ID] FROM [${flyway:defaultSchema}].[vwGeneratedCodeCategories] WHERE [Name]='CodeGen: Validators') AND [LinkedEntityID] = 'DF238F34-2837-EF11-86D4-6045BDEE16E6' AND [LinkedRecordPrimaryKey] = '80E0EC03-6B28-4EDE-9DE7-92352ACC5F1B'
   )
   BEGIN
      INSERT INTO [${flyway:defaultSchema}].[GeneratedCode] ([ID], [CategoryID], [GeneratedByModelID], [GeneratedAt], [Language], [Status], [Source], [Code], [Description], [Name], [LinkedEntityID], [LinkedRecordPrimaryKey])
VALUES ('e6083c3c-9e6e-4c80-bdcc-c9a6dfc43b0c', (SELECT [ID] FROM [${flyway:defaultSchema}].[vwGeneratedCodeCategories] WHERE [Name]='CodeGen: Validators'), '4B500A24-0259-4EFF-9E34-24E9F5EC9DAB', GETUTCDATE(), 'TypeScript', 'Approved', '([YearsInPractice]>=(0))', 'public ValidateYearsInPracticeNonNegative(result: ValidationResult) {
	if (this.YearsInPractice != null && this.YearsInPractice < 0) {
		result.Errors.push(new ValidationErrorInfo(
			"YearsInPractice",
			"Years in practice must be zero or greater.",
			this.YearsInPractice,
			ValidationErrorType.Failure
		));
	}
}', 'Years in practice cannot be negative; it must be zero or greater.', 'ValidateYearsInPracticeNonNegative', 'DF238F34-2837-EF11-86D4-6045BDEE16E6', '80E0EC03-6B28-4EDE-9DE7-92352ACC5F1B')
   END;

/* Generated Validation Functions for MJ_BizApps_Referrals: Professional Profiles */
-- CHECK constraint for MJ_BizApps_Referrals: Professional Profiles: Field: ActiveReferralCount was newly set or modified since the last generation of the validation function, the code was regenerated and updating the GeneratedCode table with the new generated validation function
IF NOT EXISTS (
      SELECT 1 FROM [${flyway:defaultSchema}].[GeneratedCode] WHERE [CategoryID] = (SELECT [ID] FROM [${flyway:defaultSchema}].[vwGeneratedCodeCategories] WHERE [Name]='CodeGen: Validators') AND [LinkedEntityID] = 'DF238F34-2837-EF11-86D4-6045BDEE16E6' AND [LinkedRecordPrimaryKey] = '0B5F63F4-E367-44BE-87E6-5D2536AEB959'
   )
   BEGIN
      INSERT INTO [${flyway:defaultSchema}].[GeneratedCode] ([ID], [CategoryID], [GeneratedByModelID], [GeneratedAt], [Language], [Status], [Source], [Code], [Description], [Name], [LinkedEntityID], [LinkedRecordPrimaryKey])
VALUES ('ac7349ce-6322-4159-af34-4045ff01c4d6', (SELECT [ID] FROM [${flyway:defaultSchema}].[vwGeneratedCodeCategories] WHERE [Name]='CodeGen: Validators'), '4B500A24-0259-4EFF-9E34-24E9F5EC9DAB', GETUTCDATE(), 'TypeScript', 'Approved', '([ActiveReferralCount]>=(0))', 'public ValidateActiveReferralCountNonNegative(result: ValidationResult) {
	if (this.ActiveReferralCount != null && this.ActiveReferralCount < 0) {
		result.Errors.push(new ValidationErrorInfo(
			"ActiveReferralCount",
			"Active referral count cannot be negative.",
			this.ActiveReferralCount,
			ValidationErrorType.Failure
		));
	}
}', 'Active referral count cannot be negative.', 'ValidateActiveReferralCountNonNegative', 'DF238F34-2837-EF11-86D4-6045BDEE16E6', '0B5F63F4-E367-44BE-87E6-5D2536AEB959')
   END;

-- CHECK constraint for MJ_BizApps_Referrals: Professional Profiles: Field: MaxConcurrentReferrals was newly set or modified since the last generation of the validation function, the code was regenerated and updating the GeneratedCode table with the new generated validation function
IF NOT EXISTS (
      SELECT 1 FROM [${flyway:defaultSchema}].[GeneratedCode] WHERE [CategoryID] = (SELECT [ID] FROM [${flyway:defaultSchema}].[vwGeneratedCodeCategories] WHERE [Name]='CodeGen: Validators') AND [LinkedEntityID] = 'DF238F34-2837-EF11-86D4-6045BDEE16E6' AND [LinkedRecordPrimaryKey] = '740D617D-07B7-4112-BC2B-21EAF6823094'
   )
   BEGIN
      INSERT INTO [${flyway:defaultSchema}].[GeneratedCode] ([ID], [CategoryID], [GeneratedByModelID], [GeneratedAt], [Language], [Status], [Source], [Code], [Description], [Name], [LinkedEntityID], [LinkedRecordPrimaryKey])
VALUES ('5ec5d117-597c-46c3-bd65-320813a82986', (SELECT [ID] FROM [${flyway:defaultSchema}].[vwGeneratedCodeCategories] WHERE [Name]='CodeGen: Validators'), '4B500A24-0259-4EFF-9E34-24E9F5EC9DAB', GETUTCDATE(), 'TypeScript', 'Approved', '([MaxConcurrentReferrals]>(0))', 'public ValidateMaxConcurrentReferralsGreaterThanZero(result: ValidationResult) {
	if (this.MaxConcurrentReferrals <= 0) {
		result.Errors.push(new ValidationErrorInfo(
			"MaxConcurrentReferrals",
			"Maximum concurrent referrals must be greater than 0.",
			this.MaxConcurrentReferrals,
			ValidationErrorType.Failure
		));
	}
}', 'Maximum concurrent referrals must be greater than zero.', 'ValidateMaxConcurrentReferralsGreaterThanZero', 'DF238F34-2837-EF11-86D4-6045BDEE16E6', '740D617D-07B7-4112-BC2B-21EAF6823094')
   END;

-- CHECK constraint for MJ_BizApps_Referrals: Professional Profiles: Field: YearsExperience was newly set or modified since the last generation of the validation function, the code was regenerated and updating the GeneratedCode table with the new generated validation function
IF NOT EXISTS (
      SELECT 1 FROM [${flyway:defaultSchema}].[GeneratedCode] WHERE [CategoryID] = (SELECT [ID] FROM [${flyway:defaultSchema}].[vwGeneratedCodeCategories] WHERE [Name]='CodeGen: Validators') AND [LinkedEntityID] = 'DF238F34-2837-EF11-86D4-6045BDEE16E6' AND [LinkedRecordPrimaryKey] = 'A4E4F1D2-A10D-49E7-8314-C8ECAD0695B0'
   )
   BEGIN
      INSERT INTO [${flyway:defaultSchema}].[GeneratedCode] ([ID], [CategoryID], [GeneratedByModelID], [GeneratedAt], [Language], [Status], [Source], [Code], [Description], [Name], [LinkedEntityID], [LinkedRecordPrimaryKey])
VALUES ('c4029c2b-cde1-4dd9-83b9-e31e9396b9df', (SELECT [ID] FROM [${flyway:defaultSchema}].[vwGeneratedCodeCategories] WHERE [Name]='CodeGen: Validators'), '4B500A24-0259-4EFF-9E34-24E9F5EC9DAB', GETUTCDATE(), 'TypeScript', 'Approved', '([YearsExperience]>=(0))', 'public ValidateYearsExperienceNonNegative(result: ValidationResult) {
	if (this.YearsExperience != null && this.YearsExperience < 0) {
		result.Errors.push(new ValidationErrorInfo(
			"YearsExperience",
			"Years of experience must be greater than or equal to 0.",
			this.YearsExperience,
			ValidationErrorType.Failure
		));
	}
}', 'Years of experience cannot be negative.', 'ValidateYearsExperienceNonNegative', 'DF238F34-2837-EF11-86D4-6045BDEE16E6', 'A4E4F1D2-A10D-49E7-8314-C8ECAD0695B0')
   END;

-- CHECK constraint for MJ_BizApps_Referrals: Professional Profiles @ Table Level was newly set or modified since the last generation of the validation function, the code was regenerated and updating the GeneratedCode table with the new generated validation function
IF NOT EXISTS (
      SELECT 1 FROM [${flyway:defaultSchema}].[GeneratedCode] WHERE [CategoryID] = (SELECT [ID] FROM [${flyway:defaultSchema}].[vwGeneratedCodeCategories] WHERE [Name]='CodeGen: Validators') AND [LinkedEntityID] = 'E0238F34-2837-EF11-86D4-6045BDEE16E6' AND [LinkedRecordPrimaryKey] = '7492A921-FFCF-4A3E-B59A-56C88D16DDE1' AND [Name] = 'ValidateHourlyRateMaxGreaterThanOrEqualToMin'
   )
   BEGIN
      INSERT INTO [${flyway:defaultSchema}].[GeneratedCode] ([ID], [CategoryID], [GeneratedByModelID], [GeneratedAt], [Language], [Status], [Source], [Code], [Description], [Name], [LinkedEntityID], [LinkedRecordPrimaryKey])
VALUES ('876ffcc4-ae42-4c91-a205-a02765d35b55', (SELECT [ID] FROM [${flyway:defaultSchema}].[vwGeneratedCodeCategories] WHERE [Name]='CodeGen: Validators'), '4B500A24-0259-4EFF-9E34-24E9F5EC9DAB', GETUTCDATE(), 'TypeScript', 'Approved', '([HourlyRateMin] IS NULL OR [HourlyRateMax] IS NULL OR [HourlyRateMax]>=[HourlyRateMin])', 'public ValidateHourlyRateMaxGreaterThanOrEqualToMin(result: ValidationResult): void {
	if (this.HourlyRateMin != null && this.HourlyRateMax != null && this.HourlyRateMax < this.HourlyRateMin) {
		result.Errors.push(new ValidationErrorInfo(
			"HourlyRateMax",
			"Maximum hourly rate must be greater than or equal to the minimum hourly rate.",
			this.HourlyRateMax,
			ValidationErrorType.Failure
		));
	}
}', 'Maximum hourly rate must be greater than or equal to the minimum hourly rate when both rates are provided.', 'ValidateHourlyRateMaxGreaterThanOrEqualToMin', 'E0238F34-2837-EF11-86D4-6045BDEE16E6', '7492A921-FFCF-4A3E-B59A-56C88D16DDE1')
   END;

/* Generated Validation Functions for MJ_BizApps_Referrals: Referral Assignments */
-- CHECK constraint for MJ_BizApps_Referrals: Referral Assignments: Field: CascadeOrder was newly set or modified since the last generation of the validation function, the code was regenerated and updating the GeneratedCode table with the new generated validation function
IF NOT EXISTS (
      SELECT 1 FROM [${flyway:defaultSchema}].[GeneratedCode] WHERE [CategoryID] = (SELECT [ID] FROM [${flyway:defaultSchema}].[vwGeneratedCodeCategories] WHERE [Name]='CodeGen: Validators') AND [LinkedEntityID] = 'DF238F34-2837-EF11-86D4-6045BDEE16E6' AND [LinkedRecordPrimaryKey] = '326BCCA6-FEB0-4042-A6CD-69424CBF4CC5'
   )
   BEGIN
      INSERT INTO [${flyway:defaultSchema}].[GeneratedCode] ([ID], [CategoryID], [GeneratedByModelID], [GeneratedAt], [Language], [Status], [Source], [Code], [Description], [Name], [LinkedEntityID], [LinkedRecordPrimaryKey])
VALUES ('8106bc4a-b815-4628-9e02-6dcd43561561', (SELECT [ID] FROM [${flyway:defaultSchema}].[vwGeneratedCodeCategories] WHERE [Name]='CodeGen: Validators'), '4B500A24-0259-4EFF-9E34-24E9F5EC9DAB', GETUTCDATE(), 'TypeScript', 'Approved', '([CascadeOrder]>=(1))', 'public ValidateCascadeOrderMinimum(result: ValidationResult) {
	if (this.CascadeOrder != null && this.CascadeOrder < 1) {
		result.Errors.push(new ValidationErrorInfo(
			"CascadeOrder",
			"Cascade order must be at least 1.",
			this.CascadeOrder,
			ValidationErrorType.Failure
		));
	}
}', 'Cascade order must be a positive number of at least 1 to ensure a valid processing sequence', 'ValidateCascadeOrderMinimum', 'DF238F34-2837-EF11-86D4-6045BDEE16E6', '326BCCA6-FEB0-4042-A6CD-69424CBF4CC5')
   END;

/* Generated Validation Functions for MJ_BizApps_Referrals: Referral Feedbacks */
-- CHECK constraint for MJ_BizApps_Referrals: Referral Feedbacks: Field: Rating was newly set or modified since the last generation of the validation function, the code was regenerated and updating the GeneratedCode table with the new generated validation function
IF NOT EXISTS (
      SELECT 1 FROM [${flyway:defaultSchema}].[GeneratedCode] WHERE [CategoryID] = (SELECT [ID] FROM [${flyway:defaultSchema}].[vwGeneratedCodeCategories] WHERE [Name]='CodeGen: Validators') AND [LinkedEntityID] = 'DF238F34-2837-EF11-86D4-6045BDEE16E6' AND [LinkedRecordPrimaryKey] = '66AECA71-8D4A-4C59-A5C5-277235DD8B75'
   )
   BEGIN
      INSERT INTO [${flyway:defaultSchema}].[GeneratedCode] ([ID], [CategoryID], [GeneratedByModelID], [GeneratedAt], [Language], [Status], [Source], [Code], [Description], [Name], [LinkedEntityID], [LinkedRecordPrimaryKey])
VALUES ('8dc9cd94-f174-46e8-a6a1-1a0f95d9b4be', (SELECT [ID] FROM [${flyway:defaultSchema}].[vwGeneratedCodeCategories] WHERE [Name]='CodeGen: Validators'), '4B500A24-0259-4EFF-9E34-24E9F5EC9DAB', GETUTCDATE(), 'TypeScript', 'Approved', '([Rating]>=(1) AND [Rating]<=(5))', 'public ValidateRatingRange(result: ValidationResult) {
	if (this.Rating != null && (this.Rating < 1 || this.Rating > 5)) {
		result.Errors.push(new ValidationErrorInfo(
			"Rating",
			"Rating must be between 1 and 5.",
			this.Rating,
			ValidationErrorType.Failure
		));
	}
}', 'Rating must be an integer between 1 and 5 inclusive.', 'ValidateRatingRange', 'DF238F34-2837-EF11-86D4-6045BDEE16E6', '66AECA71-8D4A-4C59-A5C5-277235DD8B75')
   END;

/* Generated Validation Functions for MJ_BizApps_Referrals: Referral Tiers */
-- CHECK constraint for MJ_BizApps_Referrals: Referral Tiers: Field: MaxCascadeAttempts was newly set or modified since the last generation of the validation function, the code was regenerated and updating the GeneratedCode table with the new generated validation function
IF NOT EXISTS (
      SELECT 1 FROM [${flyway:defaultSchema}].[GeneratedCode] WHERE [CategoryID] = (SELECT [ID] FROM [${flyway:defaultSchema}].[vwGeneratedCodeCategories] WHERE [Name]='CodeGen: Validators') AND [LinkedEntityID] = 'DF238F34-2837-EF11-86D4-6045BDEE16E6' AND [LinkedRecordPrimaryKey] = '40BEE2DE-8CEF-47CB-B96B-1B310FDAD79D'
   )
   BEGIN
      INSERT INTO [${flyway:defaultSchema}].[GeneratedCode] ([ID], [CategoryID], [GeneratedByModelID], [GeneratedAt], [Language], [Status], [Source], [Code], [Description], [Name], [LinkedEntityID], [LinkedRecordPrimaryKey])
VALUES ('e6d14925-2591-4652-b8c8-39cc1d5bf8c6', (SELECT [ID] FROM [${flyway:defaultSchema}].[vwGeneratedCodeCategories] WHERE [Name]='CodeGen: Validators'), '4B500A24-0259-4EFF-9E34-24E9F5EC9DAB', GETUTCDATE(), 'TypeScript', 'Approved', '([MaxCascadeAttempts]>(0))', 'public ValidateMaxCascadeAttemptsGreaterThanZero(result: ValidationResult) {
	if (this.MaxCascadeAttempts <= 0) {
		result.Errors.push(new ValidationErrorInfo(
			"MaxCascadeAttempts",
			"Maximum cascade attempts must be greater than 0.",
			this.MaxCascadeAttempts,
			ValidationErrorType.Failure
		));
	}
}', 'Maximum cascade attempts must be greater than zero.', 'ValidateMaxCascadeAttemptsGreaterThanZero', 'DF238F34-2837-EF11-86D4-6045BDEE16E6', '40BEE2DE-8CEF-47CB-B96B-1B310FDAD79D')
   END;

-- CHECK constraint for MJ_BizApps_Referrals: Referral Tiers: Field: SLAResponseHours was newly set or modified since the last generation of the validation function, the code was regenerated and updating the GeneratedCode table with the new generated validation function
IF NOT EXISTS (
      SELECT 1 FROM [${flyway:defaultSchema}].[GeneratedCode] WHERE [CategoryID] = (SELECT [ID] FROM [${flyway:defaultSchema}].[vwGeneratedCodeCategories] WHERE [Name]='CodeGen: Validators') AND [LinkedEntityID] = 'DF238F34-2837-EF11-86D4-6045BDEE16E6' AND [LinkedRecordPrimaryKey] = '21266FBF-9BAE-4EAB-A5D9-DB421B479369'
   )
   BEGIN
      INSERT INTO [${flyway:defaultSchema}].[GeneratedCode] ([ID], [CategoryID], [GeneratedByModelID], [GeneratedAt], [Language], [Status], [Source], [Code], [Description], [Name], [LinkedEntityID], [LinkedRecordPrimaryKey])
VALUES ('75724174-9d94-450f-a700-eabeb7356a99', (SELECT [ID] FROM [${flyway:defaultSchema}].[vwGeneratedCodeCategories] WHERE [Name]='CodeGen: Validators'), '4B500A24-0259-4EFF-9E34-24E9F5EC9DAB', GETUTCDATE(), 'TypeScript', 'Approved', '([SLAResponseHours]>(0))', 'public ValidateSLAResponseHoursGreaterThanZero(result: ValidationResult) {
	if (this.SLAResponseHours != null && this.SLAResponseHours <= 0) {
		result.Errors.push(new ValidationErrorInfo(
			"SLAResponseHours",
			"SLA response hours must be greater than 0.",
			this.SLAResponseHours,
			ValidationErrorType.Failure
		));
	}
}', 'SLA response hours must be greater than zero.', 'ValidateSLAResponseHoursGreaterThanZero', 'DF238F34-2837-EF11-86D4-6045BDEE16E6', '21266FBF-9BAE-4EAB-A5D9-DB421B479369')
   END;

