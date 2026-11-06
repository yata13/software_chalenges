import { c, q, w, type Boss, type Lesson } from './types';

export const futureLessons: Lesson[] = [
  {
    id: 'future-1', track: 'future', title: 'How AI changes tech jobs', minutes: 8,
    goal: 'See which tasks AI takes over, which skills grow in value, and how to position yourself.',
    diagram: {
      kind: 'compare',
      a: { title: 'AI does well', icon: 'bot', points: ['First drafts of code', 'Boilerplate and tests', 'Summaries and search'] },
      b: { title: 'People still lead', icon: 'users', points: ['Choosing what to build', 'System design + trade-offs', 'Owning results, talking to users'] },
    },
    cards: [
      c('why', 'jobs', 'The job market is changing right now.', 'Plan for where it is going.'),
      c('idea', 'bot', 'AI makes typing code cheap.', 'Judgment and understanding get more valuable.'),
      c('how', 'layers', '[T-shaped skills]: broad base + one deep area.', 'This app is your broad base.'),
      c('how', 'target', 'Deep in one: backend, cloud, data, security…', 'Pick by interest and local demand.'),
      c('how', 'globe', '[Remote work] opens global jobs from Ethiopia.', 'Proof of work matters more than location.'),
      c('example', 'code', 'A junior dev in 2026: AI writes the draft.', 'They read, test, fix, and ship faster.'),
      c('recap', 'check', 'Learn fundamentals + AI tools together.', 'That combination is rare and valuable.'),
    ],
    deep: [
      { title: 'Growing roles', points: ['AI/ML engineer, data engineer.', 'Cloud/DevOps, security engineer.', 'Backend devs who can build with LLMs.'] },
      { title: 'Shrinking tasks (not whole jobs)', points: ['Simple CRUD screens, basic copy, routine reports.', 'People who only did these must move up the stack.'] },
      { title: 'Local opportunities', points: ['Fintech (telebirr, M-Pesa ecosystems), banks digitising.', 'Telecom, government services, ag-tech, outsourcing for global clients.'] },
    ],
    realCase: { title: 'A junior dev in 2026', text: 'Uses AI to write the first draft, then reads, tests and fixes it. Ships faster and learns more.' },
    words: [
      w('T-shaped skills', 'Broad knowledge of many areas plus deep skill in one.'),
      w('Remote work', 'Working for a company from another city or country, online.'),
      w('Proof of work', 'Real projects others can see and test.'),
    ],
    amharic: 'AI ቀላል ስራዎችን ይሰራል፤ ችግር መፍታት የሚችሉ ሰዎች ግን የበለጠ ይፈለጋሉ።',
    quiz: [
      q('Which skill grows in value with AI?', ['Judging if code is right and safe', 'Typing speed', 'Memorizing syntax', 'Using a mouse'], 0, 'AI drafts; people judge and own it.'),
      q('T-shaped means…', ['Broad base + one deep area', 'Only one skill', 'Only theory', 'Only design'], 0, 'Wide enough to connect, deep enough to lead.'),
      q('Best proof for a remote job?', ['Real projects online', 'A long CV only', 'Many certificates only', 'Nothing'], 0, 'Employers want to see what you built.'),
    ],
  },
  {
    id: 'future-2', track: 'future', title: 'The AI engineer stack', minutes: 9,
    goal: 'Know each layer of the AI engineer stack and a practical order to learn it.',
    diagram: {
      kind: 'stack', left: 'PRODUCT', right: 'BASICS',
      layers: [
        { label: 'Product & UI', sub: 'what users touch', icon: 'phone' },
        { label: 'Agents & tools', sub: 'loops, MCP', icon: 'bot' },
        { label: 'RAG & data', sub: 'embeddings, vector DB', icon: 'db', hot: true },
        { label: 'LLM APIs', sub: 'Claude, GPT, open models', icon: 'brain' },
        { label: 'Code + cloud basics', sub: 'Python/TS, Git, APIs, Linux', icon: 'code' },
      ],
    },
    cards: [
      c('why', 'rocket', 'AI engineering is one of the fastest-growing roles.', 'And you can start today.'),
      c('idea', 'layers', 'A stack: each layer sits on the one below.', 'Don’t skip the base.'),
      c('how', 'code', 'Base: Python or TypeScript, Git, REST, Linux.', 'Everything sits on this.'),
      c('how', 'brain', 'Call an [LLM API] from code.', 'Prompts, tokens, cost, streaming.'),
      c('how', 'db', 'Add your data with RAG. Then tools and agents.', 'That is most real AI products.'),
      c('example', 'chat', 'A Telegram AI bot for a clinic’s FAQs.', 'Python + LLM API + small vector DB. One week.'),
      c('recap', 'check', 'Measure quality with [evals].', 'Ship small, measure, improve.'),
    ],
    deep: [
      { title: 'A learning order', points: ['1. Python + Git + Linux basics (Tracks 1–2).', '2. REST APIs + a database (Tracks 9–10).', '3. LLM API calls, prompts, structured output.', '4. RAG, then tool calling, then agents + evals.'] },
      { title: 'Evals', points: ['A set of real questions with good answers.', 'Run them after every change: did quality go up or down?'] },
      { title: 'Cost basics', points: ['You pay per input + output token.', 'Cache repeated prompts; use smaller models for easy tasks.'] },
    ],
    realCase: { title: 'A Telegram AI bot', text: 'Python + an LLM API + a small vector DB of FAQs. A real AI product you can build in a week.' },
    words: [
      w('LLM API', 'A web API you call to use a language model.'),
      w('Evals', 'Tests that check how good your AI answers are.'),
      w('Streaming', 'Showing the AI’s answer word by word as it is generated.'),
    ],
    amharic: 'AI መሐንዲስ ኮድ፣ ዳታ እና LLMን አጣምሮ ምርት ይሰራል።',
    quiz: [
      q('What is the base of the stack?', ['Code + cloud basics', 'Agents', 'UI colours', 'A GPU farm'], 0, 'Everything else is built on solid coding skills.'),
      q('How do you know your AI answers are good?', ['Evals', 'Hope', 'A bigger font', 'More emojis'], 0, 'Evals test answers on real examples.'),
      q('Lower LLM costs by…', ['Smaller models for easy tasks', 'Longer prompts always', 'More retries', 'Never caching'], 0, 'Match model size to task difficulty.'),
    ],
  },
];

