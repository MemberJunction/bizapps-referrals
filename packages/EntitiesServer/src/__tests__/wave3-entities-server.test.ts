import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ValidationResult } from '@memberjunction/core';
import { ProfessionalAvailabilityWindowEntity } from '@mj-biz-apps/referrals-entities';
import {
  LoadReferralsServerEntities,
  ProfessionalAvailabilityWindowServerEntity,
  ReferralEscalationServerEntity,
  ReferralOutcomeServerEntity,
} from '../index.js';

const PROFILE_ID = '10000000-0000-4000-8000-000000000001';

interface FakeField {
  Name: string;
}

type FakeFieldValue = string | number | boolean | Date | null | FakeField[];

/**
 * CR-10: constructs a minimal object with ProfessionalAvailabilityWindowServerEntity's
 * prototype so Validate() runs against the real overridden implementation (including its
 * `super.Validate()` call) without requiring a full BaseEntity/EntityInfo bootstrap.
 */
function makeWindowLike(fields: {
  ID: string;
  ProfessionalProfileID: string;
  WindowType: string;
  StartsAt: Date | null;
  EndsAt: Date | null;
  CapacityOverride?: number | null;
  IsActive?: boolean;
}): ProfessionalAvailabilityWindowServerEntity {
  const target = Object.create(ProfessionalAvailabilityWindowServerEntity.prototype) as ProfessionalAvailabilityWindowServerEntity &
    Record<string, FakeFieldValue>;
  // Define own data properties (not via Object.assign, which would invoke the generated
  // entity's inherited `set ID()`-style accessors and fail without a real EntityInfo/
  // BaseEntity bootstrap). An own data property shadows an inherited accessor.
  const values: Record<string, FakeFieldValue> = {
    ID: fields.ID,
    ProfessionalProfileID: fields.ProfessionalProfileID,
    WindowType: fields.WindowType,
    StartsAt: fields.StartsAt,
    EndsAt: fields.EndsAt,
    CapacityOverride: fields.CapacityOverride ?? null,
    IsActive: fields.IsActive ?? true,
    Reason: null,
    Fields: [] as FakeField[],
  };
  for (const [key, value] of Object.entries(values)) {
    Object.defineProperty(target, key, { value, writable: true, enumerable: true, configurable: true });
  }
  return target as ProfessionalAvailabilityWindowServerEntity;
}

interface SelfCacheUpsertable {
  upsertSelfInCache: () => void;
}

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

  // The fake instances below only populate the handful of fields the overlap-cache logic
  // reads; BaseEntity.Validate()'s own field-metadata checks need a real EntityInfo/
  // internal-state bootstrap this test harness doesn't construct, so the inherited
  // `super.Validate()` call is stubbed to a clean passing result for these 2 tests only.
  let superValidateSpy: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    superValidateSpy = vi.spyOn(ProfessionalAvailabilityWindowEntity.prototype, 'Validate').mockImplementation(() => {
      const clean = new ValidationResult();
      clean.Success = true;
      return clean;
    });
  });
  afterEach(() => {
    superValidateSpy.mockRestore();
  });

  it('AC-10/CR-10: Validate() rejects an overlapping active same-WindowType sibling once the overlap cache has been primed', () => {
    const windowA = makeWindowLike({
      ID: 'a0000000-0000-4000-8000-000000000001',
      ProfessionalProfileID: PROFILE_ID,
      WindowType: 'Paused',
      StartsAt: new Date('2026-06-01T00:00:00.000Z'),
      EndsAt: new Date('2026-06-10T00:00:00.000Z'),
    });
    const windowB = makeWindowLike({
      ID: 'b0000000-0000-4000-8000-000000000002',
      ProfessionalProfileID: PROFILE_ID,
      WindowType: 'Paused',
      // Overlaps windowA's range.
      StartsAt: new Date('2026-06-05T00:00:00.000Z'),
      EndsAt: new Date('2026-06-15T00:00:00.000Z'),
    });

    // Simulate what Save() does once it persists a window: upsert it into the shared
    // in-process overlap cache keyed by ProfessionalProfileID.
    const upsertSelfInCache = (
      ProfessionalAvailabilityWindowServerEntity.prototype as object as SelfCacheUpsertable
    ).upsertSelfInCache;
    upsertSelfInCache.call(windowA);

    const result = windowB.Validate();
    expect(result.Success).toBe(false);
    expect(result.Errors.some((e) => e.Message.includes('Overlaps an existing active'))).toBe(true);
  });

  it('AC-10/CR-10: Validate() accepts a non-overlapping window for the same ProfessionalProfileID/WindowType once primed', () => {
    const windowA = makeWindowLike({
      ID: 'a0000000-0000-4000-8000-000000000003',
      ProfessionalProfileID: PROFILE_ID,
      WindowType: 'OnLeave',
      StartsAt: new Date('2026-07-01T00:00:00.000Z'),
      EndsAt: new Date('2026-07-10T00:00:00.000Z'),
    });
    const windowC = makeWindowLike({
      ID: 'c0000000-0000-4000-8000-000000000004',
      ProfessionalProfileID: PROFILE_ID,
      WindowType: 'OnLeave',
      // Entirely after windowA's range - no overlap.
      StartsAt: new Date('2026-07-20T00:00:00.000Z'),
      EndsAt: new Date('2026-07-25T00:00:00.000Z'),
    });

    const upsertSelfInCache = (
      ProfessionalAvailabilityWindowServerEntity.prototype as object as SelfCacheUpsertable
    ).upsertSelfInCache;
    upsertSelfInCache.call(windowA);

    const result = windowC.Validate();
    expect(result.Success).toBe(true);
  });
});
