import { Component } from '@angular/core';
import { RegisterClass } from '@memberjunction/global';
import { BaseFormComponent } from '@memberjunction/ng-base-forms';
import {
  ConflictCheckPartyEntity,
  JurisdictionEntity,
  PracticeAreaEntity,
  ProfessionalJurisdictionEntity,
  ProfessionalPracticeAreaEntity,
  ProfessionalProfileEntity,
  ReferralAssignmentEntity,
  ReferralFeedbackEntity,
  ReferralRequestEntity,
  ReferralTierEntity,
} from '@mj-biz-apps/referrals-entities';

/**
 * 1. Referral Requests Left-Rail Form
 */
// Refactored to metadata-driven generated left-nav form
// @RegisterClass(BaseFormComponent, 'MJ_BizApps_Referrals: Referral Requests')
@Component({
  standalone: false,
  selector: 'mj-referrals-referral-request-form',
  template: `
    <mj-record-form-container [Record]="record" [FormComponent]="this"
      (Navigate)="OnFormNavigate($event)"
      (DeleteRequested)="OnDeleteRequested()"
      (FavoriteToggled)="OnFavoriteToggled()"
      (HistoryRequested)="OnHistoryRequested()"
      (ListManagementRequested)="OnListManagementRequested()">

      <mj-form-panel-slot Entity="{{record.EntityInfo.Name}}" Slot="before-fields" [Record]="record" [FormComponent]="this" [FormContext]="formContext"></mj-form-panel-slot>

      <!-- ========================================
           FIELD PANELS
           ======================================== -->
      <!-- Matter Details Section -->
      <mj-collapsible-panel
        SectionKey="matterDetails"
        SectionName="Matter Details"
        Icon="fa-solid fa-scale-balanced"
        [Form]="this"
        [FormContext]="formContext">
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="RequestNumber"
          Type="textbox"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="MatterTitle"
          Type="textbox"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="MatterSummary"
          Type="textarea"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="PracticeAreaID"
          Type="textbox"
          LinkType="Record"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="JurisdictionID"
          Type="textbox"
          LinkType="Record"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="ReferralTierID"
          Type="textbox"
          LinkType="Record"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="UrgencyLevel"
          Type="select"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="BudgetRange"
          Type="textbox"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="PreferredLanguage"
          Type="textbox"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="RequiresProBono"
          Type="checkbox"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
      </mj-collapsible-panel>

      <!-- Seeker Details Section -->
      <mj-collapsible-panel
        SectionKey="seekerDetails"
        SectionName="Seeker Details"
        Icon="fa-solid fa-user"
        [Form]="this"
        [FormContext]="formContext">
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="SeekerName"
          Type="textbox"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="SeekerEmail"
          Type="textbox"
          LinkType="Email"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="SeekerPhone"
          Type="textbox"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="SeekerCompany"
          Type="textbox"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="SeekerPersonID"
          Type="textbox"
          LinkType="Record"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
      </mj-collapsible-panel>

      <!-- Routing & Lifecycle Section -->
      <mj-collapsible-panel
        SectionKey="routingLifecycle"
        SectionName="Routing & Lifecycle"
        Icon="fa-solid fa-arrows-split-up-and-left"
        [Form]="this"
        [FormContext]="formContext">
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="Status"
          Type="select"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="AssignedProfessionalID"
          Type="textbox"
          LinkType="Record"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="CurrentCascadeStep"
          Type="number"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="SubmittedAt"
          Type="datepicker"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="AcceptedAt"
          Type="datepicker"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="CompletedAt"
          Type="datepicker"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
      </mj-collapsible-panel>

      <!-- System Metadata Section -->
      <mj-collapsible-panel
        SectionKey="systemMetadata"
        SectionName="System Metadata"
        Icon="fa-solid fa-gear"
        [Form]="this"
        [FormContext]="formContext">
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="ID"
          Type="textbox"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="__mj_CreatedAt"
          Type="datepicker"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="__mj_UpdatedAt"
          Type="datepicker"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
      </mj-collapsible-panel>

      <mj-form-panel-slot Entity="{{record.EntityInfo.Name}}" Slot="after-fields" [Record]="record" [FormComponent]="this" [FormContext]="formContext"></mj-form-panel-slot>

      <!-- ========================================
           RELATED ENTITY PANELS
           ======================================== -->
      <!-- Referral Assignments Section -->
      <mj-collapsible-panel
        SectionKey="referralAssignments"
        SectionName="Referral Assignments"
        Icon="fa-solid fa-list-check"
        Variant="related-entity"
        [Form]="this"
        [FormContext]="formContext"
        [BadgeCount]="GetSectionRowCount('referralAssignments')"
        [DefaultExpanded]="false">
        @if (record.IsSaved) {
          <div>
            <mj-explorer-entity-data-grid
              [Params]="BuildRelationshipViewParamsByEntityName('MJ_BizApps_Referrals: Referral Assignments', 'ReferralRequestID')"
              [NewRecordValues]="NewRecordValues('MJ_BizApps_Referrals: Referral Assignments', 'ReferralRequestID')"
              [AllowLoad]="IsSectionExpanded('referralAssignments')"
              [ShowToolbar]="true"
              (Navigate)="OnFormNavigate($event)"
              (AfterDataLoad)="SetSectionRowCount('referralAssignments', $event.totalRowCount)">
            </mj-explorer-entity-data-grid>
          </div>
        }
      </mj-collapsible-panel>

      <!-- Conflict Check Parties Section -->
      <mj-collapsible-panel
        SectionKey="conflictCheckParties"
        SectionName="Conflict Check Parties"
        Icon="fa-solid fa-shield-halved"
        Variant="related-entity"
        [Form]="this"
        [FormContext]="formContext"
        [BadgeCount]="GetSectionRowCount('conflictCheckParties')"
        [DefaultExpanded]="false">
        @if (record.IsSaved) {
          <div>
            <mj-explorer-entity-data-grid
              [Params]="BuildRelationshipViewParamsByEntityName('MJ_BizApps_Referrals: Conflict Check Parties', 'ReferralRequestID')"
              [NewRecordValues]="NewRecordValues('MJ_BizApps_Referrals: Conflict Check Parties', 'ReferralRequestID')"
              [AllowLoad]="IsSectionExpanded('conflictCheckParties')"
              [ShowToolbar]="true"
              (Navigate)="OnFormNavigate($event)"
              (AfterDataLoad)="SetSectionRowCount('conflictCheckParties', $event.totalRowCount)">
            </mj-explorer-entity-data-grid>
          </div>
        }
      </mj-collapsible-panel>

      <!-- Referral Feedbacks Section -->
      <mj-collapsible-panel
        SectionKey="referralFeedbacks"
        SectionName="Referral Feedbacks"
        Icon="fa-solid fa-comments"
        Variant="related-entity"
        [Form]="this"
        [FormContext]="formContext"
        [BadgeCount]="GetSectionRowCount('referralFeedbacks')"
        [DefaultExpanded]="false">
        @if (record.IsSaved) {
          <div>
            <mj-explorer-entity-data-grid
              [Params]="BuildRelationshipViewParamsByEntityName('MJ_BizApps_Referrals: Referral Feedbacks', 'ReferralRequestID')"
              [NewRecordValues]="NewRecordValues('MJ_BizApps_Referrals: Referral Feedbacks', 'ReferralRequestID')"
              [AllowLoad]="IsSectionExpanded('referralFeedbacks')"
              [ShowToolbar]="true"
              (Navigate)="OnFormNavigate($event)"
              (AfterDataLoad)="SetSectionRowCount('referralFeedbacks', $event.totalRowCount)">
            </mj-explorer-entity-data-grid>
          </div>
        }
      </mj-collapsible-panel>

      <mj-form-panel-slot Entity="{{record.EntityInfo.Name}}" Slot="after-related" [Record]="record" [FormComponent]="this" [FormContext]="formContext"></mj-form-panel-slot>
    </mj-record-form-container>
  `,
})
export class ReferralRequestFormComponent extends BaseFormComponent {
  public declare record: ReferralRequestEntity;

