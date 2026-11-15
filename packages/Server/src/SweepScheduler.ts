import { UserInfo } from '@memberjunction/core';
import {
  EvaluateEscalationsAction,
  RecomputeReciprocityAction,
  SweepExpiredReferralSLAsAction,
} from '@mj-biz-apps/referrals-actions';

export interface SlaSweepRunRecord {
  Timestamp: string;
  Success: boolean;
  ResultCode: string;
  Message: string;
  EscalationsRaised: number;
}

export interface ReciprocityRunRecord {
  Timestamp: string;
  Success: boolean;
  ResultCode: string;
  Message: string;
}

/**
 * Recurring background scheduler that invokes `SweepExpiredReferralSLAsAction`
 * followed by `EvaluateEscalationsAction` on a configurable interval (default
 * 5 minutes) to expire overdue `Offered` referral assignments, cascade to the
 * next queued candidate, and raise SLA-warning/urgent-unassigned escalations.
 * Optionally also runs a daily `RecomputeReciprocityAction` pass.
 */
export class ReferralsSlaSweepScheduler {
  private static _timer: ReturnType<typeof setInterval> | null = null;
  private static _reciprocityTimer: ReturnType<typeof setInterval> | null = null;
  private static _running = false;
  private static _reciprocityRunning = false;
  private static _lastRun: SlaSweepRunRecord | null = null;
  private static _lastReciprocityRun: ReciprocityRunRecord | null = null;
  private static readonly DEFAULT_INTERVAL_MS = 5 * 60 * 1000;
  private static readonly DEFAULT_RECIPROCITY_INTERVAL_MS = 24 * 60 * 60 * 1000;
  private static _escalationNotifierKey = 'None';

  public static get IsRunning(): boolean {
    return this._timer !== null;
  }

  public static get LastRun(): SlaSweepRunRecord | null {
    return this._lastRun;
  }

  public static get LastReciprocityRun(): ReciprocityRunRecord | null {
    return this._lastReciprocityRun;
  }

  /**
   * Starts the recurring SLA sweep + escalation evaluation timer, and (unless
   * `disableAutoReciprocity`) a separate daily reciprocity recompute timer.
   * Idempotent: calling Start while already running leaves the active timers intact.
   */
  public static Start(
    contextUser: UserInfo,
    intervalMs: number = this.DEFAULT_INTERVAL_MS,
    options?: { escalationNotifierKey?: string; disableAutoReciprocity?: boolean; reciprocityIntervalMs?: number },
  ): void {
    this._escalationNotifierKey = options?.escalationNotifierKey ?? 'None';

    if (!this._timer) {
      const safeInterval = Math.max(1000, intervalMs);
      this._timer = setInterval(() => {
        void this.RunOnce(contextUser);
      }, safeInterval);
      if (typeof this._timer.unref === 'function') {
        this._timer.unref();
      }
    }

    if (!options?.disableAutoReciprocity && !this._reciprocityTimer) {
      const safeReciprocityInterval = Math.max(60_000, options?.reciprocityIntervalMs ?? this.DEFAULT_RECIPROCITY_INTERVAL_MS);
      this._reciprocityTimer = setInterval(() => {
        void this.RunReciprocityOnce(contextUser);
      }, safeReciprocityInterval);
      if (typeof this._reciprocityTimer.unref === 'function') {
        this._reciprocityTimer.unref();
      }
    }
  }

  /**
   * Stops both the recurring SLA sweep and reciprocity recompute timers if active.
   */
  public static Stop(): void {
    if (this._timer) {
      clearInterval(this._timer);
      this._timer = null;
    }
    if (this._reciprocityTimer) {
      clearInterval(this._reciprocityTimer);
      this._reciprocityTimer = null;
    }
  }

