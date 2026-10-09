import { useState } from 'react';
import { PersonStanding, Clock } from 'lucide-react';
import { ZONES, EXERCISES } from '../data/etirements';

const zoneInfo = (key) => ZONES.find((z) => z.key === key);

export default function Etirements() {
  const [filter, setFilter] = useState('all');

  const visible = filter === 'all' ? EXERCISES : EXERCISES.filter((e) => e.zone === filter);
  const countFor = (key) => EXERCISES.filter((e) => e.zone === key).length;

  return (
    <div>
      <h1 className="text-2xl font-extrabold flex items-center gap-2 mb-1">
        <PersonStanding className="text-brand-600" /> Étirements
      </h1>
      <p className="text-ink/50 text-sm mb-4">
        {EXERCISES.length} exercices illustrés, classés par zone du corps. Respirez, ne forcez jamais sur la douleur.
      </p>

      {/* Filtres par zone */}
      <div className="flex flex-wrap gap-2 mb-5">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-full text-sm font-semibold transition ${filter === 'all' ? 'bg-brand-600 text-white' : 'bg-brand-50 text-brand-700'}`}
        >
          Tout ({EXERCISES.length})
        </button>
        {ZONES.map((z) => (
          <button
            key={z.key}
            onClick={() => setFilter(z.key)}
            className={`px-3 py-1.5 rounded-full text-sm font-semibold transition ${filter === z.key ? 'bg-brand-600 text-white' : 'bg-brand-50 text-brand-700'}`}
          >
            {z.emoji} {z.label} ({countFor(z.key)})
          </button>
        ))}
      </div>

      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {visible.map((ex) => {
          const zi = zoneInfo(ex.zone);
          return (
            <li key={ex.id} className="card p-3 flex gap-3">
              <div
                className="w-24 h-24 shrink-0 rounded-2xl overflow-hidden"
                aria-hidden
                dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 120 120" width="100%" height="100%">${ex.svg}</svg>` }}
              />
              <div className="min-w-0 flex-1">
                {zi && (
                  <span className="inline-block px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 text-xs font-bold">
                    {zi.emoji} {zi.label}
                  </span>
                )}
                <h2 className="font-extrabold leading-tight mt-1">{ex.name}</h2>
                <p className="text-xs text-ink/50 font-semibold flex items-center gap-1 mt-0.5">
                  <Clock size={12} /> {ex.duree}
                </p>
                <p className="text-sm text-ink/70 mt-1">{ex.consigne}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
