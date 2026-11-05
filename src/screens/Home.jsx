import Icon, { Diamond } from '../components/Icon.jsx';
import { Ring, Bar, Logo, Segments } from '../components/ui.jsx';
import { LiveDiagram } from '../diagrams/index.jsx';
import { TRACKS, trackProgress, TOTAL_LESSONS } from '../data/tracks.js';
import { continueLesson, currentTrack, readyBoss } from '../data/progress.js';
import { WORDS } from '../data/library.js';
import { useStore, useDerived, DAILY_GOAL } from '../store.jsx';

export default function Home() {
  const { s } = useStore();
  const { done, lessonsDone, level } = useDerived();
  const lesson = continueLesson(done);
  const cur = currentTrack(done);
  const boss = readyBoss(done);
  const card = s.lessonCard[lesson.id] ?? 0;
  const toGoal = Math.max(0, DAILY_GOAL - s.todayXP);
  const date = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' });
  const wordOfDay = WORDS[Math.floor(Date.now() / 86400000) % WORDS.length];

  return (
    <div className="page">
      <header className="row between phone-only" style={{ height: 44 }}>
        <Logo />
        <div className="row g8">
          <span className="pill" aria-label={`${s.streak} day streak`}><Icon name="streak" size={18} /><span className="m" style={{ fontSize: 14, fontWeight: 600 }}>{s.streak}</span><span className="m" style={{ fontSize: 11, color: '#E9A9AB' }}>days</span></span>
          <a href="#/tools" aria-label="Tools" className="icon-btn"><Icon name="tools" /></a>
        </div>
      </header>

      <div className="row between wrap g16" style={{ alignItems: 'flex-end' }}>
        <div className="stack g6">
          <span className="label">{date.replace(',', ' ·')}</span>
          <h1 className="d display-xl">Selam, {s.name}</h1>
          <p className="t2" style={{ fontSize: 15 }}>{toGoal > 0 ? `${toGoal} XP more to hit today’s goal.` : 'Daily goal done. Nice work!'}</p>
        </div>
        <div className="row g8 desk-only">
          <span className="pill"><Icon name="streak" size={18} /><span className="m" style={{ fontSize: 14, fontWeight: 600 }}>{s.streak}-day streak</span></span>
          <a href="#/practice" className="btn secondary small"><Icon name="practice" size={18} />Quick 5</a>
        </div>
      </div>

      <div className="home-top">
        {/* Continue card */}
        <section aria-label="Continue learning" className="card xl stack g14">
          <div className="row between">
            <span className="label red">Continue · {cur.short} {lesson.id}</span>
            <span className="label">Card {card + 1}/{lesson.cards.length} · {lesson.minutes} min</span>
          </div>
          <a href={`#/lesson/${lesson.id}`} className="diagram" style={{ display: 'block' }} aria-label={`Open lesson: ${lesson.title}`}>
            <div className="diagram-body"><LiveDiagram kind={lesson.diagram} /></div>
          </a>
          <div className="stack g10">
            <h2 className="d title">{lesson.title}</h2>
            <div className="row g10">
              <div className="flex1"><Segments count={lesson.cards.length} at={card} label="Lesson progress" /></div>
              <span className="m t2" style={{ fontSize: 11 }}>+{lesson.xp} XP</span>
            </div>
          </div>
          <a href={`#/lesson/${lesson.id}`} className="btn primary block"><Icon name="play" size={18} />Continue lesson</a>
        </section>

        {/* Today */}
        <div className="stack g16">
          <section aria-label="Today" className="card row g16">
            <Ring size={96} stroke={9} value={s.todayXP / DAILY_GOAL} label={`Daily goal: ${s.todayXP} of ${DAILY_GOAL} XP`}>
              <span className="d" style={{ fontSize: 22, lineHeight: '24px' }}>{s.todayXP}</span>
              <span className="m t2" style={{ fontSize: 10 }}>/{DAILY_GOAL} XP</span>
            </Ring>
            <div className="flex1 stack g8">
              <div className="row between"><span className="label red">Level {level.level}</span><span className="label">{level.toNext.toLocaleString()} XP → LVL {level.level + 1}</span></div>
              <span className="d" style={{ fontSize: 15 }}>{level.name}</span>
              <Bar pct={level.pct} label="XP to next level" />
              <span className="m t2" style={{ fontSize: 11 }}>{s.xp.toLocaleString()} / {level.next.toLocaleString()} XP</span>
            </div>
          </section>
          <section aria-label="This week" className="card stack g10 desk-only">
            <span className="label">This week</span>
            <div className="row between">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                <span key={i} className="stack g6" style={{ alignItems: 'center' }}>
                  <span style={{ width: 30, height: 30, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: s.activeDays[i] ? '#E5262D' : 'transparent', border: s.activeDays[i] ? 0 : '1px solid #2B2B36' }}>
                    {s.activeDays[i] ? <Icon name="streak" size={16} color="#fff" /> : null}
                  </span>
                  <span className="m t3" style={{ fontSize: 10 }}>{d}</span>
                </span>
              ))}
            </div>
          </section>
          {boss && (
            <a href={`#/boss/${boss.id}`} className="card row g14" style={{ borderStyle: 'dashed', borderColor: '#7A1E22', color: '#F5F5F7' }}>
              <span style={{ width: 44, display: 'flex', justifyContent: 'center' }}><Diamond state="next" size={26} /></span>
              <span className="flex1 stack g4"><span className="label red">Boss ready · T5</span><span style={{ fontSize: 16, fontWeight: 700 }}>{boss.title}</span><span className="m t2" style={{ fontSize: 11 }}>DESIGN TASK · +{boss.xp} XP</span></span>
              <Icon name="right" color="#868694" />
            </a>
          )}
        </div>
      </div>

      {/* Tracks */}
      <section aria-label="Your tracks" className="stack g4">
        <div className="row between">
          <h2 className="d title-s">Your tracks</h2>
          <a href="#/map" className="m" style={{ height: 44, display: 'flex', alignItems: 'center', fontSize: 12 }}>{lessonsDone}/{TOTAL_LESSONS} · See map →</a>
        </div>
        <div className="tracks-grid">
          {TRACKS.map((t) => {
            const p = trackProgress(t, done);
            const isCur = t.code === cur.code;
            return (
              <a key={t.code} href={`#/map/${t.code}`} className="card stack g10" style={{ padding: 14, borderRadius: 14, color: '#F5F5F7', background: isCur ? '#1A1014' : undefined, borderColor: isCur ? '#7A1E22' : undefined }}>
                <div className="row between">
                  <span style={{ width: 32, height: 32, borderRadius: 9, border: `1px solid ${isCur ? '#E5262D' : '#2B2B36'}`, color: isCur ? '#FF4B52' : '#F5F5F7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={t.icon} size={18} /></span>
                  {p.complete
                    ? <span className="m row g4" style={{ fontSize: 11 }}><Icon name="check" size={12} stroke={2.6} />DONE</span>
                    : <span className="m" style={{ fontSize: 11, color: isCur ? '#FF4B52' : '#A3A3B0' }}>{isCur ? 'NOW · ' : ''}{p.doneLessons}/{p.total}</span>}
                </div>
                <span style={{ fontSize: 14, lineHeight: '18px', fontWeight: 700 }}><span className="phone-only">{t.short}</span><span className="desk-only">{t.name}</span></span>
                <Bar thin white={!isCur} cur={isCur} pct={p.pct} label={`${t.name} progress`} />
                <span className="m t3 desk-only" style={{ fontSize: 10, textTransform: 'uppercase' }}>{p.complete ? 'Review anytime' : `Next · ${p.next.num} ${p.next.title}`}</span>
              </a>
            );
          })}
        </div>
      </section>

      <div className="grid-auto">
        <a href="#/tools" className="card stack g12" style={{ color: '#F5F5F7' }}>
          <span className="label">Word of the day</span>
          <div className="row g10" style={{ alignItems: 'baseline' }}>
            <b style={{ fontSize: 20 }}>{wordOfDay.term}</b>
            {wordOfDay.am && <span className="am" lang="am" style={{ fontSize: 15, color: '#E9A9AB' }}>{wordOfDay.am}</span>}
            <span className="m t3" style={{ marginLeft: 'auto', fontSize: 10 }}>{wordOfDay.track}</span>
          </div>
          <span style={{ fontSize: 15, lineHeight: '21px' }}>{wordOfDay.def}</span>
        </a>
        <section className="card stack g12">
          <span className="label red">Quick 5 · 2 min</span>
          <b style={{ fontSize: 18 }}>Mixed review</b>
          <span className="t2" style={{ fontSize: 15 }}>5 questions from your lessons.</span>
          <a href="#/practice/run" className="btn secondary small" style={{ alignSelf: 'flex-start' }}><Icon name="practice" size={16} />Start</a>
        </section>
      </div>
    </div>
  );
}
