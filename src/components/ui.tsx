import { Fragment, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ICONS, type IconName } from './icons';
import { findWord, type Word } from '../content';

const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ');
export { cx };

// ---------- Icon ----------
export function Icon({ name, size = 20, stroke = 1.8, className, label, color }: { name: IconName; size?: number; stroke?: number; className?: string; label?: string; color?: string }) {
  const C = ICONS[name];
  return <C size={size} strokeWidth={stroke} className={className} color={color} aria-hidden={label ? undefined : true} aria-label={label} role={label ? 'img' : undefined} />;
}

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5" aria-label="Tech Blueprint home">
      <span aria-hidden className="relative h-[30px] w-[30px] rounded-[7px] border-[1.5px] border-red"
        style={{ backgroundImage: 'linear-gradient(rgba(229,38,45,.35) 1px, transparent 1px), linear-gradient(90deg, rgba(229,38,45,.35) 1px, transparent 1px)', backgroundSize: '7px 7px', backgroundPosition: '-1px -1px' }}>
        <span className="absolute bottom-1 right-1 h-[7px] w-[7px] rounded-full bg-red-hi shadow-[0_0_8px_#E5262D]" />
      </span>
      <span className="font-display text-[15px] font-semibold">Tech Blueprint</span>
    </Link>
  );
}

// ---------- Buttons ----------
type Variant = 'primary' | 'secondary' | 'dashed' | 'green';
const btn: Record<Variant, string> = {
  primary: 'bg-red text-white shadow-lift hover:bg-[#F0353C]',
  secondary: 'border border-line-strong text-ink hover:bg-white/5 text-[15px]',
  dashed: 'border border-dashed border-muted text-ink hover:border-red-hi font-normal text-[15px]',
  green: 'bg-green text-green-ink',
};
export function buttonClass(v: Variant = 'primary', small = false, block = false) {
  return cx('inline-flex items-center justify-center gap-2.5 rounded-md px-5 font-bold transition active:scale-[.98] disabled:bg-[#22222B] disabled:text-[#6E6E7C] disabled:shadow-none disabled:border-transparent',
    small ? 'h-11 text-[15px]' : 'h-[52px] text-base', block && 'w-full', btn[v]);
}
export function Button({ variant = 'primary', small, block, className, ...p }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; small?: boolean; block?: boolean }) {
  return <button type="button" {...p} className={cx(buttonClass(variant, small, block), className)} />;
}
export function LinkButton({ to, variant = 'primary', small, block, children, className }: { to: string; variant?: Variant; small?: boolean; block?: boolean; children: ReactNode; className?: string }) {
  return <Link to={to} className={cx(buttonClass(variant, small, block), variant === 'primary' && 'hover:text-white', className)}>{children}</Link>;
}
export function IconButton({ icon, label, onClick, to, disabled, ghost }: { icon: IconName; label: string; onClick?: () => void; to?: string; disabled?: boolean; ghost?: boolean }) {
  const cls = cx('inline-flex flex-none items-center justify-center text-ink transition disabled:opacity-40', ghost ? 'h-9 w-9 rounded-sm' : 'h-11 w-11 rounded-md border border-line bg-surface hover:border-line-strong');
  if (to) return <Link to={to} aria-label={label} className={cls}><Icon name={icon} /></Link>;
  return <button type="button" aria-label={label} onClick={onClick} disabled={disabled} className={cls}><Icon name={icon} size={ghost ? 18 : 20} /></button>;
}

// ---------- Chips ----------
export function Chip({ on, onClick, children }: { on?: boolean; onClick?: () => void; children: ReactNode }) {
  return (
    <button type="button" aria-pressed={!!on} onClick={onClick}
      className={cx('h-10 rounded-full border px-3.5 font-mono text-[13px] transition', on ? 'border-red bg-red text-white' : 'border-line bg-surface text-ink hover:border-line-strong')}>
      {children}
    </button>
  );
}
export function Filter({ on, onClick, children }: { on?: boolean; onClick?: () => void; children: ReactNode }) {
  return (
    <button type="button" aria-pressed={!!on} onClick={onClick}
      className={cx('h-8 flex-none rounded-full border px-3 font-mono text-[11px] tracking-wide', on ? 'border-ink bg-ink text-bg0' : 'border-line text-ink')}>
      {children}
    </button>
  );
}
export function Tag({ children }: { children: ReactNode }) {
  return <span className="rounded-[6px] border border-line-strong px-2 py-1 font-mono text-[11px]">{children}</span>;
}

