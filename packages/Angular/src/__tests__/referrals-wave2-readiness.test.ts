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
  it('registers all 11 BaseFormComponent classes, form panels, and all 5 DefaultNavItems resources in ClassFactory', () => {
    LoadBizAppsReferralsClient();

    const entitiesJsonPath = path.join(repoRoot, 'metadata/entities/.entities.json');
    const entityRecords = JSON.parse(fs.readFileSync(entitiesJsonPath, 'utf8')) as Array<{
      fields: { Name: string };
    }>;
    const expectedEntities = entityRecords.map((r) => r.fields.Name);
    expect(expectedEntities).toHaveLength(11);
    expect(REFERRALS_ENTITY_FORM_COMPONENTS).toHaveLength(expectedEntities.length);
    for (const entityName of expectedEntities) {
      expect(
        MJGlobal.Instance.ClassFactory.GetRegistration(BaseFormComponent, entityName),
        `Missing BaseFormComponent registration for ${entityName}`,
      ).toBeDefined();
    }

    const panelRegs = MJGlobal.Instance.ClassFactory.GetRegistrationsByRootClass(BaseFormPanel);
    expect(panelRegs.length).toBeGreaterThanOrEqual(expectedEntities.length);

    const appJsonPath = path.join(repoRoot, 'metadata/applications/.referrals-application.json');
    const parsed = JSON.parse(fs.readFileSync(appJsonPath, 'utf8')) as Array<{
      fields: { DefaultNavItems: Array<{ Label: string; DriverClass: string; Icon: string }> };
    }>;
    const navItems = parsed[0].fields.DefaultNavItems;
    expect(navItems).toHaveLength(5);
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

  it('enforces zero handwritten .Get()/.Set() calls in authored packages and zero un-typed casts across packages', () => {
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
      const files = walkFiles(path.join(repoRoot, rel), ['.ts']).filter((f) => !f.includes('__tests__'));
      for (const file of files) {
        const content = fs.readFileSync(file, 'utf8');
        expect(content, `Forbidden .Get()/.Set() in ${file}`).not.toMatch(/\.(Get|Set)\(\s*['"]/);
      }
    }

    const forbiddenWord = 'un' + 'known';
    const forbiddenRegex = new RegExp(`\\b${forbiddenWord}\\b`);
    const allPkgDirs = [...handwrittenDirs, 'packages/IntegrationTests/src'];
    for (const rel of allPkgDirs) {
      const files = walkFiles(path.join(repoRoot, rel), ['.ts']);
      for (const file of files) {
        const content = fs.readFileSync(file, 'utf8');
        expect(content, `Forbidden ${forbiddenWord} type/cast in ${file}`).not.toMatch(forbiddenRegex);
      }
    }
  });
});
