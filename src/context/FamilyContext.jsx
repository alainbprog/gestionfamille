import { createContext, useContext, useEffect, useRef, useState } from 'react';

const FamilyContext = createContext();

const STORAGE_KEY = 'tribu-data-v1';
const REV_KEY = 'tribu-rev-v1';
const SYNC_KEY = 'tribu-sync-v1';
const RECIPES_SEED_KEY = 'tribu-recipes-seed-v1';
const SHOPPING_SEED_KEY = 'tribu-shopping-seed-v1';
const SYNC_URL = '/.netlify/functions/sync';

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

// Palette de couleurs proposées pour les membres de la famille
export const MEMBER_COLORS = [
  '#6366f1', '#ec4899', '#f59e0b', '#10b981',
  '#3b82f6', '#ef4444', '#8b5cf6', '#14b8a6',
];

export const SHOPPING_CATEGORIES = [
  { key: 'viande', label: 'Viandes & Poissons', emoji: '🥩' },
  { key: 'legumes', label: 'Légumes', emoji: '🥦' },
  { key: 'fruits', label: 'Fruits', emoji: '🍎' },
  { key: 'feculents', label: 'Féculents & Pains', emoji: '🍞' },
  { key: 'frais', label: 'Produits frais & Crémerie', emoji: '🧀' },
  { key: 'epicerie', label: 'Épicerie', emoji: '🥫' },
  { key: 'boissons', label: 'Boissons', emoji: '🧃' },
  { key: 'hygiene', label: 'Hygiène & Maison', emoji: '🧼' },
  { key: 'autre', label: 'Autre', emoji: '🛒' },
];