  override async ngOnInit(): Promise<void> {
    await super.ngOnInit();
    this.initSections([
      { sectionKey: 'matterDetails', sectionName: 'Matter Details', isExpanded: true },
      { sectionKey: 'seekerDetails', sectionName: 'Seeker Details', isExpanded: true },
      { sectionKey: 'routingLifecycle', sectionName: 'Routing & Lifecycle', isExpanded: true },
      { sectionKey: 'systemMetadata', sectionName: 'System Metadata', isExpanded: false },
      { sectionKey: 'referralAssignments', sectionName: 'Referral Assignments', isExpanded: false },
      { sectionKey: 'conflictCheckParties', sectionName: 'Conflict Check Parties', isExpanded: false },
      { sectionKey: 'referralFeedbacks', sectionName: 'Referral Feedbacks', isExpanded: false },
    ]);
  }
}

/**
 * 2. Professional Profiles Left-Rail Form
 */
// Refactored to metadata-driven generated left-nav form
// @RegisterClass(BaseFormComponent, 'MJ_BizApps_Referrals: Professional Profiles')
@Component({
  standalone: false,
  selector: 'mj-referrals-professional-profile-form',
  template: `
    <mj-record-form-container [Record]="record" [FormComponent]="this"
      (Navigate)="OnFormNavigate($event)"
      (DeleteRequested)="OnDeleteRequested()"
      (FavoriteToggled)="OnFavoriteToggled()"
      (HistoryRequested)="OnHistoryRequested()"
      (ListManagementRequested)="OnListManagementRequested()">

      <mj-form-panel-slot Entity="{{record.EntityInfo.Name}}" Slot="before-fields" [Record]="record" [FormComponent]="this" [FormContext]="formContext"></mj-form-panel-slot>

      <!-- ========================================
           FIELD PANELS
           ======================================== -->
      <!-- Profile Details Section -->
      <mj-collapsible-panel
        SectionKey="profileDetails"
        SectionName="Professional Details"
        Icon="fa-solid fa-user-tie"
        [Form]="this"
        [FormContext]="formContext">
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="DisplayName"
          Type="textbox"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="FirmName"
          Type="textbox"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="Email"
          Type="textbox"
          LinkType="Email"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="Phone"
          Type="textbox"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="BarOrLicenseNumber"
          Type="textbox"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="Bio"
          Type="textarea"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="YearsExperience"
          Type="number"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="Languages"
          Type="textbox"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
      </mj-collapsible-panel>

      <!-- Status & Capacity Section -->
      <mj-collapsible-panel
        SectionKey="statusCapacity"
        SectionName="Status & Capacity"
        Icon="fa-solid fa-gauge-high"
        [Form]="this"
        [FormContext]="formContext">
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="VerificationStatus"
          Type="select"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="AvailabilityStatus"
          Type="select"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="IsActive"
          Type="checkbox"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="ActiveReferralCount"
          Type="number"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="MaxConcurrentReferrals"
          Type="number"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="AverageResponseHours"
          Type="number"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="AverageRating"
          Type="number"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="TotalAcceptedCount"
          Type="number"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="TotalCompletedCount"
          Type="number"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
      </mj-collapsible-panel>

      <!-- Fee Arrangements Section -->
      <mj-collapsible-panel
        SectionKey="feeArrangements"
        SectionName="Rates & Fee Arrangements"
        Icon="fa-solid fa-dollar-sign"
        [Form]="this"
        [FormContext]="formContext">
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="HourlyRateMin"
          Type="number"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="HourlyRateMax"
          Type="number"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="AcceptsProBono"
          Type="checkbox"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="AcceptsContingency"
          Type="checkbox"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
      </mj-collapsible-panel>

      <!-- Identity Links Section -->
      <mj-collapsible-panel
        SectionKey="identityLinks"
        SectionName="Identity & Links"
        Icon="fa-solid fa-id-badge"
        [Form]="this"
        [FormContext]="formContext">
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="PersonID"
          Type="textbox"
          LinkType="Record"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="OrganizationID"
          Type="textbox"
          LinkType="Record"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="UserID"
          Type="textbox"
          LinkType="Record"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
      </mj-collapsible-panel>

      <!-- System Metadata Section -->
      <mj-collapsible-panel
        SectionKey="systemMetadata"
        SectionName="System Metadata"
        Icon="fa-solid fa-gear"
        [Form]="this"
        [FormContext]="formContext">
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="ID"
          Type="textbox"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="__mj_CreatedAt"
          Type="datepicker"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="__mj_UpdatedAt"
          Type="datepicker"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
      </mj-collapsible-panel>

      <mj-form-panel-slot Entity="{{record.EntityInfo.Name}}" Slot="after-fields" [Record]="record" [FormComponent]="this" [FormContext]="formContext"></mj-form-panel-slot>

      <!-- ========================================
           RELATED ENTITY PANELS
           ======================================== -->
      <!-- Practice Areas Section -->
      <mj-collapsible-panel
        SectionKey="professionalPracticeAreas"
        SectionName="Practice Areas"
        Icon="fa-solid fa-briefcase"
        Variant="related-entity"
        [Form]="this"
        [FormContext]="formContext"
        [BadgeCount]="GetSectionRowCount('professionalPracticeAreas')"
        [DefaultExpanded]="false">
        @if (record.IsSaved) {
          <div>
            <mj-explorer-entity-data-grid
              [Params]="BuildRelationshipViewParamsByEntityName('MJ_BizApps_Referrals: Professional Practice Areas', 'ProfessionalProfileID')"
              [NewRecordValues]="NewRecordValues('MJ_BizApps_Referrals: Professional Practice Areas', 'ProfessionalProfileID')"
              [AllowLoad]="IsSectionExpanded('professionalPracticeAreas')"
              [ShowToolbar]="true"
              (Navigate)="OnFormNavigate($event)"
              (AfterDataLoad)="SetSectionRowCount('professionalPracticeAreas', $event.totalRowCount)">
            </mj-explorer-entity-data-grid>
          </div>
        }
      </mj-collapsible-panel>

      <!-- Jurisdictions Section -->
      <mj-collapsible-panel
        SectionKey="professionalJurisdictions"
        SectionName="Jurisdictions"
        Icon="fa-solid fa-gavel"
        Variant="related-entity"
        [Form]="this"
        [FormContext]="formContext"
        [BadgeCount]="GetSectionRowCount('professionalJurisdictions')"
        [DefaultExpanded]="false">
        @if (record.IsSaved) {
          <div>
            <mj-explorer-entity-data-grid
              [Params]="BuildRelationshipViewParamsByEntityName('MJ_BizApps_Referrals: Professional Jurisdictions', 'ProfessionalProfileID')"
              [NewRecordValues]="NewRecordValues('MJ_BizApps_Referrals: Professional Jurisdictions', 'ProfessionalProfileID')"
              [AllowLoad]="IsSectionExpanded('professionalJurisdictions')"
              [ShowToolbar]="true"
              (Navigate)="OnFormNavigate($event)"
              (AfterDataLoad)="SetSectionRowCount('professionalJurisdictions', $event.totalRowCount)">
            </mj-explorer-entity-data-grid>
          </div>
        }
      </mj-collapsible-panel>

      <!-- Referral Assignments Section -->
      <mj-collapsible-panel
        SectionKey="referralAssignments"
        SectionName="Referral Assignments"
        Icon="fa-solid fa-inbox"
        Variant="related-entity"
        [Form]="this"
        [FormContext]="formContext"
        [BadgeCount]="GetSectionRowCount('referralAssignments')"
        [DefaultExpanded]="false">
        @if (record.IsSaved) {
          <div>
            <mj-explorer-entity-data-grid
              [Params]="BuildRelationshipViewParamsByEntityName('MJ_BizApps_Referrals: Referral Assignments', 'ProfessionalProfileID')"
              [NewRecordValues]="NewRecordValues('MJ_BizApps_Referrals: Referral Assignments', 'ProfessionalProfileID')"
              [AllowLoad]="IsSectionExpanded('referralAssignments')"
              [ShowToolbar]="true"
              (Navigate)="OnFormNavigate($event)"
              (AfterDataLoad)="SetSectionRowCount('referralAssignments', $event.totalRowCount)">
            </mj-explorer-entity-data-grid>
          </div>
        }
      </mj-collapsible-panel>

      <!-- Assigned Referral Requests Section -->
      <mj-collapsible-panel
        SectionKey="assignedRequests"
        SectionName="Assigned Referral Requests"
        Icon="fa-solid fa-scale-balanced"
        Variant="related-entity"
        [Form]="this"
        [FormContext]="formContext"
        [BadgeCount]="GetSectionRowCount('assignedRequests')"
        [DefaultExpanded]="false">
        @if (record.IsSaved) {
          <div>
            <mj-explorer-entity-data-grid
              [Params]="BuildRelationshipViewParamsByEntityName('MJ_BizApps_Referrals: Referral Requests', 'AssignedProfessionalID')"
              [NewRecordValues]="NewRecordValues('MJ_BizApps_Referrals: Referral Requests', 'AssignedProfessionalID')"
              [AllowLoad]="IsSectionExpanded('assignedRequests')"
              [ShowToolbar]="true"
              (Navigate)="OnFormNavigate($event)"
              (AfterDataLoad)="SetSectionRowCount('assignedRequests', $event.totalRowCount)">
            </mj-explorer-entity-data-grid>
          </div>
        }
      </mj-collapsible-panel>

      <!-- Referral Feedbacks Section -->
      <mj-collapsible-panel
        SectionKey="referralFeedbacks"
        SectionName="Referral Feedbacks"
        Icon="fa-solid fa-star"
        Variant="related-entity"
        [Form]="this"
        [FormContext]="formContext"
        [BadgeCount]="GetSectionRowCount('referralFeedbacks')"
        [DefaultExpanded]="false">
        @if (record.IsSaved) {
          <div>
            <mj-explorer-entity-data-grid
              [Params]="BuildRelationshipViewParamsByEntityName('MJ_BizApps_Referrals: Referral Feedbacks', 'ProfessionalProfileID')"
              [NewRecordValues]="NewRecordValues('MJ_BizApps_Referrals: Referral Feedbacks', 'ProfessionalProfileID')"
              [AllowLoad]="IsSectionExpanded('referralFeedbacks')"
              [ShowToolbar]="true"
              (Navigate)="OnFormNavigate($event)"
              (AfterDataLoad)="SetSectionRowCount('referralFeedbacks', $event.totalRowCount)">
            </mj-explorer-entity-data-grid>
          </div>
        }
      </mj-collapsible-panel>

      <mj-form-panel-slot Entity="{{record.EntityInfo.Name}}" Slot="after-related" [Record]="record" [FormComponent]="this" [FormContext]="formContext"></mj-form-panel-slot>
    </mj-record-form-container>
  `,
})
export class ProfessionalProfileFormComponent extends BaseFormComponent {
  public declare record: ProfessionalProfileEntity;

