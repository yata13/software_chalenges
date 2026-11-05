import Icon from './Icon.jsx';
import { Logo, Ring, Bar } from './ui.jsx';
import { TRACKS, trackProgress, TOTAL_LESSONS } from '../data/tracks.js';
import { WORDS } from '../data/library.js';
import { useStore, useDerived } from '../store.jsx';

const ITEMS = [
  { id: 'home', label: 'Home', icon: 'home', href: '#/' },
  { id: 'map', label: 'Map', icon: 'map', href: '#/map' },
  { id: 'practice', label: 'Practice', icon: 'practice', href: '#/practice' },
  { id: 'profile', label: 'Profile', icon: 'profile', href: '#/profile' },
];

export function TabBar({ active }) {
  return (
    <nav aria-label="Main" className="tabbar">
      {ITEMS.map((it) => (
        <a key={it.id} href={it.href} className="tab" aria-current={active === it.id ? 'page' : undefined}>
          <Icon name={it.icon} size={22} />
          <span>{it.label}</span>
        </a>
      ))}
    </nav>
  );
}

export function Sidebar({ active }) {
  const { s } = useStore();
  const { done, lessonsDone, bossesDone, level } = useDerived();
  const curTrack = TRACKS.find((t) => !trackProgress(t, done).complete && trackProgress(t, done).doneLessons > 0) || TRACKS[0];
  return (
    <aside className="sidebar">
      <nav aria-label="Main" className="side-nav">
        <div style={{ padding: '0 8px' }}><Logo /></div>
        <div className="stack g4">
          {ITEMS.map((it) => (
            <a key={it.id} href={it.href} className="side-link" aria-current={active === it.id ? 'page' : undefined}>
              <Icon name={it.icon} /><span className="flex1">{it.label}</span>
            </a>
          ))}
          <div style={{ height: 1, background: '#23232D', margin: '8px 4px' }} />
          <a href="#/tools" className="side-link" aria-current={active === 'tools' ? 'page' : undefined}>
            <Icon name="tools" /><span className="flex1">Tools</span><span className="m t3" style={{ fontSize: 10 }}>{WORDS.length} WORDS</span>
          </a>
          <a href="#/design" className="side-link" aria-current={active === 'design' ? 'page' : undefined}>
            <Icon name="layers" /><span className="flex1">Design system</span>
          </a>
        </div>

        <section aria-label="Progress" className="card stack g14">
          <div className="row g12">
            <Ring size={56} stroke={6} value={lessonsDone / TOTAL_LESSONS} label={`${Math.round((lessonsDone / TOTAL_LESSONS) * 100)} percent of all lessons done`}>
              <span className="m" style={{ fontSize: 12, fontWeight: 600 }}>{Math.round((lessonsDone / TOTAL_LESSONS) * 100)}%</span>
            </Ring>
            <span className="stack g4">
              <span style={{ fontSize: 15, fontWeight: 700 }}>{lessonsDone} / {TOTAL_LESSONS} lessons</span>
              <span className="m t2" style={{ fontSize: 11 }}>{bossesDone} BOSSES BEATEN</span>
            </span>
          </div>
          <div className="stack g8 m t2" style={{ fontSize: 10 }}>
            {TRACKS.map((t) => {
              const p = trackProgress(t, done);
              const cur = t.code === curTrack.code;
              return (
                <a key={t.code} href={`#/map/${t.code}`} className="row g8" style={{ color: cur ? '#FF4B52' : '#A3A3B0' }}>
                  <span style={{ width: 34 }}>{t.abbr}</span>
                  <span className="flex1"><Bar thin white={!cur} cur={cur} pct={p.pct} label={`${t.name} ${p.pct}%`} /></span>
                </a>
              );
            })}
          </div>
        </section>

        <a href="#/profile" className="row g10" style={{ padding: 8, color: '#F5F5F7' }}>
          <span className="d" style={{ width: 36, height: 36, flex: 'none', borderRadius: 10, border: '1.5px solid #E5262D', background: '#1A0D10', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>{initials(s.fullName)}</span>
          <span className="stack">
            <span style={{ fontSize: 14, fontWeight: 700 }}>{s.name}</span>
            <span className="m t2" style={{ fontSize: 10 }}>LVL {level.level} · {s.streak}-DAY STREAK</span>
          </span>
        </a>
      </nav>
    </aside>
  );
}

export const initials = (n) => n.split(' ').map((x) => x[0]).join('').slice(0, 2).toUpperCase();