// Liste d'articles fournie par Alain (2026-10-09), classée par rayon.
// Injectée une seule fois dans la liste de courses (voir seedShopping).
export const SHOPPING_SEED = [
  // Viandes & Poissons / charcuterie
  { name: 'Paupiettes', category: 'viande' },
  { name: 'Poulet', category: 'viande' },
  { name: 'Thon', category: 'viande' },
  { name: 'Steak haché', category: 'viande' },
  { name: 'Saucisse', category: 'viande' },
  { name: 'Jambon', category: 'viande' },
  { name: 'Viandes', category: 'viande' },
  { name: 'Lardons', category: 'viande' },
  // Légumes
  { name: 'Pomme de terre', category: 'legumes' },
  { name: 'Carotte', category: 'legumes' },
  { name: 'Tomates', category: 'legumes' },
  { name: 'Courgettes', category: 'legumes' },
  { name: 'Poivrons', category: 'legumes' },
  { name: 'Flageolets', category: 'legumes' },
  { name: 'Salade', category: 'legumes' },
  { name: 'Avocat', category: 'legumes' },
  { name: 'Légumes boîte', category: 'legumes' },
  // Fruits
  { name: 'Citron', category: 'fruits' },
  { name: 'Fruits (banane, pêche)', category: 'fruits' },
  { name: 'Raisin', category: 'fruits' },
  // Féculents & Pains
  { name: 'Pain de seigle', category: 'feculents' },
  { name: 'Pain galette', category: 'feculents' },
  { name: 'Biscotte', category: 'feculents' },
  { name: 'Céréales fibres', category: 'feculents' },
  { name: 'Céréales Théo', category: 'feculents' },
  { name: 'Pain grillé', category: 'feculents' },
  { name: 'Pain de mie ou complet', category: 'feculents' },
  { name: 'Nouilles', category: 'feculents' },
  { name: 'Aligot', category: 'feculents' },
  { name: 'Brioche lolo', category: 'feculents' },
  { name: 'Pitch', category: 'feculents' },
  { name: 'Gâteau enfant / pain au chocolat', category: 'feculents' },
  { name: 'Pâtes au konjac', category: 'feculents' },
  // Produits frais & Crémerie
  { name: 'Lait', category: 'frais' },
  { name: 'Beurre Sylvie', category: 'frais' },
  { name: 'Yaourts', category: 'frais' },
  { name: 'Gruyère', category: 'frais' },
  { name: 'Œuf', category: 'frais' },
  { name: 'Chantilly', category: 'frais' },
  { name: 'Surimi', category: 'frais' },
  { name: 'Chèvre bûchette', category: 'frais' },
  { name: 'Reblochon', category: 'frais' },
  { name: 'Piémontaise', category: 'frais' },
  { name: 'Galette lardon Théo', category: 'frais' },
  { name: 'Pizza', category: 'frais' },
  { name: 'Plat préparé', category: 'frais' },
  // Épicerie
  { name: 'Beurre de cacahouète', category: 'epicerie' },
  { name: 'Café Sylvie Capucine', category: 'epicerie' },
  { name: 'Sucrette', category: 'epicerie' },
  { name: 'Huile pour frites', category: 'epicerie' },
  { name: 'Cookies sans noisettes', category: 'epicerie' },
  { name: 'Café latte', category: 'epicerie' },
  { name: 'Ketchup', category: 'epicerie' },
  { name: 'Amande nature', category: 'epicerie' },
  { name: 'Vinaigre', category: 'epicerie' },
  { name: 'Vinaigrette', category: 'epicerie' },
  { name: 'Dosettes café', category: 'epicerie' },
  { name: 'Compote lilou', category: 'epicerie' },
  { name: 'Farine', category: 'epicerie' },
  { name: 'Chips lilou', category: 'epicerie' },
  { name: 'Maltesers', category: 'epicerie' },
  { name: 'Capuccino Laurène', category: 'epicerie' },
  { name: 'Sel', category: 'epicerie' },
  { name: 'Moutarde', category: 'epicerie' },
  { name: 'Sauce bourguignonne', category: 'epicerie' },
  // Boissons
  { name: 'Jus d\'orange', category: 'boissons' },
  { name: 'Eau', category: 'boissons' },
  { name: 'Liquide minceur', category: 'boissons' },
  { name: 'Monster', category: 'boissons' },
  { name: 'Coca', category: 'boissons' },
  { name: '3 bouteilles de blanc', category: 'boissons' },
  { name: 'Apéro', category: 'boissons' },
  { name: 'Vin blanc', category: 'boissons' },
  { name: 'Kir mûre', category: 'boissons' },
  // Hygiène & Maison
  { name: 'Éponge', category: 'hygiene' },
  { name: 'Pastilles vaisselle', category: 'hygiene' },
  { name: 'Liquide vaisselle', category: 'hygiene' },
  { name: 'Mouchoirs', category: 'hygiene' },
  { name: 'Sac à poubelle', category: 'hygiene' },
  { name: 'Shampoing', category: 'hygiene' },
  { name: 'Lame de rasoir', category: 'hygiene' },
  { name: 'Dentifrice', category: 'hygiene' },
  { name: 'Brosse à dents', category: 'hygiene' },
  { name: 'Gel douche', category: 'hygiene' },
  { name: 'PQ', category: 'hygiene' },
  { name: 'Sopalin', category: 'hygiene' },
  { name: 'Lave-vitres', category: 'hygiene' },
  { name: 'Lavage sol', category: 'hygiene' },
  { name: 'Shampoing poux', category: 'hygiene' },
  { name: 'Bombe fraîcheur', category: 'hygiene' },
  { name: 'Bombe WC', category: 'hygiene' },
  { name: 'Anti-tache', category: 'hygiene' },
  { name: 'Culotte menstruelle', category: 'hygiene' },
  // Autre
  { name: 'Bouffe du mercredi', category: 'autre' },
];

// Jours de la semaine (pour le planning des menus)
export const WEEK_DAYS = [
  { key: 'lundi', label: 'Lundi' },
  { key: 'mardi', label: 'Mardi' },
  { key: 'mercredi', label: 'Mercredi' },
  { key: 'jeudi', label: 'Jeudi' },
  { key: 'vendredi', label: 'Vendredi' },
  { key: 'samedi', label: 'Samedi' },
  { key: 'dimanche', label: 'Dimanche' },
];

export const RECURRENCES = {
  none: 'Une fois',
  quotidienne: 'Chaque jour',
  hebdomadaire: 'Chaque semaine',
};

// Types de repas (pour classer les recettes sur la journée)
export const MEAL_TYPES = [
  { key: 'petit-dej', label: 'Petit-déj', emoji: '🌅' },
  { key: 'dejeuner', label: 'Déjeuner', emoji: '🍽️' },
  { key: 'diner', label: 'Dîner', emoji: '🌙' },
];

