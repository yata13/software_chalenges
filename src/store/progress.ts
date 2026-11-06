import { useSyncExternalStore } from 'react';
import { ALL_LESSONS, TRACKS, type TrackId } from '../content';

// =====================================================================
// Learner progress. Saved on this device (localStorage) and, if sync is
// on, merged with the copy on the server. Every synced field is built so
// two devices can ALWAYS be merged without losing work:
//   sets only grow (union) · best scores take the max · settings: newest
//   change wins · XP is a counter per device per day (each device only
//   adds to its own counter, so totals from all devices add up).
// =====================================================================

export interface Run { id: string; at: number; date: string; score: number; of: number; secs: number; stars: number }

export interface Progress {
  v: 2;
  epoch: number; // changes on reset/import: newer epoch replaces older data everywhere
  name: string; nameAt: number;
  amharic: boolean; amharicAt: number;
  doneLessons: string[];
  doneBosses: string[];
  labsDone: string[]; // experiments finished
  correct: string[]; // "lessonId:question" answered right (XP only the first time)
  scores: Record<string, number>; // best quiz % per lesson
  lastCard: Record<string, number>; // furthest card reached per lesson
  savedLog: Record<string, { on: boolean; t: number }>; // word → saved or not, with time of change
  xpLog: Record<string, Record<string, number>>; // device → "2026-11-06" → XP
  runs: Run[];
  // ----- derived from the fields above (recomputed, never synced) -----
  xp: number;
  days: Record<string, number>; // XP per day, all devices together
  saved: string[]; // saved words
}

const KEY = 'tech-blueprint:v1';
const DEVICE_KEY = 'tech-blueprint:device';
export const DAILY_GOAL = 50;
export const XP_CORRECT = 10;
export const XP_BOSS = 50;
export const XP_LAB = 20;

export const dayKey = (d = new Date()) => {
  const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return z.toISOString().slice(0, 10);
};

// A random id for this device (not synced: each device keeps its own).
let device = '';
export function deviceId() {
  if (device) return device;
  try { device = localStorage.getItem(DEVICE_KEY) || ''; } catch { /* ignore */ }
  if (!device) {
    const b = new Uint8Array(9);
    crypto.getRandomValues(b);
    device = 'd' + Array.from(b, (x) => (x % 36).toString(36)).join('');
    try { localStorage.setItem(DEVICE_KEY, device); } catch { /* ignore */ }
  }
  return device;
}

function blank(): Progress {
  return {
    v: 2, epoch: 0, name: '', nameAt: 0, amharic: true, amharicAt: 0,
    doneLessons: [], doneBosses: [], labsDone: [], correct: [], scores: {}, lastCard: {}, savedLog: {}, xpLog: {}, runs: [],
    xp: 0, days: {}, saved: [],
  };
}

/** Recompute the derived fields (xp, days, saved). */
function derive(p: Progress): Progress {
  const days: Record<string, number> = {};
  for (const perDay of Object.values(p.xpLog)) for (const [d, n] of Object.entries(perDay)) days[d] = (days[d] ?? 0) + n;
  const xp = Math.max(0, Math.round(Object.values(days).reduce((a, b) => a + b, 0)));
  const saved = Object.entries(p.savedLog).filter(([, x]) => x.on).map(([term]) => term).sort();
  return { ...p, xp, days, saved };
}

// ---------- Load any data safely (old v1 data, imports, server copies) ----------
const isObj = (x: unknown): x is Record<string, unknown> => !!x && typeof x === 'object' && !Array.isArray(x);
const num = (x: unknown, d = 0) => (typeof x === 'number' && Number.isFinite(x) ? x : d);
const strArr = (x: unknown) => (Array.isArray(x) ? [...new Set(x.filter((v): v is string => typeof v === 'string'))] : []);
const numMap = (x: unknown) => (isObj(x) ? Object.fromEntries(Object.entries(x).filter(([, v]) => typeof v === 'number' && Number.isFinite(v))) as Record<string, number> : {});

