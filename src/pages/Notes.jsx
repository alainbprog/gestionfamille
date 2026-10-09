import { useState } from 'react';
import { Plus, Trash2, StickyNote, PenLine } from 'lucide-react';
import { useFamily } from '../context/FamilyContext';
import HandwritingPad from '../components/HandwritingPad';

export default function Notes() {
  const { notes, addNote, removeNote } = useFamily();
  const [text, setText] = useState('');
  const [pad, setPad] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    addNote(text.trim());
    setText('');
  };

  const saveDrawing = (dataURL) => {
    addNote({ drawing: dataURL });
    setPad(false);
  };

  return (
    <div>
      <h1 className="text-2xl font-extrabold flex items-center gap-2 mb-4">
        <StickyNote className="text-brand-600" /> Notes
      </h1>

      <form onSubmit={submit} className="flex gap-2 mb-3">
        <input className="input flex-1" placeholder="Écrire une note…" value={text} onChange={(e) => setText(e.target.value)} />
        <button type="submit" className="btn-primary"><Plus size={18} /></button>
      </form>

      {!pad && (
        <button onClick={() => setPad(true)} className="btn-ghost w-full mb-5">
          <PenLine size={18} /> Écrire à la main
        </button>
      )}
      {pad && <HandwritingPad onSave={saveDrawing} onCancel={() => setPad(false)} />}

      {notes.length === 0 ? (
        <div className="text-center py-16 text-ink/40">
          <StickyNote size={44} className="mx-auto mb-3 opacity-40" />
          <p className="font-semibold">Aucune note</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {notes.map((n) => (
            <li key={n.id} className="card p-4 flex items-start gap-3">
              <div className="flex-1 min-w-0">
                {n.drawing
                  ? <img src={n.drawing} alt="Note manuscrite" className="w-full rounded-xl border border-black/5" />
                  : <p className="whitespace-pre-wrap">{n.text}</p>}
              </div>
              <button onClick={() => removeNote(n.id)} className="text-ink/30 hover:text-red-500 transition shrink-0" aria-label="Supprimer"><Trash2 size={18} /></button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
