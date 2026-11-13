import { describe, expect, it } from 'vitest';
import { ProfessionalProfileCreateSchema, ReferralRequestCreateSchema } from '../index.js';

describe('@mj-biz-apps/referrals-entities', () => {
  it('validates ReferralRequestCreateSchema with valid input', () => {
    const parsed = ReferralRequestCreateSchema.parse({
      SeekerName: 'Alice Mercer',
      SeekerEmail: 'alice@mercer.example.com',
      PracticeAreaID: 'a1000001-0000-0000-0000-000000000001',
      JurisdictionID: 'b1000001-0000-0000-0000-000000000001',
      ReferralTierID: 'c1000001-0000-0000-0000-000000000001',
      MatterTitle: 'Series A Corporate Restructuring',
      MatterSummary: 'Need outside corporate counsel for Delaware C-Corp conversion.',
    });
    expect(parsed.UrgencyLevel).toBe('Standard');
    expect(parsed.RequiresProBono).toBe(false);
  });

  it('rejects invalid email in ProfessionalProfileCreateSchema', () => {
    const result = ProfessionalProfileCreateSchema.safeParse({
      DisplayName: 'Bob Counsel',
      Email: 'not-an-email',
    });
    expect(result.success).toBe(false);
  });
});
