// Intègre le compteur de calories (appli autonome) via une page embarquée.
// Le fichier public/calories.html + la fonction Netlify /.netlify/functions/analyser
// sont servis sur le même domaine : la photo, l'IA Gemini et le localStorage marchent tels quels.
export default function Calories() {
  return (
    <div className="-mx-4 -mt-4">
      <iframe
        src="/calories.html"
        title="Compteur de calories"
        allow="camera; microphone"
        className="w-full border-0 bg-cream"
        style={{ height: 'calc(100dvh - 5.5rem)' }}
      />
    </div>
  );
}
