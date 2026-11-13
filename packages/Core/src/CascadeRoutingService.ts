import { IMetadataProvider, IRunViewProvider, Metadata, RunView, UserInfo } from '@memberjunction/core';
import {
  ProfessionalProfileEntity,
  ReferralAssignmentEntity,
  ReferralRequestEntity,
  ReferralTierEntity,
} from '@mj-biz-apps/referrals-entities';
import { MatchingEngine } from './MatchingEngine.js';
import { ReferralTelemetry } from './ReferralTelemetry.js';
import {
  AssignmentResponseAction,
  CascadeRoutingResult,
  ResponseOutcome,
  SweepResult,
} from './types.js';

export class CascadeRoutingService {
  /**
   * Matches eligible professionals for a ReferralRequest, creates sequential
   * ReferralAssignment records up to ReferralTier.MaxCascadeAttempts, and
   * offers the top-ranked cleared candidate with an SLA deadline.
   */
  public static async RouteReferralRequest(
    referralRequestId: string,
    contextUser: UserInfo,
    provider?: IMetadataProvider & IRunViewProvider,
  ): Promise<CascadeRoutingResult> {
    const startMs = Date.now();
    const md = provider ?? new Metadata();
    const rv = new RunView(provider);

    const request = await md.GetEntityObject<ReferralRequestEntity>('MJ_BizApps_Referrals: Referral Requests', contextUser);
    const loaded = await request.Load(referralRequestId);
    if (!loaded) {
      throw new Error(`ReferralRequest '${referralRequestId}' not found.`);
    }

    const tier = await md.GetEntityObject<ReferralTierEntity>('MJ_BizApps_Referrals: Referral Tiers', contextUser);
    const tierLoaded = await tier.Load(request.ReferralTierID);
    if (!tierLoaded) {
      throw new Error(`ReferralTier '${request.ReferralTierID}' not found.`);
    }

    const existingResult = await rv.RunView<ReferralAssignmentEntity>(
      {
        EntityName: 'MJ_BizApps_Referrals: Referral Assignments',
        ExtraFilter: `ReferralRequestID = '${referralRequestId}'`,
        ResultType: 'entity_object',
      },
      contextUser,
    );

    const existingByPro = new Set<string>();
    if (existingResult.Success) {
      for (const a of existingResult.Results) {
        existingByPro.add(a.ProfessionalProfileID);
      }
    }

    const candidates = await MatchingEngine.FindMatches(
      {
        PracticeAreaID: request.PracticeAreaID,
        JurisdictionID: request.JurisdictionID,
        RequiresProBono: request.RequiresProBono,
        PreferredLanguage: request.PreferredLanguage,
        SLAResponseHours: tier.SLAResponseHours,
        MaxResults: tier.MaxCascadeAttempts * 2,
      },
      contextUser,
      provider,
      referralRequestId,
    );

    let conflictRejectedCount = 0;
    const eligibleCandidates = [];
    for (const c of candidates) {
      if (existingByPro.has(c.ProfessionalProfileID)) {
        continue;
      }
      if (c.ConflictStatus === 'ConflictFound') {
        conflictRejectedCount++;
        const rejected = await md.GetEntityObject<ReferralAssignmentEntity>(
          'MJ_BizApps_Referrals: Referral Assignments',
          contextUser,
        );
        rejected.ReferralRequestID = referralRequestId;
        rejected.ProfessionalProfileID = c.ProfessionalProfileID;
        rejected.CascadeOrder = eligibleCandidates.length + conflictRejectedCount;
        rejected.MatchScore = c.Score;
        rejected.ScoreBreakdownJSON = JSON.stringify(c.Breakdown);
        rejected.ConflictStatus = 'ConflictFound';
        rejected.ConflictReason = c.ConflictReasons.join('; ');
        rejected.Status = 'ConflictRejected';
        await rejected.Save();
        continue;
      }
      if (c.Eligible && eligibleCandidates.length < tier.MaxCascadeAttempts) {
        eligibleCandidates.push(c);
      }
    }

    if (eligibleCandidates.length === 0) {
      request.Status = 'Exhausted';
      await request.Save();

      ReferralTelemetry.RecordOperation({
        Operation: 'RouteReferral',
        ElapsedMs: Date.now() - startMs,
        UserID: contextUser.ID,
        Metrics: {
          totalQueued: 0,
          conflictRejectedCount,
          exhausted: true,
        },
      });

      return {
        ReferralRequestID: referralRequestId,
        Status: 'Exhausted',
        TotalQueued: 0,
        ActiveAssignmentID: null,
        ActiveProfessionalID: null,
        SLADeadlineAt: null,
        ConflictRejectedCount: conflictRejectedCount,
      };
    }

    const now = new Date();
    const slaDeadline = new Date(now.getTime() + tier.SLAResponseHours * 60 * 60 * 1000);
    let activeAssignmentId: string | null = null;
    let activeProfessionalId: string | null = null;

    for (let i = 0; i < eligibleCandidates.length; i++) {
      const c = eligibleCandidates[i];
      const assignment = await md.GetEntityObject<ReferralAssignmentEntity>(
        'MJ_BizApps_Referrals: Referral Assignments',
        contextUser,
      );
      assignment.ReferralRequestID = referralRequestId;
      assignment.ProfessionalProfileID = c.ProfessionalProfileID;
      assignment.CascadeOrder = i + 1;
      assignment.MatchScore = c.Score;
      assignment.ScoreBreakdownJSON = JSON.stringify(c.Breakdown);
      assignment.ConflictStatus = 'Cleared';

      if (i === 0) {
        assignment.Status = 'Offered';
        assignment.OfferedAt = now;
        assignment.SLADeadlineAt = slaDeadline;
      } else {
        assignment.Status = 'Queued';
      }

      const saved = await assignment.Save();
      if (saved && i === 0) {
        activeAssignmentId = assignment.ID;
        activeProfessionalId = c.ProfessionalProfileID;
      }
    }

    request.Status = 'Routed';
    request.CurrentCascadeStep = 1;
    if (!request.SubmittedAt) {
      request.SubmittedAt = now;
    }
    await request.Save();

    ReferralTelemetry.RecordOperation({
      Operation: 'RouteReferral',
      ElapsedMs: Date.now() - startMs,
      UserID: contextUser.ID,
      Metrics: {
        totalQueued: eligibleCandidates.length,
        conflictRejectedCount,
        exhausted: false,
      },
    });

    return {
      ReferralRequestID: referralRequestId,
      Status: 'Routed',
      TotalQueued: eligibleCandidates.length,
      ActiveAssignmentID: activeAssignmentId,
      ActiveProfessionalID: activeProfessionalId,
      SLADeadlineAt: slaDeadline.toISOString(),
      ConflictRejectedCount: conflictRejectedCount,
    };
  }

