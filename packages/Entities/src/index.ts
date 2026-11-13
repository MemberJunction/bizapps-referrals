export * from './generated/entity_subclasses.js';
export {
  mjBizAppsReferralsPracticeAreaEntity as PracticeAreaEntity,
  mjBizAppsReferralsJurisdictionEntity as JurisdictionEntity,
  mjBizAppsReferralsReferralTierEntity as ReferralTierEntity,
  mjBizAppsReferralsProfessionalProfileEntity as ProfessionalProfileEntity,
  mjBizAppsReferralsProfessionalPracticeAreaEntity as ProfessionalPracticeAreaEntity,
  mjBizAppsReferralsProfessionalJurisdictionEntity as ProfessionalJurisdictionEntity,
  mjBizAppsReferralsReferralRequestEntity as ReferralRequestEntity,
  mjBizAppsReferralsConflictCheckPartyEntity as ConflictCheckPartyEntity,
  mjBizAppsReferralsReferralAssignmentEntity as ReferralAssignmentEntity,
  mjBizAppsReferralsReferralFeedbackEntity as ReferralFeedbackEntity,
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
  BarOrLicenseNumber: z.string().max(100).nullable().optional(),
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
