import { useEffect, useMemo, useRef, useState } from 'react';
import Icon from '../components/Icon.jsx';
import Answer, { KEYS, answerState } from '../components/Answer.jsx';
import { Ring, Stat, TopBar } from '../components/ui.jsx';
import { WhySheet } from './Quiz.jsx';
import { PRACTICE_POOL } from '../data/library.js';
import { trackOf } from '../data/tracks.js';
import { useStore } from '../store.jsx';

const MODES = {
  quick: { name: 'Quick 5', sub: '5 mixed questions · 2 min', icon: 'practice', count: 5, perQ: 30 },
  weak: { name: 'Weak spots', sub: 'From your 3 lowest tracks', icon: 'hint', count: 5, perQ: 30 },
  speed: { name: 'Speed round', sub: '60 seconds, as many as you can', icon: 'timer', count: 15, total: 60 },
};

const shuffle = (a) => { const x = [...a]; for (let i = x.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [x[i], x[j]] = [x[j], x[i]]; } return x; };
const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`;
function starsFor(mode, right, n, secs) {
  if (mode === 'speed') return right >= 10 ? 3 : right >= 6 ? 2 : right >= 3 ? 1 : 0;
  if (right === n && secs < 90) return 3;
  return right >= n - 1 ? 2 : right >= 2 ? 1 : 0;
}

export function Stars({ n, size = 48 }) {
  const d = 'M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z';
  return (
    <div className="row g10" style={{ alignItems: 'flex-end', height: size + 16 }} role="img" aria-label={`${n} of 3 stars`}>
      {[0, 1, 2].map((i) => {
        const on = i < n, big = i === 1;
        const sz = big ? size + 12 : size;
        return (
          <svg key={i} className="pop" width={sz} height={sz} viewBox="0 0 24 24" aria-hidden="true" style={{ animationDelay: `${i * 0.15}s`, filter: on ? 'drop-shadow(0 0 10px rgba(229,38,45,.8))' : 'none' }}>
            <path d={d} fill={on ? '#E5262D' : 'none'} stroke={on ? '#FFB3B6' : '#4A4A58'} strokeWidth={on ? 0.8 : 1.4} strokeLinejoin="round" />
          </svg>
        );
      })}
    </div>
  );
}

export function PracticeHub() {
  const { s } = useStore();
  return (
    <div className="page narrow">
      <div className="stack g6">
        <span className="label">Keep it fresh</span>
        <h1 className="d display-xl">Practice</h1>
      </div>
      <section aria-label="Modes" className="stack g10">
        {Object.entries(MODES).map(([k, m], i) => (
          <a key={k} href={`#/practice/${k}`} className="card row g14" style={{ color: '#F5F5F7', borderColor: i === 0 ? '#7A1E22' : undefined, background: i === 0 ? '#1A1014' : undefined }}>
            <span style={{ width: 44, height: 44, flex: 'none', borderRadius: 12, background: i === 0 ? '#E5262D' : 'transparent', border: i === 0 ? 0 : '1px solid #2B2B36', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={m.icon} color={i === 0 ? '#fff' : '#F5F5F7'} /></span>
            <span className="flex1 stack g4"><b style={{ fontSize: 16 }}>{m.name}</b><span className="t2" style={{ fontSize: 14 }}>{m.sub}</span></span>
            <Icon name="right" color="#868694" />
          </a>
        ))}
      </section>
      <section aria-label="Recent runs" className="card stack g4">
        <div className="row between" style={{ height: 28 }}><span className="label">Recent runs</span><span className="label">★★★ = 5/5 under 90s</span></div>
        {s.runs.length === 0 && <p className="t2" style={{ padding: '8px 0' }}>No runs yet. Start a Quick 5.</p>}
        {s.runs.map((r, i) => (
          <div key={i} className="row g12" style={{ height: 44, borderTop: i ? '1px solid #23232D' : 0 }}>
            <span className="m t3" style={{ width: 40, fontSize: 11 }}>{r.day}</span>
            <span className="flex1" style={{ fontWeight: 700 }}>{r.score}/{r.of || 5}</span>
            <span className="m t2" style={{ fontSize: 12 }}>{fmt(r.secs)}</span>
            <span className="m red-text" style={{ width: 44, textAlign: 'right' }}>{'★'.repeat(r.stars)}<span style={{ color: '#4A4A58' }}>{'★'.repeat(3 - r.stars)}</span></span>
          </div>
        ))}
      </section>
    </div>
  );
}

