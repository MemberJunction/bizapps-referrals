import { readFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ActionParam, RunActionParams } from '@memberjunction/actions-base';
import {
  IMetadataProvider,
  IRunViewProvider,
  Metadata,
  RunView,
  RunViewParams,
  RunViewResult,
  UserInfo,
} from '@memberjunction/core';
import { GetReciprocityScorecardAction } from '../index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '../../../..');

const UUID_V4_RE = /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;

interface SkillMetadataRecord {
  fields: {
    Name: string;
    Description: string;
    Instructions: string;
    Status: string;
    ActivationMode: string;
    CreatedByUserID: string;
  };
  relatedEntities?: {
    'MJ: AI Agent Skills'?: Array<{
      fields: { AgentID: string; SkillID: string; Status: string };
      primaryKey: { ID: string };
      sync?: Record<string, string>;
    }>;
    'MJ: AI Skill Actions'?: Array<{
      fields: { SkillID: string; ActionID: string; Role: string; ExposeToModel: boolean };
      primaryKey: { ID: string };
      sync?: Record<string, string>;
    }>;
  };
  primaryKey: { ID: string };
  sync?: Record<string, string>;
}

interface ActionMetadataRecord {
  fields: { Name: string; DriverClass: string; Status: string };
}

interface SimulatedRequestRow {
  ID: string;
  RequestNumber: string;
  ReferringProfessionalID: string | null;
  AssignedProfessionalID: string | null;
  OwnerUserID: string;
  SubmittedAt: Date;
}

interface SimulatedAssignmentRow {
  ID: string;
  ReferralRequestID: string;
  ProfessionalProfileID: string;
  OwnerUserID: string;
  Status: string;
  OfferedAt: Date;
  RespondedAt: Date | null;
  ResponseHours: number | null;
}

interface SimulatedOutcomeRow {
  ID: string;
  ReferralRequestID: string;
  ReferralAssignmentID: string;
  ProfessionalProfileID: string;
  OwnerUserID: string;
  OutcomeStatus: string;
  ReportedFeeAmount: number | null;
  ClosedAt: Date;
  ReportedAt: Date;
}

