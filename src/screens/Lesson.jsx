import { useEffect, useRef, useState } from 'react';
import Icon from '../components/Icon.jsx';
import { DiagramFrame, Rich, WordCallout, AmharicToggle, Segments, TopBar } from '../components/ui.jsx';
import { DIAGRAMS, useLoop } from '../diagrams/index.jsx';
import { LESSONS } from '../data/lessons.js';
import { trackOf } from '../data/tracks.js';
import { useStore } from '../store.jsx';
import NotFound from './NotFound.jsx';

function Mini({ parts }) {
  return (
    <div className="mini" aria-hidden="true">
      {parts.map((p, i) => {
        if (p.arrow) return <svg key={i} width="24" height="10" viewBox="0 0 24 10"><path d="M0 5h20M16 1l4 4-4 4" fill="none" stroke="#FF4B52" strokeWidth="1.6" /></svg>;
        if (p.box) return <span key={i} className={`mini-box${p.r ? ' r' : ''}${p.dash ? ' dash' : ''}`}>{p.box}</span>;
        if (p.icon) return <span key={i} style={{ width: 40, height: 40, flex: 'none', borderRadius: 10, border: `1.5px solid ${p.r ? '#E5262D' : '#F5F5F7'}`, background: p.r ? '#1A0D10' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={p.icon} color={p.r ? '#FF4B52' : '#F5F5F7'} /></span>;
        if (p.ok) return <Icon key={i} name="check" size={22} stroke={2.4} color="#2FD27F" />;
        if (p.grid) return <svg key={i} width="150" height="44" viewBox="0 0 150 44">{Array.from({ length: 64 }, (_, k) => <rect key={k} x={(k % 16) * 9.4} y={Math.floor(k / 16) * 11} width="6" height="8" rx="1" fill={k % 5 === 0 ? '#FF4B52' : '#F5F5F7'} />)}</svg>;
        if (p.dots) return <span key={i} className="stack g4">{Array.from({ length: p.dots }, (_, k) => <span key={k} style={{ width: 10, height: 10, borderRadius: '50%', border: '1.5px solid #F5F5F7' }} />)}</span>;
        if (p.line) return <span key={i} style={{ width: 28, height: p.line === 'r' ? 3 : 1, background: p.line === 'r' ? '#FF4B52' : '#F5F5F7', boxShadow: p.line === 'r' ? '0 0 6px #E5262D' : 'none' }} />;
        return <span key={i} className="m t2" style={{ fontSize: 11, whiteSpace: 'nowrap' }}>{p.text}</span>;
      })}
    </div>
  );
}

export default function Lesson({ id }) {
  const lesson = LESSONS[id];
  const { s, setLessonCard, toggleAm } = useStore();
  const [play, setPlay] = useState(0);
  const [word, setWord] = useState(null);
  const [idx, setIdx] = useState(() => Math.min(s.lessonCard[id] ?? 0, (lesson?.cards.length ?? 1) - 1));
  const rail = useRef(null);
  const d = lesson ? DIAGRAMS[lesson.diagram] : DIAGRAMS.dns;
  const t = useLoop(d.dur, play);

  useEffect(() => { if (lesson) setLessonCard(id, idx); }, [idx]); // eslint-disable-line react-hooks/exhaustive-deps

  // keep rail scroll and index in sync (swipe or buttons)
  const scrollTo = (i) => {
    const el = rail.current?.children[i];
    if (el) rail.current.scrollTo({ left: el.offsetLeft - rail.current.offsetLeft - 2, behavior: 'smooth' });
    setIdx(i);
  };
  useEffect(() => {
    const el = rail.current?.children[idx];
    if (el) rail.current.scrollLeft = el.offsetLeft - rail.current.offsetLeft - 2;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const onScroll = () => {
    const r = rail.current; if (!r) return;
    const kids = [...r.children];
    let best = 0, bestD = Infinity;
    kids.forEach((k, i) => { const dd = Math.abs(k.offsetLeft - r.offsetLeft - r.scrollLeft); if (dd < bestD) { bestD = dd; best = i; } });
    if (r.scrollLeft + r.clientWidth >= r.scrollWidth - 4) best = kids.length - 1;
    if (best !== idx) setIdx(best);
  };

  if (!lesson) return <NotFound />;
  const track = trackOf(lesson.track);
  const n = lesson.cards.length;
  const last = idx === n - 1;
  const step = d.stepAt(t);

  return (
    <div className="page">
      <TopBar back="#/" backLabel="Close lesson" right={<span className="m red-text" style={{ fontSize: 12 }}>+{lesson.xp} XP</span>}>
        <Segments count={n} at={idx} label="Lesson progress" />
      </TopBar>

      <div className="stack g6">
        <span className="label red">{track.code} {track.name} · Lesson {lesson.id}</span>
        <h1 className="d display-l">{lesson.title}</h1>
      </div>

      <div className="lesson-grid">
        <div className="stack g16 sticky">
          <DiagramFrame title={lesson.fig} steps={lesson.steps} step={step} onReplay={() => setPlay((x) => x + 1)} label={`Animated diagram: ${lesson.title}`}>
            <d.Svg t={t} />
          </DiagramFrame>
          <section aria-label="Real-world example" className="card row g14" style={{ alignItems: 'flex-start' }}>
            <span className="icon-btn" style={{ background: 'transparent' }} aria-hidden="true"><Icon name={lesson.example.icon} size={22} /></span>
            <div className="stack g4">
              <span className="label red">Real world</span>
              <p style={{ fontSize: 16, lineHeight: '22px', fontWeight: 700 }}>{lesson.example.title}</p>
              <p className="t2" style={{ fontSize: 15, lineHeight: '21px' }}>{lesson.example.text}</p>
            </div>
          </section>
        </div>

        <div className="stack g18" style={{ gap: 18 }}>
          <section aria-label="Lesson cards" className="stack g12">
            <div className="row between">
              <span className="label">Card {idx + 1} / {n} · swipe</span>
              <div className="row g8">
                <button type="button" className="icon-btn" aria-label="Previous card" disabled={idx === 0} onClick={() => scrollTo(Math.max(0, idx - 1))}><Icon name="left" size={18} stroke={2} /></button>
                <button type="button" className="icon-btn" aria-label="Next card" disabled={last} onClick={() => scrollTo(Math.min(n - 1, idx + 1))}><Icon name="right" size={18} stroke={2} /></button>
              </div>
            </div>
            <div className="swipe" ref={rail} onScroll={onScroll}>
              {lesson.cards.map((c, i) => (
                <article key={i} className={`lcard${i === idx ? ' on' : ''}`} aria-label={`Card ${i + 1}`}>
                  <Mini parts={c.mini} />
                  <div className="stack g4">
                    <p className="body-l"><Rich text={c.a} onWord={setWord} /></p>
                    <p className="t2" style={{ fontSize: 15, lineHeight: '21px' }}><Rich text={c.b} onWord={setWord} /></p>
                  </div>
                </article>
              ))}
            </div>
            <div className="dots">
              {lesson.cards.map((_, i) => <button key={i} type="button" aria-label={`Go to card ${i + 1}`} className={i === idx ? 'on' : ''} onClick={() => scrollTo(i)} />)}
            </div>
          </section>

          <section aria-label="Key words" className="stack g10">
            <span className="label">Key words · tap to explain</span>
            <div className="row wrap g8">
              {lesson.words.map((w) => (
                <button key={w.term} type="button" className="chip" aria-pressed={word?.toLowerCase() === w.term.toLowerCase()} onClick={() => setWord(word === w.term ? null : w.term)}>{w.term}</button>
              ))}
            </div>
            <WordCallout term={word} words={lesson.words} />
          </section>

          <AmharicToggle am={lesson.am} en={lesson.en} on={s.am} onToggle={toggleAm} />

          <div className="fixed-cta">
            {last
              ? <a href={`#/quiz/${lesson.id}`} className="btn primary block">Start quiz · {lesson.quiz.length} questions</a>
              : <button type="button" className="btn primary block" onClick={() => scrollTo(idx + 1)}>Next card<Icon name="arrow" size={18} stroke={2} /></button>}
          </div>
        </div>
      </div>
    </div>
  );
}
