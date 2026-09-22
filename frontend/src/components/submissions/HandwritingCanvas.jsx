import { forwardRef, useImperativeHandle, useRef, useState } from "react";

const WIDTH = 1000;
const HEIGHT = 700;

const HandwritingCanvas = forwardRef(function HandwritingCanvas(_props, ref) {
  const canvasRef = useRef(null);
  const drawingRef = useRef(false);
  const [hasInk, setHasInk] = useState(false);

  const point = (event) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * (WIDTH / rect.width),
      y: (event.clientY - rect.top) * (HEIGHT / rect.height)
    };
  };

  const start = (event) => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const { x, y } = point(event);
    drawingRef.current = true;
    canvas.setPointerCapture(event.pointerId);
    context.beginPath();
    context.moveTo(x, y);
  };

  const draw = (event) => {
    if (!drawingRef.current) return;
    const context = canvasRef.current.getContext("2d");
    const { x, y } = point(event);
    context.lineWidth = 4;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.strokeStyle = "#111827";
    context.lineTo(x, y);
    context.stroke();
    setHasInk(true);
  };

  const stop = () => {
    drawingRef.current = false;
  };

  const clear = () => {
    const canvas = canvasRef.current;
    canvas.getContext("2d").clearRect(0, 0, WIDTH, HEIGHT);
    setHasInk(false);
  };

  useImperativeHandle(ref, () => ({
    hasInk: () => hasInk,
    toFile: () => new Promise((resolve, reject) => {
      const source = canvasRef.current;
      const flattened = document.createElement("canvas");
      flattened.width = WIDTH;
      flattened.height = HEIGHT;
      const context = flattened.getContext("2d");
      context.fillStyle = "white";
      context.fillRect(0, 0, WIDTH, HEIGHT);
      context.drawImage(source, 0, 0);
      flattened.toBlob((blob) => {
        if (!blob) return reject(new Error("Could not prepare handwriting image"));
        resolve(new File([blob], "handwritten-answer.png", { type: "image/png" }));
      }, "image/png");
    })
  }), [hasInk]);

  return (
    <div className="space-y-3">
      <canvas
        ref={canvasRef}
        width={WIDTH}
        height={HEIGHT}
        aria-label="Free-form handwriting area"
        onPointerDown={start}
        onPointerMove={draw}
        onPointerUp={stop}
        onPointerCancel={stop}
        className="h-auto w-full touch-none rounded-xl border-2 border-indigo-200 bg-white shadow-inner"
      />
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-gray-600">Write all working and clearly identify your final answer.</p>
        <button
          type="button"
          onClick={clear}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          Clear
        </button>
      </div>
    </div>
  );
});

export default HandwritingCanvas;