// Bibliothèque de recettes simples, à base de légumes, pour les 3 repas.
// Amorcée une fois pour chaque utilisateur (voir load()).
export const DEFAULT_RECIPES = [
  // --- Petit-déjeuner ---
  { id: 'seed-b01', meal: 'petit-dej', title: 'Smoothie vert épinards-banane', ingredients: 'épinards frais, banane, pomme, lait ou lait végétal', steps: "Mixez une poignée d'épinards avec la banane, la pomme et un verre de lait jusqu'à obtenir une texture lisse." },
  { id: 'seed-b02', meal: 'petit-dej', title: 'Œufs brouillés aux épinards et tomates', ingredients: 'œufs, épinards, tomate, beurre, sel, poivre', steps: 'Faites revenir les épinards et la tomate coupée, ajoutez les œufs battus et remuez à feu doux.' },
  { id: 'seed-b03', meal: 'petit-dej', title: 'Tartine avocat-tomate', ingredients: 'pain complet, avocat, tomate, citron, sel', steps: "Écrasez l'avocat avec un filet de citron, étalez sur le pain grillé et garnissez de rondelles de tomate." },
  { id: 'seed-b04', meal: 'petit-dej', title: 'Galettes de courgette', ingredients: 'courgette, œuf, farine, oignon, sel, poivre', steps: "Râpez la courgette, mélangez avec l'œuf, la farine et l'oignon, puis faites dorer de petites galettes à la poêle." },
  { id: 'seed-b05', meal: 'petit-dej', title: 'Muffins salés courgette-carotte', ingredients: 'courgette, carotte, œufs, farine, levure, fromage râpé', steps: 'Râpez les légumes, mélangez avec les œufs, la farine, la levure et le fromage, puis faites cuire 20 min au four (180°C).' },
  { id: 'seed-b06', meal: 'petit-dej', title: 'Omelette aux champignons', ingredients: 'œufs, champignons, persil, beurre, sel', steps: "Faites revenir les champignons, versez les œufs battus et pliez l'omelette une fois prise." },
  { id: 'seed-b07', meal: 'petit-dej', title: 'Pancakes à la patate douce', ingredients: 'patate douce, œufs, farine, lait, levure', steps: 'Écrasez la patate douce cuite, mélangez à la pâte à pancakes et faites cuire de petites crêpes épaisses.' },
  { id: 'seed-b08', meal: 'petit-dej', title: 'Bol fromage frais, tomates & concombre', ingredients: 'fromage blanc, tomate, concombre, ciboulette, sel', steps: 'Mélangez le fromage blanc avec les dés de tomate et de concombre et parsemez de ciboulette.' },
  { id: 'seed-b09', meal: 'petit-dej', title: 'Smoothie carotte-orange-gingembre', ingredients: 'carotte, orange, gingembre, eau', steps: "Mixez la carotte avec le jus d'orange, un peu de gingembre et de l'eau." },
  { id: 'seed-b10', meal: 'petit-dej', title: 'Wrap œuf-épinards', ingredients: 'tortilla, œufs, épinards, tomate, fromage', steps: "Faites une omelette avec les épinards, déposez-la sur la tortilla avec la tomate et le fromage, puis roulez." },

  // --- Déjeuner ---
  { id: 'seed-l01', meal: 'dejeuner', title: 'Salade de lentilles, carottes et concombre', ingredients: "lentilles, carotte, concombre, oignon rouge, huile d'olive, vinaigre", steps: "Mélangez les lentilles cuites avec les carottes et le concombre en dés, assaisonnez d'huile et de vinaigre." },
  { id: 'seed-l02', meal: 'dejeuner', title: 'Soupe de courgettes', ingredients: 'courgette, oignon, pomme de terre, bouillon, crème', steps: 'Faites cuire les légumes dans le bouillon puis mixez avec un peu de crème.' },
  { id: 'seed-l03', meal: 'dejeuner', title: 'Poêlée de légumes', ingredients: "courgette, poivron, oignon, tomate, huile d'olive, herbes", steps: "Faites revenir tous les légumes coupés à la poêle avec un filet d'huile et des herbes." },
  { id: 'seed-l04', meal: 'dejeuner', title: 'Gratin de courgettes', ingredients: 'courgette, crème, fromage râpé, ail, sel', steps: 'Disposez les courgettes en tranches, nappez de crème et de fromage, gratinez 25 min au four.' },
  { id: 'seed-l05', meal: 'dejeuner', title: 'Riz aux petits légumes', ingredients: 'riz, carotte, petits pois, maïs, oignon', steps: 'Faites cuire le riz, ajoutez les légumes revenus à la poêle et mélangez.' },
  { id: 'seed-l06', meal: 'dejeuner', title: 'Buddha bowl quinoa-avocat', ingredients: 'quinoa, avocat, carotte, concombre, pois chiches, citron', steps: "Répartissez le quinoa cuit et les légumes dans un bol, ajoutez l'avocat et un filet de citron." },
  { id: 'seed-l07', meal: 'dejeuner', title: 'Ratatouille express', ingredients: 'aubergine, courgette, poivron, tomate, oignon, ail', steps: "Faites mijoter tous les légumes coupés en dés 25 min avec un peu d'huile d'olive." },
  { id: 'seed-l08', meal: 'dejeuner', title: 'Salade tomates-mozzarella', ingredients: "tomate, mozzarella, basilic, huile d'olive", steps: "Alternez les tranches de tomate et de mozzarella, parsemez de basilic et d'huile d'olive." },
  { id: 'seed-l09', meal: 'dejeuner', title: 'Wok de brocoli et carottes', ingredients: 'brocoli, carotte, sauce soja, ail, sésame', steps: 'Faites sauter le brocoli et la carotte au wok, ajoutez la sauce soja et le sésame.' },
  { id: 'seed-l10', meal: 'dejeuner', title: 'Purée de patate douce', ingredients: 'patate douce, lait, beurre, sel, muscade', steps: 'Faites cuire les patates douces, écrasez-les avec le lait et le beurre.' },
  { id: 'seed-l11', meal: 'dejeuner', title: 'Taboulé de chou-fleur', ingredients: "chou-fleur, tomate, concombre, menthe, citron, huile d'olive", steps: 'Mixez le chou-fleur cru en semoule, mélangez avec les légumes coupés, la menthe et le citron.' },
  { id: 'seed-l12', meal: 'dejeuner', title: 'Frittata aux légumes', ingredients: 'œufs, courgette, poivron, oignon, fromage', steps: 'Faites revenir les légumes, versez les œufs battus et laissez cuire à couvert puis au four.' },
  { id: 'seed-l13', meal: 'dejeuner', title: 'Velouté de potiron', ingredients: 'potiron, oignon, pomme de terre, bouillon, crème', steps: 'Cuisez le potiron dans le bouillon puis mixez avec une pointe de crème.' },

  // --- Dîner ---
  { id: 'seed-d01', meal: 'diner', title: 'Soupe de légumes maison', ingredients: 'carotte, poireau, pomme de terre, courgette, oignon, bouillon', steps: 'Coupez les légumes, couvrez de bouillon, laissez cuire 30 min puis mixez.' },
  { id: 'seed-d02', meal: 'diner', title: 'Gratin de chou-fleur', ingredients: 'chou-fleur, lait, farine, beurre, fromage râpé', steps: 'Cuisez le chou-fleur, nappez de béchamel et de fromage, gratinez au four 20 min.' },
  { id: 'seed-d03', meal: 'diner', title: 'Curry de légumes au lait de coco', ingredients: 'carotte, courgette, pois chiches, lait de coco, curry, oignon', steps: 'Faites revenir les légumes, ajoutez le lait de coco et le curry, laissez mijoter 20 min.' },
  { id: 'seed-d04', meal: 'diner', title: "Haricots verts à l'ail", ingredients: "haricots verts, ail, huile d'olive, persil, sel", steps: "Faites cuire les haricots verts puis poêlez-les avec l'ail et le persil." },
  { id: 'seed-d05', meal: 'diner', title: 'Courgettes farcies au riz', ingredients: 'courgette, riz, tomate, oignon, fromage', steps: 'Évidez les courgettes, garnissez de riz cuit et de légumes, gratinez 25 min au four.' },
  { id: 'seed-d06', meal: 'diner', title: 'Tian de légumes', ingredients: "courgette, tomate, aubergine, oignon, ail, huile d'olive, herbes de Provence", steps: "Disposez les légumes en rosace dans un plat, arrosez d'huile et enfournez 40 min." },
  { id: 'seed-d07', meal: 'diner', title: 'Dahl de lentilles corail', ingredients: 'lentilles corail, épinards, tomate, oignon, lait de coco, curcuma', steps: 'Cuisez les lentilles avec la tomate et les épices, ajoutez les épinards et le lait de coco en fin de cuisson.' },
  { id: 'seed-d08', meal: 'diner', title: 'Poireaux à la béchamel', ingredients: 'poireau, lait, farine, beurre, muscade', steps: 'Faites fondre les poireaux, nappez de béchamel légère et faites gratiner.' },
  { id: 'seed-d09', meal: 'diner', title: 'Tarte fine aux légumes', ingredients: 'pâte feuilletée, courgette, tomate, oignon, fromage, herbes', steps: 'Étalez la pâte, disposez les légumes en fines tranches, parsemez de fromage et cuisez 25 min.' },
  { id: 'seed-d10', meal: 'diner', title: 'Minestrone', ingredients: 'carotte, courgette, haricots blancs, tomate, pâtes, oignon, bouillon', steps: 'Faites mijoter les légumes et les haricots dans le bouillon, ajoutez les pâtes en fin de cuisson.' },
  { id: 'seed-d11', meal: 'diner', title: "Poêlée d'épinards et pois chiches", ingredients: "épinards, pois chiches, ail, tomate, huile d'olive, cumin", steps: "Faites revenir l'ail, ajoutez les pois chiches, les épinards et la tomate, assaisonnez de cumin." },
  { id: 'seed-d12', meal: 'diner', title: 'Chou-fleur rôti au four', ingredients: "chou-fleur, huile d'olive, paprika, ail, sel", steps: "Coupez le chou-fleur en bouquets, enrobez d'huile et d'épices, rôtissez 30 min à 200°C." },
  { id: 'seed-d13', meal: 'diner', title: 'Ragoût de pois chiches et tomates', ingredients: 'pois chiches, tomate, oignon, poivron, ail, paprika', steps: 'Faites mijoter les pois chiches avec la tomate, le poivron et les épices 20 min.' },
];

