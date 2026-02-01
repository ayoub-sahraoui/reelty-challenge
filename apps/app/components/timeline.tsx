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
import { VideoClip } from "@/lib/video-editor/models/clip/video-clip";
import { TextClip } from "@/lib/video-editor/models/clip/text-clip";
import { AudioClip } from "@/lib/video-editor/models/clip/audio-clip";
import { Source } from "@/lib/video-editor/models/source";
import { ClipType } from "@/lib/video-editor/types";
import { Layer } from "@/lib/video-editor/models/layer";
import { DropItem } from "./ui/droppable";

export default function Timeline() {
  const editorStore = useEditorStore();
  const [zoomLevel, setZoomLevel] = React.useState(1);

  const handleCreateLayer = () => {
    editorStore.video?.addLayer();
  };

  const handleSplitClip = () => {
    if (!editorStore.currentClip || !editorStore.currentLayer) {
      console.warn("No clip selected to split");
      return;
    }

    const clip = editorStore.currentClip;
    const layer = editorStore.currentLayer;
    const currentFrame = editorStore.currentFrame;

    if (currentFrame <= clip.start || currentFrame >= clip.end) {
      console.warn("Current frame must be within clip bounds to split");
      return;
    }

    console.log("Split clip at frame:", currentFrame);
  };

  const handleCopyClip = () => {
    if (!editorStore.currentClip || !editorStore.currentLayer) {
      console.warn("No clip selected to copy");
      return;
    }

    const clip = editorStore.currentClip;
    const layer = editorStore.currentLayer;

    const clonedClip = Object.create(Object.getPrototypeOf(clip));
    Object.assign(clonedClip, clip);
    clonedClip.id = `${clip.id}-copy-${Date.now()}`;
    clonedClip.start = clip.end + 10; // Place 10 frames after original
    clonedClip.end = clonedClip.start + (clip.end - clip.start);

    layer.addClip(clonedClip);
    console.log("Clip copied:", clonedClip);
  };

  const handleMoveLayerUp = () => {
    if (!editorStore.currentLayer || !editorStore.video) {
      console.warn("No layer selected to move");
      return;
    }

    const layer = editorStore.currentLayer;
    const currentIndex = layer.index;

    if (currentIndex >= editorStore.video.layers.length - 1) {
      console.warn("Layer is already at the top");
      return;
    }

    console.log(`Moving layer from ${currentIndex} to, ${currentIndex + 1}`);
    editorStore.video.reorderLayer(currentIndex, currentIndex + 1);
    console.log("Layer moved up");
  };

  const handleMoveLayerDown = () => {
    if (!editorStore.currentLayer || !editorStore.video) {
      console.warn("No layer selected to move");
      return;
    }

    const layer = editorStore.currentLayer;
    const currentIndex = layer.index;

    if (currentIndex <= 0) {
      console.warn("Layer is already at the bottom");
      return;
    }


    console.log(`Moving layer from ${currentIndex} to, ${currentIndex - 1}`);
    editorStore.video.reorderLayer(currentIndex, currentIndex - 1);
    console.log("Layer moved down");
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.25, 3)); // Max 3x zoom
    console.log("Zoom in:", zoomLevel + 0.25);
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.25, 0.25)); // Min 0.25x zoom
    console.log("Zoom out:", zoomLevel - 0.25);
  };

  const handleDrop = (layer: Layer, item: DropItem) => {
    console.log("🎯 Drop received:", item.type, item.data);

    switch (item.type) {
      case ClipType.Image: {
        let imageUrl = "";
        let imageName = "";

        if (item.data.src?.original) {
          imageUrl = item.data.src.original;
          imageName =
            item.data.alt || `Photo by ${item.data.photographer}` || `Pexels Image ${Date.now()}`;
        } else if (item.data.source) {
          imageUrl = item.data.source;
          imageName = item.data.name || `Image ${Date.now()}`;
        } else {
          console.error("Invalid image data:", item.data);
          return;
        }

        const imageClip = new ImageClip(
          imageName,
          0,
          60, // Default 2 seconds at 30fps
          new Source(`source-${Date.now()}`, imageUrl)
        );
        layer.addClip(imageClip);
        console.log("✅ Image clip added:", imageClip);
        break;
      }

      case ClipType.Video: {
        // Handle both Pexels videos and My Videos (Media objects)
        let videoUrl = "";
        let videoName = "";
        let videoDuration = 90; // Default 3 seconds

        if (item.data.video_files?.[0]?.link) {
          // Pexels video
          videoUrl = item.data.video_files[0].link;
          // Use user name for video title
          videoName = item.data.user?.name
            ? `Video by ${item.data.user.name}`
            : `Pexels Video ${Date.now()}`;
          videoDuration = (item.data.duration || 3) * 30; // Convert to frames
        } else if (item.data.source) {
          // My Videos (Media object)
          videoUrl = item.data.source;
          videoName = item.data.name || `Video ${Date.now()}`;
          videoDuration = 90; // Default 3 seconds
        } else {
          console.error("Invalid video data:", item.data);
          return;
        }

        const videoClip = new VideoClip(
          videoName,
          0,
          videoDuration,
          new Source(`source-${Date.now()}`, videoUrl)
        );
        layer.addClip(videoClip);
        console.log("✅ Video clip added:", videoClip);
        break;
      }

      case ClipType.Text: {
        // item.data is a Media object from textLibrary
        // Parse the source to get the text content
        const textData = JSON.parse(item.data.source);
        const textClip = new TextClip(
          item.data.name || "Text Clip",
          0,
          90, // Default 3 seconds at 30fps
          new Source(item.data.id, item.data.source),
          textData.text,
          textData.animationKey, // Pass animationKey if present
          textData.content // Pass content (animation data) if present
        );
        layer.addClip(textClip);
        console.log("✅ Text clip added:", textClip);
        break;
      }

      case ClipType.Audio: {
        // item.data is a Media object from audioLibrary
        const audioClip = new AudioClip(
          item.data.name || "Audio Clip",
          0,
          90, // Default 3 seconds at 30fps
          new Source(item.data.id, item.data.source)
        );
        layer.addClip(audioClip);
        console.log("✅ Audio clip added:", audioClip);
        break;
      }

      default:
        console.warn("Unsupported clip type:", item.type);
    }
  };

  const Layers = observer(() => {
    return editorStore.video?.layers.map((layer) => (
      <Droppable
        key={layer.id}
        onDrop={(item) => {
          handleDrop(layer, item);
        }}
      >
        <TimelineLayer key={layer.id} layer={layer} />
      </Droppable>
    ));
  });

  const TimeDisplay = observer(() => {
    return (
      <div className="flex items-center justify-center gap-2 font-mono text-sm">
        <span className="text-zinc-600">Frame:</span>{" "}
        <span className="font-semibold">{editorStore.currentFrame}</span> /{" "}
        <span>{editorStore.durationInFrames}</span>
        <span className="text-zinc-600">Time:</span>{" "}
        <span className="font-semibold">
          {Math.floor(editorStore.currentTimeInSeconds / 60)
            .toString()
            .padStart(2, "0")}
          :
          {Math.floor(editorStore.currentTimeInSeconds % 60)
            .toString()
            .padStart(2, "0")}
        </span>{" "}
        /{" "}
        <span>
          {Math.floor(editorStore.durationInSeconds / 60)
            .toString()
            .padStart(2, "0")}
          :
          {Math.floor(editorStore.durationInSeconds % 60)
            .toString()
            .padStart(2, "0")}
        </span>
      </div>
    );
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
            <TimeDisplay />
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
