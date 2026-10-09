// 40 étirements classés par zone du corps, avec une illustration schématique
// (SVG, silhouette simple) — libre de droits, générée dans l'app.

export const ZONES = [
  { key: 'cou', label: 'Cou', emoji: '🙆' },
  { key: 'epaules', label: 'Épaules & bras', emoji: '💪' },
  { key: 'dos', label: 'Dos', emoji: '🧘' },
  { key: 'buste', label: 'Buste & côtés', emoji: '↔️' },
  { key: 'hanches', label: 'Hanches & fessiers', emoji: '🍑' },
  { key: 'jambes', label: 'Jambes', emoji: '🦵' },
  { key: 'chevilles', label: 'Chevilles & pieds', emoji: '🦶' },
  { key: 'global', label: 'Corps entier & détente', emoji: '✨' },
];

const C = '#6d5ca6';   // couleur de la silhouette
const A = '#e3884a';   // accent (flèches / direction)
const head = (x, y, r = 8) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${C}" stroke="none"/>`;
const fig = (p) => `<rect x="3" y="3" width="114" height="114" rx="18" fill="#f1edfb"/><g fill="none" stroke="${C}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">${p}</g>`;
const legs = '<path d="M60 72 L50 104"/><path d="M60 72 L70 104"/>';
const armsDown = '<path d="M60 42 L46 62"/><path d="M60 42 L74 62"/>';
const spine = '<path d="M60 30 V72"/>';

