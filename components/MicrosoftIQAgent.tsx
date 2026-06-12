"use client";

import { useEffect, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  BrainCircuit,
  Check,
  DatabaseZap,
  LoaderCircle,
  Network,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import type { IQAnswer, IQMode } from "@/lib/microsoft-iq/types";

const prompts = [
  "Which revenue risks need executive attention and what policy should we follow?",
  "Which leads should sales prioritize and why?",
  "What business signals explain the slowing pipeline?",
] as const;

type Status = {
  mode: IQMode;
  foundryConfigured: boolean;
  fabricIntegration: string;
};

export function MicrosoftIQAgent() {
  const [query, setQuery] = useState<string>(prompts[0]);
  const [status, setStatus] = useState<Status | null>(null);
  const [result, setResult] = useState<IQAnswer | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/microsoft-iq")
      .then((response) => response.json())
      .then((data) => setStatus(data))
      .catch(() => setError("Could not read Microsoft IQ integration status."));
  }, []);

  async function askAgent(nextQuery: string = query) {
    const trimmed = nextQuery.trim();
    if (!trimmed || loading) return;

    setQuery(trimmed);
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/microsoft-iq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: trimmed }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Microsoft IQ request failed.");
      setResult(data);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Microsoft IQ request failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mb-10 overflow-hidden rounded-[1.75rem] border border-sky-500/15 bg-gradient-to-br from-sky-500/[0.08] via-violet-500/[0.06] to-white/[0.02] shadow-[0_24px_80px_rgba(0,0,0,0.4)]">
      <div className="border-b border-white/[0.07] px-5 py-5 sm:px-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-500/15 text-sky-200 ring-1 ring-inset ring-sky-400/20">
              <BrainCircuit className="h-5 w-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold text-white">Microsoft IQ Reasoning Agent</h2>
                <span className="rounded-full border border-sky-400/20 bg-sky-400/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-sky-200">
                  {status?.mode === "foundry" ? "Cloud connected" : "Demo adapter"}
                </span>
              </div>
              <p className="mt-1 max-w-2xl text-sm text-zinc-400">
                Combines governed policies from Foundry IQ with business entities and metrics from Fabric IQ.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1.5 text-xs font-semibold text-violet-200">
              <BookOpen className="h-3.5 w-3.5" />
              Foundry IQ
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-200">
              <Network className="h-3.5 w-3.5" />
              Fabric IQ
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 px-5 py-6 sm:px-7 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <div className="rounded-2xl border border-white/[0.07] bg-black/20 p-4">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500" htmlFor="iq-query">
              Ask a multi-step business question
            </label>
            <textarea
              id="iq-query"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              rows={4}
              className="mt-3 w-full resize-none rounded-xl border border-white/[0.08] bg-black/25 p-3 text-sm leading-relaxed text-zinc-200 outline-none transition focus:border-sky-400/30"
            />
            <button
              type="button"
              onClick={() => askAgent()}
              disabled={loading || !query.trim()}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:opacity-50"
            >
              {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {loading ? "Reasoning across IQ sources..." : "Run IQ agent"}
            </button>
          </div>

          <div className="mt-3 grid gap-2">
            {prompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => askAgent(prompt)}
                className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-white/[0.025] px-3 py-2.5 text-left text-xs text-zinc-400 transition hover:border-white/[0.12] hover:text-zinc-200"
              >
                {prompt}
                <ArrowRight className="h-3.5 w-3.5 shrink-0" />
              </button>
            ))}
          </div>

          <div className="mt-4 rounded-xl border border-amber-500/15 bg-amber-500/[0.06] p-3 text-xs leading-relaxed text-amber-100/70">
            {status?.mode === "foundry"
              ? status.fabricIntegration
              : "Demo mode is fully local and costs nothing. It mirrors the Microsoft IQ flow without claiming a live Azure connection."}
          </div>
        </div>

        <div className="lg:col-span-7">
          {error && (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">{error}</div>
          )}

          {!result && !error && (
            <div className="flex min-h-[360px] items-center justify-center rounded-2xl border border-dashed border-white/[0.09] bg-black/15 p-8 text-center">
              <div>
                <DatabaseZap className="mx-auto h-8 w-8 text-zinc-600" />
                <p className="mt-3 font-medium text-zinc-300">Ready to reason across Microsoft IQ</p>
                <p className="mt-1 max-w-md text-sm text-zinc-600">
                  Run a prompt to see query planning, Fabric IQ semantic grounding, Foundry IQ policy retrieval, and cited recommendations.
                </p>
              </div>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-white/[0.08] bg-black/25 p-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Grounded answer</p>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-200">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Confidence {result.confidence}%
                  </span>
                </div>
                <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-zinc-200">{result.answer}</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Multi-step reasoning</p>
                  <ol className="mt-3 space-y-3">
                    {result.reasoning.map((step) => (
                      <li key={step.label} className="flex gap-3">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300">
                          <Check className="h-3 w-3" />
                        </span>
                        <div>
                          <p className="text-xs font-semibold text-zinc-300">{step.label}</p>
                          <p className="mt-1 text-xs leading-relaxed text-zinc-600">{step.detail}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Cited sources</p>
                  <div className="mt-3 space-y-2">
                    {result.citations.map((citation) => (
                      <div key={citation.id} className="rounded-xl border border-white/[0.06] bg-black/20 p-3">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-semibold text-zinc-300">{citation.title}</p>
                          <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-sky-300">
                            {citation.source}
                          </span>
                        </div>
                        <p className="mt-1 text-xs leading-relaxed text-zinc-600">{citation.detail}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
