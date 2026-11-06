import { useMemo, useState } from 'react';
import qrcode from 'qrcode-generator';
import { Button, Icon, cx } from './ui';
import type { IconName } from './icons';
import { ago, getSyncKey, joinSync, startSync, stopSync, syncConfigured, syncLink, syncNow, useSyncStatus, type SyncStatus } from '../store/sync';

/** One line that says, in plain words, what sync is doing. */
export function syncLine(s: SyncStatus): { icon: IconName; text: string; tone: 'ok' | 'wait' | 'warn' | 'off' } {
  switch (s.state) {
    case 'off': return { icon: 'cloudOff', text: 'Sync is off: progress stays on this device only.', tone: 'off' };
    case 'syncing': return { icon: 'sync', text: 'Syncing…', tone: 'wait' };
    case 'synced': return { icon: 'cloud', text: `Synced ${ago(s.lastAt)}`, tone: 'ok' };
    case 'offline': return s.pending
      ? { icon: 'cloudOff', text: 'Offline. Your changes are saved here and will upload when you’re online.', tone: 'wait' }
      : { icon: 'cloudOff', text: `Offline. Up to date as of ${ago(s.lastAt)}.`, tone: 'off' };
    case 'error': return { icon: 'alert', text: 'Couldn’t sync right now. It will try again by itself.', tone: 'warn' };
  }
}
const toneClass = { ok: 'text-green', wait: 'text-ink2', warn: 'text-red-hi', off: 'text-ink3' };

/** Small status chip for headers. */
export function SyncChip() {
  const s = useSyncStatus();
  if (s.state === 'off') return null;
  const l = syncLine(s);
  const short = s.state === 'synced' ? 'Synced' : s.state === 'syncing' ? 'Syncing' : s.state === 'offline' ? (s.pending ? 'Waiting' : 'Offline') : 'Retry';
  return (
    <span title={l.text} aria-label={l.text} className={cx('inline-flex h-9 items-center gap-1.5 rounded-full border border-line px-2.5 font-mono text-[11px]', toneClass[l.tone])}>
      <Icon name={l.icon} size={16} className={s.state === 'syncing' ? 'animate-spin' : undefined} />
      <span className="hidden sm:inline">{short}</span>
    </span>
  );
}

function Qr({ text }: { text: string }) {
  const { size, d } = useMemo(() => {
    const qr = qrcode(0, 'M');
    qr.addData(text);
    qr.make();
    const n = qr.getModuleCount();
    let path = '';
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (qr.isDark(r, c)) path += `M${c} ${r}h1v1h-1z`;
    return { size: n, d: path };
  }, [text]);
  // Dark on white: every phone camera can read it.
  return (
    <svg viewBox={`-3 -3 ${size + 6} ${size + 6}`} className="h-auto w-[200px] rounded-md bg-white" role="img" aria-label="QR code with your sync link">
      <path d={d} fill="#0B0B0F" />
    </svg>
  );
}

