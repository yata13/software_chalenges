import { useEffect, useRef, useState } from 'react';
import { PATHS } from '../components/Icon.jsx';

// ---------------------------------------------------------------
// Animated blueprint diagrams. One loop clock `t` (0..1) drives the
// moving packet AND the step chips, so labels stay in sync.
// ---------------------------------------------------------------

const reduced = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export function useLoop(duration, playKey, paused = false) {
  const [t, setT] = useState(reduced() ? 0.999 : 0);
  const start = useRef(0);
  useEffect(() => {
    if (reduced() || paused) return undefined;
    start.current = performance.now();
    let raf;
    const tick = (now) => {
      setT(((now - start.current) % duration) / duration);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [duration, playKey, paused]);
  return t;
}

// Interpolate keyframes [{t, p:[x,y]}] at time t.
function along(keys, t) {
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i], b = keys[i + 1];
    if (t >= a.t && t <= b.t) {
      const f = b.t === a.t ? 0 : (t - a.t) / (b.t - a.t);
      return [a.p[0] + (b.p[0] - a.p[0]) * f, a.p[1] + (b.p[1] - a.p[1]) * f];
    }
  }
  return keys[keys.length - 1].p;
}
const stepFrom = (bounds) => (t) => { let s = 0; bounds.forEach((b, i) => { if (t >= b) s = i; }); return s; };

// Icon inside SVG
function I({ name, x, y, s = 24, red }) {
  return <svg x={x - s / 2} y={y - s / 2} width={s} height={s} viewBox="0 0 24 24"><path className={`ico${red ? ' r' : ''}`} d={PATHS[name]} /></svg>;
}
function Node({ x, y, w, h, hot, off, label, sub, icon, r = 12, fs = 11 }) {
  return (
    <g>
      <rect className={`node${hot ? ' hot' : ''}${off ? ' off' : ''}`} x={x - w / 2} y={y - h / 2} width={w} height={h} rx={r} />
      {icon && <I name={icon} x={x} y={y} red={hot} />}
      {label && !icon && <text x={x} y={y + 4} textAnchor="middle" className={`lbl w`} style={{ fontSize: fs }}>{label}</text>}
      {sub && <text x={x} y={y + h / 2 + 15} textAnchor="middle" className={`lbl${hot ? ' r' : ''}`}>{sub}</text>}
    </g>
  );
}
function Corners({ w, h }) {
  const c = 8, l = 10;
  return <path className="corner" d={`M${c} ${c}h${l}M${c} ${c}v${l}M${w - c} ${c}h-${l}M${w - c} ${c}v${l}M${c} ${h - c}h${l}M${c} ${h - c}v-${l}M${w - c} ${h - c}h-${l}M${w - c} ${h - c}v-${l}`} />;
}
function Packet({ p, r = 6 }) {
  return (
    <g>
      <circle cx={p[0]} cy={p[1]} r={r + 4} fill="rgba(229,38,45,.25)" />
      <circle cx={p[0]} cy={p[1]} r={r} className="pkt" />
    </g>
  );
}

