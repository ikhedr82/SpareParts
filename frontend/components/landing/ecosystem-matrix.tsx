"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Server,
  Store,
  Package,
  Truck,
  BarChart3,
  DollarSign,
  ShoppingCart,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

// ─── Config ──────────────────────────────────────────────────────────────────
const W = 500;   // SVG viewBox width
const H = 400;   // SVG viewBox height
const CX = 250;  // center X
const CY = 200;  // center Y
const R  = 145;  // radius of the orbit ring

// Equal angles for 6 nodes (60° apart), shifted so box sits at top
function orbit(deg: number) {
  const rad = (deg - 90) * (Math.PI / 180);
  return { x: CX + R * Math.cos(rad), y: CY + R * Math.sin(rad) };
}

const OUTER_NODES = [
  { id: "pos",       angle: 0,   icon: Store,        color: "#34d399", label_en: "POS Sales",     label_ar: "نقاط البيع"       },
  { id: "inventory", angle: 60,  icon: Package,       color: "#fbbf24", label_en: "Inventory",     label_ar: "المخزون"          },
  { id: "logistics", angle: 120, icon: Truck,         color: "#a78bfa", label_en: "Logistics",     label_ar: "اللوجستيات"       },
  { id: "finance",   angle: 180, icon: DollarSign,    color: "#f87171", label_en: "Finance",       label_ar: "المالية"          },
  { id: "analytics", angle: 240, icon: BarChart3,     color: "#38bdf8", label_en: "Analytics",     label_ar: "التحليلات"        },
  { id: "orders",    angle: 300, icon: ShoppingCart,  color: "#fb923c", label_en: "Orders \u0026 Quotes", label_ar: "الطلبات والعروض"  },
];

type Particle = {
  id: number;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  color: string;
};

