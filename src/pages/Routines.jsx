import { useState } from 'react';
import { Plus, Trash2, AlarmClock, Check, Repeat, Clock, Pencil } from 'lucide-react';
import { useFamily, isTaskDone, RECURRENCES, WEEK_DAYS, nextDueInfo } from '../context/FamilyContext';
import { Avatar } from '../components/MemberBadge';
import TaskEditor from '../components/TaskEditor';

const dayLabel = (key) => WEEK_DAYS.find((d) => d.key === key)?.label;
const todayStr = () => new Date().toISOString().slice(0, 10);
const fmtShort = (d) => d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });

// Décompte jusqu'à la prochaine échéance, prêt à afficher
function countdownOf(t) {
  const info = nextDueInfo(t);
  if (!info) return null;
  const { target, countdown, done } = info;
  const date = fmtShort(target);
  if (done) {
    if (countdown <= 0) return { text: 'Fait ✓ · prochaine aujourd’hui', cls: 'bg-emerald-50 text-emerald-700' };
    if (countdown === 1) return { text: `Fait ✓ · prochaine demain (${date})`, cls: 'bg-emerald-50 text-emerald-700' };
    return { text: `Fait ✓ · prochaine dans ${countdown} j (${date})`, cls: 'bg-emerald-50 text-emerald-700' };
  }
  if (countdown === 0) return { text: '⏰ C’est aujourd’hui !', cls: 'bg-amber-100 text-amber-800' };
  if (countdown < 0) return { text: `⚠️ En retard de ${-countdown} j (depuis ${date})`, cls: 'bg-red-100 text-red-700' };
  if (countdown === 1) return { text: `Demain (${date})`, cls: 'bg-brand-100 text-brand-700' };
  return { text: `Dans ${countdown} jours (${date})`, cls: 'bg-brand-50 text-brand-700' };
}

