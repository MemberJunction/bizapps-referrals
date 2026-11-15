import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '../../../..');
const metadataPath = resolve(repoRoot, 'metadata/actions/.referrals-actions.json');
const sourceFiles = [resolve(__dirname, '../index.ts'), resolve(__dirname, '../lifecycle-actions.ts')];

interface ActionMetadataRecord {
  fields: { Name: string; DriverClass: string };
  relatedEntities?: {
    'MJ: Action Params'?: Array<{ fields: { Name: string } }>;
  };
}

function loadDeclaredParamsByActionName(): Map<string, Set<string>> {
  const raw = readFileSync(metadataPath, 'utf8');
  const records = JSON.parse(raw) as ActionMetadataRecord[];
  const map = new Map<string, Set<string>>();
  for (const record of records) {
    const params = record.relatedEntities?.['MJ: Action Params'] ?? [];
    map.set(record.fields.Name, new Set(params.map((p) => p.fields.Name)));
  }
  return map;
}

/**
 * Scans `@RegisterClass(BaseAction, 'Referrals.X')` class bodies for
 * getStringParam/getBooleanParam/getNumberParam(params, 'Y') usages, keyed by
 * the action Name ('Referrals.X'), so we can verify every code-read param has
 * a matching metadata declaration (and vice versa isn't required, since some
 * actions legitimately accept optional params no current code path reads yet).
 */
function extractUsedParamsByActionName(): Map<string, Set<string>> {
  const result = new Map<string, Set<string>>();
  const registerClassRe = /@RegisterClass\(BaseAction,\s*'([^']+)'\)\s*export class (\w+)/g;
  const paramUsageRe = /get(?:String|Boolean|Number)Param\(params,\s*'([^']+)'\)/g;

  for (const file of sourceFiles) {
    const content = readFileSync(file, 'utf8');
    const matches = [...content.matchAll(registerClassRe)];
    for (let i = 0; i < matches.length; i++) {
      const [, actionName] = matches[i];
      const startIdx = matches[i].index! + matches[i][0].length;
      const endIdx = i + 1 < matches.length ? matches[i + 1].index! : content.length;
      const classBody = content.slice(startIdx, endIdx);
      const used = result.get(actionName) ?? new Set<string>();
      for (const paramMatch of classBody.matchAll(paramUsageRe)) {
        used.add(paramMatch[1]);
      }
      result.set(actionName, used);
    }
  }
  return result;
}

describe('Referrals Action metadata parity', () => {
  const declared = loadDeclaredParamsByActionName();
  const used = extractUsedParamsByActionName();

  it('declares at least one MJ: Action Param block for every BaseAction found in source', () => {
    for (const actionName of used.keys()) {
      expect(declared.has(actionName), `Action '${actionName}' is missing from metadata/actions/.referrals-actions.json`).toBe(true);
    }
  });

  it('every param read via getStringParam/getBooleanParam/getNumberParam has a matching metadata Action Param', () => {
    const missing: string[] = [];
    for (const [actionName, usedParams] of used.entries()) {
      const declaredParams = declared.get(actionName) ?? new Set<string>();
      for (const paramName of usedParams) {
        if (!declaredParams.has(paramName)) {
          missing.push(`${actionName}.${paramName}`);
        }
      }
    }
    expect(missing, `Params read in code but missing from metadata: ${missing.join(', ')}`).toEqual([]);
  });

  it('registers Referrals.SubmitReferralIntake, MarkReferralInProgress, CompleteReferral, and SetAvailabilityWindow in metadata', () => {
    expect(declared.has('Referrals.SubmitReferralIntake')).toBe(true);
    expect(declared.has('Referrals.MarkReferralInProgress')).toBe(true);
    expect(declared.has('Referrals.CompleteReferral')).toBe(true);
    expect(declared.has('Referrals.SetAvailabilityWindow')).toBe(true);
  });
});
