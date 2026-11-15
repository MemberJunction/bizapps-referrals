import { UserInfoEngine } from '@memberjunction/core-entities';

export interface SeekerFilterPreferences {
  PracticeAreaID: string;
  JurisdictionID: string;
  RequiresProBono: boolean;
  DrawerOpen: boolean;
}

export interface ProInboxPreferences {
  StatusFilter: 'Offered' | 'Accepted' | 'All';
}

export interface OpsTelemetryPreferences {
  ShowExhaustedOnly: boolean;
}

export interface DirectoryPreferences {
  SearchTerm: string;
  PracticeAreaID: string;
  JurisdictionID: string;
  ShowVerificationQueue: boolean;
}

export interface ReciprocityScorecardPreferences {
  /** ISO date string for the start of the selected period (UTC quarter boundary). */
  SelectedPeriodStartIso: string;
}

const SEEKER_PREFS_KEY = 'Referrals.SeekerIntake.Preferences';
const PRO_INBOX_PREFS_KEY = 'Referrals.ProInbox.Preferences';
const OPS_PREFS_KEY = 'Referrals.OpsTelemetry.Preferences';
const DIRECTORY_PREFS_KEY = 'Referrals.Directory.Preferences';
const RECIPROCITY_PREFS_KEY = 'Referrals.ReciprocityScorecard.Preferences';

export class ReferralsUiStateHelper {
  public static LoadSeekerPreferences(): SeekerFilterPreferences {
    const raw = UserInfoEngine.Instance.GetSetting(SEEKER_PREFS_KEY);
    if (!raw) {
      return { PracticeAreaID: '', JurisdictionID: '', RequiresProBono: false, DrawerOpen: false };
    }
    try {
      const parsed = JSON.parse(raw) as Partial<SeekerFilterPreferences>;
      return {
        PracticeAreaID: typeof parsed.PracticeAreaID === 'string' ? parsed.PracticeAreaID : '',
        JurisdictionID: typeof parsed.JurisdictionID === 'string' ? parsed.JurisdictionID : '',
        RequiresProBono: Boolean(parsed.RequiresProBono),
        DrawerOpen: Boolean(parsed.DrawerOpen),
      };
    } catch {
      return { PracticeAreaID: '', JurisdictionID: '', RequiresProBono: false, DrawerOpen: false };
    }
  }

  public static async SaveSeekerPreferences(prefs: SeekerFilterPreferences): Promise<void> {
    await UserInfoEngine.Instance.SetSetting(SEEKER_PREFS_KEY, JSON.stringify(prefs));
  }

  public static LoadProInboxPreferences(): ProInboxPreferences {
    const raw = UserInfoEngine.Instance.GetSetting(PRO_INBOX_PREFS_KEY);
    if (!raw) {
      return { StatusFilter: 'Offered' };
    }
    try {
      const parsed = JSON.parse(raw) as Partial<ProInboxPreferences>;
      const status =
        parsed.StatusFilter === 'Accepted' || parsed.StatusFilter === 'All' ? parsed.StatusFilter : 'Offered';
      return { StatusFilter: status };
    } catch {
      return { StatusFilter: 'Offered' };
    }
  }

  public static async SaveProInboxPreferences(prefs: ProInboxPreferences): Promise<void> {
    await UserInfoEngine.Instance.SetSetting(PRO_INBOX_PREFS_KEY, JSON.stringify(prefs));
  }

  public static LoadOpsPreferences(): OpsTelemetryPreferences {
    const raw = UserInfoEngine.Instance.GetSetting(OPS_PREFS_KEY);
    if (!raw) {
      return { ShowExhaustedOnly: false };
    }
    try {
      const parsed = JSON.parse(raw) as Partial<OpsTelemetryPreferences>;
      return { ShowExhaustedOnly: Boolean(parsed.ShowExhaustedOnly) };
    } catch {
      return { ShowExhaustedOnly: false };
    }
  }

  public static async SaveOpsPreferences(prefs: OpsTelemetryPreferences): Promise<void> {
    await UserInfoEngine.Instance.SetSetting(OPS_PREFS_KEY, JSON.stringify(prefs));
  }

  public static LoadDirectoryPreferences(): DirectoryPreferences {
    const raw = UserInfoEngine.Instance.GetSetting(DIRECTORY_PREFS_KEY);
    if (!raw) {
      return { SearchTerm: '', PracticeAreaID: '', JurisdictionID: '', ShowVerificationQueue: false };
    }
    try {
      const parsed = JSON.parse(raw) as Partial<DirectoryPreferences>;
      return {
        SearchTerm: typeof parsed.SearchTerm === 'string' ? parsed.SearchTerm : '',
        PracticeAreaID: typeof parsed.PracticeAreaID === 'string' ? parsed.PracticeAreaID : '',
        JurisdictionID: typeof parsed.JurisdictionID === 'string' ? parsed.JurisdictionID : '',
        ShowVerificationQueue: Boolean(parsed.ShowVerificationQueue),
      };
    } catch {
      return { SearchTerm: '', PracticeAreaID: '', JurisdictionID: '', ShowVerificationQueue: false };
    }
  }

  public static async SaveDirectoryPreferences(prefs: DirectoryPreferences): Promise<void> {
    await UserInfoEngine.Instance.SetSetting(DIRECTORY_PREFS_KEY, JSON.stringify(prefs));
  }

  public static LoadReciprocityScorecardPreferences(): ReciprocityScorecardPreferences {
    const raw = UserInfoEngine.Instance.GetSetting(RECIPROCITY_PREFS_KEY);
    if (!raw) {
      return { SelectedPeriodStartIso: '' };
    }
    try {
      const parsed = JSON.parse(raw) as Partial<ReciprocityScorecardPreferences>;
      return { SelectedPeriodStartIso: typeof parsed.SelectedPeriodStartIso === 'string' ? parsed.SelectedPeriodStartIso : '' };
    } catch {
      return { SelectedPeriodStartIso: '' };
    }
  }

  public static async SaveReciprocityScorecardPreferences(prefs: ReciprocityScorecardPreferences): Promise<void> {
    await UserInfoEngine.Instance.SetSetting(RECIPROCITY_PREFS_KEY, JSON.stringify(prefs));
  }
}
