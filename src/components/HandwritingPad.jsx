import { useEffect, useRef, useState } from 'react';
import { Eraser, Check, X } from 'lucide-react';

// Zone d'écriture tactile : on écrit au doigt (ou souris/stylet), puis on
// enregistre la note manuscrite sous forme d'image PNG.
export default function HandwritingPad({ onSave, onCancel }) {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const drawing = useRef(false);
  const last = useRef({ x: 0, y: 0 });
  const [empty, setEmpty] = useState(true);

  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ratio = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.round(rect.width * ratio);
    canvas.height = Math.round(rect.height * ratio);
    const ctx = canvas.getContext('2d');
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#3b3550';
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, rect.width, rect.height);
    ctxRef.current = ctx;
    setEmpty(true);
  };

  useEffect(() => {
    initCanvas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const down = (e) => {
    drawing.current = true;
    last.current = pos(e);
    try { canvasRef.current.setPointerCapture(e.pointerId); } catch { /* ignore */ }
  };
  const move = (e) => {
    if (!drawing.current) return;
    e.preventDefault();
    const p = pos(e);
    const ctx = ctxRef.current;
    ctx.beginPath();
    ctx.moveTo(last.current.x, last.current.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last.current = p;
    if (empty) setEmpty(false);
  };
  const up = () => { drawing.current = false; };

  const clear = () => initCanvas();

  const save = () => {
    if (empty) return;
    const dataURL = canvasRef.current.toDataURL('image/png');
    onSave(dataURL);
  };

  return (
    <div className="card p-3 mb-5">
      <p className="text-sm font-semibold text-ink/60 mb-2">✍️ Écris ta pensée au doigt</p>
      <canvas
        ref={canvasRef}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerLeave={up}
        className="w-full rounded-2xl border border-black/10 bg-white"
        style={{ height: 240, touchAction: 'none', cursor: 'crosshair' }}
      />
      <div className="flex gap-2 mt-3">
        <button onClick={clear} className="btn-ghost text-sm py-2"><Eraser size={16} /> Effacer</button>
        <button onClick={onCancel} className="btn-ghost text-sm py-2"><X size={16} /> Annuler</button>
        <button onClick={save} disabled={empty} className="btn-primary text-sm py-2 ml-auto disabled:opacity-40"><Check size={16} /> Enregistrer</button>
      </div>
    </div>
  );
}
