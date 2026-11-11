export interface GlobalKPIs {
  active_pending_backlog: number;
  applications_filed_raw: number;
  applications_filed_est: number;
  cases_decided: number;
  refugee_grants: number;
  temporary_protection: number;
  cases_rejected: number;
  closed_without_decision: number;
  clearance_rate_pct: number;
  net_caseload_gap: number;
  ghost_rate_pct: number;
  data_window: string;
}

export interface TimelineTrend {
  year: number;
  applications_filed_raw: number;
  applications_filed_est: number;
  cases_decided: number;
  refugee_grants: number;
  temporary_protection: number;
  cases_rejected: number;
  closed_without_decision: number;
  pending_cases_year_end: number;
  clearance_rate_pct: number;
  annual_caseload_gap: number;
  ghost_rate_pct: number;
  refugee_share_pct: number;
  temp_protection_share_pct: number;
  rejection_share_pct: number;
}

export interface CountryProfile {
  country_iso: string;
  country_name: string;
  applications_filed_raw: number;
  applications_filed_est: number;
  cases_decided: number;
  total_clearance_rate_pct: number;
  pending_backlog_latest: number;
  recent_annual_decisions: number;
  years_to_clear: number;
  ghost_rate_pct: number;
  refugee_grant_rate_pct: number;
  total_protection_rate_pct: number;
  court_stages: Record<string, number>;
  authority_split: Record<string, number>;
}

export interface MigrationCorridor {
  country_origin_iso: string;
  country_origin: string;
  country_asylum_iso: string;
  country_asylum: string;
  applications_filed_est: number;
  cases_decided: number;
  refugee_grants: number;
  temporary_protection: number;
  cases_rejected: number;
  closed_without_decision: number;
  clearance_rate_pct: number;
  ghost_rate_pct: number;
  refugee_grant_rate_pct: number;
  total_protection_rate_pct: number;
}

export type NavTab = "macro" | "map" | "due-process" | "corridors" | "methodology";
