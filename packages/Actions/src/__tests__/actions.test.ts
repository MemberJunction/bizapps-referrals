import { describe, expect, it } from 'vitest';
import { RunActionParams } from '@memberjunction/actions-base';
import { UserInfo } from '@memberjunction/core';
import {
  MatchProfessionalsAction,
  RespondToReferralAction,
  RouteReferralAction,
} from '../index.js';

describe('@mj-biz-apps/referrals-actions', () => {
  const mockUser = { ID: 'user-1', Name: 'Test User' } as UserInfo;

  it('MatchProfessionalsAction returns INVALID_PARAMETERS when required IDs are missing', async () => {
    const action = new MatchProfessionalsAction();
    const res = await action.Run({
      Action: {} as RunActionParams['Action'],
      ContextUser: mockUser,
      Params: [],
      Filters: [],
    });
    expect(res.Success).toBe(false);
    expect(res.ResultCode).toBe('INVALID_PARAMETERS');
  });

  it('RouteReferralAction returns INVALID_PARAMETERS when ReferralRequestID is missing', async () => {
    const action = new RouteReferralAction();
    const res = await action.Run({
      Action: {} as RunActionParams['Action'],
      ContextUser: mockUser,
      Params: [],
      Filters: [],
    });
    expect(res.Success).toBe(false);
    expect(res.ResultCode).toBe('INVALID_PARAMETERS');
  });

  it('RespondToReferralAction validates Action enum', async () => {
    const action = new RespondToReferralAction();
    const res = await action.Run({
      Action: {} as RunActionParams['Action'],
      ContextUser: mockUser,
      Params: [
        { Name: 'ReferralAssignmentID', Value: 'assign-1', Type: 'Input' },
        { Name: 'Action', Value: 'InvalidAction', Type: 'Input' },
      ],
      Filters: [],
    });
    expect(res.Success).toBe(false);
    expect(res.ResultCode).toBe('INVALID_PARAMETERS');
  });
});
