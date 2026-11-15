import { IMetadataProvider, IRunViewProvider, Metadata, UserInfo } from '@memberjunction/core';
import {
  ProfessionalAvailabilityWindowEntity,
  ProfessionalCredentialEntity,
  ProfessionalProfileEntity,
  ReferralTierEntity,
} from '@mj-biz-apps/referrals-entities';
import { AssertValidUUID, AuthorizationError, IsAssociationAdmin, PersistenceError } from './validation.js';

export interface ReadinessScoreBreakdown {
  Credential: number;
  Capacity: number;
  Responsiveness: number;
  Reliability: number;
  Availability: number;
}

export interface ReadinessScoreResult {
  Score: number;
  Breakdown: ReadinessScoreBreakdown;
}

type AvailabilityWindowLike = Pick<
  ProfessionalAvailabilityWindowEntity,
  'WindowType' | 'StartDate' | 'EndDate' | 'IsAvailable' | 'IsActive' | 'CapacityOverride'
>;

type ProfileLike = Pick<
  ProfessionalProfileEntity,
  'AvailabilityStatus' | 'ActiveReferralCount' | 'MaxConcurrentReferrals' | 'AverageResponseHours' | 'AverageRating' | 'ReciprocityIndex'
>;

type CredentialLike = Pick<ProfessionalCredentialEntity, 'IsPrimary' | 'ExpiresAt' | 'VerificationStatus'>;

export interface ReliabilityCounts {
  SLABreachCount?: number;
  DeclineCount?: number;
}

function isWindowCoveringNow(w: AvailabilityWindowLike, nowMs: number): boolean {
  if (!w.StartDate || !w.EndDate) return false;
  const start = new Date(w.StartDate).getTime();
  const end = new Date(w.EndDate).getTime();
  return nowMs >= start && nowMs <= end;
}

