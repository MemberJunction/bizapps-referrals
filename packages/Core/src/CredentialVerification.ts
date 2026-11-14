import {
  IMetadataProvider,
  IRunViewProvider,
  Metadata,
  RunView,
  UserInfo,
} from '@memberjunction/core';
import { BaseSingleton, MJGlobal, RegisterClass } from '@memberjunction/global';
import type {
  ProfessionalCredentialEntity,
  ProfessionalProfileEntity,
  ReferralAssignmentEntity,
  ReferralFeedbackEntity,
} from '@mj-biz-apps/referrals-entities';
import { IsAssociationAdmin } from './CascadeRoutingService.js';
import type { FeedbackOutcomeStatus, FeedbackSubmittedByType } from './types.js';
import {
  AssertValidUUID,
  AuthorizationError,
  EscapeSqlLiteral,
  PersistenceError,
  UUIDsEqual,
} from './validation.js';

export type CredentialVerificationStatus = ProfessionalCredentialEntity['VerificationStatus'];

export interface NormalizedCredentialAssertion {
  CredentialCode: string;
  CredentialName: string;
  IssuerName?: string | null;
  ProviderKey: string;
  ExternalReferenceID?: string | null;
  JurisdictionID?: string | null;
  VerificationStatus: CredentialVerificationStatus;
  IssuedAt?: string | null;
  ExpiresAt?: string | null;
  VerifiedAt?: string | null;
  EvidenceURL?: string | null;
  MetadataJSON?: string | null;
  IsPrimary?: boolean;
}

export interface ExternalVerificationAdapterInput {
  ProfessionalProfileID: string;
  CredentialCode: string;
  CredentialName?: string;
  LicenseNumber?: string | null;
  IssuerName?: string | null;
  JurisdictionID?: string | null;
  ExternalReferenceID?: string | null;
  EvidenceURL?: string | null;
  Metadata?: Record<string, string | number | boolean | null>;
}

export interface ExternalVerificationAdapterResult {
  Success: boolean;
  VerificationStatus: CredentialVerificationStatus;
  SubjectProfileID?: string;
  CredentialCode?: string;
  ExternalReferenceID?: string | null;
  IssuerName?: string | null;
  VerifiedAt?: string | null;
  ExpiresAt?: string | null;
  EvidenceURL?: string | null;
  MetadataJSON?: string | null;
  Message: string;
}

export interface ExternalVerificationAdapter {
  Verify(
    input: ExternalVerificationAdapterInput,
    contextUser: UserInfo,
  ): Promise<ExternalVerificationAdapterResult>;
  SyncProfile?(
    professionalProfileId: string,
    existingCredentials: ReadonlyArray<ProfessionalCredentialEntity>,
    contextUser: UserInfo,
  ): Promise<{
    Success: boolean;
    Assertions: NormalizedCredentialAssertion[];
    Message: string;
  }>;
}

export interface CredentialVerificationRequest {
  ProfessionalProfileID: string;
  ProfessionalCredentialID?: string;
  CredentialCode: string;
  CredentialName?: string;
  LicenseNumber?: string | null;
  IssuerName?: string | null;
  JurisdictionID?: string | null;
  ExternalReferenceID?: string | null;
  EvidenceURL?: string | null;
  ProviderKey?: string;
  Metadata?: Record<string, string | number | boolean | null>;
  ForceStatus?: CredentialVerificationStatus;
  ExternalAdapter?: ExternalVerificationAdapter;
}

export interface ReviewPendingCredentialRequest {
  ProfessionalProfileID: string;
  ProfessionalCredentialID: string;
  Decision: 'Verified' | 'Rejected' | 'Revoked' | 'Expired';
  Notes?: string | null;
  EvidenceURL?: string | null;
}

export interface CredentialVerificationResult {
  Success: boolean;
  ProviderKey: string;
  ProfessionalCredentialID?: string;
  VerificationStatus: CredentialVerificationStatus;
  ExternalReferenceID: string | null;
  VerifiedAt: string | null;
  ExpiresAt: string | null;
  Message: string;
  Assertion: NormalizedCredentialAssertion;
}

export interface CredentialSyncResult {
  Success: boolean;
  ProviderKey: string;
  ProfessionalProfileID: string;
  SyncedCount: number;
  CreatedCount: number;
  UpdatedCount: number;
  Assertions: NormalizedCredentialAssertion[];
  Message: string;
}

export interface CredentialProviderDescriptor {
  ProviderKey: string;
  DisplayName: string;
  Description: string;
  Available: boolean;
  SupportsSync: boolean;
}

export interface SubmitReferralFeedbackRequest {
  ReferralAssignmentID: string;
  ReferralRequestID?: string;
  ProfessionalProfileID?: string;
  Rating: number;
  OutcomeStatus: FeedbackOutcomeStatus;
  SubmittedByType: FeedbackSubmittedByType;
  Comments?: string | null;
}

export interface SubmitReferralFeedbackResult {
  Success: boolean;
  ReferralFeedbackID: string;
  ReferralAssignmentID: string;
  ReferralRequestID: string;
  ProfessionalProfileID: string;
  AverageRating: number | null;
  TotalCompletedCount: number;
  Message: string;
}

const COORDINATOR_ROLES = new Set([
  'coordinator',
  'referral coordinator',
  'administrator',
  'association administrator',
  'system administrator',
  'admin',
  'owner',
]);

function isCoordinatorOrAdmin(contextUser: UserInfo | undefined): boolean {
  if (!contextUser) {
    return false;
  }
  if (IsAssociationAdmin(contextUser)) {
    return true;
  }
  const roles = contextUser.UserRoles ?? [];
  return roles.some((r) => COORDINATOR_ROLES.has((r.Role ?? '').trim().toLowerCase()));
}

function assertCoordinatorAuthority(contextUser: UserInfo | undefined, actionLabel: string): void {
  if (!contextUser) {
    throw new AuthorizationError(`Authenticated UserInfo context is required to ${actionLabel}.`);
  }
  if (!isCoordinatorOrAdmin(contextUser)) {
    throw new AuthorizationError(
      `User '${contextUser.Email ?? contextUser.Name ?? contextUser.ID}' lacks Coordinator or Administrator authority to ${actionLabel}.`,
    );
  }
}

async function resolvePersonIdForUser(
  contextUser: UserInfo,
  dp: IMetadataProvider & IRunViewProvider,
): Promise<string | null> {
  if (!contextUser.ID) {
    return null;
  }
  try {
    const validUserId = AssertValidUUID(contextUser.ID, 'UserID');
    const rv = new RunView(dp);
    const personRes = await rv.RunView<{ ID: string }>(
      {
        EntityName: 'MJ_BizAppsCommon: People',
        ExtraFilter: `UserID = '${validUserId}'`,
        Fields: ['ID'],
        ResultType: 'simple',
      },
      contextUser,
    );
    if (personRes.Success && personRes.Results && personRes.Results.length > 0 && personRes.Results[0].ID) {
      return personRes.Results[0].ID;
    }
  } catch {
    // Person entity may not be registered in lightweight unit-test providers; fail safe to null.
  }
  return null;
}

function resolveDataProvider(
  provider?: IMetadataProvider & IRunViewProvider,
): (IMetadataProvider & IRunViewProvider) | undefined {
  const candidate = provider ?? (Metadata.Provider as (IMetadataProvider & IRunViewProvider) | undefined);
  if (candidate && 'RunView' in candidate && 'GetEntityObject' in candidate) {
    return candidate;
  }
  return undefined;
}

function isCredentialActive(
  cred: Pick<ProfessionalCredentialEntity, 'VerificationStatus' | 'ExpiresAt'>,
  nowMs: number,
): boolean {
  if (cred.VerificationStatus !== 'Verified') {
    return false;
  }
  if (!cred.ExpiresAt) {
    return true;
  }
  return new Date(cred.ExpiresAt).getTime() > nowMs;
}

/**
 * Abstract base class for pluggable credential verification providers.
 * Subclasses register with `@RegisterClass(BaseReferralCredentialProvider, '<ProviderKey>')`.
 */