const defaultData = {
  members: [
    { id: 'm1', name: 'Alain', role: 'Parent', color: '#3b82f6', emoji: '👨', birthdate: '' },
    { id: 'm2', name: 'Sylvie', role: 'Parent', color: '#ec4899', emoji: '👩', birthdate: '' },
    { id: 'm3', name: 'Laurène', role: 'Enfant', color: '#8b5cf6', emoji: '👧', birthdate: '' },
    { id: 'm4', name: 'Théo', role: 'Enfant', color: '#10b981', emoji: '👦', birthdate: '' },
    { id: 'm5', name: 'Lilou', role: 'Enfant', color: '#f59e0b', emoji: '👧', birthdate: '' },
  ],
  shopping: [],
  events: [],
  todos: [],
  menus: {}, // { lundi: { midi: {dish, ingredients}, soir: {dish, ingredients} }, ... }
  notes: [], // { id, text, createdAt }
  recipes: DEFAULT_RECIPES, // { id, title, ingredients, steps, meal }
  birthdays: [], // { id, name, date } — anniversaires hors membres
  wellbeing: {}, // { 'YYYY-MM-DD': { water, mood } }
};

const todayStr = () => new Date().toISOString().slice(0, 10);

// Lundi de la semaine en cours (pour la récurrence hebdomadaire)
function weekStartStr() {
  const d = new Date();
  const day = (d.getDay() + 6) % 7; // 0 = lundi
  d.setDate(d.getDate() - day);
  return d.toISOString().slice(0, 10);
}

