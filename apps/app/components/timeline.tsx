import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "./ui/button";
import {
  ArrowDownToLine,
  ArrowUpToLine,
  CirclePlus,
  Copy,
  SquareSplitHorizontal,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import TimelineRuler from "./timeline-ruler";
import TimelineLayer from "./timeline-layer";
import { useEditorStore } from "@/lib/video-editor/hooks/use-editor-store";
import { observer } from "mobx-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import Droppable from "./ui/droppable";
import { ImageClip } from "@/lib/video-editor/models/clip/image-clip";
import { Source } from "@/lib/video-editor/models/source";

export default function Timeline() {
  const editorStore = useEditorStore();
  const handleCreateLayer = () => {
    editorStore.video?.addLayer();
  };
  const handleSplitClip = () => {};
  const handleCopyClip = () => {};
  const handleMoveLayerUp = () => {};
  const handleMoveLayerDown = () => {};
  const handleZoomIn = () => {};
  const handleZoomOut = () => {};

  const Layers = observer(() => {
    return editorStore.video?.layers.map((layer) => (
      <Droppable
        key={layer.id}
        onDrop={(id: string) => {
          const imageClip = new ImageClip("image-clip", 0, 10, new Source("source-1", "image.jpg"));
          layer.addClip(imageClip);
        }}
      >
        <TimelineLayer key={layer.id} layer={layer} />
      </Droppable>
    ));
  });
  return (
    <TooltipProvider>
      <Card className="h-full">
        <CardContent className="flex h-full flex-1 flex-col gap-1 p-4">
          {/*timeline toolbar */}
          <div className="flex justify-between">
            <div className="flex gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size={"icon"} variant={"ghost"} onClick={handleCreateLayer}>
                    <CirclePlus />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Add Layer</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size={"icon"} variant={"ghost"} onClick={handleSplitClip}>
                    <SquareSplitHorizontal />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Split Clip</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size={"icon"} variant={"ghost"} onClick={handleCopyClip}>
                    <Copy />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Copy Clip</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size={"icon"} variant={"ghost"} onClick={handleMoveLayerUp}>
                    <ArrowUpToLine />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Move Layer Up</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size={"icon"} variant={"ghost"} onClick={handleMoveLayerDown}>
                    <ArrowDownToLine />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Move Layer Down</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="text-sm">
              <span>00:07:32</span> / <span>44:32:00</span>
            </div>
            <div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size={"icon"} variant={"ghost"} onClick={handleZoomIn}>
                    <ZoomIn />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Zoom In</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size={"icon"} variant={"ghost"} onClick={handleZoomOut}>
                    <ZoomOut />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Zoom Out</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
          {/* Timeline with Ruler and Layers */}
          <TimelineRuler className="flex-1">
            <div className="flex flex-col gap-2">
              {/* layer container */}
              <Layers />
            </div>
          </TimelineRuler>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
