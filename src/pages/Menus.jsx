import { useState } from 'react';
import { UtensilsCrossed, Sparkles, Eraser, Sun, Moon } from 'lucide-react';
import { useFamily, WEEK_DAYS } from '../context/FamilyContext';

const MOMENTS = [
  { key: 'midi', label: 'Midi', icon: Sun },
  { key: 'soir', label: 'Soir', icon: Moon },
];

function MealField({ dayKey, moment, meal, onChange }) {
  return (
    <div className="space-y-1.5">
      <input
        className="input py-2 text-sm font-semibold"
        placeholder="Plat…"
        value={meal.dish}
        onChange={(e) => onChange(dayKey, moment, { dish: e.target.value })}
      />
      <input
        className="input py-1.5 text-xs"
        placeholder="Ingrédients (séparés par des virgules)"
        value={meal.ingredients}
        onChange={(e) => onChange(dayKey, moment, { ingredients: e.target.value })}
      />
    </div>
  );
}

export default function Menus() {
  const { menus, setMeal, clearMenus, generateShoppingFromMenus } = useFamily();
  const [added, setAdded] = useState(null);

  const getMeal = (dayKey, moment) => menus[dayKey]?.[moment] || { dish: '', ingredients: '' };

  const handleGenerate = () => {
    const n = generateShoppingFromMenus();
    setAdded(n);
    setTimeout(() => setAdded(null), 4000);
  };

  return (
    <div>
      <header className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold flex items-center gap-2">
            <UtensilsCrossed className="text-brand-600" /> Menus de la semaine
          </h1>
          <p className="text-gray-500 text-sm mt-1">Planifiez les repas et générez la liste de courses.</p>
        </div>
      </header>

      <div className="flex flex-wrap gap-2 mb-5">
        <button onClick={handleGenerate} className="btn-primary"><Sparkles size={18} /> Générer la liste de courses</button>
        <button onClick={() => { if (confirm('Effacer tous les menus de la semaine ?')) clearMenus(); }} className="btn-ghost"><Eraser size={18} /> Tout effacer</button>
      </div>

      {added !== null && (
        <div className={`mb-5 p-3 rounded-xl text-sm font-semibold ${added > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
          {added > 0
            ? `✅ ${added} ingrédient${added > 1 ? 's' : ''} ajouté${added > 1 ? 's' : ''} à la liste de courses.`
            : 'Aucun nouvel ingrédient à ajouter (déjà présents ou champs vides).'}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {WEEK_DAYS.map((day) => (
          <section key={day.key} className="card p-4">
            <h2 className="font-extrabold text-brand-700 mb-3">{day.label}</h2>
            <div className="space-y-3">
              {MOMENTS.map((m) => (
                <div key={m.key}>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1 flex items-center gap-1">
                    <m.icon size={13} /> {m.label}
                  </p>
                  <MealField dayKey={day.key} moment={m.key} meal={getMeal(day.key, m.key)} onChange={setMeal} />
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