export default function SyncCard() {
  const s = useSyncStatus();
  const key = getSyncKey(); // re-read each render: status changes re-render this card
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [showCode, setShowCode] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const line = syncLine(s);
  if (!syncConfigured) return null; // no server yet: keep the page as it was

  const run = async (fn: () => Promise<unknown>, okText: string) => {
    setBusy(true); setMsg(null);
    try { await fn(); setMsg({ ok: true, text: okText }); }
    catch (e) { setMsg({ ok: false, text: e instanceof Error ? e.message : 'Something went wrong.' }); }
    finally { setBusy(false); }
  };
  const copy = async (text: string, what: string) => {
    try { await navigator.clipboard.writeText(text); setMsg({ ok: true, text: `${what} copied.` }); }
    catch { setShowCode(true); setMsg({ ok: true, text: 'Select the code and copy it.' }); }
  };

  return (
    <section aria-label="Sync my devices" className="card flex flex-col gap-3 rounded-xl">
      <div className="flex items-center gap-2.5">
        <Icon name="sync" color="#FF4B52" />
        <h2 className="m-0 font-display text-base font-semibold">Sync my devices</h2>
      </div>
      <p className="m-0 text-[15px] leading-[22px] text-ink2">Same progress on your phone and PC. Works offline: changes upload by themselves when you’re back online.</p>

      <div role="status" className={cx('flex items-start gap-2 rounded-md border border-line-soft bg-sunk p-3 text-[14px] leading-5', toneClass[line.tone])}>
        <Icon name={line.icon} size={18} className={cx('mt-px flex-none', s.state === 'syncing' && 'animate-spin')} />
        <span>{line.text}</span>
      </div>

      {!syncConfigured && <p className="m-0 text-sm text-red-hi">Sync isn’t set up on the server yet.</p>}

      {syncConfigured && !key && (
        <>
          <Button small disabled={busy} onClick={() => run(startSync, 'Sync is on. Now open the app on your other device and join with your code.')}>
            <Icon name="cloud" size={16} />Start sync (first device)
          </Button>
          <div className="flex items-center gap-3 text-ink3"><span className="h-px flex-1 bg-line-soft" /><span className="label">or join</span><span className="h-px flex-1 bg-line-soft" /></div>
          <form className="flex flex-wrap gap-2" onSubmit={(e) => { e.preventDefault(); void run(() => joinSync(code), 'Joined! Your progress from both devices is combined.'); }}>
            <label htmlFor="sync-code" className="sr-only">Sync code or link</label>
            <input id="sync-code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="Paste your sync code or link" autoComplete="off" spellCheck={false}
              className="h-11 min-w-0 flex-[1_1_200px] rounded-md border border-line bg-sunk px-3 font-mono text-xs outline-none focus:border-red-hi" />
            <Button small variant="secondary" type="submit" disabled={busy || !code.trim()}>Join</Button>
          </form>
        </>
      )}

      {syncConfigured && key && (
        <>
          <div className="flex flex-col gap-2">
            <span className="label">Your sync code · keep it private</span>
            <code className="break-all rounded-md border border-line-soft bg-sunk p-3 font-mono text-[12px] text-ink">
              {showCode ? key : `${key.slice(0, 4)}${'•'.repeat(22)}${key.slice(-4)}`}
            </code>
            <div className="flex flex-wrap gap-2">
              <Button small variant="secondary" onClick={() => setShowCode((v) => !v)}><Icon name="eye" size={16} />{showCode ? 'Hide' : 'Show'}</Button>
              <Button small variant="secondary" onClick={() => copy(key, 'Code')}><Icon name="copy" size={16} />Copy code</Button>
              <Button small variant="secondary" onClick={() => copy(syncLink(key), 'Link')}><Icon name="link" size={16} />Copy link</Button>
              <Button small variant="secondary" onClick={() => setShowQr((v) => !v)}><Icon name="qr" size={16} />{showQr ? 'Hide QR' : 'QR for phone'}</Button>
            </div>
          </div>
          {showQr && (
            <div className="flex flex-wrap items-center gap-4">
              <Qr text={syncLink(key)} />
              <ol className="m-0 flex max-w-[300px] list-decimal flex-col gap-1.5 pl-5 text-[14px] leading-5 text-ink2">
                <li>Point your phone camera at the code.</li>
                <li>Open the link, then tap <b className="text-ink">Join</b>.</li>
                <li>iPhone home-screen app: paste the code in Profile instead.</li>
              </ol>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            <Button small disabled={busy || s.state === 'syncing'} onClick={() => run(syncNow, 'Done.')}><Icon name="sync" size={16} />Sync now</Button>
            <Button small variant="secondary" className="ml-auto" disabled={busy}
              onClick={() => { if (window.confirm('Stop syncing on this device? Your progress stays here and on your other devices.')) { stopSync(); setShowQr(false); setMsg({ ok: true, text: 'Sync is off on this device.' }); } }}>
              Stop sync here
            </Button>
          </div>
        </>
      )}

      {msg && <p role="status" className={cx('m-0 text-sm', msg.ok ? 'text-green' : 'text-red-hi')}>{msg.text}</p>}
    </section>
  );
}
