# Tech Blueprint

Learn how tech really works. **Pictures first, words last.**
A phone + desktop learning app (installable PWA) for self-taught developers.

- 8 tracks · 32 lessons · 8 boss challenges
- Every lesson starts with an animated diagram, then short swipe cards
- Tap-to-explain words, one-line Amharic summary, real examples from Ethiopia
- Quiz with instant feedback, XP, levels, daily streak and goal
- Practice (5 random questions from finished lessons), profile charts, word bank
- Progress saved in the browser. Move it between phone and PC with a backup code.

## Run it

```bash
npm install
```

```bash
npm run dev
```

Open http://localhost:5173. Build for production with `npm run build` (output in `dist/`).

## Stack

React + TypeScript + Vite · Tailwind (theme in `src/theme/tokens.ts`) · Framer Motion ·
lucide-react · Recharts · react-router · vite-plugin-pwa · localStorage.

## Folders

```
src/
  theme/tokens.ts     colors, fonts, spacing, radius, glow (Tailwind reads this)
  content/            all lessons and bosses, typed (types.ts explains the shape)
  store/progress.ts   XP, levels, streak, daily goal, backup code
  diagrams/           FlowDiagram, StackDiagram, CompareCards, BarChart (log scale),
                      NeuralNet, CoreGrid, Timeline: all drawn from lesson data
  components/         buttons, chips, rings, bars, quiz answers, nav
  pages/              Home, Roadmap, Lesson, Quiz, Boss, Practice, Profile, Tools
```

## Add a lesson

Open a file in `src/content/` (for example `network.ts`) and add an object to the list.
TypeScript will tell you if a field is missing. Put `[word]` in a card line to make it a
tap-to-explain word (add the word to `words`).

## Deploy

**Vercel:** import the GitHub repo at vercel.com/new. It finds Vite by itself.
`vercel.json` sends every page to `index.html`, so links like `/map` work.

**Netlify:** "Add new site → Import from Git" and pick the repo. `netlify.toml` already sets
`npm run build` and `dist`. `public/_redirects` handles page links.

Or from your computer:

```bash
npx netlify-cli deploy --build --prod
```

**Install on your phone:** open the site in Chrome (Android) or Safari (iPhone) → menu →
"Add to Home screen". It works offline after the first visit.
