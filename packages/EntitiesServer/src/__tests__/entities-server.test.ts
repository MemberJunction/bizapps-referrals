import { describe, expect, it } from 'vitest';
import { LoadReferralsServerEntities, ProfessionalProfileServerEntity } from '../index.js';

describe('@mj-biz-apps/referrals-entities-server', () => {
  it('exports LoadReferralsServerEntities and ProfessionalProfileServerEntity', () => {
    expect(typeof LoadReferralsServerEntities).toBe('function');
    expect(ProfessionalProfileServerEntity).toBeDefined();
  });
});