// ---------------- DNS ----------------
const dnsKeys = [
  { t: 0, p: [52, 115] }, { t: 0.2, p: [150, 115] }, { t: 0.25, p: [150, 115] },
  { t: 0.33, p: [225, 115] }, { t: 0.37, p: [225, 45] }, { t: 0.41, p: [262, 45] }, { t: 0.45, p: [225, 45] }, { t: 0.49, p: [150, 115] },
  { t: 0.53, p: [225, 115] }, { t: 0.58, p: [262, 115] }, { t: 0.63, p: [225, 115] }, { t: 0.69, p: [150, 115] },
  { t: 0.73, p: [225, 115] }, { t: 0.76, p: [225, 185] }, { t: 0.79, p: [262, 185] }, { t: 0.82, p: [225, 185] }, { t: 0.85, p: [225, 115] }, { t: 0.88, p: [150, 115] },
  { t: 0.96, p: [52, 115] }, { t: 1, p: [52, 115] },
];
function DnsSvg({ t }) {
  const step = DIAGRAMS.dns.stepAt(t);
  const p = along(dnsKeys.map((k) => ({ t: k.t, p: k.p })), t);
  const ans = t > 0.9;
  return (
    <svg className="dg" viewBox="0 0 360 230" role="img" aria-label="Your phone asks a resolver. The resolver asks root, .com and the name server, then sends the IP back.">
      <Corners w={360} h={230} />
      <path className="wire" d="M68 115H114M186 115H225M225 45V185M225 45H262M225 115H262M225 185H262" />
      <path className="wire sig" d="M68 115H114" style={{ opacity: step === 0 ? 1 : 0, transition: 'opacity .3s' }} />
      <Node x={40} y={115} w={52} h={52} icon="phone" sub="YOU" />
      <Node x={150} y={115} w={72} h={52} icon="globe" hot sub="RESOLVER" />
      <Node x={305} y={45} w={86} h={38} label=". ROOT" hot={step === 1} r={10} />
      <Node x={305} y={115} w={86} h={38} label=".com TLD" hot={step === 2} r={10} />
      <Node x={305} y={185} w={86} h={38} label="NAME SRV" hot={step === 3 && !ans} r={10} />
      {step === 1 && <text x={305} y={78} textAnchor="middle" className="lbl">“ask .com”</text>}
      {step === 2 && <text x={305} y={148} textAnchor="middle" className="lbl">“ask NAME SRV”</text>}
      <text x={14} y={24} className="lbl">example.com → ?</text>
      <g style={{ opacity: ans ? 1 : 0, transition: 'opacity .3s' }}>
        <rect x={14} y={58} width={82} height={20} rx={5} fill="#E5262D" />
        <text x={55} y={72} textAnchor="middle" className="lbl w">203.0.113.7</text>
      </g>
      <Packet p={p} />
    </svg>
  );
}

// ---------------- CPU vs GPU ----------------
function CpuGpuSvg({ t }) {
  const step = DIAGRAMS.cpugpu.stepAt(t);
  // CPU: cores finish 4 big jobs one after another; GPU: whole grid lights in waves.
  const cpuP = Math.min(1, Math.max(0, (t - 0.15) / 0.4));
  const gpuP = Math.min(1, Math.max(0, (t - 0.5) / 0.3));
  const cols = 16, rows = 9;
  return (
    <svg className="dg" viewBox="0 0 360 230" role="img" aria-label="CPU: four big cores. GPU: a grid of many tiny cores working at once.">
      <Corners w={360} h={230} />
      <text x={20} y={28} className="lbl r big">CPU</text>
      <text x={20} y={42} className="lbl">FEW BIG CORES</text>
      {[0, 1, 2, 3].map((i) => {
        const x = 20 + (i % 2) * 70, y = 56 + Math.floor(i / 2) * 70;
        const f = Math.min(1, Math.max(0, cpuP * 4 - i));
        return (
          <g key={i}>
            <rect className={`node${f > 0 && f < 1 ? ' hot' : ''}`} x={x} y={y} width={60} height={60} rx={8} />
            <rect x={x + 8} y={y + 44} width={44} height={6} rx={3} fill="#262631" />
            <rect x={x + 8} y={y + 44} width={44 * f} height={6} rx={3} fill={f >= 1 ? '#F5F5F7' : '#E5262D'} />
            <text x={x + 30} y={y + 28} textAnchor="middle" className="lbl w">CORE {i + 1}</text>
          </g>
        );
      })}
      <text x={180} y={124} textAnchor="middle" className="lbl">VS</text>
      <text x={200} y={28} className="lbl r big">GPU</text>
      <text x={200} y={42} className="lbl">THOUSANDS OF TINY CORES</text>
      <rect x={198} y={54} width={146} height={130} rx={8} className="node" />
      {Array.from({ length: cols * rows }, (_, k) => {
        const c = k % cols, r = Math.floor(k / cols);
        const wave = gpuP * (cols + 4) - c;
        const on = wave > 0 && wave < 4;
        const doneC = gpuP >= 1 || wave >= 4;
        return <rect key={k} x={204 + c * 8.6} y={60 + r * 13.4} width={6} height={9} rx={1.5}
          fill={on ? '#FF4B52' : doneC && gpuP > 0 ? '#F5F5F7' : '#2B2B36'} />;
      })}
      <text x={75} y={210} textAnchor="middle" className={`lbl${step === 1 ? ' r' : ''}`}>1 hard job, fast</text>
      <text x={271} y={210} textAnchor="middle" className={`lbl${step === 2 ? ' r' : ''}`}>many easy jobs at once</text>
    </svg>
  );
}

