import { Fragment, useState } from 'react';
import Icon from './Icon.jsx';
import { lookupWord } from '../data/library.js';

export function Logo() {
  return (
    <a href="#/" className="logo" aria-label="Tech Blueprint home">
      <span className="logo-mark" aria-hidden="true" />
      <span className="logo-word">Tech Blueprint</span>
    </a>
  );
}

// Progress ring (goal / timer / track). value 0..1
export function Ring({ size = 84, stroke = 8, value = 0, label, children, color = '#E5262D' }) {
  const r = (size - stroke) / 2 - 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(1, value));
  return (
    <div className="ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={label}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#262631" strokeWidth={stroke} />
        <circle className="val" cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={`${c * v} ${c}`} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      </svg>
      <div className="ring-center">{children}</div>
    </div>
  );
}

export function Bar({ pct, thin, white, cur, label }) {
  return (
    <div className={`bar${thin ? ' thin' : ''}${white ? ' white' : ''}${cur ? ' cur' : ''}`}
      role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pct)}>
      <span style={{ width: `${pct}%` }} />
    </div>
  );
}

export function Segments({ count, at, label }) {
  return (
    <div className="segs" style={{ gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }}
      role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={count} aria-valuenow={at + 1}>
      {Array.from({ length: count }, (_, i) => <span key={i} className={`${i <= at ? 'on' : ''}${i === at ? ' now' : ''}`} />)}
    </div>
  );
}

// Diagram frame: header + body + optional synced step chips.
export function DiagramFrame({ title, children, steps, step, onReplay, label }) {
  return (
    <figure className="diagram" aria-label={label}>
      <div className="diagram-head">
        <span className="m t2" style={{ fontSize: 11, letterSpacing: '.06em' }}>{title}</span>
        {onReplay && (
          <button type="button" className="icon-btn ghost" aria-label="Replay animation" onClick={onReplay}><Icon name="replay" size={18} /></button>
        )}
      </div>
      <div className="diagram-body">{children}</div>
      {steps && (
        <div className="diagram-steps" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}>
          {steps.map((t, i) => <span key={t} className={`step-chip${i === step ? ' on' : ''}`}>{t}</span>)}
        </div>
      )}
    </figure>
  );
}

// Text with [hard words] → dotted red, tap to explain.
export function Rich({ text, onWord }) {
  const parts = text.split(/(\[[^\]]+\])/g);
  return (
    <>
      {parts.map((p, i) => {
        const m = p.match(/^\[(.+)\]$/);
        if (!m) return <Fragment key={i}>{p}</Fragment>;
        return <button key={i} type="button" className="hard-word" onClick={() => onWord?.(m[1])}>{m[1]}</button>;
      })}
    </>
  );
}

// Explain popover / callout for a tapped word
export function WordCallout({ term, words }) {
  if (!term) return null;
  const w = (words || []).find((x) => x.term.toLowerCase() === term.toLowerCase()) || lookupWord(term);
  if (!w) return null;
  return (
    <div role="status" className="card callout row g12 fade-in" style={{ alignItems: 'flex-start', padding: 14, borderRadius: 12 }} key={w.term}>
      <Icon name="hint" color="#FF4B52" style={{ marginTop: 2 }} />
      <div className="stack g4">
        <span className="m red-text" style={{ fontSize: 12, textTransform: 'uppercase' }}>{w.term}{w.am && <span className="am" lang="am" style={{ marginLeft: 8, textTransform: 'none', color: '#E9A9AB' }}>{w.am}</span>}</span>
        <span style={{ fontSize: 15, lineHeight: '21px' }}>{w.def}</span>
      </div>
    </div>
  );
}

export function AmharicToggle({ am, en, on, onToggle }) {
  return (
    <section aria-label="Amharic summary" className="card stack g12">
      <div className="row between">
        <span className="label">One-line summary</span>
        <button type="button" role="switch" aria-checked={on} aria-label="Show Amharic" className="switch" onClick={onToggle}>
          <span className="am" style={{ fontSize: 14 }}>አማርኛ</span>
          <span className="trk" />
        </button>
      </div>
      {on
        ? <p className="am fade-in" lang="am" key="am" style={{ fontSize: 17, lineHeight: '28px' }}>{am}</p>
        : <p className="fade-in" key="en" style={{ fontSize: 17, lineHeight: '26px' }}>{en}</p>}
    </section>
  );
}

export function Stat({ value, label, red }) {
  return (
    <div className={`card${red ? ' red' : ''} stack g4`} style={{ padding: 12, borderRadius: 14 }}>
      <span className="m" style={{ fontSize: 10, letterSpacing: '.08em', color: red ? '#E9A9AB' : '#868694' }}>{label}</span>
      <span className="d" style={{ fontSize: 18, color: red ? '#FF4B52' : undefined }}>{value}</span>
    </div>
  );
}

export function Toast({ msg }) {
  return msg ? <div className="toast" role="status">{msg}</div> : null;
}

export function useToggle(init = false) {
  const [v, set] = useState(init);
  return [v, () => set((x) => !x), set];
}

export function TopBar({ back = '#/', backLabel = 'Close', icon = 'close', children, right }) {
  return (
    <div className="row g12" style={{ minHeight: 44 }}>
      <a href={back} aria-label={backLabel} className="icon-btn"><Icon name={icon} size={20} /></a>
      <div className="flex1">{children}</div>
      {right}
    </div>
  );
}