export const futureBoss: Boss = {
  id: 'boss-future', track: 'future', title: 'My 90-day plan',
  task: ['Plan your next 90 days.', 'Goal: your first tech job or client.', 'Put the steps in order.'],
  tags: ['90 DAYS', 'PORTFOLIO', 'JOB'],
  blocks: [
    { label: 'Days 1–30: Python + Git + Linux', icon: 'code' },
    { label: 'Days 31–60: Build an API', icon: 'server' },
    { label: 'Days 61–90: AI app + RAG', icon: 'ai' },
    { label: 'Publish on GitHub', icon: 'upload' },
    { label: 'Write a case study', icon: 'doc' },
    { label: 'Apply to 20 jobs', icon: 'jobs' },
    { label: 'Watch videos only', icon: 'video' },
  ],
  start: ['Today'],
  checks: [
    { text: 'Strong basics first', needs: ['Days 1–30: Python + Git + Linux'] },
    { text: 'A real backend project', needs: ['Days 31–60: Build an API'] },
    { text: 'Modern AI skills', needs: ['Days 61–90: AI app + RAG'] },
    { text: 'Proof anyone can see', needs: ['Publish on GitHub', 'Write a case study'], avoid: ['Watch videos only'] },
    { text: 'Get in front of employers', needs: ['Apply to 20 jobs'] },
  ],
  hints: ['Watching is not building. What will you make?', 'Employers want proof: a link they can open.', 'Applying is a skill too. Start before you feel ready.'],
  model: {
    kind: 'flow',
    nodes: [
      { id: 't', label: 'Today', x: 40, y: 110, w: 60 },
      { id: 'a', label: 'Basics', x: 120, y: 50, w: 70 },
      { id: 'b', label: 'API', x: 200, y: 110, w: 60 },
      { id: 'c', label: 'AI app', x: 280, y: 50, w: 70, hot: true },
      { id: 'g', label: 'GitHub', x: 200, y: 185, w: 70 },
      { id: 'j', label: 'Apply', x: 315, y: 160, w: 64, hot: true },
    ],
    edges: [['t', 'a'], ['a', 'b'], ['b', 'c'], ['b', 'g'], ['c', 'g'], ['g', 'j']],
    route: ['t', 'a', 'b', 'c', 'g', 'j'],
  },
  modelNotes: ['Month 1: Python, Git, Linux, small scripts daily.', 'Month 2: a REST API (like the bus ticket API).', 'Month 3: a RAG app, on GitHub with a case study; apply every week.'],
};
