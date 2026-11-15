import { IMetadataProvider, IRunViewProvider, Metadata, UserInfo } from '@memberjunction/core';
import {
  ProfessionalAvailabilityWindowEntity,
  ProfessionalCredentialEntity,
  ProfessionalProfileEntity,
  ReferralRequestEntity,
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
  'WindowType' | 'StartsAt' | 'EndsAt' | 'IsActive' | 'CapacityOverride'
>;

type ProfileLike = Pick<
  ProfessionalProfileEntity,
  'AvailabilityStatus' | 'ActiveReferralCount' | 'MaxConcurrentReferrals' | 'AverageResponseHours' | 'AverageRating' | 'ReciprocityIndex'
>;

type CredentialLike = Pick<ProfessionalCredentialEntity, 'IsPrimary' | 'ExpiresAt' | 'VerificationStatus'>;

type RecentAssignmentLike = Pick<import('@mj-biz-apps/referrals-entities').ReferralAssignmentEntity, 'Status' | 'OfferedAt'>;

export interface ReliabilityCounts {
  SLABreachCount?: number;
  DeclineCount?: number;
}

export interface EffectiveAvailabilityResult {
  IsBlocked: boolean;
  BlockReason: string | null;
  EffectiveMaxConcurrent: number;
}

function isWindowCoveringNow(w: AvailabilityWindowLike, nowMs: number): boolean {
  if (!w.StartsAt || !w.EndsAt) return false;
  const start = new Date(w.StartsAt).getTime();
  const end = new Date(w.EndsAt).getTime();
  return nowMs >= start && nowMs <= end;
}

/**
 * Resolves whether a professional is effectively available at a given instant,
 * layering explicit ProfessionalAvailabilityWindow records on top of the coarse
 * ProfessionalProfile.AvailabilityStatus. An active `OnLeave` or `Paused` window
 * covering the instant always wins (even if AvailabilityStatus is `Available`).
 * `ReducedCapacity` windows do not block availability - they only reduce the
 * returned `EffectiveMaxConcurrent`. Absent any windows, falls back to `AvailabilityStatus`.
 */
export class CapacityReadinessService {
  public static ResolveEffectiveAvailability(
    profile: ProfileLike,
    windows: ReadonlyArray<AvailabilityWindowLike>,
    asOfDate: Date = new Date(),
  ): EffectiveAvailabilityResult {
    const maxConcurrent = profile.MaxConcurrentReferrals > 0 ? profile.MaxConcurrentReferrals : 1;

    if (profile.AvailabilityStatus === 'Unavailable' || profile.AvailabilityStatus === 'OnLeave') {
      return {
        IsBlocked: true,
        BlockReason: `No open availability window: AvailabilityStatus is '${profile.AvailabilityStatus}'.`,
        EffectiveMaxConcurrent: 0,
      };
    }

    const nowMs = asOfDate.getTime();
    const activeBlockingWindow = windows.find(
      (w) =>
        w.IsActive !== false &&
        (w.WindowType === 'OnLeave' || w.WindowType === 'Paused') &&
        isWindowCoveringNow(w, nowMs),
    );
    if (activeBlockingWindow) {
      return {
        IsBlocked: true,
        BlockReason: `An active '${activeBlockingWindow.WindowType}' availability window covers this date.`,
        EffectiveMaxConcurrent: 0,
      };
    }

    const activeOverrideWindow = windows.find(
      (w) =>
        w.IsActive !== false &&
        w.WindowType === 'ReducedCapacity' &&
        w.CapacityOverride != null &&
        isWindowCoveringNow(w, nowMs),
    );

    return {
      IsBlocked: false,
      BlockReason: null,
      EffectiveMaxConcurrent: activeOverrideWindow?.CapacityOverride ?? maxConcurrent,
    };
  }

  /**
   * Computes a 0-100 readiness score from 5 named factors per Spec SS3.2:
   * - `Credential` (25/15/0): 25 when the primary credential is clear, 15 when it expires
   *   within 30 days, 0 when expired/revoked/rejected (or past its `ExpiresAt`).
   * - `Capacity` (0..25): `round(25 * headroomRatio)` against `EffectiveMaxConcurrent`
   *   (from {@link ResolveEffectiveAvailability}).
   * - `Responsiveness` (0..20): from `AverageResponseHours`.
   * - `Reliability` (0..20): `max(0, 20 - 5 * slaBreachesLast90Days)`, counted from
   *   `recentAssignments` with `Status === 'Expired'` and `OfferedAt` within the trailing 90 days.
   * - `Availability` (10/5/0): 10 when clear, 5 when only an active `ReducedCapacity` window
   *   applies, 0 when blocked (per {@link ResolveEffectiveAvailability}).
   */
  public static ComputeReadinessScore(params: {
    profile: ProfileLike;
    credentials?: ReadonlyArray<CredentialLike>;
    windows?: ReadonlyArray<AvailabilityWindowLike>;
    recentAssignments?: ReadonlyArray<RecentAssignmentLike>;
    asOf?: Date;
  }): ReadinessScoreResult {
    const { profile, credentials = [], windows = [], recentAssignments = [], asOf = new Date() } = params;

    // --- Credential (25/15/0) ---
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
        const daysUntilExpiry = (new Date(primaryCredential.ExpiresAt).getTime() - asOf.getTime()) / (24 * 60 * 60 * 1000);
        if (daysUntilExpiry <= 0) {
          credentialFactor = 0;
        } else if (daysUntilExpiry <= 30) {
          credentialFactor = 15;
        }
      }
    }

    // --- Availability & Capacity (shared with ResolveEffectiveAvailability) ---
    const effectiveAvailability = CapacityReadinessService.ResolveEffectiveAvailability(profile, windows, asOf);
    const nowMs = asOf.getTime();
    const activeReducedCapacityWindow = windows.find(
      (w) => w.IsActive !== false && w.WindowType === 'ReducedCapacity' && isWindowCoveringNow(w, nowMs),
    );

    // --- Capacity (0..25) ---
    const maxConcurrent = effectiveAvailability.EffectiveMaxConcurrent > 0 ? effectiveAvailability.EffectiveMaxConcurrent : 1;
    const headroomRatio = Math.max(0, Math.min(1, (maxConcurrent - profile.ActiveReferralCount) / maxConcurrent));
    const capacityFactor = Math.round(25 * headroomRatio);

    // --- Responsiveness (0..20) ---
    let responsivenessFactor = 14;
    if (profile.AverageResponseHours != null) {
      if (profile.AverageResponseHours <= 2) responsivenessFactor = 20;
      else if (profile.AverageResponseHours <= 6) responsivenessFactor = 17;
      else if (profile.AverageResponseHours <= 24) responsivenessFactor = 14;
      else responsivenessFactor = Math.max(0, 14 - (profile.AverageResponseHours - 24) / 24);
    }
    responsivenessFactor = Math.round(responsivenessFactor * 100) / 100;

    // --- Reliability (0..20) ---
    const ninetyDaysAgoMs = nowMs - 90 * 24 * 60 * 60 * 1000;
    const slaBreachesLast90Days = recentAssignments.filter(
      (a) => a.Status === 'Expired' && a.OfferedAt != null && new Date(a.OfferedAt).getTime() >= ninetyDaysAgoMs,
    ).length;
    const reliabilityFactor = Math.max(0, 20 - 5 * slaBreachesLast90Days);

    // --- Availability (10/5/0) ---
    let availabilityFactor = 10;
    if (effectiveAvailability.IsBlocked) {
      availabilityFactor = 0;
    } else if (activeReducedCapacityWindow) {
      availabilityFactor = 5;
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
    urgency: ReferralRequestEntity['UrgencyLevel'] = 'Standard',
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
      StartsAt: Date;
      EndsAt: Date;
      CapacityOverride?: number | null;
      Reason?: string | null;
      IsActive?: boolean;
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

    if (!(input.EndsAt.getTime() > input.StartsAt.getTime())) {
      throw new PersistenceError('ProfessionalAvailabilityWindow EndsAt must be strictly after StartsAt.');
    }
    if (input.WindowType === 'ReducedCapacity' && (input.CapacityOverride == null || input.CapacityOverride < 0)) {
      throw new PersistenceError("ProfessionalAvailabilityWindow of type 'ReducedCapacity' requires a non-negative CapacityOverride.");
    }

    window.ProfessionalProfileID = validProfileId;
    window.WindowType = input.WindowType;
    window.StartsAt = input.StartsAt;
    window.EndsAt = input.EndsAt;
    window.CapacityOverride = input.CapacityOverride ?? null;
    window.Reason = input.Reason ?? null;
    window.IsActive = input.IsActive ?? true;

    const saved = await window.Save();
    if (!saved) {
      const detail = window.LatestResult?.CompleteMessage ?? 'Save returned false';
      throw new PersistenceError(`Failed to save ProfessionalAvailabilityWindow: ${detail}`);
    }
    return window;
  }
}
