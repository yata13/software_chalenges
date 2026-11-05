import { useEffect, useLayoutEffect, useMemo, useRef, useState, type PointerEvent, type ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button, Diamond, Icon, IconButton, Tag, cx } from '../components/ui';
import type { IconName } from '../components/icons';
import FlowDiagram from '../diagrams/FlowDiagram';
import { useLoop } from '../diagrams/clock';
import { getBoss, getTrack } from '../content';
import { XP_BOSS, actions, useProgress } from '../store/progress';
import NotFound from './NotFound';

interface Box { id: string; label: string; icon: IconName; x: number; y: number; fresh?: boolean }
const BH = 44;

function useWide() {
  const q = '(min-width: 900px)';
  const [wide, setWide] = useState(() => window.matchMedia(q).matches);
  useEffect(() => { const m = window.matchMedia(q); const f = () => setWide(m.matches); m.addEventListener('change', f); return () => m.removeEventListener('change', f); }, []);
  return wide;
}
const PASS = 4;

function ModelAnswer({ spec, locked }: { spec: Parameters<typeof FlowDiagram>[0]['spec']; locked: boolean }) {
  const t = useLoop(Math.max(5, spec.route.length * 1.1));
  return (
    <div className="grid-bg relative overflow-hidden rounded-md border border-line-soft bg-sunk">
      <div style={{ filter: locked ? 'blur(6px)' : 'none', transition: 'filter .3s' }}><FlowDiagram spec={spec} t={t} /></div>
      {locked && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-bg0/55">
          <Icon name="lock" size={28} /><b>Submit to unlock</b>
        </div>
      )}
    </div>
  );
}