export function normalizeProgress(d: unknown): Progress {
  if (!isObj(d)) return blank();
  const old = d.v !== 2; // v1: before sync existed

  const xpLog: Record<string, Record<string, number>> = {};
  if (!old && isObj(d.xpLog)) {
    for (const [dev, m] of Object.entries(d.xpLog)) { const nm = numMap(m); if (Object.keys(nm).length) xpLog[dev] = nm; }
  }
  if (old) {
    // v1 kept one XP-per-day map; it becomes this device's counter. Keep any XP the map missed.
    const days = numMap(d.days);
    const sum = Object.values(days).reduce((a, b) => a + b, 0);
    const extra = num(d.xp) - sum;
    if (extra > 0) days['0000-00-00'] = extra;
    if (Object.keys(days).length) xpLog[deviceId()] = days;
  }

  const savedLog: Progress['savedLog'] = {};
  if (!old && isObj(d.savedLog)) {
    for (const [term, x] of Object.entries(d.savedLog)) if (isObj(x) && typeof x.on === 'boolean') savedLog[term] = { on: x.on, t: num(x.t) };
  }
  if (old) for (const term of strArr(d.saved)) savedLog[term] = { on: true, t: 1 };

  const runs: Run[] = Array.isArray(d.runs)
    ? d.runs.filter((r): r is Record<string, unknown> => isObj(r) && typeof r.score === 'number' && typeof r.of === 'number' && typeof r.secs === 'number' && typeof r.stars === 'number')
      .map((r, i) => ({
        id: typeof r.id === 'string' ? r.id : `old-${String(r.date ?? '')}-${i}`,
        at: num(r.at), date: typeof r.date === 'string' ? r.date : '',
        score: num(r.score), of: num(r.of), secs: num(r.secs), stars: num(r.stars),
      }))
    : [];

  return derive({
    v: 2,
    epoch: num(d.epoch),
    name: typeof d.name === 'string' ? d.name.slice(0, 30) : '', nameAt: num(d.nameAt),
    amharic: typeof d.amharic === 'boolean' ? d.amharic : true, amharicAt: num(d.amharicAt),
    doneLessons: strArr(d.doneLessons),
    doneBosses: strArr(d.doneBosses),
    labsDone: strArr(d.labsDone),
    correct: strArr(d.correct),
    scores: numMap(d.scores),
    lastCard: numMap(d.lastCard),
    savedLog, xpLog,
    runs: runs.sort((a, b) => b.at - a.at).slice(0, 10),
    xp: 0, days: {}, saved: [],
  });
}

// ---------- Merge two copies (phone + PC) without losing anything ----------
const union = (a: string[], b: string[]) => [...new Set([...a, ...b])];
const maxMap = (a: Record<string, number>, b: Record<string, number>) => {
  const o = { ...a };
  for (const [k, v] of Object.entries(b)) o[k] = k in o ? Math.max(o[k], v) : v;
  return o;
};

export function mergeProgress(a: Progress, b: Progress): Progress {
  // A reset or import starts a new epoch: the newer one replaces the older.
  if (a.epoch !== b.epoch) return a.epoch > b.epoch ? a : b;
  const xpLog: Progress['xpLog'] = {};
  for (const dev of union(Object.keys(a.xpLog), Object.keys(b.xpLog))) xpLog[dev] = maxMap(a.xpLog[dev] ?? {}, b.xpLog[dev] ?? {});
  const savedLog = { ...a.savedLog };
  for (const [term, x] of Object.entries(b.savedLog)) if (!savedLog[term] || x.t > savedLog[term].t) savedLog[term] = x;
  const runs = new Map<string, Run>();
  for (const r of [...a.runs, ...b.runs]) runs.set(r.id, r);
  return derive({
    v: 2,
    epoch: a.epoch,
    name: b.nameAt > a.nameAt ? b.name : a.name, nameAt: Math.max(a.nameAt, b.nameAt),
    amharic: b.amharicAt > a.amharicAt ? b.amharic : a.amharic, amharicAt: Math.max(a.amharicAt, b.amharicAt),
    doneLessons: union(a.doneLessons, b.doneLessons),
    doneBosses: union(a.doneBosses, b.doneBosses),
    labsDone: union(a.labsDone, b.labsDone),
    correct: union(a.correct, b.correct),
    scores: maxMap(a.scores, b.scores),
    lastCard: maxMap(a.lastCard, b.lastCard),
    savedLog, xpLog,
    runs: [...runs.values()].sort((x, y) => y.at - x.at).slice(0, 10),
    xp: 0, days: {}, saved: [],
  });
}

