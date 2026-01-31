import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Hand, MousePointer2, Redo, Undo } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "./ui/button";

export default function ToolBar() {
  return (
    <Card className="h-full">
      <CardContent className="flex h-full flex-1 justify-between gap-4 p-2">
        <div></div>
        <div className="flex gap-2">
          <Button size={"icon"} variant={"default"}>
            <MousePointer2 />
          </Button>
          <Button size={"icon"} variant={"outline"}>
            <Hand />
          </Button>
          <Separator orientation="vertical" />
          <Button size={"icon"} variant={"outline"}>
            <Undo />
          </Button>
          <Button size={"icon"} variant={"outline"}>
            <Redo />
          </Button>
        </div>
        <div>
          <Button>
            <div className="flex items-center gap-2">
              <Download />
              <span>Export</span>
            </div>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