// ---------------- Load balancer ----------------
function LbSvg({ t }) {
  const step = DIAGRAMS.lb.stepAt(t);
  const down = t > 0.62;
  const servers = [45, 115, 185];
  const pkts = [0, 1, 2, 3, 4, 5].map((i) => {
    const local = (t * 6 + i / 2) % 1;
    const alive = down ? [0, 1] : [0, 1, 2];
    const target = servers[alive[i % alive.length]];
    const keys = [{ t: 0, p: [58, 115] }, { t: 0.4, p: [146, 115] }, { t: 0.55, p: [214, 115] }, { t: 0.7, p: [214, target] }, { t: 1, p: [262, target] }];
    return along(keys, local);
  });
  const pct = down ? ['50%', '50%', '0%'] : ['33%', '33%', '33%'];
  return (
    <svg className="dg" viewBox="0 0 360 230" role="img" aria-label="Users send requests to one load balancer. It splits them across 3 servers. When server 3 fails its health check, the others take its users.">
      <Corners w={360} h={230} />
      <path className="wire sig" d="M66 115H118M178 115H214" />
      <path className="wire sig" d="M214 115V45H262M214 115H262" />
      <path className={`wire ${down ? 'dead' : 'sig'}`} d="M214 115V185H262" />
      <Node x={40} y={115} w={52} h={52} icon="users" sub="USERS" />
      <Node x={148} y={115} w={60} h={52} icon="network" hot sub="LOAD BAL." />
      {servers.map((y, i) => (
        <g key={y}>
          <Node x={300} y={y} w={76} h={40} label={`Server ${i + 1}`} off={i === 2 && down} r={10} />
          <text x={240} y={y - 6} textAnchor="middle" className={`lbl${i === 2 && down ? '' : ' r'}`}>{pct[i]}</text>
        </g>
      ))}
      {pkts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r={4} className="pkt" />)}
      <text x={300} y={222} textAnchor="middle" className={`lbl${down ? ' r' : ''}`} style={{ opacity: down ? 1 : 0, transition: 'opacity .3s' }}>health check failed</text>
      <text x={14} y={24} className={`lbl${step === 0 ? ' r' : ''}`}>one address, many servers</text>
    </svg>
  );
}

// ---------------- Neural network ----------------
const NN = [[50, 85, 120, 155, 190], [70, 105, 140, 175], [70, 105, 140, 175], [85, 120, 155]];
const NNX = [110, 185, 255, 320];
const STRONG = new Set(['0-1-1', '0-2-0', '1-1-2', '1-0-0', '2-0-0', '2-2-0']);
function NeuralSvg({ t }) {
  const wave = t * 5 - 0.3; // which layer is lit
  const inputs = ['has a link', 'says “FREE”', 'unknown sender', 'ALL CAPS', 'short text'];
  const outs = ['Spam 92%', 'Promo 6%', 'Normal 2%'];
  return (
    <svg className="dg" viewBox="0 0 360 230" role="img" aria-label="Neural network: input clues on the left, two hidden layers, three output scores on the right. Spam scores 92 percent.">
      <Corners w={360} h={230} />
      {NN.slice(0, -1).map((col, l) => col.map((y1, a) => NN[l + 1].map((y2, b) => {
        const strong = STRONG.has(`${l}-${a % 3}-${b % 3}`) && (a + b) % 2 === 0;
        const lit = wave > l + 0.5 && wave < l + 1.6;
        return <line key={`${l}-${a}-${b}`} x1={NNX[l]} y1={y1} x2={NNX[l + 1]} y2={y2}
          stroke={strong ? '#FF4B52' : '#F5F5F7'} strokeOpacity={strong ? (lit ? 1 : 0.6) : lit ? 0.35 : 0.12} strokeWidth={strong ? 1.6 : 1} />;
      })))}
      {NN.map((col, l) => col.map((y, i) => {
        const lit = wave > l && wave < l + 1.2;
        const win = l === 3 && i === 0 && wave > 3;
        return <circle key={`${l}-${i}`} cx={NNX[l]} cy={y} r={l === 3 ? 8 : 7}
          fill={lit || win ? '#E5262D' : '#0D0D12'} stroke={lit || win ? '#FFB3B6' : '#F5F5F7'} strokeWidth={1.5}
          style={{ filter: lit || win ? 'drop-shadow(0 0 6px #E5262D)' : 'none' }} />;
      }))}
      {inputs.map((s, i) => <text key={s} x={96} y={NN[0][i] + 3} textAnchor="end" className="lbl" style={{ fontSize: 9 }}>{s}</text>)}
      {outs.map((s, i) => <text key={s} x={334} y={NN[3][i] + 3} className={`lbl${i === 0 && wave > 3 ? ' r' : ''}`} style={{ fontSize: 9 }}>{s}</text>)}
      {['INPUT', 'HIDDEN', 'HIDDEN', 'OUTPUT'].map((s, i) => <text key={i} x={NNX[i]} y={24} textAnchor="middle" className={`lbl${Math.floor(wave) === i ? ' r' : ''}`} style={{ fontSize: 9 }}>{s}</text>)}
    </svg>
  );
}

