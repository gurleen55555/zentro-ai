"use client";

import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { RevenueRiskAnalysisPanel } from "@/components/RevenueRiskAnalysisPanel";
import {
  AlertTriangle,
  Building2,
  ChevronDown,
  Eye,
  FileText,
  Mail,
  Radar,
  Sparkles,
  Target,
  TrendingUp,
  UserPlus,
  Video,
  X,
} from "lucide-react";

type Priority = "urgent" | "warm" | "nurture";

type ActivityItem = {
  time: string;
  label: string;
  icon: "eye" | "mail" | "video" | "user" | "file";
};

type Lead = {
  id: string;
  name: string;
  status?: string;
  company?: string;
  initials: string;
  avatarGradient: string;
  avatarGlow: string;
  score: number;
  probabilityToClose: number;
  industry: string;
  companySize: string;
  lastInteraction: string;
  priority: Priority;
  activity: ActivityItem[];
  explain: {
    whyRanked: string;
    signals: string[];
    nextAction: string;
    confidence: number;
  };
};

const PRIORITY_STYLES: Record<
  Priority,
  {
    label: string;
    dot: string;
    border: string;
    bg: string;
    text: string;
    pulse?: boolean;
  }
> = {
  urgent: {
    label: "Urgent",
    dot: "bg-red-400",
    border: "border-red-500/30",
    bg: "bg-red-500/10",
    text: "text-red-300",
    pulse: true,
  },
  warm: {
    label: "Warm",
    dot: "bg-amber-400",
    border: "border-amber-500/30",
    bg: "bg-amber-500/10",
    text: "text-amber-300",
  },
  nurture: {
    label: "Nurture",
    dot: "bg-emerald-400",
    border: "border-emerald-500/30",
    bg: "bg-emerald-500/10",
    text: "text-emerald-300",
  },
};

const ACTIVITY_ICONS = {
  eye: Eye,
  mail: Mail,
  video: Video,
  user: UserPlus,
  file: FileText,
} as const;

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

function initialsFor(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "ZA";
}

function priorityFrom(row: DataRow, score: number): Priority {
  const status = textValue(row, ["status", "priority", "lead_status"]).toLowerCase();
  if (status.includes("hot") || status.includes("urgent") || score >= 85) return "urgent";
  if (status.includes("cold") || status.includes("nurture") || score < 60) return "nurture";
  return "warm";
}

function mapSupabaseLead(row: DataRow, index: number): Lead {
  const name = textValue(row, ["name", "company", "company_name", "lead_name"], `Lead ${index + 1}`);
  const score = Math.round(numberValue(row, ["score", "lead_score", "intent_score"], 72));
  const status = textValue(row, ["status", "priority", "lead_status"], score >= 85 ? "hot" : "warm");
  const industry = textValue(row, ["industry", "segment", "category"], "Business account");
  const companySize = textValue(row, ["company_size", "companySize", "employees"], "Company size unavailable");
  const probabilityToClose = Math.max(
    20,
    Math.min(95, Math.round(numberValue(row, ["probability_to_close", "probabilityToClose", "close_probability"], score - 10))),
  );
  const priority = priorityFrom(row, score);

  return {
    id: textValue(row, ["id", "lead_id", "uuid"], `${name}-${index}`),
    name,
    status,
    company: textValue(row, ["company", "company_name"], name),
    initials: initialsFor(name),
    avatarGradient: "from-violet-600 via-indigo-600 to-violet-700",
    avatarGlow: "shadow-violet-500/25 group-hover:shadow-violet-500/40",
    score,
    probabilityToClose,
    industry,
    companySize,
    lastInteraction: textValue(row, ["last_interaction", "lastInteraction", "updated_at", "created_at"], "Recent CRM activity"),
    priority,
    activity: [
      {
        time: "Live",
        label: `Imported from Supabase with ${status} status`,
        icon: "user",
      },
      {
        time: "Now",
        label: `AI score calculated as ${score}`,
        icon: "eye",
      },
    ],
    explain: {
      whyRanked: textValue(
        row,
        ["why_ranked", "explanation", "notes", "description"],
        `${name} is prioritized using Supabase CRM status, score, and engagement fields.`,
      ),
      signals: [
        `Lead score: ${score}`,
        `Status: ${status}`,
        `Segment: ${industry}`,
        `Probability to close: ${probabilityToClose}%`,
      ],
      nextAction: textValue(
        row,
        ["next_action", "recommended_action", "recommendation"],
        priority === "urgent"
          ? "Assign senior sales coverage and schedule follow-up within 24 hours."
          : "Continue targeted outreach and monitor engagement changes.",
      ),
      confidence: Math.max(70, Math.min(95, score)),
    },
  };
}

