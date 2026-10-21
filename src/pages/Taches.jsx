import { useState } from 'react';
import { Plus, Trash2, ListTodo, Check, Repeat, Clock, Pencil } from 'lucide-react';
import { useFamily, isTaskDone, RECURRENCES, WEEK_DAYS, nextDueInfo } from '../context/FamilyContext';
import { Avatar } from '../components/MemberBadge';
import TaskEditor from '../components/TaskEditor';

const fmtShort = (d) => d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
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
  if (countdown < 0) return { text: `⚠️ En retard de ${-countdown} j`, cls: 'bg-red-100 text-red-700' };
  if (countdown === 1) return { text: `Demain (${date})`, cls: 'bg-brand-100 text-brand-700' };
  return { text: `Dans ${countdown} jours (${date})`, cls: 'bg-brand-50 text-brand-700' };
}

const PRIORITIES = {
  haute: { label: 'Haute', color: 'bg-red-100 text-red-700' },
  normale: { label: 'Normale', color: 'bg-blue-100 text-blue-700' },
  basse: { label: 'Basse', color: 'bg-gray-100 text-gray-600' },
};

const dayLabel = (key) => WEEK_DAYS.find((d) => d.key === key)?.label;

// Résumé de la cadence/planning d'une tâche (ex. « Chaque semaine · Mardi · 🕒 08:00 »)
function planLabel(t) {
  const parts = [];
  if (t.recurrence && t.recurrence !== 'none') parts.push(RECURRENCES[t.recurrence]);
  if (t.day) parts.push(dayLabel(t.day));
  if (t.monthDay) parts.push(`le ${t.monthDay}`);
  return parts.join(' · ');
}

