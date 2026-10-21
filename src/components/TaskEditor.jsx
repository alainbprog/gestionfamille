import { useState } from 'react';
import { X } from 'lucide-react';
import { useFamily, RECURRENCES, WEEK_DAYS } from '../context/FamilyContext';

const PRIORITIES = { haute: 'Priorité haute', normale: 'Priorité normale', basse: 'Priorité basse' };
const todayStr = () => new Date().toISOString().slice(0, 10);

// Modale d'édition d'une tâche / routine existante.
export default function TaskEditor({ todo, onClose }) {
  const { members, updateTodo } = useFamily();
  const [f, setF] = useState(() => ({
    text: todo.text || '',
    recurrence: todo.recurrence || 'none',
    day: todo.day || 'lundi',
    monthDay: todo.monthDay || '1',
    time: todo.time || '',
    priority: todo.priority || 'normale',
    memberId: todo.memberId || '',
  }));

  const needsDay = f.recurrence === 'hebdomadaire' || f.recurrence === 'quinzomadaire';
  const needsMonthDay = f.recurrence === 'mensuelle';
  const set = (patch) => setF((prev) => ({ ...prev, ...patch }));

  const save = (e) => {
    e.preventDefault();
    if (!f.text.trim()) return;
    const patch = {
      text: f.text.trim(),
      recurrence: f.recurrence,
      day: needsDay ? f.day : '',
      monthDay: needsMonthDay ? f.monthDay : '',
      time: f.time,
      priority: f.priority,
      memberId: f.memberId || null,
    };
    // Si la tâche devient récurrente et n'a pas d'ancre, on la cale sur aujourd'hui
    if (f.recurrence !== 'none' && !todo.start) patch.start = todayStr();
    updateTodo(todo.id, patch);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={save} className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-5 space-y-3 max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-extrabold">Modifier</h3>
          <button type="button" onClick={onClose} className="text-ink/40 hover:text-ink"><X /></button>
        </div>

        <input autoFocus className="input" placeholder="Intitulé…" value={f.text} onChange={(e) => set({ text: e.target.value })} />

        <div className="flex flex-col sm:flex-row gap-2">
          <select className="input sm:flex-1" value={f.recurrence} onChange={(e) => set({ recurrence: e.target.value })} aria-label="Cadence">
            {Object.entries(RECURRENCES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          {needsDay && (
            <select className="input sm:w-36" value={f.day} onChange={(e) => set({ day: e.target.value })} aria-label="Jour de la semaine">
              {WEEK_DAYS.map((d) => <option key={d.key} value={d.key}>{d.label}</option>)}
            </select>
          )}
          {needsMonthDay && (
            <select className="input sm:w-32" value={f.monthDay} onChange={(e) => set({ monthDay: e.target.value })} aria-label="Jour du mois">
              {Array.from({ length: 31 }, (_, i) => String(i + 1)).map((n) => <option key={n} value={n}>le {n}</option>)}
            </select>
          )}
          <input type="time" className="input sm:w-32" value={f.time} onChange={(e) => set({ time: e.target.value })} aria-label="Heure" title="Heure (optionnel)" />
        </div>

        {f.recurrence !== 'none' && (
          <p className="text-xs text-ink/50">⏰ Classée dans <b>Routines</b>. Le décompte repart de la date du jour si besoin.</p>
        )}

        <div className="flex flex-col sm:flex-row gap-2">
          <select className="input sm:flex-1" value={f.memberId} onChange={(e) => set({ memberId: e.target.value })}>
            <option value="">Pour qui ? (optionnel)</option>
            {members.map((m) => <option key={m.id} value={m.id}>{m.emoji} {m.name}</option>)}
          </select>
          <select className="input sm:w-44" value={f.priority} onChange={(e) => set({ priority: e.target.value })} aria-label="Priorité">
            {Object.entries(PRIORITIES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>

        <button type="submit" className="btn-primary w-full">Enregistrer</button>
      </form>
    </div>
  );
}
