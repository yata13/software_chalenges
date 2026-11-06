import { useSyncExternalStore } from 'react';
import { applyMerged, getProgress, mergeProgress, normalizeProgress, onLocalChange, sameSyncData, syncData } from './progress';
import { SUPABASE_KEY, SUPABASE_URL } from './syncConfig';

// =====================================================================
// Sync between your devices (phone ↔ PC), offline-first.
// - Everything is saved on the device first, so the app works offline.
// - When online: pull the server copy, merge, upload the result.
// - Two devices saving at once? The server rejects the older write
//   (version check), we pull again and merge again. Nothing is lost.
// - Only you use the app, so there is no login: a long random SYNC CODE
//   is the key. The server only stores a hash of it.
// =====================================================================

export type SyncState = 'off' | 'syncing' | 'synced' | 'offline' | 'error';
export interface SyncStatus { state: SyncState; lastAt: number | null; pending: boolean; message: string }

const KEY_STORE = 'tech-blueprint:sync-key';
const LAST_STORE = 'tech-blueprint:sync-last';
const PENDING_STORE = 'tech-blueprint:sync-pending';

const ls = {
  get: (k: string) => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k: string, v: string | null) => { try { if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch { /* ignore */ } },
};

export const syncConfigured = Boolean(SUPABASE_URL && SUPABASE_KEY);
export const getSyncKey = () => ls.get(KEY_STORE);

let status: SyncStatus = {
  state: getSyncKey() ? (typeof navigator !== 'undefined' && !navigator.onLine ? 'offline' : 'syncing') : 'off',
  lastAt: Number(ls.get(LAST_STORE)) || null,
  pending: ls.get(PENDING_STORE) === '1',
  message: '',
};
const subs = new Set<() => void>();
function setStatus(patch: Partial<SyncStatus>) {
  status = { ...status, ...patch };
  if (patch.lastAt !== undefined) ls.set(LAST_STORE, patch.lastAt ? String(patch.lastAt) : null);
  if (patch.pending !== undefined) ls.set(PENDING_STORE, patch.pending ? '1' : null);
  subs.forEach((f) => f());
}
export function useSyncStatus() {
  return useSyncExternalStore((f) => { subs.add(f); return () => { subs.delete(f); }; }, () => status, () => status);
}

// ---------- Server calls (two small SQL functions in Supabase) ----------
async function rpc<T>(fn: string, body: Record<string, unknown>): Promise<T> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 15000);
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
      method: 'POST',
      headers: { apikey: SUPABASE_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
    if (!res.ok) {
      const text = await res.text();
      if (text.includes('PGRST202')) throw new Error('The sync server is not set up yet (run the setup SQL in Supabase).');
      throw new Error(`Server said ${res.status}: ${text.slice(0, 160)}`);
    }
    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}
type Remote = { data: unknown; version: number } | null;
async function pull(key: string): Promise<Remote> {
  const rows = await rpc<{ data: unknown; version: number }[]>('sync_pull', { p_key: key });
  return rows[0] ?? null;
}
const push = (key: string, data: unknown, version: number) => rpc<number>('sync_push', { p_key: key, p_data: data, p_version: version });

