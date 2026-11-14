import '@angular/compiler';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
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

  it('exports all 11 left-rail BaseFormComponent classes and bundles them in REFERRALS_ENTITY_FORM_COMPONENTS', () => {
    expect(REFERRALS_ENTITY_FORM_COMPONENTS).toHaveLength(11);
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

  it('uses --mj-* design tokens in report-gallery.component.ts without hardcoded hex or rgb colors', () => {
    const galleryPath = fileURLToPath(
      new URL('../lib/components/report-gallery.component.ts', import.meta.url),
    );
    const gallerySrc = readFileSync(galleryPath, 'utf8');

    expect(gallerySrc).toContain('--mj-bg-page');
    expect(gallerySrc).toContain('--mj-bg-surface');
    expect(gallerySrc).toContain('--mj-bg-surface-card');
    expect(gallerySrc).toContain('--mj-text-primary');
    expect(gallerySrc).toContain('--mj-text-secondary');
    expect(gallerySrc).toContain('--mj-border-default');
    expect(gallerySrc).toContain('--mj-brand-primary');
    expect(gallerySrc).toContain('--mj-status-success');
    expect(gallerySrc).toContain('--mj-status-warning');
    expect(gallerySrc).toContain('--mj-status-error');
    expect(gallerySrc).toContain('--mj-status-info');

    expect(gallerySrc).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    expect(gallerySrc).not.toMatch(/\brgba?\(/);
  });
});
