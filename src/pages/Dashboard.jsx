import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, Send, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { useFamily, isTaskDone } from '../context/FamilyContext';
import AppTile from '../components/AppTile';
import { Avatar } from '../components/MemberBadge';

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
  const [idea, setIdea] = useState('');
  const [weekOffset, setWeekOffset] = useState(0);

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
    { key: 'menu', label: 'Menu de la semaine', to: '/menus', emoji: '🍽️', bg: '#f3c6bf' },
    { key: 'anniv', label: 'Anniversaires', to: '/anniversaires', emoji: '🎂', bg: '#d6e6f2', badge: annivCount },
    { key: 'notes', label: 'Notes', to: '/notes', emoji: '📝', bg: '#f6c9d3', badge: notes.length },
    { key: 'taches', label: 'Tâches', to: '/taches', emoji: '✅', bg: '#cbe6d6', badge: todosLeft },
  ];

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

      {/* Mes applications */}
      <div>
        <h2 className="font-extrabold text-ink text-lg mb-3 px-1">Mes applications</h2>
        <div className="grid grid-cols-3 gap-3">
          {tiles.map((t) => <AppTile key={t.key} {...t} />)}
        </div>
      </div>
    </div>
  );
}
