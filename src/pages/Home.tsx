import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Diamond, Icon, IconButton, LinkButton, Logo, ProgressRing, Segments, StreakPill, XPBar, cx } from '../components/ui';
import { DiagramBody } from '../diagrams/Diagram';
import { TRACKS, TOTAL_LESSONS, WORD_BANK, getTrack, lessonNum } from '../content';
import { DAILY_GOAL, actions, continueLesson, dayKey, levelOf, streakOf, thisWeek, trackStats, useProgress } from '../store/progress';

export default function Home() {
  const p = useProgress();
  const lvl = levelOf(p.xp);
  const streak = streakOf(p.days);
  const today = p.days[dayKey()] ?? 0;
  const lesson = continueLesson(p);
  const curTrack = lesson ? getTrack(lesson.track)! : null;
  const bossReady = TRACKS.map((t) => trackStats(p, t.id)).find((s) => s.bossReady);
  const week = thisWeek(p.days);
  const word = WORD_BANK[Math.floor(Date.now() / 86400000) % WORD_BANK.length];
  const date = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' });
  const [nameDraft, setNameDraft] = useState('');

  return (
    <div className="mx-auto flex max-w-[1680px] flex-col gap-5">
      <header className="flex h-11 items-center justify-between lg:hidden">
        <Logo />
        <div className="flex items-center gap-2">
          <StreakPill days={streak} />
          <IconButton icon="tools" label="Tools" to="/tools" />
        </div>
      </header>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <span className="label">{date.replace(',', ' ·')}</span>
          <h1 className="m-0 font-display text-[26px] font-semibold leading-8 lg:text-[34px] lg:leading-10">Selam{p.name ? `, ${p.name}` : '!'}</h1>
          <p className="m-0 text-[15px] text-ink2">{today >= DAILY_GOAL ? 'Daily goal done. Great work!' : `${DAILY_GOAL - today} XP more to hit today’s goal.`}</p>
        </div>
        <div className="hidden items-center gap-2 lg:flex">
          <StreakPill days={streak} />
          <LinkButton to="/practice/run" variant="secondary" small><Icon name="practice" size={18} />Quick 5</LinkButton>
        </div>
      </div>

      {!p.name && (
        <form className="card flex flex-wrap items-center gap-3" onSubmit={(e) => { e.preventDefault(); if (nameDraft.trim()) actions.setName(nameDraft.trim()); }}>
          <label htmlFor="name" className="flex-1 text-[15px] font-bold">What should we call you?</label>
          <input id="name" value={nameDraft} onChange={(e) => setNameDraft(e.target.value)} placeholder="Your name" autoComplete="given-name"
            className="h-11 min-w-0 flex-[1_1_160px] rounded-md border border-line bg-sunk px-3 outline-none focus:border-red-hi" />
          <button type="submit" className="h-11 rounded-md bg-red px-4 font-bold text-white">Save</button>
        </form>
      )}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(300px,1fr)] lg:items-start lg:gap-5">
        {lesson && curTrack ? (
          <section aria-label="Continue learning" className="card flex flex-col gap-3.5 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="label !text-red-hi">{p.doneLessons.length ? 'Continue' : 'Start here'} · {curTrack.short} {lessonNum(lesson)}</span>
              <span className="label">{lesson.minutes} min</span>
            </div>
            <Link to={`/lesson/${lesson.id}`} aria-label={`Open lesson: ${lesson.title}`} className="grid-bg block overflow-hidden rounded-md border border-line bg-sunk">
              <DiagramBody spec={lesson.diagram} />
            </Link>
            <div className="flex flex-col gap-2.5">
              <h2 className="m-0 font-display text-xl font-semibold leading-[26px]">{lesson.title}</h2>
              <div className="flex items-center gap-2.5">
                <div className="flex-1"><Segments count={lesson.cards.length} at={p.lastCard[lesson.id] ?? 0} label="Lesson progress" /></div>
                <span className="font-mono text-[11px] text-ink2">CARD {(p.lastCard[lesson.id] ?? 0) + 1}/{lesson.cards.length}</span>
              </div>
            </div>
            <LinkButton to={`/lesson/${lesson.id}`} block><Icon name="play" size={18} />{p.lastCard[lesson.id] ? 'Continue lesson' : 'Start lesson'}</LinkButton>
          </section>
        ) : (
          <section className="card flex flex-col gap-3 rounded-xl">
            <span className="label !text-green">All {TOTAL_LESSONS} lessons done</span>
            <h2 className="m-0 font-display text-xl font-semibold">You finished the blueprint.</h2>
            <p className="m-0 text-ink2">Keep it fresh with practice, or beat the bosses you missed.</p>
            <LinkButton to="/practice">Practice</LinkButton>
          </section>
        )}

        <div className="flex flex-col gap-4">
          <section aria-label="Today" className="card flex items-center gap-4">
            <ProgressRing size={96} stroke={9} value={today / DAILY_GOAL} label={`Daily goal: ${today} of ${DAILY_GOAL} XP`}>
              <span className="font-display text-[22px] font-semibold leading-6">{today}</span>
              <span className="font-mono text-[10px] text-ink2">/{DAILY_GOAL} XP</span>
            </ProgressRing>
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <div className="flex items-baseline justify-between gap-2"><span className="label !text-red-hi">Level {lvl.level}</span><span className="label">{lvl.toNext} XP → LVL {lvl.level + 1}</span></div>
              <span className="font-display text-[15px] font-semibold">{lvl.name}</span>
              <XPBar pct={lvl.pct} label="XP to next level" />
              <span className="font-mono text-[11px] text-ink2">{p.xp.toLocaleString()} / {lvl.next.toLocaleString()} XP</span>
            </div>
          </section>
          <section aria-label="This week" className="card flex flex-col gap-2.5">
            <span className="label">This week · {streak}-day streak</span>
            <div className="flex justify-between">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                <span key={i} className="flex flex-col items-center gap-1.5">
                  <span className={cx('flex h-[30px] w-[30px] items-center justify-center rounded-sm', week[i] ? 'bg-red' : 'border border-line')}>{week[i] && <Icon name="streak" size={16} color="#fff" />}</span>
                  <span className="font-mono text-[10px] text-ink3">{d}</span>
                </span>
              ))}
            </div>
          </section>
          {bossReady && (
            <Link to={`/boss/${bossReady.track.boss.id}`} className="card flex items-center gap-3.5 border-dashed border-red-line">
              <span className="flex w-11 justify-center"><Diamond state="next" size={26} /></span>
              <span className="flex flex-1 flex-col gap-1"><span className="label !text-red-hi">Boss ready · {bossReady.track.short}</span><span className="font-bold">{bossReady.track.boss.title}</span><span className="font-mono text-[11px] text-ink2">DESIGN TASK · +50 XP</span></span>
              <Icon name="right" color="#868694" />
            </Link>
          )}
          <div className="hidden flex-col gap-4 lg:flex">
        <Link to="/tools" className="card flex flex-col gap-3">
          <span className="label">Word of the day</span>
          <div className="flex items-baseline gap-2.5"><b className="text-xl">{word.term}</b><span className="ml-auto font-mono text-[10px] uppercase text-ink3">{getTrack(word.track)?.short}</span></div>
          <span className="text-[15px] leading-[21px]">{word.meaning}</span>
        </Link>
        <section className="card flex flex-col gap-3">
          <span className="label !text-red-hi">Quick 5 · 2 min</span>
          <b className="text-lg">Mixed review</b>
          <span className="text-[15px] text-ink2">5 questions from lessons you finished.</span>
          <LinkButton to="/practice/run" variant="secondary" small className="self-start"><Icon name="practice" size={16} />Start</LinkButton>
        </section>
          </div>
        </div>
      </div>

      <section aria-label="Your tracks" className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <h2 className="m-0 font-display text-base font-semibold">Your tracks</h2>
          <Link to="/map" className="flex h-11 items-center font-mono text-xs text-red-hi">{p.doneLessons.length}/{TOTAL_LESSONS} · See map →</Link>
        </div>
        <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4 2xl:grid-cols-5">
          {TRACKS.map((t) => {
            const s = trackStats(p, t.id);
            const isCur = t.id === lesson?.track;
            return (
              <Link key={t.id} to={`/map?track=${t.id}`} className={cx('flex flex-col gap-2.5 rounded-[14px] border p-3.5', isCur ? 'border-red-line bg-[#1A1014]' : 'border-line bg-surface')}>
                <div className="flex items-center justify-between">
                  <span className={cx('flex h-8 w-8 items-center justify-center rounded-[9px] border', isCur ? 'border-red text-red-hi' : 'border-line')}><Icon name={t.icon} size={18} /></span>
                  {s.complete
                    ? <span className="flex items-center gap-1 font-mono text-[11px]"><Icon name="check" size={12} stroke={2.6} />DONE</span>
                    : <span className={cx('font-mono text-[11px]', isCur ? 'text-red-hi' : 'text-ink2')}>{isCur ? 'NOW · ' : ''}{s.done}/{s.total}</span>}
                </div>
                <span className="text-sm font-bold leading-[18px]">{t.name}</span>
                <XPBar thin white={!isCur} current={isCur} pct={s.pct} label={`${t.name} progress`} />
                <span className="hidden truncate font-mono text-[10px] uppercase text-ink3 lg:block">{s.next ? `Next · ${s.next.title}` : s.bossDone ? 'Review anytime' : `Boss · ${t.boss.title}`}</span>
              </Link>
            );
          })}
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 lg:hidden">
        <Link to="/tools" className="card flex flex-col gap-3">
          <span className="label">Word of the day</span>
          <div className="flex items-baseline gap-2.5"><b className="text-xl">{word.term}</b><span className="ml-auto font-mono text-[10px] uppercase text-ink3">{getTrack(word.track)?.short}</span></div>
          <span className="text-[15px] leading-[21px]">{word.meaning}</span>
        </Link>
        <section className="card flex flex-col gap-3">
          <span className="label !text-red-hi">Quick 5 · 2 min</span>
          <b className="text-lg">Mixed review</b>
          <span className="text-[15px] text-ink2">5 questions from lessons you finished.</span>
          <LinkButton to="/practice/run" variant="secondary" small className="self-start"><Icon name="practice" size={16} />Start</LinkButton>
        </section>
      </div>
    </div>
  );
}