export default function Taches() {
  const { todos, members, addTodo, toggleTodo, removeTodo, memberById } = useFamily();
  const [text, setText] = useState('');
  const [memberId, setMemberId] = useState('');
  const [priority, setPriority] = useState('normale');
  const [recurrence, setRecurrence] = useState('none');
  const [day, setDay] = useState('lundi');
  const [monthDay, setMonthDay] = useState('1');
  const [time, setTime] = useState('');
  const [filter, setFilter] = useState('all'); // all | mine-by-member id
  const [editing, setEditing] = useState(null);
  const [movedMsg, setMovedMsg] = useState(false);

  const needsWeekday = recurrence === 'hebdomadaire' || recurrence === 'quinzomadaire';
  const needsMonthDay = recurrence === 'mensuelle';

  const submit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    addTodo({
      text: text.trim(),
      memberId: memberId || null,
      priority,
      recurrence,
      day: needsWeekday ? day : '',
      monthDay: needsMonthDay ? monthDay : '',
      time,
    });
    setText('');
    setTime('');
    if (recurrence !== 'none') { setMovedMsg(true); setTimeout(() => setMovedMsg(false), 4000); }
    setRecurrence('none');
  };

  const priorityRank = { haute: 0, normale: 1, basse: 2 };
  // Tâches = ponctuelles uniquement ; les récurrentes vivent dans Routines
  const visible = todos.filter((t) => (!t.recurrence || t.recurrence === 'none') && (filter === 'all' || t.memberId === filter));
  const pending = visible.filter((t) => !isTaskDone(t)).sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority]);
  const done = visible.filter((t) => isTaskDone(t));

  return (
    <div>
      <header className="mb-5">
        <h1 className="text-2xl font-extrabold flex items-center gap-2">
          <ListTodo className="text-brand-600" /> Tâches
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {pending.length} tâche{pending.length > 1 ? 's' : ''} à faire
        </p>
      </header>

      <form onSubmit={submit} className="card p-4 mb-5 space-y-2">
        <input className="input" placeholder="Nouvelle tâche…" value={text} onChange={(e) => setText(e.target.value)} />
        <div className="flex flex-col sm:flex-row gap-2">
          <select className="input sm:flex-1" value={memberId} onChange={(e) => setMemberId(e.target.value)}>
            <option value="">Assigner à… (optionnel)</option>
            {members.map((m) => <option key={m.id} value={m.id}>{m.emoji} {m.name}</option>)}
          </select>
          <select className="input sm:w-40" value={priority} onChange={(e) => setPriority(e.target.value)}>
            {Object.entries(PRIORITIES).map(([k, v]) => <option key={k} value={k}>Priorité {v.label.toLowerCase()}</option>)}
          </select>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <select className="input sm:flex-1" value={recurrence} onChange={(e) => setRecurrence(e.target.value)} aria-label="Cadence">
            {Object.entries(RECURRENCES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          {needsWeekday && (
            <select className="input sm:w-36" value={day} onChange={(e) => setDay(e.target.value)} aria-label="Jour de la semaine">
              {WEEK_DAYS.map((d) => <option key={d.key} value={d.key}>{d.label}</option>)}
            </select>
          )}
          {needsMonthDay && (
            <select className="input sm:w-36" value={monthDay} onChange={(e) => setMonthDay(e.target.value)} aria-label="Jour du mois">
              {Array.from({ length: 31 }, (_, i) => String(i + 1)).map((n) => <option key={n} value={n}>le {n}</option>)}
            </select>
          )}
          <input type="time" className="input sm:w-32" value={time} onChange={(e) => setTime(e.target.value)} aria-label="Heure" title="Heure (optionnel)" />
        </div>
        <button type="submit" className="btn-primary w-full sm:w-auto"><Plus size={18} /> Ajouter</button>
      </form>

      {movedMsg && (
        <div className="mb-4 p-3 rounded-xl text-sm font-semibold bg-brand-50 text-brand-700">
          ⏰ Tâche récurrente → ajoutée dans <b>Routines</b>.
        </div>
      )}

      {/* Filtres par membre */}
      {members.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          <button onClick={() => setFilter('all')} className={`px-3 py-1.5 rounded-full text-sm font-bold transition ${filter === 'all' ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Tous</button>
          {members.map((m) => (
            <button key={m.id} onClick={() => setFilter(m.id)} className={`px-3 py-1.5 rounded-full text-sm font-bold transition flex items-center gap-1 ${filter === m.id ? 'text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`} style={filter === m.id ? { backgroundColor: m.color } : undefined}>
              {m.emoji} {m.name}
            </button>
          ))}
        </div>
      )}

      {pending.length === 0 && done.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <ListTodo size={48} className="mx-auto mb-3 opacity-40" />
          <p className="font-semibold">Rien à faire ici</p>
          <p className="text-sm">Ajoutez une tâche pour la famille.</p>
        </div>
      )}

      <ul className="space-y-2">
        {pending.map((t) => (
          <li key={t.id} className="card p-3.5 flex items-center gap-3">
            <button onClick={() => toggleTodo(t.id)} className="w-6 h-6 rounded-full border-2 border-gray-300 hover:border-brand-500 shrink-0 transition" aria-label="Terminer" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold">{t.text}</p>
              <div className="flex flex-wrap items-center gap-2 mt-0.5">
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${PRIORITIES[t.priority].color}`}>{PRIORITIES[t.priority].label}</span>
                {t.recurrence && t.recurrence !== 'none' && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 inline-flex items-center gap-1">
                    <Repeat size={11} /> {planLabel(t)}
                  </span>
                )}
                {t.time && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 inline-flex items-center gap-1">
                    <Clock size={11} /> {t.time}
                  </span>
                )}
                {(() => { const cd = countdownOf(t); return cd ? <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${cd.cls}`}>{cd.text}</span> : null; })()}
              </div>
            </div>
            {t.memberId && <Avatar member={memberById(t.memberId)} size={30} />}
            <button onClick={() => setEditing(t)} className="text-gray-300 hover:text-brand-600 transition shrink-0" aria-label="Modifier"><Pencil size={17} /></button>
            <button onClick={() => removeTodo(t.id)} className="text-gray-300 hover:text-red-500 transition shrink-0" aria-label="Supprimer"><Trash2 size={18} /></button>
          </li>
        ))}
      </ul>

      {done.length > 0 && (
        <section className="mt-8">
          <h2 className="text-sm font-extrabold text-gray-400 uppercase tracking-wide mb-2">Terminées ({done.length})</h2>
          <ul className="space-y-2">
            {done.map((t) => (
              <li key={t.id} className="card p-3.5 flex items-center gap-3 opacity-70">
                <button onClick={() => toggleTodo(t.id)} className="w-6 h-6 rounded-full bg-brand-600 text-white flex items-center justify-center shrink-0" aria-label="Rouvrir"><Check size={15} /></button>
                <span className="flex-1 line-through text-gray-400">{t.text}</span>
                <button onClick={() => removeTodo(t.id)} className="text-gray-300 hover:text-red-500 transition shrink-0" aria-label="Supprimer"><Trash2 size={18} /></button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {editing && <TaskEditor todo={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}
