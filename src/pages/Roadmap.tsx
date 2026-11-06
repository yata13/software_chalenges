import { Link, useSearchParams } from 'react-router-dom';
import { Diamond, Dot, Icon, PageTitle, XPBar, cx } from '../components/ui';
import { PHASES, TRACKS, TOTAL_LESSONS, type TrackId } from '../content';
import { continueLesson, trackStats, useProgress, type Progress } from '../store/progress';

type St = 'done' | 'next' | 'open';
function stops(p: Progress, id: TrackId) {
  const s = trackStats(p, id);
  // Only your current track pulses "next"; other tracks show open stops.
  const live = (continueLesson(p)?.track ?? id) === id || s.done > 0;
  const lessons = s.track.lessons.map((l, i) => ({
    id: l.id, num: `${s.track.n}.${i + 1}`, title: l.title, to: `/lesson/${l.id}`, boss: false,
    state: (p.doneLessons.includes(l.id) ? 'done' : live && s.next?.id === l.id ? 'next' : 'open') as St,
  }));
  const boss = { id: s.track.boss.id, num: 'BOSS', title: s.track.boss.title, to: `/boss/${s.track.boss.id}`, boss: true, state: (s.bossDone ? 'done' : s.bossReady ? 'next' : 'open') as St };
  return { s, list: [...lessons, boss] };
}

