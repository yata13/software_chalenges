import { LESSONS, LESSON_IDS } from './lessons.js';
import { TRACKS, trackOf, ALL_STOPS } from './tracks.js';
import { BOSS_RESULTS_DAY } from './library.js';

export const BOSSES = { [BOSS_RESULTS_DAY.id]: BOSS_RESULTS_DAY };

export const isPlayable = (id) => Boolean(LESSONS[id] || BOSSES[id]);
export const stopHref = (stop) => (stop.kind === 'boss' ? `#/boss/${stop.id}` : `#/lesson/${stop.id}`);

// The lesson to continue: first full lesson not done yet.
export function continueLesson(done) {
  const order = ALL_STOPS.filter((s) => LESSONS[s.id]).map((s) => s.id);
  const id = order.find((x) => !done.has(x)) || LESSON_IDS[0];
  return LESSONS[id];
}

export function currentTrack(done) {
  return trackOf(continueLesson(done).track) || TRACKS[0];
}

// A boss that is ready (next stop on its track, and playable)
export function readyBoss(done) {
  return Object.values(BOSSES).find((b) => !done.has(b.id)) || null;
}

export function lessonIndexInTrack(id) {
  return Number(id.split('.')[1]);
}
