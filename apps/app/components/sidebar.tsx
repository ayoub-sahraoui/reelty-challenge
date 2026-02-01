import { Card, CardContent } from "@/components/ui/card";
import {
  AudioLines,
  Captions,
  CaseSensitive,
  CirclePlus,
  Clapperboard,
  Image,
  Squircle,
  Text,
  Video,
} from "lucide-react";
import React from "react";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";

export default function Sidebar() {
  const navigate = useNavigate();

  const items = [
    {
      icon: <Clapperboard />,
      label: "Library",
      onClick: () => {
        navigate("/media-library");
      },
    },
    {
      icon: <Video />,
      label: "Video",
      onClick: () => {
        navigate("/my-videos");
      },
    },
    {
      icon: <AudioLines />,
      label: "Audio",
      onClick: () => {
        navigate("/my-audios");
      },
    },
    {
      icon: <Image />,
      label: "Image",
      onClick: () => {
        navigate("/my-images");
      },
    },
    {
      icon: <CaseSensitive />,
      label: "Text",
      onClick: () => {
        navigate("/text-library");
      },
    },
    {
      icon: <Captions />,
      label: "Subtitles",
      onClick: () => {
        navigate("/subtitle-library");
      },
    },
  ];
  return (
    <Card className="h-full">
      <CardContent className="flex h-full flex-1 flex-col gap-2 p-2">
        <div className="flex flex-col items-center justify-center">
          <Squircle className="h-9 w-9" />
          <span className="text-md font-bold">Squircle</span>
          <span className="text-xs font-light">Studio</span>
        </div>
        <Separator />
        <div className="flex cursor-pointer flex-col items-center gap-1 rounded-lg p-2 hover:ring-2">
          <CirclePlus />
          <span className="text-xs">New Video</span>
        </div>
        <Separator />
        <div className="flex flex-col gap-2">
          {items.map((item) => (
            <div
              key={item.label}
              className="flex cursor-pointer flex-col items-center gap-1 rounded-lg p-2 hover:ring-2"
              onClick={item.onClick}
            >
              {item.icon}
              <span className="text-xs">{item.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
