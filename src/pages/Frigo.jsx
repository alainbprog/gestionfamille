import { useMemo, useRef, useState } from 'react';
import { Camera, Mic, Plus, X, Trash2, ShoppingCart, ChefHat, Loader2, Sparkles } from 'lucide-react';
import { useFamily, MEAL_TYPES } from '../context/FamilyContext';

/* --------------------------------------------------------------------------
   Reconnaissance photo : modèle COCO-SSD chargé à la volée depuis un CDN,
   exécuté 100% sur l'appareil (aucune image envoyée sur un serveur, gratuit).
   -------------------------------------------------------------------------- */
let detectorPromise = null;
function addScript(src) {
  return new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = src;
    s.async = true;
    s.onload = res;
    s.onerror = () => rej(new Error('script ' + src));
    document.head.appendChild(s);
  });
}
function loadDetector() {
  if (detectorPromise) return detectorPromise;
  detectorPromise = (async () => {
    if (!window.cocoSsd) {
      if (!window.tf) await addScript('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js');
      await addScript('https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd@2.2.3/dist/coco-ssd.min.js');
    }
    return window.cocoSsd.load();
  })().catch((e) => { detectorPromise = null; throw e; });
  return detectorPromise;
}

// Étiquettes COCO (anglais) comestibles → ingrédient en français
const COCO_FR = {
  banana: 'banane', apple: 'pomme', orange: 'orange', broccoli: 'brocoli',
  carrot: 'carotte', sandwich: 'sandwich', pizza: 'pizza',
  'hot dog': 'saucisse', donut: 'beignet', cake: 'gâteau',
};

// Mots à ignorer dans la dictée vocale
const STOP = new Set(['et', 'des', 'de', 'du', 'la', 'le', 'les', 'un', 'une', 'ai', 'jai',
  'il', 'y', 'a', 'dans', 'mon', 'ma', 'mes', 'frigo', 'frigidaire', 'reste', 'reste', 'avec',
  'aussi', 'encore', 'quelques', 'peu', 'au', 'aux', 'ou']);

// Normalisation pour comparer ingrédients (sans accents, minuscule, singulier)
const norm = (s) => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim().replace(/s$/, '');
const normWords = (s) => norm(s).split(/[^a-z0-9]+/).filter((w) => w.length >= 3);

