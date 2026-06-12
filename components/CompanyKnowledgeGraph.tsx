"use client";

import { useEffect, useState } from "react";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
const VIOLET = "#8B5CF6";
const CYAN = "#06B6D4";
const EMERALD = "#10B981";

const SOURCES = [
  { id: "email", label: "Email", x: 200, y: 52 },
  { id: "crm", label: "CRM", x: 318, y: 108 },
  { id: "meetings", label: "Meetings", x: 318, y: 292 },
  { id: "leads", label: "Leads", x: 200, y: 348 },
  { id: "support", label: "Support", x: 82, y: 292 },
  { id: "finance", label: "Finance", x: 82, y: 108 },
] as const;

const CENTER = { x: 200, y: 200 };

function pathD(from: (typeof SOURCES)[number]) {
  const cx = (from.x + CENTER.x) / 2;
  const cy = (from.y + CENTER.y) / 2;
  return `M ${from.x} ${from.y} Q ${cx} ${cy} ${CENTER.x} ${CENTER.y}`;
}

function FlowLine({
  from,
  delay,
  index,
}: {
  from: (typeof SOURCES)[number];
  delay: number;
  index: number;
}) {
  const pathId = `zentro-flow-${from.id}`;
  const gradId = `zentro-stream-${from.id}`;
  const d = pathD(from);

  return (
    <g>
      <defs>
        <linearGradient
          id={gradId}
          gradientUnits="userSpaceOnUse"
          x1={from.x}
          y1={from.y}
          x2={CENTER.x}
          y2={CENTER.y}
        >
          <stop offset="0%" stopColor={CYAN} stopOpacity="0.15" />
          <stop offset="45%" stopColor={CYAN} stopOpacity="0.55" />
          <stop offset="100%" stopColor={VIOLET} stopOpacity="0.45" />
        </linearGradient>
      </defs>

      <path id={pathId} d={d} fill="none" stroke="none" />

      {/* Base connection */}
      <path
        d={d}
        fill="none"
        stroke={`url(#${gradId})`}
        strokeWidth="1.25"
        strokeOpacity="0.35"
      />

      {/* Animated pulse line */}
      <path
        d={d}
        fill="none"
        stroke={CYAN}
        strokeWidth="1"
        strokeOpacity="0.5"
        strokeDasharray="6 14"
        strokeLinecap="round"
      >
        <animate
          attributeName="stroke-dashoffset"
          from="0"
          to="-40"
          dur="2.5s"
          repeatCount="indefinite"
          begin={`${delay}s`}
        />
      </path>

      {/* Cyan data particles */}
      {[0, 0.8, 1.6].map((offset, i) => (
        <circle key={i} r={i === 0 ? 3 : 2} fill={CYAN} opacity={0.85 - i * 0.15}>
          <animateMotion
            dur={`${2.4 + index * 0.15}s`}
            repeatCount="indefinite"
            begin={`${delay + offset}s`}
          >
            <mpath href={`#${pathId}`} />
          </animateMotion>
        </circle>
      ))}

      {/* Emerald confidence trace */}
      <circle r="1.75" fill={EMERALD} opacity="0.7">
        <animateMotion
          dur={`${3.2 + index * 0.2}s`}
          repeatCount="indefinite"
          begin={`${delay + 0.5}s`}
        >
          <mpath href={`#${pathId}`} />
        </animateMotion>
      </circle>
    </g>
  );
}

function SourceNode({ node }: { node: (typeof SOURCES)[number] }) {
  return (
    <g>
      <circle
        cx={node.x}
        cy={node.y}
        r="32"
        fill="rgba(6,182,212,0.04)"
        stroke="rgba(6,182,212,0.12)"
        strokeWidth="1"
      />
      <circle
        cx={node.x}
        cy={node.y}
        r="26"
        fill="rgba(255,255,255,0.03)"
        stroke="rgba(6,182,212,0.25)"
        strokeWidth="1"
      />
      {/* Confidence indicator */}
      <circle
        cx={node.x + 18}
        cy={node.y - 16}
        r="4"
        fill={EMERALD}
        opacity="0.9"
      >
        <animate
          attributeName="opacity"
          values="0.5;1;0.5"
          dur="2.8s"
          repeatCount="indefinite"
        />
      </circle>
      <text
        x={node.x}
        y={node.y + 4}
        textAnchor="middle"
        fill="#e2e8f0"
        fontSize="11"
        fontWeight="500"
        style={{ fontFamily: "system-ui, sans-serif" }}
      >
        {node.label}
      </text>
    </g>
  );
}

