import { BaseEntity, EntitySaveOptions, IMetadataProvider, IRunViewProvider, RunView, ValidationResult } from '@memberjunction/core';
import { RegisterClass, ValidationErrorInfo, ValidationErrorType } from '@memberjunction/global';
import {
  AuthorizationError,
  IsCoordinatorOrAdmin,
  NormalizePartyName,
  PersistenceError,
  ResolvePersonIdForUser,
} from '@mj-biz-apps/referrals-core';
import {
  ConflictCheckPartyEntity,
  ProfessionalAvailabilityWindowEntity,
  ProfessionalCredentialEntity,
  ProfessionalProfileEntity,
  ReferralEscalationEntity,
  ReferralOutcomeEntity,
  ReferralRequestEntity,
} from '@mj-biz-apps/referrals-entities';

@RegisterClass(BaseEntity, 'MJ_BizApps_Referrals: Conflict Check Parties')
export class ConflictCheckPartyServerEntity extends ConflictCheckPartyEntity {
  public override async Save(options?: EntitySaveOptions): Promise<boolean> {
    if (this.PartyName && !this.NormalizedName) {
      this.NormalizedName = NormalizePartyName(this.PartyName);
    } else if (this.PartyName && this.Dirty) {
      this.NormalizedName = NormalizePartyName(this.PartyName);
    }
    return super.Save(options);
  }
}

@RegisterClass(BaseEntity, 'MJ_BizApps_Referrals: Professional Profiles')
export class ProfessionalProfileServerEntity extends ProfessionalProfileEntity {
  public override Validate(): ValidationResult {
    const result = super.Validate();
    if (
      this.HourlyRateMin != null &&
      this.HourlyRateMax != null &&
      this.HourlyRateMax < this.HourlyRateMin
    ) {
      result.Success = false;
      result.Errors.push(
        new ValidationErrorInfo('HourlyRateMax', 'HourlyRateMax must be greater than or equal to HourlyRateMin.', this.HourlyRateMax, ValidationErrorType.Failure),
      );
    }
    if (this.MaxConcurrentReferrals < 1) {
      result.Success = false;
      result.Errors.push(
        new ValidationErrorInfo('MaxConcurrentReferrals', 'MaxConcurrentReferrals must be at least 1.', this.MaxConcurrentReferrals, ValidationErrorType.Failure),
      );
    }
    return result;
  }
}

@RegisterClass(BaseEntity, 'MJ_BizApps_Referrals: Referral Requests')
export class ReferralRequestServerEntity extends ReferralRequestEntity {
  public override async Save(options?: EntitySaveOptions): Promise<boolean> {
    if (!this.RequestNumber || !this.RequestNumber.trim()) {
      const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const suffix = Math.random().toString(36).slice(2, 7).toUpperCase();
      this.RequestNumber = `REF-${stamp}-${suffix}`;
    }
    return super.Save(options);
  }
}

@RegisterClass(BaseEntity, 'MJ_BizApps_Referrals: Professional Credentials')
export class ProfessionalCredentialServerEntity extends ProfessionalCredentialEntity {
  public override Validate(): ValidationResult {
    const result = super.Validate();
    if (!this.CredentialCode || !this.CredentialCode.trim()) {
      result.Success = false;
      result.Errors.push(
        new ValidationErrorInfo('CredentialCode', 'CredentialCode is required.', this.CredentialCode, ValidationErrorType.Failure),
      );
    }
    if (!this.CredentialName || !this.CredentialName.trim()) {
      result.Success = false;
      result.Errors.push(
        new ValidationErrorInfo('CredentialName', 'CredentialName is required.', this.CredentialName, ValidationErrorType.Failure),
      );
    }
    if (this.IssuedAt && this.ExpiresAt && new Date(this.ExpiresAt).getTime() < new Date(this.IssuedAt).getTime()) {
      result.Success = false;
      result.Errors.push(
        new ValidationErrorInfo('ExpiresAt', 'ExpiresAt must be on or after IssuedAt.', this.ExpiresAt, ValidationErrorType.Failure),
      );
    }
    return result;
  }