// ---------- Codes ----------
const CODE_RE = /^tb[A-Za-z0-9_-]{32}$/;
function makeKey() {
  const b = new Uint8Array(24);
  crypto.getRandomValues(b);
  return 'tb' + btoa(String.fromCharCode(...b)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
/** Accepts the code itself or a full sync link. */
export function extractKey(input: string) {
  const m = input.trim().match(/tb[A-Za-z0-9_-]{32}/);
  return m && CODE_RE.test(m[0]) ? m[0] : null;
}
export const syncLink = (key: string) => `${location.origin}/#sync=${key}`;

// ---------- The sync loop ----------
let running = false;
let again = false;
let changeSeq = 0;

export async function syncNow(): Promise<void> {
  const key = getSyncKey();
  if (!syncConfigured || !key) { setStatus({ state: 'off' }); return; }
  if (!navigator.onLine) { setStatus({ state: 'offline' }); return; }
  if (running) { again = true; return; }
  running = true;
  const seqAtStart = changeSeq;
  setStatus({ state: 'syncing', message: '' });
  try {
    for (let attempt = 0; ; attempt++) {
      if (attempt >= 5) throw new Error('Too many saves at once. Will retry.');
      const remote = await pull(key);
      const local = getProgress();
      const remoteP = remote ? normalizeProgress(remote.data) : null;
      const merged = remoteP ? mergeProgress(local, remoteP) : local;
      if (!sameSyncData(merged, local)) applyMerged(merged); // bring this device up to date
      if (remoteP && sameSyncData(merged, remoteP)) break; // server already has everything
      const v = await push(key, syncData(merged), remote ? remote.version : 0);
      if (v !== -1) break; // uploaded
      // Another device saved first: loop → pull its copy, merge again.
    }
    setStatus({ state: 'synced', lastAt: Date.now(), pending: changeSeq !== seqAtStart, message: '' });
  } catch (e) {
    // fetch() failing or timing out = no real connection (e.g. Wi-Fi with no internet): treat as offline.
    const noNet = !navigator.onLine || e instanceof TypeError || (e instanceof DOMException && e.name === 'AbortError');
    setStatus({ state: noNet ? 'offline' : 'error', message: e instanceof Error ? e.message : String(e) });
  } finally {
    running = false;
    if (again || changeSeq !== seqAtStart) { again = false; void syncNow(); }
  }
}

/** First device: create a new sync code and upload this device's progress. */
export async function startSync(): Promise<string> {
  if (!syncConfigured) throw new Error('Sync is not set up on the server yet.');
  if (!navigator.onLine) throw new Error('You are offline. Connect to the internet first.');
  for (let i = 0; i < 3; i++) {
    const key = makeKey();
    const v = await push(key, syncData(getProgress()), 0);
    if (v !== -1) {
      ls.set(KEY_STORE, key);
      setStatus({ state: 'synced', lastAt: Date.now(), pending: false, message: '' });
      return key;
    }
  }
  throw new Error('Could not create a sync code. Try again.');
}

/** Other devices: join with the code. Progress on both sides is combined, never wiped. */
export async function joinSync(input: string): Promise<void> {
  const key = extractKey(input);
  if (!key) throw new Error('That code looks wrong. Copy the whole code or link again.');
  if (!navigator.onLine) throw new Error('You are offline. Connect to the internet first.');
  const remote = await pull(key);
  if (!remote) throw new Error('No progress found for this code. Check you copied all of it.');
  const remoteP = normalizeProgress(remote.data);
  const local = { ...getProgress(), epoch: remoteP.epoch }; // joining combines, even after a reset here
  applyMerged(mergeProgress(local, remoteP));
  ls.set(KEY_STORE, key);
  await syncNow();
}

/** Stop syncing on this device (progress stays here and on the server). */
export function stopSync() {
  ls.set(KEY_STORE, null);
  setStatus({ state: 'off', pending: false, message: '' });
}

// ---------- When to sync ----------
let started = false;
export function startSyncEngine() {
  if (started || typeof window === 'undefined') return;
  started = true;
  let timer: ReturnType<typeof setTimeout> | undefined;
  onLocalChange(() => {
    changeSeq++;
    if (!getSyncKey()) return;
    setStatus({ pending: true, ...(navigator.onLine ? {} : { state: 'offline' as const }) });
    clearTimeout(timer);
    timer = setTimeout(() => void syncNow(), 1500); // after you stop tapping for a moment
  });
  window.addEventListener('online', () => void syncNow()); // internet is back: upload
  window.addEventListener('offline', () => { if (getSyncKey()) setStatus({ state: 'offline' }); });
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') void syncNow(); });
  setInterval(() => { if (document.visibilityState === 'visible') void syncNow(); }, 60_000);
  void syncNow();
}

/** "2 min ago" style time. */
export function ago(ts: number | null) {
  if (!ts) return 'never';
  const s = Math.max(0, Math.round((Date.now() - ts) / 1000));
  if (s < 45) return 'just now';
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} h ago`;
  const d = Math.round(h / 24);
  return `${d} day${d === 1 ? '' : 's'} ago`;
}
