import { describe, expect, it } from 'vitest';
import { ActionParam, RunActionParams } from '@memberjunction/actions-base';
import { UserInfo } from '@memberjunction/core';
import { GetReciprocityScorecardAction, RecomputeReciprocityAction } from '../index.js';

const testUser = new UserInfo(undefined, {
  ID: '00000000-0000-0000-0000-000000000001',
  Name: 'Action Tester',
  UserRoles: [{ UserID: '00000000-0000-0000-0000-000000000001', RoleID: '00000000-0000-0000-0000-000000000002', Role: 'Coordinator' }],
});

function makeParams(pairs: Array<[string, string]>): RunActionParams {
  const p = new RunActionParams();
  p.ContextUser = testUser;
  p.Params = pairs.map(([Name, Value]) => {
    const param = new ActionParam();
    param.Name = Name;
    param.Value = Value;
    param.Type = 'Input';
    return param;
  });
  return p;
}

describe('Reciprocity Scorecard MJ Actions', () => {
  it('RecomputeReciprocityAction fails closed when no metadata provider is configured', async () => {
    const action = new RecomputeReciprocityAction();
    const res = await action.Run(makeParams([]));
    expect(res.Success).toBe(false);
  });

  it('GetReciprocityScorecardAction requires ProfessionalProfileID', async () => {
    const action = new GetReciprocityScorecardAction();
    const res = await action.Run(makeParams([]));
    expect(res.Success).toBe(false);
    expect(res.ResultCode).toBe('INVALID_PARAMETERS');
  });

  it('GetReciprocityScorecardAction rejects a malformed ProfessionalProfileID before touching a provider', async () => {
    const action = new GetReciprocityScorecardAction();
    const res = await action.Run(makeParams([['ProfessionalProfileID', 'not-a-uuid']]));
    expect(res.Success).toBe(false);
    expect(res.ResultCode).toBe('INVALID_PARAMETERS');
  });

  it('GetReciprocityScorecardAction fails closed when no metadata provider is configured', async () => {
    const action = new GetReciprocityScorecardAction();
    const res = await action.Run(makeParams([['ProfessionalProfileID', '10000000-0000-4000-8000-000000000001']]));
    expect(res.Success).toBe(false);
  });
});