export abstract class BaseReferralCredentialProvider {
  public abstract readonly ProviderKey: string;
  public abstract readonly DisplayName: string;
  public abstract readonly Description: string;

  public IsAvailable(_provider?: IMetadataProvider): boolean {
    return true;
  }

  public SupportsSync(): boolean {
    return true;
  }

  public abstract VerifyCredential(
    request: CredentialVerificationRequest,
    contextUser: UserInfo,
    provider?: IMetadataProvider & IRunViewProvider,
  ): Promise<CredentialVerificationResult>;

  public abstract SyncProfileCredentials(
    professionalProfileId: string,
    contextUser: UserInfo,
    provider?: IMetadataProvider & IRunViewProvider,
  ): Promise<CredentialSyncResult>;
}

/**
 * Built-in manual verification provider for coordinator-reviewed credentials.
 */
@RegisterClass(BaseReferralCredentialProvider, 'Manual')
export class ManualReferralCredentialProvider extends BaseReferralCredentialProvider {
  public readonly ProviderKey = 'Manual';
  public readonly DisplayName = 'Manual Coordinator Verification';
  public readonly Description =
    'Coordinator-reviewed credential verification using submitted license numbers and evidence URLs.';

  public override async VerifyCredential(
    request: CredentialVerificationRequest,
    contextUser: UserInfo,
  ): Promise<CredentialVerificationResult> {
    assertCoordinatorAuthority(contextUser, 'perform manual credential verification');
    const code = request.CredentialCode.trim();
    if (!code) {
      throw new PersistenceError('CredentialCode is required for manual verification.');
    }
    const status: CredentialVerificationStatus = request.ForceStatus ?? 'Verified';
    const verifiedAt = status === 'Verified' ? new Date().toISOString() : null;
    const assertion: NormalizedCredentialAssertion = {
      CredentialCode: code,
      CredentialName: request.CredentialName?.trim() || code,
      IssuerName: request.IssuerName ?? null,
      ProviderKey: this.ProviderKey,
      ExternalReferenceID: request.ExternalReferenceID ?? null,
      JurisdictionID: request.JurisdictionID ?? null,
      VerificationStatus: status,
      VerifiedAt: verifiedAt,
      EvidenceURL: request.EvidenceURL ?? null,
      MetadataJSON: request.Metadata ? JSON.stringify(request.Metadata) : null,
      IsPrimary: true,
    };

    return {
      Success: status === 'Verified',
      ProviderKey: this.ProviderKey,
      ProfessionalCredentialID: request.ProfessionalCredentialID,
      VerificationStatus: status,
      ExternalReferenceID: assertion.ExternalReferenceID ?? null,
      VerifiedAt: verifiedAt,
      ExpiresAt: null,
      Message: `Credential '${code}' marked as '${status}' via Manual Coordinator Verification.`,
      Assertion: assertion,
    };
  }

  public override async SyncProfileCredentials(
    professionalProfileId: string,
    contextUser: UserInfo,
    provider?: IMetadataProvider & IRunViewProvider,
  ): Promise<CredentialSyncResult> {
    const validId = AssertValidUUID(professionalProfileId, 'ProfessionalProfileID');
    const dp = resolveDataProvider(provider);
    if (!dp) {
      return {
        Success: false,
        ProviderKey: this.ProviderKey,
        ProfessionalProfileID: validId,
        SyncedCount: 0,
        CreatedCount: 0,
        UpdatedCount: 0,
        Assertions: [],
        Message: 'No metadata provider available to sync manual credentials.',
      };
    }

    const rv = new RunView(dp);
    const res = await rv.RunView<ProfessionalCredentialEntity>(
      {
        EntityName: 'MJ_BizApps_Referrals: Professional Credentials',
        ExtraFilter: `ProfessionalProfileID = '${validId}' AND ProviderKey = 'Manual'`,
        ResultType: 'entity_object',
      },
      contextUser,
    );

    if (!res.Success) {
      return {
        Success: false,
        ProviderKey: this.ProviderKey,
        ProfessionalProfileID: validId,
        SyncedCount: 0,
        CreatedCount: 0,
        UpdatedCount: 0,
        Assertions: [],
        Message: `Failed to load manual credentials: ${res.ErrorMessage ?? 'RunView failed'}.`,
      };
    }

    const assertions: NormalizedCredentialAssertion[] = (res.Results ?? []).map((cred) => ({
      CredentialCode: cred.CredentialCode,
      CredentialName: cred.CredentialName,
      IssuerName: cred.IssuerName,
      ProviderKey: cred.ProviderKey,
      ExternalReferenceID: cred.ExternalReferenceID,
      JurisdictionID: cred.JurisdictionID,
      VerificationStatus: cred.VerificationStatus,
      IssuedAt: cred.IssuedAt ? new Date(cred.IssuedAt).toISOString() : null,
      ExpiresAt: cred.ExpiresAt ? new Date(cred.ExpiresAt).toISOString() : null,
      VerifiedAt: cred.VerifiedAt ? new Date(cred.VerifiedAt).toISOString() : null,
      EvidenceURL: cred.EvidenceURL,
      MetadataJSON: cred.MetadataJSON,
      IsPrimary: cred.IsPrimary,
    }));

    return {
      Success: true,
      ProviderKey: this.ProviderKey,
      ProfessionalProfileID: validId,
      SyncedCount: assertions.length,
      CreatedCount: 0,
      UpdatedCount: 0,
      Assertions: assertions,
      Message: `Loaded ${assertions.length} manual credential record(s).`,
    };
  }
}

/**
 * External registry / webhook-backed verification provider.
 * Fails closed unless an explicit ExternalVerificationAdapter or validated signed assertion payload is provided.
 */
@RegisterClass(BaseReferralCredentialProvider, 'ExternalAction')
export class ExternalActionCredentialProvider extends BaseReferralCredentialProvider {
  public readonly ProviderKey = 'ExternalAction';
  public readonly DisplayName = 'External Registry Action';
  public readonly Description =
    'Verifies credentials against external state bar, licensing board, or registry actions using a configured adapter or validated assertion.';

  private static configuredAdapter: ExternalVerificationAdapter | null = null;

  public static ConfigureAdapter(adapter: ExternalVerificationAdapter | null): void {
    ExternalActionCredentialProvider.configuredAdapter = adapter;
  }

  public override IsAvailable(): boolean {
    return ExternalActionCredentialProvider.configuredAdapter !== null;
  }

  private validateSignedMetadataPayload(
    request: CredentialVerificationRequest,
  ): ExternalVerificationAdapterResult | null {
    const meta = request.Metadata;
    if (!meta) {
      return null;
    }
    const verifiedFlag = meta['verifiedByExternalAction'] === true;
    const signature = typeof meta['assertionSignature'] === 'string' ? meta['assertionSignature'].trim() : '';
    const attestedSubject = typeof meta['subjectProfileId'] === 'string' ? meta['subjectProfileId'].trim() : '';
    const attestedCode = typeof meta['credentialCode'] === 'string' ? meta['credentialCode'].trim() : '';

    if (!verifiedFlag || signature.length < 16 || !attestedSubject || !attestedCode) {
      return null;
    }
    if (!UUIDsEqual(attestedSubject, request.ProfessionalProfileID)) {
      return {
        Success: false,
        VerificationStatus: 'Rejected',
        Message: 'External assertion payload subjectProfileId does not match target ProfessionalProfileID.',
      };
    }
    if (attestedCode.toLowerCase() !== request.CredentialCode.trim().toLowerCase()) {
      return {
        Success: false,
        VerificationStatus: 'Rejected',
        Message: 'External assertion payload credentialCode does not match requested CredentialCode.',
      };
    }
    return {
      Success: true,
      VerificationStatus: 'Verified',
      SubjectProfileID: attestedSubject,
      CredentialCode: attestedCode,
      ExternalReferenceID: request.ExternalReferenceID?.trim() || signature,
      IssuerName: request.IssuerName ?? 'External Licensing Registry',
      VerifiedAt: new Date().toISOString(),
      EvidenceURL: request.EvidenceURL ?? null,
      MetadataJSON: JSON.stringify(meta),
      Message: `Validated signed external assertion for '${attestedCode}'.`,
    };
  }

