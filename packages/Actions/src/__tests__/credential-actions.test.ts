import { describe, expect, it } from 'vitest';
import { RunActionParams } from '@memberjunction/actions-base';
import { UserInfo } from '@memberjunction/core';
import {
  ListCredentialProvidersAction,
  SyncProfileCredentialsAction,
  VerifyCredentialAction,
} from '../index.js';

const testUser = new UserInfo({ ID: '00000000-0000-0000-0000-000000000001', Name: 'Action Tester' });

function makeParams(pairs: Array<[string, string]>): RunActionParams {
  return {
    ContextUser: testUser,
    Params: pairs.map(([Name, Value]) => ({ Name, Value, Type: 'Input' })),
  } as unknown as RunActionParams;
}

describe('Credential Verification MJ Actions', () => {
  it('VerifyCredentialAction validates required parameters', async () => {
    const action = new VerifyCredentialAction();
    const res = await action.Run(makeParams([['ProfessionalProfileID', 'D2000001-0000-0000-0000-000000000101']]));
    expect(res.Success).toBe(false);
    expect(res.ResultCode).toBe('INVALID_PARAMETERS');
  });

  it('SyncProfileCredentialsAction validates ProfessionalProfileID', async () => {
    const action = new SyncProfileCredentialsAction();
    const res = await action.Run(makeParams([]));
    expect(res.Success).toBe(false);
    expect(res.ResultCode).toBe('INVALID_PARAMETERS');
  });

  it('ListCredentialProvidersAction returns registered providers JSON', async () => {
    const action = new ListCredentialProvidersAction();
    const res = await action.Run(makeParams([]));
    expect(res.Success).toBe(true);
    expect(res.ResultCode).toBe('SUCCESS');
    const parsed = JSON.parse(res.Message) as Array<{ ProviderKey: string }>;
    expect(parsed.map((p) => p.ProviderKey)).toEqual(
      expect.arrayContaining(['Manual', 'ExternalAction', 'BizAppsCredentialingBridge']),
    );
  });
});