  override async ngOnInit(): Promise<void> {
    await super.ngOnInit();
    this.initSections([
      { sectionKey: 'profileDetails', sectionName: 'Professional Details', isExpanded: true },
      { sectionKey: 'statusCapacity', sectionName: 'Status & Capacity', isExpanded: true },
      { sectionKey: 'feeArrangements', sectionName: 'Rates & Fee Arrangements', isExpanded: true },
      { sectionKey: 'identityLinks', sectionName: 'Identity & Links', isExpanded: false },
      { sectionKey: 'systemMetadata', sectionName: 'System Metadata', isExpanded: false },
      { sectionKey: 'professionalPracticeAreas', sectionName: 'Practice Areas', isExpanded: false },
      { sectionKey: 'professionalJurisdictions', sectionName: 'Jurisdictions', isExpanded: false },
      { sectionKey: 'referralAssignments', sectionName: 'Referral Assignments', isExpanded: false },
      { sectionKey: 'assignedRequests', sectionName: 'Assigned Referral Requests', isExpanded: false },
      { sectionKey: 'referralFeedbacks', sectionName: 'Referral Feedbacks', isExpanded: false },
    ]);
  }
}

/**
 * 3. Referral Assignments Left-Rail Form
 */
// Refactored to metadata-driven generated left-nav form
// @RegisterClass(BaseFormComponent, 'MJ_BizApps_Referrals: Referral Assignments')
@Component({
  standalone: false,
  selector: 'mj-referrals-referral-assignment-form',
  template: `
    <mj-record-form-container [Record]="record" [FormComponent]="this"
      (Navigate)="OnFormNavigate($event)"
      (DeleteRequested)="OnDeleteRequested()"
      (FavoriteToggled)="OnFavoriteToggled()"
      (HistoryRequested)="OnHistoryRequested()"
      (ListManagementRequested)="OnListManagementRequested()">

      <mj-form-panel-slot Entity="{{record.EntityInfo.Name}}" Slot="before-fields" [Record]="record" [FormComponent]="this" [FormContext]="formContext"></mj-form-panel-slot>

      <!-- Assignment Details Section -->
      <mj-collapsible-panel
        SectionKey="assignmentDetails"
        SectionName="Assignment Details"
        Icon="fa-solid fa-handshake"
        [Form]="this"
        [FormContext]="formContext">
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="ReferralRequestID"
          Type="textbox"
          LinkType="Record"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="ProfessionalProfileID"
          Type="textbox"
          LinkType="Record"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="CascadeOrder"
          Type="number"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="MatchScore"
          Type="number"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="Status"
          Type="select"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
      </mj-collapsible-panel>

      <!-- SLA & Response Section -->
      <mj-collapsible-panel
        SectionKey="slaTimeline"
        SectionName="SLA & Response Timeline"
        Icon="fa-solid fa-clock"
        [Form]="this"
        [FormContext]="formContext">
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="OfferedAt"
          Type="datepicker"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="SLADeadlineAt"
          Type="datepicker"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="RespondedAt"
          Type="datepicker"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="ResponseNotes"
          Type="textarea"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="DeclineReason"
          Type="textbox"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
      </mj-collapsible-panel>

      <!-- Conflict Screening & Scoring Section -->
      <mj-collapsible-panel
        SectionKey="conflictScoring"
        SectionName="Conflict Screening & Scoring"
        Icon="fa-solid fa-shield-halved"
        [Form]="this"
        [FormContext]="formContext">
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="ConflictStatus"
          Type="select"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="ConflictReason"
          Type="textarea"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="ScoreBreakdownJSON"
          Type="code"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
      </mj-collapsible-panel>

      <!-- System Metadata Section -->
      <mj-collapsible-panel
        SectionKey="systemMetadata"
        SectionName="System Metadata"
        Icon="fa-solid fa-gear"
        [Form]="this"
        [FormContext]="formContext">
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="ID"
          Type="textbox"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="__mj_CreatedAt"
          Type="datepicker"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="__mj_UpdatedAt"
          Type="datepicker"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
      </mj-collapsible-panel>

      <mj-form-panel-slot Entity="{{record.EntityInfo.Name}}" Slot="after-fields" [Record]="record" [FormComponent]="this" [FormContext]="formContext"></mj-form-panel-slot>

      <!-- Related Feedbacks Section -->
      <mj-collapsible-panel
        SectionKey="referralFeedbacks"
        SectionName="Referral Feedbacks"
        Icon="fa-solid fa-comment-dots"
        Variant="related-entity"
        [Form]="this"
        [FormContext]="formContext"
        [BadgeCount]="GetSectionRowCount('referralFeedbacks')"
        [DefaultExpanded]="false">
        @if (record.IsSaved) {
          <div>
            <mj-explorer-entity-data-grid
              [Params]="BuildRelationshipViewParamsByEntityName('MJ_BizApps_Referrals: Referral Feedbacks', 'ReferralAssignmentID')"
              [NewRecordValues]="NewRecordValues('MJ_BizApps_Referrals: Referral Feedbacks', 'ReferralAssignmentID')"
              [AllowLoad]="IsSectionExpanded('referralFeedbacks')"
              [ShowToolbar]="true"
              (Navigate)="OnFormNavigate($event)"
              (AfterDataLoad)="SetSectionRowCount('referralFeedbacks', $event.totalRowCount)">
            </mj-explorer-entity-data-grid>
          </div>
        }
      </mj-collapsible-panel>

      <mj-form-panel-slot Entity="{{record.EntityInfo.Name}}" Slot="after-related" [Record]="record" [FormComponent]="this" [FormContext]="formContext"></mj-form-panel-slot>
    </mj-record-form-container>
  `,
})
export class ReferralAssignmentFormComponent extends BaseFormComponent {
  public declare record: ReferralAssignmentEntity;