export const EXERCISES = [
  // ---------------- Cou ----------------
  { id: 'cou1', zone: 'cou', name: 'Inclinaison du cou', duree: '20–30 s / côté',
    consigne: 'Penchez l’oreille vers l’épaule, épaules relâchées.',
    svg: fig(head(70, 24) + '<path d="M60 34 L66 28"/><path d="M60 34 V72"/>' + '<path d="M60 44 L46 62"/><path d="M60 44 L74 62"/>' + legs) },
  { id: 'cou2', zone: 'cou', name: 'Rotation du cou', duree: '20 s / côté',
    consigne: 'Tournez lentement le menton vers l’épaule.',
    svg: fig(head(60, 22) + '<path d="M66 22 H76" stroke="' + A + '" stroke-width="3"/>' + spine + armsDown + legs) },
  { id: 'cou3', zone: 'cou', name: 'Flexion du cou', duree: '20–30 s',
    consigne: 'Menton vers la poitrine, relâchez la nuque.',
    svg: fig(head(61, 28) + '<path d="M60 36 V72"/><path d="M60 46 L46 64"/><path d="M60 46 L74 64"/>' + legs) },
  { id: 'cou4', zone: 'cou', name: 'Extension du cou', duree: '10–15 s',
    consigne: 'Regardez doucement vers le plafond, sans forcer.',
    svg: fig(head(58, 20) + '<path d="M54 18 H44" stroke="' + A + '" stroke-width="3"/>' + spine + armsDown + legs) },

  // ---------------- Épaules & bras ----------------
  { id: 'ep1', zone: 'epaules', name: 'Épaule croisée', duree: '20–30 s / bras',
    consigne: 'Tirez le bras tendu en travers de la poitrine.',
    svg: fig(head(60, 22) + spine + '<path d="M62 40 L34 50"/><path d="M60 46 L48 54"/>' + legs) },
  { id: 'ep2', zone: 'epaules', name: 'Triceps', duree: '20–30 s / bras',
    consigne: 'Coude plié derrière la tête, poussez doucement le coude.',
    svg: fig(head(60, 24) + '<path d="M60 32 V72"/><path d="M60 42 L54 30 L66 26"/><path d="M60 44 L74 60"/>' + legs) },
  { id: 'ep3', zone: 'epaules', name: 'Poignets (face interne)', duree: '15–20 s',
    consigne: 'Bras tendu, tirez les doigts vers vous, paume en avant.',
    svg: fig(head(60, 22) + spine + '<path d="M60 40 L96 40"/><path d="M96 40 L96 30"/><path d="M60 46 L82 50"/>' + legs) },
  { id: 'ep4', zone: 'epaules', name: 'Poignets (face externe)', duree: '15–20 s',
    consigne: 'Bras tendu, main vers le bas, tirez doucement.',
    svg: fig(head(60, 22) + spine + '<path d="M60 40 L96 44"/><path d="M96 44 L96 54"/><path d="M60 46 L82 52"/>' + legs) },
  { id: 'ep5', zone: 'epaules', name: 'Cercles d’épaules', duree: '30 s',
    consigne: 'Roulez les épaules en grands cercles, lentement.',
    svg: fig(head(60, 22) + spine + legs + '<circle cx="44" cy="40" r="8" stroke="' + A + '" stroke-width="3" fill="none"/><circle cx="76" cy="40" r="8" stroke="' + A + '" stroke-width="3" fill="none"/>') },
  { id: 'ep6', zone: 'epaules', name: 'Ouverture de la poitrine', duree: '20–30 s',
    consigne: 'Mains jointes derrière le dos, ouvrez la poitrine.',
    svg: fig(head(60, 22) + spine + '<path d="M60 40 L44 56"/><path d="M60 40 L76 56"/><path d="M44 56 L76 56"/>' + legs) },

  // ---------------- Dos ----------------
  { id: 'dos1', zone: 'dos', name: 'Chat-vache', duree: '30–45 s',
    consigne: 'À quatre pattes, arrondissez puis creusez le dos.',
    svg: fig(head(30, 64) + '<path d="M38 62 Q60 44 82 62"/><path d="M40 62 L38 98"/><path d="M80 62 L84 98"/>') },
  { id: 'dos2', zone: 'dos', name: 'Posture de l’enfant', duree: '30–60 s',
    consigne: 'Assis sur les talons, bras tendus devant, front au sol.',
    svg: fig(head(30, 76) + '<path d="M38 76 L84 70"/><path d="M38 76 L20 82"/><path d="M84 70 L92 88"/><path d="M84 70 L74 88"/>') },
  { id: 'dos3', zone: 'dos', name: 'Torsion assise', duree: '20–30 s / côté',
    consigne: 'Assis, tournez le buste, main en appui derrière.',
    svg: fig(head(58, 26) + '<path d="M60 34 V66"/><path d="M60 66 L40 72 L30 70"/><path d="M60 66 L74 70 L70 58"/><path d="M60 44 L78 50"/><path d="M60 44 L50 54"/>') },
  { id: 'dos4', zone: 'dos', name: 'Genoux à la poitrine', duree: '30 s',
    consigne: 'Allongé sur le dos, ramenez les genoux sur la poitrine.',
    svg: fig(head(24, 80) + '<path d="M32 80 H60"/><path d="M60 80 L74 66"/><path d="M74 66 L60 62"/><path d="M48 80 L62 70"/>') },
  { id: 'dos5', zone: 'dos', name: 'Cobra', duree: '15–20 s',
    consigne: 'À plat ventre, poussez sur les mains, buste vers le haut.',
    svg: fig(head(34, 52) + '<path d="M40 56 Q66 66 98 84"/><path d="M46 60 L46 86"/>') },
  { id: 'dos6', zone: 'dos', name: 'Grand dorsal', duree: '20–30 s / côté',
    consigne: 'Un bras au-dessus, inclinez le buste sur le côté.',
    svg: fig(head(66, 24) + '<path d="M60 32 Q66 52 74 72"/><path d="M60 36 L40 20"/><path d="M74 72 L66 104"/><path d="M74 72 L82 104"/>') },

  // ---------------- Buste & côtés ----------------
  { id: 'bu1', zone: 'buste', name: 'Inclinaison latérale', duree: '20–30 s / côté',
    consigne: 'Debout, un bras au-dessus, penchez-vous sur le côté.',
    svg: fig(head(64, 24) + '<path d="M60 32 Q64 52 70 72"/><path d="M60 36 L42 22"/><path d="M60 42 L68 56"/><path d="M70 72 L62 104"/><path d="M70 72 L80 104"/>') },
  { id: 'bu2', zone: 'buste', name: 'Torsion debout', duree: '20 s / côté',
    consigne: 'Pieds fixes, tournez le buste doucement de chaque côté.',
    svg: fig(head(60, 22) + spine + '<path d="M60 42 L82 50"/><path d="M60 42 L78 38"/>' + legs) },
  { id: 'bu3', zone: 'buste', name: 'Arrondi du haut du dos', duree: '20–30 s',
    consigne: 'Bras tendus devant, mains jointes, arrondissez le dos.',
    svg: fig(head(56, 28) + '<path d="M60 36 Q54 50 60 72"/><path d="M58 44 L90 48"/><path d="M58 44 L90 40"/>' + legs) },

  // ---------------- Hanches & fessiers ----------------
  { id: 'ha1', zone: 'hanches', name: 'Fente basse', duree: '30 s / côté',
    consigne: 'Genou arrière au sol, poussez le bassin vers l’avant.',
    svg: fig(head(66, 30) + '<path d="M64 38 V66"/><path d="M64 66 L84 78 L84 100"/><path d="M64 66 L40 92 L28 100"/><path d="M64 46 L74 58"/><path d="M64 46 L56 60"/>') },
  { id: 'ha2', zone: 'hanches', name: 'Pigeon', duree: '30 s / côté',
    consigne: 'Jambe avant pliée au sol, jambe arrière tendue.',
    svg: fig(head(44, 40) + '<path d="M46 48 L54 70"/><path d="M54 70 L34 76 L30 70"/><path d="M54 70 L94 90"/><path d="M48 52 L40 66"/>') },
  { id: 'ha3', zone: 'hanches', name: 'Figure 4 (allongé)', duree: '30 s / côté',
    consigne: 'Allongé, cheville sur le genou, tirez la cuisse vers vous.',
    svg: fig(head(22, 82) + '<path d="M30 82 H58"/><path d="M58 82 L66 64"/><path d="M66 64 L54 70"/><path d="M50 76 L68 68"/><path d="M44 82 L60 72"/>') },
  { id: 'ha4', zone: 'hanches', name: 'Papillon', duree: '30–45 s',
    consigne: 'Assis, plantes de pieds jointes, genoux vers le sol.',
    svg: fig(head(60, 30) + '<path d="M60 38 V62"/><path d="M60 62 L40 78 L60 74"/><path d="M60 62 L80 78 L60 74"/><path d="M60 48 L48 66"/><path d="M60 48 L72 66"/>') },
  { id: 'ha5', zone: 'hanches', name: 'Fessier assis', duree: '30 s / côté',
    consigne: 'Assis, cheville sur le genou opposé, penchez-vous.',
    svg: fig(head(58, 28) + '<path d="M60 36 Q56 48 60 60"/><path d="M60 60 L84 60 L84 86"/><path d="M60 60 L70 54 L82 62"/><path d="M60 46 L74 56"/>') },
  { id: 'ha6', zone: 'hanches', name: 'Psoas (fléchisseurs)', duree: '30 s / côté',
    consigne: 'Fente genou au sol, bassin en avant, buste droit.',
    svg: fig(head(64, 26) + '<path d="M62 34 V64"/><path d="M62 64 L82 76 L82 100"/><path d="M62 64 L40 90 L28 98"/><path d="M62 38 L70 22"/><path d="M62 38 L54 22"/>') },

  // ---------------- Jambes ----------------
  { id: 'ja1', zone: 'jambes', name: 'Ischios debout', duree: '20–30 s',
    consigne: 'Debout, penchez-vous vers les pieds, jambes tendues.',
    svg: fig(head(44, 84) + '<path d="M60 66 Q50 80 46 86"/><path d="M60 66 L52 104"/><path d="M60 66 L68 104"/><path d="M48 84 L52 102"/>') },
  { id: 'ja2', zone: 'jambes', name: 'Ischios assis', duree: '30 s',
    consigne: 'Assis jambes tendues, attrapez les orteils.',
    svg: fig(head(42, 60) + '<path d="M40 74 L92 78"/><path d="M40 74 Q44 64 50 60"/><path d="M50 62 L74 76"/>') },
  { id: 'ja3', zone: 'jambes', name: 'Quadriceps debout', duree: '20–30 s / jambe',
    consigne: 'Talon vers la fesse, genoux serrés, bassin droit.',
    svg: fig(head(60, 22) + '<path d="M60 30 V70"/><path d="M60 70 L58 104"/><path d="M60 70 L72 84 L60 78"/><path d="M60 44 L72 78"/><path d="M60 44 L46 60"/>') },
  { id: 'ja4', zone: 'jambes', name: 'Mollet au mur', duree: '30 s / jambe',
    consigne: 'Jambe arrière tendue, talon au sol, poussez le mur.',
    svg: fig('<path d="M100 18 V104" stroke="' + A + '" stroke-width="4"/>' + head(42, 32) + '<path d="M46 40 L72 60"/><path d="M72 60 L98 60"/><path d="M72 60 L58 100"/><path d="M72 60 L84 84 L94 100"/>') },
  { id: 'ja5', zone: 'jambes', name: 'Mollet (soléaire)', duree: '20–30 s / jambe',
    consigne: 'Même position, genou arrière légèrement fléchi.',
    svg: fig('<path d="M100 18 V104" stroke="' + A + '" stroke-width="4"/>' + head(42, 32) + '<path d="M46 40 L72 60"/><path d="M72 60 L98 60"/><path d="M72 60 L66 80 L60 100"/><path d="M72 60 L84 84 L94 100"/>') },
  { id: 'ja6', zone: 'jambes', name: 'Fente latérale (adducteurs)', duree: '30 s / côté',
    consigne: 'Une jambe pliée, l’autre tendue sur le côté.',
    svg: fig(head(60, 26) + '<path d="M60 34 V64"/><path d="M60 64 L34 84 L34 100"/><path d="M60 64 L96 92"/><path d="M60 46 L44 58"/><path d="M60 46 L76 58"/>') },
  { id: 'ja7', zone: 'jambes', name: 'Ischios allongé', duree: '30 s / jambe',
    consigne: 'Allongé, une jambe tendue vers le plafond.',
    svg: fig(head(22, 84) + '<path d="M30 84 H58"/><path d="M58 84 L72 44"/><path d="M58 84 L92 84"/><path d="M46 80 L66 54"/>') },

  // ---------------- Chevilles & pieds ----------------
  { id: 'ch1', zone: 'chevilles', name: 'Cercles de cheville', duree: '20 s / pied',
    consigne: 'Dessinez des cercles lents avec le pied.',
    svg: fig(head(44, 40) + '<path d="M48 48 V70"/><path d="M48 70 L80 70"/><path d="M48 70 L60 86 L60 98"/><circle cx="88" cy="74" r="9" stroke="' + A + '" stroke-width="3" fill="none"/>') },
  { id: 'ch2', zone: 'chevilles', name: 'Voûte plantaire & orteils', duree: '20 s / pied',
    consigne: 'Tirez doucement les orteils vers vous.',
    svg: fig(head(44, 40) + '<path d="M48 48 V68"/><path d="M48 68 L80 68"/><path d="M80 68 L86 58"/><path d="M60 56 L82 60"/><path d="M48 68 L60 84 L60 98"/>') },

  // ---------------- Corps entier & détente ----------------
  { id: 'gl1', zone: 'global', name: 'Grand étirement debout', duree: '15–20 s',
    consigne: 'Bras vers le ciel, grandissez-vous sur la pointe des pieds.',
    svg: fig(head(60, 22) + '<path d="M60 30 V70"/><path d="M60 38 L48 18"/><path d="M60 38 L72 18"/><path d="M60 70 L52 100"/><path d="M60 70 L68 100"/><path d="M48 102 H54"/><path d="M66 102 H72"/>') },
  { id: 'gl2', zone: 'global', name: 'Flexion avant relâchée', duree: '30 s',
    consigne: 'Penchez-vous en avant, nuque et bras relâchés.',
    svg: fig(head(50, 86) + '<path d="M60 66 Q52 82 50 88"/><path d="M60 66 L54 104"/><path d="M60 66 L66 104"/><path d="M52 84 L50 100"/><path d="M52 84 L56 100"/>') },
  { id: 'gl3', zone: 'global', name: 'Étirement allongé complet', duree: '15–20 s',
    consigne: 'Étirez bras et jambes dans des sens opposés.',
    svg: fig(head(60, 22) + '<path d="M60 30 V84"/><path d="M60 36 L50 16"/><path d="M60 36 L70 16"/><path d="M60 84 L52 104"/><path d="M60 84 L68 104"/><path d="M52 104 L50 110"/><path d="M68 104 L70 110"/>') },
  { id: 'gl4', zone: 'global', name: 'Sirène (côté au sol)', duree: '20–30 s / côté',
    consigne: 'Assis sur une hanche, bras au-dessus, inclinez-vous.',
    svg: fig(head(66, 26) + '<path d="M62 34 Q66 50 70 62"/><path d="M62 38 L44 22"/><path d="M70 62 L44 72 L30 70"/><path d="M70 62 L80 70"/>') },
  { id: 'gl5', zone: 'global', name: 'Fessier debout (figure 4)', duree: '20 s / côté',
    consigne: 'Cheville sur le genou, fléchissez un peu, buste droit.',
    svg: fig(head(60, 24) + '<path d="M60 32 V66"/><path d="M60 66 L58 86 L56 104"/><path d="M60 66 L78 70 L70 80"/><path d="M60 44 L72 58"/><path d="M60 44 L50 58"/>') },
  { id: 'gl6', zone: 'global', name: 'Respiration & épaules', duree: '30 s',
    consigne: 'Inspirez en montant les épaules, expirez en relâchant.',
    svg: fig(head(60, 24) + '<path d="M60 32 V72"/><path d="M44 34 H76"/><path d="M52 38 L46 60"/><path d="M68 38 L74 60"/>' + legs + '<path d="M44 26 V18" stroke="' + A + '" stroke-width="3"/><path d="M76 26 V18" stroke="' + A + '" stroke-width="3"/>') },
];
