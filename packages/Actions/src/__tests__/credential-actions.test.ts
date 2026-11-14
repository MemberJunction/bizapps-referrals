import { describe, expect, it } from 'vitest';
import { ActionParam, RunActionParams } from '@memberjunction/actions-base';
import { UserInfo } from '@memberjunction/core';
import {
  ListCredentialProvidersAction,
  SyncProfileCredentialsAction,
  VerifyCredentialAction,
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

describe('Credential Verification MJ Actions', () => {
  it('VerifyCredentialAction validates required parameters', async () => {
    const action = new VerifyCredentialAction();
    const res = await action.Run(makeParams([['ProfessionalProfileID', 'D2000001-0000-0000-0000-000000000101']]));
    expect(res.Success).toBe(false);
    expect(res.ResultCode).toBe('INVALID_PARAMETERS');
  });

  it('VerifyCredentialAction fails closed when no metadata provider is configured', async () => {
    const action = new VerifyCredentialAction();
    const res = await action.Run(
      makeParams([
        ['ProfessionalProfileID', 'D2000001-0000-0000-0000-000000000101'],
        ['CredentialCode', 'NY-BAR-441021'],
        ['ProviderKey', 'Manual'],
      ]),
    );
    expect(res.Success).toBe(false);
  });

  it('SyncProfileCredentialsAction validates ProfessionalProfileID and fails closed without provider', async () => {
    const action = new SyncProfileCredentialsAction();
    const resMissing = await action.Run(makeParams([]));
    expect(resMissing.Success).toBe(false);
    expect(resMissing.ResultCode).toBe('INVALID_PARAMETERS');

    const resNoProvider = await action.Run(
      makeParams([
        ['ProfessionalProfileID', 'D2000001-0000-0000-0000-000000000101'],
        ['ProviderKey', 'ExternalAction'],
      ]),
    );
    expect(resNoProvider.Success).toBe(false);
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
