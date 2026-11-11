"use client";

import Link from "next/link";
import { ExternalLink, ArrowUpRight, User } from "lucide-react";

export function ViewMethodology() {
  return (
    <div className="w-full space-y-6">
      {/* 1. PROJECT OVERVIEW */}
      <section className="rounded-xl border border-border bg-card p-5 sm:p-6 lg:p-8 space-y-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border pb-4">
          <div className="space-y-1">
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
              Project Overview
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              An operational analysis tracking asylum claims from filing through final decision across 186 host countries (2010–2025).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs shrink-0">
            <a
              href="https://github.com/dionis36/unhcr-asylum-operations-analytics"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/40 hover:bg-muted px-2.5 py-1.5 font-semibold text-foreground transition-colors shadow-xs"
            >
              <span>GitHub Repository</span>
              <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
            </a>
            <a
              href="https://www.unhcr.org/refugee-statistics/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/40 hover:bg-muted px-2.5 py-1.5 font-semibold text-foreground transition-colors shadow-xs"
            >
              <span>UNHCR Data Finder</span>
              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
            </a>
          </div>
        </div>

        <div className="space-y-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
          <p>
            This project audits international asylum data from an operational perspective. Over a 16-year period (2010 through 2025), it tracks how many claims entered host legal systems, how many decisions were reached, how rapidly backlogs accumulated, and how many claims were closed without a substantive decision on the merits.
          </p>
          <p>
            Using official statistics from the United Nations High Commissioner for Refugees (UNHCR) across 186 host countries, the analysis measures the gap between incoming asylum applications and the processing capacity of sovereign court systems and international mandate bodies.
          </p>
        </div>

        {/* 4 Scale Benchmark Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          <div className="rounded-lg border border-border/80 bg-muted/20 p-3.5 text-center">
            <span className="text-xs text-muted-foreground block">Time Period</span>
            <span className="text-base sm:text-lg font-bold text-foreground tabular-nums block mt-0.5">
              2010–2025
            </span>
            <span className="text-[11px] text-muted-foreground">16 Calendar Years</span>
          </div>
          <div className="rounded-lg border border-border/80 bg-muted/20 p-3.5 text-center">
            <span className="text-xs text-muted-foreground block">Jurisdictions</span>
            <span className="text-base sm:text-lg font-bold text-foreground tabular-nums block mt-0.5">
              186 States
            </span>
            <span className="text-[11px] text-muted-foreground">Sovereign and Mandate</span>
          </div>
          <div className="rounded-lg border border-border/80 bg-muted/20 p-3.5 text-center">
            <span className="text-xs text-muted-foreground block">Total Filings</span>
            <span className="text-base sm:text-lg font-bold text-foreground tabular-nums block mt-0.5">
              33.14M
            </span>
            <span className="text-[11px] text-muted-foreground">Standardized Claims</span>
          </div>
          <div className="rounded-lg border border-border/80 bg-muted/20 p-3.5 text-center">
            <span className="text-xs text-muted-foreground block">Determinations</span>
            <span className="text-base sm:text-lg font-bold text-foreground tabular-nums block mt-0.5">
              26.92M
            </span>
            <span className="text-[11px] text-muted-foreground">Decided Merits</span>
          </div>
        </div>
      </section>

      {/* 2. RESEARCH FRAMEWORK & OBJECTIVES */}
      <section className="rounded-xl border border-border bg-card p-5 sm:p-6 lg:p-8 space-y-4 shadow-xs">
        <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground border-b border-border pb-2">
          Research Framework and Objectives
        </h2>

        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          The operational analysis is structured across four core research themes:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1 text-xs sm:text-sm">
          <div className="space-y-1.5 rounded-lg border border-border/60 bg-muted/15 p-4">
            <h3 className="font-bold text-foreground">
              Theme 1: Systemic Capacity and Backlog Growth
            </h3>
            <ul className="list-disc pl-4 space-y-1 text-muted-foreground leading-relaxed">
              <li>
                <strong className="text-foreground">Systemic Backlog Accumulation:</strong> Identify jurisdictions where annual claims filed consistently outpace determinations, causing active inventories to compound.
              </li>
              <li>
                <strong className="text-foreground">Clearance Horizons (Years to Clear):</strong> Compute the operational runway required to clear active pending queues under current adjudication throughput, assuming zero new intake.
              </li>
            </ul>
          </div>

          <div className="space-y-1.5 rounded-lg border border-border/60 bg-muted/15 p-4">
            <h3 className="font-bold text-foreground">
              Theme 2: Procedural Integrity and Case Attrition
            </h3>
            <ul className="list-disc pl-4 space-y-1 text-muted-foreground leading-relaxed">
              <li>
                <strong className="text-foreground">Non-Decisional Attrition ("Ghost Cases"):</strong> Quantify claims terminated through administrative closures, departures, or docket purges before an individual merits ruling.
              </li>
              <li>
                <strong className="text-foreground">Protection Quality Shifts:</strong> Investigate whether host states substitute temporary subsidiary protection for permanent 1951 Geneva Convention status during volume surges.
              </li>
            </ul>
          </div>

          <div className="space-y-1.5 rounded-lg border border-border/60 bg-muted/15 p-4">
            <h3 className="font-bold text-foreground">
              Theme 3: Decision Authority and Processing Stages
            </h3>
            <ul className="list-disc pl-4 space-y-1 text-muted-foreground leading-relaxed">
              <li>
                <strong className="text-foreground">Authority Distribution:</strong> Determine the division of adjudication responsibility between sovereign national court systems and delegated UNHCR mandate operations.
              </li>
              <li>
                <strong className="text-foreground">Procedural Bottlenecks:</strong> Compare caseloads and processing velocities across administrative stages (first-instance interviews vs. judicial appellate reviews).
              </li>
            </ul>
          </div>

          <div className="space-y-1.5 rounded-lg border border-border/60 bg-muted/15 p-4">
            <h3 className="font-bold text-foreground">
              Theme 4: Crisis Resilience and Route Disparities
            </h3>
            <ul className="list-disc pl-4 space-y-1 text-muted-foreground leading-relaxed">
              <li>
                <strong className="text-foreground">Crisis Shock Latency:</strong> Measure system absorption latency and recovery timelines following sudden geopolitical displacements (Syria 2015, Ukraine 2022, Sudan 2023).
              </li>
              <li>
                <strong className="text-foreground">Bilateral Route Disparities:</strong> Determine whether identical origin nationalities face radically divergent recognition rates depending on which destination state adjudicates their claim.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 3. DATASET PROVENANCE AND SOURCE DATASETS */}
      <section className="rounded-xl border border-border bg-card p-5 sm:p-6 lg:p-8 space-y-4 shadow-xs">
        <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground border-b border-border pb-2">
          Data Provenance and Source Datasets
        </h2>

        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          The project uses official statistics published by the United Nations High Commissioner for Refugees (UNHCR), obtained from the UNHCR Refugee Data Finder and the UN Population Statistics Database.
        </p>

        <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm text-muted-foreground">
          <li><strong className="text-foreground">Time period:</strong> 2010–2025 (16 calendar years)</li>
          <li><strong className="text-foreground">Host jurisdictions:</strong> 186 sovereign states and mandate territories</li>
          <li><strong className="text-foreground">Standardized claims filed:</strong> 33,139,875 applications (32,524,694 raw)</li>
          <li><strong className="text-foreground">Substantive legal determinations:</strong> 26,923,303 decided claims (26,001,894 raw)</li>
          <li><strong className="text-foreground">Active pending backlog (2025):</strong> 8,998,097 unresolved claims</li>
          <li><strong className="text-foreground">Pending stock records:</strong> 83,289 annual (Year, Host, Origin) tuples</li>
        </ul>

        <h3 className="text-sm sm:text-base font-bold text-foreground pt-2">
          Primary Source Tables
        </h3>

        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[620px] text-left text-xs">
            <thead className="bg-muted/40 border-b border-border text-muted-foreground font-semibold">
              <tr>
                <th className="p-3 w-40">Dataset</th>
                <th className="p-3 w-48">Source File</th>
                <th className="p-3 w-32">Scope</th>
                <th className="p-3">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr className="hover:bg-muted/30 transition-colors">
                <td className="p-3 font-semibold text-foreground">New Applications</td>
                <td className="p-3 text-xs text-muted-foreground font-medium">asylum-applications.csv</td>
                <td className="p-3 text-muted-foreground">Flow (Annual)</td>
                <td className="p-3 text-muted-foreground">
                  Individual and family claims lodged within calendar years, categorized by application type (New, Repeat, Appeal) and procedural stage.
                </td>
              </tr>
              <tr className="hover:bg-muted/30 transition-colors">
                <td className="p-3 font-semibold text-foreground">Decisions Rendered</td>
                <td className="p-3 text-xs text-muted-foreground font-medium">asylum-decisions.csv</td>
                <td className="p-3 text-muted-foreground">Flow (Annual)</td>
                <td className="p-3 text-muted-foreground">
                  Substantive outcomes recorded by determining authority: Geneva Convention refugee status, complementary/humanitarian protection, formal rejections, and administrative closures.
                </td>
              </tr>
              <tr className="hover:bg-muted/30 transition-colors">
                <td className="p-3 font-semibold text-foreground">Year-End Pending Stock</td>
                <td className="p-3 text-xs text-muted-foreground font-medium">persons-of-concern.csv</td>
                <td className="p-3 text-muted-foreground">Stock (Dec 31 Snapshot)</td>
                <td className="p-3 text-muted-foreground">
                  Active unresolved inventory of individuals awaiting an initial or appellate ruling at year-end (<code className="text-foreground">ASY</code> population type).
                </td>
              </tr>
              <tr className="hover:bg-muted/30 transition-colors">
                <td className="p-3 font-semibold text-foreground">Official Multipliers</td>
                <td className="p-3 text-xs text-muted-foreground font-medium">footnotes.csv</td>
                <td className="p-3 text-muted-foreground">Metadata / Multipliers</td>
                <td className="p-3 text-muted-foreground">
                  Official statistical adjustment footnotes specifying jurisdictions that record family units rather than individual persons (e.g., US cases multiplied by 1.50×, UK cases by 1.30× per official UNHCR guidance).
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 4. CORE OPERATIONAL METRICS AND FORMULAS */}
      <section className="rounded-xl border border-border bg-card p-5 sm:p-6 lg:p-8 space-y-4 shadow-xs">
        <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground border-b border-border pb-2">
          Operational Metrics and Mathematical Formulas
        </h2>

        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          The dashboard applies standard court-administration formulas to evaluate throughput, queue longevity, and procedural attrition:
        </p>

        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[660px] text-left text-xs sm:text-sm">
            <thead className="bg-muted/40 border-b border-border text-muted-foreground font-semibold">
              <tr>
                <th className="p-3 w-44">Metric</th>
                <th className="p-3 w-72">Formula</th>
                <th className="p-3">Operational Meaning</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs sm:text-sm">
              <tr className="hover:bg-muted/30 transition-colors">
                <td className="p-3 font-semibold text-foreground">Case Clearance Rate (CCR)</td>
                <td className="p-3">
                  <span className="rounded bg-muted/40 px-2 py-1 inline-block border border-border/50 text-xs font-semibold tracking-wide text-foreground">
                    (Total Decisions ÷ New Claims Filed) × 100%
                  </span>
                </td>
                <td className="p-3 text-muted-foreground">
                  Measures whether throughput keeps pace with inflow. <strong className="text-foreground">≥100%:</strong> Solvent capacity reducing backlog. <strong className="text-foreground">85–99%:</strong> Mild seasonal accumulation. <strong className="text-foreground">&lt;85%:</strong> Critical deficit where queue compounds annually.
                </td>
              </tr>
              <tr className="hover:bg-muted/30 transition-colors">
                <td className="p-3 font-semibold text-foreground">Years to Clear Runway (YTC)</td>
                <td className="p-3">
                  <span className="rounded bg-muted/40 px-2 py-1 inline-block border border-border/50 text-xs font-semibold tracking-wide text-foreground">
                    Pending Backlog ÷ Recent Annual Decisions
                  </span>
                </td>
                <td className="p-3 text-muted-foreground">
                  Estimates years required to clear active pending queues under current decision velocity, assuming zero new applications. To prevent mathematical divergence on dormant systems, dockets with &gt;500 pending cases but &lt;10 annual decisions are capped at <strong className="text-foreground">25.0+ years</strong> and classified as "Stalled / Inactive Dockets."
                </td>
              </tr>
              <tr className="hover:bg-muted/30 transition-colors">
                <td className="p-3 font-semibold text-foreground">Closed Without Decision Rate</td>
                <td className="p-3">
                  <span className="rounded bg-muted/40 px-2 py-1 inline-block border border-border/50 text-xs font-semibold tracking-wide text-foreground">
                    (Closed w/o Decision ÷ Total Decisions) × 100%
                  </span>
                </td>
                <td className="p-3 text-muted-foreground">
                  The percentage of claims closed through administrative procedures (withdrawals, procedural dismissals, missed deadlines, or docket cleanups) rather than a formal hearing on the merits.
                </td>
              </tr>
              <tr className="hover:bg-muted/30 transition-colors">
                <td className="p-3 font-semibold text-foreground">Refugee Recognition (RRR)</td>
                <td className="p-3">
                  <span className="rounded bg-muted/40 px-2 py-1 inline-block border border-border/50 text-xs font-semibold tracking-wide text-foreground">
                    (Refugee Grants ÷ Decided Merits) × 100%
                  </span>
                </td>
                <td className="p-3 text-muted-foreground">
                  Percentage of reviewed claims granted full, permanent legal status under the 1951 Geneva Convention.
                </td>
              </tr>
              <tr className="hover:bg-muted/30 transition-colors">
                <td className="p-3 font-semibold text-foreground">Total Protection Rate (TPR)</td>
                <td className="p-3">
                  <span className="rounded bg-muted/40 px-2 py-1 inline-block border border-border/50 text-xs font-semibold tracking-wide text-foreground">
                    [(Grants + Complementary) ÷ Decided Merits] × 100%
                  </span>
                </td>
                <td className="p-3 text-muted-foreground">
                  Percentage granted any legal stay, combining 1951 Convention status with temporary subsidiary or humanitarian protection.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 5. KEY STRUCTURAL FINDINGS */}
      <section className="rounded-xl border border-border bg-card p-5 sm:p-6 lg:p-8 space-y-4 shadow-xs">
        <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground border-b border-border pb-2">
          Key Structural Findings
        </h2>

        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          Analysis of the 16-year consolidated dataset established six structural realities:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
          <div className="space-y-2 rounded-lg border border-border/60 bg-muted/15 p-4 flex flex-col justify-between">
            <div className="space-y-1.5">
              <h3 className="font-bold text-foreground">
                1. Global Backlog Expanded Tenfold (2010–2025)
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                The worldwide inventory of unresolved asylum claims grew from <strong className="text-foreground tabular-nums">835,969 in 2010 to 8,998,097 in 2025</strong>. This growth was not gradual; it accelerated sharply after 2015 and surged further between 2021 and 2024 as multiple regional crises compounded.
              </p>
            </div>
            <div className="pt-2 border-t border-border/40">
              <Link
                href="/"
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-sky-400 hover:underline"
              >
                <span>Explore Intake Trajectory on Overview</span>
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          <div className="space-y-2 rounded-lg border border-border/60 bg-muted/15 p-4 flex flex-col justify-between">
            <div className="space-y-1.5">
              <h3 className="font-bold text-foreground">
                2. Extreme Geographic Concentration in the United States
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                As of 2025, the United States holds <strong className="text-foreground tabular-nums">3,718,945 pending asylum cases</strong>—representing approximately <strong className="text-foreground tabular-nums">41.3%</strong> of the entire world's unresolved claims. Egypt holds the second-largest pending backlog (878,268 cases, driven by conflict in Sudan), followed by Peru (556,770 cases, driven by Venezuelan displacement).
              </p>
            </div>
            <div className="pt-2 border-t border-border/40">
              <Link
                href="/"
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-sky-400 hover:underline"
              >
                <span>Inspect Backlog Treemap on Overview</span>
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          <div className="space-y-2 rounded-lg border border-border/60 bg-muted/15 p-4 flex flex-col justify-between">
            <div className="space-y-1.5">
              <h3 className="font-bold text-foreground">
                3. Cumulative 16-Year Operating Deficit
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Across the 186 host states, total incoming claims (<strong className="text-foreground tabular-nums">32,524,694 raw</strong>, <strong className="text-foreground tabular-nums">33,139,875 standardized</strong>) consistently outpaced substantive decisions rendered (<strong className="text-foreground tabular-nums">26,001,894 raw</strong>, <strong className="text-foreground tabular-nums">26,923,303 standardized</strong>). The global 16-year Case Clearance Rate averaged <strong className="text-foreground tabular-nums">81.2%</strong> (80.0% raw), generating a cumulative net operational shortfall of <strong className="text-foreground tabular-nums">6,216,572 claims</strong> (6.22 million) where intake overwhelmed adjudication capacity.
              </p>
            </div>
            <div className="pt-2 border-t border-border/40">
              <Link
                href="/map"
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-sky-400 hover:underline"
              >
                <span>View Clearance Capacity on National Map</span>
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          <div className="space-y-2 rounded-lg border border-border/60 bg-muted/15 p-4 flex flex-col justify-between">
            <div className="space-y-1.5">
              <h3 className="font-bold text-foreground">
                4. Massive Administrative Attrition ("Ghost Cases")
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Over <strong className="text-foreground tabular-nums">9,059,381 cases</strong> (9.06 million standardized, 8.37 million raw)—representing <strong className="text-foreground tabular-nums">33.7%</strong> of all closed proceedings—were terminated without a substantive merits ruling. High ghost rates are heavily concentrated in specific jurisdictions: Peru closed <strong className="text-foreground tabular-nums">92%</strong> of its total resolved caseload without a ruling, South Africa closed <strong className="text-foreground tabular-nums">63%</strong>, and the United States terminated <strong className="text-foreground tabular-nums">58%</strong> administratively.
              </p>
            </div>
            <div className="pt-2 border-t border-border/40">
              <Link
                href="/due-process"
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-sky-400 hover:underline"
              >
                <span>Examine Case Attrition Outliers on Decision Outcomes</span>
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          <div className="space-y-2 rounded-lg border border-border/60 bg-muted/15 p-4 flex flex-col justify-between">
            <div className="space-y-1.5">
              <h3 className="font-bold text-foreground">
                5. Protection Model Divergence During Crises
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Host states respond to major displacement waves using divergent legal instruments. When handling Venezuelan arrivals, Spain grants temporary subsidiary protection to over <strong className="text-foreground tabular-nums">92%</strong> of applicants while maintaining a formal 1951 Convention refugee grant rate near zero (0.11%). In contrast, Germany grants protection to over <strong className="text-foreground tabular-nums">92%</strong> of Syrian applicants, divided between full 1951 Convention refugee status (48.8%) and subsidiary protection (43.9%).
              </p>
            </div>
            <div className="pt-2 border-t border-border/40">
              <Link
                href="/due-process"
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-sky-400 hover:underline"
              >
                <span>Compare Spain vs Germany Protection Models</span>
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          <div className="space-y-2 rounded-lg border border-border/60 bg-muted/15 p-4 flex flex-col justify-between">
            <div className="space-y-1.5">
              <h3 className="font-bold text-foreground">
                6. Decision Authority: National Systems and UNHCR Mandate
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Wealthier destination countries in North America and Western Europe process 100% of claims through national government tribunals. Major transit states in North Africa and Southeast Asia rely almost entirely on delegated UNHCR mandate determination, meaning legal adjudication capacity in those regions is constrained by international agency funding rather than domestic court staffing.
              </p>
            </div>
            <div className="pt-2 border-t border-border/40">
              <Link
                href="/map"
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-sky-400 hover:underline"
              >
                <span>Explore Decision Authority on National Map</span>
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. DATA PROCESSING PIPELINE AND ARCHITECTURE */}
      <section className="rounded-xl border border-border bg-card p-5 sm:p-6 lg:p-8 space-y-4 shadow-xs">
        <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground border-b border-border pb-2">
          Data Processing Pipeline and Architecture
        </h2>

        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          The project followed six sequential engineering and analytical phases:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs sm:text-sm">
          <div className="space-y-1 rounded-lg border border-border/60 bg-muted/15 p-3.5">
            <h3 className="font-bold text-foreground">1. Raw Data Ingestion</h3>
            <p className="text-muted-foreground leading-relaxed text-xs">
              Loaded official UNHCR application, decision, and pending stock CSV files into DuckDB. Checked data types, verified numerical ranges, and sanitized unexpected nulls.
            </p>
          </div>

          <div className="space-y-1 rounded-lg border border-border/60 bg-muted/15 p-3.5">
            <h3 className="font-bold text-foreground">2. Record Deduplication</h3>
            <p className="text-muted-foreground leading-relaxed text-xs">
              Auditing the composite key revealed that over 35% of records contained sub-splits by application type and procedural stage. Pre-aggregation CTEs were implemented to prevent Cartesian duplication.
            </p>
          </div>

          <div className="space-y-1 rounded-lg border border-border/60 bg-muted/15 p-3.5">
            <h3 className="font-bold text-foreground">3. Family Unit Standardization</h3>
            <p className="text-muted-foreground leading-relaxed text-xs">
              Integrated statutory family multiplier footnotes (1.50× for US cases, 1.30× for UK claims) into a dual-ledger pipeline preserving both raw and standardized metrics.
            </p>
          </div>

          <div className="space-y-1 rounded-lg border border-border/60 bg-muted/15 p-3.5">
            <h3 className="font-bold text-foreground">4. Analytical Mart Creation</h3>
            <p className="text-muted-foreground leading-relaxed text-xs">
              Compiled pre-aggregated analytical tables into local DuckDB database tables and high-efficiency Apache Parquet marts for high-speed local SQL querying.
            </p>
          </div>

          <div className="space-y-1 rounded-lg border border-border/60 bg-muted/15 p-3.5">
            <h3 className="font-bold text-foreground">5. Operational Metric Computation</h3>
            <p className="text-muted-foreground leading-relaxed text-xs">
              Calculated Case Clearance Rates (CCR), Years to Clear (YTC), and administrative closure rates across 186 host jurisdictions with statistical validation against published UNHCR headline reports.
            </p>
          </div>

          <div className="space-y-1 rounded-lg border border-border/60 bg-muted/15 p-3.5">
            <h3 className="font-bold text-foreground">6. Web Dashboard Architecture</h3>
            <p className="text-muted-foreground leading-relaxed text-xs">
              Constructed high-density Next.js analytics client with GPU-accelerated MapLibre vector cartography, responsive Recharts visualizations, and theme token styling.
            </p>
          </div>
        </div>

        <h3 className="text-sm sm:text-base font-bold text-foreground pt-3">
          Tools and Technologies
        </h3>

        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[540px] text-left text-xs sm:text-sm">
            <thead className="bg-muted/40 border-b border-border text-muted-foreground font-semibold">
              <tr>
                <th className="p-3 w-44">Tool</th>
                <th className="p-3">Purpose in Project</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs sm:text-sm">
              <tr className="hover:bg-muted/30 transition-colors">
                <td className="p-3 font-semibold text-foreground">DuckDB</td>
                <td className="p-3 text-muted-foreground">
                  Embedded columnar database used for local analytical processing, multi-stage SQL transformations, key deduplication, and compiling Parquet data marts.
                </td>
              </tr>
              <tr className="hover:bg-muted/30 transition-colors">
                <td className="p-3 font-semibold text-foreground">Python and Pandas / PyArrow</td>
                <td className="p-3 text-muted-foreground">
                  Data extraction scripts, statutory multiplier calculations, and exporting optimized static JSON data marts for the web client.
                </td>
              </tr>
              <tr className="hover:bg-muted/30 transition-colors">
                <td className="p-3 font-semibold text-foreground">Next.js 14 and TypeScript</td>
                <td className="p-3 text-muted-foreground">
                  Modern React dashboard application framework providing static generation, strict type safety, and responsive component architecture.
                </td>
              </tr>
              <tr className="hover:bg-muted/30 transition-colors">
                <td className="p-3 font-semibold text-foreground">MapLibre GL</td>
                <td className="p-3 text-muted-foreground">
                  WebGL-accelerated vector cartography rendering global sovereign jurisdictions, regional coordinate bounds, and interactive hover tooltips.
                </td>
              </tr>
              <tr className="hover:bg-muted/30 transition-colors">
                <td className="p-3 font-semibold text-foreground">Recharts and Tailwind CSS</td>
                <td className="p-3 text-muted-foreground">
                  Composable SVG visualization library and utility-first styling engine enforcing institutional design tokens, typography, and dark mode support.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 7. METHODOLOGICAL LIMITATIONS AND CAVEATS */}
      <section className="rounded-xl border border-border bg-card p-5 sm:p-6 lg:p-8 space-y-4 shadow-xs">
        <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground border-b border-border pb-2">
          Methodological Limitations and Caveats
        </h2>

        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          Several analytical caveats should be considered when interpreting these findings:
        </p>

        <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-muted-foreground leading-relaxed">
          <li>
            <strong className="text-foreground">Stock vs. Flow Accounting Differences (Periodic Census Purges):</strong> Annual decision flows and year-end pending stock inventories are collected through separate administrative channels by host ministries. In pure mathematical theory, active backlog changes equal inflow minus dispositions. In practice, host governments periodically conduct unannounced registry audits (such as South Africa or Peru writing off large tranches of dormant files in a single census year) without recording them as individual formal decision records. As a result, the 16-year cumulative flow deficit (6.22M) operates alongside an 8.16M net increase in reported pending stock (expanding from 835,969 in 2010 to 8,998,097 in 2025). Dual-ledger accounting was implemented specifically to monitor both operational dynamics independently.
          </li>
          <li>
            <strong className="text-foreground">Statutory Multiplier Approximations:</strong> The 1.50× (US) and 1.30× (UK) multipliers derived from UNHCR footnotes reflect average family-unit sizes. While they prevent severe undercounting, they represent close statistical averages rather than individual applicant household censuses.
          </li>
          <li>
            <strong className="text-foreground">Ambiguity in Administrative Closures:</strong> UNHCR records aggregate procedural dismissals, applicant departures, withdrawals, and court administrative closures into a single category ("Closed without decision"). The dataset does not distinguish between applicants who voluntarily left versus dockets that were administratively cleared by judicial order.
          </li>
          <li>
            <strong className="text-foreground">Procedural Stage Variances:</strong> Reporting practices vary by country; some jurisdictions report only initial first-instance decisions, while others include subsequent appellate and judicial review stages in their totals.
          </li>
        </ul>
      </section>

      {/* 8. CONCLUSION AND ATTRIBUTION */}
      <section className="rounded-xl border border-border bg-card p-5 sm:p-6 lg:p-8 space-y-5 shadow-xs">
        <div className="space-y-3">
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground border-b border-border pb-2">
            Conclusion and Attribution
          </h2>

          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            By analyzing 16 years of UNHCR administrative records, this project demonstrates that global asylum backlogs are primarily driven by administrative capacity limits and court processing speeds rather than application volume alone. Operational solvency requires aligning intake demand with institutional decision resources across all stages of the legal process.
          </p>
        </div>

        <div className="pt-4 border-t border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs sm:text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground shrink-0" />
            <span>
              <strong className="text-foreground">Author:</strong> Dionis Ludovick Nasuwa
              <span className="text-muted-foreground/60 mx-1.5">|</span>
              <span>A data analyst and software developer.</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://dio.is-a.dev/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sky-600 dark:text-sky-400 hover:underline font-medium text-xs"
            >
              <span>Portfolio</span>
              <ArrowUpRight className="h-3 w-3" />
            </a>
            <span className="text-muted-foreground/40">·</span>
            <a
              href="https://github.com/dionis36/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sky-600 dark:text-sky-400 hover:underline font-medium text-xs"
            >
              <span>GitHub</span>
              <ArrowUpRight className="h-3 w-3" />
            </a>
            <span className="text-muted-foreground/40">·</span>
            <a
              href="https://linkedin.com/in/dionis-nasuwa/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sky-600 dark:text-sky-400 hover:underline font-medium text-xs"
            >
              <span>LinkedIn</span>
              <ArrowUpRight className="h-3 w-3" />
            </a>
            <span className="text-muted-foreground/40">·</span>
            <a
              href="https://www.unhcr.org/refugee-statistics/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground font-medium text-xs"
            >
              <span>UNHCR Data Finder</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
