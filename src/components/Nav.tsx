import { NavLink } from 'react-router-dom';
import { Icon, Logo, ProgressRing, XPBar, cx } from './ui';
import type { IconName } from './icons';
import { TRACKS, TOTAL_LESSONS, WORD_BANK } from '../content';
import { continueLesson, levelOf, streakOf, trackStats, useProgress } from '../store/progress';

const ITEMS: { to: string; label: string; icon: IconName }[] = [
  { to: '/', label: 'Home', icon: 'home' },
  { to: '/map', label: 'Map', icon: 'map' },
  { to: '/practice', label: 'Practice', icon: 'practice' },
  { to: '/profile', label: 'Profile', icon: 'profile' },
];

export function TabBar() {
  return (
    <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-20 grid h-[84px] grid-cols-4 gap-1 border-t border-line-soft bg-bg1 px-2 pb-[max(22px,env(safe-area-inset-bottom))] pt-1.5 lg:hidden">
      {ITEMS.map((it) => (
        <NavLink key={it.to} to={it.to} end={it.to === '/'}
          className={({ isActive }) => cx('relative flex h-14 flex-col items-center justify-center gap-1 rounded-md font-mono text-[11px] tracking-wide', isActive ? 'text-red-hi' : 'text-[#9A9AA8] hover:text-ink')}>
          {({ isActive }) => (
            <>
              {isActive && <span className="absolute -top-[7px] left-1/2 h-0.5 w-7 -translate-x-1/2 rounded-sm bg-red shadow-[0_0_10px_#E5262D]" />}
              <Icon name={it.icon} size={22} />
              <span>{it.label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

const sideLink = ({ isActive }: { isActive: boolean }) =>
  cx('flex h-11 items-center gap-3 rounded-[10px] px-3 text-[15px] font-bold transition-colors', isActive ? 'bg-red/15 text-red-hi' : 'text-[#C9C9D2] hover:bg-white/5 hover:text-ink');

export function Sidebar() {
  const p = useProgress();
  const lvl = levelOf(p.xp);
  const done = p.doneLessons.length;
  const cur = continueLesson(p)?.track;
  return (
    <aside className="sticky top-0 hidden h-screen w-[248px] flex-none overflow-y-auto border-r border-[#1F1F28] bg-bg1 lg:block">
      <nav aria-label="Main" className="flex flex-col gap-6 px-4 py-6">
        <div className="px-2"><Logo /></div>
        <div className="flex flex-col gap-1">
          {ITEMS.map((it) => (
            <NavLink key={it.to} to={it.to} end={it.to === '/'} className={sideLink}><Icon name={it.icon} /><span className="flex-1">{it.label}</span></NavLink>
          ))}
          <div className="mx-1 my-2 h-px bg-line-soft" />
          <NavLink to="/plan" className={sideLink}><Icon name="calendar" /><span className="flex-1">Study plan</span></NavLink>
          <NavLink to="/tools" className={sideLink}><Icon name="tools" /><span className="flex-1">Tools</span><span className="font-mono text-[10px] text-ink3">{WORD_BANK.length} WORDS</span></NavLink>
        </div>

        <section aria-label="Progress" className="card flex flex-col gap-3.5">
          <div className="flex items-center gap-3">
            <ProgressRing size={56} stroke={6} value={done / TOTAL_LESSONS} label={`${Math.round((done / TOTAL_LESSONS) * 100)} percent of lessons done`}>
              <span className="font-mono text-xs font-semibold">{Math.round((done / TOTAL_LESSONS) * 100)}%</span>
            </ProgressRing>
            <span className="flex flex-col gap-0.5">
              <span className="text-[15px] font-bold">{done} / {TOTAL_LESSONS} lessons</span>
              <span className="font-mono text-[11px] text-ink2">{p.doneBosses.length} BOSSES BEATEN</span>
            </span>
          </div>
          <div className="flex flex-col gap-2 font-mono text-[10px]">
            {TRACKS.map((t) => {
              const s = trackStats(p, t.id);
              const isCur = t.id === cur;
              return (
                <NavLink key={t.id} to={`/map?track=${t.id}`} className={cx('flex items-center gap-2', isCur ? 'text-red-hi' : 'text-ink2')}>
                  <span className="w-9">{t.abbr}</span>
                  <span className="flex-1"><XPBar thin white={!isCur} current={isCur} pct={s.pct} label={`${t.name} ${s.pct}%`} /></span>
                </NavLink>
              );
            })}
          </div>
        </section>

        <NavLink to="/profile" className="flex items-center gap-2.5 p-2">
          <span className="flex h-9 w-9 flex-none items-center justify-center rounded-[10px] border-[1.5px] border-red bg-red-node font-display text-xs font-bold">{initials(p.name)}</span>
          <span className="flex flex-col">
            <span className="text-sm font-bold">{p.name || 'You'}</span>
            <span className="font-mono text-[10px] text-ink2">LVL {lvl.level} · {streakOf(p.days)}-DAY STREAK</span>
          </span>
        </NavLink>
      </nav>
    </aside>
  );
}

export const initials = (n: string) => (n.trim() ? n.trim().split(/\s+/).map((x) => x[0]).join('').slice(0, 2).toUpperCase() : 'TB');
