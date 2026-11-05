import { motion } from 'framer-motion';
import type { FlowDiagram as Spec, FlowNode } from '../content/types';
import { ICONS } from '../components/icons';
import { ease } from './clock';

const H = 44;
const W = (n: FlowNode) => n.w ?? 64;

// Where a line from a's centre toward b leaves a's box
function clip(a: FlowNode, b: FlowNode, pad = 3) {
  const dx = b.x - a.x, dy = b.y - a.y;
  const kx = dx === 0 ? Infinity : (W(a) / 2 + pad) / Math.abs(dx);
  const ky = dy === 0 ? Infinity : (H / 2 + pad) / Math.abs(dy);
  const k = Math.min(kx, ky, 1);
  return [a.x + dx * k, a.y + dy * k];
}

/** Hop + fraction at loop time t. Last 12% of the loop is a pause at the end. */
export function flowPhase(spec: Spec, t: number) {
  const hops = spec.route.length - 1;
  const run = Math.max(0, Math.min(1, t / 0.88)) * hops;
  const hop = Math.min(hops - 1, Math.floor(run));
  const f = t >= 0.88 ? 1 : ease(run - hop);
  return { hop, f, done: t >= 0.88 };
}

/** Index of the lit step chip: blank labels keep the previous chip lit. */
export function flowStep(spec: Spec, t: number) {
  if (!spec.steps) return -1;
  const { hop, done } = flowPhase(spec, t);
  const labels = spec.steps;
  let idx = -1, chip = -1;
  for (let i = 0; i <= Math.min(hop, labels.length - 1); i++) if (labels[i]) { chip++; idx = chip; }
  return done ? labels.filter(Boolean).length - 1 : idx;
}

export default function FlowDiagram({ spec, t }: { spec: Spec; t: number }) {
  const byId = Object.fromEntries(spec.nodes.map((n) => [n.id, n]));
  const { hop, f } = flowPhase(spec, t);
  const a = byId[spec.route[hop]], b = byId[spec.route[hop + 1]];
  const p = [a.x + (b.x - a.x) * f, a.y + (b.y - a.y) * f];
  const live = (x: string, y: string) => (a.id === x && b.id === y) || (a.id === y && b.id === x);
  const atNode = f > 0.92 ? b.id : f < 0.08 ? a.id : null;
  const dashed = new Set((spec.dashed ?? []).map(([x, y]) => `${x}>${y}`));

  return (
    <svg viewBox="0 0 360 220" className="block h-auto w-full" role="img"
      aria-label={`Diagram: ${spec.route.map((id) => byId[id].label).join(' → ')}`}>
      <path d="M8 8h10M8 8v10M352 8h-10M352 8v10M8 212h10M8 212v-10M352 212h-10M352 212v-10" fill="none" stroke="#5A5A68" />
      {spec.edges.map(([x, y]) => {
        const [x1, y1] = clip(byId[x], byId[y]);
        const [x2, y2] = clip(byId[y], byId[x]);
        const on = live(x, y);
        return (
          <line key={`${x}-${y}`} x1={x1} y1={y1} x2={x2} y2={y2}
            stroke={on ? '#FF4B52' : '#F5F5F7'} strokeOpacity={on ? 1 : 0.5} strokeWidth={on ? 2 : 1.5}
            strokeDasharray={dashed.has(`${x}>${y}`) ? '5 5' : undefined}
            style={{ filter: on ? 'drop-shadow(0 0 4px rgba(229,38,45,.8))' : 'none', transition: 'stroke .2s' }} />
        );
      })}
      {spec.nodes.map((n, i) => {
        const w = W(n);
        const glow = n.hot || atNode === n.id;
        const Ico = n.icon ? ICONS[n.icon] : null;
        return (
          <motion.g key={n.id} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.06, duration: 0.3 }} style={{ transformOrigin: `${n.x}px ${n.y}px` }}>
            <rect x={n.x - w / 2} y={n.y - H / 2} width={w} height={H} rx={11}
              fill={glow ? '#1A0D10' : '#0D0D12'} stroke={glow ? '#E5262D' : '#F5F5F7'} strokeWidth={1.5}
              style={{ filter: glow ? 'drop-shadow(0 0 10px rgba(229,38,45,.45))' : 'none', transition: 'all .25s' }} />
            {Ico
              ? <Ico x={n.x - 11} y={n.y - 11} width={22} height={22} color={glow ? '#FF4B52' : '#F5F5F7'} strokeWidth={1.8} />
              : <text x={n.x} y={n.y + 4} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize={11} fill={glow ? '#FF4B52' : '#F5F5F7'}>{n.label}</text>}
            {(n.sub || Ico) && (
              <text x={n.x} y={n.y + H / 2 + 14} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize={9.5} fill={n.hot ? '#FF4B52' : '#A3A3B0'}>
                {(n.sub ?? n.label).toUpperCase()}
              </text>
            )}
          </motion.g>
        );
      })}
      <circle cx={p[0]} cy={p[1]} r={10} fill="rgba(229,38,45,.25)" />
      <circle cx={p[0]} cy={p[1]} r={6} fill="#FF4B52" style={{ filter: 'drop-shadow(0 0 6px #E5262D)' }} />
    </svg>
  );
}
