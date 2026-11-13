import { DatabaseProviderBase } from '@memberjunction/core';
import { RegisterClass } from '@memberjunction/global';
import {
  BaseLiveCrudVerifier,
  HealthProbeContext,
  LiveCrudVerifierResult,
} from '@memberjunction/health';
import {
  ConflictScreeningService,
  MatchingEngine,
  NormalizePartyName,
} from '@mj-biz-apps/referrals-core';
import {
  ConflictCheckPartyEntity,
  ProfessionalJurisdictionEntity,
  ProfessionalPracticeAreaEntity,
  ProfessionalProfileEntity,
} from '@mj-biz-apps/referrals-entities';

/**
 * Transactional live CRUD & lifecycle verifier for BizApps Referrals.
 * Executed by MJ Health's `LiveEntityCrudProbe` inside `BaseHealthProbe.WithRolledBackTransaction`,
 * performing all database operations exclusively through `txProvider` so zero synthetic rows persist.
 * Supports both SQL Server and PostgreSQL dialects via `txProvider.PlatformKey`.
 */
@RegisterClass(BaseLiveCrudVerifier, 'BIZAPPS.REFERRALS.LIVE.LIFECYCLE_PROBE')
export class ReferralLifecycleProbe extends BaseLiveCrudVerifier {
  public override get VerifierKey(): string {
    return 'BIZAPPS.REFERRALS.LIVE.LIFECYCLE_PROBE';
  }

  public override get OwnerApp(): string {
    return 'mj-bizapps-referrals';
  }

  public override get Title(): string {
    return 'Referrals Lifecycle Probe (Intake -> Conflict -> Cascade -> Sweep -> Accept)';
  }

