// 8 tracks · 92 lessons · 22 bosses. A boss comes after every 4 lessons.
export const TRACKS = [
  {
    code: 'T1', n: 1, name: 'Hardware & Servers', short: 'Hardware', abbr: 'HW', icon: 'server',
    lessons: ['What’s inside a computer', 'CPU: the brain', 'RAM vs storage', 'CPU vs GPU', 'Motherboard & buses', 'How SSDs store data', 'What a server is', 'Racks & data centers', 'Virtual machines', 'Containers', 'Data centers & cooling', 'Cloud regions & zones'],
    bosses: ['Build a PC for video editing', 'Pick a server for a small office', 'Plan hosting for a startup'],
  },
  {
    code: 'T2', n: 2, name: 'Networking', short: 'Networking', abbr: 'NET', icon: 'network',
    lessons: ['What is a network', 'IP addresses', 'Routers & switches', 'Ports & protocols', 'TCP vs UDP', 'How DNS works', 'HTTP & HTTPS', 'What happens when you open a URL', 'Load balancers', 'CDNs', 'Firewalls & NAT', 'Latency & bandwidth'],
    bosses: ['Map your home Wi-Fi', 'Debug “site won’t load”', 'Design an office network'],
  },
  {
    code: 'T3', n: 3, name: 'Programming Basics', short: 'Programming', abbr: 'CODE', icon: 'code',
    lessons: ['What code is', 'Variables & types', 'If / else', 'Loops', 'Functions', 'Arrays & objects', 'How the computer runs code', 'Errors & debugging', 'Git basics', 'APIs & JSON', 'Async: waiting for data', 'Clean code habits'],
    bosses: ['FizzBuzz, drawn out', 'Fix the broken app', 'Build a tiny to-do API'],
  },
  {
    code: 'T4', n: 4, name: 'Software Design', short: 'Software Design', abbr: 'SWD', icon: 'layers',
    lessons: ['Why design matters', 'Modules & layers', 'Separation of concerns', 'MVC pattern', 'SOLID in plain words', 'Design patterns 101', 'State & data flow', 'Testing basics', 'Refactoring', 'Monolith vs microservices', 'Event-driven design', 'Documenting a design'],
    bosses: ['Split a messy app', 'Design a plugin system', 'Review a real codebase'],
  },
  {
    code: 'T5', n: 5, name: 'System Design', short: 'System Design', abbr: 'SYS', icon: 'system',
    lessons: ['What system design is', 'Scale up vs scale out', 'Caching', 'SQL vs NoSQL', 'Replication & sharding', 'Queues & workers', 'Rate limiting', 'CAP in plain words', 'Design a URL shortener', 'Design a news feed', 'Monitoring & alerts', 'Cost & trade-offs'],
    bosses: ['Results Day traffic', 'Design a chat app', 'Design a ride-hailing app'],
  },
  {
    code: 'T6', n: 6, name: 'Cybersecurity', short: 'Security', abbr: 'SEC', icon: 'security',
    lessons: ['The CIA triad', 'Passwords & hashing', 'Phishing', 'Encryption basics', 'HTTPS & certificates', 'Common web attacks', 'Firewalls & VPNs', 'Sessions vs tokens', 'OWASP Top 10', 'Secure coding', 'Logs & incident response', 'Security careers'],
    bosses: ['Spot the phishing email', 'Lock down a login', 'Respond to a breach'],
  },
  {
    code: 'T7', n: 7, name: 'AI & Machine Learning', short: 'AI & ML', abbr: 'AI', icon: 'ai',
    lessons: ['What AI really is', 'How machines learn', 'Neural networks', 'How an LLM predicts words', 'Tokens & context', 'Embeddings', 'RAG: give AI your docs', 'Prompting well', 'AI agents', 'Fine-tuning vs RAG', 'AI limits & risks', 'Build a small AI app'],
    bosses: ['Train a tiny classifier', 'Design a RAG helper', 'Plan an AI agent'],
  },
  {
    code: 'T8', n: 8, name: 'Future of Tech Jobs', short: 'Tech Jobs', abbr: 'JOBS', icon: 'jobs',
    lessons: ['What AI changes', 'Roles that grow', 'Skills that last', 'T-shaped skills', 'Building a portfolio', 'Remote work from Ethiopia', 'Freelance vs full-time', 'Your learning plan'],
    bosses: ['Map your next role', 'Pitch your portfolio'],
  },
];

// Ordered stops on a track line: lessons, with a boss after every 4th.
export function trackStops(track) {
  const stops = [];
  track.lessons.forEach((title, i) => {
    const num = i + 1;
    stops.push({ kind: 'lesson', id: `${track.n}.${num}`, num: `${track.n}.${num}`, title, track: track.code });
    if (num % 4 === 0) {
      const b = num / 4;
      stops.push({ kind: 'boss', id: `${track.n}.B${b}`, num: `B${b}`, title: track.bosses[b - 1], track: track.code });
    }
  });
  return stops;
}

export const ALL_STOPS = TRACKS.flatMap(trackStops);
export const TOTAL_LESSONS = TRACKS.reduce((n, t) => n + t.lessons.length, 0);
export const TOTAL_BOSSES = TRACKS.reduce((n, t) => n + t.bosses.length, 0);

export function findStop(id) {
  return ALL_STOPS.find((s) => s.id === id);
}
export function trackOf(code) {
  return TRACKS.find((t) => t.code === code);
}

// Per-track status from the set of finished stop ids.
export function trackProgress(track, done) {
  const stops = trackStops(track);
  const doneLessons = stops.filter((s) => s.kind === 'lesson' && done.has(s.id)).length;
  const next = stops.find((s) => !done.has(s.id)) || null;
  return {
    stops,
    doneLessons,
    total: track.lessons.length,
    pct: Math.round((doneLessons / track.lessons.length) * 100),
    next,
    complete: !next,
    doneCount: stops.filter((s) => done.has(s.id)).length,
  };
}

export const LEVELS = [0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5200, 6600, 8200];
export const LEVEL_NAMES = ['Curious Beginner', 'Bit Explorer', 'Byte Builder', 'Code Tinkerer', 'Circuit Walker', 'Packet Tracer', 'Network Apprentice', 'System Sketcher', 'Blueprint Architect', 'Cloud Navigator', 'Tech Mentor', 'Tech Legend'];

export function levelOf(xp) {
  let lvl = 1;
  for (let i = 0; i < LEVELS.length; i++) if (xp >= LEVELS[i]) lvl = i + 1;
  const next = LEVELS[lvl] ?? LEVELS[LEVELS.length - 1] + 2000;
  return { level: lvl, name: LEVEL_NAMES[lvl - 1], next, toNext: next - xp, pct: Math.min(100, Math.round((xp / next) * 100)) };
}
