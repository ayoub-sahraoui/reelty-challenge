"use client";

import React, { useRef, useEffect, useCallback, useState } from "react";
import { observer } from "mobx-react-lite";
import { PIXELS_PER_FRAME } from "../lib/constants";
import { useEditorStore } from "../lib/video-editor/hooks/use-editor-store";

interface TimelineRulerProps {
  children?: React.ReactNode;
  className?: string;
}

// Format time as MM:SS from frames
const formatTime = (frame: number, fps: number): string => {
  const totalSeconds = frame / fps;
  const mins = Math.floor(totalSeconds / 60);
  const secs = Math.floor(totalSeconds % 60);
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

const RulerTick = ({
  frame,
  fps,
  pixelsPerFrame,
}: {
  frame: number;
  fps: number;
  pixelsPerFrame: number;
}) => {
  // Major tick every second (fps frames)
  const isMajorTick = frame % fps === 0;
  const left = frame * pixelsPerFrame;

  return (
    <div
      className="absolute bottom-0 flex flex-col items-center"
      style={{ left: `${left}px`, transform: "translateX(-50%)" }}
    >
      {isMajorTick ? (
        <>
          <span className="mb-1 font-mono text-[10px] text-zinc-500">{formatTime(frame, fps)}</span>
          <div className="h-3 w-px bg-zinc-300" />
        </>
      ) : (
        <div className="h-1.5 w-px bg-zinc-200" />
      )}
    </div>
  );
};

// Sub-tick component (half-second marks in frames)
const SubTick = ({ frame, pixelsPerFrame }: { frame: number; pixelsPerFrame: number }) => (
  <div
    className="absolute bottom-0 h-1 w-px bg-zinc-100"
    style={{ left: `${frame * pixelsPerFrame}px`, transform: "translateX(-50%)" }}
  />
);

// Playhead component - now positioned by frame
const Playhead = ({
  currentFrame,
  pixelsPerFrame,
  onMouseDown,
}: {
  currentFrame: number;
  pixelsPerFrame: number;
  onMouseDown: (e: React.MouseEvent) => void;
}) => (
  <div
    className="pointer-events-none absolute top-0 bottom-0 z-50 w-px bg-red-500"
    style={{ left: `${currentFrame * pixelsPerFrame}px` }}
  >
    <div
      className="pointer-events-auto absolute -top-px left-1/2 h-4 w-3 -translate-x-1/2 cursor-ew-resize bg-red-500"
      style={{ clipPath: "polygon(0% 0%, 100% 0%, 100% 75%, 50% 100%, 0% 75%)" }}
      onMouseDown={onMouseDown}
    />
  </div>
);

const TimelineRuler = observer(({ children, className = "" }: TimelineRulerProps) => {
  const store = useEditorStore();
  const { currentFrame, video } = store;

  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const pixelsPerFrame = PIXELS_PER_FRAME;
  const fps = video?.fps || 30;
  const durationInFrames = video?.durationInFrames || 300;

  const getFrameFromMouseEvent = useCallback(
    (e: MouseEvent | React.MouseEvent): number => {
      if (!containerRef.current) return 0;

      const rect = containerRef.current.getBoundingClientRect();
      const scrollLeft = containerRef.current.parentElement?.scrollLeft || 0;
      const x = e.clientX - rect.left + scrollLeft;

      const frame = Math.round(x / pixelsPerFrame);
      return Math.max(0, Math.min(durationInFrames, frame));
    },
    [durationInFrames, pixelsPerFrame]
  );

  // Update playhead position
  const updatePlayhead = useCallback(
    (e: MouseEvent | React.MouseEvent) => {
      const newFrame = getFrameFromMouseEvent(e);
      store.setCurrentFrame(newFrame);
    },
    [getFrameFromMouseEvent, store]
  );

  // Handle mouse down on ruler or playhead
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      setIsDragging(true);
      updatePlayhead(e);
    },
    [updatePlayhead]
  );

  // Handle dragging
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => updatePlayhead(e);
    const handleMouseUp = () => setIsDragging(false);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, updatePlayhead]);

  // Generate tick marks based on frames
  // Major ticks every second (fps frames), minor ticks every 5 frames
  const majorTickFrames: number[] = [];
  const minorTickFrames: number[] = [];
  const subTickFrames: number[] = [];

  for (let frame = 0; frame <= durationInFrames; frame++) {
    if (frame % fps === 0) {
      // Every second
      majorTickFrames.push(frame);
    } else if (frame % (fps / 2) === 0) {
      // Every half second
      subTickFrames.push(frame);
    } else if (frame % 5 === 0) {
      // Every 5 frames
      minorTickFrames.push(frame);
    }
  }

  const timelineWidth = durationInFrames * pixelsPerFrame;

  return (
    <div
      className={`w-full overflow-hidden overflow-x-auto rounded-lg border border-zinc-200 p-4 select-none ${className}`}
    >
      <div
        ref={containerRef}
        className="relative flex h-full min-w-full flex-col bg-white"
        style={{ width: `${timelineWidth}px` }}
      >
        {/* Ruler Strip */}
        <div
          className="relative h-12 cursor-pointer border-b border-zinc-200 bg-white"
          onMouseDown={handleMouseDown}
        >
          {/* Major ticks (every second) */}
          {majorTickFrames.map((frame) => (
            <RulerTick key={frame} frame={frame} fps={fps} pixelsPerFrame={pixelsPerFrame} />
          ))}

          {/* Minor ticks (every 5 frames) */}
          {minorTickFrames.map((frame) => (
            <RulerTick
              key={`minor-${frame}`}
              frame={frame}
              fps={fps}
              pixelsPerFrame={pixelsPerFrame}
            />
          ))}

          {/* Sub-ticks (half seconds) */}
          {subTickFrames.map((frame) => (
            <SubTick key={`sub-${frame}`} frame={frame} pixelsPerFrame={pixelsPerFrame} />
          ))}
        </div>

        {/* Layers Container */}
        <div className="relative flex-1 overflow-y-auto bg-zinc-50/30">{children}</div>

        {/* Playhead */}
        <Playhead
          currentFrame={currentFrame}
          pixelsPerFrame={pixelsPerFrame}
          onMouseDown={handleMouseDown}
        />
      </div>
    </div>
  );
});

TimelineRuler.displayName = "TimelineRuler";

export default TimelineRuler;
