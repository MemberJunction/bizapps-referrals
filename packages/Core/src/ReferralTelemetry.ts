import { TelemetryManager } from '@memberjunction/core';

export interface ScrubbedRouteResult {
  RouteTemplate: string;
  ScrubbedPath: string;
}

export interface ReferralTelemetryPayload {
  Operation: string;
  Route?: string;
  ElapsedMs: number;
  UserID?: string;
  Metrics?: Record<string, string | number | boolean | null>;
}

const UUID_REGEX = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;
const NUMERIC_SEGMENT_REGEX = /\/\d+(?=\/|$)/g;

/**
 * Records sanitized telemetry for BizApps Referrals operations and UI navigation.
 * All client-side routes are scrubbed before touching {@link TelemetryManager}
 * so record IDs and raw search terms never leak.
 */
export class ReferralTelemetry {
  public static ScrubRoute(rawRoute: string): ScrubbedRouteResult {
    const pathOnly = (rawRoute.split('?')[0]?.split('#')[0] ?? '').replace(/^\/+/, '');
    const template = '/' + pathOnly
      .replace(UUID_REGEX, '_id_')
      .replace(NUMERIC_SEGMENT_REGEX, '/_id_');
    return {
      RouteTemplate: template,
      ScrubbedPath: template,
    };
  }

  public static RecordOperation(payload: ReferralTelemetryPayload): void {
    const scrubbed = payload.Route ? ReferralTelemetry.ScrubRoute(payload.Route) : null;
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
