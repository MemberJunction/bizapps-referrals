import { UserInfo } from '@memberjunction/core';
import { SweepExpiredReferralSLAsAction } from '@mj-biz-apps/referrals-actions';

export interface SlaSweepRunRecord {
  Timestamp: string;
  Success: boolean;
  ResultCode: string;
  Message: string;
}

/**
 * Recurring background scheduler that invokes `SweepExpiredReferralSLAsAction`
 * on a configurable interval (default 5 minutes) to expire overdue `Offered`
 * referral assignments and cascade to the next queued candidate.
 */
export class ReferralsSlaSweepScheduler {
  private static _timer: ReturnType<typeof setInterval> | null = null;
  private static _running = false;
  private static _lastRun: SlaSweepRunRecord | null = null;
  private static readonly DEFAULT_INTERVAL_MS = 5 * 60 * 1000;

  public static get IsRunning(): boolean {
    return this._timer !== null;
  }

  public static get LastRun(): SlaSweepRunRecord | null {
    return this._lastRun;
  }

  /**
   * Starts the recurring SLA sweep timer. Idempotent: calling Start while already
   * running leaves the active timer intact.
   */
  public static Start(contextUser: UserInfo, intervalMs: number = this.DEFAULT_INTERVAL_MS): void {
    if (this._timer) {
      return;
    }
    const safeInterval = Math.max(1000, intervalMs);
    this._timer = setInterval(() => {
      void this.RunOnce(contextUser);
    }, safeInterval);

    if (typeof this._timer.unref === 'function') {
      this._timer.unref();
    }
  }

  /**
   * Stops the recurring SLA sweep timer if active.
   */
  public static Stop(): void {
    if (this._timer) {
      clearInterval(this._timer);
      this._timer = null;
    }
  }

  /**
   * Executes a single SLA sweep pass via `SweepExpiredReferralSLAsAction`.
   * Guards against overlapping concurrent runs.
   */
  public static async RunOnce(contextUser: UserInfo, asOf?: Date): Promise<SlaSweepRunRecord> {
    if (this._running) {
      return {
        Timestamp: new Date().toISOString(),
        Success: true,
        ResultCode: 'SKIPPED_CONCURRENT',
        Message: 'Previous SLA sweep pass still in progress.',
      };
    }

    this._running = true;
    try {
      const action = new SweepExpiredReferralSLAsAction();
      const params: Parameters<SweepExpiredReferralSLAsAction['Run']>[0] = {
        Action: null as never,
        ContextUser: contextUser,
        Filters: [],
        Params: asOf
          ? [{ Name: 'AsOfIso', Type: 'Input', Value: asOf.toISOString() }]
          : [],
      };
      const result = await action.Run(params);
      const record: SlaSweepRunRecord = {
        Timestamp: new Date().toISOString(),
        Success: result.Success,
        ResultCode: result.ResultCode ?? (result.Success ? 'SUCCESS' : 'FAILED'),
        Message: result.Message ?? '',
      };
      this._lastRun = record;
      return record;
    } finally {
      this._running = false;
    }
  }
}