  /**
   * Executes a single SLA sweep pass via `SweepExpiredReferralSLAsAction`, then a
   * single escalation evaluation pass via `EvaluateEscalationsAction`. Guards
   * against overlapping concurrent runs.
   */
  public static async RunOnce(contextUser: UserInfo, asOf?: Date): Promise<SlaSweepRunRecord> {
    if (this._running) {
      return {
        Timestamp: new Date().toISOString(),
        Success: true,
        ResultCode: 'SKIPPED_CONCURRENT',
        Message: 'Previous SLA sweep pass still in progress.',
        EscalationsRaised: 0,
      };
    }

    this._running = true;
    try {
      const sweepAction = new SweepExpiredReferralSLAsAction();
      const sweepParams: Parameters<SweepExpiredReferralSLAsAction['Run']>[0] = {
        Action: {} as Parameters<SweepExpiredReferralSLAsAction['Run']>[0]['Action'],
        ContextUser: contextUser,
        Filters: [],
        Params: asOf ? [{ Name: 'AsOfIso', Type: 'Input', Value: asOf.toISOString() }] : [],
      };
      const sweepResult = await sweepAction.Run(sweepParams);

      const escalationAction = new EvaluateEscalationsAction();
      const escalationParams: Parameters<EvaluateEscalationsAction['Run']>[0] = {
        Action: {} as Parameters<EvaluateEscalationsAction['Run']>[0]['Action'],
        ContextUser: contextUser,
        Filters: [],
        Params: [
          ...(asOf ? [{ Name: 'AsOfIso', Type: 'Input' as const, Value: asOf.toISOString() }] : []),
          { Name: 'NotifierKey', Type: 'Input' as const, Value: this._escalationNotifierKey },
        ],
      };
      const escalationResult = await escalationAction.Run(escalationParams);
      let escalationsRaised = 0;
      if (escalationResult.Success && escalationResult.Message) {
        try {
          const parsed = JSON.parse(escalationResult.Message) as { WarningsRaised?: number; UrgentRaised?: number };
          escalationsRaised = (parsed.WarningsRaised ?? 0) + (parsed.UrgentRaised ?? 0);
        } catch {
          escalationsRaised = 0;
        }
      }

      const record: SlaSweepRunRecord = {
        Timestamp: new Date().toISOString(),
        Success: sweepResult.Success && escalationResult.Success,
        ResultCode: sweepResult.ResultCode ?? (sweepResult.Success ? 'SUCCESS' : 'FAILED'),
        Message: sweepResult.Message ?? '',
        EscalationsRaised: escalationsRaised,
      };
      this._lastRun = record;
      return record;
    } catch (err) {
      const record: SlaSweepRunRecord = {
        Timestamp: new Date().toISOString(),
        Success: false,
        ResultCode: 'ERROR',
        Message: err instanceof Error ? err.message : String(err),
        EscalationsRaised: 0,
      };
      this._lastRun = record;
      return record;
    } finally {
      this._running = false;
    }
  }

  /**
   * Executes a single reciprocity recompute pass via `RecomputeReciprocityAction`.
   * Guards against overlapping concurrent runs.
   */
  public static async RunReciprocityOnce(contextUser: UserInfo): Promise<ReciprocityRunRecord> {
    if (this._reciprocityRunning) {
      return {
        Timestamp: new Date().toISOString(),
        Success: true,
        ResultCode: 'SKIPPED_CONCURRENT',
        Message: 'Previous reciprocity recompute pass still in progress.',
      };
    }

    this._reciprocityRunning = true;
    try {
      const action = new RecomputeReciprocityAction();
      const params: Parameters<RecomputeReciprocityAction['Run']>[0] = {
        Action: {} as Parameters<RecomputeReciprocityAction['Run']>[0]['Action'],
        ContextUser: contextUser,
        Filters: [],
        Params: [],
      };
      const result = await action.Run(params);
      const record: ReciprocityRunRecord = {
        Timestamp: new Date().toISOString(),
        Success: result.Success,
        ResultCode: result.ResultCode ?? (result.Success ? 'SUCCESS' : 'FAILED'),
        Message: result.Message ?? '',
      };
      this._lastReciprocityRun = record;
      return record;
    } catch (err) {
      const record: ReciprocityRunRecord = {
        Timestamp: new Date().toISOString(),
        Success: false,
        ResultCode: 'ERROR',
        Message: err instanceof Error ? err.message : String(err),
      };
      this._lastReciprocityRun = record;
      return record;
    } finally {
      this._reciprocityRunning = false;
    }
  }
}
