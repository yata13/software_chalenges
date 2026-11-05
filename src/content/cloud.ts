import type { Boss, Lesson } from './types';

export const cloudLessons: Lesson[] = [
  {
    id: 'cloud-1',
    track: 'cloud',
    title: 'Servers & data centers',
    minutes: 4,
    diagram: {
      kind: 'stack',
      left: 'BIG',
      right: 'SMALL',
      layers: [
        { label: 'Data center', sub: 'a building, cooled 24/7', icon: 'building' },
        { label: 'Rows of racks', sub: 'tall metal shelves', icon: 'boxes' },
        { label: 'Rack', sub: '~40 servers each', icon: 'server' },
        { label: 'Server', sub: 'a computer with no screen', icon: 'cpu', hot: true },
      ],
    },
    cards: [
      { icon: 'server', lines: ['A [server] is just a computer.', 'It answers other computers.'] },
      { icon: 'boxes', lines: ['Servers sit in [racks].', 'No screen, no keyboard.'] },
      { icon: 'building', lines: ['A [data center] holds thousands.', 'Power, cooling and guards, 24/7.'] },
      { icon: 'battery', lines: ['Power cut? Batteries, then generators.', 'The servers never stop.'] },
    ],
    realCase: { title: 'Ethio Telecom data centers', text: 'telebirr and many Ethiopian sites run on servers in data centers in Addis Ababa.' },
    words: [
      { term: 'Server', meaning: 'A computer that answers requests from other computers.' },
      { term: 'Racks', meaning: 'Metal shelves that hold many servers.' },
      { term: 'Data center', meaning: 'A building full of servers, with power and cooling.' },
    ],
    amharic: 'ሰርቨር ለሌሎች ኮምፒውተሮች መልስ የሚሰጥ ኮምፒውተር ነው።',
    quiz: [
      { q: 'A server is…', options: ['A special kind of cable', 'A computer that answers others', 'A website name', 'A phone app'], answer: 1, why: 'It is a normal computer with a serving job.' },
      { q: 'Why do data centers need cooling?', options: ['Servers make lots of heat', 'For the workers only', 'To store water', 'For Wi-Fi'], answer: 0, why: 'Hot chips slow down or break.' },
    ],
  },
  {
    id: 'cloud-2',
    track: 'cloud',
    title: 'Cloud & containers',
    minutes: 6,
    diagram: {
      kind: 'stack',
      left: 'YOU MANAGE',
      right: 'CLOUD MANAGES',
      layers: [
        { label: 'Your app', sub: 'Node, Python…', icon: 'code', hot: true },
        { label: 'Container', sub: 'app + everything it needs', icon: 'box' },
        { label: 'Virtual machine', sub: 'a slice of a server', icon: 'layers' },
        { label: 'Real hardware', sub: 'in AWS / Google data centers', icon: 'server' },
      ],
    },
    cards: [
      { icon: 'cloud', lines: ['The [cloud] = renting someone’s servers.', 'Pay per hour. No building needed.'] },
      { icon: 'layers', lines: ['One big server is split into [VMs].', 'Each acts like its own computer.'] },
      { icon: 'box', lines: ['A [container] packs your app.', 'Code + libraries + settings.'] },
      { icon: 'check', lines: ['“Works on my laptop” → works everywhere.', 'Same box, same result.'] },
    ],
    realCase: { title: 'A startup in Addis', text: 'No money for servers? Rent a small cloud VM for a few dollars a month and grow later.' },
    words: [
      { term: 'Cloud', meaning: 'Servers you rent over the internet, paid by use.' },
      { term: 'VMs', meaning: 'Virtual machines: fake computers made from one real one.' },
      { term: 'Container', meaning: 'Your app packed with everything it needs to run (Docker).' },
    ],
    amharic: 'ክላውድ የሌላ ሰውን ሰርቨር በኪራይ መጠቀም ነው፤ ኮንቴይነር መተግበሪያን ከሚያስፈልገው ሁሉ ጋር ያሽጋል።',
    quiz: [
      { q: 'The cloud is mainly…', options: ['Servers you rent', 'Weather data', 'Free Wi-Fi', 'A type of phone'], answer: 0, why: 'Someone else owns the hardware. You pay to use it.' },
      { q: 'Why use containers?', options: ['They look nice', 'The app runs the same everywhere', 'They cool servers', 'They replace the internet'], answer: 1, why: 'Everything the app needs is inside the box.' },
    ],
  },
  {
    id: 'cloud-3',
    track: 'cloud',
    title: 'Load balancers & CDN',
    minutes: 6,
    diagram: {
      kind: 'flow',
      nodes: [
        { id: 'u', label: 'Users', icon: 'users', x: 40, y: 110, sub: 'USERS' },
        { id: 'lb', label: 'LB', icon: 'network', x: 150, y: 110, hot: true, sub: 'LOAD BAL.' },
        { id: 's1', label: 'Server 1', x: 300, y: 40, w: 84 },
        { id: 's2', label: 'Server 2', x: 300, y: 110, w: 84 },
        { id: 's3', label: 'Server 3', x: 300, y: 180, w: 84 },
      ],
      edges: [['u', 'lb'], ['lb', 's1'], ['lb', 's2'], ['lb', 's3']],
      route: ['u', 'lb', 's1', 'lb', 's2', 'lb', 's3'],
      steps: ['1 ARRIVE', '2 TO S1', '', '3 TO S2', '', '4 TO S3'],
    },
    cards: [
      { icon: 'alert', lines: ['One server, too many users?', 'It slows down, then crashes.'] },
      { icon: 'network', lines: ['A [load balancer] stands in front.', 'It splits users across servers.'] },
      { icon: 'check', lines: ['A [health check] runs every few seconds.', 'Dead servers get no users.'] },
      { icon: 'globe', lines: ['A [CDN] copies files near users.', 'Photos load from close by.'] },
    ],
    realCase: { title: 'Grade 12 results day', text: 'Hundreds of thousands check at once. Many servers behind a load balancer keep the site up.' },
    words: [
      { term: 'Load balancer', meaning: 'Splits traffic across many servers.' },
      { term: 'Health check', meaning: 'A quick “are you alive?” test on each server.' },
      { term: 'CDN', meaning: 'Content Delivery Network: copies of files on servers near users.' },
    ],
    amharic: 'ሎድ ባላንሰር ተጠቃሚዎችን ያከፋፍላል፤ CDN ፋይሎችን ወደ ተጠቃሚው ያቀርባል።',
    quiz: [
      { q: 'Server 2 dies. The load balancer…', options: ['Stops everything', 'Sends users to the others', 'Restarts the internet', 'Deletes the site'], answer: 1, why: 'The health check fails, so it skips server 2.' },
      { q: 'Users in Bahir Dar get images fast because of…', options: ['A CDN', 'A bigger screen', 'More passwords', 'UDP'], answer: 0, why: 'The CDN keeps copies closer to them.' },
    ],
  },
];