  override async ngOnInit(): Promise<void> {
    await super.ngOnInit();
    this.initSections([
      { sectionKey: 'assignmentDetails', sectionName: 'Assignment Details', isExpanded: true },
      { sectionKey: 'slaTimeline', sectionName: 'SLA & Response Timeline', isExpanded: true },
      { sectionKey: 'conflictScoring', sectionName: 'Conflict Screening & Scoring', isExpanded: true },
      { sectionKey: 'systemMetadata', sectionName: 'System Metadata', isExpanded: false },
      { sectionKey: 'referralFeedbacks', sectionName: 'Referral Feedbacks', isExpanded: false },
    ]);
  }
}

/**
 * 4. Conflict Check Parties Left-Rail Form
 */
// Refactored to metadata-driven generated left-nav form
// @RegisterClass(BaseFormComponent, 'MJ_BizApps_Referrals: Conflict Check Parties')
@Component({
  standalone: false,
  selector: 'mj-referrals-conflict-check-party-form',
  template: `
    <mj-record-form-container [Record]="record" [FormComponent]="this"
      (Navigate)="OnFormNavigate($event)"
      (DeleteRequested)="OnDeleteRequested()"
      (FavoriteToggled)="OnFavoriteToggled()"
      (HistoryRequested)="OnHistoryRequested()"
      (ListManagementRequested)="OnListManagementRequested()">

      <mj-form-panel-slot Entity="{{record.EntityInfo.Name}}" Slot="before-fields" [Record]="record" [FormComponent]="this" [FormContext]="formContext"></mj-form-panel-slot>

      <!-- Party Details Section -->
      <mj-collapsible-panel
        SectionKey="partyDetails"
        SectionName="Conflict Check Party Details"
        Icon="fa-solid fa-shield-halved"
        [Form]="this"
        [FormContext]="formContext">
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="ReferralRequestID"
          Type="textbox"
          LinkType="Record"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="PartyName"
          Type="textbox"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="PartyRole"
          Type="select"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="OrganizationName"
          Type="textbox"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="NormalizedName"
          Type="textbox"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="Notes"
          Type="textarea"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
      </mj-collapsible-panel>

      <!-- System Metadata Section -->
      <mj-collapsible-panel
        SectionKey="systemMetadata"
        SectionName="System Metadata"
        Icon="fa-solid fa-gear"
        [Form]="this"
        [FormContext]="formContext">
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="ID"
          Type="textbox"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="__mj_CreatedAt"
          Type="datepicker"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="__mj_UpdatedAt"
          Type="datepicker"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
      </mj-collapsible-panel>

      <mj-form-panel-slot Entity="{{record.EntityInfo.Name}}" Slot="after-fields" [Record]="record" [FormComponent]="this" [FormContext]="formContext"></mj-form-panel-slot>
      <mj-form-panel-slot Entity="{{record.EntityInfo.Name}}" Slot="after-related" [Record]="record" [FormComponent]="this" [FormContext]="formContext"></mj-form-panel-slot>
    </mj-record-form-container>
  `,
})
export class ConflictCheckPartyFormComponent extends BaseFormComponent {
  public declare record: ConflictCheckPartyEntity;

