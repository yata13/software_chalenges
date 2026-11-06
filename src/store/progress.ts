import { useSyncExternalStore } from 'react';
import { ALL_LESSONS, TRACKS, type TrackId } from '../content';

// ---------- Saved state (localStorage) ----------
export interface Run { date: string; score: number; of: number; secs: number; stars: number }
export interface Progress {
  v: 1;
  name: string;
  xp: number;
  doneLessons: string[];
  doneBosses: string[];
  correct: string[]; // "lessonId:q" answered right at least once (XP only the first time)
  scores: Record<string, number>; // best quiz % per lesson
  days: Record<string, number>; // "2026-11-05" → XP earned that day
  lastCard: Record<string, number>;
  saved: string[]; // saved words
  runs: Run[];
  amharic: boolean;
}

const KEY = 'tech-blueprint:v1';
export const DAILY_GOAL = 50;
export const XP_CORRECT = 10;
export const XP_BOSS = 50;

const empty = (): Progress => ({
  v: 1, name: '', xp: 0, doneLessons: [], doneBosses: [], correct: [], scores: {}, days: {},
  lastCard: {}, saved: [], runs: [], amharic: true,
});

export const dayKey = (d = new Date()) => {
  const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return z.toISOString().slice(0, 10);
};

// Make any loaded data safe to use: wrong types fall back to empty values.
const isObj = (x: unknown): x is Record<string, unknown> => !!x && typeof x === 'object' && !Array.isArray(x);
const strArr = (x: unknown) => (Array.isArray(x) ? x.filter((v): v is string => typeof v === 'string') : []);
const numMap = (x: unknown) => (isObj(x) ? Object.fromEntries(Object.entries(x).filter(([, v]) => typeof v === 'number' && Number.isFinite(v))) as Record<string, number> : {});
function normalize(d: unknown): Progress {
  const e = empty();
  if (!isObj(d)) return e;
  return {
    v: 1,
    name: typeof d.name === 'string' ? d.name.slice(0, 30) : '',
    xp: typeof d.xp === 'number' && Number.isFinite(d.xp) && d.xp >= 0 ? Math.round(d.xp) : 0,
    doneLessons: strArr(d.doneLessons),
    doneBosses: strArr(d.doneBosses),
    correct: strArr(d.correct),
    scores: numMap(d.scores),
    days: numMap(d.days),
    lastCard: numMap(d.lastCard),
    saved: strArr(d.saved),
    runs: Array.isArray(d.runs)
      ? (d.runs.filter((r) => isObj(r) && typeof r.score === 'number' && typeof r.of === 'number' && typeof r.secs === 'number' && typeof r.stars === 'number') as unknown as Run[]).slice(0, 10)
      : [],
    amharic: typeof d.amharic === 'boolean' ? d.amharic : e.amharic,
  };
}

function read(): Progress {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return normalize(JSON.parse(raw));
  } catch { /* blocked storage or bad data: start fresh */ }
  return empty();
}

let state: Progress = read();
const subs = new Set<() => void>();
function set(fn: (s: Progress) => Progress) {
  state = fn(state);
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignore */ }
  subs.forEach((f) => f());
}
const subscribe = (f: () => void) => { subs.add(f); return () => { subs.delete(f); }; };

// Another tab (or the installed app) saved progress: load it here too.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key !== KEY) return;
    state = read();
    subs.forEach((f) => f());
  });
}

export function useProgress() {
  return useSyncExternalStore(subscribe, () => state, () => state);
}

const addXP = (s: Progress, n: number): Progress => {
  const d = dayKey();
  return { ...s, xp: s.xp + n, days: { ...s.days, [d]: (s.days[d] ?? 0) + n } };
};
const uniq = (a: string[], x: string) => (a.includes(x) ? a : [...a, x]);

