import { useRef, useState } from 'react';
import { Mic, Loader2, X, Check, AlertCircle } from 'lucide-react';
import { useFamily } from '../context/FamilyContext';

const todayIso = () => new Date().toISOString().slice(0, 10);

const TYPE_META = {
  tache: { emoji: '✅', label: 'Tâche' },
  rendezvous: { emoji: '📅', label: 'Rendez-vous' },
  course: { emoji: '🛒', label: 'Courses' },
  anniversaire: { emoji: '🎂', label: 'Anniversaire' },
  note: { emoji: '📝', label: 'Note' },
};

export default function VoiceCommand() {
  const { addTodo, addEvent, addShopping, addBirthday, addNote } = useFamily();
  const [status, setStatus] = useState('idle'); // idle | listening | processing | done | error
  const [msg, setMsg] = useState('');
  const [added, setAdded] = useState([]);
  const recRef = useRef(null);
  const timerRef = useRef(null);

  const speechOK = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);

  const reset = () => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => { setStatus('idle'); setMsg(''); setAdded([]); }, 6000);
  };

  const applyActions = (actions) => {
    const done = [];
    (actions || []).forEach((a) => {
      const meta = TYPE_META[a.type];
      if (!meta || !a.texte) return;
      if (a.type === 'tache') {
        addTodo({ text: a.texte, due: a.date || '', priority: a.priorite || 'normale' });
        done.push({ ...meta, detail: a.texte + (a.date ? ` · ${a.date}` : '') });
      } else if (a.type === 'rendezvous') {
        addEvent({ title: a.texte, date: a.date || todayIso(), time: a.heure || '', location: a.lieu || '' });
        done.push({ ...meta, detail: `${a.texte}${a.date ? ` · ${a.date}` : ''}${a.heure ? ` ${a.heure}` : ''}` });
      } else if (a.type === 'course') {
        addShopping({ name: a.texte, qty: a.quantite && a.quantite > 0 ? a.quantite : 1 });
        done.push({ ...meta, detail: a.texte + (a.quantite > 1 ? ` ×${a.quantite}` : '') });
      } else if (a.type === 'anniversaire') {
        addBirthday({ name: a.texte, date: a.date || '' });
        done.push({ ...meta, detail: a.texte + (a.date ? ` · ${a.date}` : '') });
      } else if (a.type === 'note') {
        addNote(a.texte);
        done.push({ ...meta, detail: a.texte });
      }
    });
    return done;
  };

  const handleTranscript = async (texte) => {
    setStatus('processing');
    setMsg(`« ${texte} »`);
    try {
      const res = await fetch('/.netlify/functions/commande', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ texte, date: todayIso() }),
      });
      const data = await res.json();
      if (!res.ok || data.erreur) {
        setStatus('error');
        setMsg(data.erreur === 'cle_manquante'
          ? "L'assistant vocal n'est pas encore configuré (clé IA manquante)."
          : "Je n'ai pas réussi à traiter la demande. Réessaie.");
        reset();
        return;
      }
      const done = applyActions(data.actions);
      if (done.length) {
        setStatus('done');
        setAdded(done);
        setMsg('');
      } else {
        setStatus('error');
        setMsg(data.resume || "Je n'ai pas compris quoi ajouter. Essaie : « ajoute du lait aux courses ».");
      }
    } catch {
      setStatus('error');
      setMsg('Connexion impossible. Réessaie quand tu es en ligne.');
    }
    reset();
  };

  const start = () => {
    if (!speechOK) { setStatus('error'); setMsg("La dictée vocale n'est pas disponible sur ce navigateur (essaie Chrome / Android)."); reset(); return; }
    if (status === 'listening') { recRef.current?.stop(); return; }
    clearTimeout(timerRef.current);
    const Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new Rec();
    rec.lang = 'fr-FR';
    rec.continuous = false;
    rec.interimResults = false;
    rec.onresult = (ev) => {
      const texte = Array.from(ev.results).map((r) => r[0].transcript).join(' ').trim();
      if (texte) handleTranscript(texte);
      else { setStatus('idle'); }
    };
    rec.onerror = () => { setStatus('error'); setMsg('Micro indisponible ou refusé.'); reset(); };
    rec.onend = () => { setStatus((s) => (s === 'listening' ? 'idle' : s)); };
    recRef.current = rec;
    setStatus('listening');
    setMsg('');
    setAdded([]);
    try { rec.start(); } catch { setStatus('idle'); }
  };

  const panelOpen = status !== 'idle';

  return (
    <>
      {/* Panneau de retour (écoute / traitement / résultat) */}
      {panelOpen && (
        <div className="fixed bottom-24 right-4 left-4 sm:left-auto sm:w-80 z-[65]">
          <div className="card p-4 shadow-lg">
            <div className="flex items-start gap-3">
              <div className="shrink-0 mt-0.5">
                {status === 'listening' && <Mic className="text-red-500 animate-pulse" size={22} />}
                {status === 'processing' && <Loader2 className="text-brand-600 animate-spin" size={22} />}
                {status === 'done' && <Check className="text-green-600" size={22} />}
                {status === 'error' && <AlertCircle className="text-amber-500" size={22} />}
              </div>
              <div className="min-w-0 flex-1">
                {status === 'listening' && <p className="font-bold text-ink">J’écoute… dis ce que tu veux ajouter</p>}
                {status === 'processing' && <p className="font-bold text-ink">Je range ça…</p>}
                {status === 'done' && <p className="font-bold text-ink">Ajouté ✅</p>}
                {status === 'error' && <p className="font-bold text-ink">Oups</p>}
                {msg && <p className="text-sm text-ink/60 mt-0.5 break-words">{msg}</p>}
                {added.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {added.map((a, i) => (
                      <li key={i} className="text-sm text-ink/80">
                        <span className="font-semibold">{a.emoji} {a.label} :</span> {a.detail}
                      </li>
                    ))}
                  </ul>
                )}
                {status === 'listening' && (
                  <p className="text-xs text-ink/40 mt-1">Ex. « rendez-vous dentiste demain 14h », « ajoute du lait aux courses »</p>
                )}
              </div>
              <button onClick={() => { clearTimeout(timerRef.current); setStatus('idle'); setMsg(''); setAdded([]); }} className="text-ink/30 hover:text-ink shrink-0" aria-label="Fermer"><X size={18} /></button>
            </div>
          </div>
        </div>
      )}

      {/* Bouton micro flottant */}
      <button
        onClick={start}
        className={`fixed bottom-5 right-4 z-[65] w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white active:scale-95 transition ${status === 'listening' ? 'bg-red-500 animate-pulse' : 'bg-brand-600 hover:bg-brand-700'}`}
        aria-label="Commande vocale"
      >
        {status === 'processing' ? <Loader2 size={24} className="animate-spin" /> : <Mic size={24} />}
      </button>
    </>
  );
}