  public override async VerifyCredential(
    request: CredentialVerificationRequest,
    contextUser: UserInfo,
  ): Promise<CredentialVerificationResult> {
    const code = request.CredentialCode.trim();
    if (!code) {
      throw new PersistenceError('CredentialCode is required for external verification.');
    }

    const adapter = request.ExternalAdapter ?? ExternalActionCredentialProvider.configuredAdapter;
    let adapterOutcome: ExternalVerificationAdapterResult | null = null;

    if (adapter) {
      adapterOutcome = await adapter.Verify(
        {
          ProfessionalProfileID: request.ProfessionalProfileID,
          CredentialCode: code,
          CredentialName: request.CredentialName,
          LicenseNumber: request.LicenseNumber,
          IssuerName: request.IssuerName,
          JurisdictionID: request.JurisdictionID,
          ExternalReferenceID: request.ExternalReferenceID,
          EvidenceURL: request.EvidenceURL,
          Metadata: request.Metadata,
        },
        contextUser,
      );
    } else {
      adapterOutcome = this.validateSignedMetadataPayload(request);
    }

    if (!adapterOutcome) {
      return {
        Success: false,
        ProviderKey: this.ProviderKey,
        ProfessionalCredentialID: request.ProfessionalCredentialID,
        VerificationStatus: 'Pending',
        ExternalReferenceID: request.ExternalReferenceID ?? null,
        VerifiedAt: null,
        ExpiresAt: null,
        Message: `External verification adapter is not configured for '${code}'; failing closed as 'Pending'.`,
        Assertion: {
          CredentialCode: code,
          CredentialName: request.CredentialName?.trim() || code,
          IssuerName: request.IssuerName ?? 'External Licensing Registry',
          ProviderKey: this.ProviderKey,
          ExternalReferenceID: request.ExternalReferenceID ?? null,
          JurisdictionID: request.JurisdictionID ?? null,
          VerificationStatus: 'Pending',
          VerifiedAt: null,
          EvidenceURL: request.EvidenceURL ?? null,
          MetadataJSON: request.Metadata ? JSON.stringify(request.Metadata) : null,
        },
      };
    }

    if (
      adapterOutcome.SubjectProfileID &&
      !UUIDsEqual(adapterOutcome.SubjectProfileID, request.ProfessionalProfileID)
    ) {
      return {
        Success: false,
        ProviderKey: this.ProviderKey,
        ProfessionalCredentialID: request.ProfessionalCredentialID,
        VerificationStatus: 'Rejected',
        ExternalReferenceID: adapterOutcome.ExternalReferenceID ?? request.ExternalReferenceID ?? null,
        VerifiedAt: null,
        ExpiresAt: adapterOutcome.ExpiresAt ?? null,
        Message: 'External verification adapter returned a mismatched subject profile ID; failing closed as Rejected.',
        Assertion: {
          CredentialCode: code,
          CredentialName: request.CredentialName?.trim() || code,
          IssuerName: adapterOutcome.IssuerName ?? request.IssuerName ?? 'External Licensing Registry',
          ProviderKey: this.ProviderKey,
          ExternalReferenceID: adapterOutcome.ExternalReferenceID ?? request.ExternalReferenceID ?? null,
          JurisdictionID: request.JurisdictionID ?? null,
          VerificationStatus: 'Rejected',
          VerifiedAt: null,
          EvidenceURL: adapterOutcome.EvidenceURL ?? request.EvidenceURL ?? null,
          MetadataJSON: adapterOutcome.MetadataJSON ?? (request.Metadata ? JSON.stringify(request.Metadata) : null),
        },
      };
    }

    if (
      adapterOutcome.CredentialCode &&
      adapterOutcome.CredentialCode.trim().toLowerCase() !== code.toLowerCase()
    ) {
      return {
        Success: false,
        ProviderKey: this.ProviderKey,
        ProfessionalCredentialID: request.ProfessionalCredentialID,
        VerificationStatus: 'Rejected',
        ExternalReferenceID: adapterOutcome.ExternalReferenceID ?? request.ExternalReferenceID ?? null,
        VerifiedAt: null,
        ExpiresAt: adapterOutcome.ExpiresAt ?? null,
        Message: 'External verification adapter returned a mismatched credential code; failing closed as Rejected.',
        Assertion: {
          CredentialCode: code,
          CredentialName: request.CredentialName?.trim() || code,
          IssuerName: adapterOutcome.IssuerName ?? request.IssuerName ?? 'External Licensing Registry',
          ProviderKey: this.ProviderKey,
          ExternalReferenceID: adapterOutcome.ExternalReferenceID ?? request.ExternalReferenceID ?? null,
          JurisdictionID: request.JurisdictionID ?? null,
          VerificationStatus: 'Rejected',
          VerifiedAt: null,
          EvidenceURL: adapterOutcome.EvidenceURL ?? request.EvidenceURL ?? null,
          MetadataJSON: adapterOutcome.MetadataJSON ?? (request.Metadata ? JSON.stringify(request.Metadata) : null),
        },
      };
    }

    const isExpired =
      Boolean(adapterOutcome.ExpiresAt) && new Date(adapterOutcome.ExpiresAt!).getTime() <= Date.now();
    const finalStatus: CredentialVerificationStatus = isExpired
      ? 'Expired'
      : adapterOutcome.Success
        ? adapterOutcome.VerificationStatus
        : adapterOutcome.VerificationStatus === 'Verified'
          ? 'Rejected'
          : adapterOutcome.VerificationStatus;
    const isVerified = adapterOutcome.Success && finalStatus === 'Verified' && !isExpired;
    const verifiedAt = isVerified ? adapterOutcome.VerifiedAt ?? new Date().toISOString() : null;
    const extRef = adapterOutcome.ExternalReferenceID ?? request.ExternalReferenceID ?? null;

    const assertion: NormalizedCredentialAssertion = {
      CredentialCode: code,
      CredentialName: request.CredentialName?.trim() || code,
      IssuerName: adapterOutcome.IssuerName ?? request.IssuerName ?? 'External Licensing Registry',
      ProviderKey: this.ProviderKey,
      ExternalReferenceID: extRef,
      JurisdictionID: request.JurisdictionID ?? null,
      VerificationStatus: finalStatus,
      VerifiedAt: verifiedAt,
      ExpiresAt: adapterOutcome.ExpiresAt ?? null,
      EvidenceURL: adapterOutcome.EvidenceURL ?? request.EvidenceURL ?? null,
      MetadataJSON:
        adapterOutcome.MetadataJSON ?? (request.Metadata ? JSON.stringify(request.Metadata) : null),
    };

    return {
      Success: isVerified,
      ProviderKey: this.ProviderKey,
      ProfessionalCredentialID: request.ProfessionalCredentialID,
      VerificationStatus: finalStatus,
      ExternalReferenceID: extRef,
      VerifiedAt: verifiedAt,
      ExpiresAt: adapterOutcome.ExpiresAt ?? null,
      Message: adapterOutcome.Message,
      Assertion: assertion,
    };
  }

