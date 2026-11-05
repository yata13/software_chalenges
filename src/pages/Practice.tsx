import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button, Icon, IconButton, KEYS, LinkButton, PageTitle, ProgressRing, QuizAnswer, Stat, WhySheet, answerState, cx } from '../components/ui';
import { ALL_LESSONS, getTrack, type Lesson } from '../content';
import { actions, streakOf, useProgress } from '../store/progress';

const COUNT = 5;
const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
const starsFor = (right: number, secs: number) => (right === COUNT && secs < 90 ? 3 : right >= COUNT - 1 ? 2 : right >= 2 ? 1 : 0);
function shuffle<T>(a: T[]) { const x = [...a]; for (let i = x.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [x[i], x[j]] = [x[j], x[i]]; } return x; }

export function Stars({ n }: { n: number }) {
  return (
    <div className="flex h-[72px] items-end gap-2.5" role="img" aria-label={`${n} of 3 stars`}>
      {[0, 1, 2].map((i) => {
        const on = i < n, sz = i === 1 ? 60 : 48;
        return (
          <motion.svg key={i} width={sz} height={sz} viewBox="0 0 24 24" initial={{ scale: 0 }} animate={{ scale: [0, 1.15, 1] }} transition={{ delay: i * 0.15, duration: 0.5 }}
            style={{ filter: on ? 'drop-shadow(0 0 10px rgba(229,38,45,.8))' : 'none' }} aria-hidden>
            <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" fill={on ? '#E5262D' : 'none'} stroke={on ? '#FFB3B6' : '#4A4A58'} strokeWidth={on ? 0.8 : 1.4} strokeLinejoin="round" />
          </motion.svg>
        );
      })}
    </div>
  );
}

export default function Practice({ run }: { run?: boolean }) {
  const p = useProgress();
  const finished = ALL_LESSONS.filter((l) => p.doneLessons.includes(l.id));
  if (!run) return <Hub finished={finished} />;
  if (finished.length === 0) return <Empty />;
  return <Run finished={finished} />;
}

function Empty() {
  return (
    <div className="mx-auto flex max-w-[640px] flex-col items-center gap-4 pt-10 text-center">
      <Icon name="practice" size={40} color="#FF4B52" />
      <h1 className="m-0 font-display text-2xl font-semibold">Finish a lesson first</h1>
      <p className="m-0 text-ink2">Practice uses questions from lessons you finished.</p>
      <LinkButton to="/">Go to my next lesson</LinkButton>
    </div>
  );
}

function Hub({ finished }: { finished: Lesson[] }) {
  const p = useProgress();
  const pool = finished.reduce((n, l) => n + l.quiz.length, 0);
  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-5">
      <PageTitle label="Keep it fresh" title="Practice" />
      <Link to="/practice/run" className="flex items-center gap-3.5 rounded-lg border border-red-line bg-[#1A1014] p-4">
        <span className="flex h-11 w-11 flex-none items-center justify-center rounded-md bg-red"><Icon name="practice" color="#fff" /></span>
        <span className="flex flex-1 flex-col gap-1"><b>Quick 5</b><span className="text-sm text-ink2">5 random questions · {pool} in your pool from {finished.length} lessons</span></span>
        <Icon name="right" color="#868694" />
      </Link>
      <section aria-label="Recent runs" className="card flex flex-col gap-1">
        <div className="flex h-7 items-center justify-between"><span className="label">Recent runs</span><span className="label">★★★ = 5/5 under 90s</span></div>
        {p.runs.length === 0 && <p className="m-0 py-2 text-ink2">No runs yet.</p>}
        {p.runs.map((r, i) => (
          <div key={i} className={cx('flex h-11 items-center gap-3', i > 0 && 'border-t border-line-soft')}>
            <span className="w-24 font-mono text-[11px] text-ink3">{r.date}</span>
            <span className="flex-1 font-bold">{r.score}/{r.of}</span>
            <span className="font-mono text-xs text-ink2">{fmt(r.secs)}</span>
            <span className="w-12 text-right font-mono text-red-hi">{'★'.repeat(r.stars)}<span className="text-muted">{'★'.repeat(3 - r.stars)}</span></span>
          </div>
        ))}
      </section>
    </div>
  );
}

