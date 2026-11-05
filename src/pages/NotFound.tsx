import { LinkButton } from '../components/ui';

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-[560px] flex-col items-center gap-4 pt-16 text-center">
      <span className="font-mono text-xs tracking-[.08em] text-red-hi">404 · NO ROUTE TO HOST</span>
      <h1 className="m-0 font-display text-2xl font-semibold">This page is not on the map.</h1>
      <LinkButton to="/">Back home</LinkButton>
    </div>
  );
}