const LEADS: Lead[] = [
  {
    id: "acme",
    name: "Acme Corp",
    initials: "AC",
    avatarGradient: "from-violet-600 via-indigo-600 to-violet-700",
    avatarGlow: "shadow-violet-500/25 group-hover:shadow-violet-500/40",
    score: 94,
    probabilityToClose: 78,
    industry: "Enterprise Software",
    companySize: "500–1,000 employees",
    lastInteraction: "Pricing page visit · 2h ago",
    priority: "urgent",
    activity: [
      { time: "2h ago", label: "Viewed pricing page", icon: "eye" },
      { time: "5h ago", label: "Opened proposal", icon: "file" },
      { time: "Yesterday", label: "Completed security review call", icon: "video" },
      { time: "3 days ago", label: "Added VP IT as stakeholder", icon: "user" },
    ],
    explain: {
      whyRanked:
        "Acme shows enterprise buying motion: security review initiated, multiple stakeholders engaged, and budget holder joined the last call.",
      signals: [
        "Visited pricing 4× in 7 days",
        "Opened enterprise security one-pager",
        "Champion replied within 4 hours on procurement thread",
        "Firmographic match to top 10% closed-won accounts",
      ],
      nextAction:
        "Schedule executive alignment call with VP Sales + IT within 48 hours; attach ROI model and reference customer in same vertical.",
      confidence: 91,
    },
  },
  {
    id: "nexora",
    name: "Nexora Labs",
    initials: "NX",
    avatarGradient: "from-cyan-600 via-sky-600 to-cyan-700",
    avatarGlow: "shadow-cyan-500/25 group-hover:shadow-cyan-500/40",
    score: 81,
    probabilityToClose: 62,
    industry: "Biotech / R&D",
    companySize: "200–500 employees",
    lastInteraction: "Demo completed · Yesterday",
    priority: "warm",
    activity: [
      { time: "Yesterday", label: "Completed demo", icon: "video" },
      { time: "2 days ago", label: "Requested integration docs", icon: "mail" },
      { time: "4 days ago", label: "Opened technical brief", icon: "file" },
      { time: "1 week ago", label: "Added lab director to thread", icon: "user" },
    ],
    explain: {
      whyRanked:
        "Strong product fit after demo; evaluation timeline confirmed for Q3, but legal review has not started yet.",
      signals: [
        "Positive demo NPS from 3 attendees",
        "Requested integration documentation",
        "CRM stage moved to Technical Validation",
        "No competitor mentioned in last 2 meetings",
      ],
      nextAction:
        "Send mutual evaluation plan with milestones; book technical deep-dive with their data team next week.",
      confidence: 84,
    },
  },
  {
    id: "horizon",
    name: "Horizon AI",
    initials: "HZ",
    avatarGradient: "from-fuchsia-600 via-violet-600 to-indigo-700",
    avatarGlow: "shadow-fuchsia-500/25 group-hover:shadow-fuchsia-500/40",
    score: 88,
    probabilityToClose: 71,
    industry: "Artificial Intelligence",
    companySize: "150–300 employees",
    lastInteraction: "Inbound reply · 5h ago",
    priority: "urgent",
    activity: [
      { time: "5h ago", label: "CEO replied requesting enterprise quote", icon: "mail" },
      { time: "6h ago", label: "Downloaded compliance pack", icon: "file" },
      { time: "Yesterday", label: "Viewed enterprise pricing", icon: "eye" },
      { time: "3 days ago", label: "Inbound form submitted", icon: "user" },
    ],
    explain: {
      whyRanked:
        "Inbound intent spike: founder requested enterprise tier quote and asked about SOC 2 — typical late-stage signal for growth-stage AI companies.",
      signals: [
        "Direct email from CEO requesting quote",
        "Downloaded compliance pack",
        "LinkedIn engagement from 2 board advisors",
        "Similar to 3 recent wins in AI infrastructure",
      ],
      nextAction:
        "Respond with tailored enterprise proposal today; offer 30-min security review with solutions engineer.",
      confidence: 89,
    },
  },
  {
    id: "delta",
    name: "Delta Systems",
    initials: "DS",
    avatarGradient: "from-zinc-600 via-zinc-700 to-zinc-800",
    avatarGlow: "shadow-zinc-500/20 group-hover:shadow-zinc-500/35",
    score: 58,
    probabilityToClose: 34,
    industry: "Industrial IoT",
    companySize: "1,000+ employees",
    lastInteraction: "Newsletter click · 4 days ago",
    priority: "nurture",
    activity: [
      { time: "4 days ago", label: "Clicked newsletter CTA", icon: "mail" },
      { time: "2 weeks ago", label: "Viewed case study page", icon: "eye" },
      { time: "3 weeks ago", label: "Downloaded IoT whitepaper", icon: "file" },
    ],
    explain: {
      whyRanked:
        "Long-cycle account with early interest only; no meeting held and champion not yet identified.",
      signals: [
        "Light email engagement (2 opens, no replies)",
        "No CRM meetings logged",
        "Fit score high on paper, engagement score low",
        "Parent company in expansion mode — monitor for trigger events",
      ],
      nextAction:
        "Add to nurture sequence with case study in industrial IoT; set alert for funding or leadership change news.",
      confidence: 76,
    },
  },
  {
    id: "quantum",
    name: "QuantumEdge",
    initials: "QE",
    avatarGradient: "from-indigo-600 via-violet-600 to-indigo-700",
    avatarGlow: "shadow-indigo-500/25 group-hover:shadow-indigo-500/40",
    score: 72,
    probabilityToClose: 55,
    industry: "Cybersecurity",
    companySize: "50–150 employees",
    lastInteraction: "Call scheduled · Tomorrow 10:00 AM",
    priority: "warm",
    activity: [
      { time: "Tomorrow", label: "Discovery call scheduled", icon: "video" },
      { time: "Today", label: "Asked about annual billing in chat", icon: "mail" },
      { time: "2 days ago", label: "Invited 2 colleagues to trial", icon: "user" },
      { time: "1 week ago", label: "Started 14-day trial (8 seats)", icon: "eye" },
    ],
    explain: {
      whyRanked:
        "Discovery call booked with Head of Ops; prior trial usage suggests team-level adoption before org-wide rollout.",
      signals: [
        "14-day trial with 8 active seats",
        "Invited 2 colleagues during trial",
        "Asked about annual billing in support chat",
        "Competitive displacement opportunity (legacy vendor contract ends in 90 days)",
      ],
      nextAction:
        "Prepare discovery deck focused on ops efficiency + migration path; confirm decision criteria and timeline on tomorrow’s call.",
      confidence: 82,
    },
  },
];

