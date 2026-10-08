// Fonction serverless Netlify : analyse une photo d'assiette avec Google Gemini (vision)
// et renvoie les aliments détectés + estimations nutritionnelles.
// La clé n'est JAMAIS exposée au navigateur : variable d'environnement GEMINI_API_KEY
// (Netlify > Site settings > Environment variables). Clé gratuite : https://aistudio.google.com/apikey

const MODELE = "gemini-3.8-flash"; // vision + palier gratuit (2.5-flash retiré pour les nouveaux comptes)

// Schéma de sortie structurée (format Gemini : types en MAJUSCULES)
const SCHEMA = {
  type: "OBJECT",
  properties: {
    aliments: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          nom: { type: "STRING" },
          emoji: { type: "STRING" },
          quantite_g: { type: "INTEGER" },
          kcal: { type: "INTEGER" },
          glucides_g: { type: "NUMBER" },
          proteines_g: { type: "NUMBER" },
          lipides_g: { type: "NUMBER" },
          fibres_g: { type: "NUMBER" },
          confiance: { type: "STRING", enum: ["haute", "moyenne", "faible"] }
        },
        required: ["nom", "emoji", "quantite_g", "kcal", "glucides_g", "proteines_g", "lipides_g", "fibres_g", "confiance"],
        propertyOrdering: ["nom", "emoji", "quantite_g", "kcal", "glucides_g", "proteines_g", "lipides_g", "fibres_g", "confiance"]
      }
    },
    commentaire: { type: "STRING" }
  },
  required: ["aliments", "commentaire"],
  propertyOrdering: ["aliments", "commentaire"]
};

const SYSTEME = `Tu es un nutritionniste expert en analyse d'images de repas. On te donne une photo d'une assiette / d'un repas.
Identifie chaque aliment visible et estime, pour la portion réellement présente sur la photo :
- la quantité en grammes (quantite_g),
- les calories (kcal),
- les macronutriments en grammes : glucides, protéines, lipides, fibres.
Choisis un emoji représentatif pour chaque aliment.
Indique ta confiance (haute / moyenne / faible) selon la clarté de la photo.
Sois réaliste sur les portions. Regroupe les aliments identiques. Si l'image ne contient pas de nourriture identifiable, renvoie une liste vide (aliments: []) et explique-le dans commentaire.
Réponds en français.`;

exports.handler = async (event) => {
  const reponse = (code, obj) => ({
    statusCode: code,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(obj)
  });

  if (event.httpMethod !== "POST") return reponse(405, { erreur: "Méthode non autorisée" });

  const cle = process.env.GEMINI_API_KEY;
  if (!cle) {
    return reponse(500, {
      erreur: "cle_manquante",
      message: "La clé Gemini n'est pas configurée. Ajoute GEMINI_API_KEY dans les variables d'environnement Netlify."
    });
  }

  let image;
  try {
    ({ image } = JSON.parse(event.body || "{}"));
  } catch (e) {
    return reponse(400, { erreur: "corps_invalide", message: "JSON invalide." });
  }
  if (!image || typeof image !== "string") {
    return reponse(400, { erreur: "image_manquante", message: "Aucune image reçue." });
  }

  const m = image.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!m) return reponse(400, { erreur: "format_image", message: "Format d'image non reconnu (dataURL base64 attendu)." });
  const mimeType = m[1];
  const data = m[2];

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODELE}:generateContent`;
    const corps = JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEME }] },
      contents: [
        {
          role: "user",
          parts: [
            { inline_data: { mime_type: mimeType, data } },
            { text: "Analyse cette assiette et renvoie les aliments détectés avec leurs estimations nutritionnelles." }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: "application/json",
        responseSchema: SCHEMA
      }
    });
    // Réessais uniquement sur surcharge temporaire (503). Le 429 (quota gratuit
    // épuisé : 5 req/min) demande ~30 s d'attente → on ne réessaie pas.
    let r, detail = "";
    for (let essai = 0; essai < 4; essai++) {
      r = await fetch(url, { method: "POST", headers: { "content-type": "application/json", "x-goog-api-key": cle }, body: corps });
      if (r.ok) break;
      detail = await r.text();
      if (r.status !== 503) break;
      if (essai < 3) await new Promise((res) => setTimeout(res, 1200 * (essai + 1)));
    }

    if (!r.ok) {
      if (r.status === 429) return reponse(429, { erreur: "quota", message: "Limite gratuite Gemini atteinte (5/min). Réessaie dans ~30 secondes." });
      return reponse(502, { erreur: "api_erreur", message: "Erreur de l'API Gemini.", statut: r.status, detail: detail.slice(0, 500) });
    }

    const donnees = await r.json();

    if (donnees.promptFeedback && donnees.promptFeedback.blockReason) {
      return reponse(200, { aliments: [], commentaire: "L'analyse de cette image a été bloquée (" + donnees.promptFeedback.blockReason + ")." });
    }

    const cand = donnees.candidates && donnees.candidates[0];
    if (!cand || !cand.content || !cand.content.parts) {
      return reponse(502, { erreur: "reponse_vide", message: "Réponse Gemini vide.", finish: cand && cand.finishReason });
    }

    const texte = cand.content.parts.map((p) => p.text).filter(Boolean).join("");
    let resultat;
    try {
      resultat = JSON.parse(texte);
    } catch (e) {
      return reponse(502, { erreur: "parse", message: "Réponse Gemini illisible.", brut: (texte || "").slice(0, 500) });
    }

    return reponse(200, resultat);
  } catch (e) {
    return reponse(500, { erreur: "exception", message: String(e && e.message ? e.message : e) });
  }
};