// Une routine = une tâche récurrente (chaque jour, chaque semaine, tous les 15 jours, 1 fois/mois)
export default function Routines() {
  const { todos, members, addTodo, toggleTodo, removeTodo, memberById } = useFamily();
  const [text, setText] = useState('');
  const [recurrence, setRecurrence] = useState('quotidienne');
  const [day, setDay] = useState('lundi');
  const [monthDay, setMonthDay] = useState('1');
  const [time, setTime] = useState('');
  const [start, setStart] = useState(todayStr());
  const [memberId, setMemberId] = useState('');
  const [editing, setEditing] = useState(null);

  const needsDay = recurrence === 'hebdomadaire' || recurrence === 'quinzomadaire';
  const needsMonthDay = recurrence === 'mensuelle';
  const showStart = recurrence !== 'quotidienne'; // la date de départ cale le cycle
  const routines = todos.filter((t) => t.recurrence && t.recurrence !== 'none');

  const submit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    addTodo({
      text: text.trim(),
      recurrence,
      day: needsDay ? day : '',
      monthDay: needsMonthDay ? monthDay : '',
      time,
      start: start || todayStr(),
      memberId: memberId || null,
    });
    setText('');
    setTime('');
    setStart(todayStr());
  };

  return (
    <div>
      <h1 className="text-2xl font-extrabold flex items-center gap-2 mb-1">
        <AlarmClock className="text-brand-600" /> Routines
      </h1>
      <p className="text-ink/50 text-sm mb-4">Les habitudes qui reviennent chaque jour ou chaque semaine.</p>

      <form onSubmit={submit} className="card p-4 mb-5 space-y-2">
        <input className="input" placeholder="Nouvelle routine (ex. Sortir les poubelles)" value={text} onChange={(e) => setText(e.target.value)} />
        <div className="flex flex-col sm:flex-row gap-2">
          <select className="input sm:w-44" value={recurrence} onChange={(e) => setRecurrence(e.target.value)} aria-label="Cadence">
            <option value="quotidienne">{RECURRENCES.quotidienne}</option>
            <option value="hebdomadaire">{RECURRENCES.hebdomadaire}</option>
            <option value="quinzomadaire">{RECURRENCES.quinzomadaire}</option>
            <option value="mensuelle">{RECURRENCES.mensuelle}</option>
          </select>
          {needsDay && (
            <select className="input sm:w-36" value={day} onChange={(e) => setDay(e.target.value)} aria-label="Jour de la semaine">
              {WEEK_DAYS.map((d) => <option key={d.key} value={d.key}>{d.label}</option>)}
            </select>
          )}
          {needsMonthDay && (
            <select className="input sm:w-32" value={monthDay} onChange={(e) => setMonthDay(e.target.value)} aria-label="Jour du mois">
              {Array.from({ length: 31 }, (_, i) => String(i + 1)).map((n) => <option key={n} value={n}>le {n}</option>)}
            </select>
          )}
          <input type="time" className="input sm:w-32" value={time} onChange={(e) => setTime(e.target.value)} aria-label="Heure" title="Heure (optionnel)" />
        </div>
        {showStart && (
          <label className="flex items-center gap-2 text-sm text-ink/60 font-semibold">
            <span className="shrink-0">Démarre le</span>
            <input type="date" className="input" value={start} onChange={(e) => setStart(e.target.value)} aria-label="Date de départ" />
          </label>
        )}
        <div className="flex flex-col sm:flex-row gap-2">
          <select className="input sm:flex-1" value={memberId} onChange={(e) => setMemberId(e.target.value)}>
            <option value="">Pour qui ? (optionnel)</option>
            {members.map((m) => <option key={m.id} value={m.id}>{m.emoji} {m.name}</option>)}
          </select>
          <button type="submit" className="btn-primary"><Plus size={18} /> Ajouter</button>
        </div>
      </form>

      {routines.length === 0 ? (
        <div className="text-center py-16 text-ink/40">
          <AlarmClock size={44} className="mx-auto mb-3 opacity-40" />
          <p className="font-semibold">Aucune routine</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {routines.map((t) => {
            const done = isTaskDone(t);
            const cd = countdownOf(t);
            return (
              <li key={t.id} className={`card p-3.5 flex items-center gap-3 ${done ? 'opacity-80' : ''}`}>
                <button
                  onClick={() => toggleTodo(t.id)}
                  className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center transition ${done ? 'bg-brand-600 text-white' : 'border-2 border-black/20 hover:border-brand-500'}`}
                  aria-label="Cocher"
                >
                  {done && <Check size={15} />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold ${done ? 'line-through text-ink/40' : ''}`}>{t.text}</p>
                  <span className="inline-flex flex-wrap items-center gap-1.5 mt-0.5">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 inline-flex items-center gap-1">
                      <Repeat size={11} /> {RECURRENCES[t.recurrence]}{t.day ? ` · ${dayLabel(t.day)}` : ''}{t.monthDay ? ` · le ${t.monthDay}` : ''}
                    </span>
                    {t.time && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 inline-flex items-center gap-1">
                        <Clock size={11} /> {t.time}
                      </span>
                    )}
                  </span>
                  {cd && (
                    <span className={`block w-fit text-[11px] font-bold px-2 py-0.5 rounded-full mt-1 ${cd.cls}`}>{cd.text}</span>
                  )}
                </div>
                {t.memberId && <Avatar member={memberById(t.memberId)} size={28} />}
                <button onClick={() => setEditing(t)} className="text-ink/30 hover:text-brand-600 transition shrink-0" aria-label="Modifier"><Pencil size={17} /></button>
                <button onClick={() => removeTodo(t.id)} className="text-ink/30 hover:text-red-500 transition shrink-0" aria-label="Supprimer"><Trash2 size={18} /></button>
              </li>
            );
          })}
        </ul>
      )}

      {editing && <TaskEditor todo={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}
