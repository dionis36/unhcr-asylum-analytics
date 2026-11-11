"""
build_analytics_marts.py
Builds the DuckDB analytics layer (asylum_analytics.duckdb) and exports
compact static JSON payloads for the Vercel dashboard.
"""

import json
import duckdb
import pandas as pd
import numpy as np
from pathlib import Path

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
PROCESSED_DIR = DATA_DIR / "processed"
DASHBOARD_DATA_DIR = PROCESSED_DIR / "dashboard_data"
WEB_DATA_DIR = BASE_DIR / "web" / "public" / "data"
DB_PATH = PROCESSED_DIR / "asylum_analytics.duckdb"

FLOWS_PARQUET = (PROCESSED_DIR / "annual_asylum_flows.parquet").as_posix()
PENDING_PARQUET = (PROCESSED_DIR / "pending_backlog_yearly.parquet").as_posix()
STAGES_PARQUET = (PROCESSED_DIR / "court_stages_summary.parquet").as_posix()


def clean_export_directories() -> None:
    """Removes existing .json files from both target directories before fresh generation."""
    for out_dir in [DASHBOARD_DATA_DIR, WEB_DATA_DIR]:
        out_dir.mkdir(parents=True, exist_ok=True)
        for existing_file in out_dir.glob("*.json"):
            existing_file.unlink()


def save_json_mart(filename: str, payload) -> None:
    """Saves payload to both dashboard_data and web/public/data for immediate web availability."""
    for out_dir in [DASHBOARD_DATA_DIR, WEB_DATA_DIR]:
        out_dir.mkdir(parents=True, exist_ok=True)
        with open(out_dir / filename, "w", encoding="utf-8") as f:
            json.dump(payload, f, indent=2)



