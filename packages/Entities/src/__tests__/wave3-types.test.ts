import * as fs from 'fs';
import * as path from 'path';
import { describe, expect, expectTypeOf, it } from 'vitest';
import {
  ProfessionalAvailabilityWindowEntity,
  ReciprocitySnapshotEntity,
  ReferralAssignmentEntity,
  ReferralEscalationEntity,
  ReferralOutcomeEntity,
  ReferralRequestEntity,
} from '../index.js';

describe('@mj-biz-apps/referrals-entities (Wave 3 Slice 1)', () => {
  it('exports the 4 new Wave 3 entity classes', () => {
    expect(ReferralEscalationEntity).toBeDefined();
    expect(ReferralOutcomeEntity).toBeDefined();
    expect(ProfessionalAvailabilityWindowEntity).toBeDefined();
    expect(ReciprocitySnapshotEntity).toBeDefined();
  });

  it('registers the new entity classes under @memberjunction/global ClassFactory', () => {
    expect(ReferralEscalationEntity.name).toBe('mjBizAppsReferralsReferralEscalationEntity');
    expect(ReferralOutcomeEntity.name).toBe('mjBizAppsReferralsReferralOutcomeEntity');
    expect(ProfessionalAvailabilityWindowEntity.name).toBe('mjBizAppsReferralsProfessionalAvailabilityWindowEntity');
    expect(ReciprocitySnapshotEntity.name).toBe('mjBizAppsReferralsReciprocitySnapshotEntity');
  });

  it('Round 2: statically types ReferralAssignment.Status and ReferralRequest.SourceChannel as closed literal unions', () => {
    expectTypeOf<ReferralAssignmentEntity['Status']>().toEqualTypeOf<
      'Queued' | 'Offered' | 'Accepted' | 'InProgress' | 'Completed' | 'Declined' | 'ConflictRejected' | 'Expired' | 'Withdrawn'
    >();
    expectTypeOf<ReferralRequestEntity['SourceChannel']>().toEqualTypeOf<
      'SeekerIntake' | 'FinderWidget' | 'ProReferral' | 'Concierge' | 'OperatorManual'
    >();
  });
});

describe('Round 3 AC-7: migration CHECK value sets match across SQL Server/PostgreSQL and Spec SS2.2/SS2.3', () => {
  const repoRoot = path.resolve(__dirname, '../../../..');
  const sqlServerMigration = fs.readFileSync(
    path.join(repoRoot, 'migrations/V202611151000__v1.2.0__SLA_Escalation_Outcomes_And_Readiness.sql'),
    'utf8',
  );
  const postgresMigration = fs.readFileSync(
    path.join(repoRoot, 'migrations-pg/V202611151000__v1.2.0__SLA_Escalation_Outcomes_And_Readiness.pg.sql'),
    'utf8',
  );

  /** Extracts the `IN (...)` value list immediately following a named CHECK constraint, in both T-SQL (`N'X'`) and PostgreSQL (`'X'`) dialects, normalized and sorted. */
  function extractCheckValues(sql: string, constraintName: string): string[] {
    const re = new RegExp(`[\\["]?${constraintName}[\\]"]?\\s+CHECK\\s*\\([^)]*?IN\\s*\\(([^)]*)\\)`, 's');
    const match = re.exec(sql);
    if (!match) {
      throw new Error(`CHECK constraint '${constraintName}' not found.`);
    }
    return match[1]
      .split(',')
      .map((v) => v.trim().replace(/^N?'/, '').replace(/'$/, ''))
      .sort();
  }

  const checksToCompare: Array<{ name: string; expected: string[] }> = [
    {
      name: 'CK_ReferralEscalation_TriggerType',
      expected: ['SLAWarning', 'SLABreach', 'CascadeExhausted', 'UrgentUnassigned', 'Manual', 'AIRecommended'].sort(),
    },
    {
      name: 'CK_ReferralEscalation_Status',
      expected: ['Open', 'Acknowledged', 'Resolved', 'Dismissed'].sort(),
    },
    {
      name: 'CK_ReferralEscalation_RecommendedAction',
      expected: ['ReassignNextCandidate', 'ExpandPracticeArea', 'ExtendSLA', 'ContactSeeker', 'CloseAsExhausted'].sort(),
    },
    {
      name: 'CK_ReferralOutcome_OutcomeStatus',
      expected: ['Engaged', 'Resolved', 'Withdrawn', 'NoEngagement', 'Lost'].sort(),
    },
    {
      name: 'CK_ReferralOutcome_ReportedByType',
      expected: ['Professional', 'Operator', 'Seeker'].sort(),
    },
    {
      name: 'CK_ProfessionalAvailabilityWindow_WindowType',
      expected: ['OnLeave', 'Paused', 'ReducedCapacity'].sort(),
    },
    {
      name: 'CK_ReferralRequest_SourceChannel',
      expected: ['SeekerIntake', 'FinderWidget', 'ProReferral', 'Concierge', 'OperatorManual'].sort(),
    },
  ];

  for (const check of checksToCompare) {
    it(`${check.name}: SQL Server and PostgreSQL agree with each other and with Spec SS2.2/SS2.3`, () => {
      const sqlServerValues = extractCheckValues(sqlServerMigration, check.name);
      const postgresValues = extractCheckValues(postgresMigration, check.name);
      expect(sqlServerValues).toEqual(check.expected);
      expect(postgresValues).toEqual(check.expected);
      expect(sqlServerValues).toEqual(postgresValues);
    });
  }
});