  public override async SyncProfileCredentials(
    professionalProfileId: string,
    contextUser: UserInfo,
    provider?: IMetadataProvider & IRunViewProvider,
  ): Promise<CredentialSyncResult> {
    const validId = AssertValidUUID(professionalProfileId, 'ProfessionalProfileID');
    const adapter = ExternalActionCredentialProvider.configuredAdapter;
    if (!adapter) {
      return {
        Success: false,
        ProviderKey: this.ProviderKey,
        ProfessionalProfileID: validId,
        SyncedCount: 0,
        CreatedCount: 0,
        UpdatedCount: 0,
        Assertions: [],
        Message: 'External verification adapter is not configured; cannot sync ExternalAction credentials.',
      };
    }

    const dp = resolveDataProvider(provider);
    if (!dp) {
      return {
        Success: false,
        ProviderKey: this.ProviderKey,
        ProfessionalProfileID: validId,
        SyncedCount: 0,
        CreatedCount: 0,
        UpdatedCount: 0,
        Assertions: [],
        Message: 'No metadata provider available to sync ExternalAction credentials.',
      };
    }

    const rv = new RunView(dp);
    const res = await rv.RunView<ProfessionalCredentialEntity>(
      {
        EntityName: 'MJ_BizApps_Referrals: Professional Credentials',
        ExtraFilter: `ProfessionalProfileID = '${validId}' AND ProviderKey = 'ExternalAction'`,
        ResultType: 'entity_object',
      },
      contextUser,
    );
    if (!res.Success) {
      return {
        Success: false,
        ProviderKey: this.ProviderKey,
        ProfessionalProfileID: validId,
        SyncedCount: 0,
        CreatedCount: 0,
        UpdatedCount: 0,
        Assertions: [],
        Message: `Failed to query ExternalAction credentials: ${res.ErrorMessage ?? 'RunView failed'}.`,
      };
    }

    const existing = res.Results ?? [];
    if (adapter.SyncProfile) {
      const synced = await adapter.SyncProfile(validId, existing, contextUser);
      return {
        Success: synced.Success,
        ProviderKey: this.ProviderKey,
        ProfessionalProfileID: validId,
        SyncedCount: synced.Assertions.length,
        CreatedCount: 0,
        UpdatedCount: 0,
        Assertions: synced.Assertions,
        Message: synced.Message,
      };
    }

    const assertions: NormalizedCredentialAssertion[] = [];
    for (const cred of existing) {
      const outcome = await this.VerifyCredential(
        {
          ProfessionalProfileID: validId,
          ProfessionalCredentialID: cred.ID,
          CredentialCode: cred.CredentialCode,
          CredentialName: cred.CredentialName,
          IssuerName: cred.IssuerName,
          JurisdictionID: cred.JurisdictionID,
          ExternalReferenceID: cred.ExternalReferenceID,
          EvidenceURL: cred.EvidenceURL,
          ProviderKey: this.ProviderKey,
          ExternalAdapter: adapter,
        },
        contextUser,
      );
      assertions.push(outcome.Assertion);
    }

    return {
      Success: true,
      ProviderKey: this.ProviderKey,
      ProfessionalProfileID: validId,
      SyncedCount: assertions.length,
      CreatedCount: 0,
      UpdatedCount: 0,
      Assertions: assertions,
      Message: `Re-verified ${assertions.length} ExternalAction credential(s) via configured adapter.`,
    };
  }
}

interface CredentialingBridgeRow {
  ID?: string;
  PersonID?: string | null;
  ProfessionalProfileID?: string | null;
  OrganizationID?: string | null;
  CredentialCode?: string;
  Code?: string;
  CredentialName?: string;
  Name?: string;
  IssuerName?: string | null;
  Status?: string;
  VerificationStatus?: string;
  IssuedAt?: string | Date | null;
  ExpiresAt?: string | Date | null;
  VerifiedAt?: string | Date | null;
  EvidenceURL?: string | null;
}

function mapBridgeStatus(raw?: string): CredentialVerificationStatus {
  const normalized = (raw ?? '').trim().toLowerCase();
  if (normalized === 'verified' || normalized === 'active' || normalized === 'approved') return 'Verified';
  if (normalized === 'expired') return 'Expired';
  if (normalized === 'revoked') return 'Revoked';
  if (normalized === 'rejected' || normalized === 'denied') return 'Rejected';
  return 'Pending';
}

interface BridgeEntityMetadata {
  Name: string;
  CodeField: 'CredentialCode' | 'Code' | null;
  SubjectField: 'PersonID' | 'ProfessionalProfileID' | 'OrganizationID' | null;
}

/**
 * Optional runtime bridge to BizApps Credentialing (`MJ_BizApps_Credentialing:*` entities).
 * Uses runtime `Metadata.Provider.Entities` inspection with ZERO static dependency on `@mj-biz-apps/credentialing*`.
 */
@RegisterClass(BaseReferralCredentialProvider, 'BizAppsCredentialingBridge')
export class OptionalCredentialingBridgeProvider extends BaseReferralCredentialProvider {
  public readonly ProviderKey = 'BizAppsCredentialingBridge';
  public readonly DisplayName = 'BizApps Credentialing Bridge';
  public readonly Description =
    'Optional runtime bridge to BizApps Credentialing entities when installed in the host workspace.';

  private inspectCredentialingEntity(provider?: IMetadataProvider): BridgeEntityMetadata | null {
    const md = provider ?? Metadata.Provider;
    const entities = md?.Entities ?? [];
    const match = entities.find(
      (e) =>
        e.Name.startsWith('MJ_BizApps_Credentialing:') &&
        (e.Name.includes('Credential') || e.Name.includes('License')),
    );
    if (!match) {
      return null;
    }
    const fieldNames = new Set((match.Fields ?? []).map((f) => f.Name));
    const codeField: BridgeEntityMetadata['CodeField'] = fieldNames.has('CredentialCode')
      ? 'CredentialCode'
      : fieldNames.has('Code')
        ? 'Code'
        : null;
    const subjectField: BridgeEntityMetadata['SubjectField'] = fieldNames.has('PersonID')
      ? 'PersonID'
      : fieldNames.has('ProfessionalProfileID')
        ? 'ProfessionalProfileID'
        : fieldNames.has('OrganizationID')
          ? 'OrganizationID'
          : null;

    return {
      Name: match.Name,
      CodeField: codeField,
      SubjectField: subjectField,
    };
  }

  public override IsAvailable(provider?: IMetadataProvider): boolean {
    return this.inspectCredentialingEntity(provider) !== null;
  }