// ---------- Progress ----------
export function ProgressRing({ size = 84, stroke = 8, value, label, children }: { size?: number; stroke?: number; value: number; label: string; children?: ReactNode }) {
  const r = (size - stroke) / 2 - 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(1, value));
  return (
    <div className="relative flex-none" style={{ width: size, height: size }}>
      <svg width={size} height={size} role="img" aria-label={label}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#262631" strokeWidth={stroke} />
        <motion.circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E5262D" strokeWidth={stroke} strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`} strokeDasharray={c} initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: c * (1 - v) }}
          transition={{ duration: 0.8, ease: [0.3, 0.7, 0.2, 1] }} style={{ filter: 'drop-shadow(0 0 6px rgba(229,38,45,.6))' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  );
}

export function XPBar({ pct, thin, white, current, label }: { pct: number; thin?: boolean; white?: boolean; current?: boolean; label: string }) {
  return (
    <div role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pct)}
      className={cx('overflow-hidden rounded-full', thin ? 'h-1' : 'h-2', current ? 'bg-[#3A1A1D]' : 'bg-track')}>
      <motion.div className={cx('h-full rounded-full', white ? 'bg-ink' : 'bg-red shadow-glow-line')} initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6, ease: [0.3, 0.7, 0.2, 1] }} />
    </div>
  );
}

export function Segments({ count, at, label }: { count: number; at: number; label: string }) {
  return (
    <div role="progressbar" aria-label={label} aria-valuemin={1} aria-valuemax={count} aria-valuenow={at + 1}
      className="grid gap-1" style={{ gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }}>
      {Array.from({ length: count }, (_, i) => (
        <span key={i} className={cx('h-1.5 rounded-[3px] transition-colors duration-300', i <= at ? 'bg-red' : 'bg-line', i === at && 'shadow-[0_0_8px_#E5262D]')} />
      ))}
    </div>
  );
}

// ---------- Diagram frame ----------
export function DiagramFrame({ title, children, onReplay, footer, label }: { title: string; children: ReactNode; onReplay?: () => void; footer?: ReactNode; label: string }) {
  return (
    <figure aria-label={label} className="m-0 overflow-hidden rounded-lg border border-line bg-sunk">
      <div className="flex h-10 items-center justify-between border-b border-line-soft pl-3.5 pr-1.5">
        <span className="font-mono text-[11px] tracking-[.06em] text-ink2">{title}</span>
        {onReplay && <IconButton icon="replay" label="Replay animation" onClick={onReplay} ghost />}
      </div>
      <div className="grid-bg relative">{children}</div>
      {footer}
    </figure>
  );
}

