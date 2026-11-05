import { useMemo, useRef, useState } from 'react';
import Icon, { Diamond } from '../components/Icon.jsx';
import { TopBar } from '../components/ui.jsx';
import { BOSSES } from '../data/progress.js';
import { trackOf } from '../data/tracks.js';
import { useStore } from '../store.jsx';
import NotFound from './NotFound.jsx';

const BOX_W = 104, BOX_H = 44;

function ModelAnswer({ has, locked }) {
  // which parts of the model the learner already had
  const part = (x, y, w, label, key) => {
    const missed = key && !has[key];
    return (
      <g key={label}>
        <rect x={x} y={y} width={w} height={40} rx={10} fill={missed ? '#1A0D10' : '#0D0D12'} stroke={missed ? '#E5262D' : '#F5F5F7'} strokeWidth={1.5} style={{ filter: missed ? 'drop-shadow(0 0 6px rgba(229,38,45,.5))' : 'none' }} />
        <text x={x + w / 2} y={y + 25} textAnchor="middle" fill={missed ? '#FF4B52' : '#F5F5F7'} fontSize="13" fontWeight="700" fontFamily="Atkinson Hyperlegible, sans-serif">{label}</text>
      </g>
    );
  };
  return (
    <div style={{ position: 'relative', borderRadius: 12, border: '1px solid #23232D', background: '#0D0D12', overflow: 'hidden' }}>
      <svg viewBox="0 0 320 300" role="img" aria-label="Model answer: students go to a CDN for images and a load balancer for pages. The load balancer feeds 3 web servers. Web servers check a cache first, then read from 2 database replicas copied from the main database."
        style={{ display: 'block', width: '100%', height: 'auto', filter: locked ? 'blur(6px)' : 'none', transition: 'filter .3s' }}>
        <g fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M160 52V68M64 68H250M250 68V92M250 132V172M250 212V252" stroke="#F5F5F7" />
          <path d="M64 68V92M188 192H120M188 272H120" stroke="#FF4B52" />
          <path d="M246 88l4 5 4-5M246 168l4 5 4-5M246 248l4 5 4-5" stroke="#F5F5F7" />
          <path d="M60 88l4 5 4-5M124 188l-5 4 5 4M124 268l-5 4 5 4" stroke="#FF4B52" />
        </g>
        {part(106, 12, 108, 'Students')}
        {part(12, 92, 104, 'CDN', 'cdn')}
        {part(190, 92, 120, 'Load balancer', 'lb')}
        {part(12, 172, 104, 'Cache', 'cache')}
        {part(190, 172, 120, 'Web × 3', 'web')}
        {part(12, 252, 104, 'Replicas × 2', 'replica')}
        {part(190, 252, 120, 'Main DB')}
        <text x="132" y="186" fill="#FF4B52" fontSize="10" fontFamily="JetBrains Mono, monospace">1 CHECK</text>
        <text x="256" y="230" fill="#A3A3B0" fontSize="10" fontFamily="JetBrains Mono, monospace">2 IF MISS</text>
        <text x="138" y="266" fill="#FF4B52" fontSize="10" fontFamily="JetBrains Mono, monospace">COPY</text>
      </svg>
      {locked && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'rgba(11,11,15,.55)' }}>
          <Icon name="lock" size={28} />
          <b>Submit to unlock</b>
        </div>
      )}
    </div>
  );
}

