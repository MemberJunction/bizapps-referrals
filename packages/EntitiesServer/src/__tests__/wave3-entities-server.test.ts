import { describe, expect, it } from 'vitest';
import {
  LoadReferralsServerEntities,
  ProfessionalAvailabilityWindowServerEntity,
  ReferralEscalationServerEntity,
  ReferralOutcomeServerEntity,
} from '../index.js';

describe('@mj-biz-apps/referrals-entities-server (Wave 3 Slice 1)', () => {
  it('exports the 3 new server entity subclasses and preserves their registration via LoadReferralsServerEntities', () => {
    expect(ReferralEscalationServerEntity).toBeDefined();
    expect(ReferralOutcomeServerEntity).toBeDefined();
    expect(ProfessionalAvailabilityWindowServerEntity).toBeDefined();
    expect(typeof LoadReferralsServerEntities).toBe('function');
    expect(() => LoadReferralsServerEntities()).not.toThrow();
  });

  it('declares an overridden Validate() method on each new server entity subclass', () => {
    expect(typeof ReferralEscalationServerEntity.prototype.Validate).toBe('function');
    expect(typeof ReferralOutcomeServerEntity.prototype.Validate).toBe('function');
    expect(typeof ProfessionalAvailabilityWindowServerEntity.prototype.Validate).toBe('function');
    // Each subclass must own its own Validate implementation rather than silently
    // inheriting the generated entity's (so the domain-invariant checks actually run).
    expect(Object.prototype.hasOwnProperty.call(ReferralEscalationServerEntity.prototype, 'Validate')).toBe(true);
    expect(Object.prototype.hasOwnProperty.call(ReferralOutcomeServerEntity.prototype, 'Validate')).toBe(true);
    expect(Object.prototype.hasOwnProperty.call(ProfessionalAvailabilityWindowServerEntity.prototype, 'Validate')).toBe(true);
  });
});