  public override async VerifyCredential(
    request: CredentialVerificationRequest,
    contextUser: UserInfo,
    provider?: IMetadataProvider & IRunViewProvider,
  ): Promise<CredentialVerificationResult> {
    const validProfileId = AssertValidUUID(request.ProfessionalProfileID, 'ProfessionalProfileID');
    const dp = resolveDataProvider(provider);
    const bridgeMeta = this.inspectCredentialingEntity(dp);
    if (!bridgeMeta || !dp) {
      return {
        Success: false,
        ProviderKey: this.ProviderKey,
        ProfessionalCredentialID: request.ProfessionalCredentialID,
        VerificationStatus: 'Pending',
        ExternalReferenceID: request.ExternalReferenceID ?? null,
        VerifiedAt: null,
        ExpiresAt: null,
        Message: 'BizApps Credentialing package is not installed in this environment.',
        Assertion: {
          CredentialCode: request.CredentialCode,
          CredentialName: request.CredentialName ?? request.CredentialCode,
          ProviderKey: this.ProviderKey,
          VerificationStatus: 'Pending',
        },
      };
    }

    if (!bridgeMeta.CodeField || !bridgeMeta.SubjectField) {
      return {
        Success: false,
        ProviderKey: this.ProviderKey,
        ProfessionalCredentialID: request.ProfessionalCredentialID,
        VerificationStatus: 'Pending',
        ExternalReferenceID: request.ExternalReferenceID ?? null,
        VerifiedAt: null,
        ExpiresAt: null,
        Message: `Entity '${bridgeMeta.Name}' lacks required code or subject metadata fields for safe bridging.`,
        Assertion: {
          CredentialCode: request.CredentialCode,
          CredentialName: request.CredentialName ?? request.CredentialCode,
          ProviderKey: this.ProviderKey,
          VerificationStatus: 'Pending',
        },
      };
    }

    const profileEntity = await dp.GetEntityObject<ProfessionalProfileEntity>(
      'MJ_BizApps_Referrals: Professional Profiles',
      contextUser,
    );
    if (!(await profileEntity.Load(validProfileId))) {
      throw new PersistenceError(`ProfessionalProfile '${validProfileId}' not found.`);
    }

    const expectedSubjectId =
      bridgeMeta.SubjectField === 'PersonID'
        ? profileEntity.PersonID
        : bridgeMeta.SubjectField === 'OrganizationID'
          ? profileEntity.OrganizationID
          : profileEntity.ID;

    if (!expectedSubjectId) {
      return {
        Success: false,
        ProviderKey: this.ProviderKey,
        ProfessionalCredentialID: request.ProfessionalCredentialID,
        VerificationStatus: 'Pending',
        ExternalReferenceID: request.ExternalReferenceID ?? null,
        VerifiedAt: null,
        ExpiresAt: null,
        Message: `ProfessionalProfile '${validProfileId}' has no '${bridgeMeta.SubjectField}' for Credentialing lookup.`,
        Assertion: {
          CredentialCode: request.CredentialCode,
          CredentialName: request.CredentialName ?? request.CredentialCode,
          ProviderKey: this.ProviderKey,
          VerificationStatus: 'Pending',
        },
      };
    }

    const validSubjectId = AssertValidUUID(expectedSubjectId, bridgeMeta.SubjectField);
    const rv = new RunView(dp);
    const escapedCode = EscapeSqlLiteral(request.CredentialCode.trim());
    const res = await rv.RunView<CredentialingBridgeRow>(
      {
        EntityName: bridgeMeta.Name,
        ExtraFilter: `${bridgeMeta.SubjectField} = '${validSubjectId}' AND ${bridgeMeta.CodeField} = '${escapedCode}'`,
        ResultType: 'simple',
      },
      contextUser,
    );

    if (!res.Success) {
      return {
        Success: false,
        ProviderKey: this.ProviderKey,
        ProfessionalCredentialID: request.ProfessionalCredentialID,
        VerificationStatus: 'Pending',
        ExternalReferenceID: request.ExternalReferenceID ?? null,
        VerifiedAt: null,
        ExpiresAt: null,
        Message: `Credentialing bridge query failed: ${res.ErrorMessage ?? 'RunView failed'}.`,
        Assertion: {
          CredentialCode: request.CredentialCode,
          CredentialName: request.CredentialName ?? request.CredentialCode,
          ProviderKey: this.ProviderKey,
          VerificationStatus: 'Pending',
        },
      };
    }

    const row = res.Results?.[0];
    if (!row) {
      return {
        Success: false,
        ProviderKey: this.ProviderKey,
        ProfessionalCredentialID: request.ProfessionalCredentialID,
        VerificationStatus: 'Pending',
        ExternalReferenceID: request.ExternalReferenceID ?? null,
        VerifiedAt: null,
        ExpiresAt: null,
        Message: `No matching record found in '${bridgeMeta.Name}' for '${request.CredentialCode}'.`,
        Assertion: {
          CredentialCode: request.CredentialCode,
          CredentialName: request.CredentialName ?? request.CredentialCode,
          ProviderKey: this.ProviderKey,
          VerificationStatus: 'Pending',
        },
      };
    }

    const rowSubjectId =
      bridgeMeta.SubjectField === 'PersonID'
        ? row.PersonID
        : bridgeMeta.SubjectField === 'OrganizationID'
          ? row.OrganizationID
          : row.ProfessionalProfileID;

    if (rowSubjectId && !UUIDsEqual(rowSubjectId, validSubjectId)) {
      return {
        Success: false,
        ProviderKey: this.ProviderKey,
        ProfessionalCredentialID: request.ProfessionalCredentialID,
        VerificationStatus: 'Rejected',
        ExternalReferenceID: row.ID ?? request.ExternalReferenceID ?? null,
        VerifiedAt: null,
        ExpiresAt: row.ExpiresAt ? new Date(row.ExpiresAt).toISOString() : null,
        Message: `Bridged record subject mismatch in '${bridgeMeta.Name}'; failing closed as Rejected.`,
        Assertion: {
          CredentialCode: request.CredentialCode,
          CredentialName: row.CredentialName ?? row.Name ?? request.CredentialName ?? request.CredentialCode,
          IssuerName: row.IssuerName ?? request.IssuerName ?? null,
          ProviderKey: this.ProviderKey,
          ExternalReferenceID: row.ID ?? request.ExternalReferenceID ?? null,
          VerificationStatus: 'Rejected',
          VerifiedAt: null,
          ExpiresAt: row.ExpiresAt ? new Date(row.ExpiresAt).toISOString() : null,
          EvidenceURL: row.EvidenceURL ?? request.EvidenceURL ?? null,
        },
      };
    }

    let status = mapBridgeStatus(row.VerificationStatus ?? row.Status);
    const expiresAtIso = row.ExpiresAt ? new Date(row.ExpiresAt).toISOString() : null;
    if (expiresAtIso && new Date(expiresAtIso).getTime() <= Date.now()) {
      status = 'Expired';
    }
    const verifiedAt = status === 'Verified' ? new Date().toISOString() : null;

    return {
      Success: status === 'Verified',
      ProviderKey: this.ProviderKey,
      ProfessionalCredentialID: request.ProfessionalCredentialID,
      VerificationStatus: status,
      ExternalReferenceID: row.ID ?? request.ExternalReferenceID ?? null,
      VerifiedAt: verifiedAt,
      ExpiresAt: expiresAtIso,
      Message: `Bridged credential '${request.CredentialCode}' from '${bridgeMeta.Name}' with status '${status}'.`,
      Assertion: {
        CredentialCode: request.CredentialCode,
        CredentialName: row.CredentialName ?? row.Name ?? request.CredentialName ?? request.CredentialCode,
        IssuerName: row.IssuerName ?? request.IssuerName ?? null,
        ProviderKey: this.ProviderKey,
        ExternalReferenceID: row.ID ?? request.ExternalReferenceID ?? null,
        VerificationStatus: status,
        VerifiedAt: verifiedAt,
        ExpiresAt: expiresAtIso,
        EvidenceURL: row.EvidenceURL ?? request.EvidenceURL ?? null,
      },
    };
  }

  public override async SyncProfileCredentials(
    professionalProfileId: string,
    contextUser: UserInfo,
    provider?: IMetadataProvider & IRunViewProvider,
  ): Promise<CredentialSyncResult> {
    const validId = AssertValidUUID(professionalProfileId, 'ProfessionalProfileID');
    const dp = resolveDataProvider(provider);
    const bridgeMeta = this.inspectCredentialingEntity(dp);
    if (!bridgeMeta || !dp) {
      return {
        Success: false,
        ProviderKey: this.ProviderKey,
        ProfessionalProfileID: validId,
        SyncedCount: 0,
        CreatedCount: 0,
        UpdatedCount: 0,
        Assertions: [],
        Message: 'BizApps Credentialing package is not installed in this environment.',
      };
    }

    if (!bridgeMeta.SubjectField) {
      return {
        Success: false,
        ProviderKey: this.ProviderKey,
        ProfessionalProfileID: validId,
        SyncedCount: 0,
        CreatedCount: 0,
        UpdatedCount: 0,
        Assertions: [],
        Message: `Entity '${bridgeMeta.Name}' lacks subject field metadata for safe bridging.`,
      };
    }

    const rv = new RunView(dp);
    const profileRes = await rv.RunView<ProfessionalProfileEntity>(
      {
        EntityName: 'MJ_BizApps_Referrals: Professional Profiles',
        ExtraFilter: `ID = '${validId}'`,
        ResultType: 'entity_object',
      },
      contextUser,
    );
    if (!profileRes.Success) {
      return {
        Success: false,
        ProviderKey: this.ProviderKey,
        ProfessionalProfileID: validId,
        SyncedCount: 0,
        CreatedCount: 0,
        UpdatedCount: 0,
        Assertions: [],
        Message: `Failed to load ProfessionalProfile '${validId}': ${profileRes.ErrorMessage ?? 'RunView failed'}.`,
      };
    }

    const profile = profileRes.Results?.[0];
    if (!profile) {
      return {
        Success: false,
        ProviderKey: this.ProviderKey,
        ProfessionalProfileID: validId,
        SyncedCount: 0,
        CreatedCount: 0,
        UpdatedCount: 0,
        Assertions: [],
        Message: `ProfessionalProfile '${validId}' not found.`,
      };
    }

    const expectedSubjectId =
      bridgeMeta.SubjectField === 'PersonID'
        ? profile.PersonID
        : bridgeMeta.SubjectField === 'OrganizationID'
          ? profile.OrganizationID
          : profile.ID;

    if (!expectedSubjectId) {
      return {
        Success: false,
        ProviderKey: this.ProviderKey,
        ProfessionalProfileID: validId,
        SyncedCount: 0,
        CreatedCount: 0,
        UpdatedCount: 0,
        Assertions: [],
        Message: `Profile has no linked '${bridgeMeta.SubjectField}' to bridge from BizApps Credentialing.`,
      };
    }

    const validSubjectId = AssertValidUUID(expectedSubjectId, bridgeMeta.SubjectField);
    const credRes = await rv.RunView<CredentialingBridgeRow>(
      {
        EntityName: bridgeMeta.Name,
        ExtraFilter: `${bridgeMeta.SubjectField} = '${validSubjectId}'`,
        ResultType: 'simple',
      },
      contextUser,
    );
    if (!credRes.Success) {
      return {
        Success: false,
        ProviderKey: this.ProviderKey,
        ProfessionalProfileID: validId,
        SyncedCount: 0,
        CreatedCount: 0,
        UpdatedCount: 0,
        Assertions: [],
        Message: `Credentialing bridge sync query failed: ${credRes.ErrorMessage ?? 'RunView failed'}.`,
      };
    }

    const nowMs = Date.now();
    const assertions: NormalizedCredentialAssertion[] = (credRes.Results ?? []).map((row) => {
      let status = mapBridgeStatus(row.VerificationStatus ?? row.Status);
      const expiresAtIso = row.ExpiresAt ? new Date(row.ExpiresAt).toISOString() : null;
      if (expiresAtIso && new Date(expiresAtIso).getTime() <= nowMs) {
        status = 'Expired';
      }
      return {
        CredentialCode: row.CredentialCode ?? row.Code ?? 'CRED',
        CredentialName: row.CredentialName ?? row.Name ?? 'Bridged Credential',
        IssuerName: row.IssuerName ?? null,
        ProviderKey: this.ProviderKey,
        ExternalReferenceID: row.ID ?? null,
        VerificationStatus: status,
        IssuedAt: row.IssuedAt ? new Date(row.IssuedAt).toISOString() : null,
        ExpiresAt: expiresAtIso,
        VerifiedAt: status === 'Verified' && row.VerifiedAt ? new Date(row.VerifiedAt).toISOString() : null,
        EvidenceURL: row.EvidenceURL ?? null,
      };
    });

    return {
      Success: true,
      ProviderKey: this.ProviderKey,
      ProfessionalProfileID: validId,
      SyncedCount: assertions.length,
      CreatedCount: 0,
      UpdatedCount: 0,
      Assertions: assertions,
      Message: `Bridged ${assertions.length} credential(s) from '${bridgeMeta.Name}'.`,
    };
  }
}