  override async ngOnInit(): Promise<void> {
    await super.ngOnInit();
    this.initSections([
      { sectionKey: 'partyDetails', sectionName: 'Conflict Check Party Details', isExpanded: true },
      { sectionKey: 'systemMetadata', sectionName: 'System Metadata', isExpanded: false },
    ]);
  }
}

/**
 * 5. Practice Areas Left-Rail Form
 */
// Refactored to metadata-driven generated left-nav form
// @RegisterClass(BaseFormComponent, 'MJ_BizApps_Referrals: Practice Areas')
@Component({
  standalone: false,
  selector: 'mj-referrals-practice-area-form',
  template: `
    <mj-record-form-container [Record]="record" [FormComponent]="this"
      (Navigate)="OnFormNavigate($event)"
      (DeleteRequested)="OnDeleteRequested()"
      (FavoriteToggled)="OnFavoriteToggled()"
      (HistoryRequested)="OnHistoryRequested()"
      (ListManagementRequested)="OnListManagementRequested()">

      <mj-form-panel-slot Entity="{{record.EntityInfo.Name}}" Slot="before-fields" [Record]="record" [FormComponent]="this" [FormContext]="formContext"></mj-form-panel-slot>

      <!-- Practice Area Details Section -->
      <mj-collapsible-panel
        SectionKey="practiceAreaDetails"
        SectionName="Practice Area Details"
        Icon="fa-solid fa-folder-open"
        [Form]="this"
        [FormContext]="formContext">
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="Name"
          Type="textbox"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="Code"
          Type="textbox"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="Category"
          Type="textbox"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="Description"
          Type="textarea"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="IconClass"
          Type="textbox"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="DisplayRank"
          Type="number"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="ParentID"
          Type="textbox"
          LinkType="Record"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="IsActive"
          Type="checkbox"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
      </mj-collapsible-panel>

      <!-- System Metadata Section -->
      <mj-collapsible-panel
        SectionKey="systemMetadata"
        SectionName="System Metadata"
        Icon="fa-solid fa-gear"
        [Form]="this"
        [FormContext]="formContext">
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="ID"
          Type="textbox"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="__mj_CreatedAt"
          Type="datepicker"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="__mj_UpdatedAt"
          Type="datepicker"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
      </mj-collapsible-panel>

      <mj-form-panel-slot Entity="{{record.EntityInfo.Name}}" Slot="after-fields" [Record]="record" [FormComponent]="this" [FormContext]="formContext"></mj-form-panel-slot>

      <!-- Sub-Practice Areas Section -->
      <mj-collapsible-panel
        SectionKey="subPracticeAreas"
        SectionName="Sub-Practice Areas"
        Icon="fa-solid fa-sitemap"
        Variant="related-entity"
        [Form]="this"
        [FormContext]="formContext"
        [BadgeCount]="GetSectionRowCount('subPracticeAreas')"
        [DefaultExpanded]="false">
        @if (record.IsSaved) {
          <div>
            <mj-explorer-entity-data-grid
              [Params]="BuildRelationshipViewParamsByEntityName('MJ_BizApps_Referrals: Practice Areas', 'ParentID')"
              [NewRecordValues]="NewRecordValues('MJ_BizApps_Referrals: Practice Areas', 'ParentID')"
              [AllowLoad]="IsSectionExpanded('subPracticeAreas')"
              [ShowToolbar]="true"
              (Navigate)="OnFormNavigate($event)"
              (AfterDataLoad)="SetSectionRowCount('subPracticeAreas', $event.totalRowCount)">
            </mj-explorer-entity-data-grid>
          </div>
        }
      </mj-collapsible-panel>

      <!-- Qualified Professionals Section -->
      <mj-collapsible-panel
        SectionKey="professionalPracticeAreas"
        SectionName="Qualified Professionals"
        Icon="fa-solid fa-user-check"
        Variant="related-entity"
        [Form]="this"
        [FormContext]="formContext"
        [BadgeCount]="GetSectionRowCount('professionalPracticeAreas')"
        [DefaultExpanded]="false">
        @if (record.IsSaved) {
          <div>
            <mj-explorer-entity-data-grid
              [Params]="BuildRelationshipViewParamsByEntityName('MJ_BizApps_Referrals: Professional Practice Areas', 'PracticeAreaID')"
              [NewRecordValues]="NewRecordValues('MJ_BizApps_Referrals: Professional Practice Areas', 'PracticeAreaID')"
              [AllowLoad]="IsSectionExpanded('professionalPracticeAreas')"
              [ShowToolbar]="true"
              (Navigate)="OnFormNavigate($event)"
              (AfterDataLoad)="SetSectionRowCount('professionalPracticeAreas', $event.totalRowCount)">
            </mj-explorer-entity-data-grid>
          </div>
        }
      </mj-collapsible-panel>

      <!-- Referral Requests Section -->
      <mj-collapsible-panel
        SectionKey="referralRequests"
        SectionName="Referral Requests"
        Icon="fa-solid fa-scale-balanced"
        Variant="related-entity"
        [Form]="this"
        [FormContext]="formContext"
        [BadgeCount]="GetSectionRowCount('referralRequests')"
        [DefaultExpanded]="false">
        @if (record.IsSaved) {
          <div>
            <mj-explorer-entity-data-grid
              [Params]="BuildRelationshipViewParamsByEntityName('MJ_BizApps_Referrals: Referral Requests', 'PracticeAreaID')"
              [NewRecordValues]="NewRecordValues('MJ_BizApps_Referrals: Referral Requests', 'PracticeAreaID')"
              [AllowLoad]="IsSectionExpanded('referralRequests')"
              [ShowToolbar]="true"
              (Navigate)="OnFormNavigate($event)"
              (AfterDataLoad)="SetSectionRowCount('referralRequests', $event.totalRowCount)">
            </mj-explorer-entity-data-grid>
          </div>
        }
      </mj-collapsible-panel>

      <mj-form-panel-slot Entity="{{record.EntityInfo.Name}}" Slot="after-related" [Record]="record" [FormComponent]="this" [FormContext]="formContext"></mj-form-panel-slot>
    </mj-record-form-container>
  `,
})
export class PracticeAreaFormComponent extends BaseFormComponent {
  public declare record: PracticeAreaEntity;