  public override async Save(options?: EntitySaveOptions): Promise<boolean> {
    const statusField = this.Fields.find((f) => f.Name === 'VerificationStatus');
    const verifiedByField = this.Fields.find((f) => f.Name === 'VerifiedByPersonID');
    const isProtectedTransition =
      (statusField?.Dirty &&
        (this.VerificationStatus === 'Verified' ||
          this.VerificationStatus === 'Rejected' ||
          this.VerificationStatus === 'Revoked')) ||
      Boolean(verifiedByField?.Dirty);

    if (isProtectedTransition) {
      if (!this.ContextCurrentUser || !IsCoordinatorOrAdmin(this.ContextCurrentUser)) {
        throw new AuthorizationError(
          'Coordinator or Administrator authority is required to transition credential VerificationStatus or modify VerifiedByPersonID.',
        );
      }
      const rawProvider: object | undefined = this.ProviderToUse;
      const isMetadataAndRunView = (
        p: object | undefined,
      ): p is IMetadataProvider & IRunViewProvider =>
        Boolean(p && 'GetEntityObject' in p && 'RunView' in p);
      if (isMetadataAndRunView(rawProvider)) {
        const dp = rawProvider;
        if (this.ProfessionalProfileID) {
          const profile = await dp.GetEntityObject<ProfessionalProfileEntity>(
            'MJ_BizApps_Referrals: Professional Profiles',
            this.ContextCurrentUser,
          );
          if (!(await profile.Load(this.ProfessionalProfileID))) {
            throw new AuthorizationError(
              `Parent ProfessionalProfile '${this.ProfessionalProfileID}' not found for credential verification.`,
            );
          }
        }
        const resolvedPersonId = await ResolvePersonIdForUser(this.ContextCurrentUser, dp);
        if (!resolvedPersonId) {
          throw new AuthorizationError(
            'Authenticated coordinator must resolve to a valid Person record before saving credential verification decision.',
          );
        }
        this.VerifiedByPersonID = resolvedPersonId;
      }
    }

    if (this.VerificationStatus === 'Verified' && !this.VerifiedAt) {
      this.VerifiedAt = new Date();
    }
    if (!this.ProviderKey || !this.ProviderKey.trim()) {
      this.ProviderKey = 'Manual';
    }
    return super.Save(options);
  }
}

@RegisterClass(BaseEntity, 'MJ_BizApps_Referrals: Referral Escalations')
export class ReferralEscalationServerEntity extends ReferralEscalationEntity {
  public override Validate(): ValidationResult {
    const result = super.Validate();
    if (this.EscalationLevel < 1 || this.EscalationLevel > 3) {
      result.Success = false;
      result.Errors.push(
        new ValidationErrorInfo('EscalationLevel', 'EscalationLevel must be between 1 and 3.', this.EscalationLevel, ValidationErrorType.Failure),
      );
    }
    if (this.Status === 'Resolved' && !this.ResolvedAt) {
      this.ResolvedAt = new Date();
    }
    if (this.Status === 'Acknowledged' && !this.AcknowledgedAt) {
      this.AcknowledgedAt = new Date();
    }
    return result;
  }
}

@RegisterClass(BaseEntity, 'MJ_BizApps_Referrals: Referral Outcomes')
export class ReferralOutcomeServerEntity extends ReferralOutcomeEntity {
  public override Validate(): ValidationResult {
    const result = super.Validate();
    if (this.EstimatedFeeAmount != null && this.EstimatedFeeAmount < 0) {
      result.Success = false;
      result.Errors.push(
        new ValidationErrorInfo('EstimatedFeeAmount', 'EstimatedFeeAmount cannot be negative.', this.EstimatedFeeAmount, ValidationErrorType.Failure),
      );
    }
    if (this.ReportedFeeAmount != null && this.ReportedFeeAmount < 0) {
      result.Success = false;
      result.Errors.push(
        new ValidationErrorInfo('ReportedFeeAmount', 'ReportedFeeAmount cannot be negative.', this.ReportedFeeAmount, ValidationErrorType.Failure),
      );
    }
    if (this.ClosedAt && this.EngagedAt && new Date(this.ClosedAt).getTime() < new Date(this.EngagedAt).getTime()) {
      result.Success = false;
      result.Errors.push(
        new ValidationErrorInfo('ClosedAt', 'ClosedAt cannot be before EngagedAt.', this.ClosedAt, ValidationErrorType.Failure),
      );
    }
    return result;
  }
}

interface CachedWindow {
  ID: string;
  WindowType: string;
  StartsAt: Date;
  EndsAt: Date;
  IsActive: boolean;
}

@RegisterClass(BaseEntity, 'MJ_BizApps_Referrals: Professional Availability Windows')
export class ProfessionalAvailabilityWindowServerEntity extends ProfessionalAvailabilityWindowEntity {
  /**
   * CR-10: an in-process cache of a professional's active availability windows, keyed by
   * `ProfessionalProfileID.toLowerCase()`. `Save()` primes this cache via `RunView` for the
   * current `ProfessionalProfileID` *before* calling `super.Save()` (which synchronously
   * invokes `Validate()` as part of MJ's save lifecycle), so the synchronous `Validate()`
   * below can detect overlapping siblings without itself performing I/O. The cache is a
   * best-effort optimization, not a cross-process lock: it only reflects windows this
   * process has loaded or saved, refreshed on every `Save()` call.
   */
  private static readonly windowCache = new Map<string, CachedWindow[]>();

