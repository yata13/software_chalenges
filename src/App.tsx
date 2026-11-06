import { Suspense, lazy, useEffect } from 'react';
import { Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import { extractKey, getSyncKey, joinSync } from './store/sync';
import type { ComponentType } from 'react';
import { Sidebar, TabBar } from './components/Nav';
import { cx } from './components/ui';
import Home from './pages/Home';
import Roadmap from './pages/Roadmap';
import Lesson from './pages/Lesson';
import Quiz from './pages/Quiz';
import Boss from './pages/Boss';
import Practice from './pages/Practice';
import Tools from './pages/Tools';
import NotFound from './pages/NotFound';

// Charts (Recharts) are heavy: load the Profile page only when opened.
const Profile = lazy(() => import('./pages/Profile'));

// Remount the page when :id changes, so state (card, answers) never leaks between lessons.
function Keyed({ page: Page }: { page: ComponentType }) {
  const { id } = useParams();
  return <Page key={id} />;
}

export default function App() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  // Opened from a sync link / QR code (…/#sync=CODE): offer to join.
  useEffect(() => {
    const key = window.location.hash.startsWith('#sync=') ? extractKey(window.location.hash) : null;
    if (!key) return;
    history.replaceState(null, '', window.location.pathname + window.location.search); // hide the code from the address bar
    if (getSyncKey() === key) return;
    if (window.confirm('Join sync on this device? Progress here and on your other devices will be combined.')) {
      navigate('/profile');
      joinSync(key).catch((e) => window.alert(e instanceof Error ? e.message : 'Could not join sync.'));
    }
  }, [navigate]);
  // Focus screens (lesson, quiz, boss) hide the phone tab bar
  const focus = /^\/(lesson|quiz|boss)\//.test(pathname) || pathname === '/practice/run';
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className={cx('min-w-0 flex-1 px-5 pt-4 lg:px-10 lg:pb-14 lg:pt-8', focus ? 'pb-28' : 'pb-[112px]')}>
        <Suspense fallback={<p className="label pt-10 text-center">Loading…</p>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/map" element={<Roadmap />} />
          <Route path="/lesson/:id" element={<Keyed page={Lesson} />} />
          <Route path="/quiz/:id" element={<Keyed page={Quiz} />} />
          <Route path="/boss/:id" element={<Keyed page={Boss} />} />
          <Route path="/practice" element={<Practice />} />
          <Route path="/practice/run" element={<Practice run />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/tools" element={<Tools />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
      </main>
      {!focus && <TabBar />}
    </div>
  );
}
