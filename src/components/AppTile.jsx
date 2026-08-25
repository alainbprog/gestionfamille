import { Link } from 'react-router-dom';

// Tuile pastel de la grille « Mes applications »
export default function AppTile({ to, label, emoji, bg, badge }) {
  return (
    <Link
      to={to}
      className="relative rounded-3xl p-3 aspect-square flex flex-col justify-between shadow-sm active:scale-95 transition overflow-hidden"
      style={{ backgroundColor: bg }}
    >
      <span className="font-extrabold text-ink text-sm leading-tight drop-shadow-sm">{label}</span>
      <span className="text-4xl self-center my-1" aria-hidden>{emoji}</span>
      {badge != null && badge > 0 && (
        <span className="absolute left-2 bottom-2 bg-white/90 text-ink text-xs font-extrabold min-w-[22px] h-[22px] px-1.5 rounded-full flex items-center justify-center shadow">
          {badge}
        </span>
      )}
    </Link>
  );
}
