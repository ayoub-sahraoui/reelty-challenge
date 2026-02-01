import React, { useRef, useState } from "react";
import { Music, Video, Image, Type } from "lucide-react";
import clsx from "clsx";
import { PIXELS_PER_FRAME } from "../lib/constants";
import { ClipType } from "@/lib/video-editor/types";
import { BaseClip } from "@/lib/video-editor/models/clip/base-clip";
import { useEditorStore } from "@/lib/video-editor/hooks/use-editor-store";
import { observer } from "mobx-react";
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

export const layerClipTypes = [
  {
    icon: <Music />,
    name: "Audio Clip",
    type: ClipType.Audio,
    color: "blue",
  },
  {
    icon: <Video />,
    name: "Video Clip",
    type: ClipType.Video,
    color: "violet",
  },
  {
    icon: <Image />,
    name: "Image Clip",
    type: ClipType.Image,
    color: "green",
  },
  {
    icon: <Type />,
    name: "Text Clip",
    type: ClipType.Text,
    color: "yellow",
  },
];

interface LayerClipProps {
  clip: BaseClip;
}

type DragMode = "move" | "trim-left" | "trim-right" | null;

const LayerClip = observer(({ clip }: LayerClipProps) => {
  const clipType = layerClipTypes.find((t) => t.type === clip.getType());
  const [isDragging, setIsDragging] = useState(false);
  const dragModeRef = useRef<DragMode>(null);
  const startXRef = useRef(0);
  const startFrameRef = useRef(0);
  const startEndFrameRef = useRef(0);

  const editorStore = useEditorStore();
  const video = editorStore.video;

  if (!clipType) return null;

  const handleTrimLeft = (e: React.MouseEvent) => {
    e.stopPropagation();
    startDrag(e, "trim-left");
  };

  const handleTrimRight = (e: React.MouseEvent) => {
    e.stopPropagation();
    startDrag(e, "trim-right");
  };

  const handleDrag = (e: React.MouseEvent) => {
    e.stopPropagation();
    startDrag(e, "move");
  };

  const startDrag = (e: React.MouseEvent, mode: DragMode) => {
    setIsDragging(true);
    dragModeRef.current = mode;
    startXRef.current = e.clientX;
    startFrameRef.current = clip.start;
    startEndFrameRef.current = clip.end;

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  const onMouseMove = (e: MouseEvent) => {
    if (!dragModeRef.current) return;

    const deltaX = e.clientX - startXRef.current;
    const deltaFrames = Math.round(deltaX / PIXELS_PER_FRAME);

    switch (dragModeRef.current) {
      case "move":
        if (clip.moveTo) {
          const newStart = Math.max(0, startFrameRef.current + deltaFrames);
          clip.moveTo(newStart);
        }
        break;

      case "trim-left":
        if (clip.trimStart) {
          const newStart = Math.max(0, startFrameRef.current + deltaFrames);
          if (newStart < startEndFrameRef.current) {
            clip.trimStart(newStart);
          }
        }
        break;

      case "trim-right":
        if (clip.trimEnd) {
          const newEnd = Math.max(
            startFrameRef.current + 1,
            startEndFrameRef.current + deltaFrames
          );
          if (newEnd > startFrameRef.current) {
            clip.trimEnd(newEnd);
          }
        }
        break;
    }
  };

  const onMouseUp = () => {
    setIsDragging(false);
    dragModeRef.current = null;

    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
  };

  const handleDuplicate = () => {
    console.log("Duplicate clip:", clip);
  };

  const handleDelete = () => {
    console.log("Delete clip:", clip);
  };

  const handleSplit = () => {
    console.log("Split clip:", clip);
  };

  const handleCopy = () => {
    console.log("Copy clip:", clip);
  };

  const handlePaste = () => {
    console.log("Paste clip");
  };

  const handleProperties = () => {
    console.log("Show properties for clip:", clip);
  };

  const handleClipClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    editorStore.setCurrentClip(clip);
  };

  const isSelected = editorStore.currentClip?.id === clip.id;

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          onMouseDown={handleDrag}
          onClick={handleClipClick}
          style={{
            width: `${clip.durationInFrames * PIXELS_PER_FRAME}px`,
            left: `${clip.start * PIXELS_PER_FRAME}px`,
          }}
          className={clsx(
            "absolute bottom-2 flex rounded-lg border border-zinc-200 bg-white shadow-sm hover:z-50 hover:ring hover:ring-black/40",
            {
              "cursor-grab": !isDragging,
              "cursor-grabbing": isDragging,
              "z-50": isDragging || isSelected,
              "ring-2 ring-blue-500": isSelected,
            }
          )}
        >
          {/* Left trim handle */}
          <div
            onMouseDown={handleTrimLeft}
            className="absolute top-2 bottom-2 -left-1 h-auto w-2 cursor-ew-resize rounded-full bg-black/50 opacity-0 transition-opacity hover:opacity-100"
          ></div>

          {/* Clip content */}
          <div
            className={clsx("flex flex-1 items-center gap-2 overflow-hidden rounded-lg p-2 text-white", {
              "bg-blue-400": clipType.color === "blue",
              "bg-violet-400": clipType.color === "violet",
              "bg-green-400": clipType.color === "green",
              "bg-yellow-400": clipType.color === "yellow",
            })}
          >
            <span className="shrink-0">{clipType.icon}</span>
            <span className="min-w-0 truncate text-sm font-medium">{clip.name}</span>
          </div>

          {/* Right trim handle */}
          <div
            onMouseDown={handleTrimRight}
            className="absolute top-2 -right-1 bottom-2 h-auto w-2 cursor-ew-resize rounded-full bg-black/50 opacity-0 transition-opacity hover:opacity-100"
          ></div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuGroup>
          <ContextMenuItem onClick={handleDuplicate}>
            Duplicate
            <ContextMenuShortcut>⌘D</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem onClick={handleCopy}>
            Copy
            <ContextMenuShortcut>⌘C</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem onClick={handlePaste}>
            Paste
            <ContextMenuShortcut>⌘V</ContextMenuShortcut>
          </ContextMenuItem>
        </ContextMenuGroup>
        <ContextMenuSeparator />
        <ContextMenuGroup>
          <ContextMenuItem onClick={handleSplit}>
            Split at Playhead
            <ContextMenuShortcut>⌘S</ContextMenuShortcut>
          </ContextMenuItem>
        </ContextMenuGroup>
        <ContextMenuSeparator />
        <ContextMenuGroup>
          <ContextMenuCheckboxItem>Lock Clip</ContextMenuCheckboxItem>
        </ContextMenuGroup>
        <ContextMenuSeparator />
        <ContextMenuGroup>
          <ContextMenuItem onClick={handleProperties}>Properties</ContextMenuItem>
        </ContextMenuGroup>
        <ContextMenuSeparator />
        <ContextMenuGroup>
          <ContextMenuItem onClick={handleDelete} className="text-red-600">
            Delete
            <ContextMenuShortcut>⌫</ContextMenuShortcut>
          </ContextMenuItem>
        </ContextMenuGroup>
      </ContextMenuContent>
    </ContextMenu>
  );
});

export default LayerClip;
