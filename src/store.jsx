import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { TRACKS, trackStops, levelOf, ALL_STOPS } from './data/tracks.js';

// Learner progress, saved in this browser (localStorage).
const KEY = 'tech-blueprint-v1';
export const DAILY_GOAL = 50;

const dayStr = (d = new Date()) => d.toISOString().slice(0, 10);
const daysBetween = (a, b) => Math.round((new Date(b) - new Date(a)) / 86400000);
function weekStart(d = new Date()) {
  const x = new Date(d); const wd = (x.getDay() + 6) % 7; x.setDate(x.getDate() - wd);
  return dayStr(x);
}

// Demo starting point, matching the design: Yared, level 7, on lesson 2.6.
function seed() {
  const seedDone = { T1: 12, T2: 6, T3: 15, T4: 2, T5: 4, T6: 1, T7: 3, T8: 0 };
  const done = [];
  TRACKS.forEach((t) => trackStops(t).slice(0, seedDone[t.code]).forEach((s) => done.push(s.id)));
  return {
    name: 'Yared', fullName: 'Yared Tesfahun',
    xp: 2340, done,
    todayXP: 35, today: dayStr(),
    streak: 12, lastActive: dayStr(),
    // last 11 weeks + this week
    weeks: [120, 150, 90, 180, 150, 210, 190, 270, 250, 320, 300], weekXP: 360, week: weekStart(),
    activeDays: [true, true, true, true, false, false, false],
    skills: { T1: 80, T2: 55, T3: 95, T4: 35, T5: 40, T6: 20, T7: 35, T8: 10 },
    perfect: ['1.4'],
    bestStars: 3,
    savedWords: ['API', 'Cache', 'Token', 'Tokens', 'Latency', 'DNS', 'Resolver', 'Embedding', 'RAG', 'Phishing', 'Firewall', 'GPU'],
    prompts: [],
    runs: [
      { day: 'WED', score: 5, secs: 58, stars: 3 },
      { day: 'TUE', score: 4, secs: 72, stars: 2 },
      { day: 'MON', score: 3, secs: 100, stars: 1 },
    ],
    lessonCard: { '2.6': 1 },
    am: true,
  };
}

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...seed(), ...JSON.parse(raw) };
  } catch { /* storage blocked: use seed */ }
  return seed();
}

// Roll the day / week forward when the app opens on a new date.
function rollDate(s) {
  const today = dayStr();
  let n = s;
  if (s.today !== today) {
    const gap = daysBetween(s.lastActive, today);
    n = { ...n, today, todayXP: 0, streak: gap > 1 ? 0 : s.streak };
  }
  const wk = weekStart();
  if (s.week !== wk) {
    n = { ...n, weeks: [...s.weeks, s.weekXP].slice(-11), weekXP: 0, week: wk, activeDays: [false, false, false, false, false, false, false] };
  }
  return n;
}

const Ctx = createContext(null);

export function StoreProvider({ children }) {
  const [s, setS] = useState(() => rollDate(load()));
  const [toast, setToast] = useState(null);

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* ignore */ }
  }, [s]);

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  const gain = useCallback((st, amount) => {
    const today = dayStr();
    const firstToday = st.lastActive !== today;
    const wd = (new Date().getDay() + 6) % 7;
    const activeDays = [...st.activeDays]; activeDays[wd] = true;
    return {
      ...st,
      xp: Math.max(0, st.xp + amount),
      todayXP: Math.max(0, st.todayXP + amount),
      weekXP: Math.max(0, st.weekXP + amount),
      streak: amount > 0 && firstToday ? st.streak + 1 : st.streak,
      lastActive: amount > 0 ? today : st.lastActive,
      activeDays,
    };
  }, []);

  const api = useMemo(() => ({
    s,
    toast,
    notify: (msg) => setToast(msg),
    addXP: (n) => setS((st) => gain(st, n)),
    finishStop: (id, xp, { trackCode, scorePct, perfect } = {}) => setS((st) => {
      let n = gain(st, st.done.includes(id) ? Math.round(xp / 4) : xp);
      if (!n.done.includes(id)) n = { ...n, done: [...n.done, id] };
      if (trackCode && scorePct != null) {
        const prev = n.skills[trackCode] ?? 0;
        n = { ...n, skills: { ...n.skills, [trackCode]: Math.round(prev * 0.6 + scorePct * 0.4) } };
      }
      if (perfect && !n.perfect.includes(id)) n = { ...n, perfect: [...n.perfect, id] };
      return n;
    }),
    setLessonCard: (id, i) => setS((st) => ({ ...st, lessonCard: { ...st.lessonCard, [id]: i } })),
    toggleAm: () => setS((st) => ({ ...st, am: !st.am })),
    toggleWord: (term) => setS((st) => ({
      ...st,
      savedWords: st.savedWords.includes(term) ? st.savedWords.filter((w) => w !== term) : [...st.savedWords, term],
    })),
    addPrompt: (p) => setS((st) => ({ ...st, prompts: [...st.prompts, { ...p, id: `u${Date.now()}` }] })),
    removePrompt: (id) => setS((st) => ({ ...st, prompts: st.prompts.filter((p) => p.id !== id) })),
    finishRun: (run, xp) => setS((st) => {
      const day = new Date().toLocaleDateString('en', { weekday: 'short' }).toUpperCase();
      const n = gain(st, xp);
      return { ...n, runs: [{ ...run, day }, ...st.runs].slice(0, 6), bestStars: Math.max(st.bestStars, run.stars) };
    }),
    reset: () => setS(rollDate(seed())),
    clearAll: () => setS((st) => ({ ...rollDate(seed()), xp: 0, done: [], todayXP: 0, streak: 0, weeks: Array(11).fill(0), weekXP: 0, skills: Object.fromEntries(TRACKS.map((t) => [t.code, 0])), perfect: [], bestStars: 0, savedWords: [], runs: [], lessonCard: {}, am: st.am, activeDays: Array(7).fill(false) })),
  }), [s, toast, gain]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useStore() {
  return useContext(Ctx);
}

// Handy derived numbers used on many screens.
export function useDerived() {
  const { s } = useStore();
  return useMemo(() => {
    const done = new Set(s.done);
    const lessonsDone = ALL_STOPS.filter((x) => x.kind === 'lesson' && done.has(x.id)).length;
    const bossesDone = ALL_STOPS.filter((x) => x.kind === 'boss' && done.has(x.id)).length;
    return { done, lessonsDone, bossesDone, level: levelOf(s.xp) };
  }, [s.done, s.xp]);
}
