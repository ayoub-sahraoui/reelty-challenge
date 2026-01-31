import React from "react";
import { Music, Video, Image, Type } from "lucide-react";
import clsx from "clsx";
import { PIXELS_PER_SECOND } from "../lib/constants";
import { ClipType } from "@/lib/video-editor/types";

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

export default function LayerClip({ type, duration }: { type: ClipType; duration: number }) {
  const clipType = layerClipTypes.find((t) => t.type === type);

  if (!clipType) return null;
  return (
    <div
      style={{
        width: `${duration * PIXELS_PER_SECOND}px`,
      }}
      className="relative flex cursor-grab rounded-lg border border-zinc-200 bg-white shadow-sm hover:z-50 hover:ring hover:ring-black/40"
    >
      {/* resize handle*/}
      <div className="absolute top-0 left-0 h-full w-0.5 cursor-e-resize rounded-full hover:w-2 hover:bg-black/40"></div>
      <div
        className={clsx("flex flex-1 items-center gap-2 rounded-lg p-2 text-white", {
          "bg-blue-400": clipType.color === "blue",
          "bg-violet-400": clipType.color === "violet",
          "bg-green-400": clipType.color === "green",
          "bg-yellow-400": clipType.color === "yellow",
        })}
      >
        {clipType.icon}
        <span className="text-sm">{clipType.name}</span>
      </div>
      {/* resize handle*/}
      <div className="absolute top-0 right-0 h-full w-0.5 cursor-e-resize rounded-full hover:w-2 hover:bg-black/40"></div>
    </div>
  );
}
