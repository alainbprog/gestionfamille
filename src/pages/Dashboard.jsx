import { useState, useRef, useLayoutEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, Send, Sparkles, ChevronLeft, ChevronRight, Mic, Loader2 } from 'lucide-react';
import { useFamily, isTaskDone } from '../context/FamilyContext';
import AppTile from '../components/AppTile';
import { Avatar } from '../components/MemberBadge';
import { useVoice } from '../components/VoiceProvider';

const DAY_LETTERS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
const MONTHS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
const PILL_COLORS = ['#8bb174', '#c39bd8', '#e79aad', '#7fb0d8', '#d98b8b', '#e0b877'];

const iso = (d) => d.toISOString().slice(0, 10);

function startOfWeek(base) {
  const d = new Date(base);
  const dow = (d.getDay() + 6) % 7; // 0 = lundi
  d.setDate(d.getDate() - dow);
  d.setHours(0, 0, 0, 0);
  return d;
}

export default function Dashboard() {
  const { shopping, events, todos, members, memberById, notes, recipes, birthdays, addNote } = useFamily();
  const navigate = useNavigate();
  const { start: startVoice, status: voiceStatus } = useVoice();
  const [idea, setIdea] = useState('');
  const [weekOffset, setWeekOffset] = useState(0);

  // Rayons « soleil » : lignes du micro central vers chaque tuile
  const gridRef = useRef(null);
  const tileRefs = useRef([]);
  const [rays, setRays] = useState([]);
  const [hub, setHub] = useState({ x: 0, y: 0 });

  const today = new Date();
  const todayIso = iso(today);
  const shoppingLeft = shopping.filter((i) => !i.done).length;
  const todosLeft = todos.filter((t) => !isTaskDone(t)).length;
  const todayEvents = events.filter((e) => e.date === todayIso).length;

  // Anniversaires à venir (membres + liste additionnelle)
  const annivCount = [...members.filter((m) => m.birthdate), ...birthdays].length;

  // Semaine affichée
  const weekBase = new Date(today);
  weekBase.setDate(weekBase.getDate() + weekOffset * 7);
  const monday = startOfWeek(weekBase);
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
  const monthLabel = `${MONTHS[weekDays[3].getMonth()]} ${weekDays[3].getFullYear()}`;

  const eventsOn = (d) =>
    events
      .filter((e) => e.date === iso(d))
      .sort((a, b) => (a.time || '').localeCompare(b.time || ''));

  const pillColor = (e, i) => {
    const m = e.memberId && memberById(e.memberId);
    return m ? m.color : PILL_COLORS[i % PILL_COLORS.length];
  };

  const submitIdea = (e) => {
    e.preventDefault();
    if (!idea.trim()) return;
    addNote(idea.trim());
    setIdea('');
    navigate('/notes');
  };

  const firstMember = members[0];

  const tiles = [
    { key: 'courses', label: 'Courses', to: '/courses', emoji: '🛒', bg: '#cbe6d6', badge: shoppingLeft },
    { key: 'recettes', label: 'Recettes', to: '/recettes', emoji: '👩‍🍳', bg: '#fbe7b3', badge: recipes.length },
    { key: 'frigo', label: 'Mon frigo', to: '/frigo', emoji: '🧊', bg: '#cfe8f3' },
    { key: 'calories', label: 'Calories', to: '/calories', emoji: '🍽️', bg: '#f3d9c6' },
    { key: 'bienetre', label: 'Bien-être', to: '/bien-etre', emoji: '🧘‍♀️', bg: '#bfe0d0' },
    { key: 'routines', label: 'Routines', to: '/routines', emoji: '⏰', bg: '#f6ddc2' },
    { key: 'calendrier', label: 'Calendrier', to: '/agenda', emoji: '📅', bg: '#fbe7b3', badge: todayEvents },
    { key: 'rdv', label: 'Rendez-vous', to: '/agenda', emoji: '🗓️', bg: '#f7d6c0', badge: todayEvents },
    { key: 'menu', label: 'Menu de la semaine', to: '/menus', emoji: '🍽️', bg: '#f3c6bf' },
    { key: 'anniv', label: 'Anniversaires', to: '/anniversaires', emoji: '🎂', bg: '#d6e6f2', badge: annivCount },
    { key: 'notes', label: 'Notes', to: '/notes', emoji: '📝', bg: '#f6c9d3', badge: notes.length },
    { key: 'taches', label: 'Tâches', to: '/taches', emoji: '✅', bg: '#cbe6d6', badge: todosLeft },
  ];

  useLayoutEffect(() => {
    const compute = () => {
      const c = gridRef.current;
      if (!c) return;
      const cb = c.getBoundingClientRect();
      const cx = cb.width / 2;
      const cy = cb.height / 2;
      setHub({ x: cx, y: cy });
      const lines = tileRefs.current.filter(Boolean).map((el) => {
        const b = el.getBoundingClientRect();
        return { x: b.left - cb.left + b.width / 2, y: b.top - cb.top + b.height / 2 };
      });
      setRays(lines);
    };
    compute();
    const ro = new ResizeObserver(compute);
    if (gridRef.current) ro.observe(gridRef.current);
    window.addEventListener('resize', compute);
    return () => { ro.disconnect(); window.removeEventListener('resize', compute); };
  }, [tiles.length]);

  return (
    <div className="space-y-5">
      {/* En-tête */}
      <div className="flex items-center justify-between pt-1">
        <span className="script text-3xl text-brand-600 leading-none">Planning familial</span>
        <div className="flex items-center gap-3">
          <Link to="/agenda" className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center text-ink" aria-label="Agenda">
            <Bell size={18} />
          </Link>
          <Link to="/famille" aria-label="Famille">
            <Avatar member={firstMember} size={36} />
          </Link>
        </div>
      </div>

      {/* Salutation */}
      <div>
        <h1 className="text-3xl font-extrabold text-ink flex items-baseline gap-2 flex-wrap">
          <span className="capitalize">{today.toLocaleDateString('fr-FR', { weekday: 'long' })}</span>
          <span className="script text-brand-600 text-4xl">{today.getDate()} {MONTHS[today.getMonth()]}</span>
        </h1>
        <div className="inline-flex items-center gap-2 mt-1 text-ink/70 font-semibold">
          <Avatar member={firstMember} size={22} />
          <span>Chez nous</span>
        </div>
      </div>

      {/* Barre d'idées → note rapide */}
      <form onSubmit={submitIdea} className="card px-3 py-2 flex items-center gap-2">
        <Sparkles size={18} className="text-brand-500 shrink-0" />
        <input
          className="flex-1 bg-transparent outline-none text-sm py-1.5 placeholder:text-ink/40"
          placeholder="Une idée, une note à garder…"
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
        />
        <button type="submit" className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center shrink-0 active:scale-95" aria-label="Enregistrer">
          <Send size={15} />
        </button>
      </form>

      {/* Bande calendrier de la semaine */}
      <div className="card p-3">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="font-extrabold text-ink capitalize text-sm">{monthLabel}</span>
          <div className="flex items-center gap-1">
            <button onClick={() => setWeekOffset((o) => o - 1)} className="w-7 h-7 rounded-full hover:bg-black/5 flex items-center justify-center" aria-label="Semaine précédente"><ChevronLeft size={16} /></button>
            <button onClick={() => setWeekOffset((o) => o + 1)} className="w-7 h-7 rounded-full hover:bg-black/5 flex items-center justify-center" aria-label="Semaine suivante"><ChevronRight size={16} /></button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map((d, i) => {
            const isToday = iso(d) === todayIso;
            const dayEvents = eventsOn(d);
            return (
              <button
                key={i}
                onClick={() => navigate('/agenda')}
                className="flex flex-col items-center gap-1 pt-1 pb-1 rounded-xl hover:bg-black/[0.03] transition"
              >
                <span className="text-[10px] font-bold text-ink/40">{DAY_LETTERS[i]}</span>
                <span className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-extrabold ${isToday ? 'bg-brand-600 text-white' : 'text-ink'}`}>
                  {d.getDate()}
                </span>
                <div className="w-full space-y-0.5 mt-0.5">
                  {dayEvents.slice(0, 2).map((e, j) => (
                    <div
                      key={e.id}
                      className="text-[8px] leading-tight font-bold rounded px-1 py-0.5 truncate"
                      style={{ backgroundColor: pillColor(e, j) + '33', color: pillColor(e, j) }}
                      title={e.title}
                    >
                      {e.title}
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="text-[8px] text-ink/40 font-bold text-center">+{dayEvents.length - 2}</div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mes applications — le micro au centre, des rayons vers chaque tuile */}
      <div>
        <h2 className="font-extrabold text-ink text-lg mb-3 px-1">Mes applications</h2>

        <div ref={gridRef} className="relative">
          {/* Rayons de soleil : du micro central vers chaque tuile */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }} aria-hidden>
            {rays.map((r, i) => (
              <line key={i} x1={hub.x} y1={hub.y} x2={r.x} y2={r.y}
                stroke="#b79ae0" strokeWidth="2" strokeDasharray="2 5" strokeLinecap="round" opacity="0.65" />
            ))}
          </svg>

          <div className="grid grid-cols-3 gap-3 relative" style={{ zIndex: 10 }}>
            {tiles.map((t, i) => (
              <div key={t.key} ref={(el) => (tileRefs.current[i] = el)}>
                <AppTile {...t} />
              </div>
            ))}
          </div>

          {/* Micro central */}
          <button
            onClick={startVoice}
            aria-label="Tout noter avec le micro"
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{ zIndex: 20 }}
          >
            <span className={`relative flex items-center justify-center w-16 h-16 rounded-full text-white shadow-xl ring-4 ring-white transition active:scale-95 ${voiceStatus === 'listening' ? 'bg-red-500' : 'bg-brand-600 hover:bg-brand-700'}`}>
              {voiceStatus === 'listening' && <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-60" />}
              {voiceStatus === 'processing' ? <Loader2 size={26} className="animate-spin" /> : <Mic size={26} />}
            </span>
          </button>
        </div>

        <p className="text-center text-sm text-ink/55 font-semibold mt-3">
          🎤 Appuie sur le micro et parle : j’ajoute au bon endroit (rendez-vous, courses, tâches, notes…)
        </p>
      </div>
    </div>
  );
}
