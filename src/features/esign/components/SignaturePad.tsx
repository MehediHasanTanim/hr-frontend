"use client";

import { useRef, useCallback, useEffect } from "react";

interface SignaturePadProps {
  onChange: (dataUri: string | null) => void;
}

export function SignaturePad({ onChange }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const hasContent = useRef(false);

  const getCanvas = () => canvasRef.current;

  const drawPlaceholder = useCallback(() => {
    const canvas = getCanvas();
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.font = "16px sans-serif";
    ctx.fillStyle = "#9ca3af";
    ctx.textAlign = "center";
    ctx.fillText("Sign here", canvas.width / 2, canvas.height / 2);
  }, []);

  const clearCanvas = useCallback(() => {
    const canvas = getCanvas();
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawPlaceholder();
    hasContent.current = false;
    onChange(null);
  }, [onChange, drawPlaceholder]);

  const emitSignature = useCallback(() => {
    const canvas = getCanvas();
    if (!canvas || !hasContent.current) return;
    const dataUri = canvas.toDataURL("image/png");
    onChange(dataUri);
  }, [onChange]);

  useEffect(() => {
    const canvas = getCanvas();
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set white background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw placeholder
    drawPlaceholder();

    const resizeObserver = new ResizeObserver(() => {
      // Keep the canvas responsive
    });
    resizeObserver.observe(canvas);
    return () => resizeObserver.disconnect();
  }, [drawPlaceholder]);

  const startDrawing = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      isDrawing.current = true;
      const canvas = getCanvas();
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Clear placeholder on first draw
      if (!hasContent.current) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        hasContent.current = true;
      }

      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();

      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      if ("touches" in e) {
        const touch = (e as React.TouchEvent).touches[0];
        if (touch) {
          ctx.moveTo(
            (touch.clientX - rect.left) * scaleX,
            (touch.clientY - rect.top) * scaleY,
          );
        }
      } else {
        ctx.moveTo(
          (e as React.MouseEvent).nativeEvent.offsetX * scaleX,
          (e as React.MouseEvent).nativeEvent.offsetY * scaleY,
        );
      }
    },
    [],
  );

  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing.current) return;
    const canvas = getCanvas();
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ("touches" in e) {
      const touch = (e as React.TouchEvent).touches[0];
      if (touch) {
        ctx.lineTo(
          (touch.clientX - rect.left) * scaleX,
          (touch.clientY - rect.top) * scaleY,
        );
        ctx.stroke();
      }
    } else {
      ctx.lineTo(
        (e as React.MouseEvent).nativeEvent.offsetX * scaleX,
        (e as React.MouseEvent).nativeEvent.offsetY * scaleY,
      );
      ctx.stroke();
    }
  }, []);

  const stopDrawing = useCallback(() => {
    isDrawing.current = false;
    emitSignature();
  }, [emitSignature]);

  return (
    <div className="space-y-2">
      <canvas
        ref={canvasRef}
        width={400}
        height={160}
        className="w-full border border-gray-300 rounded-lg bg-white cursor-crosshair"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      />
      <button
        type="button"
        onClick={clearCanvas}
        className="text-xs text-muted-foreground hover:text-foreground underline"
      >
        Clear
      </button>
    </div>
  );
}