// Une tâche récurrente est "faite" seulement pour la période en cours
export function isTaskDone(t) {
  if (!t.recurrence || t.recurrence === 'none') return t.done;
  if (!t.lastDone) return false;
  if (t.recurrence === 'quotidienne') return t.lastDone === todayStr();
  if (t.recurrence === 'hebdomadaire') return t.lastDone >= weekStartStr();
  return t.done;
}

// Amorce une fois la bibliothèque de recettes, sans écraser les recettes déjà
// créées par l'utilisateur (dé-doublonnage par titre).
function seedRecipes(base) {
  try {
    if (localStorage.getItem(RECIPES_SEED_KEY)) return base;
  } catch {
    return base; // stockage indisponible : on n'amorce pas
  }
  const existing = new Set((base.recipes || []).map((r) => (r.title || '').trim().toLowerCase()));
  const toAdd = DEFAULT_RECIPES.filter((r) => !existing.has(r.title.trim().toLowerCase()));
  const next = { ...base, recipes: [...toAdd, ...(base.recipes || [])] };
  try { localStorage.setItem(RECIPES_SEED_KEY, '1'); } catch { /* ignore */ }
  return next;
}

// Normalisation de nom pour dé-doublonnage (sans accents, minuscule, singulier)
const normName = (s) => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim().replace(/\s+/g, ' ').replace(/s$/, '');