export const cloudBoss: Boss = {
  id: 'boss-cloud',
  track: 'cloud',
  title: 'Host a film streaming site',
  task: ['An Ethiopian film site. 50,000 viewers at night.', 'Many have slow mobile internet.', 'Draw how you host it.'],
  tags: ['VIDEO', 'NIGHT PEAK', 'SLOW 3G/4G'],
  blocks: [
    { label: 'CDN', icon: 'globe' },
    { label: 'Load balancer', icon: 'network' },
    { label: 'Web servers', icon: 'server' },
    { label: 'Video storage', icon: 'disk' },
    { label: 'Video encoder', icon: 'film' },
    { label: 'Database', icon: 'db' },
    { label: 'One home PC', icon: 'laptop' },
  ],
  start: ['Viewers'],
  checks: [
    { text: 'Videos load fast everywhere', needs: ['CDN'] },
    { text: 'Many viewers at once', needs: ['Load balancer'] },
    { text: 'Big files stored safely', needs: ['Video storage'] },
    { text: 'Plays on slow internet', needs: ['Video encoder'] },
    { text: 'No single weak machine', needs: ['Web servers'], avoid: ['One home PC'] },
  ],
  hints: ['Video files are huge. Where should copies live?', 'Slow phones need smaller versions: 360p, 720p…', 'A home PC dies in a power cut.'],
  model: {
    kind: 'flow',
    nodes: [
      { id: 'v', label: 'Viewers', icon: 'users', x: 40, y: 110 },
      { id: 'c', label: 'CDN', x: 150, y: 50, w: 72, hot: true },
      { id: 'l', label: 'LB', x: 150, y: 170, w: 72 },
      { id: 'w', label: 'Web ×3', x: 260, y: 170, w: 72 },
      { id: 's', label: 'Storage', x: 260, y: 50, w: 72 },
      { id: 'e', label: 'Encoder', x: 320, y: 110, w: 72, hot: true },
    ],
    edges: [['v', 'c'], ['v', 'l'], ['l', 'w'], ['c', 's'], ['e', 's']],
    route: ['v', 'c', 's', 'e', 's', 'c', 'v', 'l', 'w'],
  },
  modelNotes: ['Encoder makes 360p, 720p, 1080p versions.', 'CDN serves video from near the viewer.', 'LB + 3 web servers handle pages and login.'],
};
