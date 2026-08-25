import { createContext, useContext, useEffect, useRef, useState } from 'react';

const FamilyContext = createContext();

const STORAGE_KEY = 'tribu-data-v1';
const REV_KEY = 'tribu-rev-v1';
const SYNC_KEY = 'tribu-sync-v1';
const SYNC_URL = '/.netlify/functions/sync';

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

// Palette de couleurs proposées pour les membres de la famille
export const MEMBER_COLORS = [
  '#6366f1', '#ec4899', '#f59e0b', '#10b981',
  '#3b82f6', '#ef4444', '#8b5cf6', '#14b8a6',
];

export const SHOPPING_CATEGORIES = [
  { key: 'fruits', label: 'Fruits & Légumes', emoji: '🥦' },
  { key: 'frais', label: 'Produits frais', emoji: '🧀' },
  { key: 'epicerie', label: 'Épicerie', emoji: '🥫' },
  { key: 'boissons', label: 'Boissons', emoji: '🧃' },
  { key: 'hygiene', label: 'Hygiène & Maison', emoji: '🧼' },
  { key: 'autre', label: 'Autre', emoji: '🛒' },
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
  recipes: [], // { id, title, ingredients, steps }
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

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultData;
    return { ...defaultData, ...JSON.parse(raw) };
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
  const addNote = (text) =>
    update('notes', (list) => [{ id: uid(), text, createdAt: Date.now() }, ...list]);
  const removeNote = (id) => update('notes', (list) => list.filter((n) => n.id !== id));

  // --- Recettes ---
  const addRecipe = (r) =>
    update('recipes', (list) => [{ id: uid(), title: '', ingredients: '', steps: '', ...r }, ...list]);
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
