import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "./ui/button";
import { Play, SkipBack, SkipForward } from "lucide-react";

export default function Preview() {
  return (
    <Card className="h-full w-full">
      <CardContent className="flex h-full flex-1 flex-col gap-1 p-1">
        {/* video player */}
        <div className="flex-1 rounded-lg border bg-gray-500"></div>
        {/* video player controls */}
        <div className="flex justify-center gap-2">
          <Button size={"icon"} variant={"ghost"}>
            <SkipBack />
          </Button>
          <Button size={"icon"} variant={"ghost"}>
            <Play></Play>
          </Button>
          <Button size={"icon"} variant={"ghost"}>
            <SkipForward />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
