import { Metadata, RunView, UserInfo } from '@memberjunction/core';
import type { IntegrationCheckContext } from '@memberjunction/testing-integration';
import { NormalizePartyName } from '@mj-biz-apps/referrals-core';
import {
  ConflictCheckPartyEntity,
  JurisdictionEntity,
  PracticeAreaEntity,
  ProfessionalJurisdictionEntity,
  ProfessionalPracticeAreaEntity,
  ProfessionalProfileEntity,
  ReferralAssignmentEntity,
  ReferralRequestEntity,
  ReferralTierEntity,
} from '@mj-biz-apps/referrals-entities';

export interface ReferralsWorldState {
  PracticeAreas: Record<string, PracticeAreaEntity>;
  Jurisdictions: Record<string, JurisdictionEntity>;
  ReferralTiers: Record<string, ReferralTierEntity>;
  Professionals: Record<string, ProfessionalProfileEntity>;
  Requests: Record<string, ReferralRequestEntity>;
  Assignments: ReferralAssignmentEntity[];
  ConflictParties: ConflictCheckPartyEntity[];
}

const worldByUser = new Map<string, ReferralsWorldState>();

export function getReferralsWorld(ctx: IntegrationCheckContext): ReferralsWorldState {
  const key = ctx.User.ID || 'default';
  let state = worldByUser.get(key);
  if (!state) {
    state = {
      PracticeAreas: {},
      Jurisdictions: {},
      ReferralTiers: {},
      Professionals: {},
      Requests: {},
      Assignments: [],
      ConflictParties: [],
    };
    worldByUser.set(key, state);
  }
  return state;
}

