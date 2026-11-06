import { useEffect, useState } from 'react';
import { Area, AreaChart, CartesianGrid, PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Button, Icon, IconButton, Stat, XPBar, cx } from '../components/ui';
import type { IconName } from '../components/icons';
import { initials } from '../components/Nav';
import SyncCard from '../components/SyncCard';
import { TRACKS, TOTAL_LESSONS } from '../content';
import { actions, levelOf, streakOf, trackStats, useProgress, weekXP, type Progress } from '../store/progress';

const BADGES: { name: string; rule: string; icon: IconName; test: (p: Progress) => boolean }[] = [
  { name: 'First Step', rule: 'FINISH 1 LESSON', icon: 'play', test: (p) => p.doneLessons.length >= 1 },
  { name: 'First Packet', rule: '1ST NETWORK LESSON', icon: 'network', test: (p) => p.doneLessons.some((l) => l.startsWith('network')) },
  { name: 'Machine Mind', rule: 'TRACK 1 LESSONS', icon: 'cpu', test: (p) => trackStats(p, 'machine').complete || trackStats(p, 'machine').done === trackStats(p, 'machine').total },
  { name: 'Linux Admin', rule: 'FINISH OS TRACK', icon: 'code', test: (p) => trackStats(p, 'os').done === trackStats(p, 'os').total },
  { name: 'Signal Master', rule: 'FINISH TELECOM', icon: 'wifi', test: (p) => trackStats(p, 'telecom').done === trackStats(p, 'telecom').total },
  { name: 'Boss Slayer', rule: 'BEAT 1 BOSS', icon: 'target', test: (p) => p.doneBosses.length >= 1 },
  { name: 'Boss Hunter', rule: 'BEAT 5 BOSSES', icon: 'award', test: (p) => p.doneBosses.length >= 5 },
  { name: 'Perfect', rule: '100% ON A QUIZ', icon: 'star', test: (p) => Object.values(p.scores).some((s) => s === 100) },
  { name: 'On Fire', rule: '7-DAY STREAK', icon: 'streak', test: (p) => streakOf(p.days) >= 7 },
  { name: 'Quick Thinker', rule: '3 STARS IN PRACTICE', icon: 'practice', test: (p) => p.runs.some((r) => r.stars === 3) },
  { name: 'Word Collector', rule: 'SAVE 10 WORDS', icon: 'bookmark', test: (p) => p.saved.length >= 10 },
  { name: 'Level 5', rule: 'REACH LEVEL 5', icon: 'trend', test: (p) => levelOf(p.xp).level >= 5 },
  { name: 'AI Builder', rule: 'FINISH AI TRACK', icon: 'ai', test: (p) => trackStats(p, 'ai').done === trackStats(p, 'ai').total },
  { name: 'Blueprint Master', rule: `ALL ${TOTAL_LESSONS} LESSONS`, icon: 'grad', test: (p) => p.doneLessons.length >= TOTAL_LESSONS },
];

