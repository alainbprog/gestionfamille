import { useState } from 'react';
import { Plus, Trash2, AlarmClock, Check, Repeat } from 'lucide-react';
import { useFamily, isTaskDone, RECURRENCES } from '../context/FamilyContext';
import { Avatar } from '../components/MemberBadge';

// Une routine = une tâche récurrente (quotidienne ou hebdomadaire)
export default function Routines() {
  const { todos, members, addTodo, toggleTodo, removeTodo, memberById } = useFamily();
  const [text, setText] = useState('');
  const [recurrence, setRecurrence] = useState('quotidienne');
  const [memberId, setMemberId] = useState('');

  const routines = todos.filter((t) => t.recurrence && t.recurrence !== 'none');

  const submit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    addTodo({ text: text.trim(), recurrence, memberId: memberId || null });
    setText('');
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
          <select className="input sm:w-44" value={recurrence} onChange={(e) => setRecurrence(e.target.value)}>
            <option value="quotidienne">{RECURRENCES.quotidienne}</option>
            <option value="hebdomadaire">{RECURRENCES.hebdomadaire}</option>
          </select>
          <select className="input sm:flex-1" value={memberId} onChange={(e) => setMemberId(e.target.value)}>
            <option value="">Pour qui ? (optionnel)</option>
            {members.map((m) => <option key={m.id} value={m.id}>{m.emoji} {m.name}</option>)}
          </select>
          <button type="submit" className="btn-primary"><Plus size={18} /></button>
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
            return (
              <li key={t.id} className={`card p-3.5 flex items-center gap-3 ${done ? 'opacity-70' : ''}`}>
                <button
                  onClick={() => toggleTodo(t.id)}
                  className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center transition ${done ? 'bg-brand-600 text-white' : 'border-2 border-black/20 hover:border-brand-500'}`}
                  aria-label="Cocher"
                >
                  {done && <Check size={15} />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold ${done ? 'line-through text-ink/40' : ''}`}>{t.text}</p>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 inline-flex items-center gap-1 mt-0.5">
                    <Repeat size={11} /> {RECURRENCES[t.recurrence]}
                  </span>
                </div>
                {t.memberId && <Avatar member={memberById(t.memberId)} size={28} />}
                <button onClick={() => removeTodo(t.id)} className="text-ink/30 hover:text-red-500 transition shrink-0" aria-label="Supprimer"><Trash2 size={18} /></button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
