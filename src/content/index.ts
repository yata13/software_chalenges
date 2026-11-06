import type { Boss, Lesson, Track, TrackId, Word } from './types';
import { machineBoss, machineLessons } from './machine';
import { osBoss, osLessons } from './os';
import { csBoss, csLessons } from './cs';
import { mathBoss, mathLessons } from './math';
import { networkBoss, networkLessons } from './network';
import { telecomBoss, telecomLessons } from './telecom';
import { cloudBoss, cloudLessons } from './cloud';
import { enterpriseBoss, enterpriseLessons } from './enterprise';
import { softwareBoss, softwareLessons } from './software';
import { systemBoss, systemLessons } from './system';
import { securityBoss, securityLessons } from './security';
import { aiBoss, aiLessons } from './ai';
import { humanaiBoss, humanaiLessons } from './humanai';
import { thinkingBoss, thinkingLessons } from './thinking';
import { futureBoss, futureLessons } from './future';

export type { Boss, Lesson, Track, TrackId, Word };

// The roadmap is grouped into 5 phases, studied in order.
export const PHASES = [
  { n: 1, name: 'Foundations', note: 'How computers and code really work' },
  { n: 2, name: 'Networks & Infrastructure', note: 'How machines talk and stay up' },
  { n: 3, name: 'Building Software', note: 'Design, scale and secure real systems' },
  { n: 4, name: 'The AI Era', note: 'How AI works and how to work with it' },
  { n: 5, name: 'Thinking & Career', note: 'Solve problems, plan your future' },
];

export const TRACKS: Track[] = [
  { id: 'machine', n: 1, phase: 1, name: 'The Machine', short: 'Machine', abbr: 'HW', icon: 'cpu', lessons: machineLessons, boss: machineBoss },
  { id: 'os', n: 2, phase: 1, name: 'Operating Systems & Linux', short: 'OS & Linux', abbr: 'OS', icon: 'code', lessons: osLessons, boss: osBoss },
  { id: 'cs', n: 3, phase: 1, name: 'Computer Science & Algorithms', short: 'Algorithms', abbr: 'CS', icon: 'flow', lessons: csLessons, boss: csBoss },
  { id: 'math', n: 4, phase: 1, name: 'Mathematics & Logic', short: 'Math & Logic', abbr: 'MATH', icon: 'binary', lessons: mathLessons, boss: mathBoss },
  { id: 'network', n: 5, phase: 2, name: 'Networking', short: 'Network', abbr: 'NET', icon: 'network', lessons: networkLessons, boss: networkBoss },
  { id: 'telecom', n: 6, phase: 2, name: 'Telecommunications Engineering', short: 'Telecom', abbr: 'TEL', icon: 'wifi', lessons: telecomLessons, boss: telecomBoss },
  { id: 'cloud', n: 7, phase: 2, name: 'Cloud & Servers', short: 'Cloud', abbr: 'CLD', icon: 'cloud', lessons: cloudLessons, boss: cloudBoss },
  { id: 'enterprise', n: 8, phase: 2, name: 'Enterprise IT & Infrastructure', short: 'Enterprise IT', abbr: 'ENT', icon: 'building', lessons: enterpriseLessons, boss: enterpriseBoss },
  { id: 'software', n: 9, phase: 3, name: 'Software Design', short: 'Software', abbr: 'SWD', icon: 'layers', lessons: softwareLessons, boss: softwareBoss },
  { id: 'system', n: 10, phase: 3, name: 'System Design', short: 'System', abbr: 'SYS', icon: 'boxes', lessons: systemLessons, boss: systemBoss },
  { id: 'security', n: 11, phase: 3, name: 'Cybersecurity', short: 'Security', abbr: 'SEC', icon: 'shield', lessons: securityLessons, boss: securityBoss },
  { id: 'ai', n: 12, phase: 4, name: 'AI & Machine Learning', short: 'AI & ML', abbr: 'AI', icon: 'ai', lessons: aiLessons, boss: aiBoss },
  { id: 'humanai', n: 13, phase: 4, name: 'Human-AI Collaboration', short: 'Human + AI', abbr: 'H+AI', icon: 'bot', lessons: humanaiLessons, boss: humanaiBoss },
  { id: 'thinking', n: 14, phase: 5, name: 'Critical Thinking & Problem Solving', short: 'Thinking', abbr: 'THINK', icon: 'brain', lessons: thinkingLessons, boss: thinkingBoss },
  { id: 'future', n: 15, phase: 5, name: 'Future of Tech Jobs', short: 'Future', abbr: 'JOBS', icon: 'jobs', lessons: futureLessons, boss: futureBoss },
];

export const ALL_LESSONS: Lesson[] = TRACKS.flatMap((t) => t.lessons);
export const ALL_BOSSES: Boss[] = TRACKS.map((t) => t.boss);
export const TOTAL_LESSONS = ALL_LESSONS.length;
export const TOTAL_BOSSES = ALL_BOSSES.length;

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
  { name: 'Linux Journey', note: 'Free, step-by-step Linux basics', track: 'os', href: 'https://linuxjourney.com/' },
  { name: 'Khan Academy', note: 'Free math, probability, statistics', track: 'math', href: 'https://www.khanacademy.org/math' },
  { name: 'NeetCode', note: 'Data structures + algorithms, explained', track: 'cs', href: 'https://neetcode.io/' },
  { name: 'Microsoft Learn', note: 'Windows Server, Active Directory, Azure', track: 'enterprise', href: 'https://learn.microsoft.com/training/' },
  { name: 'Anthropic courses', note: 'Prompt engineering, free on GitHub', track: 'humanai', href: 'https://github.com/anthropics/courses' },
  { name: 'roadmap.sh', note: 'Step-by-step role roadmaps', track: 'future', href: 'https://roadmap.sh/' },
];

export const PROMPTS = [
  { name: 'Explain like I’m new', text: 'Explain [topic] in 5 short lines. Add one diagram idea.' },
  { name: 'Quiz me', text: 'Ask me 5 questions on [topic]. One at a time. Explain my mistakes.' },
  { name: 'Amharic help', text: 'Explain [term] in simple Amharic first, then in easy English.' },
  { name: 'Review my design', text: 'Here is my system design: [paste]. Find 3 weak points. Keep it short.' },
  { name: 'Draw it', text: 'Describe [topic] as boxes and arrows I can sketch.' },
];
