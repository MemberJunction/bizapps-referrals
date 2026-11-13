import { BaseEntity, EntitySaveOptions, ValidationResult } from '@memberjunction/core';
import { RegisterClass, ValidationErrorInfo, ValidationErrorType } from '@memberjunction/global';
import { NormalizePartyName } from '@mj-biz-apps/referrals-core';
import {
  ConflictCheckPartyEntity,
  ProfessionalProfileEntity,
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

export function LoadReferralsServerEntities(): void {
  // Ensures module side-effect class registrations are preserved by bundlers.
}
