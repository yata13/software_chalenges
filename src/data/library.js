import { LESSONS } from './lessons.js';

// ---------- Word bank ----------
const BASE_WORDS = [
  { term: 'Latency', track: 'T2', am: 'መዘግየት', def: 'Time for data to travel. Lower = faster.' },
  { term: 'Bandwidth', track: 'T2', def: 'How much data fits through per second.' },
  { term: 'Router', track: 'T2', def: 'Sends data between networks. Picks the path.' },
  { term: 'Packet', track: 'T2', def: 'A small piece of data sent over a network.' },
  { term: 'Port', track: 'T2', def: 'A numbered door on a computer. Web = 443.' },
  { term: 'HTTPS', track: 'T2', def: 'Web traffic, locked with encryption.' },
  { term: 'CDN', track: 'T2', def: 'Copies of files on servers near users.' },
  { term: 'Server', track: 'T1', am: 'ሰርቨር', def: 'A computer that answers other computers.' },
  { term: 'RAM', track: 'T1', def: 'Fast, short-term memory. Empty when power is off.' },
  { term: 'SSD', track: 'T1', def: 'Fast storage with no moving parts.' },
  { term: 'Container', track: 'T1', def: 'An app packed with everything it needs to run.' },
  { term: 'API', track: 'T3', def: 'A menu one program offers another.' },
  { term: 'Variable', track: 'T3', def: 'A named box that holds a value.' },
  { term: 'Function', track: 'T3', def: 'A named set of steps you can reuse.' },
  { term: 'JSON', track: 'T3', def: 'A simple text format for data.' },
  { term: 'Git', track: 'T3', def: 'Saves every version of your code.' },
  { term: 'Bug', track: 'T3', def: 'A mistake in code that causes wrong results.' },
  { term: 'Module', track: 'T4', def: 'One part of an app with one clear job.' },
  { term: 'Refactoring', track: 'T4', def: 'Cleaning code without changing what it does.' },
  { term: 'Microservice', track: 'T4', def: 'A small app that does one job, alone.' },
  { term: 'Replica', track: 'T5', def: 'A copy of a database, kept in sync.' },
  { term: 'Queue', track: 'T5', def: 'A waiting line for jobs. First in, first out.' },
  { term: 'Sharding', track: 'T5', def: 'Splitting data across many databases.' },
  { term: 'Rate limit', track: 'T5', def: 'A max number of requests per minute.' },
  { term: 'Firewall', track: 'T6', def: 'A guard that blocks bad traffic.' },
  { term: 'Phishing', track: 'T6', def: 'A fake message that steals passwords.' },
  { term: 'Encryption', track: 'T6', am: 'ምስጠራ', def: 'Locking data so only the key holder can read it.' },
  { term: 'Hashing', track: 'T6', def: 'A one-way scramble. Used to store passwords.' },
  { term: 'Password', track: 'T6', am: 'የይለፍ ቃል', def: 'A secret word that proves it’s you.' },
  { term: 'Prompt', track: 'T7', def: 'The instruction you give an AI.' },
  { term: 'AI agent', track: 'T7', def: 'An AI that plans steps and uses tools.' },
  { term: 'Fine-tuning', track: 'T7', def: 'Extra training on your own examples.' },
  { term: 'Portfolio', track: 'T8', def: 'Projects that show what you can build.' },
];

const LESSON_WORDS = Object.values(LESSONS).flatMap((l) => l.words.map((w) => ({ ...w, track: l.track })));
const seen = new Set();
export const WORDS = [...LESSON_WORDS, ...BASE_WORDS]
  .filter((w) => (seen.has(w.term.toLowerCase()) ? false : seen.add(w.term.toLowerCase())))
  .sort((a, b) => a.term.localeCompare(b.term));

export function lookupWord(term) {
  const t = term.toLowerCase();
  return WORDS.find((w) => w.term.toLowerCase() === t);
}

export const WORD_FILTERS = [
  { id: 'all', label: 'ALL' },
  { id: 'T1', label: 'HARDWARE' },
  { id: 'T2', label: 'NETWORK' },
  { id: 'T3', label: 'CODE' },
  { id: 'T5', label: 'SYSTEM' },
  { id: 'T6', label: 'SECURITY' },
  { id: 'T7', label: 'AI' },
  { id: 'saved', label: 'SAVED' },
];

// ---------- Free courses ----------
export const COURSES = [
  { n: 'CS50x', d: 'Harvard · programming basics', tr: 'T3', href: 'https://cs50.harvard.edu/x/' },
  { n: 'freeCodeCamp', d: 'Web + JavaScript, with certificates', tr: 'T3', href: 'https://www.freecodecamp.org/' },
  { n: 'Professor Messer', d: 'Network+ video course', tr: 'T2', href: 'https://www.professormesser.com/' },
  { n: 'System Design Primer', d: 'GitHub guide with diagrams', tr: 'T5', href: 'https://github.com/donnemartin/system-design-primer' },
  { n: 'OWASP Top 10', d: 'The 10 biggest web risks', tr: 'T6', href: 'https://owasp.org/www-project-top-ten/' },
  { n: 'ML Crash Course', d: 'Google · machine learning', tr: 'T7', href: 'https://developers.google.com/machine-learning/crash-course' },
  { n: 'Hugging Face Learn', d: 'LLM and agents courses', tr: 'T7', href: 'https://huggingface.co/learn' },
  { n: 'roadmap.sh', d: 'Step-by-step role roadmaps', tr: 'T8', href: 'https://roadmap.sh/' },
];

