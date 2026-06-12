"use client";

import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  Calendar,
  CheckSquare,
  Sparkles,
  UserPlus,
  X,
} from "lucide-react";

const TARGET_CONFIDENCE = 89;

const PRIMARY_CAUSES = [
  "Pricing page visits decreased 38%",
  "Email response rate dropped 24%",
  "No stakeholder engagement in 14 days",
  "Demo requests declined week-over-week",
] as const;

const AFFECTED_ACCOUNTS = ["Acme Corp", "Horizon AI", "Vertex Systems"] as const;

const TIMELINE = [
  { when: "Today", event: "Risk detected" },
  { when: "Yesterday", event: "Engagement decline observed" },
  { when: "3 days ago", event: "Activity trend changed" },
  { when: "7 days ago", event: "Baseline established" },
] as const;

function useAnimatedConfidence(isOpen: boolean) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!isOpen) return;

    const duration = 1400;
    const start = performance.now();
    let frame: number;

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * TARGET_CONFIDENCE));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [isOpen]);

  return isOpen ? value : 0;
}

type RevenueRisk = {
  company: string;
  description: string;
  impactMrr: number;
};

type DataRow = Record<string, unknown>;

function textValue(row: DataRow, keys: string[], fallback = "") {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number") return String(value);
  }

  return fallback;
}

function numberValue(row: DataRow, keys: string[], fallback: number) {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) {
      return Number(value);
    }
  }

  return fallback;
}

function mapSupabaseRisk(row: DataRow, index: number): RevenueRisk {
  return {
    company: textValue(row, ["company", "company_name", "customer", "account"], `Account ${index + 1}`),
    description: textValue(
      row,
      ["description", "risk_description", "reason", "summary", "notes"],
      "Revenue risk detected from connected Supabase business signals.",
    ),
    impactMrr: numberValue(row, ["impact_mrr", "impactMrr", "revenue_at_risk", "impact", "amount"], 0),
  };
}

export function RevenueRiskAnalysisPanel({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const confidence = useAnimatedConfidence(isOpen);

  const [risks, setRisks] = useState<RevenueRisk[]>([]);
 useEffect(() => {
  if (!isSupabaseConfigured) return;

  async function fetchRisks() {
    const { data, error } = await supabase
      .from("revenue_risks")
      .select("*");

    if (error) return;
    setRisks(((data || []) as DataRow[]).map(mapSupabaseRisk));
  }

  fetchRisks();
}, []);
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;
  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden={!isOpen}
      />

      {/* Panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="revenue-risk-panel-title"
        className={`fixed inset-y-0 right-0 z-[101] flex w-full flex-col border-l border-white/[0.08] bg-[#0A0A0A]/95 shadow-[-24px_0_80px_rgba(0,0,0,0.55)] backdrop-blur-2xl transition-transform duration-300 ease-out sm:max-w-[480px] ${
          isOpen ? "translate-x-0" : "pointer-events-none translate-x-full"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.12),transparent_55%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(245,158,11,0.08),transparent_60%)]" />

        <header className="relative flex items-start justify-between gap-4 border-b border-white/[0.06] px-5 py-5 sm:px-6">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-400/90">
              Executive intelligence
            </p>
            <h2
              id="revenue-risk-panel-title"
              className="mt-1 text-lg font-semibold text-white"
            >
              Revenue Risk Analysis
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-zinc-400 transition hover:bg-white/[0.08] hover:text-zinc-200"
            aria-label="Close panel"
          >
            <X className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </header>

        <div className="relative flex-1 overflow-y-auto px-5 py-6 sm:px-6">
          <section className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4 backdrop-blur-xl">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Risk summary
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-zinc-300">
              Revenue risk detected across 3 enterprise accounts.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-white/[0.06] bg-black/30 px-3 py-2.5">
                <p className="text-[10px] uppercase tracking-wider text-zinc-600">
                  Potential ARR impact
                </p>
                <p className="mt-1 text-xl font-semibold tabular-nums text-white">
                  ${risks.reduce((sum, risk) => sum + risk.impactMrr, 0).toLocaleString()}
                </p>
              </div>
              <div className="rounded-xl border border-white/[0.06] bg-black/30 px-3 py-2.5">
                <p className="text-[10px] uppercase tracking-wider text-zinc-600">
                  Confidence
                </p>
                <p className="mt-1 text-xl font-semibold tabular-nums text-emerald-300">
                  {confidence}%
                </p>
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-600/80 to-emerald-400 transition-all duration-300 ease-out"
                    style={{ width: `${confidence}%` }}
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="mt-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Primary causes
            </h3>
            <ul className="mt-3 space-y-2">
              {(risks.length > 0 ? risks.slice(0, 5).map((risk) => risk.description) : PRIMARY_CAUSES).map((cause, index) => (
                <li
                  key={`${cause}-${index}`}
                  className="flex items-start gap-2.5 text-sm text-zinc-300"
                >
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-amber-400/90" />
                  {cause}
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Affected accounts
            </h3>
            <ul className="mt-3 space-y-2">
              {(risks.length > 0 ? risks.slice(0, 5).map((risk) => risk.company) : AFFECTED_ACCOUNTS).map((account) => (
                <li
                  key={account}
                  className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-sm font-medium text-zinc-200"
                >
                  {account}
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-5 rounded-2xl border border-violet-500/20 bg-violet-500/10 p-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-violet-300" strokeWidth={1.75} />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-violet-300">
                AI recommendation
              </h3>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-zinc-200">
              Schedule executive outreach within 48 hours.
            </p>
          </section>

          <section className="mt-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Recommended actions
            </h3>
            <div className="mt-3 grid gap-2">
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-zinc-200 transition hover:border-white/[0.12] hover:bg-white/[0.07]"
              >
                <UserPlus className="h-4 w-4 text-zinc-500" strokeWidth={1.75} />
                Assign owner
              </button>
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-zinc-200 transition hover:border-white/[0.12] hover:bg-white/[0.07]"
              >
                <CheckSquare className="h-4 w-4 text-zinc-500" strokeWidth={1.75} />
                Create task
              </button>
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-violet-500/30 bg-violet-500/15 px-4 py-2.5 text-sm font-medium text-violet-200 transition hover:border-violet-500/45 hover:bg-violet-500/20"
              >
                <Calendar className="h-4 w-4" strokeWidth={1.75} />
                Schedule follow-up
              </button>
            </div>
          </section>

          <section className="mt-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Timeline
            </h3>
            <ul className="mt-3 space-y-0">
              {TIMELINE.map((item, i) => (
                <li
                  key={item.when}
                  className="relative flex gap-3 pb-4 last:pb-0"
                >
                  {i < TIMELINE.length - 1 && (
                    <span className="absolute left-[7px] top-4 bottom-0 w-px bg-gradient-to-b from-white/15 to-transparent" />
                  )}
                  <span className="relative z-10 mt-1.5 h-3.5 w-3.5 shrink-0 rounded-full border border-amber-500/40 bg-amber-500/20" />
                  <div>
                    <p className="text-[11px] font-medium text-zinc-500">
                      {item.when}
                    </p>
                    <p className="text-sm text-zinc-300">→ {item.event}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </aside>
    </>,
    document.body,
  );
}