export default function Roadmap() {
  const p = useProgress();
  const [params, setParams] = useSearchParams();
  const cur = continueLesson(p)?.track ?? 'future';
  const sel = (params.get('track') as TrackId) || cur;
  const selData = stops(p, sel);

  return (
    <div className="mx-auto flex max-w-[1680px] flex-col gap-5">
      <PageTitle label={`${PHASES.length} phases · ${TRACKS.length} tracks · ${TOTAL_LESSONS} lessons · ${TRACKS.length} bosses`} title="Roadmap"
        right={<span className="font-mono text-[13px]">{p.doneLessons.length}/{TOTAL_LESSONS} <span className="text-red-hi">· {Math.round((p.doneLessons.length / TOTAL_LESSONS) * 100)}%</span></span>} />

      <div aria-label="Legend" className="flex flex-wrap items-center gap-3.5 rounded-[10px] border border-line-soft bg-surface2 px-3 py-2.5 font-mono text-[11px] text-ink2">
        <span className="flex items-center gap-1.5"><Dot state="done" />DONE</span>
        <span className="flex items-center gap-1.5"><Dot state="next" />NEXT</span>
        <span className="flex items-center gap-1.5"><Dot state="open" />OPEN</span>
        <span className="flex items-center gap-1.5"><Diamond state="done" size={12} />BOSS</span>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(320px,1fr)] lg:items-start">
        <section aria-label="Circuit map" className="relative rounded-xl border border-line bg-surface py-3.5 pl-2 pr-2.5">
          <div aria-hidden className="absolute bottom-9 left-[17px] top-9 w-0.5 bg-line-strong" />
          <div className="flex flex-col gap-1">
            {PHASES.map((ph) => {
              const tracks = TRACKS.filter((t) => t.phase === ph.n);
              const phDone = tracks.reduce((a, t) => a + stops(p, t.id).s.done, 0);
              const phTotal = tracks.reduce((a, t) => a + t.lessons.length, 0);
              return (
                <div key={ph.n} className="flex flex-col gap-1">
                  <div className="relative flex flex-wrap items-baseline gap-x-3 gap-y-0.5 pb-1 pl-8 pr-2 pt-3">
                    <span aria-hidden className="absolute left-[3px] top-[14px] flex h-[14px] w-[14px] items-center justify-center rounded-full border-2 border-red bg-bg0" />
                    <span className="font-mono text-[11px] tracking-[.08em] text-red-hi">PHASE {ph.n}</span>
                    <span className="font-display text-[15px] font-semibold">{ph.name}</span>
                    <span className="hidden text-[13px] text-ink3 sm:inline">{ph.note}</span>
                    <span className="ml-auto font-mono text-[11px] text-ink2">{phDone}/{phTotal}</span>
                  </div>
            {tracks.map((t) => {
              const { s, list } = stops(p, t.id);
              const isCur = t.id === cur;
              const doneCount = list.filter((x) => x.state === 'done').length;
              const fill = doneCount === 0 ? 0 : doneCount >= list.length ? 100 : (doneCount / (list.length - 1)) * 100;
              return (
                <button key={t.id} type="button" onClick={() => setParams({ track: t.id })} aria-pressed={sel === t.id}
                  className={cx('relative grid w-full gap-1.5 rounded-xl border py-2.5 pl-8 pr-2.5 text-left lg:min-h-[56px] lg:grid-cols-[290px_1fr] lg:items-center lg:gap-6 lg:pr-5',
                    isCur ? 'border-red/40 bg-red/[.07]' : 'border-transparent hover:bg-white/[.03]', sel === t.id && (isCur ? 'border-red/70' : 'border-line-strong bg-white/[.04]'))}>
                  <span aria-hidden className={cx('absolute left-[9px] top-1/2 h-0.5 w-5', isCur ? 'bg-red' : 'bg-muted')} />
                  <span aria-hidden className={cx('absolute left-1 top-[calc(50%-6px)] h-3 w-3 rounded-[3px] border-[1.5px] bg-bg0', isCur ? 'border-red' : 'border-muted')} />
                  <span className="flex min-w-0 items-center gap-2">
                    <span className={cx('font-mono text-[11px]', isCur ? 'text-red-hi' : 'text-ink3')}>T{t.n}</span>
                    <span className="min-w-0 flex-1 truncate text-[15px] font-bold">{t.name}</span>
                    {isCur && <span className="rounded-xs bg-red px-1.5 py-0.5 font-mono text-[10px] text-white">YOU</span>}
                    <span className="font-mono text-[11px] text-ink2">{s.done}/{s.total}</span>
                  </span>
                  <span className="relative h-6" aria-label={`${s.done} of ${s.total} lessons done`}>
                    <span className="absolute inset-x-2 top-[11px] h-0.5 bg-line" />
                    <span className={cx('absolute left-2 top-[11px] h-0.5', isCur ? 'bg-red shadow-[0_0_10px_#E5262D]' : 'bg-ink')} style={{ width: `calc((100% - 16px) * ${fill / 100})` }} />
                    <span className="absolute inset-0 flex items-center justify-between">
                      {list.map((x) => x.boss ? <span key={x.id} className="flex h-4 w-4 items-center justify-center"><Diamond state={x.state} size={14} /></span> : <Dot key={x.id} state={x.state} />)}
                    </span>
                  </span>
                </button>
              );
            })}
                </div>
              );
            })}
          </div>
        </section>

        <section aria-label="Track details" className="card flex flex-col gap-3.5 rounded-xl lg:sticky lg:top-8">
          <div className="flex flex-col gap-1.5">
            <span className="label !text-red-hi">T{selData.s.track.n} · {selData.s.total} lessons · 1 boss</span>
            <h2 className="m-0 font-display text-xl font-semibold">{selData.s.track.name}</h2>
            <XPBar pct={selData.s.pct} label={`${selData.s.track.name} progress`} />
          </div>
          <div className="flex flex-col">
            {selData.list.map((x) => (
              <Link key={x.id} to={x.to} className={cx('flex min-h-11 items-center gap-3 rounded-[10px] px-2.5 text-sm leading-[19px]', x.state === 'next' ? 'bg-red/[.12] font-bold' : 'hover:bg-white/[.03]', x.state === 'done' && 'text-ink2')}>
                {x.boss ? <span className="flex h-4 w-4 items-center justify-center"><Diamond state={x.state} size={14} /></span> : <Dot state={x.state} />}
                <span className={cx('w-10 flex-none font-mono text-[11px]', x.state === 'next' ? 'text-red-hi' : 'text-ink3')}>{x.num}</span>
                <span className="flex-1">{x.title}</span>
                {x.state === 'next'
                  ? <span className="flex h-8 items-center rounded-sm bg-red px-2.5 font-mono text-[11px] text-white">START</span>
                  : x.state === 'done' ? <Icon name="check" size={16} color="#A3A3B0" /> : <Icon name="right" size={16} color="#868694" />}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
