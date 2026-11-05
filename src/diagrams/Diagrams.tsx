import { motion } from 'framer-motion';
import type { BarsDiagram, CompareDiagram, CoresDiagram, NeuralDiagram, StackDiagram, TimelineDiagram } from '../content/types';
import { Icon, cx } from '../components/ui';
import { clamp01 } from './clock';

// ---------------- StackDiagram: layers, top → bottom ----------------
export function StackView({ spec, t }: { spec: StackDiagram; t: number }) {
  const n = spec.layers.length;
  const lit = Math.min(n - 1, Math.floor(t * (n + 1)));
  return (
    <div className="flex gap-3 p-4" role="img" aria-label={`Layers from top to bottom: ${spec.layers.map((l) => l.label).join(', ')}`}>
      <div className="flex w-4 flex-none flex-col items-center justify-between py-1">
        <span className="font-mono text-[9px] text-ink3 [writing-mode:vertical-rl] rotate-180">{spec.left}</span>
        <div className="relative my-2 w-0.5 flex-1 bg-line-strong">
          <motion.span className="absolute -left-[4px] h-2.5 w-2.5 rounded-full bg-red-hi shadow-[0_0_8px_#E5262D]" animate={{ top: `${(lit / Math.max(1, n - 1)) * 92}%` }} transition={{ duration: 0.35 }} />
        </div>
        <span className="font-mono text-[9px] text-ink3 [writing-mode:vertical-rl] rotate-180">{spec.right}</span>
      </div>
      <div className="flex flex-1 flex-col gap-2">
        {spec.layers.map((l, i) => {
          const on = i === lit || l.hot;
          return (
            <motion.div key={l.label} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
              className={cx('flex items-center gap-3 rounded-md border-[1.5px] px-3 py-2 transition-all duration-300',
                on ? 'border-red bg-red-node shadow-glow-node' : 'border-ink/80 bg-sunk')}
              style={{ marginInline: `${(n - 1 - i) * 0}px` }}>
              {l.icon && <Icon name={l.icon} size={20} color={on ? '#FF4B52' : '#F5F5F7'} />}
              <div className="flex min-w-0 flex-col">
                <span className={cx('text-[15px] font-bold leading-5', on && 'text-red-hi')}>{l.label}</span>
                {l.sub && <span className="truncate font-mono text-[10px] text-ink2">{l.sub}</span>}
              </div>
              {i === lit && <span className="ml-auto font-mono text-[10px] text-red-hi">● NOW</span>}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------- CompareCards: A vs B ----------------
export function CompareView({ spec, t }: { spec: CompareDiagram; t: number }) {
  const side = t < 0.5 ? 0 : 1;
  const card = (c: CompareDiagram['a'], i: number) => (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.15 }}
      className={cx('flex flex-1 flex-col gap-2.5 rounded-lg border-[1.5px] p-3.5 transition-all duration-300', side === i ? 'border-red bg-red-node shadow-glow-node' : 'border-line bg-sunk')}>
      <span className={cx('flex h-10 w-10 items-center justify-center rounded-md border', side === i ? 'border-red text-red-hi' : 'border-line-strong')}><Icon name={c.icon} size={20} /></span>
      <span className="font-display text-base font-semibold">{c.title}</span>
      <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
        {c.points.map((p, k) => (
          <motion.li key={p} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 + i * 0.15 + k * 0.1 }} className="flex gap-2 text-[13px] leading-[18px]">
            <span className={cx('mt-1.5 h-1.5 w-1.5 flex-none rounded-full', side === i ? 'bg-red-hi' : 'bg-ink2')} />{p}
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
  return (
    <div className="flex items-stretch gap-2 p-3.5" role="img" aria-label={`${spec.a.title} versus ${spec.b.title}`}>
      {card(spec.a, 0)}
      <span className="self-center font-mono text-[10px] text-ink3">VS</span>
      {card(spec.b, 1)}
    </div>
  );
}

// ---------------- BarChart (optional log scale) ----------------
export function BarsView({ spec, t, playKey }: { spec: BarsDiagram; t: number; playKey: number }) {
  const max = Math.max(...spec.bars.map((b) => b.value));
  const scale = (v: number) => (spec.log ? Math.log10(Math.max(v, 1) * 10) / Math.log10(max * 10) : v / max);
  const lit = Math.min(spec.bars.length - 1, Math.floor(t * spec.bars.length));
  return (
    <div className="flex flex-col gap-3 p-4" role="img" aria-label={spec.bars.map((b) => `${b.label}: ${b.text}`).join(', ')}>
      {spec.bars.map((b, i) => (
        <div key={b.label} className="flex items-center gap-3">
          <span className={cx('w-[84px] flex-none font-mono text-[11px]', b.hot ? 'text-red-hi' : i === lit ? 'text-ink' : 'text-ink2')}>{b.label}</span>
          <div className="relative h-4 flex-1 rounded-[4px] bg-[#1A1A22]">
            <motion.div key={playKey} className={cx('h-full rounded-[4px]', b.hot ? 'bg-red shadow-glow-line' : 'bg-ink')}
              initial={{ width: 0 }} animate={{ width: `${Math.max(2, scale(b.value) * 100)}%` }} transition={{ delay: i * 0.25, duration: 0.7, ease: [0.3, 0.7, 0.2, 1] }} />
          </div>
          <span className="w-[66px] flex-none text-right font-mono text-[11px] text-ink">{b.text}</span>
        </div>
      ))}
      {spec.caption && <span className="pt-1 font-mono text-[9.5px] tracking-wide text-ink3">{spec.caption}</span>}
    </div>
  );
}

// ---------------- NeuralNet ----------------
export function NeuralView({ spec, t }: { spec: NeuralDiagram; t: number }) {
  const L = spec.layers.length;
  const xs = spec.layers.map((_, i) => 100 + (i * 180) / (L - 1));
  const ys = (n: number) => Array.from({ length: n }, (_, k) => 110 + (k - (n - 1) / 2) * 34);
  const wave = t * (L + 0.8) - 0.3;
  const strong = (l: number, a: number, b: number) => (l * 7 + a * 3 + b * 5) % 4 === 0;
  return (
    <svg viewBox="0 0 360 220" className="block h-auto max-h-[400px] w-full" role="img" aria-label={`Neural network with layers of ${spec.layers.join(', ')} neurons. Output: ${spec.outputs?.[0] ?? ''}`}>
      {spec.layers.slice(0, -1).map((n, l) => ys(n).map((y1, a) => ys(spec.layers[l + 1]).map((y2, b) => {
        const s = strong(l, a, b);
        const lit = wave > l + 0.4 && wave < l + 1.6;
        return <line key={`${l}-${a}-${b}`} x1={xs[l]} y1={y1} x2={xs[l + 1]} y2={y2} stroke={s ? '#FF4B52' : '#F5F5F7'} strokeWidth={s ? 1.6 : 1} strokeOpacity={s ? (lit ? 1 : 0.55) : lit ? 0.35 : 0.1} />;
      })))}
      {spec.layers.map((n, l) => ys(n).map((y, k) => {
        const lit = wave > l && wave < l + 1.2;
        const win = l === L - 1 && k === 0 && wave > L - 1;
        return <circle key={`${l}-${k}`} cx={xs[l]} cy={y} r={7.5} fill={lit || win ? '#E5262D' : '#0D0D12'} stroke={lit || win ? '#FFB3B6' : '#F5F5F7'} strokeWidth={1.5} style={{ filter: lit || win ? 'drop-shadow(0 0 6px #E5262D)' : 'none' }} />;
      }))}
      {spec.inputs?.map((s, k) => <text key={s} x={xs[0] - 13} y={ys(spec.layers[0])[k] + 3} textAnchor="end" fontFamily="JetBrains Mono, monospace" fontSize={9} fill="#A3A3B0">{s}</text>)}
      {spec.outputs?.map((s, k) => <text key={s} x={xs[L - 1] + 13} y={ys(spec.layers[L - 1])[k] + 3} fontFamily="JetBrains Mono, monospace" fontSize={9} fill={k === 0 && wave > L - 1 ? '#FF4B52' : '#A3A3B0'}>{s}</text>)}
      {spec.layers.map((_, l) => <text key={l} x={xs[l]} y={20} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize={9} fill={Math.floor(wave) === l ? '#FF4B52' : '#868694'}>{l === 0 ? 'INPUT' : l === L - 1 ? 'OUTPUT' : 'HIDDEN'}</text>)}
    </svg>
  );
}

// ---------------- CoreGrid: few big cores vs many tiny ----------------
export function CoresView({ spec, t }: { spec: CoresDiagram; t: number }) {
  const cpuP = clamp01((t - 0.05) / 0.45);
  const gpuP = clamp01((t - 0.5) / 0.35);
  const cols = 16;
  return (
    <div className="grid grid-cols-2 gap-3 p-3.5" role="img" aria-label={`${spec.a.title}: ${spec.a.sub}. ${spec.b.title}: ${spec.b.sub}.`}>
      {[spec.a, spec.b].map((s, side) => (
        <div key={s.title} className="flex flex-col gap-2">
          <span className="font-display text-sm font-semibold text-red-hi">{s.title}</span>
          <span className="font-mono text-[9px] text-ink2">{s.sub}</span>
          {side === 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {Array.from({ length: Math.min(8, s.cores) }, (_, i) => {
                const f = clamp01(cpuP * Math.min(8, s.cores) / 2 - Math.floor(i / 2));
                return (
                  <div key={i} className={cx('flex flex-col gap-1.5 rounded-sm border-[1.5px] p-1.5 transition-colors', f > 0 && f < 1 ? 'border-red bg-red-node' : 'border-ink/80 bg-sunk')}>
                    <span className="font-mono text-[8px] text-ink2">CORE {i + 1}</span>
                    <span className="h-1 rounded-sm bg-track"><span className={cx('block h-full rounded-sm', f >= 1 ? 'bg-ink' : 'bg-red')} style={{ width: `${f * 100}%` }} /></span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="grid gap-[3px] rounded-sm border-[1.5px] border-ink/80 bg-sunk p-1.5" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
              {Array.from({ length: s.cores }, (_, k) => {
                const c = k % cols;
                const w = gpuP * (cols + 4) - c;
                const on = w > 0 && w < 4;
                return <span key={k} className="aspect-[2/3] rounded-[1.5px]" style={{ background: on ? '#FF4B52' : gpuP > 0 && w >= 4 ? '#F5F5F7' : '#2B2B36' }} />;
              })}
            </div>
          )}
          <span className={cx('font-mono text-[9.5px]', (side === 0 ? t < 0.5 : t >= 0.5) ? 'text-red-hi' : 'text-ink3')}>{side === 0 ? '1 hard job, fast' : 'many easy jobs at once'}</span>
        </div>
      ))}
    </div>
  );
}

// ---------------- Timeline: steps in order ----------------
export function TimelineView({ spec, t }: { spec: TimelineDiagram; t: number }) {
  const n = spec.steps.length;
  const at = Math.min(n - 1, Math.floor(t * (n + 0.6)));
  return (
    <div className="relative p-4" role="img" aria-label={`Steps: ${spec.steps.map((s) => s.label).join(' → ')}`}>
      <div className="grid gap-x-2 gap-y-4" style={{ gridTemplateColumns: `repeat(${Math.min(n, n > 4 ? 3 : 4)}, minmax(0, 1fr))` }}>
        {spec.steps.map((s, i) => {
          const on = i === at, past = i < at;
          return (
            <div key={s.label} className="flex flex-col items-center gap-1.5 text-center">
              <div className="relative flex w-full items-center justify-center">
                {i % (n > 4 ? 3 : 4) !== 0 && <span className={cx('absolute right-1/2 top-1/2 h-0.5 w-full -translate-y-1/2', past || on ? 'bg-red-hi' : 'bg-line-strong')} />}
                <motion.span animate={on ? { scale: [1, 1.12, 1] } : { scale: 1 }} transition={{ duration: 0.6 }}
                  className={cx('relative z-10 flex h-11 w-11 items-center justify-center rounded-md border-[1.5px] transition-colors',
                    on ? 'border-red bg-red-node text-red-hi shadow-glow-node' : past ? 'border-ink bg-sunk text-ink' : 'border-line-strong bg-sunk text-ink3')}>
                  {s.icon ? <Icon name={s.icon} size={20} /> : <span className="font-mono text-xs">{i + 1}</span>}
                </motion.span>
              </div>
              <span className={cx('text-[13px] font-bold leading-4', on && 'text-red-hi')}>{i + 1}. {s.label}</span>
              {s.sub && <span className="font-mono text-[9.5px] leading-3 text-ink2">{s.sub}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
