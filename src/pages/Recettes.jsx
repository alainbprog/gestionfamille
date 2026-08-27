import { useState } from 'react';
import { Plus, Trash2, ChefHat, ShoppingCart, X } from 'lucide-react';
import { useFamily, MEAL_TYPES } from '../context/FamilyContext';

const empty = { title: '', ingredients: '', steps: '', meal: 'dejeuner' };

const mealInfo = (key) => MEAL_TYPES.find((m) => m.key === key);

export default function Recettes() {
  const { recipes, addRecipe, removeRecipe, addRecipeToShopping } = useFamily();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [msg, setMsg] = useState('');
  const [filter, setFilter] = useState('all'); // 'all' | clé de repas

  const submit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    addRecipe({ ...form, title: form.title.trim() });
    setForm(empty);
    setOpen(false);
  };

  const toShopping = (r) => {
    const n = addRecipeToShopping(r);
    setMsg(n > 0 ? `${n} ingrédient(s) ajouté(s) aux courses ✅` : 'Ingrédients déjà présents ou vides.');
    setTimeout(() => setMsg(''), 3000);
  };

  const visible = filter === 'all' ? recipes : recipes.filter((r) => r.meal === filter);

  const countFor = (key) => recipes.filter((r) => r.meal === key).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-extrabold flex items-center gap-2">
          <ChefHat className="text-brand-600" /> Recettes
        </h1>
        <button onClick={() => setOpen(true)} className="btn-primary"><Plus size={18} /></button>
      </div>

      {msg && <div className="mb-4 p-3 rounded-2xl bg-brand-50 text-brand-700 text-sm font-semibold">{msg}</div>}

      {recipes.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-full text-sm font-semibold transition ${filter === 'all' ? 'bg-brand-600 text-white' : 'bg-brand-50 text-brand-700'}`}
          >
            Tout ({recipes.length})
          </button>
          {MEAL_TYPES.map((m) => (
            <button
              key={m.key}
              onClick={() => setFilter(m.key)}
              className={`px-3 py-1.5 rounded-full text-sm font-semibold transition ${filter === m.key ? 'bg-brand-600 text-white' : 'bg-brand-50 text-brand-700'}`}
            >
              {m.emoji} {m.label} ({countFor(m.key)})
            </button>
          ))}
        </div>
      )}

      {visible.length === 0 ? (
        <div className="text-center py-16 text-ink/40">
          <ChefHat size={44} className="mx-auto mb-3 opacity-40" />
          <p className="font-semibold">Aucune recette</p>
          <p className="text-sm">Ajoutez vos recettes préférées.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {visible.map((r) => {
            const mi = mealInfo(r.meal);
            return (
              <li key={r.id} className="card p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    {mi && (
                      <span className="inline-block mb-1 px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 text-xs font-bold">
                        {mi.emoji} {mi.label}
                      </span>
                    )}
                    <h2 className="font-extrabold text-lg">{r.title}</h2>
                  </div>
                  <button onClick={() => removeRecipe(r.id)} className="text-ink/30 hover:text-red-500 transition shrink-0" aria-label="Supprimer"><Trash2 size={18} /></button>
                </div>
                {r.ingredients && (
                  <p className="text-sm text-ink/70 mt-1"><b>Ingrédients :</b> {r.ingredients}</p>
                )}
                {r.steps && <p className="text-sm text-ink/60 mt-1 whitespace-pre-wrap">{r.steps}</p>}
                {r.ingredients && (
                  <button onClick={() => toShopping(r)} className="btn-ghost mt-3 text-sm py-2">
                    <ShoppingCart size={16} /> Ajouter aux courses
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {open && (
        <div className="fixed inset-0 bg-black/40 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => setOpen(false)}>
          <form onClick={(e) => e.stopPropagation()} onSubmit={submit} className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-5 space-y-3 max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold">Nouvelle recette</h3>
              <button type="button" onClick={() => setOpen(false)} className="text-ink/40 hover:text-ink"><X /></button>
            </div>
            <input autoFocus className="input" placeholder="Titre (ex. Gratin de courgettes)" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <div className="flex gap-2">
              {MEAL_TYPES.map((m) => (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => setForm({ ...form, meal: m.key })}
                  className={`flex-1 px-2 py-2 rounded-2xl text-sm font-semibold transition ${form.meal === m.key ? 'bg-brand-600 text-white' : 'bg-brand-50 text-brand-700'}`}
                >
                  {m.emoji} {m.label}
                </button>
              ))}
            </div>
            <textarea className="input" rows="2" placeholder="Ingrédients (séparés par des virgules)" value={form.ingredients} onChange={(e) => setForm({ ...form, ingredients: e.target.value })} />
            <textarea className="input" rows="4" placeholder="Préparation (optionnel)" value={form.steps} onChange={(e) => setForm({ ...form, steps: e.target.value })} />
            <button type="submit" className="btn-primary w-full">Enregistrer</button>
          </form>
        </div>
      )}
    </div>
  );
}
