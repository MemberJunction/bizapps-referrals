import { describe, expect, it, vi } from 'vitest';
import { IMetadataProvider, IRunViewProvider, UserInfo } from '@memberjunction/core';
import {
  ExternalActionCredentialProvider,
  ManualReferralCredentialProvider,
  OptionalCredentialingBridgeProvider,
  ReferralCredentialService,
} from '../CredentialVerification.js';

const testUser = new UserInfo({ ID: '00000000-0000-0000-0000-000000000001', Name: 'Test Coordinator' });
const proId = 'D2000001-0000-0000-0000-000000000101';

describe('Pluggable Credential Verification Architecture', () => {
  it('verifies credentials via ManualReferralCredentialProvider', async () => {
    const provider = new ManualReferralCredentialProvider();
    const res = await provider.VerifyCredential({
      ProfessionalProfileID: proId,
      CredentialCode: 'CA-BAR-298410',
      CredentialName: 'State Bar of California',
      IssuerName: 'State Bar of California',
    });

    expect(res.Success).toBe(true);
    expect(res.ProviderKey).toBe('Manual');
    expect(res.VerificationStatus).toBe('Verified');
    expect(res.VerifiedAt).toBeTruthy();
    expect(res.Assertion.CredentialCode).toBe('CA-BAR-298410');
  });

  it('queues Pending when ExternalActionCredentialProvider lacks external reference or evidence', async () => {
    const provider = new ExternalActionCredentialProvider();
    const pendingRes = await provider.VerifyCredential({
      ProfessionalProfileID: proId,
      CredentialCode: 'CISSP-77219',
    });
    expect(pendingRes.Success).toBe(false);
    expect(pendingRes.VerificationStatus).toBe('Pending');

    const verifiedRes = await provider.VerifyCredential({
      ProfessionalProfileID: proId,
      CredentialCode: 'CISSP-77219',
      ExternalReferenceID: 'ISC2-77219',
    });
    expect(verifiedRes.Success).toBe(true);
    expect(verifiedRes.VerificationStatus).toBe('Verified');
    expect(verifiedRes.ExternalReferenceID).toBe('ISC2-77219');
  });

  it('detects optional BizApps Credentialing entities via runtime Metadata inspection', async () => {
    const bridge = new OptionalCredentialingBridgeProvider();
    const withoutCreds = { Entities: [{ Name: 'MJ_BizApps_Referrals: Professional Profiles' }] } as unknown as IMetadataProvider;
    expect(bridge.IsAvailable(withoutCreds)).toBe(false);

    const unavailableRes = await bridge.VerifyCredential(
      { ProfessionalProfileID: proId, CredentialCode: 'CPA-NY-091283' },
      testUser,
      withoutCreds as unknown as IMetadataProvider & IRunViewProvider,
    );
    expect(unavailableRes.Success).toBe(false);
    expect(unavailableRes.Message).toContain('not installed');

    const withCreds = {
      Entities: [{ Name: 'MJ_BizApps_Credentialing: Professional Credentials' }],
      RunView: vi.fn().mockResolvedValue({
        Success: true,
        Results: [{ ID: 'CRED-1', CredentialCode: 'CPA-NY-091283', CredentialName: 'NY CPA', VerificationStatus: 'Verified' }],
      }),
      GetEntityObject: vi.fn(),
    } as unknown as IMetadataProvider & IRunViewProvider;

    expect(bridge.IsAvailable(withCreds)).toBe(true);
    const bridgedRes = await bridge.VerifyCredential(
      { ProfessionalProfileID: proId, CredentialCode: 'CPA-NY-091283' },
      testUser,
      withCreds,
    );
    expect(bridgedRes.Success).toBe(true);
    expect(bridgedRes.VerificationStatus).toBe('Verified');
  });

  it('lists all 3 registered providers via ReferralCredentialService.Instance', () => {
    const providers = ReferralCredentialService.Instance.ListProviders();
    const keys = providers.map((p) => p.ProviderKey);
    expect(keys).toContain('Manual');
    expect(keys).toContain('ExternalAction');
    expect(keys).toContain('BizAppsCredentialingBridge');
  });
});