export default function Profile() {
  const p = useProgress();
  const lvl = levelOf(p.xp);
  const [name, setName] = useState(p.name);
  useEffect(() => setName(p.name), [p.name]);
  const [code, setCode] = useState('');
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const weeks = weekXP(p.days, 8);
  const radar = TRACKS.map((t) => ({ track: t.abbr, skill: trackStats(p, t.id).skill }));
  const strongest = [...radar].sort((a, b) => b.skill - a.skill)[0];
  const weakest = [...radar].sort((a, b) => a.skill - b.skill)[0];
  const earned = BADGES.filter((b) => b.test(p));

  const exportCode = async () => {
    const c = actions.exportCode();
    setCode(c);
    try { await navigator.clipboard.writeText(c); setMsg({ ok: true, text: 'Code copied. Paste it on your other device.' }); }
    catch { setMsg({ ok: true, text: 'Copy the code below.' }); }
  };
  const importCode = () => {
    if (!code.trim()) return;
    if (!window.confirm('Replace the progress on this device with the code?')) return;
    const ok = actions.importCode(code);
    setMsg(ok ? { ok: true, text: 'Progress loaded!' } : { ok: false, text: 'That code is not valid. Copy it again.' });
  };

  return (
    <div className="mx-auto flex max-w-[1680px] flex-col gap-4 lg:gap-5">
      <header className="flex h-11 items-center justify-between">
        <h1 className="m-0 font-display text-[22px] font-semibold lg:text-[34px]">Profile</h1>
        <IconButton icon="tools" label="Tools" to="/tools" />
      </header>

      <div className="grid gap-4 lg:grid-cols-2 lg:gap-5">
        <div className="flex flex-col gap-4">
          <section className="card flex items-center gap-4 rounded-xl">
            <div aria-hidden className="flex h-[68px] w-[68px] flex-none items-center justify-center rounded-[18px] border-2 border-red bg-red-node font-display text-[22px] font-bold shadow-glow-node"
              style={{ backgroundImage: 'linear-gradient(rgba(229,38,45,.25) 1px, transparent 1px), linear-gradient(90deg, rgba(229,38,45,.25) 1px, transparent 1px)', backgroundSize: '8px 8px' }}>
              {initials(p.name)}
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <form onSubmit={(e) => { e.preventDefault(); actions.setName(name); }} className="flex items-center gap-2">
                <label htmlFor="pname" className="sr-only">Your name</label>
                <input id="pname" value={name} onChange={(e) => setName(e.target.value)} onBlur={() => actions.setName(name)} placeholder="Your name"
                  className="min-w-0 flex-1 border-b border-transparent bg-transparent text-lg font-bold outline-none focus:border-red-hi" />
              </form>
              <span className="font-mono text-[11px] tracking-[.06em] text-red-hi">LVL {lvl.level} · {lvl.name.toUpperCase()}</span>
              <XPBar pct={lvl.pct} label="XP to next level" />
              <span className="font-mono text-[11px] text-ink2">{p.xp.toLocaleString()} / {lvl.next.toLocaleString()} XP</span>
            </div>
          </section>

          <div className="grid grid-cols-4 gap-2">
            <Stat label="STREAK" value={<span className="text-red-hi">{streakOf(p.days)}</span>} />
            <Stat label="LESSONS" value={p.doneLessons.length} />
            <Stat label="BOSSES" value={p.doneBosses.length} />
            <Stat label="BADGES" value={earned.length} />
          </div>

          <section aria-label="XP per week" className="card flex flex-col gap-2.5 rounded-xl">
            <div className="flex items-baseline justify-between"><span className="label">XP per week</span><span className="label">{weeks.reduce((a, w) => a + w.xp, 0)} in 8 weeks</span></div>
            <div className="h-[170px]" role="img" aria-label={`Weekly XP for 8 weeks: ${weeks.map((w) => w.xp).join(', ')}`}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeks} margin={{ top: 10, right: 8, bottom: 0, left: -24 }}>
                  <defs><linearGradient id="xpFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#E5262D" stopOpacity={0.35} /><stop offset="100%" stopColor="#E5262D" stopOpacity={0} /></linearGradient></defs>
                  <CartesianGrid stroke="#23232D" vertical={false} />
                  <XAxis dataKey="label" tick={{ fill: '#868694', fontSize: 9, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} interval="preserveStartEnd" minTickGap={28} />
                  <YAxis tick={{ fill: '#868694', fontSize: 9, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: '#16161D', border: '1px solid #2B2B36', borderRadius: 8, fontFamily: 'JetBrains Mono', fontSize: 12 }} labelStyle={{ color: '#A3A3B0' }} itemStyle={{ color: '#FF4B52' }} cursor={{ stroke: '#3A3A46' }} />
                  <Area type="monotone" dataKey="xp" name="XP" stroke="#E5262D" strokeWidth={2.5} fill="url(#xpFill)" dot={{ r: 3.5, fill: '#0B0B0F', stroke: '#FF4B52', strokeWidth: 2 }} activeDot={{ r: 5, fill: '#E5262D' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>

        <section aria-label="Skills by track" className="card flex flex-col gap-2 rounded-xl">
          <div className="flex items-baseline justify-between"><span className="label">Skills radar</span><span className="label">Quiz score by track</span></div>
          <div className="h-[300px]" role="img" aria-label={`Skills: ${radar.map((r) => `${r.track} ${r.skill}`).join(', ')}`}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radar} outerRadius="72%">
                <PolarGrid stroke="#2B2B36" />
                <PolarAngleAxis dataKey="track" tick={{ fill: '#A3A3B0', fontSize: 10, fontFamily: 'JetBrains Mono' }} />
                <Radar dataKey="skill" stroke="#E5262D" strokeWidth={2} fill="#E5262D" fillOpacity={0.2} dot={{ r: 3, fill: '#FF4B52' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <p className="m-0 text-[15px] leading-[22px] text-ink2">
            {strongest.skill > 0
              ? <>Strong: <b className="text-ink">{TRACKS.find((t) => t.abbr === strongest.track)!.name}</b>. Grow next: <b className="text-red-hi">{TRACKS.find((t) => t.abbr === weakest.track)!.name}</b>.</>
              : 'Finish lessons to fill your radar.'}
          </p>
        </section>
      </div>

      <section aria-label="Badges" className="flex flex-col gap-1">
        <div className="flex h-11 items-center justify-between"><h2 className="m-0 font-display text-base font-semibold">Badges</h2><span className="font-mono text-xs text-ink2">{earned.length} EARNED · {BADGES.length - earned.length} TO GO</span></div>
        <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 lg:grid-cols-6">
          {BADGES.map((b) => {
            const on = b.test(p);
            return (
              <div key={b.name} className={cx('flex flex-col items-center gap-1.5 rounded-[14px] border px-2 py-3 text-center', on ? 'border-line bg-surface' : 'border-dashed border-line bg-surface2')}>
                <span className="relative flex h-[52px] w-[52px] items-center justify-center">
                  <svg width="52" height="52" viewBox="0 0 64 64" aria-hidden className="absolute inset-0" style={on ? { filter: 'drop-shadow(0 0 6px rgba(229,38,45,.6))' } : undefined}>
                    <path d="M32 3 58 17.5v29L32 61 6 46.5v-29z" fill={on ? '#1A0D10' : 'none'} stroke={on ? '#E5262D' : '#3A3A46'} strokeWidth={on ? 2.5 : 2} strokeDasharray={on ? undefined : '5 4'} />
                  </svg>
                  <Icon name={on ? b.icon : 'lock'} size={20} color={on ? '#F5F5F7' : '#868694'} className="relative" />
                </span>
                <span className={cx('text-[13px] font-bold leading-4', !on && 'text-ink2')}>{b.name}</span>
                <span className="font-mono text-[9px] text-ink3">{b.rule}</span>
              </div>
            );
          })}
        </div>
      </section>

      <SyncCard />

      <section aria-label="Backup" className="card flex flex-col gap-3 rounded-xl">
        <div className="flex items-center gap-2.5"><Icon name="download" color="#FF4B52" /><h2 className="m-0 font-display text-base font-semibold">Backup code</h2></div>
        <p className="m-0 text-[15px] text-ink2">No sync? Move progress by hand: export here, paste the code on the other device, import.</p>
        <label htmlFor="code" className="sr-only">Progress code</label>
        <textarea id="code" value={code} onChange={(e) => setCode(e.target.value)} rows={3} placeholder="Paste a progress code here (starts with TB1.)"
          className="w-full resize-y break-all rounded-md border border-line bg-sunk p-3 font-mono text-xs outline-none focus:border-red-hi" />
        <div className="flex flex-wrap gap-2.5">
          <Button small onClick={exportCode}><Icon name="copy" size={16} />Export code</Button>
          <Button small variant="secondary" onClick={importCode} disabled={!code.trim()}><Icon name="upload" size={16} />Import code</Button>
          <Button small variant="secondary" className="ml-auto" onClick={() => { if (window.confirm('Delete all progress? If sync is on, your other devices are cleared too.')) { actions.reset(); setMsg({ ok: true, text: 'Progress reset.' }); } }}><Icon name="trash" size={16} />Reset</Button>
        </div>
        {msg && <p role="status" className={cx('m-0 text-sm', msg.ok ? 'text-green' : 'text-red-hi')}>{msg.text}</p>}
      </section>
    </div>
  );
}