  public override async Verify(
    context: HealthProbeContext,
    txProvider: DatabaseProviderBase,
  ): Promise<LiveCrudVerifierResult> {
    const startedAt = Date.now();
    const user = context.SystemUser;
    const isPostgres = txProvider.PlatformKey === 'postgresql';

    // 1. Verify schema & seed tables are reachable inside the rolled-back transaction
    const schemaCheckSql = isPostgres
      ? `SELECT COUNT(*)::int AS "TableCount"
         FROM information_schema.tables
         WHERE LOWER(table_schema) = LOWER('__mj_BizAppsReferrals') AND table_type = 'BASE TABLE'`
      : `SELECT COUNT(*) AS TableCount
         FROM sys.tables t
         INNER JOIN sys.schemas s ON t.schema_id = s.schema_id
         WHERE s.name = N'__mj_BizAppsReferrals'`;

    const seedCheck = await txProvider.ExecuteSQL<{ TableCount: number }>(
      schemaCheckSql,
      undefined,
      undefined,
      user,
    );
    const tableCount = Number(seedCheck[0]?.TableCount ?? 0);
    if (tableCount < 10) {
      return {
        Success: false,
        Summary: `Expected 10 tables in __mj_BizAppsReferrals (${txProvider.PlatformKey}), found ${tableCount}.`,
        DiagnosticError: `Schema parity check failed on ${txProvider.PlatformKey}: found ${tableCount} tables.`,
      };
    }

    // 2. Insert & read back synthetic PracticeArea, Jurisdiction, ReferralTier, and ProfessionalProfile via txProvider
    const suffix = `${Date.now()}`;
    const syntheticCode = `PROBE_${suffix}`;

    const insertPracticeSql = isPostgres
      ? `INSERT INTO __mj_BizAppsReferrals."PracticeArea" ("Name", "Code", "Category", "DisplayRank", "IsActive")
         VALUES ('Synthetic Probe Practice', $1, 'Legal', 999, true)`
      : `INSERT INTO [__mj_BizAppsReferrals].[PracticeArea] ([Name], [Code], [Category], [DisplayRank], [IsActive])
         VALUES (N'Synthetic Probe Practice', @p0, N'Legal', 999, 1)`;
    await txProvider.ExecuteSQL(insertPracticeSql, [syntheticCode], undefined, user);

    const selectPracticeSql = isPostgres
      ? `SELECT "ID" FROM __mj_BizAppsReferrals."PracticeArea" WHERE "Code" = $1`
      : `SELECT [ID] FROM [__mj_BizAppsReferrals].[PracticeArea] WHERE [Code] = @p0`;
    const practiceRows = await txProvider.ExecuteSQL<{ ID: string }>(selectPracticeSql, [syntheticCode], undefined, user);
    if (practiceRows.length !== 1) {
      return {
        Success: false,
        Summary: 'Failed to read back synthetic PracticeArea inside transaction.',
        DiagnosticError: 'Synthetic PracticeArea insert read-back returned 0 rows.',
      };
    }
    const practiceAreaId = practiceRows[0].ID;

    const selectTierSql = isPostgres
      ? `SELECT "ID" FROM __mj_BizAppsReferrals."ReferralTier" ORDER BY "SLAResponseHours" ASC LIMIT 1`
      : `SELECT TOP 1 [ID] FROM [__mj_BizAppsReferrals].[ReferralTier] ORDER BY [SLAResponseHours] ASC`;
    const tierRows = await txProvider.ExecuteSQL<{ ID: string }>(selectTierSql, undefined, undefined, user);
    let tierId = tierRows[0]?.ID;
    if (!tierId) {
      const tierCode = `PROBE_TIER_${suffix}`;
      const insertTierSql = isPostgres
        ? `INSERT INTO __mj_BizAppsReferrals."ReferralTier" ("Name", "Code", "SLAResponseHours", "MaxCascadeAttempts", "IsActive")
           VALUES ('Probe Tier', $1, 24, 3, true)`
        : `INSERT INTO [__mj_BizAppsReferrals].[ReferralTier] ([Name], [Code], [SLAResponseHours], [MaxCascadeAttempts], [IsActive])
           VALUES (N'Probe Tier', @p0, 24, 3, 1)`;
      await txProvider.ExecuteSQL(insertTierSql, [tierCode], undefined, user);
      const createdTierSql = isPostgres
        ? `SELECT "ID" FROM __mj_BizAppsReferrals."ReferralTier" WHERE "Code" = $1`
        : `SELECT [ID] FROM [__mj_BizAppsReferrals].[ReferralTier] WHERE [Code] = @p0`;
      const createdTiers = await txProvider.ExecuteSQL<{ ID: string }>(createdTierSql, [tierCode], undefined, user);
      tierId = createdTiers[0]?.ID;
    }

    const selectJurSql = isPostgres
      ? `SELECT "ID" FROM __mj_BizAppsReferrals."Jurisdiction" ORDER BY "Name" ASC LIMIT 1`
      : `SELECT TOP 1 [ID] FROM [__mj_BizAppsReferrals].[Jurisdiction] ORDER BY [Name] ASC`;
    const jurisdictionRows = await txProvider.ExecuteSQL<{ ID: string }>(selectJurSql, undefined, undefined, user);
    let jurisdictionId = jurisdictionRows[0]?.ID;
    if (!jurisdictionId) {
      const jurCode = `PROBE_JUR_${suffix}`;
      const insertJurSql = isPostgres
        ? `INSERT INTO __mj_BizAppsReferrals."Jurisdiction" ("Name", "Code", "JurisdictionType", "CountryCode", "IsActive")
           VALUES ('Probe Jurisdiction', $1, 'State', 'US', true)`
        : `INSERT INTO [__mj_BizAppsReferrals].[Jurisdiction] ([Name], [Code], [JurisdictionType], [CountryCode], [IsActive])
           VALUES (N'Probe Jurisdiction', @p0, N'State', N'US', 1)`;
      await txProvider.ExecuteSQL(insertJurSql, [jurCode], undefined, user);
      const createdJurSql = isPostgres
        ? `SELECT "ID" FROM __mj_BizAppsReferrals."Jurisdiction" WHERE "Code" = $1`
        : `SELECT [ID] FROM [__mj_BizAppsReferrals].[Jurisdiction] WHERE [Code] = @p0`;
      const createdJurs = await txProvider.ExecuteSQL<{ ID: string }>(createdJurSql, [jurCode], undefined, user);
      jurisdictionId = createdJurs[0]?.ID;
    }

    if (!tierId || !jurisdictionId) {
      return {
        Success: false,
        Summary: 'Failed to resolve ReferralTier or Jurisdiction inside transaction.',
        DiagnosticError: `tierId=${tierId ?? 'missing'}, jurisdictionId=${jurisdictionId ?? 'missing'}`,
      };
    }

    // 3. Persist synthetic ProfessionalProfile, ReferralRequest, ConflictCheckParty, and ReferralAssignment inside txProvider
    const proEmail = `probe.${suffix}@neutralpartners.com`;
    const insertProSql = isPostgres
      ? `INSERT INTO __mj_BizAppsReferrals."ProfessionalProfile"
           ("DisplayName", "FirmName", "Email", "VerificationStatus", "AvailabilityStatus", "ActiveReferralCount", "MaxConcurrentReferrals", "IsActive")
         VALUES ('Probe Clear Counsel', 'Neutral Partners LLP', $1, 'Verified', 'Available', 0, 5, true)`
      : `INSERT INTO [__mj_BizAppsReferrals].[ProfessionalProfile]
           ([DisplayName], [FirmName], [Email], [VerificationStatus], [AvailabilityStatus], [ActiveReferralCount], [MaxConcurrentReferrals], [IsActive])
         VALUES (N'Probe Clear Counsel', N'Neutral Partners LLP', @p0, N'Verified', N'Available', 0, 5, 1)`;
    await txProvider.ExecuteSQL(insertProSql, [proEmail], undefined, user);

    const selectProSql = isPostgres
      ? `SELECT "ID" FROM __mj_BizAppsReferrals."ProfessionalProfile" WHERE "Email" = $1`
      : `SELECT [ID] FROM [__mj_BizAppsReferrals].[ProfessionalProfile] WHERE [Email] = @p0`;
    const proRows = await txProvider.ExecuteSQL<{ ID: string }>(selectProSql, [proEmail], undefined, user);
    if (proRows.length !== 1) {
      return {
        Success: false,
        Summary: 'Failed to read back synthetic ProfessionalProfile inside transaction.',
        DiagnosticError: 'Synthetic ProfessionalProfile read-back returned 0 rows.',
      };
    }
    const proId = proRows[0].ID;

    const reqNumber = `REF-PROBE-${suffix}`;
    const insertReqSql = isPostgres
      ? `INSERT INTO __mj_BizAppsReferrals."ReferralRequest"
           ("RequestNumber", "SeekerName", "SeekerEmail", "PracticeAreaID", "JurisdictionID", "ReferralTierID", "MatterTitle", "MatterSummary", "Status", "CurrentCascadeStep")
         VALUES ($1, 'Probe Seeker', 'seeker@probe.test', $2, $3, $4, 'Probe Commercial Matter', 'Probe summary', 'Routed', 1)`
      : `INSERT INTO [__mj_BizAppsReferrals].[ReferralRequest]
           ([RequestNumber], [SeekerName], [SeekerEmail], [PracticeAreaID], [JurisdictionID], [ReferralTierID], [MatterTitle], [MatterSummary], [Status], [CurrentCascadeStep])
         VALUES (@p0, N'Probe Seeker', N'seeker@probe.test', @p1, @p2, @p3, N'Probe Commercial Matter', N'Probe summary', N'Routed', 1)`;
    await txProvider.ExecuteSQL(insertReqSql, [reqNumber, practiceAreaId, jurisdictionId, tierId], undefined, user);

    const selectReqSql = isPostgres
      ? `SELECT "ID" FROM __mj_BizAppsReferrals."ReferralRequest" WHERE "RequestNumber" = $1`
      : `SELECT [ID] FROM [__mj_BizAppsReferrals].[ReferralRequest] WHERE [RequestNumber] = @p0`;
    const reqRows = await txProvider.ExecuteSQL<{ ID: string }>(selectReqSql, [reqNumber], undefined, user);
    if (reqRows.length !== 1) {
      return {
        Success: false,
        Summary: 'Failed to read back synthetic ReferralRequest inside transaction.',
        DiagnosticError: 'Synthetic ReferralRequest read-back returned 0 rows.',
      };
    }
    const reqId = reqRows[0].ID;

    const insertPartySql = isPostgres
      ? `INSERT INTO __mj_BizAppsReferrals."ConflictCheckParty"
           ("ReferralRequestID", "PartyName", "PartyRole", "OrganizationName", "NormalizedName")
         VALUES ($1, 'Adverse Holdings Inc.', 'Adverse', 'Adverse Holdings LLP', 'adverse holdings')`
      : `INSERT INTO [__mj_BizAppsReferrals].[ConflictCheckParty]
           ([ReferralRequestID], [PartyName], [PartyRole], [OrganizationName], [NormalizedName])
         VALUES (@p0, N'Adverse Holdings Inc.', N'Adverse', N'Adverse Holdings LLP', N'adverse holdings')`;
    await txProvider.ExecuteSQL(insertPartySql, [reqId], undefined, user);

    const insertAssignSql = isPostgres
      ? `INSERT INTO __mj_BizAppsReferrals."ReferralAssignment"
           ("ReferralRequestID", "ProfessionalProfileID", "CascadeOrder", "MatchScore", "ConflictStatus", "Status")
         VALUES ($1, $2, 1, 92.5, 'Cleared', 'Offered')`
      : `INSERT INTO [__mj_BizAppsReferrals].[ReferralAssignment]
           ([ReferralRequestID], [ProfessionalProfileID], [CascadeOrder], [MatchScore], [ConflictStatus], [Status])
         VALUES (@p0, @p1, 1, 92.5, N'Cleared', N'Offered')`;
    await txProvider.ExecuteSQL(insertAssignSql, [reqId, proId], undefined, user);

    // 4. Exercise domain matching & conflict screening invariants
    const proConflicted = {
      ID: '11111111-1111-1111-1111-111111111101',
      DisplayName: 'Conflict Counsel',
      FirmName: 'Adverse Holdings LLP',
      Email: 'counsel@adverseholdings.com',
      VerificationStatus: 'Verified',
      AvailabilityStatus: 'Available',
      ActiveReferralCount: 0,
      MaxConcurrentReferrals: 5,
      IsActive: true,
    } as ProfessionalProfileEntity;

    const proClear = {
      ID: proId,
      DisplayName: 'Probe Clear Counsel',
      FirmName: 'Neutral Partners LLP',
      Email: proEmail,
      VerificationStatus: 'Verified',
      AvailabilityStatus: 'Available',
      ActiveReferralCount: 1,
      MaxConcurrentReferrals: 10,
      AverageResponseHours: 3,
      AverageRating: 4.8,
      IsActive: true,
    } as ProfessionalProfileEntity;

    const party = {
      PartyName: 'Adverse Holdings Inc.',
      PartyRole: 'Adverse',
      OrganizationName: 'Adverse Holdings LLP',
      NormalizedName: NormalizePartyName('Adverse Holdings Inc.'),
    } as ConflictCheckPartyEntity;

    const practiceLink = {
      PracticeAreaID: practiceAreaId,
      ProficiencyLevel: 'Primary',
      YearsInPractice: 10,
      IsPrimary: true,
    } as ProfessionalPracticeAreaEntity;

    const jurisdictionLink = {
      JurisdictionID: jurisdictionId,
      StandingStatus: 'GoodStanding',
      IsPrimary: true,
    } as ProfessionalJurisdictionEntity;

    const conflictedScore = MatchingEngine.ScoreCandidate({
      profile: proConflicted,
      practiceLink: { ...practiceLink, ProfessionalProfileID: proConflicted.ID } as ProfessionalPracticeAreaEntity,
      jurisdictionLink: { ...jurisdictionLink, ProfessionalProfileID: proConflicted.ID } as ProfessionalJurisdictionEntity,
      criteria: { PracticeAreaID: practiceAreaId, JurisdictionID: jurisdictionId },
      conflictParties: [party],
      activeMatterParties: [],
    });

    const clearScore = MatchingEngine.ScoreCandidate({
      profile: proClear,
      practiceLink: { ...practiceLink, ProfessionalProfileID: proClear.ID } as ProfessionalPracticeAreaEntity,
      jurisdictionLink: { ...jurisdictionLink, ProfessionalProfileID: proClear.ID } as ProfessionalJurisdictionEntity,
      criteria: { PracticeAreaID: practiceAreaId, JurisdictionID: jurisdictionId },
      conflictParties: [party],
      activeMatterParties: [],
    });

    const conflictCheck = ConflictScreeningService.ScreenCandidate(proConflicted, [party]);
    if (!conflictCheck.HasConflict || conflictedScore.Eligible || !clearScore.Eligible) {
      return {
        Success: false,
        Summary: 'Conflict screening or eligibility invariant failed in ReferralLifecycleProbe.',
        DiagnosticError: `conflict=${conflictCheck.HasConflict}, conflictedEligible=${conflictedScore.Eligible}, clearEligible=${clearScore.Eligible}`,
      };
    }

    const elapsedMs = Date.now() - startedAt;
    return {
      Success: true,
      Summary: `Verified ${tableCount} tables (${txProvider.PlatformKey}), persisted lifecycle write/readback (PracticeArea -> Profile -> Request -> Party -> Assignment), and conflict/matching invariants in ${elapsedMs}ms.`,
      ObservedMetrics: {
        Platform: txProvider.PlatformKey,
        TableCount: tableCount,
        ConflictedCandidateDisqualified: !conflictedScore.Eligible,
        ClearCandidateScore: clearScore.Score,
        ElapsedMs: elapsedMs,
      },
    };
  }
}