  override async ngOnInit(): Promise<void> {
    await super.ngOnInit();
    this.initSections([
      { sectionKey: 'practiceAreaDetails', sectionName: 'Practice Area Details', isExpanded: true },
      { sectionKey: 'systemMetadata', sectionName: 'System Metadata', isExpanded: false },
      { sectionKey: 'subPracticeAreas', sectionName: 'Sub-Practice Areas', isExpanded: false },
      { sectionKey: 'professionalPracticeAreas', sectionName: 'Qualified Professionals', isExpanded: false },
      { sectionKey: 'referralRequests', sectionName: 'Referral Requests', isExpanded: false },
    ]);
  }
}

/**
 * 6. Jurisdictions Left-Rail Form
 */
// Refactored to metadata-driven generated left-nav form
// @RegisterClass(BaseFormComponent, 'MJ_BizApps_Referrals: Jurisdictions')
@Component({
  standalone: false,
  selector: 'mj-referrals-jurisdiction-form',
  template: `
    <mj-record-form-container [Record]="record" [FormComponent]="this"
      (Navigate)="OnFormNavigate($event)"
      (DeleteRequested)="OnDeleteRequested()"
      (FavoriteToggled)="OnFavoriteToggled()"
      (HistoryRequested)="OnHistoryRequested()"
      (ListManagementRequested)="OnListManagementRequested()">

      <mj-form-panel-slot Entity="{{record.EntityInfo.Name}}" Slot="before-fields" [Record]="record" [FormComponent]="this" [FormContext]="formContext"></mj-form-panel-slot>

      <!-- Jurisdiction Details Section -->
      <mj-collapsible-panel
        SectionKey="jurisdictionDetails"
        SectionName="Jurisdiction Details"
        Icon="fa-solid fa-map-location-dot"
        [Form]="this"
        [FormContext]="formContext">
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="Name"
          Type="textbox"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="Code"
          Type="textbox"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="JurisdictionType"
          Type="select"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="CountryCode"
          Type="textbox"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="StateProvinceCode"
          Type="textbox"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="ParentID"
          Type="textbox"
          LinkType="Record"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="IsActive"
          Type="checkbox"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
      </mj-collapsible-panel>

      <!-- System Metadata Section -->
      <mj-collapsible-panel
        SectionKey="systemMetadata"
        SectionName="System Metadata"
        Icon="fa-solid fa-gear"
        [Form]="this"
        [FormContext]="formContext">
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="ID"
          Type="textbox"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="__mj_CreatedAt"
          Type="datepicker"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="__mj_UpdatedAt"
          Type="datepicker"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
      </mj-collapsible-panel>

      <mj-form-panel-slot Entity="{{record.EntityInfo.Name}}" Slot="after-fields" [Record]="record" [FormComponent]="this" [FormContext]="formContext"></mj-form-panel-slot>

      <!-- Sub-Jurisdictions Section -->
      <mj-collapsible-panel
        SectionKey="subJurisdictions"
        SectionName="Sub-Jurisdictions"
        Icon="fa-solid fa-sitemap"
        Variant="related-entity"
        [Form]="this"
        [FormContext]="formContext"
        [BadgeCount]="GetSectionRowCount('subJurisdictions')"
        [DefaultExpanded]="false">
        @if (record.IsSaved) {
          <div>
            <mj-explorer-entity-data-grid
              [Params]="BuildRelationshipViewParamsByEntityName('MJ_BizApps_Referrals: Jurisdictions', 'ParentID')"
              [NewRecordValues]="NewRecordValues('MJ_BizApps_Referrals: Jurisdictions', 'ParentID')"
              [AllowLoad]="IsSectionExpanded('subJurisdictions')"
              [ShowToolbar]="true"
              (Navigate)="OnFormNavigate($event)"
              (AfterDataLoad)="SetSectionRowCount('subJurisdictions', $event.totalRowCount)">
            </mj-explorer-entity-data-grid>
          </div>
        }
      </mj-collapsible-panel>

      <!-- Admitted Professionals Section -->
      <mj-collapsible-panel
        SectionKey="professionalJurisdictions"
        SectionName="Admitted Professionals"
        Icon="fa-solid fa-user-shield"
        Variant="related-entity"
        [Form]="this"
        [FormContext]="formContext"
        [BadgeCount]="GetSectionRowCount('professionalJurisdictions')"
        [DefaultExpanded]="false">
        @if (record.IsSaved) {
          <div>
            <mj-explorer-entity-data-grid
              [Params]="BuildRelationshipViewParamsByEntityName('MJ_BizApps_Referrals: Professional Jurisdictions', 'JurisdictionID')"
              [NewRecordValues]="NewRecordValues('MJ_BizApps_Referrals: Professional Jurisdictions', 'JurisdictionID')"
              [AllowLoad]="IsSectionExpanded('professionalJurisdictions')"
              [ShowToolbar]="true"
              (Navigate)="OnFormNavigate($event)"
              (AfterDataLoad)="SetSectionRowCount('professionalJurisdictions', $event.totalRowCount)">
            </mj-explorer-entity-data-grid>
          </div>
        }
      </mj-collapsible-panel>

      <!-- Referral Requests Section -->
      <mj-collapsible-panel
        SectionKey="referralRequests"
        SectionName="Referral Requests"
        Icon="fa-solid fa-scale-balanced"
        Variant="related-entity"
        [Form]="this"
        [FormContext]="formContext"
        [BadgeCount]="GetSectionRowCount('referralRequests')"
        [DefaultExpanded]="false">
        @if (record.IsSaved) {
          <div>
            <mj-explorer-entity-data-grid
              [Params]="BuildRelationshipViewParamsByEntityName('MJ_BizApps_Referrals: Referral Requests', 'JurisdictionID')"
              [NewRecordValues]="NewRecordValues('MJ_BizApps_Referrals: Referral Requests', 'JurisdictionID')"
              [AllowLoad]="IsSectionExpanded('referralRequests')"
              [ShowToolbar]="true"
              (Navigate)="OnFormNavigate($event)"
              (AfterDataLoad)="SetSectionRowCount('referralRequests', $event.totalRowCount)">
            </mj-explorer-entity-data-grid>
          </div>
        }
      </mj-collapsible-panel>

      <mj-form-panel-slot Entity="{{record.EntityInfo.Name}}" Slot="after-related" [Record]="record" [FormComponent]="this" [FormContext]="formContext"></mj-form-panel-slot>
    </mj-record-form-container>
  `,
})
export class JurisdictionFormComponent extends BaseFormComponent {
  public declare record: JurisdictionEntity;

  override async ngOnInit(): Promise<void> {
    await super.ngOnInit();
    this.initSections([
      { sectionKey: 'jurisdictionDetails', sectionName: 'Jurisdiction Details', isExpanded: true },
      { sectionKey: 'systemMetadata', sectionName: 'System Metadata', isExpanded: false },
      { sectionKey: 'subJurisdictions', sectionName: 'Sub-Jurisdictions', isExpanded: false },
      { sectionKey: 'professionalJurisdictions', sectionName: 'Admitted Professionals', isExpanded: false },
      { sectionKey: 'referralRequests', sectionName: 'Referral Requests', isExpanded: false },
    ]);
  }
}