describe('Referrals Chief of Staff skill metadata & auto-install integrity', () => {
  const mjAppPath = resolve(repoRoot, 'mj-app.json');
  const rootSyncPath = resolve(repoRoot, 'metadata/.mj-sync.json');
  const skillDir = resolve(repoRoot, 'metadata/chief-of-staff-skills');
  const skillSyncPath = resolve(skillDir, '.mj-sync.json');
  const skillFilePath = resolve(skillDir, '.chief-of-staff-referrals-skill.json');
  const actionsMetadataPath = resolve(repoRoot, 'metadata/actions/.referrals-actions.json');

  it('wires metadata/chief-of-staff-skills into mj-app.json and root directoryOrder after actions', () => {
    const mjApp = JSON.parse(readFileSync(mjAppPath, 'utf8')) as {
      metadata?: { directory?: string };
    };
    expect(mjApp.metadata?.directory).toBe('metadata');

    const rootSync = JSON.parse(readFileSync(rootSyncPath, 'utf8')) as {
      directoryOrder?: string[];
    };
    const order = rootSync.directoryOrder ?? [];
    expect(order).toContain('actions');
    expect(order).toContain('chief-of-staff-skills');
    expect(order.indexOf('chief-of-staff-skills')).toBeGreaterThan(order.indexOf('actions'));

    const skillSync = JSON.parse(readFileSync(skillSyncPath, 'utf8')) as {
      entity: string;
      filePattern: string;
    };
    expect(skillSync.entity).toBe('MJ: AI Skills');
    expect(skillSync.filePattern).toBe('**/.*.json');
  });

  it('defines a valid Chief of Staff skill with UUIDv4 PKs, zero sync blocks, real entity docs, and active template grant', () => {
    const records = JSON.parse(readFileSync(skillFilePath, 'utf8')) as SkillMetadataRecord[];
    expect(records).toHaveLength(1);

    const skill = records[0];
    expect(skill.fields.Name).toBe('Referrals');
    expect(skill.fields.Status).toBe('Active');
    expect(skill.fields.ActivationMode).toBe('Auto');
    expect(skill.fields.CreatedByUserID).toBe('@lookup:MJ: Users.Name=System');
    expect(skill.primaryKey.ID).toMatch(UUID_V4_RE);
    expect(skill.sync).toBeUndefined();

    // Verify @file: instructions resolve and document real Referrals entities
    expect(skill.fields.Instructions.startsWith('@file:')).toBe(true);
    const instructionsPath = resolve(skillDir, skill.fields.Instructions.replace('@file:', ''));
    expect(existsSync(instructionsPath)).toBe(true);
    const instructions = readFileSync(instructionsPath, 'utf8');
    expect(instructions).toContain('MJ_BizApps_Referrals: Referral Requests');
    expect(instructions).toContain('MJ_BizApps_Referrals: Referral Assignments');
    expect(instructions).toContain('MJ_BizApps_Referrals: Professional Profiles');
    expect(instructions).toContain('MJ_BizApps_Referrals: Referral Escalations');
    expect(instructions).toContain('MJ_BizApps_Referrals: Reciprocity Snapshots');
    expect(instructions).toContain('RunView');

    // Verify active grant to Chief of Staff template (inherited by personal instances like Pepper)
    const grants = skill.relatedEntities?.['MJ: AI Agent Skills'] ?? [];
    expect(grants).toHaveLength(1);
    expect(grants[0].fields.AgentID).toBe('@lookup:MJ: AI Agents.Name=Chief of Staff');
    expect(grants[0].fields.SkillID).toBe('@parent:ID');
    expect(grants[0].fields.Status).toBe('Active');
    expect(grants[0].primaryKey.ID).toMatch(UUID_V4_RE);
    expect(grants[0].sync).toBeUndefined();

    // Verify personal instance inheritance semantics (Pepper -> BaseAgentID = Chief of Staff)
    const chiefOfStaffTemplateId = 'CHIEF-OF-STAFF-TEMPLATE';
    const grantedAgentIds = new Set(
      grants
        .filter((g) => g.fields.Status === 'Active' && g.fields.AgentID === '@lookup:MJ: AI Agents.Name=Chief of Staff')
        .map(() => chiefOfStaffTemplateId),
    );
    const personalInstance = { Name: 'Pepper', BaseAgentID: chiefOfStaffTemplateId };
    expect(grantedAgentIds.has(personalInstance.BaseAgentID)).toBe(true);
  });

  it('binds only declared Referrals actions and uses zero raw SQL across all action source files', () => {
    const records = JSON.parse(readFileSync(skillFilePath, 'utf8')) as SkillMetadataRecord[];
    const skillActions = records[0].relatedEntities?.['MJ: AI Skill Actions'] ?? [];
    expect(skillActions.length).toBeGreaterThan(0);

    const declaredActions = new Set(
      (JSON.parse(readFileSync(actionsMetadataPath, 'utf8')) as ActionMetadataRecord[]).map((a) => a.fields.Name),
    );

    const seenIds = new Set<string>([records[0].primaryKey.ID]);
    for (const binding of skillActions) {
      expect(binding.primaryKey.ID).toMatch(UUID_V4_RE);
      expect(seenIds.has(binding.primaryKey.ID)).toBe(false);
      seenIds.add(binding.primaryKey.ID);
      expect(binding.sync).toBeUndefined();
      expect(binding.fields.SkillID).toBe('@parent:ID');
      const actionName = binding.fields.ActionID.replace('@lookup:MJ: Actions.Name=', '');
      expect(declaredActions.has(actionName), `Bound skill action '${actionName}' not found in metadata/actions`).toBe(true);
    }

    const actionSourceFiles = [
      resolve(__dirname, '../index.ts'),
      resolve(__dirname, '../lifecycle-actions.ts'),
      resolve(__dirname, '../escalation-actions.ts'),
      resolve(__dirname, '../reciprocity-actions.ts'),
      resolve(__dirname, '../ai-actions.ts'),
    ];
    const rawSqlPattern = /\b(ExecuteSQL|knex|sql\.Request|SELECT\s+.+\s+FROM\s+)\b/i;
    for (const file of actionSourceFiles) {
      const content = readFileSync(file, 'utf8');
      expect(rawSqlPattern.test(content), `Raw SQL detected in ${file}`).toBe(false);
    }
  });
});

