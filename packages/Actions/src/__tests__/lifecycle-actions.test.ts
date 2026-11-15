import { describe, expect, it } from 'vitest';
import { RunActionParams } from '@memberjunction/actions-base';
import { UserInfo } from '@memberjunction/core';
import {
  CompleteReferralAction,
  MarkReferralInProgressAction,
  SetAvailabilityWindowAction,
} from '../lifecycle-actions.js';

describe('@mj-biz-apps/referrals-actions (Wave 3 Slice 1 lifecycle actions)', () => {
  const mockUser = { ID: 'user-1', Name: 'Test User' } as UserInfo;

  it('MarkReferralInProgressAction returns INVALID_PARAMETERS when ReferralAssignmentID is missing', async () => {
    const action = new MarkReferralInProgressAction();
    const res = await action.Run({
      Action: {} as RunActionParams['Action'],
      ContextUser: mockUser,
      Params: [],
      Filters: [],
    });
    expect(res.Success).toBe(false);
    expect(res.ResultCode).toBe('INVALID_PARAMETERS');
  });

  it('CompleteReferralAction returns INVALID_PARAMETERS when ReferralAssignmentID is missing', async () => {
    const action = new CompleteReferralAction();
    const res = await action.Run({
      Action: {} as RunActionParams['Action'],
      ContextUser: mockUser,
      Params: [],
      Filters: [],
    });
    expect(res.Success).toBe(false);
    expect(res.ResultCode).toBe('INVALID_PARAMETERS');
  });

  it('SetAvailabilityWindowAction returns INVALID_PARAMETERS when ProfessionalProfileID or WindowType is missing', async () => {
    const action = new SetAvailabilityWindowAction();
    const res = await action.Run({
      Action: {} as RunActionParams['Action'],
      ContextUser: mockUser,
      Params: [{ Name: 'ProfessionalProfileID', Value: 'profile-1', Type: 'Input' }],
      Filters: [],
    });
    expect(res.Success).toBe(false);
    expect(res.ResultCode).toBe('INVALID_PARAMETERS');
  });
});
