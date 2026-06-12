import { businessFacts } from "./demo-data";
import type { IQAnswer, IQCitation } from "./types";

function keywordsFrom(query: string) {
  return query
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 3);
}

export function runDemoIQ(query: string): IQAnswer {
  const keywords = keywordsFrom(query);
  const ranked = businessFacts
    .map((fact) => ({
      fact,
      score: fact.keywords.filter((keyword) => keywords.includes(keyword)).length,
    }))
    .sort((a, b) => b.score - a.score);

  const selected = ranked.filter((item) => item.score > 0).slice(0, 3);
  const evidence = selected.length > 0 ? selected : ranked.slice(0, 3);
  const citations: IQCitation[] = evidence.map(({ fact }) => ({
    id: fact.id,
    title: fact.title,
    source: fact.source,
    detail: fact.detail,
  }));

  const fabricEvidence = citations.filter((citation) => citation.source === "Fabric IQ");
  const foundryEvidence = citations.filter((citation) => citation.source === "Foundry IQ");
  const primaryAction = foundryEvidence[0]?.detail ?? businessFacts[0].detail;

  return {
    mode: "demo",
    confidence: Math.min(94, 78 + evidence.reduce((sum, item) => sum + item.score * 3, 0)),
    answer: [
      "Zentro combined governed business knowledge with the live business model.",
      fabricEvidence.length
        ? `Business state: ${fabricEvidence.map((item) => item.detail).join(" ")}`
        : "Business state: the semantic model did not contain a direct match.",
      `Recommended action: ${primaryAction}`,
    ].join("\n\n"),
    reasoning: [
      {
        label: "Plan the question",
        detail: `Split the request into business-state and policy/action lookups using: ${keywords.slice(0, 6).join(", ") || "general business context"}.`,
        status: "complete",
      },
      {
        label: "Query Fabric IQ",
        detail: `Matched ${fabricEvidence.length} semantic business source${fabricEvidence.length === 1 ? "" : "s"} across entities, relationships, and metrics.`,
        status: "complete",
      },
      {
        label: "Query Foundry IQ",
        detail: `Matched ${foundryEvidence.length} governed knowledge source${foundryEvidence.length === 1 ? "" : "s"} for policies and playbooks.`,
        status: "complete",
      },
      {
        label: "Synthesize grounded action",
        detail: "Combined the business state with the relevant operating rule and retained source citations.",
        status: "complete",
      },
    ],
    citations,
  };
}

type FoundryResponse = {
  response?: Array<{ content?: Array<{ text?: string }> }>;
  activity?: Array<Record<string, unknown>>;
  references?: Array<Record<string, unknown>>;
};

function referenceTitle(reference: Record<string, unknown>, index: number) {
  return String(
    reference.title ??
      reference.docKey ??
      reference.doc_key ??
      reference.id ??
      `Knowledge reference ${index + 1}`,
  );
}

export async function runFoundryIQ(query: string): Promise<IQAnswer> {
  const endpoint = process.env.FOUNDRY_IQ_SEARCH_ENDPOINT?.replace(/\/$/, "");
  const knowledgeBase = process.env.FOUNDRY_IQ_KNOWLEDGE_BASE;
  const apiKey = process.env.FOUNDRY_IQ_API_KEY;
  const apiVersion = process.env.FOUNDRY_IQ_API_VERSION ?? "2025-11-01-preview";

  if (!endpoint || !knowledgeBase || !apiKey) {
    throw new Error("Foundry IQ is selected but its server-side environment variables are incomplete.");
  }

  const response = await fetch(
    `${endpoint}/knowledgebases/${encodeURIComponent(knowledgeBase)}/retrieve?api-version=${encodeURIComponent(apiVersion)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        messages: [
          {
            role: "user",
            content: [{ type: "text", text: query }],
          },
        ],
        includeActivity: true,
        retrievalReasoningEffort: { kind: "low" },
      }),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(`Foundry IQ returned ${response.status}: ${await response.text()}`);
  }

  const data = (await response.json()) as FoundryResponse;
  const answer = data.response
    ?.flatMap((message) => message.content ?? [])
    .map((content) => content.text)
    .filter(Boolean)
    .join("\n\n");

  return {
    mode: "foundry",
    answer: answer || "Foundry IQ completed retrieval but returned no synthesized answer.",
    confidence: 92,
    reasoning: (data.activity ?? []).slice(0, 5).map((activity, index) => ({
      label: `Foundry IQ activity ${index + 1}`,
      detail: JSON.stringify(activity),
      status: "complete" as const,
    })),
    citations: (data.references ?? []).map((reference, index) => ({
      id: String(reference.id ?? reference.docKey ?? reference.doc_key ?? index),
      title: referenceTitle(reference, index),
      source: "Foundry IQ" as const,
      detail: "Returned by the configured Foundry IQ knowledge base.",
    })),
  };
}