/** What gets uploaded: synced fields only, in a stable order (so copies can be compared). */
export function syncData(p: Progress) {
  const sortKeys = <T,>(m: Record<string, T>) => Object.fromEntries(Object.entries(m).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)));
  return {
    v: 2 as const, epoch: p.epoch,
    name: p.name, nameAt: p.nameAt, amharic: p.amharic, amharicAt: p.amharicAt,
    doneLessons: [...p.doneLessons].sort(), doneBosses: [...p.doneBosses].sort(), labsDone: [...p.labsDone].sort(), correct: [...p.correct].sort(),
    scores: sortKeys(p.scores), lastCard: sortKeys(p.lastCard),
    savedLog: sortKeys(p.savedLog),
    xpLog: sortKeys(Object.fromEntries(Object.entries(p.xpLog).map(([dev, m]) => [dev, sortKeys(m)]))),
    runs: [...p.runs].sort((x, y) => y.at - x.at || (x.id < y.id ? -1 : 1)),
  };
}
export const sameSyncData = (a: Progress, b: Progress) => JSON.stringify(syncData(a)) === JSON.stringify(syncData(b));

// ---------- The store ----------
function read(): Progress {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return normalizeProgress(JSON.parse(raw));
  } catch { /* blocked storage or bad data: start fresh */ }
  return blank();
}

let state: Progress = read();
const subs = new Set<() => void>();
const localChange = new Set<() => void>();

function commit(next: Progress, fromSync: boolean) {
  state = next;
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignore */ }
  subs.forEach((f) => f());
  if (!fromSync) localChange.forEach((f) => f());
}
const set = (fn: (s: Progress) => Progress) => {
  const next = fn(state);
  if (next !== state) commit(next, false);
};
const subscribe = (f: () => void) => { subs.add(f); return () => { subs.delete(f); }; };

/** For the sync engine. */
export const getProgress = () => state;
export const applyMerged = (p: Progress) => commit(p, true);
export const onLocalChange = (f: () => void) => { localChange.add(f); return () => { localChange.delete(f); }; };

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
  const dev = deviceId(), d = dayKey();
  const mine = s.xpLog[dev] ?? {};
  return derive({ ...s, xpLog: { ...s.xpLog, [dev]: { ...mine, [d]: (mine[d] ?? 0) + n } } });
};
const uniq = (a: string[], x: string) => (a.includes(x) ? a : [...a, x]);

// ---------- Actions ----------
export const actions = {
  setName: (name: string) => set((s) => (s.name === name.slice(0, 30) ? s : { ...s, name: name.slice(0, 30), nameAt: Date.now() })),
  toggleAmharic: () => set((s) => ({ ...s, amharic: !s.amharic, amharicAt: Date.now() })),
  setCard: (lessonId: string, i: number) => set((s) => (s.lastCard[lessonId] === i ? s : { ...s, lastCard: { ...s.lastCard, [lessonId]: i } })),
  toggleWord: (term: string) => set((s) => derive({ ...s, savedLog: { ...s.savedLog, [term]: { on: !s.saved.includes(term), t: Date.now() } } })),

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
  /** Returns XP given (20 the first time an experiment is done). */
  finishLab(lessonId: string): number {
    if (state.labsDone.includes(lessonId)) return 0;
    set((s) => ({ ...addXP(s, XP_LAB), labsDone: [...s.labsDone, lessonId] }));
    return XP_LAB;
  },
  practiceAnswer(right: boolean): number {
    if (!right) return 0;
    set((s) => addXP(s, XP_CORRECT));
    return XP_CORRECT;
  },
  saveRun: (r: Pick<Run, 'score' | 'of' | 'secs' | 'stars'>) => set((s) => {
    const at = Date.now();
    const run: Run = { ...r, id: `${deviceId()}-${at}`, at, date: dayKey() };
    return { ...s, runs: [run, ...s.runs].slice(0, 10) };
  }),
  /** Clears progress. With sync on, the new epoch clears the other devices too. */
  reset: () => set(() => ({ ...blank(), epoch: Date.now() })),

  // ---------- Backup: a code you copy to another device ----------
  exportCode(): string {
    const json = JSON.stringify(syncData(state));
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
      if ((data?.v !== 1 && data?.v !== 2) || !Array.isArray(data.doneLessons)) return false;
      // An import replaces progress: a new epoch, so synced devices take it too.
      set(() => ({ ...normalizeProgress(data), epoch: Date.now() }));
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
