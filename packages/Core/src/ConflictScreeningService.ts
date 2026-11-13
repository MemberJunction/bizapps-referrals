import { ConflictCheckPartyEntity, ProfessionalProfileEntity } from '@mj-biz-apps/referrals-entities';
import { ConflictPartyInput, ConflictScreeningResult } from './types.js';

const LEGAL_SUFFIXES = new Set([
  'llc',
  'inc',
  'incorporated',
  'corp',
  'corporation',
  'llp',
  'lp',
  'pc',
  'pa',
  'pllc',
  'ltd',
  'limited',
  'co',
  'company',
  'group',
  'associates',
  'partners',
]);

export interface ActiveMatterPartyRecord {
  ProfessionalProfileID: string;
  PartyName: string;
  OrganizationName: string | null;
}

/**
 * Normalizes a person or organization name for deterministic conflict-of-interest matching.
 * Strips punctuation, collapses whitespace, and removes common corporate suffixes.
 */
export function NormalizePartyName(rawName: string): string {
  const cleaned = rawName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleaned) {
    return '';
  }

  const tokens = cleaned.split(' ').filter((token) => !LEGAL_SUFFIXES.has(token));
  return tokens.length > 0 ? tokens.join(' ') : cleaned;
}

export class ConflictScreeningService {
  /**
   * Screens a candidate professional against the referral request's conflict check parties
   * as well as any active matter parties the professional is currently representing.
   */
  public static ScreenCandidate(
    professional: Pick<ProfessionalProfileEntity, 'ID' | 'DisplayName' | 'FirmName' | 'Email'>,
    requestParties: ReadonlyArray<Pick<ConflictCheckPartyEntity, 'PartyName' | 'PartyRole' | 'OrganizationName' | 'NormalizedName'> | ConflictPartyInput>,
    activeMatterParties: ReadonlyArray<ActiveMatterPartyRecord> = [],
  ): ConflictScreeningResult {
    const reasons: string[] = [];

    const proDisplayNorm = NormalizePartyName(professional.DisplayName);
    const proFirmNorm = professional.FirmName ? NormalizePartyName(professional.FirmName) : '';
    const proEmailDomain = (professional.Email.split('@')[1] ?? '').toLowerCase();

    const activeForPro = activeMatterParties.filter((m) => m.ProfessionalProfileID === professional.ID);
    const activeNorms = new Set<string>();
    for (const active of activeForPro) {
      const pNorm = NormalizePartyName(active.PartyName);
      if (pNorm) activeNorms.add(pNorm);
      if (active.OrganizationName) {
        const oNorm = NormalizePartyName(active.OrganizationName);
        if (oNorm) activeNorms.add(oNorm);
      }
    }

    for (const party of requestParties) {
      const partyNorm =
        'NormalizedName' in party && party.NormalizedName
          ? party.NormalizedName
          : NormalizePartyName(party.PartyName);
      const orgNorm = party.OrganizationName ? NormalizePartyName(party.OrganizationName) : '';

      // 1. Direct match against professional's own name or firm
      if (partyNorm && (partyNorm === proDisplayNorm || (proFirmNorm && partyNorm === proFirmNorm))) {
        reasons.push(`Direct conflict: ${party.PartyRole} party '${party.PartyName}' matches professional or firm.`);
      }
      if (orgNorm && proFirmNorm && orgNorm === proFirmNorm) {
        reasons.push(`Firm conflict: ${party.PartyRole} organization '${party.OrganizationName}' matches firm '${professional.FirmName}'.`);
      }

      // 2. Domain match for non-public email domains when organization name matches
      if (proEmailDomain && orgNorm && proEmailDomain.includes(orgNorm.replace(/\s+/g, ''))) {
        if (!['gmail.com', 'outlook.com', 'yahoo.com', 'icloud.com'].includes(proEmailDomain)) {
          reasons.push(`Domain conflict: professional email domain '${proEmailDomain}' aligns with '${party.OrganizationName}'.`);
        }
      }

      // 3. Cross-matter conflict: professional is actively engaged with an adverse or related party
      if (party.PartyRole === 'Adverse' || party.PartyRole === 'RelatedEntity') {
        if (partyNorm && activeNorms.has(partyNorm)) {
          reasons.push(`Active matter conflict: professional has an active engagement involving '${party.PartyName}'.`);
        }
        if (orgNorm && activeNorms.has(orgNorm)) {
          reasons.push(`Active matter conflict: professional has an active engagement involving '${party.OrganizationName}'.`);
        }
      }
    }

    return {
      HasConflict: reasons.length > 0,
      Status: reasons.length > 0 ? 'ConflictFound' : 'Cleared',
      Reasons: reasons,
    };
  }
}
