// "Night Blueprint" design tokens. Dark ground. White lines. Red signal.
// Tailwind reads these (tailwind.config.ts), and SVG diagrams use them directly.

export const color = {
  bg0: '#0B0B0F', // app ground
  bg1: '#0E0E14', // sidebar, tab bar
  surface: '#16161D', // cards
  sunk: '#0D0D12', // diagram frames, inputs
  surface2: '#111117',
  line: '#2B2B36', // borders
  lineSoft: '#23232D', // dividers
  lineStrong: '#3A3A46',
  track: '#262631', // empty bar
  text: '#F5F5F7',
  text2: '#A3A3B0',
  text3: '#868694',
  muted: '#4A4A58',
  green: '#2FD27F', // correct only
  greenInk: '#08130D',
  greenSheet: '#0E1B14',
  red: '#E5262D', // buttons, progress, active
  redHi: '#FF4B52', // red text, signal lines
  redRing: '#FFB3B6', // ring on "next" dot
  redLine: '#7A1E22', // red borders on dark
  redSheet: '#1C0D10', // wrong sheet, callouts
  redNode: '#1A0D10',
  redSoft: '#E9A9AB',
} as const;

export const font = {
  display: ['Unbounded', 'Segoe UI', 'system-ui', 'sans-serif'],
  body: ['Atkinson Hyperlegible', 'Verdana', 'system-ui', 'sans-serif'],
  mono: ['JetBrains Mono', 'ui-monospace', 'Menlo', 'monospace'],
  am: ['Noto Sans Ethiopic', 'Nyala', 'sans-serif'],
};

// 4-pt spacing steps
export const space = { 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 7: 32, 8: 48 } as const;

export const radius = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, '2xl': 24, pill: 999 } as const;

// Type scale: [size, line-height]
export const type = {
  displayXl: [34, 40],
  displayL: [26, 32],
  title: [20, 26],
  bodyL: [17, 23],
  body: [16, 23],
  small: [14, 20],
  label: [11, 16],
} as const;

export const glow = {
  line: '0 0 10px rgba(229,38,45,.7)',
  node: '0 0 22px rgba(229,38,45,.35)',
  lift: '0 8px 24px rgba(229,38,45,.3)',
};

export const motion = {
  tap: 0.12,
  swipe: [0.3, 0.7, 0.2, 1] as [number, number, number, number],
  packetLoop: 8,
};