/**
 * 7. Referral Tiers Left-Rail Form
 */
// Refactored to metadata-driven generated left-nav form
// @RegisterClass(BaseFormComponent, 'MJ_BizApps_Referrals: Referral Tiers')
@Component({
  standalone: false,
  selector: 'mj-referrals-referral-tier-form',
  template: `
    <mj-record-form-container [Record]="record" [FormComponent]="this"
      (Navigate)="OnFormNavigate($event)"
      (DeleteRequested)="OnDeleteRequested()"
      (FavoriteToggled)="OnFavoriteToggled()"
      (HistoryRequested)="OnHistoryRequested()"
      (ListManagementRequested)="OnListManagementRequested()">

      <mj-form-panel-slot Entity="{{record.EntityInfo.Name}}" Slot="before-fields" [Record]="record" [FormComponent]="this" [FormContext]="formContext"></mj-form-panel-slot>

      <!-- Referral Tier Details Section -->
      <mj-collapsible-panel
        SectionKey="tierDetails"
        SectionName="Referral Tier Details"
        Icon="fa-solid fa-layer-group"
        [Form]="this"
        [FormContext]="formContext">
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="Name"
          Type="textbox"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="Code"
          Type="textbox"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="SLAResponseHours"
          Type="number"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="MaxCascadeAttempts"
          Type="number"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="PriorityWeight"
          Type="number"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="RequireConflictCheck"
          Type="checkbox"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="Description"
          Type="textarea"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="IsActive"
          Type="checkbox"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
      </mj-collapsible-panel>

      <!-- System Metadata Section -->
      <mj-collapsible-panel
        SectionKey="systemMetadata"
        SectionName="System Metadata"
        Icon="fa-solid fa-gear"
        [Form]="this"
        [FormContext]="formContext">
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="ID"
          Type="textbox"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="__mj_CreatedAt"
          Type="datepicker"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="__mj_UpdatedAt"
          Type="datepicker"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
      </mj-collapsible-panel>

      <mj-form-panel-slot Entity="{{record.EntityInfo.Name}}" Slot="after-fields" [Record]="record" [FormComponent]="this" [FormContext]="formContext"></mj-form-panel-slot>

      <!-- Referral Requests Section -->
      <mj-collapsible-panel
        SectionKey="referralRequests"
        SectionName="Referral Requests"
        Icon="fa-solid fa-scale-balanced"
        Variant="related-entity"
        [Form]="this"
        [FormContext]="formContext"
        [BadgeCount]="GetSectionRowCount('referralRequests')"
        [DefaultExpanded]="false">
        @if (record.IsSaved) {
          <div>
            <mj-explorer-entity-data-grid
              [Params]="BuildRelationshipViewParamsByEntityName('MJ_BizApps_Referrals: Referral Requests', 'ReferralTierID')"
              [NewRecordValues]="NewRecordValues('MJ_BizApps_Referrals: Referral Requests', 'ReferralTierID')"
              [AllowLoad]="IsSectionExpanded('referralRequests')"
              [ShowToolbar]="true"
              (Navigate)="OnFormNavigate($event)"
              (AfterDataLoad)="SetSectionRowCount('referralRequests', $event.totalRowCount)">
            </mj-explorer-entity-data-grid>
          </div>
        }
      </mj-collapsible-panel>

      <mj-form-panel-slot Entity="{{record.EntityInfo.Name}}" Slot="after-related" [Record]="record" [FormComponent]="this" [FormContext]="formContext"></mj-form-panel-slot>
    </mj-record-form-container>
  `,
})
export class ReferralTierFormComponent extends BaseFormComponent {
  public declare record: ReferralTierEntity;

  override async ngOnInit(): Promise<void> {
    await super.ngOnInit();
    this.initSections([
      { sectionKey: 'tierDetails', sectionName: 'Referral Tier Details', isExpanded: true },
      { sectionKey: 'systemMetadata', sectionName: 'System Metadata', isExpanded: false },
      { sectionKey: 'referralRequests', sectionName: 'Referral Requests', isExpanded: false },
    ]);
  }
}

/**
 * 8. Professional Practice Areas Left-Rail Form
 */
// Refactored to metadata-driven generated left-nav form
// @RegisterClass(BaseFormComponent, 'MJ_BizApps_Referrals: Professional Practice Areas')
@Component({
  standalone: false,
  selector: 'mj-referrals-professional-practice-area-form',
  template: `
    <mj-record-form-container [Record]="record" [FormComponent]="this"
      (Navigate)="OnFormNavigate($event)"
      (DeleteRequested)="OnDeleteRequested()"
      (FavoriteToggled)="OnFavoriteToggled()"
      (HistoryRequested)="OnHistoryRequested()"
      (ListManagementRequested)="OnListManagementRequested()">

      <mj-form-panel-slot Entity="{{record.EntityInfo.Name}}" Slot="before-fields" [Record]="record" [FormComponent]="this" [FormContext]="formContext"></mj-form-panel-slot>

      <!-- Practice Area Details Section -->
      <mj-collapsible-panel
        SectionKey="practiceAreaLink"
        SectionName="Professional Practice Area"
        Icon="fa-solid fa-briefcase"
        [Form]="this"
        [FormContext]="formContext">
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="ProfessionalProfileID"
          Type="textbox"
          LinkType="Record"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="PracticeAreaID"
          Type="textbox"
          LinkType="Record"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="ProficiencyLevel"
          Type="select"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="YearsInPractice"
          Type="number"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="IsPrimary"
          Type="checkbox"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
      </mj-collapsible-panel>

      <!-- System Metadata Section -->
      <mj-collapsible-panel
        SectionKey="systemMetadata"
        SectionName="System Metadata"
        Icon="fa-solid fa-gear"
        [Form]="this"
        [FormContext]="formContext">
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="ID"
          Type="textbox"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="__mj_CreatedAt"
          Type="datepicker"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="__mj_UpdatedAt"
          Type="datepicker"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
      </mj-collapsible-panel>

      <mj-form-panel-slot Entity="{{record.EntityInfo.Name}}" Slot="after-fields" [Record]="record" [FormComponent]="this" [FormContext]="formContext"></mj-form-panel-slot>
      <mj-form-panel-slot Entity="{{record.EntityInfo.Name}}" Slot="after-related" [Record]="record" [FormComponent]="this" [FormContext]="formContext"></mj-form-panel-slot>
    </mj-record-form-container>
  `,
})
export class ProfessionalPracticeAreaFormComponent extends BaseFormComponent {
  public declare record: ProfessionalPracticeAreaEntity;

