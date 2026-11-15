import { describe, expect, it, vi } from 'vitest';

vi.mock('../../dist/generated/generated.js', () => ({}));
vi.mock('../generated/generated.js', () => ({}));

import { UserInfo } from '@memberjunction/core';
import { LoadBizAppsReferralsServer, ReferralsSlaSweepScheduler, ShutdownBizAppsReferralsServer } from '../index.js';

const systemUser = new UserInfo(undefined, { ID: '11111111-1111-1111-1111-111111111111', Name: 'System' });

describe('ReferralsSlaSweepScheduler escalation & reciprocity wiring', () => {
  it('RunOnce reports an EscalationsRaised count alongside the existing SLA sweep fields', async () => {
    ReferralsSlaSweepScheduler.Stop();
    const record = await ReferralsSlaSweepScheduler.RunOnce(systemUser);
    expect(typeof record.EscalationsRaised).toBe('number');
    expect(record.EscalationsRaised).toBeGreaterThanOrEqual(0);
    expect(record.Timestamp).toBeDefined();
    expect(ReferralsSlaSweepScheduler.LastRun).toEqual(record);
  });

  it('RunReciprocityOnce executes a reciprocity recompute pass and records the result', async () => {
    const record = await ReferralsSlaSweepScheduler.RunReciprocityOnce(systemUser);
    expect(typeof record.Success).toBe('boolean');
    expect(record.Timestamp).toBeDefined();
    expect(ReferralsSlaSweepScheduler.LastReciprocityRun).toEqual(record);
  });

  it('RunOnce guards against overlapping concurrent runs', async () => {
    ReferralsSlaSweepScheduler.Stop();
    const [first, second] = await Promise.all([
      ReferralsSlaSweepScheduler.RunOnce(systemUser),
      ReferralsSlaSweepScheduler.RunOnce(systemUser),
    ]);
    const resultCodes = [first.ResultCode, second.ResultCode];
    expect(resultCodes).toContain('SKIPPED_CONCURRENT');
  });

  it('Start/Stop accept escalationNotifierKey and reciprocity scheduling options without throwing', () => {
    ReferralsSlaSweepScheduler.Stop();
    expect(() =>
      ReferralsSlaSweepScheduler.Start(systemUser, 60_000, {
        escalationNotifierKey: 'BizAppsTasks',
        disableAutoReciprocity: true,
      }),
    ).not.toThrow();
    expect(ReferralsSlaSweepScheduler.IsRunning).toBe(true);
    ReferralsSlaSweepScheduler.Stop();
    expect(ReferralsSlaSweepScheduler.IsRunning).toBe(false);
  });

  it('LoadBizAppsReferralsServer accepts an escalationNotifierKey option and starts the scheduler', () => {
    ReferralsSlaSweepScheduler.Stop();
    expect(() => LoadBizAppsReferralsServer({ escalationNotifierKey: 'None' })).not.toThrow();
    expect(ReferralsSlaSweepScheduler.IsRunning).toBe(true);
    ShutdownBizAppsReferralsServer();
    expect(ReferralsSlaSweepScheduler.IsRunning).toBe(false);
  });
});
