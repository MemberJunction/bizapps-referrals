import { IMetadataProvider, IRunViewProvider, Metadata, UserInfo } from '@memberjunction/core';
import { ProfessionalAvailabilityWindowEntity, ProfessionalProfileEntity, ReferralTierEntity } from '@mj-biz-apps/referrals-entities';
import { AssertValidUUID, PersistenceError } from './validation.js';

export interface ReadinessScoreBreakdown {
  AvailabilityFactor: number;
  CapacityFactor: number;
  ResponsivenessFactor: number;
  RatingFactor: number;
  ReciprocityFactor: number;
  TotalScore: number;
}

type AvailabilityWindowLike = Pick<
  ProfessionalAvailabilityWindowEntity,
  'WindowType' | 'DayOfWeek' | 'StartTimeMinutes' | 'EndTimeMinutes' | 'StartDate' | 'EndDate' | 'IsAvailable'
>;

type ProfileLike = Pick<
  ProfessionalProfileEntity,
  'AvailabilityStatus' | 'ActiveReferralCount' | 'MaxConcurrentReferrals' | 'AverageResponseHours' | 'AverageRating' | 'ReciprocityIndex'
>;

function minutesSinceMidnight(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

/**
 * Resolves whether a professional is effectively available at a given instant,
 * layering explicit ProfessionalAvailabilityWindow records on top of the coarse
 * ProfessionalProfile.AvailabilityStatus. A `Blackout` window that covers the
 * instant always wins (even if AvailabilityStatus is `Available`). When
 * `Recurring` windows exist for the instant's day of week, at least one must
 * cover the instant's time-of-day. Absent any windows, falls back to
 * `AvailabilityStatus`.
 */
export class CapacityReadinessService {
  public static ResolveEffectiveAvailability(
    profile: ProfileLike,
    windows: ReadonlyArray<AvailabilityWindowLike>,
    asOfDate: Date = new Date(),
  ): boolean {
    if (profile.AvailabilityStatus === 'Unavailable' || profile.AvailabilityStatus === 'OnLeave') {
      return false;
    }

    const nowMs = asOfDate.getTime();
    const dayOfWeek = asOfDate.getUTCDay();
    const minutesNow = minutesSinceMidnight(asOfDate);

    const blackouts = windows.filter((w) => w.WindowType === 'Blackout');
    for (const b of blackouts) {
      if (b.StartDate && b.EndDate) {
        const start = new Date(b.StartDate).getTime();
        const end = new Date(b.EndDate).getTime();
        if (nowMs >= start && nowMs <= end) {
          return false;
        }
      }
    }

    const dateRangeWindows = windows.filter((w) => w.WindowType === 'DateRange');
    if (dateRangeWindows.length > 0) {
      const covering = dateRangeWindows.filter((w) => {
        if (!w.StartDate || !w.EndDate) return false;
        const start = new Date(w.StartDate).getTime();
        const end = new Date(w.EndDate).getTime();
        return nowMs >= start && nowMs <= end;
      });
      if (covering.length > 0 && !covering.some((w) => w.IsAvailable)) {
        return false;
      }
    }

    const recurringForDay = windows.filter((w) => w.WindowType === 'Recurring' && w.DayOfWeek === dayOfWeek);
    if (recurringForDay.length > 0) {
      const covered = recurringForDay.some(
        (w) =>
          w.IsAvailable &&
          w.StartTimeMinutes != null &&
          w.EndTimeMinutes != null &&
          minutesNow >= w.StartTimeMinutes &&
          minutesNow <= w.EndTimeMinutes,
      );
      if (!covered) {
        return false;
      }
    }

    return true;
  }

  /**
   * Computes a 0-100 readiness score from 5 weighted factors: Availability (30),
   * Capacity headroom (25), Responsiveness (20), Rating (15), and Reciprocity (10).
   */
  public static ComputeReadinessScore(
    profile: ProfileLike,
    windows: ReadonlyArray<AvailabilityWindowLike>,
    asOfDate: Date = new Date(),
  ): ReadinessScoreBreakdown {
    const isAvailable = CapacityReadinessService.ResolveEffectiveAvailability(profile, windows, asOfDate);
    const availabilityFactor = isAvailable ? 30 : 0;

    const maxConcurrent = profile.MaxConcurrentReferrals > 0 ? profile.MaxConcurrentReferrals : 1;
    const headroomRatio = Math.max(0, Math.min(1, (maxConcurrent - profile.ActiveReferralCount) / maxConcurrent));
    const capacityFactor = Math.round(headroomRatio * 25 * 100) / 100;

    let responsivenessFactor = 14;
    if (profile.AverageResponseHours != null) {
      if (profile.AverageResponseHours <= 2) responsivenessFactor = 20;
      else if (profile.AverageResponseHours <= 6) responsivenessFactor = 17;
      else if (profile.AverageResponseHours <= 24) responsivenessFactor = 14;
      else responsivenessFactor = Math.max(0, 14 - (profile.AverageResponseHours - 24) / 24);
    }
    responsivenessFactor = Math.round(responsivenessFactor * 100) / 100;

    const ratingFactor =
      profile.AverageRating != null ? Math.round(((profile.AverageRating / 5) * 15) * 100) / 100 : 10.5;

    const reciprocityFactor =
      profile.ReciprocityIndex != null
        ? Math.round(Math.max(0, Math.min(10, (profile.ReciprocityIndex / 100) * 10)) * 100) / 100
        : 5;

    const totalScore = Math.round(
      (availabilityFactor + capacityFactor + responsivenessFactor + ratingFactor + reciprocityFactor) * 100,
    ) / 100;

    return {
      AvailabilityFactor: availabilityFactor,
      CapacityFactor: capacityFactor,
      ResponsivenessFactor: responsivenessFactor,
      RatingFactor: ratingFactor,
      ReciprocityFactor: reciprocityFactor,
      TotalScore: Math.min(100, totalScore),
    };
  }

  /**
   * Computes an SLA deadline from an offer timestamp, the tier's base
   * SLAResponseHours, and (when the referral is `Urgent`) the tier's
   * UrgentSLAMultiplier, which compresses the response window.
   */
  public static ComputeSLADeadline(
    offeredAt: Date,
    tier: Pick<ReferralTierEntity, 'SLAResponseHours' | 'UrgentSLAMultiplier'>,
    isUrgent: boolean = false,
  ): Date {
    const baseHours = tier.SLAResponseHours > 0 ? tier.SLAResponseHours : 24;
    const multiplier = isUrgent && tier.UrgentSLAMultiplier > 0 ? tier.UrgentSLAMultiplier : 1;
    const effectiveHours = baseHours * multiplier;
    return new Date(offeredAt.getTime() + effectiveHours * 60 * 60 * 1000);
  }

  /**
   * Creates (or updates, when `ProfessionalAvailabilityWindowID` is provided) a
   * ProfessionalAvailabilityWindow for a professional.
   */
  public static async SetAvailabilityWindow(
    input: {
      ProfessionalAvailabilityWindowID?: string;
      ProfessionalProfileID: string;
      WindowType: ProfessionalAvailabilityWindowEntity['WindowType'];
      DayOfWeek?: number | null;
      StartTimeMinutes?: number | null;
      EndTimeMinutes?: number | null;
      StartDate?: Date | null;
      EndDate?: Date | null;
      IsAvailable?: boolean;
      TimeZone?: string;
      Notes?: string | null;
    },
    contextUser: UserInfo,
    provider?: IMetadataProvider & IRunViewProvider,
  ): Promise<ProfessionalAvailabilityWindowEntity> {
    const dp = provider ?? (Metadata.Provider as (IMetadataProvider & IRunViewProvider) | undefined);
    if (!dp) {
      throw new PersistenceError('A valid metadata provider is required to set an availability window.');
    }
    const validProfileId = AssertValidUUID(input.ProfessionalProfileID, 'ProfessionalProfileID');

    const window = await dp.GetEntityObject<ProfessionalAvailabilityWindowEntity>(
      'MJ_BizApps_Referrals: Professional Availability Windows',
      contextUser,
    );
    if (input.ProfessionalAvailabilityWindowID) {
      const validWindowId = AssertValidUUID(input.ProfessionalAvailabilityWindowID, 'ProfessionalAvailabilityWindowID');
      if (!(await window.Load(validWindowId))) {
        throw new PersistenceError(`ProfessionalAvailabilityWindow '${validWindowId}' not found.`);
      }
    }

    window.ProfessionalProfileID = validProfileId;
    window.WindowType = input.WindowType;
    window.DayOfWeek = input.DayOfWeek ?? null;
    window.StartTimeMinutes = input.StartTimeMinutes ?? null;
    window.EndTimeMinutes = input.EndTimeMinutes ?? null;
    window.StartDate = input.StartDate ?? null;
    window.EndDate = input.EndDate ?? null;
    window.IsAvailable = input.IsAvailable ?? true;
    if (input.TimeZone) {
      window.TimeZone = input.TimeZone;
    }
    window.Notes = input.Notes ?? null;

    const saved = await window.Save();
    if (!saved) {
      const detail = window.LatestResult?.CompleteMessage ?? 'Save returned false';
      throw new PersistenceError(`Failed to save ProfessionalAvailabilityWindow: ${detail}`);
    }
    return window;
  }
}
