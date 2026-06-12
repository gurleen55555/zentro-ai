"use client";

import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { Brain, Sparkles, TrendingUp, ShieldAlert } from "lucide-react";

type DataRow = Record<string, unknown>;

function textValue(row: DataRow, keys: string[]) {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }

  return "";
}

function numberValue(row: DataRow, keys: string[]) {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) {
      return Number(value);
    }
  }

  return 0;
}

export function ExecutiveInsightsAgent() {
  const [summary, setSummary] = useState({
    totalLeads: 0,
    hotLeads: 0,
    totalCustomers: 0,
    openRisks: 0,
    totalRiskImpact: 0,
  });

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    async function fetchExecutiveData() {
      const { data: leads } = await supabase.from("leads").select("*");
      const { data: customers } = await supabase.from("customers").select("*");
      const { data: risks } = await supabase.from("revenue_risks").select("*");

      const leadRows = (leads || []) as DataRow[];
      const riskRows = (risks || []) as DataRow[];

      setSummary({
        totalLeads: leadRows.length,
        hotLeads: leadRows.filter((lead) => {
          const status = textValue(lead, ["status", "priority", "lead_status"]).toLowerCase();
          const score = numberValue(lead, ["score", "lead_score", "intent_score"]);
          return status.includes("hot") || status.includes("urgent") || score >= 80;
        }).length,
        totalCustomers: customers?.length || 0,
        openRisks: riskRows.filter((risk) => {
          const status = textValue(risk, ["status", "risk_status"]).toLowerCase();
          return !status || status.includes("open") || status.includes("active");
        }).length,
        totalRiskImpact: riskRows.reduce(
          (sum, risk) =>
            sum +
            numberValue(risk, ["impact_mrr", "impactMrr", "revenue_at_risk", "impact", "amount"]),
          0,
        ),
      });
    }

    fetchExecutiveData();
  }, []);

  return (
    <section className="mb-10 rounded-[1.75rem] border border-white/[0.06] bg-white/[0.025] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-fuchsia-500/15 text-fuchsia-300 ring-1 ring-fuchsia-500/20">
          <Brain className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">
            Executive Insights Agent
          </h2>
          <p className="text-sm text-zinc-500">
            AI-generated business summary from live Supabase data
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-white/[0.06] bg-black/20 p-4">
          <Sparkles className="mb-3 h-5 w-5 text-violet-300" />
          <p className="text-xs uppercase tracking-wider text-zinc-600">
            Total Leads
          </p>
          <p className="mt-1 text-2xl font-semibold text-white">
            {summary.totalLeads}
          </p>
        </div>

        <div className="rounded-2xl border border-white/[0.06] bg-black/20 p-4">
          <TrendingUp className="mb-3 h-5 w-5 text-emerald-300" />
          <p className="text-xs uppercase tracking-wider text-zinc-600">
            Hot Leads
          </p>
          <p className="mt-1 text-2xl font-semibold text-white">
            {summary.hotLeads}
          </p>
        </div>

        <div className="rounded-2xl border border-white/[0.06] bg-black/20 p-4">
          <Brain className="mb-3 h-5 w-5 text-sky-300" />
          <p className="text-xs uppercase tracking-wider text-zinc-600">
            Customers
          </p>
          <p className="mt-1 text-2xl font-semibold text-white">
            {summary.totalCustomers}
          </p>
        </div>

        <div className="rounded-2xl border border-white/[0.06] bg-black/20 p-4">
          <ShieldAlert className="mb-3 h-5 w-5 text-amber-300" />
          <p className="text-xs uppercase tracking-wider text-zinc-600">
            Risk Impact
          </p>
          <p className="mt-1 text-2xl font-semibold text-white">
            ${summary.totalRiskImpact.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-violet-500/20 bg-violet-500/10 p-4">
        <p className="text-sm leading-relaxed text-zinc-200">
  {summary.hotLeads} high-intent leads are currently active. Revenue
  exposure is ${summary.totalRiskImpact.toLocaleString()} across{" "}
  {summary.openRisks} customer accounts. Immediate focus should be
  placed on recovering at-risk accounts while prioritizing enterprise
  opportunities with scores above 80.
</p>
      </div>
    </section>
  );
}