export default function Boss({ id }) {
  const boss = BOSSES[id];
  const { addXP, finishStop, notify } = useStore();
  const area = useRef(null);
  const drag = useRef(null);
  const [boxes, setBoxes] = useState(() => (boss ? boss.start.map((b, i) => ({ ...b, id: `s${i}` })) : []));
  const [links, setLinks] = useState([['s0', 's1'], ['s1', 's2']]);
  const [sel, setSel] = useState(null);
  const [hints, setHints] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [beaten, setBeaten] = useState(false);

  const counts = useMemo(() => {
    const c = { web: 0, lb: 0, cache: 0, db: 0, replica: 0, cdn: 0, queue: 0, users: 0 };
    boxes.forEach((b) => { c[b.kind] = (c[b.kind] || 0) + 1; });
    return c;
  }, [boxes]);

  if (!boss) return <NotFound />;
  const track = trackOf(boss.track);
  const checks = boss.checks.map((c) => ({ ...c, ok: c.test(counts) }));
  const score = checks.filter((c) => c.ok).length;
  const firstOpen = checks.findIndex((c) => !c.ok);

  const add = (p) => {
    const n = boxes.filter((b) => b.kind === p.kind).length + 1;
    const label = p.kind === 'web' ? `Web ${n}` : n > 1 ? `${p.box} ${n}` : p.box;
    const nb = { id: `b${Date.now()}`, kind: p.kind, box: label, x: 0.15 + Math.random() * 0.7, y: 0.25 + Math.random() * 0.5, fresh: true };
    setBoxes((bs) => [...bs, nb]);
    setSel(nb.id);
  };
  const remove = () => {
    if (!sel) return;
    setBoxes((bs) => bs.filter((b) => b.id !== sel));
    setLinks((ls) => ls.filter(([a, b]) => a !== sel && b !== sel));
    setSel(null);
  };

  const onDown = (e, b) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { id: b.id, sx: e.clientX, sy: e.clientY, ox: b.x, oy: b.y, moved: false };
  };
  const onMove = (e) => {
    const d = drag.current; if (!d) return;
    const r = area.current.getBoundingClientRect();
    const dx = e.clientX - d.sx, dy = e.clientY - d.sy;
    if (Math.abs(dx) + Math.abs(dy) > 4) d.moved = true;
    if (!d.moved) return;
    const x = Math.min(1, Math.max(0, d.ox + dx / r.width));
    const y = Math.min(1, Math.max(0, d.oy + dy / r.height));
    setBoxes((bs) => bs.map((b) => (b.id === d.id ? { ...b, x, y, fresh: false } : b)));
  };
  const onUp = (b) => {
    const d = drag.current; drag.current = null;
    if (!d || d.moved) return;
    // tap: select, or link from selected → this
    if (sel && sel !== b.id) {
      setLinks((ls) => {
        const has = ls.some(([a, c]) => a === sel && c === b.id);
        return has ? ls.filter(([a, c]) => !(a === sel && c === b.id)) : [...ls, [sel, b.id]];
      });
      setSel(null);
    } else setSel(sel === b.id ? null : b.id);
  };

  const showHint = () => { if (hints < boss.hints.length) { setHints(hints + 1); addXP(-5); notify('Hint shown · −5 XP'); } };
  const submit = () => {
    setSubmitted(true);
    if (score >= 3 && !beaten) {
      finishStop(boss.id, Math.round((boss.xp * score) / 5), { trackCode: boss.track, scorePct: score * 20 });
      setBeaten(true);
    }
  };

  const pos = (b) => {
    const r = area.current?.getBoundingClientRect();
    const w = r?.width || 340, h = r?.height || 340;
    return [b.x * (w - BOX_W) + BOX_W / 2, b.y * (h - BOX_H) + BOX_H / 2];
  };

  const has = { cdn: counts.cdn > 0, lb: counts.lb > 0, cache: counts.cache > 0, web: counts.web >= 2, replica: counts.replica > 0 || counts.db >= 2 };

  return (
    <div className="page">
      <TopBar back={`#/map/${boss.track}`} backLabel="Back to map" icon="left" right={<span className="m red-text" style={{ fontSize: 12 }}>+{boss.xp} XP</span>}>
        <span className="label red">Boss · {track.code} {track.name}</span>
      </TopBar>

      <div className="boss-grid">
        <div className="stack g16">
          <section className="card xl red stack g12" style={{ position: 'relative', overflow: 'hidden', background: '#16161D' }}>
            <svg width="120" height="120" viewBox="0 0 14 14" aria-hidden="true" style={{ position: 'absolute', right: -28, top: -28, opacity: 0.14 }}><path d="M7 .5 13.5 7 7 13.5.5 7z" fill="#E5262D" /></svg>
            <Diamond state="next" size={30} />
            <h1 className="d" style={{ fontSize: 22, lineHeight: '28px' }}>{boss.title}</h1>
            <div className="stack" style={{ fontSize: 16, lineHeight: '23px' }}>
              {boss.task.map((l, i) => <p key={l} className={i === boss.task.length - 1 ? 't2' : ''}>{l}</p>)}
            </div>
            <div className="row wrap g6">{boss.tags.map((t) => <span key={t} className="tag">{t}</span>)}</div>
          </section>

          <section aria-label="Checklist" className="card stack g4">
            <div className="row between" style={{ height: 28 }}><span className="label">Checklist · live</span><span className="m" style={{ fontSize: 12 }}>{score}/{checks.length}</span></div>
            {checks.map((c, i) => (
              <div key={c.id} className={`check${c.ok ? ' ok' : ''}${i === firstOpen ? ' focus' : ''}`}>
                <span className="bx">{c.ok && <Icon name="check" size={14} stroke={3} />}</span>
                <span className="tx">{c.text}</span>
              </div>
            ))}
          </section>

          <section aria-label="Hints" className="card stack g10">
            <div className="row between" style={{ height: 28 }}><span className="label">Hints · one at a time</span><span className="m" style={{ fontSize: 12 }}>{hints}/{boss.hints.length}</span></div>
            {boss.hints.slice(0, hints).map((h, i) => (
              <div key={h} className="card callout row g10 fade-in" style={{ padding: 12, borderRadius: 12, alignItems: 'flex-start' }}>
                <span className="m" style={{ width: 24, height: 24, flex: 'none', borderRadius: 6, background: '#E5262D', color: '#fff', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</span>
                <p style={{ fontSize: 15, lineHeight: '21px' }}>{h}</p>
              </div>
            ))}
            {hints < boss.hints.length
              ? <button type="button" className="btn dashed" onClick={showHint}><Icon name="hint" size={16} color="#FF4B52" />Show hint {hints + 1} <span className="m t3" style={{ fontSize: 11 }}>−5 XP</span></button>
              : <button type="button" className="btn dashed" disabled>No hints left</button>}
          </section>
        </div>

        <div className="stack g16">
          <section aria-label="Sketch area" className="diagram">
            <div className="row g6" style={{ padding: 8, borderBottom: '1px solid #23232D', overflowX: 'auto' }}>
              <span className="label" style={{ flex: 'none', alignSelf: 'center', marginRight: 2 }}>Add:</span>
              {boss.palette.map((p) => (
                <button key={p.kind} type="button" className="tool" onClick={() => add(p)}><Icon name={p.icon} size={14} stroke={2} />{p.label}</button>
              ))}
            </div>
            <div className="sketch" ref={area} onPointerMove={onMove} onClick={(e) => { if (e.target === area.current) setSel(null); }}>
              <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} aria-hidden="true">
                <defs><marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#F5F5F7" /></marker></defs>
                {links.map(([a, b]) => {
                  const A = boxes.find((x) => x.id === a), B = boxes.find((x) => x.id === b);
                  if (!A || !B) return null;
                  const [x1, y1] = pos(A), [x2, y2] = pos(B);
                  const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1;
                  const k = Math.min(Math.abs((BOX_H / 2 + 4) / (dy / len || 1e-6)), Math.abs((BOX_W / 2 + 4) / (dx / len || 1e-6)));
                  return <line key={a + b} x1={x1 + (dx / len) * k} y1={y1 + (dy / len) * k} x2={x2 - (dx / len) * k} y2={y2 - (dy / len) * k} stroke="#F5F5F7" strokeWidth="1.5" markerEnd="url(#arr)" />;
                })}
              </svg>
              {boxes.map((b) => {
                const [cx, cy] = pos(b);
                return (
                  <button key={b.id} type="button" aria-pressed={sel === b.id} aria-label={`${b.box}. Drag to move. Tap, then tap another box to link.`}
                    className={`sk-box${b.fresh ? ' new' : ''}${sel === b.id ? ' sel' : ''}${drag.current?.id === b.id ? ' drag' : ''}`}
                    style={{ left: cx - BOX_W / 2, top: cy - BOX_H / 2, width: BOX_W }}
                    onPointerDown={(e) => onDown(e, b)} onPointerUp={() => onUp(b)}>
                    {b.kind === 'users' && <Icon name="users" size={16} stroke={2} />}
                    {(b.kind === 'db' || b.kind === 'replica') && <Icon name="db" size={16} stroke={2} />}
                    {b.box}
                  </button>
                );
              })}
              <span className="m t3" style={{ position: 'absolute', left: 12, bottom: 10, fontSize: 10, pointerEvents: 'none' }}>{boxes.length} BOXES · {links.length} ARROWS · TAP A BOX, THEN ANOTHER TO LINK</span>
              {sel && <button type="button" className="btn secondary small" style={{ position: 'absolute', right: 10, bottom: 8, height: 36, padding: '0 12px' }} onClick={remove}><Icon name="trash" size={16} />Remove</button>}
            </div>
          </section>

          {!submitted
            ? <button type="button" className="btn primary block" onClick={submit}>Submit design</button>
            : (
              <div role="status" className={`sheet ${score >= 3 ? 'ok' : 'bad'}`} style={{ animationDelay: '0s' }}>
                <span className="dot"><Icon name={score >= 3 ? 'check' : 'close'} size={20} stroke={3} /></span>
                <span className="flex1 stack g4">
                  <b className="d" style={{ color: score >= 3 ? '#2FD27F' : '#FF4B52' }}>{score >= 3 ? 'Boss beaten!' : 'Not yet. Need 3/5.'}</b>
                  <span>You got {score}/5 checks. Compare with the model below.</span>
                </span>
                {beaten && <span className="m" style={{ fontSize: 13 }}>+{Math.round((boss.xp * score) / 5)} XP</span>}
              </div>
            )}

          <section aria-label="Model answer" className="card xl stack g12">
            <div className="row between"><span className="label red">Model answer</span><span className="m t2" style={{ fontSize: 11 }}>YOU {score}/5 · MODEL 5/5</span></div>
            <ModelAnswer has={has} locked={!submitted} />
            <div className="row g14">
              <span className="m t2 row g6" style={{ fontSize: 11 }}><span style={{ width: 12, height: 12, border: '1.5px solid #E5262D', borderRadius: 3 }} />YOU MISSED</span>
              <span className="m t2 row g6" style={{ fontSize: 11 }}><span style={{ width: 12, height: 12, border: '1.5px solid #F5F5F7', borderRadius: 3 }} />YOU HAD</span>
            </div>
            <div className="stack" style={{ fontSize: 15, lineHeight: '22px' }}>{boss.model.map((l) => <p key={l}>{l}</p>)}</div>
            {submitted && <button type="button" className="btn secondary" onClick={() => setSubmitted(false)}>Try again with these ideas</button>}
          </section>
        </div>
      </div>
    </div>
  );
}