async function resolveUserIdByEmail(email: string, user: UserInfo): Promise<string | null> {
  const rv = new RunView();
  const escaped = email.replace(/'/g, "''");
  const res = await rv.RunView<{ ID: string }>(
    {
      EntityName: 'MJ: Users',
      ExtraFilter: `Email='${escaped}'`,
      Fields: ['ID'],
      MaxRows: 1,
      ResultType: 'simple',
    },
    user,
  );
  return res.Success && res.Results.length > 0 ? res.Results[0].ID : null;
}

export async function ensureReferralsCatalog(
  ctx: IntegrationCheckContext,
  state: ReferralsWorldState,
): Promise<void> {
  const rv = new RunView();
  const [paRes, jurRes, tierRes] = await rv.RunViews(
    [
      { EntityName: 'MJ_BizApps_Referrals: Practice Areas', ResultType: 'entity_object' },
      { EntityName: 'MJ_BizApps_Referrals: Jurisdictions', ResultType: 'entity_object' },
      { EntityName: 'MJ_BizApps_Referrals: Referral Tiers', ResultType: 'entity_object' },
    ],
    ctx.User,
  );

  for (const pa of (paRes.Results ?? []) as PracticeAreaEntity[]) {
    state.PracticeAreas[pa.Code] = pa;
  }
  for (const jur of (jurRes.Results ?? []) as JurisdictionEntity[]) {
    state.Jurisdictions[jur.Code] = jur;
  }
  for (const tier of (tierRes.Results ?? []) as ReferralTierEntity[]) {
    state.ReferralTiers[tier.Code] = tier;
  }
}

export async function ensureReferralsWorld(ctx: IntegrationCheckContext): Promise<ReferralsWorldState> {
  const state = getReferralsWorld(ctx);
  await ensureReferralsCatalog(ctx, state);

  const md = new Metadata();
  const rv = new RunView();

  const amithUserId = await resolveUserIdByEmail('amith@bluecypress.io', ctx.User);
  const robotUserId = await resolveUserIdByEmail('da-robot-tester@bluecypress.io', ctx.User);

  const proSpecs: Array<{
    key: string;
    displayName: string;
    firmName: string;
    email: string;
    verification: ProfessionalProfileEntity['VerificationStatus'];
    availability: ProfessionalProfileEntity['AvailabilityStatus'];
    activeCount: number;
    maxConcurrent: number;
    avgHours: number;
    avgRating: number;
    proBono: boolean;
    practiceCodes: string[];
    jurisdictionCodes: string[];
    userId: string | null;
  }> = [
    {
      key: 'VANCE',
      displayName: 'Elena Vance, Esq.',
      firmName: 'Vance & Sterling LLP',
      email: 'elena.vance@vancesterling.com',
      verification: 'Verified',
      availability: 'Available',
      activeCount: 2,
      maxConcurrent: 8,
      avgHours: 2.4,
      avgRating: 4.9,
      proBono: false,
      practiceCodes: ['CORP_MA', 'IP_LAW'],
      jurisdictionCodes: ['US-NY', 'US-DE'],
      userId: amithUserId,
    },
    {
      key: 'THORNE',
      displayName: 'Marcus Thorne, Esq.',
      firmName: 'Thorne Commercial Law',
      email: 'm.thorne@thornelaw.com',
      verification: 'Verified',
      availability: 'Available',
      activeCount: 1,
      maxConcurrent: 6,
      avgHours: 3.1,
      avgRating: 4.8,
      proBono: true,
      practiceCodes: ['COMM_LIT', 'CORP_MA'],
      jurisdictionCodes: ['US-CA', 'US-FED'],
      userId: robotUserId,
    },
    {
      key: 'NAIR',
      displayName: 'Priya Nair, Esq.',
      firmName: 'Pacific IP & Tech Counsel',
      email: 'priya@pacificip.io',
      verification: 'Verified',
      availability: 'Available',
      activeCount: 3,
      maxConcurrent: 10,
      avgHours: 1.8,
      avgRating: 5.0,
      proBono: false,
      practiceCodes: ['IP_LAW'],
      jurisdictionCodes: ['US-CA', 'US-FED'],
      userId: null,
    },
    {
      key: 'KOWALSKI',
      displayName: 'David Kowalski, Esq.',
      firmName: 'Midwest Labor Advocates',
      email: 'dkowalski@midwestlabor.org',
      verification: 'Verified',
      availability: 'Limited',
      activeCount: 4,
      maxConcurrent: 5,
      avgHours: 5.2,
      avgRating: 4.6,
      proBono: true,
      practiceCodes: ['EMP_LABOR'],
      jurisdictionCodes: ['US-TX', 'US-FED'],
      userId: null,
    },
    {
      key: 'MENDOZA',
      displayName: 'Sofia Mendoza, Esq.',
      firmName: 'Horizon Real Estate & Land LLP',
      email: 'smendoza@horizonre.com',
      verification: 'Verified',
      availability: 'Available',
      activeCount: 1,
      maxConcurrent: 7,
      avgHours: 2.9,
      avgRating: 4.7,
      proBono: false,
      practiceCodes: ['REAL_ESTATE', 'CORP_MA'],
      jurisdictionCodes: ['US-TX', 'US-CA'],
      userId: null,
    },
    {
      key: 'ADVERSE',
      displayName: 'Arthur Pendelton, Esq.',
      firmName: 'Helios Dynamics Legal Group',
      email: 'apendelton@heliosdynamics.com',
      verification: 'Verified',
      availability: 'Available',
      activeCount: 0,
      maxConcurrent: 5,
      avgHours: 4.0,
      avgRating: 4.5,
      proBono: false,
      practiceCodes: ['CORP_MA'],
      jurisdictionCodes: ['US-NY'],
      userId: null,
    },
  ];

  for (const spec of proSpecs) {
    const existing = await rv.RunView<ProfessionalProfileEntity>(
      {
        EntityName: 'MJ_BizApps_Referrals: Professional Profiles',
        ExtraFilter: `Email='${spec.email}'`,
        MaxRows: 1,
        ResultType: 'entity_object',
      },
      ctx.User,
    );
    let pro = existing.Results?.[0];
    if (!pro) {
      pro = await md.GetEntityObject<ProfessionalProfileEntity>('MJ_BizApps_Referrals: Professional Profiles', ctx.User);
      pro.NewRecord();
      pro.Email = spec.email;
    }
    pro.DisplayName = spec.displayName;
    pro.FirmName = spec.firmName;
    pro.VerificationStatus = spec.verification;
    pro.AvailabilityStatus = spec.availability;
    pro.ActiveReferralCount = spec.activeCount;
    pro.MaxConcurrentReferrals = spec.maxConcurrent;
    pro.AverageResponseHours = spec.avgHours;
    pro.AverageRating = spec.avgRating;
    pro.IsActive = true;
    if (spec.userId && !pro.UserID) {
      pro.UserID = spec.userId;
    }
    if (!(await pro.Save())) {
      throw new Error(`Failed saving ProfessionalProfile ${spec.email}: ${pro.LatestResult?.Message ?? ''}`);
    }
    state.Professionals[spec.key] = pro;

    for (let i = 0; i < spec.practiceCodes.length; i++) {
      const pa = state.PracticeAreas[spec.practiceCodes[i]];
      if (!pa) continue;
      const linkCheck = await rv.RunView<ProfessionalPracticeAreaEntity>(
        {
          EntityName: 'MJ_BizApps_Referrals: Professional Practice Areas',
          ExtraFilter: `ProfessionalProfileID='${pro.ID}' AND PracticeAreaID='${pa.ID}'`,
          MaxRows: 1,
          ResultType: 'entity_object',
        },
        ctx.User,
      );
      if (!linkCheck.Results?.length) {
        const link = await md.GetEntityObject<ProfessionalPracticeAreaEntity>(
          'MJ_BizApps_Referrals: Professional Practice Areas',
          ctx.User,
        );
        link.NewRecord();
        link.ProfessionalProfileID = pro.ID;
        link.PracticeAreaID = pa.ID;
        link.ProficiencyLevel = i === 0 ? 'Primary' : 'Standard';
        link.YearsInPractice = 10 + i * 2;
        link.IsPrimary = i === 0;
        await link.Save();
      }
    }

    for (let i = 0; i < spec.jurisdictionCodes.length; i++) {
      const jur = state.Jurisdictions[spec.jurisdictionCodes[i]];
      if (!jur) continue;
      const linkCheck = await rv.RunView<ProfessionalJurisdictionEntity>(
        {
          EntityName: 'MJ_BizApps_Referrals: Professional Jurisdictions',
          ExtraFilter: `ProfessionalProfileID='${pro.ID}' AND JurisdictionID='${jur.ID}'`,
          MaxRows: 1,
          ResultType: 'entity_object',
        },
        ctx.User,
      );
      if (!linkCheck.Results?.length) {
        const link = await md.GetEntityObject<ProfessionalJurisdictionEntity>(
          'MJ_BizApps_Referrals: Professional Jurisdictions',
          ctx.User,
        );
        link.NewRecord();
        link.ProfessionalProfileID = pro.ID;
        link.JurisdictionID = jur.ID;
        link.StandingStatus = 'GoodStanding';
        link.IsPrimary = i === 0;
        await link.Save();
      }
    }
  }

  const reqSpecs: Array<{
    key: string;
    requestNumber: string;
    seekerName: string;
    seekerEmail: string;
    practiceCode: string;
    jurisdictionCode: string;
    tierCode: string;
    title: string;
    summary: string;
    status: ReferralRequestEntity['Status'];
    cascadeStep: number;
    adverseParty?: { name: string; org: string };
    assignments: Array<{
      proKey: string;
      cascadeOrder: number;
      score: number;
      conflictStatus: ReferralAssignmentEntity['ConflictStatus'];
      status: ReferralAssignmentEntity['Status'];
    }>;
  }> = [
    {
      key: 'ACME_MA',
      requestNumber: 'REF-2026-0101',
      seekerName: 'Acme Robotics Inc.',
      seekerEmail: 'gc@acmerobotics.io',
      practiceCode: 'CORP_MA',
      jurisdictionCode: 'US-NY',
      tierCode: 'PRIORITY',
      title: 'Series B Cross-Border Acquisition',
      summary: 'Seeking M&A counsel for Delaware/NY cross-border asset acquisition of $28M.',
      status: 'Routed',
      cascadeStep: 1,
      adverseParty: { name: 'Helios Dynamics Corp', org: 'Helios Dynamics Legal Group' },
      assignments: [
        { proKey: 'ADVERSE', cascadeOrder: 1, score: 0, conflictStatus: 'ConflictFound', status: 'ConflictRejected' },
        { proKey: 'VANCE', cascadeOrder: 1, score: 96.4, conflictStatus: 'Cleared', status: 'Offered' },
      ],
    },
    {
      key: 'NORTHSTAR_LIT',
      requestNumber: 'REF-2026-0102',
      seekerName: 'Northstar Logistics',
      seekerEmail: 'legal@northstar.co',
      practiceCode: 'COMM_LIT',
      jurisdictionCode: 'US-CA',
      tierCode: 'STANDARD',
      title: 'Supply Chain Breach Dispute',
      summary: 'Commercial contract dispute in Northern District of California.',
      status: 'Accepted',
      cascadeStep: 1,
      adverseParty: { name: 'Pacific Freight Partners', org: 'Pacific Freight Partners LLC' },
      assignments: [
        { proKey: 'THORNE', cascadeOrder: 1, score: 91.2, conflictStatus: 'Cleared', status: 'Accepted' },
      ],
    },
    {
      key: 'VERTEX_IP',
      requestNumber: 'REF-2026-0103',
      seekerName: 'Vertex BioLabs',
      seekerEmail: 'founders@vertexbio.ai',
      practiceCode: 'IP_LAW',
      jurisdictionCode: 'US-CA',
      tierCode: 'PRIORITY',
      title: 'Patent Portfolio & Licensing Audit',
      summary: 'Pre-diligence IP freedom-to-operate and patent prosecution review.',
      status: 'Routed',
      cascadeStep: 1,
      assignments: [
        { proKey: 'NAIR', cascadeOrder: 1, score: 98.1, conflictStatus: 'Cleared', status: 'Offered' },
      ],
    },
    {
      key: 'LONE_STAR_RE',
      requestNumber: 'REF-2026-0104',
      seekerName: 'Lone Star Medical Properties',
      seekerEmail: 'ops@lonestarmed.com',
      practiceCode: 'REAL_ESTATE',
      jurisdictionCode: 'US-TX',
      tierCode: 'STANDARD',
      title: 'Multi-Campus Medical Lease Restructure',
      summary: 'Commercial lease portfolio renegotiation across Austin and Dallas campuses.',
      status: 'Routed',
      cascadeStep: 2,
      assignments: [
        { proKey: 'MENDOZA', cascadeOrder: 1, score: 93.7, conflictStatus: 'Cleared', status: 'Expired' },
        { proKey: 'THORNE', cascadeOrder: 2, score: 86.5, conflictStatus: 'Cleared', status: 'Offered' },
      ],
    },
  ];

  for (const spec of reqSpecs) {
    const pa = state.PracticeAreas[spec.practiceCode];
    const jur = state.Jurisdictions[spec.jurisdictionCode];
    const tier = state.ReferralTiers[spec.tierCode];
    if (!pa || !jur || !tier) continue;

    const existing = await rv.RunView<ReferralRequestEntity>(
      {
        EntityName: 'MJ_BizApps_Referrals: Referral Requests',
        ExtraFilter: `RequestNumber='${spec.requestNumber}'`,
        MaxRows: 1,
        ResultType: 'entity_object',
      },
      ctx.User,
    );
    let req = existing.Results?.[0];
    if (!req) {
      req = await md.GetEntityObject<ReferralRequestEntity>('MJ_BizApps_Referrals: Referral Requests', ctx.User);
      req.NewRecord();
      req.RequestNumber = spec.requestNumber;
    }
    req.SeekerName = spec.seekerName;
    req.SeekerEmail = spec.seekerEmail;
    req.PracticeAreaID = pa.ID;
    req.JurisdictionID = jur.ID;
    req.ReferralTierID = tier.ID;
    req.MatterTitle = spec.title;
    req.MatterSummary = spec.summary;
    req.Status = spec.status;
    req.CurrentCascadeStep = spec.cascadeStep;
    if (!(await req.Save())) {
      throw new Error(`Failed saving ReferralRequest ${spec.requestNumber}: ${req.LatestResult?.Message ?? ''}`);
    }
    state.Requests[spec.key] = req;

    if (spec.adverseParty) {
      const partyCheck = await rv.RunView<ConflictCheckPartyEntity>(
        {
          EntityName: 'MJ_BizApps_Referrals: Conflict Check Parties',
          ExtraFilter: `ReferralRequestID='${req.ID}'`,
          MaxRows: 1,
          ResultType: 'entity_object',
        },
        ctx.User,
      );
      if (!partyCheck.Results?.length) {
        const party = await md.GetEntityObject<ConflictCheckPartyEntity>(
          'MJ_BizApps_Referrals: Conflict Check Parties',
          ctx.User,
        );
        party.NewRecord();
        party.ReferralRequestID = req.ID;
        party.PartyName = spec.adverseParty.name;
        party.PartyRole = 'Adverse';
        party.OrganizationName = spec.adverseParty.org;
        party.NormalizedName = NormalizePartyName(spec.adverseParty.name);
        if (await party.Save()) {
          state.ConflictParties.push(party);
        }
      }
    }

    for (const aSpec of spec.assignments) {
      const pro = state.Professionals[aSpec.proKey];
      if (!pro) continue;
      const assignCheck = await rv.RunView<ReferralAssignmentEntity>(
        {
          EntityName: 'MJ_BizApps_Referrals: Referral Assignments',
          ExtraFilter: `ReferralRequestID='${req.ID}' AND ProfessionalProfileID='${pro.ID}'`,
          MaxRows: 1,
          ResultType: 'entity_object',
        },
        ctx.User,
      );
      let assignment = assignCheck.Results?.[0];
      if (!assignment) {
        assignment = await md.GetEntityObject<ReferralAssignmentEntity>(
          'MJ_BizApps_Referrals: Referral Assignments',
          ctx.User,
        );
        assignment.NewRecord();
        assignment.ReferralRequestID = req.ID;
        assignment.ProfessionalProfileID = pro.ID;
        assignment.CascadeOrder = aSpec.cascadeOrder;
        assignment.MatchScore = aSpec.score;
        assignment.ConflictStatus = aSpec.conflictStatus;
        assignment.Status = aSpec.status;
        if (await assignment.Save()) {
          state.Assignments.push(assignment);
        }
      } else {
        state.Assignments.push(assignment);
      }
    }
  }

  return state;
}