/**
 * Resolves whether a professional is effectively available at a given instant,
 * layering explicit ProfessionalAvailabilityWindow records on top of the coarse
 * ProfessionalProfile.AvailabilityStatus. An active `OnLeave` or `Paused` window
 * covering the instant always wins (even if AvailabilityStatus is `Available`).
 * `ReducedCapacity` windows do not block availability - they only reduce effective
 * capacity (see {@link GetEffectiveCapacityOverride}). Absent any windows, falls
 * back to `AvailabilityStatus`.
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
    const activeBlockingWindow = windows.find(
      (w) =>
        w.IsActive !== false &&
        (w.WindowType === 'OnLeave' || w.WindowType === 'Paused') &&
        isWindowCoveringNow(w, nowMs),
    );
    return !activeBlockingWindow;
  }

  /**
   * Returns the effective `MaxConcurrentReferrals` override from an active `ReducedCapacity`
   * window covering `asOfDate`, or `null` when no such window applies (use the profile's own
   * `MaxConcurrentReferrals` in that case).
   */
  public static GetEffectiveCapacityOverride(
    windows: ReadonlyArray<AvailabilityWindowLike>,
    asOfDate: Date = new Date(),
  ): number | null {
    const nowMs = asOfDate.getTime();
    const activeOverride = windows.find(
      (w) => w.IsActive !== false && w.WindowType === 'ReducedCapacity' && w.CapacityOverride != null && isWindowCoveringNow(w, nowMs),
    );
    return activeOverride?.CapacityOverride ?? null;
  }

  /**
   * Computes a 0-100 readiness score from 5 named factors per Spec SS2.2:
   * - `Credential` (0..25): 0 for an expired/revoked/rejected primary credential, a linear
   *   ramp when the primary credential expires within 30 days, 25 when clear of any primary
   *   credential (or no credentials supplied).
   * - `Capacity` (0..25): headroom ratio against the effective capacity (profile
   *   `MaxConcurrentReferrals`, overridden by an active `ReducedCapacity` window).
   * - `Responsiveness` (0..20): from `AverageResponseHours` relative to the tier SLA.
   * - `Reliability` (0..15): starts at 15, penalized by SLA breaches and declines.
   * - `Availability` (0..15): 0 when an active `OnLeave`/`Paused` window covers `asOfDate`,
   *   partial (7.5) when only an active `ReducedCapacity` window applies, 15 when clear.
   */
  public static ComputeReadinessScore(
    profile: ProfileLike,
    windows: ReadonlyArray<AvailabilityWindowLike>,
    credentials: ReadonlyArray<CredentialLike> = [],
    reliability: ReliabilityCounts = {},
    asOfDate: Date = new Date(),
  ): ReadinessScoreResult {
    // --- Credential (0..25) ---
    const primaryCredential = credentials.find((c) => c.IsPrimary);
    let credentialFactor = 25;
    if (primaryCredential) {
      if (
        primaryCredential.VerificationStatus === 'Expired' ||
        primaryCredential.VerificationStatus === 'Revoked' ||
        primaryCredential.VerificationStatus === 'Rejected'
      ) {
        credentialFactor = 0;
      } else if (primaryCredential.ExpiresAt) {
        const daysUntilExpiry = (new Date(primaryCredential.ExpiresAt).getTime() - asOfDate.getTime()) / (24 * 60 * 60 * 1000);
        if (daysUntilExpiry <= 0) {
          credentialFactor = 0;
        } else if (daysUntilExpiry <= 30) {
          credentialFactor = Math.round((daysUntilExpiry / 30) * 25 * 100) / 100;
        }
      }
    }

    // --- Capacity (0..25) ---
    const effectiveMax = CapacityReadinessService.GetEffectiveCapacityOverride(windows, asOfDate) ?? profile.MaxConcurrentReferrals;
    const maxConcurrent = effectiveMax > 0 ? effectiveMax : 1;
    const headroomRatio = Math.max(0, Math.min(1, (maxConcurrent - profile.ActiveReferralCount) / maxConcurrent));
    const capacityFactor = Math.round(headroomRatio * 25 * 100) / 100;

    // --- Responsiveness (0..20) ---
    let responsivenessFactor = 14;
    if (profile.AverageResponseHours != null) {
      if (profile.AverageResponseHours <= 2) responsivenessFactor = 20;
      else if (profile.AverageResponseHours <= 6) responsivenessFactor = 17;
      else if (profile.AverageResponseHours <= 24) responsivenessFactor = 14;
      else responsivenessFactor = Math.max(0, 14 - (profile.AverageResponseHours - 24) / 24);
    }
    responsivenessFactor = Math.round(responsivenessFactor * 100) / 100;

    // --- Reliability (0..15) ---
    const breaches = reliability.SLABreachCount ?? 0;
    const declines = reliability.DeclineCount ?? 0;
    const reliabilityFactor = Math.round(Math.max(0, 15 - breaches * 3 - declines * 1.5) * 100) / 100;

    // --- Availability (0..15) ---
    const nowMs = asOfDate.getTime();
    const activeBlockingWindow = windows.find(
      (w) => w.IsActive !== false && (w.WindowType === 'OnLeave' || w.WindowType === 'Paused') && isWindowCoveringNow(w, nowMs),
    );
    const activeReducedCapacityWindow = windows.find(
      (w) => w.IsActive !== false && w.WindowType === 'ReducedCapacity' && isWindowCoveringNow(w, nowMs),
    );
    let availabilityFactor = 15;
    if (profile.AvailabilityStatus === 'Unavailable' || profile.AvailabilityStatus === 'OnLeave' || activeBlockingWindow) {
      availabilityFactor = 0;
    } else if (activeReducedCapacityWindow) {
      availabilityFactor = 7.5;
    }

    const breakdown: ReadinessScoreBreakdown = {
      Credential: credentialFactor,
      Capacity: capacityFactor,
      Responsiveness: responsivenessFactor,
      Reliability: reliabilityFactor,
      Availability: availabilityFactor,
    };
    const score = Math.min(
      100,
      Math.round((breakdown.Credential + breakdown.Capacity + breakdown.Responsiveness + breakdown.Reliability + breakdown.Availability) * 100) / 100,
    );

    return { Score: score, Breakdown: breakdown };
  }

  /**
   * Computes an SLA deadline from an offer timestamp, the tier's base `SLAResponseHours`,
   * and the referral's urgency level:
   * - `Urgent`: `tierHours * UrgentSLAMultiplier` (maximally compressed).
   * - `High`: `tierHours * ((1 + UrgentSLAMultiplier) / 2)` (half-compressed).
   * - `Standard` / `Low`: the full `tierHours` window.
   * The effective window is always clamped to at least 1 hour.
   */
  public static ComputeSLADeadline(
    offeredAt: Date,
    tier: Pick<ReferralTierEntity, 'SLAResponseHours' | 'UrgentSLAMultiplier'>,
    urgency: 'Low' | 'Standard' | 'High' | 'Urgent' = 'Standard',
  ): Date {
    const baseHours = tier.SLAResponseHours > 0 ? tier.SLAResponseHours : 24;
    const multiplier = tier.UrgentSLAMultiplier > 0 ? tier.UrgentSLAMultiplier : 1;

    let effectiveHours: number;
    if (urgency === 'Urgent') {
      effectiveHours = baseHours * multiplier;
    } else if (urgency === 'High') {
      effectiveHours = baseHours * ((1 + multiplier) / 2);
    } else {
      effectiveHours = baseHours;
    }
    effectiveHours = Math.max(1, effectiveHours);

    return new Date(offeredAt.getTime() + effectiveHours * 60 * 60 * 1000);
  }

  /**
   * Creates (or updates, when `ProfessionalAvailabilityWindowID` is provided) a
   * ProfessionalAvailabilityWindow for a professional. Only the owning professional
   * (matched by `ProfessionalProfile.UserID === contextUser.ID`) or a coordinator/admin
   * may create or update a window; on update, the existing window's owner is re-verified
   * and `ProfessionalProfileID` reparenting by a non-admin is rejected. No writes occur
   * on an authorization failure.
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
      CapacityOverride?: number | null;
      Reason?: string | null;
      IsAvailable?: boolean;
      IsActive?: boolean;
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
    const isAdmin = IsAssociationAdmin(contextUser);

    const requestedProfile = await dp.GetEntityObject<ProfessionalProfileEntity>(
      'MJ_BizApps_Referrals: Professional Profiles',
      contextUser,
    );
    if (!(await requestedProfile.Load(validProfileId))) {
      throw new PersistenceError(`ProfessionalProfile '${validProfileId}' not found.`);
    }
    if (!isAdmin && !(requestedProfile.UserID && requestedProfile.UserID === contextUser.ID)) {
      throw new AuthorizationError(
        `User '${contextUser.ID}' is not authorized to set an availability window for ProfessionalProfile '${validProfileId}' (owner or Association Admin required).`,
      );
    }

    const window = await dp.GetEntityObject<ProfessionalAvailabilityWindowEntity>(
      'MJ_BizApps_Referrals: Professional Availability Windows',
      contextUser,
    );
    if (input.ProfessionalAvailabilityWindowID) {
      const validWindowId = AssertValidUUID(input.ProfessionalAvailabilityWindowID, 'ProfessionalAvailabilityWindowID');
      if (!(await window.Load(validWindowId))) {
        throw new PersistenceError(`ProfessionalAvailabilityWindow '${validWindowId}' not found.`);
      }
      if (!isAdmin && window.ProfessionalProfileID !== validProfileId) {
        throw new AuthorizationError(
          `User '${contextUser.ID}' is not authorized to reassign ProfessionalAvailabilityWindow '${validWindowId}' to a different ProfessionalProfileID.`,
        );
      }
    }

    window.ProfessionalProfileID = validProfileId;
    window.WindowType = input.WindowType;
    window.DayOfWeek = input.DayOfWeek ?? null;
    window.StartTimeMinutes = input.StartTimeMinutes ?? null;
    window.EndTimeMinutes = input.EndTimeMinutes ?? null;
    window.StartDate = input.StartDate ?? null;
    window.EndDate = input.EndDate ?? null;
    window.StartsAt = input.StartDate ?? null;
    window.EndsAt = input.EndDate ?? null;
    window.CapacityOverride = input.CapacityOverride ?? null;
    window.Reason = input.Reason ?? null;
    window.IsAvailable = input.IsAvailable ?? true;
    window.IsActive = input.IsActive ?? true;
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
