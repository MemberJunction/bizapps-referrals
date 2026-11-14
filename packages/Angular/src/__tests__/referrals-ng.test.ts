import '@angular/compiler';
import { describe, expect, it } from 'vitest';
import {
  ConflictCheckPartyFormComponent,
  JurisdictionFormComponent,
  LoadBizAppsReferralsClient,
  PracticeAreaFormComponent,
  ProfessionalJurisdictionFormComponent,
  ProfessionalPracticeAreaFormComponent,
  ProfessionalProfileFormComponent,
  ProfessionalProfileHeroPanel,
  REFERRALS_ENTITY_FORM_COMPONENTS,
  ReferralAssignmentFormComponent,
  ReferralFeedbackFormComponent,
  ReferralRequestFormComponent,
  ReferralRequestHeroPanel,
  ReferralTierFormComponent,
  ReferralsModule,
  ReferralsOpsTelemetryComponent,
  ReferralsProInboxComponent,
  ReferralsSeekerIntakeComponent,
} from '../public-api.js';

describe('@mj-biz-apps/referrals-ng', () => {
  it('exports LoadBizAppsReferralsClient, ReferralsModule, and all 3 persona workspaces + 2 BaseFormPanels', () => {
    expect(typeof LoadBizAppsReferralsClient).toBe('function');
    expect(() => LoadBizAppsReferralsClient()).not.toThrow();
    expect(ReferralsModule).toBeDefined();
    expect(ReferralsSeekerIntakeComponent).toBeDefined();
    expect(ReferralsProInboxComponent).toBeDefined();
    expect(ReferralsOpsTelemetryComponent).toBeDefined();
    expect(ReferralRequestHeroPanel).toBeDefined();
    expect(ProfessionalProfileHeroPanel).toBeDefined();
  });

  it('exports all 10 left-rail BaseFormComponent classes and bundles them in REFERRALS_ENTITY_FORM_COMPONENTS', () => {
    expect(REFERRALS_ENTITY_FORM_COMPONENTS).toHaveLength(10);
    expect(ReferralRequestFormComponent).toBeDefined();
    expect(ProfessionalProfileFormComponent).toBeDefined();
    expect(ReferralAssignmentFormComponent).toBeDefined();
    expect(ConflictCheckPartyFormComponent).toBeDefined();
    expect(PracticeAreaFormComponent).toBeDefined();
    expect(JurisdictionFormComponent).toBeDefined();
    expect(ReferralTierFormComponent).toBeDefined();
    expect(ProfessionalPracticeAreaFormComponent).toBeDefined();
    expect(ProfessionalJurisdictionFormComponent).toBeDefined();
    expect(ReferralFeedbackFormComponent).toBeDefined();

    for (const FormClass of REFERRALS_ENTITY_FORM_COMPONENTS) {
      expect(typeof FormClass).toBe('function');
      expect(typeof FormClass.prototype.ngOnInit).toBe('function');
    }
  });
});
