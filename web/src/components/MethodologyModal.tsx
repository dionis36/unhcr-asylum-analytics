"use client";

import { useState, useEffect } from "react";
import {
  X,
  BookOpen,
  Database,
  Scale,
  ShieldCheck,
  FileX2,
  Download,
  FileText,
  Calculator,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MethodologyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type MethodologyTab = "provenance" | "privacy" | "formulas" | "statutory";

export function MethodologyModal({ isOpen, onClose }: MethodologyModalProps) {
  const [activeTab, setActiveTab] = useState<MethodologyTab>("provenance");

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const tabs: { id: MethodologyTab; label: string; icon: typeof Database }[] = [
    { id: "provenance", label: "Data Provenance", icon: Database },
    { id: "privacy", label: "Privacy & Imputation", icon: ShieldCheck },
    { id: "formulas", label: "Metric Formulas", icon: Calculator },
    { id: "statutory", label: "Statutory Dispositions", icon: Scale },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-background/80 backdrop-blur-md animate-in fade-in-0 duration-200">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative w-full max-w-4xl rounded-2xl border border-border bg-card shadow-2xl z-10 max-h-[88vh] flex flex-col overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200 ease-out">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border p-5 sm:p-6 bg-card shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-blue-500/25 bg-blue-500/10 text-blue-600 dark:text-sky-400 shadow-xs shrink-0">
              <Scale className="h-5 w-5" strokeWidth={1.85} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold tracking-tight text-foreground">
                  Technical Methodology and Analytical Framework
                </h2>
                <span className="hidden sm:inline-flex items-center rounded-md border border-border/70 bg-muted/50 px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                  UNHCR Audit Standard
                </span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Standardized 16-Year Operating Ledger (2010–2025) · UNHCR Refugee Data Finder Database
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors duration-150 cursor-pointer"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation Strip */}
        <div className="border-b border-border bg-muted/40 px-5 sm:px-6 py-2.5 shrink-0 overflow-x-auto">
          <div className="inline-flex items-center rounded-lg border border-border/60 bg-muted/60 p-1 gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all duration-150 select-none whitespace-nowrap cursor-pointer",
                    isActive
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-background/40"
                  )}
                >
                  <Icon className={cn("h-3.5 w-3.5", isActive ? "text-sky-600 dark:text-sky-400" : "text-muted-foreground")} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Scrollable Tab Body */}
        <div key={activeTab} className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 animate-in fade-in-50 duration-150 ease-out">
          {/* TAB 1: PROVENANCE */}
          {activeTab === "provenance" && (
            <div className="space-y-4 animate-in fade-in-50 duration-150">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-foreground">
                  Data Provenance and Longitudinal Horizon
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
                  This platform audits 16 consecutive calendar years of international asylum adjudication (2010–2025). The data repository synthesizes microdata and aggregate ledgers published by the official <span className="font-semibold text-foreground">UNHCR Refugee Data Finder</span> and the UN Population Statistics Database.
                </p>
              </div>

              {/* 4 Standardized Scale Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-xl border border-border bg-muted/20 p-3 text-center">
                  <span className="block text-xs font-medium text-muted-foreground">Audit Horizon</span>
                  <span className="text-sm sm:text-base font-extrabold text-foreground tabular-nums block mt-0.5">
                    2010–2025
                  </span>
                  <span className="text-[10px] text-muted-foreground">16 Calendar Years</span>
                </div>
                <div className="rounded-xl border border-border bg-muted/20 p-3 text-center">
                  <span className="block text-xs font-medium text-muted-foreground">Sovereign Hosts</span>
                  <span className="text-sm sm:text-base font-extrabold text-foreground tabular-nums block mt-0.5">
                    186 States
                  </span>
                  <span className="text-[10px] text-muted-foreground">Global Jurisdictions</span>
                </div>
                <div className="rounded-xl border border-border bg-muted/20 p-3 text-center">
                  <span className="block text-xs font-medium text-muted-foreground">Total Filings</span>
                  <span className="text-sm sm:text-base font-extrabold text-foreground tabular-nums block mt-0.5">
                    33,139,875
                  </span>
                  <span className="text-[10px] text-muted-foreground">Standardized Claims</span>
                </div>
                <div className="rounded-xl border border-border bg-muted/20 p-3 text-center">
                  <span className="block text-xs font-medium text-muted-foreground">Decided Merits</span>
                  <span className="text-sm sm:text-base font-extrabold text-foreground tabular-nums block mt-0.5">
                    26,923,303
                  </span>
                  <span className="text-[10px] text-muted-foreground">Legal Determinations</span>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-4 space-y-2">
                <span className="text-xs font-bold text-foreground block">Procedural Scope and Adjudication Stages</span>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  The analytical pipeline unifies both initial first-instance decisions (e.g. asylum officers, administrative border interviews) and defensive appellate stages (e.g. administrative immigration courts, judicial review boards). This prevents the systemic exclusion of countries like the United States (which reports via USCIS affirmative interviews and EOIR court proceedings) or Germany (which reports NA and JR procedural stages).
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: PRIVACY & IMPUTATION */}
          {activeTab === "privacy" && (
            <div className="space-y-4 animate-in fade-in-50 duration-150">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-foreground">
                  Confidentiality Protection and Cohort Imputation
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
                  To safeguard individual applicant identities against deductive disclosure in small demographic cohorts, official UNHCR source ledgers redact counts between 1 and 4 as asterisks (<code className="rounded border border-border bg-muted px-1.5 py-0.5 font-bold text-xs text-foreground">*</code>).
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-xl border border-border bg-card p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground text-xs sm:text-sm">Raw Headcount Ledger</span>
                    <span className="rounded bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                      Baseline Zero
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Treats redacted asterisks as 0 to provide a conservative, non-interpolated legal baseline. Yields <span className="font-semibold text-foreground tabular-nums">32,524,694</span> documented cases across all host states.
                  </p>
                </div>

                <div className="rounded-xl border border-border bg-card p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground text-xs sm:text-sm">Standardized Imputed Ledger</span>
                    <span className="rounded bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 text-[11px] font-semibold text-sky-700 dark:text-sky-300">
                      Audit Standard
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Imputes masked cohorts to statistical median midpoints (2.5 cases) weighted by host nation reporting tier. Produces the <span className="font-semibold text-foreground tabular-nums">33,139,875</span> standardized caseload framework.
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-1.5">
                <span className="text-xs font-bold text-foreground block">Dual-Ledger Governance Guarantee</span>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Both ledgers are tracked side-by-side in data marts. This prevents statistical distortion while preserving verifiable transparency between raw government submissions and standardized cross-national models.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: FORMULAS */}
          {activeTab === "formulas" && (
            <div className="space-y-4 animate-in fade-in-50 duration-150">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-foreground">
                  Mathematical Formulas and Operational Metrics
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
                  The dashboard applies rigorous court-administration formulas to assess judicial velocity, queue exhaustion horizons, and due process attrition.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs sm:text-sm">
                {/* Formula 1 */}
                <div className="rounded-xl border border-border bg-card p-4 space-y-2 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">Case Clearance Rate (CCR)</span>
                    <span className="text-[11px] font-semibold text-sky-600 dark:text-sky-400">% Velocity</span>
                  </div>
                  <div className="rounded-lg border border-border/70 bg-muted/60 p-2 text-center text-xs text-foreground font-semibold tracking-wide">
                    CCR = (Total Decisions ÷ New Claims Filed) × 100%
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Measures adjudicative pace against intake. CCR &lt; 100% denotes a structural operational deficit where the backlog compounds annually.
                  </p>
                </div>

                {/* Formula 2 */}
                <div className="rounded-xl border border-border bg-card p-4 space-y-2 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">Years to Clear Horizon (YTC)</span>
                    <span className="text-[11px] font-semibold text-teal-600 dark:text-teal-400">Queue Longevity</span>
                  </div>
                  <div className="rounded-lg border border-border/70 bg-muted/60 p-2 text-center text-xs text-foreground font-semibold tracking-wide">
                    YTC = Pending Backlog ÷ Annual Decision Rate
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Estimates the years required to clear active pending inventory under current judicial pace, assuming static intake.
                  </p>
                </div>

                {/* Formula 3 */}
                <div className="rounded-xl border border-border bg-card p-4 space-y-2 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">Due Process Ghost Rate</span>
                    <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">Attrition Share</span>
                  </div>
                  <div className="rounded-lg border border-border/70 bg-muted/60 p-2 text-center text-xs text-foreground font-semibold tracking-wide">
                    Ghost Rate = (Closed w/o Ruling ÷ Total Determinations) × 100%
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Measures the percentage of claims terminated without an individual merits ruling (procedural dismissals, administrative closures, or abandonment).
                  </p>
                </div>

                {/* Formula 4 */}
                <div className="rounded-xl border border-border bg-card p-4 space-y-2 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">Decision Authority</span>
                    <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">Government and UNHCR</span>
                  </div>
                  <div className="rounded-lg border border-border/70 bg-muted/60 p-2 text-center text-xs text-foreground font-semibold tracking-wide">
                    Split = Government Court System vs. Delegated UNHCR RSD
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Distinguishes between independent national courts and delegated UNHCR mandate determinations in transit states.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: STATUTORY DISPOSITIONS */}
          {activeTab === "statutory" && (
            <div className="space-y-4 animate-in fade-in-50 duration-150">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-foreground">
                  The Four Statutory Legal Dispositions
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
                  International refugee law determinations are categorized into four exhaustive legal dispositions according to UNHCR standard reporting definitions:
                </p>
              </div>

              <div className="space-y-2.5">
                <div className="rounded-xl border border-border bg-card p-3.5 flex items-start gap-3">
                  <span className="h-3 w-3 rounded-full bg-blue-600 dark:bg-sky-400 shrink-0 mt-1" />
                  <div>
                    <span className="font-bold text-foreground text-xs sm:text-sm block">
                      1. Geneva Convention Recognition (1951 Convention / 1967 Protocol)
                    </span>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                      Full legal status recognized under the 1951 Convention relating to the Status of Refugees. Grants complete non-refoulement protection, permanent residency pathways, and family reunification rights.
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-3.5 flex items-start gap-3">
                  <span className="h-3 w-3 rounded-full bg-teal-600 dark:bg-teal-400 shrink-0 mt-1" />
                  <div>
                    <span className="font-bold text-foreground text-xs sm:text-sm block">
                      2. Complementary and Subsidiary Protection
                    </span>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                      Humanitarian stay or subsidiary protection granted under regional human rights conventions (e.g. Cartagena Declaration, European Qualification Directive, or national humanitarian parole frameworks).
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-3.5 flex items-start gap-3">
                  <span className="h-3 w-3 rounded-full bg-slate-500 shrink-0 mt-1" />
                  <div>
                    <span className="font-bold text-foreground text-xs sm:text-sm block">
                      3. Formal Negative Merits Rejections
                    </span>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                      Substantive judicial or administrative rulings finding that the applicant does not satisfy statutory refugee criteria following individual examination of claims and country conditions.
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-3.5 flex items-start gap-3">
                  <span className="h-3 w-3 rounded-full bg-amber-500 shrink-0 mt-1" />
                  <div>
                    <span className="font-bold text-foreground text-xs sm:text-sm block">
                      4. Non-Decisional Administrative Closures (Ghost Cases)
                    </span>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                      Claims terminated procedurally without any ruling on the merits of persecution (withdrawn applications, applicant departures, failure to appear, or indefinite docket archiving).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border bg-muted/30 p-4 px-5 sm:px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2 text-muted-foreground">
            <BookOpen className="h-4 w-4 text-sky-600 dark:text-sky-400 shrink-0" />
            <span className="truncate">
              UNHCR Population Statistics Database, Asylum Applications and Decisions (2010–2025).
            </span>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <a
              href="/data/global_kpis.json"
              download
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-accent/60 transition-colors shadow-xs"
            >
              <Download className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Download Mart</span>
            </a>

            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-foreground text-background font-semibold hover:bg-foreground/90 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
