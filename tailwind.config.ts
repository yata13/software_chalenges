import type { Config } from 'tailwindcss';
import { color, font, radius, glow } from './src/theme/tokens';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg0: color.bg0,
        bg1: color.bg1,
        surface: color.surface,
        sunk: color.sunk,
        surface2: color.surface2,
        line: color.line,
        'line-soft': color.lineSoft,
        'line-strong': color.lineStrong,
        track: color.track,
        ink: color.text,
        ink2: color.text2,
        ink3: color.text3,
        muted: color.muted,
        green: color.green,
        'green-ink': color.greenInk,
        'green-sheet': color.greenSheet,
        red: color.red,
        'red-hi': color.redHi,
        'red-ring': color.redRing,
        'red-line': color.redLine,
        'red-sheet': color.redSheet,
        'red-node': color.redNode,
        'red-soft': color.redSoft,
      },
      fontFamily: { display: font.display, body: font.body, mono: font.mono, am: font.am },
      borderRadius: {
        xs: `${radius.xs}px`, sm: `${radius.sm}px`, md: `${radius.md}px`, lg: `${radius.lg}px`,
        xl: `${radius.xl}px`, '2xl': `${radius['2xl']}px`,
      },
      boxShadow: { 'glow-line': glow.line, 'glow-node': glow.node, lift: glow.lift },
      screens: { lg: '900px' },
    },
  },
  plugins: [],
} satisfies Config;
