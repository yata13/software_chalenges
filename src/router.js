import { useEffect, useState } from 'react';

// Tiny hash router: #/lesson/2.6 → ['lesson', '2.6']
function parse() {
  const h = window.location.hash.replace(/^#\/?/, '');
  return h ? h.split('/').map(decodeURIComponent) : [];
}

export function useRoute() {
  const [parts, setParts] = useState(parse);
  useEffect(() => {
    const on = () => { setParts(parse()); window.scrollTo(0, 0); };
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return parts;
}

export const go = (path) => { window.location.hash = path; };
export const href = (path) => `#${path}`;
