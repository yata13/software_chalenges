import { useState } from 'react';
import Icon from '../components/Icon.jsx';
import Answer, { KEYS, answerState } from '../components/Answer.jsx';
import { Bar, TopBar } from '../components/ui.jsx';
import { LESSONS } from '../data/lessons.js';
import { trackOf } from '../data/tracks.js';
import { useStore } from '../store.jsx';
import NotFound from './NotFound.jsx';

export function WhySheet({ ok, q, picked, onNext, nextLabel, xp }) {
  const why = ok ? q.why : (q.wrong?.[picked] || q.why);
  const ans = typeof q.options[q.answer] === 'object' ? KEYS[q.answer] : q.options[q.answer];
  return (
    <section role="status" className={`sheet ${ok ? 'ok' : 'bad'}`}>
      <span className="dot"><Icon name={ok ? 'check' : 'close'} size={ok ? 22 : 18} stroke={3} /></span>
      <div className="stack g4" style={{ flex: '1 1 240px' }}>
        <span className="d title" style={{ color: ok ? '#2FD27F' : '#FF4B52' }}>
          {ok ? 'Correct!' : `Not quite. Answer: ${ans}`}{ok && xp ? <span className="m" style={{ fontSize: 13, fontWeight: 400, marginLeft: 8 }}>+{xp} XP</span> : null}
        </span>
        <span style={{ fontSize: 17, lineHeight: '24px' }}><span className="label" style={{ marginRight: 8 }}>Why</span>{why}</span>
      </div>
      <button type="button" className={`btn ${ok ? 'green' : 'primary'}`} onClick={onNext} autoFocus>{nextLabel}</button>
    </section>
  );
}

export default function Quiz({ id }) {
  const lesson = LESSONS[id];
  const { s, finishStop } = useStore();
  const [qi, setQi] = useState(0);
  const [picked, setPicked] = useState(null);
  const [right, setRight] = useState(0);
  const [over, setOver] = useState(false);
  const [wasDone] = useState(() => s.done.includes(id));

  if (!lesson) return <NotFound />;
  const track = trackOf(lesson.track);
  const qs = lesson.quiz;
  const q = qs[qi];
  const isPic = q.type === 'pic';
  const ok = picked === q.answer;

  const pick = (i) => {
    if (picked != null) return;
    setPicked(i);
    if (i === q.answer) setRight((r) => r + 1);
  };
  const next = () => {
    if (qi + 1 < qs.length) { setQi(qi + 1); setPicked(null); return; }
    const pct = Math.round((right / qs.length) * 100);
    finishStop(id, lesson.xp + right * 10, { trackCode: lesson.track, scorePct: pct, perfect: right === qs.length });
    setOver(true);
  };

  if (over) {
    const earned = wasDone ? Math.round((lesson.xp + right * 10) / 4) : lesson.xp + right * 10;
    return (
      <div className="page narrow">
        <div className="stack g12 fade-in" style={{ alignItems: 'center', textAlign: 'center', paddingTop: 24 }}>
          <span className="label red">Lesson {lesson.id} complete</span>
          <div className="d" style={{ fontSize: 52, lineHeight: '56px', fontWeight: 700 }}>{right}<span style={{ color: '#4A4A58' }}>/{qs.length}</span></div>
          <p className="t2">{right === qs.length ? 'Perfect score. You own this one.' : 'Good. Review the cards to get them all.'}</p>
          <span className="pill pop" style={{ height: 40, fontSize: 16 }}><b className="m">+{earned} XP</b></span>
        </div>
        <div className="grid-auto" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(220px, 100%), 1fr))', gap: 10 }}>
          <a href={`#/lesson/${lesson.id}`} className="btn secondary">Review cards</a>
          <a href="#/map" className="btn primary">Back to map<Icon name="arrow" size={18} stroke={2} /></a>
        </div>
      </div>
    );
  }

  return (
    <div className="page narrow">
      <TopBar back={`#/lesson/${lesson.id}`} backLabel="Quit quiz" right={<span className="m t2" style={{ fontSize: 13 }}>{qi + 1}/{qs.length}</span>}>
        <Bar pct={((qi + (picked != null ? 1 : 0)) / qs.length) * 100} label="Quiz progress" />
      </TopBar>

      <div className="stack g8">
        <span className="label red">{isPic ? 'Picture question' : 'Question'} · {track.code} {track.short}</span>
        <h1 className="d display-l">{q.q}</h1>
      </div>

      <div className={`answers${isPic ? ' pics' : ''}`} key={qi}>
        {q.options.map((o, i) => (
          <Answer key={i} k={KEYS[i]} option={o} state={answerState(i, picked, q.answer)} disabled={picked != null} onPick={() => pick(i)} />
        ))}
      </div>

      {picked != null
        ? <WhySheet ok={ok} q={q} picked={picked} xp={10} onNext={next} nextLabel={qi + 1 < qs.length ? (ok ? 'Next question' : 'Got it') : 'Finish'} />
        : <p className="label">Pick one {isPic ? 'picture' : 'answer'}</p>}
    </div>
  );
}
