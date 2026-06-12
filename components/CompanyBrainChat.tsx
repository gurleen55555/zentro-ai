"use client";

import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Brain,
  ChevronRight,
  CornerDownLeft,
  Database,
  Mail,
  MessageSquare,
  Sparkles,
  Users,
  Wrench,
} from "lucide-react";

type Source = "CRM" | "Email" | "Meetings" | "Support";

type DataRow = Record<string, unknown>;

type ChatMessage =
  | {
      id: string;
      role: "user";
      content: string;
      createdAt: number;
    }
  | {
      id: string;
      role: "assistant";
      kind: "thinking";
      content: string;
      createdAt: number;
    }
  | {
      id: string;
      role: "assistant";
      kind: "answer";
      content: string;
      sources: Source[];
      confidence: number;
      createdAt: number;
    };

function uid() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalize(text: string) {
  return text.trim().toLowerCase();
}

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

const THINKING_STATES = [
  "Analyzing company memory…",
  "Reviewing CRM signals…",
  "Evaluating risks…",
] as const;

function buildMockAnswer(prompt: string): {
  confidence: number;
  sources: Source[];
  text: string;
} {
  const p = normalize(prompt);

  const base = {
    sources: ["CRM", "Email", "Meetings", "Support"] as Source[],
  };

  if (p.includes("revenue") && (p.includes("slow") || p.includes("slowing"))) {
    return {
      ...base,
      confidence: 88,
      text: [
        "Executive Summary",
        "- Revenue is slowing primarily due to late-stage deal slippage and rising discount pressure in the mid-market segment.",
        "- Expansion revenue is underperforming because two top accounts reduced usage after recent onboarding changes.",
        "",
        "Supporting Evidence",
        "- CRM: 3 enterprise opportunities moved from Commit → Best Case in the last 10 days.",
        "- Email: Procurement threads show longer approval cycles (+9 days avg).",
        "- Meetings: Sales calls mention stronger competitor positioning on security/compliance.",
        "- Support: Ticket volume up 18% for implementation-related issues.",
        "",
        "Confidence Score",
        "- 88%",
        "",
        "Recommended Actions",
        "- Run a 48-hour deal rescue sprint for the 3 slipped opportunities (exec sponsor + security + pricing).",
        "- Revert/patch the onboarding step causing reduced activation; assign owner and deadline today.",
        "- Publish a 1-page competitive counter for security objections and enforce in pipeline reviews.",
      ].join("\n"),
    };
  }

  if (p.includes("risks") && p.includes("today")) {
    return {
      ...base,
      confidence: 91,
      text: [
        "Executive Summary",
        "- Two near-term risks require attention: delayed payments emerging in one segment and churn signals from a key account.",
        "",
        "Supporting Evidence",
        "- CRM: 5 accounts have invoices >30 days past due, 2 trending worse vs last month.",
        "- Email: Finance escalation threads increased this week.",
        "- Support: Top account’s ticket sentiment deteriorated (more urgent language + repeated issues).",
        "",
        "Confidence Score",
        "- 91%",
        "",
        "Recommended Actions",
        "- Trigger payment outreach sequence for the 5 accounts; assign finance owner and schedule calls.",
        "- Arrange a 30-minute exec check-in with the at-risk account within 24 hours.",
        "- Create a mitigation plan: bugfix ETA + comms cadence + success criteria for recovery.",
      ].join("\n"),
    };
  }

  if (p.includes("highest priority leads") || (p.includes("priority") && p.includes("leads"))) {
    return {
      ...base,
      confidence: 89,
      text: [
        "Executive Summary",
        "- The top leads show high intent (pricing exploration + product requests) and match your strongest customer profile.",
        "",
        "Supporting Evidence",
        "- CRM: 4 leads have decision-maker titles and active evaluation stages.",
        "- Email: 2 prospects replied requesting security docs and timeline confirmation.",
        "- Meetings: One prospect requested an implementation walkthrough this week.",
        "",
        "Confidence Score",
        "- 89%",
        "",
        "Recommended Actions",
        "- Route the top 3 to senior AE coverage and schedule next-step meetings within 48 hours.",
        "- Send a tailored security + ROI packet; include relevant case study by industry.",
        "- Add a mutual action plan to each deal and enforce weekly checkpoints.",
      ].join("\n"),
    };
  }

  if (p.includes("summarize") && (p.includes("week") || p.includes("weekly"))) {
    return {
      ...base,
      confidence: 86,
      text: [
        "Executive Summary",
        "- The week’s themes: pipeline volatility, onboarding friction, and strong inbound interest in Enterprise.",
        "",
        "Supporting Evidence",
        "- Meetings: 18 internal/external meetings processed; 5 focused on enterprise security requirements.",
        "- Email: Increased procurement threads; more stakeholders involved per deal.",
        "- Support: Implementation questions spiked early week; stabilized after mid-week patch.",
        "",
        "Confidence Score",
        "- 86%",
        "",
        "Recommended Actions",
        "- Promote the onboarding fix to a tracked initiative with daily status until activation recovers.",
        "- Standardize procurement responses (security deck + SOC2 links + FAQ) to reduce cycle time.",
        "- Prioritize Enterprise inbound: qualify hard, then accelerate with fast technical validation.",
      ].join("\n"),
    };
  }

  if (p.includes("churn") || p.includes("likely to churn")) {
    return {
      ...base,
      confidence: 87,
      text: [
        "Executive Summary",
        "- Churn risk is concentrated in accounts with declining usage and unresolved support friction.",
        "",
        "Supporting Evidence",
        "- CRM: 3 accounts entered renewal window with low engagement signals.",
        "- Support: Repeat issues on integrations; sentiment trending negative in the last 7 days.",
        "- Meetings: One customer asked for downgrade options and pricing flexibility.",
        "",
        "Confidence Score",
        "- 87%",
        "",
        "Recommended Actions",
        "- Launch a 10-day retention plan: exec outreach + success plan + weekly outcome review.",
        "- Assign a dedicated support captain per at-risk account and publish a clear fix timeline.",
        "- Offer a value-based renewal proposal tied to measurable outcomes, not discounting alone.",
      ].join("\n"),
    };
  }

  return {
    ...base,
    confidence: 84,
    text: [
      "Executive Summary",
      "- I can answer that using your connected sources and Company Brain context.",
      "",
      "Supporting Evidence",
      "- CRM + Email + Meetings + Support signals are available for synthesis.",
      "",
      "Confidence Score",
      "- 84%",
      "",
      "Recommended Actions",
      "- Ask a more specific question (e.g., timeframe, segment, or account) for a sharper answer.",
    ].join("\n"),
  };
}

