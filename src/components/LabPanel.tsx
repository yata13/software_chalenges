import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button, Icon } from './ui';
import type { Lab } from '../content/types';
import { XP_LAB, actions, useProgress } from '../store/progress';

function CodeBlock({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    // copy the commands without the ">>> " prompt markers
    const clean = text.split('\n').map((l) => l.replace(/^>>> ?/, '')).join('\n');
    try { await navigator.clipboard.writeText(clean); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* ignore */ }
  };
  return (
    <div className="relative">
      <pre className="m-0 overflow-x-auto whitespace-pre rounded-md border border-line-soft bg-bg0 p-3 pr-16 font-mono text-[12px] leading-[18px] text-ink">{text}</pre>
      <button type="button" onClick={copy} aria-label="Copy" className="absolute right-1.5 top-1.5 flex h-8 items-center gap-1 rounded-sm border border-line bg-surface px-2 font-mono text-[10px] text-ink2 hover:text-ink">
        <Icon name={copied ? 'check' : 'copy'} size={12} />{copied ? 'COPIED' : 'COPY'}
      </button>
    </div>
  );
}

/** A real experiment: steps, commands, what you should see, a question, +XP. */
export default function LabPanel({ lessonId, lab }: { lessonId: string; lab: Lab }) {
  const p = useProgress();
  const done = p.labsDone.includes(lessonId);
  const [answer, setAnswer] = useState(false);
  const [got, setGot] = useState(0);

  return (
    <section data-lab aria-label="Experiment" className="card flex flex-col gap-4 rounded-xl border-red-line">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 flex-none items-center justify-center rounded-md border border-red-line bg-red-node text-red-hi"><Icon name="lab" size={22} /></span>
        <span className="flex flex-1 flex-col gap-0.5">
          <span className="label !text-red-hi">Experiment · {lab.minutes} min · +{XP_LAB} XP</span>
          <b className="leading-[22px]">{lab.title}</b>
        </span>
        {done && <span className="flex h-7 items-center gap-1 rounded-full bg-green/15 px-2.5 font-mono text-[11px] text-green"><Icon name="check" size={12} stroke={3} />DONE</span>}
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="label">You need</span>
        <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0">
          {lab.needs.map((n) => <li key={n} className="rounded-[6px] border border-line-strong px-2 py-1 text-[13px]">{n}</li>)}
        </ul>
      </div>

      <ol className="m-0 flex list-none flex-col gap-4 p-0">
        {lab.steps.map((st, i) => (
          <li key={i} className="flex gap-3">
            <span className="flex h-7 w-7 flex-none items-center justify-center rounded-[7px] bg-red font-mono text-[12px] text-white">{i + 1}</span>
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <p className="m-0 text-[15px] leading-[22px]">{st.do}</p>
              {st.cmd && <CodeBlock text={st.cmd} />}
              {st.see && (
                <p className="m-0 flex gap-2 rounded-md border border-green/30 bg-green-sheet px-3 py-2 text-[14px] leading-5">
                  <Icon name="eye" size={16} color="#2FD27F" className="mt-0.5 flex-none" />
                  <span><b className="text-green">You should see: </b>{st.see}</span>
                </p>
              )}
            </div>
          </li>
        ))}
      </ol>

      <div className="flex flex-col gap-2 rounded-md border border-line-soft bg-sunk p-3">
        <span className="label">Think about it</span>
        <p className="m-0 font-bold leading-[22px]">{lab.check.q}</p>
        <button type="button" onClick={() => setAnswer((a) => !a)} aria-expanded={answer} className="self-start font-mono text-[12px] text-red-hi">
          {answer ? 'Hide answer ▲' : 'Show answer ▼'}
        </button>
        <AnimatePresence initial={false}>
          {answer && (
            <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="m-0 overflow-hidden text-[15px] leading-[22px] text-ink2">{lab.check.a}</motion.p>
          )}
        </AnimatePresence>
      </div>

      <Button variant={done ? 'secondary' : 'primary'} disabled={done} onClick={() => setGot(actions.finishLab(lessonId))}>
        {done ? <><Icon name="check" size={18} />Experiment done{got ? ` · +${got} XP` : ''}</> : <><Icon name="lab" size={18} />I did the experiment · +{XP_LAB} XP</>}
      </Button>
    </section>
  );
}

