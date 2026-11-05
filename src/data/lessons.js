// Full lessons. Rule #1: visual first, text last.
// Max 3 short lines per block, max 10 words per line.
// [Word] in a card line = hard word → tap to explain (must exist in `words`).
// `mini` = tiny diagram for the card: box / arrow / icon / text / ok parts.

export const LESSONS = {
  '1.4': {
    id: '1.4', track: 'T1', title: 'CPU vs GPU', fig: 'FIG 1.4 — CORES', minutes: 5, xp: 20,
    diagram: 'cpugpu',
    steps: ['1 TASK', '2 CPU', '3 GPU', '4 RESULT'],
    cards: [
      { mini: [{ icon: 'chip' }, { text: '= the brain' }], a: 'The [CPU] runs your computer.', b: 'Apps, files, the OS: all CPU work.' },
      { mini: [{ box: 'CORE' }, { box: 'CORE' }, { box: 'CORE' }, { box: 'CORE' }], a: 'A CPU has a few big [cores].', b: 'Each core is smart and very fast.' },
      { mini: [{ grid: true }], a: 'A [GPU] has thousands of tiny cores.', b: 'Each one is simple. Together, huge.' },
      { mini: [{ box: '1 hard job' }, { arrow: true }, { box: 'CPU', r: true }], a: 'One hard job, step by step?', b: 'The CPU wins.' },
      { mini: [{ box: '1M small jobs' }, { arrow: true }, { box: 'GPU', r: true }], a: 'Millions of small, same jobs?', b: 'The GPU wins. Pixels, AI math.' },
    ],
    example: { icon: 'ai', title: 'Why AI needs GPUs', text: 'Training = billions of small multiplications. Many tiny cores do them at once.' },
    words: [
      { term: 'CPU', def: 'Central Processing Unit. The main brain of a computer.' },
      { term: 'GPU', def: 'Graphics Processing Unit. Many small cores working together.' },
      { term: 'Cores', def: 'Workers inside a chip. Each core runs tasks.' },
      { term: 'Parallel', def: 'Many jobs done at the same time.' },
    ],
    am: 'CPU ጥቂት ጠንካራ ኮሮች አሉት፤ GPU ደግሞ ብዙ ትናንሽ ኮሮች አሉት።',
    en: 'CPU: few strong cores. GPU: many tiny cores.',
    quiz: [
      { type: 'pic', q: 'Which picture is a GPU?', options: [{ pic: 'cpu', alt: 'Four big cores' }, { pic: 'gpu', alt: 'A grid of many tiny cores' }], answer: 1, why: 'Many tiny cores do small math at once.', wrong: ['Four big cores is a CPU.'] },
      { type: 'text', q: 'Your laptop opens a file. Who does the work?', options: ['CPU', 'GPU', 'Monitor', 'Wi-Fi router'], answer: 0, why: 'One general job, step by step: CPU work.' },
      { type: 'text', q: 'Why do AI teams buy GPUs?', options: ['They are cheaper', 'Many small math jobs at once', 'They store more files', 'They have better Wi-Fi'], answer: 1, why: 'AI training is millions of small, same calculations.' },
    ],
  },

  '2.6': {
    id: '2.6', track: 'T2', title: 'How DNS works', fig: 'FIG 2.6 — DNS LOOKUP', minutes: 6, xp: 20,
    diagram: 'dns',
    steps: ['1 ASK', '2 ROOT', '3 .COM', '4 ANSWER'],
    cards: [
      { mini: [{ box: 'example.com' }, { arrow: true }, { box: '203.0.113.7', r: true }], a: 'Names are easy for people.', b: 'Computers need numbers: an [IP address].' },
      { mini: [{ icon: 'phone' }, { text: '“example.com?”' }, { icon: 'network', r: true }], a: 'Your phone asks a [resolver].', b: 'Your ISP runs one. Or use 1.1.1.1.' },
      { mini: [{ box: '.' }, { arrow: true }, { box: '.com' }, { arrow: true }, { box: 'example.com', r: true }], a: 'The resolver asks 3 servers.', b: 'Root → .com → the site’s own server.' },
      { mini: [{ ok: true }, { text: 'example.com = 203.0.113.7' }], a: 'The IP comes back to you.', b: 'Now your browser can connect.' },
      { mini: [{ icon: 'timer' }, { box: 'CACHE · TTL 300s', dash: true }], a: 'The answer is saved ([cache]).', b: 'Next visit is instant. [TTL] sets how long.' },
    ],
    example: { icon: 'wifi', title: 'Wi-Fi works, but no site opens?', text: 'Often DNS is down. Try resolver 1.1.1.1.' },
    words: [
      { term: 'DNS', def: 'Domain Name System. Turns names into IP numbers.' },
      { term: 'IP address', def: 'A number that finds a device on a network.' },
      { term: 'Resolver', def: 'The server that searches the IP for you.' },
      { term: 'Cache', def: 'A saved copy, so next time is faster.' },
      { term: 'TTL', def: 'Time To Live: how long to keep the cache.' },
    ],
    am: 'DNS የድረ-ገጽ ስምን ወደ IP ቁጥር የሚቀይር የኢንተርኔት የስልክ ማውጫ ነው።',
    en: 'DNS is the internet’s phone book: name → number.',
    quiz: [
      { type: 'text', q: 'What does DNS give your browser?', options: ['An IP address', 'A password', 'A web page', 'A Wi-Fi signal'], answer: 0, why: 'DNS turns a name into an IP number.' },
      { type: 'text', q: 'Who does the searching for you?', options: ['Root server', 'DNS resolver', 'Your screen', 'The .com server'], answer: 1, why: 'The resolver asks root, .com and the name server.', wrong: ['Root only points the way. The resolver searches.', null, null, '.com only points to the next server.'] },
      { type: 'pic', q: 'Which picture shows a DNS lookup?', options: [{ pic: 'lb', alt: 'Users go into one box that splits to three servers' }, { pic: 'dns', alt: 'A phone asks a globe, which asks three servers in turn' }], answer: 1, why: 'Phone → resolver → 3 servers, one by one.', wrong: ['That is a load balancer splitting traffic.'] },
      { type: 'text', q: 'Second visit is instant. Why?', options: ['Faster Wi-Fi', 'The answer was cached', 'The site moved', 'DNS was skipped forever'], answer: 1, why: 'The IP was saved for the TTL time.' },
      { type: 'text', q: 'Wi-Fi is on but no site opens. Try…', options: ['Buy a new phone', 'Resolver 1.1.1.1', 'Delete your browser', 'Restart the website'], answer: 1, why: 'A broken resolver breaks every name lookup.' },
    ],
  },

  '2.9': {
    id: '2.9', track: 'T2', title: 'Load balancers', fig: 'FIG 2.9 — LOAD BALANCER', minutes: 5, xp: 20,
    diagram: 'lb',
    steps: ['1 USERS', '2 SPLIT', '3 SERVE', '4 FAILOVER'],
    cards: [
      { mini: [{ icon: 'users' }, { arrow: true }, { icon: 'server' }, { text: '= overload' }], a: 'One server gets too many users.', b: 'It slows down, then crashes.' },
      { mini: [{ icon: 'users' }, { arrow: true }, { box: 'LB', r: true }, { arrow: true }, { icon: 'server' }, { icon: 'server' }], a: 'A [load balancer] stands in front.', b: 'One address. Many servers behind it.' },
      { mini: [{ box: '50%' }, { box: '50%' }], a: 'It splits the traffic.', b: 'Often in turns: [round robin].' },
      { mini: [{ icon: 'server' }, { text: 'OK?' }, { ok: true }], a: 'It runs a [health check].', b: 'A dead server gets no users.' },
      { mini: [{ box: 'Server 3 down', dash: true }, { arrow: true }, { box: 'others take over', r: true }], a: 'One server dies? No problem.', b: 'The others take its users.' },
    ],
    example: { icon: 'users', title: 'Exam results day', text: 'Millions click at 9:00. A load balancer spreads them out.' },
    words: [
      { term: 'Load balancer', def: 'Splits traffic across many servers.' },
      { term: 'Round robin', def: 'Give each server a turn, one by one.' },
      { term: 'Health check', def: 'A quick “are you alive?” test, every few seconds.' },
      { term: 'Scale out', def: 'Add more servers instead of a bigger one.' },
    ],
    am: 'ሎድ ባላንሰር ተጠቃሚዎችን በብዙ ሰርቨሮች መካከል ያከፋፍላል።',
    en: 'A load balancer shares users across many servers.',
    quiz: [
      { type: 'pic', q: 'Which picture shows a load balancer?', options: [{ pic: 'lb', alt: 'Users go into one box that splits to three servers' }, { pic: 'single', alt: 'Users go to one server, then one database' }, { pic: 'replica', alt: 'One database copies itself to two others' }, { pic: 'dns', alt: 'A phone asks a globe, which asks three servers in turn' }], answer: 0, why: 'It takes all traffic and splits it across servers.', wrong: [null, 'B is one server and a database. Nothing splits traffic.', 'C is a database copying itself (replication).', 'D is a DNS lookup, not a load balancer.'] },
      { type: 'text', q: 'Server 2 stops answering. The load balancer…', options: ['Stops all traffic', 'Sends users to other servers', 'Restarts the internet', 'Deletes server 2'], answer: 1, why: 'The health check fails, so it skips server 2.' },
      { type: 'text', q: '“Round robin” means…', options: ['Each server gets a turn', 'The fastest server only', 'Random users are blocked', 'One big server'], answer: 0, why: 'Server 1, server 2, server 3, then again.' },
    ],
  },

  '7.3': {
    id: '7.3', track: 'T7', title: 'Neural networks', fig: 'FIG 7.3 — NEURAL NET', minutes: 6, xp: 20,
    diagram: 'neural',
    steps: ['1 INPUT', '2 HIDDEN', '3 HIDDEN', '4 OUTPUT'],
    cards: [
      { mini: [{ text: 'has a link · says “FREE”' }, { arrow: true }, { box: 'spam?', r: true }], a: 'Inputs are clues, as numbers.', b: 'Here: is this email spam?' },
      { mini: [{ dots: 3 }, { arrow: true }, { dots: 1 }], a: 'Each dot is a [neuron].', b: 'It adds up signals from before.' },
      { mini: [{ text: 'thin' }, { line: 'w' }, { text: 'thick' }, { line: 'r' }], a: 'Links have a [weight].', b: 'Strong links matter more.' },
      { mini: [{ box: 'Spam 92%', r: true }, { box: 'Normal 2%' }], a: 'The last layer gives scores.', b: 'Highest score = the answer.' },
      { mini: [{ icon: 'replay' }, { text: 'wrong → adjust weights' }], a: '[Training] fixes the weights.', b: 'Many examples. Small fixes. Repeat.' },
    ],
    example: { icon: 'doc', title: 'Your spam folder', text: 'Gmail’s filter learned from millions of marked emails.' },
    words: [
      { term: 'Neuron', def: 'A dot that adds signals and passes one on.' },
      { term: 'Weight', def: 'How strong a link is. Learned in training.' },
      { term: 'Training', def: 'Showing examples and fixing weights after mistakes.' },
      { term: 'Layer', def: 'A column of neurons. Signal goes layer to layer.' },
    ],
    am: 'ኒውራል ኔትወርክ ከምሳሌዎች የሚማሩ የተያያዙ ነጥቦች ንብርብሮች ነው።',
    en: 'A neural network: layers of dots that learn from examples.',
    quiz: [
      { type: 'text', q: 'What does training change?', options: ['The weights', 'The screen', 'The inputs', 'The internet speed'], answer: 0, why: 'Training adjusts how strong each link is.' },
      { type: 'pic', q: 'Which picture is a neural network?', options: [{ pic: 'nn', alt: 'Columns of dots linked to the next column' }, { pic: 'lb', alt: 'Users go into one box that splits to three servers' }], answer: 0, why: 'Layers of dots, each linked to the next layer.', wrong: [null, 'That is a load balancer.'] },
      { type: 'text', q: 'Output says Spam 92%, Normal 2%. Answer?', options: ['Normal', 'Spam', 'Both', 'No answer'], answer: 1, why: 'The highest score wins.' },
    ],
  },

  '7.4': {
    id: '7.4', track: 'T7', title: 'How an LLM predicts words', fig: 'FIG 7.4 — NEXT TOKEN', minutes: 6, xp: 20,
    diagram: 'llm',
    steps: ['1 READ', '2 SCORE', '3 PICK', '4 ADD'],
    cards: [
      { mini: [{ box: 'The' }, { box: 'capital' }, { box: 'of' }, { box: '…' }], a: 'Text is cut into [tokens].', b: 'A token = a word or part of one.' },
      { mini: [{ text: 'tokens' }, { arrow: true }, { box: 'LLM', r: true }], a: 'The [LLM] reads all tokens.', b: 'It looks at the whole sentence.' },
      { mini: [{ box: 'Addis 92%', r: true }, { box: 'a 3%' }], a: 'It scores every next token.', b: 'This is a [probability].' },
      { mini: [{ box: '… is' }, { arrow: true }, { box: 'Addis', r: true }], a: 'It picks a likely one.', b: 'Then adds it to the text.' },
      { mini: [{ icon: 'replay' }, { text: 'add · read · score · pick' }], a: 'Then it repeats. Token by token.', b: 'That is how it writes answers.' },
    ],
    example: { icon: 'phone', title: 'Your phone keyboard', text: 'It suggests the next word. An LLM is the giant version.' },
    words: [
      { term: 'LLM', def: 'Large Language Model. Predicts the next token.' },
      { term: 'Tokens', def: 'Small pieces of text an AI reads.' },
      { term: 'Probability', def: 'A score for how likely something is.' },
      { term: 'Context', def: 'All the text the model can see at once.' },
    ],
    am: 'LLM የሚቀጥለውን ቃል በመገመት አንድ በአንድ ይጽፋል።',
    en: 'An LLM writes by guessing the next token, again and again.',
    quiz: [
      { type: 'text', q: '“The capital of Ethiopia is …” Most likely next token?', options: ['Addis', 'located', 'blue', 'the'], answer: 0, why: 'It has the highest score: about 92%.' },
      { type: 'text', q: 'How does an LLM write a long answer?', options: ['All at once', 'One token at a time', 'It copies Google', 'Letter by letter only'], answer: 1, why: 'Pick a token, add it, repeat.' },
      { type: 'text', q: 'A token is…', options: ['A password', 'A word or part of a word', 'A server', 'A whole page'], answer: 1, why: 'Text is split into small pieces called tokens.' },
    ],
  },

  '7.7': {
    id: '7.7', track: 'T7', title: 'RAG: give AI your docs', fig: 'FIG 7.7 — RAG PIPELINE', minutes: 7, xp: 20,
    diagram: 'rag',
    steps: ['1 SPLIT', '2 EMBED', '3 SEARCH', '4 ANSWER'],
    cards: [
      { mini: [{ box: 'LLM' }, { text: '+ your docs?' }, { text: '✕' }], a: 'An LLM doesn’t know your files.', b: 'It may make up an answer.' },
      { mini: [{ icon: 'doc' }, { arrow: true }, { box: 'chunk' }, { box: 'chunk' }, { box: 'chunk' }], a: 'Split your docs into [chunks].', b: 'Small pieces, easy to search.' },
      { mini: [{ box: 'text' }, { arrow: true }, { box: '[0.2, 0.9 …]', r: true }], a: 'Turn each chunk into an [embedding].', b: 'Numbers that hold the meaning.' },
      { mini: [{ box: '“Refund rule?”' }, { arrow: true }, { icon: 'db', r: true }], a: 'A question searches the [vector DB].', b: 'It finds the 3 closest chunks.' },
      { mini: [{ box: 'question + chunks' }, { arrow: true }, { box: 'LLM', r: true }], a: 'Question + chunks go to the LLM.', b: 'It answers with sources.' },
    ],
    example: { icon: 'doc', title: 'A bank help bot', text: 'It reads the bank’s own rules first, then answers.' },
    words: [
      { term: 'RAG', def: 'Retrieval-Augmented Generation. Look up facts, then write.' },
      { term: 'Chunks', def: 'Small pieces of a document.' },
      { term: 'Embedding', def: 'Text turned into numbers by meaning.' },
      { term: 'Vector DB', def: 'A database that searches by meaning.' },
    ],
    am: 'RAG መጀመሪያ በሰነዶችህ ውስጥ መረጃ ይፈልጋል፣ ከዚያም መልስ ይጽፋል።',
    en: 'RAG looks up your documents first, then writes the answer.',
    quiz: [
      { type: 'text', q: 'What does RAG add to an LLM?', options: ['Facts from your documents', 'A faster GPU', 'More Wi-Fi', 'A new keyboard'], answer: 0, why: 'It retrieves your chunks before writing.' },
      { type: 'text', q: 'An embedding is…', options: ['A picture', 'Text as meaning-numbers', 'A password', 'A server rack'], answer: 1, why: 'Similar meaning → similar numbers.' },
      { type: 'text', q: 'Right order?', options: ['Answer → search → split', 'Split → embed → search → answer', 'Search → split → embed', 'Embed → answer → split'], answer: 1, why: 'Build the index once, then search per question.' },
    ],
  },
};

export const LESSON_IDS = Object.keys(LESSONS);