// ---------- Prompts ----------
export const DEFAULT_PROMPTS = [
  { id: 'p1', n: 'Explain like I’m new', a: 'Explain ', slot: '[topic]', b: ' in 5 short lines. Add one diagram idea.' },
  { id: 'p2', n: 'Quiz me', a: 'Ask me 5 questions on ', slot: '[topic]', b: '. One at a time. Explain my mistakes.' },
  { id: 'p3', n: 'Amharic help', a: 'Explain ', slot: '[term]', b: ' in simple Amharic first, then in easy English.' },
  { id: 'p4', n: 'Review my design', a: 'Here is my system design: ', slot: '[paste]', b: '. Find 3 weak points. Keep it short.' },
  { id: 'p5', n: 'Draw it', a: 'Describe ', slot: '[topic]', b: ' as boxes and arrows I can sketch.' },
];

// ---------- Practice pool ----------
const EXTRA = [
  { track: 'T4', type: 'text', q: 'Which one is NOT a database?', options: ['PostgreSQL', 'Redis', 'Nginx', 'MongoDB'], answer: 2, why: 'Nginx is a web server. It sends pages, it doesn’t store data.' },
  { track: 'T2', type: 'text', q: 'Video call: TCP or UDP?', options: ['TCP', 'UDP'], answer: 1, why: 'UDP is fast. A lost frame is OK; waiting is not.' },
  { track: 'T3', type: 'text', q: 'What does Git save?', options: ['Passwords', 'Every version of your code', 'Wi-Fi settings', 'Photos only'], answer: 1, why: 'You can go back to any old version.' },
  { track: 'T6', type: 'text', q: 'Email says “Your bank account is locked, click here”. It’s…', options: ['Normal', 'Likely phishing', 'An API', 'A firewall'], answer: 1, why: 'Fear + a link = classic phishing.' },
  { track: 'T5', type: 'text', q: 'Same page, read 1M times. Best help?', options: ['A cache', 'A bigger screen', 'More passwords', 'A slower DB'], answer: 0, why: 'Build it once, serve the saved copy.' },
  { track: 'T1', type: 'text', q: 'Power goes off. What is lost?', options: ['SSD files', 'What was in RAM', 'Your Git history', 'Nothing'], answer: 1, why: 'RAM is short-term memory. It needs power.' },
  { track: 'T6', type: 'text', q: 'How should a site store passwords?', options: ['Plain text', 'Hashed', 'In the URL', 'In an email'], answer: 1, why: 'A hash is one-way. Leaks show scrambled text.' },
  { track: 'T3', type: 'text', q: 'An API is…', options: ['A menu one program offers another', 'A type of RAM', 'A Wi-Fi brand', 'A virus'], answer: 0, why: 'Programs ask an API for data or actions.' },
];

export const PRACTICE_POOL = [
  ...Object.values(LESSONS).flatMap((l) => l.quiz.map((q, i) => ({ ...q, track: l.track, from: l.id, key: `${l.id}-${i}` }))),
  ...EXTRA.map((q, i) => ({ ...q, key: `x-${i}` })),
];

// ---------- Boss challenge ----------
export const BOSS_RESULTS_DAY = {
  id: '5.B1', track: 'T5', title: 'Results Day traffic', xp: 150,
  task: ['1 million students check exam results.', 'All start at 9:00, within one hour.', 'Draw a system that stays up.'],
  tags: ['1M USERS', 'SPIKE AT 9:00', 'MOSTLY READS'],
  palette: [
    { kind: 'web', label: 'SERVER', icon: 'server', box: 'Web' },
    { kind: 'lb', label: 'LOAD BAL.', icon: 'network', box: 'Load balancer' },
    { kind: 'cache', label: 'CACHE', icon: 'cache', box: 'Cache' },
    { kind: 'db', label: 'DB', icon: 'db', box: 'Database' },
    { kind: 'replica', label: 'REPLICA', icon: 'db', box: 'Replica' },
    { kind: 'cdn', label: 'CDN', icon: 'cloud', box: 'CDN' },
    { kind: 'queue', label: 'QUEUE', icon: 'queue', box: 'Queue' },
  ],
  start: [
    { kind: 'users', box: 'Students', x: 0.5, y: 0.1 },
    { kind: 'web', box: 'Web 1', x: 0.5, y: 0.45 },
    { kind: 'db', box: 'Database', x: 0.5, y: 0.82 },
  ],
  checks: [
    { id: 'split', text: 'Traffic is split across servers', test: (c) => c.lb >= 1 && c.web >= 2 },
    { id: 'survive', text: 'Site survives one server dying', test: (c) => c.web >= 2 },
    { id: 'cache', text: 'Same page isn’t built 1M times', test: (c) => c.cache >= 1 },
    { id: 'db', text: 'Database is not one weak point', test: (c) => c.replica >= 1 || c.db >= 2 },
    { id: 'cdn', text: 'Images and CSS load fast', test: (c) => c.cdn >= 1 },
  ],
  hints: [
    'Most students open the same page. What can remember answers?',
    'One database gets tired. Make copies for reading.',
    'Put images close to users: a CDN.',
  ],
  model: ['Cache: same page served from memory.', 'Replicas share the reading work.', 'CDN sends images from nearby.'],
};
