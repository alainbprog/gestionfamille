// Fonction serverless : interprète une phrase dictée (commande vocale) et la
// transforme en actions structurées pour l'app (tâche, rendez-vous, course,
// anniversaire, note). Utilise Google Gemini (texte) — clé GEMINI_API_KEY.

const MODELE = "gemini-3.8-flash";

const SCHEMA = {
  type: "OBJECT",
  properties: {
    actions: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          type: { type: "STRING", enum: ["tache", "rendezvous", "course", "anniversaire", "note"] },
          texte: { type: "STRING" },
          date: { type: "STRING" },      // YYYY-MM-DD ou ""
          heure: { type: "STRING" },     // HH:MM ou ""
          lieu: { type: "STRING" },      // ou ""
          quantite: { type: "INTEGER" }, // courses, défaut 1
          priorite: { type: "STRING", enum: ["basse", "normale", "haute"] }
        },
        required: ["type", "texte", "date", "heure", "lieu", "quantite", "priorite"],
        propertyOrdering: ["type", "texte", "date", "heure", "lieu", "quantite", "priorite"]
      }
    },
    resume: { type: "STRING" }
  },
  required: ["actions", "resume"],
  propertyOrdering: ["actions", "resume"]
};

const systeme = (dateDuJour) => `Tu transformes une phrase dictée par un membre d'une famille en actions pour une application d'organisation familiale.
Aujourd'hui = ${dateDuJour} (format AAAA-MM-JJ). Utilise cette date pour résoudre « aujourd'hui », « demain », « lundi prochain », « le 12 mars », etc. Si une année n'est pas précisée, choisis l'occurrence à venir la plus proche.
Classe chaque élément dans le bon type :
- "tache" : une chose à faire (corvée, rappel d'action). texte = l'action. priorite si exprimée (sinon "normale"). date = échéance si donnée, sinon "".
- "rendezvous" : un évènement daté (médecin, réunion, sortie). texte = le titre court. date = jour (obligatoire, déduis-la). heure = HH:MM si donnée. lieu si donné.
- "course" : un article à acheter. UNE action par article. texte = le nom de l'article. quantite si donnée (sinon 1).
- "anniversaire" : texte = le prénom/nom de la personne. date = sa date (AAAA-MM-JJ, mets une année plausible si l'âge est donné, sinon l'année courante).
- "note" : une idée/information à garder. texte = le contenu.
Une même phrase peut contenir plusieurs actions (ex. « ajoute du lait et du pain aux courses » = 2 courses). Remplis TOUJOURS tous les champs (met "" ou 1 quand non pertinent). Mets la date au format AAAA-MM-JJ et l'heure au format HH:MM. Réponds en français. Si rien n'est compréhensible, renvoie actions: [] et explique dans resume.`;

exports.handler = async (event) => {
  const rep = (code, obj) => ({ statusCode: code, headers: { "Content-Type": "application/json" }, body: JSON.stringify(obj) });
  if (event.httpMethod !== "POST") return rep(405, { erreur: "methode" });

  const cle = process.env.GEMINI_API_KEY;
  if (!cle) return rep(500, { erreur: "cle_manquante", message: "GEMINI_API_KEY absente." });

  let texte, date;
  try { ({ texte, date } = JSON.parse(event.body || "{}")); } catch { return rep(400, { erreur: "corps" }); }
  if (!texte || typeof texte !== "string") return rep(400, { erreur: "texte_manquant" });
  const dateDuJour = (typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)) ? date : new Date().toISOString().slice(0, 10);

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODELE}:generateContent`;
    const r = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json", "x-goog-api-key": cle },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systeme(dateDuJour) }] },
        contents: [{ role: "user", parts: [{ text: texte }] }],
        generationConfig: { temperature: 0.1, responseMimeType: "application/json", responseSchema: SCHEMA }
      })
    });
    if (!r.ok) {
      const detail = await r.text();
      return rep(502, { erreur: "api_erreur", statut: r.status, detail: detail.slice(0, 500) });
    }
    const donnees = await r.json();
    const cand = donnees.candidates && donnees.candidates[0];
    if (!cand || !cand.content || !cand.content.parts) return rep(502, { erreur: "reponse_vide" });
    const out = cand.content.parts.map((p) => p.text).filter(Boolean).join("");
    let resultat;
    try { resultat = JSON.parse(out); } catch { return rep(502, { erreur: "parse", brut: out.slice(0, 500) }); }
    return rep(200, resultat);
  } catch (e) {
    return rep(500, { erreur: "exception", message: String(e && e.message ? e.message : e) });
  }
};
