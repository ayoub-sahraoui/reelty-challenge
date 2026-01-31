"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { observer } from "mobx-react-lite";
import { PIXELS_PER_SECOND } from "../lib/constants";
import { useEditorStore } from "../lib/video-editor/hooks/use-editor-store";

interface TimelineRulerProps {
  children?: React.ReactNode;
  className?: string;
}

const TimelineRuler = observer(({ children, className }: TimelineRulerProps) => {
  const store = useEditorStore();
  const { currentTimeInSeconds, durationInSeconds } = store;

  // Use constant for now, but keeping it in state allows for future zooming
  const [pixelsPerSecond] = useState(PIXELS_PER_SECOND);

  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const updateTimeFromMouse = useCallback(
    (e: MouseEvent | React.MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const scrollLeft = containerRef.current.parentElement?.scrollLeft || 0;
        const x = e.clientX - rect.left + scrollLeft;
        const newTime = Math.max(0, Math.min(durationInSeconds, x / pixelsPerSecond));
        store.setCurrentTime(newTime);
      }
    },
    [durationInSeconds, pixelsPerSecond, store]
  );

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    updateTimeFromMouse(e);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => updateTimeFromMouse(e);
    const handleMouseUp = () => setIsDragging(false);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, updateTimeFromMouse]);

  // Generate ticks for every second
  // Ensure we have at least 1 tick and cover the full duration
  const safeDuration = Math.max(1, Math.ceil(durationInSeconds));
  const ticks = Array.from({ length: safeDuration + 1 }, (_, i) => i);

  return (
    <div
      className={`w-full overflow-hidden overflow-x-auto rounded-lg border border-zinc-200 p-4 select-none ${className}`}
    >
      <div
        ref={containerRef}
        className="relative flex h-full min-w-full flex-col bg-white"
        style={{ width: `${durationInSeconds * pixelsPerSecond}px` }}
      >
        {/* Ruler Strip */}
        <div
          className="relative h-12 cursor-pointer border-b border-zinc-200 bg-white"
          onMouseDown={handleMouseDown}
        >
          {ticks.map((t) => (
            <div
              key={t}
              className="absolute bottom-0 flex flex-col items-center"
              style={{ left: `${t * pixelsPerSecond}px`, transform: "translateX(-50%)" }}
            >
              {t % 5 === 0 ? (
                <>
                  <span className="mb-1 font-mono text-[10px] text-zinc-500">{formatTime(t)}</span>
                  <div className="h-3 w-px bg-zinc-300" />
                </>
              ) : (
                <div className="h-1.5 w-px bg-zinc-200" />
              )}
            </div>
          ))}

          {/* Sub-ticks */}
          {Array.from({ length: safeDuration * 2 }).map((_, i) => {
            const t = (i + 1) / 2;
            if (t % 1 === 0) return null;
            return (
              <div
                key={`sub-${t}`}
                className="absolute bottom-0 h-1 w-px bg-zinc-100"
                style={{ left: `${t * pixelsPerSecond}px`, transform: "translateX(-50%)" }}
              />
            );
          })}
        </div>

        {/* Layers Container */}
        <div className="relative flex-1 overflow-y-auto bg-zinc-50/30">{children}</div>

        {/* Playhead */}
        <div
          className="pointer-events-none absolute top-0 bottom-0 z-50 w-px bg-red-500"
          style={{ left: `${currentTimeInSeconds * pixelsPerSecond}px` }}
        >
          {/* Playhead Handle */}
          <div
            className="pointer-events-auto absolute -top-px left-1/2 h-4 w-3 -translate-x-1/2 cursor-ew-resize bg-red-500"
            style={{ clipPath: "polygon(0% 0%, 100% 0%, 100% 75%, 50% 100%, 0% 75%)" }}
            onMouseDown={handleMouseDown}
          />
        </div>
      </div>
    </div>
  );
});

export default TimelineRuler;