// Injecte une fois la liste de courses fournie, sans écraser ni dupliquer.
function seedShopping(base) {
  try {
    if (localStorage.getItem(SHOPPING_SEED_KEY)) return base;
  } catch {
    return base;
  }
  const existing = new Set((base.shopping || []).map((i) => normName(i.name)));
  const toAdd = [];
  SHOPPING_SEED.forEach((it) => {
    const k = normName(it.name);
    if (k && !existing.has(k)) {
      existing.add(k);
      toAdd.push({ id: uid(), name: it.name, qty: 1, category: it.category, done: false });
    }
  });
  const next = { ...base, shopping: [...toAdd, ...(base.shopping || [])] };
  try { localStorage.setItem(SHOPPING_SEED_KEY, '1'); } catch { /* ignore */ }
  return next;
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const base = raw ? { ...defaultData, ...JSON.parse(raw) } : { ...defaultData };
    return seedShopping(seedRecipes(base));
  } catch {
    return defaultData;
  }
}

function loadRev() {
  try {
    return Number(localStorage.getItem(REV_KEY)) || 0;
  } catch {
    return 0;
  }
}

function loadSyncConfig() {
  try {
    const raw = localStorage.getItem(SYNC_KEY);
    return raw ? JSON.parse(raw) : { enabled: false, code: '' };
  } catch {
    return { enabled: false, code: '' };
  }
}

