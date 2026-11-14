import '@angular/compiler';
import { MJGlobal } from '@memberjunction/global';
import { BaseFormComponent } from '@memberjunction/ng-base-forms';
import { BaseResourceComponent } from '@memberjunction/ng-shared';
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
  ReferralsReportGalleryComponent,
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

    const expectedEntities = [
      'MJ_BizApps_Referrals: Referral Requests',
      'MJ_BizApps_Referrals: Professional Profiles',
      'MJ_BizApps_Referrals: Referral Assignments',
      'MJ_BizApps_Referrals: Conflict Check Parties',
      'MJ_BizApps_Referrals: Practice Areas',
      'MJ_BizApps_Referrals: Jurisdictions',
      'MJ_BizApps_Referrals: Referral Tiers',
      'MJ_BizApps_Referrals: Professional Practice Areas',
      'MJ_BizApps_Referrals: Professional Jurisdictions',
      'MJ_BizApps_Referrals: Referral Feedbacks',
    ];
    for (const entityName of expectedEntities) {
      const registered = MJGlobal.Instance.ClassFactory.GetRegistration(BaseFormComponent, entityName);
      expect(registered).toBeDefined();
    }

    expect(ReferralsReportGalleryComponent).toBeDefined();
    const galleryReg = MJGlobal.Instance.ClassFactory.GetRegistration(
      BaseResourceComponent,
      'ReferralsReportGalleryResource',
    );
    expect(galleryReg).toBeDefined();
  });
});