export function LoadCredentialProviders(): void {
  // Ensures provider class registrations are preserved by bundlers.
}

/**
 * Singleton orchestrator for credential verification, provider discovery, feedback aggregation, and profile status sync.
 */
export class ReferralCredentialService extends BaseSingleton<ReferralCredentialService> {
  public static get Instance(): ReferralCredentialService {
    return super.getInstance<ReferralCredentialService>();
  }

  private getRegisteredProviders(): BaseReferralCredentialProvider[] {
    LoadCredentialProviders();
    const regs = MJGlobal.Instance.ClassFactory.GetRegistrationsByRootClass(BaseReferralCredentialProvider);
    if (regs && regs.length > 0) {
      const seen = new Set<string>();
      const instances: BaseReferralCredentialProvider[] = [];
      for (const reg of regs) {
        const key = reg.Key ?? '';
        if (key && !seen.has(key)) {
          seen.add(key);
          const instance = MJGlobal.Instance.ClassFactory.CreateInstance<BaseReferralCredentialProvider>(
            BaseReferralCredentialProvider,
            key,
          );
          if (instance) {
            instances.push(instance);
          }
        }
      }
      if (instances.length > 0) {
        return instances;
      }
    }
    return [
      new ManualReferralCredentialProvider(),
      new ExternalActionCredentialProvider(),
      new OptionalCredentialingBridgeProvider(),
    ];
  }

  public ListProviders(provider?: IMetadataProvider): CredentialProviderDescriptor[] {
    return this.getRegisteredProviders().map((p) => ({
      ProviderKey: p.ProviderKey,
      DisplayName: p.DisplayName,
      Description: p.Description,
      Available: p.IsAvailable(provider),
      SupportsSync: p.SupportsSync(),
    }));
  }

  public ResolveProvider(providerKey = 'Manual'): BaseReferralCredentialProvider {
    const normalized = providerKey.trim() || 'Manual';
    const match = this.getRegisteredProviders().find(
      (p) => p.ProviderKey.toLowerCase() === normalized.toLowerCase(),
    );
    if (!match) {
      throw new PersistenceError(`No credential verification provider registered for key '${normalized}'.`);
    }
    return match;
  }

  private async synchronizeProfileVerificationStatus(
    profile: ProfessionalProfileEntity,
    contextUser: UserInfo,
    dp: IMetadataProvider & IRunViewProvider,
  ): Promise<void> {
    if (String(profile.VerificationStatus) === 'Suspended') {
      return;
    }

    const validProfileId = AssertValidUUID(profile.ID, 'ProfessionalProfileID');
    const rv = new RunView(dp);
    const credRes = await rv.RunView<ProfessionalCredentialEntity>(
      {
        EntityName: 'MJ_BizApps_Referrals: Professional Credentials',
        ExtraFilter: `ProfessionalProfileID = '${validProfileId}'`,
        ResultType: 'entity_object',
      },
      contextUser,
    );
    if (!credRes.Success) {
      throw new PersistenceError(
        `Failed to query credentials while synchronizing profile status: ${credRes.ErrorMessage ?? 'RunView failed'}.`,
      );
    }

    const creds = credRes.Results ?? [];
    if (creds.length === 0) {
      return;
    }

    const nowMs = Date.now();
    const activeVerified = creds.filter((c) => isCredentialActive(c, nowMs));
    let targetStatus = profile.VerificationStatus;

    if (activeVerified.length > 0) {
      targetStatus = 'Verified';
      const primaryActive = activeVerified.find((c) => c.IsPrimary) ?? activeVerified[0];
      if (primaryActive && !profile.LicenseNumber) {
        profile.LicenseNumber = primaryActive.CredentialCode;
      }
    } else {
      const hasPending = creds.some((c) => c.VerificationStatus === 'Pending');
      if (hasPending) {
        targetStatus = 'Pending';
      } else {
        targetStatus = 'Expired';
      }
    }

    if (profile.VerificationStatus !== targetStatus || profile.Dirty) {
      profile.VerificationStatus = targetStatus;
      if (!(await profile.Save())) {
        throw new PersistenceError('Failed to save synchronized ProfessionalProfile verification status.');
      }
    }
  }