export function CompanyKnowledgeGraph() {
  const [stats, setStats] = useState({
  leads: 0,
  customers: 0,
  meetings: 0,
  risks: 0,
});

useEffect(() => {
  if (!isSupabaseConfigured) return;

  async function fetchStats() {
    const { data: leads } = await supabase.from("leads").select("*");
    const { data: customers } = await supabase.from("customers").select("*");
    const { data: meetings } = await supabase.from("meetings").select("*");
    const { data: risks } = await supabase.from("revenue_risks").select("*");

    setStats({
      leads: leads?.length || 0,
      customers: customers?.length || 0,
      meetings: meetings?.length || 0,
      risks: risks?.length || 0,
    });
  }

  fetchStats();
}, []);
  return (
    <div className="relative h-full min-h-[320px] w-full sm:min-h-[380px]">
      {/* Glass container */}
      <div className="absolute inset-0 overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.06] via-white/[0.02] to-transparent shadow-[0_8px_40px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-2xl">
        <div className="pointer-events-none absolute -left-16 top-0 h-48 w-48 rounded-full bg-[#8B5CF6]/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-12 bottom-8 h-40 w-40 rounded-full bg-[#06B6D4]/8 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/2 h-32 w-64 -translate-x-1/2 rounded-full bg-[#10B981]/5 blur-3xl" />
      </div>

      {/* Ambient depth particles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl" aria-hidden>
        {[
          { left: "14%", top: "20%", color: CYAN },
          { left: "82%", top: "24%", color: VIOLET },
          { left: "88%", top: "70%", color: CYAN },
          { left: "18%", top: "78%", color: EMERALD },
          { left: "50%", top: "10%", color: CYAN },
        ].map((p, i) => (
          <span
            key={i}
            className="absolute h-1 w-1 rounded-full opacity-40 animate-pulse"
            style={{
              left: p.left,
              top: p.top,
              backgroundColor: p.color,
              animationDelay: `${i * 0.5}s`,
              boxShadow: `0 0 12px ${p.color}40`,
            }}
          />
        ))}
      </div>

      <svg
        viewBox="0 0 400 400"
        className="relative z-10 h-full w-full px-3 py-5"
        role="img"
        aria-label="Company knowledge flows into Zentro Brain"
      >
        <defs>
          <radialGradient id="zentro-core-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={VIOLET} stopOpacity="0.45" />
            <stop offset="55%" stopColor={VIOLET} stopOpacity="0.12" />
            <stop offset="100%" stopColor={VIOLET} stopOpacity="0" />
          </radialGradient>
          <radialGradient id="zentro-core-inner" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.35" />
            <stop offset="100%" stopColor={VIOLET} stopOpacity="0.05" />
          </radialGradient>
          <filter
            id="zentro-violet-glow"
            x="-80%"
            y="-80%"
            width="260%"
            height="260%"
          >
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="0 0 0 0 0.545
                      0 0 0 0 0.361
                      0 0 0 0 0.965
                      0 0 0 0.5 0"
              result="violetBlur"
            />
            <feMerge>
              <feMergeNode in="violetBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="zentro-node-shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.4" />
          </filter>
        </defs>

        {/* Animated flows + connections */}
        {SOURCES.map((node, i) => (
          <FlowLine key={node.id} from={node} delay={i * 0.28} index={i} />
        ))}

        {/* Pulsing core halos */}
        <circle cx={CENTER.x} cy={CENTER.y} r="72" fill="url(#zentro-core-glow)">
          <animate
            attributeName="r"
            values="68;76;68"
            dur="4s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.7;1;0.7"
            dur="4s"
            repeatCount="indefinite"
          />
        </circle>
        <circle
          cx={CENTER.x}
          cy={CENTER.y}
          r="58"
          fill="none"
          stroke={VIOLET}
          strokeWidth="0.5"
          strokeOpacity="0.25"
        >
          <animate
            attributeName="r"
            values="54;62;54"
            dur="3.2s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="stroke-opacity"
            values="0.15;0.35;0.15"
            dur="3.2s"
            repeatCount="indefinite"
          />
        </circle>

        {/* Source nodes */}
        {SOURCES.map((node) => (
          <g key={node.id} filter="url(#zentro-node-shadow)">
            <SourceNode node={node} />
          </g>
        ))}

        {/* Central AI Core */}
        <g filter="url(#zentro-violet-glow)">
          <circle
            cx={CENTER.x}
            cy={CENTER.y}
            r="48"
            fill="rgba(139,92,246,0.08)"
            stroke="rgba(139,92,246,0.35)"
            strokeWidth="1.5"
          />
          <circle
            cx={CENTER.x}
            cy={CENTER.y}
            r="40"
            fill="url(#zentro-core-inner)"
            stroke="rgba(167,139,250,0.5)"
            strokeWidth="1"
          />
          <circle
            cx={CENTER.x}
            cy={CENTER.y}
            r="32"
            fill="rgba(139,92,246,0.15)"
            stroke={VIOLET}
            strokeWidth="1"
            strokeOpacity="0.6"
          />
        </g>

        <text
          x={CENTER.x}
          y={CENTER.y - 5}
          textAnchor="middle"
          fill="#f5f3ff"
          fontSize="10"
          fontWeight="600"
          letterSpacing="0.12em"
          style={{ fontFamily: "system-ui, sans-serif" }}
        >
          ZENTRO
        </text>
        <text
          x={CENTER.x}
          y={CENTER.y + 11}
          textAnchor="middle"
          fill="#c4b5fd"
          fontSize="12"
          fontWeight="500"
          style={{ fontFamily: "system-ui, sans-serif" }}
        >
          Brain
        </text>

        {/* Synced confidence ring */}
        <circle
          cx={CENTER.x}
          cy={CENTER.y}
          r="52"
          fill="none"
          stroke={EMERALD}
          strokeWidth="1"
          strokeOpacity="0.25"
          strokeDasharray="4 8"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from={`0 ${CENTER.x} ${CENTER.y}`}
            to={`360 ${CENTER.x} ${CENTER.y}`}
            dur="24s"
            repeatCount="indefinite"
          />
        </circle>
      </svg>
<div className="absolute bottom-0 left-0 right-0 z-10 border-t border-white/[0.05] bg-[#0A0A0A]/30 px-4 py-3 backdrop-blur-md">
  <p className="text-center text-[10px] font-medium uppercase tracking-[0.22em] text-zinc-500">
    Unified intelligence layer
  </p>

  <div className="mt-3 grid grid-cols-4 gap-3 text-center">
    <div>
      <p className="text-lg font-semibold text-white">{stats.leads}</p>
      <p className="text-[10px] uppercase tracking-wide text-zinc-500">
        Leads
      </p>
    </div>

    <div>
      <p className="text-lg font-semibold text-white">{stats.customers}</p>
      <p className="text-[10px] uppercase tracking-wide text-zinc-500">
        Customers
      </p>
    </div>

    <div>
      <p className="text-lg font-semibold text-white">{stats.meetings}</p>
      <p className="text-[10px] uppercase tracking-wide text-zinc-500">
        Meetings
      </p>
    </div>

    <div>
      <p className="text-lg font-semibold text-white">{stats.risks}</p>
      <p className="text-[10px] uppercase tracking-wide text-zinc-500">
        Risks
      </p>
    </div>
  </div>
</div>
</div>
);
}
