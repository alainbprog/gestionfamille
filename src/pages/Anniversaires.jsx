import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2, Cake, Gift } from 'lucide-react';
import { useFamily } from '../context/FamilyContext';
import { Avatar } from '../components/MemberBadge';

const MONTHS = ['janv.', 'févr.', 'mars', 'avril', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];

function nextInfo(dateStr) {
  const b = new Date(dateStr + 'T00:00:00');
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const next = new Date(now.getFullYear(), b.getMonth(), b.getDate());
  if (next < now) next.setFullYear(now.getFullYear() + 1);
  const days = Math.round((next - now) / 86400000);
  const turning = next.getFullYear() - b.getFullYear();
  return { days, turning, label: `${b.getDate()} ${MONTHS[b.getMonth()]}` };
}

export default function Anniversaires() {
  const { members, birthdays, addBirthday, removeBirthday } = useFamily();
  const [form, setForm] = useState({ name: '', date: '' });

  const submit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.date) return;
    addBirthday({ name: form.name.trim(), date: form.date });
    setForm({ name: '', date: '' });
  };

  const list = [
    ...members.filter((m) => m.birthdate).map((m) => ({ id: 'm-' + m.id, name: m.name, date: m.birthdate, member: m, fixed: true })),
    ...birthdays.map((b) => ({ id: b.id, name: b.name, date: b.date, member: null, fixed: false })),
  ]
    .map((x) => ({ ...x, ...nextInfo(x.date) }))
    .sort((a, b) => a.days - b.days);

  return (
    <div>
      <h1 className="text-2xl font-extrabold flex items-center gap-2 mb-1">
        <Cake className="text-brand-600" /> Anniversaires
      </h1>
      <p className="text-ink/50 text-sm mb-4">
        Les dates des membres se règlent dans <Link to="/famille" className="text-brand-700 font-bold underline">Famille</Link>. Ajoutez ici les autres (grands-parents, amis…).
      </p>

      <form onSubmit={submit} className="card p-4 mb-5 flex flex-col sm:flex-row gap-2">
        <input className="input sm:flex-1" placeholder="Nom" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input type="date" className="input sm:w-44" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
        <button type="submit" className="btn-primary"><Plus size={18} /></button>
      </form>

      {list.length === 0 ? (
        <div className="text-center py-16 text-ink/40">
          <Cake size={44} className="mx-auto mb-3 opacity-40" />
          <p className="font-semibold">Aucun anniversaire enregistré</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {list.map((x) => (
            <li key={x.id} className="card p-4 flex items-center gap-3">
              {x.member ? <Avatar member={x.member} size={40} /> : (
                <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center text-xl">🎈</div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-extrabold leading-tight">{x.name}</p>
                <p className="text-sm text-ink/50">{x.label} · {x.turning} ans</p>
              </div>
              <div className="text-right shrink-0">
                {x.days === 0 ? (
                  <span className="inline-flex items-center gap-1 text-pink-600 font-extrabold text-sm"><Gift size={15} /> Aujourd'hui !</span>
                ) : (
                  <span className="text-sm font-bold text-ink/60">dans {x.days} j</span>
                )}
              </div>
              {!x.fixed && (
                <button onClick={() => removeBirthday(x.id)} className="text-ink/30 hover:text-red-500 transition shrink-0" aria-label="Supprimer"><Trash2 size={18} /></button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
