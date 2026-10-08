import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CalendarClock, CheckCircle2, Cake, X } from 'lucide-react';
import { useFamily, isTaskDone } from '../context/FamilyContext';

const todayIso = () => new Date().toISOString().slice(0, 10);

// Vrai si la date 'YYYY-MM-DD' tombe aujourd'hui (même jour + mois, année ignorée)
function isBirthdayToday(dateStr) {
  if (!dateStr) return false;
  const p = String(dateStr).split('-');
  if (p.length < 3) return false;
  const now = new Date();
  return Number(p[1]) === now.getMonth() + 1 && Number(p[2]) === now.getDate();
}
// Âge atteint aujourd'hui si l'année de naissance est connue
function ageToday(dateStr) {
  const y = Number(String(dateStr).split('-')[0]);
  if (!y || y < 1900) return null;
  return new Date().getFullYear() - y;
}

// Petite relance affichée à CHAQUE ouverture de l'appli : RDV du jour + choses à
// faire. Rendue dans le Layout (monté une seule fois par chargement), donc elle
// apparaît au lancement puis se masque dès qu'on l'a vue, jusqu'à la prochaine
// ouverture (rechargement de l'appli).
export default function DailyReminder() {
  const { events, todos, members, birthdays } = useFamily();
  const navigate = useNavigate();

  const day = todayIso();
  const dayEvents = events
    .filter((e) => e.date === day)
    .sort((a, b) => (a.time || '').localeCompare(b.time || ''));
  const dayTodos = todos.filter((t) => !isTaskDone(t) && (!t.due || t.due <= day));

  // Anniversaires du jour : membres de la famille + liste d'anniversaires
  const dayBirthdays = [
    ...members.filter((m) => isBirthdayToday(m.birthdate)).map((m) => ({ id: 'm-' + m.id, name: m.name, date: m.birthdate })),
    ...birthdays.filter((b) => isBirthdayToday(b.date)).map((b) => ({ id: 'b-' + b.id, name: b.name, date: b.date })),
  ];

  const hasContent = dayEvents.length > 0 || dayTodos.length > 0 || dayBirthdays.length > 0;

  // S'affiche au montage (= ouverture de l'appli) s'il y a quelque chose à rappeler.
  const [open, setOpen] = useState(hasContent);

  const dismiss = () => setOpen(false);

  const go = (to) => { dismiss(); navigate(to); };

  if (!open) return null;

  const dateLabel = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="fixed inset-0 bg-black/40 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={dismiss}>
      <div onClick={(e) => e.stopPropagation()} className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-5 space-y-4 max-h-[90vh] overflow-auto">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-xl font-extrabold flex items-center gap-2">
              <Bell size={20} className="text-brand-600" /> À ne pas oublier
            </h3>
            <p className="text-sm text-ink/50 capitalize">{dateLabel}</p>
          </div>
          <button onClick={dismiss} className="text-ink/40 hover:text-ink" aria-label="Fermer"><X /></button>
        </div>

        {dayBirthdays.length > 0 && (
          <div>
            <h4 className="font-bold text-sm text-ink/60 mb-2 flex items-center gap-1.5">
              <Cake size={16} className="text-brand-500" /> Anniversaire{dayBirthdays.length > 1 ? 's' : ''} du jour
            </h4>
            <ul className="space-y-2">
              {dayBirthdays.map((b) => {
                const age = ageToday(b.date);
                return (
                  <li key={b.id}>
                    <button onClick={() => go('/anniversaires')} className="w-full text-left bg-pink-50 rounded-2xl px-3 py-2.5 active:scale-[0.98] transition">
                      <span className="font-bold text-ink">🎂 {b.name}</span>
                      <span className="block text-xs text-ink/50 mt-0.5">
                        {age != null ? `${age} ans aujourd’hui — pense à souhaiter !` : 'C’est son anniversaire — pense à souhaiter !'}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {dayEvents.length > 0 && (
          <div>
            <h4 className="font-bold text-sm text-ink/60 mb-2 flex items-center gap-1.5">
              <CalendarClock size={16} className="text-brand-500" /> Rendez-vous du jour
            </h4>
            <ul className="space-y-2">
              {dayEvents.map((e) => (
                <li key={e.id}>
                  <button onClick={() => go('/agenda')} className="w-full text-left bg-brand-50 rounded-2xl px-3 py-2.5 active:scale-[0.98] transition">
                    <span className="font-bold text-ink">{e.title}</span>
                    {(e.time || e.location) && (
                      <span className="block text-xs text-ink/50 mt-0.5">
                        {e.time && `🕒 ${e.time}`}{e.time && e.location ? ' · ' : ''}{e.location && `📍 ${e.location}`}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {dayTodos.length > 0 && (
          <div>
            <h4 className="font-bold text-sm text-ink/60 mb-2 flex items-center gap-1.5">
              <CheckCircle2 size={16} className="text-brand-500" /> À faire
            </h4>
            <ul className="space-y-2">
              {dayTodos.slice(0, 8).map((t) => (
                <li key={t.id}>
                  <button onClick={() => go('/taches')} className="w-full text-left bg-black/[0.04] rounded-2xl px-3 py-2.5 active:scale-[0.98] transition flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-brand-500 shrink-0" />
                    <span className="font-semibold text-ink">{t.text}</span>
                  </button>
                </li>
              ))}
              {dayTodos.length > 8 && (
                <li className="text-xs text-ink/40 font-semibold px-1">+{dayTodos.length - 8} autre(s)…</li>
              )}
            </ul>
          </div>
        )}

        <button onClick={dismiss} className="btn-primary w-full">C’est noté 👍</button>
      </div>
    </div>
  );
}
