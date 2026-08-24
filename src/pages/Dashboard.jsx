import { Link } from 'react-router-dom';
import { ShoppingCart, CalendarDays, ListTodo, Users, ArrowRight, Cake, MapPin } from 'lucide-react';
import { useFamily } from '../context/FamilyContext';
import { MemberChip, Avatar } from '../components/MemberBadge';

const todayStr = () => new Date().toISOString().slice(0, 10);

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Bonjour';
  if (h < 18) return 'Bon après-midi';
  return 'Bonsoir';
}

function nextBirthday(members) {
  const now = new Date();
  const list = members
    .filter((m) => m.birthdate)
    .map((m) => {
      const b = new Date(m.birthdate + 'T00:00:00');
      const next = new Date(now.getFullYear(), b.getMonth(), b.getDate());
      if (next < new Date(now.getFullYear(), now.getMonth(), now.getDate())) next.setFullYear(now.getFullYear() + 1);
      return { m, days: Math.round((next - new Date(now.getFullYear(), now.getMonth(), now.getDate())) / 86400000) };
    })
    .sort((a, b) => a.days - b.days);
  return list[0];
}

function StatCard({ to, icon: Icon, label, value, sub, color }) {
  return (
    <Link to={to} className="card p-4 hover:shadow-md transition flex items-center gap-3">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: color + '20', color }}>
        <Icon size={24} />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-extrabold leading-none">{value}</p>
        <p className="text-sm font-bold text-gray-600">{label}</p>
        {sub && <p className="text-xs text-gray-400 truncate">{sub}</p>}
      </div>
    </Link>
  );
}

export default function Dashboard() {
  const { shopping, events, todos, members, memberById } = useFamily();

  const shoppingLeft = shopping.filter((i) => !i.done).length;
  const todosLeft = todos.filter((t) => !t.done);
  const today = todayStr();
  const todayEvents = events.filter((e) => e.date === today).sort((a, b) => (a.time || '').localeCompare(b.time || ''));
  const upcoming = [...events].filter((e) => e.date > today).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)).slice(0, 3);
  const bday = nextBirthday(members);

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-3xl font-extrabold">{greeting()} 👋</h1>
        <p className="text-gray-500 mt-1 capitalize">
          {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </header>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard to="/courses" icon={ShoppingCart} label="Courses" value={shoppingLeft} sub="articles à acheter" color="#10b981" />
        <StatCard to="/agenda" icon={CalendarDays} label="RDV du jour" value={todayEvents.length} sub="rendez-vous" color="#6366f1" />
        <StatCard to="/taches" icon={ListTodo} label="Tâches" value={todosLeft.length} sub="à faire" color="#f59e0b" />
        <StatCard to="/famille" icon={Users} label="Famille" value={members.length} sub="membres" color="#ec4899" />
      </div>

      {/* Anniversaire à venir */}
      {bday && bday.days <= 30 && (
        <div className="card p-4 mb-6 flex items-center gap-3 bg-gradient-to-r from-pink-50 to-brand-50 border-pink-100">
          <Cake className="text-pink-500 shrink-0" size={28} />
          <p className="text-sm font-semibold text-gray-700">
            {bday.days === 0
              ? <>C'est l'anniversaire de <b>{bday.m.name}</b> aujourd'hui ! 🎉</>
              : <>Anniversaire de <b>{bday.m.name}</b> dans <b>{bday.days} jour{bday.days > 1 ? 's' : ''}</b> 🎂</>}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Programme du jour */}
        <section>
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-extrabold text-lg">Aujourd'hui</h2>
            <Link to="/agenda" className="text-sm font-bold text-brand-600 flex items-center gap-1">Agenda <ArrowRight size={14} /></Link>
          </div>
          {todayEvents.length === 0 ? (
            <div className="card p-6 text-center text-gray-400 text-sm">Aucun rendez-vous aujourd'hui 🎈</div>
          ) : (
            <ul className="space-y-2">
              {todayEvents.map((e) => (
                <li key={e.id} className="card p-3.5 flex items-center gap-3">
                  <div className="text-center bg-brand-50 text-brand-700 rounded-lg px-2.5 py-1.5 font-extrabold text-sm min-w-[52px]">
                    {e.time || '—'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold truncate">{e.title}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      {e.location && <span className="inline-flex items-center gap-1"><MapPin size={12} />{e.location}</span>}
                      {e.memberId && <MemberChip member={memberById(e.memberId)} />}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {upcoming.length > 0 && (
            <div className="mt-4">
              <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-wide mb-2">Prochainement</h3>
              <ul className="space-y-1.5">
                {upcoming.map((e) => (
                  <li key={e.id} className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="text-gray-400 font-semibold w-16 shrink-0">
                      {new Date(e.date + 'T00:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                    </span>
                    <span className="font-semibold truncate">{e.title}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* Tâches prioritaires */}
        <section>
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-extrabold text-lg">À faire</h2>
            <Link to="/taches" className="text-sm font-bold text-brand-600 flex items-center gap-1">Tout voir <ArrowRight size={14} /></Link>
          </div>
          {todosLeft.length === 0 ? (
            <div className="card p-6 text-center text-gray-400 text-sm">Rien à faire, profitez-en ! ☕</div>
          ) : (
            <ul className="space-y-2">
              {todosLeft.slice(0, 5).map((t) => (
                <li key={t.id} className="card p-3.5 flex items-center gap-3">
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${t.priority === 'haute' ? 'bg-red-500' : t.priority === 'basse' ? 'bg-gray-300' : 'bg-blue-500'}`} />
                  <span className="flex-1 font-semibold truncate">{t.text}</span>
                  {t.memberId && <Avatar member={memberById(t.memberId)} size={28} />}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