export default function Boss() {
  const { id = '' } = useParams();
  const boss = getBoss(id);
  const p = useProgress();
  const area = useRef<HTMLDivElement>(null);
  const drag = useRef<{ id: string; sx: number; sy: number; ox: number; oy: number; moved: boolean } | null>(null);
  const [boxes, setBoxes] = useState<Box[]>(() => (boss?.start ?? []).map((label, i, arr) => ({ id: `s${i}`, label, icon: 'users' as IconName, x: arr.length === 1 ? 0.5 : 0.25 + (i * 0.5) / (arr.length - 1), y: 0.08 })));
  const [links, setLinks] = useState<[string, string][]>([]);
  const [sel, setSel] = useState<string | null>(null);
  const [hints, setHints] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [gotXp, setGotXp] = useState(0);
  const [areaW, setAreaW] = useState(340);
  const wide = useWide();
  useLayoutEffect(() => {
    const el = area.current; if (!el) return;
    const ro = new ResizeObserver(() => setAreaW(el.clientWidth)); ro.observe(el); setAreaW(el.clientWidth);
    return () => ro.disconnect();
  }, [wide]);
  const BW = Math.min(128, Math.floor((areaW - 24) / 3));

  const labels = useMemo(() => new Set(boxes.map((b) => b.label)), [boxes]);
  if (!boss) return <NotFound />;
  const track = getTrack(boss.track)!;
  const checks = boss.checks.map((c) => ({ ...c, ok: (c.needs.length === 0 || c.needs.some((n) => labels.has(n))) && !(c.avoid ?? []).some((a) => labels.has(a)) }));
  const score = checks.filter((c) => c.ok).length;
  const firstOpen = checks.findIndex((c) => !c.ok);
  const beaten = p.doneBosses.includes(boss.id);

  const add = (label: string, icon: IconName) => {
    if (labels.has(label)) { setSel(boxes.find((b) => b.label === label)!.id); return; }
    // first free slot in a 3-column grid under the start row
    const slots = Array.from({ length: 12 }, (_, k) => ({ x: [0.02, 0.5, 0.98][k % 3], y: 0.3 + Math.floor(k / 3) * 0.22 }));
    const free = slots.find((sl) => !boxes.some((b) => Math.abs(b.x - sl.x) < 0.2 && Math.abs(b.y - sl.y) < 0.12)) ?? { x: 0.5, y: 0.5 };
    const nb: Box = { id: `b${Date.now()}`, label, icon, ...free, fresh: true };
    setBoxes((bs) => [...bs, nb]);
    setSel(nb.id);
  };
  const remove = () => {
    if (!sel) return;
    setBoxes((bs) => bs.filter((b) => b.id !== sel));
    setLinks((ls) => ls.filter(([a, b]) => a !== sel && b !== sel));
    setSel(null);
  };
  const center = (b: Box) => {
    const r = area.current?.getBoundingClientRect();
    const w = r?.width ?? 340, h = r?.height ?? 360;
    return [b.x * (w - BW) + BW / 2, b.y * (h - BH) + BH / 2];
  };
  const down = (e: PointerEvent, b: Box) => {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { id: b.id, sx: e.clientX, sy: e.clientY, ox: b.x, oy: b.y, moved: false };
  };
  const move = (e: PointerEvent) => {
    const d = drag.current; if (!d || !area.current) return;
    const r = area.current.getBoundingClientRect();
    const dx = e.clientX - d.sx, dy = e.clientY - d.sy;
    if (Math.abs(dx) + Math.abs(dy) > 5) d.moved = true;
    if (!d.moved) return;
    const x = Math.min(1, Math.max(0, d.ox + dx / (r.width - BW)));
    const y = Math.min(1, Math.max(0, d.oy + dy / (r.height - BH)));
    setBoxes((bs) => bs.map((b) => (b.id === d.id ? { ...b, x, y, fresh: false } : b)));
  };
  const up = (b: Box) => {
    const d = drag.current; drag.current = null;
    if (!d || d.moved) return;
    if (sel && sel !== b.id) { // tap a 2nd box: link (or unlink)
      setLinks((ls) => (ls.some(([x, y]) => x === sel && y === b.id) ? ls.filter(([x, y]) => !(x === sel && y === b.id)) : [...ls, [sel, b.id]]));
      setSel(null);
    } else setSel(sel === b.id ? null : b.id);
  };
  const submit = () => {
    setSubmitted(true);
    if (score >= PASS) setGotXp(actions.finishBoss(boss.id));
  };

  const parts: Record<'task' | 'check' | 'hints' | 'sketch' | 'submit' | 'model', ReactNode> = {
    task: (
          <section className="relative flex flex-col gap-3 overflow-hidden rounded-xl border border-red-line bg-surface p-[18px]">
            <svg width="120" height="120" viewBox="0 0 14 14" aria-hidden className="absolute -right-7 -top-7 opacity-[.14]"><path d="M7 .5 13.5 7 7 13.5.5 7z" fill="#E5262D" /></svg>
            <Diamond state="next" size={28} />
            <h1 className="m-0 font-display text-[22px] font-semibold leading-7">{boss.title}</h1>
            <div className="flex flex-col leading-[23px]">{boss.task.map((l, i) => <p key={l} className={cx('m-0', i === boss.task.length - 1 && 'text-ink2')}>{l}</p>)}</div>
            <div className="flex flex-wrap gap-1.5">{boss.tags.map((t) => <Tag key={t}>{t}</Tag>)}</div>
            {beaten && <span className="font-mono text-[11px] text-green">✓ BEATEN BEFORE</span>}
          </section>
    ),
    check: (
          <section aria-label="Checklist" className="card flex flex-col gap-1">
            <div className="flex h-7 items-center justify-between"><span className="label">Checklist · live</span><span className="font-mono text-xs">{score}/{checks.length}</span></div>
            {checks.map((c, i) => (
              <div key={c.text} className="flex min-h-10 items-center gap-3 text-[15px] leading-[21px]">
                <motion.span animate={c.ok ? { scale: [1, 1.25, 1] } : {}} className={cx('flex h-[22px] w-[22px] flex-none items-center justify-center rounded-[6px] border-[1.5px]', c.ok ? 'border-ink bg-ink text-bg0' : i === firstOpen ? 'border-red-hi' : 'border-muted')}>
                  {c.ok && <Icon name="check" size={14} stroke={3} />}
                </motion.span>
                <span className={cx(c.ok && 'text-ink2 line-through')}>{c.text}</span>
              </div>
            ))}
          </section>
    ),
    hints: (
          <section aria-label="Hints" className="card flex flex-col gap-2.5">
            <div className="flex h-7 items-center justify-between"><span className="label">Hints · one at a time</span><span className="font-mono text-xs">{hints}/{boss.hints.length}</span></div>
            {boss.hints.slice(0, hints).map((h, i) => (
              <motion.div key={h} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-2.5 rounded-md border border-[#5A2226] bg-red-node p-3">
                <span className="flex h-6 w-6 flex-none items-center justify-center rounded-[6px] bg-red font-mono text-[11px] text-white">{i + 1}</span>
                <p className="m-0 text-[15px] leading-[21px]">{h}</p>
              </motion.div>
            ))}
            {hints < boss.hints.length
              ? <Button variant="dashed" small onClick={() => setHints(hints + 1)}><Icon name="hint" size={16} color="#FF4B52" />Show hint {hints + 1}</Button>
              : <Button variant="dashed" small disabled>No hints left</Button>}
          </section>
    ),
    sketch: (
          <section aria-label="Sketch area" className="overflow-hidden rounded-lg border border-line bg-sunk">
            <div className="no-scrollbar flex gap-1.5 overflow-x-auto border-b border-line-soft p-2">
              <span className="label flex-none self-center pr-1">Add:</span>
              {boss.blocks.map((b) => (
                <button key={b.label} type="button" aria-pressed={labels.has(b.label)} onClick={() => add(b.label, b.icon)}
                  className={cx('flex h-9 flex-none items-center gap-1.5 rounded-sm border px-2.5 font-mono text-[11px]', labels.has(b.label) ? 'border-red bg-red text-white' : 'border-line bg-surface hover:border-red-hi')}>
                  <Icon name={b.icon} size={14} stroke={2} />{b.label}
                </button>
              ))}
            </div>
            <div ref={area} onPointerMove={move} onClick={(e) => { if (e.target === area.current) setSel(null); }}
              className="relative h-[380px] touch-none lg:h-[460px]"
              style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px)', backgroundSize: '16px 16px' }}>
              <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
                <defs><marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#F5F5F7" /></marker></defs>
                {links.map(([a, b]) => {
                  const A = boxes.find((x) => x.id === a), B = boxes.find((x) => x.id === b);
                  if (!A || !B) return null;
                  const [x1, y1] = center(A), [x2, y2] = center(B);
                  const dx = x2 - x1, dy = y2 - y1;
                  const k = Math.min(dx ? (BW / 2 + 4) / Math.abs(dx) : 9, dy ? (BH / 2 + 4) / Math.abs(dy) : 9);
                  return <line key={a + b} x1={x1 + dx * k} y1={y1 + dy * k} x2={x2 - dx * k} y2={y2 - dy * k} stroke="#F5F5F7" strokeWidth={1.5} markerEnd="url(#arr)" />;
                })}
              </svg>
              {boxes.map((b) => {
                const [cx0, cy0] = center(b);
                return (
                  <motion.button key={b.id} type="button" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    aria-pressed={sel === b.id} aria-label={`${b.label}. Drag to move. Tap it, then tap another box to draw an arrow.`}
                    onPointerDown={(e) => down(e, b)} onPointerUp={() => up(b)}
                    style={{ left: cx0 - BW / 2, top: cy0 - BH / 2, width: BW, height: BH }}
                    className={cx('absolute flex touch-none select-none items-center justify-center gap-1.5 rounded-[10px] border-[1.5px] px-2 text-center text-[12px] font-bold leading-[14px]',
                      b.fresh ? 'border-dashed border-red-hi bg-red/[.12] text-red-hi' : 'border-ink bg-sunk',
                      sel === b.id && 'border-red shadow-[0_0_0_3px_rgba(229,38,45,.3)]')}>
                    {b.label}
                  </motion.button>
                );
              })}
              <span className="pointer-events-none absolute bottom-2.5 left-3 right-28 font-mono text-[10px] text-ink3">{boxes.length} BOXES · {links.length} ARROWS · TAP A BOX, THEN ANOTHER, TO LINK</span>
              {sel && <button type="button" onClick={remove} className="absolute bottom-2 right-2.5 flex h-9 items-center gap-1.5 rounded-sm border border-line-strong bg-surface px-3 text-sm"><Icon name="trash" size={16} />Remove</button>}
            </div>
          </section>
    ),
    submit: (
      <>
          {!submitted
            ? <Button block onClick={submit}>Submit design · need {PASS}/{checks.length}</Button>
            : (
              <motion.div role="status" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className={cx('flex flex-wrap items-center gap-4 rounded-xl border-[1.5px] p-4', score >= PASS ? 'border-green bg-green-sheet' : 'border-red bg-red-sheet')}>
                <span className={cx('flex h-11 w-11 flex-none items-center justify-center rounded-full', score >= PASS ? 'bg-green text-green-ink' : 'bg-red text-white')}><Icon name={score >= PASS ? 'check' : 'close'} size={20} stroke={3} /></span>
                <span className="flex flex-1 flex-col gap-0.5">
                  <b className={cx('font-display', score >= PASS ? 'text-green' : 'text-red-hi')}>{score >= PASS ? 'Boss beaten!' : `Not yet: ${score}/${checks.length}. Need ${PASS}.`}</b>
                  <span className="text-[15px]">Compare with the model answer below.</span>
                </span>
                {gotXp > 0 && <span className="font-mono text-sm font-bold">+{gotXp} XP</span>}
              </motion.div>
            )}
      </>
    ),
    model: (
          <section aria-label="Model answer" className="card flex flex-col gap-3 rounded-xl">
            <div className="flex items-center justify-between"><span className="label !text-red-hi">Model answer</span><span className="font-mono text-[11px] text-ink2">YOU {score}/{checks.length}</span></div>
            <ModelAnswer spec={boss.model} locked={!submitted} />
            <div className="flex flex-col text-[15px] leading-[22px]">{boss.modelNotes.map((l) => <p key={l} className="m-0">{l}</p>)}</div>
            {submitted && <Button variant="secondary" onClick={() => setSubmitted(false)}>Try again with these ideas</Button>}
          </section>
    ),
  };

  return (
    <div className="mx-auto flex max-w-[1120px] flex-col gap-5">
      <div className="flex min-h-11 items-center gap-3">
        <IconButton icon="left" label="Back to map" to={`/map?track=${boss.track}`} />
        <span className="label flex-1 !text-red-hi">Boss · T{track.n} {track.name}</span>
        <span className="font-mono text-xs text-red-hi">+{XP_BOSS} XP</span>
      </div>

      {wide ? (
        <div className="grid grid-cols-[minmax(300px,1fr)_minmax(0,1.6fr)] items-start gap-5">
          <div className="flex min-w-0 flex-col gap-4">{parts.task}{parts.check}{parts.hints}</div>
          <div className="flex min-w-0 flex-col gap-4">{parts.sketch}{parts.submit}{parts.model}</div>
        </div>
      ) : (
        <>{parts.task}{parts.sketch}{parts.check}{parts.submit}{parts.hints}{parts.model}</>
      )}
    </div>
  );
}