// ---------- Quiz answer ----------
export type AnswerState = 'default' | 'correct' | 'wrong' | 'disabled';
export const KEYS = ['A', 'B', 'C', 'D', 'E'];
export function answerState(i: number, picked: number | null, right: number): AnswerState {
  if (picked === null) return 'default';
  if (i === right) return 'correct';
  if (i === picked) return 'wrong';
  return 'disabled';
}
export function QuizAnswer({ k, text, state, onPick }: { k: string; text: string; state: AnswerState; onPick?: () => void }) {
  const styles: Record<AnswerState, string> = {
    default: 'border-line bg-surface hover:border-[#5A5A68] hover:bg-[#1A1A22]',
    correct: 'border-green bg-green/10',
    wrong: 'border-red bg-red/15',
    disabled: 'border-line bg-surface opacity-45',
  };
  return (
    <motion.button type="button" onClick={onPick} disabled={state !== 'default'} aria-pressed={state === 'correct' || state === 'wrong'}
      animate={state === 'wrong' ? { x: [0, -10, 9, -6, 5, -3, 0] } : state === 'correct' ? { backgroundColor: ['rgba(47,210,127,.45)', 'rgba(47,210,127,.1)'], boxShadow: ['0 0 0 10px rgba(47,210,127,.2)', '0 0 0 0 rgba(47,210,127,0)'] } : {}}
      transition={{ duration: state === 'wrong' ? 0.45 : 0.7 }} whileTap={state === 'default' ? { scale: 0.98 } : undefined}
      className={cx('relative flex min-h-[104px] flex-col items-start justify-between gap-2.5 rounded-lg border-2 p-3.5 text-left text-ink transition-colors', styles[state])}>
      <span className={cx('flex h-[26px] w-[26px] items-center justify-center rounded-[7px] border-[1.5px] font-mono text-[11px]', state === 'correct' ? 'text-green' : state === 'wrong' ? 'text-red-hi' : 'text-ink2')}>{k}</span>
      <span className="text-[17px] font-bold leading-[22px]">{text}</span>
      {state === 'correct' && <span className="absolute right-2.5 top-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-green text-green-ink"><Icon name="check" size={15} stroke={3} label="Correct" /></span>}
      {state === 'wrong' && <span className="absolute right-2.5 top-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-red text-white"><Icon name="close" size={14} stroke={3} label="Wrong" /></span>}
    </motion.button>
  );
}

export function WhySheet({ ok, answer, why, xp, next, nextLabel }: { ok: boolean; answer: string; why: string; xp?: number; next: () => void; nextLabel: string }) {
  return (
    <motion.section role="status" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.25, ease: [0.3, 0.7, 0.2, 1] }}
      className={cx('flex flex-wrap items-center gap-4 rounded-xl border-[1.5px] p-5', ok ? 'border-green bg-green-sheet' : 'border-red bg-red-sheet')}>
      <span className={cx('flex h-11 w-11 flex-none items-center justify-center rounded-full', ok ? 'bg-green text-green-ink' : 'bg-red text-white')}><Icon name={ok ? 'check' : 'close'} size={20} stroke={3} /></span>
      <div className="flex min-w-[220px] flex-1 flex-col gap-1">
        <span className={cx('font-display text-xl font-semibold', ok ? 'text-green' : 'text-red-hi')}>
          {ok ? 'Correct!' : `Not quite. Answer: ${answer}`}
          {ok && xp ? <span className="ml-2 font-mono text-[13px] font-normal">+{xp} XP</span> : null}
        </span>
        <span className="text-[17px] leading-6"><span className="label mr-2">Why</span>{why}</span>
      </div>
      <Button variant={ok ? 'green' : 'primary'} onClick={next} autoFocus>{nextLabel}</Button>
    </motion.section>
  );
}

