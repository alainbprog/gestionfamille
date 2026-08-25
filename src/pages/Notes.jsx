import { useState } from 'react';
import { Plus, Trash2, StickyNote } from 'lucide-react';
import { useFamily } from '../context/FamilyContext';

export default function Notes() {
  const { notes, addNote, removeNote } = useFamily();
  const [text, setText] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    addNote(text.trim());
    setText('');
  };

  return (
    <div>
      <h1 className="text-2xl font-extrabold flex items-center gap-2 mb-4">
        <StickyNote className="text-brand-600" /> Notes
      </h1>

      <form onSubmit={submit} className="flex gap-2 mb-5">
        <input className="input flex-1" placeholder="Écrire une note…" value={text} onChange={(e) => setText(e.target.value)} />
        <button type="submit" className="btn-primary"><Plus size={18} /></button>
      </form>

      {notes.length === 0 ? (
        <div className="text-center py-16 text-ink/40">
          <StickyNote size={44} className="mx-auto mb-3 opacity-40" />
          <p className="font-semibold">Aucune note</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {notes.map((n) => (
            <li key={n.id} className="card p-4 flex items-start gap-3">
              <p className="flex-1 whitespace-pre-wrap">{n.text}</p>
              <button onClick={() => removeNote(n.id)} className="text-ink/30 hover:text-red-500 transition shrink-0" aria-label="Supprimer"><Trash2 size={18} /></button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