  /**
   * Processes a professional's response (Accept, Decline, or ConflictReject) to an Offered assignment.
   * On Decline or ConflictReject, automatically cascades to the next Queued assignment.
   */
  public static async RespondToAssignment(
    params: {
      ReferralAssignmentID: string;
      Action: AssignmentResponseAction;
      Notes?: string;
      DeclineReason?: string;
    },
    contextUser: UserInfo,
    provider?: IMetadataProvider & IRunViewProvider,
  ): Promise<ResponseOutcome> {
    const startMs = Date.now();
    const md = provider ?? new Metadata();

    const assignment = await md.GetEntityObject<ReferralAssignmentEntity>(
      'MJ_BizApps_Referrals: Referral Assignments',
      contextUser,
    );
    const loaded = await assignment.Load(params.ReferralAssignmentID);
    if (!loaded) {
      throw new Error(`ReferralAssignment '${params.ReferralAssignmentID}' not found.`);
    }
    if (assignment.Status !== 'Offered') {
      throw new Error(`ReferralAssignment '${params.ReferralAssignmentID}' is in status '${assignment.Status}', expected 'Offered'.`);
    }

    const request = await md.GetEntityObject<ReferralRequestEntity>(
      'MJ_BizApps_Referrals: Referral Requests',
      contextUser,
    );
    await request.Load(assignment.ReferralRequestID);

    const now = new Date();
    assignment.RespondedAt = now;
    if (params.Notes) {
      assignment.ResponseNotes = params.Notes;
    }

    if (params.Action === 'Accept') {
      assignment.Status = 'Accepted';
      await assignment.Save();

      request.Status = 'Accepted';
      request.AssignedProfessionalID = assignment.ProfessionalProfileID;
      request.AcceptedAt = now;
      await request.Save();

      // Update professional metrics
      const pro = await md.GetEntityObject<ProfessionalProfileEntity>(
        'MJ_BizApps_Referrals: Professional Profiles',
        contextUser,
      );
      if (await pro.Load(assignment.ProfessionalProfileID)) {
        pro.ActiveReferralCount = pro.ActiveReferralCount + 1;
        pro.TotalAcceptedCount = pro.TotalAcceptedCount + 1;
        await pro.Save();
      }

      // Withdraw remaining queued assignments
      const rv = new RunView(provider);
      const queuedRes = await rv.RunView<ReferralAssignmentEntity>(
        {
          EntityName: 'MJ_BizApps_Referrals: Referral Assignments',
          ExtraFilter: `ReferralRequestID = '${assignment.ReferralRequestID}' AND Status = 'Queued'`,
          ResultType: 'entity_object',
        },
        contextUser,
      );
      if (queuedRes.Success) {
        for (const q of queuedRes.Results) {
          q.Status = 'Withdrawn';
          await q.Save();
        }
      }

      ReferralTelemetry.RecordOperation({
        Operation: 'RespondToReferral',
        ElapsedMs: Date.now() - startMs,
        UserID: contextUser.ID,
        Metrics: { action: 'Accept', cascaded: false },
      });

      return {
        ReferralAssignmentID: assignment.ID,
        ReferralRequestID: request.ID,
        AssignmentStatus: 'Accepted',
        RequestStatus: 'Accepted',
        NextOfferedAssignmentID: null,
        NextOfferedProfessionalID: null,
      };
    }

    if (params.Action === 'ConflictReject') {
      assignment.Status = 'ConflictRejected';
      assignment.ConflictStatus = 'ConflictFound';
      assignment.ConflictReason = params.DeclineReason ?? params.Notes ?? 'Self-reported conflict of interest.';
    } else {
      assignment.Status = 'Declined';
      assignment.DeclineReason = params.DeclineReason ?? 'Declined by professional.';
    }
    await assignment.Save();

    const nextOffer = await CascadeRoutingService.AdvanceCascade(request, contextUser, provider);

    ReferralTelemetry.RecordOperation({
      Operation: 'RespondToReferral',
      ElapsedMs: Date.now() - startMs,
      UserID: contextUser.ID,
      Metrics: {
        action: params.Action,
        cascaded: nextOffer !== null,
      },
    });

    return {
      ReferralAssignmentID: assignment.ID,
      ReferralRequestID: request.ID,
      AssignmentStatus: assignment.Status,
      RequestStatus: request.Status,
      NextOfferedAssignmentID: nextOffer?.ID ?? null,
      NextOfferedProfessionalID: nextOffer?.ProfessionalProfileID ?? null,
    };
  }