// ---------- Words ----------
export function Rich({ text, onWord }: { text: string; onWord: (w: string) => void }) {
  return (
    <>
      {text.split(/(\[[^\]]+\])/g).map((p, i) => {
        const m = p.match(/^\[(.+)\]$/);
        if (!m) return <Fragment key={i}>{p}</Fragment>;
        return <button key={i} type="button" onClick={() => onWord(m[1])} className="border-b-[1.5px] border-dotted border-red-hi hover:text-red-hi">{m[1]}</button>;
      })}
    </>
  );
}
export function WordCallout({ term, words }: { term: string | null; words?: Word[] }) {
  const w = term ? findWord(term, words) : undefined;
  return (
    <AnimatePresence mode="wait">
      {w && (
        <motion.div key={w.term} role="status" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
          className="flex items-start gap-3 rounded-md border border-red-line bg-red-node p-3.5">
          <Icon name="hint" color="#FF4B52" className="mt-0.5 flex-none" />
          <div className="flex flex-col gap-0.5">
            <span className="font-mono text-xs uppercase text-red-hi">{w.term}</span>
            <span className="text-[15px] leading-[21px]">{w.meaning}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function AmharicToggle({ amharic, on, onToggle }: { amharic: string; on: boolean; onToggle: () => void }) {
  return (
    <section aria-label="Amharic summary" className="card flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="label">Amharic summary</span>
        <button type="button" role="switch" aria-checked={on} aria-label="Show Amharic" onClick={onToggle}
          className="flex h-9 items-center gap-2 rounded-full border border-line bg-sunk pl-2.5 pr-1">
          <span className="font-am text-sm">አማርኛ</span>
          <span className={cx('relative block h-6 w-10 rounded-full transition-colors', on ? 'bg-red' : 'bg-line-strong')}>
            <motion.span className="absolute top-[3px] h-[18px] w-[18px] rounded-full bg-white" animate={{ left: on ? 19 : 3 }} transition={{ duration: 0.2 }} />
          </span>
        </button>
      </div>
      <AnimatePresence mode="wait">
        <motion.p key={on ? 'am' : 'en'} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
          lang={on ? 'am' : 'en'} className={cx('m-0', on ? 'font-am text-[17px] leading-7' : 'text-[15px] leading-[22px] text-ink2')}>
          {on ? amharic : 'Turn on to read this lesson in one Amharic line.'}
        </motion.p>
      </AnimatePresence>
    </section>
  );
}

export function StreakPill({ days, compact }: { days: number; compact?: boolean }) {
  return (
    <span className="inline-flex h-9 items-center gap-1.5 rounded-full bg-red/15 px-3 text-red-hi" aria-label={`${days} day streak`}>
      <Icon name="streak" size={18} />
      <span className="font-mono text-sm font-semibold">{days}</span>
      <span className="font-mono text-[11px] text-red-soft">{compact ? 'd' : 'days'}</span>
    </span>
  );
}

export function Stat({ label, value, red }: { label: string; value: ReactNode; red?: boolean }) {
  return (
    <div className={cx('flex flex-col gap-1 rounded-[14px] border p-3', red ? 'border-red-line bg-red-node' : 'border-line bg-surface')}>
      <span className={cx('font-mono text-[10px] tracking-[.08em]', red ? 'text-red-soft' : 'text-ink3')}>{label}</span>
      <span className={cx('font-display text-lg font-semibold', red && 'text-red-hi')}>{value}</span>
    </div>
  );
}

export function Diamond({ state = 'open', size = 14 }: { state?: 'done' | 'next' | 'open'; size?: number }) {
  if (state === 'done') return <svg width={size} height={size} viewBox="0 0 14 14" aria-hidden><path d="M7 .5 13.5 7 7 13.5.5 7z" fill="#E5262D" /></svg>;
  if (state === 'next') return <svg width={size + 4} height={size + 4} viewBox="0 0 14 14" aria-hidden style={{ filter: 'drop-shadow(0 0 7px #E5262D)' }}><path d="M7 .8 13.2 7 7 13.2.8 7z" fill="#E5262D" stroke="#FFB3B6" strokeWidth="1.2" /></svg>;
  return <svg width={size} height={size} viewBox="0 0 14 14" aria-hidden><path d="M7 1.5 12.5 7 7 12.5 1.5 7z" fill="#0B0B0F" stroke="#E5262D" strokeWidth="1.4" /></svg>;
}

export function Dot({ state }: { state: 'done' | 'next' | 'open' }) {
  return (
    <span className="flex h-4 w-4 flex-none items-center justify-center">
      {state === 'done' && <span className="h-[11px] w-[11px] rounded-full bg-ink" />}
      {state === 'next' && <span className="pulse-red h-[15px] w-[15px] rounded-full border-2 border-red-ring bg-red" />}
      {state === 'open' && <span className="h-[11px] w-[11px] rounded-full border-[1.5px] border-[#6E6E7C] bg-bg0" />}
    </span>
  );
}

export function PageTitle({ label, title, right }: { label: string; title: string; right?: ReactNode }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div className="flex flex-col gap-1.5">
        <span className="label">{label}</span>
        <h1 className="m-0 font-display text-[26px] font-semibold leading-8 lg:text-[34px] lg:leading-10">{title}</h1>
      </div>
      {right}
    </header>
  );
}
