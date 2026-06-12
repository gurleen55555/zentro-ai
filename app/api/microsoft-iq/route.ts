import { runDemoIQ, runFoundryIQ } from "@/lib/microsoft-iq/orchestrator";

export async function GET() {
  const mode = process.env.MICROSOFT_IQ_MODE === "foundry" ? "foundry" : "demo";

  return Response.json({
    mode,
    foundryConfigured: Boolean(
      process.env.FOUNDRY_IQ_SEARCH_ENDPOINT &&
        process.env.FOUNDRY_IQ_KNOWLEDGE_BASE &&
        process.env.FOUNDRY_IQ_API_KEY,
    ),
    fabricIntegration:
      mode === "foundry"
        ? "Configure the Fabric IQ ontology as a knowledge source in the selected Foundry IQ knowledge base."
        : "Local Zentro business ontology simulator",
  });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { query?: unknown };
    const query = typeof body.query === "string" ? body.query.trim() : "";

    if (!query) {
      return Response.json({ error: "A query is required." }, { status: 400 });
    }

    const answer =
      process.env.MICROSOFT_IQ_MODE === "foundry"
        ? await runFoundryIQ(query)
        : runDemoIQ(query);

    return Response.json(answer);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Microsoft IQ request failed.";
    return Response.json({ error: message }, { status: 500 });
  }
}
