import { TRACKS, lessonNum, type TrackId } from './index';

// =====================================================================
// The study plan: every lesson (and each track's boss) in order, packed
// into days of about one hour. Deep lessons take ~30 min (cards + lab +
// quiz), so a normal day = 2 lessons, or 1 lesson + a boss.
// =====================================================================

export const DAY_MINUTES = 60;
const BOSS_MINUTES = 25;

export interface PlanItem {
  kind: 'lesson' | 'boss';
  id: string;
  num: string; // "1.2" or "BOSS"
  title: string;
  minutes: number;
  to: string;
  track: TrackId;
  hasLab: boolean;
}
export interface PlanDay { n: number; items: PlanItem[]; minutes: number }

function build(): PlanDay[] {
  const items: PlanItem[] = [];
  for (const t of TRACKS) {
    for (const l of t.lessons) {
      items.push({ kind: 'lesson', id: l.id, num: lessonNum(l), title: l.title, minutes: l.minutes, to: `/lesson/${l.id}`, track: t.id, hasLab: !!l.lab });
    }
    items.push({ kind: 'boss', id: t.boss.id, num: 'BOSS', title: t.boss.title, minutes: BOSS_MINUTES, to: `/boss/${t.boss.id}`, track: t.id, hasLab: false });
  }
  const days: PlanDay[] = [];
  let cur: PlanDay = { n: 1, items: [], minutes: 0 };
  for (const it of items) {
    // start a new day when this item would push the day well past an hour
    if (cur.items.length && cur.minutes + it.minutes > DAY_MINUTES + 5) {
      days.push(cur);
      cur = { n: days.length + 1, items: [], minutes: 0 };
    }
    cur.items.push(it);
    cur.minutes += it.minutes;
  }
  if (cur.items.length) days.push(cur);
  return days;
}

export const PLAN: PlanDay[] = build();

export const itemDone = (it: PlanItem, done: { doneLessons: string[]; doneBosses: string[] }) =>
  it.kind === 'lesson' ? done.doneLessons.includes(it.id) : done.doneBosses.includes(it.id);

/** Today's day = the first day that still has something to do. */
export function todayDay(done: { doneLessons: string[]; doneBosses: string[] }) {
  return PLAN.find((d) => d.items.some((it) => !itemDone(it, done))) ?? PLAN[PLAN.length - 1];
}
