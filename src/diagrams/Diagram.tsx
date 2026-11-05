import { useState } from 'react';
import type { Diagram as Spec } from '../content/types';
import { DiagramFrame, cx } from '../components/ui';
import FlowDiagram, { flowStep } from './FlowDiagram';
import { BarsView, CompareView, CoresView, NeuralView, StackView, TimelineView } from './Diagrams';
import { useLoop } from './clock';

const SECONDS: Record<Spec['kind'], number> = { flow: 8, stack: 6, compare: 6, bars: 6, neural: 6, cores: 7, timeline: 7 };

/** Draws any lesson diagram from its data. */
export function DiagramBody({ spec, playKey = 0 }: { spec: Spec; playKey?: number }) {
  const secs = spec.kind === 'flow' ? Math.max(5, (spec.route.length - 1) * 1.1 + 1) : SECONDS[spec.kind];
  const t = useLoop(secs, playKey);
  switch (spec.kind) {
    case 'flow': return <FlowWithSteps spec={spec} t={t} />;
    case 'stack': return <StackView spec={spec} t={t} />;
    case 'compare': return <CompareView spec={spec} t={t} />;
    case 'bars': return <BarsView spec={spec} t={t} playKey={playKey} />;
    case 'neural': return <NeuralView spec={spec} t={t} />;
    case 'cores': return <CoresView spec={spec} t={t} />;
    case 'timeline': return <TimelineView spec={spec} t={t} />;
  }
}

function FlowWithSteps({ spec, t }: { spec: Extract<Spec, { kind: 'flow' }>; t: number }) {
  const chips = (spec.steps ?? []).filter(Boolean);
  const lit = flowStep(spec, t);
  return (
    <>
      <FlowDiagram spec={spec} t={t} />
      {chips.length > 0 && (
        <div className="grid gap-1.5 border-t border-line-soft bg-sunk p-2.5" style={{ gridTemplateColumns: `repeat(${chips.length}, minmax(0, 1fr))` }}>
          {chips.map((c, i) => (
            <span key={c + i} className={cx('flex min-h-[30px] items-center justify-center rounded-[6px] border px-1 text-center font-mono text-[10px] transition-colors duration-200',
              i === lit ? 'border-red bg-red text-white' : 'border-line text-ink2')}>{c}</span>
          ))}
        </div>
      )}
    </>
  );
}

export default function Diagram({ spec, title, label }: { spec: Spec; title: string; label: string }) {
  const [play, setPlay] = useState(0);
  return (
    <DiagramFrame title={title} label={label} onReplay={() => setPlay((p) => p + 1)}>
      <DiagramBody spec={spec} playKey={play} />
    </DiagramFrame>
  );
}
