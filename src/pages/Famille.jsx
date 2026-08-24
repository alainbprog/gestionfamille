import { useState } from 'react';
import { Plus, Trash2, Users, X, Cake, RotateCcw, Cloud, CloudOff, RefreshCw, Check as CheckIcon } from 'lucide-react';
import { useFamily, MEMBER_COLORS } from '../context/FamilyContext';
import { Avatar } from '../components/MemberBadge';

const EMOJIS = ['🧒', '👦', '👧', '👶', '👩', '👨', '👵', '👴', '🐶', '🐱'];

function ageFrom(birthdate) {
  if (!birthdate) return null;
  const b = new Date(birthdate + 'T00:00:00');
  const now = new Date();
  let age = now.getFullYear() - b.getFullYear();
  const m = now.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age--;
  return age;
}

const emptyForm = { name: '', role: 'Enfant', emoji: '🧒', color: MEMBER_COLORS[3], birthdate: '' };

export default function Famille() {
  const { members, todos, events, addMember, removeMember, resetData, sync, connectSync, disconnectSync } = useFamily();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [codeInput, setCodeInput] = useState('');
  const [syncMsg, setSyncMsg] = useState('');

  const handleConnect = async (e) => {
    e.preventDefault();
    setSyncMsg('');
    const res = await connectSync(codeInput);
    if (!res.ok && res.error) setSyncMsg(res.error);
    setCodeInput('');
  };

  const SYNC_STATUS = {
    idle: { label: 'Inactif', color: 'text-gray-400', Icon: CloudOff },
    connecting: { label: 'Connexion…', color: 'text-amber-500', Icon: RefreshCw },
    synced: { label: 'Synchronisé', color: 'text-emerald-600', Icon: CheckIcon },
    offline: { label: 'Hors ligne', color: 'text-red-500', Icon: CloudOff },
  };
  const st = SYNC_STATUS[sync.status] || SYNC_STATUS.idle;

  const submit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    addMember({ ...form, name: form.name.trim() });
    setForm(emptyForm);
    setOpen(false);
  };

  const statsFor = (id) => ({
    todos: todos.filter((t) => t.memberId === id && !t.done).length,
    events: events.filter((e) => e.memberId === id && e.date >= new Date().toISOString().slice(0, 10)).length,
  });

  return (
    <div>
      <header className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold flex items-center gap-2">
            <Users className="text-brand-600" /> Ma famille
          </h1>
          <p className="text-gray-500 text-sm mt-1">{members.length} membre{members.length > 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setOpen(true)} className="btn-primary"><Plus size={18} /> <span className="hidden sm:inline">Ajouter</span></button>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {members.map((m) => {
          const s = statsFor(m.id);
          const age = ageFrom(m.birthdate);
          return (
            <div key={m.id} className="card p-4 flex items-center gap-4">
              <Avatar member={m} size={56} />
              <div className="flex-1 min-w-0">
                <p className="font-extrabold text-lg leading-tight">{m.name}</p>
                <p className="text-sm text-gray-500">
                  {m.role}{age !== null && ` · ${age} ans`}
                </p>
                <div className="flex gap-3 mt-1 text-xs text-gray-400 font-semibold">
                  <span>{s.todos} tâche{s.todos > 1 ? 's' : ''}</span>
                  <span>{s.events} RDV</span>
                  {m.birthdate && <span className="inline-flex items-center gap-1"><Cake size={12} /> {new Date(m.birthdate + 'T00:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>}
                </div>
              </div>
              <button onClick={() => { if (confirm(`Retirer ${m.name} de la famille ?`)) removeMember(m.id); }} className="text-gray-300 hover:text-red-500 transition shrink-0" aria-label="Retirer">
                <Trash2 size={18} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Partage entre appareils */}
      <section className="mt-10 border-t border-gray-100 pt-6">
        <h2 className="text-sm font-extrabold text-gray-500 mb-1 flex items-center gap-2">
          <Cloud size={16} /> Partage entre appareils
        </h2>
        <p className="text-sm text-gray-400 mb-3">
          Choisissez un <b>code famille</b> secret et saisissez-le sur chaque téléphone ou ordinateur : tous les appareils partageant ce code voient les mêmes données (courses, agenda, tâches, menus, membres).
        </p>

        {!sync.enabled ? (
          <form onSubmit={handleConnect} className="flex flex-col sm:flex-row gap-2 max-w-md">
            <input
              className="input flex-1"
              placeholder="Code famille (ex. maison-dupont-42)"
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value)}
            />
            <button type="submit" className="btn-primary"><Cloud size={18} /> Activer</button>
          </form>
        ) : (
          <div className="card p-4 flex flex-wrap items-center gap-3 max-w-md">
            <st.Icon size={22} className={`${st.color} ${sync.status === 'connecting' ? 'animate-spin' : ''}`} />
            <div className="flex-1 min-w-0">
              <p className="font-bold leading-tight">Code : <span className="font-mono text-brand-700">{sync.code}</span></p>
              <p className={`text-sm font-semibold ${st.color}`}>{st.label}</p>
            </div>
            <button onClick={disconnectSync} className="btn-ghost">Désactiver</button>
          </div>
        )}

        {syncMsg && <p className="text-sm text-amber-600 mt-2 max-w-md">{syncMsg}</p>}
        {sync.status === 'offline' && !syncMsg && (
          <p className="text-sm text-gray-400 mt-2 max-w-md">
            La synchronisation fonctionne une fois l'application déployée sur Netlify. En local, les données restent sur cet appareil.
          </p>
        )}
      </section>

      {/* Réinitialisation des données */}
      <section className="mt-8 border-t border-gray-100 pt-6">
        <h2 className="text-sm font-extrabold text-gray-500 mb-1">Réinitialiser l'application</h2>
        <p className="text-sm text-gray-400 mb-3">
          Efface toutes les données locales (membres, courses, agenda, tâches, menus) et rétablit la famille par défaut. Action irréversible.
        </p>
        <button
          onClick={() => {
            if (confirm('Tout réinitialiser ? Toutes vos données locales seront effacées et remplacées par la famille par défaut.')) resetData();
          }}
          className="inline-flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold px-4 py-2.5 rounded-xl transition active:scale-95"
        >
          <RotateCcw size={18} /> Réinitialiser les données
        </button>
      </section>

      {open && (
        <div className="fixed inset-0 bg-black/40 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => setOpen(false)}>
          <form onClick={(e) => e.stopPropagation()} onSubmit={submit} className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-5 space-y-4 max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold">Nouveau membre</h3>
              <button type="button" onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600"><X /></button>
            </div>

            <div className="flex justify-center">
              <Avatar member={form} size={72} />
            </div>

            <input autoFocus className="input" placeholder="Prénom" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />

            <div className="flex gap-2">
              <select className="input flex-1" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option>Enfant</option>
                <option>Parent</option>
                <option>Ado</option>
                <option>Autre</option>
              </select>
              <input type="date" className="input flex-1" value={form.birthdate} onChange={(e) => setForm({ ...form, birthdate: e.target.value })} aria-label="Date de naissance" />
            </div>

            <div>
              <p className="text-xs font-bold text-gray-500 mb-1.5">Avatar</p>
              <div className="flex flex-wrap gap-1.5">
                {EMOJIS.map((e) => (
                  <button type="button" key={e} onClick={() => setForm({ ...form, emoji: e })} className={`w-10 h-10 rounded-xl text-xl transition ${form.emoji === e ? 'bg-brand-100 ring-2 ring-brand-500' : 'bg-gray-50 hover:bg-gray-100'}`}>{e}</button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-gray-500 mb-1.5">Couleur</p>
              <div className="flex flex-wrap gap-2">
                {MEMBER_COLORS.map((c) => (
                  <button type="button" key={c} onClick={() => setForm({ ...form, color: c })} className={`w-8 h-8 rounded-full transition ${form.color === c ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`} style={{ backgroundColor: c }} aria-label="Couleur" />
                ))}
              </div>
            </div>

            <button type="submit" className="btn-primary w-full">Ajouter à la famille</button>
          </form>
        </div>
      )}
    </div>
  );
}
