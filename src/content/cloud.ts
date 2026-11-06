import { c, q, w, type Boss, type Lesson } from './types';

export const cloudLessons: Lesson[] = [
  {
    id: 'cloud-1', track: 'cloud', title: 'Servers & data centers', minutes: 7,
    goal: 'Describe what a server is, how data centers stay up, and what “uptime” really means.',
    diagram: {
      kind: 'stack', left: 'BIG', right: 'SMALL',
      layers: [
        { label: 'Data center', sub: 'a building, cooled 24/7', icon: 'building' },
        { label: 'Rows of racks', sub: 'tall metal shelves', icon: 'boxes' },
        { label: 'Rack', sub: '~40 servers each', icon: 'server' },
        { label: 'Server', sub: 'a computer with no screen', icon: 'cpu', hot: true },
      ],
    },
    cards: [
      c('why', 'globe', 'Every app you use runs in a data center.', 'Yours will too.'),
      c('idea', 'server', 'A [server] is just a computer.', 'Its job: answer other computers.'),
      c('how', 'boxes', 'Servers sit in [racks]: no screen, no keyboard.', 'Managed remotely over the network.'),
      c('how', 'battery', 'Power cut? Batteries (UPS), then generators.', 'Two power feeds, two network links.'),
      c('how', 'gauge', '[Redundancy]: two of everything important.', 'One fails, the other carries on.'),
      c('example', 'clock', '99.9% uptime = ~9 hours down a year.', '99.99% = ~53 minutes. Each 9 costs more.'),
      c('recap', 'check', 'Reliability comes from design, not luck.', 'Remove every single point of failure.'),
    ],
    deep: [
      { title: 'Inside a server', points: ['Same parts as a PC: CPU, RAM, disks, network cards.', 'Extras: 2 power supplies, ECC RAM, remote management (iDRAC/iLO).'] },
      { title: 'Data center tiers', points: ['Tier I: basic. Tier IV: everything doubled, ~26 min/year down.', 'Cooling is a big share of power; efficient sites keep it low.'] },
      { title: 'Disks: RAID', points: ['RAID 1: mirror two disks. One dies, data lives.', 'RAID is not backup: deleted files are deleted on both.'] },
    ],
    realCase: { title: 'Ethio Telecom data centers', text: 'Ethio Telecom runs large data centers in Addis Ababa, with backup power, cooling and security around the clock.' },
    words: [
      w('Server', 'A computer that answers requests from other computers.'),
      w('Racks', 'Metal shelves that hold many servers.'),
      w('Redundancy', 'Extra copies of parts so one failure doesn’t stop the system.'),
    ],
    amharic: 'ሰርቨር ለሌሎች ኮምፒውተሮች መልስ የሚሰጥ ኮምፒውተር ነው።',
    quiz: [
      q('A server is…', ['A computer that answers others', 'A special cable', 'A website name', 'A phone app'], 0, 'A normal computer with a serving job.'),
      q('99.9% uptime allows about how much downtime per year?', ['~9 hours', '~9 days', '~9 minutes', 'None'], 0, '0.1% of 8,760 hours ≈ 8.8 hours.'),
      q('RAID 1 protects against…', ['One disk failing', 'Deleting a file by mistake', 'Hackers', 'Power cuts'], 0, 'It mirrors disks. It is not a backup.'),
    ],
  },
  {
    id: 'cloud-2', track: 'cloud', title: 'Cloud & containers', minutes: 9,
    goal: 'Explain IaaS/PaaS/SaaS, VMs vs containers, and how Docker images work.',
    diagram: {
      kind: 'stack', left: 'YOU MANAGE', right: 'CLOUD MANAGES',
      layers: [
        { label: 'Your app', sub: 'Node, Python…', icon: 'code', hot: true },
        { label: 'Container', sub: 'app + everything it needs', icon: 'box' },
        { label: 'Virtual machine', sub: 'a slice of a server', icon: 'layers' },
        { label: 'Real hardware', sub: 'in AWS / Google / Azure data centers', icon: 'server' },
      ],
    },
    cards: [
      c('why', 'rocket', 'Start with $5, scale to millions.', 'No server room needed.'),
      c('idea', 'cloud', 'The [cloud] = renting someone’s servers.', 'Pay per hour; add more in minutes.'),
      c('how', 'layers', 'IaaS: you rent VMs. PaaS: you push code.', 'SaaS: you just use the app (Gmail).'),
      c('how', 'box', 'A [container] packs app + libraries.', 'Same box runs the same everywhere.'),
      c('how', 'doc', 'A Dockerfile is the recipe.', 'It builds an [image]; a container runs it.'),
      c('example', 'check', '“Works on my laptop” → works on the server.', 'Because it is the same image.'),
      c('recap', 'check', 'VM: full OS, minutes. Container: shared kernel, seconds.', 'Most apps today ship as containers.'),
    ],
    deep: [
      { title: 'A tiny Dockerfile', points: ['FROM python:3.12-slim', 'COPY . /app  ·  RUN pip install -r /app/requirements.txt', 'CMD ["python", "/app/main.py"]', 'docker build -t myapp . → docker run -p 8000:8000 myapp'] },
      { title: 'Kubernetes (K8s)', points: ['Runs many containers across many servers.', 'Restarts crashed ones; scales up when busy.', 'Big tool: learn Docker first.'] },
      { title: 'Cloud cost traps', points: ['Forgotten servers keep billing.', 'Data going out of the cloud costs money (egress).', 'Set budget alerts on day one.'] },
    ],
    tryIt: { title: 'Run your first container', steps: ['Install Docker Desktop (or Docker in WSL).', 'Run: docker run hello-world', 'Then: docker run -p 8080:80 nginx → open localhost:8080'] },
    realCase: { title: 'A startup in Addis', text: 'No money for servers? Rent a small cloud VM for a few dollars a month, ship the app as a container, grow later.' },
    words: [
      w('Cloud', 'Servers you rent over the internet, paid by use.'),
      w('Container', 'Your app packed with everything it needs to run (Docker).'),
      w('Image', 'A frozen template; containers are running copies of it.'),
    ],
    amharic: 'ክላውድ የሌላ ሰውን ሰርቨር በኪራይ መጠቀም ነው፤ ኮንቴይነር መተግበሪያን ከሚያስፈልገው ሁሉ ጋር ያሽጋል።',
    quiz: [
      q('Gmail for a company is which model?', ['SaaS', 'IaaS', 'PaaS', 'On-premise'], 0, 'You just use the software.'),
      q('Containers start faster than VMs because they…', ['Share the host kernel', 'Have no code', 'Use GPUs', 'Skip the network'], 0, 'No full OS to boot.'),
      q('A Dockerfile builds…', ['An image', 'A server rack', 'A database', 'A website name'], 0, 'Containers are running copies of images.'),
    ],
  },
  {
    id: 'cloud-3', track: 'cloud', title: 'Load balancers & CDN', minutes: 8,
    goal: 'Explain load balancing algorithms, health checks and how a CDN cuts latency.',
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
      c('why', 'alert', 'One server, too many users → crash.', 'Results day, every year.'),
      c('idea', 'network', 'A [load balancer] stands in front.', 'One address, many servers behind.'),
      c('how', 'replay', 'Round robin: 1, 2, 3, 1, 2, 3…', 'Least connections: the least busy one.'),
      c('how', 'check', 'A [health check] runs every few seconds.', 'Dead servers get no users.'),
      c('how', 'globe', 'A [CDN] copies files to servers near users.', 'Images load from close by.'),
      c('example', 'school', 'Grade 12 results day.', 'LB + 10 servers + CDN for images.'),
      c('recap', 'check', 'LB spreads load. CDN shortens distance.', 'Use both for big traffic.'),
    ],
    deep: [
      { title: 'Layer 4 vs Layer 7', points: ['L4: looks at IP + port only. Very fast.', 'L7: reads HTTP (URL, cookies). Can route /api and /images differently.', 'Examples: Nginx, HAProxy, cloud load balancers.'] },
      { title: 'Sticky sessions', points: ['Same user → same server, using a cookie.', 'Better: keep sessions in Redis so any server works.'] },
      { title: 'CDN caching', points: ['Edge servers keep copies for a TTL.', 'Cache-Control headers tell them how long.', 'First user is a miss; the next thousand are hits.'] },
    ],
    realCase: { title: 'Grade 12 results day', text: 'Hundreds of thousands check at once. Many servers behind a load balancer keep the site up.' },
    words: [
      w('Load balancer', 'Splits traffic across many servers.'),
      w('Health check', 'A quick “are you alive?” test on each server.'),
      w('CDN', 'Content Delivery Network: copies of files on servers near users.'),
    ],
    amharic: 'ሎድ ባላንሰር ተጠቃሚዎችን ያከፋፍላል፤ CDN ፋይሎችን ወደ ተጠቃሚው ያቀርባል።',
    quiz: [
      q('Server 2 dies. The load balancer…', ['Sends users to the others', 'Stops everything', 'Restarts the internet', 'Deletes the site'], 0, 'The health check fails, so it skips server 2.'),
      q('Route /api and /images to different servers. You need…', ['A Layer 7 load balancer', 'A Layer 4 one', 'A bigger disk', 'UDP'], 0, 'Only L7 reads the URL.'),
      q('Users in Bahir Dar get images fast because of…', ['A CDN', 'A bigger screen', 'More passwords', 'TCP'], 0, 'The CDN keeps copies closer to them.'),
    ],
  },
];

export const cloudBoss: Boss = {
  id: 'boss-cloud', track: 'cloud', title: 'Host a film streaming site',
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
  modelNotes: ['Encoder makes 360p, 720p, 1080p versions (adaptive streaming).', 'CDN serves video from near the viewer.', 'LB + 3 web servers handle pages and login.'],
};
