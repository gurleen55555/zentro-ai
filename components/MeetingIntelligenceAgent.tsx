"use client";

import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import {
  Calendar,
  CheckSquare,
  FileText,
  Sparkles,
  Video,
} from "lucide-react";

type Meeting = {
  id: string | number;
  title: string;
  company: string;
  transcript: string;
  summary: string;
  action_items: string;
};

type DataRow = Record<string, unknown>;

const FALLBACK_MEETINGS: Meeting[] = [
  {
    id: "demo-enterprise-review",
    title: "Enterprise Renewal Review",
    company: "Acme Corp",
    transcript:
      "Customer raised concerns about onboarding delays, pricing clarity, and security review timing. The team agreed to provide a recovery plan and schedule executive follow-up.",
    summary:
      "Customer sentiment is mixed. Renewal risk is present because onboarding and security questions remain unresolved.",
    action_items:
      "Send recovery plan within 24 hours; Schedule executive check-in; Share security documentation; Confirm renewal timeline",
  },
];

function textValue(row: DataRow, keys: string[], fallback = "") {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number") return String(value);
  }

  return fallback;
}

function mapSupabaseMeeting(row: DataRow, index: number): Meeting {
  const title = textValue(row, ["title", "meeting_title", "name"], `Meeting ${index + 1}`);

  return {
    id: textValue(row, ["id", "meeting_id", "uuid"], `${title}-${index}`),
    title,
    company: textValue(row, ["company", "company_name", "customer", "account"], "Customer account"),
    transcript: textValue(row, ["transcript", "notes", "meeting_notes"], "Transcript was not provided in the Supabase row."),
    summary: textValue(row, ["summary", "ai_summary", "description"], "Summary is being generated from available meeting fields."),
    action_items: textValue(
      row,
      ["action_items", "actions", "next_steps", "tasks"],
      "Review account context; Assign owner; Schedule follow-up",
    ),
  };
}

function getMeetingSentiment(meeting: Meeting) {
  const text = `${meeting.transcript} ${meeting.summary}`.toLowerCase();

  if (text.includes("concern") || text.includes("delay") || text.includes("risk") || text.includes("slowed")) {
    return "Negative";
  }

  if (text.includes("agreed") || text.includes("positive") || text.includes("interested") || text.includes("approved")) {
    return "Positive";
  }

  return "Neutral";
}

function getMeetingRiskLevel(meeting: Meeting) {
  const text = `${meeting.transcript} ${meeting.summary}`.toLowerCase();

  if (text.includes("churn") || text.includes("downgrade") || text.includes("delayed") || text.includes("concern")) {
    return "High";
  }

  if (text.includes("renewal") || text.includes("pricing") || text.includes("security")) {
    return "Medium";
  }

  return "Low";
}

function getNextMeetingDate() {
  return "Within 7 days";
}

function getDecisionMade(meeting: Meeting) {
  if (meeting.summary) {
    return meeting.summary;
  }

  return "Next steps identified and follow-up required.";
}

export function MeetingIntelligenceAgent() {
  const [meetings, setMeetings] = useState<Meeting[]>(FALLBACK_MEETINGS);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(FALLBACK_MEETINGS[0]);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    async function fetchMeetings() {
      const { data, error } = await supabase
        .from("meetings")
        .select("*");

      if (error) return;

      if (data?.length) {
        const meetingRows = (data as DataRow[]).map(mapSupabaseMeeting);
        setMeetings(meetingRows);
        setSelectedMeeting(meetingRows[0] || FALLBACK_MEETINGS[0]);
      }
    }

    fetchMeetings();
  }, []);

  return (
    <section className="mb-10 rounded-[1.75rem] border border-white/[0.06] bg-gradient-to-b from-white/[0.05] to-white/[0.015] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-500/15 text-sky-300 ring-1 ring-sky-500/20">
          <Video className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">
            Meeting Intelligence Agent
          </h2>
          <p className="text-sm text-zinc-500">
            Converts meeting transcripts into summaries, actions, and decisions.
          </p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-12">
        <div className="space-y-3 lg:col-span-5">
          {meetings.slice(0, 6).map((meeting) => (
            <button
              key={meeting.id}
              type="button"
              onClick={() => setSelectedMeeting(meeting)}
              className={`w-full rounded-2xl border p-4 text-left transition ${
                selectedMeeting?.id === meeting.id
                  ? "border-sky-500/35 bg-sky-500/10"
                  : "border-white/[0.06] bg-white/[0.025] hover:bg-white/[0.05]"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-zinc-400">
                  <Calendar className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium text-white">
                    {meeting.title}
                  </p>
                  <p className="mt-1 text-sm text-zinc-500">
                    {meeting.company}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="lg:col-span-7">
          {selectedMeeting ? (
            <div className="rounded-2xl border border-white/[0.06] bg-black/25 p-5">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Selected meeting
                  </p>
                  <h3 className="mt-1 text-lg font-semibold text-white">
                    {selectedMeeting.title}
                  </h3>
                  <p className="text-sm text-zinc-500">
                    {selectedMeeting.company}
                  </p>
                </div>
                <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                  Processed
                </span>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-zinc-500" />
                    <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                      Transcript
                    </p>
                  </div>
                  <p className="text-sm leading-relaxed text-zinc-300">
                    {selectedMeeting.transcript}
                  </p>
                </div>

                <div className="rounded-2xl border border-violet-500/20 bg-violet-500/10 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-violet-300" />
                    <p className="text-xs font-semibold uppercase tracking-wider text-violet-300">
                      AI Summary
                    </p>
                  </div>
                  <p className="text-sm leading-relaxed text-zinc-200">
                    {selectedMeeting.summary}
                  </p>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
  <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4">
    <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
      Meeting Sentiment
    </p>
    <span
  className={`mt-2 inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
    getMeetingSentiment(selectedMeeting) === "Positive"
      ? "bg-emerald-500/15 text-emerald-300"
      : getMeetingSentiment(selectedMeeting) === "Negative"
      ? "bg-red-500/15 text-red-300"
      : "bg-yellow-500/15 text-yellow-300"
  }`}
>
  {getMeetingSentiment(selectedMeeting)}
</span>
  </div>

  <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4">
    <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
      Risk Level
    </p>
    <span
  className={`mt-2 inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
    getMeetingRiskLevel(selectedMeeting) === "High"
      ? "bg-red-500/15 text-red-300"
      : getMeetingRiskLevel(selectedMeeting) === "Medium"
      ? "bg-orange-500/15 text-orange-300"
      : "bg-emerald-500/15 text-emerald-300"
  }`}
>
  {getMeetingRiskLevel(selectedMeeting)}
</span>
  </div>

  <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4">
    <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
      Next Meeting
    </p>
    <p className="mt-2 text-lg font-semibold text-white">
      {getNextMeetingDate()}
    </p>
  </div>

  <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4">
    <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
      Decision Made
    </p>
    <p className="mt-2 text-sm text-zinc-200">
      {getDecisionMade(selectedMeeting)}
    </p>
  </div>
</div>
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <CheckSquare className="h-4 w-4 text-emerald-300" />
                    <p className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
                      Action Items
                    </p>
                  </div>
                  <ul className="space-y-2">
                    {String(selectedMeeting.action_items || "")
                      .split(";")
                      .filter(Boolean)
                      .map((item, index) => (
                        <li
                          key={`${item}-${index}`}
                          className="flex items-start gap-2 text-sm text-zinc-200"
                        >
                          <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-emerald-300" />
                          {item.trim()}
                        </li>
                      ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-white/[0.06] bg-black/25 p-5 text-sm text-zinc-500">
              No meeting selected.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
