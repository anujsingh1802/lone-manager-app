import { useEffect, useRef, useState } from 'react';

export function SignaturePad({ value, onChange, onSave }) {
  const canvasRef = useRef(null);
  const drawingRef = useRef(false);
  const [hasSigned, setHasSigned] = useState(Boolean(value));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = '#0f766e';
    context.lineWidth = 2;
    context.lineCap = 'round';

    if (value) {
      const image = new Image();
      image.onload = () => context.drawImage(image, 0, 0, canvas.width, canvas.height);
      image.src = value;
    }
  }, [value]);

  function getPoint(event) {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const source = event.touches?.[0] || event;
    return {
      x: ((source.clientX - rect.left) / rect.width) * canvas.width,
      y: ((source.clientY - rect.top) / rect.height) * canvas.height
    };
  }

  function startDrawing(event) {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const point = getPoint(event);
    drawingRef.current = true;
    context.beginPath();
    context.moveTo(point.x, point.y);
  }

  function draw(event) {
    if (!drawingRef.current) return;
    event.preventDefault();
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const point = getPoint(event);
    context.lineTo(point.x, point.y);
    context.stroke();
    setHasSigned(true);
    onChange(canvas.toDataURL('image/png'));
  }

  function stopDrawing() {
    drawingRef.current = false;
  }

  function clearSignature() {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    setHasSigned(false);
    onChange('');
  }

  function saveSignature() {
    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL('image/png');
    onChange(dataUrl);
    onSave?.(dataUrl);
  }

  return (
    <div className="grid gap-3">
      <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white">
        <canvas
          ref={canvasRef}
          width={800}
          height={240}
          className="h-48 w-full touch-none"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
        <span className="text-slate-500">{hasSigned ? 'Signature captured' : 'Customer signature required'}</span>
        <div className="flex w-full gap-2 sm:w-auto">
          <button type="button" onClick={clearSignature} className="min-h-11 flex-1 rounded-2xl bg-slate-100 px-4 py-2 font-medium text-slate-700 sm:flex-none">
            Clear
          </button>
          <button type="button" onClick={saveSignature} className="min-h-11 flex-1 rounded-2xl bg-slate-900 px-4 py-2 font-medium text-white sm:flex-none">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
