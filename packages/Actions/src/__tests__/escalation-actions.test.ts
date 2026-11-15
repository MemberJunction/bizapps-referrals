import { describe, expect, it } from 'vitest';
import { ActionParam, RunActionParams } from '@memberjunction/actions-base';
import { UserInfo } from '@memberjunction/core';
import {
  AcknowledgeEscalationAction,
  EvaluateEscalationsAction,
  ReopenExhaustedReferralAction,
  ResolveEscalationAction,
} from '../index.js';

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

describe('Escalation & Reopen MJ Actions', () => {
  it('EvaluateEscalationsAction fails closed when no metadata provider is configured', async () => {
    const action = new EvaluateEscalationsAction();
    const res = await action.Run(makeParams([]));
    expect(res.Success).toBe(false);
  });

  it('AcknowledgeEscalationAction requires ReferralEscalationID', async () => {
    const action = new AcknowledgeEscalationAction();
    const res = await action.Run(makeParams([]));
    expect(res.Success).toBe(false);
    expect(res.ResultCode).toBe('INVALID_PARAMETERS');
  });

  it('AcknowledgeEscalationAction rejects a malformed ReferralEscalationID before touching a provider', async () => {
    const action = new AcknowledgeEscalationAction();
    const res = await action.Run(makeParams([['ReferralEscalationID', 'not-a-uuid']]));
    expect(res.Success).toBe(false);
    expect(res.ResultCode).toBe('INVALID_PARAMETERS');
  });

  it('ResolveEscalationAction requires ReferralEscalationID', async () => {
    const action = new ResolveEscalationAction();
    const res = await action.Run(makeParams([]));
    expect(res.Success).toBe(false);
    expect(res.ResultCode).toBe('INVALID_PARAMETERS');
  });

  it('ResolveEscalationAction fails closed when no metadata provider is configured', async () => {
    const action = new ResolveEscalationAction();
    const res = await action.Run(makeParams([['ReferralEscalationID', '10000000-0000-4000-8000-000000000001']]));
    expect(res.Success).toBe(false);
  });

  it('ReopenExhaustedReferralAction requires ReferralRequestID', async () => {
    const action = new ReopenExhaustedReferralAction();
    const res = await action.Run(makeParams([]));
    expect(res.Success).toBe(false);
    expect(res.ResultCode).toBe('INVALID_PARAMETERS');
  });

  it('ReopenExhaustedReferralAction rejects a malformed ReferralRequestID before touching a provider', async () => {
    const action = new ReopenExhaustedReferralAction();
    const res = await action.Run(makeParams([['ReferralRequestID', 'not-a-uuid']]));
    expect(res.Success).toBe(false);
    expect(res.ResultCode).toBe('INVALID_PARAMETERS');
  });
});
