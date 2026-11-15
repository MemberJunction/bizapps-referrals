import '@angular/compiler';
import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { MJGlobal } from '@memberjunction/global';
import { BaseFormComponent, BaseFormPanel } from '@memberjunction/ng-base-forms';
import { BaseResourceComponent } from '@memberjunction/ng-shared';
import {
  LoadBizAppsReferralsClient,
  REFERRALS_ENTITY_FORM_COMPONENTS,
} from '../public-api.js';

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
  it('registers all 15 BaseFormComponent classes, form panels, and all 7 DefaultNavItems resources in ClassFactory', () => {
    LoadBizAppsReferralsClient();

    const entitiesJsonPath = path.join(repoRoot, 'metadata/entities/.entities.json');
    const entityRecords = JSON.parse(fs.readFileSync(entitiesJsonPath, 'utf8')) as Array<{
      fields: { Name: string };
    }>;
    const expectedEntities = entityRecords.map((r) => r.fields.Name);
    expect(expectedEntities).toHaveLength(15);
    expect(REFERRALS_ENTITY_FORM_COMPONENTS).toHaveLength(expectedEntities.length);
    for (const entityName of expectedEntities) {
      expect(
        MJGlobal.Instance.ClassFactory.GetRegistration(BaseFormComponent, entityName),
        `Missing BaseFormComponent registration for ${entityName}`,
      ).toBeDefined();
    }

    // BaseFormPanel hero panels are a deliberately smaller, curated subset (not
    // one-per-entity — e.g. the 4 Wave 3 Slice 1 entities use plain
    // BaseFormComponent forms with no dedicated hero panel), so this asserts a
    // stable floor rather than parity with the entity count.
    const panelRegs = MJGlobal.Instance.ClassFactory.GetRegistrationsByRootClass(BaseFormPanel);
    expect(panelRegs.length).toBeGreaterThanOrEqual(17);

    // AC-44: the 3 new Wave 3 Slice 4 hero panels are reachable by their exact
    // @RegisterClassEx(BaseFormPanel, { key: ... }) registration key.
    for (const key of [
      'referrals:referral-escalation-hero-panel',
      'referrals:referral-outcome-hero-panel',
      'referrals:professional-availability-window-hero-panel',
    ]) {
      expect(
        MJGlobal.Instance.ClassFactory.GetRegistration(BaseFormPanel, key),
        `Missing BaseFormPanel registration for key '${key}'`,
      ).toBeDefined();
    }

    const appJsonPath = path.join(repoRoot, 'metadata/applications/.referrals-application.json');
    const parsed = JSON.parse(fs.readFileSync(appJsonPath, 'utf8')) as Array<{
      fields: { DefaultNavItems: Array<{ Label: string; DriverClass: string; Icon: string }> };
    }>;
    const navItems = parsed[0].fields.DefaultNavItems;
    expect(navItems).toHaveLength(7);
    for (const item of navItems) {
      expect(
        MJGlobal.Instance.ClassFactory.GetRegistration(BaseResourceComponent, item.DriverClass),
        `Missing BaseResourceComponent registration for DefaultNavItem '${item.Label}' (${item.DriverClass})`,
      ).toBeDefined();
    }
  });

  it('verifies dual-dialect Wave 2 migration DDL and valid PostgreSQL FK syntax', () => {
    const sqlV2 = fs.readFileSync(
      path.join(repoRoot, 'migrations/V202611141200__v1.1.0__Credentials_And_License_Normalization.sql'),
      'utf8',
    );
    const pgV1 = fs.readFileSync(
      path.join(repoRoot, 'migrations-pg/V202611131600__v1.0.x__Initial_Referrals_Schema.pg.sql'),
      'utf8',
    );
    const pgV2 = fs.readFileSync(
      path.join(repoRoot, 'migrations-pg/V202611141200__v1.1.0__Credentials_And_License_Normalization.pg.sql'),
      'utf8',
    );

    expect(sqlV2).toContain('vwProfessionalCredentials');
    expect(sqlV2).toContain('spCreateProfessionalCredential');
    expect(sqlV2).toContain('spUpdateProfessionalCredential');
    expect(sqlV2).toContain('spDeleteProfessionalCredential');
    expect(sqlV2).toContain('__mj_CreatedAt');
    expect(sqlV2).toContain('__mj_UpdatedAt');

    expect(pgV1).not.toMatch(/FOREIGN KEY REFERENCES/);
    expect(pgV2).toContain('vwProfessionalCredentials');
    expect(pgV2).toContain('spCreateProfessionalCredential');
    expect(pgV2).toContain('spUpdateProfessionalCredential');
    expect(pgV2).toContain('spDeleteProfessionalCredential');
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

  // This test file's own path is excluded from each scan below (not the whole
  // __tests__ directory) because its source literally contains the regex
  // patterns being searched for (e.g. the string '.(Get|Set)(' and '<any>'
  // appear in this file's own source as scan patterns, not as violations).
  const SELF_TEST_FILE = 'referrals-wave2-readiness.test.ts';

  it('enforces zero handwritten .Get()/.Set() calls in authored packages (including tests) and zero un-typed casts across packages', () => {
    // Generated entity classes in packages/Entities/src/generated/ wrap BaseEntity.Get/Set;
    // all handwritten packages must use strongly-typed entity property accessors only.
    const handwrittenDirs = [
      'packages/Core/src',
      'packages/Actions/src',
      'packages/Angular/src',
      'packages/EntitiesServer/src',
      'packages/Server/src',
    ];
    for (const rel of handwrittenDirs) {
      const files = walkFiles(path.join(repoRoot, rel), ['.ts']).filter((f) => !f.endsWith(SELF_TEST_FILE));
      for (const file of files) {
        const content = fs.readFileSync(file, 'utf8');
        expect(content, `Forbidden .Get()/.Set() in ${file}`).not.toMatch(/\.(Get|Set)\(\s*['"]/);
      }
    }

    const forbiddenWord = 'un' + 'known';
    const forbiddenRegex = new RegExp(`\\b${forbiddenWord}\\b`);
    const allPkgDirs = [...handwrittenDirs, 'packages/IntegrationTests/src'];
    for (const rel of allPkgDirs) {
      const files = walkFiles(path.join(repoRoot, rel), ['.ts']).filter((f) => !f.endsWith(SELF_TEST_FILE));
      for (const file of files) {
        const content = fs.readFileSync(file, 'utf8');
        expect(content, `Forbidden ${forbiddenWord} type/cast in ${file}`).not.toMatch(forbiddenRegex);
      }
    }
  });

  it('AC-2: enforces zero `: any` / `as any` / `<any>` type annotations or casts across all handwritten packages, including __tests__', () => {
    const handwrittenDirs = [
      'packages/Core/src',
      'packages/Actions/src',
      'packages/Angular/src',
      'packages/EntitiesServer/src',
      'packages/Server/src',
      'packages/IntegrationTests/src',
    ];
    // Strip comments before matching so prose like "as well as any active matter parties"
    // in a /** */ or // comment is never mistaken for a real `as any` cast.
    const stripComments = (src: string): string =>
      src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
    const anyRegex = /:\s*any\b|\bas\s+any\b|<any>/;

    for (const rel of handwrittenDirs) {
      const files = walkFiles(path.join(repoRoot, rel), ['.ts']).filter(
        (f) => !f.includes('generated') && !f.endsWith(SELF_TEST_FILE),
      );
      for (const file of files) {
        const content = stripComments(fs.readFileSync(file, 'utf8'));
        expect(content, `Forbidden 'any' type/cast in ${file}`).not.toMatch(anyRegex);
      }
    }
  });
});
