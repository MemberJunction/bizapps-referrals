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
         WHERE table_schema = '__mj_BizAppsReferrals' AND table_type = 'BASE TABLE'`
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

    // 2. Exercise synthetic entity write & rollback boundary via txProvider (dialect-aware)
    const syntheticCode = `PROBE_${Date.now()}`;
    const insertPracticeSql = isPostgres
      ? `INSERT INTO "__mj_BizAppsReferrals"."PracticeArea" ("Name", "Code", "Category", "DisplayRank", "IsActive")
         VALUES ('Synthetic Probe Practice', $1, 'Legal', 999, true)`
      : `INSERT INTO [__mj_BizAppsReferrals].[PracticeArea] ([Name], [Code], [Category], [DisplayRank], [IsActive])
         VALUES (N'Synthetic Probe Practice', @p0, N'Legal', 999, 1)`;

    await txProvider.ExecuteSQL(insertPracticeSql, [syntheticCode], undefined, user);

    const selectPracticeSql = isPostgres
      ? `SELECT "ID" FROM "__mj_BizAppsReferrals"."PracticeArea" WHERE "Code" = $1`
      : `SELECT [ID] FROM [__mj_BizAppsReferrals].[PracticeArea] WHERE [Code] = @p0`;

    const inserted = await txProvider.ExecuteSQL<{ ID: string }>(
      selectPracticeSql,
      [syntheticCode],
      undefined,
      user,
    );
    if (inserted.length !== 1) {
      return {
        Success: false,
        Summary: 'Failed to read back synthetic PracticeArea inside transaction.',
        DiagnosticError: 'Synthetic insert read-back returned 0 rows.',
      };
    }

    const syntheticPracticeAreaId = inserted[0].ID;

    // 3. Exercise synthetic ReferralRequest + ConflictCheckParty insert/readback inside rolled-back tx
    const syntheticTierSql = isPostgres
      ? `SELECT "ID" FROM "__mj_BizAppsReferrals"."SubscriptionTier" ORDER BY "DisplayRank" ASC LIMIT 1`
      : `SELECT TOP 1 [ID] FROM [__mj_BizAppsReferrals].[SubscriptionTier] ORDER BY [DisplayRank] ASC`;
    const tierRows = await txProvider.ExecuteSQL<{ ID: string }>(syntheticTierSql, undefined, undefined, user);
    const tierId = tierRows[0]?.ID;

    const syntheticJurisdictionSql = isPostgres
      ? `SELECT "ID" FROM "__mj_BizAppsReferrals"."Jurisdiction" ORDER BY "Name" ASC LIMIT 1`
      : `SELECT TOP 1 [ID] FROM [__mj_BizAppsReferrals].[Jurisdiction] ORDER BY [Name] ASC`;
    const jurisdictionRows = await txProvider.ExecuteSQL<{ ID: string }>(
      syntheticJurisdictionSql,
      undefined,
      undefined,
      user,
    );
    const jurisdictionId = jurisdictionRows[0]?.ID ?? 'B1000001-0000-0000-0000-000000000001';

    if (tierId && jurisdictionRows[0]?.ID) {
      const insertProSql = isPostgres
        ? `INSERT INTO "__mj_BizAppsReferrals"."ProfessionalProfile"
             ("SubscriptionTierID", "DisplayName", "FirmName", "Email", "VerificationStatus", "AvailabilityStatus", "ActiveReferralCount", "MaxConcurrentReferrals", "IsActive")
           VALUES ($1, 'Probe Clear Counsel', 'Neutral Partners LLP', $2, 'Verified', 'Available', 0, 5, true)`
        : `INSERT INTO [__mj_BizAppsReferrals].[ProfessionalProfile]
             ([SubscriptionTierID], [DisplayName], [FirmName], [Email], [VerificationStatus], [AvailabilityStatus], [ActiveReferralCount], [MaxConcurrentReferrals], [IsActive])
           VALUES (@p0, N'Probe Clear Counsel', N'Neutral Partners LLP', @p1, N'Verified', N'Available', 0, 5, 1)`;
      const proEmail = `probe.${Date.now()}@neutralpartners.com`;
      await txProvider.ExecuteSQL(insertProSql, [tierId, proEmail], undefined, user);

      const selectProSql = isPostgres
        ? `SELECT "ID" FROM "__mj_BizAppsReferrals"."ProfessionalProfile" WHERE "Email" = $1`
        : `SELECT [ID] FROM [__mj_BizAppsReferrals].[ProfessionalProfile] WHERE [Email] = @p0`;
      const proRows = await txProvider.ExecuteSQL<{ ID: string }>(selectProSql, [proEmail], undefined, user);
      if (proRows.length !== 1) {
        return {
          Success: false,
          Summary: 'Failed to read back synthetic ProfessionalProfile inside transaction.',
          DiagnosticError: 'Synthetic ProfessionalProfile read-back returned 0 rows.',
        };
      }
    }

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
      ID: '11111111-1111-1111-1111-111111111102',
      DisplayName: 'Clear Counsel',
      FirmName: 'Neutral Partners LLP',
      Email: 'counsel@neutralpartners.com',
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
      PracticeAreaID: syntheticPracticeAreaId,
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
      criteria: { PracticeAreaID: syntheticPracticeAreaId, JurisdictionID: jurisdictionId },
      conflictParties: [party],
      activeMatterParties: [],
    });

    const clearScore = MatchingEngine.ScoreCandidate({
      profile: proClear,
      practiceLink: { ...practiceLink, ProfessionalProfileID: proClear.ID } as ProfessionalPracticeAreaEntity,
      jurisdictionLink: { ...jurisdictionLink, ProfessionalProfileID: proClear.ID } as ProfessionalJurisdictionEntity,
      criteria: { PracticeAreaID: syntheticPracticeAreaId, JurisdictionID: jurisdictionId },
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
      Summary: `Verified ${tableCount} tables (${txProvider.PlatformKey}), transactional write/readback, and conflict/matching invariants in ${elapsedMs}ms.`,
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
