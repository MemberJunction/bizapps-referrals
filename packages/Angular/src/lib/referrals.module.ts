import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BaseFormsModule } from '@memberjunction/ng-base-forms';
import { EntityViewerModule } from '@memberjunction/ng-entity-viewer';
import { LinkDirectivesModule } from '@memberjunction/ng-link-directives';
import { loadModule as loadReferralsEntitiesModule } from '@mj-biz-apps/referrals-entities';

import { ReferralsCredentialDirectoryComponent } from './components/credential-directory.component.js';
import { ReferralsOpsTelemetryComponent } from './components/ops-telemetry.component.js';
import { ReferralsProInboxComponent } from './components/pro-inbox.component.js';
import { ReferralsReportGalleryComponent } from './components/report-gallery.component.js';
import { ReferralsSeekerIntakeComponent } from './components/seeker-intake.component.js';
import { ReferralsFinderWidgetComponent } from './finder-widget/referrals-finder-widget.component.js';
import {
  ConflictCheckPartyHeroPanel,
  JurisdictionHeroPanel,
  OrganizationReferralsOverviewPanel,
  PersonReferralsOverviewPanel,
  PracticeAreaHeroPanel,
  ProfessionalJurisdictionHeroPanel,
  ProfessionalPracticeAreaHeroPanel,
  ProfessionalProfileHeroPanel,
  ReferralAssignmentHeroPanel,
  ReferralFeedbackHeroPanel,
  ReferralRequestHeroPanel,
  ReferralTierHeroPanel,
  UserReferralsOverviewPanel,
} from './form-panels/referrals-form-panels.js';
import {
  REFERRALS_ENTITY_FORM_COMPONENTS,
  ConflictCheckPartyFormComponent,
  JurisdictionFormComponent,
  PracticeAreaFormComponent,
  ProfessionalJurisdictionFormComponent,
  ProfessionalPracticeAreaFormComponent,
  ProfessionalProfileFormComponent,
  ReferralAssignmentFormComponent,
  ReferralFeedbackFormComponent,
  ReferralRequestFormComponent,
  ReferralTierFormComponent,
} from './forms/referrals-entity-forms.js';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    BaseFormsModule,
    EntityViewerModule,
    LinkDirectivesModule,
    ReferralsSeekerIntakeComponent,
    ReferralsProInboxComponent,
    ReferralsOpsTelemetryComponent,
    ReferralsReportGalleryComponent,
    ReferralsCredentialDirectoryComponent,
    ReferralsFinderWidgetComponent,
    ReferralRequestHeroPanel,
    ProfessionalProfileHeroPanel,
    ReferralAssignmentHeroPanel,
    ConflictCheckPartyHeroPanel,
    PracticeAreaHeroPanel,
    JurisdictionHeroPanel,
    ReferralTierHeroPanel,
    ProfessionalPracticeAreaHeroPanel,
    ProfessionalJurisdictionHeroPanel,
    ReferralFeedbackHeroPanel,
    PersonReferralsOverviewPanel,
    OrganizationReferralsOverviewPanel,
    UserReferralsOverviewPanel,
  ],
  declarations: [
    ...REFERRALS_ENTITY_FORM_COMPONENTS,
  ],
  exports: [
    ReferralsSeekerIntakeComponent,
    ReferralsProInboxComponent,
    ReferralsOpsTelemetryComponent,
    ReferralsReportGalleryComponent,
    ReferralsCredentialDirectoryComponent,
    ReferralsFinderWidgetComponent,
    ReferralRequestHeroPanel,
    ProfessionalProfileHeroPanel,
    ReferralAssignmentHeroPanel,
    ConflictCheckPartyHeroPanel,
    PracticeAreaHeroPanel,
    JurisdictionHeroPanel,
    ReferralTierHeroPanel,
    ProfessionalPracticeAreaHeroPanel,
    ProfessionalJurisdictionHeroPanel,
    ReferralFeedbackHeroPanel,
    PersonReferralsOverviewPanel,
    OrganizationReferralsOverviewPanel,
    UserReferralsOverviewPanel,
    ...REFERRALS_ENTITY_FORM_COMPONENTS,
  ],
})
export class ReferralsModule {}

export function LoadBizAppsReferralsClient(): void {
  // Ensures entity subclasses & schemas are loaded
  loadReferralsEntitiesModule();

  // Ensures client workspace resources, form panels, and left-rail form components are preserved
  void ReferralsSeekerIntakeComponent;
  void ReferralsProInboxComponent;
  void ReferralsOpsTelemetryComponent;
  void ReferralsReportGalleryComponent;
  void ReferralsCredentialDirectoryComponent;
  void ReferralsFinderWidgetComponent;
  void ReferralRequestHeroPanel;
  void ProfessionalProfileHeroPanel;
  void ReferralAssignmentHeroPanel;
  void ConflictCheckPartyHeroPanel;
  void PracticeAreaHeroPanel;
  void JurisdictionHeroPanel;
  void ReferralTierHeroPanel;
  void ProfessionalPracticeAreaHeroPanel;
  void ProfessionalJurisdictionHeroPanel;
  void ReferralFeedbackHeroPanel;
  void PersonReferralsOverviewPanel;
  void OrganizationReferralsOverviewPanel;
  void UserReferralsOverviewPanel;
  void REFERRALS_ENTITY_FORM_COMPONENTS;
  void ReferralRequestFormComponent;
  void ProfessionalProfileFormComponent;
  void ReferralAssignmentFormComponent;
  void ConflictCheckPartyFormComponent;
  void PracticeAreaFormComponent;
  void JurisdictionFormComponent;
  void ReferralTierFormComponent;
  void ProfessionalPracticeAreaFormComponent;
  void ProfessionalJurisdictionFormComponent;
  void ReferralFeedbackFormComponent;
}
