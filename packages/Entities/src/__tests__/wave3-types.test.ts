import { describe, expect, expectTypeOf, it } from 'vitest';
import {
  ProfessionalAvailabilityWindowEntity,
  ReciprocitySnapshotEntity,
  ReferralAssignmentEntity,
  ReferralEscalationEntity,
  ReferralOutcomeEntity,
  ReferralRequestEntity,
} from '../index.js';

describe('@mj-biz-apps/referrals-entities (Wave 3 Slice 1)', () => {
  it('exports the 4 new Wave 3 entity classes', () => {
    expect(ReferralEscalationEntity).toBeDefined();
    expect(ReferralOutcomeEntity).toBeDefined();
    expect(ProfessionalAvailabilityWindowEntity).toBeDefined();
    expect(ReciprocitySnapshotEntity).toBeDefined();
  });

  it('registers the new entity classes under @memberjunction/global ClassFactory', () => {
    expect(ReferralEscalationEntity.name).toBe('mjBizAppsReferralsReferralEscalationEntity');
    expect(ReferralOutcomeEntity.name).toBe('mjBizAppsReferralsReferralOutcomeEntity');
    expect(ProfessionalAvailabilityWindowEntity.name).toBe('mjBizAppsReferralsProfessionalAvailabilityWindowEntity');
    expect(ReciprocitySnapshotEntity.name).toBe('mjBizAppsReferralsReciprocitySnapshotEntity');
  });

  it('Round 2: statically types ReferralAssignment.Status and ReferralRequest.SourceChannel as closed literal unions', () => {
    expectTypeOf<ReferralAssignmentEntity['Status']>().toEqualTypeOf<
      'Queued' | 'Offered' | 'Accepted' | 'InProgress' | 'Completed' | 'Declined' | 'ConflictRejected' | 'Expired' | 'Withdrawn'
    >();
    expectTypeOf<ReferralRequestEntity['SourceChannel']>().toEqualTypeOf<
      'SeekerIntake' | 'FinderWidget' | 'ProReferral' | 'Concierge' | 'OperatorManual'
    >();
  });
});
