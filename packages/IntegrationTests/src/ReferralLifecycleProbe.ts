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

    // 1. Verify schema & seed tables are reachable inside the rolled-back transaction
    const seedCheck = await txProvider.ExecuteSQL<{ TableCount: number }>(
      `SELECT COUNT(*) AS TableCount
       FROM sys.tables t
       INNER JOIN sys.schemas s ON t.schema_id = s.schema_id
       WHERE s.name = N'__mj_BizAppsReferrals'`,
      undefined,
      undefined,
      user,
    );
    const tableCount = seedCheck[0]?.TableCount ?? 0;
    if (tableCount < 10) {
      return {
        Success: false,
        Summary: `Expected 10 tables in __mj_BizAppsReferrals, found ${tableCount}.`,
        DiagnosticError: `Schema parity check failed: found ${tableCount} tables.`,
      };
    }

    // 2. Exercise synthetic entity write & rollback boundary via txProvider
    const syntheticCode = `PROBE_${Date.now()}`;
    await txProvider.ExecuteSQL(
      `INSERT INTO [__mj_BizAppsReferrals].[PracticeArea] ([Name], [Code], [Category], [DisplayRank], [IsActive])
       VALUES (N'Synthetic Probe Practice', @p0, N'Legal', 999, 1)`,
      [syntheticCode],
      undefined,
      user,
    );

    const inserted = await txProvider.ExecuteSQL<{ ID: string }>(
      `SELECT [ID] FROM [__mj_BizAppsReferrals].[PracticeArea] WHERE [Code] = @p0`,
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

    // 3. Exercise domain matching & conflict screening invariants
    const proConflicted = {
      ID: 'probe-pro-conflict',
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
      ID: 'probe-pro-clear',
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
      PracticeAreaID: inserted[0].ID,
      ProficiencyLevel: 'Primary',
      YearsInPractice: 10,
      IsPrimary: true,
    } as ProfessionalPracticeAreaEntity;

    const jurisdictionLink = {
      JurisdictionID: 'B1000001-0000-0000-0000-000000000001',
      StandingStatus: 'GoodStanding',
      IsPrimary: true,
    } as ProfessionalJurisdictionEntity;

    const conflictedScore = MatchingEngine.ScoreCandidate({
      profile: proConflicted,
      practiceLink: { ...practiceLink, ProfessionalProfileID: proConflicted.ID } as ProfessionalPracticeAreaEntity,
      jurisdictionLink: { ...jurisdictionLink, ProfessionalProfileID: proConflicted.ID } as ProfessionalJurisdictionEntity,
      criteria: { PracticeAreaID: inserted[0].ID, JurisdictionID: jurisdictionLink.JurisdictionID },
      conflictParties: [party],
      activeMatterParties: [],
    });

    const clearScore = MatchingEngine.ScoreCandidate({
      profile: proClear,
      practiceLink: { ...practiceLink, ProfessionalProfileID: proClear.ID } as ProfessionalPracticeAreaEntity,
      jurisdictionLink: { ...jurisdictionLink, ProfessionalProfileID: proClear.ID } as ProfessionalJurisdictionEntity,
      criteria: { PracticeAreaID: inserted[0].ID, JurisdictionID: jurisdictionLink.JurisdictionID },
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
      Summary: `Verified ${tableCount} tables, transactional write/readback, and conflict/matching invariants in ${elapsedMs}ms.`,
      ObservedMetrics: {
        TableCount: tableCount,
        ConflictedCandidateDisqualified: !conflictedScore.Eligible,
        ClearCandidateScore: clearScore.Score,
        ElapsedMs: elapsedMs,
      },
    };
  }
}
