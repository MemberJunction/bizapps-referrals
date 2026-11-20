import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../../../..');
const ngLibDir = path.join(repoRoot, 'packages/Angular/src/lib');

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

describe('Wave 3 Slice 4 OpenApp v3 Readiness (AC-42..AC-46)', () => {
  const tsFiles = walkFiles(ngLibDir, ['.ts']).filter((f) => !f.includes('__tests__'));

  it('AC-42: zero occurrences of class="btn / btn-primary literal strings', () => {
    const forbidden = /class="btn(\s|"|-primary)/;
    for (const file of tsFiles) {
      const content = fs.readFileSync(file, 'utf8');
      expect(content, `Forbidden class="btn literal in ${file}`).not.toMatch(forbidden);
    }
  });

  it('AC-42: every <button and <a ...mjButton element carries the mjButton attribute', () => {
    for (const file of tsFiles) {
      const content = fs.readFileSync(file, 'utf8');
      const templateMatch = /template:\s*`([\s\S]*?)`,\n\s*styles:/.exec(content);
      if (!templateMatch) continue;
      const template = templateMatch[1];
      const buttonTagMatches = template.match(/<button\b[^>]*>/g) ?? [];
      for (const tag of buttonTagMatches) {
        expect(tag, `<button> without mjButton attribute in ${file}: ${tag}`).toMatch(/\bmjButton\b/);
      }
    }
  });

  it('AC-42: zero *ngIf / *ngFor / ngSwitch structural directives (CommonModule @if/@for/@switch only)', () => {
    const forbidden = /\*ngIf|\*ngFor|ngSwitch/;
    for (const file of tsFiles) {
      const content = fs.readFileSync(file, 'utf8');
      expect(content, `Forbidden structural directive in ${file}`).not.toMatch(forbidden);
    }
  });

  it('AC-42: zero literal inline style="..." attributes (dynamic [style.x] bindings are permitted)', () => {
    const forbidden = /\sstyle="/;
    for (const file of tsFiles) {
      const content = fs.readFileSync(file, 'utf8');
      expect(content, `Forbidden inline style="..." in ${file}`).not.toMatch(forbidden);
    }
  });

  it('AC-42: zero <a> tags without href or routerLink', () => {
    for (const file of tsFiles) {
      const content = fs.readFileSync(file, 'utf8');
      const templateMatch = /template:\s*`([\s\S]*?)`,\n\s*styles:/.exec(content);
      if (!templateMatch) continue;
      const template = templateMatch[1];
      const anchorTagMatches = template.match(/<a\b[^>]*>/g) ?? [];
      for (const tag of anchorTagMatches) {
        expect(tag, `<a> without href/routerLink in ${file}: ${tag}`).toMatch(/\b(href|routerLink)\s*=/);
      }
    }
  });

  it('AC-42: zero hex/rgb/hsl color literals and zero window.print / localStorage usage', () => {
    const forbidden = /#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(|window\.print|localStorage/;
    for (const file of tsFiles) {
      const content = fs.readFileSync(file, 'utf8');
      expect(content, `Forbidden raw color/print/localStorage in ${file}`).not.toMatch(forbidden);
    }
  });

  it('AC-45: packages/Angular/package.json pins the required Wave 3 S4 dev dependencies', () => {
    const pkg = JSON.parse(
      fs.readFileSync(path.join(repoRoot, 'packages/Angular/package.json'), 'utf8'),
    ) as { devDependencies?: Record<string, string> };
    const dev = pkg.devDependencies ?? {};
    expect(dev['@angular/platform-browser']).toBe('21.1.3');
    expect(dev['@angular/platform-browser-dynamic']).toBe('21.1.3');
    expect(dev['jsdom']).toBeDefined();
    expect(dev['@memberjunction/ng-ui-components']).toBe('6.3.0-edge.1');
  });

  it('AC-37/AC-38/AC-39: Escalation Console and Reciprocity Scorecard are registered as BaseResourceComponent resources', () => {
    const escalationFile = path.join(ngLibDir, 'components/escalation-console.component.ts');
    const reciprocityFile = path.join(ngLibDir, 'components/reciprocity-scorecard.component.ts');
    expect(fs.existsSync(escalationFile)).toBe(true);
    expect(fs.existsSync(reciprocityFile)).toBe(true);
    expect(fs.readFileSync(escalationFile, 'utf8')).toContain("@RegisterClass(BaseResourceComponent, 'ReferralsEscalationConsoleResource')");
    expect(fs.readFileSync(reciprocityFile, 'utf8')).toContain("@RegisterClass(BaseResourceComponent, 'ReferralsReciprocityScorecardResource')");
  });

  it('AC-44: the 3 new hero panels are registered via @RegisterClassEx(BaseFormPanel, ...) alongside all existing panels', () => {
    const content = fs.readFileSync(path.join(ngLibDir, 'form-panels/referrals-form-panels.ts'), 'utf8');
    for (const panelClass of ['ReferralEscalationHeroPanel', 'ReferralOutcomeHeroPanel', 'ProfessionalAvailabilityWindowHeroPanel']) {
      expect(content, `Missing hero panel class ${panelClass}`).toContain(`export class ${panelClass} extends BaseFormPanel`);
    }
    const registerExCount = (content.match(/@RegisterClassEx\(BaseFormPanel/g) ?? []).length;
    expect(registerExCount).toBeGreaterThanOrEqual(1);
  });

  it('AC-43: UserReferralsOverviewPanel navigates via NavigationService.OpenNavItemByName, not OpenNewEntityRecord', () => {
    const content = fs.readFileSync(path.join(ngLibDir, 'form-panels/referrals-form-panels.ts'), 'utf8');
    expect(content).toContain("this.navService.OpenNavItemByName('Pro Lead Inbox')");
    expect(content).toContain("this.navService.OpenNavItemByName('Ops Telemetry')");
    expect(content).not.toMatch(/OpenNewEntityRecord\('MJ_BizApps_Referrals: Referral Requests'\)/);
  });

  it('AC-43: ReferralRequestHeroPanel guards its ExtraFilter with AssertValidUUID', () => {
    const content = fs.readFileSync(path.join(ngLibDir, 'form-panels/referrals-form-panels.ts'), 'utf8');
    const panelSection = content.slice(content.indexOf('class ReferralRequestHeroPanel'));
    const loadSection = panelSection.slice(0, panelSection.indexOf('\n}\n'));
    expect(loadSection).toContain('AssertValidUUID(rec.ID');
  });
});
