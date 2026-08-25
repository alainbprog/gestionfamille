import { HeartPulse, Minus, Plus, Droplet } from 'lucide-react';
import { useFamily } from '../context/FamilyContext';

const MOODS = ['😀', '🙂', '😐', '😕', '😴', '😢'];

export default function BienEtre() {
  const { wellbeing, setWellbeing } = useFamily();
  const today = new Date().toISOString().slice(0, 10);
  const w = wellbeing[today] || { water: 0, mood: '' };

  const setWater = (n) => setWellbeing(today, { water: Math.max(0, n) });

  return (
    <div>
      <h1 className="text-2xl font-extrabold flex items-center gap-2 mb-1">
        <HeartPulse className="text-brand-600" /> Bien-être
      </h1>
      <p className="text-ink/50 text-sm mb-5 capitalize">
        {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
      </p>

      {/* Hydratation */}
      <section className="card p-5 mb-4">
        <h2 className="font-extrabold mb-3 flex items-center gap-2"><Droplet size={18} className="text-sky-500" /> Hydratation</h2>
        <div className="flex items-center justify-center gap-5">
          <button onClick={() => setWater(w.water - 1)} className="w-11 h-11 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center active:scale-95" aria-label="Moins"><Minus /></button>
          <div className="text-center">
            <p className="text-4xl font-extrabold text-sky-500 leading-none">{w.water}</p>
            <p className="text-xs text-ink/50 font-semibold mt-1">verre{w.water > 1 ? 's' : ''} d'eau</p>
          </div>
          <button onClick={() => setWater(w.water + 1)} className="w-11 h-11 rounded-full bg-sky-100 hover:bg-sky-200 text-sky-600 flex items-center justify-center active:scale-95" aria-label="Plus"><Plus /></button>
        </div>
        <div className="flex justify-center gap-1 mt-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Droplet key={i} size={18} className={i < w.water ? 'text-sky-400 fill-sky-400' : 'text-black/10'} />
          ))}
        </div>
      </section>

      {/* Humeur */}
      <section className="card p-5">
        <h2 className="font-extrabold mb-3">Humeur du jour</h2>
        <div className="flex justify-between">
          {MOODS.map((m) => (
            <button
              key={m}
              onClick={() => setWellbeing(today, { mood: m })}
              className={`text-3xl w-12 h-12 rounded-2xl transition ${w.mood === m ? 'bg-brand-100 ring-2 ring-brand-500 scale-110' : 'hover:bg-black/5'}`}
            >
              {m}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