// ─── Component ───────────────────────────────────────────────────────────────
export const EcosystemMatrix = () => {
  const { language } = useLanguage();
  const isAr = language === "ar";

  const [particles, setParticles] = useState<Particle[]>([]);
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  // Rotate which node pulses a packet toward the hub
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 700);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const node = OUTER_NODES[tick % OUTER_NODES.length];
    const pos = orbit(node.angle);
    setParticles((prev) => [
      ...prev.slice(-18),
      {
        id: Date.now(),
        fromX: pos.x, fromY: pos.y,
        toX: CX,      toY: CY,
        color: node.color,
      },
    ]);
    setActiveNode(node.id);
    const clear = setTimeout(() => setActiveNode(null), 640);
    return () => clearTimeout(clear);
  }, [tick]);

  return (
    <div className="relative w-full h-full min-h-[340px] overflow-hidden rounded-3xl bg-slate-950 border border-white/10 shadow-2xl flex items-center justify-center">
      {/* Background radial gradient */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,rgba(37,99,235,0.14),transparent_70%)]" />

      {/* Dot-grid */}
      <div
        className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, #94a3b8 1px, transparent 1px)",
          backgroundSize: "26px 26px",
        }}
      />

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-full"
        style={{ maxHeight: "420px" }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Hub glow filter */}
          <filter id="glow-hub" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          {OUTER_NODES.map((n) => (
            <filter key={n.id} id={`glow-${n.id}`} x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          ))}
        </defs>

        {/* ── Orbit ring ── */}
        <circle cx={CX} cy={CY} r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="3 7" />

        {/* ── Spoke lines from hub → each outer node ── */}
        {OUTER_NODES.map((n) => {
          const p = orbit(n.angle);
          const isActive = activeNode === n.id;
          return (
            <line
              key={n.id}
              x1={CX} y1={CY}
              x2={p.x} y2={p.y}
              stroke={isActive ? n.color : "rgba(255,255,255,0.08)"}
              strokeWidth={isActive ? 1.5 : 1}
              strokeDasharray="5 6"
              style={{ transition: "stroke 0.3s, stroke-width 0.3s" }}
            />
          );
        })}

        {/* ── Data particles flying hub-ward ── */}
        <AnimatePresence>
          {particles.map((p) => (
            <motion.circle
              key={p.id}
              r={4}
              fill={p.color}
              filter={`drop-shadow(0 0 5px ${p.color})`}
              initial={{ cx: p.fromX, cy: p.fromY, opacity: 1, r: 4 }}
              animate={{ cx: p.toX,   cy: p.toY,   opacity: 0, r: 2 }}
              exit={{}}
              transition={{ duration: 0.65, ease: "easeIn" }}
            />
          ))}
        </AnimatePresence>

        {/* ── Outer node chips ── */}
        {OUTER_NODES.map((n, i) => {
          const p = orbit(n.angle);
          const Icon = n.icon;
          const isActive = activeNode === n.id;
          return (
            <motion.g
              key={n.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 * i, type: "spring", stiffness: 140 }}
            >
              {/* Glow ring when active */}
              {isActive && (
                <circle
                  cx={p.x} cy={p.y} r={28}
                  fill="none"
                  stroke={n.color}
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  opacity={0.6}
                />
              )}

              {/* Node background square */}
              <rect
                x={p.x - 20} y={p.y - 20}
                width={40} height={40}
                rx={10}
                fill={`${n.color}18`}
                stroke={isActive ? n.color : `${n.color}44`}
                strokeWidth={isActive ? 1.5 : 1}
                style={{ transition: "stroke 0.3s, fill 0.3s" }}
              />

              {/* Lucide icon via foreignObject */}
              <foreignObject x={p.x - 12} y={p.y - 12} width={24} height={24}>
                <div className="flex items-center justify-center w-full h-full">
                  <Icon
                    strokeWidth={2}
                    style={{ width: 18, height: 18, color: n.color }}
                  />
                </div>
              </foreignObject>

              {/* Node label */}
              <text
                x={p.x}
                y={p.y + 35}
                textAnchor="middle"
                fontSize={9}
                fontFamily="ui-sans-serif, system-ui"
                fontWeight={600}
                letterSpacing="0.05em"
                fill="rgba(200,200,220,0.85)"
              >
                {isAr ? n.label_ar : n.label_en}
              </text>

              {/* Active status dot */}
              <motion.circle
                cx={p.x + 16} cy={p.y - 16}
                r={3}
                fill={n.color}
                animate={{ opacity: isActive ? [1, 0.3, 1] : [0.3, 0.3, 0.3] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              />
            </motion.g>
          );
        })}

        {/* ── Central hub ── */}
        <motion.g
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 100, delay: 0.05 }}
          filter="url(#glow-hub)"
        >
          {/* Outer pulse rings */}
          {[38, 28].map((r, i) => (
            <motion.circle
              key={r}
              cx={CX} cy={CY} r={r}
              fill="none"
              stroke="rgba(96,165,250,0.25)"
              strokeWidth={1}
              animate={{ r: [r, r + 8, r], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.8 }}
            />
          ))}

          {/* Hub plate */}
          <rect
            x={CX - 26} y={CY - 26}
            width={52} height={52}
            rx={14}
            fill="rgba(30,41,59,0.95)"
            stroke="rgba(96,165,250,0.5)"
            strokeWidth={1.5}
          />

          {/* Hub icon */}
          <foreignObject x={CX - 14} y={CY - 14} width={28} height={28}>
            <div className="flex items-center justify-center w-full h-full">
              <Server strokeWidth={1.5} style={{ width: 22, height: 22, color: "#93c5fd" }} />
            </div>
          </foreignObject>

          {/* Hub label */}
          <text
            x={CX} y={CY + 42}
            textAnchor="middle"
            fontSize={9}
            fontFamily="ui-sans-serif, system-ui"
            fontWeight={700}
            fill="rgba(147,197,253,0.9)"
            letterSpacing="0.08em"
          >
            {isAr ? "المركز السحابي" : "CLOUD CORE"}
          </text>
        </motion.g>

        {/* ── Live badge ── */}
        <g transform={`translate(${W - 70}, ${H - 22})`}>
          <motion.circle
            cx={6} cy={6} r={4}
            fill="#4ade80"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <text x={14} y={10} fontSize={9} fontFamily="ui-monospace" fill="rgba(148,163,184,0.8)" fontWeight={600}>
            {isAr ? "مباشر" : "LIVE"}
          </text>
        </g>
      </svg>
    </div>
  );
};