function buildLiveAnswer(
  prompt: string,
  stats: {
    leads: number;
    hotLeads: number;
    customers: number;
    riskImpact: number;
  },
): {
  confidence: number;
  sources: Source[];
  text: string;
} {
  const p = normalize(prompt);

  if (p.includes("how many leads") || p.includes("total leads")) {
    return {
      confidence: 94,
      sources: ["CRM"],
      text: [
        "Executive Summary",
        `- Zentro currently has ${stats.leads} leads in the CRM.`,
        `- ${stats.hotLeads} of them are high-intent hot leads.`,
        "",
        "Recommended Actions",
        "- Prioritize hot leads first and route them for follow-up within 48 hours.",
      ].join("\n"),
    };
  }

  if (p.includes("hot leads") || p.includes("highest priority leads")) {
    return {
      confidence: 92,
      sources: ["CRM", "Email"],
      text: [
        "Executive Summary",
        `- There are ${stats.hotLeads} hot leads showing strong buying intent.`,
        "",
        "Recommended Actions",
        "- Focus outreach on high-score leads and attach tailored ROI or security material.",
      ].join("\n"),
    };
  }

  if (p.includes("customers")) {
    return {
      confidence: 91,
      sources: ["CRM"],
      text: [
        "Executive Summary",
        `- Zentro is currently tracking ${stats.customers} active customers.`,
        "",
        "Recommended Actions",
        "- Review customer health and prioritize accounts showing churn or contraction signals.",
      ].join("\n"),
    };
  }

  if (p.includes("risk") || p.includes("revenue exposure") || p.includes("revenue risk")) {
    return {
      confidence: 93,
      sources: ["CRM", "Support"],
      text: [
        "Executive Summary",
        `- Current revenue exposure is $${stats.riskImpact.toLocaleString()}.`,
        "",
        "Recommended Actions",
        "- Prioritize high-severity accounts and schedule executive outreach within 48 hours.",
      ].join("\n"),
    };
  }

  return buildMockAnswer(prompt);
}

