export const businessFacts = [
  {
    id: "policy-revenue-risk",
    title: "Revenue Risk Response Policy",
    source: "Foundry IQ" as const,
    detail:
      "High-severity accounts require an executive owner, a recovery plan, and customer outreach within 48 hours.",
    keywords: ["risk", "revenue", "churn", "account", "customer", "policy"],
  },
  {
    id: "playbook-enterprise-sales",
    title: "Enterprise Sales Playbook",
    source: "Foundry IQ" as const,
    detail:
      "Leads scoring above 80 with pricing, security, or executive-buyer signals should receive senior AE coverage within 24 hours.",
    keywords: ["lead", "sales", "pricing", "security", "priority", "enterprise"],
  },
  {
    id: "metric-current-pipeline",
    title: "Current Pipeline Semantic Model",
    source: "Fabric IQ" as const,
    detail:
      "Zentro tracks 12 high-priority leads. Three enterprise opportunities recently moved from Commit to Best Case.",
    keywords: ["lead", "pipeline", "sales", "revenue", "opportunity", "priority"],
  },
  {
    id: "entity-at-risk-accounts",
    title: "Customer Risk Ontology",
    source: "Fabric IQ" as const,
    detail:
      "Acme Corp, Horizon AI, and Vertex Systems are linked to declining engagement, unresolved support issues, and $84,000 combined monthly revenue exposure.",
    keywords: ["risk", "revenue", "churn", "customer", "support", "account"],
  },
  {
    id: "metric-meeting-signals",
    title: "Meeting Intelligence Semantic Model",
    source: "Fabric IQ" as const,
    detail:
      "Recent meetings show increased security objections, longer procurement cycles, and one customer asking about downgrade options.",
    keywords: ["meeting", "security", "procurement", "churn", "customer", "revenue"],
  },
] as const;
