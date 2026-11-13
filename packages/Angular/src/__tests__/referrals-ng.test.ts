import '@angular/compiler';
import { describe, expect, it } from 'vitest';
import {
  LoadBizAppsReferralsClient,
  ProfessionalProfileHeroPanel,
  ReferralRequestHeroPanel,
  ReferralsOpsTelemetryComponent,
  ReferralsProInboxComponent,
  ReferralsSeekerIntakeComponent,
} from '../public-api.js';

describe('@mj-biz-apps/referrals-ng', () => {
  it('exports LoadBizAppsReferralsClient and all 3 persona workspaces + 2 BaseFormPanels', () => {
    expect(typeof LoadBizAppsReferralsClient).toBe('function');
    expect(ReferralsSeekerIntakeComponent).toBeDefined();
    expect(ReferralsProInboxComponent).toBeDefined();
    expect(ReferralsOpsTelemetryComponent).toBeDefined();
    expect(ReferralRequestHeroPanel).toBeDefined();
    expect(ProfessionalProfileHeroPanel).toBeDefined();
  });
});
