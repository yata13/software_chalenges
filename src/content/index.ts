import type { Boss, Lesson, Track, TrackId, Word } from './types';
import { machineBoss, machineLessons } from './machine';
import { networkBoss, networkLessons } from './network';
import { cloudBoss, cloudLessons } from './cloud';
import { softwareBoss, softwareLessons } from './software';
import { systemBoss, systemLessons } from './system';
import { securityBoss, securityLessons } from './security';
import { aiBoss, aiLessons } from './ai';
import { futureBoss, futureLessons } from './future';

export type { Boss, Lesson, Track, TrackId, Word };

export const TRACKS: Track[] = [
  { id: 'machine', n: 1, name: 'The Machine', short: 'Machine', abbr: 'HW', icon: 'cpu', lessons: machineLessons, boss: machineBoss },
  { id: 'network', n: 2, name: 'Networking', short: 'Network', abbr: 'NET', icon: 'network', lessons: networkLessons, boss: networkBoss },
  { id: 'cloud', n: 3, name: 'Cloud & Servers', short: 'Cloud', abbr: 'CLD', icon: 'cloud', lessons: cloudLessons, boss: cloudBoss },
  { id: 'software', n: 4, name: 'Software Design', short: 'Software', abbr: 'SWD', icon: 'layers', lessons: softwareLessons, boss: softwareBoss },
  { id: 'system', n: 5, name: 'System Design', short: 'System', abbr: 'SYS', icon: 'flow', lessons: systemLessons, boss: systemBoss },
  { id: 'security', n: 6, name: 'Cybersecurity', short: 'Security', abbr: 'SEC', icon: 'shield', lessons: securityLessons, boss: securityBoss },
  { id: 'ai', n: 7, name: 'AI & Machine Learning', short: 'AI & ML', abbr: 'AI', icon: 'ai', lessons: aiLessons, boss: aiBoss },
  { id: 'future', n: 8, name: 'Future of Tech Jobs', short: 'Future', abbr: 'JOBS', icon: 'jobs', lessons: futureLessons, boss: futureBoss },
];

export const ALL_LESSONS: Lesson[] = TRACKS.flatMap((t) => t.lessons);
export const ALL_BOSSES: Boss[] = TRACKS.map((t) => t.boss);
export const TOTAL_LESSONS = ALL_LESSONS.length;

export const getTrack = (id: string) => TRACKS.find((t) => t.id === id);
export const getLesson = (id: string) => ALL_LESSONS.find((l) => l.id === id);
export const getBoss = (id: string) => ALL_BOSSES.find((b) => b.id === id);

// "2.3" style number for a lesson
export function lessonNum(l: Lesson) {
  const t = getTrack(l.track)!;
  return `${t.n}.${t.lessons.indexOf(l) + 1}`;
}

// Word bank: every key word from every lesson, A → Z.
export interface BankWord extends Word { track: TrackId; lessonId: string }
const seen = new Set<string>();
export const WORD_BANK: BankWord[] = ALL_LESSONS.flatMap((l) => l.words.map((w) => ({ ...w, track: l.track, lessonId: l.id })))
  .filter((w) => { const k = w.term.toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true; })
  .sort((a, b) => a.term.localeCompare(b.term));

export function findWord(term: string, local?: Word[]): Word | undefined {
  const k = term.toLowerCase();
  return local?.find((w) => w.term.toLowerCase() === k) ?? WORD_BANK.find((w) => w.term.toLowerCase() === k);
}

export const COURSES = [
  { name: 'CS50x', note: 'Harvard · programming basics', track: 'machine', href: 'https://cs50.harvard.edu/x/' },
  { name: 'freeCodeCamp', note: 'Web + JavaScript, with certificates', track: 'software', href: 'https://www.freecodecamp.org/' },
  { name: 'Professor Messer', note: 'Network+ video course', track: 'network', href: 'https://www.professormesser.com/' },
  { name: 'System Design Primer', note: 'GitHub guide with diagrams', track: 'system', href: 'https://github.com/donnemartin/system-design-primer' },
  { name: 'OWASP Top 10', note: 'The biggest web risks', track: 'security', href: 'https://owasp.org/www-project-top-ten/' },
  { name: 'ML Crash Course', note: 'Google · machine learning', track: 'ai', href: 'https://developers.google.com/machine-learning/crash-course' },
  { name: 'Hugging Face Learn', note: 'LLM and agents courses', track: 'ai', href: 'https://huggingface.co/learn' },
  { name: 'roadmap.sh', note: 'Step-by-step role roadmaps', track: 'future', href: 'https://roadmap.sh/' },
];

export const PROMPTS = [
  { name: 'Explain like I’m new', text: 'Explain [topic] in 5 short lines. Add one diagram idea.' },
  { name: 'Quiz me', text: 'Ask me 5 questions on [topic]. One at a time. Explain my mistakes.' },
  { name: 'Amharic help', text: 'Explain [term] in simple Amharic first, then in easy English.' },
  { name: 'Review my design', text: 'Here is my system design: [paste]. Find 3 weak points. Keep it short.' },
  { name: 'Draw it', text: 'Describe [topic] as boxes and arrows I can sketch.' },
];
