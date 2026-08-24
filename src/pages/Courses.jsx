import { useState } from 'react';
import { Plus, Trash2, ShoppingCart, Check, Eraser } from 'lucide-react';
import { useFamily, SHOPPING_CATEGORIES } from '../context/FamilyContext';

const catOf = (key) => SHOPPING_CATEGORIES.find((c) => c.key === key) || SHOPPING_CATEGORIES[5];

export default function Courses() {
  const { shopping, addShopping, toggleShopping, removeShopping, clearShoppingDone } = useFamily();
  const [name, setName] = useState('');
  const [qty, setQty] = useState(1);
  const [category, setCategory] = useState('fruits');

  const submit = (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    addShopping({ name: trimmed, qty: Number(qty) || 1, category });
    setName('');
    setQty(1);
  };

  const remaining = shopping.filter((i) => !i.done);
  const doneCount = shopping.length - remaining.length;

  // Regroupement par catégorie (articles restants)
  const grouped = SHOPPING_CATEGORIES.map((c) => ({
    ...c,
    items: remaining.filter((i) => i.category === c.key),
  })).filter((g) => g.items.length > 0);

  return (
    <div>
      <header className="mb-5">
        <h1 className="text-2xl font-extrabold flex items-center gap-2">
          <ShoppingCart className="text-brand-600" /> Liste de courses
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {remaining.length} article{remaining.length > 1 ? 's' : ''} à acheter
          {doneCount > 0 && ` · ${doneCount} dans le panier`}
        </p>
      </header>

      <form onSubmit={submit} className="card p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            className="input flex-1"
            placeholder="Ajouter un article…"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="number"
            min="1"
            className="input sm:w-20"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            aria-label="Quantité"
          />
          <select className="input sm:w-48" value={category} onChange={(e) => setCategory(e.target.value)}>
            {SHOPPING_CATEGORIES.map((c) => (
              <option key={c.key} value={c.key}>{c.emoji} {c.label}</option>
            ))}
          </select>
          <button type="submit" className="btn-primary"><Plus size={18} /> Ajouter</button>
        </div>
      </form>

      {shopping.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <ShoppingCart size={48} className="mx-auto mb-3 opacity-40" />
          <p className="font-semibold">Votre liste est vide</p>
          <p className="text-sm">Ajoutez vos premiers articles ci-dessus.</p>
        </div>
      )}

      <div className="space-y-6">
        {grouped.map((g) => (
          <section key={g.key}>
            <h2 className="text-sm font-extrabold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-2">
              <span className="text-lg">{g.emoji}</span> {g.label}
            </h2>
            <ul className="card divide-y divide-gray-100">
              {g.items.map((item) => (
                <li key={item.id} className="flex items-center gap-3 px-4 py-3">
                  <button
                    onClick={() => toggleShopping(item.id)}
                    className="w-6 h-6 rounded-full border-2 border-gray-300 hover:border-brand-500 flex items-center justify-center shrink-0 transition"
                    aria-label="Cocher"
                  />
                  <span className="flex-1 font-semibold">{item.name}</span>
                  {item.qty > 1 && (
                    <span className="text-xs font-bold bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full">×{item.qty}</span>
                  )}
                  <button onClick={() => removeShopping(item.id)} className="text-gray-300 hover:text-red-500 transition" aria-label="Supprimer">
                    <Trash2 size={18} />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      {doneCount > 0 && (
        <section className="mt-8">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-extrabold text-gray-400 uppercase tracking-wide">Dans le panier</h2>
            <button onClick={clearShoppingDone} className="text-xs font-bold text-gray-500 hover:text-red-500 flex items-center gap-1">
              <Eraser size={14} /> Vider
            </button>
          </div>
          <ul className="card divide-y divide-gray-100">
            {shopping.filter((i) => i.done).map((item) => (
              <li key={item.id} className="flex items-center gap-3 px-4 py-2.5">
                <button
                  onClick={() => toggleShopping(item.id)}
                  className="w-6 h-6 rounded-full bg-brand-600 text-white flex items-center justify-center shrink-0"
                  aria-label="Décocher"
                >
                  <Check size={15} />
                </button>
                <span className="flex-1 line-through text-gray-400">{item.name}</span>
                <button onClick={() => removeShopping(item.id)} className="text-gray-300 hover:text-red-500 transition" aria-label="Supprimer">
                  <Trash2 size={18} />
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
