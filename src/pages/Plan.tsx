import { Link } from 'react-router-dom';
import { Diamond, Icon, PageTitle, ProgressRing, cx } from '../components/ui';
import { PLAN, itemDone, todayDay, type PlanDay } from '../content/plan';
import { getTrack } from '../content';
import { streakOf, useProgress } from '../store/progress';

export function DayItems({ day, compact }: { day: PlanDay; compact?: boolean }) {
  const p = useProgress();
  return (
    <ul className="m-0 flex list-none flex-col p-0">
      {day.items.map((it) => {
        const done = itemDone(it, p);
        return (
          <li key={it.id}>
            <Link to={it.to} className={cx('flex min-h-11 items-center gap-3 rounded-[10px] px-2 hover:bg-white/[.03]', done && 'text-ink2')}>
              <span className={cx('flex h-6 w-6 flex-none items-center justify-center rounded-full border-[1.5px]', done ? 'border-green bg-green text-green-ink' : 'border-muted')}>
                {done ? <Icon name="check" size={13} stroke={3} /> : it.kind === 'boss' ? <Diamond size={11} /> : null}
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className={cx('truncate text-[15px] leading-5', !done && 'font-bold')}>{it.kind === 'boss' ? `Boss: ${it.title}` : it.title}</span>
                {!compact && (
                  <span className="font-mono text-[10px] uppercase text-ink3">
                    {it.num} · {getTrack(it.track)?.short} · {it.minutes} min{it.hasLab ? ' · experiment' : ''}
                  </span>
                )}
              </span>
              {compact && <span className="font-mono text-[11px] text-ink3">{it.minutes}m</span>}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export default function Plan() {
  const p = useProgress();
  const today = todayDay(p);
  const daysDone = PLAN.filter((d) => d.items.every((it) => itemDone(it, p))).length;
  const hours = Math.round(PLAN.reduce((a, d) => a + d.minutes, 0) / 60);

  return (
    <div className="mx-auto flex max-w-[1680px] flex-col gap-5">
      <PageTitle label={`${PLAN.length} days · about 1 hour a day · ~${hours} hours total`} title="Study plan"
        right={
          <div className="flex items-center gap-3">
            <ProgressRing size={64} stroke={6} value={daysDone / PLAN.length} label={`${daysDone} of ${PLAN.length} days done`}>
              <span className="font-mono text-[12px] font-semibold">{daysDone}/{PLAN.length}</span>
            </ProgressRing>
            <span className="flex flex-col">
              <b>{streakOf(p.days)}-day streak</b>
              <span className="font-mono text-[11px] text-ink2">ONE DAY AT A TIME</span>
            </span>
          </div>
        } />

      <p className="m-0 max-w-[760px] text-[15px] leading-[22px] text-ink2">
        Do one day per day. Each day is about an hour: read the cards, do the experiment, take the quiz.
        Missed a day? Just continue where you stopped. Consistency beats speed.
      </p>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {PLAN.map((d) => {
          const doneCount = d.items.filter((it) => itemDone(it, p)).length;
          const all = doneCount === d.items.length;
          const isToday = d.n === today.n && !all;
          return (
            <section key={d.n} aria-label={`Day ${d.n}`}
              className={cx('flex min-w-0 flex-col gap-2 rounded-xl border p-3.5', isToday ? 'border-red bg-red-node shadow-glow-node' : all ? 'border-line bg-surface opacity-80' : 'border-line bg-surface')}>
              <div className="flex items-center justify-between gap-2 px-1">
                <span className={cx('font-display text-[15px] font-semibold', isToday && 'text-red-hi')}>Day {d.n}</span>
                <span className="font-mono text-[11px] text-ink2">
                  {all ? <span className="text-green">✓ DONE</span> : isToday ? <span className="text-red-hi">TODAY</span> : `${d.minutes} MIN`}
                </span>
              </div>
              <DayItems day={d} />
            </section>
          );
        })}
      </div>
    </div>
  );
}
