import Icon, { Diamond } from '../components/Icon.jsx';
import { Bar } from '../components/ui.jsx';
import { TRACKS, trackProgress, TOTAL_LESSONS, TOTAL_BOSSES } from '../data/tracks.js';
import { currentTrack, isPlayable, stopHref } from '../data/progress.js';
import { useDerived } from '../store.jsx';
import { go } from '../router.js';

function stateOf(stop, p, done) {
  if (done.has(stop.id)) return 'done';
  if (p.next && p.next.id === stop.id) return 'next';
  return 'open';
}

function Stop({ kind, state }) {
  if (kind === 'boss') return <span className="st"><Diamond state={state} size={14} /></span>;
  return <span className="st"><span className={`st-${state}`} /></span>;
}

export default function Roadmap({ sel }) {
  const { done, lessonsDone } = useDerived();
  const cur = currentTrack(done);
  const selCode = sel || cur.code;
  const selTrack = TRACKS.find((t) => t.code === selCode) || cur;
  const sp = trackProgress(selTrack, done);

  return (
    <div className="page">
      <header className="row between wrap g16" style={{ alignItems: 'flex-end' }}>
        <div className="stack g6">
          <span className="label">{TRACKS.length} tracks · {TOTAL_LESSONS} lessons · {TOTAL_BOSSES} bosses</span>
          <h1 className="d display-xl">Roadmap</h1>
        </div>
        <span className="m" style={{ fontSize: 13 }}>{lessonsDone}/{TOTAL_LESSONS} <span className="red-text">· {Math.round((lessonsDone / TOTAL_LESSONS) * 100)}%</span></span>
      </header>

      <div className="legend" aria-label="Legend">
        <span><span className="st"><span className="st-done" /></span>DONE</span>
        <span><span className="st"><span className="st-next" /></span>NEXT</span>
        <span><span className="st"><span className="st-open" /></span>OPEN</span>
        <span><Diamond state="done" size={12} />BOSS</span>
      </div>

      <div className="grid-auto" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(340px, 100%), 1fr))' }}>
        <section aria-label="Circuit map" className="card xl metro" style={{ padding: '14px 10px 14px 8px', gridColumn: 'span 1' }}>
          <div className="metro-spine" aria-hidden="true" />
          <div className="stack g4">
            {TRACKS.map((t) => {
              const p = trackProgress(t, done);
              const isCur = t.code === cur.code;
              const n = p.stops.length;
              const fillPct = p.doneCount === 0 ? 0 : p.complete ? 100 : (p.doneCount / (n - 1)) * 100;
              const color = isCur ? '#E5262D' : '#F5F5F7';
              return (
                <button key={t.code} type="button" onClick={() => go(`/map/${t.code}`)} aria-pressed={t.code === selCode}
                  className={`metro-row${isCur ? ' cur' : ''}${t.code === selCode ? ' sel' : ''}`}>
                  <span className="metro-stub" aria-hidden="true" style={{ background: isCur ? '#E5262D' : '#4A4A58' }} />
                  <span className="metro-pin" aria-hidden="true" style={{ borderColor: isCur ? '#E5262D' : '#4A4A58' }} />
                  <span className="row g8" style={{ minWidth: 0 }}>
                    <span className="m" style={{ fontSize: 11, color: isCur ? '#FF4B52' : '#868694' }}>{t.code}</span>
                    <span className="flex1" style={{ fontSize: 15, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.name}</span>
                    {isCur && <span className="m" style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: '#E5262D', color: '#fff' }}>YOU</span>}
                    <span className="m t2" style={{ fontSize: 11 }}>{p.doneLessons}/{p.total}</span>
                  </span>
                  <span className="line-track" aria-label={`${p.doneLessons} of ${p.total} lessons done`}>
                    <span className="base" />
                    <span className="fill" style={{ width: `calc((100% - 12px) * ${fillPct / 100})`, background: color, boxShadow: isCur ? '0 0 10px #E5262D' : 'none' }} />
                    <span className="stops">
                      {p.stops.map((st) => <Stop key={st.id} kind={st.kind} state={stateOf(st, p, done)} />)}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section aria-label="Track details" className="card xl stack g14" style={{ alignSelf: 'start' }}>
          <div className="stack g6">
            <span className="label red">{selTrack.code} · {sp.total} lessons · {selTrack.bosses.length} bosses</span>
            <h2 className="d title">{selTrack.name}</h2>
            <Bar pct={sp.pct} label={`${selTrack.name} progress`} />
          </div>
          <div className="stack">
            {sp.stops.map((st) => {
              const state = stateOf(st, sp, done);
              const playable = isPlayable(st.id);
              const inner = (
                <>
                  <Stop kind={st.kind} state={state} />
                  <span className="m" style={{ width: 34, flex: 'none', fontSize: 11, color: state === 'next' ? '#FF4B52' : '#868694' }}>{st.num}</span>
                  <span className="flex1">{st.kind === 'boss' ? `Boss: ${st.title}` : st.title}</span>
                  {playable
                    ? (state === 'next'
                      ? <span className="m" style={{ fontSize: 11, height: 32, padding: '0 10px', borderRadius: 8, background: '#E5262D', color: '#fff', display: 'flex', alignItems: 'center' }}>START</span>
                      : <Icon name="right" size={16} color="#868694" />)
                    : <span className="m t3" style={{ fontSize: 10 }}>SOON</span>}
                </>
              );
              const cls = `lesson-row${state === 'next' ? ' next' : ''}${state === 'done' ? ' done' : ''}`;
              return playable
                ? <a key={st.id} href={stopHref(st)} className={cls}>{inner}</a>
                : <div key={st.id} className={cls} style={{ opacity: state === 'done' ? 1 : 0.75 }}>{inner}</div>;
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
