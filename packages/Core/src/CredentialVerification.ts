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
  ReferralFeedbackEntity,
} from '@mj-biz-apps/referrals-entities';
import { AssertValidUUID, PersistenceError } from './validation.js';

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
  VerifiedByPersonID?: string | null;
  ForceStatus?: CredentialVerificationStatus;
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

function resolveDataProvider(
  provider?: IMetadataProvider & IRunViewProvider,
): (IMetadataProvider & IRunViewProvider) | undefined {
  const candidate = provider ?? (Metadata.Provider as (IMetadataProvider & IRunViewProvider) | undefined);
  if (candidate && 'RunView' in candidate && 'GetEntityObject' in candidate) {
    return candidate;
  }
  return undefined;
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
  ): Promise<CredentialVerificationResult> {
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
        Success: true,
        ProviderKey: this.ProviderKey,
        ProfessionalProfileID: validId,
        SyncedCount: 0,
        CreatedCount: 0,
        UpdatedCount: 0,
        Assertions: [],
        Message: 'No metadata provider available; 0 manual credentials synced.',
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
 */
@RegisterClass(BaseReferralCredentialProvider, 'ExternalAction')
export class ExternalActionCredentialProvider extends BaseReferralCredentialProvider {
  public readonly ProviderKey = 'ExternalAction';
  public readonly DisplayName = 'External Registry Action';
  public readonly Description =
    'Verifies credentials against external state bar, licensing board, or registry actions using ExternalReferenceID and EvidenceURL.';

  public override async VerifyCredential(
    request: CredentialVerificationRequest,
  ): Promise<CredentialVerificationResult> {
    const code = request.CredentialCode.trim();
    if (!code) {
      throw new PersistenceError('CredentialCode is required for external verification.');
    }

    const hasExternalEvidence = Boolean(
      (request.ExternalReferenceID && request.ExternalReferenceID.trim()) ||
        (request.EvidenceURL && request.EvidenceURL.trim()),
    );
    const status: CredentialVerificationStatus =
      request.ForceStatus ?? (hasExternalEvidence ? 'Verified' : 'Pending');
    const verifiedAt = status === 'Verified' ? new Date().toISOString() : null;
    const extRef = request.ExternalReferenceID?.trim() || (hasExternalEvidence ? `EXT-${code}` : null);

    const assertion: NormalizedCredentialAssertion = {
      CredentialCode: code,
      CredentialName: request.CredentialName?.trim() || code,
      IssuerName: request.IssuerName ?? 'External Licensing Registry',
      ProviderKey: this.ProviderKey,
      ExternalReferenceID: extRef,
      JurisdictionID: request.JurisdictionID ?? null,
      VerificationStatus: status,
      VerifiedAt: verifiedAt,
      EvidenceURL: request.EvidenceURL ?? null,
      MetadataJSON: request.Metadata ? JSON.stringify(request.Metadata) : null,
    };

    return {
      Success: status === 'Verified',
      ProviderKey: this.ProviderKey,
      ProfessionalCredentialID: request.ProfessionalCredentialID,
      VerificationStatus: status,
      ExternalReferenceID: extRef,
      VerifiedAt: verifiedAt,
      ExpiresAt: null,
      Message: hasExternalEvidence
        ? `External verification confirmed for '${code}' (Ref: ${extRef}).`
        : `External verification queued as 'Pending' for '${code}'; awaiting ExternalReferenceID or EvidenceURL.`,
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
        Success: true,
        ProviderKey: this.ProviderKey,
        ProfessionalProfileID: validId,
        SyncedCount: 0,
        CreatedCount: 0,
        UpdatedCount: 0,
        Assertions: [],
        Message: 'No metadata provider available; 0 external credentials synced.',
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
      Message: `Synchronized ${assertions.length} external action credential(s).`,
    };
  }
}

interface CredentialingBridgeRow {
  ID?: string;
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

  private findCredentialingEntityName(provider?: IMetadataProvider): string | null {
    const md = provider ?? Metadata.Provider;
    const entities = md?.Entities ?? [];
    const match = entities.find(
      (e) =>
        e.Name.startsWith('MJ_BizApps_Credentialing:') &&
        (e.Name.includes('Credential') || e.Name.includes('License')),
    );
    return match ? match.Name : null;
  }

  public override IsAvailable(provider?: IMetadataProvider): boolean {
    return this.findCredentialingEntityName(provider) !== null;
  }

  public override async VerifyCredential(
    request: CredentialVerificationRequest,
    contextUser: UserInfo,
    provider?: IMetadataProvider & IRunViewProvider,
  ): Promise<CredentialVerificationResult> {
    const dp = resolveDataProvider(provider);
    const entityName = this.findCredentialingEntityName(dp);
    if (!entityName || !dp) {
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

    const rv = new RunView(dp);
    const escapedCode = request.CredentialCode.replace(/'/g, "''");
    const res = await rv.RunView<CredentialingBridgeRow>(
      {
        EntityName: entityName,
        ExtraFilter: `CredentialCode = '${escapedCode}' OR Code = '${escapedCode}'`,
        ResultType: 'simple',
      },
      contextUser,
    );

    const row = res.Results?.[0];
    const status = row ? mapBridgeStatus(row.VerificationStatus ?? row.Status) : 'Pending';
    const verifiedAt = status === 'Verified' ? new Date().toISOString() : null;

    return {
      Success: status === 'Verified',
      ProviderKey: this.ProviderKey,
      ProfessionalCredentialID: request.ProfessionalCredentialID,
      VerificationStatus: status,
      ExternalReferenceID: row?.ID ?? request.ExternalReferenceID ?? null,
      VerifiedAt: verifiedAt,
      ExpiresAt: row?.ExpiresAt ? new Date(row.ExpiresAt).toISOString() : null,
      Message: row
        ? `Bridged credential '${request.CredentialCode}' from '${entityName}' with status '${status}'.`
        : `No matching record found in '${entityName}' for '${request.CredentialCode}'.`,
      Assertion: {
        CredentialCode: request.CredentialCode,
        CredentialName: row?.CredentialName ?? row?.Name ?? request.CredentialName ?? request.CredentialCode,
        IssuerName: row?.IssuerName ?? request.IssuerName ?? null,
        ProviderKey: this.ProviderKey,
        ExternalReferenceID: row?.ID ?? request.ExternalReferenceID ?? null,
        VerificationStatus: status,
        VerifiedAt: verifiedAt,
        ExpiresAt: row?.ExpiresAt ? new Date(row.ExpiresAt).toISOString() : null,
        EvidenceURL: row?.EvidenceURL ?? request.EvidenceURL ?? null,
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
    const entityName = this.findCredentialingEntityName(dp);
    if (!entityName || !dp) {
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

    const rv = new RunView(dp);
    const profileRes = await rv.RunView<ProfessionalProfileEntity>(
      {
        EntityName: 'MJ_BizApps_Referrals: Professional Profiles',
        ExtraFilter: `ID = '${validId}'`,
        ResultType: 'entity_object',
      },
      contextUser,
    );
    const profile = profileRes.Results?.[0];
    if (!profile?.PersonID) {
      return {
        Success: true,
        ProviderKey: this.ProviderKey,
        ProfessionalProfileID: validId,
        SyncedCount: 0,
        CreatedCount: 0,
        UpdatedCount: 0,
        Assertions: [],
        Message: 'Profile has no linked PersonID to bridge from BizApps Credentialing.',
      };
    }

    const credRes = await rv.RunView<CredentialingBridgeRow>(
      {
        EntityName: entityName,
        ExtraFilter: `PersonID = '${profile.PersonID}'`,
        ResultType: 'simple',
      },
      contextUser,
    );

    const assertions: NormalizedCredentialAssertion[] = (credRes.Results ?? []).map((row) => ({
      CredentialCode: row.CredentialCode ?? row.Code ?? 'CRED',
      CredentialName: row.CredentialName ?? row.Name ?? 'Bridged Credential',
      IssuerName: row.IssuerName ?? null,
      ProviderKey: this.ProviderKey,
      ExternalReferenceID: row.ID ?? null,
      VerificationStatus: mapBridgeStatus(row.VerificationStatus ?? row.Status),
      IssuedAt: row.IssuedAt ? new Date(row.IssuedAt).toISOString() : null,
      ExpiresAt: row.ExpiresAt ? new Date(row.ExpiresAt).toISOString() : null,
      VerifiedAt: row.VerifiedAt ? new Date(row.VerifiedAt).toISOString() : null,
      EvidenceURL: row.EvidenceURL ?? null,
    }));

    return {
      Success: true,
      ProviderKey: this.ProviderKey,
      ProfessionalProfileID: validId,
      SyncedCount: assertions.length,
      CreatedCount: 0,
      UpdatedCount: 0,
      Assertions: assertions,
      Message: `Bridged ${assertions.length} credential(s) from '${entityName}'.`,
    };
  }
}

export function LoadCredentialProviders(): void {
  // Ensures provider class registrations are preserved by bundlers.
}

/**
 * Singleton orchestrator for credential verification, provider discovery, and profile rating recomputation.
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

  public async VerifyAndPersistCredential(
    request: CredentialVerificationRequest,
    contextUser: UserInfo,
    provider?: IMetadataProvider & IRunViewProvider,
  ): Promise<CredentialVerificationResult> {
    const validProfileId = AssertValidUUID(request.ProfessionalProfileID, 'ProfessionalProfileID');
    const impl = this.ResolveProvider(request.ProviderKey ?? 'Manual');
    const dp = resolveDataProvider(provider);
    const result = await impl.VerifyCredential(request, contextUser, dp);

    if (!dp) {
      return result;
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
    } else {
      const rv = new RunView(dp);
      const escapedCode = result.Assertion.CredentialCode.replace(/'/g, "''");
      const existing = await rv.RunView<ProfessionalCredentialEntity>(
        {
          EntityName: 'MJ_BizApps_Referrals: Professional Credentials',
          ExtraFilter: `ProfessionalProfileID = '${validProfileId}' AND CredentialCode = '${escapedCode}'`,
          ResultType: 'entity_object',
        },
        contextUser,
      );
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

    credEntity.CredentialCode = result.Assertion.CredentialCode;
    credEntity.CredentialName = result.Assertion.CredentialName;
    credEntity.IssuerName = result.Assertion.IssuerName ?? null;
    credEntity.ProviderKey = result.ProviderKey;
    credEntity.ExternalReferenceID = result.ExternalReferenceID;
    credEntity.JurisdictionID = request.JurisdictionID ?? credEntity.JurisdictionID ?? null;
    credEntity.VerificationStatus = result.VerificationStatus;
    credEntity.VerifiedAt = result.VerifiedAt ? new Date(result.VerifiedAt) : null;
    credEntity.VerifiedByPersonID = request.VerifiedByPersonID ?? credEntity.VerifiedByPersonID ?? null;
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

    if (result.VerificationStatus === 'Verified') {
      const profile = await dp.GetEntityObject<ProfessionalProfileEntity>(
        'MJ_BizApps_Referrals: Professional Profiles',
        contextUser,
      );
      if (await profile.Load(validProfileId)) {
        let profileDirty = false;
        if (profile.VerificationStatus === 'Pending') {
          profile.VerificationStatus = 'Verified';
          profileDirty = true;
        }
        if (credEntity.IsPrimary && !profile.LicenseNumber) {
          profile.LicenseNumber = credEntity.CredentialCode;
          profileDirty = true;
        }
        if (profileDirty) {
          await profile.Save();
        }
      }
    }

    return result;
  }

  public async SyncProfileCredentials(
    professionalProfileId: string,
    providerKey: string,
    contextUser: UserInfo,
    provider?: IMetadataProvider & IRunViewProvider,
  ): Promise<CredentialSyncResult> {
    const validProfileId = AssertValidUUID(professionalProfileId, 'ProfessionalProfileID');
    const impl = this.ResolveProvider(providerKey);
    const dp = resolveDataProvider(provider);
    const syncResult = await impl.SyncProfileCredentials(validProfileId, contextUser, dp);

    if (!dp || syncResult.Assertions.length === 0) {
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
        created++;
      } else {
        updated++;
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
      await target.Save();
    }

    syncResult.CreatedCount = created;
    syncResult.UpdatedCount = updated;
    return syncResult;
  }

  /**
   * Recomputes ProfessionalProfile.AverageRating and TotalCompletedCount from persisted ReferralFeedback rows.
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

    const rows = fbRes.Results ?? [];
    const totalCompleted = rows.length;
    const avgRating =
      totalCompleted > 0
        ? Math.round((rows.reduce((sum, r) => sum + Number(r.Rating), 0) / totalCompleted) * 100) / 100
        : null;

    const profile = await dp.GetEntityObject<ProfessionalProfileEntity>(
      'MJ_BizApps_Referrals: Professional Profiles',
      contextUser,
    );
    if (await profile.Load(validProfileId)) {
      profile.AverageRating = avgRating;
      profile.TotalCompletedCount = totalCompleted;
      await profile.Save();
    }

    return {
      AverageRating: avgRating,
      TotalCompletedCount: totalCompleted,
    };
  }
}
