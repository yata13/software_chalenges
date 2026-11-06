import type { IconName } from '../components/icons';

export type TrackId =
  | 'machine' | 'os' | 'cs' | 'math'
  | 'network' | 'telecom' | 'cloud' | 'enterprise'
  | 'software' | 'system' | 'security'
  | 'ai' | 'humanai'
  | 'thinking' | 'future';

// ---------- Diagrams: drawn from data ----------
export interface FlowNode {
  id: string;
  label: string;
  icon?: IconName;
  x: number; // centre, in a 360 × 220 box
  y: number;
  w?: number;
  hot?: boolean; // red, glowing
  sub?: string; // small label under the box
}
export interface FlowDiagram {
  kind: 'flow';
  nodes: FlowNode[];
  edges: [string, string][]; // lines between nodes
  route: string[]; // node ids the packet visits, in order
  steps?: string[]; // one per hop of the route; '' = keep the previous chip lit
  dashed?: [string, string][]; // dashed edges (answers, off)
}
export interface StackDiagram {
  kind: 'stack';
  layers: { label: string; sub?: string; icon?: IconName; hot?: boolean }[]; // top → bottom
  left?: string; // axis label on top end
  right?: string; // axis label on bottom end
}
export interface CompareDiagram {
  kind: 'compare';
  a: { title: string; icon: IconName; points: string[] };
  b: { title: string; icon: IconName; points: string[] };
}
export interface BarsDiagram {
  kind: 'bars';
  bars: { label: string; value: number; text: string; hot?: boolean }[];
  log?: boolean;
  caption?: string;
}
export interface NeuralDiagram {
  kind: 'neural';
  layers: number[];
  inputs?: string[];
  outputs?: string[];
}
export interface CoresDiagram {
  kind: 'cores';
  a: { title: string; sub: string; cores: number };
  b: { title: string; sub: string; cores: number };
}
export interface TimelineDiagram {
  kind: 'timeline';
  steps: { label: string; sub?: string; icon?: IconName }[];
}
export type Diagram = FlowDiagram | StackDiagram | CompareDiagram | BarsDiagram | NeuralDiagram | CoresDiagram | TimelineDiagram;

// ---------- Lessons ----------
// Professor flow: every lesson walks through these stages, in order.
export type Stage = 'why' | 'idea' | 'how' | 'use' | 'example' | 'lab' | 'mistake' | 'recap';
export const STAGE_LABEL: Record<Stage, string> = {
  why: 'Why it matters', idea: 'The big idea', how: 'How it works', use: 'Where it’s used',
  example: 'Worked example', lab: 'Experiment', mistake: 'Common mistake', recap: 'Key takeaway',
};
export interface Card {
  stage: Stage;
  icon: IconName;
  lines: [string] | [string, string]; // [hard word] = tap to explain
  code?: string; // optional command, program or output (shown in mono)
}

// A real experiment you do on your own computer or phone.
export interface Lab {
  title: string;
  minutes: number;
  needs: string[];
  steps: { do: string; cmd?: string; see?: string }[]; // see = what you should see
  check: { q: string; a: string }; // think about the result
}
export interface Word {
  term: string;
  meaning: string;
}
export interface QuizQuestion {
  q: string;
  options: string[];
  answer: number;
  why: string;
}
export interface Lesson {
  id: string;
  track: TrackId;
  title: string;
  minutes: number;
  diagram: Diagram;
  cards: Card[];
  goal: string; // "By the end you can…"
  realCase: { title: string; text: string };
  deep: { title: string; points: string[] }[]; // Professor's notes: the detail
  tryIt?: { title: string; steps: string[] }; // optional, easy hands-on (short lessons)
  lab?: Lab; // full experiment (deep lessons)
  words: Word[];
  amharic: string;
  quiz: QuizQuestion[];
}

// ---------- Bosses ----------
export interface BossCheck {
  text: string;
  needs: string[]; // any of these blocks must be on the sketch
  avoid?: string[]; // and none of these (traps)
}
export interface Boss {
  id: string;
  track: TrackId;
  title: string;
  task: string[]; // max 3 short lines
  tags: string[];
  blocks: { label: string; icon: IconName }[]; // palette (some are traps)
  start?: string[]; // blocks already on the sketch
  checks: BossCheck[];
  hints: string[];
  model: FlowDiagram;
  modelNotes: string[];
}

export interface Track {
  id: TrackId;
  n: number;
  name: string;
  short: string;
  abbr: string;
  icon: IconName;
  phase: number;
  lessons: Lesson[];
  boss: Boss;
}

// ---------- Small helpers so content files stay short ----------
export const c = (stage: Stage, icon: IconName, a: string, b?: string, code?: string): Card => ({ stage, icon, lines: b ? [a, b] : [a], ...(code ? { code } : {}) });
export const q = (question: string, options: string[], answer: number, why: string): QuizQuestion => ({ q: question, options, answer, why });
export const w = (term: string, meaning: string): Word => ({ term, meaning });