// ---------- Actions ----------
export const actions = {
  setName: (name: string) => set((s) => ({ ...s, name: name.slice(0, 30) })),
  toggleAmharic: () => set((s) => ({ ...s, amharic: !s.amharic })),
  setCard: (lessonId: string, i: number) => set((s) => ({ ...s, lastCard: { ...s.lastCard, [lessonId]: i } })),
  toggleWord: (term: string) => set((s) => ({ ...s, saved: s.saved.includes(term) ? s.saved.filter((w) => w !== term) : [...s.saved, term] })),

  /** Returns XP given (10 the first time this question is right, else 0). Keyed by question text. */
  answerQuiz(lessonId: string, question: string, right: boolean): number {
    const key = `${lessonId}:${question}`;
    if (!right || state.correct.includes(key)) return 0;
    set((s) => ({ ...addXP(s, XP_CORRECT), correct: [...s.correct, key] }));
    return XP_CORRECT;
  },
  finishLesson(lessonId: string, pct: number) {
    set((s) => ({ ...s, doneLessons: uniq(s.doneLessons, lessonId), scores: { ...s.scores, [lessonId]: Math.max(s.scores[lessonId] ?? 0, pct) } }));
  },
  /** Returns XP given (50 the first time a boss is beaten). */
  finishBoss(bossId: string): number {
    if (state.doneBosses.includes(bossId)) return 0;
    set((s) => ({ ...addXP(s, XP_BOSS), doneBosses: [...s.doneBosses, bossId] }));
    return XP_BOSS;
  },
  practiceAnswer(right: boolean): number {
    if (!right) return 0;
    set((s) => addXP(s, XP_CORRECT));
    return XP_CORRECT;
  },
  saveRun: (r: Omit<Run, 'date'>) => set((s) => ({ ...s, runs: [{ ...r, date: dayKey() }, ...s.runs].slice(0, 10) })),
  reset: () => set(() => empty()),

  // ---------- Backup: a code you copy to another device ----------
  exportCode(): string {
    const json = JSON.stringify(state);
    const bytes = new TextEncoder().encode(json);
    let bin = '';
    for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    return `TB1.${btoa(bin)}`;
  },
  importCode(code: string): boolean {
    try {
      const raw = code.trim().replace(/^TB1\./, '');
      const bytes = Uint8Array.from(atob(raw), (c) => c.charCodeAt(0));
      const data = JSON.parse(new TextDecoder().decode(bytes));
      if (data?.v !== 1 || typeof data.xp !== 'number' || !Array.isArray(data.doneLessons)) return false;
      set(() => normalize(data));
      return true;
    } catch {
      return false;
    }
  },
};

// ---------- Derived numbers ----------
// XP needed to reach level n+1 from 0: 25·n·(n+1) → 50, 150, 300, 500, 750…
export const levelStart = (lvl: number) => 25 * (lvl - 1) * lvl;
export const LEVEL_NAMES = ['Curious Beginner', 'Bit Explorer', 'Byte Builder', 'Packet Tracer', 'Code Tinkerer', 'Network Apprentice', 'System Sketcher', 'Cloud Builder', 'Security Guard', 'AI Builder', 'Blueprint Architect', 'Tech Mentor'];

export function levelOf(xp: number) {
  let level = 1;
  while (xp >= levelStart(level + 1)) level++;
  const start = levelStart(level), next = levelStart(level + 1);
  return { level, name: LEVEL_NAMES[Math.min(level, LEVEL_NAMES.length) - 1], start, next, toNext: next - xp, pct: Math.round(((xp - start) / (next - start)) * 100) };
}

export function streakOf(days: Record<string, number>) {
  let n = 0;
  const d = new Date();
  if (!(days[dayKey(d)] > 0)) d.setDate(d.getDate() - 1); // today not done yet: count from yesterday
  while (days[dayKey(d)] > 0) { n++; d.setDate(d.getDate() - 1); }
  return n;
}

export function weekXP(days: Record<string, number>, weeks = 8) {
  const out: { label: string; xp: number }[] = [];
  const now = new Date();
  const monday = new Date(now); monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  for (let w = weeks - 1; w >= 0; w--) {
    const start = new Date(monday); start.setDate(monday.getDate() - w * 7);
    let sum = 0;
    for (let i = 0; i < 7; i++) { const d = new Date(start); d.setDate(start.getDate() + i); sum += days[dayKey(d)] ?? 0; }
    out.push({ label: w === 0 ? 'NOW' : start.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }).toUpperCase(), xp: sum });
  }
  return out;
}

export function thisWeek(days: Record<string, number>) {
  const now = new Date();
  const monday = new Date(now); monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => { const d = new Date(monday); d.setDate(monday.getDate() + i); return (days[dayKey(d)] ?? 0) > 0; });
}

export function trackStats(p: Progress, id: TrackId) {
  const t = TRACKS.find((x) => x.id === id)!;
  const done = t.lessons.filter((l) => p.doneLessons.includes(l.id)).length;
  const next = t.lessons.find((l) => !p.doneLessons.includes(l.id)) ?? null;
  const bossDone = p.doneBosses.includes(t.boss.id);
  const skill = Math.round(t.lessons.reduce((a, l) => a + (p.scores[l.id] ?? 0), 0) / t.lessons.length);
  return { track: t, done, total: t.lessons.length, pct: Math.round((done / t.lessons.length) * 100), next, bossDone, bossReady: !next && !bossDone, complete: !next && bossDone, skill };
}

export function continueLesson(p: Progress) {
  return ALL_LESSONS.find((l) => !p.doneLessons.includes(l.id)) ?? null;
}