  override async ngOnInit(): Promise<void> {
    await super.ngOnInit();
    this.initSections([
      { sectionKey: 'practiceAreaLink', sectionName: 'Professional Practice Area', isExpanded: true },
      { sectionKey: 'systemMetadata', sectionName: 'System Metadata', isExpanded: false },
    ]);
  }
}

/**
 * 9. Professional Jurisdictions Left-Rail Form
 */
// Refactored to metadata-driven generated left-nav form
// @RegisterClass(BaseFormComponent, 'MJ_BizApps_Referrals: Professional Jurisdictions')
@Component({
  standalone: false,
  selector: 'mj-referrals-professional-jurisdiction-form',
  template: `
    <mj-record-form-container [Record]="record" [FormComponent]="this"
      (Navigate)="OnFormNavigate($event)"
      (DeleteRequested)="OnDeleteRequested()"
      (FavoriteToggled)="OnFavoriteToggled()"
      (HistoryRequested)="OnHistoryRequested()"
      (ListManagementRequested)="OnListManagementRequested()">

      <mj-form-panel-slot Entity="{{record.EntityInfo.Name}}" Slot="before-fields" [Record]="record" [FormComponent]="this" [FormContext]="formContext"></mj-form-panel-slot>

      <!-- Jurisdiction Link Section -->
      <mj-collapsible-panel
        SectionKey="jurisdictionLink"
        SectionName="Professional Jurisdiction"
        Icon="fa-solid fa-gavel"
        [Form]="this"
        [FormContext]="formContext">
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="ProfessionalProfileID"
          Type="textbox"
          LinkType="Record"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="JurisdictionID"
          Type="textbox"
          LinkType="Record"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="LicenseNumber"
          Type="textbox"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="AdmissionYear"
          Type="number"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="StandingStatus"
          Type="select"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="IsPrimary"
          Type="checkbox"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
      </mj-collapsible-panel>

      <!-- System Metadata Section -->
      <mj-collapsible-panel
        SectionKey="systemMetadata"
        SectionName="System Metadata"
        Icon="fa-solid fa-gear"
        [Form]="this"
        [FormContext]="formContext">
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="ID"
          Type="textbox"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="__mj_CreatedAt"
          Type="datepicker"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="__mj_UpdatedAt"
          Type="datepicker"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
      </mj-collapsible-panel>

      <mj-form-panel-slot Entity="{{record.EntityInfo.Name}}" Slot="after-fields" [Record]="record" [FormComponent]="this" [FormContext]="formContext"></mj-form-panel-slot>
      <mj-form-panel-slot Entity="{{record.EntityInfo.Name}}" Slot="after-related" [Record]="record" [FormComponent]="this" [FormContext]="formContext"></mj-form-panel-slot>
    </mj-record-form-container>
  `,
})
export class ProfessionalJurisdictionFormComponent extends BaseFormComponent {
  public declare record: ProfessionalJurisdictionEntity;

  override async ngOnInit(): Promise<void> {
    await super.ngOnInit();
    this.initSections([
      { sectionKey: 'jurisdictionLink', sectionName: 'Professional Jurisdiction', isExpanded: true },
      { sectionKey: 'systemMetadata', sectionName: 'System Metadata', isExpanded: false },
    ]);
  }
}

/**
 * 10. Referral Feedbacks Left-Rail Form
 */
// Refactored to metadata-driven generated left-nav form
// @RegisterClass(BaseFormComponent, 'MJ_BizApps_Referrals: Referral Feedbacks')
@Component({
  standalone: false,
  selector: 'mj-referrals-referral-feedback-form',
  template: `
    <mj-record-form-container [Record]="record" [FormComponent]="this"
      (Navigate)="OnFormNavigate($event)"
      (DeleteRequested)="OnDeleteRequested()"
      (FavoriteToggled)="OnFavoriteToggled()"
      (HistoryRequested)="OnHistoryRequested()"
      (ListManagementRequested)="OnListManagementRequested()">

      <mj-form-panel-slot Entity="{{record.EntityInfo.Name}}" Slot="before-fields" [Record]="record" [FormComponent]="this" [FormContext]="formContext"></mj-form-panel-slot>

      <!-- Feedback Details Section -->
      <mj-collapsible-panel
        SectionKey="feedbackDetails"
        SectionName="Referral Feedback Details"
        Icon="fa-solid fa-comment-dots"
        [Form]="this"
        [FormContext]="formContext">
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="ReferralRequestID"
          Type="textbox"
          LinkType="Record"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="ReferralAssignmentID"
          Type="textbox"
          LinkType="Record"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="ProfessionalProfileID"
          Type="textbox"
          LinkType="Record"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="SubmittedByType"
          Type="select"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="Rating"
          Type="number"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="OutcomeStatus"
          Type="select"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="Comments"
          Type="textarea"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="SubmittedAt"
          Type="datepicker"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
      </mj-collapsible-panel>

      <!-- System Metadata Section -->
      <mj-collapsible-panel
        SectionKey="systemMetadata"
        SectionName="System Metadata"
        Icon="fa-solid fa-gear"
        [Form]="this"
        [FormContext]="formContext">
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="ID"
          Type="textbox"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="__mj_CreatedAt"
          Type="datepicker"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
        <mj-form-field
          [Record]="record"
          [ShowLabel]="true"
          FieldName="__mj_UpdatedAt"
          Type="datepicker"
          [EditMode]="EditMode"
          [FormContext]="formContext">
        </mj-form-field>
      </mj-collapsible-panel>

      <mj-form-panel-slot Entity="{{record.EntityInfo.Name}}" Slot="after-fields" [Record]="record" [FormComponent]="this" [FormContext]="formContext"></mj-form-panel-slot>
      <mj-form-panel-slot Entity="{{record.EntityInfo.Name}}" Slot="after-related" [Record]="record" [FormComponent]="this" [FormContext]="formContext"></mj-form-panel-slot>
    </mj-record-form-container>
  `,
})
export class ReferralFeedbackFormComponent extends BaseFormComponent {
  public declare record: ReferralFeedbackEntity;

  override async ngOnInit(): Promise<void> {
    await super.ngOnInit();
    this.initSections([
      { sectionKey: 'feedbackDetails', sectionName: 'Referral Feedback Details', isExpanded: true },
      { sectionKey: 'systemMetadata', sectionName: 'System Metadata', isExpanded: false },
    ]);
  }
}

export const REFERRALS_ENTITY_FORM_COMPONENTS = [
  ReferralRequestFormComponent,
  ProfessionalProfileFormComponent,
  ReferralAssignmentFormComponent,
  ConflictCheckPartyFormComponent,
  PracticeAreaFormComponent,
  JurisdictionFormComponent,
  ReferralTierFormComponent,
  ProfessionalPracticeAreaFormComponent,
  ProfessionalJurisdictionFormComponent,
  ReferralFeedbackFormComponent,
];
