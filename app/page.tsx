"use client";
import {
  Activity,
  ArrowUpRight,
  Bell,
  Brain,
  ChevronDown,
  Circle,
  FileBarChart,
  Mail,
  Radar,
  Search,
  ShieldAlert,
  Sparkles,
  Target,
  Upload,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { CompanyKnowledgeGraph } from "@/components/CompanyKnowledgeGraph";
import { CompanyBrainChat } from "@/components/CompanyBrainChat";
import { LeadIntelligenceAgent } from "@/components/LeadIntelligenceAgent";
import { ExecutiveInsightsAgent } from "@/components/ExecutiveInsightsAgent";
import { MeetingIntelligenceAgent } from "@/components/MeetingIntelligenceAgent";
import { MicrosoftIQAgent } from "@/components/MicrosoftIQAgent";
const metrics = [
  {
    label: "Company Health Score",
    value: "92%",
    hint: "Trajectory improving",
    icon: Activity,
    gradient: "from-emerald-400/20 via-emerald-500/10 to-transparent",
    iconBg: "bg-emerald-500/15 text-emerald-300",
  },
  {
    label: "Active Risks",
    value: "5",
    hint: "Monitoring in real time",
    icon: ShieldAlert,
    gradient: "from-amber-400/20 via-amber-500/10 to-transparent",
    iconBg: "bg-amber-500/15 text-amber-300",
  },
  {
    label: "High-Priority Leads",
    value: "12",
    hint: "Intent signals detected",
    icon: Target,
    gradient: "from-violet-400/20 via-violet-500/10 to-transparent",
    iconBg: "bg-violet-500/15 text-violet-300",
  },
  {
    label: "Pending Actions",
    value: "8",
    hint: "3 due today",
    icon: Zap,
    gradient: "from-sky-400/20 via-sky-500/10 to-transparent",
    iconBg: "bg-sky-500/15 text-sky-300",
  },
] as const;

const suggestedPrompts = [
  "Why is revenue slowing down?",
  "Show highest priority leads",
  "What risks need attention today?",
  "Summarize this week's company activity",
] as const;

const heroCounterSeeds = [
  { label: "Emails Analyzed", value: 42, accent: "bg-emerald-400" },
  { label: "Meetings Processed", value: 18, accent: "bg-violet-400" },
  {
    label: "Customer Interactions Reviewed",
    value: 76,
    accent: "bg-sky-400",
  },
  { label: "Leads Scored", value: 23, accent: "bg-amber-400" },
] as const;

const heroAgentFeed = [
  {
    agent: "Risk Agent",
    action: "Monitoring payment patterns",
    icon: ShieldAlert,
  },
  {
    agent: "Lead Agent",
    action: "Scoring 3 high-intent prospects",
    icon: Target,
  },
  {
    agent: "Executive Agent",
    action: "Drafting weekly summary",
    icon: FileBarChart,
  },
  {
    agent: "Email Agent",
    action: "Preparing follow-up draft",
    icon: Mail,
  },
] as const;

const agents = [
  {
    name: "Company Brain Agent",
    status: "Active",
    purpose: "Stores organizational knowledge",
    icon: Brain,
    dot: "bg-emerald-400",
    glow: "shadow-emerald-500/20",
    gradient: "from-emerald-500/15 via-emerald-500/[0.06] to-transparent",
  },
  {
    name: "Risk Detection Agent",
    status: "Monitoring",
    purpose: "Detects business risks",
    icon: ShieldAlert,
    dot: "bg-amber-400",
    glow: "shadow-amber-500/20",
    gradient: "from-amber-500/15 via-amber-500/[0.06] to-transparent",
  },
  {
    name: "Lead Intelligence Agent",
    status: "Running",
    purpose: "Finds and prioritizes customers",
    icon: Radar,
    dot: "bg-violet-400",
    glow: "shadow-violet-500/20",
    gradient: "from-violet-500/15 via-violet-500/[0.06] to-transparent",
  },
  {
    name: "Email Automation Agent",
    status: "Ready",
    purpose: "Drafts and sends responses",
    icon: Mail,
    dot: "bg-sky-400",
    glow: "shadow-sky-500/20",
    gradient: "from-sky-500/15 via-sky-500/[0.06] to-transparent",
  },
  {
    name: "Executive Insights Agent",
    status: "Active",
    purpose: "Creates summaries and recommendations",
    icon: Sparkles,
    dot: "bg-fuchsia-400",
    glow: "shadow-fuchsia-500/20",
    gradient: "from-fuchsia-500/15 via-fuchsia-500/[0.06] to-transparent",
  },
] as const;

const activityFeed = [
  {
    time: "09:21 PM",
    text: "Risk Agent detected delayed payment pattern",
    icon: ShieldAlert,
    accent: "text-amber-300",
  },
  {
    time: "09:25 PM",
    text: "Lead Agent found 3 high-intent prospects",
    icon: Target,
    accent: "text-violet-300",
  },
  {
    time: "09:28 PM",
    text: "Executive Agent generated weekly report",
    icon: FileBarChart,
    accent: "text-fuchsia-300",
  },
  {
    time: "09:31 PM",
    text: "Email Agent drafted customer follow-up",
    icon: Mail,
    accent: "text-sky-300",
  },
] as const;

const quickActions = [
  { label: "Upload Company Data", icon: Upload, featured: false },
  { label: "Generate Executive Report", icon: FileBarChart, featured: true },
  { label: "Analyze Business Risks", icon: ShieldAlert, featured: false },
  { label: "Find New Leads", icon: Target, featured: false },
  { label: "Draft Customer Emails", icon: Mail, featured: false },
] as const;

function GlassCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-white/[0.06] bg-white/[0.025] shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-2xl ${className}`}
    >
      {children}
    </div>
  );
}

export default function Home() {
  

  
  
  const [liveCounters, setLiveCounters] = useState<number[]>(() =>
    heroCounterSeeds.map((item) => item.value),
  );
  const [aiConfidence, setAiConfidence] = useState(91);
  const [agentFeedIndex, setAgentFeedIndex] = useState(0);

  useEffect(() => {
    const counterTimer = window.setInterval(() => {
      setLiveCounters((prev) =>
        prev.map((num, idx) => {
          const direction = idx % 2 === 0 ? 1 : -1;
          const drift = Math.random() > 0.55 ? direction : 0;
          return Math.max(heroCounterSeeds[idx].value - 3, num + drift);
        }),
      );
    }, 2200);

    const confidenceTimer = window.setInterval(() => {
      setAiConfidence((c) => {
        const next = c + (Math.random() > 0.5 ? 1 : -1);
        return Math.min(94, Math.max(88, next));
      });
    }, 3000);

    const agentTimer = window.setInterval(() => {
      setAgentFeedIndex((i) => (i + 1) % heroAgentFeed.length);
    }, 2800);

    return () => {
      window.clearInterval(counterTimer);
      window.clearInterval(confidenceTimer);
      window.clearInterval(agentTimer);
    };
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0A0A0A] font-sans text-zinc-100">
      {/* Ambient mesh */}
      <div className="pointer-events-none fixed inset-0" aria-hidden>
        <div className="absolute left-1/2 top-0 h-[640px] w-[980px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.16),transparent_70%)]" />
        <div className="absolute -right-40 top-1/4 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,rgba(56,189,248,0.10),transparent_70%)]" />
        <div className="absolute -left-28 bottom-0 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.08),transparent_70%)]" />
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage:
              "radial-gradient(ellipse 80% 60% at 50% 0%, black, transparent)",
          }}
        />
      </div>

      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#0A0A0A]/70 backdrop-blur-2xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex shrink-0 items-center gap-2.5">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 via-indigo-500 to-violet-600 shadow-lg shadow-violet-500/30">
              <span className="text-sm font-bold tracking-tight text-white">
                Z
              </span>
              <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/20" />
            </div>
            <span className="hidden text-lg font-semibold tracking-tight text-white sm:block">
              Zentro
            </span>
          </div>

          <div className="flex flex-1 justify-center px-2 sm:px-8">
            <div className="relative w-full max-w-md">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <input
                type="search"
                placeholder="Search memory, agents, tasks…"
                className="h-10 w-full rounded-xl border border-white/[0.08] bg-white/[0.04] pl-10 pr-4 text-sm text-zinc-200 placeholder:text-zinc-600 outline-none transition-all focus:border-violet-500/40 focus:bg-white/[0.06] focus:ring-2 focus:ring-violet-500/20"
              />
              <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500 sm:inline">
                ⌘K
              </kbd>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-zinc-400 transition hover:border-white/[0.12] hover:bg-white/[0.08] hover:text-zinc-200"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" strokeWidth={1.75} />
              <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-violet-500 ring-2 ring-[#0A0A0A]" />
            </button>

            <button
              type="button"
              className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] py-1.5 pl-1.5 pr-2.5 transition hover:border-white/[0.12] hover:bg-white/[0.08]"
              aria-label="User profile"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-zinc-500 to-zinc-700 text-xs font-semibold text-white">
                G
              </div>
              <span className="hidden text-sm font-medium text-zinc-300 sm:block">
                Gurleen
              </span>
              <ChevronDown className="hidden h-3.5 w-3.5 text-zinc-500 sm:block" />
            </button>
          </div>
        </div>
      </nav>

      <main className="relative mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 sm:pt-10 lg:px-8">
      
        {/* HERO — AI Operating System */}
        <header className="relative mb-12 overflow-hidden rounded-[1.75rem] border border-white/[0.05] bg-gradient-to-b from-white/[0.04] to-white/[0.01] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:p-8 lg:p-10">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:48px_48px] opacity-50" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(148,163,184,0.08),transparent_55%)]" />
          </div>

          <div className="relative grid items-start gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="space-y-8 lg:col-span-6">
              <div>
                <p className="text-sm font-medium tracking-wide text-zinc-500">
                  Good Evening,{" "}
                  <span className="text-zinc-300">Gurleen</span>
                </p>
                <h1 className="mt-3 text-[2rem] font-semibold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-[3.25rem]">
                  One Brain For Your Entire Business
                </h1>
                <p className="mt-5 max-w-xl text-base leading-relaxed text-zinc-500 sm:text-lg">
                  Every email, meeting, lead, and support ticket flows into one
                  intelligence layer — so your company decides faster with full
                  context.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <GlassCard className="p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                      AI Confidence
                    </p>
                    <span className="text-sm font-semibold tabular-nums text-zinc-200 transition-all duration-700">
                      {aiConfidence}%
                    </span>
                  </div>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-zinc-500 via-zinc-300 to-zinc-100 transition-all duration-700 ease-out"
                      style={{ width: `${aiConfidence}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-zinc-600">
                    Model certainty across active signals
                  </p>
                </GlassCard>

                <GlassCard className="flex items-center gap-3 p-4">
                  <span className="relative flex h-2.5 w-2.5 shrink-0">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500/50" />
                    <span className="relative h-2.5 w-2.5 rounded-full bg-emerald-500/90" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-zinc-200">
                      Reasoning Live
                    </p>
                    <p className="text-xs text-zinc-600">
                      Agents orchestrating now
                    </p>
                  </div>
                </GlassCard>
              </div>

              <div className="grid gap-2.5 sm:grid-cols-2">
                {heroCounterSeeds.map((item, idx) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-2.5 rounded-xl border border-white/[0.05] bg-white/[0.02] px-3.5 py-2.5 backdrop-blur-xl"
                  >
                    <span
                      className={`h-1.5 w-1.5 shrink-0 rounded-full ${item.accent}`}
                    />
                    <span className="text-sm text-zinc-400">
                      <span className="font-semibold tabular-nums text-zinc-200 transition-all duration-500">
                        {liveCounters[idx]}
                      </span>{" "}
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>

              <GlassCard className="p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Live agent activity
                </p>
                <ul className="mt-3 space-y-2">
                  {heroAgentFeed.map((item, idx) => {
                    const Icon = item.icon;
                    const active = idx === agentFeedIndex;
                    return (
                      <li
                        key={item.agent}
                        className={`flex items-center gap-3 rounded-lg px-2 py-2 transition-all duration-500 ${
                          active
                            ? "bg-white/[0.05] text-zinc-200"
                            : "text-zinc-600"
                        }`}
                      >
                        <Icon
                          className={`h-3.5 w-3.5 shrink-0 ${active ? "text-zinc-400" : "text-zinc-700"}`}
                          strokeWidth={1.75}
                        />
                        <span className="min-w-0 flex-1 truncate text-sm">
                          <span className="font-medium">{item.agent}</span>
                          <span className="text-zinc-500">
                            {" "}
                            · {item.action}
                          </span>
                        </span>
                        {active && (
                          <span className="shrink-0 text-[10px] font-medium uppercase tracking-wide text-emerald-500/90">
                            Live
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </GlassCard>
            </div>

            <div className="lg:col-span-6">
              <div className="mb-3 flex items-center justify-between px-1">
                <p className="text-xs font-medium uppercase tracking-[0.15em] text-zinc-500">
                  Company Knowledge Graph
                </p>
                <p className="text-xs text-zinc-600">Ingest → Reason → Act</p>
              </div>
              <CompanyKnowledgeGraph />
            </div>
          </div>
        </header>
        <MicrosoftIQAgent />
        <ExecutiveInsightsAgent />
        <CompanyBrainChat suggestedPrompts={suggestedPrompts} />

        <LeadIntelligenceAgent />
        <MeetingIntelligenceAgent />

        {/* Analytics (still present, not the focus) */}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <div
                key={metric.label}
                className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 shadow-lg shadow-black/20 backdrop-blur-xl transition-all duration-300 hover:border-white/[0.14] hover:bg-white/[0.05]"
              >
                <div
                  className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${metric.gradient} opacity-80`}
                />
                <div className="relative">
                  <div className="flex items-start justify-between">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${metric.iconBg}`}
                    >
                      <Icon className="h-5 w-5" strokeWidth={1.75} />
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-zinc-600 opacity-0 transition group-hover:opacity-100" />
                  </div>
                  <p className="mt-4 text-sm font-medium text-zinc-500">
                    {metric.label}
                  </p>
                  <p className="mt-1 text-3xl font-semibold tracking-tight text-white">
                    {metric.value}
                  </p>
                  <p className="mt-2 text-xs text-zinc-500">{metric.hint}</p>
                </div>
              </div>
            );
          })}
        </section>

        <div className="mt-8 grid gap-6 lg:grid-cols-12">
          {/* MULTI-AGENT SYSTEM */}
          <section className="lg:col-span-7">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500/20 to-indigo-500/20 text-violet-300">
                  <Sparkles className="h-4 w-4" strokeWidth={1.75} />
                </div>
                <h2 className="text-base font-semibold text-white">
                  Multi-Agent System
                </h2>
              </div>
              <span className="text-xs text-zinc-600">
                Orchestrated in real time
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {agents.map((agent) => {
                const Icon = agent.icon;
                return (
                  <div
                    key={agent.name}
                    className={`group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 shadow-lg shadow-black/20 backdrop-blur-xl transition hover:border-white/[0.14] hover:bg-white/[0.05] hover:shadow-2xl ${agent.glow}`}
                  >
                    <div
                      className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${agent.gradient}`}
                    />
                    <div className="relative flex items-start gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/[0.10] bg-white/[0.04] text-zinc-200">
                        <Icon className="h-5 w-5" strokeWidth={1.75} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate font-semibold text-white">
                            {agent.name}
                          </p>
                          <span className="ml-auto inline-flex items-center gap-2 rounded-full border border-white/[0.10] bg-white/[0.03] px-2.5 py-1 text-[11px] font-semibold text-zinc-300">
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${agent.dot}`}
                            />
                            {agent.status}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-zinc-500">
                          {agent.purpose}
                        </p>
                        <div className="mt-4 flex items-center gap-2 text-xs text-zinc-600">
                          <span className="inline-flex items-center gap-1">
                            <Circle className="h-3 w-3" />
                            heartbeat
                          </span>
                          <span>·</span>
                          <span className="inline-flex items-center gap-1">
                            <Sparkles className="h-3 w-3" />
                            reasoning
                          </span>
                          <span>·</span>
                          <span className="inline-flex items-center gap-1">
                            <Activity className="h-3 w-3" />
                            actions
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* LIVE COMPANY MEMORY */}
          <section className="lg:col-span-5">
            <h2 className="mb-4 text-base font-semibold text-white">
              Company Brain
            </h2>

            <div className="space-y-3">
              <GlassCard className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 to-sky-500/10 text-emerald-300">
                      <Brain className="h-5 w-5" strokeWidth={1.75} />
                    </div>
                    <div>
                      <p className="font-semibold text-white">
                        Live Company Memory
                      </p>
                      <p className="text-sm text-zinc-500">
                        Always-on organizational context
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Synced
                  </span>
                </div>

                <div className="mt-5 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Connected Sources
                  </p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {[
                      { label: "Email", ok: true },
                      { label: "CRM", ok: true },
                      { label: "Meetings", ok: true },
                      { label: "Support Tickets", ok: true },
                    ].map((s) => (
                      <div
                        key={s.label}
                        className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-zinc-300"
                      >
                        <span>✓ {s.label}</span>
                        <span className="text-xs text-zinc-600">Connected</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                      Knowledge Stored
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-white">
                      12,481
                    </p>
                    <p className="mt-1 text-xs text-zinc-600">
                      Memories indexed
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                      Recent Memory Added
                    </p>
                    <p className="mt-2 text-sm text-zinc-300">
                      “Customer requested enterprise pricing during sales call.”
                    </p>
                  </div>
                </div>
              </GlassCard>

              {/* AI REASONING PANEL */}
              <GlassCard className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/10 text-violet-300">
                      <Sparkles className="h-5 w-5" strokeWidth={1.75} />
                    </div>
                    <div>
                      <p className="font-semibold text-white">
                        Why was this lead prioritized?
                      </p>
                      <p className="text-sm text-zinc-500">
                        Zentro shows reasoning steps
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full border border-violet-500/20 bg-violet-500/10 px-2.5 py-1 text-[11px] font-semibold text-violet-300">
                    Confidence 89%
                  </span>
                </div>

                <div className="mt-4 rounded-2xl border border-white/[0.08] bg-[#0A0A0A]/30 p-4 backdrop-blur-xl">
                  <div className="space-y-3">
                    {[
                      "Visited pricing page 4 times",
                      "Opened 7 marketing emails",
                      "Requested product information",
                      "Similar profile to existing customers",
                    ].map((step, idx) => (
                      <div key={step} className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-lg border border-white/[0.10] bg-white/[0.04] text-xs font-semibold text-zinc-300">
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-zinc-300">{step}</p>
                          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-violet-400/70 via-sky-400/60 to-emerald-400/60"
                              style={{
                                width: `${Math.max(55, 88 - idx * 9)}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </GlassCard>
            </div>
          </section>
        </div>

        {/* LIVE ACTIVITY FEED + QUICK ACTIONS */}
        <div className="mt-8 grid gap-6 lg:grid-cols-12">
          <section className="lg:col-span-7">
            <h2 className="mb-4 text-base font-semibold text-white">
              Live Activity Feed
            </h2>
            <GlassCard className="overflow-hidden">
              <ul className="divide-y divide-white/[0.06]">
                {activityFeed.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <li
                      key={`${item.time}-${idx}`}
                      className="group flex items-start gap-4 px-5 py-4 transition hover:bg-white/[0.03]"
                    >
                      <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.04] text-zinc-500">
                        <Icon className={`h-4 w-4 ${item.accent}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-medium text-zinc-200">
                            {item.text}
                          </p>
                          <span className="ml-auto text-xs text-zinc-600">
                            {item.time}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-zinc-600">
                          Orchestrator routed this event to relevant agents and
                          updated Company Brain.
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </GlassCard>
          </section>

          <section className="lg:col-span-5">
            <h2 className="mb-4 text-base font-semibold text-white">
              Quick Actions
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.label}
                    type="button"
                    className={`group flex items-center justify-between gap-4 rounded-2xl border p-4 text-left transition ${
                      action.featured
                        ? "border-violet-500/30 bg-gradient-to-br from-violet-600/20 via-violet-500/10 to-transparent shadow-lg shadow-violet-500/10 hover:border-violet-500/45 hover:shadow-violet-500/20"
                        : "border-white/[0.08] bg-white/[0.03] backdrop-blur-xl hover:border-white/[0.14] hover:bg-white/[0.06]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${
                          action.featured
                            ? "border-violet-400/30 bg-violet-500/20 text-violet-200"
                            : "border-white/[0.08] bg-white/[0.05] text-zinc-300"
                        }`}
                      >
                        <Icon className="h-5 w-5" strokeWidth={1.75} />
                      </div>
                      <div>
                        <p className="font-semibold text-white">
                          {action.label}
                        </p>
                        <p className="text-sm text-zinc-500">
                          Trigger an agent workflow
                        </p>
                      </div>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-zinc-600 transition group-hover:text-zinc-400" />
                  </button>
                );
              })}
            </div>

            <div className="mt-4 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 backdrop-blur-xl">
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <Circle className="h-3 w-3" />
                <span>System message</span>
              </div>
              <p className="mt-2 text-sm text-zinc-300">
                Zentro is not a dashboard — it’s your operating system. It
                learns from every interaction, updates memory, and routes work
                to agents with measurable outcomes.
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