  private static cacheKeyFor(profileId: string): string {
    return profileId.toLowerCase();
  }

  private async primeOverlapCache(): Promise<CachedWindow[] | null> {
    if (!this.ProfessionalProfileID) {
      return null;
    }
    const rawProvider: object | undefined = this.ProviderToUse;
    const isMetadataAndRunView = (p: object | undefined): p is IMetadataProvider & IRunViewProvider =>
      Boolean(p && 'GetEntityObject' in p && 'RunView' in p);
    if (!isMetadataAndRunView(rawProvider) || !this.ContextCurrentUser) {
      return null;
    }
    const rv = new RunView(rawProvider);
    const siblingsRes = await rv.RunView<ProfessionalAvailabilityWindowEntity>(
      {
        EntityName: 'MJ_BizApps_Referrals: Professional Availability Windows',
        ExtraFilter: `ProfessionalProfileID = '${this.ProfessionalProfileID}' AND IsActive = 1`,
        ResultType: 'simple',
      },
      this.ContextCurrentUser,
    );
    if (!siblingsRes.Success) {
      return null;
    }
    const cached: CachedWindow[] = siblingsRes.Results.filter((w) => w.StartsAt && w.EndsAt).map((w) => ({
      ID: w.ID,
      WindowType: w.WindowType,
      StartsAt: new Date(w.StartsAt),
      EndsAt: new Date(w.EndsAt),
      IsActive: w.IsActive !== false,
    }));
    ProfessionalAvailabilityWindowServerEntity.windowCache.set(
      ProfessionalAvailabilityWindowServerEntity.cacheKeyFor(this.ProfessionalProfileID),
      cached,
    );
    return cached;
  }

  /**
   * Validates the synchronous invariants: `EndsAt` strictly after `StartsAt`, a
   * `ReducedCapacity` window requires a non-null non-negative `CapacityOverride` (CR-14),
   * and - via the pre-warmed `windowCache` (CR-10) - no overlapping active same-`WindowType`
   * sibling for the same `ProfessionalProfileID` (`StartsAt < existing.EndsAt && EndsAt >
   * existing.StartsAt`). The cache-based overlap check only fires when the cache has
   * already been primed for this `ProfessionalProfileID` (by a prior `Save()` in-process);
   * `Save()` below additionally re-verifies overlap directly via `RunView` as the
   * authoritative, always-correct guard before any write occurs.
   */
  public override Validate(): ValidationResult {
    const result = super.Validate();

    if (!this.StartsAt || !this.EndsAt) {
      result.Success = false;
      result.Errors.push(
        new ValidationErrorInfo('StartsAt', `StartsAt and EndsAt are required for ${this.WindowType} availability windows.`, this.StartsAt, ValidationErrorType.Failure),
      );
    } else if (new Date(this.EndsAt).getTime() <= new Date(this.StartsAt).getTime()) {
      result.Success = false;
      result.Errors.push(
        new ValidationErrorInfo('EndsAt', 'EndsAt must be strictly after StartsAt.', this.EndsAt, ValidationErrorType.Failure),
      );
    }

    if (this.WindowType === 'ReducedCapacity' && (this.CapacityOverride == null || this.CapacityOverride < 0)) {
      result.Success = false;
      result.Errors.push(
        new ValidationErrorInfo(
          'CapacityOverride',
          "A 'ReducedCapacity' availability window requires a non-null, non-negative CapacityOverride.",
          this.CapacityOverride,
          ValidationErrorType.Failure,
        ),
      );
    }

    if (this.IsActive !== false && this.StartsAt && this.EndsAt && this.ProfessionalProfileID) {
      const cached = ProfessionalAvailabilityWindowServerEntity.windowCache.get(
        ProfessionalAvailabilityWindowServerEntity.cacheKeyFor(this.ProfessionalProfileID),
      );
      if (cached) {
        const newStart = new Date(this.StartsAt).getTime();
        const newEnd = new Date(this.EndsAt).getTime();
        const overlapping = cached.find(
          (w) =>
            w.IsActive !== false &&
            w.WindowType === this.WindowType &&
            w.ID !== this.ID &&
            newStart < w.EndsAt.getTime() &&
            newEnd > w.StartsAt.getTime(),
        );
        if (overlapping) {
          result.Success = false;
          result.Errors.push(
            new ValidationErrorInfo(
              'StartsAt',
              `Overlaps an existing active '${this.WindowType}' window ('${overlapping.ID}') for this ProfessionalProfile.`,
              this.StartsAt,
              ValidationErrorType.Failure,
            ),
          );
        }
      }
    }

    return result;
  }

