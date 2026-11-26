export * from './generated/entity_subclasses.js';
export {
  ReferralsEngineBase,
  REFERRALS_ENGINE_ENTITY_NAMES,
} from './ReferralsEngineBase.js';
export {
  mjBizAppsReferralsPracticeAreaEntity as PracticeAreaEntity,
  mjBizAppsReferralsJurisdictionEntity as JurisdictionEntity,
  mjBizAppsReferralsReferralTierEntity as ReferralTierEntity,
  mjBizAppsReferralsProfessionalProfileEntity as ProfessionalProfileEntity,
  mjBizAppsReferralsProfessionalCredentialEntity as ProfessionalCredentialEntity,
  mjBizAppsReferralsProfessionalPracticeAreaEntity as ProfessionalPracticeAreaEntity,
  mjBizAppsReferralsProfessionalJurisdictionEntity as ProfessionalJurisdictionEntity,
  mjBizAppsReferralsReferralRequestEntity as ReferralRequestEntity,
  mjBizAppsReferralsConflictCheckPartyEntity as ConflictCheckPartyEntity,
  mjBizAppsReferralsReferralAssignmentEntity as ReferralAssignmentEntity,
  mjBizAppsReferralsReferralFeedbackEntity as ReferralFeedbackEntity,
  mjBizAppsReferralsReferralEscalationEntity as ReferralEscalationEntity,
  mjBizAppsReferralsReferralOutcomeEntity as ReferralOutcomeEntity,
  mjBizAppsReferralsProfessionalAvailabilityWindowEntity as ProfessionalAvailabilityWindowEntity,
  mjBizAppsReferralsReciprocitySnapshotEntity as ReciprocitySnapshotEntity,
} from './generated/entity_subclasses.js';

import { z } from 'zod';

export const ReferralRequestCreateSchema = z.object({
  SeekerName: z.string().min(1).max(200),
  SeekerEmail: z.string().email().max(255),
  SeekerPhone: z.string().max(50).nullable().optional(),
  SeekerCompany: z.string().max(200).nullable().optional(),
  PracticeAreaID: z.string().uuid(),
  JurisdictionID: z.string().uuid(),
  ReferralTierID: z.string().uuid(),
  MatterTitle: z.string().min(3).max(255),
  MatterSummary: z.string().min(10),
  UrgencyLevel: z.enum(['Low', 'Standard', 'High', 'Urgent']).default('Standard'),
  BudgetRange: z.string().max(100).nullable().optional(),
  PreferredLanguage: z.string().max(100).default('English'),
  RequiresProBono: z.boolean().default(false),
});

export const ProfessionalProfileCreateSchema = z.object({
  DisplayName: z.string().min(1).max(200),
  FirmName: z.string().max(200).nullable().optional(),
  Email: z.string().email().max(255),
  Phone: z.string().max(50).nullable().optional(),
  LicenseNumber: z.string().max(100).nullable().optional(),
  VerificationStatus: z.enum(['Pending', 'Verified', 'Suspended', 'Expired']).default('Pending'),
  AvailabilityStatus: z.enum(['Available', 'Limited', 'Unavailable', 'OnLeave']).default('Available'),
  YearsExperience: z.number().int().min(0).default(0),
  Languages: z.string().max(255).default('English'),
  AcceptsProBono: z.boolean().default(false),
  AcceptsContingency: z.boolean().default(false),
  MaxConcurrentReferrals: z.number().int().min(1).default(10),
});

export type ReferralRequestCreateInput = z.infer<typeof ReferralRequestCreateSchema>;
export type ProfessionalProfileCreateInput = z.infer<typeof ProfessionalProfileCreateSchema>;


export const ProfessionalCredentialCreateSchema = z.object({
  ProfessionalProfileID: z.string().uuid(),
  JurisdictionID: z.string().uuid().nullable().optional(),
  CredentialCode: z.string().min(1).max(100),
  CredentialName: z.string().min(1).max(255),
  IssuerName: z.string().max(255).nullable().optional(),
  ProviderKey: z.string().min(1).max(100).default('Manual'),
  ExternalReferenceID: z.string().max(255).nullable().optional(),
  VerificationStatus: z.enum(['Pending', 'Verified', 'Rejected', 'Expired', 'Revoked']).default('Pending'),
  IssuedAt: z.coerce.date().nullable().optional(),
  ExpiresAt: z.coerce.date().nullable().optional(),
  VerifiedAt: z.coerce.date().nullable().optional(),
  VerifiedByPersonID: z.string().uuid().nullable().optional(),
  EvidenceURL: z.string().max(1000).nullable().optional(),
  MetadataJSON: z.string().nullable().optional(),
  IsPrimary: z.boolean().default(false),
});

export type ProfessionalCredentialCreateInput = z.infer<typeof ProfessionalCredentialCreateSchema>;