def main():
    print("=" * 60)
    print("Building DuckDB Analytics Layer & Dashboard Marts")
    print("=" * 60)

    DASHBOARD_DATA_DIR.mkdir(parents=True, exist_ok=True)
    if DB_PATH.exists():
        DB_PATH.unlink()
    con = duckdb.connect(DB_PATH.as_posix())

    # ---------------------------------------------------------
    # 1. Base Layer Views on Parquet
    # ---------------------------------------------------------
    print("\n[1/5] Registering base views on Parquet files...")

    con.execute(f"""
        CREATE OR REPLACE VIEW base_annual_flows AS
        SELECT * FROM read_parquet('{FLOWS_PARQUET}');
    """)

    con.execute(f"""
        CREATE OR REPLACE VIEW base_pending_backlog AS
        SELECT * FROM read_parquet('{PENDING_PARQUET}');
    """)

    con.execute(f"""
        CREATE OR REPLACE VIEW base_court_stages AS
        SELECT * FROM read_parquet('{STAGES_PARQUET}');
    """)

    flows_cnt = con.execute("SELECT COUNT(*) FROM base_annual_flows").fetchone()[0]
    pending_cnt = con.execute("SELECT COUNT(*) FROM base_pending_backlog").fetchone()[0]
    stages_cnt = con.execute("SELECT COUNT(*) FROM base_court_stages").fetchone()[0]

    print(f"  base_annual_flows      : {flows_cnt:,} rows")
    print(f"  base_pending_backlog   : {pending_cnt:,} rows")
    print(f"  base_court_stages      : {stages_cnt:,} rows")

    # ---------------------------------------------------------
    # 2. Analytical Helper Views
    # ---------------------------------------------------------
    print("\n[2/5] Creating analytical helper views...")

    # View 2.1: Global Timeline (16 years)
    con.execute("""
        CREATE OR REPLACE VIEW view_global_timeline AS
        WITH flows_by_year AS (
            SELECT
                year,
                SUM(applications_filed_raw) AS applications_filed_raw,
                SUM(applications_filed_est) AS applications_filed_est,
                SUM(cases_decided) AS cases_decided,
                SUM(refugee_grants) AS refugee_grants,
                SUM(temporary_protection) AS temporary_protection,
                SUM(cases_rejected) AS cases_rejected,
                SUM(closed_without_decision) AS closed_without_decision
            FROM base_annual_flows
            GROUP BY year
        ),
        stock_by_year AS (
            SELECT
                year,
                SUM(pending_cases_year_end) AS pending_cases_year_end
            FROM base_pending_backlog
            GROUP BY year
        )
        SELECT
            f.year,
            f.applications_filed_raw,
            f.applications_filed_est,
            f.cases_decided,
            f.refugee_grants,
            f.temporary_protection,
            f.cases_rejected,
            f.closed_without_decision,
            COALESCE(s.pending_cases_year_end, 0) AS pending_cases_year_end,
            ROUND(f.cases_decided * 100.0 / f.applications_filed_est, 2) AS clearance_rate_pct,
            (f.applications_filed_est - f.cases_decided) AS annual_caseload_gap,
            ROUND(f.closed_without_decision * 100.0 / f.cases_decided, 2) AS ghost_rate_pct,
            ROUND(f.refugee_grants * 100.0 / f.cases_decided, 2) AS refugee_share_pct,
            ROUND(f.temporary_protection * 100.0 / f.cases_decided, 2) AS temp_protection_share_pct,
            ROUND(f.cases_rejected * 100.0 / f.cases_decided, 2) AS rejection_share_pct
        FROM flows_by_year f
        LEFT JOIN stock_by_year s ON f.year = s.year
        ORDER BY f.year ASC;
    """)

    # View 2.2: Country Yearly Balance (Flows + Stock by host nation)
    con.execute("""
        CREATE OR REPLACE VIEW view_country_balance_yearly AS
        WITH y_flows AS (
            SELECT
                year,
                country_asylum_iso,
                country_asylum,
                SUM(applications_filed_raw) AS applications_filed_raw,
                SUM(applications_filed_est) AS applications_filed_est,
                SUM(cases_decided) AS cases_decided,
                SUM(refugee_grants) AS refugee_grants,
                SUM(temporary_protection) AS temporary_protection,
                SUM(cases_rejected) AS cases_rejected,
                SUM(closed_without_decision) AS closed_without_decision
            FROM base_annual_flows
            GROUP BY year, country_asylum_iso, country_asylum
        ),
        y_stock AS (
            SELECT
                year,
                country_asylum_iso,
                country_asylum,
                SUM(pending_cases_year_end) AS pending_cases_year_end
            FROM base_pending_backlog
            GROUP BY year, country_asylum_iso, country_asylum
        )
        SELECT
            COALESCE(f.year, s.year) AS year,
            COALESCE(f.country_asylum_iso, s.country_asylum_iso) AS country_asylum_iso,
            COALESCE(f.country_asylum, s.country_asylum) AS country_asylum,
            COALESCE(f.applications_filed_raw, 0) AS applications_filed_raw,
            COALESCE(f.applications_filed_est, 0) AS applications_filed_est,
            COALESCE(f.cases_decided, 0) AS cases_decided,
            COALESCE(f.refugee_grants, 0) AS refugee_grants,
            COALESCE(f.temporary_protection, 0) AS temporary_protection,
            COALESCE(f.cases_rejected, 0) AS cases_rejected,
            COALESCE(f.closed_without_decision, 0) AS closed_without_decision,
            COALESCE(s.pending_cases_year_end, 0) AS pending_cases_year_end,
            ROUND(CASE WHEN COALESCE(f.applications_filed_est, 0) > 0
                       THEN (COALESCE(f.cases_decided, 0) * 100.0 / f.applications_filed_est)
                       ELSE 0.0 END, 2) AS clearance_rate_pct,
            (COALESCE(f.applications_filed_est, 0) - COALESCE(f.cases_decided, 0)) AS annual_caseload_gap
        FROM y_flows f
        FULL OUTER JOIN y_stock s
            ON f.year = s.year
           AND f.country_asylum_iso = s.country_asylum_iso;
    """)

    # View 2.3: Country Run-Rate & Outcomes (Velocity, Years to Clear, Ghost Rate)
    con.execute("""
        CREATE OR REPLACE VIEW view_country_run_rate AS
        WITH max_y AS (
            SELECT MAX(year) AS max_year FROM base_annual_flows
        ),
        recent_velocity AS (
            SELECT
                f.country_asylum_iso,
                f.country_asylum,
                ROUND(SUM(f.cases_decided) * 1.0 / 2, 0) AS recent_annual_decisions
            FROM base_annual_flows f, max_y m
            WHERE f.year >= m.max_year - 1
            GROUP BY f.country_asylum_iso, f.country_asylum
        ),
        latest_pending AS (
            SELECT
                s.country_asylum_iso,
                s.country_asylum,
                SUM(s.pending_cases_year_end) AS pending_cases_latest
            FROM base_pending_backlog s, max_y m
            WHERE s.year = m.max_year
            GROUP BY s.country_asylum_iso, s.country_asylum
        ),
        career_totals AS (
            SELECT
                country_asylum_iso,
                country_asylum,
                SUM(applications_filed_raw) AS applications_filed_raw,
                SUM(applications_filed_est) AS applications_filed_est,
                SUM(cases_decided) AS cases_decided,
                SUM(refugee_grants) AS refugee_grants,
                SUM(temporary_protection) AS temporary_protection,
                SUM(cases_rejected) AS cases_rejected,
                SUM(closed_without_decision) AS closed_without_decision,
                ROUND(CASE WHEN SUM(applications_filed_est) > 0
                           THEN (SUM(cases_decided) * 100.0 / SUM(applications_filed_est))
                           ELSE 0.0 END, 2) AS total_clearance_rate_pct,
                ROUND(CASE WHEN SUM(cases_decided) > 0
                           THEN (SUM(closed_without_decision) * 100.0 / SUM(cases_decided))
                           ELSE 0.0 END, 2) AS ghost_rate_pct,
                ROUND(CASE WHEN (SUM(refugee_grants) + SUM(temporary_protection) + SUM(cases_rejected)) > 0
                           THEN (SUM(refugee_grants) * 100.0 / (SUM(refugee_grants) + SUM(temporary_protection) + SUM(cases_rejected)))
                           ELSE 0.0 END, 2) AS refugee_grant_rate_pct,
                ROUND(CASE WHEN (SUM(refugee_grants) + SUM(temporary_protection) + SUM(cases_rejected)) > 0
                           THEN ((SUM(refugee_grants) + SUM(temporary_protection)) * 100.0 / (SUM(refugee_grants) + SUM(temporary_protection) + SUM(cases_rejected)))
                           ELSE 0.0 END, 2) AS total_protection_rate_pct
            FROM base_annual_flows
            GROUP BY country_asylum_iso, country_asylum
        )
        SELECT
            c.country_asylum_iso,
            c.country_asylum,
            c.applications_filed_raw,
            c.applications_filed_est,
            c.cases_decided,
            c.total_clearance_rate_pct,
            COALESCE(lp.pending_cases_latest, 0) AS pending_cases_latest,
            COALESCE(rv.recent_annual_decisions, 0) AS recent_annual_decisions,
            ROUND(CASE WHEN COALESCE(rv.recent_annual_decisions, 0) > 0
                       THEN (COALESCE(lp.pending_cases_latest, 0) * 1.0 / rv.recent_annual_decisions)
                       ELSE NULL END, 2) AS years_to_clear,
            c.ghost_rate_pct,
            c.refugee_grant_rate_pct,
            c.total_protection_rate_pct
        FROM career_totals c
        LEFT JOIN recent_velocity rv ON c.country_asylum_iso = rv.country_asylum_iso
        LEFT JOIN latest_pending lp ON c.country_asylum_iso = lp.country_asylum_iso;
    """)

    # View 2.4: Corridor Summary (16-year totals by origin -> asylum pair)
    con.execute("""
        CREATE OR REPLACE VIEW view_corridor_summary AS
        SELECT
            country_origin_iso,
            country_origin,
            country_asylum_iso,
            country_asylum,
            SUM(applications_filed_raw) AS applications_filed_raw,
            SUM(applications_filed_est) AS applications_filed_est,
            SUM(cases_decided) AS cases_decided,
            SUM(refugee_grants) AS refugee_grants,
            SUM(temporary_protection) AS temporary_protection,
            SUM(cases_rejected) AS cases_rejected,
            SUM(closed_without_decision) AS closed_without_decision,
            ROUND(CASE WHEN SUM(applications_filed_est) > 0
                       THEN (SUM(cases_decided) * 100.0 / SUM(applications_filed_est))
                       ELSE 0.0 END, 2) AS clearance_rate_pct,
            ROUND(CASE WHEN SUM(cases_decided) > 0
                       THEN (SUM(closed_without_decision) * 100.0 / SUM(cases_decided))
                       ELSE 0.0 END, 2) AS ghost_rate_pct,
            ROUND(CASE WHEN (SUM(refugee_grants) + SUM(temporary_protection) + SUM(cases_rejected)) > 0
                       THEN (SUM(refugee_grants) * 100.0 / (SUM(refugee_grants) + SUM(temporary_protection) + SUM(cases_rejected)))
                       ELSE 0.0 END, 2) AS refugee_grant_rate_pct,
            ROUND(CASE WHEN (SUM(refugee_grants) + SUM(temporary_protection) + SUM(cases_rejected)) > 0
                       THEN ((SUM(refugee_grants) + SUM(temporary_protection)) * 100.0 / (SUM(refugee_grants) + SUM(temporary_protection) + SUM(cases_rejected)))
                       ELSE 0.0 END, 2) AS total_protection_rate_pct
        FROM base_annual_flows
        GROUP BY country_origin_iso, country_origin, country_asylum_iso, country_asylum;
    """)

    # View 2.5: Authority Divide
    con.execute("""
        CREATE OR REPLACE VIEW view_authority_breakdown AS
        SELECT
            country_asylum_iso,
            country_asylum,
            authority,
            SUM(applications_filed_est) AS applications_filed_est,
            SUM(cases_decided) AS cases_decided
        FROM base_annual_flows
        GROUP BY country_asylum_iso, country_asylum, authority;
    """)

    print("  Created: view_global_timeline")
    print("  Created: view_country_balance_yearly")
    print("  Created: view_country_run_rate")
    print("  Created: view_corridor_summary")
    print("  Created: view_authority_breakdown")

    # ---------------------------------------------------------
    # 3. Core Research Questions Audit
    # ---------------------------------------------------------
    print("\n[3/5] Auditing the Core Operational Questions...")

    # Q1 & Q2: Macro Totals & Run Rates
    top_backlogs = con.execute("""
        SELECT
            country_asylum,
            pending_cases_latest,
            recent_annual_decisions,
            years_to_clear,
            total_clearance_rate_pct
        FROM view_country_run_rate
        WHERE pending_cases_latest > 100000
        ORDER BY pending_cases_latest DESC
        LIMIT 5;
    """).fetchall()

    print("\n  Top 5 Backlogs & Years to Clear:")
    for row in top_backlogs:
        country, pending, velocity, ytc, ccr = row
        print(f"    {country:<20} | Backlog: {pending:>10,} | Ann. Decisions: {velocity:>9,} | Years to Clear: {ytc:>5.1f} | CCR: {ccr:>5.1f}%")

    # Q3 & Q4: Ghost Rates & Protection Substitution
    outliers = con.execute("""
        SELECT
            country_asylum,
            cases_decided,
            ghost_rate_pct,
            refugee_grant_rate_pct,
            total_protection_rate_pct
        FROM view_country_run_rate
        WHERE cases_decided > 200000
        ORDER BY ghost_rate_pct DESC
        LIMIT 5;
    """).fetchall()

    print("\n  Top 5 Administrative Closure Outliers (Ghost Rate):")
    for row in outliers:
        country, decided, ghost, ref, tot = row
        print(f"    {country:<20} | Decided: {decided:>10,} | Ghost Rate: {ghost:>5.1f}% | Refugee: {ref:>5.1f}% | Total Prot: {tot:>5.1f}%")

    # Q5: Sovereign Authority Divide
    unhcr_top = con.execute("""
        WITH auth_totals AS (
            SELECT
                country_asylum,
                SUM(cases_decided) AS total_decided,
                SUM(CASE WHEN authority = 'UNHCR' THEN cases_decided ELSE 0 END) AS unhcr_decided
            FROM view_authority_breakdown
            GROUP BY country_asylum
            HAVING SUM(cases_decided) > 50000
        )
        SELECT
            country_asylum,
            total_decided,
            unhcr_decided,
            ROUND(unhcr_decided * 100.0 / total_decided, 1) AS unhcr_pct
        FROM auth_totals
        ORDER BY unhcr_pct DESC
        LIMIT 5;
    """).fetchall()

    print("\n  Top 5 Nations with UNHCR Adjudication:")
    for row in unhcr_top:
        country, tot, unhcr, pct = row
        print(f"    {country:<20} | Total Decisions: {tot:>9,} | UNHCR Handled: {unhcr:>8,} ({pct:>5.1f}%)")

    # ---------------------------------------------------------
    # 4. Generate Web-Ready JSON Payloads
    # ---------------------------------------------------------
    print("\n[4/5] Exporting pre-aggregated JSON payloads for Vercel...")
    clean_export_directories()

    # Payload 1: global_kpis.json
    kpi_row = con.execute("""
        SELECT
            SUM(applications_filed_raw) AS total_filed_raw,
            SUM(applications_filed_est) AS total_filed_est,
            SUM(cases_decided) AS total_decided,
            SUM(refugee_grants) AS total_refugee_grants,
            SUM(temporary_protection) AS total_temp_protection,
            SUM(cases_rejected) AS total_rejected,
            SUM(closed_without_decision) AS total_closed,
            ROUND(SUM(cases_decided) * 100.0 / SUM(applications_filed_est), 2) AS clearance_rate_pct,
            SUM(applications_filed_est) - SUM(cases_decided) AS net_caseload_gap,
            ROUND(SUM(closed_without_decision) * 100.0 / SUM(cases_decided), 2) AS ghost_rate_pct
        FROM view_global_timeline;
    """).fetchone()

    latest_backlog_global = con.execute("""
        SELECT pending_cases_year_end
        FROM view_global_timeline
        ORDER BY year DESC
        LIMIT 1;
    """).fetchone()[0]

    global_kpis = {
        "active_pending_backlog": int(latest_backlog_global),
        "applications_filed_raw": int(kpi_row[0]),
        "applications_filed_est": int(kpi_row[1]),
        "cases_decided": int(kpi_row[2]),
        "refugee_grants": int(kpi_row[3]),
        "temporary_protection": int(kpi_row[4]),
        "cases_rejected": int(kpi_row[5]),
        "closed_without_decision": int(kpi_row[6]),
        "clearance_rate_pct": float(kpi_row[7]),
        "net_caseload_gap": int(kpi_row[8]),
        "ghost_rate_pct": float(kpi_row[9]),
        "data_window": "2010-2025"
    }

    save_json_mart("global_kpis.json", global_kpis)
    print("  Saved: global_kpis.json")

    # Payload 2: timeline_trends.json
    timeline_df = con.execute("SELECT * FROM view_global_timeline ORDER BY year ASC").fetchdf().fillna(0.0)
    timeline_records = timeline_df.to_dict(orient="records")

    save_json_mart("timeline_trends.json", timeline_records)
    print(f"  Saved: timeline_trends.json ({len(timeline_records)} years)")

    # Payload 3: country_profiles.json (array of objects for Next.js mapping)
    run_rate_df = con.execute("SELECT * FROM view_country_run_rate ORDER BY applications_filed_est DESC").fetchdf()
    stages_df = con.execute("SELECT * FROM base_court_stages").fetchdf().fillna(0)
    auth_df = con.execute("SELECT * FROM view_authority_breakdown").fetchdf().fillna(0)

    profiles = []
    for _, r in run_rate_df.iterrows():
        iso = r["country_asylum_iso"]
        if not iso or iso == "UNK":
            continue

        c_stages = stages_df[stages_df["country_asylum_iso"] == iso]
        stage_summary = c_stages.groupby("court_stage")["cases_decided"].sum().to_dict()

        c_auth = auth_df[auth_df["country_asylum_iso"] == iso]
        auth_summary = c_auth.groupby("authority")["cases_decided"].sum().to_dict()

        profiles.append({
            "country_iso": iso,
            "country_name": r["country_asylum"],
            "applications_filed_raw": int(r["applications_filed_raw"]) if pd.notna(r["applications_filed_raw"]) else 0,
            "applications_filed_est": int(r["applications_filed_est"]) if pd.notna(r["applications_filed_est"]) else 0,
            "cases_decided": int(r["cases_decided"]) if pd.notna(r["cases_decided"]) else 0,
            "total_clearance_rate_pct": float(r["total_clearance_rate_pct"]) if pd.notna(r["total_clearance_rate_pct"]) else 0.0,
            "pending_backlog_latest": int(r["pending_cases_latest"]) if pd.notna(r["pending_cases_latest"]) else 0,
            "recent_annual_decisions": int(r["recent_annual_decisions"]) if pd.notna(r["recent_annual_decisions"]) else 0,
            "years_to_clear": float(r["years_to_clear"]) if pd.notna(r["years_to_clear"]) else 0.0,
            "ghost_rate_pct": float(r["ghost_rate_pct"]) if pd.notna(r["ghost_rate_pct"]) else 0.0,
            "refugee_grant_rate_pct": float(r["refugee_grant_rate_pct"]) if pd.notna(r["refugee_grant_rate_pct"]) else 0.0,
            "total_protection_rate_pct": float(r["total_protection_rate_pct"]) if pd.notna(r["total_protection_rate_pct"]) else 0.0,
            "court_stages": {k: int(v) for k, v in stage_summary.items()},
            "authority_split": {k: int(v) for k, v in auth_summary.items()}
        })

    save_json_mart("country_profiles.json", profiles)
    print(f"  Saved: country_profiles.json ({len(profiles)} country profiles as array)")

    # Payload 4: migration_corridors.json (zero nulls)
    corridors_df = con.execute("""
        SELECT
            country_origin_iso,
            country_origin,
            country_asylum_iso,
            country_asylum,
            applications_filed_est,
            cases_decided,
            refugee_grants,
            temporary_protection,
            cases_rejected,
            closed_without_decision,
            clearance_rate_pct,
            ghost_rate_pct,
            refugee_grant_rate_pct,
            total_protection_rate_pct
        FROM view_corridor_summary
        WHERE applications_filed_est >= 5000
        ORDER BY applications_filed_est DESC
        LIMIT 100;
    """).fetchdf().fillna(0.0)

    corridor_records = corridors_df.to_dict(orient="records")

    save_json_mart("migration_corridors.json", corridor_records)
    print(f"  Saved: migration_corridors.json ({len(corridor_records)} major corridors)")

    # ---------------------------------------------------------
    # 5. Verification
    # ---------------------------------------------------------
    con.close()
    print("\n[5/5] DuckDB analytics layer and dashboard JSON export completed successfully!")
    print(f"  Database : {DB_PATH}")
    print(f"  Web JSON : {WEB_DATA_DIR}")
    print("\nVerified web/public/data marts:")
    for f in sorted(WEB_DATA_DIR.glob("*.json")):
        print(f"  {f.name:25} : {f.stat().st_size:,} bytes")
    print("=" * 60)


if __name__ == "__main__":
    main()
