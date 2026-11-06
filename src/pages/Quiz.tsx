import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Icon, IconButton, KEYS, LinkButton, QuizAnswer, WhySheet, XPBar, answerState } from '../components/ui';
import { ALL_LESSONS, getLesson, getTrack, lessonNum } from '../content';
import { actions } from '../store/progress';
import { answerOrder } from '../lib/shuffle';
import NotFound from './NotFound';

export default function Quiz() {
  const { id = '' } = useParams();
  const lesson = getLesson(id);
  const [qi, setQi] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [right, setRight] = useState(0);
  const [xp, setXp] = useState(0);
  const [lastXp, setLastXp] = useState(0);
  const [over, setOver] = useState(false);
  // Show the options in a new random order each time, so the answer isn't always “A”.
  const optionCount = lesson?.quiz[qi]?.options.length ?? 0;
  const order = useMemo(() => answerOrder(optionCount), [id, qi, optionCount]);

  if (!lesson) return <NotFound />;
  const track = getTrack(lesson.track)!;
  const q = lesson.quiz[qi];
  const total = lesson.quiz.length;

  const pick = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    const ok = i === q.answer;
    const got = actions.answerQuiz(lesson.id, q.q, ok);
    setLastXp(got);
    if (ok) { setRight((r) => r + 1); setXp((x) => x + got); }
  };
  const next = () => {
    if (qi + 1 < total) { setQi(qi + 1); setPicked(null); return; }
    actions.finishLesson(lesson.id, Math.round((right / total) * 100));
    setOver(true);
  };

  if (over) {
    const nextLesson = ALL_LESSONS[ALL_LESSONS.indexOf(lesson) + 1];
    const sameTrack = nextLesson?.track === lesson.track;
    return (
      <div className="mx-auto flex max-w-[640px] flex-col gap-5 pt-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="label !text-red-hi">Lesson {lessonNum(lesson)} complete</span>
          <div className="font-display text-[52px] font-bold leading-[56px]">{right}<span className="text-muted">/{total}</span></div>
          <p className="m-0 text-ink2">{right === total ? 'Perfect score. You own this one.' : 'Good! Review the cards to get them all.'}</p>
          <motion.span initial={{ scale: 0 }} animate={{ scale: [0, 1.15, 1] }} transition={{ duration: 0.5 }}
            className="inline-flex h-10 items-center rounded-full bg-red/15 px-4 font-mono font-bold text-red-hi">+{xp} XP</motion.span>
          {xp === 0 && right > 0 && <span className="text-sm text-ink3">XP is only given the first time you get a question right.</span>}
        </div>
        <div className="grid gap-2.5 sm:grid-cols-2">
          <LinkButton to={`/lesson/${lesson.id}`} variant="secondary">Review cards</LinkButton>
          {sameTrack
            ? <LinkButton to={`/lesson/${nextLesson.id}`}>Next lesson<Icon name="arrow" size={18} stroke={2} /></LinkButton>
            : <LinkButton to={`/boss/${track.boss.id}`}>Boss challenge<Icon name="arrow" size={18} stroke={2} /></LinkButton>}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-6">
      <div className="flex min-h-11 items-center gap-3">
        <IconButton icon="close" label="Quit quiz" to={`/lesson/${lesson.id}`} />
        <div className="flex-1"><XPBar pct={((qi + (picked !== null ? 1 : 0)) / total) * 100} label="Quiz progress" /></div>
        <span className="font-mono text-[13px] text-ink2">{qi + 1}/{total}</span>
      </div>
      <div className="flex flex-col gap-2">
        <span className="label !text-red-hi">Question · T{track.n} {track.short} · +10 XP</span>
        <h1 className="m-0 font-display text-2xl font-semibold leading-8 lg:text-[30px] lg:leading-[38px]">{q.q}</h1>
      </div>
      <div key={qi} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {order.map((orig, pos) => <QuizAnswer key={orig} k={KEYS[pos]} text={q.options[orig]} state={answerState(orig, picked, q.answer)} onPick={() => pick(orig)} />)}
      </div>
      {picked !== null
        ? <WhySheet ok={picked === q.answer} answer={`${KEYS[order.indexOf(q.answer)]} · ${q.options[q.answer]}`} why={q.why} xp={lastXp} next={next} nextLabel={qi + 1 < total ? (picked === q.answer ? 'Next question' : 'Got it') : 'Finish'} />
        : <p className="label m-0">Tap one answer</p>}
    </div>
  );
}
