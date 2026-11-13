import { TelemetryManager } from '@memberjunction/core';
import { RouteScrubber, ScrubbedRouteResult } from '@memberjunction/health';

export interface ReferralTelemetryPayload {
  Operation: string;
  Route?: string;
  ElapsedMs: number;
  UserID?: string;
  Metrics?: Record<string, string | number | boolean | null>;
}

/**
 * Records sanitized telemetry for BizApps Referrals operations and UI navigation.
 * All client-side routes are scrubbed via {@link RouteScrubber.Scrub} before touching
 * {@link TelemetryManager} so record IDs and raw search terms never leak.
 */
export class ReferralTelemetry {
  public static ScrubRoute(rawRoute: string): ScrubbedRouteResult {
    return RouteScrubber.Scrub(rawRoute);
  }

  public static RecordOperation(payload: ReferralTelemetryPayload): void {
    const scrubbed = payload.Route ? RouteScrubber.Scrub(payload.Route) : null;
    const params: Record<string, unknown> = {
      domain: 'bizapps-referrals',
      ...(scrubbed
        ? {
            routeTemplate: scrubbed.RouteTemplate,
            scrubbedPath: scrubbed.ScrubbedPath,
          }
        : {}),
      ...(payload.Metrics ?? {}),
    };

    TelemetryManager.Instance.RecordEvent(
      'Custom',
      `Referrals.${payload.Operation}`,
      params,
      payload.ElapsedMs,
      payload.UserID,
    );
  }
}
