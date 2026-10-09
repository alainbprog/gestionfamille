// Embarque la partie Méditation de l'appli bouddhisme (page autonome
// public/meditation.html) : séances guidées + minuteur + cercle de respiration.
export default function Meditation() {
  return (
    <div className="-mx-4 -mt-4">
      <iframe
        src="/meditation.html"
        title="Méditation guidée"
        className="w-full border-0"
        style={{ height: 'calc(100dvh - 5.5rem)', background: '#1a1526' }}
      />
    </div>
  );
}