export function PracticeRun({ mode = 'quick' }) {
  const m = MODES[mode] || MODES.quick;
  const { s, finishRun } = useStore();
  const [runKey, setRunKey] = useState(0);
  const questions = useMemo(() => {
    let pool = PRACTICE_POOL;
    if (mode === 'weak') {
      const weak = Object.entries(s.skills).sort((a, b) => a[1] - b[1]).slice(0, 3).map(([k]) => k);
      const w = pool.filter((q) => weak.includes(q.track));
      pool = w.length >= m.count ? w : [...w, ...shuffle(pool.filter((q) => !weak.includes(q.track)))];
    }
    return shuffle(pool).slice(0, m.count);
  }, [mode, runKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const [qi, setQi] = useState(0);
  const [picked, setPicked] = useState(null);
  const [log, setLog] = useState([]);
  const [left, setLeft] = useState(m.total || m.perQ);
  const [elapsed, setElapsed] = useState(0);
  const [over, setOver] = useState(null);
  const qStart = useRef(Date.now());
  const runStart = useRef(Date.now());

  // countdown
  useEffect(() => {
    if (over) return undefined;
    const id = setInterval(() => {
      setElapsed((Date.now() - runStart.current) / 1000);
      if (m.total) setLeft(Math.max(0, m.total - (Date.now() - runStart.current) / 1000));
      else if (picked == null) setLeft(Math.max(0, m.perQ - (Date.now() - qStart.current) / 1000));
    }, 200);
    return () => clearInterval(id);
  }, [over, picked, m]);

  const end = (finalLog) => {
    const secs = Math.round((Date.now() - runStart.current) / 1000);
    const right = finalLog.filter((x) => x.ok).length;
    const n = mode === 'speed' ? finalLog.length : questions.length;
    const stars = starsFor(mode, right, n, secs);
    const xp = finalLog.reduce((a, x) => a + (x.ok ? 8 + (x.secs <= 10 ? 2 : 0) : 0), 0);
    finishRun({ score: right, of: n, secs, stars }, xp);
    setOver({ right, n, secs, stars, xp, log: finalLog });
  };

  const record = (i) => {
    const q = questions[qi];
    const secs = Math.round((Date.now() - qStart.current) / 1000);
    const entry = { q: q.q, ok: i === q.answer, secs, skipped: i == null };
    const nl = [...log, entry];
    setLog(nl);
    setPicked(i == null ? -1 : i);
    return nl;
  };

  // time ran out
  useEffect(() => {
    if (over || left > 0) return;
    if (m.total) end(picked == null ? log : log);
    else if (picked == null) record(null);
  }, [left]); // eslint-disable-line react-hooks/exhaustive-deps

  const next = () => {
    if (qi + 1 >= questions.length || (m.total && left <= 0)) { end(log); return; }
    setQi(qi + 1); setPicked(null); qStart.current = Date.now();
    if (!m.total) setLeft(m.perQ);
  };
  const again = () => {
    setRunKey((k) => k + 1); setQi(0); setPicked(null); setLog([]); setOver(null);
    setLeft(m.total || m.perQ); qStart.current = Date.now(); runStart.current = Date.now();
  };

  if (over) {
    return (
      <div className="page narrow">
        <div className="stack g8" style={{ alignItems: 'center', textAlign: 'center' }}>
          <Stars n={over.stars} />
          <span className="label">Run complete</span>
          <div className="d" style={{ fontSize: 52, lineHeight: '56px', fontWeight: 700 }}>{over.right}<span style={{ color: '#4A4A58' }}>/{over.n}</span></div>
          <span className="t2" style={{ fontSize: 15 }}>{over.stars === 3 ? 'Perfect run. 3 stars!' : mode === 'speed' ? 'Faster = more stars.' : over.right === over.n ? 'All right! Under 90s = 3 stars.' : 'One more right = more stars.'}</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 8 }}>
          <Stat label="TIME" value={fmt(over.secs)} />
          <Stat label="XP" value={`+${over.xp}`} red />
          <Stat label="STREAK" value={<>{s.streak} <span className="m t2" style={{ fontSize: 11, fontWeight: 400 }}>days</span></>} />
        </div>
        <section aria-label="Answers" className="card" style={{ padding: '6px 14px' }}>
          {over.log.map((x, i) => (
            <div key={i} className="row g12" style={{ minHeight: 42, borderTop: i ? '1px solid #23232D' : 0 }}>
              {x.ok ? <Icon name="check" size={18} stroke={2.6} color="#2FD27F" label="Correct" /> : <Icon name="close" size={18} stroke={2.6} color="#FF4B52" label={x.skipped ? 'Skipped' : 'Wrong'} />}
              <span className="flex1" style={{ fontSize: 15, fontWeight: x.ok ? 400 : 700 }}>{x.q}</span>
              <span className="m t3" style={{ fontSize: 11 }}>{x.secs}s</span>
            </div>
          ))}
        </section>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
          <a href="#/practice" className="btn secondary">All modes</a>
          <button type="button" className="btn primary" onClick={again}><Icon name="replay" size={16} stroke={2.2} />Play again</button>
        </div>
      </div>
    );
  }

  const q = questions[qi];
  const track = trackOf(q.track);
  const isPic = q.type === 'pic';
  const total = m.total || m.perQ;

  return (
    <div className="page narrow">
      <TopBar back="#/practice" backLabel="End practice" right={
        <Ring size={72} stroke={6} value={left / total} label={`${Math.ceil(left)} seconds left`}>
          <span className="d" style={{ fontSize: 18, lineHeight: '20px' }}>{Math.ceil(left)}</span>
          <span className="m t2" style={{ fontSize: 9 }}>SEC</span>
        </Ring>
      }>
        <div className="stack g4"><span className="label red">{m.name} · mixed</span><span className="t2" style={{ fontSize: 14 }}>Question {qi + 1}{mode === 'speed' ? '' : ` of ${questions.length}`} · {fmt(elapsed)}</span></div>
      </TopBar>

      {mode !== 'speed' && (
        <div aria-label="Run progress" style={{ display: 'grid', gridTemplateColumns: `repeat(${questions.length}, minmax(0, 1fr))`, gap: 6 }}>
          {questions.map((_, i) => {
            const r = log[i];
            if (r) return <span key={i} style={{ height: 32, borderRadius: 8, background: r.ok ? 'rgba(47,210,127,.14)' : 'rgba(229,38,45,.14)', border: `1px solid ${r.ok ? '#2FD27F' : '#E5262D'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={r.ok ? 'check' : 'close'} size={13} stroke={3} color={r.ok ? '#2FD27F' : '#FF4B52'} label={r.ok ? 'Correct' : 'Wrong'} /></span>;
            return <span key={i} className="m" style={{ height: 32, borderRadius: 8, border: i === qi ? '2px solid #F5F5F7' : '1px solid #2B2B36', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: i === qi ? '#F5F5F7' : '#868694' }}>{i + 1}</span>;
          })}
        </div>
      )}

      <div className="stack g8">
        <span className="label">From {track.code} {track.name}</span>
        <h1 className="d display-l">{q.q}</h1>
      </div>

      <div className={`answers${isPic ? ' pics' : ''}`} key={`${runKey}-${qi}`}>
        {q.options.map((o, i) => (
          <Answer key={i} k={KEYS[i]} option={o} state={picked === -1 ? (i === q.answer ? 'correct' : 'dim') : answerState(i, picked, q.answer)} disabled={picked != null} onPick={() => record(i)} />
        ))}
      </div>

      {picked != null
        ? <WhySheet ok={picked === q.answer} q={q} picked={picked} onNext={next} nextLabel={qi + 1 >= questions.length ? 'See score' : 'Next question'} />
        : (
          <div className="row between">
            <span className="label">Answer in 10s → +2 bonus XP</span>
            <button type="button" className="btn secondary small" onClick={() => record(null)}>Skip</button>
          </div>
        )}
    </div>
  );
}
