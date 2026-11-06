import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AmharicToggle, Button, Chip, Icon, IconButton, LinkButton, Rich, Segments, WordCallout, cx } from '../components/ui';
import Diagram from '../diagrams/Diagram';
import { getLesson, getTrack, lessonNum } from '../content';
import { STAGE_LABEL } from '../content/types';
import { actions, useProgress } from '../store/progress';
import NotFound from './NotFound';

const GAP = 12;

export default function Lesson() {
  const { id = '' } = useParams();
  const lesson = getLesson(id);
  const p = useProgress();
  const [idx, setIdx] = useState(() => Math.min(p.lastCard[id] ?? 0, (lesson?.cards.length ?? 1) - 1));
  const [word, setWord] = useState<string | null>(null);
  const [notes, setNotes] = useState(false);
  const rail = useRef<HTMLDivElement>(null);
  const [cardW, setCardW] = useState(300);

  useLayoutEffect(() => {
    const el = rail.current; if (!el) return;
    const fit = () => setCardW(Math.min(320, Math.round(el.clientWidth * 0.86)));
    fit();
    const ro = new ResizeObserver(fit); ro.observe(el);
    return () => ro.disconnect();
  }, []);
  useEffect(() => { if (lesson) actions.setCard(lesson.id, idx); }, [idx, lesson]);

  if (!lesson) return <NotFound />;
  const track = getTrack(lesson.track)!;
  const n = lesson.cards.length;
  const last = idx === n - 1;
  const go = (i: number) => setIdx(Math.max(0, Math.min(n - 1, i)));
  const pickWord = (w: string) => setWord((cur) => (cur?.toLowerCase() === w.toLowerCase() ? null : w));

  const extras = (
    <>
      <section aria-label="Real-world example" className="card flex items-start gap-3.5">
        <span className="flex h-11 w-11 flex-none items-center justify-center rounded-md border border-line"><Icon name="globe" size={22} /></span>
        <div className="flex flex-col gap-1">
          <span className="label !text-red-hi">Real world</span>
          <p className="m-0 font-bold leading-[22px]">{lesson.realCase.title}</p>
          <p className="m-0 text-[15px] leading-[21px] text-ink2">{lesson.realCase.text}</p>
        </div>
      </section>
      <section aria-label="Professor's notes" className="card flex flex-col gap-3">
        <button type="button" onClick={() => setNotes((o) => !o)} aria-expanded={notes} className="flex items-center gap-3 text-left">
          <span className="flex h-11 w-11 flex-none items-center justify-center rounded-md border border-red-line bg-red-node text-red-hi"><Icon name="grad" size={22} /></span>
          <span className="flex flex-1 flex-col gap-0.5">
            <span className="label !text-red-hi">Go deeper</span>
            <b className="leading-[22px]">Professor’s notes</b>
          </span>
          <motion.span animate={{ rotate: notes ? 90 : 0 }}><Icon name="right" color="#868694" /></motion.span>
        </button>
        <AnimatePresence initial={false}>
          {notes && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
              <div className="flex flex-col gap-4 border-t border-line-soft pt-3">
                {lesson.deep.map((d) => (
                  <div key={d.title} className="flex flex-col gap-1.5">
                    <span className="font-display text-[14px] font-semibold">{d.title}</span>
                    <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
                      {d.points.map((pt) => (
                        <li key={pt} className="flex gap-2 text-[14px] leading-[20px] text-ink2"><span className="mt-[7px] h-1.5 w-1.5 flex-none rounded-full bg-red-hi" /><span className={/^[^A-Z0-9“"‘'…]/.test(pt) ? 'font-mono text-[12.5px] text-ink' : ''}>{pt}</span></li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
      {lesson.tryIt && (
        <section aria-label="Try it" className="card flex flex-col gap-3 border-dashed">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 flex-none items-center justify-center rounded-md border border-line"><Icon name="hammer" size={22} /></span>
            <span className="flex flex-1 flex-col gap-0.5">
              <span className="label">Try it · optional · 5–10 min</span>
              <b className="leading-[22px]">{lesson.tryIt.title}</b>
            </span>
          </div>
          <ol className="m-0 flex list-none flex-col gap-2 p-0">
            {lesson.tryIt.steps.map((st, k) => (
              <li key={st} className="flex gap-2.5 text-[14px] leading-[20px]">
                <span className="flex h-6 w-6 flex-none items-center justify-center rounded-[6px] border border-line-strong font-mono text-[11px]">{k + 1}</span>
                <span className="pt-0.5">{st}</span>
              </li>
            ))}
          </ol>
        </section>
      )}
    </>
  );

  return (
    <div className="mx-auto flex max-w-[1680px] flex-col gap-5">
      <div className="flex min-h-11 items-center gap-3">
        <IconButton icon="close" label="Close lesson" to="/" />
        <div className="flex-1"><Segments count={n} at={idx} label="Lesson progress" /></div>
        <span className="font-mono text-xs text-red-hi">{lesson.minutes} MIN</span>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="label !text-red-hi">T{track.n} {track.name} · Lesson {lessonNum(lesson)}</span>
        <h1 className="m-0 font-display text-2xl font-semibold leading-[30px] lg:text-[30px] lg:leading-[38px]">{lesson.title}</h1>
        <p className="m-0 flex items-start gap-2 text-[15px] leading-[21px] text-ink2"><Icon name="target" size={18} color="#FF4B52" className="mt-0.5 flex-none" /><span><b className="text-ink">Goal:</b> {lesson.goal}</span></p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(340px,1fr)] lg:items-start lg:gap-x-6 lg:[grid-template-areas:'d_c'_'r_c']">
        <div className="min-w-0 lg:[grid-area:d]">
          <Diagram spec={lesson.diagram} title={`FIG ${lessonNum(lesson)} — ${lesson.title.toUpperCase()}`} label={`Animated diagram: ${lesson.title}`} />
        </div>

        <div className="flex min-w-0 flex-col gap-5 lg:row-span-2 lg:[grid-area:c]">
          <section aria-label="Lesson cards" className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="label">Card {idx + 1} / {n} · swipe</span>
              <div className="flex gap-2">
                <IconButton icon="left" label="Previous card" onClick={() => go(idx - 1)} disabled={idx === 0} />
                <IconButton icon="right" label="Next card" onClick={() => go(idx + 1)} disabled={last} />
              </div>
            </div>
            <div ref={rail} className="overflow-hidden py-1">
              <motion.div className="flex cursor-grab active:cursor-grabbing" style={{ gap: GAP }}
                drag="x" dragConstraints={{ left: -(n - 1) * (cardW + GAP), right: 0 }} dragElastic={0.15}
                animate={{ x: -idx * (cardW + GAP) }} transition={{ duration: 0.35, ease: [0.3, 0.7, 0.2, 1] }}
                onDragEnd={(_, info) => {
                  const shift = info.offset.x + info.velocity.x * 0.2;
                  if (shift < -cardW / 4) go(idx + 1); else if (shift > cardW / 4) go(idx - 1); else go(idx);
                }}>
                {lesson.cards.map((c, i) => (
                  <article key={i} aria-label={`Card ${i + 1}`} style={{ width: cardW }}
                    className={cx('flex min-h-[212px] flex-none select-none flex-col gap-3 rounded-lg border bg-surface p-4 transition-[border-color,box-shadow] duration-300', i === idx ? 'border-red shadow-[0_0_0_4px_rgba(229,38,45,.1)]' : 'border-line')}>
                    <span className={cx('font-mono text-[10px] uppercase tracking-[.08em]', c.stage === 'mistake' ? 'text-red-hi' : c.stage === 'recap' ? 'text-green' : i === idx ? 'text-red-hi' : 'text-ink3')}>{i + 1} · {STAGE_LABEL[c.stage]}</span>
                    <span className={cx('flex h-16 items-center justify-center rounded-[10px] border border-line-soft bg-sunk', i === idx ? 'text-red-hi' : 'text-ink')}>
                      <motion.span animate={i === idx ? { scale: [0.8, 1.1, 1] } : { scale: 1 }} transition={{ duration: 0.5 }}><Icon name={c.icon} size={32} stroke={1.6} /></motion.span>
                    </span>
                    <div className="flex flex-col gap-1">
                      <p className="m-0 text-[17px] font-bold leading-[23px]"><Rich text={c.lines[0]} onWord={pickWord} /></p>
                      {c.lines[1] && <p className="m-0 text-[15px] leading-[21px] text-ink2"><Rich text={c.lines[1]} onWord={pickWord} /></p>}
                    </div>
                  </article>
                ))}
              </motion.div>
            </div>
            <div className="flex justify-center gap-1.5">
              {lesson.cards.map((_, i) => (
                <button key={i} type="button" aria-label={`Go to card ${i + 1}`} onClick={() => go(i)}
                  className={cx('h-1.5 rounded-[3px] transition-all duration-300', i === idx ? 'w-5 bg-red' : 'w-1.5 bg-line-strong')} />
              ))}
            </div>
            <WordCallout term={word} words={lesson.words} />
          </section>

          <div className="flex flex-col gap-5 lg:hidden">{extras}</div>

          <section aria-label="Key words" className="flex flex-col gap-2.5">
            <span className="label">Key words · tap to explain</span>
            <div className="flex flex-wrap gap-2">
              {lesson.words.map((w) => <Chip key={w.term} on={word?.toLowerCase() === w.term.toLowerCase()} onClick={() => pickWord(w.term)}>{w.term}</Chip>)}
            </div>
          </section>

          <AmharicToggle amharic={lesson.amharic} on={p.amharic} onToggle={actions.toggleAmharic} />

          <div className="fixed inset-x-0 bottom-0 z-10 border-t border-line-soft bg-bg0 px-5 pb-[max(18px,env(safe-area-inset-bottom))] pt-3.5 lg:static lg:border-0 lg:bg-transparent lg:p-0">
            {last
              ? <LinkButton to={`/quiz/${lesson.id}`} block>Start quiz · {lesson.quiz.length} questions</LinkButton>
              : <Button block onClick={() => go(idx + 1)}>Next card<Icon name="arrow" size={18} stroke={2} /></Button>}
          </div>
        </div>
        <div className="hidden min-w-0 flex-col gap-5 lg:flex lg:[grid-area:r]">
          {extras}
        </div>
      </div>
    </div>
  );
}