  /**
   * Primes the overlap cache (so the synchronous `Validate()` above can see this
   * professional's siblings), then authoritatively re-checks for an overlapping active
   * window of the same `WindowType` directly via `RunView` and throws before any write if
   * found, and finally enforces owner/coordinator/admin authorization on both the new and
   * (on update) the previously-persisted `ProfessionalProfileID`, before delegating to the
   * base `Save()`.
   */
  public override async Save(options?: EntitySaveOptions): Promise<boolean> {
    const freshActiveSiblings = await this.primeOverlapCache();

    if (this.IsActive !== false && this.StartsAt && this.EndsAt && this.ProfessionalProfileID) {
      const rawProvider: object | undefined = this.ProviderToUse;
      const isMetadataAndRunView = (
        p: object | undefined,
      ): p is IMetadataProvider & IRunViewProvider =>
        Boolean(p && 'GetEntityObject' in p && 'RunView' in p);
      if (isMetadataAndRunView(rawProvider) && this.ContextCurrentUser) {
        // CR-07: enforce owner/coordinator/admin authorization on the window's
        // ProfessionalProfileID. On an update, also re-verify against the persisted
        // (pre-edit) ProfessionalProfileID so a non-admin cannot reparent someone else's
        // window onto their own profile (or vice versa) by editing the foreign key.
        const idField = this.Fields.find((f) => f.Name === 'ProfessionalProfileID');
        const persistedProfileId = (idField?.OldValue as string | undefined) ?? this.ProfessionalProfileID;
        const isAdmin = this.ContextCurrentUser && IsCoordinatorOrAdmin(this.ContextCurrentUser);
        if (!isAdmin) {
          const ownedProfile = await rawProvider.GetEntityObject<ProfessionalProfileEntity>(
            'MJ_BizApps_Referrals: Professional Profiles',
            this.ContextCurrentUser,
          );
          const checkIds = Array.from(new Set([this.ProfessionalProfileID, persistedProfileId].filter((v): v is string => Boolean(v))));
          for (const checkId of checkIds) {
            if (!(await ownedProfile.Load(checkId)) || ownedProfile.UserID !== this.ContextCurrentUser.ID) {
              throw new AuthorizationError(
                `User '${this.ContextCurrentUser.ID}' is not authorized to save a ProfessionalAvailabilityWindow for ProfessionalProfile '${checkId}' (owner or Coordinator/Administrator required).`,
              );
            }
          }
        }

        // Reuse freshly fetched active siblings from primeOverlapCache() instead of
        // issuing a redundant second RunView for the same ProfessionalProfileID.
        if (freshActiveSiblings) {
          const newStart = new Date(this.StartsAt).getTime();
          const newEnd = new Date(this.EndsAt).getTime();
          const overlapping = freshActiveSiblings.find((w) => {
            if (w.WindowType !== this.WindowType || (this.ID && w.ID === this.ID)) return false;
            return newStart < w.EndsAt.getTime() && newEnd > w.StartsAt.getTime();
          });
          if (overlapping) {
            throw new PersistenceError(
              `ProfessionalAvailabilityWindow overlaps an existing active '${this.WindowType}' window ('${overlapping.ID}') for ProfessionalProfile '${this.ProfessionalProfileID}'.`,
            );
          }
        }
      }
    }
    const saved = await super.Save(options);
    if (saved) {
      // Keep the cache fresh: the prime step above ran before this row existed/changed, so
      // without this update a subsequent sibling's synchronous Validate() in this same
      // process would miss this window until another Save() happens to re-prime it.
      this.upsertSelfInCache();
    }
    return saved;
  }

  private upsertSelfInCache(): void {
    if (!this.ProfessionalProfileID || !this.StartsAt || !this.EndsAt) {
      return;
    }
    const key = ProfessionalAvailabilityWindowServerEntity.cacheKeyFor(this.ProfessionalProfileID);
    const existing = ProfessionalAvailabilityWindowServerEntity.windowCache.get(key) ?? [];
    const withoutSelf = existing.filter((w) => w.ID !== this.ID);
    withoutSelf.push({
      ID: this.ID,
      WindowType: this.WindowType,
      StartsAt: new Date(this.StartsAt),
      EndsAt: new Date(this.EndsAt),
      IsActive: this.IsActive !== false,
    });
    ProfessionalAvailabilityWindowServerEntity.windowCache.set(key, withoutSelf);
  }
}

export function LoadReferralsServerEntities(): void {
  // Ensures module side-effect class registrations are preserved by bundlers.
  void ReferralEscalationServerEntity;
  void ReferralOutcomeServerEntity;
  void ProfessionalAvailabilityWindowServerEntity;
}
