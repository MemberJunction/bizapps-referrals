import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { BaseRemotableOperation, IMetadataProvider, RemoteOpServerContext, UserInfo } from '@memberjunction/core';
import { MJGlobal } from '@memberjunction/global';
import { ExplainMatchOperationBase, RecommendEscalationOperationBase } from '../index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '../../../..');

function makeServerContext(): RemoteOpServerContext {
  return {
    provider: {} as IMetadataProvider,
    user: { ID: '00000000-0000-0000-0000-000000000001', Name: 'Test User' } as UserInfo,
    emitProgress: () => {},
  };
}

describe('Wave 3 Slice 3 client-safe AI operation bases', () => {
  it('ExplainMatchOperationBase declares the stable OperationKey and is resolvable via ClassFactory', () => {
    const op = MJGlobal.Instance.ClassFactory.CreateInstance<ExplainMatchOperationBase>(BaseRemotableOperation, 'Referrals.ExplainMatch');
    expect(op).toBeDefined();
    expect(op?.OperationKey).toBe('Referrals.ExplainMatch');
  });

  it('RecommendEscalationOperationBase declares the stable OperationKey and is resolvable via ClassFactory', () => {
    const op = MJGlobal.Instance.ClassFactory.CreateInstance<RecommendEscalationOperationBase>(
      BaseRemotableOperation,
      'Referrals.RecommendEscalationAction',
    );
    expect(op).toBeDefined();
    expect(op?.OperationKey).toBe('Referrals.RecommendEscalationAction');
  });

  it('ExplainMatchOperationBase has no server implementation on its own (no InternalExecute override)', async () => {
    const op = new ExplainMatchOperationBase();
    const result = await op.ExecuteServer({ ReferralRequestID: '00000000-0000-0000-0000-000000000002' }, makeServerContext());
    expect(result.Success).toBe(false);
    expect(result.ErrorMessage).toContain('no server implementation');
  });

  it('RecommendEscalationOperationBase has no server implementation on its own (no InternalExecute override)', async () => {
    const op = new RecommendEscalationOperationBase();
    const result = await op.ExecuteServer({ ReferralEscalationID: '00000000-0000-0000-0000-000000000003' }, makeServerContext());
    expect(result.Success).toBe(false);
    expect(result.ErrorMessage).toContain('no server implementation');
  });

  it('AC-31: packages/Core/package.json declares zero @memberjunction/ai-* dependencies', () => {
    const pkg = JSON.parse(readFileSync(resolve(repoRoot, 'packages/Core/package.json'), 'utf8')) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
      peerDependencies?: Record<string, string>;
    };
    const allDeps = { ...pkg.dependencies, ...pkg.devDependencies, ...pkg.peerDependencies };
    const aiDeps = Object.keys(allDeps).filter((name) => name.startsWith('@memberjunction/ai-'));
    expect(aiDeps, `Found forbidden AI deps in packages/Core/package.json: ${aiDeps.join(', ')}`).toEqual([]);
  });
});