function SourceBadge({ source }: { source: Source }) {
  const meta = useMemo(() => {
    switch (source) {
      case "CRM":
        return { Icon: Database, className: "border-cyan-500/25 bg-cyan-500/10 text-cyan-200" };
      case "Email":
        return { Icon: Mail, className: "border-violet-500/25 bg-violet-500/10 text-violet-200" };
      case "Meetings":
        return { Icon: Users, className: "border-emerald-500/25 bg-emerald-500/10 text-emerald-200" };
      case "Support":
        return { Icon: Wrench, className: "border-amber-500/25 bg-amber-500/10 text-amber-200" };
      default:
        return { Icon: Sparkles, className: "border-white/10 bg-white/5 text-zinc-300" };
    }
  }, [source]);

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${meta.className}`}>
      <meta.Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
      {source}
    </span>
  );
}

export function CompanyBrainChat({
  suggestedPrompts,
}: {
  suggestedPrompts: readonly string[];
}) {
  const [input, setInput] = useState("");
  const [stats, setStats] = useState({
  leads: 0,
  hotLeads: 0,
  customers: 0,
  riskImpact: 0,
});
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: uid(),
      role: "assistant",
      kind: "answer",
      content: [
        "Executive Summary",
        "- Company Brain is live. Ask about revenue, risks, leads, churn, or weekly activity.",
        "",
        "Supporting Evidence",
        "- Sources connected: CRM, Email, Meetings, Support.",
        "",
        "Confidence Score",
        "- 92%",
        "",
        "Recommended Actions",
        "- Try one of the suggested prompts to see structured responses.",
      ].join("\n"),
      sources: ["CRM", "Email", "Meetings", "Support"],
      confidence: 92,
      createdAt: Date.now(),
    },
  ]);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const streamIntervalRef = useRef<number | null>(null);
  const stageIntervalRef = useRef<number | null>(null);
  const stageTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  useEffect(() => {
    return () => {
      if (streamIntervalRef.current) window.clearInterval(streamIntervalRef.current);
      if (stageIntervalRef.current) window.clearInterval(stageIntervalRef.current);
      if (stageTimeoutRef.current) window.clearTimeout(stageTimeoutRef.current);
    };
  }, []);
  useEffect(() => {
  if (!isSupabaseConfigured) return;

  async function fetchStats() {
    const { data: leads } = await supabase.from("leads").select("*");
    const { data: customers } = await supabase.from("customers").select("*");
    const { data: risks } = await supabase.from("revenue_risks").select("*");

    const leadRows = (leads || []) as DataRow[];
    const riskRows = (risks || []) as DataRow[];

    setStats({
      leads: leadRows.length,
      hotLeads: leadRows.filter((lead) => {
        const status = textValue(lead, ["status", "priority", "lead_status"]).toLowerCase();
        const score = numberValue(lead, ["score", "lead_score", "intent_score"]);
        return status.includes("hot") || status.includes("urgent") || score >= 80;
      }).length,
      customers: customers?.length || 0,
      riskImpact: riskRows.reduce(
        (sum, risk) =>
          sum +
          numberValue(risk, ["impact_mrr", "impactMrr", "revenue_at_risk", "impact", "amount"]),
        0,
      ),
    });
  }

  fetchStats();
}, []);

  function pushUserMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;

    setMessages((prev) => [
      ...prev,
      { id: uid(), role: "user", content: trimmed, createdAt: Date.now() },
    ]);
  }

  function startThinkingThenAnswer(prompt: string) {
    const thinkingId = uid();
    setMessages((prev) => [
      ...prev,
      {
        id: thinkingId,
        role: "assistant",
        kind: "thinking",
        content: THINKING_STATES[0],
        createdAt: Date.now(),
      },
    ]);

    let stage = 0;
    stageIntervalRef.current = window.setInterval(() => {
      stage = (stage + 1) % THINKING_STATES.length;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === thinkingId && m.role === "assistant" && m.kind === "thinking"
            ? { ...m, content: THINKING_STATES[stage] }
            : m,
        ),
      );
    }, 900);

    const answer = buildLiveAnswer(prompt, stats);
    stageTimeoutRef.current = window.setTimeout(() => {
      if (stageIntervalRef.current) window.clearInterval(stageIntervalRef.current);

      const answerId = uid();
      setMessages((prev) =>
        prev.map((m) =>
          m.id === thinkingId
            ? {
                id: answerId,
                role: "assistant",
                kind: "answer",
                content: "",
                sources: answer.sources,
                confidence: answer.confidence,
                createdAt: Date.now(),
              }
            : m,
        ),
      );

      let i = 0;
      streamIntervalRef.current = window.setInterval(() => {
        i += 2;
        const slice = answer.text.slice(0, i);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === answerId && m.role === "assistant" && m.kind === "answer"
              ? { ...m, content: slice }
              : m,
          ),
        );

        if (i >= answer.text.length) {
          if (streamIntervalRef.current) window.clearInterval(streamIntervalRef.current);
        }
      }, 18);
    }, 2200);
  }

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    pushUserMessage(trimmed);
    startThinkingThenAnswer(trimmed);
  }

  return (
    <section className="mb-10">
      <div className="relative overflow-hidden rounded-[1.75rem] border border-white/[0.06] bg-gradient-to-b from-white/[0.05] to-white/[0.015] shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.12),transparent_55%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(6,182,212,0.10),transparent_60%)]" />

        <div className="relative border-b border-white/[0.06] px-5 py-4 sm:px-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-200 ring-1 ring-inset ring-violet-500/20">
                <Brain className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Company Brain Chat</h2>
                <p className="text-sm text-zinc-500">
                  Structured answers with evidence, confidence, and actions.
                </p>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-200">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>
              Reasoning Live
            </div>
          </div>
        </div>

        <div className="grid gap-6 px-5 py-5 sm:px-7 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <div
              ref={scrollRef}
              className="h-[420px] overflow-auto rounded-2xl border border-white/[0.06] bg-[#0A0A0A]/40 p-4 shadow-inner backdrop-blur-xl sm:h-[520px]"
            >
              <div className="space-y-3">
                {messages.map((m) => {
                  if (m.role === "user") {
                    return (
                      <div key={m.id} className="flex justify-end">
                        <div className="max-w-[92%] rounded-2xl border border-violet-500/20 bg-violet-500/10 px-4 py-3 text-sm text-zinc-100 shadow-[0_10px_30px_rgba(139,92,246,0.08)]">
                          {m.content}
                        </div>
                      </div>
                    );
                  }

                  if (m.kind === "thinking") {
                    return (
                      <div key={m.id} className="flex items-start gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.04] text-zinc-300">
                          <Sparkles className="h-4 w-4" strokeWidth={1.75} />
                        </div>
                        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-zinc-300">
                          <span className="inline-flex items-center gap-2">
                            <span className="relative flex h-2 w-2">
                              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-50" />
                              <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400/80" />
                            </span>
                            {m.content}
                          </span>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={m.id} className="flex items-start gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.04] text-zinc-300">
                        <Brain className="h-4 w-4" strokeWidth={1.75} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
                          <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-relaxed text-zinc-200">
                            {m.content}
                          </pre>
                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            {m.sources.map((s) => (
                              <SourceBadge key={s} source={s} />
                            ))}
                            <span className="ml-auto rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-200">
                              Confidence {m.confidence}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-3 backdrop-blur-xl">
              <div className="flex items-end gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.04] text-zinc-400">
                  <MessageSquare className="h-4 w-4" strokeWidth={1.75} />
                </div>
                <div className="flex-1">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    rows={2}
                    placeholder="Ask Zentro anything about your business…"
                    className="w-full resize-none bg-transparent text-sm text-zinc-200 placeholder:text-zinc-600 outline-none"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        send(input);
                        setInput("");
                      }
                    }}
                  />
                  <p className="mt-1 text-[11px] text-zinc-600">
                    Press <span className="text-zinc-500">Enter</span> to send ·{" "}
                    <span className="text-zinc-500">Shift+Enter</span> for newline
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    send(input);
                    setInput("");
                  }}
                  className="inline-flex h-10 items-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:opacity-40"
                  disabled={!input.trim()}
                >
                  Send
                  <CornerDownLeft className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <aside className="lg:col-span-4">
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4 backdrop-blur-xl">
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                Suggested prompts
              </p>
              <div className="mt-3 grid gap-2">
                {suggestedPrompts.map((p) => (
                  <button
                    key={p}
                    type="button"
                    className="group flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-left text-sm text-zinc-300 transition hover:border-white/[0.12] hover:bg-white/[0.05]"
                    onClick={() => {
                      send(p);
                    }}
                  >
                    <span className="truncate">{p}</span>
                    <ChevronRight className="h-4 w-4 text-zinc-600 transition group-hover:text-zinc-400" />
                  </button>
                ))}
              </div>

              <div className="mt-4 rounded-xl border border-white/[0.06] bg-[#0A0A0A]/40 p-3">
                <p className="text-xs font-medium text-zinc-500">
                  This is your operating system
                </p>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                  Answers are composed from your Company Brain: structured,
                  source-aware, and designed for executive decisions.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