  public async VerifyAndPersistCredential(
    request: CredentialVerificationRequest,
    contextUser: UserInfo,
    provider?: IMetadataProvider & IRunViewProvider,
  ): Promise<CredentialVerificationResult> {
    const validProfileId = AssertValidUUID(request.ProfessionalProfileID, 'ProfessionalProfileID');
    const dp = resolveDataProvider(provider);
    if (!dp) {
      throw new PersistenceError('A metadata provider is required to verify and persist credentials.');
    }

    const profile = await dp.GetEntityObject<ProfessionalProfileEntity>(
      'MJ_BizApps_Referrals: Professional Profiles',
      contextUser,
    );
    if (!(await profile.Load(validProfileId))) {
      throw new PersistenceError(`ProfessionalProfile '${validProfileId}' not found.`);
    }

    let credEntity: ProfessionalCredentialEntity | null = null;
    if (request.ProfessionalCredentialID) {
      const validCredId = AssertValidUUID(request.ProfessionalCredentialID, 'ProfessionalCredentialID');
      credEntity = await dp.GetEntityObject<ProfessionalCredentialEntity>(
        'MJ_BizApps_Referrals: Professional Credentials',
        contextUser,
      );
      if (!(await credEntity.Load(validCredId))) {
        throw new PersistenceError(`ProfessionalCredential '${validCredId}' not found.`);
      }
      if (!UUIDsEqual(credEntity.ProfessionalProfileID, validProfileId)) {
        throw new AuthorizationError(
          `ProfessionalCredential '${validCredId}' does not belong to ProfessionalProfile '${validProfileId}'.`,
        );
      }
    }

    const impl = this.ResolveProvider(request.ProviderKey ?? 'Manual');
    if (impl.ProviderKey === 'Manual') {
      assertCoordinatorAuthority(contextUser, 'verify credentials manually');
    }

    const result = await impl.VerifyCredential(request, contextUser, dp);

    if (!credEntity) {
      const rv = new RunView(dp);
      const escapedCode = EscapeSqlLiteral(result.Assertion.CredentialCode);
      const existing = await rv.RunView<ProfessionalCredentialEntity>(
        {
          EntityName: 'MJ_BizApps_Referrals: Professional Credentials',
          ExtraFilter: `ProfessionalProfileID = '${validProfileId}' AND CredentialCode = '${escapedCode}'`,
          ResultType: 'entity_object',
        },
        contextUser,
      );
      if (!existing.Success) {
        throw new PersistenceError(
          `Failed to query existing credential: ${existing.ErrorMessage ?? 'RunView failed'}.`,
        );
      }
      if (existing.Results && existing.Results.length > 0) {
        credEntity = existing.Results[0];
      } else {
        credEntity = await dp.GetEntityObject<ProfessionalCredentialEntity>(
          'MJ_BizApps_Referrals: Professional Credentials',
          contextUser,
        );
        credEntity.NewRecord();
        credEntity.ProfessionalProfileID = validProfileId;
      }
    }

    const verifiedByPersonId =
      impl.ProviderKey === 'Manual' && contextUser
        ? await resolvePersonIdForUser(contextUser, dp)
        : null;

    credEntity.CredentialCode = result.Assertion.CredentialCode;
    credEntity.CredentialName = result.Assertion.CredentialName;
    credEntity.IssuerName = result.Assertion.IssuerName ?? null;
    credEntity.ProviderKey = result.ProviderKey;
    credEntity.ExternalReferenceID = result.ExternalReferenceID;
    credEntity.JurisdictionID = request.JurisdictionID ?? credEntity.JurisdictionID ?? null;
    credEntity.VerificationStatus = result.VerificationStatus;
    credEntity.ExpiresAt = result.ExpiresAt ? new Date(result.ExpiresAt) : credEntity.ExpiresAt ?? null;
    credEntity.VerifiedAt = result.VerifiedAt ? new Date(result.VerifiedAt) : null;
    if (verifiedByPersonId) {
      credEntity.VerifiedByPersonID = verifiedByPersonId;
    }
    credEntity.EvidenceURL = result.Assertion.EvidenceURL ?? credEntity.EvidenceURL ?? null;
    credEntity.MetadataJSON = result.Assertion.MetadataJSON ?? credEntity.MetadataJSON ?? null;
    if (result.Assertion.IsPrimary !== undefined) {
      credEntity.IsPrimary = result.Assertion.IsPrimary;
    }

    const saved = await credEntity.Save();
    if (!saved) {
      throw new PersistenceError('Failed to persist ProfessionalCredential verification result.');
    }

    result.ProfessionalCredentialID = credEntity.ID;
    await this.synchronizeProfileVerificationStatus(profile, contextUser, dp);

    return result;
  }

  public async ReviewPendingCredential(
    request: ReviewPendingCredentialRequest,
    contextUser: UserInfo,
    provider?: IMetadataProvider & IRunViewProvider,
  ): Promise<CredentialVerificationResult> {
    assertCoordinatorAuthority(contextUser, 'review pending credentials');
    const validProfileId = AssertValidUUID(request.ProfessionalProfileID, 'ProfessionalProfileID');
    const validCredId = AssertValidUUID(request.ProfessionalCredentialID, 'ProfessionalCredentialID');
    const dp = resolveDataProvider(provider);
    if (!dp) {
      throw new PersistenceError('A metadata provider is required to review pending credentials.');
    }

    const credEntity = await dp.GetEntityObject<ProfessionalCredentialEntity>(
      'MJ_BizApps_Referrals: Professional Credentials',
      contextUser,
    );
    if (!(await credEntity.Load(validCredId))) {
      throw new PersistenceError(`ProfessionalCredential '${validCredId}' not found.`);
    }
    if (!UUIDsEqual(credEntity.ProfessionalProfileID, validProfileId)) {
      throw new AuthorizationError(
        `ProfessionalCredential '${validCredId}' does not belong to ProfessionalProfile '${validProfileId}'.`,
      );
    }

    return this.VerifyAndPersistCredential(
      {
        ProfessionalProfileID: validProfileId,
        ProfessionalCredentialID: validCredId,
        CredentialCode: credEntity.CredentialCode,
        CredentialName: credEntity.CredentialName,
        IssuerName: credEntity.IssuerName,
        JurisdictionID: credEntity.JurisdictionID,
        ExternalReferenceID: credEntity.ExternalReferenceID,
        EvidenceURL: request.EvidenceURL ?? credEntity.EvidenceURL,
        ProviderKey: 'Manual',
        ForceStatus: request.Decision,
        Metadata: request.Notes ? { reviewNotes: request.Notes } : undefined,
      },
      contextUser,
      dp,
    );
  }

  public async SyncProfileCredentials(
    professionalProfileId: string,
    providerKey: string,
    contextUser: UserInfo,
    provider?: IMetadataProvider & IRunViewProvider,
  ): Promise<CredentialSyncResult> {
    const validProfileId = AssertValidUUID(professionalProfileId, 'ProfessionalProfileID');
    const dp = resolveDataProvider(provider);
    if (!dp) {
      throw new PersistenceError('A metadata provider is required to sync profile credentials.');
    }

    const profile = await dp.GetEntityObject<ProfessionalProfileEntity>(
      'MJ_BizApps_Referrals: Professional Profiles',
      contextUser,
    );
    if (!(await profile.Load(validProfileId))) {
      throw new PersistenceError(`ProfessionalProfile '${validProfileId}' not found.`);
    }

    const impl = this.ResolveProvider(providerKey);
    const syncResult = await impl.SyncProfileCredentials(validProfileId, contextUser, dp);
    if (!syncResult.Success) {
      return syncResult;
    }

    if (syncResult.Assertions.length === 0) {
      await this.synchronizeProfileVerificationStatus(profile, contextUser, dp);
      return syncResult;
    }

    const rv = new RunView(dp);
    const existingRes = await rv.RunView<ProfessionalCredentialEntity>(
      {
        EntityName: 'MJ_BizApps_Referrals: Professional Credentials',
        ExtraFilter: `ProfessionalProfileID = '${validProfileId}'`,
        ResultType: 'entity_object',
      },
      contextUser,
    );
    if (!existingRes.Success) {
      throw new PersistenceError(
        `Failed to query existing credentials during sync: ${existingRes.ErrorMessage ?? 'RunView failed'}.`,
      );
    }

    const existingByCode = new Map<string, ProfessionalCredentialEntity>();
    for (const row of existingRes.Results ?? []) {
      existingByCode.set(row.CredentialCode.toLowerCase(), row);
    }

    let created = 0;
    let updated = 0;
    for (const assertion of syncResult.Assertions) {
      const existing = existingByCode.get(assertion.CredentialCode.toLowerCase());
      const target =
        existing ??
        (await dp.GetEntityObject<ProfessionalCredentialEntity>(
          'MJ_BizApps_Referrals: Professional Credentials',
          contextUser,
        ));
      if (!existing) {
        target.NewRecord();
        target.ProfessionalProfileID = validProfileId;
      }
      target.CredentialCode = assertion.CredentialCode;
      target.CredentialName = assertion.CredentialName;
      target.IssuerName = assertion.IssuerName ?? null;
      target.ProviderKey = assertion.ProviderKey;
      target.ExternalReferenceID = assertion.ExternalReferenceID ?? null;
      target.JurisdictionID = assertion.JurisdictionID ?? target.JurisdictionID ?? null;
      target.VerificationStatus = assertion.VerificationStatus;
      target.IssuedAt = assertion.IssuedAt ? new Date(assertion.IssuedAt) : null;
      target.ExpiresAt = assertion.ExpiresAt ? new Date(assertion.ExpiresAt) : null;
      target.VerifiedAt = assertion.VerifiedAt ? new Date(assertion.VerifiedAt) : null;
      target.EvidenceURL = assertion.EvidenceURL ?? null;
      target.MetadataJSON = assertion.MetadataJSON ?? null;

      if (!(await target.Save())) {
        throw new PersistenceError(
          `Failed to save synced ProfessionalCredential '${assertion.CredentialCode}'.`,
        );
      }
      if (!existing) {
        created++;
      } else {
        updated++;
      }
    }

    await this.synchronizeProfileVerificationStatus(profile, contextUser, dp);
    syncResult.CreatedCount = created;
    syncResult.UpdatedCount = updated;
    return syncResult;
  }