  /**
   * Promotes the next Queued assignment for a ReferralRequest to Offered, or marks Exhausted.
   */
  public static async AdvanceCascade(
    request: ReferralRequestEntity,
    contextUser: UserInfo,
    provider?: IMetadataProvider & IRunViewProvider,
  ): Promise<ReferralAssignmentEntity | null> {
    const md = provider ?? new Metadata();
    const rv = new RunView(provider);

    const queuedRes = await rv.RunView<ReferralAssignmentEntity>(
      {
        EntityName: 'MJ_BizApps_Referrals: Referral Assignments',
        ExtraFilter: `ReferralRequestID = '${request.ID}' AND Status = 'Queued'`,
        OrderBy: 'CascadeOrder ASC',
        MaxRows: 1,
        ResultType: 'entity_object',
      },
      contextUser,
    );

    const nextAssignment = queuedRes.Success && queuedRes.Results.length > 0 ? queuedRes.Results[0] : null;
    if (!nextAssignment) {
      request.Status = 'Exhausted';
      await request.Save();
      return null;
    }

    const tier = await md.GetEntityObject<ReferralTierEntity>('MJ_BizApps_Referrals: Referral Tiers', contextUser);
    await tier.Load(request.ReferralTierID);
    const slaHours = tier.SLAResponseHours > 0 ? tier.SLAResponseHours : 24;

    const now = new Date();
    nextAssignment.Status = 'Offered';
    nextAssignment.OfferedAt = now;
    nextAssignment.SLADeadlineAt = new Date(now.getTime() + slaHours * 60 * 60 * 1000);
    await nextAssignment.Save();

    request.Status = 'Routed';
    request.CurrentCascadeStep = nextAssignment.CascadeOrder;
    await request.Save();

    return nextAssignment;
  }

  /**
   * Sweeps all Offered assignments whose SLADeadlineAt has passed, marks them Expired,
   * and cascades each parent ReferralRequest to the next Queued professional.
   */
  public static async SweepExpiredSLAs(
    asOfDate: Date,
    contextUser: UserInfo,
    provider?: IMetadataProvider & IRunViewProvider,
  ): Promise<SweepResult> {
    const startMs = Date.now();
    const md = provider ?? new Metadata();
    const rv = new RunView(provider);

    const isoNow = asOfDate.toISOString();
    const expiredRes = await rv.RunView<ReferralAssignmentEntity>(
      {
        EntityName: 'MJ_BizApps_Referrals: Referral Assignments',
        ExtraFilter: `Status = 'Offered' AND SLADeadlineAt < '${isoNow}'`,
        ResultType: 'entity_object',
      },
      contextUser,
    );

    const expiredList = expiredRes.Success ? expiredRes.Results : [];
    const processedIds: string[] = [];
    let cascadedCount = 0;
    let exhaustedCount = 0;

    for (const assignment of expiredList) {
      assignment.Status = 'Expired';
      assignment.RespondedAt = asOfDate;
      await assignment.Save();
      processedIds.push(assignment.ID);

      const request = await md.GetEntityObject<ReferralRequestEntity>(
        'MJ_BizApps_Referrals: Referral Requests',
        contextUser,
      );
      if (await request.Load(assignment.ReferralRequestID)) {
        const nextOffer = await CascadeRoutingService.AdvanceCascade(request, contextUser, provider);
        if (nextOffer) {
          cascadedCount++;
        } else {
          exhaustedCount++;
        }
      }
    }

    ReferralTelemetry.RecordOperation({
      Operation: 'SweepExpiredReferralSLAs',
      ElapsedMs: Date.now() - startMs,
      UserID: contextUser.ID,
      Metrics: {
        scannedCount: expiredList.length,
        expiredCount: processedIds.length,
        cascadedCount,
        exhaustedCount,
      },
    });

    return {
      ScannedCount: expiredList.length,
      ExpiredCount: processedIds.length,
      CascadedCount: cascadedCount,
      ExhaustedCount: exhaustedCount,
      ProcessedAssignmentIDs: processedIds,
    };
  }
}
