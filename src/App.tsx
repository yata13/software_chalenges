import { Suspense, lazy, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
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

export default function App() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
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
          <Route path="/lesson/:id" element={<Lesson />} />
          <Route path="/quiz/:id" element={<Quiz />} />
          <Route path="/boss/:id" element={<Boss />} />
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