// ---------------- LLM next token ----------------
function LlmSvg({ t }) {
  const step = DIAGRAMS.llm.stepAt(t);
  const toks = ['The', 'capital', 'of', 'Ethiopia', 'is'];
  const readN = Math.min(toks.length, Math.floor((t / 0.25) * toks.length) + 1);
  const grow = Math.min(1, Math.max(0, (t - 0.25) / 0.25));
  const scores = [['Addis', 92], ['a', 3], ['the', 2], ['located', 1]];
  const added = t > 0.75;
  let x = 16;
  const pos = toks.map((w) => { const p = x; x += w.length * 7 + 18; return p; });
  return (
    <svg className="dg" viewBox="0 0 360 230" role="img" aria-label="The LLM reads the tokens 'The capital of Ethiopia is', scores every next token, picks Addis at 92 percent, adds it, and repeats.">
      <Corners w={360} h={230} />
      <text x={16} y={26} className="lbl">INPUT TOKENS</text>
      {toks.map((w, i) => {
        const lit = step === 0 ? i < readN : true;
        return (
          <g key={w}>
            <rect x={pos[i]} y={36} width={w.length * 7 + 12} height={26} rx={6} fill="#0D0D12" stroke={lit ? '#F5F5F7' : '#4A4A58'} strokeWidth={1.5} />
            <text x={pos[i] + 6} y={53} className="lbl w" style={{ fontSize: 11 }}>{w}</text>
          </g>
        );
      })}
      <rect x={x} y={36} width={56} height={26} rx={6} fill={added ? '#E5262D' : 'none'} stroke="#FF4B52" strokeWidth={1.5} strokeDasharray={added ? '0' : '4 3'} />
      <text x={x + 28} y={53} textAnchor="middle" className={`lbl ${added ? 'w' : 'r'}`} style={{ fontSize: 11 }}>{added ? 'Addis' : 'NEXT?'}</text>
      <path className="wire" d="M180 68V86" />
      <rect className="node hot" x={110} y={86} width={140} height={30} rx={8} />
      <text x={180} y={105} textAnchor="middle" className="lbl r" style={{ fontSize: 11 }}>LLM · scores every token</text>
      <text x={16} y={138} className="lbl">NEXT-TOKEN SCORES</text>
      {scores.map(([w, v], i) => {
        const y = 148 + i * 18;
        const pick = i === 0 && step >= 2;
        return (
          <g key={w}>
            <text x={16} y={y + 10} className={`lbl${pick ? ' r' : ' w'}`}>{w}</text>
            <rect x={80} y={y + 1} width={220} height={10} rx={3} fill="#1A1A22" />
            <rect x={80} y={y + 1} width={Math.max(2, 2.2 * v * grow)} height={10} rx={3} fill={i === 0 ? '#E5262D' : '#F5F5F7'} style={{ filter: pick ? 'drop-shadow(0 0 6px #E5262D)' : 'none' }} />
            <text x={344} y={y + 10} textAnchor="end" className="lbl">{Math.round(v * grow)}%</text>
          </g>
        );
      })}
    </svg>
  );
}

