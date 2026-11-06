/** Fisher–Yates shuffle: returns a new array in random order. */
export function shuffle<T>(items: readonly T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Answer order for a question: original option indexes in a random order. */
export const answerOrder = (count: number) => shuffle(Array.from({ length: count }, (_, i) => i));
