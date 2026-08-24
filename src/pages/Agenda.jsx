import { useState } from 'react';
import { Plus, Trash2, CalendarDays, MapPin, Clock, X } from 'lucide-react';
import { useFamily } from '../context/FamilyContext';
import { MemberChip } from '../components/MemberBadge';

const DAYS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const MONTHS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

function formatDay(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const diff = Math.round((d - today) / 86400000);
  const base = `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
  if (diff === 0) return `Aujourd'hui · ${base}`;
  if (diff === 1) return `Demain · ${base}`;
  return base;
}

const todayStr = () => new Date().toISOString().slice(0, 10);

export default function Agenda() {
  const { events, members, addEvent, removeEvent, memberById } = useFamily();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: '', date: todayStr(), time: '', memberId: '', location: '', notes: '' });

  const submit = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.date) return;
    addEvent({ ...form, title: form.title.trim(), memberId: form.memberId || null });
    setForm({ title: '', date: todayStr(), time: '', memberId: '', location: '', notes: '' });
    setOpen(false);
  };

  // On ne montre que les rendez-vous à venir (aujourd'hui et après), triés
  const upcoming = [...events]
    .filter((e) => e.date >= todayStr())
    .sort((a, b) => (a.date + (a.time || '')).localeCompare(b.date + (b.time || '')));

  const byDate = upcoming.reduce((acc, e) => {
    (acc[e.date] ||= []).push(e);
    return acc;
  }, {});

  return (
    <div>
      <header className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold flex items-center gap-2">
            <CalendarDays className="text-brand-600" /> Agenda
          </h1>
          <p className="text-gray-500 text-sm mt-1">{upcoming.length} rendez-vous à venir</p>
        </div>
        <button onClick={() => setOpen(true)} className="btn-primary"><Plus size={18} /> <span className="hidden sm:inline">Nouveau</span></button>
      </header>

      {upcoming.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <CalendarDays size={48} className="mx-auto mb-3 opacity-40" />
          <p className="font-semibold">Aucun rendez-vous prévu</p>
          <p className="text-sm">Ajoutez un RDV pour toute la famille.</p>
        </div>
      )}

      <div className="space-y-6">
        {Object.keys(byDate).map((date) => (
          <section key={date}>
            <h2 className="text-sm font-extrabold text-brand-700 mb-2 capitalize">{formatDay(date)}</h2>
            <ul className="space-y-2">
              {byDate[date].map((e) => (
                <li key={e.id} className="card p-4 flex items-start gap-3">
                  <div className="text-center shrink-0 bg-brand-50 text-brand-700 rounded-xl px-3 py-2 min-w-[64px]">
                    {e.time ? (
                      <span className="font-extrabold text-lg leading-none">{e.time}</span>
                    ) : (
                      <Clock size={20} className="mx-auto opacity-60" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold">{e.title}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-gray-500">
                      {e.location && <span className="inline-flex items-center gap-1"><MapPin size={14} />{e.location}</span>}
                      {e.memberId && <MemberChip member={memberById(e.memberId)} />}
                    </div>
                    {e.notes && <p className="text-sm text-gray-400 mt-1">{e.notes}</p>}
                  </div>
                  <button onClick={() => removeEvent(e.id)} className="text-gray-300 hover:text-red-500 transition shrink-0" aria-label="Supprimer">
                    <Trash2 size={18} />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/40 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => setOpen(false)}>
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={submit}
            className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-5 space-y-3 max-h-[90vh] overflow-auto"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold">Nouveau rendez-vous</h3>
              <button type="button" onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600"><X /></button>
            </div>
            <input autoFocus className="input" placeholder="Titre (ex. Dentiste)" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <div className="flex gap-2">
              <input type="date" className="input" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              <input type="time" className="input" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
            </div>
            <input className="input" placeholder="Lieu (optionnel)" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            <select className="input" value={form.memberId} onChange={(e) => setForm({ ...form, memberId: e.target.value })}>
              <option value="">Concerne… (optionnel)</option>
              {members.map((m) => <option key={m.id} value={m.id}>{m.emoji} {m.name}</option>)}
            </select>
            <textarea className="input" rows="2" placeholder="Notes (optionnel)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            <button type="submit" className="btn-primary w-full">Enregistrer</button>
          </form>
        </div>
      )}
    </div>
  );
}
