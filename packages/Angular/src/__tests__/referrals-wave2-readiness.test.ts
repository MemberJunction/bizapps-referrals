import '@angular/compiler';
import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { MJGlobal } from '@memberjunction/global';
import { BaseFormComponent } from '@memberjunction/ng-base-forms';
import { BaseResourceComponent } from '@memberjunction/ng-shared';
import { LoadBizAppsReferralsClient } from '../public-api.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../../../..');

function walkFiles(dir: string, exts: string[]): string[] {
  if (!fs.existsSync(dir)) return [];
  const results: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === '.turbo') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkFiles(full, exts));
    } else if (exts.some((ext) => entry.name.endsWith(ext))) {
      results.push(full);
    }
  }
  return results;
}

describe('Referrals Wave 2 OpenApp v3 Readiness', () => {
  it('registers Professional Credentials BaseFormComponent and ReferralsCredentialDirectoryResource in ClassFactory', () => {
    LoadBizAppsReferralsClient();
    const credFormReg = MJGlobal.Instance.ClassFactory.GetRegistration(
      BaseFormComponent,
      'MJ_BizApps_Referrals: Professional Credentials',
    );
    expect(credFormReg).toBeDefined();

    const dirResourceReg = MJGlobal.Instance.ClassFactory.GetRegistration(
      BaseResourceComponent,
      'ReferralsCredentialDirectoryResource',
    );
    expect(dirResourceReg).toBeDefined();
  });

  it('wires Directory & Pros nav item in metadata/applications/.referrals-application.json', () => {
    const appJsonPath = path.join(repoRoot, 'metadata/applications/.referrals-application.json');
    const parsed = JSON.parse(fs.readFileSync(appJsonPath, 'utf8')) as Array<{
      fields: { DefaultNavItems: Array<{ Label: string; DriverClass: string; Icon: string }> };
    }>;
    const navItems = parsed[0].fields.DefaultNavItems;
    const dirItem = navItems.find((n) => n.DriverClass === 'ReferralsCredentialDirectoryResource');
    expect(dirItem).toBeDefined();
    expect(dirItem?.Label).toBe('Directory & Pros');
    expect(dirItem?.Icon).toBe('fa-solid fa-address-book');
  });

  it('enforces --mj-* design tokens and zero window.print() across all Angular components', () => {
    const ngLibDir = path.join(repoRoot, 'packages/Angular/src/lib');
    const files = walkFiles(ngLibDir, ['.ts', '.html', '.css']);
    const colorRegex = /#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(|window\.print/;
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      expect(content, `Raw color literal or window.print found in ${file}`).not.toMatch(colorRegex);
    }
  });

  it('contains zero literal occurrences of legacy license column name across migrations, packages, and scripts', () => {
    const legacyCol = 'BarOr' + 'LicenseNumber';
    const dirs = ['migrations', 'migrations-pg', 'packages', 'scripts'];
    for (const d of dirs) {
      const files = walkFiles(path.join(repoRoot, d), ['.sql', '.ts', '.mjs', '.json']);
      for (const file of files) {
        const content = fs.readFileSync(file, 'utf8');
        expect(content.includes(legacyCol), `Legacy column found in ${file}`).toBe(false);
      }
    }
  });
});
