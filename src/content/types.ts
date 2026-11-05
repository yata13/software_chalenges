import type { IconName } from '../components/icons';

export type TrackId = 'machine' | 'network' | 'cloud' | 'software' | 'system' | 'security' | 'ai' | 'future';

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
export interface Card {
  icon: IconName;
  lines: [string] | [string, string]; // [hard word] = tap to explain
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
  realCase: { title: string; text: string };
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
  lessons: Lesson[];
  boss: Boss;
}
