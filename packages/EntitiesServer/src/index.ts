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

@RegisterClass(BaseEntity, 'MJ_BizApps_Referrals: Professional Availability Windows')
export class ProfessionalAvailabilityWindowServerEntity extends ProfessionalAvailabilityWindowEntity {
  /**
   * Validates the synchronous (non-DB-dependent) invariants: `EndsAt` strictly after
   * `StartsAt`, and a `ReducedCapacity` window requires a non-null, non-negative
   * `CapacityOverride`. The overlap check (CR-14) additionally requires a DB round-trip
   * and therefore cannot run inside a synchronous `Validate()`; it is enforced in `Save()`
   * below, which runs on every create/update path before any write occurs.
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

    return result;
  }

  /**
   * Rejects overlapping active windows of the same `WindowType` for the same
   * `ProfessionalProfileID` (`StartsAt < existing.EndsAt && EndsAt > existing.StartsAt`)
   * before delegating to the base `Save()`.
   */
  public override async Save(options?: EntitySaveOptions): Promise<boolean> {
    if (this.IsActive !== false && this.StartsAt && this.EndsAt && this.ProfessionalProfileID) {
      const rawProvider: object | undefined = this.ProviderToUse;
      const isMetadataAndRunView = (
        p: object | undefined,
      ): p is IMetadataProvider & IRunViewProvider =>
        Boolean(p && 'GetEntityObject' in p && 'RunView' in p);
      if (isMetadataAndRunView(rawProvider) && this.ContextCurrentUser) {
        const rv = new RunView(rawProvider);
        const siblingsRes = await rv.RunView<ProfessionalAvailabilityWindowEntity>(
          {
            EntityName: 'MJ_BizApps_Referrals: Professional Availability Windows',
            ExtraFilter: `ProfessionalProfileID = '${this.ProfessionalProfileID}' AND WindowType = '${this.WindowType}' AND IsActive = 1${this.ID ? ` AND ID <> '${this.ID}'` : ''}`,
            ResultType: 'entity_object',
          },
          this.ContextCurrentUser,
        );
        if (siblingsRes.Success) {
          const newStart = new Date(this.StartsAt).getTime();
          const newEnd = new Date(this.EndsAt).getTime();
          const overlapping = siblingsRes.Results.find((w) => {
            if (!w.StartsAt || !w.EndsAt) return false;
            const existingStart = new Date(w.StartsAt).getTime();
            const existingEnd = new Date(w.EndsAt).getTime();
            return newStart < existingEnd && newEnd > existingStart;
          });
          if (overlapping) {
            throw new PersistenceError(
              `ProfessionalAvailabilityWindow overlaps an existing active '${this.WindowType}' window ('${overlapping.ID}') for ProfessionalProfile '${this.ProfessionalProfileID}'.`,
            );
          }
        }
      }
    }
    return super.Save(options);
  }
}

export function LoadReferralsServerEntities(): void {
  // Ensures module side-effect class registrations are preserved by bundlers.
  void ReferralEscalationServerEntity;
  void ReferralOutcomeServerEntity;
  void ProfessionalAvailabilityWindowServerEntity;
}
