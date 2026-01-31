import { Card, CardContent } from "@/components/ui/card";
import {
  AudioLines,
  Captions,
  CirclePlus,
  Clapperboard,
  Image,
  Squircle,
  Text,
  Video,
} from "lucide-react";
import React from "react";
import { Button } from "./ui/button";
import { Separator } from "@/components/ui/separator";

const items = [
  {
    icon: <Clapperboard />,
    label: "Upload",
  },
  {
    icon: <Video />,
    label: "Video",
  },
  {
    icon: <AudioLines />,
    label: "Audio",
  },
  {
    icon: <Image />,
    label: "Image",
  },
  {
    icon: <Text />,
    label: "Text",
  },
  {
    icon: <Captions />,
    label: "Subtitles",
  },
];

export default function Sidebar() {
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
