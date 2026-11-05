import type { Boss, Lesson } from './types';

export const futureLessons: Lesson[] = [
  {
    id: 'future-1',
    track: 'future',
    title: 'How AI changes tech jobs',
    minutes: 5,
    diagram: {
      kind: 'compare',
      a: { title: 'AI does well', icon: 'bot', points: ['First drafts of code', 'Boilerplate and tests', 'Summaries and search'] },
      b: { title: 'People still lead', icon: 'users', points: ['Choosing what to build', 'System design + trade-offs', 'Owning results, talking to users'] },
    },
    cards: [
      { icon: 'bot', lines: ['AI writes simple code fast.', 'Typing code is less valuable.'] },
      { icon: 'target', lines: ['Judgment is worth more.', 'Is this code right? Is it safe?'] },
      { icon: 'layers', lines: ['Know the whole system.', 'That is what this app teaches.'] },
      { icon: 'globe', lines: ['[Remote work] opens global jobs.', 'From Addis, for any country.'] },
    ],
    realCase: { title: 'A junior dev in 2026', text: 'Uses AI to write the first draft, then reads, tests and fixes it. Ships 2–3× faster.' },
    words: [
      { term: 'Remote work', meaning: 'Working for a company from another city or country, online.' },
      { term: 'Boilerplate', meaning: 'Repeated, standard code that every project needs.' },
      { term: 'Code review', meaning: 'Reading code carefully to find bugs and risks.' },
    ],
    amharic: 'AI ቀላል ስራዎችን ይሰራል፤ ችግር መፍታት የሚችሉ ሰዎች ግን የበለጠ ይፈለጋሉ።',
    quiz: [
      { q: 'Which skill grows in value with AI?', options: ['Typing speed', 'Judging if code is right and safe', 'Memorizing syntax', 'Using a mouse'], answer: 1, why: 'AI drafts; people must judge and own it.' },
      { q: 'Good way to use AI as a junior?', options: ['Paste code without reading', 'Draft with AI, then read and test', 'Never use it', 'Let it email your boss'], answer: 1, why: 'You stay responsible for what you ship.' },
    ],
  },
  {
    id: 'future-2',
    track: 'future',
    title: 'The AI engineer stack',
    minutes: 6,
    diagram: {
      kind: 'stack',
      left: 'PRODUCT',
      right: 'BASICS',
      layers: [
        { label: 'Product & UI', sub: 'what users touch', icon: 'phone' },
        { label: 'Agents & tools', sub: 'loops, MCP', icon: 'bot' },
        { label: 'RAG & data', sub: 'embeddings, vector DB', icon: 'db', hot: true },
        { label: 'LLM APIs', sub: 'Claude, GPT, open models', icon: 'brain' },
        { label: 'Code + cloud basics', sub: 'Python/TS, Git, APIs', icon: 'code' },
      ],
    },
    cards: [
      { icon: 'code', lines: ['Base: Python or TypeScript, Git, APIs.', 'Everything sits on this.'] },
      { icon: 'brain', lines: ['Call an [LLM API] from code.', 'Prompts, tokens, costs.'] },
      { icon: 'db', lines: ['Add your data with RAG.', 'Then tools and agents.'] },
      { icon: 'rocket', lines: ['Ship a small real product.', 'Then measure with [evals].'] },
    ],
    realCase: { title: 'A Telegram AI bot', text: 'Python + an LLM API + a small vector DB of FAQs. A real AI product you can build in a week.' },
    words: [
      { term: 'LLM API', meaning: 'A web API you call to use a language model.' },
      { term: 'Evals', meaning: 'Tests that check how good your AI answers are.' },
      { term: 'Prompt', meaning: 'The instruction and context you send to an AI.' },
    ],
    amharic: 'AI መሐንዲስ ኮድ፣ ዳታ እና LLMን አጣምሮ ምርት ይሰራል።',
    quiz: [
      { q: 'What is the base of the stack?', options: ['Code + cloud basics', 'Agents', 'UI colors', 'A GPU farm'], answer: 0, why: 'Everything else is built on solid coding skills.' },
      { q: 'How do you know your AI answers are good?', options: ['Evals', 'Hope', 'A bigger font', 'More emojis'], answer: 0, why: 'Evals test answers on real examples.' },
    ],
  },
];

export const futureBoss: Boss = {
  id: 'boss-future',
  track: 'future',
  title: 'My 90-day plan',
  task: ['Plan your next 90 days.', 'Goal: your first tech job or client.', 'Put the steps in order.'],
  tags: ['90 DAYS', 'PORTFOLIO', 'JOB'],
  blocks: [
    { label: 'Days 1–30: Python + Git', icon: 'code' },
    { label: 'Days 31–60: Build an API', icon: 'server' },
    { label: 'Days 61–90: AI app + RAG', icon: 'ai' },
    { label: 'Publish on GitHub', icon: 'upload' },
    { label: 'Write a case study', icon: 'doc' },
    { label: 'Apply to 20 jobs', icon: 'jobs' },
    { label: 'Watch videos only', icon: 'video' },
  ],
  start: ['Today'],
  checks: [
    { text: 'Strong basics first', needs: ['Days 1–30: Python + Git'] },
    { text: 'A real backend project', needs: ['Days 31–60: Build an API'] },
    { text: 'Modern AI skills', needs: ['Days 61–90: AI app + RAG'] },
    { text: 'Proof anyone can see', needs: ['Publish on GitHub', 'Write a case study'], avoid: ['Watch videos only'] },
    { text: 'Get in front of employers', needs: ['Apply to 20 jobs'] },
  ],
  hints: ['Watching is not building. What will you make?', 'Employers want proof: a link they can open.', 'Applying is a skill too. Start before you feel ready.'],
  model: {
    kind: 'flow',
    nodes: [
      { id: 't', label: 'Today', x: 40, y: 110 },
      { id: 'a', label: 'Basics', x: 120, y: 50, w: 70 },
      { id: 'b', label: 'API', x: 200, y: 110, w: 60 },
      { id: 'c', label: 'AI app', x: 280, y: 50, w: 70, hot: true },
      { id: 'g', label: 'GitHub', x: 200, y: 185, w: 70 },
      { id: 'j', label: 'Apply', x: 315, y: 160, w: 64, hot: true },
    ],
    edges: [['t', 'a'], ['a', 'b'], ['b', 'c'], ['b', 'g'], ['c', 'g'], ['g', 'j']],
    route: ['t', 'a', 'b', 'c', 'g', 'j'],
  },
  modelNotes: ['Month 1: Python, Git, small scripts daily.', 'Month 2: a REST API (like the bus ticket API).', 'Month 3: a RAG app, on GitHub, then apply every week.'],
};
