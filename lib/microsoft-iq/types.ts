export type IQMode = "demo" | "foundry";

export type IQCitation = {
  id: string;
  title: string;
  source: "Foundry IQ" | "Fabric IQ";
  detail: string;
};

export type IQReasoningStep = {
  label: string;
  detail: string;
  status: "complete";
};

export type IQAnswer = {
  mode: IQMode;
  answer: string;
  confidence: number;
  reasoning: IQReasoningStep[];
  citations: IQCitation[];
};