function CompanyAvatar({ lead }: { lead: Lead }) {
  return (
    <div
      className={`group/avatar relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${lead.avatarGradient} text-sm font-semibold text-white ring-1 ring-inset ring-white/20 transition-all duration-300 ${lead.avatarGlow} group-hover:scale-[1.03]`}
    >
      <span className="relative z-10">{lead.initials}</span>
      <div className="pointer-events-none absolute inset-0 rounded-full bg-white/10 opacity-0 transition-opacity duration-300 group-hover/avatar:opacity-100" />
    </div>
  );
}

function ScoreRing({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 18;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative h-12 w-12 shrink-0 transition-transform duration-300 group-hover:scale-105">
      <svg className="h-12 w-12 -rotate-90" viewBox="0 0 40 40">
        <circle
          cx="20"
          cy="20"
          r="18"
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="3"
        />
        <circle
          cx="20"
          cy="20"
          r="18"
          fill="none"
          stroke="#8B5CF6"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold tabular-nums text-white">
        {score}
      </span>
    </div>
  );
}

function ConfidenceVisualization({ confidence }: { confidence: number }) {
  const bars = [1, 2, 3, 4, 5];
  const activeBars = Math.round((confidence / 100) * 5);

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative h-14 w-14 shrink-0">
          <svg className="h-14 w-14 -rotate-90" viewBox="0 0 44 44">
            <circle
              cx="22"
              cy="22"
              r="18"
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="3"
            />
            <circle
              cx="22"
              cy="22"
              r="18"
              fill="none"
              stroke="#10B981"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 18}
              strokeDashoffset={
                2 * Math.PI * 18 - (confidence / 100) * 2 * Math.PI * 18
              }
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-xs font-bold tabular-nums text-emerald-300">
            {confidence}%
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            AI reasoning confidence
          </p>
          <p className="mt-1 text-sm text-zinc-300">
            Signal strength across CRM, email, and meetings
          </p>
          <div className="mt-3 flex items-end gap-1">
            {bars.map((b) => (
              <div
                key={b}
                className={`w-2 rounded-sm transition-all duration-500 ${
                  b <= activeBars
                    ? "bg-emerald-500/80"
                    : "bg-white/[0.08]"
                }`}
                style={{
                  height: `${8 + b * 4}px`,
                  transitionDelay: `${b * 60}ms`,
                }}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-600/80 via-emerald-400/90 to-emerald-300/80 transition-all duration-1000 ease-out"
          style={{ width: `${confidence}%` }}
        />
      </div>
    </div>
  );
}

function ActivityTimeline({ items }: { items: ActivityItem[] }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
        Recent activity
      </p>
      <ul className="mt-3 space-y-0">
        {items.map((item, i) => {
          const Icon = ACTIVITY_ICONS[item.icon];
          return (
            <li key={`${item.time}-${item.label}`} className="relative flex gap-3 pb-4 last:pb-0">
              {i < items.length - 1 && (
                <span className="absolute left-[15px] top-8 bottom-0 w-px bg-gradient-to-b from-white/10 to-transparent" />
              )}
              <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] text-zinc-500">
                <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
              </div>
              <div className="min-w-0 flex-1 pt-0.5">
                <p className="text-[11px] font-medium text-zinc-600">{item.time}</p>
                <p className="text-sm text-zinc-300">{item.label}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function ExecutiveAlertBanner({
  onDismiss,
  onViewAnalysis,
}: {
  onDismiss: () => void;
  onViewAnalysis: () => void;
}) {
  return (
    <div className="relative mb-4 overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-r from-amber-500/[0.08] via-violet-500/[0.06] to-red-500/[0.06] shadow-lg shadow-amber-500/5 backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-0 animate-pulse bg-[radial-gradient(ellipse_at_left,rgba(245,158,11,0.12),transparent_55%)] opacity-60" style={{ animationDuration: "4s" }} />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_right,rgba(139,92,246,0.10),transparent_50%)]" />

      <div className="relative flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:justify-between sm:p-5">
        <div className="flex gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-500/25 bg-amber-500/15 text-amber-300">
            <AlertTriangle className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-red-500/30 bg-red-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-300">
                High severity
              </span>
              <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                Executive intelligence
              </span>
            </div>
            <h3 className="mt-2 text-base font-semibold text-white">
              Revenue risk detected
            </h3>
            <p className="mt-1 text-sm text-zinc-400">
              Revenue risks detected across customer accounts based on live business signals.
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <div className="rounded-lg border border-white/[0.06] bg-black/20 px-3 py-2">
                <p className="text-[10px] uppercase tracking-wider text-zinc-600">
                  Potential ARR at risk
                </p>
                <p className="mt-0.5 text-lg font-semibold tabular-nums text-white">
                  Live risk analysis
                </p>
              </div>
              <div className="rounded-lg border border-white/[0.06] bg-black/20 px-3 py-2">
                <p className="text-[10px] uppercase tracking-wider text-zinc-600">
                  Recommended action
                </p>
                <p className="mt-0.5 text-sm text-zinc-300">
                  Schedule executive outreach within 48 hours.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:flex-col sm:items-stretch">
          <button
            type="button"
            onClick={onViewAnalysis}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-violet-500/30 bg-violet-500/15 px-4 py-2 text-sm font-medium text-violet-200 transition hover:border-violet-500/45 hover:bg-violet-500/20"
          >
            <Sparkles className="h-4 w-4" strokeWidth={1.75} />
            View analysis
          </button>
          <button
            type="button"
            onClick={onDismiss}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-sm font-medium text-zinc-400 transition hover:bg-white/[0.08] hover:text-zinc-200"
          >
            <X className="h-4 w-4" />
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}

function LeadRow({ lead }: { lead: Lead }) {
  const [expanded, setExpanded] = useState(false);
  const leadPriority: Priority =
  lead.priority ?? (lead.status === "hot" ? "urgent" : lead.status === "cold" ? "nurture" : "warm");

const p = PRIORITY_STYLES[leadPriority];

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 ease-out ${
        expanded
          ? "border-white/[0.12] bg-white/[0.04] shadow-lg shadow-black/25"
          : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.10] hover:bg-white/[0.03] hover:shadow-md hover:shadow-black/20"
      } ${p.pulse && !expanded ? "ring-1 ring-red-500/10" : ""}`}
    >
      {p.pulse && !expanded && (
        <span className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-red-500/20 animate-pulse opacity-40" style={{ animationDuration: "3s" }} />
      )}

      <div className="relative flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:gap-5 sm:p-5">
        <div className="flex min-w-0 flex-1 items-start gap-4">
          <CompanyAvatar lead={lead} />
          <ScoreRing score={lead.score} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-semibold text-white transition-colors group-hover:text-zinc-50">
                {lead.name}
              </h3>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold transition-colors ${p.border} ${p.bg} ${p.text}`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${p.dot} ${p.pulse ? "animate-pulse" : ""}`}
                />
                {p.label}
              </span>
            </div>
            <p className="mt-1 text-sm text-zinc-500">
              {lead.industry ?? lead.company ?? "B2B SaaS"}
            </p>

            <div className="mt-3 grid gap-2 text-xs sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-zinc-600">Probability to close</p>
                <p className="mt-0.5 font-semibold tabular-nums text-zinc-200">
                  {lead.probabilityToClose ?? Math.max(20, Math.min(95, lead.score - 10))}%
                </p>
              </div>
              <div>
                <p className="text-zinc-600">Company size</p>
                <p className="mt-0.5 text-zinc-300">{lead.companySize ?? "100–500 employees"}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-zinc-600">Last interaction</p>
                <p className="mt-0.5 text-zinc-300">{lead.lastInteraction ?? "Recently added to CRM"}</p>
              </div>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-violet-500/25 bg-violet-500/10 px-4 py-2.5 text-sm font-medium text-violet-200 transition-all duration-300 hover:border-violet-500/40 hover:bg-violet-500/15 hover:shadow-md hover:shadow-violet-500/10 sm:self-center"
        >
          <Sparkles className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12" strokeWidth={1.75} />
          Explain Score
          <span
            className={`transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
          >
            <ChevronDown className="h-4 w-4" />
          </span>
        </button>
      </div>

      <div
        className={`grid transition-all duration-300 ease-out ${
          expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="border-t border-white/[0.06] bg-[#0A0A0A]/40 px-4 py-5 sm:px-5">
            <div className="grid gap-5 lg:grid-cols-12">
              <div className="space-y-5 lg:col-span-7">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Why this lead is ranked highly
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-300">
                    {lead.explain?.whyRanked ?? `${lead.name} is ranked based on CRM score, engagement signals, and current buying intent.`}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Signals detected
                  </p>
                  <ul className="mt-2 space-y-1.5">
                    {(
  lead.explain?.signals ?? [
    `Lead score: ${lead.score}`,
    `Status: ${lead.status}`,
    `Company: ${lead.company ?? "Unknown"}`,
  ]
).map((signal) => (
                      <li
                        key={signal}
                        className="flex items-start gap-2 text-sm text-zinc-400"
                      >
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-cyan-500/80" />
                        {signal}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Recommended next action
                  </p>
                  <p className="mt-2 rounded-xl border border-white/[0.06] bg-white/[0.03] p-3 text-sm leading-relaxed text-zinc-200">
                    {lead.explain?.nextAction ?? "Prioritize outreach based on lead score and engagement status."}
                  </p>
                </div>
              </div>

              <div className="space-y-5 lg:col-span-5">
                <ConfidenceVisualization confidence={lead.explain?.confidence ?? lead.score ?? 75} />
                <ActivityTimeline
  items={
    lead.activity ?? [
      {
        time: "Today",
        label: `Lead imported from Supabase with ${lead.status} status`,
        icon: "user",
      },
      {
        time: "Recent",
        label: `AI score calculated as ${lead.score}`,
        icon: "eye",
      },
    ]
  }
/>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function LeadIntelligenceAgent() {
  const [alertVisible, setAlertVisible] = useState(true);
  const [analysisOpen, setAnalysisOpen] = useState(false);
  const [leads, setLeads] = useState<Lead[]>(LEADS);
  const [showAllLeads, setShowAllLeads] = useState(false);
  useEffect(() => {
  if (!isSupabaseConfigured) return;

  async function fetchLeads() {
    const { data, error } = await supabase
      .from("leads")
      .select("*");

    if (error) return;
    if (data?.length) {
      setLeads((data as DataRow[]).map(mapSupabaseLead));
    }
  }

  fetchLeads();
}, []);
  const urgentCount = leads.filter((l) => l.priority === "urgent").length;
  const avgScore = Math.round(
    leads.reduce((s, l) => s + l.score, 0) / Math.max(1, leads.length),
  );

  return (
    <>
      <RevenueRiskAnalysisPanel
        isOpen={analysisOpen}
        onClose={() => setAnalysisOpen(false)}
      />

    <section className="mb-10">
      <div className="relative overflow-hidden rounded-[1.75rem] border border-white/[0.06] bg-gradient-to-b from-white/[0.05] to-white/[0.015] shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(139,92,246,0.10),transparent_55%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(6,182,212,0.08),transparent_60%)]" />

        <div className="relative border-b border-white/[0.06] px-5 py-5 sm:px-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-300 ring-1 ring-inset ring-violet-500/20 transition-shadow duration-300 hover:shadow-lg hover:shadow-violet-500/15">
                <Radar className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Lead Intelligence Agent
                </h2>
                <p className="mt-0.5 text-sm text-zinc-500">
                  AI-ranked pipeline with explainable intent signals
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2 transition-colors hover:bg-white/[0.05]">
                <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
                  Active leads
                </p>
                <p className="text-lg font-semibold tabular-nums text-white">
                  {leads.length}
                </p>
              </div>
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2 transition-colors hover:bg-white/[0.05]">
                <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
                  Urgent
                </p>
                <p className="text-lg font-semibold tabular-nums text-red-300">
                  {urgentCount}
                </p>
              </div>
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2 transition-colors hover:bg-white/[0.05]">
                <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
                  Avg. score
                </p>
                <p className="text-lg font-semibold tabular-nums text-white">
                  {avgScore}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-zinc-500">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-red-400" />
              Urgent — act within 48h
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              Warm — active evaluation
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Nurture — long-cycle nurture
            </span>
          </div>
        </div>

        <div className="relative px-5 pt-5 sm:px-7 sm:pt-6">
          {alertVisible && (
            <ExecutiveAlertBanner
              onDismiss={() => setAlertVisible(false)}
              onViewAnalysis={() => setAnalysisOpen(true)}
            />
          )}
        </div>

        <div className="relative space-y-3 px-5 pb-5 sm:px-7 sm:pb-6">
          {leads
  .slice(0, showAllLeads ? leads.length : 7)
  .map((lead) => (
    <LeadRow key={lead.id} lead={lead} />
  ))}
  {leads.length > 7 && (
  <div className="mt-5 flex justify-center">
    <button
      type="button"
      onClick={() => setShowAllLeads((prev) => !prev)}
      className="rounded-xl border border-violet-500/30 bg-violet-500/10 px-5 py-2.5 text-sm font-medium text-violet-200 transition hover:bg-violet-500/20"
    >
      {showAllLeads ? "Show less" : "Show more leads"}
    </button>
  </div>
)}
        </div>

        <div className="relative border-t border-white/[0.06] px-5 py-4 sm:px-7">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-600">
            <span className="inline-flex items-center gap-2">
              <Building2 className="h-3.5 w-3.5" />
              Scores refresh from CRM, email, and meeting signals
            </span>
            <span className="inline-flex items-center gap-2 text-zinc-500">
              <TrendingUp className="h-3.5 w-3.5" />
              <Target className="h-3.5 w-3.5" />
              Last sync · 3 min ago
            </span>
          </div>
        </div>
      </div>
    </section>
    </>
  );
}