export default function Frigo() {
  const { recipes, addShopping } = useFamily();
  const [items, setItems] = useState([]); // ingrédients détectés / dictés / saisis
  const [manual, setManual] = useState('');
  const [photo, setPhoto] = useState('');
  const [detecting, setDetecting] = useState(false);
  const [listening, setListening] = useState(false);
  const [note, setNote] = useState('');
  const fileRef = useRef(null);
  const recRef = useRef(null);

  const speechOK = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);

  const addItems = (names) => {
    setItems((prev) => {
      const seen = new Set(prev.map((i) => norm(i)));
      const next = [...prev];
      names.forEach((n) => {
        const name = (n || '').trim();
        if (name && !seen.has(norm(name))) { seen.add(norm(name)); next.push(name); }
      });
      return next;
    });
  };
  const removeItem = (name) => setItems((prev) => prev.filter((i) => i !== name));

  // --- Photo ---
  const onPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPhoto(url);
    setNote('');
    setDetecting(true);
    try {
      const model = await loadDetector();
      const img = new Image();
      img.src = url;
      await img.decode();
      const preds = await model.detect(img);
      const found = [];
      preds.forEach((p) => {
        if (p.score >= 0.5 && COCO_FR[p.class]) found.push(COCO_FR[p.class]);
      });
      if (found.length) { addItems(found); setNote(`${new Set(found).size} aliment(s) reconnu(s) 📷 — complète si besoin.`); }
      else setNote("Rien reconnu automatiquement sur la photo. Ajoute à la voix 🎤 ou à la main ✍️.");
    } catch {
      setNote("Détection indisponible (hors-ligne ?). Ajoute à la voix 🎤 ou à la main ✍️.");
    } finally {
      setDetecting(false);
    }
  };

  // --- Micro ---
  const toggleMic = () => {
    if (!speechOK) return;
    if (listening) { recRef.current?.stop(); return; }
    const Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new Rec();
    rec.lang = 'fr-FR';
    rec.continuous = false;
    rec.interimResults = false;
    rec.onresult = (ev) => {
      const text = Array.from(ev.results).map((r) => r[0].transcript).join(' ');
      const parts = text
        .toLowerCase()
        .split(/[,;\n]|\bet\b/)
        .flatMap((chunk) => {
          const words = chunk.split(/\s+/).map((w) => w.replace(/[^a-zàâäéèêëïîôöùûüç'-]/gi, '')).filter(Boolean);
          const kept = words.filter((w) => !STOP.has(w.replace(/'/g, '')));
          return kept.length ? [kept.join(' ')] : [];
        })
        .map((s) => s.trim())
        .filter(Boolean);
      if (parts.length) { addItems(parts); setNote(`Ajouté par la voix 🎤 : ${parts.join(', ')}`); }
    };
    rec.onerror = () => { setNote("Micro indisponible ou refusé. Essaie la saisie ✍️."); setListening(false); };
    rec.onend = () => setListening(false);
    recRef.current = rec;
    setListening(true);
    setNote('🎤 Parle maintenant : « j’ai des courgettes, des tomates et des œufs… »');
    try { rec.start(); } catch { setListening(false); }
  };

  // --- Saisie manuelle ---
  const submitManual = (e) => {
    e.preventDefault();
    const v = manual.trim();
    if (!v) return;
    addItems(v.split(/[,\n]/).map((s) => s.trim()).filter(Boolean));
    setManual('');
  };

  const clearAll = () => { setItems([]); setPhoto(''); setNote(''); };

  // --- Moteur de recettes : classe par nb d'ingrédients déjà disponibles ---
  const results = useMemo(() => {
    if (!items.length) return [];
    const have = items;
    const ingMatches = (ing) => {
      const iw = normWords(ing);
      return have.some((h) => {
        const hw = norm(h);
        return hw.length >= 3 && iw.some((w) => w === hw || w.startsWith(hw) || hw.startsWith(w));
      });
    };
    return recipes
      .map((r) => {
        const list = (r.ingredients || '').split(/[,\n]/).map((s) => s.trim()).filter(Boolean);
        if (!list.length) return null;
        const matched = list.filter(ingMatches);
        const missing = list.filter((i) => !ingMatches(i));
        return { recipe: r, total: list.length, matched, missing, ratio: matched.length / list.length };
      })
      .filter((x) => x && x.matched.length > 0)
      .sort((a, b) => b.matched.length - a.matched.length || b.ratio - a.ratio)
      .slice(0, 20);
  }, [items, recipes]);

  const mealInfo = (key) => MEAL_TYPES.find((m) => m.key === key);

  const addMissing = (missing) => {
    missing.forEach((name) => addShopping({ name }));
    setNote(`${missing.length} ingrédient(s) manquant(s) ajouté(s) aux courses ✅`);
    setTimeout(() => setNote(''), 3500);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold flex items-center gap-2">
          <span aria-hidden>🧊</span> Mon frigo
        </h1>
        {items.length > 0 && (
          <button onClick={clearAll} className="text-ink/40 hover:text-red-500 transition" aria-label="Tout effacer">
            <Trash2 size={20} />
          </button>
        )}
      </div>

      <p className="text-sm text-ink/60 -mt-2">
        Dis ou photographie ce que tu as, je te propose des recettes rapides et simples.
      </p>

      {/* Boutons d'entrée */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => fileRef.current?.click()}
          disabled={detecting}
          className="card p-4 flex flex-col items-center gap-2 active:scale-95 transition disabled:opacity-60"
        >
          {detecting ? <Loader2 size={26} className="text-brand-600 animate-spin" /> : <Camera size={26} className="text-brand-600" />}
          <span className="font-bold text-sm">{detecting ? 'Analyse…' : 'Photo du frigo'}</span>
        </button>
        <button
          onClick={toggleMic}
          disabled={!speechOK}
          className={`card p-4 flex flex-col items-center gap-2 active:scale-95 transition disabled:opacity-50 ${listening ? 'ring-2 ring-brand-400' : ''}`}
        >
          <Mic size={26} className={listening ? 'text-red-500 animate-pulse' : 'text-brand-600'} />
          <span className="font-bold text-sm">{listening ? 'J’écoute…' : speechOK ? 'Dire à la voix' : 'Voix indispo.'}</span>
        </button>
      </div>
      <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={onPhoto} className="hidden" />

      {photo && (
        <img src={photo} alt="Frigo" className="w-full max-h-52 object-cover rounded-2xl" />
      )}

      {note && <div className="p-3 rounded-2xl bg-brand-50 text-brand-700 text-sm font-semibold">{note}</div>}

      {/* Saisie manuelle */}
      <form onSubmit={submitManual} className="flex gap-2">
        <input
          className="input"
          placeholder="Ajouter un aliment (ex. courgette)…"
          value={manual}
          onChange={(e) => setManual(e.target.value)}
        />
        <button type="submit" className="btn-primary shrink-0" aria-label="Ajouter"><Plus size={18} /></button>
      </form>

      {/* Chips d'ingrédients */}
      {items.length > 0 && (
        <div>
          <h2 className="font-bold text-sm text-ink/60 mb-2">Dans mon frigo</h2>
          <div className="flex flex-wrap gap-2">
            {items.map((i) => (
              <span key={i} className="inline-flex items-center gap-1 bg-brand-100 text-brand-700 rounded-full pl-3 pr-2 py-1.5 text-sm font-semibold">
                {i}
                <button onClick={() => removeItem(i)} className="hover:text-red-500" aria-label={`Retirer ${i}`}><X size={14} /></button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Résultats */}
      {items.length > 0 && (
        <div>
          <h2 className="font-extrabold text-lg flex items-center gap-2 mb-3">
            <Sparkles size={18} className="text-brand-500" />
            {results.length ? `${results.length} idée(s) recette(s)` : 'Aucune recette trouvée'}
          </h2>

          {results.length === 0 ? (
            <div className="text-center py-10 text-ink/40">
              <ChefHat size={40} className="mx-auto mb-3 opacity-40" />
              <p className="text-sm">Ajoute quelques aliments de plus pour voir des idées.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {results.map(({ recipe: r, total, matched, missing }) => {
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
                        <h3 className="font-extrabold text-lg leading-tight">{r.title}</h3>
                      </div>
                      <span className="shrink-0 text-xs font-bold bg-green-100 text-green-700 rounded-full px-2 py-1">
                        {matched.length}/{total}
                      </span>
                    </div>

                    <p className="text-sm text-ink/70 mt-2">
                      <b className="text-green-600">✓ Tu as :</b> {matched.join(', ')}
                    </p>
                    {missing.length > 0 && (
                      <p className="text-sm text-ink/50 mt-1">
                        <b>À prévoir :</b> {missing.join(', ')}
                      </p>
                    )}
                    {r.steps && <p className="text-sm text-ink/60 mt-2 whitespace-pre-wrap">{r.steps}</p>}

                    {missing.length > 0 && (
                      <button onClick={() => addMissing(missing)} className="btn-ghost mt-3 text-sm py-2">
                        <ShoppingCart size={16} /> Ajouter le manquant aux courses
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      {items.length === 0 && (
        <div className="text-center py-12 text-ink/40">
          <span className="text-5xl" aria-hidden>🥦</span>
          <p className="font-semibold mt-3">Ton frigo est vide ici</p>
          <p className="text-sm">Prends une photo, dicte, ou saisis tes aliments pour commencer.</p>
        </div>
      )}
    </div>
  );
}