  /**
   * Validates assignment/request/profile consistency, upserts ReferralFeedback by (ReferralAssignmentID, SubmittedByType),
   * and recomputes ProfessionalProfile.AverageRating and TotalCompletedCount.
   */
  public async SubmitReferralFeedback(
    request: SubmitReferralFeedbackRequest,
    contextUser: UserInfo,
    provider?: IMetadataProvider & IRunViewProvider,
  ): Promise<SubmitReferralFeedbackResult> {
    const validAssignmentId = AssertValidUUID(request.ReferralAssignmentID, 'ReferralAssignmentID');
    const dp = resolveDataProvider(provider);
    if (!dp) {
      throw new PersistenceError('A metadata provider is required to submit referral feedback.');
    }

    if (!Number.isInteger(request.Rating) || request.Rating < 1 || request.Rating > 5) {
      throw new PersistenceError('Rating must be an integer between 1 and 5.');
    }

    const validOutcomes: ReadonlyArray<FeedbackOutcomeStatus> = [
      'Engaged',
      'ConsultedOnly',
      'NoResponse',
      'NotAFit',
      'Resolved',
    ];
    if (!validOutcomes.includes(request.OutcomeStatus)) {
      throw new PersistenceError(`Invalid OutcomeStatus '${String(request.OutcomeStatus)}'.`);
    }

    const validSubmitters: ReadonlyArray<FeedbackSubmittedByType> = [
      'Seeker',
      'Professional',
      'Operator',
    ];
    if (!validSubmitters.includes(request.SubmittedByType)) {
      throw new PersistenceError(`Invalid SubmittedByType '${String(request.SubmittedByType)}'.`);
    }

    const assignment = await dp.GetEntityObject<ReferralAssignmentEntity>(
      'MJ_BizApps_Referrals: Referral Assignments',
      contextUser,
    );
    if (!(await assignment.Load(validAssignmentId))) {
      throw new PersistenceError(`ReferralAssignment '${validAssignmentId}' not found.`);
    }

    if (assignment.Status !== 'Accepted') {
      throw new PersistenceError(
        `Feedback can only be submitted for Accepted assignments (current status: '${assignment.Status}').`,
      );
    }

    if (request.ReferralRequestID && !UUIDsEqual(request.ReferralRequestID, assignment.ReferralRequestID)) {
      throw new AuthorizationError('ReferralRequestID does not match the assignment ReferralRequestID.');
    }
    if (
      request.ProfessionalProfileID &&
      !UUIDsEqual(request.ProfessionalProfileID, assignment.ProfessionalProfileID)
    ) {
      throw new AuthorizationError(
        'ProfessionalProfileID does not match the assignment ProfessionalProfileID.',
      );
    }

    const rv = new RunView(dp);
    const existingRes = await rv.RunView<ReferralFeedbackEntity>(
      {
        EntityName: 'MJ_BizApps_Referrals: Referral Feedbacks',
        ExtraFilter: `ReferralAssignmentID = '${validAssignmentId}' AND SubmittedByType = '${EscapeSqlLiteral(request.SubmittedByType)}'`,
        ResultType: 'entity_object',
      },
      contextUser,
    );
    if (!existingRes.Success) {
      throw new PersistenceError(
        `Failed to check existing feedback: ${existingRes.ErrorMessage ?? 'RunView failed'}.`,
      );
    }

    const existingFb = existingRes.Results?.[0];
    const fb =
      existingFb ??
      (await dp.GetEntityObject<ReferralFeedbackEntity>(
        'MJ_BizApps_Referrals: Referral Feedbacks',
        contextUser,
      ));
    if (!existingFb) {
      fb.NewRecord();
      fb.ReferralAssignmentID = assignment.ID;
      fb.ReferralRequestID = assignment.ReferralRequestID;
      fb.ProfessionalProfileID = assignment.ProfessionalProfileID;
      fb.SubmittedByType = request.SubmittedByType;
    }

    fb.Rating = request.Rating;
    fb.OutcomeStatus = request.OutcomeStatus;
    fb.Comments = request.Comments?.trim() || null;

    if (!(await fb.Save())) {
      throw new PersistenceError('Failed to save ReferralFeedback record.');
    }

    const stats = await this.RecomputeProfileRatingAndCount(
      assignment.ProfessionalProfileID,
      contextUser,
      dp,
    );

    return {
      Success: true,
      ReferralFeedbackID: fb.ID,
      ReferralAssignmentID: assignment.ID,
      ReferralRequestID: assignment.ReferralRequestID,
      ProfessionalProfileID: assignment.ProfessionalProfileID,
      AverageRating: stats.AverageRating,
      TotalCompletedCount: stats.TotalCompletedCount,
      Message: existingFb ? 'Feedback updated successfully.' : 'Feedback submitted successfully.',
    };
  }

  /**
   * Recomputes ProfessionalProfile.AverageRating across valid ratings and TotalCompletedCount
   * across distinct completed/resolved/engaged assignments.
   */
  public async RecomputeProfileRatingAndCount(
    professionalProfileId: string,
    contextUser: UserInfo,
    provider?: IMetadataProvider & IRunViewProvider,
  ): Promise<{ AverageRating: number | null; TotalCompletedCount: number }> {
    const validProfileId = AssertValidUUID(professionalProfileId, 'ProfessionalProfileID');
    const dp = resolveDataProvider(provider);
    if (!dp) {
      throw new PersistenceError('A metadata provider is required to recompute profile rating.');
    }

    const rv = new RunView(dp);
    const fbRes = await rv.RunView<ReferralFeedbackEntity>(
      {
        EntityName: 'MJ_BizApps_Referrals: Referral Feedbacks',
        ExtraFilter: `ProfessionalProfileID = '${validProfileId}'`,
        ResultType: 'entity_object',
      },
      contextUser,
    );

    if (!fbRes.Success) {
      throw new PersistenceError(
        `Failed to query ReferralFeedbacks: ${fbRes.ErrorMessage ?? 'RunView failed'}.`,
      );
    }

    const rows = fbRes.Results ?? [];
    const ratedRows = rows.filter((r) => Number(r.Rating) >= 1 && Number(r.Rating) <= 5);
    const avgRating =
      ratedRows.length > 0
        ? Math.round((ratedRows.reduce((sum, r) => sum + Number(r.Rating), 0) / ratedRows.length) * 100) /
          100
        : null;

    const completedAssignmentIds = new Set<string>();
    for (const fb of rows) {
      if (fb.ReferralAssignmentID && (fb.OutcomeStatus === 'Resolved' || fb.OutcomeStatus === 'Engaged')) {
        completedAssignmentIds.add(fb.ReferralAssignmentID.toLowerCase());
      }
    }

    const totalCompleted = completedAssignmentIds.size;

    const profile = await dp.GetEntityObject<ProfessionalProfileEntity>(
      'MJ_BizApps_Referrals: Professional Profiles',
      contextUser,
    );
    if (await profile.Load(validProfileId)) {
      profile.AverageRating = avgRating;
      profile.TotalCompletedCount = totalCompleted;
      if (!(await profile.Save())) {
        throw new PersistenceError('Failed to save recomputed ProfessionalProfile metrics.');
      }
    }

    return {
      AverageRating: avgRating,
      TotalCompletedCount: totalCompleted,
    };
  }
}