// ---------------- RAG ----------------
const ragTop = [['Your docs', 'doc'], ['Chunks', 'queue'], ['Embed', 'spark'], ['Vector DB', 'db']];
const ragBot = [['Question', 'users'], ['Search', 'search'], ['Prompt', 'doc'], ['LLM', 'ai'], ['Answer', 'check']];
function RagSvg({ t }) {
  const step = DIAGRAMS.rag.stepAt(t);
  const tx = (i) => 40 + i * 93, bx = (i) => 36 + i * 72;
  const keys = [
    { t: 0, p: [tx(0), 70] }, { t: 0.15, p: [tx(1), 70] }, { t: 0.3, p: [tx(2), 70] }, { t: 0.42, p: [tx(3), 70] },
    { t: 0.46, p: [bx(0), 168] }, { t: 0.56, p: [bx(1), 168] }, { t: 0.62, p: [bx(1), 110] }, { t: 0.66, p: [bx(1), 168] },
    { t: 0.76, p: [bx(2), 168] }, { t: 0.88, p: [bx(3), 168] }, { t: 1, p: [bx(4), 168] },
  ];
  const p = along(keys, t);
  const hotTop = Math.min(3, Math.floor(t / 0.12));
  return (
    <svg className="dg" viewBox="0 0 360 230" role="img" aria-label="RAG: once, split your docs into chunks, embed them, store in a vector DB. Every question: search the DB, add the top chunks to the prompt, the LLM writes an answer with sources.">
      <Corners w={360} h={230} />
      <text x={16} y={30} className={`lbl${t < 0.44 ? ' r' : ''}`}>ONCE · BUILD THE INDEX</text>
      <text x={16} y={132} className={`lbl${t >= 0.44 ? ' r' : ''}`}>EVERY QUESTION</text>
      <path className="wire" d={`M${tx(0) + 24} 70H${tx(3) - 24}`} />
      <path className="wire" d={`M${bx(0) + 22} 168H${bx(4) - 22}`} />
      <path className={`wire ${step === 2 ? 'sig' : 'ans'}`} d={`M${bx(1)} 146V96 Q${bx(1)} 88 ${bx(1) + 10} 88 H${tx(3) - 26}`} />
      <text x={bx(1) + 8} y={124} className="lbl" style={{ fontSize: 9 }}>search by meaning</text>
      {ragTop.map(([n, ic], i) => (
        <g key={n}>
          <rect className={`node${t < 0.44 && hotTop === i ? ' hot' : ''}`} x={tx(i) - 24} y={46} width={48} height={48} rx={10} />
          <I name={ic} x={tx(i)} y={70} s={22} red={t < 0.44 && hotTop === i} />
          <text x={tx(i)} y={110} textAnchor="middle" className="lbl" style={{ fontSize: 9 }}>{n}</text>
        </g>
      ))}
      {ragBot.map(([n, ic], i) => {
        const hot = t >= 0.44 && Math.abs(p[0] - bx(i)) < 14 && p[1] > 150;
        return (
          <g key={n}>
            <rect className={`node${hot || (i === 4 && t > 0.97) ? ' hot' : ''}`} x={bx(i) - 22} y={146} width={44} height={44} rx={10} />
            <I name={ic} x={bx(i)} y={168} s={20} red={hot} />
            <text x={bx(i)} y={206} textAnchor="middle" className="lbl" style={{ fontSize: 9 }}>{n}</text>
          </g>
        );
      })}
      <Packet p={p} r={5} />
    </svg>
  );
}

export const DIAGRAMS = {
  dns: { Svg: DnsSvg, dur: 8000, stepAt: stepFrom([0, 0.25, 0.5, 0.7]) },
  cpugpu: { Svg: CpuGpuSvg, dur: 7000, stepAt: stepFrom([0, 0.15, 0.5, 0.82]) },
  lb: { Svg: LbSvg, dur: 9000, stepAt: stepFrom([0, 0.15, 0.35, 0.62]) },
  neural: { Svg: NeuralSvg, dur: 6000, stepAt: (t) => Math.min(3, Math.max(0, Math.floor(t * 5 - 0.3))) },
  llm: { Svg: LlmSvg, dur: 7000, stepAt: stepFrom([0, 0.25, 0.5, 0.75]) },
  rag: { Svg: RagSvg, dur: 9000, stepAt: stepFrom([0, 0.15, 0.46, 0.76]) },
};

// Self-running diagram (own clock)
export function LiveDiagram({ kind, playKey, paused }) {
  const d = DIAGRAMS[kind];
  const t = useLoop(d.dur, playKey, paused);
  return <d.Svg t={t} />;
}