export function FamilyProvider({ children }) {
  const [data, setData] = useState(load);
  const [sync, setSync] = useState(() => ({ ...loadSyncConfig(), status: 'idle' }));

  // Révision locale (horodatage de la dernière modification) pour la fusion multi-appareils
  const revRef = useRef(loadRev());
  const dirtyRef = useRef(false); // des changements locaux restent à envoyer
  const dataRef = useRef(data);
  const applyingRemoteRef = useRef(false);

  useEffect(() => {
    dataRef.current = data;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      localStorage.setItem(REV_KEY, String(revRef.current));
    } catch {
      /* stockage indisponible (navigation privée) — on ignore */
    }
  }, [data]);

  useEffect(() => {
    try {
      localStorage.setItem(SYNC_KEY, JSON.stringify({ enabled: sync.enabled, code: sync.code }));
    } catch { /* ignore */ }
  }, [sync.enabled, sync.code]);

  // Marque une modification locale (nouvelle révision à propager)
  const bumpRev = () => {
    if (applyingRemoteRef.current) return; // changement venu du cloud : ne pas re-propager
    revRef.current = Date.now();
    dirtyRef.current = true;
  };

  // Applique un état reçu du cloud sans le renvoyer
  const applyRemote = (record) => {
    applyingRemoteRef.current = true;
    revRef.current = Number(record.rev) || 0;
    dirtyRef.current = false;
    setData(record.data);
    try { localStorage.setItem(REV_KEY, String(revRef.current)); } catch { /* ignore */ }
    // Réautorise la propagation au tick suivant
    setTimeout(() => { applyingRemoteRef.current = false; }, 0);
  };

  const update = (key, updater) => {
    setData((d) => ({ ...d, [key]: updater(d[key]) }));
    bumpRev();
  };

  // --- Membres de la famille ---
  const addMember = (m) =>
    update('members', (list) => [...list, { id: uid(), emoji: '🧒', role: 'Enfant', color: MEMBER_COLORS[list.length % MEMBER_COLORS.length], birthdate: '', ...m }]);
  const updateMember = (id, patch) =>
    update('members', (list) => list.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  const removeMember = (id) => {
    update('members', (list) => list.filter((m) => m.id !== id));
    // On détache le membre des tâches et évènements liés
    update('todos', (list) => list.map((t) => (t.memberId === id ? { ...t, memberId: null } : t)));
    update('events', (list) => list.map((e) => (e.memberId === id ? { ...e, memberId: null } : e)));
  };

  // --- Liste de courses ---
  const addShopping = (item) =>
    update('shopping', (list) => [{ id: uid(), done: false, qty: 1, category: 'autre', ...item }, ...list]);
  const toggleShopping = (id) =>
    update('shopping', (list) => list.map((i) => (i.id === id ? { ...i, done: !i.done } : i)));
  const removeShopping = (id) =>
    update('shopping', (list) => list.filter((i) => i.id !== id));
  const clearShoppingDone = () =>
    update('shopping', (list) => list.filter((i) => !i.done));

  // --- Agenda / Rendez-vous ---
  const addEvent = (e) =>
    update('events', (list) => [...list, { id: uid(), memberId: null, location: '', notes: '', ...e }]);
  const updateEvent = (id, patch) =>
    update('events', (list) => list.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  const removeEvent = (id) =>
    update('events', (list) => list.filter((e) => e.id !== id));

  // --- To-do ---
  const addTodo = (t) =>
    update('todos', (list) => [{ id: uid(), done: false, priority: 'normale', memberId: null, due: '', recurrence: 'none', lastDone: '', ...t }, ...list]);
  const toggleTodo = (id) =>
    update('todos', (list) => list.map((t) => {
      if (t.id !== id) return t;
      // Tâche récurrente : on marque/démarque la période en cours via lastDone
      if (t.recurrence && t.recurrence !== 'none') {
        return { ...t, lastDone: isTaskDone(t) ? '' : todayStr() };
      }
      return { ...t, done: !t.done };
    }));
  const updateTodo = (id, patch) =>
    update('todos', (list) => list.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  const removeTodo = (id) =>
    update('todos', (list) => list.filter((t) => t.id !== id));

  // --- Menus de la semaine ---
  const setMeal = (dayKey, moment, patch) =>
    update('menus', (menus) => {
      const day = menus[dayKey] || {};
      const meal = { dish: '', ingredients: '', ...day[moment], ...patch };
      return { ...menus, [dayKey]: { ...day, [moment]: meal } };
    });
  const clearMenus = () => update('menus', () => ({}));

  // Ajoute à la liste de courses tous les ingrédients des menus (sans doublon)
  const generateShoppingFromMenus = () => {
    const existing = new Set(data.shopping.map((i) => i.name.trim().toLowerCase()));
    const toAdd = [];
    Object.values(data.menus).forEach((day) => {
      Object.values(day || {}).forEach((meal) => {
        (meal?.ingredients || '')
          .split(/[,\n]/)
          .map((s) => s.trim())
          .filter(Boolean)
          .forEach((name) => {
            const key = name.toLowerCase();
            if (!existing.has(key)) {
              existing.add(key);
              toAdd.push({ id: uid(), name, qty: 1, category: 'autre', done: false });
            }
          });
      });
    });
    if (toAdd.length) update('shopping', (list) => [...toAdd, ...list]);
    return toAdd.length;
  };

  // --- Notes ---
  // Accepte une chaîne (note texte) ou un objet { text?, drawing? } (note manuscrite)
  const addNote = (note) => {
    const base = typeof note === 'string' ? { text: note } : (note || {});
    update('notes', (list) => [{ id: uid(), text: '', drawing: '', createdAt: Date.now(), ...base }, ...list]);
  };
  const removeNote = (id) => update('notes', (list) => list.filter((n) => n.id !== id));

  // --- Recettes ---
  const addRecipe = (r) =>
    update('recipes', (list) => [{ id: uid(), title: '', ingredients: '', steps: '', meal: '', ...r }, ...list]);
  const removeRecipe = (id) => update('recipes', (list) => list.filter((r) => r.id !== id));
  // Ajoute les ingrédients d'une recette à la liste de courses (sans doublon)
  const addRecipeToShopping = (recipe) => {
    const existing = new Set(data.shopping.map((i) => i.name.trim().toLowerCase()));
    const toAdd = [];
    (recipe.ingredients || '')
      .split(/[,\n]/)
      .map((s) => s.trim())
      .filter(Boolean)
      .forEach((name) => {
        if (!existing.has(name.toLowerCase())) {
          existing.add(name.toLowerCase());
          toAdd.push({ id: uid(), name, qty: 1, category: 'autre', done: false });
        }
      });
    if (toAdd.length) update('shopping', (list) => [...toAdd, ...list]);
    return toAdd.length;
  };

  // --- Anniversaires (hors membres) ---
  const addBirthday = (b) =>
    update('birthdays', (list) => [...list, { id: uid(), name: '', date: '', ...b }]);
  const removeBirthday = (id) => update('birthdays', (list) => list.filter((b) => b.id !== id));

  // --- Bien-être (par jour) ---
  const setWellbeing = (date, patch) =>
    update('wellbeing', (w) => ({ ...w, [date]: { water: 0, mood: '', ...w[date], ...patch } }));

  // --- Réinitialisation complète ---
  const resetData = () => {
    setData(JSON.parse(JSON.stringify(defaultData)));
    bumpRev();
  };

  // --- Synchronisation multi-appareils (via Netlify Function + Blobs) ---
  const pushNow = async () => {
    const res = await fetch(SYNC_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ code: sync.code, data: dataRef.current, rev: revRef.current }),
    });
    if (!res.ok) throw new Error('sync http ' + res.status);
    const record = await res.json();
    // Le serveur détenait une version plus récente : on l'adopte
    if (record && Number(record.rev) > revRef.current) applyRemote(record);
    else dirtyRef.current = false;
  };

  const pullNow = async () => {
    const res = await fetch(`${SYNC_URL}?code=${encodeURIComponent(sync.code)}`);
    if (!res.ok) throw new Error('sync http ' + res.status);
    const record = await res.json();
    if (record && Number(record.rev) > revRef.current) applyRemote(record);
  };

  // Boucle de synchronisation périodique quand le partage est actif
  useEffect(() => {
    if (!sync.enabled || !sync.code) return;
    let stopped = false;

    const tick = async () => {
      try {
        if (dirtyRef.current) await pushNow();
        else await pullNow();
        if (!stopped) setSync((s) => (s.status === 'synced' ? s : { ...s, status: 'synced' }));
      } catch {
        if (!stopped) setSync((s) => (s.status === 'offline' ? s : { ...s, status: 'offline' }));
      }
    };

    tick();
    const id = setInterval(tick, 4000);
    return () => { stopped = true; clearInterval(id); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sync.enabled, sync.code]);

  // Active le partage : rejoint le code (adopte l'existant, sinon envoie l'état local)
  const connectSync = async (code) => {
    const trimmed = (code || '').trim();
    if (!trimmed) return { ok: false, error: 'Code requis' };
    setSync({ enabled: true, code: trimmed, status: 'connecting' });
    try {
      const res = await fetch(`${SYNC_URL}?code=${encodeURIComponent(trimmed)}`);
      if (!res.ok) throw new Error('http ' + res.status);
      const record = await res.json();
      if (record && Number(record.rev) >= revRef.current) {
        applyRemote(record); // rejoindre une famille existante
      } else {
        dirtyRef.current = true; // pas de données distantes : on enverra les nôtres
      }
      setSync({ enabled: true, code: trimmed, status: 'synced' });
      return { ok: true };
    } catch {
      // Le partage reste activé mais hors ligne (ex. non déployé sur Netlify)
      setSync({ enabled: true, code: trimmed, status: 'offline' });
      return { ok: false, error: 'Service de synchronisation injoignable (disponible une fois l’app déployée sur Netlify).' };
    }
  };

  const disconnectSync = () => setSync({ enabled: false, code: '', status: 'idle' });

  const memberById = (id) => data.members.find((m) => m.id === id);

  const value = {
    ...data,
    memberById,
    addMember, updateMember, removeMember,
    addShopping, toggleShopping, removeShopping, clearShoppingDone,
    addEvent, updateEvent, removeEvent,
    addTodo, toggleTodo, updateTodo, removeTodo,
    setMeal, clearMenus, generateShoppingFromMenus,
    addNote, removeNote,
    addRecipe, removeRecipe, addRecipeToShopping,
    addBirthday, removeBirthday,
    setWellbeing,
    resetData,
    sync, connectSync, disconnectSync,
  };

  return <FamilyContext.Provider value={value}>{children}</FamilyContext.Provider>;
}

export const useFamily = () => useContext(FamilyContext);
