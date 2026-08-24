import { createContext, useContext, useEffect, useState } from 'react';

const FamilyContext = createContext();

const STORAGE_KEY = 'tribu-data-v1';

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

const defaultData = {
  members: [
    { id: 'm1', name: 'Maman', role: 'Parent', color: '#ec4899', emoji: '👩', birthdate: '' },
    { id: 'm2', name: 'Papa', role: 'Parent', color: '#3b82f6', emoji: '👨', birthdate: '' },
  ],
  shopping: [],
  events: [],
  todos: [],
};

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultData;
    return { ...defaultData, ...JSON.parse(raw) };
  } catch {
    return defaultData;
  }
}

export function FamilyProvider({ children }) {
  const [data, setData] = useState(load);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      /* stockage indisponible (navigation privée) — on ignore */
    }
  }, [data]);

  const update = (key, updater) =>
    setData((d) => ({ ...d, [key]: updater(d[key]) }));

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
    update('todos', (list) => [{ id: uid(), done: false, priority: 'normale', memberId: null, due: '', ...t }, ...list]);
  const toggleTodo = (id) =>
    update('todos', (list) => list.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  const updateTodo = (id, patch) =>
    update('todos', (list) => list.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  const removeTodo = (id) =>
    update('todos', (list) => list.filter((t) => t.id !== id));

  const memberById = (id) => data.members.find((m) => m.id === id);

  const value = {
    ...data,
    memberById,
    addMember, updateMember, removeMember,
    addShopping, toggleShopping, removeShopping, clearShoppingDone,
    addEvent, updateEvent, removeEvent,
    addTodo, toggleTodo, updateTodo, removeTodo,
  };

  return <FamilyContext.Provider value={value}>{children}</FamilyContext.Provider>;
}

export const useFamily = () => useContext(FamilyContext);
