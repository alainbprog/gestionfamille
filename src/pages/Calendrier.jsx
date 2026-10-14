import { useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, MapPin, Clock } from 'lucide-react';
import { useFamily } from '../context/FamilyContext';
import { MemberChip } from '../components/MemberBadge';

const MONTHS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
const DOW = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export default function Calendrier() {
  const { events, memberById } = useFamily();
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const todayIso = iso(today);

  const [cur, setCur] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected, setSelected] = useState(todayIso);

  const year = cur.getFullYear();
  const month = cur.getMonth();
  const startPad = (new Date(year, month, 1).getDay() + 6) % 7; // lundi = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < startPad; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

  const eventsOn = (dStr) => events.filter((e) => e.date === dStr).sort((a, b) => (a.time || '').localeCompare(b.time || ''));
  const selEvents = eventsOn(selected);
  const selLabel = new Date(selected + 'T00:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

  const colorOf = (e, i) => {
    const m = e.memberId && memberById(e.memberId);
    return m ? m.color : '#6d5ca6';
  };

  return (
    <div>
      <h1 className="text-2xl font-extrabold flex items-center gap-2 mb-4">
        <CalendarDays className="text-brand-600" /> Calendrier
      </h1>

      <div className="card p-4 mb-5">
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => setCur(new Date(year, month - 1, 1))} className="w-9 h-9 rounded-full hover:bg-black/5 flex items-center justify-center" aria-label="Mois précédent"><ChevronLeft size={18} /></button>
          <span className="font-extrabold text-ink capitalize">{MONTHS[month]} {year}</span>
          <button onClick={() => setCur(new Date(year, month + 1, 1))} className="w-9 h-9 rounded-full hover:bg-black/5 flex items-center justify-center" aria-label="Mois suivant"><ChevronRight size={18} /></button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-1">
          {DOW.map((d, i) => (
            <div key={i} className="text-center text-[11px] font-bold text-ink/40">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {cells.map((d, i) => {
            if (!d) return <div key={`e${i}`} />;
            const dStr = iso(d);
            const evs = eventsOn(dStr);
            const isToday = dStr === todayIso;
            const isSel = dStr === selected;
            return (
              <button
                key={dStr}
                onClick={() => setSelected(dStr)}
                className={`aspect-square rounded-xl flex flex-col items-center justify-center gap-0.5 text-sm transition ${isSel ? 'bg-brand-600 text-white font-extrabold' : isToday ? 'bg-brand-100 text-brand-700 font-extrabold' : 'hover:bg-black/5 text-ink'}`}
              >
                <span>{d.getDate()}</span>
                <span className="flex gap-0.5 h-1.5">
                  {evs.slice(0, 3).map((e, j) => (
                    <span key={e.id} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: isSel ? '#ffffff' : colorOf(e, j) }} />
                  ))}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Détail du jour sélectionné */}
      <h2 className="text-sm font-extrabold text-brand-700 mb-2 capitalize">{selLabel}</h2>
      {selEvents.length === 0 ? (
        <p className="text-sm text-ink/40 py-4 text-center">Aucun rendez-vous ce jour-là.</p>
      ) : (
        <ul className="space-y-2">
          {selEvents.map((e) => (
            <li key={e.id} className="card p-4 flex items-start gap-3">
              <div className="text-center shrink-0 bg-brand-50 text-brand-700 rounded-xl px-3 py-2 min-w-[64px]">
                {e.time ? <span className="font-extrabold text-lg leading-none">{e.time}</span> : <Clock size={20} className="mx-auto opacity-60" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold">{e.title}</p>
                <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-gray-500">
                  {e.location && <span className="inline-flex items-center gap-1"><MapPin size={14} />{e.location}</span>}
                  {e.memberId && <MemberChip member={memberById(e.memberId)} />}
                </div>
                {e.notes && <p className="text-sm text-gray-400 mt-1">{e.notes}</p>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