function Run({ finished }: { finished: Lesson[] }) {
  const p = useProgress();
  const [key, setKey] = useState(0);
  const questions = useMemo(() => shuffle(finished.flatMap((l) => l.quiz.map((q) => ({ ...q, track: l.track })))).slice(0, COUNT), [key]); // eslint-disable-line react-hooks/exhaustive-deps
  const [qi, setQi] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [log, setLog] = useState<{ q: string; ok: boolean; secs: number }[]>([]);
  const [over, setOver] = useState<null | { right: number; secs: number; stars: number; xp: number }>(null);
  const [now, setNow] = useState(Date.now());
  const start = useRef(Date.now());
  const qStart = useRef(Date.now());

  useEffect(() => { if (over) return; const t = setInterval(() => setNow(Date.now()), 250); return () => clearInterval(t); }, [over]);
  const elapsed = (now - start.current) / 1000;

  const q = questions[qi];
  const n = questions.length;

  const pick = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    const ok = i === q.answer;
    actions.practiceAnswer(ok);
    setLog((l) => [...l, { q: q.q, ok, secs: Math.round((Date.now() - qStart.current) / 1000) }]);
  };
  const next = () => {
    if (qi + 1 < n) { setQi(qi + 1); setPicked(null); qStart.current = Date.now(); return; }
    const secs = Math.round((Date.now() - start.current) / 1000);
    const right = log.filter((x) => x.ok).length;
    const stars = starsFor(right, secs);
    actions.saveRun({ score: right, of: n, secs, stars });
    setOver({ right, secs, stars, xp: right * 10 });
  };
  const again = () => { setKey((k) => k + 1); setQi(0); setPicked(null); setLog([]); setOver(null); start.current = Date.now(); qStart.current = Date.now(); };

  if (over) {
    return (
      <div className="mx-auto flex max-w-[640px] flex-col gap-4">
        <div className="flex flex-col items-center gap-2 text-center">
          <Stars n={over.stars} />
          <span className="label">Run complete</span>
          <div className="font-display text-[52px] font-bold leading-[56px]">{over.right}<span className="text-muted">/{n}</span></div>
          <span className="text-[15px] text-ink2">{over.stars === 3 ? 'Perfect run. 3 stars!' : over.right === n ? 'All right! Under 90s = 3 stars.' : 'One more right = more stars.'}</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Stat label="TIME" value={fmt(over.secs)} />
          <Stat label="XP" value={`+${over.xp}`} red />
          <Stat label="STREAK" value={<>{streakOf(p.days)} <span className="font-mono text-[11px] font-normal text-ink2">days</span></>} />
        </div>
        <section aria-label="Answers" className="card px-3.5 py-1.5">
          {log.map((x, i) => (
            <div key={i} className={cx('flex min-h-[42px] items-center gap-3', i > 0 && 'border-t border-line-soft')}>
              <Icon name={x.ok ? 'check' : 'close'} size={18} stroke={2.6} color={x.ok ? '#2FD27F' : '#FF4B52'} label={x.ok ? 'Correct' : 'Wrong'} />
              <span className={cx('flex-1 text-[15px]', !x.ok && 'font-bold')}>{x.q}</span>
              <span className="font-mono text-[11px] text-ink3">{x.secs}s</span>
            </div>
          ))}
        </section>
        <div className="grid grid-cols-2 gap-2.5">
          <LinkButton to="/practice" variant="secondary">Done</LinkButton>
          <Button onClick={again}><Icon name="replay" size={16} stroke={2.2} />Play again</Button>
        </div>
      </div>
    );
  }

  const track = getTrack(q.track)!;
  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-5">
      <div className="flex items-center gap-3">
        <IconButton icon="close" label="End practice" to="/practice" />
        <div className="flex flex-1 flex-col gap-0.5"><span className="label !text-red-hi">Quick 5 · mixed</span><span className="text-sm text-ink2">Question {qi + 1} of {n}</span></div>
        <ProgressRing size={72} stroke={6} value={Math.min(1, elapsed / 90)} label={`${Math.floor(elapsed)} seconds`}>
          <span className="font-display text-lg font-semibold leading-5">{fmt(elapsed)}</span>
          <span className="font-mono text-[9px] text-ink2">/ 1:30</span>
        </ProgressRing>
      </div>
      <div aria-label="Run progress" className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}>
        {questions.map((_, i) => {
          const r = log[i];
          if (r) return <span key={i} className={cx('flex h-8 items-center justify-center rounded-sm border', r.ok ? 'border-green bg-green/15' : 'border-red bg-red/15')}><Icon name={r.ok ? 'check' : 'close'} size={13} stroke={3} color={r.ok ? '#2FD27F' : '#FF4B52'} label={r.ok ? 'Correct' : 'Wrong'} /></span>;
          return <span key={i} className={cx('flex h-8 items-center justify-center rounded-sm font-mono text-xs', i === qi ? 'border-2 border-ink' : 'border border-line text-ink3')}>{i + 1}</span>;
        })}
      </div>
      <div className="flex flex-col gap-2">
        <span className="label">From T{track.n} {track.name}</span>
        <h1 className="m-0 font-display text-2xl font-semibold leading-8">{q.q}</h1>
      </div>
      <div key={`${key}-${qi}`} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {q.options.map((o, i) => <QuizAnswer key={i} k={KEYS[i]} text={o} state={answerState(i, picked, q.answer)} onPick={() => pick(i)} />)}
      </div>
      {picked !== null && <WhySheet ok={picked === q.answer} answer={`${KEYS[q.answer]} · ${q.options[q.answer]}`} why={q.why} xp={10} next={next} nextLabel={qi + 1 < n ? 'Next question' : 'See score'} />}
    </div>
  );
}
