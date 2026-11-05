import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Filter, Icon, PageTitle, cx } from '../components/ui';
import { COURSES, PROMPTS, TRACKS, WORD_BANK, getTrack } from '../content';
import { actions, useProgress } from '../store/progress';

type Tab = 'words' | 'courses' | 'prompts';

export default function Tools() {
  const p = useProgress();
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const [tab, setTab] = useState<Tab>('words');
  const [copied, setCopied] = useState<string | null>(null);

  const words = useMemo(() => {
    const k = q.trim().toLowerCase();
    return WORD_BANK.filter((w) =>
      (filter === 'all' || (filter === 'saved' ? p.saved.includes(w.term) : w.track === filter)) &&
      (!k || w.term.toLowerCase().includes(k) || w.meaning.toLowerCase().includes(k)));
  }, [q, filter, p.saved]);

  const copy = async (name: string, text: string) => {
    try { await navigator.clipboard.writeText(text); setCopied(name); setTimeout(() => setCopied(null), 1500); } catch { /* ignore */ }
  };

  const wordsPanel = (
    <section aria-label="Word bank" className="card flex flex-col gap-3 rounded-xl">
      <div className="flex items-center justify-between"><h2 className="m-0 font-display text-[17px] font-semibold">Word bank</h2><span className="font-mono text-[11px] text-ink2">{WORD_BANK.length} · {p.saved.length} SAVED</span></div>
      <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
        <Filter on={filter === 'all'} onClick={() => setFilter('all')}>ALL</Filter>
        <Filter on={filter === 'saved'} onClick={() => setFilter('saved')}>SAVED</Filter>
        {TRACKS.map((t) => <Filter key={t.id} on={filter === t.id} onClick={() => setFilter(t.id)}>{t.short.toUpperCase()}</Filter>)}
      </div>
      <div className="flex flex-col">
        {words.length === 0 && <p className="m-0 py-4 text-ink2">No words found{q ? ` for “${q}”` : ''}.</p>}
        {words.map((w) => {
          const saved = p.saved.includes(w.term);
          return (
            <div key={w.term} className="flex items-start gap-3 border-b border-line-soft px-1 py-2.5">
              <div className="flex flex-1 flex-col gap-0.5">
                <span className="flex items-center gap-2"><b className="text-[15px]">{w.term}</b><Link to={`/lesson/${w.lessonId}`} className="font-mono text-[10px] uppercase text-ink3 hover:text-red-hi">{getTrack(w.track)?.short}</Link></span>
                <span className="text-sm leading-5 text-ink2">{w.meaning}</span>
              </div>
              <button type="button" aria-pressed={saved} aria-label={saved ? `Unsave ${w.term}` : `Save ${w.term}`} onClick={() => actions.toggleWord(w.term)}
                className="flex h-10 w-10 flex-none items-center justify-center rounded-sm hover:bg-white/5">
                <svg width="18" height="18" viewBox="0 0 24 24" fill={saved ? '#E5262D' : 'none'} stroke={saved ? '#E5262D' : '#A3A3B0'} strokeWidth="1.8" strokeLinejoin="round" aria-hidden><path d="M6 3h12v18l-6-4-6 4z" /></svg>
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );

  const coursesPanel = (
    <section aria-label="Free courses" className="card flex flex-col gap-2.5 rounded-xl">
      <div className="flex items-center justify-between"><h2 className="m-0 font-display text-[17px] font-semibold">Free courses</h2><span className="font-mono text-[11px] text-ink2">PICKED PER TRACK</span></div>
      {COURSES.map((c) => (
        <a key={c.name} href={c.href} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-[14px] border border-line-soft bg-sunk p-3 hover:border-line-strong">
          <span className="flex h-10 w-10 flex-none items-center justify-center rounded-[10px] border border-line-strong font-mono text-[10px]">T{getTrack(c.track)?.n}</span>
          <span className="flex flex-1 flex-col gap-0.5"><b className="text-[15px]">{c.name}</b><span className="text-[13px] text-ink2">{c.note}</span></span>
          <Icon name="external" size={16} color="#868694" />
        </a>
      ))}
    </section>
  );

  const promptsPanel = (
    <section aria-label="Saved prompts" className="card flex flex-col gap-2.5 rounded-xl">
      <div className="flex items-center justify-between"><h2 className="m-0 font-display text-[17px] font-semibold">Saved prompts</h2><span className="font-mono text-[11px] text-ink2">COPY INTO ANY AI</span></div>
      {PROMPTS.map((pr) => (
        <div key={pr.name} className="flex flex-col gap-2 rounded-[14px] border border-line-soft bg-sunk p-3.5">
          <div className="flex items-center justify-between"><b className="text-[15px]">{pr.name}</b>
            <button type="button" aria-label={`Copy prompt: ${pr.name}`} onClick={() => copy(pr.name, pr.text)} className="flex h-9 items-center gap-1.5 rounded-sm border border-line px-2.5 font-mono text-[11px]">
              <Icon name={copied === pr.name ? 'check' : 'copy'} size={14} />{copied === pr.name ? 'COPIED' : 'COPY'}
            </button>
          </div>
          <p className="m-0 font-mono text-xs leading-[19px] text-ink2">
            {pr.text.split(/(\[[^\]]+\])/g).map((s, i) => <span key={i} className={cx(/^\[/.test(s) && 'text-red-hi')}>{s}</span>)}
          </p>
        </div>
      ))}
    </section>
  );

  return (
    <div className="mx-auto flex max-w-[1680px] flex-col gap-5">
      <PageTitle label="Words · courses · prompts" title="Tools"
        right={
          <label className="flex h-[52px] w-full max-w-[420px] items-center gap-2.5 rounded-[14px] border border-line bg-surface px-4 focus-within:border-red-hi">
            <Icon name="search" color="#A3A3B0" />
            <span className="sr-only">Search words</span>
            <input type="search" value={q} onChange={(e) => { setQ(e.target.value); setTab('words'); }} placeholder={`Search ${WORD_BANK.length} words`}
              className="h-12 min-w-0 flex-1 bg-transparent text-base outline-none" />
          </label>
        } />

      <div role="tablist" className="grid grid-cols-3 gap-1 rounded-[14px] border border-line-soft bg-sunk p-1 lg:hidden">
        {(['words', 'courses', 'prompts'] as Tab[]).map((t) => (
          <button key={t} role="tab" type="button" aria-selected={tab === t} onClick={() => setTab(t)}
            className={cx('h-10 rounded-[10px] text-sm font-bold capitalize', tab === t ? 'bg-surface text-ink shadow-[inset_0_0_0_1px_#2B2B36]' : 'text-ink2')}>{t === 'words' ? 'Word bank' : t}</button>
        ))}
      </div>

      <div className="lg:hidden">{tab === 'words' ? wordsPanel : tab === 'courses' ? coursesPanel : promptsPanel}</div>
      <div className="hidden gap-5 lg:grid lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:items-start">
        {wordsPanel}
        <div className="flex flex-col gap-5">{coursesPanel}{promptsPanel}</div>
      </div>
    </div>
  );
}
