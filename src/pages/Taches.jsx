import { useState } from 'react';
import { Plus, Trash2, ListTodo, Check } from 'lucide-react';
import { useFamily } from '../context/FamilyContext';
import { Avatar } from '../components/MemberBadge';

const PRIORITIES = {
  haute: { label: 'Haute', color: 'bg-red-100 text-red-700' },
  normale: { label: 'Normale', color: 'bg-blue-100 text-blue-700' },
  basse: { label: 'Basse', color: 'bg-gray-100 text-gray-600' },
};

export default function Taches() {
  const { todos, members, addTodo, toggleTodo, removeTodo, memberById } = useFamily();
  const [text, setText] = useState('');
  const [memberId, setMemberId] = useState('');
  const [priority, setPriority] = useState('normale');
  const [filter, setFilter] = useState('all'); // all | mine-by-member id

  const submit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    addTodo({ text: text.trim(), memberId: memberId || null, priority });
    setText('');
  };

  const priorityRank = { haute: 0, normale: 1, basse: 2 };
  const visible = todos.filter((t) => filter === 'all' || t.memberId === filter);
  const pending = visible.filter((t) => !t.done).sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority]);
  const done = visible.filter((t) => t.done);

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

      <form onSubmit={submit} className="card p-4 mb-5">
        <input className="input mb-2" placeholder="Nouvelle tâche…" value={text} onChange={(e) => setText(e.target.value)} />
        <div className="flex flex-col sm:flex-row gap-2">
          <select className="input sm:flex-1" value={memberId} onChange={(e) => setMemberId(e.target.value)}>
            <option value="">Assigner à… (optionnel)</option>
            {members.map((m) => <option key={m.id} value={m.id}>{m.emoji} {m.name}</option>)}
          </select>
          <select className="input sm:w-40" value={priority} onChange={(e) => setPriority(e.target.value)}>
            {Object.entries(PRIORITIES).map(([k, v]) => <option key={k} value={k}>Priorité {v.label.toLowerCase()}</option>)}
          </select>
          <button type="submit" className="btn-primary"><Plus size={18} /> Ajouter</button>
        </div>
      </form>

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
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${PRIORITIES[t.priority].color}`}>{PRIORITIES[t.priority].label}</span>
              </div>
            </div>
            {t.memberId && <Avatar member={memberById(t.memberId)} size={30} />}
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
    </div>
  );
}