describe('Referrals Chief of Staff skill — two-user RLS isolation', () => {
  const originalProvider = Metadata.Provider;

  afterEach(() => {
    Metadata.Provider = originalProvider;
    vi.restoreAllMocks();
  });

  const userA = new UserInfo(undefined, {
    ID: '11111111-1111-4111-8111-111111111111',
    Name: 'Alice Counsel',
    Email: 'alice@firm-a.example',
    UserRoles: [{ UserID: '11111111-1111-4111-8111-111111111111', RoleID: 'R-PRO', Role: 'Professional' }],
  });

  const userB = new UserInfo(undefined, {
    ID: '22222222-2222-4222-8222-222222222222',
    Name: 'Bob Counsel',
    Email: 'bob@firm-b.example',
    UserRoles: [{ UserID: '22222222-2222-4222-8222-222222222222', RoleID: 'R-PRO', Role: 'Professional' }],
  });

  const profAId = 'AAAAAAAA-AAAA-4AAA-8AAA-AAAAAAAAAAAA';
  const profBId = 'BBBBBBBB-BBBB-4BBB-8BBB-BBBBBBBBBBBB';

  const now = new Date('2026-11-15T12:00:00.000Z');
  const periodStart = '2026-10-01T00:00:00.000Z';
  const periodEnd = '2026-12-31T23:59:59.999Z';

  const allRequests: SimulatedRequestRow[] = [
    {
      ID: 'REQ-A-1',
      RequestNumber: 'REF-1001',
      ReferringProfessionalID: profAId,
      AssignedProfessionalID: profAId,
      OwnerUserID: userA.ID,
      SubmittedAt: now,
    },
    {
      ID: 'REQ-B-1',
      RequestNumber: 'REF-2001',
      ReferringProfessionalID: profBId,
      AssignedProfessionalID: profBId,
      OwnerUserID: userB.ID,
      SubmittedAt: now,
    },
    {
      ID: 'REQ-B-2',
      RequestNumber: 'REF-2002',
      ReferringProfessionalID: profBId,
      AssignedProfessionalID: profBId,
      OwnerUserID: userB.ID,
      SubmittedAt: now,
    },
  ];

  const allAssignments: SimulatedAssignmentRow[] = [
    {
      ID: 'ASG-A-1',
      ReferralRequestID: 'REQ-A-1',
      ProfessionalProfileID: profAId,
      OwnerUserID: userA.ID,
      Status: 'Accepted',
      OfferedAt: now,
      RespondedAt: now,
      ResponseHours: 2.5,
    },
    {
      ID: 'ASG-B-1',
      ReferralRequestID: 'REQ-B-1',
      ProfessionalProfileID: profBId,
      OwnerUserID: userB.ID,
      Status: 'Accepted',
      OfferedAt: now,
      RespondedAt: now,
      ResponseHours: 6.0,
    },
    {
      ID: 'ASG-B-2',
      ReferralRequestID: 'REQ-B-2',
      ProfessionalProfileID: profBId,
      OwnerUserID: userB.ID,
      Status: 'Completed',
      OfferedAt: now,
      RespondedAt: now,
      ResponseHours: 4.0,
    },
  ];

  const allOutcomes: SimulatedOutcomeRow[] = [
    {
      ID: 'OUT-A-1',
      ReferralRequestID: 'REQ-A-1',
      ReferralAssignmentID: 'ASG-A-1',
      ProfessionalProfileID: profAId,
      OwnerUserID: userA.ID,
      OutcomeStatus: 'Resolved',
      ReportedFeeAmount: 15000,
      ClosedAt: now,
      ReportedAt: now,
    },
    {
      ID: 'OUT-B-1',
      ReferralRequestID: 'REQ-B-2',
      ReferralAssignmentID: 'ASG-B-2',
      ProfessionalProfileID: profBId,
      OwnerUserID: userB.ID,
      OutcomeStatus: 'Resolved',
      ReportedFeeAmount: 42000,
      ClosedAt: now,
      ReportedAt: now,
    },
  ];

  class RlsMockProvider implements IMetadataProvider, IRunViewProvider {
    public Entities: IMetadataProvider['Entities'] = [];

    public async GetEntityObject<T>(): Promise<T> {
      throw new Error('GetEntityObject should not be invoked during read-only reciprocity query');
    }

    public async RunView<T>(params: RunViewParams, contextUser?: UserInfo): Promise<RunViewResult<T>> {
      const callerId = contextUser?.ID;
      let rows: Array<SimulatedRequestRow | SimulatedAssignmentRow | SimulatedOutcomeRow> = [];
      if (params.EntityName === 'MJ_BizApps_Referrals: Referral Requests') {
        rows = allRequests.filter((r) => r.OwnerUserID === callerId);
      } else if (params.EntityName === 'MJ_BizApps_Referrals: Referral Assignments') {
        rows = allAssignments.filter((a) => a.OwnerUserID === callerId);
      } else if (params.EntityName === 'MJ_BizApps_Referrals: Referral Outcomes') {
        rows = allOutcomes.filter((o) => o.OwnerUserID === callerId);
      }
      return {
        Success: true,
        Results: rows as T[],
        RowCount: rows.length,
        TotalRowCount: rows.length,
        ExecutionTime: 1,
        ErrorMessage: '',
        UserViewRunID: '',
      };
    }

    public async RunViews<T>(paramsList: RunViewParams[], contextUser?: UserInfo): Promise<RunViewResult<T>[]> {
      return Promise.all(paramsList.map((p) => this.RunView<T>(p, contextUser)));
    }
  }

  function createRlsProvider(): IMetadataProvider & IRunViewProvider {
    return new RlsMockProvider();
  }

  function makeScorecardParams(contextUser: UserInfo, profileId: string): RunActionParams {
    const p = new RunActionParams();
    p.ContextUser = contextUser;
    const pairs: Array<[string, string]> = [
      ['ProfessionalProfileID', profileId],
      ['PeriodStartIso', periodStart],
      ['PeriodEndIso', periodEnd],
    ];
    p.Params = pairs.map(([Name, Value]) => {
      const param = new ActionParam();
      param.Name = Name;
      param.Value = Value;
      param.Type = 'Input';
      return param;
    });
    return p;
  }

  it('invoking the same bound skill action (Referrals.GetReciprocityScorecard) as User A vs User B yields strictly RLS-scoped results with zero cross-user leakage', async () => {
    const rlsProvider = createRlsProvider();
    Metadata.Provider = rlsProvider;

    const action = new GetReciprocityScorecardAction();

    // User A invokes the skill for their own profile -> sees User A's 1 referral and $15,000 fee
    const resA = await action.Run(makeScorecardParams(userA, profAId));
    expect(resA.Success).toBe(true);
    const scorecardA = JSON.parse(resA.Message ?? '{}') as {
      Sent: number;
      Received: number;
      AttributedFeeTotal: number;
    };
    expect(scorecardA.Sent).toBe(1);
    expect(scorecardA.Received).toBe(1);
    expect(scorecardA.AttributedFeeTotal).toBe(15000);

    // User B invokes the exact same skill for their own profile -> sees User B's 2 referrals and $42,000 fee
    const resB = await action.Run(makeScorecardParams(userB, profBId));
    expect(resB.Success).toBe(true);
    const scorecardB = JSON.parse(resB.Message ?? '{}') as {
      Sent: number;
      Received: number;
      AttributedFeeTotal: number;
    };
    expect(scorecardB.Sent).toBe(2);
    expect(scorecardB.Received).toBe(2);
    expect(scorecardB.AttributedFeeTotal).toBe(42000);

    // Cross-user probe: User A asks the same skill for User B's profile -> RLS yields zero rows, zero leakage
    const crossProbe = await action.Run(makeScorecardParams(userA, profBId));
    expect(crossProbe.Success).toBe(true);
    const leaked = JSON.parse(crossProbe.Message ?? '{}') as {
      Sent: number;
      Received: number;
      AttributedFeeTotal: number;
    };
    expect(leaked.Sent).toBe(0);
    expect(leaked.Received).toBe(0);
    expect(leaked.AttributedFeeTotal).toBe(0);
  });

  it('RunView queries executed through the skill return disjoint referral request sets for User A and User B', async () => {
    const rlsProvider = createRlsProvider();
    const rv = new RunView(rlsProvider);

    const viewA = await rv.RunView<SimulatedRequestRow>(
      { EntityName: 'MJ_BizApps_Referrals: Referral Requests', ResultType: 'simple' },
      userA,
    );
    const viewB = await rv.RunView<SimulatedRequestRow>(
      { EntityName: 'MJ_BizApps_Referrals: Referral Requests', ResultType: 'simple' },
      userB,
    );

    expect(viewA.Success).toBe(true);
    expect(viewB.Success).toBe(true);
    expect(viewA.Results.map((r) => r.RequestNumber)).toEqual(['REF-1001']);
    expect(viewB.Results.map((r) => r.RequestNumber)).toEqual(['REF-2001', 'REF-2002']);

    const idsA = new Set(viewA.Results.map((r) => r.ID));
    for (const rowB of viewB.Results) {
      expect(idsA.has(rowB.ID)).toBe(false);
    }
  });
});
