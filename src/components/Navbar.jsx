import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, CalendarDays, Users, ListTodo } from 'lucide-react';

const links = [
  { to: '/', label: 'Accueil', icon: LayoutDashboard, end: true },
  { to: '/courses', label: 'Courses', icon: ShoppingCart },
  { to: '/agenda', label: 'Agenda', icon: CalendarDays },
  { to: '/taches', label: 'Tâches', icon: ListTodo },
  { to: '/famille', label: 'Famille', icon: Users },
];

function Item({ to, label, icon: Icon, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold transition sm:flex-row sm:text-sm sm:px-4 ${
          isActive
            ? 'bg-white/20 text-white'
            : 'text-white/70 hover:text-white hover:bg-white/10'
        }`
      }
    >
      <Icon size={20} />
      <span>{label}</span>
    </NavLink>
  );
}

export default function Navbar() {
  return (
    <>
      {/* Barre supérieure (desktop) */}
      <nav className="hidden sm:block bg-gradient-to-r from-brand-700 to-brand-500 text-white fixed top-0 w-full z-50 shadow-lg">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏡</span>
            <div className="leading-tight">
              <span className="text-xl font-extrabold">Tribu</span>
              <p className="text-[11px] text-white/70 -mt-0.5">Notre organisation familiale</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {links.map((l) => <Item key={l.to} {...l} />)}
          </div>
        </div>
      </nav>

      {/* En-tête mobile */}
      <div className="sm:hidden bg-gradient-to-r from-brand-700 to-brand-500 text-white fixed top-0 w-full z-50 shadow-lg px-4 py-3 flex items-center gap-2">
        <span className="text-2xl">🏡</span>
        <span className="text-lg font-extrabold">Tribu</span>
      </div>

      {/* Barre de navigation basse (mobile) */}
      <nav className="sm:hidden bg-gradient-to-r from-brand-700 to-brand-500 text-white fixed bottom-0 w-full z-50 shadow-[0_-2px_10px_rgba(0,0,0,0.15)]">
        <div className="flex items-center justify-around px-2 py-1.5">
          {links.map((l) => <Item key={l.to} {...l} />)}
        </div>
      </nav>
    </>
  );
}
